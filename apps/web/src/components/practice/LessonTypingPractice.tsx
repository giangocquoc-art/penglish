import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Input,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { loseHeart } from '../../lib/p-english/learning-hearts';
import { recordPracticeSessionMemory } from '../../lib/p-english/localSkillMemory';
import { getPracticeSessionFeedback } from '../../lib/p-english/practiceSessionFeedback';
import { PracticeSessionFeedbackCard } from './PracticeSessionFeedbackCard';
import type { WhaleMood } from '../streak/AdaptiveWhaleStreak';
import type { EnglishLesson, FillBlankTask, ListeningPracticeItem, VocabularyItem } from '../../lib/p-english/lesson-content-data';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#E2E8F0',
};

const SELECTED_VOCABULARY_IDS = [
  'hello',
  'good-morning',
  'my-name-is',
  'im',
  'whats-your-name',
  'nice-to-meet-you',
  'where-are-you-from',
  'im-from',
  'thank-you',
  'goodbye',
];

type TypingTaskType = 'listen-type' | 'fill-blank' | 'meaning-to-english';

type TypingTask = {
  id: string;
  type: TypingTaskType;
  label: string;
  prompt?: string;
  promptVi?: string;
  answer: string;
  hint?: string;
  sourceText?: string;
  meaningVi?: string;
};

type TaskResult = {
  taskId: string;
  prompt: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean;
};

type TypingProgress = {
  attempts: number;
  correctTaskIds: string[];
  wrongTaskIds: string[];
  lastScore: number;
  lastPercentage: number;
  lastCompletedAt: string;
};

type LessonProgress = Record<string, unknown> & {
  typing?: TypingProgress;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

function normalizeAnswer(value: string) {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')
    .trim();
}

function speakEnglish(text: string, rate = 0.86) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

function safeReadProgress(lessonId: string): LessonProgress {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(`PooEnglish:lesson-progress:${lessonId}`);
    return raw ? (JSON.parse(raw) as LessonProgress) : {};
  } catch {
    return {};
  }
}

function safeWriteProgress(lessonId: string, updater: (current: LessonProgress) => LessonProgress) {
  if (typeof window === 'undefined') return;

  try {
    const current = safeReadProgress(lessonId);
    window.localStorage.setItem(`PooEnglish:lesson-progress:${lessonId}`, JSON.stringify(updater(current)));
  } catch {
    // Practice still works in memory when localStorage is unavailable.
  }
}

function buildTypingTasks(lesson: EnglishLesson): TypingTask[] {
  const listeningTasks = lesson.listeningPractice.map((item: ListeningPracticeItem): TypingTask => ({
    id: `listen-type-${item.id}`,
    type: 'listen-type',
    label: 'Nghe và gõ lại',
    promptVi: item.question || 'Nghe và gõ lại câu tiếng Anh',
    answer: item.text,
    sourceText: item.text,
  }));

  const fillBlankTasks = lesson.fillBlankTasks.map((task: FillBlankTask): TypingTask => ({
    id: `fill-${task.id}`,
    type: 'fill-blank',
    label: 'Điền vào chỗ trống',
    prompt: task.prompt,
    answer: task.answer,
    hint: task.hint,
  }));

  const vocabularyTasks = SELECTED_VOCABULARY_IDS.map((id) => lesson.vocabulary.find((item) => item.id === id))
    .filter((item): item is VocabularyItem => Boolean(item))
    .map((item): TypingTask => ({
      id: `meaning-${item.id}`,
      type: 'meaning-to-english',
      label: 'Nhìn nghĩa, gõ tiếng Anh',
      meaningVi: item.meaningVi,
      answer: item.term,
      sourceText: item.term,
    }));

  return [...listeningTasks, ...fillBlankTasks, ...vocabularyTasks].slice(0, 16);
}

function getTaskPrompt(task: TypingTask) {
  if (task.type === 'listen-type') return task.promptVi ?? 'Nghe và gõ lại câu tiếng Anh';
  if (task.type === 'fill-blank') return task.prompt ?? 'Điền phần còn thiếu';
  return task.meaningVi ?? 'Gõ cụm tiếng Anh';
}

function getPlaceholder(task: TypingTask) {
  if (task.type === 'listen-type') return 'Gõ câu bạn nghe được...';
  if (task.type === 'fill-blank') return 'Điền phần còn thiếu...';
  return 'Gõ cụm tiếng Anh...';
}

function getSummaryMessage(percentage: number) {
  if (percentage >= 80) return 'Gõ câu tốt! Bạn đã nắm khá chắc mặt chữ và cấu trúc.';
  if (percentage >= 50) return 'Ổn rồi, hãy ôn lại các câu sai.';
  return 'Nên quay lại nghe chậm và thẻ từ trước khi gõ lại.';
}

export function LessonTypingPractice({ lesson, onWhaleMoodChange }: { lesson: EnglishLesson; onWhaleMoodChange?: (mood: WhaleMood) => void }) {
  const allTasks = useMemo(() => buildTypingTasks(lesson), [lesson]);
  const [activeTasks, setActiveTasks] = useState<TypingTask[]>(allTasks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [savedSummary, setSavedSummary] = useState(false);
  const [heartLossText, setHeartLossText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentTask = activeTasks[currentIndex];
  const progressValue = activeTasks.length > 0 ? ((currentIndex + (checked ? 1 : 0)) / activeTasks.length) * 100 : 0;
  const correctCount = results.filter((result) => result.isCorrect).length + (checked && isCurrentCorrect ? 1 : 0);
  const wrongCount = results.filter((result) => !result.isCorrect).length + (checked && !isCurrentCorrect ? 1 : 0);
  const finalCorrectCount = results.filter((result) => result.isCorrect).length;
  const finalWrongCount = results.filter((result) => !result.isCorrect).length;
  const percentage = activeTasks.length > 0 ? Math.round((finalCorrectCount / activeTasks.length) * 100) : 0;
  const wrongResults = results.filter((result) => !result.isCorrect);

  const resetCurrentState = () => {
    setInput('');
    setChecked(false);
    setIsCurrentCorrect(false);
    setShowHint(false);
    setHeartLossText(null);
  };

  const startPractice = () => {
    setStarted(true);
    setShowSummary(false);
    setSavedSummary(false);
    setResults([]);
    setActiveTasks(allTasks);
    setCurrentIndex(0);
    resetCurrentState();
  };

  const checkCurrent = () => {
    if (!currentTask || checked) return;
    if (!input.trim()) {
      inputRef.current?.focus();
      return;
    }

    const isCorrect = normalizeAnswer(input) === normalizeAnswer(currentTask.answer);
    onWhaleMoodChange?.(isCorrect ? 'correct' : 'mistake');
    const hearts = isCorrect ? undefined : loseHeart('typing-wrong');
    setIsCurrentCorrect(isCorrect);
    setHeartLossText(hearts ? `Bạn mất 1 bọt biển. Còn ${hearts.heartsLeft}/${hearts.maxHearts} bọt biển.` : null);
    setChecked(true);
  };

  const commitCurrentResult = () => {
    if (!currentTask || !checked) return;

    const nextResult: TaskResult = {
      taskId: currentTask.id,
      prompt: getTaskPrompt(currentTask),
      answer: currentTask.answer,
      userAnswer: input.trim(),
      isCorrect: isCurrentCorrect,
    };

    const nextResults = [...results, nextResult];
    setResults(nextResults);

    if (currentIndex >= activeTasks.length - 1) {
      onWhaleMoodChange?.('celebrate');
      setShowSummary(true);
      setSavedSummary(false);
      return;
    }

    setCurrentIndex((index) => index + 1);
    resetCurrentState();
  };

  const retryCurrent = () => {
    resetCurrentState();
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const restartAll = () => {
    setActiveTasks(allTasks);
    setCurrentIndex(0);
    setResults([]);
    setShowSummary(false);
    setSavedSummary(false);
    setStarted(true);
    resetCurrentState();
  };

  const restartWrong = () => {
    const wrongTaskIds = new Set(wrongResults.map((result) => result.taskId));
    const nextTasks = activeTasks.filter((task) => wrongTaskIds.has(task.id));

    if (nextTasks.length === 0) {
      restartAll();
      return;
    }

    setActiveTasks(nextTasks);
    setCurrentIndex(0);
    setResults([]);
    setShowSummary(false);
    setSavedSummary(false);
    setStarted(true);
    resetCurrentState();
  };

  const speakCurrentPrompt = (slow = false) => {
    if (!currentTask) return;
    const text = currentTask.type === 'listen-type' ? currentTask.sourceText ?? currentTask.answer : currentTask.answer;
    speakEnglish(text, slow ? 0.72 : 0.86);
  };

  useEffect(() => {
    if (!currentTask) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const typingTarget = isTypingTarget(event.target);
      const isTextAreaTarget = event.target instanceof HTMLElement && event.target.tagName.toLowerCase() === 'textarea';
      if (typingTarget && event.key !== 'Enter' && event.key !== 'Escape') return;

      if (event.key === 'Enter') {
        if (isTextAreaTarget) return;
        if (showSummary || !started) return;
        if (checked) {
          if (isCurrentCorrect) {
            event.preventDefault();
            commitCurrentResult();
          }
          return;
        }
        if (!input.trim()) return;
        event.preventDefault();
        checkCurrent();
      }

      if (event.key === 'Escape') {
        if (!checked) {
          event.preventDefault();
          setInput('');
        }
        return;
      }

      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 'r') {
        event.preventDefault();
        retryCurrent();
        return;
      }
      if (key === 'n' && checked) {
        event.preventDefault();
        commitCurrentResult();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [checked, currentTask, input, isCurrentCorrect, results, showSummary, started]);

  useEffect(() => {
    if (!started || showSummary || checked) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [started, showSummary, checked, currentIndex]);

  useEffect(() => {
    if (!showSummary || savedSummary) return;

    const correctTaskIds = results.filter((result) => result.isCorrect).map((result) => result.taskId);
    const wrongTaskIds = results.filter((result) => !result.isCorrect).map((result) => result.taskId);
    const lastScore = correctTaskIds.length;
    const lastPercentage = activeTasks.length > 0 ? Math.round((lastScore / activeTasks.length) * 100) : 0;

    safeWriteProgress(lesson.id, (current) => ({
      ...current,
      typing: {
        attempts: ((current.typing as TypingProgress | undefined)?.attempts ?? 0) + 1,
        correctTaskIds,
        wrongTaskIds,
        lastScore,
        lastPercentage,
        lastCompletedAt: new Date().toISOString(),
      },
    }));

    recordPracticeSessionMemory({
      lessonId: lesson.id,
      lessonTitleVi: lesson.titleVi,
      mode: 'type',
      total: activeTasks.length,
      correct: lastScore,
      wrong: wrongTaskIds.length,
      percentage: lastPercentage,
      weakItemIds: wrongTaskIds,
    });

    setSavedSummary(true);
  }, [activeTasks.length, lesson.id, lesson.titleVi, results, savedSummary, showSummary]);

  if (allTasks.length === 0) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color={COLORS.text}>Poo mở phần gõ câu ở nhịp khác</Text>
          <Text mt="2" color={COLORS.muted}>Bài này ưu tiên nhịp luyện khác trước khi vào phần gõ câu.</Text>
          <HStack mt="6" wrap="wrap">
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
              Quay về bài học
            </Button>
          </HStack>
        </Box>
      </Box>
    );
  }

  if (!started) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
        <Box maxW="860px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
          <Badge colorScheme="blue" borderRadius="full" px="3" py="1">Bài 1 • Gõ câu</Badge>
          <Text mt="4" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="900" color={COLORS.text}>Gõ câu</Text>
          <Text mt="2" fontSize="xl" fontWeight="800" color={COLORS.text}>{lesson.titleVi}</Text>
          <Text color={COLORS.muted}>{lesson.titleEn}</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="3" mt="6">
            <SummaryMetric label="Tổng câu" value={allTasks.length} />
            <SummaryMetric label="Nghe và gõ" value={allTasks.filter((task) => task.type === 'listen-type').length} />
            <SummaryMetric label="Điền chỗ trống" value={allTasks.filter((task) => task.type !== 'listen-type').length} />
          </SimpleGrid>
          <Box mt="6" border="1px solid" borderColor="#FDE68A" bg="#FFFBEB" borderRadius="2xl" p="4">
            <Text color="#92400E" fontWeight="700">
              Bạn sẽ nghe hoặc nhìn gợi ý tiếng Việt, sau đó gõ lại câu/cụm tiếng Anh. Chú ý dấu nháy trong I’m, What’s.
            </Text>
          </Box>
          <Flex mt="7" gap="3" wrap="wrap">
            <Button data-testid="practice-typing-start" onClick={startPractice} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
              Bắt đầu gõ câu
            </Button>
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" variant="outline">
              Quay về bài học
            </Button>
          </Flex>
        </Box>
      </Box>
    );
  }

  if (showSummary) {
    return (
      <TypingSummary
        lesson={lesson}
        total={activeTasks.length}
        correctCount={finalCorrectCount}
        wrongCount={finalWrongCount}
        percentage={percentage}
        wrongResults={wrongResults}
        onRestartAll={restartAll}
        onRestartWrong={restartWrong}
      />
    );
  }

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} pb="12">
      <Box maxW="980px" mx="auto">
        <VStack align="stretch" gap="5">
          <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '7' }}>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4">
              <Box>
                <HStack wrap="wrap" gap="2" mb="2">
                  <Badge colorScheme="blue" borderRadius="full" px="3" py="1">Gõ câu</Badge>
                  <Badge bg="#F0FDF4" color="#166534" borderRadius="full" px="3" py="1">{currentIndex + 1}/{activeTasks.length}</Badge>
                </HStack>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="900" color={COLORS.text}>Gõ câu</Text>
                <Text color={COLORS.muted}>Nghe trước, gõ lại, rồi đọc to câu đúng một lần.</Text>
              </Box>
              <VStack align={{ base: 'start', md: 'end' }} gap="1">
                <Text fontWeight="800" color={COLORS.green}>Trúng nhịp: {correctCount}</Text>
                <Text fontWeight="800" color="#9A3412">Cần ôn: {wrongCount}</Text>
              </VStack>
            </Flex>
            <Progress mt="5" value={progressValue} colorScheme="blue" borderRadius="full" bg="#E2E8F0" />
          </Box>

          <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '8' }}>
            <HStack wrap="wrap" gap="2" mb="4">
              <Badge borderRadius="full" px="3" py="1" bg="#EFF6FF" color="#1D4ED8">{currentTask.label}</Badge>
              {currentTask.type === 'fill-blank' ? <Badge borderRadius="full" px="3" py="1" bg="#FFFBEB" color="#92400E">Có gợi ý</Badge> : null}
            </HStack>

            <TaskPrompt task={currentTask} checked={checked} onSpeakNormal={() => speakCurrentPrompt(false)} onSpeakSlow={() => speakCurrentPrompt(true)} />

            {currentTask.type === 'fill-blank' ? (
              <Box mt="5">
                <Button size="sm" borderRadius="full" variant="outline" borderColor="#FDE68A" color="#92400E" aria-expanded={showHint} onClick={() => { onWhaleMoodChange?.('encourage'); setShowHint((open) => !open); }}>
                  Gợi ý
                </Button>
                <Collapse in={showHint} animateOpacity>
                  <Box mt="3" border="1px solid" borderColor="#FDE68A" bg="#FFFBEB" borderRadius="xl" p="4">
                    <Text color="#92400E" fontWeight="700">{currentTask.hint}</Text>
                  </Box>
                </Collapse>
              </Box>
            ) : null}

            <Box mt="6">
              <Text mb="2" color={COLORS.muted} fontSize="sm" fontWeight="800">Câu bạn gõ</Text>
              <Input
                data-testid="practice-typing-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={getPlaceholder(currentTask)}
                aria-label="Nhập câu trả lời luyện gõ"
                size="lg"
                borderRadius="2xl"
                borderColor={checked ? (isCurrentCorrect ? COLORS.green : '#FDBA74') : COLORS.border}
                bg="#F8FAFC"
                color={COLORS.text}
                _focus={{ borderColor: COLORS.primary, boxShadow: `0 0 0 1px ${COLORS.primary}` }}
                isDisabled={checked}
              />
              <Text mt="2" fontSize={{ base: 'xs', md: 'sm' }} color={COLORS.muted}>Mẹo: Nhấn Enter để kiểm tra, đúng rồi thì Enter lần nữa để đi tiếp. R làm lại; Escape xóa ô nhập.</Text>
            </Box>

            {checked ? (
              <Box mt="6" border="1px solid" borderColor={isCurrentCorrect ? '#BBF7D0' : '#FED7AA'} bg={isCurrentCorrect ? '#F0FDF4' : '#FFF7ED'} borderRadius="2xl" p="5" role="status" aria-live="polite">
                <Text fontSize="lg" fontWeight="900" color={isCurrentCorrect ? '#166534' : '#9A3412'}>
                  {isCurrentCorrect ? 'Chính xác!' : 'Gần rồi, mình xem lại thứ tự từ hoặc dấu nháy nhé.'}
                </Text>
                <Text mt="2" color={COLORS.text}><b>Đáp án đúng:</b> {currentTask.answer}</Text>
                {!isCurrentCorrect ? <Text mt="1" color={COLORS.text}><b>Bạn vừa gõ:</b> {input.trim() || '(trống)'}</Text> : null}
                {!isCurrentCorrect ? <Text mt="2" color="#9A3412" fontWeight="800">{heartLossText ?? 'Bạn mất 1 bọt biển.'} Cá voi vẫn bơi cùng bạn — thử lại nhịp tiếp theo nhé.</Text> : null}
                <Text mt="3" color={isCurrentCorrect ? '#166534' : '#9A3412'} fontWeight="700">
                  {isCurrentCorrect ? 'Đọc to câu này một lần để khóa phản xạ.' : 'Hãy bấm Nghe chậm hoặc đọc lại phần mẫu câu.'}
                </Text>
                <HStack mt="4" wrap="wrap">
                  <Button data-testid="practice-typing-next" onClick={commitCurrentResult} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
                    Câu tiếp theo
                  </Button>
                  <Button data-testid="practice-typing-retry" onClick={retryCurrent} borderRadius="full" variant="outline">
                    Làm lại câu này
                  </Button>
                  <Button onClick={() => speakEnglish(currentTask.answer, 0.86)} borderRadius="full" variant="outline">
                    Nghe đáp án
                  </Button>
                </HStack>
              </Box>
            ) : (
              <Flex mt="6" gap="3" wrap="wrap">
                <Button data-testid="practice-typing-check" onClick={checkCurrent} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }} isDisabled={!input.trim()}>
                  Kiểm tra
                </Button>
                {currentTask.type === 'listen-type' ? (
                  <Button onClick={() => { onWhaleMoodChange?.('encourage'); speakCurrentPrompt(true); }} borderRadius="full" variant="outline">
                    Nghe chậm
                  </Button>
                ) : null}
              </Flex>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

function TaskPrompt({
  task,
  checked,
  onSpeakNormal,
  onSpeakSlow,
}: {
  task: TypingTask;
  checked: boolean;
  onSpeakNormal: () => void;
  onSpeakSlow: () => void;
}) {
  if (task.type === 'listen-type') {
    return (
      <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="5">
        <Text color={COLORS.muted} fontWeight="800">Nghe và gõ lại</Text>
        <Text mt="2" fontSize="lg" fontWeight="800" color={COLORS.text}>{task.promptVi}</Text>
        <HStack mt="4" wrap="wrap">
          <Button onClick={onSpeakNormal} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
            Nghe câu
          </Button>
          <Button onClick={onSpeakSlow} borderRadius="full" variant="outline">
            Nghe chậm
          </Button>
        </HStack>
        {!checked ? <Text mt="3" color={COLORS.muted} fontSize="sm">Đáp án sẽ chỉ hiện sau khi bạn kiểm tra.</Text> : null}
      </Box>
    );
  }

  if (task.type === 'fill-blank') {
    return (
      <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="5">
        <Text color={COLORS.muted} fontWeight="800">Điền vào chỗ trống</Text>
        <Text mt="2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color={COLORS.text}>{task.prompt}</Text>
      </Box>
    );
  }

  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="5">
      <Text color={COLORS.muted} fontWeight="800">Nghĩa tiếng Việt</Text>
      <Text mt="2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color={COLORS.text}>{task.meaningVi}</Text>
      {checked ? (
        <Button mt="4" onClick={onSpeakNormal} borderRadius="full" variant="outline">
          Nghe đáp án
        </Button>
      ) : null}
    </Box>
  );
}

function TypingSummary({
  lesson,
  total,
  correctCount,
  wrongCount,
  percentage,
  wrongResults,
  onRestartAll,
  onRestartWrong,
}: {
  lesson: EnglishLesson;
  total: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  wrongResults: TaskResult[];
  onRestartAll: () => void;
  onRestartWrong: () => void;
}) {
  const feedback = getPracticeSessionFeedback({
    lesson,
    mode: 'type',
    total,
    correct: correctCount,
    wrong: wrongCount,
    percentage,
    weakItemIds: wrongResults.map((result) => result.taskId),
    nextMode: wrongResults.length > 0 ? 'type' : 'listen',
  });

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
      <Box maxW="980px" mx="auto">
        <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
          <Badge colorScheme="blue" borderRadius="full" px="3" py="1">Hoàn thành gõ câu</Badge>
          <Text mt="4" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="900" color={COLORS.text}>{percentage}%</Text>
          <Text mt="2" fontSize="lg" fontWeight="800" color={COLORS.text}>{getSummaryMessage(percentage)}</Text>

          <SimpleGrid columns={{ base: 1, md: 4 }} gap="4" mt="6">
            <SummaryMetric label="Tổng câu" value={total} />
            <SummaryMetric label="Đúng" value={correctCount} tone="green" />
            <SummaryMetric label="Sai" value={wrongCount} tone="red" />
            <SummaryMetric label="Tỷ lệ" value={`${percentage}%`} />
          </SimpleGrid>

          <PracticeSessionFeedbackCard feedback={feedback} />

          <Box mt="7">
            <Text fontSize="xl" fontWeight="900" color={COLORS.text}>Câu cần ôn lại</Text>
            {wrongResults.length === 0 ? (
              <Box mt="3" border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4">
                <Text color="#166534" fontWeight="800">Không có câu sai. Bạn có thể chuyển sang luyện nghe hoặc phản xạ.</Text>
              </Box>
            ) : (
              <VStack align="stretch" gap="3" mt="3">
                {wrongResults.map((result) => (
                  <Box key={result.taskId} border="1px solid" borderColor="#FED7AA" bg="#FFF7ED" borderRadius="2xl" p="4">
                    <Text color="#9A3412" fontWeight="900">{result.prompt}</Text>
                    <Text mt="2" color={COLORS.text}><b>Bạn gõ:</b> {result.userAnswer || '(trống)'}</Text>
                    <Text color={COLORS.text}><b>Đáp án đúng:</b> {result.answer}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          <Flex mt="7" gap="3" wrap="wrap">
            <Button onClick={onRestartWrong} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }} isDisabled={wrongResults.length === 0}>
              Ôn lại câu sai
            </Button>
            <Button onClick={onRestartAll} borderRadius="full" variant="outline">
              Làm lại toàn bộ
            </Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=listen`} borderRadius="full" variant="outline">
              Luyện nghe lại
            </Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=reflex`} borderRadius="full" variant="outline">
              Luyện phản xạ
            </Button>
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" variant="outline">
              Quay về bài học
            </Button>
            <Button as={Link} to="/learning-path" borderRadius="full" variant="outline">
              Xem lộ trình
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function SummaryMetric({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'red' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'red' ? '#9A3412' : COLORS.text;

  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="4">
      <Text color={COLORS.muted} fontSize="sm" fontWeight="800">{label}</Text>
      <Text mt="1" color={color} fontSize="2xl" fontWeight="900">{value}</Text>
    </Box>
  );
}
