import { useEffect, useRef, type CSSProperties } from 'react';
import { Box, Circle, HStack, Text } from '@chakra-ui/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { createBubbleLoop, createFloatLoop, safeGsapSet } from '../../lib/animations/gsap-utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

const WHALE_COLORS = {
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  whaleBlue: '#5BBCEB',
  whaleLight: '#AEE7FF',
  inactiveSoft: '#F1F5F9',
  inactiveBorder: '#CBD5E1',
  inactiveWhale: '#A8B7C7',
  inactiveWhaleDeep: '#64758A',
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  white: '#FFFFFF',
};

export type WhaleGrowthConfig = {
  mainScale: number;
  babyCount: number;
  label: 'tiny' | 'small' | 'medium' | 'large' | 'family';
};

export type WhaleMood = 'idle' | 'loading' | 'correct' | 'mistake' | 'celebrate' | 'encourage';

export type AdaptiveWhaleSceneProps = {
  streak: number;
  variant?: 'card' | 'ambient' | 'badge';
  interactive?: boolean;
  followStrength?: 'subtle' | 'normal';
  watchTarget?: 'pointer' | 'card' | 'idle';
  mood?: WhaleMood;
  inactive?: boolean;
};

export function getWhaleGrowthConfig(streak: number): WhaleGrowthConfig {
  const safeStreak = Math.max(0, Number.isFinite(streak) ? streak : 0);

  if (safeStreak >= 30) return { mainScale: 1.22, babyCount: 3, label: 'family' };
  if (safeStreak >= 14) return { mainScale: 1.16, babyCount: 2, label: 'family' };
  if (safeStreak >= 7) return { mainScale: 1.08, babyCount: 1, label: 'small' };
  if (safeStreak >= 3) return { mainScale: 1.02, babyCount: 0, label: 'small' };
  return { mainScale: 0.96, babyCount: 0, label: 'tiny' };
}

function MiniWhale({ scale = 1, opacity = 1, delay = 0, reverse = false, inactive = false }: { scale?: number; opacity?: number; delay?: number; reverse?: boolean; inactive?: boolean }) {
  return (
    <Box
      className="adaptive-whale-swim"
      position="relative"
      w="92px"
      h="58px"
      opacity={opacity}
      willChange="transform, opacity"
      data-whale-delay={delay}
    >
      <Box position="absolute" inset="0" transform={`scale(${scale}) ${reverse ? 'scaleX(-1)' : ''}`} transformOrigin="center">
        <Box
          position="absolute"
          left="2px"
          top="11px"
          w="68px"
          h="39px"
          borderRadius="58% 46% 50% 58% / 54% 56% 46% 50%"
          bgGradient={inactive ? `linear(145deg, #D8E2EC 0%, ${WHALE_COLORS.inactiveWhale} 52%, ${WHALE_COLORS.inactiveWhaleDeep} 118%)` : `linear(145deg, ${WHALE_COLORS.whaleLight} 0%, ${WHALE_COLORS.whaleBlue} 48%, ${WHALE_COLORS.deepBlue} 118%)`}
          boxShadow={inactive ? '0 12px 24px rgba(100, 117, 138, 0.12)' : '0 14px 28px rgba(31, 111, 214, 0.16)'}
          overflow="hidden"
        >
          <Box position="absolute" left="14%" bottom="7%" w="60%" h="32%" borderRadius="60% 52% 44% 58%" bg="rgba(255,255,255,0.58)" />
          <Box position="absolute" left="18%" top="18%" w="30%" h="16%" borderRadius="full" bg="rgba(255,255,255,0.22)" transform="rotate(-14deg)" />
          <Circle className="adaptive-whale-eye" position="absolute" right="15px" top="12px" size="6px" bg={WHALE_COLORS.white}>
            <Circle className="adaptive-whale-pupil" size="3px" bg={WHALE_COLORS.text} />
          </Circle>
        </Box>
        <Box position="absolute" left="27px" bottom="6px" w="23px" h="14px" bg={inactive ? WHALE_COLORS.inactiveWhaleDeep : WHALE_COLORS.deepBlue} opacity="0.32" borderRadius="70% 20% 72% 24%" transform="rotate(-16deg)" />
        <HStack className="adaptive-whale-tail" position="absolute" right="1px" top="20px" gap="0" transformOrigin="2px 50%" willChange="transform">
          <Box w="19px" h="15px" bg={inactive ? WHALE_COLORS.inactiveWhale : WHALE_COLORS.whaleBlue} borderRadius="72% 28% 70% 30%" transform="rotate(32deg)" />
          <Box ml="-8px" w="19px" h="15px" bg={inactive ? WHALE_COLORS.inactiveWhaleDeep : WHALE_COLORS.deepBlue} borderRadius="28% 72% 30% 70%" transform="rotate(-32deg)" opacity="0.82" />
        </HStack>
      </Box>
    </Box>
  );
}

function BubbleTrail({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <Circle className="adaptive-whale-bubble" position="absolute" right={compact ? '30px' : '58px'} top={compact ? '8px' : '24px'} size={compact ? '8px' : '12px'} bg="rgba(221,245,255,0.82)" border="1px solid rgba(47,158,235,0.20)" willChange="transform, opacity" />
      <Circle className="adaptive-whale-bubble" position="absolute" right={compact ? '16px' : '34px'} top={compact ? '22px' : '46px'} size={compact ? '6px' : '9px'} bg="rgba(255,255,255,0.78)" border="1px solid rgba(47,158,235,0.18)" willChange="transform, opacity" />
      <Circle className="adaptive-whale-bubble" display={{ base: compact ? 'none' : 'block', md: 'block' }} position="absolute" right={compact ? '44px' : '82px'} top={compact ? '30px' : '68px'} size={compact ? '5px' : '8px'} bg="rgba(93,190,235,0.20)" border="1px solid rgba(31,111,214,0.16)" willChange="transform, opacity" />
    </>
  );
}

function resetWhaleVars(element: HTMLElement) {
  element.style.setProperty('--whale-follow-x', '0px');
  element.style.setProperty('--whale-follow-y', '0px');
  element.style.setProperty('--whale-eye-x', '0px');
  element.style.setProperty('--whale-eye-y', '0px');
  element.style.setProperty('--whale-energy', '0');
}

export function AdaptiveWhaleScene({
  streak,
  variant = 'card',
  interactive = false,
  followStrength = 'subtle',
  watchTarget = 'pointer',
  mood = 'idle',
  inactive: inactiveProp,
}: AdaptiveWhaleSceneProps) {
  const inactive = inactiveProp ?? streak <= 0;
  const config = getWhaleGrowthConfig(streak);
  const isAmbient = variant === 'ambient';
  const isBadge = variant === 'badge';
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const family = root.querySelector('.adaptive-whale-family');
      const mainWhale = root.querySelector('.adaptive-whale-main .adaptive-whale-swim');
      const babyWhales = root.querySelectorAll('.adaptive-whale-baby');
      const bubbles = root.querySelectorAll('.adaptive-whale-bubble');
      const tails = root.querySelectorAll('.adaptive-whale-tail');
      const eyes = root.querySelectorAll('.adaptive-whale-eye');

      if (reducedMotion) {
        const reducedMotionTargets = [
          family,
          mainWhale,
          ...Array.from(babyWhales),
          ...Array.from(bubbles),
          ...Array.from(tails),
          ...Array.from(eyes),
        ].filter((target): target is Element => Boolean(target));

        resetWhaleVars(root);
        safeGsapSet(reducedMotionTargets, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
        });
        return;
      }

      createFloatLoop(family, {
        x: isAmbient ? 16 : isBadge ? 2 : 6,
        y: isAmbient ? -7 : -4,
        duration: isAmbient ? 15.5 : 8.5,
      });

      createFloatLoop(mainWhale, {
        x: isBadge ? 2 : 7,
        y: isBadge ? -3 : -7,
        rotation: isBadge ? 0.5 : 1.1,
        duration: isBadge ? 5.8 : 6.8,
      });

      if (babyWhales.length) {
        gsap.to(babyWhales, {
          y: isAmbient ? -5 : -4,
          x: isAmbient ? 6 : 3,
          scale: inactive ? 0.98 : 1.045,
          autoAlpha: inactive ? 0.72 : 0.9,
          duration: 5.4,
          stagger: 0.42,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
      }

      createBubbleLoop(bubbles, {
        y: isBadge ? -8 : -15,
        x: isBadge ? 2 : 4,
        scale: 1.06,
        duration: isBadge ? 4.8 : 6.2,
        stagger: 0.38,
      });

      gsap.to(tails, {
        rotate: inactive ? 2 : 7,
        duration: 3.8,
        stagger: 0.18,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      gsap.to(eyes, {
        scaleY: 0.16,
        transformOrigin: 'center',
        duration: 0.08,
        repeat: -1,
        repeatDelay: 5.7,
        yoyo: true,
        ease: 'power1.inOut',
      });
    },
    { scope: rootRef, dependencies: [config.babyCount, inactive, isAmbient, isBadge, reducedMotion], revertOnUpdate: true },
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !interactive || watchTarget === 'idle' || typeof window === 'undefined') return undefined;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduceMotion.matches) {
      resetWhaleVars(root);
      return undefined;
    }

    const maxFollow = followStrength === 'normal' ? 14 : 7;
    const maxEye = followStrength === 'normal' ? 1.2 : 0.8;
    const target = { x: 0, y: 0, eyeX: 0, eyeY: 0, energy: 0 };
    const current = { ...target };
    let frameId = 0;
    let active = false;

    const writeFrame = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      current.eyeX += (target.eyeX - current.eyeX) * 0.24;
      current.eyeY += (target.eyeY - current.eyeY) * 0.24;
      current.energy += (target.energy - current.energy) * 0.18;

      root.style.setProperty('--whale-follow-x', `${current.x.toFixed(2)}px`);
      root.style.setProperty('--whale-follow-y', `${current.y.toFixed(2)}px`);
      root.style.setProperty('--whale-eye-x', `${current.eyeX.toFixed(2)}px`);
      root.style.setProperty('--whale-eye-y', `${current.eyeY.toFixed(2)}px`);
      root.style.setProperty('--whale-energy', current.energy.toFixed(2));

      const isSettled = Math.abs(target.x - current.x) < 0.08 && Math.abs(target.y - current.y) < 0.08 && Math.abs(target.eyeX - current.eyeX) < 0.04 && Math.abs(target.eyeY - current.eyeY) < 0.04 && Math.abs(target.energy - current.energy) < 0.02;
      if (!isSettled || active) {
        frameId = window.requestAnimationFrame(writeFrame);
      } else {
        frameId = 0;
      }
    };

    const ensureFrame = () => {
      if (!frameId) frameId = window.requestAnimationFrame(writeFrame);
    };

    const setIdleTarget = () => {
      active = false;
      target.x = 0;
      target.y = 0;
      target.eyeX = 0;
      target.eyeY = 0;
      target.energy = 0;
      ensureFrame();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        setIdleTarget();
        return;
      }

      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const influenceX = watchTarget === 'card' ? rect.width * 2.6 : rect.width * 1.4;
      const influenceY = watchTarget === 'card' ? rect.height * 2.2 : rect.height * 1.4;

      if (Math.abs(dx) > influenceX || Math.abs(dy) > influenceY) {
        setIdleTarget();
        return;
      }

      const normalizedX = Math.max(-1, Math.min(1, dx / Math.max(rect.width / 2, 1)));
      const normalizedY = Math.max(-1, Math.min(1, dy / Math.max(rect.height / 2, 1)));
      const distance = Math.min(1, Math.hypot(normalizedX, normalizedY));

      active = true;
      target.x = normalizedX * maxFollow;
      target.y = normalizedY * maxFollow * 0.72;
      target.eyeX = normalizedX * maxEye;
      target.eyeY = normalizedY * maxEye;
      target.energy = distance;
      ensureFrame();
    };

    const onPointerLeave = () => setIdleTarget();

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (frameId) window.cancelAnimationFrame(frameId);
      resetWhaleVars(root);
    };
  }, [followStrength, interactive, watchTarget]);

  const rootStyle = {
    '--whale-follow-x': '0px',
    '--whale-follow-y': '0px',
    '--whale-eye-x': '0px',
    '--whale-eye-y': '0px',
    '--whale-energy': '0',
  } as CSSProperties;

  return (
    <Box
      ref={rootRef}
      position="relative"
      w={isBadge ? '58px' : isAmbient ? { base: '190px', md: '300px' } : { base: '138px', md: '176px' }}
      h={isBadge ? '46px' : isAmbient ? { base: '118px', md: '168px' } : { base: '104px', md: '132px' }}
      pointerEvents="none"
      aria-hidden="true"
      flexShrink={0}
      data-whale-interactive={interactive ? 'true' : 'false'}
      data-mood={mood}
      style={rootStyle}
      sx={{
        '@keyframes adaptiveWhaleBob': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(-1deg)' },
          '50%': { transform: 'translate3d(10px, -8px, 0) rotate(1.2deg)' },
        },
        '@keyframes adaptiveWhaleAmbientSwim': {
          '0%, 100%': { transform: 'translate3d(-4%, 0, 0)' },
          '50%': { transform: 'translate3d(7%, -7px, 0)' },
        },
        '@keyframes adaptiveWhaleTail': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(calc(8deg + var(--whale-energy) * 4deg))' },
        },
        '@keyframes adaptiveWhaleBlink': {
          '0%, 88%, 92%, 100%': { transform: 'scaleY(1)' },
          '90%': { transform: 'scaleY(0.12)' },
        },
        '@keyframes adaptiveBubbleRise': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)', opacity: 0.55 },
          '50%': { transform: 'translate3d(0, calc(-15px - var(--whale-energy) * 8px), 0)', opacity: 0.92 },
        },
        '@keyframes adaptiveWhaleHappyBob': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '35%': { transform: 'translate3d(0, -9px, 0) rotate(2deg)' },
          '70%': { transform: 'translate3d(0, 2px, 0) rotate(-1deg)' },
        },
        '@keyframes adaptiveWhaleConcernedDip': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '45%': { transform: 'translate3d(0, 7px, 0) rotate(-2deg)' },
        },
        '@keyframes adaptiveWhaleCelebrateBob': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '22%': { transform: 'translate3d(0, -14px, 0) rotate(2.4deg)' },
          '52%': { transform: 'translate3d(6px, -6px, 0) rotate(-1.2deg)' },
          '76%': { transform: 'translate3d(-4px, -10px, 0) rotate(1.2deg)' },
        },
        '@keyframes adaptiveWhaleEncourageNudge': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '28%': { transform: 'translate3d(-5px, -2px, 0) rotate(-1deg)' },
          '56%': { transform: 'translate3d(5px, -3px, 0) rotate(1deg)' },
          '78%': { transform: 'translate3d(0, 1px, 0) rotate(0deg)' },
        },
        '.adaptive-whale-follow': {
          transform: 'translate3d(var(--whale-follow-x), var(--whale-follow-y), 0)',
          transition: 'transform 180ms ease-out',
          willChange: interactive ? 'transform' : undefined,
        },
        '.adaptive-whale-pupil': {
          transform: 'translate3d(var(--whale-eye-x), var(--whale-eye-y), 0)',
          transition: 'transform 160ms ease-out',
        },
        '.adaptive-whale-bubble': {
          animationDuration: 'calc(6.2s - var(--whale-energy) * 1.2s)',
        },
        '&[data-mood="loading"] .adaptive-whale-mood': {
          animation: 'adaptiveWhaleHappyBob 4.8s ease-in-out infinite',
        },
        '&[data-mood="correct"] .adaptive-whale-mood': {
          animation: 'adaptiveWhaleHappyBob 920ms ease-out 1',
          filter: 'drop-shadow(0 10px 18px rgba(47, 158, 235, 0.18))',
        },
        '&[data-mood="mistake"] .adaptive-whale-mood': {
          animation: 'adaptiveWhaleConcernedDip 900ms ease-out 1',
          filter: 'drop-shadow(0 8px 14px rgba(14, 116, 144, 0.10))',
        },
        '&[data-mood="encourage"] .adaptive-whale-mood': {
          animation: 'adaptiveWhaleEncourageNudge 1.15s ease-in-out 1',
          filter: 'drop-shadow(0 8px 16px rgba(91, 188, 235, 0.14))',
        },
        '&[data-mood="celebrate"] .adaptive-whale-mood': {
          animation: 'adaptiveWhaleCelebrateBob 1.35s ease-out 1',
          filter: 'drop-shadow(0 12px 24px rgba(47, 158, 235, 0.20))',
        },
        '&[data-mood="correct"] .adaptive-whale-bubble, &[data-mood="encourage"] .adaptive-whale-bubble, &[data-mood="celebrate"] .adaptive-whale-bubble': {
          boxShadow: '0 0 0 3px rgba(93, 190, 235, 0.12)',
          opacity: 0.98,
        },
        '&[data-mood="encourage"] .adaptive-whale-bubble': {
          animationDuration: '4.8s',
        },
        '&[data-mood="celebrate"] .adaptive-whale-bubble': {
          animationDuration: '3.9s',
        },
        '&[data-mood="mistake"] .adaptive-whale-eye': {
          animationDuration: '1.4s',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.adaptive-whale-swim, .adaptive-whale-family, .adaptive-whale-tail, .adaptive-whale-eye, .adaptive-whale-bubble, .adaptive-whale-mood': {
            animation: 'none !important',
          },
          '.adaptive-whale-follow, .adaptive-whale-pupil': {
            transform: 'translate3d(0, 0, 0) !important',
            transition: 'none !important',
          },
        },
      }}
    >
      <Box className="adaptive-whale-mood" position="absolute" inset="0">
        <Box className="adaptive-whale-follow" position="absolute" inset="0">
          <Box
            className="adaptive-whale-family"
            position="absolute"
            inset="0"
            willChange="transform"
          >
            <Box
              className="adaptive-whale-main"
              position="absolute"
              left={isBadge ? '-18px' : isAmbient ? { base: '20px', md: '54px' } : { base: '20px', md: '34px' }}
              top={isBadge ? '-10px' : isAmbient ? { base: '28px', md: '36px' } : { base: '24px', md: '28px' }}
            >
              <MiniWhale scale={isBadge ? 0.62 : config.mainScale} opacity={inactive ? (isAmbient ? 0.3 : 0.72) : isAmbient ? 0.45 : 1} delay={0} inactive={inactive} />
            </Box>

            {Array.from({ length: config.babyCount }).map((_, index) => (
              <Box
                key={index}
                className="adaptive-whale-baby"
                position="absolute"
                willChange="transform, opacity"
                left={isAmbient ? `${22 + index * 54}px` : `${4 + index * 36}px`}
                top={isAmbient ? `${78 + (index % 2) * 22}px` : `${74 + (index % 2) * 12}px`}
                display={index > 1 ? { base: 'none', md: 'block' } : 'block'}
              >
                <MiniWhale scale={isAmbient ? 0.42 : 0.38} opacity={inactive ? 0.24 : isAmbient ? 0.32 : 0.72} delay={index + 1} reverse={index % 2 === 1} inactive={inactive} />
              </Box>
            ))}
          </Box>
          <BubbleTrail compact={isBadge} />
        </Box>
      </Box>
    </Box>
  );
}

export function StreakWhaleBadge({ streak, compact = false }: { streak: number; compact?: boolean }) {
  const inactive = streak <= 0;
  return (
    <HStack
      px={compact ? '2.5' : '3'}
      py={compact ? '1' : '1.5'}
      borderRadius="full"
      bg={inactive ? 'rgba(241, 245, 249, 0.92)' : 'rgba(232, 244, 255, 0.88)'}
      border="1px solid"
      borderColor={inactive ? 'rgba(148, 163, 184, 0.34)' : 'rgba(47, 158, 235, 0.24)'}
      gap={compact ? '1' : '1.5'}
      boxShadow={inactive ? '0 8px 18px rgba(100, 117, 138, 0.06)' : '0 10px 22px rgba(47, 158, 235, 0.08)'}
    >
      <Box w={compact ? '26px' : '30px'} h={compact ? '20px' : '24px'} overflow="hidden" flexShrink={0}>
        <AdaptiveWhaleScene streak={streak} variant="badge" inactive={inactive} />
      </Box>
      <Text fontWeight="800" fontSize={compact ? 'xs' : 'sm'} color={inactive ? WHALE_COLORS.inactiveWhaleDeep : WHALE_COLORS.deepBlue}>{streak}</Text>
    </HStack>
  );
}

export function StreakOceanDots({ days = 7, activeIndex = 0, inactive = false }: { days?: number; activeIndex?: number; inactive?: boolean }) {
  return (
    <HStack justify="space-between" w="100%">
      {Array.from({ length: days }).map((_, index) => {
        const active = !inactive && index === activeIndex;
        return (
          <Circle
            key={index}
            size="32px"
            bg={active ? WHALE_COLORS.white : inactive ? 'rgba(226,232,240,0.72)' : 'rgba(255,255,255,0.54)'}
            border="1px solid"
            borderColor={active ? WHALE_COLORS.oceanBlue : inactive ? 'rgba(148,163,184,0.34)' : 'rgba(47,158,235,0.18)'}
            boxShadow={active ? '0 8px 18px rgba(47, 158, 235, 0.14)' : 'none'}
          >
            {active ? <Box w="16px" h="10px" borderRadius="58% 46% 50% 58%" bg={WHALE_COLORS.whaleBlue} /> : null}
            {inactive ? <Box w="10px" h="6px" borderRadius="58% 46% 50% 58%" bg="rgba(100,117,138,0.32)" /> : null}
          </Circle>
        );
      })}
    </HStack>
  );
}
