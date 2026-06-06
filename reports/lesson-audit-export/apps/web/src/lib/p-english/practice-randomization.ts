import type { EnglishLesson, QuizQuestion, SentenceOrderingTask } from './lesson-content-data';

export type SentenceOrderToken = {
  id: string;
  word: string;
  originalIndex: number;
};

export type BuiltSentenceOrderQuestion = {
  id: string;
  vietnamese?: string;
  correctSentence: string;
  tokens: SentenceOrderToken[];
  shuffledTokens: SentenceOrderToken[];
  warnings: string[];
};

export function normalizeToken(value: string) {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .trim()
    .replace(/^[\s"'“”‘’([{]+/g, '')
    .replace(/[\s"'“”‘’.,!?;:。！？،؛)\]}]+$/g, '')
    .replace(/\s+/g, ' ');
}

export function splitSentenceIntoTokens(sentence: string) {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

function hashSeed(seed: string | number) {
  const seedText = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string | number) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6D2B79F5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function itemsEqualByPosition<T>(a: readonly T[], b: readonly T[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

export function shuffleArrayStableCopy<T>(items: readonly T[], seed: string | number = 'practice-randomization') {
  const next = [...items];
  const random = seededRandom(seed);

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function getQuestionRandomSeed(questionId: string, attemptId?: string | number) {
  return `${questionId}::${attemptId ?? 0}`;
}

export function ensureShuffledDifferentFromOriginal<T>(tokens: readonly T[], maxAttempts = 8, seed: string | number = 'practice-randomization') {
  const original = [...tokens];
  if (original.length < 2) return original;

  let shuffled = original;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    shuffled = shuffleArrayStableCopy(original, `${seed}::${attempt}`);
    if (!itemsEqualByPosition(original, shuffled)) return shuffled;
  }

  const fallback = [...original];
  [fallback[0], fallback[1]] = [fallback[1], fallback[0]];
  return fallback;
}

export function createSentenceOrderTokens(words: readonly string[], questionId = 'sentence-order'): SentenceOrderToken[] {
  return words.map((word, index) => ({
    id: `${questionId}::${index}::${normalizeToken(word) || 'token'}`,
    word,
    originalIndex: index,
  }));
}

export function shuffleTokensForQuestion<T>(tokens: readonly T[], questionId: string) {
  return ensureShuffledDifferentFromOriginal(tokens, 8, questionId);
}

export function areTokenListsEqualNormalized(a: readonly string[], b: readonly string[]) {
  if (a.length !== b.length) return false;
  return a.every((token, index) => normalizeToken(token) === normalizeToken(b[index] ?? ''));
}

export function validateSentenceOrderAnswer(selectedTokens: readonly string[], correctSentence: string) {
  return areTokenListsEqualNormalized(selectedTokens, splitSentenceIntoTokens(correctSentence));
}

function hasDuplicateNormalizedTokens(tokens: readonly string[]) {
  const seen = new Set<string>();
  return tokens.some((token) => {
    const normalized = normalizeToken(token);
    if (seen.has(normalized)) return true;
    seen.add(normalized);
    return false;
  });
}

function buildWarnings(id: string, tokens: readonly string[], correctSentence: string) {
  const warnings: string[] = [];
  if (!correctSentence.trim()) warnings.push(`Sentence-order ${id} is missing a correct answer.`);
  if (tokens.length < 2) warnings.push(`Sentence-order ${id} has fewer than 2 tokens.`);
  if (hasDuplicateNormalizedTokens(tokens)) warnings.push(`Sentence-order ${id} contains duplicate normalized tokens; UI must track token ids.`);
  if (correctSentence.trim() && !areTokenListsEqualNormalized([...tokens].sort(), splitSentenceIntoTokens(correctSentence).sort())) {
    warnings.push(`Sentence-order ${id} answer cannot be built from its tokens.`);
  }
  return warnings;
}

export function buildSentenceOrderQuestion(input: {
  id: string;
  vietnamese?: string;
  words?: readonly string[];
  sentence?: string;
  answer?: string;
  attemptId?: string | number;
}): BuiltSentenceOrderQuestion | null {
  const correctSentence = input.answer ?? input.sentence ?? '';
  const rawTokens = input.words?.length ? [...input.words] : splitSentenceIntoTokens(correctSentence);
  if (rawTokens.length < 2) return null;

  const tokens = createSentenceOrderTokens(rawTokens, input.id);
  const shuffledTokens = shuffleTokensForQuestion(tokens, getQuestionRandomSeed(input.id, input.attemptId));

  return {
    id: input.id,
    vietnamese: input.vietnamese,
    correctSentence,
    tokens,
    shuffledTokens,
    warnings: buildWarnings(input.id, rawTokens, correctSentence),
  };
}

export function validateSentenceOrderQuestion(question: Pick<QuizQuestion, 'id' | 'type' | 'words' | 'answer'> | SentenceOrderingTask) {
  const id = question.id;
  const words = 'words' in question && question.words ? question.words : [];
  const answer = Array.isArray(question.answer) ? question.answer.join(' / ') : question.answer;
  return buildWarnings(id, words, answer);
}

export function validatePracticeRandomizationForLesson(lesson: EnglishLesson) {
  return [
    ...lesson.quizQuestions
      .filter((question) => question.type === 'sentence-order')
      .flatMap((question) => validateSentenceOrderQuestion(question)),
    ...lesson.sentenceOrderingTasks.flatMap((task) => validateSentenceOrderQuestion(task)),
  ];
}
