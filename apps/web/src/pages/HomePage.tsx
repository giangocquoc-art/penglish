import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Circle, Flex, HStack, Icon, SimpleGrid, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, Mic2, Sparkles, Waves } from 'lucide-react';
import { GlassPanel, OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';
import { StreakOceanDots } from '../components/streak/AdaptiveWhaleStreak';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, type DailyRewardState } from '../lib/p-english/daily-rewards';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { createCardEntrance, createCorrectAnswerBurst, killTimeline } from '../lib/animations/gsap-utils';
import { getLearningSummary, type LearningSummary } from '../lib/p-english/learning-summary';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { FOUNDATION48_BASE_PATH, foundation48Days, getFoundation48DayPath } from '../features/foundation48/foundation48Data';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48Progress } from '../features/foundation48/foundation48Progress';

const FLASHCARD_PATH = '/words';
const WEAK_REVIEW_PATH = '/words';
const SHADOWING_PATH = '/shadowing';
const DAILY_GOAL_COUNT = 3;
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

function getDailyFoundation48Target() {
  const progress = getFoundation48Progress();
  const days = progress.days || {};
  const lastDayOpened = Number(progress.lastDayOpened);
  const firstIncomplete = foundation48Days.find((day) => !days[day.dayNumber]?.completed)?.dayNumber || 1;
  const safeDay = Number.isFinite(lastDayOpened) && lastDayOpened > 0 ? Math.min(Math.max(lastDayOpened, 1), foundation48Days.length) : firstIncomplete;
  const currentProgress = days[safeDay];
  const currentDay = currentProgress?.completed && safeDay < foundation48Days.length ? safeDay + 1 : safeDay;
  return {
    dayNumber: currentDay,
    path: getFoundation48DayPath(currentDay),
    label: `Foundation48 · Ngày ${currentDay}`,
    completedToday: Boolean(progress.lastStudiedDate === getTodayKey() && currentProgress?.completed),
    streak: progress.streak || 0,
    completedDays: Object.values(days).filter((day) => day?.completed).length,
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
      p={{ base: '2.75', md: '4' }}
      minH={{ base: '108px', md: '156px' }}
      bg="rgba(255,255,255,0.70)"
      borderColor={OCEAN_TOKENS.border}
      display="flex"
      flexDirection="column"
      gap={{ base: '2', md: '2.5' }}
      minW="0"
      overflow="hidden"
      _hover={{ transform: 'translateY(-2px)', boxShadow: OCEAN_TOKENS.shadow }}
      transition="transform .18s ease, box-shadow .18s ease"
      _focusVisible={{ outline: '3px solid', outlineColor: OCEAN_TOKENS.oceanBlue, outlineOffset: '3px' }}
    >
      <HStack align="start" justify="space-between" gap="2">
        <Circle size={{ base: '34px', md: '44px' }} bg={accentBg} color={accentColor} border="1px solid" borderColor="rgba(255,255,255,0.78)" flexShrink={0}>
          <Icon as={task.icon} boxSize={{ base: '4.5', md: '6' }} />
        </Circle>
        <Text fontSize={{ base: '2xs', md: 'xs' }} color={accentColor} fontWeight="950" bg={accentBg} borderRadius="full" px={{ base: '2', md: '2.5' }} py="1" noOfLines={1}>{task.cta}</Text>
      </HStack>
      <Box minW="0" flex="1">
        <Text color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.18" noOfLines={1}>{task.title}</Text>
        <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="750" fontSize={{ base: 'xs', md: 'sm' }} lineHeight="1.45" noOfLines={{ base: 2, md: 2 }}>{task.subtitle}</Text>
      </Box>
    </LinkedGlassPanel>
  );
}

function PooReminderCard() {
  return (
    <GlassPanel className="home-dashboard-card" data-testid="home-poo-reminder" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.68)" borderColor={OCEAN_TOKENS.borderStrong}>
      <HStack gap="3" align="center">
        <OceanMascot mascot="poo" pose="coach" size="sm" decorative motion="float" />
        <Box minW="0">
          <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">Poo nhắc bạn</Text>
          <Text mt="1" color={OCEAN_TOKENS.text} fontWeight="850" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.45">
            Làm bài hôm nay trước. Ôn tập và shadowing là phần phụ.
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
  const reducedMotion = useReducedMotion();

  const dailyTarget = useMemo(() => getDailyFoundation48Target(), [progressVersion]);
  const todayProgress = useMemo(() => Math.min(100, Math.round((rewardState.completedToday.length / DAILY_GOAL_COUNT) * 100)), [rewardState.completedToday.length]);
  const todayStatus = dailyTarget.completedToday || rewardState.completedToday.length > 0 ? 'Đã học hôm nay' : 'Chưa bắt đầu';
  const streakLabel = dailyTarget.streak > 0 ? `${dailyTarget.streak} ngày` : rewardState.streakDays > 0 ? `${rewardState.streakDays} ngày` : 'Bắt đầu';
  const bubblesLabel = `${rewardState.bubbles}/${rewardState.maxBubbles}`;

  const dailyTasks: DailyTask[] = useMemo(() => [
    {
      title: 'Học bài hôm nay',
      subtitle: dailyTarget.label,
      cta: 'Bắt đầu',
      to: dailyTarget.path || FOUNDATION48_BASE_PATH,
      icon: Compass,
      accent: 'blue',
      testId: 'home-task-today-lesson',
    },
    {
      title: 'Ôn lỗi sai',
      subtitle: learningSummary.difficultWordCount > 0 ? `${learningSummary.difficultWordCount} mục Poo đang giữ lại.` : 'Ôn nhẹ vài câu để chắc hơn.',
      cta: 'Ôn nhẹ',
      to: WEAK_REVIEW_PATH,
      icon: Sparkles,
      accent: 'orange',
      testId: 'home-task-mistakes',
    },
    {
      title: 'Shadowing 5 phút',
      subtitle: learningSummary.shadowingDifficultCount > 0 ? 'Luyện lại câu nói còn khó.' : 'Nghe một câu, nói lại chậm.',
      cta: 'Luyện nói',
      to: SHADOWING_PATH,
      icon: Mic2,
      accent: 'aqua',
      testId: 'home-task-shadowing',
    },
    {
      title: 'Từ vựng cần nhớ',
      subtitle: learningSummary.vocabularyDueCount > 0 ? `${learningSummary.vocabularyDueCount} từ đến hạn ôn.` : 'Ôn vài từ để giữ trí nhớ.',
      cta: 'Ôn từ',
      to: FLASHCARD_PATH,
      icon: BookOpen,
      accent: 'green',
      testId: 'home-task-words',
    },
  ], [dailyTarget.label, dailyTarget.path, learningSummary.difficultWordCount, learningSummary.shadowingDifficultCount, learningSummary.vocabularyDueCount]);

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
    window.addEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refreshProgress);
    return () => {
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('storage', refreshProgress);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refreshProgress);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const cards = dashboardRef.current?.querySelectorAll('.home-dashboard-card');
    const entrance = cards?.length ? createCardEntrance(cards, { y: 12, duration: 0.34, stagger: 0.035 }) : null;
    const pulse = pulseRef.current ? createCorrectAnswerBurst(pulseRef.current, { scale: 1.02, duration: 0.18 }) : null;
    return () => {
      killTimeline(entrance);
      killTimeline(pulse);
    };
  }, [reducedMotion, progressVersion]);

  return (
    <OceanPageShell data-testid="home-page" variant="dashboard" overlayStrength="medium" ref={dashboardRef} px={{ base: '3', md: '5', xl: '6' }} py={{ base: '2', lg: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 188px)', md: '10', lg: '8' }} maxW="1180px" mx="auto" overflowX="hidden">
      <Box as="h1" position="absolute" left="-9999px" w="1px" h="1px" overflow="hidden">Trang chủ</Box>

      <GlassPanel className="home-dashboard-card" data-testid="home-daily-hero" p={{ base: '3.5', md: '6' }} mb={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.60)" borderColor={OCEAN_TOKENS.borderStrong} position="relative" overflow="hidden">
        <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 8%, rgba(91,188,235,0.18), transparent 28%), radial-gradient(circle at 8% 94%, rgba(255,255,255,0.72), transparent 26%)" pointerEvents="none" />
        <Flex position="relative" direction={{ base: 'column', md: 'row' }} gap={{ base: '3', md: '5' }} align={{ base: 'stretch', md: 'center' }} justify="space-between">
          <VStack align="start" gap={{ base: '2.5', md: '4' }} maxW="720px">
            <HStack wrap="wrap" gap="2" display={{ base: 'none', sm: 'flex' }}>
              <Tag borderRadius="full" bg={OCEAN_TOKENS.warm} color={OCEAN_TOKENS.text}><TagLabel>Dashboard hôm nay</TagLabel></Tag>
              <Tag borderRadius="full" bg={OCEAN_TOKENS.softAqua} color={OCEAN_TOKENS.deepBlue}><TagLabel>{dailyTarget.label}</TagLabel></Tag>
            </HStack>
            <Box minW="0">
              <Text as="h2" fontSize={{ base: '2xl', md: '4xl', xl: '5xl' }} fontWeight="950" color={OCEAN_TOKENS.text} lineHeight="1.04" data-testid="home-daily-title">
                Hôm nay học gì cùng Poo?
              </Text>
              <Text mt={{ base: '2', md: '3' }} fontSize={{ base: 'sm', md: 'lg' }} color={OCEAN_TOKENS.muted} fontWeight="800" lineHeight="1.5" maxW="620px" data-testid="home-daily-subtitle">
                Chỉ cần một bài nhỏ. Poo sẽ dẫn bạn từng bước.
              </Text>
            </Box>
            <Button as={Link} to={dailyTarget.path} size={{ base: 'md', md: 'lg' }} borderRadius="full" bg={OCEAN_TOKENS.oceanBlue} color="white" leftIcon={<Icon as={Compass} />} _hover={{ bg: OCEAN_TOKENS.deepBlue }} data-testid="home-primary-today-cta" data-home-cta="primary-today">
              Bắt đầu bài hôm nay
            </Button>
          </VStack>
          <Box display={{ base: 'none', md: 'block' }} pointerEvents="none" flexShrink={0}>
            <OceanMascot mascot="poo" pose="idle" size="lg" decorative motion="float" />
          </Box>
        </Flex>
      </GlassPanel>

      <Box display={{ base: 'block', md: 'none' }} mb="3" data-testid="home-compact-mobile-status">
        <HStack ref={pulseRef} justify="center" gap="1.5" border="1px solid" borderColor="rgba(255,255,255,0.74)" bg="rgba(255,255,255,0.58)" borderRadius="full" px="3" py="2" color={OCEAN_TOKENS.deepBlue} fontSize="xs" fontWeight="950" whiteSpace="nowrap" overflow="hidden">
          <Text noOfLines={1}>Ngày {dailyTarget.dayNumber}</Text>
          <Text color={OCEAN_TOKENS.muted}>·</Text>
          <Text noOfLines={1}>Bọt biển {bubblesLabel}</Text>
          <Text color={OCEAN_TOKENS.muted}>·</Text>
          <Text color={todayProgress >= 100 || dailyTarget.completedToday ? '#15803D' : OCEAN_TOKENS.deepBlue} noOfLines={1}>{todayStatus}</Text>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 3, md: 3 }} gap={{ base: '2', md: '3' }} mb={{ base: '3', md: '4' }} data-testid="home-simple-progress" display={{ base: 'none', md: 'grid' }}>
        <Box ref={pulseRef}><MiniProgressPill label="Hôm nay" value={todayStatus} tone={todayProgress >= 100 || dailyTarget.completedToday ? 'green' : 'blue'} /></Box>
        <MiniProgressPill label="Bọt biển" value={bubblesLabel} tone="orange" />
        <MiniProgressPill label="Lộ trình" value={`Ngày ${dailyTarget.dayNumber}`} tone={dailyTarget.completedDays > 0 ? 'green' : 'blue'} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: '3', md: '4' }} alignItems="start">
        <VStack align="stretch" gap={{ base: '3', md: '4' }} gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={{ base: '2.5', md: '3' }} data-testid="home-daily-task-grid">
            {dailyTasks.map((task) => <DailyTaskCard key={task.title} task={task} />)}
          </SimpleGrid>
          <PooReminderCard />
        </VStack>

        <VStack align="stretch" gap={{ base: '3', md: '4' }}>
          <GlassPanel className="home-dashboard-card" data-testid="home-today-summary" p={{ base: '2.75', md: '4' }} bg="rgba(255,255,255,0.68)" borderColor={OCEAN_TOKENS.borderStrong}>
            <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950" fontSize="xs" letterSpacing="1.8px" textTransform="uppercase">Tiến độ đơn giản</Text>
            <Text mt={{ base: '1.5', md: '2' }} color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'md', md: 'xl' }}>Bài nên học ngay</Text>
            <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="800" lineHeight="1.45" fontSize="sm">{dailyTarget.label}</Text>
            <SimpleGrid columns={2} gap="2.5" mt="3" display={{ base: 'none', sm: 'grid' }}>
              <MiniProgressPill label="Streak" value={streakLabel} tone="orange" />
              <MiniProgressPill label="Ngày xong" value={`${dailyTarget.completedDays}/48`} tone={dailyTarget.completedDays > 0 ? 'green' : 'blue'} />
              <MiniProgressPill label="Từ cần ôn" value={learningSummary.vocabularyDueCount > 0 ? `${learningSummary.vocabularyDueCount}` : '0'} tone={learningSummary.vocabularyDueCount > 0 ? 'orange' : 'blue'} />
              <MiniProgressPill label="Trạng thái" value={todayStatus} tone={todayStatus === 'Đã học hôm nay' ? 'green' : 'blue'} />
            </SimpleGrid>
            <Box mt="3" display={{ base: 'none', md: 'block' }}>
              <Text mb="2" color={OCEAN_TOKENS.muted} fontWeight="850" fontSize="sm">Nhịp 7 ngày</Text>
              <StreakOceanDots days={7} activeIndex={0} inactive={dailyTarget.streak <= 0 && rewardState.streakDays <= 0} />
            </Box>
          </GlassPanel>
        </VStack>
      </SimpleGrid>
    </OceanPageShell>
  );
}
