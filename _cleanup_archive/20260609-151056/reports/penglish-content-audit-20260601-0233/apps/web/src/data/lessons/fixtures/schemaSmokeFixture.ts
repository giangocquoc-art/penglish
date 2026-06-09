import type { PEnglishLesson } from '../lessonSchema';

export const schemaSmokeFixture: PEnglishLesson[] = [
  {
    id: 'schema-smoke-a1-greeting',
    moduleId: 'schema-smoke',
    sourceMeta: {
      sourceId: 'schema-smoke-fixture',
      sourceName: 'Original schema smoke fixture',
      license: 'Project internal test fixture',
      status: 'original',
      notes: ['Original minimal content used only to verify the lesson schema.'],
    },
    cefrLevel: 'A1',
    titleVi: 'Kiểm tra schema: chào hỏi cơ bản',
    titleEn: 'Schema smoke test: basic greeting',
    goalVi: 'Xác nhận schema hỗ trợ một bài học nhỏ có bài tập trắc nghiệm.',
    explanationVi: 'Fixture này không được nối vào UI và không phải nội dung nhập từ nguồn ngoài.',
    vocabulary: [
      {
        id: 'vocab-hello',
        term: 'hello',
        meaningVi: 'xin chào',
        partOfSpeech: 'interjection',
        cefrLevel: 'A1',
        exampleEn: 'Hello, I am Lan.',
        exampleVi: 'Xin chào, tôi là Lan.',
      },
    ],
    grammarPoint: {
      id: 'grammar-i-am',
      nameVi: 'Mẫu câu giới thiệu tên',
      nameEn: 'Introducing your name',
      explanationVi: 'Dùng “I am ...” để giới thiệu tên hoặc vai trò rất ngắn gọn.',
      pattern: 'I am + name.',
      notesVi: [],
    },
    examples: [
      {
        id: 'example-hello',
        english: 'Hello, I am Lan.',
        vietnamese: 'Xin chào, tôi là Lan.',
        contextVi: 'Dùng khi bắt đầu giới thiệu bản thân.',
      },
    ],
    exercises: [
      {
        id: 'exercise-hello-choice',
        type: 'multiple-choice',
        promptVi: '“Hello” nghĩa là gì?',
        skillTags: [],
        options: ['xin chào', 'tạm biệt', 'cảm ơn', 'xin lỗi'],
        correctAnswer: 'xin chào',
        explanationVi: '“Hello” là cách chào thông dụng trong tiếng Anh.',
      },
    ],
    keyboardHint: {
      submitVi: 'Nhấn Enter để trả lời.',
      nextVi: 'Sau khi đúng, nhấn Enter để sang câu tiếp theo.',
      multipleChoiceVi: 'Có thể dùng A/B/C/D hoặc 1/2/3/4 để chọn đáp án.',
    },
    completionReward: {
      xp: 5,
      hearts: 0,
      messageVi: 'Schema smoke test hoàn tất.',
    },
    needsReview: false,
    importNotes: ['Fixture nhỏ, nguyên bản, chỉ dùng cho kiểm thử validation.'],
  },
];
