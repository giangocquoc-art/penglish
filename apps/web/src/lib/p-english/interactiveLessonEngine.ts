import type {
  EnglishLesson,
  FillBlankTask,
  FlashcardItem,
  ListeningPracticeItem,
  QuizQuestion,
  SentenceOrderingTask,
  SpeakingReflexPrompt,
  VocabularyItem,
} from './lesson-content-data';
import { getLessonById } from './lesson-content-data';
import { getUnifiedLessonEntry } from './unifiedLessonEngine';
import { recordLearningLoopActivity, recordLearningLoopMistake, resolveLearningLoopMistake, upsertLearningLoopWords } from './learning-loop';
import { markItemReviewed, markLessonCompleted, markLessonStarted, markLessonStepCompleted } from './lesson-progress';
import { recordLearningActivity } from './daily-rewards';
import { saveWordReviewStatus } from './vocabulary-review';

export type InteractiveLessonStepType =
  | 'intro'
  | 'flashcard'
  | 'multiple_choice'
  | 'fill_blank'
  | 'sentence_order'
  | 'listen_choose'
  | 'speak_repeat'
  | 'summary';

export type InteractiveLessonStep = {
  id: string;
  type: InteractiveLessonStepType;
  title: string;
  instruction: string;
  prompt?: string;
  answer?: string;
  options?: string[];
  words?: string[];
  english?: string;
  vietnamese?: string;
  hint?: string;
  explanation?: string;
  vocabularyId?: string;
  sourceItemId?: string;
  srsType?: 'flashcard' | 'quiz' | 'listening' | 'reflex' | 'typing' | 'match' | 'speed';
};

export type InteractiveLesson = {
  id: string;
  unitId: string;
  nodeId?: string;
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  xp: number;
  steps: InteractiveLessonStep[];
  sourceLesson: EnglishLesson;
};

export type InteractiveLessonResult = {
  lessonId: string;
  unitId: string;
  xp: number;
  correctCount: number;
  totalAnswered: number;
  weakItems: InteractiveLessonStep[];
};

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, 4);
}

function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function answerToText(answer: QuizQuestion['answer']) {
  return Array.isArray(answer) ? answer[0] ?? '' : answer;
}

function stepFromVocabulary(item: VocabularyItem, index: number): InteractiveLessonStep {
  return {
    id: `flashcard-${item.id}-${index}`,
    type: 'flashcard',
    title: index === 0 ? 'Học cụm đầu tiên' : 'Ghi nhớ thêm một cụm',
    instruction: 'Nhìn từ/cụm, nghe Poo đọc, rồi bấm “Đã nhớ” để qua màn tiếp theo.',
    prompt: item.term,
    english: item.example,
    vietnamese: item.meaningVi,
    hint: item.pronunciation,
    explanation: item.exampleMeaningVi,
    vocabularyId: item.id,
    sourceItemId: item.id,
    srsType: 'flashcard',
  };
}

function stepFromFlashcard(item: FlashcardItem, index: number): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'flashcard',
    title: index === 0 ? 'Học cụm quan trọng' : 'Ôn nhanh bằng flashcard',
    instruction: 'Đọc mặt trước, đoán nghĩa, nghe câu mẫu rồi tiếp tục.',
    prompt: item.front,
    answer: item.back,
    english: item.example,
    vietnamese: item.exampleMeaningVi,
    explanation: item.back,
    sourceItemId: item.id,
    srsType: 'flashcard',
  };
}

function stepFromQuiz(item: QuizQuestion, index: number, fallbackOptions: string[]): InteractiveLessonStep {
  const answer = answerToText(item.answer);
  const prompt = item.type === 'fill-blank' ? item.prompt ?? item.question : item.question;
  const type: InteractiveLessonStepType = item.type === 'fill-blank' ? 'fill_blank' : item.type === 'sentence-order' ? 'sentence_order' : 'multiple_choice';
  return {
    id: item.id,
    type,
    title: index === 0 ? 'Chọn đáp án đúng' : type === 'fill_blank' ? 'Điền từ còn thiếu' : type === 'sentence_order' ? 'Sắp xếp câu' : 'Mini test',
    instruction: type === 'fill_blank' ? 'Gõ phần còn thiếu trong câu.' : type === 'sentence_order' ? 'Chạm các từ theo đúng thứ tự.' : 'Chọn một đáp án. Poo sẽ góp ý ngay.',
    prompt,
    answer,
    options: item.options?.length ? uniqueOptions([answer, ...item.options]) : uniqueOptions([answer, ...fallbackOptions]),
    words: item.type === 'sentence-order' ? item.words : undefined,
    vietnamese: item.type === 'sentence-order' ? item.vietnamese : undefined,
    explanation: item.explanationVi,
    sourceItemId: item.id,
    srsType: item.type === 'fill-blank' ? 'typing' : 'quiz',
  };
}

function stepFromFillBlank(item: FillBlankTask): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'fill_blank',
    title: 'Điền từ còn thiếu',
    instruction: 'Gõ từ hoặc cụm đúng vào ô trống.',
    prompt: item.prompt,
    answer: item.answer,
    hint: item.hint,
    explanation: item.hint,
    sourceItemId: item.id,
    srsType: 'typing',
  };
}

function stepFromSentenceOrder(item: SentenceOrderingTask): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'sentence_order',
    title: 'Sắp xếp câu',
    instruction: 'Chạm các từ theo đúng thứ tự để tạo câu tiếng Anh.',
    prompt: item.vietnamese,
    answer: item.answer,
    words: item.words,
    sourceItemId: item.id,
    srsType: 'quiz',
  };
}

function stepFromListening(item: ListeningPracticeItem): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'listen_choose',
    title: 'Nghe và chọn',
    instruction: 'Bấm nghe, sau đó chọn câu bạn vừa nghe.',
    prompt: item.question,
    answer: item.answer,
    options: uniqueOptions([item.answer, ...item.options]),
    english: item.text,
    explanation: item.explanationVi,
    sourceItemId: item.id,
    srsType: 'listening',
  };
}

function stepFromSpeaking(item: SpeakingReflexPrompt): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'speak_repeat',
    title: 'Nói lại với Poo',
    instruction: 'Nghe mẫu, nói chậm một lần, rồi bấm “Mình đã nói xong”.',
    prompt: item.promptVi,
    answer: item.expectedEnglish,
    english: item.expectedEnglish,
    hint: item.hint,
    explanation: item.hint,
    sourceItemId: item.id,
    srsType: 'reflex',
  };
}

function buildInteractiveSteps(lesson: EnglishLesson): InteractiveLessonStep[] {
  const fallbackOptions = lesson.vocabulary.slice(0, 6).map((item) => item.meaningVi);
  const objectiveText = lesson.learningObjectives.slice(0, 3).join(' · ');
  const firstVocab = lesson.vocabulary.slice(0, 2).map(stepFromVocabulary);
  const firstFlashcard = lesson.flashcards[0] ? [stepFromFlashcard(lesson.flashcards[0], 0)] : [];
  const multipleChoice = lesson.quizQuestions.find((item) => item.type === 'multiple-choice') ?? lesson.quizQuestions[0];
  const fillBlank = lesson.fillBlankTasks[0] ? stepFromFillBlank(lesson.fillBlankTasks[0]) : lesson.quizQuestions.find((item) => item.type === 'fill-blank') ? stepFromQuiz(lesson.quizQuestions.find((item) => item.type === 'fill-blank')!, 1, fallbackOptions) : undefined;
  const order = lesson.sentenceOrderingTasks[0] ? stepFromSentenceOrder(lesson.sentenceOrderingTasks[0]) : lesson.quizQuestions.find((item) => item.type === 'sentence-order') ? stepFromQuiz(lesson.quizQuestions.find((item) => item.type === 'sentence-order')!, 2, fallbackOptions) : undefined;
  const listening = lesson.listeningPractice[0] ? stepFromListening(lesson.listeningPractice[0]) : undefined;
  const speaking = lesson.speakingReflexPrompts[0] ? stepFromSpeaking(lesson.speakingReflexPrompts[0]) : undefined;
  const quiz = multipleChoice ? stepFromQuiz(multipleChoice, 0, fallbackOptions) : undefined;

  return [
    {
      id: 'intro',
      type: 'intro',
      title: 'Bắt đầu bài học tương tác',
      instruction: 'Một màn một nhiệm vụ. Poo sẽ dẫn bạn học trong 3–7 phút.',
      prompt: lesson.titleVi,
      explanation: objectiveText || lesson.subtitle,
    },
    ...firstVocab,
    ...firstFlashcard,
    quiz,
    fillBlank,
    order,
    listening,
    speaking,
    {
      id: 'summary',
      type: 'summary',
      title: 'Tổng kết cùng Poo',
      instruction: 'Xem XP, từ yếu và bước luyện tiếp theo.',
      prompt: lesson.finalMiniChallenge?.instructionVi ?? 'Bạn đã hoàn thành bài học. Hãy ôn lại từ yếu trong Khu luyện tập.',
      explanation: lesson.whaleCoachLines?.[0] ?? 'Đi chậm nhưng chắc. Mỗi bài nhỏ đều giúp phản xạ tiếng Anh tốt hơn.',
    },
  ].filter(Boolean) as InteractiveLessonStep[];
}

export function getInteractiveLessonByUnit(unitId: string, nodeId?: string): InteractiveLesson | null {
  const entry = getUnifiedLessonEntry(unitId);
  const sourceLesson = entry?.primaryLesson ?? entry?.lessons[0];
  if (!entry || !sourceLesson) return null;

  return {
    id: `${entry.unit.id}__${sourceLesson.id}`,
    unitId: entry.unit.id,
    nodeId,
    title: sourceLesson.titleVi || entry.unit.titleVi,
    subtitle: sourceLesson.subtitle || entry.unit.confidenceGoal,
    level: sourceLesson.level,
    duration: '3–7 phút',
    xp: 20,
    steps: buildInteractiveSteps(sourceLesson),
    sourceLesson,
  };
}

export function getInteractiveLessonByLessonId(lessonId: string): InteractiveLesson | null {
  const sourceLesson = getLessonById(lessonId);
  if (!sourceLesson) return null;

  return {
    id: sourceLesson.id,
    unitId: sourceLesson.unitId,
    title: sourceLesson.titleVi,
    subtitle: sourceLesson.subtitle,
    level: sourceLesson.level,
    duration: '3–7 phút',
    xp: 20,
    steps: buildInteractiveSteps(sourceLesson),
    sourceLesson,
  };
}

export function isInteractiveAnswerCorrect(step: InteractiveLessonStep, answer: string) {
  if (step.type === 'flashcard' || step.type === 'intro' || step.type === 'summary' || step.type === 'speak_repeat') return true;
  return normalizeAnswer(answer) === normalizeAnswer(step.answer ?? '');
}

export function startInteractiveLesson(lesson: InteractiveLesson) {
  markLessonStarted(lesson.sourceLesson.id, lesson.unitId);
  recordLearningLoopActivity('interactive-lesson', lesson.sourceLesson.id, 2);
  upsertLearningLoopWords(lesson.sourceLesson.vocabulary.map((item) => ({
    id: `lesson:${lesson.sourceLesson.id}:word:${item.id}`,
    term: item.term,
    meaningVi: item.meaningVi,
    example: item.example,
    source: 'interactive-lesson',
    sourceId: lesson.sourceLesson.id,
    cefrLevel: item.cefrLevel,
    topic: item.visualCategory || lesson.sourceLesson.unitTitle,
  })));
}

function getMistakeType(step: InteractiveLessonStep) {
  if (step.type === 'multiple_choice') return 'multiple-choice';
  if (step.type === 'fill_blank') return 'fill-blank';
  if (step.type === 'sentence_order') return 'sentence-order';
  if (step.type === 'listen_choose') return 'listen-and-choose';
  return 'speaking-repeat';
}

export function recordInteractiveStep(lesson: InteractiveLesson, step: InteractiveLessonStep, correct: boolean, answer = '') {
  markLessonStepCompleted(lesson.sourceLesson.id, step.id);
  if (step.sourceItemId && step.srsType) {
    markItemReviewed(lesson.sourceLesson.id, step.sourceItemId, step.srsType, correct ? 'correct' : 'wrong');
  }
  if (!correct && step.vocabularyId) {
    saveWordReviewStatus(step.vocabularyId, 'difficult');
  }
  const mistakeId = `interactive:${lesson.sourceLesson.id}:${step.id}`;
  if (correct) {
    resolveLearningLoopMistake(mistakeId);
  } else if (step.type !== 'intro' && step.type !== 'summary') {
    recordLearningLoopMistake({
      id: mistakeId,
      source: 'interactive-lesson',
      sourceId: lesson.sourceLesson.id,
      type: getMistakeType(step),
      prompt: step.prompt || step.instruction,
      correctAnswer: step.answer || step.english,
      userAnswer: answer,
      explanation: step.explanation,
      tags: [lesson.unitId, step.type],
    });
  }
}

export function completeInteractiveLesson(lesson: InteractiveLesson, correctCount: number, totalAnswered: number, weakItems: InteractiveLessonStep[]): InteractiveLessonResult {
  markLessonCompleted(lesson.sourceLesson.id, lesson.unitId);
  recordLearningActivity('lesson', lesson.sourceLesson.id);
  recordLearningLoopActivity('interactive-lesson', lesson.sourceLesson.id, lesson.xp + Math.max(0, correctCount * 2));
  weakItems.forEach((step) => {
    if (step.vocabularyId) saveWordReviewStatus(step.vocabularyId, 'difficult');
  });

  return {
    lessonId: lesson.sourceLesson.id,
    unitId: lesson.unitId,
    xp: lesson.xp + Math.max(0, correctCount * 2),
    correctCount,
    totalAnswered,
    weakItems,
  };
}
