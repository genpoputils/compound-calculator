import { describe, expect, it } from 'vitest';
import { calculateEmi, calculateMaxLoanFromEmi, calculateTenureFromEmi } from './emi';
import { generateAmortizationSchedule, buildAnnualSummary } from './amortization';
import { simulatePrepayment, formatMonthsToYearsAndMonths } from './prepayment';
import { calculateCompoundInterest } from './compound-interest';
import { calculateSip, calculateRegularInvestment } from './sip';
import { calculateStepUpSip, compareFlatVsStepUp } from './step-up-sip';
import { calculateRetirement } from './retirement';
import { calculateInflation } from './inflation';
import { calculateSavingsGoal } from './savings-goal';

describe('Pure Finance Engines', () => {
  describe('EMI Engine', () => {
    it('should calculate standard reducing-balance EMI accurately (Prompt Benchmark: ₹50L @ 8.5% for 20 years)', () => {
      // Benchmark: ₹50,00,000 at 8.5% for 240 months
      // Formula: P * r * (1+r)^n / ((1+r)^n - 1)
      // r = 8.5 / 12 / 100 = 0.00708333...
      // Expected EMI = ₹43,391.14 (rounds to ₹43,391)
      const res = calculateEmi({
        loanAmount: 5000000,
        annualInterestRate: 8.5,
        tenureMonths: 240
      });

      expect(Math.round(res.monthlyEmi)).toBe(43391);
      expect(res.principal).toBe(5000000);
      expect(res.totalPayment).toBeCloseTo(43391.14 * 240, -2);
      expect(res.totalInterest).toBeCloseTo(res.totalPayment - 5000000, 2);
      // Total interest should be ~₹54.1 Lakh
      expect(Math.round(res.totalInterest / 100000)).toBe(54);
    });

    it('should handle zero-interest loans accurately without division by zero', () => {
      const res = calculateEmi({
        loanAmount: 120000,
        annualInterestRate: 0,
        tenureMonths: 12
      });

      expect(res.monthlyEmi).toBe(10000);
      expect(res.totalInterest).toBe(0);
      expect(res.totalPayment).toBe(120000);
    });

    it('should handle 1-year and 30-year loans correctly', () => {
      const res1Yr = calculateEmi({
        loanAmount: 100000,
        annualInterestRate: 12,
        tenureMonths: 12
      });
      // 100k at 12% for 1 yr -> EMI = ₹8,885
      expect(Math.round(res1Yr.monthlyEmi)).toBe(8885);

      const res30Yr = calculateEmi({
        loanAmount: 7500000,
        annualInterestRate: 9,
        tenureMonths: 360
      });
      expect(res30Yr.monthlyEmi).toBeGreaterThan(0);
      expect(res30Yr.totalInterest).toBeGreaterThan(7500000); // 30-year interest typically exceeds principal
    });

    it('should handle invalid or zero inputs gracefully without NaN or Infinity', () => {
      const res = calculateEmi({
        loanAmount: 0,
        annualInterestRate: 8.5,
        tenureMonths: 0
      });
      expect(res.monthlyEmi).toBe(0);
      expect(res.totalInterest).toBe(0);
      expect(isFinite(res.monthlyEmi)).toBe(true);
    });

    it('should calculate max affordable loan and required tenure from target EMI', () => {
      const maxLoan = calculateMaxLoanFromEmi(43391.14, 8.5, 240);
      expect(maxLoan).toBeCloseTo(5000000, -2);

      const tenure = calculateTenureFromEmi(5000000, 8.5, 43391.14);
      expect(tenure).toBe(240);
    });
  });

  describe('Amortization Schedule Engine', () => {
    it('should satisfy strict financial conservation invariants', () => {
      const loan = 1000000;
      const res = generateAmortizationSchedule({
        loanAmount: loan,
        annualInterestRate: 9.5,
        tenureMonths: 60
      });

      expect(res.monthlySchedule.length).toBe(60);

      // Invariant 1: Total principal paid must equal original loan principal
      expect(Math.round(res.totalPrincipalPaid)).toBe(loan);

      // Invariant 2: Total payments must equal principal + interest
      expect(res.totalPayment).toBeCloseTo(res.totalPrincipalPaid + res.totalInterestPaid, 2);

      // Invariant 3: Final balance of last payment must be 0
      const lastRow = res.monthlySchedule[res.monthlySchedule.length - 1];
      expect(lastRow.closingBalance).toBe(0);

      // Invariant 4: Opening balance of month m+1 must equal closing balance of month m
      for (let i = 0; i < res.monthlySchedule.length - 1; i++) {
        expect(res.monthlySchedule[i + 1].openingBalance).toBe(res.monthlySchedule[i].closingBalance);
      }
    });

    it('should generate valid annual summary aggregating monthly rows', () => {
      const res = generateAmortizationSchedule({
        loanAmount: 2400000,
        annualInterestRate: 8,
        tenureMonths: 24
      });

      expect(res.annualSchedule.length).toBe(2);
      expect(res.annualSchedule[0].yearNumber).toBe(1);
      expect(res.annualSchedule[1].yearNumber).toBe(2);
      expect(res.annualSchedule[1].closingBalance).toBe(0);
    });
  });

  describe('Loan Prepayment Simulator (Flagship Feature)', () => {
    it('should accurately calculate interest and tenure saved (Prompt Benchmark: ₹50L @ 8.5% for 20 yrs with ₹5L prepayment at month 36)', () => {
      // Benchmark from User Prompt:
      // ₹50,00,000 @ 8.5% for 20 years (240 months).
      // Prepay ₹5,00,000 at month 36.
      // Mode: Reduce Tenure.
      const sim = simulatePrepayment({
        loanAmount: 5000000,
        annualInterestRate: 8.5,
        tenureMonths: 240,
        mode: 'reduce-tenure',
        oneTimePrepaymentAmount: 500000,
        oneTimePrepaymentMonth: 36
      });

      // Original loan metrics
      expect(Math.round(sim.originalLoan.monthlyEmi)).toBe(43391);
      expect(sim.originalLoan.tenureMonths).toBe(240);

      // Tenure should reduce by ~41 months (~3 years 5 months)
      expect(sim.monthsSaved).toBeGreaterThanOrEqual(40);
      expect(sim.monthsSaved).toBeLessThanOrEqual(45);
      expect(sim.yearsSavedFormatted).toContain('3 years');

      // Interest saved should be significant (~₹12 Lakh+)
      expect(sim.interestSaved).toBeGreaterThan(1150000);
      expect(sim.interestSaved).toBeLessThan(1350000);

      // Invariant: Total principal paid with prepayment must equal 50L
      expect(Math.round(sim.prepaidLoan.totalPrincipal)).toBe(5000000);
      expect(sim.monthlySchedule[sim.monthlySchedule.length - 1].closingBalance).toBe(0);
    });

    it('should support Mode B: Reduce EMI and keep tenure same', () => {
      const sim = simulatePrepayment({
        loanAmount: 5000000,
        annualInterestRate: 8.5,
        tenureMonths: 240,
        mode: 'reduce-emi',
        oneTimePrepaymentAmount: 500000,
        oneTimePrepaymentMonth: 36
      });

      // With Mode B, tenure remains approximately 240 months
      expect(sim.prepaidLoan.tenureMonths).toBe(240);
      // New EMI after month 36 should be lower than baseline 43,391
      expect(sim.prepaidLoan.finalMonthlyEmi).toBeLessThan(43391);
      expect(sim.interestSaved).toBeGreaterThan(0);

      // Strategy comparison check: Tenure reduction must save more interest than EMI reduction
      expect(sim.strategyComparison.reduceTenureInterestSaved).toBeGreaterThan(
        sim.strategyComparison.reduceEmiInterestSaved
      );
      expect(sim.strategyComparison.recommendedStrategy).toBe('reduce-tenure');
    });

    it('should support Recurring Prepayments (e.g. ₹1 Lakh every year)', () => {
      const sim = simulatePrepayment({
        loanAmount: 3000000,
        annualInterestRate: 8.5,
        tenureMonths: 180, // 15 years
        mode: 'reduce-tenure',
        prepaymentFrequency: 'annually',
        recurringPrepaymentAmount: 100000,
        recurringStartMonth: 12
      });

      expect(sim.monthsSaved).toBeGreaterThan(30);
      expect(sim.interestSaved).toBeGreaterThan(500000);
      expect(sim.appliedPrepayments.length).toBeGreaterThan(3);
    });

    it('should support full loan closure when prepayment exceeds outstanding balance', () => {
      const sim = simulatePrepayment({
        loanAmount: 1000000,
        annualInterestRate: 9,
        tenureMonths: 60,
        mode: 'reduce-tenure',
        oneTimePrepaymentAmount: 2000000, // Prepayment far exceeds 10L loan
        oneTimePrepaymentMonth: 6
      });

      // Loan should close at month 6
      expect(sim.prepaidLoan.tenureMonths).toBe(6);
      expect(sim.monthsSaved).toBe(54);
      // Prepayment applied should be capped to outstanding balance (no negative closing balance)
      const lastRow = sim.monthlySchedule[sim.monthlySchedule.length - 1];
      expect(lastRow.closingBalance).toBe(0);
      expect(Math.round(sim.prepaidLoan.totalPrincipal)).toBe(1000000);
    });

    it('should handle upfront prepayment before first EMI (month 0)', () => {
      const sim = simulatePrepayment({
        loanAmount: 2000000,
        annualInterestRate: 8,
        tenureMonths: 120,
        mode: 'reduce-tenure',
        oneTimePrepaymentAmount: 500000,
        oneTimePrepaymentMonth: 0
      });

      expect(sim.interestSaved).toBeGreaterThan(0);
      expect(sim.monthsSaved).toBeGreaterThan(0);
    });

    it('should handle annual EMI step-up (increasing EMI by 5% every year)', () => {
      const sim = simulatePrepayment({
        loanAmount: 4000000,
        annualInterestRate: 8.5,
        tenureMonths: 240,
        mode: 'reduce-tenure',
        annualEmiIncreasePercent: 5
      });

      expect(sim.monthsSaved).toBeGreaterThan(50);
      expect(sim.interestSaved).toBeGreaterThan(1000000);
    });

    it('should calculate zero prepayment accurately without deviations or drift', () => {
      const sim = simulatePrepayment({
        loanAmount: 5000000,
        annualInterestRate: 8.5,
        tenureMonths: 240,
        mode: 'reduce-tenure',
        oneTimePrepaymentAmount: 0,
        recurringPrepaymentAmount: 0
      });

      expect(sim.interestSaved).toBe(0);
      expect(sim.monthsSaved).toBe(0);
      expect(sim.totalAmountSaved).toBe(0);
      expect(sim.appliedPrepayments.length).toBe(0);
      expect(sim.prepaidLoan.monthlyEmi).toBe(sim.originalLoan.monthlyEmi);
      expect(sim.prepaidLoan.totalInterest).toBe(sim.originalLoan.totalInterest);
      expect(sim.prepaidLoan.totalPayment).toBe(sim.originalLoan.totalPayment);
      expect(sim.prepaidLoan.tenureMonths).toBe(sim.originalLoan.tenureMonths);
      expect(sim.strategyComparison.reduceTenureInterestSaved).toBe(0);
      expect(sim.strategyComparison.reduceEmiInterestSaved).toBe(0);
      expect(sim.strategyComparison.diffInterest).toBe(0);
      expect(sim.strategyComparison.recommendationReason).toContain('No prepayments currently scheduled');
    });
  });

  describe('Compound Interest Engine', () => {
    it('should calculate annual and monthly compounding correctly', () => {
      const res = calculateCompoundInterest({
        initialInvestment: 100000,
        annualInterestRate: 10,
        compoundingFrequency: 'annually',
        duration: 3,
        durationUnit: 'years',
        inflationRate: 6
      });

      // 100,000 * 1.1^3 = 133,100
      expect(Math.round(res.futureValue)).toBe(133100);
      expect(Math.round(res.totalGrowth)).toBe(33100);
      expect(res.realFutureValue).toBeLessThan(res.futureValue);
    });
  });

  describe('SIP and Step-Up Engines', () => {
    it('should calculate standard monthly SIP correctly', () => {
      const res = calculateSip({
        startingMonthlyInvestment: 10000,
        expectedAnnualReturn: 12,
        durationYears: 10
      });

      expect(res.totalInvested).toBe(1200000);
      expect(res.futureValue).toBeGreaterThan(2000000);
    });

    it('should compare Flat SIP vs Step-Up SIP accurately', () => {
      const comp = compareFlatVsStepUp({
        startingMonthlyInvestment: 20000,
        annualStepUpPercent: 10,
        expectedAnnualReturn: 12,
        durationYears: 20
      });

      expect(comp.extraWealthCreated).toBeGreaterThan(0);
      expect(comp.stepUpSip.futureValue).toBeGreaterThan(comp.flatSip.futureValue);
      expect(comp.percentageCorpusIncrease).toBeGreaterThan(50);
    });
  });

  describe('Retirement Engine', () => {
    it('should project inflation-adjusted expense and determine surplus/shortfall', () => {
      const res = calculateRetirement({
        currentAge: 30,
        retirementAge: 60,
        currentCorpus: 1000000,
        currentMonthlyExpense: 50000,
        expectedInflation: 6,
        preRetirementReturn: 12,
        postRetirementReturn: 8,
        retirementDurationYears: 25,
        monthlyInvestment: 30000,
        annualInvestmentIncreasePercent: 10
      });

      expect(res.accumulationYears).toBe(30);
      expect(res.futureMonthlyExpenseAtRetirement).toBeGreaterThan(50000 * 5); // 1.06^30 ~ 5.74x
      expect(res.requiredCorpus).toBeGreaterThan(0);
      expect(res.projectedCorpus).toBeGreaterThan(0);
      expect(res.status).toBeDefined();
    });
  });

  describe('Inflation and Savings Goal Engines', () => {
    it('should calculate inflation future cost and today purchasing power', () => {
      const res = calculateInflation({
        currentAmount: 100000,
        inflationRate: 6,
        years: 10
      });

      // 100,000 * 1.06^10 = 179,084.77
      expect(Math.round(res.futureCostOfAmount)).toBe(179085);
      expect(Math.round(res.todayPurchasingPowerOfFuture)).toBe(55839);
    });

    it('should calculate required savings to reach financial target', () => {
      const res = calculateSavingsGoal({
        targetAmount: 5000000,
        currentSavings: 500000,
        expectedAnnualReturn: 12,
        durationYears: 10,
        contributionFrequency: 'monthly'
      });

      expect(res.requiredContribution).toBeGreaterThan(0);
      expect(res.futureValue).toBeGreaterThanOrEqual(4999900);
    });
  });
});
