/// <reference types="node" />

import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { allPEnglishLessons } from '../apps/web/src/lib/p-english/lesson-content-data.ts';
import { validateLessonContent, summarizeLessonValidation, type LessonContentValidationWarning } from '../apps/web/src/lib/p-english/lesson-content-validation.ts';
import { buildSentenceOrderQuestion } from '../apps/web/src/lib/p-english/practice-randomization.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const reportDir = path.join(rootDir, 'reports');
const jsonReportPath = path.join(reportDir, 'penglish-runtime-lesson-validation.json');
const markdownReportPath = path.join(reportDir, 'penglish-runtime-lesson-validation.md');

type SentenceOrderIdentityCheck = {
  lessonId: string;
  questionId: string;
  source: 'quizQuestions' | 'sentenceOrderingTasks';
  duplicateWords: string[];
  tokenIdsAreUnique: boolean;
  canRebuildByTokenId: boolean;
};

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findDuplicateWords(words: readonly string[]) {
  const counts = new Map<string, number>();
  words.forEach((word) => {
    const normalized = normalizeToken(word);
    if (!normalized) return;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });
  return [...counts.entries()].filter(([, count]) => count > 1).map(([word]) => word);
}

function checkSentenceOrderIdentity(): SentenceOrderIdentityCheck[] {
  return allPEnglishLessons.flatMap((lesson) => {
    const quizChecks = lesson.quizQuestions
      .filter((question) => question.type === 'sentence-order')
      .map((question): SentenceOrderIdentityCheck | null => {
        const words = question.words ?? [];
        const built = buildSentenceOrderQuestion({
          id: question.id,
          words,
          answer: Array.isArray(question.answer) ? question.answer.join(' ') : question.answer,
          attemptId: 'release-validation',
        });
        if (!built) return null;
        const tokenIds = built.tokens.map((token) => token.id);
        const duplicateWords = findDuplicateWords(words);
        return {
          lessonId: lesson.id,
          questionId: question.id,
          source: 'quizQuestions',
          duplicateWords,
          tokenIdsAreUnique: new Set(tokenIds).size === tokenIds.length,
          canRebuildByTokenId: built.tokens.map((token) => token.word).join(' ') === words.join(' '),
        };
      })
      .filter((check): check is SentenceOrderIdentityCheck => Boolean(check));

    const taskChecks = lesson.sentenceOrderingTasks.map((task): SentenceOrderIdentityCheck | null => {
      const built = buildSentenceOrderQuestion({
        id: task.id,
        words: task.words,
        answer: task.answer,
        attemptId: 'release-validation',
      });
      if (!built) return null;
      const tokenIds = built.tokens.map((token) => token.id);
      const duplicateWords = findDuplicateWords(task.words);
      return {
        lessonId: lesson.id,
        questionId: task.id,
        source: 'sentenceOrderingTasks',
        duplicateWords,
        tokenIdsAreUnique: new Set(tokenIds).size === tokenIds.length,
        canRebuildByTokenId: built.tokens.map((token) => token.word).join(' ') === task.words.join(' '),
      };
    }).filter((check): check is SentenceOrderIdentityCheck => Boolean(check));

    return [...quizChecks, ...taskChecks];
  });
}

function countByLevel() {
  return allPEnglishLessons.reduce<Record<string, number>>((counts, lesson) => {
    counts[lesson.level] = (counts[lesson.level] ?? 0) + 1;
    return counts;
  }, {});
}

function countGeneratedBridgeCoverage() {
  const generatedGrammarLessons = allPEnglishLessons.filter((lesson) => lesson.id.startsWith('grammar-'));
  const a2GrammarLessons = generatedGrammarLessons.filter((lesson) => lesson.level === 'Elementary / A2');
  return {
    generatedGrammarLessonCount: generatedGrammarLessons.length,
    a2GrammarLessonCount: a2GrammarLessons.length,
    grammarLessonsWithListening: generatedGrammarLessons.filter((lesson) => lesson.listeningPractice.length > 0).length,
    grammarLessonsWithSpeaking: generatedGrammarLessons.filter((lesson) => lesson.speakingReflexPrompts.length > 0).length,
    a2GrammarLessonsWithListening: a2GrammarLessons.filter((lesson) => lesson.listeningPractice.length > 0).length,
    a2GrammarLessonsWithSpeaking: a2GrammarLessons.filter((lesson) => lesson.speakingReflexPrompts.length > 0).length,
  };
}

function groupWarnings(warnings: LessonContentValidationWarning[]) {
  return warnings.reduce<Record<string, LessonContentValidationWarning[]>>((groups, warning) => {
    const key = warning.severity;
    groups[key] = groups[key] ?? [];
    groups[key].push(warning);
    return groups;
  }, {});
}

function toMarkdown(report: ReturnType<typeof createReport>) {
  const failingWarnings = report.lessonWarnings.filter((warning) => warning.severity === 'error' || warning.severity === 'warning');
  const duplicateIdentityChecks = report.sentenceOrderIdentityChecks.filter((check) => check.duplicateWords.length > 0);
  return [
    '# P-English Runtime Lesson Validation',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Lessons: ${report.lessonCount}`,
    `- Errors: ${report.lessonValidationSummary.errorCount}`,
    `- Warnings: ${report.lessonValidationSummary.warningCount}`,
    `- Info: ${report.lessonValidationSummary.infoCount}`,
    `- Release status: ${report.releaseReady ? 'PASS' : 'FAIL'}`,
    '',
    '## Coverage',
    '',
    `- Levels: ${Object.entries(report.levelCounts).map(([level, count]) => `${level}: ${count}`).join('; ')}`,
    `- Generated grammar lessons with listening: ${report.generatedGrammarBridgeCoverage.grammarLessonsWithListening}/${report.generatedGrammarBridgeCoverage.generatedGrammarLessonCount}`,
    `- Generated grammar lessons with speaking: ${report.generatedGrammarBridgeCoverage.grammarLessonsWithSpeaking}/${report.generatedGrammarBridgeCoverage.generatedGrammarLessonCount}`,
    `- A2 grammar lessons with listening: ${report.generatedGrammarBridgeCoverage.a2GrammarLessonsWithListening}/${report.generatedGrammarBridgeCoverage.a2GrammarLessonCount}`,
    `- A2 grammar lessons with speaking: ${report.generatedGrammarBridgeCoverage.a2GrammarLessonsWithSpeaking}/${report.generatedGrammarBridgeCoverage.a2GrammarLessonCount}`,
    '',
    '## Sentence-order identity QA',
    '',
    `- Sentence-order checks: ${report.sentenceOrderIdentityChecks.length}`,
    `- Checks with duplicate visible words but unique token IDs: ${duplicateIdentityChecks.filter((check) => check.tokenIdsAreUnique).length}`,
    `- Token identity failures: ${report.sentenceOrderIdentityFailures.length}`,
    '',
    '## Blocking findings',
    '',
    failingWarnings.length === 0 ? '- None.' : failingWarnings.map((warning) => `- [${warning.severity}] ${warning.lessonId} / ${warning.area}${warning.itemId ? ` / ${warning.itemId}` : ''}: ${warning.message}`).join('\n'),
    report.sentenceOrderIdentityFailures.length === 0 ? '- No sentence-order token identity failures.' : report.sentenceOrderIdentityFailures.map((check) => `- ${check.lessonId} / ${check.questionId}: tokenIdsAreUnique=${check.tokenIdsAreUnique}, canRebuildByTokenId=${check.canRebuildByTokenId}`).join('\n'),
    '',
  ].join('\n');
}

function createReport() {
  const lessonWarnings = allPEnglishLessons.flatMap((lesson) => validateLessonContent(lesson));
  const lessonValidationSummary = summarizeLessonValidation(lessonWarnings);
  const sentenceOrderIdentityChecks = checkSentenceOrderIdentity();
  const sentenceOrderIdentityFailures = sentenceOrderIdentityChecks.filter((check) => !check.tokenIdsAreUnique || !check.canRebuildByTokenId);
  const releaseReady = lessonValidationSummary.errorCount === 0 && lessonValidationSummary.warningCount === 0 && sentenceOrderIdentityFailures.length === 0;

  return {
    generatedAt: new Date().toISOString(),
    lessonCount: allPEnglishLessons.length,
    levelCounts: countByLevel(),
    lessonValidationSummary,
    groupedWarningCounts: Object.fromEntries(Object.entries(groupWarnings(lessonWarnings)).map(([severity, items]) => [severity, items.length])),
    lessonWarnings,
    generatedGrammarBridgeCoverage: countGeneratedBridgeCoverage(),
    sentenceOrderIdentityChecks,
    sentenceOrderIdentityFailures,
    releaseReady,
  };
}

const report = createReport();
mkdirSync(reportDir, { recursive: true });
writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(markdownReportPath, `${toMarkdown(report)}\n`, 'utf8');

console.log(JSON.stringify({
  lessonCount: report.lessonCount,
  lessonValidationSummary: report.lessonValidationSummary,
  sentenceOrderIdentityChecks: report.sentenceOrderIdentityChecks.length,
  sentenceOrderIdentityFailures: report.sentenceOrderIdentityFailures.length,
  generatedGrammarBridgeCoverage: report.generatedGrammarBridgeCoverage,
  releaseReady: report.releaseReady,
  reports: {
    json: path.relative(rootDir, jsonReportPath).replace(/\\/g, '/'),
    markdown: path.relative(rootDir, markdownReportPath).replace(/\\/g, '/'),
  },
}, null, 2));

if (!report.releaseReady) {
  process.exit(1);
}
