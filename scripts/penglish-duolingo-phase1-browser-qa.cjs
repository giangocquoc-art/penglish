const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'penglish-duolingo-phase1-browser-qa.json');

const routes = [
  {
    name: 'home-desktop',
    route: '/home',
    screenshot: 'penglish-duolingo-phase1-home-desktop.png',
    viewport: { width: 1440, height: 1000 },
    isMobile: false,
    expected: [/Học tiếng Anh mỗi ngày cùng Poo/i, /Bắt đầu bài hôm nay/i, /Xem lộ trình 48 ngày/i, /48 ngày lấy gốc/i, /Shadowing/i, /Ôn từ vựng/i],
  },
  {
    name: 'home-mobile',
    route: '/home',
    screenshot: 'penglish-duolingo-phase1-home-mobile.png',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    expected: [/Học tiếng Anh mỗi ngày cùng Poo/i, /Bắt đầu bài hôm nay/i, /Xem lộ trình 48 ngày/i, /Học/i, /Ôn tập/i, /Từ vựng/i, /Hồ sơ/i],
  },
  {
    name: 'learning-path-desktop',
    route: '/learning-path',
    screenshot: 'penglish-duolingo-phase1-learning-path-desktop.png',
    viewport: { width: 1440, height: 1000 },
    isMobile: false,
    expected: [/Học tiếng Anh theo từng chấm cùng Poo/i, /Tiếp tục học/i, /Bài hôm nay|Start lesson/i, /Checkpoint|Chốt bài/i, /A1|A2|B1|B2/i],
    testIds: ['duolingo-learning-path-map', 'learning-path-right-panel'],
  },
  {
    name: 'learning-path-mobile',
    route: '/learning-path',
    screenshot: 'penglish-duolingo-phase1-learning-path-mobile.png',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    expected: [/Học tiếng Anh theo từng chấm cùng Poo/i, /Tiếp tục học/i, /Học/i, /Ôn tập/i, /Từ vựng/i, /Hồ sơ/i],
    testIds: ['duolingo-learning-path-map', 'learning-path-right-panel'],
  },
  {
    name: 'foundation48',
    route: '/luyen-tieng-anh/48-ngay-lay-goc',
    screenshot: 'penglish-duolingo-phase1-foundation48.png',
    viewport: { width: 1280, height: 920 },
    isMobile: false,
    expected: [/48 ngày lấy gốc/i, /Bắt đầu|Tiếp tục|Ngày/i, /Ôn lỗi sai|roadmap|lộ trình|chặng/i],
  },
  {
    name: 'english-speed',
    route: '/english-speed',
    screenshot: 'penglish-duolingo-phase1-english-speed.png',
    viewport: { width: 1280, height: 920 },
    isMobile: false,
    expected: [/English Speed/i, /phản xạ|tốc độ|phát âm/i],
  },
  {
    name: 'shadowing',
    route: '/shadowing',
    screenshot: 'penglish-duolingo-phase1-shadowing.png',
    viewport: { width: 1280, height: 920 },
    isMobile: false,
    expected: [/Shadowing/i, /nghe|nói|lặp|record|thu âm/i],
  },
  {
    name: 'practice',
    route: '/practice',
    screenshot: 'penglish-duolingo-phase1-practice.png',
    viewport: { width: 1280, height: 920 },
    isMobile: false,
    expected: [/Luyện tập|Ôn tập|Practice/i, /từ vựng|kỹ năng|lỗi|review|ôn/i],
  },
  {
    name: 'words',
    route: '/words',
    screenshot: 'penglish-duolingo-phase1-words.png',
    viewport: { width: 1280, height: 920 },
    isMobile: false,
    expected: [/Từ vựng|Vocabulary|Sổ tay/i, /flashcard|CEFR|ôn|word/i],
  },
  {
    name: 'landing',
    route: '/',
    screenshot: 'penglish-duolingo-phase1-landing.png',
    viewport: { width: 1280, height: 920 },
    isMobile: false,
    expected: [/P-English|Poo|tiếng Anh/i],
  },
];

async function checkNoHorizontalOverflow(page, name) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    return {
      documentClientWidth: root.clientWidth,
      documentScrollWidth: root.scrollWidth,
      bodyClientWidth: body.clientWidth,
      bodyScrollWidth: body.scrollWidth,
    };
  });

  const maxExtra = Math.max(
    overflow.documentScrollWidth - overflow.documentClientWidth,
    overflow.bodyScrollWidth - overflow.bodyClientWidth,
  );

  if (maxExtra > 3) {
    throw new Error(`${name} has horizontal overflow: ${JSON.stringify(overflow)}`);
  }

  return overflow;
}

async function runRoute(browser, check) {
  const context = await browser.newContext({
    viewport: check.viewport,
    isMobile: check.isMobile,
    deviceScaleFactor: check.isMobile ? 2 : 1,
  });
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(`${baseUrl}${check.route}`, { waitUntil: 'networkidle', timeout: 45_000 });
    const status = response ? response.status() : 0;
    if (status >= 400) throw new Error(`${check.name} returned HTTP ${status}`);

    await page.screenshot({ path: path.join(screenshotDir, check.screenshot), fullPage: true });
    const bodyText = await page.locator('body').innerText({ timeout: 10_000 });
    const missingText = check.expected.filter((pattern) => !pattern.test(bodyText)).map((pattern) => String(pattern));
    if (missingText.length) {
      throw new Error(`${check.name} missing expected text: ${missingText.join(', ')}`);
    }

    const testIdResults = [];
    for (const testId of check.testIds || []) {
      const count = await page.locator(`[data-testid="${testId}"]`).count();
      if (count < 1) throw new Error(`${check.name} missing data-testid=${testId}`);
      testIdResults.push({ testId, count });
    }

    const overflow = await checkNoHorizontalOverflow(page, check.name);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');

    return {
      name: check.name,
      route: check.route,
      status,
      title,
      description,
      screenshot: `reports/screenshots/${check.screenshot}`,
      overflow,
      testIdResults,
      consoleMessages,
      pageErrors,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const route of routes) {
      results.push(await runRoute(browser, route));
    }
  } finally {
    await browser.close();
  }

  const hardFailures = results.flatMap((result) => result.pageErrors.map((message) => `${result.name}: ${message}`));
  const report = {
    baseUrl,
    checkedAt: new Date().toISOString(),
    routeCount: routes.length,
    screenshotDir: 'reports/screenshots',
    hardFailures,
    results,
  };

  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));

  if (hardFailures.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
