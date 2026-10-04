import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import {
  AmortizationEntry,
  AnnualAmortizationSummary,
  PrepaymentFrequency,
  PrepaymentMode,
  PrepaymentSimulationResult,
  simulatePrepayment
} from '../../core/finance';
import { CurrencyService } from '../../core/services/currency.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { StorageService } from '../../core/services/storage.service';
import { SeoService } from '../../core/services/seo.service';
import { SEO_PAGES_DATA, SeoPageContent } from '../../core/seo/seo-content.data';
import { CalculationMode } from '../../core/calculator/models/calculator.types';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { AdBannerComponent } from '../../shared/components/ad-banner/ad-banner.component';

Chart.register(...registerables);

export type LoanPresetType = 'home' | 'car' | 'personal' | 'custom';
export type LoanChartTab = 'balance' | 'breakdown' | 'cumulative-interest' | 'annual-bar';

export interface LoanCalculatorState {
  loanAmount: number;
  annualInterestRate: number;
  tenureYears: number;
  tenureUnit: 'years' | 'months';
  startDate: string; // YYYY-MM
  enablePrepayment: boolean; // Prepayment simulation toggle (opt-in / opt-out)
  prepaymentMode: PrepaymentMode;
  oneTimePrepaymentAmount: number;
  oneTimePrepaymentMonth: number;
  prepaymentFrequency: PrepaymentFrequency;
  recurringPrepaymentAmount: number;
  recurringStartMonth: number;
  annualEmiIncreasePercent: number;
  annualEmiIncreaseAmount: number;
  showAdvanced: boolean;
  activePreset: LoanPresetType;
}

const DEFAULT_LOAN_STATE: LoanCalculatorState = {
  loanAmount: 5000000, // ₹50 Lakh default
  annualInterestRate: 8.5,
  tenureYears: 20,
  tenureUnit: 'years',
  startDate: new Date().toISOString().substring(0, 7), // "YYYY-MM"
  enablePrepayment: true,
  prepaymentMode: 'reduce-tenure',
  oneTimePrepaymentAmount: 500000, // ₹5 Lakh after 3 years benchmark
  oneTimePrepaymentMonth: 36,
  prepaymentFrequency: 'one-time',
  recurringPrepaymentAmount: 0,
  recurringStartMonth: 12,
  annualEmiIncreasePercent: 0,
  annualEmiIncreaseAmount: 0,
  showAdvanced: false,
  activePreset: 'home'
};

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCurrencyPipe, AdBannerComponent],
  templateUrl: './loan-calculator.component.html'
})
export class LoanCalculatorComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly Math = Math;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly currencyService = inject(CurrencyService);
  readonly themeService = inject(ThemeService);
  private readonly toastService = inject(ToastService);
  private readonly storageService = inject(StorageService);
  private readonly seoService = inject(SeoService);

  // View Child for Chart Canvas
  readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chartInstance: Chart | null = null;

  // Active Mode for SEO and Navigation (e.g. 'loan-prepayment', 'emi', 'loan-amortization', 'home-loan', 'car-loan', 'loan')
  readonly activeMode = signal<CalculationMode>('loan-prepayment');

  // Master State
  readonly state = signal<LoanCalculatorState>({ ...DEFAULT_LOAN_STATE });

  // Amortization Table View controls
  readonly scheduleViewMode = signal<'monthly' | 'annual'>('monthly');
  readonly scheduleRowsPerPage = signal<number>(24);
  readonly scheduleCurrentPage = signal<number>(1);

  // Active Chart Tab
  readonly activeChartTab = signal<LoanChartTab>('balance');

  private isInternalUrlSync = false;
  private urlSyncTimeout: any = null;

  constructor() {
    effect(() => {
      // Re-render chart automatically whenever active currency or theme changes
      this.currencyService.selectedCurrency();
      this.themeService.isDark();
      if (this.isBrowser) {
        this.renderOrUpdateChart();
      }
    });
  }

  // Prepayment active status flag
  readonly hasPrepayment = computed<boolean>(() => {
    const s = this.state();
    return s.enablePrepayment && (
      (s.oneTimePrepaymentAmount > 0) ||
      (s.recurringPrepaymentAmount > 0) ||
      (s.annualEmiIncreasePercent > 0) ||
      (s.annualEmiIncreaseAmount > 0)
    );
  });

  // Reactive Simulation Result
  readonly simulation = computed<PrepaymentSimulationResult>(() => {
    const s = this.state();
    const tenureMonths = s.tenureUnit === 'years' ? s.tenureYears * 12 : s.tenureYears;

    return simulatePrepayment({
      loanAmount: s.loanAmount,
      annualInterestRate: s.annualInterestRate,
      tenureMonths,
      startDate: s.startDate ? `${s.startDate}-01` : undefined,
      mode: s.prepaymentMode,
      oneTimePrepaymentAmount: s.enablePrepayment ? s.oneTimePrepaymentAmount : 0,
      oneTimePrepaymentMonth: s.oneTimePrepaymentMonth,
      prepaymentFrequency: s.prepaymentFrequency,
      recurringPrepaymentAmount: s.enablePrepayment ? s.recurringPrepaymentAmount : 0,
      recurringStartMonth: s.recurringStartMonth,
      annualEmiIncreasePercent: s.enablePrepayment ? s.annualEmiIncreasePercent : 0,
      annualEmiIncreaseAmount: s.enablePrepayment ? s.annualEmiIncreaseAmount : 0
    });
  });

  // Table pagination items
  readonly visibleMonthlyEntries = computed<AmortizationEntry[]>(() => {
    const list = this.simulation().monthlySchedule;
    const pageSize = this.scheduleRowsPerPage();
    if (pageSize >= list.length) return list;
    const start = (this.scheduleCurrentPage() - 1) * pageSize;
    return list.slice(start, start + pageSize);
  });

  readonly totalMonthlyPages = computed<number>(() => {
    const list = this.simulation().monthlySchedule;
    const pageSize = this.scheduleRowsPerPage();
    return Math.max(1, Math.ceil(list.length / pageSize));
  });

  // Current Mode SEO
  readonly currentSeoData = computed<SeoPageContent>(() => {
    return SEO_PAGES_DATA[this.activeMode()] || SEO_PAGES_DATA['loan-prepayment'];
  });

  ngOnInit(): void {
    // 1. Detect route to set preset and activeMode
    const path = this.router.url.split('?')[0];
    this.configureModeFromPath(path);

    // 2. Read query params if present
    this.route.queryParams.subscribe(params => {
      if (this.isInternalUrlSync) {
        return;
      }
      if (params && Object.keys(params).length > 0) {
        this.applyUrlParams(params);
      } else if (this.isBrowser) {
        // Load saved state from local storage if available
        const saved = this.storageService.getItem<LoanCalculatorState | null>('cc_loan_state', null);
        if (saved) {
          this.state.set({ ...DEFAULT_LOAN_STATE, ...saved });
        }
      }
      this.updateSeo();
      this.renderOrUpdateChart();
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.renderOrUpdateChart(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.urlSyncTimeout) {
      clearTimeout(this.urlSyncTimeout);
      this.urlSyncTimeout = null;
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  // --- Dynamic Input Handlers (Prevent premature clamping while backspacing/typing) ---

  onLoanAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    if (raw === '') return;
    const val = Number(raw);
    if (!isNaN(val)) {
      this.updateField('loanAmount', val);
    }
  }

  onLoanAmountBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    let val = Number(raw);
    const preset = this.state().activePreset;
    const defaultAmount = preset === 'car' ? 1200000 : preset === 'personal' ? 500000 : 5000000;

    if (raw === '' || isNaN(val)) {
      val = defaultAmount;
    } else if (val < 10000) {
      val = 10000;
    } else if (val > 500000000) {
      val = 500000000;
    }
    input.value = String(val);
    this.updateField('loanAmount', val);
  }

  onRateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    if (raw === '') return;
    const val = Number(raw);
    if (!isNaN(val)) {
      this.updateField('annualInterestRate', val);
    }
  }

  onRateBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    let val = Number(raw);
    const preset = this.state().activePreset;
    const defaultRate = preset === 'car' ? 9.0 : preset === 'personal' ? 12.0 : 8.5;

    if (raw === '' || isNaN(val) || val <= 0) {
      val = defaultRate;
    } else if (val > 30) {
      val = 30;
    } else if (val < 0.1) {
      val = 0.1;
    }
    input.value = String(val);
    this.updateField('annualInterestRate', val);
  }

  onTenureInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    if (raw === '') return;
    const val = Number(raw);
    if (!isNaN(val)) {
      this.updateField('tenureYears', val);
    }
  }

  onTenureBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    let val = Number(raw);
    const isYears = this.state().tenureUnit === 'years';
    const preset = this.state().activePreset;
    const defaultTenure = preset === 'car' ? (isYears ? 5 : 60) : preset === 'personal' ? (isYears ? 3 : 36) : (isYears ? 20 : 240);
    const minVal = isYears ? 1 : 12;
    const maxVal = isYears ? 40 : 480;

    if (raw === '' || isNaN(val) || val < minVal) {
      val = defaultTenure;
    } else if (val > maxVal) {
      val = maxVal;
    }
    input.value = String(val);
    this.updateField('tenureYears', val);
  }

  onPrepaymentInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    if (raw === '') return;
    const val = Number(raw);
    if (!isNaN(val)) {
      this.updateField('oneTimePrepaymentAmount', Math.max(0, val));
    }
  }

  onPrepaymentBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    let val = Number(raw);
    if (raw === '' || isNaN(val) || val < 0) {
      val = 0;
    } else if (val > 100000000) {
      val = 100000000;
    }
    input.value = String(val);
    this.updateField('oneTimePrepaymentAmount', val);
  }

  onRecurringInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    if (raw === '') return;
    const val = Number(raw);
    if (!isNaN(val)) {
      this.updateField('recurringPrepaymentAmount', Math.max(0, val));
    }
  }

  onRecurringBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    let val = Number(raw);
    if (raw === '' || isNaN(val) || val < 0) {
      val = 0;
    } else if (val > 50000000) {
      val = 50000000;
    }
    input.value = String(val);
    this.updateField('recurringPrepaymentAmount', val);
  }

  // --- State Updates & Mutations ---

  updateField<K extends keyof LoanCalculatorState>(key: K, value: LoanCalculatorState[K]): void {
    this.state.update(s => {
      const next = { ...s, [key]: value };
      const maxMonths = next.tenureUnit === 'years' ? next.tenureYears * 12 : next.tenureYears;
      if (next.oneTimePrepaymentMonth > maxMonths) {
        next.oneTimePrepaymentMonth = Math.max(1, maxMonths);
      }
      return next;
    });
    this.scheduleCurrentPage.set(1);
    this.onStateChanged();
  }

  setPreset(preset: LoanPresetType): void {
    this.state.update(s => {
      const next = { ...s, activePreset: preset };
      switch (preset) {
        case 'home':
          next.loanAmount = 5000000;
          next.annualInterestRate = 8.5;
          next.tenureYears = 20;
          next.tenureUnit = 'years';
          next.oneTimePrepaymentAmount = 500000;
          next.oneTimePrepaymentMonth = 36;
          break;
        case 'car':
          next.loanAmount = 1200000;
          next.annualInterestRate = 9.0;
          next.tenureYears = 5;
          next.tenureUnit = 'years';
          next.oneTimePrepaymentAmount = 150000;
          next.oneTimePrepaymentMonth = 24;
          break;
        case 'personal':
          next.loanAmount = 500000;
          next.annualInterestRate = 12.0;
          next.tenureYears = 3;
          next.tenureUnit = 'years';
          next.oneTimePrepaymentAmount = 50000;
          next.oneTimePrepaymentMonth = 12;
          break;
        case 'custom':
        default:
          break;
      }
      return next;
    });
    this.onStateChanged();
  }

  setPrepaymentMode(mode: PrepaymentMode): void {
    this.updateField('prepaymentMode', mode);
  }

  setScheduleView(view: 'monthly' | 'annual'): void {
    this.scheduleViewMode.set(view);
    this.scheduleCurrentPage.set(1);
  }

  setChartTab(tab: LoanChartTab): void {
    this.activeChartTab.set(tab);
    this.renderOrUpdateChart();
  }

  toggleRowsPerPage(): void {
    this.scheduleCurrentPage.set(1);
    this.scheduleRowsPerPage.update(r => (r === 24 ? 9999 : 24));
  }

  // Quick "What If?" Scenario Presets
  applyWhatIfScenario(type: 'prepay-5l-3yr' | 'extra-5k-emi' | 'prepay-1l-yearly' | '1-extra-emi-yearly'): void {
    this.state.update(s => {
      const next = { ...s, enablePrepayment: true };
      const currentEmi = this.simulation().originalLoan.monthlyEmi;

      switch (type) {
        case 'prepay-5l-3yr':
          next.oneTimePrepaymentAmount = 500000;
          next.oneTimePrepaymentMonth = 36;
          next.prepaymentMode = 'reduce-tenure';
          break;
        case 'extra-5k-emi':
          next.annualEmiIncreaseAmount = 5000;
          next.prepaymentMode = 'reduce-tenure';
          break;
        case 'prepay-1l-yearly':
          next.recurringPrepaymentAmount = 100000;
          next.prepaymentFrequency = 'annually';
          next.recurringStartMonth = 12;
          next.prepaymentMode = 'reduce-tenure';
          break;
        case '1-extra-emi-yearly':
          next.recurringPrepaymentAmount = Math.round(currentEmi);
          next.prepaymentFrequency = 'annually';
          next.recurringStartMonth = 12;
          next.prepaymentMode = 'reduce-tenure';
          break;
      }
      return next;
    });
    this.onStateChanged();
    this.toastService.show('Applied "What If" simulation scenario.', 'success');
  }

  // Quick Amount Buttons
  setQuickAmount(amount: number): void {
    this.updateField('loanAmount', amount);
  }

  setQuickPrepayment(amount: number): void {
    this.updateField('oneTimePrepaymentAmount', amount);
  }

  // Navigation / Mode Switcher
  switchRouteMode(mode: CalculationMode): void {
    this.activeMode.set(mode);
    const targetPath = SEO_PAGES_DATA[mode]?.path || '/loan-prepayment-calculator';
    this.router.navigate([targetPath], {
      queryParams: this.getQueryParams(),
      queryParamsHandling: 'merge'
    });
    this.updateSeo();
  }

  private onStateChanged(): void {
    this.saveStateLocally();
    this.debouncedSyncUrlParams();
    this.renderOrUpdateChart();
  }

  private saveStateLocally(): void {
    if (this.isBrowser) {
      this.storageService.setItem('cc_loan_state', this.state());
    }
  }

  private debouncedSyncUrlParams(): void {
    if (this.urlSyncTimeout) {
      clearTimeout(this.urlSyncTimeout);
      this.urlSyncTimeout = null;
    }
    this.urlSyncTimeout = setTimeout(() => {
      this.syncUrlParams();
    }, 400);
  }

  private syncUrlParams(): void {
    const targetPath = SEO_PAGES_DATA[this.activeMode()]?.path || '/loan-prepayment-calculator';
    this.isInternalUrlSync = true;
    this.router.navigate([targetPath], {
      queryParams: this.getQueryParams(),
      replaceUrl: true
    }).finally(() => {
      setTimeout(() => {
        this.isInternalUrlSync = false;
      }, 150);
    });
  }

  private getQueryParams(): Record<string, string | number> {
    const s = this.state();
    const params: Record<string, string | number> = {
      amount: s.loanAmount,
      rate: s.annualInterestRate,
      tenure: s.tenureYears,
      unit: s.tenureUnit,
      mode: s.prepaymentMode,
      prepaymentEnabled: s.enablePrepayment ? 'true' : 'false'
    };
    if (s.enablePrepayment) {
      if (s.oneTimePrepaymentAmount > 0) {
        params['prepayment'] = s.oneTimePrepaymentAmount;
        params['prepaymentMonth'] = s.oneTimePrepaymentMonth;
      }
      if (s.recurringPrepaymentAmount > 0) {
        params['recurringAmount'] = s.recurringPrepaymentAmount;
        params['frequency'] = s.prepaymentFrequency;
      }
      if (s.annualEmiIncreasePercent > 0) {
        params['stepUp'] = s.annualEmiIncreasePercent;
      }
      if (s.annualEmiIncreaseAmount > 0) {
        params['emiStep'] = s.annualEmiIncreaseAmount;
      }
    }
    return params;
  }

  private applyUrlParams(params: Record<string, string>): void {
    this.state.update(s => {
      const next = { ...s };
      if (params['amount'] !== undefined && !isNaN(Number(params['amount']))) {
        const amt = Number(params['amount']);
        if (amt > 0) next.loanAmount = amt;
      }
      if (params['rate'] !== undefined && !isNaN(Number(params['rate']))) {
        const r = Number(params['rate']);
        if (r > 0) next.annualInterestRate = r;
      }
      if (params['tenure'] !== undefined && !isNaN(Number(params['tenure']))) {
        const t = Number(params['tenure']);
        if (t > 0) next.tenureYears = t;
      }
      if (params['unit']) next.tenureUnit = params['unit'] === 'months' ? 'months' : 'years';
      if (params['mode']) next.prepaymentMode = params['mode'] === 'reduce-emi' ? 'reduce-emi' : 'reduce-tenure';
      if (params['prepaymentEnabled'] !== undefined) next.enablePrepayment = params['prepaymentEnabled'] === 'true';
      if (params['prepayment'] !== undefined && !isNaN(Number(params['prepayment']))) {
        next.oneTimePrepaymentAmount = Math.max(0, Number(params['prepayment']));
      }
      if (params['prepaymentMonth'] !== undefined && !isNaN(Number(params['prepaymentMonth']))) {
        next.oneTimePrepaymentMonth = Math.max(1, Number(params['prepaymentMonth']));
      }
      if (params['recurringAmount'] !== undefined && !isNaN(Number(params['recurringAmount']))) {
        next.recurringPrepaymentAmount = Math.max(0, Number(params['recurringAmount']));
      }
      if (params['frequency']) next.prepaymentFrequency = params['frequency'] as PrepaymentFrequency;
      if (params['stepUp'] !== undefined && !isNaN(Number(params['stepUp']))) {
        next.annualEmiIncreasePercent = Math.max(0, Number(params['stepUp']));
      }
      if (params['emiStep'] !== undefined && !isNaN(Number(params['emiStep']))) {
        next.annualEmiIncreaseAmount = Math.max(0, Number(params['emiStep']));
      }
      return next;
    });
  }

  private configureModeFromPath(path: string): void {
    if (path.includes('home-loan')) {
      this.activeMode.set('home-loan');
      this.setPreset('home');
      this.state.update(s => ({ ...s, enablePrepayment: false }));
    } else if (path.includes('car-loan')) {
      this.activeMode.set('car-loan');
      this.setPreset('car');
      this.state.update(s => ({ ...s, enablePrepayment: false }));
    } else if (path.includes('emi-calculator')) {
      this.activeMode.set('emi');
      this.state.update(s => ({ ...s, enablePrepayment: false }));
    } else if (path.includes('loan-amortization')) {
      this.activeMode.set('loan-amortization');
      this.state.update(s => ({ ...s, enablePrepayment: false }));
    } else if (path.includes('loan-calculator')) {
      this.activeMode.set('loan');
      this.state.update(s => ({ ...s, enablePrepayment: false }));
    } else {
      this.activeMode.set('loan-prepayment');
      this.state.update(s => ({ ...s, enablePrepayment: true }));
    }
  }

  private updateSeo(): void {
    const seoData = this.currentSeoData();
    if (seoData) {
      this.seoService.updateMeta(seoData.seo);
    }
  }

  // --- Share, Reset, CSV Export ---

  copyShareUrl(): void {
    if (this.isBrowser && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.toastService.show('Scenario share link copied to clipboard!', 'success');
      });
    }
  }

  resetCalculator(): void {
    this.state.set({ ...DEFAULT_LOAN_STATE });
    if (this.isBrowser) {
      this.storageService.removeItem('cc_loan_state');
    }
    this.onStateChanged();
    this.toastService.show('Loan parameters reset to default.', 'info');
  }

  exportScheduleCsv(): void {
    if (!this.isBrowser) return;
    const sim = this.simulation();
    const rows = sim.monthlySchedule;

    const headers = [
      'Payment #',
      'Date',
      'Opening Balance',
      'EMI',
      'Principal',
      'Interest',
      'Prepayment',
      'Closing Balance',
      'Cumulative Interest',
      'Loan Progress %'
    ];

    const csvLines = [headers.join(',')];

    for (const r of rows) {
      csvLines.push(
        [
          r.paymentNumber,
          `"${r.dateStr}"`,
          r.openingBalance,
          r.emi,
          r.principal,
          r.interest,
          r.prepayment,
          r.closingBalance,
          r.cumulativeInterest,
          `${r.loanProgressPercent}%`
        ].join(',')
      );
    }

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compoundcalc-loan-schedule-${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.toastService.show('Amortization schedule exported to CSV.', 'success');
  }

  // --- Chart.js Rendering ---

  private renderOrUpdateChart(): void {
    if (!this.isBrowser) return;
    const canvasRef = this.chartCanvas();
    if (!canvasRef) return;

    const ctx = canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const tab = this.activeChartTab();
    const sim = this.simulation();

    if (tab === 'balance') {
      this.renderBalanceTrajectoryChart(ctx, sim);
    } else if (tab === 'breakdown') {
      this.renderBreakdownDoughnutChart(ctx, sim);
    } else if (tab === 'cumulative-interest') {
      this.renderCumulativeInterestChart(ctx, sim);
    } else if (tab === 'annual-bar') {
      this.renderAnnualStackedBarChart(ctx, sim);
    }
  }

  private getChartThemeColors() {
    const isDark = this.themeService.isDark();
    return {
      isDark,
      textColor: isDark ? '#94a3b8' : '#334155',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      tooltipTitle: isDark ? '#ffffff' : '#0f172a',
      tooltipBody: isDark ? '#cbd5e1' : '#334155',
      tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };
  }

  private renderBalanceTrajectoryChart(ctx: CanvasRenderingContext2D, sim: PrepaymentSimulationResult): void {
    const theme = this.getChartThemeColors();
    // Collect labels and points every 6 or 12 months for clean visualization
    const originalTenure = sim.originalLoan.tenureMonths;
    const step = originalTenure > 120 ? 12 : originalTenure > 60 ? 6 : 1;

    const labels: string[] = [];
    const prepaidPoints: (number | null)[] = [];
    const originalPoints: number[] = [];

    // Map monthly entries for fast lookup
    const prepaidMap = new Map<number, number>();
    for (const r of sim.monthlySchedule) {
      prepaidMap.set(r.paymentNumber, r.closingBalance);
    }

    // Baseline amortization schedule
    const baselineMonthlyRate = this.state().annualInterestRate / 12 / 100;
    const baselineEmi = sim.originalLoan.monthlyEmi;
    let bBalance = sim.originalLoan.totalPrincipal;

    for (let m = 1; m <= originalTenure; m++) {
      const interest = baselineMonthlyRate === 0 ? 0 : bBalance * baselineMonthlyRate;
      const principal = Math.min(bBalance, baselineEmi - interest);
      bBalance = Math.max(0, bBalance - principal);

      if (m % step === 0 || m === originalTenure || m === 1) {
        labels.push(`Month ${m}`);
        originalPoints.push(Math.round(bBalance));

        const pBalance = prepaidMap.get(m);
        if (pBalance !== undefined) {
          prepaidPoints.push(Math.round(pBalance));
        } else {
          prepaidPoints.push(0); // Loan already closed!
        }
      }
    }

    const datasets: any[] = [];

    if (this.hasPrepayment()) {
      datasets.push(
        {
          label: 'With Prepayment',
          data: prepaidPoints,
          borderColor: '#10b981', // Emerald green
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 2
        },
        {
          label: 'Original Without Prepayment',
          data: originalPoints,
          borderColor: '#6366f1', // Indigo
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0
        }
      );
    } else {
      datasets.push({
        label: 'Scheduled Loan Balance',
        data: originalPoints,
        borderColor: '#6366f1', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 2
      });
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: theme.textColor,
              boxWidth: 12,
              font: { family: 'Inter, sans-serif', size: 12, weight: 600 }
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipTitle,
            bodyColor: theme.tooltipBody,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const val = Number(ctx.raw) || 0;
                const loanPrincipal = sim.prepaidLoan.totalPrincipal;
                const principalPaid = Math.max(0, loanPrincipal - val);
                const pctPaid = loanPrincipal > 0 ? ((principalPaid / loanPrincipal) * 100).toFixed(1) : '100';
                return ` ${ctx.dataset.label}: ${this.currencyService.formatCompact(val)} balance (${this.currencyService.formatCompact(principalPaid)} principal paid, ${pctPaid}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter, sans-serif', size: 11 }
            }
          },
          y: {
            grid: { color: theme.gridColor },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter, sans-serif', size: 11 },
              callback: (val) => this.currencyService.formatCompact(Number(val))
            }
          }
        }
      }
    });
  }

  private renderBreakdownDoughnutChart(ctx: CanvasRenderingContext2D, sim: PrepaymentSimulationResult): void {
    const theme = this.getChartThemeColors();
    const principal = sim.prepaidLoan.totalPrincipal;
    const interest = sim.prepaidLoan.totalInterest;
    const total = principal + interest;
    const principalPct = total > 0 ? ((principal / total) * 100).toFixed(1) : '0';
    const interestPct = total > 0 ? ((interest / total) * 100).toFixed(1) : '0';

    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          `Principal Paid Off (${principalPct}%)`,
          `Interest Paid (${interestPct}%)`
        ],
        datasets: [
          {
            data: [principal, interest],
            backgroundColor: ['#10b981', '#f59e0b'], // Emerald, Amber
            borderWidth: 0,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: theme.textColor,
              boxWidth: 14,
              font: { family: 'Inter, sans-serif', size: 13, weight: 600 }
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipTitle,
            bodyColor: theme.tooltipBody,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const val = Number(ctx.raw) || 0;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: ${this.currencyService.formatFull(val)} (${this.currencyService.formatCompact(val)}) • ${pct}% of total payments`;
              }
            }
          }
        }
      }
    });
  }

  private renderCumulativeInterestChart(ctx: CanvasRenderingContext2D, sim: PrepaymentSimulationResult): void {
    const theme = this.getChartThemeColors();
    const rows = sim.monthlySchedule;
    const step = rows.length > 120 ? 12 : rows.length > 60 ? 6 : 1;

    const labels: string[] = [];
    const principalPoints: number[] = [];
    const interestPoints: number[] = [];
    const totalPoints: number[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.paymentNumber % step === 0 || i === rows.length - 1 || i === 0) {
        labels.push(r.dateStr || `Month ${r.paymentNumber}`);
        principalPoints.push(Math.round(r.cumulativePrincipal));
        interestPoints.push(Math.round(r.cumulativeInterest));
        totalPoints.push(Math.round(r.cumulativePrincipal + r.cumulativeInterest));
      }
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Principal Paid Off',
            data: principalPoints,
            borderColor: '#10b981', // Emerald green
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 2
          },
          {
            label: 'Interest Paid',
            data: interestPoints,
            borderColor: '#f59e0b', // Amber
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 2
          },
          {
            label: 'Total Cumulative Outflow',
            data: totalPoints,
            borderColor: '#6366f1', // Indigo
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: theme.textColor,
              boxWidth: 12,
              font: { family: 'Inter, sans-serif', size: 12, weight: 600 }
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipTitle,
            bodyColor: theme.tooltipBody,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const val = Number(ctx.raw) || 0;
                return ` ${ctx.dataset.label}: ${this.currencyService.formatFull(val)} (${this.currencyService.formatCompact(val)})`;
              },
              footer: (items) => {
                if (!items.length) return '';
                const idx = items[0].dataIndex;
                const p = principalPoints[idx] || 0;
                const intr = interestPoints[idx] || 0;
                const tot = p + intr;
                if (tot === 0) return '';
                const pPct = ((p / tot) * 100).toFixed(1);
                const iPct = ((intr / tot) * 100).toFixed(1);
                return `Split to Date: ${pPct}% Principal | ${iPct}% Interest`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter, sans-serif', size: 11 }
            }
          },
          y: {
            grid: { color: theme.gridColor },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter, sans-serif', size: 11 },
              callback: (val) => this.currencyService.formatCompact(Number(val))
            }
          }
        }
      }
    });
  }

  private renderAnnualStackedBarChart(ctx: CanvasRenderingContext2D, sim: PrepaymentSimulationResult): void {
    const theme = this.getChartThemeColors();
    const annual = sim.annualSchedule;
    const labels = annual.map(a => `Year ${a.yearNumber}`);
    const principalData = annual.map(a => a.totalPrincipal + a.totalPrepayment);
    const interestData = annual.map(a => a.totalInterest);

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Principal Paid Off',
            data: principalData,
            backgroundColor: '#10b981' // Emerald
          },
          {
            label: 'Interest Paid',
            data: interestData,
            backgroundColor: '#f59e0b' // Amber
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter, sans-serif', size: 11 }
            }
          },
          y: {
            stacked: true,
            grid: { color: theme.gridColor },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter, sans-serif', size: 11 },
              callback: (val) => this.currencyService.formatCompact(Number(val))
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: theme.textColor,
              boxWidth: 12,
              font: { family: 'Inter, sans-serif', size: 12, weight: 600 }
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipTitle,
            bodyColor: theme.tooltipBody,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const val = Number(ctx.raw) || 0;
                const yearIndex = ctx.dataIndex;
                const yearSummary = annual[yearIndex];
                const yearTotal = yearSummary ? (yearSummary.totalPrincipal + yearSummary.totalPrepayment + yearSummary.totalInterest) : 0;
                const pct = yearTotal > 0 ? ((val / yearTotal) * 100).toFixed(1) : '0';
                return ` ${ctx.dataset.label}: ${this.currencyService.formatFull(val)} (${pct}%)`;
              },
              footer: (items) => {
                if (!items.length) return '';
                const yearIndex = items[0].dataIndex;
                const yearSummary = annual[yearIndex];
                if (!yearSummary) return '';
                const yearTotal = yearSummary.totalPrincipal + yearSummary.totalPrepayment + yearSummary.totalInterest;
                return `Total Paid this Year: ${this.currencyService.formatFull(yearTotal)}\nEnding Remaining Balance: ${this.currencyService.formatFull(yearSummary.closingBalance)}`;
              }
            }
          }
        }
      }
    });
  }
}
