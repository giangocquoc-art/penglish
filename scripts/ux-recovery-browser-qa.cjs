const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.UX_RECOVERY_BASE_URL || 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routes = [
  { url: '/home', file: 'ux-recovery-home.png', width: 1366, height: 768, waitFor: 'P-English', checkPoo: true },
  { url: '/learning-path', file: 'ux-recovery-roadmap.png', width: 1366, height: 768, waitFor: 'Lộ trình học', checkPoo: true },
  { url: '/lessons/unit-1-greetings-introduction', file: 'ux-recovery-sample-lesson-tabs.png', width: 1366, height: 768, waitFor: 'Bước học trong bài', checkPoo: true, postCheck: 'lessonTabs' },
  { url: '/shadowing', file: 'ux-recovery-shadowing-video-fallback.png', width: 1366, height: 768, waitFor: 'Shadowing cùng Poo', checkPoo: true, postCheck: 'shadowingFallback' },
  { url: '/english-speed', file: 'ux-recovery-english-speed.png', width: 1366, height: 768, waitFor: 'Chế độ phát âm nhanh', checkPoo: true },
  { url: '/home', file: 'ux-recovery-mobile-home.png', width: 390, height: 844, waitFor: 'P-English', checkPoo: true },
  { url: '/lessons/unit-1-greetings-introduction', file: 'ux-recovery-mobile-lesson.png', width: 390, height: 844, waitFor: 'Bước học trong bài', checkPoo: true, postCheck: 'lessonTabs' },
  { url: '/shadowing', file: 'ux-recovery-mobile-shadowing.png', width: 390, height: 844, waitFor: 'Shadowing cùng Poo', checkPoo: true, postCheck: 'shadowingFallback' },
];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });

  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));

  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('youtube') || url.includes('ytimg') || url.includes('googlevideo')) return;
    failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  for (const route of routes) {
    await page.setViewportSize({ width: route.width, height: route.height });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(
      (text) => document.body.innerText.includes(text),
      route.waitFor,
      { timeout: 20000 },
    );

    if (route.postCheck === 'shadowingFallback') {
      await page.getByTestId('shadowing-video-fallback').waitFor({ timeout: 9000 });
      await page.getByText('Mở trên YouTube', { exact: false }).first().waitFor({ timeout: 5000 });
    }

    if (route.postCheck === 'lessonTabs') {
      for (const label of ['Tổng quan', 'Từ vựng', 'Mẫu câu', 'Luyện tập', 'Nghe / Nói', 'Quiz', 'Review']) {
        await page.getByRole('button', { name: new RegExp(label.replace('/', '\\/'), 'i') }).first().waitFor({ timeout: 5000 });
      }
    }

    const checks = await page.evaluate(() => {
      const layer = document.querySelector('.poo-swim-layer');
      const fallback = document.querySelector('[data-testid="shadowing-video-fallback"]');
      return {
        bodyScrollWidth: document.body.scrollWidth,
        htmlClientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
        hasPooSwimLayer: Boolean(layer),
        pooSwimLayerVisible: layer ? getComputedStyle(layer).display !== 'none' && getComputedStyle(layer).visibility !== 'hidden' : false,
        hasShadowingFallback: Boolean(fallback),
      };
    });

    if (checks.hasHorizontalOverflow) {
      errors.push(`horizontal overflow on ${route.url} ${route.width}x${route.height}: ${JSON.stringify(checks)}`);
    }

    if (route.checkPoo && (!checks.hasPooSwimLayer || !checks.pooSwimLayerVisible)) {
      errors.push(`Poo swim layer missing/hidden on ${route.url} ${route.width}x${route.height}: ${JSON.stringify(checks)}`);
    }

    await page.screenshot({ path: path.join(outDir, route.file), fullPage: true });
  }

  await browser.close();

  const filteredFailedRequests = failedRequests.filter((item) => !item.includes('favicon'));
  if (filteredFailedRequests.length) errors.push(`failed requests:\n${filteredFailedRequests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`UX recovery QA passed for ${routes.length} screenshots. Saved to ${outDir}`);
})();
