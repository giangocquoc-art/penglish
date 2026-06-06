import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, HStack, Icon, Input, Progress, SimpleGrid, Tag, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, CheckCircle2, Headphones, Mic2, Sparkles, Volume2, XCircle, Zap } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { OceanMascot } from '../components/p-english/OceanMascot';
import {
  completeInteractiveLesson,
  getInteractiveLessonByLessonId,
  getInteractiveLessonByUnit,
  isInteractiveAnswerCorrect,
  recordInteractiveStep,
  startInteractiveLesson,
  type InteractiveLessonResult,
  type InteractiveLessonStep,
} from '../lib/p-english/interactiveLessonEngine';

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

function StepRenderer({ step, pickedWords, inputValue, onInputChange, onAnswer, onToggleWord }: {
  step: InteractiveLessonStep;
  pickedWords: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAnswer: (answer: string) => void;
  onToggleWord: (word: string) => void;
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
          <Text fontSize="sm" fontWeight="900" color={COLORS.blue} textTransform="uppercase" letterSpacing="0.12em">Flashcard</Text>
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
        <Input data-testid="interactive-lesson-fill-input" value={inputValue} onChange={(event) => onInputChange(event.target.value)} size="lg" borderRadius="2xl" bg="white" borderColor={COLORS.border} placeholder="Gõ đáp án..." />
        <Button data-testid="interactive-lesson-check-button" size="lg" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(inputValue)} _hover={{ bg: '#185BB2' }}>
          Kiểm tra
        </Button>
      </VStack>
    );
  }

  if (step.type === 'sentence_order') {
    const remainingWords = (step.words || []).filter((word, index) => pickedWords.filter((picked) => picked === word).length < (step.words || []).slice(0, index + 1).filter((item) => item === word).length);
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{step.prompt || step.vietnamese}</Text>
        <Flex minH="58px" p="3" borderRadius="2xl" bg="#F8FCFF" border="1px dashed #7DD3FC" gap="2" wrap="wrap">
          {pickedWords.length ? pickedWords.map((word, index) => <Tag key={`${word}-${index}`} size="lg" borderRadius="full" bg="#DBEAFE" color={COLORS.blue}>{word}</Tag>) : <Text color={COLORS.muted} fontWeight="750">Chạm từ bên dưới để xếp câu...</Text>}
        </Flex>
        <Flex gap="2" wrap="wrap">
          {remainingWords.map((word, index) => (
            <Button key={`${word}-${index}`} borderRadius="full" onClick={() => onToggleWord(word)}>{word}</Button>
          ))}
        </Flex>
        <HStack gap="3" wrap="wrap">
          <Button borderRadius="full" variant="outline" onClick={() => onInputChange('')}>Làm lại</Button>
          <Button data-testid="interactive-lesson-check-button" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(pickedWords.join(' '))} _hover={{ bg: '#185BB2' }}>
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
  const [stepIndex, setStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [pickedWords, setPickedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation?: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [weakItems, setWeakItems] = useState<InteractiveLessonStep[]>([]);
  const [result, setResult] = useState<InteractiveLessonResult | null>(null);

  useEffect(() => {
    if (lesson) startInteractiveLesson(lesson);
  }, [lesson]);

  const step = lesson?.steps[stepIndex];
  const progress = lesson ? Math.round(((stepIndex + 1) / lesson.steps.length) * 100) : 0;

  useEffect(() => {
    setFeedback(null);
    setInputValue('');
    setPickedWords([]);
  }, [stepIndex]);

  if (!lesson || !step) {
    return (
      <OceanPageShell variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px="4" py="8">
        <Box maxW="760px" mx="auto" className="penglish-glass-card" bg="rgba(255,255,255,0.86)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="950" color={COLORS.text}>Poo chưa mở được bài này</Text>
          <Text mt="2" color={COLORS.muted} fontWeight="700">Node này đang được chuẩn bị nội dung. Hãy quay lại lộ trình để chọn bài đang mở.</Text>
          <Button as={Link} to="/learning-path" mt="6" borderRadius="full" bg={COLORS.blue} color="white">Quay lại lộ trình</Button>
        </Box>
      </OceanPageShell>
    );
  }

  const handleAnswer = (answer: string) => {
    if (feedback || step.type === 'summary') return;
    const correct = isInteractiveAnswerCorrect(step, answer);
    recordInteractiveStep(lesson, step, correct, answer);
    if (step.type !== 'intro') {
      setTotalAnswered((value) => value + 1);
      if (correct) setCorrectCount((value) => value + 1);
      if (!correct) setWeakItems((items) => [...items, step]);
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

  const handleToggleWord = (word: string) => {
    setPickedWords((words) => [...words, word]);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (step.type === 'sentence_order' && value === '') setPickedWords([]);
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
            <Flex justify="center" mb="4"><OceanMascot mascot="poo" pose="celebrate" size="lg" decorative motion="celebrate" /></Flex>
            <Tag borderRadius="full" bg="#FEF3C7" color="#B45309" px="4" py="2" fontWeight="950"><Icon as={Zap} boxSize="4" /> +{safeResult.xp} XP</Tag>
            <Text mt="4" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.05">Hoàn thành bài học!</Text>
            <Text mt="3" color={COLORS.muted} fontWeight="750" lineHeight="1.7">Poo đã lưu tiến độ, cộng nhịp học và đưa phần sai vào Khu luyện tập/Sổ tay từ vựng.</Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="3" mt="6">
              <Box p="4" borderRadius="2xl" bg="#EFF6FF" border="1px solid #BFDBFE"><Text fontWeight="950" color={COLORS.blue}>{safeResult.correctCount}/{Math.max(1, safeResult.totalAnswered)}</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">Đáp án đúng</Text></Box>
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
            <OceanMascot mascot="poo" pose={feedback?.correct === false ? 'thinking' : 'idle'} size="md" decorative motion="float" />
          </HStack>
          <Progress value={progress} size="sm" borderRadius="full" colorScheme="blue" bg="#E0F2FE" mb="5" />
          <Box data-testid="interactive-lesson-card" p={{ base: '3', md: '5' }} borderRadius="3xl" bg="linear-gradient(135deg, rgba(248,252,255,0.86), rgba(255,255,255,0.92))" border="1px solid #BAE6FD">
            <Tag mb="3" borderRadius="full" bg="#E0F2FE" color="#0369A1" fontWeight="950"><Icon as={Sparkles} boxSize="4" /> Màn {stepIndex + 1}/{lesson.steps.length}</Tag>
            <Text mb="2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>{step.title}</Text>
            <Text mb="5" color={COLORS.muted} fontWeight="750" lineHeight="1.65">{step.instruction}</Text>
            <StepRenderer step={step} pickedWords={pickedWords} inputValue={inputValue} onInputChange={handleInputChange} onAnswer={handleAnswer} onToggleWord={handleToggleWord} />
            {feedback ? <FeedbackBox correct={feedback.correct} explanation={feedback.explanation} /> : null}
            {feedback ? (
              <Button data-testid="interactive-lesson-continue-button" mt="4" w={{ base: '100%', md: 'auto' }} size="lg" borderRadius="full" bg={COLORS.green} color="white" onClick={handleContinue} _hover={{ bg: '#15803D' }}>
                Tiếp tục
              </Button>
            ) : null}
          </Box>
        </Box>
      </Box>
    </OceanPageShell>
  );
}
