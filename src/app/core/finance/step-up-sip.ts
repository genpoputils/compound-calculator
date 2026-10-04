/**
 * Pure TypeScript Financial Calculation Engine - Step-Up SIP
 * Features: Annual step-up increment and Flat SIP vs Step-Up SIP comparison.
 * Zero external or Angular dependencies. Deterministic, client-side only.
 */

import { calculateSip } from './sip';

export interface StepUpSipInput {
  startingMonthlyInvestment: number;
  annualStepUpPercent: number; // e.g. 10
  expectedAnnualReturn: number; // e.g. 12
  durationYears: number;
  initialInvestment?: number;
  inflationRate?: number;
}

export interface StepUpYearlyBreakdownItem {
  year: number;
  age?: number;
  monthlyContribution: number;
  annualContribution: number;
  totalInvested: number;
  interestEarnedYear: number;
  totalGrowth: number;
  portfolioValue: number;
  realPortfolioValue: number;
}

export interface StepUpSipResult {
  initialInvestment: number;
  totalInvested: number;
  totalGrowth: number;
  futureValue: number;
  realFutureValue: number;
  durationYears: number;
  breakdown: StepUpYearlyBreakdownItem[];
}

export interface FlatVsStepUpComparison {
  flatSip: {
    totalInvested: number;
    totalGrowth: number;
    futureValue: number;
    realFutureValue: number;
  };
  stepUpSip: {
    totalInvested: number;
    totalGrowth: number;
    futureValue: number;
    realFutureValue: number;
  };
  extraWealthCreated: number;
  extraInvested: number;
  percentageCorpusIncrease: number;
}

/**
 * Calculates Step-Up SIP where monthly investment grows annually by stepUpPercent.
 */
export function calculateStepUpSip(
  input: StepUpSipInput,
  options?: { currentAge?: number }
): StepUpSipResult {
  const initialInvestment = Math.max(0, Number(input.initialInvestment) || 0);
  const startMonthly = Math.max(0, Number(input.startingMonthlyInvestment) || 0);
  const stepUpPercent = Math.max(0, Number(input.annualStepUpPercent) || 0);
  const stepUpMultiplier = 1 + stepUpPercent / 100;
  const annualReturnPercent = Math.max(0, Number(input.expectedAnnualReturn) || 0);
  const r = annualReturnPercent / 100;
  const monthlyRate = r / 12;
  const durationYears = Math.max(1, Math.round(Number(input.durationYears) || 1));
  const inflation = Math.max(0, Number(input.inflationRate) || 0) / 100;

  let currentMonthlyContribution = startMonthly;
  let portfolioValue = initialInvestment;
  let totalInvested = initialInvestment;
  const breakdown: StepUpYearlyBreakdownItem[] = [];

  let previousYearEndValue = initialInvestment;
  let previousYearEndInvested = initialInvestment;

  for (let year = 1; year <= durationYears; year++) {
    if (year > 1) {
      currentMonthlyContribution = currentMonthlyContribution * stepUpMultiplier;
    }

    // Simulate 12 months for this year (annuity due)
    for (let m = 1; m <= 12; m++) {
      portfolioValue += currentMonthlyContribution;
      totalInvested += currentMonthlyContribution;
      portfolioValue += portfolioValue * monthlyRate;
    }

    const annualInvestedInThisYear = totalInvested - previousYearEndInvested;
    const interestEarnedYear = portfolioValue - previousYearEndValue - annualInvestedInThisYear;
    const totalGrowth = portfolioValue - totalInvested;
    const realValue = portfolioValue / Math.pow(1 + inflation, year);

    breakdown.push({
      year,
      age: options?.currentAge ? options.currentAge + year : undefined,
      monthlyContribution: roundCurrency(currentMonthlyContribution),
      annualContribution: roundCurrency(annualInvestedInThisYear),
      totalInvested: roundCurrency(totalInvested),
      interestEarnedYear: Math.max(0, roundCurrency(interestEarnedYear)),
      totalGrowth: Math.max(0, roundCurrency(totalGrowth)),
      portfolioValue: roundCurrency(portfolioValue),
      realPortfolioValue: roundCurrency(realValue)
    });

    previousYearEndValue = portfolioValue;
    previousYearEndInvested = totalInvested;
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
 * Compares Flat SIP vs Step-Up SIP side-by-side.
 */
export function compareFlatVsStepUp(input: StepUpSipInput): FlatVsStepUpComparison {
  const stepUpResult = calculateStepUpSip(input);

  const flatResult = calculateSip({
    startingMonthlyInvestment: input.startingMonthlyInvestment,
    initialInvestment: input.initialInvestment || 0,
    expectedAnnualReturn: input.expectedAnnualReturn,
    durationYears: input.durationYears,
    inflationRate: input.inflationRate
  });

  const extraWealthCreated = Math.max(0, roundCurrency(stepUpResult.futureValue - flatResult.futureValue));
  const extraInvested = Math.max(0, roundCurrency(stepUpResult.totalInvested - flatResult.totalInvested));
  const percentageIncrease = flatResult.futureValue > 0
    ? roundTo(((stepUpResult.futureValue - flatResult.futureValue) / flatResult.futureValue) * 100, 1)
    : 0;

  return {
    flatSip: {
      totalInvested: flatResult.totalInvested,
      totalGrowth: flatResult.totalGrowth,
      futureValue: flatResult.futureValue,
      realFutureValue: flatResult.realFutureValue
    },
    stepUpSip: {
      totalInvested: stepUpResult.totalInvested,
      totalGrowth: stepUpResult.totalGrowth,
      futureValue: stepUpResult.futureValue,
      realFutureValue: stepUpResult.realFutureValue
    },
    extraWealthCreated,
    extraInvested,
    percentageCorpusIncrease: percentageIncrease
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
