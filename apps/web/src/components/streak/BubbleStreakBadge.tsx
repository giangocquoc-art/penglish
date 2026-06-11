import { HStack, Icon, Text } from '@chakra-ui/react';
import { Waves } from 'lucide-react';
import { getUnifiedBubbleStreak, type DailyRewardState, type UnifiedBubbleStreak } from '../../lib/p-english/daily-rewards';
import { OCEAN_TOKENS } from '../p-english/OceanBackdrop';

type BubbleStreakBadgeProps = {
  state?: Partial<DailyRewardState> | null;
  streak?: UnifiedBubbleStreak;
  compact?: boolean;
  showLabel?: boolean;
  testId?: string;
};

export function BubbleStreakBadge({ state, streak, compact = false, showLabel = true, testId = 'bubble-streak-badge' }: BubbleStreakBadgeProps) {
  const unified = streak ?? getUnifiedBubbleStreak(state);
  const motionKey = `${unified.current}-${unified.max}-${unified.progressPercent}`;

  return (
    <HStack
      key={motionKey}
      className={`bubble-streak-badge${unified.isFull ? ' is-full' : ''}${compact ? ' is-compact' : ''}`}
      data-testid={testId}
      gap={compact ? '1.5' : '2'}
      px={compact ? '2' : { base: '2.5', md: '3' }}
      py={compact ? '1' : undefined}
      h={compact ? undefined : '38px'}
      borderRadius="full"
      color={OCEAN_TOKENS.text}
      aria-label={unified.label}
      title={unified.label}
    >
      <Icon as={Waves} boxSize={compact ? '4' : '4.5'} color={OCEAN_TOKENS.oceanBlue} flexShrink={0} />
      <Text fontSize={compact ? 'sm' : { base: 'xs', md: 'sm' }} fontWeight={compact ? '850' : '800'} noOfLines={1}>
        {showLabel ? unified.label : `${unified.current}/${unified.max}`}
      </Text>
    </HStack>
  );
}

type BubbleStreakStatProps = {
  state?: Partial<DailyRewardState> | null;
  streak?: UnifiedBubbleStreak;
};

export function BubbleStreakStat({ state, streak }: BubbleStreakStatProps) {
  const unified = streak ?? getUnifiedBubbleStreak(state);

  return (
    <HStack className={`bubble-streak-stat${unified.isFull ? ' is-full' : ''}`} data-testid="bubble-streak-stat" gap="2.5" minW="0">
      <Icon as={Waves} boxSize="5" color={OCEAN_TOKENS.oceanBlue} flexShrink={0} />
      <Text color={OCEAN_TOKENS.text} fontWeight="950" noOfLines={1}>{unified.label}</Text>
    </HStack>
  );
}
