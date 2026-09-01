const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_PRODUCT_UX_LOGIC_QA_BASE_URL || 'http://127.0.0.1:5181';
const lessonId = 'unit-1-greetings-introduction';
const screenshotDir = path.resolve(__dirname, '..', 'reports', 'screenshots', 'penglish-visual-qa-fix-v4');
const reportPath = path.resolve(__dirname, '..', 'reports', 'penglish-visual-qa-fix-v4-qa.json');

const keys = {
  rewards: 'penglish.daily.rewards.v1',
  vocabulary: 'penglish.vocabulary.progress.v1',
  shadowing: 'penglish.shadowing.progress.v1',
  lessonProgress: 'penglish.lesson.progress.v1',
  legacyLocalProgress: 'p-english:local-progress',
  todayMissions: 'p-english:today-missions',
  speechProgress: 'p-english:speech-progress',
  legacyLessonProgressPrefix: 'p-english:lesson-progress:',
};

const routes = ['/home', '/learning-path', `/lessons/${lessonId}`, '/english-speed', '/shadowing', '/words'];
const desktopViewport = { width: 1366, height: 768 };
const mobileViewport = { width: 390, height: 844 };

function isAllowedFailedRequest(url, failureText = '') {
  return url.includes('favicon')
    || url.includes('/ocean/ambient-whale/frames/')
    || url.includes('youtube-nocookie.com')
    || url.includes('youtube.com')
    || url.includes('googlevideo.com')
    || (failureText.includes('ERR_ABORTED') && url.startsWith(baseUrl) && (url.includes('/assets/') || url.includes('/@fs/') || url.includes('/ocean/mascots/') || url.includes('/ocean/backgrounds/')));
}

function routeSlug(route) {
  const slug = route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return slug || 'home';
}

async function bodyText(page) {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}

async function clearAllLocalProgress(page) {
  await page.evaluate((storageKeys) => {
    window.localStorage.removeItem(storageKeys.rewards);
    window.localStorage.removeItem(storageKeys.vocabulary);
    window.localStorage.removeItem(storageKeys.shadowing);
    window.localStorage.removeItem(storageKeys.lessonProgress);
    window.localStorage.removeItem(storageKeys.legacyLocalProgress);
    window.localStorage.removeItem(storageKeys.todayMissions);
    window.localStorage.removeItem(storageKeys.speechProgress);
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(storageKeys.legacyLessonProgressPrefix))
      .forEach((key) => window.localStorage.removeItem(key));
  }, keys);
}

function expectedDailyPercent(completedToday) {
  if (!completedToday.length) return '0%';
  return `${Math.round((Math.min(5, completedToday.length) / 5) * 100)}%`;
}

async function seedDailyRewards(page, completedToday) {
  await page.evaluate(({ key, completedToday }) => {
    const now = new Date('2026-01-15T09:00:00.000Z');
    const today = '2026-01-15';
    window.localStorage.setItem(key, JSON.stringify({
      completedToday,
      bubbles: Math.min(5, completedToday.length),
      maxBubbles: 5,
      streakDays: completedToday.length > 0 ? 1 : 0,
      lastActiveDate: completedToday.length > 0 ? today : undefined,
      updatedAt: now.toISOString(),
    }));
    window.dispatchEvent(new Event('penglish.daily.rewards.updated'));
  }, { key: keys.rewards, completedToday });
}

async function seedShadowingDone(page) {
  await page.evaluate((storageKeys) => {
    window.localStorage.setItem(storageKeys.shadowing, JSON.stringify({
      videos: {
        'curated-b1-job-interview-small-talk': {
          practicedSentenceIds: ['curated-b1-job-interview-small-talk-s1'],
          difficultSentenceIds: [],
          lastSentenceId: 'curated-b1-job-interview-small-talk-s1',
          updatedAt: '2026-01-15T09:00:00.000Z',
        },
      },
    }));
  }, keys);
  await seedDailyRewards(page, ['shadowing-practice']);
}

async function seedTwoCompletedUnits(page) {
  await page.evaluate((storageKeys) => {
    const completedLessons = ['unit-1-greetings-introduction', 'a1-listening-meeting-classmate', 'a1-listening-ordering-drink'];
    window.localStorage.setItem(storageKeys.lessonProgress, JSON.stringify({
      lessons: {
        'unit-1-greetings-introduction': { status: 'completed', completedAt: '2026-01-15T09:00:00.000Z' },
        'a1-listening-meeting-classmate': { status: 'completed', completedAt: '2026-01-15T09:05:00.000Z' },
        'a1-listening-ordering-drink': { status: 'completed', completedAt: '2026-01-15T09:10:00.000Z' },
      },
    }));
    window.localStorage.setItem(storageKeys.legacyLocalProgress, JSON.stringify({
      currentStreak: 1,
      lastStudyDate: '2026-01-15',
      completedLessons,
    }));
    completedLessons.forEach((unitId) => {
      window.localStorage.setItem(`${storageKeys.legacyLessonProgressPrefix}${unitId}`, JSON.stringify({ completed: true }));
    });
    window.dispatchEvent(new Event('p-english:local-progress-updated'));
  }, keys);
  await seedDailyRewards(page, ['lesson-completed', 'english-speed']);
}

async function applyScenario(page, scenario) {
  await clearAllLocalProgress(page);
  if (scenario === 'active-shadowing') await seedShadowingDone(page);
  if (scenario === 'two-completed-units') await seedTwoCompletedUnits(page);
}

async function checkNoHorizontalOverflow(page, label, results) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) results.errors.push(`Horizontal overflow on ${label}: ${JSON.stringify(overflow)}`);
}

async function checkMobilePrimaryCtasClearOfNav(page, label, results) {
  const overlap = await page.evaluate(async () => {
    const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    if (!nav) return { checked: 0, candidates: [] };
    const labels = ['Nghe mẫu', 'Nghe chậm', 'Ghi âm câu đọc', 'Bắt đầu ghi âm', 'Dừng ghi âm', 'Ghi lại', 'Thử lại', 'Câu tiếp theo', 'Câu tiếp', '0.75x', '1x', '1.25x', 'Nghe câu', 'Lặp câu', 'Luyện ngay', 'Tiếp tục', 'Thẻ tiếp', 'Trước'];
    const testIds = ['speed-current-prompt', 'speed-record-button', 'english-speed-retry', 'english-speed-next', 'shadowing-listen-button', 'shadowing-repeat-button', 'shadowing-record-button', 'shadowing-next-button', 'home-local-learning-summary', 'home-bubbles-count'];
    const all = Array.from(document.querySelectorAll('button, a, input, textarea, [data-testid="speed-current-prompt"], [data-testid="home-local-learning-summary"], [data-testid="home-bubbles-count"]'));
    const seen = new Set();
    const targets = all.filter((el) => {
      if (nav.contains(el)) return false;
      const text = (el.textContent || el.getAttribute('aria-label') || '').trim();
      const testId = el.getAttribute('data-testid') || '';
      const key = `${testId}:${text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return testIds.includes(testId) || labels.some((labelText) => text.includes(labelText));
    });
    const candidates = [];
    for (const el of targets) {
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      await new Promise((resolve) => window.setTimeout(resolve, 80));
      const navRect = nav.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (rect.width <= 0 || rect.height <= 0 || style.display === 'none' || style.visibility === 'hidden') continue;
      const verticalIntersection = Math.max(0, Math.min(rect.bottom, navRect.bottom) - Math.max(rect.top, navRect.top));
      const horizontalIntersection = Math.max(0, Math.min(rect.right, navRect.right) - Math.max(rect.left, navRect.left));
      const fullBoxIntersectsNav = verticalIntersection > 4 && horizontalIntersection > 4;
      const unsafeGapAfterScroll = rect.bottom > navRect.top - 20;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elementAtCenter = document.elementFromPoint(centerX, centerY);
      const centerBlockedByNav = Boolean(elementAtCenter && nav.contains(elementAtCenter));
      if (fullBoxIntersectsNav || unsafeGapAfterScroll || centerBlockedByNav) {
        candidates.push({ text: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 70), testId: el.getAttribute('data-testid'), rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }, nav: { top: navRect.top, bottom: navRect.bottom }, verticalIntersection, horizontalIntersection, unsafeGapAfterScroll, centerBlockedByNav });
      }
    }
    return { checked: targets.length, candidates };
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  if (overlap.candidates.length) results.errors.push(`Primary CTA/card bounding box unsafe near mobile bottom nav on ${label}: ${JSON.stringify(overlap.candidates.slice(0, 8))}`);
}

async function checkCriticalTextNotClipped(page, label, results) {
  const clipped = await page.evaluate(() => {
    const criticalTexts = ['Sẵn sàng', 'PROMPT', 'BEST'];
    const nodes = Array.from(document.querySelectorAll('body *'));
    return nodes
      .filter((node) => criticalTexts.some((text) => (node.textContent || '').trim() === text || (node.textContent || '').trim().includes(text)))
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        const text = (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
        const overflow = node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1;
        const hidden = style.display === 'none' || style.visibility === 'hidden' || Number.parseFloat(style.opacity || '1') < 0.01;
        const visible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') >= 0.01;
        const isRootLike = ['HTML', 'BODY'].includes(node.tagName) || rect.height > window.innerHeight * 1.5 || rect.width > window.innerWidth * 0.95;
        const isChromeBubble = Boolean(node.closest('[data-testid="topbar-bubbles-badge"], [data-testid="sidebar-bubbles-badge"]'));
        const isWideWrapper = rect.width > window.innerWidth * 0.5 && node.children.length > 0;
        return { text, testId: node.getAttribute('data-testid'), tag: node.tagName, overflow, hidden, visible, isRootLike, isChromeBubble, isWideWrapper, width: rect.width, height: rect.height, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight };
      })
      .filter((item) => item.visible && !item.isRootLike && !item.isChromeBubble && !item.isWideWrapper && item.overflow && item.scrollWidth > item.clientWidth + 1);
  });
  if (clipped.length) results.errors.push(`Critical text clipped/hidden on ${label}: ${JSON.stringify(clipped.slice(0, 10))}`);
  const splitPrompt = await page.evaluate(() => /PROM\s+PT/.test(document.body.innerText));
  if (splitPrompt) results.errors.push(`English Speed PROMPT label splits awkwardly on ${label}`);
}

async function checkAmbientWhale(page, label, viewport, results) {
  const ambient = await page.evaluate(() => {
    const roots = Array.from(document.querySelectorAll('[data-testid="ambient-poo-whale"]'));
    const swimmers = Array.from(document.querySelectorAll('.ambient-poo-whale__swimmer'));
    const root = roots[0];
    const swimmer = swimmers[0];
    if (!root || !swimmer) return { exists: false, count: roots.length };
    const rootStyle = window.getComputedStyle(root);
    const style = window.getComputedStyle(swimmer);
    const rect = swimmer.getBoundingClientRect();
    const obstructions = Array.from(document.querySelectorAll('h1, h2, button, a, [role="button"], [data-testid="home-dashboard-recommended-message"], [data-testid="english-speed-stat-grid"], [data-testid="speed-current-prompt"], [data-testid="shadowing-current-sentence"]'))
      .filter((node) => !root.contains(node))
      .filter((node) => {
        const r = node.getBoundingClientRect();
        const nodeStyle = window.getComputedStyle(node);
        return r.width > 0 && r.height > 0 && nodeStyle.display !== 'none' && nodeStyle.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 && rect.left < r.right && rect.right > r.left && rect.top < r.bottom && rect.bottom > r.top;
      })
      .map((node) => ({ tag: node.tagName, text: (node.textContent || '').trim().slice(0, 60) }));
    return {
      exists: true,
      count: roots.length,
      swimmerCount: swimmers.length,
      ariaHidden: root.getAttribute('aria-hidden'),
      pointerEvents: rootStyle.pointerEvents,
      zIndex: rootStyle.zIndex,
      preset: root.getAttribute('data-ambient-whale-preset'),
      opacity: Number.parseFloat(style.opacity || '1'),
      width: rect.width,
      display: style.display,
      obstructions,
    };
  });
  if (!ambient.exists) return;
  if (ambient.count !== 1 || ambient.swimmerCount !== 1) results.errors.push(`Ambient whale duplicated on ${label}: ${JSON.stringify(ambient)}`);
  if (ambient.ariaHidden !== 'true') results.errors.push(`Ambient whale is not aria-hidden on ${label}: ${JSON.stringify(ambient)}`);
  if (ambient.pointerEvents !== 'none') results.errors.push(`Ambient whale pointer-events is not none on ${label}: ${JSON.stringify(ambient)}`);
  if (ambient.display !== 'none') {
    const maxWidth = viewport.width <= 480 ? 64 : 140;
    const maxOpacity = viewport.width <= 480 ? 0.06 : 0.06;
    if (ambient.opacity > maxOpacity) results.errors.push(`Ambient whale too opaque on ${label}: ${JSON.stringify(ambient)}`);
    if (ambient.width > maxWidth) results.errors.push(`Ambient whale too wide on ${label}: ${JSON.stringify(ambient)}`);
    if (ambient.obstructions.length) results.errors.push(`Ambient whale overlaps heading/button/text on ${label}: ${JSON.stringify(ambient)}`);
  }
}

async function checkLessonBlankOcean(page, label, results) {
  if (!label.includes('lessons-unit-1-greetings-introduction')) return;
  const blank = await page.evaluate(() => {
    const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
    const navTop = nav?.getBoundingClientRect().top ?? window.innerHeight;
    const contentNodes = Array.from(document.querySelectorAll('[data-testid="lesson-mobile-root"] button, [data-testid="lesson-mobile-root"] a, [data-testid="lesson-mobile-root"] summary, [data-testid="lesson-mobile-root"] h1, [data-testid="lesson-mobile-root"] h2, [data-testid="lesson-mobile-root"] [data-testid]'));
    const bottoms = contentNodes.map((node) => node.getBoundingClientRect().bottom + window.scrollY).filter((bottom) => Number.isFinite(bottom));
    const lastContentBottom = bottoms.length ? Math.max(...bottoms) : 0;
    const emptyAfterLast = document.documentElement.scrollHeight - lastContentBottom;
    return { emptyAfterLast, scrollHeight: document.documentElement.scrollHeight, lastContentBottom, navTop };
  });
  if (blank.emptyAfterLast > 600) results.errors.push(`Mobile lesson has excessive blank ocean after last content on ${label}: ${JSON.stringify(blank)}`);
}

async function screenshot(page, name, options = {}) {
  await page.screenshot({ path: path.join(screenshotDir, name), fullPage: Boolean(options.fullPage), animations: 'disabled', timeout: 120000 });
}

async function scrollTargetIntoView(page, selector, fallbackRatio = 0.5) {
  const found = await page.locator(selector).count().catch(() => 0);
  if (found) {
    await page.locator(selector).first().scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => undefined);
  } else {
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate(({ height, ratio }) => window.scrollTo(0, Math.max(0, Math.floor(height * ratio) - Math.floor(window.innerHeight / 2))), { height: scrollHeight, ratio: fallbackRatio });
  }
  await page.waitForTimeout(180);
}

async function captureRouteScreenshots(page, route, viewport) {
  const viewportName = viewport.width <= 480 ? 'mobile' : 'desktop';
  const slug = routeSlug(route);
  if (viewport.width > 480) {
    if (route === '/home') await screenshot(page, 'home-desktop-top.png');
    if (route === '/english-speed') {
      await screenshot(page, 'english-speed-desktop-top.png');
      await scrollTargetIntoView(page, '[data-testid="english-speed-stat-grid"]', 0.1);
      await screenshot(page, 'english-speed-desktop-metric-cards.png');
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await screenshot(page, `${slug}-${viewportName}-top.png`);
    return;
  }

  await screenshot(page, `${slug}-mobile-top.png`);
  if (route === '/home') {
    await scrollTargetIntoView(page, '[data-testid="home-local-learning-summary"]', 0.35);
    await screenshot(page, 'home-mobile-review-section.png');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(180);
    await screenshot(page, 'home-mobile-bottom-safe.png');
  } else if (route === '/english-speed') {
    await scrollTargetIntoView(page, '[data-testid="speed-current-prompt"]', 0.42);
    await screenshot(page, 'english-speed-mobile-practice-controls.png');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(180);
    await screenshot(page, 'english-speed-mobile-bottom-safe.png');
  } else if (route === '/learning-path') {
    await screenshot(page, 'learning-path-mobile-top.png');
  } else if (route.includes('/lessons/')) {
    await scrollTargetIntoView(page, '[data-testid="lesson-flashcard-preview-mobile"], [data-testid="lesson-active-step"]', 0.45);
    await screenshot(page, 'lesson-mobile-flashcard-controls.png');
  } else if (route === '/shadowing') {
    await scrollTargetIntoView(page, '[data-testid="shadowing-current-sentence"], [data-testid="shadowing-recording-card"]', 0.45);
    await screenshot(page, 'shadowing-mobile-practice-controls.png');
  } else if (route === '/words') {
    await screenshot(page, 'words-mobile-top.png');
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, `${slug}-${viewportName}-full.png`, { fullPage: true });
}

async function verifyHomeProgress(page, results) {
  const cases = [
    { name: 'empty', completedToday: [], expectedBubbles: '0/5' },
    { name: 'vocabulary review', completedToday: ['vocabulary-review'], expectedBubbles: '1/5' },
    { name: 'shadowing practice', completedToday: ['shadowing-practice'], expectedBubbles: '1/5' },
    { name: 'completed lesson', completedToday: ['lesson-completed'], expectedBubbles: '1/5' },
    { name: 'combination', completedToday: ['vocabulary-review', 'shadowing-practice', 'lesson-completed', 'english-speed', 'lesson-guided'], expectedBubbles: '5/5' },
  ].map((item) => ({ ...item, expected: expectedDailyPercent(item.completedToday) }));

  for (const item of cases) {
    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await applyScenario(page, 'empty');
    await seedDailyRewards(page, item.completedToday);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="home-local-learning-summary"]').waitFor({ state: 'visible', timeout: 20000 });
    await page.waitForFunction((expectedBubbles) => document.body.innerText.includes(expectedBubbles), item.expectedBubbles, { timeout: 5000 }).catch(() => undefined);
    const text = await bodyText(page);
    if (!text.includes(item.expectedBubbles)) results.errors.push(`Home daily bubbles ${item.name} expected ${item.expectedBubbles}, got body: ${text.slice(0, 600)}`);
    if (text.includes('Chưa có dữ liệu luyện phát âm hôm nay') || text.includes('Chưa có dữ liệu')) results.errors.push(`Home has confusing empty data copy for ${item.name}`);
    results.homeProgressCases.push({ name: item.name, expected: item.expected, expectedBubbles: item.expectedBubbles });
  }
}

async function verifyLessonLabels(page, results) {
  await page.goto(`${baseUrl}/lessons/${lessonId}`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="lesson-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.evaluate(() => document.querySelectorAll('details').forEach((item) => item.setAttribute('open', '')));
  await page.locator('[data-testid="lesson-guided-mode-content"][data-lesson-mode="flashcard"]').waitFor({ state: 'visible', timeout: 20000 });
  const flashcardText = await page.locator('[data-testid="lesson-flashcard-preview"]').innerText({ timeout: 5000 });
  if (!/(hello|hi|good morning)/i.test(flashcardText)) results.errors.push(`Unit 1 flashcard preview missing visible greeting text: ${flashcardText.slice(0, 500)}`);
  const isDesktopViewport = page.viewportSize()?.width >= 768;
  if (isDesktopViewport) {
    const desktopGridVisible = await page.locator('[data-testid="lesson-flashcard-preview-desktop"]').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > 0.5;
    });
    if (!desktopGridVisible) results.errors.push('Unit 1 desktop flashcard preview grid is not visibly rendered');
  }
  const activeModeBlank = await page.locator('[data-testid="lesson-guided-mode-content"]').evaluate((el) => el.getBoundingClientRect().height < 80 || (el.textContent || '').trim().length < 20);
  if (activeModeBlank) results.errors.push('Desktop lesson active mode is blank or collapsed');
  const text = await bodyText(page);
  if (text.includes('Chưa có dữ liệu')) results.errors.push('Unit 1 lesson still shows Chưa có dữ liệu for real content');
  if (text.includes('Chưa học')) results.errors.push('Unit 1 lesson still shows old Chưa học label');
  ['Flashcard', 'Quiz', 'Luyện nghe', 'Phản xạ', 'Gõ câu', 'Ghép cặp', 'Tốc độ / phát âm'].forEach((label) => {
    if (!text.includes(label)) results.errors.push(`Unit 1 missing mode label: ${label}`);
  });
}

async function verifyWordsPage(page, results) {
  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="vocab-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(5000);
  const text = await bodyText(page);
  if (text.includes('Đang mở vùng học')) results.errors.push('/words still shows route loading fallback after 5 seconds');
  if (!text.includes('Từ vựng cá nhân')) results.errors.push('/words missing vocabulary page heading');
  const hasSearch = await page.locator('input[placeholder*="Tìm"], input[aria-label*="Tìm"]').count();
  const hasLessonFilter = await page.locator('[data-testid="vocab-lesson-filter"]').count();
  const hasCards = await page.locator('[data-testid="vocab-mobile-card"], table tbody tr').count();
  if (!hasSearch) results.errors.push('/words missing search input');
  if (!hasLessonFilter) results.errors.push('/words missing CEFR/group filter');
  if (!hasCards) results.errors.push('/words missing vocabulary card/table UI');
}

async function verifyEnglishSpeedStats(page, results) {
  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="english-speed-stat-grid"]').waitFor({ state: 'visible', timeout: 20000 });
  const statText = await page.locator('[data-testid="english-speed-stat-grid"]').innerText();
  ['PROMPT', 'ĐÃ LUYỆN', 'BEST', 'MIC'].forEach((expected) => {
    if (!statText.includes(expected)) results.errors.push(`English Speed stat grid missing ${expected}: ${statText}`);
  });
  if (/BEST\s+Sau/i.test(statText) || statText.includes('BEST\nSau')) results.errors.push(`English Speed still shows invalid BEST Sau copy: ${statText}`);
  const clipped = await page.locator('[data-testid^="english-speed-stat-"]').evaluateAll((nodes) => nodes.some((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1));
  if (clipped) results.errors.push('English Speed stat card content is clipped');
}

async function verifyShadowingFallback(page, results) {
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="shadowing-mobile-root"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="shadowing-current-sentence"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.evaluate(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const scroller = document.scrollingElement || document.documentElement;
    scroller.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.mouse.wheel(0, -10000);
  await page.waitForFunction(() => window.scrollY <= 2, { timeout: 3000 }).catch(() => undefined);
  await page.waitForTimeout(350);
  const layout = await page.evaluate(() => {
    const hero = document.querySelector('[data-testid="shadowing-hero"]');
    const root = document.querySelector('[data-testid="shadowing-mobile-root"]');
    const heroRect = hero?.getBoundingClientRect();
    const rootRect = root?.getBoundingClientRect();
    const blockers = Array.from(document.querySelectorAll('header, [role="banner"]')).map((node) => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return { top: rect.top, bottom: rect.bottom, height: rect.height, position: style.position, zIndex: style.zIndex };
    }).filter((item) => item.height > 0 && item.bottom > 0);
    return { scrollY: window.scrollY, heroTop: heroRect?.top ?? 0, rootTop: rootRect?.top ?? 0, blockers };
  });
  const overlappingHeader = layout.scrollY <= 2 ? layout.blockers.find((item) => layout.heroTop < item.bottom - 2) : undefined;
  if (overlappingHeader) results.errors.push(`Shadowing hero overlaps header/topbar: ${JSON.stringify({ layout, overlappingHeader })}`);
  const text = await bodyText(page);
  if (text.includes('Có video tham chiếu')) results.errors.push('Shadowing still uses old Có video tham chiếu chip copy');
  if (text.includes('Video tham chiếu đang thử phát')) results.errors.push('Shadowing still uses old trying-to-play copy');
  if (!text.includes('Có link tham chiếu') && !text.includes('Video tham khảo') && !text.includes('Luyện bằng transcript') && !text.includes('transcript-only')) results.errors.push('Shadowing missing expected video fallback/link/transcript chip');
  const blackPlayer = await page.evaluate(() => {
    const iframe = document.querySelector('iframe');
    if (!iframe) return false;
    const rect = iframe.getBoundingClientRect();
    const style = window.getComputedStyle(iframe);
    return rect.width > 0 && rect.height > 0 && (style.backgroundColor === 'rgb(16, 42, 67)' || style.backgroundColor === 'black');
  });
  if (blackPlayer) results.errors.push('Shadowing shows black iframe player as primary UI');
  ['Chọn bài', 'Nghe/xem tham khảo', 'Nghe câu', 'Ghi âm'].forEach((expected) => {
    if (!text.includes(expected)) results.errors.push(`Shadowing missing workflow step/copy: ${expected}`);
  });
  const recordButtonCopy = await page.locator('[data-testid="shadowing-record-button"]').innerText({ timeout: 5000 });
  if (!/Bắt đầu ghi âm|Dừng ghi âm/i.test(recordButtonCopy)) results.errors.push(`Shadowing record control missing expected start/stop copy: ${recordButtonCopy}`);
}

async function runDeterministicStateScreenshots(page, results) {
  const scenarios = [
    { name: 'home-empty-local-state', route: '/home', screenshot: 'home-empty-mobile.png', seed: 'empty', expectedVisibleState: ['5/5', '0 ngày', '0/13'] },
    { name: 'home-active-low-energy-local-state', route: '/home', screenshot: 'home-active-low-energy-mobile.png', seed: 'active-shadowing', expectedVisibleState: ['1/5', '1 ngày'] },
    { name: 'learning-path-progress-two-units', route: '/learning-path', screenshot: 'learning-path-progress-mobile.png', seed: 'two-completed-units', expectedVisibleState: ['2/13'] },
  ];
  for (const scenario of scenarios) {
    await page.goto(`${baseUrl}${scenario.route}`, { waitUntil: 'domcontentloaded' });
    await applyScenario(page, scenario.seed);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => undefined);
    await page.waitForTimeout(900);
    const text = await bodyText(page);
    const missingExpected = scenario.expectedVisibleState.filter((expected) => !text.includes(expected));
    if (missingExpected.length) results.errors.push(`Deterministic scenario ${scenario.name} missing visible state ${missingExpected.join(', ')}; body: ${text.slice(0, 700)}`);
    await screenshot(page, scenario.screenshot);
    results.deterministicScenarios.push({ name: scenario.name, route: scenario.route, screenshot: path.join(screenshotDir, scenario.screenshot), expectedVisibleState: scenario.expectedVisibleState });
  }
}

async function verifyRoutesAtViewport(browser, viewport, results) {
  const context = await browser.newContext({ viewport, permissions: [] });
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') results.consoleErrors.push(`[${viewport.width}x${viewport.height}] ${message.text()}`);
  });
  page.on('pageerror', (error) => results.consoleErrors.push(`[${viewport.width}x${viewport.height}] ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    const failureText = request.failure()?.errorText || 'unknown';
    if (!isAllowedFailedRequest(url, failureText)) results.failedRequests.push(`${request.method()} ${url} :: ${failureText}`);
  });

  for (const route of routes) {
    const label = `${viewport.width}x${viewport.height}-${routeSlug(route)}`;
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
    await applyScenario(page, 'empty');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => undefined);
    await page.waitForTimeout(route === '/words' ? 2500 : 900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await checkNoHorizontalOverflow(page, label, results);
    if (viewport.width <= 480) {
      await checkMobilePrimaryCtasClearOfNav(page, label, results);
      await checkLessonBlankOcean(page, label, results);
    }
    await checkAmbientWhale(page, label, viewport, results);
    await checkCriticalTextNotClipped(page, label, results);
    await captureRouteScreenshots(page, route, viewport);
  }

  await verifyHomeProgress(page, results);
  await verifyLessonLabels(page, results);
  await verifyShadowingFallback(page, results);
  await verifyWordsPage(page, results);
  await verifyEnglishSpeedStats(page, results);
  if (viewport.width <= 480) await runDeterministicStateScreenshots(page, results);
  await context.close();
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = {
    ok: false,
    baseUrl,
    routesTested: routes,
    viewports: ['desktop 1366x768', 'mobile 390x844'],
    screenshotsDir: screenshotDir,
    homeProgressCases: [],
    deterministicScenarios: [],
    consoleErrors: [],
    failedRequests: [],
    errors: [],
  };

  const browser = await chromium.launch({ headless: true });
  try {
    await verifyRoutesAtViewport(browser, desktopViewport, results);
    await verifyRoutesAtViewport(browser, mobileViewport, results);

    if (results.consoleErrors.length) results.errors.push(`Console errors: ${results.consoleErrors.slice(0, 8).join(' | ')}`);
    if (results.failedRequests.length) results.errors.push(`Failed requests: ${results.failedRequests.slice(0, 8).join(' | ')}`);
    results.ok = results.errors.length === 0;

    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');

    if (!results.ok) throw new Error(results.errors.join('\n'));
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
