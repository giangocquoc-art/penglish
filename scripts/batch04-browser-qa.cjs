const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://127.0.0.1:5175';
const root = process.cwd();
const screenshotDir = path.join(root, 'reports', 'screenshots');
const reportPath = path.join(root, 'reports', 'batch04-browser-qa-results.json');
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

async function safeClick(page, selectorOrText, note) {
  try {
    const locator = selectorOrText.startsWith('//') || selectorOrText.startsWith('css=')
      ? page.locator(selectorOrText)
      : page.getByText(selectorOrText, { exact: false });
    await locator.first().click({ timeout: 1200 });
    results.notes.push(`clicked: ${note || selectorOrText}`);
    await page.waitForTimeout(450);
    return true;
  } catch (error) {
    results.notes.push(`click skipped: ${note || selectorOrText} (${error.message.split('\n')[0]})`);
    return false;
  }
}

async function safePress(page, key, note) {
  try {
    await page.keyboard.press(key);
    results.notes.push(`pressed: ${note || key}`);
    await page.waitForTimeout(350);
    return true;
  } catch (error) {
    results.notes.push(`press skipped: ${note || key} (${error.message.split('\n')[0]})`);
    return false;
  }
}

async function safeFillFirstInput(page, text) {
  try {
    const input = page.locator('input:not([readonly]), textarea').first();
    await input.fill(text, { timeout: 1200 });
    results.notes.push(`filled first editable input: ${text}`);
    await page.waitForTimeout(250);
    return true;
  } catch (error) {
    results.notes.push(`fill skipped (${error.message.split('\n')[0]})`);
    return false;
  }
}

async function capture(page, name, fullPage = true) {
  const file = screenshotPath(name);
  await page.screenshot({ path: file, fullPage });
  results.screenshots.push(path.relative(root, file).replace(/\\/g, '/'));
}

async function gotoAndCapture(page, url, name, viewport, interact) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(900);
  if (interact) await interact(page);
  await capture(page, name);
  results.pages.push({ url, viewport, screenshot: name, title: await page.title().catch(() => '') });
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

  await gotoAndCapture(page, `${baseUrl}/home`, 'batch04-home-desktop-layout-fixed.png', { width: 1365, height: 900 });
  await gotoAndCapture(page, `${baseUrl}/home`, 'batch04-home-mobile-layout-fixed.png', { width: 390, height: 844 });
  await gotoAndCapture(page, `${baseUrl}/home`, 'batch04-recent-practice-memory-existing.png', { width: 1365, height: 900 });

  const modes = [
    ['quiz', 'batch04-practice-quiz-result-feedback.png', async (p) => { await safePress(p, 'A', 'quiz A shortcut'); await safeClick(p, 'Kiểm tra', 'quiz check'); await safePress(p, 'Enter', 'quiz enter'); }],
    ['listen', 'batch04-practice-listen-feedback-or-progress.png', async (p) => { await safePress(p, 'A', 'listen A shortcut'); await safeClick(p, 'Kiểm tra', 'listen check'); await safePress(p, 'Enter', 'listen enter'); }],
    ['typing', 'batch04-practice-typing-feedback-or-progress.png', async (p) => { await safeFillFirstInput(p, 'morning'); await safePress(p, 'Enter', 'typing enter submit'); }],
    ['flashcard', 'batch04-practice-flashcard-progress.png', async (p) => { await safeClick(p, 'Lật', 'flashcard flip'); await safePress(p, 'Enter', 'flashcard enter'); }],
    ['match', 'batch04-practice-match-progress.png', async (p) => { await safeClick(p, 'Kiểm tra', 'match check'); }],
    ['speed', 'batch04-practice-speed-progress.png', async (p) => { await safePress(p, 'Enter', 'speed enter'); }],
    ['reflex', 'batch04-practice-reflex-progress.png', async (p) => { await safeFillFirstInput(p, 'morning'); await safePress(p, 'Enter', 'reflex enter'); }],
    ['does-not-exist', 'batch04-practice-fallback.png', async (p) => { await safePress(p, 'Enter', 'fallback enter'); }],
  ];

  for (const [mode, screenshot, interact] of modes) {
    await gotoAndCapture(page, `${baseUrl}/practice?lessonId=${lessonId}&mode=${mode}`, screenshot, { width: 1365, height: 900 }, interact);
  }

  await gotoAndCapture(page, `${baseUrl}/shadowing`, 'batch04-shadowing-media-fallback-or-working.png', { width: 1365, height: 900 }, async (p) => {
    await safeClick(p, 'Tập câu này', 'shadowing transcript action');
    await safePress(p, 'Enter', 'shadowing enter');
  });

  await gotoAndCapture(page, `${baseUrl}/home`, 'batch04-console-network-cleanup.png', { width: 1365, height: 900 });

  results.completedAt = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  await browser.close();
  console.log(JSON.stringify({ reportPath, screenshots: results.screenshots.length, console: results.console.length, failedRequests: results.failedRequests.length, localhost8080Requests: results.localhost8080Requests.length }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
