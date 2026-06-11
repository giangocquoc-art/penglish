import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  Progress,
  SimpleGrid,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OceanMascot } from '../p-english/OceanMascot';
import { loseHeart } from '../../lib/p-english/learning-hearts';
import { markItemReviewed } from '../../lib/p-english/lesson-progress';
import { recordPracticeSessionMemory } from '../../lib/p-english/localSkillMemory';
import { getPracticeSessionFeedback } from '../../lib/p-english/practiceSessionFeedback';
import { PracticeSessionFeedbackCard } from './PracticeSessionFeedbackCard';
import type { WhaleMood } from '../streak/AdaptiveWhaleStreak';
import type {
  EnglishLesson,
  FillBlankTask,
  QuizQuestion,
  SentenceOrderingTask,
} from '../../lib/p-english/lesson-content-data';
import {
  buildSentenceOrderQuestion,
  validateSentenceOrderAnswer,
} from '../../lib/p-english/practice-randomization';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#E2E8F0',
};

type CombinedQuizQuestion = {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'sentence-order' | 'match-meaning';
  source: 'quizQuestions' | 'sentenceOrderingTasks' | 'fillBlankTasks';
  question?: string;
  prompt?: string;
  vietnamese?: string;
  words?: string[];
  pairs?: Array<{ left: string; right: string }>;
  options?: string[];
  answer: string | string[];
  explanationVi?: string;
  hint?: string;
};

type AnswerState = {
  selectedOption?: string;
  fillValue?: string;
  orderedWords?: string[];
  orderedTokenIds?: string[];
  sentenceOrderAttempt?: number;
  matchRight?: string;
  checked?: boolean;
  isCorrect?: boolean;
  warning?: string;
  heartLossText?: string;
};

type QuizProgress = {
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastPercentage: number;
  wrongQuestionIds: string[];
  lastCompletedAt: string;
};

type LessonProgress = {
  lessonId: string;
  flashcard?: unknown;
  quiz?: QuizProgress;
  [key: string]: unknown;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

function progressKey(lessonId: string) {
  return `PooEnglish:lesson-progress:${lessonId}`;
}

function safeReadProgress(lessonId: string): LessonProgress {
  if (typeof window === 'undefined') return { lessonId };
  try {
    const raw = window.localStorage.getItem(progressKey(lessonId));
    if (!raw) return { lessonId };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { lessonId };
    return { ...(parsed as LessonProgress), lessonId };
  } catch {
    return { lessonId };
  }
}

function safeWriteProgress(lessonId: string, updater: (current: LessonProgress) => LessonProgress) {
  if (typeof window === 'undefined') return;
  try {
    const current = safeReadProgress(lessonId);
    const next = updater(current);
    window.localStorage.setItem(progressKey(lessonId), JSON.stringify(next));
  } catch {
    // localStorage may be unavailable; quiz still works in memory.
  }
}

function normalizeAnswer(value: string, options: { stripTrailingPunctuation?: boolean } = {}) {
  let normalized = value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

  if (options.stripTrailingPunctuation) {
    normalized = normalized.replace(/[.!?。！？]+$/g, '').trim();
  }

  return normalized;
}

function answerToText(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join(' / ') : answer;
}

function questionLabel(question: CombinedQuizQuestion) {
  return question.question ?? question.prompt ?? question.vietnamese ?? 'Câu thử sức nhẹ';
}

function questionSourceLabel(source: CombinedQuizQuestion['source']) {
  if (source === 'quizQuestions') return 'Câu Poo xem cùng bạn';
  if (source === 'sentenceOrderingTasks') return 'Sắp xếp câu';
  return 'Điền chỗ trống';
}

function questionTypeLabel(type: CombinedQuizQuestion['type']) {
  if (type === 'multiple-choice') return 'Chọn đáp án';
  if (type === 'fill-blank') return 'Điền từ';
  if (type === 'sentence-order') return 'Sắp xếp câu';
  return 'Ghép nghĩa';
}

function userAnswerToText(question: CombinedQuizQuestion, state: AnswerState) {
  if (question.type === 'multiple-choice') return state.selectedOption ?? 'Chưa trả lời';
  if (question.type === 'fill-blank') return state.fillValue?.trim() || 'Chưa trả lời';
  if (question.type === 'sentence-order') return state.orderedWords?.join(' ') || 'Chưa trả lời';
  if (question.type === 'match-meaning') {
    const left = question.pairs?.[0]?.left;
    return left && state.matchRight ? `${left} = ${state.matchRight}` : state.matchRight ?? 'Chưa trả lời';
  }
  return 'Chưa trả lời';
}

function checkAnswer(question: CombinedQuizQuestion, state: AnswerState) {
  if (question.type === 'multiple-choice') {
    return normalizeAnswer(state.selectedOption ?? '') === normalizeAnswer(answerToText(question.answer));
  }

  if (question.type === 'fill-blank') {
    return normalizeAnswer(state.fillValue ?? '') === normalizeAnswer(answerToText(question.answer));
  }

  if (question.type === 'sentence-order') {
    return validateSentenceOrderAnswer(state.orderedWords ?? [], answerToText(question.answer));
  }

  if (question.type === 'match-meaning') {
    const left = question.pairs?.[0]?.left;
    const selected = state.matchRight;
    if (!left || !selected) return false;
    const pairAnswer = `${left} = ${selected}`;
    const expected = Array.isArray(question.answer) ? question.answer : [question.answer];
    return expected.some((item) => normalizeAnswer(item) === normalizeAnswer(pairAnswer));
  }

  return false;
}

function hasAnswer(question: CombinedQuizQuestion, state: AnswerState) {
  if (question.type === 'multiple-choice') return Boolean(state.selectedOption);
  if (question.type === 'fill-blank') return Boolean(state.fillValue?.trim());
  if (question.type === 'sentence-order') return Boolean(state.orderedWords?.length);
  if (question.type === 'match-meaning') return Boolean(state.matchRight);
  return false;
}

function buildQuestionSet(lesson: EnglishLesson): CombinedQuizQuestion[] {
  const quizQuestions = lesson.quizQuestions.map((question: QuizQuestion): CombinedQuizQuestion => ({
    ...question,
    source: 'quizQuestions',
  }));

  const sentenceTasks = lesson.sentenceOrderingTasks.map((task: SentenceOrderingTask): CombinedQuizQuestion => ({
    id: `order-task-${task.id}`,
    type: 'sentence-order',
    source: 'sentenceOrderingTasks',
    vietnamese: task.vietnamese,
    words: task.words,
    answer: task.answer,
    explanationVi: 'Sắp xếp theo đúng mẫu câu tự nhiên trong bài học.',
  }));

  const fillBlankTasks = lesson.fillBlankTasks.map((task: FillBlankTask): CombinedQuizQuestion => ({
    id: `blank-task-${task.id}`,
    type: 'fill-blank',
    source: 'fillBlankTasks',
    prompt: task.prompt,
    answer: task.answer,
    hint: task.hint,
    explanationVi: task.hint,
  }));

  return [...quizQuestions, ...sentenceTasks, ...fillBlankTasks];
}

function emptyAnswerState(question: CombinedQuizQuestion): AnswerState {
  return {
    orderedWords: question.type === 'sentence-order' ? [] : undefined,
    orderedTokenIds: question.type === 'sentence-order' ? [] : undefined,
    sentenceOrderAttempt: question.type === 'sentence-order' ? 0 : undefined,
    checked: false,
  };
}

function makeInitialAnswers(questions: CombinedQuizQuestion[]) {
  return questions.reduce<Record<string, AnswerState>>((acc, question) => {
    acc[question.id] = emptyAnswerState(question);
    return acc;
  }, {});
}

function getSummaryMessage(percentage: number) {
  if (percentage >= 80) return 'Tốt lắm! Bạn đã nắm khá chắc bài này.';
  if (percentage >= 50) return 'Ổn rồi, hãy ôn lại các câu sai một lượt.';
  return 'Nên quay lại phần từ vựng và mẫu câu trước khi làm lại kiểm tra nhanh.';
}

export function LessonQuizPractice({ lesson, onWhaleMoodChange }: { lesson: EnglishLesson; onWhaleMoodChange?: (mood: WhaleMood) => void }) {
  const allQuestions = useMemo(() => buildQuestionSet(lesson), [lesson]);
  const [questions, setQuestions] = useState<CombinedQuizQuestion[]>(allQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => makeInitialAnswers(allQuestions));
  const [showSummary, setShowSummary] = useState(false);
  const [savedSummary, setSavedSummary] = useState(false);
  const fillBlankInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuestions(allQuestions);
    setAnswers(makeInitialAnswers(allQuestions));
    setCurrentIndex(0);
    setShowSummary(false);
    setSavedSummary(false);
  }, [allQuestions]);

  const total = questions.length;
  const current = questions[currentIndex];
  const currentAnswer = current ? answers[current.id] ?? emptyAnswerState(current) : undefined;
  const checkedCount = questions.filter((question) => answers[question.id]?.checked).length;
  const correctCount = questions.filter((question) => answers[question.id]?.checked && answers[question.id]?.isCorrect).length;
  const scorePercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const wrongQuestions = questions.filter((question) => answers[question.id]?.checked && !answers[question.id]?.isCorrect);
  const progressValue = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const updateCurrentAnswer = (patch: Partial<AnswerState>) => {
    if (!current) return;
    setAnswers((prev) => ({
      ...prev,
      [current.id]: {
        ...(prev[current.id] ?? emptyAnswerState(current)),
        ...patch,
      },
    }));
  };

  const checkCurrent = () => {
    if (!current || !currentAnswer || currentAnswer.checked) return;
    if (current.type === 'match-meaning' && (!current.pairs?.length || !current.options?.length)) {
      updateCurrentAnswer({ warning: 'Câu ghép nghĩa này chưa đủ dữ liệu để chấm điểm tự động.' });
      return;
    }
    if (!hasAnswer(current, currentAnswer)) {
      updateCurrentAnswer({ warning: 'Hãy chọn hoặc nhập câu trả lời trước khi kiểm tra.' });
      return;
    }
    const isCorrect = checkAnswer(current, currentAnswer);
    const hearts = isCorrect ? undefined : loseHeart('quiz-wrong');
    onWhaleMoodChange?.(isCorrect ? 'correct' : 'mistake');
    markItemReviewed(lesson.id, current.id, 'quiz', isCorrect ? 'correct' : 'wrong');
    updateCurrentAnswer({ checked: true, isCorrect, warning: undefined, heartLossText: hearts ? `Bạn mất 1 bọt biển. Còn ${hearts.heartsLeft}/${hearts.maxHearts} bọt biển.` : undefined });
  };

  const nextQuestion = () => {
    if (!current || !currentAnswer) return;
    if (!currentAnswer.checked) {
      updateCurrentAnswer({ warning: 'Bạn có thể kiểm tra trước khi sang câu tiếp theo.' });
      return;
    }
    if (currentIndex >= total - 1) {
      onWhaleMoodChange?.('celebrate');
      setShowSummary(true);
      return;
    }
    setCurrentIndex((index) => Math.min(index + 1, total - 1));
  };

  const previousQuestion = () => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  };

  const resetCurrent = () => {
    if (!current) return;
    setAnswers((prev) => {
      const previous = prev[current.id];
      const next = emptyAnswerState(current);
      if (current.type === 'sentence-order') {
        next.sentenceOrderAttempt = (previous?.sentenceOrderAttempt ?? 0) + 1;
      }
      return { ...prev, [current.id]: next };
    });
    if (current.type === 'fill-blank') {
      window.setTimeout(() => fillBlankInputRef.current?.focus(), 0);
    }
  };

  const restartWith = (nextQuestions: CombinedQuizQuestion[]) => {
    setQuestions(nextQuestions);
    setAnswers(makeInitialAnswers(nextQuestions));
    setCurrentIndex(0);
    setShowSummary(false);
    setSavedSummary(false);
  };

  const restartWrong = () => {
    const nextWrongQuestions = wrongQuestions.length > 0 ? wrongQuestions : allQuestions;
    restartWith(nextWrongQuestions);
  };

  const restartAll = () => {
    restartWith(allQuestions);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (showSummary || !current || !currentAnswer) return;
      const typingTarget = isTypingTarget(event.target);

      if (event.key === 'Enter') {
        event.preventDefault();
        if (currentAnswer.checked) {
          if (currentAnswer.isCorrect) nextQuestion();
          else resetCurrent();
        } else {
          checkCurrent();
        }
        return;
      }

      if (typingTarget) return;

      const key = event.key.toLowerCase();
      if (key === 'r') {
        event.preventDefault();
        resetCurrent();
        return;
      }
      if (key === 'n') {
        event.preventDefault();
        nextQuestion();
        return;
      }

      if (current.type === 'multiple-choice') {
        const optionIndex = /^[1-4]$/.test(key) ? Number(key) - 1 : ['a', 'b', 'c', 'd'].indexOf(key);
        const option = optionIndex >= 0 ? current.options?.[optionIndex] : undefined;
        if (option && !currentAnswer.checked) {
          event.preventDefault();
          updateCurrentAnswer({ selectedOption: option, warning: undefined });
        }
      }

      if (event.key === 'Backspace' && current.type === 'sentence-order' && !currentAnswer.checked) {
        const orderedWords = currentAnswer.orderedWords ?? [];
        const orderedTokenIds = currentAnswer.orderedTokenIds ?? [];
        if (orderedWords.length > 0) {
          event.preventDefault();
          updateCurrentAnswer({ orderedWords: orderedWords.slice(0, -1), orderedTokenIds: orderedTokenIds.slice(0, -1), warning: undefined });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, currentAnswer, showSummary, currentIndex, total]);

  useEffect(() => {
    if (showSummary || current?.type !== 'fill-blank' || currentAnswer?.checked) return;
    const focusTimer = window.setTimeout(() => fillBlankInputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [current?.id, current?.type, currentAnswer?.checked, showSummary]);

  useEffect(() => {
    if (!showSummary || savedSummary) return;
    const wrongQuestionIds = questions.filter((question) => !answers[question.id]?.isCorrect).map((question) => question.id);
    safeWriteProgress(lesson.id, (currentProgress) => {
      const currentQuiz = currentProgress.quiz;
      const nextQuiz: QuizProgress = {
        attempts: (currentQuiz?.attempts ?? 0) + 1,
        bestScore: Math.max(currentQuiz?.bestScore ?? 0, correctCount),
        lastScore: correctCount,
        lastPercentage: scorePercentage,
        wrongQuestionIds,
        lastCompletedAt: new Date().toISOString(),
      };
      return { ...currentProgress, lessonId: lesson.id, quiz: nextQuiz };
    });
    recordPracticeSessionMemory({
      lessonId: lesson.id,
      lessonTitleVi: lesson.titleVi,
      mode: 'quiz',
      total,
      correct: correctCount,
      wrong: total - correctCount,
      percentage: scorePercentage,
      weakItemIds: wrongQuestionIds,
    });
    setSavedSummary(true);
  }, [showSummary, savedSummary, questions, answers, lesson.id, lesson.titleVi, total, correctCount, scorePercentage]);

  if (total === 0) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color={COLORS.text}>Poo mở phần thử sức ở nhịp khác</Text>
          <Text mt="2" color={COLORS.muted}>Hãy quay lại bài học hoặc luyện bằng thẻ từ trước.</Text>
          <HStack mt="6" wrap="wrap">
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} leftIcon={<Icon as={ArrowLeft} />}>Quay về bài học</Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=flashcard`} borderRadius="full" variant="outline">Ôn bằng thẻ từ</Button>
          </HStack>
        </Box>
      </Box>
    );
  }

  if (showSummary) {
    return (
      <QuizSummary
        lesson={lesson}
        total={total}
        correctCount={correctCount}
        percentage={scorePercentage}
        wrongQuestions={wrongQuestions}
        answers={answers}
        onRestartWrong={restartWrong}
        onRestartAll={restartAll}
      />
    );
  }

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} pb="12">
      <Box maxW="980px" mx="auto">
        <VStack align="stretch" gap="5">
          <Box bg="rgba(255,255,255,0.92)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '5', md: '7' }} boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)">
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4">
              <Box>
                <HStack wrap="wrap" gap="2" mb="2">
                  <Tag bg="#EFF6FF" color={COLORS.primary} borderRadius="full" fontWeight="800">Thử sức nhẹ</Tag>
                  <Tag bg="#F0FDF4" color="#15803D" borderRadius="full" fontWeight="800">Bài 1</Tag>
                </HStack>
                <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text}>{lesson.titleVi}</Text>
                <Text mt="1" color={COLORS.muted} fontWeight="700">{lesson.titleEn}</Text>
                <Text mt="3" color={COLORS.muted}>Phần thử sức nhẹ này giúp bạn ôn cụm câu, không chỉ ôn từ đơn.</Text>
                <Text color={COLORS.muted}>Trả lời xong hãy đọc phần giải thích để hiểu vì sao đúng.</Text>
              </Box>
              <HStack align="center" gap="3">
                <Box display={{ base: 'none', sm: 'block' }} pointerEvents="none">
                  <OceanMascot mascot="cuaQuiz" pose="quiz" size="md" decorative motion="pulse" />
                </Box>
                <VStack align={{ base: 'start', md: 'end' }} gap="1">
                  <Text color={COLORS.muted} fontWeight="800">Câu {currentIndex + 1}/{total}</Text>
                  <Text color={COLORS.text} fontSize="2xl" fontWeight="950">{correctCount}/{checkedCount} đúng</Text>
                </VStack>
              </HStack>
            </Flex>
            <Progress value={progressValue} mt="5" h="10px" borderRadius="full" colorScheme="blue" bg="#E2E8F0" />
          </Box>

          <Box bg="rgba(255,255,255,0.94)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '5', md: '8' }} overflow="hidden" boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)">
            <HStack wrap="wrap" gap="2" mb="4">
              <Tag borderRadius="full" bg="#F8FAFC" color={COLORS.muted}>{questionSourceLabel(current.source)}</Tag>
              <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.primary}>{questionTypeLabel(current.type)}</Tag>
            </HStack>

            <QuestionBody question={current} answer={currentAnswer ?? emptyAnswerState(current)} onChange={updateCurrentAnswer} fillBlankInputRef={fillBlankInputRef} />

            {currentAnswer?.warning ? (
              <Box mt="5" border="1px solid" borderColor="#FCD34D" bg="#FFFBEB" borderRadius="2xl" p="4" role="status" aria-live="polite">
                <Text color="#92400E" fontWeight="800">{currentAnswer.warning}</Text>
              </Box>
            ) : null}

            {currentAnswer?.checked ? (
              <Box mt="6" border="1px solid" borderColor={currentAnswer.isCorrect ? '#BBF7D0' : '#FED7AA'} bg={currentAnswer.isCorrect ? '#F0FDF4' : '#FFF7ED'} borderRadius="2xl" p="5" role="status" aria-live="polite">
                <HStack align="start" gap="3">
                  <Box flexShrink={0} pointerEvents="none" aria-hidden="true">
                    <OceanMascot mascot="cuaQuiz" pose={currentAnswer.isCorrect ? 'happy' : 'coach'} size="sm" decorative motion={currentAnswer.isCorrect ? 'celebrate' : 'pulse'} />
                  </Box>
                  <Icon as={currentAnswer.isCorrect ? CheckCircle2 : XCircle} color={currentAnswer.isCorrect ? COLORS.green : '#EA580C'} boxSize="6" mt="0.5" />
                  <Box>
                    <Text fontWeight="950" color={currentAnswer.isCorrect ? '#15803D' : '#9A3412'}>{currentAnswer.isCorrect ? 'Chính xác!' : 'Chưa đúng, thử ghi nhớ lại cụm này.'}</Text>
                    <Text mt="2" color={COLORS.text}><Text as="span" fontWeight="900">Đáp án đúng:</Text> {answerToText(current.answer)}</Text>
                    {current.explanationVi ? <Text mt="2" color={COLORS.muted}>{current.explanationVi}</Text> : null}
                    {!currentAnswer.isCorrect ? <Text mt="2" color="#9A3412" fontWeight="800">{currentAnswer.heartLossText ?? 'Bạn mất 1 bọt biển.'} Cua kiểm tra vẫn kẹp nhẹ đáp án cùng bạn — thử lại nhịp tiếp theo nhé.</Text> : null}
                    {!currentAnswer.isCorrect ? <Text mt="2" color={COLORS.muted}>Hãy đọc lại câu ví dụ rồi thử nói to một lần.</Text> : null}
                    <HStack mt="4" wrap="wrap">
                      <Button data-testid="practice-quiz-next" borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} onClick={nextQuestion}>Câu tiếp theo</Button>
                      <Button data-testid="practice-quiz-retry" borderRadius="full" variant="outline" onClick={resetCurrent}>Làm lại câu này</Button>
                    </HStack>
                  </Box>
                </HStack>
              </Box>
            ) : null}
          </Box>

          <Flex justify="space-between" align="center" gap="3" wrap="wrap">
            <HStack wrap="wrap">
              <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" variant="outline" leftIcon={<Icon as={ArrowLeft} />}>Quay về bài học</Button>
              <Button borderRadius="full" variant="outline" leftIcon={<Icon as={RotateCcw} />} onClick={restartAll}>Làm lại phần thử sức</Button>
            </HStack>
            <HStack wrap="wrap">
              <Button borderRadius="full" variant="outline" onClick={previousQuestion} isDisabled={currentIndex === 0}>Câu trước</Button>
              {currentAnswer?.checked ? null : <Button data-testid="practice-quiz-check" borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} onClick={checkCurrent}>Poo xem giúp</Button>}
            </HStack>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
}

function QuestionBody({
  question,
  answer,
  onChange,
  fillBlankInputRef,
}: {
  question: CombinedQuizQuestion;
  answer: AnswerState;
  onChange: (patch: Partial<AnswerState>) => void;
    fillBlankInputRef: RefObject<HTMLInputElement>;
}) {
  const locked = Boolean(answer.checked);

  if (question.type === 'multiple-choice') {
    return (
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>{question.question}</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" mt="5">
          {(question.options ?? []).map((option, index) => {
            const selected = answer.selectedOption === option;
            return (
              <Button
                key={option}
                data-testid={`practice-quiz-option-${index + 1}`}
                data-qa-option={String.fromCharCode(65 + index)}
                justifyContent="flex-start"
                whiteSpace="normal"
                h="auto"
                minH="56px"
                py="4"
                borderRadius="2xl"
                border="1px solid"
                borderColor={selected ? COLORS.primary : COLORS.border}
                bg={selected ? '#EFF6FF' : '#FFFFFF'}
                color={COLORS.text}
                _hover={{ bg: selected ? '#EFF6FF' : '#F8FAFC' }}
                isDisabled={locked}
                aria-pressed={selected}
                onClick={() => onChange({ selectedOption: option, warning: undefined })}
              >
                <Text as="span" mr="2" color={COLORS.primary} fontWeight="950">{String.fromCharCode(65 + index)}/{index + 1}.</Text>{option}
              </Button>
            );
          })}
        </SimpleGrid>
        <Text mt="3" fontSize={{ base: 'xs', md: 'sm' }} color={COLORS.muted}>Phím tắt: A/B/C/D hoặc 1/2/3/4 chọn; Enter kiểm tra/tiếp; R làm lại; N câu tiếp.</Text>
      </Box>
    );
  }

  if (question.type === 'fill-blank') {
    return (
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>{question.prompt}</Text>
        {question.hint ? <Text mt="2" color={COLORS.muted}>Gợi ý: {question.hint}</Text> : null}
        <Input
          data-testid="practice-quiz-fill-input"
          ref={fillBlankInputRef}
          mt="5"
          size="lg"
          borderRadius="2xl"
          borderColor={COLORS.border}
          focusBorderColor={COLORS.primary}
          value={answer.fillValue ?? ''}
          isDisabled={locked}
          placeholder="Nhập phần còn thiếu"
          aria-label="Nhập đáp án điền vào chỗ trống"
          onChange={(event) => onChange({ fillValue: event.target.value, warning: undefined })}
        />
        <Text mt="2" fontSize={{ base: 'xs', md: 'sm' }} color={COLORS.muted}>Enter kiểm tra/tiếp; R làm lại; N câu tiếp.</Text>
      </Box>
    );
  }

  if (question.type === 'sentence-order') {
    const builtQuestion = buildSentenceOrderQuestion({
      id: question.id,
      vietnamese: question.vietnamese,
      words: question.words,
      answer: answerToText(question.answer),
      attemptId: answer.sentenceOrderAttempt ?? 0,
    });

    if (!builtQuestion) {
      return (
        <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="5">
          <Text fontSize="xl" fontWeight="950" color={COLORS.text}>Câu sắp xếp này chưa đủ dữ liệu.</Text>
          <Text mt="2" color={COLORS.muted}>Cần ít nhất 2 từ để tạo bài ghép câu.</Text>
        </Box>
      );
    }

    const selectedTokenIds = answer.orderedTokenIds ?? [];
    const tokenById = new Map(builtQuestion.tokens.map((token) => [token.id, token]));
    const selectedTokens = selectedTokenIds
      .map((tokenId) => tokenById.get(tokenId))
      .filter(Boolean) as Array<{ id: string; word: string; originalIndex: number }>;
    const selectedWords = selectedTokens.map((token) => token.word);
    const availableTokens = builtQuestion.shuffledTokens.filter((token) => !selectedTokenIds.includes(token.id));
    const feedbackBorder = answer.checked ? (answer.isCorrect ? '#86EFAC' : '#FDBA74') : COLORS.border;
    const feedbackBg = answer.checked ? (answer.isCorrect ? '#F0FDF4' : '#FFF7ED') : '#F8FAFC';

    const removeSelectedToken = (index: number) => {
      const nextTokenIds = selectedTokenIds.filter((_, itemIndex) => itemIndex !== index);
      const nextWords = nextTokenIds.map((tokenId) => tokenById.get(tokenId)?.word).filter(Boolean) as string[];
      onChange({ orderedTokenIds: nextTokenIds, orderedWords: nextWords, warning: undefined });
    };

    return (
      <Box maxW="100%" overflow="hidden">
        <Text color={COLORS.muted} fontWeight="800">Sắp xếp câu tiếng Anh cho:</Text>
        <Text mt="1" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>{question.vietnamese}</Text>
        <Flex
          mt="5"
          minH="72px"
          border="1px solid"
          borderColor={feedbackBorder}
          bg={feedbackBg}
          borderRadius="2xl"
          p="4"
          gap="2"
          wrap="wrap"
          align="center"
          maxW="100%"
          sx={{
            '@keyframes sentenceOrderWrongShake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '25%': { transform: 'translateX(-4px)' },
              '75%': { transform: 'translateX(4px)' },
            },
            animation: answer.checked && !answer.isCorrect ? 'sentenceOrderWrongShake 180ms ease-in-out' : undefined,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          {selectedWords.length === 0 ? <Text color={COLORS.muted}>Bấm các từ bên dưới để ghép câu.</Text> : null}
          {selectedTokens.map((token, index) => (
            <Button
              key={`${token.id}-selected`}
              data-testid={`practice-quiz-selected-token-${index + 1}`}
              data-qa-token-id={token.id}
              data-qa-token-word={token.word}
              data-qa-token-original-index={token.originalIndex}
              size="sm"
              borderRadius="full"
              bg={answer.checked && answer.isCorrect ? '#DCFCE7' : '#DBEAFE'}
              color={answer.checked && answer.isCorrect ? '#166534' : COLORS.primary}
              border="1px solid"
              borderColor={answer.checked && answer.isCorrect ? '#86EFAC' : '#BFDBFE'}
              isDisabled={locked}
              whiteSpace="normal"
              wordBreak="break-word"
              maxW="100%"
              h="auto"
              minH="32px"
              onClick={() => removeSelectedToken(index)}
            >
              {token.word}
            </Button>
          ))}
        </Flex>
        <Flex mt="4" gap="2" wrap="wrap" maxW="100%" overflow="hidden">
          {availableTokens.map((token) => (
            <Button
              key={`${token.id}-bank`}
              data-testid="practice-quiz-token"
              data-qa-token-id={token.id}
              data-qa-token-word={token.word}
              data-qa-token-original-index={token.originalIndex}
              borderRadius="full"
              variant="outline"
              isDisabled={locked}
              whiteSpace="normal"
              wordBreak="break-word"
              maxW="100%"
              h="auto"
              minH="40px"
              onClick={() => onChange({ orderedTokenIds: [...selectedTokenIds, token.id], orderedWords: [...selectedWords, token.word], warning: undefined })}
            >
              {token.word}
            </Button>
          ))}
        </Flex>
        <Button
          data-testid="practice-quiz-sentence-reset"
          mt="4"
          borderRadius="full"
          variant="outline"
          isDisabled={locked || selectedTokenIds.length === 0}
          onClick={() => onChange({ orderedTokenIds: [], orderedWords: [], sentenceOrderAttempt: (answer.sentenceOrderAttempt ?? 0) + 1, warning: undefined })}
        >
          Làm lại câu
        </Button>
      </Box>
    );
  }

  if (question.type === 'match-meaning') {
    const left = question.pairs?.[0]?.left;
    if (!left || !question.options?.length) {
      return (
        <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="5">
          <Text fontSize="xl" fontWeight="950" color={COLORS.text}>{question.question ?? 'Ghép nghĩa đúng'}</Text>
          <Text mt="2" color={COLORS.muted}>Câu này chưa đủ dữ liệu ghép nghĩa để chấm tự động, nên chỉ hiển thị dạng xem trước.</Text>
          <Text mt="4" fontWeight="900" color={COLORS.text}>Đáp án: {answerToText(question.answer)}</Text>
        </Box>
      );
    }

    return (
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>{question.question ?? 'Ghép nghĩa đúng'}</Text>
        <Text mt="3" color={COLORS.muted}>Chọn nghĩa đúng cho: <Text as="span" color={COLORS.text} fontWeight="950">{left}</Text></Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" mt="5">
          {question.options.map((option, index) => {
            const selected = answer.matchRight === option;
            return (
              <Button
                key={option}
                data-testid={`practice-quiz-match-option-${index + 1}`}
                justifyContent="flex-start"
                whiteSpace="normal"
                h="auto"
                minH="52px"
                py="3"
                borderRadius="2xl"
                border="1px solid"
                borderColor={selected ? COLORS.primary : COLORS.border}
                bg={selected ? '#EFF6FF' : '#FFFFFF'}
                color={COLORS.text}
                _hover={{ bg: selected ? '#EFF6FF' : '#F8FAFC' }}
                isDisabled={locked}
                aria-pressed={selected}
                onClick={() => onChange({ matchRight: option, warning: undefined })}
              >
                {option}
              </Button>
            );
          })}
        </SimpleGrid>
      </Box>
    );
  }

  return null;
}

function QuizSummary({
  lesson,
  total,
  correctCount,
  percentage,
  wrongQuestions,
  answers,
  onRestartWrong,
  onRestartAll,
}: {
  lesson: EnglishLesson;
  total: number;
  correctCount: number;
  percentage: number;
  wrongQuestions: CombinedQuizQuestion[];
  answers: Record<string, AnswerState>;
  onRestartWrong: () => void;
  onRestartAll: () => void;
}) {
  const wrongCount = total - correctCount;
  const feedback = getPracticeSessionFeedback({
    lesson,
    mode: 'quiz',
    total,
    correct: correctCount,
    wrong: wrongCount,
    percentage,
    weakItemIds: wrongQuestions.map((question) => question.id),
    nextMode: wrongQuestions.length > 0 ? 'quiz' : 'type',
  });

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
      <Box maxW="980px" mx="auto">
        <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
          <Tag bg="#F0FDF4" color="#15803D" borderRadius="full" fontWeight="900">Hoàn thành kiểm tra nhanh</Tag>
          <Text mt="4" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text}>{getSummaryMessage(percentage)}</Text>
          <Text mt="2" color={COLORS.muted}>Nếu còn câu sai, hãy ôn lại câu sai hoặc dùng thẻ từ để củng cố cụm câu.</Text>

          <SimpleGrid columns={{ base: 1, md: 4 }} gap="4" mt="6">
            <SummaryMetric label="Tổng câu" value={total} />
            <SummaryMetric label="Đúng" value={correctCount} tone="green" />
            <SummaryMetric label="Sai" value={wrongCount} tone="red" />
            <SummaryMetric label="Tỷ lệ" value={`${percentage}%`} />
          </SimpleGrid>

          <PracticeSessionFeedbackCard feedback={feedback} />

          <Box mt="7">
            <Text fontSize="xl" fontWeight="950" color={COLORS.text}>Danh sách câu sai</Text>
            {wrongQuestions.length === 0 ? (
              <Box mt="3" border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4">
                <Text color="#15803D" fontWeight="900">Không có câu sai. Bạn có thể chuyển sang luyện phản xạ ở bước sau.</Text>
              </Box>
            ) : (
              <VStack align="stretch" gap="3" mt="3">
                {wrongQuestions.map((question) => (
                  <Box key={question.id} border="1px solid" borderColor="#FED7AA" bg="#FFF7ED" borderRadius="2xl" p="4">
                    <Text fontWeight="950" color={COLORS.text}>{questionLabel(question)}</Text>
                    <Text mt="2" color={COLORS.muted}><Text as="span" fontWeight="900" color={COLORS.text}>Bạn trả lời:</Text> {userAnswerToText(question, answers[question.id] ?? {})}</Text>
                    <Text color={COLORS.muted}><Text as="span" fontWeight="900" color={COLORS.text}>Đáp án đúng:</Text> {answerToText(question.answer)}</Text>
                    {question.explanationVi ? <Text mt="2" color={COLORS.muted}>{question.explanationVi}</Text> : null}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          <Flex mt="7" gap="3" wrap="wrap">
            <Button borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} onClick={onRestartWrong}>Ôn lại câu sai</Button>
            <Button borderRadius="full" variant="outline" onClick={onRestartAll}>Làm lại toàn bộ</Button>
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" variant="outline">Quay về bài học</Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=flashcard`} borderRadius="full" variant="outline">Ôn bằng thẻ từ</Button>
            <Button as={Link} to="/learning-path" borderRadius="full" variant="outline">Xem lộ trình</Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function SummaryMetric({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'red' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'red' ? '#9A3412' : COLORS.primary;

  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="4">
      <Text color={COLORS.muted} fontWeight="800">{label}</Text>
      <Text mt="1" color={color} fontSize="3xl" fontWeight="950">{value}</Text>
    </Box>
  );
}
