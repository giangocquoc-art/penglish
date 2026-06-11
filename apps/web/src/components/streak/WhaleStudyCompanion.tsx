import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, getWaterStreak } from '../../lib/p-english/daily-rewards';
import { AdaptiveWhaleScene, type WhaleMood } from './AdaptiveWhaleStreak';

export type WhaleCompanionPlacement = 'bottom-right' | 'card-corner' | 'floating-safe' | 'hidden-mobile';

type WhaleStudyCompanionProps = {
  mood?: WhaleMood;
  placement?: WhaleCompanionPlacement;
  streak?: number;
};

const placementStyles: Record<WhaleCompanionPlacement, Record<string, unknown>> = {
  'bottom-right': {
    position: 'fixed',
    right: { base: 'max(10px, env(safe-area-inset-right))', md: 'clamp(18px, 3vw, 42px)' },
    bottom: { base: 'calc(92px + env(safe-area-inset-bottom))', md: 'calc(34px + env(safe-area-inset-bottom))' },
    opacity: { base: 0.34, sm: 0.46, md: 0.68 },
  },
  'card-corner': {
    position: 'absolute',
    right: { base: '-12px', md: '10px' },
    bottom: { base: '-18px', md: '10px' },
    opacity: { base: 0.26, md: 0.58 },
  },
  'floating-safe': {
    position: 'fixed',
    right: { base: 'max(8px, env(safe-area-inset-right))', md: 'clamp(22px, 3vw, 46px)' },
    bottom: { base: 'calc(132px + env(safe-area-inset-bottom))', md: 'calc(118px + env(safe-area-inset-bottom))' },
    opacity: { base: 0.28, sm: 0.38, md: 0.62 },
  },
  'hidden-mobile': {
    position: 'fixed',
    right: { base: 'max(8px, env(safe-area-inset-right))', md: 'clamp(22px, 3vw, 46px)' },
    bottom: { base: 'calc(104px + env(safe-area-inset-bottom))', md: 'calc(42px + env(safe-area-inset-bottom))' },
    opacity: { base: 0, md: 0.62 },
  },
};

export function WhaleStudyCompanion({ mood = 'idle', placement = 'floating-safe', streak: streakProp }: WhaleStudyCompanionProps) {
  const styles = placementStyles[placement];
  const isCardCorner = placement === 'card-corner';
  const [localStreak, setLocalStreak] = useState(() => getWaterStreak(getDailyRewardState()).current);
  const streak = streakProp ?? localStreak;

  useEffect(() => {
    if (streakProp !== undefined || typeof window === 'undefined') return undefined;
    const refreshStreak = () => setLocalStreak(getWaterStreak(getDailyRewardState()).current);
    window.addEventListener('focus', refreshStreak);
    window.addEventListener('storage', refreshStreak);
    window.addEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshStreak);
    return () => {
      window.removeEventListener('focus', refreshStreak);
      window.removeEventListener('storage', refreshStreak);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshStreak);
    };
  }, [streakProp]);

  return (
    <Box
      {...styles}
      data-whale-companion-placement={placement}
      w={{ base: 'clamp(72px, 22vw, 104px)', sm: 'clamp(92px, 20vw, 124px)', md: 'clamp(128px, 12vw, 168px)' }}
      h={{ base: 'clamp(54px, 16vw, 78px)', sm: 'clamp(68px, 15vw, 92px)', md: 'clamp(94px, 9vw, 122px)' }}
      maxW={{ base: '28vw', md: '180px' }}
      maxH={{ base: '88px', md: '132px' }}
      pointerEvents="none"
      aria-hidden="true"
      tabIndex={-1}
      zIndex={2}
      overflow="hidden"
      transform={isCardCorner ? { base: 'scale(0.82)', md: 'scale(0.94)' } : undefined}
      transformOrigin="right bottom"
      sx={{
        '@media (max-width: 380px)': {
          opacity: placement === 'hidden-mobile' ? 0 : 0.2,
          transform: 'scale(0.74)',
        },
        '@media (max-height: 700px) and (max-width: 640px)': {
          display: placement === 'hidden-mobile' ? 'none' : 'block',
          opacity: placement === 'hidden-mobile' ? 0 : 0.18,
        },
        '@media (prefers-reduced-motion: reduce)': {
          opacity: placement === 'hidden-mobile' ? undefined : 0.44,
        },
      }}
    >
      <Box position="absolute" right={{ base: '-46px', sm: '-34px', md: '-14px' }} bottom={{ base: '-34px', md: '-20px' }}>
        <AdaptiveWhaleScene
          streak={streak}
          variant="card"
          interactive
          followStrength="subtle"
          watchTarget="pointer"
          mood={mood}
          inactive={streak <= 0}
        />
      </Box>
    </Box>
  );
}
