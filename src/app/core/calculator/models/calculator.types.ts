export type CalculationMode =
  | 'compound-interest'
  | 'regular-investment'
  | 'sip'
  | 'step-up'
  | 'retirement'
  | 'inflation'
  | 'savings-goal';

export type CompoundingFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily';

export type ContributionFrequency = 'monthly' | 'quarterly' | 'yearly';

export type DurationUnit = 'years' | 'months';

export interface YearlyBreakdownItem {
  year: number;
  age?: number;
  monthlyContribution: number;
  annualContribution: number;
  totalInvested: number;
  interestEarnedYear: number;
  totalGrowth: number;
  portfolioValue: number;
  realPortfolioValue: number; // Inflation adjusted purchasing power
}

export interface CalculationResult {
  mode: CalculationMode;
  initialInvestment: number;
  totalInvested: number;
  totalGrowth: number;
  futureValue: number;
  realFutureValue: number; // Inflation-adjusted value
  effectiveAnnualRate?: number;
  durationYears: number;
  breakdown: YearlyBreakdownItem[];
  metadata?: {
    currentAge?: number;
    retirementAge?: number;
    monthlyPurchasingPowerAtRetirement?: number;
    estimatedRetirementMonthlyExpense?: number;
    estimatedRetirementAnnualExpense?: number;
    requiredContribution?: number;
    contributionFrequency?: ContributionFrequency;
    futureCostOfAmount?: number;
    todayPurchasingPowerOfFuture?: number;
  };
}

export interface CompoundInterestInput {
  initialInvestment: number;
  annualInterestRate: number; // in percent, e.g. 12
  compoundingFrequency: CompoundingFrequency;
  duration: number;
  durationUnit: DurationUnit;
  inflationRate?: number; // optional in percent, e.g. 6
}

export interface RegularInvestmentInput {
  initialInvestment: number;
  regularContribution: number;
  contributionFrequency: ContributionFrequency;
  expectedAnnualReturn: number; // in percent
  durationYears: number;
  compoundingFrequency: CompoundingFrequency;
  inflationRate?: number;
}

export interface SipGrowthInput {
  startingMonthlyInvestment: number;
  initialInvestment?: number;
  expectedAnnualReturn: number;
  durationYears: number;
  inflationRate?: number;
}

export interface StepUpInvestmentInput {
  startingMonthlyInvestment: number;
  annualStepUpPercent: number; // e.g. 10
  expectedAnnualReturn: number; // e.g. 12
  durationYears: number;
  initialInvestment?: number;
  inflationRate?: number;
}

export interface RetirementSavingsInput {
  currentAge: number;
  retirementAge: number;
  currentCorpus: number;
  startingMonthlyInvestment: number;
  annualStepUpPercent: number;
  expectedAnnualReturn: number;
  inflationRate: number;
  retirementDurationYears?: number;
  currentMonthlyExpense?: number;
}

export interface InflationInput {
  currentAmount: number;
  inflationRate: number;
  years: number;
}

export interface SavingsGoalInput {
  targetAmount: number;
  currentSavings: number;
  expectedAnnualReturn: number;
  durationYears: number;
  contributionFrequency: ContributionFrequency;
  inflationRate?: number;
}

export interface ScenarioComparison {
  scenarioA: CalculationResult;
  scenarioB: CalculationResult;
  deltaFutureValue: number;
  deltaTotalInvested: number;
  deltaTotalGrowth: number;
  futureValuePercentageDifference: number;
}
