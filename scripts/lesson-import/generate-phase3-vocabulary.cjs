const fs = require('fs');
const path = require('path');

const root = process.cwd();
const csvPath = path.join(root, 'external-sources', 'words-cefr-dataset', 'datasets', 'word_list_cefr.csv');
const outDir = path.join(root, 'apps', 'web', 'src', 'data', 'vocabulary');
const adapterPath = path.join(root, 'apps', 'web', 'src', 'lib', 'p-english', 'vocabularyAdapter.ts');

fs.mkdirSync(outDir, { recursive: true });

const requiredCounts = { A1: 80, A2: 80, B1: 60, B2: 40 };
const groupTitles = {
  A1: ['Nền tảng A1', 'Các từ nền tảng để nhận biết người, đồ vật, thời gian và hành động rất quen thuộc.'],
  A2: ['Mở rộng A2', 'Các từ giúp nói về đời sống hằng ngày, kế hoạch đơn giản và trải nghiệm cá nhân.'],
  B1: ['Tự tin B1', 'Các từ giúp giải thích ý kiến, kể chuyện ngắn và xử lý tình huống quen thuộc.'],
  B2: ['Linh hoạt B2', 'Các từ học thuật/thực tế hơn để nói rõ sắc thái, nguyên nhân và lựa chọn.'],
};
const posVi = {
  noun: 'danh từ',
  verb: 'động từ',
  adjective: 'tính từ',
  adverb: 'trạng từ',
  preposition: 'giới từ',
  determiner: 'từ hạn định',
  pronoun: 'đại từ',
  conjunction: 'liên từ',
  exclamation: 'thán từ',
  number: 'số từ',
  modal: 'động từ khuyết thiếu',
  auxiliary: 'trợ động từ',
};
const posSimple = {
  noun: 'a word for a person, place, thing, or idea',
  verb: 'a word for an action or state',
  adjective: 'a word that describes a noun',
  adverb: 'a word that describes how, when, or where something happens',
  preposition: 'a word that shows relation, place, time, or direction',
  determiner: 'a word used before a noun to make it clear',
  pronoun: 'a word used instead of a noun',
  conjunction: 'a word that connects ideas',
  exclamation: 'a short word or phrase for strong feeling',
  number: 'a word for counting or order',
  modal: 'a helper verb for ability, possibility, or advice',
  auxiliary: 'a helper verb used with another verb',
};
function titleCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'word';
}
function literal(value) {
  return JSON.stringify(value);
}
function isUsableWord(value) {
  return /^[A-Za-z][A-Za-z.'-]*$/.test(value) && !value.includes(' ');
}
function exampleFor(word, pos) {
  if (pos === 'noun') return `This is a useful word for a thing, person, place, or idea: ${word}.`;
  if (pos === 'verb') return `I can ${word} when I speak about daily life.`;
  if (pos === 'adjective') return `The answer is ${word} in this simple example.`;
  if (pos === 'adverb') return `Please say it ${word} in a short sentence.`;
  if (pos === 'preposition') return `The word ${word} helps connect ideas in a sentence.`;
  if (pos === 'determiner') return `${titleCase(word)} book is on the table.`;
  if (pos === 'pronoun') return `${titleCase(word)} can be used instead of a person's name.`;
  if (pos === 'conjunction') return `I use ${word} to connect two simple ideas.`;
  if (pos === 'exclamation') return `${titleCase(word)}! Listen and repeat the word clearly.`;
  if (pos === 'number') return `I can count with the word ${word}.`;
  if (pos === 'modal') return `I ${word} use this word to make a helpful sentence.`;
  if (pos === 'auxiliary') return `I use ${word} with another verb in English.`;
  return `I can use ${word} in a simple English sentence.`;
}

const rows = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1).map((line, index) => {
  const [headword = '', pos = '', cefr = '', core1 = '', core2 = '', threshold = ''] = line.split(';');
  return {
    headword: headword.trim(),
    pos: pos.trim(),
    cefr: cefr.trim(),
    core1: core1.trim(),
    core2: core2.trim(),
    threshold: threshold.trim(),
    sourceRow: index + 2,
  };
});
const selected = [];
for (const level of Object.keys(requiredCounts)) {
  const seen = new Set();
  for (const row of rows) {
    if (row.cefr !== level || !isUsableWord(row.headword)) continue;
    const key = `${row.headword.toLowerCase()}::${row.pos.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(row);
    if (selected.filter((item) => item.cefr === level).length >= requiredCounts[level]) break;
  }
}
const totals = Object.fromEntries(Object.keys(requiredCounts).map((level) => [level, selected.filter((item) => item.cefr === level).length]));
for (const [level, count] of Object.entries(requiredCounts)) {
  if (totals[level] < count) throw new Error(`Not enough ${level} rows: ${totals[level]}/${count}`);
}

const types = `export type GeneratedVocabularyCefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type GeneratedVocabularySourceMetadata = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  license: string;
  attribution: string;
  sourceDataset: string;
  sourceRow?: number;
};

export type GeneratedCefrVocabularyItem = {
  id: string;
  word: string;
  term: string;
  cefrLevel: GeneratedVocabularyCefrLevel;
  partOfSpeech?: string;
  partOfSpeechOrType: string;
  simpleEnglishMeaning: string;
  vietnameseHint: string;
  meaningVi: string;
  example: string;
  exampleMeaningVi: string;
  flashcardPrompt: string;
  pronunciation?: string;
  pronunciationHintVi?: string;
  tags: string[];
  difficulty: 'easy' | 'medium';
  source: GeneratedVocabularySourceMetadata;
};

export type GeneratedVocabularyGroup = {
  id: string;
  titleVi: string;
  unitTitle: string;
  cefrLevel: GeneratedVocabularyCefrLevel;
  descriptionVi: string;
};
`;
fs.writeFileSync(path.join(outDir, 'vocabularyTypes.ts'), types, 'utf8');

const groupLines = Object.entries(groupTitles).map(([level, [title, description]]) => `  {
    id: 'cefr-${level.toLowerCase()}-core',
    titleVi: ${literal(title)},
    unitTitle: 'CEFR ${level}',
    cefrLevel: '${level}',
    descriptionVi: ${literal(description)},
  }`).join(',\n');

const itemLines = selected.map((row, index) => {
  const pos = row.pos || 'word';
  const posLabel = posVi[pos] || pos;
  const simple = posSimple[pos] || 'a useful English word for communication';
  const tags = [row.cefr, pos, row.core1, row.core2, row.threshold].filter(Boolean);
  const id = `${row.cefr.toLowerCase()}-${slug(row.headword)}-${slug(pos)}-${String(index + 1).padStart(3, '0')}`;
  return `  {
    id: ${literal(id)},
    word: ${literal(row.headword)},
    term: ${literal(row.headword)},
    cefrLevel: '${row.cefr}',
    partOfSpeech: ${literal(pos)},
    partOfSpeechOrType: ${literal(posLabel)},
    simpleEnglishMeaning: ${literal(simple)},
    vietnameseHint: ${literal(`Từ ${row.cefr}; loại từ: ${posLabel}. Hãy nhớ bằng một câu thật ngắn trước khi dùng trong hội thoại.`)},
    meaningVi: ${literal(`${posLabel}: ${row.headword} — ghi nhớ theo ngữ cảnh ${row.cefr}.`)},
    example: ${literal(exampleFor(row.headword, pos))},
    exampleMeaningVi: ${literal(`Ví dụ luyện nhớ cho từ "${row.headword}" trong một câu ngắn.`)},
    flashcardPrompt: ${literal(`Nhìn nghĩa tiếng Việt, nói hoặc viết lại từ: ${row.headword}.`)},
    pronunciationHintVi: 'Nghe mẫu, đọc chậm từng âm, rồi nói lại trong câu ví dụ.',
    tags: ${literal(tags)},
    difficulty: '${row.cefr === 'A1' || row.cefr === 'A2' ? 'easy' : 'medium'}',
    source: {
      repoName: 'Words-CEFR-Dataset',
      repoUrl: 'https://github.com/Maximax67/Words-CEFR-Dataset',
      localSourcePath: 'external-sources/words-cefr-dataset/datasets/word_list_cefr.csv',
      license: 'MIT',
      attribution: 'Copyright (c) 2024 Belikov Maxim. Adapted into P-English generated vocabulary modules.',
      sourceDataset: 'word_list_cefr.csv',
      sourceRow: ${row.sourceRow},
    },
  }`;
}).join(',\n');

const generated = `import type { GeneratedCefrVocabularyItem, GeneratedVocabularyGroup } from './vocabularyTypes';

export const generatedVocabularyGroups: GeneratedVocabularyGroup[] = [
${groupLines},
];

export const generatedCefrVocabulary: GeneratedCefrVocabularyItem[] = [
${itemLines},
];

export const generatedVocabularyCounts = {
  A1: ${totals.A1},
  A2: ${totals.A2},
  B1: ${totals.B1},
  B2: ${totals.B2},
  total: ${selected.length},
} as const;
`;
fs.writeFileSync(path.join(outDir, 'generatedCefrVocabulary.ts'), generated, 'utf8');

const adapter = `import { generatedCefrVocabulary, generatedVocabularyGroups } from '../../data/vocabulary/generatedCefrVocabulary';
import type { GeneratedCefrVocabularyItem, GeneratedVocabularyCefrLevel } from '../../data/vocabulary/vocabularyTypes';

export type AdaptedVocabularyItem = {
  id: string;
  wordId: string;
  lessonId: string;
  lessonTitle: string;
  unitTitle: string;
  term: string;
  pronunciation?: string;
  pronunciationHintVi?: string;
  meaningVi: string;
  partOfSpeechOrType: string;
  example: string;
  exampleMeaningVi: string;
  cefrLevel?: GeneratedVocabularyCefrLevel;
  visualCategory?: string;
  animatedSceneHint?: string;
  usefulInSituation?: string;
  confusionNoteVi?: string;
  difficulty: 'easy' | 'medium';
  tags: string[];
  simpleEnglishMeaning: string;
  vietnameseHint: string;
  flashcardPrompt: string;
  source: GeneratedCefrVocabularyItem['source'];
};

function groupForLevel(level: GeneratedVocabularyCefrLevel) {
  return generatedVocabularyGroups.find((group) => group.cefrLevel === level) ?? generatedVocabularyGroups[0];
}

function visualCategoryFor(item: GeneratedCefrVocabularyItem) {
  const tags = [item.word, item.partOfSpeech ?? '', ...item.tags].join(' ').toLowerCase();
  if (/mother|father|brother|sister|family/.test(tags)) return 'family';
  if (/morning|afternoon|evening|time|hour|minute/.test(tags)) return 'time';
  if (/school|student|teacher|class|book/.test(tags)) return 'school';
  if (/food|eat|drink|water/.test(tags)) return 'food';
  if (/country|place|city|aboard|abroad/.test(tags)) return 'place';
  if (/verb|action/.test(tags)) return 'action';
  return 'default';
}

export function adaptGeneratedVocabularyItem(item: GeneratedCefrVocabularyItem): AdaptedVocabularyItem {
  const group = groupForLevel(item.cefrLevel);
  const wordId = \`${'${group.id}:${item.id}'}\`;
  return {
    id: item.id,
    wordId,
    lessonId: group.id,
    lessonTitle: group.titleVi,
    unitTitle: group.unitTitle,
    term: item.term,
    pronunciation: item.pronunciation,
    pronunciationHintVi: item.pronunciationHintVi,
    meaningVi: item.meaningVi,
    partOfSpeechOrType: item.partOfSpeechOrType,
    example: item.example,
    exampleMeaningVi: item.exampleMeaningVi,
    cefrLevel: item.cefrLevel,
    visualCategory: visualCategoryFor(item),
    animatedSceneHint: item.vietnameseHint,
    usefulInSituation: item.simpleEnglishMeaning,
    confusionNoteVi: item.flashcardPrompt,
    difficulty: item.difficulty,
    tags: [...item.tags, item.cefrLevel, item.partOfSpeechOrType],
    simpleEnglishMeaning: item.simpleEnglishMeaning,
    vietnameseHint: item.vietnameseHint,
    flashcardPrompt: item.flashcardPrompt,
    source: item.source,
  };
}

const adaptedVocabularyItems = generatedCefrVocabulary.map(adaptGeneratedVocabularyItem);

export function getAdaptedVocabularyItems() {
  return adaptedVocabularyItems;
}

export function getAdaptedVocabularyItemByWordId(wordId: string) {
  return adaptedVocabularyItems.find((item) => item.wordId === wordId || item.id === wordId) ?? null;
}

export function getVocabularyReviewGroups() {
  return generatedVocabularyGroups;
}
`;
fs.writeFileSync(adapterPath, adapter, 'utf8');
console.log(JSON.stringify({ generated: selected.length, totals }, null, 2));
