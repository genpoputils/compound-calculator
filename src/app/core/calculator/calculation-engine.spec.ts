import { TestBed } from '@angular/core/testing';
import { CalculationEngineService, DEFAULT_CALCULATOR_STATE } from './calculation-engine.service';
import { CompoundCalculatorService } from './compound-calculator.service';
import { InflationCalculatorService } from './inflation-calculator.service';
import { InvestmentCalculatorService } from './investment-calculator.service';
import { RetirementCalculatorService } from './retirement-calculator.service';
import { SavingsGoalCalculatorService } from './savings-goal-calculator.service';
import { StepUpCalculatorService } from './step-up-calculator.service';
import { SwpCalculatorService } from './swp-calculator.service';

describe('Financial Calculation Engine', () => {
  let engine: CalculationEngineService;
  let compoundService: CompoundCalculatorService;
  let investmentService: InvestmentCalculatorService;
  let stepUpService: StepUpCalculatorService;
  let retirementService: RetirementCalculatorService;
  let inflationService: InflationCalculatorService;
  let savingsGoalService: SavingsGoalCalculatorService;
  let swpService: SwpCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    engine = TestBed.inject(CalculationEngineService);
    compoundService = TestBed.inject(CompoundCalculatorService);
    investmentService = TestBed.inject(InvestmentCalculatorService);
    stepUpService = TestBed.inject(StepUpCalculatorService);
    retirementService = TestBed.inject(RetirementCalculatorService);
    inflationService = TestBed.inject(InflationCalculatorService);
    savingsGoalService = TestBed.inject(SavingsGoalCalculatorService);
    swpService = TestBed.inject(SwpCalculatorService);
  });

  describe('Compound Interest Mode', () => {
    it('should calculate annual compounding correctly (lump sum)', () => {
      // P = 1,00,000, r = 10%, n = 1, t = 2 years -> A = 1,00,000 * 1.1^2 = 1,21,000
      const res = compoundService.calculate({
        initialInvestment: 100000,
        annualInterestRate: 10,
        compoundingFrequency: 'annually',
        duration: 2,
        durationUnit: 'years',
        inflationRate: 0
      });

      expect(Math.round(res.futureValue)).toBe(121000);
      expect(Math.round(res.totalGrowth)).toBe(21000);
      expect(res.breakdown.length).toBe(2);
      expect(Math.round(res.breakdown[0].portfolioValue)).toBe(110000);
      expect(Math.round(res.breakdown[1].portfolioValue)).toBe(121000);
    });

    it('should handle 0% interest rate without errors', () => {
      const res = compoundService.calculate({
        initialInvestment: 50000,
        annualInterestRate: 0,
        compoundingFrequency: 'monthly',
        duration: 5,
        durationUnit: 'years',
        inflationRate: 5
      });

      expect(res.futureValue).toBe(50000);
      expect(res.totalGrowth).toBe(0);
      expect(res.realFutureValue).toBeLessThan(50000);
    });

    it('should handle zero or negative inputs gracefully', () => {
      const res = compoundService.calculate({
        initialInvestment: -100,
        annualInterestRate: -5,
        compoundingFrequency: 'annually',
        duration: 0,
        durationUnit: 'years'
      });

      expect(res.futureValue).toBe(0);
      expect(res.totalInvested).toBe(0);
    });

    it('should calculate monthly duration accurately', () => {
      const res = compoundService.calculate({
        initialInvestment: 100000,
        annualInterestRate: 12,
        compoundingFrequency: 'monthly',
        duration: 6,
        durationUnit: 'months'
      });

      // 6 months at 12% compounded monthly: (1 + 0.01)^6 = 1.06152015
      expect(Math.round(res.futureValue)).toBe(106152);
    });
  });

  describe('SIP and Regular Investment Mode', () => {
    it('should calculate standard monthly SIP correctly', () => {
      // ₹10,000/month for 1 year at 12% annual return
      const res = investmentService.calculateSip({
        startingMonthlyInvestment: 10000,
        initialInvestment: 0,
        expectedAnnualReturn: 12,
        durationYears: 1
      });

      expect(res.totalInvested).toBe(120000);
      expect(res.futureValue).toBeGreaterThan(120000);
      expect(res.totalGrowth).toBeGreaterThan(0);
      expect(res.breakdown.length).toBe(1);
    });

    it('should handle lump sum + monthly contributions combined', () => {
      const res = investmentService.calculateRegularInvestment({
        initialInvestment: 50000,
        regularContribution: 5000,
        contributionFrequency: 'monthly',
        expectedAnnualReturn: 10,
        durationYears: 2,
        compoundingFrequency: 'monthly'
      });

      expect(res.totalInvested).toBe(50000 + 5000 * 24);
      expect(res.futureValue).toBeGreaterThan(res.totalInvested);
      expect(res.breakdown.length).toBe(2);
    });

    it('should support quarterly and yearly contribution frequencies', () => {
      const resQuarterly = investmentService.calculateRegularInvestment({
        initialInvestment: 0,
        regularContribution: 30000,
        contributionFrequency: 'quarterly',
        expectedAnnualReturn: 12,
        durationYears: 1,
        compoundingFrequency: 'monthly'
      });

      // 4 quarters in 1 year = 4 * 30,000 = 120,000
      expect(resQuarterly.totalInvested).toBe(120000);
    });
  });

  describe('Step-Up Investment Mode (Crucial Feature)', () => {
    it('should increment monthly contribution annually by step-up %', () => {
      const res = stepUpService.calculateStepUp({
        startingMonthlyInvestment: 20000,
        annualStepUpPercent: 10,
        expectedAnnualReturn: 12,
        durationYears: 4,
        initialInvestment: 0
      });

      expect(res.breakdown.length).toBe(4);
      // Year 1 monthly = 20,000
      expect(Math.round(res.breakdown[0].monthlyContribution)).toBe(20000);
      // Year 2 monthly = 22,000
      expect(Math.round(res.breakdown[1].monthlyContribution)).toBe(22000);
      // Year 3 monthly = 24,200
      expect(Math.round(res.breakdown[2].monthlyContribution)).toBe(24200);
      // Year 4 monthly = 26,620
      expect(Math.round(res.breakdown[3].monthlyContribution)).toBe(26620);

      // Total invested over 4 years:
      // Year 1: 20,000 * 12 = 240,000
      // Year 2: 22,000 * 12 = 264,000
      // Year 3: 24,200 * 12 = 290,400
      // Year 4: 26,620 * 12 = 319,440
      // Total = 1,113,840
      expect(Math.round(res.totalInvested)).toBe(1113840);
      expect(res.futureValue).toBeGreaterThan(res.totalInvested);
    });

    it('should handle 0% step-up as regular SIP', () => {
      const res = stepUpService.calculateStepUp({
        startingMonthlyInvestment: 10000,
        annualStepUpPercent: 0,
        expectedAnnualReturn: 12,
        durationYears: 3,
        initialInvestment: 0
      });

      expect(res.breakdown[0].monthlyContribution).toBe(10000);
      expect(res.breakdown[1].monthlyContribution).toBe(10000);
      expect(res.breakdown[2].monthlyContribution).toBe(10000);
      expect(res.totalInvested).toBe(10000 * 36);
    });
  });

  describe('Retirement Savings Mode', () => {
    it('should compute nominal corpus and inflation-adjusted purchasing power accurately', () => {
      const res = retirementService.calculate({
        currentAge: 29,
        retirementAge: 45,
        currentCorpus: 500000,
        startingMonthlyInvestment: 20000,
        annualStepUpPercent: 10,
        expectedAnnualReturn: 12,
        inflationRate: 6,
        currentMonthlyExpense: 40000
      });

      expect(res.durationYears).toBe(16);
      expect(res.futureValue).toBeGreaterThan(res.totalInvested);
      // Real value must be discounted by 1.06^16
      const expectedReal = res.futureValue / Math.pow(1.06, 16);
      expect(Math.round(res.realFutureValue)).toBe(Math.round(expectedReal));
      expect(res.metadata?.estimatedRetirementMonthlyExpense).toBeGreaterThan(40000);
      expect(res.metadata?.monthlyPurchasingPowerAtRetirement).toBeGreaterThan(0);
    });
  });

  describe('Inflation Calculator Mode', () => {
    it('should calculate future equivalent cost and eroding purchasing power', () => {
      const res = inflationService.calculate({
        currentAmount: 100000,
        inflationRate: 6,
        years: 20
      });

      // 100,000 * 1.06^20 = 320,713.55
      expect(Math.round(res.futureValue)).toBe(320714);
      // Purchasing power of 100,000 in 20 years: 100,000 / 1.06^20 = 31,180.47
      expect(Math.round(res.realFutureValue)).toBe(31180);
      expect(res.breakdown.length).toBe(20);
    });
  });

  describe('Savings Goal Calculator Mode', () => {
    it('should calculate required contribution to meet future corpus', () => {
      const target = 5000000;
      const res = savingsGoalService.calculate({
        targetAmount: target,
        currentSavings: 200000,
        expectedAnnualReturn: 12,
        durationYears: 10,
        contributionFrequency: 'monthly',
        inflationRate: 6
      });

      expect(res.metadata?.requiredContribution).toBeGreaterThan(0);
      // With this required contribution, future value should reach or slightly exceed target
      expect(Math.round(res.futureValue)).toBeGreaterThanOrEqual(target - 50);
    });

    it('should require 0 contribution if current savings already exceed target with growth', () => {
      const res = savingsGoalService.calculate({
        targetAmount: 100000,
        currentSavings: 200000,
        expectedAnnualReturn: 10,
        durationYears: 5,
        contributionFrequency: 'monthly'
      });

      expect(res.metadata?.requiredContribution).toBe(0);
    });
  });

  describe('Scenario Comparison', () => {
    it('should compute deltas between Scenario A and Scenario B', () => {
      const stateA = {
        ...DEFAULT_CALCULATOR_STATE,
        stepUpInput: {
          ...DEFAULT_CALCULATOR_STATE.stepUpInput,
          annualStepUpPercent: 5
        }
      };
      const stateB = {
        ...DEFAULT_CALCULATOR_STATE,
        stepUpInput: {
          ...DEFAULT_CALCULATOR_STATE.stepUpInput,
          annualStepUpPercent: 10
        }
      };

      const resultA = engine.calculate('step-up', stateA);
      const resultB = engine.calculate('step-up', stateB);
      const comparison = engine.compareScenarios(resultA, resultB);

      expect(comparison.deltaFutureValue).toBeGreaterThan(0);
      expect(comparison.deltaTotalInvested).toBeGreaterThan(0);
      expect(comparison.futureValuePercentageDifference).toBeGreaterThan(0);
    });
  });

  describe('SWP (Systematic Withdrawal Plan) Mode', () => {
    it('should simulate monthly withdrawals and remaining balance correctly', () => {
      const res = swpService.calculate({
        initialCorpus: 5000000,
        monthlyWithdrawal: 25000,
        expectedAnnualReturn: 8,
        durationYears: 10,
        annualWithdrawalIncreasePercent: 0,
        inflationRate: 6
      });

      // 25,000 * 12 * 10 = 3,000,000 withdrawn
      expect(res.totalInvested).toBe(3000000);
      // Because return 8% on ~5M is ~400k/yr, and withdrawal is 300k/yr, corpus should grow!
      expect(res.futureValue).toBeGreaterThan(5000000);
      expect(res.totalGrowth).toBeGreaterThan(0);
      expect(res.metadata?.isDepleted).toBe(false);
      expect(res.breakdown.length).toBe(10);
      expect(res.breakdown[0].portfolioValue).toBeGreaterThan(5000000);
    });

    it('should detect portfolio depletion when withdrawals exceed sustainable rate', () => {
      const res = swpService.calculate({
        initialCorpus: 1000000,
        monthlyWithdrawal: 100000,
        expectedAnnualReturn: 6,
        durationYears: 10,
        annualWithdrawalIncreasePercent: 0,
        inflationRate: 5
      });

      expect(res.metadata?.isDepleted).toBe(true);
      expect(res.metadata?.depletionYear).toBe(1);
      expect(res.futureValue).toBe(0);
      expect(res.realFutureValue).toBe(0);
    });

    it('should support annual withdrawal step-up (inflation adjusted)', () => {
      const resWithoutStepUp = swpService.calculate({
        initialCorpus: 10000000,
        monthlyWithdrawal: 40000,
        expectedAnnualReturn: 8,
        durationYears: 5,
        annualWithdrawalIncreasePercent: 0,
        inflationRate: 6
      });

      const resWithStepUp = swpService.calculate({
        initialCorpus: 10000000,
        monthlyWithdrawal: 40000,
        expectedAnnualReturn: 8,
        durationYears: 5,
        annualWithdrawalIncreasePercent: 5,
        inflationRate: 6
      });

      expect(resWithStepUp.totalInvested).toBeGreaterThan(resWithoutStepUp.totalInvested);
      expect(resWithStepUp.futureValue).toBeLessThan(resWithoutStepUp.futureValue);
    });

    it('should integrate into CalculationEngineService calculate call', () => {
      const state = {
        ...DEFAULT_CALCULATOR_STATE,
        swpInput: {
          initialCorpus: 2000000,
          monthlyWithdrawal: 15000,
          expectedAnnualReturn: 7,
          durationYears: 5,
          annualWithdrawalIncreasePercent: 0,
          inflationRate: 5
        }
      };

      const result = engine.calculate('swp', state);
      expect(result.mode).toBe('swp');
      expect(result.durationYears).toBe(5);
      expect(result.totalInvested).toBe(15000 * 12 * 5);
      expect(result.futureValue).toBeGreaterThan(0);
    });
  });
});
