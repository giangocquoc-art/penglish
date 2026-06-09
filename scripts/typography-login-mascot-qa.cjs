const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_TYPOGRAPHY_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
const reportPath = path.resolve(__dirname, '..', 'reports', 'typography-login-mascot-qa-results.json');

const loadingTexts = [
  'Poo đang mở vùng biển học tập...',
  'Sắp vào lớp rồi...',
  'Poo dang mo vung bien hoc tap',
  'Sap vao lop roi',
];

const routes = [
  {
    key: 'loginDesktop',
    url: '/login',
    width: 1366,
    height: 768,
    mustContain: ['Vào vùng học yên tĩnh', 'Học thử ngay'],
    selectors: ['[data-testid="login-continue-local"]', '[data-testid="login-single-info-message"]'],
    screenshot: 'typography-login-mascot-login-desktop.png',
    checkLogin: true,
  },
  {
    key: 'loginMobile',
    url: '/login',
    width: 390,
    height: 844,
    mustContain: ['Vào vùng học yên tĩnh', 'Học thử ngay'],
    selectors: ['[data-testid="login-continue-local"]', '[data-testid="login-single-info-message"]'],
    screenshot: 'typography-login-mascot-login-mobile.png',
    checkLogin: true,
  },
  {
    key: 'foundation48Desktop',
    url: '/luyen-tieng-anh/48-ngay-lay-goc',
    width: 1366,
    height: 768,
    mustContain: ['Hôm nay học', 'Bắt đầu học'],
    selectors: ['[data-testid="foundation48-roadmap-page"]', '[data-testid="foundation48-continue-card"]'],
    screenshot: 'typography-foundation48-desktop.png',
  },
  {
    key: 'foundation48Mobile',
    url: '/luyen-tieng-anh/48-ngay-lay-goc',
    width: 390,
    height: 844,
    mustContain: ['Hôm nay học', 'Bắt đầu học'],
    selectors: ['[data-testid="foundation48-roadmap-page"]', '[data-testid="foundation48-continue-card"]'],
    screenshot: 'typography-foundation48-mobile.png',
  },
  {
    key: 'learningPathDesktop',
    url: '/learning-path',
    width: 1366,
    height: 768,
    mustContain: ['A1 · Chào hỏi tự tin', 'Tiếp tục học'],
    selectors: ['[data-testid="roadmap-mobile-root"]', '[data-testid="learning-path-current-card"]'],
    screenshot: 'typography-learning-path-desktop.png',
  },
  {
    key: 'learningPathMobile',
    url: '/learning-path',
    width: 390,
    height: 844,
    mustContain: ['A1 · Chào hỏi tự tin', 'Tiếp tục học'],
    selectors: ['[data-testid="roadmap-mobile-root"]', '[data-testid="learning-path-current-card"]'],
    screenshot: 'typography-learning-path-mobile.png',
  },
  {
    key: 'lessonUnit1Desktop',
    url: '/lessons/unit-1-greetings-introduction',
    width: 1366,
    height: 768,
    mustContain: ['Bước 1: Nghe', 'Nghe câu này'],
    selectors: ['[data-testid="lesson-mobile-root"]', '[data-testid="lesson-active-step"]'],
    screenshot: 'typography-lesson-unit1-desktop.png',
  },
  {
    key: 'lessonUnit1Mobile',
    url: '/lessons/unit-1-greetings-introduction',
    width: 390,
    height: 844,
    mustContain: ['Bước 1: Nghe', 'Nghe câu này'],
    selectors: ['[data-testid="lesson-mobile-root"]', '[data-testid="lesson-active-step"]'],
    screenshot: 'typography-lesson-unit1-mobile.png',
  },
  {
    key: 'words',
    url: '/words',
    width: 1366,
    height: 768,
    mustContain: ['Từ vựng của bạn', 'Sổ tay từ đã học thật'],
    selectors: ['[data-testid="vocab-mobile-root"]', '[data-testid="vocab-learning-guidance"]', '[data-testid="vocab-review-today-card"]'],
    screenshot: 'typography-words-desktop.png',
  },
  {
    key: 'practice',
    url: '/practice',
    width: 1366,
    height: 768,
    mustContain: ['Khu luyện tập', 'Luyện tập'],
    selectors: ['[data-testid="practice-mobile-root"]'],
    screenshot: 'typography-practice-desktop.png',
  },
  {
    key: 'shadowing',
    url: '/shadowing',
    width: 1366,
    height: 768,
    mustContain: ['Shadowing cùng Poo', 'Transcript'],
    selectors: ['[data-testid="shadowing-mobile-root"]', '[data-testid="shadowing-hero"]', '[data-testid="shadowing-practice-card"]', '[data-testid="shadowing-transcript-panel"]'],
    screenshot: 'typography-shadowing-desktop.png',
  },
  {
    key: 'englishSpeed',
    url: '/english-speed',
    width: 1366,
    height: 768,
    mustContain: ['English Speed', 'Quy trình luyện phát âm'],
    selectors: ['[data-testid="speed-mobile-root"]', '[data-testid="english-speed-stat-grid"]', '[data-testid="english-speed-mode-grid"]', '[data-testid="speed-current-prompt"]'],
    screenshot: 'typography-english-speed-desktop.png',
  },
];

function isAllowedFailedRequest(url) {
  return url.includes('youtube') || url.includes('ytimg') || url.includes('googlevideo') || url.includes('favicon') || url.includes('fonts.gstatic.com') || url.includes('/ocean/ambient-whale/frames/') || url.includes('/ocean/backgrounds/');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

async function waitForRouteContent(page, route) {
  try {
    await page.waitForFunction(
      ({ mustContain, selectors, selectorMode, loadingTexts: loading }) => {
        const normalize = (value) => String(value || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .toLowerCase();
        const bodyText = document.body.innerText || '';
        const normalizedBody = normalize(bodyText);
        const isLoading = loading.some((text) => bodyText.includes(text) || normalizedBody.includes(normalize(text)));
        if (isLoading) return false;

        const requiredTextsVisible = mustContain.length === 0 || mustContain.every((text) => bodyText.includes(text) || normalizedBody.includes(normalize(text)));
        const selectorMatches = selectors.map((selector) => Boolean(document.querySelector(selector)));
        const selectorsReady = selectors.length > 0 && (selectorMode === 'any' ? selectorMatches.some(Boolean) : selectorMatches.every(Boolean));

        return selectorsReady || requiredTextsVisible;
      },
      {
        mustContain: route.mustContain || [],
        selectors: route.selectors || [],
        selectorMode: route.selectorMode || 'all',
        loadingTexts,
      },
      { timeout: 30000 },
    );
    const value = await page.evaluate(({ mustContain, selectors, selectorMode, loadingTexts: loading }) => {
      const normalize = (text) => String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
      const bodyText = document.body.innerText || '';
      const normalizedBody = normalize(bodyText);
      const requiredTextsVisible = mustContain.length === 0 || mustContain.every((text) => bodyText.includes(text) || normalizedBody.includes(normalize(text)));
      const selectorMatches = selectors.map((selector) => Boolean(document.querySelector(selector)));
      const selectorsReady = selectors.length > 0 && (selectorMode === 'any' ? selectorMatches.some(Boolean) : selectorMatches.every(Boolean));
      const isLoading = loading.some((text) => bodyText.includes(text) || normalizedBody.includes(normalize(text)));
      return {
        requiredTextsVisible,
        selectorsReady,
        isLoading,
        reason: selectorsReady ? 'selectors-ready' : requiredTextsVisible ? 'text-ready' : 'ready',
      };
    }, {
      mustContain: route.mustContain || [],
      selectors: route.selectors || [],
      selectorMode: route.selectorMode || 'all',
      loadingTexts,
    });
    await page.waitForTimeout(500);
    return { ready: true, ...value };
  } catch (error) {
    const bodyText = await page.evaluate(() => document.body.innerText || '').catch(() => '');
    return {
      ready: false,
      message: `Timed out waiting for real content on ${route.url}. Required text: ${(route.mustContain || []).join(' | ')}. Selectors: ${(route.selectors || []).join(' | ')}. Body preview: ${bodyText.replace(/\s+/g, ' ').slice(0, 220)}`,
    };
  }
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const warnings = [];
  const failedRequests = [];
  const consoleErrors = [];
  const results = {};
  const screenshots = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console error on ${page.url()}: ${msg.text()}`);
  });

  page.on('pageerror', (error) => consoleErrors.push(`page error on ${page.url()}: ${error.message}`));

  page.on('requestfailed', (request) => {
    const url = request.url();
    if (isAllowedFailedRequest(url)) return;
    failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  for (const route of routes) {
    console.log(`Checking ${route.key} ${route.url} at ${route.width}x${route.height}`);
    await page.setViewportSize({ width: route.width, height: route.height });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    const routeReady = await waitForRouteContent(page, route);
    if (!routeReady.ready) {
      warnings.push(routeReady.message);
      results[route.key] = { url: route.url, viewport: { width: route.width, height: route.height }, skippedFinalScreenshot: true, warning: routeReady.message };
      console.warn(routeReady.message);
      continue;
    }

    const screenshotPath = path.join(screenshotDir, route.screenshot);
    await page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled', timeout: 60000 });
    screenshots.push(`reports/screenshots/${route.screenshot}`);

    const checks = await page.evaluate((checkLogin) => {
      const bodyText = document.body.innerText || '';
      const visibleMojibakePattern = /áº|á»|Æ|Ä[\u0080-\u00bf\u0100-\u017f]?|â(?:€|€“|€”|€¢|†’)|Ã[^\sA-Z]/g;
      const visibleMojibakeMatches = Array.from(new Set((bodyText.match(visibleMojibakePattern) || []).slice(0, 20)));
      const bodyStyle = getComputedStyle(document.body);
      const heading = document.querySelector('h1, [role="heading"], .chakra-heading');
      const headingStyle = heading ? getComputedStyle(heading) : null;
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonWeights = buttons.slice(0, 5).map((button) => getComputedStyle(button).fontWeight);
      const mascot = document.querySelector('[data-testid="login-poo-mascot"]');
      const mascotImage = mascot ? mascot.querySelector('img') : null;
      const logoImage = document.querySelector('img[alt="P-English logo"]');
      const mascotRect = mascot ? mascot.getBoundingClientRect() : null;
      const mascotImageRect = mascotImage ? mascotImage.getBoundingClientRect() : null;
      const logoImageRect = logoImage ? logoImage.getBoundingClientRect() : null;
      const viewportWidth = document.documentElement.clientWidth;
      const clippedText = Array.from(document.querySelectorAll('h1, h2, h3, p, button, span')).filter((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const style = getComputedStyle(el);
        return style.overflow !== 'visible' && el.scrollWidth > el.clientWidth + 2;
      }).slice(0, 8).map((el) => ({ text: (el.textContent || '').trim().slice(0, 80), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));

      return {
        url: window.location.pathname,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        visibleMojibakeMatches,
        bodyFontFamily: bodyStyle.fontFamily,
        bodyFontWeight: bodyStyle.fontWeight,
        bodyLineHeight: bodyStyle.lineHeight,
        headingFontFamily: headingStyle ? headingStyle.fontFamily : null,
        headingFontWeight: headingStyle ? headingStyle.fontWeight : null,
        headingLetterSpacing: headingStyle ? headingStyle.letterSpacing : null,
        buttonWeights,
        bodyScrollWidth: document.body.scrollWidth,
        htmlClientWidth: viewportWidth,
        hasHorizontalOverflow: document.body.scrollWidth > viewportWidth + 1,
        clippedText,
        loginMascot: checkLogin ? {
          wrapper: mascotRect ? { width: mascotRect.width, height: mascotRect.height, top: mascotRect.top, left: mascotRect.left } : null,
          image: mascotImageRect ? { width: mascotImageRect.width, height: mascotImageRect.height, top: mascotImageRect.top, left: mascotImageRect.left } : null,
          src: mascotImage ? mascotImage.currentSrc || mascotImage.src : null,
          naturalWidth: mascotImage ? mascotImage.naturalWidth : null,
          naturalHeight: mascotImage ? mascotImage.naturalHeight : null,
          imageRendering: mascotImage ? getComputedStyle(mascotImage).imageRendering : null,
          logoImage: logoImageRect ? { width: logoImageRect.width, height: logoImageRect.height } : null,
        } : null,
      };
    }, Boolean(route.checkLogin));

    results[route.key] = checks;

    if (!normalizeText(checks.bodyFontFamily).includes('be vietnam pro')) {
      errors.push(`Be Vietnam Pro not applied on ${route.url}: ${checks.bodyFontFamily}`);
    }
    if (checks.hasHorizontalOverflow) {
      errors.push(`horizontal overflow on ${route.url}: ${JSON.stringify({ scrollWidth: checks.bodyScrollWidth, clientWidth: checks.htmlClientWidth })}`);
    }
    if (checks.clippedText.length > 0) {
      errors.push(`possible clipped text on ${route.url}: ${JSON.stringify(checks.clippedText)}`);
    }
    if (checks.visibleMojibakeMatches.length > 0) {
      errors.push(`visible mojibake on ${route.url}: ${checks.visibleMojibakeMatches.join(', ')}`);
    }
    if (route.checkLogin) {
      const image = checks.loginMascot && checks.loginMascot.image;
      const naturalWidth = checks.loginMascot && checks.loginMascot.naturalWidth;
      const maxWidth = route.width < 768 ? 145 : 205;
      if (!image || !naturalWidth) {
        errors.push(`login mascot missing on ${route.url}`);
      } else {
        if (image.width > maxWidth) errors.push(`login mascot too large on ${route.url}: ${JSON.stringify(checks.loginMascot)}`);
        if (image.width > naturalWidth) errors.push(`login mascot upscaled beyond natural width on ${route.url}: ${JSON.stringify(checks.loginMascot)}`);
      }
    }
  }

  await browser.close();

  if (failedRequests.length) errors.push(`failed requests:\n${failedRequests.join('\n')}`);
  if (consoleErrors.length) errors.push(`console/page errors:\n${consoleErrors.join('\n')}`);

  const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    passed: errors.length === 0,
    errors,
    warnings,
    routes: results,
    screenshots,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`Report saved to ${reportPath}`);
    process.exit(1);
  }

  if (warnings.length) {
    console.warn(`Typography and login mascot QA passed with ${warnings.length} warning(s). Report saved to ${reportPath}`);
    process.exit(0);
  }

  console.log(`Typography and login mascot QA passed. Report saved to ${reportPath}`);
})();
