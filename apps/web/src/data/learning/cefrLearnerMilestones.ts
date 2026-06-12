import type { UnifiedCefrLevel } from './generatedUnifiedLearningPath';

export type CefrLearnerMilestone = {
  level: UnifiedCefrLevel;
  label: string;
  threshold: number;
  shortNoteVi: string;
  learnerCanDoVi: string;
  transitionVi: string;
  skillExpectationsVi: string[];
};

export const cefrLearnerMilestones: CefrLearnerMilestone[] = [
  {
    level: 'A1',
    label: 'Nền tảng sinh tồn',
    threshold: 0,
    shortNoteVi: 'Hiểu câu rất ngắn, chào hỏi, giới thiệu bản thân và nói nhu cầu đơn giản.',
    learnerCanDoVi: 'Bạn có thể nhận ra từ quen thuộc, trả lời câu ngắn và bắt đầu nói về bản thân bằng mẫu câu an toàn.',
    transitionVi: 'Từ A1 lên A2: gom từ vựng theo tình huống hằng ngày, luyện nghe câu ngắn và gõ lại câu mẫu thật chắc.',
    skillExpectationsVi: ['từ vựng lõi quanh bản thân, gia đình, lớp học', 'Nghe câu chậm và chọn ý chính', 'Nói/gõ câu mẫu ngắn không cần dịch từng chữ'],
  },
  {
    level: 'A2',
    label: 'Giao tiếp quen thuộc',
    threshold: 30,
    shortNoteVi: 'Xử lý tình huống thường gặp như mua sắm, thời gian, thói quen và kế hoạch gần.',
    learnerCanDoVi: 'Bạn có thể hiểu đoạn ngắn, hỏi đáp thông tin quen thuộc và nối nhiều câu đơn thành một lượt nói rõ ý.',
    transitionVi: 'Từ A2 lên B1: tăng độ dài đoạn đọc/nghe, luyện phản xạ theo cụm và bắt đầu giải thích lý do đơn giản.',
    skillExpectationsVi: ['Dùng thì cơ bản trong ngữ cảnh quen', 'Nghe hội thoại ngắn để lấy thông tin cụ thể', 'Shadowing câu ngắn để nói trôi hơn'],
  },
  {
    level: 'B1',
    label: 'Tự tin trong tình huống thật',
    threshold: 58,
    shortNoteVi: 'Theo được nội dung quen thuộc, kể trải nghiệm, nêu ý kiến và xử lý phần lớn tình huống du lịch/học tập.',
    learnerCanDoVi: 'Bạn có thể đọc/nghe đoạn vừa phải, tóm tắt ý chính và trả lời bằng câu có lý do, ví dụ, cảm xúc.',
    transitionVi: 'Từ B1 lên B2: mở rộng chủ đề, luyện tốc độ xử lý, học cách so sánh quan điểm và sửa lỗi diễn đạt.',
    skillExpectationsVi: ['Đọc lấy ý chính trước khi soi chi tiết', 'Nghe nội dung đời sống với tốc độ vừa', 'Viết/nói đoạn ngắn có mở ý và ví dụ'],
  },
  {
    level: 'B2',
    label: 'Độc lập và linh hoạt hơn',
    threshold: 82,
    shortNoteVi: 'Hiểu ý chính của nội dungữ pháp vừa phải và diễn đạt quan điểm rõ ràng hơn.',
    learnerCanDoVi: 'Bạn có thể học độc lập hơn: đọc/nghe nguồn thật có chọn lọc, thảo luận ý kiến và tự sửa lỗi thường gặp.',
    transitionVi: 'Sau B2: duy trì thói quen đọc/nghe thật, tăng độ chính xác và chọn tài nguyên ngoài app theo mục tiêu cá nhân.',
    skillExpectationsVi: ['Xử lý bài đọc/nghe dài hơn theo mục tiêu', 'Nói có lập luận, ví dụ và chuyển ý', 'Dùng Resource Hub sau khi học bài trong P-English'],
  },
];

export const cefrLearnerMilestoneByLevel = cefrLearnerMilestones.reduce(
  (acc, milestone) => {
    acc[milestone.level] = milestone;
    return acc;
  },
  {} as Record<UnifiedCefrLevel, CefrLearnerMilestone>,
);
