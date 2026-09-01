const { chromium } = require('playwright');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const screenshots = [];
const checks = [];
const errors = [];

async function capture(page, name) {
  const path = `reports/screenshots/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  screenshots.push(path);
}

async function expectVisible(locator, label) {
  try {
    await locator.waitFor({ state: 'visible', timeout: 8000 });
    checks.push(label);
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.keyboard.press('F12');
  await expectVisible(page.getByTestId('devtools-joke-modal'), 'F12 opens playful DevTools modal.');
  await page.keyboard.press('Escape');
  await page.getByTestId('devtools-joke-modal').waitFor({ state: 'hidden', timeout: 5000 }).catch((error) => errors.push(`Escape closes DevTools modal: ${error.message}`));
  checks.push('Escape closes DevTools modal.');
  await page.waitForTimeout(1250);

  await page.keyboard.press('Control+Shift+I');
  await expectVisible(page.getByTestId('devtools-joke-modal'), 'Ctrl+Shift+I opens playful DevTools modal.');
  await page.mouse.click(12, 12);
  await page.getByTestId('devtools-joke-modal').waitFor({ state: 'hidden', timeout: 5000 }).catch((error) => errors.push(`Outside click closes DevTools modal: ${error.message}`));
  checks.push('Outside overlay click closes DevTools modal.');
  await page.waitForTimeout(1250);

  await page.keyboard.press('Control+Shift+J');
  await expectVisible(page.getByTestId('devtools-joke-modal'), 'Ctrl+Shift+J opens playful DevTools modal.');
  await page.getByTestId('devtools-joke-close').click();

  await page.waitForTimeout(1250);
  await page.keyboard.press('Control+U');
  await expectVisible(page.getByTestId('devtools-joke-modal'), 'Ctrl+U opens playful DevTools modal.');
  await page.getByTestId('devtools-joke-learn').click();
  await page.waitForURL(/\/learning-path|\/login\?redirectTo=/, { timeout: 8000 }).catch((error) => errors.push(`DevTools learning CTA routes toward learning path: ${error.message}`));
  checks.push('DevTools learning CTA routes toward the learning path.');

  await page.goto(`${baseUrl}/poo-bam-lac-404`, { waitUntil: 'networkidle' });
  await expectVisible(page.getByTestId('penglish-404-page'), 'Fun 404 page renders.');
  await capture(page, 'penglish-easter-eggs-404-desktop');

  await page.getByTestId('footer-easter-egg-button').click();
  await expectVisible(page.getByTestId('footer-easter-egg-modal'), 'Footer easter egg opens only after click.');
  await page.getByTestId('footer-easter-egg-close').click();
  await page.getByTestId('footer-easter-egg-modal').waitFor({ state: 'hidden', timeout: 5000 }).catch((error) => errors.push(`Footer easter egg closes: ${error.message}`));
  checks.push('Footer easter egg closes cleanly.');

  await page.keyboard.press('p');
  await page.keyboard.press('o');
  await page.keyboard.press('o');
  await expectVisible(page.getByTestId('secret-poo-toast'), 'Typing secret sequence poo shows toast.');

  await page.goto(`${baseUrl}/shared-streak`, { waitUntil: 'networkidle' });
  const emailInput = page.getByPlaceholder('Email bạn bè');
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill('poo');
    const toastVisibleInInput = await page.getByTestId('secret-poo-toast').isVisible().catch(() => false);
    if (toastVisibleInInput) errors.push('Secret poo toast activated while typing in an input.');
    else checks.push('Typing poo inside an input does not activate the secret toast.');
  } else {
    checks.push('Input suppression path skipped because protected Shared Streak route redirected before form render.');
  }

  const widths = [1366, 768, 390];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto(`${baseUrl}/poo-bam-lac-404`, { waitUntil: 'networkidle' });
    await expectVisible(page.getByTestId('penglish-404-page'), `404 page renders at ${width}px viewport.`);
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (hasHorizontalScroll) errors.push(`Horizontal scroll detected at ${width}px.`);
    else checks.push(`No horizontal scroll at ${width}px.`);
    if (width === 390) await capture(page, 'penglish-easter-eggs-404-mobile');
  }

  if (consoleErrors.length) errors.push(`Console/page errors: ${consoleErrors.join(' | ')}`);
  else checks.push('No console/page errors detected during Easter Egg QA.');

  await browser.close();

  const result = { ok: errors.length === 0, baseUrl, screenshots, checks, errors };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
