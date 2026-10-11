import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DisclaimerComponent } from '../disclaimer/disclaimer.component';
import { EditorialIllustrationComponent } from '../illustrations/editorial-illustration.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, DisclaimerComponent, EditorialIllustrationComponent],
  template: `
    <footer class="mt-20 border-t border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF]/70 dark:bg-[#141815]/70 backdrop-blur-sm pt-12 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <!-- Privacy & Trust Banner: Editorial Paper Card -->
        <div class="rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xs">
          <div class="flex items-center gap-4">
            <app-editorial-illustration name="seal-verified" [size]="54" className="shrink-0" />
            <div>
              <h3 class="text-sm font-bold font-editorial text-[#202A23] dark:text-[#EDE8DE]">
                100% Client-Side & Private
              </h3>
              <p class="text-xs text-[#686B61] dark:text-[#959B8E] mt-0.5 font-sans">
                Your calculations happen entirely in your local browser memory. We never store or transmit your financial data to any server.
              </p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E] shrink-0 font-sans">
            <span class="w-1.5 h-1.5 rounded-full bg-[#356B4A]"></span>
            Zero Server Tracking
          </span>
        </div>

        <!-- Links Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <!-- Loan Calculators Column -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] uppercase tracking-wider flex items-center gap-1.5 font-sans">
              <span class="w-1.5 h-1.5 rounded-full bg-[#356B4A]"></span>
              <span>Loan & Debt</span>
            </h3>
            <ul class="space-y-2 text-xs text-[#686B61] dark:text-[#959B8E] font-sans">
              <li>
                <a routerLink="/loan-prepayment-calculator" class="text-[#356B4A] dark:text-[#8FA691] font-bold hover:underline flex items-center gap-1">
                  <span>Prepayment Simulator</span>
                  <span class="text-[9px] uppercase px-1 py-0.2 rounded bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]">Flagship</span>
                </a>
              </li>
              <li>
                <a routerLink="/emi-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Loan EMI Calculator
                </a>
              </li>
              <li>
                <a routerLink="/loan-amortization-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Amortization Schedule
                </a>
              </li>
              <li>
                <a routerLink="/home-loan-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Home Loan Calculator
                </a>
              </li>
              <li>
                <a routerLink="/car-loan-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Car Loan Calculator
                </a>
              </li>
              <li>
                <a routerLink="/loan-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Comprehensive Loan
                </a>
              </li>
            </ul>
          </div>

          <!-- Investment Calculators Column -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] uppercase tracking-wider flex items-center gap-1.5 font-sans">
              <span class="w-1.5 h-1.5 rounded-full bg-[#356B4A]"></span>
              <span>Investment & Growth</span>
            </h3>
            <ul class="space-y-2 text-xs text-[#686B61] dark:text-[#959B8E] font-sans">
              <li>
                <a routerLink="/step-up-investment-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors font-medium">
                  Step-Up SIP Calculator
                </a>
              </li>
              <li>
                <a routerLink="/compound-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Compound Interest Calculator
                </a>
              </li>
              <li>
                <a routerLink="/sip-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  SIP Growth Calculator
                </a>
              </li>
              <li>
                <a routerLink="/investment-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Regular Investment
                </a>
              </li>
              <li>
                <a routerLink="/swp-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  SWP (Systematic Withdrawal)
                </a>
              </li>
            </ul>
          </div>

          <!-- Planning & Goals Column -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] uppercase tracking-wider flex items-center gap-1.5 font-sans">
              <span class="w-1.5 h-1.5 rounded-full bg-[#78947A]"></span>
              <span>Planning & Goals</span>
            </h3>
            <ul class="space-y-2 text-xs text-[#686B61] dark:text-[#959B8E] font-sans">
              <li>
                <a routerLink="/retirement-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Retirement Planning
                </a>
              </li>
              <li>
                <a routerLink="/savings-goal-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Savings Goal Calculator
                </a>
              </li>
              <li>
                <a routerLink="/inflation-calculator" class="hover:text-[#356B4A] dark:hover:text-[#EDE8DE] transition-colors">
                  Inflation & Purchasing Power
                </a>
              </li>
              <li>
                <span class="text-[#686B61] dark:text-[#959B8E]">Tenure vs EMI Tradeoff</span>
              </li>
              <li>
                <span class="text-[#686B61] dark:text-[#959B8E]">Safe Withdrawal 4% Rule</span>
              </li>
            </ul>
          </div>

          <!-- Platform & Architecture Column -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-[#202A23] dark:text-[#EDE8DE] uppercase tracking-wider flex items-center gap-1.5 font-sans">
              <span class="w-1.5 h-1.5 rounded-full bg-[#356B4A]"></span>
              <span>Illustrated Investor</span>
            </h3>
            <p class="text-xs text-[#686B61] dark:text-[#959B8E] leading-relaxed font-sans">
              Independent financial tools inspired by editorial publishing. Pure mathematical logic, no advertising trackers, zero server persistence.
            </p>
            <div class="pt-1">
              <span class="text-[11px] text-[#686B61] dark:text-[#959B8E] font-mono">
                CompoundCalc by GenPopUtils
              </span>
            </div>
          </div>
        </div>

        <!-- Financial Disclaimer -->
        <app-disclaimer />

        <!-- Copyright & Bottom Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#686B61] dark:text-[#959B8E] border-t border-[#D9D5C9] dark:border-[#2C362E] pt-6 font-sans">
          <p>© 2026 Compound Calculator • GenPopUtils. All formulas open & client-side verified.</p>
          <div class="flex items-center gap-3">
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
