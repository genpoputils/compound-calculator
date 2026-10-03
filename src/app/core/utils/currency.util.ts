/**
 * Indian currency formatting utilities.
 * Conforms to Indian numbering system (Lakhs and Crores).
 */

export function formatInrFull(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round(value));
  const formatted = absValue.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatInrCompact(value: number, maxDecimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  if (absValue >= 10000000) {
    // 1 Crore or more
    const cr = absValue / 10000000;
    const formatted = cr >= 100 ? cr.toFixed(1) : cr.toFixed(maxDecimals);
    return `${isNegative ? '-' : ''}₹${cleanTrailingZeros(formatted)} Cr`;
  } else if (absValue >= 100000) {
    // 1 Lakh or more
    const lakh = absValue / 100000;
    const formatted = lakh >= 100 ? lakh.toFixed(1) : lakh.toFixed(maxDecimals);
    return `${isNegative ? '-' : ''}₹${cleanTrailingZeros(formatted)} Lakh`;
  } else if (absValue >= 1000) {
    return formatInrFull(value);
  } else {
    return `${isNegative ? '-' : ''}₹${Math.round(absValue).toLocaleString('en-IN')}`;
  }
}

function cleanTrailingZeros(numStr: string): string {
  return numStr.replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1');
}
