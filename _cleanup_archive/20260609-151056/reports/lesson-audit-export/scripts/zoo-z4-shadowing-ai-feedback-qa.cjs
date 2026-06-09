const { chromium } = require('playwright');
const path = require('path');

const baseUrl = 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routes = [
  { url: '/shadowing', file: 'zoo-z4-shadowing-ai-feedback-desktop.png', width: 1440, height: 1050, waitFor: 'AI góp ý cách nói' },
  { url: '/shadowing', file: 'zoo-z4-shadowing-ai-feedback-mobile.png', width: 390, height: 950, waitFor: 'AI góp ý cách nói' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
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
      errors.push(`horizontal overflow on ${route.url} ${route.width}px: ${JSON.stringify(overflow)}`);
    }

    await page.screenshot({ path: path.join(outDir, route.file), fullPage: true });
  }

  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.getByText('Phòng nói đuổi bình tĩnh', { exact: false }).first().waitFor({ timeout: 15000 });

  const selectorState = await page.evaluate(() => ({
    existing: {
      transcript: Boolean(document.querySelector('[data-testid="shadowing-transcript-panel"]')),
      customTitle: Boolean(document.querySelector('[data-testid="shadowing-custom-title-input"]')),
      customTranscript: Boolean(document.querySelector('[data-testid="shadowing-custom-transcript-textarea"]')),
      createCustom: Boolean(document.querySelector('[data-testid="shadowing-create-custom-button"]')),
    },
    ai: {
      panel: Boolean(document.querySelector('[data-testid="shadowing-ai-feedback-panel"]')),
      action: Boolean(document.querySelector('[data-testid="shadowing-ai-feedback-action"]')),
      learnerTextarea: Boolean(document.querySelector('[data-testid="shadowing-ai-learner-textarea"]')),
      localModeNote: Boolean(document.querySelector('[data-testid="shadowing-ai-local-mode-note"]')),
    },
  }));

  if (!selectorState.existing.transcript || !selectorState.existing.customTitle || !selectorState.existing.customTranscript || !selectorState.existing.createCustom) {
    errors.push(`Shadowing Z3 selector missing: ${JSON.stringify(selectorState.existing)}`);
  }
  if (!selectorState.ai.action || !selectorState.ai.learnerTextarea || !selectorState.ai.localModeNote) {
    errors.push(`Shadowing Z4 AI selector missing before action: ${JSON.stringify(selectorState.ai)}`);
  }

  await page.getByTestId('shadowing-ai-learner-textarea').fill('Hi Mai how are today');
  await page.getByTestId('shadowing-ai-feedback-action').click();
  await page.getByTestId('shadowing-ai-feedback-panel').waitFor({ timeout: 15000 });
  await page.getByText('Từ bị thiếu', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-shadowing-ai-feedback-result.png'), fullPage: true });

  const feedbackPanelExists = await page.getByTestId('shadowing-ai-feedback-panel').count();
  if (!feedbackPanelExists) errors.push('Shadowing AI feedback panel did not appear after action.');

  await page.getByTestId('shadowing-custom-title-input').fill('Zoo Z4 custom shadowing');
  await page.getByTestId('shadowing-custom-transcript-textarea').fill('Hello from the Z four room.\nI can still create custom practice.');
  await page.getByTestId('shadowing-create-custom-button').click();
  await page.getByText('Đã tạo bài luyện', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByTestId('shadowing-transcript-panel').waitFor({ timeout: 15000 });
  await page.getByText('Zoo Z4 custom shadowing', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-shadowing-custom-transcript-regression.png'), fullPage: true });

  const postCustomSelectors = await page.evaluate(() => ({
    transcript: Boolean(document.querySelector('[data-testid="shadowing-transcript-panel"]')),
    customTitle: Boolean(document.querySelector('[data-testid="shadowing-custom-title-input"]')),
    customTranscript: Boolean(document.querySelector('[data-testid="shadowing-custom-transcript-textarea"]')),
    createCustom: Boolean(document.querySelector('[data-testid="shadowing-create-custom-button"]')),
    action: Boolean(document.querySelector('[data-testid="shadowing-ai-feedback-action"]')),
    learnerTextarea: Boolean(document.querySelector('[data-testid="shadowing-ai-learner-textarea"]')),
    localModeNote: Boolean(document.querySelector('[data-testid="shadowing-ai-local-mode-note"]')),
  }));
  if (!Object.values(postCustomSelectors).every(Boolean)) {
    errors.push(`selectors missing after custom transcript flow: ${JSON.stringify(postCustomSelectors)}`);
  }

  await browser.close();

  const filteredFailedRequests = failedRequests.filter((item) => !item.includes('favicon'));
  if (filteredFailedRequests.length) errors.push(`failed requests:\n${filteredFailedRequests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`Z4 Shadowing AI feedback QA passed. Screenshots saved to ${outDir}`);
})();
