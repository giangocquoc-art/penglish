import { generatedGrammarLessons } from './grammarLessonAdapter';
import { generatedReadingLessons } from './readingAdapter';

export type LessonLevel = 'Beginner / A1' | 'Elementary / A2' | 'Intermediate / B1' | 'Upper-intermediate / B2' | 'Advanced / C1';
export type SkillTag = 'Từ vựng' | 'Phản xạ' | 'Nghe' | 'Nói' | 'Ôn tập' | 'Ngữ pháp' | 'Đọc' | 'Viết';
export type LessonDifficulty = 'easy' | 'medium' | 'hard';
export type QuizQuestionType = 'multiple-choice' | 'fill-blank' | 'sentence-order' | 'match-meaning';

export type VocabularyItem = {
  id: string;
  term: string;
  pronunciation?: string;
  pronunciationHintVi?: string;
  meaningVi: string;
  partOfSpeechOrType: string;
  example: string;
  exampleMeaningVi: string;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  visualCategory?: string;
  animatedSceneHint?: string;
  usefulInSituation?: string;
  confusionNoteVi?: string;
  difficulty: Extract<LessonDifficulty, 'easy' | 'medium'>;
  tags: string[];
};

export type SentencePattern = {
  id: string;
  pattern: string;
  vietnameseExplanation: string;
  examples: Array<{
    speaker?: string;
    text: string;
    meaningVi: string;
  }>;
};

export type MiniDialogue = {
  id: string;
  title: string;
  lines: Array<{
    speaker: 'A' | 'B';
    text: string;
  }>;
  vietnameseTranslation: string[];
  focusPhrases: string[];
  suggestedShadowingInstruction: string;
};

export type GrammarNote = {
  id: string;
  title: string;
  explanationVi: string;
  examples: string[];
};

export type PronunciationNote = {
  id: string;
  noteVi: string;
  examples?: string[];
};

export type ListeningPracticeItem = {
  id: string;
  text: string;
  question: string;
  options: string[];
  answer: string;
  explanationVi?: string;
  speechSynthesis?: {
    lang: 'en-US' | 'en-GB';
    rate: number;
    repeatRecommended: number;
  };
};

export type SpeakingReflexPrompt = {
  id: string;
  promptVi: string;
  expectedEnglish: string;
  acceptableAnswers: string[];
  hint: string;
  difficulty: LessonDifficulty;
};

export type FlashcardItem = {
  id: string;
  front: string;
  back: string;
  example: string;
  exampleMeaningVi: string;
  tags: string[];
};

export type QuizQuestion = {
  id: string;
  type: QuizQuestionType;
  question?: string;
  prompt?: string;
  vietnamese?: string;
  words?: string[];
  pairs?: Array<{
    left: string;
    right: string;
  }>;
  options?: string[];
  answer: string | string[];
  explanationVi?: string;
};

export type SentenceOrderingTask = {
  id: string;
  vietnamese: string;
  words: string[];
  answer: string;
};

export type FillBlankTask = {
  id: string;
  prompt: string;
  answer: string;
  hint: string;
};

export type ReviewRules = {
  newWordReviewAfterMinutes: number;
  ifWrong: string;
  ifCorrectTwice: string;
  ifCorrectThreeTimesAcrossSessions: string;
  priorityRule: string;
};

export type CompletionCriteria = {
  flashcardsReviewed: number;
  minimumQuizCorrect: number;
  totalQuizQuestions: number;
  minimumReflexPromptsCompleted: number;
  totalReflexPrompts: number;
  minimumListeningOrDialogueRepeats: number;
};

export type MatchPair = {
  id: string;
  left: string;
  right: string;
};

export type EnglishSpeedPrompt = {
  id: string;
  promptVi: string;
  expectedEnglish: string;
  hint: string;
};

export type ShadowingScript = {
  id: string;
  title: string;
  lines: Array<{
    id: string;
    text: string;
    meaningVi: string;
  }>;
};

export type CommonMistake = {
  id: string;
  mistake: string;
  correction: string;
  explanationVi: string;
};

export type RealLifeSituation = {
  id: string;
  title: string;
  scenarioVi: string;
  usefulPhrases: string[];
};

export type GameMission = {
  id: string;
  title: string;
  instructionVi: string;
  successCriteria: string;
};

export type FinalMiniChallenge = {
  id: string;
  title: string;
  instructionVi: string;
  targetOutput: string[];
};

export type EnglishLesson = {
  id: string;
  unitId: string;
  unitTitle: string;
  titleVi: string;
  titleEn: string;
  subtitle: string;
  level: LessonLevel;
  estimatedTime: string;
  skillTags: SkillTag[];
  learningObjectives: string[];
  vocabulary: VocabularyItem[];
  sentencePatterns: SentencePattern[];
  miniDialogues: MiniDialogue[];
  grammarNotes: GrammarNote[];
  pronunciationNotes: PronunciationNote[];
  listeningPractice: ListeningPracticeItem[];
  speakingReflexPrompts: SpeakingReflexPrompt[];
  flashcards: FlashcardItem[];
  quizQuestions: QuizQuestion[];
  sentenceOrderingTasks: SentenceOrderingTask[];
  fillBlankTasks: FillBlankTask[];
  matchPairs?: MatchPair[];
  englishSpeedPrompts?: EnglishSpeedPrompt[];
  shadowingScript?: ShadowingScript;
  commonMistakes?: CommonMistake[];
  realLifeSituations?: RealLifeSituation[];
  gameMissions?: GameMission[];
  whaleCoachLines?: string[];
  finalMiniChallenge?: FinalMiniChallenge;
  reviewRules: ReviewRules;
  completionCriteria: CompletionCriteria;
};

const unit1Vocabulary: VocabularyItem[] = [
  {
    id: 'hello',
    term: 'hello',
    pronunciation: '/həˈloʊ/',
    meaningVi: 'xin chào',
    partOfSpeechOrType: 'greeting',
    example: 'Hello, I’m Nam.',
    exampleMeaningVi: 'Xin chào, mình là Nam.',
    difficulty: 'easy',
    tags: ['greeting', 'chunk'],
  },
  {
    id: 'hi',
    term: 'hi',
    pronunciation: '/haɪ/',
    meaningVi: 'chào',
    partOfSpeechOrType: 'greeting',
    example: 'Hi, I’m Linh.',
    exampleMeaningVi: 'Chào, mình là Linh.',
    difficulty: 'easy',
    tags: ['greeting', 'informal'],
  },
  {
    id: 'good-morning',
    term: 'good morning',
    pronunciation: '/ˌɡʊd ˈmɔːrnɪŋ/',
    meaningVi: 'chào buổi sáng',
    partOfSpeechOrType: 'time greeting',
    example: 'Good morning, teacher.',
    exampleMeaningVi: 'Chào buổi sáng, cô/thầy.',
    difficulty: 'easy',
    tags: ['greeting', 'time'],
  },
  {
    id: 'good-afternoon',
    term: 'good afternoon',
    pronunciation: '/ˌɡʊd ˌæftərˈnuːn/',
    meaningVi: 'chào buổi chiều',
    partOfSpeechOrType: 'time greeting',
    example: 'Good afternoon, everyone.',
    exampleMeaningVi: 'Chào buổi chiều mọi người.',
    difficulty: 'easy',
    tags: ['greeting', 'time'],
  },
  {
    id: 'good-evening',
    term: 'good evening',
    pronunciation: '/ˌɡʊd ˈiːvnɪŋ/',
    meaningVi: 'chào buổi tối',
    partOfSpeechOrType: 'time greeting',
    example: 'Good evening, Mom.',
    exampleMeaningVi: 'Chào buổi tối mẹ.',
    difficulty: 'easy',
    tags: ['greeting', 'time'],
  },
  {
    id: 'my-name-is',
    term: 'my name is...',
    pronunciation: '/maɪ neɪm ɪz/',
    meaningVi: 'tên tôi là...',
    partOfSpeechOrType: 'sentence chunk',
    example: 'My name is An.',
    exampleMeaningVi: 'Tên tôi là An.',
    difficulty: 'easy',
    tags: ['introduction', 'chunk'],
  },
  {
    id: 'im',
    term: 'I’m...',
    pronunciation: '/aɪm/',
    meaningVi: 'tôi là...',
    partOfSpeechOrType: 'sentence chunk',
    example: 'I’m Minh.',
    exampleMeaningVi: 'Tôi là Minh.',
    difficulty: 'easy',
    tags: ['introduction', 'chunk'],
  },
  {
    id: 'whats-your-name',
    term: 'what’s your name?',
    pronunciation: '/wʌts jʊr neɪm/',
    meaningVi: 'bạn tên gì?',
    partOfSpeechOrType: 'question chunk',
    example: 'What’s your name?',
    exampleMeaningVi: 'Bạn tên gì?',
    difficulty: 'easy',
    tags: ['question', 'name', 'chunk'],
  },
  {
    id: 'nice-to-meet-you',
    term: 'nice to meet you',
    pronunciation: '/naɪs tə miːt juː/',
    meaningVi: 'rất vui được gặp bạn',
    partOfSpeechOrType: 'social chunk',
    example: 'Nice to meet you, Mai.',
    exampleMeaningVi: 'Rất vui được gặp bạn, Mai.',
    difficulty: 'easy',
    tags: ['greeting', 'social', 'chunk'],
  },
  {
    id: 'nice-to-meet-you-too',
    term: 'nice to meet you too',
    pronunciation: '/naɪs tə miːt juː tuː/',
    meaningVi: 'mình cũng rất vui được gặp bạn',
    partOfSpeechOrType: 'social chunk',
    example: 'Nice to meet you too.',
    exampleMeaningVi: 'Mình cũng rất vui được gặp bạn.',
    difficulty: 'easy',
    tags: ['greeting', 'social', 'chunk'],
  },
  {
    id: 'where-are-you-from',
    term: 'where are you from?',
    pronunciation: '/wer ər juː frʌm/',
    meaningVi: 'bạn đến từ đâu?',
    partOfSpeechOrType: 'question chunk',
    example: 'Where are you from?',
    exampleMeaningVi: 'Bạn đến từ đâu?',
    difficulty: 'medium',
    tags: ['question', 'place', 'chunk'],
  },
  {
    id: 'im-from',
    term: 'I’m from...',
    pronunciation: '/aɪm frʌm/',
    meaningVi: 'tôi đến từ...',
    partOfSpeechOrType: 'sentence chunk',
    example: 'I’m from Vietnam.',
    exampleMeaningVi: 'Tôi đến từ Việt Nam.',
    difficulty: 'easy',
    tags: ['place', 'introduction', 'chunk'],
  },
  {
    id: 'vietnam',
    term: 'Vietnam',
    pronunciation: '/ˌviːetˈnɑːm/',
    meaningVi: 'Việt Nam',
    partOfSpeechOrType: 'proper noun',
    example: 'I’m from Vietnam.',
    exampleMeaningVi: 'Tôi đến từ Việt Nam.',
    difficulty: 'easy',
    tags: ['country', 'place'],
  },
  {
    id: 'student',
    term: 'student',
    pronunciation: '/ˈstuːdənt/',
    meaningVi: 'học sinh/sinh viên',
    partOfSpeechOrType: 'noun',
    example: 'I’m a student.',
    exampleMeaningVi: 'Tôi là học sinh/sinh viên.',
    difficulty: 'easy',
    tags: ['identity', 'school'],
  },
  {
    id: 'teacher',
    term: 'teacher',
    pronunciation: '/ˈtiːtʃər/',
    meaningVi: 'giáo viên',
    partOfSpeechOrType: 'noun',
    example: 'She is a teacher.',
    exampleMeaningVi: 'Cô ấy là giáo viên.',
    difficulty: 'easy',
    tags: ['identity', 'school'],
  },
  {
    id: 'friend',
    term: 'friend',
    pronunciation: '/frend/',
    meaningVi: 'bạn bè/người bạn',
    partOfSpeechOrType: 'noun',
    example: 'This is my friend.',
    exampleMeaningVi: 'Đây là bạn của tôi.',
    difficulty: 'easy',
    tags: ['people', 'social'],
  },
  {
    id: 'thank-you',
    term: 'thank you',
    pronunciation: '/θæŋk juː/',
    meaningVi: 'cảm ơn',
    partOfSpeechOrType: 'social chunk',
    example: 'Thank you, teacher.',
    exampleMeaningVi: 'Cảm ơn thầy/cô.',
    difficulty: 'easy',
    tags: ['social', 'polite'],
  },
  {
    id: 'goodbye',
    term: 'goodbye',
    pronunciation: '/ˌɡʊdˈbaɪ/',
    meaningVi: 'tạm biệt',
    partOfSpeechOrType: 'farewell',
    example: 'Goodbye, see you tomorrow.',
    exampleMeaningVi: 'Tạm biệt, hẹn gặp bạn ngày mai.',
    difficulty: 'easy',
    tags: ['farewell', 'social'],
  },
];

const unit2Vocabulary: VocabularyItem[] = [
  { id: 'u2-family', term: 'family', pronunciation: '/ˈfæməli/', meaningVi: 'gia đình', partOfSpeechOrType: 'noun', example: 'This is my family.', exampleMeaningVi: 'Đây là gia đình của tôi.', difficulty: 'easy', tags: ['family', 'core'] },
  { id: 'u2-father-dad', term: 'father / dad', pronunciation: '/ˈfɑːðər/ /dæd/', meaningVi: 'bố / ba', partOfSpeechOrType: 'noun', example: 'My dad is kind.', exampleMeaningVi: 'Bố tôi tốt bụng.', difficulty: 'easy', tags: ['family', 'person'] },
  { id: 'u2-mother-mom', term: 'mother / mom', pronunciation: '/ˈmʌðər/ /mɑːm/', meaningVi: 'mẹ', partOfSpeechOrType: 'noun', example: 'My mom is friendly.', exampleMeaningVi: 'Mẹ tôi thân thiện.', difficulty: 'easy', tags: ['family', 'person'] },
  { id: 'u2-parents', term: 'parents', pronunciation: '/ˈperənts/', meaningVi: 'bố mẹ', partOfSpeechOrType: 'plural noun', example: 'My parents are here.', exampleMeaningVi: 'Bố mẹ tôi ở đây.', difficulty: 'easy', tags: ['family', 'plural'] },
  { id: 'u2-brother', term: 'brother', pronunciation: '/ˈbrʌðər/', meaningVi: 'anh/em trai', partOfSpeechOrType: 'noun', example: 'This is my brother.', exampleMeaningVi: 'Đây là anh/em trai của tôi.', difficulty: 'easy', tags: ['family', 'person'] },
  { id: 'u2-sister', term: 'sister', pronunciation: '/ˈsɪstər/', meaningVi: 'chị/em gái', partOfSpeechOrType: 'noun', example: 'This is my sister.', exampleMeaningVi: 'Đây là chị/em gái của tôi.', difficulty: 'easy', tags: ['family', 'person'] },
  { id: 'u2-baby-brother', term: 'baby brother', pronunciation: '/ˈbeɪbi ˈbrʌðər/', meaningVi: 'em trai nhỏ', partOfSpeechOrType: 'noun chunk', example: 'He is my baby brother.', exampleMeaningVi: 'Em ấy là em trai nhỏ của tôi.', difficulty: 'easy', tags: ['family', 'chunk'] },
  { id: 'u2-baby-sister', term: 'baby sister', pronunciation: '/ˈbeɪbi ˈsɪstər/', meaningVi: 'em gái nhỏ', partOfSpeechOrType: 'noun chunk', example: 'She is my baby sister.', exampleMeaningVi: 'Em ấy là em gái nhỏ của tôi.', difficulty: 'easy', tags: ['family', 'chunk'] },
  { id: 'u2-grandfather-grandpa', term: 'grandfather / grandpa', pronunciation: '/ˈɡrænfɑːðər/ /ˈɡrænpɑː/', meaningVi: 'ông', partOfSpeechOrType: 'noun', example: 'My grandpa is old.', exampleMeaningVi: 'Ông tôi lớn tuổi.', difficulty: 'easy', tags: ['family', 'person'] },
  { id: 'u2-grandmother-grandma', term: 'grandmother / grandma', pronunciation: '/ˈɡrænmʌðər/ /ˈɡrænmɑː/', meaningVi: 'bà', partOfSpeechOrType: 'noun', example: 'My grandma is kind.', exampleMeaningVi: 'Bà tôi tốt bụng.', difficulty: 'easy', tags: ['family', 'person'] },
  { id: 'u2-uncle', term: 'uncle', pronunciation: '/ˈʌŋkəl/', meaningVi: 'chú/cậu/bác trai', partOfSpeechOrType: 'noun', example: 'This is my uncle.', exampleMeaningVi: 'Đây là chú/cậu/bác trai của tôi.', difficulty: 'medium', tags: ['family', 'person'] },
  { id: 'u2-aunt', term: 'aunt', pronunciation: '/ænt/', meaningVi: 'cô/dì/bác gái', partOfSpeechOrType: 'noun', example: 'This is my aunt.', exampleMeaningVi: 'Đây là cô/dì/bác gái của tôi.', difficulty: 'medium', tags: ['family', 'person'] },
  { id: 'u2-cousin', term: 'cousin', pronunciation: '/ˈkʌzən/', meaningVi: 'anh/chị/em họ', partOfSpeechOrType: 'noun', example: 'My cousin is funny.', exampleMeaningVi: 'Anh/chị/em họ của tôi vui tính.', difficulty: 'medium', tags: ['family', 'person'] },
  { id: 'u2-friend', term: 'friend', pronunciation: '/frend/', meaningVi: 'bạn', partOfSpeechOrType: 'noun', example: 'This is my friend.', exampleMeaningVi: 'Đây là bạn của tôi.', difficulty: 'easy', tags: ['friends', 'person'] },
  { id: 'u2-best-friend', term: 'best friend', pronunciation: '/best frend/', meaningVi: 'bạn thân', partOfSpeechOrType: 'noun chunk', example: 'Mai is my best friend.', exampleMeaningVi: 'Mai là bạn thân của tôi.', difficulty: 'easy', tags: ['friends', 'chunk'] },
  { id: 'u2-classmate', term: 'classmate', pronunciation: '/ˈklæsmeɪt/', meaningVi: 'bạn cùng lớp', partOfSpeechOrType: 'noun', example: 'Nam is my classmate.', exampleMeaningVi: 'Nam là bạn cùng lớp của tôi.', difficulty: 'medium', tags: ['friends', 'school'] },
  { id: 'u2-this-is-my', term: 'this is my ...', pronunciation: '/ðɪs ɪz maɪ/', meaningVi: 'đây là ... của tôi', partOfSpeechOrType: 'sentence chunk', example: 'This is my mother.', exampleMeaningVi: 'Đây là mẹ của tôi.', difficulty: 'easy', tags: ['pattern', 'chunk'] },
  { id: 'u2-his-name-is', term: 'his name is ...', pronunciation: '/hɪz neɪm ɪz/', meaningVi: 'tên của anh ấy là ...', partOfSpeechOrType: 'sentence chunk', example: 'His name is Tom.', exampleMeaningVi: 'Tên của anh ấy là Tom.', difficulty: 'medium', tags: ['possessive', 'chunk'] },
  { id: 'u2-her-name-is', term: 'her name is ...', pronunciation: '/hɜːr neɪm ɪz/', meaningVi: 'tên của cô ấy là ...', partOfSpeechOrType: 'sentence chunk', example: 'Her name is Anna.', exampleMeaningVi: 'Tên của cô ấy là Anna.', difficulty: 'medium', tags: ['possessive', 'chunk'] },
  { id: 'u2-years-old', term: 'years old', pronunciation: '/jɪrz oʊld/', meaningVi: 'tuổi', partOfSpeechOrType: 'age chunk', example: 'She is eight years old.', exampleMeaningVi: 'Cô bé ấy tám tuổi.', difficulty: 'easy', tags: ['age', 'chunk'] },
  { id: 'u2-kind', term: 'kind', pronunciation: '/kaɪnd/', meaningVi: 'tốt bụng', partOfSpeechOrType: 'adjective', example: 'My mother is kind.', exampleMeaningVi: 'Mẹ tôi tốt bụng.', difficulty: 'easy', tags: ['adjective', 'description'] },
  { id: 'u2-funny', term: 'funny', pronunciation: '/ˈfʌni/', meaningVi: 'vui tính', partOfSpeechOrType: 'adjective', example: 'My friend is funny.', exampleMeaningVi: 'Bạn tôi vui tính.', difficulty: 'easy', tags: ['adjective', 'description'] },
  { id: 'u2-friendly', term: 'friendly', pronunciation: '/ˈfrendli/', meaningVi: 'thân thiện', partOfSpeechOrType: 'adjective', example: 'My classmate is friendly.', exampleMeaningVi: 'Bạn cùng lớp của tôi thân thiện.', difficulty: 'easy', tags: ['adjective', 'description'] },
  { id: 'u2-tall', term: 'tall', pronunciation: '/tɔːl/', meaningVi: 'cao', partOfSpeechOrType: 'adjective', example: 'My brother is tall.', exampleMeaningVi: 'Anh/em trai tôi cao.', difficulty: 'easy', tags: ['adjective', 'description'] },
];

const unit3Vocabulary: VocabularyItem[] = [
  { id: 'u3-classroom', term: 'classroom', pronunciation: '/ˈklæsruːm/', meaningVi: 'lớp học/phòng học', partOfSpeechOrType: 'noun', example: 'This is my classroom.', exampleMeaningVi: 'Đây là lớp học của tôi.', difficulty: 'easy', tags: ['school', 'place'] },
  { id: 'u3-teacher', term: 'teacher', pronunciation: '/ˈtiːtʃər/', meaningVi: 'giáo viên', partOfSpeechOrType: 'noun', example: 'My teacher is kind.', exampleMeaningVi: 'Giáo viên của tôi tốt bụng.', difficulty: 'easy', tags: ['school', 'person'] },
  { id: 'u3-student', term: 'student', pronunciation: '/ˈstuːdənt/', meaningVi: 'học sinh/sinh viên', partOfSpeechOrType: 'noun', example: 'I am a student.', exampleMeaningVi: 'Tôi là học sinh/sinh viên.', difficulty: 'easy', tags: ['school', 'person'] },
  { id: 'u3-notebook', term: 'notebook', pronunciation: '/ˈnoʊtbʊk/', meaningVi: 'vở', partOfSpeechOrType: 'noun', example: 'Where is your notebook?', exampleMeaningVi: 'Vở của bạn ở đâu?', difficulty: 'easy', tags: ['classroom', 'item'] },
  { id: 'u3-pencil', term: 'pencil', pronunciation: '/ˈpensəl/', meaningVi: 'bút chì', partOfSpeechOrType: 'noun', example: 'Can I borrow your pencil?', exampleMeaningVi: 'Mình mượn bút chì của bạn được không?', difficulty: 'easy', tags: ['classroom', 'item'] },
  { id: 'u3-homework', term: 'homework', pronunciation: '/ˈhoʊmwɜːrk/', meaningVi: 'bài tập về nhà', partOfSpeechOrType: 'noun', example: 'I need to do my homework.', exampleMeaningVi: 'Tôi cần làm bài tập về nhà.', difficulty: 'easy', tags: ['study', 'task'] },
  { id: 'u3-subject', term: 'subject', pronunciation: '/ˈsʌbdʒekt/', meaningVi: 'môn học', partOfSpeechOrType: 'noun', example: 'English is my favorite subject.', exampleMeaningVi: 'Tiếng Anh là môn học yêu thích của tôi.', difficulty: 'medium', tags: ['school', 'subject'] },
  { id: 'u3-lesson', term: 'lesson', pronunciation: '/ˈlesən/', meaningVi: 'bài học/tiết học', partOfSpeechOrType: 'noun', example: 'The lesson starts at eight.', exampleMeaningVi: 'Tiết học bắt đầu lúc tám giờ.', difficulty: 'easy', tags: ['school', 'time'] },
  { id: 'u3-test', term: 'test', pronunciation: '/test/', meaningVi: 'bài kiểm tra', partOfSpeechOrType: 'noun', example: 'We have a test today.', exampleMeaningVi: 'Hôm nay chúng tôi có bài kiểm tra.', difficulty: 'easy', tags: ['school', 'task'] },
  { id: 'u3-question', term: 'question', pronunciation: '/ˈkwestʃən/', meaningVi: 'câu hỏi', partOfSpeechOrType: 'noun', example: 'I have a question.', exampleMeaningVi: 'Tôi có một câu hỏi.', difficulty: 'easy', tags: ['classroom', 'communication'] },
  { id: 'u3-answer', term: 'answer', pronunciation: '/ˈænsər/', meaningVi: 'câu trả lời/trả lời', partOfSpeechOrType: 'noun/verb', example: 'What is the answer?', exampleMeaningVi: 'Câu trả lời là gì?', difficulty: 'easy', tags: ['classroom', 'communication'] },
  { id: 'u3-timetable', term: 'timetable', pronunciation: '/ˈtaɪmteɪbəl/', meaningVi: 'thời khóa biểu', partOfSpeechOrType: 'noun', example: 'I check my timetable every morning.', exampleMeaningVi: 'Tôi kiểm tra thời khóa biểu mỗi sáng.', difficulty: 'medium', tags: ['school', 'time'] },
  { id: 'u3-library', term: 'library', pronunciation: '/ˈlaɪbreri/', meaningVi: 'thư viện', partOfSpeechOrType: 'noun', example: 'The library is quiet.', exampleMeaningVi: 'Thư viện yên tĩnh.', difficulty: 'easy', tags: ['school', 'place'] },
  { id: 'u3-desk', term: 'desk', pronunciation: '/desk/', meaningVi: 'bàn học/bàn làm việc', partOfSpeechOrType: 'noun', example: 'My book is on the desk.', exampleMeaningVi: 'Sách của tôi ở trên bàn.', difficulty: 'easy', tags: ['classroom', 'item'] },
  { id: 'u3-board', term: 'board', pronunciation: '/bɔːrd/', meaningVi: 'bảng', partOfSpeechOrType: 'noun', example: 'Look at the board.', exampleMeaningVi: 'Hãy nhìn lên bảng.', difficulty: 'easy', tags: ['classroom', 'item'] },
  { id: 'u3-classmate', term: 'classmate', pronunciation: '/ˈklæsmeɪt/', meaningVi: 'bạn cùng lớp', partOfSpeechOrType: 'noun', example: 'My classmate helps me.', exampleMeaningVi: 'Bạn cùng lớp giúp tôi.', difficulty: 'easy', tags: ['school', 'person'] },
  { id: 'u3-break-time', term: 'break time', pronunciation: '/breɪk taɪm/', meaningVi: 'giờ ra chơi/giờ nghỉ', partOfSpeechOrType: 'noun chunk', example: 'We play at break time.', exampleMeaningVi: 'Chúng tôi chơi vào giờ ra chơi.', difficulty: 'easy', tags: ['school', 'time'] },
  { id: 'u3-school-bag', term: 'school bag', pronunciation: '/skuːl bæɡ/', meaningVi: 'cặp sách', partOfSpeechOrType: 'noun chunk', example: 'My school bag is blue.', exampleMeaningVi: 'Cặp sách của tôi màu xanh.', difficulty: 'easy', tags: ['school', 'item'] },
  { id: 'u3-uniform', term: 'uniform', pronunciation: '/ˈjuːnɪfɔːrm/', meaningVi: 'đồng phục', partOfSpeechOrType: 'noun', example: 'I wear a uniform to school.', exampleMeaningVi: 'Tôi mặc đồng phục đến trường.', difficulty: 'medium', tags: ['school', 'clothes'] },
  { id: 'u3-principal', term: 'principal', pronunciation: '/ˈprɪnsəpəl/', meaningVi: 'hiệu trưởng', partOfSpeechOrType: 'noun', example: 'The principal is in the office.', exampleMeaningVi: 'Hiệu trưởng ở trong văn phòng.', difficulty: 'medium', tags: ['school', 'person'] },
  { id: 'u3-english', term: 'English', pronunciation: '/ˈɪŋɡlɪʃ/', meaningVi: 'môn tiếng Anh', partOfSpeechOrType: 'noun', example: 'I have English on Monday.', exampleMeaningVi: 'Tôi có môn tiếng Anh vào thứ Hai.', difficulty: 'easy', tags: ['subject', 'core'] },
  { id: 'u3-math', term: 'math', pronunciation: '/mæθ/', meaningVi: 'môn toán', partOfSpeechOrType: 'noun', example: 'Math is on Tuesday.', exampleMeaningVi: 'Môn toán vào thứ Ba.', difficulty: 'easy', tags: ['subject', 'core'] },
];

const a1ClassmateVocabulary: VocabularyItem[] = [
  { id: 'a1-classmate-new', term: 'new', pronunciation: '/nuː/', meaningVi: 'mới', partOfSpeechOrType: 'adjective', example: 'I am new here.', exampleMeaningVi: 'Mình mới ở đây.', cefrLevel: 'A1', difficulty: 'easy', tags: ['classroom', 'listening'] },
  { id: 'a1-classmate-classmate', term: 'classmate', pronunciation: '/ˈklæsmeɪt/', meaningVi: 'bạn cùng lớp', partOfSpeechOrType: 'noun', example: 'This is my classmate.', exampleMeaningVi: 'Đây là bạn cùng lớp của tôi.', cefrLevel: 'A1', difficulty: 'easy', tags: ['school', 'people'] },
  { id: 'a1-classmate-seat', term: 'seat', pronunciation: '/siːt/', meaningVi: 'chỗ ngồi', partOfSpeechOrType: 'noun', example: 'This seat is free.', exampleMeaningVi: 'Chỗ ngồi này còn trống.', cefrLevel: 'A1', difficulty: 'easy', tags: ['classroom'] },
  { id: 'a1-classmate-free', term: 'free', pronunciation: '/friː/', meaningVi: 'còn trống/rảnh', partOfSpeechOrType: 'adjective', example: 'Is this seat free?', exampleMeaningVi: 'Chỗ này còn trống không?', cefrLevel: 'A1', difficulty: 'easy', tags: ['classroom', 'question'] },
  { id: 'a1-classmate-sit', term: 'sit', pronunciation: '/sɪt/', meaningVi: 'ngồi', partOfSpeechOrType: 'verb', example: 'You can sit here.', exampleMeaningVi: 'Bạn có thể ngồi đây.', cefrLevel: 'A1', difficulty: 'easy', tags: ['classroom', 'verb'] },
  { id: 'a1-classmate-here', term: 'here', pronunciation: '/hɪr/', meaningVi: 'ở đây', partOfSpeechOrType: 'adverb', example: 'Sit here, please.', exampleMeaningVi: 'Hãy ngồi ở đây nhé.', cefrLevel: 'A1', difficulty: 'easy', tags: ['place'] },
  { id: 'a1-classmate-pair-work', term: 'pair work', pronunciation: '/per wɜːrk/', meaningVi: 'làm việc theo cặp', partOfSpeechOrType: 'noun chunk', example: 'We have pair work today.', exampleMeaningVi: 'Hôm nay chúng ta làm việc theo cặp.', cefrLevel: 'A1', difficulty: 'medium', tags: ['classroom', 'chunk'] },
  { id: 'a1-classmate-open-book', term: 'open your book', pronunciation: '/ˈoʊpən jʊr bʊk/', meaningVi: 'mở sách của bạn', partOfSpeechOrType: 'classroom instruction', example: 'Open your book, please.', exampleMeaningVi: 'Làm ơn mở sách ra.', cefrLevel: 'A1', difficulty: 'easy', tags: ['instruction'] },
  { id: 'a1-classmate-page', term: 'page', pronunciation: '/peɪdʒ/', meaningVi: 'trang sách', partOfSpeechOrType: 'noun', example: 'Open your book to page ten.', exampleMeaningVi: 'Mở sách đến trang mười.', cefrLevel: 'A1', difficulty: 'easy', tags: ['classroom'] },
  { id: 'a1-classmate-see-you', term: 'see you later', pronunciation: '/siː juː ˈleɪtər/', meaningVi: 'hẹn gặp lại sau', partOfSpeechOrType: 'farewell chunk', example: 'See you later.', exampleMeaningVi: 'Hẹn gặp lại sau.', cefrLevel: 'A1', difficulty: 'easy', tags: ['farewell', 'chunk'] },
];

const a1DrinkVocabulary: VocabularyItem[] = [
  { id: 'a1-drink-menu', term: 'menu', pronunciation: '/ˈmenjuː/', meaningVi: 'thực đơn', partOfSpeechOrType: 'noun', example: 'Can I see the menu?', exampleMeaningVi: 'Tôi xem thực đơn được không?', cefrLevel: 'A1', difficulty: 'easy', tags: ['cafe', 'ordering'] },
  { id: 'a1-drink-water', term: 'water', pronunciation: '/ˈwɔːtər/', meaningVi: 'nước lọc', partOfSpeechOrType: 'noun', example: 'I would like water.', exampleMeaningVi: 'Tôi muốn nước lọc.', cefrLevel: 'A1', difficulty: 'easy', tags: ['drink'] },
  { id: 'a1-drink-coffee', term: 'coffee', pronunciation: '/ˈkɔːfi/', meaningVi: 'cà phê', partOfSpeechOrType: 'noun', example: 'One coffee, please.', exampleMeaningVi: 'Một cà phê, làm ơn.', cefrLevel: 'A1', difficulty: 'easy', tags: ['drink'] },
  { id: 'a1-drink-tea', term: 'tea', pronunciation: '/tiː/', meaningVi: 'trà', partOfSpeechOrType: 'noun', example: 'I like tea.', exampleMeaningVi: 'Tôi thích trà.', cefrLevel: 'A1', difficulty: 'easy', tags: ['drink'] },
  { id: 'a1-drink-juice', term: 'orange juice', pronunciation: '/ˈɔːrɪndʒ dʒuːs/', meaningVi: 'nước cam', partOfSpeechOrType: 'noun chunk', example: 'Orange juice, please.', exampleMeaningVi: 'Nước cam, làm ơn.', cefrLevel: 'A1', difficulty: 'easy', tags: ['drink', 'chunk'] },
  { id: 'a1-drink-small', term: 'small', pronunciation: '/smɔːl/', meaningVi: 'nhỏ', partOfSpeechOrType: 'adjective', example: 'A small coffee, please.', exampleMeaningVi: 'Một cà phê nhỏ, làm ơn.', cefrLevel: 'A1', difficulty: 'easy', tags: ['size'] },
  { id: 'a1-drink-large', term: 'large', pronunciation: '/lɑːrdʒ/', meaningVi: 'lớn', partOfSpeechOrType: 'adjective', example: 'A large tea, please.', exampleMeaningVi: 'Một trà lớn, làm ơn.', cefrLevel: 'A1', difficulty: 'easy', tags: ['size'] },
  { id: 'a1-drink-cold', term: 'cold', pronunciation: '/koʊld/', meaningVi: 'lạnh', partOfSpeechOrType: 'adjective', example: 'Cold water, please.', exampleMeaningVi: 'Nước lạnh, làm ơn.', cefrLevel: 'A1', difficulty: 'easy', tags: ['description'] },
  { id: 'a1-drink-how-much', term: 'how much is it?', pronunciation: '/haʊ mʌtʃ ɪz ɪt/', meaningVi: 'cái đó giá bao nhiêu?', partOfSpeechOrType: 'question chunk', example: 'How much is it?', exampleMeaningVi: 'Cái đó giá bao nhiêu?', cefrLevel: 'A1', difficulty: 'medium', tags: ['price', 'question'] },
  { id: 'a1-drink-here-you-are', term: 'here you are', pronunciation: '/hɪr juː ɑːr/', meaningVi: 'của bạn đây', partOfSpeechOrType: 'service chunk', example: 'Here you are.', exampleMeaningVi: 'Của bạn đây.', cefrLevel: 'A1', difficulty: 'easy', tags: ['service', 'chunk'] },
];

export const pEnglishLessons: EnglishLesson[] = [
  {
    id: 'unit-1-greetings-introduction',
    unitId: 'unit-1-greetings',
    unitTitle: 'Unit 1 — Chào hỏi và giới thiệu bản thân',
    titleVi: 'Chào hỏi và giới thiệu bản thân',
    titleEn: 'Greetings and Self-introduction',
    subtitle: 'Học cách chào hỏi, nói tên, hỏi tên và giới thiệu bản thân thật ngắn bằng tiếng Anh.',
    level: 'Beginner / A1',
    estimatedTime: '15–20 phút',
    skillTags: ['Từ vựng', 'Phản xạ', 'Nghe', 'Nói', 'Ôn tập'],
    learningObjectives: [
      'Chào hỏi người khác trong tình huống đơn giản.',
      'Nói tên của mình bằng tiếng Anh.',
      'Hỏi tên người khác.',
      'Nói mình đến từ đâu.',
      'Nói rất ngắn về việc mình là học sinh/sinh viên.',
      'Phản xạ được các câu chào hỏi cơ bản mà không cần dịch từng chữ.',
    ],
    vocabulary: unit1Vocabulary,
    sentencePatterns: [
      {
        id: 'pattern-hello-im',
        pattern: 'A: Hello, I’m [name]. / B: Hi, I’m [name].',
        vietnameseExplanation: 'Dùng như một cụm cố định khi lần đầu chào và nói tên. Người mới chỉ cần thay [name] bằng tên của mình.',
        examples: [
          { speaker: 'A', text: 'Hello, I’m Nam.', meaningVi: 'Xin chào, mình là Nam.' },
          { speaker: 'B', text: 'Hi, I’m Mai.', meaningVi: 'Chào, mình là Mai.' },
          { speaker: 'A', text: 'Hello, I’m An.', meaningVi: 'Xin chào, mình là An.' },
        ],
      },
      {
        id: 'pattern-whats-your-name',
        pattern: 'A: What’s your name? / B: My name is [name].',
        vietnameseExplanation: 'Dùng nguyên cụm “What’s your name?” để hỏi tên; không cần dịch từng từ khi phản xạ.',
        examples: [
          { speaker: 'A', text: 'What’s your name?', meaningVi: 'Bạn tên gì?' },
          { speaker: 'B', text: 'My name is Linh.', meaningVi: 'Tên mình là Linh.' },
        ],
      },
      {
        id: 'pattern-where-from',
        pattern: 'A: Where are you from? / B: I’m from [place].',
        vietnameseExplanation: 'Dùng khi hỏi và nói nơi mình đến từ đâu. Với A1, hãy nhớ cả cụm “I’m from...”.',
        examples: [
          { speaker: 'A', text: 'Where are you from?', meaningVi: 'Bạn đến từ đâu?' },
          { speaker: 'B', text: 'I’m from Vietnam.', meaningVi: 'Mình đến từ Việt Nam.' },
        ],
      },
      {
        id: 'pattern-nice-to-meet-you',
        pattern: 'A: Nice to meet you. / B: Nice to meet you too.',
        vietnameseExplanation: 'Dùng như một câu lịch sự, ngắn gọn khi gặp người mới lần đầu.',
        examples: [
          { speaker: 'A', text: 'Nice to meet you.', meaningVi: 'Rất vui được gặp bạn.' },
          { speaker: 'B', text: 'Nice to meet you too.', meaningVi: 'Mình cũng rất vui được gặp bạn.' },
        ],
      },
      {
        id: 'pattern-im-a-student',
        pattern: 'I’m a student.',
        vietnameseExplanation: 'Dùng để giới thiệu rất ngắn về bản thân. Nhớ dùng “a” trước “student”.',
        examples: [
          { text: 'I’m a student.', meaningVi: 'Mình là học sinh/sinh viên.' },
          { text: 'I am a student.', meaningVi: 'Tôi là học sinh/sinh viên.' },
        ],
      },
    ],
    miniDialogues: [
      {
        id: 'dialogue-new-friend',
        title: 'Gặp bạn mới',
        lines: [
          { speaker: 'A', text: 'Hi, I’m Nam.' },
          { speaker: 'B', text: 'Hello, I’m Mai.' },
          { speaker: 'A', text: 'Nice to meet you.' },
          { speaker: 'B', text: 'Nice to meet you too.' },
        ],
        vietnameseTranslation: [
          'A: Chào, mình là Nam.',
          'B: Xin chào, mình là Mai.',
          'A: Rất vui được gặp bạn.',
          'B: Mình cũng rất vui được gặp bạn.',
        ],
        focusPhrases: ['Hi, I’m...', 'Hello, I’m...', 'Nice to meet you', 'Nice to meet you too'],
        suggestedShadowingInstruction: 'Nghe hoặc đọc mẫu 1 lần, sau đó lặp lại từng câu 3 lần với nhịp tự nhiên.',
      },
      {
        id: 'dialogue-ask-name',
        title: 'Hỏi tên',
        lines: [
          { speaker: 'A', text: 'Hello. What’s your name?' },
          { speaker: 'B', text: 'My name is Linh.' },
          { speaker: 'A', text: 'Nice to meet you, Linh.' },
          { speaker: 'B', text: 'Nice to meet you too.' },
        ],
        vietnameseTranslation: [
          'A: Xin chào. Bạn tên gì?',
          'B: Tên mình là Linh.',
          'A: Rất vui được gặp bạn, Linh.',
          'B: Mình cũng rất vui được gặp bạn.',
        ],
        focusPhrases: ['What’s your name?', 'My name is...', 'Nice to meet you, ...'],
        suggestedShadowingInstruction: 'Đọc cả cụm “What’s your name?” liền mạch, không dịch từng chữ.',
      },
      {
        id: 'dialogue-where-from',
        title: 'Hỏi đến từ đâu',
        lines: [
          { speaker: 'A', text: 'Where are you from?' },
          { speaker: 'B', text: 'I’m from Vietnam.' },
          { speaker: 'A', text: 'I’m from Vietnam too.' },
          { speaker: 'B', text: 'Great!' },
        ],
        vietnameseTranslation: [
          'A: Bạn đến từ đâu?',
          'B: Mình đến từ Việt Nam.',
          'A: Mình cũng đến từ Việt Nam.',
          'B: Tuyệt quá!',
        ],
        focusPhrases: ['Where are you from?', 'I’m from...', 'too', 'Great!'],
        suggestedShadowingInstruction: 'Luyện nhấn nhẹ vào “from Vietnam” và trả lời nhanh không quá 2 giây.',
      },
    ],
    grammarNotes: [
      {
        id: 'grammar-i-am-im',
        title: 'I am = I’m',
        explanationVi: '“I am” có thể rút gọn thành “I’m”. Nghĩa là “Tôi là / Mình là”.',
        examples: ['I am Nam. = I’m Nam.', 'I am from Vietnam. = I’m from Vietnam.'],
      },
      {
        id: 'grammar-my-name-is',
        title: 'My name is...',
        explanationVi: '“My name is...” là một câu đầy đủ, an toàn và dễ dùng cho người mới bắt đầu.',
        examples: ['My name is Lan.', 'My name is Minh.'],
      },
      {
        id: 'grammar-whats-your-name',
        title: 'What’s your name?',
        explanationVi: '“What’s your name?” nghĩa là “Bạn tên gì?”. Không nên dịch từng chữ khi phản xạ.',
        examples: ['What’s your name? — My name is An.'],
      },
      {
        id: 'grammar-im-from',
        title: 'I’m from...',
        explanationVi: '“I’m from...” nghĩa là “Tôi đến từ...”. Dùng để nói quê quán hoặc nơi mình đến.',
        examples: ['I’m from Vietnam.'],
      },
    ],
    pronunciationNotes: [
      { id: 'pron-im', noteVi: '“I’m” nghe giống /aim/. Hãy đọc gọn trong một nhịp, không tách thành “I / am”.', examples: ['I’m Nam.', 'I’m from Vietnam.'] },
      { id: 'pron-name', noteVi: '“name” có âm /ei/ dài. Mở miệng vừa phải, kéo âm nhẹ rồi kết thúc bằng /m/.', examples: ['My name is Lan.', 'What’s your name?'] },
      { id: 'pron-from', noteVi: '“from” nên đọc ngắn và nhẹ trong câu “I’m from...”, không nhấn quá mạnh.', examples: ['I’m from Vietnam.'] },
      { id: 'pron-nice-to-meet-you', noteVi: '“nice to meet you” nên luyện như một cụm liền. Nghe 1 lần, dừng lại, rồi lặp cả cụm.', examples: ['Nice to meet you.', 'Nice to meet you too.'] },
      { id: 'pron-repeat', noteVi: 'Khuyến khích người học nghe và lặp lại mỗi câu 3 lần: lần 1 chậm, lần 2 rõ, lần 3 tự nhiên hơn.' },
    ],
    listeningPractice: [
      {
        id: 'listening-name-nam',
        text: 'Hello, I’m Nam.',
        question: 'What is the speaker’s name?',
        options: ['Nam', 'Mai', 'Linh', 'An'],
        answer: 'Nam',
        explanationVi: 'Nghe cụm “I’m Nam” để bắt tên người nói. Với A1, hãy bắt từ khóa tên riêng trước.',
        speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 },
      },
      {
        id: 'listening-linh-from-vietnam',
        text: 'My name is Linh. I’m from Vietnam.',
        question: 'Where is Linh from?',
        options: ['Vietnam', 'Japan', 'Korea', 'Thailand'],
        answer: 'Vietnam',
        explanationVi: 'Câu “I’m from Vietnam” cho biết nơi đến. Từ khóa cần nghe là “from Vietnam”.',
        speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 },
      },
      {
        id: 'listening-nice-to-meet-mai',
        text: 'Nice to meet you, Mai.',
        question: 'What does the speaker say?',
        options: ['Nice to meet you, Mai.', 'Goodbye, Mai.', 'Where are you from?', 'My name is Mai.'],
        answer: 'Nice to meet you, Mai.',
        explanationVi: 'Đây là câu chào lịch sự khi gặp người mới. Nghe cả cụm “Nice to meet you” thay vì dịch từng từ.',
        speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 },
      },
    ],
    speakingReflexPrompts: [
      { id: 'reflex-hello-im-nam', promptVi: 'Nói: Xin chào, mình là Nam.', expectedEnglish: 'Hello, I’m Nam.', acceptableAnswers: ['Hello, I’m Nam.', 'Hi, I’m Nam.'], hint: 'Bắt đầu bằng Hello hoặc Hi, sau đó nói I’m Nam.', difficulty: 'easy' },
      { id: 'reflex-whats-your-name', promptVi: 'Hỏi: Bạn tên gì?', expectedEnglish: 'What’s your name?', acceptableAnswers: ['What’s your name?', 'What is your name?'], hint: 'Dùng câu hỏi What’s your name?', difficulty: 'easy' },
      { id: 'reflex-my-name-is-lan', promptVi: 'Nói: Tên mình là Lan.', expectedEnglish: 'My name is Lan.', acceptableAnswers: ['My name is Lan.', 'I’m Lan.'], hint: 'Dùng My name is...', difficulty: 'easy' },
      { id: 'reflex-nice-to-meet-you', promptVi: 'Nói: Rất vui được gặp bạn.', expectedEnglish: 'Nice to meet you.', acceptableAnswers: ['Nice to meet you.', 'It’s nice to meet you.'], hint: 'Nói cả cụm Nice to meet you.', difficulty: 'easy' },
      { id: 'reflex-nice-too', promptVi: 'Nói: Mình cũng rất vui được gặp bạn.', expectedEnglish: 'Nice to meet you too.', acceptableAnswers: ['Nice to meet you too.', 'Nice to meet you, too.'], hint: 'Thêm too ở cuối câu.', difficulty: 'easy' },
      { id: 'reflex-where-from', promptVi: 'Hỏi: Bạn đến từ đâu?', expectedEnglish: 'Where are you from?', acceptableAnswers: ['Where are you from?', 'Where do you come from?'], hint: 'Câu hỏi chính trong bài bắt đầu bằng Where are...', difficulty: 'medium' },
      { id: 'reflex-im-from-vietnam', promptVi: 'Nói: Mình đến từ Việt Nam.', expectedEnglish: 'I’m from Vietnam.', acceptableAnswers: ['I’m from Vietnam.', 'I am from Vietnam.'], hint: 'Dùng I’m from...', difficulty: 'easy' },
      { id: 'reflex-im-a-student', promptVi: 'Nói: Mình là học sinh/sinh viên.', expectedEnglish: 'I’m a student.', acceptableAnswers: ['I’m a student.', 'I am a student.'], hint: 'Nhớ dùng a trước student.', difficulty: 'easy' },
    ],
    flashcards: unit1Vocabulary.map((item) => ({
      id: `flashcard-${item.id}`,
      front: item.term,
      back: item.meaningVi,
      example: item.example,
      exampleMeaningVi: item.exampleMeaningVi,
      tags: item.tags,
    })),
    quizQuestions: [
      {
        id: 'quiz-1-whats-your-name-meaning',
        type: 'multiple-choice',
        question: '“What’s your name?” nghĩa là gì?',
        options: ['Bạn tên gì?', 'Bạn đến từ đâu?', 'Tạm biệt', 'Cảm ơn'],
        answer: 'Bạn tên gì?',
        explanationVi: 'Đây là câu hỏi tên người khác.',
      },
      {
        id: 'quiz-2-hello-im-blank',
        type: 'fill-blank',
        prompt: 'Hello, ___ Nam.',
        answer: 'I’m',
        explanationVi: 'Dùng “I’m” để nói “mình là”.',
      },
      {
        id: 'quiz-3-from-vietnam',
        type: 'multiple-choice',
        question: 'Câu nào dùng để nói “Tôi đến từ Việt Nam”?',
        options: ['I’m from Vietnam.', 'I’m Vietnam from.', 'My name Vietnam.', 'Where are you from?'],
        answer: 'I’m from Vietnam.',
        explanationVi: 'Mẫu đúng là I’m from + nơi chốn.',
      },
      {
        id: 'quiz-4-nice-order',
        type: 'sentence-order',
        vietnamese: 'Rất vui được gặp bạn.',
        words: ['Nice', 'to', 'meet', 'you'],
        answer: 'Nice to meet you',
        explanationVi: 'Thứ tự tự nhiên là Nice + to + meet + you. Đây là một cụm cố định.',
      },
      {
        id: 'quiz-5-good-morning',
        type: 'multiple-choice',
        question: '“Good morning” dùng khi nào?',
        options: ['Buổi sáng', 'Buổi tối', 'Khi tạm biệt', 'Khi hỏi tên'],
        answer: 'Buổi sáng',
        explanationVi: '“Good morning” là lời chào dùng vào buổi sáng.',
      },
      {
        id: 'quiz-6-match-goodbye',
        type: 'match-meaning',
        question: 'Ghép nghĩa đúng.',
        pairs: [{ left: 'goodbye', right: 'tạm biệt' }],
        options: ['tạm biệt', 'cảm ơn', 'xin chào', 'giáo viên'],
        answer: ['goodbye = tạm biệt'],
        explanationVi: '“Goodbye” dùng khi chào tạm biệt, không dùng để hỏi tên hay cảm ơn.',
      },
      {
        id: 'quiz-7-my-name-is',
        type: 'multiple-choice',
        question: 'Câu nào là cách giới thiệu tên đầy đủ, an toàn cho người mới?',
        options: ['My name is Lan.', 'Name Lan my.', 'What Lan name?', 'Lan from name.'],
        answer: 'My name is Lan.',
        explanationVi: '“My name is...” là mẫu câu đầy đủ và an toàn để giới thiệu tên.',
      },
      {
        id: 'quiz-8-student-blank',
        type: 'fill-blank',
        prompt: 'I’m ___ student.',
        answer: 'a',
        explanationVi: 'Dùng “a student” khi nói một học sinh/sinh viên.',
      },
      {
        id: 'quiz-9-where-order',
        type: 'sentence-order',
        vietnamese: 'Bạn đến từ đâu?',
        words: ['Where', 'are', 'you', 'from'],
        answer: 'Where are you from',
        explanationVi: 'Câu hỏi đúng là Where + are + you + from. Hãy học như một cụm hỏi nơi đến.',
      },
      {
        id: 'quiz-10-thank-you-meaning',
        type: 'multiple-choice',
        question: '“Thank you” nghĩa là gì?',
        options: ['Cảm ơn', 'Tạm biệt', 'Bạn tên gì?', 'Rất vui được gặp bạn'],
        answer: 'Cảm ơn',
        explanationVi: '“Thank you” là cụm lịch sự để nói cảm ơn.',
      },
    ],
    sentenceOrderingTasks: [
      { id: 'order-nice-to-meet-you', vietnamese: 'Rất vui được gặp bạn.', words: ['Nice', 'to', 'meet', 'you'], answer: 'Nice to meet you' },
      { id: 'order-where-are-you-from', vietnamese: 'Bạn đến từ đâu?', words: ['Where', 'are', 'you', 'from'], answer: 'Where are you from' },
      { id: 'order-my-name-is-lan', vietnamese: 'Tên mình là Lan.', words: ['My', 'name', 'is', 'Lan'], answer: 'My name is Lan' },
    ],
    fillBlankTasks: [
      { id: 'blank-hello-im', prompt: 'Hello, ___ Nam.', answer: 'I’m', hint: 'Dùng dạng rút gọn của I am.' },
      { id: 'blank-im-from', prompt: 'I’m ___ Vietnam.', answer: 'from', hint: 'Dùng from để nói đến từ đâu.' },
      { id: 'blank-a-student', prompt: 'I’m ___ student.', answer: 'a', hint: 'Cần mạo từ trước student.' },
    ],
    reviewRules: {
      newWordReviewAfterMinutes: 10,
      ifWrong: 'Nếu trả lời sai, hiển thị lại trong cùng phiên học.',
      ifCorrectTwice: 'Nếu trả lời đúng 2 lần, đánh dấu là quen thuộc.',
      ifCorrectThreeTimesAcrossSessions: 'Nếu trả lời đúng 3 lần qua nhiều phiên, đánh dấu là đã học.',
      priorityRule: 'Ưu tiên luyện các cụm/chunks trước từ đơn lẻ.',
    },
    completionCriteria: {
      flashcardsReviewed: 18,
      minimumQuizCorrect: 8,
      totalQuizQuestions: 10,
      minimumReflexPromptsCompleted: 5,
      totalReflexPrompts: 8,
      minimumListeningOrDialogueRepeats: 2,
    },
  },
  {
    id: 'a1-listening-meeting-classmate',
    unitId: 'a1-listening-everyday',
    unitTitle: 'A1 Listening — Gặp bạn mới trong lớp',
    titleVi: 'A1 - Meeting a new classmate',
    titleEn: 'Meeting a new classmate',
    subtitle: 'Luyện nghe tình huống gặp bạn mới trong lớp, hỏi chỗ ngồi, làm việc theo cặp và chào tạm biệt.',
    level: 'Beginner / A1',
    estimatedTime: '15–20 phút',
    skillTags: ['Nghe', 'Từ vựng', 'Phản xạ', 'Nói', 'Ôn tập'],
    learningObjectives: [
      'Nghe và nhận diện các cụm A1 trong lớp học như “Is this seat free?” và “pair work”.',
      'Hiểu ý chính của hội thoại ngắn khi gặp bạn mới.',
      'Chọn đáp án đúng dựa trên từ khóa nghe được thay vì dịch từng chữ.',
      'Lặp lại câu ngắn với tốc độ chậm rồi tự nhiên hơn.',
      'Dùng được câu lịch sự khi ngồi cạnh bạn mới trong lớp.',
    ],
    vocabulary: a1ClassmateVocabulary,
    sentencePatterns: [
      { id: 'a1-classmate-pattern-new-here', pattern: 'I am new here.', vietnameseExplanation: 'Dùng để nói mình là người mới ở lớp hoặc nơi nào đó.', examples: [{ text: 'I am new here.', meaningVi: 'Mình mới ở đây.' }, { text: 'Are you new here?', meaningVi: 'Bạn mới ở đây à?' }] },
      { id: 'a1-classmate-pattern-seat-free', pattern: 'Is this seat free?', vietnameseExplanation: 'Câu hỏi lịch sự để hỏi chỗ ngồi còn trống không.', examples: [{ text: 'Is this seat free?', meaningVi: 'Chỗ này còn trống không?' }, { text: 'Yes, you can sit here.', meaningVi: 'Có, bạn có thể ngồi đây.' }] },
      { id: 'a1-classmate-pattern-open-page', pattern: 'Open your book to page ten.', vietnameseExplanation: 'Câu hướng dẫn lớp học. Hãy nghe từ khóa “open”, “book” và “page”.', examples: [{ text: 'Open your book to page ten.', meaningVi: 'Mở sách đến trang mười.' }] },
    ],
    miniDialogues: [
      {
        id: 'a1-classmate-dialogue-main',
        title: 'Bạn mới trong lớp',
        lines: [
          { speaker: 'A', text: 'Hi, I am new here.' },
          { speaker: 'B', text: 'Hello. My name is Mai.' },
          { speaker: 'A', text: 'Is this seat free?' },
          { speaker: 'B', text: 'Yes, you can sit here.' },
          { speaker: 'A', text: 'Thank you. What page?' },
          { speaker: 'B', text: 'Page ten. We have pair work today.' },
        ],
        vietnameseTranslation: ['A: Chào, mình mới ở đây.', 'B: Xin chào. Mình tên Mai.', 'A: Chỗ này còn trống không?', 'B: Có, bạn có thể ngồi đây.', 'A: Cảm ơn. Trang mấy vậy?', 'B: Trang mười. Hôm nay chúng ta làm việc theo cặp.'],
        focusPhrases: ['I am new here', 'Is this seat free?', 'You can sit here', 'page ten', 'pair work'],
        suggestedShadowingInstruction: 'Nghe toàn bộ một lần, sau đó lặp từng câu 3 lần: chậm, rõ, rồi tự nhiên.',
      },
    ],
    grammarNotes: [
      { id: 'a1-classmate-grammar-can', title: 'can + verb', explanationVi: '“You can sit here” nghĩa là “Bạn có thể ngồi ở đây”. Sau can dùng động từ nguyên mẫu.', examples: ['You can sit here.', 'You can open your book.'] },
      { id: 'a1-classmate-grammar-this', title: 'this seat / this page', explanationVi: '“this” dùng cho vật ở gần: this seat = chỗ này, this page = trang này.', examples: ['Is this seat free?', 'Look at this page.'] },
    ],
    pronunciationNotes: [
      { id: 'a1-classmate-pron-seat', noteVi: '“seat” có âm /iː/ dài. Đừng đọc giống “sit”.', examples: ['Is this seat free?'] },
      { id: 'a1-classmate-pron-pair-work', noteVi: '“pair work” nên đọc thành hai nhịp rõ: pair / work.', examples: ['We have pair work today.'] },
    ],
    listeningPractice: [
      { id: 'a1-classmate-listen-new', text: 'Hi, I am new here.', question: 'What does the speaker say?', options: ['I am new here.', 'I am from here.', 'I am not here.', 'I am a teacher.'], answer: 'I am new here.', explanationVi: 'Từ khóa là “new here”, nghĩa là người nói mới ở lớp/nơi này.', speechSynthesis: { lang: 'en-US', rate: 0.86, repeatRecommended: 3 } },
      { id: 'a1-classmate-listen-seat', text: 'Is this seat free?', question: 'What does the speaker ask about?', options: ['a seat', 'a book', 'a teacher', 'a drink'], answer: 'a seat', explanationVi: 'Nghe từ “seat”. Cả câu hỏi chỗ ngồi còn trống không.', speechSynthesis: { lang: 'en-US', rate: 0.84, repeatRecommended: 3 } },
      { id: 'a1-classmate-listen-sit', text: 'Yes, you can sit here.', question: 'Where can the new student sit?', options: ['here', 'at home', 'outside', 'on page ten'], answer: 'here', explanationVi: 'Cụm “sit here” cho biết bạn mới có thể ngồi ở đây.', speechSynthesis: { lang: 'en-US', rate: 0.86, repeatRecommended: 3 } },
      { id: 'a1-classmate-listen-page', text: 'Open your book to page ten.', question: 'What page should the student open?', options: ['page ten', 'page two', 'page six', 'page twelve'], answer: 'page ten', explanationVi: 'Nghe số sau từ “page”. Ở đây là “page ten”.', speechSynthesis: { lang: 'en-US', rate: 0.84, repeatRecommended: 3 } },
      { id: 'a1-classmate-listen-pair-work', text: 'We have pair work today.', question: 'What activity is today?', options: ['pair work', 'a test', 'lunch', 'homework'], answer: 'pair work', explanationVi: 'Từ khóa “pair work” nghĩa là làm việc theo cặp.', speechSynthesis: { lang: 'en-US', rate: 0.86, repeatRecommended: 3 } },
    ],
    speakingReflexPrompts: [
      { id: 'a1-classmate-reflex-new', promptVi: 'Nói: Mình mới ở đây.', expectedEnglish: 'I am new here.', acceptableAnswers: ['I am new here.', 'I’m new here.'], hint: 'Dùng new here.', difficulty: 'easy' },
      { id: 'a1-classmate-reflex-seat-free', promptVi: 'Hỏi: Chỗ này còn trống không?', expectedEnglish: 'Is this seat free?', acceptableAnswers: ['Is this seat free?'], hint: 'Bắt đầu bằng Is this...', difficulty: 'easy' },
      { id: 'a1-classmate-reflex-sit-here', promptVi: 'Nói: Bạn có thể ngồi ở đây.', expectedEnglish: 'You can sit here.', acceptableAnswers: ['You can sit here.'], hint: 'You can + động từ.', difficulty: 'easy' },
      { id: 'a1-classmate-reflex-open-book', promptVi: 'Nói: Mở sách của bạn.', expectedEnglish: 'Open your book.', acceptableAnswers: ['Open your book.', 'Please open your book.'], hint: 'Open your book.', difficulty: 'easy' },
      { id: 'a1-classmate-reflex-see-you', promptVi: 'Nói: Hẹn gặp lại sau.', expectedEnglish: 'See you later.', acceptableAnswers: ['See you later.'], hint: 'Cụm chào tạm biệt.', difficulty: 'easy' },
    ],
    flashcards: a1ClassmateVocabulary.map((item) => ({ id: `flashcard-${item.id}`, front: item.term, back: item.meaningVi, example: item.example, exampleMeaningVi: item.exampleMeaningVi, tags: item.tags })),
    quizQuestions: [
      { id: 'a1-classmate-quiz-seat', type: 'multiple-choice', question: '“Is this seat free?” nghĩa là gì?', options: ['Chỗ này còn trống không?', 'Bạn tên gì?', 'Mở sách ra.', 'Hẹn gặp lại.'], answer: 'Chỗ này còn trống không?', explanationVi: 'seat = chỗ ngồi, free = còn trống trong ngữ cảnh này.' },
      { id: 'a1-classmate-quiz-new', type: 'fill-blank', prompt: 'I am ___ here.', answer: 'new', explanationVi: 'new here = mới ở đây.' },
      { id: 'a1-classmate-quiz-order', type: 'sentence-order', vietnamese: 'Bạn có thể ngồi ở đây.', words: ['You', 'can', 'sit', 'here'], answer: 'You can sit here', explanationVi: 'Sau can dùng động từ nguyên mẫu “sit”.' },
      { id: 'a1-classmate-quiz-page', type: 'multiple-choice', question: '“page” nghĩa là gì?', options: ['trang sách', 'chỗ ngồi', 'bạn cùng lớp', 'làm việc theo cặp'], answer: 'trang sách', explanationVi: 'page là trang sách/tài liệu.' },
      { id: 'a1-classmate-quiz-pair-work', type: 'multiple-choice', question: '“pair work” là hoạt động gì?', options: ['làm việc theo cặp', 'làm bài kiểm tra', 'uống nước', 'ra về'], answer: 'làm việc theo cặp', explanationVi: 'pair = cặp, work = làm việc.' },
    ],
    sentenceOrderingTasks: [
      { id: 'a1-classmate-order-seat-free', vietnamese: 'Chỗ này còn trống không?', words: ['Is', 'this', 'seat', 'free'], answer: 'Is this seat free' },
      { id: 'a1-classmate-order-sit-here', vietnamese: 'Bạn có thể ngồi ở đây.', words: ['You', 'can', 'sit', 'here'], answer: 'You can sit here' },
    ],
    fillBlankTasks: [
      { id: 'a1-classmate-blank-new', prompt: 'I am ___ here.', answer: 'new', hint: 'new = mới.' },
      { id: 'a1-classmate-blank-page', prompt: 'Open your book to ___ ten.', answer: 'page', hint: 'page = trang.' },
      { id: 'a1-classmate-blank-pair', prompt: 'We have ___ work today.', answer: 'pair', hint: 'pair work = làm việc theo cặp.' },
    ],
    matchPairs: a1ClassmateVocabulary.slice(0, 8).map((item) => ({ id: `match-${item.id}`, left: item.term, right: item.meaningVi })),
    englishSpeedPrompts: [
      { id: 'a1-classmate-speed-seat', promptVi: 'Chỗ này còn trống không?', expectedEnglish: 'Is this seat free?', hint: 'Is this seat...' },
      { id: 'a1-classmate-speed-sit', promptVi: 'Bạn có thể ngồi ở đây.', expectedEnglish: 'You can sit here.', hint: 'You can...' },
    ],
    shadowingScript: { id: 'a1-classmate-shadow', title: 'New classmate shadowing', lines: [{ id: 'a1-classmate-shadow-1', text: 'Hi, I am new here.', meaningVi: 'Chào, mình mới ở đây.' }, { id: 'a1-classmate-shadow-2', text: 'Is this seat free?', meaningVi: 'Chỗ này còn trống không?' }, { id: 'a1-classmate-shadow-3', text: 'Yes, you can sit here.', meaningVi: 'Có, bạn có thể ngồi ở đây.' }] },
    commonMistakes: [{ id: 'a1-classmate-mistake-seat-sit', mistake: 'Nhầm seat và sit khi nghe.', correction: 'seat = chỗ ngồi; sit = ngồi.', explanationVi: 'Hãy nghe âm dài /iː/ trong “seat” và âm ngắn trong “sit”.' }],
    realLifeSituations: [{ id: 'a1-classmate-situation-class', title: 'Ngày đầu vào lớp', scenarioVi: 'Bạn vào lớp mới và cần hỏi chỗ ngồi còn trống.', usefulPhrases: ['I am new here.', 'Is this seat free?', 'You can sit here.'] }],
    gameMissions: [{ id: 'a1-classmate-mission-listen', title: 'Bắt 5 từ khóa lớp học', instructionVi: 'Nghe mỗi câu ít nhất 2 lần và ghi nhớ từ khóa chính trước khi xem transcript.', successCriteria: 'Trả lời đúng ít nhất 4/5 câu nghe.' }],
    whaleCoachLines: ['Nghe từ khóa trước, transcript để sau.', 'Nếu nghe nhầm seat/sit, hãy bấm Nghe chậm một lần nữa.'],
    finalMiniChallenge: { id: 'a1-classmate-final', title: 'Tự giới thiệu với bạn mới', instructionVi: 'Nói 3 câu: mình mới ở đây, hỏi chỗ ngồi, cảm ơn.', targetOutput: ['I am new here.', 'Is this seat free?', 'Thank you.'] },
    reviewRules: { newWordReviewAfterMinutes: 10, ifWrong: 'Nếu sai câu nghe, phát lại ở tốc độ chậm và hiện transcript sau khi chọn đáp án.', ifCorrectTwice: 'Nếu đúng 2 lần, chuyển sang phản xạ nói câu đó.', ifCorrectThreeTimesAcrossSessions: 'Nếu đúng 3 phiên, đưa cụm vào nhóm đã quen.', priorityRule: 'Ưu tiên cụm giao tiếp lớp học trước từ đơn.' },
    completionCriteria: { flashcardsReviewed: 10, minimumQuizCorrect: 4, totalQuizQuestions: 5, minimumReflexPromptsCompleted: 3, totalReflexPrompts: 5, minimumListeningOrDialogueRepeats: 3 },
  },
  {
    id: 'a1-listening-ordering-drink',
    unitId: 'a1-listening-everyday',
    unitTitle: 'A1 Listening — Gọi đồ uống đơn giản',
    titleVi: 'A1 - Ordering a drink',
    titleEn: 'Ordering a drink',
    subtitle: 'Luyện nghe tình huống gọi đồ uống ở quán nước bằng câu ngắn, lịch sự và dễ dùng.',
    level: 'Beginner / A1',
    estimatedTime: '15–20 phút',
    skillTags: ['Nghe', 'Từ vựng', 'Phản xạ', 'Nói', 'Ôn tập'],
    learningObjectives: ['Nghe và nhận diện tên đồ uống A1.', 'Hiểu câu gọi món ngắn như “One small coffee, please.”', 'Hỏi giá bằng cụm “How much is it?”.', 'Luyện phản xạ gọi đồ uống lịch sự.', 'Xem transcript sau khi trả lời để tự sửa lỗi nghe.'],
    vocabulary: a1DrinkVocabulary,
    sentencePatterns: [
      { id: 'a1-drink-pattern-order', pattern: 'One + drink, please.', vietnameseExplanation: 'Mẫu gọi đồ uống ngắn và lịch sự.', examples: [{ text: 'One coffee, please.', meaningVi: 'Một cà phê, làm ơn.' }, { text: 'One orange juice, please.', meaningVi: 'Một nước cam, làm ơn.' }] },
      { id: 'a1-drink-pattern-size', pattern: 'A small / large + drink, please.', vietnameseExplanation: 'Thêm kích cỡ trước tên đồ uống.', examples: [{ text: 'A small coffee, please.', meaningVi: 'Một cà phê nhỏ, làm ơn.' }, { text: 'A large tea, please.', meaningVi: 'Một trà lớn, làm ơn.' }] },
      { id: 'a1-drink-pattern-price', pattern: 'How much is it?', vietnameseExplanation: 'Câu hỏi giá rất hữu ích ở A1.', examples: [{ text: 'How much is it?', meaningVi: 'Cái đó giá bao nhiêu?' }] },
    ],
    miniDialogues: [
      { id: 'a1-drink-dialogue-main', title: 'Gọi đồ uống', lines: [{ speaker: 'A', text: 'Hello. Can I see the menu?' }, { speaker: 'B', text: 'Yes. Here you are.' }, { speaker: 'A', text: 'One small coffee, please.' }, { speaker: 'B', text: 'Sure. Anything else?' }, { speaker: 'A', text: 'Cold water, please. How much is it?' }, { speaker: 'B', text: 'It is three dollars.' }], vietnameseTranslation: ['A: Xin chào. Tôi xem thực đơn được không?', 'B: Vâng. Của bạn đây.', 'A: Một cà phê nhỏ, làm ơn.', 'B: Được chứ. Còn gì nữa không?', 'A: Nước lạnh, làm ơn. Cái đó giá bao nhiêu?', 'B: Ba đô la.'], focusPhrases: ['Can I see the menu?', 'One small coffee, please.', 'Cold water, please.', 'How much is it?'], suggestedShadowingInstruction: 'Lặp câu gọi món với nhịp lịch sự; nhấn nhẹ vào đồ uống và kích cỡ.' },
    ],
    grammarNotes: [{ id: 'a1-drink-grammar-please', title: 'please trong câu gọi món', explanationVi: 'Thêm please để câu gọi món lịch sự và tự nhiên hơn.', examples: ['One coffee, please.', 'Cold water, please.'] }, { id: 'a1-drink-grammar-a-one', title: 'a / one khi gọi món', explanationVi: 'Có thể dùng “a small coffee” hoặc “one small coffee” khi gọi một món.', examples: ['A small coffee, please.', 'One small coffee, please.'] }],
    pronunciationNotes: [{ id: 'a1-drink-pron-coffee', noteVi: '“coffee” nhấn âm đầu: COF-fee.', examples: ['One coffee, please.'] }, { id: 'a1-drink-pron-water', noteVi: '“water” có thể khác giọng Anh-Mỹ/Anh-Anh; hãy nghe ý chính là đồ uống.', examples: ['Cold water, please.'] }],
    listeningPractice: [
      { id: 'a1-drink-listen-menu', text: 'Can I see the menu?', question: 'What does the customer want to see?', options: ['the menu', 'the seat', 'the book', 'the page'], answer: 'the menu', explanationVi: 'Từ khóa là “menu”, nghĩa là thực đơn.', speechSynthesis: { lang: 'en-US', rate: 0.86, repeatRecommended: 3 } },
      { id: 'a1-drink-listen-coffee', text: 'One small coffee, please.', question: 'What drink does the customer order?', options: ['coffee', 'tea', 'orange juice', 'water'], answer: 'coffee', explanationVi: 'Nghe tên đồ uống ở cuối cụm “small coffee”.', speechSynthesis: { lang: 'en-US', rate: 0.84, repeatRecommended: 3 } },
      { id: 'a1-drink-listen-size', text: 'A large tea, please.', question: 'What size is the tea?', options: ['large', 'small', 'cold', 'free'], answer: 'large', explanationVi: 'Từ “large” đứng trước “tea” cho biết kích cỡ lớn.', speechSynthesis: { lang: 'en-US', rate: 0.84, repeatRecommended: 3 } },
      { id: 'a1-drink-listen-water', text: 'Cold water, please.', question: 'What does the customer want?', options: ['cold water', 'hot coffee', 'small tea', 'orange juice'], answer: 'cold water', explanationVi: 'Nghe cụm “cold water”: nước lạnh.', speechSynthesis: { lang: 'en-US', rate: 0.86, repeatRecommended: 3 } },
      { id: 'a1-drink-listen-price', text: 'How much is it?', question: 'What does the customer ask?', options: ['the price', 'the name', 'the seat', 'the page'], answer: 'the price', explanationVi: '“How much is it?” dùng để hỏi giá.', speechSynthesis: { lang: 'en-US', rate: 0.86, repeatRecommended: 3 } },
    ],
    speakingReflexPrompts: [
      { id: 'a1-drink-reflex-menu', promptVi: 'Hỏi: Tôi xem thực đơn được không?', expectedEnglish: 'Can I see the menu?', acceptableAnswers: ['Can I see the menu?', 'May I see the menu?'], hint: 'Can I see...', difficulty: 'easy' },
      { id: 'a1-drink-reflex-coffee', promptVi: 'Gọi: Một cà phê nhỏ, làm ơn.', expectedEnglish: 'One small coffee, please.', acceptableAnswers: ['One small coffee, please.', 'A small coffee, please.'], hint: 'small coffee, please.', difficulty: 'easy' },
      { id: 'a1-drink-reflex-water', promptVi: 'Gọi: Nước lạnh, làm ơn.', expectedEnglish: 'Cold water, please.', acceptableAnswers: ['Cold water, please.'], hint: 'Cold water...', difficulty: 'easy' },
      { id: 'a1-drink-reflex-price', promptVi: 'Hỏi: Cái đó giá bao nhiêu?', expectedEnglish: 'How much is it?', acceptableAnswers: ['How much is it?'], hint: 'How much...', difficulty: 'easy' },
      { id: 'a1-drink-reflex-here-you-are', promptVi: 'Nói: Của bạn đây.', expectedEnglish: 'Here you are.', acceptableAnswers: ['Here you are.'], hint: 'Cụm phục vụ lịch sự.', difficulty: 'easy' },
    ],
    flashcards: a1DrinkVocabulary.map((item) => ({ id: `flashcard-${item.id}`, front: item.term, back: item.meaningVi, example: item.example, exampleMeaningVi: item.exampleMeaningVi, tags: item.tags })),
    quizQuestions: [
      { id: 'a1-drink-quiz-menu', type: 'multiple-choice', question: '“menu” nghĩa là gì?', options: ['thực đơn', 'chỗ ngồi', 'trang sách', 'bạn cùng lớp'], answer: 'thực đơn', explanationVi: 'menu là thực đơn ở quán/cửa hàng.' },
      { id: 'a1-drink-quiz-order', type: 'sentence-order', vietnamese: 'Một cà phê nhỏ, làm ơn.', words: ['One', 'small', 'coffee', 'please'], answer: 'One small coffee please', explanationVi: 'Thứ tự tự nhiên là số lượng + kích cỡ + đồ uống + please.' },
      { id: 'a1-drink-quiz-price', type: 'multiple-choice', question: '“How much is it?” dùng để hỏi gì?', options: ['giá tiền', 'tên', 'chỗ ngồi', 'trang sách'], answer: 'giá tiền', explanationVi: 'How much...? thường dùng để hỏi giá.' },
      { id: 'a1-drink-quiz-cold', type: 'fill-blank', prompt: '___ water, please.', answer: 'Cold', explanationVi: 'Cold water = nước lạnh.' },
      { id: 'a1-drink-quiz-size', type: 'multiple-choice', question: 'Từ nào trái nghĩa gần nhất với “small” trong bài?', options: ['large', 'cold', 'free', 'new'], answer: 'large', explanationVi: 'small = nhỏ, large = lớn.' },
    ],
    sentenceOrderingTasks: [{ id: 'a1-drink-order-coffee', vietnamese: 'Một cà phê nhỏ, làm ơn.', words: ['One', 'small', 'coffee', 'please'], answer: 'One small coffee please' }, { id: 'a1-drink-order-price', vietnamese: 'Cái đó giá bao nhiêu?', words: ['How', 'much', 'is', 'it'], answer: 'How much is it' }],
    fillBlankTasks: [{ id: 'a1-drink-blank-menu', prompt: 'Can I see the ___?', answer: 'menu', hint: 'menu = thực đơn.' }, { id: 'a1-drink-blank-coffee', prompt: 'One small ___, please.', answer: 'coffee', hint: 'Đồ uống trong câu là cà phê.' }, { id: 'a1-drink-blank-much', prompt: 'How ___ is it?', answer: 'much', hint: 'Cụm hỏi giá.' }],
    matchPairs: a1DrinkVocabulary.slice(0, 8).map((item) => ({ id: `match-${item.id}`, left: item.term, right: item.meaningVi })),
    englishSpeedPrompts: [{ id: 'a1-drink-speed-coffee', promptVi: 'Một cà phê nhỏ, làm ơn.', expectedEnglish: 'One small coffee, please.', hint: 'One small...' }, { id: 'a1-drink-speed-price', promptVi: 'Cái đó giá bao nhiêu?', expectedEnglish: 'How much is it?', hint: 'How much...' }],
    shadowingScript: { id: 'a1-drink-shadow', title: 'Ordering a drink shadowing', lines: [{ id: 'a1-drink-shadow-1', text: 'Can I see the menu?', meaningVi: 'Tôi xem thực đơn được không?' }, { id: 'a1-drink-shadow-2', text: 'One small coffee, please.', meaningVi: 'Một cà phê nhỏ, làm ơn.' }, { id: 'a1-drink-shadow-3', text: 'How much is it?', meaningVi: 'Cái đó giá bao nhiêu?' }] },
    commonMistakes: [{ id: 'a1-drink-mistake-please', mistake: 'Quên “please” khi gọi món.', correction: 'Thêm please ở cuối câu.', explanationVi: 'Ở tình huống dịch vụ, please giúp câu lịch sự và tự nhiên hơn.' }],
    realLifeSituations: [{ id: 'a1-drink-situation-cafe', title: 'Gọi đồ ở quán nước', scenarioVi: 'Bạn muốn xem thực đơn, gọi cà phê nhỏ và hỏi giá.', usefulPhrases: ['Can I see the menu?', 'One small coffee, please.', 'How much is it?'] }],
    gameMissions: [{ id: 'a1-drink-mission-listen', title: 'Bắt tên đồ uống và giá', instructionVi: 'Nghe mỗi câu trước khi xem transcript, tập trung vào tên đồ uống/kích cỡ/giá.', successCriteria: 'Trả lời đúng ít nhất 4/5 câu nghe.' }],
    whaleCoachLines: ['Trong quán nước, hãy nghe tên đồ uống trước, chi tiết kích cỡ sau.', 'Nếu bỏ lỡ “small/large”, nghe chậm rồi chọn lại.'],
    finalMiniChallenge: { id: 'a1-drink-final', title: 'Gọi một đồ uống', instructionVi: 'Nói 3 câu: xin xem menu, gọi đồ uống, hỏi giá.', targetOutput: ['Can I see the menu?', 'One small coffee, please.', 'How much is it?'] },
    reviewRules: { newWordReviewAfterMinutes: 10, ifWrong: 'Nếu sai câu nghe, hiện lại câu có đồ uống/kích cỡ trong phiên học.', ifCorrectTwice: 'Nếu đúng 2 lần, chuyển sang phản xạ gọi món.', ifCorrectThreeTimesAcrossSessions: 'Nếu đúng 3 phiên, đánh dấu cụm gọi món là đã quen.', priorityRule: 'Ưu tiên cụm gọi món lịch sự trước từ đơn.' },
    completionCriteria: { flashcardsReviewed: 10, minimumQuizCorrect: 4, totalQuizQuestions: 5, minimumReflexPromptsCompleted: 3, totalReflexPrompts: 5, minimumListeningOrDialogueRepeats: 3 },
  },
  {
    id: 'unit-2-family-and-friends',
    unitId: 'unit-2-family-friends',
    unitTitle: 'Unit 2 — Gia đình và bạn bè',
    titleVi: 'Gia đình và bạn bè',
    titleEn: 'Family and Friends',
    subtitle: 'Học cách giới thiệu người thân, bạn bè, hỏi quan hệ và mô tả người quen bằng câu A1 ngắn.',
    level: 'Beginner / A1',
    estimatedTime: '35–45 phút',
    skillTags: ['Từ vựng', 'Phản xạ', 'Nghe', 'Nói', 'Ngữ pháp', 'Ôn tập'],
    learningObjectives: [
      'Gọi tên các thành viên gia đình cơ bản như father, mother, brother, sister và parents.',
      'Giới thiệu người thân hoặc bạn bè bằng mẫu “This is my...”.',
      'Hỏi và trả lời quan hệ bằng “Who is this?” và “This is my sister.”',
      'Hỏi tên người thân/bạn bè bằng chunk “What is your brother’s name?”.',
      'Mô tả người thân/bạn bè bằng tính từ A1 như kind, funny, friendly và tall.',
      'Nhận biết và dùng đơn giản my, your, his, her trong cụm cố định.',
      'Nói tuổi đơn giản bằng “years old”.',
      'Nối Unit 1 với câu giới thiệu người đi cùng: “Hi, I’m Lan. This is my friend, Mai.”',
    ],
    vocabulary: unit2Vocabulary,
    sentencePatterns: [
      { id: 'u2-pattern-this-is-my', pattern: 'This is my + person.', vietnameseExplanation: 'Dùng để giới thiệu một người thân hoặc bạn bè. Người mới chỉ cần thay person bằng mother, brother, friend...', examples: [{ text: 'This is my mother.', meaningVi: 'Đây là mẹ của tôi.' }, { text: 'This is my brother.', meaningVi: 'Đây là anh/em trai của tôi.' }, { text: 'This is my friend, Mai.', meaningVi: 'Đây là bạn tôi, Mai.' }] },
      { id: 'u2-pattern-who-is-this', pattern: 'A: Who is this? / B: This is my + person.', vietnameseExplanation: 'Dùng khi hỏi “Đây là ai?” trong ảnh hoặc khi giới thiệu người đứng gần mình.', examples: [{ speaker: 'A', text: 'Who is this?', meaningVi: 'Đây là ai?' }, { speaker: 'B', text: 'This is my sister.', meaningVi: 'Đây là chị/em gái của tôi.' }] },
      { id: 'u2-pattern-his-her-name', pattern: 'His name is + name. / Her name is + name.', vietnameseExplanation: 'Học his/her như cụm nói tên của nam/nữ, không cần phân tích ngữ pháp sâu ở Unit 2.', examples: [{ text: 'His name is Nam.', meaningVi: 'Tên của anh ấy là Nam.' }, { text: 'Her name is Linh.', meaningVi: 'Tên của cô ấy là Linh.' }] },
      { id: 'u2-pattern-person-name', pattern: 'What is your + person’s + name? / My + person’s + name is + name.', vietnameseExplanation: 'Dùng possessive ’s như một chunk cố định để hỏi và trả lời tên người thân.', examples: [{ text: 'What is your brother’s name?', meaningVi: 'Tên anh/em trai bạn là gì?' }, { text: 'My brother’s name is Minh.', meaningVi: 'Tên anh/em trai tôi là Minh.' }] },
      { id: 'u2-pattern-description', pattern: 'My + person + is + adjective.', vietnameseExplanation: 'Dùng để mô tả rất ngắn về tính cách hoặc ngoại hình cơ bản.', examples: [{ text: 'My mom is kind.', meaningVi: 'Mẹ tôi tốt bụng.' }, { text: 'My friend is funny.', meaningVi: 'Bạn tôi vui tính.' }, { text: 'My brother is tall.', meaningVi: 'Anh/em trai tôi cao.' }] },
      { id: 'u2-pattern-age', pattern: 'My + person + is + number + years old.', vietnameseExplanation: 'Dùng để nói tuổi. Unit 2 chỉ luyện vài số quen thuộc, không biến thành bài học số đếm.', examples: [{ text: 'My sister is eight years old.', meaningVi: 'Chị/em gái tôi tám tuổi.' }, { text: 'My brother is ten years old.', meaningVi: 'Anh/em trai tôi mười tuổi.' }] },
    ],
    miniDialogues: [
      { id: 'u2-dialogue-introducing-friend', title: 'Giới thiệu bạn', lines: [{ speaker: 'A', text: 'Hi, I’m Lan.' }, { speaker: 'B', text: 'Hi, Lan. Who is this?' }, { speaker: 'A', text: 'This is my friend, Mai.' }, { speaker: 'B', text: 'Nice to meet you, Mai.' }, { speaker: 'A', text: 'Nice to meet you too.' }], vietnameseTranslation: ['A: Chào, mình là Lan.', 'B: Chào Lan. Đây là ai?', 'A: Đây là bạn mình, Mai.', 'B: Rất vui được gặp bạn, Mai.', 'A: Mình cũng rất vui được gặp bạn.'], focusPhrases: ['Who is this?', 'This is my friend, ...', 'Nice to meet you'], suggestedShadowingInstruction: 'Lặp lại từng câu 3 lần, nối mượt từ Unit 1 “Hi, I’m...” sang “This is my friend...”.' },
      { id: 'u2-dialogue-family', title: 'Nói về gia đình', lines: [{ speaker: 'A', text: 'Is this your family?' }, { speaker: 'B', text: 'Yes, this is my family.' }, { speaker: 'A', text: 'Who is this?' }, { speaker: 'B', text: 'This is my mother. Her name is Hoa.' }], vietnameseTranslation: ['A: Đây là gia đình của bạn à?', 'B: Vâng, đây là gia đình của tôi.', 'A: Đây là ai?', 'B: Đây là mẹ tôi. Tên của mẹ là Hoa.'], focusPhrases: ['This is my family', 'Who is this?', 'Her name is...'], suggestedShadowingInstruction: 'Nhấn nhẹ vào family, mother và Hoa; không đọc rời từng từ trong “Her name is”.' },
      { id: 'u2-dialogue-brother-sister', title: 'Anh/em trai và chị/em gái', lines: [{ speaker: 'A', text: 'Do you have a brother?' }, { speaker: 'B', text: 'Yes, I do. This is my brother.' }, { speaker: 'A', text: 'What is his name?' }, { speaker: 'B', text: 'His name is Minh.' }], vietnameseTranslation: ['A: Bạn có anh/em trai không?', 'B: Có. Đây là anh/em trai của tôi.', 'A: Tên của anh ấy là gì?', 'B: Tên của anh ấy là Minh.'], focusPhrases: ['Do you have a brother?', 'Yes, I do.', 'His name is...'], suggestedShadowingInstruction: 'Chỉ cần học “Do you have...” như một chunk hỏi có/không; trả lời nhanh “Yes, I do.”.' },
      { id: 'u2-dialogue-description', title: 'Mô tả bạn thân', lines: [{ speaker: 'A', text: 'Who is this?' }, { speaker: 'B', text: 'This is my best friend, Nam.' }, { speaker: 'A', text: 'What is he like?' }, { speaker: 'B', text: 'He is funny and friendly.' }], vietnameseTranslation: ['A: Đây là ai?', 'B: Đây là bạn thân của tôi, Nam.', 'A: Bạn ấy là người như thế nào?', 'B: Bạn ấy vui tính và thân thiện.'], focusPhrases: ['best friend', 'What is he like?', 'funny and friendly'], suggestedShadowingInstruction: 'Luyện cụm “funny and friendly” liền mạch; đây là phần mở rộng, không cần nói quá nhanh.' },
    ],
    grammarNotes: [
      { id: 'u2-grammar-this-is', title: 'This is...', explanationVi: 'Dùng “This is...” để giới thiệu một người ở gần hoặc trong ảnh. Unit 2 chưa cần phân biệt sâu this/that.', examples: ['This is my father.', 'This is my friend.'] },
      { id: 'u2-grammar-possessive-adjectives', title: 'my / your / his / her', explanationVi: 'Đây là các từ sở hữu cơ bản: my mother = mẹ của tôi, your sister = chị/em gái của bạn, his name = tên của anh ấy, her name = tên của cô ấy.', examples: ['my mother', 'your sister', 'his name', 'her name'] },
      { id: 'u2-grammar-simple-be', title: 'Simple be: is / are', explanationVi: 'Unit 2 tập trung vào “This is...”, “He is...”, “She is...”. “They are my parents” chỉ cần nhận biết ở mức cơ bản.', examples: ['This is my mom.', 'He is funny.', 'She is kind.', 'They are my parents.'] },
      { id: 'u2-grammar-possessive-s', title: 'Possessive ’s', explanationVi: 'Học như một cụm: “My brother’s name is Minh.” Không mở rộng sang sở hữu phức tạp ở bài này.', examples: ['My brother’s name is Minh.', 'My sister’s name is Hoa.'] },
      { id: 'u2-grammar-do-you-have', title: 'Do you have...?', explanationVi: 'Dạy nhận biết và trả lời ngắn. “Do you have a brother?” nghĩa là “Bạn có anh/em trai không?”.', examples: ['Do you have a brother? — Yes, I do.', 'Do you have a sister? — No, I don’t.'] },
    ],
    pronunciationNotes: [
      { id: 'u2-pron-family', noteVi: '“family” thường đọc gọn thành 2–3 nhịp. Đừng kéo dài âm cuối.', examples: ['This is my family.'] },
      { id: 'u2-pron-brother-mother', noteVi: 'mother, father, brother có âm /ð/. Đặt lưỡi nhẹ giữa răng rồi thổi âm mềm.', examples: ['my mother', 'my father', 'my brother'] },
      { id: 'u2-pron-this-is-my', noteVi: 'Luyện “This is my...” như một cụm liền, không dừng sau từng từ.', examples: ['This is my sister.', 'This is my friend.'] },
      { id: 'u2-pron-his-her', noteVi: '“his” và “her” đọc ngắn, nhẹ trong cụm “His name is...” và “Her name is...”.', examples: ['His name is Nam.', 'Her name is Linh.'] },
    ],
    listeningPractice: [
      { id: 'u2-listening-family', text: 'This is my family.', question: 'What is the speaker showing?', options: ['family', 'school', 'teacher', 'book'], answer: 'family', speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 } },
      { id: 'u2-listening-mother-hoa', text: 'This is my mother. Her name is Hoa.', question: 'Who is Hoa?', options: ['mother', 'brother', 'friend', 'classmate'], answer: 'mother', speechSynthesis: { lang: 'en-US', rate: 0.88, repeatRecommended: 3 } },
      { id: 'u2-listening-brother-minh', text: 'My brother’s name is Minh.', question: 'What is the brother’s name?', options: ['Minh', 'Nam', 'Mai', 'Lan'], answer: 'Minh', speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 } },
      { id: 'u2-listening-friend-funny', text: 'My friend is funny and friendly.', question: 'What is the friend like?', options: ['funny and friendly', 'old and tall', 'young and quiet', 'kind and old'], answer: 'funny and friendly', speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 } },
      { id: 'u2-listening-sister-age', text: 'My sister is eight years old.', question: 'How old is the sister?', options: ['eight', 'ten', 'six', 'twelve'], answer: 'eight', speechSynthesis: { lang: 'en-US', rate: 0.88, repeatRecommended: 3 } },
    ],
    speakingReflexPrompts: [
      { id: 'u2-reflex-this-is-my-mother', promptVi: 'Nói: Đây là mẹ của tôi.', expectedEnglish: 'This is my mother.', acceptableAnswers: ['This is my mother.', 'This is my mom.'], hint: 'Dùng This is my...', difficulty: 'easy' },
      { id: 'u2-reflex-who-is-this', promptVi: 'Hỏi: Đây là ai?', expectedEnglish: 'Who is this?', acceptableAnswers: ['Who is this?', 'Who’s this?'], hint: 'Bắt đầu bằng Who.', difficulty: 'easy' },
      { id: 'u2-reflex-this-is-my-friend', promptVi: 'Nói: Đây là bạn của tôi, Mai.', expectedEnglish: 'This is my friend, Mai.', acceptableAnswers: ['This is my friend, Mai.', 'This is my friend Mai.'], hint: 'This is my friend + tên.', difficulty: 'easy' },
      { id: 'u2-reflex-her-name-is-linh', promptVi: 'Nói: Tên của cô ấy là Linh.', expectedEnglish: 'Her name is Linh.', acceptableAnswers: ['Her name is Linh.'], hint: 'Dùng Her name is...', difficulty: 'medium' },
      { id: 'u2-reflex-his-name-is-minh', promptVi: 'Nói: Tên của anh ấy là Minh.', expectedEnglish: 'His name is Minh.', acceptableAnswers: ['His name is Minh.'], hint: 'Dùng His name is...', difficulty: 'medium' },
      { id: 'u2-reflex-my-mom-kind', promptVi: 'Nói: Mẹ tôi tốt bụng.', expectedEnglish: 'My mom is kind.', acceptableAnswers: ['My mom is kind.', 'My mother is kind.'], hint: 'My mom is + tính từ.', difficulty: 'easy' },
      { id: 'u2-reflex-brother-age', promptVi: 'Nói: Anh/em trai tôi mười tuổi.', expectedEnglish: 'My brother is ten years old.', acceptableAnswers: ['My brother is ten years old.'], hint: 'Dùng years old ở cuối câu.', difficulty: 'medium' },
      { id: 'u2-reflex-do-you-have-brother', promptVi: 'Hỏi: Bạn có anh/em trai không?', expectedEnglish: 'Do you have a brother?', acceptableAnswers: ['Do you have a brother?'], hint: 'Dùng chunk Do you have...', difficulty: 'medium' },
    ],
    flashcards: unit2Vocabulary.map((item) => ({ id: `flashcard-${item.id}`, front: item.term, back: item.meaningVi, example: item.example, exampleMeaningVi: item.exampleMeaningVi, tags: item.tags })),
    quizQuestions: [
      { id: 'u2-quiz-family-meaning', type: 'multiple-choice', question: '“family” nghĩa là gì?', options: ['gia đình', 'bạn cùng lớp', 'giáo viên', 'tạm biệt'], answer: 'gia đình', explanationVi: '“family” là danh từ chỉ gia đình.' },
      { id: 'u2-quiz-this-is-my-mother', type: 'multiple-choice', question: 'Câu nào nghĩa là “Đây là mẹ của tôi”?', options: ['This is my mother.', 'Her name is mother.', 'My mother this is.', 'Who is this mother?'], answer: 'This is my mother.', explanationVi: 'Mẫu giới thiệu đúng là This is my + người.' },
      { id: 'u2-quiz-who-is-this', type: 'multiple-choice', question: '“Who is this?” nghĩa là gì?', options: ['Đây là ai?', 'Bạn tên gì?', 'Bạn từ đâu đến?', 'Bạn có khỏe không?'], answer: 'Đây là ai?', explanationVi: 'Who is this? dùng để hỏi người này là ai.' },
      { id: 'u2-quiz-her-name', type: 'fill-blank', prompt: '___ name is Linh.', answer: 'Her', explanationVi: 'Dùng “Her name is...” để nói tên của cô ấy.' },
      { id: 'u2-quiz-his-name', type: 'fill-blank', prompt: '___ name is Minh.', answer: 'His', explanationVi: 'Dùng “His name is...” để nói tên của anh ấy.' },
      { id: 'u2-quiz-brother-order', type: 'sentence-order', vietnamese: 'Đây là anh/em trai của tôi.', words: ['This', 'is', 'my', 'brother'], answer: 'This is my brother', explanationVi: 'Thứ tự đúng là This + is + my + brother.' },
      { id: 'u2-quiz-years-old', type: 'multiple-choice', question: '“She is eight years old.” nghĩa là gì?', options: ['Cô ấy tám tuổi.', 'Cô ấy tốt bụng.', 'Cô ấy là em gái tôi.', 'Tên cô ấy là Hoa.'], answer: 'Cô ấy tám tuổi.', explanationVi: 'years old dùng để nói tuổi.' },
      { id: 'u2-quiz-kind-meaning', type: 'multiple-choice', question: '“kind” nghĩa là gì?', options: ['tốt bụng', 'vui tính', 'cao', 'nhỏ'], answer: 'tốt bụng', explanationVi: 'Kind là tính từ mô tả người tốt bụng.' },
      { id: 'u2-quiz-match-friend', type: 'match-meaning', question: 'Ghép nghĩa đúng.', pairs: [{ left: 'best friend', right: 'bạn thân' }, { left: 'classmate', right: 'bạn cùng lớp' }], options: ['bạn thân', 'bạn cùng lớp', 'mẹ', 'ông'], answer: ['best friend = bạn thân', 'classmate = bạn cùng lớp'], explanationVi: 'Đây là các từ mô tả bạn bè trong Unit 2.' },
      { id: 'u2-quiz-do-you-have', type: 'multiple-choice', question: 'Câu nào dùng để hỏi “Bạn có anh/em trai không?”', options: ['Do you have a brother?', 'This is my brother.', 'His name is Minh.', 'My brother is ten.'], answer: 'Do you have a brother?', explanationVi: 'Do you have...? là chunk hỏi có/không.' },
    ],
    sentenceOrderingTasks: [
      { id: 'u2-order-this-is-my-sister', vietnamese: 'Đây là chị/em gái của tôi.', words: ['This', 'is', 'my', 'sister'], answer: 'This is my sister' },
      { id: 'u2-order-who-is-this', vietnamese: 'Đây là ai?', words: ['Who', 'is', 'this'], answer: 'Who is this' },
      { id: 'u2-order-her-name-is-linh', vietnamese: 'Tên của cô ấy là Linh.', words: ['Her', 'name', 'is', 'Linh'], answer: 'Her name is Linh' },
      { id: 'u2-order-my-friend-funny', vietnamese: 'Bạn tôi vui tính.', words: ['My', 'friend', 'is', 'funny'], answer: 'My friend is funny' },
    ],
    fillBlankTasks: [
      { id: 'u2-blank-this-is-my', prompt: 'This is ___ mother.', answer: 'my', hint: 'Dùng tính từ sở hữu my.' },
      { id: 'u2-blank-who-is-this', prompt: 'Who ___ this?', answer: 'is', hint: 'Câu hỏi đúng là Who is this?' },
      { id: 'u2-blank-her-name', prompt: 'Her ___ is Hoa.', answer: 'name', hint: 'Cụm Her name is...' },
      { id: 'u2-blank-years-old', prompt: 'My sister is eight years ___.', answer: 'old', hint: 'Cụm nói tuổi là years old.' },
      { id: 'u2-blank-do-you-have', prompt: 'Do you ___ a brother?', answer: 'have', hint: 'Dùng chunk Do you have...?' },
    ],
    reviewRules: {
      newWordReviewAfterMinutes: 10,
      ifWrong: 'Nếu trả lời sai, ưu tiên hiển thị lại các chunk “This is my...”, “his/her name is...” trong cùng phiên.',
      ifCorrectTwice: 'Nếu trả lời đúng 2 lần, đánh dấu từ/cụm là quen thuộc.',
      ifCorrectThreeTimesAcrossSessions: 'Nếu trả lời đúng 3 lần qua nhiều phiên, đánh dấu là đã học.',
      priorityRule: 'Ưu tiên luyện chunk giới thiệu người thân/bạn bè trước khi mở rộng tính từ mô tả.',
    },
    completionCriteria: {
      flashcardsReviewed: 20,
      minimumQuizCorrect: 8,
      totalQuizQuestions: 10,
      minimumReflexPromptsCompleted: 5,
      totalReflexPrompts: 8,
      minimumListeningOrDialogueRepeats: 3,
    },
  },
  {
    id: 'unit-3-school-and-classroom',
    unitId: 'unit-3-school',
    unitTitle: 'Unit 3 — Trường học và lớp học',
    titleVi: 'Trường học và lớp học',
    titleEn: 'School and Classroom',
    subtitle: 'Học từ vựng lớp học, môn học, đồ dùng học tập và các câu hỏi thường gặp ở trường.',
    level: 'Beginner / A1',
    estimatedTime: '35–45 phút',
    skillTags: ['Từ vựng', 'Phản xạ', 'Nghe', 'Nói', 'Đọc', 'Viết', 'Ôn tập'],
    learningObjectives: [
      'Gọi tên ít nhất 20 từ/cụm về trường học và lớp học.',
      'Nói được câu đơn giản như “This is my classroom.” và “I have English on Monday.”',
      'Hỏi và trả lời về đồ dùng học tập như notebook, pencil, school bag.',
      'Nói về bài tập về nhà, bài kiểm tra và câu hỏi trong lớp.',
      'Mượn đồ dùng lớp học bằng câu lịch sự “Can I borrow your pencil?”.',
      'Nghe và nhận diện các câu A1 ngắn trong ngữ cảnh trường học.',
    ],
    vocabulary: unit3Vocabulary,
    sentencePatterns: [
      { id: 'u3-pattern-this-is-classroom', pattern: 'This is my classroom.', vietnameseExplanation: 'Dùng để giới thiệu lớp học/phòng học của mình. Đây là câu mẫu rất an toàn cho A1.', examples: [{ text: 'This is my classroom.', meaningVi: 'Đây là lớp học của tôi.' }, { text: 'This is our classroom.', meaningVi: 'Đây là lớp học của chúng tôi.' }] },
      { id: 'u3-pattern-have-subject-on-day', pattern: 'I have + subject + on + day.', vietnameseExplanation: 'Dùng để nói bạn có môn học nào vào ngày nào. Học cả cụm “I have English on Monday”.', examples: [{ text: 'I have English on Monday.', meaningVi: 'Tôi có môn tiếng Anh vào thứ Hai.' }, { text: 'I have math on Tuesday.', meaningVi: 'Tôi có môn toán vào thứ Ba.' }] },
      { id: 'u3-pattern-where-is-your', pattern: 'Where is your + school item?', vietnameseExplanation: 'Dùng để hỏi đồ dùng học tập ở đâu. Với một vật số ít, dùng “Where is...?”.', examples: [{ text: 'Where is your notebook?', meaningVi: 'Vở của bạn ở đâu?' }, { text: 'Where is your school bag?', meaningVi: 'Cặp sách của bạn ở đâu?' }] },
      { id: 'u3-pattern-can-you-help', pattern: 'Can you help me with this question?', vietnameseExplanation: 'Dùng khi cần bạn hoặc giáo viên giúp với một câu hỏi. Đây là câu lịch sự và rất hữu ích trong lớp.', examples: [{ text: 'Can you help me with this question?', meaningVi: 'Bạn có thể giúp mình câu hỏi này không?' }, { text: 'Can you help me with my homework?', meaningVi: 'Bạn có thể giúp mình bài tập về nhà không?' }] },
      { id: 'u3-pattern-need-homework', pattern: 'I need to do my homework.', vietnameseExplanation: 'Dùng “need to + verb” để nói điều cần làm. Ở Unit 3 chỉ cần nhớ cụm này.', examples: [{ text: 'I need to do my homework.', meaningVi: 'Tôi cần làm bài tập về nhà.' }, { text: 'I need to study for the test.', meaningVi: 'Tôi cần học cho bài kiểm tra.' }] },
      { id: 'u3-pattern-can-i-borrow', pattern: 'Can I borrow your + item?', vietnameseExplanation: 'Dùng để mượn đồ một cách lịch sự. “borrow” là mượn từ người khác.', examples: [{ text: 'Can I borrow your pencil?', meaningVi: 'Mình mượn bút chì của bạn được không?' }, { text: 'Can I borrow your notebook?', meaningVi: 'Mình mượn vở của bạn được không?' }] },
      { id: 'u3-pattern-look-at-board', pattern: 'Look at the board.', vietnameseExplanation: 'Câu mệnh lệnh ngắn thường nghe trong lớp. Học như một cụm nghe-nói.', examples: [{ text: 'Look at the board.', meaningVi: 'Hãy nhìn lên bảng.' }, { text: 'Please look at the board.', meaningVi: 'Làm ơn nhìn lên bảng.' }] },
      { id: 'u3-pattern-favorite-subject', pattern: 'My favorite subject is + subject.', vietnameseExplanation: 'Dùng để nói môn học yêu thích. “favorite subject” là cụm nên học liền.', examples: [{ text: 'My favorite subject is English.', meaningVi: 'Môn học yêu thích của tôi là tiếng Anh.' }, { text: 'My favorite subject is math.', meaningVi: 'Môn học yêu thích của tôi là toán.' }] },
    ],
    miniDialogues: [
      { id: 'u3-dialogue-subjects', title: 'Hỏi về môn học', lines: [{ speaker: 'A', text: 'What subject do you have today?' }, { speaker: 'B', text: 'I have English and math.' }, { speaker: 'A', text: 'Do you like English?' }, { speaker: 'B', text: 'Yes, it is my favorite subject.' }], vietnameseTranslation: ['A: Hôm nay bạn có môn gì?', 'B: Mình có tiếng Anh và toán.', 'A: Bạn thích tiếng Anh không?', 'B: Có, đó là môn học yêu thích của mình.'], focusPhrases: ['What subject do you have today?', 'I have English and math.', 'favorite subject'], suggestedShadowingInstruction: 'Luyện nhịp câu hỏi “What subject do you have today?” chậm trước, sau đó trả lời nhanh bằng “I have...”.' },
      { id: 'u3-dialogue-borrow-pencil', title: 'Mượn đồ dùng trong lớp', lines: [{ speaker: 'A', text: 'Can I borrow your pencil?' }, { speaker: 'B', text: 'Sure. Here you are.' }, { speaker: 'A', text: 'Thank you.' }, { speaker: 'B', text: 'You are welcome.' }], vietnameseTranslation: ['A: Mình mượn bút chì của bạn được không?', 'B: Được chứ. Của bạn đây.', 'A: Cảm ơn bạn.', 'B: Không có gì.'], focusPhrases: ['Can I borrow your pencil?', 'Here you are.', 'Thank you'], suggestedShadowingInstruction: 'Nói “Can I borrow...” nhẹ và lịch sự; luyện cả cụm “Here you are” như một phản xạ.' },
      { id: 'u3-dialogue-homework', title: 'Nói về bài tập về nhà', lines: [{ speaker: 'A', text: 'Do we have homework today?' }, { speaker: 'B', text: 'Yes, we do.' }, { speaker: 'A', text: 'Can you help me with this question?' }, { speaker: 'B', text: 'Sure. Let’s do it together.' }], vietnameseTranslation: ['A: Hôm nay chúng ta có bài tập về nhà không?', 'B: Có.', 'A: Bạn có thể giúp mình câu hỏi này không?', 'B: Được chứ. Cùng làm nhé.'], focusPhrases: ['Do we have homework today?', 'Can you help me with this question?', 'Let’s do it together'], suggestedShadowingInstruction: 'Luyện “Do we have homework today?” như một câu liền; đừng tách từng từ khi nói.' },
    ],
    grammarNotes: [
      { id: 'u3-grammar-this-is', title: 'This is... để giới thiệu đồ vật/nơi chốn', explanationVi: 'Dùng “This is...” để nói “Đây là...”. Ở Unit 3, dùng với classroom, desk, board, notebook.', examples: ['This is my classroom.', 'This is my desk.'] },
      { id: 'u3-grammar-have-subject', title: 'I have + môn học', explanationVi: 'Trong lịch học, “I have English” nghĩa là “Tôi có môn tiếng Anh”. Không dịch là “sở hữu”.', examples: ['I have English on Monday.', 'We have a test today.'] },
      { id: 'u3-grammar-can-i-borrow', title: 'Can I borrow...?', explanationVi: 'Dùng “Can I borrow...?” để xin mượn đồ lịch sự trong lớp.', examples: ['Can I borrow your pencil?', 'Can I borrow your notebook?'] },
      { id: 'u3-grammar-need-to', title: 'need to + động từ', explanationVi: '“I need to do...” nghĩa là “Tôi cần làm...”. Unit 3 tập trung vào “I need to do my homework”.', examples: ['I need to do my homework.', 'I need to study for the test.'] },
    ],
    pronunciationNotes: [
      { id: 'u3-pron-classroom', noteVi: '“classroom” có thể nghe như một cụm /klæs-ruːm/. Đọc rõ âm /kl/ đầu từ.', examples: ['This is my classroom.'] },
      { id: 'u3-pron-question', noteVi: '“question” có âm đầu /kw/. Luyện chậm: question, this question.', examples: ['I have a question.', 'Can you help me with this question?'] },
      { id: 'u3-pron-borrow', noteVi: '“borrow” nhấn âm đầu: BOR-row. Đọc gọn trong câu “Can I borrow your pencil?”.', examples: ['Can I borrow your pencil?'] },
      { id: 'u3-pron-homework', noteVi: '“homework” là một từ ghép, nhấn nhẹ ở “home”.', examples: ['I need to do my homework.'] },
    ],
    listeningPractice: [
      { id: 'u3-listening-classroom', text: 'This is my classroom.', question: 'What is the speaker talking about?', options: ['classroom', 'library', 'school bag', 'uniform'], answer: 'classroom', speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 } },
      { id: 'u3-listening-english-monday', text: 'I have English on Monday.', question: 'What subject does the speaker have on Monday?', options: ['English', 'math', 'science', 'music'], answer: 'English', speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 } },
      { id: 'u3-listening-borrow-pencil', text: 'Can I borrow your pencil?', question: 'What does the speaker want to borrow?', options: ['pencil', 'notebook', 'desk', 'board'], answer: 'pencil', speechSynthesis: { lang: 'en-US', rate: 0.88, repeatRecommended: 3 } },
      { id: 'u3-listening-homework', text: 'I need to do my homework.', question: 'What does the speaker need to do?', options: ['homework', 'break time', 'uniform', 'timetable'], answer: 'homework', speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 } },
      { id: 'u3-listening-question', text: 'Can you help me with this question?', question: 'What does the speaker need help with?', options: ['a question', 'a school bag', 'a uniform', 'a library'], answer: 'a question', speechSynthesis: { lang: 'en-US', rate: 0.9, repeatRecommended: 3 } },
    ],
    speakingReflexPrompts: [
      { id: 'u3-reflex-this-classroom', promptVi: 'Nói: Đây là lớp học của tôi.', expectedEnglish: 'This is my classroom.', acceptableAnswers: ['This is my classroom.', 'This is our classroom.'], hint: 'Dùng This is my...', difficulty: 'easy' },
      { id: 'u3-reflex-english-monday', promptVi: 'Nói: Tôi có môn tiếng Anh vào thứ Hai.', expectedEnglish: 'I have English on Monday.', acceptableAnswers: ['I have English on Monday.'], hint: 'I have + subject + on + day.', difficulty: 'medium' },
      { id: 'u3-reflex-where-notebook', promptVi: 'Hỏi: Vở của bạn ở đâu?', expectedEnglish: 'Where is your notebook?', acceptableAnswers: ['Where is your notebook?', 'Where’s your notebook?'], hint: 'Bắt đầu bằng Where is...', difficulty: 'easy' },
      { id: 'u3-reflex-borrow-pencil', promptVi: 'Hỏi mượn bút chì của bạn.', expectedEnglish: 'Can I borrow your pencil?', acceptableAnswers: ['Can I borrow your pencil?', 'May I borrow your pencil?'], hint: 'Dùng Can I borrow...', difficulty: 'medium' },
      { id: 'u3-reflex-help-question', promptVi: 'Nói: Bạn có thể giúp mình câu hỏi này không?', expectedEnglish: 'Can you help me with this question?', acceptableAnswers: ['Can you help me with this question?'], hint: 'Can you help me with...', difficulty: 'medium' },
      { id: 'u3-reflex-homework', promptVi: 'Nói: Tôi cần làm bài tập về nhà.', expectedEnglish: 'I need to do my homework.', acceptableAnswers: ['I need to do my homework.', 'I have to do my homework.'], hint: 'I need to do...', difficulty: 'easy' },
      { id: 'u3-reflex-look-board', promptVi: 'Nói: Hãy nhìn lên bảng.', expectedEnglish: 'Look at the board.', acceptableAnswers: ['Look at the board.', 'Please look at the board.'], hint: 'Look at...', difficulty: 'easy' },
      { id: 'u3-reflex-favorite-subject', promptVi: 'Nói: Môn học yêu thích của tôi là tiếng Anh.', expectedEnglish: 'My favorite subject is English.', acceptableAnswers: ['My favorite subject is English.', 'English is my favorite subject.'], hint: 'My favorite subject is...', difficulty: 'medium' },
    ],
    flashcards: unit3Vocabulary.map((item) => ({ id: `flashcard-${item.id}`, front: item.term, back: item.meaningVi, example: item.example, exampleMeaningVi: item.exampleMeaningVi, tags: item.tags })),
    quizQuestions: [
      { id: 'u3-quiz-classroom-meaning', type: 'multiple-choice', question: '“classroom” nghĩa là gì?', options: ['lớp học', 'thư viện', 'bài kiểm tra', 'đồng phục'], answer: 'lớp học', explanationVi: 'classroom là phòng/lớp học.' },
      { id: 'u3-quiz-teacher-meaning', type: 'multiple-choice', question: '“teacher” nghĩa là gì?', options: ['giáo viên', 'học sinh', 'hiệu trưởng', 'bạn cùng lớp'], answer: 'giáo viên', explanationVi: 'teacher là giáo viên.' },
      { id: 'u3-quiz-where-notebook', type: 'sentence-order', vietnamese: 'Vở của bạn ở đâu?', words: ['Where', 'is', 'your', 'notebook'], answer: 'Where is your notebook', explanationVi: 'Câu hỏi đúng là Where is your notebook?' },
      { id: 'u3-quiz-homework-blank', type: 'fill-blank', prompt: 'I need to do my ___.', answer: 'homework', explanationVi: 'homework là bài tập về nhà.' },
      { id: 'u3-quiz-borrow-pencil', type: 'multiple-choice', question: 'Câu nào dùng để mượn bút chì?', options: ['Can I borrow your pencil?', 'Where is your pencil?', 'This is my pencil.', 'Look at the pencil.'], answer: 'Can I borrow your pencil?', explanationVi: 'Can I borrow...? là cách hỏi mượn lịch sự.' },
      { id: 'u3-quiz-english-monday', type: 'multiple-choice', question: '“I have English on Monday.” nghĩa là gì?', options: ['Tôi có môn tiếng Anh vào thứ Hai.', 'Tôi học ở thư viện.', 'Tôi có bài tập về nhà.', 'Tôi mượn bút chì.'], answer: 'Tôi có môn tiếng Anh vào thứ Hai.', explanationVi: 'I have + môn học + on + ngày.' },
      { id: 'u3-quiz-match-items', type: 'match-meaning', question: 'Ghép nghĩa đúng.', pairs: [{ left: 'desk', right: 'bàn học' }, { left: 'board', right: 'bảng' }], options: ['bàn học', 'bảng', 'thư viện', 'giờ ra chơi'], answer: ['desk = bàn học', 'board = bảng'], explanationVi: 'desk và board là đồ vật thường gặp trong lớp học.' },
      { id: 'u3-quiz-favorite-subject', type: 'fill-blank', prompt: 'My favorite ___ is English.', answer: 'subject', explanationVi: 'favorite subject = môn học yêu thích.' },
      { id: 'u3-quiz-help-question', type: 'multiple-choice', question: 'Câu nào nghĩa là “Bạn có thể giúp mình câu hỏi này không?”', options: ['Can you help me with this question?', 'Can I borrow your notebook?', 'What subject do you have?', 'This is my classroom.'], answer: 'Can you help me with this question?', explanationVi: 'Can you help me with...? dùng để nhờ giúp đỡ.' },
      { id: 'u3-quiz-look-board', type: 'multiple-choice', question: '“Look at the board.” nghĩa là gì?', options: ['Hãy nhìn lên bảng.', 'Hãy mở cặp sách.', 'Hãy làm bài tập.', 'Hãy đến thư viện.'], answer: 'Hãy nhìn lên bảng.', explanationVi: 'board là bảng trong lớp học.' },
    ],
    sentenceOrderingTasks: [
      { id: 'u3-order-this-classroom', vietnamese: 'Đây là lớp học của tôi.', words: ['This', 'is', 'my', 'classroom'], answer: 'This is my classroom' },
      { id: 'u3-order-where-notebook', vietnamese: 'Vở của bạn ở đâu?', words: ['Where', 'is', 'your', 'notebook'], answer: 'Where is your notebook' },
      { id: 'u3-order-borrow-pencil', vietnamese: 'Mình mượn bút chì của bạn được không?', words: ['Can', 'I', 'borrow', 'your', 'pencil'], answer: 'Can I borrow your pencil' },
      { id: 'u3-order-homework', vietnamese: 'Tôi cần làm bài tập về nhà.', words: ['I', 'need', 'to', 'do', 'my', 'homework'], answer: 'I need to do my homework' },
    ],
    fillBlankTasks: [
      { id: 'u3-blank-classroom', prompt: 'This is my ___.', answer: 'classroom', hint: 'Nơi học trong trường.' },
      { id: 'u3-blank-subject', prompt: 'My favorite ___ is English.', answer: 'subject', hint: 'Môn học = subject.' },
      { id: 'u3-blank-homework', prompt: 'I need to do my ___.', answer: 'homework', hint: 'Bài tập về nhà.' },
      { id: 'u3-blank-borrow', prompt: 'Can I ___ your pencil?', answer: 'borrow', hint: 'borrow = mượn.' },
      { id: 'u3-blank-board', prompt: 'Look at the ___.', answer: 'board', hint: 'Bảng trong lớp học.' },
    ],
    reviewRules: {
      newWordReviewAfterMinutes: 10,
      ifWrong: 'Nếu trả lời sai, ưu tiên hiện lại các từ đồ dùng lớp học như notebook, pencil, desk, board trong cùng phiên.',
      ifCorrectTwice: 'Nếu trả lời đúng 2 lần, đánh dấu từ/cụm là quen thuộc.',
      ifCorrectThreeTimesAcrossSessions: 'Nếu trả lời đúng 3 lần qua nhiều phiên, đánh dấu là đã học.',
      priorityRule: 'Ưu tiên chunk giao tiếp lớp học như “Can I borrow...?” và “Can you help me...?” trước khi mở rộng thêm môn học.',
    },
    completionCriteria: {
      flashcardsReviewed: 20,
      minimumQuizCorrect: 8,
      totalQuizQuestions: 10,
      minimumReflexPromptsCompleted: 5,
      totalReflexPrompts: 8,
      minimumListeningOrDialogueRepeats: 3,
    },
  },
];

export const allPEnglishLessons: EnglishLesson[] = [
  ...pEnglishLessons,
  ...generatedGrammarLessons,
  ...generatedReadingLessons,
];

export function getLessonById(id: string): EnglishLesson | undefined {
  return allPEnglishLessons.find((lesson) => lesson.id === id);
}

export function getLessonsByUnitId(unitId: string): EnglishLesson[] {
  return allPEnglishLessons.filter((lesson) => lesson.unitId === unitId);
}
