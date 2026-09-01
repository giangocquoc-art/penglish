const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_LEARNING_PATH_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-dashboard');
const vocabStorageKey = 'penglish.vocabulary.progress.v1';
const shadowingStorageKey = 'penglish.shadowing.progress.v1';
const localProgressStorageKey = 'p-english:local-progress';
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
    || (failureText.includes('ERR_ABORTED') && url.startsWith(baseUrl) && url.includes('/assets/'))
    || (failureText.includes('ERR_ABORTED') && url.startsWith(baseUrl) && url.includes('/@fs/'));
}

function requestLooksLikeProgressServerWrite(request) {
  const url = request.url();
  const method = request.method();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return false;
  return /supabase|rest\/v1|storage|vocabulary|progress|shadowing|english-speed|audio|upload|api/i.test(url);
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

async function clearLearningPathStorage(page) {
  await page.evaluate((keys) => {
    keys.forEach((key) => window.localStorage.removeItem(key));
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('p-english:lesson-progress:'))
      .forEach((key) => window.localStorage.removeItem(key));
  }, [vocabStorageKey, shadowingStorageKey, localProgressStorageKey, todayMissionsStorageKey]);
}

async function readCardText(page, testId) {
  return (await page.locator(`[data-testid="${testId}"]`).innerText()).replace(/\s+/g, ' ').trim();
}

async function waitForLearningPathReady(page) {
  await page.locator('[data-testid="roadmap-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="learning-path-local-progress-hints"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
}

async function readLearningPathSummary(page) {
  return {
    currentLevel: await readCardText(page, 'learning-path-current-level'),
    completedUnits: await readCardText(page, 'learning-path-completed-units'),
    localHints: await readCardText(page, 'learning-path-local-progress-hints'),
    vocabKnown: await readCardText(page, 'learning-path-vocab-known-count'),
    vocabReview: await readCardText(page, 'learning-path-vocab-review-count'),
    shadowingPracticed: await readCardText(page, 'learning-path-shadowing-practiced-count'),
  };
}

async function seedVocabularyViaUi(page) {
  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('vocab-mobile-root').waitFor({ timeout: 20000 });
  await page.locator('[data-testid^="vocab-mark-known-"]').first().waitFor({ state: 'visible', timeout: 20000 });

  const knownButton = page.locator('[data-testid^="vocab-mark-known-"]').first();
  const knownTestId = await knownButton.getAttribute('data-testid');
  assert(knownTestId, 'Vocabulary known button did not expose a test id');
  const knownWordId = knownTestId.replace('vocab-mark-known-', '');
  await knownButton.click();

  await page.waitForFunction(
    ({ key, id }) => {
      const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
      return stored[id]?.status === 'known';
    },
    { key: vocabStorageKey, id: knownWordId },
    { timeout: 10000 },
  );

  const actualReviewButton = page.locator('[data-testid^="vocab-mark-review-"]').nth(1);
  const reviewTestId = await actualReviewButton.getAttribute('data-testid');
  assert(reviewTestId, 'Vocabulary review button did not expose a test id');
  const reviewWordId = reviewTestId.replace('vocab-mark-review-', '');
  await actualReviewButton.click();

  await page.waitForFunction(
    ({ key, id }) => {
      const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
      return stored[id]?.status === 'review';
    },
    { key: vocabStorageKey, id: reviewWordId },
    { timeout: 10000 },
  );

  return { knownWordId, reviewWordId };
}

async function seedShadowingPracticedViaUi(page) {
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 20000 });
  await page.getByTestId('shadowing-mark-practiced-button').click();
  await page.waitForFunction(
    (key) => Object.values(JSON.parse(window.localStorage.getItem(key) || '{}')).some((entry) => Array.isArray(entry.practicedLineIds) && entry.practicedLineIds.length > 0),
    shadowingStorageKey,
    { timeout: 10000 },
  );
}

async function verifyDefaultLearningPath(page, results) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'domcontentloaded' });
  await clearLearningPathStorage(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForLearningPathReady(page);

  const summary = await readLearningPathSummary(page);
  assert(summary.currentLevel.includes('A1'), `Expected default current level A1, got: ${summary.currentLevel}`);
  assert(textHasNumber(summary.completedUnits, 0), `Expected default completed units 0, got: ${summary.completedUnits}`);
  assert(summary.localHints.includes('Hoàn thành bài học để mở tiến độ unit.'), `Expected no-progress unit helper, got: ${summary.localHints}`);
  assert(summary.localHints.includes('Dữ liệu học được lưu trên thiết bị này') || (await page.locator('body').innerText()).includes('Dữ liệu học được lưu trên thiết bị này'), 'Expected local/device copy on learning path');
  assert(textHasNumber(summary.vocabKnown, 0), `Expected default known vocabulary 0, got: ${summary.vocabKnown}`);
  assert(textHasNumber(summary.vocabReview, 0), `Expected default review vocabulary 0, got: ${summary.vocabReview}`);
  assert(textHasNumber(summary.shadowingPracticed, 0), `Expected default shadowing practiced 0, got: ${summary.shadowingPracticed}`);

  await checkNoHorizontalOverflow(page, '/learning-path default mobile', results);
  return summary;
}

async function verifyUpdatedLearningPathPersists(page, results) {
  await seedVocabularyViaUi(page);
  await seedShadowingPracticedViaUi(page);

  await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'domcontentloaded' });
  await waitForLearningPathReady(page);
  const updated = await readLearningPathSummary(page);
  assert(!textHasNumber(updated.vocabKnown, 0), `Expected known vocabulary above 0 after marking known, got: ${updated.vocabKnown}`);
  assert(!textHasNumber(updated.vocabReview, 0), `Expected review vocabulary above 0 after marking review, got: ${updated.vocabReview}`);
  assert(!textHasNumber(updated.shadowingPracticed, 0), `Expected shadowing practiced above 0, got: ${updated.shadowingPracticed}`);
  assert(updated.currentLevel.includes('A1'), `Expected level to remain A1 without completed lessons, got: ${updated.currentLevel}`);
  assert(textHasNumber(updated.completedUnits, 0), `Expected unit completion to stay 0 without completed lessons, got: ${updated.completedUnits}`);

  await checkNoHorizontalOverflow(page, '/learning-path progress mobile', results);
  await page.screenshot({ path: path.join(screenshotDir, 'learning-path-progress-mobile.png'), fullPage: false, timeout: 60000 });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForLearningPathReady(page);
  const persisted = await readLearningPathSummary(page);
  assert(!textHasNumber(persisted.vocabKnown, 0), `Expected persisted known vocabulary above 0, got: ${persisted.vocabKnown}`);
  assert(!textHasNumber(persisted.vocabReview, 0), `Expected persisted review vocabulary above 0, got: ${persisted.vocabReview}`);
  assert(!textHasNumber(persisted.shadowingPracticed, 0), `Expected persisted shadowing practiced above 0, got: ${persisted.shadowingPracticed}`);

  await page.screenshot({ path: path.join(screenshotDir, 'learning-path-after-progress-reload.png'), fullPage: false, timeout: 60000 });
  return { updated, persisted };
}

async function verifyDesktopLearningPath(page, results) {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'domcontentloaded' });
  await waitForLearningPathReady(page);
  const desktop = await readLearningPathSummary(page);
  assert(desktop.localHints.includes('Lưu trên thiết bị'), `Expected desktop local device tag, got: ${desktop.localHints}`);
  await checkNoHorizontalOverflow(page, '/learning-path desktop', results);
  await page.screenshot({ path: path.join(screenshotDir, 'learning-path-progress-desktop.png'), fullPage: false, timeout: 60000 });
  return desktop;
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = {
    ok: false,
    baseUrl,
    screenshots: [
      'learning-path-progress-mobile.png',
      'learning-path-progress-desktop.png',
      'learning-path-after-progress-reload.png',
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
    results.defaultSummary = await verifyDefaultLearningPath(page, results);
    const { updated, persisted } = await verifyUpdatedLearningPathPersists(page, results);
    results.updatedSummary = updated;
    results.persistedSummary = persisted;
    results.desktopSummary = await verifyDesktopLearningPath(page, results);

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
