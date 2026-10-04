/**
 * Pure TypeScript Financial Calculation Engine - Loan Prepayment Simulator
 * Flagship Feature: Comprehensive Loan + EMI Visualiser and Decision Simulator.
 * Zero external or Angular dependencies. Deterministic, client-side only.
 */

import { AmortizationEntry, AnnualAmortizationSummary, buildAnnualSummary } from './amortization';
import { calculateEmi } from './emi';

export type PrepaymentMode = 'reduce-tenure' | 'reduce-emi';
export type PrepaymentFrequency = 'one-time' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';

export interface PrepaymentEvent {
  month: number; // 1-indexed payment month when prepayment occurs (0 for upfront/before 1st EMI)
  amount: number;
  label?: string;
}

export interface PrepaymentSimulatorInput {
  loanAmount: number;
  annualInterestRate: number; // e.g. 8.5
  tenureMonths: number; // e.g. 240 (20 years)
  startDate?: string | Date;

  // Prepayment parameters
  mode: PrepaymentMode; // 'reduce-tenure' | 'reduce-emi'
  oneTimePrepaymentAmount?: number; // e.g. 500000
  oneTimePrepaymentMonth?: number; // e.g. 36 (after 3 years)

  // Recurring prepayments
  prepaymentFrequency?: PrepaymentFrequency;
  recurringPrepaymentAmount?: number; // e.g. 100000 every year or 50000 every 6 months
  recurringStartMonth?: number; // default 12 or 1

  // Additional prepayments list (optional custom schedule)
  customPrepayments?: PrepaymentEvent[];

  // Annual EMI Step-up / Increase
  annualEmiIncreasePercent?: number; // e.g. 5% increase every year
  annualEmiIncreaseAmount?: number; // e.g. 5000 increase every year

  // Optional processing / prepayment fees
  processingFee?: number;
}

export interface LoanScenarioSummary {
  monthlyEmi: number; // Initial / baseline EMI
  finalMonthlyEmi: number; // Final EMI (may differ if EMI reduced or increased)
  totalPrincipal: number;
  totalInterest: number;
  totalPrepayment: number;
  totalPayment: number;
  tenureMonths: number;
  payoffDateStr: string;
  payoffYear: number;
  payoffMonth: number;
}

export interface StrategyComparison {
  reduceTenureInterestSaved: number;
  reduceTenureMonthsSaved: number;
  reduceTenureTotalPayment: number;

  reduceEmiInterestSaved: number;
  reduceEmiNewMonthlyEmi: number;
  reduceEmiTotalPayment: number;

  diffInterest: number;

  recommendedStrategy: 'reduce-tenure' | 'reduce-emi';
  recommendationReason: string;
}

export interface PrepaymentSimulationResult {
  // Baseline without prepayment
  originalLoan: LoanScenarioSummary;

  // Result with prepayment
  prepaidLoan: LoanScenarioSummary;

  // Savings and Differentiators
  interestSaved: number;
  interestSavedPercent: number;
  monthsSaved: number;
  yearsSavedFormatted: string; // e.g. "3 years 10 months"
  totalAmountSaved: number;

  // Full schedules with prepayment tracking
  monthlySchedule: AmortizationEntry[];
  annualSchedule: AnnualAmortizationSummary[];

  // Comparison between Reduce Tenure vs Reduce EMI strategies
  strategyComparison: StrategyComparison;

  // List of all applied prepayments
  appliedPrepayments: PrepaymentEvent[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Simulates loan prepayment month-by-month and computes exact interest savings,
 * time saved, and strategy insights.
 */
export function simulatePrepayment(input: PrepaymentSimulatorInput): PrepaymentSimulationResult {
  const principal = Math.max(0, Number(input.loanAmount) || 0);
  const annualRate = Math.max(0, Number(input.annualInterestRate) || 0);
  const tenureMonths = Math.max(0, Math.round(Number(input.tenureMonths) || 0));

  if (principal <= 0 || tenureMonths <= 0) {
    return createEmptyResult();
  }

  // 1. Calculate Baseline Original Loan (Zero prepayments)
  const baselineEmiRes = calculateEmi({
    loanAmount: principal,
    annualInterestRate: annualRate,
    tenureMonths
  });

  const originalSchedule = runAmortizationSimulation({
    loanAmount: principal,
    annualInterestRate: annualRate,
    tenureMonths,
    startDate: input.startDate,
    mode: 'reduce-tenure',
    prepaymentMap: new Map(),
    annualEmiIncreasePercent: 0,
    annualEmiIncreaseAmount: 0
  });

  const lastOriginal = originalSchedule[originalSchedule.length - 1] || {
    dateStr: '',
    year: new Date().getFullYear(),
    month: 1
  };

  let origTotalPrincipalPaid = 0;
  let origTotalInterestPaid = 0;
  let origTotalEmiPaid = 0;

  for (const row of originalSchedule) {
    origTotalPrincipalPaid += row.principal;
    origTotalInterestPaid += row.interest;
    origTotalEmiPaid += row.emi;
  }

  origTotalPrincipalPaid = roundCurrency(origTotalPrincipalPaid);
  origTotalInterestPaid = roundCurrency(origTotalInterestPaid);
  const origTotalPaymentPaid = roundCurrency(origTotalEmiPaid);

  const originalLoan: LoanScenarioSummary = {
    monthlyEmi: baselineEmiRes.monthlyEmi,
    finalMonthlyEmi: originalSchedule.length > 0 ? originalSchedule[originalSchedule.length - 1].emi : baselineEmiRes.monthlyEmi,
    totalPrincipal: principal,
    totalInterest: origTotalInterestPaid,
    totalPrepayment: 0,
    totalPayment: origTotalPaymentPaid,
    tenureMonths: originalSchedule.length || tenureMonths,
    payoffDateStr: lastOriginal.dateStr,
    payoffYear: lastOriginal.year,
    payoffMonth: lastOriginal.month
  };

  // 2. Build Prepayment Schedule Map (month -> amount)
  const prepaymentMap = new Map<number, number>();
  const appliedPrepayments: PrepaymentEvent[] = [];

  // One-time prepayment
  if (input.oneTimePrepaymentAmount && input.oneTimePrepaymentAmount > 0) {
    const pMonth = Math.max(0, Math.round(Number(input.oneTimePrepaymentMonth) || 1));
    const curr = prepaymentMap.get(pMonth) || 0;
    prepaymentMap.set(pMonth, curr + input.oneTimePrepaymentAmount);
  }

  // Recurring prepayment
  if (
    input.recurringPrepaymentAmount &&
    input.recurringPrepaymentAmount > 0 &&
    input.prepaymentFrequency &&
    input.prepaymentFrequency !== 'one-time'
  ) {
    const interval = getFrequencyInterval(input.prepaymentFrequency);
    const startM = Math.max(interval, Math.round(Number(input.recurringStartMonth) || interval));

    for (let m = startM; m <= tenureMonths; m += interval) {
      // Don't duplicate if already added via one-time at same month; add them together
      const curr = prepaymentMap.get(m) || 0;
      prepaymentMap.set(m, curr + input.recurringPrepaymentAmount);
    }
  }

  // Custom prepayment schedule
  if (input.customPrepayments && input.customPrepayments.length > 0) {
    for (const cp of input.customPrepayments) {
      if (cp.amount > 0) {
        const curr = prepaymentMap.get(cp.month) || 0;
        prepaymentMap.set(cp.month, curr + cp.amount);
      }
    }
  }

  const hasAnyPrepayment =
    prepaymentMap.size > 0 ||
    (input.annualEmiIncreasePercent || 0) > 0 ||
    (input.annualEmiIncreaseAmount || 0) > 0;

  // Clean Zero Prepayment / Opt-Out Fast Path: Guarantees 100% mathematical equality
  if (!hasAnyPrepayment) {
    return {
      originalLoan,
      prepaidLoan: { ...originalLoan },
      interestSaved: 0,
      interestSavedPercent: 0,
      monthsSaved: 0,
      yearsSavedFormatted: '0 months',
      totalAmountSaved: 0,
      monthlySchedule: originalSchedule,
      annualSchedule: buildAnnualSummary(originalSchedule),
      strategyComparison: {
        reduceTenureInterestSaved: 0,
        reduceTenureMonthsSaved: 0,
        reduceTenureTotalPayment: originalLoan.totalPayment,
        reduceEmiInterestSaved: 0,
        reduceEmiNewMonthlyEmi: originalLoan.monthlyEmi,
        reduceEmiTotalPayment: originalLoan.totalPayment,
        diffInterest: 0,
        recommendedStrategy: 'reduce-tenure',
        recommendationReason: 'No prepayments currently scheduled. Set a prepayment amount above to compare tenure reduction vs EMI reduction.'
      },
      appliedPrepayments: []
    };
  }

  // 3. Run Simulation for Selected Mode
  const prepaidSchedule = runAmortizationSimulation({
    loanAmount: principal,
    annualInterestRate: annualRate,
    tenureMonths,
    startDate: input.startDate,
    mode: input.mode,
    prepaymentMap,
    annualEmiIncreasePercent: input.annualEmiIncreasePercent || 0,
    annualEmiIncreaseAmount: input.annualEmiIncreaseAmount || 0
  });

  let totalPrincipalPaid = 0;
  let totalInterestPaid = 0;
  let totalPrepaymentPaid = 0;
  let totalEmiPaid = 0;

  for (const row of prepaidSchedule) {
    totalPrincipalPaid += row.principal;
    totalInterestPaid += row.interest;
    totalPrepaymentPaid += row.prepayment;
    totalEmiPaid += row.emi;

    if (row.prepayment > 0) {
      appliedPrepayments.push({
        month: row.paymentNumber,
        amount: row.prepayment,
        label: `Prepayment at Month ${row.paymentNumber}`
      });
    }
  }

  totalPrincipalPaid = roundCurrency(totalPrincipalPaid);
  totalInterestPaid = roundCurrency(totalInterestPaid);
  totalPrepaymentPaid = roundCurrency(totalPrepaymentPaid);
  const totalPaymentPaid = roundCurrency(totalEmiPaid + totalPrepaymentPaid);

  const actualTenureMonths = prepaidSchedule.length;
  const lastPrepaid = prepaidSchedule[prepaidSchedule.length - 1] || lastOriginal;
  const firstPrepaid = prepaidSchedule[0] || { emi: baselineEmiRes.monthlyEmi };

  const prepaidLoan: LoanScenarioSummary = {
    monthlyEmi: firstPrepaid.emi,
    finalMonthlyEmi: lastPrepaid.emi,
    totalPrincipal: roundCurrency(totalPrincipalPaid + totalPrepaymentPaid),
    totalInterest: totalInterestPaid,
    totalPrepayment: totalPrepaymentPaid,
    totalPayment: totalPaymentPaid,
    tenureMonths: actualTenureMonths,
    payoffDateStr: lastPrepaid.dateStr,
    payoffYear: lastPrepaid.year,
    payoffMonth: lastPrepaid.month
  };

  // 4. Calculate Key Metrics
  const interestSaved = Math.max(0, roundCurrency(originalLoan.totalInterest - totalInterestPaid));
  const interestSavedPercent = originalLoan.totalInterest > 0
    ? roundTo((interestSaved / originalLoan.totalInterest) * 100, 1)
    : 0;

  const monthsSaved = Math.max(0, originalLoan.tenureMonths - actualTenureMonths);
  const totalAmountSaved = Math.max(0, roundCurrency(originalLoan.totalPayment - totalPaymentPaid));
  const yearsSavedFormatted = formatMonthsToYearsAndMonths(monthsSaved);

  const annualSchedule = buildAnnualSummary(prepaidSchedule);

  // 5. Strategy Comparison (Reduce Tenure vs Reduce EMI)
  const strategyComparison = evaluateStrategies({
    loanAmount: principal,
    annualInterestRate: annualRate,
    tenureMonths,
    startDate: input.startDate,
    prepaymentMap,
    originalTotalInterest: originalLoan.totalInterest,
    annualEmiIncreasePercent: input.annualEmiIncreasePercent || 0,
    annualEmiIncreaseAmount: input.annualEmiIncreaseAmount || 0
  });

  return {
    originalLoan,
    prepaidLoan,
    interestSaved,
    interestSavedPercent,
    monthsSaved,
    yearsSavedFormatted,
    totalAmountSaved,
    monthlySchedule: prepaidSchedule,
    annualSchedule,
    strategyComparison,
    appliedPrepayments
  };
}

interface SimulationRunOptions {
  loanAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  startDate?: string | Date;
  mode: PrepaymentMode;
  prepaymentMap: Map<number, number>;
  annualEmiIncreasePercent: number;
  annualEmiIncreaseAmount: number;
}

/**
 * Core Month-by-Month Amortization Engine supporting Prepayments, EMI adjustments, and Step-Ups.
 */
function runAmortizationSimulation(options: SimulationRunOptions): AmortizationEntry[] {
  const {
    loanAmount,
    annualInterestRate,
    tenureMonths,
    startDate,
    mode,
    prepaymentMap,
    annualEmiIncreasePercent,
    annualEmiIncreaseAmount
  } = options;

  const monthlyRate = annualInterestRate / 12 / 100;

  // Calculate base scheduled EMI
  let scheduledEmi: number;
  if (monthlyRate === 0) {
    scheduledEmi = loanAmount / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    scheduledEmi = (loanAmount * monthlyRate * factor) / (factor - 1);
  }
  scheduledEmi = roundCurrency(scheduledEmi);

  // Date parsing
  let startYear = new Date().getFullYear();
  let startMonth = new Date().getMonth(); // 0-indexed
  if (startDate) {
    const parsed = new Date(startDate);
    if (!isNaN(parsed.getTime())) {
      startYear = parsed.getFullYear();
      startMonth = parsed.getMonth();
    }
  }

  let balance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  const schedule: AmortizationEntry[] = [];

  // Check upfront prepayment (month 0)
  const upfrontPrepayment = prepaymentMap.get(0) || 0;
  if (upfrontPrepayment > 0) {
    const appliedUpfront = Math.min(balance, upfrontPrepayment);
    balance = roundCurrency(balance - appliedUpfront);
    cumulativePrincipal = roundCurrency(cumulativePrincipal + appliedUpfront);

    if (mode === 'reduce-emi' && balance > 0) {
      // Recalculate scheduled EMI with reduced principal
      if (monthlyRate === 0) {
        scheduledEmi = balance / tenureMonths;
      } else {
        const factor = Math.pow(1 + monthlyRate, tenureMonths);
        scheduledEmi = (balance * monthlyRate * factor) / (factor - 1);
      }
      scheduledEmi = roundCurrency(scheduledEmi);
    }
  }

  // Iterate months (guarding against infinite loops with max 600 months / 50 years)
  const maxIterations = Math.max(tenureMonths, 600);

  for (let m = 1; m <= maxIterations && balance > 0.01; m++) {
    const openingBalance = balance;
    const interestForMonth = monthlyRate === 0 ? 0 : roundCurrency(balance * monthlyRate);

    // Apply Annual EMI Increase if configured (at months 13, 25, 37, ...)
    if (m > 1 && (m - 1) % 12 === 0) {
      if (annualEmiIncreasePercent > 0) {
        scheduledEmi = roundCurrency(scheduledEmi * (1 + annualEmiIncreasePercent / 100));
      }
      if (annualEmiIncreaseAmount > 0) {
        scheduledEmi = roundCurrency(scheduledEmi + annualEmiIncreaseAmount);
      }
    }

    let emiForThisMonth = scheduledEmi;
    let principalFromEmi = roundCurrency(emiForThisMonth - interestForMonth);

    // If EMI exceeds remaining balance + interest, or we reached scheduled tenure, clear remaining balance
    if (principalFromEmi >= balance || m >= tenureMonths) {
      principalFromEmi = balance;
      emiForThisMonth = roundCurrency(balance + interestForMonth);
      balance = 0;
    } else {
      balance = roundCurrency(balance - principalFromEmi);
    }

    // Apply Prepayment for this month if scheduled
    let prepaymentForMonth = 0;
    const scheduledPrepayment = prepaymentMap.get(m) || 0;
    if (scheduledPrepayment > 0 && balance > 0) {
      prepaymentForMonth = Math.min(balance, scheduledPrepayment);
      balance = roundCurrency(balance - prepaymentForMonth);
    }

    const totalPrincipalThisMonth = roundCurrency(principalFromEmi + prepaymentForMonth);
    cumulativeInterest = roundCurrency(cumulativeInterest + interestForMonth);
    cumulativePrincipal = roundCurrency(cumulativePrincipal + totalPrincipalThisMonth);

    const currentMonthIndex = (startMonth + m - 1) % 12;
    const currentYear = startYear + Math.floor((startMonth + m - 1) / 12);
    const dateStr = `${MONTH_NAMES[currentMonthIndex]} ${currentYear}`;

    const progress = loanAmount > 0
      ? Math.min(100, roundTo((cumulativePrincipal / loanAmount) * 100, 1))
      : 100;

    schedule.push({
      paymentNumber: m,
      month: currentMonthIndex + 1,
      year: currentYear,
      dateStr,
      openingBalance,
      emi: emiForThisMonth,
      principal: principalFromEmi,
      interest: interestForMonth,
      prepayment: prepaymentForMonth,
      closingBalance: Math.max(0, balance),
      cumulativeInterest,
      cumulativePrincipal,
      loanProgressPercent: progress
    });

    // If Reduce EMI mode and prepayment occurred this month, recalculate EMI for remaining scheduled tenure
    if (mode === 'reduce-emi' && prepaymentForMonth > 0 && balance > 0) {
      const remainingTenure = tenureMonths - m;
      if (remainingTenure > 0) {
        if (monthlyRate === 0) {
          scheduledEmi = balance / remainingTenure;
        } else {
          const factor = Math.pow(1 + monthlyRate, remainingTenure);
          if (isFinite(factor) && factor > 1) {
            scheduledEmi = (balance * monthlyRate * factor) / (factor - 1);
          } else {
            scheduledEmi = balance / remainingTenure;
          }
        }
        scheduledEmi = roundCurrency(scheduledEmi);
      }
    }
  }

  return schedule;
}

/**
 * Compares Reduce Tenure vs Reduce EMI for the same prepayment profile and gives clear recommendation.
 */
function evaluateStrategies(options: {
  loanAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  startDate?: string | Date;
  prepaymentMap: Map<number, number>;
  originalTotalInterest: number;
  annualEmiIncreasePercent: number;
  annualEmiIncreaseAmount: number;
}): StrategyComparison {
  const {
    loanAmount,
    annualInterestRate,
    tenureMonths,
    startDate,
    prepaymentMap,
    originalTotalInterest,
    annualEmiIncreasePercent,
    annualEmiIncreaseAmount
  } = options;

  // Run Reduce Tenure
  const tenureSchedule = runAmortizationSimulation({
    loanAmount,
    annualInterestRate,
    tenureMonths,
    startDate,
    mode: 'reduce-tenure',
    prepaymentMap,
    annualEmiIncreasePercent,
    annualEmiIncreaseAmount
  });

  let tenureInterest = 0;
  let tenureTotalPayment = 0;
  for (const row of tenureSchedule) {
    tenureInterest += row.interest;
    tenureTotalPayment += row.emi + row.prepayment;
  }
  const reduceTenureInterestSaved = Math.max(0, roundCurrency(originalTotalInterest - tenureInterest));
  const reduceTenureMonthsSaved = Math.max(0, tenureMonths - tenureSchedule.length);

  // Run Reduce EMI
  const emiSchedule = runAmortizationSimulation({
    loanAmount,
    annualInterestRate,
    tenureMonths,
    startDate,
    mode: 'reduce-emi',
    prepaymentMap,
    annualEmiIncreasePercent,
    annualEmiIncreaseAmount
  });

  let emiInterest = 0;
  let emiTotalPayment = 0;
  for (const row of emiSchedule) {
    emiInterest += row.interest;
    emiTotalPayment += row.emi + row.prepayment;
  }
  const reduceEmiInterestSaved = Math.max(0, roundCurrency(originalTotalInterest - emiInterest));
  const lastEmiRow = emiSchedule[emiSchedule.length - 1] || { emi: 0 };

  // Recommendation logic
  const diffInterest = Math.max(0, roundCurrency(reduceTenureInterestSaved - reduceEmiInterestSaved));
  const isTenureBetter = diffInterest > 0;

  let reason = '';
  if (reduceTenureInterestSaved === 0 && reduceEmiInterestSaved === 0) {
    reason = 'No prepayments currently scheduled. Set a prepayment amount above to compare tenure reduction vs EMI reduction.';
  } else if (isTenureBetter) {
    reason = `Reducing tenure saves more total interest than reducing EMI, and makes you debt-free ${formatMonthsToYearsAndMonths(reduceTenureMonthsSaved)} earlier.`;
  } else {
    reason = `Reducing EMI lowers your monthly payment burden while still saving interest over the loan tenure.`;
  }

  return {
    reduceTenureInterestSaved,
    reduceTenureMonthsSaved,
    reduceTenureTotalPayment: roundCurrency(tenureTotalPayment),
    reduceEmiInterestSaved,
    reduceEmiNewMonthlyEmi: lastEmiRow.emi,
    reduceEmiTotalPayment: roundCurrency(emiTotalPayment),
    diffInterest,
    recommendedStrategy: isTenureBetter ? 'reduce-tenure' : 'reduce-emi',
    recommendationReason: reason
  };
}

function getFrequencyInterval(freq: PrepaymentFrequency): number {
  switch (freq) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'semi-annually':
      return 6;
    case 'annually':
    default:
      return 12;
  }
}

export function formatMonthsToYearsAndMonths(totalMonths: number): string {
  if (totalMonths <= 0) return '0 months';
  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  }
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
}

function createEmptyResult(): PrepaymentSimulationResult {
  const emptySummary: LoanScenarioSummary = {
    monthlyEmi: 0,
    finalMonthlyEmi: 0,
    totalPrincipal: 0,
    totalInterest: 0,
    totalPrepayment: 0,
    totalPayment: 0,
    tenureMonths: 0,
    payoffDateStr: '',
    payoffYear: 0,
    payoffMonth: 0
  };

  return {
    originalLoan: emptySummary,
    prepaidLoan: emptySummary,
    interestSaved: 0,
    interestSavedPercent: 0,
    monthsSaved: 0,
    yearsSavedFormatted: '0 months',
    totalAmountSaved: 0,
    monthlySchedule: [],
    annualSchedule: [],
    strategyComparison: {
      reduceTenureInterestSaved: 0,
      reduceTenureMonthsSaved: 0,
      reduceTenureTotalPayment: 0,
      reduceEmiInterestSaved: 0,
      reduceEmiNewMonthlyEmi: 0,
      reduceEmiTotalPayment: 0,
      diffInterest: 0,
      recommendedStrategy: 'reduce-tenure',
      recommendationReason: ''
    },
    appliedPrepayments: []
  };
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
