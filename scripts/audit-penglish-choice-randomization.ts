import fs from 'node:fs';
import path from 'node:path';
import { allPEnglishLessons } from '../apps/web/src/lib/p-english/lesson-content-data';
import { shuffleArrayStableCopy, shuffleChoiceOptions } from '../apps/web/src/lib/p-english/practice-randomization';
import { foundation48DeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons';
import { foundation48Stage3LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage3.lazy';
import { foundation48Stage4LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage4.lazy';
import { foundation48Stage5LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage5.lazy';
import { foundation48Stage6LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage6.lazy';
import { foundation48Stage7LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage7.lazy';
import { foundation48Stage8LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage8.lazy';

const allDeepLessons = {
  ...foundation48DeepLessons,
  ...foundation48Stage3LazyDeepLessons,
  ...foundation48Stage4LazyDeepLessons,
  ...foundation48Stage5LazyDeepLessons,
  ...foundation48Stage6LazyDeepLessons,
  ...foundation48Stage7LazyDeepLessons,
  ...foundation48Stage8LazyDeepLessons,
};

const outputPath = path.join(process.cwd(), 'reports', 'penglish-choice-randomization-audit.json');
const choiceItems = allPEnglishLessons.flatMap((lesson) => [
  ...lesson.quizQuestions
    .filter((question) => question.type === 'multiple-choice' && typeof question.answer === 'string' && (question.options?.length ?? 0) > 1)
    .map((question) => ({ id: question.id, answer: question.answer as string, options: question.options ?? [], mode: 'quiz' })),
  ...lesson.listeningPractice.map((question) => ({ id: question.id, answer: question.answer, options: question.options, mode: 'listening' })),
]).concat(Object.entries(allDeepLessons).flatMap(([day, lesson]) => [
  ...lesson.quiz
    .filter((question) => !question.selfCheckOnly && (question.type === 'multiple-choice' || question.type === 'listen-and-choose') && typeof question.answer === 'string' && (question.options?.length ?? 0) > 1)
    .map((question) => ({ id: `day-${day}:${question.id}`, answer: question.answer, options: question.options ?? [], mode: 'foundation48-quiz' })),
  ...lesson.listening.map((question) => ({ id: `day-${day}:${question.id}`, answer: question.answer, options: question.options, mode: 'foundation48-listening' })),
]));

const issues: string[] = [];
let authoredCorrectFirstCount = 0;
let questionsWithVariedCorrectPositions = 0;
let scoredQuestionPools = 0;
let questionPoolsWithVariedSelection = 0;
let stableQuestionPools = 0;

for (const item of choiceItems) {
  const normalize = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  if (new Set(item.options.map(normalize)).size !== item.options.length) {
    issues.push(`${item.mode}:${item.id} repeats an answer option.`);
  }
  if (!item.options.some((option) => normalize(option) === normalize(item.answer))) {
    issues.push(`${item.mode}:${item.id} does not include its answer.`);
    continue;
  }
  if (normalize(item.options[0] ?? '') === normalize(item.answer)) authoredCorrectFirstCount += 1;

  const answerPositions = new Set<number>();
  for (let seedIndex = 0; seedIndex < 20; seedIndex += 1) {
    const shuffled = shuffleChoiceOptions(item.options, item.answer, `qa:${item.mode}:${item.id}:${seedIndex}`);
    if (normalize(shuffled[0] ?? '') === normalize(item.answer)) {
      issues.push(`${item.mode}:${item.id} put the correct answer first for seed ${seedIndex}.`);
      break;
    }
    answerPositions.add(shuffled.findIndex((option) => normalize(option) === normalize(item.answer)));
  }
  if (item.options.length > 2 && answerPositions.size < 2) {
    issues.push(`${item.mode}:${item.id} did not vary the correct answer position across 20 seeds.`);
  }
  if (answerPositions.size > 1) questionsWithVariedCorrectPositions += 1;
}

for (const [day, lesson] of Object.entries(allDeepLessons)) {
  const pool = lesson.quiz
    .filter((question) => question.type !== 'speaking-repeat' && question.type !== 'free-response')
    .map((question) => question.id);
  if (pool.length < 2) continue;
  scoredQuestionPools += 1;
  const selected = new Set<string>();
  let stableForEverySeed = true;
  for (let seedIndex = 0; seedIndex < 20; seedIndex += 1) {
    const seed = `qa:foundation48:day-${day}:${seedIndex}`;
    const first = shuffleArrayStableCopy(pool, seed)[0];
    const repeated = shuffleArrayStableCopy(pool, seed)[0];
    selected.add(first);
    if (first !== repeated) stableForEverySeed = false;
  }
  if (!stableForEverySeed) issues.push(`foundation48:day-${day} changed its selected question when the same attempt seed was reused.`);
  else stableQuestionPools += 1;
  if (pool.length > 2 && selected.size < 2) issues.push(`foundation48:day-${day} never varied the selected question across 20 attempt seeds.`);
  if (selected.size > 1) questionPoolsWithVariedSelection += 1;
}

const report = {
  choiceQuestionCount: choiceItems.length,
  authoredCorrectFirstCount,
  questionsWithVariedCorrectPositions,
  scoredQuestionPools,
  questionPoolsWithVariedSelection,
  stableQuestionPools,
  issueCount: issues.length,
  issues,
  releaseReady: issues.length === 0,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (issues.length) process.exitCode = 1;
