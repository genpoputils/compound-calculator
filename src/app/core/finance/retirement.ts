/**
 * Pure TypeScript Financial Calculation Engine - Retirement Calculator
 * Zero external or Angular dependencies. Deterministic, client-side only.
 */

import { calculateStepUpSip, StepUpYearlyBreakdownItem } from './step-up-sip';

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentCorpus: number;
  currentMonthlyExpense: number;
  expectedInflation: number; // in percent, e.g. 6
  preRetirementReturn: number; // in percent, e.g. 12
  postRetirementReturn?: number; // in percent, e.g. 8 (default 8)
  retirementDurationYears?: number; // in years, e.g. 25-30 (default 25)
  monthlyInvestment: number;
  annualInvestmentIncreasePercent?: number; // in percent, e.g. 10
}

export type RetirementStatus = 'surplus' | 'on-track' | 'shortfall';

export interface RetirementResult {
  currentAge: number;
  retirementAge: number;
  accumulationYears: number;
  retirementDurationYears: number;

  // Expenses projection
  currentMonthlyExpense: number;
  futureMonthlyExpenseAtRetirement: number;
  futureAnnualExpenseAtRetirement: number;

  // Corpuses
  projectedCorpus: number;
  requiredCorpus: number;
  surplusOrShortfall: number; // positive = surplus, negative = shortfall

  // Status & Guidance
  status: RetirementStatus;
  statusReason: string;
  requiredMonthlySip: number; // Monthly SIP needed to reach required corpus without shortfall
  sustainableMonthlyWithdrawal: number; // 4% safe rule or annuity from projected corpus

  // Breakdown
  totalInvested: number;
  totalGrowth: number;
  realProjectedCorpus: number; // Inflation-adjusted value in today's money
  breakdown: StepUpYearlyBreakdownItem[];
}

/**
 * Calculates retirement corpus projection, required corpus, and gap analysis.
 */
export function calculateRetirement(input: RetirementInput): RetirementResult {
  const currentAge = Math.max(18, Math.round(Number(input.currentAge) || 25));
  const retirementAge = Math.max(currentAge + 1, Math.round(Number(input.retirementAge) || 60));
  const accumulationYears = retirementAge - currentAge;

  const currentCorpus = Math.max(0, Number(input.currentCorpus) || 0);
  const monthlyExpense = Math.max(0, Number(input.currentMonthlyExpense) || 0);
  const inflationPercent = Math.max(0, Number(input.expectedInflation) || 6);
  const inflation = inflationPercent / 100;

  const preReturn = Math.max(0, Number(input.preRetirementReturn) || 12);
  const postReturn = Math.max(0, Number(input.postRetirementReturn) || 8);
  const postReturnDecimal = postReturn / 100;

  const retirementYears = Math.max(5, Math.round(Number(input.retirementDurationYears) || 25));
  const monthlyInvestment = Math.max(0, Number(input.monthlyInvestment) || 0);
  const stepUpPercent = Math.max(0, Number(input.annualInvestmentIncreasePercent) || 0);

  // 1. Future monthly expense at retirement: E_ret = E_now * (1 + inflation)^years
  const futureMonthlyExpenseAtRetirement = roundCurrency(
    monthlyExpense * Math.pow(1 + inflation, accumulationYears)
  );
  const futureAnnualExpenseAtRetirement = roundCurrency(futureMonthlyExpenseAtRetirement * 12);

  // 2. Required Retirement Corpus
  // Using Capital Preservation / Real Rate of Return Annuity:
  // Real post-retirement rate = (1 + postReturn) / (1 + inflation) - 1
  let requiredCorpus = 0;
  if (futureAnnualExpenseAtRetirement > 0) {
    const realRate = (1 + postReturnDecimal) / (1 + inflation) - 1;
    if (Math.abs(realRate) < 0.0001) {
      // Real rate is approximately 0
      requiredCorpus = futureAnnualExpenseAtRetirement * retirementYears;
    } else {
      // Present Value of growing annuity (adjusting for inflation during retirement):
      // PV = AnnualExpense * [1 - (1 + realRate)^(-retirementYears)] / realRate
      const factor = 1 - Math.pow(1 + realRate, -retirementYears);
      requiredCorpus = (futureAnnualExpenseAtRetirement * factor) / realRate;
    }
  }
  requiredCorpus = roundCurrency(Math.max(0, requiredCorpus));

  // 3. Project Corpus with Monthly Investment & Step-up
  const stepUpResult = calculateStepUpSip(
    {
      startingMonthlyInvestment: monthlyInvestment,
      annualStepUpPercent: stepUpPercent,
      expectedAnnualReturn: preReturn,
      durationYears: accumulationYears,
      initialInvestment: currentCorpus,
      inflationRate: inflationPercent
    },
    { currentAge }
  );

  const projectedCorpus = roundCurrency(stepUpResult.futureValue);
  const realProjectedCorpus = roundCurrency(stepUpResult.realFutureValue);
  const surplusOrShortfall = roundCurrency(projectedCorpus - requiredCorpus);

  // 4. Status Determination
  let status: RetirementStatus = 'on-track';
  let statusReason = '';

  const threshold = requiredCorpus * 0.05; // 5% tolerance
  if (surplusOrShortfall > threshold) {
    status = 'surplus';
    statusReason = 'Your projected corpus exceeds your target corpus requirement. You are comfortably on track!';
  } else if (surplusOrShortfall < -threshold) {
    status = 'shortfall';
    statusReason = 'There is a projected shortfall against your target corpus requirement. Consider increasing your monthly investment or retirement age.';
  } else {
    status = 'on-track';
    statusReason = 'Your projected savings closely match your target corpus. Review annually to stay on course.';
  }

  // 5. Calculate Required Monthly SIP if there is a shortfall
  let requiredMonthlySip = monthlyInvestment;
  if (requiredCorpus > 0 && accumulationYears > 0) {
    const rMonthly = preReturn / 12 / 100;
    const nMonths = accumulationYears * 12;

    // FV of current corpus
    const fvCurrentCorpus = rMonthly === 0
      ? currentCorpus
      : currentCorpus * Math.pow(1 + rMonthly, nMonths);

    const neededFromSip = Math.max(0, requiredCorpus - fvCurrentCorpus);
    if (neededFromSip > 0) {
      if (rMonthly === 0) {
        requiredMonthlySip = neededFromSip / nMonths;
      } else {
        const annuityFactor = ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) * (1 + rMonthly);
        requiredMonthlySip = neededFromSip / annuityFactor;
      }
    } else {
      requiredMonthlySip = 0;
    }
  }

  // Sustainable monthly withdrawal (4% rule in real terms)
  const sustainableMonthlyWithdrawal = roundCurrency((realProjectedCorpus * 0.04) / 12);

  return {
    currentAge,
    retirementAge,
    accumulationYears,
    retirementDurationYears: retirementYears,
    currentMonthlyExpense: roundCurrency(monthlyExpense),
    futureMonthlyExpenseAtRetirement,
    futureAnnualExpenseAtRetirement,
    projectedCorpus,
    requiredCorpus,
    surplusOrShortfall,
    status,
    statusReason,
    requiredMonthlySip: roundCurrency(requiredMonthlySip),
    sustainableMonthlyWithdrawal,
    totalInvested: stepUpResult.totalInvested,
    totalGrowth: stepUpResult.totalGrowth,
    realProjectedCorpus,
    breakdown: stepUpResult.breakdown
  };
}

function roundCurrency(val: number): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  return Math.round(val * 100) / 100;
}
