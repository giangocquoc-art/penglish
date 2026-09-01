const { chromium } = require('playwright');
const path = require('path');

const baseUrl = 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routes = [
  { url: '/learning-path', file: 'zoo-z2-learning-path-desktop.png', width: 1440, height: 1100, waitFor: 'Lộ trình học' },
  { url: '/learning-path', file: 'zoo-z2-learning-path-mobile.png', width: 390, height: 1100, waitFor: 'Lộ trình học' },
  { url: '/lessons/unit-1-greetings-introduction', file: 'zoo-z2-lesson-page-desktop.png', width: 1440, height: 1100, waitFor: 'Bước 1: Nghe' },
  { url: '/lessons/unit-1-greetings-introduction', file: 'zoo-z2-lesson-page-mobile.png', width: 390, height: 1100, waitFor: 'Bước 1: Nghe' },
  { url: '/practice?lessonId=reading-a1-my-morning&mode=quiz', file: 'zoo-z2-practice-quiz.png', width: 1440, height: 1000, waitFor: 'Thử sức nhẹ' },
  { url: '/practice?lessonId=reading-a1-my-morning&mode=typing', file: 'zoo-z2-practice-typing.png', width: 1440, height: 1000, waitFor: 'Gõ câu' },
  { url: '/practice?lessonId=reading-a1-my-morning&mode=flashcard', file: 'zoo-z2-practice-flashcard.png', width: 1440, height: 1000, waitFor: 'Đây là lượt từ vựng' },
  { url: '/practice?lessonId=reading-a1-my-morning&mode=match', file: 'zoo-z2-practice-match.png', width: 1440, height: 1000, waitFor: 'Ghép nghĩa từ vựng' },
  { url: '/practice?lessonId=reading-a1-my-morning&mode=does-not-exist', file: 'zoo-z2-practice-fallback.png', width: 1440, height: 900, waitFor: 'Phần này chưa có trong bộ luyện tập hiện tại' },
  { url: '/home', file: 'zoo-z2-home-regression-check.png', width: 1440, height: 1100, waitFor: 'PooEnglish' },
];

const smokeRoutes = [
  { url: '/lessons/grammar-a1-articles-a-an-the', waitFor: 'Bước 1: Nghe' },
  { url: '/lessons/reading-a1-my-morning', waitFor: 'Bước 1: Nghe' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));

  for (const route of [...routes, ...smokeRoutes]) {
    await page.setViewportSize({ width: route.width ?? 1440, height: route.height ?? 900 });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    try {
      await page.waitForFunction(
        (expectedText) => document.body.innerText.toLowerCase().includes(String(expectedText).toLowerCase()),
        route.waitFor,
        { timeout: 15000 },
      );
    } catch {
      const bodyText = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      throw new Error(`Expected “${route.waitFor}” on ${route.url}, but rendered: ${bodyText.slice(0, 500)}`);
    }
    if (route.file) {
      await page.screenshot({ path: path.join(outDir, route.file), fullPage: true });
    }
  }

  const fallback = page.getByTestId('practice-fallback-card');
  await page.goto(`${baseUrl}/practice?lessonId=reading-a1-my-morning&mode=does-not-exist`, { waitUntil: 'networkidle' });
  await fallback.waitFor({ timeout: 15000 });

  await browser.close();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`Z2 QA passed for ${routes.length + smokeRoutes.length} routes. Screenshots saved to ${outDir}`);
})();
