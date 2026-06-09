import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
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
import { BookOpen, CheckCircle2, Compass, Flame, Lock, Play, Route, Target, Waves } from 'lucide-react';
import { CefrJourneyMap } from '../components/p-english/CefrJourneyMap';
import { cefrLearnerMilestoneByLevel } from '../data/learning/cefrLearnerMilestones';
import {
  getUnifiedDashboardSnapshot,
  getUnifiedLearningPath,
  getUnifiedLessonEntry,
} from '../lib/p-english/unifiedLessonEngine';
import type { UnifiedCefrLevel, UnifiedLearningUnit, UnifiedPracticeMode } from '../data/learning/generatedUnifiedLearningPath';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#D7E8F5',
  blue: '#2563EB',
  green: '#22C55E',
  amber: '#F59E0B',
  aqua: '#DDF5FF',
};

const LEVELS: UnifiedCefrLevel[] = ['A1', 'A2', 'B1', 'B2'];

const MODE_LABELS: Record<UnifiedPracticeMode, string> = {
  flashcard: 'Flashcard',
  quiz: 'Quiz',
  listen: 'Nghe',
  reflex: 'Phản xạ',
  type: 'Gõ câu',
  match: 'Ghép cặp',
  speed: 'Tốc độ',
  shadowing: 'Shadowing',
  pronunciation: 'Phát âm',
};

function getTone(index: number) {
  const tones = [
    { bg: '#EFF6FF', border: '#BFDBFE', color: COLORS.blue },
    { bg: '#F0FDF4', border: '#BBF7D0', color: COLORS.green },
    { bg: '#FFFBEB', border: '#FDE68A', color: COLORS.amber },
    { bg: '#F5F3FF', border: '#DDD6FE', color: '#7C3AED' },
  ];
  return tones[index % tones.length];
}

type UnitCardItem = {
  unit: UnifiedLearningUnit;
  index: number;
  tone: ReturnType<typeof getTone>;
};

export function LearningPathPage() {
  const dashboard = useMemo(() => getUnifiedDashboardSnapshot(), []);
  const units = useMemo<UnitCardItem[]>(
    () => getUnifiedLearningPath().map((unit, index) => ({ unit, index, tone: getTone(index) })),
    [],
  );
  const unitsByLevel = useMemo(
    () => LEVELS.map((level) => ({ level, units: units.filter((item) => item.unit.level === level) })),
    [units],
  );

  return (
    <OceanPageShell variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '4', md: '5' }} pb={{ base: '28', lg: '8' }}>
      <Box maxW="1180px" mx="auto">
        <HStack py="4" gap="2" color={COLORS.muted} fontSize="sm" wrap="wrap">
          <Text>Trang chủ</Text>
          <Text>/</Text>
          <Text fontWeight="700" color={COLORS.text}>Lộ trình học</Text>
        </HStack>

        <Box
          bg="rgba(255,255,255,0.82)"
          border="1px solid"
          borderColor="#BAE6FD"
          borderRadius="3xl"
          p={{ base: '6', md: '6' }}
          mb="5"
          overflow="hidden"
          position="relative"
          boxShadow="0 18px 46px rgba(31, 111, 214, 0.09)"
          backdropFilter="blur(18px)"
        >
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 88% 18%, rgba(91,188,235,0.14), transparent 28%)" pointerEvents="none" />
          <Flex align={{ base: 'stretch', lg: 'center' }} justify="space-between" direction={{ base: 'column', lg: 'row' }} gap="5" position="relative">
          <VStack align="start" gap="4" position="relative">
            <HStack wrap="wrap" gap="2">
              <Tag borderRadius="full" bg="white" color={COLORS.blue} fontWeight="900">🐢 P-English Roadmap</Tag>
              <Tag borderRadius="full" bg="#ECFDF5" color="#047857" fontWeight="900">
                {dashboard.currentLevel} · {dashboard.currentLevelLabel}
              </Tag>
              <Tag borderRadius="full" bg="#FFFBEB" color="#92400E" fontWeight="900">
                {dashboard.completedUnits}/{dashboard.availableUnits || dashboard.totalUnits} unit
              </Tag>
            </HStack>
            <Box maxW="840px">
              <Text as="h1" fontSize={{ base: '3xl', md: '4xl', xl: '5xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.05">
                Lộ trình CEFR rõ bước tiếp theo
              </Text>
              <Text mt="3" color={COLORS.muted} fontSize={{ base: 'md', md: 'md', xl: 'lg' }} fontWeight="700" lineHeight="1.65">
                Bốn vùng A1 → B2 được gom thành các làn học dễ quét. Mỗi unit chỉ giữ điều quan trọng: level, kỹ năng chính, bước tiếp theo và một lời nhắc ngắn từ Poo.
              </Text>
            </Box>
            <HStack gap="3" wrap="wrap">
              <Button as={Link} to={dashboard.nextLessonPath} colorScheme="blue" size={{ base: 'lg', md: 'md' }} leftIcon={<Icon as={Play} />} borderRadius="full">
                Học bài gợi ý
              </Button>
              <Button as={Link} to="/home" variant="outline" size={{ base: 'lg', md: 'md' }} leftIcon={<Icon as={Compass} />} borderRadius="full" borderColor="#93C5FD" color={COLORS.blue}>
                Về dashboard
              </Button>
            </HStack>
          </VStack>
          <Box display={{ base: 'none', md: 'block' }} pointerEvents="none">
            <OceanMascot mascot="ruaRi" pose="map" size="hero" decorative motion="float" />
          </Box>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="3" mb="6">
          <Metric icon={Target} label="Mức hiện tại" value={`${dashboard.currentLevel} · ${dashboard.currentLevelLabel}`} tone="#EFF6FF" />
          <Metric icon={CheckCircle2} label="Unit hoàn thành" value={`${dashboard.completedUnits}/${dashboard.availableUnits || dashboard.totalUnits}`} tone="#F0FDF4" />
          <Metric icon={BookOpen} label="Bài gợi ý tiếp theo" value={dashboard.nextLessonTitle} tone="#F5F3FF" />
          <Metric icon={Flame} label="Chuỗi học" value={`${dashboard.currentStreak} ngày`} tone="#FFFBEB" />
        </SimpleGrid>

        <Box mb="6">
          <CefrJourneyMap currentLevel={dashboard.currentLevel} pathPercentage={dashboard.pathPercentage} />
        </Box>

        <VStack align="stretch" gap="6">
          {unitsByLevel.map(({ level, units: levelUnits }) => {
            const milestone = cefrLearnerMilestoneByLevel[level];

            return (
              <Box key={level}>
                <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="3" mb="4">
                  <Box>
                    <HStack gap="2" mb="1" wrap="wrap">
                      <Icon as={Waves} color={COLORS.blue} />
                      <Text as="h2" fontSize="2xl" fontWeight="950" color={COLORS.text}>Vùng {level}</Text>
                      <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="900">{milestone.label}</Tag>
                    </HStack>
                    <Text color={COLORS.muted} fontWeight="700" lineHeight="1.65">
                      {levelUnits.length} unit · {milestone.shortNoteVi}
                    </Text>
                    <Text mt="1" color={COLORS.blue} fontSize="sm" fontWeight="800" lineHeight="1.6">
                      {milestone.transitionVi}
                    </Text>
                    <HStack mt="2" gap="2" wrap="wrap">
                      {milestone.skillExpectationsVi.slice(0, 3).map((expectation) => (
                        <Tag key={expectation} size="sm" borderRadius="full" bg="white" color={COLORS.muted} border="1px solid" borderColor={COLORS.border} fontWeight="800">
                          {expectation}
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                  <Tag borderRadius="full" bg={level === dashboard.currentLevel ? COLORS.aqua : 'white'} color={level === dashboard.currentLevel ? COLORS.blue : COLORS.muted} border="1px solid" borderColor={COLORS.border} fontWeight="950">
                    {level === dashboard.currentLevel ? 'Đang học' : `${levelUnits.length} unit`}
                  </Tag>
                </Flex>
                <VStack align="stretch" gap="3">
                  {levelUnits.map((item) => (
                    <UnitCard key={item.unit.id} item={item} />
                  ))}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </OceanPageShell>
  );
}

function Metric({ icon, label, value, tone }: { icon: any; label: string; value: string | number; tone: string }) {
  return (
    <HStack bg="rgba(255,255,255,0.86)" backdropFilter="blur(14px)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="4" gap="3" align="start" boxShadow="0 12px 30px rgba(31,111,214,0.08)">
      <Flex w="40px" h="40px" borderRadius="xl" bg={tone} align="center" justify="center" flexShrink={0}>
        <Icon as={icon} color={COLORS.blue} boxSize="5" />
      </Flex>
      <Box minW="0">
        <Text color={COLORS.muted} fontSize="sm" fontWeight="700">{label}</Text>
        <Text color={COLORS.text} fontSize={{ base: 'xl', md: 'xl' }} fontWeight="900" noOfLines={2}>{value}</Text>
      </Box>
    </HStack>
  );
}

function UnitCard({ item }: { item: UnitCardItem }) {
  const { unit, tone, index } = item;
  const entry = getUnifiedLessonEntry(unit.id);
  const available = Boolean(entry);
  const href = entry?.primaryRoute ?? unit.sourceModuleReference.runtimeRoute ?? '/learning-path';
  const practiceHref = entry?.practiceRoute ?? href;
  const modeBadges = entry?.availablePracticeModes.length ? entry.availablePracticeModes : unit.recommendedPracticeModes;

  return (
    <Box
      bg={available ? 'rgba(255,255,255,0.88)' : 'rgba(248,250,252,0.78)'}
      border="1px solid"
      borderColor={available ? tone.border : COLORS.border}
      borderRadius="2xl"
      p="4"
      opacity={available ? 1 : 0.72}
      position="relative"
      overflow="hidden"
      boxShadow="0 10px 26px rgba(31,111,214,0.06)"
      backdropFilter="blur(14px)"
    >
      <Flex align={{ base: 'start', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap="3">
        <HStack align="start" gap="3" flex="1" minW="0">
          <Flex w="42px" h="42px" borderRadius="2xl" bg={available ? tone.bg : '#E2E8F0'} align="center" justify="center" flexShrink={0}>
            <Icon as={available ? Route : Lock} color={available ? tone.color : '#64748B'} boxSize="5" />
          </Flex>
          <Box minW="0">
            <HStack wrap="wrap" gap="2" mb="1">
              <Badge colorScheme="blue" borderRadius="full">Unit {index + 1}</Badge>
              <Badge colorScheme="purple" borderRadius="full">{unit.level}</Badge>
              <Badge colorScheme="green" borderRadius="full">{unit.skillFocus}</Badge>
              <Tag size="sm" borderRadius="full" bg="#F8FAFC" color={COLORS.muted} fontWeight="800">{unit.estimatedTime}</Tag>
            </HStack>
            <Text fontSize={{ base: 'lg', md: 'lg' }} fontWeight="950" color={COLORS.text}>{unit.titleVi}</Text>
            <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="700" lineHeight="1.6" noOfLines={2}>{unit.subtitleVi}</Text>
            <HStack mt="3" align="start" gap="2">
              <OceanMascot mascot="ruaRi" pose="point" size="xs" decorative motion="pulse" />
              <Text color={COLORS.muted} fontSize="sm" fontWeight="700" lineHeight="1.55" noOfLines={2}>{unit.whaleCoachLine}</Text>
            </HStack>
          </Box>
        </HStack>

        <VStack align={{ base: 'stretch', md: 'end' }} gap="3" minW={{ base: '100%', md: '260px' }}>
          <Box w="100%" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3" bg="rgba(248,252,255,0.72)">
            <Text color={COLORS.muted} fontSize="xs" fontWeight="800">Bước tiếp theo</Text>
            <Text color={COLORS.text} fontWeight="900" fontSize="sm" noOfLines={2}>{unit.confidenceGoal}</Text>
            <HStack mt="2" wrap="wrap" gap="1.5">
              {modeBadges.slice(0, 3).map((mode) => (
                <Tag key={mode} size="sm" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="850">
                  {MODE_LABELS[mode] ?? mode}
                </Tag>
              ))}
            </HStack>
          </Box>
          {available && href ? (
            <Button as={Link} to={href} colorScheme="blue" rightIcon={<Icon as={Play} />} aria-label={`Vào bài học ${unit.titleVi}`} alignSelf={{ base: 'stretch', md: 'end' }}>
              Vào bài học
            </Button>
          ) : (
            <Button isDisabled leftIcon={<Icon as={Lock} />} alignSelf={{ base: 'stretch', md: 'end' }}>
              Chưa mở
            </Button>
          )}
        </VStack>
      </Flex>
    </Box>
  );
}

