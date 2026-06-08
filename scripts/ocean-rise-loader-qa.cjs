const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'ocean-rise-loader-qa-results.json');

async function waitForProgress(page, target) {
  await page.waitForFunction((minimum) => {
    const loader = document.querySelector('[data-testid="poo-ocean-rise-loader"]');
    if (!loader) return false;
    const progress = Number(loader.getAttribute('data-progress') || '0');
    return progress >= minimum;
  }, target, { timeout: 10000 });
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const loader = document.querySelector('[data-testid="poo-ocean-rise-loader"]');
    const homeText = document.body.innerText || '';
    return {
      loaderVisible: Boolean(loader),
      progress: loader ? Number(loader.getAttribute('data-progress') || '0') : null,
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
      appVisible: /P-English|Trang chủ|Lộ trình|48 ngày|Bắt đầu học/i.test(homeText),
      textSample: homeText.slice(0, 500),
    };
  });
}

(async () => {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const consoleErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push({ text: message.text(), location: message.location() });
  });
  page.on('pageerror', (error) => consoleErrors.push({ text: error.message, stack: error.stack }));

  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto(`${baseUrl}/home?oceanLoaderQa=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.waitForSelector('[data-testid="poo-ocean-rise-loader"]', { timeout: 6000 });
  await page.screenshot({ path: path.join(screenshotDir, 'ocean-rise-loader-0.png'), fullPage: true });

  await waitForProgress(page, 50);
  await page.screenshot({ path: path.join(screenshotDir, 'ocean-rise-loader-50.png'), fullPage: true });

  await waitForProgress(page, 100);
  await page.screenshot({ path: path.join(screenshotDir, 'ocean-rise-loader-100.png'), fullPage: true });

  await page.waitForSelector('[data-testid="poo-ocean-rise-loader"]', { state: 'detached', timeout: 8000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  const desktopAfter = await inspectPage(page);
  if (!desktopAfter.appVisible) errors.push('desktop: app/home content did not appear after loader.');
  if (desktopAfter.hasHorizontalOverflow) errors.push('desktop: horizontal overflow detected after loader.');
  await page.screenshot({ path: path.join(screenshotDir, 'ocean-rise-loader-after-home.png'), fullPage: true });

  const mobile = await browser.newPage();
  mobile.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push({ text: message.text(), location: message.location() });
  });
  mobile.on('pageerror', (error) => consoleErrors.push({ text: error.message, stack: error.stack }));
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${baseUrl}/home?oceanLoaderQa=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobile.waitForSelector('[data-testid="poo-ocean-rise-loader"]', { timeout: 6000 });
  await waitForProgress(mobile, 50);
  const mobileDuring = await inspectPage(mobile);
  if (mobileDuring.hasHorizontalOverflow) errors.push('mobile: horizontal overflow detected during loader.');
  await mobile.screenshot({ path: path.join(screenshotDir, 'ocean-rise-loader-mobile.png'), fullPage: true });
  await mobile.waitForSelector('[data-testid="poo-ocean-rise-loader"]', { state: 'detached', timeout: 10000 });
  const mobileAfter = await inspectPage(mobile);
  if (!mobileAfter.appVisible) errors.push('mobile: app content did not appear after loader.');
  if (mobileAfter.hasHorizontalOverflow) errors.push('mobile: horizontal overflow detected after loader.');

  await mobile.close();
  await browser.close();

  const report = {
    ok: errors.length === 0 && consoleErrors.length === 0,
    generatedAt: new Date().toISOString(),
    baseUrl,
    errors,
    consoleErrors,
    screenshots: [
      'reports/screenshots/ocean-rise-loader-0.png',
      'reports/screenshots/ocean-rise-loader-50.png',
      'reports/screenshots/ocean-rise-loader-100.png',
      'reports/screenshots/ocean-rise-loader-mobile.png',
      'reports/screenshots/ocean-rise-loader-after-home.png',
    ],
    desktopAfter,
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, reportPath, screenshots: report.screenshots, errors: errors.length, consoleErrors: consoleErrors.length }, null, 2));
  if (!report.ok) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
