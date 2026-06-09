export type LearningHeartsState = {
  maxHearts: number;
  heartsLeft: number;
  wrongCountToday: number;
  vietnamDayKey: string;
  lockedUntilVietnamMidnight?: string;
  lastUpdatedAt: string;
};

export const MAX_DAILY_HEARTS = 5;
export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';
export const LEARNING_HEARTS_STORAGE_KEY = 'p-english:daily-hearts';
export const LEARNING_HEARTS_UPDATED_EVENT = 'p-english:hearts-updated';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function dispatchHeartsUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(LEARNING_HEARTS_UPDATED_EVENT));
}

function toVietnamParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const getPart = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
    second: getPart('second'),
  };
}

export function getVietnamDayKey(date = new Date()): string {
  const parts = toVietnamParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function getNextVietnamMidnight(date = new Date()): string {
  const parts = toVietnamParts(date);
  // Vietnam currently uses UTC+7 without daylight saving time. We intentionally compute
  // the next Vietnam calendar midnight as UTC date parts minus seven hours, avoiding
  // local machine timezone and avoiding external date libraries.
  const nextVietnamMidnightAsUtcMs = Date.UTC(parts.year, parts.month - 1, parts.day + 1, 0, 0, 0) - 7 * 60 * 60 * 1000;
  return new Date(nextVietnamMidnightAsUtcMs).toISOString();
}

function defaultState(now = new Date()): LearningHeartsState {
  return {
    maxHearts: MAX_DAILY_HEARTS,
    heartsLeft: MAX_DAILY_HEARTS,
    wrongCountToday: 0,
    vietnamDayKey: getVietnamDayKey(now),
    lastUpdatedAt: now.toISOString(),
  };
}

function normalizeState(input: Partial<LearningHeartsState> | null | undefined, now: Date): LearningHeartsState {
  const fallback = defaultState(now);
  if (!input || typeof input !== 'object') return fallback;

  return {
    maxHearts: MAX_DAILY_HEARTS,
    heartsLeft: Math.max(0, Math.min(MAX_DAILY_HEARTS, Number(input.heartsLeft ?? MAX_DAILY_HEARTS))),
    wrongCountToday: Math.max(0, Number(input.wrongCountToday ?? 0)),
    vietnamDayKey: typeof input.vietnamDayKey === 'string' ? input.vietnamDayKey : fallback.vietnamDayKey,
    lockedUntilVietnamMidnight: typeof input.lockedUntilVietnamMidnight === 'string' ? input.lockedUntilVietnamMidnight : undefined,
    lastUpdatedAt: typeof input.lastUpdatedAt === 'string' ? input.lastUpdatedAt : fallback.lastUpdatedAt,
  };
}

export function getLearningHeartsState(): LearningHeartsState {
  const now = new Date();
  const currentVietnamDayKey = getVietnamDayKey(now);

  if (!canUseLocalStorage()) return defaultState(now);

  try {
    const raw = window.localStorage.getItem(LEARNING_HEARTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const state = raw ? normalizeState(parsed, now) : defaultState(now);

    if (state.vietnamDayKey !== currentVietnamDayKey) {
      const reset = defaultState(now);
      saveLearningHeartsState(reset);
      return reset;
    }

    if (state.lockedUntilVietnamMidnight && now.getTime() >= new Date(state.lockedUntilVietnamMidnight).getTime()) {
      const reset = defaultState(now);
      saveLearningHeartsState(reset);
      return reset;
    }

    const next = { ...state, lastUpdatedAt: now.toISOString() };
    saveLearningHeartsState(next);
    return next;
  } catch {
    return defaultState(now);
  }
}

export function saveLearningHeartsState(state: LearningHeartsState): boolean {
  if (!canUseLocalStorage()) return false;

  try {
    window.localStorage.setItem(LEARNING_HEARTS_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function isLearningLocked(state: LearningHeartsState): boolean {
  if (!state.lockedUntilVietnamMidnight) return false;
  return Date.now() < new Date(state.lockedUntilVietnamMidnight).getTime();
}

export function getLockRemainingText(state: LearningHeartsState): string {
  if (!state.lockedUntilVietnamMidnight) return 'sắp mở lại';
  const remainingMs = new Date(state.lockedUntilVietnamMidnight).getTime() - Date.now();
  if (!Number.isFinite(remainingMs) || remainingMs <= 60_000) return 'sắp mở lại';

  const totalMinutes = Math.ceil(remainingMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `còn ${hours} giờ ${minutes} phút`;
  if (hours > 0) return `còn ${hours} giờ`;
  return `còn ${minutes} phút`;
}

export function loseHeart(reason?: string): LearningHeartsState {
  const current = getLearningHeartsState();
  if (isLearningLocked(current)) return current;

  const now = new Date();
  const heartsLeft = Math.max(0, current.heartsLeft - 1);
  const next: LearningHeartsState = {
    ...current,
    heartsLeft,
    wrongCountToday: current.wrongCountToday + 1,
    lastUpdatedAt: now.toISOString(),
    lockedUntilVietnamMidnight: heartsLeft === 0 ? getNextVietnamMidnight(now) : current.lockedUntilVietnamMidnight,
  };

  saveLearningHeartsState(next);
  if (reason) {
    // Kept for lightweight debugging without exposing a user-facing dev control.
    console.debug?.('[P-English hearts] lost heart:', reason, next);
  }
  dispatchHeartsUpdated();
  return next;
}

export function resetLearningHeartsForDev(): LearningHeartsState {
  const reset = defaultState(new Date());
  saveLearningHeartsState(reset);
  dispatchHeartsUpdated();
  return reset;
}
