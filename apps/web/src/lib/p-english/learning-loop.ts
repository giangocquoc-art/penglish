import { LOCAL_PROGRESS_UPDATED_EVENT } from './local-progress';

export type LearningLoopMistakeType = 'multiple-choice' | 'fill-blank' | 'sentence-order' | 'listen-and-choose' | 'speaking-repeat' | 'listening-skipped' | 'shadowing-low-similarity' | 'speed-weak' | 'word-missed';

export type LearningLoopSource = 'foundation48' | 'interactive-lesson' | 'practice' | 'words' | 'shadowing' | 'english-speed';

export type LearningLoopMistakeRecord = {
  id: string;
  source: LearningLoopSource;
  sourceId: string;
  type: LearningLoopMistakeType;
  prompt: string;
  correctAnswer?: string;
  userAnswer?: string;
  explanation?: string;
  attempts: number;
  lastWrongAt: string;
  nextReviewAt: string;
  resolved: boolean;
  resolvedAt?: string;
  tags: string[];
};

export type LearningLoopWordRecord = {
  id: string;
  term: string;
  meaningVi: string;
  example?: string;
  source: LearningLoopSource;
  sourceId: string;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  topic?: string;
  mastery: number;
  favorite: boolean;
  weakCount: number;
  learnedAt: string;
  lastReviewedAt?: string;
};

export type LearningLoopActivityRecord = {
  id: string;
  source: LearningLoopSource;
  sourceId: string;
  xp: number;
  occurredAt: string;
};

export type LearningLoopState = {
  schemaVersion: 1;
  xp: number;
  streak: number;
  lastActiveDate?: string;
  completed: Record<string, string>;
  mistakes: Record<string, LearningLoopMistakeRecord>;
  words: Record<string, LearningLoopWordRecord>;
  activities: LearningLoopActivityRecord[];
  updatedAt: string;
};

export type LearningLoopWordInput = {
  id?: string;
  term: string;
  meaningVi: string;
  example?: string;
  source: LearningLoopSource;
  sourceId: string;
  cefrLevel?: LearningLoopWordRecord['cefrLevel'];
  topic?: string;
};

export type LearningLoopMistakeInput = {
  id: string;
  source: LearningLoopSource;
  sourceId: string;
  type: LearningLoopMistakeType;
  prompt: string;
  correctAnswer?: string;
  userAnswer?: string;
  explanation?: string;
  tags?: string[];
};

export const LEARNING_LOOP_STORAGE_KEY = 'penglish.learning.loop.v1';
export const LEARNING_LOOP_UPDATED_EVENT = 'penglish.learning.loop.updated';

const EMPTY_STATE: LearningLoopState = {
  schemaVersion: 1,
  xp: 0,
  streak: 0,
  completed: {},
  mistakes: {},
  words: {},
  activities: [],
  updatedAt: new Date(0).toISOString(),
};

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function dayDiff(fromKey: string | undefined, toKey: string) {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function normalizeMistake(value: unknown, id: string): LearningLoopMistakeRecord | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<LearningLoopMistakeRecord>;
  if (!raw.source || !raw.sourceId || !raw.type || !raw.prompt) return null;
  return {
    id,
    source: raw.source,
    sourceId: raw.sourceId,
    type: raw.type,
    prompt: raw.prompt,
    correctAnswer: raw.correctAnswer,
    userAnswer: raw.userAnswer,
    explanation: raw.explanation,
    attempts: Number.isFinite(raw.attempts) ? Math.max(1, Number(raw.attempts)) : 1,
    lastWrongAt: raw.lastWrongAt || new Date(0).toISOString(),
    nextReviewAt: raw.nextReviewAt || raw.lastWrongAt || new Date(0).toISOString(),
    resolved: Boolean(raw.resolved),
    resolvedAt: raw.resolvedAt,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((item): item is string => typeof item === 'string') : [],
  };
}

function normalizeWord(value: unknown, id: string): LearningLoopWordRecord | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<LearningLoopWordRecord>;
  if (!raw.term || !raw.meaningVi || !raw.source || !raw.sourceId) return null;
  return {
    id,
    term: raw.term,
    meaningVi: raw.meaningVi,
    example: raw.example,
    source: raw.source,
    sourceId: raw.sourceId,
    cefrLevel: raw.cefrLevel,
    topic: raw.topic,
    mastery: Number.isFinite(raw.mastery) ? Math.max(0, Math.min(5, Number(raw.mastery))) : 0,
    favorite: Boolean(raw.favorite),
    weakCount: Number.isFinite(raw.weakCount) ? Math.max(0, Number(raw.weakCount)) : 0,
    learnedAt: raw.learnedAt || new Date(0).toISOString(),
    lastReviewedAt: raw.lastReviewedAt,
  };
}

function normalizeState(value: unknown): LearningLoopState {
  const raw = value && typeof value === 'object' ? value as Partial<LearningLoopState> : {};
  const mistakes = Object.entries(raw.mistakes || {}).reduce<Record<string, LearningLoopMistakeRecord>>((store, [id, item]) => {
    const normalized = normalizeMistake(item, id);
    if (normalized) store[id] = normalized;
    return store;
  }, {});
  const words = Object.entries(raw.words || {}).reduce<Record<string, LearningLoopWordRecord>>((store, [id, item]) => {
    const normalized = normalizeWord(item, id);
    if (normalized) store[id] = normalized;
    return store;
  }, {});

  return {
    schemaVersion: 1,
    xp: Number.isFinite(raw.xp) ? Math.max(0, Number(raw.xp)) : 0,
    streak: Number.isFinite(raw.streak) ? Math.max(0, Number(raw.streak)) : 0,
    lastActiveDate: parseDateKey(raw.lastActiveDate) ? raw.lastActiveDate : undefined,
    completed: raw.completed && typeof raw.completed === 'object' ? Object.fromEntries(Object.entries(raw.completed).filter(([, date]) => typeof date === 'string')) : {},
    mistakes,
    words,
    activities: Array.isArray(raw.activities) ? raw.activities.filter((item): item is LearningLoopActivityRecord => Boolean(item?.id && item?.source && item?.sourceId && item?.occurredAt)).slice(-120) : [],
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function dispatchLearningLoopUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(LEARNING_LOOP_UPDATED_EVENT));
  window.dispatchEvent(new Event(LOCAL_PROGRESS_UPDATED_EVENT));
}

export function getLearningLoopState(): LearningLoopState {
  const storage = getStorage();
  if (!storage) return { ...EMPTY_STATE, updatedAt: new Date().toISOString() };
  try {
    const raw = storage.getItem(LEARNING_LOOP_STORAGE_KEY);
    return normalizeState(raw ? JSON.parse(raw) : undefined);
  } catch {
    return { ...EMPTY_STATE, updatedAt: new Date().toISOString() };
  }
}

function writeLearningLoopState(next: LearningLoopState) {
  const normalized = normalizeState({ ...next, updatedAt: new Date().toISOString() });
  const storage = getStorage();
  if (!storage) return normalized;
  storage.setItem(LEARNING_LOOP_STORAGE_KEY, JSON.stringify(normalized));
  dispatchLearningLoopUpdated();
  return normalized;
}

export function recordLearningLoopActivity(source: LearningLoopSource, sourceId: string, xp = 5) {
  const cleanSourceId = sourceId.trim();
  if (!cleanSourceId) return getLearningLoopState();
  const now = new Date();
  const today = toLocalDateKey(now);
  const current = getLearningLoopState();
  const diff = dayDiff(current.lastActiveDate, today);
  const firstActivityToday = current.lastActiveDate !== today;
  const streak = firstActivityToday ? (diff === 1 ? current.streak + 1 : 1) : current.streak || 1;
  const activity: LearningLoopActivityRecord = {
    id: `${source}:${cleanSourceId}:${now.getTime()}`,
    source,
    sourceId: cleanSourceId,
    xp: Math.max(0, Math.round(xp)),
    occurredAt: now.toISOString(),
  };

  return writeLearningLoopState({
    ...current,
    xp: current.xp + activity.xp,
    streak,
    lastActiveDate: today,
    activities: [...current.activities, activity].slice(-120),
  });
}

export function markLearningLoopCompleted(source: LearningLoopSource, sourceId: string, xp = 20) {
  const cleanSourceId = sourceId.trim();
  if (!cleanSourceId) return getLearningLoopState();
  const current = recordLearningLoopActivity(source, cleanSourceId, xp);
  return writeLearningLoopState({
    ...current,
    completed: {
      ...current.completed,
      [`${source}:${cleanSourceId}`]: new Date().toISOString(),
    },
  });
}

export function recordLearningLoopMistake(input: LearningLoopMistakeInput) {
  const current = getLearningLoopState();
  const now = new Date().toISOString();
  const previous = current.mistakes[input.id];
  return writeLearningLoopState({
    ...current,
    mistakes: {
      ...current.mistakes,
      [input.id]: {
        id: input.id,
        source: input.source,
        sourceId: input.sourceId,
        type: input.type,
        prompt: input.prompt,
        correctAnswer: input.correctAnswer,
        userAnswer: input.userAnswer,
        explanation: input.explanation,
        attempts: (previous?.attempts || 0) + 1,
        lastWrongAt: now,
        nextReviewAt: now,
        resolved: false,
        tags: Array.from(new Set([...(previous?.tags || []), ...(input.tags || [])])),
      },
    },
  });
}

export function resolveLearningLoopMistake(id: string) {
  const current = getLearningLoopState();
  const existing = current.mistakes[id];
  if (!existing) return current;
  return writeLearningLoopState({
    ...current,
    mistakes: {
      ...current.mistakes,
      [id]: { ...existing, resolved: true, resolvedAt: new Date().toISOString() },
    },
  });
}

export function upsertLearningLoopWords(words: LearningLoopWordInput[]) {
  const current = getLearningLoopState();
  const now = new Date().toISOString();
  const nextWords = { ...current.words };

  words.forEach((word) => {
    const id = word.id || `${word.source}:${word.sourceId}:${word.term.toLowerCase().trim()}`;
    const existing = nextWords[id];
    nextWords[id] = {
      id,
      term: word.term,
      meaningVi: word.meaningVi,
      example: word.example,
      source: word.source,
      sourceId: word.sourceId,
      cefrLevel: word.cefrLevel,
      topic: word.topic,
      mastery: Math.max(existing?.mastery ?? 0, 1),
      favorite: existing?.favorite ?? false,
      weakCount: existing?.weakCount ?? 0,
      learnedAt: existing?.learnedAt ?? now,
      lastReviewedAt: existing?.lastReviewedAt,
    };
  });

  return writeLearningLoopState({ ...current, words: nextWords });
}

export function markLearningLoopWordWeak(wordId: string) {
  const current = getLearningLoopState();
  const existing = current.words[wordId];
  if (!existing) return current;
  return writeLearningLoopState({
    ...current,
    words: {
      ...current.words,
      [wordId]: { ...existing, weakCount: existing.weakCount + 1, mastery: Math.max(0, existing.mastery - 1), lastReviewedAt: new Date().toISOString() },
    },
  });
}

export function toggleLearningLoopWordFavorite(wordId: string) {
  const current = getLearningLoopState();
  const existing = current.words[wordId];
  if (!existing) return current;
  return writeLearningLoopState({
    ...current,
    words: {
      ...current.words,
      [wordId]: { ...existing, favorite: !existing.favorite },
    },
  });
}

export function getLearningLoopSnapshot() {
  const state = getLearningLoopState();
  const mistakes = Object.values(state.mistakes).filter((item) => !item.resolved).sort((a, b) => b.lastWrongAt.localeCompare(a.lastWrongAt));
  const learnedWords = Object.values(state.words).sort((a, b) => b.learnedAt.localeCompare(a.learnedAt));
  const weakWords = learnedWords.filter((item) => item.weakCount > 0 || item.mastery <= 1);
  const favoriteWords = learnedWords.filter((item) => item.favorite);

  return {
    ...state,
    mistakes,
    learnedWords,
    weakWords,
    favoriteWords,
    dueReviewCount: mistakes.length + weakWords.length,
  };
}
