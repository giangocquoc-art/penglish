import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
import { ArrowRight, CheckCircle2, Circle, Flame, LockKeyhole, Map, Play, Sparkles, Waves } from 'lucide-react';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48Progress, getFoundation48ProgressSummary } from '../features/foundation48/foundation48Progress';
import { foundation48Days, foundation48Stages, getFoundation48DayPath } from '../features/foundation48/foundation48Data';
import type { Foundation48Day, Foundation48ProgressDay } from '../features/foundation48/foundation48Types';

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
  const progress = useMemo(() => getFoundation48Progress(), [progressVersion]);
  const summary = useMemo(() => getFoundation48ProgressSummary(foundation48Days.length), [progressVersion]);
  const currentDayNumber = useMemo(() => getCurrentDayNumber(progress.days), [progress.days]);
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

    return () => {
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('storage', refreshProgress);
      window.removeEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refreshProgress);
    };
  }, []);

  return (
    <OceanPageShell data-testid="foundation48-learning-path-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5', xl: '6' }} pt={{ base: '2', md: '0' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 156px)', lg: '8' }} overflowX="hidden">
      <Box maxW="1180px" mx="auto" minW="0">
        <RoadmapHero completed={summary.completed} total={summary.totalDays} streak={summary.streak} currentDay={currentDay} percent={summary.percent} />

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: '2.5', md: '3' }} mb={{ base: '3', md: '4' }} data-testid="foundation48-path-summary">
          <SummaryCard icon={CheckCircle2} label="Ngày đã xong" value={`${summary.completed}/${summary.totalDays}`} tone="green" />
          <SummaryCard icon={Flame} label="Chuỗi ngày" value={`${summary.streak || 0} ngày`} tone="amber" />
          <SummaryCard icon={Sparkles} label="Ngày hiện tại" value={`Ngày ${currentDay.dayNumber}`} tone="blue" />
        </SimpleGrid>

        <StageRail currentDayNumber={currentDayNumber} />

        <Box display={{ base: 'block', md: 'none' }} data-testid="foundation48-roadmap-mobile-accordion">
          <Accordion allowMultiple defaultIndex={[foundation48Stages.findIndex((stage) => stage.days.includes(currentDayNumber as never))].filter((index) => index >= 0)}>
            {foundation48Stages.map((stage) => {
              const stageDays = roadmapDays.filter((item) => stage.days.includes(item.day.dayNumber as never));
              const stageCompleted = stageDays.filter((item) => item.status === 'completed').length;
              const hasCurrentDay = stage.days.includes(currentDayNumber as never);
              return (
                <AccordionItem key={stage.id} border="0" mb="3" data-testid={`foundation48-stage-accordion-${stage.id}`}>
                  <Box className="penglish-glass-card" border="1px solid" borderColor={hasCurrentDay ? '#7DD3FC' : 'rgba(186,230,253,0.82)'} bg={hasCurrentDay ? 'rgba(239,246,255,0.78)' : 'rgba(255,255,255,0.66)'} borderRadius="3xl" overflow="hidden" data-testid={`foundation48-stage-${stage.id}`}>
                    <AccordionButton px="3" py="3.5" _hover={{ bg: 'rgba(239,246,255,0.72)' }} data-testid={`foundation48-stage-accordion-button-${stage.id}`}>
                      <Flex w="100%" justify="space-between" align="center" gap="3">
                        <HStack gap="3" align="center" minW="0">
                          <Flex w="42px" h="42px" borderRadius="2xl" bg="linear-gradient(135deg, #EFF6FF, #DDF5FF)" color={COLORS.blue} align="center" justify="center" flexShrink={0}>
                            <Icon as={Waves} boxSize="5" />
                          </Flex>
                          <Box minW="0" textAlign="left">
                            <Text color={COLORS.blue} fontSize="xs" fontWeight="950" letterSpacing="0.12em" textTransform="uppercase">{getStageLevel(stage.id).level} · {getStageLevel(stage.id).skill}</Text>
                            <Text color={COLORS.text} fontWeight="950" lineHeight="1.2" noOfLines={2}>{stage.title}</Text>
                            <Text color={COLORS.muted} fontWeight="800" fontSize="xs">Ngày {stage.days[0]}–{stage.days[stage.days.length - 1]} · {getStageLevel(stage.id).next}</Text>
                          </Box>
                        </HStack>
                        <HStack gap="2" flexShrink={0}>
                          <Tag borderRadius="full" bg={stageCompleted === stageDays.length ? COLORS.greenSoft : '#EFF6FF'} color={stageCompleted === stageDays.length ? COLORS.green : COLORS.blue} fontWeight="950">
                            {stageCompleted}/{stageDays.length}
                          </Tag>
                          <AccordionIcon color={COLORS.blue} />
                        </HStack>
                      </Flex>
                    </AccordionButton>
                    <AccordionPanel px="3" pt="0" pb="3.5" data-testid={`foundation48-stage-accordion-panel-${stage.id}`}>
                      <VStack align="stretch" gap="2.5">
                        {stageDays.map((item) => <DayRoadmapCard key={item.day.dayNumber} item={item} />)}
                      </VStack>
                    </AccordionPanel>
                  </Box>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Box>

        <VStack align="stretch" gap={{ base: '3', md: '4' }} display={{ base: 'none', md: 'flex' }} data-testid="foundation48-roadmap-grid">
          {foundation48Stages.map((stage) => {
            const stageDays = roadmapDays.filter((item) => stage.days.includes(item.day.dayNumber as never));
            const stageCompleted = stageDays.filter((item) => item.status === 'completed').length;
            return (
              <Box key={stage.id} className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.82)" bg="rgba(255,255,255,0.66)" borderRadius="3xl" p={{ base: '3', md: '4' }} data-testid={`foundation48-stage-${stage.id}`}>
                <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="3" mb="3" direction={{ base: 'column', sm: 'row' }}>
                  <HStack gap="3" align="center" minW="0">
                    <Flex w="42px" h="42px" borderRadius="2xl" bg="linear-gradient(135deg, #EFF6FF, #DDF5FF)" color={COLORS.blue} align="center" justify="center" flexShrink={0}>
                      <Icon as={Waves} boxSize="5" />
                    </Flex>
                    <Box minW="0">
                      <Text color={COLORS.blue} fontSize="xs" fontWeight="950" letterSpacing="0.12em" textTransform="uppercase">{getStageLevel(stage.id).level} · {getStageLevel(stage.id).skill}</Text>
                      <Text color={COLORS.text} fontWeight="950" lineHeight="1.2">{stage.title}</Text>
                      <Text color={COLORS.muted} fontWeight="800" fontSize="xs">Gợi ý tiếp theo: {getStageLevel(stage.id).next}</Text>
                    </Box>
                  </HStack>
                  <Tag borderRadius="full" bg={stageCompleted === stageDays.length ? COLORS.greenSoft : '#EFF6FF'} color={stageCompleted === stageDays.length ? COLORS.green : COLORS.blue} fontWeight="950">
                    {stageCompleted}/{stageDays.length} ngày
                  </Tag>
                </Flex>
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={{ base: '2.5', md: '3' }}>
                  {stageDays.map((item) => <DayRoadmapCard key={item.day.dayNumber} item={item} />)}
                </SimpleGrid>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </OceanPageShell>
  );
}

function RoadmapHero({ completed, total, streak, currentDay, percent }: { completed: number; total: number; streak: number; currentDay: Foundation48Day; percent: number }) {
  return (
    <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#7DD3FC" borderRadius="3xl" p={{ base: '4', md: '6' }} mb={{ base: '3', md: '4' }} overflow="hidden" position="relative" boxShadow="0 24px 64px rgba(31,111,214,0.13)" backdropFilter="blur(14px) saturate(1.1)" data-testid="foundation48-roadmap-hero">
      <Box position="absolute" inset="0" bg="radial-gradient(circle at 88% 12%, rgba(91,188,235,0.18), transparent 28%), radial-gradient(circle at 8% 100%, rgba(34,197,94,0.12), transparent 28%)" pointerEvents="none" />
      <Flex position="relative" align={{ base: 'stretch', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={{ base: '4', md: '6' }}>
        <VStack align="start" gap={{ base: '3', md: '4' }} flex="1" minW="0">
          <HStack wrap="wrap" gap="2">
            <Tag borderRadius="full" bg="#ECFDF5" color={COLORS.green} fontWeight="950">Foundation48</Tag>
            <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="950">{completed}/{total} ngày</Tag>
            <Tag borderRadius="full" bg="#FFF7ED" color="#B45309" fontWeight="950">🔥 {streak || 0} ngày liên tiếp</Tag>
          </HStack>
          <Box minW="0">
            <Text color={COLORS.blue} fontSize="xs" fontWeight="950" letterSpacing="0.12em" textTransform="uppercase">Lộ trình lấy gốc tiếng Anh</Text>
            <Text as="h1" mt="1" color={COLORS.text} fontWeight="950" lineHeight="1.05" fontSize={{ base: '2xl', md: '4xl' }} data-testid="foundation48-roadmap-title">
              48 ngày đi từ nền tảng đến tự tin nói câu ngắn
            </Text>
            <Text mt="2" color={COLORS.muted} fontSize={{ base: 'sm', md: 'md' }} fontWeight="750" lineHeight="1.6" maxW="680px">
              Mỗi ô là một ngày học nhỏ: nghe trước, hiểu mẫu câu, luyện nói, thử sức nhẹ rồi lưu tiến độ. Poo chỉ mở bài tiếp theo vừa đủ để bạn không bị ngợp.
            </Text>
          </Box>
          <Flex gap="2.5" wrap="wrap" w="100%" direction={{ base: 'column', sm: 'row' }}>
            <Button as={Link} to={getFoundation48DayPath(currentDay.dayNumber)} bg={COLORS.blue} color="white" leftIcon={<Icon as={Play} />} rightIcon={<Icon as={ArrowRight} />} borderRadius="full" _hover={{ bg: COLORS.deepBlue }} data-testid="foundation48-roadmap-current-cta">
              Học ngày {currentDay.dayNumber}
            </Button>
            <Box flex="1" minW={{ base: '100%', sm: '220px' }} alignSelf="center">
              <Text color={COLORS.muted} fontWeight="900" fontSize="xs" mb="1">Tiến độ toàn lộ trình · {percent}%</Text>
              <Box h="9px" borderRadius="full" bg="#E2E8F0" overflow="hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ Foundation48 ${percent}%`}>
                <Box h="100%" w={`${Math.max(3, percent)}%`} bg="linear-gradient(90deg, #2F9EEB, #22C55E)" />
              </Box>
            </Box>
          </Flex>
        </VStack>
        <Box alignSelf={{ base: 'center', md: 'auto' }} pointerEvents="none">
          <OceanMascot mascot="poo" pose="coach" size="hero" decorative motion="float" />
        </Box>
      </Flex>
    </Box>
  );
}

function SummaryCard({ icon, label, value, tone }: { icon: typeof CheckCircle2; label: string; value: string; tone: 'green' | 'amber' | 'blue' }) {
  const palette = tone === 'green'
    ? { bg: '#ECFDF5', color: COLORS.green, border: '#BBF7D0' }
    : tone === 'amber'
      ? { bg: '#FFF7ED', color: '#B45309', border: '#FED7AA' }
      : { bg: '#EFF6FF', color: COLORS.blue, border: '#BAE6FD' };

  return (
    <HStack className="penglish-glass-card" gap="3" border="1px solid" borderColor={palette.border} bg="rgba(255,255,255,0.70)" borderRadius="3xl" p={{ base: '3', md: '4' }} minW="0">
      <Flex w="42px" h="42px" borderRadius="2xl" bg={palette.bg} color={palette.color} align="center" justify="center" flexShrink={0}>
        <Icon as={icon} boxSize="5" />
      </Flex>
      <Box minW="0">
        <Text color={COLORS.muted} fontSize="xs" fontWeight="950" textTransform="uppercase" letterSpacing="0.08em">{label}</Text>
        <Text color={COLORS.text} fontSize={{ base: 'lg', md: 'xl' }} fontWeight="950" lineHeight="1.1">{value}</Text>
      </Box>
    </HStack>
  );
}

function StageRail({ currentDayNumber }: { currentDayNumber: number }) {
  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.72)" bg="rgba(255,255,255,0.58)" borderRadius="3xl" p={{ base: '3', md: '4' }} mb={{ base: '3', md: '4' }} data-testid="foundation48-stage-rail">
      <HStack justify="space-between" align="center" gap="3" mb="3">
        <Box minW="0">
          <Text color={COLORS.text} fontWeight="950">Bản đồ A0 → A1 → A2 → B1</Text>
          <Text color={COLORS.muted} fontWeight="750" fontSize="sm">Mỗi chặng có trạng thái, kỹ năng chính và bước Poo khuyên học tiếp.</Text>
        </Box>
        <Icon as={Map} color={COLORS.blue} boxSize="5" />
      </HStack>
      <Flex gap="2.5" overflowX="auto" pb="1" sx={{ scrollbarWidth: 'thin' }}>
        {foundation48Stages.map((stage) => {
          const active = stage.days.includes(currentDayNumber as never);
          const passed = stage.days[stage.days.length - 1] < currentDayNumber;
          return (
            <Box key={stage.id} minW={{ base: '156px', md: '0' }} flex={{ base: '0 0 auto', md: 1 }} border="1px solid" borderColor={active ? '#7DD3FC' : passed ? '#BBF7D0' : COLORS.border} bg={active ? '#EFF6FF' : passed ? COLORS.greenSoft : 'rgba(255,255,255,0.72)'} borderRadius="2xl" p="3">
              <Text color={active ? COLORS.blue : passed ? COLORS.green : COLORS.muted} fontWeight="950" fontSize="xs">{getStageLevel(stage.id).level}</Text>
              <Text color={COLORS.text} fontWeight="900" fontSize="sm" noOfLines={2}>{getStageLevel(stage.id).skill}</Text>
              <Text color={COLORS.muted} fontWeight="800" fontSize="xs">Ngày {stage.days[0]}–{stage.days[stage.days.length - 1]}</Text>
            </Box>
          );
        })}
      </Flex>
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
          <Text mt="1.5" color={COLORS.muted} fontWeight="750" fontSize="xs" lineHeight="1.45" noOfLines={2}>{day.summary.summary}</Text>
          <Text mt="2" color={COLORS.blue} fontWeight="950" fontSize="2xs">Gợi ý: {status === 'current' ? 'Học nút này hôm nay' : status === 'completed' ? 'Ôn lại nếu Poo còn nhắc' : status === 'locked' ? 'Hoàn thành ngày trước để mở' : 'Có thể học khi bạn sẵn sàng'} · 12 phút</Text>
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
