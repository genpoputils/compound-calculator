import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UrlStateService } from './url-state.service';
import { DEFAULT_CALCULATOR_STATE } from '../calculator/calculation-engine.service';

describe('UrlStateService', () => {
  let service: UrlStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    service = TestBed.inject(UrlStateService);
  });

  it('should encode step-up parameters into query params', () => {
    const params = service.getQueryParams('step-up', DEFAULT_CALCULATOR_STATE);
    expect(params['m']).toBe(20000);
    expect(params['stepup']).toBe(10);
    expect(params['r']).toBe(12);
    expect(params['d']).toBe(20);
  });

  it('should restore step-up parameters from query params', () => {
    const mockParams = {
      m: '25000',
      stepup: '12',
      r: '14',
      d: '18'
    };

    const restored = service.applyQueryParams(mockParams, DEFAULT_CALCULATOR_STATE, 'step-up');
    expect(restored.stepUpInput.startingMonthlyInvestment).toBe(25000);
    expect(restored.stepUpInput.annualStepUpPercent).toBe(12);
    expect(restored.stepUpInput.expectedAnnualReturn).toBe(14);
    expect(restored.stepUpInput.durationYears).toBe(18);
  });

  it('should encode and restore savings-goal parameters including inflation', () => {
    const params = service.getQueryParams('savings-goal', DEFAULT_CALCULATOR_STATE);
    expect(params['target']).toBe(5000000);
    expect(params['inflation']).toBe(6);

    const mockParams = {
      target: '10000000',
      savings: '500000',
      return: '15',
      duration: '12',
      frequency: 'monthly',
      inflation: '7'
    };

    const restored = service.applyQueryParams(mockParams, DEFAULT_CALCULATOR_STATE, 'savings-goal');
    expect(restored.savingsGoalInput.targetAmount).toBe(10000000);
    expect(restored.savingsGoalInput.currentSavings).toBe(500000);
    expect(restored.savingsGoalInput.expectedAnnualReturn).toBe(15);
    expect(restored.savingsGoalInput.durationYears).toBe(12);
    expect(restored.savingsGoalInput.inflationRate).toBe(7);
  });
});
