const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'learning-routes-mobile-spacing-qa-results.json');

const routes = [
  {
    name: 'learningPath',
    path: '/learning-path',
    rootTestId: 'roadmap-mobile-root',
    mobileScreenshot: 'learning-path-mobile-topbar-spacing.png',
  },
  {
    name: 'lessonUnit1',
    path: '/lessons/unit-1-greetings-introduction',
    rootTestId: 'lesson-mobile-root',
    mobileScreenshot: 'lesson-unit1-mobile-topbar-spacing.png',
  },
  {
    name: 'foundation48',
    path: '/luyen-tieng-anh/48-ngay-lay-goc',
    rootTestId: 'foundation48-roadmap-page',
    mobileScreenshot: 'foundation48-mobile-topbar-spacing.png',
  },
];

const viewports = {
  desktop: { width: 1440, height: 950 },
  mobile: { width: 390, height: 844 },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function waitForAppReady(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);
}

async function evaluateCommon(page, rootTestId) {
  return page.evaluate((testId) => {
    const root = document.querySelector(`[data-testid="${testId}"]`);
    const bottomNav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const html = document.documentElement;
    const body = document.body;
    const horizontalOverflow = body.scrollWidth > html.clientWidth + 1 || html.scrollWidth > html.clientWidth + 1;

    return {
      hasRoot: Boolean(root),
      hasBottomNav: Boolean(bottomNav),
      horizontalOverflow,
      bodyScrollWidth: body.scrollWidth,
      htmlScrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
      scrollHeight: Math.max(body.scrollHeight, html.scrollHeight),
      viewportHeight: window.innerHeight,
    };
  }, rootTestId);
}

async function evaluateMobileTopbarSpacing(page) {
  const positions = [
    { name: 'top', y: 0 },
    { name: 'middle', y: Math.max(0, Math.floor((await page.evaluate(() => document.documentElement.scrollHeight)) / 2)) },
  ];
  const samples = [];

  for (const position of positions) {
    await page.evaluate((y) => window.scrollTo(0, y), position.y);
    await page.waitForTimeout(250);
    samples.push(await page.evaluate((sampleName) => {
      const header = document.querySelector('[data-testid="app-topbar"]');
      const headerRect = header?.getBoundingClientRect();
      const headerStyle = header ? window.getComputedStyle(header) : null;
      const candidates = Array.from(document.querySelectorAll('main [class*="penglish-glass-card"], main [data-testid="lesson-step-card"], main [data-testid="foundation48-roadmap"], main button, main a[href]'))
        .filter((element) => {
          if (element.closest('[data-testid="mobile-bottom-nav"]')) return false;
          if (element.closest('[data-testid="app-topbar"]')) return false;
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && rect.top < window.innerHeight && rect.bottom > 0;
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            testId: element.getAttribute('data-testid') || '',
            tagName: element.tagName,
            text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
          };
        });

      const headerBox = headerRect ? { top: headerRect.top, bottom: headerRect.bottom, left: headerRect.left, right: headerRect.right, height: headerRect.height, position: headerStyle?.position || null } : null;
      const overlapped = headerBox
        ? candidates.filter((item) => {
            const horizontalOverlap = Math.min(headerBox.right, item.right) - Math.max(headerBox.left, item.left);
            const verticalOverlap = Math.min(headerBox.bottom, item.bottom) - Math.max(headerBox.top, item.top);
            return horizontalOverlap > 1 && verticalOverlap > 1;
          })
        : [];

      return {
        sampleName,
        headerRect: headerBox,
        overlapped,
        topbarOverlapsContent: overlapped.length > 0,
        scrollY: window.scrollY,
      };
    }, position.name));
  }

  return {
    hasTopbar: samples.some((sample) => Boolean(sample.headerRect)),
    topbarOverlapsContent: samples.some((sample) => sample.topbarOverlapsContent),
    samples,
  };
}

async function evaluateMobileSpacing(page, routeName) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(350);

  return page.evaluate((name) => {
    const bottomNav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const navRect = bottomNav?.getBoundingClientRect();
    const candidates = Array.from(document.querySelectorAll('main [class*="penglish-glass-card"], [data-testid="lesson-step-card"], [data-testid="foundation48-roadmap"], main button, main a[href]'))
      .filter((element) => {
        if (element.closest('[data-testid="mobile-bottom-nav"]')) return false;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          testId: element.getAttribute('data-testid') || '',
          tagName: element.tagName,
          text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
        };
      });

    const visibleCandidates = candidates.filter((item) => item.top < window.innerHeight && item.bottom > 0);
    const lastVisible = visibleCandidates.sort((a, b) => b.bottom - a.bottom)[0] || null;
    const minGapFromNav = navRect && lastVisible ? navRect.top - lastVisible.bottom : null;
    const contentCoveredByNav = Boolean(navRect && lastVisible && lastVisible.bottom > navRect.top - 1);
    const root = document.querySelector(name === 'lessonUnit1' ? '[data-testid="lesson-mobile-root"]' : name === 'foundation48' ? '[data-testid="foundation48-roadmap-page"]' : '[data-testid="roadmap-mobile-root"]');
    const rootStyle = root ? window.getComputedStyle(root) : null;

    const lessonVisibleStepCards = name === 'lessonUnit1'
      ? Array.from(document.querySelectorAll('[data-testid="lesson-step-card"]')).filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        }).length
      : null;
    const lessonFlashcardPreviewCount = name === 'lessonUnit1'
      ? document.querySelectorAll('[data-testid="lesson-flashcard-preview"], [data-testid="lesson-guided-mode-content"][data-lesson-mode="flashcard"], [data-testid="lesson-guided-mode-content"]').length
      : null;

    return {
      navRect: navRect ? { top: navRect.top, bottom: navRect.bottom, height: navRect.height } : null,
      lastVisible,
      minGapFromNav,
      contentCoveredByNav,
      rootPaddingBottom: rootStyle?.paddingBottom || null,
      scrollY: window.scrollY,
      lessonVisibleStepCards,
      lessonFlashcardPreviewCount,
    };
  }, routeName);
}

async function checkRoute(browser, route, viewportName) {
  const context = await browser.newContext({ viewport: viewports[viewportName], deviceScaleFactor: viewportName === 'mobile' ? 2 : 1, isMobile: viewportName === 'mobile' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 45000 });
  await waitForAppReady(page);

  const common = await evaluateCommon(page, route.rootTestId);
  const topbarSpacing = viewportName === 'mobile' ? await evaluateMobileTopbarSpacing(page) : null;
  const spacing = viewportName === 'mobile' ? await evaluateMobileSpacing(page, route.name) : null;

  if (viewportName === 'mobile') {
    await page.screenshot({ path: path.join(screenshotDir, route.mobileScreenshot), fullPage: true });
  }

  await context.close();
  return { common, spacing, topbarSpacing, consoleErrors, pageErrors };
}

(async () => {
  ensureDir(screenshotDir);
  const browser = await chromium.launch();
  const results = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    routes: {},
    screenshots: routes.map((route) => `reports/screenshots/${route.mobileScreenshot}`),
  };

  try {
    for (const route of routes) {
      results.routes[route.name] = {
        path: route.path,
        desktop: await checkRoute(browser, route, 'desktop'),
        mobile: await checkRoute(browser, route, 'mobile'),
      };
    }
  } finally {
    await browser.close();
  }

  const failures = [];
  for (const [name, result] of Object.entries(results.routes)) {
    for (const viewportName of ['desktop', 'mobile']) {
      const viewport = result[viewportName];
      if (!viewport.common.hasRoot) failures.push(`${name}/${viewportName}: root not found`);
      if (viewport.common.horizontalOverflow) failures.push(`${name}/${viewportName}: horizontal overflow`);
      if (viewport.consoleErrors.length) failures.push(`${name}/${viewportName}: console errors (${viewport.consoleErrors.length})`);
      if (viewport.pageErrors.length) failures.push(`${name}/${viewportName}: page errors (${viewport.pageErrors.length})`);
    }
    if (!result.mobile.common.hasBottomNav) failures.push(`${name}/mobile: bottom nav not found`);
    if (!result.mobile.topbarSpacing?.hasTopbar) failures.push(`${name}/mobile: topbar not found`);
    if (result.mobile.topbarSpacing?.topbarOverlapsContent) failures.push(`${name}/mobile: topbar overlaps visible route content`);
    if (result.mobile.spacing?.contentCoveredByNav) failures.push(`${name}/mobile: bottom nav overlaps visible bottom content`);
    if (name === 'lessonUnit1') {
      if (result.mobile.spacing?.lessonVisibleStepCards !== 1) failures.push('lessonUnit1/mobile: expected exactly one visible lesson step card');
      if (result.mobile.spacing?.lessonFlashcardPreviewCount !== 0) failures.push('lessonUnit1/mobile: flashcard/guided practice content visible initially');
    }
  }

  results.failures = failures;
  results.passed = failures.length === 0;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.passed, failures, reportPath, screenshots: results.screenshots }, null, 2));

  if (failures.length) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
