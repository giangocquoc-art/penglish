import type { LessonProgressMode } from '../../lib/p-english/lesson-progress';

export type LessonEnhancementFocus =
  | 'vocabulary-confidence'
  | 'grammar-patterns'
  | 'reading-flow'
  | 'listening-shadowing'
  | 'pronunciation-speed'
  | 'review-memory';

export type LessonEnhancementSourceId =
  | 'words-cefr-dataset'
  | 'olp-en-cefrj-primary'
  | 'fluentcards-grammar';

export type LessonEnhancementProfile = {
  id: string;
  lessonIds?: string[];
  unitIds?: string[];
  levelHints: Array<'A1' | 'A2' | 'B1' | 'B2'>;
  skillHints: string[];
  focus: LessonEnhancementFocus;
  sourceIds: LessonEnhancementSourceId[];
  learnerStrategyVi: string;
  whaleCoachLineVi: string;
  weakSkillTipVi: string;
  confidenceGoalVi: string;
  recommendedFlow: LessonProgressMode[];
  keyboardHintVi: string;
};

export const generatedLessonEnhancements: LessonEnhancementProfile[] = [
  {
    id: 'enhance-a1-greeting-vocabulary-confidence',
    lessonIds: ['unit-1-greetings-introduction'],
    unitIds: ['unit-1', 'path-a1-greetings-core'],
    levelHints: ['A1'],
    skillHints: ['Từ vựng', 'Phản xạ', 'Nghe'],
    focus: 'vocabulary-confidence',
    sourceIds: ['words-cefr-dataset', 'olp-en-cefrj-primary'],
    learnerStrategyVi: 'Học theo cụm ngắn trước, nghe lại từng cụm, rồi chuyển sang phản xạ để nói nhanh hơn mà không dịch từng chữ.',
    whaleCoachLineVi: 'Bắt đầu bằng flashcard để nhớ nghĩa, sau đó quiz nhanh và phản xạ bằng câu ngắn.',
    weakSkillTipVi: 'Nếu còn nhầm lời chào, hãy ôn flashcard theo nhóm thời điểm trong ngày rồi luyện lại câu mẫu.',
    confidenceGoalVi: 'Tự giới thiệu và chào hỏi trong một lượt nói ngắn, rõ, thân thiện.',
    recommendedFlow: ['flashcard', 'quiz', 'reflex', 'listen'],
    keyboardHintVi: 'Trong quiz có thể dùng A/B/C/D hoặc 1/2/3/4; Enter giúp gửi câu trả lời khi đang gõ.',
  },
  {
    id: 'enhance-a1-reading-flow',
    lessonIds: ['reading-a1-my-morning'],
    unitIds: ['path-a1-grammar-reading'],
    levelHints: ['A1'],
    skillHints: ['Đọc', 'Từ vựng', 'Viết'],
    focus: 'reading-flow',
    sourceIds: ['olp-en-cefrj-primary', 'words-cefr-dataset'],
    learnerStrategyVi: 'Đọc lấy ý chính trước, gạch chân từ chỉ thời gian, rồi làm câu hỏi chi tiết sau.',
    whaleCoachLineVi: 'Đừng dịch từng chữ. Hãy tìm mốc thời gian, hành động chính, rồi mới trả lời quiz.',
    weakSkillTipVi: 'Nếu sai câu đọc hiểu, quay lại đoạn văn và tìm bằng chứng ngay trong câu có từ khóa.',
    confidenceGoalVi: 'Đọc một đoạn A1 ngắn và kể lại được ý chính bằng vài câu đơn giản.',
    recommendedFlow: ['quiz', 'type', 'flashcard', 'match'],
    keyboardHintVi: 'Enter gửi câu điền từ; sau khi đúng, Enter lần nữa chuyển sang câu tiếp theo.',
  },
  {
    id: 'enhance-grammar-pattern-cards',
    unitIds: ['path-a1-grammar-reading', 'path-a2-grammar-patterns', 'path-b1-grammar-speaking'],
    levelHints: ['A1', 'A2', 'B1'],
    skillHints: ['Ngữ pháp', 'Viết', 'Ôn tập'],
    focus: 'grammar-patterns',
    sourceIds: ['fluentcards-grammar', 'olp-en-cefrj-primary'],
    learnerStrategyVi: 'Nhìn mẫu câu như một khung thay thế từ: đọc ví dụ, đổi chủ ngữ hoặc thời gian, rồi gõ lại câu hoàn chỉnh.',
    whaleCoachLineVi: 'Học ngữ pháp bằng mẫu câu dùng được ngay: nhận diện mẫu, điền chỗ trống, rồi tự sắp xếp câu.',
    weakSkillTipVi: 'Nếu sai cấu trúc, hãy đọc lại ví dụ đúng và tự nói một câu tương tự trước khi làm tiếp.',
    confidenceGoalVi: 'Dùng đúng mẫu câu trọng tâm trong bài mà không cần nhớ thuật ngữ phức tạp.',
    recommendedFlow: ['quiz', 'type', 'flashcard'],
    keyboardHintVi: 'Dùng Enter cho bài gõ/điền từ; A/B/C/D hoặc 1/2/3/4 cho trắc nghiệm.',
  },
  {
    id: 'enhance-a2-practical-vocabulary-review',
    unitIds: ['path-a2-practical-vocabulary'],
    levelHints: ['A2'],
    skillHints: ['Từ vựng', 'Ôn tập'],
    focus: 'review-memory',
    sourceIds: ['words-cefr-dataset', 'olp-en-cefrj-primary'],
    learnerStrategyVi: 'Chia từ theo tình huống thực tế, ôn mục yếu trước, rồi ghép nghĩa để khóa lại trí nhớ.',
    whaleCoachLineVi: 'Ưu tiên mục yếu hoặc đến hạn ôn trước khi học thêm từ mới.',
    weakSkillTipVi: 'Từ nào sai nhiều nên được đọc to với một ví dụ cá nhân thật ngắn.',
    confidenceGoalVi: 'Nhận ra và dùng được nhóm từ A2 trong tình huống quen thuộc.',
    recommendedFlow: ['flashcard', 'match', 'quiz', 'speed'],
    keyboardHintVi: 'Các phím số giúp chọn đáp án nhanh; đọc kỹ phản hồi sau mỗi lượt sai.',
  },
  {
    id: 'enhance-b1-b2-reading-confidence',
    unitIds: ['path-b1-real-life-reading', 'path-b2-confident-reading'],
    levelHints: ['B1', 'B2'],
    skillHints: ['Đọc', 'Ôn tập', 'Viết'],
    focus: 'reading-flow',
    sourceIds: ['olp-en-cefrj-primary'],
    learnerStrategyVi: 'Đọc theo lớp: tiêu đề/ý chính trước, chi tiết sau, cuối cùng tóm tắt bằng câu của bạn.',
    whaleCoachLineVi: 'Ở B1/B2, mục tiêu không phải biết mọi từ mà là bắt được ý, thái độ và bằng chứng trong bài.',
    weakSkillTipVi: 'Nếu mất mạch đọc, hãy tìm lại câu chủ đề và các từ nối như however, because, then.',
    confidenceGoalVi: 'Đọc nội dung dài hơn và trả lời được câu hỏi ý chính, chi tiết, suy luận nhẹ.',
    recommendedFlow: ['quiz', 'type', 'flashcard', 'speed'],
    keyboardHintVi: 'Dùng Enter để duy trì nhịp luyện; nếu sai, đọc giải thích rồi thử lại chậm hơn.',
  },
];

export function getGeneratedLessonEnhancements() {
  return generatedLessonEnhancements;
}
