const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const basePath = '/luyen-tieng-anh/48-ngay-lay-goc';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'foundation48-stage7-days35-38-qa-results.json');
const stage7ModulePattern = /foundation48DeepLessons\.stage7\.lazy/i;

const progressSeed = {
  schemaVersion: 1,
  days: Object.fromEntries(Array.from({ length: 38 }, (_, i) => [i + 1, {
    started: true,
    completed: i < 34 || [12, 16, 17, 20, 21, 27].includes(i),
    score: 88 + (i % 8),
    completedSteps: ['intro'],
    mistakes: [],
    updatedAt: '2026-06-08T04:00:00.000Z',
  }])),
  updatedAt: '2026-06-08T04:00:00.000Z',
};

const checks = [
  { name: 'foundation48-stage7-roadmap-desktop', route: basePath, width: 1440, height: 950, screenshot: 'foundation48-stage7-roadmap-desktop.png', expected: /48 ngày|Lộ trình|Củng cố ngữ pháp và giao tiếp|Ngày 38/i },
  { name: 'foundation48-stage7-roadmap-mobile', route: basePath, width: 390, height: 844, screenshot: 'foundation48-stage7-roadmap-mobile.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Củng cố|Đại từ phản thân/i, roadmap: true },
  { name: 'foundation48-stage7-roadmap-mobile-375', route: basePath, width: 375, height: 812, screenshot: 'foundation48-stage7-roadmap-mobile-375.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Củng cố|Đại từ phản thân/i, roadmap: true },
  { name: 'foundation48-stage7-day35-mobile', route: `${basePath}/ngay/35`, width: 390, height: 844, screenshot: 'foundation48-stage7-day35-mobile.png', expected: /Ngày 35|Đại từ phản thân|I made it myself|herself/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage7-day36-mobile', route: `${basePath}/ngay/36`, width: 390, height: 844, screenshot: 'foundation48-stage7-day36-mobile.png', expected: /Ngày 36|Sự hòa hợp về thì|He says he is tired|He said he was tired/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage7-day37-mobile', route: `${basePath}/ngay/37`, width: 390, height: 844, screenshot: 'foundation48-stage7-day37-mobile.png', expected: /Ngày 37|Tiếng Anh giao tiếp 1|Can you help me|Could you repeat/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage7-day38-mobile', route: `${basePath}/ngay/38`, width: 390, height: 844, screenshot: 'foundation48-stage7-day38-mobile.png', expected: /Ngày 38|Liên từ tương hỗ|Both Lan and Nam|either tea or coffee/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage7-day35-desktop', route: `${basePath}/ngay/35`, width: 1440, height: 950, screenshot: 'foundation48-stage7-day35-desktop.png', expected: /Đại từ phản thân|Hôm nay bạn sẽ luyện|Từ vựng|Mini quiz/i, lazy: true, preview: true },
  { name: 'foundation48-stage7-day38-desktop', route: `${basePath}/ngay/38`, width: 1440, height: 950, screenshot: 'foundation48-stage7-day38-desktop.png', expected: /Liên từ tương hỗ|Hôm nay bạn sẽ luyện|Nói lại|Mini quiz/i, lazy: true, preview: true },
  { name: 'foundation48-stage7-regression-day13-mobile', route: `${basePath}/ngay/13`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day13-mobile.png', expected: /Ngày 13|Did you|Hỏi chuyện đã xảy ra/i },
  { name: 'foundation48-stage7-regression-day17-mobile', route: `${basePath}/ngay/17`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day17-mobile.png', expected: /Ngày 17|can|can’t|can't|Tôi có thể làm/i },
  { name: 'foundation48-stage7-regression-day18-mobile', route: `${basePath}/ngay/18`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day18-mobile.png', expected: /Ngày 18|Học ngữ âm|Listen carefully|âm cuối/i },
  { name: 'foundation48-stage7-regression-day21-mobile', route: `${basePath}/ngay/21`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day21-mobile.png', expected: /Ngày 21|Luyện nghe số và tên|thirteen|thirty/i },
  { name: 'foundation48-stage7-regression-day22-mobile', route: `${basePath}/ngay/22`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day22-mobile.png', expected: /Ngày 22|Động từ khuyết thiếu|I can help you/i },
  { name: 'foundation48-stage7-regression-day28-mobile', route: `${basePath}/ngay/28`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day28-mobile.png', expected: /Ngày 28|Câu điều kiện loại 3|had known/i },
  { name: 'foundation48-stage7-regression-day22-completed-mobile', route: `${basePath}/ngay/22`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day22-completed-mobile.png', expected: /Đã lưu ngày 22|Sang ngày 23/i, completedPanel: true },
  { name: 'foundation48-stage7-regression-day29-mobile', route: `${basePath}/ngay/29`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day29-mobile.png', expected: /Ngày 29|Luyện nghe điền từ/i },
  { name: 'foundation48-stage7-regression-day34-mobile', route: `${basePath}/ngay/34`, width: 390, height: 844, screenshot: 'foundation48-stage7-regression-day34-mobile.png', expected: /Ngày 34|Luyện nghe về tiền bạc/i },
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
      const stage7ModuleRequests = await page.evaluate((source) => performance.getEntriesByType('resource').filter((e) => new RegExp(source, 'i').test(e.name)).map((e) => e.name), stage7ModulePattern.source).catch(() => []);
      if (check.lazy && stage7ModuleRequests.length === 0) errors.push(`${check.name}: Stage 7 lazy module request was not observed.`);
      const screenshotPath = path.join(screenshotDir, check.screenshot);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results.push({ ...check, screenshotPath, layout, stage7ModuleRequests, textSample: text.slice(0, 500) });
    } catch (e) {
      errors.push(`${check.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  await browser.close();
  const report = { ok: errors.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0, generatedAt: new Date().toISOString(), baseUrl, checks: results, errors, consoleErrors, failedRequests, stage7ModuleRequests: Array.from(new Set(results.flatMap((r) => r.stage7ModuleRequests || []))), screenshots: results.map((r) => r.screenshotPath) };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, reportPath, screenshots: report.screenshots, stage7ModuleRequests: report.stage7ModuleRequests, errors: errors.length, consoleErrors: consoleErrors.length, failedRequests: failedRequests.length }, null, 2));
  if (!report.ok) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
