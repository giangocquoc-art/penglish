const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.POO_POLISH_BASE_URL || 'http://127.0.0.1:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routes = [
  { url: '/home', file: 'poo-polish-home-desktop.png', width: 1366, height: 768, waitFor: 'P-English', checkPoo: true },
  { url: '/learning-path', file: 'poo-polish-roadmap-desktop.png', width: 1366, height: 768, waitFor: 'Lộ trình học', checkPoo: true },
  { url: '/lessons/unit-1-greetings-introduction', file: 'poo-polish-lesson-desktop.png', width: 1366, height: 768, waitFor: 'Bước học trong bài', checkPoo: true, postCheck: 'lesson' },
  { url: '/shadowing', file: 'poo-polish-shadowing-desktop.png', width: 1366, height: 768, waitFor: 'Shadowing cùng Poo', checkPoo: true, postCheck: 'shadowingDesktop' },
  { url: '/english-speed', file: 'poo-polish-speed-desktop.png', width: 1366, height: 768, waitFor: 'Chế độ phát âm nhanh', checkPoo: true },
  { url: '/home', file: 'poo-polish-home-mobile.png', width: 390, height: 844, waitFor: 'P-English', checkPoo: true, postCheck: 'mobileBottomNav' },
  { url: '/lessons/unit-1-greetings-introduction', file: 'poo-polish-lesson-mobile.png', width: 390, height: 844, waitFor: 'Bước học trong bài', checkPoo: true, postCheck: 'lessonMobile' },
  { url: '/shadowing', file: 'poo-polish-shadowing-mobile.png', width: 390, height: 844, waitFor: 'Shadowing cùng Poo', checkPoo: true, postCheck: 'shadowingMobile' },
  { url: '/english-speed', file: 'poo-polish-speed-mobile.png', width: 390, height: 844, waitFor: 'Chế độ phát âm nhanh', checkPoo: true, postCheck: 'mobileBottomNav' },
];

function isAllowedFailedRequest(url) {
  return url.includes('youtube') || url.includes('ytimg') || url.includes('googlevideo') || url.includes('favicon');
}

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
    if (isAllowedFailedRequest(url)) return;
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

    if (route.postCheck === 'lesson' || route.postCheck === 'lessonMobile') {
      for (const label of ['Tổng quan', 'Từ vựng', 'Mẫu câu', 'Luyện tập', 'Nghe / Nói', 'Quiz', 'Review']) {
        await page.getByRole('button', { name: new RegExp(label.replace('/', '\\/'), 'i') }).first().waitFor({ timeout: 5000 });
      }
      await page.getByRole('button', { name: /Tiếp tục/i }).first().waitFor({ timeout: 5000 });
      await page.getByRole('button', { name: /Quay lại/i }).first().waitFor({ timeout: 5000 });
    }

    if (route.postCheck === 'shadowingDesktop') {
      await page.getByTestId('shadowing-video-fallback').waitFor({ timeout: 9000 });
      await page.getByTestId('shadowing-video-fallback').getByRole('link', { name: /Mở trên YouTube/i }).waitFor({ timeout: 5000 });
    }

    if (route.postCheck === 'shadowingMobile') {
      await page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 9000 });
      await page.getByText('Video tham khảo', { exact: false }).first().waitFor({ timeout: 5000 });
      await page.locator('[data-testid="shadowing-lesson-picker"] summary').waitFor({ timeout: 5000 });
      await page.locator('[data-testid="shadowing-transcript-panel"] summary').waitFor({ timeout: 5000 });
      await page.locator('[data-testid="shadowing-custom-transcript"] summary').waitFor({ timeout: 5000 });
    }

    const checks = await page.evaluate((postCheck) => {
      const layer = document.querySelector('.poo-swim-layer');
      const mainPoo = document.querySelector('.poo-swim-layer__main');
      const fallback = document.querySelector('[data-testid="shadowing-video-fallback"]');
      const mobileFallback = document.querySelector('[data-testid="shadowing-video-fallback-mobile"]');
      const bottomNav = document.querySelector('[data-testid="bottom-nav"], .bottom-nav, nav[aria-label*="bottom" i]');
      const actionable = Array.from(document.querySelectorAll('button, a, input, textarea, select'));
      const viewportHeight = window.innerHeight;
      const bottomNavRect = bottomNav ? bottomNav.getBoundingClientRect() : null;
      const coveredActions = bottomNavRect
        ? actionable.filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.bottom > bottomNavRect.top && rect.top < viewportHeight;
          }).length
        : 0;
      const desktopFallbackRect = fallback ? fallback.getBoundingClientRect() : null;
      const mobileFallbackRect = mobileFallback ? mobileFallback.getBoundingClientRect() : null;
      const shadowingDetails = Array.from(document.querySelectorAll('[data-testid="shadowing-lesson-picker"], [data-testid="shadowing-transcript-panel"], [data-testid="shadowing-custom-transcript"]'));

      return {
        bodyScrollWidth: document.body.scrollWidth,
        htmlClientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
        hasPooSwimLayer: Boolean(layer),
        pooSwimLayerVisible: layer ? getComputedStyle(layer).display !== 'none' && getComputedStyle(layer).visibility !== 'hidden' : false,
        mainPooWidth: mainPoo ? mainPoo.getBoundingClientRect().width : null,
        mainPooOpacity: mainPoo ? Number.parseFloat(getComputedStyle(mainPoo).opacity || '0') : null,
        desktopFallbackHeight: desktopFallbackRect ? desktopFallbackRect.height : null,
        mobileFallbackHeight: mobileFallbackRect ? mobileFallbackRect.height : null,
        coveredActions,
        shadowingDetailsOpen: shadowingDetails.map((item) => item.hasAttribute('open')),
        postCheck,
      };
    }, route.postCheck || 'none');

    if (checks.hasHorizontalOverflow) {
      errors.push(`horizontal overflow on ${route.url} ${route.width}x${route.height}: ${JSON.stringify(checks)}`);
    }

    if (route.checkPoo && (!checks.hasPooSwimLayer || !checks.pooSwimLayerVisible)) {
      errors.push(`Poo swim layer missing/hidden on ${route.url} ${route.width}x${route.height}: ${JSON.stringify(checks)}`);
    }

    if (route.checkPoo && checks.mainPooWidth !== null) {
      const desktop = route.width >= 768;
      const min = desktop ? 90 : 56;
      const max = desktop ? 170 : 100;
      if (checks.mainPooWidth < min || checks.mainPooWidth > max) {
        errors.push(`Poo swim width out of range on ${route.url} ${route.width}x${route.height}: ${JSON.stringify(checks)}`);
      }
    }

    if (route.postCheck === 'shadowingDesktop' && checks.desktopFallbackHeight !== null && checks.desktopFallbackHeight > 270) {
      errors.push(`desktop shadowing fallback too tall: ${JSON.stringify(checks)}`);
    }

    if (route.postCheck === 'shadowingMobile' && checks.mobileFallbackHeight !== null && checks.mobileFallbackHeight > 220) {
      errors.push(`mobile shadowing fallback too tall: ${JSON.stringify(checks)}`);
    }

    if ((route.postCheck === 'mobileBottomNav' || route.postCheck === 'lessonMobile' || route.postCheck === 'shadowingMobile') && checks.coveredActions > 0) {
      errors.push(`possible bottom nav overlap on ${route.url} ${route.width}x${route.height}: ${JSON.stringify(checks)}`);
    }

    await page.screenshot({ path: path.join(outDir, route.file), fullPage: true });
  }

  await browser.close();

  if (failedRequests.length) errors.push(`failed requests:\n${failedRequests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Poo ocean polish QA passed for ${routes.length} screenshots. Saved to ${outDir}`);
})();
