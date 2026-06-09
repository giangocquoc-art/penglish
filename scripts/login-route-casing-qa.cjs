const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'login-route-casing-qa-results.json');
const foundation48Path = '/luyen-tieng-anh/48-ngay-lay-goc';
const friendlyMessage = 'Bạn có thể học thử ngay. Đăng nhập Google chỉ dùng để đồng bộ tiến độ.';

const loginRoutes = [
  { name: 'rootRedirect', path: '/', expectedPathname: '/login' },
  { name: 'canonicalLogin', path: '/login', expectedPathname: '/login', screenshot: 'login-canonical-desktop.png', viewport: { width: 1440, height: 960 } },
  { name: 'canonicalLoginMobile', path: '/login', expectedPathname: '/login', screenshot: 'login-canonical-mobile.png', viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 },
  { name: 'upperLogin', path: '/LOGIN', expectedPathname: '/login', screenshot: 'login-uppercase-redirect.png' },
  { name: 'titleLogin', path: '/Login', expectedPathname: '/login' },
  { name: 'trailingSlashLogin', path: '/login/', expectedPathname: '/login' },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function waitForAppReady(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(900);
}

function registerDiagnostics(page, diagnostics) {
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('response', (response) => {
    const status = response.status();
    if (status === 404 || status >= 500) {
      diagnostics.badNetworkResponses.push({ url: response.url(), status });
    }
  });
}

async function newCheckedPage(browser, options = {}) {
  const context = await browser.newContext({
    viewport: options.viewport || { width: 390, height: 844 },
    deviceScaleFactor: options.deviceScaleFactor || 1,
    isMobile: Boolean(options.isMobile),
  });
  const page = await context.newPage();
  const diagnostics = { consoleErrors: [], pageErrors: [], badNetworkResponses: [] };
  registerDiagnostics(page, diagnostics);
  return { context, page, diagnostics };
}

async function checkLoginRoute(browser, route) {
  const { context, page, diagnostics } = await newCheckedPage(browser, route);

  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 45000 });
  await waitForAppReady(page);

  const result = await page.evaluate((expectedMessage) => {
    const localGuestButton = document.querySelector('[data-testid="login-continue-local"]');
    const googleButton = document.querySelector('[data-testid="login-google-supabase"]');
    const infoMessages = Array.from(document.querySelectorAll('[data-testid="login-single-info-message"]')).filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });
    const alerts = Array.from(document.querySelectorAll('[role="alert"]')).filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });
    const card = document.querySelector('[data-testid="login-ocean-card"]');
    const layout = document.querySelector('[data-testid="login-ocean-layout"]');
    const infoText = infoMessages.map((element) => element.textContent?.replace(/\s+/g, ' ').trim() || '');
    const viewportHeight = window.innerHeight;
    const cardRect = card?.getBoundingClientRect();
    const layoutRect = layout?.getBoundingClientRect();

    return {
      finalPathname: window.location.pathname,
      finalHref: window.location.href,
      hasGoogleButton: Boolean(googleButton),
      hasLocalGuestButton: Boolean(localGuestButton),
      localGuestText: localGuestButton?.textContent?.replace(/\s+/g, ' ').trim() || '',
      visibleInfoMessageCount: infoMessages.length,
      visibleAlertCount: alerts.length,
      infoText,
      hasExactFriendlyMessage: infoText.includes(expectedMessage),
      scrollY: window.scrollY,
      cardTop: cardRect ? Math.round(cardRect.top) : null,
      cardBottom: cardRect ? Math.round(cardRect.bottom) : null,
      cardAboveFold: cardRect ? cardRect.top >= -1 && cardRect.top < viewportHeight : false,
      layoutWidth: layoutRect ? Math.round(layoutRect.width) : null,
      horizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1 || document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  }, friendlyMessage);

  if (route.screenshot) {
    await page.screenshot({ path: path.join(screenshotDir, route.screenshot), fullPage: true });
  }

  await context.close();
  return { ...result, ...diagnostics };
}

async function checkGuestCta(browser) {
  const { context, page, diagnostics } = await newCheckedPage(browser, { viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 45000 });
  await waitForAppReady(page);
  await page.getByTestId('login-continue-local').click();
  await page.waitForURL((url) => url.pathname === foundation48Path, { timeout: 15000 });
  await waitForAppReady(page);

  const result = await page.evaluate(() => ({
    finalPathname: window.location.pathname,
    hasFoundation48Page: Boolean(document.querySelector('[data-testid="foundation48-roadmap-page"]')),
    hasTopbar: Boolean(document.querySelector('[data-testid="app-topbar"]')),
    horizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1 || document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  await context.close();
  return { ...result, ...diagnostics };
}

async function checkGoogleButton(browser) {
  const { context, page, diagnostics } = await newCheckedPage(browser, { viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 45000 });
  await waitForAppReady(page);
  await page.getByTestId('login-google-supabase').click();
  await page.waitForTimeout(900);

  const result = await page.evaluate(() => ({
    finalPathname: window.location.pathname,
    hasLoginPage: Boolean(document.querySelector('[data-testid="login-ocean-card"]')),
    hasGoogleButton: Boolean(document.querySelector('[data-testid="login-google-supabase"]')),
    visibleInfoMessageCount: document.querySelectorAll('[data-testid="login-single-info-message"]').length,
  }));

  await context.close();
  return { ...result, ...diagnostics };
}

async function checkLearningPath(browser) {
  const { context, page, diagnostics } = await newCheckedPage(browser, { viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
  await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'networkidle', timeout: 45000 });
  await waitForAppReady(page);

  const result = await page.evaluate(() => {
    const topbar = document.querySelector('[data-testid="app-topbar"]');
    const topbarRect = topbar?.getBoundingClientRect();
    const firstCard = document.querySelector('[data-testid="learning-path-current-card"]');
    const firstCardRect = firstCard?.getBoundingClientRect();
    return {
      finalPathname: window.location.pathname,
      hasLearningPath: Boolean(document.querySelector('[data-testid="roadmap-mobile-root"]')),
      topbarPosition: topbar ? window.getComputedStyle(topbar).position : null,
      topbarRect: topbarRect ? { top: topbarRect.top, bottom: topbarRect.bottom } : null,
      firstCardRect: firstCardRect ? { top: firstCardRect.top, bottom: firstCardRect.bottom } : null,
      topbarOverlapsFirstCard: Boolean(topbarRect && firstCardRect && topbarRect.bottom > firstCardRect.top + 1),
      horizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1 || document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });

  await context.close();
  return { ...result, ...diagnostics };
}

(async () => {
  ensureDir(screenshotDir);
  const browser = await chromium.launch();
  const results = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    routes: {},
    interactions: {},
    regressions: {},
    screenshots: loginRoutes.filter((route) => route.screenshot).map((route) => `reports/screenshots/${route.screenshot}`),
  };

  try {
    for (const route of loginRoutes) {
      results.routes[route.name] = {
        path: route.path,
        expectedPathname: route.expectedPathname,
        result: await checkLoginRoute(browser, route),
      };
    }
    results.interactions.guestCta = await checkGuestCta(browser);
    results.interactions.googleButton = await checkGoogleButton(browser);
    results.regressions.learningPath = await checkLearningPath(browser);
  } finally {
    await browser.close();
  }

  const failures = [];
  for (const [name, entry] of Object.entries(results.routes)) {
    const result = entry.result;
    if (result.finalPathname !== entry.expectedPathname) failures.push(`${name}: expected final pathname ${entry.expectedPathname}, got ${result.finalPathname}`);
    if (!result.hasGoogleButton) failures.push(`${name}: Google sync/login button not found`);
    if (!result.hasLocalGuestButton) failures.push(`${name}: guest learning button not found`);
    if (!/Học thử (ngay|trên thiết bị này)/.test(result.localGuestText)) failures.push(`${name}: guest learning button text changed`);
    if (result.visibleInfoMessageCount !== 1) failures.push(`${name}: expected one visible friendly info message, got ${result.visibleInfoMessageCount}`);
    if (result.visibleAlertCount > 0) failures.push(`${name}: unexpected role=alert warning/info boxes`);
    if (!result.hasExactFriendlyMessage) failures.push(`${name}: exact friendly message not found`);
    if (result.scrollY !== 0) failures.push(`${name}: login page did not remain at top after mount`);
    if (!result.cardAboveFold) failures.push(`${name}: login card is not above the fold`);
    if (result.horizontalOverflow) failures.push(`${name}: horizontal overflow`);
    if (result.consoleErrors.length) failures.push(`${name}: console errors (${result.consoleErrors.length})`);
    if (result.pageErrors.length) failures.push(`${name}: page errors (${result.pageErrors.length})`);
    if (result.badNetworkResponses.length) failures.push(`${name}: network 404/500 responses (${result.badNetworkResponses.length})`);
  }

  const guest = results.interactions.guestCta;
  if (guest.finalPathname !== foundation48Path) failures.push(`guestCta: expected ${foundation48Path}, got ${guest.finalPathname}`);
  if (!guest.hasFoundation48Page) failures.push('guestCta: Foundation48 roadmap page not found after click');
  if (guest.horizontalOverflow) failures.push('guestCta: horizontal overflow on Foundation48 route');
  if (guest.consoleErrors.length) failures.push(`guestCta: console errors (${guest.consoleErrors.length})`);
  if (guest.pageErrors.length) failures.push(`guestCta: page errors (${guest.pageErrors.length})`);
  if (guest.badNetworkResponses.length) failures.push(`guestCta: network 404/500 responses (${guest.badNetworkResponses.length})`);

  const google = results.interactions.googleButton;
  if (!google.hasLoginPage && google.finalPathname === '/login') failures.push('googleButton: login page disappeared unexpectedly');
  if (google.visibleInfoMessageCount > 1) failures.push(`googleButton: duplicate info boxes after Google click (${google.visibleInfoMessageCount})`);
  if (google.consoleErrors.length) failures.push(`googleButton: console errors (${google.consoleErrors.length})`);
  if (google.pageErrors.length) failures.push(`googleButton: page errors (${google.pageErrors.length})`);
  if (google.badNetworkResponses.length) failures.push(`googleButton: network 404/500 responses (${google.badNetworkResponses.length})`);

  const learningPath = results.regressions.learningPath;
  if (learningPath.finalPathname !== '/learning-path') failures.push(`learningPath: expected /learning-path, got ${learningPath.finalPathname}`);
  if (!learningPath.hasLearningPath) failures.push('learningPath: roadmap page not found');
  if (learningPath.topbarPosition !== 'static') failures.push(`learningPath: expected mobile topbar position static, got ${learningPath.topbarPosition}`);
  if (learningPath.topbarOverlapsFirstCard) failures.push('learningPath: mobile topbar overlaps first learning card');
  if (learningPath.horizontalOverflow) failures.push('learningPath: horizontal overflow');
  if (learningPath.consoleErrors.length) failures.push(`learningPath: console errors (${learningPath.consoleErrors.length})`);
  if (learningPath.pageErrors.length) failures.push(`learningPath: page errors (${learningPath.pageErrors.length})`);
  if (learningPath.badNetworkResponses.length) failures.push(`learningPath: network 404/500 responses (${learningPath.badNetworkResponses.length})`);

  results.failures = failures;
  results.passed = failures.length === 0;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.passed, failures, reportPath, screenshots: results.screenshots }, null, 2));

  if (failures.length) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
