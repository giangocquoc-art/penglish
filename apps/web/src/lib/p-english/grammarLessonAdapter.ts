import { generatedGrammarLessonSources } from '../../data/grammar/generatedGrammarLessons';
import type { GeneratedGrammarExercise, GeneratedGrammarLevel, GeneratedGrammarLessonSource } from '../../data/grammar/grammarTypes';
import type { EnglishLesson, LessonLevel, QuizQuestion, SentenceOrderingTask, FillBlankTask, MiniDialogue, PronunciationNote, ListeningPracticeItem, SpeakingReflexPrompt, EnglishSpeedPrompt, ShadowingScript } from './lesson-content-data';

function mapLevel(level: GeneratedGrammarLevel): LessonLevel {
  switch (level) {
    case 'A1':
      return 'Beginner / A1';
    case 'A2':
      return 'Elementary / A2';
    case 'B1':
      return 'Intermediate / B1';
    case 'B2':
      return 'Upper-intermediate / B2';
    default:
      return 'Beginner / A1';
  }
}

function toQuizQuestion(exercise: GeneratedGrammarExercise): QuizQuestion | null {
  if (exercise.type !== 'multiple-choice') return null;
  return {
    id: exercise.id,
    type: 'multiple-choice',
    question: exercise.promptVi,
    options: exercise.options ?? [],
    answer: exercise.answer,
    explanationVi: exercise.explanationVi,
  };
}

function toFillBlankTask(exercise: GeneratedGrammarExercise): FillBlankTask | null {
  if (exercise.type !== 'fill-blank') return null;
  return {
    id: exercise.id,
    prompt: exercise.promptEn ?? exercise.promptVi,
    answer: String(exercise.answer),
    hint: exercise.hintVi,
  };
}

function toSentenceOrderingTask(exercise: GeneratedGrammarExercise): SentenceOrderingTask | null {
  if (exercise.type !== 'sentence-order') return null;
  return {
    id: exercise.id,
    vietnamese: exercise.promptVi,
    words: exercise.words ?? String(exercise.answer).split(' '),
    answer: String(exercise.answer),
  };
}

function buildGrammarBridge(source: GeneratedGrammarLessonSource): {
  miniDialogues: MiniDialogue[];
  pronunciationNotes: PronunciationNote[];
  listeningPractice: ListeningPracticeItem[];
  speakingReflexPrompts: SpeakingReflexPrompt[];
  englishSpeedPrompts: EnglishSpeedPrompt[];
  shadowingScript?: ShadowingScript;
} {
  const [firstExample, secondExample, thirdExample, fourthExample, fifthExample] = source.examples;
  const dialogueFirst = firstExample ?? { text: 'I can use this grammar today.', meaningVi: 'Tôi có thể dùng mẫu ngữ pháp này hôm nay.' };
  const dialogueSecond = secondExample ?? dialogueFirst;
  const listeningExample = thirdExample ?? dialogueSecond;
  const transferExample = fourthExample ?? listeningExample;
  const challengeExample = fifthExample ?? transferExample;
  const patternLabel = source.sourcePatternTitle.replace(/\s+/g, ' ').trim();
  const isCoreA2 = source.level === 'A2';
  const bridgeExamples = source.examples.length > 0 ? source.examples : [dialogueFirst, dialogueSecond, listeningExample];
  const listeningExamples = isCoreA2 ? [listeningExample, transferExample] : [listeningExample];
  const reflexExamples = isCoreA2 ? bridgeExamples.slice(0, 4) : bridgeExamples.slice(0, 2);

  return {
    miniDialogues: [
      {
        id: `${source.id}-dialogue-bridge`,
        title: 'Hội thoại nối bài: nghe rồi nói theo mẫu',
        lines: [
          { speaker: 'A', text: dialogueFirst.text },
          { speaker: 'B', text: dialogueSecond.text },
        ],
        vietnameseTranslation: [dialogueFirst.meaningVi, dialogueSecond.meaningVi],
        focusPhrases: bridgeExamples.slice(0, 3).map((example) => example.text),
        suggestedShadowingInstruction: 'Nghe từng câu 2 lần, đọc theo nhịp tự nhiên, sau đó đổi vai A/B và nói lại không nhìn chữ.',
      },
      ...(isCoreA2
        ? [
            {
              id: `${source.id}-dialogue-transfer`,
              title: 'Hội thoại đổi ý: giữ mẫu, thay ngữ cảnh',
              lines: [
                { speaker: 'A' as const, text: transferExample.text },
                { speaker: 'B' as const, text: challengeExample.text },
              ],
              vietnameseTranslation: [transferExample.meaningVi, challengeExample.meaningVi],
              focusPhrases: [transferExample.text, challengeExample.text],
              suggestedShadowingInstruction: 'Lượt 1 nghe hiểu, lượt 2 nói theo cụm, lượt 3 thay thông tin bằng kế hoạch hoặc trải nghiệm của bạn.',
            },
          ]
        : []),
    ],
    pronunciationNotes: [
      {
        id: `${source.id}-pronunciation-bridge`,
        noteVi: `Đọc theo cụm của mẫu “${patternLabel}”: dừng rất ngắn giữa chủ ngữ, cụm động từ và phần bổ sung; không đọc rời từng từ.`,
        examples: bridgeExamples.slice(0, 3).map((example) => example.text),
      },
      ...(isCoreA2
        ? [
            {
              id: `${source.id}-pronunciation-a2-transfer`,
              noteVi: 'A2 cần nói thành câu trọn ý: nhấn nhẹ từ thời gian/so sánh/phủ định, rồi đọc lại câu ở tốc độ hội thoại chậm.',
              examples: [transferExample.text, challengeExample.text],
            },
          ]
        : []),
    ],
    listeningPractice: listeningExamples.map((example, index) => ({
      id: `${source.id}-listening-bridge-${index + 1}`,
      text: example.text,
      question: index === 0 ? `Bạn nghe thấy câu nào dùng mẫu “${patternLabel}”?` : 'Câu vừa nghe phù hợp với nghĩa tiếng Việt nào?',
      options: [example.text, dialogueFirst.text === example.text ? dialogueSecond.text : dialogueFirst.text, 'I will review this sentence slowly.']
        .filter((option, optionIndex, options) => option && options.indexOf(option) === optionIndex)
        .slice(0, 3),
      answer: example.text,
      explanationVi: `Câu đúng là ví dụ nguyên vẹn của bài: ${example.meaningVi}`,
      speechSynthesis: {
        lang: 'en-US',
        rate: source.level === 'A1' || source.level === 'A2' ? 0.82 : 0.9,
        repeatRecommended: isCoreA2 ? 4 : 3,
      },
    })),
    speakingReflexPrompts: reflexExamples.map((example, index) => ({
      id: `${source.id}-reflex-bridge-${index + 1}`,
      promptVi: example.meaningVi,
      expectedEnglish: example.text,
      acceptableAnswers: [example.text],
      hint: `Dùng mẫu: ${patternLabel}; nói cả câu trong ${isCoreA2 ? '3' : '4'} giây.`,
      difficulty: source.level === 'A1' || source.level === 'A2' ? 'easy' : 'medium',
    })),
    englishSpeedPrompts: isCoreA2
      ? bridgeExamples.slice(0, 3).map((example, index) => ({
          id: `${source.id}-speed-bridge-${index + 1}`,
          promptVi: example.meaningVi,
          expectedEnglish: example.text,
          hint: `Nói nhanh theo cụm “${patternLabel}”, không dịch từng từ.`,
        }))
      : [],
    shadowingScript: isCoreA2
      ? {
          id: `${source.id}-shadow-bridge`,
          title: `A2 nói đuổi · ${source.titleEn}`,
          lines: bridgeExamples.slice(0, 4).map((example, index) => ({
            id: `${source.id}-shadow-line-${index + 1}`,
            text: example.text,
            meaningVi: example.meaningVi,
          })),
        }
      : undefined,
  };
}

function adaptGrammarLesson(source: GeneratedGrammarLessonSource): EnglishLesson {
  const quizQuestions = source.exercises.map(toQuizQuestion).filter((question): question is QuizQuestion => Boolean(question));
  const fillBlankTasks = source.exercises.map(toFillBlankTask).filter((task): task is FillBlankTask => Boolean(task));
  const sentenceOrderingTasks = source.exercises.map(toSentenceOrderingTask).filter((task): task is SentenceOrderingTask => Boolean(task));
  const bridge = buildGrammarBridge(source);
  const exampleFlashcards = source.examples.slice(0, 3).map((example, index) => ({
    id: `${source.id}-grammar-card-${index + 1}`,
    front: example.text,
    back: example.meaningVi,
    example: example.text,
    exampleMeaningVi: example.meaningVi,
    tags: ['grammar', source.level, source.source.sourcePatternId],
  }));

  return {
    id: source.id,
    unitId: source.unitId,
    unitTitle: `Ngữ pháp · ${source.level}`,
    titleVi: source.titleVi,
    titleEn: source.titleEn,
    subtitle: source.subtitleVi,
    level: mapLevel(source.level),
    estimatedTime: source.estimatedTime,
    skillTags: ['Ngữ pháp', 'Ôn tập', 'Viết', 'Nghe', 'Nói'],
    learningObjectives: [
      `Hiểu mẫu: ${source.titleVi}.`,
      'Nhận diện vị trí bị che trong câu luyện.',
      'Chọn hoặc gõ đáp án đúng trong câu ngắn.',
      'Tự sửa lỗi bằng gợi ý tiếng Việt sau mỗi câu.',
    ],
    vocabulary: [],
    sentencePatterns: [
      {
        id: `${source.id}-pattern`,
        pattern: source.sourcePatternTitle,
        vietnameseExplanation: source.vietnameseExplanation,
        examples: source.examples.map((example) => ({ text: example.text, meaningVi: example.meaningVi })),
      },
    ],
    miniDialogues: bridge.miniDialogues,
    grammarNotes: [
      {
        id: `${source.id}-note`,
        title: source.titleVi,
        explanationVi: `${source.vietnameseExplanation} Bài này dùng dạng điền chỗ trống: tìm mẫu ngữ pháp trong câu, che phần cần luyện, rồi yêu cầu người học chọn hoặc gõ đáp án.`,
        examples: source.examples.map((example) => example.text),
      },
    ],
    pronunciationNotes: bridge.pronunciationNotes,
    listeningPractice: bridge.listeningPractice,
    speakingReflexPrompts: bridge.speakingReflexPrompts,
    flashcards: exampleFlashcards,
    englishSpeedPrompts: bridge.englishSpeedPrompts,
    shadowingScript: bridge.shadowingScript,
    quizQuestions,
    sentenceOrderingTasks,
    fillBlankTasks,
    commonMistakes: [
      {
        id: `${source.id}-mistake`,
        mistake: 'Dịch từng từ rồi chọn đáp án theo tiếng Việt.',
        correction: 'Nhìn loại từ và vị trí trong câu trước, sau đó chọn theo mẫu tiếng Anh.',
        explanationVi: 'Các bài ngữ pháp đi theo mẫu câu, nên bạn cần nhận diện cấu trúc thay vì đoán nghĩa từng từ.',
      },
    ],
    realLifeSituations: [
      {
        id: `${source.id}-situation`,
        title: 'Dùng trong câu ngắn hằng ngày',
        scenarioVi: 'Gặp mẫu này trong bài đọc, tin nhắn, lớp học hoặc khi tự viết câu ngắn.',
        usefulPhrases: source.examples.map((example) => example.text),
      },
    ],
    gameMissions: [
      {
        id: `${source.id}-mission`,
        title: 'Điền chỗ trống không dịch từng chữ',
        instructionVi: 'Đọc cả câu, xác định vị trí bị che, dùng phím A/B/C/D hoặc Enter để hoàn thành nhanh.',
        successCriteria: 'Trả lời đúng ít nhất 2/3 câu luyện tập của bài.',
      },
    ],
    whaleCoachLines: [
      'Nhìn mẫu trước, dịch sau.',
      'Nếu sai, đọc lại cụm trước và sau chỗ trống.',
      'Enter để kiểm tra; khi đúng, Enter tiếp để sang câu mới.',
    ],
    finalMiniChallenge: {
      id: `${source.id}-challenge`,
      title: 'Tự tạo một câu mới',
      instructionVi: 'Viết một câu rất ngắn dùng đúng mẫu ngữ pháp vừa học.',
      targetOutput: source.examples.slice(0, 2).map((example) => example.text),
    },
    reviewRules: {
      newWordReviewAfterMinutes: 10,
      ifWrong: 'Nếu trả lời sai, đọc lại giải thích và làm lại câu điền chỗ trống ngay trong phiên học.',
      ifCorrectTwice: 'Nếu đúng 2 lần, chuyển sang câu cùng mẫu nhưng ngữ cảnh khác.',
      ifCorrectThreeTimesAcrossSessions: 'Nếu đúng qua nhiều phiên, đánh dấu mẫu ngữ pháp là đã quen.',
      priorityRule: 'Ưu tiên mẫu có lỗi sai gần nhất và mẫu cùng cấp CEFR.',
    },
    completionCriteria: {
      flashcardsReviewed: exampleFlashcards.length,
      minimumQuizCorrect: Math.max(2, quizQuestions.length + fillBlankTasks.length + sentenceOrderingTasks.length - 1),
      totalQuizQuestions: quizQuestions.length + fillBlankTasks.length + sentenceOrderingTasks.length,
      minimumReflexPromptsCompleted: Math.min(source.level === 'A2' ? 2 : 1, bridge.speakingReflexPrompts.length),
      totalReflexPrompts: bridge.speakingReflexPrompts.length,
      minimumListeningOrDialogueRepeats: Math.min(source.level === 'A2' ? 2 : 1, bridge.listeningPractice.length + bridge.miniDialogues.length),
    },
  };
}

export const generatedGrammarLessons: EnglishLesson[] = generatedGrammarLessonSources.map(adaptGrammarLesson);

export function getGeneratedGrammarLessons() {
  return generatedGrammarLessons;
}
