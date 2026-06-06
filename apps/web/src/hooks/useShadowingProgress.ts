import { useCallback, useEffect, useMemo, useState } from 'react';
import { recordLearningActivity } from '../lib/p-english/daily-rewards';

export const SHADOWING_PROGRESS_STORAGE_KEY = 'penglish.shadowing.progress.v1';

export type ShadowingProgressEntry = {
  currentLineIndex: number;
  practicedLineIds: string[];
  difficultLineIds: string[];
  updatedAt: string;
};

type ShadowingProgressStore = Record<string, ShadowingProgressEntry>;

type ProgressPatch = Partial<Pick<ShadowingProgressEntry, 'currentLineIndex' | 'practicedLineIds' | 'difficultLineIds'>>;

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function clampLineIndex(index: number, lineCount: number) {
  if (lineCount <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), lineCount - 1);
}

function uniqueValidLineIds(lineIds: string[], allowedLineIds: string[]) {
  const allowed = new Set(allowedLineIds);
  return Array.from(new Set(lineIds.filter((lineId) => allowed.has(lineId))));
}

function normalizeEntry(entry: unknown, lineIds: string[]): ShadowingProgressEntry {
  const candidate = entry && typeof entry === 'object' ? entry as Partial<ShadowingProgressEntry> : {};
  return {
    currentLineIndex: clampLineIndex(typeof candidate.currentLineIndex === 'number' ? candidate.currentLineIndex : 0, lineIds.length),
    practicedLineIds: uniqueValidLineIds(Array.isArray(candidate.practicedLineIds) ? candidate.practicedLineIds.filter((lineId): lineId is string => typeof lineId === 'string') : [], lineIds),
    difficultLineIds: uniqueValidLineIds(Array.isArray(candidate.difficultLineIds) ? candidate.difficultLineIds.filter((lineId): lineId is string => typeof lineId === 'string') : [], lineIds),
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
  };
}

function readStore(): ShadowingProgressStore {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(SHADOWING_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as ShadowingProgressStore : {};
  } catch {
    return {};
  }
}

function writeStore(store: ShadowingProgressStore) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(SHADOWING_PROGRESS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage may be unavailable or full; progress remains in memory for this session.
  }
}

function readLessonProgress(lessonId: string | undefined, lineIds: string[]) {
  if (!lessonId) return normalizeEntry(undefined, lineIds);
  const store = readStore();
  return normalizeEntry(store[lessonId], lineIds);
}

export function useShadowingProgress(lessonId: string | undefined, lineIds: string[]) {
  const [progress, setProgress] = useState<ShadowingProgressEntry>(() => readLessonProgress(lessonId, lineIds));

  useEffect(() => {
    setProgress(readLessonProgress(lessonId, lineIds));
  }, [lessonId, lineIds]);

  const saveProgress = useCallback((patch: ProgressPatch | ((current: ShadowingProgressEntry) => ProgressPatch)) => {
    setProgress((current) => {
      const resolvedPatch = typeof patch === 'function' ? patch(current) : patch;
      const next = normalizeEntry({
        ...current,
        ...resolvedPatch,
        updatedAt: new Date().toISOString(),
      }, lineIds);

      if (lessonId) {
        const store = readStore();
        writeStore({
          ...store,
          [lessonId]: next,
        });
      }

      return next;
    });
  }, [lessonId, lineIds]);

  const setCurrentLineIndex = useCallback((index: number) => {
    saveProgress({ currentLineIndex: clampLineIndex(index, lineIds.length) });
  }, [lineIds.length, saveProgress]);

  const goNext = useCallback(() => {
    saveProgress((current) => ({ currentLineIndex: clampLineIndex(current.currentLineIndex + 1, lineIds.length) }));
  }, [lineIds.length, saveProgress]);

  const goPrevious = useCallback(() => {
    saveProgress((current) => ({ currentLineIndex: clampLineIndex(current.currentLineIndex - 1, lineIds.length) }));
  }, [lineIds.length, saveProgress]);

  const markPracticed = useCallback((lineId?: string) => {
    if (!lineId) return;
    saveProgress((current) => ({
      practicedLineIds: current.practicedLineIds.includes(lineId) ? current.practicedLineIds : [...current.practicedLineIds, lineId],
    }));
    recordLearningActivity('shadowing', lessonId ? `${lessonId}:${lineId}` : lineId);
  }, [lessonId, saveProgress]);

  const toggleDifficult = useCallback((lineId?: string) => {
    if (!lineId) return;
    saveProgress((current) => ({
      difficultLineIds: current.difficultLineIds.includes(lineId)
        ? current.difficultLineIds.filter((item) => item !== lineId)
        : [...current.difficultLineIds, lineId],
    }));
  }, [saveProgress]);

  const practicedLineIdSet = useMemo(() => new Set(progress.practicedLineIds), [progress.practicedLineIds]);
  const difficultLineIdSet = useMemo(() => new Set(progress.difficultLineIds), [progress.difficultLineIds]);

  return {
    currentLineIndex: progress.currentLineIndex,
    practicedLineIds: progress.practicedLineIds,
    difficultLineIds: progress.difficultLineIds,
    practicedCount: progress.practicedLineIds.length,
    difficultCount: progress.difficultLineIds.length,
    updatedAt: progress.updatedAt,
    setCurrentLineIndex,
    goNext,
    goPrevious,
    markPracticed,
    toggleDifficult,
    isPracticed: (lineId?: string) => Boolean(lineId && practicedLineIdSet.has(lineId)),
    isDifficult: (lineId?: string) => Boolean(lineId && difficultLineIdSet.has(lineId)),
  };
}
