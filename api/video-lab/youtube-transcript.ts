import { Buffer } from 'buffer';
import { YouTubeTranscriptApi } from 'youtube-transcript-api-js';
import { fetchTranscript } from 'youtube-transcript-plus';
import { getVideoDetails } from 'youtube-caption-extractor';

type CaptionSegment = {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
};

type ApiSuccess = {
  ok: true;
  source: 'youtube_caption';
  title?: string;
  packageName: TranscriptPackageName;
  language?: string;
  segments: CaptionSegment[];
  transcript: string;
};

type FailureReason = 'METHOD_NOT_ALLOWED' | 'NO_TRANSCRIPT' | 'VIDEO_ID_INVALID' | 'PACKAGE_ERROR' | 'RATE_LIMIT_OR_BLOCKED';

type ApiFailure = {
  ok: false;
  reason: FailureReason;
  message: string;
};

type ApiResponse = ApiSuccess | ApiFailure;

type TranscriptPackageName = 'youtube-transcript-api-js' | 'youtube-transcript-plus' | 'youtube-caption-extractor';

type TranscriptAttemptResult = {
  packageName: TranscriptPackageName;
  title?: string;
  language?: string;
  segments: CaptionSegment[];
};

type AttemptError = {
  packageName: TranscriptPackageName;
  error: unknown;
};

const LANGUAGE_PRIORITY = ['en', 'en-US', 'en-GB'] as const;
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const LOG_PREFIX = '[video-lab-youtube-transcript]';

function sendJson(res: any, status: number, payload: ApiResponse) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function readJsonBody(req: any): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function stripVideoIdCandidate(value: string) {
  return value.trim().replace(/[?&#].*$/, '').replace(/\/$/, '');
}

function validateVideoId(value: string) {
  const candidate = stripVideoIdCandidate(value);
  return VIDEO_ID_PATTERN.test(candidate) ? candidate : '';
}

function getYouTubeVideoIdFromUrl(url: string) {
  const value = url.trim();
  if (!value) return '';

  const directId = validateVideoId(value);
  if (directId) return directId;

  const parseableValue = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(parseableValue);
    const hostname = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    if (hostname === 'youtu.be') {
      return validateVideoId(parsed.pathname.split('/').filter(Boolean)[0] ?? '');
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'music.youtube.com') {
      const watchId = validateVideoId(parsed.searchParams.get('v') ?? '');
      if (watchId) return watchId;

      const [route, id] = parsed.pathname.split('/').filter(Boolean);
      if (['shorts', 'embed', 'live', 'v'].includes(route ?? '')) {
        return validateVideoId(id ?? '');
      }
    }
  } catch (error) {
    console.warn(`${LOG_PREFIX} URL parsing failed`, describeError(error));
  }

  const fallbackPatterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/i,
    /youtube\.com\/watch\?[^\s#]*v=([a-zA-Z0-9_-]{11})(?:[?&#]|$)/i,
    /youtube\.com\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/i,
  ];

  return fallbackPatterns.map((pattern) => value.match(pattern)?.[1]).find(Boolean) ?? '';
}

function cleanCaptionText(text: string) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&/gi, '&')
    .replace(/"/gi, '"')
    .replace(/'/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function roundSeconds(value: number) {
  return Number((Number.isFinite(value) ? value : 0).toFixed(2));
}

function normalizeSegments<T>(items: T[], read: (item: T) => { text: string; start: number; duration: number } | null): CaptionSegment[] {
  return items
    .map((item, index) => {
      const raw = read(item);
      if (!raw) return null;
      const text = cleanCaptionText(raw.text);
      if (!text) return null;
      const startTime = roundSeconds(raw.start);
      return {
        index: index + 1,
        startTime,
        endTime: roundSeconds(startTime + raw.duration),
        text,
      };
    })
    .filter((segment): segment is CaptionSegment => Boolean(segment));
}

function describeError(error: unknown) {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'unknown error';
  }
}

function isNoTranscriptError(error: unknown) {
  const text = describeError(error).toLowerCase();
  return [
    'no transcript',
    'not available',
    'notavailable',
    'no captions',
    'caption',
    'disabled',
    'language',
    'not found',
  ].some((token) => text.includes(token));
}

function isRateLimitOrBlockedError(error: unknown) {
  const text = describeError(error).toLowerCase();
  return [
    '429',
    'too many',
    'rate limit',
    'ratelimit',
    'blocked',
    'requestblocked',
    'forbidden',
    '403',
    'captcha',
    'unusual traffic',
  ].some((token) => text.includes(token));
}

function classifyFailure(errors: AttemptError[]): FailureReason {
  if (errors.some(({ error }) => isRateLimitOrBlockedError(error))) return 'RATE_LIMIT_OR_BLOCKED';
  if (errors.length && errors.every(({ error }) => isNoTranscriptError(error))) return 'NO_TRANSCRIPT';
  return 'PACKAGE_ERROR';
}

function failureMessage(reason: FailureReason) {
  if (reason === 'VIDEO_ID_INVALID') return 'Poo chưa đọc được link YouTube này.';
  if (reason === 'RATE_LIMIT_OR_BLOCKED') return 'YouTube đang giới hạn hoặc chặn lượt lấy caption. Bạn thử lại sau nhé.';
  if (reason === 'PACKAGE_ERROR') return 'Poo gặp lỗi khi đọc caption từ YouTube.';
  if (reason === 'METHOD_NOT_ALLOWED') return 'Chỉ hỗ trợ POST.';
  return 'Video này chưa có phụ đề hoặc Poo chưa lấy được lời thoại.';
}

function logAttempt(packageName: TranscriptPackageName, language?: string) {
  console.info(`${LOG_PREFIX} using package`, packageName);
  console.info(`${LOG_PREFIX} languages tried`, LANGUAGE_PRIORITY.join(', '));
  if (language) console.info(`${LOG_PREFIX} trying language`, language);
}

async function fetchWithTranscriptApiJs(videoId: string): Promise<TranscriptAttemptResult> {
  const packageName: TranscriptPackageName = 'youtube-transcript-api-js';
  logAttempt(packageName);
  const api = new YouTubeTranscriptApi();
  const fetched = await api.fetch(videoId, [...LANGUAGE_PRIORITY]);
  const segments = normalizeSegments(fetched.snippets, (snippet) => ({
    text: snippet.text,
    start: snippet.start,
    duration: snippet.duration,
  }));

  return {
    packageName,
    title: fetched.metadata?.title,
    language: fetched.languageCode,
    segments,
  };
}

async function fetchWithTranscriptPlus(videoId: string): Promise<TranscriptAttemptResult> {
  const packageName: TranscriptPackageName = 'youtube-transcript-plus';
  let lastError: unknown;

  for (const language of LANGUAGE_PRIORITY) {
    try {
      logAttempt(packageName, language);
      const fetched = await fetchTranscript(videoId, { lang: language, videoDetails: true, retries: 1 });
      const segments = normalizeSegments(fetched.segments, (segment) => ({
        text: segment.text,
        start: segment.offset,
        duration: segment.duration,
      }));

      if (segments.length) {
        return {
          packageName,
          title: fetched.videoDetails.title,
          language,
          segments,
        };
      }
    } catch (error) {
      lastError = error;
      console.warn(`${LOG_PREFIX} package failed`, packageName, language, describeError(error));
      if (isRateLimitOrBlockedError(error)) throw error;
    }
  }

  throw lastError ?? new Error('youtube-transcript-plus returned no transcript segments');
}

async function fetchWithCaptionExtractor(videoId: string): Promise<TranscriptAttemptResult> {
  const packageName: TranscriptPackageName = 'youtube-caption-extractor';
  let lastError: unknown;

  for (const language of LANGUAGE_PRIORITY) {
    try {
      logAttempt(packageName, language);
      const details = await getVideoDetails({ videoID: videoId, lang: language });
      const segments = normalizeSegments(details.subtitles, (subtitle) => ({
        text: subtitle.text,
        start: Number(subtitle.start),
        duration: Number(subtitle.dur),
      }));

      if (segments.length) {
        return {
          packageName,
          title: details.title,
          language,
          segments,
        };
      }
    } catch (error) {
      lastError = error;
      console.warn(`${LOG_PREFIX} package failed`, packageName, language, describeError(error));
      if (isRateLimitOrBlockedError(error)) throw error;
    }
  }

  throw lastError ?? new Error('youtube-caption-extractor returned no transcript segments');
}

async function fetchWithFallbacks(videoId: string) {
  const errors: AttemptError[] = [];
  const attempts: Array<() => Promise<TranscriptAttemptResult>> = [
    () => fetchWithTranscriptApiJs(videoId),
    () => fetchWithTranscriptPlus(videoId),
    () => fetchWithCaptionExtractor(videoId),
  ];

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result.segments.length) return { result, errors };
      const emptyError = new Error(`${result.packageName} returned no transcript segments`);
      errors.push({ packageName: result.packageName, error: emptyError });
      console.warn(`${LOG_PREFIX} package returned empty`, result.packageName);
    } catch (error) {
      const packageName = attempt.toString().includes('TranscriptApiJs')
        ? 'youtube-transcript-api-js'
        : attempt.toString().includes('TranscriptPlus')
          ? 'youtube-transcript-plus'
          : 'youtube-caption-extractor';
      errors.push({ packageName, error });
      console.warn(`${LOG_PREFIX} package failed`, packageName, describeError(error));
    }
  }

  return { result: null, errors };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { ok: false, reason: 'METHOD_NOT_ALLOWED', message: failureMessage('METHOD_NOT_ALLOWED') });
  }

  try {
    const body = await readJsonBody(req);
    const url = safeString(body.url);
    const videoId = getYouTubeVideoIdFromUrl(url);

    console.info(`${LOG_PREFIX} received URL`, url);
    console.info(`${LOG_PREFIX} extracted videoId`, videoId || '(invalid)');
    console.info(`${LOG_PREFIX} language priority`, LANGUAGE_PRIORITY.join(', '));

    if (!videoId) {
      return sendJson(res, 400, { ok: false, reason: 'VIDEO_ID_INVALID', message: failureMessage('VIDEO_ID_INVALID') });
    }

    const { result, errors } = await fetchWithFallbacks(videoId);

    if (!result) {
      const reason = classifyFailure(errors);
      console.warn(`${LOG_PREFIX} all transcript packages failed`, {
        reason,
        errors: errors.map(({ packageName, error }) => ({ packageName, error: describeError(error) })),
      });
      return sendJson(res, reason === 'RATE_LIMIT_OR_BLOCKED' ? 429 : reason === 'PACKAGE_ERROR' ? 502 : 404, {
        ok: false,
        reason,
        message: failureMessage(reason),
      });
    }

    console.info(`${LOG_PREFIX} transcript success`, {
      packageName: result.packageName,
      language: result.language,
      segmentCount: result.segments.length,
    });

    return sendJson(res, 200, {
      ok: true,
      source: 'youtube_caption',
      title: result.title,
      packageName: result.packageName,
      language: result.language,
      segments: result.segments,
      transcript: result.segments.map((segment) => segment.text).join('\n'),
    });
  } catch (error) {
    const reason = isRateLimitOrBlockedError(error) ? 'RATE_LIMIT_OR_BLOCKED' : 'PACKAGE_ERROR';
    console.error(`${LOG_PREFIX} unexpected handler failure`, describeError(error));
    return sendJson(res, reason === 'RATE_LIMIT_OR_BLOCKED' ? 429 : 502, {
      ok: false,
      reason,
      message: failureMessage(reason),
    });
  }
}
