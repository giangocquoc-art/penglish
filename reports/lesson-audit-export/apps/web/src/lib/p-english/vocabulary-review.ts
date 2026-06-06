import { incrementStudyDay, LOCAL_PROGRESS_UPDATED_EVENT } from './local-progress';
import {
  getAdaptedVocabularyItemByWordId,
  getAdaptedVocabularyItems,
  type AdaptedVocabularyItem,
} from './vocabularyAdapter';

export type VocabularyReviewStatus = 'new' | 'learning' | 'due' | 'weak' | 'mastered';

export type VocabularyReviewRecord = {
  wordId: string;
  status: VocabularyReviewStatus;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
};

export type VocabularyReviewItem = AdaptedVocabularyItem & {
  status: VocabularyReviewStatus;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
};

export type VocabularyStats = {
  total: number;
  mastered: number;
  due: number;
  weak: number;
  learning: number;
  progressPercent: number;
};

export const VOCABULARY_REVIEW_STORAGE_KEY = 'p-english:vocabulary-review';
export const VOCABULARY_REVIEW_UPDATED_EVENT = 'p-english:vocabulary-review-updated';
export const TODAY_MISSIONS_STORAGE_KEY = 'p-english:today-missions';

const TEN_MINUTES = 10 * 60 * 1000;
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
  if (value === 'learning' || value === 'due' || value === 'weak' || value === 'mastered') return value;
  return 'new';
}

function normalizeReviewRecord(wordId: string, value: unknown): VocabularyReviewRecord {
  const raw = isRecord(value) ? value : {};
  const correctCount = Number(raw.correctCount ?? 0);
  const wrongCount = Number(raw.wrongCount ?? 0);
  return {
    wordId,
    status: normalizeStatus(raw.status),
    correctCount: Number.isFinite(correctCount) && correctCount > 0 ? Math.floor(correctCount) : 0,
    wrongCount: Number.isFinite(wrongCount) && wrongCount > 0 ? Math.floor(wrongCount) : 0,
    lastReviewedAt: typeof raw.lastReviewedAt === 'string' ? raw.lastReviewedAt : undefined,
    nextReviewAt: typeof raw.nextReviewAt === 'string' ? raw.nextReviewAt : undefined,
  };
}

function readReviewState(): Record<string, VocabularyReviewRecord> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(VOCABULARY_REVIEW_STORAGE_KEY);
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

function statusFromRecord(record?: VocabularyReviewRecord): VocabularyReviewStatus {
  if (!record) return 'new';
  if (record.status === 'mastered' || record.status === 'weak') return record.status;
  if (record.nextReviewAt && new Date(record.nextReviewAt).getTime() <= Date.now() && record.status !== 'new') return 'due';
  return record.status;
}

function toReviewItem(vocabulary: AdaptedVocabularyItem, reviewState: Record<string, VocabularyReviewRecord>): VocabularyReviewItem {
  const key = vocabulary.wordId;
  const record = reviewState[key] ?? reviewState[vocabulary.id];
  return {
    ...vocabulary,
    status: statusFromRecord(record),
    correctCount: record?.correctCount ?? 0,
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
  if (status === 'weak') return new Date(now + TEN_MINUTES).toISOString();
  if (status === 'learning') return new Date(now + ONE_DAY).toISOString();
  if (status === 'due') return new Date(now + ONE_DAY).toISOString();
  if (status === 'mastered') return new Date(now + 7 * ONE_DAY).toISOString();
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
  return getAllVocabularyItems().filter((item) => item.status === 'weak' || item.wrongCount > 0);
}

export function getDueReviewItems(): VocabularyReviewItem[] {
  return getAllVocabularyItems().filter((item) => item.status === 'due' || Boolean(item.nextReviewAt && new Date(item.nextReviewAt).getTime() <= Date.now()));
}

export function getMasteredVocabularyItems(): VocabularyReviewItem[] {
  return getAllVocabularyItems().filter((item) => item.status === 'mastered');
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
  const mastered = all.filter((item) => item.status === 'mastered').length;
  const due = all.filter((item) => item.status === 'due' || Boolean(item.nextReviewAt && new Date(item.nextReviewAt).getTime() <= Date.now())).length;
  const weak = all.filter((item) => item.status === 'weak' || item.wrongCount > 0).length;
  const learning = all.filter((item) => item.status === 'learning').length;
  return {
    total: all.length,
    mastered,
    due,
    weak,
    learning,
    progressPercent: all.length > 0 ? Math.round((mastered / all.length) * 100) : 0,
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
    correctCount: existing?.correctCount ?? 0,
    wrongCount: existing?.wrongCount ?? 0,
    lastReviewedAt: now,
    nextReviewAt: getNextReviewDate(status),
  };
  writeReviewState({ ...reviewState, [found.key]: nextRecord });
  incrementStudyDay();
  incrementReviewMission();
  return nextRecord;
}

export function updateWordAfterCorrectAnswer(wordId: string): VocabularyReviewRecord | null {
  const found = findVocabularyByWordId(wordId);
  if (!found) return null;
  const reviewState = readReviewState();
  const existing = reviewState[found.key];
  const correctCount = (existing?.correctCount ?? 0) + 1;
  const status: VocabularyReviewStatus = correctCount >= 2 ? 'mastered' : 'learning';
  const now = new Date().toISOString();
  const nextRecord: VocabularyReviewRecord = {
    wordId: found.key,
    status,
    correctCount,
    wrongCount: existing?.wrongCount ?? 0,
    lastReviewedAt: now,
    nextReviewAt: getNextReviewDate(status),
  };
  writeReviewState({ ...reviewState, [found.key]: nextRecord });
  incrementStudyDay();
  incrementReviewMission();
  return nextRecord;
}

export function updateWordAfterWrongAnswer(wordId: string): VocabularyReviewRecord | null {
  const found = findVocabularyByWordId(wordId);
  if (!found) return null;
  const reviewState = readReviewState();
  const existing = reviewState[found.key];
  const status: VocabularyReviewStatus = 'weak';
  const now = new Date().toISOString();
  const nextRecord: VocabularyReviewRecord = {
    wordId: found.key,
    status,
    correctCount: existing?.correctCount ?? 0,
    wrongCount: (existing?.wrongCount ?? 0) + 1,
    lastReviewedAt: now,
    nextReviewAt: getNextReviewDate(status),
  };
  writeReviewState({ ...reviewState, [found.key]: nextRecord });
  incrementStudyDay();
  incrementReviewMission();
  return nextRecord;
}
