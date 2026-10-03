import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CalculationMode,
  CalculationResult,
  CompoundingFrequency,
  ContributionFrequency,
  DurationUnit,
  ScenarioComparison
} from '../../core/calculator/models/calculator.types';
import {
  CalculationEngineService,
  CalculatorState,
  DEFAULT_CALCULATOR_STATE
} from '../../core/calculator/calculation-engine.service';
import { UrlStateService } from '../../core/services/url-state.service';
import { ToastService } from '../../core/services/toast.service';
import { StorageService } from '../../core/services/storage.service';
import { SeoService } from '../../core/services/seo.service';
import { SEO_PAGES_DATA, SeoPageContent } from '../../core/seo/seo-content.data';
import { formatInrCompact, formatInrFull } from '../../core/utils/currency.util';
import { CurrencyService } from '../../core/services/currency.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { SliderInputComponent } from '../../shared/components/slider-input/slider-input.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { AssumptionsPanelComponent, AssumptionItem } from '../../shared/components/assumptions-panel/assumptions-panel.component';
import { YearlyTableComponent } from '../../shared/components/yearly-table/yearly-table.component';
import { ChartViewComponent } from '../../shared/components/chart-view/chart-view.component';
import { ScenarioCompareComponent, ScenarioBParams } from '../../shared/components/scenario-compare/scenario-compare.component';

@Component({
  selector: 'app-calculator-view',
  standalone: true,
  imports: [
    CommonModule,
    InrCurrencyPipe,
    SliderInputComponent,
    MetricCardComponent,
    AssumptionsPanelComponent,
    YearlyTableComponent,
    ChartViewComponent,
    ScenarioCompareComponent
  ],
  templateUrl: './calculator-view.component.html'
})
export class CalculatorViewComponent implements OnInit {
  protected readonly Math = Math;
  private readonly engine = inject(CalculationEngineService);
  private readonly urlStateService = inject(UrlStateService);
  private readonly toastService = inject(ToastService);
  private readonly storageService = inject(StorageService);
  private readonly seoService = inject(SeoService);
  readonly currencyService = inject(CurrencyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Active Mode
  readonly activeMode = signal<CalculationMode>('step-up');

  // Master State
  readonly state = signal<CalculatorState>(JSON.parse(JSON.stringify(DEFAULT_CALCULATOR_STATE)));

  // Scenario Comparison Toggle & Scenario B State
  readonly compareMode = signal<boolean>(false);
  readonly scenarioBParams = signal<ScenarioBParams>({
    expectedAnnualReturn: 12,
    annualStepUpPercent: 5,
    durationYears: 20,
    startingMonthlyInvestment: 20000,
    inflationRate: 6
  });

  // Optional retirement expense projection toggle
  readonly showRetirementExpenseCalc = signal<boolean>(false);

  // Main Calculation Result Signal
  readonly result = computed<CalculationResult>(() => {
    return this.engine.calculate(this.activeMode(), this.state());
  });

  // Scenario Comparison Result
  readonly comparisonResult = computed<ScenarioComparison | null>(() => {
    if (!this.compareMode()) return null;
    const currentRes = this.result();
    const bParams = this.scenarioBParams();

    // Construct Scenario B state
    const stateB: CalculatorState = JSON.parse(JSON.stringify(this.state()));
    stateB.stepUpInput.expectedAnnualReturn = bParams.expectedAnnualReturn;
    stateB.stepUpInput.annualStepUpPercent = bParams.annualStepUpPercent;
    stateB.stepUpInput.durationYears = bParams.durationYears;
    stateB.stepUpInput.startingMonthlyInvestment = bParams.startingMonthlyInvestment;
    stateB.stepUpInput.inflationRate = bParams.inflationRate;

    const resB = this.engine.calculate(this.activeMode(), stateB);
    return this.engine.compareScenarios(currentRes, resB);
  });

  // Assumptions Items for Assumptions Panel
  readonly assumptionsList = computed<AssumptionItem[]>(() => {
    const mode = this.activeMode();
    const s = this.state();

    switch (mode) {
      case 'compound-interest':
        return [
          { label: 'Annual Interest', value: `${s.compoundInput.annualInterestRate}%` },
          { label: 'Compounding', value: this.capitalize(s.compoundInput.compoundingFrequency) },
          { label: 'Duration', value: `${s.compoundInput.duration} ${this.capitalize(s.compoundInput.durationUnit)}` },
          { label: 'Inflation', value: `${s.compoundInput.inflationRate || 0}%` }
        ];
      case 'regular-investment':
        return [
          { label: 'Expected Return', value: `${s.regularInput.expectedAnnualReturn}%` },
          { label: 'Frequency', value: this.capitalize(s.regularInput.contributionFrequency) },
          { label: 'Duration', value: `${s.regularInput.durationYears} Years` },
          { label: 'Inflation', value: `${s.regularInput.inflationRate || 0}%` }
        ];
      case 'sip':
        return [
          { label: 'Expected Return', value: `${s.sipInput.expectedAnnualReturn}%` },
          { label: 'SIP Frequency', value: 'Monthly' },
          { label: 'Duration', value: `${s.sipInput.durationYears} Years` },
          { label: 'Inflation', value: `${s.sipInput.inflationRate || 0}%` }
        ];
      case 'step-up':
        return [
          { label: 'Expected Return', value: `${s.stepUpInput.expectedAnnualReturn}%` },
          { label: 'Annual Step-Up', value: `${s.stepUpInput.annualStepUpPercent}%` },
          { label: 'Duration', value: `${s.stepUpInput.durationYears} Years` },
          { label: 'Inflation', value: `${s.stepUpInput.inflationRate || 0}%` }
        ];
      case 'retirement':
        return [
          { label: 'Expected Return', value: `${s.retirementInput.expectedAnnualReturn}%` },
          { label: 'Step-Up Rate', value: `${s.retirementInput.annualStepUpPercent}%` },
          { label: 'Accumulation Time', value: `${s.retirementInput.retirementAge - s.retirementInput.currentAge} Years` },
          { label: 'Annual Inflation', value: `${s.retirementInput.inflationRate}%` }
        ];
      case 'inflation':
        return [
          { label: 'Annual Inflation', value: `${s.inflationInput.inflationRate}%` },
          { label: 'Horizon', value: `${s.inflationInput.years} Years` },
          { label: 'Compounding', value: 'Annual' },
          { label: 'Real Asset', value: 'Cash' }
        ];
      case 'savings-goal':
        return [
          { label: 'Target Corpus', value: this.currencyService.formatCompact(s.savingsGoalInput.targetAmount) },
          { label: 'Expected Return', value: `${s.savingsGoalInput.expectedAnnualReturn}%` },
          { label: 'Target Timeline', value: `${s.savingsGoalInput.durationYears} Years` },
          { label: 'Contribution', value: this.capitalize(s.savingsGoalInput.contributionFrequency) },
          { label: 'Inflation', value: `${s.savingsGoalInput.inflationRate || 0}%` }
        ];
      case 'swp':
        return [
          { label: 'Initial Corpus', value: this.currencyService.formatCompact(s.swpInput.initialCorpus) },
          { label: 'Monthly Withdrawal', value: this.currencyService.formatCompact(s.swpInput.monthlyWithdrawal) },
          { label: 'Expected Return', value: `${s.swpInput.expectedAnnualReturn}%` },
          { label: 'Duration', value: `${s.swpInput.durationYears} Years` },
          { label: 'Annual Increase', value: `${s.swpInput.annualWithdrawalIncreasePercent || 0}%` },
          { label: 'Inflation', value: `${s.swpInput.inflationRate || 0}%` }
        ];
      default:
        return [];
    }
  });

  readonly activeInflationRate = computed<number>(() => {
    const mode = this.activeMode();
    const s = this.state();
    switch (mode) {
      case 'compound-interest':
        return s.compoundInput.inflationRate ?? 0;
      case 'regular-investment':
        return s.regularInput.inflationRate ?? 0;
      case 'sip':
        return s.sipInput.inflationRate ?? 0;
      case 'step-up':
        return s.stepUpInput.inflationRate ?? 0;
      case 'retirement':
        return s.retirementInput.inflationRate ?? 0;
      case 'inflation':
        return s.inflationInput.inflationRate ?? 0;
      case 'savings-goal':
        return s.savingsGoalInput.inflationRate ?? 0;
      case 'swp':
        return s.swpInput.inflationRate ?? 0;
      default:
        return 0;
    }
  });

  // Current Mode SEO Page Content
  readonly currentSeoData = computed<SeoPageContent>(() => {
    return SEO_PAGES_DATA[this.activeMode()];
  });

  ngOnInit(): void {
    // 1. Detect route path to determine mode
    const path = this.router.url.split('?')[0];
    const modeFromPath = this.getModeFromPath(path);
    if (modeFromPath) {
      this.activeMode.set(modeFromPath);
    }

    // 2. Read query params if present to restore state
    this.route.queryParams.subscribe(params => {
      if (params && Object.keys(params).length > 0) {
        const restored = this.urlStateService.applyQueryParams(params, this.state(), this.activeMode());
        this.state.set(restored);
      } else if (this.isBrowser) {
        // Fallback to local storage if available
        const saved = this.storageService.getItem<CalculatorState | null>('cc_calc_state', null);
        if (saved) {
          this.state.set(saved);
        }
      }
      this.updateSeo();
    });
  }

  setMode(mode: CalculationMode): void {
    this.activeMode.set(mode);
    const targetPath = SEO_PAGES_DATA[mode].path;

    // Navigate to dedicated SEO route and sync params
    this.urlStateService.syncUrl(mode, this.state(), targetPath);
    this.updateSeo();
    this.saveStateLocally();
  }

  updateSeo(): void {
    const seoData = this.currentSeoData();
    this.seoService.updateMeta(seoData.seo);
  }

  // State Mutation Helpers for Inputs
  updateCompound(key: keyof CalculatorState['compoundInput'], value: any): void {
    this.state.update(s => ({
      ...s,
      compoundInput: { ...s.compoundInput, [key]: value }
    }));
    this.afterInputUpdate();
  }

  updateRegular(key: keyof CalculatorState['regularInput'], value: any): void {
    this.state.update(s => ({
      ...s,
      regularInput: { ...s.regularInput, [key]: value }
    }));
    this.afterInputUpdate();
  }

  updateSip(key: keyof CalculatorState['sipInput'], value: any): void {
    this.state.update(s => ({
      ...s,
      sipInput: { ...s.sipInput, [key]: value }
    }));
    this.afterInputUpdate();
  }

  updateStepUp(key: keyof CalculatorState['stepUpInput'], value: any): void {
    this.state.update(s => ({
      ...s,
      stepUpInput: { ...s.stepUpInput, [key]: value }
    }));
    this.afterInputUpdate();
  }

  updateRetirement(key: keyof CalculatorState['retirementInput'], value: any): void {
    this.state.update(s => ({
      ...s,
      retirementInput: { ...s.retirementInput, [key]: value }
    }));
    this.afterInputUpdate();
  }

  updateInflation(key: keyof CalculatorState['inflationInput'], value: any): void {
    this.state.update(s => ({
      ...s,
      inflationInput: { ...s.inflationInput, [key]: value }
    }));
    this.afterInputUpdate();
  }

  updateSavingsGoal(key: keyof CalculatorState['savingsGoalInput'], value: any): void {
    this.state.update(s => ({
      ...s,
      savingsGoalInput: { ...s.savingsGoalInput, [key]: value }
    }));
    this.afterInputUpdate();
  }

  updateSwp(key: keyof CalculatorState['swpInput'], value: any): void {
    this.state.update(s => ({
      ...s,
      swpInput: { ...s.swpInput, [key]: value }
    }));
    this.afterInputUpdate();
  }

  private afterInputUpdate(): void {
    const currentPath = SEO_PAGES_DATA[this.activeMode()].path;
    this.urlStateService.syncUrl(this.activeMode(), this.state(), currentPath);
    this.saveStateLocally();
  }

  private saveStateLocally(): void {
    if (this.isBrowser) {
      this.storageService.setItem('cc_calc_state', this.state());
    }
  }

  // Quick Action Handlers
  copySummary(): void {
    const res = this.result();
    const mode = this.activeMode();
    let formattedSummary = '';

    if (mode === 'swp') {
      const isDepleted = res.metadata?.isDepleted;
      formattedSummary = [
        `📊 SWP (Systematic Withdrawal Plan) Summary`,
        `---------------------------------------`,
        `Initial Corpus: ${this.currencyService.formatFull(res.metadata?.initialCorpus || 0)}`,
        `Monthly Withdrawal: ${this.currencyService.formatFull(res.metadata?.monthlyWithdrawal || 0)}/mo`,
        `Duration: ${res.durationYears} Years`,
        `Total Payout Received: ${this.currencyService.formatFull(res.totalInvested)}`,
        `Total Returns Generated: ${this.currencyService.formatFull(res.totalGrowth)}`,
        isDepleted
          ? `Status: Corpus Depleted in Year ${res.metadata?.depletionYear} (Month ${res.metadata?.depletionMonth})`
          : `Remaining Balance: ${this.currencyService.formatFull(res.futureValue)} (${this.currencyService.formatCompact(res.futureValue)})`,
        `Real Value (Today's Money): ${this.currencyService.formatFull(res.realFutureValue)}`,
        `---------------------------------------`,
        `Calculated free at: https://genpoputils.github.io/compound-calculator/swp-calculator`
      ].join('\n');
    } else {
      formattedSummary = [
        `📊 Compound Calculator Summary (${this.capitalize(mode)})`,
        `---------------------------------------`,
        `Final Value: ${this.currencyService.formatFull(res.futureValue)} (${this.currencyService.formatCompact(res.futureValue)})`,
        `Total Invested: ${this.currencyService.formatFull(res.totalInvested)}`,
        `Total Growth: ${this.currencyService.formatFull(res.totalGrowth)}`,
        `Inflation-adjusted (Today's Value): ${this.currencyService.formatFull(res.realFutureValue)}`,
        `Duration: ${res.durationYears} Years`,
        `---------------------------------------`,
        `Calculated free at: https://genpoputils.github.io/compound-calculator`
      ].join('\n');
    }

    if (this.isBrowser && navigator.clipboard) {
      navigator.clipboard.writeText(formattedSummary).then(() => {
        this.toastService.show('Calculation copied to clipboard!', 'success');
      });
    }
  }

  shareCalculation(): void {
    const targetPath = SEO_PAGES_DATA[this.activeMode()].path;
    const shareUrl = this.urlStateService.getShareableUrl(this.activeMode(), this.state(), targetPath);

    if (this.isBrowser && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.toastService.show('Share link copied to clipboard!', 'success');
      });
    }
  }

  resetToDefaults(): void {
    this.state.set(JSON.parse(JSON.stringify(DEFAULT_CALCULATOR_STATE)));
    if (this.isBrowser) {
      this.storageService.removeItem('cc_calc_state');
    }
    const targetPath = SEO_PAGES_DATA[this.activeMode()].path;
    this.urlStateService.syncUrl(this.activeMode(), this.state(), targetPath);
    this.toastService.show('Calculator reset to default parameters.', 'info');
  }

  printCalculation(): void {
    if (this.isBrowser) {
      window.print();
    }
  }

  scrollToCalculator(): void {
    if (this.isBrowser) {
      const el = document.getElementById('main-calculator-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
  }

  private getModeFromPath(path: string): CalculationMode | null {
    for (const [mode, config] of Object.entries(SEO_PAGES_DATA)) {
      if (config.path === path) {
        return mode as CalculationMode;
      }
    }
    return null;
  }
}
