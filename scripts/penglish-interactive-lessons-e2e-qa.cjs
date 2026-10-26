const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const validationReport = require('../reports/penglish-runtime-lesson-validation.json');

const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;
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

  const lessonTipContinue = page.locator('[data-testid="interactive-lesson-tip-continue-button"]');
  if (await visible(lessonTipContinue)) {
    await lessonTipContinue.click();
    return 'lesson_tip';
  }

  const shadowing = page.locator('[data-testid="interactive-shadowing"]');
  if (await visible(shadowing)) {
    const listen = shadowing.locator('[data-testid="interactive-shadowing-model"]');
    const selfCheck = shadowing.locator('[data-testid="interactive-shadowing-self-check"]');
    if (!await listen.isVisible() || !await selfCheck.isVisible() || !await selfCheck.isDisabled()) {
      throw new Error('Shadowing must require listening to the model before the unscored self-check can continue.');
    }
    if (process.env.PENGLISH_QA_CAPTURE_SHADOWING === '1') {
      const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      const viewportName = process.env.PENGLISH_QA_VIEWPORT || 'mobile';
      await page.screenshot({ path: path.join(screenshotDir, `interactive-lesson-shadowing-${viewportName}.png`) });
    }
    await listen.click();
    await selfCheck.waitFor({ state: 'visible' });
    if (await selfCheck.isDisabled()) throw new Error('Listening to the model should unlock the shadowing self-check fallback.');
    if (process.env.PENGLISH_QA_SHADOWING_RECORD === '1') {
      await page.route('**/api/shadowing-feedback', (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'GEMINI_API_KEY_MISSING', message: 'Poo chưa nghe rõ.' }),
      }));
      const record = shadowing.locator('[data-testid="interactive-shadowing-record"]');
      await record.click();
      await page.waitForTimeout(700);
      await record.click();
      const playback = shadowing.locator('[data-testid="interactive-shadowing-playback"]');
      await playback.waitFor({ state: 'visible', timeout: 5000 });
      await shadowing.locator('[data-testid="interactive-shadowing-compare"]').click();
      await shadowing.locator('[data-testid="interactive-shadowing-fallback"]').waitFor({ state: 'visible', timeout: 5000 });
      if (await selfCheck.isDisabled()) throw new Error('Shadowing must remain completable when the feedback service is unavailable.');
    }
    await selfCheck.click();
    return 'shadowing';
  }

  const revealCard = page.locator('[data-testid="interactive-lesson-reveal-card-button"]');
  if (await visible(revealCard)) {
    await revealCard.click();
    await page.locator('[data-testid="interactive-lesson-remember-button"]').click();
    return 'flashcard';
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

  const matchGame = page.locator('[data-testid="interactive-match-game"]');
  if (await visible(matchGame)) {
    if (process.env.PENGLISH_QA_CAPTURE_MATCH === '1') {
      const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      const viewportName = process.env.PENGLISH_QA_VIEWPORT || 'mobile';
      await page.screenshot({ path: path.join(screenshotDir, `interactive-lesson-match-pairs-${viewportName}.png`) });
    }
    const left = matchGame.locator('[data-testid="interactive-match-left"]');
    const right = matchGame.locator('[data-testid="interactive-match-right"]');
    const pairCount = await left.count();
    if (pairCount < 1 || pairCount !== await right.count()) throw new Error('A matching round must render the same non-zero number of left and right cards.');
    const leftIds = await left.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-pair-id')));
    const rightIds = await right.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-pair-id')));
    if (leftIds.some((id) => !id) || new Set(leftIds).size !== leftIds.length || new Set(rightIds).size !== rightIds.length) {
      throw new Error('Matching cards must carry unique pair IDs on both sides.');
    }
    if (pairCount > 1 && leftIds.every((id, index) => id === rightIds[index])) {
      throw new Error('The right matching column must use a different order from the left column.');
    }

    // Exercise the recovery path: make one deliberate mismatch, then finish every pair.
    const firstId = leftIds[0];
    await matchGame.locator(`[data-testid="interactive-match-left"][data-pair-id="${firstId}"]`).click();
    const wrongId = rightIds.find((id) => id !== firstId);
    if (wrongId) await matchGame.locator(`[data-testid="interactive-match-right"][data-pair-id="${wrongId}"]`).click();
    for (const pairId of leftIds) {
      if (pairId === firstId) {
        await matchGame.locator(`[data-testid="interactive-match-right"][data-pair-id="${pairId}"]`).click();
        continue;
      }
      await matchGame.locator(`[data-testid="interactive-match-left"][data-pair-id="${pairId}"]`).click();
      await matchGame.locator(`[data-testid="interactive-match-right"][data-pair-id="${pairId}"]`).click();
    }
    return 'match_pairs';
  }

  const fillInput = page.locator('[data-testid="interactive-lesson-fill-input"]');
  if (await visible(fillInput)) {
    const speedRound = page.locator('[data-testid="interactive-speed-recall"]');
    if (await visible(speedRound)) {
      const timer = speedRound.locator('[data-testid="interactive-speed-timer"]');
      const untimed = speedRound.locator('[data-testid="interactive-speed-untimed"]');
      if (!await timer.isVisible() || !await untimed.isVisible()) throw new Error('Speed recall must show both its timer and an untimed accessibility option.');
      if (process.env.PENGLISH_QA_CAPTURE_SPEED === '1') {
        const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
        fs.mkdirSync(screenshotDir, { recursive: true });
        const viewportName = process.env.PENGLISH_QA_VIEWPORT || 'mobile';
        await page.screenshot({ path: path.join(screenshotDir, `interactive-lesson-speed-recall-${viewportName}.png`) });
      }
      if (process.env.PENGLISH_QA_SPEED_TIMEOUT === '1' && !page.__penglishSpeedTimeoutChecked) {
        page.__penglishSpeedTimeoutChecked = true;
        await page.waitForFunction(() => document.querySelector('[data-testid="interactive-speed-timer"]')?.textContent?.includes('Hết giờ'), null, { timeout: 25000 });
        if (await fillInput.isDisabled()) throw new Error('The speed answer must remain available after the timer ends.');
      } else {
        await untimed.click();
        if (!(await timer.innerText()).includes('Không giới hạn')) throw new Error('Untimed mode did not stop the speed countdown.');
      }
      await fillInput.fill('test answer');
      await fillInput.press('Enter');
      await page.locator('[data-testid="interactive-lesson-feedback"]').waitFor({ state: 'visible', timeout: 3000 });
      return 'speed_recall';
    }
    await fillInput.fill('test answer');
    await page.locator('[data-testid="interactive-lesson-check-button"]').click();
    return await visible(page.locator('[data-testid="interactive-speed-recall"]')) ? 'speed_recall' : 'fill_blank';
  }

  const openResponse = page.locator('[data-testid="interactive-lesson-final-response"]');
  if (await visible(openResponse)) {
    const phraseCard = page.locator('[data-testid^="interactive-lesson-phrase-card-"]').first();
    if (await visible(phraseCard)) {
      if (process.env.PENGLISH_QA_CAPTURE_SCENARIO === '1') {
        const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
        fs.mkdirSync(screenshotDir, { recursive: true });
        const viewportName = process.env.PENGLISH_QA_VIEWPORT || 'mobile';
        await page.screenshot({ path: path.join(screenshotDir, `interactive-lesson-real-life-${viewportName}.png`) });
      }
      const phrase = (await phraseCard.innerText()).replace(/^\+\s*/, '').trim();
      await phraseCard.click();
      if (!(await openResponse.inputValue()).includes(phrase)) throw new Error('Selecting a real-life phrase card must add that phrase to the learner response.');
    }
    await openResponse.fill('I am practicing a short answer.');
    await page.locator('[data-testid="interactive-lesson-final-submit-button"]').click();
    const selfCheckFeedback = page.locator('[data-testid="interactive-lesson-feedback"]');
    await selfCheckFeedback.waitFor({ state: 'visible', timeout: 3000 });
    const feedbackText = await selfCheckFeedback.innerText();
    if (!feedbackText.includes('Đã lưu phần tự luyện') || feedbackText.includes('Chuẩn rồi!')) {
      throw new Error('Open responses must be identified as unscored self-checks, not falsely celebrated as correct answers.');
    }
    return 'free_response';
  }

  const missionTracker = page.locator('[data-testid="interactive-lesson-mission-tracker"]');
  if (await visible(missionTracker)) {
    if (process.env.PENGLISH_QA_CAPTURE_MISSION === '1') {
      const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      const viewportName = process.env.PENGLISH_QA_VIEWPORT || 'mobile';
      await page.screenshot({ path: path.join(screenshotDir, `interactive-lesson-mission-${viewportName}.png`) });
    }
    const targetRows = missionTracker.locator('[data-testid="interactive-lesson-mission-targets"] > *');
    if (await targetRows.count() < 2) throw new Error('A linked mission must display its source activities and measured progress.');
    const mode = await missionTracker.getAttribute('data-mission-mode');
    const current = Number(await missionTracker.getAttribute('data-mission-current'));
    const minimum = Number(await missionTracker.getAttribute('data-mission-minimum'));
    const expectedMet = current >= minimum;
    if (mode === 'unconfigured' || await missionTracker.getAttribute('data-mission-met') !== String(expectedMet)) {
      throw new Error('Mission success must match the configured source-activity threshold.');
    }
    const missionButton = missionTracker.locator('[data-testid="interactive-lesson-mission-continue-button"]');
    await missionButton.click();
    const feedback = page.locator('[data-testid="interactive-lesson-feedback"]');
    await feedback.waitFor({ state: 'visible', timeout: 3000 });
    const text = await feedback.innerText();
    if (!text.includes('nhiệm vụ')) throw new Error('Mission feedback must report the measured mission outcome.');
    return 'mission_tracker';
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
  const requestedIds = (process.env.PENGLISH_QA_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
  const requestedLimit = Number(process.env.PENGLISH_QA_LIMIT || 0);
  const lessonIds = requestedIds.length
    ? allLessonIds.filter((id) => requestedIds.includes(id))
    : requestedLimit > 0 ? allLessonIds.slice(0, requestedLimit) : allLessonIds;
  if (requestedIds.length && lessonIds.length !== new Set(requestedIds).size) {
    throw new Error(`Some requested lesson IDs were not found: ${requestedIds.filter((id) => !allLessonIds.includes(id)).join(', ')}`);
  }
  if (!requestedLimit && !requestedIds.length && lessonIds.length !== validationReport.lessonCount) {
    throw new Error(`Expected ${validationReport.lessonCount} lesson IDs but found ${lessonIds.length}.`);
  }

  const shadowingMediaQa = process.env.PENGLISH_QA_SHADOWING_RECORD === '1';
  const browser = await chromium.launch({
    headless: true,
    args: shadowingMediaQa ? ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] : [],
  });
  const results = [];
  let verifiedReviewResume = false;

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    if (shadowingMediaQa) await context.grantPermissions(['microphone']);
    await page.addInitScript(() => {
      if (sessionStorage.getItem('penglish-qa-session-initialized') !== '1') {
        localStorage.clear();
        sessionStorage.clear();
        sessionStorage.setItem('penglish-qa-session-initialized', '1');
      }
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
      let reviewTagSeen = false;
      let reviewPromptModeSeen = false;
      let reviewScreenshotCaptured = false;
      let didReviewResumeCheck = false;
      let didPlayBonus = false;
      let didBonusResumeCheck = false;
      let capturedCoreSummary = false;
      let capturedBonusSummary = false;
      for (let guard = 0; guard < 280; guard += 1) {
        const bodyText = await page.locator('body').innerText();
        if (process.env.PENGLISH_QA_CAPTURE_QUEST === '1' && viewport.name === 'mobile') {
          const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
          if (!capturedCoreSummary && bodyText.includes('Hoàn thành nhiệm vụ chính!')) {
            fs.mkdirSync(screenshotDir, { recursive: true });
            await page.screenshot({ path: path.join(screenshotDir, 'interactive-lesson-core-quest-summary-mobile.png'), fullPage: true });
            capturedCoreSummary = true;
          }
          if (!capturedBonusSummary && bodyText.includes('Hoàn thành vòng thưởng!')) {
            fs.mkdirSync(screenshotDir, { recursive: true });
            await page.screenshot({ path: path.join(screenshotDir, 'interactive-lesson-bonus-summary-mobile.png'), fullPage: true });
            capturedBonusSummary = true;
          }
        }
        if (bodyText.includes('Lượt ôn · không đổi điểm lần đầu')) {
          reviewTagSeen = true;
          const expectedReviewPrompt = lessonId.startsWith('reading-')
            ? 'Quay lại đoạn đọc, tìm câu có bằng chứng'
            : lessonId.startsWith('grammar-')
              ? 'Nhớ lại khung ngữ pháp, tự dựng lại câu'
              : 'Nhớ lại tình huống giao tiếp';
          if (bodyText.includes(expectedReviewPrompt)) reviewPromptModeSeen = true;
          if (!reviewScreenshotCaptured && viewport.name === 'mobile') {
            const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
            fs.mkdirSync(screenshotDir, { recursive: true });
            await page.screenshot({ path: path.join(screenshotDir, 'interactive-lesson-review-mobile.png'), fullPage: true });
            reviewScreenshotCaptured = true;
          }
          if (process.env.PENGLISH_QA_RELOAD_DURING_REVIEW === '1' && !didReviewResumeCheck) {
            didReviewResumeCheck = true;
            await page.reload({ waitUntil: 'domcontentloaded' });
            const reviewTag = page.getByText('Lượt ôn · không đổi điểm lần đầu');
            try {
              await reviewTag.waitFor({ state: 'visible', timeout: 7000 });
            } catch {
              const resumedState = await page.evaluate(() => ({
                body: document.body.innerText.slice(-1200),
                progress: localStorage.getItem('penglish.lesson.progress.v1'),
              }));
              throw new Error(`Review step did not resume after reload: ${JSON.stringify(resumedState)}`);
            }
            verifiedReviewResume = true;
            continue;
          }
        }
        if (bodyText.includes('Hoàn thành nhiệm vụ chính!') && process.env.PENGLISH_QA_PLAY_BONUS === '1' && !didPlayBonus) {
          const startBonus = page.locator('[data-testid="interactive-lesson-start-bonus"]');
          if (!await visible(startBonus)) {
            stuckReason = 'The completed core quest did not offer access to its optional bonus challenges.';
            break;
          }
          didPlayBonus = true;
          await startBonus.click();
          if (process.env.PENGLISH_QA_RELOAD_IN_BONUS === '1' && !didBonusResumeCheck) {
            didBonusResumeCheck = true;
            const bonusStep = page.locator('[data-testid="interactive-lesson-card"][data-optional-bonus="true"]');
            await bonusStep.waitFor({ state: 'visible', timeout: 5000 });
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator('[data-testid="interactive-lesson-card"][data-optional-bonus="true"]').waitFor({ state: 'visible', timeout: 7000 });
          }
          continue;
        }
        if (bodyText.includes('Hoàn thành nhiệm vụ chính!') || bodyText.includes('Hoàn thành vòng thưởng!')) {
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
          const currentStep = await page.locator('[data-testid="interactive-lesson-card"]').innerText().catch(() => 'step unavailable');
          stuckReason = `No supported control was visible for the current step: ${currentStep.slice(0, 240)}`;
          break;
        }
        seenControllers.add(controller);
        answeredSteps += 1;
        await page.locator('[data-testid="interactive-lesson-feedback"]').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      }

      const finalText = await page.locator('body').innerText();
      const reviewState = await page.evaluate(() => {
        const records = JSON.parse(localStorage.getItem('penglish.lesson.progress.v1') || '{}');
        const lessonId = decodeURIComponent(window.location.pathname.split('/').pop() || '');
        const record = records[lessonId];
        const progress = JSON.parse(localStorage.getItem(`p-english:lesson-progress:${lessonId}`) || '{}');
        const wrongReviewDelays = Object.values(progress.srs?.items || {})
          .filter((item) => item.wrongCount > 0 && item.lastWrongAt === item.lastReviewedAt)
          .map((item) => (new Date(item.nextReviewAt).getTime() - Date.now()) / 60000);
        const matchReviews = Object.values(progress.srs?.items || {}).filter((item) => item.type === 'match');
        return {
          completedReviewIds: (record?.completedSteps || []).filter((id) => id.startsWith('review-')),
          reviewOutcomes: Object.keys(record?.stepOutcomes || {}).filter((id) => id.startsWith('review-')),
          wrongReviewDelays,
          matchReviewCount: matchReviews.filter((item) => item.correctCount > 0 || item.wrongCount > 0).length,
          recoveredMatchCount: matchReviews.filter((item) => item.wrongCount > 0 && item.correctCount > 0 && item.lastReviewedAt > item.lastWrongAt).length,
        };
      });
      if (process.env.PENGLISH_QA_EXPECT_REVIEW === '1') {
        if (!reviewTagSeen || reviewState.completedReviewIds.length === 0) stuckReason = 'An authored error did not create a completed in-lesson review step.';
        if (reviewState.reviewOutcomes.length > 0) stuckReason = 'An in-lesson retry changed the saved first-attempt outcome.';
        if (!reviewPromptModeSeen) stuckReason = `The retry step did not show the ${lessonId.startsWith('reading-') ? 'reading-evidence' : lessonId.startsWith('grammar-') ? 'grammar-pattern' : 'real-life-context'} instruction.`;
        if (!reviewState.wrongReviewDelays.length || reviewState.wrongReviewDelays.some((minutes) => minutes < 8 || minutes > 10.1)) {
          stuckReason = `The SRS review delay did not follow the 10-minute policy: ${reviewState.wrongReviewDelays.join(', ')}`;
        }
      }
      if (process.env.PENGLISH_QA_REQUIRE_MATCH === '1' && (!seenControllers.has('match_pairs') || reviewState.matchReviewCount < 1 || reviewState.recoveredMatchCount < 1)) {
        stuckReason = `The matching game did not preserve per-pair review and wrong-to-correct recovery: ${JSON.stringify({ controllers: [...seenControllers], matchReviewCount: reviewState.matchReviewCount, recoveredMatchCount: reviewState.recoveredMatchCount })}`;
      }
      if (process.env.PENGLISH_QA_RELOAD_DURING_REVIEW === '1' && !didReviewResumeCheck) stuckReason = 'The review step was not interrupted and resumed for this run.';
      if (completed && index === 0 && viewport.name === 'mobile') {
        const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
        fs.mkdirSync(screenshotDir, { recursive: true });
        await page.screenshot({ path: path.join(screenshotDir, 'interactive-lesson-criteria-mobile.png'), fullPage: true });
      }
      hasEmoji ||= EMOJI_PATTERN.test(finalText);
      const finalOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
      maxHorizontalOverflow = Math.max(maxHorizontalOverflow, finalOverflow);

      const result = {
        lessonId,
        viewport: viewport.name,
        completed,
        hasCriteriaSummary: await page.locator('[data-testid="interactive-lesson-criteria"]').isVisible().catch(() => false),
        answeredSteps,
        reviewRetrySteps: reviewState.completedReviewIds.length,
        reviewPromptModeSeen,
        wrongReviewDelays: reviewState.wrongReviewDelays,
        matchReviewCount: reviewState.matchReviewCount,
        recoveredMatchCount: reviewState.recoveredMatchCount,
        seenControllers: [...seenControllers],
        stuckReason,
        hasEmoji,
        emojiContexts: [...finalText.matchAll(/\p{Extended_Pictographic}/gu)].slice(0, 8).map((match) => finalText.slice(Math.max(0, match.index - 40), Math.min(finalText.length, match.index + match[0].length + 40))),
        maxHorizontalOverflow,
        brokenImages,
        responseErrors,
        consoleErrors,
        pageErrors,
      };
      if (completed && !result.hasCriteriaSummary) stuckReason = 'Lesson completed but the completion-criteria summary was not visible.';
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
    || result.answeredSteps < 1
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
    totalReviewRetrySteps: results.reduce((sum, result) => sum + result.reviewRetrySteps, 0),
    verifiedReviewResume,
    reviewPromptModesSeen: [...new Set(results.filter((result) => result.reviewPromptModeSeen).map((result) => result.lessonId))],
    wrongReviewDelays: results.flatMap((result) => result.wrongReviewDelays),
    controllerCoverage,
    failureCount: failures.length,
    failures,
  };
  console.log(JSON.stringify(summary, null, 2));
  const reportFile = process.env.PENGLISH_QA_REPORT_FILE || 'penglish-interactive-lessons-e2e-results.json';
  const reportPath = path.resolve(__dirname, '..', 'reports', reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Report written: ${reportPath}`);
  await browser.close();
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
