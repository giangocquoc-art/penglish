const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
const reportPath = path.resolve(__dirname, '..', 'reports', 'foundation48-learning-path-qa.json');
const progressKey = 'penglish-foundation48-progress-v1';
const authUserId = '00000000-0000-4000-8000-000000000048';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'laptop-1366x768', width: 1366, height: 768 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];

const progress = {
  lastDayOpened: 3,
  lastStudiedDate: new Date().toISOString().slice(0, 10),
  streak: 4,
  days: {
    1: { started: true, completed: true, completedAt: new Date(Date.now() - 2 * 86400000).toISOString(), completedSteps: ['intro', 'complete'] },
    2: { started: true, completed: true, completedAt: new Date(Date.now() - 86400000).toISOString(), completedSteps: ['intro', 'explain', 'patterns', 'vocabulary', 'complete'] },
    3: { started: true, completed: false, completedSteps: ['intro', 'explain'] },
  },
};

async function setupContext(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.route('**/*supabase.co/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/token')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'qa-access-token',
          refresh_token: 'qa-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: { id: authUserId, email: 'qa-foundation48-path@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: authUserId, email: 'qa-foundation48-path@example.com', role: 'authenticated' }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });

  await context.addInitScript(({ progressKey, authUserId, progress }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: authUserId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-foundation48-path@example.com' })}.`;
    window.localStorage.setItem('p-english:supabase-auth', JSON.stringify({
      access_token: token,
      refresh_token: 'qa-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiresAt,
      user: {
        id: authUserId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'qa-foundation48-path@example.com',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Foundation48 Path QA' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, { progressKey, authUserId, progress });

  return context;
}

async function collectMetrics(page) {
  return page.evaluate(() => {
    const rectFor = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { selector, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height };
    };
    const cards = Array.from(document.querySelectorAll('[data-testid^="foundation48-day-card-"]')).filter((el) => /^foundation48-day-card-\d+$/.test(el.getAttribute('data-testid') || ''));
    const links = Array.from(document.querySelectorAll('[data-testid^="foundation48-day-link-"]')).filter((el) => /^foundation48-day-link-\d+$/.test(el.getAttribute('data-testid') || ''));
    const locked = Array.from(document.querySelectorAll('[data-testid^="foundation48-day-card-locked-"]')).filter((el) => /^foundation48-day-card-locked-\d+$/.test(el.getAttribute('data-testid') || ''));
    const bodyText = document.body.innerText;
    const sampleCards = [1, 2, 3, 4, 48].map((day) => ({ day, rect: rectFor(`[data-testid="foundation48-day-card-${day}"]`) }));
    return {
      url: window.location.pathname,
      titleText: document.querySelector('[data-testid="foundation48-roadmap-title"]')?.textContent || '',
      hero: rectFor('[data-testid="foundation48-roadmap-hero"]'),
      summary: rectFor('[data-testid="foundation48-path-summary"]'),
      grid: rectFor('[data-testid="foundation48-roadmap-grid"]'),
      bodyScrollWidth: document.body.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      horizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
      cardCount: cards.length,
      linkCount: links.length,
      lockedCount: locked.length,
      sampleCards,
      textChecks: {
        completed: bodyText.includes('2/48'),
        streak: bodyText.includes('4 ngày'),
        currentDay: bodyText.includes('Ngày 3'),
        currentStatus: bodyText.includes('Đang học'),
        completedStatus: bodyText.includes('Hoàn thành'),
        lockedStatus: bodyText.includes('Chưa mở'),
      },
      backgroundArchitecture: {
        oceanBackdrop: Boolean(document.querySelector('.penglish-ocean-shell')),
        appShell: Boolean(document.querySelector('[data-testid="penglish-app-shell"]')),
        main: Boolean(document.querySelector('[data-testid="penglish-shell-main"]')),
      },
    };
  });
}

function assertMetrics(metrics, label) {
  if (metrics.url !== '/learning-path') throw new Error(`${label} wrong route: ${metrics.url}`);
  if (!metrics.hero || !metrics.summary || !metrics.grid) throw new Error(`${label} missing roadmap sections: ${JSON.stringify(metrics)}`);
  if (metrics.horizontalOverflow) throw new Error(`${label} horizontal overflow: ${JSON.stringify(metrics)}`);
  if (metrics.cardCount !== 48) throw new Error(`${label} expected 48 cards, got ${metrics.cardCount}`);
  if (metrics.linkCount !== 3) throw new Error(`${label} expected 3 clickable available/completed/current days, got ${metrics.linkCount}`);
  if (metrics.lockedCount !== 45) throw new Error(`${label} expected 45 locked future days, got ${metrics.lockedCount}`);
  for (const [key, value] of Object.entries(metrics.textChecks)) {
    if (!value) throw new Error(`${label} missing text check ${key}: ${JSON.stringify(metrics.textChecks)}`);
  }
  if (!metrics.backgroundArchitecture.oceanBackdrop || !metrics.backgroundArchitecture.appShell || !metrics.backgroundArchitecture.main) {
    throw new Error(`${label} background shell architecture changed: ${JSON.stringify(metrics.backgroundArchitecture)}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const report = { baseUrl, viewports, checks: [], results: [], screenshots: [], errors };

  try {
    for (const viewport of viewports) {
      const context = await setupContext(browser, viewport);
      const page = await context.newPage();
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`${viewport.name} console: ${msg.text()}`);
      });
      page.on('pageerror', (error) => errors.push(`${viewport.name} pageerror: ${error.message}`));

      await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('foundation48-learning-path-page').waitFor({ timeout: 20000 });
      await page.getByTestId('foundation48-day-card-48').scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await page.getByTestId('foundation48-roadmap-hero').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);

      const topMetrics = await collectMetrics(page);
      assertMetrics(topMetrics, `${viewport.name}/top`);
      const topShot = `foundation48-learning-path-${viewport.name}-top.png`;
      await page.screenshot({ path: path.join(outDir, topShot), fullPage: true });
      report.screenshots.push(topShot);
      report.results.push({ viewport: viewport.name, scroll: 'top', metrics: topMetrics });

      await page.getByTestId('foundation48-stage-4').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const middleMetrics = await collectMetrics(page);
      assertMetrics(middleMetrics, `${viewport.name}/middle`);
      const middleShot = `foundation48-learning-path-${viewport.name}-middle.png`;
      await page.screenshot({ path: path.join(outDir, middleShot), fullPage: true });
      report.screenshots.push(middleShot);
      report.results.push({ viewport: viewport.name, scroll: 'middle', metrics: middleMetrics });

      await page.getByTestId('foundation48-day-link-3').click();
      await page.waitForURL('**/luyen-tieng-anh/48-ngay-lay-goc/ngay/3', { timeout: 10000 });
      report.checks.push(`${viewport.name}: rendered 48-day roadmap, summary, locked states, screenshots, and Day 3 navigation.`);
      await context.close();
    }
  } catch (error) {
    errors.push(error.message || String(error));
  } finally {
    await browser.close();
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`Foundation48 learning path QA passed. Report: ${reportPath}`);
})();
