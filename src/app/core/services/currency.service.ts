import { inject, Injectable, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CurrencyConfig,
  DEFAULT_CURRENCY,
  formatCurrencyCompact,
  formatCurrencyFull,
  SUPPORTED_CURRENCIES
} from '../utils/currency.util';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly platformId: any;
  private readonly isBrowser: boolean;
  private readonly storageService: StorageService | null;

  readonly currencies = SUPPORTED_CURRENCIES;

  readonly selectedCurrency = signal<CurrencyConfig>(DEFAULT_CURRENCY);

  readonly code = computed(() => this.selectedCurrency().code);
  readonly symbol = computed(() => this.selectedCurrency().symbol);
  readonly system = computed(() => this.selectedCurrency().system);

  constructor() {
    try {
      this.platformId = inject(PLATFORM_ID, { optional: true }) ?? 'browser';
      this.storageService = inject(StorageService, { optional: true });
    } catch {
      this.platformId = 'browser';
      this.storageService = null;
    }
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.selectedCurrency.set(this.getInitialCurrency());
  }

  private getInitialCurrency(): CurrencyConfig {
    if (this.storageService) {
      try {
        const savedCode = this.storageService.getItem<string>('cc_currency', '');
        if (savedCode) {
          const found = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
          if (found) return found;
        }
      } catch {
        // fallback
      }
    } else if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        const savedCode = localStorage.getItem('cc_currency');
        if (savedCode) {
          const found = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
          if (found) return found;
        }
      } catch {
        // Ignore localStorage error
      }
    }
    return DEFAULT_CURRENCY;
  }

  setCurrency(code: string): void {
    const config = SUPPORTED_CURRENCIES.find(c => c.code === code);
    if (!config) return;

    this.selectedCurrency.set(config);

    if (this.storageService) {
      try {
        this.storageService.setItem('cc_currency', code);
      } catch {
        // fallback
      }
    } else if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('cc_currency', code);
      } catch {
        // Ignore localStorage error
      }
    }
  }

  formatFull(value: number): string {
    return formatCurrencyFull(value, this.selectedCurrency());
  }

  formatCompact(value: number, maxDecimals: number = 2): string {
    return formatCurrencyCompact(value, this.selectedCurrency(), maxDecimals);
  }

  formatBoth(value: number): string {
    const compact = this.formatCompact(value);
    const full = this.formatFull(value);
    return `${compact} (${full})`;
  }
}
