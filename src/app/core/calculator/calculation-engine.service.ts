import { inject, Injectable } from '@angular/core';
import { CompoundCalculatorService } from './compound-calculator.service';
import { InflationCalculatorService } from './inflation-calculator.service';
import { InvestmentCalculatorService } from './investment-calculator.service';
import {
  CalculationMode,
  CalculationResult,
  CompoundInterestInput,
  InflationInput,
  RegularInvestmentInput,
  RetirementSavingsInput,
  SavingsGoalInput,
  ScenarioComparison,
  SipGrowthInput,
  StepUpInvestmentInput,
  SwpInput
} from './models/calculator.types';
import { RetirementCalculatorService } from './retirement-calculator.service';
import { SavingsGoalCalculatorService } from './savings-goal-calculator.service';
import { StepUpCalculatorService } from './step-up-calculator.service';
import { SwpCalculatorService } from './swp-calculator.service';

export interface CalculatorState {
  mode: CalculationMode;
  compoundInput: CompoundInterestInput;
  regularInput: RegularInvestmentInput;
  sipInput: SipGrowthInput;
  stepUpInput: StepUpInvestmentInput;
  retirementInput: RetirementSavingsInput;
  inflationInput: InflationInput;
  savingsGoalInput: SavingsGoalInput;
  swpInput: SwpInput;
}

export const DEFAULT_CALCULATOR_STATE: CalculatorState = {
  mode: 'step-up',
  compoundInput: {
    initialInvestment: 100000,
    annualInterestRate: 12,
    compoundingFrequency: 'annually',
    duration: 10,
    durationUnit: 'years',
    inflationRate: 6
  },
  regularInput: {
    initialInvestment: 50000,
    regularContribution: 10000,
    contributionFrequency: 'monthly',
    expectedAnnualReturn: 12,
    durationYears: 15,
    compoundingFrequency: 'monthly',
    inflationRate: 6
  },
  sipInput: {
    startingMonthlyInvestment: 10000,
    initialInvestment: 0,
    expectedAnnualReturn: 12,
    durationYears: 15,
    inflationRate: 6
  },
  stepUpInput: {
    startingMonthlyInvestment: 20000,
    annualStepUpPercent: 10,
    expectedAnnualReturn: 12,
    durationYears: 20,
    initialInvestment: 50000,
    inflationRate: 6
  },
  retirementInput: {
    currentAge: 29,
    retirementAge: 50,
    currentCorpus: 500000,
    startingMonthlyInvestment: 25000,
    annualStepUpPercent: 10,
    expectedAnnualReturn: 12,
    inflationRate: 6,
    retirementDurationYears: 25,
    currentMonthlyExpense: 40000
  },
  inflationInput: {
    currentAmount: 100000,
    inflationRate: 6,
    years: 20
  },
  savingsGoalInput: {
    targetAmount: 5000000,
    currentSavings: 200000,
    expectedAnnualReturn: 12,
    durationYears: 10,
    contributionFrequency: 'monthly',
    inflationRate: 6
  },
  swpInput: {
    initialCorpus: 5000000,
    monthlyWithdrawal: 35000,
    expectedAnnualReturn: 8,
    durationYears: 20,
    annualWithdrawalIncreasePercent: 0,
    inflationRate: 6
  }
};

@Injectable({
  providedIn: 'root'
})
export class CalculationEngineService {
  private readonly compoundService = inject(CompoundCalculatorService);
  private readonly investmentService = inject(InvestmentCalculatorService);
  private readonly stepUpService = inject(StepUpCalculatorService);
  private readonly retirementService = inject(RetirementCalculatorService);
  private readonly inflationService = inject(InflationCalculatorService);
  private readonly savingsGoalService = inject(SavingsGoalCalculatorService);
  private readonly swpService = inject(SwpCalculatorService);

  /**
   * Unified calculation dispatch based on mode.
   */
  calculate(mode: CalculationMode, state: CalculatorState): CalculationResult {
    switch (mode) {
      case 'compound-interest':
        return this.compoundService.calculate(state.compoundInput);
      case 'regular-investment':
        return this.investmentService.calculateRegularInvestment(state.regularInput);
      case 'sip':
        return this.investmentService.calculateSip(state.sipInput);
      case 'step-up':
        return this.stepUpService.calculateStepUp(state.stepUpInput);
      case 'retirement':
        return this.retirementService.calculate(state.retirementInput);
      case 'inflation':
        return this.inflationService.calculate(state.inflationInput);
      case 'savings-goal':
        return this.savingsGoalService.calculate(state.savingsGoalInput);
      case 'swp':
        return this.swpService.calculate(state.swpInput);
      default:
        return this.stepUpService.calculateStepUp(state.stepUpInput);
    }
  }

  /**
   * Compares two calculation results (Scenario A vs Scenario B).
   */
  compareScenarios(scenarioA: CalculationResult, scenarioB: CalculationResult): ScenarioComparison {
    const deltaFutureValue = scenarioB.futureValue - scenarioA.futureValue;
    const deltaTotalInvested = scenarioB.totalInvested - scenarioA.totalInvested;
    const deltaTotalGrowth = scenarioB.totalGrowth - scenarioA.totalGrowth;

    const futureValuePercentageDifference =
      scenarioA.futureValue > 0
        ? ((scenarioB.futureValue - scenarioA.futureValue) / scenarioA.futureValue) * 100
        : 0;

    return {
      scenarioA,
      scenarioB,
      deltaFutureValue,
      deltaTotalInvested,
      deltaTotalGrowth,
      futureValuePercentageDifference
    };
  }
}
