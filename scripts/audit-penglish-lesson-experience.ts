import fs from 'node:fs';
import path from 'node:path';
import { allPEnglishLessons, type EnglishLesson } from '../apps/web/src/lib/p-english/lesson-content-data.ts';
import { getInteractiveLessonByLessonId } from '../apps/web/src/lib/p-english/interactiveLessonEngine.ts';
import { generatedReadingLessonSources } from '../apps/web/src/data/reading/generatedReadingLessons.ts';

type LessonKind = 'communication' | 'grammar' | 'reading';

type LessonExperienceRecord = {
  id: string;
  titleVi: string;
  level: string;
  kind: LessonKind;
  firstStep: string;
  estimatedTime: string;
  objectiveCount: number;
  vocabularyCount: number;
  listeningCount: number;
  speakingCount: number;
  quizCount: number;
  passageWordCount?: number;
  issues: string[];
};

function lessonKind(lesson: EnglishLesson): LessonKind {
  if (lesson.id.startsWith('reading-')) return 'reading';
  if (lesson.id.startsWith('grammar-')) return 'grammar';
  return 'communication';
}

function normalized(text: string | undefined) {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

function readingPassage(lesson: EnglishLesson) {
  return normalized(lesson.grammarNotes.find((note) => note.title === 'Đoạn đọc chính')?.examples.join(' '));
}

function expectedWrongAnswerAction(lesson: EnglishLesson): EnglishLesson['reviewPolicy']['wrongAnswerAction'] {
  const rule = normalized(lesson.reviewRules.ifWrong).toLowerCase();
  if (rule.includes('đoạn đọc')) return 'show-reading-evidence';
  if (rule.includes('giải thích')) return 'show-explanation-and-retry';
  if (rule.includes('tốc độ chậm')) return 'replay-slow-with-transcript';
  if (rule.includes('ưu tiên hiện lại') || rule.includes('ưu tiên hiển thị lại') || rule.includes('hiện lại câu có')) return 'repeat-context-phrases';
  return 'same-session-recall';
}

function expectedPriorityStrategy(lesson: EnglishLesson): EnglishLesson['reviewPolicy']['priorityStrategy'] {
  const rule = normalized(lesson.reviewRules.priorityRule).toLowerCase();
  if (rule.includes('đoạn có lỗi sai gần nhất')) return 'recent-mistakes-and-weak-keywords';
  if (rule.includes('mẫu có lỗi sai gần nhất')) return 'recent-mistakes-first';
  if (rule.includes('cụm trước từ đơn')) return 'phrases-before-single-words';
  return 'target-phrases-before-details';
}

function inspectLesson(lesson: EnglishLesson): LessonExperienceRecord {
  const kind = lessonKind(lesson);
  const issues: string[] = [];
  const passage = kind === 'reading' ? readingPassage(lesson) : '';
  const corePattern = lesson.sentencePatterns[0];
  const reviewMode = kind === 'reading' ? 'reading-evidence' : kind === 'grammar' ? 'grammar-pattern' : 'real-life-context';

  if (!Number.isInteger(lesson.reviewPolicy.inLessonRetryLimit) || lesson.reviewPolicy.inLessonRetryLimit < 0 || lesson.reviewPolicy.inLessonRetryLimit > 10) {
    issues.push('Giới hạn câu ôn trong bài phải là số nguyên từ 0 đến 10.');
  }
  if (!Number.isInteger(lesson.reviewPolicy.wrongAnswerDelayMinutes) || lesson.reviewPolicy.wrongAnswerDelayMinutes < 1 || lesson.reviewPolicy.wrongAnswerDelayMinutes > 1440) {
    issues.push('Thời gian ôn lại sau câu sai phải nằm trong khoảng 1–1440 phút.');
  }
  if (lesson.reviewPolicy.wrongAnswerDelayMinutes !== lesson.reviewRules.newWordReviewAfterMinutes) {
    issues.push('Thời gian ôn có cấu trúc không khớp với reviewRules.newWordReviewAfterMinutes.');
  }
  if (!Number.isInteger(lesson.reviewPolicy.familiarAfterCorrectSessions) || lesson.reviewPolicy.familiarAfterCorrectSessions < 1) {
    issues.push('Ngưỡng đánh dấu quen cần là số phiên đúng nguyên dương.');
  }
  if (!Number.isInteger(lesson.reviewPolicy.masteredAfterCorrectSessions) || lesson.reviewPolicy.masteredAfterCorrectSessions <= lesson.reviewPolicy.familiarAfterCorrectSessions) {
    issues.push('Ngưỡng đã vững cần lớn hơn ngưỡng quen.');
  }
  if (lesson.reviewPolicy.retryPromptMode !== reviewMode) {
    issues.push(`Kiểu hướng dẫn ôn phải là ${reviewMode} cho nhóm bài ${kind}.`);
  }
  if (lesson.reviewPolicy.wrongAnswerAction !== expectedWrongAnswerAction(lesson)) {
    issues.push('Hành vi khi sai chưa khớp với hướng dẫn ifWrong của bài.');
  }
  if (lesson.reviewPolicy.priorityStrategy !== expectedPriorityStrategy(lesson)) {
    issues.push('Chiến lược ưu tiên ôn chưa khớp với priorityRule của bài.');
  }

  if (kind === 'reading') {
    if (!passage) issues.push('Bài đọc thiếu passage cho bước Đọc lượt 1.');
    if (passage.split(/\s+/).filter(Boolean).length < 12) issues.push('Passage quá ngắn để tạo một lượt đọc có ý nghĩa.');
    if (!corePattern?.pattern) issues.push('Bài đọc thiếu câu/mẫu trọng tâm để nối sang bước luyện.');
    if (lesson.quizQuestions.length < 1) issues.push('Bài đọc thiếu câu kiểm tra hiểu.');
  }

  if (kind === 'grammar') {
    if (!corePattern?.pattern) issues.push('Bài ngữ pháp thiếu mẫu trọng tâm.');
    if ((corePattern?.examples.length ?? 0) < 2) issues.push('Bài ngữ pháp cần ít nhất hai ví dụ ở bước Nhìn mẫu.');
    if (lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length + lesson.quizQuestions.length < 2) {
      issues.push('Bài ngữ pháp thiếu câu luyện có kiểm tra.');
    }
  }

  if (kind === 'communication' && lesson.listeningPractice.length < 1) {
    issues.push('Bài giao tiếp thiếu câu nghe cho bước đầu.');
  }

  if (lesson.learningObjectives.length < 3) issues.push('Mục tiêu học chưa đủ cụ thể.');
  if (lesson.vocabulary.length < 3) issues.push('Thiếu cụm/từ để hỗ trợ bước hiểu.');
  if (lesson.speakingReflexPrompts.length < 1) issues.push('Thiếu đầu ra nói để khép vòng học.');

  return {
    id: lesson.id,
    titleVi: lesson.titleVi,
    level: lesson.level,
    kind,
    firstStep: kind === 'reading' ? 'Đọc lượt 1' : kind === 'grammar' ? 'Nhìn mẫu' : 'Nghe',
    estimatedTime: lesson.estimatedTime,
    objectiveCount: lesson.learningObjectives.length,
    vocabularyCount: lesson.vocabulary.length,
    listeningCount: lesson.listeningPractice.length,
    speakingCount: lesson.speakingReflexPrompts.length,
    quizCount: lesson.quizQuestions.length + lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length,
    passageWordCount: passage ? passage.split(/\s+/).filter(Boolean).length : undefined,
    issues,
  };
}

const lessons = allPEnglishLessons.map(inspectLesson);
const runtimeFlows = allPEnglishLessons.map((lesson) => ({ lesson, flow: getInteractiveLessonByLessonId(lesson.id) }));
const expectedTeachingTipCount = allPEnglishLessons.reduce(
  (count, lesson) => count + lesson.grammarNotes.length + lesson.sentencePatterns.length + (lesson.pronunciationNotes?.length ?? 0) + (lesson.whaleCoachLines?.length ?? 0),
  0,
);
const attachedTeachingTipCount = runtimeFlows.reduce(
  (count, { flow }) => count + (flow?.steps.reduce((stepCount, step) => stepCount + (step.learningTips?.length ?? 0), 0) ?? 0),
  0,
);
const standaloneTeachingTipCount = runtimeFlows.reduce(
  (count, { flow }) => count + (flow?.steps.filter((step) => step.type === 'lesson_tip').length ?? 0),
  0,
);
const runtimeFlowIssues = runtimeFlows.flatMap(({ lesson, flow }) => {
  if (!flow) return [{ lessonId: lesson.id, issue: 'Không tạo được luồng bài học tương tác.' }];
  const coreSteps = flow.steps.filter((step) => !step.optionalBonus && step.type !== 'intro' && step.type !== 'summary' && step.type !== 'lesson_tip');
  const coreQuestIssues = coreSteps.length >= 4 && coreSteps.length <= 6
    && coreSteps.some((step) => step.type === 'listen_choose')
    && coreSteps.some((step) => ['multiple_choice', 'fill_blank', 'sentence_order', 'match_pairs', 'speed_recall'].includes(step.type))
    && coreSteps.some((step) => step.type === 'shadowing' || step.type === 'speak_repeat')
    ? []
    : [{ lessonId: lesson.id, issue: `Nhiệm vụ chính cần 4–6 thử thách gồm nghe, câu có đáp án và một lượt nói; hiện có ${coreSteps.length}.` }];
  const dialogueAudioIssues = lesson.miniDialogues.flatMap((dialogue) => dialogue.lines.flatMap((line, lineIndex) => {
    const previous = dialogue.lines[lineIndex - 1];
    if (!previous) return [];
    const dialogueStep = flow.steps.find((step) => step.id === `dialogue-${dialogue.id}-${lineIndex}`);
    return dialogueStep?.english !== previous.text
      ? [{ lessonId: lesson.id, issue: `Âm thanh hội thoại ${dialogue.id} · lượt ${lineIndex + 1} không phát lời thoại trước để gợi ngữ cảnh.` }]
      : [];
  }));
  const expectedPairs = lesson.matchPairs ?? [];
  const runtimePairSteps = flow.steps.filter((step) => step.type === 'match_pairs');
  const sourcePairSteps = runtimePairSteps.filter((step) => step.id.startsWith('match-round-'));
  const runtimePairs = sourcePairSteps.flatMap((step) => step.matchPairs ?? []);
  const runtimePairMap = new Map(runtimePairs.map((pair) => [pair.id, pair]));
  const matchPairIssues = expectedPairs.length === runtimePairs.length
    && expectedPairs.every((pair) => {
      const runtimePair = runtimePairMap.get(pair.id);
      return runtimePair?.left === pair.left && runtimePair?.right === pair.right;
    })
    && sourcePairSteps.every((step) => (step.matchPairs?.length ?? 0) > 0 && (step.matchPairs?.length ?? 0) <= 4)
    ? []
    : [{ lessonId: lesson.id, issue: `Ghép cặp trong luồng phải giữ đủ ${expectedPairs.length} cặp và chia thành các vòng tối đa bốn cặp.` }];
  const speedPrompts = lesson.englishSpeedPrompts ?? [];
  const speedSteps = flow.steps.filter((step) => step.type === 'speed_recall' && step.srsType === 'speed');
  const speedPromptMap = new Map(speedSteps.map((step) => [step.sourceItemId, step]));
  const speedIssues = speedSteps.length === speedPrompts.length
    && speedPrompts.every((prompt) => {
      const step = speedPromptMap.get(prompt.id);
      return step?.prompt === prompt.promptVi
        && step.answer === prompt.expectedEnglish
        && step.timeLimitSeconds === 20;
    })
    ? []
    : [{ lessonId: lesson.id, issue: `Vòng phản xạ cần giữ đủ ${speedPrompts.length} câu nguồn, đáp án và giới hạn 20 giây.` }];
  const shadowingLines = lesson.shadowingScript?.lines ?? [];
  const shadowingSteps = flow.steps.filter((step) => step.type === 'shadowing' && step.id.startsWith(`shadowing-${lesson.shadowingScript?.id || lesson.id}-`));
  const shadowingBySourceId = new Map(shadowingSteps.map((step) => [step.sourceItemId, step]));
  const shadowingIssues = shadowingSteps.length === shadowingLines.length
    && shadowingLines.every((line) => {
      const step = shadowingBySourceId.get(line.id);
      return step?.answer === line.text && step.vietnamese === line.meaningVi && step.srsType === 'reflex';
    })
    ? []
    : [{ lessonId: lesson.id, issue: `Shadowing cần giữ đủ ${shadowingLines.length} câu nguồn và ánh xạ đúng câu gốc/nghĩa.` }];
  const quizMatchIssues = lesson.quizQuestions.flatMap((question) => {
    if (question.type !== 'match-meaning' || !question.pairs?.length) return [];
    if (question.pairs.length === 1) {
      const pairStep = flow.steps.find((step) => step.completionItemId === question.id);
      return pairStep?.type === 'multiple_choice'
        && pairStep.sourceItemId === `${question.id}-0`
        && pairStep.answer === question.pairs[0].right
        && pairStep.options?.includes(pairStep.answer)
        ? []
        : [{ lessonId: lesson.id, issue: `Câu ghép nghĩa ${question.id} chỉ có một cặp, nên cần một câu chọn nghĩa có các đáp án nhiễu.` }];
    }
    const round = runtimePairSteps.find((step) => step.completionItemId === question.id);
    const pairs = round?.matchPairs ?? [];
    return pairs.length === question.pairs.length && pairs.every((pair, index) =>
      pair.id === `${question.id}-${index}`
      && pair.left === question.pairs?.[index].left
      && pair.right === question.pairs?.[index].right,
    ) ? [] : [{ lessonId: lesson.id, issue: `Câu ghép nghĩa ${question.id} phải giữ đủ cặp và thành một vòng tương tác.` }];
  });
  const expected = lesson.grammarNotes.length + lesson.sentencePatterns.length + (lesson.pronunciationNotes?.length ?? 0) + (lesson.whaleCoachLines?.length ?? 0);
  const attached = flow.steps.reduce((count, step) => count + (step.learningTips?.length ?? 0), 0);
  const standalone = flow.steps.filter((step) => step.type === 'lesson_tip').length;
  const teachingIssue = attached === expected && standalone === 0
    ? []
    : [{ lessonId: lesson.id, issue: `Mẹo hướng dẫn: ${attached}/${expected} được gắn vào thử thách, ${standalone} thẻ đứng riêng.` }];
  return [...coreQuestIssues, ...teachingIssue, ...dialogueAudioIssues, ...matchPairIssues, ...speedIssues, ...shadowingIssues, ...quizMatchIssues];
});
const readingFocusQuestionIssues = generatedReadingLessonSources.flatMap((source) => {
  const focus = source.sentenceFocus.examples[0];
  const question = source.comprehensionQuestions[2];
  const valid = Boolean(
    focus?.text
    && focus.meaningVi
    && question
    && question.answer === focus.text
    && question.questionEn.includes(focus.meaningVi)
    && question.options.length === 4
    && new Set(question.options).size === 4
    && question.options.includes(question.answer),
  );
  return valid ? [] : [{ lessonId: source.id, issue: 'Câu đọc hiểu thứ ba phải gắn với nghĩa câu trọng tâm, có bốn lựa chọn riêng biệt và giữ đáp án đúng.' }];
});
const applicationSteps = runtimeFlows.flatMap(({ lesson, flow }) => (flow?.steps ?? []).map((step) => ({ lesson, flow, step })));
const applicationMechanicIssues = applicationSteps.flatMap(({ lesson, flow, step }) => {
  if (step.id.startsWith('scenario-')) {
    return step.type === 'free_response'
      && step.phraseBank?.length
      && JSON.stringify(step.phraseBank) === JSON.stringify(step.targetOutputs)
      ? []
      : [{ lessonId: lesson.id, issue: `Tình huống đời thực ${step.id} phải có thẻ cụm từ đúng theo câu gợi ý nguồn và vẫn để mở phần tự luận.` }];
  }
  if (step.id.startsWith('mission-')) {
    const mission = lesson.gameMissions?.find((item) => `mission-${item.id}` === step.id);
    const requirement = mission?.completion;
    const targets = requirement?.sourceItemIds.map((sourceId) => flow?.steps.find((candidate) => candidate.id === sourceId || candidate.sourceItemId === sourceId));
    const validTargets = Boolean(targets?.length) && targets?.every((target) => Boolean(target));
    const validType = requirement?.kind === 'correct'
      ? targets?.every((target) => target && ['multiple_choice', 'fill_blank', 'sentence_order', 'listen_choose'].includes(target.type))
      : requirement?.kind === 'complete'
        ? targets?.every((target) => target && ['listen_choose', 'speak_repeat', 'shadowing'].includes(target.type))
        : false;
    const requirementValid = Boolean(requirement && requirement.minimum > 0 && requirement.minimum <= requirement.sourceItemIds.length);
    return step.type === 'mission_tracker' && step.optionalBonus && validTargets && validType && requirementValid
      ? []
      : [{ lessonId: lesson.id, issue: `Mission ${step.id} cần luật hoàn thành có cấu trúc, ngưỡng hợp lệ và ID hoạt động nguồn cùng loại.` }];
  }
  if (step.id.startsWith('final-')) {
    return step.type === 'free_response'
      && Boolean(step.phraseBank?.length)
      && JSON.stringify(step.phraseBank) === JSON.stringify(step.targetOutputs)
      ? []
      : [{ lessonId: lesson.id, issue: `Thử thách cuối ${step.id} cần giữ các câu mẫu nguồn thành thẻ ráp câu và phần tự viết không chấm điểm.` }];
  }
  return [];
});
const applicationMechanicCounts = {
  realLifeSituation: applicationSteps.filter(({ step }) => step.id.startsWith('scenario-')).length,
  realLifePhraseBuilders: applicationSteps.filter(({ step }) => step.id.startsWith('scenario-') && Boolean(step.phraseBank?.length)).length,
  gameMission: applicationSteps.filter(({ step }) => step.id.startsWith('mission-')).length,
  configuredGameMission: applicationSteps.filter(({ step }) => step.id.startsWith('mission-') && Boolean(step.missionRequirement)).length,
  correctThresholdMission: applicationSteps.filter(({ step }) => step.id.startsWith('mission-') && step.missionRequirement?.kind === 'correct').length,
  participationMission: applicationSteps.filter(({ step }) => step.id.startsWith('mission-') && step.missionRequirement?.kind === 'complete').length,
  finalChallenge: applicationSteps.filter(({ step }) => step.id.startsWith('final-')).length,
  finalPhraseBuilders: applicationSteps.filter(({ step }) => step.id.startsWith('final-') && Boolean(step.phraseBank?.length)).length,
};
const issues = [
  ...lessons.flatMap((lesson) => lesson.issues.map((issue) => ({ lessonId: lesson.id, issue }))),
  ...runtimeFlowIssues,
  ...readingFocusQuestionIssues,
  ...applicationMechanicIssues,
];
const countsByKind = lessons.reduce<Record<LessonKind, number>>(
  (counts, lesson) => ({ ...counts, [lesson.kind]: counts[lesson.kind] + 1 }),
  { communication: 0, grammar: 0, reading: 0 },
);
const firstStepCounts = lessons.reduce<Record<string, number>>((counts, lesson) => {
  counts[lesson.firstStep] = (counts[lesson.firstStep] ?? 0) + 1;
  return counts;
}, {});
const objectiveSignatures = allPEnglishLessons.reduce<Map<string, string[]>>((groups, lesson) => {
  const signature = lesson.learningObjectives.map(normalized).join(' | ');
  const group = groups.get(signature) ?? [];
  group.push(lesson.id);
  groups.set(signature, group);
  return groups;
}, new Map());
const reusedObjectiveGroups = [...objectiveSignatures.values()].filter((ids) => ids.length > 1);

const summary = {
  lessonCount: lessons.length,
  runtimeStepCount: runtimeFlows.reduce((count, { flow }) => count + (flow?.steps.length ?? 0), 0),
  coreQuestStepCount: runtimeFlows.reduce((count, { flow }) => count + (flow?.steps.filter((step) => !step.optionalBonus && step.type !== 'intro' && step.type !== 'summary' && step.type !== 'lesson_tip').length ?? 0), 0),
  optionalBonusStepCount: runtimeFlows.reduce((count, { flow }) => count + (flow?.steps.filter((step) => step.optionalBonus).length ?? 0), 0),
  applicationMechanicCounts,
  expectedTeachingTipCount,
  attachedTeachingTipCount,
  standaloneTeachingTipCount,
  countsByKind,
  firstStepCounts,
  lessonsWithIssues: new Set(issues.map((issue) => issue.lessonId)).size,
  issueCount: issues.length,
  reusedObjectiveGroupCount: reusedObjectiveGroups.length,
  largestReusedObjectiveGroup: Math.max(0, ...reusedObjectiveGroups.map((group) => group.length)),
};

const report = { summary, issues, reusedObjectiveGroups, lessons };
const reportDir = path.resolve('reports');
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'penglish-lesson-experience-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(reportDir, 'penglish-lesson-experience-audit.md'),
  [
    '# P-English Lesson Experience Audit',
    '',
    `- Lessons: ${summary.lessonCount}`,
    `- Runtime steps: ${summary.runtimeStepCount}`,
    `- Application steps: ${applicationMechanicCounts.realLifeSituation} real-life situations (${applicationMechanicCounts.realLifePhraseBuilders} phrase builders), ${applicationMechanicCounts.gameMission} game missions (${applicationMechanicCounts.correctThresholdMission} score-threshold, ${applicationMechanicCounts.participationMission} practice-completion), ${applicationMechanicCounts.finalChallenge} final challenges (${applicationMechanicCounts.finalPhraseBuilders} phrase builders)`,
    `- Teaching tips attached to challenges: ${summary.attachedTeachingTipCount}/${summary.expectedTeachingTipCount}`,
    `- Standalone teaching-tip screens: ${summary.standaloneTeachingTipCount}`,
    `- Communication flow (Nghe first): ${countsByKind.communication}`,
    `- Grammar flow (Nhìn mẫu first): ${countsByKind.grammar}`,
    `- Reading flow (Đọc lượt 1 first): ${countsByKind.reading}`,
    `- Lessons with experience issues: ${summary.lessonsWithIssues}`,
    `- Reused objective groups: ${summary.reusedObjectiveGroupCount}`,
    `- Largest reused objective group: ${summary.largestReusedObjectiveGroup}`,
    '',
    '## Issues',
    '',
    ...(issues.length ? issues.map((issue) => `- ${issue.lessonId}: ${issue.issue}`) : ['None.']),
    '',
  ].join('\n'),
);

console.log(JSON.stringify(summary, null, 2));
if (issues.length > 0) process.exitCode = 1;
