const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/learn/reading-a1-my-morning`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('interactive-lesson-card').waitFor({ state: 'visible', timeout: 10000 });
    const result = await page.evaluate(async () => {
      const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
      const { getLessonSrsReviewItems, getLessonProgressKey, markItemReviewed, readLessonProgress } = await import('/src/lib/p-english/lesson-progress.ts');
      const { getPracticeRecommendation } = await import('/src/lib/p-english/practiceRecommendationEngine.ts');
      const lessonId = 'reading-a1-my-morning';
      const lesson = getLessonById(lessonId);
      if (!lesson) throw new Error(`Missing lesson ${lessonId}`);
      const itemId = lesson.quizQuestions[0]?.id;
      if (!itemId) throw new Error('The sample reading lesson has no quiz item.');
      localStorage.removeItem(getLessonProgressKey(lessonId));

      const counts = [];
      const mastery = [];
      for (const session of ['qa-session-1', 'qa-session-2', 'qa-session-3']) {
        markItemReviewed(lessonId, itemId, 'quiz', 'correct', 10, session, true);
        if (session === 'qa-session-1') markItemReviewed(lessonId, itemId, 'quiz', 'correct', 10, session, true);
        const item = readLessonProgress(lessonId)?.srs?.items[itemId];
        const review = getLessonSrsReviewItems(lessonId, lesson).find((candidate) => candidate.itemId === itemId);
        counts.push(item?.correctSessionCount ?? 0);
        mastery.push({ isFamiliar: review?.isFamiliar, isMastered: review?.isMastered, level: item?.level });
      }

      markItemReviewed(lessonId, itemId, 'quiz', 'wrong', 10, 'qa-session-4', true);
      const failedMasteredItem = getLessonSrsReviewItems(lessonId, lesson).find((candidate) => candidate.itemId === itemId);
      const beforeWrong = Date.now();
      markItemReviewed(lessonId, `${itemId}-wrong-delay`, 'quiz', 'wrong', 10, 'qa-session-4', true);
      const wrongItem = readLessonProgress(lessonId)?.srs?.items[`${itemId}-wrong-delay`];
      const wrongDelayMinutes = wrongItem ? (new Date(wrongItem.nextReviewAt).getTime() - beforeWrong) / 60000 : 0;

      const keywordFlashcardId = lesson.flashcards[0]?.id;
      const keywordQuizId = lesson.quizQuestions[0]?.id;
      if (keywordFlashcardId && keywordQuizId) {
        markItemReviewed(lessonId, keywordFlashcardId, 'flashcard', 'wrong', 10, 'qa-priority', true);
        markItemReviewed(lessonId, keywordQuizId, 'quiz', 'wrong', 10, 'qa-priority', true);
      }
      const keywordPriorityOrder = getLessonSrsReviewItems(lessonId, lesson).slice(0, 2).map((item) => item.type);

      const phraseLessonId = 'unit-1-greetings-introduction';
      const phraseLesson = getLessonById(phraseLessonId);
      const phraseCard = phraseLesson?.flashcards.find((card) => /\s/.test(card.front.trim()));
      const singleWordCard = phraseLesson?.flashcards.find((card) => !/\s/.test(card.front.trim()));
      if (phraseLesson && phraseCard && singleWordCard) {
        localStorage.removeItem(getLessonProgressKey(phraseLessonId));
        markItemReviewed(phraseLessonId, singleWordCard.id, 'flashcard', 'wrong', 10, 'qa-phrase-priority', true);
        markItemReviewed(phraseLessonId, phraseCard.id, 'flashcard', 'wrong', 10, 'qa-phrase-priority', true);
      }
      const phrasePriorityOrder = phraseLesson ? getLessonSrsReviewItems(phraseLessonId, phraseLesson).slice(0, 2).map((item) => item.label) : [];

      const coverageLessonId = 'a1-listening-meeting-classmate';
      const coverageLesson = getLessonById(coverageLessonId);
      if (!coverageLesson?.fillBlankTasks[0] || !coverageLesson.commonMistakes?.[0] || !coverageLesson.englishSpeedPrompts?.[0]) {
        throw new Error('The SRS coverage lesson needs a fill-blank, common mistake, and speed prompt.');
      }
      localStorage.removeItem(getLessonProgressKey(coverageLessonId));
      const fillBlank = coverageLesson.fillBlankTasks[0];
      const commonMistake = coverageLesson.commonMistakes[0];
      const speedPrompt = coverageLesson.englishSpeedPrompts[0];
      markItemReviewed(coverageLessonId, fillBlank.id, 'typing', 'wrong', 10, 'qa-map-coverage', true);
      markItemReviewed(coverageLessonId, commonMistake.id, 'typing', 'wrong', 10, 'qa-map-coverage', true);
      markItemReviewed(coverageLessonId, speedPrompt.id, 'speed', 'wrong', 10, 'qa-map-coverage', true);
      const communicationLessonId = 'unit-1-greetings-introduction';
      const communicationLesson = getLessonById(communicationLessonId);
      const orderTask = communicationLesson?.sentenceOrderingTasks[0];
      const matchQuestion = communicationLesson?.quizQuestions.find((item) => item.type === 'match-meaning' && item.pairs?.length);
      const matchPair = coverageLesson.matchPairs?.[0];
      const dialogue = coverageLesson.miniDialogues[0];
      if (!orderTask || !matchQuestion?.pairs?.[0] || !matchPair || !dialogue?.lines[0]) {
        throw new Error('SRS coverage lessons need sentence order, meaning match, match pair, and dialogue items.');
      }
      localStorage.removeItem(getLessonProgressKey(communicationLessonId));
      markItemReviewed(communicationLessonId, orderTask.id, 'quiz', 'wrong', 10, 'qa-map-coverage', true);
      const meaningMatchId = `${matchQuestion.id}-0`;
      markItemReviewed(communicationLessonId, meaningMatchId, 'quiz', 'wrong', 10, 'qa-map-coverage', true);
      markItemReviewed(coverageLessonId, matchPair.id, 'match', 'wrong', 10, 'qa-map-coverage', true);
      const dialogueLineId = `${dialogue.id}-0`;
      markItemReviewed(coverageLessonId, dialogueLineId, 'listening', 'wrong', 10, 'qa-map-coverage', true);
      if (!phraseLesson || !phraseCard) throw new Error('A phrase flashcard is required for due-card review QA.');
      markItemReviewed(phraseLessonId, phraseCard.id, 'flashcard', 'wrong', phraseLesson.reviewPolicy.wrongAnswerDelayMinutes, 'qa-flashcard-due', true);
      const phraseProgress = readLessonProgress(phraseLessonId);
      phraseProgress.srs.items[phraseCard.id].nextReviewAt = new Date(Date.now() - 60_000).toISOString();
      localStorage.setItem(getLessonProgressKey(phraseLessonId), JSON.stringify(phraseProgress));
      const dueFlashcardRecommendation = getPracticeRecommendation(phraseLesson, phraseProgress);
      const dialogueProgress = readLessonProgress(coverageLessonId);
      dialogueProgress.srs.items[dialogueLineId].nextReviewAt = new Date(Date.now() - 60_000).toISOString();
      localStorage.setItem(getLessonProgressKey(coverageLessonId), JSON.stringify(dialogueProgress));
      const dueListeningRecommendation = getPracticeRecommendation(coverageLesson, dialogueProgress);
      const reviewCoverage = [
        ...getLessonSrsReviewItems(coverageLessonId, coverageLesson).filter((item) => [fillBlank.id, commonMistake.id, speedPrompt.id, matchPair.id, dialogueLineId].includes(item.itemId)),
        ...getLessonSrsReviewItems(communicationLessonId, communicationLesson).filter((item) => [orderTask.id, meaningMatchId].includes(item.itemId)),
      ]
        .map((item) => ({ itemId: item.itemId, label: item.label, answer: item.answer, practiceUrl: item.practiceUrl }));

      return {
        counts,
        mastery,
        failedMastery: { isFamiliar: failedMasteredItem?.isFamiliar, isMastered: failedMasteredItem?.isMastered },
        wrongDelayMinutes,
        keywordPriorityOrder,
        phrasePriorityOrder,
        reviewCoverage,
        dueListeningRecommendation,
        dueListening: { lessonId: coverageLessonId, itemId: dialogueLineId, answer: dialogue.lines[0].text },
        dueFlashcardRecommendation,
        dueFlashcard: { lessonId: phraseLessonId, itemId: phraseCard.id, answer: phraseCard.back },
      };
    });

    if (JSON.stringify(result.counts) !== JSON.stringify([1, 2, 3])) throw new Error(`Repeated success in one session must count once: ${JSON.stringify(result.counts)}`);
    if (result.mastery[0].isFamiliar || result.mastery[0].isMastered) throw new Error('An item became familiar or mastered before its configured session threshold.');
    if (!result.mastery[1].isFamiliar || result.mastery[1].isMastered) throw new Error('An item should become familiar after two correct sessions.');
    if (!result.mastery[2].isMastered) throw new Error('An item should become mastered after three correct sessions.');
    if (result.failedMastery.isFamiliar || result.failedMastery.isMastered) throw new Error('A new wrong answer must reset the familiar/mastered state.');
    if (result.wrongDelayMinutes < 9.9 || result.wrongDelayMinutes > 10.1) throw new Error(`Wrong-answer review should follow the 10-minute policy: ${result.wrongDelayMinutes}`);
    if (result.keywordPriorityOrder[0] !== 'flashcard') throw new Error(`Reading policy should prioritize weak keyword cards: ${JSON.stringify(result.keywordPriorityOrder)}`);
    if (result.phrasePriorityOrder.length < 2 || !/\s/.test(result.phrasePriorityOrder[0]) || /\s/.test(result.phrasePriorityOrder[1])) {
      throw new Error(`Communication policy should prioritize phrase cards before single words: ${JSON.stringify(result.phrasePriorityOrder)}`);
    }
    const coverageById = new Map(result.reviewCoverage.map((item) => [item.itemId, item]));
    const expectedModes = new Map([
      ['a1-classmate-blank-new', 'type'],
      ['a1-classmate-mistake-seat-sit', 'type'],
      ['a1-classmate-speed-seat', 'speed'],
      ['match-a1-classmate-new', 'match'],
      ['a1-classmate-dialogue-main-0', 'listen'],
      ['order-nice-to-meet-you', 'quiz'],
      ['quiz-6-match-goodbye-0', 'quiz'],
    ]);
    for (const [itemId, mode] of expectedModes) {
      const item = coverageById.get(itemId);
      if (!item || !item.practiceUrl.includes(`mode=${mode}`)) {
        throw new Error(`Review item ${itemId} should route to mode=${mode}: ${JSON.stringify(item)}`);
      }
    }
    for (const item of result.reviewCoverage) {
      if (item.practiceUrl.includes('mode=type') && !item.answer) throw new Error(`Typed review item has no answer: ${JSON.stringify(item)}`);
      if (item.practiceUrl.includes('mode=speed') && !item.answer) throw new Error(`Speed review item has no answer: ${JSON.stringify(item)}`);
    }
    if (result.reviewCoverage.length !== 7 || !Array.from(coverageById.values()).some((item) => item.practiceUrl.includes('mode=type')) || !Array.from(coverageById.values()).some((item) => item.practiceUrl.includes('mode=speed')) || !Array.from(coverageById.values()).some((item) => item.practiceUrl.includes('mode=listen')) || !Array.from(coverageById.values()).some((item) => item.practiceUrl.includes('mode=match'))) {
      throw new Error(`All scored interaction types should be recoverable through review: ${JSON.stringify(result.reviewCoverage)}`);
    }
    if (result.dueListeningRecommendation.primaryMode !== 'listen' || !result.dueListeningRecommendation.primaryUrl.includes('&review=due')) {
      throw new Error(`A due dialogue should open a due-only listening review: ${JSON.stringify(result.dueListeningRecommendation)}`);
    }
    if (result.dueFlashcardRecommendation.primaryMode !== 'flashcard' || !result.dueFlashcardRecommendation.primaryUrl.includes('&review=due')) {
      throw new Error(`A due flashcard should open a due-only flashcard review: ${JSON.stringify(result.dueFlashcardRecommendation)}`);
    }

    await page.goto(`${baseUrl}${result.dueListeningRecommendation.primaryUrl}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Bắt đầu luyện nghe' }).waitFor({ timeout: 10000 });
    const dueTotal = await page.getByText('Câu nghe', { exact: true }).locator('..').innerText();
    if (!/\b1\b/.test(dueTotal)) throw new Error(`Due-only listening should show one question, got: ${dueTotal}`);
    await page.getByRole('button', { name: 'Bắt đầu luyện nghe' }).click();
    await page.getByRole('button').filter({ hasText: result.dueListening.answer }).first().click();
    await page.getByRole('button', { name: 'Kiểm tra' }).click();
    await page.getByText('Nghe tốt!', { exact: true }).waitFor({ timeout: 5000 });
    const afterDueListening = await page.evaluate(async ({ lessonId, itemId }) => {
      const { getDueReviewItems, getLessonProgressKey, readLessonProgress } = await import('/src/lib/p-english/lesson-progress.ts');
      const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
      const lesson = getLessonById(lessonId);
      const item = readLessonProgress(lessonId)?.srs?.items[itemId];
      return { nextReviewAt: item?.nextReviewAt, correctCount: item?.correctCount, dueCount: lesson ? getDueReviewItems(lessonId, lesson).length : -1 };
    }, result.dueListening);
    if (!afterDueListening.nextReviewAt || new Date(afterDueListening.nextReviewAt).getTime() <= Date.now() || afterDueListening.correctCount !== 1 || afterDueListening.dueCount !== 0) {
      throw new Error(`A correct due dialogue answer should update its SRS review state: ${JSON.stringify(afterDueListening)}`);
    }
    await page.goto(`${baseUrl}${result.dueFlashcardRecommendation.primaryUrl}`, { waitUntil: 'domcontentloaded' });
    const flashcardInput = page.getByPlaceholder('Ví dụ: xin chào');
    try {
      await flashcardInput.waitFor({ timeout: 10000 });
    } catch {
      const dueFlashcardState = await page.evaluate(async ({ lessonId, itemId }) => {
        const { getDueReviewItems, readLessonProgress } = await import('/src/lib/p-english/lesson-progress.ts');
        const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
        const lesson = getLessonById(lessonId);
        return { item: readLessonProgress(lessonId)?.srs?.items[itemId], due: lesson ? getDueReviewItems(lessonId, lesson).map((entry) => entry.itemId) : [] };
      }, result.dueFlashcard);
      throw new Error(`Due flashcard route did not show its meaning input. URL: ${page.url()} SRS: ${JSON.stringify(dueFlashcardState)} Page: ${(await page.locator('body').innerText()).slice(0, 900)}`);
    }
    await flashcardInput.fill(result.dueFlashcard.answer);
    await page.getByRole('button', { name: 'Poo xem nghĩa' }).click();
    await page.getByRole('button', { name: 'Lật thẻ', exact: true }).click();
    await page.getByRole('button', { name: 'Mình nhớ rồi · 2/Enter' }).click();
    const afterDueFlashcard = await page.evaluate(async ({ lessonId, itemId }) => {
      const { getDueReviewItems, readLessonProgress } = await import('/src/lib/p-english/lesson-progress.ts');
      const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
      const lesson = getLessonById(lessonId);
      const item = readLessonProgress(lessonId)?.srs?.items[itemId];
      return { nextReviewAt: item?.nextReviewAt, correctSessionCount: item?.correctSessionCount, dueCount: lesson ? getDueReviewItems(lessonId, lesson).length : -1 };
    }, result.dueFlashcard);
    if (!afterDueFlashcard.nextReviewAt || new Date(afterDueFlashcard.nextReviewAt).getTime() <= Date.now() || afterDueFlashcard.correctSessionCount !== 1 || afterDueFlashcard.dueCount !== 0) {
      throw new Error(`A correct due flashcard answer should count one SRS session and leave the due queue: ${JSON.stringify(afterDueFlashcard)}`);
    }
    const dueReflex = await page.evaluate(async () => {
      const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
      const { getLessonProgressKey, markItemReviewed, readLessonProgress } = await import('/src/lib/p-english/lesson-progress.ts');
      const { getPracticeRecommendation } = await import('/src/lib/p-english/practiceRecommendationEngine.ts');
      const lessonId = 'a1-listening-meeting-classmate';
      const lesson = getLessonById(lessonId);
      const prompt = lesson?.speakingReflexPrompts[0];
      if (!lesson || !prompt) throw new Error('The SRS coverage lesson needs a speaking reflex prompt.');
      markItemReviewed(lessonId, prompt.id, 'reflex', 'wrong', lesson.reviewPolicy.wrongAnswerDelayMinutes, 'qa-reflex-due', true);
      const progress = readLessonProgress(lessonId);
      progress.srs.items[prompt.id].nextReviewAt = new Date(Date.now() - 60_000).toISOString();
      localStorage.setItem(getLessonProgressKey(lessonId), JSON.stringify(progress));
      return {
        lessonId,
        itemId: prompt.id,
        answer: prompt.expectedEnglish,
        recommendation: getPracticeRecommendation(lesson, progress),
      };
    });
    if (dueReflex.recommendation.primaryMode !== 'reflex') {
      throw new Error(`A due reflex prompt should open reflex practice: ${JSON.stringify(dueReflex.recommendation)}`);
    }
    await page.goto(`${baseUrl}${dueReflex.recommendation.primaryUrl}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Bắt đầu phản xạ', exact: true }).click();
    await page.getByPlaceholder('Gõ câu tiếng Anh...').fill(dueReflex.answer);
    await page.getByRole('button', { name: 'Kiểm tra', exact: true }).click();
    await page.getByText('Phản xạ tốt!', { exact: true }).waitFor({ timeout: 5000 });
    const afterDueReflex = await page.evaluate(async ({ lessonId, itemId }) => {
      const { getDueReviewItems, readLessonProgress } = await import('/src/lib/p-english/lesson-progress.ts');
      const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
      const lesson = getLessonById(lessonId);
      const item = readLessonProgress(lessonId)?.srs?.items[itemId];
      return { correctSessionCount: item?.correctSessionCount, dueCount: lesson ? getDueReviewItems(lessonId, lesson).length : -1 };
    }, dueReflex);
    if (afterDueReflex.correctSessionCount !== 1 || afterDueReflex.dueCount !== 0) {
      throw new Error(`A correct reflex answer should count one SRS session and leave the due queue: ${JSON.stringify(afterDueReflex)}`);
    }
    const dueMatch = await page.evaluate(async () => {
      const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
      const { getLessonProgressKey, markItemReviewed, readLessonProgress } = await import('/src/lib/p-english/lesson-progress.ts');
      const { getPracticeRecommendation } = await import('/src/lib/p-english/practiceRecommendationEngine.ts');
      const lessonId = 'a1-listening-meeting-classmate';
      const lesson = getLessonById(lessonId);
      const pair = lesson?.matchPairs?.find((candidate) => lesson.vocabulary.some((item) => item.term.trim().toLowerCase() === candidate.left.trim().toLowerCase() && item.meaningVi.trim().toLowerCase() === candidate.right.trim().toLowerCase())) ?? lesson?.matchPairs?.[0];
      if (!lesson || !pair) throw new Error('The SRS coverage lesson needs a match pair.');
      markItemReviewed(lessonId, pair.id, 'match', 'wrong', lesson.reviewPolicy.wrongAnswerDelayMinutes, 'qa-match-due', true);
      const progress = readLessonProgress(lessonId);
      progress.srs.items[pair.id].nextReviewAt = new Date(Date.now() - 60_000).toISOString();
      localStorage.setItem(getLessonProgressKey(lessonId), JSON.stringify(progress));
      const duplicateVocabulary = lesson.vocabulary.find((item) => item.term.trim().toLowerCase() === pair.left.trim().toLowerCase() && item.meaningVi.trim().toLowerCase() === pair.right.trim().toLowerCase());
      return { lessonId, itemId: pair.id, duplicateVocabularyId: duplicateVocabulary?.id, left: pair.left, right: pair.right, recommendation: getPracticeRecommendation(lesson, progress) };
    });
    if (dueMatch.recommendation.primaryMode !== 'match' || !dueMatch.recommendation.primaryUrl.includes('&review=due')) {
      throw new Error(`A due match pair should open due-only match practice: ${JSON.stringify(dueMatch.recommendation)}`);
    }
    await page.goto(`${baseUrl}${dueMatch.recommendation.primaryUrl}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Bắt đầu ghép cặp', exact: true }).click();
    const leftMatchCard = page.getByRole('button').filter({ hasText: dueMatch.left }).first();
    await leftMatchCard.focus();
    await leftMatchCard.press('Enter');
    const rightMatchCard = page.getByRole('button').filter({ hasText: dueMatch.right }).first();
    await rightMatchCard.focus();
    await rightMatchCard.press('Space');
    await page.getByRole('button', { name: 'Xem tổng kết', exact: true }).click();
    const afterDueMatch = await page.evaluate(async ({ lessonId, itemId }) => {
      const { getDueReviewItems, readLessonProgress } = await import('/src/lib/p-english/lesson-progress.ts');
      const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
      const lesson = getLessonById(lessonId);
      const items = readLessonProgress(lessonId)?.srs?.items ?? {};
      return { correctSessionCount: items[itemId]?.correctSessionCount, duplicateCorrectSessionCount: items[arguments[0].duplicateVocabularyId]?.correctSessionCount, dueCount: lesson ? getDueReviewItems(lessonId, lesson).length : -1 };
    }, dueMatch);
    if (afterDueMatch.correctSessionCount !== 1 || afterDueMatch.dueCount !== 0) {
      throw new Error(`A correct due match should count one SRS session and leave the due queue: ${JSON.stringify(afterDueMatch)}`);
    }
    if (dueMatch.duplicateVocabularyId && afterDueMatch.duplicateCorrectSessionCount !== 1) {
      throw new Error(`A deduplicated match should update both source IDs: ${JSON.stringify({ dueMatch, afterDueMatch })}`);
    }

    const report = { ok: true, ...result, dueReflex, afterDueListening, afterDueFlashcard, afterDueReflex, dueMatch, afterDueMatch };
    const reportPath = path.resolve(__dirname, '..', 'reports', 'penglish-srs-policy-qa.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
    console.log(`Report written: ${reportPath}`);
    await context.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
