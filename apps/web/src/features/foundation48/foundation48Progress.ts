import { markLearningLoopCompleted, recordLearningLoopActivity, recordLearningLoopMistake, resolveLearningLoopMistake, upsertLearningLoopWords } from '../../lib/p-english/learning-loop';
import { foundation48DeepLessons } from './foundation48DeepLessons';
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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (current.lastStudiedDate === todayKey(yesterday)) return (current.streak || 0) + 1;

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
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(FOUNDATION48_PROGRESS_UPDATED_EVENT));
}

function syncFoundation48Words(dayNumber: number) {
  const deepLesson = foundation48DeepLessons[dayNumber];
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

function syncFoundation48Activity(dayNumber: number, xp = 3) {
  recordLearningLoopActivity('foundation48', `day-${dayNumber}`, xp);
  syncFoundation48Words(dayNumber);
}

function touchProgress(state: Foundation48ProgressState, dayNumber: number, day: Foundation48ProgressDay) {
  const now = new Date().toISOString();
  return {
    lastDayOpened: dayNumber,
    lastStudiedDate: todayKey(),
    streak: getNextStreak(state),
    days: {
      ...state.days,
      [dayNumber]: { ...day, started: true, lastStudiedAt: now },
    },
  };
}

export function getFoundation48DayProgress(dayNumber: number): Foundation48ProgressDay {
  return normalizeDay(getFoundation48Progress().days[dayNumber]);
}

export function markFoundation48Started(dayNumber: number) {
  const state = getFoundation48Progress();
  const current = normalizeDay(state.days[dayNumber]);
  saveFoundation48Progress(touchProgress(state, dayNumber, current));
  syncFoundation48Activity(dayNumber, 2);
}

export function markFoundation48StepCompleted(dayNumber: number, stepId: string) {
  const state = getFoundation48Progress();
  const current = normalizeDay(state.days[dayNumber]);
  const completedSteps = new Set(current.completedSteps || []);
  completedSteps.add(stepId);
  saveFoundation48Progress(touchProgress(state, dayNumber, { ...current, completedSteps: Array.from(completedSteps) }));
  syncFoundation48Activity(dayNumber, 1);
}

export function recordFoundation48ChallengeResult(dayNumber: number, challenge: Foundation48Challenge, correct: boolean, answer: string) {
  const state = getFoundation48Progress();
  const current = normalizeDay(state.days[dayNumber]);
  const now = new Date().toISOString();
  const challengeResults = {
    ...(current.challengeResults || {}),
    [challenge.id]: { challengeId: challenge.id, correct, answer, updatedAt: now },
  };
  const existingMistakes = current.mistakes || [];
  const mistakeId = `${dayNumber}-${challenge.id}`;
  const previousMistake = existingMistakes.find((item) => item.id === mistakeId);
  const mistakes = correct
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
  const total = Object.keys(challengeResults).length;
  const right = Object.values(challengeResults).filter((item) => item.correct).length;
  const score = total > 0 ? Math.round((right / total) * 100) : current.score;

  saveFoundation48Progress(touchProgress(state, dayNumber, { ...current, challengeResults, mistakes, score }));
  syncFoundation48Activity(dayNumber, correct ? 4 : 1);
  if (correct) {
    resolveLearningLoopMistake(mistakeId);
  } else {
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
  const completedSteps = new Set([...(current.completedSteps || []), ...stepIds]);
  saveFoundation48Progress(touchProgress(state, dayNumber, { ...current, started: true, completed: true, completedAt: new Date().toISOString(), completedSteps: Array.from(completedSteps), miniTestScore: miniTestScore ?? current.miniTestScore }));
  markLearningLoopCompleted('foundation48', `day-${dayNumber}`, 25);
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
