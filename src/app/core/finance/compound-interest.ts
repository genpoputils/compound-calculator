/**
 * Pure TypeScript Financial Calculation Engine - Compound Interest
 * Zero external or Angular dependencies. Deterministic, client-side only.
 */

export type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
export type DurationUnit = 'years' | 'months';

export interface CompoundInterestInput {
  initialInvestment: number;
  annualInterestRate: number; // in percent, e.g. 12
  compoundingFrequency: CompoundingFrequency;
  duration: number;
  durationUnit: DurationUnit;
  inflationRate?: number; // optional in percent, e.g. 6
}

export interface CompoundYearlyBreakdownItem {
  year: number;
  monthlyContribution: number;
  annualContribution: number;
  totalInvested: number;
  interestEarnedYear: number;
  totalGrowth: number;
  portfolioValue: number;
  realPortfolioValue: number;
}

export interface CompoundInterestResult {
  initialInvestment: number;
  totalInvested: number;
  totalGrowth: number;
  futureValue: number;
  realFutureValue: number; // Inflation-adjusted value
  effectiveAnnualRate: number;
  durationYears: number;
  breakdown: CompoundYearlyBreakdownItem[];
}

export function getPeriodsPerYear(frequency: CompoundingFrequency): number {
  switch (frequency) {
    case 'daily':
      return 365;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'semi-annually':
      return 2;
    case 'annually':
    default:
      return 1;
  }
}

/**
 * Calculates compound interest for lump sum investment.
 * Formula: A = P * (1 + r/n)^(n*t)
 */
export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const principal = Math.max(0, Number(input.initialInvestment) || 0);
  const ratePercent = Math.max(0, Number(input.annualInterestRate) || 0);
  const r = ratePercent / 100;
  const durationInput = Math.max(0, Number(input.duration) || 0);
  const durationYears = input.durationUnit === 'months' ? durationInput / 12 : durationInput;
  const n = getPeriodsPerYear(input.compoundingFrequency);
  const inflation = Math.max(0, Number(input.inflationRate) || 0) / 100;

  if (durationYears <= 0 || principal <= 0) {
    const breakdownItem: CompoundYearlyBreakdownItem = {
      year: 1,
      monthlyContribution: 0,
      annualContribution: 0,
      totalInvested: principal,
      interestEarnedYear: 0,
      totalGrowth: 0,
      portfolioValue: principal,
      realPortfolioValue: principal
    };

    return {
      initialInvestment: principal,
      totalInvested: principal,
      totalGrowth: 0,
      futureValue: principal,
      realFutureValue: principal,
      effectiveAnnualRate: 0,
      durationYears: durationYears || 0,
      breakdown: [breakdownItem]
    };
  }

  // Effective Annual Rate: (1 + r/n)^n - 1
  const effectiveAnnualRate = r === 0 ? 0 : (Math.pow(1 + r / n, n) - 1) * 100;

  // Final Future Value: P * (1 + r/n)^(n * t)
  const futureValue = r === 0 ? principal : principal * Math.pow(1 + r / n, n * durationYears);
  const totalGrowth = futureValue - principal;
  const realFutureValue = futureValue / Math.pow(1 + inflation, durationYears);

  // Build yearly breakdown
  const fullYears = Math.floor(durationYears);
  const hasPartialYear = durationYears > fullYears;
  const totalSteps = fullYears + (hasPartialYear ? 1 : 0);
  const breakdown: CompoundYearlyBreakdownItem[] = [];

  let previousValue = principal;

  for (let y = 1; y <= totalSteps; y++) {
    const currentYearFraction = y === totalSteps && hasPartialYear ? durationYears : y;
    const yearEndValue = r === 0 ? principal : principal * Math.pow(1 + r / n, n * currentYearFraction);
    const interestEarnedYear = yearEndValue - previousValue;
    const totalGrowthSoFar = yearEndValue - principal;
    const realValue = yearEndValue / Math.pow(1 + inflation, currentYearFraction);

    breakdown.push({
      year: y,
      monthlyContribution: 0,
      annualContribution: 0,
      totalInvested: principal,
      interestEarnedYear: Math.max(0, roundCurrency(interestEarnedYear)),
      totalGrowth: Math.max(0, roundCurrency(totalGrowthSoFar)),
      portfolioValue: roundCurrency(yearEndValue),
      realPortfolioValue: roundCurrency(realValue)
    });

    previousValue = yearEndValue;
  }

  return {
    initialInvestment: principal,
    totalInvested: principal,
    totalGrowth: roundCurrency(totalGrowth),
    futureValue: roundCurrency(futureValue),
    realFutureValue: roundCurrency(realFutureValue),
    effectiveAnnualRate: roundTo(effectiveAnnualRate, 2),
    durationYears,
    breakdown
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
