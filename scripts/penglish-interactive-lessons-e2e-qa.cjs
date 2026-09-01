const { chromium } = require('playwright');
const validationReport = require('../reports/penglish-runtime-lesson-validation.json');

const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const VIEWPORTS = [
  { name: 'desktop', width: 1365, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
].filter((viewport) => !process.env.PENGLISH_QA_VIEWPORT || viewport.name === process.env.PENGLISH_QA_VIEWPORT);

function collectLessonIds(value, output = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectLessonIds(item, output));
    return output;
  }
  if (!value || typeof value !== 'object') return output;
  if (typeof value.lessonId === 'string') output.add(value.lessonId);
  Object.values(value).forEach((item) => collectLessonIds(item, output));
  return output;
}

async function visible(locator) {
  return locator.isVisible().catch(() => false);
}

async function answerCurrentStep(page) {
  const start = page.locator('[data-testid="interactive-lesson-start-button"]');
  if (await visible(start)) {
    await start.click();
    return 'intro';
  }

  const remember = page.locator('[data-testid="interactive-lesson-remember-button"]');
  if (await visible(remember)) {
    await remember.click();
    return 'flashcard';
  }

  const option = page.locator('[data-testid="interactive-lesson-answer-option"]').first();
  if (await visible(option)) {
    await option.click();
    return 'choice';
  }

  const fillInput = page.locator('[data-testid="interactive-lesson-fill-input"]');
  if (await visible(fillInput)) {
    await fillInput.fill('test answer');
    await page.locator('[data-testid="interactive-lesson-check-button"]').click();
    return 'fill_blank';
  }

  const speakDone = page.locator('[data-testid="interactive-lesson-speak-done-button"]');
  if (await visible(speakDone)) {
    await speakDone.click();
    return 'speak_repeat';
  }

  const check = page.locator('[data-testid="interactive-lesson-check-button"]');
  if (await visible(check)) {
    const card = page.locator('[data-testid="interactive-lesson-card"]');
    const initialWordButtons = card.locator('[data-testid="interactive-lesson-word-token"]');
    const tokenIds = await initialWordButtons.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-token-id')));
    if (tokenIds.some((id) => !id) || new Set(tokenIds).size !== tokenIds.length) {
      throw new Error('Sentence-order tokens must expose unique non-empty data-token-id values.');
    }
    if (tokenIds.length) {
      const firstTokenId = tokenIds[0];
      await card.locator(`[data-testid="interactive-lesson-word-token"][data-token-id="${firstTokenId}"]`).click();
      await card.locator(`[data-testid="interactive-lesson-picked-word-token"][data-token-id="${firstTokenId}"]`).click();
      if (!await visible(card.locator(`[data-testid="interactive-lesson-word-token"][data-token-id="${firstTokenId}"]`))) {
        throw new Error('A removed sentence-order token did not return to the available word list.');
      }
    }
    let guard = 0;
    while (guard < 40) {
      const wordButtons = card.locator('[data-testid="interactive-lesson-word-token"]');
      if (await wordButtons.count() === 0) break;
      await wordButtons.first().click();
      guard += 1;
    }
    await check.click();
    return 'sentence_order';
  }

  return null;
}

(async () => {
  const allLessonIds = [...collectLessonIds(validationReport)];
  const requestedLimit = Number(process.env.PENGLISH_QA_LIMIT || 0);
  const lessonIds = requestedLimit > 0 ? allLessonIds.slice(0, requestedLimit) : allLessonIds;
  if (!requestedLimit && lessonIds.length !== validationReport.lessonCount) {
    throw new Error(`Expected ${validationReport.lessonCount} lesson IDs but found ${lessonIds.length}.`);
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    for (const [index, lessonId] of lessonIds.entries()) {
      const responseErrors = [];
      const consoleErrors = [];
      const pageErrors = [];
      const seenControllers = new Set();
      let maxHorizontalOverflow = 0;
      let hasEmoji = false;
      let brokenImages = [];
      let stuckReason = '';

      const onResponse = (response) => {
        if (response.status() >= 400) responseErrors.push(`${response.status()} ${new URL(response.url()).pathname}`);
      };
      const onConsole = (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      };
      const onPageError = (error) => pageErrors.push(error.message);
      page.on('response', onResponse);
      page.on('console', onConsole);
      page.on('pageerror', onPageError);

      await page.goto(`${BASE_URL}/learn/${encodeURIComponent(lessonId)}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.locator('[data-testid="interactive-lesson-card"]').waitFor({ state: 'visible', timeout: 7000 }).catch(() => {});

      let completed = false;
      let answeredSteps = 0;
      for (let guard = 0; guard < 24; guard += 1) {
        const bodyText = await page.locator('body').innerText();
        if (bodyText.includes('Hoàn thành bài học!')) {
          completed = true;
          break;
        }

        const measurements = await page.evaluate(() => ({
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
          brokenImages: [...document.images]
            .filter((image) => image.complete && image.naturalWidth === 0)
            .map((image) => image.getAttribute('src') || ''),
        }));
        maxHorizontalOverflow = Math.max(maxHorizontalOverflow, measurements.overflow);
        brokenImages = [...new Set([...brokenImages, ...measurements.brokenImages])];
        hasEmoji ||= EMOJI_PATTERN.test(bodyText);

        const feedback = page.locator('[data-testid="interactive-lesson-feedback"]');
        if (await visible(feedback)) {
          const continueClicked = await page.evaluate(() => {
            const button = document.querySelector('[data-testid="interactive-lesson-continue-button"]');
            if (!(button instanceof HTMLButtonElement) || button.offsetParent === null) return false;
            button.click();
            return true;
          });
          if (continueClicked) {
            await feedback.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
          } else {
            await page.waitForTimeout(15);
          }
          continue;
        }

        const controller = await answerCurrentStep(page);
        if (!controller) {
          stuckReason = 'No supported control was visible for the current step.';
          break;
        }
        seenControllers.add(controller);
        answeredSteps += 1;
        await page.locator('[data-testid="interactive-lesson-feedback"]').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      }

      const finalText = await page.locator('body').innerText();
      hasEmoji ||= EMOJI_PATTERN.test(finalText);
      const finalOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
      maxHorizontalOverflow = Math.max(maxHorizontalOverflow, finalOverflow);

      const result = {
        lessonId,
        viewport: viewport.name,
        completed,
        answeredSteps,
        seenControllers: [...seenControllers],
        stuckReason,
        hasEmoji,
        maxHorizontalOverflow,
        brokenImages,
        responseErrors,
        consoleErrors,
        pageErrors,
      };
      results.push(result);

      page.off('response', onResponse);
      page.off('console', onConsole);
      page.off('pageerror', onPageError);

      if ((index + 1) % 10 === 0 || index === lessonIds.length - 1) {
        console.log(`[${viewport.name}] ${index + 1}/${lessonIds.length}`);
      }
    }

    await context.close();
  }

  const failures = results.filter((result) => (
    !result.completed
    || result.answeredSteps !== 9
    || result.stuckReason
    || result.hasEmoji
    || result.maxHorizontalOverflow > 2
    || result.brokenImages.length
    || result.responseErrors.length
    || result.consoleErrors.length
    || result.pageErrors.length
  ));
  const controllerCoverage = [...new Set(results.flatMap((result) => result.seenControllers))].sort();
  const summary = {
    baseUrl: BASE_URL,
    lessonCount: lessonIds.length,
    viewportCount: VIEWPORTS.length,
    completedLessonRuns: results.filter((result) => result.completed).length,
    totalLessonRuns: results.length,
    totalAnsweredSteps: results.reduce((sum, result) => sum + result.answeredSteps, 0),
    controllerCoverage,
    failureCount: failures.length,
    failures,
  };
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
