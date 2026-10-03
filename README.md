# Compound Calculator

A production-ready financial growth and compound interest engine built with **Angular 20+**, **TypeScript**, **Signals**, and **Tailwind CSS**. Designed with a modern, glassmorphic aesthetic inspired by Linear, Stripe, and Apple.

> **Important Disclosure:** This is an educational and personal financial planning utility, not a financial-advice application. All results are mathematical estimates based on user assumptions and do not constitute guaranteed returns or investment advice.

---

## 🌟 Key Features

1. **Unified Financial Calculation Engine:**
   - **Step-Up Investment (SIP):** Annual contribution increase modeling (e.g. +10%/yr) that models career salary growth and doubling of final wealth.
   - **Compound Interest:** Lump sum compounding with customizable compounding frequencies (Annually, Semi-annually, Quarterly, Monthly, Daily).
   - **Retirement Savings & FIRE:** Nominal accumulation, inflation-discounted real corpus, sustainable monthly retirement purchasing power, and optional retirement expense inflation projections.
   - **SIP Growth:** Monthly Systematic Investment Plan compounding.
   - **Regular Investment:** Periodic deposits (monthly, quarterly, or yearly) with initial corpus.
   - **Inflation & Purchasing Power:** Quantify the silent erosion of cash over time and future cost of living.
   - **Savings Goal:** Reverse-engineer the required periodic deposits needed to hit a future corpus target.

2. **Mathematical Accuracy & Rigor:**
   - Month-by-month cashflow compounding simulation.
   - Exact consistency between final totals and year-by-year schedule tables.
   - Clean separation between nominal investment returns, contribution increases, and inflation discounting.
   - Indian currency notation: Lakhs (`₹10.5 Lakh`) and Crores (`₹4.82 Cr`), plus full numerical representations (`₹4,82,34,512`).

3. **Scenario Comparison (Scenario A vs Scenario B):**
   - Direct side-by-side what-if modeling.
   - Live overlay on charts.
   - Delta cards for extra capital invested, growth generated, and final corpus difference.

4. **URL Sharing & Privacy:**
   - Encode calculation states into query parameters for instant sharing.
   - **Zero backend & zero database:** 100% of calculations run strictly in client-side memory.
   - Client-side LocalStorage cache with full reset support.

5. **Visual Excellence & Accessibility:**
   - Dark mode, light mode, and system preference support.
   - Responsive Chart.js visualizations (Growth Breakdown, Inflation-Adjusted Real Value, and Contribution trajectories).
   - Mobile-optimized responsive cards and horizontally scrollable yearly schedules.
   - CSV Export & Print-ready layout.
   - WCAG AA accessibility compliance with visible focus states and ARIA labeling.

6. **SEO & Static Site Generation (SSG):**
   - Individual indexable routes for each calculator mode.
   - Dynamic titles, meta descriptions, canonical URLs, and OpenGraph tags.
   - Schema.org `WebApplication` and `FAQPage` JSON-LD structured data.
   - `robots.txt` and `sitemap.xml` included.

---

## 🛠️ Technology Stack

- **Framework:** Angular 22 (Standalone Components, Signals, Router, SSR/SSG Prerendering)
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS 4 + PostCSS
- **Charts:** Chart.js
- **Unit Testing:** Vitest (via Angular test builder)
- **E2E Testing:** Playwright
- **PWA:** Web App Manifest + Offline capability

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm (v10+ recommended)

### Installation

```bash
git clone https://github.com/genpoputils/compound-calculator.git
cd compound-calculator
npm install
```

### Development Server

```bash
npm start
```
Navigate to `http://localhost:4200/`. The app will automatically reload on source changes.

### Running Unit Tests

Run all Vitest unit tests:

```bash
npm test
```

### Running End-to-End Tests

Run Playwright E2E tests across desktop and mobile viewports:

```bash
npm run e2e
```

### Building for Production

Compile production bundles with SSG prerendering:

```bash
npm run build
```

Compiled client output is placed in `dist/compound-calculator/browser` and server output in `dist/compound-calculator/server`.

---

## 📐 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── calculator/
│   │   │   ├── models/calculator.types.ts
│   │   │   ├── calculation-engine.service.ts
│   │   │   ├── compound-calculator.service.ts
│   │   │   ├── investment-calculator.service.ts
│   │   │   ├── step-up-calculator.service.ts
│   │   │   ├── retirement-calculator.service.ts
│   │   │   ├── inflation-calculator.service.ts
│   │   │   └── savings-goal-calculator.service.ts
│   │   ├── seo/
│   │   │   └── seo-content.data.ts
│   │   ├── services/
│   │   │   ├── theme.service.ts
│   │   │   ├── toast.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── url-state.service.ts
│   │   │   └── seo.service.ts
│   │   └── utils/
│   │       └── currency.util.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── slider-input/
│   │   │   ├── metric-card/
│   │   │   ├── yearly-table/
│   │   │   ├── chart-view/
│   │   │   ├── scenario-compare/
│   │   │   ├── assumptions-panel/
│   │   │   ├── disclaimer/
│   │   │   └── toast/
│   │   └── pipes/
│   │       └── inr-currency.pipe.ts
│   ├── pages/
│   │   └── calculator-view/
│   │       ├── calculator-view.component.ts
│   │       └── calculator-view.component.html
│   ├── app.routes.ts
│   ├── app.config.ts
│   ├── app.ts
│   └── app.html
├── styles.css
└── index.html
```

---

## 📄 License

MIT License. Open source and free for commercial and personal financial planning.
