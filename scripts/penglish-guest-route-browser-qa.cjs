const { chromium } = require('playwright');

const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const ROUTES = ['/folders', '/categories', '/vocabularies', '/chat', '/shared-streak', '/leaderboard', '/shop', '/ai', '/pricing'];
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  const results = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  for (const route of ROUTES) {
    const responseErrors = [];
    const listener = (response) => {
      if (response.status() >= 400) responseErrors.push(`${response.status()} ${new URL(response.url()).pathname}`);
    };
    page.on('response', listener);
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="penglish-shell-content"]').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    const bodyText = await page.locator('body').innerText();
    const shellVisible = await page.locator('[data-testid="penglish-shell-content"]').isVisible().catch(() => false);
    const screenshotName = route.slice(1).replace(/\//g, '-') || 'home';
    await page.screenshot({ path: `reports/screenshots/guest-${screenshotName}.png`, fullPage: true });
    results.push({
      route,
      shellVisible,
      rawJson: bodyText.trimStart().startsWith('{'),
      genericError: /Poo chưa (mở|tải|kết nối)/i.test(bodyText),
      hasEmoji: EMOJI_PATTERN.test(bodyText),
      responseErrors,
    });
    page.off('response', listener);
  }

  await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Đặc biệt/i }).click();
  await page.waitForTimeout(300);
  const shopText = await page.locator('body').innerText();
  const shopItemsVisible = ['Streak Shield', 'Blue Theme', 'Typing SFX'].every((label) => shopText.includes(label));
  await page.screenshot({ path: 'reports/screenshots/shop-special-no-emoji.png', fullPage: true });

  await page.goto(`${BASE_URL}/ai`, { waitUntil: 'networkidle' });
  await page.getByRole('textbox').fill('travel beach');
  await page.getByRole('button', { name: 'Sinh từ vựng', exact: true }).click();
  await page.getByText(/Kết quả \(2 từ\)/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  const aiGenerationVisible = await page.getByText(/Kết quả \(2 từ\)/i).isVisible().catch(() => false);

  await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
  const comingSoonButtons = page.getByRole('button', { name: 'Cổng ủng hộ sắp mở', exact: true });
  const supportButtonsDisabled = await comingSoonButtons.count() === 2
    && await comingSoonButtons.evaluateAll((buttons) => buttons.every((button) => button.disabled));

  const failedRoutes = results.filter((result) => (
    !result.shellVisible
    || result.rawJson
    || result.genericError
    || result.hasEmoji
    || result.responseErrors.length > 0
  ));
  const summary = { baseUrl: BASE_URL, routeCount: results.length, failedRoutes, shopItemsVisible, aiGenerationVisible, supportButtonsDisabled, consoleErrors, pageErrors };
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();

  if (failedRoutes.length || !shopItemsVisible || !aiGenerationVisible || !supportButtonsDisabled || consoleErrors.length || pageErrors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
