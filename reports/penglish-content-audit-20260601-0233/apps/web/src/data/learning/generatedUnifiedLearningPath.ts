export type UnifiedCefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type UnifiedSkillFocus = 'Từ vựng' | 'Ngữ pháp' | 'Đọc' | 'Shadowing' | 'Phát âm' | 'Ôn tập';

export type UnifiedPracticeMode =
  | 'flashcard'
  | 'quiz'
  | 'listen'
  | 'reflex'
  | 'type'
  | 'match'
  | 'speed'
  | 'shadowing'
  | 'pronunciation';

export type UnifiedSourceModuleReference = {
  module: 'handcrafted-lessons' | 'generated-vocabulary' | 'generated-grammar' | 'generated-reading' | 'generated-shadowing' | 'generated-speech';
  ids: string[];
  runtimeRoute: string;
  integrationNote: string;
};

export type UnifiedLearningUnit = {
  id: string;
  titleVi: string;
  subtitleVi: string;
  level: UnifiedCefrLevel;
  skillFocus: UnifiedSkillFocus;
  estimatedTime: string;
  lessonIds: string[];
  sourceIds: string[];
  primaryMode: UnifiedPracticeMode;
  recommendedPracticeModes: UnifiedPracticeMode[];
  whaleCoachLine: string;
  confidenceGoal: string;
  contentMaturity: 'foundation' | 'expanded' | 'mature';
  maturityLabelVi: string;
  maturityNoteVi: string;
  sourceModuleReference: UnifiedSourceModuleReference;
  unlockedByUnitId?: string;
};

export const generatedUnifiedLearningPath: UnifiedLearningUnit[] = [
  {
    id: 'path-a1-greetings-core',
    titleVi: 'A1 · Chào hỏi tự tin',
    subtitleVi: 'Bắt đầu bằng câu chào, giới thiệu tên và phản xạ rất ngắn.',
    level: 'A1',
    skillFocus: 'Từ vựng',
    estimatedTime: '15–20 phút',
    lessonIds: ['unit-1-greetings-introduction'],
    sourceIds: ['unit-1-greetings-introduction', 'cefr-a1-core'],
    primaryMode: 'flashcard',
    recommendedPracticeModes: ['flashcard', 'quiz', 'listen', 'reflex', 'match', 'speed'],
    whaleCoachLine: 'Đi chậm nhưng chắc: nhớ cụm chào trước, rồi mới tăng tốc phản xạ.',
    confidenceGoal: 'Tự chào, nói tên và hỏi tên trong 10 giây.',
    contentMaturity: 'mature',
    maturityLabelVi: 'Mature · bài lõi đã đầy đủ',
    maturityNoteVi: 'Unit handcrafted có đủ luyện từ, quiz, nghe, phản xạ và speed; dùng làm chuẩn nền cho A1.',
    sourceModuleReference: {
      module: 'handcrafted-lessons',
      ids: ['unit-1-greetings-introduction'],
      runtimeRoute: '/lessons/unit-1-greetings-introduction',
      integrationNote: 'Handcrafted lesson remains as compatibility fallback and is paired with generated CEFR vocabulary review.',
    },
  },
  {
    id: 'path-a1-family-school',
    titleVi: 'A1 · Gia đình và lớp học',
    subtitleVi: 'Nối các câu giới thiệu người thân, bạn bè và đồ dùng lớp học.',
    level: 'A1',
    skillFocus: 'Ôn tập',
    estimatedTime: '70–90 phút',
    lessonIds: ['unit-2-family-and-friends', 'unit-3-school-and-classroom'],
    sourceIds: ['unit-2-family-and-friends', 'unit-3-school-and-classroom', 'cefr-a1-core'],
    primaryMode: 'quiz',
    recommendedPracticeModes: ['flashcard', 'quiz', 'listen', 'reflex', 'type', 'match', 'speed'],
    whaleCoachLine: 'Hãy gom từ thành cụm câu ngắn: This is my..., I have..., Can I borrow...? ',
    confidenceGoal: 'Giới thiệu gia đình hoặc lớp học bằng 4 câu A1 liên tiếp.',
    unlockedByUnitId: 'path-a1-greetings-core',
    contentMaturity: 'mature',
    maturityLabelVi: 'Mature · nhiều bài authored',
    maturityNoteVi: 'Cụm bài gia đình/lớp học đã có nhiều mode thực hành và được nối với CEFR vocabulary review.',
    sourceModuleReference: {
      module: 'handcrafted-lessons',
      ids: ['unit-2-family-and-friends', 'unit-3-school-and-classroom'],
      runtimeRoute: '/lessons/unit-2-family-and-friends',
      integrationNote: 'Existing authored A1 lessons provide full practice modes; generated vocabulary supports review expansion.',
    },
  },
  {
    id: 'path-a1-grammar-reading',
    titleVi: 'A1 · Câu đúng và đọc câu ngắn',
    subtitleVi: 'Luyện mạo từ, câu điền chỗ trống và đoạn đọc A1 hằng ngày.',
    level: 'A1',
    skillFocus: 'Đọc',
    estimatedTime: '95–110 phút',
    lessonIds: ['grammar-a1-articles-a-an-the', 'reading-a1-my-morning'],
    sourceIds: ['grammar-a1-articles-a-an-the', 'reading-a1-my-morning', 'reading-a1-at-school', 'reading-a1-my-family-dinner'],
    primaryMode: 'type',
    recommendedPracticeModes: ['flashcard', 'quiz', 'type', 'match', 'speed'],
    whaleCoachLine: 'Đọc ngắn mỗi ngày giúp cá voi của bạn bơi xa hơn mà không hụt hơi.',
    confidenceGoal: 'Chọn đúng a/an/the và hiểu một đoạn A1 rất ngắn.',
    unlockedByUnitId: 'path-a1-family-school',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · grammar + reading runtime',
    maturityNoteVi: 'Đã có bài grammar/reading adapter chạy trong lesson route; cần tiếp tục thêm chiều sâu sau phase foundation.',
    sourceModuleReference: {
      module: 'generated-reading',
      ids: ['reading-a1-my-morning', 'reading-a1-at-school', 'reading-a1-my-family-dinner'],
      runtimeRoute: '/lessons/reading-a1-my-morning',
      integrationNote: 'Generated grammar and reading lessons are adapted to EnglishLesson for lesson/practice route compatibility.',
    },
  },
  {
    id: 'path-a1-shadow-pronounce',
    titleVi: 'A1 · Nghe nhịp và phát âm rõ',
    subtitleVi: 'Shadowing câu chào, đặt đồ ăn đơn giản và luyện phát âm bằng trình duyệt.',
    level: 'A1',
    skillFocus: 'Phát âm',
    estimatedTime: '25–35 phút',
    lessonIds: ['unit-1-greetings-introduction'],
    sourceIds: ['shadow-a1-greeting-friend', 'shadow-a1-order-water-coffee', 'a1-hello', 'a1-good-morning', 'a1-thank-you'],
    primaryMode: 'pronunciation',
    recommendedPracticeModes: ['shadowing', 'pronunciation', 'speed', 'listen'],
    whaleCoachLine: 'Đừng nói nhanh vội. Nói rõ từng cụm trước, tốc độ sẽ tự đến sau.',
    confidenceGoal: 'Lặp lại 5 câu A1 rõ âm và đúng nhịp cơ bản.',
    unlockedByUnitId: 'path-a1-grammar-reading',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · audio/API-first',
    maturityNoteVi: 'Speech và Shadowing đã nối với ghi âm/API feedback; video tham chiếu là nền tảng curated ban đầu.',
    sourceModuleReference: {
      module: 'generated-speech',
      ids: ['a1-hello', 'a1-good-morning', 'a1-thank-you'],
      runtimeRoute: '/english-speed',
      integrationNote: 'App-authored shadowing scripts and local browser speech prompts are linked without bundling copyrighted media.',
    },
  },
  {
    id: 'path-a2-practical-vocabulary',
    titleVi: 'A2 · Từ vựng tình huống thực tế',
    subtitleVi: 'Mở rộng từ cho chỉ đường, mua sắm, sở thích và kế hoạch gần.',
    level: 'A2',
    skillFocus: 'Từ vựng',
    estimatedTime: '30–40 phút',
    lessonIds: ['reading-a2-train-trip'],
    sourceIds: ['cefr-a2-core', 'reading-a2-train-trip', 'reading-a2-shopping-list'],
    primaryMode: 'flashcard',
    recommendedPracticeModes: ['flashcard', 'quiz', 'match', 'type', 'speed'],
    whaleCoachLine: 'A2 là lúc biến từ rời thành câu dùng được ngoài đời.',
    confidenceGoal: 'Hiểu và dùng được từ vựng chính trong tin nhắn hoặc kế hoạch ngắn.',
    unlockedByUnitId: 'path-a1-shadow-pronounce',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · CEFR vocab repaired',
    maturityNoteVi: 'Từ vựng A2 đã qua repair chất lượng; roadmap vẫn cần thêm bài tình huống sâu hơn ở phase sau.',
    sourceModuleReference: {
      module: 'generated-vocabulary',
      ids: ['cefr-a2-core'],
      runtimeRoute: '/vocabularies',
      integrationNote: 'Generated CEFR vocabulary groups stay app-native and link to the vocabulary hub.',
    },
  },
  {
    id: 'path-a2-grammar-patterns',
    titleVi: 'A2 · Mẫu ngữ pháp dùng hằng ngày',
    subtitleVi: 'Lượng từ, verb-s và giới từ in/on/at trong câu ngắn.',
    level: 'A2',
    skillFocus: 'Ngữ pháp',
    estimatedTime: '55–70 phút',
    lessonIds: ['grammar-a2-quantifiers-many-much', 'grammar-a2-third-person-singular', 'grammar-a2-prepositions-in-on-at'],
    sourceIds: ['grammar-a2-quantifiers-many-much', 'grammar-a2-each-every', 'grammar-a2-some-any', 'grammar-a2-third-person-singular', 'grammar-a2-prepositions-in-on-at'],
    primaryMode: 'type',
    recommendedPracticeModes: ['quiz', 'type', 'flashcard', 'speed'],
    whaleCoachLine: 'Mỗi lỗi ngữ pháp là một tín hiệu chỉ đường, không phải điểm dừng.',
    confidenceGoal: 'Điền đúng từ ngữ pháp A2 trong câu quen thuộc.',
    unlockedByUnitId: 'path-a2-practical-vocabulary',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · grammar pattern set',
    maturityNoteVi: 'Có nhiều pattern A2 và practice hợp lệ; phù hợp foundation, chưa phải thư viện grammar hoàn chỉnh.',
    sourceModuleReference: {
      module: 'generated-grammar',
      ids: ['grammar-a2-quantifiers-many-much', 'grammar-a2-third-person-singular', 'grammar-a2-prepositions-in-on-at'],
      runtimeRoute: '/lessons/grammar-a2-quantifiers-many-much',
      integrationNote: 'Generated grammar lessons are adapted into EnglishLesson and filtered to available practice modes.',
    },
  },
  {
    id: 'path-a2-reading-shadowing',
    titleVi: 'A2 · Đọc tin nhắn và nói theo nhịp',
    subtitleVi: 'Đọc tình huống ngắn rồi shadowing hỏi đường, mua sắm và kế hoạch cuối tuần.',
    level: 'A2',
    skillFocus: 'Shadowing',
    estimatedTime: '50–65 phút',
    lessonIds: ['reading-a2-train-trip'],
    sourceIds: ['reading-a2-asking-directions', 'reading-a2-weekend-plan', 'shadow-a2-asking-directions', 'shadow-a2-shopping-conversation'],
    primaryMode: 'shadowing',
    recommendedPracticeModes: ['quiz', 'type', 'shadowing', 'pronunciation', 'speed'],
    whaleCoachLine: 'Đọc để hiểu ý, shadowing để miệng nhớ đường đi của câu.',
    confidenceGoal: 'Hiểu tin nhắn A2 và lặp lại một hội thoại ngắn rõ nhịp.',
    unlockedByUnitId: 'path-a2-grammar-patterns',
    contentMaturity: 'foundation',
    maturityLabelVi: 'Foundation · đọc + shadowing',
    maturityNoteVi: 'Có nền reading/shadowing và video tham chiếu; cần thêm hội thoại/đọc mở rộng ở content expansion.',
    sourceModuleReference: {
      module: 'generated-shadowing',
      ids: ['shadow-a2-asking-directions', 'shadow-a2-shopping-conversation', 'shadow-a2-weekend-plan'],
      runtimeRoute: '/shadowing',
      integrationNote: 'Shadowing units point to app-authored scripts and route through the existing shadowing page.',
    },
  },
  {
    id: 'path-b1-real-life-reading',
    titleVi: 'B1 · Đọc đoạn văn đời sống',
    subtitleVi: 'Luyện kế hoạch học, việc làm thêm, học online và ý kiến đơn giản.',
    level: 'B1',
    skillFocus: 'Đọc',
    estimatedTime: '80–95 phút',
    lessonIds: ['reading-b1-study-plan'],
    sourceIds: ['cefr-b1-core', 'reading-b1-study-plan', 'reading-b1-part-time-cafe', 'reading-b1-online-learning'],
    primaryMode: 'quiz',
    recommendedPracticeModes: ['flashcard', 'quiz', 'type', 'match', 'speed'],
    whaleCoachLine: 'Ở B1, hãy tìm ý chính trước; chi tiết sẽ rõ hơn ở lượt đọc thứ hai.',
    confidenceGoal: 'Tóm tắt được ý chính của một đoạn B1 bằng tiếng Việt hoặc câu English ngắn.',
    unlockedByUnitId: 'path-a2-reading-shadowing',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · reading B1 tăng cường',
    maturityNoteVi: 'Đã có nhiều đoạn B1 đời sống và bài study group mới; vẫn cần thêm độ đa dạng chủ đề.',
    sourceModuleReference: {
      module: 'generated-reading',
      ids: ['reading-b1-study-plan', 'reading-b1-part-time-cafe'],
      runtimeRoute: '/lessons/reading-b1-study-plan',
      integrationNote: 'Generated reading lessons provide app-native comprehension and writing practice.',
    },
  },
  {
    id: 'path-b1-grammar-speaking',
    titleVi: 'B1 · Ngữ pháp cho ý kiến rõ hơn',
    subtitleVi: 'Động từ bất quy tắc, phrasal verbs, modal verbs và phát âm câu dài hơn.',
    level: 'B1',
    skillFocus: 'Ngữ pháp',
    estimatedTime: '55–70 phút',
    lessonIds: ['grammar-b1-irregular-verbs', 'grammar-b1-phrasal-verbs', 'grammar-b1-modal-verbs'],
    sourceIds: ['grammar-b1-irregular-verbs', 'grammar-b1-phrasal-verbs', 'grammar-b1-modal-verbs', 'b1-study-habit', 'b1-teamwork'],
    primaryMode: 'type',
    recommendedPracticeModes: ['quiz', 'type', 'pronunciation', 'shadowing', 'speed'],
    whaleCoachLine: 'Câu B1 không cần dài ngay; chỉ cần đúng ý, đúng nhịp và rõ lý do.',
    confidenceGoal: 'Dùng được mẫu B1 để nêu lý do hoặc lời khuyên ngắn.',
    unlockedByUnitId: 'path-b1-real-life-reading',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · grammar B1 tăng nhẹ',
    maturityNoteVi: 'B1 grammar đã thêm present perfect và liên kết pronunciation; chưa thay thế curriculum đầy đủ.',
    sourceModuleReference: {
      module: 'generated-grammar',
      ids: ['grammar-b1-irregular-verbs', 'grammar-b1-phrasal-verbs', 'grammar-b1-modal-verbs'],
      runtimeRoute: '/lessons/grammar-b1-irregular-verbs',
      integrationNote: 'Generated B1 grammar lessons are combined with local speech prompts for oral confidence.',
    },
  },
  {
    id: 'path-b1-shadow-review',
    titleVi: 'B1 · Shadowing tình huống học và việc',
    subtitleVi: 'Lặp lại câu về thói quen học, phỏng vấn việc làm thêm và teamwork.',
    level: 'B1',
    skillFocus: 'Shadowing',
    estimatedTime: '30–40 phút',
    lessonIds: ['reading-b1-study-plan'],
    sourceIds: ['shadow-b1-study-habit', 'shadow-b1-part-time-interview', 'shadow-b1-teamwork-discussion'],
    primaryMode: 'shadowing',
    recommendedPracticeModes: ['shadowing', 'pronunciation', 'speed', 'quiz'],
    whaleCoachLine: 'Hãy nghe nhịp nối âm, dừng đúng chỗ và lặp lại như đang nói thật.',
    confidenceGoal: 'Shadowing được 8–10 câu B1 với nhịp tự nhiên vừa phải.',
    unlockedByUnitId: 'path-b1-grammar-speaking',
    contentMaturity: 'foundation',
    maturityLabelVi: 'Foundation · shadowing catalog',
    maturityNoteVi: 'Shadowing B1 có script và video tham chiếu curated; cần thêm bài theo nghề/ngữ cảnh sau.',
    sourceModuleReference: {
      module: 'generated-shadowing',
      ids: ['shadow-b1-study-habit', 'shadow-b1-part-time-interview'],
      runtimeRoute: '/shadowing',
      integrationNote: 'Shadowing catalog uses authored scripts only; source notes stay in reports/metadata.',
    },
  },
  {
    id: 'path-b2-confident-reading',
    titleVi: 'B2 · Đọc hiểu tự tin',
    subtitleVi: 'Đọc đoạn ngắn về thói quen số, môi trường, nghề nghiệp và phản hồi.',
    level: 'B2',
    skillFocus: 'Đọc',
    estimatedTime: '65–80 phút',
    lessonIds: ['reading-b2-digital-habits'],
    sourceIds: ['cefr-b2-core', 'reading-b2-digital-habits', 'reading-b2-local-environment', 'reading-b2-career-choice'],
    primaryMode: 'quiz',
    recommendedPracticeModes: ['quiz', 'type', 'flashcard', 'speed'],
    whaleCoachLine: 'B2 cần bình tĩnh: nhận diện quan điểm, lý do và ví dụ trước khi trả lời.',
    confidenceGoal: 'Nắm ý chính và thái độ người viết trong đoạn B2 ngắn.',
    unlockedByUnitId: 'path-b1-shadow-review',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · reading B2 tăng cường',
    maturityNoteVi: 'B2 reading đã có các đoạn quan điểm và bài AI study balance; vẫn đang ở mức nền mở rộng.',
    sourceModuleReference: {
      module: 'generated-reading',
      ids: ['reading-b2-digital-habits', 'reading-b2-local-environment'],
      runtimeRoute: '/lessons/reading-b2-digital-habits',
      integrationNote: 'Generated B2 reading lessons route through the standard lesson/practice experience.',
    },
  },
  {
    id: 'path-b2-pronunciation-confidence',
    titleVi: 'B2 · Nói rõ quan điểm',
    subtitleVi: 'Luyện phát âm câu dài hơn về chiến lược học, nghề nghiệp và thói quen số.',
    level: 'B2',
    skillFocus: 'Phát âm',
    estimatedTime: '35–45 phút',
    lessonIds: ['reading-b2-digital-habits'],
    sourceIds: ['shadow-b2-learning-strategy', 'shadow-b2-digital-habits-opinion', 'shadow-b2-career-goals', 'b2-learning-strategy', 'b2-career-goals', 'b2-digital-habits'],
    primaryMode: 'pronunciation',
    recommendedPracticeModes: ['pronunciation', 'shadowing', 'speed', 'quiz'],
    whaleCoachLine: 'Nói quan điểm rõ không phải nói thật nhanh; hãy giữ nhịp và trọng âm.',
    confidenceGoal: 'Nói được 3–4 câu B2 ngắn về quan điểm cá nhân với phát âm rõ.',
    unlockedByUnitId: 'path-b2-confident-reading',
    contentMaturity: 'foundation',
    maturityLabelVi: 'Foundation · pronunciation path',
    maturityNoteVi: 'Đường phát âm B2 đã audio/API-first nhưng nội dung nói dài vẫn cần mở rộng ở phase sau.',
    sourceModuleReference: {
      module: 'generated-speech',
      ids: ['b2-learning-strategy', 'b2-career-goals', 'b2-digital-habits'],
      runtimeRoute: '/english-speed',
      integrationNote: 'Pronunciation practice remains local/browser-based and does not require paid API keys.',
    },
  },
];

export function getGeneratedUnifiedLearningPath() {
  return generatedUnifiedLearningPath;
}
