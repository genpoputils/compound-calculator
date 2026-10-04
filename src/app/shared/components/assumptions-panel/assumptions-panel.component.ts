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
    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 shadow-xs backdrop-blur-md">
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Assumptions
          </h3>
        </div>
        <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
          Estimates Only
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
        @for (item of items(); track item.label) {
          <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <span class="text-xs text-slate-600 dark:text-slate-400 font-medium block truncate">{{ item.label }}</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-base font-bold text-slate-900 dark:text-white">{{ item.value }}</span>
              @if (item.badge) {
                <span class="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold">{{ item.badge }}</span>
              }
            </div>
          </div>
        }
      </div>

      <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
        <svg class="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>These are user-defined mathematical assumptions, not guaranteed market returns.</span>
      </div>
    </div>
  `
})
export class AssumptionsPanelComponent {
  readonly items = input.required<AssumptionItem[]>();
}
