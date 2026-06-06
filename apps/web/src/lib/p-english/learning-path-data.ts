import { generatedUnifiedLearningPath, type UnifiedPracticeMode, type UnifiedSkillFocus } from '../../data/learning/generatedUnifiedLearningPath';

export type LearningSkillType = 'Từ vựng' | 'Ngữ pháp' | 'Nghe' | 'Phản xạ' | 'Viết' | 'Đọc' | 'Ôn tập' | 'Shadowing' | 'Phát âm';
export type LearningUnitStatus = 'Chưa học' | 'Đang học' | 'Hoàn thành';

export type LearningPathUnit = {
  id: string;
  title: string;
  description: string;
  skillType: LearningSkillType;
  estimatedTime: string;
  progress: number;
  status: LearningUnitStatus;
  xp: number;
  reviewDue: number;
  lessonId?: string;
  lessonCount?: number;
  primarySkills?: LearningSkillType[];
  ctaLabel?: string;
  contentMaturity?: 'foundation' | 'expanded' | 'mature';
  maturityLabel?: string;
  maturityNote?: string;
};

const MODE_SKILL_LABELS: Partial<Record<UnifiedPracticeMode, LearningSkillType>> = {
  flashcard: 'Từ vựng',
  quiz: 'Ôn tập',
  listen: 'Nghe',
  reflex: 'Phản xạ',
  type: 'Viết',
  match: 'Ôn tập',
  speed: 'Phản xạ',
  shadowing: 'Shadowing',
  pronunciation: 'Phát âm',
};

const SKILL_CTA_LABELS: Record<UnifiedSkillFocus, string> = {
  'Từ vựng': 'Luyện từ vựng',
  'Ngữ pháp': 'Luyện ngữ pháp',
  Nghe: 'Luyện nghe',
  Đọc: 'Luyện đọc',
  Shadowing: 'Vào Shadowing',
  'Phát âm': 'Luyện phát âm',
  'Ôn tập': 'Ôn tập ngay',
};

function uniqueSkills(skills: Array<LearningSkillType | undefined>) {
  return skills.filter((skill, index): skill is LearningSkillType => Boolean(skill) && skills.indexOf(skill) === index);
}

function unitXp(index: number, lessonCount: number) {
  return 60 + index * 10 + Math.max(0, lessonCount - 1) * 15;
}

export const learningPathUnits: LearningPathUnit[] = generatedUnifiedLearningPath.map((unit, index) => {
  const primarySkills = uniqueSkills([
    unit.skillFocus,
    ...unit.recommendedPracticeModes.map((mode) => MODE_SKILL_LABELS[mode]),
    'Ôn tập',
  ]);

  return {
    id: unit.id,
    title: unit.titleVi,
    description: unit.subtitleVi,
    skillType: unit.skillFocus,
    estimatedTime: unit.estimatedTime,
    progress: 0,
    status: 'Chưa học',
    xp: unitXp(index, unit.lessonIds.length),
    reviewDue: 0,
    lessonId: unit.lessonIds[0],
    lessonCount: Math.max(1, unit.lessonIds.length),
    primarySkills,
    ctaLabel: SKILL_CTA_LABELS[unit.skillFocus],
    contentMaturity: unit.contentMaturity,
    maturityLabel: unit.maturityLabelVi,
    maturityNote: unit.maturityNoteVi,
  };
});

export const learningPathLessonMap: Record<string, string[]> = Object.fromEntries(
  generatedUnifiedLearningPath.map((unit) => [unit.id, unit.lessonIds]),
);
