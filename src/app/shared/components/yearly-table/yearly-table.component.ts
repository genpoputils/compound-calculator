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
    <div class="rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] overflow-hidden shadow-2xs">
      <!-- Header Bar -->
      <div class="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF] dark:bg-[#141815]">
        <div>
          <h2 class="font-editorial font-bold text-base sm:text-lg text-[#202A23] dark:text-[#EDE8DE] flex items-center gap-2">
            <span>Year-by-Year Schedule</span>
            <span class="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]">
              {{ items().length }} Years
            </span>
          </h2>
          <p class="text-xs text-[#686B61] dark:text-[#959B8E] mt-0.5 font-sans">
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
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#1F2721] text-xs font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#F8F6EF] dark:hover:bg-[#27322A] transition-colors shadow-2xs active:translate-y-0.5 cursor-pointer font-sans"
            aria-label="Download yearly breakdown as CSV"
          >
            <svg class="w-3.5 h-3.5 text-[#356B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>

          <!-- Toggle Rows -->
          @if (items().length > 5) {
            <button
              type="button"
              (click)="isExpanded.set(!isExpanded())"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] text-xs font-bold hover:bg-[#D9D5C9] dark:hover:bg-[#2C362E] transition-colors active:translate-y-0.5 cursor-pointer font-sans"
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
            <tr class="border-b border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF]/70 dark:bg-[#141815] text-[#686B61] dark:text-[#959B8E] font-semibold uppercase text-[11px] tracking-wider font-sans">
              <th scope="col" class="py-3 px-4">Year</th>
              @if (hasAge()) {
                <th scope="col" class="py-3 px-4">Age</th>
              }
              <th scope="col" class="py-3 px-4">{{ mode() === 'swp' ? 'Monthly Payout' : 'Monthly Deposit' }}</th>
              <th scope="col" class="py-3 px-4">{{ mode() === 'swp' ? 'Annual Payout' : 'Annual Invested' }}</th>
              <th scope="col" class="py-3 px-4">{{ mode() === 'swp' ? 'Total Payout' : 'Total Invested' }}</th>
              <th scope="col" class="py-3 px-4">{{ mode() === 'swp' ? 'Year Returns' : 'Year Growth' }}</th>
              <th scope="col" class="py-3 px-4 font-bold text-[#202A23] dark:text-[#EDE8DE]">{{ mode() === 'swp' ? 'Remaining Balance' : 'Portfolio Value' }}</th>
              <th scope="col" class="py-3 px-4 text-[#A8683B] dark:text-[#D49366]">Purchasing Power</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#E8E2D4] dark:divide-[#242D26]">
            @for (row of visibleItems(); track row.year) {
              <tr class="hover:bg-[#F8F6EF]/60 dark:hover:bg-[#1E2520] transition-colors">
                <td class="py-3 px-4 font-bold font-mono text-[#202A23] dark:text-[#EDE8DE]">
                  Yr {{ row.year }}
                </td>
                @if (hasAge()) {
                  <td class="py-3 px-4 text-[#686B61] dark:text-[#959B8E] font-mono">
                    {{ row.age }} yrs
                  </td>
                }
                <td class="py-3 px-4 text-[#686B61] dark:text-[#959B8E] font-mono tabular-nums">
                  {{ row.monthlyContribution | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 text-[#686B61] dark:text-[#959B8E] font-mono tabular-nums">
                  {{ row.annualContribution | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 font-medium font-mono tabular-nums text-[#202A23] dark:text-[#EDE8DE]">
                  {{ row.totalInvested | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 font-semibold font-mono tabular-nums text-[#356B4A] dark:text-[#66A87E]">
                  +{{ row.interestEarnedYear | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 font-bold font-mono tabular-nums text-[#202A23] dark:text-[#FFFFFF]">
                  {{ row.portfolioValue | inrCurrency:'compact' }}
                </td>
                <td class="py-3 px-4 font-medium font-mono tabular-nums text-[#A8683B] dark:text-[#D49366]">
                  {{ row.realPortfolioValue | inrCurrency:'compact' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards View -->
      <div class="sm:hidden divide-y divide-[#E8E2D4] dark:divide-[#242D26]">
        @for (row of visibleItems(); track row.year) {
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold font-editorial text-[#202A23] dark:text-[#EDE8DE]">
                Year {{ row.year }} @if (row.age) { <span class="text-xs font-mono font-normal text-[#686B61] dark:text-[#959B8E]">(Age {{ row.age }})</span> }
              </span>
              <span class="text-sm font-bold font-mono tabular-nums text-[#202A23] dark:text-[#FFFFFF]">
                {{ row.portfolioValue | inrCurrency:'compact' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 rounded bg-[#F8F6EF] dark:bg-[#141815] border border-[#D9D5C9] dark:border-[#2C362E]">
                <span class="text-[#686B61] dark:text-[#959B8E] font-sans block text-[10px]">{{ mode() === 'swp' ? 'Monthly Payout' : 'Monthly Deposit' }}</span>
                <span class="font-bold font-mono tabular-nums text-[#202A23] dark:text-[#EDE8DE]">{{ row.monthlyContribution | inrCurrency:'compact' }}</span>
              </div>
              <div class="p-2 rounded bg-[#F8F6EF] dark:bg-[#141815] border border-[#D9D5C9] dark:border-[#2C362E]">
                <span class="text-[#686B61] dark:text-[#959B8E] font-sans block text-[10px]">{{ mode() === 'swp' ? 'Total Payout' : 'Total Invested' }}</span>
                <span class="font-bold font-mono tabular-nums text-[#202A23] dark:text-[#EDE8DE]">{{ row.totalInvested | inrCurrency:'compact' }}</span>
              </div>
              <div class="p-2 rounded bg-[#F0F6F2] dark:bg-[#1B2920] border border-[#A8C4B0] dark:border-[#2A4836]">
                <span class="text-[#356B4A] dark:text-[#8FA691] font-sans block text-[10px]">{{ mode() === 'swp' ? 'Year Returns' : 'Year Growth' }}</span>
                <span class="font-bold font-mono tabular-nums text-[#356B4A] dark:text-[#66A87E]">+{{ row.interestEarnedYear | inrCurrency:'compact' }}</span>
              </div>
              <div class="p-2 rounded bg-[#F5F2E9] dark:bg-[#252822] border border-[#D9D5C9] dark:border-[#384034]">
                <span class="text-[#A8683B] dark:text-[#D49366] font-sans block text-[10px]">Purchasing Power</span>
                <span class="font-bold font-mono tabular-nums text-[#A8683B] dark:text-[#D49366]">{{ row.realPortfolioValue | inrCurrency:'compact' }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Expand/Collapse Footer on mobile -->
      @if (items().length > 5) {
        <div class="p-3 text-center border-t border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF] dark:bg-[#141815]">
          <button
            type="button"
            (click)="isExpanded.set(!isExpanded())"
            class="text-xs font-bold text-[#356B4A] dark:text-[#8FA691] hover:underline cursor-pointer font-sans"
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
