const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const basePath = '/luyen-tieng-anh/48-ngay-lay-goc';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'foundation48-stage5-days22-28-qa-results.json');
const stage5ModulePattern = /foundation48DeepLessons\.stage5\.lazy/i;

const progressSeed = {
  schemaVersion: 1,
  days: Object.fromEntries(Array.from({ length: 21 }, (_, i) => [i + 1, {
    started: true,
    completed: i < 20,
    score: 88 + (i % 8),
    completedSteps: ['intro'],
    mistakes: [],
    updatedAt: '2026-06-08T03:00:00.000Z',
  }])),
  updatedAt: '2026-06-08T03:00:00.000Z',
};

const checks = [
  { name: 'foundation48-stage5-roadmap-desktop', route: basePath, width: 1440, height: 950, screenshot: 'foundation48-stage5-roadmap-desktop.png', expected: /48 ngày|Lộ trình|Liên từ và câu điều kiện|Ngày 28/i },
  { name: 'foundation48-stage5-roadmap-mobile', route: basePath, width: 390, height: 844, screenshot: 'foundation48-stage5-roadmap-mobile.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Liên từ/i },
  { name: 'foundation48-stage5-roadmap-mobile-375', route: basePath, width: 375, height: 812, screenshot: 'foundation48-stage5-roadmap-mobile-375.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Liên từ/i },
  { name: 'foundation48-stage5-day22-mobile', route: `${basePath}/ngay/22`, width: 390, height: 844, screenshot: 'foundation48-stage5-day22-mobile.png', expected: /Ngày 22|Động từ khuyết thiếu|I can help you|should/i, lazy: true },
  { name: 'foundation48-stage5-day23-mobile', route: `${basePath}/ngay/23`, width: 390, height: 844, screenshot: 'foundation48-stage5-day23-mobile.png', expected: /Ngày 23|Liên từ And|but I do not like coffee|because/i, lazy: true },
  { name: 'foundation48-stage5-day24-mobile', route: `${basePath}/ngay/24`, width: 375, height: 812, screenshot: 'foundation48-stage5-day24-mobile.png', expected: /Ngày 24|Liên từ chỉ thời gian|before I sleep|until/i, lazy: true },
  { name: 'foundation48-stage5-day25-mobile', route: `${basePath}/ngay/25`, width: 390, height: 844, screenshot: 'foundation48-stage5-day25-mobile.png', expected: /Ngày 25|Liên từ chỉ sự đối lập|Although it is raining|However/i, lazy: true },
  { name: 'foundation48-stage5-day26-mobile', route: `${basePath}/ngay/26`, width: 390, height: 844, screenshot: 'foundation48-stage5-day26-mobile.png', expected: /Ngày 26|Câu điều kiện loại 1|If it rains|will stay home/i, lazy: true },
  { name: 'foundation48-stage5-day27-mobile', route: `${basePath}/ngay/27`, width: 375, height: 812, screenshot: 'foundation48-stage5-day27-mobile.png', expected: /Ngày 27|Câu điều kiện loại 2|had more time|would practice/i, lazy: true },
  { name: 'foundation48-stage5-day28-mobile', route: `${basePath}/ngay/28`, width: 390, height: 844, screenshot: 'foundation48-stage5-day28-mobile.png', expected: /Ngày 28|Câu điều kiện loại 3|had known|would have called/i, lazy: true },
  { name: 'foundation48-stage5-day22-desktop', route: `${basePath}/ngay/22`, width: 1440, height: 950, screenshot: 'foundation48-stage5-day22-desktop.png', expected: /Động từ khuyết thiếu|Hôm nay bạn sẽ luyện|Từ vựng|Mini quiz/i, lazy: true, preview: true },
  { name: 'foundation48-stage5-day28-desktop', route: `${basePath}/ngay/28`, width: 1440, height: 950, screenshot: 'foundation48-stage5-day28-desktop.png', expected: /Câu điều kiện loại 3|Hôm nay bạn sẽ luyện|Nói lại|Mini quiz/i, lazy: true, preview: true },
  { name: 'foundation48-stage5-regression-day13-mobile', route: `${basePath}/ngay/13`, width: 390, height: 844, screenshot: 'foundation48-stage5-regression-day13-mobile.png', expected: /Ngày 13|Did you|Hỏi chuyện đã xảy ra/i },
  { name: 'foundation48-stage5-regression-day17-mobile', route: `${basePath}/ngay/17`, width: 390, height: 844, screenshot: 'foundation48-stage5-regression-day17-mobile.png', expected: /Ngày 17|can|can’t|can't|Tôi có thể làm/i },
  { name: 'foundation48-stage5-regression-day18-mobile', route: `${basePath}/ngay/18`, width: 390, height: 844, screenshot: 'foundation48-stage5-regression-day18-mobile.png', expected: /Ngày 18|Học ngữ âm|Listen carefully|âm cuối/i },
  { name: 'foundation48-stage5-regression-day21-mobile', route: `${basePath}/ngay/21`, width: 390, height: 844, screenshot: 'foundation48-stage5-regression-day21-mobile.png', expected: /Ngày 21|Luyện nghe số và tên|thirteen|thirty/i },
];

async function waitForStable(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => undefined);
  await page.waitForFunction(() => (document.body.innerText || '').length > 80 && !/Loading|Đang tải/i.test(document.body.innerText || ''), null, { timeout: 20000 }).catch(() => undefined);
}

async function inspectLayout(page) {
  return page.evaluate(() => {
    const vh = innerHeight;
    const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const navRect = nav ? nav.getBoundingClientRect() : null;
    const text = document.body.innerText || '';
    const mainEls = Array.from(document.querySelectorAll('main a, main button, [data-testid^="foundation48-day-card-"]'));
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
      const stage5ModuleRequests = await page.evaluate((source) => performance.getEntriesByType('resource').filter((e) => new RegExp(source, 'i').test(e.name)).map((e) => e.name), stage5ModulePattern.source).catch(() => []);
      if (check.lazy && stage5ModuleRequests.length === 0) errors.push(`${check.name}: Stage 5 lazy module request was not observed.`);
      const screenshotPath = path.join(screenshotDir, check.screenshot);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results.push({ ...check, screenshotPath, layout, stage5ModuleRequests, textSample: text.slice(0, 500) });
    } catch (e) {
      errors.push(`${check.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  await browser.close();
  const report = { ok: errors.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0, generatedAt: new Date().toISOString(), baseUrl, checks: results, errors, consoleErrors, failedRequests, stage5ModuleRequests: Array.from(new Set(results.flatMap((r) => r.stage5ModuleRequests || []))), screenshots: results.map((r) => r.screenshotPath) };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, reportPath, screenshots: report.screenshots, stage5ModuleRequests: report.stage5ModuleRequests, errors: errors.length, consoleErrors: consoleErrors.length, failedRequests: failedRequests.length }, null, 2));
  if (!report.ok) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });