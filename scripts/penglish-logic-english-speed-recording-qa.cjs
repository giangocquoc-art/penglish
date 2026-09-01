const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_LOGIC_QA_BASE_URL || 'http://127.0.0.1:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-logic');

function isAllowedFailedRequest(url) {
  return url.includes('favicon')
    || url.includes('chrome-extension')
    || url.includes('/ocean/ambient-whale/frames/');
}

async function waitForEnglishSpeed(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.getByTestId('speed-current-prompt').waitFor({ timeout: 20000 });
  await page.getByTestId('speed-record-button').waitFor({ timeout: 10000 });
  await page.getByText('Ghi âm câu đọc', { exact: false }).first().waitFor({ timeout: 10000 });
}

async function installMockRecorder(page) {
  await page.addInitScript(() => {
    class MockMediaRecorder extends EventTarget {
      static isTypeSupported() {
        return true;
      }

      constructor(stream, options = {}) {
        super();
        this.stream = stream;
        this.mimeType = options.mimeType || 'audio/webm';
        this.state = 'inactive';
        this.ondataavailable = null;
        this.onerror = null;
        this.onstop = null;
      }

      start() {
        this.state = 'recording';
      }

      stop() {
        if (this.state !== 'recording') return;
        this.state = 'inactive';
        const blob = new Blob(['penglish-local-recording'], { type: this.mimeType || 'audio/webm' });
        const event = { data: blob };
        this.ondataavailable?.(event);
        this.dispatchEvent(new Event('dataavailable'));
        this.onstop?.(new Event('stop'));
        this.dispatchEvent(new Event('stop'));
      }
    }

    const track = { stop() {}, kind: 'audio', enabled: true, readyState: 'live' };
    const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => stream,
      },
    });
    window.MediaRecorder = MockMediaRecorder;
  });
}

async function assertNoUploadRequests(page, action, errors) {
  const uploadRequests = [];
  const listener = (request) => {
    const url = request.url();
    const method = request.method();
    if (method !== 'GET' || /shadowing-feedback|api|supabase|storage|localhost:8080/i.test(url)) {
      uploadRequests.push(`${method} ${url}`);
    }
  };
  page.on('request', listener);
  await action();
  await page.waitForTimeout(500);
  page.off('request', listener);
  const unexpected = uploadRequests.filter((item) => !item.includes('/ocean/ambient-whale/frames/') && !item.includes('favicon'));
  if (unexpected.length) errors.push(`unexpected upload/network request during recording:\n${unexpected.join('\n')}`);
}

async function checkNoHorizontalOverflow(page, label, errors) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) errors.push(`horizontal overflow on ${label}: ${JSON.stringify(overflow)}`);
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.grantPermissions(['microphone'], { origin: baseUrl });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => consoleErrors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (isAllowedFailedRequest(url)) return;
    failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  await installMockRecorder(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'domcontentloaded' });
  await waitForEnglishSpeed(page);
  await checkNoHorizontalOverflow(page, 'idle mobile', errors);
  await page.screenshot({ path: path.join(outDir, 'english-speed-record-idle-mobile.png'), fullPage: true });

  await assertNoUploadRequests(page, async () => {
    await page.getByTestId('speed-record-button').click();
    await page.getByText('Đang ghi âm câu đọc', { exact: false }).first().waitFor({ timeout: 10000 });
  }, errors);
  await page.screenshot({ path: path.join(outDir, 'english-speed-recording-mobile.png'), fullPage: true });

  await assertNoUploadRequests(page, async () => {
    await page.waitForTimeout(1100);
    await page.getByTestId('speed-record-button').click();
    await page.getByTestId('speed-feedback-panel').waitFor({ timeout: 10000 });
    await page.getByText('P-English đã ghi âm câu đọc của bạn. Chấm phát âm chi tiết sẽ được mở ở bản sau.', { exact: false }).first().waitFor({ timeout: 10000 });
    await page.getByTestId('english-speed-replay').waitFor({ timeout: 10000 });
    await page.getByTestId('english-speed-retry').waitFor({ timeout: 10000 });
    await page.getByTestId('english-speed-next').waitFor({ timeout: 10000 });
  }, errors);
  await checkNoHorizontalOverflow(page, 'recorded mobile', errors);
  await page.screenshot({ path: path.join(outDir, 'english-speed-recorded-mobile.png'), fullPage: true });

  const recordedState = await page.evaluate(() => ({
    hasAudio: Boolean(document.querySelector('audio[src^="blob:"]')),
    text: document.body.innerText,
  }));
  if (!recordedState.hasAudio) errors.push('recorded state should include local blob audio URL');
  if (/Dừng & gửi|Đang phân tích|API nghe được|Audio\/API-first|bằng API/i.test(recordedState.text)) {
    errors.push('English Speed still contains API/analyzing upload copy');
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'domcontentloaded' });
  await waitForEnglishSpeed(page);
  await checkNoHorizontalOverflow(page, 'desktop', errors);
  await page.screenshot({ path: path.join(outDir, 'english-speed-record-desktop.png'), fullPage: true });

  await browser.close();

  if (failedRequests.length) errors.push(`failed requests:\n${failedRequests.join('\n')}`);
  if (consoleErrors.length) errors.push(`console/page errors:\n${consoleErrors.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`PENGLISH-LOGIC-01 QA passed. Screenshots saved to ${outDir}`);
})();
