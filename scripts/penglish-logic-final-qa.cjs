const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_LOGIC_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-logic', 'final-qa');
const vocabStorageKey = 'penglish.vocabulary.progress.v1';
const shadowingStorageKey = 'penglish.shadowing.progress.v1';

const routes = [
  { path: '/home', ready: async (page) => page.locator('[data-testid="home-data-mode-indicator"]').waitFor({ state: 'attached', timeout: 20000 }) },
  { path: '/learning-path', ready: async (page) => page.getByTestId('roadmap-mobile-root').waitFor({ timeout: 20000 }) },
  { path: '/lessons/unit-1-greetings-introduction', ready: async (page) => page.getByTestId('lesson-mobile-root').waitFor({ timeout: 20000 }) },
  { path: '/english-speed', ready: async (page) => page.getByTestId('speed-current-prompt').waitFor({ timeout: 20000 }) },
  { path: '/shadowing', ready: async (page) => page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 20000 }) },
  { path: '/words', ready: async (page) => page.getByTestId('vocab-mobile-root').waitFor({ timeout: 20000 }) },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isAllowedFailedRequest(url) {
  return url.includes('favicon')
    || url.includes('chrome-extension')
    || url.includes('/ocean/ambient-whale/frames/')
    || url.includes('youtube-nocookie.com')
    || url.includes('youtube.com');
}

function requestLooksLikeProgressServerWrite(request) {
  const url = request.url();
  const method = request.method();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return false;
  return /supabase|rest\/v1|storage|vocabulary|progress|shadowing|english-speed|audio|upload|api/i.test(url);
}

async function installMockRecorder(page, denyMicrophone = false) {
  await page.addInitScript((deny) => {
    class MockMediaRecorder extends EventTarget {
      static isTypeSupported() { return true; }
      constructor(stream, options = {}) {
        super();
        this.stream = stream;
        this.mimeType = options.mimeType || 'audio/webm';
        this.state = 'inactive';
        this.ondataavailable = null;
        this.onerror = null;
        this.onstop = null;
      }
      start() { this.state = 'recording'; }
      stop() {
        if (this.state !== 'recording') return;
        this.state = 'inactive';
        const blob = new Blob(['penglish-final-qa-local-audio'], { type: this.mimeType || 'audio/webm' });
        this.ondataavailable?.({ data: blob });
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
        getUserMedia: async () => {
          if (deny) throw new DOMException('Permission denied by final QA mock', 'NotAllowedError');
          return stream;
        },
      },
    });
    window.MediaRecorder = MockMediaRecorder;
  }, denyMicrophone);
}

async function checkNoHorizontalOverflow(page, label, results) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) results.errors.push(`Horizontal overflow on ${label}: ${JSON.stringify(overflow)}`);
}

async function checkBottomSafeArea(page, label, results) {
  const unsafe = await page.evaluate(() => Array.from(document.querySelectorAll('button, a[href]'))
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    })
    .map((el) => ({ text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 80), rect: el.getBoundingClientRect().toJSON() }))
    .filter((item) => item.rect.bottom > window.innerHeight - 18 && item.rect.top < window.innerHeight - 72));
  if (unsafe.length) results.errors.push(`Potential mobile bottom nav overlap on ${label}: ${JSON.stringify(unsafe.slice(0, 3))}`);
}

async function checkPooNonBlocking(page, label, results) {
  const blocking = await page.evaluate(() => {
    const suspect = Array.from(document.querySelectorAll('[class*="poo" i], [data-testid*="poo" i], img[src*="poo" i]'));
    return suspect.map((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        testId: el.getAttribute('data-testid'),
        pointerEvents: style.pointerEvents,
        zIndex: style.zIndex,
        area: Math.round(rect.width * rect.height),
      };
    }).filter((item) => item.pointerEvents !== 'none' && item.area > 12000);
  });
  if (blocking.length) results.errors.push(`Ambient Poo may be blocking on ${label}: ${JSON.stringify(blocking.slice(0, 3))}`);
}

async function visitRoute(page, routePath, viewportName, results) {
  const route = routes.find((item) => item.path === routePath);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded' });
  await route.ready(page);
  await page.waitForTimeout(450);
  await checkNoHorizontalOverflow(page, `${routePath} ${viewportName}`, results);
  if (viewportName === 'mobile') await checkBottomSafeArea(page, `${routePath} ${viewportName}`, results);
  await checkPooNonBlocking(page, `${routePath} ${viewportName}`, results);
}

async function verifyRoutes(page, results) {
  await page.setViewportSize({ width: 1366, height: 768 });
  for (const route of routes) await visitRoute(page, route.path, 'desktop', results);
  await page.screenshot({ path: path.join(screenshotDir, 'final-qa-home-desktop.png'), fullPage: false, timeout: 60000 });

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of routes) await visitRoute(page, route.path, 'mobile', results);
}

async function verifyEnglishSpeed(browser, results) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.grantPermissions(['microphone'], { origin: baseUrl });
  const page = await context.newPage();
  const networkWrites = [];
  page.on('request', (request) => {
    if (requestLooksLikeProgressServerWrite(request)) networkWrites.push(`${request.method()} ${request.url()}`);
  });
  await installMockRecorder(page, false);
  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('speed-current-prompt').waitFor({ timeout: 20000 });
  await page.getByText('Nghe mẫu', { exact: true }).click();
  await page.getByTestId('speed-record-button').click();
  await page.getByText('Đang ghi âm câu đọc', { exact: false }).waitFor({ timeout: 10000 });
  const pressed = await page.getByTestId('speed-record-button').getAttribute('aria-pressed');
  assert(pressed === 'true', 'English Speed record button did not enter recording state');
  await page.waitForTimeout(850);
  await page.getByTestId('speed-record-button').click();
  await page.getByTestId('speed-feedback-panel').waitFor({ timeout: 10000 });
  await page.getByTestId('english-speed-replay').waitFor({ timeout: 10000 });
  await page.screenshot({ path: path.join(screenshotDir, 'final-qa-english-speed-mobile.png'), fullPage: false, timeout: 60000 });
  await checkNoHorizontalOverflow(page, '/english-speed mobile recorded', results);
  if (networkWrites.length) results.errors.push(`English Speed made unexpected audio/progress server request: ${networkWrites.join('\n')}`);
  await context.close();

  const deniedContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const deniedPage = await deniedContext.newPage();
  await installMockRecorder(deniedPage, true);
  await deniedPage.goto(`${baseUrl}/english-speed`, { waitUntil: 'domcontentloaded' });
  await deniedPage.getByTestId('speed-current-prompt').waitFor({ timeout: 20000 });
  await deniedPage.getByTestId('speed-record-button').click();
  await deniedPage.getByTestId('english-speed-recording-error').waitFor({ timeout: 10000 });
  await deniedContext.close();
  results.englishSpeed = 'PASS: prompt, sample audio button, record state, denied mic handling, local recorded state, replay button, and no upload request verified.';
}

async function verifyShadowing(page, results) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 20000 });
  await page.evaluate((key) => window.localStorage.removeItem(key), shadowingStorageKey);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 20000 });

  const iframeAudit = await page.evaluate(() => Array.from(document.querySelectorAll('iframe')).map((iframe) => ({ src: iframe.getAttribute('src') || '', embedAllowed: iframe.getAttribute('data-embed-allowed') || iframe.getAttribute('embedAllowed') || '' })));
  const unsafeIframe = iframeAudit.find((item) => /youtube/i.test(item.src) && item.embedAllowed !== 'true');
  if (unsafeIframe) results.errors.push(`Unsafe YouTube iframe found without embedAllowed=true: ${JSON.stringify(unsafeIframe)}`);

  await page.getByTestId('shadowing-mark-practiced-button').click();
  await page.getByTestId('shadowing-next-button').click();
  await page.getByText(/^Câu 2\//).first().waitFor({ timeout: 10000 });
  await page.getByTestId('shadowing-toggle-difficult-button').click();
  await page.getByTestId('shadowing-next-button').click();
  await page.getByText(/^Câu 3\//).first().waitFor({ timeout: 10000 });
  await page.getByTestId('shadowing-previous-button').click();
  await page.getByText(/^Câu 2\//).first().waitFor({ timeout: 10000 });
  const beforeReload = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || '{}'), shadowingStorageKey);
  assert(Object.values(beforeReload).some((entry) => entry.currentLineIndex === 1 && entry.practicedLineIds?.length === 1 && entry.difficultLineIds?.length === 1), 'Shadowing progress did not persist expected local state before reload');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText(/^Câu 2\//).first().waitFor({ timeout: 10000 });
  await page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 10000 });
  await page.getByTestId('shadowing-transcript-panel').waitFor({ timeout: 10000 });
  await page.screenshot({ path: path.join(screenshotDir, 'final-qa-shadowing-mobile.png'), fullPage: false, timeout: 60000 });
  await checkNoHorizontalOverflow(page, '/shadowing mobile', results);
  results.shadowing = 'PASS: lesson load, current sentence, next/previous, practiced/difficult marking, reload persistence, transcript-first safety, and iframe safety verified.';
}

async function verifyVocabulary(page, results) {
  const progressRequests = [];
  const requestListener = (request) => {
    if (requestLooksLikeProgressServerWrite(request) && /vocab|vocabulary|progress|supabase|rest\/v1/i.test(request.url())) {
      progressRequests.push(`${request.method()} ${request.url()}`);
    }
  };
  page.on('request', requestListener);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('vocab-mobile-root').waitFor({ timeout: 20000 });
  await page.evaluate((key) => window.localStorage.removeItem(key), vocabStorageKey);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('vocab-review-today-card').waitFor({ timeout: 20000 });
  await page.locator('[data-testid^="vocab-mark-review-"]').first().click();
  const reviewId = (await page.locator('[data-testid^="vocab-mark-review-"]').first().getAttribute('data-testid')).replace('vocab-mark-review-', '');
  await page.locator(`[data-testid="vocab-mark-difficult-${reviewId}"]`).first().click();
  await page.getByTestId('vocab-status-filter-difficult').click();
  await page.waitForTimeout(300);
  await page.locator(`[data-testid="vocab-mark-known-${reviewId}"]`).first().click();
  await page.getByTestId('vocab-status-filter-known').click();
  await page.waitForTimeout(300);
  await page.locator(`[data-testid="vocab-mark-review-${reviewId}"]`).first().click();
  await page.getByTestId('vocab-status-filter-review').click();
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('vocab-status-filter-review').click();
  await page.locator(`[data-testid="vocab-mark-review-${reviewId}"]`).first().waitFor({ state: 'visible', timeout: 15000 });
  const persisted = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || '{}'), vocabStorageKey);
  assert(persisted[reviewId]?.status === 'review', 'Vocabulary review status did not persist after reload');
  assert(typeof persisted[reviewId]?.lastReviewedAt === 'string', 'Vocabulary lastReviewedAt did not persist');
  assert(typeof persisted[reviewId]?.nextReviewAt === 'string', 'Vocabulary nextReviewAt did not persist');
  await page.screenshot({ path: path.join(screenshotDir, 'final-qa-words-mobile.png'), fullPage: false, timeout: 60000 });
  await checkNoHorizontalOverflow(page, '/words mobile', results);
  page.off('request', requestListener);
  if (progressRequests.length) results.errors.push(`Vocabulary made unexpected progress server request: ${progressRequests.join('\n')}`);
  results.vocabulary = 'PASS: word list, status chips, filters, review queue, reload persistence, and no server progress request verified.';
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = {
    ok: false,
    baseUrl,
    routesTested: routes.map((item) => item.path),
    viewports: ['desktop 1366x768', 'mobile 390x844'],
    screenshots: [],
    consoleErrors: [],
    failedRequests: [],
    errors: [],
    englishSpeed: 'NOT RUN',
    shadowing: 'NOT RUN',
    vocabulary: 'NOT RUN',
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => results.consoleErrors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    if (!isAllowedFailedRequest(request.url())) results.failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  try {
    await verifyRoutes(page, results);
    await verifyEnglishSpeed(browser, results);
    await verifyShadowing(page, results);
    await verifyVocabulary(page, results);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="home-data-mode-indicator"]').waitFor({ state: 'attached', timeout: 20000 });
    await page.screenshot({ path: path.join(screenshotDir, 'final-qa-console-check.png'), fullPage: false, timeout: 60000 });
  } finally {
    await context.close();
    await browser.close();
  }

  results.screenshots = fs.readdirSync(screenshotDir).filter((name) => name.startsWith('final-qa-')).sort();
  if (results.failedRequests.length) results.errors.push(`Failed requests:\n${results.failedRequests.join('\n')}`);
  if (results.consoleErrors.length) results.errors.push(`Console/page errors:\n${results.consoleErrors.join('\n')}`);
  results.ok = results.errors.length === 0;
  console.log(JSON.stringify(results, null, 2));
  if (!results.ok) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
