import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IllustrationName =
  | 'plant-coins'
  | 'compounding-curve'
  | 'sprout-coin'
  | 'hourglass-time'
  | 'interest-shears'
  | 'seal-verified';

@Component({
  selector: 'app-editorial-illustration',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="inline-flex items-center justify-center select-none"
      [ngClass]="containerClass()"
      [attr.aria-hidden]="true"
    >
      @switch (name()) {
        @case ('plant-coins') {
          <!-- Plant growing beside stacked coins -->
          <svg
            [attr.width]="size()"
            [attr.height]="size()"
            viewBox="0 0 160 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="transition-transform duration-300 hover:scale-105"
          >
            <!-- Halftone ground shadow -->
            <ellipse cx="80" cy="126" rx="58" ry="8" fill="var(--color-paper-secondary, #E8E2D4)" stroke="#D9D5C9" stroke-width="1.2" stroke-dasharray="3 3"/>

            <!-- Stacked Coins (Left) -->
            <!-- Coin 1 (Bottom) -->
            <g class="coin-stack">
              <ellipse cx="48" cy="120" rx="22" ry="7" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
              <path d="M26 120v-5c0-3.86 9.85-7 22-7s22 3.14 22 7v5c0 3.86-9.85 7-22 7s-22-3.14-22-7z" fill="#F4F0E6"/>
              <ellipse cx="48" cy="115" rx="22" ry="7" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
              <!-- Edge ridges -->
              <line x1="32" y1="117" x2="32" y2="122" stroke="#202A23" stroke-width="1.5"/>
              <line x1="40" y1="119" x2="40" y2="124" stroke="#202A23" stroke-width="1.5"/>
              <line x1="56" y1="119" x2="56" y2="124" stroke="#202A23" stroke-width="1.5"/>
              <line x1="64" y1="117" x2="64" y2="122" stroke="#202A23" stroke-width="1.5"/>

              <!-- Coin 2 -->
              <ellipse cx="48" cy="107" rx="22" ry="7" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
              <path d="M26 107v-5c0-3.86 9.85-7 22-7s22 3.14 22 7v5c0 3.86-9.85 7-22 7s-22-3.14-22-7z" fill="#F4F0E6"/>
              <ellipse cx="48" cy="102" rx="22" ry="7" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
              <line x1="32" y1="104" x2="32" y2="109" stroke="#202A23" stroke-width="1.5"/>
              <line x1="40" y1="106" x2="40" y2="111" stroke="#202A23" stroke-width="1.5"/>
              <line x1="56" y1="106" x2="56" y2="111" stroke="#202A23" stroke-width="1.5"/>
              <line x1="64" y1="104" x2="64" y2="109" stroke="#202A23" stroke-width="1.5"/>

              <!-- Coin 3 (Top) -->
              <ellipse cx="48" cy="94" rx="22" ry="7" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
              <path d="M26 94v-5c0-3.86 9.85-7 22-7s22 3.14 22 7v5c0 3.86-9.85 7-22 7s-22-3.14-22-7z" fill="#F4F0E6"/>
              <ellipse cx="48" cy="89" rx="22" ry="7" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
              <!-- Engraved inner ring -->
              <ellipse cx="48" cy="89" rx="16" ry="5" fill="none" stroke="#202A23" stroke-width="1.2" stroke-dasharray="2 2"/>
              <text x="48" y="91" font-family="'Fraunces', serif" font-size="7" font-weight="bold" fill="#202A23" text-anchor="middle">₹</text>
            </g>

            <!-- Botanical Growth Plant (Right) -->
            <g class="plant">
              <!-- Stem -->
              <path d="M85 125 C 88 100, 80 75, 96 38" fill="none" stroke="#202A23" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M96 38 C 104 22, 114 18, 118 16" fill="none" stroke="#202A23" stroke-width="2" stroke-linecap="round"/>

              <!-- Bottom Leaf (Left) -->
              <path d="M84 96 C 68 94, 62 82, 64 76 C 74 76, 84 86, 84 96 Z" fill="#356B4A" stroke="#202A23" stroke-width="1.8"/>
              <path d="M84 96 C 76 88, 70 82, 64 76" stroke="#202A23" stroke-width="1.2"/>

              <!-- Middle Leaf (Right) -->
              <path d="M87 78 C 105 74, 114 62, 112 55 C 100 56, 89 68, 87 78 Z" fill="#356B4A" stroke="#202A23" stroke-width="1.8"/>
              <path d="M87 78 C 96 70, 104 62, 112 55" stroke="#202A23" stroke-width="1.2"/>

              <!-- Upper Leaf (Left) -->
              <path d="M92 56 C 78 50, 72 38, 76 32 C 86 34, 91 44, 92 56 Z" fill="#78947A" stroke="#202A23" stroke-width="1.8"/>

              <!-- Crown Sprout Leaf -->
              <path d="M96 38 C 108 30, 118 32, 122 36 C 118 45, 106 44, 96 38 Z" fill="#356B4A" stroke="#202A23" stroke-width="1.8"/>

              <!-- Small Bud -->
              <circle cx="118" cy="16" r="3" fill="#356B4A" stroke="#202A23" stroke-width="1.5"/>
            </g>

            <!-- Ink marginal tick / annotation -->
            <path d="M110 90 L 122 84 M 122 84 L 118 80 M 122 84 L 119 88" stroke="#356B4A" stroke-width="1.5" stroke-linecap="round"/>
            <text x="126" y="87" font-family="'Inter', sans-serif" font-size="7" font-weight="600" fill="#356B4A">Compound</text>
          </svg>
        }

        @case ('compounding-curve') {
          <!-- Editorial Hand-Drawn Compounding Curve -->
          <svg
            [attr.width]="size()"
            [attr.height]="size()"
            viewBox="0 0 160 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="transition-transform duration-300 hover:scale-105"
          >
            <!-- Gridlines -->
            <line x1="24" y1="116" x2="144" y2="116" stroke="#202A23" stroke-width="2" stroke-linecap="round"/>
            <line x1="24" y1="20" x2="24" y2="116" stroke="#202A23" stroke-width="2" stroke-linecap="round"/>
            <line x1="24" y1="84" x2="144" y2="84" stroke="#D9D5C9" stroke-width="1" stroke-dasharray="3 3"/>
            <line x1="24" y1="52" x2="144" y2="52" stroke="#D9D5C9" stroke-width="1" stroke-dasharray="3 3"/>

            <!-- Linear baseline (Total Invested) -->
            <path d="M26 114 L 140 76" stroke="#78947A" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"/>

            <!-- Shaded exponential fill under curve -->
            <path d="M26 114 Q 90 112 116 70 T 140 24 L 140 114 Z" fill="rgba(53, 107, 74, 0.12)"/>

            <!-- Exponential Curve (Compounding returns) -->
            <path d="M26 114 Q 90 112 116 70 T 140 24" fill="none" stroke="#356B4A" stroke-width="3" stroke-linecap="round"/>

            <!-- Arrow head -->
            <path d="M136 21 L 142 22 L 141 28" stroke="#356B4A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Inflection Point Dot & Stamp -->
            <circle cx="116" cy="70" r="4.5" fill="#F8F6EF" stroke="#356B4A" stroke-width="2.5"/>
            <line x1="116" y1="70" x2="116" y2="116" stroke="#356B4A" stroke-width="1" stroke-dasharray="2 2"/>

            <!-- Editorial Callout label -->
            <rect x="54" y="28" width="62" height="18" rx="3" fill="#E8E2D4" stroke="#202A23" stroke-width="1.2"/>
            <text x="85" y="40" font-family="'Inter', sans-serif" font-size="7.5" font-weight="700" fill="#202A23" text-anchor="middle">Growth Inflection</text>
            <path d="M85 46 L 98 62" stroke="#202A23" stroke-width="1" stroke-linecap="round"/>
          </svg>
        }

        @case ('sprout-coin') {
          <!-- Single coin with emerging sprout -->
          <svg
            [attr.width]="size()"
            [attr.height]="size()"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="transition-transform duration-300 hover:scale-105"
          >
            <!-- Ground ellipse -->
            <ellipse cx="60" cy="100" rx="36" ry="6" fill="#E8E2D4" stroke="#D9D5C9" stroke-width="1.2"/>

            <!-- Coin rim and face -->
            <ellipse cx="60" cy="92" rx="30" ry="11" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
            <path d="M30 92v-6c0-6 13.43-11 30-11s30 5 30 11v6c0 6-13.43 11-30 11s-30-5-30-11z" fill="#F4F0E6"/>
            <ellipse cx="60" cy="86" rx="30" ry="11" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
            <ellipse cx="60" cy="86" rx="22" ry="7" fill="none" stroke="#202A23" stroke-width="1.2" stroke-dasharray="2 2"/>

            <!-- Center Plant Stem sprouting through the coin -->
            <path d="M60 84 C 60 62, 54 44, 60 22" fill="none" stroke="#202A23" stroke-width="2.5" stroke-linecap="round"/>

            <!-- Leaf Left -->
            <path d="M59 56 C 42 54, 36 40, 42 34 C 52 36, 58 48, 59 56 Z" fill="#356B4A" stroke="#202A23" stroke-width="1.8"/>

            <!-- Leaf Right -->
            <path d="M60 42 C 76 38, 84 26, 80 20 C 70 20, 62 32, 60 42 Z" fill="#78947A" stroke="#202A23" stroke-width="1.8"/>

            <!-- Sprout tip -->
            <circle cx="60" cy="21" r="3" fill="#356B4A" stroke="#202A23" stroke-width="1.5"/>
          </svg>
        }

        @case ('hourglass-time') {
          <!-- Editorial Hourglass: Time into compounding corpus -->
          <svg
            [attr.width]="size()"
            [attr.height]="size()"
            viewBox="0 0 140 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="transition-transform duration-300 hover:scale-105"
          >
            <!-- Top and Bottom Plates -->
            <rect x="36" y="16" width="68" height="8" rx="2" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>
            <rect x="36" y="116" width="68" height="8" rx="2" fill="#E8E2D4" stroke="#202A23" stroke-width="2"/>

            <!-- Hourglass Glass Body -->
            <path d="M44 24 C 44 60, 66 68, 66 70 C 66 72, 44 80, 44 116 L 96 116 C 96 80, 74 72, 74 70 C 74 68, 96 60, 96 24 Z" fill="rgba(248, 246, 239, 0.85)" stroke="#202A23" stroke-width="2.2"/>

            <!-- Top Sand Reservoir -->
            <path d="M48 30 C 56 46, 70 56, 70 68 C 70 68, 84 46, 92 30 Z" fill="#E8E2D4" stroke="#B8B3A4" stroke-width="1"/>

            <!-- Trickling stream -->
            <line x1="70" y1="68" x2="70" y2="98" stroke="#356B4A" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3"/>

            <!-- Bottom Compounded Sand Mound -->
            <path d="M48 114 C 54 98, 86 98, 92 114 Z" fill="#356B4A" stroke="#202A23" stroke-width="1.8"/>

            <!-- Small coins in bottom mound -->
            <ellipse cx="64" cy="108" rx="6" ry="2.5" fill="#E8E2D4" stroke="#202A23" stroke-width="1"/>
            <ellipse cx="76" cy="106" rx="6" ry="2.5" fill="#E8E2D4" stroke="#202A23" stroke-width="1"/>

            <!-- Editorial side brackets -->
            <line x1="38" y1="24" x2="38" y2="116" stroke="#202A23" stroke-width="1.8"/>
            <line x1="102" y1="24" x2="102" y2="116" stroke="#202A23" stroke-width="1.8"/>
          </svg>
        }

        @case ('interest-shears') {
          <!-- Debt Slasher Shears trimming interest -->
          <svg
            [attr.width]="size()"
            [attr.height]="size()"
            viewBox="0 0 140 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="transition-transform duration-300 hover:scale-105"
          >
            <!-- Ribbon being trimmed (Loan interest ribbon) -->
            <path d="M16 66 C 40 60, 56 74, 80 68 C 104 62, 120 76, 126 70" fill="none" stroke="#D9D5C9" stroke-width="12" stroke-linecap="round"/>
            <path d="M16 66 C 40 60, 56 74, 80 68" fill="none" stroke="#B8B3A4" stroke-width="10" stroke-linecap="round"/>
            <text x="36" y="69" font-family="'Inter', sans-serif" font-size="6.5" font-weight="700" fill="#202A23">INTEREST TENURE</text>

            <!-- Snip cut line -->
            <line x1="78" y1="52" x2="78" y2="84" stroke="#356B4A" stroke-width="2" stroke-dasharray="2 2"/>

            <!-- Shears / Scissors Blades -->
            <!-- Blade 1 -->
            <path d="M50 32 L 84 66 L 102 46" fill="none" stroke="#202A23" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Blade 2 -->
            <path d="M50 102 L 84 68 L 102 88" fill="none" stroke="#202A23" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Center Pivot Screw -->
            <circle cx="84" cy="67" r="4" fill="#356B4A" stroke="#202A23" stroke-width="2"/>

            <!-- Finger Rings -->
            <circle cx="44" cy="28" r="9" fill="none" stroke="#202A23" stroke-width="3"/>
            <circle cx="44" cy="106" r="9" fill="none" stroke="#202A23" stroke-width="3"/>

            <!-- Saved Badge -->
            <rect x="88" y="100" width="46" height="18" rx="3" fill="#E8E2D4" stroke="#356B4A" stroke-width="1.2"/>
            <text x="111" y="112" font-family="'Inter', sans-serif" font-size="7" font-weight="800" fill="#356B4A" text-anchor="middle">SAVED LAKHS</text>
          </svg>
        }

        @case ('seal-verified') {
          <!-- Circular editorial seal stamp -->
          <svg
            [attr.width]="size()"
            [attr.height]="size()"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="transition-transform duration-300 hover:rotate-6"
          >
            <!-- Outer serrated or etched ring -->
            <circle cx="50" cy="50" r="44" fill="#F8F6EF" stroke="#356B4A" stroke-width="2"/>
            <circle cx="50" cy="50" r="39" fill="none" stroke="#356B4A" stroke-width="1" stroke-dasharray="3 2"/>

            <!-- Inner content -->
            <text x="50" y="36" font-family="'Inter', sans-serif" font-size="6" font-weight="800" letter-spacing="1.5" fill="#356B4A" text-anchor="middle">VERIFIED</text>
            <text x="50" y="52" font-family="'Fraunces', serif" font-size="13" font-weight="900" fill="#202A23" text-anchor="middle">100%</text>
            <text x="50" y="62" font-family="'Inter', sans-serif" font-size="5.5" font-weight="700" letter-spacing="1" fill="#356B4A" text-anchor="middle">CLIENT-SIDE</text>
            <text x="50" y="72" font-family="'Inter', sans-serif" font-size="5" font-weight="600" fill="#686B61" text-anchor="middle">PRIVATE & OPEN</text>
          </svg>
        }
      }
    </div>
  `
})
export class EditorialIllustrationComponent {
  readonly name = input.required<IllustrationName>();
  readonly size = input<number | string>(120);
  readonly className = input<string>('');

  readonly containerClass = computed(() => {
    return this.className() || '';
  });
}
