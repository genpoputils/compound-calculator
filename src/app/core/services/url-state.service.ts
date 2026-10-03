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

  /**
   * Applies query params from URL into calculator state.
   */
  applyQueryParams(params: Record<string, string>, state: CalculatorState, mode: CalculationMode): CalculatorState {
    const updated = { ...state };

    switch (mode) {
      case 'compound-interest':
        if (params['p'] !== undefined) updated.compoundInput.initialInvestment = Number(params['p']);
        if (params['r'] !== undefined) updated.compoundInput.annualInterestRate = Number(params['r']);
        if (params['f'] !== undefined) updated.compoundInput.compoundingFrequency = params['f'] as CompoundingFrequency;
        if (params['d'] !== undefined) updated.compoundInput.duration = Number(params['d']);
        if (params['u'] !== undefined) updated.compoundInput.durationUnit = params['u'] as DurationUnit;
        if (params['i'] !== undefined) updated.compoundInput.inflationRate = Number(params['i']);
        break;
      case 'regular-investment':
        if (params['p'] !== undefined) updated.regularInput.initialInvestment = Number(params['p']);
        if (params['m'] !== undefined) updated.regularInput.regularContribution = Number(params['m']);
        if (params['cf'] !== undefined) updated.regularInput.contributionFrequency = params['cf'] as ContributionFrequency;
        if (params['r'] !== undefined) updated.regularInput.expectedAnnualReturn = Number(params['r']);
        if (params['d'] !== undefined) updated.regularInput.durationYears = Number(params['d']);
        if (params['i'] !== undefined) updated.regularInput.inflationRate = Number(params['i']);
        break;
      case 'sip':
        if (params['m'] !== undefined) updated.sipInput.startingMonthlyInvestment = Number(params['m']);
        if (params['p'] !== undefined) updated.sipInput.initialInvestment = Number(params['p']);
        if (params['r'] !== undefined) updated.sipInput.expectedAnnualReturn = Number(params['r']);
        if (params['d'] !== undefined) updated.sipInput.durationYears = Number(params['d']);
        if (params['i'] !== undefined) updated.sipInput.inflationRate = Number(params['i']);
        break;
      case 'step-up':
        if (params['m'] !== undefined) updated.stepUpInput.startingMonthlyInvestment = Number(params['m']);
        if (params['stepup'] !== undefined) updated.stepUpInput.annualStepUpPercent = Number(params['stepup']);
        if (params['r'] !== undefined) updated.stepUpInput.expectedAnnualReturn = Number(params['r']);
        if (params['d'] !== undefined) updated.stepUpInput.durationYears = Number(params['d']);
        if (params['p'] !== undefined) updated.stepUpInput.initialInvestment = Number(params['p']);
        if (params['i'] !== undefined) updated.stepUpInput.inflationRate = Number(params['i']);
        break;
      case 'retirement':
        if (params['age'] !== undefined) updated.retirementInput.currentAge = Number(params['age']);
        if (params['retirement'] !== undefined) updated.retirementInput.retirementAge = Number(params['retirement']);
        if (params['corpus'] !== undefined) updated.retirementInput.currentCorpus = Number(params['corpus']);
        if (params['monthly'] !== undefined) updated.retirementInput.startingMonthlyInvestment = Number(params['monthly']);
        if (params['stepup'] !== undefined) updated.retirementInput.annualStepUpPercent = Number(params['stepup']);
        if (params['return'] !== undefined) updated.retirementInput.expectedAnnualReturn = Number(params['return']);
        if (params['inflation'] !== undefined) updated.retirementInput.inflationRate = Number(params['inflation']);
        if (params['expense'] !== undefined) updated.retirementInput.currentMonthlyExpense = Number(params['expense']);
        break;
      case 'inflation':
        if (params['amount'] !== undefined) updated.inflationInput.currentAmount = Number(params['amount']);
        if (params['rate'] !== undefined) updated.inflationInput.inflationRate = Number(params['rate']);
        if (params['years'] !== undefined) updated.inflationInput.years = Number(params['years']);
        break;
      case 'savings-goal':
        if (params['target'] !== undefined) updated.savingsGoalInput.targetAmount = Number(params['target']);
        if (params['savings'] !== undefined) updated.savingsGoalInput.currentSavings = Number(params['savings']);
        if (params['return'] !== undefined) updated.savingsGoalInput.expectedAnnualReturn = Number(params['return']);
        if (params['duration'] !== undefined) updated.savingsGoalInput.durationYears = Number(params['duration']);
        if (params['frequency'] !== undefined) updated.savingsGoalInput.contributionFrequency = params['frequency'] as ContributionFrequency;
        if (params['inflation'] !== undefined) updated.savingsGoalInput.inflationRate = Number(params['inflation']);
        break;
      case 'swp':
        if (params['corpus'] !== undefined) updated.swpInput.initialCorpus = Number(params['corpus']);
        if (params['withdrawal'] !== undefined) updated.swpInput.monthlyWithdrawal = Number(params['withdrawal']);
        if (params['return'] !== undefined) updated.swpInput.expectedAnnualReturn = Number(params['return']);
        if (params['duration'] !== undefined) updated.swpInput.durationYears = Number(params['duration']);
        if (params['stepup'] !== undefined) updated.swpInput.annualWithdrawalIncreasePercent = Number(params['stepup']);
        if (params['inflation'] !== undefined) updated.swpInput.inflationRate = Number(params['inflation']);
        break;
    }

    return updated;
  }

  /**
   * Syncs the URL query parameters without reloading the page.
   */
  syncUrl(mode: CalculationMode, state: CalculatorState, pathname: string): void {
    const queryParams = this.getQueryParams(mode, state);
    this.router.navigate([pathname], {
      queryParams,
      replaceUrl: true
    });
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
