import { test, expect, Page } from '@playwright/test';

// Wait for the next /items network response after an interaction.
// Must be called BEFORE the action that triggers the fetch.
function waitForItems(page: Page) {
  return page.waitForResponse((res) => res.url().includes('/items') && res.status() === 200);
}

test.beforeEach(async ({ page }) => {
  const responsePromise = waitForItems(page);
  await page.goto('/');
  await responsePromise;
});

test('page loads and displays data', async ({ page }) => {
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(20);

  const totalValue = page.locator('.kpi-card').first().locator('.kpi-value');
  const total = parseInt(await totalValue.textContent() ?? '0');
  expect(total).toBeGreaterThan(0);

  const kpiValues = page.locator('.kpi-card--clickable .kpi-value');
  const counts = await kpiValues.allTextContents();
  const hasNonZero = counts.some((c) => parseInt(c) > 0);
  expect(hasNonZero).toBe(true);
});

test('search filters the table', async ({ page }) => {
  const input = page.locator('.search-input');

  // Set up the response promise before typing, then wait for the debounce (300ms)
  // and the subsequent network response
  const responsePromise = waitForItems(page);
  await input.fill('gallant');
  await page.waitForTimeout(350); // let debounce fire
  await responsePromise;

  const nameCells = page.locator('tbody tr td:nth-child(2)');
  const names = await nameCells.allTextContents();
  expect(names.length).toBeGreaterThan(0);
  names.forEach((name) => expect(name.toLowerCase()).toContain('gallant'));
});

test('clear button (X) restores the full table', async ({ page }) => {
  const input = page.locator('.search-input');

  const searchResponse = waitForItems(page);
  await input.fill('gallant');
  await page.waitForTimeout(350);
  await searchResponse;

  const clearResponse = waitForItems(page);
  await page.locator('.search-clear').click();
  await clearResponse;

  await expect(page.locator('tbody tr')).toHaveCount(20);
  await expect(input).toHaveValue('');
});

test('KPI card click filters table by status', async ({ page }) => {
  const activeCard = page.locator('.kpi-card--clickable:not(.kpi-card--disabled)').first();
  const label = await activeCard.locator('.kpi-label').textContent();
  const expectedStatus = label?.trim() ?? '';

  // Wait specifically for the filtered response (URL will contain status=)
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes('/items') && res.url().includes('status=') && res.status() === 200
  );
  await activeCard.click();
  await responsePromise;

  const badges = page.locator('tbody tr td .badge');
  const texts = await badges.allTextContents();
  expect(texts.length).toBeGreaterThan(0);
  texts.forEach((text) => expect(text).toBe(expectedStatus));

  await expect(activeCard).toHaveClass(/kpi-card--active/);
});

test('clicking active KPI card again deselects the filter', async ({ page }) => {
  const activeCard = page.locator('.kpi-card--clickable:not(.kpi-card--disabled)').first();

  const activateResponse = waitForItems(page);
  await activeCard.click();
  await activateResponse;

  const deactivateResponse = waitForItems(page);
  await activeCard.click();
  await deactivateResponse;

  await expect(activeCard).not.toHaveClass(/kpi-card--active/);
  await expect(page.locator('tbody tr')).toHaveCount(20);
});

test('sort by Name ascending — first row name starts before last row name', async ({ page }) => {
  const responsePromise = waitForItems(page);
  await page.locator('th.sortable', { hasText: 'Name' }).click();
  await responsePromise;

  const nameCells = page.locator('tbody tr td:nth-child(2)');
  const names = await nameCells.allTextContents();
  expect(names[0].localeCompare(names[names.length - 1])).toBeLessThanOrEqual(0);
});

test('sort by Name descending — sort arrow indicates descending', async ({ page }) => {
  const nameHeader = page.locator('th.sortable', { hasText: 'Name' });

  const ascResponse = waitForItems(page);
  await nameHeader.click();
  await ascResponse;

  const descResponse = page.waitForResponse(
    (res) => res.url().includes('/items') && res.url().includes('order=desc') && res.status() === 200
  );
  await nameHeader.click();
  await descResponse;

  // Sort arrow should show descending indicator
  await expect(nameHeader.locator('.sort-arrow:not(.sort-arrow--inactive)')).toContainText('↓');

  // Header should be active
  await expect(nameHeader).toHaveClass(/active/);
});

test('next page button advances to page 2', async ({ page }) => {
  const responsePromise = waitForItems(page);
  await page.locator('.pagination-controls button', { hasText: '›' }).click();
  await responsePromise;

  await expect(page.locator('.page-indicator')).toContainText('Page 2 of');
});

test('previous page button returns to page 1', async ({ page }) => {
  const nextResponse = waitForItems(page);
  await page.locator('.pagination-controls button', { hasText: '›' }).click();
  await nextResponse;

  const prevResponse = waitForItems(page);
  await page.locator('.pagination-controls button', { hasText: '‹' }).click();
  await prevResponse;

  await expect(page.locator('.page-indicator')).toContainText('Page 1 of');
});

test('no results state shows empty table and correct pagination text', async ({ page }) => {
  const input = page.locator('.search-input');

  const responsePromise = waitForItems(page);
  await input.fill('zzznomatch');
  await page.waitForTimeout(350);
  await responsePromise;

  await expect(page.locator('.empty-state')).toBeVisible();
  await expect(page.locator('.empty-state')).toContainText('No results found.');
  await expect(page.locator('.page-indicator')).toContainText('No results');
  await expect(page.locator('.pagination-info')).toContainText('No results');
});
