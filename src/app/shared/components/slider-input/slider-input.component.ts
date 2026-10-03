import { Component, input, output } from '@angular/core';
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
        <label [for]="'input-' + id()" class="text-sm font-medium text-slate-700 dark:text-slate-300">
          {{ label() }}
        </label>
        <div class="relative flex items-center">
          @if (prefix()) {
            <span class="absolute left-2.5 text-xs font-semibold text-slate-400 select-none">
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
            (input)="onInputChange($event)"
            [attr.aria-label]="label()"
            class="w-32 sm:w-36 py-1.5 text-right font-semibold text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-2xs"
            [ngClass]="{
              'pl-7 pr-3': prefix() && !suffix(),
              'pl-3 pr-7': !prefix() && suffix(),
              'pl-7 pr-7': prefix() && suffix(),
              'px-3': !prefix() && !suffix()
            }"
          />
          @if (suffix()) {
            <span class="absolute right-2.5 text-xs font-semibold text-slate-400 select-none">
              {{ suffix() }}
            </span>
          }
        </div>
      </div>

      <!-- Range Slider -->
      <div class="pt-1">
        <input
          type="range"
          [id]="'slider-' + id()"
          [attr.data-testid]="'slider-' + id()"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="value()"
          (input)="onSliderChange($event)"
          [attr.aria-label]="label() + ' slider'"
          class="w-full accent-indigo-600 dark:accent-indigo-500"
        />
      </div>

      <!-- Quick Step Buttons -->
      @if (quickSteps() && quickSteps()!.length > 0) {
        <div class="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
          @for (step of quickSteps(); track step.label) {
            <button
              type="button"
              (click)="applyDelta(step.delta)"
              class="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
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

  onSliderChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.valueChange.emit(val);
  }

  onInputChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.valueChange.emit(Math.min(this.max(), Math.max(this.min(), val)));
    }
  }

  applyDelta(delta: number): void {
    const next = Math.min(this.max(), Math.max(this.min(), this.value() + delta));
    this.valueChange.emit(next);
  }
}
