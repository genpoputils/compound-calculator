import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({
  name: 'inrCurrency',
  standalone: true,
  pure: false
})
export class InrCurrencyPipe implements PipeTransform {
  private readonly currencyService: CurrencyService;

  constructor(currencyService?: CurrencyService) {
    if (currencyService) {
      this.currencyService = currencyService;
    } else {
      try {
        this.currencyService = inject(CurrencyService, { optional: true }) ?? new CurrencyService();
      } catch {
        this.currencyService = new CurrencyService();
      }
    }
  }

  transform(value: number | null | undefined, format: 'full' | 'compact' | 'both' = 'full'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return `${this.currencyService.symbol()}0`;
    }

    if (format === 'compact') {
      return this.currencyService.formatCompact(value);
    }

    if (format === 'both') {
      return this.currencyService.formatBoth(value);
    }

    return this.currencyService.formatFull(value);
  }
}
