const { chromium } = require('playwright');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const screenshots = [
  { url: '/login', file: 'zoo-z4-3-1-login-logo-fixed.png', width: 390, height: 844, waitForText: 'Bắt đầu học P-English' },
  { url: '/home', file: 'zoo-z4-3-1-home-mobile-skills-fixed.png', width: 390, height: 844, waitForText: 'Tổng quan năng lực', scrollToSkills: true },
  { url: '/home', file: 'zoo-z4-3-1-home-desktop-regression.png', width: 1366, height: 768, waitForText: 'Hôm nay học gì?' },
  { url: '/shadowing', file: 'zoo-z4-3-1-shadowing-desktop-regression.png', width: 1366, height: 768, waitForText: 'AI góp ý cách nói' },
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
  await checkOverflow(page, '/login 390x844', errors);

  const brokenImages = await page.evaluate(() => Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => ({ src: img.currentSrc || img.src, alt: img.alt })));
  if (brokenImages.length) errors.push(`/login has broken image(s): ${JSON.stringify(brokenImages)}`);

  const loginText = await page.locator('body').innerText();
  if (/Pshare/i.test(loginText)) errors.push('/login still contains old Pshare text.');

  const logoAltCount = await page.locator('img[alt="P-English logo"]').count();
  if (logoAltCount < 1) errors.push('/login does not show the P-English logo image.');

  const continueButton = page.getByTestId('login-continue-local');
  if (!(await continueButton.count())) errors.push('login primary continue button is missing.');
  await continueButton.click();
  await page.waitForURL('**/home', { timeout: 15000 });
  await waitForApp(page, 'Hôm nay học gì?');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'Tổng quan năng lực');
  await checkOverflow(page, '/home 390x844', errors);

  const skillState = await page.evaluate(() => {
    const section = document.querySelector('[data-testid="home-skill-overview-section"]');
    const cards = Array.from(document.querySelectorAll('[data-testid="skill-coverage-card"]'));
    const readableCards = cards.filter((card) => {
      const rect = card.getBoundingClientRect();
      const style = window.getComputedStyle(card);
      const opacity = Number(style.opacity || '1');
      return rect.width >= 250 && rect.height >= 64 && opacity >= 0.9 && style.visibility !== 'hidden' && style.display !== 'none' && card.textContent.trim().length > 0;
    });
    const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const navRect = nav?.getBoundingClientRect();
    return {
      sectionVisible: Boolean(section) && section.getBoundingClientRect().height > 0,
      cardCount: cards.length,
      readableCount: readableCards.length,
      cardTexts: cards.map((card) => card.textContent.trim()),
      navVisible: Boolean(navRect) && navRect.width > 0 && navRect.height > 0,
      navBottomAligned: Boolean(navRect) && Math.abs(window.innerHeight - navRect.bottom) < 80,
      navItemCount: nav ? nav.querySelectorAll('a').length : 0,
    };
  });

  if (!skillState.sectionVisible) errors.push(`skill overview section is not visible on mobile: ${JSON.stringify(skillState)}`);
  if (skillState.readableCount < 6) errors.push(`expected at least 6 readable skill cards on mobile: ${JSON.stringify(skillState)}`);
  if (!skillState.navVisible || !skillState.navBottomAligned || skillState.navItemCount < 5) errors.push(`bottom nav unusable on mobile home: ${JSON.stringify(skillState)}`);

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'Hôm nay học gì?');
  await checkOverflow(page, '/home 1366x768', errors);

  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'AI góp ý cách nói');
  await checkOverflow(page, '/shadowing 1366x768', errors);

  for (const shot of screenshots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(`${baseUrl}${shot.url}`, { waitUntil: 'networkidle' });
    await waitForApp(page, shot.waitForText);
    if (shot.scrollToSkills) {
      await page.getByText('Tổng quan năng lực', { exact: false }).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
    }
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

  console.log(`Z4.3.1 login and mobile home polish QA passed. Screenshots saved to ${outDir}`);
})();
