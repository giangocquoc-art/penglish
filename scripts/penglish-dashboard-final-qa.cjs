const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_DASHBOARD_FINAL_QA_BASE_URL || 'http://127.0.0.1:5180';
const lessonId = 'unit-1-greetings-introduction';
const screenshotDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-dashboard', 'final-qa');

const keys = {
  rewards: 'penglish.daily.rewards.v1',
  vocabulary: 'penglish.vocabulary.progress.v1',
  shadowing: 'penglish.shadowing.progress.v1',
  lessonProgress: 'penglish.lesson.progress.v1',
  legacyLocalProgress: 'p-english:local-progress',
  todayMissions: 'p-english:today-missions',
  speechProgress: 'p-english:speech-progress',
  legacyLessonProgressPrefix: 'p-english:lesson-progress:',
};

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

function requestLooksLikeUploadOrProgressWrite(request) {
  const method = request.method();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return false;
  const url = request.url();
  return /supabase|rest\/v1|storage|upload|audio|api|progress/i.test(url);
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

async function clearAllLocalProgress(page) {
  await page.evaluate((storageKeys) => {
    window.localStorage.removeItem(storageKeys.rewards);
    window.localStorage.removeItem(storageKeys.vocabulary);
    window.localStorage.removeItem(storageKeys.shadowing);
    window.localStorage.removeItem(storageKeys.lessonProgress);
    window.localStorage.removeItem(storageKeys.legacyLocalProgress);
    window.localStorage.removeItem(storageKeys.todayMissions);
    window.localStorage.removeItem(storageKeys.speechProgress);
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(storageKeys.legacyLessonProgressPrefix))
      .forEach((key) => window.localStorage.removeItem(key));
  }, keys);
}

async function readLocalStorageJson(page, key) {
  return page.evaluate((storageKey) => JSON.parse(window.localStorage.getItem(storageKey) || 'null'), key);
}

async function bodyText(page) {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}

async function waitForHomeReady(page) {
  await page.locator('[data-testid="home-local-learning-summary"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="home-recommended-action"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
}

async function readHomeSummary(page) {
  const read = async (testId) => (await page.locator(`[data-testid="${testId}"]`).innerText()).replace(/\s+/g, ' ').trim();
  return {
    body: await bodyText(page),
    recommendedAction: await read('home-recommended-action'),
    summaryCta: await read('home-summary-cta'),
    message: await read('home-dashboard-recommended-message'),
    localSummary: await read('home-local-learning-summary'),
    rewardMessage: await read('home-daily-reward-message'),
    vocabDue: await read('home-vocab-due-count'),
    vocabDifficult: await read('home-vocab-difficult-count'),
    shadowingPracticed: await read('home-shadowing-practiced-count'),
    shadowingDifficult: await read('home-shadowing-difficult-count'),
    speedPracticed: await read('home-speed-practiced-count'),
    bubbles: await read('home-bubbles-count'),
  };
}

async function seedVocabularyReview(page) {
  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="vocab-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid^="vocab-mark-review-"]').first().waitFor({ state: 'visible', timeout: 20000 });
  const button = page.locator('[data-testid^="vocab-mark-review-"]').first();
  const testId = await button.getAttribute('data-testid');
  const wordId = testId.replace('vocab-mark-review-', '');
  await button.click();
  await page.waitForFunction(({ key, id }) => {
    const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
    return stored[id]?.status === 'review';
  }, { key: keys.vocabulary, id: wordId }, { timeout: 10000 });
  return wordId;
}

async function repeatVocabularyReview(page, wordId) {
  await page.locator(`[data-testid="vocab-mark-review-${wordId}"]`).first().click();
  await page.waitForTimeout(500);
}

async function seedShadowingProgress(page) {
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="shadowing-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="shadowing-current-sentence"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="shadowing-mark-practiced-button"]').click();
  await page.locator('[data-testid="shadowing-toggle-difficult-button"]').click();
  await page.waitForFunction((key) => Object.values(JSON.parse(window.localStorage.getItem(key) || '{}')).some((entry) => Array.isArray(entry.practicedLineIds) && entry.practicedLineIds.length > 0 && Array.isArray(entry.difficultLineIds) && entry.difficultLineIds.length > 0), keys.shadowing, { timeout: 10000 });
  return {
    practicedCount: await page.locator('[data-testid="shadowing-practiced-count"]').innerText(),
    difficultCount: await page.locator('[data-testid="shadowing-difficult-count"]').innerText(),
  };
}

async function completeLesson(page) {
  await page.goto(`${baseUrl}/lessons/${lessonId}`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="lesson-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="lesson-step-nav"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);

  const started = await page.evaluate(({ key, lessonId }) => {
    const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
    return stored[lessonId] || null;
  }, { key: keys.lessonProgress, lessonId });
  assert(started?.status === 'started', `Expected lesson started record after opening lesson, got ${JSON.stringify(started)}`);

  const nav = page.locator('[data-testid="lesson-step-nav"]');
  const isOpen = await nav.evaluate((element) => element.open === true);
  if (!isOpen) await nav.locator('summary').click();
  await nav.getByRole('button', { name: /Review/ }).click();
  await page.locator('[data-testid="lesson-complete-button"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('[data-testid="lesson-complete-button"]').click();
  await page.waitForFunction(({ key, lessonId }) => {
    const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
    return stored[lessonId]?.status === 'completed' && Boolean(stored[lessonId]?.completedAt);
  }, { key: keys.lessonProgress, lessonId }, { timeout: 10000 });

  const completed = await page.evaluate(({ key, lessonId }) => {
    const stored = JSON.parse(window.localStorage.getItem(key) || '{}');
    return stored[lessonId] || null;
  }, { key: keys.lessonProgress, lessonId });
  assert(completed?.status === 'completed', `Expected completed lesson record, got ${JSON.stringify(completed)}`);
  return { started, completed };
}

async function verifyEnglishSpeedRoute(page) {
  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="speed-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="speed-current-prompt"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="speed-record-button"]').waitFor({ state: 'visible', timeout: 20000 });
  return await bodyText(page);
}

async function verifyLearningPath(page) {
  await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="roadmap-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="learning-path-local-progress-hints"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
  const text = await bodyText(page);
  assert(text.includes('Lưu trên thiết bị') || text.includes('local'), `Expected local hints in learning path, got ${text}`);
  return text;
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = {
    ok: false,
    baseUrl,
    routesTested: ['/home', '/learning-path', `/lessons/${lessonId}`, '/english-speed', '/shadowing', '/words'],
    viewports: ['desktop 1366x768', 'mobile 390x844'],
    screenshots: [
      'dashboard-final-home-mobile.png',
      'dashboard-final-home-desktop.png',
      'dashboard-final-learning-path-mobile.png',
      'dashboard-final-lesson-complete.png',
      'dashboard-final-rewards-sidebar.png',
      'dashboard-final-console-check.png',
    ],
    defaultHome: null,
    updatedHome: null,
    desktopHome: null,
    learningPathText: null,
    lesson: null,
    rewardsAfterVocabulary: null,
    rewardsAfterRepeat: null,
    rewardsAfterShadowing: null,
    rewardsAfterLesson: null,
    persistedRewards: null,
    vocabularyWordId: null,
    shadowing: null,
    englishSpeedText: null,
    consoleErrors: [],
    failedRequests: [],
    unexpectedWrites: [],
    errors: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: [] });
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
    if (requestLooksLikeUploadOrProgressWrite(request)) results.unexpectedWrites.push(`${request.method()} ${request.url()}`);
  });

  try {
    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await clearAllLocalProgress(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForHomeReady(page);
    results.defaultHome = await readHomeSummary(page);
    assert(results.defaultHome.localSummary.includes('Lưu trên thiết bị'), 'Expected local progress summary on home');
    assert(textHasNumber(results.defaultHome.vocabDue, 0), `Expected no fake vocabulary due count initially, got ${results.defaultHome.vocabDue}`);
    assert(textHasNumber(results.defaultHome.shadowingPracticed, 0), `Expected no fake shadowing practiced count initially, got ${results.defaultHome.shadowingPracticed}`);
    assert(textHasNumber(results.defaultHome.shadowingDifficult, 0), `Expected no fake shadowing difficult count initially, got ${results.defaultHome.shadowingDifficult}`);
    await checkNoHorizontalOverflow(page, '/home mobile default', results);

    results.vocabularyWordId = await seedVocabularyReview(page);
    results.rewardsAfterVocabulary = await readLocalStorageJson(page, keys.rewards);
    assert(results.rewardsAfterVocabulary?.streakDays === 1, `Expected first learning action streak 1, got ${JSON.stringify(results.rewardsAfterVocabulary)}`);
    assert(results.rewardsAfterVocabulary?.bubbles === 5 && results.rewardsAfterVocabulary?.maxBubbles === 5, `Expected bubbles 5/5, got ${JSON.stringify(results.rewardsAfterVocabulary)}`);

    await repeatVocabularyReview(page, results.vocabularyWordId);
    results.rewardsAfterRepeat = await readLocalStorageJson(page, keys.rewards);
    assert(results.rewardsAfterRepeat?.streakDays === 1, `Expected same-day repeat not to increment streak, got ${JSON.stringify(results.rewardsAfterRepeat)}`);

    results.shadowing = await seedShadowingProgress(page);
    results.rewardsAfterShadowing = await readLocalStorageJson(page, keys.rewards);
    assert(results.rewardsAfterShadowing?.completedToday?.some((item) => item.startsWith('shadowing:')), `Expected shadowing reward entry, got ${JSON.stringify(results.rewardsAfterShadowing)}`);

    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await waitForHomeReady(page);
    results.updatedHome = await readHomeSummary(page);
    assert(results.updatedHome.rewardMessage.includes('Hôm nay bạn đã có hoạt động học.'), `Expected daily activity message, got ${results.updatedHome.rewardMessage}`);
    assert(!textHasNumber(results.updatedHome.vocabDue, 0), `Expected vocabulary due count to update, got ${results.updatedHome.vocabDue}`);
    assert(!textHasNumber(results.updatedHome.shadowingPracticed, 0), `Expected shadowing practiced count to update, got ${results.updatedHome.shadowingPracticed}`);
    assert(!textHasNumber(results.updatedHome.shadowingDifficult, 0), `Expected shadowing difficult count to update, got ${results.updatedHome.shadowingDifficult}`);
    await checkNoHorizontalOverflow(page, '/home mobile updated', results);
    await page.screenshot({ path: path.join(screenshotDir, 'dashboard-final-home-mobile.png'), fullPage: false, timeout: 60000 });

    results.lesson = await completeLesson(page);
    results.rewardsAfterLesson = await readLocalStorageJson(page, keys.rewards);
    await checkNoHorizontalOverflow(page, '/lesson complete mobile', results);
    await page.screenshot({ path: path.join(screenshotDir, 'dashboard-final-lesson-complete.png'), fullPage: false, timeout: 60000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    results.persistedRewards = await readLocalStorageJson(page, keys.rewards);
    assert(results.persistedRewards?.streakDays === 1, `Expected rewards to persist after reload, got ${JSON.stringify(results.persistedRewards)}`);

    results.learningPathText = await verifyLearningPath(page);
    assert(/0\/12|1\/12|2\/12|unit/i.test(results.learningPathText), 'Expected learning path to show real unit count text');
    await checkNoHorizontalOverflow(page, '/learning-path mobile', results);
    await page.screenshot({ path: path.join(screenshotDir, 'dashboard-final-learning-path-mobile.png'), fullPage: false, timeout: 60000 });

    results.englishSpeedText = await verifyEnglishSpeedRoute(page);
    assert(results.englishSpeedText.includes('Ghi âm') || results.englishSpeedText.includes('Bắt đầu'), 'Expected English Speed recording UI');
    await checkNoHorizontalOverflow(page, '/english-speed mobile', results);

    await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="vocab-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
    await checkNoHorizontalOverflow(page, '/words mobile', results);

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await waitForHomeReady(page);
    results.desktopHome = await readHomeSummary(page);
    assert(results.desktopHome.localSummary.includes('Ôn hôm nay'), 'Expected desktop home local summary');
    await page.locator('[data-testid="sidebar-bubbles-badge"]').waitFor({ state: 'visible', timeout: 20000 });
    await checkNoHorizontalOverflow(page, '/home desktop', results);
    await page.screenshot({ path: path.join(screenshotDir, 'dashboard-final-home-desktop.png'), fullPage: false, timeout: 60000 });
    await page.screenshot({ path: path.join(screenshotDir, 'dashboard-final-rewards-sidebar.png'), fullPage: false, timeout: 60000 });

    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await waitForHomeReady(page);
    await page.screenshot({ path: path.join(screenshotDir, 'dashboard-final-console-check.png'), fullPage: false, timeout: 60000 });

    if (results.consoleErrors.length) results.errors.push(`Console errors found: ${results.consoleErrors.join('\n')}`);
    if (results.failedRequests.length) results.errors.push(`Failed requests found: ${results.failedRequests.join('\n')}`);
    if (results.unexpectedWrites.length) results.errors.push(`Unexpected audio/progress upload requests found: ${results.unexpectedWrites.join('\n')}`);

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
