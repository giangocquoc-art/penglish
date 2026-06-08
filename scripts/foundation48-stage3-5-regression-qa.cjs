const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'foundation48-stage3-5-regression-qa-results.json');
const basePath = '/luyen-tieng-anh/48-ngay-lay-goc';

const progressSeed = {
  schemaVersion: 1,
  days: {
    1: { started: true, completed: true, score: 94, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:00:00.000Z' },
    2: { started: true, completed: true, score: 91, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:05:00.000Z' },
    3: { started: true, completed: true, score: 89, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:10:00.000Z' },
    4: { started: true, completed: true, score: 90, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:15:00.000Z' },
    5: { started: true, completed: true, score: 92, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:20:00.000Z' },
    6: { started: true, completed: true, score: 88, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:25:00.000Z' },
    7: { started: true, completed: true, score: 93, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:30:00.000Z' },
    8: { started: true, completed: true, score: 95, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:35:00.000Z' },
    9: { started: true, completed: false, score: 72, completedSteps: ['intro'], mistakes: [], updatedAt: '2026-06-07T08:40:00.000Z' },
  },
  updatedAt: '2026-06-07T08:40:00.000Z',
};

const checks = [
  { name: 'foundation48-stage3-5-roadmap-mobile', route: basePath, width: 390, height: 844, screenshot: 'foundation48-stage3-5-roadmap-mobile.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Chặng 3/i, lazyTitle: null },
  { name: 'foundation48-stage3-5-roadmap-mobile-375', route: basePath, width: 375, height: 812, screenshot: 'foundation48-stage3-5-roadmap-mobile-375.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Chặng 3/i, lazyTitle: null },
  { name: 'foundation48-stage3-5-roadmap-desktop', route: basePath, width: 1440, height: 950, screenshot: 'foundation48-stage3-5-roadmap-desktop.png', expected: /48 ngày|Lộ trình|Ngày 17/i, lazyTitle: null },
  { name: 'foundation48-stage3-5-day9-mobile', route: `${basePath}/ngay/9`, width: 390, height: 844, screenshot: 'foundation48-stage3-5-day9-mobile.png', expected: /Ngày 9|Từ loại|Tiếp tục|Bắt đầu|Hoàn thành/i, lazyTitle: null },
  { name: 'foundation48-stage3-5-day9-mobile-375', route: `${basePath}/ngay/9`, width: 375, height: 812, screenshot: 'foundation48-stage3-5-day9-mobile-375.png', expected: /Ngày 9|Từ loại|Tiếp tục|Bắt đầu|Hoàn thành/i, lazyTitle: null },
  { name: 'foundation48-stage3-5-day10-desktop', route: `${basePath}/ngay/10`, width: 1440, height: 950, screenshot: 'foundation48-stage3-5-day10-desktop.png', expected: /Ngày 10|Đang làm gì|Tiếp tục|Bắt đầu|Hoàn thành/i, lazyTitle: null },
  { name: 'foundation48-stage3-5-day13-mobile', route: `${basePath}/ngay/13`, width: 390, height: 844, screenshot: 'foundation48-stage3-5-day13-mobile.png', expected: /Ngày 13|Did you|Hỏi chuyện đã xảy ra/i, lazyTitle: /Hỏi chuyện đã xảy ra|Did you/i },
  { name: 'foundation48-stage3-5-day17-mobile', route: `${basePath}/ngay/17`, width: 390, height: 844, screenshot: 'foundation48-stage3-5-day17-mobile.png', expected: /Ngày 17|can|can’t|can't|Tôi có thể làm/i, lazyTitle: /Tôi có thể làm|can\s*\/\s*can/i },
  { name: 'foundation48-stage3-5-day17-desktop', route: `${basePath}/ngay/17`, width: 1440, height: 950, screenshot: 'foundation48-stage3-5-day17-desktop.png', expected: /Ngày 17|can|can’t|can't|Tôi có thể làm/i, lazyTitle: /Tôi có thể làm|can\s*\/\s*can/i },
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
    const progressVisible = /\d+\s*%|tiến độ|hoàn thành|Đã xong|Học tiếp|Bước\s+\d+\/\d+/i.test(visibleText);
    const ctaVisible = Array.from(document.querySelectorAll('a,button')).some((element) => {
      const rect = element.getBoundingClientRect();
      const text = element.textContent || '';
      return rect.width > 0 && rect.height > 0 && rect.top < viewportHeight && rect.bottom > 0 && /Học tiếp|Tiếp tục|Bắt đầu|Hoàn thành|Ngày\s+\d+|Về lộ trình/i.test(text);
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

  const screenshotPath = path.join(screenshotDir, check.screenshot);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  return {
    ...check,
    url,
    screenshotPath,
    layout,
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
    screenshots: results.map((result) => result.screenshotPath),
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, reportPath, screenshots: report.screenshots, errors: runErrors.length, consoleErrors: consoleErrors.length, failedRequests: failedRequests.length }, null, 2));

  if (!report.ok) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
