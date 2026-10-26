export type Foundation48MaterialKind = 'lesson' | 'test' | 'answer' | string;

export type Foundation48AudioItem = {
  id: string;
  title: string;
  fileName: string;
  url: string;
  sourcePath?: string;
};

export type Foundation48MarkdownFile = {
  id?: string;
  kind: Foundation48MaterialKind;
  title?: string;
  sourcePath?: string;
  markdownPath?: string;
  markdown?: string;
  wordCount?: number;
  needsReview?: boolean;
};

export type Foundation48SourceDay = {
  dayNumber: number;
  dayFolder?: string;
  title: string;
  pdfCount: number;
  mp3Count?: number;
  mp4Count?: number;
  hasPdf: boolean;
  hasAudio?: boolean;
  hasVideo: boolean;
  videoCount?: number;
  audio: Foundation48AudioItem[];
  markdownFiles: Foundation48MarkdownFile[];
  lessonMarkdown?: string;
  testMarkdown?: string;
  answerMarkdown?: string;
};

export type Foundation48LessonSection = {
  title: string;
  items: string[];
};

export type Foundation48LessonSummary = {
  dayNumber: number;
  summary: string;
  keyPoints: string[];
  examples: string[];
  practice: string[];
  finalTask: string;
  sourceLabels: string[];
  needsReview: boolean;
};

export type Foundation48PolishedLesson = {
  goal: string;
  explanation: string;
  formulas: string[];
  examples: string[];
  practiceQuestions: string[];
  dailyTest: string[];
  finalTask: string;
};

export type Foundation48Day = Foundation48SourceDay & {
  stageId: number;
  stageTitle: string;
  polished?: Foundation48PolishedLesson;
  summary: Foundation48LessonSummary;
};

export type Foundation48ChallengeType = 'multiple-choice' | 'fill-blank' | 'picture-response' | 'sentence-order' | 'listen-and-choose' | 'speaking-repeat' | 'free-response';

export type Foundation48LessonStepType = 'intro' | 'explain' | 'example' | 'practice' | 'listening' | 'speaking' | 'challenge' | 'complete';

export type Foundation48Challenge = {
  id: string;
  type: Foundation48ChallengeType;
  prompt: string;
  target: string;
  answer: string;
  acceptableAnswers?: string[];
  options?: string[];
  phraseBank?: string[];
  tokens?: string[];
  hint?: string;
  explanation?: string;
  selfCheckOnly?: boolean;
  scoreEligible?: boolean;
  audioSrc?: string;
  audioLabel?: string;
  speakText?: string;
  picture?: { src: string; alt: string; panel: number; gridColumns?: number; gridRows?: number };
};

export type Foundation48LessonStep = {
  id: string;
  type: Foundation48LessonStepType;
  /** Extra authored practice that can be skipped after the daily mission. */
  isBonus?: boolean;
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  challenge?: Foundation48Challenge;
};

export type Foundation48MistakeItem = {
  id: string;
  dayNumber: number;
  challengeId: string;
  challengeType: Foundation48ChallengeType;
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
  explanation?: string;
  attempts: number;
  lastWrongAt: string;
  nextReviewAt?: string;
  resolved?: boolean;
};

export type Foundation48ChallengeResult = {
  challengeId: string;
  /** null means the result is an unscored speaking or open-response task. */
  correct: boolean | null;
  answer: string;
  updatedAt: string;
  successRewarded?: boolean;
  /** Preserve the first scored attempt when later retries update the current result. */
  firstAttemptCorrect?: boolean | null;
  firstAttemptAnswer?: string;
  /** Speaking is only scored when a reliable speech-recognition result is available. */
  scoreEligible?: boolean;
};

export type Foundation48ProgressDay = {
  started?: boolean;
  completed?: boolean;
  /** Stable per-learner question draw; keeps an in-progress day unchanged after reload. */
  exerciseSeed?: string;
  completedSteps?: string[];
  miniTestScore?: number;
  challengeResults?: Record<string, Foundation48ChallengeResult>;
  score?: number;
  mistakes?: Foundation48MistakeItem[];
  lastStudiedAt?: string;
  completedAt?: string;
};

export type Foundation48ProgressState = {
  lastDayOpened?: number;
  days: Record<number, Foundation48ProgressDay>;
  streak?: number;
  lastStudiedDate?: string;
};
