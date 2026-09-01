import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Circle, Flex, HStack, Icon, SimpleGrid, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronDown, Compass, Mic2, Sparkles, Video, Waves, Zap } from 'lucide-react';
import { GlassPanel, OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, getUnifiedBubbles, getWaterStreak, type DailyRewardState } from '../lib/p-english/daily-rewards';
import { LEARNING_HEARTS_UPDATED_EVENT } from '../lib/p-english/learning-hearts';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { createCardEntrance, createCorrectAnswerBurst, killTimeline } from '../lib/animations/gsap-utils';
import { getLearningSummary, type LearningSummary } from '../lib/p-english/learning-summary';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { foundation48Days, getFoundation48DayPath } from '../features/foundation48/foundation48Data';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48Progress } from '../features/foundation48/foundation48Progress';
import { BubbleStreakBadge } from '../components/streak/BubbleStreakBadge';
import { DAILY_LEARNING_SESSION_UPDATED_EVENT, getDailyLearningSessionSnapshot } from '../lib/p-english/daily-learning-session';
import { LEARNING_LOOP_UPDATED_EVENT } from '../lib/p-english/learning-loop';

const FLASHCARD_PATH = '/words';
const WEAK_REVIEW_PATH = '/practice';
const SHADOWING_PATH = '/shadowing';
const VIDEO_LAB_PATH = '/video-lab';
const LinkedGlassPanel = GlassPanel as any;

type DailyTask = {
  title: string;
  subtitle: string;
  cta: string;
  to: string;
  icon: any;
  accent: 'blue' | 'green' | 'orange' | 'aqua';
  testId: string;
};

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getFriendlyFoundationTitle(title = '') {
  const withoutDay = title.replace(/^Ngày \d+:\s*/, '').trim();
  return withoutDay.split('—')[0]?.trim() || withoutDay || 'Bài học hôm nay';
}

function getDailyFoundation48Target() {
  const progress = getFoundation48Progress();
  const days = progress.days || {};
  const lastDayOpened = Number(progress.lastDayOpened);
  const firstIncomplete = foundation48Days.find((day) => !days[day.dayNumber]?.completed)?.dayNumber || 1;
  const safeDay = Number.isFinite(lastDayOpened) && lastDayOpened > 0 ? Math.min(Math.max(lastDayOpened, 1), foundation48Days.length) : firstIncomplete;
  const safeDayProgress = days[safeDay];
  const currentDay = safeDayProgress?.completed && safeDay < foundation48Days.length ? safeDay + 1 : safeDay;
  const currentProgress = days[currentDay];
  const currentDayData = foundation48Days.find((day) => day.dayNumber === currentDay);
  const friendlyTitle = getFriendlyFoundationTitle(currentDayData?.title);
  const completedDayEntries = Object.values(days).filter((day) => day?.completed);
  const completedToday = Boolean(progress.lastStudiedDate === getTodayKey() && completedDayEntries.length > 0);
  const completedDays = completedDayEntries.length;
  const hasResumeProgress = Boolean(
    (Number.isFinite(lastDayOpened) && lastDayOpened > 0)
    || completedDays > 0
    || currentProgress?.started
    || (currentProgress?.completedSteps?.length || 0) > 0,
  );
  const status = completedToday || currentProgress?.completed ? 'Hoàn thành' : currentProgress?.started || (currentProgress?.completedSteps?.length || 0) > 0 ? 'Đang học' : 'Chưa bắt đầu';
  return {
    dayNumber: currentDay,
    path: getFoundation48DayPath(currentDay),
    label: `Bài ${currentDay} — ${friendlyTitle}`,
    friendlyTitle,
    duration: '12 phút',
    steps: ['Từ mới', 'Mẫu câu', 'Nghe', 'Nói lại', 'Thử sức nhẹ'],
    completedToday,
    status,
    completedDays,
    hasResumeProgress,
  };
}

function MiniProgressPill({ label, value, tone = 'blue' }: { label: string; value: string; tone?: 'blue' | 'green' | 'orange' }) {
  const color = tone === 'green' ? '#15803D' : tone === 'orange' ? '#B45309' : OCEAN_TOKENS.deepBlue;
  const bg = tone === 'green' ? 'rgba(220,252,231,0.72)' : tone === 'orange' ? 'rgba(255,243,196,0.78)' : 'rgba(232,244,255,0.76)';
  return (
    <Box border="1px solid" borderColor="rgba(255,255,255,0.74)" bg={bg} borderRadius="2xl" px={{ base: '2.5', md: '3.5' }} py={{ base: '2.5', md: '3' }} minW="0" data-testid={`home-progress-${label}`}>
      <Text color={color} fontWeight="950" fontSize={{ base: 'sm', md: 'lg' }} lineHeight="1" noOfLines={1}>{value}</Text>
      <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="850" fontSize={{ base: '2xs', md: 'xs' }} noOfLines={1}>{label}</Text>
    </Box>
  );
}

function DailyTaskCard({ task }: { task: DailyTask }) {
  const accentColor = task.accent === 'green' ? '#16A34A' : task.accent === 'orange' ? '#F97316' : task.accent === 'aqua' ? '#0891B2' : OCEAN_TOKENS.deepBlue;
  const accentBg = task.accent === 'green' ? 'rgba(220,252,231,0.70)' : task.accent === 'orange' ? 'rgba(255,247,237,0.78)' : task.accent === 'aqua' ? 'rgba(207,250,254,0.72)' : 'rgba(232,244,255,0.74)';

  return (
    <LinkedGlassPanel
      as={Link}
      to={task.to}
      className="home-dashboard-card"
      data-testid={task.testId}
      data-home-task={task.title}
      aria-label={`${task.cta}: ${task.title}`}
      p={{ base: '2.5', md: '4' }}
      minH={{ base: '96px', md: '156px' }}
      bg="rgba(255,255,255,0.70)"
      borderColor={OCEAN_TOKENS.border}
      display="flex"
      flexDirection="column"
      gap={{ base: '1.5', md: '2.5' }}
      minW="0"
      overflow="hidden"
      _hover={{ transform: 'translateY(-2px)', boxShadow: OCEAN_TOKENS.shadow }}
      transition="transform .18s ease, box-shadow .18s ease"
      _focusVisible={{ outline: '3px solid', outlineColor: OCEAN_TOKENS.oceanBlue, outlineOffset: '3px' }}
    >
      <HStack align="start" justify="space-between" gap="2">
        <Circle size={{ base: '32px', md: '44px' }} bg={accentBg} color={accentColor} border="1px solid" borderColor="rgba(255,255,255,0.78)" flexShrink={0}>
          <Icon as={task.icon} boxSize={{ base: '4', md: '6' }} />
        </Circle>
        <Text fontSize={{ base: '2xs', md: 'xs' }} color={accentColor} fontWeight="950" bg={accentBg} borderRadius="full" px={{ base: '2', md: '2.5' }} py="1" noOfLines={1}>{task.cta}</Text>
      </HStack>
      <Box minW="0" flex="1">
        <Text color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.18" noOfLines={1}>{task.title}</Text>
        <Text mt="0.5" color={OCEAN_TOKENS.muted} fontWeight="750" fontSize={{ base: 'xs', md: 'sm' }} lineHeight={{ base: '1.34', md: '1.45' }} noOfLines={{ base: 2, md: 2 }}>{task.subtitle}</Text>
      </Box>
    </LinkedGlassPanel>
  );
}

function PooReminderCard() {
  return (
    <GlassPanel className="home-dashboard-card" data-testid="home-poo-reminder" p={{ base: '2.75', md: '4' }} mb={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.68)" borderColor={OCEAN_TOKENS.borderStrong}>
      <HStack gap="3" align="center">
        <OceanMascot mascot="poo" pose="coach" size="sm" decorative motion="float" />
        <Box minW="0">
          <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">Poo nhắc bạn</Text>
          <Text mt="1" color={OCEAN_TOKENS.text} fontWeight="850" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.45">
            Bấm “Bắt đầu học” trước nha. Nếu có câu nào vấp, Poo sẽ nhắc bạn ôn lại sau.
          </Text>
        </Box>
      </HStack>
    </GlassPanel>
  );
}

export function HomePage() {
  const [rewardState, setRewardState] = useState<DailyRewardState>(() => getDailyRewardState());
  const [learningSummary, setLearningSummary] = useState<LearningSummary>(() => getLearningSummary());
  const [progressVersion, setProgressVersion] = useState(0);
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const previousProgress = useRef(0);
  const reducedMotion = useReducedMotion();

  const dailyTarget = useMemo(() => getDailyFoundation48Target(), [progressVersion]);
  const dailySession = useMemo(() => getDailyLearningSessionSnapshot(), [progressVersion]);
  const todayStatus = dailySession.completed ? 'Hoàn thành' : dailySession.completedStepCount > 0 || dailySession.started ? 'Đang học' : dailyTarget.status;
  const bubbles = useMemo(() => getUnifiedBubbles(rewardState), [rewardState]);
  const waterStreak = useMemo(() => getWaterStreak(rewardState), [rewardState]);

  const dailyTasks: DailyTask[] = useMemo(() => [
    {
      title: dailySession.completed ? 'Xem lại phiên hôm nay' : dailySession.started ? 'Tiếp tục phiên học' : 'Bắt đầu nhẹ nha',
      subtitle: `${dailySession.completedStepCount}/3 chặng · 10–12 phút`,
      cta: dailySession.completed ? 'Xem tổng kết' : dailySession.started ? 'Học tiếp' : 'Bắt đầu học',
      to: '/today',
      icon: Compass,
      accent: 'blue',
      testId: 'home-task-today-lesson',
    },
    {
      title: 'Ôn cùng Poo',
      subtitle: learningSummary.difficultWordCount > 0 ? `${learningSummary.difficultWordCount} câu cần ôn lại.` : 'Ôn nhẹ vài câu nhé.',
      cta: 'Ôn cùng Poo',
      to: WEAK_REVIEW_PATH,
      icon: Sparkles,
      accent: 'orange',
      testId: 'home-task-mistakes',
    },
    {
      title: 'Nói đuổi 5 phút',
      subtitle: learningSummary.shadowingDifficultCount > 0 ? 'Luyện lại câu nói còn khó.' : 'Nghe một câu, nói lại chậm.',
      cta: 'Luyện nói',
      to: SHADOWING_PATH,
      icon: Mic2,
      accent: 'aqua',
      testId: 'home-task-shadowing',
    },
    {
      title: 'Tạo bài từ video',
      subtitle: 'Dán link hoặc thêm phụ đề.',
      cta: 'Tạo bài',
      to: VIDEO_LAB_PATH,
      icon: Video,
      accent: 'blue',
      testId: 'home-task-video-lab',
    },
    {
      title: 'Từ vựng cần nhớ',
      subtitle: learningSummary.vocabularyDueCount > 0 ? `${learningSummary.vocabularyDueCount} từ cần ôn.` : 'Ôn vài từ thôi nè.',
      cta: 'Ôn từ',
      to: FLASHCARD_PATH,
      icon: BookOpen,
      accent: 'green',
      testId: 'home-task-words',
    },
  ], [dailySession.completed, dailySession.completedStepCount, dailySession.started, learningSummary.difficultWordCount, learningSummary.shadowingDifficultCount, learningSummary.vocabularyDueCount]);

  const compactShortcuts: DailyTask[] = useMemo(() => [
    {
      title: 'Nói đuổi',
      subtitle: 'Nghe rồi nói lại',
      cta: 'Nói',
      to: SHADOWING_PATH,
      icon: Mic2,
      accent: 'aqua',
      testId: 'home-shortcut-shadowing',
    },
    {
      title: 'Ôn từ',
      subtitle: 'Ôn 10 từ thôi nè',
      cta: 'Từ',
      to: FLASHCARD_PATH,
      icon: BookOpen,
      accent: 'green',
      testId: 'home-shortcut-words',
    },
    {
      title: 'Trả lời nhanh',
      subtitle: 'Nhanh mà nhẹ',
      cta: 'Nhanh',
      to: '/english-speed',
      icon: Zap,
      accent: 'orange',
      testId: 'home-shortcut-english-speed',
    },
  ], []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const refreshProgress = () => {
      setRewardState(getDailyRewardState());
      setLearningSummary(getLearningSummary());
      setProgressVersion((value) => value + 1);
    };
    refreshProgress();
    window.addEventListener('focus', refreshProgress);
    window.addEventListener('storage', refreshProgress);
    window.addEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(LEARNING_LOOP_UPDATED_EVENT, refreshProgress);
    window.addEventListener(DAILY_LEARNING_SESSION_UPDATED_EVENT, refreshProgress);
    return () => {
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('storage', refreshProgress);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(LEARNING_LOOP_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(DAILY_LEARNING_SESSION_UPDATED_EVENT, refreshProgress);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    // (1) exclude cards inside <details> — GSAP cannot animate hidden elements,
    // so animating them on mount leaves them at autoAlpha:0 after expand.
    const allCards = dashboardRef.current?.querySelectorAll('.home-dashboard-card');
    const cards = allCards ? Array.from(allCards).filter((el) => !el.closest('.home-more-details')) : [];
    const entrance = cards.length ? createCardEntrance(cards, { y: 12, duration: 0.34, stagger: 0.035 }) : null;
    // Only celebrate when today's three-step progress actually changes.
    const changed = previousProgress.current !== dailySession.progressPercent;
    previousProgress.current = dailySession.progressPercent;
    const pulse = changed && pulseRef.current ? createCorrectAnswerBurst(pulseRef.current, { scale: 1.02, duration: 0.18 }) : null;
    return () => {
      killTimeline(entrance);
      killTimeline(pulse);
    };
  }, [reducedMotion, progressVersion, dailySession.progressPercent]);

  const primaryIntro = dailySession.completed ? 'Poo đã giữ trọn phiên học hôm nay.' : dailySession.started ? 'Poo đã giữ đúng chặng bạn đang học.' : 'Ba chặng ngắn, học theo đúng thứ tự.';
  const primaryCtaLabel = dailySession.completed ? 'Xem tổng kết' : dailySession.started ? 'Tiếp tục phiên học' : 'Bắt đầu phiên 10 phút';

  return (
    <OceanPageShell data-testid="home-page" variant="dashboard" overlayStrength="medium" ref={dashboardRef} px={{ base: '3', md: '5', xl: '6' }} py={{ base: '2', lg: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 16px)', md: '10', lg: '8' }} maxW="1180px" mx="auto" overflowX="hidden">
      <GlassPanel className="home-dashboard-card home-main-learning-card" data-testid="home-daily-hero" p={{ base: '4', md: '6' }} mb={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.68)" borderColor="rgba(186,230,253,0.70)" position="relative" overflow="hidden">
        <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 8%, rgba(91,188,235,0.14), transparent 24%), radial-gradient(circle at 8% 94%, rgba(255,255,255,0.68), transparent 24%)" pointerEvents="none" />
        <Flex position="relative" direction={{ base: 'column', md: 'row' }} gap={{ base: '4', md: '6' }} align={{ base: 'stretch', md: 'center' }} justify="space-between">
          <VStack align="stretch" gap={{ base: '3', md: '4' }} flex="1" minW="0">
            <Flex justify="space-between" gap={{ base: '2.5', sm: '3' }} align={{ base: 'stretch', sm: 'start' }} direction={{ base: 'column', sm: 'row' }}>
              <Box minW="0">
                <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={OCEAN_TOKENS.text} lineHeight="1.05" data-testid="home-daily-title">
                  Hôm nay học gì?
                </Text>
                <Text mt="1.5" fontSize={{ base: 'sm', md: 'md' }} color={OCEAN_TOKENS.muted} fontWeight="850" noOfLines={1} data-testid="home-daily-subtitle">
                  {primaryIntro}
                </Text>
              </Box>
              <HStack gap="2" flexShrink={0} align="center" wrap="wrap">
                <BubbleStreakBadge state={rewardState} compact testId="home-bubbles-badge" />
                <Tag borderRadius="full" bg={todayStatus === 'Hoàn thành' ? 'rgba(220,252,231,0.82)' : OCEAN_TOKENS.softAqua} color={todayStatus === 'Hoàn thành' ? '#15803D' : OCEAN_TOKENS.deepBlue}>
                  <TagLabel>{todayStatus}</TagLabel>
                </Tag>
              </HStack>
            </Flex>

            <Box bg="rgba(248,252,255,0.78)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p={{ base: '3', md: '4' }} minW="0">
              <Text color={OCEAN_TOKENS.deepBlue} fontSize="xs" fontWeight="950" letterSpacing="1.2px" textTransform="uppercase">Phiên học được Poo xếp sẵn</Text>
              <Text mt="1" color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.15" noOfLines={1}>{dailyTarget.label}</Text>
              <HStack mt="2.5" gap="2" wrap="wrap" color={OCEAN_TOKENS.muted} fontWeight="850" fontSize={{ base: 'xs', md: 'sm' }}>
                <Text>10–12 phút</Text>
                <Text aria-hidden="true">•</Text>
                <Text>{dailySession.completedStepCount}/3 chặng hôm nay</Text>
                <Text aria-hidden="true">•</Text>
                <Text>{dailyTarget.completedDays}/48 ngày</Text>
              </HStack>
              <Box mt="3" h="9px" borderRadius="full" bg="rgba(232,244,255,0.84)" overflow="hidden" role="progressbar" aria-valuenow={dailySession.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Đã xong ${dailySession.completedStepCount} trên 3 chặng hôm nay`} ref={pulseRef}>
                <Box h="100%" w={`${Math.max(dailySession.progressPercent, 2)}%`} borderRadius="full" bg={dailySession.completed ? '#16A34A' : OCEAN_TOKENS.oceanBlue} />
              </Box>
            </Box>

            <Button as={Link} to="/today" size={{ base: 'lg', md: 'lg' }} borderRadius="full" bg={OCEAN_TOKENS.oceanBlue} color="white" leftIcon={<Icon as={Compass} />} _hover={{ bg: OCEAN_TOKENS.deepBlue }} w={{ base: '100%', sm: 'fit-content' }} px="7" data-testid="home-primary-today-cta" data-home-cta="primary-today">
              {primaryCtaLabel}
            </Button>
          </VStack>

          <Box display={{ base: 'none', md: 'block' }} pointerEvents="none" flexShrink={0}>
            <OceanMascot mascot="poo" pose="idle" size="md" decorative motion="float" />
          </Box>
        </Flex>
      </GlassPanel>

      {!dailySession.started ? <PooReminderCard /> : null}

      <HStack data-testid="home-compact-shortcuts" className="home-compact-shortcuts" gap={{ base: '2', md: '3' }} justify="center" wrap="wrap" mb={{ base: '3', md: '4' }}>
        {compactShortcuts.map((task) => {
          const accentColor = task.accent === 'green' ? '#16A34A' : task.accent === 'orange' ? '#F97316' : task.accent === 'aqua' ? '#0891B2' : OCEAN_TOKENS.deepBlue;
          const accentBg = task.accent === 'green' ? 'rgba(220,252,231,0.76)' : task.accent === 'orange' ? 'rgba(255,247,237,0.82)' : task.accent === 'aqua' ? 'rgba(207,250,254,0.76)' : 'rgba(232,244,255,0.78)';
          return (
            <Button key={task.title} as={Link} to={task.to} data-testid={task.testId} variant="ghost" h="auto" minW={{ base: '90px', md: '118px' }} px={{ base: '2.5', md: '3' }} py="2.5" borderRadius="2xl" bg="rgba(255,255,255,0.56)" border="1px solid" borderColor="rgba(186,230,253,0.58)" color={OCEAN_TOKENS.text} _hover={{ bg: 'rgba(232,244,255,0.78)' }}>
              <VStack gap="1" minW="0">
                <Circle size={{ base: '34px', md: '38px' }} bg={accentBg} color={accentColor}>
                  <Icon as={task.icon} boxSize={{ base: '4.5', md: '5' }} />
                </Circle>
                <Text fontSize={{ base: '2xs', md: 'xs' }} fontWeight="950" noOfLines={1}>{task.title}</Text>
              </VStack>
            </Button>
          );
        })}
      </HStack>

      <Box as="details" className="home-more-details" data-testid="home-more-details" sx={{ '&[open] .home-more-chevron': { transform: 'rotate(180deg)' } }}>
        <Box as="summary" cursor="pointer" textAlign="center" color={OCEAN_TOKENS.deepBlue} fontWeight="950" fontSize="sm" py="2" minH="44px" _hover={{ opacity: 0.7 }} _active={{ opacity: 0.6 }} transition="opacity .15s ease" listStyleType="none">
          <HStack justify="center" gap="1.5" as="span">
            <Text as="span">Xem thêm</Text>
            <Icon as={ChevronDown} className="home-more-chevron" boxSize="4" transition="transform .25s ease" />
          </HStack>
        </Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: '2.5', md: '3' }} mt="2">
          {dailyTasks.filter((task) => task.testId !== 'home-task-today-lesson').map((task) => <DailyTaskCard key={task.title} task={task} />)}
          <GlassPanel className="home-dashboard-card" data-testid="home-today-summary" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.62)" borderColor="rgba(186,230,253,0.62)">
            <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950" fontSize="xs" letterSpacing="1.2px" textTransform="uppercase">Tùy chọn</Text>
            <Text mt="1" color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'md', md: 'lg' }} noOfLines={1}>{dailyTarget.label}</Text>
            <SimpleGrid columns={2} gap="2" mt="3" data-testid="home-summary-progress-grid">
              <MiniProgressPill label="Chuỗi nước" value={waterStreak.label} tone="blue" />
              <MiniProgressPill label="Bọt biển" value={`${bubbles.current}/${bubbles.max}`} tone="orange" />
              <MiniProgressPill label="Từ cần ôn" value={learningSummary.vocabularyDueCount > 0 ? `${learningSummary.vocabularyDueCount}` : '0'} tone={learningSummary.vocabularyDueCount > 0 ? 'orange' : 'blue'} />
              <MiniProgressPill label="Trạng thái" value={todayStatus} tone={todayStatus === 'Hoàn thành' ? 'green' : 'blue'} />
            </SimpleGrid>
            <HStack mt="3" gap="2" wrap="wrap">
              <Button as={Link} to="/learning-path" size="sm" borderRadius="full" variant="outline" borderColor={OCEAN_TOKENS.border} color={OCEAN_TOKENS.deepBlue} leftIcon={<Icon as={Waves} />}>
                Lộ trình
              </Button>
              <Button as={Link} to={VIDEO_LAB_PATH} size="sm" borderRadius="full" variant="ghost" color={OCEAN_TOKENS.deepBlue} leftIcon={<Icon as={Video} />}>
                Tạo bài
              </Button>
              <Button as={Link} to={WEAK_REVIEW_PATH} size="sm" borderRadius="full" variant="ghost" color={OCEAN_TOKENS.deepBlue} leftIcon={<Icon as={Sparkles} />}>
                Ôn lại
              </Button>
            </HStack>
          </GlassPanel>
        </SimpleGrid>
      </Box>
    </OceanPageShell>
  );
}
