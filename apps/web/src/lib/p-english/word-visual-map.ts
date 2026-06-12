export const WORD_VISUAL_CATEGORIES = [
  'greeting',
  'family',
  'school',
  'classroom',
  'daily-routine',
  'food',
  'drink',
  'place',
  'direction',
  'time',
  'hobby',
  'object',
  'action',
  'emotion',
  'politeness',
  'default',
] as const;

export type WordVisualCategory = (typeof WORD_VISUAL_CATEGORIES)[number];

export type WordVisualScene = {
  category: WordVisualCategory;
  title: string;
  emoji: string;
  accentColor: string;
  softColor: string;
  hint: string;
  pronunciationHintVi: string;
};

const DEFAULT_PRONUNCIATION_HINT = 'Nghe chậm, nhìn cảnh, rồi đọc lại bằng giọng rõ ràng.';

export const WORD_CATEGORY_SCENES: Record<WordVisualCategory, WordVisualScene> = {
  greeting: {
    category: 'greeting',
    title: 'Chào hỏi thân thiện',
    emoji: '👋',
    accentColor: '#2F9EEB',
    softColor: '#DDF5FF',
    hint: 'Một nhân vật nhỏ vẫy tay để gợi nhớ lời chào.',
    pronunciationHintVi: 'Mở miệng nhẹ, nói ngắn và thân thiện như đang chào bạn.',
  },
  family: {
    category: 'family',
    title: 'Gia đình',
    emoji: '🏠',
    accentColor: '#F97316',
    softColor: '#FFEDD5',
    hint: 'Một mái nhà ấm áp giúp liên tưởng đến người thân.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  school: {
    category: 'school',
    title: 'Trường học',
    emoji: '🎒',
    accentColor: '#7C3AED',
    softColor: '#EDE9FE',
    hint: 'Cặp sách và bảng nhỏ gợi bối cảnh ở trường.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  classroom: {
    category: 'classroom',
    title: 'Trong lớp học',
    emoji: '✏️',
    accentColor: '#2563EB',
    softColor: '#DBEAFE',
    hint: 'Bàn học, bútừ vựng giúp nhớ đồ vật trong lớp.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  'daily-routine': {
    category: 'daily-routine',
    title: 'Thói quen hằng ngày',
    emoji: '🪥',
    accentColor: '#0D9488',
    softColor: '#CCFBF1',
    hint: 'Một chuỗi việc nhỏ trong ngày giúp nhớ hành động quen thuộc.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  food: {
    category: 'food',
    title: 'Đồ ăn',
    emoji: '🍎',
    accentColor: '#DC2626',
    softColor: '#FEE2E2',
    hint: 'Món ăn nổi bật ở giữa thẻ để dễ đoán nghĩa.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  drink: {
    category: 'drink',
    title: 'Đồ uống',
    emoji: '🥤',
    accentColor: '#0891B2',
    softColor: '#CFFAFE',
    hint: 'Chiếc cốc nhỏ và giọt nước gợi ý đồ uống.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  place: {
    category: 'place',
    title: 'Địa điểm',
    emoji: '📍',
    accentColor: '#16A34A',
    softColor: '#DCFCE7',
    hint: 'Dấu ghim vị trí giúp nhớ nơi chốn.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  direction: {
    category: 'direction',
    title: 'Phương hướng',
    emoji: '➡️',
    accentColor: '#EA580C',
    softColor: '#FED7AA',
    hint: 'Mũi tên đơn giản giúp hình dung hướng đi.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  time: {
    category: 'time',
    title: 'Thời gian',
    emoji: '☀️',
    accentColor: '#F59E0B',
    softColor: '#FEF3C7',
    hint: 'Mặt trời, đồng hồ hoặc ánh sáng gợi thời điểm trong ngày.',
    pronunciationHintVi: 'Đọc chậm cụm thời gian, nhấn nhẹ vào từ chính.',
  },
  hobby: {
    category: 'hobby',
    title: 'Sở thích',
    emoji: '🎨',
    accentColor: '#DB2777',
    softColor: '#FCE7F3',
    hint: 'Một hoạt động vui giúp nhớ điều mình thích làm.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  object: {
    category: 'object',
    title: 'Đồ vật',
    emoji: '🧩',
    accentColor: '#4F46E5',
    softColor: '#E0E7FF',
    hint: 'Đồ vật được đặt như một mảnh ghép để dễ nhận diện.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  action: {
    category: 'action',
    title: 'Hành động',
    emoji: '🏃',
    accentColor: '#059669',
    softColor: '#D1FAE5',
    hint: 'Đường chuyển động nhỏ giúp nhớ đây là một hành động.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  emotion: {
    category: 'emotion',
    title: 'Cảm xúc',
    emoji: '💛',
    accentColor: '#EAB308',
    softColor: '#FEF9C3',
    hint: 'Biểu tượng trái tim và nét mặt đơn giản gợi cảm xúc.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
  politeness: {
    category: 'politeness',
    title: 'Lịch sự',
    emoji: '🤝',
    accentColor: '#9333EA',
    softColor: '#F3E8FF',
    hint: 'Cử chỉ lịch sự giúp nhớ lời cảm ơn, xin lỗi hoặc làm quen.',
    pronunciationHintVi: 'Nói mềm và rõ, giống như đang thật sự lịch sự với người nghe.',
  },
  default: {
    category: 'default',
    title: 'Gợi nhớ bằng hình',
    emoji: '✨',
    accentColor: '#2F9EEB',
    softColor: '#E8F4FF',
    hint: 'Một cảnh đơn giản giúp nối từ từ vựnghĩa tiếng Việt.',
    pronunciationHintVi: DEFAULT_PRONUNCIATION_HINT,
  },
};

const WORD_SCENE_OVERRIDES: Record<string, Partial<WordVisualScene>> = {
  hello: {
    category: 'greeting',
    title: 'Hello!',
    emoji: '🐋',
    hint: 'Cá voi nhỏ vẫy tay chào bạn.',
    pronunciationHintVi: 'Đọc như một lời chào ngắn, vui và rõ.',
  },
  'good morning': {
    category: 'time',
    title: 'Buổi sáng tốt lành',
    emoji: '🌅',
    hint: 'Mặt trời buổi sáng nhô lên để gợi nhớ “good morning”.',
    pronunciationHintVi: 'Nói chậm hai nhịp: good / morning.',
  },
  'my name is': {
    category: 'greeting',
    title: 'Giới thiệu tên',
    emoji: '🏷️',
    hint: 'Thẻ tên nhỏ nhắc bạn nói “my name is...”.',
    pronunciationHintVi: 'Nói liền cụm “my name is”, rồi thêm tên của bạn.',
  },
  'nice to meet you': {
    category: 'politeness',
    title: 'Rất vui được gặp bạn',
    emoji: '🤝',
    hint: 'Hai nhân vật nhỏ đứng cạnh nhau để gợi cảnh làm quen.',
    pronunciationHintVi: 'Đọc mềm và thân thiện, nhấn nhẹ ở “meet”.',
  },
  'thank you': {
    category: 'politeness',
    title: 'Cảm ơn',
    emoji: '💐',
    hint: 'Một bó hoa nhỏ và cử chỉ biết ơn giúp nhớ “thank you”.',
    pronunciationHintVi: 'Đọc rõ âm đầu “th”, sau đó nói “you” thật nhẹ.',
  },
  goodbye: {
    category: 'greeting',
    title: 'Tạm biệt',
    emoji: '👋',
    hint: 'Nhân vật nhỏ vẫy tay chào tạm biệt.',
    pronunciationHintVi: 'Nói thành hai nhịp nhẹ: good / bye.',
  },
};

export function normalizeWordVisualKey(wordOrPhrase: string): string {
  return wordOrPhrase
    .trim()
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\.{2,}/g, '')
    .replace(/[!?.,:;]/g, '')
    .replace(/\s+/g, ' ');
}

export function isWordVisualCategory(category: string | undefined): category is WordVisualCategory {
  return WORD_VISUAL_CATEGORIES.includes((category ?? 'default') as WordVisualCategory);
}

export function getWordVisualScene(
  wordOrPhrase: string,
  visualCategory?: string,
  options: {
    animatedSceneHint?: string;
    pronunciationHintVi?: string;
  } = {},
): WordVisualScene {
  const normalizedKey = normalizeWordVisualKey(wordOrPhrase);
  const override = WORD_SCENE_OVERRIDES[normalizedKey];
  const category = override?.category ?? (isWordVisualCategory(visualCategory) ? visualCategory : 'default');
  const base = WORD_CATEGORY_SCENES[category];

  return {
    ...base,
    ...override,
    category,
    hint: options.animatedSceneHint || override?.hint || base.hint,
    pronunciationHintVi: options.pronunciationHintVi || override?.pronunciationHintVi || base.pronunciationHintVi,
  };
}
