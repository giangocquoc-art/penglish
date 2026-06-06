import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allPEnglishLessons } from '../apps/web/src/lib/p-english/lesson-content-data.ts';
import { generatedUnifiedLearningPath } from '../apps/web/src/data/learning/generatedUnifiedLearningPath.ts';
import { generatedCefrVocabulary, generatedVocabularyGroups } from '../apps/web/src/data/vocabulary/generatedCefrVocabulary.ts';
import { generatedShadowingCatalog } from '../apps/web/src/data/shadowing/generatedShadowingCatalog.ts';
import { generatedSpeechPrompts } from '../apps/web/src/data/speech/generatedSpeechPrompts.ts';
import { generatedEnglishResourceHub } from '../apps/web/src/data/resources/generatedEnglishResourceHub.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const previewPath = join(rootDir, 'reports', 'supabase-seed-payload-preview.json');

type JsonRecord = Record<string, unknown>;

type SeedPayload = {
  generatedAt: string;
  source: string;
  tables: {
    penglish_learning_units: JsonRecord[];
    penglish_vocabulary_items: JsonRecord[];
    penglish_shadowing_lessons: JsonRecord[];
    penglish_speech_prompts: JsonRecord[];
    penglish_resources: JsonRecord[];
  };
  counts: Record<string, number>;
};

function safeJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function lessonSummaryById(lessonId: string) {
  const lesson = allPEnglishLessons.find((item) => item.id === lessonId);
  if (!lesson) return null;

  return {
    id: lesson.id,
    unitId: lesson.unitId,
    titleVi: lesson.titleVi,
    titleEn: lesson.titleEn,
    level: lesson.level,
    estimatedTime: lesson.estimatedTime,
    skillTags: lesson.skillTags,
    learningObjectives: lesson.learningObjectives,
  };
}

function makeLearningUnits() {
  return generatedUnifiedLearningPath.map((unit, index) => ({
    id: unit.id,
    cefr_level: unit.level,
    title_vi: unit.titleVi,
    subtitle_vi: unit.subtitleVi,
    skill_focus: unit.skillFocus,
    estimated_time: unit.estimatedTime,
    lesson_ids: unit.lessonIds,
    source_ids: unit.sourceIds,
    primary_mode: unit.primaryMode,
    recommended_practice_modes: unit.recommendedPracticeModes,
    unlocked_by_unit_id: unit.unlockedByUnitId ?? null,
    sort_order: index + 1,
    payload: {
      whaleCoachLine: unit.whaleCoachLine,
      confidenceGoal: unit.confidenceGoal,
      sourceModuleReference: unit.sourceModuleReference,
      lessons: unit.lessonIds.map(lessonSummaryById).filter(Boolean),
    },
  }));
}

function makeVocabularyItems() {
  const groupByLevel = new Map(generatedVocabularyGroups.map((group) => [group.cefrLevel, group]));

  return generatedCefrVocabulary.map((item) => {
    const group = groupByLevel.get(item.cefrLevel);
    return {
      id: item.id,
      term: item.term,
      word: item.word,
      cefr_level: item.cefrLevel,
      part_of_speech: item.partOfSpeech,
      part_of_speech_or_type: item.partOfSpeechOrType,
      meaning_vi: item.meaningVi,
      simple_english_meaning: item.simpleEnglishMeaning,
      example: item.example,
      example_meaning_vi: item.exampleMeaningVi,
      difficulty: item.difficulty,
      tags: item.tags,
      group_id: group?.id ?? null,
      payload: {
        vietnameseHint: item.vietnameseHint,
        flashcardPrompt: item.flashcardPrompt,
        pronunciationHintVi: item.pronunciationHintVi,
      },
    };
  });
}

function makeShadowingLessons() {
  return generatedShadowingCatalog.map((item, index) => ({
    id: item.id,
    title_vi: item.titleVi,
    title_en: item.titleEn,
    cefr_level: item.level,
    topic: item.topic,
    description_vi: item.descriptionVi,
    estimated_time: item.estimatedTime,
    transcript: item.transcript,
    sort_order: index + 1,
    payload: {
      chunks: item.chunks,
      repeatPlan: item.repeatPlan,
      learnerTipsVi: item.learnerTipsVi,
      whaleCoachLines: item.whaleCoachLines,
    },
  }));
}

function makeSpeechPrompts() {
  return generatedSpeechPrompts.map((prompt, index) => ({
    id: prompt.id,
    title_vi: prompt.titleVi,
    cefr_level: prompt.level,
    prompt_type: prompt.type,
    prompt_text: prompt.promptText,
    vietnamese_meaning: prompt.vietnameseMeaning,
    sort_order: index + 1,
    payload: {
      focusSounds: prompt.focusSounds,
      targetWords: prompt.targetWords,
      slowHintVi: prompt.slowHintVi,
      commonMistakesVi: prompt.commonMistakesVi,
      retryTipsVi: prompt.retryTipsVi,
      whaleCoachLines: prompt.whaleCoachLines,
    },
  }));
}

function makeResources() {
  return generatedEnglishResourceHub.map((resource, index) => ({
    id: resource.id,
    title_vi: resource.titleVi,
    category: resource.category,
    cefr_levels: resource.cefrLevels,
    skill_tags: resource.skillTags,
    level_hint: resource.levelHint,
    summary_vi: resource.summaryVi,
    url: resource.url,
    is_free: resource.isFree,
    sort_order: index + 1,
    payload: {
      whenToUseVi: resource.whenToUseVi,
      pEnglishFirstVi: resource.pEnglishFirstVi,
      actionLabelVi: resource.actionLabelVi,
      learnerNoteVi: resource.learnerNoteVi,
      searchTerms: resource.searchTerms,
    },
  }));
}

export function buildPEnglishSeedPayload(): SeedPayload {
  const tables = {
    penglish_learning_units: makeLearningUnits(),
    penglish_vocabulary_items: makeVocabularyItems(),
    penglish_shadowing_lessons: makeShadowingLessons(),
    penglish_speech_prompts: makeSpeechPrompts(),
    penglish_resources: makeResources(),
  };

  const counts = Object.fromEntries(Object.entries(tables).map(([table, rows]) => [table, rows.length]));

  return safeJson({
    generatedAt: new Date().toISOString(),
    source: 'P-English app-authored bundled learning data only. No secrets, local user data, screenshots, reports, build outputs, or private files are included.',
    tables,
    counts,
  });
}

async function main() {
  const payload = buildPEnglishSeedPayload();
  await mkdir(dirname(previewPath), { recursive: true });
  await writeFile(previewPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log('P-English Supabase seed payload preview written.');
  console.log(`Output: ${previewPath}`);
  console.log(`Counts: ${JSON.stringify(payload.counts)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
