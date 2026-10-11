import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF] dark:bg-[#141815] p-4 sm:p-5 text-xs text-[#686B61] dark:text-[#959B8E] relative">
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 rounded bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] flex items-center justify-center shrink-0 mt-0.5 font-serif font-bold text-xs border border-[#D9D5C9] dark:border-[#2C362E]">
          §
        </div>
        <div class="space-y-1">
          <p class="font-bold font-sans uppercase tracking-wider text-[11px] text-[#202A23] dark:text-[#EDE8DE]">
            Educational & Planning Disclosure
          </p>
          <p class="leading-relaxed font-sans">
            <strong>Notice:</strong> Calculations and simulations provided on CompoundCalc are mathematical estimates for educational and long-term planning purposes only and may differ from actual lender, bank, or mutual fund results. Interest rates, compounding frequencies, processing fees, taxation, and individual lender policies affect final outcomes. This platform does not provide certified financial advice. Always consult a licensed financial advisor before making financial commitments.
          </p>
        </div>
      </div>
    </div>
  `
})
export class DisclaimerComponent {}
