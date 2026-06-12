export type PooVocabularyProgressStatus = 'new' | 'learning' | 'review' | 'mastered';

export type PooVocabularyProgressKind = 'word' | 'phrase' | 'sentence' | 'dialogue-line' | 'shadowing-line';

export type PooSmartVocabularyGroup =
  | 'poo-picked-new-word'
  | 'often-forgotten-word'
  | 'wrong-speaking-sentence'
  | 'needs-shadowing-again'
  | 'mastered-word'
  | 'due-today';

export type PooVocabularyProgressSourceType =
  | 'poo-lesson'
  | 'legacy-lesson'
  | 'foundation48-day'
  | 'dialogue'
  | 'shadowing'
  | 'english-speed'
  | 'generated-vocabulary'
  | 'manual';

export type PooVocabularyProgressSource = {
  sourceType: PooVocabularyProgressSourceType;
  lessonId?: string;
  lessonTitle?: string;
  unitId?: string;
  unitTitle?: string;
  foundation48DayNumber?: number;
  vocabularyId?: string;
  dialogueId?: string;
  dialogueLineId?: string;
  shadowingLessonId?: string;
  shadowingSentenceId?: string;
  practicePromptId?: string;
  route?: string;
  titleVi?: string;
  noteVi?: string;
};

export type PooVocabularyReviewSchedule = {
  firstSeenAt: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  reviewAfter1Day: string;
  reviewAfter3Days: string;
  reviewAfter7Days: string;
};

export type PooVocabularyReviewAttempt = {
  id: string;
  reviewedAt: string;
  result: 'correct' | 'wrong' | 'skipped' | 'shadowing-low-score' | 'speaking-mistake';
  sourceType?: PooVocabularyProgressSourceType;
  prompt?: string;
  userAnswer?: string;
  correctAnswer?: string;
  pronunciationScore?: number;
  noteVi?: string;
};

export type PooVocabularyWeakSkill =
  | 'meaning'
  | 'spelling'
  | 'pronunciation'
  | 'listening'
  | 'speaking'
  | 'shadowing'
  | 'grammar-pattern'
  | 'recall-speed'
  | 'real-life-usage';

export type PooVocabularyProgressItem = {
  id: string;
  kind: PooVocabularyProgressKind;
  text: string;
  meaningVi?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleEn?: string;
  exampleVi?: string;
  status: PooVocabularyProgressStatus;
  source: PooVocabularyProgressSource;
  schedule: PooVocabularyReviewSchedule;
  weakSkills: PooVocabularyWeakSkill[];
  tags: string[];
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  shadowingAgainCount?: number;
  speakingMistakeCount?: number;
  masteredAt?: string;
  attempts: PooVocabularyReviewAttempt[];
  updatedAt: string;
};

export type PooSmartVocabularyNotebook = {
  schemaVersion: 1;
  learnerId?: string;
  items: Record<string, PooVocabularyProgressItem>;
  updatedAt: string;
};

export type PooSmartVocabularyGroups = Record<PooSmartVocabularyGroup, PooVocabularyProgressItem[]>;

export type LegacyVocabularyReviewStatus = 'new' | 'known' | 'review' | 'difficult' | 'mastered' | 'learning' | 'due' | 'weak';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const EMPTY_GROUPS: PooSmartVocabularyGroups = {
  'poo-picked-new-word': [],
  'often-forgotten-word': [],
  'wrong-speaking-sentence': [],
  'needs-shadowing-again': [],
  'mastered-word': [],
  'due-today': [],
};

function toValidDate(value: string | Date | undefined, fallback: Date) {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : fallback;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_IN_MS).toISOString();
}

export function createPooVocabularyReviewSchedule(firstSeenAt: string | Date = new Date()): PooVocabularyReviewSchedule {
  const base = toValidDate(firstSeenAt, new Date());
  return {
    firstSeenAt: base.toISOString(),
    nextReviewAt: addDays(base, 1),
    reviewAfter1Day: addDays(base, 1),
    reviewAfter3Days: addDays(base, 3),
    reviewAfter7Days: addDays(base, 7),
  };
}

export function legacyVocabularyStatusToPooStatus(status: LegacyVocabularyReviewStatus | string | undefined): PooVocabularyProgressStatus {
  if (status === 'known' || status === 'mastered') return 'mastered';
  if (status === 'review' || status === 'due') return 'review';
  if (status === 'difficult' || status === 'weak' || status === 'learning') return 'learning';
  return 'new';
}

export function getNextPooVocabularyReviewAt(
  item: Pick<PooVocabularyProgressItem, 'status' | 'wrongCount' | 'reviewCount' | 'schedule'>,
  reviewedAt: string | Date = new Date(),
) {
  const base = toValidDate(reviewedAt, new Date());
  if (item.status === 'mastered') return item.schedule.reviewAfter7Days;
  if (item.wrongCount > 0 && item.wrongCount >= item.reviewCount) return addDays(base, 1);
  if (item.status === 'review') return addDays(base, 3);
  if (item.status === 'learning') return addDays(base, 1);
  return item.schedule.reviewAfter1Day;
}

export function isPooVocabularyProgressDueToday(
  item: Pick<PooVocabularyProgressItem, 'status' | 'schedule'>,
  today: string | Date = new Date(),
) {
  if (item.status === 'new') return false;
  const nextReviewAt = item.schedule.nextReviewAt;
  if (!nextReviewAt) return item.status === 'review';
  const nextReviewDate = toValidDate(nextReviewAt, new Date(8640000000000000));
  const todayDate = toValidDate(today, new Date());
  return nextReviewDate.getTime() <= todayDate.getTime();
}

export function inferPooSmartVocabularyGroups(
  item: PooVocabularyProgressItem,
  today: string | Date = new Date(),
): PooSmartVocabularyGroup[] {
  const groups = new Set<PooSmartVocabularyGroup>();

  if (item.status === 'new') groups.add('poo-picked-new-word');
  if (item.status === 'mastered') groups.add('mastered-word');
  if (isPooVocabularyProgressDueToday(item, today)) groups.add('due-today');
  if (item.wrongCount > 0 || item.weakSkills.includes('recall-speed')) groups.add('often-forgotten-word');
  if (item.kind === 'sentence' && (item.speakingMistakeCount || item.weakSkills.includes('speaking'))) {
    groups.add('wrong-speaking-sentence');
  }
  if ((item.kind === 'shadowing-line' || item.weakSkills.includes('shadowing')) && (item.shadowingAgainCount || item.status !== 'mastered')) {
    groups.add('needs-shadowing-again');
  }

  return Array.from(groups);
}

export function groupPooSmartVocabularyItems(
  items: PooVocabularyProgressItem[],
  today: string | Date = new Date(),
): PooSmartVocabularyGroups {
  return items.reduce<PooSmartVocabularyGroups>((groups, item) => {
    inferPooSmartVocabularyGroups(item, today).forEach((group) => {
      groups[group].push(item);
    });
    return groups;
  }, {
    'poo-picked-new-word': [...EMPTY_GROUPS['poo-picked-new-word']],
    'often-forgotten-word': [...EMPTY_GROUPS['often-forgotten-word']],
    'wrong-speaking-sentence': [...EMPTY_GROUPS['wrong-speaking-sentence']],
    'needs-shadowing-again': [...EMPTY_GROUPS['needs-shadowing-again']],
    'mastered-word': [...EMPTY_GROUPS['mastered-word']],
    'due-today': [...EMPTY_GROUPS['due-today']],
  });
}

export function createPooVocabularyProgressItem(input: {
  id: string;
  kind: PooVocabularyProgressKind;
  text: string;
  meaningVi?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleEn?: string;
  exampleVi?: string;
  status?: PooVocabularyProgressStatus;
  source: PooVocabularyProgressSource;
  weakSkills?: PooVocabularyWeakSkill[];
  tags?: string[];
  firstSeenAt?: string | Date;
}): PooVocabularyProgressItem {
  const now = new Date().toISOString();
  const status = input.status ?? 'new';
  const schedule = createPooVocabularyReviewSchedule(input.firstSeenAt ?? now);

  return {
    id: input.id,
    kind: input.kind,
    text: input.text,
    meaningVi: input.meaningVi,
    pronunciation: input.pronunciation,
    partOfSpeech: input.partOfSpeech,
    exampleEn: input.exampleEn,
    exampleVi: input.exampleVi,
    status,
    source: input.source,
    schedule,
    weakSkills: input.weakSkills ?? [],
    tags: input.tags ?? [],
    reviewCount: 0,
    correctCount: 0,
    wrongCount: 0,
    attempts: [],
    updatedAt: now,
  };
}

export function applyPooVocabularyReviewAttempt(
  item: PooVocabularyProgressItem,
  attempt: PooVocabularyReviewAttempt,
): PooVocabularyProgressItem {
  const correctCount = item.correctCount + (attempt.result === 'correct' ? 1 : 0);
  const wrongLikeResult = attempt.result === 'wrong' || attempt.result === 'speaking-mistake' || attempt.result === 'shadowing-low-score';
  const wrongCount = item.wrongCount + (wrongLikeResult ? 1 : 0);
  const reviewCount = item.reviewCount + 1;
  const status: PooVocabularyProgressStatus = wrongLikeResult
    ? 'learning'
    : correctCount >= 3 && wrongCount === 0
      ? 'mastered'
      : correctCount >= 1
        ? 'review'
        : item.status;
  const reviewedAt = toValidDate(attempt.reviewedAt, new Date());
  const nextReviewAt = getNextPooVocabularyReviewAt({ ...item, status, wrongCount, reviewCount }, reviewedAt);
  const shadowingAgainCount = (item.shadowingAgainCount ?? 0) + (attempt.result === 'shadowing-low-score' ? 1 : 0);
  const speakingMistakeCount = (item.speakingMistakeCount ?? 0) + (attempt.result === 'speaking-mistake' ? 1 : 0);

  return {
    ...item,
    status,
    reviewCount,
    correctCount,
    wrongCount,
    shadowingAgainCount: shadowingAgainCount > 0 ? shadowingAgainCount : undefined,
    speakingMistakeCount: speakingMistakeCount > 0 ? speakingMistakeCount : undefined,
    masteredAt: status === 'mastered' ? reviewedAt.toISOString() : item.masteredAt,
    schedule: {
      ...item.schedule,
      lastReviewedAt: reviewedAt.toISOString(),
      nextReviewAt,
    },
    attempts: [...item.attempts, attempt].slice(-20),
    updatedAt: new Date().toISOString(),
  };
}
