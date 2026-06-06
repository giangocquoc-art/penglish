import { useEffect, useMemo, useRef, useState } from 'react';
import { getDashboardSnapshot } from '../lib/p-english/userDataAdapter';
import { Box, Button, Circle, Flex, HStack, Icon, SimpleGrid, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, Mic2, Sparkles, Waves } from 'lucide-react';
import { SkillCoverageGrid } from '../components/p-english/SkillCoverageGrid';
import { UnifiedProgressRing } from '../components/p-english/UnifiedProgressRing';
import { RecentPracticeMemoryCard } from '../components/p-english/RecentPracticeMemoryCard';
import { GlassPanel, OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';
import { StreakOceanDots } from '../components/streak/AdaptiveWhaleStreak';
import { getUnifiedContentDepthSnapshot, getUnifiedDashboardSnapshot, getUnifiedSkillCoverage, type UnifiedSkillDepthKey } from '../lib/p-english/unifiedLessonEngine';
import { LESSON_PROGRESS_UPDATED_EVENT } from '../lib/p-english/lesson-progress';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, type DailyRewardState } from '../lib/p-english/daily-rewards';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { createCardEntrance, createCorrectAnswerBurst, killTimeline } from '../lib/animations/gsap-utils';
import { getLearningSummary, type LearningSummary, type RecommendedLearningAction } from '../lib/p-english/learning-summary';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';

const SPEED_PATH = '/english-speed';
const FLASHCARD_PATH = '/words';
const WEAK_REVIEW_PATH = '/words';
const SHADOWING_PATH = '/shadowing';
const LinkedGlassPanel = GlassPanel as any;

const DAILY_GOAL_COUNT = 3;

const DATA_DEPTH_SKILL_LABELS: Record<UnifiedSkillDepthKey, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  shadowing: 'Shadowing',
  speaking: 'Speaking',
};

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <Box mb={{ base: '3', md: '5' }}>
      <Text fontSize="xs" letterSpacing="2.2px" fontWeight="950" color={OCEAN_TOKENS.deepBlue} textTransform="uppercase">
        {eyebrow}
      </Text>
      <Text as="h2" mt="2" fontSize={{ base: 'xl', md: '3xl' }} fontWeight="950" color={OCEAN_TOKENS.text} lineHeight="1.12">
        {title}
      </Text>
      {description ? (
        <Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.7" maxW="780px" display={{ base: 'none', md: 'block' }}>
          {description}
        </Text>
      ) : null}
    </Box>
  );
}

function MetricPill({ label, value, tone = 'blue' }: { label: string; value: string; tone?: 'blue' | 'green' | 'orange' }) {
  const color = tone === 'green' ? '#15803D' : tone === 'orange' ? '#B45309' : OCEAN_TOKENS.deepBlue;
  const bg = tone === 'green' ? 'rgba(220, 252, 231, 0.72)' : tone === 'orange' ? 'rgba(255, 243, 196, 0.76)' : 'rgba(232, 244, 255, 0.72)';
  return (
    <GlassPanel className="home-dashboard-card" borderRadius="22px" px={{ base: '3', md: '4' }} py={{ base: '3', md: '4' }} bg={bg} minH={{ base: '76px', md: '88px' }}>
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={color} lineHeight="1" noOfLines={1}>{value}</Text>
      <Text mt="1.5" fontSize={{ base: 'xs', md: 'sm' }} fontWeight="850" color={OCEAN_TOKENS.muted} noOfLines={1}>{label}</Text>
    </GlassPanel>
  );
}

function DashboardSummaryPill({ label, value, helper, tone = 'blue', testId }: { label: string; value: string | number; helper: string; tone?: 'blue' | 'green' | 'orange' | 'red'; testId?: string }) {
  const color = tone === 'green' ? '#15803D' : tone === 'orange' ? '#B45309' : tone === 'red' ? '#B91C1C' : OCEAN_TOKENS.deepBlue;
  const bg = tone === 'green' ? 'rgba(220, 252, 231, 0.72)' : tone === 'orange' ? 'rgba(255, 243, 196, 0.76)' : tone === 'red' ? 'rgba(254, 226, 226, 0.76)' : 'rgba(232, 244, 255, 0.72)';
  return (
    <Box data-testid={testId} borderRadius="2xl" bg={bg} border="1px solid" borderColor="rgba(255,255,255,0.72)" px={{ base: '3', md: '4' }} py="3" minW="0">
      <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="950" color={color} lineHeight="1">{value}</Text>
      <Text mt="1" fontSize="xs" fontWeight="900" color={OCEAN_TOKENS.text} noOfLines={1}>{label}</Text>
      <Text mt="0.5" fontSize="xs" fontWeight="750" color={OCEAN_TOKENS.muted} noOfLines={1}>{helper}</Text>
    </Box>
  );
}

function getRecommendedActionConfig(action: RecommendedLearningAction, nextLessonPath: string) {
  if (action === 'vocabulary') return { label: 'Ôn từ vựng', path: WEAK_REVIEW_PATH, icon: BookOpen };
  if (action === 'shadowing') return { label: 'Ôn câu khó', path: SHADOWING_PATH, icon: Waves };
  if (action === 'speed') return { label: 'Luyện phát âm', path: SPEED_PATH, icon: Mic2 };
  return { label: 'Bắt đầu bài hôm nay', path: nextLessonPath, icon: Compass };
}

function getRecommendedMessage(summary: LearningSummary) {
  if (summary.vocabularyDueCount > 0) return `Bạn có ${summary.vocabularyDueCount} từ cần ôn hôm nay.`;
  if (summary.shadowingDifficultCount > 0) return `Có ${summary.shadowingDifficultCount} câu shadowing đang được đánh dấu khó.`;
  return 'Học tiếp một bước nhỏ để giữ nhịp hôm nay.';
}

function ActionCard({ title, description, cta, to, icon, featured = false }: {
  title: string;
  description: string;
  cta: string;
  to: string;
  icon: any;
  featured?: boolean;
}) {
  return (
    <LinkedGlassPanel
      className="home-dashboard-card"
      as={Link}
      to={to}
      display="flex"
      flexDirection="column"
      minW="0"
      minH={{ base: featured ? '132px' : '116px', md: '168px' }}
      p={{ base: '3.5', md: '5' }}
      bg={featured ? 'rgba(232, 244, 255, 0.78)' : OCEAN_TOKENS.surface}
      borderColor={featured ? OCEAN_TOKENS.borderStrong : OCEAN_TOKENS.border}
      position="relative"
      overflow="hidden"
      _hover={{ transform: 'translateY(-3px)', boxShadow: OCEAN_TOKENS.shadow }}
      transition="transform .18s ease, box-shadow .18s ease"
      data-home-cta={title}
      aria-label={`${cta}: ${title}`}
      _focusVisible={{ outline: '3px solid', outlineColor: OCEAN_TOKENS.oceanBlue, outlineOffset: '3px' }}
    >
      <Box position="absolute" right="-44px" top="-58px" w="150px" h="150px" borderRadius="full" bg="rgba(91,188,235,0.16)" />
      <HStack align="start" gap="3" position="relative" mb={{ base: '2', md: '4' }}>
        <Flex w={{ base: '42px', md: '44px' }} h={{ base: '42px', md: '44px' }} borderRadius="2xl" bg="rgba(255,255,255,0.80)" color={OCEAN_TOKENS.deepBlue} align="center" justify="center" border="1px solid" borderColor={OCEAN_TOKENS.border} boxShadow="0 10px 24px rgba(47,158,235,0.10)" flexShrink={0}>
          <Icon as={icon} boxSize="6" />
        </Flex>
        <Box minW="0">
          <Text fontSize={{ base: 'md', md: featured ? 'xl' : 'lg' }} fontWeight="950" color={OCEAN_TOKENS.text} lineHeight="1.22">{title}</Text>
          <Text mt="1" fontSize="xs" fontWeight="900" color={OCEAN_TOKENS.deepBlue} letterSpacing="1px" textTransform="uppercase" display={{ base: featured ? 'block' : 'none', md: 'block' }}>{featured ? 'Ưu tiên hôm nay' : 'Tùy chọn nhanh'}</Text>
        </Box>
      </HStack>
      <Text color={OCEAN_TOKENS.muted} fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" lineHeight={{ base: '1.45', md: '1.65' }} position="relative" flex="1" noOfLines={{ base: featured ? 2 : 1, md: undefined }}>
        {description}
      </Text>
      <Button as="span" mt={{ base: '3', md: '4' }} size={{ base: 'sm', md: 'sm' }} alignSelf="start" borderRadius="full" bg={featured ? OCEAN_TOKENS.oceanBlue : 'rgba(255,255,255,0.72)'} color={featured ? 'white' : OCEAN_TOKENS.deepBlue} rightIcon={<Icon as={Sparkles} />} border="1px solid" borderColor={featured ? 'transparent' : OCEAN_TOKENS.borderStrong} _hover={{ bg: featured ? OCEAN_TOKENS.deepBlue : OCEAN_TOKENS.softBlue }} position="relative">
        {cta}
      </Button>
    </LinkedGlassPanel>
  );
}

export function HomePage() {
  const [rewardState, setRewardState] = useState<DailyRewardState>(() => getDailyRewardState());
  const [progressVersion, setProgressVersion] = useState(0);
  const [learningSummary, setLearningSummary] = useState<LearningSummary>(() => getLearningSummary());
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  const dashboardSnapshot = useMemo(() => getUnifiedDashboardSnapshot(), [progressVersion]);
  const skillCoverage = useMemo(() => getUnifiedSkillCoverage(), [progressVersion]);
  const contentDepthSnapshot = useMemo(() => getUnifiedContentDepthSnapshot(), [progressVersion]);
  const nextLessonPath = dashboardSnapshot.nextLessonPath;
  const nextLessonTitle = dashboardSnapshot.nextLessonTitle || 'Bài học tiếp theo đang sẵn sàng';
  const dueReviews = learningSummary.vocabularyDueCount;
  const recommendedAction = useMemo(() => getRecommendedActionConfig(learningSummary.recommendedAction, nextLessonPath), [learningSummary.recommendedAction, nextLessonPath]);
  const recommendedMessage = useMemo(() => getRecommendedMessage(learningSummary), [learningSummary]);
  const weakestSkill = useMemo(() => {
    const entries = Object.entries(skillCoverage).filter(([, count]) => count > 0);
    return entries.sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'speaking';
  }, [skillCoverage]);
  const todayProgress = useMemo(() => Math.min(100, Math.round((rewardState.completedToday.length / DAILY_GOAL_COUNT) * 100)), [rewardState.completedToday.length]);
  const isBeginnerEmptyState = rewardState.completedToday.length === 0 && rewardState.streakDays === 0 && dashboardSnapshot.completedUnits === 0 && learningSummary.vocabularyDueCount === 0 && learningSummary.difficultWordCount === 0;
  const todayProgressLabel = todayProgress > 0 ? `${todayProgress}%` : 'Chưa bắt đầu';
  const streakLabel = rewardState.streakDays > 0 ? `${rewardState.streakDays} ngày` : 'Học 1 bài';
  const unitProgressLabel = dashboardSnapshot.completedUnits > 0 ? `${dashboardSnapshot.completedUnits}/${dashboardSnapshot.availableUnits || dashboardSnapshot.totalUnits}` : 'Chưa bắt đầu';
  const cefrProgressLabel = dashboardSnapshot.pathPercentage > 0 ? `${dashboardSnapshot.pathPercentage}%` : 'Mở sau bài 1';

  const [dataModeLabel, setDataModeLabel] = useState<'Lưu trên thiết bị' | 'Đã đồng bộ' | 'Chưa đồng bộ được'>('Lưu trên thiết bị');

  useEffect(() => {
    getDashboardSnapshot().then((snapshot) => setDataModeLabel(snapshot.dataModeLabel)).catch(() => setDataModeLabel('Chưa đồng bộ được'));
  }, [progressVersion]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const refreshProgress = () => {
      setRewardState(getDailyRewardState());
      setProgressVersion((value) => value + 1);
      setLearningSummary(getLearningSummary());
    };
    refreshProgress();
    window.addEventListener('focus', refreshProgress);
    window.addEventListener('storage', refreshProgress);
    window.addEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(LESSON_PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshProgress);
    return () => {
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('storage', refreshProgress);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(LESSON_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshProgress);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const cards = dashboardRef.current?.querySelectorAll('.home-dashboard-card:not([data-skill-coverage-card="true"])');
    const entrance = cards?.length ? createCardEntrance(cards, { y: 14, duration: 0.38, stagger: 0.04 }) : null;
    const pulse = pulseRef.current ? createCorrectAnswerBurst(pulseRef.current, { scale: 1.025, duration: 0.2 }) : null;
    return () => {
      killTimeline(entrance);
      killTimeline(pulse);
    };
  }, [reducedMotion, progressVersion]);

  const primaryActions = [
    {
      title: '48 ngày lấy gốc',
      description: 'Khóa nền tảng chính cho người mới: mỗi ngày học theo từng bước nhỏ, nghe, làm bài, nói và ôn lỗi sai.',
      cta: 'Xem lộ trình 48 ngày',
      to: '/luyen-tieng-anh/48-ngay-lay-goc',
      icon: Compass,
      featured: true,
    },
    {
      title: 'Shadowing 3 câu',
      description: 'Nghe mẫu, nói lại, xem phản hồi và lưu câu khó để luyện nói rõ hơn mỗi ngày.',
      cta: 'Vào Shadowing',
      to: SHADOWING_PATH,
      icon: Waves,
      featured: true,
    },
    {
      title: 'Ôn từ vựng',
      description: dueReviews > 0 ? `${dueReviews} mục đã đến hạn ôn. Làm nhanh để giữ trí nhớ dài hạn.` : 'Sổ tay từ vựng cá nhân luôn sẵn sàng để ôn nhẹ theo nhịp của bạn.',
      cta: 'Ôn ngay',
      to: dueReviews > 0 ? WEAK_REVIEW_PATH : FLASHCARD_PATH,
      icon: BookOpen,
    },
  ];

  return (
    <OceanPageShell variant="dashboard" overlayStrength="medium" ref={dashboardRef} px={{ base: '3', md: '5', xl: '6' }} py={{ base: '2', lg: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 112px)', lg: '8' }} maxW="1240px" mx="auto" overflowX="hidden" sx={{ scrollPaddingBottom: 'calc(var(--penglish-mobile-safe-bottom) + 132px)' }}>
      <Box as="h1" position="absolute" left="-9999px" w="1px" h="1px" overflow="hidden">Trang chủ</Box>

      <GlassPanel className="home-dashboard-card" p={{ base: '3.5', md: '6' }} mb={{ base: '3', md: '4' }} bg="rgba(255, 255, 255, 0.58)" borderColor={OCEAN_TOKENS.borderStrong} position="relative" overflow="hidden">
        <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 8%, rgba(91,188,235,0.18), transparent 28%), radial-gradient(circle at 8% 94%, rgba(255,255,255,0.70), transparent 26%)" pointerEvents="none" />
        <Flex position="relative" direction={{ base: 'column', lg: 'row' }} gap="4" align={{ base: 'stretch', lg: 'center' }} justify="space-between">
          <VStack align="start" gap={{ base: '2.5', md: '4' }} maxW="820px">
            <HStack wrap="wrap" gap="2" display={{ base: 'none', sm: 'flex' }}>
              <Tag borderRadius="full" bg={OCEAN_TOKENS.warm} color={OCEAN_TOKENS.text}><TagLabel>Dashboard hôm nay</TagLabel></Tag>
              <Tag borderRadius="full" bg={OCEAN_TOKENS.softAqua} color={OCEAN_TOKENS.deepBlue}><TagLabel>{dashboardSnapshot.currentLevel} · {dashboardSnapshot.currentLevelLabel}</TagLabel></Tag>
              <Tag data-testid="home-data-mode-indicator" borderRadius="full" bg={dataModeLabel === 'Đã đồng bộ' ? '#EAFBF0' : '#E8F4FF'} color={dataModeLabel === 'Đã đồng bộ' ? '#16803A' : OCEAN_TOKENS.deepBlue}><TagLabel>{dataModeLabel}</TagLabel></Tag>
            </HStack>
            <Box>
              <Text as="h2" fontSize={{ base: '2xl', md: '4xl', xl: '5xl' }} fontWeight="950" color={OCEAN_TOKENS.text} lineHeight="1.04">
                Học tiếng Anh mỗi ngày cùng Poo
              </Text>
              <Text data-testid="home-dashboard-recommended-message" mt={{ base: '2', md: '3' }} fontSize={{ base: 'sm', md: 'md', xl: 'lg' }} color={OCEAN_TOKENS.muted} fontWeight="750" lineHeight="1.55" maxW="760px" noOfLines={{ base: 2, md: undefined }}>
                {rewardState.completedToday.length > 0 ? 'Hôm nay bạn đã có hoạt động học.' : recommendedMessage} Mở một node nhỏ, học 3–7 phút, rồi để Poo lưu tiến độ trên thiết bị này.
              </Text>
            </Box>
            <HStack gap="3" wrap="wrap">
              <Button as={Link} to="/learning-path" size={{ base: 'md', md: 'md' }} borderRadius="full" bg={OCEAN_TOKENS.oceanBlue} color="white" leftIcon={<Icon as={Compass} />} _hover={{ bg: OCEAN_TOKENS.deepBlue }} data-testid="home-recommended-action" data-home-cta="hero-continue">
                Bắt đầu bài hôm nay
              </Button>
              <Button as={Link} to="/luyen-tieng-anh/48-ngay-lay-goc" size={{ base: 'md', md: 'md' }} borderRadius="full" bg="rgba(255,255,255,0.76)" color={OCEAN_TOKENS.deepBlue} leftIcon={<Icon as={Sparkles} />} border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }} data-home-cta="hero-foundation48">
                Xem lộ trình 48 ngày
              </Button>
            </HStack>
          </VStack>
          <Box display={{ base: 'none', md: 'block' }} alignSelf={{ lg: 'end' }} pr={{ lg: '2' }} pointerEvents="none">
            <OceanMascot mascot="poo" pose="idle" size="lg" decorative motion="float" />
          </Box>
        </Flex>
      </GlassPanel>

      <SimpleGrid columns={{ base: 2, lg: 4 }} gap={{ base: '2.5', md: '3' }} mb={{ base: '3', md: '5' }}>
        <MetricPill label="Tiến độ hôm nay" value={todayProgressLabel} tone={todayProgress >= 100 ? 'green' : 'blue'} />
        <MetricPill label="Chuỗi học" value={streakLabel} tone="orange" />
        <MetricPill label="Unit xong" value={unitProgressLabel} tone={dashboardSnapshot.completedUnits > 0 ? 'green' : 'blue'} />
        <Box ref={pulseRef}><MetricPill label="CEFR" value={cefrProgressLabel} tone={dashboardSnapshot.pathPercentage >= 100 ? 'green' : 'blue'} /></Box>
      </SimpleGrid>

      <GlassPanel data-testid="home-local-learning-summary" className="home-dashboard-card" p={{ base: '3', md: '4' }} mb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 24px)', md: '5' }} bg="rgba(255,255,255,0.68)" borderColor={OCEAN_TOKENS.borderStrong} scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 132px)">
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="3" direction={{ base: 'column', md: 'row' }} mb="3">
          <Box minW="0">
            <HStack gap="2" wrap="wrap">
              <Text fontWeight="950" color={OCEAN_TOKENS.text} fontSize={{ base: 'md', md: 'lg' }}>Ôn hôm nay</Text>
              <Tag borderRadius="full" size="sm" bg="#E8F4FF" color={OCEAN_TOKENS.deepBlue}><TagLabel>Lưu trên thiết bị</TagLabel></Tag>
            </HStack>
            <Text data-testid="home-daily-reward-message" mt="1" color={OCEAN_TOKENS.muted} fontWeight="750" fontSize="sm" noOfLines={{ base: 2, md: 1 }}>
              {isBeginnerEmptyState ? 'Học 1 bài để mở thống kê. Poo sẽ lưu từ sai sau bài đầu tiên.' : rewardState.completedToday.length > 0 ? `Hôm nay bạn đã hoàn thành ${rewardState.completedToday.length}/${DAILY_GOAL_COUNT} mục học.` : learningSummary.hasEnglishSpeedProgress ? `Bạn đã có ${learningSummary.englishSpeedPracticedCount} lượt luyện phát âm.` : 'Bắt đầu một bài ngắn, một lượt shadowing hoặc ôn từ để tăng tiến độ hôm nay.'}
            </Text>
          </Box>
          <Button as={Link} to={recommendedAction.path} size="sm" borderRadius="full" bg={OCEAN_TOKENS.oceanBlue} color="white" leftIcon={<Icon as={recommendedAction.icon} />} _hover={{ bg: OCEAN_TOKENS.deepBlue }} data-testid="home-summary-cta" flexShrink={0}>
            {recommendedAction.label}
          </Button>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 5 }} gap={{ base: '2', md: '2.5' }} pb={{ base: '2', md: '0' }} scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 132px)">
          <DashboardSummaryPill testId="home-vocab-due-count" label="Từ cần ôn" value={isBeginnerEmptyState ? 'Chưa bắt đầu' : learningSummary.vocabularyDueCount} helper={isBeginnerEmptyState ? 'Học bài đầu để mở' : 'Ôn hôm nay'} tone={learningSummary.vocabularyDueCount > 0 ? 'orange' : 'blue'} />
          <DashboardSummaryPill testId="home-vocab-difficult-count" label="Từ hay sai" value={isBeginnerEmptyState ? 'Poo sẽ lưu' : learningSummary.difficultWordCount} helper={isBeginnerEmptyState ? 'Sau bài đầu tiên' : 'Cần xem lại'} tone={learningSummary.difficultWordCount > 0 ? 'red' : 'blue'} />
          <DashboardSummaryPill testId="home-shadowing-practiced-count" label="Câu shadowing" value={learningSummary.shadowingPracticedCount > 0 ? learningSummary.shadowingPracticedCount : 'Chưa bắt đầu'} helper={learningSummary.shadowingPracticedCount > 0 ? 'Đã luyện' : 'Nghe 1 câu mẫu'} tone={learningSummary.shadowingPracticedCount > 0 ? 'green' : 'blue'} />
          <DashboardSummaryPill testId="home-shadowing-difficult-count" label="Câu khó" value={isBeginnerEmptyState ? 'Poo sẽ nhắc' : learningSummary.shadowingDifficultCount} helper={isBeginnerEmptyState ? 'Khi bạn luyện nói' : 'Cần xem lại'} tone={learningSummary.shadowingDifficultCount > 0 ? 'orange' : 'blue'} />
          <DashboardSummaryPill testId="home-speed-practiced-count" label="Luyện phát âm" value={learningSummary.hasEnglishSpeedProgress ? learningSummary.englishSpeedPracticedCount : 'Sẵn sàng'} helper={learningSummary.hasEnglishSpeedProgress ? 'Lượt luyện' : 'Chạy trực tiếp trên web'} tone={learningSummary.hasEnglishSpeedProgress ? 'green' : 'blue'} />
          <DashboardSummaryPill testId="home-bubbles-count" label="Bọt biển" value={`${rewardState.bubbles}/${rewardState.maxBubbles}`} helper="Năng lượng học" tone="orange" />
        </SimpleGrid>
      </GlassPanel>

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap="4" mb="6" alignItems="stretch" display={{ base: 'none', md: 'grid' }}>
        <UnifiedProgressRing
          percentage={dashboardSnapshot.pathPercentage}
          completedUnits={dashboardSnapshot.completedUnits}
          totalUnits={dashboardSnapshot.availableUnits || dashboardSnapshot.totalUnits}
          currentLevel={dashboardSnapshot.currentLevel}
          currentLevelLabel={dashboardSnapshot.currentLevelLabel}
          nextTitle={nextLessonTitle}
        />
        <GlassPanel className="home-dashboard-card" p={{ base: '5', md: '5' }} display="flex" flexDirection="column" gap="3" minH="100%">
          <HStack justify="space-between" align="start">
            <Box>
              <Text fontSize="xs" letterSpacing="2px" fontWeight="950" color={OCEAN_TOKENS.deepBlue}>BƯỚC TIẾP THEO</Text>
              <Text mt="2" fontWeight="950" color={OCEAN_TOKENS.text} fontSize="xl" lineHeight="1.24" noOfLines={3}>{nextLessonTitle}</Text>
            </Box>
            <Circle size="54px" bg={OCEAN_TOKENS.softAqua} color={OCEAN_TOKENS.deepBlue}><Icon as={Compass} boxSize="7" /></Circle>
          </HStack>
          <Box p="4" borderRadius="2xl" bg="rgba(232,244,255,0.66)" border="1px solid" borderColor={OCEAN_TOKENS.border}>
            <Text color={OCEAN_TOKENS.text} fontWeight="900" lineHeight="1.65">
              Poo gợi ý: hôm nay chỉ cần học một bài ngắn, rồi ôn 5 từ là đủ giữ nhịp.
            </Text>
            <Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="750" lineHeight="1.65">
              Trọng tâm hiện tại là <Text as="span" color={OCEAN_TOKENS.deepBlue} fontWeight="950">{weakestSkill}</Text>; data depth trung bình <Text as="span" color={OCEAN_TOKENS.deepBlue} fontWeight="950">{contentDepthSnapshot.averageDepthScore}/100</Text>.
            </Text>
          </Box>
          <Box mt="auto">
            <Text mb="3" fontSize="sm" color={OCEAN_TOKENS.muted} fontWeight="850">{rewardState.streakDays > 0 ? 'Nhịp 7 ngày' : 'Học 1 bài để mở nhịp học gần đây'}</Text>
            <StreakOceanDots days={7} activeIndex={0} inactive={rewardState.streakDays <= 0} />
          </Box>
          <Button as={Link} to={nextLessonPath} alignSelf="start" borderRadius="full" bg={OCEAN_TOKENS.oceanBlue} color="white" _hover={{ bg: OCEAN_TOKENS.deepBlue }}>Mở bài học</Button>
        </GlassPanel>
        <Box gridColumn={{ base: 'auto', xl: '1 / -1' }}>
          <RecentPracticeMemoryCard fallbackPath={nextLessonPath} />
        </Box>
      </SimpleGrid>

      <Box mb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 24px)', md: '6' }} scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 132px)">
        <SectionHeading eyebrow="Kế hoạch hôm nay" title="Ba khối chính, ít nhiễu hơn" description="P-English ưu tiên 48 ngày lấy gốc, Shadowing và ôn từ vựng thay vì bày quá nhiều tính năng rời rạc." />
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          {primaryActions.map((item) => <ActionCard key={item.title} {...item} />)}
        </SimpleGrid>
      </Box>

      <GlassPanel className="home-dashboard-card" data-testid="home-content-depth-section" p={{ base: '4', md: '5' }} mb="6" overflow="hidden" display="none">
        <Flex justify="space-between" align={{ base: 'start', lg: 'center' }} direction={{ base: 'column', lg: 'row' }} gap="4" mb="4">
          <SectionHeading eyebrow="Data bài học" title="Độ sâu nội dung toàn lộ trình" description="Dashboard đọc trực tiếp lesson engine để phát hiện unit mỏng, skill còn thiếu và bước bổ sung dữ liệu tiếp theo." />
          <HStack gap="2" wrap="wrap">
            <Tag borderRadius="full" bg="#E8F4FF" color={OCEAN_TOKENS.deepBlue} fontWeight="950"><TagLabel>{contentDepthSnapshot.averageDepthScore}/100 trung bình</TagLabel></Tag>
            <Tag borderRadius="full" bg="#EAFBF0" color="#15803D" fontWeight="950"><TagLabel>{contentDepthSnapshot.deepUnitCount}/{contentDepthSnapshot.totalUnits} unit tốt</TagLabel></Tag>
            <Tag borderRadius="full" bg="#FFF7ED" color="#C2410C" fontWeight="950"><TagLabel>{contentDepthSnapshot.thinUnitCount} unit mỏng</TagLabel></Tag>
          </HStack>
        </Flex>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="3" mb="4">
          <DashboardSummaryPill label="Bài trong engine" value={contentDepthSnapshot.totalLessons} helper="Lesson route" tone="blue" />
          <DashboardSummaryPill label="Nguồn học" value={contentDepthSnapshot.totalSources} helper="Reading/grammar/shadowing/speech" tone="green" />
          <DashboardSummaryPill label="Skill cần bù" value={contentDepthSnapshot.mostMissingSkills[0] ? DATA_DEPTH_SKILL_LABELS[contentDepthSnapshot.mostMissingSkills[0].skill] : 'Ổn'} helper={contentDepthSnapshot.mostMissingSkills[0] ? `${contentDepthSnapshot.mostMissingSkills[0].count} unit thiếu` : 'Không có gap lớn'} tone={contentDepthSnapshot.mostMissingSkills[0] ? 'orange' : 'green'} />
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="3">
          {contentDepthSnapshot.weakestUnits.map((unit) => (
            <Box key={unit.unitId} border="1px solid" borderColor={unit.depthScore >= 46 ? OCEAN_TOKENS.border : '#FED7AA'} borderRadius="2xl" bg="rgba(248,252,255,0.78)" p="4" minW="0">
              <HStack justify="space-between" align="start" gap="3">
                <Box minW="0">
                  <Text fontWeight="950" color={OCEAN_TOKENS.text} noOfLines={1}>{unit.unitTitleVi}</Text>
                  <Text mt="1" color={OCEAN_TOKENS.muted} fontSize="sm" fontWeight="750">{unit.level} · {unit.lessonCount} bài · {unit.sourceCount} nguồn</Text>
                </Box>
                <Tag borderRadius="full" bg="white" color={unit.depthScore >= 46 ? OCEAN_TOKENS.deepBlue : '#C2410C'} fontWeight="950" flexShrink={0}>{unit.depthScore}/100</Tag>
              </HStack>
              <HStack mt="3" gap="1.5" wrap="wrap">
                {unit.missingSkills.slice(0, 3).map((skill) => (
                  <Tag key={skill} size="sm" borderRadius="full" bg="#FFF7ED" color="#C2410C" fontWeight="850">Thiếu {DATA_DEPTH_SKILL_LABELS[skill]}</Tag>
                ))}
                {unit.missingSkills.length === 0 ? <Tag size="sm" borderRadius="full" bg="#ECFDF5" color="#047857" fontWeight="850">Đủ skill chính</Tag> : null}
              </HStack>
              <Text mt="3" color={OCEAN_TOKENS.muted} fontSize="sm" fontWeight="750" lineHeight="1.55" noOfLines={2}>{unit.recommendedDataActionVi}</Text>
            </Box>
          ))}
        </SimpleGrid>
        <Text mt="4" color={OCEAN_TOKENS.deepBlue} fontWeight="900" fontSize="sm">Ưu tiên tiếp theo: {contentDepthSnapshot.nextDataActionVi}</Text>
      </GlassPanel>

      <GlassPanel className="home-dashboard-card" data-testid="home-skill-overview-section" p={{ base: '4', md: '5' }} mb="6" overflow="visible" display="none">
        <SectionHeading eyebrow="Kỹ năng đang phủ" title="Tổng quan năng lực" description="Một vùng duy nhất để xem dữ liệu kỹ năng thật từ lesson engine." />
        <SkillCoverageGrid coverage={skillCoverage} />
      </GlassPanel>

    </OceanPageShell>
  );
}
