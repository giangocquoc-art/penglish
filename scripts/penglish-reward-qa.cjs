const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_REWARD_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-dashboard');
const rewardStorageKey = 'penglish.daily.rewards.v1';
const vocabularyStorageKey = 'penglish.vocabulary.progress.v1';
const shadowingStorageKey = 'penglish.shadowing.progress.v1';
const legacyLocalProgressStorageKey = 'p-english:local-progress';
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
    || (failureText.includes('ERR_ABORTED') && url.startsWith(baseUrl) && (url.includes('/assets/') || url.includes('/@fs/')));
}

function requestLooksLikeProgressServerWrite(request) {
  const url = request.url();
  const method = request.method();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return false;
  return /supabase|rest\/v1|storage|progress|audio|upload|api/i.test(url);
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

async function clearRewardStorage(page) {
  await page.evaluate(({ rewardStorageKey, vocabularyStorageKey, shadowingStorageKey, legacyLocalProgressStorageKey, todayMissionsStorageKey }) => {
    window.localStorage.removeItem(rewardStorageKey);
    window.localStorage.removeItem(vocabularyStorageKey);
    window.localStorage.removeItem(shadowingStorageKey);
    window.localStorage.removeItem(legacyLocalProgressStorageKey);
    window.localStorage.removeItem(todayMissionsStorageKey);
  }, { rewardStorageKey, vocabularyStorageKey, shadowingStorageKey, legacyLocalProgressStorageKey, todayMissionsStorageKey });
}

async function readRewardState(page) {
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || 'null'), rewardStorageKey);
}

async function clickFirstVocabularyReview(page) {
  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="vocab-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  const reviewButton = page.locator('[data-testid^="vocab-mark-review-"]').first();
  await reviewButton.waitFor({ state: 'visible', timeout: 20000 });
  const testId = await reviewButton.getAttribute('data-testid');
  await reviewButton.click();
  return testId.replace('vocab-mark-review-', '');
}

async function markShadowingPracticed(page) {
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="shadowing-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="shadowing-practice-card"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="shadowing-mark-practiced-button"]').click();
  await page.waitForFunction((key) => {
    const state = JSON.parse(window.localStorage.getItem(key) || 'null');
    return Array.isArray(state?.completedToday) && state.completedToday.some((item) => item.startsWith('shadowing:'));
  }, rewardStorageKey, { timeout: 10000 });
}

async function openHomeAndCapture(page, filename) {
  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="home-local-learning-summary"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="home-daily-reward-message"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, filename), fullPage: false, timeout: 60000 });
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = {
    ok: false,
    baseUrl,
    screenshots: [
      'rewards-home-mobile.png',
      'rewards-sidebar-desktop.png',
      'rewards-after-activity.png',
    ],
    viewports: ['mobile 390x844', 'desktop 1366x900'],
    vocabularyWordId: null,
    stateAfterVocabulary: null,
    stateAfterRepeatedVocabulary: null,
    stateAfterShadowing: null,
    stateAfterReload: null,
    homeText: null,
    sidebarText: null,
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
    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await clearRewardStorage(page);

    results.vocabularyWordId = await clickFirstVocabularyReview(page);
    await page.waitForFunction((key) => {
      const state = JSON.parse(window.localStorage.getItem(key) || 'null');
      return state?.streakDays === 1 && state?.bubbles === 5 && state?.completedToday?.some((item) => item.startsWith('vocabulary:'));
    }, rewardStorageKey, { timeout: 10000 });
    results.stateAfterVocabulary = await readRewardState(page);
    assert(results.stateAfterVocabulary.streakDays === 1, `Expected streak 1 after vocabulary, got ${JSON.stringify(results.stateAfterVocabulary)}`);
    assert(results.stateAfterVocabulary.bubbles === 5 && results.stateAfterVocabulary.maxBubbles === 5, `Expected 5/5 bubbles, got ${JSON.stringify(results.stateAfterVocabulary)}`);

    await page.locator(`[data-testid="vocab-mark-known-${results.vocabularyWordId}"]`).first().click();
    await page.waitForTimeout(500);
    results.stateAfterRepeatedVocabulary = await readRewardState(page);
    assert(results.stateAfterRepeatedVocabulary.streakDays === 1, `Expected repeated same-day vocabulary to keep streak 1, got ${JSON.stringify(results.stateAfterRepeatedVocabulary)}`);

    await markShadowingPracticed(page);
    results.stateAfterShadowing = await readRewardState(page);
    assert(results.stateAfterShadowing.streakDays === 1, `Expected shadowing same day to keep streak 1, got ${JSON.stringify(results.stateAfterShadowing)}`);
    assert(results.stateAfterShadowing.completedToday.some((item) => item.startsWith('shadowing:')), `Expected shadowing completedToday entry, got ${JSON.stringify(results.stateAfterShadowing)}`);
    assert(results.stateAfterShadowing.completedToday.some((item) => item.startsWith('vocabulary:')), `Expected vocabulary completedToday entry, got ${JSON.stringify(results.stateAfterShadowing)}`);

    results.homeText = await openHomeAndCapture(page, 'rewards-home-mobile.png');
    assert(results.homeText.includes('Hôm nay bạn đã có hoạt động học.'), `Expected home reward message, got: ${results.homeText}`);
    assert(/Chuỗi học\s+1 ngày|1 ngày\s+Chuỗi học/.test(results.homeText), `Expected home streak 1, got: ${results.homeText}`);
    assert(/Bọt biển/.test(results.homeText) && /5\/5/.test(results.homeText), `Expected home bubbles 5/5, got: ${results.homeText}`);
    await checkNoHorizontalOverflow(page, '/home rewards mobile', results);
    await page.screenshot({ path: path.join(screenshotDir, 'rewards-after-activity.png'), fullPage: false, timeout: 60000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="home-local-learning-summary"]').waitFor({ state: 'visible', timeout: 20000 });
    results.stateAfterReload = await readRewardState(page);
    assert(results.stateAfterReload.streakDays === 1, `Expected reward state to persist after reload, got ${JSON.stringify(results.stateAfterReload)}`);

    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="sidebar-bubbles-badge"]').waitFor({ state: 'visible', timeout: 20000 });
    await page.waitForTimeout(500);
    results.sidebarText = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
    assert(results.sidebarText.includes('Bọt biển') && results.sidebarText.includes('5/5'), `Expected desktop sidebar bubbles, got: ${results.sidebarText}`);
    assert(/Chuỗi học|1/.test(results.sidebarText), `Expected desktop sidebar streak content, got: ${results.sidebarText}`);
    await checkNoHorizontalOverflow(page, '/home rewards desktop sidebar', results);
    await page.screenshot({ path: path.join(screenshotDir, 'rewards-sidebar-desktop.png'), fullPage: false, timeout: 60000 });

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
