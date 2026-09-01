export type GeneratedGrammarSourceMetadata = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  license: string;
  attribution: string;
  sourcePatternId: string;
  integrationMode: 'adapted-pattern-logic';
};

export type GeneratedGrammarLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type GeneratedGrammarExercise = {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'sentence-order';
  promptVi: string;
  promptEn?: string;
  options?: string[];
  answer: string | string[];
  hintVi: string;
  explanationVi: string;
  words?: string[];
};

export type GeneratedGrammarLessonSource = {
  id: string;
  unitId: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  level: GeneratedGrammarLevel;
  estimatedTime: string;
  sourcePatternTitle: string;
  sourcePatternDescription: string;
  sourcePatternSummary: string;
  vietnameseExplanation: string;
  examples: Array<{
    text: string;
    meaningVi: string;
  }>;
  exercises: GeneratedGrammarExercise[];
  source: GeneratedGrammarSourceMetadata;
};
