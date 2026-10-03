import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DisclaimerComponent } from '../disclaimer/disclaimer.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, DisclaimerComponent],
  template: `
    <footer class="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#070b14]/50 backdrop-blur-sm pt-12 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <!-- Privacy & Trust Banner (Section 24) -->
        <div class="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                100% Client-Side & Private
              </h4>
              <p class="text-xs text-slate-600 dark:text-slate-400">
                Your calculations happen entirely in your browser. We don't store or transmit your financial information to any server.
              </p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shrink-0">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Zero Server Tracking
          </span>
        </div>

        <!-- Links Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div class="space-y-3">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Investment Calculators
            </h5>
            <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a routerLink="/step-up-investment-calculator" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Step-Up SIP Calculator
                </a>
              </li>
              <li>
                <a routerLink="/compound-calculator" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Compound Interest Calculator
                </a>
              </li>
              <li>
                <a routerLink="/sip-calculator" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  SIP Growth Calculator
                </a>
              </li>
              <li>
                <a routerLink="/investment-calculator" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Regular Investment
                </a>
              </li>
              <li>
                <a routerLink="/swp-calculator" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  SWP Calculator (Systematic Withdrawal)
                </a>
              </li>
            </ul>
          </div>

          <div class="space-y-3">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Planning & Goals
            </h5>
            <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a routerLink="/retirement-calculator" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Retirement Savings Calculator
                </a>
              </li>
              <li>
                <a routerLink="/savings-goal-calculator" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Savings Goal Calculator
                </a>
              </li>
              <li>
                <a routerLink="/inflation-calculator" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Inflation & Purchasing Power
                </a>
              </li>
            </ul>
          </div>

          <div class="space-y-3">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Resources & Methodology
            </h5>
            <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span class="text-slate-500">Nominal vs Real Returns</span>
              </li>
              <li>
                <span class="text-slate-500">The Power of Step-Up SIP</span>
              </li>
              <li>
                <span class="text-slate-500">4% Safe Withdrawal Rule</span>
              </li>
              <li>
                <span class="text-slate-500">Compounding Frequency Guide</span>
              </li>
            </ul>
          </div>

          <div class="space-y-3">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Engineering & Open Source
            </h5>
            <p class="text-xs text-slate-500 leading-relaxed">
              Built with Angular 20+, Standalone Components, Signals, and Tailwind CSS. All mathematical calculations run strictly in client memory.
            </p>
            <div class="pt-1">
              <span class="text-[11px] text-slate-400 font-mono">
                genpoputils/compound-calculator
              </span>
            </div>
          </div>
        </div>

        <!-- Financial Disclaimer Section 27 -->
        <app-disclaimer />

        <!-- Copyright & Bottom Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-6">
          <p>© 2026 Compound Calculator. All mathematical formulas open & verified.</p>
          <div class="flex items-center gap-4">
            <span>Client-Side Execution</span>
            <span>•</span>
            <span>No Cookies Stored</span>
            <span>•</span>
            <span>WCAG AA Accessible</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
