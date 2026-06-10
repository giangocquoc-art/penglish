import { generatedLessonEnhancements, type LessonEnhancementProfile } from '../../data/learning/generatedLessonEnhancements';
import type { EnglishLesson } from './lesson-content-data';

export type ResolvedLessonEnhancement = LessonEnhancementProfile & {
  matchReasonVi: string;
  isFallback: boolean;
};

type CefrHint = 'A1' | 'A2' | 'B1' | 'B2';

const FALLBACK_SOURCE_IDS: LessonEnhancementProfile['sourceIds'] = ['olp-en-cefrj-primary'];

function inferCefrHint(lesson: EnglishLesson): CefrHint {
  if (lesson.level.includes('A2')) return 'A2';
  if (lesson.level.includes('B1')) return 'B1';
  if (lesson.level.includes('B2')) return 'B2';
  return 'A1';
}

function hasSkillOverlap(lesson: EnglishLesson, profile: LessonEnhancementProfile) {
  return lesson.skillTags.some((tag) => profile.skillHints.includes(tag));
}

function scoreProfile(lesson: EnglishLesson, profile: LessonEnhancementProfile) {
  let score = 0;

  if (profile.lessonIds?.includes(lesson.id)) score += 100;
  if (profile.unitIds?.includes(lesson.unitId)) score += 55;
  if (profile.levelHints.includes(inferCefrHint(lesson))) score += 18;
  if (hasSkillOverlap(lesson, profile)) score += 12;

  if (lesson.grammarNotes.length > 0 && profile.focus === 'grammar-patterns') score += 8;
  if (lesson.vocabulary.length > 0 && (profile.focus === 'vocabulary-confidence' || profile.focus === 'review-memory')) score += 6;
  if (lesson.skillTags.includes('Đọc') && profile.focus === 'reading-flow') score += 8;

  return score;
}

function matchReasonFor(score: number, profile: LessonEnhancementProfile) {
  if (score >= 100) return 'Khớp trực tiếp với bài học hiện tại.';
  if (score >= 55) return 'Khớp theo chặng học và kỹ năng trọng tâm.';
  if (profile.focus === 'grammar-patterns') return 'Gợi ý theo mẫu câu và ngữ pháp đang học.';
  if (profile.focus === 'reading-flow') return 'Gợi ý theo kỹ năng đọc hiểu và tìm ý chính.';
  if (profile.focus === 'review-memory') return 'Gợi ý theo nhu cầu ôn tập và củng cố trí nhớ.';
  return 'Gợi ý theo cấp độ và kỹ năng gần nhất.';
}

export function getLessonEnhancementProfile(lesson: EnglishLesson): ResolvedLessonEnhancement | null {
  const ranked = generatedLessonEnhancements
    .map((profile) => ({ profile, score: scoreProfile(lesson, profile) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best) return null;

  return {
    ...best.profile,
    matchReasonVi: matchReasonFor(best.score, best.profile),
    isFallback: false,
  };
}

export function getLessonEnhancementProfileByLessonId(lessonId: string) {
  return generatedLessonEnhancements.find((profile) => profile.lessonIds?.includes(lessonId)) ?? null;
}

export function deriveLessonEnhancementFallback(lesson: EnglishLesson): ResolvedLessonEnhancement {
  const cefr = inferCefrHint(lesson);
  const hasReading = lesson.skillTags.includes('Đọc');
  const hasGrammar = lesson.skillTags.includes('Ngữ pháp') || lesson.grammarNotes.length > 0;
  const focus: LessonEnhancementProfile['focus'] = hasReading ? 'reading-flow' : hasGrammar ? 'grammar-patterns' : 'vocabulary-confidence';

  return {
    id: `fallback-${lesson.id}`,
    lessonIds: [lesson.id],
    unitIds: [lesson.unitId],
    levelHints: [cefr],
    skillHints: [...lesson.skillTags],
    focus,
    sourceIds: FALLBACK_SOURCE_IDS,
    learnerStrategyVi: hasReading
      ? 'Đọc ý chính trước, tìm từ khóa trong câu hỏi, rồi quay lại đoạn có bằng chứng để trả lời.'
      : hasGrammar
        ? 'Xem mẫu câu như một khung dùng được ngay: đọc ví dụ, đổi vài từ, rồi luyện gõ lại câu hoàn chỉnh.'
        : 'Bắt đầu bằng từ/cụm quan trọng, làm kiểm tra nhanh, rồi chuyển sang phản xạ để nhớ bằng ngữ cảnh.',
    whaleCoachLineVi: hasReading
      ? 'Cá voi P khuyên bạn đọc lướt một lượt, sau đó mới trả lời từng câu bằng bằng chứng trong bài.'
      : hasGrammar
        ? 'Cá voi P khuyên bạn học mẫu câu trước, đừng học thuật ngữ quá nặng.'
        : 'Cá voi P khuyên bạn học theo cụm ngắn, nghe lại và nói thành câu thật đơn giản.',
    weakSkillTipVi: 'Nếu thấy sai lặp lại, hãy quay về ví dụ đúng, đọc chậm một lần, rồi làm lại phần còn thiếu.',
    confidenceGoalVi: `Hoàn thành bài ${lesson.titleVi} với ít nhất một phần luyện tập và biết bước tiếp theo cần ôn.`,
    recommendedFlow: ['flashcard', 'quiz', 'type', 'listen', 'reflex', 'match', 'speed'],
    keyboardHintVi: 'Enter giúp gửi câu trả lời khi đang gõ; A/B/C/D hoặc 1/2/3/4 giúp chọn đáp án trắc nghiệm.',
    matchReasonVi: 'Gợi ý an toàn dựa trên nội dung bài học hiện có.',
    isFallback: true,
  };
}

export function getResolvedLessonEnhancement(lesson: EnglishLesson): ResolvedLessonEnhancement {
  return getLessonEnhancementProfile(lesson) ?? deriveLessonEnhancementFallback(lesson);
}
