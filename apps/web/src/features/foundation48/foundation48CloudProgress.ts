import { supabase } from '../../lib/supabaseClient';
import type { Foundation48ProgressDay, Foundation48ProgressState } from './foundation48Types';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48Progress, saveFoundation48ProgressSnapshot } from './foundation48Progress';

const TABLE_NAME = 'foundation48_progress';

type Foundation48CloudRow = {
  user_id: string;
  day_number: number;
  current_step: number | null;
  completed: boolean | null;
  score: number | null;
  payload: Foundation48ProgressDay | null;
  updated_at?: string | null;
};

function normalizeDay(value: Foundation48ProgressDay | undefined | null): Foundation48ProgressDay {
  return {
    ...(value || {}),
    completedSteps: Array.isArray(value?.completedSteps) ? value.completedSteps : [],
    challengeResults: value?.challengeResults && typeof value.challengeResults === 'object' ? value.challengeResults : {},
    mistakes: Array.isArray(value?.mistakes) ? value.mistakes : [],
  };
}

function currentStepFromDay(day: Foundation48ProgressDay | undefined | null) {
  return Math.max(1, normalizeDay(day).completedSteps?.length || 1);
}

function scoreFromDay(day: Foundation48ProgressDay | undefined | null) {
  const normalized = normalizeDay(day);
  return Math.max(Number(normalized.score ?? 0), Number(normalized.miniTestScore ?? 0), 0);
}

function isEmptyLocalProgress(state: Foundation48ProgressState) {
  return Object.keys(state.days || {}).length === 0;
}

function isMoreAdvancedDay(a: Foundation48ProgressDay | undefined, b: Foundation48ProgressDay | undefined) {
  const left = normalizeDay(a);
  const right = normalizeDay(b);
  if (Boolean(left.completed) !== Boolean(right.completed)) return Boolean(left.completed);
  const leftStep = currentStepFromDay(left);
  const rightStep = currentStepFromDay(right);
  if (leftStep !== rightStep) return leftStep > rightStep;
  const leftScore = scoreFromDay(left);
  const rightScore = scoreFromDay(right);
  if (leftScore !== rightScore) return leftScore > rightScore;
  const leftUpdated = left.completedAt || left.lastStudiedAt || '';
  const rightUpdated = right.completedAt || right.lastStudiedAt || '';
  return leftUpdated >= rightUpdated;
}

export function mergeFoundation48DayProgress(localDay?: Foundation48ProgressDay, cloudDay?: Foundation48ProgressDay): Foundation48ProgressDay {
  if (!localDay) return normalizeDay(cloudDay);
  if (!cloudDay) return normalizeDay(localDay);
  return isMoreAdvancedDay(localDay, cloudDay) ? normalizeDay(localDay) : normalizeDay(cloudDay);
}

function rowToDay(row: Foundation48CloudRow): Foundation48ProgressDay {
  return normalizeDay({
    ...(row.payload || {}),
    completed: Boolean(row.completed || row.payload?.completed),
    score: Math.max(Number(row.score ?? 0), Number(row.payload?.score ?? 0)),
  });
}

function stateFromRows(rows: Foundation48CloudRow[]): Foundation48ProgressState {
  const days = rows.reduce<Record<number, Foundation48ProgressDay>>((acc, row) => {
    acc[row.day_number] = rowToDay(row);
    return acc;
  }, {});
  const lastDayOpened = rows.reduce((max, row) => Math.max(max, row.day_number), 0) || undefined;
  return { days, lastDayOpened };
}

function dayToUpsertRow(userId: string, dayNumber: number, dayProgress: Foundation48ProgressDay) {
  const normalized = normalizeDay(dayProgress);
  const challengeResults = Object.values(normalized.challengeResults || {});
  const correctCount = challengeResults.filter((item) => item.correct).length;
  return {
    user_id: userId,
    day_number: dayNumber,
    current_step: currentStepFromDay(normalized),
    completed: Boolean(normalized.completed),
    correct_count: correctCount,
    wrong_count: Math.max(challengeResults.length - correctCount, 0),
    score: scoreFromDay(normalized),
    payload: normalized,
    updated_at: new Date().toISOString(),
  };
}

export async function loadCloudFoundation48Progress(userId: string): Promise<Foundation48ProgressState> {
  if (!supabase || !userId) return { days: {} };
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('user_id, day_number, current_step, completed, score, payload, updated_at')
    .eq('user_id', userId)
    .order('day_number', { ascending: true });

  if (error) throw error;
  return stateFromRows((data || []) as Foundation48CloudRow[]);
}

export async function saveCloudFoundation48DayProgress(userId: string, dayProgress: Foundation48ProgressDay & { dayNumber?: number }) {
  if (!supabase || !userId) return { ok: false, reason: 'auth-unavailable' as const };
  const dayNumber = Number(dayProgress.dayNumber);
  if (!Number.isFinite(dayNumber) || dayNumber < 1) return { ok: false, reason: 'invalid-day' as const };

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(dayToUpsertRow(userId, dayNumber, dayProgress), { onConflict: 'user_id,day_number' });

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function syncLocalFoundation48ProgressToCloud(userId: string) {
  if (!supabase || !userId) return { ok: false, reason: 'auth-unavailable' as const };
  const local = getFoundation48Progress();
  if (isEmptyLocalProgress(local)) return { ok: false, reason: 'empty-local-progress' as const };

  const rows = Object.entries(local.days || {}).map(([dayNumber, day]) => dayToUpsertRow(userId, Number(dayNumber), day));
  if (rows.length === 0) return { ok: false, reason: 'empty-local-progress' as const };

  const { error } = await supabase.from(TABLE_NAME).upsert(rows, { onConflict: 'user_id,day_number' });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function mergeCloudAndLocalFoundation48Progress(userId: string) {
  if (!supabase || !userId) return { ok: false, reason: 'auth-unavailable' as const };

  const local = getFoundation48Progress();
  const cloud = await loadCloudFoundation48Progress(userId);
  const allDayNumbers = new Set([...Object.keys(local.days || {}), ...Object.keys(cloud.days || {})].map(Number));
  const mergedDays: Record<number, Foundation48ProgressDay> = {};

  for (const dayNumber of allDayNumbers) {
    if (!Number.isFinite(dayNumber)) continue;
    mergedDays[dayNumber] = mergeFoundation48DayProgress(local.days[dayNumber], cloud.days[dayNumber]);
  }

  const merged: Foundation48ProgressState = {
    days: mergedDays,
    lastDayOpened: local.lastDayOpened ?? cloud.lastDayOpened,
    lastStudiedDate: local.lastStudiedDate,
    streak: local.streak,
  };

  if (Object.keys(mergedDays).length > 0) {
    saveFoundation48ProgressSnapshot(merged);
    const rows = Object.entries(mergedDays).map(([dayNumber, day]) => dayToUpsertRow(userId, Number(dayNumber), day));
    await supabase.from(TABLE_NAME).upsert(rows, { onConflict: 'user_id,day_number' });
    window.dispatchEvent(new Event(FOUNDATION48_PROGRESS_UPDATED_EVENT));
  }

  return { ok: true, merged };
}
