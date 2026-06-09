import { useEffect, useMemo, useState } from 'react';
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
import { getCefrProgressSummary } from '../lib/p-english/cefr-progress';
import { LESSON_PROGRESS_UPDATED_EVENT } from '../lib/p-english/lesson-progress';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { VOCABULARY_REVIEW_UPDATED_EVENT } from '../lib/p-english/vocabulary-review';
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
  const [progressVersion, setProgressVersion] = useState(0);
  const dashboard = useMemo(() => getUnifiedDashboardSnapshot(), [progressVersion]);
  const cefrProgress = useMemo(() => getCefrProgressSummary(), [progressVersion]);
  const units = useMemo<UnitCardItem[]>(
    () => getUnifiedLearningPath().map((unit, index) => ({ unit, index, tone: getTone(index) })),
    [],
  );
  const unitsByLevel = useMemo(
    () => LEVELS.map((level) => ({ level, units: units.filter((item) => item.unit.level === level) })),
    [units],
  );
  const currentLevelLabel = dashboard.currentLevel === cefrProgress.currentLevel ? dashboard.currentLevelLabel : 'Nền tảng';
  const unitProgressText = `${cefrProgress.completedUnits}/${cefrProgress.totalUnits}`;
  const unitProgressHelper = cefrProgress.hasLessonProgress
    ? 'Dựa trên bài học đã hoàn thành trên thiết bị này.'
    : 'Hoàn thành bài học để mở tiến độ unit.';

  useEffect(() => {
    const refreshProgress = () => setProgressVersion((value) => value + 1);

    window.addEventListener('focus', refreshProgress);
    window.addEventListener('storage', refreshProgress);
    window.addEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(LESSON_PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener(VOCABULARY_REVIEW_UPDATED_EVENT, refreshProgress);

    return () => {
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('storage', refreshProgress);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(LESSON_PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener(VOCABULARY_REVIEW_UPDATED_EVENT, refreshProgress);
    };
  }, []);

  return (
    <OceanPageShell data-testid="roadmap-mobile-root" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pt={{ base: '2', md: '0' }} pb={{ base: 'var(--penglish-mobile-safe-bottom)', lg: '8' }}>
      <Box maxW="1180px" mx="auto" minW="0">
        <HStack py={{ base: '2', md: '4' }} gap="2" color={COLORS.muted} fontSize="sm" wrap="wrap" display={{ base: 'none', sm: 'flex' }}>
          <Text>Trang chủ</Text>
          <Text>/</Text>
          <Text fontWeight="700" color={COLORS.text}>Lộ trình học</Text>
        </HStack>

        <Box
          className="penglish-glass-card"
          bg="rgba(255,255,255,0.78)"
          border="1px solid"
          borderColor="#BAE6FD"
          borderRadius="3xl"
          p={{ base: '3', md: '6' }}
          mb={{ base: '3', md: '5' }}
          overflow="hidden"
          position="relative"
          boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)"
          backdropFilter="blur(14px) saturate(1.1)"
        >
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 88% 18%, rgba(91,188,235,0.14), transparent 28%)" pointerEvents="none" />
          <Flex align={{ base: 'stretch', lg: 'center' }} justify="space-between" direction={{ base: 'column', lg: 'row' }} gap={{ base: '3', md: '5' }} position="relative">
          <VStack align="start" gap={{ base: '2.5', md: '4' }} position="relative">
            <HStack wrap="wrap" gap="2">
              <Tag borderRadius="full" bg="white" color={COLORS.blue} fontWeight="900" display={{ base: 'none', sm: 'inline-flex' }}>🐢 P-English Roadmap</Tag>
              <Tag borderRadius="full" bg="#ECFDF5" color="#047857" fontWeight="900" data-testid="learning-path-current-level-chip">
                {cefrProgress.currentLevel} · {currentLevelLabel}
              </Tag>
              <Tag borderRadius="full" bg="#FFFBEB" color="#92400E" fontWeight="900" data-testid="learning-path-completed-units-chip">
                {unitProgressText} unit
              </Tag>
            </HStack>
            <Box maxW="840px">
              <Text as="h1" fontSize={{ base: 'xl', md: '4xl', xl: '5xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.05">
                Lộ trình CEFR rõ bước tiếp theo
              </Text>
              <Text mt={{ base: '2', md: '3' }} color={COLORS.muted} fontSize={{ base: 'sm', md: 'md', xl: 'lg' }} fontWeight="700" lineHeight="1.5" noOfLines={{ base: 3, md: undefined }}>
                Dữ liệu học được lưu trên thiết bị này. Tiến độ sẽ rõ hơn khi bạn hoàn thành bài học, ôn từ và luyện shadowing.
              </Text>
            </Box>
            <HStack gap="3" wrap="wrap">
              <Button as={Link} to={dashboard.nextLessonPath} colorScheme="blue" size={{ base: 'md', md: 'md' }} leftIcon={<Icon as={Play} />} borderRadius="full">
                Học bài gợi ý
              </Button>
              <Button as={Link} to="/home" variant="outline" size={{ base: 'md', md: 'md' }} leftIcon={<Icon as={Compass} />} borderRadius="full" borderColor="#93C5FD" color={COLORS.blue} display={{ base: 'none', sm: 'inline-flex' }}>
                Về dashboard
              </Button>
            </HStack>
          </VStack>
          <Box display={{ base: 'none', md: 'block' }} pointerEvents="none">
            <OceanMascot mascot="ruaRi" pose="map" size="hero" decorative motion="float" />
          </Box>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={{ base: '2.5', md: '3' }} mb={{ base: '3', md: '3' }}>
          <Metric icon={Target} label="Mức hiện tại" value={`${cefrProgress.currentLevel} · ${currentLevelLabel}`} tone="#EFF6FF" testId="learning-path-current-level" />
          <Metric icon={CheckCircle2} label="Unit hoàn thành" value={unitProgressText} tone="#F0FDF4" testId="learning-path-completed-units" />
          <Metric icon={BookOpen} label="Bài gợi ý tiếp theo" value={dashboard.nextLessonTitle} tone="#F5F3FF" hideOnMobile />
          <Metric icon={Flame} label="Chuỗi học" value={`${dashboard.currentStreak} ngày`} tone="#FFFBEB" hideOnMobile />
        </SimpleGrid>

        <Box data-testid="learning-path-local-progress-hints" className="penglish-glass-card" bg="rgba(255,255,255,0.72)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p={{ base: '3', md: '4' }} mb={{ base: '3', md: '6' }}>
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="3" direction={{ base: 'column', md: 'row' }} mb="3">
            <Box minW="0">
              <Text color={COLORS.text} fontWeight="950">Tiến độ local</Text>
              <Text color={COLORS.muted} fontSize="sm" fontWeight="750" lineHeight="1.5">{unitProgressHelper}</Text>
            </Box>
            <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="900">Lưu trên thiết bị</Tag>
          </Flex>
          <SimpleGrid columns={{ base: 3, md: 3 }} gap="2.5">
            <ProgressHint testId="learning-path-vocab-known-count" label="Từ đã nhớ" value={cefrProgress.vocabularyKnownCount} />
            <ProgressHint testId="learning-path-vocab-review-count" label="Từ cần ôn" value={cefrProgress.vocabularyReviewCount} />
            <ProgressHint testId="learning-path-shadowing-practiced-count" label="Câu shadowing đã luyện" value={cefrProgress.shadowingPracticedLines} />
          </SimpleGrid>
        </Box>

        <Box mb="6" display={{ base: 'none', md: 'block' }}>
          <CefrJourneyMap currentLevel={cefrProgress.currentLevel} pathPercentage={dashboard.pathPercentage} />
        </Box>

        <VStack align="stretch" gap={{ base: '4', md: '6' }}>
          {unitsByLevel.map(({ level, units: levelUnits }) => {
            const milestone = cefrLearnerMilestoneByLevel[level];

            return (
              <Box key={level}>
                <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={{ base: '2', md: '3' }} mb={{ base: '3', md: '4' }}>
                  <Box>
                    <HStack gap="2" mb="1" wrap="wrap">
                      <Icon as={Waves} color={COLORS.blue} />
                      <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>Vùng {level}</Text>
                      <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="900">{milestone.label}</Tag>
                    </HStack>
                    <Text color={COLORS.muted} fontWeight="700" lineHeight="1.55">
                      {levelUnits.length} unit · {milestone.shortNoteVi}
                    </Text>
                    <Box as="details" mt="1">
                      <Box as="summary" cursor="pointer" color={COLORS.blue} fontSize="sm" fontWeight="850">Xem chi tiết</Box>
                      <Text mt="1" color={COLORS.blue} fontSize="sm" fontWeight="750" lineHeight="1.5">{milestone.transitionVi}</Text>
                      <HStack mt="2" gap="2" wrap="wrap">
                        {milestone.skillExpectationsVi.slice(0, 2).map((expectation) => (
                          <Tag key={expectation} size="sm" borderRadius="full" bg="white" color={COLORS.muted} border="1px solid" borderColor={COLORS.border} fontWeight="800">
                            {expectation}
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                  </Box>
                  <Tag borderRadius="full" bg={level === cefrProgress.currentLevel ? COLORS.aqua : 'white'} color={level === cefrProgress.currentLevel ? COLORS.blue : COLORS.muted} border="1px solid" borderColor={COLORS.border} fontWeight="950">
                    {level === cefrProgress.currentLevel ? 'Đang học' : `${levelUnits.length} unit`}
                  </Tag>
                </Flex>
                <VStack align="stretch" gap={{ base: '2.5', md: '3' }}>
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

function Metric({ icon, label, value, tone, hideOnMobile = false, testId }: { icon: any; label: string; value: string | number; tone: string; hideOnMobile?: boolean; testId?: string }) {
  return (
    <HStack data-testid={testId} className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p={{ base: '2.5', md: '4' }} gap="3" align="start" boxShadow="0 12px 30px rgba(31,111,214,0.06)" display={{ base: hideOnMobile ? 'none' : 'flex', sm: 'flex' }}>
      <Flex w={{ base: '34px', md: '40px' }} h={{ base: '34px', md: '40px' }} borderRadius="xl" bg={tone} align="center" justify="center" flexShrink={0}>
        <Icon as={icon} color={COLORS.blue} boxSize="5" />
      </Flex>
      <Box minW="0">
        <Text color={COLORS.muted} fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700">{label}</Text>
        <Text color={COLORS.text} fontSize={{ base: 'sm', md: 'xl' }} fontWeight="900" noOfLines={{ base: 1, md: 2 }}>{value}</Text>
      </Box>
    </HStack>
  );
}

function ProgressHint({ label, value, testId }: { label: string; value: number; testId: string }) {
  return (
    <Box data-testid={testId} borderRadius="2xl" bg="#F8FAFC" border="1px solid" borderColor="rgba(186,230,253,0.9)" px={{ base: '2.5', md: '4' }} py="3" minW="0">
      <Text color={COLORS.muted} fontSize={{ base: '2xs', md: 'sm' }} fontWeight="800" noOfLines={1}>{label}</Text>
      <Text color={COLORS.text} fontSize={{ base: 'lg', md: '2xl' }} fontWeight="950">{value}</Text>
    </Box>
  );
}

function UnitCard({ item }: { item: UnitCardItem }) {
  const { unit, tone, index } = item;
  const entry = getUnifiedLessonEntry(unit.id);
  const available = Boolean(entry);
  const href = entry?.primaryRoute ?? unit.sourceModuleReference.runtimeRoute ?? '/learning-path';
  const modeBadges = entry?.availablePracticeModes.length ? entry.availablePracticeModes : unit.recommendedPracticeModes;

  return (
    <Box
      data-testid="roadmap-unit-card"
      className="penglish-glass-card"
      bg={available ? 'rgba(255,255,255,0.78)' : 'rgba(248,250,252,0.72)'}
      border="1px solid"
      borderColor={available ? tone.border : COLORS.border}
      borderRadius="2xl"
      p={{ base: '2.5', md: '4' }}
      opacity={available ? 1 : 0.72}
      position="relative"
      overflow="hidden"
      boxShadow="0 10px 24px rgba(31,111,214,0.055)"
      backdropFilter="blur(14px) saturate(1.1)"
    >
      <Flex align={{ base: 'start', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={{ base: '2', md: '3' }}>
        <HStack align="start" gap="3" flex="1" minW="0">
          <Flex w={{ base: '36px', md: '42px' }} h={{ base: '36px', md: '42px' }} borderRadius="2xl" bg={available ? tone.bg : '#E2E8F0'} align="center" justify="center" flexShrink={0}>
            <Icon as={available ? Route : Lock} color={available ? tone.color : '#64748B'} boxSize="5" />
          </Flex>
          <Box minW="0">
            <HStack wrap="wrap" gap="2" mb="1">
              <Badge colorScheme="blue" borderRadius="full">{unit.level}</Badge>
              <Badge colorScheme="purple" borderRadius="full">Unit {index + 1}</Badge>
              <Tag size="sm" borderRadius="full" bg="#F8FAFC" color={COLORS.muted} fontWeight="800" display={{ base: 'none', sm: 'inline-flex' }}>{unit.skillFocus}</Tag>
            </HStack>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="950" color={COLORS.text}>{unit.titleVi}</Text>
            <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="700" lineHeight="1.5" noOfLines={{ base: 1, md: 2 }}>{unit.subtitleVi}</Text>
            <Box as="details" mt="2" display={{ base: 'none', sm: 'block' }}>
              <Box as="summary" cursor="pointer" color={COLORS.muted} fontSize="xs" fontWeight="850">Ghi chú ngắn</Box>
              <HStack mt="2" align="start" gap="2">
                <OceanMascot mascot="ruaRi" pose="point" size="xs" decorative motion="pulse" />
                <Text color={COLORS.muted} fontSize="sm" fontWeight="700" lineHeight="1.5" noOfLines={2}>{unit.whaleCoachLine}</Text>
              </HStack>
            </Box>
          </Box>
        </HStack>

        <VStack align={{ base: 'stretch', md: 'end' }} gap={{ base: '2', md: '3' }} minW={{ base: '100%', md: '260px' }}>
          <Box w="100%" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3" bg="rgba(248,252,255,0.64)" display={{ base: 'none', sm: 'block' }}>
            <Text color={COLORS.muted} fontSize="xs" fontWeight="800">Bước tiếp theo</Text>
            <Text color={COLORS.text} fontWeight="900" fontSize="sm" noOfLines={2}>{unit.confidenceGoal}</Text>
            <HStack mt="2" wrap="wrap" gap="1.5" display={{ base: 'none', md: 'flex' }}>
              {modeBadges.slice(0, 3).map((mode) => (
                <Tag key={mode} size="sm" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="850">
                  {MODE_LABELS[mode] ?? mode}
                </Tag>
              ))}
            </HStack>
          </Box>
          {available && href ? (
            <Button as={Link} to={href} colorScheme="blue" rightIcon={<Icon as={Play} />} aria-label={`Vào bài học ${unit.titleVi}`} alignSelf={{ base: 'stretch', md: 'end' }} size={{ base: 'sm', md: 'md' }}>
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

