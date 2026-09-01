export type PooLessonLevel = 'A0' | 'A1' | 'A2' | 'B1';

export type PooSkillFocus =
  | 'vocabulary'
  | 'patterns'
  | 'dialogue'
  | 'listening'
  | 'shadowing'
  | 'speaking'
  | 'grammar'
  | 'review';

export type PooOceanArea =
  | 'lagoon'
  | 'coral-reef'
  | 'kelp-forest'
  | 'open-sea'
  | 'deep-sea'
  | 'whale-cave';

export type PooLessonMode =
  | 'core-lesson'
  | 'vocabulary-lesson'
  | 'grammar-lesson'
  | 'dialogue-lesson'
  | 'listening-lesson'
  | 'shadowing-lesson'
  | 'reading-lesson'
  | 'review-lesson';

export type PooContentMaturity = 'draft' | 'ready' | 'polished' | 'legacy-adapted';

export type PooVocabularyItem = {
  id: string;
  term: string;
  meaningVi: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleEn: string;
  exampleVi: string;
  tags?: string[];
  sourceVocabularyId?: string;
};

export type PooPatternItem = {
  id: string;
  pattern: string;
  meaningVi: string;
  explanationVi: string;
  examples: Array<{
    en: string;
    vi: string;
  }>;
};

export type PooDialogueLine = {
  id: string;
  speaker: string;
  en: string;
  vi: string;
  audioText?: string;
  focusWords?: string[];
};

export type PooDialogue = {
  id: string;
  titleVi: string;
  situationVi: string;
  lines: PooDialogueLine[];
};

export type PooListeningTask = {
  id: string;
  titleVi: string;
  promptVi: string;
  transcriptEn: string;
  transcriptVi?: string;
  questions: Array<{
    id: string;
    questionVi: string;
    choices: string[];
    correctAnswer: string;
    explanationVi?: string;
  }>;
};

export type PooShadowingItem = {
  id: string;
  titleVi: string;
  speed: 'slow' | 'normal' | 'challenge';
  lines: Array<{
    id: string;
    en: string;
    vi: string;
    pronunciationTipVi?: string;
    startSeconds?: number;
    endSeconds?: number;
  }>;
};

export type PooQuizItem = {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'sentence-order' | 'match-meaning' | 'short-answer';
  promptVi: string;
  promptEn?: string;
  choices?: string[];
  correctAnswer: string | string[];
  explanationVi?: string;
};

export type PooCommonMistakeVi = {
  id: string;
  mistakeVi: string;
  wrongEn?: string;
  correctEn: string;
  explanationVi: string;
};

export type PooReviewConfig = {
  srsDays: number[];
  quickReviewPrompts: string[];
  masteryCriteriaVi: string[];
};

export type PooLessonMigrationMeta = {
  legacyLessonId?: string;
  legacySourceFile?: string;
  migrationStatus: 'new-format' | 'mapped-from-legacy' | 'needs-manual-review';
  notesVi?: string[];
};

export type PooLesson = {
  id: string;
  title: string;
  titleVi?: string;
  titleEn?: string;
  level: PooLessonLevel;
  skillFocus: PooSkillFocus[];
  lessonMode: PooLessonMode;
  learningGoalVi: string;
  oceanTheme?: string;
  oceanArea?: PooOceanArea;
  estimatedMinutes?: number;
  vocabulary: PooVocabularyItem[];
  patterns: PooPatternItem[];
  dialogue: PooDialogue[];
  listeningTasks: PooListeningTask[];
  shadowing: PooShadowingItem[];
  quiz: PooQuizItem[];
  commonMistakesVi: PooCommonMistakeVi[];
  review: PooReviewConfig;
  contentMaturity: PooContentMaturity;
  migration?: PooLessonMigrationMeta;
};

export type PooLessonRequiredContentKey =
  | 'vocabulary'
  | 'patterns'
  | 'dialogue'
  | 'listeningTasks'
  | 'shadowing'
  | 'quiz'
  | 'commonMistakesVi'
  | 'review';

export const POO_LESSON_FORMAT_VERSION = '2026-06-standard-v1';

export const POO_LESSON_MIGRATION_NOTES = [
  'This schema is additive and does not replace the existing EnglishLesson runtime shape yet.',
  'Legacy lessons can be mapped gradually by setting migration.legacyLessonId and migration.migrationStatus.',
  'Mode-specific lessons may intentionally keep some content arrays empty, but review and quiz should remain present for learner completion.',
  'Prefer shared vocabulary references through sourceVocabularyId when migrating duplicate terms.',
  'Adapters should convert PooLesson into the current UI/runtime shape before old data is removed.',
] as const;
