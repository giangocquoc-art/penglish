import { Buffer } from 'buffer';
import { YouTubeTranscriptApi } from 'youtube-transcript-api-js';

type ApiSuccess = {
  ok: true;
  source: 'youtube_caption';
  title?: string;
  segments: Array<{
    index: number;
    startTime: number;
    endTime: number;
    text: string;
  }>;
  transcript: string;
};

type ApiFailure = {
  ok: false;
  reason: 'BAD_REQUEST' | 'METHOD_NOT_ALLOWED' | 'NO_TRANSCRIPT';
  message: string;
};

type ApiResponse = ApiSuccess | ApiFailure;

const LANGUAGE_PRIORITY = ['en', 'en-US', 'en-GB'];

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

function getYouTubeVideoIdFromUrl(url: string) {
  const value = url.trim();
  if (!value) return '';

  const patterns = [
    /youtu\.be\/([\w-]{6,})/i,
    /youtube\.com\/watch\?[^\s]*v=([\w-]{6,})/i,
    /youtube\.com\/embed\/([\w-]{6,})/i,
    /youtube\.com\/shorts\/([\w-]{6,})/i,
  ];

  return patterns.map((pattern) => value.match(pattern)?.[1]).find(Boolean) ?? '';
}

function cleanCaptionText(text: string) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { ok: false, reason: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ POST.' });
  }

  try {
    const body = await readJsonBody(req);
    const url = safeString(body.url);
    const videoId = getYouTubeVideoIdFromUrl(url);

    if (!videoId) {
      return sendJson(res, 400, { ok: false, reason: 'BAD_REQUEST', message: 'Poo chưa đọc được link YouTube này.' });
    }

    const api = new YouTubeTranscriptApi();
    const fetched = await api.fetch(videoId, LANGUAGE_PRIORITY);
    const segments = fetched.snippets
      .map((snippet, index) => {
        const text = cleanCaptionText(snippet.text);
        if (!text) return null;
        return {
          index: index + 1,
          startTime: Number(snippet.start.toFixed(2)),
          endTime: Number((snippet.start + snippet.duration).toFixed(2)),
          text,
        };
      })
      .filter((segment): segment is { index: number; startTime: number; endTime: number; text: string } => Boolean(segment));

    if (!segments.length) {
      return sendJson(res, 404, {
        ok: false,
        reason: 'NO_TRANSCRIPT',
        message: 'Video này chưa có phụ đề hoặc Poo chưa lấy được lời thoại.',
      });
    }

    return sendJson(res, 200, {
      ok: true,
      source: 'youtube_caption',
      title: fetched.metadata?.title,
      segments,
      transcript: segments.map((segment) => segment.text).join('\n'),
    });
  } catch (error) {
    console.warn('[video-lab-youtube-transcript] failed', error instanceof Error ? error.message : 'unknown error');
    return sendJson(res, 404, {
      ok: false,
      reason: 'NO_TRANSCRIPT',
      message: 'Video này chưa có phụ đề hoặc Poo chưa lấy được lời thoại.',
    });
  }
}
