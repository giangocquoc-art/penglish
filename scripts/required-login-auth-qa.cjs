const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:5174';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'required-login-auth-qa-results.json');

const protectedRoutes = [
  '/',
  '/profile',
  '/learning-path',
  '/luyen-tieng-anh/48-ngay-lay-goc',
  '/lessons/unit-1-greetings-introduction',
  '/words',
  '/practice',
  '/shadowing',
  '/english-speed',
];

const canonicalRoutes = ['/LOGIN', '/Login', '/login/'];
const forbiddenLoginCopy = ['học thử', 'không cần đăng nhập', 'Bạn có thể học thử', 'Không cần tài khoản'];

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function run() {
  await ensureDir(screenshotDir);
  const browser = await chromium.launch({ headless: true });
  const results = {
    baseURL,
    generatedAt: new Date().toISOString(),
    unauthenticatedRedirects: [],
    canonicalRedirects: [],
    loginCopy: null,
    googleLoginBehavior: null,
    consoleErrors: [],
    failedResponses: [],
    layout: [],
    screenshots: [],
    authenticatedProfile: { status: 'not-run', reason: 'No authenticated storage state was provided for QA.' },
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  context.on('page', (page) => attachObservers(page, results));
  const page = await context.newPage();
  attachObservers(page, results);

  for (const route of protectedRoutes) {
    await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
    await page.waitForURL(/\/login/, { timeout: 6000 }).catch(() => undefined);
    const finalUrl = page.url();
    const item = { route, finalUrl, ok: new URL(finalUrl).pathname === '/login' };
    results.unauthenticatedRedirects.push(item);
    if (route === '/profile') await capture(page, 'required-login-incognito-profile-redirect.png', results);
    if (route === '/learning-path') await capture(page, 'required-login-incognito-learning-path-redirect.png', results);
    await checkLayout(page, route, results);
  }

  for (const route of canonicalRoutes) {
    await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
    await page.waitForURL(/\/login$/, { timeout: 6000 }).catch(() => undefined);
    const finalUrl = page.url();
    results.canonicalRedirects.push({ route, finalUrl, ok: new URL(finalUrl).pathname === '/login' });
  }

  await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
  await capture(page, 'required-login-login-desktop.png', results);
  const bodyText = await page.locator('body').innerText();
  const googleButton = await page.getByTestId('login-google-supabase').innerText().catch(() => '');
  results.loginCopy = {
    headlinePresent: bodyText.includes('Vào lớp học P-English'),
    subtitlePresent: bodyText.includes('Đăng nhập để lưu tiến độ và tiếp tục hành trình học cùng Poo.'),
    infoPresent: bodyText.includes('P-English cần đăng nhập để lưu tiến độ học tập của bạn.'),
    googleButton,
    googleButtonIsMainCta: googleButton.includes('Đăng nhập bằng Google'),
    forbiddenCopyFound: forbiddenLoginCopy.filter((text) => bodyText.includes(text)),
    ok: bodyText.includes('Vào lớp học P-English') && bodyText.includes('Đăng nhập để lưu tiến độ và tiếp tục hành trình học cùng Poo.') && bodyText.includes('P-English cần đăng nhập để lưu tiến độ học tập của bạn.') && googleButton.includes('Đăng nhập bằng Google') && forbiddenLoginCopy.every((text) => !bodyText.includes(text)),
  };

  await page.getByTestId('login-google-supabase').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByTestId('login-google-supabase').click();
  await page.waitForTimeout(1000);
  const afterClickUrl = page.url();
  const afterClickText = await page.locator('body').innerText();
  const friendlyMessage = 'Google Login chưa được cấu hình. Vui lòng kiểm tra Supabase Auth settings.';
  const afterClickParsedUrl = new URL(afterClickUrl);
  const redirectedToOAuthProvider = afterClickParsedUrl.hostname.includes('accounts.google.com') || afterClickParsedUrl.hostname.includes('supabase.co');
  const stayedOnLoginWithFriendlyMessage = afterClickParsedUrl.pathname === '/login' && afterClickText.includes(friendlyMessage);
  results.googleLoginBehavior = {
    stayedOnLogin: afterClickParsedUrl.pathname === '/login',
    redirectedToOAuthProvider,
    friendlyMessageVisible: afterClickText.includes(friendlyMessage),
    didNotEnterApp: !afterClickParsedUrl.pathname.startsWith('/home') && !afterClickParsedUrl.pathname.startsWith('/profile'),
    mode: redirectedToOAuthProvider ? 'google-auth-configured' : 'google-auth-unconfigured-or-failed',
    ok: (stayedOnLoginWithFriendlyMessage || redirectedToOAuthProvider) && !afterClickParsedUrl.pathname.startsWith('/home') && !afterClickParsedUrl.pathname.startsWith('/profile'),
  };

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
  await capture(page, 'required-login-login-mobile.png', results);
  await checkLayout(page, '/login-mobile', results);

  await browser.close();
  const aggregateOk =
    results.unauthenticatedRedirects.every((item) => item.ok) &&
    results.canonicalRedirects.every((item) => item.ok) &&
    results.loginCopy?.ok &&
    results.googleLoginBehavior?.ok &&
    results.consoleErrors.length === 0 &&
    results.failedResponses.length === 0 &&
    results.layout.every((item) => item.noHorizontalOverflow);
  results.ok = Boolean(aggregateOk);
  await fs.promises.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  if (!results.ok) process.exitCode = 1;
}

function attachObservers(page, results) {
  if (page.__requiredLoginObserversAttached) return;
  page.__requiredLoginObserversAttached = true;
  page.on('console', (message) => {
    if (message.type() === 'error') results.consoleErrors.push({ text: message.text(), url: page.url() });
  });
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if ((status === 404 || status >= 500) && !url.includes('/favicon')) {
      results.failedResponses.push({ status, url, page: page.url() });
    }
  });
}

async function capture(page, filename, results) {
  const fullPath = path.join(screenshotDir, filename);
  await page.screenshot({ path: fullPath, fullPage: true });
  results.screenshots.push(path.relative(process.cwd(), fullPath).replace(/\\/g, '/'));
}

async function checkLayout(page, route, results) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  results.layout.push({
    route,
    ...metrics,
    noHorizontalOverflow: Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) <= metrics.innerWidth + 1,
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
