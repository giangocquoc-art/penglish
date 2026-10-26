import type { EnglishLesson } from './lesson-content-data';
import { recordLearningActivity } from './daily-rewards';
import { markLessonCompleted as markLegacyLessonCompleted } from './local-progress';

export type FlashcardProgress = {
  reviewedCardIds: string[];
  rememberedCardIds: string[];
  needsReviewCardIds: string[];
  lastReviewedAt: string;
  completedSessions: number;
};

export type QuizProgress = {
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastPercentage: number;
  wrongQuestionIds: string[];
  lastCompletedAt: string;
};

export type ListeningProgress = {
  attempts: number;
  completedItemIds: string[];
  correctItemIds: string[];
  wrongItemIds: string[];
  lastScore: number;
  lastPercentage: number;
  lastCompletedAt: string;
};

export type ReflexProgress = {
  attempts: number;
  correctPromptIds: string[];
  wrongPromptIds: string[];
  lastScore: number;
  lastPercentage: number;
  lastCompletedAt: string;
};

export type TypingProgress = {
  attempts: number;
  correctTaskIds: string[];
  wrongTaskIds: string[];
  lastScore: number;
  lastPercentage: number;
  lastCompletedAt: string;
};

export type MatchProgress = {
  attempts: number;
  completedPairIds: string[];
  weakPairIds: string[];
  lastMistakes: number;
  lastCompletedAt: string;
};

export type SpeedProgress = {
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastCorrect: number;
  lastWrong: number;
  maxStreak: number;
  lastPlayedAt: string;
};

export type SrsItemType = 'flashcard' | 'quiz' | 'listening' | 'reflex' | 'typing' | 'match' | 'speed';

export type SrsReviewResult = 'correct' | 'wrong';

export type LessonSrsItem = {
  itemId: string;
  type: SrsItemType;
  level: number;
  lastReviewedAt: string;
  nextReviewAt: string;
  wrongCount: number;
  correctCount: number;
  correctSessionCount?: number;
  lastCorrectSessionId?: string;
  lastWrongAt?: string;
};

export type LessonSrsReviewItem = LessonSrsItem & {
  label: string;
  prompt: string;
  answer: string;
  practiceUrl: string;
  isFamiliar: boolean;
  isMastered: boolean;
};

export type LessonProgress = {
  lessonId: string;
  flashcard?: Partial<FlashcardProgress>;
  quiz?: Partial<QuizProgress>;
  listening?: Partial<ListeningProgress>;
  reflex?: Partial<ReflexProgress>;
  typing?: Partial<TypingProgress>;
  match?: Partial<MatchProgress>;
  speed?: Partial<SpeedProgress>;
  srs?: {
    items: Record<string, LessonSrsItem>;
  };
};

export type LessonProgressMode = 'flashcard' | 'quiz' | 'listen' | 'reflex' | 'type' | 'match' | 'speed';

type LessonProgressModeField = Exclude<keyof LessonProgress, 'lessonId' | 'srs'>;

export type LessonProgressModeSummary = {
  mode: LessonProgressMode;
  label: string;
  status: 'Sẵn sàng' | 'Đang học' | 'Hoàn thành' | 'Chưa có nội dung';
  scoreText: string;
  url: string;
};

export type LessonProgressSummary = {
  completedModes: string[];
  missingModes: string[];
  overallPercentage: number;
  nextRecommendedMode: string;
  nextRecommendedLabel: string;
  nextRecommendedUrl: string;
  modeSummaries: LessonProgressModeSummary[];
  dueReviewCount: number;
  weakReviewCount: number;
  nextReviewAt?: string;
};

export type LessonCompletionStatus = 'started' | 'completed';

export type LessonProgressRecord = {
  lessonId: string;
  unitId?: string;
  status: LessonCompletionStatus;
  completedSteps: string[];
  flowVersion?: number;
  stepOutcomes?: Record<string, boolean>;
  reviewSessionId?: string;
  completedAt?: string;
  updatedAt: string;
};

export type LessonProgressStore = Record<string, LessonProgressRecord>;

export const LESSON_PROGRESS_STORAGE_KEY = 'penglish.lesson.progress.v1';
export const LESSON_PROGRESS_UPDATED_EVENT = 'penglish.lesson.progress.updated';

const MODE_DEFS: Array<{ mode: LessonProgressMode; field: LessonProgressModeField; label: string }> = [
  { mode: 'flashcard', field: 'flashcard', label: 'Thẻ từ' },
  { mode: 'quiz', field: 'quiz', label: 'Thử sức nhẹ' },
  { mode: 'listen', field: 'listening', label: 'Luyện nghe' },
  { mode: 'reflex', field: 'reflex', label: 'Phản xạ' },
  { mode: 'type', field: 'typing', label: 'Gõ câu' },
  { mode: 'match', field: 'match', label: 'Ghép cặp' },
  { mode: 'speed', field: 'speed', label: 'Tốc độ / phát âm' },
];

function hasLessonContentForMode(lesson: EnglishLesson, mode: LessonProgressMode) {
  if (mode === 'flashcard') return lesson.flashcards.length > 0 || lesson.vocabulary.length > 0;
  if (mode === 'quiz') return lesson.quizQuestions.length > 0 || lesson.fillBlankTasks.length > 0 || lesson.sentenceOrderingTasks.length > 0;
  if (mode === 'listen') return lesson.listeningPractice.length > 0 || lesson.miniDialogues.some((dialogue) => dialogue.lines.length > 0);
  if (mode === 'reflex') return lesson.speakingReflexPrompts.length > 0;
  if (mode === 'type') return lesson.fillBlankTasks.length > 0 || Boolean(lesson.commonMistakes?.length);
  if (mode === 'match') return (lesson.matchPairs?.length ?? 0) > 0 || lesson.vocabulary.length > 1;
  if (mode === 'speed') return (lesson.englishSpeedPrompts?.length ?? 0) > 0 || lesson.vocabulary.length > 0 || lesson.quizQuestions.length > 0;
  return false;
}

export function getAvailableLessonProgressModes(lesson: EnglishLesson): LessonProgressMode[] {
  return MODE_DEFS.filter((item) => hasLessonContentForMode(lesson, item.mode)).map((item) => item.mode);
}

function getAvailableModeDefs(lesson: EnglishLesson) {
  const availableModes = getAvailableLessonProgressModes(lesson);
  return MODE_DEFS.filter((item) => availableModes.includes(item.mode));
}

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export function getLessonProgressKey(lessonId: string) {
  return `p-english:lesson-progress:${lessonId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim())));
}

function normalizeLessonProgressRecord(lessonId: string, value: unknown): LessonProgressRecord | null {
  if (!lessonId.trim() || !isRecord(value)) return null;
  const rawLessonId = typeof value.lessonId === 'string' && value.lessonId.trim() ? value.lessonId.trim() : lessonId.trim();
  const status: LessonCompletionStatus = value.status === 'completed' ? 'completed' : 'started';
  const updatedAt = typeof value.updatedAt === 'string' && value.updatedAt.trim() ? value.updatedAt : new Date().toISOString();
  const completedAt = typeof value.completedAt === 'string' && value.completedAt.trim() ? value.completedAt : undefined;
  const unitId = typeof value.unitId === 'string' && value.unitId.trim() ? value.unitId.trim() : undefined;
  const reviewSessionId = typeof value.reviewSessionId === 'string' && value.reviewSessionId.trim() ? value.reviewSessionId.trim() : undefined;

  return {
    lessonId: rawLessonId,
    unitId,
    status,
    completedSteps: normalizeStringArray(value.completedSteps),
    flowVersion: Number.isInteger(value.flowVersion) ? Number(value.flowVersion) : undefined,
    stepOutcomes: isRecord(value.stepOutcomes)
      ? Object.fromEntries(Object.entries(value.stepOutcomes).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'))
      : {},
    reviewSessionId,
    completedAt: status === 'completed' ? completedAt ?? updatedAt : undefined,
    updatedAt,
  };
}

function dispatchLessonProgressUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(LESSON_PROGRESS_UPDATED_EVENT));
}

function writeLessonCompletionStore(next: LessonProgressStore) {
  const storage = getStorage();
  if (!storage) return next;

  try {
    storage.setItem(LESSON_PROGRESS_STORAGE_KEY, JSON.stringify(next));
    dispatchLessonProgressUpdated();
  } catch {
    // Ignore storage quota / privacy mode errors. Callers still receive a safe state.
  }

  return next;
}

export function getLessonProgress(): LessonProgressStore {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const parsed = JSON.parse(storage.getItem(LESSON_PROGRESS_STORAGE_KEY) ?? '{}') as unknown;
    if (!isRecord(parsed)) return {};

    return Object.entries(parsed).reduce<LessonProgressStore>((store, [lessonId, value]) => {
      const record = normalizeLessonProgressRecord(lessonId, value);
      if (record) store[record.lessonId] = record;
      return store;
    }, {});
  } catch {
    return {};
  }
}

function createReviewSessionId(lessonId: string) {
  return `${lessonId}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 10)}`;
}

export function markLessonStarted(lessonId: string, unitId?: string, flowVersion?: number): LessonProgressRecord | null {
  const cleanLessonId = lessonId.trim();
  if (!cleanLessonId) return null;

  const store = getLessonProgress();
  const current = store[cleanLessonId];
  const now = new Date().toISOString();
  const hasNewFlowVersion = flowVersion !== undefined && current?.flowVersion !== flowVersion;
  const reviewSessionId = current?.status !== 'completed' && !hasNewFlowVersion
    ? current?.reviewSessionId ?? createReviewSessionId(cleanLessonId)
    : createReviewSessionId(cleanLessonId);
  const next: LessonProgressRecord = {
    lessonId: cleanLessonId,
    unitId: unitId?.trim() || current?.unitId,
    status: current?.status === 'completed' ? 'completed' : 'started',
    completedSteps: hasNewFlowVersion ? [] : current?.completedSteps ?? [],
    flowVersion: flowVersion ?? current?.flowVersion,
    stepOutcomes: hasNewFlowVersion ? {} : current?.stepOutcomes ?? {},
    reviewSessionId,
    completedAt: current?.completedAt,
    updatedAt: now,
  };

  return writeLessonCompletionStore({ ...store, [cleanLessonId]: next })[cleanLessonId];
}

export function markLessonStepCompleted(lessonId: string, stepId: string, outcome?: boolean): LessonProgressRecord | null {
  const cleanLessonId = lessonId.trim();
  const cleanStepId = stepId.trim();
  if (!cleanLessonId || !cleanStepId) return null;

  const store = getLessonProgress();
  const current = store[cleanLessonId];
  const now = new Date().toISOString();
  const stepOutcomes = { ...(current?.stepOutcomes ?? {}) };
  if (outcome !== undefined && stepOutcomes[cleanStepId] === undefined) stepOutcomes[cleanStepId] = outcome;
  const next: LessonProgressRecord = {
    lessonId: cleanLessonId,
    unitId: current?.unitId,
    status: current?.status === 'completed' ? 'completed' : 'started',
    completedSteps: Array.from(new Set([...(current?.completedSteps ?? []), cleanStepId])),
    flowVersion: current?.flowVersion,
    stepOutcomes,
    reviewSessionId: current?.reviewSessionId,
    completedAt: current?.completedAt,
    updatedAt: now,
  };

  return writeLessonCompletionStore({ ...store, [cleanLessonId]: next })[cleanLessonId];
}

export function markLessonCompleted(lessonId: string, unitId?: string): LessonProgressRecord | null {
  const cleanLessonId = lessonId.trim();
  if (!cleanLessonId) return null;

  const store = getLessonProgress();
  const current = store[cleanLessonId];
  const now = new Date().toISOString();
  const next: LessonProgressRecord = {
    lessonId: cleanLessonId,
    unitId: unitId?.trim() || current?.unitId,
    status: 'completed',
    completedSteps: current?.completedSteps ?? [],
    flowVersion: current?.flowVersion,
    stepOutcomes: current?.stepOutcomes ?? {},
    reviewSessionId: current?.reviewSessionId,
    completedAt: current?.completedAt ?? now,
    updatedAt: now,
  };

  writeLessonCompletionStore({ ...store, [cleanLessonId]: next });
  markLegacyLessonCompleted(cleanLessonId);
  recordLearningActivity('lesson', cleanLessonId);
  return next;
}

export function getCompletedLessonCount() {
  return Object.values(getLessonProgress()).filter((record) => record.status === 'completed').length;
}

export function getCompletedUnitCount() {
  const completedUnitIds = new Set(
    Object.values(getLessonProgress())
      .filter((record) => record.status === 'completed' && record.unitId)
      .map((record) => record.unitId as string),
  );
  return completedUnitIds.size;
}

function clampSrsLevel(level: number) {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(5, Math.round(level)));
}

function getIntervalMs(result: SrsReviewResult, currentLevel: number, wrongAnswerDelayMinutes = 10) {
  if (result === 'wrong') {
    const delay = Number.isFinite(wrongAnswerDelayMinutes) ? Math.max(1, Math.min(1440, wrongAnswerDelayMinutes)) : 10;
    return delay * ONE_MINUTE;
  }

  const level = clampSrsLevel(currentLevel);
  if (level <= 0) return TEN_MINUTES;
  if (level === 1) return ONE_DAY;
  if (level === 2) return 3 * ONE_DAY;
  if (level === 3) return 7 * ONE_DAY;
  if (level === 4) return 14 * ONE_DAY;
  return 30 * ONE_DAY;
}

function modeForType(type: SrsItemType): LessonProgressMode {
  if (type === 'listening') return 'listen';
  if (type === 'typing') return 'type';
  return type;
}

function mapSrsItemToReviewItem(lesson: EnglishLesson, item: LessonSrsItem): Omit<LessonSrsReviewItem, 'isFamiliar' | 'isMastered'> | null {
  if (item.type === 'flashcard') {
    const card = lesson.flashcards.find((entry) => entry.id === item.itemId);
    if (!card) return null;
    return {
      ...item,
      label: card.front,
      prompt: card.front,
      answer: card.back,
      practiceUrl: `/practice?lessonId=${lesson.id}&mode=flashcard&review=due`,
    };
  }

  if (item.type === 'quiz') {
    const question = lesson.quizQuestions.find((entry) => entry.id === item.itemId);
    if (question) {
      const prompt = question.question ?? question.prompt ?? question.vietnamese ?? 'Câu kiểm tra nhanh';
      return {
        ...item,
        label: prompt,
        prompt,
        answer: Array.isArray(question.answer) ? question.answer.join(' / ') : question.answer,
        practiceUrl: `/practice?lessonId=${lesson.id}&mode=quiz`,
      };
    }

    const orderTask = lesson.sentenceOrderingTasks.find((entry) => entry.id === item.itemId);
    if (orderTask) {
      return {
        ...item,
        label: orderTask.vietnamese,
        prompt: orderTask.vietnamese,
        answer: orderTask.answer,
        practiceUrl: `/practice?lessonId=${lesson.id}&mode=quiz`,
      };
    }

    const matchQuestion = lesson.quizQuestions.find((entry) => entry.type === 'match-meaning' && entry.pairs?.length && item.itemId.startsWith(`${entry.id}-`));
    const matchPairIndex = matchQuestion ? Number(item.itemId.slice(matchQuestion.id.length + 1)) : Number.NaN;
    const matchQuestionPair = matchQuestion?.pairs?.[matchPairIndex];
    if (matchQuestionPair) {
      return {
        ...item,
        label: matchQuestionPair.left,
        prompt: `“${matchQuestionPair.left}” có nghĩa là gì?`,
        answer: matchQuestionPair.right,
        practiceUrl: `/practice?lessonId=${lesson.id}&mode=quiz`,
      };
    }
    return null;
  }

  if (item.type === 'typing') {
    const fillBlank = lesson.fillBlankTasks.find((entry) => entry.id === item.itemId);
    if (fillBlank) {
      return {
        ...item,
        label: fillBlank.prompt,
        prompt: fillBlank.prompt,
        answer: fillBlank.answer,
        practiceUrl: `/practice?lessonId=${lesson.id}&mode=type`,
      };
    }

    const quizFillBlank = lesson.quizQuestions.find((entry) => entry.id === item.itemId && entry.type === 'fill-blank');
    if (quizFillBlank) {
      const prompt = quizFillBlank.prompt ?? quizFillBlank.question ?? 'Điền từ còn thiếu';
      return {
        ...item,
        label: prompt,
        prompt,
        answer: Array.isArray(quizFillBlank.answer) ? quizFillBlank.answer.join(' / ') : quizFillBlank.answer,
        practiceUrl: `/practice?lessonId=${lesson.id}&mode=quiz`,
      };
    }

    const mistake = lesson.commonMistakes?.find((entry) => entry.id === item.itemId);
    if (mistake) {
      return {
        ...item,
        label: mistake.mistake,
        prompt: mistake.mistake,
        answer: mistake.correction,
        practiceUrl: `/practice?lessonId=${lesson.id}&mode=type`,
      };
    }
    return null;
  }

  if (item.type === 'speed') {
    const prompt = lesson.englishSpeedPrompts?.find((entry) => entry.id === item.itemId);
    if (!prompt) return null;
    return {
      ...item,
      label: prompt.promptVi,
      prompt: prompt.promptVi,
      answer: prompt.expectedEnglish,
      practiceUrl: `/practice?lessonId=${lesson.id}&mode=speed`,
    };
  }

  if (item.type === 'reflex') {
    const prompt = lesson.speakingReflexPrompts.find((entry) => entry.id === item.itemId);
    if (!prompt) return null;
    return {
      ...item,
      label: prompt.promptVi,
      prompt: prompt.promptVi,
      answer: prompt.expectedEnglish,
      practiceUrl: `/practice?lessonId=${lesson.id}&mode=reflex`,
    };
  }

  if (item.type === 'match') {
    const pair = lesson.matchPairs?.find((entry) => entry.id === item.itemId);
    if (pair) {
      return {
        ...item,
        label: pair.left,
        prompt: pair.left,
        answer: pair.right,
        practiceUrl: `/practice?lessonId=${lesson.id}&mode=match`,
      };
    }
    const vocabulary = lesson.vocabulary.find((entry) => entry.id === item.itemId);
    if (!vocabulary) return null;
    return {
      ...item,
      label: vocabulary.term,
      prompt: vocabulary.term,
      answer: vocabulary.meaningVi,
      practiceUrl: `/practice?lessonId=${lesson.id}&mode=match`,
    };
  }

  if (item.type === 'listening') {
    const listening = lesson.listeningPractice.find((entry) => entry.id === item.itemId);
    if (listening) {
      return {
        ...item,
        label: listening.question,
        prompt: listening.text,
        answer: listening.answer,
        practiceUrl: `/practice?lessonId=${lesson.id}&mode=listen`,
      };
    }

    const dialogueMatch = item.itemId.match(/^(.*)-(\d+)$/);
    const dialogue = dialogueMatch && lesson.miniDialogues.find((entry) => entry.id === dialogueMatch[1]);
    const dialogueLine = dialogue && dialogue.lines[Number(dialogueMatch?.[2])];
    if (!dialogue || !dialogueLine) return null;
    return {
      ...item,
      label: `Hội thoại · ${dialogue.title}`,
      prompt: dialogueLine.text,
      answer: dialogueLine.text,
      practiceUrl: `/practice?lessonId=${lesson.id}&mode=listen`,
    };
  }

  return null;
}

function getReviewItemsFromProgress(progress: LessonProgress | null, lesson: EnglishLesson) {
  return Object.values(progress?.srs?.items ?? {})
    .map((item) => {
      const reviewItem = mapSrsItemToReviewItem(lesson, item);
      if (!reviewItem) return null;
      const correctSessions = item.correctSessionCount ?? 0;
      return {
        ...reviewItem,
        isFamiliar: correctSessions >= lesson.reviewPolicy.familiarAfterCorrectSessions,
        isMastered: correctSessions >= lesson.reviewPolicy.masteredAfterCorrectSessions,
      };
    })
    .filter((item): item is LessonSrsReviewItem => Boolean(item))
    .sort((a, b) => {
      const wrongTime = (item: LessonSrsReviewItem) => item.lastWrongAt ? new Date(item.lastWrongAt).getTime() : 0;
      const wrongFirst = wrongTime(b) - wrongTime(a);
      const phraseFirst = (item: LessonSrsReviewItem) => /\s/.test(item.label.trim()) ? 0 : 1;
      const phraseOrder = phraseFirst(a) - phraseFirst(b);
      const dueOrder = new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();

      switch (lesson.reviewPolicy.priorityStrategy) {
        case 'recent-mistakes-first':
          return wrongFirst || dueOrder;
        case 'recent-mistakes-and-weak-keywords':
          return (Number(b.type === 'flashcard' && !b.isMastered) - Number(a.type === 'flashcard' && !a.isMastered)) || wrongFirst || dueOrder;
        case 'phrases-before-single-words':
        case 'target-phrases-before-details':
          return phraseOrder || wrongFirst || dueOrder;
      }
    });
}

export function readLessonProgress(lessonId: string): LessonProgress | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(getLessonProgressKey(lessonId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;

    return {
      ...(parsed as Omit<LessonProgress, 'lessonId'>),
      lessonId: typeof parsed.lessonId === 'string' ? parsed.lessonId : lessonId,
    };
  } catch {
    return null;
  }
}

export function writeLessonProgress(lessonId: string, next: LessonProgress): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(getLessonProgressKey(lessonId), JSON.stringify({ ...next, lessonId }));
    return true;
  } catch {
    return false;
  }
}

export function mergeLessonProgress(lessonId: string, patch: Partial<LessonProgress>): LessonProgress | null {
  const current = readLessonProgress(lessonId) ?? { lessonId };
  const merged: LessonProgress = {
    ...current,
    ...patch,
    lessonId,
    flashcard: patch.flashcard ? { ...current.flashcard, ...patch.flashcard } : current.flashcard,
    quiz: patch.quiz ? { ...current.quiz, ...patch.quiz } : current.quiz,
    listening: patch.listening ? { ...current.listening, ...patch.listening } : current.listening,
    reflex: patch.reflex ? { ...current.reflex, ...patch.reflex } : current.reflex,
    typing: patch.typing ? { ...current.typing, ...patch.typing } : current.typing,
    match: patch.match ? { ...current.match, ...patch.match } : current.match,
    speed: patch.speed ? { ...current.speed, ...patch.speed } : current.speed,
    srs: patch.srs
      ? { items: { ...(current.srs?.items ?? {}), ...(patch.srs.items ?? {}) } }
      : current.srs,
  };

  return writeLessonProgress(lessonId, merged) ? merged : null;
}

export function getNextReviewTime(result: SrsReviewResult, currentLevel: number, wrongAnswerDelayMinutes = 10): string {
  return new Date(Date.now() + getIntervalMs(result, currentLevel, wrongAnswerDelayMinutes)).toISOString();
}

export function markItemReviewed(
  lessonId: string,
  itemId: string,
  type: SrsItemType,
  result: SrsReviewResult,
  wrongAnswerDelayMinutes = 10,
  reviewSessionId?: string,
  countCorrectSession = true,
): LessonProgress | null {
  const current = readLessonProgress(lessonId) ?? { lessonId };
  const currentItems = current.srs?.items ?? {};
  const existing = currentItems[itemId];
  const baseLevel = clampSrsLevel(existing?.level ?? 0);
  const newCorrectSession = Boolean(reviewSessionId && result === 'correct' && countCorrectSession && reviewSessionId !== existing?.lastCorrectSessionId);
  const nextLevel = result === 'correct'
    ? Math.min(5, baseLevel + (reviewSessionId ? Number(newCorrectSession) : 1))
    : Math.max(0, baseLevel - 1);
  const correctSessionCount = result === 'wrong' ? 0 : (existing?.correctSessionCount ?? 0) + Number(newCorrectSession);
  const now = new Date().toISOString();
  const nextItem: LessonSrsItem = {
    itemId,
    type,
    level: nextLevel,
    lastReviewedAt: now,
    nextReviewAt: getNextReviewTime(result, nextLevel, wrongAnswerDelayMinutes),
    wrongCount: (existing?.wrongCount ?? 0) + (result === 'wrong' ? 1 : 0),
    correctCount: (existing?.correctCount ?? 0) + (result === 'correct' ? 1 : 0),
    correctSessionCount,
    lastCorrectSessionId: result === 'wrong' ? undefined : newCorrectSession ? reviewSessionId : existing?.lastCorrectSessionId,
    lastWrongAt: result === 'wrong' ? now : existing?.lastWrongAt,
  };

  const merged: LessonProgress = {
    ...current,
    lessonId,
    srs: {
      items: {
        ...currentItems,
        [itemId]: nextItem,
      },
    },
  };

  return writeLessonProgress(lessonId, merged) ? merged : null;
}

export function getDueReviewItems(lessonId: string, lesson: EnglishLesson): LessonSrsReviewItem[] {
  const progress = readLessonProgress(lessonId);
  const now = Date.now();
  return getReviewItemsFromProgress(progress, lesson).filter((item) => new Date(item.nextReviewAt).getTime() <= now);
}

export function getWeakReviewItems(lessonId: string, lesson: EnglishLesson): LessonSrsReviewItem[] {
  const progress = readLessonProgress(lessonId);
  return getReviewItemsFromProgress(progress, lesson).filter((item) => !item.isMastered && (item.wrongCount > 0 || item.level <= 1));
}

export function getLessonSrsReviewItems(lessonId: string, lesson: EnglishLesson): LessonSrsReviewItem[] {
  return getReviewItemsFromProgress(readLessonProgress(lessonId), lesson);
}

function isModeCompleted(progress: LessonProgress | null, field: LessonProgressModeField) {
  if (!progress) return false;

  if (field === 'flashcard') return (progress.flashcard?.completedSessions ?? 0) > 0;
  if (field === 'quiz') return (progress.quiz?.attempts ?? 0) > 0;
  if (field === 'listening') return (progress.listening?.attempts ?? 0) > 0;
  if (field === 'reflex') return (progress.reflex?.attempts ?? 0) > 0;
  if (field === 'typing') return (progress.typing?.attempts ?? 0) > 0;
  if (field === 'match') return (progress.match?.attempts ?? 0) > 0;
  if (field === 'speed') return (progress.speed?.attempts ?? 0) > 0;

  return false;
}

function isModeStarted(progress: LessonProgress | null, field: LessonProgressModeField) {
  if (!progress) return false;
  return Boolean(progress[field]);
}

function readyTextForMode(field: LessonProgressModeField, lesson: EnglishLesson) {
  if (field === 'flashcard') return `${Math.max(lesson.flashcards.length, lesson.vocabulary.length)} thẻ sẵn sàng`;
  if (field === 'quiz') return `${lesson.quizQuestions.length + lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length} câu sẵn sàng`;
  if (field === 'listening') return `${lesson.listeningPractice.length} câu nghe sẵn sàng`;
  if (field === 'reflex') return `${lesson.speakingReflexPrompts.length} phản xạ sẵn sàng`;
  if (field === 'typing') return `${lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length} bài gõ sẵn sàng`;
  if (field === 'match') return `${Math.max(lesson.matchPairs?.length ?? 0, lesson.vocabulary.length)} cặp sẵn sàng`;
  if (field === 'speed') return 'Sẵn sàng luyện tốc độ / phát âm';
  return 'Sẵn sàng luyện tập';
}

function scoreTextForMode(progress: LessonProgress | null, field: LessonProgressModeField, lesson: EnglishLesson) {
  if (!progress || !progress[field]) return readyTextForMode(field, lesson);

  if (field === 'flashcard') {
    const reviewed = progress.flashcard?.reviewedCardIds?.length ?? 0;
    const sessions = progress.flashcard?.completedSessions ?? 0;
    return sessions > 0 ? `${reviewed}/${lesson.flashcards.length} thẻ · ${sessions} lượt` : `${reviewed}/${lesson.flashcards.length} thẻ`;
  }

  if (field === 'quiz') return `${progress.quiz?.lastPercentage ?? 0}% · ${progress.quiz?.attempts ?? 0} lượt`;
  if (field === 'listening') return `${progress.listening?.lastPercentage ?? 0}% · ${progress.listening?.attempts ?? 0} lượt`;
  if (field === 'reflex') return `${progress.reflex?.lastPercentage ?? 0}% · ${progress.reflex?.attempts ?? 0} lượt`;
  if (field === 'typing') return `${progress.typing?.lastPercentage ?? 0}% · ${progress.typing?.attempts ?? 0} lượt`;
  if (field === 'match') return `${progress.match?.completedPairIds?.length ?? 0}/${Math.max(lesson.matchPairs?.length ?? 0, lesson.vocabulary.length)} cặp · ${progress.match?.attempts ?? 0} lượt`;
  if (field === 'speed') return `${progress.speed?.lastScore ?? 0} điểm · kỷ lục ${progress.speed?.bestScore ?? 0}`;

  return 'Đã có tiến độ';
}

export function calculateLessonProgressSummary(progress: LessonProgress | null, lesson: EnglishLesson): LessonProgressSummary {
  const availableModeDefs = getAvailableModeDefs(lesson);
  const completedModes = availableModeDefs.filter((item) => isModeCompleted(progress, item.field)).map((item) => item.mode);
  const missingModes = availableModeDefs.filter((item) => !isModeCompleted(progress, item.field)).map((item) => item.mode);
  const firstMissing = availableModeDefs.find((item) => !isModeCompleted(progress, item.field));
  const firstAvailable = availableModeDefs[0];
  const nextRecommendedMode = firstMissing?.mode ?? firstAvailable?.mode ?? '';
  const nextRecommendedLabel = firstMissing?.label ?? firstAvailable?.label ?? 'Đọc lại nội dung bài học';
  const nextRecommendedUrl = nextRecommendedMode ? `/practice?lessonId=${lesson.id}&mode=${nextRecommendedMode}` : `/lessons/${lesson.id}`;
  const reviewItems = getReviewItemsFromProgress(progress, lesson);
  const now = Date.now();
  const dueReviewCount = reviewItems.filter((item) => new Date(item.nextReviewAt).getTime() <= now).length;
  const weakReviewCount = reviewItems.filter((item) => !item.isMastered && (item.wrongCount > 0 || item.level <= 1)).length;
  const nextReviewAt = reviewItems.find((item) => new Date(item.nextReviewAt).getTime() > now)?.nextReviewAt ?? reviewItems[0]?.nextReviewAt;

  return {
    completedModes,
    missingModes,
    overallPercentage: Math.round((completedModes.length / Math.max(1, availableModeDefs.length)) * 100),
    nextRecommendedMode,
    nextRecommendedLabel,
    nextRecommendedUrl,
    dueReviewCount,
    weakReviewCount,
    nextReviewAt,
    modeSummaries: availableModeDefs.map((item) => {
      const completed = isModeCompleted(progress, item.field);
      const started = isModeStarted(progress, item.field);
      return {
        mode: item.mode,
        label: item.label,
        status: completed ? 'Hoàn thành' : started ? 'Đang học' : 'Sẵn sàng',
        scoreText: scoreTextForMode(progress, item.field, lesson),
        url: `/practice?lessonId=${lesson.id}&mode=${item.mode}`,
      };
    }),
  };
}
