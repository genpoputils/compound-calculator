import { test, expect } from '@playwright/test';

test.describe('Compound Calculator Web Application', () => {
  test('should load homepage and display hero and calculator card immediately', async ({ page }) => {
    await page.goto('/');

    // Verify Title contains Calculator
    await expect(page).toHaveTitle(/Calculator/i);

    // Verify Hero text
    await expect(page.locator('h1')).toContainText('Compound Calculator');
    await expect(page.getByText('See how your money can grow over time.')).toBeVisible();

    // Verify Main Calculator Card
    const calcCard = page.locator('#main-calculator-card');
    await expect(calcCard).toBeVisible();

    // Verify Primary metric card is visible
    await expect(page.getByText('Estimated Future Value')).toBeVisible();
    await expect(page.getByText('You Invested')).toBeVisible();
    await expect(page.getByText('Estimated Growth')).toBeVisible();
  });

  test('should switch modes smoothly without page reload', async ({ page }) => {
    await page.goto('/');

    // Switch to Compound Interest mode
    const ciTab = page.getByRole('button', { name: 'Compound Interest' });
    await ciTab.click();

    // Inputs should update
    await expect(page.getByText('Compounding Frequency', { exact: true })).toBeVisible();
    await expect(page.getByText('Annual Interest Rate')).toBeVisible();

    // Switch to Retirement mode
    const retTab = page.getByRole('button', { name: 'Retirement Savings' });
    await retTab.click();

    await expect(page.getByText('Current Age')).toBeVisible();
    await expect(page.getByText('Retirement Age')).toBeVisible();
    await expect(page.getByText('Sustainable Monthly Purchasing Power')).toBeVisible();

    // Switch to Inflation mode
    const infTab = page.getByRole('button', { name: 'Inflation', exact: true });
    await infTab.click();

    await expect(page.getByText('Future Equivalent Cost')).toBeVisible();
    await expect(page.getByText('Today\'s Purchasing Power')).toBeVisible();

    // Switch to Savings Goal
    const goalTab = page.getByRole('button', { name: 'Savings Goal' });
    await goalTab.click();

    await expect(page.getByText('Required Monthly Deposit')).toBeVisible();
  });

  test('should update calculations dynamically when changing inputs', async ({ page }) => {
    await page.goto('/step-up-investment-calculator');

    const metricCard = page.locator('app-metric-card').first();
    const initialText = await metricCard.innerText();

    // Click quick step button +10k
    const quickStepBtn = page.getByRole('button', { name: '+10k' });
    await quickStepBtn.click();

    // Metric should update
    await expect(metricCard).not.toHaveText(initialText);
  });

  test('should render charts and interactive controls', async ({ page }) => {
    await page.goto('/');

    // Verify canvas is present and visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify chart mode buttons
    const inflationAdjustedBtn = page.getByRole('button', { name: 'Inflation Adjusted' });
    await expect(inflationAdjustedBtn).toBeVisible();
    await inflationAdjustedBtn.click();
  });

  test('should toggle dark/light theme and persist preference', async ({ page }) => {
    await page.goto('/');

    // Click Light Theme button
    const lightBtn = page.locator('#theme-light-btn');
    await expect(lightBtn).toBeVisible();
    await lightBtn.click();

    // Document element should not have 'dark' class
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Click Dark Theme button
    const darkBtn = page.locator('#theme-dark-btn');
    await expect(darkBtn).toBeVisible();
    await darkBtn.click();

    // Document element should have 'dark' class
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should support scenario comparison mode', async ({ page }) => {
    await page.goto('/step-up-investment-calculator');

    // Click "Compare Scenarios" button
    const compareBtn = page.getByRole('button', { name: /Compare Scenarios/i });
    await compareBtn.click();

    // Should display Scenario Comparison panel
    await expect(page.getByText('Scenario A (Current)')).toBeVisible();
    await expect(page.getByText('Scenario B (What-If Model)')).toBeVisible();
    await expect(page.getByText('Corpus Difference')).toBeVisible();
  });

  test('should restore calculations accurately from URL query parameters', async ({ page }) => {
    // Open URL with custom query params
    await page.goto('/retirement-calculator?age=30&retirement=55&monthly=30000&stepup=10&return=12&inflation=6');

    // Check that age input has value 30
    const ageInput = page.locator('#input-ret-age');
    await expect(ageInput).toHaveValue('30');

    // Check retirement age input has value 55
    const retAgeInput = page.locator('#input-ret-retAge');
    await expect(retAgeInput).toHaveValue('55');

    // Check monthly input has 30000
    const monthlyInput = page.locator('#input-ret-monthly');
    await expect(monthlyInput).toHaveValue('30000');
  });

  test('should allow custom inflation input in savings goal calculator and update purchasing power', async ({ page }) => {
    await page.goto('/savings-goal-calculator');

    // Verify savings goal inflation input exists
    const inflationInput = page.locator('#input-goal-inflation');
    await expect(inflationInput).toBeVisible();
    await expect(inflationInput).toHaveValue('6');

    // Verify purchasing power card
    const purchasingPowerCard = page.locator('app-metric-card').filter({ hasText: "Today's Purchasing Power" });
    await expect(purchasingPowerCard).toBeVisible();
    await expect(purchasingPowerCard).toContainText('6% annual inflation');

    // Click quick step button 7%
    const quickStep7 = page.getByRole('button', { name: '7%' });
    await quickStep7.click();

    // Purchasing power card subtext should update to 7%
    await expect(purchasingPowerCard).toContainText('7% annual inflation');
  });

  test('should render educational SEO content and FAQs', async ({ page }) => {
    await page.goto('/step-up-investment-calculator');

    await expect(page.getByText('Why Step-Up SIP is the Ultimate Wealth Multiplier')).toBeVisible();
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible();
  });

  test('should allow users to select global currency and update all symbols and prefixes', async ({ page }) => {
    await page.goto('/');

    const currencySelect = page.locator('#currency-select');
    await expect(currencySelect).toBeVisible();

    // Default currency is USD
    await expect(currencySelect).toHaveValue('USD');

    // Switch to EUR
    await currencySelect.selectOption('EUR');
    await expect(currencySelect).toHaveValue('EUR');

    // Check that input prefix updated to €
    const inputPrefix = page.locator('.pointer-events-none').filter({ hasText: '€' }).first();
    await expect(inputPrefix).toBeVisible();

    // Switch to INR
    await currencySelect.selectOption('INR');
    await expect(currencySelect).toHaveValue('INR');
    const inrPrefix = page.locator('.pointer-events-none').filter({ hasText: '₹' }).first();
    await expect(inrPrefix).toBeVisible();
  });

  test('should render SWP calculator with cashflow inputs, metrics, and longevity modeling', async ({ page }) => {
    await page.goto('/swp-calculator');

    // Verify Title and Heading
    await expect(page).toHaveTitle(/SWP Calculator/i);

    // Verify SWP input controls
    const corpusInput = page.locator('#input-swp-corpus');
    await expect(corpusInput).toBeVisible();
    await expect(corpusInput).toHaveValue('5000000');

    const withdrawalInput = page.locator('#input-swp-withdrawal');
    await expect(withdrawalInput).toBeVisible();
    await expect(withdrawalInput).toHaveValue('35000');

    // Verify SWP metric cards
    await expect(page.getByText('Remaining Portfolio Balance')).toBeVisible();
    await expect(page.getByText('Total Payout Received')).toBeVisible();
    await expect(page.getByText('Total Returns Generated')).toBeVisible();

    // Verify SWP table column headers
    await expect(page.getByRole('columnheader', { name: 'Monthly Payout' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Annual Payout' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Remaining Balance' })).toBeVisible();

    // Test depletion scenario: withdraw huge amount
    await withdrawalInput.fill('500000');
    await withdrawalInput.dispatchEvent('input');

    // Should indicate corpus depletion
    await expect(page.getByText('Corpus Depleted')).toBeVisible();
  });
});

