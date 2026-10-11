import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScenarioComparison } from '../../../core/calculator/models/calculator.types';
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
    <div class="rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] p-5 sm:p-6 shadow-2xs">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#E8E2D4] dark:border-[#2C362E]">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E8E2D4] dark:bg-[#202722] text-[#356B4A] dark:text-[#8FA691] border border-[#D9D5C9] dark:border-[#2C362E]">
              Ledger Analysis
            </span>
            <h3 class="text-base sm:text-lg font-editorial font-bold text-[#202A23] dark:text-[#EDE8DE]">
              Scenario Comparison (Scenario A vs Scenario B)
            </h3>
          </div>
          <p class="text-xs text-[#686B61] dark:text-[#959B8E] mt-1 font-sans">
            Quantify the exact leverage gained by tweaking return rates, annual step-up or tenure.
          </p>
        </div>

        <button
          type="button"
          (click)="close.emit()"
          class="px-3 py-1.5 rounded border border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF] dark:bg-[#141815] text-xs font-semibold text-[#202A23] dark:text-[#EDE8DE] hover:bg-[#E8E2D4] dark:hover:bg-[#202722] transition-colors cursor-pointer active:translate-y-0.5 font-sans"
        >
          Close Comparison
        </button>
      </div>

      <!-- Delta Highlight Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div class="p-4 rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF] dark:bg-[#141815] shadow-2xs">
          <span class="text-xs text-[#686B61] dark:text-[#959B8E] block font-semibold uppercase tracking-wider text-[10px]">Corpus Delta</span>
          <div class="text-xl sm:text-2xl font-editorial font-bold mt-1 tabular-nums" [ngClass]="comparison().deltaFutureValue >= 0 ? 'text-[#356B4A] dark:text-[#66A87E]' : 'text-[#9B3D34]'">
            {{ comparison().deltaFutureValue >= 0 ? '+' : '' }}{{ comparison().deltaFutureValue | inrCurrency:'compact' }}
          </div>
          <span class="text-[11px] text-[#686B61] dark:text-[#959B8E] block mt-0.5 font-mono">
            {{ comparison().futureValuePercentageDifference >= 0 ? '+' : '' }}{{ comparison().futureValuePercentageDifference.toFixed(1) }}% vs Baseline
          </span>
        </div>

        <div class="p-4 rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF] dark:bg-[#141815] shadow-2xs">
          <span class="text-xs text-[#686B61] dark:text-[#959B8E] block font-semibold uppercase tracking-wider text-[10px]">Invested Capital Delta</span>
          <div class="text-xl sm:text-2xl font-editorial font-bold mt-1 text-[#202A23] dark:text-[#EDE8DE] tabular-nums">
            {{ comparison().deltaTotalInvested >= 0 ? '+' : '' }}{{ comparison().deltaTotalInvested | inrCurrency:'compact' }}
          </div>
          <span class="text-[11px] text-[#686B61] dark:text-[#959B8E] block mt-0.5 font-sans">
            Cumulative deposit change
          </span>
        </div>

        <div class="p-4 rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF] dark:bg-[#141815] shadow-2xs">
          <span class="text-xs text-[#686B61] dark:text-[#959B8E] block font-semibold uppercase tracking-wider text-[10px]">Net Compound Growth Delta</span>
          <div class="text-xl sm:text-2xl font-editorial font-bold mt-1 text-[#356B4A] dark:text-[#66A87E] tabular-nums">
            {{ comparison().deltaTotalGrowth >= 0 ? '+' : '' }}{{ comparison().deltaTotalGrowth | inrCurrency:'compact' }}
          </div>
          <span class="text-[11px] text-[#686B61] dark:text-[#959B8E] block mt-0.5 font-sans">
            Pure compound leverage
          </span>
        </div>
      </div>

      <!-- Side-by-Side Comparison Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Scenario A Column (Baseline) -->
        <div class="p-5 rounded-lg border border-[#D9D5C9] dark:border-[#2C362E] bg-[#F8F6EF]/60 dark:bg-[#141815] space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#D9D5C9] dark:border-[#2C362E]">
            <span class="text-sm font-bold font-editorial text-[#202A23] dark:text-[#EDE8DE] flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#78947A]"></span>
              Scenario A (Current Baseline)
            </span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#686B61] dark:text-[#959B8E]">Baseline</span>
          </div>

          <div class="space-y-2 text-xs sm:text-sm font-sans">
            <div class="flex justify-between py-1">
              <span class="text-[#686B61] dark:text-[#959B8E] font-medium">Final Corpus:</span>
              <span class="font-bold font-mono tabular-nums text-[#202A23] dark:text-[#EDE8DE]">{{ comparison().scenarioA.futureValue | inrCurrency:'both' }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-[#686B61] dark:text-[#959B8E] font-medium">Total Invested:</span>
              <span class="font-semibold font-mono tabular-nums text-[#202A23] dark:text-[#EDE8DE]">{{ comparison().scenarioA.totalInvested | inrCurrency:'compact' }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-[#686B61] dark:text-[#959B8E] font-medium">Compound Growth:</span>
              <span class="font-semibold font-mono tabular-nums text-[#356B4A] dark:text-[#66A87E]">{{ comparison().scenarioA.totalGrowth | inrCurrency:'compact' }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-[#686B61] dark:text-[#959B8E] font-medium">Purchasing Power:</span>
              <span class="font-semibold font-mono tabular-nums text-[#A8683B] dark:text-[#D49366]">{{ comparison().scenarioA.realFutureValue | inrCurrency:'compact' }}</span>
            </div>
          </div>
        </div>

        <!-- Scenario B Controls & Result -->
        <div class="p-5 rounded-lg border border-[#356B4A]/50 dark:border-[#356B4A]/40 bg-[#F0F6F2]/70 dark:bg-[#1B2920]/60 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-[#A8C4B0] dark:border-[#2A4836]">
            <span class="text-sm font-bold font-editorial text-[#202A23] dark:text-[#EDE8DE] flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#356B4A]"></span>
              Scenario B (What-If Model)
            </span>
            <span class="text-xs font-bold font-mono text-[#356B4A] dark:text-[#66A87E] tabular-nums">
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
