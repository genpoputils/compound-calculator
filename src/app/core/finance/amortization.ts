/**
 * Pure TypeScript Financial Calculation Engine - Loan Amortization Schedule
 * Zero external or Angular dependencies. Deterministic, client-side only.
 */

export interface AmortizationEntry {
  paymentNumber: number;
  month: number;
  year: number;
  dateStr: string; // e.g. "Apr 2026"
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  prepayment: number;
  closingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  loanProgressPercent: number; // 0 to 100
}

export interface AnnualAmortizationSummary {
  yearNumber: number;
  calendarYear?: number;
  openingBalance: number;
  totalEmi: number;
  totalPrincipal: number;
  totalInterest: number;
  totalPrepayment: number;
  totalPayment: number;
  closingBalance: number;
  endingProgressPercent: number;
}

export interface AmortizationScheduleInput {
  loanAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  startDate?: string | Date; // ISO string or Date, e.g. "2026-04-01"
}

export interface AmortizationScheduleResult {
  monthlySchedule: AmortizationEntry[];
  annualSchedule: AnnualAmortizationSummary[];
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalPayment: number;
  actualTenureMonths: number;
  payoffDateStr: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Generates full monthly and annual amortization schedules for standard reducing-balance loan.
 */
export function generateAmortizationSchedule(input: AmortizationScheduleInput): AmortizationScheduleResult {
  const principal = Math.max(0, Number(input.loanAmount) || 0);
  const annualRate = Math.max(0, Number(input.annualInterestRate) || 0);
  const tenureMonths = Math.max(0, Math.round(Number(input.tenureMonths) || 0));

  if (principal <= 0 || tenureMonths <= 0) {
    return {
      monthlySchedule: [],
      annualSchedule: [],
      totalPrincipalPaid: 0,
      totalInterestPaid: 0,
      totalPayment: 0,
      actualTenureMonths: 0,
      payoffDateStr: ''
    };
  }

  const monthlyRate = annualRate / 12 / 100;

  // Compute base monthly EMI
  let scheduledEmi: number;
  if (monthlyRate === 0) {
    scheduledEmi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    scheduledEmi = (principal * monthlyRate * factor) / (factor - 1);
  }
  scheduledEmi = roundCurrency(scheduledEmi);

  // Initialize start date
  let startYear = new Date().getFullYear();
  let startMonth = new Date().getMonth(); // 0-indexed

  if (input.startDate) {
    const parsed = new Date(input.startDate);
    if (!isNaN(parsed.getTime())) {
      startYear = parsed.getFullYear();
      startMonth = parsed.getMonth();
    }
  }

  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  const monthlySchedule: AmortizationEntry[] = [];

  for (let m = 1; m <= tenureMonths && balance > 0.01; m++) {
    const openingBalance = balance;
    const interestForMonth = monthlyRate === 0 ? 0 : roundCurrency(balance * monthlyRate);

    // Compute date
    const currentMonthIndex = (startMonth + m - 1) % 12;
    const currentYear = startYear + Math.floor((startMonth + m - 1) / 12);
    const dateStr = `${MONTH_NAMES[currentMonthIndex]} ${currentYear}`;

    let emiForThisMonth = scheduledEmi;
    let principalForMonth = roundCurrency(emiForThisMonth - interestForMonth);

    // If final payment or principal portion exceeds balance, adjust
    if (principalForMonth >= balance || m === tenureMonths) {
      principalForMonth = balance;
      emiForThisMonth = roundCurrency(principalForMonth + interestForMonth);
      balance = 0;
    } else {
      balance = roundCurrency(balance - principalForMonth);
    }

    cumulativeInterest = roundCurrency(cumulativeInterest + interestForMonth);
    cumulativePrincipal = roundCurrency(cumulativePrincipal + principalForMonth);

    const progress = principal > 0
      ? Math.min(100, roundTo((cumulativePrincipal / principal) * 100, 1))
      : 100;

    monthlySchedule.push({
      paymentNumber: m,
      month: currentMonthIndex + 1,
      year: currentYear,
      dateStr,
      openingBalance,
      emi: emiForThisMonth,
      principal: principalForMonth,
      interest: interestForMonth,
      prepayment: 0,
      closingBalance: Math.max(0, balance),
      cumulativeInterest,
      cumulativePrincipal,
      loanProgressPercent: progress
    });
  }

  const annualSchedule = buildAnnualSummary(monthlySchedule);
  const lastEntry = monthlySchedule[monthlySchedule.length - 1];

  return {
    monthlySchedule,
    annualSchedule,
    totalPrincipalPaid: cumulativePrincipal,
    totalInterestPaid: cumulativeInterest,
    totalPayment: roundCurrency(cumulativePrincipal + cumulativeInterest),
    actualTenureMonths: monthlySchedule.length,
    payoffDateStr: lastEntry ? lastEntry.dateStr : ''
  };
}

/**
 * Aggregates monthly amortization schedule into annual calendar / loan-year summary.
 */
export function buildAnnualSummary(monthlySchedule: AmortizationEntry[]): AnnualAmortizationSummary[] {
  if (!monthlySchedule.length) return [];

  const summaries: AnnualAmortizationSummary[] = [];
  const totalMonths = monthlySchedule.length;
  const totalYears = Math.ceil(totalMonths / 12);

  for (let y = 1; y <= totalYears; y++) {
    const startIndex = (y - 1) * 12;
    const endIndex = Math.min(totalMonths, y * 12);
    const yearSlice = monthlySchedule.slice(startIndex, endIndex);

    if (!yearSlice.length) continue;

    const first = yearSlice[0];
    const last = yearSlice[yearSlice.length - 1];

    let totalEmi = 0;
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalPrepayment = 0;

    for (const row of yearSlice) {
      totalEmi += row.emi;
      totalPrincipal += row.principal;
      totalInterest += row.interest;
      totalPrepayment += row.prepayment;
    }

    summaries.push({
      yearNumber: y,
      calendarYear: first.year,
      openingBalance: first.openingBalance,
      totalEmi: roundCurrency(totalEmi),
      totalPrincipal: roundCurrency(totalPrincipal),
      totalInterest: roundCurrency(totalInterest),
      totalPrepayment: roundCurrency(totalPrepayment),
      totalPayment: roundCurrency(totalEmi + totalPrepayment),
      closingBalance: last.closingBalance,
      endingProgressPercent: last.loanProgressPercent
    });
  }

  return summaries;
}

function roundCurrency(val: number): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  return Math.round(val * 100) / 100;
}

function roundTo(val: number, decimals: number): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
