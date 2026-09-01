import { foundation48Days } from '../apps/web/src/features/foundation48/foundation48Data';
import { getFoundation48DeepLesson } from '../apps/web/src/features/foundation48/foundation48DeepLessonResolver';
import { getFoundation48PrimaryLesson } from '../apps/web/src/features/foundation48/foundation48PrimaryPath';
import { shadowingVideos } from '../apps/web/src/lib/p-english/shadowing-data';
import { generatedUnifiedLearningPath } from '../apps/web/src/data/learning/generatedUnifiedLearningPath';

type QaChallenge = {
  id: string;
  type: 'multiple-choice' | 'listen-and-choose' | 'fill-blank' | 'sentence-order' | 'speaking-repeat';
  answer: string;
};

function primaryChallenges(dayNumber: number): QaChallenge[] | null {
  const lesson = getFoundation48PrimaryLesson(dayNumber);
  if (!lesson) return null;

  return lesson.quiz.slice(0, 4).map((item, index) => ({
    id: `day-${dayNumber}-poo-quiz-${index}`,
    type: item.type === 'short-answer' ? 'speaking-repeat' : item.type,
    answer: Array.isArray(item.correctAnswer) ? item.correctAnswer[0] : item.correctAnswer,
  }));
}

async function main() {
  const foundationDays = [];

  for (const day of foundation48Days) {
    const primary = primaryChallenges(day.dayNumber);
    const deepLesson = await getFoundation48DeepLesson(day.dayNumber);
    const deepChallenges: QaChallenge[] = deepLesson?.readiness === 'complete' ? [
      ...deepLesson.listening.map((item) => ({ id: item.id, type: 'listen-and-choose' as const, answer: item.answer })),
      ...deepLesson.speaking.map((item) => ({ id: item.id, type: 'speaking-repeat' as const, answer: item.text })),
      ...deepLesson.quiz.map((item) => ({ id: item.id, type: item.type, answer: item.answer })),
    ] : [];

    foundationDays.push({
      dayNumber: day.dayNumber,
      challenges: primary ?? deepChallenges,
    });
  }

  process.stdout.write(JSON.stringify({
    foundationDays,
    shadowingLessons: shadowingVideos.map((video) => ({
      id: video.id,
      sentenceCount: video.transcript.length,
    })),
    learningPathUnits: generatedUnifiedLearningPath.map((unit) => ({
      id: unit.id,
      lessonCount: unit.lessonIds.length,
    })),
  }));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
