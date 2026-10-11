import { Component, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, InrCurrencyPipe],
  template: `
    <div
      class="rounded-xl p-4 sm:p-6 transition-all duration-200 relative overflow-hidden border"
      [ngClass]="{
        'bg-[#1E3B29] dark:bg-[#182C20] text-[#F8F6EF] border-[#356B4A] shadow-xs': variant() === 'primary',
        'bg-white dark:bg-[#181E19] text-[#202A23] dark:text-[#EDE8DE] border-[#D9D5C9] dark:border-[#2C362E] shadow-2xs': variant() === 'secondary',
        'bg-[#F0F6F2] dark:bg-[#1B2920] border-[#A8C4B0] dark:border-[#2A4836] text-[#202A23] dark:text-[#EDE8DE]': variant() === 'success',
        'bg-[#F5F2E9] dark:bg-[#252822] border-[#D9D5C9] dark:border-[#384034] text-[#202A23] dark:text-[#EDE8DE]': variant() === 'purple',
        'bg-[#FDF3F2] dark:bg-[#2C1F1E] border-[#E8C2BF] dark:border-[#4D2E2B] text-[#202A23] dark:text-[#EDE8DE]': variant() === 'danger'
      }"
    >
      <!-- Editorial Halftone accent for primary card -->
      @if (variant() === 'primary') {
        <div class="absolute right-0 top-0 w-28 h-28 opacity-10 pointer-events-none halftone-dots"></div>
      }

      <div class="flex items-center justify-between gap-2 mb-2">
        <span
          class="text-xs font-semibold tracking-wider uppercase font-sans"
          [ngClass]="{
            'text-[#D4E4D9]': variant() === 'primary',
            'text-[#686B61] dark:text-[#959B8E]': variant() === 'secondary',
            'text-[#356B4A] dark:text-[#8FA691] font-bold': variant() === 'success',
            'text-[#686B61] dark:text-[#959B8E] font-bold': variant() === 'purple',
            'text-[#9B3D34] dark:text-[#E2837A] font-bold': variant() === 'danger'
          }"
        >
          {{ label() }}
        </span>

        @if (badge()) {
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border"
            [ngClass]="{
              'bg-[#2A5139] text-[#E8F3EB] border-[#447A58]': variant() === 'primary',
              'bg-[#F8F6EF] dark:bg-[#202A23] text-[#686B61] dark:text-[#EDE8DE] border-[#D9D5C9] dark:border-[#2C362E]': variant() === 'secondary',
              'bg-[#E1EDE4] dark:bg-[#24382B] text-[#356B4A] dark:text-[#A8C4B0] border-[#356B4A]/30': variant() === 'success',
              'bg-[#E8E2D4] dark:bg-[#30332B] text-[#202A23] dark:text-[#EDE8DE] border-[#D9D5C9] dark:border-[#404838]': variant() === 'purple',
              'bg-[#F9E2E0] dark:bg-[#3D2523] text-[#9B3D34] dark:text-[#F0AAA4] border-[#E8C2BF]': variant() === 'danger'
            }"
          >
            {{ badge() }}
          </span>
        }
      </div>

      <!-- Main Number (Tabular Editorial Typography with subtle update animation) -->
      <div class="flex items-baseline gap-2 mt-1">
        <span
          class="font-editorial font-bold tracking-tight tabular-nums transition-transform inline-block"
          [class.animate-value-flash]="isUpdating()"
          [ngClass]="{
            'text-3xl sm:text-4xl text-[#FFFFFF]': variant() === 'primary',
            'text-2xl sm:text-3xl text-[#202A23] dark:text-[#FFFFFF]': variant() === 'secondary',
            'text-2xl sm:text-3xl text-[#356B4A] dark:text-[#66A87E]': variant() === 'success',
            'text-2xl sm:text-3xl text-[#202A23] dark:text-[#EDE8DE]': variant() === 'purple',
            'text-2xl sm:text-3xl text-[#A6372D] dark:text-[#E87368]': variant() === 'danger'
          }"
        >
          {{ value() | inrCurrency:'compact' }}
        </span>
      </div>

      <!-- Full Indian Number Subtitle -->
      <p
        class="text-xs mt-1.5 tabular-nums font-mono break-all"
        [ngClass]="{
          'text-[#C1D7C8]': variant() === 'primary',
          'text-[#686B61] dark:text-[#959B8E]': variant() !== 'primary'
        }"
      >
        Exact: {{ value() | inrCurrency:'full' }}
      </p>

      @if (subtext()) {
        <p
          class="text-xs mt-2.5 pt-2 border-t leading-relaxed font-sans"
          [ngClass]="{
            'border-[#2A5139] text-[#D8E6DC]': variant() === 'primary',
            'border-[#E8E2D4] dark:border-[#2C362E] text-[#686B61] dark:text-[#959B8E]': variant() !== 'primary'
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
  readonly variant = input<'primary' | 'secondary' | 'success' | 'purple' | 'danger'>('secondary');
  readonly badge = input<string>();
  readonly subtext = input<string>();

  readonly isUpdating = signal<boolean>(false);
  private prevValue: number | null = null;
  private flashTimeout: any = null;

  constructor() {
    effect(() => {
      const current = this.value();
      if (this.prevValue !== null && this.prevValue !== current) {
        this.isUpdating.set(true);
        if (this.flashTimeout) clearTimeout(this.flashTimeout);
        this.flashTimeout = setTimeout(() => {
          this.isUpdating.set(false);
        }, 260);
      }
      this.prevValue = current;
    });
  }
}
