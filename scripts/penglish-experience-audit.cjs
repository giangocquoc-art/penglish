const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const REPORT_DIR = path.resolve(__dirname, '..', 'reports', 'ux-audit');
const ROUTES = [
  { name: 'home', path: '/home' },
  { name: 'today', path: '/today' },
  { name: 'learning-path', path: '/learning-path' },
  { name: 'foundation-overview', path: '/luyen-tieng-anh/48-ngay-lay-goc' },
  { name: 'foundation-day-1', path: '/luyen-tieng-anh/48-ngay-lay-goc/ngay/1' },
  { name: 'core-lesson', path: '/lessons/unit-1-greetings-introduction', expectedText: ['Bước 1: Nghe'] },
  { name: 'grammar-lesson', path: '/lessons/grammar-a1-articles-a-an-the', expectedText: ['Bước 1: Nhìn mẫu', 'Mẫu trọng tâm'] },
  { name: 'reading-lesson', path: '/lessons/reading-a1-my-morning', expectedText: ['Bước 1: Đọc lượt 1', 'Đoạn đọc chính'] },
  { name: 'interactive-lesson', path: '/learning-path/lesson/unit-1-greetings/unit-1-greetings-vocabulary-0' },
  { name: 'shadowing', path: '/shadowing' },
  { name: 'shadowing-practice', path: '/shadowing/practice/curated-a1-greeting-friend' },
  { name: 'practice', path: '/practice' },
  { name: 'vocabulary', path: '/vocabularies' },
  { name: 'speaking-coach', path: '/speaking-coach' },
  { name: 'games', path: '/games' },
  { name: 'profile', path: '/profile' },
  { name: 'folders', path: '/folders' },
  { name: 'chat', path: '/chat' },
  { name: 'ai', path: '/ai' },
  { name: 'shop', path: '/shop' },
  { name: 'login', path: '/login' },
  { name: 'not-found', path: '/khong-co-trang-nay' },
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function inspectPage(page, viewport) {
  return page.evaluate(({ width, height }) => {
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const closedDetails = element.closest('details:not([open])');
      if (closedDetails && !closedDetails.querySelector(':scope > summary')?.contains(element)) return false;
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const selectorFor = (element) => {
      const testId = element.getAttribute('data-testid');
      if (testId) return `[data-testid="${testId}"]`;
      const id = element.id;
      if (id) return `#${id}`;
      const text = (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
      return `${element.tagName.toLowerCase()}${text ? ` "${text}"` : ''}`;
    };
    const interactive = [...document.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"], [role="link"]')]
      .filter(isVisible);
    const unnamedControls = interactive
      .filter((element) => {
        const labelledBy = element.getAttribute('aria-labelledby');
        const labelledText = labelledBy
          ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim()
          : '';
        return !(
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          labelledText ||
          (element.textContent || '').trim() ||
          element.querySelector('img[alt]:not([alt=""])')
        );
      })
      .map(selectorFor);
    const smallTouchTargets = width <= 480
      ? interactive
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.width < 40 || rect.height < 40)
          .map(({ element, rect }) => ({ selector: selectorFor(element), width: Math.round(rect.width), height: Math.round(rect.height) }))
      : [];
    const brokenImages = [...document.images]
      .filter((image) => isVisible(image) && (!image.complete || image.naturalWidth === 0))
      .map((image) => ({ src: image.currentSrc || image.src, alt: image.alt }));
    const missingAltImages = [...document.images]
      .filter((image) => isVisible(image) && !image.hasAttribute('alt'))
      .map((image) => image.currentSrc || image.src);
    const tinyText = [...document.querySelectorAll('body *')]
      .filter((element) => isVisible(element) && element.children.length === 0 && (element.textContent || '').trim())
      .map((element) => ({ element, size: Number.parseFloat(window.getComputedStyle(element).fontSize) }))
      .filter(({ size }) => size < 12)
      .slice(0, 20)
      .map(({ element, size }) => ({ selector: selectorFor(element), size }));
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter(isVisible)
      .map((heading) => ({ level: Number(heading.tagName.slice(1)), text: (heading.textContent || '').trim().replace(/\s+/g, ' ') }));
    const headingSkips = headings.slice(1).filter((heading, index) => heading.level > headings[index].level + 1);
    const fixedElements = [...document.querySelectorAll('body *')]
      .filter((element) => isVisible(element) && ['fixed', 'sticky'].includes(window.getComputedStyle(element).position))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { selector: selectorFor(element), top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
      });
    return {
      viewportSize: { width, height },
      title: document.title,
      h1Count: headings.filter((heading) => heading.level === 1).length,
      headings,
      headingSkips,
      unnamedControls,
      smallTouchTargets,
      brokenImages,
      missingAltImages,
      tinyText,
      fixedElements,
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      documentHeight: document.documentElement.scrollHeight,
      visibleControlCount: interactive.length,
    };
  }, viewport);
}

(async () => {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        serviceWorkers: 'block',
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const responseErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('response', (response) => {
        if (response.status() >= 400) responseErrors.push(`${response.status()} ${response.url()}`);
      });

      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.locator('[data-testid="route-loading-fallback"]').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
        await page.locator('h1').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].filter((image) => image.loading !== 'lazy').map((image) => image.decode().catch(() => null)));
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const inspection = await inspectPage(page, viewport);
        const bodyText = await page.locator('body').innerText();
        const normalizedBodyText = bodyText.toLocaleLowerCase('vi-VN');
        const missingExpectedText = (route.expectedText || []).filter((text) => !normalizedBodyText.includes(text.toLocaleLowerCase('vi-VN')));
        const screenshot = path.join(REPORT_DIR, `${viewport.name}-${route.name}.png`);
        await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
        results.push({
          route: route.path,
          routeName: route.name,
          viewport: viewport.name,
          finalUrl: page.url().replace(BASE_URL, ''),
          screenshot: path.relative(path.resolve(__dirname, '..'), screenshot),
          consoleErrors,
          pageErrors,
          responseErrors,
          missingExpectedText,
          ...inspection,
        });
      } catch (error) {
        results.push({
          route: route.path,
          routeName: route.name,
          viewport: viewport.name,
          consoleErrors,
          pageErrors,
          responseErrors,
          fatalError: error.message,
        });
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();
  const summary = {
    baseUrl: BASE_URL,
    pageCount: results.length,
    fatalErrorCount: results.filter((item) => item.fatalError).length,
    horizontalOverflowCount: results.filter((item) => item.horizontalOverflow > 0).length,
    brokenImageCount: results.reduce((sum, item) => sum + (item.brokenImages?.length || 0), 0),
    missingAltImageCount: results.reduce((sum, item) => sum + (item.missingAltImages?.length || 0), 0),
    unnamedControlCount: results.reduce((sum, item) => sum + (item.unnamedControls?.length || 0), 0),
    smallTouchTargetCount: results.reduce((sum, item) => sum + (item.smallTouchTargets?.length || 0), 0),
    consoleErrorCount: results.reduce((sum, item) => sum + item.consoleErrors.length, 0),
    pageErrorCount: results.reduce((sum, item) => sum + item.pageErrors.length, 0),
    responseErrorCount: results.reduce((sum, item) => sum + item.responseErrors.length, 0),
    contentMismatchCount: results.reduce((sum, item) => sum + (item.missingExpectedText?.length || 0), 0),
  };
  const report = { summary, results };
  fs.writeFileSync(path.join(REPORT_DIR, 'experience-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
  if (
    summary.fatalErrorCount
    || summary.horizontalOverflowCount
    || summary.brokenImageCount
    || summary.missingAltImageCount
    || summary.unnamedControlCount
    || summary.smallTouchTargetCount
    || summary.consoleErrorCount
    || summary.pageErrorCount
    || summary.responseErrorCount
    || summary.contentMismatchCount
  ) {
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
