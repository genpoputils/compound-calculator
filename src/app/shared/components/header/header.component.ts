import { Component, computed, ElementRef, HostListener, inject, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { CurrencyService } from '../../../core/services/currency.service';

export interface CalculatorItem {
  id: string;
  title: string;
  category: 'loan' | 'investment';
  categoryLabel: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  route: string;
  keywords: string[];
}

export const CALCULATOR_ITEMS: CalculatorItem[] = [
  // --- LOAN SUITE ---
  {
    id: 'loan-prepayment',
    title: 'Loan Prepayment Simulator',
    category: 'loan',
    categoryLabel: 'Loan Suite',
    badge: 'Flagship',
    badgeColor: 'bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]',
    description: 'See how extra prepayments slash interest and cut years off your loan tenure.',
    route: '/loan-prepayment-calculator',
    keywords: ['prepayment', 'loan', 'mortgage', 'part payment', 'tenure reduction', 'interest savings', 'home loan', 'foreclosure', 'debt']
  },
  {
    id: 'emi',
    title: 'Loan EMI Calculator',
    category: 'loan',
    categoryLabel: 'Loan Suite',
    badge: 'Popular',
    badgeColor: 'bg-[#E8E2D4] dark:bg-[#202722] text-[#202A23] dark:text-[#EDE8DE] border border-[#D9D5C9] dark:border-[#2C362E]',
    description: 'Calculate standard reducing-balance monthly installments and lifetime interest.',
    route: '/emi-calculator',
    keywords: ['emi', 'monthly installment', 'loan payment', 'interest', 'car loan', 'personal loan', 'bank rate']
  },
  {
    id: 'home-loan',
    title: 'Home Loan Calculator',
    category: 'loan',
    categoryLabel: 'Loan Suite',
    badge: 'Mortgage',
    badgeColor: 'bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]',
    description: 'Model mortgage payments, down payments, and long-term interest costs.',
    route: '/home-loan-calculator',
    keywords: ['home loan', 'mortgage', 'house loan', 'property', 'flat purchase', 'housing', 'down payment']
  },
  {
    id: 'car-loan',
    title: 'Car Loan Calculator',
    category: 'loan',
    categoryLabel: 'Loan Suite',
    badge: 'Auto',
    badgeColor: 'bg-[#E8E2D4] dark:bg-[#202722] text-[#202A23] dark:text-[#EDE8DE] border border-[#D9D5C9] dark:border-[#2C362E]',
    description: 'Plan auto financing with loan terms, interest rates, and down payments.',
    route: '/car-loan-calculator',
    keywords: ['car loan', 'auto loan', 'vehicle', 'automobile', 'car payment', 'down payment']
  },
  {
    id: 'loan-amortization',
    title: 'Loan Amortization Schedule',
    category: 'loan',
    categoryLabel: 'Loan Suite',
    description: 'Detailed month-by-month and annual breakdown of principal vs. interest payoff.',
    route: '/loan-amortization-calculator',
    keywords: ['amortization', 'schedule', 'table', 'monthly breakdown', 'annual breakdown', 'ledger', 'balance']
  },

  // --- INVESTMENT SUITE ---
  {
    id: 'step-up-sip',
    title: 'Step-Up SIP Calculator',
    category: 'investment',
    categoryLabel: 'Investment Suite',
    badge: 'Top Pick',
    badgeColor: 'bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]',
    description: 'Multiply future wealth by increasing your monthly investment annually with salary hikes.',
    route: '/step-up-investment-calculator',
    keywords: ['step up', 'sip', 'salary hike', 'increment', 'mutual fund', 'index fund', 'wealth accumulation']
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest Calculator',
    category: 'investment',
    categoryLabel: 'Investment Suite',
    badge: 'Core',
    badgeColor: 'bg-[#E8E2D4] dark:bg-[#202722] text-[#202A23] dark:text-[#EDE8DE] border border-[#D9D5C9] dark:border-[#2C362E]',
    description: 'Lump-sum compounding curves across daily, monthly, quarterly, and annual intervals.',
    route: '/compound-calculator',
    keywords: ['compound interest', 'compounding', 'lump sum', 'fixed deposit', 'wealth growth', 'cagr']
  },
  {
    id: 'sip',
    title: 'SIP Growth Calculator',
    category: 'investment',
    categoryLabel: 'Investment Suite',
    description: 'Standard monthly systematic investment plan wealth accumulator.',
    route: '/sip-calculator',
    keywords: ['sip', 'systematic investment', 'mutual funds', 'stocks', 'dollar cost averaging', 'dca']
  },
  {
    id: 'retirement',
    title: 'Retirement & FIRE Planner',
    category: 'investment',
    categoryLabel: 'Investment Suite',
    badge: 'FIRE',
    badgeColor: 'bg-[#E8E2D4] dark:bg-[#202722] text-[#A8683B] dark:text-[#D49366] border border-[#D9D5C9] dark:border-[#2C362E]',
    description: 'Calculate target retirement corpus, inflation-adjusted living expenses, and monthly savings needed.',
    route: '/retirement-calculator',
    keywords: ['retirement', 'fire', 'financial independence', 'pension', 'old age', 'corpus', '4 percent rule']
  },
  {
    id: 'swp',
    title: 'SWP Calculator',
    category: 'investment',
    categoryLabel: 'Investment Suite',
    description: 'Systematic Withdrawal Plan: Model regular monthly income and portfolio longevity.',
    route: '/swp-calculator',
    keywords: ['swp', 'systematic withdrawal', 'regular income', 'dividend', 'cash flow', 'capital longevity']
  },
  {
    id: 'inflation',
    title: 'Inflation & Purchasing Power',
    category: 'investment',
    categoryLabel: 'Investment Suite',
    description: 'See the true eroding impact of inflation on future purchasing power and living costs.',
    route: '/inflation-calculator',
    keywords: ['inflation', 'purchasing power', 'cpi', 'cost of living', 'real value', 'discount rate']
  },
  {
    id: 'savings-goal',
    title: 'Savings Goal Calculator',
    category: 'investment',
    categoryLabel: 'Investment Suite',
    description: 'Reverse-engineer the exact monthly investment required to reach your target corpus.',
    route: '/savings-goal-calculator',
    keywords: ['savings goal', 'target corpus', 'down payment', 'college fund', 'milestone', 'dream goal']
  }
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF]/95 dark:bg-[#141815]/95 backdrop-blur-md transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <!-- Logo & Brand: Editorial Masthead -->
        <a routerLink="/" class="flex items-center gap-2.5 group shrink-0">
          <div class="w-9 h-9 rounded-lg bg-[#356B4A] flex items-center justify-center text-[#F8F6EF] border border-[#29543A] shadow-2xs group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-editorial font-bold text-base sm:text-lg tracking-tight text-[#202A23] dark:text-[#EDE8DE] leading-tight">
              Compound<span class="text-[#356B4A] dark:text-[#8FA691]">Calc</span>
            </span>
            <span class="text-[9px] uppercase tracking-wider font-sans font-bold text-[#686B61] dark:text-[#959B8E] -mt-0.5">
              The Illustrated Investor
            </span>
          </div>
        </a>

        <!-- Desktop Navigation: Editorial Style -->
        <nav class="hidden lg:flex items-center gap-1.5 text-xs font-semibold" aria-label="Main Navigation">
          <a
            routerLink="/"
            routerLinkActive="bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E] font-bold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-2.5 py-1.5 rounded-lg text-[#686B61] dark:text-[#959B8E] hover:text-[#202A23] dark:hover:text-[#EDE8DE] transition-colors"
          >
            Home
          </a>

          <!-- Loans Dropdown Menu -->
          <div
            class="relative dropdown-container"
            (mouseenter)="onMenuMouseEnter('loans')"
            (mouseleave)="onMenuMouseLeave()"
          >
            <button
              type="button"
              (click)="toggleLoansDropdown($event)"
              class="px-2.5 py-1.5 rounded-lg text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/50 dark:hover:bg-[#202722] transition-colors flex items-center gap-1 cursor-pointer select-none"
              [attr.aria-expanded]="loansDropdownOpen()"
            >
              <span>Loans</span>
              <svg class="w-3.5 h-3.5 transition-transform duration-200" [ngClass]="{ 'rotate-180 text-[#356B4A] dark:text-[#8FA691]': loansDropdownOpen() }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Zero-gap wrapper with top-full pt-1 to prevent mouseleave jitter -->
            @if (loansDropdownOpen()) {
              <div class="absolute left-0 top-full pt-1.5 w-84 z-50">
                <div class="rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] shadow-xl p-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div class="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#356B4A] dark:text-[#8FA691] border-b border-[#E8E2D4] dark:border-[#2C362E] mb-1">
                    Loans & Debt Suite
                  </div>

                  <a
                    [routerLink]="'/loan-prepayment-calculator'"
                    (click)="navigateTo('/loan-prepayment-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#356B4A] dark:text-[#8FA691] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691] flex items-center gap-1.5">
                        <span>Prepayment Simulator</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]">Flagship</span>
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        See how extra payments slash interest & cut loan years
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/emi-calculator'"
                    (click)="navigateTo('/emi-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#202A23] dark:text-[#EDE8DE] flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-xs">
                      ₹
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691] flex items-center gap-1.5">
                        <span>Loan EMI Calculator</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#E8E2D4] dark:bg-[#202722] text-[#202A23] dark:text-[#EDE8DE] border border-[#D9D5C9] dark:border-[#2C362E]">Popular</span>
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Standard reducing-balance monthly installment calculator
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/home-loan-calculator'"
                    (click)="navigateTo('/home-loan-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#356B4A] dark:text-[#8FA691] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      🏠
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691]">
                        Home Loan Calculator
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Mortgage payments, down payment planning & interest
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/car-loan-calculator'"
                    (click)="navigateTo('/car-loan-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#202A23] dark:text-[#EDE8DE] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      🚗
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691]">
                        Car Loan Calculator
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Auto financing terms, EMIs & down payment trade-offs
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/loan-amortization-calculator'"
                    (click)="navigateTo('/loan-amortization-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#356B4A] dark:text-[#8FA691] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      📋
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691]">
                        Amortization Schedule
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Full monthly & annual principal vs. interest schedule
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Investments Dropdown Menu -->
          <div
            class="relative dropdown-container"
            (mouseenter)="onMenuMouseEnter('investments')"
            (mouseleave)="onMenuMouseLeave()"
          >
            <button
              type="button"
              (click)="toggleInvestmentsDropdown($event)"
              class="px-2.5 py-1.5 rounded-lg text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/50 dark:hover:bg-[#202722] transition-colors flex items-center gap-1 cursor-pointer select-none"
              [attr.aria-expanded]="investmentsDropdownOpen()"
            >
              <span>Investments</span>
              <svg class="w-3.5 h-3.5 transition-transform duration-200" [ngClass]="{ 'rotate-180 text-[#356B4A] dark:text-[#8FA691]': investmentsDropdownOpen() }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Zero-gap wrapper with top-full pt-1.5 to prevent mouseleave jitter -->
            @if (investmentsDropdownOpen()) {
              <div class="absolute left-0 top-full pt-1.5 w-88 z-50">
                <div class="rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] shadow-xl p-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div class="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#356B4A] dark:text-[#8FA691] border-b border-[#E8E2D4] dark:border-[#2C362E] mb-1">
                    Investment & Wealth Suite
                  </div>

                  <a
                    [routerLink]="'/step-up-investment-calculator'"
                    (click)="navigateTo('/step-up-investment-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#356B4A] dark:text-[#8FA691] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      📈
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691] flex items-center gap-1.5">
                        <span>Step-Up SIP Calculator</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]">Top Pick</span>
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Boost wealth by increasing investments with annual salary hikes
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/compound-calculator'"
                    (click)="navigateTo('/compound-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#202A23] dark:text-[#EDE8DE] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      🌱
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691] flex items-center gap-1.5">
                        <span>Compound Interest Calculator</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#E8E2D4] dark:bg-[#202722] text-[#202A23] dark:text-[#EDE8DE] border border-[#D9D5C9] dark:border-[#2C362E]">Core</span>
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Lump-sum compounding over daily, monthly & annual intervals
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/retirement-calculator'"
                    (click)="navigateTo('/retirement-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#A8683B] dark:text-[#D49366] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ⌛
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691] flex items-center gap-1.5">
                        <span>Retirement & FIRE Planner</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#E8E2D4] dark:bg-[#202722] text-[#A8683B] dark:text-[#D49366] border border-[#D9D5C9] dark:border-[#2C362E]">FIRE</span>
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Calculate required retirement corpus & monthly savings needed
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/sip-calculator'"
                    (click)="navigateTo('/sip-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#356B4A] dark:text-[#8FA691] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      💰
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691]">
                        SIP Growth Calculator
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Standard systematic investment wealth accumulation
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/swp-calculator'"
                    (click)="navigateTo('/swp-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#202A23] dark:text-[#EDE8DE] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      🏦
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691]">
                        SWP Calculator
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Systematic withdrawal cash flows & capital longevity
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/inflation-calculator'"
                    (click)="navigateTo('/inflation-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#A8683B] dark:text-[#D49366] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      📊
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691]">
                        Inflation & Purchasing Power
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Future living cost escalation & real value erosion
                      </div>
                    </div>
                  </a>

                  <a
                    [routerLink]="'/savings-goal-calculator'"
                    (click)="navigateTo('/savings-goal-calculator', $event)"
                    class="cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors group"
                  >
                    <div class="w-7 h-7 rounded-md bg-[#E8E2D4] dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] text-[#356B4A] dark:text-[#8FA691] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      🎯
                    </div>
                    <div>
                      <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691]">
                        Savings Goal Calculator
                      </div>
                      <div class="text-[11px] text-[#686B61] dark:text-[#959B8E] leading-snug line-clamp-1">
                        Target corpus reverse-engineering & required monthly saving
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Highlight Flagship Link: Prepayment Simulator -->
          <a
            routerLink="/loan-prepayment-calculator"
            routerLinkActive="bg-[#356B4A] text-white border-[#29543A]"
            class="px-2.5 py-1.5 rounded-lg border border-[#356B4A] bg-[#356B4A]/10 text-[#356B4A] dark:text-[#8FA691] font-bold flex items-center gap-1.5 hover:bg-[#356B4A] hover:text-white transition-all cursor-pointer active:translate-y-0.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#356B4A]"></span>
            <span>Prepayment Simulator</span>
          </a>
        </nav>

        <!-- Right Side Actions: Quick Search, Currency, Theme, Share, Mobile Menu -->
        <div class="flex items-center gap-2">
          <!-- Quick Search Button (Desktop / Tablet) -->
          <button
            type="button"
            (click)="openSearchModal()"
            class="hidden sm:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] hover:bg-[#F8F6EF] dark:hover:bg-[#202722] text-xs text-[#686B61] dark:text-[#959B8E] transition-all cursor-pointer shadow-2xs group"
            title="Search all calculators (Ctrl+K or ⌘K)"
            aria-label="Search all calculators"
          >
            <svg class="w-3.5 h-3.5 text-[#686B61] dark:text-[#959B8E] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="hidden md:inline font-medium text-[#202A23] dark:text-[#EDE8DE]">Search calculators...</span>
            <kbd class="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#686B61] dark:text-[#959B8E] bg-[#E8E2D4]/50 dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] rounded">
              ⌘K
            </kbd>
          </button>

          <!-- Currency Selector (Desktop / Tablet) -->
          <div class="relative hidden sm:block">
            <select
              id="currency-select"
              [value]="currencyService.code()"
              (change)="onCurrencyChange($event)"
              aria-label="Select Currency"
              class="h-9 pl-2 pr-6 text-xs font-semibold rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] text-[#202A23] dark:text-[#EDE8DE] focus:outline-none focus:ring-2 focus:ring-[#356B4A]/40 appearance-none cursor-pointer hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors shadow-2xs font-mono"
            >
              @for (c of currencyService.currencies; track c.code) {
                <option [value]="c.code">{{ c.code }} ({{ c.symbol.trim() }})</option>
              }
            </select>
            <div class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[#686B61] dark:text-[#959B8E]">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Share button -->
          <button
            type="button"
            (click)="shareClicked.emit()"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] text-xs font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors shadow-2xs cursor-pointer active:translate-y-0.5"
            aria-label="Share this calculation"
          >
            <svg class="w-3.5 h-3.5 text-[#356B4A] dark:text-[#8FA691]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>

          <!-- Theme Toggle -->
          <div class="flex items-center p-0.5 rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-[#E8E2D4]/50 dark:bg-[#141815]">
            <button
              id="theme-light-btn"
              type="button"
              (click)="themeService.setTheme('light')"
              [attr.aria-pressed]="themeService.theme() === 'light'"
              title="Light theme"
              aria-label="Light theme"
              class="w-8 h-8 flex items-center justify-center rounded-md text-[#686B61] hover:text-[#202A23] dark:text-[#959B8E] dark:hover:text-[#EDE8DE] transition-all cursor-pointer"
              [ngClass]="{ 'bg-white dark:bg-[#222E25] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#35483B] shadow-2xs': themeService.theme() === 'light' }"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              class="w-8 h-8 flex items-center justify-center rounded-md text-[#686B61] hover:text-[#202A23] dark:text-[#959B8E] dark:hover:text-[#EDE8DE] transition-all cursor-pointer"
              [ngClass]="{ 'bg-white dark:bg-[#222E25] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#35483B] shadow-2xs': themeService.theme() === 'dark' }"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button
            type="button"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            class="lg:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] text-[#202A23] dark:text-[#EDE8DE] cursor-pointer"
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
        <div class="lg:hidden border-t border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF]/95 dark:bg-[#141815]/95 backdrop-blur-xl px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
          <!-- Mobile Quick Search Input -->
          <div class="relative">
            <input
              type="text"
              [value]="mobileSearchQuery()"
              (input)="onMobileSearchInput($event)"
              placeholder="Search all calculators (e.g. car, fire, sip)..."
              class="w-full h-10 pl-9 pr-8 rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] text-xs font-semibold text-[#202A23] dark:text-[#EDE8DE] placeholder:text-[#686B61] dark:placeholder:text-[#959B8E] focus:outline-none focus:ring-2 focus:ring-[#356B4A]/40"
            />
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#686B61] dark:text-[#959B8E]">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            @if (mobileSearchQuery()) {
              <button
                type="button"
                (click)="mobileSearchQuery.set('')"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#686B61] hover:text-[#202A23] dark:text-[#959B8E] dark:hover:text-[#EDE8DE] p-1 cursor-pointer"
                aria-label="Clear mobile search"
              >
                ✕
              </button>
            }
          </div>

          <!-- Mobile Currency Selector -->
          <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#181E19] border border-[#D9D5C9] dark:border-[#2C362E]">
            <span class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] flex items-center gap-1.5">
              <span>Currency</span>
              <span class="text-[10px] text-[#356B4A] dark:text-[#8FA691] font-mono font-bold">({{ currencyService.symbol().trim() }})</span>
            </span>
            <div class="relative">
              <select
                id="mobile-currency-select"
                [value]="currencyService.code()"
                (change)="onCurrencyChange($event)"
                aria-label="Select Currency"
                class="h-8 pl-2 pr-6 text-xs font-semibold font-mono rounded border border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF] dark:bg-[#202722] text-[#202A23] dark:text-[#EDE8DE] focus:outline-none focus:ring-1 focus:ring-[#356B4A] appearance-none cursor-pointer"
              >
                @for (c of currencyService.currencies; track c.code) {
                  <option [value]="c.code">{{ c.code }} ({{ c.symbol.trim() }})</option>
                }
              </select>
              <div class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[#686B61] dark:text-[#959B8E]">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Mobile Filtered Results (when searching) -->
          @if (mobileSearchQuery().trim()) {
            <div class="space-y-1">
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-[#686B61] dark:text-[#959B8E] px-2 font-sans">
                Matching Calculators ({{ filteredMobileCalculators().length }})
              </div>
              @for (calc of filteredMobileCalculators(); track calc.id) {
                <a
                  [routerLink]="calc.route"
                  (click)="navigateTo(calc.route, $event)"
                  class="cursor-pointer flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#181E19] border border-[#D9D5C9] dark:border-[#2C362E] hover:bg-[#F8F6EF] dark:hover:bg-[#202722] transition-colors"
                >
                  <div>
                    <div class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] flex items-center gap-1.5">
                      <span>{{ calc.title }}</span>
                      @if (calc.badge) {
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider" [ngClass]="calc.badgeColor || 'bg-[#E8E2D4] dark:bg-[#202722] text-[#202A23] dark:text-[#EDE8DE]'">{{ calc.badge }}</span>
                      }
                    </div>
                    <div class="text-[10px] text-[#686B61] dark:text-[#959B8E] line-clamp-1 mt-0.5 font-sans">
                      {{ calc.description }}
                    </div>
                  </div>
                  <span class="text-xs text-[#686B61] dark:text-[#959B8E]">→</span>
                </a>
              } @empty {
                <div class="p-4 text-center text-xs text-[#686B61] dark:text-[#959B8E]">
                  No calculators found matching "{{ mobileSearchQuery() }}"
                </div>
              }
            </div>
          } @else {
            <!-- Standard Categorized Mobile Links -->
            <a
              [routerLink]="'/'"
              (click)="navigateTo('/', $event)"
              class="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-[#202A23] dark:text-[#EDE8DE] bg-[#E8E2D4]/50 dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E] hover:bg-[#E8E2D4] transition-colors"
            >
              <svg class="w-4 h-4 text-[#356B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </a>

            <!-- Loans Section -->
            <div class="space-y-1">
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-[#356B4A] dark:text-[#8FA691] px-3 font-sans">
                Loans & Debt Suite
              </div>
              <a
                [routerLink]="'/loan-prepayment-calculator'"
                (click)="navigateTo('/loan-prepayment-calculator', $event)"
                class="cursor-pointer block px-3 py-2 rounded-lg text-sm font-bold text-[#356B4A] dark:text-[#8FA691] bg-[#E8E2D4]/50 dark:bg-[#202722] border border-[#D9D5C9] dark:border-[#2C362E]"
              >
                Prepayment Simulator (Flagship)
              </a>
              <a
                [routerLink]="'/emi-calculator'"
                (click)="navigateTo('/emi-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Loan EMI Calculator
              </a>
              <a
                [routerLink]="'/home-loan-calculator'"
                (click)="navigateTo('/home-loan-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Home Loan Calculator
              </a>
              <a
                [routerLink]="'/car-loan-calculator'"
                (click)="navigateTo('/car-loan-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Car Loan Calculator
              </a>
              <a
                [routerLink]="'/loan-amortization-calculator'"
                (click)="navigateTo('/loan-amortization-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Loan Amortization Schedule
              </a>
            </div>

            <!-- Investments Section -->
            <div class="space-y-1 pt-2 border-t border-[#D9D5C9] dark:border-[#2C362E]">
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-[#356B4A] dark:text-[#8FA691] px-3 font-sans">
                Investment & Wealth Suite
              </div>
              <a
                [routerLink]="'/step-up-investment-calculator'"
                (click)="navigateTo('/step-up-investment-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Step-Up SIP Calculator
              </a>
              <a
                [routerLink]="'/compound-calculator'"
                (click)="navigateTo('/compound-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Compound Interest Calculator
              </a>
              <a
                [routerLink]="'/retirement-calculator'"
                (click)="navigateTo('/retirement-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Retirement & FIRE Planner
              </a>
              <a
                [routerLink]="'/sip-calculator'"
                (click)="navigateTo('/sip-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                SIP Calculator
              </a>
              <a
                [routerLink]="'/swp-calculator'"
                (click)="navigateTo('/swp-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                SWP Calculator
              </a>
              <a
                [routerLink]="'/inflation-calculator'"
                (click)="navigateTo('/inflation-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Inflation Calculator
              </a>
              <a
                [routerLink]="'/savings-goal-calculator'"
                (click)="navigateTo('/savings-goal-calculator', $event)"
                class="cursor-pointer block px-3 py-1.5 rounded-lg text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4]/40 dark:hover:bg-[#202722]"
              >
                Savings Goal Calculator
              </a>
            </div>

            <div class="pt-2 border-t border-[#D9D5C9] dark:border-[#2C362E]">
              <button
                type="button"
                (click)="shareClicked.emit(); mobileMenuOpen.set(false)"
                class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#356B4A] dark:text-[#8FA691] hover:bg-[#E8E2D4]/50 dark:hover:bg-[#202722] cursor-pointer"
              >
                🔗 Share Current Calculation
              </button>
            </div>
          }
        </div>
      }
    </header>

    <!-- Global Calculator Search Modal / Command Palette (Ctrl+K or ⌘K) -->
    @if (searchModalOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#202A23]/60 backdrop-blur-xs animate-in fade-in duration-150"
        (click)="closeSearchModal()"
      >
        <div
          class="w-full max-w-xl rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#1E2520] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header Input -->
          <div class="p-4 border-b border-[#D9D5C9] dark:border-[#2C362E] flex items-center gap-3">
            <svg class="w-5 h-5 text-[#356B4A] dark:text-[#8FA691] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              #searchInput
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Search all 12+ calculators (e.g. car, fire, step-up, prepayment, emi)..."
              class="w-full text-sm font-semibold bg-transparent text-[#202A23] dark:text-[#EAE6DF] placeholder:text-[#686B61] dark:placeholder:text-[#8E9487] focus:outline-none"
            />
            <button
              type="button"
              (click)="closeSearchModal()"
              class="px-2 py-1 rounded text-xs font-semibold text-[#686B61] hover:text-[#202A23] dark:text-[#8E9487] dark:hover:text-[#EAE6DF] hover:bg-[#E8E2D4]/50 dark:hover:bg-[#252E27] transition-colors cursor-pointer"
            >
              <kbd class="text-[10px] font-mono px-1 py-0.5 border border-[#D9D5C9] dark:border-[#2C362E] rounded">ESC</kbd>
            </button>
          </div>

          <!-- Category Quick Filters -->
          <div class="px-4 py-2 bg-[#F8F6EF] dark:bg-[#181F1A] border-b border-[#D9D5C9] dark:border-[#2C362E] flex items-center gap-1.5 text-xs">
            <span class="text-[11px] font-semibold text-[#686B61] dark:text-[#8E9487] mr-1">Filter:</span>
            <button
              type="button"
              (click)="searchCategoryFilter.set('all')"
              class="px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer text-xs"
              [ngClass]="{
                'bg-[#356B4A] text-white shadow-2xs': searchCategoryFilter() === 'all',
                'bg-white dark:bg-[#252E27] text-[#686B61] dark:text-[#8E9487] border border-[#D9D5C9] dark:border-[#2C362E] hover:text-[#202A23] dark:hover:text-[#EAE6DF]': searchCategoryFilter() !== 'all'
              }"
            >
              All (12)
            </button>
            <button
              type="button"
              (click)="searchCategoryFilter.set('loan')"
              class="px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer text-xs"
              [ngClass]="{
                'bg-[#356B4A] text-white shadow-2xs': searchCategoryFilter() === 'loan',
                'bg-white dark:bg-[#252E27] text-[#686B61] dark:text-[#8E9487] border border-[#D9D5C9] dark:border-[#2C362E] hover:text-[#202A23] dark:hover:text-[#EAE6DF]': searchCategoryFilter() !== 'loan'
              }"
            >
              Loans (5)
            </button>
            <button
              type="button"
              (click)="searchCategoryFilter.set('investment')"
              class="px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer text-xs"
              [ngClass]="{
                'bg-[#356B4A] text-white shadow-2xs': searchCategoryFilter() === 'investment',
                'bg-white dark:bg-[#252E27] text-[#686B61] dark:text-[#8E9487] border border-[#D9D5C9] dark:border-[#2C362E] hover:text-[#202A23] dark:hover:text-[#EAE6DF]': searchCategoryFilter() !== 'investment'
              }"
            >
              Investments (7)
            </button>
          </div>

          <!-- Results List -->
          <div class="max-h-[380px] overflow-y-auto p-2 space-y-1">
            @for (item of filteredCalculators(); track item.id) {
              <a
                [routerLink]="item.route"
                (click)="navigateTo(item.route, $event)"
                class="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8F6EF] dark:hover:bg-[#252E27] transition-colors group cursor-pointer border border-transparent hover:border-[#D9D5C9] dark:hover:border-[#2C362E]"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 bg-[#E8E2D4]/60 dark:bg-[#2C362E] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9]/60 dark:border-[#2C362E]"
                  >
                    @if (item.category === 'loan') { 🏦 } @else { 📈 }
                  </div>
                  <div>
                    <div class="text-xs font-bold text-[#202A23] dark:text-[#EAE6DF] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691] flex items-center gap-1.5">
                      <span>{{ item.title }}</span>
                      @if (item.badge) {
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider" [ngClass]="item.badgeColor || 'bg-[#E8E2D4] dark:bg-[#2C362E] text-[#356B4A] dark:text-[#8FA691]'">{{ item.badge }}</span>
                      }
                    </div>
                    <div class="text-[11px] text-[#686B61] dark:text-[#8E9487] leading-snug line-clamp-1 mt-0.5">
                      {{ item.description }}
                    </div>
                  </div>
                </div>

                <div class="text-xs font-semibold text-[#686B61] group-hover:text-[#356B4A] dark:group-hover:text-[#8FA691] group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                  <span class="text-[10px] uppercase font-bold tracking-wider text-[#686B61] dark:text-[#8E9487] hidden sm:inline">{{ item.categoryLabel }}</span>
                  <span>→</span>
                </div>
              </a>
            } @empty {
              <div class="p-8 text-center space-y-2">
                <div class="text-2xl">🔍</div>
                <div class="text-sm font-bold text-[#202A23] dark:text-[#EAE6DF]">
                  No calculators found matching "{{ searchQuery() }}"
                </div>
                <div class="text-xs text-[#686B61] dark:text-[#8E9487]">
                  Try searching for keywords like "car", "prepayment", "home", "fire", "sip", or "inflation".
                </div>
              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="p-3 bg-[#F8F6EF] dark:bg-[#181F1A] border-t border-[#D9D5C9] dark:border-[#2C362E] flex items-center justify-between text-[11px] text-[#686B61] dark:text-[#8E9487] font-medium">
            <span>Direct navigation to all calculators</span>
            <div class="flex items-center gap-2">
              <kbd class="px-1.5 py-0.5 bg-white dark:bg-[#252E27] border border-[#D9D5C9] dark:border-[#2C362E] rounded text-[10px]">ESC</kbd>
              <span>to exit</span>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly currencyService = inject(CurrencyService);
  readonly router = inject(Router);
  readonly shareClicked = output<void>();

  // State Signals
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly loansDropdownOpen = signal<boolean>(false);
  readonly investmentsDropdownOpen = signal<boolean>(false);

  // Search Modal Signals
  readonly searchModalOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly searchCategoryFilter = signal<'all' | 'loan' | 'investment'>('all');
  readonly mobileSearchQuery = signal<string>('');

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private closeMenuTimeout: any = null;

  // Reactive Filter for Command Palette Search Modal
  readonly filteredCalculators = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.searchCategoryFilter();

    return CALCULATOR_ITEMS.filter(item => {
      // Category filter
      if (cat !== 'all' && item.category !== cat) return false;

      // Text query filter
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const keywordMatch = item.keywords.some(k => k.toLowerCase().includes(q));

      return titleMatch || descMatch || keywordMatch;
    });
  });

  // Reactive Filter for Mobile Search Input
  readonly filteredMobileCalculators = computed(() => {
    const q = this.mobileSearchQuery().trim().toLowerCase();
    if (!q) return CALCULATOR_ITEMS;

    return CALCULATOR_ITEMS.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const keywordMatch = item.keywords.some(k => k.toLowerCase().includes(q));

      return titleMatch || descMatch || keywordMatch;
    });
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalKeyboard(event: KeyboardEvent): void {
    // Open Search Modal on Ctrl+K or Cmd+K
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleSearchModal();
    } else if (event.key === 'Escape') {
      this.closeSearchModal();
      this.loansDropdownOpen.set(false);
      this.investmentsDropdownOpen.set(false);
      this.mobileMenuOpen.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.loansDropdownOpen.set(false);
      this.investmentsDropdownOpen.set(false);
    }
  }

  onMenuMouseEnter(menu: 'loans' | 'investments'): void {
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
      this.closeMenuTimeout = null;
    }
    if (menu === 'loans') {
      this.loansDropdownOpen.set(true);
      this.investmentsDropdownOpen.set(false);
    } else {
      this.investmentsDropdownOpen.set(true);
      this.loansDropdownOpen.set(false);
    }
  }

  onMenuMouseLeave(): void {
    this.closeMenuTimeout = setTimeout(() => {
      this.loansDropdownOpen.set(false);
      this.investmentsDropdownOpen.set(false);
    }, 250);
  }

  toggleLoansDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
    }
    const current = this.loansDropdownOpen();
    this.loansDropdownOpen.set(!current);
    if (!current) {
      this.investmentsDropdownOpen.set(false);
    }
  }

  toggleInvestmentsDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
    }
    const current = this.investmentsDropdownOpen();
    this.investmentsDropdownOpen.set(!current);
    if (!current) {
      this.loansDropdownOpen.set(false);
    }
  }

  navigateTo(route: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
    }
    this.loansDropdownOpen.set(false);
    this.investmentsDropdownOpen.set(false);
    this.searchModalOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.router.navigateByUrl(route);
  }

  openSearchModal(): void {
    this.searchModalOpen.set(true);
    this.loansDropdownOpen.set(false);
    this.investmentsDropdownOpen.set(false);
    setTimeout(() => {
      this.searchInput()?.nativeElement.focus();
    }, 50);
  }

  closeSearchModal(): void {
    this.searchModalOpen.set(false);
    this.searchQuery.set('');
  }

  toggleSearchModal(): void {
    if (this.searchModalOpen()) {
      this.closeSearchModal();
    } else {
      this.openSearchModal();
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input?.value || '');
  }

  onMobileSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.mobileSearchQuery.set(input?.value || '');
  }

  onCurrencyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select?.value) {
      this.currencyService.setCurrency(select.value);
    }
  }
}
