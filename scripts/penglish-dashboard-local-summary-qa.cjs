const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_DASHBOARD_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-dashboard');
const vocabStorageKey = 'penglish.vocabulary.progress.v1';
const shadowingStorageKey = 'penglish.shadowing.progress.v1';
const speechStorageKey = 'p-english:speech-progress';
const todayMissionsStorageKey = 'p-english:today-missions';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isAllowedFailedRequest(url, failureText = '') {
  return url.includes('favicon')
    || url.includes('chrome-extension')
    || url.includes('/ocean/ambient-whale/frames/')
    || url.includes('youtube-nocookie.com')
    || url.includes('youtube.com')
    || (failureText.includes('ERR_ABORTED') && url.startsWith(baseUrl) && url.includes('/assets/'));
}

function requestLooksLikeProgressServerWrite(request) {
  const url = request.url();
  const method = request.method();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return false;
  return /supabase|rest\/v1|storage|vocabulary|progress|shadowing|english-speed|audio|upload|api/i.test(url);
}

async function waitForHomeReady(page) {
  await page.locator('[data-testid="home-local-learning-summary"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="home-recommended-action"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
}

async function clearLearningStorage(page) {
  await page.evaluate((keys) => {
    keys.forEach((key) => window.localStorage.removeItem(key));
  }, [vocabStorageKey, shadowingStorageKey, speechStorageKey, todayMissionsStorageKey]);
}

async function readCardText(page, testId) {
  return (await page.locator(`[data-testid="${testId}"]`).innerText()).replace(/\s+/g, ' ').trim();
}

async function readHomeSummary(page) {
  return {
    recommendedAction: (await page.locator('[data-testid="home-recommended-action"]').innerText()).trim(),
    summaryCta: (await page.locator('[data-testid="home-summary-cta"]').innerText()).trim(),
    message: await readCardText(page, 'home-dashboard-recommended-message'),
    localSummary: await readCardText(page, 'home-local-learning-summary'),
    vocabDue: await readCardText(page, 'home-vocab-due-count'),
    vocabDifficult: await readCardText(page, 'home-vocab-difficult-count'),
    shadowingPracticed: await readCardText(page, 'home-shadowing-practiced-count'),
    shadowingDifficult: await readCardText(page, 'home-shadowing-difficult-count'),
    speedPracticed: await readCardText(page, 'home-speed-practiced-count'),
  };
}

function textHasNumber(text, expected) {
  return new RegExp(`(^|\\D)${expected}(\\D|$)`).test(text);
}

async function checkNoHorizontalOverflow(page, label, results) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) results.errors.push(`Horizontal overflow on ${label}: ${JSON.stringify(overflow)}`);
}

async function seedVocabularyReviewViaUi(page) {
  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('vocab-mobile-root').waitFor({ timeout: 20000 });
  await page.locator('[data-testid^="vocab-mark-review-"]').first().waitFor({ state: 'visible', timeout: 20000 });
  const reviewButton = page.locator('[data-testid^="vocab-mark-review-"]').first();
  const testId = await reviewButton.getAttribute('data-testid');
  assert(testId, 'Vocabulary review button did not expose a test id');
  const wordId = testId.replace('vocab-mark-review-', '');
  await reviewButton.click();
  await page.waitForFunction(
    ({ key, id }) => {
      const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
      return stored[id]?.status === 'review';
    },
    { key: vocabStorageKey, id: wordId },
    { timeout: 10000 },
  );
  return wordId;
}

async function seedShadowingDifficultViaUi(page) {
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 20000 });
  await page.getByTestId('shadowing-mark-practiced-button').click();
  await page.getByTestId('shadowing-toggle-difficult-button').click();
  await page.waitForFunction(
    (key) => Object.values(JSON.parse(window.localStorage.getItem(key) || '{}')).some((entry) => Array.isArray(entry.practicedLineIds) && entry.practicedLineIds.length > 0 && Array.isArray(entry.difficultLineIds) && entry.difficultLineIds.length > 0),
    shadowingStorageKey,
    { timeout: 10000 },
  );
}

async function verifyDefaultHome(page, results) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
  await clearLearningStorage(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForHomeReady(page);

  const summary = await readHomeSummary(page);
  assert(summary.recommendedAction.includes('Học tiếp ngay'), `Expected default CTA to be Học tiếp ngay, got: ${summary.recommendedAction}`);
  assert(textHasNumber(summary.vocabDue, 0), `Expected default vocabulary due count 0, got: ${summary.vocabDue}`);
  assert(textHasNumber(summary.shadowingDifficult, 0), `Expected default shadowing difficult count 0, got: ${summary.shadowingDifficult}`);
  assert(summary.speedPracticed.includes('—') || summary.speedPracticed.includes('Chưa có dữ liệu'), `Expected neutral English Speed state, got: ${summary.speedPracticed}`);
  assert(summary.localSummary.includes('Lưu trên thiết bị'), 'Expected local/device privacy tag on dashboard summary');
  assert(summary.message.includes('Mọi dữ liệu đang được lưu trên thiết bị này'), 'Expected local-only privacy copy in recommended message');

  await checkNoHorizontalOverflow(page, '/home default mobile', results);
  await page.screenshot({ path: path.join(screenshotDir, 'dashboard-home-default-mobile.png'), fullPage: false, timeout: 60000 });
  return summary;
}

async function verifyUpdatedHomePersists(page, results) {
  await seedVocabularyReviewViaUi(page);
  await seedShadowingDifficultViaUi(page);

  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
  await waitForHomeReady(page);
  const updated = await readHomeSummary(page);
  assert(updated.recommendedAction.includes('Ôn từ vựng'), `Expected vocabulary-priority CTA, got: ${updated.recommendedAction}`);
  assert(updated.summaryCta.includes('Ôn từ vựng'), `Expected summary CTA to be Ôn từ vựng, got: ${updated.summaryCta}`);
  assert(/Bạn có \d+ từ cần ôn hôm nay/.test(updated.message), `Expected vocabulary review recommendation message, got: ${updated.message}`);
  assert(!textHasNumber(updated.vocabDue, 0), `Expected vocabulary due count above 0 after marking review, got: ${updated.vocabDue}`);
  assert(!textHasNumber(updated.shadowingPracticed, 0), `Expected shadowing practiced count above 0, got: ${updated.shadowingPracticed}`);
  assert(!textHasNumber(updated.shadowingDifficult, 0), `Expected shadowing difficult count above 0, got: ${updated.shadowingDifficult}`);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForHomeReady(page);
  const persisted = await readHomeSummary(page);
  assert(persisted.recommendedAction.includes('Ôn từ vựng'), `Expected persisted vocabulary-priority CTA, got: ${persisted.recommendedAction}`);
  assert(/Bạn có \d+ từ cần ôn hôm nay/.test(persisted.message), `Expected persisted vocabulary message, got: ${persisted.message}`);
  assert(!textHasNumber(persisted.vocabDue, 0), `Expected persisted vocabulary due count above 0, got: ${persisted.vocabDue}`);
  assert(!textHasNumber(persisted.shadowingDifficult, 0), `Expected persisted shadowing difficult count above 0, got: ${persisted.shadowingDifficult}`);

  await checkNoHorizontalOverflow(page, '/home with review mobile', results);
  await page.screenshot({ path: path.join(screenshotDir, 'dashboard-home-with-review-mobile.png'), fullPage: false, timeout: 60000 });
  return { updated, persisted };
}

async function verifyDesktopHome(page, results) {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
  await waitForHomeReady(page);
  const desktop = await readHomeSummary(page);
  assert(desktop.localSummary.includes('Ôn hôm nay'), 'Expected desktop dashboard local summary card');
  await checkNoHorizontalOverflow(page, '/home desktop', results);
  await page.screenshot({ path: path.join(screenshotDir, 'dashboard-home-desktop.png'), fullPage: false, timeout: 60000 });
  return desktop;
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = {
    ok: false,
    baseUrl,
    screenshots: [
      'dashboard-home-default-mobile.png',
      'dashboard-home-with-review-mobile.png',
      'dashboard-home-desktop.png',
    ],
    viewports: ['mobile 390x844', 'desktop 1366x768'],
    consoleErrors: [],
    failedRequests: [],
    unexpectedProgressWrites: [],
    errors: [],
    defaultSummary: null,
    updatedSummary: null,
    persistedSummary: null,
    desktopSummary: null,
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  page.on('console', (message) => {
    if (message.type() === 'error') results.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => results.consoleErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const url = request.url();
    const failureText = request.failure()?.errorText || 'unknown';
    if (!isAllowedFailedRequest(url, failureText)) results.failedRequests.push(`${request.method()} ${url} :: ${failureText}`);
  });
  page.on('request', (request) => {
    if (requestLooksLikeProgressServerWrite(request)) results.unexpectedProgressWrites.push(`${request.method()} ${request.url()}`);
  });

  try {
    results.defaultSummary = await verifyDefaultHome(page, results);
    const { updated, persisted } = await verifyUpdatedHomePersists(page, results);
    results.updatedSummary = updated;
    results.persistedSummary = persisted;
    results.desktopSummary = await verifyDesktopHome(page, results);

    if (results.consoleErrors.length) results.errors.push(`Console errors found: ${results.consoleErrors.join('\n')}`);
    if (results.failedRequests.length) results.errors.push(`Failed requests found: ${results.failedRequests.join('\n')}`);
    if (results.unexpectedProgressWrites.length) results.errors.push(`Unexpected progress/audio server writes found: ${results.unexpectedProgressWrites.join('\n')}`);

    results.ok = results.errors.length === 0;
    console.log(JSON.stringify(results, null, 2));
    if (!results.ok) process.exitCode = 1;
  } catch (error) {
    results.errors.push(error.stack || error.message || String(error));
    console.error(JSON.stringify(results, null, 2));
    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
})();
