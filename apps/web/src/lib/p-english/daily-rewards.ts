export type LearningActivityType = 'lesson' | 'vocabulary' | 'shadowing' | 'english-speed';

export type DailyRewardState = {
  /** @deprecated Kept only for old local data migration. UI must use bubbleStreak via getUnifiedBubbleStreak(). */
  streakDays: number;
  bubbleStreak: number;
  lastActiveDate?: string;
  bubbles: number;
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

export const DAILY_REWARDS_STORAGE_KEY = 'penglish.daily.rewards.v1';
export const DAILY_REWARDS_UPDATED_EVENT = 'penglish.daily.rewards.updated';
export const DAILY_REWARDS_MAX_BUBBLES = 5;

const EMPTY_DAILY_REWARD_STATE: DailyRewardState = {
  streakDays: 0,
  bubbleStreak: 0,
  bubbles: 0,
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

function dayDiff(fromKey: string | undefined, toKey: string) {
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

function normalizeBubbleValue(value: unknown, max: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.max(0, Math.min(max, Math.floor(numeric))) : 0;
}

function normalizeState(value: unknown, now = new Date()): DailyRewardState {
  const raw = value && typeof value === 'object' ? value as Partial<DailyRewardState> : {};
  const streakDays = Number(raw.streakDays);
  const maxBubbles = Number(raw.maxBubbles);
  const bubbles = Number(raw.bubbles);
  const bubbleStreak = Number(raw.bubbleStreak);
  const lastActiveDate = typeof raw.lastActiveDate === 'string' && parseDateKey(raw.lastActiveDate) ? raw.lastActiveDate : undefined;
  const today = toLocalDateKey(now);
  const completedToday = lastActiveDate === today ? normalizeCompletedToday(raw.completedToday) : [];
  const normalizedMaxBubbles = Number.isFinite(maxBubbles) && maxBubbles > 0 ? Math.floor(maxBubbles) : DAILY_REWARDS_MAX_BUBBLES;
  const normalizedStreakDays = Number.isFinite(streakDays) && streakDays > 0 ? Math.floor(streakDays) : 0;
  const normalizedBubbles = Number.isFinite(bubbles) ? Math.max(0, Math.min(normalizedMaxBubbles, Math.floor(bubbles))) : 0;
  const canonicalBubbleStreak = Number.isFinite(bubbleStreak)
    ? normalizeBubbleValue(bubbleStreak, normalizedMaxBubbles)
    : normalizedBubbles > 0
      ? normalizedBubbles
      : normalizeBubbleValue(normalizedStreakDays, normalizedMaxBubbles);

  return {
    streakDays: normalizedStreakDays,
    bubbleStreak: canonicalBubbleStreak,
    lastActiveDate,
    bubbles: canonicalBubbleStreak,
    maxBubbles: normalizedMaxBubbles,
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
    return { ...EMPTY_DAILY_REWARD_STATE, updatedAt: now.toISOString() };
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

export function getDailyRewardState(): DailyRewardState {
  const now = new Date();
  const current = readDailyRewardState(now);
  const today = toLocalDateKey(now);

  if (current.lastActiveDate && current.lastActiveDate !== today && current.completedToday.length > 0) {
    return writeDailyRewardState({ ...current, completedToday: [], updatedAt: now.toISOString() });
  }

  return current;
}

export function getUnifiedBubbleStreak(state: Partial<DailyRewardState> | null | undefined = getDailyRewardState()): UnifiedBubbleStreak {
  const normalized = normalizeState(state);
  const max = normalized.maxBubbles || DAILY_REWARDS_MAX_BUBBLES;
  const current = Math.max(0, Math.min(max, normalized.bubbleStreak));
  const label = `Bọt biển ${current}/${max}`;

  return {
    current,
    max,
    lastCheckInAt: normalized.lastActiveDate,
    label,
    displayLabel: label,
    progressPercent: max > 0 ? Math.round((current / max) * 100) : 0,
    isFull: current >= max,
  };
}

export function hasLearningActivityToday(state = getDailyRewardState()) {
  return state.lastActiveDate === toLocalDateKey() && state.completedToday.length > 0;
}

export function formatLearningActivityId(activityType: LearningActivityType, activityId: string) {
  return `${activityType}:${activityId.trim()}`;
}

export function recordLearningActivity(activityType: LearningActivityType, activityId: string): DailyRewardState {
  const cleanActivityId = activityId.trim();
  if (!cleanActivityId) return getDailyRewardState();

  const now = new Date();
  const today = toLocalDateKey(now);
  const current = readDailyRewardState(now);
  const previousLastActiveDate = current.lastActiveDate;
  const diff = dayDiff(previousLastActiveDate, today);
  const firstActivityToday = previousLastActiveDate !== today;
  const completedToday = firstActivityToday ? [] : current.completedToday;
  const activityKey = formatLearningActivityId(activityType, cleanActivityId);
  const nextCompletedToday = completedToday.includes(activityKey) ? completedToday : [...completedToday, activityKey];
  const maxBubbles = current.maxBubbles || DAILY_REWARDS_MAX_BUBBLES;
  const nextBubbleStreak = firstActivityToday
    ? diff === 1
      ? Math.min(maxBubbles, current.bubbleStreak + 1)
      : 1
    : current.bubbleStreak || 1;

  return writeDailyRewardState({
    streakDays: nextBubbleStreak,
    bubbleStreak: nextBubbleStreak,
    lastActiveDate: today,
    bubbles: nextBubbleStreak,
    maxBubbles,
    completedToday: nextCompletedToday,
    updatedAt: now.toISOString(),
  });
}
