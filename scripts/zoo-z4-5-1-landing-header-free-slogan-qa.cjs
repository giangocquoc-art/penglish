const { chromium } = require('playwright');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
const slogan = 'Học tập là miễn phí, P-English không bắt bất kỳ ai trả phí cho việc học';

const screenshots = [
  { url: '/', file: 'zoo-z4-5-1-landing-desktop-header-fixed.png', width: 1366, height: 768, waitForText: slogan },
  { url: '/', file: 'zoo-z4-5-1-landing-mobile-header-fixed.png', width: 390, height: 844, waitForText: slogan },
  { url: '/login', file: 'zoo-z4-5-1-login-after-start-click.png', width: 390, height: 844, waitForText: 'Tiếp tục học ngay', viaStartClick: true },
  { url: '/home', file: 'zoo-z4-5-1-home-regression.png', width: 1366, height: 768, waitForText: 'Hôm nay học gì?' },
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

async function collectBrokenImages(page) {
  return page.evaluate(() => Array.from(document.images)
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map((img) => ({ src: img.currentSrc || img.src, alt: img.alt })));
}

async function checkLanding(page, label, errors) {
  await waitForApp(page, slogan);
  await checkOverflow(page, label, errors);

  const bodyText = await page.locator('body').innerText();
  if (!bodyText.includes('P-English')) errors.push(`${label} does not contain P-English.`);
  if (!bodyText.includes(slogan)) errors.push(`${label} does not contain the new free-learning slogan.`);
  if (/Pshare/i.test(bodyText)) errors.push(`${label} contains old Pshare text.`);

  const brokenImages = await collectBrokenImages(page);
  if (brokenImages.length) errors.push(`${label} has broken image(s): ${JSON.stringify(brokenImages)}`);

  const headerStart = page.getByTestId('landing-header-start');
  if ((await headerStart.count()) !== 1) errors.push(`${label} should have exactly one landing header start action.`);

  const headerLoginActionCount = await page.locator('header, body').getByRole('link', { name: /^Đăng nhập$/ }).count();
  if (headerLoginActionCount > 0) errors.push(`${label} still shows a separate Đăng nhập action.`);

  const headerStartHref = await headerStart.first().getAttribute('href');
  if (headerStartHref !== '/login') errors.push(`${label} header Bắt đầu href should be /login, got ${headerStartHref}`);

  const heroStart = page.getByTestId('landing-hero-start');
  if ((await heroStart.count()) !== 1) errors.push(`${label} should have one hero start action.`);
  const heroStartHref = await heroStart.first().getAttribute('href');
  if (heroStartHref !== '/login') errors.push(`${label} hero Bắt đầu miễn phí href should be /login, got ${heroStartHref}`);

  const demoHref = await page.getByRole('link', { name: /Xem demo/i }).first().getAttribute('href').catch(() => null);
  if (demoHref !== '#landing-preview') errors.push(`${label} Xem demo should scroll to #landing-preview, got ${demoHref}`);
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

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await checkLanding(page, `/ ${viewport.width}x${viewport.height}`, errors);
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await waitForApp(page, slogan);
  await page.getByTestId('landing-header-start').click();
  await page.waitForURL('**/login', { timeout: 15000 });
  await waitForApp(page, 'Tiếp tục học ngay');

  await page.goto(`${baseUrl}/auth/google`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'Google');
  const authPageText = await page.locator('body').innerText();
  if (/Route chưa có/i.test(authPageText)) errors.push('/auth/google shows NotFound route text.');

  await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'Hôm nay học gì?');
  await checkOverflow(page, '/home 1366x768', errors);

  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'AI góp ý cách nói');
  await checkOverflow(page, '/shadowing 1366x768', errors);

  for (const shot of screenshots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    if (shot.viaStartClick) {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      await waitForApp(page, slogan);
      await page.getByTestId('landing-header-start').click();
      await page.waitForURL('**/login', { timeout: 15000 });
    } else {
      await page.goto(`${baseUrl}${shot.url}`, { waitUntil: 'networkidle' });
    }
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

  console.log(`Z4.5.1 landing header and free slogan QA passed. Screenshots saved to ${outDir}`);
})();
