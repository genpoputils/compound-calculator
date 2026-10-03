/**
 * Global and Indian currency formatting utilities.
 * Supports both Western (K/M/B) and Indian (Lakh/Crore) numbering systems.
 */

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  system: 'western' | 'indian';
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', system: 'western' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', system: 'indian' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', system: 'western' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', system: 'western' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA', system: 'western' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', system: 'western' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', system: 'western' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', system: 'western' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', locale: 'en-AE', system: 'western' }
];

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0]; // USD default for global audience

export function formatCurrencyFull(value: number, config: CurrencyConfig = DEFAULT_CURRENCY): string {
  if (value === null || value === undefined || isNaN(value)) {
    return `${config.symbol}0`;
  }
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round(value));
  const formatted = absValue.toLocaleString(config.locale);
  return `${isNegative ? '-' : ''}${config.symbol}${formatted}`;
}

export function formatCurrencyCompact(
  value: number,
  config: CurrencyConfig = DEFAULT_CURRENCY,
  maxDecimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return `${config.symbol}0`;
  }
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  if (config.system === 'indian') {
    if (absValue >= 10000000) {
      // 1 Crore or more
      const cr = absValue / 10000000;
      const formatted = cr >= 100 ? cr.toFixed(1) : cr.toFixed(maxDecimals);
      return `${isNegative ? '-' : ''}${config.symbol}${cleanTrailingZeros(formatted)} Cr`;
    } else if (absValue >= 100000) {
      // 1 Lakh or more
      const lakh = absValue / 100000;
      const formatted = lakh >= 100 ? lakh.toFixed(1) : lakh.toFixed(maxDecimals);
      return `${isNegative ? '-' : ''}${config.symbol}${cleanTrailingZeros(formatted)} Lakh`;
    } else if (absValue >= 1000) {
      return formatCurrencyFull(value, config);
    } else {
      return `${isNegative ? '-' : ''}${config.symbol}${Math.round(absValue).toLocaleString(config.locale)}`;
    }
  }

  // Western numbering system (K / M / B)
  if (absValue >= 1000000000) {
    const b = absValue / 1000000000;
    const formatted = b >= 100 ? b.toFixed(1) : b.toFixed(maxDecimals);
    return `${isNegative ? '-' : ''}${config.symbol}${cleanTrailingZeros(formatted)}B`;
  } else if (absValue >= 1000000) {
    const m = absValue / 1000000;
    const formatted = m >= 100 ? m.toFixed(1) : m.toFixed(maxDecimals);
    return `${isNegative ? '-' : ''}${config.symbol}${cleanTrailingZeros(formatted)}M`;
  } else if (absValue >= 10000) {
    const k = absValue / 1000;
    const formatted = k >= 100 ? k.toFixed(1) : k.toFixed(maxDecimals);
    return `${isNegative ? '-' : ''}${config.symbol}${cleanTrailingZeros(formatted)}K`;
  } else if (absValue >= 1000) {
    return formatCurrencyFull(value, config);
  } else {
    return `${isNegative ? '-' : ''}${config.symbol}${Math.round(absValue).toLocaleString(config.locale)}`;
  }
}

function cleanTrailingZeros(numStr: string): string {
  return numStr.replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1');
}

/**
 * Backward compatibility helpers for INR specifically.
 */
const INR_CONFIG = SUPPORTED_CURRENCIES.find(c => c.code === 'INR') || SUPPORTED_CURRENCIES[1];

export function formatInrFull(value: number): string {
  return formatCurrencyFull(value, INR_CONFIG);
}

export function formatInrCompact(value: number, maxDecimals: number = 2): string {
  return formatCurrencyCompact(value, INR_CONFIG, maxDecimals);
}
