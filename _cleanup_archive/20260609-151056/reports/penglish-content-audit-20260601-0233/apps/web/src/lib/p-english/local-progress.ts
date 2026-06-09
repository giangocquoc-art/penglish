export const LOCAL_PROGRESS_STORAGE_KEY = 'p-english:local-progress';
export const LOCAL_PROGRESS_UPDATED_EVENT = 'p-english:local-progress-updated';

type LocalProgressState = {
  currentStreak: number;
  lastStudyDate: string | null;
  completedLessons: string[];
};

const EMPTY_PROGRESS: LocalProgressState = {
  currentStreak: 0,
  lastStudyDate: null,
  completedLessons: [],
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

function parseDateKey(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function dayDiff(fromKey: string | null, toKey: string) {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  if (!from || !to) return null;
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((end - start) / 86400000);
}

function normalizeProgress(value: unknown): LocalProgressState {
  const raw = value && typeof value === 'object' ? value as Partial<LocalProgressState> : {};
  const currentStreak = Number(raw.currentStreak);
  return {
    currentStreak: Number.isFinite(currentStreak) && currentStreak > 0 ? Math.floor(currentStreak) : 0,
    lastStudyDate: typeof raw.lastStudyDate === 'string' && parseDateKey(raw.lastStudyDate) ? raw.lastStudyDate : null,
    completedLessons: Array.isArray(raw.completedLessons)
      ? Array.from(new Set(raw.completedLessons.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)))
      : [],
  };
}

function readProgress(): LocalProgressState {
  const storage = getStorage();
  if (!storage) return EMPTY_PROGRESS;
  try {
    const raw = storage.getItem(LOCAL_PROGRESS_STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return EMPTY_PROGRESS;
  }
}

function dispatchProgressUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(LOCAL_PROGRESS_UPDATED_EVENT));
}

function writeProgress(next: LocalProgressState) {
  const storage = getStorage();
  if (!storage) return next;
  const normalized = normalizeProgress(next);
  try {
    storage.setItem(LOCAL_PROGRESS_STORAGE_KEY, JSON.stringify(normalized));
    dispatchProgressUpdated();
  } catch {
    // Ignore storage quota / privacy mode errors. Callers still receive a safe state.
  }
  return normalized;
}

export function getCurrentStreak() {
  return readProgress().currentStreak;
}

export function getLastStudyDate() {
  return readProgress().lastStudyDate;
}

export function getCompletedLessons() {
  return readProgress().completedLessons;
}

export function incrementStudyDay() {
  const current = readProgress();
  const today = toLocalDateKey();
  const diff = dayDiff(current.lastStudyDate, today);

  if (diff === 0) return current.currentStreak;

  const nextStreak = diff === 1 ? current.currentStreak + 1 : 1;
  const next = writeProgress({ ...current, currentStreak: nextStreak, lastStudyDate: today });
  return next.currentStreak;
}

export function markLessonCompleted(lessonId: string) {
  const cleanLessonId = lessonId.trim();
  if (!cleanLessonId) return getCompletedLessons();
  const current = readProgress();
  if (current.completedLessons.includes(cleanLessonId)) return current.completedLessons;
  return writeProgress({ ...current, completedLessons: [...current.completedLessons, cleanLessonId] }).completedLessons;
}
