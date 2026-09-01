const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:5175';
const root = process.cwd();
const screenshotDir = path.join(root, 'reports', 'screenshots');
const reportPath = path.join(root, 'reports', 'batch05-browser-qa-results.json');
fs.mkdirSync(screenshotDir, { recursive: true });

const lessonId = 'reading-a1-my-morning';
const results = {
  baseUrl,
  startedAt: new Date().toISOString(),
  screenshots: [],
  pages: [],
  console: [],
  failedRequests: [],
  localhost8080Requests: [],
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

async function safeClickText(page, text, note) {
  try {
    await page.getByText(text, { exact: false }).first().click({ timeout: 1400 });
    results.notes.push(`clicked: ${note || text}`);
    await page.waitForTimeout(250);
    return true;
  } catch (error) {
    results.notes.push(`click skipped: ${note || text} (${compactError(error)})`);
    return false;
  }
}

async function safeFill(page, selector, text, note) {
  try {
    await page.locator(selector).first().fill(text, { timeout: 1400 });
    results.notes.push(`filled: ${note || selector}`);
    await page.waitForTimeout(200);
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
  await page.waitForLoadState('networkidle', { timeout: 9000 }).catch(() => {
    results.notes.push(`networkidle timeout tolerated: ${route}`);
  });
  await page.waitForTimeout(500);
  if (interact) await interact(page);
  await capture(page, screenshot);
  results.pages.push({
    route,
    url,
    viewport,
    screenshot,
    title: await page.title().catch(() => ''),
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  await context.addInitScript(() => {
    localStorage.removeItem('pshare-enable-backend-sync');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    results.console.push({ type: msg.type(), text: msg.text(), url: page.url() });
  });
  page.on('request', (request) => {
    if (request.url().includes('localhost:8080')) {
      results.localhost8080Requests.push({ method: request.method(), url: request.url(), page: page.url() });
    }
  });
  page.on('requestfailed', (request) => {
    results.failedRequests.push({ method: request.method(), url: request.url(), failure: request.failure()?.errorText, page: page.url() });
  });

  await gotoAndCapture(page, '/home', 'batch05-home-resource-polish.png', { width: 1365, height: 900 });
  await gotoAndCapture(page, '/resources', 'batch05-resource-hub-enriched.png', { width: 1365, height: 900 }, async (p) => {
    await safeFill(p, 'input', 'shadowing A1', 'resource search shadowing A1');
    await safeClickText(p, 'Shadowing', 'resource skill filter');
    await safeClickText(p, 'A1', 'resource CEFR filter');
  });
  await gotoAndCapture(page, '/learning-path', 'batch05-learning-path-cefr-milestones.png', { width: 1365, height: 900 });
  await gotoAndCapture(page, '/vocabularies', 'batch05-vocab-or-dictionary-hints.png', { width: 1365, height: 900 }, async (p) => {
    await safeFill(p, 'input:not([readonly])', 'morning', 'vocab hint search');
  });
  await gotoAndCapture(page, `/practice?lessonId=${lessonId}&mode=quiz`, 'batch05-practice-smoke.png', { width: 1365, height: 900 }, async (p) => {
    await safePress(p, 'A', 'multiple-choice A shortcut');
    await safePress(p, '1', 'multiple-choice 1 shortcut');
    await safeClickText(p, 'Kiểm tra', 'practice check');
    await safePress(p, 'Enter', 'practice enter flow');
  });
  await gotoAndCapture(page, '/home', 'batch05-mobile-home.png', { width: 390, height: 844 });
  await gotoAndCapture(page, '/shadowing', 'batch05-shadowing-route-split.png', { width: 1365, height: 900 }, async (p) => {
    await safePress(p, 'Enter', 'shadowing route enter smoke');
  });
  await gotoAndCapture(page, '/english-speed', 'batch05-english-speed-route-split.png', { width: 1365, height: 900 }, async (p) => {
    await safePress(p, 'Enter', 'english speed enter smoke');
  });
  await gotoAndCapture(page, `/lessons/unit-1-greetings-introduction`, 'batch05-lesson-route-split.png', { width: 1365, height: 900 });
  await gotoAndCapture(page, `/practice?lessonId=${lessonId}&mode=typing`, 'batch05-practice-typing-enter.png', { width: 1365, height: 900 }, async (p) => {
    await safeFill(p, 'input:not([readonly]), textarea', 'morning', 'typing answer');
    await safePress(p, 'Enter', 'typing enter submit');
  });
  await gotoAndCapture(page, `/practice?lessonId=${lessonId}&mode=does-not-exist`, 'batch05-practice-mode-fallback.png', { width: 1365, height: 900 });
  await gotoAndCapture(page, '/home', 'batch05-console-cleanup.png', { width: 1365, height: 900 });

  results.completedAt = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  await browser.close();
  console.log(JSON.stringify({
    reportPath,
    screenshots: results.screenshots.length,
    console: results.console.length,
    failedRequests: results.failedRequests.length,
    localhost8080Requests: results.localhost8080Requests.length,
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
