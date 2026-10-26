import fs from 'node:fs';
import path from 'node:path';
import { allPEnglishLessons } from '../apps/web/src/lib/p-english/lesson-content-data.ts';
import { getInteractiveLessonByLessonId } from '../apps/web/src/lib/p-english/interactiveLessonEngine.ts';

type ReachabilityRow = { lessonId: string; bank: string; sourceCount: number; reachableCount: number; missing: string[] };

const rows: ReachabilityRow[] = [];
const normalized = (value: string) => value.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();

for (const source of allPEnglishLessons) {
  const flow = getInteractiveLessonByLessonId(source.id);
  if (!flow) {
    rows.push({ lessonId: source.id, bank: 'lesson', sourceCount: 1, reachableCount: 0, missing: [source.id] });
    continue;
  }
  const steps = flow.steps;
  const tips = steps.flatMap((step) => step.learningTips ?? []);
  const add = (bank: string, ids: string[], reachable: (id: string, index: number) => boolean) => {
    const missing = ids.filter((id, index) => !reachable(id, index));
    rows.push({ lessonId: source.id, bank, sourceCount: ids.length, reachableCount: ids.length - missing.length, missing });
  };

  add('objectives shown in intro', source.learningObjectives.slice(0, 3).map((_, index) => String(index)), (id) => steps.some((step) => step.type === 'intro' && step.explanation?.includes(source.learningObjectives[Number(id)])));
  add('vocabulary', source.vocabulary.map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id && step.type === 'flashcard'));
  const vocabularyContent = new Set(source.vocabulary.map((item) => [item.term, item.meaningVi, item.example].map(normalized).join('|')));
  add('flashcards', source.flashcards.map((item) => item.id), (id, index) => steps.some((step) => step.sourceItemId === id && step.type === 'flashcard') || vocabularyContent.has([source.flashcards[index].front, source.flashcards[index].back, source.flashcards[index].example].map(normalized).join('|')));
  add('sentencePatterns', source.sentencePatterns.map((item) => `pattern-${item.id}`), (id) => tips.some((tip) => tip.id === id));
  add('miniDialogues', source.miniDialogues.flatMap((item) => item.lines.map((_, index) => `${item.id}-${index}`)), (id) => steps.some((step) => step.sourceItemId === id && step.type === 'listen_choose'));
  add('grammarNotes', source.grammarNotes.map((item) => `grammar-${item.id}`), (id) => tips.some((tip) => tip.id === id));
  add('pronunciationNotes', source.pronunciationNotes.flatMap((item) => [`pronunciation-note-${item.id}`, ...(item.examples ?? []).map((_, index) => `pronunciation-${item.id}-${index}`)]), (id) => tips.some((tip) => tip.id === id) || steps.some((step) => step.id === id && step.type === 'speak_repeat'));
  add('listeningPractice', source.listeningPractice.map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id && step.type === 'listen_choose'));
  add('speakingReflexPrompts', source.speakingReflexPrompts.map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id && step.type === 'speak_repeat'));
  add('quizQuestions', source.quizQuestions.map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id || step.completionItemId === id || step.sourceItemId?.startsWith(`${id}-`)));
  add('sentenceOrderingTasks', source.sentenceOrderingTasks.map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id && step.type === 'sentence_order'));
  add('fillBlankTasks', source.fillBlankTasks.map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id && step.type === 'fill_blank'));
  add('matchPairs', (source.matchPairs ?? []).map((item) => item.id), (id) => steps.some((step) => step.type === 'match_pairs' && step.sourceItemIds?.includes(id)));
  add('englishSpeedPrompts', (source.englishSpeedPrompts ?? []).map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id && step.srsType === 'speed'));
  add('shadowingScript', (source.shadowingScript?.lines ?? []).map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id && step.type === 'shadowing'));
  add('commonMistakes', (source.commonMistakes ?? []).map((item) => item.id), (id) => steps.some((step) => step.sourceItemId === id && step.type === 'fill_blank'));
  add('realLifeSituations', (source.realLifeSituations ?? []).map((item) => `scenario-${item.id}`), (id) => steps.some((step) => step.id === id && step.type === 'free_response'));
  add('gameMissions', (source.gameMissions ?? []).map((item) => `mission-${item.id}`), (id) => {
    const missionStep = steps.find((step) => step.id === id);
    const missionSource = source.gameMissions?.find((item) => `mission-${item.id}` === id);
    const requirement = missionSource?.completion;
    return missionStep?.type === 'mission_tracker'
      && Boolean(requirement)
      && requirement!.sourceItemIds.length > 0
      && requirement!.minimum > 0
      && requirement!.minimum <= requirement!.sourceItemIds.length
      && requirement!.sourceItemIds.every((sourceId) => steps.some((step) =>
        (step.id === sourceId || step.sourceItemId === sourceId)
        && (requirement!.kind === 'correct'
          ? ['multiple_choice', 'fill_blank', 'sentence_order', 'listen_choose'].includes(step.type)
          : ['listen_choose', 'speak_repeat', 'shadowing'].includes(step.type)),
      ));
  });
  add('whaleCoachLines', (source.whaleCoachLines ?? []).map((_, index) => `coach-${source.id}-${index}`), (id) => tips.some((tip) => tip.id === id));
  add('finalMiniChallenge', source.finalMiniChallenge ? [`final-${source.finalMiniChallenge.id}`] : [], (id) => steps.some((step) => step.id === id && step.type === 'free_response'));
}

const missingRows = rows.filter((row) => row.missing.length > 0);
const summary = {
  lessonCount: allPEnglishLessons.length,
  sourceBankCount: rows.length,
  sourceItemCount: rows.reduce((total, row) => total + row.sourceCount, 0),
  reachableItemCount: rows.reduce((total, row) => total + row.reachableCount, 0),
  unreachableItemCount: missingRows.reduce((total, row) => total + row.missing.length, 0),
  issueCount: missingRows.length,
  sourceObjectiveCount: allPEnglishLessons.reduce((total, lesson) => total + lesson.learningObjectives.length, 0),
  objectiveDisplayCap: 3,
};
const report = { summary, rows: rows.filter((row) => row.sourceCount > 0), issues: missingRows };
const reportDir = path.resolve('reports');
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'penglish-source-reachability.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
if (missingRows.length) {
  console.error(JSON.stringify(missingRows.slice(0, 30), null, 2));
  process.exitCode = 1;
}
