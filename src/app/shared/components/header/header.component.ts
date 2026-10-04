import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#070b14]/85 backdrop-blur-md transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo & Brand -->
        <a routerLink="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
              Compound<span class="text-indigo-600 dark:text-indigo-400">Calc</span>
            </span>
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-0.5">
              Investment & Loan Engine
            </span>
          </div>
        </a>

        <!-- Desktop Navigation Routes -->
        <nav class="hidden xl:flex items-center gap-1 text-xs font-semibold" aria-label="Main Navigation">
          <a
            routerLink="/"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Home
          </a>

          <!-- FLAGSHIP FEATURE HIGHLIGHT -->
          <a
            routerLink="/loan-prepayment-calculator"
            routerLinkActive="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
            class="px-3 py-1.5 rounded-lg border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5 transition-all"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Prepayment Simulator</span>
          </a>

          <a
            routerLink="/emi-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            EMI
          </a>
          <a
            routerLink="/home-loan-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Home Loan
          </a>
          <a
            routerLink="/step-up-investment-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Step-Up SIP
          </a>
          <a
            routerLink="/compound-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Compound
          </a>
          <a
            routerLink="/retirement-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Retirement
          </a>
          <a
            routerLink="/sip-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            SIP
          </a>
          <a
            routerLink="/inflation-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Inflation
          </a>
          <a
            routerLink="/loan-amortization-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Amortization
          </a>
        </nav>

        <!-- Right Side Actions: Currency, Theme, Share, Mobile Menu -->
        <div class="flex items-center gap-2">
          <!-- Currency Selector -->
          <div class="relative">
            <select
              id="currency-select"
              [value]="currencyService.code()"
              (change)="onCurrencyChange($event)"
              aria-label="Select Currency"
              class="h-8 pl-2 pr-6 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              @for (c of currencyService.currencies; track c.code) {
                <option [value]="c.code">{{ c.code }} ({{ c.symbol.trim() }})</option>
              }
            </select>
            <div class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Share button -->
          <button
            type="button"
            (click)="shareClicked.emit()"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            aria-label="Share this calculation"
          >
            <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>

          <!-- Theme Toggle -->
          <div class="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
            <button
              id="theme-light-btn"
              type="button"
              (click)="themeService.setTheme('light')"
              [attr.aria-pressed]="themeService.theme() === 'light'"
              title="Light theme"
              aria-label="Light theme"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
              [ngClass]="{ 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs': themeService.theme() === 'light' }"
            >
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button
              id="theme-dark-btn"
              type="button"
              (click)="themeService.setTheme('dark')"
              [attr.aria-pressed]="themeService.theme() === 'dark'"
              title="Dark theme"
              aria-label="Dark theme"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
              [ngClass]="{ 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs': themeService.theme() === 'dark' }"
            >
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button
            type="button"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            class="xl:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            aria-label="Toggle navigation menu"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              @if (!mobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      @if (mobileMenuOpen()) {
        <div class="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-xl px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <!-- Home Navigation Button -->
          <a
            routerLink="/"
            (click)="mobileMenuOpen.set(false)"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </a>

          <!-- Loans Section -->
          <div class="space-y-1">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-3">
              Loans & Debt Management
            </div>
            <a
              routerLink="/loan-prepayment-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-2 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100"
            >
              🔥 Loan Prepayment Simulator (Flagship)
            </a>
            <a
              routerLink="/emi-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Loan EMI Calculator
            </a>
            <a
              routerLink="/loan-amortization-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Loan Amortization Schedule
            </a>
            <a
              routerLink="/home-loan-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home Loan Calculator
            </a>
            <a
              routerLink="/car-loan-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Car Loan Calculator
            </a>
          </div>

          <!-- Investments Section -->
          <div class="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-3">
              Investment & Wealth Planning
            </div>
            <a
              routerLink="/step-up-investment-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Step-Up SIP Calculator
            </a>
            <a
              routerLink="/compound-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Compound Interest Calculator
            </a>
            <a
              routerLink="/sip-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              SIP Calculator
            </a>
            <a
              routerLink="/retirement-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Retirement Planning
            </a>
            <a
              routerLink="/inflation-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Inflation Calculator
            </a>
            <a
              routerLink="/savings-goal-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Savings Goal Calculator
            </a>
            <a
              routerLink="/swp-calculator"
              (click)="mobileMenuOpen.set(false)"
              class="block px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              SWP Calculator
            </a>
          </div>

          <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              (click)="shareClicked.emit(); mobileMenuOpen.set(false)"
              class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              🔗 Share Current Calculation
            </button>
          </div>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly currencyService = inject(CurrencyService);
  readonly shareClicked = output<void>();
  readonly mobileMenuOpen = signal<boolean>(false);

  onCurrencyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select?.value) {
      this.currencyService.setCurrency(select.value);
    }
  }
}
