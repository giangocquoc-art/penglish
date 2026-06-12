import { getLessonById, type EnglishLesson } from '../lib/p-english/lesson-content-data';

export type LessonSeoPage = {
  path: string;
  requestedSlug: string;
  lessonId: string;
  title: string;
  description: string;
  h1: string;
  quickAnswerHeading: string;
  quickAnswer: string;
  quickBullets: string[];
  sections: Array<{ heading: string; paragraphs: string[] }>;
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: Array<{ label: string; to: string }>;
  lastmod: string;
  priority: string;
  lesson: EnglishLesson;
};

const LESSON_SEO_ALIASES = [
  { slug: 'unit-1-greetings-introduction', lessonId: 'unit-1-greetings-introduction' },
  { slug: 'unit-2-family-friends', lessonId: 'unit-2-family-and-friends' },
  { slug: 'unit-3-school-classroom', lessonId: 'unit-3-school-and-classroom' },
] as const;

function buildLessonSeoPage(alias: (typeof LESSON_SEO_ALIASES)[number]): LessonSeoPage | null {
  const lesson = getLessonById(alias.lessonId);
  if (!lesson) return null;

  const vocabularyPreview = lesson.vocabulary.slice(0, 6).map((item) => item.term).join(', ');
  const objectivePreview = lesson.learningObjectives.slice(0, 3).join('; ');

  return {
    path: `/bai-hoc/${alias.slug}`,
    requestedSlug: alias.slug,
    lessonId: lesson.id,
    title: `${lesson.unitTitle} - Bài học tiếng Anh PooEnglish`,
    description: `Học ${lesson.titleVi.toLowerCase()} bằng từ vựng, mẫu câu, luyện nghe, nói phản xạ và quiz nhỏ trên PooEngữ pháp người mới bắt đầu.`,
    h1: `${lesson.unitTitle}: ${lesson.titleVi}`,
    quickAnswerHeading: `Bài ${lesson.titleVi.toLowerCase()} học gì?`,
    quickAnswer: `Bài ${lesson.titleVi.toLowerCase()} giúp người mới học các từ và câu căn bản như ${vocabularyPreview}. Người học được đọc nghĩa từ vựnghe câu mẫu, luyện nói phản xạ và kiểm tra nhẹ để dùng bài trong tình huống thật.`,
    quickBullets: [
      `Trình độ: ${lesson.level}`,
      `Thời lượng gợi ý: ${lesson.estimatedTime}`,
      `Mục tiêu chính: ${objectivePreview}`,
    ],
    sections: [
      {
        heading: `Vì sao nên học ${lesson.titleVi.toLowerCase()} trước?`,
        paragraphs: [
          `${lesson.titleVi} là nhóm nội dung gần đời sống, giúp người mới có câu để dùng ngay. Khi bài học bắt đầu từ tình huống quen, người học bớt sợ tiếng Anh và dễ nhớ cách dùng từ hơn.`,
          `PooEnglish thiết kế bài này bằng vòng học nhỏ: từ vựng, mẫu câu, hội thoại ngắn, nghe, nói phản xạ, flashcard và quiz. Cách học này giúp một mảnh kiến thức được gặp lại nhiều lần thay vì chỉ đọc một lần rồi quên.`,
        ],
      },
      {
        heading: 'từ vựng và mẫu câu trong bài',
        paragraphs: [
          `Một số từ và cụm tiêu biểu gồm: ${vocabularyPreview}. Những từ này được đặt trong câu ví dụ để bạn hiểu nghĩa, phát âm và tình huống dùng.`,
          `Bài học cũng có các mẫu câu như ${lesson.sentencePatterns.slice(0, 3).map((pattern) => pattern.pattern).join(', ')}. Hãy học mẫu câu như một khung dùng được, sau đó thay từ để tạo câu của riêng bạn.`,
        ],
      },
      {
        heading: 'Cách học bài này trong PooEnglish',
        paragraphs: [
          'Bạn nên đọc mục tiêu trước, học vài từ chính, nghe câu mẫu, nói lại chậm, rồi làm quiz nhỏ. Nếu câu nào còn khó, hãy lưu từ hoặc cụm vào sổ từ vựng để ôn lại.',
          'Sau bài học, bạn có thể mở shadowing để luyện nhịp nói hoặc quay về lộ trình học để biết bài kế tiếp. Poo khuyên học chậm nhưng chắc, đặc biệtừ vựngười mất gốc.',
        ],
      },
    ],
    faqs: [
      { question: `Bài ${lesson.titleVi.toLowerCase()} phù hợp với ai?`, answer: 'Bài này phù hợp với người mới bắt đầu, người mất gốc hoặc người muốn ôn lại mẫu câu giao tiếp cơ bản bằng tiếng Việt dễ hiểu.' },
      { question: 'Có cần đăng nhập để xem bài học không?', answer: 'Trang SEO bài học có thể đọc công khai. Khi vào app học tương tác, đăng nhập giúp lưu tiến độ tốt hơn nhưng không phải rào cản để tìm hiểu nội dung.' },
      { question: 'Nên học bài này trong bao lâu?', answer: `Bạn có thể dành khoảng ${lesson.estimatedTime}, sau đó quay lại ôn từ và nói lại câu khó vào ngày hôm sau.` },
      { question: 'Bài này có luyện nghe nói không?', answer: 'Có. Dữ liệu bài học gồm luyện nghe, nói phản xạ và có thể nối sang shadowing để luyện nhịp câu tự nhiên hơn.' },
      { question: 'Sau bài này nên học gì tiếp?', answer: 'Bạn nên quay lộ trình học để đi tiếp theo thứ tự, hoặc mở sổ từ vựng để ôn những từ còn chưa chắc.' },
    ],
    relatedLinks: [
      { label: 'Vào lộ trình học', to: '/learning-path' },
      { label: 'Luyện shadowing', to: '/shadowing' },
      { label: 'Ôn từ vựng', to: '/words' },
      { label: 'học tiếng Anh cho người mất gốc', to: '/hoc-tieng-anh-cho-nguoi-mat-goc' },
    ],
    lastmod: '2026-06-11',
    priority: '0.82',
    lesson,
  };
}

export const LESSON_SEO_PAGES: LessonSeoPage[] = LESSON_SEO_ALIASES.map(buildLessonSeoPage).filter((page): page is LessonSeoPage => Boolean(page));

export const LESSON_SEO_PATHS = LESSON_SEO_PAGES.map((page) => page.path);

export function getLessonSeoPageByPath(pathname: string) {
  return LESSON_SEO_PAGES.find((page) => page.path === pathname);
}
