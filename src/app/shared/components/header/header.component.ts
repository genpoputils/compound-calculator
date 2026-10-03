import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-md transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo & Brand -->
        <a routerLink="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
              Compound<span class="text-indigo-600 dark:text-indigo-400">Calc</span>
            </span>
            <span class="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-0.5">
              Financial Engine
            </span>
          </div>
        </a>

        <!-- Desktop Navigation Routes -->
        <nav class="hidden lg:flex items-center gap-1 text-xs font-semibold" aria-label="Main Navigation">
          <a
            routerLink="/step-up-investment-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Step-Up SIP
          </a>
          <a
            routerLink="/compound-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Compound Interest
          </a>
          <a
            routerLink="/retirement-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Retirement
          </a>
          <a
            routerLink="/sip-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            SIP
          </a>
          <a
            routerLink="/investment-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Regular
          </a>
          <a
            routerLink="/inflation-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Inflation
          </a>
          <a
            routerLink="/savings-goal-calculator"
            routerLinkActive="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Goal
          </a>
        </nav>

        <!-- Right Side Actions: Theme, Share, Mobile Menu -->
        <div class="flex items-center gap-2">
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
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
              [ngClass]="{ 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs': themeService.theme() === 'light' }"
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
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
              [ngClass]="{ 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs': themeService.theme() === 'dark' }"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <button
              id="theme-system-btn"
              type="button"
              (click)="themeService.setTheme('system')"
              [attr.aria-pressed]="themeService.theme() === 'system'"
              title="System theme"
              aria-label="System theme"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
              [ngClass]="{ 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs': themeService.theme() === 'system' }"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button
            type="button"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            class="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
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
        <div class="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <a
            routerLink="/step-up-investment-calculator"
            (click)="mobileMenuOpen.set(false)"
            class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Step-Up SIP Calculator
          </a>
          <a
            routerLink="/compound-calculator"
            (click)="mobileMenuOpen.set(false)"
            class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Compound Interest Calculator
          </a>
          <a
            routerLink="/retirement-calculator"
            (click)="mobileMenuOpen.set(false)"
            class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Retirement Savings Calculator
          </a>
          <a
            routerLink="/sip-calculator"
            (click)="mobileMenuOpen.set(false)"
            class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            SIP Calculator
          </a>
          <a
            routerLink="/investment-calculator"
            (click)="mobileMenuOpen.set(false)"
            class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Regular Investment Calculator
          </a>
          <a
            routerLink="/inflation-calculator"
            (click)="mobileMenuOpen.set(false)"
            class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Inflation Calculator
          </a>
          <a
            routerLink="/savings-goal-calculator"
            (click)="mobileMenuOpen.set(false)"
            class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Savings Goal Calculator
          </a>
          <button
            type="button"
            (click)="shareClicked.emit(); mobileMenuOpen.set(false)"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          >
            Share Current Calculation
          </button>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly shareClicked = output<void>();
  readonly mobileMenuOpen = signal<boolean>(false);
}
