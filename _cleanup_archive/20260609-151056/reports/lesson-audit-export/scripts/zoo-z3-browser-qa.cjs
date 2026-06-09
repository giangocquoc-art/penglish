const { chromium } = require('playwright');
const path = require('path');

const baseUrl = 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routes = [
  { url: '/shadowing', file: 'zoo-z3-shadowing-desktop.png', width: 1440, height: 1000, waitFor: 'Phòng nói đuổi bình tĩnh' },
  { url: '/shadowing', file: 'zoo-z3-shadowing-mobile.png', width: 390, height: 900, waitFor: 'Phòng nói đuổi bình tĩnh' },
  { url: '/english-speed', file: 'zoo-z3-english-speed-desktop.png', width: 1440, height: 1000, waitFor: 'Một phòng phát âm gọn' },
  { url: '/english-speed', file: 'zoo-z3-english-speed-mobile.png', width: 390, height: 900, waitFor: 'Một phòng phát âm gọn' },
  { url: '/home', file: 'zoo-z3-home-regression-check.png', width: 1440, height: 1100, waitFor: 'P-English' },
  { url: '/learning-path', file: 'zoo-z3-learning-path-regression-check.png', width: 1440, height: 1100, waitFor: 'Lộ trình học' },
];

function isEditableTag(tagName) {
  return ['TEXTAREA', 'INPUT', 'SELECT'].includes(tagName);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];
  const local8080Requests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('request', (request) => {
    if (request.url().includes('localhost:8080')) local8080Requests.push(request.url());
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  for (const route of routes) {
    await page.setViewportSize({ width: route.width, height: route.height });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.getByText(route.waitFor, { exact: false }).first().waitFor({ timeout: 15000 });

    const overflow = await page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    if (overflow.hasHorizontalOverflow) {
      errors.push(`horizontal overflow on ${route.url}: ${JSON.stringify(overflow)}`);
    }

    await page.screenshot({ path: path.join(outDir, route.file), fullPage: true });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.getByTestId('shadowing-custom-title-input').fill('Zoo Z3 custom shadowing');
  await page.getByTestId('shadowing-custom-transcript-textarea').fill('Hello from the calm room.\nI can practice one sentence at a time.');
  await page.getByTestId('shadowing-create-custom-button').click();
  await page.getByText('Đã tạo bài luyện', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByTestId('shadowing-transcript-panel').waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z3-shadowing-custom-transcript.png'), fullPage: true });

  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'networkidle' });
  await page.getByTestId('english-speed-manual-textarea').fill('Hello, my name is Anna.');
  await page.getByTestId('english-speed-manual-check').click();
  await page.getByText('Phản hồi phát âm', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z3-english-speed-manual-fallback.png'), fullPage: true });

  await page.getByTestId('english-speed-retry').click();
  await page.getByTestId('english-speed-manual-textarea').fill('Hello, my name is Anna.');
  await page.getByTestId('english-speed-manual-textarea').focus();
  await page.keyboard.press('Enter');
  await page.getByText('Phản hồi phát âm', { exact: false }).first().waitFor({ timeout: 15000 });

  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('r');
  await page.getByTestId('english-speed-manual-textarea').waitFor({ timeout: 15000 });
  await page.keyboard.press('n');
  await page.getByTestId('english-speed-manual-textarea').waitFor({ timeout: 15000 });

  const selectorState = await page.evaluate(() => ({
    shadowing: {
      transcript: Boolean(document.querySelector('[data-testid="shadowing-transcript-panel"]')),
      customTitle: Boolean(document.querySelector('[data-testid="shadowing-custom-title-input"]')),
      customTranscript: Boolean(document.querySelector('[data-testid="shadowing-custom-transcript-textarea"]')),
      createCustom: Boolean(document.querySelector('[data-testid="shadowing-create-custom-button"]')),
    },
    englishSpeed: {
      manualTextarea: Boolean(document.querySelector('[data-testid="english-speed-manual-textarea"]')),
      manualCheck: Boolean(document.querySelector('[data-testid="english-speed-manual-check"]')),
    },
  }));

  if (!selectorState.englishSpeed.manualTextarea || !selectorState.englishSpeed.manualCheck) {
    errors.push(`English Speed stable selector missing: ${JSON.stringify(selectorState.englishSpeed)}`);
  }

  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  const shadowingSelectors = await page.evaluate(() => ({
    transcript: Boolean(document.querySelector('[data-testid="shadowing-transcript-panel"]')),
    customTitle: Boolean(document.querySelector('[data-testid="shadowing-custom-title-input"]')),
    customTranscript: Boolean(document.querySelector('[data-testid="shadowing-custom-transcript-textarea"]')),
    createCustom: Boolean(document.querySelector('[data-testid="shadowing-create-custom-button"]')),
  }));
  if (!shadowingSelectors.transcript || !shadowingSelectors.customTitle || !shadowingSelectors.customTranscript || !shadowingSelectors.createCustom) {
    errors.push(`Shadowing stable selector missing: ${JSON.stringify(shadowingSelectors)}`);
  }

  await browser.close();

  const filteredFailedRequests = failedRequests.filter((item) => !item.includes('favicon'));
  if (filteredFailedRequests.length) errors.push(`failed requests:\n${filteredFailedRequests.join('\n')}`);
  if (local8080Requests.length) errors.push(`localhost:8080 requests:\n${local8080Requests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`Z3 QA passed for ${routes.length} routes. Screenshots saved to ${outDir}`);
})();
