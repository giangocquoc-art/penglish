const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const reportPath = path.join(process.cwd(), 'reports', 'pooenglish-content-upgrade-route-smoke.json');
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots', 'pooenglish-content-upgrade');

const routes = [
  { name: 'landing', path: '/', viewport: { width: 1366, height: 768 }, expected: [/P-English|Poo|tiếng Anh/i] },
  { name: 'login', path: '/login', viewport: { width: 390, height: 844 }, expected: [/đăng nhập|login|Google|Poo|Bắt đầu/i] },
  { name: 'home', path: '/home', viewport: { width: 390, height: 844 }, expected: [/Học tiếng Anh|Poo|Hôm nay|48 ngày/i] },
  { name: 'learning-path', path: '/learning-path', viewport: { width: 390, height: 844 }, expected: [/Lộ trình|learning|Poo|48 ngày|Unit/i] },
  { name: 'foundation48', path: '/luyen-tieng-anh/48-ngay-lay-goc', viewport: { width: 390, height: 844 }, expected: [/48 ngày|lấy gốc|Ngày 1|Chặng/i] },
  { name: 'lesson', path: '/lessons/unit-1-greetings-introduction', viewport: { width: 390, height: 844 }, expected: [/hello|greeting|chào|bài học|Poo/i] },
  { name: 'words', path: '/words', viewport: { width: 390, height: 844 }, expected: [/Từ vựng|Vocabulary|Sổ tay|ôn/i], perfBudgetMs: 4500 },
  { name: 'practice', path: '/practice', viewport: { width: 390, height: 844 }, expected: [/Luyện tập|Practice|ôn|lỗi|từ/i] },
  { name: 'shadowing', path: '/shadowing', viewport: { width: 390, height: 844 }, expected: [/Shadowing|nghe|nói|Ghi âm|lặp/i] },
  { name: 'english-speed', path: '/english-speed', viewport: { width: 390, height: 844 }, expected: [/Đọc nhanh|Speed|tốc độ|phát âm|Poo/i] },
];

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

async function seedAuth(page) {
  await page.addInitScript(() => {
    const user = { id: 'qa-content-upgrade-user', email: 'qa-content-upgrade@example.com', name: 'QA Poo' };
    localStorage.setItem('penglish_current_user', JSON.stringify(user));
    localStorage.setItem('penglish_auth_user', JSON.stringify(user));
    localStorage.setItem('penglish_user', JSON.stringify(user));
  });
}

async function mockSupabase(context) {
  await context.route('**/*supabase.co/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'qa-content-upgrade-user', email: 'qa-content-upgrade@example.com', role: 'authenticated' }) });
      return;
    }
    if (url.includes('/auth/v1/token')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'qa-token', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 3600, user: { id: 'qa-content-upgrade-user', email: 'qa-content-upgrade@example.com' } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });
}

async function runRoute(browser, check) {
  const context = await browser.newContext({ viewport: check.viewport, isMobile: check.viewport.width < 768, deviceScaleFactor: check.viewport.width < 768 ? 2 : 1, reducedMotion: 'reduce' });
  await mockSupabase(context);
  const page = await context.newPage();
  await seedAuth(page);

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const startedAt = Date.now();
  try {
    const response = await page.goto(`${baseUrl}${check.path}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
    await page.waitForTimeout(check.name === 'words' ? 1000 : 450);
    const elapsedMs = Date.now() - startedAt;
    const status = response ? response.status() : 0;
    const bodyText = compact(await page.locator('body').innerText({ timeout: 10_000 }).catch(() => ''));
    const missing = check.expected.filter((pattern) => !pattern.test(bodyText)).map(String);
    const blank = bodyText.length < 40;
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      return {
        documentClientWidth: root.clientWidth,
        documentScrollWidth: root.scrollWidth,
        bodyClientWidth: body.clientWidth,
        bodyScrollWidth: body.scrollWidth,
        horizontalOverflow: Math.max(root.scrollWidth - root.clientWidth, body.scrollWidth - body.clientWidth) > 4,
      };
    });
    const screenshot = path.join(screenshotDir, `${check.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: false, animations: 'disabled' });
    const failures = [];
    if (status >= 500) failures.push(`HTTP ${status}`);
    if (blank) failures.push('blank body text');
    if (missing.length) failures.push(`missing expected text: ${missing.join(', ')}`);
    if (overflow.horizontalOverflow) failures.push(`horizontal overflow: ${JSON.stringify(overflow)}`);
    if (pageErrors.length) failures.push(`page errors: ${pageErrors.join(' | ')}`);
    if (check.perfBudgetMs && elapsedMs > check.perfBudgetMs) failures.push(`perf budget exceeded: ${elapsedMs}ms > ${check.perfBudgetMs}ms`);

    return {
      name: check.name,
      path: check.path,
      status,
      finalUrl: page.url(),
      viewport: check.viewport,
      elapsedMs,
      bodyLength: bodyText.length,
      title: await page.title(),
      overflow,
      screenshot: path.relative(process.cwd(), screenshot).replace(/\\/g, '/'),
      consoleErrorCount: consoleErrors.length,
      pageErrors,
      failures,
    };
  } finally {
    await context.close();
  }
}

(async () => {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const route of routes) results.push(await runRoute(browser, route));
  } finally {
    await browser.close();
  }
  const report = {
    ok: results.every((item) => item.failures.length === 0),
    checkedAt: new Date().toISOString(),
    baseUrl,
    routesTested: routes.map((route) => route.path),
    results,
  };
  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
})().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
