import fs from 'node:fs';
import path from 'node:path';
import { allPEnglishLessons, type EnglishLesson } from '../apps/web/src/lib/p-english/lesson-content-data.ts';

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
  return normalized(lesson.grammarNotes.find((note) => note.title === 'Đoạn đọc chính')?.examples[0]);
}

function inspectLesson(lesson: EnglishLesson): LessonExperienceRecord {
  const kind = lessonKind(lesson);
  const issues: string[] = [];
  const passage = kind === 'reading' ? readingPassage(lesson) : '';
  const corePattern = lesson.sentencePatterns[0];

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
const issues = lessons.flatMap((lesson) => lesson.issues.map((issue) => ({ lessonId: lesson.id, issue })));
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
