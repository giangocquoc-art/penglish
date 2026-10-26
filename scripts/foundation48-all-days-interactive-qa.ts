import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { foundation48DeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons';
import { foundation48Stage3LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage3.lazy';
import { foundation48Stage4LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage4.lazy';
import { foundation48Stage5LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage5.lazy';
import { foundation48Stage6LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage6.lazy';
import { foundation48Stage7LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage7.lazy';
import { foundation48Stage8LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage8.lazy';
import type { Foundation48DeepLesson } from '../apps/web/src/features/foundation48/foundation48DeepLessons';

const baseUrl = process.env.FOUNDATION48_QA_BASE_URL || 'http://127.0.0.1:5180';
const requestedDays = (process.env.FOUNDATION48_QA_DAYS || '').split(',').map(Number).filter((day) => day >= 1 && day <= 48);
const days = requestedDays.length ? requestedDays : Array.from({ length: 48 }, (_, index) => index + 1);
const outputDir = path.resolve(process.cwd(), 'reports');
const screenshotDir = path.join(outputDir, 'screenshots');
const lessonBank: Record<number, Foundation48DeepLesson> = {
  ...foundation48DeepLessons,
  ...foundation48Stage3LazyDeepLessons,
  ...foundation48Stage4LazyDeepLessons,
  ...foundation48Stage5LazyDeepLessons,
  ...foundation48Stage6LazyDeepLessons,
  ...foundation48Stage7LazyDeepLessons,
  ...foundation48Stage8LazyDeepLessons,
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[.,!?;:'"“”‘’]/g, '').replace(/\s+/g, ' ').trim();
}

function buildAnswerKey(day: number) {
  const lesson = lessonBank[day];
  if (!lesson) throw new Error(`No authored deep lesson for day ${day}.`);
  const key: Record<string, { type: string; answer: string }> = {};
  lesson.vocabulary.forEach((item, index) => { key[`day-${day}-deep-vocab-${index}`] = { type: 'multiple-choice', answer: item.meaningVi }; });
  lesson.patterns.forEach((item, index) => { key[`day-${day}-deep-pattern-${index}`] = { type: 'multiple-choice', answer: item.meaningVi }; });
  lesson.listening.forEach((item) => { key[item.id] = { type: 'listen-and-choose', answer: item.answer }; });
  lesson.speaking.forEach((item) => { key[item.id] = { type: 'speaking-repeat', answer: item.text }; });
  lesson.quiz.forEach((item) => { key[item.id] = { type: item.type, answer: item.answer, selfCheckOnly: item.selfCheckOnly, speakText: item.speakText }; });
  lesson.picturePrompts?.forEach((item) => { key[item.id] = { type: 'picture-response', answer: item.answer }; });
  lesson.review.remember.forEach((_, index) => { key[`day-${day}-deep-review-${index}`] = { type: 'free-response', answer: '' }; });
  key[`day-${day}-mission-boss`] = { type: 'free-response', answer: '' };
  return key;
}

async function assertOneBubbleLost(page: import('playwright').Page, day: number, heartsBefore: number) {
  const heartsAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
  if (heartsAfter !== Math.max(0, heartsBefore - 1)) throw new Error(`Day ${day}: a wrong scored answer should remove one bubble (${heartsBefore} → ${heartsAfter}).`);
  await page.getByTestId('learning-hearts-count').getByText(`${heartsAfter}/5`).waitFor({ state: 'visible', timeout: 3000 });
  // Restore lives between independent retry checks so the QA itself does not lock the lesson.
  await page.evaluate(() => {
    const key = 'p-english:daily-hearts';
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...state, heartsLeft: 5, lastUpdatedAt: new Date().toISOString(), nextRecoveryAt: undefined }));
    window.dispatchEvent(new Event('p-english:hearts-updated'));
  });
  await page.getByTestId('learning-hearts-count').getByText('5/5').waitFor({ state: 'visible', timeout: 3000 });
}

async function assertResolvedFirstAttempt(page: import('playwright').Page, day: number, challengeId: string, wrongAnswer: string) {
  const saved = await page.evaluate(({ id, targetDay }) => {
    const progress = JSON.parse(localStorage.getItem('penglish-foundation48-progress-v1') || '{}');
    const dayProgress = progress.days?.[targetDay] || {};
    const mistake = dayProgress.mistakes?.find((item: { challengeId?: string }) => item.challengeId === id);
    return { result: dayProgress.challengeResults?.[id], mistake };
  }, { id: challengeId, targetDay: day });
  if (saved.result?.firstAttemptCorrect !== false || normalize(saved.result?.firstAttemptAnswer ?? '') !== normalize(wrongAnswer) || saved.result?.correct !== true || saved.mistake?.resolved !== true) {
    throw new Error(`Day ${day}: retry did not preserve its wrong first attempt and resolve the review item. Saved=${JSON.stringify(saved)}`);
  }
}

async function chooseExactOption(challenge: ReturnType<import('playwright').Page['locator']>, answer: string) {
  const options = challenge.locator('[data-testid^="foundation48-answer-option-"]');
  const labels = await options.allTextContents();
  const index = labels.findIndex((label) => normalize(label) === normalize(answer));
  if (index < 0) throw new Error(`Correct choice was not rendered. Expected "${answer}", options: ${labels.join(' | ')}`);
  await options.nth(index).click();
}

async function chooseSentenceTokens(challenge: ReturnType<import('playwright').Page['locator']>, words: string[], day: number, challengeId: string) {
  for (const word of words) {
    const tokens = challenge.locator('[data-testid="foundation48-token"]:not(:disabled)');
    const labels = await tokens.allTextContents();
    const index = labels.findIndex((label) => normalize(label) === normalize(word));
    if (index < 0) throw new Error(`Day ${day}, ${challengeId}: token "${word}" not found. Available: ${labels.join(' | ')}`);
    await tokens.nth(index).click();
  }
}

async function answerChallenge(page: import('playwright').Page, day: number, key: Record<string, { type: string; answer: string; selfCheckOnly?: boolean; speakText?: string }>, verifiedInteractions: string[]) {
  const challenge = page.locator('[data-testid^="foundation48-challenge-"]').first();
  const challengeId = await challenge.getAttribute('data-challenge-id');
  if (!challengeId) throw new Error(`Day ${day}: active challenge has no stable ID.`);
  const expected = key[challengeId];
  if (!expected) throw new Error(`Day ${day}: no authored answer mapping for challenge ${challengeId}.`);
  const feedback = page.getByTestId('foundation48-challenge-feedback');
  if (expected.speakText && !verifiedInteractions.includes('day20-number-dictation-audio-playback')) {
    const speak = challenge.getByRole('button', { name: 'Nghe số đọc mẫu' });
    await speak.waitFor({ state: 'visible', timeout: 3000 });
    mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, 'foundation48-day20-number-dictation-mobile.png') });
    await page.evaluate(`(() => Object.defineProperty(window.speechSynthesis, 'speak', { configurable: true, value: function(utterance) { window.__foundation48QaSpoken?.push(utterance.text); } }))()`);
    await speak.click();
    const spoken = await page.evaluate(() => (window as Window & { __foundation48QaSpoken?: string[] }).__foundation48QaSpoken ?? []);
    if (!spoken.includes(expected.speakText)) throw new Error(`Day ${day}, ${challengeId}: number dictation did not read the target aloud. Spoken=${JSON.stringify(spoken)}`);
    verifiedInteractions.push('day20-number-dictation-audio-playback');
  }
  if (expected.selfCheckOnly) {
    const audio = challenge.getByTestId('foundation48-source-audio-player').locator('audio');
    const audioUrl = await audio.getAttribute('src');
    if (!audioUrl || !audioUrl.endsWith(`/assets/foundation48/audio/day-21/${challengeId.includes('number-choice') ? '01-1.mp3' : challengeId.includes('number-dictation') ? '02-2.mp3' : challengeId.includes('phone-dictation') ? '03-3.mp3' : challengeId.includes('letter-choice') ? '04-4.mp3' : challengeId.includes('letter-dictation') ? '05-5.mp3' : '06-6.mp3'}`)) {
      throw new Error(`Day 21, ${challengeId}: source audio mapping is wrong. src=${audioUrl}`);
    }
    if (!verifiedInteractions.includes('day21-source-audio-mobile-screenshot')) {
      mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({ path: path.join(screenshotDir, 'foundation48-day21-source-audio-mobile.png') });
      verifiedInteractions.push('day21-source-audio-mobile-screenshot');
    }
    const response = await page.request.head(new URL(audioUrl, page.url()).toString());
    if (!response.ok()) throw new Error(`Day 21, ${challengeId}: mapped source audio returned HTTP ${response.status()}.`);
    const heartsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
    if (expected.type === 'multiple-choice') {
      await challenge.locator('[data-testid^="foundation48-answer-option-"]').first().click();
    } else if (expected.type === 'fill-blank') {
      await challenge.getByTestId('foundation48-fill-answer').fill(challengeId.includes('phone') ? '0123 456 789' : challengeId.includes('name') ? 'Alex Morgan' : challengeId.includes('letter') ? 'A' : '42');
      await challenge.getByRole('button', { name: 'Lưu lượt nghe' }).click();
    } else {
      throw new Error(`Day 21, ${challengeId}: unsupported self-check interaction ${expected.type}.`);
    }
    await feedback.waitFor({ state: 'visible', timeout: 5000 });
    if (!/chưa được kiểm chứng|không tính điểm/i.test(await feedback.innerText())) throw new Error(`Day 21, ${challengeId}: the uncertain answer was not clearly marked as unscored.`);
    const saved = await page.evaluate(({ id, targetDay }) => {
      const progress = JSON.parse(localStorage.getItem('penglish-foundation48-progress-v1') || '{}');
      return { result: progress.days?.[targetDay]?.challengeResults?.[id], hearts: JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft };
    }, { id: challengeId, targetDay: day });
    if (saved.result?.correct !== null || saved.result?.scoreEligible !== false || saved.hearts !== heartsBefore) {
      throw new Error(`Day 21, ${challengeId}: uncertain self-check changed score or hearts. Result=${JSON.stringify(saved)} heartsBefore=${heartsBefore}`);
    }
    verifiedInteractions.push('day21-source-self-check-remains-unscored-and-no-heart-cost');
    return { challengeId, type: expected.type };
  }
  let answeredWithListeningRetry = false;

  const shouldVerifyAudioFallback = day === 1 || (day === 48 && !verifiedInteractions.includes('stage8-speech-synthesis-fallback'));
  if (shouldVerifyAudioFallback && expected.type === 'listen-and-choose') {
    await page.evaluate(`(() => { Object.defineProperty(window.speechSynthesis, 'speak', { configurable: true, value: function() { throw new Error('simulated no-audio output'); } }); })()`);
    const speakButton = challenge.getByRole('button', { name: 'Nghe mẫu' });
    await speakButton.click();
    const speechStatus = challenge.getByTestId('foundation48-speech-unavailable');
    await speechStatus.waitFor({ state: 'visible', timeout: 3000 }).catch(async () => {
      const api = await page.evaluate(() => ({ speech: typeof window.speechSynthesis, utterance: typeof window.SpeechSynthesisUtterance }));
      throw new Error(`Day ${day}: missing no-speech-synthesis fallback. count=${await speechStatus.count()}; api=${JSON.stringify(api)}; Challenge=${(await challenge.innerText()).slice(-500)}`);
    });
    mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, day === 48 ? 'foundation48-stage8-speech-fallback-mobile.png' : 'foundation48-speech-fallback-mobile.png'), fullPage: true });
    verifiedInteractions.push(day === 48 ? 'stage8-speech-synthesis-fallback' : 'speech-synthesis-unavailable-fallback');
    await page.evaluate(`(() => {
      Object.defineProperty(window.speechSynthesis, 'cancel', { configurable: true, value: function() {} });
      Object.defineProperty(window.speechSynthesis, 'speak', { configurable: true, value: function(utterance) { window.__foundation48QaSpoken?.push(utterance.text); } });
    })()`);
    await speakButton.click();
    const spoken = await page.evaluate(() => (window as Window & { __foundation48QaSpoken?: string[] }).__foundation48QaSpoken ?? []);
    if (!spoken.length) {
      const apiState = await page.evaluate(() => ({ speechSynthesis: typeof window.speechSynthesis, utterance: typeof window.SpeechSynthesisUtterance, fallbackStillVisible: Boolean(document.querySelector('[data-testid="foundation48-speech-unavailable"]')) }));
      throw new Error(`Day ${day}: the listening sample did not call speech synthesis. API=${JSON.stringify(apiState)}`);
    }
    verifiedInteractions.push(day === 48 ? 'stage8-speech-synthesis-playback' : 'speech-synthesis-playback-request');
  }

  if (expected.type === 'multiple-choice' || expected.type === 'listen-and-choose') {
    if (expected.type === 'multiple-choice' && !verifiedInteractions.includes('multiple-choice-retry-keeps-first-attempt-score')) {
      const options = challenge.locator('[data-testid^="foundation48-answer-option-"]');
      const labels = await options.allTextContents();
      const wrongIndex = labels.findIndex((label) => normalize(label) !== normalize(expected.answer));
      const correctIndex = labels.findIndex((label) => normalize(label) === normalize(expected.answer));
      if (wrongIndex < 0 || correctIndex < 0) throw new Error(`Day ${day}, ${challengeId}: the multiple-choice retry check needs both a distractor and the authored answer. Expected="${expected.answer}" options=${JSON.stringify(labels)}`);
      const wrongAnswer = labels[wrongIndex].trim();
      const heartsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
      await options.nth(wrongIndex).click();
      await feedback.waitFor({ state: 'visible', timeout: 5000 });
      if (!/Chưa đúng/i.test(await feedback.innerText())) throw new Error(`Day ${day}: a wrong multiple-choice answer was not reported as incorrect.`);
      await challenge.getByTestId('foundation48-challenge-hint').waitFor({ state: 'visible', timeout: 3000 });
      const heartsAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
      if (heartsAfter !== Math.max(0, heartsBefore - 1)) throw new Error(`Day ${day}: wrong answer should remove one bubble (${heartsBefore} → ${heartsAfter}).`);
      await page.getByTestId('learning-hearts-count').getByText(`${heartsAfter}/5`).waitFor({ state: 'visible', timeout: 3000 });
      await options.nth(correctIndex).click();
      await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Đúng rồi'));
      const saved = await page.evaluate((id) => {
        const progress = JSON.parse(localStorage.getItem('penglish-foundation48-progress-v1') || '{}');
        const dayProgress = progress.days?.[Number(id.match(/day-(\d+)/)?.[1])] || {};
        const mistake = dayProgress.mistakes?.find((item: { challengeId?: string }) => item.challengeId === id);
        return { result: dayProgress.challengeResults?.[id], mistake };
      }, challengeId);
      if (saved.result?.firstAttemptCorrect !== false || saved.result?.firstAttemptAnswer !== wrongAnswer || saved.result?.correct !== true || saved.mistake?.resolved !== true) {
        throw new Error(`Day ${day}: multiple-choice retry did not preserve the first attempt and resolve the mistake. Saved=${JSON.stringify(saved)}`);
      }
      verifiedInteractions.push('multiple-choice-retry-keeps-first-attempt-score');
      answeredWithListeningRetry = true;
    }
    if (expected.type === 'listen-and-choose' && !verifiedInteractions.includes('listening-retry-keeps-first-attempt-score')) {
      const options = challenge.locator('[data-testid^="foundation48-answer-option-"]');
      const labels = await options.allTextContents();
      const wrongIndex = labels.findIndex((label) => normalize(label) !== normalize(expected.answer));
      const correctIndex = labels.findIndex((label) => normalize(label) === normalize(expected.answer));
      if (wrongIndex < 0 || correctIndex < 0) throw new Error(`Day ${day}: listening retry needs both a distractor and the authored answer.`);
      const wrongAnswer = labels[wrongIndex].trim();
      const heartsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
      await options.nth(wrongIndex).click();
      await feedback.waitFor({ state: 'visible', timeout: 5000 });
      if (!/Chưa khớp/i.test(await feedback.innerText())) throw new Error(`Day ${day}: a wrong listening choice was not reported as incorrect.`);
      await challenge.getByTestId('foundation48-challenge-hint').waitFor({ state: 'visible', timeout: 3000 });
      await assertOneBubbleLost(page, day, heartsBefore);
      if (day === 48) {
        mkdirSync(screenshotDir, { recursive: true });
        await page.screenshot({ path: path.join(screenshotDir, 'foundation48-stage8-listening-wrong-answer-mobile.png'), fullPage: true });
      }
      await options.nth(correctIndex).click();
      await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Đúng rồi'));
      await assertResolvedFirstAttempt(page, day, challengeId, wrongAnswer);
      verifiedInteractions.push('listening-retry-keeps-first-attempt-score');
      answeredWithListeningRetry = true;
    }
    if (!answeredWithListeningRetry) await chooseExactOption(challenge, expected.answer);
  } else if (expected.type === 'fill-blank') {
    const answerInput = challenge.getByTestId('foundation48-fill-answer');
    if (!verifiedInteractions.includes('fill-blank-retry-keeps-first-attempt-score')) {
      const heartsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
      await answerInput.fill('codex-intentional-wrong-answer');
      await answerInput.press('Enter');
      await feedback.waitFor({ state: 'visible', timeout: 5000 });
      if (!/Chưa đúng/i.test(await feedback.innerText())) throw new Error(`Day ${day}: a wrong fill-blank answer was not reported as incorrect.`);
      await challenge.getByTestId('foundation48-challenge-hint').waitFor({ state: 'visible', timeout: 3000 });
      await assertOneBubbleLost(page, day, heartsBefore);
      if (day === 48) {
        mkdirSync(screenshotDir, { recursive: true });
        await page.screenshot({ path: path.join(screenshotDir, 'foundation48-stage8-wrong-answer-mobile.png'), fullPage: true });
      }
      verifiedInteractions.push('fill-blank-wrong-answer-shows-hint-and-loses-one-bubble');
    }
    await answerInput.fill(expected.answer);
    const verifyKeyboardSubmit = day === 1 || (day >= 39 && !verifiedInteractions.includes('stage8-enter-submits-fill-blank'));
    if (verifyKeyboardSubmit) await challenge.getByTestId('foundation48-fill-answer').press('Enter');
    else await challenge.getByRole('button', { name: 'Poo xem giúp' }).click();
    if (!verifiedInteractions.includes('fill-blank-retry-keeps-first-attempt-score')) {
      await feedback.waitFor({ state: 'visible', timeout: 5000 });
      await assertResolvedFirstAttempt(page, day, challengeId, 'codex-intentional-wrong-answer');
      verifiedInteractions.push('fill-blank-retry-keeps-first-attempt-score');
    }
  } else if (expected.type === 'picture-response') {
    const answerInput = challenge.getByTestId('foundation48-picture-answer');
    if ([3, 4, 13, 16].includes(day) && !verifiedInteractions.includes(`day-${day}-picture-response-retry-keeps-first-attempt-score`)) {
      const wrongAnswer = 'This is intentionally incorrect.';
      const heartsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
      await answerInput.fill(wrongAnswer);
      await answerInput.press('Enter');
      await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Câu chưa khớp với tranh'));
      await challenge.getByTestId('foundation48-challenge-hint').waitFor({ state: 'visible', timeout: 3000 });
      await assertOneBubbleLost(page, day, heartsBefore);
      await answerInput.fill(expected.answer);
      await answerInput.press('Enter');
      await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Đúng rồi'));
      await assertResolvedFirstAttempt(page, day, challengeId, wrongAnswer);
      verifiedInteractions.push(`day-${day}-picture-response-retry-keeps-first-attempt-score`);
      answeredWithListeningRetry = true;
    }
    if (!answeredWithListeningRetry) {
    await answerInput.fill(expected.answer);
    await answerInput.press('Enter');
    await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Đúng rồi'));
    }
  } else if (expected.type === 'sentence-order') {
    const targetWords = expected.answer.split(/\s+/);
    if (!verifiedInteractions.includes('sentence-order-retry-keeps-first-attempt-score')) {
      const wrongWords = [...targetWords].reverse();
      const wrongAnswer = wrongWords.join(' ');
      if (normalize(wrongAnswer) === normalize(expected.answer)) throw new Error(`Day ${day}, ${challengeId}: the authored sentence is symmetrical; cannot create a wrong ordering.`);
      const heartsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
      await chooseSentenceTokens(challenge, wrongWords, day, challengeId);
      await challenge.getByTestId('foundation48-sentence-check').click();
      await feedback.waitFor({ state: 'visible', timeout: 5000 });
      if (!/Thử đặt chủ ngữ trước/i.test(await feedback.innerText())) throw new Error(`Day ${day}: a wrong sentence order did not receive a correction hint.`);
      await challenge.getByTestId('foundation48-challenge-hint').waitFor({ state: 'visible', timeout: 3000 });
      await assertOneBubbleLost(page, day, heartsBefore);
      await challenge.getByRole('button', { name: 'Làm lại' }).click();
      await chooseSentenceTokens(challenge, targetWords, day, challengeId);
      await challenge.getByTestId('foundation48-sentence-check').click();
      await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Đúng rồi'));
      await assertResolvedFirstAttempt(page, day, challengeId, wrongAnswer);
      verifiedInteractions.push('sentence-order-retry-keeps-first-attempt-score');
    } else {
      await chooseSentenceTokens(challenge, targetWords, day, challengeId);
      await challenge.getByTestId('foundation48-sentence-check').click();
    }
  } else if (expected.type === 'speaking-repeat') {
    const shouldVerifySpeechRecognitionFallback = day === 1 || (day === 48 && !verifiedInteractions.includes('stage8-speech-recognition-fallback'));
    if (shouldVerifySpeechRecognitionFallback) {
      await challenge.getByRole('button', { name: 'Nói để Poo nghe' }).click();
      await feedback.waitFor({ state: 'visible', timeout: 5000 });
      if (!/chưa hỗ trợ nhận diện giọng nói/i.test(await feedback.innerText())) throw new Error(`Day ${day}: missing speech recognition fallback message.`);
      verifiedInteractions.push(day === 48 ? 'stage8-speech-recognition-fallback' : 'speech-recognition-unavailable-fallback');
      if (day === 48) {
        await page.evaluate(`(() => {
          function ThrowingSpeechRecognition() {}
          ThrowingSpeechRecognition.prototype.start = function() { throw new Error('simulated microphone permission failure'); };
          Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: ThrowingSpeechRecognition });
        })()`);
        await challenge.getByRole('button', { name: 'Nói để Poo nghe' }).click();
        await feedback.waitFor({ state: 'visible', timeout: 5000 });
        if (!/không thể bật micro/i.test(await feedback.innerText())) throw new Error('Day 48: synchronous microphone-start failure was not explained.');
        await challenge.getByRole('button', { name: 'Nói để Poo nghe' }).waitFor({ state: 'visible', timeout: 3000 });
        verifiedInteractions.push('stage8-microphone-start-failure-recovers');
        await page.evaluate(`(() => {
          function ErrorSpeechRecognition() {}
          ErrorSpeechRecognition.prototype.start = function() {
            const recognition = this;
            window.setTimeout(() => {
              recognition.onerror?.({ error: 'not-allowed' });
              recognition.onend?.();
            }, 0);
          };
          Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: ErrorSpeechRecognition });
        })()`);
        await challenge.getByRole('button', { name: 'Nói để Poo nghe' }).click();
        await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Kiểm tra quyền micro'));
        await challenge.getByRole('button', { name: 'Nói để Poo nghe' }).waitFor({ state: 'visible', timeout: 3000 });
        verifiedInteractions.push('stage8-microphone-permission-error-recovers');
      }
    }
    if (day === 48 && shouldVerifySpeechRecognitionFallback) {
      await challenge.getByTestId('foundation48-speaking-self-practiced').click();
      const saved = await page.evaluate((id) => {
        const progress = JSON.parse(localStorage.getItem('penglish-foundation48-progress-v1') || '{}');
        return progress.days?.[48]?.challengeResults?.[id];
      }, challengeId);
      if (saved?.scoreEligible !== false || saved?.firstAttemptCorrect !== null) throw new Error(`Day 48: self-marked speaking practice entered the scored-question total. Result=${JSON.stringify(saved)}`);
      verifiedInteractions.push('stage8-speaking-self-practice-excluded-from-score');
    } else if (day === 48 && verifiedInteractions.includes('stage8-speaking-self-practice-excluded-from-score') && !verifiedInteractions.includes('stage8-recognized-speech-retry-keeps-score-unscored')) {
      const scoreBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('penglish-foundation48-progress-v1') || '{}').days?.[48]?.score);
      await page.evaluate(`((targetAnswer) => {
        window.__foundation48SpeechResponses = ['not the requested English sentence', targetAnswer];
        function SequencedSpeechRecognition() {}
        SequencedSpeechRecognition.prototype.start = function() {
          const recognition = this;
          window.setTimeout(() => {
            const transcript = window.__foundation48SpeechResponses?.shift() || '';
            recognition.onresult?.({ resultIndex: 0, results: [[{ transcript }]] });
            recognition.onend?.();
          }, 0);
        };
        Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: SequencedSpeechRecognition });
      })(${JSON.stringify(expected.answer)})`);
      const speakButton = challenge.getByRole('button', { name: 'Nói để Poo nghe' });
      await speakButton.click();
      await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Poo chưa nghe rõ câu'));
      const heartsLeft = await page.evaluate(() => JSON.parse(localStorage.getItem('p-english:daily-hearts') || '{}').heartsLeft);
      await page.getByTestId('learning-hearts-count').getByText(`${heartsLeft}/5`).waitFor({ state: 'visible', timeout: 3000 });
      await speakButton.waitFor({ state: 'visible', timeout: 3000 });
      await speakButton.click();
      await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-challenge-feedback"]')?.textContent?.includes('Đúng rồi'));
      const saved = await page.evaluate((id) => {
        const progress = JSON.parse(localStorage.getItem('penglish-foundation48-progress-v1') || '{}');
        const dayProgress = progress.days?.[48] || {};
        return { result: dayProgress.challengeResults?.[id], score: dayProgress.score };
      }, challengeId);
      if (saved.result?.firstAttemptCorrect !== false || saved.result?.firstAttemptAnswer !== 'not the requested English sentence' || saved.result?.correct !== true || saved.result?.scoreEligible !== false) {
        throw new Error(`Day 48: speech retry did not preserve its unscored first attempt. Result=${JSON.stringify(saved.result)}`);
      }
      if (saved.score !== scoreBefore) throw new Error(`Day 48: recognized speech changed the quiz score (${scoreBefore} → ${saved.score}).`);
      verifiedInteractions.push('stage8-recognized-speech-wrong-answer-costs-bubble');
      verifiedInteractions.push('stage8-recognized-speech-retry-keeps-score-unscored');
    } else {
      await challenge.getByTestId('foundation48-speaking-self-practiced').click();
    }
  } else if (expected.type === 'free-response') {
    const response = challenge.getByTestId('foundation48-free-response');
    const phraseCard = challenge.locator('[data-testid^="foundation48-application-phrase-card-"]').first();
    if (await phraseCard.isVisible().catch(() => false)) {
      if (process.env.FOUNDATION48_QA_CAPTURE_APPLICATION === '1') {
        await page.screenshot({ path: path.join(screenshotDir, `foundation48-application-phrase-tiles-day${day}-mobile.png`) });
      }
      const phrase = (await phraseCard.innerText()).replace(/^\+\s*/, '').trim();
      await phraseCard.click();
      await page.waitForFunction((expected) => {
        const input = document.querySelector('[data-testid="foundation48-free-response"]');
        return input instanceof HTMLTextAreaElement && input.value.includes(expected);
      }, phrase, { timeout: 3000 }).catch(async () => {
        const actual = await response.inputValue();
        throw new Error(`Day ${day} application phrase card did not populate the response (expected ${JSON.stringify(phrase)}, got ${JSON.stringify(actual)}).`);
      });
      await response.fill(`${phrase}\nI can use this English in my daily life.`);
    } else {
      await response.fill('I can use this English in my daily life.');
    }
    await challenge.getByRole('button', { name: 'Lưu câu trả lời' }).click();
  } else {
    throw new Error(`Day ${day}, ${challengeId}: unsupported authored challenge type ${expected.type}.`);
  }

  await feedback.waitFor({ state: 'visible', timeout: 8000 });
  const message = await feedback.innerText();
  if (/Chưa đúng|chưa nghe rõ/i.test(message)) throw new Error(`Day ${day}, ${challengeId}: authored correct answer was rejected: ${message}`);
  const verifyKeyboardContinue = expected.type === 'fill-blank' && (day === 1 || (day >= 39 && !verifiedInteractions.includes('stage8-enter-submits-fill-blank')));
  if (verifyKeyboardContinue) {
    await challenge.getByTestId('foundation48-fill-answer').press('Enter');
    await feedback.waitFor({ state: 'hidden', timeout: 5000 });
    verifiedInteractions.push(day === 1 ? 'enter-submits-and-continues-fill-blank' : 'stage8-enter-submits-fill-blank');
  }
  return { challengeId, type: expected.type };
}

async function setupPage(browser: Awaited<ReturnType<typeof chromium.launch>>, day: number) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript((targetDay: number) => {
    if (sessionStorage.getItem('foundation48-qa-initialized') !== '1') {
      localStorage.clear();
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      localStorage.setItem('p-english:daily-hearts', JSON.stringify({ maxHearts: 5, heartsLeft: 5, wrongCountToday: 0, vietnamDayKey: today, lastUpdatedAt: new Date().toISOString() }));
      localStorage.setItem('penglish-foundation48-progress-v1', JSON.stringify({ schemaVersion: 1, days: { [targetDay]: { started: false, completed: false, completedSteps: [], challengeResults: {}, mistakes: [] } } }));
      sessionStorage.setItem('foundation48-qa-initialized', '1');
      (window as Window & { __foundation48QaSpoken?: string[] }).__foundation48QaSpoken = [];
      delete (window as Window & { SpeechRecognition?: unknown }).SpeechRecognition;
      delete (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    }
  }, day);
  return { context, page: await context.newPage() };
}

async function runDay(browser: Awaited<ReturnType<typeof chromium.launch>>, day: number) {
  const { context, page } = await setupPage(browser, day);
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedResponses: string[] = [];
  const answered: Array<{ challengeId: string; type: string; hasPicture: boolean }> = [];
  const verifiedInteractions: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400 && !response.url().includes('supabase.co')) failedResponses.push(`${response.status()} ${response.url()}`); });
  const key = buildAnswerKey(day);
  try {
    await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/${day}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 });
    await page.waitForFunction(() => !/Đang mở vùng học|Loading/i.test(document.body.innerText), null, { timeout: 30000 });
    const flowOverview = page.getByTestId('foundation48-three-things-card');
    const flowOverviewText = await flowOverview.textContent() ?? '';
    for (const label of ['5 thử thách chính', 'Từ vựng', 'Mẫu câu', 'Nghe', 'Nói', 'Quiz', 'Nhiệm vụ thực tế']) {
      if (!flowOverviewText.includes(label)) throw new Error(`Day ${day}: the journey overview is missing “${label}”.`);
    }
    const mobileHeroText = await page.getByTestId('foundation48-lesson-hero').innerText();
    if (!mobileHeroText.includes('5 thử thách chính') || !mobileHeroText.includes('nhiệm vụ thực tế')) throw new Error(`Day ${day}: the visible lesson intro does not describe the actual core flow.`);
    const flowPhase = page.getByTestId('foundation48-flow-phase');
    const flowProgress = page.getByTestId('foundation48-flow-progress-value');
    if (await flowPhase.innerText() !== 'Nhiệm vụ chính' || await flowProgress.innerText() !== '1/12') {
      throw new Error(`Day ${day}: main-quest progress should start at 1/12 and exclude optional bonus items. Phase=${await flowPhase.innerText()} progress=${await flowProgress.innerText()}`);
    }
    verifiedInteractions.push('journey-overview-matches-five-core-plus-mission');
    verifiedInteractions.push('main-quest-progress-excludes-optional-bonus');
    let completed = false;
    for (let guard = 0; guard < 180; guard += 1) {
      const body = await page.locator('body').innerText();
      const bonusStart = page.getByTestId('foundation48-bonus-start');
      if (await bonusStart.isVisible().catch(() => false)) {
        if (await flowPhase.innerText() !== 'Nhiệm vụ chính' || await flowProgress.innerText() !== '12/12') {
          throw new Error(`Day ${day}: the completed core quest should show 12/12 before the optional bonus. Phase=${await flowPhase.innerText()} progress=${await flowProgress.innerText()}`);
        }
        await bonusStart.click();
        const bonusValue = page.getByTestId('foundation48-flow-progress-value');
        await page.waitForFunction(() => document.querySelector('[data-testid="foundation48-flow-phase"]')?.textContent?.includes('Vòng thưởng') ?? false, null, { timeout: 5000 });
        const firstBonusProgress = await bonusValue.innerText();
        if (!/^1\/\d+$/.test(firstBonusProgress)) throw new Error(`Day ${day}: optional bonus progress should have its own counter starting at 1/N, got ${firstBonusProgress}.`);
        continue;
      }
      const isDaySaved = await page.evaluate((targetDay) => {
        try {
          const progress = JSON.parse(localStorage.getItem('penglish-foundation48-progress-v1') || '{}');
          return progress.days?.[targetDay]?.completed === true;
        } catch {
          return false;
        }
      }, day);
      if (isDaySaved) {
        await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/${day}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 });
        const completionPanel = page.getByTestId('foundation48-completion-panel');
        if (!await completionPanel.isVisible().catch(() => false)) {
          const savedState = await page.evaluate(() => localStorage.getItem('penglish-foundation48-progress-v1'));
          throw new Error(`Day ${day}: saved progress did not reopen the completion panel. URL=${page.url()} progress=${savedState} body=${(await page.locator('body').innerText()).slice(-700)}`);
        }
        completed = true;
        break;
      }

      const challenge = page.locator('[data-testid^="foundation48-challenge-"]').first();
      if (await challenge.isVisible().catch(() => false)) {
        const activeChallengeId = await challenge.getAttribute('data-challenge-id');
        if (day === 14 && activeChallengeId.startsWith('day-14-source-') && !verifiedInteractions.includes('day-14-source-quiz-mobile-screenshot')) {
          mkdirSync(screenshotDir, { recursive: true });
          await page.screenshot({ path: path.join(screenshotDir, 'foundation48-day14-source-quiz-mobile.png') });
          verifiedInteractions.push('day-14-source-quiz-mobile-screenshot');
        }
        if (day === 15 && activeChallengeId === 'day-15-source-choice-10' && !verifiedInteractions.includes('day-15-source-quiz-mobile-screenshot')) {
          mkdirSync(screenshotDir, { recursive: true });
          await page.screenshot({ path: path.join(screenshotDir, 'foundation48-day15-source-quiz-mobile.png') });
          verifiedInteractions.push('day-15-source-quiz-mobile-screenshot');
        }
        if (day === 3 && activeChallengeId === 'day-3-picture-5' && !verifiedInteractions.includes('day-3-pink-handbag-source-image-mobile-screenshot')) {
          const image = page.getByTestId('foundation48-question-image');
          const alt = await image.getAttribute('aria-label');
          if (!alt?.toLowerCase().includes('pink handbag')) throw new Error(`Day 3: source-aligned pink handbag image is missing. alt=${alt}`);
          const imageSrc = await image.locator('img').getAttribute('src');
          if (!imageSrc?.endsWith('/day-03-handbag.webp')) throw new Error(`Day 3: isolated handbag asset was not used. src=${imageSrc}`);
          mkdirSync(screenshotDir, { recursive: true });
          await page.screenshot({ path: path.join(screenshotDir, 'foundation48-day3-pink-handbag-source-image-mobile.png'), fullPage: true });
          verifiedInteractions.push('day-3-pink-handbag-source-image-mobile-screenshot');
        }
        if ([3, 4, 13, 16].includes(day) && await page.getByTestId('foundation48-question-image').isVisible().catch(() => false) && !verifiedInteractions.includes(`day-${day}-picture-challenge-mobile-screenshot`)) {
          mkdirSync(screenshotDir, { recursive: true });
          await page.screenshot({ path: path.join(screenshotDir, `foundation48-day${day}-picture-challenge-mobile.png`), fullPage: true });
          verifiedInteractions.push(`day-${day}-picture-challenge-mobile-screenshot`);
        }
        const answeredChallenge = await answerChallenge(page, day, key, verifiedInteractions);
        answered.push({ ...answeredChallenge, hasPicture: await page.getByTestId('foundation48-question-image').isVisible().catch(() => false) });
      } else if (day === 1 && await page.getByTestId('foundation48-listen-first').isVisible().catch(() => false)) {
        await page.evaluate(`(() => { Object.defineProperty(window.speechSynthesis, 'speak', { configurable: true, value: function() { throw new Error('simulated no-audio output'); } }); })()`);
        await page.getByTestId('foundation48-listen-main').click();
        if (!await page.getByTestId('foundation48-speech-unavailable').isVisible().catch(() => false)) throw new Error('Day 1: listening overview did not explain unavailable text-to-speech.');
        await page.getByTestId('foundation48-listen-done').click();
        verifiedInteractions.push('listen-overview-self-confirmation-after-audio-fallback');
        const previousStep = await page.locator('[data-testid^="foundation48-step-"]').first().getAttribute('data-testid');
        await page.getByTestId('foundation48-mobile-step-actions').getByRole('button', { name: 'Tiếp tục' }).click();
        await page.waitForFunction((previous) => document.querySelector('[data-testid^="foundation48-step-"]')?.getAttribute('data-testid') !== previous, previousStep, { timeout: 5000 });
      } else if (await page.getByTestId('foundation48-complete-day').isVisible().catch(() => false)) {
        await page.getByTestId('foundation48-complete-day').click();
      } else if (await page.getByTestId('foundation48-mobile-complete-day').isVisible().catch(() => false)) {
        await page.getByTestId('foundation48-mobile-complete-day').click();
      } else {
        const next = page.getByTestId('foundation48-mobile-step-actions').getByRole('button', { name: 'Tiếp tục' });
        if (!await next.isVisible().catch(() => false)) throw new Error(`Day ${day}: no challenge or continue control found at iteration ${guard}.`);
        if (await next.isDisabled()) throw new Error(`Day ${day}: continue is disabled on a non-challenge step ${await page.locator('[data-testid^="foundation48-step-"]').first().getAttribute('data-testid')}.`);
        const previousStep = await page.locator('[data-testid^="foundation48-step-"]').first().getAttribute('data-testid');
        await next.click();
        await page.waitForFunction((previous) => document.querySelector('[data-testid^="foundation48-step-"]')?.getAttribute('data-testid') !== previous, previousStep, { timeout: 5000 });
      }

      const continueButton = page.getByTestId('foundation48-mobile-step-actions').getByRole('button', { name: 'Tiếp tục' });
      if (await continueButton.isVisible().catch(() => false) && await page.getByTestId('foundation48-challenge-feedback').isVisible().catch(() => false)) await continueButton.click();
    }
    if (!completed) {
      completed = /Đã lưu ngày \d+|Đã hoàn thành 48\/48 ngày|Hoàn thành Ngày \d+\b/.test(await page.locator('body').innerText());
    }
    if (!completed) {
      const finalBody = await page.locator('body').innerText();
      const activeStep = await page.locator('[data-testid^="foundation48-step-"]').first().getAttribute('data-testid').catch(() => 'step-unavailable');
      throw new Error(`Day ${day}: did not reach the saved completion state after ${answered.length} challenges. Active=${activeStep}. Body=${finalBody.slice(-800)}`);
    }
    const coreChallengeIds = answered.slice(0, 5).map((item) => item.challengeId);
    const coreQuizIds = new Set([
      ...(lessonBank[day]?.quiz.filter((item) => item.type !== 'speaking-repeat' && item.type !== 'free-response').map((item) => item.id) ?? []),
      ...(lessonBank[day]?.picturePrompts ?? []).map((item) => item.id),
    ]);
    if (!coreChallengeIds.some((challengeId) => coreQuizIds.has(challengeId))) {
      throw new Error(`Day ${day}: the core flow did not include a score-eligible quiz item. Core=${coreChallengeIds.join(', ')}`);
    }
    if ([3, 4, 13, 16].includes(day) && answered.filter((item) => item.hasPicture).length !== 5) {
      throw new Error(`Day ${day}: expected 5 image-backed challenges, found ${answered.filter((item) => item.hasPicture).length}.`);
    }
    if ([3, 4, 13, 16].includes(day) && !answered.slice(0, 5).some((item) => item.hasPicture)) {
      throw new Error(`Day ${day}: the core flow did not include an image-backed challenge.`);
    }
    if (day === 21) {
      const sourceAnswered = answered.filter((item) => item.challengeId.startsWith('day-21-source-'));
      const sourceIds = new Set(sourceAnswered.map((item) => item.challengeId));
      if (sourceAnswered.length !== 31 || sourceIds.size !== 31) throw new Error(`Day 21: expected all 31 source activities once across core+bonus; found ${sourceAnswered.length} (unique ${sourceIds.size}).`);
      if (!verifiedInteractions.includes('day21-source-self-check-remains-unscored-and-no-heart-cost')) throw new Error('Day 21: no source activity verified the unscored self-check/no-heart behavior.');
    }
    if (coreChallengeIds.includes(`day-${day}-speak-review`)) {
      throw new Error(`Day ${day}: the unscored speaking review was incorrectly selected as the core quiz item.`);
    }
    if (day === 48 && verifiedInteractions.includes('fill-blank-retry-keeps-first-attempt-score')) {
      const dailyScore = await page.getByTestId('foundation48-daily-score').innerText();
      if (/100%/.test(dailyScore)) throw new Error(`Day 48: the completion score ignored a wrong first attempt after retry. Score=${dailyScore}`);
      verifiedInteractions.push('stage8-completion-score-uses-first-attempt');
    }
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
    }));
    if (layout.overflow) throw new Error(`Day ${day}: horizontal overflow on mobile.`);
    if (layout.brokenImages.length) throw new Error(`Day ${day}: broken image(s): ${layout.brokenImages.join(', ')}`);
    if (answered.length && (day === days[0] || day === 24 || day === 48)) {
      mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({ path: path.join(screenshotDir, `foundation48-day${day}-interactive-complete-mobile.png`), fullPage: true });
    }
    if (consoleErrors.length || pageErrors.length || failedResponses.length) throw new Error(`Day ${day}: browser errors: ${JSON.stringify({ consoleErrors, pageErrors, failedResponses })}`);
    return { day, completed, challengeCount: answered.length, pictureChallengeCount: answered.filter((item) => item.hasPicture).length, challengeTypes: [...new Set(answered.map((item) => item.type))], verifiedInteractions, layout };
  } finally {
    await context.close();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results: Array<Record<string, unknown>> = [];
  const failures: Array<{ day: number; error: string }> = [];
  try {
    for (const [index, day] of days.entries()) {
      try { results.push(await runDay(browser, day)); }
      catch (error) { failures.push({ day, error: error instanceof Error ? error.message : String(error) }); }
      console.log(`[Foundation48 mobile flow] ${index + 1}/${days.length} · day ${day}`);
    }
  } finally {
    await browser.close();
  }
  const report = { generatedAt: new Date().toISOString(), baseUrl, dayCount: days.length, completedDays: results.length, challengeCount: results.reduce((sum, result) => sum + Number(result.challengeCount || 0), 0), results, failures, ok: failures.length === 0 && results.length === days.length };
  mkdirSync(outputDir, { recursive: true });
  const reportFile = days.length === 48 ? 'foundation48-all-days-interactive-qa.json' : 'foundation48-interactive-smoke-qa.json';
  writeFileSync(path.join(outputDir, reportFile), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ok: report.ok, completedDays: report.completedDays, dayCount: report.dayCount, challengeCount: report.challengeCount, failures, report: `reports/${reportFile}` }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

void main();
