import { Injectable } from '@angular/core';
import { CalculationResult, SwpInput, YearlyBreakdownItem } from './models/calculator.types';

@Injectable({
  providedIn: 'root'
})
export class SwpCalculatorService {
  /**
   * Calculates Systematic Withdrawal Plan (SWP) cash flows, interest accrued,
   * capital preservation/longevity, and ending portfolio balance.
   */
  calculate(input: SwpInput): CalculationResult {
    const initialCorpus = Math.max(0, Number(input.initialCorpus) || 0);
    let currentMonthlyWithdrawal = Math.max(0, Number(input.monthlyWithdrawal) || 0);
    const annualReturnPercent = Math.max(0, Number(input.expectedAnnualReturn) || 0);
    const durationYears = Math.max(1, Math.round(Number(input.durationYears) || 1));
    const stepUpPercent = Math.max(0, Number(input.annualWithdrawalIncreasePercent) || 0);
    const inflationPercent = Math.max(0, Number(input.inflationRate) || 0);

    const monthlyReturnRate = (annualReturnPercent / 100) / 12;
    const annualInflation = inflationPercent / 100;

    let balance = initialCorpus;
    let totalWithdrawn = 0;
    let totalInterestEarned = 0;
    let isDepleted = false;
    let depletionYear: number | null = null;
    let depletionMonth: number | null = null;

    const breakdown: YearlyBreakdownItem[] = [];

    for (let year = 1; year <= durationYears; year++) {
      if (year > 1 && stepUpPercent > 0) {
        currentMonthlyWithdrawal *= (1 + stepUpPercent / 100);
      }

      let annualWithdrawnThisYear = 0;
      let interestEarnedThisYear = 0;

      for (let month = 1; month <= 12; month++) {
        if (balance <= 0) {
          if (!isDepleted) {
            isDepleted = true;
            depletionYear = year;
            depletionMonth = month;
          }
          break;
        }

        // Beginning-of-month withdrawal
        let withdrawal = currentMonthlyWithdrawal;
        if (balance < withdrawal) {
          withdrawal = balance;
          balance = 0;
          annualWithdrawnThisYear += withdrawal;
          totalWithdrawn += withdrawal;
          if (!isDepleted) {
            isDepleted = true;
            depletionYear = year;
            depletionMonth = month;
          }
          break;
        } else {
          balance -= withdrawal;
          annualWithdrawnThisYear += withdrawal;
          totalWithdrawn += withdrawal;
        }

        // Accrue monthly return on remaining balance
        const monthlyInterest = balance * monthlyReturnRate;
        balance += monthlyInterest;
        interestEarnedThisYear += monthlyInterest;
        totalInterestEarned += monthlyInterest;
      }

      const realValue = balance > 0
        ? balance / Math.pow(1 + annualInflation, year)
        : 0;

      breakdown.push({
        year,
        monthlyContribution: currentMonthlyWithdrawal,
        annualContribution: annualWithdrawnThisYear,
        totalInvested: initialCorpus,
        interestEarnedYear: Math.max(0, interestEarnedThisYear),
        totalGrowth: Math.max(0, totalInterestEarned),
        portfolioValue: Math.max(0, balance),
        realPortfolioValue: Math.max(0, realValue)
      });
    }

    const finalBalance = Math.max(0, balance);
    const realFutureValue = finalBalance > 0
      ? finalBalance / Math.pow(1 + annualInflation, durationYears)
      : 0;

    const sustainableWithdrawalRate = initialCorpus > 0
      ? ((input.monthlyWithdrawal * 12) / initialCorpus) * 100
      : 0;

    return {
      mode: 'swp',
      initialInvestment: initialCorpus,
      totalInvested: totalWithdrawn, // Total payout received
      totalGrowth: totalInterestEarned, // Total returns accrued while withdrawing
      futureValue: finalBalance, // Remaining capital balance
      realFutureValue,
      durationYears,
      breakdown,
      metadata: {
        initialCorpus,
        monthlyWithdrawal: input.monthlyWithdrawal,
        annualWithdrawalIncreasePercent: stepUpPercent,
        totalWithdrawn,
        finalBalance,
        totalInterestEarned,
        isDepleted,
        depletionYear,
        depletionMonth,
        sustainableWithdrawalRate
      }
    };
  }
}
