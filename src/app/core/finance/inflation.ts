/**
 * Pure TypeScript Financial Calculation Engine - Inflation & Purchasing Power
 * Zero external or Angular dependencies. Deterministic, client-side only.
 */

export interface InflationInput {
  currentAmount: number;
  inflationRate: number; // in percent, e.g. 6
  years: number;
}

export interface InflationYearItem {
  year: number;
  futureCost: number; // What costs 'currentAmount' today will cost in year N
  purchasingPower: number; // What 'currentAmount' in year N will buy in today's money
  purchasingPowerLossPercent: number; // % loss of value
}

export interface InflationResult {
  currentAmount: number;
  inflationRate: number;
  years: number;
  futureCostOfAmount: number; // Future equivalent cost
  todayPurchasingPowerOfFuture: number; // Real purchasing power
  costMultiplier: number; // e.g. 3.2x
  purchasingPowerLossPercent: number; // e.g. 68.8%
  breakdown: InflationYearItem[];
}

/**
 * Calculates forward inflation (rising prices) and backward inflation (eroding purchasing power).
 */
export function calculateInflation(input: InflationInput): InflationResult {
  const currentAmount = Math.max(0, Number(input.currentAmount) || 0);
  const inflationRate = Math.max(0, Number(input.inflationRate) || 0);
  const years = Math.max(1, Math.round(Number(input.years) || 1));
  const rate = inflationRate / 100;

  const breakdown: InflationYearItem[] = [];

  for (let y = 1; y <= years; y++) {
    const factor = Math.pow(1 + rate, y);
    const futureCost = currentAmount * factor;
    const purchasingPower = factor === 0 ? 0 : currentAmount / factor;
    const lossPercent = currentAmount > 0
      ? ((currentAmount - purchasingPower) / currentAmount) * 100
      : 0;

    breakdown.push({
      year: y,
      futureCost: roundCurrency(futureCost),
      purchasingPower: roundCurrency(purchasingPower),
      purchasingPowerLossPercent: roundTo(lossPercent, 1)
    });
  }

  const finalFactor = Math.pow(1 + rate, years);
  const futureCostOfAmount = currentAmount * finalFactor;
  const todayPurchasingPowerOfFuture = finalFactor === 0 ? 0 : currentAmount / finalFactor;
  const totalLossPercent = currentAmount > 0
    ? ((currentAmount - todayPurchasingPowerOfFuture) / currentAmount) * 100
    : 0;

  return {
    currentAmount,
    inflationRate,
    years,
    futureCostOfAmount: roundCurrency(futureCostOfAmount),
    todayPurchasingPowerOfFuture: roundCurrency(todayPurchasingPowerOfFuture),
    costMultiplier: roundTo(finalFactor, 2),
    purchasingPowerLossPercent: roundTo(totalLossPercent, 1),
    breakdown
  };
}

function roundCurrency(val: number): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  return Math.round(val * 100) / 100;
}

function roundTo(val: number, decimals: number): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
