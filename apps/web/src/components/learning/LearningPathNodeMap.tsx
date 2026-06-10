import { Box, Button, Flex, HStack, Icon, Tag, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Dumbbell, Headphones, Lock, Mic2, PenLine, Play, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import type { UnifiedLearningUnit, UnifiedPracticeMode } from '../../data/learning/generatedUnifiedLearningPath';

export type LearningPathNodeState = 'locked' | 'current' | 'completed' | 'review' | 'checkpoint';
export type LearningPathNodeType = 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'quiz' | 'review' | 'checkpoint';

export type LessonStep =
  | 'intro'
  | 'flashcard'
  | 'multiple_choice'
  | 'fill_blank'
  | 'sentence_order'
  | 'listen_choose'
  | 'speak_repeat'
  | 'summary';

export type LearningPathNode = {
  id: string;
  title: string;
  subtitle: string;
  type: LearningPathNodeType;
  state: LearningPathNodeState;
  href: string;
  duration: string;
  steps: LessonStep[];
};

export type LearningPathUnit = {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  nodes: LearningPathNode[];
};

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  border: '#BAE6FD',
  blue: '#2563EB',
  sky: '#2F9EEB',
  green: '#16A34A',
  amber: '#F59E0B',
  coral: '#F97316',
};

const NODE_META: Record<LearningPathNodeType, { label: string; icon: any; bg: string; color: string }> = {
  vocabulary: { label: 'Từ vựng', icon: BookOpen, bg: '#EFF6FF', color: COLORS.blue },
  grammar: { label: 'Ngữ pháp', icon: PenLine, bg: '#F5F3FF', color: '#7C3AED' },
  listening: { label: 'Nghe', icon: Headphones, bg: '#ECFEFF', color: '#0891B2' },
  speaking: { label: 'Nói', icon: Mic2, bg: '#FFF7ED', color: COLORS.coral },
  quiz: { label: 'Kiểm tra', icon: ShieldCheck, bg: '#F0FDF4', color: COLORS.green },
  review: { label: 'Ôn lại', icon: Dumbbell, bg: '#FFFBEB', color: '#B45309' },
  checkpoint: { label: 'Bài kiểm tra nhỏ', icon: ShieldCheck, bg: '#E0F2FE', color: COLORS.blue },
};

const MODE_TO_NODE: Record<UnifiedPracticeMode, LearningPathNodeType> = {
  flashcard: 'vocabulary',
  quiz: 'quiz',
  listen: 'listening',
  reflex: 'speaking',
  type: 'grammar',
  match: 'review',
  speed: 'speaking',
  shadowing: 'speaking',
  pronunciation: 'speaking',
};

const NODE_STEP_PRESETS: Record<LearningPathNodeType, LessonStep[]> = {
  vocabulary: ['intro', 'flashcard', 'multiple_choice', 'summary'],
  grammar: ['intro', 'fill_blank', 'sentence_order', 'summary'],
  listening: ['intro', 'listen_choose', 'multiple_choice', 'summary'],
  speaking: ['intro', 'speak_repeat', 'summary'],
  quiz: ['multiple_choice', 'fill_blank', 'sentence_order', 'summary'],
  review: ['flashcard', 'multiple_choice', 'summary'],
  checkpoint: ['intro', 'multiple_choice', 'listen_choose', 'speak_repeat', 'summary'],
};

export function mapPracticeModeToNodeType(mode: UnifiedPracticeMode): LearningPathNodeType {
  return MODE_TO_NODE[mode] ?? 'review';
}

export function buildLearningPathNodeUnits(
  units: UnifiedLearningUnit[],
  options: { currentUnitId?: string; completedUnitIds?: string[] } = {},
): LearningPathUnit[] {
  const completed = new Set(options.completedUnitIds || []);
  const currentUnitId = options.currentUnitId || units.find((unit) => !completed.has(unit.id))?.id || units[0]?.id;

  return units.map((unit, unitIndex) => {
    const unitCompleted = completed.has(unit.id);
    const unitCurrent = unit.id === currentUnitId;
    const locked = Boolean(unit.unlockedByUnitId && !completed.has(unit.unlockedByUnitId) && !unitCurrent);
    const modes = unit.recommendedPracticeModes.length ? unit.recommendedPracticeModes : [unit.primaryMode];
    const nodeModes = modes.slice(0, 4);
    const nodes: LearningPathNode[] = nodeModes.map((mode, nodeIndex) => {
      const type = mapPracticeModeToNodeType(mode);
      const isFirstCurrentNode = unitCurrent && nodeIndex === 0;
      const state: LearningPathNodeState = locked ? 'locked' : unitCompleted ? 'completed' : isFirstCurrentNode ? 'current' : nodeIndex === nodeModes.length - 1 ? 'review' : 'current';
      return {
        id: `${unit.id}-${mode}-${nodeIndex}`,
        title: NODE_META[type].label,
        subtitle: nodeIndex === 0 ? unit.titleVi : unit.confidenceGoal,
        type,
        state,
        href: locked ? '/learning-path' : `/learning-path/lesson/${unit.id}/${unit.id}-${mode}-${nodeIndex}`,
        duration: nodeIndex === 0 ? '3 phút' : '4–6 phút',
        steps: NODE_STEP_PRESETS[type],
      };
    });

    nodes.push({
      id: `${unit.id}-checkpoint`,
      title: unitIndex % 3 === 2 ? 'Bài kiểm tra nhỏ' : 'Chốt bài',
      subtitle: unit.confidenceGoal,
      type: unitIndex % 3 === 2 ? 'checkpoint' : 'quiz',
      state: locked ? 'locked' : unitCompleted ? 'completed' : unitCurrent ? 'checkpoint' : 'review',
      href: locked ? '/learning-path' : `/learning-path/lesson/${unit.id}/${unit.id}-checkpoint`,
      duration: '5 phút',
      steps: NODE_STEP_PRESETS.checkpoint,
    });

    return {
      id: unit.id,
      title: unit.titleVi,
      subtitle: unit.subtitleVi,
      level: unit.level,
      nodes,
    };
  });
}

export function LearningPathNodeMap({ units, compact = false }: { units: LearningPathUnit[]; compact?: boolean }) {
  return (
    <VStack align="stretch" gap={{ base: '4', md: '5' }} data-testid="duolingo-learning-path-map">
      {units.map((unit, unitIndex) => (
        <Box key={unit.id} className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} bg="rgba(255,255,255,0.78)" borderRadius="3xl" p={{ base: '3', md: '5' }} overflow="hidden">
          <HStack justify="space-between" align="start" mb="4" gap="3">
            <Box minW="0">
              <HStack gap="2" wrap="wrap" mb="1">
                <Tag borderRadius="full" bg="#E8F4FF" color={COLORS.blue} fontWeight="950">Bài {unitIndex + 1}</Tag>
                <Tag borderRadius="full" bg="#ECFDF5" color={COLORS.green} fontWeight="900">{unit.level}</Tag>
              </HStack>
              <Text as="h2" color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.15">{unit.title}</Text>
              <Text mt="1" color={COLORS.muted} fontWeight="750" fontSize="sm" lineHeight="1.55" noOfLines={{ base: 2, md: 3 }}>{unit.subtitle}</Text>
            </Box>
            <Text flexShrink={0} fontSize="xs" fontWeight="950" color={COLORS.blue} bg="#F8FCFF" border="1px solid" borderColor={COLORS.border} borderRadius="full" px="3" py="1">
              {unit.nodes.length} điểm học
            </Text>
          </HStack>
          <Flex direction="column" align="center" gap="0" position="relative" pb="1">
            {unit.nodes.map((node, nodeIndex) => (
              <LearningNodeButton key={node.id} node={node} index={nodeIndex} compact={compact} />
            ))}
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}

function LearningNodeButton({ node, index, compact }: { node: LearningPathNode; index: number; compact?: boolean }) {
  const meta = NODE_META[node.type];
  const disabled = node.state === 'locked';
  const isCompleted = node.state === 'completed';
  const isCurrent = node.state === 'current' || node.state === 'checkpoint';
  const offset = compact ? 0 : index % 2 === 0 ? -34 : 34;
  const nodeBg = disabled ? '#E2E8F0' : isCompleted ? '#DCFCE7' : isCurrent ? meta.bg : '#FFFFFF';
  const nodeColor = disabled ? '#64748B' : isCompleted ? COLORS.green : meta.color;

  return (
    <Box position="relative" w="100%" minH={{ base: '92px', md: '104px' }} display="flex" justifyContent="center" alignItems="center">
      {index > 0 ? <Box position="absolute" top="-28px" h="56px" w="4px" bg="rgba(186,230,253,0.95)" borderRadius="full" /> : null}
      <Button
        as={Link}
        to={disabled ? '/learning-path' : node.href}
        isDisabled={disabled}
        aria-disabled={disabled}
        w={{ base: compact ? '100%' : 'min(310px, 92%)', md: '340px' }}
        minH={{ base: '72px', md: '78px' }}
        transform={{ base: 'none', md: `translateX(${offset}px)` }}
        borderRadius="28px"
        bg={nodeBg}
        color={nodeColor}
        border="2px solid"
        borderColor={isCurrent ? meta.color : isCompleted ? '#86EFAC' : '#D7E8F5'}
        boxShadow={isCurrent ? `0 16px 34px ${meta.color}24` : '0 10px 24px rgba(31,111,214,0.08)'}
        _hover={disabled ? undefined : { transform: { base: 'translateY(-2px)', md: `translateX(${offset}px) translateY(-2px)` }, boxShadow: '0 18px 42px rgba(31,111,214,0.16)' }}
        transition="transform .16s ease, box-shadow .16s ease"
        data-testid={`learning-path-node-${node.type}-${node.state}`}
      >
        <HStack w="100%" align="center" gap="3" justify="space-between">
          <HStack minW="0" gap="3">
            <Flex w="46px" h="46px" borderRadius="2xl" bg="rgba(255,255,255,0.82)" align="center" justify="center" border="1px solid" borderColor="rgba(255,255,255,0.92)" flexShrink={0}>
              <Icon as={disabled ? Lock : isCompleted ? CheckCircle2 : meta.icon} boxSize="6" />
            </Flex>
            <Box minW="0" textAlign="left">
              <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>{node.title}</Text>
              <Text color={COLORS.muted} fontWeight="750" fontSize="xs" noOfLines={1}>{node.duration} · {meta.label}</Text>
            </Box>
          </HStack>
          <Icon as={node.type === 'listening' ? Volume2 : isCurrent ? Play : Sparkles} boxSize="5" color={nodeColor} />
        </HStack>
      </Button>
    </Box>
  );
}
