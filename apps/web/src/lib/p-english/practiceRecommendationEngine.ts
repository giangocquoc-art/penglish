import type { EnglishLesson } from './lesson-content-data';
import { calculateLessonProgressSummary, getAvailableLessonProgressModes, type LessonProgress, type LessonProgressMode } from './lesson-progress';
import { getResolvedLessonEnhancement, type ResolvedLessonEnhancement } from './lessonEnrichmentEngine';

export type PracticeRecommendation = {
  primaryMode?: LessonProgressMode;
  primaryLabel: string;
  primaryUrl: string;
  secondaryMode?: LessonProgressMode;
  secondaryUrl?: string;
  orderedModes: LessonProgressMode[];
  reasonVi: string;
  coachLineVi: string;
  strategyVi: string;
  weakSkillTipVi: string;
  keyboardHintVi: string;
  confidenceGoalVi: string;
  enhancement: ResolvedLessonEnhancement;
};

const MODE_LABELS: Record<LessonProgressMode, string> = {
  flashcard: 'Thẻ từ',
  quiz: 'Thử sức nhẹ',
  listen: 'Luyện nghe',
  reflex: 'Phản xạ',
  type: 'Gõ câu',
  match: 'Ghép cặp',
  speed: 'Tốc độ / phát âm',
};

function uniqueModes(modes: LessonProgressMode[]) {
  return Array.from(new Set(modes));
}

function orderModesByEnhancement(availableModes: LessonProgressMode[], enhancement: ResolvedLessonEnhancement) {
  const preferred = enhancement.recommendedFlow.filter((mode) => availableModes.includes(mode));
  const remaining = availableModes.filter((mode) => !preferred.includes(mode));
  return uniqueModes([...preferred, ...remaining]);
}

function pickPreferredAvailableMode(preferredModes: LessonProgressMode[], availableModes: LessonProgressMode[]) {
  return preferredModes.find((mode) => availableModes.includes(mode)) ?? availableModes[0];
}

function modeUrl(lessonId: string, mode?: LessonProgressMode, extra = '') {
  return mode ? `/practice?lessonId=${lessonId}&mode=${mode}${extra}` : `/lessons/${lessonId}`;
}

export function getPracticeRecommendation(lesson: EnglishLesson, progress: LessonProgress | null): PracticeRecommendation {
  const enhancement = getResolvedLessonEnhancement(lesson);
  const availableModes = getAvailableLessonProgressModes(lesson);
  const orderedModes = orderModesByEnhancement(availableModes, enhancement);
  const summary = calculateLessonProgressSummary(progress, lesson);

  let primaryMode = orderedModes[0];
  let reasonVi = enhancement.matchReasonVi;
  let urlExtra = '';

  if (summary.dueReviewCount > 0 && availableModes.includes('flashcard')) {
    primaryMode = 'flashcard';
    urlExtra = '&review=due';
    reasonVi = `Có ${summary.dueReviewCount} mục đến hạn ôn, nên ôn nhanh trước khi học tiếp.`;
  } else if (summary.weakReviewCount > 0) {
    primaryMode = pickPreferredAvailableMode(enhancement.recommendedFlow, availableModes);
    reasonVi = `Có ${summary.weakReviewCount} mục còn yếu, nên luyện phần phù hợp nhất để củng cố.`;
  } else if (summary.nextRecommendedMode && availableModes.includes(summary.nextRecommendedMode as LessonProgressMode)) {
    primaryMode = summary.nextRecommendedMode as LessonProgressMode;
    reasonVi = `Phần tiếp theo nên học là ${summary.nextRecommendedLabel}.`;
  }

  const secondaryMode = orderedModes.find((mode) => mode !== primaryMode);

  return {
    primaryMode,
    primaryLabel: primaryMode ? MODE_LABELS[primaryMode] : 'Đọc lại bài học',
    primaryUrl: modeUrl(lesson.id, primaryMode, urlExtra),
    secondaryMode,
    secondaryUrl: modeUrl(lesson.id, secondaryMode),
    orderedModes,
    reasonVi,
    coachLineVi: enhancement.whaleCoachLineVi,
    strategyVi: enhancement.learnerStrategyVi,
    weakSkillTipVi: enhancement.weakSkillTipVi,
    keyboardHintVi: enhancement.keyboardHintVi,
    confidenceGoalVi: enhancement.confidenceGoalVi,
    enhancement,
  };
}
