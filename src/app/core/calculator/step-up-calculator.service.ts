import { Injectable } from '@angular/core';
import {
  CalculationResult,
  StepUpInvestmentInput,
  YearlyBreakdownItem
} from './models/calculator.types';

@Injectable({
  providedIn: 'root'
})
export class StepUpCalculatorService {
  /**
   * Calculates Step-Up Investment growth where the monthly contribution increases annually by stepUpPercent.
   * Month-by-month cashflow compounding simulation (annuity due / beginning of month deposit).
   */
  calculateStepUp(
    input: StepUpInvestmentInput,
    options?: { currentAge?: number; retirementAge?: number }
  ): CalculationResult {
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
    const breakdown: YearlyBreakdownItem[] = [];

    let previousYearEndValue = initialInvestment;
    let previousYearEndInvested = initialInvestment;

    for (let year = 1; year <= durationYears; year++) {
      if (year > 1) {
        currentMonthlyContribution = currentMonthlyContribution * stepUpMultiplier;
      }

      // Simulate 12 months for this year
      for (let m = 1; m <= 12; m++) {
        // Month contribution deposited (beginning of month)
        portfolioValue += currentMonthlyContribution;
        totalInvested += currentMonthlyContribution;

        // Month interest on balance (including current month deposit)
        portfolioValue += portfolioValue * monthlyRate;
      }

      const annualInvestedInThisYear = totalInvested - previousYearEndInvested;
      const interestEarnedYear = portfolioValue - previousYearEndValue - annualInvestedInThisYear;
      const totalGrowth = portfolioValue - totalInvested;
      const realValue = portfolioValue / Math.pow(1 + inflation, year);

      breakdown.push({
        year,
        age: options?.currentAge ? options.currentAge + year : undefined,
        monthlyContribution: currentMonthlyContribution,
        annualContribution: annualInvestedInThisYear,
        totalInvested,
        interestEarnedYear: Math.max(0, interestEarnedYear),
        totalGrowth: Math.max(0, totalGrowth),
        portfolioValue,
        realPortfolioValue: realValue
      });

      previousYearEndValue = portfolioValue;
      previousYearEndInvested = totalInvested;
    }

    const totalGrowth = Math.max(0, portfolioValue - totalInvested);
    const realFutureValue = portfolioValue / Math.pow(1 + inflation, durationYears);

    return {
      mode: 'step-up',
      initialInvestment,
      totalInvested,
      totalGrowth,
      futureValue: portfolioValue,
      realFutureValue,
      durationYears,
      breakdown
    };
  }
}
