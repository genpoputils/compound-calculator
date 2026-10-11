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
import type { Chart as ChartType } from 'chart.js';
import { CalculationMode, YearlyBreakdownItem } from '../../../core/calculator/models/calculator.types';
import { CurrencyService } from '../../../core/services/currency.service';
import { ThemeService } from '../../../core/services/theme.service';

let chartJsPromise: Promise<typeof import('chart.js')> | null = null;
function getChartJs(): Promise<typeof import('chart.js')> {
  if (!chartJsPromise) {
    chartJsPromise = import('chart.js').then((module) => {
      module.Chart.register(...module.registerables);
      return module;
    });
  }
  return chartJsPromise;
}

export type ChartTab = 'growth' | 'real-vs-nominal' | 'contributions';

@Component({
  selector: 'app-chart-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-[#D9D5C9] dark:border-[#2C362E] bg-white dark:bg-[#181E19] p-4 sm:p-6 shadow-2xs relative">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E8E2D4] dark:border-[#2C362E]">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#356B4A]"></span>
            <h2 class="text-base sm:text-lg font-editorial font-bold text-[#202A23] dark:text-[#EDE8DE] tracking-tight">
              Projected Growth & Wealth Trajectory
            </h2>
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#E8E2D4] dark:bg-[#252C26] text-[#356B4A] dark:text-[#8FA691]">
              Hypothetical
            </span>
          </div>
          <p class="text-xs text-[#686B61] dark:text-[#959B8E] mt-0.5 font-sans">
            Clean logarithmic & linear progression of compound growth over your duration.
          </p>
        </div>

        <!-- View Mode Segmented Controls (Editorial paper tabs) -->
        <div class="flex items-center p-1 rounded-lg bg-[#F8F6EF] dark:bg-[#141815] border border-[#D9D5C9] dark:border-[#2C362E] text-xs font-semibold overflow-x-auto no-scrollbar touch-scroll max-w-full">
          <button
            type="button"
            (click)="setTab('growth')"
            class="px-2.5 py-1 rounded transition-all cursor-pointer font-sans"
            [ngClass]="{
              'bg-white dark:bg-[#1F2721] text-[#356B4A] dark:text-[#EDE8DE] border border-[#D9D5C9] dark:border-[#35483B] shadow-2xs font-bold': activeTab() === 'growth',
              'text-[#686B61] dark:text-[#959B8E] hover:text-[#202A23] dark:hover:text-[#EDE8DE]': activeTab() !== 'growth'
            }"
          >
            Growth Breakdown
          </button>
          <button
            type="button"
            (click)="setTab('real-vs-nominal')"
            class="px-2.5 py-1 rounded transition-all cursor-pointer font-sans"
            [ngClass]="{
              'bg-white dark:bg-[#1F2721] text-[#356B4A] dark:text-[#EDE8DE] border border-[#D9D5C9] dark:border-[#35483B] shadow-2xs font-bold': activeTab() === 'real-vs-nominal',
              'text-[#686B61] dark:text-[#959B8E] hover:text-[#202A23] dark:hover:text-[#EDE8DE]': activeTab() !== 'real-vs-nominal'
            }"
          >
            Inflation Adjusted
          </button>
          @if (mode() === 'step-up' || mode() === 'retirement' || mode() === 'regular-investment') {
            <button
              type="button"
              (click)="setTab('contributions')"
              class="px-2.5 py-1 rounded transition-all cursor-pointer font-sans"
              [ngClass]="{
                'bg-white dark:bg-[#1F2721] text-[#356B4A] dark:text-[#EDE8DE] border border-[#D9D5C9] dark:border-[#35483B] shadow-2xs font-bold': activeTab() === 'contributions',
                'text-[#686B61] dark:text-[#959B8E] hover:text-[#202A23] dark:hover:text-[#EDE8DE]': activeTab() !== 'contributions'
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
  private chartInstance: ChartType | null = null;
  private rafId: number | null = null;

  constructor() {
    effect(() => {
      this.themeService.isDark();
      this.currencyService.selectedCurrency();
      if (this.isBrowser && this.chartCanvas()) {
        this.scheduleRender(true);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.scheduleRender(true);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isBrowser && this.chartCanvas() && (changes['breakdown'] || changes['comparisonBreakdown'] || changes['mode'])) {
      this.scheduleRender(false);
    }
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  setTab(tab: ChartTab): void {
    this.activeTab.set(tab);
    this.scheduleRender(true);
  }

  private scheduleRender(forceRebuild = false): void {
    if (!this.isBrowser) return;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(async () => {
      this.rafId = null;
      await this.renderChart(forceRebuild);
    });
  }

  private async renderChart(forceRebuild = false): Promise<void> {
    if (!this.isBrowser) return;

    const canvasEl = this.chartCanvas()?.nativeElement;
    if (!canvasEl) return;

    const data = this.breakdown();
    if (!data || data.length === 0) return;

    const { Chart } = await getChartJs();
    if (!this.chartCanvas()?.nativeElement) return;

    const isDark = this.themeService.isDark();
    // Warm paper grid colors
    const gridColor = isDark ? 'rgba(237, 232, 222, 0.07)' : 'rgba(32, 42, 35, 0.08)';
    const textColor = isDark ? '#959B8E' : '#686B61';

    const labels = data.map(d => `Yr ${d.year}${d.age ? ' (' + d.age + ')' : ''}`);

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let chartConfigData: any;

    if (this.activeTab() === 'real-vs-nominal') {
      // Comparison between Nominal Portfolio Value vs Inflation Discounted Real Value
      chartConfigData = {
        labels,
        datasets: [
          {
            label: 'Nominal Future Corpus',
            data: data.map(d => d.portfolioValue),
            borderColor: '#356B4A', // Primary brand forest green
            backgroundColor: 'rgba(53, 107, 74, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: data.length > 25 ? 0 : 3,
            pointBackgroundColor: '#356B4A'
          },
          {
            label: 'Real Purchasing Power (Today’s Value)',
            data: data.map(d => d.realPortfolioValue),
            borderColor: '#A8683B', // Warm copper / terracotta
            backgroundColor: 'rgba(168, 104, 59, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: data.length > 25 ? 0 : 3,
            pointBackgroundColor: '#A8683B'
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
            borderColor: '#356B4A',
            backgroundColor: 'rgba(53, 107, 74, 0.18)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: data.length > 25 ? 0 : 3
          },
          {
            label: 'Monthly Contribution',
            data: data.map(d => d.monthlyContribution),
            borderColor: '#78947A',
            backgroundColor: 'transparent',
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
            borderColor: '#78947A', // Secondary green
            backgroundColor: 'rgba(120, 148, 122, 0.16)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: data.length > 25 ? 0 : 3,
            pointBackgroundColor: '#78947A'
          },
          {
            label: 'Total Portfolio Value',
            data: data.map(d => d.portfolioValue),
            borderColor: '#356B4A', // Forest green growth curve
            backgroundColor: 'rgba(53, 107, 74, 0.18)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: data.length > 25 ? 0 : 3,
            pointBackgroundColor: '#356B4A'
          }
        ]
      };

      // If comparison scenario exists (Scenario B)
      const comp = this.comparisonBreakdown();
      if (comp && comp.length > 0) {
        chartConfigData.datasets.push({
          label: 'Scenario B Total',
          data: comp.map(d => d.portfolioValue),
          borderColor: '#C67D38', // Editorial amber
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          fill: false,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 0
        });
      }
    }

    if (this.chartInstance && !forceRebuild) {
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets = chartConfigData.datasets;
      this.chartInstance.update('none');
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartConfigData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? false : {
          duration: 750,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: isDark ? '#EDE8DE' : '#202A23',
              boxWidth: 12,
              padding: 14,
              font: {
                family: 'Inter, sans-serif',
                size: 11,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#141815' : '#FFFFFF',
            titleColor: isDark ? '#EDE8DE' : '#202A23',
            bodyColor: isDark ? '#C4C9BE' : '#454940',
            borderColor: '#356B4A',
            borderWidth: 1.5,
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              family: 'Fraunces, serif',
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              family: 'Inter, monospace',
              size: 11
            },
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
                family: 'JetBrains Mono, monospace',
                size: 11
              }
            }
          }
        }
      }
    });
  }
}
