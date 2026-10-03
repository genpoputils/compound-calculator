import { Injectable } from '@angular/core';
import {
  CalculationResult,
  RegularInvestmentInput,
  SipGrowthInput,
  YearlyBreakdownItem
} from './models/calculator.types';

@Injectable({
  providedIn: 'root'
})
export class InvestmentCalculatorService {
  /**
   * Calculates Regular Investment growth over time with periodic contributions.
   * Month-by-month cashflow simulation (annuity due / beginning of period contribution).
   */
  calculateRegularInvestment(input: RegularInvestmentInput): CalculationResult {
    const initialInvestment = Math.max(0, Number(input.initialInvestment) || 0);
    const contribution = Math.max(0, Number(input.regularContribution) || 0);
    const annualReturnPercent = Math.max(0, Number(input.expectedAnnualReturn) || 0);
    const r = annualReturnPercent / 100;
    const durationYears = Math.max(0, Number(input.durationYears) || 0);
    const inflation = Math.max(0, Number(input.inflationRate) || 0) / 100;

    const monthlyInterestRate = r / 12;
    const totalMonths = Math.round(durationYears * 12);

    let portfolioValue = initialInvestment;
    let totalInvested = initialInvestment;
    const breakdown: YearlyBreakdownItem[] = [];

    const contribIntervalMonths = input.contributionFrequency === 'yearly' ? 12 : input.contributionFrequency === 'quarterly' ? 3 : 1;

    let previousYearValue = initialInvestment;
    let previousYearInvested = initialInvestment;

    for (let month = 1; month <= totalMonths; month++) {
      // 1. Add contribution if this month aligns with frequency (beginning of period)
      if ((month - 1) % contribIntervalMonths === 0) {
        portfolioValue += contribution;
        totalInvested += contribution;
      }

      // 2. Add monthly interest on existing balance including current month deposit
      portfolioValue += portfolioValue * monthlyInterestRate;

      // Check if end of year or last month
      const isEndOfYear = month % 12 === 0 || month === totalMonths;
      if (isEndOfYear) {
        const yearNumber = Math.ceil(month / 12);
        const annualInvestedInThisYear = totalInvested - previousYearInvested;
        const interestEarnedYear = portfolioValue - previousYearValue - annualInvestedInThisYear;
        const totalGrowth = portfolioValue - totalInvested;
        const realValue = portfolioValue / Math.pow(1 + inflation, yearNumber);

        const monthlyContribEquivalent = input.contributionFrequency === 'monthly'
          ? contribution
          : input.contributionFrequency === 'quarterly'
            ? (contribution * 4) / 12
            : contribution / 12;

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

    if (breakdown.length === 0) {
      breakdown.push({
        year: 1,
        monthlyContribution: contribution,
        annualContribution: contribution,
        totalInvested,
        interestEarnedYear: 0,
        totalGrowth: 0,
        portfolioValue,
        realPortfolioValue: portfolioValue
      });
    }

    const totalGrowth = Math.max(0, portfolioValue - totalInvested);
    const realFutureValue = portfolioValue / Math.pow(1 + inflation, durationYears);

    return {
      mode: 'regular-investment',
      initialInvestment,
      totalInvested,
      totalGrowth,
      futureValue: portfolioValue,
      realFutureValue,
      durationYears,
      breakdown
    };
  }

  /**
   * SIP Growth calculation (specialized preset for monthly investments).
   */
  calculateSip(input: SipGrowthInput): CalculationResult {
    const regularInput: RegularInvestmentInput = {
      initialInvestment: input.initialInvestment || 0,
      regularContribution: input.startingMonthlyInvestment,
      contributionFrequency: 'monthly',
      expectedAnnualReturn: input.expectedAnnualReturn,
      durationYears: input.durationYears,
      compoundingFrequency: 'monthly',
      inflationRate: input.inflationRate
    };

    const res = this.calculateRegularInvestment(regularInput);
    return {
      ...res,
      mode: 'sip'
    };
  }
}
