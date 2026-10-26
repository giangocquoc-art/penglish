import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeToken, validateSentenceOrderAnswer } from '../apps/web/src/lib/p-english/practice-randomization';
import type { Foundation48DeepLesson } from '../apps/web/src/features/foundation48/foundation48DeepLessons';
import { foundation48DeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons';
import { foundation48Days } from '../apps/web/src/features/foundation48/foundation48Data';
import { foundation48Stage3LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage3.lazy';
import { foundation48Stage4LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage4.lazy';
import { foundation48Stage5LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage5.lazy';
import { foundation48Stage6LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage6.lazy';
import { foundation48Stage7LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage7.lazy';
import { foundation48Stage8LazyDeepLessons } from '../apps/web/src/features/foundation48/foundation48DeepLessons.stage8.lazy';

const deepLessons: Record<number, Foundation48DeepLesson> = {
  ...foundation48DeepLessons,
  ...foundation48Stage3LazyDeepLessons,
  ...foundation48Stage4LazyDeepLessons,
  ...foundation48Stage5LazyDeepLessons,
  ...foundation48Stage6LazyDeepLessons,
  ...foundation48Stage7LazyDeepLessons,
  ...foundation48Stage8LazyDeepLessons,
};

const issues: string[] = [];
const daySummaries: Array<Record<string, number | string>> = [];
const authoredPictureDays = [3, 4, 13, 16];
const total = {
  deepDays: 0,
  vocabulary: 0,
  patterns: 0,
  dialogueLines: 0,
  shadowingLines: 0,
  commonMistakes: 0,
  listening: 0,
  multipleChoice: 0,
  fillBlank: 0,
  sentenceOrder: 0,
  speaking: 0,
  openReviewPrompts: 0,
  dailyMissionBosses: 48,
  picturePrompts: 0,
};

function requireCondition(condition: boolean, message: string) {
  if (!condition) issues.push(message);
}

function inspectDeepDay(day: number) {
  const lesson = deepLessons[day];
  requireCondition(Boolean(lesson), `Day ${day}: missing lazy deep lesson.`);
  if (!lesson) return;

  total.deepDays += 1;
  requireCondition(lesson.learnerTitle === foundation48Days[day - 1]?.title, `Day ${day}: active lesson title does not match the 48-day roadmap title.`);
  total.vocabulary += lesson.vocabulary.length;
  total.patterns += lesson.patterns.length;
  total.openReviewPrompts += lesson.review.remember.length;
  requireCondition(lesson.readiness === 'complete', `Day ${day}: deep lesson is not marked complete.`);
  total.listening += lesson.listening.length;
  total.speaking += lesson.speaking.length;
  lesson.quiz.forEach((item) => {
    if (item.type === 'multiple-choice' || item.type === 'listen-and-choose') total.multipleChoice += 1;
    if (item.type === 'fill-blank') total.fillBlank += 1;
    if (item.type === 'sentence-order') total.sentenceOrder += 1;
    if (item.type === 'speaking-repeat') total.speaking += 1;
  });
  (lesson.picturePrompts ?? []).forEach((item) => {
    total.picturePrompts += 1;
    const asset = `apps/web/public/assets/foundation48/picture-challenges/day-${String(day).padStart(2, '0')}-grid.webp`;
    requireCondition(authoredPictureDays.includes(day), `Day ${day}: picture challenge is outside the authored picture days.`);
    requireCondition(Boolean(item.prompt.trim() && item.answer.trim() && item.alt.trim()), `Day ${day}, picture ${item.id}: prompt, answer, and alt text are required.`);
    requireCondition(item.panel >= 0 && item.panel <= 4, `Day ${day}, picture ${item.id}: panel index is out of range.`);
    const acceptableAnswers = [item.answer, ...(item.acceptableAnswers ?? [])].map((answer) => answer.trim().toLocaleLowerCase());
    requireCondition(acceptableAnswers.every(Boolean) && new Set(acceptableAnswers).size === acceptableAnswers.length, `Day ${day}, picture ${item.id}: expected a nonempty, unique sentence answer set.`);
    requireCondition(/[.!?]$/.test(item.answer.trim()), `Day ${day}, picture ${item.id}: the model answer should be a complete sentence.`);
    requireCondition(existsSync(asset), `Day ${day}, picture ${item.id}: image asset is missing.`);
    if (existsSync(asset)) requireCondition(statSync(asset).size <= 350_000, `Day ${day}, picture asset exceeds the 350 KB budget.`);
    if (item.id === 'day-3-picture-5') {
      const handbagAsset = 'apps/web/public/assets/foundation48/picture-challenges/day-03-handbag.webp';
      requireCondition(existsSync(handbagAsset), 'Day 3, picture day-3-picture-5: isolated source handbag asset is missing.');
      if (existsSync(handbagAsset)) requireCondition(statSync(handbagAsset).size <= 150_000, 'Day 3 isolated handbag image exceeds the 150 KB budget.');
    }
  });
  if (authoredPictureDays.includes(day)) requireCondition((lesson.picturePrompts?.length ?? 0) === 5, `Day ${day}: expected all five source picture questions.`);
  lesson.listening.forEach((item) => {
    const uniqueOptions = new Set(item.options.map((option) => option.trim()));
    requireCondition(item.answer.trim().length > 0, `Day ${day}, listening ${item.id}: empty answer.`);
    requireCondition(uniqueOptions.size >= 3, `Day ${day}, listening ${item.id}: fewer than 3 unique options.`);
    requireCondition(uniqueOptions.has(item.answer), `Day ${day}, listening ${item.id}: answer missing from options.`);
  });
  lesson.quiz.forEach((item) => {
    if (item.type === 'multiple-choice' || item.type === 'listen-and-choose') {
      const options = item.options ?? [];
      const uniqueOptions = new Set(options.map((option) => option.trim()));
      if (item.selfCheckOnly) {
        requireCondition(uniqueOptions.size >= 2, `Day ${day}, self-check quiz ${item.id}: fewer than 2 unique options.`);
        requireCondition(!item.answer && item.scoreEligible === false, `Day ${day}, self-check quiz ${item.id}: an unverified answer must stay empty and unscored.`);
        requireCondition(Boolean(item.audioSrc && item.audioLabel), `Day ${day}, self-check quiz ${item.id}: source audio mapping is missing.`);
      } else {
        requireCondition(uniqueOptions.size >= 3, `Day ${day}, quiz ${item.id}: fewer than 3 unique options.`);
        requireCondition(uniqueOptions.has(item.answer), `Day ${day}, quiz ${item.id}: answer missing from options.`);
      }
    }
    if (item.type === 'fill-blank') {
      requireCondition(item.selfCheckOnly || item.answer.trim().length > 0, `Day ${day}, fill ${item.id}: empty answer.`);
      requireCondition(item.prompt.includes('___'), `Day ${day}, fill ${item.id}: prompt has no blank.`);
      if (item.selfCheckOnly) {
        requireCondition(item.scoreEligible === false, `Day ${day}, self-check fill ${item.id}: unverified item is score eligible.`);
        requireCondition(Boolean(item.audioSrc && item.audioLabel), `Day ${day}, self-check fill ${item.id}: source audio mapping is missing.`);
      }
      if (day >= 39) {
        requireCondition(!/[.!?]/.test(item.answer), `Day ${day}, fill ${item.id}: expected the missing word/phrase, but received a completed sentence.`);
        requireCondition(item.answer.trim().split(/\s+/).length <= 3, `Day ${day}, fill ${item.id}: answer is too long for the requested blank.`);
      }
    }
    if (item.type === 'sentence-order') {
      const tokenBag = (item.tokens ?? []).map(normalizeToken).sort().join('|');
      const answerBag = item.answer.trim().split(/\s+/).map(normalizeToken).sort().join('|');
      requireCondition((item.tokens?.length ?? 0) >= 2, `Day ${day}, order ${item.id}: fewer than 2 tokens.`);
      requireCondition(tokenBag === answerBag, `Day ${day}, order ${item.id}: tokens do not match the answer.`);
      requireCondition(!validateSentenceOrderAnswer(item.tokens ?? [], item.answer), `Day ${day}, order ${item.id}: tokens are already in answer order.`);
    }
    if (item.type === 'speaking-repeat') requireCondition(item.answer.trim().length > 0, `Day ${day}, speaking ${item.id}: empty target.`);
  });
  if (day === 5) {
    const sourceVerbIds = ['watch', 'study', 'play', 'dance', 'go', 'do', 'visit', 'wash'].map((verb) => `day-5-source-verb-form-${verb}`);
    const sourceChoiceIds = Array.from({ length: 12 }, (_, index) => `day-5-source-choice-${index + 1}`);
    const quizIds = new Set(lesson.quiz.map((item) => item.id));
    requireCondition(sourceVerbIds.every((id) => quizIds.has(id)), 'Day 5: source verb-form questions are incomplete.');
    requireCondition(sourceChoiceIds.every((id) => quizIds.has(id)), 'Day 5: source multiple-choice questions are incomplete.');
    requireCondition(sourceVerbIds.every((id) => lesson.quiz.find((item) => item.id === id)?.type === 'fill-blank'), 'Day 5: source verb forms must be typed answers.');
    requireCondition(sourceChoiceIds.every((id) => lesson.quiz.find((item) => item.id === id)?.type === 'multiple-choice'), 'Day 5: source choices must remain multiple-choice questions.');
  }
  if (day === 14) {
    const sourceForms = Array.from({ length: 5 }, (_, index) => `day-14-source-form-${index + 1}`);
    const sourceChoices = Array.from({ length: 15 }, (_, index) => `day-14-source-choice-${index + 1}`);
    const quizById = new Map(lesson.quiz.map((item) => [item.id, item]));
    requireCondition(lesson.learnerTitle.includes('quá khứ tiếp diễn'), 'Day 14: active lesson title does not match the source test topic.');
    requireCondition(lesson.grammarPoint.title.includes('was / were'), 'Day 14: active grammar point does not teach the source past-continuous form.');
    requireCondition(sourceForms.every((id) => quizById.has(id)), 'Day 14: one or more of the five source verb-form transformations are missing.');
    requireCondition(sourceChoices.every((id) => quizById.has(id)), 'Day 14: one or more of the fifteen source multiple-choice questions are missing.');
    requireCondition(sourceForms.every((id) => quizById.get(id)?.type === 'fill-blank'), 'Day 14: source transformations must remain typed fill-in challenges.');
    requireCondition(sourceChoices.every((id) => quizById.get(id)?.type === 'multiple-choice'), 'Day 14: source choices must remain multiple-choice challenges.');
    requireCondition((quizById.get('day-14-source-choice-3')?.prompt ?? '').includes('power went out'), 'Day 14: clarify the source item whose past-simple and past-continuous answers were both grammatical without context.');
  }
  if (day === 15) {
    const sourceFillIds = [
      ...Array.from({ length: 5 }, (_, index) => `day-15-source-participle-${index + 1}`),
      ...Array.from({ length: 5 }, (_, index) => `day-15-source-form-${index + 1}`),
    ];
    const sourceChoiceIds = [
      ...Array.from({ length: 5 }, (_, index) => `day-15-source-agreement-${index + 1}`),
      ...Array.from({ length: 10 }, (_, index) => `day-15-source-choice-${index + 1}`),
    ];
    const quizById = new Map(lesson.quiz.map((item) => [item.id, item]));
    requireCondition(lesson.learnerTitle.includes('hiện tại hoàn thành'), 'Day 15: active lesson title does not match the source test topic.');
    requireCondition(lesson.grammarPoint.title.includes('have / has + past participle'), 'Day 15: active grammar point does not teach the source present-perfect form.');
    requireCondition(sourceFillIds.every((id) => quizById.has(id)), 'Day 15: one or more of the ten source typed questions are missing.');
    requireCondition(sourceChoiceIds.every((id) => quizById.has(id)), 'Day 15: one or more of the fifteen source multiple-choice questions are missing.');
    requireCondition(sourceFillIds.every((id) => quizById.get(id)?.type === 'fill-blank'), 'Day 15: source participle/form questions must remain typed challenges.');
    requireCondition(sourceChoiceIds.every((id) => quizById.get(id)?.type === 'multiple-choice'), 'Day 15: source choices must remain multiple-choice challenges.');
  }
  if (day === 16) {
    const sourceForms = Array.from({ length: 5 }, (_, index) => `day-16-source-form-${index + 1}`);
    const sourceChoices = Array.from({ length: 10 }, (_, index) => `day-16-source-choice-${index + 1}`);
    const quizById = new Map(lesson.quiz.map((item) => [item.id, item]));
    requireCondition(lesson.learnerTitle.includes('tương lai đơn'), 'Day 16: active lesson title does not match the source simple-future topic.');
    requireCondition(lesson.grammarPoint.title.toLocaleLowerCase().includes('will'), 'Day 16: active grammar point does not teach will future.');
    requireCondition(sourceForms.every((id) => quizById.has(id)), 'Day 16: one or more of the five source verb-form transformations are missing.');
    requireCondition(sourceChoices.every((id) => quizById.has(id)), 'Day 16: one or more of the ten source multiple-choice questions are missing.');
    requireCondition(sourceForms.every((id) => quizById.get(id)?.type === 'fill-blank'), 'Day 16: source transformations must remain typed fill-in challenges.');
    requireCondition(sourceChoices.every((id) => quizById.get(id)?.type === 'multiple-choice'), 'Day 16: source choices must remain multiple-choice challenges.');
    requireCondition((lesson.picturePrompts?.length ?? 0) === 5, 'Day 16: expected all five authored image-response questions.');
  }
  if (day === 17) {
    const sourceForms = Array.from({ length: 5 }, (_, index) => `day-17-source-form-${index + 1}`);
    const sourceChoices = Array.from({ length: 34 }, (_, index) => `day-17-source-choice-${index + 1}`);
    const quizById = new Map(lesson.quiz.map((item) => [item.id, item]));
    requireCondition(lesson.learnerTitle.includes('tương lai hoàn thành'), 'Day 17: active lesson title does not match the source future-perfect topic.');
    requireCondition(lesson.grammarPoint.title.toLocaleLowerCase().includes('will have'), 'Day 17: active grammar point does not teach will have + past participle.');
    requireCondition(sourceForms.every((id) => quizById.has(id)), 'Day 17: one or more of the five source verb-form transformations are missing.');
    requireCondition(sourceChoices.every((id) => quizById.has(id)), 'Day 17: one or more of the 34 source choice questions across the lesson and test PDFs are missing.');
    requireCondition(sourceForms.every((id) => quizById.get(id)?.type === 'fill-blank'), 'Day 17: source verb-form transformations must remain typed fill-in challenges.');
    requireCondition(sourceChoices.every((id) => quizById.get(id)?.type === 'multiple-choice'), 'Day 17: source choices must remain multiple-choice challenges.');
    requireCondition((quizById.get('day-17-source-choice-4')?.answer ?? '') === 'will have been', 'Day 17: repair the source sentence to “will have been married” so its grammar is correct.');
    requireCondition((quizById.get('day-17-source-choice-17')?.answer ?? '') === 'will have been retired', 'Day 17: use “will have been retired” for the future-perfect state; “will have retired for two months” is ungrammatical.');
  }
  if (day === 18) {
    const sourceChoices = Array.from({ length: 20 }, (_, index) => `day-18-source-choice-${index + 1}`);
    const quizById = new Map(lesson.quiz.map((item) => [item.id, item]));
    const ipaSymbols = ['/iː/', '/ɪ/', '/ʊ/', '/uː/', '/ə/', '/ɜː/', '/e/', '/æ/', '/ʌ/', '/ɑː/', '/ɒ/', '/ɔː/', '/ɪə/', '/eɪ/', '/ʊə/', '/ɔɪ/', '/əʊ/', '/eə/', '/aɪ/', '/aʊ/', '/p/', '/b/', '/t/', '/d/', '/f/', '/v/', '/θ/', '/ð/', '/tʃ/', '/dʒ/', '/k/', '/ɡ/', '/s/', '/z/', '/ʃ/', '/ʒ/', '/m/', '/n/', '/ŋ/', '/h/', '/l/', '/r/', '/w/', '/j/'];
    const patternNames = new Set(lesson.patterns.map((item) => item.pattern));
    requireCondition(lesson.learnerTitle.includes('44 âm IPA'), 'Day 18: lesson title does not state the source phonetic learning goal.');
    requireCondition(lesson.grammarPoint.title.includes('IPA') && lesson.grammarPoint.title.includes('24 phụ âm'), 'Day 18: explain the 20 vowels and 24 consonants covered by the source.');
    requireCondition(ipaSymbols.length === 44 && ipaSymbols.every((symbol) => patternNames.has(symbol)), 'Day 18: the interactive sound map must include all 44 source IPA symbols.');
    requireCondition(sourceChoices.every((id) => quizById.has(id)), 'Day 18: one or more of the 20 source phoneme-recognition questions are missing.');
    requireCondition(sourceChoices.every((id) => quizById.get(id)?.type === 'multiple-choice'), 'Day 18: each source phoneme question must remain an interactive multiple-choice challenge.');
    requireCondition(lesson.quiz.find((item) => item.id === 'day-18-source-choice-18')?.answer === 'accident', 'Day 18: the schwa item must retain its checked example word.');
    requireCondition(lesson.quiz.find((item) => item.id === 'day-18-source-choice-20')?.answer === 'teacher', 'Day 18: the /tʃ/ item must retain its checked example word.');
  }
  if (day === 19) {
    const sourcePositions = Array.from({ length: 10 }, (_, index) => `day-19-source-position-${index + 1}`);
    const sourceWordQuestions = Array.from({ length: 5 }, (_, index) => `day-19-source-word-${index + 1}`);
    const quizById = new Map(lesson.quiz.map((item) => [item.id, item]));
    requireCondition(lesson.learnerTitle.includes('Trọng âm từ'), 'Day 19: lesson title does not match the source word-stress lesson.');
    requireCondition(lesson.grammarPoint.title.includes('ˈ') && lesson.grammarPoint.title.includes('ˌ'), 'Day 19: explain the source primary- and secondary-stress marks.');
    requireCondition([...sourcePositions, ...sourceWordQuestions].every((id) => quizById.has(id)), 'Day 19: one or more of the 15 source stress questions are missing.');
    requireCondition([...sourcePositions, ...sourceWordQuestions].every((id) => quizById.get(id)?.type === 'multiple-choice'), 'Day 19: source stress questions must remain multiple-choice challenges.');
    requireCondition(lesson.speaking.length === 10 && lesson.speaking.map((item) => item.text).join('|').includes('open'), 'Day 19: all ten source pronunciation words, including “open”, must be read aloud.');
    requireCondition(lesson.grammarPoint.explanationVi.includes('open /ˈəʊpən/'), 'Day 19: flag the source’s overgeneralized /əʊ/ stress rule using its own counterexample.');
  }
  if (day === 20) {
    const bankFills = Array.from({ length: 5 }, (_, index) => `day-20-source-bank-${index + 1}`);
    const writtenQuestions = Array.from({ length: 5 }, (_, index) => `day-20-source-build-${index + 1}`);
    const sourceChoices = Array.from({ length: 10 }, (_, index) => `day-20-source-choice-${index + 1}`);
    const quizById = new Map(lesson.quiz.map((item) => [item.id, item]));
    const patternNames = new Set(lesson.patterns.map((item) => item.pattern));
    const requiredHowForms = ['How + do/does + S + V?', 'How + be + S?', 'How much + be/do...?', 'How many + plural noun...?', 'How far...?', 'How old...?', 'How often...?', 'How long...?'];
    requireCondition(requiredHowForms.every((pattern) => patternNames.has(pattern)), 'Day 20: one or more source How collocations are missing.');
    requireCondition(['Why...?', 'Which (noun)...?', 'Cardinal numbers', 'Ordinal numbers'].every((pattern) => patternNames.has(pattern)), 'Day 20: Why/Which or the source number/ordinal reference is missing.');
    requireCondition([...bankFills, ...writtenQuestions].every((id) => quizById.get(id)?.type === 'fill-blank'), 'Day 20: retain five word-bank fills and five typed question-construction tasks.');
    requireCondition(sourceChoices.every((id) => quizById.get(id)?.type === 'multiple-choice'), 'Day 20: one or more of the ten source multiple-choice questions are missing.');
    requireCondition(quizById.get('day-20-source-bank-4')?.answer === 'How often', 'Day 20: repair the source word-bank omission; “Twice a week” requires How often.');
    requireCondition(lesson.quiz.find((item) => item.id === 'day-20-source-build-4')?.answer === 'How long have you lived in Hanoi', 'Day 20: the typed duration question must include grammatical “in Hanoi”.');
    requireCondition(lesson.grammarPoint.explanationVi.includes('fourth'), 'Day 20: correct the source ordinal misspelling “forth” for 4th.');
    requireCondition(lesson.speaking.length === 10, 'Day 20: include ten varied listening/speaking examples for the source question forms.');
    const numberDrills = lesson.quiz.filter((item) => item.id.startsWith('day-20-number-dictation-'));
    requireCondition(numberDrills.filter((item) => item.id.includes('-cardinal-')).length === 18, 'Day 20: include the progressive cardinal dictation set through one billion.');
    requireCondition(numberDrills.filter((item) => item.id.includes('-ordinal-')).length === 13, 'Day 20: include ordinal dictation examples from first through ninetieth.');
    requireCondition(numberDrills.every((item) => item.type === 'fill-blank' && item.speakText && item.answer), 'Day 20: every number/ordinal dictation needs generated audio and an authored numeric answer.');
    requireCondition(numberDrills.some((item) => item.speakText === 'one billion') && numberDrills.some((item) => item.speakText === 'ninetieth'), 'Day 20: the number ladder must reach the source cardinal and ordinal limits.');
  }
  if (day === 21) {
    const groups = [
      { prefix: 'number-choice', count: 5, type: 'multiple-choice', audio: '01-1.mp3' },
      { prefix: 'number-dictation', count: 6, type: 'fill-blank', audio: '02-2.mp3' },
      { prefix: 'phone-dictation', count: 5, type: 'fill-blank', audio: '03-3.mp3' },
      { prefix: 'letter-choice', count: 5, type: 'multiple-choice', audio: '04-4.mp3' },
      { prefix: 'letter-dictation', count: 5, type: 'fill-blank', audio: '05-5.mp3' },
      { prefix: 'name-dictation', count: 5, type: 'fill-blank', audio: '06-6.mp3' },
    ];
    const quizById = new Map(lesson.quiz.map((item) => [item.id, item]));
    const sourceIds = groups.flatMap((group) => Array.from({ length: group.count }, (_, index) => `day-21-source-${group.prefix}-${index + 1}`));
    requireCondition(lesson.learnerTitle === 'Luyện nghe số và tên', 'Day 21: preserve the source unit title.');
    requireCondition(lesson.quiz.filter((item) => item.id.startsWith('day-21-source-')).length === 31, 'Day 21: the six online test sections must map all 31 items.');
    requireCondition(sourceIds.every((id) => quizById.has(id)), 'Day 21: one or more of the 31 source listening items are missing.');
    for (const group of groups) {
      for (let index = 1; index <= group.count; index += 1) {
        const item = quizById.get(`day-21-source-${group.prefix}-${index}`);
        requireCondition(item?.type === group.type, `Day 21: ${group.prefix} ${index} must use ${group.type}.`);
        requireCondition(item?.selfCheckOnly === true && item.scoreEligible === false && item.answer === '', `Day 21: ${group.prefix} ${index} must remain unscored until its answer key is verified.`);
        const expectedAudio = `/assets/foundation48/audio/day-21/${group.audio}`;
        requireCondition(item?.audioSrc === expectedAudio, `Day 21: ${group.prefix} ${index} must map to ${group.audio}.`);
        requireCondition(existsSync(resolve('apps/web/public', expectedAudio.replace(/^\//, ''))), `Day 21: mapped audio file ${group.audio} is missing.`);
      }
    }
    const numberPairs = [['8', '9'], ['13', '15'], ['31', '41'], ['120', '150'], ['1780', '1785']];
    const letterPairs = [['L', 'G'], ['R', 'A'], ['I', 'E'], ['J', 'F'], ['B', 'P']];
    for (const [prefix, pairs] of [['number-choice', numberPairs], ['letter-choice', letterPairs]] as const) {
      pairs.forEach(([first, second], index) => {
        const options = quizById.get(`day-21-source-${prefix}-${index + 1}`)?.options ?? [];
        requireCondition([first, second].every((option) => options.includes(option)) && options.length === 2, `Day 21: ${prefix} ${index + 1} must present two available listening choices; the unverified key remains hidden.`);
      });
    }
  }
  requireCondition(lesson.speaking.every((item) => Boolean(item.text.trim() && item.meaningVi.trim())), `Day ${day}: a speaking item is missing its model or meaning.`);
  daySummaries.push({ day, path: 'deep', vocab: lesson.vocabulary.length, patterns: lesson.patterns.length, listening: lesson.listening.length, quiz: lesson.quiz.length, speaking: lesson.speaking.length });
}

for (let day = 1; day <= 48; day += 1) inspectDeepDay(day);

const report = {
  generatedAt: new Date().toISOString(),
  dayCount: daySummaries.length,
  coverage: total,
  issueCount: issues.length,
  issues,
  days: daySummaries,
  releaseReady: issues.length === 0 && daySummaries.length === 48,
};
const reportDir = resolve(process.cwd(), 'reports');
mkdirSync(reportDir, { recursive: true });
writeFileSync(resolve(reportDir, 'foundation48-interactive-content-audit.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify({ dayCount: report.dayCount, coverage: report.coverage, issueCount: report.issueCount, releaseReady: report.releaseReady, report: 'reports/foundation48-interactive-content-audit.json' }, null, 2));
if (!report.releaseReady) process.exitCode = 1;
