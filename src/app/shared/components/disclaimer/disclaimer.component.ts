import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="space-y-1">
          <p class="font-medium text-slate-800 dark:text-slate-200">
            Important Financial Disclosure
          </p>
          <p class="leading-relaxed">
            <strong>Disclaimer:</strong> Calculations and simulations provided on CompoundCalc are mathematical estimates for educational and planning purposes only and may differ from actual lender, bank, or investment results. Interest rates, compounding frequencies, processing fees, taxation, and individual lender policies affect final outcomes. This platform does not provide certified financial advice. Always consult a licensed financial professional before making financial commitments.
          </p>
        </div>
      </div>
    </div>
  `
})
export class DisclaimerComponent {}
