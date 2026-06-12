import type { PooLesson } from './pooLessonTypes';
import { POO_LESSON_FORMAT_VERSION, POO_LESSON_MIGRATION_NOTES } from './pooLessonTypes';

export const pooExampleGreetingLesson: PooLesson = {
  id: 'poo-a0-greeting-hello-whale',
  title: 'Chào hỏi với Poo Whale',
  titleVi: 'Chào hỏi với Poo Whale',
  titleEn: 'Greeting with Poo Whale',
  level: 'A0',
  skillFocus: ['vocabulary', 'patterns', 'dialogue', 'listening', 'shadowing', 'speaking'],
  lessonMode: 'core-lesson',
  learningGoalVi: 'Sau bài này, học viên có thể chào hỏi, nói tên và hỏi thăm một người bạn bằng câu rất ngắn.',
  oceanTheme: 'Poo Whale gặp bạn mới ở đầm nước xanh',
  oceanArea: 'lagoon',
  estimatedMinutes: 12,
  vocabulary: [
    {
      id: 'vocab-hello',
      term: 'hello',
      meaningVi: 'xin chào',
      pronunciation: '/həˈloʊ/',
      partOfSpeech: 'greeting',
      exampleEn: 'Hello, Poo.',
      exampleVi: 'Xin chào, Poo.',
      tags: ['greeting', 'a0'],
      sourceVocabularyId: 'hello',
    },
    {
      id: 'vocab-name',
      term: 'name',
      meaningVi: 'tên',
      pronunciation: '/neɪm/',
      partOfSpeech: 'noun',
      exampleEn: 'My name is Nam.',
      exampleVi: 'Tên của mình là Nam.',
      tags: ['identity', 'a0'],
    },
    {
      id: 'vocab-thank-you',
      term: 'thank you',
      meaningVi: 'cảm ơn',
      pronunciation: '/ˈθæŋk juː/',
      partOfSpeech: 'phrase',
      exampleEn: 'Thank you, Poo.',
      exampleVi: 'Cảm ơn, Poo.',
      tags: ['polite', 'a0'],
      sourceVocabularyId: 'thank-you',
    },
  ],
  patterns: [
    {
      id: 'pattern-my-name-is',
      pattern: 'My name is + name.',
      meaningVi: 'Tên của tôi là + tên.',
      explanationVi: 'Dùng mẫu này để giới thiệu tên của mình một cách đơn giản.',
      examples: [
        { en: 'My name is Nam.', vi: 'Tên của tôi là Nam.' },
        { en: 'My name is Linh.', vi: 'Tên của tôi là Linh.' },
      ],
    },
    {
      id: 'pattern-how-are-you',
      pattern: 'How are you?',
      meaningVi: 'Bạn khỏe không?',
      explanationVi: 'Dùng để hỏi thăm người khác sau khi chào.',
      examples: [
        { en: 'Hello. How are you?', vi: 'Xin chào. Bạn khỏe không?' },
        { en: 'I am good. Thank you.', vi: 'Mình khỏe. Cảm ơn bạn.' },
      ],
    },
  ],
  dialogue: [
    {
      id: 'dialogue-meet-poo',
      titleVi: 'Gặp Poo lần đầu',
      situationVi: 'Bạn gặp Poo Whale ở đầm nước xanh và chào hỏi thật ngắn.',
      lines: [
        {
          id: 'd1-l1',
          speaker: 'Poo',
          en: 'Hello. My name is Poo.',
          vi: 'Xin chào. Tên mình là Poo.',
          focusWords: ['hello', 'name'],
        },
        {
          id: 'd1-l2',
          speaker: 'Learner',
          en: 'Hello, Poo. My name is Nam.',
          vi: 'Xin chào Poo. Tên mình là Nam.',
          focusWords: ['hello', 'my name is'],
        },
        {
          id: 'd1-l3',
          speaker: 'Poo',
          en: 'How are you?',
          vi: 'Bạn khỏe không?',
          focusWords: ['how are you'],
        },
        {
          id: 'd1-l4',
          speaker: 'Learner',
          en: 'I am good. Thank you.',
          vi: 'Mình khỏe. Cảm ơn bạn.',
          focusWords: ['good', 'thank you'],
        },
      ],
    },
  ],
  listeningTasks: [
    {
      id: 'listen-hello-poo',
      titleVi: 'Nghe Poo chào bạn',
      promptVi: 'Nghe đoạn ngắn và chọn câu trả lời đúng.',
      transcriptEn: 'Hello. My name is Poo. How are you?',
      transcriptVi: 'Xin chào. Tên mình là Poo. Bạn khỏe không?',
      questions: [
        {
          id: 'listen-q1',
          questionVi: 'Poo nói tên của bạn ấy là gì?',
          choices: ['Poo', 'Nam', 'Linh'],
          correctAnswer: 'Poo',
          explanationVi: 'Trong transcript có câu: My name is Poo.',
        },
      ],
    },
  ],
  shadowing: [
    {
      id: 'shadow-hello-poo-slow',
      titleVi: 'Nhại lại câu chào thật chậm',
      speed: 'slow',
      lines: [
        {
          id: 's1-l1',
          en: 'Hello.',
          vi: 'Xin chào.',
          pronunciationTipVi: 'Bật nhẹ âm /h/ đầu câu.',
          startSeconds: 0,
          endSeconds: 2,
        },
        {
          id: 's1-l2',
          en: 'My name is Poo.',
          vi: 'Tên mình là Poo.',
          pronunciationTipVi: 'Đọc my name is thành một cụm chậm.',
          startSeconds: 2,
          endSeconds: 5,
        },
        {
          id: 's1-l3',
          en: 'How are you?',
          vi: 'Bạn khỏe không?',
          pronunciationTipVi: 'Lên giọng nhẹ ở cuối câu hỏi.',
          startSeconds: 5,
          endSeconds: 8,
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'quiz-hello-meaning',
      type: 'multiple-choice',
      promptVi: '“Hello” nghĩa là gì?',
      choices: ['Xin chào', 'Tạm biệt', 'Cảm ơn'],
      correctAnswer: 'Xin chào',
      explanationVi: 'Hello là cách chào phổ biến trong tiếng Anh.',
    },
    {
      id: 'quiz-order-name',
      type: 'sentence-order',
      promptVi: 'Sắp xếp thành câu đúng: name / is / My / Nam',
      correctAnswer: ['My', 'name', 'is', 'Nam'],
      explanationVi: 'Câu đúng là: My name is Nam.',
    },
  ],
  commonMistakesVi: [
    {
      id: 'mistake-my-name',
      mistakeVi: 'Dịch từng chữ “Tên tôi Nam” thành câu thiếu động từ.',
      wrongEn: 'My name Nam.',
      correctEn: 'My name is Nam.',
      explanationVi: 'Tiếng Anh cần động từ “is” trong mẫu “My name is ...”.',
    },
  ],
  review: {
    srsDays: [1, 3, 7, 14],
    quickReviewPrompts: ['Nói “Hello” với Poo.', 'Nói tên của bạn bằng “My name is ...”.', 'Hỏi “How are you?” thật chậm.'],
    masteryCriteriaVi: ['Nhớ ít nhất 3 từ/cụm chính.', 'Nói được mẫu “My name is ...”.', 'Shadowing được 3 câu ngắn với nhịp chậm.'],
  },
  contentMaturity: 'draft',
  migration: {
    migrationStatus: 'new-format',
    notesVi: [
      `Lesson mẫu dùng format ${POO_LESSON_FORMAT_VERSION}.`,
      'Không import vào runtime cũ, nên không ảnh hưởng dữ liệu bài học hiện tại.',
      ...POO_LESSON_MIGRATION_NOTES,
    ],
  },
};

export default pooExampleGreetingLesson;
