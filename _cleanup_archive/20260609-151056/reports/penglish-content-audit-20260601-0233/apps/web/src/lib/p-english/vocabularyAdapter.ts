import { generatedCefrVocabulary, generatedVocabularyGroups } from '../../data/vocabulary/generatedCefrVocabulary';
import { getVocabularyLearningGroupMetadata, type VocabularyLearningGroupMetadata } from '../../data/vocabulary/vocabularyLearningGroups';
import type { GeneratedCefrVocabularyItem, GeneratedVocabularyCefrLevel } from '../../data/vocabulary/vocabularyTypes';

export type AdaptedVocabularyItem = {
  id: string;
  wordId: string;
  lessonId: string;
  lessonTitle: string;
  unitTitle: string;
  term: string;
  pronunciation?: string;
  pronunciationHintVi?: string;
  meaningVi: string;
  partOfSpeechOrType: string;
  example: string;
  exampleMeaningVi: string;
  cefrLevel?: GeneratedVocabularyCefrLevel;
  visualCategory?: string;
  animatedSceneHint?: string;
  usefulInSituation?: string;
  confusionNoteVi?: string;
  difficulty: 'easy' | 'medium';
  tags: string[];
  simpleEnglishMeaning: string;
  vietnameseHint: string;
  flashcardPrompt: string;
  learningGroup: VocabularyLearningGroupMetadata;
  source: GeneratedCefrVocabularyItem['source'];
};

function groupForLevel(level: GeneratedVocabularyCefrLevel) {
  return generatedVocabularyGroups.find((group) => group.cefrLevel === level) ?? generatedVocabularyGroups[0];
}

function visualCategoryFor(item: GeneratedCefrVocabularyItem) {
  const tags = [item.word, item.partOfSpeech ?? '', ...item.tags].join(' ').toLowerCase();
  if (/mother|father|brother|sister|family/.test(tags)) return 'family';
  if (/morning|afternoon|evening|time|hour|minute/.test(tags)) return 'time';
  if (/school|student|teacher|class|book/.test(tags)) return 'school';
  if (/food|eat|drink|water/.test(tags)) return 'food';
  if (/country|place|city|aboard|abroad/.test(tags)) return 'place';
  if (/verb|action/.test(tags)) return 'action';
  return 'default';
}

export function adaptGeneratedVocabularyItem(item: GeneratedCefrVocabularyItem): AdaptedVocabularyItem {
  const group = groupForLevel(item.cefrLevel);
  const learningGroup = getVocabularyLearningGroupMetadata(item.cefrLevel);
  const wordId = `${group.id}:${item.id}`;
  return {
    id: item.id,
    wordId,
    lessonId: group.id,
    lessonTitle: group.titleVi,
    unitTitle: group.unitTitle,
    term: item.term,
    pronunciation: item.pronunciation,
    pronunciationHintVi: item.pronunciationHintVi,
    meaningVi: item.meaningVi,
    partOfSpeechOrType: item.partOfSpeechOrType,
    example: item.example,
    exampleMeaningVi: item.exampleMeaningVi,
    cefrLevel: item.cefrLevel,
    visualCategory: visualCategoryFor(item),
    animatedSceneHint: item.vietnameseHint,
    usefulInSituation: item.simpleEnglishMeaning,
    confusionNoteVi: item.flashcardPrompt,
    difficulty: item.difficulty,
    tags: [...item.tags, item.cefrLevel, item.partOfSpeechOrType],
    simpleEnglishMeaning: item.simpleEnglishMeaning,
    vietnameseHint: item.vietnameseHint,
    flashcardPrompt: item.flashcardPrompt,
    learningGroup,
    source: item.source,
  };
}

const adaptedVocabularyItems = generatedCefrVocabulary.map(adaptGeneratedVocabularyItem);

export function getAdaptedVocabularyItems() {
  return adaptedVocabularyItems;
}

export function getAdaptedVocabularyItemByWordId(wordId: string) {
  return adaptedVocabularyItems.find((item) => item.wordId === wordId || item.id === wordId) ?? null;
}

export function getVocabularyReviewGroups() {
  return generatedVocabularyGroups;
}
