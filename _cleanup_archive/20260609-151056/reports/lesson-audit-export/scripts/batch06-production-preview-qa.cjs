const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:4175';
const root = process.cwd();
const screenshotDir = path.join(root, 'reports', 'screenshots');
const reportPath = path.join(root, 'reports', 'batch06-production-preview-qa-results.json');
const lessonId = 'reading-a1-my-morning';

fs.mkdirSync(screenshotDir, { recursive: true });

const results = {
  baseUrl,
  startedAt: new Date().toISOString(),
  screenshots: [],
  pages: [],
  selectorChecks: [],
  console: [],
  pageErrors: [],
  responses: [],
  failedRequests: [],
  localhost8080Requests: [],
  serviceWorkerBeforeCleanup: {},
  serviceWorker: {},
  notes: [],
};

function screenshotPath(name) {
  return path.join(screenshotDir, name);
}

function compactError(error) {
  return String(error && error.message ? error.message : error).split('\n')[0];
}

async function capture(page, name, fullPage = true) {
  const file = screenshotPath(name);
  await page.screenshot({ path: file, fullPage });
  results.screenshots.push(path.relative(root, file).replace(/\\/g, '/'));
}

async function checkVisible(page, selector, note) {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout: 2500 });
    results.selectorChecks.push({ selector, note, ok: true, page: page.url() });
    return true;
  } catch (error) {
    results.selectorChecks.push({ selector, note, ok: false, page: page.url(), error: compactError(error) });
    return false;
  }
}

async function safeClick(page, selector, note) {
  try {
    await page.locator(selector).first().click({ timeout: 1800 });
    results.notes.push(`clicked: ${note || selector}`);
    await page.waitForTimeout(220);
    return true;
  } catch (error) {
    results.notes.push(`click skipped: ${note || selector} (${compactError(error)})`);
    return false;
  }
}

async function safeFill(page, selector, text, note) {
  try {
    await page.locator(selector).first().fill(text, { timeout: 1800 });
    results.notes.push(`filled: ${note || selector}`);
    await page.waitForTimeout(220);
    return true;
  } catch (error) {
    results.notes.push(`fill skipped: ${note || selector} (${compactError(error)})`);
    return false;
  }
}

async function safePress(page, key, note) {
  try {
    await page.keyboard.press(key);
    results.notes.push(`pressed: ${note || key}`);
    await page.waitForTimeout(220);
    return true;
  } catch (error) {
    results.notes.push(`press skipped: ${note || key} (${compactError(error)})`);
    return false;
  }
}

async function gotoAndCapture(page, route, screenshot, viewport, interact) {
  const url = `${baseUrl}${route}`;
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => {
    results.notes.push(`networkidle timeout tolerated: ${route}`);
  });
  await page.waitForTimeout(650);
  if (interact) await interact(page);
  await capture(page, screenshot);
  results.pages.push({
    route,
    url,
    viewport,
    screenshot,
    title: await page.title().catch(() => ''),
    bodyTextStart: await page.locator('body').innerText({ timeout: 2500 }).then((text) => text.slice(0, 260)).catch(() => ''),
  });
}

async function cleanupServiceWorkersAndCaches(page) {
  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch((error) => {
    results.notes.push(`preflight navigation failed: ${compactError(error)}`);
  });

  results.serviceWorkerBeforeCleanup = await page.evaluate(async () => {
    const out = { supported: 'serviceWorker' in navigator, registrations: [], cacheKeys: [] };

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      out.registrations = registrations.map((registration) => registration.scope);
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ('caches' in window) {
      out.cacheKeys = await caches.keys();
      await Promise.all(out.cacheKeys.map((key) => caches.delete(key)));
    }

    return out;
  }).catch((error) => ({ error: compactError(error) }));

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch((error) => {
    results.notes.push(`preflight reload failed: ${compactError(error)}`);
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    localStorage.removeItem('pshare-enable-backend-sync');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.__disableCfBeacon = true;
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    results.console.push({ type: msg.type(), text: msg.text(), url: page.url() });
  });
  page.on('pageerror', (error) => {
    results.pageErrors.push({ message: compactError(error), stack: String(error.stack || '').split('\n').slice(0, 4).join('\n'), url: page.url() });
  });
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 || /\/assets\/.*\.(js|css)$/.test(url)) {
      results.responses.push({ status, url, page: page.url() });
    }
  });
  page.on('request', (request) => {
    if (request.url().includes('localhost:8080')) {
      results.localhost8080Requests.push({ method: request.method(), url: request.url(), page: page.url() });
    }
  });
  page.on('requestfailed', (request) => {
    results.failedRequests.push({ method: request.method(), url: request.url(), failure: request.failure()?.errorText, page: page.url() });
  });

  await cleanupServiceWorkersAndCaches(page);

  await gotoAndCapture(page, '/home', 'batch06-preview-home.png', { width: 1365, height: 900 });
  await gotoAndCapture(page, '/learning-path', 'batch06-preview-learning-path.png', { width: 1365, height: 900 });
  await gotoAndCapture(page, '/resources', 'batch06-preview-resources.png', { width: 1365, height: 900 }, async (p) => {
    await checkVisible(p, '[data-testid="resource-search-input"]', 'Resource Hub search input');
    await safeFill(p, '[data-testid="resource-search-input"]', 'shadowing A1', 'Resource Hub search');
    await safeClick(p, '[data-testid="resource-skill-filter-shadowing"]', 'Resource Hub Shadowing filter');
    await safeClick(p, '[data-testid="resource-cefr-filter-a1"]', 'Resource Hub A1 filter');
  });
  await gotoAndCapture(page, '/vocabularies', 'batch06-preview-vocab.png', { width: 1365, height: 900 }, async (p) => {
    await checkVisible(p, '[data-testid="vocab-search-input"]', 'Vocab search input');
    await safeFill(p, '[data-testid="vocab-search-input"]', 'morning', 'Vocab search');
    await safeClick(p, '[data-testid="vocab-status-filter-all"]', 'Vocab all status filter');
    await checkVisible(p, '[data-testid="vocab-lesson-filter"]', 'Vocab lesson filter');
  });
  await gotoAndCapture(page, '/shadowing', 'batch06-preview-shadowing.png', { width: 1365, height: 900 }, async (p) => {
    await checkVisible(p, '[data-testid="shadowing-transcript-panel"]', 'Shadowing transcript panel');
    await safeFill(p, '[data-testid="shadowing-custom-title-input"]', 'QA transcript only', 'Shadowing custom title');
    await safeFill(p, '[data-testid="shadowing-custom-transcript-textarea"]', 'Hello, my name is Anna.\nI learn English every day.', 'Shadowing custom transcript');
    await safeClick(p, '[data-testid="shadowing-create-custom-button"]', 'Shadowing create transcript-only fallback');
  });
  await gotoAndCapture(page, '/english-speed', 'batch06-preview-english-speed.png', { width: 1365, height: 900 }, async (p) => {
    await checkVisible(p, '[data-testid="english-speed-manual-textarea"]', 'English Speed manual textarea');
    await safeFill(p, '[data-testid="english-speed-manual-textarea"]', 'Hello, my name is Anna.', 'English Speed manual answer');
    await safeClick(p, '[data-testid="english-speed-manual-check"]', 'English Speed manual check');
  });
  await gotoAndCapture(page, '/lessons/unit-1-greetings-introduction', 'batch06-preview-lesson.png', { width: 1365, height: 900 });
  await gotoAndCapture(page, `/practice?lessonId=${lessonId}&mode=quiz`, 'batch06-preview-practice-quiz.png', { width: 1365, height: 900 }, async (p) => {
    await checkVisible(p, '[data-testid="practice-quiz-option-1"]', 'Practice quiz option 1');
    await safePress(p, 'A', 'Practice quiz A shortcut');
    await safePress(p, '1', 'Practice quiz 1 shortcut');
    await safeClick(p, '[data-testid="practice-quiz-check"]', 'Practice quiz check button');
    await safePress(p, 'Enter', 'Practice quiz Enter flow');
  });
  await gotoAndCapture(page, `/practice?lessonId=${lessonId}&mode=typing`, 'batch06-preview-practice-typing.png', { width: 1365, height: 900 }, async (p) => {
    const started = await safeClick(p, '[data-testid="practice-typing-start"]', 'Practice typing start');
    if (started) await page.waitForTimeout(300);
    await checkVisible(p, '[data-testid="practice-typing-input"]', 'Practice typing input');
    await safeFill(p, '[data-testid="practice-typing-input"]', 'morning', 'Practice typing answer');
    await safePress(p, 'Enter', 'Practice typing Enter submit');
  });
  await gotoAndCapture(page, `/practice?lessonId=${lessonId}&mode=does-not-exist`, 'batch06-preview-practice-fallback.png', { width: 1365, height: 900 }, async (p) => {
    await checkVisible(p, '[data-testid="practice-fallback-card"]', 'Practice fallback card');
  });
  await gotoAndCapture(page, '/home', 'batch06-preview-mobile-home.png', { width: 390, height: 844 });
  await gotoAndCapture(page, '/home', 'batch06-preview-console-network.png', { width: 1365, height: 900 });

  results.serviceWorker = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false };
    const registrations = await navigator.serviceWorker.getRegistrations();
    const cacheKeys = 'caches' in window ? await caches.keys() : [];
    return { supported: true, registrations: registrations.map((registration) => registration.scope), cacheKeys };
  }).catch((error) => ({ error: compactError(error) }));

  results.completedAt = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  await browser.close();
  console.log(JSON.stringify({
    reportPath,
    screenshots: results.screenshots.length,
    pages: results.pages.length,
    selectorChecks: results.selectorChecks,
    console: results.console.length,
    pageErrors: results.pageErrors,
    responses: results.responses,
    failedRequests: results.failedRequests.length,
    localhost8080Requests: results.localhost8080Requests.length,
    serviceWorkerBeforeCleanup: results.serviceWorkerBeforeCleanup,
    serviceWorker: results.serviceWorker,
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
