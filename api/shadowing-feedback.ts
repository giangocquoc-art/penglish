type ShadowingApiConfidence = 'high' | 'medium' | 'low';

type ShadowingApiStatus = 'correct' | 'nearCorrect' | 'retry';

type ApiResponse = {
  ok: boolean;
  source?: 'gemini';
  score?: number;
  confidence?: ShadowingApiConfidence;
  status?: ShadowingApiStatus;
  passed?: boolean;
  allowContinue?: boolean;
  transcript?: string;
  normalizedTranscript?: string;
  normalizedTarget?: string;
  matchedWords?: string[];
  missingWords?: string[];
  extraWords?: string[];
  changedWords?: string[];
  pronunciationTips?: string[];
  rhythmTips?: string[];
  nextDrill?: string;
  coachMessage?: string;
  error?: string;
  message?: string;
};

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const UNITS: Record<string, number> = {
  zero: 0,
  oh: 0,
  o: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fourty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const ORDINALS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
  thirtieth: 30,
  fortieth: 40,
  fiftieth: 50,
  sixtieth: 60,
  seventieth: 70,
  eightieth: 80,
  ninetieth: 90,
  hundredth: 100,
};

const CONTRACTION_ALIASES: Record<string, string> = {
  im: "i'm",
  youre: "you're",
  hes: "he's",
  shes: "she's",
  its: "it's",
  were: "we're",
  theyre: "they're",
  whats: "what's",
  wheres: "where's",
  whos: "who's",
  dont: "don't",
  doesnt: "doesn't",
  didnt: "didn't",
  cant: "can't",
  cannot: "can't",
  wont: "won't",
  isnt: "isn't",
  arent: "aren't",
  wasnt: "wasn't",
  werent: "weren't",
};

function sendJson(res: any, status: number, payload: ApiResponse) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function safeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, 12);
}

function parseOrdinalSuffix(token: string) {
  const match = token.match(/^(\d+)(st|nd|rd|th)$/);
  return match ? match[1] : token;
}

function parseNumberWords(tokens: string[], index: number): { value: number; consumed: number } | null {
  const first = tokens[index];
  const second = tokens[index + 1];
  if (ORDINALS[first] !== undefined) return { value: ORDINALS[first], consumed: 1 };
  if (UNITS[first] !== undefined) return second === 'hundred' ? { value: UNITS[first] * 100, consumed: 2 } : { value: UNITS[first], consumed: 1 };
  if (TENS[first] !== undefined) {
    if (second && UNITS[second] !== undefined) return { value: TENS[first] + UNITS[second], consumed: 2 };
    if (second && ORDINALS[second] !== undefined && ORDINALS[second] < 10) return { value: TENS[first] + ORDINALS[second], consumed: 2 };
    return { value: TENS[first], consumed: 1 };
  }
  if (first === 'a' && second === 'hundred') return { value: 100, consumed: 2 };
  return null;
}

function normalizeSpeechTextForComparison(text: string): string {
  const tokens = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’`]/g, "'")
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((token) => parseOrdinalSuffix(CONTRACTION_ALIASES[token.replace(/'/g, '')] ?? token));

  const normalized: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const parsed = parseNumberWords(tokens, index);
    if (parsed && parsed.value >= 0 && parsed.value <= 100) {
      normalized.push(String(parsed.value));
      index += parsed.consumed - 1;
    } else {
      normalized.push(tokens[index]);
    }
  }
  return normalized.join(' ').trim();
}

function scoreNormalizedWords(normalizedTarget: string, normalizedTranscript: string) {
  const targetTokens = normalizedTarget.split(' ').filter(Boolean);
  const transcriptTokens = normalizedTranscript.split(' ').filter(Boolean);
  const used = new Set<number>();
  const matchedWords: string[] = [];

  targetTokens.forEach((word) => {
    const index = transcriptTokens.findIndex((candidate, candidateIndex) => !used.has(candidateIndex) && candidate === word);
    if (index >= 0) {
      used.add(index);
      matchedWords.push(word);
    }
  });

  const matchedSet = new Set(matchedWords);
  return {
    matchedWords: Array.from(new Set(matchedWords)).slice(0, 12),
    missingWords: targetTokens.filter((word) => !matchedSet.has(word)).slice(0, 12),
    extraWords: transcriptTokens.filter((word, index) => !used.has(index) && !targetTokens.includes(word)).slice(0, 12),
    score: targetTokens.length ? Math.round((matchedWords.length / targetTokens.length) * 100) : 0,
    changedWords: transcriptTokens.filter((word) => !targetTokens.includes(word)).slice(0, 12),
  };
}

function normalizeStatus(value: unknown, score: number, confidence: ShadowingApiConfidence, targetText: string, transcript: string): ShadowingApiStatus {
  if (value === 'correct' || value === 'nearCorrect' || value === 'retry') return value;
  const normalizedTarget = normalizeSpeechTextForComparison(targetText);
  const normalizedTranscript = normalizeSpeechTextForComparison(transcript);
  if (/\bpoo\b/.test(normalizedTarget) && /\bboo\b/.test(normalizedTranscript)) return 'nearCorrect';
  if (!normalizedTranscript || confidence === 'low' && score < 62) return 'retry';
  if (score >= 88 && confidence !== 'low') return 'correct';
  if (score >= 62) return 'nearCorrect';
  return 'retry';
}

function normalizeGeminiPayload(payload: Record<string, unknown>, targetText: string): ApiResponse {
  const confidence = payload.confidence === 'high' || payload.confidence === 'medium' || payload.confidence === 'low' ? payload.confidence : 'low';
  const transcript = safeString(payload.transcript);
  const normalizedTranscript = normalizeSpeechTextForComparison(safeString(payload.normalizedTranscript, transcript));
  const normalizedTarget = normalizeSpeechTextForComparison(safeString(payload.normalizedTarget, targetText));
  const localWords = scoreNormalizedWords(normalizedTarget, normalizedTranscript);
  const score = Math.max(0, Math.min(100, Number(payload.score ?? localWords.score) || 0));
  const status = normalizeStatus(payload.status, score, confidence, targetText, transcript);
  const passed = status === 'correct' || status === 'nearCorrect';
  const allowContinue = passed;
  const changedWords = normalizeList(payload.changedWords ?? payload.misheardWords);
  const numberEquivalenceTip = normalizedTranscript && normalizedTarget && (targetText !== normalizedTarget || transcript !== normalizedTranscript)
    ? ['Poo đã hiểu dạng số và dạng chữ là tương đương trong câu này.']
    : [];
  const pooBooMessage = /\bpoo\b/.test(normalizedTarget) && /\bboo\b/.test(normalizedTranscript)
    ? "Đạt rồi đó! Poo nghe hơi giống 'boo' một chút, lần sau thử bật nhẹ âm /p/ nha."
    : '';

  return {
    ok: true,
    source: 'gemini',
    score,
    confidence,
    status,
    passed,
    allowContinue,
    transcript,
    normalizedTranscript,
    normalizedTarget,
    matchedWords: normalizeList(payload.matchedWords).length ? normalizeList(payload.matchedWords) : localWords.matchedWords,
    missingWords: normalizeList(payload.missingWords).length ? normalizeList(payload.missingWords) : localWords.missingWords,
    extraWords: normalizeList(payload.extraWords).length ? normalizeList(payload.extraWords) : localWords.extraWords,
    changedWords: changedWords.length ? changedWords : [],
    pronunciationTips: [...numberEquivalenceTip, ...normalizeList(payload.pronunciationTips)].slice(0, 12),
    rhythmTips: normalizeList(payload.rhythmTips),
    nextDrill: safeString(payload.nextDrill, allowContinue ? 'Nếu muốn mượt hơn, nghe mẫu một lần rồi nói lại nhẹ nhàng.' : 'Đọc chậm câu mẫu, ghi âm lại một lần, rồi nghe xem âm cuối đã rõ hơn chưa.'),
    coachMessage: pooBooMessage || safeString(payload.coachMessage, allowContinue ? 'Đạt rồi, Poo góp ý nhẹ nha. Chỉ cần nói câu ngắn, đúng ý, rõ nhịp. Không cần nói hoàn hảo.' : 'Poo nghe chưa rõ. Bạn thử nói chậm hơn, tách cụm rõ hơn, rồi ghi âm lại nhé.'),
  };
}

function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error('Gemini response did not contain JSON');
  }
}

async function readJsonBody(req: any): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function readMultipartFallback(req: any): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const body = Buffer.concat(chunks);
  const contentType = String(req.headers['content-type'] ?? '');
  const boundaryValue = contentType.match(/boundary=(.+)$/)?.[1]?.trim().replace(/^"|"$/g, '');
  if (!boundaryValue) return {};

  const boundary = Buffer.from(`--${boundaryValue}`);
  const fields: Record<string, unknown> = {};
  let offset = 0;

  while (offset < body.length) {
    const boundaryStart = body.indexOf(boundary, offset);
    if (boundaryStart < 0) break;
    const partStart = boundaryStart + boundary.length;
    if (body.slice(partStart, partStart + 2).toString() === '--') break;
    const headersStart = body.slice(partStart, partStart + 2).toString() === '\r\n' ? partStart + 2 : partStart;
    const headersEnd = body.indexOf(Buffer.from('\r\n\r\n'), headersStart);
    if (headersEnd < 0) break;
    const nextBoundary = body.indexOf(boundary, headersEnd + 4);
    if (nextBoundary < 0) break;

    const headers = body.slice(headersStart, headersEnd).toString('utf8');
    const name = headers.match(/name="([^"]+)"/)?.[1];
    if (name) {
      let contentEnd = nextBoundary;
      if (body[contentEnd - 2] === 13 && body[contentEnd - 1] === 10) contentEnd -= 2;
      const content = body.slice(headersEnd + 4, contentEnd);
      if (name === 'audio') {
        fields.audioBase64 = content.toString('base64');
        fields.audioBytes = content.length;
        fields.mimeType = headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]?.trim() || 'audio/webm';
      } else {
        fields[name] = content.toString('utf8').trim();
      }
    }
    offset = nextBoundary;
  }

  return fields;
}

async function parseRequest(req: any): Promise<Record<string, unknown>> {
  const contentType = String(req.headers['content-type'] ?? '');
  if (contentType.includes('multipart/form-data')) return readMultipartFallback(req);
  return readJsonBody(req);
}

function buildPrompt(fields: Record<string, unknown>) {
  const targetText = safeString(fields.targetText);
  const translation = safeString(fields.translation);
  const lessonTitle = safeString(fields.lessonTitle, 'Shadowing practice');
  const level = safeString(fields.level, 'A1');
  const sentenceIndex = safeString(fields.sentenceIndex, '0');
  const normalizedTarget = normalizeSpeechTextForComparison(targetText);

  return [
    'Bạn là Poo, trợ lý Shadowing tiếng Anh cho người Việt mới học.',
    'Hãy nghe audio người học và so sánh với targetText theo hướng luyện nói thân thiện, không phải kiểm tra phát âm tuyệt đối.',
    'Endpoint này phục vụ cả Shadowing và English Speed, nên phản hồi phải audio/API-first, tập trung vào phát âm, nhịp đọc và độ rõ.',
    'Phân loại status: correct = rất sát câu mẫu; nearCorrect = gần đúng, hiểu được ý, sai nhẹ vài từ/âm; retry = sai quá nhiều, quá thiếu, khác ý chính hoặc không nghe rõ.',
    'correct và nearCorrect đều phải có passed=true và allowContinue=true. retry mới có passed=false và allowContinue=false.',
    'Không dùng requiredWords để chặn ở chế độ shadowing/phát âm; nếu có từ khóa thì chỉ dùng làm góp ý nhẹ.',
    'Ví dụ target "Hello. Hi, Poo. Thank you." và transcript "hello hi boo thank you" phải là nearCorrect, passed=true, allowContinue=true, góp ý âm /p/ nhẹ nhàng.',
    'Quan trọng: dạng số và dạng chữ là tương đương. Ví dụ six = 6, twenty one = 21, Unit one = Unit 1.',
    'Nếu audio không rõ, không được bịa transcript hoàn hảo; confidence phải là low và coachMessage cần hướng dẫn thu lại nhẹ nhàng.',
    'Phản hồi bằng tiếng Việt, thân thiện, ngắn gọn, không chê bai.',
    'pronunciationTips nên nêu âm cuối, trọng âm, âm dễ lẫn hoặc khẩu hình cần sửa.',
    'rhythmTips nên nêu cách ngắt cụm, tốc độ đọc, nhấn từ khóa và độ rõ từng cụm.',
    'matchedWords, missingWords, extraWords và changedWords phải là các từ/cụm ngắn đã chuẩn hóa, tối đa 12 mục mỗi nhóm.',
    'nextDrill phải là một bài luyện tiếp theo ngắn, cụ thể, có thể làm ngay bằng ghi âm lại.',
    'Chỉ trả về JSON hợp lệ, không markdown, không giải thích ngoài JSON.',
    '',
    `Lesson title: ${lessonTitle}`,
    `Level: ${level}`,
    `Sentence index: ${sentenceIndex}`,
    `Target text: ${targetText}`,
    `Normalized target: ${normalizedTarget}`,
    `Vietnamese hint: ${translation}`,
    '',
    'JSON shape bắt buộc:',
    '{"ok":true,"source":"gemini","score":0,"confidence":"high|medium|low","status":"correct|nearCorrect|retry","passed":true,"allowContinue":true,"transcript":"","normalizedTranscript":"","normalizedTarget":"","matchedWords":[],"missingWords":[],"extraWords":[],"changedWords":[],"pronunciationTips":[],"rhythmTips":[],"nextDrill":"","coachMessage":""}',
  ].join('\n');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 503, {
      ok: false,
      error: 'GEMINI_API_KEY_MISSING',
      message: 'API góp ý chưa bật. Cần thêm GEMINI_API_KEY trên server/Vercel rồi deploy lại.',
    });
  }

  try {
    const fields = await parseRequest(req);
    const audioBase64 = safeString(fields.audioBase64);
    const audioBytes = Number(fields.audioBytes ?? 0) || (audioBase64 ? Buffer.byteLength(audioBase64, 'base64') : 0);
    const mimeType = safeString(fields.mimeType, 'audio/webm');
    const targetText = safeString(fields.targetText);

    console.info('[shadowing-feedback] request', { audioBytes, mimeType, targetLength: targetText.length, model: GEMINI_MODEL });

    if (!audioBase64 || audioBytes <= 0) {
      return sendJson(res, 400, { ok: false, error: 'EMPTY_AUDIO', message: 'Poo chưa nghe được âm thanh. Bạn thử nói gần micro hơn hoặc ghi âm lại nhé.' });
    }

    if (!targetText) {
      return sendJson(res, 400, { ok: false, error: 'BAD_REQUEST', message: 'Thiếu câu mẫu để Poo chấm.' });
    }

    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: buildPrompt(fields) },
              { inline_data: { mime_type: mimeType, data: audioBase64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    const geminiJson = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.warn('[shadowing-feedback] gemini failed', { status: geminiResponse.status, model: GEMINI_MODEL });
      return sendJson(res, 502, { ok: false, error: 'GEMINI_REQUEST_FAILED', message: 'Poo nghe chưa rõ. Bạn thử nói chậm hơn, tách cụm rõ hơn, rồi ghi âm lại nhé.' });
    }

    const text = geminiJson?.candidates?.[0]?.content?.parts?.map((part: any) => part.text ?? '').join('') ?? '';
    const parsed = extractJson(text);
    return sendJson(res, 200, normalizeGeminiPayload(parsed, targetText));
  } catch (error) {
    console.error('[shadowing-feedback] failed', error instanceof Error ? error.message : 'unknown error');
    return sendJson(res, 500, { ok: false, error: 'SHADOWING_FEEDBACK_FAILED', message: 'Poo nghe chưa rõ. Bạn thử nói chậm hơn, tách cụm rõ hơn, rồi ghi âm lại nhé.' });
  }
}
