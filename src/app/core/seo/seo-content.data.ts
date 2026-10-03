import { CalculationMode } from '../calculator/models/calculator.types';
import { SeoConfig } from '../services/seo.service';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoPageContent {
  mode: CalculationMode;
  path: string;
  seo: SeoConfig;
  heading: string;
  subheading: string;
  explanationTitle: string;
  paragraphs: string[];
  keyHighlights: { title: string; description: string }[];
  formulaTitle: string;
  formulaDescription: string;
  formulaCode: string;
  faqs: FaqItem[];
}

export const SEO_PAGES_DATA: Record<CalculationMode, SeoPageContent> = {
  'compound-interest': {
    mode: 'compound-interest',
    path: '/compound-calculator',
    seo: {
      title: 'Compound Interest Calculator - Calculate Future Investment Growth',
      description: 'Accurately calculate compound interest growth on your investments. Explore annual, quarterly, monthly, and daily compounding frequencies with inflation adjustments.',
      canonicalUrl: 'https://genpoputils.github.io/compound-calculator/compound-calculator',
      keywords: 'compound interest calculator, investment growth, interest compounding, lump sum calculator, compound interest formula',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Compound Interest Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0'
        }
      }
    },
    heading: 'Compound Interest Calculator',
    subheading: 'See how your lump sum investment compounds over time with custom compounding frequencies.',
    explanationTitle: 'Understanding the Mathematical Power of Compounding',
    paragraphs: [
      'Compound interest represents the principle of earning "interest on interest." Unlike simple interest where returns are calculated solely on the original principal, compounding recalculates returns on the growing accumulated balance at every interval.',
      'As time progresses, the compounding exponential curve steepens. In the early years, growth may seem modest, but over 10, 20, or 30 years, accumulated interest often eclipses the initial investment by multiples.'
    ],
    keyHighlights: [
      {
        title: 'Compounding Frequency Matters',
        description: 'Compounding monthly or daily yields slightly higher effective returns than annual compounding due to faster reinvestment.'
      },
      {
        title: 'Nominal vs Real Returns',
        description: 'Inflation gradually erodes the purchasing power of your future corpus. Always evaluate your final corpus in today’s value.'
      },
      {
        title: 'Time in the Market',
        description: 'The exponent in the compound interest formula is duration (time). Doubling the duration has an exponential impact on final wealth.'
      }
    ],
    formulaTitle: 'The Universal Compound Interest Formula',
    formulaDescription: 'The standard formula for calculating future compound growth on a lump sum principal:',
    formulaCode: 'A = P × (1 + r / n)^(n × t)\n\nWhere:\n• A = Future Accumulated Value\n• P = Initial Principal\n• r = Annual Nominal Interest Rate (decimal)\n• n = Compounding frequency per year (1 for annual, 4 for quarterly, 12 for monthly, 365 for daily)\n• t = Total duration in years',
    faqs: [
      {
        question: 'What is the difference between simple and compound interest?',
        answer: 'Simple interest is calculated only on the initial principal amount. Compound interest is calculated on both the principal and the accumulated interest from previous periods.'
      },
      {
        question: 'How does compounding frequency impact returns?',
        answer: 'The more frequently interest compounds (e.g., monthly vs annually), the sooner that earned interest starts generating its own returns. Over long horizons, more frequent compounding generates a higher effective annual yield.'
      },
      {
        question: 'Does this calculator deduct taxes or fees?',
        answer: 'This utility calculates mathematical compound growth based on your gross return assumption. Actual post-tax returns will depend on your tax bracket and specific investment vehicle.'
      }
    ]
  },

  'regular-investment': {
    mode: 'regular-investment',
    path: '/investment-calculator',
    seo: {
      title: 'Regular Investment Calculator - Recurring Monthly & Annual Portfolio Growth',
      description: 'Model recurring contributions into your investment portfolio. Plan monthly, quarterly, or yearly investments and project wealth accumulation over time.',
      canonicalUrl: 'https://genpoputils.github.io/compound-calculator/investment-calculator',
      keywords: 'regular investment calculator, recurring deposit, monthly investment growth, wealth builder, portfolio projection',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Regular Investment Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All'
      }
    },
    heading: 'Regular Investment Calculator',
    subheading: 'Project total wealth accumulation when making steady recurring investments combined with an initial corpus.',
    explanationTitle: 'Building Long-Term Wealth Through Disciplined Contributions',
    paragraphs: [
      'Regular investing involves consistently putting money to work at set intervals (monthly, quarterly, or yearly) rather than waiting for a lump sum. This enables Dollar-Cost Averaging (or Rupee-Cost Averaging) and harness compound growth from day one.',
      'By simulating month-by-month cashflows, this calculator models exact interest accrual between contributions, ensuring your projection matches realistic financial instruments.'
    ],
    keyHighlights: [
      {
        title: 'Consistent Habit',
        description: 'Automating recurring investments builds wealth steadily without the risk of timing market peaks and troughs.'
      },
      {
        title: 'Lump Sum + Systematic Deposits',
        description: 'Combine existing savings with future monthly savings to maximize compounding velocity.'
      },
      {
        title: 'Purchasing Power Reality',
        description: 'See both the nominal future portfolio value and its inflation-discounted real value.'
      }
    ],
    formulaTitle: 'Future Value of an Annuity with Principal',
    formulaDescription: 'Calculated using monthly cashflow compounding where deposits occur at the start of each contribution interval:',
    formulaCode: 'Total Value = Principal × (1 + i)^n + Contribution × [((1 + i)^n - 1) / i] × (1 + i)\n\nWhere:\n• i = Periodic interest rate (r / 12 for monthly)\n• n = Total number of periods',
    faqs: [
      {
        question: 'Should I invest monthly or quarterly?',
        answer: 'Monthly investing is generally superior because money is put to work earlier, giving each deposit more time to compound, and aligns naturally with monthly income cycles.'
      },
      {
        question: 'Can I add an initial lump sum with monthly contributions?',
        answer: 'Yes, this calculator allows you to enter an existing principal corpus alongside regular recurring deposits.'
      }
    ]
  },

  'sip': {
    mode: 'sip',
    path: '/sip-calculator',
    seo: {
      title: 'SIP Calculator - Systematic Investment Plan Growth & Mutual Fund Returns',
      description: 'Calculate future wealth from your monthly Systematic Investment Plan (SIP). See total invested capital, estimated returns, and final corpus.',
      canonicalUrl: 'https://genpoputils.github.io/compound-calculator/sip-calculator',
      keywords: 'sip calculator, mutual fund sip, systematic investment plan, monthly sip returns, wealth corpus',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'SIP Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All'
      }
    },
    heading: 'SIP Growth Calculator',
    subheading: 'Discover the exponential potential of monthly Systematic Investment Plans over 5, 10, 15, or 25+ years.',
    explanationTitle: 'How Systematic Investment Plans (SIP) Compound Wealth',
    paragraphs: [
      'A Systematic Investment Plan (SIP) is one of the most effective tools for building retail wealth. By investing a fixed amount every month in assets like mutual funds or index funds, you benefit from rupee-cost averaging and compounding.',
      'Our SIP calculator models month-by-month cashflow deposits at the start of every calendar month, giving you the most accurate real-world projection available.'
    ],
    keyHighlights: [
      {
        title: 'Disciplined Saving',
        description: 'Treat your monthly SIP as a non-negotiable expense that gets invested before discretionary spending.'
      },
      {
        title: 'The Tipping Point',
        description: 'Around years 7 to 10 of a 12% SIP, your annual investment returns start surpassing your annual invested amount.'
      },
      {
        title: 'Zero Market Timing Stress',
        description: 'SIPs purchase more units when markets drop and fewer when markets rise, smoothing volatility.'
      }
    ],
    formulaTitle: 'Standard SIP Growth Formula',
    formulaDescription: 'Universal formula for monthly beginning-of-period compounding:',
    formulaCode: 'M = P × [ ((1 + i)^n - 1) / i ] × (1 + i)\n\nWhere:\n• M = Expected Maturity Amount\n• P = Monthly Investment Amount\n• i = Monthly rate of return (Expected Annual Return / 12 / 100)\n• n = Number of monthly installments (Years × 12)',
    faqs: [
      {
        question: 'What is a realistic expected return for SIP in equity funds?',
        answer: 'Historically, diversified Indian and broad equity index funds have delivered 11% to 14% annualized nominal returns over 10-15 year horizons. However, equities fluctuate, so planning with 11-12% is a common benchmark.'
      },
      {
        question: 'What happens if I miss an SIP payment?',
        answer: 'In real mutual funds, missing an SIP payment does not incur a penalty from fund houses (though your bank might charge ECS bounce fees if funds are insufficient). Your previously invested money continues compounding.'
      }
    ]
  },

  'step-up': {
    mode: 'step-up',
    path: '/step-up-investment-calculator',
    seo: {
      title: 'Step-Up SIP Calculator - Annual Contribution Increase & Accelerated Wealth',
      description: 'Model the compounding power of increasing your monthly investment by 5%, 10%, or 15% each year as your income grows. See how Step-Up SIP doubles your wealth.',
      canonicalUrl: 'https://genpoputils.github.io/compound-calculator/step-up-investment-calculator',
      keywords: 'step up sip calculator, top up sip, annual contribution increase, step up investment, accelerated compounding',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Step-Up Investment Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All'
      }
    },
    heading: 'Step-Up Investment Calculator',
    subheading: 'Automatically increase your monthly investment every year in tandem with your salary hikes and career growth.',
    explanationTitle: 'Why Step-Up SIP is the Ultimate Wealth Multiplier',
    paragraphs: [
      'Most individuals start investing with an amount affordable early in their careers. However, as salary and income rise with promotions and annual increments, maintaining a flat SIP leaves massive surplus uninvested.',
      'A Step-Up SIP (or Top-Up SIP) commits to raising your monthly contribution by a modest percentage (e.g., 10%) once every year. Over 15 to 20 years, a 10% annual step-up can often double or triple your final retirement corpus compared to a static SIP.'
    ],
    keyHighlights: [
      {
        title: 'Aligns With Salary Increments',
        description: 'If you receive an 8-10% annual salary hike, channeling a 10% increase to your investments preserves your savings rate.'
      },
      {
        title: 'Huge Terminal Corpus Boost',
        description: 'A flat ₹20,000/month at 12% for 20 years yields ~₹2 Cr. Stepping up 10% each year yields nearly ~₹4.8 Cr!'
      },
      {
        title: 'Counteracts Lifestyle Inflation',
        description: 'Stepping up contributions keeps lifestyle creep in check while accelerating financial freedom.'
      }
    ],
    formulaTitle: 'Step-Up Annual Contribution Escalation',
    formulaDescription: 'Monthly contribution in Year y increments by annual step-up rate s%:',
    formulaCode: 'Monthly Deposit in Year y = Starting Monthly × (1 + s)^(y - 1)\n\nExample:\n• Year 1: ₹20,000 / month\n• Year 2 (+10%): ₹22,000 / month\n• Year 3 (+10%): ₹24,200 / month\n• Year 4 (+10%): ₹26,620 / month\n• Year 5 (+10%): ₹29,282 / month',
    faqs: [
      {
        question: 'How much should I step up my investment each year?',
        answer: 'A step-up rate between 5% and 10% is standard and easily manageable for most salaried professionals who receive annual compensation reviews.'
      },
      {
        question: 'Can I stop stepping up after reaching a ceiling?',
        answer: 'Yes, in practice you can cap your monthly contributions once your income stabilizes or other family milestones arise.'
      }
    ]
  },

  'retirement': {
    mode: 'retirement',
    path: '/retirement-calculator',
    seo: {
      title: 'Retirement Savings Calculator - Future Corpus & Inflation-Adjusted Purchasing Power',
      description: 'Plan your retirement with step-up investments, nominal corpus forecasts, inflation-adjusted purchasing power, and retirement expense projections.',
      canonicalUrl: 'https://genpoputils.github.io/compound-calculator/retirement-calculator',
      keywords: 'retirement calculator, retirement savings, fire calculator, inflation adjusted retirement, pension planning, retirement expense projection',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Retirement Savings Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All'
      }
    },
    heading: 'Retirement Savings & FIRE Calculator',
    subheading: 'Model your journey to financial independence with step-up contributions, inflation discounting, and future living costs.',
    explanationTitle: 'Retirement Planning: Nominal Corpus vs Today’s Purchasing Power',
    paragraphs: [
      'The single greatest mistake in retirement planning is ignoring inflation. A ₹5 Crore corpus 20 years in the future might sound astronomical today, but at 6% annual inflation, it will have the equivalent purchasing power of approximately ₹1.56 Crore today.',
      'Our engine calculates your nominal future wealth first based on your expected investment return. Then, it separately applies your inflation assumption to determine what that corpus will actually buy in today’s goods and services.'
    ],
    keyHighlights: [
      {
        title: 'Nominal Growth vs Real Purchasing Power',
        description: 'We never conflate returns with inflation. Nominal returns compound your bank account balance; inflation determines what goods and services cost.'
      },
      {
        title: 'Future Expense Multiplier',
        description: 'If you spend ₹40,000/month today, a 6% inflation rate over 20 years means you will need ~₹1,28,000/month for that exact same lifestyle.'
      },
      {
        title: 'Safe Withdrawal Strategy',
        description: 'Using the 4% safe withdrawal framework, your real retirement corpus provides sustainable monthly income without principal depletion.'
      }
    ],
    formulaTitle: 'Retirement Purchasing Power Discounting',
    formulaDescription: 'Discounting future nominal corpus by cumulative inflation over the pre-retirement accumulation period:',
    formulaCode: 'Real Value (Today\'s Purchasing Power) = Future Corpus / (1 + Inflation Rate)^Years\n\nExample at 6% inflation over 16 years:\nReal Value = ₹4.82 Cr / (1.06)^16 = ₹1.51 Cr',
    faqs: [
      {
        question: 'What inflation rate should I assume for retirement in India?',
        answer: 'Consumer price inflation (CPI) in India has historically averaged around 5% to 7%. For planning retirement spanning several decades, 6% to 7% is a prudent baseline.'
      },
      {
        question: 'What is the 4% safe withdrawal rule?',
        answer: 'The 4% rule suggests that a retiree can withdraw 4% of their initial retirement portfolio in the first year and adjust subsequent withdrawals for inflation, with high probability that the money will last 30+ years.'
      }
    ]
  },

  'inflation': {
    mode: 'inflation',
    path: '/inflation-calculator',
    seo: {
      title: 'Inflation Calculator - Future Living Costs & Purchasing Power Erosion',
      description: 'Calculate the real cost of inflation. See how price increases erode purchasing power and what today\'s money will buy 10, 20, or 30 years from now.',
      canonicalUrl: 'https://genpoputils.github.io/compound-calculator/inflation-calculator',
      keywords: 'inflation calculator, purchasing power loss, future cost of living, rupee depreciation, inflation impact',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Inflation Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All'
      }
    },
    heading: 'Inflation & Purchasing Power Calculator',
    subheading: 'Understand how annual inflation silently diminishes your purchasing power over time.',
    explanationTitle: 'The Silent Tax: How Inflation Impacts Wealth',
    paragraphs: [
      'Inflation is the rate at which the general level of prices for goods and services rises, eroding currency purchasing power. When inflation runs at 6% annually, prices double roughly every 12 years (Rule of 72).',
      'Keeping money idle in standard savings accounts or low-yield instruments actually causes wealth destruction in real terms. To build wealth, your investments must generate a positive real rate of return above inflation and taxes.'
    ],
    keyHighlights: [
      {
        title: 'The Rule of 72',
        description: 'Divide 72 by the inflation rate to approximate how many years it takes for prices to double. At 6% inflation, costs double in 12 years.'
      },
      {
        title: 'Real vs Nominal Value',
        description: 'Nominal is the numerical face value of cash. Real value represents what goods, services, and experiences that cash can actually buy.'
      },
      {
        title: 'Beat Inflation with Equities',
        description: 'Equities and productive businesses are prime hedges against inflation because companies raise prices as input costs increase.'
      }
    ],
    formulaTitle: 'Future Cost and Real Purchasing Power Formulas',
    formulaDescription: 'Calculating future cost of today\'s basket and the future purchasing power of a fixed amount:',
    formulaCode: 'Future Cost = Current Cost × (1 + Inflation)^Years\n\nPurchasing Power of Future Amount = Current Amount / (1 + Inflation)^Years',
    faqs: [
      {
        question: 'Why does inflation feel higher than official CPI numbers?',
        answer: 'Official CPI baskets include diverse components like wholesale commodities, rural goods, and fuel. Urban lifestyle expenses, education, healthcare, and real estate often inflate at 8% to 10% annually.'
      },
      {
        question: 'How do I protect my savings from inflation?',
        answer: 'Invest in growth assets (such as equity mutual funds, index funds, or sovereign gold bonds) that historically offer returns in excess of prevailing inflation rates.'
      }
    ]
  },

  'savings-goal': {
    mode: 'savings-goal',
    path: '/savings-goal-calculator',
    seo: {
      title: 'Savings Goal Calculator - Required Monthly Investment to Reach Target Corpus',
      description: 'Reverse-engineer your financial goals. Calculate the exact monthly or annual investment required to achieve your dream corpus, house down payment, or college fund.',
      canonicalUrl: 'https://genpoputils.github.io/compound-calculator/savings-goal-calculator',
      keywords: 'savings goal calculator, target corpus, goal planner, required monthly investment, financial goal calculator',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Savings Goal Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All'
      }
    },
    heading: 'Savings Goal Calculator',
    subheading: 'Work backwards from your dream milestone to calculate the exact monthly investment required.',
    explanationTitle: 'Reverse Engineering Your Financial Milestones',
    paragraphs: [
      'Whether saving for a dream home down payment, children’s higher education, or an emergency fund, defining the target number is the first step. The next critical step is knowing how much you must save and invest each month to reach it on time.',
      'Our goal calculator factors in your existing savings, compounds them over your time horizon, and determines the exact monthly, quarterly, or yearly contribution required.'
    ],
    keyHighlights: [
      {
        title: 'Clear Target Milestones',
        description: 'Turning vague wishes into mathematically exact monthly targets increases goal completion probability.'
      },
      {
        title: 'Put Existing Capital to Work',
        description: 'Your existing savings actively compound in the background, substantially reducing your monthly deposit burden.'
      },
      {
        title: 'Flexibility Across Frequencies',
        description: 'Choose between monthly, quarterly, or yearly contributions to match your income and cashflow schedule.'
      }
    ],
    formulaTitle: 'Goal Sinking Fund Annuity Formula',
    formulaDescription: 'Deriving required periodic payment PMT from target corpus T after crediting future value of initial savings:',
    formulaCode: 'Remaining Target = Target - Initial Savings × (1 + i)^n\n\nRequired Contribution = Remaining Target / [ ((1 + i)^n - 1) / i × (1 + i) ]',
    faqs: [
      {
        question: 'Should I keep emergency funds in the same investment as long-term goals?',
        answer: 'No. Short-term goals and emergency funds should be held in liquid, capital-preserving instruments (like high-yield savings or liquid debt funds). Long-term goals (5+ years) can take market risk for higher returns.'
      },
      {
        question: 'What if market returns fall short of my expectation?',
        answer: 'It is prudent to review your goal progress annually. If returns underperform, you can either step up your monthly savings or extend your goal timeline slightly.'
      }
    ]
  },
  'swp': {
    mode: 'swp',
    path: '/swp-calculator',
    seo: {
      title: 'SWP Calculator - Systematic Withdrawal Plan & Portfolio Longevity',
      description: 'Calculate your systematic monthly payouts, portfolio longevity, and ending capital balance with our interactive global SWP calculator.',
      canonicalUrl: 'https://genpoputils.github.io/compound-calculator/swp-calculator',
      keywords: 'swp calculator, systematic withdrawal plan, portfolio longevity, retirement withdrawal calculator, regular payout calculator',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Systematic Withdrawal Plan (SWP) Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All'
      }
    },
    heading: 'SWP Calculator (Systematic Withdrawal Plan)',
    subheading: 'Model regular periodic payouts, check portfolio longevity, and see your remaining capital balance over time.',
    explanationTitle: 'Generating Predictable Cash Flow While Keeping Capital Invested',
    paragraphs: [
      'A Systematic Withdrawal Plan (SWP) allows investors to redeem a predetermined sum from an accumulated investment corpus at regular intervals (monthly or annually) while keeping the remainder invested to continue earning compound returns.',
      'SWP is an essential tool for retirees, early-retirees (FIRE), and individuals seeking structured passive income without liquidating their entire portfolio all at once.'
    ],
    keyHighlights: [
      {
        title: 'Consistent Income Stream',
        description: 'Receive predictable monthly cash flows straight to your bank account to cover living expenses.'
      },
      {
        title: 'Ongoing Capital Compounding',
        description: 'The remaining corpus stays invested and continues earning returns, slowing down capital depletion.'
      },
      {
        title: 'Inflation Defense',
        description: 'Model annual withdrawal increases to preserve your real purchasing power over long multi-decade horizons.'
      }
    ],
    formulaTitle: 'SWP Balance & Longevity Formula',
    formulaDescription: 'Monthly portfolio balance recurrence incorporating beginning-of-month withdrawals and compound accrual:',
    formulaCode: 'Balance_m = (Balance_{m-1} - Withdrawal_m) × (1 + r / 12)\n\nReal Balance_y = Balance_y / (1 + i)^y',
    faqs: [
      {
        question: 'How does an SWP differ from a SIP?',
        answer: 'A SIP (Systematic Investment Plan) is for wealth accumulation (investing periodic savings into assets). An SWP is for wealth distribution (withdrawing regular cash from accumulated investments while the remainder compounds).'
      },
      {
        question: 'What is a safe withdrawal rate for long-term sustainability?',
        answer: 'The classic 4% safe withdrawal rule suggests withdrawing roughly 4% of your initial portfolio in year one, adjusted annually for inflation, to sustain a 30-year horizon in balanced portfolios.'
      },
      {
        question: 'Can my money run out in an SWP?',
        answer: 'Yes, if your withdrawal rate and annual step-up exceed the returns generated by your remaining investments, capital will gradually deplete. Our calculator flags whether your corpus sustains or depletes, showing the exact depletion year.'
      }
    ]
  }
};
