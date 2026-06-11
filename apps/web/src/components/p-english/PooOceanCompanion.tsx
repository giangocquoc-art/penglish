import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { Box, Image, type BoxProps } from '@chakra-ui/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, getWaterStreak } from '../../lib/p-english/daily-rewards';
import { getOceanMascotPose } from '../../lib/p-english/oceanAssets';

gsap.registerPlugin(useGSAP);

export type PooOceanCompanionVariant = 'calm' | 'learning' | 'speed' | 'shadowing' | 'reward';

export type PooOceanCompanionProps = Omit<BoxProps, 'children'> & {
  variant?: PooOceanCompanionVariant;
  streak?: number;
};

type PooOceanCompanionSettings = { opacity: number; duration: number; y: number; rotate: number; delay: number };

const variantSettings: Record<PooOceanCompanionVariant, PooOceanCompanionSettings> = {
  calm: { opacity: 0.3, duration: 34, y: 16, rotate: 3, delay: 0 },
  learning: { opacity: 0.34, duration: 29, y: 18, rotate: 4, delay: 0.4 },
  speed: { opacity: 0.24, duration: 24, y: 12, rotate: 3, delay: 0.2 },
  shadowing: { opacity: 0.28, duration: 32, y: 14, rotate: 3, delay: 0.8 },
  reward: { opacity: 0.38, duration: 26, y: 20, rotate: 5, delay: 0 },
};

const DEFAULT_POO_COMPANION_SETTINGS = variantSettings.calm;

function getSafeStreakMultiplier(streak: number) {
  if (!Number.isFinite(streak) || streak <= 1) return 1;
  return Math.min(1.18, 1 + Math.min(streak, 14) * 0.012);
}

function getInitialStreak(streak?: number) {
  if (typeof streak === 'number') return streak;
  return getWaterStreak(getDailyRewardState()).current;
}

export function PooOceanCompanion({ variant = 'calm', streak, className, style, ...props }: PooOceanCompanionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const swimRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [currentStreak, setCurrentStreak] = useState(() => getInitialStreak(streak));
  const [pose, setPose] = useState<'idle' | 'happy' | 'reward'>('idle');
  const settings = variantSettings[variant] ?? DEFAULT_POO_COMPANION_SETTINGS;
  const sizeMultiplier = getSafeStreakMultiplier(streak ?? currentStreak);

  const companionStyle = useMemo(
    () =>
      ({
        '--poo-companion-scale': sizeMultiplier.toFixed(3),
        ...style,
      }) as CSSProperties,
    [sizeMultiplier, style],
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      const swim = swimRef.current;
      const image = imageRef.current;
      if (!root || !swim || !image || reducedMotion) return undefined;

      gsap.set(root, { opacity: settings.opacity });
      gsap.set(swim, { xPercent: variant === 'speed' ? 6 : -4, y: 0, rotate: -settings.rotate, scale: sizeMultiplier });
      gsap.set(image, { y: 0, rotate: settings.rotate * 0.45 });

      const swimTween = gsap.to(swim, {
        xPercent: variant === 'speed' ? -8 : 8,
        y: settings.y,
        rotate: settings.rotate,
        duration: settings.duration,
        delay: settings.delay,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      const bobTween = gsap.to(image, {
        y: -settings.y * 0.42,
        rotate: -settings.rotate * 0.5,
        duration: Math.max(6, settings.duration / 4),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      return () => {
        swimTween.kill();
        bobTween.kill();
      };
    },
    { scope: rootRef, dependencies: [reducedMotion, settings, sizeMultiplier, variant], revertOnUpdate: true },
  );

  useGSAP(
    (_context, contextSafe) => {
      if (typeof window === 'undefined') return undefined;

      const makeSafe = contextSafe ?? (<T extends (...args: never[]) => unknown>(handler: T) => handler);
      const celebrate = makeSafe(() => {
        setPose('reward');
        const image = imageRef.current;
        if (!image || reducedMotion) return;
        gsap.timeline().to(image, { scale: 1.08, rotate: 7, duration: 0.28, ease: 'back.out(2)' }).to(image, { scale: 1, rotate: 0, duration: 0.72, ease: 'elastic.out(1, 0.35)' });
        window.setTimeout(() => setPose('idle'), 1600);
      });

      const refreshStreak = makeSafe(() => setCurrentStreak(getWaterStreak(getDailyRewardState()).current));
      window.addEventListener('poo:celebrate', celebrate as EventListener);
      window.addEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshStreak as EventListener);
      window.addEventListener('storage', refreshStreak as EventListener);

      return () => {
        window.removeEventListener('poo:celebrate', celebrate as EventListener);
        window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshStreak as EventListener);
        window.removeEventListener('storage', refreshStreak as EventListener);
      };
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  const resolvedPose = variant === 'reward' || pose === 'reward' ? 'reward' : pose === 'happy' ? 'happy' : 'idle';
  const src = getOceanMascotPose('poo', resolvedPose);

  return (
    <Box
      ref={rootRef}
      className={['poo-ocean-companion', `poo-ocean-companion--${variant}`, className].filter(Boolean).join(' ')}
      aria-hidden="true"
      data-testid="poo-ocean-companion"
      pointerEvents="none"
      position="absolute"
      inset="0"
      zIndex={1}
      overflow="hidden"
      opacity={settings.opacity}
      sx={{
        contain: 'layout paint',
        '@media (prefers-reduced-motion: reduce)': {
          opacity: Math.min(settings.opacity, 0.24),
        },
      }}
      {...props}
    >
      <Box
        ref={swimRef}
        className="poo-ocean-companion__swimmer"
        position="absolute"
        right={{ base: variant === 'speed' ? '-74px' : '-88px', md: variant === 'shadowing' ? '2%' : '5%', xl: '8%' }}
        bottom={{ base: variant === 'shadowing' ? '22%' : '18%', md: variant === 'speed' ? '18%' : '14%', xl: '12%' }}
        w={{ base: '118px', sm: '132px', md: variant === 'speed' ? '168px' : '196px', xl: variant === 'reward' ? '236px' : '220px' }}
        display={{ base: variant === 'calm' ? 'block' : 'none', sm: 'block' }}
        style={companionStyle}
        sx={{
          transform: 'scale(var(--poo-companion-scale))',
          transformOrigin: 'center',
          willChange: reducedMotion ? 'auto' : 'transform',
          // TODO: Swap this single companion for baby Poo growth states when the growth system lands.
        }}
      >
        <Image
          ref={imageRef}
          src={src}
          alt=""
          draggable={false}
          loading="eager"
          decoding="sync"
          w="100%"
          h="auto"
          display="block"
          objectFit="contain"
          userSelect="none"
          filter="drop-shadow(0 18px 28px rgba(31, 111, 214, 0.14))"
        />
      </Box>
    </Box>
  );
}
