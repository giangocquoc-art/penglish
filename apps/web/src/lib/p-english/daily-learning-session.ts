import { foundation48Days, getFoundation48DayPath } from '../../features/foundation48/foundation48Data';
import { getFoundation48Progress } from '../../features/foundation48/foundation48Progress';
import { getLearningLoopSnapshot } from './learning-loop';

export type DailyLearningStepId = 'lesson' | 'review' | 'speaking';

export type DailyLearningStep = {
  id: DailyLearningStepId;
  order: number;
  title: string;
  description: string;
  duration: string;
  actionLabel: string;
  actionPath: string;
  completed: boolean;
  progressLabel: string;
};

type DailyLearningSessionState = {
  schemaVersion: 1;
  dateKey: string;
  startedAt: string;
  lessonDayNumber: number;
  completedAt?: string;
};

export type DailyLearningSessionSnapshot = {
  dateKey: string;
  started: boolean;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
  completedStepCount: number;
  progressPercent: number;
  currentStepId: DailyLearningStepId | 'complete';
  lessonDayNumber: number;
  lessonTitle: string;
  reviewDueCount: number;
  speakingSentenceCount: number;
  xpToday: number;
  steps: DailyLearningStep[];
  tomorrowLabel: string;
};

const STORAGE_KEY = 'penglish.daily.learning-session.v1';
export const DAILY_LEARNING_SESSION_UPDATED_EVENT = 'penglish.daily.learning-session.updated';

export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isDateToday(value: string | undefined, today: string) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && toLocalDateKey(date) === today;
}

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readSessionState(today: string): DailyLearningSessionState | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || 'null') as Partial<DailyLearningSessionState> | null;
    if (!parsed || parsed.schemaVersion !== 1 || parsed.dateKey !== today || !parsed.startedAt || !Number.isFinite(parsed.lessonDayNumber)) return null;
    return {
      schemaVersion: 1,
      dateKey: today,
      startedAt: parsed.startedAt,
      lessonDayNumber: Math.min(Math.max(Number(parsed.lessonDayNumber), 1), foundation48Days.length),
      completedAt: parsed.completedAt,
    };
  } catch {
    return null;
  }
}

function writeSessionState(state: DailyLearningSessionState) {
  const storage = getStorage();
  if (!storage) return state;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(DAILY_LEARNING_SESSION_UPDATED_EVENT));
  return state;
}

function getFoundationTargetDay() {
  const progress = getFoundation48Progress();
  const days = progress.days || {};
  const lastDayOpened = Number(progress.lastDayOpened);
  const safeLastDay = Number.isFinite(lastDayOpened) && lastDayOpened >= 1 && lastDayOpened <= foundation48Days.length
    ? lastDayOpened
    : null;
  const firstIncomplete = foundation48Days.find((day) => !days[day.dayNumber]?.completed)?.dayNumber ?? foundation48Days.length;
  const dayNumber = safeLastDay && !days[safeLastDay]?.completed ? safeLastDay : firstIncomplete;
  const day = foundation48Days.find((item) => item.dayNumber === dayNumber) ?? foundation48Days[0];
  const title = day.title.replace(/^Ngày \d+:\s*/, '').split('—')[0]?.trim() || day.title;
  return { progress, dayNumber, title };
}

function getTomorrowLabel() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(tomorrow);
}

export function startDailyLearningSession() {
  const today = toLocalDateKey();
  const existing = readSessionState(today);
  if (existing) return existing;
  const target = getFoundationTargetDay();
  const completedTodayDayNumber = Object.entries(target.progress.days || {})
    .find(([, day]) => Boolean(day.completed && isDateToday(day.completedAt, today)))?.[0];
  const lessonDayNumber = completedTodayDayNumber ? Number(completedTodayDayNumber) : target.dayNumber;
  return writeSessionState({ schemaVersion: 1, dateKey: today, startedAt: new Date().toISOString(), lessonDayNumber });
}

export function getDailyLearningSessionSnapshot(): DailyLearningSessionSnapshot {
  const today = toLocalDateKey();
  const session = readSessionState(today);
  const target = getFoundationTargetDay();
  const { progress } = target;
  const learningLoop = getLearningLoopSnapshot();

  const completedTodayDayNumber = Object.entries(progress.days || {})
    .find(([, day]) => Boolean(day.completed && isDateToday(day.completedAt, today)))?.[0];
  const dayNumber = session?.lessonDayNumber ?? (completedTodayDayNumber ? Number(completedTodayDayNumber) : target.dayNumber);
  const selectedDay = foundation48Days.find((day) => day.dayNumber === dayNumber) ?? foundation48Days[0];
  const title = selectedDay.title.replace(/^Ngày \d+:\s*/, '').split('—')[0]?.trim() || selectedDay.title;
  const lessonCompletedToday = Boolean(progress.days[dayNumber]?.completed && isDateToday(progress.days[dayNumber]?.completedAt, today));
  const reviewCompletedToday = isDateToday(learningLoop.completed['practice:daily-review'], today);
  const speakingSentenceIds = new Set(
    learningLoop.activities
      .filter((activity) => activity.source === 'shadowing' && isDateToday(activity.occurredAt, today))
      .map((activity) => activity.sourceId),
  );
  const speakingSentenceCount = speakingSentenceIds.size;
  const speakingCompletedToday = speakingSentenceCount >= 2;

  const steps: DailyLearningStep[] = [
    {
      id: 'lesson',
      order: 1,
      title: `Bài mới: ${title}`,
      description: `Ngày ${dayNumber} trong lộ trình 48 ngày. Học cụm chính rồi làm thử sức nhẹ.`,
      duration: '6 phút',
      actionLabel: lessonCompletedToday ? 'Xem lại bài' : 'Học bài mới',
      actionPath: `${getFoundation48DayPath(dayNumber)}?returnTo=%2Ftoday`,
      completed: lessonCompletedToday,
      progressLabel: lessonCompletedToday ? 'Đã xong hôm nay' : 'Chưa hoàn thành',
    },
    {
      id: 'review',
      order: 2,
      title: 'Ôn câu Poo nhắc',
      description: learningLoop.dueReviewCount > 0
        ? `Sửa ${Math.min(3, learningLoop.dueReviewCount)} lỗi hoặc từ yếu gần nhất.`
        : 'Ôn nhẹ 3 câu nền tảng để giữ nhịp nhớ.',
      duration: '3 phút',
      actionLabel: reviewCompletedToday ? 'Ôn thêm' : 'Ôn 3 câu',
      actionPath: '/practice?returnTo=%2Ftoday',
      completed: reviewCompletedToday,
      progressLabel: reviewCompletedToday ? 'Đã ôn hôm nay' : `${learningLoop.dueReviewCount} mục đang chờ`,
    },
    {
      id: 'speaking',
      order: 3,
      title: 'Nói lại 2 câu',
      description: 'Nghe câu mẫu, nói theo nhịp và xem từ Poo nghe chưa rõ.',
      duration: '2 phút',
      actionLabel: speakingCompletedToday ? 'Nói thêm' : 'Bắt đầu nói',
      actionPath: '/shadowing/practice/curated-a1-greeting-friend?returnTo=%2Ftoday',
      completed: speakingCompletedToday,
      progressLabel: `${Math.min(speakingSentenceCount, 2)}/2 câu hôm nay`,
    },
  ];

  const completedStepCount = steps.filter((step) => step.completed).length;
  const completed = completedStepCount === steps.length;
  const currentStepId = completed ? 'complete' : steps.find((step) => !step.completed)?.id ?? 'lesson';
  const xpToday = learningLoop.activities
    .filter((activity) => isDateToday(activity.occurredAt, today))
    .reduce((total, activity) => total + activity.xp, 0);

  return {
    dateKey: today,
    started: Boolean(session),
    completed,
    startedAt: session?.startedAt,
    completedAt: session?.completedAt,
    completedStepCount,
    progressPercent: Math.round((completedStepCount / steps.length) * 100),
    currentStepId,
    lessonDayNumber: dayNumber,
    lessonTitle: title,
    reviewDueCount: learningLoop.dueReviewCount,
    speakingSentenceCount,
    xpToday,
    steps,
    tomorrowLabel: getTomorrowLabel(),
  };
}

export function syncDailyLearningSessionCompletion(snapshot = getDailyLearningSessionSnapshot()) {
  if (!snapshot.completed) return snapshot;
  const current = readSessionState(snapshot.dateKey) ?? startDailyLearningSession();
  if (!current.completedAt) {
    writeSessionState({ ...current, completedAt: new Date().toISOString() });
  }
  return getDailyLearningSessionSnapshot();
}
