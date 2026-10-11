import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AssumptionItem {
  label: string;
  value: string;
  badge?: string;
}

@Component({
  selector: 'app-assumptions-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] p-5 shadow-2xs">
      <div class="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#E8E2D4] dark:border-[#2C362E]">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#356B4A]"></span>
          <h2 class="text-xs font-bold font-sans text-[#202A23] dark:text-[#EDE8DE] uppercase tracking-wider">
            Calculation Assumptions
          </h2>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]">
          Hypothetical Estimates
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
        @for (item of items(); track item.label) {
          <div class="p-3 rounded-lg bg-[#F8F6EF] dark:bg-[#141815] border border-[#D9D5C9] dark:border-[#2C362E]">
            <span class="text-xs text-[#686B61] dark:text-[#959B8E] font-medium block truncate">{{ item.label }}</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-sm sm:text-base font-bold font-mono text-[#202A23] dark:text-[#EDE8DE] tabular-nums">{{ item.value }}</span>
              @if (item.badge) {
                <span class="text-[10px] text-[#356B4A] dark:text-[#8FA691] font-semibold">{{ item.badge }}</span>
              }
            </div>
          </div>
        }
      </div>

      <div class="flex items-center gap-2 text-xs text-[#686B61] dark:text-[#959B8E] pt-1 font-sans">
        <svg class="w-3.5 h-3.5 text-[#356B4A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>These figures are user-defined mathematical assumptions for educational planning, not guaranteed market returns.</span>
      </div>
    </div>
  `
})
export class AssumptionsPanelComponent {
  readonly items = input.required<AssumptionItem[]>();
}
