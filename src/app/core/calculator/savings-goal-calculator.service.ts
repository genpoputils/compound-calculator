import { Injectable } from '@angular/core';
import {
  CalculationResult,
  ContributionFrequency,
  SavingsGoalInput,
  YearlyBreakdownItem
} from './models/calculator.types';

@Injectable({
  providedIn: 'root'
})
export class SavingsGoalCalculatorService {
  /**
   * Calculates the required regular contribution needed to reach a target corpus.
   * Assumes contributions are made at the beginning of each period (annuity due / SIP convention).
   */
  calculate(input: SavingsGoalInput): CalculationResult {
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

    // 2. Required contribution per period (annuity due: deposited at start of each period)
    let requiredContribution = 0;

    if (remainingTarget > 0) {
      if (ratePerPeriod === 0) {
        requiredContribution = remainingTarget / totalPeriods;
      } else {
        // Annuity due formula: FV = PMT * [((1 + i)^n - 1) / i] * (1 + i)
        const annuityFactor = ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod) * (1 + ratePerPeriod);
        requiredContribution = remainingTarget / annuityFactor;
      }
    }

    // 3. Simulate month-by-month matching annuity-due cashflows
    let portfolioValue = currentSavings;
    let totalInvested = currentSavings;
    const breakdown: YearlyBreakdownItem[] = [];

    const totalMonths = durationYears * 12;
    const monthlyRate = r / 12;
    const contribIntervalMonths = input.contributionFrequency === 'yearly' ? 12 : input.contributionFrequency === 'quarterly' ? 3 : 1;

    let previousYearValue = currentSavings;
    let previousYearInvested = currentSavings;

    for (let month = 1; month <= totalMonths; month++) {
      // Deposit at beginning of period
      if ((month - 1) % contribIntervalMonths === 0) {
        portfolioValue += requiredContribution;
        totalInvested += requiredContribution;
      }

      // Accrue monthly return on balance
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
          monthlyContribution: monthlyContribEquivalent,
          annualContribution: annualInvestedInThisYear,
          totalInvested,
          interestEarnedYear: Math.max(0, interestEarnedYear),
          totalGrowth: Math.max(0, totalGrowth),
          portfolioValue,
          realPortfolioValue: realValue
        });

        previousYearValue = portfolioValue;
        previousYearInvested = totalInvested;
      }
    }

    const totalGrowth = Math.max(0, portfolioValue - totalInvested);
    const realFutureValue = portfolioValue / Math.pow(1 + inflation, durationYears);

    return {
      mode: 'savings-goal',
      initialInvestment: currentSavings,
      totalInvested,
      totalGrowth,
      futureValue: portfolioValue,
      realFutureValue,
      durationYears,
      breakdown,
      metadata: {
        requiredContribution,
        contributionFrequency: input.contributionFrequency
      }
    };
  }
}
