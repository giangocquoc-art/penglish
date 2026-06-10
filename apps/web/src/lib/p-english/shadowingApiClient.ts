import { normalizeSpeechTextForComparison } from './speechTextNormalizer';

export type ShadowingApiConfidence = 'high' | 'medium' | 'low';

export type ShadowingApiSuccess = {
  ok: true;
  source: 'gemini';
  score: number;
  confidence: ShadowingApiConfidence;
  transcript: string;
  normalizedTranscript: string;
  normalizedTarget: string;
  matchedWords: string[];
  missingWords: string[];
  extraWords: string[];
  changedWords: string[];
  pronunciationTips: string[];
  rhythmTips: string[];
  nextDrill: string;
  coachMessage: string;
};

export type ShadowingApiFailure = {
  ok: false;
  error: 'GEMINI_API_KEY_MISSING' | 'EMPTY_AUDIO' | 'NO_AUDIO' | 'NETWORK_ERROR' | 'INVALID_JSON' | 'API_ERROR';
  message: string;
  status?: number;
};

export type ShadowingApiResult = ShadowingApiSuccess | ShadowingApiFailure;

export type ShadowingFeedbackRequest = {
  audio: Blob;
  targetText: string;
  translation?: string;
  lessonTitle?: string;
  level?: string;
  sentenceIndex?: number;
  onTranscribed?: (transcript: string) => void;
};

const DEFAULT_ERROR_MESSAGE = 'Poo chưa nghe rõ. Bạn thử nói lại chậm hơn một chút nhé.';

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, 12);
}

function normalizeConfidence(value: unknown): ShadowingApiConfidence {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'low';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function nestedRecord(record: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  for (const key of keys) {
    const nested = asRecord(record[key]);
    if (Object.keys(nested).length > 0) return nested;
  }
  return record;
}

function extractTranscript(payload: Record<string, unknown>): string {
  const nested = nestedRecord(payload, ['data', 'result']);
  return String(payload.transcript ?? payload.text ?? nested.transcript ?? nested.text ?? '').trim();
}

function buildWordDiff(targetText: string, transcript: string) {
  const normalizedTarget = normalizeSpeechTextForComparison(targetText);
  const normalizedTranscript = normalizeSpeechTextForComparison(transcript);
  const targetWords = normalizedTarget.split(' ').filter(Boolean);
  const attemptWords = normalizedTranscript.split(' ').filter(Boolean);
  const attemptSet = new Set(attemptWords);
  const targetSet = new Set(targetWords);

  return {
    normalizedTarget,
    normalizedTranscript,
    matchedWords: targetWords.filter((word) => attemptSet.has(word)).slice(0, 12),
    missingWords: targetWords.filter((word) => !attemptSet.has(word)).slice(0, 12),
    extraWords: attemptWords.filter((word) => !targetSet.has(word)).slice(0, 12),
  };
}

function normalizeSuccess(payload: Record<string, unknown>, targetText: string, transcriptOverride = ''): ShadowingApiSuccess {
  const record = nestedRecord(payload, ['feedback', 'result', 'data']);
  const transcript = String(record.transcript ?? payload.transcript ?? transcriptOverride).trim();
  const wordDiff = buildWordDiff(targetText, transcript);
  const goodTips = normalizeStringArray(record.good);
  const fixTips = normalizeStringArray(record.fix);
  const pronunciationTips = normalizeStringArray(record.pronunciationTips);
  const rhythmTips = normalizeStringArray(record.rhythmTips);

  return {
    ok: true,
    source: 'gemini',
    score: Math.max(0, Math.min(100, Number(record.score ?? payload.score ?? 0) || 0)),
    confidence: normalizeConfidence(record.confidence ?? payload.confidence),
    transcript,
    normalizedTranscript: String(record.normalizedTranscript ?? '').trim() || wordDiff.normalizedTranscript,
    normalizedTarget: String(record.normalizedTarget ?? '').trim() || wordDiff.normalizedTarget,
    matchedWords: normalizeStringArray(record.matchedWords).length ? normalizeStringArray(record.matchedWords) : wordDiff.matchedWords,
    missingWords: normalizeStringArray(record.missingWords).length ? normalizeStringArray(record.missingWords) : wordDiff.missingWords,
    extraWords: normalizeStringArray(record.extraWords).length ? normalizeStringArray(record.extraWords) : wordDiff.extraWords,
    changedWords: normalizeStringArray(record.changedWords ?? record.misheardWords),
    pronunciationTips: pronunciationTips.length ? pronunciationTips : (fixTips.length ? fixTips : ['Nói chậm hơn và làm rõ âm cuối của từ chính.']),
    rhythmTips: rhythmTips.length ? rhythmTips : (goodTips.length ? goodTips : ['Đọc theo cụm ngắn, nghỉ nhẹ giữa các cụm.']),
    nextDrill: String(record.nextDrill ?? record.retryText ?? '').trim() || 'Luyện lại câu này thêm một lần nhé.',
    coachMessage: String(record.coachMessage ?? record.summary ?? '').trim() || 'Poo đã nghe bản ghi. Hãy luyện lại một lượt thật chậm và rõ.',
  };
}

async function readJsonResponse(response: Response): Promise<Record<string, unknown> | null> {
  try {
    return asRecord(await response.json());
  } catch {
    return null;
  }
}

export async function requestShadowingFeedback(input: ShadowingFeedbackRequest): Promise<ShadowingApiResult> {
  if (!input.audio || input.audio.size <= 0) {
    return { ok: false, error: 'EMPTY_AUDIO', message: DEFAULT_ERROR_MESSAGE };
  }

  const formData = new FormData();
  formData.append('audio', input.audio, `shadowing-${Date.now()}.webm`);

  try {
    const transcribeResponse = await fetch('/api/shadowing/transcribe', {
      method: 'POST',
      body: formData,
    });

    const transcribePayload = await readJsonResponse(transcribeResponse);
    if (!transcribePayload) {
      return { ok: false, error: 'INVALID_JSON', status: transcribeResponse.status, message: DEFAULT_ERROR_MESSAGE };
    }

    const transcript = extractTranscript(transcribePayload);
    if (!transcribeResponse.ok || transcribePayload.ok === false || !transcript) {
      return { ok: false, error: 'API_ERROR', status: transcribeResponse.status, message: DEFAULT_ERROR_MESSAGE };
    }

    input.onTranscribed?.(transcript);

    const analyzeResponse = await fetch('/api/shadowing/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetText: input.targetText,
        transcript,
        level: 'beginner',
      }),
    });

    const analyzePayload = await readJsonResponse(analyzeResponse);
    if (!analyzePayload) {
      return { ok: false, error: 'INVALID_JSON', status: analyzeResponse.status, message: DEFAULT_ERROR_MESSAGE };
    }

    if (!analyzeResponse.ok || analyzePayload.ok === false) {
      return { ok: false, error: 'API_ERROR', status: analyzeResponse.status, message: DEFAULT_ERROR_MESSAGE };
    }

    return normalizeSuccess(analyzePayload, input.targetText, transcript);
  } catch {
    return { ok: false, error: 'NETWORK_ERROR', message: DEFAULT_ERROR_MESSAGE };
  }
}
