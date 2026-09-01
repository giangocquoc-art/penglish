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

function StringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, 12);
}

export async function requestSpeakingAssessment(input: RequestSpeakingAssessmentInput): Promise<SpeakingCoachApiResult> {
  if (isSoftRateLimited('speaking-coach-assess', { limit: 6, windowMs: 60_000 })) {
    return { ok: false, error: 'RATE_LIMITED', message: 'Poo cần nghỉ vài giây trước khi nghe lượt tiếp theo nha.' };
  }

  if (!input.audio || input.audio.size <= 0) {
    return { ok: false, error: 'EMPTY_AUDIO', message: 'Poo chưa nghe được âm thanh. Bạn thử nói gần micro hơn nha.' };
  }

  const formData = new FormData();
  formData.append('audio', input.audio, `speaking-coach-${Date.now()}.webm`);
  formData.append('targetText', input.targetText);
  formData.append('translation', '');
  formData.append('lessonTitle', `Speaking Coach — ${input.lessonId}`);
  formData.append('level', 'A1');

  try {
    const response = await fetch('/api/shadowing-feedback', {
      method: 'POST',
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

    // Map ShadowingApiSuccess shape to SpeakingAssessmentResult
    const score = Number(payload.score ?? 0);
    const transcript = String(payload.transcript ?? '');
    const matchedWords = StringArray(payload.matchedWords);
    const missingWords = StringArray(payload.missingWords);
    const extraWords = StringArray(payload.extraWords);
    const pronunciationIssues = StringArray(payload.pronunciationTips);
    const level: SpeakingAssessmentResult['level'] = score >= 85 ? 'excellent' : score >= 60 ? 'good' : 'needs_practice';

    return {
      ok: true,
      result: {
        canAssess: true,
        transcript,
        expectedText: input.targetText,
        overallScore: score,
        pronunciationScore: score,
        fluencyScore: Math.min(100, score + 5),
        accuracyScore: matchedWords.length > 0 ? Math.round((matchedWords.length / Math.max(1, matchedWords.length + missingWords.length)) * 100) : score,
        completenessScore: missingWords.length === 0 ? 100 : Math.max(0, 100 - missingWords.length * 15),
        level,
        shortFeedback: String(payload.coachMessage ?? ''),
        encouragement: 'Tiếp tục luyện tập mỗi ngày nhé!',
        goodPoints: StringArray(payload.rhythmTips),
        pronunciationIssues: pronunciationIssues.map((tip) => ({ word: input.targetText.split(' ')[0] ?? '', heardAs: '', problem: tip, vietnameseTip: tip, practiceText: input.targetText })),
        missingWords,
        extraWords,
        paceFeedback: StringArray(payload.pronunciationTips).join(' ') || 'Nhịp nói ổn.',
        retrySentence: String(payload.nextDrill ?? input.targetText),
        pooMessage: String(payload.coachMessage ?? ''),
      },
    };
  } catch {
    return { ok: false, error: 'NETWORK_ERROR', message: DEFAULT_ERROR };
  }
}