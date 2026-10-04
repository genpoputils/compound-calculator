/**
 * Pure TypeScript Financial Calculation Engine - EMI
 * Zero external or Angular dependencies. Deterministic, client-side only.
 */

export interface EmiInput {
  loanAmount: number;
  annualInterestRate: number; // in percent, e.g. 8.5
  tenureMonths: number;
  processingFeePercent?: number; // optional, e.g. 0.5%
  processingFeeFlat?: number; // optional flat fee, e.g. 5000
}

export interface EmiResult {
  monthlyEmi: number;
  principal: number;
  totalInterest: number;
  totalPayment: number;
  tenureMonths: number;
  effectiveAnnualRate: number;
  interestToPrincipalRatio: number;
  processingFee: number;
  totalCostOfLoan: number; // totalPayment + processingFee
}

/**
 * Calculates standard reducing-balance monthly Equated Monthly Installment (EMI).
 * Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEmi(input: EmiInput): EmiResult {
  const principal = Math.max(0, Number(input.loanAmount) || 0);
  const annualRate = Math.max(0, Number(input.annualInterestRate) || 0);
  const tenureMonths = Math.max(0, Math.round(Number(input.tenureMonths) || 0));

  if (principal <= 0 || tenureMonths <= 0) {
    return {
      monthlyEmi: 0,
      principal: 0,
      totalInterest: 0,
      totalPayment: 0,
      tenureMonths: 0,
      effectiveAnnualRate: 0,
      interestToPrincipalRatio: 0,
      processingFee: 0,
      totalCostOfLoan: 0
    };
  }

  // Monthly interest rate
  const monthlyRate = annualRate / 12 / 100;

  let monthlyEmi = 0;

  if (monthlyRate === 0) {
    // 0% interest loan
    monthlyEmi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    if (!isFinite(factor) || factor <= 1) {
      monthlyEmi = principal / tenureMonths;
    } else {
      monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
    }
  }

  // Safe numerical rounding to 2 decimal places
  monthlyEmi = roundCurrency(monthlyEmi);
  const totalPayment = roundCurrency(monthlyEmi * tenureMonths);
  const totalInterest = Math.max(0, roundCurrency(totalPayment - principal));

  // Effective Annual Rate (EAR)
  const ear = annualRate === 0 ? 0 : roundTo(Math.pow(1 + monthlyRate, 12) - 1, 4) * 100;
  const ratio = principal > 0 ? roundTo((totalInterest / principal) * 100, 2) : 0;

  // Processing fee
  let processingFee = 0;
  if (input.processingFeePercent && input.processingFeePercent > 0) {
    processingFee += (principal * input.processingFeePercent) / 100;
  }
  if (input.processingFeeFlat && input.processingFeeFlat > 0) {
    processingFee += input.processingFeeFlat;
  }
  processingFee = roundCurrency(processingFee);

  return {
    monthlyEmi,
    principal,
    totalInterest,
    totalPayment,
    tenureMonths,
    effectiveAnnualRate: roundTo(ear, 2),
    interestToPrincipalRatio: ratio,
    processingFee,
    totalCostOfLoan: roundCurrency(totalPayment + processingFee)
  };
}

/**
 * Calculates maximum loan amount affordable for a target monthly EMI.
 */
export function calculateMaxLoanFromEmi(
  targetEmi: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (targetEmi <= 0 || tenureMonths <= 0) return 0;
  const annualRate = Math.max(0, annualInterestRate);
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return roundCurrency(targetEmi * tenureMonths);
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  if (!isFinite(factor) || factor <= 1) return 0;

  const principal = (targetEmi * (factor - 1)) / (monthlyRate * factor);
  return roundCurrency(principal);
}

/**
 * Calculates required tenure in months for a given loan amount, interest rate and target EMI.
 */
export function calculateTenureFromEmi(
  loanAmount: number,
  annualInterestRate: number,
  targetEmi: number
): number {
  if (loanAmount <= 0 || targetEmi <= 0) return 0;
  const annualRate = Math.max(0, annualInterestRate);
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return Math.ceil(loanAmount / targetEmi);
  }

  // EMI must be greater than monthly interest, otherwise principal never decreases
  const monthlyInterest = loanAmount * monthlyRate;
  if (targetEmi <= monthlyInterest) {
    return Infinity;
  }

  // n = log(EMI / (EMI - P * r)) / log(1 + r)
  const numerator = Math.log(targetEmi / (targetEmi - monthlyInterest));
  const denominator = Math.log(1 + monthlyRate);
  const rawMonths = numerator / denominator;
  const rounded = Math.round(rawMonths);
  const months = Math.abs(rawMonths - rounded) < 0.02 ? rounded : Math.ceil(rawMonths);
  return isFinite(months) ? Math.max(1, months) : Infinity;
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
