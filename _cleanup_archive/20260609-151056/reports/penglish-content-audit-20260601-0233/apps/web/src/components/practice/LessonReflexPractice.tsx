import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Box, Button, Collapse, Flex, HStack, Icon, Input, Progress, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, CheckCircle2, Lightbulb, RotateCcw, Volume2, XCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loseHeart } from '../../lib/p-english/learning-hearts';
import type { EnglishLesson, SpeakingReflexPrompt } from '../../lib/p-english/lesson-content-data';
import { recordPracticeSessionMemory } from '../../lib/p-english/localSkillMemory';
import { getPracticeSessionFeedback } from '../../lib/p-english/practiceSessionFeedback';
import { PracticeSessionFeedbackCard } from './PracticeSessionFeedbackCard';
import type { WhaleMood } from '../streak/AdaptiveWhaleStreak';

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

type ReflexProgress = {
  attempts: number;
  correctPromptIds: string[];
  wrongPromptIds: string[];
  lastScore: number;
  lastPercentage: number;
  lastCompletedAt: string;
};

type LessonProgress = {
  reflex?: ReflexProgress;
  [key: string]: unknown;
};

type PromptState = {
  answer: string;
  checked: boolean;
  isCorrect: boolean;
  hintVisible: boolean;
  heartLossText?: string;
};

function progressKey(lessonId: string) {
  return `p-english:lesson-progress:${lessonId}`;
}

function isTypingGuardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

function canUseSpeech() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function speakEnglish(text: string) {
  if (!canUseSpeech()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.86;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

function safeReadProgress(lessonId: string): LessonProgress {
  try {
    const raw = localStorage.getItem(progressKey(lessonId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function safeWriteProgress(lessonId: string, updater: (current: LessonProgress) => LessonProgress) {
  try {
    const current = safeReadProgress(lessonId);
    localStorage.setItem(progressKey(lessonId), JSON.stringify(updater(current)));
  } catch {
    // localStorage may be unavailable; reflex practice still works in memory.
  }
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

function acceptedAnswers(prompt: SpeakingReflexPrompt) {
  return Array.from(new Set([prompt.expectedEnglish, ...prompt.acceptableAnswers]));
}

function isCorrectAnswer(prompt: SpeakingReflexPrompt, answer: string) {
  const normalized = normalizeAnswer(answer);
  if (!normalized) return false;
  return acceptedAnswers(prompt).some((item) => normalizeAnswer(item) === normalized);
}

function makeInitialStates(prompts: SpeakingReflexPrompt[]) {
  return prompts.reduce<Record<string, PromptState>>((acc, prompt) => {
    acc[prompt.id] = {
      answer: '',
      checked: false,
      isCorrect: false,
      hintVisible: false,
    };
    return acc;
  }, {});
}

function summaryMessage(percentage: number) {
  if (percentage >= 80) return 'Phản xạ tốt! Bạn có thể chuyển sang gõ câu hoặc luyện tốc độ.';
  if (percentage >= 50) return 'Ổn rồi, hãy ôn lại các câu sai một lượt.';
  return 'Nên quay lại Flashcard và Listening trước khi luyện phản xạ lại.';
}

export function LessonReflexPractice({ lesson, onWhaleMoodChange }: { lesson: EnglishLesson; onWhaleMoodChange?: (mood: WhaleMood) => void }) {
  const allPrompts = lesson.speakingReflexPrompts;
  const [prompts, setPrompts] = useState<SpeakingReflexPrompt[]>(allPrompts);
  const [states, setStates] = useState(() => makeInitialStates(allPrompts));
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [savedSummary, setSavedSummary] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const currentPrompt = prompts[currentIndex];
  const currentState = currentPrompt ? states[currentPrompt.id] : undefined;

  const correctPromptIds = useMemo(
    () => prompts.filter((prompt) => states[prompt.id]?.checked && states[prompt.id]?.isCorrect).map((prompt) => prompt.id),
    [prompts, states],
  );
  const wrongPrompts = useMemo(
    () => prompts.filter((prompt) => states[prompt.id]?.checked && !states[prompt.id]?.isCorrect),
    [prompts, states],
  );
  const checkedCount = useMemo(() => prompts.filter((prompt) => states[prompt.id]?.checked).length, [prompts, states]);
  const progressValue = prompts.length === 0 ? 0 : ((showSummary ? prompts.length : currentIndex) / prompts.length) * 100;

  useEffect(() => {
    setSpeechSupported(canUseSpeech());
    return () => {
      if (canUseSpeech()) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!started || showSummary) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [currentIndex, showSummary, started]);

  useEffect(() => {
    if (!showSummary || savedSummary || prompts.length === 0) return;

    const lastScore = correctPromptIds.length;
    const lastPercentage = Math.round((lastScore / prompts.length) * 100);
    const wrongPromptIds = prompts.filter((prompt) => !states[prompt.id]?.isCorrect).map((prompt) => prompt.id);

    safeWriteProgress(lesson.id, (current) => ({
      ...current,
      reflex: {
        attempts: ((current.reflex as ReflexProgress | undefined)?.attempts ?? 0) + 1,
        correctPromptIds,
        wrongPromptIds,
        lastScore,
        lastPercentage,
        lastCompletedAt: new Date().toISOString(),
      },
    }));

    recordPracticeSessionMemory({
      lessonId: lesson.id,
      lessonTitleVi: lesson.titleVi,
      mode: 'reflex',
      total: prompts.length,
      correct: lastScore,
      wrong: wrongPromptIds.length,
      percentage: lastPercentage,
      weakItemIds: wrongPromptIds,
    });

    setSavedSummary(true);
  }, [correctPromptIds, lesson.id, lesson.titleVi, prompts, savedSummary, showSummary, states]);

  const updateState = (promptId: string, patch: Partial<PromptState>) => {
    setStates((prev) => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        ...patch,
      },
    }));
  };

  const checkCurrent = () => {
    if (!currentPrompt || !currentState || currentState.checked) return;
    const correct = isCorrectAnswer(currentPrompt, currentState.answer);
    const hearts = correct ? undefined : loseHeart('reflex-wrong');
    onWhaleMoodChange?.(correct ? 'correct' : 'mistake');
    updateState(currentPrompt.id, { checked: true, isCorrect: correct, hintVisible: true, heartLossText: hearts ? `Bạn mất 1 bọt biển. Còn ${hearts.heartsLeft}/${hearts.maxHearts} bọt biển.` : undefined });
  };

  const goNext = () => {
    if (currentIndex >= prompts.length - 1) {
      onWhaleMoodChange?.('celebrate');
      setShowSummary(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
  };

  const resetCurrent = () => {
    if (!currentPrompt) return;
    onWhaleMoodChange?.('encourage');
    updateState(currentPrompt.id, { answer: '', checked: false, isCorrect: false, hintVisible: false });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const playCurrent = () => {
    if (!currentPrompt) return;
    const ok = speakEnglish(currentPrompt.expectedEnglish);
    setSpeechSupported(ok);
  };

  const restartWith = (nextPrompts: SpeakingReflexPrompt[]) => {
    const safePrompts = nextPrompts.length > 0 ? nextPrompts : allPrompts;
    setPrompts(safePrompts);
    setStates(makeInitialStates(safePrompts));
    setCurrentIndex(0);
    setStarted(true);
    setShowSummary(false);
    setSavedSummary(false);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!started || showSummary || !currentPrompt || isTypingGuardTarget(event.target)) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (currentState?.checked) goNext();
        else checkCurrent();
        return;
      }

      if (event.key === 'Escape' && !currentState?.checked) {
        event.preventDefault();
        updateState(currentPrompt.id, { answer: '' });
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'r') {
        event.preventDefault();
        resetCurrent();
        return;
      }
      if (key === 'n' && currentState?.checked) {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentPrompt, currentState, showSummary, started]);

  if (allPrompts.length === 0) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color={COLORS.text}>Bài học này chưa có dữ liệu phản xạ.</Text>
          <Text mt="2" color={COLORS.muted}>Hãy quay lại bài học hoặc chọn chế độ khác.</Text>
          <HStack mt="6" wrap="wrap">
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }}>
              Quay về bài học
            </Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=listen`} borderRadius="full" variant="outline">
              Luyện nghe lại
            </Button>
          </HStack>
        </Box>
      </Box>
    );
  }

  if (!started) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
        <Box maxW="980px" mx="auto">
          <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
            <HStack wrap="wrap" gap="2" mb="4">
              <Badge borderRadius="full" colorScheme="blue" px="3" py="1">Reflex</Badge>
              <Badge borderRadius="full" bg="#DCFCE7" color="#166534" px="3" py="1">Unit 1</Badge>
            </HStack>
            <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="950" color={COLORS.text}>Phản xạ nhanh</Text>
            <Text mt="2" fontSize="xl" fontWeight="800" color={COLORS.text}>{lesson.titleVi}</Text>
            <Text mt="1" color={COLORS.muted}>{lesson.titleEn}</Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4" mt="7">
              <Metric label="Tổng prompt" value={allPrompts.length} />
              <Metric label="Kỹ năng" value="Typing reflex" />
              <Metric label="Audio mẫu" value="speechSynthesis" />
            </SimpleGrid>

            <Box mt="7" border="1px solid" borderColor="#BFDBFE" bg="#EFF6FF" borderRadius="2xl" p="5">
              <Text color={COLORS.text} fontWeight="800">Bạn sẽ thấy câu tiếng Việt và gõ nhanh câu tiếng Anh tương ứng. Ưu tiên bật ra cả cụm, không dịch từng chữ.</Text>
              {!speechSupported ? <Text mt="3" color={COLORS.amber} fontSize="sm" fontWeight="700">Trình duyệt này chưa hỗ trợ nghe câu mẫu.</Text> : null}
            </Box>

            <Flex mt="8" gap="3" wrap="wrap">
              <Button leftIcon={<Icon as={Zap} />} borderRadius="full" bg={COLORS.primary} color="white" size="lg" _hover={{ bg: '#1D4ED8' }} onClick={() => setStarted(true)}>
                Bắt đầu phản xạ
              </Button>
              <Button as={Link} to={`/lessons/${lesson.id}`} leftIcon={<Icon as={ArrowLeft} />} borderRadius="full" variant="outline" size="lg">
                Quay về bài học
              </Button>
            </Flex>
          </Box>
        </Box>
      </Box>
    );
  }

  if (showSummary) {
    return (
      <ReflexSummary
        lesson={lesson}
        prompts={prompts}
        states={states}
        onRestartWrong={() => restartWith(wrongPrompts)}
        onRestartAll={() => restartWith(allPrompts)}
      />
    );
  }

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} pb="12">
      <Box maxW="980px" mx="auto">
        <VStack align="stretch" gap="5">
          <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '7' }}>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4">
              <Box>
                <HStack wrap="wrap" gap="2" mb="2">
                  <Badge borderRadius="full" colorScheme="blue" px="3" py="1">Phản xạ nhanh</Badge>
                  <Badge borderRadius="full" bg="#DCFCE7" color="#166534" px="3" py="1">{currentIndex + 1}/{prompts.length}</Badge>
                </HStack>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{lesson.titleVi}</Text>
                <Text color={COLORS.muted}>{lesson.titleEn}</Text>
              </Box>
              <HStack wrap="wrap" gap="4">
                <Metric label="Đúng" value={correctPromptIds.length} tone="green" compact />
                <Metric label="Sai" value={wrongPrompts.length} tone="red" compact />
              </HStack>
            </Flex>
            <Progress mt="5" value={progressValue} colorScheme="blue" borderRadius="full" bg="#E2E8F0" />
            <Text mt="4" color={COLORS.muted}>Đọc to câu đúng 2 lần trước khi sang câu tiếp.</Text>
            {!speechSupported ? <Text mt="3" color={COLORS.amber} fontSize="sm" fontWeight="700">Trình duyệt này chưa hỗ trợ nghe câu mẫu.</Text> : null}
          </Box>

          {currentPrompt && currentState ? (
            <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '8' }}>
              <HStack wrap="wrap" gap="2" mb="4">
                <Badge borderRadius="full" px="3" py="1" bg="#EFF6FF" color={COLORS.primary}>Prompt {currentIndex + 1}</Badge>
                <Badge borderRadius="full" px="3" py="1" bg={currentPrompt.difficulty === 'medium' ? '#FEF3C7' : '#DCFCE7'} color={currentPrompt.difficulty === 'medium' ? '#92400E' : '#166534'}>
                  {currentPrompt.difficulty}
                </Badge>
              </HStack>

              <Text fontSize="sm" fontWeight="800" color={COLORS.muted} textTransform="uppercase" letterSpacing="wide">Tiếng Việt</Text>
              <Text mt="2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{currentPrompt.promptVi}</Text>

              <Box mt="6">
                <Input
                  ref={inputRef}
                  placeholder="Gõ câu tiếng Anh..."
                  aria-label="Nhập câu tiếng Anh cho phản xạ nhanh"
                  value={currentState.answer}
                  isDisabled={currentState.checked}
                  minH="56px"
                  fontSize="lg"
                  borderRadius="2xl"
                  borderColor={COLORS.border}
                  bg="#FFFFFF"
                  onChange={(event) => updateState(currentPrompt.id, { answer: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      if (currentState.checked) goNext();
                      else checkCurrent();
                      return;
                    }
                    if (event.key === 'Escape' && !currentState.checked) {
                      event.preventDefault();
                      updateState(currentPrompt.id, { answer: '' });
                      return;
                    }
                    const key = event.key.toLowerCase();
                    if (key === 'r') {
                      event.preventDefault();
                      resetCurrent();
                      return;
                    }
                    if (key === 'n' && currentState.checked) {
                      event.preventDefault();
                      goNext();
                    }
                  }}
                />
              </Box>
              <Text mt="2" fontSize={{ base: 'xs', md: 'sm' }} color={COLORS.muted}>Enter kiểm tra/tiếp; R làm lại; N câu tiếp khi đã có kết quả; Escape xóa ô nhập.</Text>

              <Flex mt="5" gap="3" wrap="wrap">
                {!currentState.checked ? (
                  <Button borderRadius="full" bg={COLORS.green} color="white" _hover={{ bg: '#16A34A' }} isDisabled={!currentState.answer.trim()} onClick={checkCurrent}>
                    Kiểm tra
                  </Button>
                ) : (
                  <>
                    <Button borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} onClick={goNext}>
                      Câu tiếp theo
                    </Button>
                    <Button borderRadius="full" variant="outline" onClick={resetCurrent}>
                      Làm lại câu này
                    </Button>
                    <Button leftIcon={<Icon as={Volume2} />} borderRadius="full" variant="outline" onClick={playCurrent}>
                      Nghe câu mẫu
                    </Button>
                  </>
                )}
                <Button leftIcon={<Icon as={Lightbulb} />} borderRadius="full" variant="ghost" color={COLORS.amber} aria-expanded={currentState.hintVisible} onClick={() => { onWhaleMoodChange?.('encourage'); updateState(currentPrompt.id, { hintVisible: !currentState.hintVisible }); }}>
                  Gợi ý
                </Button>
              </Flex>

              <Collapse in={currentState.hintVisible} animateOpacity>
                <Box mt="5" border="1px solid" borderColor="#FDE68A" bg="#FFFBEB" borderRadius="2xl" p="4">
                  <Text color="#92400E" fontWeight="800">{currentPrompt.hint}</Text>
                </Box>
              </Collapse>

              {currentState.checked ? (
                <Box mt="6" border="1px solid" borderColor={currentState.isCorrect ? '#BBF7D0' : '#FED7AA'} bg={currentState.isCorrect ? '#F0FDF4' : '#FFF7ED'} borderRadius="2xl" p="5" role="status" aria-live="polite">
                  <HStack align="start" gap="3">
                    <Icon as={currentState.isCorrect ? CheckCircle2 : XCircle} color={currentState.isCorrect ? COLORS.green : '#EA580C'} />
                    <Box w="100%">
                      <Text fontWeight="900" color={COLORS.text}>{currentState.isCorrect ? 'Phản xạ tốt!' : 'Gần đúng rồi, xem lại cụm mẫu.'}</Text>
                      {!currentState.isCorrect ? <Text mt="2" color={COLORS.muted}>Your answer: <Text as="span" fontWeight="900" color={COLORS.text}>{currentState.answer || '—'}</Text></Text> : null}
                      <Text mt="2" color={COLORS.muted}>Expected: <Text as="span" fontWeight="900" color={COLORS.text}>{currentPrompt.expectedEnglish}</Text></Text>
                      {!currentState.isCorrect ? (
                        <Text mt="2" color={COLORS.muted}>Acceptable: <Text as="span" fontWeight="800" color={COLORS.text}>{acceptedAnswers(currentPrompt).join(' / ')}</Text></Text>
                      ) : null}
                      {!currentState.isCorrect ? <Text mt="2" color="#9A3412" fontWeight="800">{currentState.heartLossText ?? 'Bạn mất 1 bọt biển.'} Cá voi vẫn bơi cùng bạn — thử lại nhịp tiếp theo nhé.</Text> : null}
                      {!currentState.isCorrect ? <Text mt="3" color={COLORS.muted} fontSize="sm">Hãy đọc to câu đúng 2 lần rồi bấm Câu tiếp theo.</Text> : null}
                      {currentState.isCorrect ? (
                        <Button mt="4" leftIcon={<Icon as={Volume2} />} size="sm" borderRadius="full" variant="outline" onClick={playCurrent}>
                          Nghe câu mẫu
                        </Button>
                      ) : null}
                    </Box>
                  </HStack>
                </Box>
              ) : null}
            </Box>
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}

function ReflexSummary({
  lesson,
  prompts,
  states,
  onRestartWrong,
  onRestartAll,
}: {
  lesson: EnglishLesson;
  prompts: SpeakingReflexPrompt[];
  states: Record<string, PromptState>;
  onRestartWrong: () => void;
  onRestartAll: () => void;
}) {
  const correctPrompts = prompts.filter((prompt) => states[prompt.id]?.isCorrect);
  const wrongPrompts = prompts.filter((prompt) => !states[prompt.id]?.isCorrect);
  const percentage = prompts.length === 0 ? 0 : Math.round((correctPrompts.length / prompts.length) * 100);
  const feedback = getPracticeSessionFeedback({
    lesson,
    mode: 'reflex',
    total: prompts.length,
    correct: correctPrompts.length,
    wrong: wrongPrompts.length,
    percentage,
    weakItemIds: wrongPrompts.map((prompt) => prompt.id),
    nextMode: wrongPrompts.length > 0 ? 'reflex' : 'speed',
  });

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
      <Box maxW="980px" mx="auto">
        <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
          <Badge borderRadius="full" colorScheme="green" px="3" py="1">Hoàn thành phản xạ</Badge>
          <Text mt="4" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="950" color={COLORS.text}>Tổng kết Reflex</Text>
          <Text mt="2" color={COLORS.muted}>{summaryMessage(percentage)}</Text>

          <SimpleGrid columns={{ base: 1, md: 4 }} gap="4" mt="6">
            <Metric label="Tổng prompt" value={prompts.length} />
            <Metric label="Đúng" value={correctPrompts.length} tone="green" />
            <Metric label="Sai" value={wrongPrompts.length} tone="red" />
            <Metric label="Tỷ lệ" value={`${percentage}%`} />
          </SimpleGrid>

          <PracticeSessionFeedbackCard feedback={feedback} />

          <Box mt="7">
            <Text fontSize="lg" fontWeight="900" color={COLORS.text}>Câu cần ôn lại</Text>
            {wrongPrompts.length === 0 ? (
              <Box mt="3" border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4">
                <Text color={COLORS.text} fontWeight="800">Không có câu sai. Bạn có thể chuyển sang gõ câu hoặc luyện tốc độ.</Text>
              </Box>
            ) : (
              <VStack align="stretch" gap="3" mt="3">
                {wrongPrompts.map((prompt) => (
                  <Box key={prompt.id} border="1px solid" borderColor="#FED7AA" bg="#FFF7ED" borderRadius="2xl" p="4">
                    <Text fontWeight="900" color={COLORS.text}>{prompt.promptVi}</Text>
                    <Text mt="2" color={COLORS.muted}>Your answer: <Text as="span" fontWeight="900" color={COLORS.text}>{states[prompt.id]?.answer || '—'}</Text></Text>
                    <Text mt="1" color={COLORS.muted}>Expected: <Text as="span" fontWeight="900" color={COLORS.text}>{prompt.expectedEnglish}</Text></Text>
                    <Text mt="1" color={COLORS.muted}>Acceptable: <Text as="span" fontWeight="800" color={COLORS.text}>{acceptedAnswers(prompt).join(' / ')}</Text></Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          <Flex mt="7" gap="3" wrap="wrap">
            <Button leftIcon={<Icon as={Zap} />} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} isDisabled={wrongPrompts.length === 0} onClick={onRestartWrong}>
              Ôn lại câu sai
            </Button>
            <Button leftIcon={<Icon as={RotateCcw} />} borderRadius="full" variant="outline" onClick={onRestartAll}>
              Làm lại toàn bộ
            </Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=listen`} borderRadius="full" bg={COLORS.green} color="white" _hover={{ bg: '#16A34A' }}>
              Luyện nghe lại
            </Button>
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" variant="outline">
              Quay về bài học
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function Metric({ label, value, tone, compact }: { label: string; value: string | number; tone?: 'green' | 'red'; compact?: boolean }) {
  const color = tone === 'green' ? COLORS.green : tone === 'red' ? '#9A3412' : COLORS.text;
  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p={compact ? '3' : '4'} minW={compact ? '96px' : undefined}>
      <Text fontSize={compact ? 'xl' : '2xl'} fontWeight="950" color={color}>{value}</Text>
      <Text mt="1" fontSize="sm" color={COLORS.muted}>{label}</Text>
    </Box>
  );
}
