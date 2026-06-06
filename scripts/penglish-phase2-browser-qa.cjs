const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'penglish-phase2-browser-qa-results.json');

const routeChecks = [
  { name: 'home-desktop', route: '/home', width: 1440, height: 900, screenshot: 'phase2-home-desktop.png', text: /P-English|Chưa bắt đầu|Hôm nay|lộ trình/i },
  { name: 'home-laptop', route: '/home', width: 1366, height: 768, screenshot: 'phase2-home-laptop.png', text: /P-English|Chưa bắt đầu|Hôm nay|lộ trình/i },
  { name: 'home-mobile', route: '/home', width: 390, height: 844, screenshot: 'phase2-home-mobile.png', text: /P-English|Chưa bắt đầu|Hôm nay|lộ trình/i },
  { name: 'learning-path-desktop', route: '/learning-path', width: 1440, height: 900, screenshot: 'phase2-learning-path-desktop.png', text: /Lộ trình học|Unit|A1|chấm/i },
  { name: 'learning-path-laptop', route: '/learning-path', width: 1366, height: 768, screenshot: 'phase2-learning-path-laptop.png', text: /Lộ trình học|Unit|A1|chấm/i },
  { name: 'learning-path-mobile', route: '/learning-path', width: 390, height: 844, screenshot: 'phase2-learning-path-mobile.png', text: /Lộ trình học|Unit|A1|chấm/i },
  { name: 'foundation48-desktop', route: '/luyen-tieng-anh/48-ngay-lay-goc', width: 1440, height: 900, screenshot: 'phase2-foundation48-desktop.png', text: /48 ngày|Ngày 1|I am|lấy gốc/i },
  { name: 'foundation48-laptop', route: '/luyen-tieng-anh/48-ngay-lay-goc', width: 1366, height: 768, screenshot: 'phase2-foundation48-laptop.png', text: /48 ngày|Ngày 1|I am|lấy gốc/i },
  { name: 'foundation48-mobile', route: '/luyen-tieng-anh/48-ngay-lay-goc', width: 390, height: 844, screenshot: 'phase2-foundation48-mobile.png', text: /48 ngày|Ngày 1|I am|lấy gốc/i },
  { name: 'english-speed-desktop', route: '/english-speed', width: 1440, height: 900, screenshot: 'phase2-english-speed-desktop.png', text: /Speed Reading|Speed Listening|Speed Speaking|KỶ LỤC/i },
  { name: 'english-speed-laptop', route: '/english-speed', width: 1366, height: 768, screenshot: 'phase2-english-speed-laptop.png', text: /Speed Reading|Speed Listening|Speed Speaking|KỶ LỤC/i },
  { name: 'english-speed-mobile', route: '/english-speed', width: 390, height: 844, screenshot: 'phase2-english-speed-mobile.png', text: /Speed Reading|Speed Listening|Speed Speaking|KỶ LỤC/i },
  { name: 'shadowing-desktop', route: '/shadowing', width: 1440, height: 900, screenshot: 'phase2-shadowing-desktop.png', text: /Nghe|Lặp lại|Ghi âm|Nâng cao: tự tạo transcript/i },
  { name: 'shadowing-laptop', route: '/shadowing', width: 1366, height: 768, screenshot: 'phase2-shadowing-laptop.png', text: /Nghe|Lặp lại|Ghi âm|Nâng cao: tự tạo transcript/i },
  { name: 'shadowing-mobile', route: '/shadowing', width: 390, height: 844, screenshot: 'phase2-shadowing-mobile.png', text: /Nghe|Lặp lại|Ghi âm|Nâng cao: tự tạo transcript/i },
  { name: 'practice-desktop', route: '/practice', width: 1440, height: 900, screenshot: 'phase2-practice-desktop.png', text: /Khu luyện tập|A1|luyện|bài/i },
  { name: 'practice-laptop', route: '/practice', width: 1366, height: 768, screenshot: 'phase2-practice-laptop.png', text: /Khu luyện tập|A1|luyện|bài/i },
  { name: 'practice-mobile', route: '/practice', width: 390, height: 844, screenshot: 'phase2-practice-mobile.png', text: /Khu luyện tập|A1|luyện|bài/i },
  { name: 'words-desktop', route: '/words', width: 1440, height: 900, screenshot: 'phase2-words-desktop.png', text: /Sổ tay|A1|A2|B1|ôn/i },
  { name: 'words-laptop', route: '/words', width: 1366, height: 768, screenshot: 'phase2-words-laptop.png', text: /Sổ tay|A1|A2|B1|ôn/i },
  { name: 'words-mobile', route: '/words', width: 390, height: 844, screenshot: 'phase2-words-mobile.png', text: /Sổ tay|A1|A2|B1|ôn/i },
];

async function gotoAndCheck(page, check, errors) {
  await page.setViewportSize({ width: check.width, height: check.height });
  const response = await page.goto(`${baseUrl}${check.route}`, { waitUntil: 'networkidle', timeout: 45_000 });
  const status = response ? response.status() : 0;
  if (status >= 400) errors.push(`${check.name} returned HTTP ${status}`);
  await page.waitForFunction(() => !document.body.innerText.includes('Đang mở vùng học'), null, { timeout: 20_000 }).catch(() => undefined);
  if (check.route === '/words') await page.getByTestId('vocab-mobile-root').waitFor({ timeout: 20_000 });
  const bodyText = await page.locator('body').innerText({ timeout: 15_000 });
  if (!check.text.test(bodyText)) errors.push(`${check.name} missing expected text: ${bodyText.slice(0, 220).replace(/\s+/g, ' ')}`);
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) errors.push(`${check.name} horizontal overflow ${JSON.stringify(overflow)}`);
  await page.screenshot({ path: path.join(screenshotDir, check.screenshot), fullPage: false, timeout: 15_000 });
  return { ...check, status, overflow, screenshot: `reports/screenshots/${check.screenshot}` };
}

async function completeInteractiveLesson(page, errors) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'networkidle', timeout: 45_000 });
  await page.getByTestId(/learning-path-node-(vocabulary|grammar|listening|speaking|quiz|review|checkpoint)-(current|review|checkpoint|completed)/).first().click();
  await page.getByTestId('interactive-lesson-page').waitFor({ timeout: 20_000 });

  for (let guard = 0; guard < 16; guard += 1) {
    if (await page.getByText('Hoàn thành bài học!', { exact: false }).first().isVisible().catch(() => false)) break;

    if (await page.getByTestId('interactive-lesson-start-button').isVisible().catch(() => false)) {
      await page.getByTestId('interactive-lesson-start-button').click();
    } else if (await page.getByTestId('interactive-lesson-remember-button').isVisible().catch(() => false)) {
      await page.getByTestId('interactive-lesson-remember-button').click();
    } else if (await page.getByTestId('interactive-lesson-answer-option').first().isVisible().catch(() => false)) {
      await page.getByTestId('interactive-lesson-answer-option').first().click();
    } else if (await page.getByTestId('interactive-lesson-fill-input').isVisible().catch(() => false)) {
      await page.getByTestId('interactive-lesson-fill-input').fill('test');
      await page.getByTestId('interactive-lesson-check-button').click();
    } else if (await page.getByTestId('interactive-lesson-check-button').isVisible().catch(() => false)) {
      await page.getByTestId('interactive-lesson-check-button').click();
    } else if (await page.getByTestId('interactive-lesson-speak-done-button').isVisible().catch(() => false)) {
      await page.getByTestId('interactive-lesson-speak-done-button').click();
    } else {
      errors.push('interactive lesson had no actionable control');
      break;
    }

    if (await page.getByTestId('interactive-lesson-continue-button').isVisible().catch(() => false)) {
      await page.getByTestId('interactive-lesson-continue-button').click();
    }
  }

  await page.getByText('Hoàn thành bài học!', { exact: false }).first().waitFor({ timeout: 20_000 });
  await page.screenshot({ path: path.join(screenshotDir, 'phase2-learning-path-completed-lesson.png'), fullPage: false, timeout: 15_000 });
  return { route: page.url().replace(baseUrl, ''), screenshot: 'reports/screenshots/phase2-learning-path-completed-lesson.png' };
}

async function checkFoundation48DayOne(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/1`, { waitUntil: 'networkidle', timeout: 45_000 });
  await page.getByText('Ngày 1: Tôi là ai? — I am / You are / I’m not', { exact: false }).first().waitFor({ timeout: 20_000 });
  await page.getByText('Học mẫu câu', { exact: false }).first().waitFor({ timeout: 20_000 });
  await page.screenshot({ path: path.join(screenshotDir, 'phase2-foundation48-day1-lesson.png'), fullPage: false, timeout: 15_000 });
  return { route: '/luyen-tieng-anh/48-ngay-lay-goc/ngay/1', screenshot: 'reports/screenshots/phase2-foundation48-day1-lesson.png' };
}

async function checkShadowingLocalFallback(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle', timeout: 45_000 });
  const details = page.getByTestId('shadowing-custom-transcript');
  const isOpen = await details.evaluate((node) => node.hasAttribute('open'));
  await page.screenshot({ path: path.join(screenshotDir, 'phase2-shadowing-collapsed-advanced.png'), fullPage: false, timeout: 15_000 });
  return { advancedTranscriptCollapsed: !isOpen, screenshot: 'reports/screenshots/phase2-shadowing-collapsed-advanced.png' };
}

async function main() {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const errors = [];
  const routeResults = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`${page.url()} :: ${msg.text()}`);
  });
  page.on('pageerror', (error) => consoleErrors.push(`${page.url()} :: ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!url.includes('favicon') && !url.startsWith('data:')) failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown'}`);
  });

  try {
    for (const check of routeChecks) {
      routeResults.push(await gotoAndCheck(page, check, errors));
    }
    const lessonCompletion = await completeInteractiveLesson(page, errors);
    const foundation48DayOne = await checkFoundation48DayOne(page);
    const shadowingAdvanced = await checkShadowingLocalFallback(page);

    const filteredConsoleErrors = consoleErrors.filter((item) => !/Failed to load resource: the server responded with a status of 404.*favicon/i.test(item));
    const filteredFailedRequests = failedRequests.filter((item) => !/ocean\/ambient-whale\/frames\/frame-\d+\.png :: net::ERR_ABORTED/.test(item));
    const report = {
      baseUrl,
      checkedAt: new Date().toISOString(),
      routeResults,
      interactiveLesson: lessonCompletion,
      foundation48DayOne,
      shadowingAdvanced,
      consoleErrors: filteredConsoleErrors,
      failedRequests: filteredFailedRequests,
      errors,
    };
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    if (errors.length || filteredConsoleErrors.length || filteredFailedRequests.length) {
      console.error(JSON.stringify(report, null, 2));
      process.exit(1);
    }

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
