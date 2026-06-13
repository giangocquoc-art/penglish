import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ArrowRight, CheckCircle2, Circle, LockKeyhole, Play, Sparkles } from 'lucide-react';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48Progress, getFoundation48ProgressSummary } from '../features/foundation48/foundation48Progress';
import { foundation48Days, getFoundation48DayPath } from '../features/foundation48/foundation48Data';
import type { Foundation48Day, Foundation48ProgressDay } from '../features/foundation48/foundation48Types';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, getUnifiedBubbles, getWaterStreak, type UnifiedBubbleStreak, type UnifiedWaterStreak } from '../lib/p-english/daily-rewards';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  border: '#D7E8F5',
  blue: '#2563EB',
  deepBlue: '#1D4ED8',
  green: '#16A34A',
  greenSoft: '#ECFDF5',
  amber: '#F59E0B',
  aqua: '#DDF5FF',
  locked: '#94A3B8',
};

type DayStatus = 'completed' | 'current' | 'available' | 'locked';

type RoadmapDay = {
  day: Foundation48Day;
  progress?: Foundation48ProgressDay;
  status: DayStatus;
  stepCount: number;
};

function getCurrentDayNumber(days: Record<number, Foundation48ProgressDay>) {
  const firstIncomplete = foundation48Days.find((day) => !days[day.dayNumber]?.completed)?.dayNumber;
  return firstIncomplete ?? foundation48Days.length;
}

function getShortTopic(day: Foundation48Day) {
  const title = day.title.replace(/^Ngày\s+\d+:\s*/i, '').trim();
  return title.length > 82 ? `${title.slice(0, 79).trim()}…` : title;
}

function getStatusLabel(status: DayStatus) {
  if (status === 'completed') return 'Hoàn thành';
  if (status === 'current') return 'Đang học';
  if (status === 'available') return 'Có thể học';
  return 'Chưa mở';
}

const STAGE_LEVELS: Record<number, { level: string; skill: string; next: string }> = {
  1: { level: 'A0', skill: 'Nền tảng câu', next: 'Bắt đầu với câu giới thiệu thật ngắn.' },
  2: { level: 'A0 → A1', skill: 'Động từ thường', next: 'Tập nói câu thói quen mỗi ngày.' },
  3: { level: 'A1', skill: 'Từ loại & thì căn bản', next: 'Củng cố mẫu câu trước khi tăng tốc.' },
  4: { level: 'A1', skill: 'Phát âm & câu hỏi', next: 'Nghe mẫu rồi nói lại chậm.' },
  5: { level: 'A1 → A2', skill: 'Nối ý & điều kiện', next: 'Tập ghép câu dài hơn một chút.' },
  6: { level: 'A2', skill: 'Nghe nền tảng', next: 'Nghe ý chính trước, không cần hiểu hết.' },
  7: { level: 'A2 → B1', skill: 'Giao tiếp thực tế', next: 'Ôn câu Poo nhắc và dùng mẫu câu thật.' },
  8: { level: 'B1', skill: 'Đầu ra cuối khóa', next: 'Tự nói đoạn ngắn và ôn lại hằng tuần.' },
};

function getStageLevel(stageId: number) {
  return STAGE_LEVELS[stageId] ?? { level: 'A1', skill: 'Kỹ năng tổng hợp', next: 'Học tiếp nút được Poo gợi ý.' };
}

function getDaySkillLabel(day: Foundation48Day) {
  const text = `${day.title} ${day.summary.summary}`.toLowerCase();
  if (text.includes('nghe') || text.includes('listening')) return 'Nghe';
  if (text.includes('nói') || text.includes('speak') || text.includes('phát âm')) return 'Nói';
  if (text.includes('từ') || text.includes('vocabulary')) return 'Từ vựng';
  if (text.includes('câu hỏi') || text.includes('grammar') || text.includes('thì')) return 'Ngữ pháp';
  return 'Mẫu câu';
}

export function LearningPathPage() {
  const [progressVersion, setProgressVersion] = useState(0);
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);
  const progress = useMemo(() => getFoundation48Progress(), [progressVersion]);
  const summary = useMemo(() => getFoundation48ProgressSummary(foundation48Days.length), [progressVersion]);
  const currentDayNumber = useMemo(() => getCurrentDayNumber(progress.days), [progress.days]);
  const bubbles = useMemo(() => getUnifiedBubbles(getDailyRewardState()), [progressVersion]);
  const waterStreak = useMemo(() => getWaterStreak(getDailyRewardState()), [progressVersion]);
  const availableThroughDay = Math.max(1, currentDayNumber, progress.lastDayOpened || 1);
  const currentDay = foundation48Days.find((day) => day.dayNumber === currentDayNumber) ?? foundation48Days[0];
  const roadmapDays = useMemo<RoadmapDay[]>(() => foundation48Days.map((day) => {
    const dayProgress = progress.days[day.dayNumber];
    const completed = Boolean(dayProgress?.completed);
    const status: DayStatus = completed
      ? 'completed'
      : day.dayNumber === currentDayNumber
        ? 'current'
        : day.dayNumber <= availableThroughDay
          ? 'available'
          : 'locked';

    return {
      day,
      progress: dayProgress,
      status,
      stepCount: dayProgress?.completedSteps?.length || 0,
    };
  }), [availableThroughDay, currentDayNumber, progress.days]);

  useEffect(() => {
    const refreshProgress = () => setProgressVersion((value) => value + 1);

    window.addEventListener('focus', refreshProgress);
    window.addEventListener('storage', refreshProgress);
    window.addEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshProgress);

    return () => {
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('storage', refreshProgress);
      window.removeEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshProgress);
    };
  }, []);

  const visibleRoadmapDays = showFullRoadmap ? roadmapDays : roadmapDays.filter((item) => Math.abs(item.day.dayNumber - currentDayNumber) <= 4 || item.status === 'completed').slice(0, Math.max(9, currentDayNumber + 4));

  return (
    <OceanPageShell data-testid="foundation48-learning-path-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5', xl: '6' }} pt={{ base: '2', md: '0' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 96px)', lg: '8' }} overflowX="hidden">
      <Box maxW="920px" mx="auto" minW="0">
        <RoadmapHero completed={summary.completed} total={summary.totalDays} waterStreak={waterStreak} currentDay={currentDay} percent={summary.percent} />

        <CompactStatusBar completed={summary.completed} total={summary.totalDays} waterStreak={waterStreak} bubbles={bubbles} currentDay={currentDay.dayNumber} />

        <VStack align="stretch" gap="0" data-testid="foundation48-roadmap-grid" className="foundation48-simple-path">
          {visibleRoadmapDays.map((item, index) => (
            <PathNode key={item.day.dayNumber} item={item} isLast={index === visibleRoadmapDays.length - 1} />
          ))}
        </VStack>

        <HStack justify="center" mt={{ base: '3', md: '4' }} gap="2" wrap="wrap">
          {currentDayNumber > 1 ? (
            <Button as={Link} to={getFoundation48DayPath(currentDayNumber - 1)} variant="outline" borderColor={COLORS.border} bg="rgba(255,255,255,0.72)" color={COLORS.blue} borderRadius="full" px="5" data-testid="foundation48-prev-day">
              Bài trước
            </Button>
          ) : null}
          {currentDayNumber < foundation48Days.length ? (
            <Button as={Link} to={getFoundation48DayPath(currentDayNumber + 1)} variant="ghost" color={COLORS.blue} borderRadius="full" px="5" data-testid="foundation48-next-day">
              Bài tiếp theo
            </Button>
          ) : null}
          {!showFullRoadmap ? (
            <Button variant="outline" borderColor={COLORS.border} bg="rgba(255,255,255,0.72)" color={COLORS.blue} borderRadius="full" px="5" onClick={() => setShowFullRoadmap(true)} data-testid="foundation48-show-full-roadmap">
              Xem thêm
            </Button>
          ) : null}
        </HStack>
      </Box>
    </OceanPageShell>
  );
}

function RoadmapHero({ completed, total, waterStreak, currentDay, percent }: { completed: number; total: number; waterStreak: UnifiedWaterStreak; currentDay: Foundation48Day; percent: number }) {
  const ctaLabel = completed === 0 && currentDay.dayNumber === 1 ? 'Bắt đầu ngày 1' : 'Tiếp tục học';

  return (
    <Box className="penglish-glass-card" bg="rgba(255,255,255,0.72)" border="1px solid" borderColor="rgba(125,211,252,0.72)" borderRadius="3xl" p={{ base: '4', md: '6' }} mb={{ base: '3', md: '4' }} overflow="hidden" position="relative" boxShadow="0 14px 34px rgba(31,111,214,0.08)" backdropFilter={{ base: 'none', md: 'blur(10px) saturate(1.04)' }} data-testid="foundation48-roadmap-hero">
      <Box position="absolute" inset="0" bg="radial-gradient(circle at 90% 10%, rgba(91,188,235,0.14), transparent 24%)" pointerEvents="none" />
      <Flex position="relative" align={{ base: 'stretch', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={{ base: '4', md: '6' }}>
        <VStack align="start" gap={{ base: '3', md: '4' }} flex="1" minW="0">
          <Box minW="0">
            <Text as="h1" color={COLORS.text} fontWeight="950" lineHeight="1.05" fontSize={{ base: '2xl', md: '4xl' }} data-testid="foundation48-roadmap-title">
              Lộ trình học
            </Text>
            <Text mt="2" color={COLORS.muted} fontSize={{ base: 'sm', md: 'md' }} fontWeight="850" noOfLines={1}>
              Học tiếp nhé
            </Text>
          </Box>
          <Flex gap="3" wrap="wrap" w="100%" direction={{ base: 'column', sm: 'row' }} align={{ base: 'stretch', sm: 'center' }}>
            <Button as={Link} to={getFoundation48DayPath(currentDay.dayNumber)} bg={COLORS.blue} color="white" leftIcon={<Icon as={Play} />} rightIcon={<Icon as={ArrowRight} />} borderRadius="full" minH="52px" px="7" fontSize="md" _hover={{ bg: COLORS.deepBlue }} data-testid="foundation48-roadmap-current-cta">
              {ctaLabel}
            </Button>
            <Box flex="1" minW={{ base: '100%', sm: '220px' }} alignSelf="center">
              <Text color={COLORS.muted} fontWeight="900" fontSize="xs" mb="1">{completed}/{total} ngày · {percent}%</Text>
              <Box h="8px" borderRadius="full" bg="#E2E8F0" overflow="hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ Foundation48 ${percent}%`}>
                <Box h="100%" w={`${Math.max(3, percent)}%`} bg="linear-gradient(90deg, #2F9EEB, #22C55E)" />
              </Box>
            </Box>
          </Flex>
        </VStack>
        <Box display={{ base: 'none', md: 'block' }} alignSelf={{ base: 'center', md: 'auto' }} pointerEvents="none">
          <OceanMascot mascot="poo" pose="coach" size="md" decorative motion="float" />
        </Box>
      </Flex>
    </Box>
  );
}

function CompactStatusBar({ completed, total, waterStreak, bubbles, currentDay }: { completed: number; total: number; waterStreak: UnifiedWaterStreak; bubbles: UnifiedBubbleStreak; currentDay: number }) {
  const items = [`${completed}/${total} ngày`, waterStreak.label, bubbles.label, `Ngày ${currentDay}`];

  return (
    <Flex className="penglish-glass-card" data-testid="foundation48-path-summary" mb={{ base: '3', md: '4' }} px={{ base: '3', md: '4' }} py="2.5" border="1px solid" borderColor="rgba(186,230,253,0.78)" bg="rgba(255,255,255,0.62)" borderRadius="2xl" gap={{ base: '2', md: '3' }} wrap="wrap" align="center" justify={{ base: 'flex-start', md: 'center' }}>
      {items.map((item) => (
        <Text key={item} color={COLORS.muted} fontSize="sm" fontWeight="850" lineHeight="1.2">
          {item}
        </Text>
      ))}
    </Flex>
  );
}

function PathNode({ item, isLast }: { item: RoadmapDay; isLast: boolean }) {
  const { day, status } = item;
  const clickable = status !== 'locked';
  const tone = status === 'completed'
    ? { border: '#BBF7D0', bg: 'rgba(240,253,244,0.86)', dot: COLORS.green, icon: CheckCircle2, color: COLORS.green }
    : status === 'current'
      ? { border: '#7DD3FC', bg: 'rgba(239,246,255,0.92)', dot: COLORS.blue, icon: Sparkles, color: COLORS.blue }
      : status === 'available'
        ? { border: '#BAE6FD', bg: 'rgba(255,255,255,0.80)', dot: COLORS.blue, icon: Circle, color: COLORS.blue }
        : { border: '#E2E8F0', bg: 'rgba(248,250,252,0.62)', dot: COLORS.locked, icon: LockKeyhole, color: COLORS.locked };

  const content = (
    <HStack align="stretch" gap="3" data-testid={`foundation48-path-node-${day.dayNumber}`}>
      <VStack gap="0" flexShrink={0} pt="1">
        <Flex w={{ base: '38px', md: '42px' }} h={{ base: '38px', md: '42px' }} borderRadius="full" align="center" justify="center" bg={tone.dot} color="white" fontWeight="950" boxShadow={status === 'current' ? '0 10px 24px rgba(37,99,235,0.18)' : 'none'}>
          {status === 'locked' ? <Icon as={LockKeyhole} boxSize="4" /> : day.dayNumber}
        </Flex>
        {!isLast ? <Box w="2px" flex="1" minH="18px" bg={status === 'completed' ? '#86EFAC' : '#BAE6FD'} /> : null}
      </VStack>
      <Box flex="1" minW="0" border="1px solid" borderColor={tone.border} bg={tone.bg} borderRadius="2xl" p={{ base: '3', md: '3.5' }} mb={isLast ? '0' : '2.5'}>
        <Flex justify="space-between" align="center" gap="3">
          <Box minW="0">
            <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.2" noOfLines={1}>Bài {day.dayNumber}: {getShortTopic(day)}</Text>
            <Text mt="1" color={COLORS.muted} fontWeight="850" fontSize="xs" noOfLines={1}>{getDaySkillLabel(day)}</Text>
          </Box>
          <Tag flexShrink={0} borderRadius="full" bg="rgba(255,255,255,0.78)" color={tone.color} fontWeight="950" fontSize="2xs" px="2">
            {getStatusLabel(status)}
          </Tag>
        </Flex>
      </Box>
    </HStack>
  );

  if (!clickable) {
    return <Box aria-disabled="true">{content}</Box>;
  }

  return (
    <Box as={Link} to={getFoundation48DayPath(day.dayNumber)} display="block" _hover={{ textDecoration: 'none' }} aria-label={`Mở bài ${day.dayNumber}: ${getShortTopic(day)}`}>
      {content}
    </Box>
  );
}

function DayRoadmapCard({ item }: { item: RoadmapDay }) {
  const { day, status, stepCount } = item;
  const clickable = status !== 'locked';
  const href = getFoundation48DayPath(day.dayNumber);
  const tone = status === 'completed'
    ? { border: '#86EFAC', bg: 'linear-gradient(135deg, rgba(236,253,245,0.94), rgba(255,255,255,0.78))', iconBg: COLORS.green, icon: CheckCircle2, color: COLORS.green }
    : status === 'current'
      ? { border: '#7DD3FC', bg: 'linear-gradient(135deg, rgba(239,246,255,0.96), rgba(221,245,255,0.86))', iconBg: COLORS.blue, icon: Sparkles, color: COLORS.blue }
      : status === 'available'
        ? { border: '#BAE6FD', bg: 'rgba(255,255,255,0.80)', iconBg: '#EFF6FF', icon: Circle, color: COLORS.blue }
        : { border: '#E2E8F0', bg: 'rgba(248,250,252,0.58)', iconBg: '#F1F5F9', icon: LockKeyhole, color: COLORS.locked };

  const content = (
    <Box h="100%" border="1px solid" borderColor={tone.border} bg={tone.bg} borderRadius="3xl" p={{ base: '3.5', md: '3' }} boxShadow={status === 'current' ? '0 18px 42px rgba(37,99,235,0.14)' : status === 'completed' ? '0 14px 32px rgba(22,163,74,0.10)' : '0 10px 24px rgba(15,76,117,0.05)'} opacity={status === 'locked' ? 0.74 : 1} transition="transform .16s ease, box-shadow .16s ease, border-color .16s ease" _hover={clickable ? { transform: 'translateY(-2px)', boxShadow: '0 18px 40px rgba(31,111,214,0.14)' } : undefined} data-testid={`foundation48-day-card-${day.dayNumber}`}>
      <VStack align="stretch" gap="3" h="100%">
        <HStack justify="space-between" align="start" gap="3">
          <HStack gap="2.5" minW="0" align="center">
            <Flex w="38px" h="38px" borderRadius="2xl" bg={tone.iconBg} color={status === 'available' || status === 'locked' ? tone.color : 'white'} align="center" justify="center" flexShrink={0}>
              <Icon as={tone.icon} boxSize="5" />
            </Flex>
            <Box minW="0">
              <Text color={COLORS.text} fontWeight="950" lineHeight="1">Ngày {day.dayNumber}</Text>
              <Text color={COLORS.muted} fontSize="xs" fontWeight="850" noOfLines={1}>{getStageLevel(day.stageId).level} · {getDaySkillLabel(day)}</Text>
            </Box>
          </HStack>
          <Tag flexShrink={0} borderRadius="full" bg={status === 'locked' ? '#F1F5F9' : status === 'completed' ? COLORS.greenSoft : '#EFF6FF'} color={tone.color} fontWeight="950" fontSize="2xs" px="2">
            {getStatusLabel(status)}
          </Tag>
        </HStack>

        <Box minW="0" flex="1">
          <Text color={COLORS.text} fontWeight="950" lineHeight="1.32" fontSize={{ base: 'sm', md: 'sm' }} noOfLines={2}>{getShortTopic(day)}</Text>
        </Box>

        <HStack justify="space-between" gap="2" mt="auto">
          <HStack gap="1.5" color={tone.color}>
            <Icon as={status === 'locked' ? LockKeyhole : status === 'completed' ? CheckCircle2 : Play} boxSize="3.5" />
            <Text fontSize="xs" fontWeight="950">{status === 'locked' ? 'Mở sau' : stepCount > 0 && status !== 'completed' ? `${stepCount} bước` : status === 'completed' ? 'Đã lưu' : 'Bắt đầu'}</Text>
          </HStack>
          <Box display="flex" gap="1">
            {[0, 1, 2].map((index) => (
              <Box key={index} w="6px" h="6px" borderRadius="full" bg={status === 'completed' || (status !== 'locked' && stepCount > index) ? tone.color : '#CBD5E1'} opacity={status === 'locked' ? 0.55 : 1} />
            ))}
          </Box>
        </HStack>
      </VStack>
    </Box>
  );

  if (!clickable) {
    return (
      <Box aria-disabled="true" data-testid={`foundation48-day-card-locked-${day.dayNumber}`}>
        {content}
      </Box>
    );
  }

  return (
    <Box as={Link} to={href} display="block" minH="100%" _hover={{ textDecoration: 'none' }} aria-label={`Mở ngày ${day.dayNumber}: ${getShortTopic(day)}`} data-testid={`foundation48-day-link-${day.dayNumber}`}>
      {content}
    </Box>
  );
}
