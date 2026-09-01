const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const basePath = '/luyen-tieng-anh/48-ngay-lay-goc';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'foundation48-release-qa-results.json');
const lazyStagePattern = /foundation48DeepLessons\.stage[3-8]\.lazy/i;

const completedDays = new Set([13, 17, 22, 28, 34, 38, 48]);
const progressSeed = {
  schemaVersion: 1,
  days: Object.fromEntries(Array.from({ length: 48 }, (_, i) => {
    const dayNumber = i + 1;
    return [dayNumber, {
      started: true,
      completed: completedDays.has(dayNumber),
      score: 90,
      completedSteps: ['intro', 'complete'],
      mistakes: [],
      updatedAt: '2026-06-08T06:00:00.000Z',
    }];
  })),
  lastDayOpened: 39,
  streak: 7,
  lastStudiedDate: new Date().toISOString().slice(0, 10),
};

const checks = [
  { name: 'foundation48-release-roadmap-desktop', route: basePath, width: 1440, height: 950, screenshot: 'foundation48-release-roadmap-desktop.png', expected: /48 ngày|Học tiếp hôm nay|48|Tự tin giới thiệu bản thân/i, roadmap: true },
  { name: 'foundation48-release-roadmap-mobile', route: basePath, width: 390, height: 844, screenshot: 'foundation48-release-roadmap-mobile.png', expected: /48 ngày|Học tiếp hôm nay|Chặng/i, roadmap: true },
  { name: 'foundation48-release-roadmap-mobile-375', route: basePath, width: 375, height: 812, screenshot: 'foundation48-release-roadmap-mobile-375.png', expected: /48 ngày|Học tiếp hôm nay|Chặng/i, roadmap: true },
  { name: 'foundation48-release-roadmap-desktop-1366', route: basePath, width: 1366, height: 768, expected: /48 ngày|Học tiếp hôm nay|Tiến độ/i, roadmap: true },
  { name: 'foundation48-release-day1-mobile', route: `${basePath}/ngay/1`, width: 390, height: 844, screenshot: 'foundation48-release-day1-mobile.png', expected: /Ngày 1|Tôi là ai|to be|Quay lại/i },
  { name: 'foundation48-release-day9-mobile', route: `${basePath}/ngay/9`, width: 390, height: 844, expected: /Ngày 9|Chặng 3|Tiến độ/i, mobilePreview: true },
  { name: 'foundation48-release-day13-mobile', route: `${basePath}/ngay/13`, width: 390, height: 844, screenshot: 'foundation48-release-day13-mobile.png', expected: /Ngày 13|Did you|Đã lưu ngày 13|Sang ngày 14/i, lazy: true, completedPanel: true },
  { name: 'foundation48-release-day17-mobile', route: `${basePath}/ngay/17`, width: 390, height: 844, expected: /Ngày 17|can|Đã lưu ngày 17|Sang ngày 18/i, lazy: true, completedPanel: true },
  { name: 'foundation48-release-day18-mobile', route: `${basePath}/ngay/18`, width: 390, height: 844, expected: /Ngày 18|ngữ âm|Listen carefully/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-release-day21-mobile', route: `${basePath}/ngay/21`, width: 390, height: 844, expected: /Ngày 21|số và tên|thirteen|thirty/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-release-day22-completed-mobile', route: `${basePath}/ngay/22`, width: 390, height: 844, screenshot: 'foundation48-release-day22-completed-mobile.png', expected: /Ngày 22|Động từ khuyết thiếu|Đã lưu ngày 22|Sang ngày 23/i, lazy: true, completedPanel: true },
  { name: 'foundation48-release-day28-mobile', route: `${basePath}/ngay/28`, width: 390, height: 844, screenshot: 'foundation48-release-day28-mobile.png', expected: /Ngày 28|Câu điều kiện loại 3|Đã lưu ngày 28|Sang ngày 29/i, lazy: true, completedPanel: true },
  { name: 'foundation48-release-day29-mobile', route: `${basePath}/ngay/29`, width: 390, height: 844, expected: /Ngày 29|Luyện nghe điền từ|get up|seven/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-release-day34-mobile', route: `${basePath}/ngay/34`, width: 390, height: 844, screenshot: 'foundation48-release-day34-mobile.png', expected: /Ngày 34|tiền bạc|Đã lưu ngày 34|Sang ngày 35/i, lazy: true, completedPanel: true },
  { name: 'foundation48-release-day35-mobile', route: `${basePath}/ngay/35`, width: 390, height: 844, expected: /Ngày 35|Đại từ phản thân|myself/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-release-day38-mobile', route: `${basePath}/ngay/38`, width: 390, height: 844, screenshot: 'foundation48-release-day38-mobile.png', expected: /Ngày 38|Liên từ tương hỗ|Đã lưu ngày 38|Sang ngày 39/i, lazy: true, completedPanel: true },
  { name: 'foundation48-release-day39-mobile', route: `${basePath}/ngay/39`, width: 390, height: 844, expected: /Ngày 39|quốc gia|Vietnam|Asia/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-release-day45-mobile', route: `${basePath}/ngay/45`, width: 390, height: 844, screenshot: 'foundation48-release-day45-mobile.png', expected: /Ngày 45|Tiếng Anh giao tiếp 2|Could you help me/i, lazy: true, mobilePreview: true },
  { name: 'foundation48-release-day48-mobile', route: `${basePath}/ngay/48`, width: 390, height: 844, screenshot: 'foundation48-release-day48-mobile.png', expected: /Ngày 48|Đã hoàn thành 48\/48 ngày|Shadowing|English Speed|Ôn từ vựng/i, lazy: true, mobilePreview: true, completedPanel: true, finalDay: true },
  { name: 'foundation48-release-day48-desktop', route: `${basePath}/ngay/48`, width: 1440, height: 950, screenshot: 'foundation48-release-day48-desktop.png', expected: /Tự tin giới thiệu bản thân|Đã hoàn thành 48\/48 ngày|Shadowing|English Speed/i, lazy: true, preview: true, completedPanel: true, finalDay: true },
  { name: 'foundation48-release-day48-desktop-1366', route: `${basePath}/ngay/48`, width: 1366, height: 768, expected: /Tự tin giới thiệu bản thân|Đã hoàn thành 48\/48 ngày/i, lazy: true, preview: true, completedPanel: true, finalDay: true },
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
    const critical = Array.from(document.querySelectorAll('[data-testid="foundation48-completion-panel"] a, [data-testid="foundation48-completion-panel"] button, [data-testid="foundation48-mobile-continue-card"] a, [data-testid="foundation48-mobile-continue-card"] button, [data-testid="foundation48-complete-day"]'));
    const bottomNavOverlap = navRect ? critical.some((el) => {
      if (nav.contains(el)) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < navRect.top && r.bottom > navRect.top + 2;
    }) : false;
    return {
      titleVisible: /Ngày\s+\d+|48 ngày|Lộ trình/i.test(text),
      progressVisible: /tiến độ|hoàn thành|Học tiếp|Bước\s+\d+\/\d+|Đầy đủ|48\/48/i.test(text),
      ctaVisible: Array.from(document.querySelectorAll('a,button')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.top < vh && r.bottom > 0 && /Học tiếp|Tiếp tục|Hoàn thành|Ngày\s+\d+|Về lộ trình|Sang ngày|Shadowing|English Speed|Ôn/i.test(el.textContent || '');
      }),
      bottomNavVisible: Boolean(navRect && navRect.width > 0 && navRect.height > 0),
      bottomNavOverlap,
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
      introPreviewVisible: Boolean(document.querySelector('[data-testid="foundation48-intro-preview"]')),
      mobileIntroPreviewVisible: Boolean(document.querySelector('[data-testid="foundation48-mobile-intro-preview"]')),
      compactPreviewTextVisible: /\d+ Từ vựng\s*·\s*\d+ Mẫu câu\s*·\s*\d+ Nghe\s*·\s*\d+ Nói lại\s*·\s*\d+ Mini quiz/i.test(text),
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
      if (check.completedPanel && check.width < 768) {
        await page.locator('[data-testid="foundation48-completion-panel"]').scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => undefined);
      }
      const text = await page.locator('body').innerText({ timeout: 20000 });
      if (!check.expected.test(text)) errors.push(`${check.name}: expected text was not visible.`);
      const layout = await inspectLayout(page);
      if (!layout.titleVisible) errors.push(`${check.name}: title not visible.`);
      if (!layout.progressVisible) errors.push(`${check.name}: progress/status not visible.`);
      if (!layout.ctaVisible) errors.push(`${check.name}: CTA not visible.`);
      if (check.width < 768 && !layout.bottomNavVisible) errors.push(`${check.name}: mobile bottom nav not visible.`);
      if (check.width < 768 && layout.bottomNavOverlap) errors.push(`${check.name}: mobile bottom nav overlaps critical content.`);
      if (layout.hasHorizontalOverflow) errors.push(`${check.name}: horizontal overflow detected.`);
      if (check.preview && !layout.introPreviewVisible) errors.push(`${check.name}: desktop intro preview not visible.`);
      if (check.mobilePreview && !layout.mobileIntroPreviewVisible) errors.push(`${check.name}: mobile compact preview not visible.`);
      if (check.mobilePreview && !layout.compactPreviewTextVisible) errors.push(`${check.name}: mobile compact preview counts not visible.`);
      if (check.completedPanel && !layout.completionPanelVisible) errors.push(`${check.name}: completed-day saved card not visible.`);
      if (check.finalDay && !/Bạn đã hoàn thành lộ trình 48 ngày lấy gốc/i.test(text)) errors.push(`${check.name}: final completion message missing.`);

      const lazyModuleRequests = await page.evaluate((source) => performance.getEntriesByType('resource').filter((e) => new RegExp(source, 'i').test(e.name)).map((e) => e.name), lazyStagePattern.source).catch(() => []);
      if (check.lazy && lazyModuleRequests.length === 0) errors.push(`${check.name}: lazy stage module request was not observed.`);

      const screenshotPath = check.screenshot ? path.join(screenshotDir, check.screenshot) : undefined;
      if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true });
      results.push({ ...check, screenshotPath, layout, lazyModuleRequests, textSample: text.slice(0, 600) });
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
    lazyModuleRequests: Array.from(new Set(results.flatMap((r) => r.lazyModuleRequests || []))),
    screenshots: results.map((r) => r.screenshotPath).filter(Boolean),
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, reportPath, screenshots: report.screenshots, lazyModuleRequests: report.lazyModuleRequests, errors: errors.length, consoleErrors: consoleErrors.length, failedRequests: failedRequests.length }, null, 2));
  if (!report.ok) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });