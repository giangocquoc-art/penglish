const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const basePath = '/luyen-tieng-anh/48-ngay-lay-goc';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'foundation48-stage6-days29-34-qa-results.json');
const stage6ModulePattern = /foundation48DeepLessons\.stage6\.lazy/i;

const progressSeed = {
  schemaVersion: 1,
  days: Object.fromEntries(Array.from({ length: 28 }, (_, i) => [i + 1, {
    started: true,
    completed: i < 27,
    score: 88 + (i % 8),
    completedSteps: ['intro'],
    mistakes: [],
    updatedAt: '2026-06-08T04:00:00.000Z',
  }])),
  updatedAt: '2026-06-08T04:00:00.000Z',
};

const checks = [
  { name: 'foundation48-stage6-roadmap-desktop', route: basePath, width: 1440, height: 950, screenshot: 'foundation48-stage6-roadmap-desktop.png', expected: /48 ngày|Lộ trình|Luyện nghe nền tảng|Ngày 34/i },
  { name: 'foundation48-stage6-roadmap-mobile', route: basePath, width: 390, height: 844, screenshot: 'foundation48-stage6-roadmap-mobile.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Luyện nghe/i, roadmap: true },
  { name: 'foundation48-stage6-roadmap-mobile-375', route: basePath, width: 375, height: 812, screenshot: 'foundation48-stage6-roadmap-mobile-375.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Luyện nghe/i, roadmap: true },
  { name: 'foundation48-stage6-day29-mobile', route: `${basePath}/ngay/29`, width: 390, height: 844, screenshot: 'foundation48-stage6-day29-mobile.png', expected: /Ngày 29|Luyện nghe điền từ|I get up at seven|từ còn thiếu/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage6-day30-mobile', route: `${basePath}/ngay/30`, width: 390, height: 844, screenshot: 'foundation48-stage6-day30-mobile.png', expected: /Ngày 30|Luyện nghe chép chính tả|Thank you|See you soon/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage6-day31-mobile', route: `${basePath}/ngay/31`, width: 390, height: 844, screenshot: 'foundation48-stage6-day31-mobile.png', expected: /Ngày 31|Luyện nghe về giờ|seven|eight thirty/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage6-day32-mobile', route: `${basePath}/ngay/32`, width: 390, height: 844, screenshot: 'foundation48-stage6-day32-mobile.png', expected: /Ngày 32|Luyện nghe ngày tháng|Monday|June/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage6-day33-mobile', route: `${basePath}/ngay/33`, width: 390, height: 844, screenshot: 'foundation48-stage6-day33-mobile.png', expected: /Ngày 33|Luyện nghe địa điểm|bus station|supermarket/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage6-day34-mobile', route: `${basePath}/ngay/34`, width: 390, height: 844, screenshot: 'foundation48-stage6-day34-mobile.png', expected: /Ngày 34|Luyện nghe về tiền bạc|five dollars|twenty thousand dong/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage6-day29-desktop', route: `${basePath}/ngay/29`, width: 1440, height: 950, screenshot: 'foundation48-stage6-day29-desktop.png', expected: /Luyện nghe điền từ|Hôm nay bạn sẽ luyện|Từ vựng|Mini quiz/i, lazy: true, preview: true },
  { name: 'foundation48-stage6-day34-desktop', route: `${basePath}/ngay/34`, width: 1440, height: 950, screenshot: 'foundation48-stage6-day34-desktop.png', expected: /Luyện nghe về tiền bạc|Hôm nay bạn sẽ luyện|Nói lại|Mini quiz/i, lazy: true, preview: true },
  { name: 'foundation48-stage6-regression-day13-mobile', route: `${basePath}/ngay/13`, width: 390, height: 844, screenshot: 'foundation48-stage6-regression-day13-mobile.png', expected: /Ngày 13|Did you|Hỏi chuyện đã xảy ra/i },
  { name: 'foundation48-stage6-regression-day17-mobile', route: `${basePath}/ngay/17`, width: 390, height: 844, screenshot: 'foundation48-stage6-regression-day17-mobile.png', expected: /Ngày 17|can|can’t|can't|Tôi có thể làm/i },
  { name: 'foundation48-stage6-regression-day18-mobile', route: `${basePath}/ngay/18`, width: 390, height: 844, screenshot: 'foundation48-stage6-regression-day18-mobile.png', expected: /Ngày 18|Học ngữ âm|Listen carefully|âm cuối/i },
  { name: 'foundation48-stage6-regression-day21-mobile', route: `${basePath}/ngay/21`, width: 390, height: 844, screenshot: 'foundation48-stage6-regression-day21-mobile.png', expected: /Ngày 21|Luyện nghe số và tên|thirteen|thirty/i },
  { name: 'foundation48-stage6-regression-day22-mobile', route: `${basePath}/ngay/22`, width: 390, height: 844, screenshot: 'foundation48-stage6-regression-day22-mobile.png', expected: /Ngày 22|Động từ khuyết thiếu|I can help you/i },
  { name: 'foundation48-stage6-regression-day28-mobile', route: `${basePath}/ngay/28`, width: 390, height: 844, screenshot: 'foundation48-stage6-regression-day28-mobile.png', expected: /Ngày 28|Câu điều kiện loại 3|had known/i },
];

async function waitForStable(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => undefined);
  await page.waitForFunction(() => {
    const text = document.body.innerText || '';
    return text.length > 120 && /48 ngày|Lộ trình|Ngày\s+\d+/i.test(text) && !/Loading|Đang tải|Đang mở vùng học/i.test(text);
  }, null, { timeout: 45000 });
}

async function inspectLayout(page) {
  return page.evaluate(() => {
    const vh = innerHeight;
    const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const navRect = nav ? nav.getBoundingClientRect() : null;
    const text = document.body.innerText || '';
    const mainEls = Array.from(document.querySelectorAll('main a, main button, [data-testid^="foundation48-day-card-"], [data-testid^="foundation48-review-card"], [data-testid="foundation48-roadmap"]'));
    const bottomNavOverlap = navRect ? mainEls.some((el) => {
      if (nav.contains(el)) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > navRect.top + 2 && r.top < vh;
    }) : false;
    return {
      titleVisible: /Ngày\s+\d+|48 ngày|Lộ trình/i.test(text),
      progressVisible: /tiến độ|hoàn thành|Học tiếp|Bước\s+\d+\/\d+|Đầy đủ/i.test(text),
      ctaVisible: Array.from(document.querySelectorAll('a,button')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.top < vh && r.bottom > 0 && /Học tiếp|Tiếp tục|Bắt đầu|Hoàn thành|Ngày\s+\d+|Về lộ trình|Luyện/i.test(el.textContent || '');
      }),
      bottomNavVisible: Boolean(navRect && navRect.width > 0 && navRect.height > 0),
      bottomNavOverlap,
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
      introPreviewVisible: Boolean(document.querySelector('[data-testid="foundation48-intro-preview"]')),
      mobileIntroPreviewVisible: Boolean(document.querySelector('[data-testid="foundation48-mobile-intro-preview"]')),
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

(async () => {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript((state) => localStorage.setItem('penglish-foundation48-progress-v1', JSON.stringify(state)), progressSeed);
  const errors = [], consoleErrors = [], failedRequests = [], results = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push({ text: m.text(), location: m.location() }); });
  page.on('pageerror', (e) => consoleErrors.push({ text: e.message, stack: e.stack }));
  page.on('requestfailed', (r) => { if (isCriticalFailedRequest(r)) failedRequests.push({ url: r.url(), failure: r.failure()?.errorText }); });

  for (const check of checks) {
    try {
      await page.setViewportSize({ width: check.width, height: check.height });
      await page.goto(new URL(check.route, baseUrl).toString(), { waitUntil: 'domcontentloaded', timeout: 45000 });
      await waitForStable(page);
      const text = await page.locator('body').innerText({ timeout: 20000 });
      if (!check.expected.test(text)) errors.push(`${check.name}: expected text was not visible.`);
      const layout = await inspectLayout(page);
      if (!layout.titleVisible) errors.push(`${check.name}: title not visible.`);
      if (!layout.progressVisible) errors.push(`${check.name}: progress/status not visible.`);
      if (!layout.ctaVisible) errors.push(`${check.name}: CTA not visible.`);
      if (check.width < 768 && !layout.bottomNavVisible) errors.push(`${check.name}: mobile bottom nav not visible.`);
      if (check.width < 768 && layout.bottomNavOverlap) errors.push(`${check.name}: mobile bottom nav overlaps content.`);
      if (layout.hasHorizontalOverflow) errors.push(`${check.name}: horizontal overflow detected.`);
      if (check.preview && !layout.introPreviewVisible) errors.push(`${check.name}: desktop intro preview not visible.`);
      if (check.mobilePreview && !layout.mobileIntroPreviewVisible) errors.push(`${check.name}: mobile compact intro preview not visible.`);
      const stage6ModuleRequests = await page.evaluate((source) => performance.getEntriesByType('resource').filter((e) => new RegExp(source, 'i').test(e.name)).map((e) => e.name), stage6ModulePattern.source).catch(() => []);
      if (check.lazy && stage6ModuleRequests.length === 0) errors.push(`${check.name}: Stage 6 lazy module request was not observed.`);
      const screenshotPath = path.join(screenshotDir, check.screenshot);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results.push({ ...check, screenshotPath, layout, stage6ModuleRequests, textSample: text.slice(0, 500) });
    } catch (e) {
      errors.push(`${check.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  await browser.close();
  const report = { ok: errors.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0, generatedAt: new Date().toISOString(), baseUrl, checks: results, errors, consoleErrors, failedRequests, stage6ModuleRequests: Array.from(new Set(results.flatMap((r) => r.stage6ModuleRequests || []))), screenshots: results.map((r) => r.screenshotPath) };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, reportPath, screenshots: report.screenshots, stage6ModuleRequests: report.stage6ModuleRequests, errors: errors.length, consoleErrors: consoleErrors.length, failedRequests: failedRequests.length }, null, 2));
  if (!report.ok) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });