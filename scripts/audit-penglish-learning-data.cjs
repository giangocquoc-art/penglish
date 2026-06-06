/* eslint-disable no-console */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports');
const JSON_REPORT = path.join(REPORT_DIR, 'penglish-learning-data-audit.json');
const MD_REPORT = path.join(REPORT_DIR, 'penglish-learning-data-audit.md');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compact(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function routeableLessonPath(id) {
  return `/lessons/${id}`;
}

function getRuntimeSnapshot() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'penglish-audit-'));
  const tempFile = path.join(tempDir, 'snapshot.ts');
  fs.writeFileSync(
    tempFile,
    `import { allPEnglishLessons } from ${JSON.stringify(path.join(ROOT, 'apps/web/src/lib/p-english/lesson-content-data.ts').replace(/\\/g, '/'))};\n` +
      `import { generatedGrammarLessonSources } from ${JSON.stringify(path.join(ROOT, 'apps/web/src/data/grammar/generatedGrammarLessons.ts').replace(/\\/g, '/'))};\n` +
      `import { generatedReadingLessonSources } from ${JSON.stringify(path.join(ROOT, 'apps/web/src/data/reading/generatedReadingLessons.ts').replace(/\\/g, '/'))};\n` +
      `import { generatedCefrVocabulary, generatedVocabularyGroups } from ${JSON.stringify(path.join(ROOT, 'apps/web/src/data/vocabulary/generatedCefrVocabulary.ts').replace(/\\/g, '/'))};\n` +
      `import { generatedSpeechPrompts } from ${JSON.stringify(path.join(ROOT, 'apps/web/src/data/speech/generatedSpeechPrompts.ts').replace(/\\/g, '/'))};\n` +
      `import { generatedShadowingCatalog } from ${JSON.stringify(path.join(ROOT, 'apps/web/src/data/shadowing/generatedShadowingCatalog.ts').replace(/\\/g, '/'))};\n` +
      `import { generatedUnifiedLearningPath } from ${JSON.stringify(path.join(ROOT, 'apps/web/src/data/learning/generatedUnifiedLearningPath.ts').replace(/\\/g, '/'))};\n` +
      `console.log(JSON.stringify({ allPEnglishLessons, generatedGrammarLessonSources, generatedReadingLessonSources, generatedCefrVocabulary, generatedVocabularyGroups, generatedSpeechPrompts, generatedShadowingCatalog, generatedUnifiedLearningPath }));\n`,
    'utf8',
  );

  const command = process.execPath;
  const tsxBin = path.join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  try {
    const output = execFileSync(command, [tsxBin, tempFile], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 1024 * 1024 * 80,
    });
    return JSON.parse(output);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function makeRecorder() {
  const findings = [];
  return {
    findings,
    add(severity, category, source, id, message, recommendation) {
      findings.push({ severity, category, source, id: id ?? '', message, recommendation: recommendation ?? '' });
    },
  };
}

function checkUnique(items, key, source, recorder, severity = 'error') {
  const seen = new Map();
  for (const item of items) {
    const value = item?.[key];
    if (!value) {
      recorder.add(severity, 'id-integrity', source, '', `Missing ${key}.`, `Add a stable ${key}.`);
      continue;
    }
    if (seen.has(value)) {
      recorder.add(severity, 'id-integrity', source, value, `Duplicate ${key}: ${value}.`, `Rename one ${source} record to a unique route-safe ID.`);
    } else {
      seen.set(value, item);
    }
  }
  return seen;
}

function checkLessonExerciseIntegrity(lessons, recorder) {
  for (const lesson of lessons) {
    const lessonId = lesson.id;
    for (const question of lesson.quizQuestions ?? []) {
      if (question.type === 'multiple-choice') {
        if (!Array.isArray(question.options) || question.options.length < 2) {
          recorder.add('error', 'answer-integrity', 'lesson.quizQuestions', question.id, `Multiple-choice question in ${lessonId} has fewer than 2 options.`, 'Provide at least two answer options.');
        } else if (!question.options.includes(question.answer)) {
          recorder.add('error', 'answer-integrity', 'lesson.quizQuestions', question.id, `Answer is not present in options for ${lessonId}.`, 'Make the answer exactly match one option.');
        }
      }
      if (question.type === 'fill-blank' && !String(question.prompt ?? '').includes('___')) {
        recorder.add('error', 'answer-integrity', 'lesson.quizQuestions', question.id, `Fill-blank question in ${lessonId} has no visible blank marker.`, 'Include ___ in the prompt.');
      }
      if (question.type === 'sentence-order') {
        const answer = normalizeText(Array.isArray(question.answer) ? question.answer.join(' ') : question.answer);
        const words = normalizeText((question.words ?? []).join(' '));
        if (!words || words !== answer) {
          recorder.add('error', 'answer-integrity', 'lesson.quizQuestions', question.id, `Sentence-order answer is not constructable from words in ${lessonId}.`, 'Make words join to the same sentence as answer.');
        }
      }
    }

    for (const task of lesson.sentenceOrderingTasks ?? []) {
      const answer = normalizeText(task.answer);
      const words = normalizeText((task.words ?? []).join(' '));
      if (!words || words !== answer) {
        recorder.add('error', 'answer-integrity', 'lesson.sentenceOrderingTasks', task.id, `Sentence-order task answer is not constructable from words in ${lessonId}.`, 'Make words join to the same sentence as answer.');
      }
    }

    for (const task of lesson.fillBlankTasks ?? []) {
      if (!String(task.prompt ?? '').includes('___')) {
        recorder.add('error', 'answer-integrity', 'lesson.fillBlankTasks', task.id, `Fill-blank task in ${lessonId} has no visible blank marker.`, 'Include ___ in the prompt.');
      }
      if (!compact(task.answer)) {
        recorder.add('error', 'answer-integrity', 'lesson.fillBlankTasks', task.id, `Fill-blank task in ${lessonId} has an empty answer.`, 'Add a learner-visible expected answer.');
      }
    }

    for (const item of lesson.listeningPractice ?? []) {
      if (!Array.isArray(item.options) || item.options.length < 2) {
        recorder.add('error', 'answer-integrity', 'lesson.listeningPractice', item.id, `Listening item in ${lessonId} has fewer than 2 options.`, 'Provide at least two listening options.');
      } else if (!item.options.includes(item.answer)) {
        recorder.add('error', 'answer-integrity', 'lesson.listeningPractice', item.id, `Listening answer is not present in options for ${lessonId}.`, 'Make the listening answer exactly match one option.');
      }
    }
  }
}

function checkGeneratedGrammar(sourceLessons, recorder) {
  for (const lesson of sourceLessons) {
    if ((lesson.exercises ?? []).length < 6) {
      recorder.add('warning', 'content-depth', 'generatedGrammarLessons', lesson.id, `Generated grammar lesson has only ${(lesson.exercises ?? []).length} exercises.`, 'Lightly expand to 6–8 mixed exercises before large content expansion.');
    }
    for (const exercise of lesson.exercises ?? []) {
      if (exercise.type === 'multiple-choice' && (!exercise.options || !exercise.options.includes(exercise.answer))) {
        recorder.add('error', 'answer-integrity', 'generatedGrammarLessons', exercise.id, `Grammar MCQ answer is not present in options for ${lesson.id}.`, 'Make answer exactly match one option.');
      }
      if (exercise.type === 'fill-blank' && !String(exercise.promptEn ?? exercise.promptVi ?? '').includes('___')) {
        recorder.add('error', 'answer-integrity', 'generatedGrammarLessons', exercise.id, `Grammar fill-blank has no visible blank marker in ${lesson.id}.`, 'Include ___ in promptEn or promptVi.');
      }
      if (exercise.type === 'sentence-order') {
        const words = normalizeText((exercise.words ?? []).join(' '));
        const answer = normalizeText(exercise.answer);
        if (!words || words !== answer) {
          recorder.add('error', 'answer-integrity', 'generatedGrammarLessons', exercise.id, `Grammar sentence-order answer is not constructable from words in ${lesson.id}.`, 'Make words join to the same sentence as answer.');
        }
      }
    }
  }
}

function checkGeneratedReading(sourceLessons, recorder) {
  for (const lesson of sourceLessons) {
    if ((lesson.comprehensionQuestions ?? []).length < 3) {
      recorder.add('warning', 'content-depth', 'generatedReadingLessons', lesson.id, `Reading lesson has only ${(lesson.comprehensionQuestions ?? []).length} comprehension questions.`, 'Add a third question such as main idea or vocabulary-in-context.');
    }
    for (const question of lesson.comprehensionQuestions ?? []) {
      if (!Array.isArray(question.options) || !question.options.includes(question.answer)) {
        recorder.add('error', 'answer-integrity', 'generatedReadingLessons', question.id, `Reading answer is not present in options for ${lesson.id}.`, 'Make answer exactly match one option.');
      }
    }
    for (const task of lesson.fillBlankTasks ?? []) {
      if (!String(task.prompt ?? '').includes('___')) {
        recorder.add('error', 'answer-integrity', 'generatedReadingLessons', task.id, `Reading fill-blank has no visible blank marker in ${lesson.id}.`, 'Include ___ in the prompt.');
      }
    }
    for (const task of lesson.sentenceOrderingTasks ?? []) {
      const words = normalizeText((task.words ?? []).join(' '));
      const answer = normalizeText(task.answer);
      if (!words || words !== answer) {
        recorder.add('error', 'answer-integrity', 'generatedReadingLessons', task.id, `Reading sentence-order answer is not constructable from words in ${lesson.id}.`, 'Make words join to the same sentence as answer.');
      }
    }
  }
}

function checkVocabulary(items, recorder) {
  checkUnique(items, 'id', 'generatedCefrVocabulary', recorder, 'error');
  const byTerm = new Map();
  const genericPatterns = [
    /please say it/i,
    /ghi nhớ theo ngữ cảnh/i,
    /ví dụ luyện nhớ/i,
    /hãy nhớ bằng một câu thật ngắn/i,
    /^từ [AB][0-9]/i,
  ];

  for (const item of items) {
    const key = normalizeText(`${item.cefrLevel}:${item.term}:${item.partOfSpeech ?? item.partOfSpeechOrType ?? ''}`);
    const list = byTerm.get(key) ?? [];
    list.push(item.id);
    byTerm.set(key, list);

    const joined = [item.meaningVi, item.example, item.exampleMeaningVi, item.vietnameseHint, item.simpleEnglishMeaning].join('\n');
    if (genericPatterns.some((pattern) => pattern.test(joined))) {
      recorder.add('quality', 'vocabulary-quality', 'generatedCefrVocabulary', item.id, `Vocabulary item “${item.term}” still contains placeholder/generic learner copy.`, 'Replace generated placeholder meaning/example with a useful Vietnamese meaning, natural example, and situation hint.');
    }
    if (!compact(item.meaningVi) || !compact(item.example) || !compact(item.exampleMeaningVi)) {
      recorder.add('error', 'vocabulary-quality', 'generatedCefrVocabulary', item.id, `Vocabulary item “${item.term}” has empty required learner fields.`, 'Fill meaningVi, example, and exampleMeaningVi.');
    }
  }

  for (const [term, ids] of byTerm) {
    if (ids.length > 1) {
      recorder.add('warning', 'vocabulary-duplicates', 'generatedCefrVocabulary', term, `Duplicate CEFR term entries: ${ids.join(', ')}.`, 'Keep duplicates only when part-of-speech meanings differ; otherwise merge or mark for review.');
    }
  }
}

function checkShadowing(items, recorder) {
  checkUnique(items, 'id', 'generatedShadowingCatalog', recorder, 'error');
  for (const item of items) {
    if (!compact(item.transcript)) {
      recorder.add('error', 'shadowing-integrity', 'generatedShadowingCatalog', item.id, 'Shadowing item has empty transcript.', 'Add transcript text built from non-empty chunks.');
    }
    for (const chunk of item.chunks ?? []) {
      if (!compact(chunk.text) || !compact(chunk.vi)) {
        recorder.add('error', 'shadowing-integrity', 'generatedShadowingCatalog', chunk.id, `Shadowing chunk in ${item.id} has empty text or Vietnamese meaning.`, 'Fill both chunk text and vi.');
      }
    }
  }
}

function checkLearningPath(pathUnits, lessons, snapshot, recorder) {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const unitIds = new Set(pathUnits.map((unit) => unit.id));
  const hubRoutes = new Set(['/vocabularies', '/shadowing', '/english-speed']);
  const generatedSourceIdsByModule = {
    'handcrafted-lessons': lessonIds,
    'generated-vocabulary': new Set(snapshot.generatedVocabularyGroups.map((group) => group.id)),
    'generated-grammar': new Set(snapshot.generatedGrammarLessonSources.map((lesson) => lesson.id)),
    'generated-reading': new Set(snapshot.generatedReadingLessonSources.map((lesson) => lesson.id)),
    'generated-shadowing': new Set(snapshot.generatedShadowingCatalog.map((item) => item.id)),
    'generated-speech': new Set(snapshot.generatedSpeechPrompts.map((prompt) => prompt.id)),
  };

  checkUnique(pathUnits, 'id', 'generatedUnifiedLearningPath', recorder, 'error');
  for (const unit of pathUnits) {
    if (!Array.isArray(unit.lessonIds) || unit.lessonIds.length === 0) {
      recorder.add('warning', 'roadmap-completeness', 'generatedUnifiedLearningPath', unit.id, 'Roadmap unit has no lessonIds.', 'Attach at least one runtime lesson ID so learners can continue into a lesson route.');
    }
    if (!Array.isArray(unit.sourceIds) || unit.sourceIds.length < 2) {
      recorder.add('warning', 'roadmap-completeness', 'generatedUnifiedLearningPath', unit.id, 'Roadmap unit has too few sourceIds for progress reporting.', 'Attach multiple source IDs from lesson/content catalogs.');
    }
    if (!Array.isArray(unit.recommendedPracticeModes) || unit.recommendedPracticeModes.length < 3) {
      recorder.add('warning', 'roadmap-practice-integrity', 'generatedUnifiedLearningPath', unit.id, 'Roadmap unit has fewer than three recommended practice modes.', 'Provide a balanced set such as quiz, type, speed, shadowing, or pronunciation where available.');
    } else if (!unit.recommendedPracticeModes.includes(unit.primaryMode)) {
      recorder.add('warning', 'roadmap-practice-integrity', 'generatedUnifiedLearningPath', unit.id, `Primary mode “${unit.primaryMode}” is not included in recommendedPracticeModes.`, 'Include the primary mode in recommendedPracticeModes for consistent progress chips.');
    }
    if (unit.unlockedByUnitId && !unitIds.has(unit.unlockedByUnitId)) {
      recorder.add('error', 'roadmap-integrity', 'generatedUnifiedLearningPath', unit.id, `Roadmap unit unlocks from missing unit “${unit.unlockedByUnitId}”.`, 'Point unlockedByUnitId to an existing roadmap unit.');
    }
    for (const lessonId of unit.lessonIds ?? []) {
      if (!lessonIds.has(lessonId)) {
        recorder.add('error', 'roadmap-integrity', 'generatedUnifiedLearningPath', unit.id, `Roadmap unit references missing lesson ID “${lessonId}”.`, 'Point lessonIds to actual runtime lessons or route to a practice hub.');
      }
    }
    const runtimeRoute = unit.sourceModuleReference?.runtimeRoute ?? '';
    if (runtimeRoute.startsWith('/lessons/')) {
      const id = runtimeRoute.replace('/lessons/', '').split(/[?#]/)[0];
      if (!lessonIds.has(id)) {
        recorder.add('error', 'roadmap-route-integrity', 'generatedUnifiedLearningPath', unit.id, `Roadmap runtimeRoute points to missing lesson route ${runtimeRoute}.`, 'Use a valid /lessons/:id route or a hub route.');
      }
    } else if (runtimeRoute && !hubRoutes.has(runtimeRoute)) {
      recorder.add('warning', 'roadmap-route-integrity', 'generatedUnifiedLearningPath', unit.id, `Roadmap runtimeRoute uses an unrecognized hub route ${runtimeRoute}.`, 'Use a valid /lessons/:id route or one of the known practice hubs.');
    }
    const sourceModule = unit.sourceModuleReference?.module;
    const sourceIds = unit.sourceModuleReference?.ids ?? [];
    const validSourceIds = generatedSourceIdsByModule[sourceModule] ?? null;
    if (!sourceModule || !validSourceIds || sourceIds.length === 0) {
      recorder.add('warning', 'roadmap-source-integrity', 'generatedUnifiedLearningPath', unit.id, 'Roadmap sourceModuleReference is incomplete.', 'Set module, ids, runtimeRoute, and integrationNote for traceable roadmap data.');
    } else {
      for (const sourceId of sourceIds) {
        if (!validSourceIds.has(sourceId)) {
          recorder.add('error', 'roadmap-source-integrity', 'generatedUnifiedLearningPath', unit.id, `Roadmap sourceModuleReference points to missing ${sourceModule} ID “${sourceId}”.`, 'Use IDs that exist in the declared generated source module.');
        }
      }
    }
    if (!unit.contentMaturity) {
      recorder.add('warning', 'roadmap-maturity', 'generatedUnifiedLearningPath', unit.id, 'Roadmap unit has no content maturity label.', 'Add contentMaturity: foundation, expanded, or mature.');
    }
  }
}

function scanFreeFirstConflicts(recorder) {
  const roots = [path.join(ROOT, 'apps/web/src')];
  const flagged = [];
  const hardGatePattern = /(paywall|upgrade required|must subscribe|subscription required|premium only|pro only|nâng cấp để học|trả phí để học)/i;
  const proPattern = /\bPRO\b|\bPro\b|\bpro\b|pricing|Pricing|subscription|gói/i;
  const allowedInternalPattern = /\bvip\??:|\bvip:\s*false|onAuthStateChange|data\.subscription\.unsubscribe|<Route path="\/(pricing|subscriptions)"/i;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      const text = fs.readFileSync(file, 'utf8');
      if (hardGatePattern.test(text)) flagged.push({ file, severity: 'error', match: 'hard gate language' });
      else if (proPattern.test(text) && !allowedInternalPattern.test(text) && !/miễn phí|free-first|tuỳ chọn|tùy chọn|quà tặng/i.test(text)) flagged.push({ file, severity: 'warning', match: 'possible PRO/pricing language' });
    }
  }
  roots.forEach(walk);
  for (const item of flagged) {
    recorder.add(item.severity, 'free-first-policy', path.relative(ROOT, item.file).replace(/\\/g, '/'), '', `Found ${item.match}.`, 'Confirm learner-facing core lessons remain free-first and optional support copy is clearly separated.');
  }
}

function summarize(findings) {
  return findings.reduce(
    (acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
      acc.byCategory[finding.category] = (acc.byCategory[finding.category] ?? 0) + 1;
      return acc;
    },
    { error: 0, warning: 0, quality: 0, recommendation: 0, byCategory: {} },
  );
}

function markdownSection(title, findings) {
  if (findings.length === 0) return `## ${title}\n\nNone.\n`;
  return `## ${title}\n\n` + findings.map((finding) => `- **${finding.source}${finding.id ? ` · ${finding.id}` : ''}**: ${finding.message}${finding.recommendation ? `\n  - Fix: ${finding.recommendation}` : ''}`).join('\n') + '\n';
}

function writeReports(snapshot, findings) {
  ensureDir(REPORT_DIR);
  const summary = summarize(findings);
  const report = {
    generatedAt: new Date().toISOString(),
    scope: 'P-English runtime learning data audit. This is separate from validate:lessons schema smoke validation, which checks schemaSmokeFixture only.',
    counts: {
      runtimeLessons: snapshot.allPEnglishLessons.length,
      generatedGrammarLessonSources: snapshot.generatedGrammarLessonSources.length,
      generatedReadingLessonSources: snapshot.generatedReadingLessonSources.length,
      vocabularyItems: snapshot.generatedCefrVocabulary.length,
      vocabularyGroups: snapshot.generatedVocabularyGroups.length,
      speechPrompts: snapshot.generatedSpeechPrompts.length,
      shadowingItems: snapshot.generatedShadowingCatalog.length,
      roadmapUnits: snapshot.generatedUnifiedLearningPath.length,
    },
    summary,
    findings,
  };
  fs.writeFileSync(JSON_REPORT, JSON.stringify(report, null, 2), 'utf8');

  const md = [
    '# P-English Learning Data Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    'This audit validates actual runtime learning data. It is intentionally separate from `npm run validate:lessons`, which remains a schema smoke validation over `schemaSmokeFixture`.',
    '',
    '## Counts',
    '',
    ...Object.entries(report.counts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Summary',
    '',
    `- errors: ${summary.error ?? 0}`,
    `- warnings: ${summary.warning ?? 0}`,
    `- content quality issues: ${summary.quality ?? 0}`,
    `- recommendations: ${summary.recommendation ?? 0}`,
    '',
    markdownSection('Errors', findings.filter((finding) => finding.severity === 'error')),
    markdownSection('Warnings', findings.filter((finding) => finding.severity === 'warning')),
    markdownSection('Content quality issues', findings.filter((finding) => finding.severity === 'quality')),
    markdownSection('Recommended fixes', findings.filter((finding) => finding.recommendation)),
  ].join('\n');
  fs.writeFileSync(MD_REPORT, md, 'utf8');
  return report;
}

function main() {
  const snapshot = getRuntimeSnapshot();
  const recorder = makeRecorder();

  checkUnique(snapshot.allPEnglishLessons, 'id', 'allPEnglishLessons', recorder, 'error');
  checkLessonExerciseIntegrity(snapshot.allPEnglishLessons, recorder);
  checkGeneratedGrammar(snapshot.generatedGrammarLessonSources, recorder);
  checkGeneratedReading(snapshot.generatedReadingLessonSources, recorder);
  checkVocabulary(snapshot.generatedCefrVocabulary, recorder);
  checkUnique(snapshot.generatedSpeechPrompts, 'id', 'generatedSpeechPrompts', recorder, 'error');
  checkShadowing(snapshot.generatedShadowingCatalog, recorder);
  checkLearningPath(snapshot.generatedUnifiedLearningPath, snapshot.allPEnglishLessons, snapshot, recorder);
  scanFreeFirstConflicts(recorder);

  const report = writeReports(snapshot, recorder.findings);
  console.log(`P-English learning data audit complete.`);
  console.log(`Reports written:`);
  console.log(`- ${path.relative(ROOT, JSON_REPORT).replace(/\\/g, '/')}`);
  console.log(`- ${path.relative(ROOT, MD_REPORT).replace(/\\/g, '/')}`);
  console.log(`Errors: ${report.summary.error ?? 0}, warnings: ${report.summary.warning ?? 0}, quality issues: ${report.summary.quality ?? 0}`);

  if ((report.summary.error ?? 0) > 0) {
    process.exitCode = 1;
  }
}

main();
