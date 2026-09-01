import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Flex, HStack, Icon, Input, Progress, SimpleGrid, Tag, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, CheckCircle2, Headphones, Mic2, RotateCcw, Sparkles, Volume2, XCircle, Zap } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { PooSystemState } from '../components/p-english/PooSystemState';
import {
  completeInteractiveLesson,
  getInteractiveLessonByLessonId,
  getInteractiveLessonByUnit,
  isInteractiveAnswerCorrect,
  recordInteractiveStep,
  startInteractiveLesson,
  type InteractiveLesson,
  type InteractiveLessonResult,
  type InteractiveLessonStep,
} from '../lib/p-english/interactiveLessonEngine';
import { getLessonProgress } from '../lib/p-english/lesson-progress';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  blue: '#1F6FD6',
  sky: '#2F9EEB',
  green: '#16A34A',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#BAE6FD',
};

function speakEnglish(text?: string, slow = false) {
  if (typeof window === 'undefined' || !text?.trim()) return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = slow ? 0.72 : 0.9;
  synth.cancel();
  synth.speak(utterance);
}

function getResumeStepIndex(lesson: InteractiveLesson | null): number {
  if (!lesson) return 0;
  const record = getLessonProgress()[lesson.sourceLesson.id];
  if (!record || record.status === 'completed' || !record.completedSteps.length) return 0;
  const lastIndex = lesson.steps.length - 1;
  const index = lesson.steps.findIndex((step, i) => i > 0 && i < lastIndex && !record.completedSteps.includes(step.id));
  return index >= 1 ? index : lastIndex - 1;
}

function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function FeedbackBox({ correct, explanation }: { correct: boolean; explanation?: string }) {
  return (
    <Box
      data-testid="interactive-lesson-feedback"
      mt="4"
      p={{ base: '3', md: '4' }}
      borderRadius="2xl"
      bg={correct ? '#F0FDF4' : '#FFF7ED'}
      border="1px solid"
      borderColor={correct ? '#BBF7D0' : '#FED7AA'}
      role="status"
      aria-live="polite"
    >
      <HStack align="start" gap="3">
        <Icon as={correct ? CheckCircle2 : XCircle} color={correct ? COLORS.green : COLORS.amber} boxSize="5" mt="0.5" />
        <Box>
          <Text fontWeight="950" color={correct ? '#166534' : '#9A3412'}>
            {correct ? 'Poo nói: Chuẩn rồi!' : 'Poo nói: Chưa sao, mình sửa ngay nhé.'}
          </Text>
          <Text mt="1" color={COLORS.muted} fontWeight="700" lineHeight="1.6">
            {explanation || (correct ? 'Bạn đã qua màn này. Bấm tiếp tục để học bước kế.' : 'Đáp án này sẽ được đưa vào phần ôn tập để bạn gặp lại sau.')}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}

type SentenceWordToken = { id: string; text: string };

function getSentenceWordTokens(step: InteractiveLessonStep): SentenceWordToken[] {
  return (step.words || []).map((text, index) => ({ id: `${step.id}-token-${index}`, text }));
}

function StepRenderer({ step, pickedWordIds, inputValue, fillBlankInputRef, onInputChange, onAnswer, onToggleWord, onRemoveWord }: {
  step: InteractiveLessonStep;
  pickedWordIds: string[];
  inputValue: string;
  fillBlankInputRef: RefObject<HTMLInputElement>;
  onInputChange: (value: string) => void;
  onAnswer: (answer: string) => void;
  onToggleWord: (tokenId: string) => void;
  onRemoveWord: (tokenId: string) => void;
}) {
  if (step.type === 'intro') {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.08">{step.prompt}</Text>
        <Text color={COLORS.muted} fontWeight="750" lineHeight="1.75">{step.explanation}</Text>
        <Button data-testid="interactive-lesson-start-button" size="lg" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer('start')} _hover={{ bg: '#185BB2' }}>
          Bắt đầu học ngay
        </Button>
      </VStack>
    );
  }

  if (step.type === 'flashcard') {
    return (
      <VStack align="stretch" gap="4">
        <Box p={{ base: '5', md: '7' }} borderRadius="3xl" bg="linear-gradient(135deg, #EFF6FF, #FFFFFF)" border="1px solid #BFDBFE" textAlign="center">
          <Text fontSize="sm" fontWeight="900" color={COLORS.blue} textTransform="uppercase" letterSpacing="0.12em">Thẻ từ</Text>
          <Text mt="3" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" color={COLORS.text}>{step.prompt}</Text>
          {step.hint ? <Text mt="2" color={COLORS.muted} fontWeight="800">{step.hint}</Text> : null}
          <Text mt="4" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color={COLORS.green}>{step.vietnamese || step.answer}</Text>
          {step.english ? <Text mt="2" color={COLORS.muted} fontWeight="750">{step.english}</Text> : null}
        </Box>
        <HStack gap="3" wrap="wrap" justify="center">
          <Button borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={() => speakEnglish(step.prompt || step.english)}>
            Nghe Poo đọc
          </Button>
          <Button data-testid="interactive-lesson-remember-button" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(step.answer || step.prompt || 'remember')} _hover={{ bg: '#185BB2' }}>
            Đã nhớ
          </Button>
        </HStack>
      </VStack>
    );
  }

  if (step.type === 'multiple_choice' || step.type === 'listen_choose') {
    return (
      <VStack align="stretch" gap="4">
        {step.type === 'listen_choose' ? (
          <Button alignSelf="start" size="lg" borderRadius="full" leftIcon={<Icon as={Headphones} />} bg="#E0F2FE" color="#0369A1" onClick={() => speakEnglish(step.english || step.answer)}>
            Nghe câu
          </Button>
        ) : null}
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.18">{step.prompt}</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {(step.options || []).map((option) => (
            <Button key={option} data-testid="interactive-lesson-answer-option" minH="58px" h="auto" whiteSpace="normal" borderRadius="2xl" bg="white" border="1px solid #BAE6FD" color={COLORS.text} justifyContent="flex-start" p="4" onClick={() => onAnswer(option)} _hover={{ bg: '#EFF6FF' }}>
              {option}
            </Button>
          ))}
        </SimpleGrid>
      </VStack>
    );
  }

  if (step.type === 'fill_blank') {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{step.prompt}</Text>
        {step.hint ? <Text color={COLORS.muted} fontWeight="750">Gợi ý: {step.hint}</Text> : null}
        <Input ref={fillBlankInputRef} data-testid="interactive-lesson-fill-input" value={inputValue} onChange={(event) => onInputChange(event.target.value)} size="lg" borderRadius="2xl" bg="white" borderColor={COLORS.border} placeholder="Gõ đáp án..." />
        <Text mt="-2" fontSize={{ base: 'xs', md: 'sm' }} color={COLORS.muted} fontWeight="750">Mẹo: Nhấn Enter để kiểm tra, đúng rồi thì Enter lần nữa để đi tiếp.</Text>
        <Button data-testid="interactive-lesson-check-button" size="lg" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(inputValue)} isDisabled={!inputValue.trim()} _hover={{ bg: '#185BB2' }}>
          Kiểm tra
        </Button>
      </VStack>
    );
  }

  if (step.type === 'sentence_order') {
    const wordTokens = getSentenceWordTokens(step);
    const tokensById = new Map(wordTokens.map((token) => [token.id, token]));
    const pickedTokens = pickedWordIds.map((tokenId) => tokensById.get(tokenId)).filter((token): token is SentenceWordToken => Boolean(token));
    const pickedIdSet = new Set(pickedWordIds);
    const remainingTokens = wordTokens.filter((token) => !pickedIdSet.has(token.id));
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{step.prompt || step.vietnamese}</Text>
        <Flex minH="58px" p="3" borderRadius="2xl" bg="#F8FCFF" border="1px dashed #7DD3FC" gap="2" wrap="wrap">
          {pickedTokens.length ? pickedTokens.map((token) => (
            <Tag
              as="button"
              type="button"
              key={token.id}
              data-testid="interactive-lesson-picked-word-token"
              data-token-id={token.id}
              size="lg"
              borderRadius="full"
              bg="#DBEAFE"
              color={COLORS.blue}
              cursor="pointer"
              onClick={() => onRemoveWord(token.id)}
              aria-label={`Bỏ từ ${token.text}`}
            >
              {token.text}
            </Tag>
          )) : <Text color={COLORS.muted} fontWeight="750">Chạm từ bên dưới để xếp câu...</Text>}
        </Flex>
        <Flex gap="2" wrap="wrap">
          {remainingTokens.map((token) => (
            <Button key={token.id} data-testid="interactive-lesson-word-token" data-token-id={token.id} borderRadius="full" onClick={() => onToggleWord(token.id)}>{token.text}</Button>
          ))}
        </Flex>
        <HStack gap="3" wrap="wrap">
          <Button borderRadius="full" variant="outline" onClick={() => onInputChange('')}>Làm lại</Button>
          <Button data-testid="interactive-lesson-check-button" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(pickedTokens.map((token) => token.text).join(' '))} _hover={{ bg: '#185BB2' }}>
            Kiểm tra
          </Button>
        </HStack>
      </VStack>
    );
  }

  if (step.type === 'speak_repeat') {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{step.prompt}</Text>
        <Box p="4" borderRadius="2xl" bg="#F8FCFF" border="1px solid #BAE6FD">
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.blue}>{step.answer}</Text>
          {step.hint ? <Text mt="2" color={COLORS.muted} fontWeight="750">{step.hint}</Text> : null}
        </Box>
        <HStack gap="3" wrap="wrap">
          <Button borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={() => speakEnglish(step.answer, true)}>Nghe chậm</Button>
          <Button data-testid="interactive-lesson-speak-done-button" borderRadius="full" leftIcon={<Icon as={Mic2} />} bg={COLORS.blue} color="white" onClick={() => onAnswer(step.answer || 'spoken')} _hover={{ bg: '#185BB2' }}>
            Mình đã nói xong
          </Button>
        </HStack>
      </VStack>
    );
  }

  return null;
}

export function InteractiveLessonPage() {
  const { unitId, nodeId, lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = useMemo(() => {
    if (unitId) return getInteractiveLessonByUnit(unitId, nodeId);
    if (lessonId) return getInteractiveLessonByLessonId(lessonId);
    return null;
  }, [unitId, nodeId, lessonId]);
  const resumeStepIndex = useMemo(() => getResumeStepIndex(lesson), [lesson]);
  const [stepIndex, setStepIndex] = useState(() => resumeStepIndex);
  const [inputValue, setInputValue] = useState('');
  const [pickedWordIds, setPickedWordIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation?: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [selfCompletedCount, setSelfCompletedCount] = useState(0);
  const [weakItems, setWeakItems] = useState<InteractiveLessonStep[]>([]);
  const [recordedSteps, setRecordedSteps] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<InteractiveLessonResult | null>(null);

  const fillBlankInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lesson) startInteractiveLesson(lesson);
  }, [lesson]);

  const step = lesson?.steps[stepIndex];
  const progress = lesson ? Math.round(((stepIndex + 1) / lesson.steps.length) * 100) : 0;

  useEffect(() => {
    setFeedback(null);
    setInputValue('');
    setPickedWordIds([]);
  }, [stepIndex]);

  useEffect(() => {
    if (step?.type !== 'fill_blank' || feedback) return;
    const focusTimer = window.setTimeout(() => fillBlankInputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [feedback, step?.id, step?.type]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName.toLowerCase();
        if (tagName === 'textarea' || tagName === 'select' || target.isContentEditable) return;
      }
      if (!step || step.type === 'summary') return;
      if (feedback) {
        event.preventDefault();
        handleContinue();
        return;
      }
      if (step.type !== 'fill_blank' || !inputValue.trim()) return;
      event.preventDefault();
      handleAnswer(inputValue);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [feedback, inputValue, step]);

  if (!lesson || !step) {
    return (
      <OceanPageShell data-testid="interactive-lesson-unavailable-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px="4" py="8">
        <Box maxW="760px" mx="auto" className="penglish-glass-card" bg="rgba(255,255,255,0.86)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" data-testid="interactive-lesson-unavailable-state">
          <PooSystemState
            variant="error"
            title="Poo chưa mở được bài này"
            description="Bài này đang được chuẩn bị nội dung hoặc đường dẫn đã thay đổi. Hãy quay lại lộ trình để chọn bài đang mở."
            actionLabel="Quay lại lộ trình"
            actionTo="/learning-path"
          />
        </Box>
      </OceanPageShell>
    );
  }

  const handleAnswer = (answer: string) => {
    if (step.type === 'summary') return;
    const correct = isInteractiveAnswerCorrect(step, answer);
    const firstAttempt = !recordedSteps.has(step.id);
    if (firstAttempt) {
      // Chỉ lưu kết quả một lần để làm lại không bị lặp trong ôn tập / XP.
      setRecordedSteps((seen) => new Set(seen).add(step.id));
      recordInteractiveStep(lesson, step, correct, answer);
      // Thẻ từ và bước nói lại do bạn tự đánh dấu nên không tính vào điểm đúng/sai.
      if (step.type === 'flashcard' || step.type === 'speak_repeat') {
        setSelfCompletedCount((value) => value + 1);
      } else if (step.type !== 'intro') {
        setTotalAnswered((value) => value + 1);
        if (correct) setCorrectCount((value) => value + 1);
        if (!correct) setWeakItems((items) => [...items, step]);
      }
    }
    setFeedback({ correct, explanation: correct ? step.explanation : `Đáp án đúng: ${step.answer || 'hãy nghe/đọc lại mẫu'}. ${step.explanation || ''}` });
  };

  const handleContinue = () => {
    if (stepIndex >= lesson.steps.length - 2) {
      const completed = completeInteractiveLesson(lesson, correctCount, totalAnswered, weakItems);
      setResult(completed);
      setStepIndex(lesson.steps.length - 1);
      return;
    }
    setStepIndex((value) => value + 1);
  };

  const handleRetry = () => {
    setFeedback(null);
    setInputValue('');
    setPickedWordIds([]);
  };

  const handleToggleWord = (tokenId: string) => {
    setFeedback(null);
    setPickedWordIds((tokenIds) => tokenIds.includes(tokenId) ? tokenIds : [...tokenIds, tokenId]);
  };

  const handleRemoveWord = (tokenId: string) => {
    setFeedback(null);
    setPickedWordIds((tokenIds) => tokenIds.filter((id) => id !== tokenId));
  };

  const handleInputChange = (value: string) => {
    setFeedback(null);
    setInputValue(value);
    if (step.type === 'sentence_order' && value === '') setPickedWordIds([]);
  };

  if (step.type === 'summary') {
    const safeResult: InteractiveLessonResult = result ?? {
      lessonId: lesson.sourceLesson.id,
      unitId: lesson.unitId,
      xp: lesson.xp + Math.max(0, correctCount * 2),
      correctCount,
      totalAnswered,
      weakItems,
    };
    return (
      <OceanPageShell data-testid="interactive-lesson-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '3', md: '6' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 96px)', lg: '8' }}>
        <Box maxW="860px" mx="auto">
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '8' }} textAlign="center">
            <Flex justify="center" mb="4"><OceanMascot mascot="poo" pose="reward" size="lg" decorative motion="celebrate" /></Flex>
            <Tag borderRadius="full" bg="#FEF3C7" color="#B45309" px="4" py="2" fontWeight="950"><Icon as={Zap} boxSize="4" /> +{safeResult.xp} XP</Tag>
            <Text mt="4" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.05">Hoàn thành bài học!</Text>
            <Text mt="3" color={COLORS.muted} fontWeight="750" lineHeight="1.7">Poo đã lưu tiến độ, cộng nhịp học và đưa phần sai vào Khu luyện tập/Sổ tay từ vựng.</Text>
            <SimpleGrid columns={{ base: 1, md: selfCompletedCount > 0 ? 4 : 3 }} gap="3" mt="6">
              <Box p="4" borderRadius="2xl" bg="#EFF6FF" border="1px solid #BFDBFE"><Text fontWeight="950" color={COLORS.blue}>{safeResult.correctCount}/{Math.max(1, safeResult.totalAnswered)}</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">Đáp án đúng</Text></Box>
              {selfCompletedCount > 0 ? <Box p="4" borderRadius="2xl" bg="#E0F2FE" border="1px solid #BAE6FD"><Text fontWeight="950" color="#0369A1">{selfCompletedCount}</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">Số bước tự đánh dấu</Text></Box> : null}
              <Box p="4" borderRadius="2xl" bg="#F0FDF4" border="1px solid #BBF7D0"><Text fontWeight="950" color={COLORS.green}>{safeResult.weakItems.length}</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">Mục cần ôn</Text></Box>
              <Box p="4" borderRadius="2xl" bg="#FFFBEB" border="1px solid #FDE68A"><Text fontWeight="950" color="#B45309">3–7 phút</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">Một bài hoàn chỉnh</Text></Box>
            </SimpleGrid>
            <HStack justify="center" mt="7" gap="3" wrap="wrap">
              <Button as={Link} to="/practice" borderRadius="full" bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }}>Ôn trong Khu luyện tập</Button>
              <Button as={Link} to="/words" borderRadius="full" variant="outline">Xem Sổ tay từ vựng</Button>
              <Button borderRadius="full" variant="ghost" onClick={() => navigate('/learning-path')}>Về lộ trình</Button>
            </HStack>
          </Box>
        </Box>
      </OceanPageShell>
    );
  }

  return (
    <OceanPageShell data-testid="interactive-lesson-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '2', md: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 104px)', lg: '8' }} overflowX="hidden">
      <Box maxW="920px" mx="auto">
        <HStack mb="3" justify="space-between" gap="3">
          <Button as={Link} to="/learning-path" size="sm" borderRadius="full" variant="ghost" leftIcon={<Icon as={ArrowLeft} />}>Lộ trình</Button>
          <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.blue} px="3" py="1.5" fontWeight="950">{lesson.level}</Tag>
        </HStack>
        <Box className="penglish-glass-card" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '4', md: '6' }} boxShadow="0 18px 46px rgba(31,111,214,0.10)">
          <HStack justify="space-between" align="start" gap="4" mb="4">
            <Box minW="0">
              <Text fontSize="sm" fontWeight="950" color={COLORS.blue} textTransform="uppercase" letterSpacing="0.12em">Bài học tương tác</Text>
              <Text fontSize={{ base: 'xl', md: '3xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.12">{lesson.title}</Text>
              <Text mt="1" color={COLORS.muted} fontWeight="700">{lesson.duration} · +{lesson.xp} XP</Text>
            </Box>
            <OceanMascot mascot="poo" pose={feedback?.correct === false ? 'coach' : 'idle'} size="md" decorative motion="float" />
          </HStack>
          <Progress value={progress} size="sm" borderRadius="full" colorScheme="blue" bg="#E0F2FE" mb="5" />
          {resumeStepIndex > 0 ? (
            <Box mb="4" p="3" borderRadius="2xl" bg="#F0FDF4" border="1px solid #BBF7D0">
              <HStack gap="2" align="start">
                <Icon as={RotateCcw} color={COLORS.green} boxSize="5" mt="0.5" />
                <Text color="#166534" fontWeight="800">Poo đã lưu bài trước: mình học tiếp từ màn {stepIndex + 1} nhé!</Text>
              </HStack>
            </Box>
          ) : null}
          <Box data-testid="interactive-lesson-card" p={{ base: '3', md: '5' }} borderRadius="3xl" bg="linear-gradient(135deg, rgba(248,252,255,0.86), rgba(255,255,255,0.92))" border="1px solid #BAE6FD">
            <Tag mb="3" borderRadius="full" bg="#E0F2FE" color="#0369A1" fontWeight="950"><Icon as={Sparkles} boxSize="4" /> Màn {stepIndex + 1}/{lesson.steps.length}</Tag>
            <Text mb="2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>{step.title}</Text>
            <Text mb="5" color={COLORS.muted} fontWeight="750" lineHeight="1.65">{step.instruction}</Text>
            <StepRenderer step={step} pickedWordIds={pickedWordIds} inputValue={inputValue} fillBlankInputRef={fillBlankInputRef} onInputChange={handleInputChange} onAnswer={handleAnswer} onToggleWord={handleToggleWord} onRemoveWord={handleRemoveWord} />
            {feedback ? <FeedbackBox correct={feedback.correct} explanation={feedback.explanation} /> : null}
            {feedback ? (
              <HStack mt="4" gap="3" wrap="wrap">
                <Button data-testid="interactive-lesson-continue-button" w={{ base: '100%', md: 'auto' }} size="lg" borderRadius="full" bg={COLORS.green} color="white" onClick={handleContinue} _hover={{ bg: '#15803D' }}>
                  Tiếp tục
                </Button>
                {!feedback.correct ? (
                  <Button data-testid="interactive-lesson-retry-button" w={{ base: '100%', md: 'auto' }} size="lg" borderRadius="full" variant="outline" leftIcon={<Icon as={RotateCcw} />} onClick={handleRetry}>
                    Thử lại
                  </Button>
                ) : null}
              </HStack>
            ) : null}
          </Box>
        </Box>
      </Box>
    </OceanPageShell>
  );
}
