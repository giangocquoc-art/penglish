const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_LESSON_PROGRESS_QA_BASE_URL || 'http://127.0.0.1:5180';
const lessonId = 'unit-1-greetings-introduction';
const screenshotDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-dashboard');
const lessonProgressStorageKey = 'penglish.lesson.progress.v1';
const legacyLocalProgressStorageKey = 'p-english:local-progress';
const legacyLessonProgressPrefix = 'p-english:lesson-progress:';
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
  return /supabase|rest\/v1|storage|lesson|progress|audio|upload|api/i.test(url);
}

function textHasNumberAtLeast(text, minimum) {
  return text.match(/\d+/g)?.some((value) => Number(value) >= minimum) ?? false;
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

async function clearLessonProgressStorage(page) {
  await page.evaluate(({ lessonProgressStorageKey, legacyLocalProgressStorageKey, legacyLessonProgressPrefix, todayMissionsStorageKey }) => {
    window.localStorage.removeItem(lessonProgressStorageKey);
    window.localStorage.removeItem(legacyLocalProgressStorageKey);
    window.localStorage.removeItem(todayMissionsStorageKey);
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(legacyLessonProgressPrefix))
      .forEach((key) => window.localStorage.removeItem(key));
  }, { lessonProgressStorageKey, legacyLocalProgressStorageKey, legacyLessonProgressPrefix, todayMissionsStorageKey });
}

async function waitForLessonReady(page) {
  await page.locator('[data-testid="lesson-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="lesson-step-nav"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
}

async function readLessonRecord(page) {
  return page.evaluate(({ key, lessonId }) => {
    const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
    return stored[lessonId] || null;
  }, { key: lessonProgressStorageKey, lessonId });
}

async function completeLessonViaUi(page) {
  const nav = page.locator('[data-testid="lesson-step-nav"]');
  const isNavOpen = await nav.evaluate((element) => element.open === true);
  if (!isNavOpen) await nav.locator('summary').click();
  await nav.getByRole('button', { name: /Review/ }).click();
  await page.locator('[data-testid="lesson-complete-button"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('[data-testid="lesson-complete-button"]').click();
}

async function readHomeSummary(page) {
  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="home-local-learning-summary"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}

async function readLearningPathSummary(page) {
  await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="roadmap-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="learning-path-completed-units"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
  return (await page.locator('[data-testid="learning-path-completed-units"]').innerText()).replace(/\s+/g, ' ').trim();
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = {
    ok: false,
    baseUrl,
    lessonId,
    screenshots: [
      'lesson-started-mobile.png',
      'lesson-completed-mobile.png',
      'lesson-progress-home-update.png',
      'lesson-progress-learning-path-update.png',
    ],
    viewports: ['mobile 390x844'],
    startedRecord: null,
    completedRecord: null,
    homeSummary: null,
    learningPathSummary: null,
    persistedRecord: null,
    consoleErrors: [],
    failedRequests: [],
    unexpectedProgressWrites: [],
    errors: [],
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
    await page.goto(`${baseUrl}/lessons/${lessonId}`, { waitUntil: 'domcontentloaded' });
    await clearLessonProgressStorage(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForLessonReady(page);

    results.startedRecord = await readLessonRecord(page);
    assert(results.startedRecord, 'Expected started record after opening lesson');
    assert(results.startedRecord.status === 'started', `Expected started status, got: ${JSON.stringify(results.startedRecord)}`);
    assert(results.startedRecord.unitId, `Expected unitId in started record, got: ${JSON.stringify(results.startedRecord)}`);
    assert(!results.startedRecord.completedAt, `Opening lesson should not complete it, got: ${JSON.stringify(results.startedRecord)}`);
    await checkNoHorizontalOverflow(page, '/lessons started mobile', results);
    await page.screenshot({ path: path.join(screenshotDir, 'lesson-started-mobile.png'), fullPage: false, timeout: 60000 });

    await completeLessonViaUi(page);
    await page.waitForFunction(
      ({ key, lessonId }) => {
        const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
        return stored[lessonId]?.status === 'completed' && Boolean(stored[lessonId]?.completedAt);
      },
      { key: lessonProgressStorageKey, lessonId },
      { timeout: 10000 },
    );
    results.completedRecord = await readLessonRecord(page);
    assert(results.completedRecord.completedSteps.includes('review'), `Expected review step to be completed, got: ${JSON.stringify(results.completedRecord)}`);
    await checkNoHorizontalOverflow(page, '/lessons completed mobile', results);
    await page.screenshot({ path: path.join(screenshotDir, 'lesson-completed-mobile.png'), fullPage: false, timeout: 60000 });

    results.homeSummary = await readHomeSummary(page);
    assert(/([1-9]\d*)\/\d+\s+Unit xong|Unit xong\s+([1-9]\d*)\/\d+/.test(results.homeSummary), `Expected home unit count to include at least one completed unit, got: ${results.homeSummary}`);
    await checkNoHorizontalOverflow(page, '/home lesson progress mobile', results);
    await page.screenshot({ path: path.join(screenshotDir, 'lesson-progress-home-update.png'), fullPage: false, timeout: 60000 });

    results.learningPathSummary = await readLearningPathSummary(page);
    assert(textHasNumberAtLeast(results.learningPathSummary, 1), `Expected learning path completed units to include at least 1, got: ${results.learningPathSummary}`);
    await checkNoHorizontalOverflow(page, '/learning-path lesson progress mobile', results);
    await page.screenshot({ path: path.join(screenshotDir, 'lesson-progress-learning-path-update.png'), fullPage: false, timeout: 60000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.goto(`${baseUrl}/lessons/${lessonId}`, { waitUntil: 'domcontentloaded' });
    await waitForLessonReady(page);
    results.persistedRecord = await readLessonRecord(page);
    assert(results.persistedRecord?.status === 'completed', `Expected completed record to persist, got: ${JSON.stringify(results.persistedRecord)}`);

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
