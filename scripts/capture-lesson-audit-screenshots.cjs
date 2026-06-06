const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'reports', 'screenshots');
const preferredBaseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:4173';
const fallbackBaseUrls = ['http://127.0.0.1:4173', 'http://127.0.0.1:5181', 'http://127.0.0.1:5180'];

const viewports = [
  { label: 'desktop', width: 1366, height: 768, kind: 'desktop' },
  { label: 'mobile-390', width: 390, height: 844, kind: 'mobile' },
  { label: 'mobile-430', width: 430, height: 932, kind: 'mobile' },
];

const shots = [
  {
    route: '/home',
    file: 'mobile-lesson-ux-polish-home',
    waitForSelector: '.penglish-ocean-shell',
    mobileRoot: '.penglish-ocean-shell',
    requiredSelectors: ['[data-testid="mobile-bottom-nav"]', '[data-testid="poo-swim-layer"]'],
    capture: 'fullPage',
    viewports: ['desktop', 'mobile-390'],
  },
  {
    route: '/learning-path',
    file: 'mobile-lesson-ux-polish-roadmap',
    waitForSelector: '[data-testid="roadmap-mobile-root"]',
    mobileRoot: '[data-testid="roadmap-mobile-root"]',
    requiredSelectors: ['[data-testid="roadmap-unit-card"]'],
    minVisible: { selector: '[data-testid="roadmap-unit-card"]', count: 3 },
    safeSelector: '[data-testid="roadmap-mobile-root"]',
    capture: 'fullPage',
    viewports: ['desktop', 'mobile-390'],
  },
  {
    route: '/lessons/unit-1-greetings-introduction',
    file: 'mobile-lesson-ux-polish-sample-lesson-full-page',
    waitForSelector: '[data-testid="lesson-mobile-root"]',
    mobileRoot: '[data-testid="lesson-mobile-root"]',
    requiredSelectors: ['[data-testid="lesson-step-nav"]', '[data-testid="lesson-active-step"]', '[data-testid="lesson-mobile-progress-details"]'],
    capture: 'fullPage',
    viewports: ['desktop', 'mobile-390', 'mobile-430'],
    preAssert: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
    },
  },
  {
    route: '/lessons/unit-1-greetings-introduction',
    file: 'mobile-lesson-ux-polish-sample-lesson-top',
    waitForSelector: '[data-testid="lesson-mobile-root"]',
    mobileRoot: '[data-testid="lesson-mobile-root"]',
    requiredSelectors: ['[data-testid="lesson-active-step"]'],
    capture: 'viewport',
    viewports: ['mobile-390', 'mobile-430'],
    preAssert: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
    },
  },
  {
    route: '/lessons/unit-1-greetings-introduction',
    file: 'mobile-lesson-ux-polish-sample-lesson-middle',
    waitForSelector: '[data-testid="lesson-mobile-root"]',
    mobileRoot: '[data-testid="lesson-mobile-root"]',
    requiredSelectors: ['[data-testid="lesson-step-nav"]', '[data-testid="lesson-active-step"]'],
    capture: 'viewport',
    viewports: ['mobile-390', 'mobile-430'],
    preAssert: async (page) => {
      await page.evaluate(() => window.scrollTo(0, Math.max(0, Math.floor(document.documentElement.scrollHeight * 0.42))));
      await page.waitForTimeout(350);
    },
  },
  {
    route: '/lessons/unit-1-greetings-introduction',
    file: 'mobile-lesson-ux-polish-sample-lesson-bottom',
    waitForSelector: '[data-testid="lesson-mobile-root"]',
    mobileRoot: '[data-testid="lesson-mobile-root"]',
    requiredSelectors: ['[data-testid="lesson-active-step"]'],
    capture: 'viewport',
    viewports: ['mobile-390', 'mobile-430'],
    preAssert: async (page) => {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(350);
    },
  },
];

function assert(condition, code, details) {
  if (!condition) throw new Error(`${code}: ${details}`);
}

function readPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  assert(buffer.length >= 24, 'INVALID_PNG_FILE', `${filePath} is too small`);
  assert(buffer.toString('ascii', 1, 4) === 'PNG', 'INVALID_PNG_FILE', `${filePath} is not a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), buffer };
}

function parsePngAverageBrightness(buffer) {
  let offset = 8;
  const chunks = [];
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > buffer.length) break;

    if (type === 'IHDR') {
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      bitDepth = buffer[dataStart + 8];
      colorType = buffer[dataStart + 9];
    } else if (type === 'IDAT') {
      chunks.push(buffer.subarray(dataStart, dataEnd));
    } else if (type === 'IEND') {
      break;
    }
    offset = dataEnd + 4;
  }

  if (!width || !height || bitDepth !== 8 || ![2, 6].includes(colorType) || chunks.length === 0) {
    return { average: 0, sampled: 0 };
  }

  const channels = colorType === 6 ? 4 : 3;
  const rowBytes = width * channels;
  const inflated = zlib.inflateSync(Buffer.concat(chunks));
  const previous = Buffer.alloc(rowBytes);
  const current = Buffer.alloc(rowBytes);
  let inOffset = 0;
  let total = 0;
  let sampled = 0;

  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  };

  for (let y = 0; y < height && inOffset < inflated.length; y += 1) {
    const filter = inflated[inOffset++];
    for (let x = 0; x < rowBytes; x += 1) {
      const raw = inflated[inOffset++];
      const left = x >= channels ? current[x - channels] : 0;
      const up = previous[x];
      const upperLeft = x >= channels ? previous[x - channels] : 0;
      if (filter === 0) current[x] = raw;
      else if (filter === 1) current[x] = (raw + left) & 255;
      else if (filter === 2) current[x] = (raw + up) & 255;
      else if (filter === 3) current[x] = (raw + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) current[x] = (raw + paeth(left, up, upperLeft)) & 255;
      else current[x] = raw;
    }

    const sampleEvery = Math.max(1, Math.floor(width / 60));
    for (let x = 0; x < width; x += sampleEvery) {
      const i = x * channels;
      total += (current[i] + current[i + 1] + current[i + 2]) / 3;
      sampled += 1;
    }
    previous.set(current);
  }

  return { average: sampled ? total / sampled : 0, sampled };
}

async function resolveBaseUrl(page) {
  const candidates = Array.from(new Set([preferredBaseUrl, ...fallbackBaseUrls]));
  for (const baseUrl of candidates) {
    try {
      const response = await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded', timeout: 12000 });
      if (response && response.status() < 500) return baseUrl;
    } catch {
      // Try next local preview/dev server.
    }
  }
  throw new Error(`No local preview server responded from: ${candidates.join(', ')}`);
}

async function waitForReady(page, shot) {
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  if (shot.waitForText) {
    await page.getByText(shot.waitForText, { exact: false }).first().waitFor({ timeout: 20000 });
  }
  if (shot.waitForSelector) {
    await page.waitForSelector(shot.waitForSelector, { timeout: 20000 });
  }
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(900);
}

async function collectViewportMetrics(page) {
  return page.evaluate(() => ({
    windowInnerWidth: window.innerWidth,
    windowInnerHeight: window.innerHeight,
    htmlClientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    htmlScrollWidth: document.documentElement.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
    pageYOffset: window.pageYOffset,
    scrollHeight: document.documentElement.scrollHeight,
  }));
}

async function checkNoHorizontalOverflow(page, route) {
  const metrics = await collectViewportMetrics(page);
  const maxScrollWidth = Math.max(metrics.bodyScrollWidth, metrics.htmlScrollWidth);
  const viewportWidth = metrics.windowInnerWidth || metrics.htmlClientWidth;
  if (maxScrollWidth > viewportWidth + 4) {
    throw new Error(`HORIZONTAL_OVERFLOW: ${route}: ${JSON.stringify(metrics)}`);
  }
  return metrics;
}

async function assertRequiredContent(page, shot, viewport) {
  if (viewport.kind !== 'mobile') return;

  if (shot.mobileRoot) {
    const root = page.locator(shot.mobileRoot).first();
    await root.waitFor({ timeout: 12000 });
    const rootBox = await root.boundingBox();
    assert(rootBox && rootBox.width >= 320, 'INVALID_MOBILE_SCREENSHOT_WIDTH', `${shot.route} root is missing or too narrow: ${JSON.stringify(rootBox)}`);
    assert(rootBox.x >= -4 && rootBox.x + rootBox.width <= viewport.width + 4, 'HORIZONTAL_OVERFLOW', `${shot.route} root outside viewport: ${JSON.stringify(rootBox)}`);
  }

  for (const selector of shot.requiredSelectors || []) {
    const locator = page.locator(selector).first();
    await locator.waitFor({ timeout: 12000 });
    assert(await locator.isVisible(), 'MISSING_MOBILE_CONTENT', `${shot.route} missing visible ${selector}`);
  }

  if (shot.minVisible) {
    const count = await page.locator(shot.minVisible.selector).evaluateAll((nodes) => nodes.filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return rect.width > 40 && rect.height > 30 && style.visibility !== 'hidden' && style.display !== 'none';
    }).length);
    assert(count >= shot.minVisible.count, 'MISSING_MOBILE_CONTENT', `${shot.route} expected at least ${shot.minVisible.count} visible ${shot.minVisible.selector}, got ${count}`);
  }
}

async function assertBottomNavDoesNotOverlap(page, shot, viewport) {
  if (viewport.kind !== 'mobile') return;
  const overlap = await page.evaluate(() => {
    const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    if (!nav) return { hasNav: false, overlapped: [] };
    const navRect = nav.getBoundingClientRect();
    const candidates = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [data-bottom-nav-safe-target="true"], [data-testid="speed-record-button"], [data-testid="shadowing-record-button"], [data-testid="vocab-mobile-card"], [data-testid="roadmap-unit-card"]'));
    const overlapped = candidates
      .filter((node) => !nav.contains(node))
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return {
          testid: node.getAttribute('data-testid') || '',
          tag: node.tagName.toLowerCase(),
          text: (node.textContent || '').trim().slice(0, 80),
          rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
          visible: rect.width > 16 && rect.height > 16 && style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity || 1) > 0.05,
          intersects: rect.bottom > navRect.top + 2 && rect.top < navRect.bottom - 2 && rect.right > navRect.left && rect.left < navRect.right,
        };
      })
      .filter((item) => item.visible && item.intersects && item.tag !== 'html' && item.tag !== 'body');
    return { hasNav: true, navRect: { top: navRect.top, bottom: navRect.bottom, height: navRect.height }, overlapped };
  });

  assert(overlap.hasNav, 'BOTTOM_NAV_OVERLAP', `${shot.route} mobile bottom nav missing`);
  assert(overlap.overlapped.length === 0, 'BOTTOM_NAV_OVERLAP', `${shot.route} bottom nav overlaps visible action/content: ${JSON.stringify(overlap)}`);
}

async function assertLessonFinalSpacing(page, shot, viewport) {
  if (viewport.kind !== 'mobile' || !shot.route.includes('/lessons/')) return;
  const spacing = await page.evaluate(() => {
    const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const root = document.querySelector('[data-testid="lesson-mobile-root"]');
    const finalAction = Array.from(document.querySelectorAll('button, a, [data-bottom-nav-safe-target="true"]')).filter((node) => !nav?.contains(node)).at(-1);
    const navRect = nav?.getBoundingClientRect();
    const rootRect = root?.getBoundingClientRect();
    const actionRect = finalAction?.getBoundingClientRect();
    return {
      hasNav: Boolean(navRect),
      safeGap: navRect && actionRect ? navRect.top - actionRect.bottom : null,
      rootBottomGap: navRect && rootRect ? rootRect.bottom - navRect.bottom : null,
      finalActionText: (finalAction?.textContent || '').trim().slice(0, 80),
      navTop: navRect?.top,
      actionBottom: actionRect?.bottom,
    };
  });

  assert(spacing.hasNav, 'BOTTOM_NAV_OVERLAP', `${shot.route} mobile bottom nav missing for final spacing`);
  if (spacing.safeGap !== null) {
    assert(spacing.safeGap >= 8 || spacing.actionBottom < 0 || spacing.actionBottom > viewport.height, 'BOTTOM_NAV_FINAL_SPACING', `${shot.route} final visible action too close to bottom nav: ${JSON.stringify(spacing)}`);
  }
  assert(spacing.rootBottomGap === null || spacing.rootBottomGap >= 64, 'BOTTOM_NAV_FINAL_SPACING', `${shot.route} root does not keep enough bottom safe padding: ${JSON.stringify(spacing)}`);
}

function assertScreenshotFile(filePath, viewport, route) {
  const { width, height, buffer } = readPngDimensions(filePath);
  console.log(`Screenshot dimensions ${path.basename(filePath)}: ${width}x${height}`);

  if (viewport.kind === 'mobile') {
    assert(width >= 360, 'INVALID_MOBILE_SCREENSHOT_WIDTH', `${route} screenshot width is ${width}`);
    const brightness = parsePngAverageBrightness(buffer);
    console.log(`Screenshot brightness ${path.basename(filePath)}: average=${brightness.average.toFixed(2)} sampled=${brightness.sampled}`);
    assert(brightness.sampled > 0 && brightness.average < 252, 'BLANK_MOBILE_SCREENSHOT', `${route} screenshot appears blank/white: ${JSON.stringify(brightness)}`);
  }

  return { width, height };
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(45000);
  const consoleErrors = [];
  const requestFailures = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('Failed to load resource') && (text.includes('favicon') || text.includes('youtube') || text.includes('googlevideo'))) return;
    consoleErrors.push(`${page.url()} :: ${text}`);
  });

  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('favicon') || url.includes('youtube') || url.includes('googlevideo') || url.includes('/@fs/')) return;
    requestFailures.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  await page.addInitScript(() => {
    const user = {
      id: 'lesson-audit-local-user',
      name: 'Lesson Audit QA',
      email: 'lesson-audit@example.local',
      avatar: '',
      coin: 1250,
      streak: 7,
      vip: true,
      bio: 'Local QA profile for lesson foundation screenshots.',
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
  });

  try {
    const baseUrl = await resolveBaseUrl(page);
    for (const viewport of viewports) {
      for (const shot of shots.filter((item) => !item.viewports || item.viewports.includes(viewport.label))) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${baseUrl}${shot.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitForReady(page, shot);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(250);
        if (typeof shot.preAssert === 'function') {
          await shot.preAssert(page, viewport);
          await page.waitForTimeout(250);
        }
        await assertRequiredContent(page, shot, viewport);
        const metrics = await checkNoHorizontalOverflow(page, `${shot.route} (${viewport.label}, ${shot.capture})`);
        console.log(`Viewport metrics ${shot.route} (${viewport.label}, ${shot.capture}): ${JSON.stringify(metrics)}`);
        await assertBottomNavDoesNotOverlap(page, shot, viewport);
        await assertLessonFinalSpacing(page, shot, viewport);
        const fileName = `${shot.file}-${viewport.label}.png`;
        const filePath = path.join(outDir, fileName);
        await page.screenshot({ path: filePath, fullPage: shot.capture === 'fullPage', animations: 'disabled', timeout: 60000 });
        assertScreenshotFile(filePath, viewport, shot.route);
        console.log(`Captured ${fileName} from ${shot.route}`);
      }
    }

    if (requestFailures.length) {
      console.warn(`Non-fatal request failures:\n${requestFailures.join('\n')}`);
    }
    if (consoleErrors.length) {
      console.warn(`Non-fatal console errors:\n${consoleErrors.join('\n')}`);
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
