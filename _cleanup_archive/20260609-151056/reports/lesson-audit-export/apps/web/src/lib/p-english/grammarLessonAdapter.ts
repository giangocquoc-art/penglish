import { generatedGrammarLessonSources } from '../../data/grammar/generatedGrammarLessons';
import type { GeneratedGrammarExercise, GeneratedGrammarLevel, GeneratedGrammarLessonSource } from '../../data/grammar/grammarTypes';
import type { EnglishLesson, LessonLevel, QuizQuestion, SentenceOrderingTask, FillBlankTask } from './lesson-content-data';

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

function adaptGrammarLesson(source: GeneratedGrammarLessonSource): EnglishLesson {
  const quizQuestions = source.exercises.map(toQuizQuestion).filter((question): question is QuizQuestion => Boolean(question));
  const fillBlankTasks = source.exercises.map(toFillBlankTask).filter((task): task is FillBlankTask => Boolean(task));
  const sentenceOrderingTasks = source.exercises.map(toSentenceOrderingTask).filter((task): task is SentenceOrderingTask => Boolean(task));
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
    unitTitle: `Grammar · ${source.level}`,
    titleVi: source.titleVi,
    titleEn: source.titleEn,
    subtitle: source.subtitleVi,
    level: mapLevel(source.level),
    estimatedTime: source.estimatedTime,
    skillTags: ['Ngữ pháp', 'Ôn tập', 'Viết'],
    learningObjectives: [
      `Hiểu mẫu: ${source.titleVi}.`,
      'Nhận diện vị trí bị che trong bài cloze theo logic pattern.',
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
    miniDialogues: [],
    grammarNotes: [
      {
        id: `${source.id}-note`,
        title: source.titleVi,
        explanationVi: `${source.vietnameseExplanation} Bài này dùng cách tạo câu hỏi dạng cloze: tìm mẫu ngữ pháp trong câu, che phần cần luyện, rồi yêu cầu người học chọn hoặc gõ đáp án.`,
        examples: source.examples.map((example) => example.text),
      },
    ],
    pronunciationNotes: [],
    listeningPractice: [],
    speakingReflexPrompts: [],
    flashcards: exampleFlashcards,
    quizQuestions,
    sentenceOrderingTasks,
    fillBlankTasks,
    commonMistakes: [
      {
        id: `${source.id}-mistake`,
        mistake: 'Dịch từng từ rồi chọn đáp án theo tiếng Việt.',
        correction: 'Nhìn loại từ và vị trí trong câu trước, sau đó chọn theo mẫu tiếng Anh.',
        explanationVi: 'Các bài grammar được tạo theo pattern, nên người học cần nhận diện cấu trúc thay vì đoán nghĩa từng từ.',
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
        title: 'Hoàn thành cloze không dịch từng chữ',
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
      ifWrong: 'Nếu trả lời sai, đọc lại giải thích và làm lại câu cloze ngay trong phiên học.',
      ifCorrectTwice: 'Nếu đúng 2 lần, chuyển sang câu cùng pattern nhưng ngữ cảnh khác.',
      ifCorrectThreeTimesAcrossSessions: 'Nếu đúng qua nhiều phiên, đánh dấu mẫu grammar là đã quen.',
      priorityRule: 'Ưu tiên mẫu có lỗi sai gần nhất và mẫu cùng cấp CEFR.',
    },
    completionCriteria: {
      flashcardsReviewed: exampleFlashcards.length,
      minimumQuizCorrect: Math.max(2, quizQuestions.length + fillBlankTasks.length + sentenceOrderingTasks.length - 1),
      totalQuizQuestions: quizQuestions.length + fillBlankTasks.length + sentenceOrderingTasks.length,
      minimumReflexPromptsCompleted: 0,
      totalReflexPrompts: 0,
      minimumListeningOrDialogueRepeats: 0,
    },
  };
}

export const generatedGrammarLessons: EnglishLesson[] = generatedGrammarLessonSources.map(adaptGrammarLesson);

export function getGeneratedGrammarLessons() {
  return generatedGrammarLessons;
}
