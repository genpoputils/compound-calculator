import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YearlyBreakdownItem } from '../../../core/calculator/models/calculator.types';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-yearly-table',
  standalone: true,
  imports: [CommonModule, InrCurrencyPipe],
  template: `
    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      <!-- Header Bar -->
      <div class="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h3 class="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span>Year-by-Year Schedule</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
              {{ items().length }} Years
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ mode() === 'swp' 
              ? 'Complete annual withdrawal cashflow progression, returns generated, and remaining corpus longevity.'
              : 'Complete annual cashflow progression, growth accumulation, and purchasing power.' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- CSV Download Button -->
          <button
            type="button"
            (click)="downloadCsv()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            aria-label="Download yearly breakdown as CSV"
          >
            <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>

          <!-- Toggle Rows -->
          @if (items().length > 5) {
            <button
              type="button"
              (click)="isExpanded.set(!isExpanded())"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <span>{{ isExpanded() ? 'Show Less' : 'Show All (' + items().length + ')' }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              <th scope="col" class="py-3 px-4">Year</th>
              @if (hasAge()) {
                <th scope="col" class="py-3 px-4">Age</th>
              }
              <th scope="col" class="py-3 px-4">{{ mode() === 'swp' ? 'Monthly Payout' : 'Monthly Deposit' }}</th>
              <th scope="col" class="py-3 px-4">{{ mode() === 'swp' ? 'Annual Payout' : 'Annual Invested' }}</th>
              <th scope="col" class="py-3 px-4">{{ mode() === 'swp' ? 'Total Payout' : 'Total Invested' }}</th>
              <th scope="col" class="py-3 px-4">{{ mode() === 'swp' ? 'Year Returns' : 'Year Growth' }}</th>
              <th scope="col" class="py-3 px-4 font-bold text-slate-900 dark:text-white">{{ mode() === 'swp' ? 'Remaining Balance' : 'Portfolio Value' }}</th>
              <th scope="col" class="py-3 px-4 text-purple-600 dark:text-purple-400">Purchasing Power</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            @for (row of visibleItems(); track row.year) {
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  Yr {{ row.year }}
                </td>
                @if (hasAge()) {
                  <td class="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {{ row.age }} yrs
                  </td>
                }
                <td class="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                  {{ row.monthlyContribution | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                  {{ row.annualContribution | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  {{ row.totalInvested | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                  +{{ row.interestEarnedYear | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                  {{ row.portfolioValue | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 font-medium text-purple-600 dark:text-purple-400">
                  {{ row.realPortfolioValue | inrCurrency:'compact' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards View -->
      <div class="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        @for (row of visibleItems(); track row.year) {
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-slate-900 dark:text-white">
                Year {{ row.year }} @if (row.age) { <span class="text-xs font-normal text-slate-400">(Age {{ row.age }})</span> }
              </span>
              <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {{ row.portfolioValue | inrCurrency:'compact' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span class="text-slate-400 block">{{ mode() === 'swp' ? 'Monthly Payout' : 'Monthly Deposit' }}</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300">{{ row.monthlyContribution | inrCurrency:'compact' }}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span class="text-slate-400 block">{{ mode() === 'swp' ? 'Total Payout' : 'Total Invested' }}</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300">{{ row.totalInvested | inrCurrency:'compact' }}</span>
              </div>
              <div class="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
                <span class="text-emerald-500 block">{{ mode() === 'swp' ? 'Year Returns' : 'Year Growth' }}</span>
                <span class="font-semibold text-emerald-700 dark:text-emerald-400">+{{ row.interestEarnedYear | inrCurrency:'compact' }}</span>
              </div>
              <div class="p-2 rounded-lg bg-purple-50/50 dark:purple-950/20">
                <span class="text-purple-500 block">Purchasing Power</span>
                <span class="font-semibold text-purple-700 dark:text-purple-400">{{ row.realPortfolioValue | inrCurrency:'compact' }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Expand/Collapse Footer on mobile -->
      @if (items().length > 5) {
        <div class="p-3 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
          <button
            type="button"
            (click)="isExpanded.set(!isExpanded())"
            class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {{ isExpanded() ? 'Show Top 5 Years' : 'View Full ' + items().length + '-Year Schedule' }}
          </button>
        </div>
      }
    </div>
  `
})
export class YearlyTableComponent {
  readonly items = input.required<YearlyBreakdownItem[]>();
  readonly mode = input<string>('compound');
  readonly isExpanded = signal<boolean>(false);
  private readonly currencyService = inject(CurrencyService);

  hasAge(): boolean {
    return this.items().some(i => i.age !== undefined);
  }

  visibleItems(): YearlyBreakdownItem[] {
    if (this.isExpanded() || this.items().length <= 5) {
      return this.items();
    }
    return this.items().slice(0, 5);
  }

  downloadCsv(): void {
    const list = this.items();
    if (!list || list.length === 0) return;

    const curr = this.currencyService.code();
    const isSwp = this.mode() === 'swp';

    const headers = [
      'Year',
      'Age',
      isSwp ? `Monthly Payout (${curr})` : `Monthly Contribution (${curr})`,
      isSwp ? `Annual Payout (${curr})` : `Annual Contribution (${curr})`,
      isSwp ? `Total Payout (${curr})` : `Total Invested (${curr})`,
      isSwp ? `Year Returns (${curr})` : `Year Growth (${curr})`,
      isSwp ? `Total Returns (${curr})` : `Total Growth (${curr})`,
      isSwp ? `Remaining Balance (${curr})` : `Portfolio Value (${curr})`,
      `Purchasing Power (Real Value ${curr})`
    ];

    const rows = list.map(item => [
      item.year,
      item.age || '',
      Math.round(item.monthlyContribution),
      Math.round(item.annualContribution),
      Math.round(item.totalInvested),
      Math.round(item.interestEarnedYear),
      Math.round(item.totalGrowth),
      Math.round(item.portfolioValue),
      Math.round(item.realPortfolioValue)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `compound-calculator-${isSwp ? 'swp' : 'yearly'}-breakdown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

