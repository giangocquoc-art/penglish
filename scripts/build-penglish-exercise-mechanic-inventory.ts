import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { allPEnglishLessons } from '../apps/web/src/lib/p-english/lesson-content-data';
import { foundation48DeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons';
import { foundation48Stage3LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage3.lazy';
import { foundation48Stage4LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage4.lazy';
import { foundation48Stage5LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage5.lazy';
import { foundation48Stage6LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage6.lazy';
import { foundation48Stage7LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage7.lazy';
import { foundation48Stage8LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage8.lazy';

const foundationBanks = {
  ...foundation48DeepLessons,
  ...foundation48Stage3LazyDeepLessons,
  ...foundation48Stage4LazyDeepLessons,
  ...foundation48Stage5LazyDeepLessons,
  ...foundation48Stage6LazyDeepLessons,
  ...foundation48Stage7LazyDeepLessons,
  ...foundation48Stage8LazyDeepLessons,
};

const phraseBuilders = allPEnglishLessons.flatMap((lesson) => (lesson.realLifeSituations ?? []).map((situation) => ({
  lessonId: lesson.id,
  id: `scenario-${situation.id}`,
  sourceId: situation.id,
  title: situation.title,
  prompt: situation.scenarioVi,
  currentMechanic: 'free_response_phrase_builder',
  score: 'unscored_self_check',
  limitation: 'Phrases are composition hints; there is no authored set of unique correct branches or consequences.',
})));

const finalPhraseBuilders = allPEnglishLessons.flatMap((lesson) => lesson.finalMiniChallenge ? [{
  lessonId: lesson.id,
  id: `final-${lesson.finalMiniChallenge.id}`,
  sourceId: lesson.finalMiniChallenge.id,
  title: lesson.finalMiniChallenge.title,
  prompt: lesson.finalMiniChallenge.instructionVi,
  currentMechanic: 'free_response_phrase_builder',
  score: 'unscored_self_check',
  limitation: 'The learner composes a response without an authored rubric or consequence branch.',
}] : []);

const participationMissions = allPEnglishLessons.flatMap((lesson) => (lesson.gameMissions ?? [])
  .filter((mission) => mission.completion?.kind === 'complete')
  .map((mission) => ({
    lessonId: lesson.id,
    id: mission.id,
    title: mission.title,
    sourceItemIds: mission.completion?.sourceItemIds ?? [],
    currentMechanic: 'participation_tracker',
    score: 'completion_only',
    limitation: 'Retell/speech completion can count regardless of correctness; tracker means practiced, not mastered.',
  })));

const selfCheckedSpeaking = allPEnglishLessons.flatMap((lesson) => (lesson.speakingReflexPrompts ?? []).map((prompt) => ({
  lessonId: lesson.id,
  id: prompt.id,
  prompt: prompt.promptVi,
  target: prompt.expectedEnglish,
  acceptableAnswers: prompt.acceptableAnswers,
  currentMechanic: 'speak_then_self_mark',
  score: 'unscored',
  limitation: 'No speech-recognition score is claimed; this remains a speaking habit/check.',
})));

const foundationSpeaking = Object.entries(foundationBanks).flatMap(([dayNumber, lesson]) => lesson.speaking.map((prompt) => ({
  lessonId: `foundation48-day-${dayNumber}`,
  id: prompt.id,
  prompt: prompt.meaningVi,
  target: prompt.text,
  currentMechanic: 'speaking_repeat_self_mark',
  score: 'unscored',
  limitation: 'Learner repeats the sentence; recognition/phoneme assessment is not a reliable game score yet.',
})));

const foundationQuizSpeaking = Object.entries(foundationBanks).flatMap(([dayNumber, lesson]) => lesson.quiz
  .filter((item) => item.type === 'speaking-repeat')
  .map((item) => ({
    lessonId: `foundation48-day-${dayNumber}`,
    id: item.id,
    prompt: item.prompt,
    target: item.answer,
    currentMechanic: 'speaking_repeat_self_mark',
    score: 'unscored',
    limitation: 'Speech recognition is not reliable enough to grade this exercise as correct or incorrect.',
  })));

const foundationReview = Object.entries(foundationBanks).flatMap(([dayNumber, lesson]) => lesson.review.remember.map((prompt, index) => ({
  lessonId: `foundation48-day-${dayNumber}`,
  id: `day-${dayNumber}-deep-review-${index}`,
  prompt,
  currentMechanic: 'open_recall_self_check',
  score: 'unscored',
  limitation: 'Free recall has no unique answer key; compare against the lesson or learner checklist.',
})));

const foundationMissions = Array.from({ length: 48 }, (_, index) => {
  const dayNumber = index + 1;
  return {
    lessonId: `foundation48-day-${dayNumber}`,
    id: `day-${dayNumber}-mission-boss`,
    currentMechanic: 'free_response_phrase_builder',
    score: 'unscored_self_check',
    limitation: 'Open application accepts many answers; needs a small authored rubric before any scoring.',
  };
});

const gameMissions = allPEnglishLessons.flatMap((lesson) => (lesson.gameMissions ?? []).map((mission) => ({
  lessonId: lesson.id,
  id: mission.id,
  title: mission.title,
  completionKind: mission.completion?.kind ?? 'no_tracker',
  sourceItemIds: mission.completion?.sourceItemIds ?? [],
  minimum: mission.completion?.minimum ?? null,
}))).filter((mission) => mission.completionKind === 'correct');

const reachabilityPath = path.resolve(process.cwd(), 'reports/penglish-source-reachability.json');
const reachability = JSON.parse(readFileSync(reachabilityPath, 'utf8')) as { summary?: { lessonCount?: number; sourceItemCount?: number; unreachableItemCount?: number } };

const day21 = {
  lessonId: 'foundation48-day-21',
  testId: '1w_VUm9x7og3g2iVTOvzyisIdzbIh-TnT',
  expectedActivities: [
    { kind: 'multiple_choice', idPrefix: 'day-21-source-number-choice-', count: 5, target: 'recognize spoken numbers', audio: '01-1.mp3' },
    { kind: 'typed_dictation', idPrefix: 'day-21-source-number-dictation-', count: 6, target: 'write spoken numbers', audio: '02-2.mp3' },
    { kind: 'phone_number_dictation', idPrefix: 'day-21-source-phone-dictation-', count: 5, target: 'transcribe phone numbers', audio: '03-3.mp3' },
    { kind: 'letter_recognition', idPrefix: 'day-21-source-letter-choice-', count: 5, target: 'identify spoken letters', audio: '04-4.mp3' },
    { kind: 'letter_dictation', idPrefix: 'day-21-source-letter-dictation-', count: 5, target: 'write spoken letters', audio: '05-5.mp3' },
    { kind: 'name_dictation', idPrefix: 'day-21-source-name-dictation-', count: 5, target: 'transcribe spoken names', audio: '06-6.mp3' },
  ],
  totalTestItems: 31,
  localAudioCount: 6,
  answerPdfId: '1SYmebqqiZgbUmPdmfw97xC-Ac_uS7nPw',
  activeMapping: Object.fromEntries(Object.entries(foundationBanks[21]?.quiz.filter((item) => item.id.startsWith('day-21-source-')) ?? []).map(([index, item]) => [item.id, { type: item.type, audio: item.audioSrc, audioLabel: item.audioLabel, selfCheckOnly: item.selfCheckOnly, scoreEligible: item.scoreEligible, answerKeyPresent: Boolean(item.answer) }])),
  status: 'All 31 test items are mapped to type-appropriate choice/dictation activities in the active lesson; each uses its indexed local test audio track and is transparently unscored until the answer key is verified.',
  audioMappingScope: 'The online test indexes mp3.1–6; local audio files 01-1.mp3–06-6.mp3 map in that order. The lesson PDF references mp3.7–12, which are not among the six local indexed audio assets and are not used.',
  answerKeyStatus: 'PDF has no extractable text; all 31 are intentionally unscored and no answer key has been fabricated.',
};

const report = {
  generatedAt: new Date().toISOString(),
  evidence: {
    englishLessonCount: allPEnglishLessons.length,
    englishSourceItemsReachable: (reachability.summary?.sourceItemCount ?? 0) - (reachability.summary?.unreachableItemCount ?? 0),
    englishSourceItemsUnreachable: reachability.summary?.unreachableItemCount ?? null,
    foundationDayCount: Object.keys(foundationBanks).length,
    lessonExperienceAudit: 'reports/penglish-lesson-experience-audit.json',
    sourceReachabilityAudit: 'reports/penglish-source-reachability.json',
  },
  intentionallyUnscoredOrParticipationOnly: {
    realLifePhraseBuilders: phraseBuilders,
    finalPhraseBuilders,
    participationOnlyMissions: participationMissions,
    foundation48OpenMissions: foundationMissions,
    englishSpeakingSelfChecks: selfCheckedSpeaking,
    foundation48SpeakingSelfChecks: foundationSpeaking,
    foundation48QuizSpeakingSelfChecks: foundationQuizSpeaking,
    foundation48OpenReviewPrompts: foundationReview,
  },
  correctlyScoredGameMissions: gameMissions,
  sourceFidelityGaps: {
    day20: {
      lessonId: 'foundation48-day-20',
      status: 'All 20 source test items remain mapped; 31 new listen-and-type drills cover teen/ty contrasts, grouped cardinal numbers through one billion and ordinal forms through ninetieth. One random drill is guaranteed in the core quest.',
      numberDictationItems: foundationBanks[20]?.quiz.filter((item) => item.id.startsWith('day-20-number-dictation-')).map((item) => ({ id: item.id, type: item.type, prompt: item.prompt, spoken: item.speakText, answer: item.answer })) ?? [],
      nextWork: 'Extend with context-bound variants (prices, dates, ages, distances and quantities) as learners progress; avoid duplicating the authored 31-item starter ladder.',
    },
    day21,
  },
  note: 'Open-ended speech and personal answers are intentionally unscored until reliable criteria exist; these are mechanic opportunities, not omitted source banks. Optional bonus challenges remain interactive. Source reachability proves an item can be opened, not that every source mechanic is faithfully represented.',
};

const outputPath = path.resolve(process.cwd(), 'reports/penglish-exercise-mechanic-inventory.json');
mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  outputPath,
  counts: {
    phraseBuilders: phraseBuilders.length,
    finalPhraseBuilders: finalPhraseBuilders.length,
    participationOnlyMissions: participationMissions.length,
    foundation48OpenMissions: foundationMissions.length,
    englishSpeakingSelfChecks: selfCheckedSpeaking.length,
    foundation48SpeakingSelfChecks: foundationSpeaking.length,
    foundation48QuizSpeakingSelfChecks: foundationQuizSpeaking.length,
    foundation48OpenReviewPrompts: foundationReview.length,
    scoreValidatedMissions: gameMissions.length,
    day21SourceTestItems: day21.totalTestItems,
  },
}, null, 2));
