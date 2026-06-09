export type GeneratedVocabularyCefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type GeneratedVocabularySourceMetadata = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  license: string;
  attribution: string;
  sourceDataset: string;
  sourceRow?: number;
};

export type GeneratedCefrVocabularyItem = {
  id: string;
  word: string;
  term: string;
  cefrLevel: GeneratedVocabularyCefrLevel;
  partOfSpeech?: string;
  partOfSpeechOrType: string;
  simpleEnglishMeaning: string;
  vietnameseHint: string;
  meaningVi: string;
  example: string;
  exampleMeaningVi: string;
  flashcardPrompt: string;
  pronunciation?: string;
  pronunciationHintVi?: string;
  tags: string[];
  difficulty: 'easy' | 'medium';
  source: GeneratedVocabularySourceMetadata;
};

export type GeneratedVocabularyGroup = {
  id: string;
  titleVi: string;
  unitTitle: string;
  cefrLevel: GeneratedVocabularyCefrLevel;
  descriptionVi: string;
};
