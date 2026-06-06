export type GeneratedReadingCefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type GeneratedReadingSourceMetadata = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  license: string;
  attribution: string;
  integrationMode: 'cefr-profiled-app-native-content';
  licenseRiskNote: string;
};

export type GeneratedReadingComprehensionQuestion = {
  id: string;
  questionVi: string;
  questionEn: string;
  options: string[];
  answer: string;
  explanationVi: string;
};

export type GeneratedReadingFillBlankTask = {
  id: string;
  prompt: string;
  answer: string;
  hintVi: string;
  explanationVi: string;
};

export type GeneratedReadingSentenceOrderingTask = {
  id: string;
  vietnamese: string;
  words: string[];
  answer: string;
  explanationVi: string;
};

export type GeneratedReadingVocabularyFocus = {
  id: string;
  term: string;
  meaningVi: string;
  partOfSpeechOrType: string;
  example: string;
  exampleMeaningVi: string;
};

export type GeneratedReadingLessonSource = {
  id: string;
  unitId: string;
  level: GeneratedReadingCefrLevel;
  titleVi: string;
  titleEn: string;
  passage: string;
  vietnameseSetup: string;
  sentenceFocus: {
    pattern: string;
    explanationVi: string;
    examples: Array<{
      text: string;
      meaningVi: string;
    }>;
  };
  comprehensionQuestions: GeneratedReadingComprehensionQuestion[];
  fillBlankTasks: GeneratedReadingFillBlankTask[];
  sentenceOrderingTasks: GeneratedReadingSentenceOrderingTask[];
  vocabularyFocus: GeneratedReadingVocabularyFocus[];
  whaleCoachLines: string[];
  source: GeneratedReadingSourceMetadata;
};
