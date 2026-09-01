const { chromium } = require('playwright');

const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const ROUTES = [
  '/', '/hoc-tieng-anh', '/lo-trinh-hoc-tieng-anh', '/shadowing-tieng-anh', '/tu-vung-tieng-anh',
  '/luyen-nghe-tieng-anh', '/ngu-phap-tieng-anh', '/48-ngay-lay-goc', '/gioi-thieu', '/blog', '/login',
  '/home', '/today', '/learning-path', '/luyen-tieng-anh/48-ngay-lay-goc', '/shadowing', '/video-lab', '/categories',
  '/category-list', '/speaking-coach', '/vocabularies', '/words', '/games', '/practice', '/english-speed',
  '/resources', '/folders', '/chat', '/ai', '/leaderboard', '/shop', '/pricing', '/subscriptions',
  '/shared-streak', '/profile', '/admin',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const results = [];

  for (const route of ROUTES) {
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

    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('[data-testid="route-loading-fallback"]').waitFor({ state: 'hidden', timeout: 7000 }).catch(() => {});
    await page.waitForTimeout(250);
    const body = await page.locator('body').innerText();
    results.push({
      route,
      finalUrl: page.url().replace(BASE_URL, ''),
      responseErrors,
      consoleErrors,
      pageErrors,
      rawJson: body.trimStart().startsWith('{'),
      loadingStuck: await page.locator('[data-testid="route-loading-fallback"]').isVisible().catch(() => false),
      notFound: await page.locator('[data-testid="penglish-404-page"]').isVisible().catch(() => false),
      genericError: /Poo chưa (mở|tải|kết nối)/i.test(body),
    });
    page.off('response', onResponse);
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }

  const failures = results.filter((item) => item.responseErrors.length || item.consoleErrors.length || item.pageErrors.length || item.rawJson || item.loadingStuck || item.notFound || item.genericError);
  console.log(JSON.stringify({ baseUrl: BASE_URL, routeCount: results.length, failureCount: failures.length, failures }, null, 2));
  await browser.close();
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
