const MEANING_CRITICAL_WORDS = new Set([
  'not', 'never', 'no', 'cannot', "can't", 'cant', 'dont', "don't", 'doesnt', "doesn't",
  'didnt', "didn't", 'wont', "won't", 'should', 'shouldnt', "shouldn't", 'must',
  'mustnt', "mustn't", 'can', 'could', 'would', 'will', 'shall', 'may', 'might',
]);
const OPTIONAL_ARTICLES = new Set(['a', 'an', 'the']);
const SPEECH_CONTRACTIONS: Record<string, string> = {
  "can't": 'can not', cant: 'can not', cannot: 'can not',
  "don't": 'do not', dont: 'do not',
  "doesn't": 'does not', doesnt: 'does not',
  "didn't": 'did not', didnt: 'did not',
  "isn't": 'is not', isnt: 'is not',
  "aren't": 'are not', arent: 'are not',
  "wasn't": 'was not', wasnt: 'was not',
  "weren't": 'were not', werent: 'were not',
  "haven't": 'have not', havent: 'have not',
  "hasn't": 'has not', hasnt: 'has not',
  "hadn't": 'had not', hadnt: 'had not',
  "won't": 'will not', wont: 'will not',
  "wouldn't": 'would not', wouldnt: 'would not',
  "shouldn't": 'should not', shouldnt: 'should not',
  "couldn't": 'could not', couldnt: 'could not',
  "mustn't": 'must not', mustnt: 'must not',
  "needn't": 'need not', neednt: 'need not',
  "shan't": 'shall not', shant: 'shall not',
  "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are',
  "i'll": 'i will', "you'll": 'you will', "we'll": 'we will', "they'll": 'they will',
};

function normalizeSpeechWords(value: string) {
  return value
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/[\w']+/g, (word) => SPEECH_CONTRACTIONS[word] ?? word)
    .replace(/[.,!?;:'"“”‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export function isNearCorrectSpeechAnswer(target: string, attempt: string, threshold = 0.86) {
  const targetWords = normalizeSpeechWords(target);
  const attemptWords = normalizeSpeechWords(attempt);
  if (!targetWords.length || !attemptWords.length) return false;

  const attemptSet = new Set(attemptWords);
  const meaningCriticalWords = targetWords.filter((word) => MEANING_CRITICAL_WORDS.has(word));
  const allMeaningCriticalWordsPresent = meaningCriticalWords.every((word) => attemptSet.has(word));
  let attemptPosition = 0;
  const allNonArticleWordsPresentInOrder = targetWords
    .filter((word) => !OPTIONAL_ARTICLES.has(word))
    .every((word) => {
      const foundAt = attemptWords.indexOf(word, attemptPosition);
      if (foundAt < 0) return false;
      attemptPosition = foundAt + 1;
      return true;
    });
  const matchedCount = targetWords.filter((word) => attemptSet.has(word)).length;
  const similarity = matchedCount / Math.max(targetWords.length, attemptWords.length);

  return allMeaningCriticalWordsPresent && allNonArticleWordsPresentInOrder && similarity >= threshold;
}
