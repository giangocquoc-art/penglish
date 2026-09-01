const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const basePath = '/luyen-tieng-anh/48-ngay-lay-goc';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'foundation48-stage8-days39-48-qa-results.json');
const stage8ModulePattern = /foundation48DeepLessons\.stage8\.lazy/i;

const progressSeed = {
  schemaVersion: 1,
  days: Object.fromEntries(Array.from({ length: 48 }, (_, i) => {
    const dayNumber = i + 1;
    return [dayNumber, {
      started: true,
      completed: dayNumber <= 38,
      score: 88 + (dayNumber % 8),
      completedSteps: ['intro'],
      mistakes: [],
      updatedAt: '2026-06-08T05:00:00.000Z',
    }];
  })),
  updatedAt: '2026-06-08T05:00:00.000Z',
};

const checks = [
  { name: 'foundation48-stage8-roadmap-desktop', route: basePath, width: 1440, height: 950, screenshot: 'foundation48-stage8-roadmap-desktop.png', expected: /48 ngày|Lộ trình|Tự tin giới thiệu bản thân|Ngày 48/i, roadmap: true },
  { name: 'foundation48-stage8-roadmap-mobile', route: basePath, width: 390, height: 844, screenshot: 'foundation48-stage8-roadmap-mobile.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Tự tin|Công nghệ/i, roadmap: true },
  { name: 'foundation48-stage8-roadmap-mobile-375', route: basePath, width: 375, height: 812, screenshot: 'foundation48-stage8-roadmap-mobile-375.png', expected: /48 ngày|Lộ trình|Học tiếp hôm nay|Tự tin|Công nghệ/i, roadmap: true },
  { name: 'foundation48-stage8-day39-mobile', route: `${basePath}/ngay/39`, width: 390, height: 844, screenshot: 'foundation48-stage8-day39-mobile.png', expected: /Ngày 39|quốc gia|châu lục|I am from|Vietnam|Asia/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day40-mobile', route: `${basePath}/ngay/40`, width: 390, height: 844, screenshot: 'foundation48-stage8-day40-mobile.png', expected: /Ngày 40|sở thích|I like reading|music|hobby/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day41-mobile', route: `${basePath}/ngay/41`, width: 390, height: 844, screenshot: 'foundation48-stage8-day41-mobile.png', expected: /Ngày 41|giao thông|bus|train|station/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day42-mobile', route: `${basePath}/ngay/42`, width: 390, height: 844, screenshot: 'foundation48-stage8-day42-mobile.png', expected: /Ngày 42|thể thao|football|swimming|play/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day43-mobile', route: `${basePath}/ngay/43`, width: 390, height: 844, screenshot: 'foundation48-stage8-day43-mobile.png', expected: /Ngày 43|nghề nghiệp|teacher|doctor|office/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day44-mobile', route: `${basePath}/ngay/44`, width: 390, height: 844, screenshot: 'foundation48-stage8-day44-mobile.png', expected: /Ngày 44|công nghệ|phone|email|app/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day45-mobile', route: `${basePath}/ngay/45`, width: 390, height: 844, screenshot: 'foundation48-stage8-day45-mobile.png', expected: /Ngày 45|Tiếng Anh giao tiếp 2|Could you help me|Can you say that again/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day46-mobile', route: `${basePath}/ngay/46`, width: 390, height: 844, screenshot: 'foundation48-stage8-day46-mobile.png', expected: /Ngày 46|Note-taking|keywords|short notes|important words/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day47-mobile', route: `${basePath}/ngay/47`, width: 390, height: 844, screenshot: 'foundation48-stage8-day47-mobile.png', expected: /Ngày 47|Paraphrasing|another way|I feel tired|not expensive/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day48-mobile', route: `${basePath}/ngay/48`, width: 390, height: 844, screenshot: 'foundation48-stage8-day48-mobile.png', expected: /Ngày 48|Tự tin giới thiệu bản thân|giới thiệu bản thân|Bạn đã hoàn thành lộ trình 48 ngày lấy gốc/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-stage8-day39-desktop', route: `${basePath}/ngay/39`, width: 1440, height: 950, screenshot: 'foundation48-stage8-day39-desktop.png', expected: /quốc gia|châu lục|Hôm nay bạn|Từ vựng|Mini quiz/i, lazy: true, preview: true },
  { name: 'foundation48-stage8-day48-desktop', route: `${basePath}/ngay/48`, width: 1440, height: 950, screenshot: 'foundation48-stage8-day48-desktop.png', expected: /Tự tin giới thiệu bản thân|Bạn đã hoàn thành lộ trình 48 ngày lấy gốc|Nói lại|Mini quiz/i, lazy: true, preview: true },
  { name: 'foundation48-stage8-regression-day13-mobile', route: `${basePath}/ngay/13`, width: 390, height: 844, expected: /Ngày 13|Did you|Hỏi chuyện đã xảy ra/i },
  { name: 'foundation48-stage8-regression-day17-mobile', route: `${basePath}/ngay/17`, width: 390, height: 844, expected: /Ngày 17|can|can’t|can't|Tôi có thể làm/i },
  { name: 'foundation48-stage8-regression-day18-mobile', route: `${basePath}/ngay/18`, width: 390, height: 844, expected: /Ngày 18|Học ngữ âm|Listen carefully|âm cuối/i },
  { name: 'foundation48-stage8-regression-day21-mobile', route: `${basePath}/ngay/21`, width: 390, height: 844, expected: /Ngày 21|Luyện nghe số và tên|thirteen|thirty/i },
  { name: 'foundation48-stage8-regression-day22-mobile', route: `${basePath}/ngay/22`, width: 390, height: 844, expected: /Ngày 22|Động từ khuyết thiếu|I can help you/i },
  { name: 'foundation48-stage8-regression-day28-mobile', route: `${basePath}/ngay/28`, width: 390, height: 844, screenshot: 'foundation48-stage8-regression-day28-mobile.png', expected: /Ngày 28|Câu điều kiện loại 3|had known/i },
  { name: 'foundation48-stage8-regression-day29-mobile', route: `${basePath}/ngay/29`, width: 390, height: 844, expected: /Ngày 29|Luyện nghe điền từ/i },
  { name: 'foundation48-stage8-regression-day34-mobile', route: `${basePath}/ngay/34`, width: 390, height: 844, screenshot: 'foundation48-stage8-regression-day34-mobile.png', expected: /Ngày 34|Luyện nghe về tiền bạc/i },
  { name: 'foundation48-stage8-regression-day35-mobile', route: `${basePath}/ngay/35`, width: 390, height: 844, expected: /Ngày 35|Đại từ phản thân|I made it myself/i },
  { name: 'foundation48-stage8-regression-day38-completed-mobile', route: `${basePath}/ngay/38`, width: 390, height: 844, screenshot: 'foundation48-stage8-regression-day38-completed-mobile.png', expected: /Đã lưu ngày 38|Sang ngày 39|Liên từ tương hỗ/i, completedPanel: true },
];

function isCriticalFailedRequest(request) {
  const url = request.url();
  const failure = request.failure()?.errorText || '';
  if (/favicon|\.png|\.webp|\.jpg|\.jpeg|\.svg|\.mp3|\.wav/i.test(url) && /abort|interrupted|cancel/i.test(failure)) return false;
  if (/google-analytics|googletagmanager|chrome-extension/i.test(url)) return false;
  return true;
}

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
    const mainEls = Array.from(document.querySelectorAll('main a, main button, [data-testid^="foundation48-day-card-"], [data-testid^="foundation48-review-card"], [data-testid="foundation48-roadmap"], [data-testid="foundation48-completion-panel"]'));
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
        return r.width > 0 && r.height > 0 && r.top < vh && r.bottom > 0 && /Học tiếp|Tiếp tục|Bắt đầu|Hoàn thành|Ngày\s+\d+|Về lộ trình|Luyện|Sang ngày/i.test(el.textContent || '');
      }),
      bottomNavVisible: Boolean(navRect && navRect.width > 0 && navRect.height > 0),
      bottomNavOverlap,
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
      introPreviewVisible: Boolean(document.querySelector('[data-testid="foundation48-intro-preview"]')),
      mobileIntroPreviewVisible: Boolean(document.querySelector('[data-testid="foundation48-mobile-intro-preview"]')),
      compactPreviewTextVisible: /6 Từ vựng\s*·\s*3 Mẫu câu\s*·\s*5 Nghe\s*·\s*5 Nói lại\s*·\s*9 Mini quiz/i.test(text),
      completionPanelVisible: Boolean(document.querySelector('[data-testid="foundation48-completion-panel"]')),
    };
  });
}

(async () => {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript((state) => localStorage.setItem('penglish-foundation48-progress-v1', JSON.stringify(state)), progressSeed);

  const errors = [];
  const consoleErrors = [];
  const failedRequests = [];
  const results = [];

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
      if (check.mobilePreview && !layout.compactPreviewTextVisible) errors.push(`${check.name}: requested mobile compact preview counts not visible.`);
      if (check.completedPanel && !layout.completionPanelVisible) errors.push(`${check.name}: completed-day saved card not visible.`);

      const stage8ModuleRequests = await page.evaluate((source) => performance.getEntriesByType('resource').filter((e) => new RegExp(source, 'i').test(e.name)).map((e) => e.name), stage8ModulePattern.source).catch(() => []);
      if (check.lazy && stage8ModuleRequests.length === 0) errors.push(`${check.name}: Stage 8 lazy module request was not observed.`);

      const screenshotPath = check.screenshot ? path.join(screenshotDir, check.screenshot) : undefined;
      if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true });
      results.push({ ...check, screenshotPath, layout, stage8ModuleRequests, textSample: text.slice(0, 500) });
    } catch (e) {
      errors.push(`${check.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  await browser.close();
  const report = {
    ok: errors.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0,
    generatedAt: new Date().toISOString(),
    baseUrl,
    checks: results,
    errors,
    consoleErrors,
    failedRequests,
    stage8ModuleRequests: Array.from(new Set(results.flatMap((r) => r.stage8ModuleRequests || []))),
    screenshots: results.map((r) => r.screenshotPath).filter(Boolean),
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, reportPath, screenshots: report.screenshots, stage8ModuleRequests: report.stage8ModuleRequests, errors: errors.length, consoleErrors: consoleErrors.length, failedRequests: failedRequests.length }, null, 2));
  if (!report.ok) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });