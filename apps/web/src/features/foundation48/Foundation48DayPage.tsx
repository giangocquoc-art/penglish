import { Box, Button, Flex, HStack, Icon, Input, Progress, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, Headphones, Home, Mic, Play, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { OceanPageShell } from '../../components/p-english/OceanPageShell';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import { useAuth } from '../auth/AuthProvider';
import { syncLocalFoundation48ProgressToCloud } from './foundation48CloudProgress';
import { Foundation48AudioPlayer } from './Foundation48AudioPlayer';
import { FOUNDATION48_BASE_PATH, foundation48Days, getFoundation48Day, getFoundation48DayPath } from './foundation48Data';
import type { Foundation48DeepLesson } from './foundation48DeepLessons';
import { getFoundation48CachedDeepLesson, getFoundation48DeepLesson, preloadFoundation48DeepLesson } from './foundation48DeepLessonResolver';
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
  const location = useLocation();
  const navigate = useNavigate();
  const paramDayNumber = Number(params.dayNumber);
  const pathDayNumber = Number(location.pathname.match(/\/ngay\/(\d+)/)?.[1]);
  const dayNumber = Number.isFinite(paramDayNumber) ? paramDayNumber : pathDayNumber;
  const day = Number.isFinite(dayNumber) ? getFoundation48Day(dayNumber) : undefined;
  const auth = useAuth();
  const [version, setVersion] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(true);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncPromptDismissed, setSyncPromptDismissed] = useState(false);
  const [resolvedDeepLesson, setResolvedDeepLesson] = useState<Foundation48DeepLesson | undefined>(() => day ? getFoundation48CachedDeepLesson(day.dayNumber) : undefined);
  const progress = useMemo(() => day ? getFoundation48DayProgress(day.dayNumber) : {}, [day, version]);
  const steps = useMemo(() => day ? buildFoundation48Steps(day, resolvedDeepLesson) : [], [day, resolvedDeepLesson]);

  useEffect(() => {
    if (day) markFoundation48Started(day.dayNumber);
  }, [day]);

  useEffect(() => {
    let cancelled = false;
    const currentDay = day?.dayNumber;
    setResolvedDeepLesson(currentDay ? getFoundation48CachedDeepLesson(currentDay) : undefined);

    if (!currentDay) return;

    getFoundation48DeepLesson(currentDay).then((lesson) => {
      if (!cancelled) setResolvedDeepLesson(lesson);
    }).catch(() => {
      if (!cancelled) setResolvedDeepLesson(getFoundation48CachedDeepLesson(currentDay));
    });

    if (currentDay < foundation48Days.length) {
      void preloadFoundation48DeepLesson(currentDay + 1);
    }

    return () => {
      cancelled = true;
    };
  }, [day?.dayNumber]);

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

  useEffect(() => {
    if (!day?.dayNumber || !auth.user?.id) {
      setSyncPromptDismissed(false);
      return;
    }

    try {
      setSyncPromptDismissed(window.sessionStorage.getItem(getFoundation48SyncPromptSessionKey(day.dayNumber, auth.user.id)) === '1');
    } catch {
      setSyncPromptDismissed(false);
    }
  }, [auth.user?.id, day?.dayNumber]);

  if (!day) return <Navigate to={FOUNDATION48_BASE_PATH} replace />;

  const previousDay = day.dayNumber > 1 ? day.dayNumber - 1 : null;
  const nextDay = day.dayNumber < foundation48Days.length ? day.dayNumber + 1 : null;
  const completed = Boolean(progress.completed);
  const currentStep = steps[stepIndex] ?? steps[0];
  const completedSteps = new Set(progress.completedSteps || []);
  const stepPercent = steps.length > 0 ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0;
  const challengeCount = steps.filter((step) => step.challenge).length;
  const rightCount = Object.values(progress.challengeResults || {}).filter((item) => item.correct).length;
  const isCompletionStep = currentStep?.type === 'complete';
  const showCompletionSyncPrompt = completed && isCompletionStep && Boolean(auth.user?.id) && !syncPromptDismissed;

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
    navigate('/home');
  }

  function dismissCompletionSyncPrompt() {
    if (day && auth.user?.id) {
      try {
        window.sessionStorage.setItem(getFoundation48SyncPromptSessionKey(day.dayNumber, auth.user.id), '1');
      } catch {
        // Session dismissal is helpful but non-critical if storage is unavailable.
      }
    }
    setSyncPromptDismissed(true);
  }

  async function syncCompletionProgress() {
    const userId = auth.user?.id;
    if (!userId) return;
    setSyncBusy(true);
    await syncLocalFoundation48ProgressToCloud(userId).catch(() => undefined);
    dismissCompletionSyncPrompt();
    setSyncBusy(false);
    window.dispatchEvent(new Event(FOUNDATION48_PROGRESS_UPDATED_EVENT));
  }

  return (
    <OceanPageShell data-testid="foundation48-day-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pt={{ base: '2', md: '0' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 156px)', lg: '8' }}>
      <Box maxW="960px" mx="auto" minW="0">
        <Button data-testid="foundation48-back-link" as={Link} to={FOUNDATION48_BASE_PATH} leftIcon={<Icon as={ChevronLeft} />} variant="ghost" color={COLORS.blue} borderRadius="full" mb="3">
          Về lộ trình 48 ngày
        </Button>

        <Box data-testid="foundation48-lesson-hero" className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '3', md: '6' }} bg="rgba(255,255,255,0.84)" mb={{ base: '3', md: '4' }} overflow="hidden" position="relative">
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 18%, rgba(102,217,200,0.16), transparent 30%)" pointerEvents="none" />
          <Flex position="relative" justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
            <Box minW="0" flex="1">
              <HStack gap="2" wrap="wrap">
                <Text px="3" py="1.5" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="950" fontSize="xs">Ngày {day.dayNumber}</Text>
                <Text px="3" py="1.5" borderRadius="full" bg={completed ? '#ECFDF5' : '#F8FAFC'} color={completed ? COLORS.green : COLORS.muted} fontWeight="950" fontSize="xs">{completed ? 'Đã hoàn thành' : `Bước ${stepIndex + 1}/${steps.length}`}</Text>
                <Text px="3" py="1.5" borderRadius="full" bg="#FFF7ED" color="#B45309" fontWeight="950" fontSize="xs">{rightCount}/{challengeCount} câu đúng</Text>
              </HStack>
              <Text as="h1" mt={{ base: '1.5', md: '2' }} color={COLORS.text} fontSize={{ base: 'xl', md: '4xl' }} lineHeight="1.12" fontWeight="950">
                {day.title}
              </Text>
              <Text mt={{ base: '1', md: '2' }} color={COLORS.muted} fontWeight="750" lineHeight="1.45" fontSize={{ base: 'sm', md: 'md' }}>Chặng {day.stageId}: {day.stageTitle}</Text>
              <Box mt={{ base: '3', md: '4' }}>
                <HStack justify="space-between" mb="1">
                  <Text fontSize="xs" color={COLORS.muted} fontWeight="900">Tiến độ bài học</Text>
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

        <Flex data-testid="foundation48-step-actions" mt="4" justify="space-between" align={{ base: 'stretch', sm: 'center' }} gap="3" direction={{ base: 'column', sm: 'row' }}>
          <Button leftIcon={<Icon as={ArrowLeft} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} borderRadius="full" isDisabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))}>
            Quay lại
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button rightIcon={<Icon as={ArrowRight} />} bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} borderRadius="full" onClick={goNext} isDisabled={!canContinue}>
              Tiếp tục
            </Button>
          ) : completed ? (
            <HStack alignSelf={{ base: 'flex-start', sm: 'center' }} gap="2" px="3" py="2" borderRadius="full" border="1px solid" borderColor="#BBF7D0" bg="#ECFDF5" color={COLORS.green} data-testid="foundation48-completed-status-badge">
              <Icon as={CheckCircle2} boxSize="4" />
              <Text fontSize="sm" fontWeight="950">Đã hoàn thành</Text>
            </HStack>
          ) : (
            <Button data-testid="foundation48-complete-day" leftIcon={<Icon as={Home} />} colorScheme="blue" borderRadius="full" onClick={completeDay}>
              Hoàn thành & về trang chủ
            </Button>
          )}
        </Flex>

        {completed && isCompletionStep ? (
          <Box mt="4" className="penglish-glass-card" border="1px solid" borderColor="#BBF7D0" borderRadius="3xl" p="4" bg="rgba(240,253,244,0.72)" data-testid="foundation48-completion-panel">
            <HStack gap="3" align="center">
              <OceanMascot mascot="saoNhi" pose="reward" size="sm" decorative motion="celebrate" />
              <Box minW="0">
                <Text color={COLORS.green} fontWeight="950">{day.dayNumber === foundation48Days.length ? 'Đã hoàn thành 48/48 ngày' : `Poo đã giữ ngày ${day.dayNumber}`}</Text>
                <Text color={COLORS.text} fontWeight="800" lineHeight="1.55">
                  {day.dayNumber === foundation48Days.length ? 'Bạn đã hoàn thành lộ trình 48 ngày lấy gốc. Hãy ôn lại các ngày khó, luyện nói đuổi và duy trì thói quen nghe/nói mỗi ngày.' : 'Poo đang giữ tiến độ và các câu cần ôn cho bạn.'}
                </Text>
              </Box>
            </HStack>
          </Box>
        ) : null}

        {showCompletionSyncPrompt ? (
          <Box mt="3" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p={{ base: '2.5', md: '3' }} bg="rgba(255,255,255,0.66)" boxShadow="none" data-testid="foundation48-sync-prompt-inline">
            <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} gap="2.5" direction={{ base: 'column', md: 'row' }}>
              <Text color={COLORS.muted} fontWeight="800" fontSize="sm">
                Lưu tiến độ lên tài khoản Google nhé?
              </Text>
              <HStack gap="2" justify={{ base: 'stretch', sm: 'flex-start' }}>
                <Button size="xs" borderRadius="full" variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" isLoading={syncBusy} onClick={syncCompletionProgress} flex={{ base: '1', sm: 'initial' }}>
                  Lưu lên tài khoản
                </Button>
                <Button size="xs" borderRadius="full" variant="ghost" color={COLORS.muted} onClick={dismissCompletionSyncPrompt} flex={{ base: '1', sm: 'initial' }}>
                  Để sau
                </Button>
              </HStack>
            </Flex>
          </Box>
        ) : null}

        {!completed ? (
          <Flex data-testid="foundation48-day-neighbor-actions" mt="5" justify="space-between" gap="3" direction={{ base: 'column', sm: 'row' }}>
            {previousDay ? <Button as={Link} to={getFoundation48DayPath(previousDay)} leftIcon={<Icon as={ArrowLeft} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} borderRadius="full">Ngày {previousDay}</Button> : <Box />}
            {nextDay ? <Button as={Link} to={getFoundation48DayPath(nextDay)} rightIcon={<Icon as={ArrowRight} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} borderRadius="full">Ngày {nextDay}</Button> : <Button as={Link} to={FOUNDATION48_BASE_PATH} variant="outline" borderColor={COLORS.border} color={COLORS.blue} borderRadius="full">Về lộ trình</Button>}
          </Flex>
        ) : null}
      </Box>
    </OceanPageShell>
  );
}

function getFoundation48SyncPromptSessionKey(dayNumber: number, userId: string) {
  return `penglish-foundation48-sync-prompt-session:${userId}:${dayNumber}`;
}

function LessonStepperCard({ day, step, completed, onReadyChange }: { day: Foundation48Day; step?: Foundation48LessonStep; completed: boolean; onReadyChange: (ready: boolean) => void }) {
  useEffect(() => {
    onReadyChange(!step?.challenge);
  }, [onReadyChange, step?.id, step?.challenge]);

  if (!step) return null;
  const icon = step.type === 'listening' ? Headphones : step.type === 'speaking' ? Mic : step.type === 'complete' ? Sparkles : Play;
  const stepLabel = getFoundation48StepLabel(step);

  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={completed ? '#BBF7D0' : COLORS.border} borderRadius="3xl" p={{ base: '3', md: '6' }} bg="rgba(255,255,255,0.86)" data-testid={`foundation48-step-${step.type}`} minH={{ base: step.type === 'intro' ? '220px' : '300px', md: '420px' }}>
      <VStack align="stretch" gap={{ base: '3', md: '4' }}>
        <HStack justify="space-between" align="start" gap="3">
          <HStack gap="3" align="center">
            <Box w={{ base: '38px', md: '46px' }} h={{ base: '38px', md: '46px' }} borderRadius="2xl" bg="#EFF6FF" color={COLORS.blue} display="grid" placeItems="center" border="1px solid rgba(186,230,253,0.92)" flexShrink={0}>
              <Icon as={icon} boxSize="5" />
            </Box>
            <Box>
              <Text color={COLORS.blue} fontWeight="950" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">{stepLabel}</Text>
              <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '3xl' }} lineHeight="1.14">{step.title}</Text>
            </Box>
          </HStack>
          {completed ? <Icon as={CheckCircle2} color={COLORS.green} boxSize="5" /> : null}
        </HStack>

        {step.subtitle ? <Text color={COLORS.muted} fontWeight="800" lineHeight="1.6">{step.subtitle}</Text> : null}
        {step.body ? <Text color={COLORS.text} fontWeight="750" lineHeight="1.75" whiteSpace="pre-line">{step.body}</Text> : null}
        {step.type === 'intro' && step.bullets?.length ? (
          <Text display={{ base: 'block', md: 'none' }} color={COLORS.blue} fontSize="xs" fontWeight="950" lineHeight="1.45" bg="#EFF6FF" border="1px solid" borderColor={COLORS.border} borderRadius="full" px="3" py="2" data-testid="foundation48-mobile-intro-preview">
            {step.bullets.map((item) => item.replace(/^(\d+)\s+/, '$1 ')).join(' · ')}
          </Text>
        ) : null}
        {step.type === 'intro' && step.bullets?.length ? (
          <Box display={{ base: 'none', md: 'block' }} border="1px solid" borderColor={COLORS.border} bg="linear-gradient(135deg, rgba(239,246,255,0.92), rgba(240,253,250,0.88))" borderRadius="2xl" p="4" data-testid="foundation48-intro-preview">
            <Text color={COLORS.blue} fontWeight="950" fontSize="sm" mb="3">Hôm nay bạn sẽ luyện</Text>
            <SimpleGrid columns={{ md: 5 }} gap="3">
              {step.bullets.map((item) => <Text key={item} border="1px solid" borderColor="rgba(186,230,253,0.9)" bg="white" borderRadius="2xl" p="3" color={COLORS.text} fontWeight="900" lineHeight="1.35" textAlign="center">{item}</Text>)}
            </SimpleGrid>
          </Box>
        ) : null}
        {step.type === 'explain' && !step.challenge ? <MeaningRevealCard step={step} day={day} /> : null}
        {step.type === 'example' && !step.challenge ? <PatternPracticeCards bullets={step.bullets || []} /> : null}
        {step.type === 'practice' && !step.challenge ? <VocabularyFlashcards bullets={step.bullets || []} fallbackSentence={day.summary.examples[0] || step.body || day.summary.summary} /> : null}
        {step.type !== 'intro' && step.type !== 'explain' && step.type !== 'example' && step.type !== 'practice' && step.type !== 'speaking' && step.type !== 'listening' && step.type !== 'complete' && !step.challenge && step.bullets?.length ? <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">{step.bullets.map((item) => <Text key={item} border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="3" color={COLORS.text} fontWeight="800" lineHeight="1.6">{item}</Text>)}</SimpleGrid> : null}

        {step.type === 'speaking' && !step.challenge && step.bullets?.length ? <SpeakingDrillCards bullets={step.bullets} /> : null}

        {step.type === 'listening' ? <ListenFirstActivity step={step} day={day} /> : null}
        {step.challenge ? <ChallengeCard dayNumber={day.dayNumber} challenge={step.challenge} onReadyChange={onReadyChange} /> : null}
        {step.type === 'complete' ? <CompletePrompt day={day} /> : null}
      </VStack>
    </Box>
  );
}

function ListenFirstActivity({ step, day }: { step: Foundation48LessonStep; day: Foundation48Day }) {
  const targetSentence = extractFirstSentence(step.body || day.summary.examples[0] || day.summary.summary);
  const [listened, setListened] = useState(false);
  const [readAlong, setReadAlong] = useState(false);

  useEffect(() => {
    setListened(false);
    setReadAlong(false);
  }, [step.id]);

  function listen() {
    speakEnglish(targetSentence, true);
    setListened(true);
  }

  return (
    <Box border="1px solid" borderColor={listened ? '#BBF7D0' : 'rgba(186,230,253,0.95)'} bg={listened ? 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)' : 'linear-gradient(135deg, rgba(239,246,255,0.96), rgba(255,255,255,0.9))'} borderRadius="3xl" p={{ base: '3.5', md: '5' }} data-testid="foundation48-listen-first">
      <VStack align="stretch" gap="4">
        {day.audio.length ? <Foundation48AudioPlayer audio={day.audio} compact /> : null}
        <HStack gap="3" align="start">
          <OceanMascot mascot="poo" pose="coach" size="sm" decorative motion="float" />
          <Box minW="0">
            <Text color={COLORS.blue} fontWeight="950">Poo nói: “Nghe trước nhé.”</Text>
            <Text mt="2" color={COLORS.text} fontSize={{ base: 'xl', md: '3xl' }} fontWeight="950" lineHeight="1.25">{targetSentence}</Text>
          </Box>
        </HStack>
        <Flex gap="2.5" wrap="wrap" direction={{ base: 'column', sm: 'row' }}>
          <Button leftIcon={<Icon as={Volume2} />} bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} borderRadius="full" minH="48px" onClick={listen} data-testid="foundation48-listen-main">Nghe mẫu</Button>
          <Button leftIcon={<Icon as={Volume2} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" minH="48px" onClick={listen}>Nghe lại</Button>
          <Button leftIcon={<Icon as={CheckCircle2} />} variant={listened ? 'solid' : 'outline'} colorScheme={listened ? 'green' : undefined} borderColor={COLORS.border} borderRadius="full" minH="48px" onClick={() => setListened(true)} data-testid="foundation48-listen-done">Tôi đã nghe xong</Button>
        </Flex>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="2.5">
          <ChecklistPill done={listened} label="Đã nghe câu mẫu" />
          <Button leftIcon={<Icon as={readAlong ? CheckCircle2 : Play} />} justifyContent="flex-start" borderRadius="2xl" border="1px solid" borderColor={readAlong ? '#BBF7D0' : COLORS.border} bg={readAlong ? '#ECFDF5' : 'white'} color={readAlong ? COLORS.green : COLORS.text} minH="46px" onClick={() => setReadAlong((value) => !value)} data-testid="foundation48-listen-readalong">Đã đọc thầm theo</Button>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}

function MeaningRevealCard({ step, day }: { step: Foundation48LessonStep; day: Foundation48Day }) {
  const examples = step.bullets?.length ? step.bullets : day.summary.examples;
  const english = extractEnglishFromBullet(examples[0] || step.body || day.summary.examples[0] || day.summary.summary);
  const meaning = extractMeaningFromBullet(examples[0]) || firstLine(step.body) || day.summary.summary;
  const hint = examples[1]?.includes('—') ? examples[1].split('—')[0].trim() : 'I’m = I am.';
  const [revealed, setRevealed] = useState(false);

  useEffect(() => setRevealed(false), [step.id]);

  return (
    <Box border="1px solid" borderColor={revealed ? '#BBF7D0' : COLORS.border} bg="linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.86))" borderRadius="3xl" p={{ base: '3.5', md: '5' }} data-testid="foundation48-meaning-card">
      <VStack align="stretch" gap="3.5">
        <Text color={COLORS.blue} fontWeight="950" fontSize="sm">Tiếng Anh</Text>
        <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'xl', md: '3xl' }} lineHeight="1.25">{english}</Text>
        {!revealed ? (
          <Button alignSelf="start" leftIcon={<Icon as={Sparkles} />} bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} borderRadius="full" onClick={() => setRevealed(true)} data-testid="foundation48-meaning-reveal">Xem nghĩa</Button>
        ) : (
          <Box border="1px solid" borderColor="#BBF7D0" bg="#ECFDF5" borderRadius="2xl" p="3.5" data-testid="foundation48-meaning-revealed">
            <Text color={COLORS.green} fontWeight="950">{meaning}</Text>
            <Text mt="2" color={COLORS.text} fontWeight="800">Gợi ý: {hint}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

function PatternPracticeCards({ bullets }: { bullets: string[] }) {
  const items = bullets.slice(0, 4).map((item) => {
    const [pattern, meaning] = item.split(' — ');
    return { pattern: pattern.trim(), meaning: (meaning || 'Đọc chậm và chú ý trật tự từ.').trim() };
  });

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" data-testid="foundation48-pattern-cards">
      {items.map((item, index) => (
        <Box key={`${item.pattern}-${index}`} border="1px solid" borderColor={index === 0 ? '#7DD3FC' : COLORS.border} bg={index === 0 ? 'rgba(239,246,255,0.96)' : 'rgba(255,255,255,0.86)'} borderRadius="2xl" p="4">
          <Text color={COLORS.blue} fontWeight="950" fontSize="xs">Mẫu {index + 1}/{items.length}</Text>
          <Text mt="2" color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: 'xl' }}>{item.pattern}</Text>
          <Text mt="1" color={COLORS.muted} fontWeight="800" lineHeight="1.55">{item.meaning}</Text>
          <Button mt="3" size="sm" leftIcon={<Icon as={Volume2} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" onClick={() => speakEnglish(item.pattern, true)}>Nghe mẫu</Button>
        </Box>
      ))}
    </SimpleGrid>
  );
}

function VocabularyFlashcards({ bullets, fallbackSentence }: { bullets: string[]; fallbackSentence: string }) {
  const cards = bullets.slice(0, 6).map((item) => parseVocabBullet(item, fallbackSentence));
  const [remembered, setRemembered] = useState<Record<number, boolean>>({});

  useEffect(() => setRemembered({}), [bullets]);

  const rememberedCount = cards.filter((_, index) => remembered[index]).length;
  const progressPercent = cards.length ? Math.round((rememberedCount / cards.length) * 100) : 0;

  if (!cards.length) return null;

  return (
    <Box border="1px solid" borderColor="rgba(186,230,253,0.95)" bg="linear-gradient(135deg, rgba(232,244,255,0.82), rgba(255,255,255,0.92))" borderRadius="3xl" p={{ base: '3.5', md: '4' }} data-testid="foundation48-vocab-flashcards">
      <VStack align="stretch" gap="3.5">
        <Flex justify="space-between" align={{ base: 'stretch', sm: 'center' }} gap="3" direction={{ base: 'column', sm: 'row' }}>
          <Box>
            <Text color={COLORS.text} fontWeight="950">Từ khóa dùng ngay</Text>
            <Text color={COLORS.muted} fontWeight="800" fontSize="sm">Bấm nghe, đọc theo, rồi tự đánh dấu từ đã nhớ.</Text>
          </Box>
          <Text role="status" aria-live="polite" px="3" py="1.5" borderRadius="full" bg={rememberedCount === cards.length ? '#ECFDF5' : 'white'} color={rememberedCount === cards.length ? COLORS.green : COLORS.blue} border="1px solid" borderColor={rememberedCount === cards.length ? '#BBF7D0' : COLORS.border} fontWeight="950" fontSize="sm" data-testid="foundation48-vocab-progress">{rememberedCount}/{cards.length} từ đã nhớ</Text>
        </Flex>
        <Progress value={progressPercent} h="8px" borderRadius="full" colorScheme="green" bg="rgba(255,255,255,0.72)" />
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {cards.map((card, index) => {
            const done = Boolean(remembered[index]);
            return (
              <Box key={`${card.word}-${index}`} border="1px solid" borderColor={done ? '#BBF7D0' : COLORS.border} bg={done ? '#ECFDF5' : 'white'} borderRadius="2xl" p="3.5" data-testid={`foundation48-vocab-card-${index + 1}`}>
                <Text color={COLORS.blue} fontWeight="950" fontSize="xs">Từ {index + 1}/{cards.length}</Text>
                <Text mt="1" color={COLORS.text} fontWeight="950" fontSize="xl">{card.word}</Text>
                <Text color={COLORS.green} fontWeight="900">{card.meaning}</Text>
                <Text mt="2" color={COLORS.muted} fontWeight="800" fontSize="sm" lineHeight="1.55">{card.example}</Text>
                <Flex mt="3" gap="2" wrap="wrap" direction={{ base: 'column', sm: 'row' }}>
                  <Button size="sm" leftIcon={<Icon as={Volume2} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" onClick={() => speakEnglish(card.word, true)}>Nghe</Button>
                  <Button size="sm" leftIcon={<Icon as={CheckCircle2} />} bg={done ? COLORS.green : COLORS.blue} color="white" _hover={{ bg: done ? '#15803D' : '#185BB2' }} borderRadius="full" onClick={() => setRemembered((current) => ({ ...current, [index]: !current[index] }))} data-testid={`foundation48-vocab-remember-${index + 1}`}>{done ? 'Đã nhớ' : 'Đã nhớ'}</Button>
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}

function SpeakingDrillCards({ bullets }: { bullets: string[] }) {
  const drills = useMemo(() => bullets.map((item) => {
    const [sentence, ...tipParts] = item.split(' — ');
    return {
      sentence: sentence.trim(),
      tip: tipParts.join(' — ').trim() || 'Nói chậm, rõ chủ ngữ và động từ.',
    };
  }).filter((item) => item.sentence), [bullets]);
  const [completedDrills, setCompletedDrills] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setCompletedDrills({});
  }, [bullets]);

  const completedCount = drills.filter((_, index) => completedDrills[index]).length;
  const activeIndex = drills.findIndex((_, index) => !completedDrills[index]);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : drills.length - 1;
  const progressPercent = drills.length ? Math.round((completedCount / drills.length) * 100) : 0;

  if (!drills.length) return null;

  return (
    <Box border="1px solid" borderColor="rgba(186,230,253,0.95)" bg="linear-gradient(135deg, rgba(232,244,255,0.82), rgba(240,253,250,0.9))" borderRadius="3xl" p={{ base: '3', md: '4' }} overflow="hidden" position="relative" data-testid="foundation48-speaking-drill">
      <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 10%, rgba(31,111,214,0.12), transparent 28%)" pointerEvents="none" />
      <VStack position="relative" align="stretch" gap="3.5">
        <Flex justify="space-between" align={{ base: 'stretch', sm: 'center' }} gap="3" direction={{ base: 'column', sm: 'row' }}>
          <HStack gap="3" align="center">
            <Box w="38px" h="38px" borderRadius="2xl" display="grid" placeItems="center" bg="white" color={COLORS.blue} border="1px solid" borderColor="rgba(186,230,253,0.95)" boxShadow="0 10px 24px rgba(31,111,214,0.10)" flexShrink={0}>
              <Icon as={Mic} boxSize="5" />
            </Box>
            <Box minW="0">
              <Text color={COLORS.text} fontWeight="950" lineHeight="1.25">Luyện nói từng câu</Text>
              <Text color={COLORS.muted} fontSize="sm" fontWeight="750" lineHeight="1.45">Nghe mẫu nếu cần, nói thành tiếng, rồi tự đánh dấu.</Text>
            </Box>
          </HStack>
          <Text alignSelf={{ base: 'start', sm: 'center' }} px="3" py="1.5" borderRadius="full" bg={completedCount === drills.length ? '#ECFDF5' : 'white'} color={completedCount === drills.length ? COLORS.green : COLORS.blue} border="1px solid" borderColor={completedCount === drills.length ? '#BBF7D0' : COLORS.border} fontSize="sm" fontWeight="950" role="status" aria-live="polite" data-testid="foundation48-speaking-progress">
            {completedCount}/{drills.length} câu đã luyện
          </Text>
        </Flex>

        <Progress value={progressPercent} h="8px" borderRadius="full" bg="rgba(255,255,255,0.72)" colorScheme="green" />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {drills.map((drill, index) => {
            const done = Boolean(completedDrills[index]);
            const active = index === safeActiveIndex && !done;
            return (
              <Box key={`${drill.sentence}-${index}`} border="1px solid" borderColor={done ? '#BBF7D0' : active ? '#7DD3FC' : 'rgba(186,230,253,0.82)'} bg={done ? 'rgba(240,253,244,0.92)' : active ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.78)'} borderRadius="2xl" p={{ base: '3.5', md: '4' }} boxShadow={active ? '0 16px 34px rgba(31,111,214,0.14)' : '0 10px 22px rgba(15,76,117,0.06)'} transform={active ? 'translateY(-1px)' : undefined} transition="transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease" data-testid={`foundation48-speaking-card-${index + 1}`}>
                <VStack align="stretch" gap="3">
                  <HStack justify="space-between" gap="3" align="center">
                    <Text px="2.5" py="1" borderRadius="full" bg={done ? '#DCFCE7' : '#EFF6FF'} color={done ? COLORS.green : COLORS.blue} fontSize="xs" fontWeight="950">
                      Câu {index + 1}/{drills.length}
                    </Text>
                    <Box w="28px" h="28px" borderRadius="full" display="grid" placeItems="center" bg={done ? COLORS.green : active ? COLORS.blue : '#E8F4FF'} color={done || active ? 'white' : COLORS.blue} flexShrink={0}>
                      <Icon as={done ? CheckCircle2 : active ? Mic : Play} boxSize="4" />
                    </Box>
                  </HStack>
                  <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.35">
                    {drill.sentence}
                  </Text>
                  <Text color={COLORS.muted} fontWeight="800" fontSize="sm" lineHeight="1.55">
                    {drill.tip}
                  </Text>
                  <Flex gap="2.5" wrap="wrap" direction={{ base: 'column', sm: 'row' }}>
                    <Button leftIcon={<Icon as={Volume2} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" onClick={() => speakEnglish(drill.sentence, true)} flex={{ base: '1 1 auto', sm: '0 0 auto' }} minH="42px">
                      Nghe mẫu
                    </Button>
                    <Button leftIcon={<Icon as={CheckCircle2} />} bg={done ? COLORS.green : COLORS.blue} color="white" _hover={{ bg: done ? '#15803D' : '#185BB2' }} borderRadius="full" onClick={() => setCompletedDrills((current) => ({ ...current, [index]: true }))} flex="1" minH="42px" data-testid={`foundation48-speaking-done-${index + 1}`}>
                      {done ? 'Đã nói xong' : 'Tôi đã nói xong'}
                    </Button>
                  </Flex>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}

function ChallengeCard({ dayNumber, challenge, onReadyChange }: { dayNumber: number; challenge: Foundation48Challenge; onReadyChange: (ready: boolean) => void }) {
  const [answer, setAnswer] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [listening, setListening] = useState(false);
  const [selfPracticed, setSelfPracticed] = useState(false);
  const isChoiceChallenge = challenge.type === 'multiple-choice' || challenge.type === 'listen-and-choose';
  const progressLabel = getChallengeProgressLabel(challenge);

  useEffect(() => {
    setAnswer('');
    setSelectedTokens([]);
    setFeedback(null);
    setSelfPracticed(false);
    onReadyChange(false);
  }, [challenge.id, onReadyChange]);

  const currentAnswer = challenge.type === 'sentence-order' ? selectedTokens.join(' ') : answer;

  function submit(value = currentAnswer) {
    const correct = normalizeAnswer(value) === normalizeAnswer(challenge.answer);
    const wrongMessage = challenge.type === 'sentence-order' ? 'Thử đặt chủ ngữ trước nhé.' : 'Gần đúng rồi, xem lại gợi ý nhé.';
    setFeedback({ correct, message: correct ? 'Đúng rồi!' : wrongMessage });
    recordFoundation48ChallengeResult(dayNumber, challenge, correct, value || '(chưa trả lời)');
    onReadyChange(correct);
  }

  function markSelfPracticed() {
    setSelfPracticed(true);
    setAnswer(challenge.answer);
    setFeedback({ correct: true, message: 'Đã nói xong. Poo ghi nhận phần tự luyện của bạn.' });
    recordFoundation48ChallengeResult(dayNumber, challenge, true, challenge.answer);
    onReadyChange(true);
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
    recognition.onerror = () => setFeedback({ correct: false, message: 'Poo chưa nghe rõ. Thử nói chậm hơn hoặc tự đánh dấu đã luyện.' });
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  return (
    <Box border="1px solid" borderColor={feedback?.correct ? '#BBF7D0' : COLORS.border} bg={feedback?.correct ? 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)' : 'linear-gradient(135deg, rgba(248,250,252,0.96), rgba(239,246,255,0.84))'} borderRadius="3xl" p={{ base: '3.5', md: '5' }} data-testid={`foundation48-challenge-${challenge.type}`}>
      <VStack align="stretch" gap="4">
        <Flex justify="space-between" align={{ base: 'stretch', md: 'start' }} gap="3" direction={{ base: 'column', md: 'row' }}>
          <Box minW="0">
            <HStack gap="2" wrap="wrap" mb="2">
              <Text color={COLORS.blue} fontWeight="950" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">{getFoundation48ChallengeLabel(challenge.type)}</Text>
              {progressLabel ? <Text px="2.5" py="1" borderRadius="full" bg="white" border="1px solid" borderColor={COLORS.border} color={COLORS.blue} fontWeight="950" fontSize="xs" data-testid="foundation48-quiz-progress">{progressLabel}</Text> : null}
            </HStack>
            <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.3">{challenge.prompt}</Text>
            {challenge.hint ? <Text mt="1" color={COLORS.muted} fontWeight="750" lineHeight="1.55">Gợi ý: {challenge.hint}</Text> : null}
          </Box>
          {(challenge.type === 'listen-and-choose' || challenge.type === 'speaking-repeat') ? <SpeakButton text={challenge.target || challenge.answer} label="Nghe mẫu" slow /> : null}
        </Flex>

        {isChoiceChallenge ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" data-testid="foundation48-choice-options">
            {(challenge.options || []).map((option, index) => {
              const selected = answer === option;
              return <Button key={option} whiteSpace="normal" h="auto" minH="56px" py="3.5" px="4" justifyContent="flex-start" textAlign="left" borderRadius="2xl" border="1px solid" borderColor={selected ? '#7DD3FC' : COLORS.border} bg={selected ? COLORS.blue : 'white'} color={selected ? 'white' : COLORS.text} _hover={{ bg: selected ? '#185BB2' : '#EFF6FF' }} fontWeight="900" onClick={() => { setAnswer(option); submit(option); }} data-testid={`foundation48-answer-option-${index + 1}`}>{option}</Button>;
            })}
          </SimpleGrid>
        ) : null}

        {challenge.type === 'fill-blank' ? (
          <Flex gap="3" align={{ base: 'stretch', sm: 'center' }} direction={{ base: 'column', sm: 'row' }}>
            <Input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Nhập đáp án..." bg="white" borderColor={COLORS.border} borderRadius="full" fontWeight="850" minH="48px" onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} data-testid="foundation48-fill-answer" />
            <Button bg={COLORS.blue} color="white" borderRadius="full" minH="48px" onClick={() => submit()} flexShrink={0}>Poo xem giúp</Button>
          </Flex>
        ) : null}

        {challenge.type === 'sentence-order' ? (
          <VStack align="stretch" gap="3" data-testid="foundation48-sentence-builder">
            <Box border="1px dashed" borderColor={selectedTokens.length ? '#7DD3FC' : COLORS.border} bg="white" borderRadius="2xl" p="3.5" minH="70px">
              <Text color={COLORS.blue} fontWeight="950" fontSize="xs" mb="2">Câu của bạn</Text>
              <Flex gap="2" wrap="wrap">
                {selectedTokens.length ? selectedTokens.map((token, index) => <Button key={`${token}-${index}`} size="sm" borderRadius="full" bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} onClick={() => setSelectedTokens((tokens) => tokens.filter((_, itemIndex) => itemIndex !== index))}>{token}</Button>) : <Text color={COLORS.muted} fontWeight="800">Bấm các từ bên dưới để xếp câu.</Text>}
              </Flex>
            </Box>
            <Flex gap="2" wrap="wrap">
              {(challenge.tokens || []).map((token, index) => <Button key={`${token}-${index}`} minH="42px" borderRadius="full" variant="outline" borderColor={COLORS.border} bg="white" color={COLORS.text} fontWeight="900" onClick={() => setSelectedTokens((tokens) => [...tokens, token])} data-testid={`foundation48-token-${index + 1}`}>{token}</Button>)}
            </Flex>
            <HStack gap="2" wrap="wrap">
              <Button leftIcon={<Icon as={RotateCcw} />} variant="outline" borderColor={COLORS.border} borderRadius="full" minH="44px" onClick={() => { setSelectedTokens([]); setFeedback(null); }}>Làm lại</Button>
              <Button bg={COLORS.blue} color="white" borderRadius="full" minH="44px" onClick={() => submit()} data-testid="foundation48-sentence-check">Poo xem giúp</Button>
            </HStack>
          </VStack>
        ) : null}

        {challenge.type === 'speaking-repeat' ? (
          <VStack align="stretch" gap="3">
            <Flex gap="2.5" wrap="wrap" direction={{ base: 'column', sm: 'row' }}>
              <Button leftIcon={<Icon as={Mic} />} bg={COLORS.blue} color="white" borderRadius="full" minH="48px" onClick={startSpeechRecognition} isLoading={listening} loadingText="Đang nghe">Nói để Poo nghe</Button>
              <Button leftIcon={<Icon as={selfPracticed ? CheckCircle2 : Mic} />} variant={selfPracticed ? 'solid' : 'outline'} colorScheme={selfPracticed ? 'green' : undefined} borderColor={COLORS.border} borderRadius="full" minH="48px" onClick={markSelfPracticed} data-testid="foundation48-speaking-self-practiced">{selfPracticed ? 'Đã nói xong' : 'Tự đánh dấu đã nói'}</Button>
            </Flex>
            {answer ? <Text color={COLORS.muted} fontWeight="800">Bạn nói/nhập: {answer}</Text> : null}
          </VStack>
        ) : null}

        {feedback ? (
          <Box border="1px solid" borderColor={feedback.correct ? '#86EFAC' : '#FED7AA'} bg={feedback.correct ? '#ECFDF5' : '#FFF7ED'} borderRadius="2xl" p="3.5" role="status" aria-live="polite" data-testid="foundation48-challenge-feedback">
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
  const nextDay = day.dayNumber < foundation48Days.length ? day.dayNumber + 1 : null;
  const deepLesson = getFoundation48CachedDeepLesson(day.dayNumber);
  const sentenceCount = deepLesson?.speaking.length || 5;
  const wordCount = deepLesson?.vocabulary.length || Math.min(6, day.summary.keyPoints.length || day.summary.practice.length || 4);
  const quizCount = deepLesson?.quiz.length || 1;

  return (
    <Box border="1px solid" borderColor="#BBF7D0" bg="linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 62%, #EFF6FF 100%)" borderRadius="3xl" p={{ base: '4', md: '5' }} data-testid="foundation48-complete-reward">
      <VStack align="stretch" gap="4">
        <HStack gap="3" align="start">
          <OceanMascot mascot="poo" pose="reward" size="md" decorative motion="float" />
          <Box minW="0">
            <Text color={COLORS.green} fontWeight="950" fontSize={{ base: 'xl', md: '3xl' }} lineHeight="1.18">Hoàn thành Ngày {day.dayNumber}</Text>
            <Text mt="1" color={COLORS.text} fontWeight="900" lineHeight="1.45">Giỏi lắm! Poo đã giữ lại vài câu cần ôn. Mai mình luyện nhẹ nhé.</Text>
          </Box>
        </HStack>
        <Box border="1px solid" borderColor="#BBF7D0" bg="rgba(255,255,255,0.74)" borderRadius="2xl" p={{ base: '3', md: '3.5' }} data-testid="foundation48-learned-summary">
          <Text color={COLORS.green} fontWeight="950" fontSize="sm" mb="2">Bạn đã học</Text>
          <SimpleGrid columns={3} gap={{ base: '2', md: '2.5' }}>
            <SummaryPill label="Luyện nói" value={`${sentenceCount} câu luyện nói`} compact />
            <SummaryPill label="Từ vựng" value={`${wordCount} từ đã ôn`} compact />
            <SummaryPill label="Kiểm tra" value={quizCount ? `${quizCount} câu` : 'Đã xem'} compact />
          </SimpleGrid>
        </Box>
        <Flex gap="2.5" wrap="wrap" direction={{ base: 'column', sm: 'row' }} data-testid="foundation48-complete-actions">
          <Button as={Link} to={getFoundation48DayPath(day.dayNumber)} leftIcon={<Icon as={RotateCcw} />} bg={COLORS.green} color="white" borderRadius="full" minH="50px" px="6" data-testid="foundation48-complete-review-day">Ôn lại bài này</Button>
          {nextDay ? <Button as={Link} to={getFoundation48DayPath(nextDay)} leftIcon={<Icon as={ArrowRight} />} variant="outline" borderColor="#86EFAC" color={COLORS.green} bg="white" borderRadius="full" minH="46px" data-testid="foundation48-complete-next-day">Học bài tiếp theo</Button> : null}
          <Button as={Link} to="/practice" leftIcon={<Icon as={Sparkles} />} variant="outline" borderColor="#86EFAC" color={COLORS.green} bg="white" borderRadius="full" minH="46px" data-testid="foundation48-complete-mistakes">Ôn câu Poo nhắc</Button>
          <Button as={Link} to="/home" leftIcon={<Icon as={Home} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" minH="46px" data-testid="foundation48-complete-home">Về Hôm nay học gì?</Button>
          {day.dayNumber === foundation48Days.length ? <Button as={Link} to={FOUNDATION48_BASE_PATH} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" minH="46px">Về lộ trình</Button> : null}
        </Flex>
        <GrammarReview reminders={getCompletionReminders(day, deepLesson)} />
      </VStack>
    </Box>
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

function ChecklistPill({ done, label }: { done: boolean; label: string }) {
  return (
    <HStack gap="2" border="1px solid" borderColor={done ? '#BBF7D0' : COLORS.border} bg={done ? '#ECFDF5' : 'white'} color={done ? COLORS.green : COLORS.text} borderRadius="2xl" px="3" py="2.5" minH="46px">
      <Icon as={done ? CheckCircle2 : Play} boxSize="4" />
      <Text fontWeight="900">{label}</Text>
    </HStack>
  );
}

function SummaryPill({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <Box border="1px solid" borderColor="#BBF7D0" bg="rgba(255,255,255,0.82)" borderRadius="2xl" p={compact ? { base: '2', md: '2.5' } : '3'} minW="0">
      <Text color={COLORS.muted} fontSize="xs" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" noOfLines={1}>{label}</Text>
      <Text color={COLORS.green} fontWeight="950" fontSize={compact ? { base: 'xs', md: 'md' } : 'lg'} lineHeight="1.2">{value}</Text>
    </Box>
  );
}

function GrammarReview({ reminders }: { reminders: string[] }) {
  if (!reminders.length) return null;

  return (
    <>
      <Box as="details" display={{ base: 'block', md: 'none' }} border="1px solid" borderColor="rgba(186,230,253,0.72)" bg="rgba(255,255,255,0.58)" borderRadius="2xl" p="3" data-testid="foundation48-grammar-review-mobile">
        <Box as="summary" cursor="pointer" color={COLORS.blue} fontWeight="950" sx={{ '&::-webkit-details-marker': { display: 'none' } }}>
          Xem lại kiến thức
        </Box>
        <VStack align="stretch" gap="2" mt="3">
          {reminders.map((item) => <Text key={item} color={COLORS.text} fontWeight="800" lineHeight="1.45">• {item}</Text>)}
        </VStack>
      </Box>
      <Box display={{ base: 'none', md: 'block' }} border="1px solid" borderColor="rgba(186,230,253,0.72)" bg="rgba(255,255,255,0.58)" borderRadius="2xl" p="3.5" data-testid="foundation48-grammar-review-desktop">
        <Text color={COLORS.blue} fontWeight="950" mb="2">Xem lại kiến thức</Text>
        <SimpleGrid columns={{ md: 2 }} gap="2.5">
          {reminders.map((item) => <Text key={item} color={COLORS.text} fontWeight="800" lineHeight="1.45" border="1px solid" borderColor="rgba(186,230,253,0.55)" bg="white" borderRadius="xl" p="2.5">{item}</Text>)}
        </SimpleGrid>
      </Box>
    </>
  );
}

function getCompletionReminders(day: Foundation48Day, deepLesson?: Foundation48DeepLesson) {
  if (deepLesson?.review.remember.length) return deepLesson.review.remember.slice(0, 4);
  const polished = day.polished;
  const fallback = polished?.formulas?.length ? polished.formulas : day.summary.keyPoints;
  return fallback.slice(0, 4).map((item) => item.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
}

function firstLine(value?: string) {
  return value?.split(/\n|•/).map((item) => item.trim()).find(Boolean) || '';
}

function extractFirstSentence(value: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.match(/^[^.!?]+[.!?]/)?.[0]?.trim() || cleaned.split(' ').slice(0, 12).join(' ');
}

function extractEnglishFromBullet(value?: string) {
  const source = value || '';
  return source.split(' — ')[0]?.replace(/^Ví dụ:\s*/i, '').trim() || source.trim();
}

function extractMeaningFromBullet(value?: string) {
  if (!value) return '';
  const [, ...meaningParts] = value.split(' — ');
  return meaningParts.join(' — ').replace(/^Nghĩa:\s*/i, '').trim();
}

function parseVocabBullet(item: string, fallbackSentence: string) {
  const [wordPart, detailPart = ''] = item.split(' — ');
  const [meaningPart, examplePart = ''] = detailPart.split(/Ví dụ:\s*/i);
  return {
    word: wordPart.trim() || item.trim(),
    meaning: meaningPart.replace(/[.。]\s*$/g, '').trim() || 'Từ khóa trong bài',
    example: examplePart.trim() || fallbackSentence,
  };
}

function getChallengeProgressLabel(challenge: Foundation48Challenge) {
  const quizMatch = challenge.id.match(/(?:quiz|choice)-(\d+)/i);
  if (quizMatch) return `Câu ${Number(quizMatch[1]) + 1}/3`;
  if (challenge.id.endsWith('-mini-test')) return 'Câu 1/1';
  if (challenge.type === 'multiple-choice') return 'Câu 1/3';
  return '';
}

function getFoundation48StepLabel(step: Foundation48LessonStep) {
  if (step.challenge) return getFoundation48ChallengeLabel(step.challenge.type);

  const labels: Record<Foundation48LessonStep['type'], string> = {
    intro: 'Ngày đang học',
    explain: 'Tài liệu bài học',
    example: 'Mẫu câu',
    practice: 'Câu luyện',
    listening: 'Lời thoại',
    speaking: 'Câu luyện',
    challenge: 'Thử sức nhẹ',
    complete: 'Ôn lại',
  };

  return labels[step.type];
}

function getFoundation48ChallengeLabel(type: Foundation48Challenge['type']) {
  const labels: Record<Foundation48Challenge['type'], string> = {
    'multiple-choice': 'Thử sức nhẹ',
    'listen-and-choose': 'Lời thoại',
    'fill-blank': 'Câu luyện',
    'sentence-order': 'Câu luyện',
    'speaking-repeat': 'Câu luyện',
  };

  return labels[type];
}

function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/[.,!?;:'"“”‘’]/g, '').replace(/\s+/g, ' ').trim();
}

function buildFoundation48Steps(day: Foundation48Day, resolvedDeepLesson?: Foundation48DeepLesson): Foundation48LessonStep[] {
  const deepLesson = resolvedDeepLesson ?? getFoundation48CachedDeepLesson(day.dayNumber);

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
      { id: 'intro', type: 'intro', title: deepLesson.learnerTitle, subtitle: 'Bài học thật cho người mới: từ vựng, mẫu câu, nghe, nói và kiểm tra nhanh.', body: deepLesson.goalVi, bullets: [`${deepLesson.vocabulary.length} Từ vựng`, `${deepLesson.patterns.length} Mẫu câu`, `${deepLesson.listening.length} Nghe`, `${deepLesson.speaking.length} Nói lại`, `${deepLesson.quiz.length} Thử sức nhẹ`] },
      { id: 'explain', type: 'explain', title: deepLesson.grammarPoint.title, subtitle: 'Poo giải thích bằng tiếng Việt trước khi luyện.', body: deepLesson.grammarPoint.explanationVi, bullets: deepLesson.grammarPoint.examples },
      { id: 'patterns', type: 'example', title: 'Mẫu câu cần nhớ', subtitle: 'Đọc mẫu chậm, chú ý trật tự từ.', bullets: patternBullets },
      { id: 'vocabulary', type: 'practice', title: 'Từ/cụm dùng ngay', subtitle: `${deepLesson.vocabulary.length} từ và cụm chính của ngày ${day.dayNumber}.`, bullets: vocabularyBullets },
      { id: 'listening-overview', type: 'listening', title: 'Nghe 5 câu mẫu', subtitle: 'Nghe Poo đọc chậm trước, sau đó làm từng câu nghe chọn đáp án.', body: deepLesson.listening.map((item) => item.text).join(' ') },
      { id: 'speaking-overview', type: 'speaking', title: 'Câu luyện nói', subtitle: 'Nói thành tiếng để tạo phản xạ, không chỉ đọc thầm.', bullets: deepLesson.speaking.map((item) => `${item.text} — ${item.focus}`) },
    ];

    challenges.forEach((challenge, index) => {
      steps.push({ id: challenge.id, type: challenge.type === 'speaking-repeat' ? 'speaking' : 'challenge', title: challengeTitle(challenge, index), subtitle: challengeSubtitle(challenge), challenge });
    });

    steps.push({
      id: 'complete',
      type: 'complete',
      title: 'Tổng kết và ôn lại',
      subtitle: 'Một ngày học đã xong. Nhấn sang ngày tiếp theo khi bạn sẵn sàng.',
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
    { id: 'intro', type: 'intro', title: `Ngày ${day.dayNumber}: bài học cùng Poo`, subtitle: 'Poo dẫn bạn đi theo nhịp nhẹ: hiểu ý chính, luyện mẫu câu rồi thử sức.', body: summary },
    { id: 'explain', type: 'explain', title: 'Poo giải thích nhanh', subtitle: 'Nắm khung chính trước khi làm bài.', body: explanation, bullets: keyPoints },
    { id: 'example', type: 'example', title: 'Ví dụ mẫu dễ nhớ', subtitle: 'Đọc chậm từng câu, chú ý chủ ngữ và từ khóa.', bullets: examples },
    { id: 'practice', type: 'practice', title: 'Chuẩn bị kiểm tra nhanh', subtitle: 'Nhìn mẫu và tự dự đoán đáp án trước khi làm thử thách.', bullets: practice.slice(0, 4) },
  ];

  if (day.audio.length > 0) {
    steps.push({ id: 'listening', type: 'listening', title: 'Nghe', subtitle: 'Nghe bài nghe của ngày này hoặc nghe Poo đọc chậm.', body: examples[0] || summary });
  } else {
    steps.push({ id: 'listening-tts', type: 'listening', title: 'Nghe', subtitle: 'Dùng giọng đọc mẫu để làm quen âm và nhịp.', body: examples.slice(0, 2).join(' ') || summary });
  }

  challenges.forEach((challenge, index) => {
    steps.push({ id: challenge.id, type: challenge.type === 'speaking-repeat' ? 'speaking' : 'challenge', title: challengeTitle(challenge, index), subtitle: challengeSubtitle(challenge), challenge });
  });

  steps.push({ id: 'complete', type: 'complete', title: 'Tổng kết và ôn lại', subtitle: 'Giỏi lắm! Poo sẽ giữ từ mới và các câu cần ôn cho ngày mai.' });
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
      explanation: 'Nghe nhiều lần giúp bạn nhớ cả cụm thay vì học rời từng chữ.',
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
      hint: 'Nếu trình duyệt không hỗ trợ micro, dùng nút tự đánh dấu đã luyện.',
      explanation: 'Mục tiêu là tạo thói quen nói thành tiếng mỗi ngày.',
    },
    {
      id: `day-${day.dayNumber}-mini-test`,
      type: 'multiple-choice',
      prompt: dailyTest[0] || 'Thử sức nhẹ: mẫu nào đúng với bài hôm nay?',
      target: miniTestTarget,
      answer: miniTestTarget,
      options: uniqueOptions([miniTestTarget, 'Subject + random word + not', 'Verb + subject + maybe', 'Only translate word by word']),
      hint: 'Chọn mẫu câu đúng nhất trước khi hoàn thành ngày học.',
      explanation: 'Thử sức nhẹ giúp Poo lưu tiến độ và nhắc lại cấu trúc quan trọng nhất của ngày.',
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
  if (challenge.id.endsWith('-mini-test') || challenge.id.endsWith('-speak-review')) return `${index + 1}. Thử sức nhẹ`;

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
  if (challenge.id.endsWith('-mini-test')) return 'Khép lại bằng một câu thử sức nhẹ trước khi Poo giữ tiến độ.';
  if (challenge.type === 'speaking-repeat') return 'Nói chậm, rõ. Có thể tự đánh dấu nếu máy chưa hỗ trợ nhận giọng nói.';
  if (challenge.type === 'listen-and-choose') return 'Dùng giọng đọc mẫu để nghe, sau đó chọn câu đúng.';
  return 'Làm từng nhịp để mở bước tiếp theo. Nếu vấp, Poo sẽ đưa câu đó vào phần ôn.';
}
