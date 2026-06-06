import { Box, Button, Flex, HStack, Icon, Input, Progress, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, Headphones, Mic, Play, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { OceanPageShell } from '../../components/p-english/OceanPageShell';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import { Foundation48AudioPlayer } from './Foundation48AudioPlayer';
import { FOUNDATION48_BASE_PATH, foundation48Days, getFoundation48Day, getFoundation48DayPath } from './foundation48Data';
import { foundation48DeepLessons } from './foundation48DeepLessons';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48DayProgress, markFoundation48Completed, markFoundation48Started, markFoundation48StepCompleted, recordFoundation48ChallengeResult } from './foundation48Progress';
import type { Foundation48Challenge, Foundation48Day, Foundation48LessonStep } from './foundation48Types';

const COLORS = { text: '#102A43', muted: '#52667A', blue: '#1F6FD6', border: '#BAE6FD', green: '#16A34A', coral: '#F9735B' };

type SpeechRecognitionResultLike = {
  readonly isFinal?: boolean;
  readonly 0: { readonly transcript: string; readonly confidence?: number };
};

type SpeechRecognitionEventLike = {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  readonly error?: string;
  readonly message?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function Foundation48DayPage() {
  const params = useParams();
  const dayNumber = Number(params.dayNumber);
  const day = Number.isFinite(dayNumber) ? getFoundation48Day(dayNumber) : undefined;
  const [version, setVersion] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(true);
  const progress = useMemo(() => day ? getFoundation48DayProgress(day.dayNumber) : {}, [day, version]);
  const steps = useMemo(() => day ? buildFoundation48Steps(day) : [], [day]);

  useEffect(() => {
    if (day) markFoundation48Started(day.dayNumber);
  }, [day]);

  useEffect(() => {
    setStepIndex(0);
    setCanContinue(true);
  }, [day?.dayNumber]);

  useEffect(() => {
    setCanContinue(!steps[stepIndex]?.challenge);
  }, [stepIndex, steps]);

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener('storage', refresh);
    window.addEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refresh);
    };
  }, []);

  if (!day) return <Navigate to={FOUNDATION48_BASE_PATH} replace />;

  const previousDay = day.dayNumber > 1 ? day.dayNumber - 1 : null;
  const nextDay = day.dayNumber < foundation48Days.length ? day.dayNumber + 1 : null;
  const completed = Boolean(progress.completed);
  const currentStep = steps[stepIndex] ?? steps[0];
  const completedSteps = new Set(progress.completedSteps || []);
  const stepPercent = steps.length > 0 ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0;
  const challengeCount = steps.filter((step) => step.challenge).length;
  const rightCount = Object.values(progress.challengeResults || {}).filter((item) => item.correct).length;

  function goNext() {
    if (!day || !currentStep) return;
    markFoundation48StepCompleted(day.dayNumber, currentStep.id);
    if (stepIndex < steps.length - 1) {
      setStepIndex((value) => value + 1);
      return;
    }
    markFoundation48Completed(day.dayNumber, steps.map((step) => step.id), challengeCount ? Math.round((rightCount / challengeCount) * 100) : undefined);
  }

  function completeDay() {
    if (!day) return;
    markFoundation48Completed(day.dayNumber, steps.map((step) => step.id), challengeCount ? Math.round((rightCount / challengeCount) * 100) : undefined);
    setStepIndex(steps.length - 1);
  }

  return (
    <OceanPageShell data-testid="foundation48-day-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pt={{ base: '2', md: '0' }} pb={{ base: 'var(--penglish-mobile-safe-bottom)', lg: '8' }}>
      <Box maxW="960px" mx="auto" minW="0">
        <Button as={Link} to={FOUNDATION48_BASE_PATH} leftIcon={<Icon as={ChevronLeft} />} variant="ghost" color={COLORS.blue} borderRadius="full" mb="3">
          Về lộ trình 48 ngày
        </Button>

        <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '4', md: '6' }} bg="rgba(255,255,255,0.84)" mb="4" overflow="hidden" position="relative">
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 18%, rgba(102,217,200,0.16), transparent 30%)" pointerEvents="none" />
          <Flex position="relative" justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
            <Box minW="0" flex="1">
              <HStack gap="2" wrap="wrap">
                <Text px="3" py="1.5" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="950" fontSize="xs">Ngày {day.dayNumber}</Text>
                <Text px="3" py="1.5" borderRadius="full" bg={completed ? '#ECFDF5' : '#F8FAFC'} color={completed ? COLORS.green : COLORS.muted} fontWeight="950" fontSize="xs">{completed ? 'Đã hoàn thành' : `Bước ${stepIndex + 1}/${steps.length}`}</Text>
                <Text px="3" py="1.5" borderRadius="full" bg="#FFF7ED" color="#B45309" fontWeight="950" fontSize="xs">{rightCount}/{challengeCount} câu đúng</Text>
              </HStack>
              <Text as="h1" mt="2" color={COLORS.text} fontSize={{ base: '2xl', md: '4xl' }} lineHeight="1.08" fontWeight="950">
                {day.title}
              </Text>
              <Text mt="2" color={COLORS.muted} fontWeight="750" lineHeight="1.55">Chặng {day.stageId}: {day.stageTitle}</Text>
              <Box mt="4">
                <HStack justify="space-between" mb="1">
                  <Text fontSize="xs" color={COLORS.muted} fontWeight="900">Tiến độ lesson flow</Text>
                  <Text fontSize="xs" color={COLORS.blue} fontWeight="950">{stepIndex + 1}/{steps.length}</Text>
                </HStack>
                <Progress value={stepPercent} colorScheme="blue" borderRadius="full" h="9px" bg="#E8F4FF" />
              </Box>
            </Box>
            <Box display={{ base: 'none', md: 'block' }}>
              {completed ? <OceanMascot mascot="saoNhi" pose="reward" size="md" decorative motion="celebrate" /> : <OceanMascot mascot="poo" size="md" decorative motion="float" />}
            </Box>
          </Flex>
        </Box>

        <LessonStepperCard day={day} step={currentStep} completed={completedSteps.has(currentStep?.id)} onReadyChange={setCanContinue} />

        <Flex mt="4" justify="space-between" align={{ base: 'stretch', sm: 'center' }} gap="3" direction={{ base: 'column', sm: 'row' }}>
          <Button leftIcon={<Icon as={ArrowLeft} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} borderRadius="full" isDisabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))}>
            Quay lại
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button rightIcon={<Icon as={ArrowRight} />} bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} borderRadius="full" onClick={goNext} isDisabled={!canContinue}>
              Tiếp tục
            </Button>
          ) : (
            <Button data-testid="foundation48-complete-day" leftIcon={<Icon as={completed ? Sparkles : CheckCircle2} />} colorScheme={completed ? 'green' : 'blue'} borderRadius="full" onClick={completeDay}>
              {completed ? 'Đã hoàn thành' : 'Hoàn thành ngày học'}
            </Button>
          )}
        </Flex>

        {completed ? (
          <Box mt="4" className="penglish-glass-card" border="1px solid" borderColor="#BBF7D0" borderRadius="3xl" p="4" bg="rgba(240,253,244,0.86)" data-testid="foundation48-completion-panel">
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="3" direction={{ base: 'column', md: 'row' }}>
              <HStack gap="3" align="center">
                <OceanMascot mascot="saoNhi" pose="reward" size="sm" decorative motion="celebrate" />
                <Box>
                  <Text color={COLORS.green} fontWeight="950">Đã lưu ngày {day.dayNumber}</Text>
                  <Text color={COLORS.text} fontWeight="800" lineHeight="1.55">Tiến độ và lỗi sai được giữ trên thiết bị này để ôn lại.</Text>
                </Box>
              </HStack>
              {nextDay ? (
                <Button as={Link} to={getFoundation48DayPath(nextDay)} rightIcon={<Icon as={ArrowRight} />} bg={COLORS.green} color="white" _hover={{ bg: '#15803D' }} borderRadius="full">
                  Sang ngày {nextDay}
                </Button>
              ) : (
                <Button as={Link} to={FOUNDATION48_BASE_PATH} bg={COLORS.green} color="white" _hover={{ bg: '#15803D' }} borderRadius="full">
                  Về lộ trình
                </Button>
              )}
            </Flex>
          </Box>
        ) : null}

        <Flex mt="5" justify="space-between" gap="3" direction={{ base: 'column', sm: 'row' }}>
          {previousDay ? <Button as={Link} to={getFoundation48DayPath(previousDay)} leftIcon={<Icon as={ArrowLeft} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} borderRadius="full">Ngày {previousDay}</Button> : <Box />}
          {nextDay ? <Button as={Link} to={getFoundation48DayPath(nextDay)} rightIcon={<Icon as={ArrowRight} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} borderRadius="full">Ngày {nextDay}</Button> : <Button as={Link} to={FOUNDATION48_BASE_PATH} variant="outline" borderColor={COLORS.border} color={COLORS.blue} borderRadius="full">Về lộ trình</Button>}
        </Flex>
      </Box>
    </OceanPageShell>
  );
}

function LessonStepperCard({ day, step, completed, onReadyChange }: { day: Foundation48Day; step?: Foundation48LessonStep; completed: boolean; onReadyChange: (ready: boolean) => void }) {
  useEffect(() => {
    onReadyChange(!step?.challenge);
  }, [onReadyChange, step?.id, step?.challenge]);

  if (!step) return null;
  const icon = step.type === 'listening' ? Headphones : step.type === 'speaking' ? Mic : step.type === 'complete' ? Sparkles : Play;

  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={completed ? '#BBF7D0' : COLORS.border} borderRadius="3xl" p={{ base: '4', md: '6' }} bg="rgba(255,255,255,0.86)" data-testid={`foundation48-step-${step.type}`} minH={{ base: '360px', md: '420px' }}>
      <VStack align="stretch" gap="4">
        <HStack justify="space-between" align="start" gap="3">
          <HStack gap="3" align="center">
            <Box w="46px" h="46px" borderRadius="2xl" bg="#EFF6FF" color={COLORS.blue} display="grid" placeItems="center" border="1px solid rgba(186,230,253,0.92)">
              <Icon as={icon} boxSize="5" />
            </Box>
            <Box>
              <Text color={COLORS.blue} fontWeight="950" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">{step.type === 'challenge' ? step.challenge?.type : step.type}</Text>
              <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'xl', md: '3xl' }} lineHeight="1.12">{step.title}</Text>
            </Box>
          </HStack>
          {completed ? <Icon as={CheckCircle2} color={COLORS.green} boxSize="5" /> : null}
        </HStack>

        {step.subtitle ? <Text color={COLORS.muted} fontWeight="800" lineHeight="1.6">{step.subtitle}</Text> : null}
        {step.body ? <Text color={COLORS.text} fontWeight="750" lineHeight="1.75" whiteSpace="pre-line">{step.body}</Text> : null}
        {step.bullets?.length ? <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">{step.bullets.map((item) => <Text key={item} border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="3" color={COLORS.text} fontWeight="800" lineHeight="1.6">{item}</Text>)}</SimpleGrid> : null}

        {step.type === 'listening' ? (
          <VStack align="stretch" gap="3">
            <Foundation48AudioPlayer audio={day.audio} compact />
            <SpeakButton text={step.body || day.summary.summary} label="Nghe Poo đọc chậm" slow />
          </VStack>
        ) : null}
        {step.challenge ? <ChallengeCard dayNumber={day.dayNumber} challenge={step.challenge} onReadyChange={onReadyChange} /> : null}
        {step.type === 'complete' ? <CompletePrompt day={day} /> : null}
      </VStack>
    </Box>
  );
}

function ChallengeCard({ dayNumber, challenge, onReadyChange }: { dayNumber: number; challenge: Foundation48Challenge; onReadyChange: (ready: boolean) => void }) {
  const [answer, setAnswer] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    setAnswer('');
    setSelectedTokens([]);
    setFeedback(null);
    onReadyChange(false);
  }, [challenge.id, onReadyChange]);

  const currentAnswer = challenge.type === 'sentence-order' ? selectedTokens.join(' ') : answer;

  function submit(value = currentAnswer) {
    const correct = normalizeAnswer(value) === normalizeAnswer(challenge.answer);
    setFeedback({ correct, message: correct ? 'Đúng rồi! Poo đã lưu bước này.' : `Chưa đúng. Đáp án gợi ý: ${challenge.answer}` });
    recordFoundation48ChallengeResult(dayNumber, challenge, correct, value || '(chưa trả lời)');
    onReadyChange(correct);
  }

  function startSpeechRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setFeedback({ correct: false, message: 'Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Bạn có thể nghe mẫu rồi bấm “Tự đánh dấu đã nói”.' });
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex]?.[0]?.transcript || event.results[0]?.[0]?.transcript || '';
      setAnswer(transcript);
      submit(transcript);
    };
    recognition.onerror = () => setFeedback({ correct: false, message: 'Poo chưa nghe rõ. Thử nói chậm hơn hoặc dùng fallback.' });
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  return (
    <Box border="1px solid" borderColor={feedback?.correct ? '#BBF7D0' : COLORS.border} bg={feedback?.correct ? '#F0FDF4' : '#F8FAFC'} borderRadius="2xl" p={{ base: '4', md: '5' }} data-testid={`foundation48-challenge-${challenge.type}`}>
      <VStack align="stretch" gap="4">
        <HStack justify="space-between" align="start" gap="3">
          <Box minW="0">
            <Text color={COLORS.blue} fontWeight="950" fontSize="xs">THỬ THÁCH</Text>
            <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }}>{challenge.prompt}</Text>
            {challenge.hint ? <Text mt="1" color={COLORS.muted} fontWeight="750">Gợi ý: {challenge.hint}</Text> : null}
          </Box>
          {(challenge.type === 'listen-and-choose' || challenge.type === 'speaking-repeat') ? <SpeakButton text={challenge.target || challenge.answer} label="Nghe mẫu" /> : null}
        </HStack>

        {challenge.type === 'multiple-choice' || challenge.type === 'listen-and-choose' ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            {(challenge.options || []).map((option) => <Button key={option} whiteSpace="normal" h="auto" py="3" borderRadius="2xl" variant={answer === option ? 'solid' : 'outline'} colorScheme={answer === option ? 'blue' : undefined} onClick={() => { setAnswer(option); submit(option); }}>{option}</Button>)}
          </SimpleGrid>
        ) : null}

        {challenge.type === 'fill-blank' ? (
          <HStack gap="3" align={{ base: 'stretch', sm: 'center' }} direction={{ base: 'column', sm: 'row' } as any}>
            <Input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Nhập đáp án..." bg="white" borderColor={COLORS.border} borderRadius="full" fontWeight="850" onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} />
            <Button bg={COLORS.blue} color="white" borderRadius="full" onClick={() => submit()} flexShrink={0}>Kiểm tra</Button>
          </HStack>
        ) : null}

        {challenge.type === 'sentence-order' ? (
          <VStack align="stretch" gap="3">
            <Flex minH="54px" gap="2" wrap="wrap" border="1px solid" borderColor={COLORS.border} bg="white" borderRadius="2xl" p="3">
              {selectedTokens.length ? selectedTokens.map((token, index) => <Button key={`${token}-${index}`} size="sm" borderRadius="full" colorScheme="blue" onClick={() => setSelectedTokens((tokens) => tokens.filter((_, itemIndex) => itemIndex !== index))}>{token}</Button>) : <Text color={COLORS.muted} fontWeight="800">Bấm các từ bên dưới để xếp câu.</Text>}
            </Flex>
            <Flex gap="2" wrap="wrap">
              {(challenge.tokens || []).map((token, index) => <Button key={`${token}-${index}`} size="sm" borderRadius="full" variant="outline" borderColor={COLORS.border} onClick={() => setSelectedTokens((tokens) => [...tokens, token])}>{token}</Button>)}
            </Flex>
            <HStack gap="2" wrap="wrap">
              <Button leftIcon={<Icon as={RotateCcw} />} variant="outline" borderColor={COLORS.border} borderRadius="full" onClick={() => setSelectedTokens([])}>Làm lại</Button>
              <Button bg={COLORS.blue} color="white" borderRadius="full" onClick={() => submit()}>Kiểm tra</Button>
            </HStack>
          </VStack>
        ) : null}

        {challenge.type === 'speaking-repeat' ? (
          <VStack align="stretch" gap="3">
            <HStack gap="2" wrap="wrap">
              <Button leftIcon={<Icon as={Mic} />} bg={COLORS.blue} color="white" borderRadius="full" onClick={startSpeechRecognition} isLoading={listening} loadingText="Đang nghe">Nói và chấm</Button>
              <Button variant="outline" borderColor={COLORS.border} borderRadius="full" onClick={() => { setAnswer(challenge.answer); submit(challenge.answer); }}>Tự đánh dấu đã nói</Button>
            </HStack>
            {answer ? <Text color={COLORS.muted} fontWeight="800">Bạn nói/nhập: {answer}</Text> : null}
          </VStack>
        ) : null}

        {feedback ? (
          <Box border="1px solid" borderColor={feedback.correct ? '#86EFAC' : '#FED7AA'} bg={feedback.correct ? '#ECFDF5' : '#FFF7ED'} borderRadius="2xl" p="3" role="status" aria-live="polite">
            <Text color={feedback.correct ? COLORS.green : '#B45309'} fontWeight="950">{feedback.message}</Text>
            {challenge.explanation ? <Text mt="1" color={COLORS.text} fontWeight="750" lineHeight="1.6">{challenge.explanation}</Text> : null}
          </Box>
        ) : null}
      </VStack>
    </Box>
  );
}

function SpeakButton({ text, label, slow }: { text: string; label: string; slow?: boolean }) {
  return (
    <Button leftIcon={<Icon as={Volume2} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" onClick={() => speakEnglish(text, slow)}>
      {label}
    </Button>
  );
}

function CompletePrompt({ day }: { day: Foundation48Day }) {
  return (
    <HStack gap="3" align="start" border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4">
      <OceanMascot mascot="saoNhi" pose="sparkle" size="sm" decorative motion="float" />
      <Box>
        <Text color={COLORS.green} fontWeight="950">Sẵn sàng chốt ngày {day.dayNumber}</Text>
        <Text color={COLORS.text} fontWeight="800" lineHeight="1.6">Bấm “Hoàn thành ngày học” để lưu tiến độ. Nếu có lỗi sai, P-English sẽ giữ lại để bạn ôn.</Text>
      </Box>
    </HStack>
  );
}

function speakEnglish(text: string, slow = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/___/g, 'blank'));
  utterance.lang = 'en-US';
  utterance.rate = slow ? 0.72 : 0.92;
  window.speechSynthesis.speak(utterance);
}

function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/[.,!?;:'"“”‘’]/g, '').replace(/\s+/g, ' ').trim();
}

function buildFoundation48Steps(day: Foundation48Day): Foundation48LessonStep[] {
  const deepLesson = foundation48DeepLessons[day.dayNumber];

  if (deepLesson?.readiness === 'complete') {
    const listeningChallenges = deepLesson.listening.map((item): Foundation48Challenge => ({
      id: item.id,
      type: 'listen-and-choose',
      prompt: item.question,
      target: item.text,
      answer: item.answer,
      options: item.options,
      hint: `Nghĩa: ${item.meaningVi}`,
      explanation: 'Nghe cả cụm câu rồi chọn đúng câu bạn vừa nghe. Nếu sai, Poo sẽ giữ lại để ôn.',
    }));
    const speakingChallenges = deepLesson.speaking.map((item): Foundation48Challenge => ({
      id: item.id,
      type: 'speaking-repeat',
      prompt: `Nói lại: ${item.meaningVi}`,
      target: item.text,
      answer: item.text,
      hint: item.focus,
      explanation: 'Mục tiêu là nói rõ chủ ngữ, động từ và nhịp câu. Câu yếu sẽ được đưa vào vòng ôn.',
    }));
    const quizChallenges = deepLesson.quiz.map((item): Foundation48Challenge => ({
      id: item.id,
      type: item.type,
      prompt: item.prompt,
      target: item.target,
      answer: item.answer,
      options: item.options,
      tokens: item.tokens,
      hint: item.hint,
      explanation: item.explanation,
    }));
    const challenges = [...listeningChallenges, ...speakingChallenges, ...quizChallenges];
    const patternBullets = deepLesson.patterns.flatMap((item) => [`${item.pattern} — ${item.meaningVi}`, ...item.examples.slice(0, 1)]).slice(0, 10);
    const vocabularyBullets = deepLesson.vocabulary.map((item) => `${item.term} — ${item.meaningVi}. Ví dụ: ${item.example}`);

    const steps: Foundation48LessonStep[] = [
      { id: 'intro', type: 'intro', title: deepLesson.learnerTitle, subtitle: 'Bài học thật cho người mới: từ vựng, mẫu câu, nghe, nói và mini test.', body: deepLesson.goalVi },
      { id: 'explain', type: 'explain', title: deepLesson.grammarPoint.title, subtitle: 'Poo giải thích bằng tiếng Việt trước khi luyện.', body: deepLesson.grammarPoint.explanationVi, bullets: deepLesson.grammarPoint.examples },
      { id: 'patterns', type: 'example', title: 'Mẫu câu cần nhớ', subtitle: 'Đọc mẫu chậm, chú ý trật tự từ.', bullets: patternBullets },
      { id: 'vocabulary', type: 'practice', title: 'Từ/cụm dùng ngay', subtitle: `${deepLesson.vocabulary.length} từ và cụm chính của ngày ${day.dayNumber}.`, bullets: vocabularyBullets },
      { id: 'listening-overview', type: 'listening', title: 'Nghe 5 câu mẫu', subtitle: 'Nghe Poo đọc chậm trước, sau đó làm từng câu nghe chọn đáp án.', body: deepLesson.listening.map((item) => item.text).join(' ') },
      { id: 'speaking-overview', type: 'speaking', title: 'Nói nhại 5 câu', subtitle: 'Nói thành tiếng để tạo phản xạ, không chỉ đọc thầm.', bullets: deepLesson.speaking.map((item) => `${item.text} — ${item.focus}`) },
    ];

    challenges.forEach((challenge, index) => {
      steps.push({ id: challenge.id, type: challenge.type === 'speaking-repeat' ? 'speaking' : 'challenge', title: challengeTitle(challenge, index), subtitle: challengeSubtitle(challenge), challenge });
    });

    steps.push({
      id: 'complete',
      type: 'complete',
      title: 'Tổng kết và ôn lại',
      subtitle: deepLesson.review.next,
      body: [...deepLesson.summary, 'Cần nhớ:', ...deepLesson.review.remember].join('\n• '),
    });
    return steps;
  }

  const polished = day.polished;
  const keyPoints = polished?.formulas?.length ? polished.formulas : day.summary.keyPoints;
  const examples = polished?.examples?.length ? polished.examples : day.summary.examples;
  const practice = polished?.practiceQuestions?.length ? polished.practiceQuestions : day.summary.practice;
  const summary = polished?.goal || day.summary.summary;
  const explanation = polished?.explanation || day.summary.summary;
  const finalTask = polished?.finalTask || day.summary.finalTask;
  const challenges = buildFoundation48Challenges(day);

  const steps: Foundation48LessonStep[] = [
    { id: 'intro', type: 'intro', title: `Ngày ${day.dayNumber}: bài học đang mở rộng`, subtitle: 'Ngày này đã có lộ trình an toàn; nội dung sâu sẽ được Poo bổ sung dần.', body: summary },
    { id: 'explain', type: 'explain', title: 'Poo giải thích nhanh', subtitle: 'Nắm khung chính trước khi làm bài.', body: explanation, bullets: keyPoints },
    { id: 'example', type: 'example', title: 'Ví dụ mẫu dễ nhớ', subtitle: 'Đọc chậm từng câu, chú ý chủ ngữ và từ khóa.', bullets: examples },
    { id: 'practice', type: 'practice', title: 'Chuẩn bị mini test', subtitle: 'Nhìn mẫu và tự dự đoán đáp án trước khi làm thử thách.', bullets: practice.slice(0, 4) },
  ];

  if (day.audio.length > 0) {
    steps.push({ id: 'listening', type: 'listening', title: 'Nghe', subtitle: 'Nghe file của ngày này hoặc nghe Poo đọc chậm.', body: examples[0] || summary });
  } else {
    steps.push({ id: 'listening-tts', type: 'listening', title: 'Nghe', subtitle: 'Dùng giọng đọc tự động của trình duyệt để làm quen âm và nhịp.', body: examples.slice(0, 2).join(' ') || summary });
  }

  challenges.forEach((challenge, index) => {
    steps.push({ id: challenge.id, type: challenge.type === 'speaking-repeat' ? 'speaking' : 'challenge', title: challengeTitle(challenge, index), subtitle: challengeSubtitle(challenge), challenge });
  });

  steps.push({ id: 'complete', type: 'complete', title: 'Hoàn thành ngày học', subtitle: 'Nhiệm vụ cuối ngày', body: finalTask });
  return steps;
}

function buildFoundation48Challenges(day: Foundation48Day): Foundation48Challenge[] {
  const polished = day.polished;
  const examples = polished?.examples?.length ? polished.examples : day.summary.examples;
  const formulas = polished?.formulas?.length ? polished.formulas : day.summary.keyPoints;
  const dailyTest = polished?.dailyTest?.length ? polished.dailyTest : day.summary.practice;
  const firstExample = examples[0] || 'I am a student.';
  const secondExample = examples[1] || 'She is happy.';
  const fill = inferFillBlank(firstExample);
  const miniTestTarget = formulas[0] || firstExample;

  return [
    {
      id: `day-${day.dayNumber}-listen`,
      type: 'listen-and-choose',
      prompt: 'Nghe câu mẫu rồi chọn đúng câu bạn nghe.',
      target: firstExample,
      answer: firstExample,
      options: uniqueOptions([firstExample, secondExample, mutateSentence(firstExample), mutateSentence(secondExample)]),
      hint: 'Bấm “Nghe mẫu” nếu cần nghe lại.',
      explanation: 'Nghe nhiều lần giúp bạn nhớ chunk thay vì học rời từng chữ.',
    },
    {
      id: `day-${day.dayNumber}-fill`,
      type: 'fill-blank',
      prompt: fill.prompt,
      target: fill.target,
      answer: fill.answer,
      hint: 'Nhập đúng từ/cụm còn thiếu.',
      explanation: 'Điền khuyết buộc bạn chủ động nhớ cấu trúc, không chỉ đọc lướt.',
    },
    {
      id: `day-${day.dayNumber}-order`,
      type: 'sentence-order',
      prompt: 'Sắp xếp các từ thành câu đúng.',
      target: secondExample,
      answer: secondExample,
      tokens: shuffleTokens(secondExample.split(/\s+/), day.dayNumber),
      hint: 'Bấm từ theo đúng thứ tự câu.',
      explanation: 'Xếp câu giúp não nhớ trật tự tiếng Anh.',
    },
    {
      id: `day-${day.dayNumber}-speak`,
      type: 'speaking-repeat',
      prompt: 'Nói lại câu này theo mẫu.',
      target: firstExample,
      answer: firstExample,
      hint: 'Nếu trình duyệt không hỗ trợ microphone, dùng nút fallback.',
      explanation: 'Mục tiêu MVP là tạo thói quen nói thành tiếng mỗi ngày.',
    },
    {
      id: `day-${day.dayNumber}-mini-test`,
      type: 'multiple-choice',
      prompt: dailyTest[0] || 'Mini test: mẫu nào đúng với bài hôm nay?',
      target: miniTestTarget,
      answer: miniTestTarget,
      options: uniqueOptions([miniTestTarget, 'Subject + random word + not', 'Verb + subject + maybe', 'Only translate word by word']),
      hint: 'Chọn mẫu câu đúng nhất trước khi hoàn thành ngày học.',
      explanation: 'Mini test giúp Poo lưu tiến độ và nhắc lại cấu trúc quan trọng nhất của ngày.',
    },
  ];
}

function inferFillBlank(sentence: string) {
  const words = sentence.split(/\s+/).filter(Boolean);
  const index = words.findIndex((word) => ['am', 'is', 'are', 'do', 'does', 'don\'t', 'doesn\'t'].includes(normalizeAnswer(word)));
  const targetIndex = index >= 0 ? index : Math.min(1, words.length - 1);
  const answer = words[targetIndex]?.replace(/[.,!?]$/g, '') || 'is';
  const promptWords = words.map((word, itemIndex) => itemIndex === targetIndex ? '___' : word);
  return { prompt: `Điền từ còn thiếu: ${promptWords.join(' ')}`, target: sentence, answer };
}

function uniqueOptions(options: string[]) {
  return Array.from(new Set(options.filter(Boolean))).slice(0, 4);
}

function mutateSentence(sentence: string) {
  return sentence.replace(/\bam\b/i, 'is').replace(/\bis\b/i, 'are').replace(/\bare\b/i, 'is');
}

function shuffleTokens(tokens: string[], seed: number) {
  return tokens.map((token, index) => ({ token, score: (index * 17 + seed * 13) % 37 })).sort((a, b) => a.score - b.score).map((item) => item.token);
}

function challengeTitle(challenge: Foundation48Challenge, index: number) {
  if (challenge.id.endsWith('-mini-test') || challenge.id.endsWith('-speak-review')) return `${index + 1}. Mini test`;

  const labels: Record<Foundation48Challenge['type'], string> = {
    'multiple-choice': 'Chọn đáp án đúng',
    'listen-and-choose': 'Nghe và nhận diện',
    'fill-blank': 'Điền từ',
    'sentence-order': 'Sắp xếp câu',
    'speaking-repeat': 'Nói lại theo mẫu',
  };
  return `${index + 1}. ${labels[challenge.type]}`;
}

function challengeSubtitle(challenge: Foundation48Challenge) {
  if (challenge.id.endsWith('-mini-test')) return 'Chốt bài bằng một câu kiểm tra ngắn trước khi lưu tiến độ.';
  if (challenge.type === 'speaking-repeat') return 'Nói chậm, rõ. Có fallback nếu máy chưa hỗ trợ nhận giọng nói.';
  if (challenge.type === 'listen-and-choose') return 'Dùng giọng đọc tự động để nghe mẫu, sau đó chọn câu đúng.';
  return 'Làm đúng để mở bước tiếp theo. Nếu sai, lỗi sẽ được lưu vào phần ôn tập.';
}
