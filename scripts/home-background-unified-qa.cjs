const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const userId = '00000000-0000-4000-8000-000000000050';
const viewports = [
  { label: 'desktop-1440x900', width: 1440, height: 900 },
  { label: 'laptop-1366x768', width: 1366, height: 768 },
  { label: 'mobile-390x844', width: 390, height: 844 },
];

async function setupContext(browser) {
  const context = await browser.newContext();
  await context.route('**/*supabase.co/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: userId, email: 'qa-bg@example.com', role: 'authenticated' }) });
      return;
    }
    if (url.includes('/auth/v1/token')) {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'qa-access-token',
          refresh_token: 'qa-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: expiresAt,
          user: { id: userId, email: 'qa-bg@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });

  await context.addInitScript(({ userId }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: userId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-bg@example.com' })}.`;
    window.localStorage.setItem('p-english:supabase-auth', JSON.stringify({
      access_token: token,
      refresh_token: 'qa-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiresAt,
      user: {
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'qa-bg@example.com',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Background QA' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
    window.localStorage.setItem('penglish-foundation48-progress-v1', JSON.stringify({
      lastDayOpened: 2,
      streak: 3,
      lastStudiedDate: '2026-06-08',
      days: {
        1: { started: true, completed: true, completedAt: new Date().toISOString(), completedSteps: [] },
        2: { started: true, completed: false, completedSteps: ['intro'] },
      },
    }));
  }, { userId });

  return context;
}

async function inspectBackgrounds(page, label) {
  const metrics = await page.evaluate(() => {
    const pick = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        selector,
        background: style.background,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backgroundSize: style.backgroundSize,
        backgroundPosition: style.backgroundPosition,
        backgroundRepeat: style.backgroundRepeat,
        backdropFilter: style.backdropFilter || style.webkitBackdropFilter || '',
        width: rect.width,
        height: rect.height,
        left: rect.left,
        right: rect.right,
      };
    };

    const allBackgroundUrlElements = Array.from(document.querySelectorAll('*')).filter((element) => {
      const image = window.getComputedStyle(element).backgroundImage;
      return image && image !== 'none' && image.includes('/ocean/');
    }).map((element) => ({
      tag: element.tagName.toLowerCase(),
      className: typeof element.className === 'string' ? element.className : '',
      testId: element.getAttribute('data-testid') || '',
      backgroundImage: window.getComputedStyle(element).backgroundImage,
    }));

    const bottomNav = document.querySelector('[data-testid="mobile-bottom-nav"]')?.getBoundingClientRect();
    const summary = document.querySelector('[data-testid="home-today-summary"]')?.getBoundingClientRect();
    const continueSection = document.querySelector('[data-testid="home-continue-section"]')?.getBoundingClientRect();
    const lastTask = document.querySelector('[data-testid="home-task-words"]')?.getBoundingClientRect();
    const pageShell = document.querySelector('[data-testid="home-page"]')?.getBoundingClientRect();

    return {
      body: pick('body'),
      root: pick('#root'),
      oceanShell: pick('.penglish-ocean-shell'),
      oceanBackground: pick('.penglish-ocean-background'),
      appShell: pick('[data-testid="penglish-app-shell"]'),
      sidebar: pick('[data-testid="penglish-sidebar"]'),
      main: pick('[data-testid="penglish-shell-main"]'),
      pageShell: pick('[data-testid="home-page"]'),
      bodyScrollWidth: document.body.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
      backgroundUrlElementCount: allBackgroundUrlElements.length,
      backgroundUrlElements: allBackgroundUrlElements,
      mobileBottomNav: bottomNav ? { top: bottomNav.top, bottom: bottomNav.bottom, height: bottomNav.height } : null,
      summaryRect: summary ? { top: summary.top, bottom: summary.bottom, height: summary.height } : null,
      continueSectionRect: continueSection ? { top: continueSection.top, bottom: continueSection.bottom, height: continueSection.height } : null,
      lastTaskRect: lastTask ? { top: lastTask.top, bottom: lastTask.bottom, height: lastTask.height } : null,
      pageShellRect: pageShell ? { top: pageShell.top, bottom: pageShell.bottom, height: pageShell.height } : null,
    };
  });

  if (!metrics.oceanShell) throw new Error(`${label}: missing .penglish-ocean-shell`);
  if (!metrics.oceanBackground) throw new Error(`${label}: missing .penglish-ocean-background`);
  if (!metrics.pageShell) throw new Error(`${label}: missing home page shell`);
  if (metrics.hasHorizontalOverflow) throw new Error(`${label}: horizontal overflow ${JSON.stringify(metrics)}`);
  if (metrics.backgroundUrlElementCount !== 1) throw new Error(`${label}: expected exactly one ocean image background element, got ${metrics.backgroundUrlElementCount}: ${JSON.stringify(metrics.backgroundUrlElements)}`);
  if (!metrics.oceanBackground.backgroundImage.includes('/ocean/')) throw new Error(`${label}: shell background does not include ocean asset`);
  if (!metrics.oceanBackground.backgroundSize.split(',').every((item) => item.trim() === 'cover')) throw new Error(`${label}: ocean background-size should be cover for every layer: ${metrics.oceanBackground.backgroundSize}`);
  if (!metrics.oceanBackground.backgroundRepeat.split(',').every((item) => item.trim() === 'no-repeat')) throw new Error(`${label}: ocean background-repeat should be no-repeat for every layer: ${metrics.oceanBackground.backgroundRepeat}`);
  if (metrics.pageShell.backgroundImage.includes('/ocean/')) throw new Error(`${label}: page shell still has centered ocean image background`);
  if (metrics.main && metrics.main.backgroundImage !== 'none') throw new Error(`${label}: main content should not have a competing background image`);
  if (metrics.sidebar && !metrics.sidebar.backdropFilter.includes('blur')) throw new Error(`${label}: sidebar should be translucent glass with blur`);

  if (label.includes('mobile')) {
    if (!metrics.mobileBottomNav) throw new Error(`${label}: missing mobile bottom nav`);
    await page.getByTestId('home-continue-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const bottomSafeMetrics = await page.evaluate(() => {
      const nav = document.querySelector('[data-testid="mobile-bottom-nav"]')?.getBoundingClientRect();
      const continueSection = document.querySelector('[data-testid="home-continue-section"]')?.getBoundingClientRect();
      const lastTask = document.querySelector('[data-testid="home-task-words"]')?.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll('.home-dashboard-card')).map((element) => element.getBoundingClientRect().height);
      return {
        navTop: nav?.top ?? null,
        continueSectionBottom: continueSection?.bottom ?? null,
        lastTaskBottom: lastTask?.bottom ?? null,
        safeGap: nav && continueSection ? nav.top - continueSection.bottom : null,
        smallestCardHeight: cards.length ? Math.min(...cards) : null,
        tallestCardHeight: cards.length ? Math.max(...cards) : null,
      };
    });
    if (bottomSafeMetrics.navTop === null || bottomSafeMetrics.continueSectionBottom === null || bottomSafeMetrics.continueSectionBottom > bottomSafeMetrics.navTop - 12) {
      throw new Error(`${label}: bottom nav can overlap final dashboard content: ${JSON.stringify(bottomSafeMetrics)}`);
    }
    metrics.mobileBottomSafe = bottomSafeMetrics;
  }

  return metrics;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = [];
  const errors = [];

  try {
    const context = await setupContext(browser);
    const page = await context.newPage();

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('home-page').waitFor({ timeout: 20000 });
      await page.waitForTimeout(500);
      const metrics = await inspectBackgrounds(page, viewport.label);
      const screenshot = path.join(outDir, `home-dashboard-final-polish-${viewport.label}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      report.push({ label: viewport.label, screenshot, metrics });
    }

    await context.close();
  } catch (error) {
    errors.push(error.message || String(error));
  } finally {
    await browser.close();
  }

  const reportPath = path.resolve(__dirname, '..', 'reports', 'home-dashboard-final-polish-qa.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`Report written to ${reportPath}`);
    process.exit(1);
  }

  console.log(`Home dashboard final polish QA passed. Report written to ${reportPath}`);
  for (const item of report) console.log(`${item.label}: ${item.screenshot}`);
})();
