import {
  Component,
  inject,
  input,
  OnInit,
  AfterViewInit,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdSenseService } from '../../../core/services/adsense.service';

export type AdSlotType = 'leaderboard' | 'in-content' | 'bottom';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="w-full mx-auto my-2 text-center"
      [ngClass]="containerClasses()"
    >
      <!-- Required AdSense Label per Google Policy -->
      <div class="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider mb-1.5 select-none">
        Advertisement
      </div>

      <!-- LIVE ADSENSE AD UNIT -->
      @if (adsenseService.isLive()) {
        <div class="overflow-hidden flex items-center justify-center min-h-[90px] w-full">
          <ins
            class="adsbygoogle block w-full text-center"
            [style.display]="'block'"
            [attr.data-ad-client]="adsenseService.publisherId()"
            [attr.data-ad-slot]="resolvedSlotId()"
            [attr.data-ad-format]="format()"
            [attr.data-full-width-responsive]="fullWidthResponsive() ? 'true' : 'false'"
          ></ins>
        </div>
      } @else {
        <!-- PREVIEW / PLACEHOLDER STATE (Pre-Approval & Dev Mode) -->
        <!-- Prevents layout shift (CLS) and guarantees polished UI -->
        <div
          class="relative w-full rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors shadow-2xs"
          [ngClass]="slotDimensionsClass()"
        >
          <div class="flex items-center gap-3 text-left">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {{ slotTitle() }}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  AdSense Ready
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {{ slotDescription() }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span class="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
              {{ slotSizeLabel() }}
            </span>
          </div>
        </div>
      }
    </div>
  `
})
export class AdBannerComponent implements OnInit, AfterViewInit {
  readonly adsenseService = inject(AdSenseService);

  // Inputs
  readonly slotType = input<AdSlotType>('in-content');
  readonly slotId = input<string>('');
  readonly format = input<string>('auto');
  readonly fullWidthResponsive = input<boolean>(true);
  readonly className = input<string>('');

  readonly resolvedSlotId = computed<string>(() => {
    const direct = this.slotId();
    if (direct) return direct;
    const cfg = this.adsenseService.config();
    switch (this.slotType()) {
      case 'leaderboard':
        return cfg.slots.topLeaderboard || '';
      case 'in-content':
        return cfg.slots.inContent || '';
      case 'bottom':
        return cfg.slots.bottom || '';
      default:
        return '';
    }
  });

  readonly slotTitle = computed<string>(() => {
    switch (this.slotType()) {
      case 'leaderboard':
        return 'Top Leaderboard Placement';
      case 'in-content':
        return 'In-Content Sponsored Placement';
      case 'bottom':
        return 'Pre-Footer Sponsored Placement';
      default:
        return 'Google AdSense Placement';
    }
  });

  readonly slotDescription = computed<string>(() => {
    switch (this.slotType()) {
      case 'leaderboard':
        return 'High-visibility header banner slot (Desktop 728×90 / Mobile 320×100)';
      case 'in-content':
        return 'High-engagement responsive ad slot positioned between interactive tools & analytics';
      case 'bottom':
        return 'High-dwell time banner slot above educational guides and FAQs';
      default:
        return 'Reserved space for responsive Google AdSense advertisements';
    }
  });

  readonly slotSizeLabel = computed<string>(() => {
    switch (this.slotType()) {
      case 'leaderboard':
        return '728×90 / Responsive';
      case 'in-content':
        return 'Auto / Fluid';
      case 'bottom':
        return '728×90 / Fluid';
      default:
        return 'Responsive';
    }
  });

  readonly slotDimensionsClass = computed<string>(() => {
    switch (this.slotType()) {
      case 'leaderboard':
        return 'min-h-[96px] sm:min-h-[105px]';
      case 'in-content':
        return 'min-h-[100px] sm:min-h-[115px]';
      case 'bottom':
        return 'min-h-[96px] sm:min-h-[105px]';
      default:
        return 'min-h-[96px]';
    }
  });

  readonly containerClasses = computed<string>(() => {
    return this.className() || 'max-w-5xl';
  });

  ngOnInit(): void {
    if (this.adsenseService.isLive()) {
      this.adsenseService.initAdSense();
    }
  }

  ngAfterViewInit(): void {
    if (this.adsenseService.isLive()) {
      // Trigger ad push after view is mounted
      setTimeout(() => {
        this.adsenseService.pushAd();
      }, 50);
    }
  }
}
