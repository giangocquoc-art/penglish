import { generatedSpeechPrompts, getGeneratedSpeechPromptById } from '../../data/speech/generatedSpeechPrompts';
import { normalizeSpeechTextForComparison } from './speechTextNormalizer';
import type { GeneratedSpeechPrompt, SpeechCefrLevel } from '../../data/speech/speechTypes';

type SpeechRecognitionResultLike = {
  readonly isFinal?: boolean;
  readonly 0: { readonly transcript: string; readonly confidence?: number };
};

type SpeechRecognitionEventLike = {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  readonly error?: string;
  readonly message?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type SpeechFeedbackTier = 'excellent' | 'good' | 'needs-practice';

export type SpeechComparisonResult = {
  targetText: string;
  attemptText: string;
  normalizedTarget: string;
  normalizedAttempt: string;
  score: number;
  tier: SpeechFeedbackTier;
  feedbackVi: string;
  missingWords: string[];
  changedWords: string[];
  matchedWords: string[];
};

export type SpeechRecognizerOptions = {
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
  onResult: (transcript: string) => void;
};

export type SpeechRecognizerController = {
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export function getSpeechPrompts(level?: SpeechCefrLevel) {
  return level ? generatedSpeechPrompts.filter((prompt) => prompt.level === level) : generatedSpeechPrompts;
}

export function getSpeechPromptById(id: string) {
  return getGeneratedSpeechPromptById(id);
}

export function getSpeechLevels() {
  return ['A1', 'A2', 'B1', 'B2'] as const;
}

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer(options: SpeechRecognizerOptions): SpeechRecognizerController | null {
  if (typeof window === 'undefined') return null;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = options.lang ?? 'en-US';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => options.onStart?.();
  recognition.onend = () => options.onEnd?.();
  recognition.onerror = (event) => {
    const message = event.message || event.error || 'Không thể nhận giọng nói lúc này.';
    options.onError?.(message);
  };
  recognition.onresult = (event) => {
    const transcripts: string[] = [];
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result?.[0]?.transcript;
      if (transcript) transcripts.push(transcript);
    }
    options.onResult(transcripts.join(' ').trim());
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}

export function normalizeSpeechText(value: string) {
  return normalizeSpeechTextForComparison(value);
}

function uniqueTokens(value: string) {
  return Array.from(new Set(normalizeSpeechText(value).split(' ').filter(Boolean)));
}

function levenshteinDistance(left: string, right: string) {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let column = 0; column < columns; column += 1) matrix[0][column] = column;

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function tokenOverlapScore(targetTokens: string[], attemptTokens: string[]) {
  if (!targetTokens.length) return 0;
  const attemptSet = new Set(attemptTokens);
  const matched = targetTokens.filter((token) => attemptSet.has(token)).length;
  return matched / targetTokens.length;
}

function getFeedbackTier(score: number): SpeechFeedbackTier {
  if (score >= 86) return 'excellent';
  if (score >= 68) return 'good';
  return 'needs-practice';
}

function getFeedbackVi(tier: SpeechFeedbackTier, score: number) {
  if (tier === 'excellent') return `Rất rõ rồi: ${score}/100. Giữ nhịp này và thử nói tự nhiên hơn một chút.`;
  if (tier === 'good') return `Ổn rồi: ${score}/100. Bạn đã bắt được ý chính, hãy sửa vài từ còn lệch.`;
  return `Cần luyện thêm: ${score}/100. Hãy nghe mẫu, đọc chậm theo cụm rồi thử lại.`;
}

export function compareSpeechAttempt(targetText: string | GeneratedSpeechPrompt, attemptText: string): SpeechComparisonResult {
  const target = typeof targetText === 'string' ? targetText : targetText.promptText;
  const normalizedTarget = normalizeSpeechText(target);
  const normalizedAttempt = normalizeSpeechText(attemptText);
  const targetTokens = uniqueTokens(normalizedTarget);
  const attemptTokens = uniqueTokens(normalizedAttempt);
  const attemptSet = new Set(attemptTokens);
  const targetSet = new Set(targetTokens);

  const maxLength = Math.max(normalizedTarget.length, normalizedAttempt.length, 1);
  const charScore = 1 - levenshteinDistance(normalizedTarget, normalizedAttempt) / maxLength;
  const overlapScore = tokenOverlapScore(targetTokens, attemptTokens);
  const score = Math.max(0, Math.min(100, Math.round((charScore * 0.55 + overlapScore * 0.45) * 100)));
  const tier = getFeedbackTier(score);

  return {
    targetText: target,
    attemptText,
    normalizedTarget,
    normalizedAttempt,
    score,
    tier,
    feedbackVi: getFeedbackVi(tier, score),
    missingWords: targetTokens.filter((token) => !attemptSet.has(token)),
    changedWords: attemptTokens.filter((token) => !targetSet.has(token)).slice(0, 8),
    matchedWords: targetTokens.filter((token) => attemptSet.has(token)),
  };
}
