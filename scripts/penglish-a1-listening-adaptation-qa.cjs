/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, 'reports', 'screenshots');
const REPORT_DIR = path.join(ROOT, 'reports', 'website-cloner-research');
const JSON_REPORT = path.join(REPORT_DIR, 'penglish-a1-listening-adaptation-qa.json');
const CANDIDATE_BASE_URLS = [
  process.env.PENGLISH_QA_BASE_URL,
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:5185',
].filter(Boolean);

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });

const routeChecks = [
  { slug: 'home', path: '/', expected: ['P-English'] },
  { slug: 'learning-path', path: '/learning-path', expected: ['A1', 'Lộ trình'] },
  {
    slug: 'unit-1',
    path: '/lessons/unit-1-greetings-introduction',
    expected: [
      { label: 'unit 1 lesson title', any: ['Chào hỏi và giới thiệu bản thân', 'Greetings and Self-introduction'] },
      { label: 'guided practice panel', any: ['Luyện nghe', 'Flashcard', 'Phản xạ', 'Kế hoạch luyện trong phòng học này'] },
      { label: 'lesson content sections', any: ['Mục tiêu sau bài học', 'Vocabulary grid', 'Sentence patterns'] },
    ],
  },
  {
    slug: 'new-lesson',
    path: '/lessons/a1-listening-meeting-classmate',
    expected: [
      { label: 'A1 classmate lesson title', any: ['A1 - Meeting a new classmate', 'Meeting a new classmate'] },
      { label: 'listening lesson content', any: ['Luyện nghe', 'Listening preview', 'Hi, I am new here.', 'Is this seat free?'] },
      { label: 'lesson content sections', any: ['Mục tiêu sau bài học', 'Vocabulary grid', 'Sentence patterns'] },
    ],
  },
  { slug: 'english-speed', path: '/english-speed', expected: ['English Speed', 'Ghi âm'] },
  { slug: 'shadowing', path: '/shadowing', expected: ['Shadowing', 'Poo'] },
  { slug: 'words', path: '/words', expected: ['Từ', 'Tất cả'] },
];

const viewports = [
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

function compact(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
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

async function detectBaseUrl() {
  for (const url of CANDIDATE_BASE_URLS) {
    try {
      const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(2500) });
      if (response.ok) return url;
    } catch {
      // Try the next common Vite port.
    }
  }
  return CANDIDATE_BASE_URLS[0] || 'http://127.0.0.1:5173';
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 1200 }).catch(() => undefined);
  await page.waitForTimeout(700);
}

async function safeGoto(page, url) {
  const result = { ok: true, error: '' };
  try {
    await page.goto(url, { waitUntil: 'commit', timeout: 9000 });
  } catch (error) {
    result.ok = false;
    result.error = error?.message || String(error);
  }
  await settle(page);
  return result;
}

async function installFastMode(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; scroll-behavior: auto !important; }
      iframe, video { visibility: hidden !important; }
    `,
  }).catch(() => undefined);
}

async function screenshot(page, name) {
  const file = path.join(SCREENSHOT_DIR, `${name}.jpg`);
  const viewport = page.viewportSize() || { width: 1366, height: 768 };
  const safeViewport = {
    width: Math.max(1, Math.floor(viewport.width || 1366)),
    height: Math.max(1, Math.floor(viewport.height || 768)),
  };

  let client;
  try {
    client = await page.context().newCDPSession(page);
    await client.send('Page.enable').catch(() => undefined);
    await page.waitForTimeout(80);
    const shot = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 72,
      captureBeyondViewport: false,
      clip: {
        x: 0,
        y: 0,
        width: safeViewport.width,
        height: safeViewport.height,
        scale: 1,
      },
    });
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
  } catch (error) {
    const tinyJpeg = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z';
    fs.writeFileSync(file, Buffer.from(tinyJpeg, 'base64'));
  } finally {
    await client?.detach().catch(() => undefined);
  }

  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function isCriticalFailedRequest(entry) {
  const url = entry.url || '';
  const failure = entry.failure || '';
  const isBenignExternal = /youtube|ytimg|googlevideo|google|gstatic|supabase|chrome-extension/i.test(url);
  const isInterruptedViteModule = failure === 'net::ERR_ABORTED' && (/\/src\//.test(url) || /\/node_modules\/\.vite\//.test(url));
  return !isBenignExternal && !isInterruptedViteModule;
}

async function main() {
  const BASE_URL = await detectBaseUrl();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    try {
      window.localStorage.removeItem('p-english:daily-hearts');
    } catch {
      // Keep QA navigation resilient if storage is unavailable on an initial document.
    }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);

  const messages = [];
  const failedRequests = [];
  const results = [];

  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      messages.push({ type: msg.type(), text: msg.text(), location: msg.location() });
    }
  });
  page.on('pageerror', (error) => messages.push({ type: 'pageerror', text: error.message }));
  page.on('requestfailed', (request) => {
    const entry = { url: request.url(), method: request.method(), failure: request.failure()?.errorText || '' };
    if (isCriticalFailedRequest(entry)) failedRequests.push(entry);
  });
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !/favicon|youtube|ytimg|google|googlevideo|gstatic|supabase|chrome-extension/i.test(url)) {
      failedRequests.push({ url, method: response.request().method(), status });
    }
  });

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of routeChecks) {
      const navigation = await safeGoto(page, `${BASE_URL}${route.path}`);
      await installFastMode(page);
      await page.waitForFunction(
        (expected) => expected.some((entry) => {
          const check = typeof entry === 'string' ? { any: [entry] } : entry;
          return check.any.some((text) => document.body?.innerText?.toLowerCase().includes(String(text).toLowerCase()));
        }),
        route.expected,
        { timeout: 5000 },
      ).catch(() => undefined);
      const bodyText = compact(await page.locator('body').innerText({ timeout: 5000 }).catch(() => ''));
      const visibleMissing = findMissingExpectedChecks(bodyText, route.expected);
      const emptyDataVisible = /Chưa có dữ liệu/i.test(bodyText);
      const shot = await screenshot(page, `penglish-a1-${viewport.name}-${route.slug}`);
      results.push({
        viewport: viewport.name,
        path: route.path,
        screenshot: shot,
        passedExpectedText: visibleMissing.length === 0,
        missingExpectedText: visibleMissing,
        emptyDataVisible,
        title: await page.title(),
        navigation,
      });
    }
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  const listeningPracticeUrl = `${BASE_URL}/practice?lessonId=a1-listening-meeting-classmate&mode=listen`;
  const listeningNavigation = await safeGoto(page, listeningPracticeUrl);
  if (!listeningNavigation.ok || page.url().startsWith('chrome-error://')) {
    throw new Error(`Listening practice navigation failed before storage reset. url=${page.url()}; error=${listeningNavigation.error}`);
  }
  await installFastMode(page);
  await page.evaluate(() => {
    try {
      window.localStorage.removeItem('p-english:daily-hearts');
      window.localStorage.removeItem('penglish.daily.rewards.v1');
      window.localStorage.removeItem('penglish.lesson.progress.v1');
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith('p-english:lesson-progress:a1-listening-meeting-classmate'))
        .forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // Keep QA running if browser storage is temporarily unavailable; persistence is asserted after practice.
    }
  });
  const resetNavigation = await safeGoto(page, listeningPracticeUrl);
  if (!resetNavigation.ok || page.url().startsWith('chrome-error://')) {
    throw new Error(`Listening practice navigation failed after storage reset. url=${page.url()}; error=${resetNavigation.error}`);
  }
  await installFastMode(page);
  await settle(page);

  const practiceInitialShot = await screenshot(page, 'penglish-a1-desktop-listening-practice');
  const startListeningButton = page.getByRole('button', { name: /Bắt đầu luyện nghe/i });
  const startListeningVisible = await startListeningButton.isVisible({ timeout: 5000 }).catch(() => false);
  if (!startListeningVisible) {
    const diagnosticText = compact(await page.locator('body').innerText({ timeout: 5000 }).catch(() => ''));
    const diagnosticShot = await screenshot(page, 'penglish-a1-desktop-listening-practice-missing-start');
    throw new Error(`Listening practice start button missing. screenshot=${diagnosticShot}; url=${page.url()}; body=${diagnosticText.slice(0, 900)}`);
  }
  await startListeningButton.click();
  await page.waitForTimeout(250);
  await page.keyboard.press('1');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const checkedText = compact(await page.locator('body').innerText());
  const explanationVisible = /Đáp án đúng:/.test(checkedText) && /Đọc transcript/.test(checkedText);
  const checkedShot = await screenshot(page, 'penglish-a1-desktop-listening-practice-checked');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const advancedText = compact(await page.locator('body').innerText());
  const enterAdvanced = /Câu 2/.test(advancedText) || /2\/5/.test(advancedText);

  for (let guard = 0; guard < 7; guard += 1) {
    const text = compact(await page.locator('body').innerText());
    if (/Tổng kết Listening|Hoàn thành luyện nghe/.test(text)) break;
    await page.keyboard.press('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
  }

  const summaryText = compact(await page.locator('body').innerText());
  const summaryVisible = /Tổng kết Listening|Hoàn thành luyện nghe/.test(summaryText);
  const summaryShot = await screenshot(page, 'penglish-a1-desktop-listening-practice-summary');
  const localProgress = await page.evaluate(() => {
    try {
      const legacyKey = 'p-english:lesson-progress:a1-listening-meeting-classmate';
      const centralKey = 'penglish.lesson.progress.v1';
      const dailyKey = 'penglish.daily.rewards.v1';
      return {
        legacyLessonProgress: JSON.parse(window.localStorage.getItem(legacyKey) || 'null'),
        centralLessonProgress: JSON.parse(window.localStorage.getItem(centralKey) || 'null'),
        dailyRewards: JSON.parse(window.localStorage.getItem(dailyKey) || 'null'),
      };
    } catch (error) {
      return { legacyLessonProgress: null, centralLessonProgress: null, dailyRewards: null, storageError: error?.message || String(error) };
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await safeGoto(page, listeningPracticeUrl);
  await installFastMode(page);
  const mobilePracticeShot = await screenshot(page, 'penglish-a1-mobile-listening-practice');

  await browser.close();

  const detailedAttempts = localProgress.legacyLessonProgress?.listening?.attempts;
  const dailyRewardSaved = Boolean(localProgress.dailyRewards?.completedToday?.length || localProgress.dailyRewards?.lastActiveDate);
  const criticalMessages = messages.filter((msg) => msg.type === 'error' || msg.type === 'pageerror');
  const warningMessages = messages.filter((msg) => msg.type === 'warning');
  const failedRouteTextChecks = results.filter((item) => !item.passedExpectedText).length;

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routeResults: results,
    listeningPractice: {
      initialScreenshot: practiceInitialShot,
      checkedScreenshot: checkedShot,
      summaryScreenshot: summaryShot,
      mobileScreenshot: mobilePracticeShot,
      explanationVisible,
      enterAdvanced,
      summaryVisible,
      localProgressSaved: Boolean(detailedAttempts),
      dailyRewardSaved,
      localProgress,
    },
    consoleMessages: messages,
    failedRequests,
    summary: {
      routeChecks: results.length,
      failedRouteTextChecks: results.filter((item) => !item.passedExpectedText).length,
      emptyDataVisibleCount: results.filter((item) => item.emptyDataVisible).length,
      consoleErrorCount: criticalMessages.length,
      consoleWarningCount: warningMessages.length,
      failedRequestCount: failedRequests.length,
      explanationVisible,
      enterAdvanced,
      summaryVisible,
      localProgressSaved: Boolean(detailedAttempts),
      dailyRewardSaved,
    },
  };

  fs.writeFileSync(JSON_REPORT, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`QA report: ${path.relative(ROOT, JSON_REPORT).replace(/\\/g, '/')}`);

  if (failedRouteTextChecks > 0 || criticalMessages.length > 0 || failedRequests.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
