const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const preferredBaseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5181';
const fallbackBaseUrl = 'http://127.0.0.1:5180';
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'reports', 'screenshots');

const screenshots = {
  shadowingRecordingDesktop: 'zoo-z4-9-shadowing-recording-desktop.png',
  shadowingAiErrorOrResult: 'zoo-z4-9-shadowing-ai-error-or-result.png',
  englishSpeedDesktop: 'zoo-z4-9-english-speed-desktop.png',
  englishSpeedMobile: 'zoo-z4-9-english-speed-mobile.png',
  wordsDesktop: 'zoo-z4-9-words-desktop.png',
  wordsMobile: 'zoo-z4-9-words-mobile.png',
  homeOceanBackground: 'zoo-z4-9-home-ocean-background.png',
};

async function resolveBaseUrl(page) {
  for (const baseUrl of [preferredBaseUrl, fallbackBaseUrl]) {
    try {
      const response = await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      if (response && response.status() < 500) return baseUrl;
    } catch {
      // Try the next local dev-server port.
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

async function expectText(page, text, timeout = 15000) {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout });
}

async function installMockRecorder(page, { empty = false } = {}) {
  await page.evaluate(({ empty: shouldBeEmpty }) => {
    class MockMediaRecorder extends EventTarget {
      constructor(stream, options = {}) {
        super();
        this.stream = stream;
        this.state = 'inactive';
        this.mimeType = options.mimeType || 'audio/webm';
      }
      start() {
        this.state = 'recording';
        setTimeout(() => {
          if (!shouldBeEmpty && this.ondataavailable) this.ondataavailable({ data: new Blob(['zoo-z4-9-audio'], { type: this.mimeType || 'audio/webm' }) });
        }, 50);
      }
      stop() {
        this.state = 'inactive';
        if (this.onstop) this.onstop();
      }
      static isTypeSupported(type) {
        return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].includes(type);
      }
    }
    window.MediaRecorder = MockMediaRecorder;
    navigator.mediaDevices = navigator.mediaDevices || {};
    navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop() {} }] });
  }, { empty });
}

async function recordOnce(page) {
  await page.getByTestId('shadowing-record-button').click();
  await expectText(page, 'Dừng và gửi Poo chấm', 5000);
  await page.getByTestId('shadowing-record-button').click();
}

function checkSourceGuards(errors) {
  const guardedFiles = [
    'apps/web/src/pages/ShadowingPage.tsx',
    'apps/web/src/lib/p-english/shadowingApiClient.ts',
    'api/shadowing-feedback.ts',
  ];
  for (const relativeFile of guardedFiles) {
    const fullPath = path.join(rootDir, relativeFile);
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('VITE_GEMINI_API_KEY')) errors.push(`${relativeFile} references VITE_GEMINI_API_KEY`);
  }
  const envExample = fs.existsSync(path.join(rootDir, '.env.example')) ? fs.readFileSync(path.join(rootDir, '.env.example'), 'utf8') : '';
  if (envExample.includes('VITE_GEMINI_API_KEY')) errors.push('.env.example references VITE_GEMINI_API_KEY');
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
    if (text.includes('Failed to load resource') && (text.includes('503') || text.includes('400'))) return;
    errors.push(`console error on ${page.url()}: ${text}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!url.includes('favicon') && !url.includes('/@fs/')) failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  const baseUrl = await resolveBaseUrl(page);

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' });
  await expectText(page, 'Hôm nay');
  const oceanClasses = await page.evaluate(() => ({
    shell: Boolean(document.querySelector('.penglish-ocean-shell')),
    background: Boolean(document.querySelector('.penglish-ocean-background')),
    whale: Boolean(document.querySelector('.poo-background-swim')),
  }));
  if (!oceanClasses.shell || !oceanClasses.background || !oceanClasses.whale) errors.push(`missing shared ocean classes on /home: ${JSON.stringify(oceanClasses)}`);
  let overflowError = await checkNoHorizontalOverflow(page, '/home', 1366);
  if (overflowError) errors.push(overflowError);
  await page.screenshot({ path: path.join(outDir, screenshots.homeOceanBackground), fullPage: true });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await expectText(page, 'Ghi âm câu bạn vừa nói');
  const shadowingSelectors = await page.evaluate(() => ({
    recordingCard: Boolean(document.querySelector('[data-testid="shadowing-recording-card"]')),
    recordButton: Boolean(document.querySelector('[data-testid="shadowing-record-button"]')),
    feedbackPanel: Boolean(document.querySelector('[data-testid="shadowing-feedback-panel"]')),
    oceanShell: Boolean(document.querySelector('.penglish-ocean-shell')),
    oceanBackground: Boolean(document.querySelector('.penglish-ocean-background')),
    pooBackgroundSwim: Boolean(document.querySelector('.poo-background-swim')),
  }));
  if (!shadowingSelectors.recordingCard || !shadowingSelectors.recordButton || !shadowingSelectors.oceanShell || !shadowingSelectors.oceanBackground || !shadowingSelectors.pooBackgroundSwim) errors.push(`shadowing selectors/classes missing: ${JSON.stringify(shadowingSelectors)}`);
  overflowError = await checkNoHorizontalOverflow(page, '/shadowing', 1366);
  if (overflowError) errors.push(overflowError);
  await installMockRecorder(page, { empty: true });
  await recordOnce(page);
  await expectText(page, 'Poo chưa nghe được âm thanh. Bạn thử nói gần micro hơn hoặc ghi âm lại nhé.');
  await page.screenshot({ path: path.join(outDir, screenshots.shadowingRecordingDesktop), fullPage: true });

  await page.route('**/api/shadowing-feedback', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'GEMINI_API_KEY_MISSING', message: 'API góp ý chưa bật. Cần thêm GEMINI_API_KEY trên server/Vercel rồi deploy lại.' }),
    });
  });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await expectText(page, 'Ghi âm câu bạn vừa nói');
  await installMockRecorder(page, { empty: false });
  await recordOnce(page);
  await expectText(page, 'API góp ý chưa bật. Cần thêm GEMINI_API_KEY trên server/Vercel rồi deploy lại.');
  await page.screenshot({ path: path.join(outDir, screenshots.shadowingAiErrorOrResult), fullPage: true });
  notes.push('Shadowing recording QA uses mocked MediaRecorder because headless browser microphone capture is environment-dependent.');

  await page.unroute('**/api/shadowing-feedback');

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'networkidle' });
  await expectText(page, 'Poo pronunciation mode');
  const speedDesktop = await page.evaluate(() => ({
    modeBadges: document.querySelectorAll('[data-testid="english-speed-mode-badge"]').length,
    oceanShell: Boolean(document.querySelector('.penglish-ocean-shell')),
    bodyText: document.body.innerText,
  }));
  if (speedDesktop.modeBadges !== 1) errors.push(`English Speed desktop should have one mode badge, found ${speedDesktop.modeBadges}`);
  if (!speedDesktop.oceanShell) errors.push('English Speed desktop missing ocean shell class');
  overflowError = await checkNoHorizontalOverflow(page, '/english-speed', 1366);
  if (overflowError) errors.push(overflowError);
  await page.screenshot({ path: path.join(outDir, screenshots.englishSpeedDesktop), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'networkidle' });
  await expectText(page, 'Poo pronunciation mode');
  const speedMobile = await page.evaluate(() => document.querySelectorAll('[data-testid="english-speed-mode-badge"]').length);
  if (speedMobile !== 1) errors.push(`English Speed mobile should have one mode badge, found ${speedMobile}`);
  overflowError = await checkNoHorizontalOverflow(page, '/english-speed', 390);
  if (overflowError) errors.push(overflowError);
  await page.screenshot({ path: path.join(outDir, screenshots.englishSpeedMobile), fullPage: true });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/words`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.penglish-ocean-shell', { timeout: 15000 });
  const wordsDesktop = await page.evaluate(() => ({
    tableVisible: Boolean(document.querySelector('table')),
    oceanShell: Boolean(document.querySelector('.penglish-ocean-shell')),
  }));
  if (!wordsDesktop.tableVisible || !wordsDesktop.oceanShell) errors.push(`Words desktop missing table/ocean shell: ${JSON.stringify(wordsDesktop)}`);
  overflowError = await checkNoHorizontalOverflow(page, '/words', 1366);
  if (overflowError) errors.push(overflowError);
  await page.screenshot({ path: path.join(outDir, screenshots.wordsDesktop), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/words`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.penglish-ocean-shell', { timeout: 15000 });
  const wordsMobile = await page.evaluate(() => ({
    wordCards: document.querySelectorAll('[data-testid^="vocab-learning-hint-"]').length,
    oceanShell: Boolean(document.querySelector('.penglish-ocean-shell')),
  }));
  if (!wordsMobile.oceanShell) errors.push('Words mobile missing ocean shell');
  overflowError = await checkNoHorizontalOverflow(page, '/words', 390);
  if (overflowError) errors.push(overflowError);
  await page.screenshot({ path: path.join(outDir, screenshots.wordsMobile), fullPage: true });

  for (const route of ['/home', '/shadowing', '/english-speed', '/words']) {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    if (route === '/words') await page.waitForSelector('.penglish-ocean-shell', { timeout: 15000 });
    const brokenImages = await countBrokenImages(page);
    if (brokenImages.length) errors.push(`broken images on ${route}: ${brokenImages.join(', ')}`);
    const text = await page.locator('body').innerText();
    if (text.includes('Pshare')) errors.push(`Pshare text found on ${route}`);
  }

  checkSourceGuards(errors);
  if (failedRequests.length) errors.push(`failed requests:\n${failedRequests.join('\n')}`);

  await browser.close();

  if (errors.length) {
    console.error(errors.join('\n'));
    if (notes.length) console.log(`QA notes:\n${notes.join('\n')}`);
    process.exit(1);
  }

  console.log(`Z4.9 Shadowing AI + UI QA passed at ${baseUrl}. Screenshots saved to ${outDir}`);
  if (notes.length) console.log(`QA notes:\n${notes.join('\n')}`);
})();
