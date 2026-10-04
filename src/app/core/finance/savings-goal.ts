import { ContributionFrequency } from './sip';

export interface SavingsGoalInput {
  targetAmount: number;
  currentSavings: number;
  expectedAnnualReturn: number;
  durationYears: number;
  contributionFrequency: ContributionFrequency;
  inflationRate?: number;
  annualStepUpPercent?: number; // optional annual increase
}

export interface SavingsGoalYearlyItem {
  year: number;
  monthlyContribution: number;
  annualContribution: number;
  totalInvested: number;
  interestEarnedYear: number;
  totalGrowth: number;
  portfolioValue: number;
  realPortfolioValue: number;
}

export interface SavingsGoalResult {
  targetAmount: number;
  currentSavings: number;
  expectedAnnualReturn: number;
  durationYears: number;
  requiredContribution: number; // e.g. required per month / quarter / year
  contributionFrequency: ContributionFrequency;
  totalInvested: number;
  totalGrowth: number;
  futureValue: number;
  realFutureValue: number;
  isGoalMet: boolean;
  breakdown: SavingsGoalYearlyItem[];
}

/**
 * Calculates required regular contribution to achieve a target financial goal.
 */
export function calculateSavingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const targetAmount = Math.max(0, Number(input.targetAmount) || 0);
  const currentSavings = Math.max(0, Number(input.currentSavings) || 0);
  const annualReturnPercent = Math.max(0, Number(input.expectedAnnualReturn) || 0);
  const r = annualReturnPercent / 100;
  const durationYears = Math.max(1, Math.round(Number(input.durationYears) || 1));
  const inflation = Math.max(0, Number(input.inflationRate) || 0) / 100;

  const periodsPerYear = input.contributionFrequency === 'yearly' ? 1 : input.contributionFrequency === 'quarterly' ? 4 : 12;
  const totalPeriods = durationYears * periodsPerYear;
  const ratePerPeriod = r / periodsPerYear;

  // 1. Future value of current initial savings
  const fvCurrentSavings = ratePerPeriod === 0
    ? currentSavings
    : currentSavings * Math.pow(1 + ratePerPeriod, totalPeriods);

  const remainingTarget = Math.max(0, targetAmount - fvCurrentSavings);

  // 2. Required regular contribution (annuity due)
  let requiredContribution = 0;
  if (remainingTarget > 0) {
    if (ratePerPeriod === 0) {
      requiredContribution = remainingTarget / totalPeriods;
    } else {
      const annuityFactor = ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod) * (1 + ratePerPeriod);
      requiredContribution = remainingTarget / annuityFactor;
    }
  }

  requiredContribution = roundCurrency(requiredContribution);

  // 3. Simulate month-by-month cashflow
  let portfolioValue = currentSavings;
  let totalInvested = currentSavings;
  const breakdown: SavingsGoalYearlyItem[] = [];

  const totalMonths = durationYears * 12;
  const monthlyRate = r / 12;
  const contribIntervalMonths = input.contributionFrequency === 'yearly' ? 12 : input.contributionFrequency === 'quarterly' ? 3 : 1;

  let previousYearValue = currentSavings;
  let previousYearInvested = currentSavings;

  for (let month = 1; month <= totalMonths; month++) {
    if ((month - 1) % contribIntervalMonths === 0) {
      portfolioValue += requiredContribution;
      totalInvested += requiredContribution;
    }

    portfolioValue += portfolioValue * monthlyRate;

    if (month % 12 === 0 || month === totalMonths) {
      const yearNumber = Math.ceil(month / 12);
      const annualInvestedInThisYear = totalInvested - previousYearInvested;
      const interestEarnedYear = portfolioValue - previousYearValue - annualInvestedInThisYear;
      const totalGrowth = portfolioValue - totalInvested;
      const realValue = portfolioValue / Math.pow(1 + inflation, yearNumber);

      const monthlyContribEquivalent = input.contributionFrequency === 'monthly'
        ? requiredContribution
        : input.contributionFrequency === 'quarterly'
          ? (requiredContribution * 4) / 12
          : requiredContribution / 12;

      breakdown.push({
        year: yearNumber,
        monthlyContribution: roundCurrency(monthlyContribEquivalent),
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
    targetAmount,
    currentSavings,
    expectedAnnualReturn: annualReturnPercent,
    durationYears,
    requiredContribution,
    contributionFrequency: input.contributionFrequency,
    totalInvested: roundCurrency(totalInvested),
    totalGrowth: roundCurrency(totalGrowth),
    futureValue: roundCurrency(portfolioValue),
    realFutureValue: roundCurrency(realFutureValue),
    isGoalMet: portfolioValue >= targetAmount - 1,
    breakdown
  };
}

function roundCurrency(val: number): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  return Math.round(val * 100) / 100;
}
