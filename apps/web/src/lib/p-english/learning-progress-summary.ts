import { learningPathUnits, type LearningPathUnit } from './learning-path-data';
import { getLessonById, type EnglishLesson } from './lesson-content-data';
import { getCompletedLessons, getCurrentStreak } from './local-progress';
import { calculateLessonProgressSummary, readLessonProgress, type LessonProgressSummary } from './lesson-progress';
import { getUnifiedDashboardSnapshot, getUnifiedLessonEntry } from './unifiedLessonEngine';

export type CefrBand = {
  level: 'A1' | 'A2' | 'B1' | 'B2';
  title: string;
  description: string;
  threshold: number;
};

export type LearningPathProgressUnit = {
  unit: LearningPathUnit;
  index: number;
  lesson?: EnglishLesson;
  summary: LessonProgressSummary | null;
  available: boolean;
  progressValue: number;
  completed: boolean;
  status: 'Hoàn thành' | 'Đang học' | 'Sẵn sàng học' | 'Sắp mở';
};

export type LearningPathProgressSnapshot = {
  units: LearningPathProgressUnit[];
  availableCount: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  completedUnitsCount: number;
  totalXp: number;
  earnedXp: number;
  currentStreak: number;
  pathPercentage: number;
  estimatedLevel: CefrBand;
  nextUnit: LearningPathProgressUnit | null;
  nextLessonPath: string;
  nextLessonTitle: string;
  encouragement: string;
};

export const CEFR_BANDS: CefrBand[] = [
  {
    level: 'A1',
    title: 'Nền tảng',
    description: 'Chào hỏi, giới thiệu bản thân, câu rất ngắn.',
    threshold: 0,
  },
  {
    level: 'A2',
    title: 'Giao tiếp quen thuộc',
    description: 'Gia đình, trường học, thói quen và nhu cầu đơn giản.',
    threshold: 35,
  },
  {
    level: 'B1',
    title: 'Tự tin tình huống thường gặp',
    description: 'Kể chuyện ngắn, nêu ý kiến và xử lý tình huống đời sống.',
    threshold: 65,
  },
  {
    level: 'B2',
    title: 'Độc lập hơn',
    description: 'Trao đổi rõ ý, hiểu nội dung dài hơn và luyện phản xạ sâu.',
    threshold: 90,
  },
];

function cleanUnitTitle(title: string) {
  return title.replace(/^Unit \d+:\s*/, '');
}

function getEstimatedLevel(pathPercentage: number) {
  return [...CEFR_BANDS].reverse().find((band) => pathPercentage >= band.threshold) ?? CEFR_BANDS[0];
}

function getEncouragement(pathPercentage: number, completedLessonsCount: number) {
  if (pathPercentage >= 100) return 'Bạn đã hoàn thành toàn bộ lộ trình đang mở. Hãy ôn lại phần yếu để giữ phản xạ chắc hơn.';
  if (completedLessonsCount > 0) return 'Bạn đang có tiến bộ rõ ràng. Tiếp tục một bài ngắn nữa để giữ nhịp học hôm nay.';
  return 'Bắt đầu bằng bài gợi ý đầu tiên. Chỉ cần hoàn thành một bước nhỏ là tiến độ sẽ được ghi lại.';
}

export function getLearningPathProgressSnapshot(): LearningPathProgressSnapshot {
  const completedLessonIds = getCompletedLessons();

  const units: LearningPathProgressUnit[] = learningPathUnits.map((unit, index) => {
    const entry = getUnifiedLessonEntry(unit.id);
    const lesson = entry?.primaryLesson ?? (unit.lessonId ? getLessonById(unit.lessonId) : undefined);
    const progress = lesson ? readLessonProgress(lesson.id) : null;
    const summary = lesson ? calculateLessonProgressSummary(progress, lesson) : null;
    const available = Boolean(lesson || entry?.primaryRoute);
    const completed = Boolean(lesson && (completedLessonIds.includes(lesson.id) || (summary?.overallPercentage ?? 0) >= 100));
    const progressValue = summary?.overallPercentage ?? (available ? 0 : unit.progress);
    const status = completed
      ? 'Hoàn thành'
      : summary
        ? progress
          ? 'Đang học'
          : 'Sẵn sàng học'
        : available
          ? 'Sẵn sàng học'
          : 'Sắp mở';

    return {
      unit,
      index,
      lesson,
      summary,
      available,
      progressValue,
      completed,
      status,
    };
  });

  const availableUnits = units.filter((item) => item.available);
  const completedUnits = availableUnits.filter((item) => item.completed);
  const availableProgressTotal = availableUnits.reduce((sum, item) => sum + item.progressValue, 0);
  const pathPercentage = availableUnits.length > 0 ? Math.round(availableProgressTotal / availableUnits.length) : 0;
  const nextUnit = availableUnits.find((item) => !item.completed) ?? availableUnits[0] ?? null;
  const totalXp = units.reduce((sum, item) => sum + item.unit.xp, 0);
  const earnedXp = units.reduce((sum, item) => sum + (item.completed ? item.unit.xp : 0), 0);
  const totalLessonsCount = availableUnits.reduce((sum, item) => sum + (item.unit.lessonCount ?? (item.lesson ? 1 : 0)), 0);
  const completedLessonsCount = completedUnits.reduce((sum, item) => sum + (item.unit.lessonCount ?? 1), 0);
  const nextLessonTitle = nextUnit ? cleanUnitTitle(nextUnit.unit.title) : 'Ôn lại lộ trình đang mở';
  const unifiedDashboard = getUnifiedDashboardSnapshot();
  const unifiedPathPercentage = unifiedDashboard.pathPercentage || pathPercentage;

  return {
    units,
    availableCount: availableUnits.length,
    completedLessonsCount,
    totalLessonsCount,
    completedUnitsCount: completedUnits.length,
    totalXp,
    earnedXp,
    currentStreak: unifiedDashboard.currentStreak || getCurrentStreak(),
    pathPercentage: unifiedPathPercentage,
    estimatedLevel: getEstimatedLevel(unifiedPathPercentage),
    nextUnit,
    nextLessonPath: unifiedDashboard.nextLessonPath || (nextUnit?.lesson ? `/lessons/${nextUnit.lesson.id}` : '/learning-path'),
    nextLessonTitle: unifiedDashboard.nextLessonTitle || nextLessonTitle,
    encouragement: `${getEncouragement(unifiedPathPercentage, completedLessonsCount)} ${unifiedDashboard.whaleCoachLine}`.trim(),
  };
}
