import { Pipe, PipeTransform } from '@angular/core';
import { formatInrCompact, formatInrFull } from '../../core/utils/currency.util';

@Pipe({
  name: 'inrCurrency',
  standalone: true
})
export class InrCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, format: 'full' | 'compact' | 'both' = 'full'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '₹0';
    }

    if (format === 'compact') {
      return formatInrCompact(value);
    }

    if (format === 'both') {
      if (Math.abs(value) >= 100000) {
        return `${formatInrCompact(value)} (${formatInrFull(value)})`;
      }
      return formatInrFull(value);
    }

    return formatInrFull(value);
  }
}
