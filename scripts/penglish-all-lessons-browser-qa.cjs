const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const validationReport = require('../reports/penglish-runtime-lesson-validation.json');

const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const VIEWPORTS = [
  { name: 'desktop', width: 1365, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];
const REPORT_PATH = path.resolve(__dirname, '../reports/penglish-all-lessons-browser-qa.json');

function expectedFirstStep(lessonId) {
  if (lessonId.startsWith('reading-')) return 'Bước 1: Đọc lượt 1';
  if (lessonId.startsWith('grammar-')) return 'Bước 1: Nhìn mẫu';
  return 'Bước 1: Nghe';
}

function collectLessonIds(value, output = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectLessonIds(item, output));
    return output;
  }
  if (!value || typeof value !== 'object') return output;
  if (typeof value.lessonId === 'string') output.add(value.lessonId);
  Object.values(value).forEach((item) => collectLessonIds(item, output));
  return output;
}

(async () => {
  const lessonIds = [...collectLessonIds(validationReport)];
  if (lessonIds.length !== validationReport.lessonCount) {
    throw new Error(`Expected ${validationReport.lessonCount} lesson IDs but found ${lessonIds.length}.`);
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    for (const [index, lessonId] of lessonIds.entries()) {
      const responseErrors = [];
      const consoleErrors = [];
      const pageErrors = [];
      const onResponse = (response) => {
        if (response.status() >= 400) responseErrors.push(`${response.status()} ${new URL(response.url()).pathname}`);
      };
      const onConsole = (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      };
      const onPageError = (error) => pageErrors.push(error.message);
      page.on('response', onResponse);
      page.on('console', onConsole);
      page.on('pageerror', onPageError);

      await page.goto(`${BASE_URL}/lessons/${encodeURIComponent(lessonId)}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.locator('[data-testid="lesson-mobile-root"]').waitFor({ state: 'visible', timeout: 7000 }).catch(() => {});
      await page.waitForTimeout(100);

      const bodyText = await page.locator('body').innerText();
      const measurements = await page.evaluate(() => ({
        horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        brokenImages: [...document.images]
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.getAttribute('src') || ''),
      }));
      const result = {
        lessonId,
        viewport: viewport.name,
        rootVisible: await page.locator('[data-testid="lesson-mobile-root"]').isVisible().catch(() => false),
        activeStepVisible: await page.locator('[data-testid="lesson-active-step"]').isVisible().catch(() => false),
        expectedFirstStep: expectedFirstStep(lessonId),
        firstStepVisible: bodyText.includes(expectedFirstStep(lessonId)),
        notFound: await page.locator('[data-testid="penglish-404-page"]').isVisible().catch(() => false),
        loadingStuck: await page.locator('[data-testid="route-loading-fallback"]').isVisible().catch(() => false),
        hasEmoji: EMOJI_PATTERN.test(bodyText),
        horizontalOverflow: measurements.horizontalOverflow,
        brokenImages: measurements.brokenImages,
        responseErrors,
        consoleErrors,
        pageErrors,
      };
      results.push(result);

      page.off('response', onResponse);
      page.off('console', onConsole);
      page.off('pageerror', onPageError);

      if ((index + 1) % 10 === 0 || index === lessonIds.length - 1) {
        console.log(`[${viewport.name}] ${index + 1}/${lessonIds.length}`);
      }
    }

    await context.close();
  }

  const failures = results.filter((result) => (
    !result.rootVisible
    || !result.activeStepVisible
    || !result.firstStepVisible
    || result.notFound
    || result.loadingStuck
    || result.hasEmoji
    || result.horizontalOverflow > 2
    || result.brokenImages.length
    || result.responseErrors.length
    || result.consoleErrors.length
    || result.pageErrors.length
  ));
  const summary = {
    baseUrl: BASE_URL,
    lessonCount: lessonIds.length,
    viewportCount: VIEWPORTS.length,
    routeVisitCount: results.length,
    failureCount: failures.length,
    failures,
  };
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify({ summary, results }, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
