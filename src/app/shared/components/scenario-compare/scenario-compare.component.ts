import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculationResult, ScenarioComparison } from '../../../core/calculator/models/calculator.types';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { SliderInputComponent } from '../slider-input/slider-input.component';

export interface ScenarioBParams {
  expectedAnnualReturn: number;
  annualStepUpPercent: number;
  durationYears: number;
  startingMonthlyInvestment: number;
  inflationRate: number;
}

@Component({
  selector: 'app-scenario-compare',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe, SliderInputComponent],
  template: `
    <div class="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/50 dark:from-indigo-950/20 to-transparent p-5 sm:p-6 shadow-xs">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-md bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider">
              Feature
            </span>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Compare Scenarios (Scenario A vs Scenario B)
            </h3>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            See the exact difference when tweaking returns, step-up rates, or duration.
          </p>
        </div>

        <button
          type="button"
          (click)="close.emit()"
          class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Exit Comparison
        </button>
      </div>

      <!-- Delta Highlight Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span class="text-xs text-slate-400 block font-medium">Corpus Difference</span>
          <div class="text-xl sm:text-2xl font-extrabold mt-1" [ngClass]="comparison().deltaFutureValue >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'">
            {{ comparison().deltaFutureValue >= 0 ? '+' : '' }}{{ comparison().deltaFutureValue | inrCurrency:'compact' }}
          </div>
          <span class="text-[11px] text-slate-500 block mt-0.5">
            {{ comparison().futureValuePercentageDifference >= 0 ? '+' : '' }}{{ comparison().futureValuePercentageDifference.toFixed(1) }}% vs Scenario A
          </span>
        </div>

        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span class="text-xs text-slate-400 block font-medium">Extra Capital Invested</span>
          <div class="text-xl sm:text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">
            {{ comparison().deltaTotalInvested >= 0 ? '+' : '' }}{{ comparison().deltaTotalInvested | inrCurrency:'compact' }}
          </div>
          <span class="text-[11px] text-slate-500 block mt-0.5">
            Cumulative deposit change
          </span>
        </div>

        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span class="text-xs text-slate-400 block font-medium">Additional Growth Generated</span>
          <div class="text-xl sm:text-2xl font-extrabold mt-1 text-indigo-600 dark:text-indigo-400">
            {{ comparison().deltaTotalGrowth >= 0 ? '+' : '' }}{{ comparison().deltaTotalGrowth | inrCurrency:'compact' }}
          </div>
          <span class="text-[11px] text-slate-500 block mt-0.5">
            Compound interest leverage
          </span>
        </div>
      </div>

      <!-- Side-by-Side Comparison Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Scenario A Column (Baseline) -->
        <div class="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Scenario A (Current)
            </span>
            <span class="text-xs font-semibold text-slate-500">Baseline</span>
          </div>

          <div class="space-y-2 text-xs sm:text-sm">
            <div class="flex justify-between py-1">
              <span class="text-slate-500">Final Corpus:</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ comparison().scenarioA.futureValue | inrCurrency:'both' }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-500">Total Invested:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ comparison().scenarioA.totalInvested | inrCurrency:'compact' }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-500">Investment Growth:</span>
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ comparison().scenarioA.totalGrowth | inrCurrency:'compact' }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-500">Purchasing Power:</span>
              <span class="font-semibold text-purple-600 dark:text-purple-400">{{ comparison().scenarioA.realFutureValue | inrCurrency:'compact' }}</span>
            </div>
          </div>
        </div>

        <!-- Scenario B Controls & Result -->
        <div class="p-5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/30 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-900/50">
            <span class="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Scenario B (What-If Model)
            </span>
            <span class="text-xs font-bold text-amber-600 dark:text-amber-400">
              {{ comparison().scenarioB.futureValue | inrCurrency:'compact' }}
            </span>
          </div>

          <!-- Interactive Inputs for Scenario B -->
          <div class="space-y-3">
            <app-slider-input
              id="scenB-return"
              label="Expected Return"
              [value]="paramsB().expectedAnnualReturn"
              [min]="1"
              [max]="30"
              [step]="0.5"
              suffix="%"
              (valueChange)="updateParam('expectedAnnualReturn', $event)"
            />

            <app-slider-input
              id="scenB-stepup"
              label="Annual Step-Up"
              [value]="paramsB().annualStepUpPercent"
              [min]="0"
              [max]="30"
              [step]="1"
              suffix="%"
              (valueChange)="updateParam('annualStepUpPercent', $event)"
            />

            <app-slider-input
              id="scenB-duration"
              label="Duration"
              [value]="paramsB().durationYears"
              [min]="1"
              [max]="50"
              [step]="1"
              suffix="Yrs"
              (valueChange)="updateParam('durationYears', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScenarioCompareComponent {
  readonly comparison = input.required<ScenarioComparison>();
  readonly paramsB = input.required<ScenarioBParams>();

  readonly paramsBChange = output<ScenarioBParams>();
  readonly close = output<void>();

  updateParam(key: keyof ScenarioBParams, value: number): void {
    const updated = {
      ...this.paramsB(),
      [key]: value
    };
    this.paramsBChange.emit(updated);
  }
}
