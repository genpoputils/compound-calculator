import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { CurrencyService } from './currency.service';
import { StorageService } from './storage.service';
import { SUPPORTED_CURRENCIES } from '../utils/currency.util';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let storageMap: Map<string, any>;
  let mockStorage: any;

  beforeEach(() => {
    storageMap = new Map<string, any>();
    mockStorage = {
      getItem: (key: string) => storageMap.get(key) || null,
      setItem: (key: string, val: any) => storageMap.set(key, val),
      removeItem: (key: string) => storageMap.delete(key),
      clear: () => storageMap.clear()
    };

    TestBed.configureTestingModule({
      providers: [
        CurrencyService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: StorageService, useValue: mockStorage }
      ]
    });

    service = TestBed.inject(CurrencyService);
  });

  it('should initialize with default currency USD', () => {
    expect(service.code()).toBe('USD');
    expect(service.symbol()).toBe('$');
    expect(service.system()).toBe('western');
  });

  it('should switch currency to INR and update symbol and system', () => {
    service.setCurrency('INR');
    expect(service.code()).toBe('INR');
    expect(service.symbol()).toBe('₹');
    expect(service.system()).toBe('indian');
    expect(storageMap.get('cc_currency')).toBe('INR');
  });

  it('should switch currency to EUR and format amounts with Euro symbol', () => {
    service.setCurrency('EUR');
    expect(service.code()).toBe('EUR');
    expect(service.symbol()).toBe('€');

    const formattedFull = service.formatFull(1500000);
    expect(formattedFull).toContain('€');
    expect(formattedFull).toContain('1.500.000');

    const formattedCompact = service.formatCompact(1500000);
    expect(formattedCompact).toBe('€1.5M');
  });

  it('should format Indian system currency with Lakh and Crore', () => {
    service.setCurrency('INR');

    expect(service.formatCompact(50000)).toBe('₹50,000');
    expect(service.formatCompact(2500000)).toBe('₹25 Lakh');
    expect(service.formatCompact(15000000)).toBe('₹1.5 Cr');
  });

  it('should format Western system currency with K, M, B', () => {
    service.setCurrency('USD');

    expect(service.formatCompact(50000)).toBe('$50K');
    expect(service.formatCompact(2500000)).toBe('$2.5M');
    expect(service.formatCompact(1500000000)).toBe('$1.5B');
  });

  it('should support all 9 configured global currencies', () => {
    expect(SUPPORTED_CURRENCIES.length).toBe(9);
    for (const curr of SUPPORTED_CURRENCIES) {
      service.setCurrency(curr.code);
      expect(service.code()).toBe(curr.code);
      expect(service.symbol()).toBe(curr.symbol);
      expect(service.formatFull(100)).toContain(curr.symbol);
    }
  });
});
