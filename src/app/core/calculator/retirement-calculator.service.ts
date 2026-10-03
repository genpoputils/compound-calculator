import { inject, Injectable } from '@angular/core';
import {
  CalculationResult,
  RetirementSavingsInput,
  StepUpInvestmentInput
} from './models/calculator.types';
import { StepUpCalculatorService } from './step-up-calculator.service';

@Injectable({
  providedIn: 'root'
})
export class RetirementCalculatorService {
  private readonly stepUpService = inject(StepUpCalculatorService);

  /**
   * Calculates retirement corpus using step-up contributions, inflation discounting,
   * and optional retirement expense projections.
   */
  calculate(input: RetirementSavingsInput): CalculationResult {
    const currentAge = Math.max(1, Number(input.currentAge) || 25);
    const retirementAge = Math.max(currentAge + 1, Number(input.retirementAge) || 60);
    const durationYears = retirementAge - currentAge;
    const inflation = Math.max(0, Number(input.inflationRate) || 0) / 100;
    const retirementDuration = Math.max(1, Number(input.retirementDurationYears) || 25);

    const stepUpInput: StepUpInvestmentInput = {
      startingMonthlyInvestment: Math.max(0, Number(input.startingMonthlyInvestment) || 0),
      annualStepUpPercent: Math.max(0, Number(input.annualStepUpPercent) || 0),
      expectedAnnualReturn: Math.max(0, Number(input.expectedAnnualReturn) || 0),
      durationYears,
      initialInvestment: Math.max(0, Number(input.currentCorpus) || 0),
      inflationRate: input.inflationRate
    };

    const stepUpResult = this.stepUpService.calculateStepUp(stepUpInput, {
      currentAge,
      retirementAge
    });

    // Purchasing power of the future corpus in today's money:
    // realFutureValue = futureValue / (1 + inflation)^durationYears
    const realFutureValue = stepUpResult.futureValue / Math.pow(1 + inflation, durationYears);

    // Monthly purchasing power during retirement (e.g. over 25-30 years retirement duration using real purchasing power):
    // Or based on safe withdrawal rate (4% rule: 4% of realFutureValue per year / 12)
    // 4% safe withdrawal gives sustainable monthly income in today's money:
    const monthlyPurchasingPower = (realFutureValue * 0.04) / 12;

    // Optional Expense projection
    let estimatedRetirementMonthlyExpense: number | undefined;
    let estimatedRetirementAnnualExpense: number | undefined;

    if (input.currentMonthlyExpense && input.currentMonthlyExpense > 0) {
      estimatedRetirementMonthlyExpense =
        input.currentMonthlyExpense * Math.pow(1 + inflation, durationYears);
      estimatedRetirementAnnualExpense = estimatedRetirementMonthlyExpense * 12;
    }

    return {
      ...stepUpResult,
      mode: 'retirement',
      realFutureValue,
      metadata: {
        currentAge,
        retirementAge,
        monthlyPurchasingPowerAtRetirement: monthlyPurchasingPower,
        estimatedRetirementMonthlyExpense,
        estimatedRetirementAnnualExpense
      }
    };
  }

  /**
   * Standalone helper for projecting current expenses into future retirement expenses.
   */
  projectExpenses(currentMonthlyExpense: number, inflationRatePercent: number, years: number): {
    futureMonthlyExpense: number;
    futureAnnualExpense: number;
  } {
    const inflation = Math.max(0, inflationRatePercent) / 100;
    const futureMonthlyExpense = currentMonthlyExpense * Math.pow(1 + inflation, Math.max(0, years));
    return {
      futureMonthlyExpense,
      futureAnnualExpense: futureMonthlyExpense * 12
    };
  }
}
