import { InrCurrencyPipe } from './inr-currency.pipe';

describe('InrCurrencyPipe', () => {
  let pipe: InrCurrencyPipe;

  beforeEach(() => {
    pipe = new InrCurrencyPipe();
  });

  it('should format full rupees correctly in Indian numbering system', () => {
    expect(pipe.transform(1000)).toBe('₹1,000');
    expect(pipe.transform(100000)).toBe('₹1,00,000');
    expect(pipe.transform(10000000)).toBe('₹1,00,00,000');
  });

  it('should format compact Lakhs and Crores accurately', () => {
    expect(pipe.transform(100000, 'compact')).toBe('₹1 Lakh');
    expect(pipe.transform(1050000, 'compact')).toBe('₹10.5 Lakh');
    expect(pipe.transform(10000000, 'compact')).toBe('₹1 Cr');
    expect(pipe.transform(48200000, 'compact')).toBe('₹4.82 Cr');
  });

  it('should handle zero, null, undefined, and negative numbers gracefully', () => {
    expect(pipe.transform(0)).toBe('₹0');
    expect(pipe.transform(null)).toBe('₹0');
    expect(pipe.transform(undefined)).toBe('₹0');
    expect(pipe.transform(-50000)).toBe('-₹50,000');
  });

  it('should handle "both" format with compact and full parenthetical display', () => {
    const formatted = pipe.transform(12500000, 'both');
    expect(formatted).toContain('₹1.25 Cr');
    expect(formatted).toContain('₹1,25,00,000');
  });
});
