const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routes = [
  { name: 'landing', path: '/', shell: false, expectedPreset: null },
  { name: 'home', path: '/home', shell: true, expectedPreset: 'dashboard' },
  { name: 'learning-path', path: '/learning-path', shell: true, expectedPreset: 'roadmap' },
  { name: 'lesson-unit-1', path: '/lessons/unit-1-greetings-introduction', shell: true, expectedPreset: 'lesson' },
  { name: 'english-speed', path: '/english-speed', shell: true, expectedPreset: 'speed' },
  { name: 'shadowing', path: '/shadowing', shell: true, expectedPreset: 'shadowing' },
  { name: 'vocab', path: '/words', shell: true, expectedPreset: 'vocabulary', waitMs: 6000 },
];

const viewports = [
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'mobile-390', width: 390, height: 844 },
];

async function inspectPage(page, route, viewport) {
  const waitMs = route.waitMs ?? 1400;
  await page.waitForTimeout(waitMs);

  return page.evaluate(({ route, viewport }) => {
    const whale = document.querySelector('[data-testid="ambient-poo-whale"]');
    const whaleImage = whale?.querySelector('img');
    const swimmer = whale?.querySelector('.ambient-poo-whale__swimmer');
    const bottomNav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const safeTargets = Array.from(document.querySelectorAll('button, a, [data-bottom-nav-safe-target="true"]'));
    const navRect = bottomNav?.getBoundingClientRect();
    const visibleTargets = safeTargets
      .map((element) => {
        if (element.closest('[data-testid="mobile-bottom-nav"]')) return null;

        const rect = element.getBoundingClientRect();
        return {
          text: element.textContent?.trim().slice(0, 80) || element.getAttribute('aria-label') || element.tagName,
          bottom: rect.bottom,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        };
      })
      .filter(Boolean)
      .filter((rect) => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight);

    const navOverlapTargets = navRect
      ? visibleTargets.filter((rect) => rect.bottom > navRect.top + 4 && rect.top < navRect.bottom && rect.right > navRect.left && rect.left < navRect.right)
      : [];

    const imageLoaded = whaleImage instanceof HTMLImageElement && whaleImage.complete && whaleImage.naturalWidth > 0;
    const swimmerStyle = swimmer ? window.getComputedStyle(swimmer) : null;
    const whaleStyle = whale ? window.getComputedStyle(whale) : null;

    return {
      path: route.path,
      viewport: viewport.name,
      whalePresent: Boolean(whale),
      whalePointerEvents: whaleStyle?.pointerEvents ?? null,
      preset: whale?.getAttribute('data-ambient-whale-preset') ?? null,
      debugPoo: whale?.getAttribute('data-debug-poo') ?? null,
      swimmerDisplay: swimmerStyle?.display ?? null,
      swimmerOpacity: swimmerStyle?.opacity ?? null,
      frameLoaded: imageLoaded && whaleImage.currentSrc.includes('/ocean/ambient-whale/frames/frame-'),
      bottomNavPresent: Boolean(bottomNav),
      bottomNavOverlapCount: navOverlapTargets.length,
      bottomNavOverlapTargets: navOverlapTargets.slice(0, 5),
      scrollPaddingBottom: window.getComputedStyle(document.documentElement).scrollPaddingBottom,
      bodyTextLength: document.body.innerText.length,
    };
  }, { route, viewport });
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const consoleMessages = [];
    const failedRequests = [];

    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        consoleMessages.push(`${message.type()}: ${message.text()}`);
      }
    });

    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim());
    });

    for (const route of routes) {
      const url = `${baseUrl}${route.path}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch((error) => {
        results.push({ route: route.path, viewport: viewport.name, error: error.message });
        return null;
      });

      if (!response) continue;

      const inspection = await inspectPage(page, route, viewport);
      const screenshotPath = path.join(outputDir, `ambient-poo-whale-polish-${route.name}-${viewport.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      results.push({
        route: route.path,
        viewport: viewport.name,
        status: response.status(),
        expectedPreset: route.expectedPreset,
        screenshot: path.relative(path.resolve(__dirname, '..'), screenshotPath),
        ...inspection,
      });
    }

    await context.close();

    if (consoleMessages.length > 0) {
      results.push({ viewport: viewport.name, consoleMessages: consoleMessages.slice(0, 30) });
    }

    const whaleRequestFailures = failedRequests.filter((item) => item.includes('/ocean/ambient-whale/frames/'));
    if (whaleRequestFailures.length > 0) {
      results.push({ viewport: viewport.name, whaleRequestFailures });
    }
  }

  const reducedMotionContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedMotionPage = await reducedMotionContext.newPage();
  await reducedMotionPage.goto(`${baseUrl}/english-speed?debugPoo=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await reducedMotionPage.waitForTimeout(1200);
  const reducedMotionInspection = await inspectPage(reducedMotionPage, { name: 'english-speed-reduced-motion', path: '/english-speed?debugPoo=1' }, { name: 'mobile-390-reduced-motion' });
  const reducedMotionScreenshotPath = path.join(outputDir, 'ambient-poo-whale-polish-english-speed-mobile-reduced-motion-debug.png');
  await reducedMotionPage.screenshot({ path: reducedMotionScreenshotPath, fullPage: false });
  results.push({
    route: '/english-speed?debugPoo=1',
    viewport: 'mobile-390-reduced-motion',
    screenshot: path.relative(path.resolve(__dirname, '..'), reducedMotionScreenshotPath),
    ...reducedMotionInspection,
  });
  await reducedMotionContext.close();

  await browser.close();

  const reportPath = path.join(outputDir, 'ambient-poo-whale-polish-qa.json');
  fs.writeFileSync(reportPath, JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify({ report: path.relative(path.resolve(__dirname, '..'), reportPath), results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
