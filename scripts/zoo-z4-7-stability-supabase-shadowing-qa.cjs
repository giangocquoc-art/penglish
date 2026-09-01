const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routeChecks = [
  { url: '/', waitFor: 'P-English', publicPage: true },
  { url: '/login', waitFor: 'Đăng nhập', publicPage: true },
  { url: '/auth/google', waitFor: 'Đăng nhập Google', publicPage: true },
  { url: '/home', waitFor: 'P-English' },
  { url: '/shadowing', waitFor: 'Phòng nói đuổi cùng Poo' },
  { url: '/english-speed', waitFor: 'English Speed' },
  { url: '/learning-path', waitFor: 'A1' },
  { url: '/vocabulary', waitFor: 'Không tìm thấy', optionalMissingRoute: true },
  { url: '/words', waitFor: 'Từ vựng' },
];

const overflowChecks = [
  { url: '/home', width: 1366, height: 768 },
  { url: '/home', width: 390, height: 844 },
  { url: '/shadowing', width: 1366, height: 768 },
  { url: '/shadowing', width: 390, height: 844 },
];

function isSeriousConsoleMessage(text) {
  return !/favicon|ResizeObserver loop|Failed to load resource.*(favicon|manifest)/i.test(text);
}

async function checkOverflow(page) {
  return page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' && isSeriousConsoleMessage(msg.text())) errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!/favicon|manifest|chrome-extension/i.test(url)) errors.push(`request failed: ${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  for (const route of routeChecks) {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    await page.getByText(route.waitFor, { exact: false }).first().waitFor({ timeout: 15000 });
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (route.publicPage && /Pshare/i.test(bodyText)) errors.push(`visible Pshare on public page ${route.url}`);
  }

  for (const route of overflowChecks) {
    await page.setViewportSize({ width: route.width, height: route.height });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    const overflow = await checkOverflow(page);
    if (overflow.hasHorizontalOverflow) errors.push(`horizontal overflow on ${route.url} at ${route.width}x${route.height}: ${JSON.stringify(overflow)}`);
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' });
  await page.getByText('P-English', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-7-home.png'), fullPage: true });

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.getByText('Đăng nhập', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-7-login.png'), fullPage: true });

  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.getByTestId('shadowing-page').waitFor({ timeout: 15000 });
  await page.getByTestId('shadowing-type-input').fill('Hi Mai how are today');
  await page.getByTestId('shadowing-feedback-button').click();
  await page.getByTestId('shadowing-feedback-panel').waitFor({ timeout: 15000 });
  await page.getByTestId('shadowing-sync-status').waitFor({ timeout: 15000 });
  await page.getByText('Từ bị thiếu', { exact: false }).first().waitFor({ timeout: 15000 });
  const syncStatusVisible = await page.getByTestId('shadowing-sync-status').isVisible();
  if (!syncStatusVisible) errors.push('Shadowing sync/save status did not appear after local feedback');
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-7-shadowing-feedback.png'), fullPage: true });

  await browser.close();

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Z4.7 stability Supabase Shadowing QA passed. Screenshots saved to ${outDir}`);
})();
