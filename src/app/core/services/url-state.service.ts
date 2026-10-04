import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  CalculationMode,
  CompoundingFrequency,
  ContributionFrequency,
  DurationUnit
} from '../calculator/models/calculator.types';
import { CalculatorState } from '../calculator/calculation-engine.service';

@Injectable({
  providedIn: 'root'
})
export class UrlStateService {
  private readonly router = inject(Router);

  /**
   * Generates URL query parameters from current calculation state.
   */
  getQueryParams(mode: CalculationMode, state: CalculatorState): Record<string, string | number> {
    switch (mode) {
      case 'compound-interest':
        return {
          p: state.compoundInput.initialInvestment,
          r: state.compoundInput.annualInterestRate,
          f: state.compoundInput.compoundingFrequency,
          d: state.compoundInput.duration,
          u: state.compoundInput.durationUnit,
          i: state.compoundInput.inflationRate || 0
        };
      case 'regular-investment':
        return {
          p: state.regularInput.initialInvestment,
          m: state.regularInput.regularContribution,
          cf: state.regularInput.contributionFrequency,
          r: state.regularInput.expectedAnnualReturn,
          d: state.regularInput.durationYears,
          i: state.regularInput.inflationRate || 0
        };
      case 'sip':
        return {
          m: state.sipInput.startingMonthlyInvestment,
          p: state.sipInput.initialInvestment || 0,
          r: state.sipInput.expectedAnnualReturn,
          d: state.sipInput.durationYears,
          i: state.sipInput.inflationRate || 0
        };
      case 'step-up':
        return {
          m: state.stepUpInput.startingMonthlyInvestment,
          stepup: state.stepUpInput.annualStepUpPercent,
          r: state.stepUpInput.expectedAnnualReturn,
          d: state.stepUpInput.durationYears,
          p: state.stepUpInput.initialInvestment || 0,
          i: state.stepUpInput.inflationRate || 0
        };
      case 'retirement':
        return {
          age: state.retirementInput.currentAge,
          retirement: state.retirementInput.retirementAge,
          corpus: state.retirementInput.currentCorpus,
          monthly: state.retirementInput.startingMonthlyInvestment,
          stepup: state.retirementInput.annualStepUpPercent,
          return: state.retirementInput.expectedAnnualReturn,
          inflation: state.retirementInput.inflationRate,
          expense: state.retirementInput.currentMonthlyExpense || 0
        };
      case 'inflation':
        return {
          amount: state.inflationInput.currentAmount,
          rate: state.inflationInput.inflationRate,
          years: state.inflationInput.years
        };
      case 'savings-goal':
        return {
          target: state.savingsGoalInput.targetAmount,
          savings: state.savingsGoalInput.currentSavings,
          return: state.savingsGoalInput.expectedAnnualReturn,
          duration: state.savingsGoalInput.durationYears,
          frequency: state.savingsGoalInput.contributionFrequency,
          inflation: state.savingsGoalInput.inflationRate || 0
        };
      case 'swp':
        return {
          corpus: state.swpInput.initialCorpus,
          withdrawal: state.swpInput.monthlyWithdrawal,
          return: state.swpInput.expectedAnnualReturn,
          duration: state.swpInput.durationYears,
          stepup: state.swpInput.annualWithdrawalIncreasePercent || 0,
          inflation: state.swpInput.inflationRate || 0
        };
      default:
        return {};
    }
  }

  private isInternalSync = false;
  private syncTimeout: any = null;

  get isSyncing(): boolean {
    return this.isInternalSync;
  }

  private safeNumber(val: any, fallback?: number): number | undefined {
    if (val === undefined || val === null || val === '') return fallback;
    const num = Number(val);
    return isNaN(num) ? fallback : num;
  }

  /**
   * Applies query params from URL into calculator state.
   */
  applyQueryParams(params: Record<string, string>, state: CalculatorState, mode: CalculationMode): CalculatorState {
    const updated = { ...state };

    const getNum = (key: string): number | undefined => this.safeNumber(params[key]);

    switch (mode) {
      case 'compound-interest':
        if (getNum('p') !== undefined) updated.compoundInput.initialInvestment = getNum('p')!;
        if (getNum('r') !== undefined) updated.compoundInput.annualInterestRate = getNum('r')!;
        if (params['f'] !== undefined) updated.compoundInput.compoundingFrequency = params['f'] as CompoundingFrequency;
        if (getNum('d') !== undefined) updated.compoundInput.duration = getNum('d')!;
        if (params['u'] !== undefined) updated.compoundInput.durationUnit = params['u'] as DurationUnit;
        if (getNum('i') !== undefined) updated.compoundInput.inflationRate = getNum('i')!;
        break;
      case 'regular-investment':
        if (getNum('p') !== undefined) updated.regularInput.initialInvestment = getNum('p')!;
        if (getNum('m') !== undefined) updated.regularInput.regularContribution = getNum('m')!;
        if (params['cf'] !== undefined) updated.regularInput.contributionFrequency = params['cf'] as ContributionFrequency;
        if (getNum('r') !== undefined) updated.regularInput.expectedAnnualReturn = getNum('r')!;
        if (getNum('d') !== undefined) updated.regularInput.durationYears = getNum('d')!;
        if (getNum('i') !== undefined) updated.regularInput.inflationRate = getNum('i')!;
        break;
      case 'sip':
        if (getNum('m') !== undefined) updated.sipInput.startingMonthlyInvestment = getNum('m')!;
        if (getNum('p') !== undefined) updated.sipInput.initialInvestment = getNum('p')!;
        if (getNum('r') !== undefined) updated.sipInput.expectedAnnualReturn = getNum('r')!;
        if (getNum('d') !== undefined) updated.sipInput.durationYears = getNum('d')!;
        if (getNum('i') !== undefined) updated.sipInput.inflationRate = getNum('i')!;
        break;
      case 'step-up':
        if (getNum('m') !== undefined) updated.stepUpInput.startingMonthlyInvestment = getNum('m')!;
        if (getNum('stepup') !== undefined) updated.stepUpInput.annualStepUpPercent = getNum('stepup')!;
        if (getNum('r') !== undefined) updated.stepUpInput.expectedAnnualReturn = getNum('r')!;
        if (getNum('d') !== undefined) updated.stepUpInput.durationYears = getNum('d')!;
        if (getNum('p') !== undefined) updated.stepUpInput.initialInvestment = getNum('p')!;
        if (getNum('i') !== undefined) updated.stepUpInput.inflationRate = getNum('i')!;
        break;
      case 'retirement':
        if (getNum('age') !== undefined) updated.retirementInput.currentAge = getNum('age')!;
        if (getNum('retirement') !== undefined) updated.retirementInput.retirementAge = getNum('retirement')!;
        if (getNum('corpus') !== undefined) updated.retirementInput.currentCorpus = getNum('corpus')!;
        if (getNum('monthly') !== undefined) updated.retirementInput.startingMonthlyInvestment = getNum('monthly')!;
        if (getNum('stepup') !== undefined) updated.retirementInput.annualStepUpPercent = getNum('stepup')!;
        if (getNum('return') !== undefined) updated.retirementInput.expectedAnnualReturn = getNum('return')!;
        if (getNum('inflation') !== undefined) updated.retirementInput.inflationRate = getNum('inflation')!;
        if (getNum('expense') !== undefined) updated.retirementInput.currentMonthlyExpense = getNum('expense')!;
        break;
      case 'inflation':
        if (getNum('amount') !== undefined) updated.inflationInput.currentAmount = getNum('amount')!;
        if (getNum('rate') !== undefined) updated.inflationInput.inflationRate = getNum('rate')!;
        if (getNum('years') !== undefined) updated.inflationInput.years = getNum('years')!;
        break;
      case 'savings-goal':
        if (getNum('target') !== undefined) updated.savingsGoalInput.targetAmount = getNum('target')!;
        if (getNum('savings') !== undefined) updated.savingsGoalInput.currentSavings = getNum('savings')!;
        if (getNum('return') !== undefined) updated.savingsGoalInput.expectedAnnualReturn = getNum('return')!;
        if (getNum('duration') !== undefined) updated.savingsGoalInput.durationYears = getNum('duration')!;
        if (params['frequency'] !== undefined) updated.savingsGoalInput.contributionFrequency = params['frequency'] as ContributionFrequency;
        if (getNum('inflation') !== undefined) updated.savingsGoalInput.inflationRate = getNum('inflation')!;
        break;
      case 'swp':
        if (getNum('corpus') !== undefined) updated.swpInput.initialCorpus = getNum('corpus')!;
        if (getNum('withdrawal') !== undefined) updated.swpInput.monthlyWithdrawal = getNum('withdrawal')!;
        if (getNum('return') !== undefined) updated.swpInput.expectedAnnualReturn = getNum('return')!;
        if (getNum('duration') !== undefined) updated.swpInput.durationYears = getNum('duration')!;
        if (getNum('stepup') !== undefined) updated.swpInput.annualWithdrawalIncreasePercent = getNum('stepup')!;
        if (getNum('inflation') !== undefined) updated.swpInput.inflationRate = getNum('inflation')!;
        break;
    }

    return updated;
  }

  /**
   * Syncs the URL query parameters without reloading the page.
   * Debounces by default to prevent navigation floods while typing.
   */
  syncUrl(mode: CalculationMode, state: CalculatorState, pathname: string, immediate = false): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }

    const performSync = () => {
      const queryParams = this.getQueryParams(mode, state);
      this.isInternalSync = true;
      this.router.navigate([pathname], {
        queryParams,
        replaceUrl: true
      }).finally(() => {
        setTimeout(() => {
          this.isInternalSync = false;
        }, 150);
      });
    };

    if (immediate) {
      performSync();
    } else {
      this.syncTimeout = setTimeout(performSync, 400);
    }
  }

  /**
   * Returns a full shareable link string.
   */
  getShareableUrl(mode: CalculationMode, state: CalculatorState, routePath: string): string {
    const queryParams = this.getQueryParams(mode, state);
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      searchParams.set(key, String(value));
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://compoundcalc.genpoputils.com';
    return `${origin}${routePath}?${searchParams.toString()}`;
  }
}
