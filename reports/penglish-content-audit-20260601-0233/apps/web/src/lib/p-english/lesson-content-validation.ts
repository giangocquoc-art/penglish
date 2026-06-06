import type { EnglishLesson, QuizQuestion } from './lesson-content-data';
import { validateSentenceOrderQuestion } from './practice-randomization';

export type LessonContentValidationWarning = {
  lessonId: string;
  severity: 'info' | 'warning' | 'error';
  area:
    | 'metadata'
    | 'vocabulary'
    | 'flashcards'
    | 'quiz'
    | 'sentenceOrdering'
    | 'fillBlank'
    | 'listening'
    | 'reflex'
    | 'completionCriteria';
  message: string;
  itemId?: string;
};

function normalizeText(value: string) {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .trim()
    .replace(/[.!?。！？]+$/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeTokens(value: string) {
  return normalizeText(value).split(' ').filter(Boolean).sort().join(' ');
}

function isBlank(value: unknown) {
  return typeof value !== 'string' || value.trim().length === 0;
}

function answerToText(answer: QuizQuestion['answer']) {
  return Array.isArray(answer) ? answer.join(' / ') : answer;
}

function pushWarning(
  warnings: LessonContentValidationWarning[],
  lessonId: string,
  severity: LessonContentValidationWarning['severity'],
  area: LessonContentValidationWarning['area'],
  message: string,
  itemId?: string,
) {
  warnings.push({ lessonId, severity, area, message, itemId });
}

function randomizationWarningSeverity(message: string): LessonContentValidationWarning['severity'] {
  return /missing a correct answer|cannot be built/i.test(message) ? 'error' : 'warning';
}

function pushSentenceOrderRandomizationWarnings(
  warnings: LessonContentValidationWarning[],
  lessonId: string,
  area: 'quiz' | 'sentenceOrdering',
  itemId: string | undefined,
  messages: string[],
) {
  messages.forEach((message) => {
    const alreadyReported = warnings.some(
      (warning) => warning.lessonId === lessonId && warning.area === area && warning.itemId === itemId && warning.message === message,
    );
    if (!alreadyReported) {
      pushWarning(warnings, lessonId, randomizationWarningSeverity(message), area, message, itemId);
    }
  });
}

function checkDuplicateIds(
  warnings: LessonContentValidationWarning[],
  lessonId: string,
  area: LessonContentValidationWarning['area'],
  ids: string[],
) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  ids.forEach((id) => {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  });

  duplicates.forEach((id) => {
    pushWarning(warnings, lessonId, 'error', area, `Duplicate id found: ${id}`, id);
  });
}

export function validateLessonContent(lesson: EnglishLesson): LessonContentValidationWarning[] {
  const warnings: LessonContentValidationWarning[] = [];
  const lessonId = lesson.id || 'unknown-lesson';

  if (isBlank(lesson.id)) pushWarning(warnings, lessonId, 'error', 'metadata', 'Lesson id is required.');
  if (isBlank(lesson.unitId)) pushWarning(warnings, lessonId, 'error', 'metadata', 'Unit id is required.');
  if (isBlank(lesson.titleVi)) pushWarning(warnings, lessonId, 'error', 'metadata', 'Vietnamese title is required.');
  if (isBlank(lesson.titleEn)) pushWarning(warnings, lessonId, 'error', 'metadata', 'English title is required.');
  if (isBlank(lesson.level)) pushWarning(warnings, lessonId, 'error', 'metadata', 'Lesson level is required.');
  if (isBlank(lesson.estimatedTime)) pushWarning(warnings, lessonId, 'error', 'metadata', 'Estimated time is required.');

  checkDuplicateIds(warnings, lessonId, 'vocabulary', lesson.vocabulary.map((item) => item.id));
  checkDuplicateIds(warnings, lessonId, 'flashcards', lesson.flashcards.map((item) => item.id));
  checkDuplicateIds(warnings, lessonId, 'quiz', lesson.quizQuestions.map((item) => item.id));
  checkDuplicateIds(warnings, lessonId, 'sentenceOrdering', lesson.sentenceOrderingTasks.map((item) => item.id));
  checkDuplicateIds(warnings, lessonId, 'fillBlank', lesson.fillBlankTasks.map((item) => item.id));
  checkDuplicateIds(warnings, lessonId, 'listening', lesson.listeningPractice.map((item) => item.id));
  checkDuplicateIds(warnings, lessonId, 'reflex', lesson.speakingReflexPrompts.map((item) => item.id));

  lesson.vocabulary.forEach((item) => {
    if (isBlank(item.id)) pushWarning(warnings, lessonId, 'error', 'vocabulary', 'Vocabulary id is required.');
    if (isBlank(item.term)) pushWarning(warnings, lessonId, 'error', 'vocabulary', 'Vocabulary term is required.', item.id);
    if (isBlank(item.meaningVi)) pushWarning(warnings, lessonId, 'error', 'vocabulary', 'Vietnamese meaning is required.', item.id);
    if (isBlank(item.example)) pushWarning(warnings, lessonId, 'warning', 'vocabulary', 'Vocabulary example is missing.', item.id);
    if (isBlank(item.exampleMeaningVi)) pushWarning(warnings, lessonId, 'warning', 'vocabulary', 'Vocabulary example Vietnamese meaning is missing.', item.id);
    if (isBlank(item.partOfSpeechOrType)) pushWarning(warnings, lessonId, 'warning', 'vocabulary', 'Part of speech/type is missing.', item.id);
    if (item.tags.length === 0) pushWarning(warnings, lessonId, 'warning', 'vocabulary', 'Vocabulary tags are empty.', item.id);
  });

  lesson.flashcards.forEach((item) => {
    if (isBlank(item.id)) pushWarning(warnings, lessonId, 'error', 'flashcards', 'Flashcard id is required.');
    if (isBlank(item.front)) pushWarning(warnings, lessonId, 'error', 'flashcards', 'Flashcard front is required.', item.id);
    if (isBlank(item.back)) pushWarning(warnings, lessonId, 'error', 'flashcards', 'Flashcard back is required.', item.id);
    if (isBlank(item.example)) pushWarning(warnings, lessonId, 'warning', 'flashcards', 'Flashcard example is missing.', item.id);
  });

  if (lesson.flashcards.length !== lesson.vocabulary.length) {
    pushWarning(
      warnings,
      lessonId,
      'error',
      'flashcards',
      `Flashcard count (${lesson.flashcards.length}) must match vocabulary count (${lesson.vocabulary.length}).`,
    );
  }

  lesson.quizQuestions.forEach((item) => {
    if (isBlank(item.id)) pushWarning(warnings, lessonId, 'error', 'quiz', 'Quiz id is required.');
    const promptText = item.question ?? item.prompt ?? item.vietnamese;
    if (isBlank(promptText)) pushWarning(warnings, lessonId, 'error', 'quiz', 'Quiz prompt/question is required.', item.id);
    if (isBlank(answerToText(item.answer))) pushWarning(warnings, lessonId, 'error', 'quiz', 'Quiz answer is required.', item.id);

    if (item.type === 'multiple-choice') {
      const options = item.options ?? [];
      if (options.length < 2) pushWarning(warnings, lessonId, 'warning', 'quiz', 'Multiple-choice question should have at least 2 options.', item.id);
      if (!options.includes(answerToText(item.answer))) pushWarning(warnings, lessonId, 'error', 'quiz', 'Multiple-choice answer is not present in options.', item.id);
      if (isBlank(item.explanationVi)) pushWarning(warnings, lessonId, 'warning', 'quiz', 'Multiple-choice explanationVi is missing.', item.id);
    }

    if (item.type === 'sentence-order') {
      if (!item.words || item.words.length < 2) pushWarning(warnings, lessonId, 'warning', 'quiz', 'Sentence-order quiz should have at least 2 words.', item.id);
      if (item.words && normalizeTokens(answerToText(item.answer)) !== normalizeTokens(item.words.join(' '))) {
        pushWarning(warnings, lessonId, 'error', 'quiz', 'Sentence-order quiz answer cannot be built from words.', item.id);
      }
      pushSentenceOrderRandomizationWarnings(warnings, lessonId, 'quiz', item.id, validateSentenceOrderQuestion(item));
    }

    if (item.type === 'fill-blank') {
      if (isBlank(answerToText(item.answer))) pushWarning(warnings, lessonId, 'error', 'quiz', 'Fill-blank quiz answer is empty.', item.id);
      if (!/___|\.\.\./.test(item.prompt ?? '')) pushWarning(warnings, lessonId, 'warning', 'quiz', 'Fill-blank quiz prompt should include ___ or ... marker.', item.id);
    }

    if (item.type === 'match-meaning') {
      if (!item.pairs?.length) pushWarning(warnings, lessonId, 'error', 'quiz', 'Match-meaning quiz should include at least one pair.', item.id);
      if (!item.options?.length) pushWarning(warnings, lessonId, 'warning', 'quiz', 'Match-meaning quiz options are missing.', item.id);
    }
  });

  lesson.sentenceOrderingTasks.forEach((item) => {
    if (isBlank(item.id)) pushWarning(warnings, lessonId, 'error', 'sentenceOrdering', 'Sentence ordering id is required.');
    if (item.words.length < 2) pushWarning(warnings, lessonId, 'warning', 'sentenceOrdering', 'Sentence ordering task should have at least 2 words.', item.id);
    if (normalizeTokens(item.answer) !== normalizeTokens(item.words.join(' '))) {
      pushWarning(warnings, lessonId, 'error', 'sentenceOrdering', 'Sentence ordering answer cannot be built from words.', item.id);
    }
    pushSentenceOrderRandomizationWarnings(warnings, lessonId, 'sentenceOrdering', item.id, validateSentenceOrderQuestion(item));
  });

  lesson.fillBlankTasks.forEach((item) => {
    if (isBlank(item.id)) pushWarning(warnings, lessonId, 'error', 'fillBlank', 'Fill-blank id is required.');
    if (isBlank(item.answer)) pushWarning(warnings, lessonId, 'error', 'fillBlank', 'Fill-blank answer is empty.', item.id);
    if (!/___|\.\.\./.test(item.prompt)) pushWarning(warnings, lessonId, 'warning', 'fillBlank', 'Fill-blank prompt should include ___ or ... marker.', item.id);
  });

  lesson.listeningPractice.forEach((item) => {
    if (isBlank(item.id)) pushWarning(warnings, lessonId, 'error', 'listening', 'Listening id is required.');
    if (isBlank(item.text)) pushWarning(warnings, lessonId, 'error', 'listening', 'Listening text is required.', item.id);
    if (isBlank(item.question)) pushWarning(warnings, lessonId, 'error', 'listening', 'Listening question is required.', item.id);
    if (!item.options.includes(item.answer)) pushWarning(warnings, lessonId, 'error', 'listening', 'Listening answer is not present in options.', item.id);
    if (item.text.split(/\s+/).filter(Boolean).length > 14) pushWarning(warnings, lessonId, 'warning', 'listening', 'Listening text may be too long for A1.', item.id);
  });

  lesson.speakingReflexPrompts.forEach((item) => {
    if (isBlank(item.id)) pushWarning(warnings, lessonId, 'error', 'reflex', 'Reflex prompt id is required.');
    if (isBlank(item.promptVi)) pushWarning(warnings, lessonId, 'error', 'reflex', 'Reflex Vietnamese prompt is required.', item.id);
    if (isBlank(item.expectedEnglish)) pushWarning(warnings, lessonId, 'error', 'reflex', 'Reflex expectedEnglish is required.', item.id);
    if (item.acceptableAnswers.length === 0) pushWarning(warnings, lessonId, 'warning', 'reflex', 'Reflex acceptableAnswers are empty.', item.id);
    const includesExpected = item.acceptableAnswers.some((answer) => normalizeText(answer) === normalizeText(item.expectedEnglish));
    if (!includesExpected) pushWarning(warnings, lessonId, 'warning', 'reflex', 'Reflex expectedEnglish should be included in acceptableAnswers.', item.id);
  });

  if (lesson.completionCriteria.flashcardsReviewed > lesson.flashcards.length) {
    pushWarning(warnings, lessonId, 'error', 'completionCriteria', 'flashcardsReviewed exceeds available flashcards.');
  }
  if (lesson.completionCriteria.minimumQuizCorrect > lesson.completionCriteria.totalQuizQuestions) {
    pushWarning(warnings, lessonId, 'error', 'completionCriteria', 'minimumQuizCorrect exceeds totalQuizQuestions.');
  }
  if (lesson.completionCriteria.totalQuizQuestions !== lesson.quizQuestions.length) {
    pushWarning(warnings, lessonId, 'error', 'completionCriteria', 'totalQuizQuestions does not match quizQuestions length.');
  }
  if (lesson.completionCriteria.minimumReflexPromptsCompleted > lesson.speakingReflexPrompts.length) {
    pushWarning(warnings, lessonId, 'error', 'completionCriteria', 'minimumReflexPromptsCompleted exceeds available reflex prompts.');
  }
  if (lesson.completionCriteria.totalReflexPrompts !== lesson.speakingReflexPrompts.length) {
    pushWarning(warnings, lessonId, 'error', 'completionCriteria', 'totalReflexPrompts does not match speakingReflexPrompts length.');
  }

  return warnings;
}

export function summarizeLessonValidation(warnings: LessonContentValidationWarning[]): {
  errorCount: number;
  warningCount: number;
  infoCount: number;
} {
  return warnings.reduce(
    (summary, warning) => ({
      errorCount: summary.errorCount + (warning.severity === 'error' ? 1 : 0),
      warningCount: summary.warningCount + (warning.severity === 'warning' ? 1 : 0),
      infoCount: summary.infoCount + (warning.severity === 'info' ? 1 : 0),
    }),
    { errorCount: 0, warningCount: 0, infoCount: 0 },
  );
}
