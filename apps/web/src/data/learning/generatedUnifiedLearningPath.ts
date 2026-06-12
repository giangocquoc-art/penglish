export type UnifiedCefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type UnifiedSkillFocus = 'từ vựngữ pháp' | 'Nghe' | 'Đọc' | 'Shadowing' | 'phát âm' | 'Ôn tập';

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
    skillFocus: 'từ vựng',
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
    id: 'path-a1-listening-everyday',
    titleVi: 'A1 · Nghe tình huống hằng ngày',
    subtitleVi: 'Nghe bạn mới trong lớp và gọi đồ uống bằng câu A1 ngắn.',
    level: 'A1',
    skillFocus: 'Nghe',
    estimatedTime: '25–35 phút',
    lessonIds: ['a1-listening-meeting-classmate', 'a1-listening-ordering-drink'],
    sourceIds: ['a1-listening-meeting-classmate', 'a1-listening-ordering-drink'],
    primaryMode: 'listen',
    recommendedPracticeModes: ['listen', 'quiz', 'type', 'reflex', 'flashcard'],
    whaleCoachLine: 'Nghe ý chính trước, sau đó mới nhìn lời thoại để Poo bơi đúng nhịp.',
    confidenceGoal: 'Hiểu 2 tình huống A1 ngắn: gặp bạn mới và gọi đồ uống.',
    unlockedByUnitId: 'path-a1-greetings-core',
    contentMaturity: 'mature',
    maturityLabelVi: 'Mature · listening authored',
    maturityNoteVi: 'Hai bài nghe A1 của P-English có lời thoại, câu hỏi, giải thích và nhiệm vụ ôn tập.',
    sourceModuleReference: {
      module: 'handcrafted-lessons',
      ids: ['a1-listening-meeting-classmate', 'a1-listening-ordering-drink'],
      runtimeRoute: '/lessons/a1-listening-meeting-classmate',
      integrationNote: 'Original P-English A1 listening lessons inspired by public listening pedagogy, not copied from external content.',
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
    unlockedByUnitId: 'path-a1-listening-everyday',
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
    estimatedTime: '105–125 phút',
    lessonIds: ['grammar-a1-articles-a-an-the', 'reading-a1-my-morning', 'reading-a1-at-school', 'reading-a1-my-family-dinner', 'reading-a1-breakfast-food', 'reading-a1-after-school', 'reading-a1-asking-for-help', 'reading-a1-weather-plan'],
    sourceIds: ['grammar-a1-articles-a-an-the', 'reading-a1-my-morning', 'reading-a1-at-school', 'reading-a1-my-family-dinner', 'reading-a1-breakfast-food', 'reading-a1-after-school', 'reading-a1-small-shop', 'reading-a1-time-for-bed', 'reading-a1-weekend-park', 'reading-a1-asking-for-help', 'reading-a1-weather-plan'],
    primaryMode: 'type',
    recommendedPracticeModes: ['flashcard', 'quiz', 'type', 'match', 'speed'],
    whaleCoachLine: 'Đọc ngắn mỗi ngày giúp cá voi của bạn bơi xa hơn mà không hụt hơi.',
    confidenceGoal: 'Chọn đúng a/an/the và hiểu một đoạn A1 rất ngắn.',
    unlockedByUnitId: 'path-a1-family-school',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · grammar + reading runtime',
    maturityNoteVi: 'Đã nối thêm nhiều bài đọc A1 app-authored vào lesson route, bao gồm tình huống xin giúp đỡ và kế hoạch theo thời tiết cho user mới.',
    sourceModuleReference: {
      module: 'generated-reading',
      ids: ['reading-a1-my-morning', 'reading-a1-at-school', 'reading-a1-my-family-dinner', 'reading-a1-breakfast-food', 'reading-a1-after-school', 'reading-a1-asking-for-help', 'reading-a1-weather-plan'],
      runtimeRoute: '/lessons/reading-a1-my-morning',
      integrationNote: 'Generated grammar and reading lessons are adapted to EnglishLesson for lesson/practice route compatibility.',
    },
  },
  {
    id: 'path-a1-shadow-pronounce',
    titleVi: 'A1 · Nghe nhịp và phát âm rõ',
    subtitleVi: 'Shadowing câu chào, đặt đồ ăn đơn giản và luyện phát âm bằng trình duyệt.',
    level: 'A1',
    skillFocus: 'phát âm',
    estimatedTime: '30–40 phút',
    lessonIds: ['unit-1-greetings-introduction', 'reading-a1-asking-for-help'],
    sourceIds: ['shadow-a1-greeting-friend', 'shadow-a1-order-water-coffee', 'shadow-a1-asking-for-help', 'a1-hello', 'a1-good-morning', 'a1-thank-you', 'speech-a1-can-you-help-me'],
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
      ids: ['a1-hello', 'a1-good-morning', 'a1-thank-you', 'speech-a1-can-you-help-me'],
      runtimeRoute: '/english-speed',
      integrationNote: 'Speech prompts stay in the pronunciation route; related shadowing support IDs remain tracked in sourceIds.',
    },
  },
  {
    id: 'path-a2-practical-vocabulary',
    titleVi: 'A2 · từ vựng tình huống thực tế',
    subtitleVi: 'Mở rộng từ cho chỉ đường, mua sắm, sở thích và kế hoạch gần.',
    level: 'A2',
    skillFocus: 'từ vựng',
    estimatedTime: '40–55 phút',
    lessonIds: ['reading-a2-train-trip', 'reading-a2-shopping-list', 'reading-a2-health-note', 'reading-a2-library-card', 'reading-a2-phone-reminder', 'reading-a2-at-the-clinic'],
    sourceIds: ['cefr-a2-core', 'reading-a2-train-trip', 'reading-a2-shopping-list', 'reading-a2-health-note', 'reading-a2-library-card', 'reading-a2-sick-note', 'reading-a2-phone-reminder', 'reading-a2-weekend-market', 'reading-a2-at-the-clinic'],
    primaryMode: 'flashcard',
    recommendedPracticeModes: ['flashcard', 'quiz', 'match', 'type', 'speed'],
    whaleCoachLine: 'A2 là lúc biến từ rời thành câu dùng được ngoài đời.',
    confidenceGoal: 'Hiểu và dùng được từ vựng chính trong tin nhắn hoặc kế hoạch ngắn.',
    unlockedByUnitId: 'path-a1-shadow-pronounce',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · CEFR vocab repaired',
    maturityNotừ vựng A2 đã qua repair chất lượng và được nối thêm các bài đọc tình huống như đi tàu, mua sắm, sức khỏe, từ vựng khám.',
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
    skillFocus: 'ngữ pháp',
    estimatedTime: '55–70 phút',
    lessonIds: ['grammar-a2-quantifiers-many-much', 'grammar-a2-third-person-singular', 'grammar-a2-prepositions-in-on-at'],
    sourceIds: ['grammar-a2-quantifiers-many-much', 'grammar-a2-each-every', 'grammar-a2-some-any', 'grammar-a2-third-person-singular', 'grammar-a2-prepositions-in-on-at'],
    primaryMode: 'type',
    recommendedPracticeModes: ['quiz', 'type', 'flashcard', 'speed'],
    whaleCoachLine: 'Mỗi lỗi ngữ pháp là một tín hiệu chỉ đường, không phải điểm dừng.',
    confidenceGoal: 'Điền đúngữ pháp A2 trong câu quen thuộc.',
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
    estimatedTime: '60–80 phút',
    lessonIds: ['reading-a2-asking-directions', 'reading-a2-weekend-plan', 'reading-a2-neighborhood-map', 'reading-a2-hobby-club', 'reading-a2-changing-an-appointment'],
    sourceIds: ['reading-a2-asking-directions', 'reading-a2-weekend-plan', 'reading-a2-neighborhood-map', 'reading-a2-hobby-club', 'reading-a2-changing-an-appointment', 'shadow-a2-asking-directions', 'shadow-a2-shopping-conversation', 'shadow-a2-weekend-plan', 'shadow-a2-changing-an-appointment', 'speech-a2-i-need-to-change-the-time'],
    primaryMode: 'shadowing',
    recommendedPracticeModes: ['quiz', 'type', 'shadowing', 'pronunciation', 'speed'],
    whaleCoachLine: 'Đọc để hiểu ý, shadowing để miệng nhớ đường đi của câu.',
    confidenceGoal: 'Hiểu tin nhắn A2 và lặp lại một hội thoại ngắn rõ nhịp.',
    unlockedByUnitId: 'path-a2-grammar-patterns',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · đọc + shadowing',
    maturityNoteVi: 'Đã nối các bài đọc hỏi đường/kế hoạch/khu phố/đổi lịch hẹn với catalog shadowing để lộ trình có cả hiểu ý và nói theo nhịp.',
    sourceModuleReference: {
      module: 'generated-shadowing',
      ids: ['shadow-a2-asking-directions', 'shadow-a2-shopping-conversation', 'shadow-a2-weekend-plan', 'shadow-a2-changing-an-appointment'],
      runtimeRoute: '/shadowing',
      integrationNote: 'Shadowing units point to app-authored scripts and route through the existing shadowing page; related speech support IDs remain tracked in sourceIds.',
    },
  },
  {
    id: 'path-b1-real-life-reading',
    titleVi: 'B1 · Đọc đoạn văn đời sống',
    subtitleVi: 'Luyện kế hoạch học, việc làm thêm, học online, ý kiến đơn giản và xử lý hiểu nhầm.',
    level: 'B1',
    skillFocus: 'Đọc',
    estimatedTime: '90–105 phút',
    lessonIds: ['reading-b1-study-plan', 'reading-b1-part-time-cafe', 'reading-b1-online-learning', 'reading-b1-team-project', 'reading-b1-simple-opinion', 'reading-b1-email-change-plan', 'reading-b1-resolving-a-misunderstanding'],
    sourceIds: ['cefr-b1-core', 'reading-b1-study-plan', 'reading-b1-part-time-cafe', 'reading-b1-online-learning', 'reading-b1-team-project', 'reading-b1-simple-opinion', 'reading-b1-neighborhood-help', 'reading-b1-email-change-plan', 'reading-b1-pronunciation-diary', 'reading-b1-resolving-a-misunderstanding'],
    primaryMode: 'quiz',
    recommendedPracticeModes: ['flashcard', 'quiz', 'type', 'match', 'speed'],
    whaleCoachLine: 'Ở B1, hãy tìm ý chính trước; chi tiết sẽ rõ hơn ở lượt đọc thứ hai.',
    confidenceGoal: 'Tóm tắt được ý chính của một đoạn B1 bằng tiếng Việt hoặc câu English ngắn.',
    unlockedByUnitId: 'path-a2-reading-shadowing',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · reading B1 tăng cường',
    maturityNoteVi: 'Đã nối nhiều đoạn B1 đời sống vào lesson route: kế hoạch học, việc làm thêm, học online, teamwork, ý kiến, đổi kế hoạch và xử lý hiểu nhầm.',
    sourceModuleReference: {
      module: 'generated-reading',
      ids: ['reading-b1-study-plan', 'reading-b1-part-time-cafe', 'reading-b1-online-learning', 'reading-b1-team-project', 'reading-b1-simple-opinion', 'reading-b1-email-change-plan', 'reading-b1-resolving-a-misunderstanding'],
      runtimeRoute: '/lessons/reading-b1-study-plan',
      integrationNote: 'Generated reading lessons provide app-native comprehension and writing practice.',
    },
  },
  {
    id: 'path-b1-grammar-speaking',
    titleVi: 'B1 · ngữ pháp cho ý kiến rõ hơn',
    subtitleVi: 'Động từ bất quy tắc, phrasal verbs, modal verbs, present perfect và phát âm câu dài hơn.',
    level: 'B1',
    skillFocus: 'ngữ pháp',
    estimatedTime: '70–85 phút',
    lessonIds: ['grammar-b1-irregular-verbs', 'grammar-b1-phrasal-verbs', 'grammar-b1-modal-verbs', 'grammar-b1-present-perfect-experience'],
    sourceIds: ['grammar-b1-irregular-verbs', 'grammar-b1-phrasal-verbs', 'grammar-b1-modal-verbs', 'grammar-b1-present-perfect-experience', 'b1-study-habit', 'b1-teamwork', 'b1-let-me-summarize-the-main-point-first-exp-045', 'b1-i-would-like-to-clarify-the-deadline-before-we-sta-exp-046'],
    primaryMode: 'type',
    recommendedPracticeModes: ['quiz', 'type', 'pronunciation', 'shadowing', 'speed'],
    whaleCoachLine: 'Câu B1 không cần dài ngay; chỉ cần đúng ý, đúng nhịp và rõ lý do.',
    confidenceGoal: 'Dùng được mẫu B1 để nêu lý do hoặc lời khuyên ngắn.',
    unlockedByUnitId: 'path-b1-real-life-reading',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · grammar B1 + speech',
    maturityNoteVi: 'B1 grammar đã nối present perfect vào route thật và thêm prompt nói rõ deadline/tóm tắt để người học luyện dùng mẫu trong giao tiếp.',
    sourceModuleReference: {
      module: 'generated-grammar',
      ids: ['grammar-b1-irregular-verbs', 'grammar-b1-phrasal-verbs', 'grammar-b1-modal-verbs', 'grammar-b1-present-perfect-experience'],
      runtimeRoute: '/lessons/grammar-b1-irregular-verbs',
      integrationNote: 'Generated B1 grammar lessons are combined with local speech prompts for oral confidence.',
    },
  },
  {
    id: 'path-b1-shadow-review',
    titleVi: 'B1 · Shadowing phản hồi và đời sống',
    subtitleVi: 'Đọc lại nhật ký phát âm rồi shadowing thói quen học, teamwork, xin góp ý, so sánh lựa chọn và xử lý hiểu nhầm.',
    level: 'B1',
    skillFocus: 'Shadowing',
    estimatedTime: '60–75 phút',
    lessonIds: ['reading-b1-study-plan', 'reading-b1-pronunciation-diary', 'reading-b1-study-group-plan', 'reading-b1-resolving-a-misunderstanding'],
    sourceIds: ['shadow-b1-study-habit', 'shadow-b1-part-time-interview', 'shadow-b1-teamwork-discussion', 'shadow-b1-asking-for-feedback', 'shadow-b1-ocean-learning-reflection', 'shadow-b1-comparing-two-options', 'shadow-b1-health-routine', 'shadow-b1-resolving-a-misunderstanding', 'reading-b1-pronunciation-diary', 'reading-b1-study-group-plan', 'reading-b1-resolving-a-misunderstanding'],
    primaryMode: 'shadowing',
    recommendedPracticeModes: ['shadowing', 'pronunciation', 'speed', 'quiz', 'type'],
    whaleCoachLine: 'Hãy nghe nhịp nối âm, dừng đúng chỗ và lặp lại như đang nói thật.',
    confidenceGoal: 'Shadowing được 18–22 câu B1 về học tập, phản hồi, lựa chọn và xử lý hiểu nhầm với nhịp tự nhiên vừa phải.',
    unlockedByUnitId: 'path-b1-grammar-speaking',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · shadowing + reading bridge',
    maturityNoteVi: 'B1 shadowing đã nối thêm script app-authored về xin feedback, suy ngẫm học, so sánh lựa chọn, xử lý hiểu nhầm và nhật ký phát âm để đúng mục tiêu luyện phản hồi/đời sống.',
    sourceModuleReference: {
      module: 'generated-shadowing',
      ids: ['shadow-b1-study-habit', 'shadow-b1-part-time-interview', 'shadow-b1-teamwork-discussion', 'shadow-b1-asking-for-feedback', 'shadow-b1-ocean-learning-reflection', 'shadow-b1-comparing-two-options', 'shadow-b1-health-routine', 'shadow-b1-resolving-a-misunderstanding'],
      runtimeRoute: '/shadowing',
      integrationNote: 'Shadowing catalog uses authored scripts only; related reading IDs bridge comprehension before oral repetition.',
    },
  },
  {
    id: 'path-b2-confident-reading',
    titleVi: 'B2 · Đọc hiểu tự tin',
    subtitleVi: 'Đọc đoạn ngắn về thói quen số, môi trường, nghề nghiệp, phản hồi và đánh giá công cụ học.',
    level: 'B2',
    skillFocus: 'Đọc',
    estimatedTime: '75–90 phút',
    lessonIds: ['reading-b2-digital-habits', 'reading-b2-local-environment', 'reading-b2-career-choice', 'reading-b2-communication-feedback', 'reading-b2-ai-study-balance', 'reading-b2-language-exchange', 'reading-b2-evaluating-a-learning-tool'],
    sourceIds: ['cefr-b2-core', 'reading-b2-digital-habits', 'reading-b2-local-environment', 'reading-b2-career-choice', 'reading-b2-communication-feedback', 'reading-b2-ai-study-balance', 'reading-b2-community-survey', 'reading-b2-healthy-study-breaks', 'reading-b2-feedback-rubric', 'reading-b2-language-exchange', 'reading-b2-evaluating-a-learning-tool'],
    primaryMode: 'quiz',
    recommendedPracticeModes: ['quiz', 'type', 'flashcard', 'speed'],
    whaleCoachLine: 'B2 cần bình tĩnh: nhận diện quan điểm, lý do và ví dụ trước khi trả lời.',
    confidenceGoal: 'Nắm ý chính và thái độ người viết trong đoạn B2 ngắn.',
    unlockedByUnitId: 'path-b1-shadow-review',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · reading B2 tăng cường',
    maturityNoteVi: 'B2 reading đã nối nhiều đoạn quan điểm/đời sống vào route học: thói quen số, môi trường, nghề nghiệp, feedback, AI, trao đổi ngôn ngữ và đánh giá công cụ học.',
    sourceModuleReference: {
      module: 'generated-reading',
      ids: ['reading-b2-digital-habits', 'reading-b2-local-environment', 'reading-b2-career-choice', 'reading-b2-communication-feedback', 'reading-b2-ai-study-balance', 'reading-b2-language-exchange', 'reading-b2-evaluating-a-learning-tool'],
      runtimeRoute: '/lessons/reading-b2-digital-habits',
      integrationNote: 'Generated B2 reading lessons route through the standard lesson/practice experience.',
    },
  },
  {
    id: 'path-b2-pronunciation-confidence',
    titleVi: 'B2 · Nói rõ quan điểm',
    subtitleVi: 'Luyện phát âm câu dài hơn về chiến lược học, phản hồi, nghề nghiệp, thói quen số và lời khuyên có sắc thái.',
    level: 'B2',
    skillFocus: 'phát âm',
    estimatedTime: '60–75 phút',
    lessonIds: ['reading-b2-digital-habits', 'reading-b2-feedback-rubric', 'grammar-b2-conditionals-realistic-advice'],
    sourceIds: ['shadow-b2-learning-strategy', 'shadow-b2-digital-habits-opinion', 'shadow-b2-career-goals', 'shadow-b2-balanced-technology-view', 'shadow-b2-learning-from-feedback', 'shadow-b2-problem-solving-meeting', 'shadow-b2-evaluating-a-learning-tool', 'b2-learning-strategy', 'b2-career-goals', 'b2-digital-habits', 'grammar-b2-conditionals-realistic-advice', 'reading-b2-evaluating-a-learning-tool', 'b2-if-i-were-responsible-for-the-plan-i-would-define-exp-064', 'b2-it-might-be-better-to-acknowledge-the-limitatio-exp-065', 'b2-a-more-sustainable-solution-would-balance-cost-qua-exp-066', 'b2-although-the-proposal-is-ambitious-its-benefits-r-exp-067'],
    primaryMode: 'pronunciation',
    recommendedPracticeModes: ['pronunciation', 'shadowing', 'speed', 'quiz', 'type'],
    whaleCoachLine: 'Nói quan điểm rõ không phải nói thật nhanh; hãy giữ nhịp và trọng âm.',
    confidenceGoal: 'Nói được 6–8 câu B2 về quan điểm, phản hồi và lời khuyên với trọng âm rõ và cụm giảm nhẹ tự nhiên.',
    unlockedByUnitId: 'path-b2-confident-reading',
    contentMaturity: 'expanded',
    maturityLabelVi: 'Expanded · pronunciation + shadowed opinion',
    maturityNoteVi: 'Đường phát âm B2 đã nối grammar điều kiện B2, prompt app-authored và script shadowing về feedback/problem-solving/learning-tool evaluation để người học luyện nói quan điểm có sắc thái.',
    sourceModuleReference: {
      module: 'generated-speech',
      ids: ['b2-learning-strategy', 'b2-career-goals', 'b2-digital-habits'],
      runtimeRoute: '/english-speed',
      integrationNote: 'Pronunciation practice remains local/browser-based; related grammar and shadowing support IDs remain tracked in sourceIds.',
    },
  },
];

export function getGeneratedUnifiedLearningPath() {
  return generatedUnifiedLearningPath;
}
