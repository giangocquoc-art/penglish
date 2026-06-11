export type LearningHeartsState = {
  maxHearts: number;
  heartsLeft: number;
  wrongCountToday: number;
  vietnamDayKey: string;
  /** @deprecated Older midnight lock field. Bubbles now recover one-by-one every 30 minutes. */
  lockedUntilVietnamMidnight?: string;
  lastUpdatedAt: string;
  nextRecoveryAt?: string;
};

export const MAX_DAILY_HEARTS = 5;
export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';
export const LEARNING_HEARTS_STORAGE_KEY = 'p-english:daily-hearts';
export const LEARNING_HEARTS_UPDATED_EVENT = 'p-english:hearts-updated';
export const BUBBLE_RECOVERY_MS = 30 * 60 * 1000;
export const OUT_OF_BUBBLES_MESSAGE = 'Bạn đã hết bọt biển rồi. Nghỉ một chút nhé, Poo sẽ hồi 1 bọt biển sau 30 phút.';

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

function normalizeBubbleCount(value: unknown, fallback = MAX_DAILY_HEARTS) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(MAX_DAILY_HEARTS, Math.floor(numeric)));
}

function normalizeState(input: Partial<LearningHeartsState> | null | undefined, now: Date): LearningHeartsState {
  const fallback = defaultState(now);
  if (!input || typeof input !== 'object') return fallback;

  const lastUpdatedAt = typeof input.lastUpdatedAt === 'string' && !Number.isNaN(new Date(input.lastUpdatedAt).getTime()) ? input.lastUpdatedAt : fallback.lastUpdatedAt;
  const base: LearningHeartsState = {
    maxHearts: MAX_DAILY_HEARTS,
    heartsLeft: normalizeBubbleCount(input.heartsLeft, MAX_DAILY_HEARTS),
    wrongCountToday: Math.max(0, Number(input.wrongCountToday ?? 0)),
    vietnamDayKey: typeof input.vietnamDayKey === 'string' ? input.vietnamDayKey : fallback.vietnamDayKey,
    lockedUntilVietnamMidnight: undefined,
    lastUpdatedAt,
  };

  return normalizeBubbles(base, now);
}

export function normalizeBubbles(state: LearningHeartsState, now = new Date()): LearningHeartsState {
  if (state.heartsLeft >= MAX_DAILY_HEARTS) {
    return {
      ...state,
      maxHearts: MAX_DAILY_HEARTS,
      heartsLeft: MAX_DAILY_HEARTS,
      lockedUntilVietnamMidnight: undefined,
      nextRecoveryAt: undefined,
    };
  }

  const lastUpdatedAt = typeof state.lastUpdatedAt === 'string' && !Number.isNaN(new Date(state.lastUpdatedAt).getTime()) ? state.lastUpdatedAt : now.toISOString();
  const elapsed = Math.max(0, now.getTime() - new Date(lastUpdatedAt).getTime());
  const recovered = Math.floor(elapsed / BUBBLE_RECOVERY_MS);
  const heartsLeft = Math.min(MAX_DAILY_HEARTS, state.heartsLeft + recovered);
  const recoveryBase = recovered > 0 ? new Date(new Date(lastUpdatedAt).getTime() + recovered * BUBBLE_RECOVERY_MS).toISOString() : lastUpdatedAt;

  return {
    ...state,
    maxHearts: MAX_DAILY_HEARTS,
    heartsLeft,
    lockedUntilVietnamMidnight: undefined,
    lastUpdatedAt: recoveryBase,
    nextRecoveryAt: heartsLeft < MAX_DAILY_HEARTS ? new Date(new Date(recoveryBase).getTime() + BUBBLE_RECOVERY_MS).toISOString() : undefined,
  };
}

export function getLearningHeartsState(): LearningHeartsState {
  const now = new Date();

  if (!canUseLocalStorage()) return defaultState(now);

  try {
    const raw = window.localStorage.getItem(LEARNING_HEARTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const state = raw ? normalizeState(parsed, now) : defaultState(now);
    saveLearningHeartsState(state);
    return state;
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
  return normalizeBubbles(state).heartsLeft <= 0;
}

export function getLockRemainingText(state: LearningHeartsState): string {
  const normalized = normalizeBubbles(state);
  if (normalized.heartsLeft >= MAX_DAILY_HEARTS) return 'đã đầy bọt biển';
  const nextRecoveryAt = normalized.nextRecoveryAt ?? new Date(new Date(normalized.lastUpdatedAt).getTime() + BUBBLE_RECOVERY_MS).toISOString();
  const remainingMs = new Date(nextRecoveryAt).getTime() - Date.now();
  if (!Number.isFinite(remainingMs) || remainingMs <= 60_000) return 'sắp hồi 1 bọt biển';

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
  const next: LearningHeartsState = normalizeBubbles({
    ...current,
    heartsLeft,
    wrongCountToday: current.wrongCountToday + 1,
    lastUpdatedAt: heartsLeft < MAX_DAILY_HEARTS ? now.toISOString() : current.lastUpdatedAt,
    lockedUntilVietnamMidnight: undefined,
  }, now);

  saveLearningHeartsState(next);
  if (reason) {
    console.debug?.('[P-English bubbles] lost bubble:', reason, next);
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
