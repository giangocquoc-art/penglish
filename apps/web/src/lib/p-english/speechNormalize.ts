export {
  areSpeechTextsEquivalent,
  normalizeSpeechTextDetailed,
  normalizeSpeechTextForComparison,
  tokenizeSpeechTextForComparison,
  type SpeechTextNormalizationResult,
} from './speechTextNormalizer';

export function normalizeSpeechAnswerForComparison(value: string) {
  return normalizeSpeechTextForComparison(value);
}

import { normalizeSpeechTextForComparison } from './speechTextNormalizer';
