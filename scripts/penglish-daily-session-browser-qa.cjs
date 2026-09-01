const { chromium } = require('playwright');

const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const FOUNDATION_STORAGE_KEY = 'penglish-foundation48-progress-v1';
const LOOP_STORAGE_KEY = 'penglish.learning.loop.v1';
const SESSION_STORAGE_KEY = 'penglish.daily.learning-session.v1';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 844 },
];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildSeed(stage) {
  const now = new Date().toISOString();
  const today = localDateKey();
  const lessonComplete = stage >= 1;
  const reviewComplete = stage >= 2;
  const speakingComplete = stage >= 3;
  return {
    foundation: lessonComplete ? {
      lastDayOpened: 1,
      lastStudiedDate: today,
      streak: 1,
      days: {
        1: { started: true, completed: true, completedAt: now, completedSteps: ['complete'], challengeResults: {}, mistakes: [] },
      },
    } : { days: {} },
    loop: {
      schemaVersion: 1,
      xp: speakingComplete ? 28 : reviewComplete ? 12 : 0,
      streak: stage > 0 ? 1 : 0,
      lastActiveDate: stage > 0 ? today : undefined,
      completed: reviewComplete ? { 'practice:daily-review': now } : {},
      mistakes: {},
      words: {},
      activities: speakingComplete ? [
        { id: 'qa-shadowing-1', source: 'shadowing', sourceId: 'curated-a1-greeting-friend:hello', xp: 8, occurredAt: now },
        { id: 'qa-shadowing-2', source: 'shadowing', sourceId: 'curated-a1-greeting-friend:how-are-you', xp: 8, occurredAt: now },
      ] : [],
      updatedAt: now,
    },
  };
}

async function createSeededPage(browser, viewport, stage) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.name === 'mobile',
    hasTouch: viewport.name === 'mobile',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const diagnostics = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  const seed = buildSeed(stage);
  await page.addInitScript(({ foundationKey, loopKey, sessionKey, foundation, loop }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(foundationKey, JSON.stringify(foundation));
    localStorage.setItem(loopKey, JSON.stringify(loop));
    localStorage.removeItem(sessionKey);
  }, {
    foundationKey: FOUNDATION_STORAGE_KEY,
    loopKey: LOOP_STORAGE_KEY,
    sessionKey: SESSION_STORAGE_KEY,
    foundation: seed.foundation,
    loop: seed.loop,
  });
  return { context, page, diagnostics };
}

async function inspectPage(page) {
  const bodyText = await page.locator('body').innerText();
  return page.evaluate((text) => ({
    horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    brokenImages: Array.from(document.images).filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
    mascotCount: document.querySelectorAll('[data-testid="today-session-page"] img').length,
    hasEmoji: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text),
  }), bodyText);
}

function collectFailures(result) {
  const failures = [];
  if (result.horizontalOverflow > 2) failures.push(`horizontal overflow ${result.horizontalOverflow}px`);
  if (result.brokenImages.length) failures.push(`broken images: ${result.brokenImages.join(', ')}`);
  if (result.mascotCount < 1) failures.push('mascot image is missing');
  if (result.hasEmoji) failures.push('visible emoji detected');
  if (result.consoleErrors.length) failures.push(`console errors: ${result.consoleErrors.join(' | ')}`);
  if (result.pageErrors.length) failures.push(`page errors: ${result.pageErrors.join(' | ')}`);
  return failures;
}

async function checkStage(browser, viewport, stage) {
  const expectedCurrent = stage === 0 ? 'lesson' : stage === 1 ? 'review' : stage === 2 ? 'speaking' : 'complete';
  const { context, page, diagnostics } = await createSeededPage(browser, viewport, stage);
  let result;
  try {
    await page.goto(`${BASE_URL}/today`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    await page.getByTestId('today-session-page').waitFor({ state: 'visible' });
    if (expectedCurrent === 'complete') {
      await page.getByTestId('today-session-complete').waitFor({ state: 'visible' });
    } else {
      await page.locator(`[data-testid="today-step-${expectedCurrent}"][data-step-state="current"]`).waitFor({ state: 'visible' });
      const primaryHref = await page.getByTestId('today-primary-action').getAttribute('href');
      if (!primaryHref) throw new Error('primary action has no href');
      const primaryUrl = new URL(primaryHref, BASE_URL);
      if (primaryUrl.searchParams.get('returnTo') !== '/today') throw new Error(`primary action does not return to /today: ${primaryHref}`);
    }
    const stepCount = await page.locator('[data-testid^="today-step-"][data-step-state]').count();
    const inspection = await inspectPage(page);
    result = { name: `daily-session-stage-${stage}`, stage, expectedCurrent, viewport: viewport.name, stepCount, ...inspection, ...diagnostics };
    const expectedStepCount = expectedCurrent === 'complete' ? 0 : 3;
    result.failures = [...collectFailures(result), ...(stepCount !== expectedStepCount ? [`expected ${expectedStepCount} visible step cards, received ${stepCount}`] : [])];
  } catch (error) {
    result = { name: `daily-session-stage-${stage}`, stage, expectedCurrent, viewport: viewport.name, failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkHomeEntry(browser) {
  const viewport = VIEWPORTS[0];
  const { context, page, diagnostics } = await createSeededPage(browser, viewport, 0);
  let result;
  try {
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    const entry = page.getByTestId('home-primary-today-cta');
    await entry.waitFor({ state: 'visible' });
    await entry.click();
    await page.waitForURL('**/today');
    await page.getByTestId('today-session-page').waitFor({ state: 'visible' });
    result = { name: 'daily-session-home-entry', finalPath: new URL(page.url()).pathname, ...diagnostics, failures: [] };
  } catch (error) {
    result = { name: 'daily-session-home-entry', failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkPracticeCompletion(browser) {
  const viewport = VIEWPORTS[0];
  const { context, page, diagnostics } = await createSeededPage(browser, viewport, 1);
  let result;
  try {
    await page.goto(`${BASE_URL}/practice?returnTo=%2Ftoday`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    await page.getByTestId('practice-poo-start').click();
    for (let index = 0; index < 3; index += 1) {
      await page.getByTestId('practice-poo-correct-answer').click();
      await page.getByTestId('practice-poo-next-repeat').click();
      await page.getByTestId('practice-poo-understood').click();
    }
    await page.getByTestId('practice-poo-complete').waitFor({ state: 'visible' });
    const returnHref = await page.getByTestId('practice-poo-back-home').getAttribute('href');
    const completionStored = await page.evaluate((loopKey) => {
      const state = JSON.parse(localStorage.getItem(loopKey) || '{}');
      return typeof state.completed?.['practice:daily-review'] === 'string';
    }, LOOP_STORAGE_KEY);
    result = { name: 'daily-session-practice-completion', returnHref, completionStored, ...diagnostics, failures: [] };
    if (returnHref !== '/today') result.failures.push(`expected return href /today, received ${returnHref}`);
    if (!completionStored) result.failures.push('practice completion was not persisted');
    result.failures.push(...(diagnostics.consoleErrors.length ? [`console errors: ${diagnostics.consoleErrors.join(' | ')}`] : []));
    result.failures.push(...(diagnostics.pageErrors.length ? [`page errors: ${diagnostics.pageErrors.join(' | ')}`] : []));
  } catch (error) {
    result = { name: 'daily-session-practice-completion', failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkFoundationReturn(browser) {
  const viewport = VIEWPORTS[0];
  const { context, page, diagnostics } = await createSeededPage(browser, viewport, 0);
  let result;
  try {
    await page.goto(`${BASE_URL}/luyen-tieng-anh/48-ngay-lay-goc/ngay/1?returnTo=%2Ftoday`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    const backLink = page.getByTestId('foundation48-back-link');
    await backLink.waitFor({ state: 'visible' });
    const returnHref = await backLink.getAttribute('href');
    result = { name: 'daily-session-foundation-return', returnHref, ...diagnostics, failures: [] };
    if (returnHref !== '/today') result.failures.push(`expected return href /today, received ${returnHref}`);
    if (diagnostics.consoleErrors.length) result.failures.push(`console errors: ${diagnostics.consoleErrors.join(' | ')}`);
    if (diagnostics.pageErrors.length) result.failures.push(`page errors: ${diagnostics.pageErrors.join(' | ')}`);
  } catch (error) {
    result = { name: 'daily-session-foundation-return', failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function checkShadowingReturn(browser) {
  const viewport = VIEWPORTS[0];
  const { context, page, diagnostics } = await createSeededPage(browser, viewport, 2);
  let result;
  try {
    await page.addInitScript(() => {
      localStorage.setItem('penglish.shadowing.progress.v1', JSON.stringify({
        'curated-a1-greeting-friend': {
          currentLineIndex: 1,
          practicedLineIds: ['curated-a1-greeting-friend-s1', 'curated-a1-greeting-friend-s2'],
          difficultLineIds: [],
          updatedAt: new Date().toISOString(),
        },
      }));
    });
    await page.goto(`${BASE_URL}/shadowing/practice/curated-a1-greeting-friend?returnTo=%2Ftoday`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    const ready = page.getByTestId('shadowing-today-session-ready');
    await ready.waitFor({ state: 'visible' });
    const returnHref = await page.getByTestId('shadowing-return-to-today').getAttribute('href');
    result = { name: 'daily-session-shadowing-return', returnHref, ...diagnostics, failures: [] };
    if (returnHref !== '/today') result.failures.push(`expected return href /today, received ${returnHref}`);
    if (diagnostics.consoleErrors.length) result.failures.push(`console errors: ${diagnostics.consoleErrors.join(' | ')}`);
    if (diagnostics.pageErrors.length) result.failures.push(`page errors: ${diagnostics.pageErrors.join(' | ')}`);
  } catch (error) {
    result = { name: 'daily-session-shadowing-return', failures: [error.message], ...diagnostics };
  } finally {
    await context.close();
  }
  return result;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of VIEWPORTS) {
      for (let stage = 0; stage <= 3; stage += 1) {
        results.push(await checkStage(browser, viewport, stage));
      }
    }
    results.push(await checkHomeEntry(browser));
    results.push(await checkPracticeCompletion(browser));
    results.push(await checkFoundationReturn(browser));
    results.push(await checkShadowingReturn(browser));
  } finally {
    await browser.close();
  }
  const failures = results.filter((result) => result.failures?.length);
  console.log(JSON.stringify({ baseUrl: BASE_URL, viewportCount: VIEWPORTS.length, checkCount: results.length, failureCount: failures.length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
