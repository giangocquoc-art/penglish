import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Circle, Flex, HStack, Icon, SimpleGrid, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, Mic2, Sparkles, Waves } from 'lucide-react';
import { GlassPanel, OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, getUnifiedBubbles, getWaterStreak, type DailyRewardState } from '../lib/p-english/daily-rewards';
import { LEARNING_HEARTS_UPDATED_EVENT } from '../lib/p-english/learning-hearts';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { createCardEntrance, createCorrectAnswerBurst, killTimeline } from '../lib/animations/gsap-utils';
import { getLearningSummary, type LearningSummary } from '../lib/p-english/learning-summary';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { FOUNDATION48_BASE_PATH, foundation48Days, getFoundation48DayPath } from '../features/foundation48/foundation48Data';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48Progress } from '../features/foundation48/foundation48Progress';

const FLASHCARD_PATH = '/words';
const WEAK_REVIEW_PATH = '/practice';
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
  const safeDayProgress = days[safeDay];
  const currentDay = safeDayProgress?.completed && safeDay < foundation48Days.length ? safeDay + 1 : safeDay;
  const currentProgress = days[currentDay];
  const completedDayEntries = Object.values(days).filter((day) => day?.completed);
  const completedToday = Boolean(progress.lastStudiedDate === getTodayKey() && completedDayEntries.length > 0);
  const completedDays = completedDayEntries.length;
  const status = completedToday || currentProgress?.completed ? 'Hoàn thành' : currentProgress?.started || (currentProgress?.completedSteps?.length || 0) > 0 ? 'Đang học' : 'Chưa bắt đầu';
  return {
    dayNumber: currentDay,
    path: getFoundation48DayPath(currentDay),
    label: `Foundation48 · Ngày ${currentDay}`,
    duration: '12 phút',
    steps: ['Từ mới', 'Mẫu câu', 'Nghe', 'Nói lại', 'Thử sức nhẹ'],
    completedToday,
    status,
    completedDays,
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
    <GlassPanel className="home-dashboard-card" data-testid="home-poo-reminder" p={{ base: '2.75', md: '4' }} bg="rgba(255,255,255,0.68)" borderColor={OCEAN_TOKENS.borderStrong}>
      <HStack gap="3" align="center">
        <OceanMascot mascot="poo" pose="coach" size="sm" decorative motion="float" />
        <Box minW="0">
          <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">Poo nhắc bạn</Text>
          <Text mt="1" color={OCEAN_TOKENS.text} fontWeight="850" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.45">
            Bấm “Bắt đầu bài hôm nay” trước. Nếu có câu nào vấp, Poo sẽ nhắc bạn ôn lại sau.
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
  const todayStatus = dailyTarget.status === 'Hoàn thành' || dailyTarget.completedToday || rewardState.completedToday.length > 0 ? 'Hoàn thành' : dailyTarget.status;
  const bubbles = useMemo(() => getUnifiedBubbles(rewardState), [rewardState]);
  const waterStreak = useMemo(() => getWaterStreak(rewardState), [rewardState]);

  const dailyTasks: DailyTask[] = useMemo(() => [
    {
      title: 'Hôm nay học gì',
      subtitle: `${dailyTarget.label} · ${dailyTarget.duration} · 5 bước cần làm`,
      cta: 'Bắt đầu bài hôm nay',
      to: dailyTarget.path || FOUNDATION48_BASE_PATH,
      icon: Compass,
      accent: 'blue',
      testId: 'home-task-today-lesson',
    },
    {
      title: 'Ôn cùng Poo',
      subtitle: learningSummary.difficultWordCount > 0 ? `${learningSummary.difficultWordCount} câu Poo muốn ôn lại hôm nay.` : 'Poo chưa thấy câu nào quá khó, mình ôn nhẹ vài câu nhé.',
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
      title: 'Từ vựng cần nhớ',
      subtitle: learningSummary.vocabularyDueCount > 0 ? `${learningSummary.vocabularyDueCount} từ đến hạn ôn.` : 'Ôn vài từ để giữ trí nhớ.',
      cta: 'Ôn từ',
      to: FLASHCARD_PATH,
      icon: BookOpen,
      accent: 'green',
      testId: 'home-task-words',
    },
  ], [dailyTarget.duration, dailyTarget.label, dailyTarget.path, learningSummary.difficultWordCount, learningSummary.shadowingDifficultCount, learningSummary.vocabularyDueCount]);

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
    return () => {
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('storage', refreshProgress);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshProgress);
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
    <OceanPageShell data-testid="home-page" variant="dashboard" overlayStrength="medium" ref={dashboardRef} px={{ base: '3', md: '5', xl: '6' }} py={{ base: '2', lg: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 16px)', md: '10', lg: '8' }} maxW="1180px" mx="auto" overflowX="hidden">
      <Box as="h1" position="absolute" left="-9999px" w="1px" h="1px" overflow="hidden">Trang chủ</Box>

      <GlassPanel className="home-dashboard-card" data-testid="home-daily-hero" p={{ base: '3', md: '6' }} pr={{ base: '74px', md: '6' }} mb={{ base: '2.5', md: '4' }} bg="rgba(255,255,255,0.60)" borderColor={OCEAN_TOKENS.borderStrong} position="relative" overflow="hidden">
        <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 8%, rgba(91,188,235,0.18), transparent 28%), radial-gradient(circle at 8% 94%, rgba(255,255,255,0.72), transparent 26%)" pointerEvents="none" />
        <Box display={{ base: 'block', md: 'none' }} position="absolute" right="2" bottom="2" opacity="0.72" pointerEvents="none" transform="scale(0.82)">
          <OceanMascot mascot="poo" pose="idle" size="sm" decorative motion="float" />
        </Box>
        <Flex position="relative" direction={{ base: 'column', md: 'row' }} gap={{ base: '2.5', md: '5' }} align={{ base: 'stretch', md: 'center' }} justify="space-between">
          <VStack align="start" gap={{ base: '2', md: '4' }} maxW="720px">
            <HStack wrap="wrap" gap="2" display={{ base: 'none', sm: 'flex' }}>
              <Tag borderRadius="full" bg={OCEAN_TOKENS.warm} color={OCEAN_TOKENS.text}><TagLabel>PooEnglish hôm nay</TagLabel></Tag>
              <Tag borderRadius="full" bg={OCEAN_TOKENS.softAqua} color={OCEAN_TOKENS.deepBlue}><TagLabel>{dailyTarget.label}</TagLabel></Tag>
              <Tag borderRadius="full" bg="rgba(255,255,255,0.78)" color={OCEAN_TOKENS.deepBlue}><TagLabel>{dailyTarget.duration}</TagLabel></Tag>
            </HStack>
            <Box minW="0">
              <Text as="h2" fontSize={{ base: 'xl', sm: '2xl', md: '4xl', xl: '5xl' }} fontWeight="950" color={OCEAN_TOKENS.text} lineHeight="1.04" data-testid="home-daily-title">
                Hôm nay học gì cùng Poo?
              </Text>
              <Text mt={{ base: '1.5', md: '3' }} fontSize={{ base: 'sm', md: 'lg' }} color={OCEAN_TOKENS.muted} fontWeight="800" lineHeight={{ base: '1.38', md: '1.5' }} maxW="620px" data-testid="home-daily-subtitle">
                Bài nên học ngay: {dailyTarget.label}. Học {dailyTarget.duration}: {dailyTarget.steps.join(' → ')}. Poo sẽ giữ tiến độ và nhắc câu cần ôn.
              </Text>
            </Box>
            <HStack gap="2.5" wrap="wrap" w="100%">
              <Button as={Link} to={dailyTarget.path} size={{ base: 'md', md: 'lg' }} borderRadius="full" bg={OCEAN_TOKENS.oceanBlue} color="white" leftIcon={<Icon as={Compass} />} _hover={{ bg: OCEAN_TOKENS.deepBlue }} data-testid="home-primary-today-cta" data-home-cta="primary-today">
                Bắt đầu bài hôm nay
              </Button>
              <Button as={Link} to="/practice" size={{ base: 'md', md: 'lg' }} borderRadius="full" bg="rgba(255,255,255,0.72)" color={OCEAN_TOKENS.deepBlue} border="1px solid" borderColor={OCEAN_TOKENS.border} leftIcon={<Icon as={Sparkles} />} _hover={{ bg: 'rgba(232,244,255,0.88)' }} data-testid="home-secondary-mistakes-cta">
                Ôn cùng Poo
              </Button>
              <Button as={Link} to="/learning-path" size={{ base: 'md', md: 'lg' }} borderRadius="full" bg="rgba(255,255,255,0.72)" color={OCEAN_TOKENS.deepBlue} border="1px solid" borderColor={OCEAN_TOKENS.border} leftIcon={<Icon as={Waves} />} _hover={{ bg: 'rgba(232,244,255,0.88)' }} data-testid="home-secondary-path-cta">
                Xem lộ trình
              </Button>
            </HStack>
          </VStack>
          <Box display={{ base: 'none', md: 'block' }} pointerEvents="none" flexShrink={0}>
            <OceanMascot mascot="poo" pose="idle" size="lg" decorative motion="float" />
          </Box>
        </Flex>
      </GlassPanel>

      <SimpleGrid columns={{ base: 2, md: 3 }} gap={{ base: '2', md: '3' }} mb={{ base: '3', md: '4' }} data-testid="home-simple-progress">
        <Box ref={pulseRef} gridColumn={{ base: 'span 2', md: 'auto' }}><MiniProgressPill label="Hôm nay" value={todayStatus} tone={todayProgress >= 100 || dailyTarget.completedToday ? 'green' : 'blue'} /></Box>
        <MiniProgressPill label="Bọt biển" value={`${bubbles.current}/${bubbles.max}`} tone="orange" />
        <MiniProgressPill label="Thời lượng" value={dailyTarget.duration} tone="blue" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: '2.5', md: '4' }} alignItems="start">
        <VStack align="stretch" gap={{ base: '2.5', md: '4' }} gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={{ base: '2', md: '3' }} data-testid="home-daily-task-grid">
            {dailyTasks.map((task) => <DailyTaskCard key={task.title} task={task} />)}
          </SimpleGrid>
          <PooReminderCard />
        </VStack>

        <VStack align="stretch" gap={{ base: '2.5', md: '4' }}>
          <GlassPanel className="home-dashboard-card" data-testid="home-today-summary" p={{ base: '2.5', md: '4' }} bg="rgba(255,255,255,0.68)" borderColor={OCEAN_TOKENS.borderStrong}>
            <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950" fontSize="xs" letterSpacing="1.8px" textTransform="uppercase">Tiến độ hiện tại</Text>
            <Text mt={{ base: '1.5', md: '2' }} color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'md', md: 'xl' }}>Bài đang chờ bạn</Text>
            <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="800" lineHeight="1.45" fontSize="sm">{dailyTarget.label} · {dailyTarget.duration}</Text>
            <HStack mt="2" gap="1.5" wrap="wrap" data-testid="home-today-step-loop">
              {dailyTarget.steps.map((step) => (
                <Text key={step} px="2" py="1" borderRadius="full" bg="rgba(232,244,255,0.72)" color={OCEAN_TOKENS.deepBlue} fontSize="2xs" fontWeight="950">{step}</Text>
              ))}
            </HStack>
            <SimpleGrid columns={2} gap={{ base: '2', sm: '2.5' }} mt={{ base: '2.5', sm: '3' }} display="grid" data-testid="home-summary-progress-grid">
              <MiniProgressPill label="Chuỗi nước" value={waterStreak.label} tone="blue" />
              <MiniProgressPill label="Ngày xong" value={`${dailyTarget.completedDays}/48`} tone={dailyTarget.completedDays > 0 ? 'green' : 'blue'} />
              <MiniProgressPill label="Từ cần ôn" value={learningSummary.vocabularyDueCount > 0 ? `${learningSummary.vocabularyDueCount}` : '0'} tone={learningSummary.vocabularyDueCount > 0 ? 'orange' : 'blue'} />
              <MiniProgressPill label="Trạng thái" value={todayStatus} tone={todayStatus === 'Hoàn thành' ? 'green' : 'blue'} />
            </SimpleGrid>
            <Box mt="3" display={{ base: 'none', md: 'block' }}>
              <Text mb="2" color={OCEAN_TOKENS.muted} fontWeight="850" fontSize="sm">Nhịp chuỗi nước</Text>
              <Box className={`bubble-streak-progress${waterStreak.isFull ? ' is-full' : ''}`} role="progressbar" aria-valuenow={waterStreak.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={waterStreak.displayLabel}>
                <Box className="bubble-streak-progress-fill" w={`${Math.max(4, waterStreak.progressPercent)}%`} />
              </Box>
            </Box>
          </GlassPanel>
        </VStack>
      </SimpleGrid>

      <GlassPanel className="home-dashboard-card" data-testid="home-continue-section" mt={{ base: '2.5', md: '4' }} p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.58)" borderColor="rgba(255,255,255,0.58)">
        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} justify="space-between" gap={{ base: '2.5', md: '4' }}>
          <HStack gap="3" align="center" minW="0">
            <Circle size={{ base: '38px', md: '44px' }} bg="rgba(232,244,255,0.82)" color={OCEAN_TOKENS.deepBlue} flexShrink={0}>
              <Icon as={Compass} boxSize={{ base: '4.5', md: '5' }} />
            </Circle>
            <Box minW="0">
              <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950" fontSize="xs" letterSpacing="1.4px" textTransform="uppercase">Bấm vào đâu để học tiếp</Text>
              <Text mt="1" color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>{dailyTarget.label}</Text>
              <Text mt="0.5" color={OCEAN_TOKENS.muted} fontWeight="800" fontSize={{ base: 'xs', md: 'sm' }} noOfLines={1}>Mở đúng bài cần học tiếp trong hôm nay.</Text>
            </Box>
          </HStack>
          <Button as={Link} to={dailyTarget.path} size={{ base: 'sm', md: 'md' }} alignSelf={{ base: 'flex-start', md: 'center' }} borderRadius="full" bg="rgba(255,255,255,0.72)" color={OCEAN_TOKENS.deepBlue} border="1px solid" borderColor={OCEAN_TOKENS.border} leftIcon={<Icon as={Sparkles} />} _hover={{ bg: 'rgba(232,244,255,0.86)' }} data-testid="home-continue-cta">
            Bắt đầu bài hôm nay
          </Button>
        </Flex>
      </GlassPanel>
    </OceanPageShell>
  );
}
