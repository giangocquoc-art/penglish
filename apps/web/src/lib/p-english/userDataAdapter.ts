import { getAllVocabularyItems } from './vocabulary-review';
import { getCurrentSupabaseUser } from './userSession';
import { supabase } from '../supabaseClient';
import { isSoftRateLimited } from '../security/softRateLimit';

export type DashboardSnapshot = {
  mode: 'guest' | 'supabase';
  dataModeLabel: 'Poo đang giữ tiến độ cho bạn' | 'Đã lưu lên tài khoản' | 'Poo sẽ lưu lên tài khoản khi mạng ổn hơn';
  todayXp: number;
  lessonsTouched: number;
  wordsReviewed: number;
  pronunciationAttempts: number;
  shadowingSentences: number;
};

export type DailyProgressPatch = Partial<Omit<DashboardSnapshot, 'mode' | 'dataModeLabel' | 'todayXp'>> & {
  xp?: number;
};

export type UserLessonProgressPatch = {
  status?: 'not_started' | 'in_progress' | 'completed';
  progressPercent?: number;
  completedSteps?: string[];
  lastMode?: string;
  completedAt?: string | null;
};

export type UserVocabularyProgressPatch = {
  word?: string;
  level?: string;
  status?: string;
  reviewCount?: number;
  correctCount?: number;
  wrongCount?: number;
  ease?: number;
  dueAt?: string;
  lastReviewedAt?: string;
};

export type ShadowingAttemptInput = {
  itemId?: string;
  lessonId?: string;
  level?: string;
  targetText: string;
  learnerText?: string;
  feedbackSource?: string;
  feedbackJson?: Record<string, unknown>;
};

export type EnglishSpeedAttemptInput = {
  promptId?: string;
  level?: string;
  targetText: string;
  learnerText?: string;
  score?: number;
  feedbackJson?: Record<string, unknown>;
};

const LOCAL_DAILY_KEY = 'p-english:z4-4-local-daily-progress';
const LOCAL_UPDATED_EVENT = 'p-english:local-progress-updated';
const DAILY_ACTIVITY_LIMIT = { limit: 40, windowMs: 60_000 };
const SAVE_PROGRESS_LIMIT = { limit: 30, windowMs: 60_000 };
const ATTEMPT_LIMIT = { limit: 12, windowMs: 60_000 };

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function emitLocalUpdate() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(LOCAL_UPDATED_EVENT));
}

function readLocalDaily() {
  const storage = getStorage();
  const fallback = { todayXp: 0, lessonsTouched: 0, wordsReviewed: 0, pronunciationAttempts: 0, shadowingSentences: 0, progressDate: todayKey() };
  if (!storage) return fallback;
  try {
    const parsed = JSON.parse(storage.getItem(LOCAL_DAILY_KEY) ?? '{}');
    if (parsed.progressDate !== todayKey()) return fallback;
    return {
      progressDate: todayKey(),
      todayXp: Number(parsed.todayXp ?? 0),
      lessonsTouched: Number(parsed.lessonsTouched ?? 0),
      wordsReviewed: Number(parsed.wordsReviewed ?? 0),
      pronunciationAttempts: Number(parsed.pronunciationAttempts ?? 0),
      shadowingSentences: Number(parsed.shadowingSentences ?? 0),
    };
  } catch {
    return fallback;
  }
}

function writeLocalDaily(patch: DailyProgressPatch) {
  const storage = getStorage();
  if (!storage) return;
  const current = readLocalDaily();
  const next = {
    progressDate: todayKey(),
    todayXp: current.todayXp + Number(patch.xp ?? 0),
    lessonsTouched: current.lessonsTouched + Number(patch.lessonsTouched ?? 0),
    wordsReviewed: current.wordsReviewed + Number(patch.wordsReviewed ?? 0),
    pronunciationAttempts: current.pronunciationAttempts + Number(patch.pronunciationAttempts ?? 0),
    shadowingSentences: current.shadowingSentences + Number(patch.shadowingSentences ?? 0),
  };
  storage.setItem(LOCAL_DAILY_KEY, JSON.stringify(next));
  emitLocalUpdate();
}

async function getSignedInUserId() {
  const user = await getCurrentSupabaseUser();
  return user?.id ?? null;
}

async function saveDailyProgressPatchSupabase(userId: string, patch: DailyProgressPatch) {
  if (!supabase) return false;
  const date = todayKey();
  const { data } = await supabase
    .from('penglish_daily_progress')
    .select('xp, lessons_touched, words_reviewed, pronunciation_attempts, shadowing_sentences')
    .eq('user_id', userId)
    .eq('progress_date', date)
    .maybeSingle();

  const next = {
    user_id: userId,
    progress_date: date,
    xp: Number(data?.xp ?? 0) + Number(patch.xp ?? 0),
    lessons_touched: Number(data?.lessons_touched ?? 0) + Number(patch.lessonsTouched ?? 0),
    words_reviewed: Number(data?.words_reviewed ?? 0) + Number(patch.wordsReviewed ?? 0),
    pronunciation_attempts: Number(data?.pronunciation_attempts ?? 0) + Number(patch.pronunciationAttempts ?? 0),
    shadowing_sentences: Number(data?.shadowing_sentences ?? 0) + Number(patch.shadowingSentences ?? 0),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('penglish_daily_progress').upsert(next);
  return !error;
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const userId = await getSignedInUserId();
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('penglish_daily_progress')
      .select('xp, lessons_touched, words_reviewed, pronunciation_attempts, shadowing_sentences')
      .eq('user_id', userId)
      .eq('progress_date', todayKey())
      .maybeSingle();

    if (!error) {
      return {
        mode: 'supabase',
        dataModeLabel: 'Đã lưu lên tài khoản',
        todayXp: Number(data?.xp ?? 0),
        lessonsTouched: Number(data?.lessons_touched ?? 0),
        wordsReviewed: Number(data?.words_reviewed ?? 0),
        pronunciationAttempts: Number(data?.pronunciation_attempts ?? 0),
        shadowingSentences: Number(data?.shadowing_sentences ?? 0),
      };
    }
  }

  const local = readLocalDaily();
  return { mode: 'guest', dataModeLabel: 'Poo đang giữ tiến độ cho bạn', ...local };
}

export async function saveDailyProgressPatch(patch: DailyProgressPatch) {
  if (isSoftRateLimited('mark-study-activity', DAILY_ACTIVITY_LIMIT)) return { mode: 'guest' as const, ok: false, rateLimited: true as const };
  const userId = await getSignedInUserId();
  if (supabase && userId) {
    const saved = await saveDailyProgressPatchSupabase(userId, patch);
    if (saved) return { mode: 'supabase' as const, ok: true };
  }
  writeLocalDaily(patch);
  return { mode: 'guest' as const, ok: true };
}

export async function getLessonProgress(lessonId: string) {
  const storage = getStorage();
  const localRaw = storage?.getItem(`p-english:lesson-progress:${lessonId}`) ?? null;
  const local = localRaw ? JSON.parse(localRaw) : null;
  const userId = await getSignedInUserId();
  if (!supabase || !userId) return local;

  const { data, error } = await supabase.from('penglish_lesson_progress').select('*').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
  if (error || !data) return local;
  return data;
}

export async function saveLessonProgress(lessonId: string, patch: UserLessonProgressPatch) {
  if (isSoftRateLimited('save-lesson-progress', SAVE_PROGRESS_LIMIT)) return { mode: 'guest' as const, ok: false, rateLimited: true as const };
  const userId = await getSignedInUserId();
  if (!supabase || !userId) return { mode: 'guest' as const, ok: false };

  const { error } = await supabase.from('penglish_lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    status: patch.status ?? 'in_progress',
    progress_percent: patch.progressPercent ?? 0,
    completed_steps: patch.completedSteps ?? [],
    last_mode: patch.lastMode,
    completed_at: patch.completedAt,
    last_activity_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (!error) await saveDailyProgressPatch({ lessonsTouched: 1, xp: patch.status === 'completed' ? 10 : 2 });
  return { mode: 'supabase' as const, ok: !error };
}

export async function getVocabularyProgress() {
  const userId = await getSignedInUserId();
  if (!supabase || !userId) return getAllVocabularyItems();
  const { data, error } = await supabase.from('penglish_vocabulary_progress').select('*').eq('user_id', userId);
  if (error) return getAllVocabularyItems();
  return data;
}

export async function saveVocabularyProgress(wordId: string, patch: UserVocabularyProgressPatch) {
  if (isSoftRateLimited('save-vocabulary-progress', SAVE_PROGRESS_LIMIT)) return { mode: 'guest' as const, ok: false, rateLimited: true as const };
  const userId = await getSignedInUserId();
  if (!supabase || !userId) return { mode: 'guest' as const, ok: false };

  const { error } = await supabase.from('penglish_vocabulary_progress').upsert({
    user_id: userId,
    word_id: wordId,
    word: patch.word,
    level: patch.level,
    status: patch.status ?? 'learning',
    review_count: patch.reviewCount ?? 1,
    correct_count: patch.correctCount ?? 0,
    wrong_count: patch.wrongCount ?? 0,
    ease: patch.ease ?? 2.5,
    due_at: patch.dueAt,
    last_reviewed_at: patch.lastReviewedAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (!error) await saveDailyProgressPatch({ wordsReviewed: 1, xp: 2 });
  return { mode: 'supabase' as const, ok: !error };
}

export async function saveShadowingAttempt(attempt: ShadowingAttemptInput) {
  if (isSoftRateLimited('save-shadowing-attempt', ATTEMPT_LIMIT)) return { mode: 'guest' as const, ok: false, rateLimited: true as const };
  await saveDailyProgressPatch({ shadowingSentences: 1, xp: 4 });
  const userId = await getSignedInUserId();
  if (!supabase || !userId) return { mode: 'guest' as const, ok: true };

  const { error } = await supabase.from('penglish_shadowing_attempts').insert({
    user_id: userId,
    item_id: attempt.itemId,
    lesson_id: attempt.lessonId,
    level: attempt.level,
    target_text: attempt.targetText,
    learner_text: attempt.learnerText,
    feedback_source: attempt.feedbackSource ?? 'local',
    feedback_json: attempt.feedbackJson ?? {},
  });
  return { mode: 'supabase' as const, ok: !error };
}

export async function saveEnglishSpeedAttempt(attempt: EnglishSpeedAttemptInput) {
  if (isSoftRateLimited('save-english-speed-attempt', ATTEMPT_LIMIT)) return { mode: 'guest' as const, ok: false, rateLimited: true as const };
  await saveDailyProgressPatch({ pronunciationAttempts: 1, xp: Math.max(1, Math.round((attempt.score ?? 0) / 20)) });
  const userId = await getSignedInUserId();
  if (!supabase || !userId) return { mode: 'guest' as const, ok: true };

  const { error } = await supabase.from('penglish_english_speed_attempts').insert({
    user_id: userId,
    prompt_id: attempt.promptId,
    level: attempt.level,
    target_text: attempt.targetText,
    learner_text: attempt.learnerText,
    score: attempt.score,
    feedback_json: attempt.feedbackJson ?? {},
  });
  return { mode: 'supabase' as const, ok: !error };
}

export async function migrateLocalGuestDataToSupabase() {
  const userId = await getSignedInUserId();
  if (!supabase || !userId) return { ok: false, migrated: 0 };
  const local = readLocalDaily();
  const result = await saveDailyProgressPatchSupabase(userId, {
    xp: local.todayXp,
    lessonsTouched: local.lessonsTouched,
    wordsReviewed: local.wordsReviewed,
    pronunciationAttempts: local.pronunciationAttempts,
    shadowingSentences: local.shadowingSentences,
  });
  return { ok: result, migrated: result ? 1 : 0 };
}
