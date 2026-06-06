const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_LOGIC_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join('reports', 'screenshots', 'penglish-logic');
const storageKey = 'penglish.vocabulary.progress.v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function firstVisibleWordId(page) {
  const knownButton = page.locator('[data-testid^="vocab-mark-known-"]').first();
  await knownButton.waitFor({ state: 'visible', timeout: 15000 });
  const testId = await knownButton.getAttribute('data-testid');
  assert(testId, 'Expected a visible known status button');
  return testId.replace('vocab-mark-known-', '');
}

async function clickFirstStatus(page, status) {
  const locator = page.locator(`[data-testid^="vocab-mark-${status}-"]`).first();
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  const testId = await locator.getAttribute('data-testid');
  await locator.click();
  return testId.replace(`vocab-mark-${status}-`, '');
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const consoleErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((key) => localStorage.removeItem(key), storageKey);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="vocab-mobile-root"]').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('[data-testid="vocab-review-today-card"]').waitFor({ state: 'visible', timeout: 15000 });

  const firstWordId = await firstVisibleWordId(page);
  const reviewWordId = await clickFirstStatus(page, 'review');
  assert(reviewWordId === firstWordId, 'Expected first word to be marked as review');
  await page.screenshot({ path: path.join(screenshotDir, 'words-status-chips-mobile.png'), fullPage: true });

  await page.locator(`[data-testid="vocab-mark-difficult-${reviewWordId}"]`).first().click();
  await page.locator(`[data-testid="vocab-mark-known-${reviewWordId}"]`).first().click();
  await page.locator(`[data-testid="vocab-clear-status-${reviewWordId}"]`).first().click();

  const secondWordId = await clickFirstStatus(page, 'review');
  await page.locator(`[data-testid="vocab-mark-difficult-${secondWordId}"]`).first().click();
  await page.locator('[data-testid="vocab-status-filter-difficult"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, 'words-filter-review.png'), fullPage: true });

  await page.locator(`[data-testid="vocab-mark-known-${secondWordId}"]`).first().click();
  await page.locator('[data-testid="vocab-status-filter-known"]').click();
  await page.waitForTimeout(500);

  await page.locator(`[data-testid="vocab-mark-review-${secondWordId}"]`).first().click();
  await page.locator('[data-testid="vocab-status-filter-review"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, 'words-review-mobile.png'), fullPage: true });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="vocab-mobile-root"]').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('[data-testid="vocab-status-filter-review"]').click();
  await page.locator(`[data-testid="vocab-mark-review-${secondWordId}"]`).first().waitFor({ state: 'visible', timeout: 15000 });
  const persisted = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), storageKey);
  assert(persisted[secondWordId]?.status === 'review', 'Expected review status to persist after reload');
  assert(typeof persisted[secondWordId]?.lastReviewedAt === 'string', 'Expected lastReviewedAt to persist');
  assert(typeof persisted[secondWordId]?.nextReviewAt === 'string', 'Expected nextReviewAt to persist');
  await page.screenshot({ path: path.join(screenshotDir, 'words-progress-persist-after-reload.png'), fullPage: true });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  assert(!overflow, 'Expected no horizontal overflow at 390x844');
  assert(consoleErrors.length === 0, `Console errors found: ${consoleErrors.join('\n')}`);

  await browser.close();
  console.log(JSON.stringify({ ok: true, screenshots: fs.readdirSync(screenshotDir).filter((name) => name.startsWith('words-')), persistedWordId: secondWordId }, null, 2));
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
