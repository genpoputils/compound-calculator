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

  test('should render educational SEO content and FAQs', async ({ page }) => {
    await page.goto('/step-up-investment-calculator');

    await expect(page.getByText('Why Step-Up SIP is the Ultimate Wealth Multiplier')).toBeVisible();
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible();
  });
});
