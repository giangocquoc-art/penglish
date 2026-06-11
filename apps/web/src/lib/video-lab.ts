export type VideoSegment = {
  id: string;
  index: number;
  startTime?: number;
  endTime?: number;
  text: string;
  translationVi?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

export type VideoLesson = {
  id: string;
  title: string;
  sourceType: 'youtube' | 'upload' | 'manual';
  sourceUrl?: string;
  videoUrl?: string;
  transcript: string;
  segments: VideoSegment[];
};

export type ComparedWord = {
  id: string;
  expected: string;
  actual?: string;
  status: 'correct' | 'wrong' | 'missing';
};

function secondsFromTimestamp(value: string) {
  const normalized = value.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length < 2) return undefined;
  const seconds = Number(parts.pop());
  const minutes = Number(parts.pop());
  const hours = parts.length ? Number(parts.pop()) : 0;
  if (![seconds, minutes, hours].every(Number.isFinite)) return undefined;
  return hours * 3600 + minutes * 60 + seconds;
}

function stripCueNoise(text: string) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\{\\[^}]+\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferDifficulty(text: string): VideoSegment['difficulty'] {
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words <= 7) return 'easy';
  if (words <= 14) return 'medium';
  return 'hard';
}

function splitPlainText(transcript: string): VideoSegment[] {
  const cleaned = transcript.replace(/\r/g, '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleaned];
  return sentences
    .map((text) => stripCueNoise(text))
    .filter(Boolean)
    .map((text, index) => ({
      id: `segment-${index + 1}`,
      index: index + 1,
      text,
      difficulty: inferDifficulty(text),
    }));
}

export function splitTranscriptIntoSegments(transcript: string): VideoSegment[] {
  const content = transcript.replace(/^WEBVTT\s*/i, '').replace(/\r/g, '').trim();
  if (!content) return [];

  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const timedSegments: VideoSegment[] = [];

  blocks.forEach((block) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const timeLineIndex = lines.findIndex((line) => line.includes('-->'));
    if (timeLineIndex === -1) return;

    const [rawStart, rawEnd] = lines[timeLineIndex].split('-->').map((part) => part.trim().split(/\s+/)[0]);
    const text = stripCueNoise(lines.slice(timeLineIndex + 1).join(' '));
    if (!text) return;

    timedSegments.push({
      id: `segment-${timedSegments.length + 1}`,
      index: timedSegments.length + 1,
      startTime: secondsFromTimestamp(rawStart),
      endTime: secondsFromTimestamp(rawEnd),
      text,
      difficulty: inferDifficulty(text),
    });
  });

  if (timedSegments.length) return timedSegments;
  return splitPlainText(content);
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, '');
}

export function compareTypedAnswer(target: string, input: string): ComparedWord[] {
  const targetWords = target.split(/\s+/).filter(Boolean);
  const inputWords = input.split(/\s+/).filter(Boolean);

  return targetWords.map((expected, index) => {
    const actual = inputWords[index];
    if (!actual) {
      return { id: `word-${index + 1}`, expected, status: 'missing' };
    }
    return {
      id: `word-${index + 1}`,
      expected,
      actual,
      status: normalizeWord(expected) === normalizeWord(actual) ? 'correct' : 'wrong',
    };
  });
}

export function getYouTubeVideoIdFromUrl(url: string) {
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
