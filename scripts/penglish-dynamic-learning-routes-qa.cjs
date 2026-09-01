const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const VIEWPORTS = [
  { name: 'desktop', width: 1365, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
].filter((viewport) => !process.env.PENGLISH_QA_VIEWPORT || viewport.name === process.env.PENGLISH_QA_VIEWPORT);

function loadManifest() {
  const result = spawnSync(process.execPath, [require.resolve('tsx/cli'), 'scripts/penglish-dynamic-learning-manifest.ts'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || `Manifest command exited with ${result.status}.`);
  return JSON.parse(result.stdout);
}

async function visible(locator) {
  return locator.isVisible().catch(() => false);
}

function normalizeAnswerToken(value) {
  return value.toLowerCase().replace(/[.,!?;:'"“”‘’]/g, '').trim();
}

async function inspectPage(page) {
  const bodyText = await page.locator('body').innerText();
  const measurements = await page.evaluate(() => ({
    horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute('src') || ''),
  }));
  return {
    hasEmoji: EMOJI_PATTERN.test(bodyText),
    horizontalOverflow: measurements.horizontalOverflow,
    brokenImages: measurements.brokenImages,
  };
}

function attachDiagnostics(page) {
  const diagnostics = { responseErrors: [], consoleErrors: [], pageErrors: [] };
  const handlers = {
    response: (response) => {
      if (response.status() >= 400) diagnostics.responseErrors.push(`${response.status()} ${new URL(response.url()).pathname}`);
    },
    console: (message) => {
      if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
    },
    pageerror: (error) => diagnostics.pageErrors.push(error.message),
  };
  page.on('response', handlers.response);
  page.on('console', handlers.console);
  page.on('pageerror', handlers.pageerror);
  return {
    diagnostics,
    detach() {
      page.off('response', handlers.response);
      page.off('console', handlers.console);
      page.off('pageerror', handlers.pageerror);
    },
  };
}

async function answerFoundationChallenge(page, challenge) {
  const challengeRoot = page.locator(`[data-testid="foundation48-challenge-${challenge.type}"][data-challenge-id="${challenge.id}"]`);
  await challengeRoot.waitFor({ state: 'visible' });

  if (challenge.type === 'multiple-choice' || challenge.type === 'listen-and-choose') {
    const option = challengeRoot.locator('[data-testid^="foundation48-answer-option-"]').filter({ hasText: challenge.answer }).first();
    if (!await visible(option)) throw new Error(`Correct option is not visible for ${challenge.id}: ${challenge.answer}`);
    await option.click();
  } else if (challenge.type === 'fill-blank') {
    await challengeRoot.locator('[data-testid="foundation48-fill-answer"]').fill(challenge.answer);
    await challengeRoot.locator('button').filter({ hasText: /Poo xem giúp/i }).click();
  } else if (challenge.type === 'speaking-repeat') {
    await challengeRoot.locator('[data-testid="foundation48-speaking-self-practiced"]').click();
  } else if (challenge.type === 'sentence-order') {
    const available = challengeRoot.locator('[data-testid="foundation48-token"]');
    const tokenIds = await available.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-token-id')));
    if (tokenIds.some((id) => !id) || new Set(tokenIds).size !== tokenIds.length) {
      throw new Error(`Sentence-order tokens need unique non-empty IDs for ${challenge.id}.`);
    }

    if (tokenIds.length) {
      const firstId = tokenIds[0];
      await challengeRoot.locator(`[data-testid="foundation48-token"][data-token-id="${firstId}"]`).click();
      await challengeRoot.locator(`[data-testid="foundation48-picked-token"][data-token-id="${firstId}"]`).click();
      if (!await visible(challengeRoot.locator(`[data-testid="foundation48-token"][data-token-id="${firstId}"]`))) {
        throw new Error(`Removed token did not return for ${challenge.id}.`);
      }
    }

    for (const word of challenge.answer.split(/\s+/).filter(Boolean)) {
      const wanted = normalizeAnswerToken(word);
      const tokenId = await challengeRoot.locator('[data-testid="foundation48-token"]').evaluateAll((buttons, normalizedWord) => {
        const normalize = (value) => value.toLowerCase().replace(/[.,!?;:'"“”‘’]/g, '').trim();
        return buttons.find((button) => normalize(button.textContent || '') === normalizedWord)?.getAttribute('data-token-id') || '';
      }, wanted);
      if (!tokenId) throw new Error(`Token "${word}" is missing for ${challenge.id}.`);
      await challengeRoot.locator(`[data-testid="foundation48-token"][data-token-id="${tokenId}"]`).click();
    }
    await challengeRoot.locator('[data-testid="foundation48-sentence-check"]').click();
  }

  const feedback = challengeRoot.locator('[data-testid="foundation48-challenge-feedback"]');
  await feedback.waitFor({ state: 'visible' });
  const feedbackStyle = await feedback.evaluate((element) => getComputedStyle(element).backgroundColor);
  const nextButton = page.locator('[data-testid="foundation48-step-actions"] button').last();
  await nextButton.waitFor({ state: 'visible' });
  if (await nextButton.isDisabled()) {
    throw new Error(`Correct answer did not unlock ${challenge.id}; feedback background was ${feedbackStyle}.`);
  }
}

async function runFoundationDay(page, day, viewportName) {
  const attached = attachDiagnostics(page);
  let maximumOverflow = 0;
  let hasEmoji = false;
  let brokenImages = [];
  let completed = false;
  let answeredChallenges = 0;
  let stuckReason = '';

  try {
    await page.goto(`${BASE_URL}/luyen-tieng-anh/48-ngay-lay-goc/ngay/${day.dayNumber}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('[data-testid="foundation48-day-page"]').waitFor({ state: 'visible', timeout: 10000 });

    for (let guard = 0; guard < day.challenges.length + 12; guard += 1) {
      const inspection = await inspectPage(page);
      maximumOverflow = Math.max(maximumOverflow, inspection.horizontalOverflow);
      hasEmoji ||= inspection.hasEmoji;
      brokenImages = [...new Set([...brokenImages, ...inspection.brokenImages])];

      if (await visible(page.locator('[data-testid="foundation48-complete-reward"]'))) {
        completed = true;
        break;
      }

      const activeChallenge = page.locator('[data-testid^="foundation48-challenge-"]');
      if (await visible(activeChallenge)) {
        const challenge = day.challenges[answeredChallenges];
        if (!challenge) {
          stuckReason = `UI exposed more challenges than the ${day.challenges.length} in the source manifest.`;
          break;
        }
        await answerFoundationChallenge(page, challenge);
        answeredChallenges += 1;
      }

      const nextButton = page.locator('[data-testid="foundation48-step-actions"] button').last();
      await nextButton.waitFor({ state: 'visible' });
      await nextButton.click();
      await page.waitForTimeout(20);
    }
  } catch (error) {
    stuckReason = error.message;
  }

  attached.detach();
  return {
    kind: 'foundation48',
    id: String(day.dayNumber),
    viewport: viewportName,
    completed,
    expectedChallenges: day.challenges.length,
    answeredChallenges,
    rootVisible: await visible(page.locator('[data-testid="foundation48-day-page"]')),
    notFound: await visible(page.locator('[data-testid="penglish-404-page"]')),
    loadingStuck: await visible(page.locator('[data-testid="route-loading-fallback"]')),
    hasEmoji,
    horizontalOverflow: maximumOverflow,
    brokenImages,
    stuckReason,
    ...attached.diagnostics,
  };
}

async function runShadowingLesson(page, lesson, viewportName) {
  const attached = attachDiagnostics(page);
  let stuckReason = '';
  let lineNavigationWorked = lesson.sentenceCount <= 1;

  try {
    await page.goto(`${BASE_URL}/shadowing/practice/${encodeURIComponent(lesson.id)}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('[data-testid="shadowing-mobile-root"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('[data-testid="shadowing-current-sentence"]').waitFor({ state: 'visible' });

    if (lesson.sentenceCount > 1) {
      await page.locator('[data-testid="shadowing-transcript-panel"]').evaluate((element) => { element.open = true; });
      const lastSentence = page.locator(`[data-testid="shadowing-transcript-sentence-${lesson.sentenceCount}"]`);
      await lastSentence.click();
      await page.waitForFunction((count) => document.querySelector('[data-testid="shadowing-current-line-count"]')?.textContent?.includes(`${count}/${count}`), lesson.sentenceCount);
      lineNavigationWorked = true;
    }
  } catch (error) {
    stuckReason = error.message;
  }

  const inspection = await inspectPage(page).catch(() => ({ hasEmoji: false, horizontalOverflow: 0, brokenImages: [] }));
  const selectedLesson = page.locator(`[data-testid="shadowing-video-card-${lesson.id}"][aria-pressed="true"]`);
  const invalidLessonMessage = (await page.locator('body').innerText().catch(() => '')).includes(`"${lesson.id}"`);
  attached.detach();
  return {
    kind: 'shadowing',
    id: lesson.id,
    viewport: viewportName,
    rootVisible: await visible(page.locator('[data-testid="shadowing-mobile-root"]')),
    practiceVisible: await visible(page.locator('[data-testid="shadowing-practice-card"]')),
    selectedLessonCount: await selectedLesson.count(),
    expectedSentenceCount: lesson.sentenceCount,
    actualSentenceCount: await page.locator('[data-testid^="shadowing-transcript-sentence-"]').count(),
    lineNavigationWorked,
    invalidLessonMessage,
    notFound: await visible(page.locator('[data-testid="penglish-404-page"]')),
    loadingStuck: await visible(page.locator('[data-testid="route-loading-fallback"]')),
    ...inspection,
    stuckReason,
    ...attached.diagnostics,
  };
}

function isFailure(result) {
  const sharedFailure = !result.rootVisible
    || result.notFound
    || result.loadingStuck
    || result.hasEmoji
    || result.horizontalOverflow > 2
    || result.brokenImages.length
    || result.responseErrors.length
    || result.consoleErrors.length
    || result.pageErrors.length
    || result.stuckReason;
  if (sharedFailure) return true;
  if (result.kind === 'foundation48') return !result.completed || result.answeredChallenges !== result.expectedChallenges;
  return !result.practiceVisible
    || result.selectedLessonCount !== 1
    || result.actualSentenceCount !== result.expectedSentenceCount
    || !result.lineNavigationWorked
    || result.invalidLessonMessage;
}

(async () => {
  const manifest = loadManifest();
  if (manifest.foundationDays.length !== 48) throw new Error(`Expected 48 Foundation days, found ${manifest.foundationDays.length}.`);
  if (!manifest.shadowingLessons.length) throw new Error('No Shadowing lessons were found.');

  const requestedLimit = Number(process.env.PENGLISH_QA_LIMIT || 0);
  const requestedStart = Math.max(0, Number(process.env.PENGLISH_QA_START || 0));
  const requestedEnd = requestedLimit > 0 ? requestedStart + requestedLimit : undefined;
  const foundationDays = manifest.foundationDays.slice(requestedStart, requestedEnd);
  const shadowingLessons = manifest.shadowingLessons.slice(requestedStart, requestedEnd);
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
    page.setDefaultTimeout(7000);
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    for (const [index, day] of foundationDays.entries()) {
      results.push(await runFoundationDay(page, day, viewport.name));
      if ((index + 1) % 8 === 0 || index === foundationDays.length - 1) console.log(`[${viewport.name}] Foundation ${index + 1}/${foundationDays.length}`);
    }
    for (const [index, lesson] of shadowingLessons.entries()) {
      results.push(await runShadowingLesson(page, lesson, viewport.name));
      if ((index + 1) % 10 === 0 || index === shadowingLessons.length - 1) console.log(`[${viewport.name}] Shadowing ${index + 1}/${shadowingLessons.length}`);
    }
    await context.close();
  }

  const failures = results.filter(isFailure);
  const foundationResults = results.filter((result) => result.kind === 'foundation48');
  const shadowingResults = results.filter((result) => result.kind === 'shadowing');
  console.log(JSON.stringify({
    baseUrl: BASE_URL,
    viewportCount: VIEWPORTS.length,
    foundationDayCount: foundationDays.length,
    foundationRouteVisits: foundationResults.length,
    foundationChallengesAnswered: foundationResults.reduce((sum, result) => sum + result.answeredChallenges, 0),
    shadowingLessonCount: shadowingLessons.length,
    shadowingRouteVisits: shadowingResults.length,
    routeVisitCount: results.length,
    failureCount: failures.length,
    failures,
  }, null, 2));
  await browser.close();
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
