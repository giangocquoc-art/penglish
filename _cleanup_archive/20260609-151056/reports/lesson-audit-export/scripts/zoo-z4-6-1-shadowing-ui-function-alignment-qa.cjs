const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const requiredSelectors = [
  'shadowing-page',
  'shadowing-hero',
  'shadowing-practice-card',
  'shadowing-current-sentence',
  'shadowing-listen-button',
  'shadowing-repeat-button',
  'shadowing-record-button',
  'shadowing-type-input',
  'shadowing-feedback-button',
  'shadowing-feedback-panel',
  'shadowing-lesson-picker',
  'shadowing-custom-transcript',
  'shadowing-progress',
  'poo-shadowing-coach',
];

const screenshotRoutes = [
  { url: '/shadowing', file: 'zoo-z4-6-1-shadowing-desktop-initial.png', width: 1440, height: 1100, waitFor: 'Phòng nói đuổi cùng Poo' },
  { url: '/shadowing', file: 'zoo-z4-6-1-shadowing-mobile-initial.png', width: 390, height: 980, waitFor: 'Phòng nói đuổi cùng Poo' },
  { url: '/home', file: 'zoo-z4-6-1-home-regression.png', width: 1440, height: 1100, waitFor: 'P-English' },
  { url: '/english-speed', file: 'zoo-z4-6-1-english-speed-regression.png', width: 1440, height: 1050, waitFor: 'Một phòng phát âm gọn' },
];

function assertNoHorizontalOverflow(errors, route, overflow) {
  if (overflow.hasHorizontalOverflow) {
    errors.push(`horizontal overflow on ${route.url} at ${route.width}px: ${JSON.stringify(overflow)}`);
  }
}

async function checkOverflow(page) {
  return page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

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

  for (const route of screenshotRoutes) {
    await page.setViewportSize({ width: route.width, height: route.height });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.getByText(route.waitFor, { exact: false }).first().waitFor({ timeout: 15000 });
    assertNoHorizontalOverflow(errors, route, await checkOverflow(page));
    await page.screenshot({ path: path.join(outDir, route.file), fullPage: true });
  }

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.getByTestId('shadowing-page').waitFor({ timeout: 15000 });

  const selectorState = await page.evaluate((selectors) => Object.fromEntries(selectors.map((selector) => [selector, Boolean(document.querySelector(`[data-testid="${selector}"]`))])), requiredSelectors);
  const missingSelectors = Object.entries(selectorState).filter(([, exists]) => !exists).map(([selector]) => selector);
  if (missingSelectors.length) errors.push(`missing required Shadowing selectors: ${missingSelectors.join(', ')}`);

  const honestyText = await page.evaluate(() => document.body.innerText);
  const requiredText = [
    'Đang dùng phản hồi local',
    'Gemini API chưa bật',
    'Không gửi Gemini/API',
    'Transcript-only',
  ];
  const missingHonestyText = requiredText.filter((text) => !honestyText.includes(text));
  if (missingHonestyText.length) errors.push(`missing functional honesty text: ${missingHonestyText.join(' | ')}`);
  if (honestyText.includes('Đang dùng Gemini API')) errors.push('page incorrectly claims Gemini API is active');
  await page.getByTestId('shadowing-custom-transcript').scrollIntoViewIfNeeded();
  await page.getByText('Video URL chỉ là liên kết tham chiếu tuỳ chọn, không phải upload', { exact: false }).first().waitFor({ timeout: 15000 });

  await page.getByTestId('shadowing-listen-button').click();
  await page.getByTestId('shadowing-repeat-button').click();
  await page.getByTestId('shadowing-type-input').fill('Hi Mai how are today');
  await page.getByTestId('shadowing-feedback-button').click();
  await page.getByText('Từ bị thiếu', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByText('Micro-task tiếp theo', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-6-1-shadowing-desktop-feedback.png'), fullPage: true });

  const feedbackSelectors = await page.evaluate(() => ({
    panel: Boolean(document.querySelector('[data-testid="shadowing-feedback-panel"]')),
    typeInput: Boolean(document.querySelector('[data-testid="shadowing-type-input"]')),
    progress: Boolean(document.querySelector('[data-testid="shadowing-progress"]')),
    poo: Boolean(document.querySelector('[data-testid="poo-shadowing-coach"]')),
  }));
  if (!Object.values(feedbackSelectors).every(Boolean)) errors.push(`feedback selectors missing after action: ${JSON.stringify(feedbackSelectors)}`);

  await page.setViewportSize({ width: 390, height: 980 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.getByTestId('shadowing-type-input').fill('Hi Mai how are today');
  await page.getByTestId('shadowing-feedback-button').click();
  await page.getByText('Từ bị thiếu', { exact: false }).first().waitFor({ timeout: 15000 });
  assertNoHorizontalOverflow(errors, { url: '/shadowing feedback mobile', width: 390 }, await checkOverflow(page));
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-6-1-shadowing-mobile-feedback.png'), fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.getByTestId('shadowing-custom-title-input').fill('Zoo Z4.6.1 custom shadowing');
  await page.getByTestId('shadowing-custom-transcript-textarea').fill('Hello from Poo ocean room.\nI can practice one short sentence.');
  await page.getByTestId('shadowing-create-custom-button').click();
  await page.getByText('Đã tạo bài luyện', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByText('Zoo Z4.6.1 custom shadowing', { exact: false }).first().waitFor({ timeout: 15000 });

  const postCustomSelectors = await page.evaluate((selectors) => Object.fromEntries(selectors.map((selector) => [selector, Boolean(document.querySelector(`[data-testid="${selector}"]`))])), requiredSelectors);
  const missingPostCustom = Object.entries(postCustomSelectors).filter(([, exists]) => !exists).map(([selector]) => selector);
  if (missingPostCustom.length) errors.push(`required selectors missing after custom transcript flow: ${missingPostCustom.join(', ')}`);

  await browser.close();

  const filteredFailedRequests = failedRequests.filter((item) => !item.includes('favicon'));
  if (filteredFailedRequests.length) errors.push(`failed requests:\n${filteredFailedRequests.join('\n')}`);
  if (local8080Requests.length) errors.push(`localhost:8080 requests:\n${local8080Requests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Z4.6.1 Shadowing UI function alignment QA passed. Screenshots saved to ${outDir}`);
})();
