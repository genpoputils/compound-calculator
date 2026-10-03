import { Injectable } from '@angular/core';
import {
  CalculationResult,
  InflationInput,
  YearlyBreakdownItem
} from './models/calculator.types';

@Injectable({
  providedIn: 'root'
})
export class InflationCalculatorService {
  /**
   * Calculates the eroding effect of inflation on money over time.
   * Future Cost = C * (1 + inflation)^years
   * Purchasing Power = C / (1 + inflation)^years
   */
  calculate(input: InflationInput): CalculationResult {
    const currentAmount = Math.max(0, Number(input.currentAmount) || 0);
    const inflationPercent = Math.max(0, Number(input.inflationRate) || 0);
    const i = inflationPercent / 100;
    const years = Math.max(1, Math.round(Number(input.years) || 1));

    const futureCostOfAmount = currentAmount * Math.pow(1 + i, years);
    const todayPurchasingPowerOfFuture = currentAmount / Math.pow(1 + i, years);

    const breakdown: YearlyBreakdownItem[] = [];

    for (let y = 1; y <= years; y++) {
      const futureCost = currentAmount * Math.pow(1 + i, y);
      const purchasingPower = currentAmount / Math.pow(1 + i, y);

      breakdown.push({
        year: y,
        monthlyContribution: 0,
        annualContribution: 0,
        totalInvested: currentAmount,
        interestEarnedYear: futureCost - (y === 1 ? currentAmount : currentAmount * Math.pow(1 + i, y - 1)),
        totalGrowth: futureCost - currentAmount,
        portfolioValue: futureCost,
        realPortfolioValue: purchasingPower
      });
    }

    return {
      mode: 'inflation',
      initialInvestment: currentAmount,
      totalInvested: currentAmount,
      totalGrowth: futureCostOfAmount - currentAmount,
      futureValue: futureCostOfAmount,
      realFutureValue: todayPurchasingPowerOfFuture,
      durationYears: years,
      breakdown,
      metadata: {
        futureCostOfAmount,
        todayPurchasingPowerOfFuture
      }
    };
  }
}
