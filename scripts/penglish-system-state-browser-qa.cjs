const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const VIEWPORTS = [
  { name: 'desktop', width: 1365, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];
const PRACTICE_MODES = ['flashcard', 'quiz', 'listen', 'reflex', 'type', 'match', 'speed'];

function loadManifest() {
  const result = spawnSync(process.execPath, [require.resolve('tsx/cli'), 'scripts/penglish-dynamic-learning-manifest.ts'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || `Manifest command exited with ${result.status}.`);
  return JSON.parse(result.stdout);
}

function attachDiagnostics(page) {
  const diagnostics = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  return diagnostics;
}

async function inspectPage(page) {
  const bodyText = await page.locator('body').innerText();
  return page.evaluate(() => ({
    horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute('src') || ''),
  })).then((measurements) => ({
    ...measurements,
    hasEmoji: EMOJI_PATTERN.test(bodyText),
    bodyText,
  }));
}

async function createPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  return { context, page, diagnostics: attachDiagnostics(page) };
}

function commonFailures(result) {
  const failures = [];
  if (result.hasEmoji) failures.push('visible emoji detected');
  if (result.horizontalOverflow > 2) failures.push(`horizontal overflow ${result.horizontalOverflow}px`);
  if (result.brokenImages.length) failures.push(`broken images: ${result.brokenImages.join(', ')}`);
  if (result.consoleErrors.length) failures.push(`console errors: ${result.consoleErrors.join(' | ')}`);
  if (result.pageErrors.length) failures.push(`page errors: ${result.pageErrors.join(' | ')}`);
  return failures;
}

async function checkMascotState(browser, viewport, name, route, stateTestId) {
  const { context, page, diagnostics } = await createPage(browser, viewport);
  let result;
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const state = page.locator(`[data-testid="${stateTestId}"]`);
    await state.waitFor({ state: 'visible' });
    const mascotCount = await state.locator('img').count();
    const inspection = await inspectPage(page);
    if (name === 'missing-study-path') {
      diagnostics.consoleErrors = diagnostics.consoleErrors.filter((message) => !/Failed to load resource: the server responded with a status of 404/i.test(message));
    }
    result = { name, route, viewport: viewport.name, mascotCount, ...inspection, ...diagnostics };
    result.failures = [...commonFailures(result), ...(mascotCount < 1 ? ['mascot image is missing'] : [])];
  } catch (error) {
    result = { name, route, viewport: viewport.name, failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkValidStudyPath(browser, viewport) {
  const { context, page, diagnostics } = await createPage(browser, viewport);
  let result;
  const route = '/paths/path-level-a1';
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('[data-testid="study-path-content"]').waitFor({ state: 'visible' });
    const wordCardCount = await page.locator('[data-testid="study-path-word-card"]').count();
    const inspection = await inspectPage(page);
    result = { name: 'valid-study-path', route, viewport: viewport.name, wordCardCount, ...inspection, ...diagnostics };
    result.failures = [...commonFailures(result), ...(wordCardCount < 1 ? ['valid path has no visible word cards'] : [])];
  } catch (error) {
    result = { name: 'valid-study-path', route, viewport: viewport.name, failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkStudyPathRetry(browser) {
  const viewport = VIEWPORTS[0];
  const { context, page, diagnostics } = await createPage(browser, viewport);
  let result;
  let shouldFail = true;
  const route = '/paths/path-level-a1';
  try {
    await page.route('**/word-sets/path-level-a1/vocabularies', async (intercepted) => {
      if (shouldFail) return intercepted.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'QA outage' }) });
      return intercepted.continue();
    });
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const state = page.locator('[data-testid="study-path-error"]');
    await state.waitFor({ state: 'visible' });
    const mascotCount = await state.locator('img').count();
    shouldFail = false;
    await state.getByRole('button', { name: 'Tải lại lộ trình' }).click();
    await page.locator('[data-testid="study-path-content"]').waitFor({ state: 'visible' });
    const inspection = await inspectPage(page);
    diagnostics.consoleErrors = diagnostics.consoleErrors.filter(
      (message) => !/Failed to load resource: the server responded with a status of 503/i.test(message),
    );
    result = { name: 'study-path-network-retry', route, viewport: viewport.name, mascotCount, retryRecovered: true, ...inspection, ...diagnostics };
    result.failures = [...commonFailures(result), ...(mascotCount < 1 ? ['error state mascot is missing'] : [])];
  } catch (error) {
    result = { name: 'study-path-network-retry', route, viewport: viewport.name, failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkLearningPathUnit(browser, viewport, unit) {
  const { context, page, diagnostics } = await createPage(browser, viewport);
  let result;
  const route = `/learning-path/lesson/${encodeURIComponent(unit.id)}/${encodeURIComponent(`${unit.id}-qa`)}`;
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('[data-testid="interactive-lesson-card"]').waitFor({ state: 'visible' });
    const inspection = await inspectPage(page);
    result = { name: 'learning-path-unit', unitId: unit.id, route, viewport: viewport.name, ...inspection, ...diagnostics };
    result.failures = commonFailures(result);
  } catch (error) {
    result = { name: 'learning-path-unit', unitId: unit.id, route, viewport: viewport.name, failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkPracticeFallbackMascot(browser, viewport) {
  const { context, page, diagnostics } = await createPage(browser, viewport);
  let result;
  const route = '/practice?lessonId=unit-1-greetings-introduction&mode=not-a-mode';
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const fallback = page.locator('[data-testid="practice-fallback-card"]');
    await fallback.waitFor({ state: 'visible' });
    const mascotCount = await fallback.locator('[data-testid="practice-fallback-mascot"] img').count();
    const inspection = await inspectPage(page);
    result = { name: 'practice-unsupported-mode', route, viewport: viewport.name, mascotCount, ...inspection, ...diagnostics };
    result.failures = [...commonFailures(result), ...(mascotCount < 1 ? ['fallback mascot is missing'] : [])];
  } catch (error) {
    result = { name: 'practice-unsupported-mode', route, viewport: viewport.name, failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkAuthCallback(browser, viewport) {
  const { context, page, diagnostics } = await createPage(browser, viewport);
  let result;
  const route = '/auth/callback?next=/profile';
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'commit', timeout: 15000 });
    const loadingSeen = await page.locator('[data-testid="auth-loading-screen"]').waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
    await page.waitForURL('**/profile', { timeout: 6000 });
    await page.locator('[data-testid="penglish-shell-content"]').waitFor({ state: 'visible' });
    const inspection = await inspectPage(page);
    result = { name: 'auth-callback-loading', route, viewport: viewport.name, loadingSeen, finalUrl: page.url().replace(BASE_URL, ''), ...inspection, ...diagnostics };
    result.failures = [...commonFailures(result), ...(!loadingSeen ? ['auth loading mascot screen was never visible'] : [])];
  } catch (error) {
    result = { name: 'auth-callback-loading', route, viewport: viewport.name, failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkRedirect(browser, viewport, route, expectedPath) {
  const { context, page, diagnostics } = await createPage(browser, viewport);
  let result;
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForURL(`**${expectedPath}`, { timeout: 5000 });
    const inspection = await inspectPage(page);
    const finalUrl = page.url().replace(BASE_URL, '');
    result = { name: `redirect-${route}`, route, viewport: viewport.name, finalUrl, ...inspection, ...diagnostics };
    result.failures = [...commonFailures(result), ...(finalUrl !== expectedPath ? [`expected ${expectedPath}, received ${finalUrl}`] : [])];
  } catch (error) {
    result = { name: `redirect-${route}`, route, viewport: viewport.name, failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

(async () => {
  const manifest = loadManifest();
  if (!manifest.learningPathUnits?.length) throw new Error('No learning-path units were found in the runtime manifest.');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const viewport of VIEWPORTS) {
      results.push(await checkValidStudyPath(browser, viewport));
      results.push(await checkMascotState(browser, viewport, 'missing-study-path', '/paths/not-a-real-path', 'study-path-not-found'));
      results.push(await checkMascotState(browser, viewport, 'missing-lesson', '/lessons/not-a-real-lesson', 'lesson-unavailable-state'));
      results.push(await checkMascotState(browser, viewport, 'missing-interactive-lesson', '/learn/not-a-real-lesson', 'interactive-lesson-unavailable-state'));
      results.push(await checkMascotState(browser, viewport, 'missing-learning-path-unit', '/learning-path/lesson/not-a-real-unit/not-a-real-node', 'interactive-lesson-unavailable-state'));
      for (const mode of PRACTICE_MODES) {
        results.push(await checkMascotState(browser, viewport, `missing-practice-${mode}`, `/practice?lessonId=not-a-real-lesson&mode=${mode}`, 'practice-missing-lesson-state'));
      }
      results.push(await checkPracticeFallbackMascot(browser, viewport));
      results.push(await checkMascotState(browser, viewport, 'auth-google-safe-page', '/auth/google', 'auth-google-safe-page'));
      results.push(await checkAuthCallback(browser, viewport));
      results.push(await checkRedirect(browser, viewport, '/store', '/shop'));

      for (const unit of manifest.learningPathUnits) {
        results.push(await checkLearningPathUnit(browser, viewport, unit));
      }
    }

    results.push(await checkStudyPathRetry(browser));
  } finally {
    await browser.close();
  }

  const failures = results.filter((result) => result.failures?.length);
  console.log(JSON.stringify({
    baseUrl: BASE_URL,
    viewportCount: VIEWPORTS.length,
    learningPathUnitCount: manifest.learningPathUnits.length,
    practiceModeCount: PRACTICE_MODES.length,
    checkCount: results.length,
    failureCount: failures.length,
    failures,
  }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
