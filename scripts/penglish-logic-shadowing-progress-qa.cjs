const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_LOGIC_QA_BASE_URL || 'http://127.0.0.1:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-logic');

function isAllowedFailedRequest(url) {
  return url.includes('favicon')
    || url.includes('chrome-extension')
    || url.includes('/ocean/ambient-whale/frames/')
    || url.includes('youtube-nocookie.com')
    || url.includes('youtube.com');
}

async function waitForShadowing(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.getByTestId('shadowing-practice-card').waitFor({ timeout: 20000 });
  await page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 10000 });
  await page.getByTestId('shadowing-progress').waitFor({ timeout: 10000 });
  await page.getByTestId('shadowing-mark-practiced-button').waitFor({ timeout: 10000 });
  await page.getByTestId('shadowing-toggle-difficult-button').waitFor({ timeout: 10000 });
}

async function checkNoHorizontalOverflow(page, label, errors) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) errors.push(`horizontal overflow on ${label}: ${JSON.stringify(overflow)}`);
}

async function readShadowingProgress(page) {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem('penglish.shadowing.progress.v1');
    return raw ? JSON.parse(raw) : null;
  });
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => consoleErrors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (isAllowedFailedRequest(url)) return;
    failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'domcontentloaded' });
  await waitForShadowing(page);
  await page.evaluate(() => window.localStorage.removeItem('penglish.shadowing.progress.v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForShadowing(page);
  await checkNoHorizontalOverflow(page, 'shadowing initial mobile', errors);
  await page.screenshot({ path: path.join(outDir, 'shadowing-progress-mobile.png'), fullPage: true });

  await page.getByTestId('shadowing-mark-practiced-button').click();
  await page.getByTestId('shadowing-practiced-count').waitFor({ timeout: 10000 });
  const practicedText = await page.getByTestId('shadowing-practiced-count').innerText();
  if (!/^1\//.test(practicedText.trim())) errors.push(`expected first sentence practiced count to start with 1/, got ${practicedText}`);

  await page.getByTestId('shadowing-next-button').click();
  await page.getByTestId('shadowing-current-line-count').waitFor({ timeout: 10000 });
  await page.getByText(/^Câu 2\//).first().waitFor({ timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, 'shadowing-current-sentence-mobile.png'), fullPage: true });

  await page.getByTestId('shadowing-toggle-difficult-button').click();
  const difficultText = await page.getByTestId('shadowing-difficult-count').innerText();
  if (difficultText.trim() !== '1') errors.push(`expected difficult count 1, got ${difficultText}`);

  await page.getByTestId('shadowing-next-button').click();
  await page.getByText(/^Câu 3\//).first().waitFor({ timeout: 10000 });
  await page.getByTestId('shadowing-previous-button').click();
  await page.getByText(/^Câu 2\//).first().waitFor({ timeout: 10000 });

  const beforeReload = await readShadowingProgress(page);
  if (!beforeReload || !Object.values(beforeReload).some((entry) => entry.currentLineIndex === 1 && entry.practicedLineIds?.length === 1 && entry.difficultLineIds?.length === 1)) {
    errors.push(`localStorage progress before reload is invalid: ${JSON.stringify(beforeReload)}`);
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForShadowing(page);
  await page.getByText(/^Câu 2\//).first().waitFor({ timeout: 10000 });
  await page.getByText('Đã luyện', { exact: false }).first().waitFor({ timeout: 10000 });
  await page.getByText('Câu khó', { exact: false }).first().waitFor({ timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, 'shadowing-progress-after-reload.png'), fullPage: true });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForShadowing(page);
  await page.getByTestId('shadowing-transcript-panel').waitFor({ timeout: 10000 });
  await checkNoHorizontalOverflow(page, 'shadowing desktop', errors);
  await page.screenshot({ path: path.join(outDir, 'shadowing-transcript-progress-desktop.png'), fullPage: true });

  const afterReload = await readShadowingProgress(page);
  if (!afterReload || JSON.stringify(afterReload) !== JSON.stringify(beforeReload)) {
    errors.push(`localStorage progress changed unexpectedly after reload: before=${JSON.stringify(beforeReload)} after=${JSON.stringify(afterReload)}`);
  }

  await browser.close();

  if (failedRequests.length) errors.push(`failed requests:\n${failedRequests.join('\n')}`);
  if (consoleErrors.length) errors.push(`console/page errors:\n${consoleErrors.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`PENGLISH-LOGIC-02 QA passed. Screenshots saved to ${outDir}`);
})();
