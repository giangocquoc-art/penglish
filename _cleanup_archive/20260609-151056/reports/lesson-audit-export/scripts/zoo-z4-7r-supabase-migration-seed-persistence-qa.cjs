const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const screenshots = [
  { url: '/login', file: 'zoo-z4-7r-login-ocean.png', width: 1366, height: 900, waitText: 'Bắt đầu học P-English' },
  { url: '/home', file: 'zoo-z4-7r-home.png', width: 1366, height: 900, waitText: 'P-English' },
  { url: '/shadowing', file: 'zoo-z4-7r-shadowing-initial.png', width: 1366, height: 920, testId: 'shadowing-page' },
  { url: '/english-speed', file: 'zoo-z4-7r-english-speed.png', width: 1366, height: 920, waitText: 'English Speed' },
  { url: '/learning-path', file: 'zoo-z4-7r-learning-path.png', width: 1366, height: 940, waitText: 'Lộ trình học' },
];

const routeChecks = [
  { url: '/login', waitText: 'Bắt đầu học P-English', publicPage: true },
  { url: '/home', waitText: 'P-English' },
  { url: '/shadowing', testId: 'shadowing-page' },
  { url: '/english-speed', waitText: 'English Speed' },
  { url: '/learning-path', waitText: 'Lộ trình học' },
];

function isSeriousConsoleMessage(text) {
  return !/favicon|ResizeObserver loop|Failed to load resource.*(favicon|manifest)/i.test(text);
}

async function waitForRoute(page, route) {
  if (route.testId) await page.getByTestId(route.testId).waitFor({ timeout: 15000 });
  if (route.waitText) await page.getByText(route.waitText, { exact: false }).first().waitFor({ timeout: 15000 });
}

async function checkNoHorizontalOverflow(page, label, errors) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) errors.push(`horizontal overflow on ${label}: ${JSON.stringify(overflow)}`);
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];
  const supabaseRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' && isSeriousConsoleMessage(msg.text())) errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('request', (request) => {
    if (/\.supabase\.co\/rest\/v1/i.test(request.url())) supabaseRequests.push(`${request.method()} ${request.url()}`);
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!/favicon|manifest|chrome-extension/i.test(url)) failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  for (const route of routeChecks) {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    await waitForRoute(page, route);
    await checkNoHorizontalOverflow(page, route.url, errors);
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (route.publicPage && /Pshare/i.test(bodyText)) errors.push(`visible Pshare on public route ${route.url}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ['/login', '/home', '/shadowing', '/english-speed', '/learning-path']) {
    await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle' });
    await checkNoHorizontalOverflow(page, `${url} mobile`, errors);
  }

  for (const shot of screenshots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(`${baseUrl}${shot.url}`, { waitUntil: 'networkidle' });
    await waitForRoute(page, shot);
    await page.screenshot({ path: path.join(outDir, shot.file), fullPage: true });
  }

  await page.setViewportSize({ width: 1366, height: 920 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.getByTestId('shadowing-page').waitFor({ timeout: 15000 });
  await page.getByTestId('shadowing-type-input').fill('Hi Mai how are today');
  await page.getByTestId('shadowing-feedback-button').click();
  await page.getByTestId('shadowing-feedback-panel').waitFor({ timeout: 15000 });
  await page.getByTestId('shadowing-sync-status').waitFor({ timeout: 15000 });
  await page.getByText('Poo đang dùng phản hồi local', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByText('Đã lưu lượt luyện trên thiết bị', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-7r-shadowing-feedback.png'), fullPage: true });

  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'networkidle' });
  await page.getByTestId('english-speed-manual-textarea').fill('Hello, my name is Anna.');
  await page.getByTestId('english-speed-manual-check').click();
  await page.getByText('Phản hồi phát âm', { exact: false }).first().waitFor({ timeout: 15000 });
  const speechProgress = await page.evaluate(() => window.localStorage.getItem('p-english:speech-progress'));
  if (!speechProgress) errors.push('English Speed did not write p-english:speech-progress localStorage entry');

  const shadowingProgress = await page.evaluate(() => window.localStorage.getItem('p-english:z4-4-local-daily-progress'));
  if (!shadowingProgress) errors.push('Shadowing/adapter did not write p-english:z4-4-local-daily-progress localStorage entry');

  await browser.close();

  if (failedRequests.length) errors.push(`failed requests:\n${failedRequests.join('\n')}`);
  if (supabaseRequests.length) errors.push(`unexpected real Supabase REST requests during local QA:\n${supabaseRequests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Z4.7R Supabase migration/seed/persistence QA passed. Screenshots saved to ${outDir}`);
})();
