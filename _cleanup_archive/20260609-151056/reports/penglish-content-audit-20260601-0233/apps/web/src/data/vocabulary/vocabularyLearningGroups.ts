import type { GeneratedVocabularyCefrLevel } from './vocabularyTypes';

export type VocabularyLearningGroupMetadata = {
  cefrLevel: GeneratedVocabularyCefrLevel;
  focusVi: string;
  strategyVi: string;
  dailyRoutineVi: string;
  memoryHookVi: string;
  reviewCueVi: string;
};

export const vocabularyLearningGroups: Record<GeneratedVocabularyCefrLevel, VocabularyLearningGroupMetadata> = {
  A1: {
    cefrLevel: 'A1',
    focusVi: 'Nhận diện nhanh người, đồ vật, thời gian và hành động rất quen thuộc.',
    strategyVi: 'Học theo cặp nghĩa ngắn: nhìn nghĩa tiếng Việt, nói từ tiếng Anh, rồi đọc lại ví dụ một lần.',
    dailyRoutineVi: 'Mỗi lượt chọn 8–10 từ A1, ưu tiên từ hay sai trước khi thêm từ mới.',
    memoryHookVi: 'Gắn từ với một cảnh thật gần: nhà, lớp học, bữa ăn hoặc lời chào.',
    reviewCueVi: 'Nếu còn ngập ngừng hơn 3 giây, đánh dấu Cần ôn lại để gặp lại từ sau ít phút.',
  },
  A2: {
    cefrLevel: 'A2',
    focusVi: 'Mở rộng đời sống hằng ngày, kế hoạch đơn giản và trải nghiệm cá nhân.',
    strategyVi: 'Đọc ví dụ thành cụm, không học từng chữ rời; sau đó tự đổi một chi tiết trong câu.',
    dailyRoutineVi: 'Ôn 10–12 từ A2 theo chủ đề, xen kẽ từ mới với từ đang học.',
    memoryHookVi: 'Liên kết từ với một hành động cụ thể trong ngày để nhớ cách dùng.',
    reviewCueVi: 'Từ A2 cần nhớ cả ngữ cảnh; nếu nhớ nghĩa nhưng quên cách dùng, vẫn cho vào nhóm ôn.',
  },
  B1: {
    cefrLevel: 'B1',
    focusVi: 'Diễn đạt ý kiến, kể chuyện ngắn và xử lý tình huống quen thuộc.',
    strategyVi: 'Sau khi lật thẻ, tự đặt một câu mới liên quan đến bản thân trước khi đánh dấu đã thuộc.',
    dailyRoutineVi: 'Ôn theo vòng nhỏ: 6 từ yếu, 6 từ đang học, rồi mới thêm từ B1 mới.',
    memoryHookVi: 'Nhớ từ bằng lý do sử dụng: dùng để giải thích, kể lại, so sánh hay nêu lựa chọn.',
    reviewCueVi: 'Nếu ví dụ đọc trôi nhưng chưa tự tạo được câu, giữ từ ở trạng thái đang học.',
  },
  B2: {
    cefrLevel: 'B2',
    focusVi: 'Nói rõ sắc thái, nguyên nhân, lựa chọn và ý tưởng học thuật/thực tế hơn.',
    strategyVi: 'So sánh từ với một từ gần nghĩa hoặc trái nghĩa, rồi đọc ví dụ để giữ đúng sắc thái.',
    dailyRoutineVi: 'Mỗi lượt chỉ nên học ít từ B2 hơn, tập trung hiểu sắc thái và tình huống dùng.',
    memoryHookVi: 'Gắn từ với một lập luận ngắn: nguyên nhân, kết quả, lợi ích hoặc rủi ro.',
    reviewCueVi: 'Từ B2 nên được đánh dấu đã thuộc chỉ khi bạn nói được một câu mới rõ nghĩa.',
  },
};

export function getVocabularyLearningGroupMetadata(level?: GeneratedVocabularyCefrLevel) {
  if (!level) return vocabularyLearningGroups.A1;
  return vocabularyLearningGroups[level] ?? vocabularyLearningGroups.A1;
}
