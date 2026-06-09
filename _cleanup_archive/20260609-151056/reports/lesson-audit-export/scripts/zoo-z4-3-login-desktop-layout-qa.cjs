const { chromium } = require('playwright');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const screenshots = [
  { url: '/login', file: 'zoo-z4-3-login-fixed.png', width: 390, height: 844, waitForText: 'Tiếp tục học ngay' },
  { url: '/auth/google', file: 'zoo-z4-3-auth-google-safe.png', width: 1366, height: 768, waitForText: 'Đăng nhập Google chưa bật' },
  { url: '/home', file: 'zoo-z4-3-home-desktop-1366.png', width: 1366, height: 768, waitForText: 'Hôm nay học gì?' },
  { url: '/home', file: 'zoo-z4-3-home-desktop-1536.png', width: 1536, height: 864, waitForText: 'Hôm nay học gì?' },
  { url: '/shadowing', file: 'zoo-z4-3-shadowing-desktop-1366.png', width: 1366, height: 768, waitForText: 'AI góp ý cách nói' },
  { url: '/english-speed', file: 'zoo-z4-3-english-speed-desktop-1366.png', width: 1366, height: 768, waitForText: 'Cá voi coach' },
  { url: '/home', file: 'zoo-z4-3-home-mobile-390.png', width: 390, height: 844, waitForText: 'Hôm nay học gì?' },
  { url: '/shadowing', file: 'zoo-z4-3-shadowing-mobile-390.png', width: 390, height: 844, waitForText: 'AI góp ý cách nói' },
];

const overflowChecks = [
  { url: '/home', width: 1366, height: 768, waitForText: 'Hôm nay học gì?' },
  { url: '/home', width: 1536, height: 864, waitForText: 'Hôm nay học gì?' },
  { url: '/home', width: 1920, height: 1080, waitForText: 'Hôm nay học gì?' },
  { url: '/shadowing', width: 1366, height: 768, waitForText: 'AI góp ý cách nói' },
  { url: '/english-speed', width: 1366, height: 768, waitForText: 'Cá voi coach' },
  { url: '/learning-path', width: 1366, height: 768, waitForText: 'Lộ trình CEFR' },
  { url: '/home', width: 390, height: 844, waitForText: 'Hôm nay học gì?' },
  { url: '/home', width: 430, height: 932, waitForText: 'Hôm nay học gì?' },
  { url: '/shadowing', width: 390, height: 844, waitForText: 'AI góp ý cách nói' },
  { url: '/shadowing', width: 430, height: 932, waitForText: 'AI góp ý cách nói' },
];

async function waitForApp(page, text) {
  await page.waitForLoadState('domcontentloaded');
  await page.getByText(text, { exact: false }).first().waitFor({ timeout: 20000 });
}

async function checkOverflow(page, label, errors) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
    hasHorizontalOverflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) {
    errors.push(`horizontal overflow on ${label}: ${JSON.stringify(overflow)}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.localStorage.removeItem('currentUser');
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
  });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'Tiếp tục học ngay');
  const continueButton = page.getByTestId('login-continue-local');
  if (!(await continueButton.count())) errors.push('login primary continue button is missing.');
  await continueButton.click();
  await page.waitForURL('**/home', { timeout: 15000 });
  await waitForApp(page, 'Hôm nay học gì?');
  const currentUser = await page.evaluate(() => window.localStorage.getItem('currentUser'));
  if (!currentUser || !currentUser.includes('local-guest-learner')) errors.push('local guest profile was not saved after login continue.');

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/auth/google`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'Đăng nhập Google chưa bật');
  const authPageNotFound = await page.getByText('Route chưa có', { exact: false }).count();
  if (authPageNotFound) errors.push('/auth/google still shows the NotFound route text.');

  for (const route of overflowChecks) {
    await page.setViewportSize({ width: route.width, height: route.height });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    await waitForApp(page, route.waitForText);
    await checkOverflow(page, `${route.url} ${route.width}x${route.height}`, errors);

    if (route.width <= 430) {
      const navState = await page.evaluate(() => {
        const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
        if (!nav) return null;
        const rect = nav.getBoundingClientRect();
        const style = window.getComputedStyle(nav);
        return {
          visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
          bottomAligned: Math.abs(window.innerHeight - rect.bottom) < 80,
          itemCount: nav.querySelectorAll('a').length,
        };
      });
      if (!navState?.visible || !navState?.bottomAligned || navState.itemCount < 5) {
        errors.push(`bottom nav unusable on ${route.url} ${route.width}x${route.height}: ${JSON.stringify(navState)}`);
      }
    }
  }

  for (const shot of screenshots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(`${baseUrl}${shot.url}`, { waitUntil: 'networkidle' });
    await waitForApp(page, shot.waitForText);
    await checkOverflow(page, `screenshot ${shot.url} ${shot.width}x${shot.height}`, errors);
    await page.screenshot({ path: path.join(outDir, shot.file), fullPage: true });
  }

  await browser.close();

  const filteredFailedRequests = failedRequests.filter((item) => !item.includes('favicon'));
  if (filteredFailedRequests.length) errors.push(`failed requests:\n${filteredFailedRequests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Z4.3 login and desktop layout QA passed. Screenshots saved to ${outDir}`);
})();
