const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const preferredBaseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5181';
const fallbackBaseUrl = 'http://127.0.0.1:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const forbiddenVisibleStrings = [
  'Nhập lại câu bạn vừa nói',
  'Bạn vừa nói/nghe được gì?',
  'So sánh local',
  'Local feedback',
  'Không gửi Gemini/API',
  'Poo đang dùng phản hồi local',
];

const requiredShadowingStrings = [
  'Ghi âm câu bạn vừa nói',
  'Bắt đầu ghi âm',
  'AI feedback',
];

async function resolveBaseUrl(page) {
  for (const baseUrl of [preferredBaseUrl, fallbackBaseUrl]) {
    try {
      const response = await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      if (response && response.status() < 500) return baseUrl;
    } catch {
      // Try the next dev-server port.
    }
  }
  return preferredBaseUrl;
}

async function checkNoHorizontalOverflow(page, route, width) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) return `horizontal overflow on ${route} ${width}px: ${JSON.stringify(overflow)}`;
  return null;
}

async function countBrokenImages(page) {
  return page.evaluate(() => Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.currentSrc || img.src || img.alt));
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const notes = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('Failed to load resource') && text.includes('503')) return;
    errors.push(`console error on ${page.url()}: ${text}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!url.includes('favicon') && !url.includes('/@fs/')) failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  const baseUrl = await resolveBaseUrl(page);

  const regressionRoutes = [
    { route: '/home', waitFor: /Hôm nay|Home|học/i },
    { route: '/shadowing', waitFor: /Ghi âm câu bạn vừa nói/i },
    { route: '/english-speed', waitFor: /English Speed|Nghe|nói/i },
  ];

  for (const item of regressionRoutes) {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(`${baseUrl}${item.route}`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.getByText(item.waitFor).first().waitFor({ timeout: 15000 });
    const overflowError = await checkNoHorizontalOverflow(page, item.route, 1366);
    if (overflowError) errors.push(overflowError);
    const text = await page.locator('body').innerText();
    if (text.includes('Pshare')) errors.push(`Pshare text found on ${item.route}`);
    const brokenImages = await countBrokenImages(page);
    if (brokenImages.length) errors.push(`broken images on ${item.route}: ${brokenImages.join(', ')}`);
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.getByText('Ghi âm câu bạn vừa nói', { exact: false }).first().waitFor({ timeout: 15000 });

  const visibleText = await page.locator('body').innerText();
  for (const forbidden of forbiddenVisibleStrings) {
    if (visibleText.includes(forbidden)) errors.push(`forbidden old manual/local string is visible: ${forbidden}`);
  }
  for (const required of requiredShadowingStrings) {
    if (!visibleText.includes(required)) errors.push(`required recording-first string missing: ${required}`);
  }

  const shadowingSelectors = await page.evaluate(() => ({
    recordingCard: Boolean(document.querySelector('[data-testid="shadowing-recording-card"]')),
    recordButton: Boolean(document.querySelector('[data-testid="shadowing-record-button"]')),
    oldTypeInput: Boolean(document.querySelector('[data-testid="shadowing-type-input"]')),
    oldFeedbackButton: Boolean(document.querySelector('[data-testid="shadowing-feedback-button"]')),
  }));
  if (!shadowingSelectors.recordingCard || !shadowingSelectors.recordButton) errors.push(`recording-first selectors missing: ${JSON.stringify(shadowingSelectors)}`);
  if (shadowingSelectors.oldTypeInput || shadowingSelectors.oldFeedbackButton) errors.push(`old manual selectors still present: ${JSON.stringify(shadowingSelectors)}`);

  await page.screenshot({ path: path.join(outDir, 'zoo-z4-8r-shadowing-api-first-desktop.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.getByText('Ghi âm câu bạn vừa nói', { exact: false }).first().waitFor({ timeout: 15000 });
  const mobileOverflow = await checkNoHorizontalOverflow(page, '/shadowing', 390);
  if (mobileOverflow) errors.push(mobileOverflow);
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-8r-shadowing-api-first-mobile.png'), fullPage: true });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await page.route('**/api/shadowing-feedback', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'GEMINI_API_KEY_MISSING', message: 'API góp ý chưa bật. Cần thêm GEMINI_API_KEY trên server/Vercel.' }),
    });
  });
  await page.evaluate(() => {
    const OriginalMediaRecorder = window.MediaRecorder;
    class MockMediaRecorder extends EventTarget {
      constructor(stream) {
        super();
        this.stream = stream;
        this.state = 'inactive';
        this.mimeType = 'audio/webm';
      }
      start() {
        this.state = 'recording';
        setTimeout(() => {
          if (this.ondataavailable) this.ondataavailable({ data: new Blob(['zoo-audio'], { type: 'audio/webm' }) });
        }, 50);
      }
      stop() {
        this.state = 'inactive';
        if (this.onstop) this.onstop();
      }
      static isTypeSupported() { return true; }
    }
    window.__OriginalMediaRecorder = OriginalMediaRecorder;
    window.MediaRecorder = MockMediaRecorder;
    navigator.mediaDevices = navigator.mediaDevices || {};
    navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop() {} }] });
  });
  await page.getByTestId('shadowing-record-button').click();
  await page.getByText('Dừng và gửi Poo chấm', { exact: false }).first().waitFor({ timeout: 5000 });
  await page.getByTestId('shadowing-record-button').click();
  await page.getByText('API góp ý chưa bật. Cần thêm GEMINI_API_KEY trên server/Vercel.', { exact: false }).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-8r-shadowing-api-missing-key.png'), fullPage: true });
  notes.push('Recording interaction used a mocked MediaRecorder because headless browser microphone permission is environment-dependent.');

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'zoo-z4-8r-home-regression.png'), fullPage: true });

  const frontendFiles = [
    path.resolve(__dirname, '..', 'apps', 'web', 'src', 'pages', 'ShadowingPage.tsx'),
    path.resolve(__dirname, '..', 'apps', 'web', 'src', 'lib', 'p-english', 'shadowingApiClient.ts'),
  ];
  for (const file of frontendFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('VITE_GEMINI_API_KEY')) errors.push(`${path.relative(path.resolve(__dirname, '..'), file)} references VITE_GEMINI_API_KEY`);
  }
  const actualKey = process.env.GEMINI_API_KEY;
  if (actualKey) {
    for (const file of frontendFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes(actualKey)) errors.push(`${path.relative(path.resolve(__dirname, '..'), file)} contains actual GEMINI_API_KEY value`);
    }
  }

  if (failedRequests.length) errors.push(`failed requests:\n${failedRequests.join('\n')}`);
  await browser.close();

  if (errors.length) {
    console.error(errors.join('\n'));
    if (notes.length) console.log(`QA notes:\n${notes.join('\n')}`);
    process.exit(1);
  }

  console.log(`Z4.8R Shadowing API-first QA passed at ${baseUrl}. Screenshots saved to ${outDir}`);
  if (notes.length) console.log(`QA notes:\n${notes.join('\n')}`);
})();
