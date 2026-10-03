import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, InrCurrencyPipe],
  template: `
    <div
      class="rounded-2xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden"
      [ngClass]="{
        'bg-gradient-to-br from-indigo-900/90 via-indigo-950 to-slate-950 text-white border border-indigo-500/30 shadow-xl shadow-indigo-950/30 glow-primary': variant() === 'primary',
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs': variant() === 'secondary',
        'bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-100': variant() === 'success',
        'bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-purple-950 dark:text-purple-100': variant() === 'purple'
      }"
    >
      @if (variant() === 'primary') {
        <!-- Subtle background glow orb -->
        <div class="absolute -right-8 -top-8 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
      }

      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span
          class="text-xs sm:text-sm font-medium tracking-wide uppercase"
          [ngClass]="{
            'text-indigo-200': variant() === 'primary',
            'text-slate-500 dark:text-slate-400': variant() === 'secondary',
            'text-emerald-600 dark:text-emerald-400': variant() === 'success',
            'text-purple-600 dark:text-purple-400': variant() === 'purple'
          }"
        >
          {{ label() }}
        </span>

        @if (badge()) {
          <span
            class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            [ngClass]="{
              'bg-indigo-500/30 text-indigo-100 border border-indigo-400/30': variant() === 'primary',
              'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300': variant() === 'secondary',
              'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300': variant() === 'success',
              'bg-purple-500/20 text-purple-700 dark:text-purple-300': variant() === 'purple'
            }"
          >
            {{ badge() }}
          </span>
        }
      </div>

      <!-- Main Number -->
      <div class="flex items-baseline gap-2 mt-1">
        <span
          class="font-extrabold tracking-tight"
          [ngClass]="{
            'text-3xl sm:text-4xl text-white': variant() === 'primary',
            'text-2xl sm:text-3xl text-slate-900 dark:text-white': variant() === 'secondary',
            'text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-300': variant() === 'success',
            'text-2xl sm:text-3xl text-purple-700 dark:text-purple-300': variant() === 'purple'
          }"
        >
          {{ value() | inrCurrency:'compact' }}
        </span>
      </div>

      <!-- Full Indian Number Subtitle -->
      <p
        class="text-xs mt-1 truncate"
        [ngClass]="{
          'text-indigo-200/80': variant() === 'primary',
          'text-slate-500 dark:text-slate-400': variant() !== 'primary'
        }"
      >
        Exact: {{ value() | inrCurrency:'full' }}
      </p>

      @if (subtext()) {
        <p
          class="text-xs mt-2 pt-2 border-t font-normal leading-relaxed"
          [ngClass]="{
            'border-indigo-800/60 text-indigo-200/70': variant() === 'primary',
            'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400': variant() !== 'primary'
          }"
        >
          {{ subtext() }}
        </p>
      }
    </div>
  `
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly variant = input<'primary' | 'secondary' | 'success' | 'purple'>('secondary');
  readonly badge = input<string>();
  readonly subtext = input<string>();
}
