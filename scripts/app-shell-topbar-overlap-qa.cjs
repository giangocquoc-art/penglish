const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
const reportPath = path.resolve(__dirname, '..', 'reports', 'app-shell-topbar-overlap-qa.json');
const progressKey = 'penglish-foundation48-progress-v1';
const authUserId = '00000000-0000-4000-8000-000000000049';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'laptop-1366x768', width: 1366, height: 768 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];

const states = {
  before: {
    label: 'home-before',
    path: '/home',
    progress: {
      lastDayOpened: 2,
      lastStudiedDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      streak: 1,
      days: {
        1: { started: true, completed: true, completedAt: new Date(Date.now() - 86400000).toISOString(), completedSteps: ['intro', 'complete'] },
        2: { started: true, completed: false, completedSteps: ['intro'] },
      },
    },
    requiredText: ['Ngày 2', 'Đang học'],
    targets: ['home-daily-hero', 'home-daily-title', 'home-daily-task-grid', 'home-today-summary', 'home-continue-section'],
  },
  after: {
    label: 'home-after',
    path: '/home',
    progress: {
      lastDayOpened: 2,
      lastStudiedDate: new Date().toISOString().slice(0, 10),
      streak: 2,
      days: {
        1: { started: true, completed: true, completedAt: new Date(Date.now() - 86400000).toISOString(), completedSteps: ['intro', 'complete'] },
        2: { started: true, completed: true, completedAt: new Date().toISOString(), completedSteps: ['intro', 'explain', 'patterns', 'vocabulary', 'complete'] },
      },
    },
    requiredText: ['Ngày 3', 'Hoàn thành'],
    targets: ['home-daily-hero', 'home-daily-title', 'home-daily-task-grid', 'home-today-summary', 'home-continue-section'],
  },
  lesson: {
    label: 'foundation48-day2',
    path: '/luyen-tieng-anh/48-ngay-lay-goc/ngay/2',
    progress: {
      lastDayOpened: 2,
      lastStudiedDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      streak: 1,
      days: {
        1: { started: true, completed: true, completedAt: new Date(Date.now() - 86400000).toISOString(), completedSteps: ['intro', 'complete'] },
        2: { started: true, completed: false, completedSteps: ['intro'] },
      },
    },
    requiredText: ['Về lộ trình 48 ngày', 'Ngày 2'],
    targets: ['foundation48-day-page', 'foundation48-lesson-hero', 'foundation48-back-link', 'foundation48-step-actions', 'foundation48-day-neighbor-actions'],
  },
};

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

async function setupContext(browser, viewport, progress) {
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
          user: { id: authUserId, email: 'qa-shell-overlap@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: authUserId, email: 'qa-shell-overlap@example.com', role: 'authenticated' }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });

  await context.addInitScript(({ progressKey, authUserId, progress }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: authUserId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-shell-overlap@example.com' })}.`;
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
        email: 'qa-shell-overlap@example.com',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Shell Topbar QA' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, { progressKey, authUserId, progress });

  return context;
}

async function waitForRoute(page, state) {
  await page.getByTestId('penglish-shell-content').waitFor({ timeout: 20000 });
  if (state.label.startsWith('home')) await page.getByTestId('home-page').waitFor({ timeout: 20000 });
  if (state.label === 'foundation48-day2') await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 });
  await page.waitForTimeout(250);
}

async function assertText(page, state) {
  const text = await page.locator('body').innerText();
  for (const marker of state.requiredText) {
    if (!text.includes(marker)) throw new Error(`${state.label} missing text ${marker}: ${text.slice(0, 600)}`);
  }
}

async function collectMetrics(page, targetIds) {
  return page.evaluate((targetIds) => {
    const rectFor = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        selector,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        position: style.position,
        zIndex: style.zIndex,
      };
    };
    const topbar = rectFor('[data-testid="app-topbar"]');
    const shellContent = rectFor('[data-testid="penglish-shell-content"]');
    const bottomNav = rectFor('[data-testid="mobile-bottom-nav"]');
    const sidebar = rectFor('[data-testid="penglish-sidebar"]');
    const targets = targetIds.map((id) => rectFor(`[data-testid="${id}"]`)).filter(Boolean);
    const visibleTargets = targets.filter((target) => target.bottom > 0 && target.top < window.innerHeight);
    const bottomSafeTargets = visibleTargets.filter((target) => !target.selector.endsWith('-page"]'));
    const bodyScrollWidth = document.body.scrollWidth;
    const htmlClientWidth = document.documentElement.clientWidth;
    const overlapTargets = targets.filter((target) => {
      if (!topbar || topbar.bottom <= 0 || topbar.top >= window.innerHeight) return false;
      const intersectsY = Math.max(topbar.top, target.top) < Math.min(topbar.bottom, target.bottom);
      const intersectsX = Math.max(topbar.left, target.left) < Math.min(topbar.right, target.right);
      return intersectsY && intersectsX;
    });
    const coveredPoints = targets.filter((target) => {
      const x = Math.max(1, Math.min(window.innerWidth - 1, target.left + Math.min(20, Math.max(1, target.width / 2))));
      const y = Math.max(1, Math.min(window.innerHeight - 1, target.top + Math.min(20, Math.max(1, target.height / 2))));
      const element = document.elementFromPoint(x, y);
      return Boolean(element?.closest?.('[data-testid="app-topbar"]'));
    }).map((target) => target.selector);
    const bottomCoveredTargets = bottomSafeTargets.filter((target) => {
      if (!bottomNav || bottomNav.top >= window.innerHeight) return false;
      const targetBottom = Math.min(target.bottom, window.innerHeight);
      const yOverlap = Math.min(bottomNav.bottom, targetBottom) - Math.max(bottomNav.top, target.top);
      const xOverlap = Math.min(bottomNav.right, target.right) - Math.max(bottomNav.left, target.left);
      return yOverlap > 1 && xOverlap > 1;
    }).map((target) => target.selector);
    const bottomSafeGap = bottomNav
      ? Math.min(...bottomSafeTargets.map((target) => bottomNav.top - Math.min(target.bottom, window.innerHeight)).filter((gap) => Number.isFinite(gap)), bottomNav.top)
      : null;
    return {
      scrollY: window.scrollY,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      topbar,
      shellContent,
      bottomNav,
      sidebar,
      targets,
      overlapTargets: overlapTargets.map((target) => target.selector),
      coveredPoints,
      bottomCoveredTargets,
      bottomSafeGap,
      horizontalOverflow: bodyScrollWidth > htmlClientWidth + 1,
      bodyScrollWidth,
      htmlClientWidth,
      backgroundArchitecture: {
        oceanBackdrop: Boolean(document.querySelector('.penglish-ocean-shell')),
        appShell: Boolean(document.querySelector('[data-testid="penglish-app-shell"]')),
        main: Boolean(document.querySelector('[data-testid="penglish-shell-main"]')),
      },
    };
  }, targetIds);
}

function assertMetrics(metrics, label) {
  if (metrics.horizontalOverflow) throw new Error(`${label} horizontal overflow: ${JSON.stringify(metrics)}`);
  if (!metrics.topbar) throw new Error(`${label} missing topbar metrics`);
  if (!metrics.shellContent) throw new Error(`${label} missing shell content metrics`);
  if (metrics.topbar.position !== 'relative') throw new Error(`${label} topbar is not normal flow relative: ${JSON.stringify(metrics.topbar)}`);
  if (metrics.scrollY === 0 && metrics.shellContent.top < metrics.topbar.bottom - 1) throw new Error(`${label} shell content starts under topbar: ${JSON.stringify(metrics)}`);
  if (metrics.overlapTargets.length) throw new Error(`${label} topbar overlaps targets: ${JSON.stringify(metrics)}`);
  if (metrics.coveredPoints.length) throw new Error(`${label} target points covered by topbar: ${JSON.stringify(metrics)}`);
  if (label.endsWith('/bottom') && metrics.bottomCoveredTargets.length) throw new Error(`${label} bottom nav covers final visible targets: ${JSON.stringify(metrics)}`);
  if (label.endsWith('/bottom') && metrics.viewport.width < 1024 && metrics.bottomNav && metrics.bottomSafeGap !== null && metrics.bottomSafeGap < -1) throw new Error(`${label} bottom safe gap is negative: ${JSON.stringify(metrics)}`);
  if (metrics.viewport.width >= 1024) {
    if (!metrics.sidebar) throw new Error(`${label} missing sidebar metrics`);
    if (Math.abs(metrics.sidebar.top) > 1) throw new Error(`${label} sidebar shifted during scroll: ${JSON.stringify(metrics.sidebar)}`);
    if (metrics.sidebar.position !== 'sticky') throw new Error(`${label} sidebar is not sticky: ${JSON.stringify(metrics.sidebar)}`);
  }
  if (!metrics.backgroundArchitecture.oceanBackdrop || !metrics.backgroundArchitecture.appShell || !metrics.backgroundArchitecture.main) throw new Error(`${label} background shell architecture changed: ${JSON.stringify(metrics.backgroundArchitecture)}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const report = { baseUrl, viewports, checks: [], results: [], screenshots: [], errors };

  try {
    for (const viewport of viewports) {
      for (const state of Object.values(states)) {
        const context = await setupContext(browser, viewport, state.progress);
        const page = await context.newPage();
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(`${viewport.name}/${state.label} console: ${msg.text()}`);
        });
        page.on('pageerror', (error) => errors.push(`${viewport.name}/${state.label} pageerror: ${error.message}`));

        await page.goto(`${baseUrl}${state.path}`, { waitUntil: 'domcontentloaded' });
        await waitForRoute(page, state);
        await assertText(page, state);

        const topMetrics = await collectMetrics(page, state.targets);
        assertMetrics(topMetrics, `${viewport.name}/${state.label}/top`);
        const topShot = `app-shell-topbar-${state.label}-${viewport.name}-top.png`;
        await page.screenshot({ path: path.join(outDir, topShot), fullPage: true });
        report.screenshots.push(topShot);
        report.results.push({ viewport: viewport.name, state: state.label, scroll: 'top', metrics: topMetrics });

        await page.evaluate(() => window.scrollTo(0, Math.max(160, Math.floor(document.body.scrollHeight / 3))));
        await page.waitForTimeout(250);
        const midMetrics = await collectMetrics(page, state.targets);
        assertMetrics(midMetrics, `${viewport.name}/${state.label}/middle`);
        const midShot = `app-shell-topbar-${state.label}-${viewport.name}-middle.png`;
        await page.screenshot({ path: path.join(outDir, midShot), fullPage: true });
        report.screenshots.push(midShot);
        report.results.push({ viewport: viewport.name, state: state.label, scroll: 'middle', metrics: midMetrics });

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(250);
        const bottomMetrics = await collectMetrics(page, state.targets);
        assertMetrics(bottomMetrics, `${viewport.name}/${state.label}/bottom`);
        const bottomShot = `app-shell-topbar-${state.label}-${viewport.name}-bottom.png`;
        await page.screenshot({ path: path.join(outDir, bottomShot), fullPage: true });
        report.screenshots.push(bottomShot);
        report.results.push({ viewport: viewport.name, state: state.label, scroll: 'bottom', metrics: bottomMetrics });

        report.checks.push(`${viewport.name}/${state.label}: no topbar overlap, no bottom-nav target coverage, stable sidebar, and no horizontal overflow at top, middle, and bottom scroll.`);
        await context.close();
      }
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
  console.log(`App shell topbar overlap QA passed. Report: ${reportPath}`);
})();
