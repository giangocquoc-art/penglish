export type SpeechTextNormalizationResult = {
  original: string;
  normalizedText: string;
  tokens: string[];
};

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

function normalizeToken(token: string) {
  const contractionKey = token.replace(/'/g, '');
  return CONTRACTION_ALIASES[contractionKey] ?? token;
}

function parseOrdinalSuffix(token: string) {
  const match = token.match(/^(\d+)(st|nd|rd|th)$/);
  return match ? match[1] : token;
}

function parseNumberWords(tokens: string[], index: number): { value: number; consumed: number } | null {
  const first = tokens[index];
  const second = tokens[index + 1];
  const third = tokens[index + 2];

  if (ORDINALS[first] !== undefined) return { value: ORDINALS[first], consumed: 1 };
  if (UNITS[first] !== undefined) {
    if (second === 'hundred') return { value: UNITS[first] * 100, consumed: 2 };
    return { value: UNITS[first], consumed: 1 };
  }
  if (TENS[first] !== undefined) {
    if (second && UNITS[second] !== undefined) return { value: TENS[first] + UNITS[second], consumed: 2 };
    if (second && ORDINALS[second] !== undefined && ORDINALS[second] < 10) return { value: TENS[first] + ORDINALS[second], consumed: 2 };
    return { value: TENS[first], consumed: 1 };
  }
  if (first === 'a' && second === 'hundred') return { value: 100, consumed: 2 };
  if (first === 'one' && second === 'hundred' && third === 'th') return { value: 100, consumed: 3 };
  return null;
}

export function normalizeSpeechTextForComparison(text: string): string {
  const rawTokens = text
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
    .map((token) => parseOrdinalSuffix(normalizeToken(token)));

  const normalized: string[] = [];
  for (let index = 0; index < rawTokens.length; index += 1) {
    const parsed = parseNumberWords(rawTokens, index);
    if (parsed && parsed.value >= 0 && parsed.value <= 100) {
      normalized.push(String(parsed.value));
      index += parsed.consumed - 1;
    } else {
      normalized.push(rawTokens[index]);
    }
  }

  return normalized.join(' ').replace(/\s+/g, ' ').trim();
}

export function tokenizeSpeechTextForComparison(text: string): string[] {
  const normalized = normalizeSpeechTextForComparison(text);
  return normalized ? normalized.split(' ').filter(Boolean) : [];
}

export function normalizeSpeechTextDetailed(text: string): SpeechTextNormalizationResult {
  const normalizedText = normalizeSpeechTextForComparison(text);
  return {
    original: text,
    normalizedText,
    tokens: normalizedText ? normalizedText.split(' ').filter(Boolean) : [],
  };
}

export function areSpeechTextsEquivalent(left: string, right: string): boolean {
  return normalizeSpeechTextForComparison(left) === normalizeSpeechTextForComparison(right);
}
