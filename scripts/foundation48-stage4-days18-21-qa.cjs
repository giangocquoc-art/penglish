const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'foundation48-stage4-days18-21-qa-results.json');
const basePath = '/luyen-tieng-anh/48-ngay-lay-goc';

const progressSeed = {
  schemaVersion: 1,
  days: {
    1: { started: true, completed: true, score: 94, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:00:00.000Z' },
    2: { started: true, completed: true, score: 91, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:05:00.000Z' },
    3: { started: true, completed: true, score: 89, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:10:00.000Z' },
    4: { started: true, completed: true, score: 90, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:15:00.000Z' },
    5: { started: true, completed: true, score: 92, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:20:00.000Z' },
    6: { started: true, completed: true, score: 88, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:25:00.000Z' },
    7: { started: true, completed: true, score: 93, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:30:00.000Z' },
    8: { started: true, completed: true, score: 95, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:35:00.000Z' },
    9: { started: true, completed: true, score: 90, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:40:00.000Z' },
    10: { started: true, completed: true, score: 87, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:45:00.000Z' },
    11: { started: true, completed: true, score: 86, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:50:00.000Z' },
    12: { started: true, completed: true, score: 89, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T01:55:00.000Z' },
    13: { started: true, completed: true, score: 91, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T02:00:00.000Z' },
    14: { started: true, completed: true, score: 90, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T02:05:00.000Z' },
    15: { started: true, completed: true, score: 88, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T02:10:00.000Z' },
    16: { started: true, completed: true, score: 89, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T02:15:00.000Z' },
    17: { started: true, completed: false, score: 76, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-08T02:20:00.000Z' },
  },
  updatedAt: '2026-06-08T02:20:00.000Z',
};

const stage4ModulePattern = /foundation48DeepLessons\.stage4\.lazy/i;

const checks = [
  { name: 'foundation48-stage4-roadmap-desktop', route: basePath, width: 1440, height: 950, screenshot: 'foundation48-stage4-roadmap-desktop.png', expected: /48 ngày|Lộ trình|Phát âm, trọng âm và câu hỏi|Ngày 21/i, lazyTitle: null, requireStage4Module: false },
  { name: 'foundation48-stage4-roadmap-mobile', route: basePath, width: 390, height: 844, screenshot: 'foundation48-stage4-roadmap-mobile.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Chặng 4|Phát âm/i, lazyTitle: null, requireStage4Module: false },
  { name: 'foundation48-stage4-roadmap-mobile-375', route: basePath, width: 375, height: 812, screenshot: 'foundation48-stage4-roadmap-mobile-375.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Chặng 4|Phát âm/i, lazyTitle: null, requireStage4Module: false },
  { name: 'foundation48-stage4-day18-mobile', route: `${basePath}/ngay/18`, width: 390, height: 844, screenshot: 'foundation48-stage4-day18-mobile.png', expected: /Ngày 18|Học ngữ âm|listen carefully|Repeat after me|âm cuối/i, lazyTitle: /Học ngữ âm với giáo viên nước ngoài|Listen carefully/i, requireStage4Module: true },
  { name: 'foundation48-stage4-day19-mobile', route: `${basePath}/ngay/19`, width: 390, height: 844, screenshot: 'foundation48-stage4-day19-mobile.png', expected: /Ngày 19|trọng âm|syllable|stress|Repeat the rhythm/i, lazyTitle: /Tìm hiểu về trọng âm|Listen for the stress/i, requireStage4Module: true },
  { name: 'foundation48-stage4-day20-mobile', route: `${basePath}/ngay/20`, width: 390, height: 844, screenshot: 'foundation48-stage4-day20-mobile.png', expected: /Ngày 20|từ để hỏi|Why|How many|Which one/i, lazyTitle: /Các câu hỏi với từ để hỏi|Why are you happy/i, requireStage4Module: true },
  { name: 'foundation48-stage4-day21-mobile', route: `${basePath}/ngay/21`, width: 390, height: 844, screenshot: 'foundation48-stage4-day21-mobile.png', expected: /Ngày 21|Luyện nghe số và tên|thirteen|thirty|Can you spell it/i, lazyTitle: /Luyện nghe số và tên|My number is thirteen/i, requireStage4Module: true },
  { name: 'foundation48-stage4-day18-desktop', route: `${basePath}/ngay/18`, width: 1440, height: 950, screenshot: 'foundation48-stage4-day18-desktop.png', expected: /Ngày 18|Học ngữ âm|listen carefully|Repeat after me|âm cuối/i, lazyTitle: /Học ngữ âm với giáo viên nước ngoài|Listen carefully/i, requireStage4Module: true },
  { name: 'foundation48-stage4-day21-desktop', route: `${basePath}/ngay/21`, width: 1440, height: 950, screenshot: 'foundation48-stage4-day21-desktop.png', expected: /Ngày 21|Luyện nghe số và tên|thirteen|thirty|Can you spell it/i, lazyTitle: /Luyện nghe số và tên|My number is thirteen/i, requireStage4Module: true },
  { name: 'foundation48-stage4-regression-day13-mobile', route: `${basePath}/ngay/13`, width: 390, height: 844, screenshot: 'foundation48-stage4-regression-day13-mobile.png', expected: /Ngày 13|Did you|Hỏi chuyện đã xảy ra/i, lazyTitle: /Hỏi chuyện đã xảy ra|Did you/i, requireStage4Module: false },
  { name: 'foundation48-stage4-regression-day17-mobile', route: `${basePath}/ngay/17`, width: 390, height: 844, screenshot: 'foundation48-stage4-regression-day17-mobile.png', expected: /Ngày 17|can|can’t|can't|Tôi có thể làm/i, lazyTitle: /Tôi có thể làm|can\s*\/\s*can/i, requireStage4Module: false },
];

async function seed(page) {
  await page.addInitScript((state) => {
    window.localStorage.setItem('penglish-foundation48-progress-v1', JSON.stringify(state));
  }, progressSeed);
}

async function waitForStableFoundation48(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 45_000 }).catch(() => undefined);
  await page.waitForFunction(() => {
    const text = document.body.innerText || '';
    return text.length > 80 && !/Đang mở vùng học|Loading|Đang tải/i.test(text);
  }, null, { timeout: 20_000 }).catch(() => undefined);
}

async function inspectLayout(page) {
  return page.evaluate(() => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const navRect = nav ? nav.getBoundingClientRect() : null;
    const visibleText = document.body.innerText || '';
    const titleVisible = /Ngày\s+\d+|48 ngày|Lộ trình/i.test(visibleText);
    const progressVisible = /\d+\s*%|tiến độ|hoàn thành|Đã xong|Học tiếp|Bước\s+\d+\/\d+|Đầy đủ/i.test(visibleText);
    const ctaVisible = Array.from(document.querySelectorAll('a,button')).some((element) => {
      const rect = element.getBoundingClientRect();
      const text = element.textContent || '';
      return rect.width > 0 && rect.height > 0 && rect.top < viewportHeight && rect.bottom > 0 && /Học tiếp|Tiếp tục|Bắt đầu|Hoàn thành|Ngày\s+\d+|Về lộ trình|Luyện/i.test(text);
    });
    const interactiveMainElements = Array.from(document.querySelectorAll('main a, main button, [data-testid^="foundation48-day-card-"]'));
    const bottomNavOverlap = navRect ? interactiveMainElements.some((element) => {
      if (nav.contains(element)) return false;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (rect.bottom <= 0 || rect.top >= viewportHeight) return false;
      return rect.bottom > navRect.top + 2;
    }) : false;
    const nearBottomCtas = interactiveMainElements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { text: (element.textContent || '').trim().slice(0, 80), top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
      })
      .filter((item) => item.width > 0 && item.height > 0 && item.bottom > viewportHeight - 220 && item.top < viewportHeight);
    const overflow = {
      bodyScrollWidth: document.body.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
    };
    return {
      viewportWidth,
      viewportHeight,
      titleVisible,
      progressVisible,
      ctaVisible,
      bottomNavVisible: Boolean(navRect && navRect.width > 0 && navRect.height > 0),
      bottomNavOverlap,
      navRect: navRect ? { top: navRect.top, bottom: navRect.bottom, height: navRect.height } : null,
      nearBottomCtas,
      overflow,
    };
  });
}

function isCriticalFailedRequest(request) {
  const url = request.url();
  const failure = request.failure()?.errorText || '';
  if (/favicon|\.png|\.webp|\.jpg|\.jpeg|\.svg|\.mp3|\.wav/i.test(url) && /abort|interrupted|cancel/i.test(failure)) return false;
  if (/google-analytics|googletagmanager|chrome-extension/i.test(url)) return false;
  return true;
}

async function gotoAndCheck(page, check, runErrors, consoleErrors, failedRequests) {
  await page.setViewportSize({ width: check.width, height: check.height });
  const moduleRequestsBefore = await page.evaluate((patternSource) => {
    const pattern = new RegExp(patternSource, 'i');
    return performance.getEntriesByType('resource').filter((entry) => pattern.test(entry.name)).map((entry) => entry.name);
  }, stage4ModulePattern.source).catch(() => []);

  const url = new URL(check.route, baseUrl).toString();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await waitForStableFoundation48(page);

  const text = await page.locator('body').innerText({ timeout: 20_000 });
  if (!check.expected.test(text)) {
    runErrors.push(`${check.name}: expected route text was not visible.`);
  }
  if (check.lazyTitle && !check.lazyTitle.test(text)) {
    runErrors.push(`${check.name}: lazy lesson real title/content was not visible.`);
  }

  const layout = await inspectLayout(page);
  if (!layout.titleVisible) runErrors.push(`${check.name}: title is not visible.`);
  if (!layout.progressVisible) runErrors.push(`${check.name}: progress/status indicator is not visible.`);
  if (!layout.ctaVisible) runErrors.push(`${check.name}: CTA/navigation button is not visible.`);
  if (check.width < 768 && !layout.bottomNavVisible) runErrors.push(`${check.name}: mobile bottom nav is not visible.`);
  if (check.width < 768 && layout.bottomNavOverlap) runErrors.push(`${check.name}: mobile bottom nav overlaps visible main content.`);
  if (layout.overflow.hasHorizontalOverflow) runErrors.push(`${check.name}: horizontal overflow detected (${layout.overflow.bodyScrollWidth} > ${layout.overflow.htmlClientWidth}).`);

  const stage4ModuleRequests = await page.evaluate((patternSource) => {
    const pattern = new RegExp(patternSource, 'i');
    return performance.getEntriesByType('resource').filter((entry) => pattern.test(entry.name)).map((entry) => entry.name);
  }, stage4ModulePattern.source).catch(() => []);

  if (check.requireStage4Module && stage4ModuleRequests.length === 0) {
    runErrors.push(`${check.name}: Stage 4 lazy module request was not observed.`);
  }

  const screenshotPath = path.join(screenshotDir, check.screenshot);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  return {
    ...check,
    url,
    screenshotPath,
    layout,
    stage4ModuleRequests,
    stage4ModuleRequestsBefore: moduleRequestsBefore,
    textSample: text.slice(0, 500),
    consoleErrorsAtCheck: consoleErrors.length,
    failedRequestsAtCheck: failedRequests.length,
  };
}

(async () => {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await seed(page);

  const consoleErrors = [];
  const failedRequests = [];
  const runErrors = [];
  const results = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push({ text: message.text(), location: message.location() });
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push({ text: error.message, stack: error.stack });
  });
  page.on('requestfailed', (request) => {
    if (isCriticalFailedRequest(request)) {
      failedRequests.push({ url: request.url(), method: request.method(), failure: request.failure()?.errorText });
    }
  });

  for (const check of checks) {
    try {
      results.push(await gotoAndCheck(page, check, runErrors, consoleErrors, failedRequests));
    } catch (error) {
      runErrors.push(`${check.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await browser.close();

  const report = {
    ok: runErrors.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0,
    generatedAt: new Date().toISOString(),
    baseUrl,
    checks: results,
    errors: runErrors,
    consoleErrors,
    failedRequests,
    stage4ModuleRequests: Array.from(new Set(results.flatMap((result) => result.stage4ModuleRequests || []))),
    screenshots: results.map((result) => result.screenshotPath),
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, reportPath, screenshots: report.screenshots, stage4ModuleRequests: report.stage4ModuleRequests, errors: runErrors.length, consoleErrors: consoleErrors.length, failedRequests: failedRequests.length }, null, 2));

  if (!report.ok) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
