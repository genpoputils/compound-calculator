import { CompoundingFrequency } from './compound-interest';

export type ContributionFrequency = 'monthly' | 'quarterly' | 'yearly';

export interface SipInput {
  startingMonthlyInvestment: number;
  initialInvestment?: number;
  expectedAnnualReturn: number;
  durationYears: number;
  inflationRate?: number;
}

export interface RegularInvestmentInput {
  initialInvestment: number;
  regularContribution: number;
  contributionFrequency: ContributionFrequency;
  expectedAnnualReturn: number;
  durationYears: number;
  compoundingFrequency?: CompoundingFrequency;
  inflationRate?: number;
}

export interface InvestmentYearlyBreakdownItem {
  year: number;
  monthlyContribution: number;
  annualContribution: number;
  totalInvested: number;
  interestEarnedYear: number;
  totalGrowth: number;
  portfolioValue: number;
  realPortfolioValue: number;
}

export interface InvestmentResult {
  initialInvestment: number;
  totalInvested: number;
  totalGrowth: number;
  futureValue: number;
  realFutureValue: number;
  durationYears: number;
  breakdown: InvestmentYearlyBreakdownItem[];
}

/**
 * Calculates standard Monthly SIP (beginning of month annuity due).
 */
export function calculateSip(input: SipInput): InvestmentResult {
  const initialInvestment = Math.max(0, Number(input.initialInvestment) || 0);
  const monthlySip = Math.max(0, Number(input.startingMonthlyInvestment) || 0);
  const annualReturnPercent = Math.max(0, Number(input.expectedAnnualReturn) || 0);
  const r = annualReturnPercent / 100;
  const monthlyRate = r / 12;
  const durationYears = Math.max(1, Math.round(Number(input.durationYears) || 1));
  const inflation = Math.max(0, Number(input.inflationRate) || 0) / 100;

  const totalMonths = durationYears * 12;
  let portfolioValue = initialInvestment;
  let totalInvested = initialInvestment;
  const breakdown: InvestmentYearlyBreakdownItem[] = [];

  let previousYearValue = initialInvestment;
  let previousYearInvested = initialInvestment;

  for (let m = 1; m <= totalMonths; m++) {
    // Deposit at beginning of month
    portfolioValue += monthlySip;
    totalInvested += monthlySip;

    // Monthly interest accrued
    portfolioValue += portfolioValue * monthlyRate;

    // Record yearly breakdown at month 12, 24, 36...
    if (m % 12 === 0 || m === totalMonths) {
      const year = Math.ceil(m / 12);
      const annualInvestedInThisYear = totalInvested - previousYearInvested;
      const interestEarnedYear = portfolioValue - previousYearValue - annualInvestedInThisYear;
      const totalGrowth = portfolioValue - totalInvested;
      const realValue = portfolioValue / Math.pow(1 + inflation, year);

      breakdown.push({
        year,
        monthlyContribution: monthlySip,
        annualContribution: roundCurrency(annualInvestedInThisYear),
        totalInvested: roundCurrency(totalInvested),
        interestEarnedYear: Math.max(0, roundCurrency(interestEarnedYear)),
        totalGrowth: Math.max(0, roundCurrency(totalGrowth)),
        portfolioValue: roundCurrency(portfolioValue),
        realPortfolioValue: roundCurrency(realValue)
      });

      previousYearValue = portfolioValue;
      previousYearInvested = totalInvested;
    }
  }

  const totalGrowth = Math.max(0, portfolioValue - totalInvested);
  const realFutureValue = portfolioValue / Math.pow(1 + inflation, durationYears);

  return {
    initialInvestment,
    totalInvested: roundCurrency(totalInvested),
    totalGrowth: roundCurrency(totalGrowth),
    futureValue: roundCurrency(portfolioValue),
    realFutureValue: roundCurrency(realFutureValue),
    durationYears,
    breakdown
  };
}

/**
 * Calculates regular investment with monthly, quarterly, or yearly contributions.
 */
export function calculateRegularInvestment(input: RegularInvestmentInput): InvestmentResult {
  const initial = Math.max(0, Number(input.initialInvestment) || 0);
  const contribution = Math.max(0, Number(input.regularContribution) || 0);
  const annualReturnPercent = Math.max(0, Number(input.expectedAnnualReturn) || 0);
  const r = annualReturnPercent / 100;
  const durationYears = Math.max(1, Math.round(Number(input.durationYears) || 1));
  const inflation = Math.max(0, Number(input.inflationRate) || 0) / 100;

  const totalMonths = durationYears * 12;
  const monthlyRate = r / 12;
  const intervalMonths = input.contributionFrequency === 'yearly' ? 12 : input.contributionFrequency === 'quarterly' ? 3 : 1;

  let portfolioValue = initial;
  let totalInvested = initial;
  const breakdown: InvestmentYearlyBreakdownItem[] = [];

  let previousYearValue = initial;
  let previousYearInvested = initial;

  for (let m = 1; m <= totalMonths; m++) {
    // Deposit at start of period
    if ((m - 1) % intervalMonths === 0) {
      portfolioValue += contribution;
      totalInvested += contribution;
    }

    portfolioValue += portfolioValue * monthlyRate;

    if (m % 12 === 0 || m === totalMonths) {
      const year = Math.ceil(m / 12);
      const annualInvestedInThisYear = totalInvested - previousYearInvested;
      const interestEarnedYear = portfolioValue - previousYearValue - annualInvestedInThisYear;
      const totalGrowth = portfolioValue - totalInvested;
      const realValue = portfolioValue / Math.pow(1 + inflation, year);

      const monthlyEquivalent = input.contributionFrequency === 'monthly'
        ? contribution
        : input.contributionFrequency === 'quarterly'
          ? (contribution * 4) / 12
          : contribution / 12;

      breakdown.push({
        year,
        monthlyContribution: roundCurrency(monthlyEquivalent),
        annualContribution: roundCurrency(annualInvestedInThisYear),
        totalInvested: roundCurrency(totalInvested),
        interestEarnedYear: Math.max(0, roundCurrency(interestEarnedYear)),
        totalGrowth: Math.max(0, roundCurrency(totalGrowth)),
        portfolioValue: roundCurrency(portfolioValue),
        realPortfolioValue: roundCurrency(realValue)
      });

      previousYearValue = portfolioValue;
      previousYearInvested = totalInvested;
    }
  }

  const totalGrowth = Math.max(0, portfolioValue - totalInvested);
  const realFutureValue = portfolioValue / Math.pow(1 + inflation, durationYears);

  return {
    initialInvestment: initial,
    totalInvested: roundCurrency(totalInvested),
    totalGrowth: roundCurrency(totalGrowth),
    futureValue: roundCurrency(portfolioValue),
    realFutureValue: roundCurrency(realFutureValue),
    durationYears,
    breakdown
  };
}

function roundCurrency(val: number): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  return Math.round(val * 100) / 100;
}
