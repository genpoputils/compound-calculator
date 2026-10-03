import { Injectable } from '@angular/core';
import {
  CalculationResult,
  CompoundInterestInput,
  CompoundingFrequency,
  YearlyBreakdownItem
} from './models/calculator.types';

@Injectable({
  providedIn: 'root'
})
export class CompoundCalculatorService {
  /**
   * Converts compounding frequency text to number of periods per year.
   */
  getPeriodsPerYear(frequency: CompoundingFrequency): number {
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
  calculate(input: CompoundInterestInput): CalculationResult {
    const principal = Math.max(0, Number(input.initialInvestment) || 0);
    const ratePercent = Math.max(0, Number(input.annualInterestRate) || 0);
    const r = ratePercent / 100;
    const durationInput = Math.max(0, Number(input.duration) || 0);
    const durationYears = input.durationUnit === 'months' ? durationInput / 12 : durationInput;
    const n = this.getPeriodsPerYear(input.compoundingFrequency);
    const inflation = Math.max(0, Number(input.inflationRate) || 0) / 100;

    if (durationYears <= 0 || principal <= 0) {
      const breakdownItem: YearlyBreakdownItem = {
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
        mode: 'compound-interest',
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
    const breakdown: YearlyBreakdownItem[] = [];

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
        interestEarnedYear,
        totalGrowth: totalGrowthSoFar,
        portfolioValue: yearEndValue,
        realPortfolioValue: realValue
      });

      previousValue = yearEndValue;
    }

    return {
      mode: 'compound-interest',
      initialInvestment: principal,
      totalInvested: principal,
      totalGrowth,
      futureValue,
      realFutureValue,
      effectiveAnnualRate,
      durationYears,
      breakdown
    };
  }
}
