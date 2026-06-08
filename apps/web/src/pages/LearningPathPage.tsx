import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CheckCircle2, ChevronDown, Circle, LockKeyhole, Play, Sparkles, Waves } from 'lucide-react';
import {
  getUnifiedDashboardSnapshot,
  getUnifiedLearningPath,
} from '../lib/p-english/unifiedLessonEngine';
import { getCefrProgressSummary } from '../lib/p-english/cefr-progress';
import { LESSON_PROGRESS_UPDATED_EVENT } from '../lib/p-english/lesson-progress';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { VOCABULARY_REVIEW_UPDATED_EVENT } from '../lib/p-english/vocabulary-review';
import type { UnifiedCefrLevel, UnifiedLearningUnit } from '../data/learning/generatedUnifiedLearningPath';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  border: '#D7E8F5',
  blue: '#2563EB',
  green: '#22C55E',
  amber: '#F59E0B',
  aqua: '#DDF5FF',
};

const LEVEL_STAGES: Array<{ level: UnifiedCefrLevel; title: string; note: string }> = [
  { level: 'A1', title: 'Bắt đầu', note: 'Chào hỏi, từ vựng lõi, câu rất ngắn.' },
  { level: 'A2', title: 'Cơ bản', note: 'Tình huống quen thuộc và câu dùng hằng ngày.' },
  { level: 'B1', title: 'Giao tiếp', note: 'Nói ý chính, kể chuyện ngắn, xử lý hội thoại.' },
  { level: 'B2', title: 'Tự tin', note: 'Diễn đạt rõ hơn trong học tập và công việc.' },
];

export function LearningPathPage() {
  const [progressVersion, setProgressVersion] = useState(0);
  const [showFutureUnits, setShowFutureUnits] = useState(false);
  const dashboard = useMemo(() => getUnifiedDashboardSnapshot(), [progressVersion]);
  const cefrProgress = useMemo(() => getCefrProgressSummary(), [progressVersion]);
  const allUnits = useMemo(() => getUnifiedLearningPath(), []);
  const completedUnitIds = useMemo(() => allUnits.slice(0, Math.max(0, cefrProgress.completedUnits)).map((unit) => unit.id), [allUnits, cefrProgress.completedUnits]);
  const currentUnit = useMemo(() => allUnits.find((unit) => !completedUnitIds.includes(unit.id)) || allUnits[0], [allUnits, completedUnitIds]);
  const currentLevelLabel = dashboard.currentLevel === cefrProgress.currentLevel ? dashboard.currentLevelLabel : 'Beginner';
  const unitProgressText = `${cefrProgress.completedUnits}/${cefrProgress.totalUnits}`;
  const currentLessonPath = currentUnit?.sourceModuleReference.runtimeRoute || dashboard.nextLessonPath;
  const nextUnits = useMemo(() => {
    const currentIndex = currentUnit ? allUnits.findIndex((unit) => unit.id === currentUnit.id) : 0;
    return allUnits.slice(Math.max(0, currentIndex + 1), Math.max(0, currentIndex + 4));
  }, [allUnits, currentUnit]);

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
    <OceanPageShell data-testid="roadmap-mobile-root" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pt={{ base: '2', md: '0' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 96px)', lg: '8' }}>
      <Box maxW="980px" mx="auto" minW="0">
        <JourneyHero
          currentUnit={currentUnit}
          currentLevel={cefrProgress.currentLevel}
          currentLevelLabel={currentLevelLabel}
          unitProgressText={unitProgressText}
          pathPercentage={dashboard.pathPercentage}
          currentLessonPath={currentLessonPath}
        />

        <SimpleStagePath currentLevel={cefrProgress.currentLevel} pathPercentage={dashboard.pathPercentage} />

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: '3', md: '4' }} alignItems="start" mt={{ base: '3', md: '4' }}>
          <FuturePreviewPanel currentUnit={currentUnit} nextUnits={nextUnits} showFutureUnits={showFutureUnits} onToggleFuture={() => setShowFutureUnits((value) => !value)} />
          <CalmSupportPanel streak={dashboard.currentStreak} vocabularyReviewCount={cefrProgress.vocabularyReviewCount} shadowingPracticedLines={cefrProgress.shadowingPracticedLines} />
        </SimpleGrid>
      </Box>
    </OceanPageShell>
  );
}

function JourneyHero({ currentUnit, currentLevel, currentLevelLabel, unitProgressText, pathPercentage, currentLessonPath }: { currentUnit?: UnifiedLearningUnit; currentLevel: UnifiedCefrLevel; currentLevelLabel: string; unitProgressText: string; pathPercentage: number; currentLessonPath: string }) {
  return (
    <Box className="penglish-glass-card" bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="#7DD3FC" borderRadius="3xl" p={{ base: '4', md: '6' }} mb={{ base: '3', md: '4' }} overflow="hidden" position="relative" boxShadow="0 24px 64px rgba(31,111,214,0.13)" backdropFilter="blur(14px) saturate(1.1)" data-testid="learning-path-current-card">
      <Box position="absolute" inset="0" bg="radial-gradient(circle at 88% 16%, rgba(91,188,235,0.18), transparent 28%), radial-gradient(circle at 6% 92%, rgba(255,255,255,0.86), transparent 26%)" pointerEvents="none" />
      <Flex position="relative" align={{ base: 'stretch', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={{ base: '4', md: '6' }}>
        <VStack align="start" gap={{ base: '3', md: '4' }} flex="1" minW="0">
          <HStack wrap="wrap" gap="2">
            <Tag borderRadius="full" bg="#ECFDF5" color="#047857" fontWeight="950" data-testid="learning-path-current-level-chip">{currentLevel} · {currentLevelLabel}</Tag>
            <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="900" data-testid="learning-path-completed-units-chip">{unitProgressText} unit</Tag>
          </HStack>
          <Box minW="0">
            <Text color={COLORS.blue} fontSize="xs" fontWeight="950" letterSpacing="0.12em" textTransform="uppercase">Bạn đang ở đâu?</Text>
            <Text as="h1" mt="1" color={COLORS.text} fontWeight="950" lineHeight="1.08" fontSize={{ base: '2xl', md: '4xl' }}>
              {currentUnit?.titleVi ?? 'A1 · Chào hỏi tự tin'}
            </Text>
            <Text mt="2" color={COLORS.muted} fontSize={{ base: 'sm', md: 'md' }} fontWeight="750" lineHeight="1.6" maxW="640px">
              {currentUnit?.subtitleVi ?? 'Học một bước nhỏ: nghe, hiểu, luyện nói, rồi kiểm tra nhanh.'}
            </Text>
          </Box>
          <HStack gap="3" wrap="wrap" w="100%">
            <Button as={Link} to={currentLessonPath} bg={COLORS.blue} color="white" size={{ base: 'md', md: 'lg' }} leftIcon={<Icon as={Play} />} borderRadius="full" _hover={{ bg: '#1D4ED8' }} data-testid="learning-path-continue-cta">
              Tiếp tục học
            </Button>
            <Text color={COLORS.muted} fontWeight="850" fontSize="sm">{Math.max(0, pathPercentage)}% toàn lộ trình</Text>
          </HStack>
        </VStack>
        <Box alignSelf={{ base: 'center', md: 'auto' }} pointerEvents="none">
          <OceanMascot mascot="poo" pose="coach" size="hero" decorative motion="float" />
        </Box>
      </Flex>
    </Box>
  );
}

function SimpleStagePath({ currentLevel, pathPercentage }: { currentLevel: UnifiedCefrLevel; pathPercentage: number }) {
  return (
    <Box className="penglish-glass-card" bg="rgba(255,255,255,0.76)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '4' }} data-testid="learning-path-stage-dots">
      <HStack justify="space-between" align="center" gap="3" mb="3">
        <Box>
          <Text color={COLORS.text} fontWeight="950">Đường học rất gọn</Text>
          <Text color={COLORS.muted} fontWeight="750" fontSize="sm">Đi từng vùng, không cần mở nhiều thẻ.</Text>
        </Box>
        <Icon as={Waves} color={COLORS.blue} boxSize="6" display={{ base: 'none', sm: 'block' }} />
      </HStack>
      <Flex align="stretch" gap={{ base: '2', md: '3' }} overflowX="auto" pb="1" sx={{ scrollbarWidth: 'thin' }}>
        {LEVEL_STAGES.map((stage, index) => {
          const active = stage.level === currentLevel;
          const passed = LEVEL_STAGES.findIndex((item) => item.level === currentLevel) > index;
          return <StageDot key={stage.level} stage={stage} active={active} passed={passed} />;
        })}
      </Flex>
      <Box mt="3" borderRadius="full" bg="#E2E8F0" h="8px" overflow="hidden" role="progressbar" aria-valuenow={pathPercentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ lộ trình ${pathPercentage}%`}>
        <Box h="100%" w={`${Math.max(4, pathPercentage)}%`} bg="linear-gradient(90deg, #2F9EEB, #22C55E)" />
      </Box>
    </Box>
  );
}

function StageDot({ stage, active, passed }: { stage: { level: UnifiedCefrLevel; title: string; note: string }; active: boolean; passed: boolean }) {
  return (
    <Box flex="1" minW={{ base: '132px', md: '0' }} border="1px solid" borderColor={active ? '#7DD3FC' : passed ? '#BBF7D0' : COLORS.border} bg={active ? '#EFF6FF' : passed ? '#F0FDF4' : 'rgba(255,255,255,0.76)'} borderRadius="2xl" p="3">
      <HStack gap="2" align="center">
        <Flex w="28px" h="28px" borderRadius="full" bg={active ? COLORS.blue : passed ? COLORS.green : '#F8FAFC'} color={active || passed ? 'white' : COLORS.muted} align="center" justify="center" flexShrink={0}>
          <Icon as={passed ? CheckCircle2 : active ? Sparkles : Circle} boxSize="4" />
        </Flex>
        <Box minW="0">
          <Text color={COLORS.text} fontWeight="950" noOfLines={1}>{stage.level}: {stage.title}</Text>
          <Text color={COLORS.muted} fontSize="xs" fontWeight="750" noOfLines={2}>{stage.note}</Text>
        </Box>
      </HStack>
    </Box>
  );
}

function FuturePreviewPanel({ currentUnit, nextUnits, showFutureUnits, onToggleFuture }: { currentUnit?: UnifiedLearningUnit; nextUnits: UnifiedLearningUnit[]; showFutureUnits: boolean; onToggleFuture: () => void }) {
  return (
    <Box className="penglish-glass-card" bg="rgba(255,255,255,0.66)" border="1px solid" borderColor="rgba(186,230,253,0.86)" borderRadius="3xl" overflow="hidden">
      <Button onClick={onToggleFuture} variant="ghost" w="100%" justifyContent="space-between" px="4" py="5" h="auto" borderRadius="none" rightIcon={<Icon as={ChevronDown} transform={showFutureUnits ? 'rotate(180deg)' : 'rotate(0deg)'} transition="transform .2s ease" />}>
        <Box textAlign="left">
          <Text color={COLORS.text} fontWeight="950">Bài sau để xem nhẹ</Text>
          <Text color={COLORS.muted} fontWeight="750" fontSize="sm">Không cần học ngay. Mở khi bạn muốn nhìn trước.</Text>
        </Box>
      </Button>
      <Collapse in={showFutureUnits} unmountOnExit={false}>
        <VStack align="stretch" gap="2" px="4" pb="4">
          {nextUnits.map((unit) => <ReducedFutureUnit key={unit.id} unit={unit} currentUnit={currentUnit} />)}
        </VStack>
      </Collapse>
    </Box>
  );
}

function ReducedFutureUnit({ unit, currentUnit }: { unit: UnifiedLearningUnit; currentUnit?: UnifiedLearningUnit }) {
  const locked = Boolean(unit.unlockedByUnitId && unit.unlockedByUnitId !== currentUnit?.id);
  return (
    <HStack gap="3" p="3" borderRadius="2xl" bg="rgba(248,252,255,0.88)" border="1px solid" borderColor={COLORS.border} opacity={locked ? 0.68 : 1}>
      <Flex w="34px" h="34px" borderRadius="full" bg={locked ? '#F8FAFC' : '#EFF6FF'} color={locked ? COLORS.muted : COLORS.blue} align="center" justify="center" flexShrink={0}>
        <Icon as={locked ? LockKeyhole : Circle} boxSize="4" />
      </Flex>
      <Box minW="0">
        <Text color={COLORS.text} fontWeight="900" fontSize="sm" noOfLines={1}>{unit.titleVi}</Text>
        <Text color={COLORS.muted} fontWeight="700" fontSize="xs" noOfLines={1}>{unit.subtitleVi}</Text>
      </Box>
    </HStack>
  );
}

function CalmSupportPanel({ streak, vocabularyReviewCount, shadowingPracticedLines }: { streak: number; vocabularyReviewCount: number; shadowingPracticedLines: number }) {
  const hasActivity = streak > 0 || vocabularyReviewCount > 0 || shadowingPracticedLines > 0;

  return (
    <Box bg="rgba(255,255,255,0.54)" border="1px solid" borderColor="rgba(186,230,253,0.68)" borderRadius="3xl" p={{ base: '3', md: '4' }}>
      <HStack gap="3" align="start">
        <OceanMascot mascot="poo" pose="coach" size="xs" decorative motion="float" />
        <Box minW="0" flex="1">
          <Text color={COLORS.text} fontWeight="950">Poo nhắc nhỏ</Text>
          <Text color={COLORS.muted} fontWeight="750" fontSize="sm" lineHeight="1.55">Học bài hiện tại trước. Ôn tập và shadowing chỉ là phần phụ.</Text>
          {hasActivity ? (
            <SimpleGrid columns={{ base: 3, sm: 3 }} gap="2" mt="3">
              <MiniMetric label="Streak" value={`${streak}`} />
              <MiniMetric label="Từ ôn" value={`${vocabularyReviewCount}`} />
              <MiniMetric label="Shadow" value={`${shadowingPracticedLines}`} />
            </SimpleGrid>
          ) : null}
          <HStack mt="3" gap="2" wrap="wrap">
            <Button as={Link} to="/practice" size="sm" borderRadius="full" variant="ghost" color={COLORS.blue}>Ôn tập</Button>
            <Button as={Link} to="/shadowing" size="sm" borderRadius="full" variant="ghost" color={COLORS.blue}>Shadowing</Button>
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="#F8FCFF" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="3" textAlign="center">
      <Text color={COLORS.blue} fontWeight="950" fontSize="xl">{value}</Text>
      <Text color={COLORS.muted} fontSize="xs" fontWeight="800">{label}</Text>
    </Box>
  );
}
