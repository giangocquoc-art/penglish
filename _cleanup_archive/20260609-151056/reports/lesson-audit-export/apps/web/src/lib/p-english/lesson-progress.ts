import type { EnglishLesson } from './lesson-content-data';

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
};

export type LessonSrsReviewItem = LessonSrsItem & {
  label: string;
  prompt: string;
  answer: string;
  practiceUrl: string;
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
  status: 'Chưa học' | 'Đang học' | 'Đã hoàn thành';
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

const MODE_DEFS: Array<{ mode: LessonProgressMode; field: LessonProgressModeField; label: string }> = [
  { mode: 'flashcard', field: 'flashcard', label: 'Flashcard' },
  { mode: 'quiz', field: 'quiz', label: 'Quiz' },
  { mode: 'listen', field: 'listening', label: 'Luyện nghe' },
  { mode: 'reflex', field: 'reflex', label: 'Phản xạ' },
  { mode: 'type', field: 'typing', label: 'Gõ câu' },
  { mode: 'match', field: 'match', label: 'Ghép cặp' },
  { mode: 'speed', field: 'speed', label: 'Tốc độ / phát âm' },
];

function hasLessonContentForMode(lesson: EnglishLesson, mode: LessonProgressMode) {
  if (mode === 'flashcard') return lesson.flashcards.length > 0 || lesson.vocabulary.length > 0;
  if (mode === 'quiz') return lesson.quizQuestions.length > 0 || lesson.fillBlankTasks.length > 0 || lesson.sentenceOrderingTasks.length > 0;
  if (mode === 'listen') return lesson.listeningPractice.length > 0;
  if (mode === 'reflex') return lesson.speakingReflexPrompts.length > 0;
  if (mode === 'type') return lesson.fillBlankTasks.length > 0 || lesson.sentenceOrderingTasks.length > 0;
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

function clampSrsLevel(level: number) {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(5, Math.round(level)));
}

function getIntervalMs(result: SrsReviewResult, currentLevel: number) {
  if (result === 'wrong') return TEN_MINUTES;

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

function mapSrsItemToReviewItem(lesson: EnglishLesson, item: LessonSrsItem): LessonSrsReviewItem | null {
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
    if (!question) return null;
    const prompt = question.question ?? question.prompt ?? question.vietnamese ?? 'Quiz question';
    return {
      ...item,
      label: prompt,
      prompt,
      answer: Array.isArray(question.answer) ? question.answer.join(' / ') : question.answer,
      practiceUrl: `/practice?lessonId=${lesson.id}&mode=quiz`,
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
    if (!listening) return null;
    return {
      ...item,
      label: listening.question,
      prompt: listening.text,
      answer: listening.answer,
      practiceUrl: `/practice?lessonId=${lesson.id}&mode=listen`,
    };
  }

  return null;
}

function getReviewItemsFromProgress(progress: LessonProgress | null, lesson: EnglishLesson) {
  return Object.values(progress?.srs?.items ?? {})
    .map((item) => mapSrsItemToReviewItem(lesson, item))
    .filter((item): item is LessonSrsReviewItem => Boolean(item))
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());
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

export function getNextReviewTime(result: SrsReviewResult, currentLevel: number): string {
  return new Date(Date.now() + getIntervalMs(result, currentLevel)).toISOString();
}

export function markItemReviewed(lessonId: string, itemId: string, type: SrsItemType, result: SrsReviewResult): LessonProgress | null {
  const current = readLessonProgress(lessonId) ?? { lessonId };
  const currentItems = current.srs?.items ?? {};
  const existing = currentItems[itemId];
  const baseLevel = clampSrsLevel(existing?.level ?? 0);
  const nextLevel = result === 'correct' ? Math.min(5, baseLevel + 1) : Math.max(0, baseLevel - 1);
  const now = new Date().toISOString();
  const nextItem: LessonSrsItem = {
    itemId,
    type,
    level: nextLevel,
    lastReviewedAt: now,
    nextReviewAt: getNextReviewTime(result, nextLevel),
    wrongCount: (existing?.wrongCount ?? 0) + (result === 'wrong' ? 1 : 0),
    correctCount: (existing?.correctCount ?? 0) + (result === 'correct' ? 1 : 0),
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
  return getReviewItemsFromProgress(progress, lesson).filter((item) => item.wrongCount > 0 || item.level <= 1);
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

function scoreTextForMode(progress: LessonProgress | null, field: LessonProgressModeField, lesson: EnglishLesson) {
  if (!progress || !progress[field]) return 'Chưa có dữ liệu';

  if (field === 'flashcard') {
    const reviewed = progress.flashcard?.reviewedCardIds?.length ?? 0;
    const sessions = progress.flashcard?.completedSessions ?? 0;
    return sessions > 0 ? `${reviewed}/${lesson.flashcards.length} thẻ · ${sessions} lượt` : `${reviewed}/${lesson.flashcards.length} thẻ`;
  }

  if (field === 'quiz') return `${progress.quiz?.lastPercentage ?? 0}% · ${progress.quiz?.attempts ?? 0} lượt`;
  if (field === 'listening') return `${progress.listening?.lastPercentage ?? 0}% · ${progress.listening?.attempts ?? 0} lượt`;
  if (field === 'reflex') return `${progress.reflex?.lastPercentage ?? 0}% · ${progress.reflex?.attempts ?? 0} lượt`;
  if (field === 'typing') return `${progress.typing?.lastPercentage ?? 0}% · ${progress.typing?.attempts ?? 0} lượt`;
  if (field === 'match') return `${progress.match?.completedPairIds?.length ?? 0}/${lesson.vocabulary.length} cặp · ${progress.match?.attempts ?? 0} lượt`;
  if (field === 'speed') return `${progress.speed?.lastScore ?? 0} điểm · best ${progress.speed?.bestScore ?? 0}`;

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
  const weakReviewCount = reviewItems.filter((item) => item.wrongCount > 0 || item.level <= 1).length;
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
        status: completed ? 'Đã hoàn thành' : started ? 'Đang học' : 'Chưa học',
        scoreText: scoreTextForMode(progress, item.field, lesson),
        url: `/practice?lessonId=${lesson.id}&mode=${item.mode}`,
      };
    }),
  };
}
