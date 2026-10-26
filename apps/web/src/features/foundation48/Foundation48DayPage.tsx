import { Box, Button, Flex, HStack, Icon, Image, Input, Progress, SimpleGrid, Text, Textarea, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronLeft, Headphones, Home, Mic, Play, RotateCcw, Sparkles, Star, Volume2 } from 'lucide-react';
import { OceanPageShell } from '../../components/p-english/OceanPageShell';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import { LearningHeartsBadge } from '../../components/learning/LearningHeartsBadge';
import { useAuth } from '../auth/AuthProvider';
import { syncLocalFoundation48ProgressToCloud } from './foundation48CloudProgress';
import { Foundation48AudioPlayer } from './Foundation48AudioPlayer';
import { FOUNDATION48_BASE_PATH, foundation48Days, foundation48Stages, getFoundation48Day, getFoundation48DayPath } from './foundation48Data';
import type { PooLesson, PooQuizItem } from '../../data/lessons/pooLessonTypes';
import type { Foundation48DeepLesson } from './foundation48DeepLessons';
import { getFoundation48CachedDeepLesson, getFoundation48DeepLesson, preloadFoundation48DeepLesson } from './foundation48DeepLessonResolver';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48DayProgress, markFoundation48Completed, markFoundation48Started, markFoundation48StepCompleted, recordFoundation48ChallengeResult } from './foundation48Progress';
import { getFoundation48PrimaryLesson } from './foundation48PrimaryPath';
import type { Foundation48Challenge, Foundation48Day, Foundation48LessonStep } from './foundation48Types';
import { getLearningHeartsState, isLearningLocked, LEARNING_HEARTS_UPDATED_EVENT, loseHeart, OUT_OF_BUBBLES_MESSAGE, type LearningHeartsState } from '../../lib/p-english/learning-hearts';
import { shuffleArrayStableCopy, shuffleChoiceOptions, shuffleTokensForQuestion, validateSentenceOrderAnswer } from '../../lib/p-english/practice-randomization';
import { isNearCorrectSpeechAnswer } from './foundation48SpeechMatcher';

const COLORS = { text: '#102A43', muted: '#52667A', blue: '#1D4ED8', border: '#BAE6FD', green: '#16A34A', coral: '#F9735B' };

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
  const returnTo = new URLSearchParams(location.search).get('returnTo') === '/today' ? '/today' : '/home';
  const auth = useAuth();
  const [version, setVersion] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(true);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncPromptDismissed, setSyncPromptDismissed] = useState(false);
  const [resolvedDeepLessonState, setResolvedDeepLesson] = useState<{ dayNumber: number; lesson?: Foundation48DeepLesson }>(() => ({
    dayNumber: day?.dayNumber ?? -1,
    lesson: day ? getFoundation48CachedDeepLesson(day.dayNumber) : undefined,
  }));
  const [deepLessonLoadState, setDeepLessonLoadState] = useState<{ dayNumber: number; status: 'loading' | 'error' } | null>(null);
  const resolvedDeepLesson = resolvedDeepLessonState.dayNumber === day?.dayNumber ? resolvedDeepLessonState.lesson : undefined;
  const progress = useMemo(() => day ? getFoundation48DayProgress(day.dayNumber) : {}, [day, version]);
  const steps = useMemo(() => day ? buildFoundation48Steps(day, resolvedDeepLesson, progress.exerciseSeed) : [], [day, resolvedDeepLesson, progress.exerciseSeed]);

  useEffect(() => {
    if (!day || !steps.length) return;
    const savedProgress = getFoundation48DayProgress(day.dayNumber);
    if (savedProgress.completed) {
      setStepIndex(Math.max(0, steps.findIndex((step) => step.type === 'complete')));
      return;
    }
    const completedSteps = new Set(savedProgress.completedSteps || []);
    const nextIncompleteStep = steps.findIndex((step) => !step.isBonus && !completedSteps.has(step.id));
    setStepIndex(nextIncompleteStep >= 0 ? nextIncompleteStep : Math.max(0, steps.findIndex((step) => step.type === 'complete')));
  }, [day?.dayNumber, steps]);

  useEffect(() => {
    if (day) markFoundation48Started(day.dayNumber);
  }, [day]);

  useEffect(() => {
    let cancelled = false;
    const currentDay = day?.dayNumber;
    setResolvedDeepLesson({ dayNumber: currentDay ?? -1, lesson: currentDay ? getFoundation48CachedDeepLesson(currentDay) : undefined });

    if (!currentDay) return;
    setDeepLessonLoadState(currentDay > 12 ? { dayNumber: currentDay, status: 'loading' } : null);

    getFoundation48DeepLesson(currentDay).then((lesson) => {
      if (cancelled) return;
      setResolvedDeepLesson({ dayNumber: currentDay, lesson });
      setDeepLessonLoadState(currentDay > 12 && !lesson ? { dayNumber: currentDay, status: 'error' } : null);
    }).catch(() => {
      if (cancelled) return;
      const cachedLesson = getFoundation48CachedDeepLesson(currentDay);
      setResolvedDeepLesson({ dayNumber: currentDay, lesson: cachedLesson });
      setDeepLessonLoadState(currentDay > 12 && !cachedLesson ? { dayNumber: currentDay, status: 'error' } : null);
    });

    if (currentDay < foundation48Days.length) {
      void preloadFoundation48DeepLesson(currentDay + 1).catch(() => undefined);
    }

    return () => {
      cancelled = true;
    };
  }, [day?.dayNumber]);

  function retryCurrentDeepLesson() {
    if (day?.dayNumber) window.location.reload();
  }

  useEffect(() => {
    setCanContinue(true);
  }, [day?.dayNumber]);

  useEffect(() => {
    setCanContinue(!steps[stepIndex]?.challenge);
  }, [stepIndex, steps]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 767px)').matches || !steps[stepIndex]?.challenge) return;
    const frame = window.requestAnimationFrame(() => {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      document.querySelector('[data-testid^="foundation48-challenge-"]')?.scrollIntoView({ block: 'start', behavior });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [day?.dayNumber, stepIndex, steps]);

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

  if (day.dayNumber > 12 && !resolvedDeepLesson) {
    const loadFailed = deepLessonLoadState?.dayNumber === day.dayNumber && deepLessonLoadState.status === 'error';
    return (
      <OceanPageShell data-testid={loadFailed ? 'foundation48-day-load-error' : 'foundation48-day-loading'} variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '6', md: '10' }}>
        <Box maxW="680px" mx="auto" role={loadFailed ? 'alert' : 'status'} aria-live="polite" className="penglish-glass-card" bg="rgba(255,255,255,0.86)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '4', md: '6' }}>
          <HStack gap="3" align="center">
            {loadFailed
              ? <OceanMascot mascot="poo" pose="coach" size="sm" decorative motion="float" />
              : <OceanMascot mascot="ruaRi" pose="map" size="sm" decorative motion="float" />}
            <Box>
              <Text color={COLORS.blue} fontWeight="950">{loadFailed ? `Bài học ngày ${day.dayNumber} chưa tải được.` : `Rùa Rì đang mở bản đồ ngày ${day.dayNumber}…`}</Text>
              <Text mt="1" color={COLORS.muted} fontWeight="750">{loadFailed ? 'Kết nối có thể vừa gián đoạn. Tải lại để kết nối lại; tiến độ đã lưu vẫn được giữ nguyên.' : 'Đang tải đúng bài học của chặng này.'}</Text>
            </Box>
          </HStack>
          {loadFailed ? (
            <Button mt="4" colorScheme="blue" onClick={retryCurrentDeepLesson} data-testid="foundation48-retry-day-load">
              <RotateCcw size={16} /> Thử tải lại bài học
            </Button>
          ) : null}
        </Box>
      </OceanPageShell>
    );
  }

  const previousDay = day.dayNumber > 1 ? day.dayNumber - 1 : null;
  const nextDay = day.dayNumber < foundation48Days.length ? day.dayNumber + 1 : null;
  const completed = Boolean(progress.completed);
  const currentStep = steps[stepIndex] ?? steps[0];
  const completedSteps = new Set(progress.completedSteps || []);
  const bonusSteps = steps.filter((step) => step.isBonus);
  const remainingBonusSteps = bonusSteps.filter((step) => !completedSteps.has(step.id));
  const mainQuestSteps = steps.filter((step) => !step.isBonus && step.type !== 'complete');
  const isBonusRound = Boolean(currentStep?.isBonus);
  const mainProgressNumber = steps.slice(0, stepIndex + 1).filter((step) => !step.isBonus && step.type !== 'complete').length;
  const bonusProgressNumber = isBonusRound ? bonusSteps.findIndex((step) => step.id === currentStep.id) + 1 : 0;
  const progressNumber = isBonusRound ? bonusProgressNumber : Math.min(mainProgressNumber, mainQuestSteps.length);
  const progressTotal = isBonusRound ? bonusSteps.length : mainQuestSteps.length;
  const progressPhaseLabel = completed ? 'Hoàn thành' : isBonusRound ? 'Vòng thưởng · tùy chọn' : 'Nhiệm vụ chính';
  const progressLabel = completed ? 'Hoàn thành' : isBonusRound ? 'Vòng thưởng · tùy chọn' : 'Mạch học';
  const progressValueLabel = completed ? 'Xong' : `${progressNumber}/${progressTotal}`;
  const stepPositionLabel = completed
    ? `Ngày ${day.dayNumber} · Đã xong`
    : isBonusRound
      ? `Ngày ${day.dayNumber} · Vòng thưởng ${bonusProgressNumber}/${bonusSteps.length}`
      : `Ngày ${day.dayNumber} · Bước ${Math.min(mainProgressNumber, mainQuestSteps.length)}/${mainQuestSteps.length}`;
  const stepPercent = progressTotal > 0 ? Math.round((progressNumber / progressTotal) * 100) : 0;
  const currentChallenges = new Map(steps.flatMap((step) => step.challenge ? [[step.challenge.id, step.challenge] as const] : []));
  const scoredChallengeResults = Object.values(progress.challengeResults || {}).filter((item) => {
    const challenge = currentChallenges.get(item.challengeId);
    return Boolean(challenge && challenge.type !== 'speaking-repeat' && item.scoreEligible !== false && (item.firstAttemptCorrect ?? item.correct) !== null);
  });
  const challengeScore = scoredChallengeResults.length
    ? Math.round((scoredChallengeResults.filter((item) => (item.firstAttemptCorrect ?? item.correct) === true).length / scoredChallengeResults.length) * 100)
    : undefined;
  const isCompletionStep = currentStep?.type === 'complete';
  const showCompletionSyncPrompt = completed && isCompletionStep && Boolean(auth.user?.id) && !syncPromptDismissed;

  function goNext() {
    if (!day || !currentStep) return;
    markFoundation48StepCompleted(day.dayNumber, currentStep.id);
    if (stepIndex < steps.length - 1) {
      if (currentStep.isBonus) {
        const justCompleted = new Set(getFoundation48DayProgress(day.dayNumber).completedSteps || []);
        const nextBonusIndex = steps.findIndex((step, index) => index > stepIndex && step.isBonus && !justCompleted.has(step.id));
        const completionIndex = steps.findIndex((step) => step.type === 'complete');
        setStepIndex(nextBonusIndex >= 0 ? nextBonusIndex : Math.max(0, completionIndex));
      } else {
        const nextRequiredIndex = steps.findIndex((step, index) => index > stepIndex && !step.isBonus);
        setStepIndex(nextRequiredIndex >= 0 ? nextRequiredIndex : steps.length - 1);
      }
      return;
    }
    markFoundation48Completed(day.dayNumber, steps.filter((step) => !step.isBonus).map((step) => step.id), challengeScore);
  }

  function completeDay() {
    if (!day) return;
    markFoundation48Completed(day.dayNumber, steps.filter((step) => !step.isBonus).map((step) => step.id), challengeScore);
    setStepIndex(Math.max(0, steps.findIndex((step) => step.type === 'complete')));
    navigate(returnTo);
  }

  function startBonusRound() {
    const firstRemainingBonus = steps.findIndex((step) => step.isBonus && !completedSteps.has(step.id));
    if (firstRemainingBonus >= 0) setStepIndex(firstRemainingBonus);
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
        <Button data-testid="foundation48-back-link" as={Link} to={returnTo === '/today' ? '/today' : FOUNDATION48_BASE_PATH} leftIcon={<Icon as={ChevronLeft} />} variant="ghost" color={COLORS.blue} borderRadius="full" mb="3">
          {returnTo === '/today' ? 'Về phiên học hôm nay' : 'Về lộ trình 48 ngày'}
        </Button>

        <Box data-testid="foundation48-lesson-hero" className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '3', md: '6' }} bg="rgba(255,255,255,0.84)" mb={{ base: '3', md: '4' }} overflow="hidden" position="relative">
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 18%, rgba(102,217,200,0.16), transparent 30%)" pointerEvents="none" />
          <Flex position="relative" justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
            <Box minW="0" flex="1">
              <HStack gap="2" wrap="wrap">
                <Text px="3" py="1.5" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="950" fontSize="xs">Ngày {day.dayNumber}</Text>
                <Text px="3" py="1.5" borderRadius="full" bg={completed ? '#ECFDF5' : isBonusRound ? '#FFF7ED' : '#F8FAFC'} color={completed ? COLORS.green : isBonusRound ? '#B45309' : COLORS.muted} fontWeight="950" fontSize="xs" data-testid="foundation48-flow-phase">{progressPhaseLabel}</Text>
              </HStack>
              <Text as="h1" mt={{ base: '1.5', md: '2' }} color={COLORS.text} fontSize={{ base: 'xl', md: '4xl' }} lineHeight="1.12" fontWeight="950">
                {day.title}
              </Text>
              <Text mt={{ base: '1', md: '2' }} color={COLORS.muted} fontWeight="750" lineHeight="1.45" fontSize={{ base: 'sm', md: 'md' }} noOfLines={2}>5 thử thách chính, rồi áp dụng ngay vào nhiệm vụ thực tế.</Text>
              <Flex mt={{ base: '3', md: '4' }} gap={{ base: '2.5', md: '3' }} align="center">
                <Image src="/assets/foundation48/quest-route-guide.webp" alt="" aria-hidden="true" loading="eager" decoding="async" fetchPriority="high" w={{ base: '96px', sm: '116px', md: '154px' }} h="auto" flexShrink={0} />
                <Box flex="1" minW="0">
                  <HStack justify="space-between" mb="1" gap="2">
                    <Text fontSize="xs" color={COLORS.muted} fontWeight="900" data-testid="foundation48-flow-progress-label">{progressLabel}</Text>
                    <Text fontSize="xs" color={completed ? COLORS.green : isBonusRound ? '#B45309' : COLORS.blue} fontWeight="950" data-testid="foundation48-flow-progress-value">{progressValueLabel}</Text>
                  </HStack>
                  <Progress value={stepPercent} aria-label={`Tiến độ ${progressLabel}: ${progressValueLabel}`} colorScheme={isBonusRound ? 'orange' : 'blue'} borderRadius="full" h="9px" bg="#E8F4FF" data-testid="foundation48-flow-progress-bar" />
                </Box>
              </Flex>
            </Box>
            <Box display={{ base: 'none', md: 'block' }}>
              {completed ? <OceanMascot mascot="saoNhi" pose="reward" size="md" decorative motion="celebrate" /> : <OceanMascot mascot="poo" size="md" decorative motion="float" />}
            </Box>
          </Flex>
        </Box>

        <Box display={{ base: 'none', md: 'block' }}>
          <TodayThreeThingsCard />
        </Box>

        <LessonStepperCard day={day} step={currentStep} stepPositionLabel={stepPositionLabel} completed={completedSteps.has(currentStep?.id)} score={challengeScore} returnTo={returnTo} onReadyChange={setCanContinue} onContinue={goNext} />

        <Flex data-testid="foundation48-step-actions" display={{ base: 'none', md: 'flex' }} mt="4" justify="space-between" align="center" gap="3">
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
            <Button data-testid="foundation48-complete-day" leftIcon={<Icon as={returnTo === '/today' ? Sparkles : Home} />} colorScheme="blue" borderRadius="full" onClick={completeDay}>
              {returnTo === '/today' ? 'Hoàn thành & tiếp tục phiên' : 'Hoàn thành & về trang chủ'}
            </Button>
          )}
        </Flex>

        <Flex data-testid="foundation48-mobile-step-actions" display={{ base: isCompletionStep && completed ? 'none' : 'flex', md: 'none' }} position="fixed" left="0" right="0" bottom="calc(var(--penglish-mobile-nav-height) + env(safe-area-inset-bottom))" zIndex="20" gap="2" px="3" pt="3" pb="3" bg="linear-gradient(180deg, rgba(248,252,255,0), rgba(248,252,255,0.96) 30%, rgba(248,252,255,1))">
          <Button flex="1" minW="0" minH="48px" leftIcon={<Icon as={ArrowLeft} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="rgba(255,255,255,0.96)" borderRadius="full" isDisabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))}>
            Quay lại
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button flex="1.4" minW="0" minH="48px" rightIcon={<Icon as={ArrowRight} />} bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} borderRadius="full" onClick={goNext} isDisabled={!canContinue}>
              Tiếp tục
            </Button>
          ) : completed ? (
            <HStack flex="1.4" justify="center" px="3" borderRadius="full" border="1px solid" borderColor="#BBF7D0" bg="#ECFDF5" color={COLORS.green} data-testid="foundation48-mobile-completed-status-badge">
              <Icon as={CheckCircle2} boxSize="4" />
              <Text fontSize="sm" fontWeight="950">Đã hoàn thành</Text>
            </HStack>
          ) : (
            <Button data-testid="foundation48-mobile-complete-day" flex="1.4" minW="0" minH="48px" leftIcon={<Icon as={returnTo === '/today' ? Sparkles : Home} />} bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} borderRadius="full" onClick={completeDay}>
              Hoàn thành
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

        {isCompletionStep && remainingBonusSteps.length > 0 ? (
          <Box mt="3" className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4" bg="rgba(255,255,255,0.78)" data-testid="foundation48-bonus-round">
            <HStack justify="space-between" align={{ base: 'stretch', sm: 'center' }} gap="3" flexDirection={{ base: 'column', sm: 'row' }}>
              <Box>
                <Text color={COLORS.blue} fontWeight="950">Vòng thưởng · {remainingBonusSteps.length} thử thách</Text>
                <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="750">Luyện thêm nếu bạn muốn; nhiệm vụ ngày đã gọn lại.</Text>
              </Box>
              <Button data-testid="foundation48-bonus-start" flexShrink={0} colorScheme="blue" variant="outline" borderRadius="full" onClick={startBonusRound}>Chơi vòng thưởng</Button>
            </HStack>
          </Box>
        ) : isCompletionStep && bonusSteps.length > 0 ? (
          <Box mt="3" border="1px solid" borderColor="#BBF7D0" borderRadius="2xl" p="3" color={COLORS.green} fontWeight="850" data-testid="foundation48-bonus-complete">Vòng thưởng đã hoàn thành. Bạn có thể xem lại bài ở trên.</Box>
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
        <Flex data-testid="foundation48-day-neighbor-actions" display={{ base: completed ? 'flex' : 'none', md: 'flex' }} mt="5" justify="space-between" gap="3" direction={{ base: 'column', sm: 'row' }}>
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

function LessonStepperCard({ day, step, stepPositionLabel, completed, score, returnTo, onReadyChange, onContinue }: { day: Foundation48Day; step?: Foundation48LessonStep; stepPositionLabel: string; completed: boolean; score?: number; returnTo: '/today' | '/home'; onReadyChange: (ready: boolean) => void; onContinue: () => void }) {
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

        {step.subtitle ? <Text color={COLORS.muted} fontWeight="800" lineHeight="1.5" noOfLines={2}>{step.subtitle}</Text> : null}
        {step.type === 'intro' ? <Foundation48MissionCard day={day} /> : null}
        {step.body && step.type !== 'listening' ? <PooMoreDetails body={step.body} /> : null}
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
        {step.challenge ? <ChallengeCard key={step.challenge.id} dayNumber={day.dayNumber} stepPositionLabel={stepPositionLabel} challenge={step.challenge} onReadyChange={onReadyChange} onContinue={onContinue} /> : null}
        {step.type === 'complete' ? <CompletePrompt day={day} returnTo={returnTo} score={score} /> : null}
      </VStack>
    </Box>
  );
}

const foundation48MissionStories = [
  'Giúp Poo làm quen với cư dân biển bằng những câu chào hỏi và giới thiệu đầu tiên.',
  'Mở nhật ký cá nhân: kể về mình, người thân và nhịp sống thường ngày.',
  'Vượt thử thách ở trạm học tập và công việc bằng câu hỏi, câu trả lời rõ ý.',
  'Đến chợ và bến tàu: hỏi món ăn, giá cả và đường đi trong tình huống thật.',
  'Theo dòng thời gian: kể chuyện đã qua và nói kế hoạch sắp tới.',
  'Băng qua cây cầu giao tiếp: kết hợp câu đã học để xử lý hội thoại đời thường.',
] as const;

function Foundation48MissionCard({ day }: { day: Foundation48Day }) {
  const chapterIndex = Math.max(0, foundation48Stages.findIndex((stage) => stage.days.some((stageDay) => stageDay === day.dayNumber)));
  const chapter = foundation48Stages[chapterIndex];
  const dayPosition = chapter ? day.dayNumber - chapter.days[0] + 1 : 1;
  const chapterLength = chapter?.days.length ?? 8;

  return (
    <Box border="1px solid" borderColor="rgba(125,211,252,0.78)" borderRadius="2xl" p={{ base: '3', md: '4' }} bg="linear-gradient(135deg, rgba(239,246,255,0.96), rgba(240,253,250,0.92))" data-testid="foundation48-daily-mission">
      <Flex gap="3" align="center">
        <OceanMascot mascot="ruaRi" pose="map" size="sm" decorative motion="float" imageLoading="lazy" />
        <Box minW="0" flex="1">
          <Text color={COLORS.blue} fontSize="xs" fontWeight="950" textTransform="uppercase" letterSpacing="0.08em">Nhiệm vụ ngày {day.dayNumber} · Chặng {chapterIndex + 1}/6</Text>
          <Text color={COLORS.text} fontWeight="950" lineHeight="1.35">{chapter?.title ?? 'Hành trình 48 ngày'}</Text>
          <Text mt="1" color={COLORS.muted} fontWeight="750" fontSize="sm" lineHeight="1.5">{foundation48MissionStories[chapterIndex]}</Text>
        </Box>
      </Flex>
      <Flex mt="3" justify="space-between" align="center" gap="3" wrap="wrap">
        <Text color={COLORS.blue} fontSize="sm" fontWeight="900" data-testid="foundation48-chapter-progress">{dayPosition}/{chapterLength} ngày trong chặng</Text>
        <Text color={COLORS.green} fontSize="sm" fontWeight="900">Hoàn thành thử thách để lưu tiến độ và nhận XP</Text>
      </Flex>
    </Box>
  );
}

function TodayThreeThingsCard() {
  const items = [
    { label: 'Từ vựng', icon: BookOpen },
    { label: 'Mẫu câu', icon: RotateCcw },
    { label: 'Nghe', icon: Headphones },
    { label: 'Nói', icon: Mic },
    { label: 'Quiz', icon: Sparkles },
    { label: 'Nhiệm vụ thực tế', icon: Star },
  ];

  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.74)" mb={{ base: '3', md: '4' }} data-testid="foundation48-three-things-card">
      <Text color={COLORS.text} fontWeight="950">Mạch học hôm nay</Text>
      <Text mt="1" mb="3" color={COLORS.muted} fontSize="sm" fontWeight="750" lineHeight="1.45">5 thử thách chính dẫn tới một nhiệm vụ thực tế. Vòng luyện thêm là tùy chọn.</Text>
      <SimpleGrid columns={{ base: 2, md: 3 }} gap="2">
        {items.map((item) => (
          <HStack key={item.label} border="1px solid" borderColor="rgba(186,230,253,0.78)" bg="rgba(255,255,255,0.82)" borderRadius="2xl" px="2.5" py="2.5" gap="2" minW="0">
            <Icon as={item.icon} color={COLORS.blue} boxSize="4" flexShrink={0} />
            <Text color={COLORS.text} fontWeight="900" fontSize="xs" lineHeight="1.25">{item.label}</Text>
          </HStack>
        ))}
      </SimpleGrid>
    </Box>
  );
}

function PooMoreDetails({ body }: { body: string }) {
  return (
    <Box as="details" border="1px solid" borderColor="rgba(186,230,253,0.72)" bg="rgba(255,255,255,0.64)" borderRadius="2xl" p="3" data-testid="foundation48-poo-more-details">
      <Flex as="summary" cursor="pointer" minH="44px" align="center" color={COLORS.blue} fontWeight="950" sx={{ '&::-webkit-details-marker': { display: 'none' } }}>
        Poo giải thích thêm
      </Flex>
      <Text mt="3" color={COLORS.text} fontWeight="750" lineHeight="1.65" whiteSpace="pre-line">{body}</Text>
    </Box>
  );
}

function ListenFirstActivity({ step, day }: { step: Foundation48LessonStep; day: Foundation48Day }) {
  const targetSentence = extractFirstSentence(step.body || day.summary.examples[0] || day.summary.summary);
  const [listened, setListened] = useState(false);
  const [readAlong, setReadAlong] = useState(false);
  const [speechUnavailable, setSpeechUnavailable] = useState(() => typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined' || typeof window.SpeechSynthesisUtterance === 'undefined');

  useEffect(() => {
    setListened(false);
    setReadAlong(false);
    setSpeechUnavailable(typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined' || typeof window.SpeechSynthesisUtterance === 'undefined');
  }, [step.id]);

  function listen() {
    const played = speakEnglish(targetSentence, true);
    setSpeechUnavailable(!played);
    if (played) setListened(true);
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
        {speechUnavailable ? <Text role="status" aria-live="polite" fontSize="sm" color={COLORS.muted} fontWeight="750" data-testid="foundation48-speech-unavailable">Thiết bị chưa hỗ trợ đọc mẫu tự động. Bạn vẫn có thể đọc câu và tự đánh dấu khi luyện xong.</Text> : null}
        {step.bullets?.length ? (
          <Box border="1px solid" borderColor="rgba(186,230,253,0.72)" bg="rgba(255,255,255,0.82)" borderRadius="2xl" p="3" data-testid="foundation48-dialogue-lines">
            <Text color={COLORS.blue} fontWeight="950" fontSize="sm" mb="2">Lời thoại dễ đọc</Text>
            <VStack align="stretch" gap="2">
              {step.bullets.slice(0, 6).map((line, index) => (
                <Text key={`${line}-${index}`} color={COLORS.text} fontWeight="850" lineHeight="1.55" fontSize={{ base: 'sm', md: 'md' }}>
                  {line}
                </Text>
              ))}
            </VStack>
          </Box>
        ) : null}
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
          <SpeakButton mt="3" size="sm" text={item.pattern} label="Nghe mẫu" slow />
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
                  <SpeakButton size="sm" text={card.word} label="Nghe" slow />
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
              <Text color={COLORS.text} fontWeight="950" lineHeight="1.25">Nói theo từng câu</Text>
              <Text color={COLORS.muted} fontSize="sm" fontWeight="750" lineHeight="1.45" noOfLines={2}>Nghe mẫu, nói thành tiếng, rồi đánh dấu xong.</Text>
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
                    <SpeakButton text={drill.sentence} label="Nghe mẫu" slow flex={{ base: '1 1 auto', sm: '0 0 auto' }} minH="42px" />
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

function ChallengeCard({ dayNumber, stepPositionLabel, challenge, onReadyChange, onContinue }: { dayNumber: number; stepPositionLabel: string; challenge: Foundation48Challenge; onReadyChange: (ready: boolean) => void; onContinue: () => void }) {
  const [answer, setAnswer] = useState('');
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [choiceOptions] = useState(() => shuffleChoiceOptions(challenge.options || [], challenge.answer, `${challenge.id}:${Math.random()}`));
  const [listening, setListening] = useState(false);
  const [selfPracticed, setSelfPracticed] = useState(false);
  const [heartsState, setHeartsState] = useState<LearningHeartsState>(() => getLearningHeartsState());
  const isChoiceChallenge = challenge.type === 'multiple-choice' || challenge.type === 'listen-and-choose';
  const isFreeResponse = challenge.type === 'free-response';
  const progressLabel = getChallengeProgressLabel(challenge);
  const challengeMascot = challenge.audioSrc ? 'suaNghe' : getFoundation48ChallengeMascot(challenge.type);
  const verifiedCorrectAnswer = Boolean(feedback?.correct && !challenge.selfCheckOnly);
  const fillBlankInputRef = useRef<HTMLInputElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const [sentenceShuffleSeed] = useState(() => Math.random());
  const sentenceTokens = useMemo(() => {
    const words = shuffleTokensForQuestion(challenge.tokens || [], `${challenge.id}:${sentenceShuffleSeed}`);
    if (validateSentenceOrderAnswer(words, challenge.answer) && words.length > 1) [words[0], words[1]] = [words[1], words[0]];
    return words.map((text, index) => ({ id: `${challenge.id}-token-${index}`, text }));
  }, [challenge.id, challenge.tokens, challenge.answer, sentenceShuffleSeed]);
  const selectedTokens = selectedTokenIds
    .map((tokenId) => sentenceTokens.find((token) => token.id === tokenId))
    .filter((token): token is { id: string; text: string } => Boolean(token));
  const availableTokens = sentenceTokens.filter((token) => !selectedTokenIds.includes(token.id));

  useEffect(() => {
    setAnswer('');
    setSelectedTokenIds([]);
    setFeedback(null);
    setHintVisible(false);
    setSelfPracticed(false);
    onReadyChange(false);
  }, [challenge.id, onReadyChange]);

  useEffect(() => {
    if ((challenge.type !== 'fill-blank' && challenge.type !== 'picture-response') || feedback) return;
    const focusTimer = window.setTimeout(() => fillBlankInputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [challenge.id, challenge.type, feedback]);

  useEffect(() => {
    const refreshHearts = () => setHeartsState(getLearningHeartsState());
    refreshHearts();
    window.addEventListener('focus', refreshHearts);
    window.addEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshHearts);
    return () => {
      window.removeEventListener('focus', refreshHearts);
      window.removeEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshHearts);
    };
  }, []);

  useEffect(() => {
    if (!feedback || !window.matchMedia('(max-width: 767px)').matches) return;
    const animationFrame = window.requestAnimationFrame(() => {
      const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      feedbackRef.current?.scrollIntoView({ behavior, block: 'center' });
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [feedback]);

  const currentAnswer = challenge.type === 'sentence-order' ? selectedTokens.map((token) => token.text).join(' ') : answer;
  const submissionLocked = Boolean(feedback?.correct && !isFreeResponse && !challenge.selfCheckOnly);

  function submit(value = currentAnswer) {
    if (submissionLocked) return;
    if (!value.trim()) return;
    if (!challenge.selfCheckOnly && isLearningLocked(heartsState)) {
      setFeedback({ correct: false, message: OUT_OF_BUBBLES_MESSAGE });
      onReadyChange(false);
      return;
    }

    const normalizedValue = normalizeAnswer(value);
    if (challenge.selfCheckOnly) {
      setFeedback({ correct: true, message: 'Đã lưu lượt nghe luyện tập. Đáp án nguồn chưa được kiểm chứng; nghe lại để tự đối chiếu. Lượt này không ảnh hưởng đến điểm số hay số bọt biển của bạn.' });
      recordFoundation48ChallengeResult(dayNumber, challenge, null, value.trim());
      onReadyChange(true);
      return;
    }
    const acceptable = [challenge.answer, ...(challenge.acceptableAnswers ?? [])].map(normalizeAnswer);
    const exactCorrect = acceptable.includes(normalizedValue);
    const nearCorrectSpeaking = challenge.type === 'speaking-repeat' && isNearCorrectSpeechAnswer(challenge.answer, value);
    const correct = exactCorrect || nearCorrectSpeaking;
    const wrongMessage = challenge.type === 'sentence-order'
      ? 'Thử đặt chủ ngữ trước nhé.'
      : challenge.type === 'speaking-repeat'
        ? 'Poo chưa nghe rõ câu. Bạn thử nói chậm hơn hoặc tự đánh dấu đã luyện.'
        : challenge.type === 'listen-and-choose'
          ? 'Chưa khớp với câu mẫu. Nghe lại rồi chọn lần nữa nhé.'
          : challenge.type === 'fill-blank'
            ? 'Chưa đúng. Đọc câu và gợi ý rồi thử lại nhé.'
            : challenge.type === 'picture-response'
              ? 'Câu chưa khớp với tranh. Xem gợi ý rồi viết lại nhé.'
            : 'Chưa đúng. Xem gợi ý, rồi chọn lại đáp án nhé.';
    if (!correct) {
      const nextHearts = loseHeart('foundation48-challenge-wrong');
      setHeartsState(nextHearts);
      if (challenge.hint) setHintVisible(true);
    }
    const nearCorrectMessage = 'Đạt rồi, Poo góp ý nhẹ nha. Chỉ cần nói câu ngắn, đúng ý, rõ nhịp. Không cần nói hoàn hảo.';
    setFeedback({ correct, message: exactCorrect ? 'Đúng rồi!' : nearCorrectSpeaking ? nearCorrectMessage : wrongMessage });
    recordFoundation48ChallengeResult(dayNumber, challenge, correct, value || '(chưa trả lời)');
    onReadyChange(correct);
  }

  function handleFillBlankKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (feedback?.correct) {
      onContinue();
      return;
    }
    if (feedback || !answer.trim()) return;
    submit(answer);
  }

  function markSelfPracticed() {
    setSelfPracticed(true);
    setAnswer(challenge.answer);
    setFeedback({ correct: true, message: 'Đã nói xong. Poo ghi nhận phần tự luyện; bước này không được tính là câu trả lời đúng.' });
    recordFoundation48ChallengeResult(dayNumber, challenge, null, challenge.answer);
    onReadyChange(true);
  }

  function markResponseComplete() {
    if (!answer.trim()) return;
    setFeedback({ correct: true, message: 'Đã lưu phần trả lời tự do. Phần này chưa được chấm tự động nên không tính vào điểm đúng.' });
    recordFoundation48ChallengeResult(dayNumber, challenge, null, answer.trim());
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
    recognition.onerror = () => {
      setListening(false);
      setFeedback({ correct: false, message: 'Poo chưa nghe rõ. Kiểm tra quyền micro, thử lại hoặc tự đánh dấu đã luyện.' });
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setFeedback({ correct: false, message: 'Không thể bật micro. Cho phép trình duyệt dùng micro rồi thử lại hoặc tự đánh dấu đã luyện.' });
    }
  }

  return (
    <Box border="1px solid" borderColor={verifiedCorrectAnswer ? '#BBF7D0' : COLORS.border} bg={verifiedCorrectAnswer ? 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)' : 'linear-gradient(135deg, rgba(248,250,252,0.96), rgba(239,246,255,0.84))'} borderRadius="3xl" p={{ base: '3.5', md: '5' }} data-testid={`foundation48-challenge-${challenge.type}`} data-challenge-id={challenge.id}>
      <VStack align="stretch" gap="4">
        <Flex justify="space-between" align={{ base: 'stretch', md: 'start' }} gap="3" direction={{ base: 'column', md: 'row' }}>
          <HStack align="start" gap="2.5" minW="0" flex="1">
            <Box minW="0" flex="1">
              <HStack gap="2" wrap="wrap" mb="2">
                <Text color={COLORS.blue} fontWeight="950" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">{getFoundation48ChallengeLabel(challenge.type)}</Text>
                <Text px="2.5" py="1" borderRadius="full" bg="white" border="1px solid" borderColor={COLORS.border} color={COLORS.muted} fontWeight="900" fontSize="xs" data-testid="foundation48-focused-step-position">{stepPositionLabel}</Text>
                {progressLabel ? <Text px="2.5" py="1" borderRadius="full" bg="white" border="1px solid" borderColor={COLORS.border} color={COLORS.blue} fontWeight="950" fontSize="xs" data-testid="foundation48-quiz-progress">{progressLabel}</Text> : null}
                <LearningHeartsBadge compact />
              </HStack>
              <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.3">{challenge.prompt}</Text>
              {challenge.picture ? (() => {
                const columns = challenge.picture.gridColumns ?? 3;
                const rows = challenge.picture.gridRows ?? 2;
                return <Box data-testid="foundation48-question-image" role="img" aria-label={challenge.picture.alt} w={{ base: 'min(100%, 240px)', md: '280px' }} aspectRatio="1" position="relative" overflow="hidden" borderRadius="2xl" border="1px solid" borderColor={COLORS.border} bg="white" mt="3"><Image src={challenge.picture.src} alt={challenge.picture.alt} loading="lazy" position="absolute" w={`${columns * 100}%`} h={`${rows * 100}%`} maxW="none" objectFit="fill" left={`${-((challenge.picture.panel % columns) * 100)}%`} top={`${-(Math.floor(challenge.picture.panel / columns) * 100)}%`} /></Box>;
              })() : null}
              {challenge.hint && hintVisible ? <Text mt="1.5" color={COLORS.muted} fontWeight="750" lineHeight="1.55" data-testid="foundation48-challenge-hint">Gợi ý: {challenge.hint}</Text> : null}
            </Box>
            <OceanMascot mascot={challengeMascot} size="xs" decorative motion={verifiedCorrectAnswer && challenge.type !== 'speaking-repeat' && challenge.type !== 'free-response' ? 'celebrate' : challengeMascot === 'saoNhi' ? 'celebrate' : 'float'} imageLoading="lazy" />
          </HStack>
          {challenge.hint ? (
            <Button size="sm" alignSelf="start" mt="2" leftIcon={<Icon as={Sparkles} />} variant="outline" borderColor={COLORS.border} bg="rgba(255,255,255,0.72)" color={COLORS.blue} borderRadius="full" onClick={() => setHintVisible((visible) => !visible)} aria-expanded={hintVisible} data-testid="foundation48-toggle-hint">
              {hintVisible ? 'Ẩn gợi ý' : 'Gợi ý của Poo'}
            </Button>
          ) : null}
          {(challenge.type === 'listen-and-choose' || challenge.type === 'speaking-repeat') && !challenge.audioSrc ? <SpeakButton text={challenge.target || challenge.answer} label="Nghe mẫu" slow /> : null}
          {challenge.speakText ? <SpeakButton text={challenge.speakText} label="Nghe số đọc mẫu" slow /> : null}
        </Flex>

        {challenge.audioSrc ? (
          <Box border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="3" bg="rgba(255,255,255,0.88)" data-testid="foundation48-source-audio-player">
            <Text mb="2" color={COLORS.muted} fontSize="xs" fontWeight="800">Âm thanh gốc · {challenge.audioLabel}. Mỗi tệp có nhiều câu; nghe lại để tìm mục đang làm.</Text>
            <Box as="audio" aria-label={`Âm thanh gốc ${challenge.audioLabel}`} controls preload="none" src={challenge.audioSrc} w="100%" />
          </Box>
        ) : null}

        {isChoiceChallenge ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" data-testid="foundation48-choice-options">
            {choiceOptions.map((option, index) => {
              const selected = answer === option;
              return <Button key={option} whiteSpace="normal" h="auto" minH="56px" py="3.5" px="4" justifyContent="flex-start" textAlign="left" borderRadius="2xl" border="1px solid" borderColor={selected ? '#7DD3FC' : COLORS.border} bg={selected ? COLORS.blue : 'white'} color={selected ? 'white' : COLORS.text} _hover={{ bg: selected ? '#185BB2' : '#EFF6FF' }} fontWeight="900" onClick={() => { setAnswer(option); submit(option); }} isDisabled={submissionLocked || (!challenge.selfCheckOnly && isLearningLocked(heartsState))} data-testid={`foundation48-answer-option-${index + 1}`}>{option}</Button>;
            })}
          </SimpleGrid>
        ) : null}

        {challenge.type === 'fill-blank' || challenge.type === 'picture-response' ? (
          <VStack align="stretch" gap="2">
            <Flex gap="3" align={{ base: 'stretch', sm: 'center' }} direction={{ base: 'column', sm: 'row' }}>
              <Input ref={fillBlankInputRef} aria-label={challenge.prompt} value={answer} onChange={(event) => { setAnswer(event.target.value); if (feedback) setFeedback(null); onReadyChange(false); }} placeholder={challenge.type === 'picture-response' ? 'Viết một câu tiếng Anh...' : 'Nhập đáp án...'} bg="white" borderColor={COLORS.border} borderRadius="full" fontWeight="850" minH="48px" onKeyDown={handleFillBlankKeyDown} isReadOnly={submissionLocked} isDisabled={!challenge.selfCheckOnly && isLearningLocked(heartsState)} data-testid={challenge.type === 'picture-response' ? 'foundation48-picture-answer' : 'foundation48-fill-answer'} />
              <Button bg={COLORS.blue} color="white" borderRadius="full" minH="48px" onClick={() => submit()} isDisabled={submissionLocked || !answer.trim() || (!challenge.selfCheckOnly && isLearningLocked(heartsState))} flexShrink={0}>{challenge.type === 'picture-response' ? 'Kiểm tra câu' : challenge.selfCheckOnly ? 'Lưu lượt nghe' : 'Poo xem giúp'}</Button>
            </Flex>
            <Text fontSize={{ base: 'xs', md: 'sm' }} color={COLORS.muted} fontWeight="750">{challenge.selfCheckOnly ? 'Gõ nội dung bạn nghe được rồi lưu để tiếp tục. Đáp án nguồn chưa được xác minh, nên lượt luyện này không ảnh hưởng đến điểm số hay số bọt biển của bạn.' : 'Mẹo: Nhấn Enter để kiểm tra, đúng rồi thì Enter lần nữa để đi tiếp.'}</Text>
          </VStack>
        ) : null}

        {isFreeResponse ? (
          <VStack align="stretch" gap="3">
            {challenge.phraseBank?.length ? (
              <Box p="4" borderRadius="2xl" bg="#F0F9FF" border="1px solid #BAE6FD" data-testid="foundation48-application-phrase-bank">
                <Text fontSize="sm" fontWeight="900" color={COLORS.blue} mb="3">Mẫu câu gợi ý · chạm để đưa vào câu trả lời</Text>
                <Flex gap="2" wrap="wrap">
                  {challenge.phraseBank.map((phrase, index) => {
                    const alreadyAdded = answer.includes(phrase);
                    return <Button key={`${phrase}-${index}`} data-testid={`foundation48-application-phrase-card-${index}`} size="sm" borderRadius="full" colorScheme={alreadyAdded ? 'green' : 'blue'} variant={alreadyAdded ? 'solid' : 'outline'} isDisabled={alreadyAdded} onClick={() => { setAnswer(answer.trim() ? `${answer.trim()}\n${phrase}` : phrase); setFeedback(null); onReadyChange(false); }}>
                      {alreadyAdded ? '✓ ' : '+ '}{phrase}
                    </Button>;
                  })}
                </Flex>
              </Box>
            ) : null}
            <Textarea aria-label={challenge.prompt} value={answer} onChange={(event) => { setAnswer(event.target.value); if (feedback) setFeedback(null); onReadyChange(false); }} placeholder="Viết câu trả lời tiếng Anh của bạn..." bg="white" borderColor={COLORS.border} borderRadius="2xl" minH="140px" data-testid="foundation48-free-response" />
            <Text color={COLORS.muted} fontSize="sm" fontWeight="750">Đây là câu hỏi mở. Poo lưu câu trả lời để bạn tự xem lại, không tự chấm đúng/sai.</Text>
            <Button bg={COLORS.blue} color="white" borderRadius="full" minH="48px" alignSelf="start" onClick={markResponseComplete} isDisabled={!answer.trim()}>Lưu câu trả lời</Button>
          </VStack>
        ) : null}

        {challenge.type === 'sentence-order' ? (
          <VStack align="stretch" gap="3" data-testid="foundation48-sentence-builder">
            <Box border="1px dashed" borderColor={selectedTokens.length ? '#7DD3FC' : COLORS.border} bg="white" borderRadius="2xl" p="3.5" minH="70px">
              <Text color={COLORS.blue} fontWeight="950" fontSize="xs" mb="2">Câu của bạn</Text>
              <Flex gap="2" wrap="wrap">
                {selectedTokens.length ? selectedTokens.map((token) => <Button key={token.id} size="sm" borderRadius="full" bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} onClick={() => setSelectedTokenIds((tokenIds) => tokenIds.filter((tokenId) => tokenId !== token.id))} isDisabled={submissionLocked} data-testid="foundation48-picked-token" data-token-id={token.id}>{token.text}</Button>) : <Text color={COLORS.muted} fontWeight="800">Bấm các từ bên dưới để xếp câu.</Text>}
              </Flex>
            </Box>
            <Flex gap="2" wrap="wrap">
              {availableTokens.map((token) => <Button key={token.id} minH="42px" borderRadius="full" variant="outline" borderColor={COLORS.border} bg="white" color={COLORS.text} fontWeight="900" onClick={() => setSelectedTokenIds((tokenIds) => [...tokenIds, token.id])} isDisabled={submissionLocked || isLearningLocked(heartsState)} data-testid="foundation48-token" data-token-id={token.id}>{token.text}</Button>)}
            </Flex>
            <HStack gap="2" wrap="wrap">
              <Button leftIcon={<Icon as={RotateCcw} />} variant="outline" borderColor={COLORS.border} borderRadius="full" minH="44px" onClick={() => { setSelectedTokenIds([]); setFeedback(null); }} isDisabled={submissionLocked}>Làm lại</Button>
              <Button bg={COLORS.blue} color="white" borderRadius="full" minH="44px" onClick={() => submit()} isDisabled={submissionLocked || !selectedTokens.length || isLearningLocked(heartsState)} data-testid="foundation48-sentence-check">Poo xem giúp</Button>
            </HStack>
          </VStack>
        ) : null}

        {challenge.type === 'speaking-repeat' ? (
          <VStack align="stretch" gap="3">
            <Flex gap="2.5" wrap="wrap" direction={{ base: 'column', sm: 'row' }}>
              <Button leftIcon={<Icon as={Mic} />} bg={COLORS.blue} color="white" borderRadius="full" minH="48px" onClick={startSpeechRecognition} isLoading={listening} loadingText="Đang nghe" isDisabled={submissionLocked || isLearningLocked(heartsState)}>Nói để Poo nghe</Button>
              <Button leftIcon={<Icon as={selfPracticed ? CheckCircle2 : Mic} />} variant={selfPracticed ? 'solid' : 'outline'} colorScheme={selfPracticed ? 'green' : undefined} borderColor={COLORS.border} borderRadius="full" minH="48px" onClick={markSelfPracticed} data-testid="foundation48-speaking-self-practiced" isDisabled={submissionLocked}>{selfPracticed ? 'Đã nói xong' : 'Tự đánh dấu đã nói'}</Button>
            </Flex>
            {answer ? <Text color={COLORS.muted} fontWeight="800">Bạn nói/nhập: {answer}</Text> : null}
          </VStack>
        ) : null}

        {feedback ? (
          <Box ref={feedbackRef} border="1px solid" borderColor={verifiedCorrectAnswer ? '#86EFAC' : challenge.selfCheckOnly ? COLORS.border : '#FED7AA'} bg={verifiedCorrectAnswer ? '#ECFDF5' : challenge.selfCheckOnly ? '#EFF6FF' : '#FFF7ED'} borderRadius="2xl" p="3.5" role="status" aria-live="polite" data-testid="foundation48-challenge-feedback">
            {!feedback.correct ? (
              <Flex align="center" gap="2.5" mb="2">
                <Box className="learning-sponge-buddy learning-sponge-hit" position="relative" w="44px" h="44px" flexShrink={0} aria-hidden="true">
                  <OceanMascot mascot="botBien" pose="encourage" size="xs" decorative motion="none" className="learning-sponge-character" w="100%" />
                </Box>
                <Text color={COLORS.muted} fontSize="sm" fontWeight="800" lineHeight="1.45">Bọt Biển ở đây cùng bạn. Thở nhẹ rồi thử lại nhé.</Text>
              </Flex>
            ) : null}
            <Text color={verifiedCorrectAnswer ? COLORS.green : challenge.selfCheckOnly ? COLORS.blue : '#B45309'} fontWeight="950">{feedback.message}</Text>
            {challenge.explanation ? <Text mt="1" color={COLORS.text} fontWeight="750" lineHeight="1.6">{challenge.explanation}</Text> : null}
          </Box>
        ) : null}
      </VStack>
    </Box>
  );
}

function SpeakButton({ text, label, slow, size, mt, flex, minH }: { text: string; label: string; slow?: boolean; size?: 'sm' | 'md' | 'lg'; mt?: string | number; flex?: Record<string, string>; minH?: string }) {
  const [speechUnavailable, setSpeechUnavailable] = useState(() => typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined' || typeof window.SpeechSynthesisUtterance === 'undefined');
  return (
    <VStack align="start" gap="1">
      <Button size={size} mt={mt} flex={flex} minH={minH} leftIcon={<Icon as={Volume2} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" onClick={() => setSpeechUnavailable(!speakEnglish(text, slow))}>
        {label}
      </Button>
      {speechUnavailable ? <Text role="status" aria-live="polite" fontSize="xs" color={COLORS.muted} fontWeight="700" data-testid="foundation48-speech-unavailable">Thiết bị chưa hỗ trợ đọc mẫu tự động. Bạn có thể đọc câu mẫu trên màn hình.</Text> : null}
    </VStack>
  );
}

function CompletePrompt({ day, returnTo, score }: { day: Foundation48Day; returnTo: '/today' | '/home'; score?: number }) {
  const nextDay = day.dayNumber < foundation48Days.length ? day.dayNumber + 1 : null;
  const deepLesson = getFoundation48CachedDeepLesson(day.dayNumber);
  const primaryLesson = getFoundation48PrimaryLesson(day.dayNumber);
  const sentenceCount = deepLesson?.speaking.length || primaryLesson?.shadowing[0]?.lines.length || 5;
  const wordCount = deepLesson?.vocabulary.length || primaryLesson?.vocabulary.length || Math.min(6, day.summary.keyPoints.length || day.summary.practice.length || 4);
  const quizCount = deepLesson?.quiz.length || primaryLesson?.quiz.length || 1;
  const stars = score === undefined ? 0 : score >= 90 ? 3 : score >= 70 ? 2 : 1;

  return (
    <Box border="1px solid" borderColor="#BBF7D0" bg="linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 62%, #EFF6FF 100%)" borderRadius="3xl" p={{ base: '4', md: '5' }} data-testid="foundation48-complete-reward">
      <VStack align="stretch" gap="4">
        <HStack gap="3" align="start">
          <OceanMascot mascot="saoNhi" pose="reward" size="md" decorative motion="celebrate" />
          <Box minW="0">
            <Text color={COLORS.green} fontWeight="950" fontSize={{ base: 'xl', md: '3xl' }} lineHeight="1.18">Hoàn thành Ngày {day.dayNumber}</Text>
            <Text mt="1" color={COLORS.text} fontWeight="900" lineHeight="1.45">Giỏi lắm! Poo đã giữ lại vài câu cần ôn. Mai mình luyện nhẹ nhé.</Text>
            <HStack mt="2" gap="1.5" color={stars === 3 ? '#B7791F' : COLORS.blue} fontWeight="900" fontSize="sm" role="status" data-testid="foundation48-daily-score">
              <Icon as={Star} fill="currentColor" boxSize="4" />
              <Text>{stars ? `Đúng ${score}% · ${stars}/3 sao hôm nay` : 'Hoàn thành hành trình hôm nay'}</Text>
            </HStack>
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
        <Flex gap="2.5" direction="column" data-testid="foundation48-complete-actions">
          {nextDay ? (
            <Button as={Link} display="inline-flex" to={getFoundation48DayPath(nextDay)} rightIcon={<Icon as={ArrowRight} />} bg={COLORS.green} color="white" borderRadius="full" minH="52px" px="6" data-testid="foundation48-complete-next-day">Học ngày tiếp theo</Button>
          ) : (
            <Button as={Link} display="inline-flex" to={FOUNDATION48_BASE_PATH} bg={COLORS.green} color="white" borderRadius="full" minH="52px" px="6">Về lộ trình</Button>
          )}
          <Box as="details" border="1px solid" borderColor="#BBF7D0" bg="rgba(255,255,255,0.62)" borderRadius="2xl" p="3" data-testid="foundation48-complete-more-actions">
            <Flex as="summary" cursor="pointer" minH="44px" align="center" color={COLORS.green} fontWeight="950" sx={{ '&::-webkit-details-marker': { display: 'none' } }}>
              Xem thêm
            </Flex>
            <Flex mt="3" gap="2.5" wrap="wrap" direction={{ base: 'column', sm: 'row' }}>
              <Button as={Link} to={getFoundation48DayPath(day.dayNumber)} leftIcon={<Icon as={RotateCcw} />} variant="outline" borderColor="#86EFAC" color={COLORS.green} bg="white" borderRadius="full" minH="44px" data-testid="foundation48-complete-review-day">Ôn lại bài này</Button>
              <Button as={Link} to="/practice" leftIcon={<Icon as={Sparkles} />} variant="outline" borderColor="#86EFAC" color={COLORS.green} bg="white" borderRadius="full" minH="44px" data-testid="foundation48-complete-mistakes">Ôn câu Poo nhắc</Button>
              <Button as={Link} to={returnTo} leftIcon={<Icon as={returnTo === '/today' ? Sparkles : Home} />} variant="outline" borderColor={COLORS.border} color={COLORS.blue} bg="white" borderRadius="full" minH="44px" data-testid="foundation48-complete-home">{returnTo === '/today' ? 'Tiếp tục phiên hôm nay' : 'Về trang chủ'}</Button>
            </Flex>
          </Box>
        </Flex>
        <GrammarReview reminders={getCompletionReminders(day, deepLesson)} />
      </VStack>
    </Box>
  );
}

function speakEnglish(text: string, slow = false) {
  if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined' || typeof window.SpeechSynthesisUtterance === 'undefined') return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/___/g, 'blank'));
    utterance.lang = 'en-US';
    utterance.rate = slow ? 0.72 : 0.92;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
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
    <Box as="details" border="1px solid" borderColor="rgba(186,230,253,0.72)" bg="rgba(255,255,255,0.58)" borderRadius="2xl" p="3" data-testid="foundation48-grammar-review">
      <Flex as="summary" cursor="pointer" minH="44px" align="center" color={COLORS.blue} fontWeight="950" sx={{ '&::-webkit-details-marker': { display: 'none' } }}>
        Poo giải thích thêm
      </Flex>
      <VStack align="stretch" gap="2" mt="3">
        {reminders.map((item) => <Text key={item} color={COLORS.text} fontWeight="800" lineHeight="1.45">• {item}</Text>)}
      </VStack>
    </Box>
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
  if (quizMatch) return `Quiz ${Number(quizMatch[1]) + 1}`;
  if (challenge.id.endsWith('-mini-test')) return 'Câu tổng kết';
  return '';
}

function getFoundation48StepLabel(step: Foundation48LessonStep) {
  if (step.challenge) return getFoundation48ChallengeLabel(step.challenge.type);

  const labels: Record<Foundation48LessonStep['type'], string> = {
    intro: 'Bắt đầu',
    explain: 'Mẫu câu',
    example: 'Mẫu câu',
    practice: 'Quiz nhanh',
    listening: 'Lời thoại',
    speaking: 'Nói theo',
    challenge: 'Thử sức nhẹ',
    complete: 'Hoàn thành ngày học',
  };

  return labels[step.type];
}

function getFoundation48ChallengeLabel(type: Foundation48Challenge['type']) {
  const labels: Record<Foundation48Challenge['type'], string> = {
    'multiple-choice': 'Trắc nghiệm',
    'listen-and-choose': 'Nghe & chọn',
    'fill-blank': 'Điền từ',
    'picture-response': 'Nhìn tranh viết câu',
    'sentence-order': 'Xếp câu',
    'speaking-repeat': 'Nói theo',
    'free-response': 'Trả lời mở',
  };

  return labels[type];
}

function getFoundation48ChallengeMascot(type: Foundation48Challenge['type']) {
  if (type === 'multiple-choice') return 'cuaQuiz';
  if (type === 'listen-and-choose') return 'suaNghe';
  if (type === 'fill-blank' || type === 'picture-response' || type === 'sentence-order') return 'mucMo';
  if (type === 'free-response') return 'saoNhi';
  return 'poo';
}

function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/[.,!?;:'"“”‘’]/g, '').replace(/\s+/g, ' ').trim();
}

function buildFoundation48Steps(day: Foundation48Day, resolvedDeepLesson?: Foundation48DeepLesson, exerciseSeed?: string): Foundation48LessonStep[] {
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
    const quizChallenges: Foundation48Challenge[] = deepLesson.quiz.map((item): Foundation48Challenge => ({
      id: item.id,
      type: item.type,
      prompt: item.prompt,
      target: item.target,
      answer: item.answer,
      acceptableAnswers: item.acceptableAnswers,
      options: item.options,
      tokens: item.tokens,
      hint: item.hint,
      explanation: item.explanation,
      selfCheckOnly: item.selfCheckOnly,
      scoreEligible: item.scoreEligible,
      audioSrc: item.audioSrc,
      audioLabel: item.audioLabel,
      speakText: item.speakText,
    }));
    const pictureChallenges = (deepLesson.picturePrompts ?? []).map((item): Foundation48Challenge => ({
      id: item.id,
      type: 'picture-response',
      prompt: item.prompt,
      target: item.alt,
      answer: item.answer,
      acceptableAnswers: item.acceptableAnswers,
      hint: item.hint,
      picture: day.dayNumber === 3 && item.panel === 4
        ? { src: '/assets/foundation48/picture-challenges/day-03-handbag.webp', alt: item.alt, panel: 0, gridColumns: 1, gridRows: 1 }
        : { src: `/assets/foundation48/picture-challenges/day-${String(day.dayNumber).padStart(2, '0')}-grid.webp`, alt: item.alt, panel: item.panel },
      explanation: `Nhìn tranh: ${item.answer}.`,
    }));
    const vocabularyChallenges = deepLesson.vocabulary.map((item, index): Foundation48Challenge => ({
      id: `day-${day.dayNumber}-deep-vocab-${index}`,
      type: 'multiple-choice',
      prompt: `Chọn nghĩa đúng của “${item.term}”.`,
      target: item.example,
      answer: item.meaningVi,
      options: uniqueOptions([item.meaningVi, ...deepLesson.vocabulary.filter((candidate) => candidate.term !== item.term).map((candidate) => candidate.meaningVi)]),
      hint: item.example,
      explanation: `${item.term} — ${item.meaningVi}.`,
    }));
    const patternChallenges = deepLesson.patterns.map((item, index): Foundation48Challenge => ({
      id: `day-${day.dayNumber}-deep-pattern-${index}`,
      type: 'multiple-choice',
      prompt: `Mẫu “${item.pattern}” dùng để diễn đạt ý nào?`,
      target: item.examples[0] || item.pattern,
      answer: item.meaningVi,
      options: uniqueOptions([item.meaningVi, ...deepLesson.patterns.filter((candidate) => candidate.pattern !== item.pattern).map((candidate) => candidate.meaningVi)]),
      explanation: `${item.pattern} — ${item.meaningVi}.`,
    }));
    const reviewChallenges = deepLesson.review.remember.map((prompt, index): Foundation48Challenge => ({
      id: `day-${day.dayNumber}-deep-review-${index}`,
      type: 'free-response',
      prompt,
      target: prompt,
      answer: '',
      hint: 'Viết lại ý chính bằng câu ngắn, rồi tự so sánh với phần vừa học.',
      explanation: 'Phần ôn này được lưu lại nhưng không tự chấm đúng/sai.',
    }));
    const sessionSeed = exerciseSeed || `f48-${day.dayNumber}-legacy`;
    const legacyAttempt = sessionSeed.endsWith('-legacy');
    const randomizedQuizChallenges = legacyAttempt ? quizChallenges : shuffleArrayStableCopy(quizChallenges, `${sessionSeed}::quiz-order`);
    const challenges = [...vocabularyChallenges, ...patternChallenges, ...listeningChallenges, ...speakingChallenges, ...randomizedQuizChallenges, ...pictureChallenges, ...reviewChallenges];
    const scoredQuizChallenges = randomizedQuizChallenges.filter((challenge) => challenge.type !== 'speaking-repeat' && challenge.type !== 'free-response');
    scoredQuizChallenges.splice(Math.min(day.dayNumber - 1, scoredQuizChallenges.length), 0, ...pictureChallenges);
    const drawOne = (pool: Foundation48Challenge[], category: string) => legacyAttempt
      ? pool[(day.dayNumber - 1) % Math.max(1, pool.length)]
      : shuffleArrayStableCopy(pool, `${sessionSeed}::${category}`)[0];
    const day20NumberChallenges = scoredQuizChallenges.filter((challenge) => challenge.id.startsWith('day-20-number-dictation-'));
    const coreQuizPool = [3, 4, 13, 16].includes(day.dayNumber) && pictureChallenges.length
      ? pictureChallenges
      : day.dayNumber === 20 && day20NumberChallenges.length
        ? day20NumberChallenges
        : scoredQuizChallenges;
    const coreChallengeIds = new Set([
      drawOne(vocabularyChallenges, 'vocabulary')?.id,
      drawOne(patternChallenges, 'pattern')?.id,
      drawOne(listeningChallenges, 'listening')?.id,
      drawOne(speakingChallenges, 'speaking')?.id,
      drawOne(coreQuizPool, pictureChallenges.length && coreQuizPool === pictureChallenges ? 'picture' : 'quiz')?.id,
    ].filter((id): id is string => Boolean(id)));
    const coreChallenges = challenges.filter((challenge) => coreChallengeIds.has(challenge.id));
    const bonusChallenges = challenges.filter((challenge) => !coreChallengeIds.has(challenge.id));
    const patternBullets = deepLesson.patterns.flatMap((item) => [`${item.pattern} — ${item.meaningVi}`, ...item.examples.slice(0, 1)]).slice(0, 10);
    const vocabularyBullets = deepLesson.vocabulary.map((item) => `${item.term} — ${item.meaningVi}. Ví dụ: ${item.example}`);

    const steps: Foundation48LessonStep[] = [
      { id: 'intro', type: 'intro', title: deepLesson.learnerTitle, subtitle: 'Hoàn thành 5 thử thách chính và nhiệm vụ thực tế; các bài luyện thêm nằm trong vòng thưởng.', body: deepLesson.goalVi, bullets: [`${deepLesson.vocabulary.length} Từ vựng`, `${deepLesson.patterns.length} Mẫu câu`, `${deepLesson.listening.length} Nghe`, `${deepLesson.speaking.length} Nói lại`, `${deepLesson.quiz.length} Bài kiểm tra`] },
      { id: 'explain', type: 'explain', title: deepLesson.grammarPoint.title, subtitle: 'Poo giải thích bằng tiếng Việt trước khi luyện.', body: deepLesson.grammarPoint.explanationVi, bullets: deepLesson.grammarPoint.examples },
      { id: 'patterns', type: 'example', title: 'Mẫu câu cần nhớ', subtitle: 'Đọc mẫu chậm, chú ý trật tự từ.', bullets: patternBullets },
      { id: 'vocabulary', type: 'practice', title: 'Từ/cụm dùng ngay', subtitle: `${deepLesson.vocabulary.length} từ và cụm sẽ trở thành câu hỏi tương tác trong màn này.`, bullets: vocabularyBullets },
      { id: 'listening-overview', type: 'listening', title: 'Nghe 5 câu mẫu', subtitle: 'Nghe Poo đọc chậm trước, sau đó làm từng câu nghe chọn đáp án.', body: deepLesson.listening.map((item) => item.text).join(' ') },
      { id: 'speaking-overview', type: 'speaking', title: 'Câu luyện nói', subtitle: 'Nói thành tiếng theo từng câu để tạo phản xạ; bước nói được tự đánh dấu, không tính điểm tự động.' },
    ];

    coreChallenges.forEach((challenge, index) => {
      steps.push({ id: challenge.id, type: challenge.type === 'speaking-repeat' ? 'speaking' : 'challenge', title: challengeTitle(challenge, index), subtitle: challengeSubtitle(challenge), challenge });
    });
    steps.push(createFoundation48MissionBoss(day));

    bonusChallenges.forEach((challenge, index) => {
      steps.push({ id: challenge.id, type: challenge.type === 'speaking-repeat' ? 'speaking' : 'challenge', isBonus: true, title: `Vòng thưởng · ${challengeTitle(challenge, index)}`, subtitle: `Bài luyện thêm ${index + 1}/${bonusChallenges.length}; bạn có thể dừng sau bất kỳ câu nào.`, challenge });
    });

    steps.push({
      id: 'complete',
      type: 'complete',
      title: 'Tổng kết và ôn lại',
      subtitle: `Một ngày học đã xong. ${deepLesson.review.next}`,
      bullets: deepLesson.review.remember,
    });
    return steps;
  }

  const primaryLesson = getFoundation48PrimaryLesson(day.dayNumber);
  if (primaryLesson) return buildPooLessonFoundation48Steps(day, primaryLesson);

  const polished = day.polished;
  const keyPoints = polished?.formulas?.length ? polished.formulas : day.summary.keyPoints;
  const examples = polished?.examples?.length ? polished.examples : day.summary.examples;
  const summary = polished?.goal || day.summary.summary;
  const explanation = polished?.explanation || day.summary.summary;
  const finalTask = polished?.finalTask || day.summary.finalTask;
  const challenges = buildFoundation48Challenges(day);

  const steps: Foundation48LessonStep[] = [
    { id: 'intro', type: 'intro', title: `Ngày ${day.dayNumber}: bài học cùng Poo`, subtitle: 'Poo dẫn bạn đi theo nhịp nhẹ: hiểu ý chính, luyện mẫu câu rồi thử sức.', body: summary },
    { id: 'explain', type: 'explain', title: 'Poo giải thích nhanh', subtitle: 'Nắm khung chính trước khi làm bài.', body: explanation, bullets: keyPoints },
    { id: 'example', type: 'example', title: 'Ví dụ mẫu dễ nhớ', subtitle: 'Đọc chậm từng câu, chú ý chủ ngữ và từ khóa.', bullets: examples },
    { id: 'practice', type: 'practice', title: 'Chuẩn bị kiểm tra nhanh', subtitle: 'Từng câu luyện sẽ mở thành thử thách riêng ngay sau phần hướng dẫn.' },
  ];

  if (day.audio.length > 0) {
    steps.push({ id: 'listening', type: 'listening', title: 'Nghe', subtitle: 'Nghe bài nghe của ngày này hoặc nghe Poo đọc chậm.', body: examples[0] || summary });
  } else {
    steps.push({ id: 'listening-tts', type: 'listening', title: 'Nghe', subtitle: 'Dùng giọng đọc mẫu để làm quen âm và nhịp.', body: examples.slice(0, 2).join(' ') || summary });
  }

  challenges.forEach((challenge, index) => {
    steps.push({ id: challenge.id, type: challenge.type === 'speaking-repeat' ? 'speaking' : 'challenge', title: challengeTitle(challenge, index), subtitle: challengeSubtitle(challenge), challenge });
  });
  steps.push(createFoundation48MissionBoss(day));

  steps.push({ id: 'complete', type: 'complete', title: 'Tổng kết và ôn lại', subtitle: 'Giỏi lắm! Poo sẽ giữ từ mới và các câu cần ôn cho ngày mai.' });
  return steps;
}

function buildPooLessonFoundation48Steps(day: Foundation48Day, lesson: PooLesson): Foundation48LessonStep[] {
  const mainPattern = lesson.patterns[0];
  const mainDialogue = lesson.dialogue[0];
  const mainShadowing = lesson.shadowing[0];
  const patternBullets = lesson.patterns.flatMap((item) => [
    `${item.pattern} — ${item.meaningVi}`,
    ...item.examples.map((example) => `${example.en} — ${example.vi}`),
  ]);
  const challenges = buildPooLessonChallenges(day, lesson);
  const reviewChallenges: Foundation48Challenge[] = lesson.review.quickReviewPrompts.map((prompt, index) => ({
    id: `day-${day.dayNumber}-poo-review-${index}`,
    type: 'free-response',
    prompt,
    target: prompt,
    answer: '',
    hint: 'Trả lời bằng câu ngắn, rồi tự đối chiếu với mẫu vừa học.',
    explanation: 'Phần ôn mở được lưu lại nhưng không tự chấm đúng/sai.',
  }));

  const steps: Foundation48LessonStep[] = [
    {
      id: 'intro',
      type: 'intro',
      title: lesson.titleVi || lesson.title,
      subtitle: 'Hôm nay học một gói nhỏ: biết mục tiêu, luyện câu mẫu, đọc hội thoại, shadowing rồi quiz nhẹ.',
      body: `Hôm nay học gì: ${lesson.learningGoalVi}\n\nHọc xong làm được gì: bạn dùng được câu ngắn trong tình huống thật của ngày ${day.dayNumber}.`,
      bullets: [`${lesson.vocabulary.length} Từ vựng`, `${lesson.patterns.length} Mẫu câu`, `${lesson.dialogue.reduce((sum, item) => sum + item.lines.length, 0)} Nghe`, `${lesson.shadowing.reduce((sum, item) => sum + item.lines.length, 0)} Nói lại`, `${lesson.quiz.filter((item) => item.type === 'multiple-choice').length} Mini quiz`],
    },
    {
      id: 'explain',
      type: 'explain',
      title: mainPattern?.pattern || 'Mẫu câu chính',
      subtitle: mainPattern?.meaningVi || 'Poo giải thích ngắn trước khi luyện.',
      body: mainPattern?.explanationVi || lesson.learningGoalVi,
      bullets: mainPattern?.examples.slice(0, 3).map((example) => `${example.en} — ${example.vi}`) || [],
    },
    { id: 'patterns', type: 'example', title: 'Mẫu câu cần nhớ', subtitle: 'Đọc mẫu chậm, hiểu ý rồi luyện từng phần.', bullets: patternBullets },
    { id: 'vocabulary', type: 'practice', title: 'Từ/cụm dùng ngay', subtitle: `${lesson.vocabulary.length} từ/cụm sẽ được luyện bằng câu hỏi chọn nghĩa.` },
  ];

  if (lesson.dialogue.length) {
    steps.push({
      id: 'dialogue',
      type: 'listening',
      title: lesson.dialogue.length > 1 ? 'Hội thoại tình huống' : mainDialogue?.titleVi || 'Hội thoại tình huống',
      subtitle: mainDialogue?.situationVi || 'Nghe câu trả lời trong ngữ cảnh.',
      body: 'Nghe câu thoại rồi chọn lời vừa nghe trong từng lượt hội thoại.',
    });
  }

  if (lesson.shadowing.length) {
    steps.push({
      id: 'shadowing',
      type: 'speaking',
      title: lesson.shadowing.length > 1 ? 'Luyện Shadowing' : mainShadowing?.titleVi || 'Luyện Shadowing',
      subtitle: 'Nghe từng câu, nói lại chậm theo đúng nhịp.',
      body: 'Nghe từng câu, nói lại theo nhịp rồi tự đánh dấu đã luyện. Phần phát âm chưa được chấm tự động.',
    });
  }

  [...challenges, ...reviewChallenges].forEach((challenge, index) => {
    steps.push({ id: challenge.id, type: challenge.type === 'speaking-repeat' ? 'speaking' : 'challenge', title: challengeTitle(challenge, index), subtitle: challengeSubtitle(challenge), challenge });
  });
  steps.push(createFoundation48MissionBoss(day));

  steps.push({ id: 'complete', type: 'complete', title: 'Tổng kết và ôn lại', subtitle: `Poo giữ lại từ mới, câu shadowing và quiz để bạn ôn sau ${lesson.review.srsDays.join(' / ')} ngày.`, bullets: lesson.review.masteryCriteriaVi });
  return steps;
}

function createFoundation48MissionBoss(day: Foundation48Day): Foundation48LessonStep {
  const missionPrompt = day.summary.finalTask || `Dùng mẫu câu của ngày ${day.dayNumber} để viết một câu cho tình huống thật của bạn.`;
  const challenge: Foundation48Challenge = {
    id: `day-${day.dayNumber}-mission-boss`,
    type: 'free-response',
    prompt: `Thử thách cuối · ${missionPrompt}`,
    target: missionPrompt,
    answer: '',
    phraseBank: day.summary.examples.slice(0, 4),
    hint: 'Tự tạo câu trả lời bằng mẫu vừa học. Mở phần giải thích nếu bạn muốn xem lại trước khi gửi.',
    explanation: 'Câu trả lời đã được lưu để bạn tự xem lại; đây là lượt luyện mở, không bị trừ điểm vì không có một đáp án duy nhất.',
  };
  return {
    id: challenge.id,
    type: 'challenge',
    title: 'Thử thách cuối · Áp dụng vào đời thật',
    subtitle: 'Dùng điều vừa học để hoàn thành nhiệm vụ của ngày.',
    challenge,
  };
}

function buildPooLessonChallenges(day: Foundation48Day, lesson: PooLesson): Foundation48Challenge[] {
  const vocabularyChallenges = lesson.vocabulary.map((item, index): Foundation48Challenge => ({
    id: `day-${day.dayNumber}-poo-vocab-${index}`,
    type: 'multiple-choice',
    prompt: `Chọn nghĩa đúng của “${item.term}”.`,
    target: item.exampleEn,
    answer: item.meaningVi,
    options: uniqueOptions([item.meaningVi, ...lesson.vocabulary.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.meaningVi)]),
    hint: item.pronunciation,
    explanation: `${item.term} — ${item.meaningVi}. ${item.exampleEn} — ${item.exampleVi}`,
  }));
  const patternChallenges = lesson.patterns.map((item, index): Foundation48Challenge => ({
    id: `day-${day.dayNumber}-poo-pattern-${index}`,
    type: 'multiple-choice',
    prompt: `Mẫu “${item.pattern}” dùng để diễn đạt ý nào?`,
    target: item.examples[0]?.en || item.pattern,
    answer: item.meaningVi,
    options: uniqueOptions([item.meaningVi, ...lesson.patterns.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.meaningVi)]),
    hint: item.explanationVi,
    explanation: `${item.pattern} — ${item.meaningVi}.`,
  }));
  const dialogueLines = lesson.dialogue.flatMap((dialogue) => dialogue.lines.map((line, index): Foundation48Challenge => ({
    id: `day-${day.dayNumber}-poo-dialogue-${dialogue.id}-${line.id}`,
    type: 'listen-and-choose',
    prompt: `${dialogue.titleVi} · ${line.speaker}: ${index > 0 ? 'Nghe câu trả lời tiếp theo.' : dialogue.situationVi}`,
    target: line.audioText || line.en,
    answer: line.en,
    options: uniqueOptions([line.en, ...lesson.dialogue.flatMap((candidate) => candidate.lines.map((other) => other.en))]),
    hint: line.vi,
    explanation: `${line.speaker}: ${line.en} — ${line.vi}`,
  })));
  const listeningChallenges = lesson.listeningTasks.flatMap((task) => task.questions.map((question): Foundation48Challenge => ({
    id: `day-${day.dayNumber}-poo-listen-${task.id}-${question.id}`,
    type: 'listen-and-choose',
    prompt: question.questionVi,
    target: task.transcriptEn,
    answer: question.correctAnswer,
    options: uniqueOptions([question.correctAnswer, ...question.choices]),
    hint: task.titleVi,
    explanation: question.explanationVi || task.transcriptVi,
  })));
  const shadowingChallenges = lesson.shadowing.flatMap((script) => script.lines.map((line): Foundation48Challenge => ({
    id: `day-${day.dayNumber}-poo-shadow-${script.id}-${line.id}`,
    type: 'speaking-repeat',
    prompt: `${script.titleVi}: ${line.pronunciationTipVi || line.vi}`,
    target: line.en,
    answer: line.en,
    hint: `Tốc độ: ${script.speed}`,
    explanation: 'Nói theo mẫu rồi tự đánh dấu đã luyện. Phần này chưa được chấm phát âm tự động.',
  })));
  const mistakeChallenges = lesson.commonMistakesVi.map((mistake): Foundation48Challenge => ({
    id: `day-${day.dayNumber}-poo-mistake-${mistake.id}`,
    type: 'multiple-choice',
    prompt: `Sửa câu sai: ${mistake.wrongEn || mistake.mistakeVi}`,
    target: mistake.correctEn,
    answer: mistake.correctEn,
    options: uniqueOptions([mistake.correctEn, mistake.wrongEn || mistake.mistakeVi]),
    hint: mistake.explanationVi,
    explanation: mistake.explanationVi,
  }));
  const quizChallenges = lesson.quiz.map((item, index): Foundation48Challenge => {
    const acceptedAnswers = Array.isArray(item.correctAnswer) ? item.correctAnswer : [item.correctAnswer];
    const answer = acceptedAnswers[0] || '';
    const baseId = `day-${day.dayNumber}-poo-quiz-${index}`;

    if (item.type === 'short-answer') {
      return {
        id: baseId,
        type: 'speaking-repeat',
        prompt: item.promptVi,
        target: item.promptEn || answer,
        answer,
        acceptableAnswers: acceptedAnswers,
        hint: 'Nói câu ngắn, rõ nhịp. Không cần nói nhanh.',
        explanation: item.explanationVi,
      };
    }

    if (item.type === 'sentence-order') {
      return {
        id: baseId,
        type: 'sentence-order',
        prompt: item.promptVi,
        target: item.promptEn || answer,
        answer,
        acceptableAnswers: acceptedAnswers,
        tokens: shuffleTokensForQuestion(answer.split(/\s+/), `${day.dayNumber}:${baseId}`),
        hint: 'Bấm từ theo đúng thứ tự câu.',
        explanation: item.explanationVi,
      };
    }

    if (item.type === 'fill-blank') {
      return {
        id: baseId,
        type: 'fill-blank',
        prompt: item.promptVi,
        target: item.promptEn || answer,
        answer,
        acceptableAnswers: acceptedAnswers,
        hint: 'Nhập đúng từ/cụm còn thiếu.',
        explanation: item.explanationVi,
      };
    }

    return {
      id: baseId,
      type: 'multiple-choice',
      prompt: item.promptVi,
      target: item.promptEn || answer,
      answer,
      acceptableAnswers: acceptedAnswers,
      options: uniqueOptions([answer, ...(item.choices || [])]),
      hint: 'Chọn đáp án đúng nhất theo dữ liệu bài hôm nay.',
      explanation: item.explanationVi,
    };
  });
  return [...vocabularyChallenges, ...patternChallenges, ...dialogueLines, ...listeningChallenges, ...shadowingChallenges, ...mistakeChallenges, ...quizChallenges];
}

function buildFoundation48Challenges(day: Foundation48Day): Foundation48Challenge[] {
  const polished = day.polished;
  const examples = polished?.examples?.length ? polished.examples : day.summary.examples;
  const formulas = polished?.formulas?.length ? polished.formulas : day.summary.keyPoints;
  const practiceQuestions = polished?.practiceQuestions?.length ? polished.practiceQuestions : day.summary.practice;
  const dailyTest = polished?.dailyTest ?? [];
  const finalTask = polished?.finalTask || day.summary.finalTask;
  const firstExample = examples[0] || 'I am a student.';
  const secondExample = examples[1] || 'She is happy.';
  const fill = inferFillBlank(firstExample);
  const miniTestTarget = formulas[0] || firstExample;

  const coreChallenges: Foundation48Challenge[] = [
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
      prompt: 'Chọn mẫu câu đúng nhất với bài hôm nay.',
      target: miniTestTarget,
      answer: miniTestTarget,
      options: uniqueOptions([miniTestTarget, 'Subject + random word + not', 'Verb + subject + maybe', 'Only translate word by word']),
      hint: 'Chọn mẫu câu đúng nhất trước khi hoàn thành ngày học.',
      explanation: 'Thử sức nhẹ giúp Poo lưu tiến độ và nhắc lại cấu trúc quan trọng nhất của ngày.',
    },
  ];

  const openResponses = [
    ...practiceQuestions.map((prompt, index) => ({ id: `day-${day.dayNumber}-practice-open-${index}`, prompt })),
    ...dailyTest.map((prompt, index) => ({ id: `day-${day.dayNumber}-daily-open-${index}`, prompt })),
    { id: `day-${day.dayNumber}-final-task`, prompt: finalTask },
  ].filter((item, index, items) => items.findIndex((candidate) => normalizeAnswer(candidate.prompt) === normalizeAnswer(item.prompt)) === index)
    .map(({ id, prompt }): Foundation48Challenge => ({
    id,
    type: 'free-response',
    prompt,
    target: prompt,
    answer: '',
    hint: 'Viết câu trả lời của riêng bạn rồi tự đối chiếu với mẫu câu và ví dụ phía trên.',
    explanation: 'Đây là phần luyện mở, không có một đáp án duy nhất để máy chấm chính xác.',
    }));

  return [...coreChallenges, ...openResponses];
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
  return shuffleTokensForQuestion(tokens, String(seed));
}

function challengeTitle(challenge: Foundation48Challenge, index: number) {
  if (challenge.id.endsWith('-mini-test') || challenge.id.endsWith('-speak-review')) return `${index + 1}. Thử sức nhẹ`;

  const labels: Record<Foundation48Challenge['type'], string> = {
    'multiple-choice': 'Trắc nghiệm',
    'listen-and-choose': 'Nghe & chọn',
    'fill-blank': 'Điền từ',
    'picture-response': 'Nhìn tranh viết câu',
    'sentence-order': 'Xếp câu',
    'speaking-repeat': 'Nói theo',
    'free-response': 'Trả lời mở',
  };
  return `${index + 1}. ${labels[challenge.type]}`;
}

function challengeSubtitle(challenge: Foundation48Challenge) {
  if (challenge.id.endsWith('-mini-test')) return 'Khép lại bằng một câu thử sức nhẹ trước khi Poo giữ tiến độ.';
  if (challenge.type === 'speaking-repeat') return 'Nói chậm, rõ. Có thể tự đánh dấu nếu máy chưa hỗ trợ nhận giọng nói.';
  if (challenge.type === 'listen-and-choose') return 'Nghe câu mẫu, nhận diện câu vừa nghe rồi chọn đáp án.';
  if (challenge.type === 'multiple-choice') return 'Đọc ngữ cảnh, chọn đáp án rồi xem lời giải thích.';
  if (challenge.type === 'picture-response') return 'Nhìn chi tiết trong tranh rồi tự viết thành một câu tiếng Anh.';
  if (challenge.type === 'fill-blank') return 'Tự điền từ còn thiếu để hoàn thành câu.';
  if (challenge.type === 'sentence-order') return 'Chạm từng từ để dựng lại câu. Thử lại nếu câu chưa tự nhiên.';
  if (challenge.type === 'free-response') return 'Tự viết câu của bạn rồi đối chiếu với mục tiêu; Poo không chấm tự động.';
  return 'Làm từng nhịp để mở bước tiếp theo. Nếu vấp, Poo sẽ đưa câu đó vào phần ôn.';
}
