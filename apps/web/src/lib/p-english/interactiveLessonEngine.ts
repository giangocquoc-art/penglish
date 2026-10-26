import type {
  EnglishLesson,
  FillBlankTask,
  FlashcardItem,
  EnglishSpeedPrompt,
  GameMission,
  GrammarNote,
  ListeningPracticeItem,
  MatchPair,
  MiniDialogue,
  PronunciationNote,
  RealLifeSituation,
  QuizQuestion,
  SentencePattern,
  SentenceOrderingTask,
  SpeakingReflexPrompt,
  VocabularyItem,
} from './lesson-content-data';
import { getLessonById } from './lesson-content-data';
import { getUnifiedLessonEntry } from './unifiedLessonEngine';
import { recordLearningLoopActivity, recordLearningLoopMistake, resolveLearningLoopMistake, upsertLearningLoopWords } from './learning-loop';
import { getLessonProgress, markItemReviewed, markLessonCompleted, markLessonStarted, markLessonStepCompleted } from './lesson-progress';
import { saveWordReviewStatus } from './vocabulary-review';
import { shuffleTokensForQuestion } from './practice-randomization';

export type InteractiveLessonStepType =
  | 'intro'
  | 'flashcard'
  | 'multiple_choice'
  | 'fill_blank'
  | 'speed_recall'
  | 'sentence_order'
  | 'match_pairs'
  | 'listen_choose'
  | 'speak_repeat'
  | 'shadowing'
  | 'lesson_tip'
  | 'free_response'
  | 'mission_tracker'
  | 'summary';

export type InteractiveLessonStep = {
  id: string;
  type: InteractiveLessonStepType;
  title: string;
  instruction: string;
  prompt?: string;
  answer?: string;
  options?: string[];
  matchPairs?: Array<Pick<MatchPair, 'id' | 'left' | 'right'>>;
  sourceItemIds?: string[];
  words?: string[];
  acceptableAnswers?: string[];
  english?: string;
  vietnamese?: string;
  body?: string;
  choices?: string[];
  targetOutputs?: string[];
  phraseBank?: string[];
  missionRequirement?: GameMission['completion'];
  speechLang?: 'en-US' | 'en-GB';
  speechRate?: number;
  timeLimitSeconds?: number;
  hint?: string;
  explanation?: string;
  vocabularyId?: string;
  sourceItemId?: string;
  srsType?: 'flashcard' | 'quiz' | 'listening' | 'reflex' | 'typing' | 'match' | 'speed';
  completionGroup?: 'vocabulary' | 'quiz' | 'reflex' | 'listening';
  completionItemId?: string;
  reviewOfStepId?: string;
  optionalBonus?: boolean;
  learningTips?: Array<{ id: string; title: string; body: string }>;
};

export type InteractiveLesson = {
  id: string;
  unitId: string;
  nodeId?: string;
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  xp: number;
  steps: InteractiveLessonStep[];
  sourceLesson: EnglishLesson;
};

function selectCoreQuestSteps(steps: InteractiveLessonStep[]) {
  const selected = new Set<string>();
  const addFirst = (predicate: (step: InteractiveLessonStep) => boolean) => {
    const step = steps.find((candidate) => !selected.has(candidate.id) && predicate(candidate));
    if (step) selected.add(step.id);
  };

  // A compact learning arc: listen for context, recall a word, solve a checked challenge,
  // speak, then apply one phrase in a real situation when the lesson has one.
  addFirst((step) => step.type === 'listen_choose');
  addFirst((step) => step.type === 'flashcard');
  addFirst((step) => ['multiple_choice', 'fill_blank', 'sentence_order', 'match_pairs', 'speed_recall'].includes(step.type));
  addFirst((step) => step.type === 'shadowing' || step.type === 'speak_repeat');
  addFirst((step) => step.id.startsWith('scenario-') || step.id.startsWith('final-'));
  addFirst((step) => step.type === 'speed_recall' || step.type === 'match_pairs' || step.type === 'sentence_order');

  const coreEligibleCount = steps.filter((step) => step.type !== 'lesson_tip' && step.type !== 'mission_tracker').length;
  while (selected.size < Math.min(4, coreEligibleCount)) {
    const fallback = steps.find((step) => !selected.has(step.id) && step.type !== 'lesson_tip' && step.type !== 'mission_tracker');
    if (!fallback) break;
    selected.add(fallback.id);
  }

  return steps.map((step) => ({ ...step, optionalBonus: !selected.has(step.id) }));
}

export type InteractiveLessonResult = {
  lessonId: string;
  unitId: string;
  xp: number;
  correctCount: number;
  totalAnswered: number;
  weakItems: InteractiveLessonStep[];
};

export type InteractiveLessonCriteriaProgress = {
  key: 'vocabulary' | 'quiz' | 'reflex' | 'listening';
  label: string;
  current: number;
  total: number;
  minimum: number;
  met: boolean;
};

export function getInteractiveLessonCriteriaProgress(
  lesson: InteractiveLesson,
  completedSteps: readonly string[],
  stepOutcomes: Record<string, boolean>,
): InteractiveLessonCriteriaProgress[] {
  const groups = new Map<string, InteractiveLessonStep[]>();
  lesson.steps.forEach((step) => {
    if (!step.completionGroup || !step.completionItemId) return;
    const key = `${step.completionGroup}:${step.completionItemId}`;
    groups.set(key, [...(groups.get(key) ?? []), step]);
  });
  const completed = (group: InteractiveLessonStep['completionGroup'], requireCorrect: boolean) =>
    Array.from(groups.entries()).filter(([key, steps]) => key.startsWith(`${group}:`) &&
      steps.every((step) => completedSteps.includes(step.id)) &&
      (!requireCorrect || steps.every((step) => stepOutcomes[step.id] === true))).length;
  const criteria = lesson.sourceLesson.completionCriteria;
  const items: Omit<InteractiveLessonCriteriaProgress, 'met'>[] = [
    { key: 'vocabulary', label: 'Ôn thẻ từ', current: completed('vocabulary', false), total: groupsFor('vocabulary'), minimum: criteria.flashcardsReviewed },
    { key: 'quiz', label: 'Câu đúng ngay lần đầu', current: completed('quiz', true), total: groupsFor('quiz'), minimum: criteria.minimumQuizCorrect },
    { key: 'reflex', label: 'Luyện nói', current: completed('reflex', false), total: criteria.totalReflexPrompts, minimum: criteria.minimumReflexPromptsCompleted },
    { key: 'listening', label: 'Nghe và hội thoại', current: completed('listening', false), total: groupsFor('listening'), minimum: criteria.minimumListeningOrDialogueRepeats },
  ];
  return items.map((item) => ({ ...item, met: item.current >= item.minimum }));

  function groupsFor(group: NonNullable<InteractiveLessonStep['completionGroup']>) {
    return Array.from(groups.keys()).filter((key) => key.startsWith(`${group}:`)).length;
  }
}

// Keep v2 so in-progress sessions with stable challenge IDs retain their saved checkpoint.
export const INTERACTIVE_LESSON_FLOW_VERSION = 2;

function attachTeachingNotesToChallenges(steps: InteractiveLessonStep[]) {
  const output: InteractiveLessonStep[] = [];
  let pendingTips: NonNullable<InteractiveLessonStep['learningTips']> = [];

  for (const step of steps) {
    if (step.type === 'lesson_tip') {
      pendingTips.push({
        id: step.id,
        title: step.title,
        body: step.body || step.prompt || step.title,
      });
      continue;
    }

    const nextTip = pendingTips.shift();
    output.push(nextTip ? { ...step, learningTips: [nextTip] } : step);
  }

  if (pendingTips.length && output.length) {
    const lastIndex = output.length - 1;
    output[lastIndex] = {
      ...output[lastIndex],
      learningTips: [...(output[lastIndex].learningTips || []), ...pendingTips],
    };
  }

  return output;
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, 4);
}

function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function answerToText(answer: QuizQuestion['answer']) {
  return Array.isArray(answer) ? answer[0] ?? '' : answer;
}

function stepFromVocabulary(item: VocabularyItem, index: number): InteractiveLessonStep {
  return {
    id: `flashcard-${item.id}-${index}`,
    type: 'flashcard',
    title: index === 0 ? 'Học cụm đầu tiên' : 'Ghi nhớ thêm một cụm',
    instruction: 'Nhớ nghĩa trước khi lật thẻ, rồi tự đánh dấu mức độ ghi nhớ.',
    prompt: item.term,
    answer: item.meaningVi,
    acceptableAnswers: [item.meaningVi],
    english: item.example,
    vietnamese: item.meaningVi,
    hint: item.pronunciation,
    explanation: item.exampleMeaningVi,
    vocabularyId: item.id,
    sourceItemId: item.id,
    srsType: 'flashcard',
    completionGroup: 'vocabulary',
    completionItemId: item.id,
  };
}

function stepFromFlashcard(item: FlashcardItem, index: number): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'flashcard',
    title: index === 0 ? 'Học cụm quan trọng' : 'Ôn nhanh bằng thẻ từ',
    instruction: 'Nhớ nghĩa trước khi lật thẻ. Sau đó tự chọn “Nhớ được” hoặc “Cần ôn lại”.',
    prompt: item.front,
    answer: item.back,
    english: item.example,
    vietnamese: item.exampleMeaningVi,
    explanation: item.back,
    sourceItemId: item.id,
    srsType: 'flashcard',
  };
}

function stepFromQuiz(item: QuizQuestion, index: number, fallbackOptions: string[]): InteractiveLessonStep {
  const answer = answerToText(item.answer);
  const prompt = item.type === 'fill-blank' ? item.prompt ?? item.question : item.question;
  const type: InteractiveLessonStepType = item.type === 'fill-blank' ? 'fill_blank' : item.type === 'sentence-order' ? 'sentence_order' : 'multiple_choice';
  return {
    id: item.id,
    type,
    title: index === 0 ? 'Chọn đáp án đúng' : type === 'fill_blank' ? 'Điền từ còn thiếu' : type === 'sentence_order' ? 'Sắp xếp câu' : 'Thử sức nhẹ',
    instruction: type === 'fill_blank' ? 'Gõ phần còn thiếu trong câu.' : type === 'sentence_order' ? 'Chạm các từ theo đúng thứ tự.' : 'Chọn một đáp án. Poo sẽ góp ý ngay.',
    prompt,
    answer,
    acceptableAnswers: Array.isArray(item.answer) ? item.answer : [answer],
    options: item.options?.length ? uniqueOptions([answer, ...item.options]) : uniqueOptions([answer, ...fallbackOptions]),
    words: item.type === 'sentence-order' ? shuffleTokensForQuestion(item.words || [], item.id) : undefined,
    vietnamese: item.type === 'sentence-order' ? item.vietnamese : undefined,
    explanation: item.explanationVi,
    sourceItemId: item.id,
    srsType: item.type === 'fill-blank' ? 'typing' : 'quiz',
    completionGroup: 'quiz',
    completionItemId: item.id,
  };
}

function stepFromLessonTip(id: string, title: string, body: string, examples: string[] = []): InteractiveLessonStep {
  return {
    id,
    type: 'lesson_tip',
    title,
    instruction: 'Đọc phần ngắn này, thử nói lại ý chính rồi xác nhận để chuyển sang nhiệm vụ kế tiếp.',
    prompt: title,
    body: [body, ...examples].filter(Boolean).join('\n'),
  };
}

function stepFromMatchPairs(pairs: MatchPair[], id: string, sourceItemIds: string[], isQuiz = false): InteractiveLessonStep {
  return {
    id,
    type: 'match_pairs',
    title: 'Ghép cặp từ và nghĩa',
    instruction: 'Chọn một cụm tiếng Anh, rồi nối với nghĩa tiếng Việt tương ứng.',
    prompt: `Ghép ${pairs.length} cặp để qua màn này.`,
    answer: 'Ghép đúng tất cả các cặp trong vòng này.',
    matchPairs: pairs.map(({ id: pairId, left, right }) => ({ id: pairId, left, right })),
    sourceItemIds,
    srsType: 'match',
    completionGroup: isQuiz ? 'quiz' : undefined,
    completionItemId: isQuiz ? sourceItemIds[0] : undefined,
  };
}

function stepFromSingleMatchPair(pair: MatchPair, item: QuizQuestion, index: number): InteractiveLessonStep {
  return {
    id: `match-quiz-${item.id}-${index}`,
    type: 'multiple_choice',
    title: 'Chọn nghĩa đúng',
    instruction: 'Đọc cụm tiếng Anh, rồi chọn nghĩa phù hợp nhất.',
    prompt: `“${pair.left}” có nghĩa là gì?`,
    answer: pair.right,
    acceptableAnswers: [pair.right],
    options: uniqueOptions([...(item.options ?? []), pair.right]).slice(0, 4),
    sourceItemId: `${item.id}-0`,
    srsType: 'match',
    completionGroup: 'quiz',
    completionItemId: item.id,
  };
}

function stepFromDialogue(dialogue: MiniDialogue): InteractiveLessonStep[] {
  const lines = dialogue.lines;
  return lines.map((line, lineIndex) => {
    const previous = lines[lineIndex - 1];
    const options = uniqueOptions([line.text, ...lines.map((candidate) => candidate.text)]);
    return {
      id: `dialogue-${dialogue.id}-${lineIndex}`,
      type: 'listen_choose' as const,
      title: `Hội thoại · ${dialogue.title}`,
      instruction: 'Nghe lời thoại trước, rồi chọn câu tiếp theo phù hợp trong hội thoại.',
      prompt: previous ? `${previous.speaker}: “${previous.text}”\nChọn lời đáp phù hợp.` : 'Nghe câu mở đầu của hội thoại rồi chọn câu vừa nghe.',
      answer: line.text,
      acceptableAnswers: [line.text],
      options,
      // For reply lines, play the previous speaker's cue so the audio does not
      // reveal the answer before the learner chooses a response.
      english: previous?.text ?? line.text,
      vietnamese: dialogue.vietnameseTranslation[lineIndex],
      explanation: dialogue.focusPhrases.join(' · ') || dialogue.suggestedShadowingInstruction,
      sourceItemId: `${dialogue.id}-${lineIndex}`,
      srsType: 'listening' as const,
      completionGroup: 'listening' as const,
      completionItemId: `${dialogue.id}-${lineIndex}`,
    };
  }).map((step, lineIndex) => lineIndex === 0 ? { ...step, prompt: `Hội thoại “${dialogue.title}”: ${step.prompt}` } : step);
}

function stepFromSpeedPrompt(item: EnglishSpeedPrompt): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'speed_recall',
    title: 'Tăng tốc phản xạ',
    instruction: '20 giây thử sức; hết giờ không bị trừ điểm.',
    prompt: item.promptVi,
    answer: item.expectedEnglish,
    acceptableAnswers: [item.expectedEnglish],
    hint: item.hint,
    timeLimitSeconds: 20,
    sourceItemId: item.id,
    srsType: 'speed',
  };
}

function stepFromMistake(item: { id: string; mistake: string; correction: string; explanationVi: string }): InteractiveLessonStep {
  return {
    id: `repair-${item.id}`,
    type: 'fill_blank',
    title: 'Sửa lỗi để vượt màn',
    instruction: 'Viết lại câu cho đúng, rồi đọc lý do Poo giải thích.',
    prompt: `Câu sai: ${item.mistake}`,
    answer: item.correction,
    acceptableAnswers: [item.correction],
    hint: item.explanationVi,
    explanation: item.explanationVi,
    sourceItemId: item.id,
    srsType: 'typing',
  };
}

function stepFromFillBlank(item: FillBlankTask, countsForQuiz: boolean): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'fill_blank',
    title: 'Điền từ còn thiếu',
    instruction: 'Gõ từ hoặc cụm đúng vào ô trống.',
    prompt: item.prompt,
    answer: item.answer,
    hint: item.hint,
    explanation: item.hint,
    sourceItemId: item.id,
    srsType: 'typing',
    completionGroup: countsForQuiz ? 'quiz' : undefined,
    completionItemId: countsForQuiz ? item.id : undefined,
  };
}

function stepFromSentenceOrder(item: SentenceOrderingTask, countsForQuiz: boolean): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'sentence_order',
    title: 'Sắp xếp câu',
    instruction: 'Chạm các từ theo đúng thứ tự để tạo câu tiếng Anh.',
    prompt: item.vietnamese,
    answer: item.answer,
    words: shuffleTokensForQuestion(item.words, item.id),
    sourceItemId: item.id,
    srsType: 'quiz',
    completionGroup: countsForQuiz ? 'quiz' : undefined,
    completionItemId: countsForQuiz ? item.id : undefined,
  };
}

function stepFromListening(item: ListeningPracticeItem): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'listen_choose',
    title: 'Nghe và chọn',
    instruction: 'Bấm nghe, sau đó chọn câu bạn vừa nghe.',
    prompt: item.question,
    answer: item.answer,
    options: uniqueOptions([item.answer, ...item.options]),
    english: item.text,
    explanation: item.explanationVi,
    speechLang: item.speechSynthesis?.lang,
    speechRate: item.speechSynthesis?.rate,
    sourceItemId: item.id,
    srsType: 'listening',
    completionGroup: 'listening',
    completionItemId: item.id,
  };
}

function stepFromSpeaking(item: SpeakingReflexPrompt): InteractiveLessonStep {
  return {
    id: item.id,
    type: 'speak_repeat',
    title: 'Nói lại với Poo',
    instruction: 'Nghe mẫu, nói chậm một lần, rồi bấm “Mình đã nói xong”.',
    prompt: item.promptVi,
    answer: item.expectedEnglish,
    english: item.expectedEnglish,
    hint: item.hint,
    explanation: item.hint,
    sourceItemId: item.id,
    srsType: 'reflex',
    completionGroup: 'reflex',
    completionItemId: item.id,
  };
}

function buildInteractiveSteps(lesson: EnglishLesson): InteractiveLessonStep[] {
  const fallbackOptions = lesson.vocabulary.map((item) => item.meaningVi);
  const objectiveText = lesson.learningObjectives.slice(0, 3).join(' · ');
  const vocabularySteps = lesson.vocabulary.map(stepFromVocabulary);
  const seenFlashcards = new Set(lesson.vocabulary.map((item) => [item.term, item.meaningVi, item.example].map(normalizeAnswer).join('|')));
  const flashcardSteps = lesson.flashcards
    .filter((item) => !seenFlashcards.has([item.front, item.back, item.example].map(normalizeAnswer).join('|')))
    .map(stepFromFlashcard);
  const grammarSteps = lesson.grammarNotes.map((item: GrammarNote) => stepFromLessonTip(`grammar-${item.id}`, item.title, item.explanationVi, item.examples));
  const patternSteps = lesson.sentencePatterns.map((item: SentencePattern) => stepFromLessonTip(
    `pattern-${item.id}`,
    'Mẫu câu trọng tâm',
    `${item.pattern} — ${item.vietnameseExplanation}`,
    item.examples.map((example) => `${example.text} — ${example.meaningVi}`),
  ));
  const dialogueSteps = lesson.miniDialogues.flatMap(stepFromDialogue);
  const pronunciationSteps = lesson.pronunciationNotes.flatMap((item: PronunciationNote) => [
    stepFromLessonTip(`pronunciation-note-${item.id}`, 'Mẹo phát âm', item.noteVi),
    ...(item.examples || []).map((example, index) => ({
    id: `pronunciation-${item.id}-${index}`,
    type: 'speak_repeat' as const,
    title: 'Luyện âm cùng Poo',
    instruction: item.noteVi,
    prompt: item.noteVi,
    answer: example,
    english: example,
    hint: item.noteVi,
    sourceItemId: `${item.id}-${index}`,
    srsType: 'reflex' as const,
    })),
  ]);
  const quizSteps = lesson.quizQuestions.flatMap((item, index) => {
    if (item.type === 'match-meaning' && item.pairs?.length) {
      if (item.pairs.length === 1) return [stepFromSingleMatchPair({ id: `${item.id}-0`, ...item.pairs[0] }, item, index)];
      const pairs = item.pairs.map((pair, pairIndex) => ({ id: `${item.id}-${pairIndex}`, ...pair }));
      return [{ ...stepFromMatchPairs(pairs, `match-quiz-${item.id}-${index}`, [item.id, ...pairs.map((pair) => pair.id)], true), completionItemId: item.id }];
    }
    return [stepFromQuiz(item, index, fallbackOptions)];
  });
  const pairRounds: InteractiveLessonStep[] = [];
  for (let index = 0; index < (lesson.matchPairs || []).length; index += 4) {
    const pairs = (lesson.matchPairs || []).slice(index, index + 4);
    pairRounds.push(stepFromMatchPairs(pairs, `match-round-${lesson.id}-${Math.floor(index / 4) + 1}`, pairs.map((pair) => pair.id)));
  }
  const countSupplementalQuiz = lesson.quizQuestions.length < lesson.completionCriteria.totalQuizQuestions;
  const fillSteps = lesson.fillBlankTasks.map((item) => stepFromFillBlank(item, countSupplementalQuiz));
  const orderSteps = lesson.sentenceOrderingTasks.map((item) => stepFromSentenceOrder(item, countSupplementalQuiz));
  const listeningSteps = lesson.listeningPractice.map(stepFromListening);
  const speakingSteps = lesson.speakingReflexPrompts.map(stepFromSpeaking);
  const speedSteps = (lesson.englishSpeedPrompts || []).map(stepFromSpeedPrompt);
  const shadowingSteps = (lesson.shadowingScript?.lines || []).map((line, index) => ({
    id: `shadowing-${lesson.shadowingScript?.id || lesson.id}-${line.id || index}`,
    type: 'shadowing' as const,
    title: `Shadowing · ${lesson.shadowingScript?.title || 'Nói theo mẫu'}`,
    instruction: 'Nghe mẫu, ghi âm rồi đối chiếu. Phần nói không tính điểm trắc nghiệm.',
    prompt: line.meaningVi,
    answer: line.text,
    english: line.text,
    vietnamese: line.meaningVi,
    sourceItemId: line.id,
    srsType: 'reflex' as const,
  }));
  const mistakeSteps = (lesson.commonMistakes || []).map(stepFromMistake);
  const scenarioSteps = (lesson.realLifeSituations || []).map((situation: RealLifeSituation) => ({
    id: `scenario-${situation.id}`,
    type: 'free_response' as const,
    title: `Tình huống · ${situation.title}`,
    instruction: 'Chọn các cụm để ráp lời đáp, hoặc tự viết câu của bạn. Đây là thử thách mở, không chấm đúng sai.',
    prompt: situation.scenarioVi,
    targetOutputs: situation.usefulPhrases,
    phraseBank: situation.usefulPhrases,
    body: situation.usefulPhrases.join('\n'),
  }));
  const missionSteps = (lesson.gameMissions || []).map((mission: GameMission) => ({
    id: `mission-${mission.id}`,
    type: 'mission_tracker' as const,
    title: `Nhiệm vụ: ${mission.title}`,
    instruction: mission.instructionVi,
    prompt: mission.successCriteria,
    missionRequirement: mission.completion,
    body: mission.instructionVi,
  }));
  const coachSteps = (lesson.whaleCoachLines || []).map((line, index) => stepFromLessonTip(`coach-${lesson.id}-${index}`, 'Poo nhắc nhỏ', line));
  const finalSteps = lesson.finalMiniChallenge ? [{
    id: `final-${lesson.finalMiniChallenge.id}`,
    type: 'free_response' as const,
    title: lesson.finalMiniChallenge.title,
    instruction: lesson.finalMiniChallenge.instructionVi,
    prompt: lesson.finalMiniChallenge.instructionVi,
    targetOutputs: lesson.finalMiniChallenge.targetOutput,
    phraseBank: lesson.finalMiniChallenge.targetOutput,
    body: lesson.finalMiniChallenge.targetOutput.join('\n'),
  }] : [];

  const mixedExercises = [
    grammarSteps,
    patternSteps,
    vocabularySteps,
    flashcardSteps,
    quizSteps,
    pairRounds,
    fillSteps,
    orderSteps,
    dialogueSteps,
    listeningSteps,
    pronunciationSteps,
    speakingSteps,
    speedSteps,
    shadowingSteps,
    mistakeSteps,
    scenarioSteps,
  ].reduce<InteractiveLessonStep[]>((mixed, group) => {
    const maxLength = Math.max(mixed.length, group.length);
    const next: InteractiveLessonStep[] = [];
    for (let index = 0; index < maxLength; index += 1) {
      if (mixed[index]) next.push(mixed[index]);
      if (group[index]) next.push(group[index]);
    }
    return next;
  }, []);

  const practiceFlow = attachTeachingNotesToChallenges([
    ...coachSteps,
    ...mixedExercises,
    ...missionSteps,
    ...finalSteps,
  ]);
  const questFlow = selectCoreQuestSteps(practiceFlow);
  const coreQuestCount = questFlow.filter((step) => !step.optionalBonus).length;

  return [
    {
      id: 'intro',
      type: 'intro',
      title: 'Bắt đầu bài học tương tác',
      instruction: `Nhiệm vụ chính có ${coreQuestCount} thử thách. Hoàn thành để nhận XP; sau đó bạn có thể mở vòng thưởng với các câu còn lại.`,
      prompt: lesson.titleVi,
      explanation: objectiveText || lesson.subtitle,
    },
    ...questFlow,
    {
      id: 'summary',
      type: 'summary',
      title: 'Tổng kết cùng Poo',
      instruction: 'Xem XP, từ yếu và bước luyện tiếp theo.',
      prompt: lesson.finalMiniChallenge?.instructionVi ?? 'Bạn đã hoàn thành bài học. Hãy ôn lại từ yếu trong Khu luyện tập.',
      explanation: lesson.whaleCoachLines?.[0] ?? 'Đi chậm nhưng chắc. Mỗi bài nhỏ đều giúp phản xạ tiếng Anh tốt hơn.',
    },
  ].filter(Boolean) as InteractiveLessonStep[];
}

export function getInteractiveLessonByUnit(unitId: string, nodeId?: string): InteractiveLesson | null {
  const entry = getUnifiedLessonEntry(unitId);
  const sourceLesson = entry?.primaryLesson ?? entry?.lessons[0];
  if (!entry || !sourceLesson) return null;

  return {
    id: `${entry.unit.id}__${sourceLesson.id}`,
    unitId: entry.unit.id,
    nodeId,
    title: sourceLesson.titleVi || entry.unit.titleVi,
    subtitle: sourceLesson.subtitle || entry.unit.confidenceGoal,
    level: sourceLesson.level,
    duration: sourceLesson.estimatedTime,
    xp: 20,
    steps: buildInteractiveSteps(sourceLesson),
    sourceLesson,
  };
}

export function getInteractiveLessonByLessonId(lessonId: string): InteractiveLesson | null {
  const sourceLesson = getLessonById(lessonId);
  if (!sourceLesson) return null;

  return {
    id: sourceLesson.id,
    unitId: sourceLesson.unitId,
    title: sourceLesson.titleVi,
    subtitle: sourceLesson.subtitle,
    level: sourceLesson.level,
    duration: sourceLesson.estimatedTime,
    xp: 20,
    steps: buildInteractiveSteps(sourceLesson),
    sourceLesson,
  };
}

export function isInteractiveAnswerCorrect(step: InteractiveLessonStep, answer: string) {
  if (step.type === 'flashcard') return answer === 'remembered';
  if (step.type === 'match_pairs') return answer === 'completed';
  if (step.type === 'intro' || step.type === 'summary' || step.type === 'lesson_tip' || step.type === 'speak_repeat' || step.type === 'shadowing' || step.type === 'free_response' || step.type === 'mission_tracker') return true;
  const accepted = step.acceptableAnswers?.length ? step.acceptableAnswers : [step.answer ?? ''];
  return accepted.some((candidate) => normalizeAnswer(answer) === normalizeAnswer(candidate));
}

export function startInteractiveLesson(lesson: InteractiveLesson) {
  const progress = markLessonStarted(lesson.sourceLesson.id, lesson.unitId, INTERACTIVE_LESSON_FLOW_VERSION);
  upsertLearningLoopWords(lesson.sourceLesson.vocabulary.map((item) => ({
    id: `lesson:${lesson.sourceLesson.id}:word:${item.id}`,
    term: item.term,
    meaningVi: item.meaningVi,
    example: item.example,
    source: 'interactive-lesson',
    sourceId: lesson.sourceLesson.id,
    cefrLevel: item.cefrLevel,
    topic: item.visualCategory || lesson.sourceLesson.unitTitle,
  })));
  return progress?.reviewSessionId ?? '';
}

function getMistakeType(step: InteractiveLessonStep) {
  if (step.type === 'flashcard') return 'word-missed';
  if (step.type === 'multiple_choice') return 'multiple-choice';
  if (step.type === 'fill_blank' || step.type === 'speed_recall') return 'fill-blank';
  if (step.type === 'sentence_order') return 'sentence-order';
  if (step.type === 'listen_choose') return 'listen-and-choose';
  if (step.type === 'match_pairs') return 'multiple-choice';
  return 'speaking-repeat';
}

export function recordInteractiveStep(lesson: InteractiveLesson, step: InteractiveLessonStep, correct: boolean, answer = '', firstAttempt = true, reviewSessionId?: string) {
  const isScored = step.type !== 'intro' && step.type !== 'summary' && step.type !== 'lesson_tip' && step.type !== 'speak_repeat' && step.type !== 'shadowing' && step.type !== 'free_response' && step.type !== 'mission_tracker' && step.type !== 'flashcard';
  markLessonStepCompleted(lesson.sourceLesson.id, step.id, firstAttempt && !step.reviewOfStepId && (isScored || step.type === 'flashcard') ? correct : undefined);
  if (firstAttempt && step.type !== 'intro' && step.type !== 'summary') {
    recordLearningLoopActivity('interactive-lesson', lesson.sourceLesson.id, 0);
  }
  if (step.type === 'intro' || step.type === 'summary' || step.type === 'lesson_tip' || step.type === 'speak_repeat' || step.type === 'shadowing' || step.type === 'free_response' || step.type === 'mission_tracker') return;
  if (step.sourceItemId && step.srsType) {
    markItemReviewed(
      lesson.sourceLesson.id,
      step.sourceItemId,
      step.srsType,
      correct ? 'correct' : 'wrong',
      lesson.sourceLesson.reviewPolicy.wrongAnswerDelayMinutes,
      reviewSessionId,
      firstAttempt && !step.reviewOfStepId,
    );
  }
  if (!correct && step.vocabularyId) {
    saveWordReviewStatus(step.vocabularyId, 'difficult');
  }
  const mistakeId = `interactive:${lesson.sourceLesson.id}:${step.reviewOfStepId ?? step.id}`;
  if (correct) {
    resolveLearningLoopMistake(mistakeId);
  } else {
    recordLearningLoopMistake({
      id: mistakeId,
      source: 'interactive-lesson',
      sourceId: lesson.sourceLesson.id,
      type: getMistakeType(step),
      prompt: step.prompt || step.instruction,
      correctAnswer: step.answer || step.english,
      userAnswer: answer,
      explanation: step.explanation,
      tags: [lesson.unitId, step.type],
    });
  }
}

export function completeInteractiveLesson(lesson: InteractiveLesson, correctCount: number, totalAnswered: number, weakItems: InteractiveLessonStep[]): InteractiveLessonResult {
  const isFirstCompletion = getLessonProgress()[lesson.sourceLesson.id]?.status !== 'completed';
  markLessonCompleted(lesson.sourceLesson.id, lesson.unitId);
  const earnedXp = isFirstCompletion ? lesson.xp + Math.max(0, correctCount * 2) : 0;
  if (earnedXp > 0) recordLearningLoopActivity('interactive-lesson', lesson.sourceLesson.id, earnedXp);
  weakItems.forEach((step) => {
    if (step.vocabularyId) saveWordReviewStatus(step.vocabularyId, 'difficult');
  });

  return {
    lessonId: lesson.sourceLesson.id,
    unitId: lesson.unitId,
    xp: earnedXp,
    correctCount,
    totalAnswered,
    weakItems,
  };
}
