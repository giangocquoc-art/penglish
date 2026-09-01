import { recordLearningActivity } from './daily-rewards';
import { incrementStudyDay, LOCAL_PROGRESS_UPDATED_EVENT } from './local-progress';
import {
  getAdaptedVocabularyItemByWordId,
  getAdaptedVocabularyItems,
  type AdaptedVocabularyItem,
} from './vocabularyAdapter';

export type VocabularyReviewStatus = 'new' | 'known' | 'review' | 'difficult';

export type VocabularyReviewRecord = {
  wordId: string;
  status: VocabularyReviewStatus;
  reviewCount: number;
  wrongCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
};

export type VocabularyReviewItem = AdaptedVocabularyItem & {
  status: VocabularyReviewStatus;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
};

export type VocabularyStats = {
  total: number;
  known: number;
  review: number;
  difficult: number;
  today: number;
  progressPercent: number;
};

export const VOCABULARY_REVIEW_STORAGE_KEY = 'penglish.vocabulary.progress.v1';
export const LEGACY_VOCABULARY_REVIEW_STORAGE_KEY = 'p-english:vocabulary-review';
export const VOCABULARY_REVIEW_UPDATED_EVENT = 'p-english:vocabulary-review-updated';
export const TODAY_MISSIONS_STORAGE_KEY = 'p-english:today-missions';

const SIX_HOURS = 6 * 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function dispatchVocabularyUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(VOCABULARY_REVIEW_UPDATED_EVENT));
  window.dispatchEvent(new Event(LOCAL_PROGRESS_UPDATED_EVENT));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStatus(value: unknown): VocabularyReviewStatus {
  if (value === 'known' || value === 'review' || value === 'difficult') return value;
  if (value === 'mastered') return 'known';
  if (value === 'learning' || value === 'due') return 'review';
  if (value === 'weak') return 'difficult';
  return 'new';
}

function normalizeReviewRecord(wordId: string, value: unknown): VocabularyReviewRecord {
  const raw = isRecord(value) ? value : {};
  const reviewCount = Number(raw.reviewCount ?? raw.correctCount ?? 0);
  const wrongCount = Number(raw.wrongCount ?? 0);
  return {
    wordId,
    status: normalizeStatus(raw.status),
    reviewCount: Number.isFinite(reviewCount) && reviewCount > 0 ? Math.floor(reviewCount) : 0,
    wrongCount: Number.isFinite(wrongCount) && wrongCount > 0 ? Math.floor(wrongCount) : 0,
    lastReviewedAt: typeof raw.lastReviewedAt === 'string' ? raw.lastReviewedAt : undefined,
    nextReviewAt: typeof raw.nextReviewAt === 'string' ? raw.nextReviewAt : undefined,
  };
}

function readStorageState(key: string): Record<string, VocabularyReviewRecord> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([wordId, value]) => [wordId, normalizeReviewRecord(wordId, value)]),
    );
  } catch {
    return {};
  }
}

function readReviewState(): Record<string, VocabularyReviewRecord> {
  const current = readStorageState(VOCABULARY_REVIEW_STORAGE_KEY);
  if (Object.keys(current).length > 0) return current;
  return readStorageState(LEGACY_VOCABULARY_REVIEW_STORAGE_KEY);
}

function writeReviewState(next: Record<string, VocabularyReviewRecord>) {
  const storage = getStorage();
  if (!storage) return next;
  try {
    storage.setItem(VOCABULARY_REVIEW_STORAGE_KEY, JSON.stringify(next));
    dispatchVocabularyUpdated();
  } catch {
    // Ignore quota / privacy-mode errors; callers still receive a safe value.
  }
  return next;
}

function findVocabularyByWordId(wordId: string): { vocabulary: AdaptedVocabularyItem; key: string } | null {
  const vocabulary = getAdaptedVocabularyItemByWordId(wordId);
  if (!vocabulary) return null;
  return { vocabulary, key: vocabulary.wordId };
}

export function isVocabularyDueToday(item: Pick<VocabularyReviewItem, 'status' | 'nextReviewAt'>) {
  if (item.status === 'review' || item.status === 'difficult') return true;
  if (!item.nextReviewAt) return false;
  const nextReviewTime = new Date(item.nextReviewAt).getTime();
  return Number.isFinite(nextReviewTime) && nextReviewTime <= Date.now();
}

function toReviewItem(vocabulary: AdaptedVocabularyItem, reviewState: Record<string, VocabularyReviewRecord>): VocabularyReviewItem {
  const key = vocabulary.wordId;
  const record = reviewState[key] ?? reviewState[vocabulary.id];
  const status = record?.status ?? 'new';
  const reviewCount = record?.reviewCount ?? 0;
  return {
    ...vocabulary,
    status,
    reviewCount,
    correctCount: status === 'known' ? Math.max(1, reviewCount) : reviewCount,
    wrongCount: record?.wrongCount ?? 0,
    lastReviewedAt: record?.lastReviewedAt,
    nextReviewAt: record?.nextReviewAt,
  };
}

function normalizeSearch(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

function incrementReviewMission() {
  const storage = getStorage();
  if (!storage) return;
  try {
    const raw = storage.getItem(TODAY_MISSIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const reviewWords = Number(parsed.review_words ?? parsed.reviewWords ?? 0);
    storage.setItem(
      TODAY_MISSIONS_STORAGE_KEY,
      JSON.stringify({
        ...parsed,
        review_words: Math.max(0, reviewWords) + 1,
        reviewWords: Math.max(0, reviewWords) + 1,
      }),
    );
    window.dispatchEvent(new Event(LOCAL_PROGRESS_UPDATED_EVENT));
  } catch {
    // Mission progress should never break vocabulary review.
  }
}

export function getNextReviewDate(status: VocabularyReviewStatus): string | undefined {
  const now = Date.now();
  if (status === 'difficult') return new Date(now + SIX_HOURS).toISOString();
  if (status === 'review') return new Date(now + ONE_DAY).toISOString();
  if (status === 'known') return new Date(now + 3 * ONE_DAY).toISOString();
  return undefined;
}

export function getAllVocabularyItems(): VocabularyReviewItem[] {
  const reviewState = readReviewState();
  return getAdaptedVocabularyItems().map((item) => toReviewItem(item, reviewState));
}

export function getVocabularyItemsByLesson(lessonId: string): VocabularyReviewItem[] {
  return getAllVocabularyItems().filter((item) => item.lessonId === lessonId);
}

export function getWeakVocabularyItems(): VocabularyReviewItem[] {
  return getAllVocabularyItems().filter((item) => item.status === 'difficult' || item.wrongCount > 0);
}

export function getDueReviewItems(): VocabularyReviewItem[] {
  return getAllVocabularyItems().filter((item) => isVocabularyDueToday(item));
}

export function getMasteredVocabularyItems(): VocabularyReviewItem[] {
  return getAllVocabularyItems().filter((item) => item.status === 'known');
}

export function searchVocabularyItems(query: string): VocabularyReviewItem[] {
  const cleanQuery = normalizeSearch(query);
  if (!cleanQuery) return getAllVocabularyItems();
  return getAllVocabularyItems().filter((item) => {
    const primaryHaystack = normalizeSearch([
      item.term,
      item.meaningVi,
      item.pronunciation ?? '',
      item.example,
      item.exampleMeaningVi,
      item.lessonTitle,
      item.unitTitle,
      item.simpleEnglishMeaning,
      item.vietnameseHint,
      item.flashcardPrompt,
      item.visualCategory ?? '',
      item.animatedSceneHint ?? '',
      item.usefulInSituation ?? '',
      item.confusionNoteVi ?? '',
      item.tags.join(' '),
    ].join(' '));

    if (primaryHaystack.includes(cleanQuery)) return true;

    const groupIntentQuery = cleanQuery.length >= 6 && cleanQuery.includes(' ');
    if (!groupIntentQuery) return false;

    return normalizeSearch([
      item.learningGroup.focusVi,
      item.learningGroup.strategyVi,
      item.learningGroup.memoryHookVi,
      item.learningGroup.reviewCueVi,
    ].join(' ')).includes(cleanQuery);
  });
}

export function getVocabularyStats(): VocabularyStats {
  const all = getAllVocabularyItems();
  const known = all.filter((item) => item.status === 'known').length;
  const review = all.filter((item) => item.status === 'review').length;
  const difficult = all.filter((item) => item.status === 'difficult' || item.wrongCount > 0).length;
  const today = all.filter((item) => isVocabularyDueToday(item)).length;
  return {
    total: all.length,
    known,
    review,
    difficult,
    today,
    progressPercent: all.length > 0 ? Math.round((known / all.length) * 100) : 0,
  };
}

export function saveWordReviewStatus(wordId: string, status: VocabularyReviewStatus): VocabularyReviewRecord | null {
  const found = findVocabularyByWordId(wordId);
  if (!found) return null;
  const reviewState = readReviewState();
  const existing = reviewState[found.key];
  const now = new Date().toISOString();
  const nextRecord: VocabularyReviewRecord = {
    wordId: found.key,
    status,
    reviewCount: status === 'new' ? 0 : (existing?.reviewCount ?? 0) + 1,
    wrongCount: status === 'difficult' ? (existing?.wrongCount ?? 0) + 1 : (existing?.wrongCount ?? 0),
    lastReviewedAt: status === 'new' ? existing?.lastReviewedAt : now,
    nextReviewAt: getNextReviewDate(status),
  };
  const nextState = { ...reviewState };
  if (status === 'new') {
    delete nextState[found.key];
  } else {
    nextState[found.key] = nextRecord;
  }
  writeReviewState(nextState);
  if (status !== 'new') {
    recordLearningActivity('vocabulary', found.key);
    incrementStudyDay();
    incrementReviewMission();
  }
  return nextRecord;
}

export function clearWordReviewStatus(wordId: string): VocabularyReviewRecord | null {
  return saveWordReviewStatus(wordId, 'new');
}

export function updateWordAfterCorrectAnswer(wordId: string): VocabularyReviewRecord | null {
  return saveWordReviewStatus(wordId, 'known');
}

export function updateWordAfterWrongAnswer(wordId: string): VocabularyReviewRecord | null {
  return saveWordReviewStatus(wordId, 'difficult');
}
