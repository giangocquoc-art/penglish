import { Box, HStack, Icon, Text } from '@chakra-ui/react';
import { Droplets, Waves } from 'lucide-react';
import { getUnifiedBubbles, getWaterStreak, type DailyRewardState, type UnifiedBubbleStreak, type UnifiedWaterStreak } from '../../lib/p-english/daily-rewards';
import { OCEAN_TOKENS } from '../p-english/OceanBackdrop';
import { SpongeIcon } from '../learning/SpongeIcon';
import { OceanMascot } from '../p-english/OceanMascot';

type BubbleStreakBadgeProps = {
  state?: Partial<DailyRewardState> | null;
  streak?: UnifiedBubbleStreak;
  compact?: boolean;
  showLabel?: boolean;
  testId?: string;
};

export function BubbleStreakBadge({ state, streak, compact = false, showLabel = true, testId = 'bubble-streak-badge' }: BubbleStreakBadgeProps) {
  const unified = streak ?? getUnifiedBubbles(state);
  const motionKey = `${unified.current}-${unified.max}-${unified.progressPercent}`;
  const sponges = Array.from({ length: unified.max }, (_, index) => index < unified.current);

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
      <OceanMascot
        mascot="botBien"
        pose="encourage"
        size="xs"
        decorative
        motion="float"
        className="bubble-streak-mascot"
        w={compact ? '34px' : '40px'}
        aria-hidden="true"
      />
      <HStack className="bubble-streak-sponge-row" gap="0" flexShrink={0} aria-hidden="true">
        {sponges.map((active, index) => (
          <Box key={index} className="bubble-streak-sponge" style={{ animationDelay: `${index * 90}ms` }}>
            <SpongeIcon active={active} compact size={compact ? 14 : 16} />
          </Box>
        ))}
      </HStack>
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
  const unified = streak ?? getUnifiedBubbles(state);

  return (
    <HStack className={`bubble-streak-stat${unified.isFull ? ' is-full' : ''}`} data-testid="bubble-streak-stat" gap="2.5" minW="0">
      <Icon as={Droplets} boxSize="5" color={OCEAN_TOKENS.oceanBlue} flexShrink={0} />
      <Text color={OCEAN_TOKENS.text} fontWeight="950" noOfLines={1}>{unified.label}</Text>
    </HStack>
  );
}

type WaterStreakBadgeProps = {
  state?: Partial<DailyRewardState> | null;
  streak?: UnifiedWaterStreak;
  compact?: boolean;
  showLabel?: boolean;
  testId?: string;
};

export function WaterStreakBadge({ state, streak, compact = false, showLabel = true, testId = 'water-streak-badge' }: WaterStreakBadgeProps) {
  const unified = streak ?? getWaterStreak(state);

  return (
    <HStack
      className={`water-streak-badge bubble-streak-badge${unified.isFull ? ' is-full' : ''}${compact ? ' is-compact' : ''}`}
      data-testid={testId}
      gap={compact ? '1.5' : '2'}
      px={compact ? '2' : { base: '2.5', md: '3' }}
      py={compact ? '1' : undefined}
      h={compact ? undefined : '38px'}
      borderRadius="full"
      color={OCEAN_TOKENS.text}
      aria-label={unified.displayLabel}
      title={unified.displayLabel}
    >
      <Icon as={Waves} boxSize={compact ? '4' : '4.5'} color={OCEAN_TOKENS.oceanBlue} flexShrink={0} />
      <Text fontSize={compact ? 'sm' : { base: 'xs', md: 'sm' }} fontWeight={compact ? '850' : '800'} noOfLines={1}>
        {showLabel ? unified.displayLabel : `${unified.current} ngày`}
      </Text>
    </HStack>
  );
}
