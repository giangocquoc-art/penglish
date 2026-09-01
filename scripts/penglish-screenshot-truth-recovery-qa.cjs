/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');

const ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, 'reports', 'screenshots', 'penglish-screenshot-truth-recovery');
const REPORT_PATH = path.join(ROOT, 'reports', 'penglish-screenshot-truth-recovery-qa.json');
const BASE_URL = (process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:5190').replace(/\/$/, '');

const VIEWPORTS = [
  { name: 'desktop', width: 1366, height: 768, minBodyTextLength: 80 },
  { name: 'mobile', width: 390, height: 844, minBodyTextLength: 60 },
];

const ROUTES = [
  {
    slug: 'home',
    path: '/home',
    expected: [
      { label: 'P-English home identity', any: ['P-English', 'Poo'] },
      { label: 'home learning UI', any: ['Lộ trình', 'Học', 'Từ vựng', 'Shadowing'] },
    ],
  },
  {
    slug: 'learning-path',
    path: '/learning-path',
    expected: [
      { label: 'learning path title', any: ['Lộ trình', 'A1'] },
      { label: 'lesson navigation content', any: ['Unit', 'Bài', 'Chào hỏi', 'Meeting'] },
    ],
  },
  {
    slug: 'lesson-unit-1-greetings-introduction',
    path: '/lessons/unit-1-greetings-introduction',
    expected: [
      { label: 'unit 1 lesson title', any: ['Chào hỏi và giới thiệu bản thân', 'Greetings and Self-introduction'] },
      { label: 'guided practice panel', any: ['Luyện nghe', 'Flashcard', 'Phản xạ', 'Kế hoạch luyện trong phòng học này'] },
      { label: 'lesson content sections', any: ['Mục tiêu sau bài học', 'Vocabulary grid', 'Sentence patterns'] },
    ],
  },
  {
    slug: 'lesson-a1-listening-meeting-classmate',
    path: '/lessons/a1-listening-meeting-classmate',
    expected: [
      { label: 'A1 classmate lesson title', any: ['A1 - Meeting a new classmate', 'Meeting a new classmate'] },
      { label: 'listening lesson content', any: ['Luyện nghe', 'Listening preview', 'Hi, I am new here.', 'Is this seat free?'] },
      { label: 'lesson content sections', any: ['Mục tiêu sau bài học', 'Vocabulary grid', 'Sentence patterns'] },
    ],
  },
  {
    slug: 'practice-a1-listening-meeting-classmate',
    path: '/practice?lessonId=a1-listening-meeting-classmate&mode=listen',
    expected: [
      { label: 'listening practice start', any: ['Bắt đầu luyện nghe', 'Listening', 'Meeting a new classmate'] },
      { label: 'practice lesson data', any: ['What does the speaker say?', 'I am new here.', 'CÂU 1', 'Kiểm tra'] },
    ],
  },
  {
    slug: 'english-speed',
    path: '/english-speed',
    expected: [
      { label: 'English Speed title', any: ['English Speed'] },
      { label: 'recording practice UI', any: ['Ghi âm', 'phát âm', 'record'] },
    ],
  },
  {
    slug: 'shadowing',
    path: '/shadowing',
    expected: [
      { label: 'Shadowing title', any: ['Shadowing'] },
      { label: 'P-English shadowing UI', any: ['Poo', 'nghe', 'video', 'script'] },
    ],
  },
  {
    slug: 'words',
    path: '/words',
    expected: [
      { label: 'words vocabulary UI', any: ['Từ', 'Tất cả', 'Vocabulary'] },
      { label: 'word list controls', any: ['Ôn tập', 'Lọc', 'từ vựng', 'Danh sách'] },
    ],
  },
];

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeExpectedChecks(expected) {
  return expected.map((entry) => (typeof entry === 'string' ? { label: entry, any: [entry] } : entry));
}

function findMissingExpectedChecks(bodyText, expected) {
  const normalizedBody = bodyText.toLowerCase();
  return normalizeExpectedChecks(expected)
    .filter((check) => !check.any.some((text) => normalizedBody.includes(String(text).toLowerCase())))
    .map((check) => check.label);
}

async function revealLessonSectionsForTruthCapture(page) {
  await page.evaluate(() => {
    document.querySelectorAll('details').forEach((details) => {
      details.setAttribute('open', '');
    });
  }).catch(() => undefined);
}

async function primePracticeRouteForTruthCapture(page) {
  const startButton = page.getByRole('button', { name: /Bắt đầu luyện nghe/i });
  if (await startButton.isVisible({ timeout: 1200 }).catch(() => false)) {
    await startButton.click().catch(() => undefined);
    await page.waitForTimeout(250);
  }
}

async function prepareRouteForTruthCapture(page, route) {
  if (route.path.startsWith('/lessons/')) {
    await revealLessonSectionsForTruthCapture(page);
  }

  if (route.path.startsWith('/practice?')) {
    await primePracticeRouteForTruthCapture(page);
  }
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function isForbiddenUrl(actualUrl, expectedPath) {
  if (!actualUrl || actualUrl === 'about:blank') return true;
  if (actualUrl.startsWith('chrome-error://')) return true;
  try {
    const parsed = new URL(actualUrl);
    const expected = new URL(`${BASE_URL}${expectedPath}`);
    return parsed.origin !== expected.origin || parsed.pathname !== expected.pathname;
  } catch {
    return true;
  }
}

function analyzePng(buffer) {
  const png = PNG.sync.read(buffer);
  const { width, height, data } = png;
  const pixelCount = width * height;
  let whiteLike = 0;
  let nearWhite = 0;
  let nonWhite = 0;
  let saturated = 0;
  let dark = 0;
  let sumLuma = 0;
  let sumLumaSq = 0;

  for (let offset = 0; offset < data.length; offset += 4) {
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    sumLuma += luma;
    sumLumaSq += luma * luma;
    if (a < 8 || (r >= 250 && g >= 250 && b >= 250)) whiteLike += 1;
    if (a < 8 || (r >= 242 && g >= 242 && b >= 242)) nearWhite += 1;
    if (!(r >= 245 && g >= 245 && b >= 245)) nonWhite += 1;
    if (max - min >= 24 && max >= 90) saturated += 1;
    if (luma < 190) dark += 1;
  }

  const averageLuma = sumLuma / pixelCount;
  const variance = (sumLumaSq / pixelCount) - (averageLuma * averageLuma);
  const whiteRatio = whiteLike / pixelCount;
  const nearWhiteRatio = nearWhite / pixelCount;
  const nonWhiteRatio = nonWhite / pixelCount;
  const saturatedRatio = saturated / pixelCount;
  const darkRatio = dark / pixelCount;

  const mostlyWhite = whiteRatio > 0.985 || (nearWhiteRatio > 0.995 && variance < 35);
  const lowInformation = nonWhiteRatio < 0.01 && saturatedRatio < 0.002 && darkRatio < 0.002;
  const blank = mostlyWhite || lowInformation || (averageLuma > 252 && variance < 20);

  return {
    width,
    height,
    averageLuma: Number(averageLuma.toFixed(2)),
    variance: Number(variance.toFixed(2)),
    whiteRatio: Number(whiteRatio.toFixed(5)),
    nearWhiteRatio: Number(nearWhiteRatio.toFixed(5)),
    nonWhiteRatio: Number(nonWhiteRatio.toFixed(5)),
    saturatedRatio: Number(saturatedRatio.toFixed(5)),
    darkRatio: Number(darkRatio.toFixed(5)),
    blank,
  };
}

function isCriticalFailedRequest(entry) {
  const url = entry.url || '';
  const failure = entry.failure || '';
  const isFavicon = /favicon|apple-touch-icon|manifest\.json/i.test(url);
  const isBenignExternal = /youtube|ytimg|googlevideo|google|gstatic|supabase|chrome-extension/i.test(url);
  const isInterruptedViteModule = failure === 'net::ERR_ABORTED' && (/\/src\//.test(url) || /\/node_modules\/\.vite\//.test(url));
  return !isFavicon && !isBenignExternal && !isInterruptedViteModule;
}

async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/home`, { method: 'GET', signal: AbortSignal.timeout(4000) });
    return { ok: response.ok, status: response.status, url: `${BASE_URL}/home` };
  } catch (error) {
    return { ok: false, status: null, url: `${BASE_URL}/home`, error: error?.message || String(error) };
  }
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 7000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 1800 }).catch(() => undefined);
  await page.waitForTimeout(900);
}

async function installStableVisualMode(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after { animation-duration: 0.001s !important; animation-delay: 0s !important; transition-duration: 0.001s !important; scroll-behavior: auto !important; }
      iframe, video { visibility: hidden !important; }
    `,
  }).catch(() => undefined);
}

async function captureAndAnalyze(page, viewportName, routeSlug) {
  const filePath = path.join(SCREENSHOT_DIR, `${viewportName}-${routeSlug}.png`);
  const buffer = await page.screenshot({ path: filePath, type: 'png', fullPage: false });
  return { screenshot: relative(filePath), image: analyzePng(buffer) };
}

async function collectDiagnostics(page) {
  const root = page.locator('#root');
  const bodyText = compact(await page.locator('body').innerText({ timeout: 3000 }).catch(() => ''));
  const rootText = compact(await root.innerText({ timeout: 3000 }).catch(() => ''));
  const rootHtml = await root.evaluate((node) => node.innerHTML).catch(() => '');
  const loadingVisible = /Đang tải|Đang mở vùng học|Loading/i.test(bodyText);
  const visibleUiHandle = await page.evaluate(() => {
    const rootNode = document.querySelector('#root');
    if (!rootNode) return { rootExists: false, visibleElementCount: 0 };
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT);
    let visibleElementCount = 0;
    while (walker.nextNode()) {
      const element = walker.currentNode;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity || '1') > 0.01) {
        visibleElementCount += 1;
      }
    }
    return { rootExists: true, visibleElementCount };
  }).catch((error) => ({ rootExists: false, visibleElementCount: 0, error: error?.message || String(error) }));

  return {
    url: page.url(),
    title: await page.title().catch(() => ''),
    bodyTextLength: bodyText.length,
    bodyTextSample: bodyText.slice(0, 500),
    fullBodyText: bodyText,
    rootTextLength: rootText.length,
    rootHtmlLength: rootHtml.length,
    loadingVisible,
    rootVisible: visibleUiHandle,
  };
}

function routeFailureReasons({ route, viewport, diagnostics, image, navigation, consoleErrors, pageErrors, failedRequests }) {
  const reasons = [];
  if (!navigation.ok) reasons.push(`navigation failed: ${navigation.error}`);
  if (isForbiddenUrl(diagnostics.url, route.path)) reasons.push(`unexpected url: ${diagnostics.url}`);
  if (diagnostics.bodyTextLength < viewport.minBodyTextLength) reasons.push(`body text too short: ${diagnostics.bodyTextLength}`);
  if (!diagnostics.rootVisible.rootExists) reasons.push('React root missing');
  if (diagnostics.rootHtmlLength < 80) reasons.push(`React root rendered no visible lesson UI; root HTML length ${diagnostics.rootHtmlLength}`);
  if ((diagnostics.rootVisible.visibleElementCount || 0) < 5) reasons.push(`React root visible element count too low: ${diagnostics.rootVisible.visibleElementCount || 0}`);
  if (diagnostics.loadingVisible) reasons.push('loading screen still visible after settle timeout');
  if (image.blank) reasons.push(`blank screenshot detected for ${route.path}`);
  const realMissingExpected = findMissingExpectedChecks(diagnostics.fullBodyText || diagnostics.bodyTextSample, route.expected);
  if (realMissingExpected.length > 0) reasons.push(`expected route text missing: ${realMissingExpected.join(', ')}`);
  if (consoleErrors.length > 0) reasons.push(`console errors: ${consoleErrors.length}`);
  if (pageErrors.length > 0) reasons.push(`page errors: ${pageErrors.length}`);
  if (failedRequests.length > 0) reasons.push(`failed requests: ${failedRequests.length}`);
  return reasons;
}

async function main() {
  const server = await checkServer();
  if (!server.ok) {
    console.error(`FAIL: dev server is not reachable at ${server.url}${server.error ? ` (${server.error})` : ''}`);
    fs.writeFileSync(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl: BASE_URL, server, results: [], summary: { passed: false } }, null, 2), 'utf8');
    process.exitCode = 1;
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    try {
      window.localStorage.removeItem('p-english:daily-hearts');
      window.localStorage.removeItem('penglish.daily.rewards.v1');
      window.localStorage.removeItem('penglish.lesson.progress.v1');
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith('p-english:lesson-progress:a1-listening-meeting-classmate'))
        .forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // Storage can be unavailable before document initialization; route diagnostics will catch render failures.
    }
  });

  const results = [];
  const allConsoleMessages = [];
  const allFailedRequests = [];

  for (const viewport of VIEWPORTS) {
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    const consoleMessages = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) {
        const entry = { viewport: viewport.name, type: msg.type(), text: msg.text(), location: msg.location() };
        consoleMessages.push(entry);
        allConsoleMessages.push(entry);
      }
    });
    page.on('pageerror', (error) => {
      const entry = { viewport: viewport.name, type: 'pageerror', text: error.message };
      pageErrors.push(entry);
      allConsoleMessages.push(entry);
    });
    page.on('requestfailed', (request) => {
      const entry = { viewport: viewport.name, url: request.url(), method: request.method(), failure: request.failure()?.errorText || '' };
      if (isCriticalFailedRequest(entry)) {
        failedRequests.push(entry);
        allFailedRequests.push(entry);
      }
    });
    page.on('response', (response) => {
      const entry = { viewport: viewport.name, url: response.url(), method: response.request().method(), status: response.status() };
      if (entry.status >= 400 && isCriticalFailedRequest(entry)) {
        failedRequests.push(entry);
        allFailedRequests.push(entry);
      }
    });

    for (const route of ROUTES) {
      const beforeConsole = consoleMessages.length;
      const beforePageErrors = pageErrors.length;
      const beforeFailedRequests = failedRequests.length;
      const targetUrl = `${BASE_URL}${route.path}`;
      const navigation = { ok: true, error: '' };
      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
      } catch (error) {
        navigation.ok = false;
        navigation.error = error?.message || String(error);
      }
      await settle(page);
      await installStableVisualMode(page);
      await page.waitForFunction(
        () => {
          const root = document.querySelector('#root');
          const text = document.body?.innerText || '';
          return Boolean(root?.innerHTML?.length > 80) && !/Đang tải|Đang mở vùng học|Loading/i.test(text);
        },
        null,
        { timeout: 5000 },
      ).catch(() => undefined);
      await prepareRouteForTruthCapture(page, route);
      await settle(page);

      const diagnostics = await collectDiagnostics(page);
      const capture = await captureAndAnalyze(page, viewport.name, route.slug);
      const routeConsoleMessages = consoleMessages.slice(beforeConsole);
      const routeConsoleErrors = routeConsoleMessages.filter((entry) => entry.type === 'error');
      const routePageErrors = pageErrors.slice(beforePageErrors);
      const routeFailedRequests = failedRequests.slice(beforeFailedRequests);
      const missingExpectedText = findMissingExpectedChecks(diagnostics.fullBodyText || diagnostics.bodyTextSample, route.expected);
      const reasons = routeFailureReasons({
        route,
        viewport,
        diagnostics,
        image: capture.image,
        navigation,
        consoleErrors: routeConsoleErrors,
        pageErrors: routePageErrors,
        failedRequests: routeFailedRequests,
      });

      results.push({
        viewport: viewport.name,
        path: route.path,
        expectedUrl: targetUrl,
        screenshot: capture.screenshot,
        image: capture.image,
        diagnostics,
        navigation,
        missingExpectedText,
        consoleMessages: routeConsoleMessages,
        pageErrors: routePageErrors,
        failedRequests: routeFailedRequests,
        passed: reasons.length === 0,
        failureReasons: reasons,
      });
    }

    await page.close();
  }

  await browser.close();

  const failedResults = results.filter((result) => !result.passed);
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    server,
    results,
    consoleMessages: allConsoleMessages,
    failedRequests: allFailedRequests,
    summary: {
      passed: failedResults.length === 0,
      routeChecks: results.length,
      failedRouteChecks: failedResults.length,
      blankScreenshotCount: results.filter((result) => result.image.blank).length,
      consoleErrorCount: allConsoleMessages.filter((entry) => entry.type === 'error' || entry.type === 'pageerror').length,
      consoleWarningCount: allConsoleMessages.filter((entry) => entry.type === 'warning').length,
      failedRequestCount: allFailedRequests.length,
      screenshotDir: relative(SCREENSHOT_DIR),
    },
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`QA report: ${relative(REPORT_PATH)}`);

  if (failedResults.length > 0) {
    for (const failed of failedResults) {
      for (const reason of failed.failureReasons) {
        if (reason.includes('blank screenshot detected')) {
          console.error(`FAIL: blank screenshot detected for ${failed.path}`);
        } else if (reason.includes('React root rendered no visible lesson UI')) {
          console.error('FAIL: React root rendered no visible lesson UI');
        } else {
          console.error(`FAIL: ${failed.viewport} ${failed.path}: ${reason}`);
        }
      }
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`FAIL: screenshot-truth QA crashed: ${error?.stack || error?.message || String(error)}`);
  process.exitCode = 1;
});
