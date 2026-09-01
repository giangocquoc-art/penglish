import type { EnglishLesson } from './lesson-content-data';
import type { LessonProgressMode } from './lesson-progress';
import { inferPracticeSkillArea, readLocalSkillMemory, type PracticeSkillArea } from './localSkillMemory';

export type PracticeSessionFeedbackInput = {
  lesson: EnglishLesson;
  mode: LessonProgressMode;
  total: number;
  correct: number;
  wrong: number;
  percentage: number;
  weakItemIds: string[];
  nextMode?: LessonProgressMode;
};

export type PracticeSessionFeedback = {
  titleVi: string;
  coachLineVi: string;
  confidenceSignalVi: string;
  reviewTipVi: string;
  nextActionVi: string;
  nextMode: LessonProgressMode;
  nextUrl: string;
  skillArea: PracticeSkillArea;
  modeAttemptCount: number;
  skillAveragePercentage?: number;
};

const MODE_LABELS: Record<LessonProgressMode, string> = {
  flashcard: 'Thẻ từ',
  quiz: 'Thử sức nhẹ',
  listen: 'Luyện nghe',
  reflex: 'Phản xạ',
  type: 'Gõ câu',
  match: 'Ghép cặp',
  speed: 'Tốc độ',
};

const NEXT_MODE_BY_MODE: Record<LessonProgressMode, LessonProgressMode> = {
  flashcard: 'quiz',
  quiz: 'type',
  type: 'listen',
  listen: 'reflex',
  reflex: 'speed',
  match: 'quiz',
  speed: 'flashcard',
};

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getTitle(percentage: number, wrong: number) {
  if (percentage >= 85 && wrong === 0) return 'Cá voi P ghi nhận: lượt học rất chắc';
  if (percentage >= 70) return 'Cá voi P ghi nhận: bạn đang tiến bộ đều';
  if (percentage >= 45) return 'Cá voi P ghi nhận: cần ôn lại vài điểm yếu';
  return 'Cá voi P ghi nhận: nên quay lại nhịp chậm hơn';
}

function getCoachLine(mode: LessonProgressMode, percentage: number) {
  if (percentage >= 80) {
    if (mode === 'flashcard') return 'Bạn nhớ mặt chữ khá tốt. Hãy chuyển sang kiểm tra nhanh hoặc phản xạ để dùng từ trong câu.';
    if (mode === 'type') return 'Mặt chữ đang ổn. Đọc to đáp án đúng một lần để khóa phản xạ nói.';
    if (mode === 'listen') return 'Tai nghe đang bắt nhịp tốt. Hãy thử phản xạ ngắn để nối nghe với nói.';
    return 'Bạn đã hoàn thành tốt lượt này. Giữ nhịp bằng một phần luyện khác ngắn hơn.';
  }

  if (mode === 'flashcard') return 'Đừng vội học thêm thẻ mới. Ôn lại thẻ yếu trước để trí nhớ bền hơn.';
  if (mode === 'quiz') return 'Hãy đọc lại câu sai và tìm dấu hiệu ngữ pháp hoặc từ khóa trong câu hỏi.';
  if (mode === 'type') return 'Hãy nghe chậm, nhìn cụm đúng, rồi gõ lại từng cụm ngắn thay vì nhớ cả câu dài.';
  if (mode === 'match') return 'Các cặp còn nhầm nên được ôn bằng thẻ từ trước khi ghép lại.';
  if (mode === 'speed') return 'Giảm tốc một chút. Ưu tiên đúng và rõ trước, nhanh sẽ đến sau.';
  return 'Hãy quay lại ví dụ đúng, đọc chậm một lần, rồi làm lại phần yếu.';
}

function getReviewTip(mode: LessonProgressMode, weakCount: number) {
  if (weakCount <= 0) return 'Không có mục yếu trong lượt này. Bạn có thể chuyển sang bước tiếp theo.';
  if (mode === 'flashcard') return `Có ${weakCount} thẻ cần ôn. Hãy ôn lại ngay khi trí nhớ còn nóng.`;
  if (mode === 'type') return `Có ${weakCount} câu cần gõ lại. Tập trung dấu nháy, thứ tự từ và cụm cố định.`;
  if (mode === 'quiz') return `Có ${weakCount} câu cần xem lại. Đọc giải thích trước khi làm lại.`;
  return `Có ${weakCount} mục cần củng cố. Lượt ôn ngắn tiếp theo sẽ hiệu quả hơn học thêm nội dung mới.`;
}

export function getPracticeSessionFeedback(input: PracticeSessionFeedbackInput): PracticeSessionFeedback {
  const percentage = clampPercentage(input.percentage);
  const memory = readLocalSkillMemory();
  const skillArea = inferPracticeSkillArea(input.mode);
  const modeMemory = memory.byMode[input.mode];
  const skillMemory = memory.bySkill[skillArea];
  const nextMode = input.nextMode ?? NEXT_MODE_BY_MODE[input.mode];
  const weakCount = Array.from(new Set(input.weakItemIds)).length;
  const modeAttemptCount = modeMemory?.attempts ?? 0;
  const priorAverage = skillMemory?.averagePercentage;

  const confidenceSignalVi = priorAverage !== undefined && modeAttemptCount > 0
    ? `Trung bình kỹ năng gần đây: ${priorAverage}%. Lượt này: ${percentage}%.`
    : `Lượt này đạt ${percentage}% với ${input.correct}/${input.total} mục đúng.`;

  return {
    titleVi: getTitle(percentage, input.wrong),
    coachLineVi: getCoachLine(input.mode, percentage),
    confidenceSignalVi,
    reviewTipVi: getReviewTip(input.mode, weakCount),
    nextActionVi: weakCount > 0 ? 'Ưu tiên ôn mục yếu trước, sau đó mới chuyển sang phần tiếp theo.' : `Bước tiếp theo hợp lý: ${MODE_LABELS[nextMode]}.`,
    nextMode,
    nextUrl: `/practice?lessonId=${input.lesson.id}&mode=${nextMode}`,
    skillArea,
    modeAttemptCount,
    skillAveragePercentage: priorAverage,
  };
}
