import { supabase } from '../supabaseClient';
import { isSoftRateLimited } from '../security/softRateLimit';

export type SpeakingPronunciationIssue = {
  word: string;
  heardAs: string;
  problem: string;
  vietnameseTip: string;
  practiceText: string;
};

export type SpeakingAssessmentResult = {
  canAssess: boolean;
  transcript: string;
  expectedText: string;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  accuracyScore: number;
  completenessScore: number;
  level: 'excellent' | 'good' | 'needs_practice';
  shortFeedback: string;
  encouragement: string;
  goodPoints: string[];
  pronunciationIssues: SpeakingPronunciationIssue[];
  missingWords: string[];
  extraWords: string[];
  paceFeedback: string;
  retrySentence: string;
  pooMessage: string;
};

export type SpeakingCoachApiResult =
  | { ok: true; result: SpeakingAssessmentResult }
  | { ok: false; error: string; message: string; status?: number };

type RequestSpeakingAssessmentInput = {
  audio: Blob;
  targetText: string;
  lessonId: string;
  durationMs: number;
};

const DEFAULT_ERROR = 'Poo chưa chấm được lượt nói này. Bạn thử lại nhẹ một lần nha.';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

async function readJson(response: Response) {
  try {
    return asRecord(await response.json());
  } catch {
    return {};
  }
}

export async function requestSpeakingAssessment(input: RequestSpeakingAssessmentInput): Promise<SpeakingCoachApiResult> {
  if (isSoftRateLimited('speaking-coach-assess', { limit: 6, windowMs: 60_000 })) {
    return { ok: false, error: 'RATE_LIMITED', message: 'Poo cần nghỉ vài giây trước khi nghe lượt tiếp theo nha.' };
  }

  if (!supabase) {
    return { ok: false, error: 'AUTH_UNAVAILABLE', message: 'Cổng đăng nhập chưa sẵn sàng nên Poo chưa thể lưu lượt chấm nói.' };
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    return { ok: false, error: 'AUTH_REQUIRED', message: 'Bạn đăng nhập để Poo nghe và lưu lượt luyện nói nha.' };
  }

  if (!input.audio || input.audio.size <= 0) {
    return { ok: false, error: 'EMPTY_AUDIO', message: 'Poo chưa nghe được âm thanh. Bạn thử nói gần micro hơn nha.' };
  }

  const formData = new FormData();
  formData.append('audio', input.audio, `speaking-coach-${Date.now()}.webm`);
  formData.append('targetText', input.targetText);
  formData.append('lessonId', input.lessonId);
  formData.append('durationMs', String(input.durationMs));

  try {
    const response = await fetch('/api/speaking/assess', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const payload = await readJson(response);
    if (!response.ok || payload.ok === false) {
      return {
        ok: false,
        error: String(payload.error ?? 'API_ERROR'),
        message: String(payload.message ?? DEFAULT_ERROR),
        status: response.status,
      };
    }
    return { ok: true, result: payload.result as SpeakingAssessmentResult };
  } catch {
    return { ok: false, error: 'NETWORK_ERROR', message: DEFAULT_ERROR };
  }
}