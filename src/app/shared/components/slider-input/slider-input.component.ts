import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface QuickStep {
  label: string;
  delta: number;
}

@Component({
  selector: 'app-slider-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <label [for]="'input-' + id()" class="text-xs sm:text-sm font-semibold text-[#202A23] dark:text-[#EDE8DE] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#356B4A]"></span>
          <span>{{ label() }}</span>
        </label>

        <div class="relative flex items-center">
          @if (prefix()) {
            <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#686B61] dark:text-[#959B8E] select-none font-mono">
              {{ prefix() }}
            </span>
          }
          <input
            [id]="'input-' + id()"
            [attr.data-testid]="'input-' + id()"
            type="number"
            [min]="min()"
            [max]="max()"
            [step]="step()"
            [value]="value()"
            (input)="onTextInput($event)"
            (change)="onTextCommit($event)"
            (blur)="onTextCommit($event)"
            (keydown.enter)="$any($event.target).blur()"
            [attr.aria-label]="label()"
            class="h-9 sm:h-8 py-1 text-right font-mono font-bold text-base sm:text-sm rounded-md border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] text-[#202A23] dark:text-[#EDE8DE] focus:outline-none focus:ring-2 focus:ring-[#356B4A]/50 focus:border-[#356B4A] transition-all tabular-nums shadow-2xs"
            [ngClass]="inputClasses()"
          />
          @if (suffix()) {
            <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#686B61] dark:text-[#959B8E] select-none font-mono">
              {{ suffix() }}
            </span>
          }
        </div>
      </div>

      <!-- Range Slider -->
      <div class="pt-0.5">
        <input
          type="range"
          [id]="'slider-' + id()"
          [attr.data-testid]="'slider-' + id()"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="sliderValue()"
          (input)="onSliderChange($event)"
          (change)="onSliderChange($event)"
          [attr.aria-label]="label() + ' slider'"
          class="w-full cursor-pointer"
        />
      </div>

      <!-- Quick Step Buttons (Editorial Pill Chips) -->
      @if (quickSteps() && quickSteps()!.length > 0) {
        <div class="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar touch-scroll">
          @for (step of quickSteps(); track step.label) {
            <button
              type="button"
              (click)="applyDelta(step.delta)"
              class="px-2.5 py-1 sm:py-0.5 text-xs sm:text-[11px] min-h-[30px] sm:min-h-0 font-semibold rounded border border-[#D9D5C9] dark:border-[#2C362E] bg-[#E8E2D4]/50 hover:bg-[#E8E2D4] dark:bg-[#202A23] dark:hover:bg-[#2A362D] text-[#202A23] dark:text-[#EDE8DE] transition-colors cursor-pointer active:translate-y-0.5 select-none font-sans shrink-0"
            >
              {{ step.label }}
            </button>
          }
        </div>
      }
    </div>
  `
})
export class SliderInputComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly min = input<number>(0);
  readonly max = input<number>(10000000);
  readonly step = input<number>(1000);
  readonly prefix = input<string>('');
  readonly suffix = input<string>('');
  readonly quickSteps = input<QuickStep[]>([]);

  readonly valueChange = output<number>();

  readonly sliderValue = computed(() => {
    const v = this.value();
    if (isNaN(v)) return this.min();
    return Math.min(this.max(), Math.max(this.min(), v));
  });

  readonly inputClasses = computed(() => {
    const hasPre = !!this.prefix();
    const suf = this.suffix() || '';

    const padLeft = hasPre ? 'pl-7' : 'pl-3';
    let padRight = 'pr-3';
    let width = 'w-28 sm:w-36';

    if (suf === '%') {
      padRight = 'pr-7';
    } else if (suf.length > 3) { // e.g. "Years"
      padRight = 'pr-12 sm:pr-14';
      width = 'w-32 sm:w-40';
    } else if (suf.length > 0) { // e.g. "Yrs"
      padRight = 'pr-9 sm:pr-10';
      width = 'w-28 sm:w-36';
    }

    return `${width} ${padLeft} ${padRight}`;
  });

  onSliderChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.valueChange.emit(val);
    }
  }

  onTextInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    if (raw === '') {
      return;
    }
    const val = Number(raw);
    if (!isNaN(val)) {
      this.valueChange.emit(val);
    }
  }

  onTextCommit(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    let val = Number(raw);
    if (raw === '' || isNaN(val)) {
      val = this.min();
    } else {
      val = Math.min(this.max(), Math.max(this.min(), val));
    }
    input.value = String(val);
    this.valueChange.emit(val);
  }

  applyDelta(delta: number): void {
    const next = Math.min(this.max(), Math.max(this.min(), this.value() + delta));
    this.valueChange.emit(next);
  }
}
