const { chromium } = require('playwright');
const fs = require('fs');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const generatedAt = new Date().toISOString();

const scenarios = [
  {
    name: 'learning-path-desktop',
    path: '/learning-path',
    viewport: { width: 1440, height: 950 },
    screenshot: 'reports/screenshots/learning-path-polish-desktop.png',
    waitFor: '[data-testid="learning-path-current-card"]',
    requiredSelectors: [
      '[data-testid="roadmap-mobile-root"]',
      '[data-testid="learning-path-current-card"]',
      '[data-testid="learning-path-continue-cta"]',
      '[data-testid="learning-path-stage-dots"]',
    ],
  },
  {
    name: 'learning-path-mobile',
    path: '/learning-path',
    viewport: { width: 390, height: 844 },
    screenshot: 'reports/screenshots/learning-path-polish-mobile.png',
    waitFor: '[data-testid="learning-path-current-card"]',
    requiredSelectors: [
      '[data-testid="roadmap-mobile-root"]',
      '[data-testid="learning-path-current-card"]',
      '[data-testid="learning-path-continue-cta"]',
      '[data-testid="learning-path-stage-dots"]',
    ],
  },
  {
    name: 'lesson-unit1-desktop',
    path: '/lessons/unit-1-greetings-introduction',
    viewport: { width: 1440, height: 950 },
    screenshot: 'reports/screenshots/lesson-unit1-polish-desktop.png',
    waitFor: '[data-testid="lesson-step-card"]',
    requiredSelectors: [
      '[data-testid="lesson-mobile-root"]',
      '[data-testid="lesson-step-nav"]',
      '[data-testid="lesson-active-step"]',
      '[data-testid="lesson-step-card"]',
    ],
    lessonChecks: true,
  },
  {
    name: 'lesson-unit1-mobile',
    path: '/lessons/unit-1-greetings-introduction',
    viewport: { width: 390, height: 844 },
    screenshot: 'reports/screenshots/lesson-unit1-polish-mobile.png',
    waitFor: '[data-testid="lesson-step-card"]',
    requiredSelectors: [
      '[data-testid="lesson-mobile-root"]',
      '[data-testid="lesson-step-nav"]',
      '[data-testid="lesson-active-step"]',
      '[data-testid="lesson-step-card"]',
    ],
    lessonChecks: true,
  },
];

async function runScenario(browser, scenario) {
  const page = await browser.newPage({ viewport: scenario.viewport });
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const url = `${baseUrl}${scenario.path}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector(scenario.waitFor, { timeout: 15000 });
  await page.waitForTimeout(600);

  const missingSelectors = [];
  for (const selector of scenario.requiredSelectors) {
    const count = await page.locator(selector).count();
    if (count === 0) missingSelectors.push(selector);
  }

  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  let lessonState = null;
  if (scenario.lessonChecks) {
    lessonState = await page.evaluate(() => {
      const stepCards = Array.from(document.querySelectorAll('[data-testid="lesson-step-card"]'));
      const visibleStepCards = stepCards.filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      });
      const flashcardPreviewCount = document.querySelectorAll('[data-testid="lesson-flashcard-preview"], [data-testid="lesson-guided-mode-content"][data-lesson-mode="flashcard"]').length;
      const guidedModeContentCount = document.querySelectorAll('[data-testid="lesson-guided-mode-content"]').length;
      return {
        visibleStepCardCount: visibleStepCards.length,
        hasStepProgressText: document.body.textContent.includes('Bước 1/6'),
        hasPooGuide: document.body.textContent.includes('Poo nói') || document.body.textContent.includes('Nghe trước nhé'),
        flashcardPreviewCount,
        guidedModeContentCount,
      };
    });
  }

  fs.mkdirSync('reports/screenshots', { recursive: true });
  await page.screenshot({ path: scenario.screenshot, fullPage: true });
  await page.close();

  const failures = [];
  if (missingSelectors.length) failures.push(`Missing selectors: ${missingSelectors.join(', ')}`);
  if (overflow.hasHorizontalOverflow) failures.push(`Horizontal overflow: body ${overflow.bodyScrollWidth}px > client ${overflow.clientWidth}px`);
  if (pageErrors.length) failures.push(`Page errors: ${pageErrors.join(' | ')}`);
  const errorMessages = consoleMessages.filter((message) => message.type === 'error');
  if (errorMessages.length) failures.push(`Console errors: ${errorMessages.map((message) => message.text).join(' | ')}`);
  if (lessonState) {
    if (lessonState.visibleStepCardCount !== 1) failures.push(`Expected exactly 1 visible lesson step card, found ${lessonState.visibleStepCardCount}`);
    if (!lessonState.hasStepProgressText) failures.push('Missing lesson progress text Bước 1/6');
    if (!lessonState.hasPooGuide) failures.push('Missing Poo guide text');
    if (lessonState.flashcardPreviewCount !== 0) failures.push(`Flashcard/practice block visible on initial listen step: ${lessonState.flashcardPreviewCount}`);
    if (lessonState.guidedModeContentCount !== 0) failures.push(`Guided practice block visible on initial listen step: ${lessonState.guidedModeContentCount}`);
  }

  return {
    name: scenario.name,
    path: scenario.path,
    viewport: scenario.viewport,
    screenshot: scenario.screenshot,
    missingSelectors,
    overflow,
    consoleMessages,
    pageErrors,
    lessonState,
    ok: failures.length === 0,
    failures,
  };
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const scenario of scenarios) {
      results.push(await runScenario(browser, scenario));
    }
  } finally {
    await browser.close();
  }

  const report = {
    ok: results.every((result) => result.ok),
    generatedAt,
    baseUrl,
    results,
  };

  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/learning-path-lesson-polish-qa-results.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
