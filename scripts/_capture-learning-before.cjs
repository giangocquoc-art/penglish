const { chromium } = require('playwright');
const fs = require('fs');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const shots = [
  { path: '/learning-path', file: 'reports/screenshots/learning-path-before-desktop.png', viewport: { width: 1440, height: 950 }, wait: '[data-testid="roadmap-mobile-root"]' },
  { path: '/learning-path', file: 'reports/screenshots/learning-path-before-mobile.png', viewport: { width: 390, height: 844 }, wait: '[data-testid="roadmap-mobile-root"]' },
  { path: '/lessons/unit-1-greetings-introduction', file: 'reports/screenshots/lesson-unit1-before-desktop.png', viewport: { width: 1440, height: 950 }, wait: '[data-testid="lesson-mobile-root"]' },
  { path: '/lessons/unit-1-greetings-introduction', file: 'reports/screenshots/lesson-unit1-before-mobile.png', viewport: { width: 390, height: 844 }, wait: '[data-testid="lesson-mobile-root"]' },
];

(async () => {
  fs.mkdirSync('reports/screenshots', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const results = [];

  for (const shot of shots) {
    const page = await browser.newPage({ viewport: shot.viewport });
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${shot.path}: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`${shot.path}: ${error.message}`));
    await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector(shot.wait, { timeout: 10000 });
    await page.screenshot({ path: shot.file, fullPage: true });
    const overflow = await page.evaluate(() => document.body.scrollWidth > document.documentElement.clientWidth + 1);
    results.push({ file: shot.file, path: shot.path, viewport: shot.viewport, overflow });
    await page.close();
  }

  await browser.close();
  const report = { ok: errors.length === 0, generatedAt: new Date().toISOString(), baseUrl, results, errors };
  fs.writeFileSync('reports/learning-lesson-before-screenshots.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (errors.length) process.exit(1);
})();
