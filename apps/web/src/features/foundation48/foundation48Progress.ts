import { markLearningLoopCompleted, recordLearningLoopActivity, recordLearningLoopMistake, resolveLearningLoopMistake, upsertLearningLoopWords } from '../../lib/p-english/learning-loop';
import type { Foundation48DeepLesson } from './foundation48DeepLessons';
import { getFoundation48CachedDeepLesson, getFoundation48DeepLesson } from './foundation48DeepLessonResolver';
import type { Foundation48Challenge, Foundation48MistakeItem, Foundation48ProgressDay, Foundation48ProgressState } from './foundation48Types';

const STORAGE_KEY = 'penglish-foundation48-progress-v1';
export const FOUNDATION48_PROGRESS_UPDATED_EVENT = 'penglish-foundation48-progress-updated';

const defaultState: Foundation48ProgressState = { days: {} };

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function todayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: string) => parts.find((value) => value.type === type)?.value || '00';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function previousDayKey(dayKey: string) {
  const date = new Date(`${dayKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function normalizeDay(value: Foundation48ProgressDay | undefined): Foundation48ProgressDay {
  return {
    ...(value || {}),
    completedSteps: Array.isArray(value?.completedSteps) ? value.completedSteps : [],
    challengeResults: value?.challengeResults && typeof value.challengeResults === 'object' ? value.challengeResults : {},
    mistakes: Array.isArray(value?.mistakes) ? value.mistakes : [],
  };
}

function getNextStreak(current: Foundation48ProgressState) {
  const today = todayKey();
  if (current.lastStudiedDate === today) return current.streak || 1;

  if (current.lastStudiedDate === previousDayKey(today)) return (current.streak || 0) + 1;

  return 1;
}

export function getFoundation48Progress(): Foundation48ProgressState {
  const storage = getStorage();
  if (!storage) return defaultState;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Foundation48ProgressState;
    const days = Object.entries(parsed.days || {}).reduce<Record<number, Foundation48ProgressDay>>((acc, [key, value]) => {
      const dayNumber = Number(key);
      if (!Number.isFinite(dayNumber)) return acc;
      acc[dayNumber] = normalizeDay(value);
      return acc;
    }, {});
    return { lastDayOpened: parsed.lastDayOpened, days, streak: parsed.streak || 0, lastStudiedDate: parsed.lastStudiedDate };
  } catch {
    return defaultState;
  }
}

function saveFoundation48Progress(next: Foundation48ProgressState) {
  saveFoundation48ProgressSnapshot(next);
}

export function saveFoundation48ProgressSnapshot(next: Foundation48ProgressState) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(FOUNDATION48_PROGRESS_UPDATED_EVENT));
}

function upsertFoundation48WordsFromLesson(dayNumber: number, deepLesson?: Foundation48DeepLesson) {
  if (!deepLesson?.vocabulary.length) return;
  upsertLearningLoopWords(deepLesson.vocabulary.map((item) => ({
    id: `foundation48:day-${dayNumber}:word:${item.term.toLowerCase().replace(/\s+/g, '-')}`,
    term: item.term,
    meaningVi: item.meaningVi,
    example: item.example,
    source: 'foundation48',
    sourceId: `day-${dayNumber}`,
    cefrLevel: 'A1',
    topic: deepLesson.learnerTitle,
  })));
}

function syncFoundation48Words(dayNumber: number) {
  upsertFoundation48WordsFromLesson(dayNumber, getFoundation48CachedDeepLesson(dayNumber));
  void getFoundation48DeepLesson(dayNumber)
    .then((deepLesson) => upsertFoundation48WordsFromLesson(dayNumber, deepLesson))
    .catch(() => undefined);
}

function syncFoundation48Activity(dayNumber: number, xp = 3) {
  recordLearningLoopActivity('foundation48', `day-${dayNumber}`, xp);
  syncFoundation48Words(dayNumber);
}

function touchProgress(state: Foundation48ProgressState, dayNumber: number, day: Foundation48ProgressDay, learningActivity = true) {
  const now = new Date().toISOString();
  return {
    ...state,
    lastDayOpened: dayNumber,
    ...(learningActivity ? { lastStudiedDate: todayKey(), streak: getNextStreak(state) } : {}),
    days: {
      ...state.days,
      [dayNumber]: { ...day, started: true, ...(learningActivity ? { lastStudiedAt: now } : {}) },
    },
  };
}

export function getFoundation48DayProgress(dayNumber: number): Foundation48ProgressDay {
  return normalizeDay(getFoundation48Progress().days[dayNumber]);
}

export function markFoundation48Started(dayNumber: number) {
  const state = getFoundation48Progress();
  const current = normalizeDay(state.days[dayNumber]);
  const freshAttempt = !current.started && !current.completed && !current.completedSteps?.length && !Object.keys(current.challengeResults || {}).length;
  const exerciseSeed = current.exerciseSeed || (freshAttempt
    ? `f48-${dayNumber}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
    : `f48-${dayNumber}-legacy`);
  // Route mount remembers the day and seed but cannot advance the study streak.
  saveFoundation48Progress(touchProgress(state, dayNumber, { ...current, exerciseSeed }, false));
  syncFoundation48Words(dayNumber);
}

function saveSignedInFoundation48Day(dayNumber: number, day: Foundation48ProgressDay) {
  void import('./foundation48CloudProgress')
    .then(async ({ saveCloudFoundation48DayProgress }) => {
      const { supabase } = await import('../../lib/supabaseClient');
      if (!supabase) return;

      const session = await Promise.race([
        supabase.auth.getSession()
          .then(({ data }) => data.session ?? null)
          .catch(() => null),
        new Promise<null>((resolve) => {
          if (typeof window === 'undefined') return resolve(null);
          window.setTimeout(() => resolve(null), 2500);
        }),
      ]);

      const userId = session?.user?.id;
      if (!userId) return;
      await saveCloudFoundation48DayProgress(userId, { ...day, dayNumber });
    })
    .catch(() => undefined);
}

export function markFoundation48StepCompleted(dayNumber: number, stepId: string) {
  const state = getFoundation48Progress();
  const current = normalizeDay(state.days[dayNumber]);
  const completedSteps = new Set(current.completedSteps || []);
  const isFirstCompletion = !completedSteps.has(stepId);
  completedSteps.add(stepId);
  const nextDay = { ...current, completedSteps: Array.from(completedSteps) };
  saveFoundation48Progress(touchProgress(state, dayNumber, nextDay));
  saveSignedInFoundation48Day(dayNumber, nextDay);
  syncFoundation48Activity(dayNumber, isFirstCompletion ? 1 : 0);
}

export function recordFoundation48ChallengeResult(dayNumber: number, challenge: Foundation48Challenge, correct: boolean | null, answer: string) {
  const state = getFoundation48Progress();
  const current = normalizeDay(state.days[dayNumber]);
  const now = new Date().toISOString();
  const previousResult = current.challengeResults?.[challenge.id];
  const successRewarded = Boolean(previousResult?.successRewarded || (correct === true && previousResult?.correct !== true));
  const firstAttemptCorrect = previousResult && Object.prototype.hasOwnProperty.call(previousResult, 'firstAttemptCorrect')
    ? previousResult.firstAttemptCorrect
    : previousResult?.correct ?? correct;
  const firstAttemptAnswer = previousResult?.firstAttemptAnswer ?? previousResult?.answer ?? answer;
  const scoreEligible = previousResult?.scoreEligible ?? challenge.scoreEligible ?? challenge.type !== 'speaking-repeat';
  const challengeResults = {
    ...(current.challengeResults || {}),
    [challenge.id]: { challengeId: challenge.id, correct, answer, updatedAt: now, successRewarded, firstAttemptCorrect, firstAttemptAnswer, scoreEligible },
  };
  const existingMistakes = current.mistakes || [];
  const mistakeId = `${dayNumber}-${challenge.id}`;
  const previousMistake = existingMistakes.find((item) => item.id === mistakeId);
  const mistakes = correct !== false
    ? existingMistakes.map((item) => item.id === mistakeId ? { ...item, resolved: true } : item)
    : [
        ...existingMistakes.filter((item) => item.id !== mistakeId),
        {
          id: mistakeId,
          dayNumber,
          challengeId: challenge.id,
          challengeType: challenge.type,
          prompt: challenge.prompt,
          correctAnswer: challenge.answer,
          userAnswer: answer,
          explanation: challenge.explanation,
          attempts: (previousMistake?.attempts || 0) + 1,
          lastWrongAt: now,
          nextReviewAt: now,
          resolved: false,
        } satisfies Foundation48MistakeItem,
      ];
  const scoredResults = Object.values(challengeResults).filter((item) => item.scoreEligible !== false && (item.firstAttemptCorrect ?? item.correct) !== null);
  const total = scoredResults.length;
  const right = scoredResults.filter((item) => (item.firstAttemptCorrect ?? item.correct) === true).length;
  const score = total > 0 ? Math.round((right / total) * 100) : current.score;

  const nextDay = { ...current, challengeResults, mistakes, score };
  saveFoundation48Progress(touchProgress(state, dayNumber, nextDay));
  saveSignedInFoundation48Day(dayNumber, nextDay);
  // Award the success bonus once, even if the learner reopens or resubmits a challenge.
  // A first wrong attempt earns the retry encouragement once. Reopening an
  // already-scored challenge must not create an XP loop after its success bonus.
  const earnedXp = correct === true && !previousResult?.successRewarded
    ? 4
    : correct === false && !previousResult
      ? 1
      : 0;
  syncFoundation48Activity(dayNumber, earnedXp);
  if (correct === true) {
    resolveLearningLoopMistake(mistakeId);
  } else if (correct === false && challenge.type !== 'free-response') {
    recordLearningLoopMistake({
      id: mistakeId,
      source: 'foundation48',
      sourceId: `day-${dayNumber}`,
      type: challenge.type,
      prompt: challenge.prompt,
      correctAnswer: challenge.answer,
      userAnswer: answer,
      explanation: challenge.explanation,
      tags: [`day-${dayNumber}`, challenge.type],
    });
  }
}

export function markFoundation48Completed(dayNumber: number, stepIds: string[] = [], miniTestScore?: number) {
  const state = getFoundation48Progress();
  const current = normalizeDay(state.days[dayNumber]);
  const isFirstCompletion = !current.completed;
  const completedSteps = new Set([...(current.completedSteps || []), ...stepIds]);
  const nextDay = { ...current, started: true, completed: true, completedAt: new Date().toISOString(), completedSteps: Array.from(completedSteps), score: miniTestScore ?? current.score, miniTestScore: miniTestScore ?? current.miniTestScore };
  saveFoundation48Progress(touchProgress(state, dayNumber, nextDay));
  saveSignedInFoundation48Day(dayNumber, nextDay);
  if (isFirstCompletion) markLearningLoopCompleted('foundation48', `day-${dayNumber}`, 25);
  else syncFoundation48Activity(dayNumber, 0);
  syncFoundation48Words(dayNumber);
}

export function getFoundation48Mistakes() {
  const state = getFoundation48Progress();
  return Object.values(state.days)
    .flatMap((day) => normalizeDay(day).mistakes || [])
    .filter((mistake) => !mistake.resolved)
    .sort((a, b) => b.lastWrongAt.localeCompare(a.lastWrongAt));
}

export function getFoundation48ProgressSummary(totalDays = 48) {
  const state = getFoundation48Progress();
  const started = Object.values(state.days).filter((day) => day.started).length;
  const completed = Object.values(state.days).filter((day) => day.completed).length;
  const mistakes = getFoundation48Mistakes();
  return {
    ...state,
    started,
    completed,
    totalDays,
    mistakesDue: mistakes.length,
    streak: state.streak || 0,
    percent: totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0,
  };
}
