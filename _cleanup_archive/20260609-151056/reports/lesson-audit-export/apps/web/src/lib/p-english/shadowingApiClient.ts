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
};

const DEFAULT_ERROR_MESSAGE = 'Poo chưa gửi được bản ghi để AI góp ý. Hãy thử lại sau một chút.';

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, 12);
}

function normalizeConfidence(value: unknown): ShadowingApiConfidence {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'low';
}

function normalizeSuccess(payload: Record<string, unknown>, targetText: string): ShadowingApiSuccess {
  const transcript = String(payload.transcript ?? '').trim();
  const normalizedTranscript = String(payload.normalizedTranscript ?? '').trim() || normalizeSpeechTextForComparison(transcript);
  const normalizedTarget = String(payload.normalizedTarget ?? '').trim() || normalizeSpeechTextForComparison(targetText);

  return {
    ok: true,
    source: 'gemini',
    score: Math.max(0, Math.min(100, Number(payload.score ?? 0) || 0)),
    confidence: normalizeConfidence(payload.confidence),
    transcript,
    normalizedTranscript,
    normalizedTarget,
    matchedWords: normalizeStringArray(payload.matchedWords),
    missingWords: normalizeStringArray(payload.missingWords),
    extraWords: normalizeStringArray(payload.extraWords),
    changedWords: normalizeStringArray(payload.changedWords ?? payload.misheardWords),
    pronunciationTips: normalizeStringArray(payload.pronunciationTips),
    rhythmTips: normalizeStringArray(payload.rhythmTips),
    nextDrill: String(payload.nextDrill ?? '').trim(),
    coachMessage: String(payload.coachMessage ?? '').trim() || 'Poo đã nghe bản ghi. Hãy luyện lại một lượt thật chậm và rõ.',
  };
}

export async function requestShadowingFeedback(input: ShadowingFeedbackRequest): Promise<ShadowingApiResult> {
  if (!input.audio || input.audio.size <= 0) {
    return { ok: false, error: 'EMPTY_AUDIO', message: 'Poo chưa nghe được âm thanh. Bạn thử nói gần micro hơn hoặc ghi âm lại nhé.' };
  }

  const formData = new FormData();
  formData.append('audio', input.audio, `shadowing-${Date.now()}.webm`);
  formData.append('targetText', input.targetText);
  formData.append('translation', input.translation ?? '');
  formData.append('lessonTitle', input.lessonTitle ?? 'Shadowing practice');
  formData.append('level', input.level ?? 'A1');
  formData.append('sentenceIndex', String(input.sentenceIndex ?? 0));

  try {
    const response = await fetch('/api/shadowing-feedback', {
      method: 'POST',
      body: formData,
    });

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { ok: false, error: 'INVALID_JSON', status: response.status, message: 'API trả về dữ liệu chưa đúng định dạng.' };
    }

    const record = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;

    if (!response.ok || record.ok === false) {
      const error = String(record.error ?? 'API_ERROR') as ShadowingApiFailure['error'];
      return {
        ok: false,
        error: error === 'GEMINI_API_KEY_MISSING' || error === 'EMPTY_AUDIO' || error === 'NO_AUDIO' ? error : 'API_ERROR',
        status: response.status,
        message: String(record.message ?? DEFAULT_ERROR_MESSAGE),
      };
    }

    if (record.ok !== true) {
      return { ok: false, error: 'INVALID_JSON', status: response.status, message: 'API trả về dữ liệu chưa đúng định dạng.' };
    }

    return normalizeSuccess(record, input.targetText);
  } catch {
    return { ok: false, error: 'NETWORK_ERROR', message: 'Không kết nối được API góp ý. Hãy kiểm tra mạng rồi thử lại.' };
  }
}
