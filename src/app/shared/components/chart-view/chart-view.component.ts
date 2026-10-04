import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { CalculationMode, YearlyBreakdownItem } from '../../../core/calculator/models/calculator.types';
import { CurrencyService } from '../../../core/services/currency.service';
import { ThemeService } from '../../../core/services/theme.service';

Chart.register(...registerables);

export type ChartTab = 'growth' | 'real-vs-nominal' | 'contributions';

@Component({
  selector: 'app-chart-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Wealth Trajectory Chart
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Interactive visual modeling of wealth accumulation and growth curves.
          </p>
        </div>

        <!-- View Mode Segmented Controls -->
        <div class="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            (click)="setTab('growth')"
            class="px-2.5 py-1 rounded-lg transition-all"
            [ngClass]="{
              'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs': activeTab() === 'growth',
              'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white': activeTab() !== 'growth'
            }"
          >
            Growth Breakdown
          </button>
          <button
            type="button"
            (click)="setTab('real-vs-nominal')"
            class="px-2.5 py-1 rounded-lg transition-all"
            [ngClass]="{
              'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs': activeTab() === 'real-vs-nominal',
              'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white': activeTab() !== 'real-vs-nominal'
            }"
          >
            Inflation Adjusted
          </button>
          @if (mode() === 'step-up' || mode() === 'retirement' || mode() === 'regular-investment') {
            <button
              type="button"
              (click)="setTab('contributions')"
              class="px-2.5 py-1 rounded-lg transition-all"
              [ngClass]="{
                'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs': activeTab() === 'contributions',
                'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white': activeTab() !== 'contributions'
              }"
            >
              Contributions
            </button>
          }
        </div>
      </div>

      <!-- Canvas Wrapper -->
      <div class="relative w-full h-[280px] sm:h-[360px]">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `
})
export class ChartViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly breakdown = input.required<YearlyBreakdownItem[]>();
  readonly mode = input<CalculationMode>('step-up');
  readonly comparisonBreakdown = input<YearlyBreakdownItem[]>();

  readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly themeService = inject(ThemeService);
  readonly currencyService = inject(CurrencyService);

  readonly activeTab = signal<ChartTab>('growth');
  private chartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      // Re-render chart whenever theme or currency changes
      this.themeService.isDark();
      this.currencyService.selectedCurrency();
      if (this.isBrowser && this.chartCanvas()) {
        this.renderChart();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.renderChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isBrowser && this.chartCanvas() && (changes['breakdown'] || changes['comparisonBreakdown'] || changes['mode'])) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  setTab(tab: ChartTab): void {
    this.activeTab.set(tab);
    this.renderChart();
  }

  private renderChart(): void {
    if (!this.isBrowser) return;

    const canvasEl = this.chartCanvas()?.nativeElement;
    if (!canvasEl) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const data = this.breakdown();
    if (!data || data.length === 0) return;

    const isDark = this.themeService.isDark();
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#334155';

    const labels = data.map(d => `Yr ${d.year}${d.age ? ' (' + d.age + ')' : ''}`);

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    let chartConfigData: any;

    if (this.activeTab() === 'real-vs-nominal') {
      // Comparison between Nominal Portfolio Value vs Inflation Discounted Real Value
      chartConfigData = {
        labels,
        datasets: [
          {
            label: 'Nominal Future Corpus',
            data: data.map(d => d.portfolioValue),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: data.length > 25 ? 0 : 3
          },
          {
            label: 'Real Purchasing Power (Today’s Value)',
            data: data.map(d => d.realPortfolioValue),
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            borderDash: [5, 5],
            pointRadius: data.length > 25 ? 0 : 3
          }
        ]
      };
    } else if (this.activeTab() === 'contributions') {
      // Annual / Monthly contribution growth
      chartConfigData = {
        labels,
        datasets: [
          {
            label: 'Annual Contribution',
            data: data.map(d => d.annualContribution),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: data.length > 25 ? 0 : 3
          },
          {
            label: 'Monthly Contribution',
            data: data.map(d => d.monthlyContribution),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            fill: false,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: data.length > 25 ? 0 : 3
          }
        ]
      };
    } else {
      // Standard Growth Breakdown: Invested Amount vs Growth
      chartConfigData = {
        labels,
        datasets: [
          {
            label: 'Invested Capital',
            data: data.map(d => d.totalInvested),
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.25)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: data.length > 25 ? 0 : 3
          },
          {
            label: 'Total Portfolio Value',
            data: data.map(d => d.portfolioValue),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.25)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: data.length > 25 ? 0 : 3
          }
        ]
      };

      // If comparison scenario exists (Scenario B)
      const comp = this.comparisonBreakdown();
      if (comp && comp.length > 0) {
        chartConfigData.datasets.push({
          label: 'Scenario B Total',
          data: comp.map(d => d.portfolioValue),
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          fill: false,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 0
        });
      }
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartConfigData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              boxWidth: 12,
              padding: 16,
              font: {
                family: 'Inter, sans-serif',
                size: 11,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: isDark ? '#ffffff' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = Number(context.parsed.y);
                return ` ${label}: ${this.currencyService.formatCompact(val)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
              font: {
                family: 'Inter, sans-serif',
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              callback: (val) => this.currencyService.formatCompact(Number(val)),
              font: {
                family: 'Inter, sans-serif',
                size: 11
              }
            }
          }
        }
      }
    });
  }
}
