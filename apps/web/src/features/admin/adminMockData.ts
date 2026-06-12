export type AdminStatusTone = 'green' | 'blue' | 'amber' | 'red' | 'gray';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  lastLogin: string;
  currentLesson: string;
  progress: number;
  status: 'Đang học' | 'Tạm khóa' | 'Chưa bắt đầu';
};

export type AdminLesson = {
  id: string;
  title: string;
  topic: string;
  wordCount: number;
  listeningCount: number;
  quizCount: number;
  status: 'Đang hiện' | 'Đang ẩn' | 'Bản nháp';
};

export type AdminWord = {
  id: string;
  english: string;
  vietnamese: string;
  example: string;
  topic: string;
  difficulty: 'A1' | 'A2' | 'B1';
  status: 'Đang dùng' | 'Cần duyệt' | 'Đã ẩn';
};

export type AdminFeedback = {
  id: string;
  sender: string;
  email: string;
  content: string;
  page: string;
  createdAt: string;
  status: 'Mới' | 'Đang xử lý' | 'Đã xử lý' | 'Bỏ qua';
};

export const adminUsers: AdminUser[] = [
  { id: 'u-1', name: 'Minh Anh', email: 'minhanh@example.com', joinedAt: '10/06/2026', lastLogin: 'Hôm nay 18:20', currentLesson: 'Ngày 3: Làm quen', progress: 42, status: 'Đang học' },
  { id: 'u-2', name: 'Quốc Huy', email: 'huy.nguyen@example.com', joinedAt: '09/06/2026', lastLogin: 'Hôm nay 11:05', currentLesson: 'Unit 1: Greetings', progress: 68, status: 'Đang học' },
  { id: 'u-3', name: 'Lan Phương', email: 'lanphuong@example.com', joinedAt: '08/06/2026', lastLogin: 'Hôm qua 21:10', currentLesson: 'Ngày 1: Nền tảng', progress: 18, status: 'Chưa bắt đầu' },
  { id: 'u-4', name: 'Gia Bảo', email: 'giabao@example.com', joinedAt: '07/06/2026', lastLogin: '07/06/2026', currentLesson: 'Ngày 8: Thói quen', progress: 81, status: 'Tạm khóa' },
];

export const adminLessons: AdminLesson[] = [
  { id: 'l-1', title: 'Unit 1: Greetings & Introduction', topic: 'Giao tiếp cơ bản', wordCount: 24, listeningCount: 8, quizCount: 6, status: 'Đang hiện' },
  { id: 'l-2', title: 'Unit 2: Family & Friends', topic: 'Gia đình', wordCount: 32, listeningCount: 10, quizCount: 8, status: 'Đang hiện' },
  { id: 'l-3', title: '48 ngày lấy gốc - Ngày 4', topic: 'Câu đơn', wordCount: 18, listeningCount: 5, quizCount: 4, status: 'Bản nháp' },
  { id: 'l-4', title: 'Phản xạ nhanh: Daily Routine', topic: 'Thói quen', wordCount: 26, listeningCount: 12, quizCount: 7, status: 'Đang ẩn' },
];

export const adminWords: AdminWord[] = [
  { id: 'w-1', english: 'hello', vietnamese: 'xin chào', example: 'Hello, my name is Poo.', topic: 'Chào hỏi', difficulty: 'A1', status: 'Đang dùng' },
  { id: 'w-2', english: 'practice', vietnamese: 'luyện tập', example: 'I practice English every day.', topic: 'Học tập', difficulty: 'A2', status: 'Đang dùng' },
  { id: 'w-3', english: 'confident', vietnamese: 'tự tin', example: 'She feels confident when speaking.', topic: 'Cảm xúc', difficulty: 'B1', status: 'Cần duyệt' },
  { id: 'w-4', english: 'listen', vietnamese: 'nghe', example: 'Listen and repeat the sentence.', topic: 'Kỹ năng', difficulty: 'A1', status: 'Đã ẩn' },
];

export const adminFeedback: AdminFeedback[] = [
  { id: 'f-1', sender: 'Thanh Trúc', email: 'tructhanh@example.com', content: 'Âm thanh bài nghe hơi nhỏ trên điện thoại.', page: '/lessons/unit-1-greetings-introduction', createdAt: '10/06/2026 18:12', status: 'Mới' },
  { id: 'f-2', sender: 'Hoàng Nam', email: 'namhoang@example.com', content: 'Em muốn có từ vựng Việt ở phần từ mới.', page: '/words', createdAt: '10/06/2026 14:40', status: 'Đang xử lý' },
  { id: 'f-3', sender: 'Mai Chi', email: 'maichi@example.com', content: 'Trang luyện nói tải hơi chậm lần đầu.', page: '/shadowing', createdAt: '09/06/2026 22:05', status: 'Đã xử lý' },
  { id: 'f-4', sender: 'Bảo An', email: 'baoan@example.com', content: 'Nhầm nút ôn lại với bắt đầu bài mới.', page: '/home', createdAt: '09/06/2026 09:16', status: 'Bỏ qua' },
];

export const popularLessons = [
  { id: 'p-1', title: '48 ngày lấy gốc - Ngày 1', learners: 812, completion: '76%' },
  { id: 'p-2', title: 'Unit 1: Greetings & Introduction', learners: 694, completion: '71%' },
  { id: 'p-3', title: 'Phản xạ nhanh: Chào hỏi', learners: 428, completion: '64%' },
];

export const adminStats = [
  { label: 'Tổng người học', value: '2.486', helper: '+128 trong 7 ngày', tone: 'blue' as const },
  { label: 'Người học hôm nay', value: '184', helper: '42 người mới', tone: 'green' as const },
  { label: 'Bài đã hoàn thành', value: '9.732', helper: '+312 hôm nay', tone: 'amber' as const },
  { label: 'Phản hồi mới', value: '12', helper: '4 cần xử lý', tone: 'red' as const },
];

export function statusTone(status: string): AdminStatusTone {
  if (['Đang học', 'Đang hiện', 'Đang dùng', 'Đã xử lý'].includes(status)) return 'green';
  if (['Mới'].includes(status)) return 'blue';
  if (['Chưa bắt đầu', 'Bản nháp', 'Cần duyệt', 'Đang xử lý'].includes(status)) return 'amber';
  if (['Tạm khóa', 'Đã ẩn', 'Bỏ qua'].includes(status)) return 'red';
  return 'gray';
}
