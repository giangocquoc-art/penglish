export type LearningActivityType = 'lesson' | 'vocabulary' | 'shadowing' | 'english-speed';

export type WaterStreakState = {
  current: number;
  lastVisitDate: string | null;
};

export type BubblesState = {
  current: number;
  max: 5;
  lastUpdatedAt: string | null;
};

export type UserProgressState = {
  waterStreak: WaterStreakState;
  bubbles: BubblesState;
};

export type DailyRewardState = UserProgressState & {
  /** @deprecated Legacy daily streak value. Use waterStreak.current. */
  streakDays: number;
  /** @deprecated Legacy bubble/lives value. Use bubbles.current. Never use this for daily streak. */
  bubbleStreak: number;
  /** @deprecated Legacy daily visit date. Use waterStreak.lastVisitDate. */
  lastActiveDate?: string;
  /** @deprecated Numeric mirror for old UI. Use bubbles.current. */
  maxBubbles: number;
  completedToday: string[];
  updatedAt: string;
};

export type UnifiedBubbleStreak = {
  current: number;
  max: number;
  lastCheckInAt?: string;
  label: string;
  displayLabel: string;
  progressPercent: number;
  isFull: boolean;
};

export type UnifiedWaterStreak = {
  current: number;
  lastVisitDate: string | null;
  label: string;
  displayLabel: string;
  progressPercent: number;
  isFull: boolean;
};

export const DAILY_REWARDS_STORAGE_KEY = 'penglish.daily.rewards.v1';
export const DAILY_REWARDS_UPDATED_EVENT = 'penglish.daily.rewards.updated';
export const DAILY_REWARDS_MAX_BUBBLES = 5;
export const BUBBLE_RECOVERY_MS = 30 * 60 * 1000;

const LEARNING_HEARTS_STORAGE_KEY = 'p-english:daily-hearts';
const LOCAL_PROGRESS_STORAGE_KEY = 'p-english:local-progress';

const EMPTY_DAILY_REWARD_STATE: DailyRewardState = {
  waterStreak: {
    current: 0,
    lastVisitDate: null,
  },
  bubbles: {
    current: DAILY_REWARDS_MAX_BUBBLES,
    max: DAILY_REWARDS_MAX_BUBBLES,
    lastUpdatedAt: null,
  },
  streakDays: 0,
  bubbleStreak: DAILY_REWARDS_MAX_BUBBLES,
  lastActiveDate: undefined,
  maxBubbles: DAILY_REWARDS_MAX_BUBBLES,
  completedToday: [],
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

function readJsonStorage(key: string): any | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function toLocalDateKey(date = new Date()) {
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

function dayDiff(fromKey: string | null | undefined, toKey: string) {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  if (!from || !to) return null;
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((end - start) / 86400000);
}

function dispatchDailyRewardsUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(DAILY_REWARDS_UPDATED_EVENT));
}

function normalizeCompletedToday(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)));
}

function normalizePositiveInteger(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : fallback;
}

function normalizeBubbleValue(value: unknown, fallback = DAILY_REWARDS_MAX_BUBBLES) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(DAILY_REWARDS_MAX_BUBBLES, Math.floor(numeric)));
}

function legacyWaterStreakFallback(raw: any) {
  const localProgress = readJsonStorage(LOCAL_PROGRESS_STORAGE_KEY);
  return Math.max(
    normalizePositiveInteger(raw?.waterStreak?.current),
    normalizePositiveInteger(raw?.streakDays),
    normalizePositiveInteger(raw?.currentStreak),
    normalizePositiveInteger(raw?.consecutiveDays),
    normalizePositiveInteger(localProgress?.currentStreak),
  );
}

function legacyLastVisitDateFallback(raw: any) {
  const localProgress = readJsonStorage(LOCAL_PROGRESS_STORAGE_KEY);
  const candidates = [
    raw?.waterStreak?.lastVisitDate,
    raw?.lastVisitDate,
    raw?.lastActiveDate,
    localProgress?.lastStudyDate,
  ];
  return candidates.find((item) => typeof item === 'string' && parseDateKey(item)) ?? null;
}

function legacyBubblesFallback(raw: any) {
  const hearts = readJsonStorage(LEARNING_HEARTS_STORAGE_KEY);
  const candidates = [
    hearts?.heartsLeft,
    raw?.bubbles?.current,
    raw?.bubbleLives,
    raw?.bubbles,
    raw?.bubbleStreak,
  ];

  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric)) return normalizeBubbleValue(numeric);
  }

  return DAILY_REWARDS_MAX_BUBBLES;
}

function legacyBubbleUpdatedAtFallback(raw: any, now: Date) {
  const hearts = readJsonStorage(LEARNING_HEARTS_STORAGE_KEY);
  const candidates = [
    hearts?.lastUpdatedAt,
    raw?.bubbles?.lastUpdatedAt,
    raw?.lastBubbleUpdatedAt,
    raw?.updatedAt,
  ];
  const value = candidates.find((item) => typeof item === 'string' && !Number.isNaN(new Date(item).getTime()));
  return value ?? now.toISOString();
}

export function normalizeBubbles(bubbles: Partial<BubblesState> | null | undefined, now = new Date()): BubblesState {
  const lastUpdatedAt = typeof bubbles?.lastUpdatedAt === 'string' && !Number.isNaN(new Date(bubbles.lastUpdatedAt).getTime()) ? bubbles.lastUpdatedAt : now.toISOString();
  const current = normalizeBubbleValue(bubbles?.current, DAILY_REWARDS_MAX_BUBBLES);

  if (current >= DAILY_REWARDS_MAX_BUBBLES) {
    return {
      current: DAILY_REWARDS_MAX_BUBBLES,
      max: DAILY_REWARDS_MAX_BUBBLES,
      lastUpdatedAt,
    };
  }

  const elapsed = Math.max(0, now.getTime() - new Date(lastUpdatedAt).getTime());
  const recovered = Math.floor(elapsed / BUBBLE_RECOVERY_MS);
  const nextCurrent = Math.min(DAILY_REWARDS_MAX_BUBBLES, current + recovered);

  return {
    current: nextCurrent,
    max: DAILY_REWARDS_MAX_BUBBLES,
    lastUpdatedAt: recovered > 0 ? new Date(new Date(lastUpdatedAt).getTime() + recovered * BUBBLE_RECOVERY_MS).toISOString() : lastUpdatedAt,
  };
}

function normalizeState(value: unknown, now = new Date()): DailyRewardState {
  const raw = value && typeof value === 'object' ? value as any : {};
  const today = toLocalDateKey(now);
  const waterStreakCurrent = legacyWaterStreakFallback(raw);
  const waterStreakLastVisitDate = legacyLastVisitDateFallback(raw);
  const completedToday = waterStreakLastVisitDate === today ? normalizeCompletedToday(raw.completedToday) : [];
  const bubbles = normalizeBubbles({
    current: legacyBubblesFallback(raw),
    max: DAILY_REWARDS_MAX_BUBBLES,
    lastUpdatedAt: legacyBubbleUpdatedAtFallback(raw, now),
  }, now);

  return {
    waterStreak: {
      current: waterStreakCurrent,
      lastVisitDate: waterStreakLastVisitDate,
    },
    bubbles,
    streakDays: waterStreakCurrent,
    bubbleStreak: bubbles.current,
    lastActiveDate: waterStreakLastVisitDate ?? undefined,
    maxBubbles: DAILY_REWARDS_MAX_BUBBLES,
    completedToday,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now.toISOString(),
  };
}

function readDailyRewardState(now = new Date()): DailyRewardState {
  const storage = getStorage();
  if (!storage) return { ...EMPTY_DAILY_REWARD_STATE, updatedAt: now.toISOString() };

  try {
    const raw = storage.getItem(DAILY_REWARDS_STORAGE_KEY);
    return normalizeState(raw ? JSON.parse(raw) : undefined, now);
  } catch {
    return normalizeState(undefined, now);
  }
}

function writeDailyRewardState(next: DailyRewardState) {
  const normalized = normalizeState(next);
  const storage = getStorage();
  if (!storage) return normalized;

  try {
    storage.setItem(DAILY_REWARDS_STORAGE_KEY, JSON.stringify(normalized));
    dispatchDailyRewardsUpdated();
  } catch {
    // Reward state is local-only and non-critical; ignore quota/privacy-mode failures.
  }

  return normalized;
}

function applyDailyVisit(state: DailyRewardState, now = new Date()) {
  const today = toLocalDateKey(now);
  const lastVisitDate = state.waterStreak.lastVisitDate;
  const diff = dayDiff(lastVisitDate, today);

  if (diff === 0 && state.waterStreak.current > 0) return state;

  const nextWaterStreak = diff === 1 ? state.waterStreak.current + 1 : 1;
  return writeDailyRewardState({
    ...state,
    waterStreak: {
      current: nextWaterStreak,
      lastVisitDate: today,
    },
    streakDays: nextWaterStreak,
    lastActiveDate: today,
    completedToday: diff === 0 ? state.completedToday : [],
    updatedAt: now.toISOString(),
  });
}

export function getDailyRewardState(): DailyRewardState {
  const now = new Date();
  const current = readDailyRewardState(now);
  const withDailyVisit = applyDailyVisit(current, now);
  const normalizedBubbles = normalizeBubbles(withDailyVisit.bubbles, now);

  if (normalizedBubbles.current !== withDailyVisit.bubbles.current || normalizedBubbles.lastUpdatedAt !== withDailyVisit.bubbles.lastUpdatedAt) {
    return writeDailyRewardState({ ...withDailyVisit, bubbles: normalizedBubbles, updatedAt: now.toISOString() });
  }

  return withDailyVisit;
}

export function getUserProgress(state: Partial<DailyRewardState> | null | undefined = getDailyRewardState()): UserProgressState {
  const normalized = normalizeState(state);
  return {
    waterStreak: normalized.waterStreak,
    bubbles: normalized.bubbles,
  };
}

export function getUnifiedBubbles(state: Partial<DailyRewardState> | null | undefined = getDailyRewardState()): UnifiedBubbleStreak {
  const normalized = normalizeState(state);
  const max = DAILY_REWARDS_MAX_BUBBLES;
  const current = Math.max(0, Math.min(max, normalized.bubbles.current));
  const label = `Bọt biển ${current}/${max}`;

  return {
    current,
    max,
    lastCheckInAt: normalized.bubbles.lastUpdatedAt ?? undefined,
    label,
    displayLabel: label,
    progressPercent: max > 0 ? Math.round((current / max) * 100) : 0,
    isFull: current >= max,
  };
}

export function getWaterStreak(state: Partial<DailyRewardState> | null | undefined = getDailyRewardState()): UnifiedWaterStreak {
  const normalized = normalizeState(state);
  const current = Math.max(0, normalized.waterStreak.current);
  const label = current === 1 ? '1 ngày liên tiếp' : `${current} ngày liên tiếp`;

  return {
    current,
    lastVisitDate: normalized.waterStreak.lastVisitDate,
    label,
    displayLabel: `Chuỗi nước: ${label}`,
    progressPercent: Math.min(100, Math.round((Math.min(current, 7) / 7) * 100)),
    isFull: current >= 7,
  };
}

/** @deprecated Use getUnifiedBubbles() for bọt biển/lives. Use getWaterStreak() for daily streak. */
export function getUnifiedBubbleStreak(state: Partial<DailyRewardState> | null | undefined = getDailyRewardState()): UnifiedBubbleStreak {
  return getUnifiedBubbles(state);
}

export function hasLearningActivityToday(state = getDailyRewardState()) {
  return state.waterStreak.lastVisitDate === toLocalDateKey() && state.completedToday.length > 0;
}

export function formatLearningActivityId(activityType: LearningActivityType, activityId: string) {
  return `${activityType}:${activityId.trim()}`;
}

export function recordLearningActivity(activityType: LearningActivityType, activityId: string): DailyRewardState {
  const cleanActivityId = activityId.trim();
  if (!cleanActivityId) return getDailyRewardState();

  const now = new Date();
  const today = toLocalDateKey(now);
  const current = getDailyRewardState();
  const completedToday = current.waterStreak.lastVisitDate === today ? current.completedToday : [];
  const activityKey = formatLearningActivityId(activityType, cleanActivityId);
  const nextCompletedToday = completedToday.includes(activityKey) ? completedToday : [...completedToday, activityKey];

  return writeDailyRewardState({
    ...current,
    completedToday: nextCompletedToday,
    updatedAt: now.toISOString(),
  });
}
