const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_FINAL_QA_BASE_URL || 'http://127.0.0.1:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routes = [
  { url: '/', slug: 'landing', waitFor: 'Học từ vựng tiếng Anh', landing: true },
  { url: '/home', slug: 'home', waitFor: 'P-English', ambient: 'dashboard', mobileMain: '[data-testid="home-today-action"]' },
  { url: '/learning-path', slug: 'roadmap', waitFor: 'Lộ trình CEFR', ambient: 'roadmap' },
  { url: '/lessons/unit-1-greetings-introduction', slug: 'lesson', waitFor: 'Bước học trong bài', ambient: 'lesson', lesson: true },
  { url: '/english-speed', slug: 'english-speed', waitFor: 'Chế độ phát âm nhanh', ambient: 'speed', speed: true },
  { url: '/shadowing', slug: 'shadowing', waitFor: 'Shadowing cùng Poo', ambient: 'shadowing', shadowing: true },
  { url: '/words', slug: 'words', waitFor: 'Từ vựng của bạn', ambient: 'vocabulary', vocab: true },
  { url: '/english-speed?debugPoo=1', slug: 'english-speed-debug-poo', waitFor: 'Chế độ phát âm nhanh', ambient: 'speed', debugPoo: true },
];

const viewports = [
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'mobile-390', width: 390, height: 844 },
];

function isAllowedFailedRequest(url) {
  return url.includes('youtube')
    || url.includes('ytimg')
    || url.includes('googlevideo')
    || url.includes('favicon')
    || url.includes('chrome-extension')
    || url.includes('/ocean/ambient-whale/frames/');
}

async function waitForAppReady(page, text) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(
    (expected) => document.body && document.body.innerText.includes(expected),
    text,
    { timeout: 45000 },
  ).catch(async (error) => {
    const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    throw new Error(`Timed out waiting for text "${text}" at ${page.url()}. Body started with: ${bodyText.slice(0, 500)}. ${error.message}`);
  });
  await page.waitForTimeout(1200);
}

async function runRouteChecks(page, route, viewport, errors) {
  if (route.lesson) {
    await page.getByTestId('lesson-active-step').waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: /Tiếp tục|Luyện ngay|Học miễn phí/i }).first().waitFor({ timeout: 5000 });
  }

  if (route.speed) {
    await page.getByTestId('speed-current-prompt').waitFor({ timeout: 10000 });
    await page.getByTestId('speed-record-button').waitFor({ timeout: 5000 });
  }

  if (route.shadowing) {
    await page.getByTestId('shadowing-current-sentence').waitFor({ timeout: 10000 });
    await page.getByTestId('shadowing-recording-card').waitFor({ timeout: 5000 });
    const iframeCount = await page.locator('iframe[src*="youtube"]').count();
    if (iframeCount > 0) errors.push(`unexpected default YouTube iframe on ${route.url} ${viewport.name}`);
    const unsafeReferenceCount = await page.locator('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').count();
    if (unsafeReferenceCount > 0) errors.push(`unsafe Shadowing YouTube reference rendered on ${route.url} ${viewport.name}`);
  }

  if (route.vocab) {
    await page.getByTestId('vocab-mobile-root').waitFor({ timeout: 10000 });
    await page.getByTestId('vocab-mobile-search').waitFor({ timeout: 5000 });
  }

  if (route.landing) {
    await page.getByTestId('landing-hero-start').waitFor({ timeout: 10000 });
    const heroHref = await page.getByTestId('landing-hero-start').getAttribute('href');
    if (heroHref !== '/home') errors.push(`landing hero CTA should route to /home, received ${heroHref}`);
  }

  const metrics = await page.evaluate(({ route, viewport }) => {
    const ambientLayer = document.querySelector('[data-testid="ambient-poo-whale"], .ambient-poo-whale, .poo-swim-layer');
    const ambientMain = document.querySelector('[data-testid="ambient-poo-whale-main"], .ambient-poo-whale__main, .poo-swim-layer__main');
    const bottomNav = document.querySelector('[data-testid="mobile-bottom-nav"], [data-testid="bottom-nav"], .bottom-nav, nav[aria-label*="bottom" i]');
    const bottomRect = bottomNav ? bottomNav.getBoundingClientRect() : null;
    const actionable = Array.from(document.querySelectorAll('button, a, input, textarea, select'));
    const coveredActions = bottomRect
      ? actionable.filter((el) => {
          if (el.closest('[data-testid="mobile-bottom-nav"], [data-testid="bottom-nav"], .bottom-nav')) return false;
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0 || rect.top >= bottomRect.top || rect.top >= window.innerHeight) return false;
          const overlapHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, bottomRect.top);
          const overlapRatio = overlapHeight / rect.height;
          if (overlapRatio < 0.45) return false;
          const points = [
            [rect.left + rect.width / 2, Math.max(bottomRect.top + 4, rect.top + rect.height / 2)],
            [rect.left + 8, Math.max(bottomRect.top + 4, rect.top + rect.height / 2)],
            [rect.right - 8, Math.max(bottomRect.top + 4, rect.top + rect.height / 2)],
          ];
          return points.every(([rawX, rawY]) => {
            const x = Math.max(1, Math.min(window.innerWidth - 1, rawX));
            const y = Math.max(1, Math.min(window.innerHeight - 1, rawY));
            const topElement = document.elementFromPoint(x, y);
            return Boolean(topElement && bottomNav.contains(topElement));
          });
        }).map((el) => el.getAttribute('data-testid') || el.textContent?.trim().slice(0, 80) || el.tagName)
      : [];
    const cards = Array.from(document.querySelectorAll('[class*="glass"], [data-testid$="card"], button, a')).map((el) => {
      const rect = el.getBoundingClientRect();
      return { text: el.textContent?.trim().slice(0, 80) || '', left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    }).filter((rect) => rect.width > 8 && rect.height > 8 && rect.bottom > 0 && rect.top < window.innerHeight);
    const ambientRect = ambientMain ? ambientMain.getBoundingClientRect() : null;
    const ambientOpacity = ambientMain ? Number.parseFloat(getComputedStyle(ambientMain).opacity || '0') : null;
    const ambientLayerStyle = ambientLayer ? getComputedStyle(ambientLayer) : null;
    const ambientMainStyle = ambientMain ? getComputedStyle(ambientMain) : null;
    const ambientVisible = Boolean(
      ambientLayer
        && ambientMain
        && ambientRect
        && ambientRect.width > 1
        && ambientRect.height > 1
        && ambientLayerStyle?.display !== 'none'
        && ambientLayerStyle?.visibility !== 'hidden'
        && ambientMainStyle?.display !== 'none'
        && ambientMainStyle?.visibility !== 'hidden'
        && (ambientOpacity ?? 0) > 0.01,
    );
    const overlaps = ambientRect
      ? cards.filter((rect) => !(ambientRect.right < rect.left || ambientRect.left > rect.right || ambientRect.bottom < rect.top || ambientRect.top > rect.bottom)).slice(0, 5)
      : [];
    const firstScreenText = document.body.innerText.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 28);
    const detailsStates = Array.from(document.querySelectorAll('details')).map((item) => ({ testid: item.getAttribute('data-testid'), open: item.open, summary: item.querySelector('summary')?.textContent?.trim() }));

    return {
      route,
      viewport,
      bodyScrollWidth: document.body.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      horizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
      ambientPresent: Boolean(ambientLayer),
      ambientVisible,
      ambientOpacity,
      ambientRect: ambientRect ? { left: ambientRect.left, right: ambientRect.right, top: ambientRect.top, bottom: ambientRect.bottom, width: ambientRect.width, height: ambientRect.height } : null,
      ambientOverlaps: overlaps,
      coveredActions,
      firstScreenText,
      detailsStates,
    };
  }, { route: route.url, viewport: viewport.name });

  if (metrics.horizontalOverflow) errors.push(`horizontal overflow on ${route.url} ${viewport.name}: ${JSON.stringify(metrics)}`);
  if (viewport.width < 768 && metrics.coveredActions.length > 0) errors.push(`bottom nav overlap on ${route.url} ${viewport.name}: ${JSON.stringify(metrics.coveredActions)}`);

  if (route.ambient && !route.debugPoo) {
    if (viewport.width < 768 && route.ambient !== 'speed' && metrics.ambientVisible) {
      errors.push(`ambient whale should be hidden on mobile for ${route.url}: ${JSON.stringify(metrics.ambientRect)}`);
    }
    if (viewport.width >= 768 && route.ambient && !metrics.ambientPresent) {
      errors.push(`ambient whale missing on desktop for ${route.url}`);
    }
    if (viewport.width >= 768 && typeof metrics.ambientOpacity === 'number' && metrics.ambientOpacity > 0.18) {
      errors.push(`ambient whale too opaque on desktop for ${route.url}: ${metrics.ambientOpacity}`);
    }
  }

  if (route.debugPoo && viewport.width >= 768 && !metrics.ambientPresent) {
    errors.push(`debugPoo ambient whale missing on ${route.url} ${viewport.name}`);
  }

  if (metrics.ambientOverlaps.length && viewport.width >= 768 && !route.debugPoo) {
    const strongOverlap = metrics.ambientOverlaps.some((item) => item.width > 90 && item.height > 40 && item.left < metrics.htmlClientWidth - 40);
    if (strongOverlap) errors.push(`ambient whale may overlap content on ${route.url} ${viewport.name}: ${JSON.stringify(metrics.ambientOverlaps)}`);
  }

  await page.screenshot({ path: path.join(outDir, `penglish-final-${route.slug}-${viewport.name}.png`), fullPage: false, timeout: 60000 });
  return metrics;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  const qaSummary = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (isAllowedFailedRequest(url)) return;
    failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of routes) {
      console.log(`QA ${viewport.name} ${route.url}`);
      await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'domcontentloaded' });
      await waitForAppReady(page, route.waitFor);
      const metrics = await runRouteChecks(page, route, viewport, errors);
      qaSummary.push(metrics);
    }
  }

  await browser.close();

  fs.writeFileSync(path.join(outDir, 'penglish-final-ocean-ux-polish-qa.json'), JSON.stringify(qaSummary, null, 2));

  if (failedRequests.length) errors.push(`failed requests:\n${failedRequests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`P-English final ocean UX polish QA passed. Saved ${routes.length * viewports.length} screenshots to ${outDir}`);
})();
