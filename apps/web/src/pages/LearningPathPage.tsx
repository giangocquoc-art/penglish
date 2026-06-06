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
import { BookOpen, CheckCircle2, Compass, Flame, Play, RotateCcw, Sparkles, Target, Waves } from 'lucide-react';
import { cefrLearnerMilestoneByLevel } from '../data/learning/cefrLearnerMilestones';
import {
  getUnifiedDashboardSnapshot,
  getUnifiedLearningPath,
} from '../lib/p-english/unifiedLessonEngine';
import { getCefrProgressSummary } from '../lib/p-english/cefr-progress';
import { LESSON_PROGRESS_UPDATED_EVENT } from '../lib/p-english/lesson-progress';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { VOCABULARY_REVIEW_UPDATED_EVENT } from '../lib/p-english/vocabulary-review';
import type { UnifiedCefrLevel } from '../data/learning/generatedUnifiedLearningPath';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { buildLearningPathNodeUnits, LearningPathNodeMap } from '../components/learning/LearningPathNodeMap';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  border: '#D7E8F5',
  blue: '#2563EB',
  green: '#22C55E',
  amber: '#F59E0B',
  aqua: '#DDF5FF',
  card: 'rgba(255,255,255,0.78)',
};

const LEVELS: UnifiedCefrLevel[] = ['A1', 'A2', 'B1', 'B2'];

export function LearningPathPage() {
  const [progressVersion, setProgressVersion] = useState(0);
  const dashboard = useMemo(() => getUnifiedDashboardSnapshot(), [progressVersion]);
  const cefrProgress = useMemo(() => getCefrProgressSummary(), [progressVersion]);
  const allUnits = useMemo(() => getUnifiedLearningPath(), []);
  const completedUnitIds = useMemo(() => allUnits.slice(0, Math.max(0, cefrProgress.completedUnits)).map((unit) => unit.id), [allUnits, cefrProgress.completedUnits]);
  const currentUnit = useMemo(() => allUnits.find((unit) => !completedUnitIds.includes(unit.id)) || allUnits[0], [allUnits, completedUnitIds]);
  const currentLevelLabel = dashboard.currentLevel === cefrProgress.currentLevel ? dashboard.currentLevelLabel : 'Nền tảng';
  const unitProgressText = `${cefrProgress.completedUnits}/${cefrProgress.totalUnits}`;
  const pathUnits = useMemo(() => buildLearningPathNodeUnits(allUnits, { currentUnitId: currentUnit?.id, completedUnitIds }), [allUnits, completedUnitIds, currentUnit?.id]);
  const visibleUnits = useMemo(() => pathUnits.slice(0, 8), [pathUnits]);

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
      <Box maxW="1320px" mx="auto" minW="0">
        <LearningHero currentLevel={cefrProgress.currentLevel} currentLevelLabel={currentLevelLabel} unitProgressText={unitProgressText} nextLessonPath={dashboard.nextLessonPath} nextLessonTitle={dashboard.nextLessonTitle} />

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: '4', xl: '5' }} alignItems="start">
          <Box display={{ base: 'none', lg: 'block' }} position="sticky" top="84px">
            <LevelRail currentLevel={cefrProgress.currentLevel} pathPercentage={dashboard.pathPercentage} />
          </Box>

          <Box minW="0" gridColumn={{ base: 'auto', lg: 'span 1' }}>
            <Box mb="4" className="penglish-glass-card" bg="rgba(255,255,255,0.72)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '4' }}>
              <HStack justify="space-between" align="center" gap="3">
                <Box minW="0">
                  <Text fontSize="xs" fontWeight="950" color={COLORS.blue} letterSpacing="0.12em" textTransform="uppercase">Đường học hôm nay</Text>
                  <Text mt="1" color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }}>Từng chấm nhỏ, học 3–7 phút</Text>
                  <Text mt="1" color={COLORS.muted} fontWeight="750" fontSize="sm" lineHeight="1.55">Mỗi unit có các node từ vựng, nghe, nói, ngữ pháp, quiz và checkpoint. Poo giữ nhịp học nhẹ để bạn không bị lạc giữa nhiều tính năng.</Text>
                </Box>
                <Icon as={Waves} boxSize="8" color={COLORS.blue} display={{ base: 'none', md: 'block' }} />
              </HStack>
            </Box>
            <LearningPathNodeMap units={visibleUnits} />
          </Box>

          <Box display={{ base: 'block', lg: 'block' }} position={{ lg: 'sticky' }} top={{ lg: '84px' }}>
            <TodayPanel
              nextLessonPath={dashboard.nextLessonPath}
              nextLessonTitle={dashboard.nextLessonTitle}
              streak={dashboard.currentStreak}
              unitProgressText={unitProgressText}
              pathPercentage={dashboard.pathPercentage}
              vocabularyReviewCount={cefrProgress.vocabularyReviewCount}
              shadowingPracticedLines={cefrProgress.shadowingPracticedLines}
            />
          </Box>
        </SimpleGrid>
      </Box>
    </OceanPageShell>
  );
}

function LearningHero({ currentLevel, currentLevelLabel, unitProgressText, nextLessonPath, nextLessonTitle }: { currentLevel: string; currentLevelLabel: string; unitProgressText: string; nextLessonPath: string; nextLessonTitle: string }) {
  return (
    <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '4', md: '6' }} mb={{ base: '4', md: '5' }} overflow="hidden" position="relative" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" backdropFilter="blur(14px) saturate(1.1)">
      <Box position="absolute" inset="0" bg="radial-gradient(circle at 88% 18%, rgba(91,188,235,0.16), transparent 28%), radial-gradient(circle at 6% 92%, rgba(255,255,255,0.74), transparent 24%)" pointerEvents="none" />
      <Flex align={{ base: 'stretch', lg: 'center' }} justify="space-between" direction={{ base: 'column', lg: 'row' }} gap={{ base: '3', md: '5' }} position="relative">
        <VStack align="start" gap={{ base: '3', md: '4' }} position="relative" maxW="860px">
          <HStack wrap="wrap" gap="2">
            <Tag borderRadius="full" bg="white" color={COLORS.blue} fontWeight="950">🐋 Trang Học chính</Tag>
            <Tag borderRadius="full" bg="#ECFDF5" color="#047857" fontWeight="900" data-testid="learning-path-current-level-chip">{currentLevel} · {currentLevelLabel}</Tag>
            <Tag borderRadius="full" bg="#FFFBEB" color="#92400E" fontWeight="900" data-testid="learning-path-completed-units-chip">{unitProgressText} unit</Tag>
          </HStack>
          <Box>
            <Text as="h1" fontSize={{ base: '2xl', md: '4xl', xl: '5xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.04">Học tiếng Anh theo từng chấm cùng Poo</Text>
            <Text mt={{ base: '2', md: '3' }} color={COLORS.muted} fontSize={{ base: 'sm', md: 'md', xl: 'lg' }} fontWeight="750" lineHeight="1.55" maxW="780px">P-English gom bài học, luyện tập, sửa lỗi và ôn tập thành một hành trình rõ ràng. Hôm nay chỉ cần mở node hiện tại và học một bước nhỏ.</Text>
          </Box>
          <HStack gap="3" wrap="wrap">
            <Button as={Link} to={nextLessonPath} bg={COLORS.blue} color="white" size={{ base: 'md', md: 'lg' }} leftIcon={<Icon as={Play} />} borderRadius="full" _hover={{ bg: '#1D4ED8' }} data-testid="learning-path-continue-cta">Tiếp tục học</Button>
            <Button as={Link} to="/luyen-tieng-anh/48-ngay-lay-goc" bg="rgba(255,255,255,0.78)" color={COLORS.blue} border="1px solid" borderColor="#93C5FD" size={{ base: 'md', md: 'lg' }} leftIcon={<Icon as={Sparkles} />} borderRadius="full" _hover={{ bg: '#EFF6FF' }}>48 ngày lấy gốc</Button>
          </HStack>
          <Text color={COLORS.muted} fontWeight="850" fontSize="sm" noOfLines={1}>Bài gợi ý: {nextLessonTitle}</Text>
        </VStack>
        <Box display={{ base: 'none', md: 'block' }} pointerEvents="none"><OceanMascot mascot="poo" pose="map" size="hero" decorative motion="float" /></Box>
      </Flex>
    </Box>
  );
}

function TodayPanel({ nextLessonPath, nextLessonTitle, streak, unitProgressText, pathPercentage, vocabularyReviewCount, shadowingPracticedLines }: { nextLessonPath: string; nextLessonTitle: string; streak: number; unitProgressText: string; pathPercentage: number; vocabularyReviewCount: number; shadowingPracticedLines: number }) {
  return (
    <VStack align="stretch" gap="3" data-testid="learning-path-right-panel">
      <Box className="penglish-glass-card" bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="4">
        <HStack gap="3" align="start">
          <Flex w="46px" h="46px" borderRadius="2xl" bg="#E8F4FF" color={COLORS.blue} align="center" justify="center" flexShrink={0}><Icon as={Compass} boxSize="6" /></Flex>
          <Box minW="0">
            <Text color={COLORS.text} fontWeight="950">Bài nên học ngay</Text>
            <Text mt="1" color={COLORS.muted} fontWeight="750" fontSize="sm" lineHeight="1.55" noOfLines={2}>{nextLessonTitle}</Text>
            <Button as={Link} to={nextLessonPath} mt="3" w="100%" bg={COLORS.blue} color="white" borderRadius="full" leftIcon={<Icon as={Play} />} _hover={{ bg: '#1D4ED8' }}>Start lesson</Button>
          </Box>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 2, lg: 1 }} gap="3">
        <PanelMetric icon={Flame} label="Streak" value={`${streak} ngày`} tone="#FFFBEB" />
        <PanelMetric icon={Target} label="Tiến độ" value={`${pathPercentage}%`} tone="#EFF6FF" />
        <PanelMetric icon={CheckCircle2} label="Unit" value={unitProgressText} tone="#F0FDF4" />
        <PanelMetric icon={RotateCcw} label="Từ cần ôn" value={`${vocabularyReviewCount}`} tone="#FFF7ED" />
      </SimpleGrid>

      <Box className="penglish-glass-card" bg="rgba(255,255,255,0.76)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="4">
        <Text color={COLORS.text} fontWeight="950">Gợi ý hôm nay</Text>
        <VStack align="stretch" gap="2.5" mt="3">
          <Suggestion to="/practice" icon={RotateCcw} title="Ôn tập" subtitle={`${vocabularyReviewCount} từ/câu cần xem lại`} />
          <Suggestion to="/shadowing" icon={Waves} title="Shadowing" subtitle={`${shadowingPracticedLines} câu đã luyện`} />
          <Suggestion to="/words" icon={BookOpen} title="Từ vựng" subtitle="Mở sổ tay cá nhân" />
        </VStack>
      </Box>
    </VStack>
  );
}

function PanelMetric({ icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  return (
    <HStack className="penglish-glass-card" bg="rgba(255,255,255,0.74)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3" gap="3">
      <Flex w="38px" h="38px" borderRadius="xl" bg={tone} color={COLORS.blue} align="center" justify="center"><Icon as={icon} boxSize="5" /></Flex>
      <Box minW="0">
        <Text color={COLORS.muted} fontSize="xs" fontWeight="800">{label}</Text>
        <Text color={COLORS.text} fontWeight="950" noOfLines={1}>{value}</Text>
      </Box>
    </HStack>
  );
}

function Suggestion({ to, icon, title, subtitle }: { to: string; icon: any; title: string; subtitle: string }) {
  return (
    <HStack as={Link} to={to} gap="3" p="3" borderRadius="2xl" bg="#F8FCFF" border="1px solid" borderColor="#D7E8F5" _hover={{ bg: '#EFF6FF' }}>
      <Icon as={icon} color={COLORS.blue} boxSize="5" />
      <Box minW="0">
        <Text color={COLORS.text} fontWeight="900" fontSize="sm">{title}</Text>
        <Text color={COLORS.muted} fontWeight="700" fontSize="xs" noOfLines={1}>{subtitle}</Text>
      </Box>
    </HStack>
  );
}

function LevelRail({ currentLevel, pathPercentage }: { currentLevel: UnifiedCefrLevel; pathPercentage: number }) {
  return (
    <Box className="penglish-glass-card" bg="rgba(255,255,255,0.76)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="4">
      <Text color={COLORS.text} fontWeight="950" fontSize="lg">Vùng học</Text>
      <Text mt="1" color={COLORS.muted} fontWeight="750" fontSize="sm" lineHeight="1.55">Đi từ nền tảng đến giao tiếp đời sống. Không cần mở nhiều dashboard.</Text>
      <VStack align="stretch" gap="3" mt="4">
        {LEVELS.map((level) => {
          const milestone = cefrLearnerMilestoneByLevel[level];
          const active = level === currentLevel;
          return (
            <Box key={level} border="1px solid" borderColor={active ? '#93C5FD' : COLORS.border} bg={active ? '#EFF6FF' : '#FFFFFF'} borderRadius="2xl" p="3">
              <HStack justify="space-between" gap="2">
                <Text color={COLORS.text} fontWeight="950">{level}</Text>
                <Tag size="sm" borderRadius="full" bg={active ? COLORS.aqua : '#F8FAFC'} color={active ? COLORS.blue : COLORS.muted} fontWeight="850">{active ? 'Đang học' : milestone.label}</Tag>
              </HStack>
              <Text mt="1" color={COLORS.muted} fontWeight="700" fontSize="xs" lineHeight="1.45" noOfLines={2}>{milestone.shortNoteVi}</Text>
            </Box>
          );
        })}
      </VStack>
      <Box mt="4" borderRadius="full" bg="#E2E8F0" h="10px" overflow="hidden">
        <Box h="100%" w={`${Math.max(4, pathPercentage)}%`} bg="linear-gradient(90deg, #2F9EEB, #22C55E)" />
      </Box>
      <Text mt="2" color={COLORS.blue} fontWeight="900" fontSize="sm">{pathPercentage}% toàn lộ trình</Text>
    </Box>
  );
}
