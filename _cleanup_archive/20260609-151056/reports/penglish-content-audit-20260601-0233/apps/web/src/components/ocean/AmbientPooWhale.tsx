import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Image, Text, type BoxProps } from '@chakra-ui/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export type AmbientPooWhalePresetName = 'dashboard' | 'roadmap' | 'lesson' | 'speed' | 'shadowing' | 'vocabulary';

type AmbientWhaleMotionPreset = {
  desktopStartX: number;
  desktopEndX: number;
  mobileStartX: number;
  mobileEndX: number;
  desktopY: number;
  mobileY: number;
  desktopBob: number;
  mobileBob: number;
  desktopRotationStart: number;
  desktopRotationEnd: number;
  mobileRotationStart: number;
  mobileRotationEnd: number;
  desktopDuration: number;
  mobileDuration: number;
};

type AmbientWhaleRoutePreset = {
  label: string;
  display: BoxProps['display'];
  right: BoxProps['right'];
  top?: BoxProps['top'];
  bottom?: BoxProps['bottom'];
  width: BoxProps['w'];
  opacity: BoxProps['opacity'];
  reducedMotionOpacity: BoxProps['opacity'];
  debugOpacity: BoxProps['opacity'];
  motion: AmbientWhaleMotionPreset;
};

export type AmbientPooWhaleProps = Omit<BoxProps, 'children'> & {
  frameCount?: number;
  frameIntervalMs?: number;
  preset?: AmbientPooWhalePresetName;
};

const DEFAULT_FRAME_COUNT = 16;
const DEFAULT_FRAME_INTERVAL_MS = 150;
const FRAME_BASE_PATH = '/ocean/ambient-whale/frames';

export const AMBIENT_WHALE_ROUTE_PRESETS: Record<AmbientPooWhalePresetName, AmbientWhaleRoutePreset> = {
  dashboard: {
    label: 'dashboard · subtle lower-side ambient waterline',
    display: { base: 'none', md: 'block' },
    right: { md: '2vw', lg: '4vw', xl: '6vw' },
    top: { md: '68vh', lg: '70vh', xl: '72vh' },
    width: { md: '96px', lg: '116px', xl: '132px' },
    opacity: { md: 0.04, lg: 0.055 },
    reducedMotionOpacity: { md: 0.035, lg: 0.045 },
    debugOpacity: { md: 0.42, lg: 0.48 },
    motion: {
      desktopStartX: 18,
      desktopEndX: -6,
      mobileStartX: 0,
      mobileEndX: 0,
      desktopY: 10,
      mobileY: 0,
      desktopBob: 8,
      mobileBob: 0,
      desktopRotationStart: -1.2,
      desktopRotationEnd: 1.4,
      mobileRotationStart: 0,
      mobileRotationEnd: 0,
      desktopDuration: 58,
      mobileDuration: 58,
    },
  },
  roadmap: {
    label: 'roadmap · faint lower-right ocean background',
    display: { base: 'none', md: 'block' },
    right: { md: '2vw', lg: '4vw', xl: '6vw' },
    top: { md: '68vh', lg: '70vh', xl: '72vh' },
    width: { md: '96px', lg: '116px', xl: '132px' },
    opacity: { md: 0.035, lg: 0.05 },
    reducedMotionOpacity: { md: 0.03, lg: 0.04 },
    debugOpacity: { md: 0.38, lg: 0.46 },
    motion: {
      desktopStartX: 16,
      desktopEndX: -6,
      mobileStartX: 0,
      mobileEndX: 0,
      desktopY: 8,
      mobileY: 0,
      desktopBob: 7,
      mobileBob: 0,
      desktopRotationStart: -1.2,
      desktopRotationEnd: 1.2,
      mobileRotationStart: 0,
      mobileRotationEnd: 0,
      desktopDuration: 60,
      mobileDuration: 60,
    },
  },
  lesson: {
    label: 'lesson · disabled to keep lesson controls visually dominant',
    display: 'none',
    right: { md: '3vw', lg: '5vw', xl: '7vw' },
    bottom: { md: '8vh', lg: '9vh', xl: '10vh' },
    width: { md: '108px', lg: '132px', xl: '148px' },
    opacity: { md: 0.035, lg: 0.045 },
    reducedMotionOpacity: { md: 0.04, lg: 0.055 },
    debugOpacity: { md: 0.38, lg: 0.46 },
    motion: {
      desktopStartX: 16,
      desktopEndX: -6,
      mobileStartX: 0,
      mobileEndX: 0,
      desktopY: 5,
      mobileY: 0,
      desktopBob: 6,
      mobileBob: 0,
      desktopRotationStart: -1,
      desktopRotationEnd: 1.2,
      mobileRotationStart: 0,
      mobileRotationEnd: 0,
      desktopDuration: 60,
      mobileDuration: 60,
    },
  },
  speed: {
    label: 'speed · disabled to avoid competing with English Speed hero mascot and metric cards',
    display: 'none',
    right: { md: '2vw', lg: '4vw', xl: '6vw' },
    top: { md: '70vh', lg: '72vh', xl: '74vh' },
    width: { md: '96px', lg: '118px', xl: '132px' },
    opacity: { md: 0.03, lg: 0.04 },
    reducedMotionOpacity: { base: 0.035, md: 0.03, lg: 0.04 },
    debugOpacity: { base: 0.2, md: 0.4, lg: 0.48 },
    motion: {
      desktopStartX: 18,
      desktopEndX: -6,
      mobileStartX: 0,
      mobileEndX: -2,
      desktopY: 7,
      mobileY: 1,
      desktopBob: 7,
      mobileBob: 2,
      desktopRotationStart: -1.2,
      desktopRotationEnd: 1.4,
      mobileRotationStart: -0.5,
      mobileRotationEnd: 0.5,
      desktopDuration: 56,
      mobileDuration: 48,
    },
  },
  shadowing: {
    label: 'shadowing · disabled to avoid competing with transcript controls',
    display: 'none',
    right: { md: '2vw', lg: '4vw', xl: '6vw' },
    top: { md: '70vh', lg: '72vh', xl: '74vh' },
    width: { md: '104px', lg: '128px', xl: '148px' },
    opacity: { md: 0.035, lg: 0.045 },
    reducedMotionOpacity: { md: 0.04, lg: 0.055 },
    debugOpacity: { md: 0.38, lg: 0.46 },
    motion: {
      desktopStartX: 16,
      desktopEndX: -6,
      mobileStartX: 0,
      mobileEndX: 0,
      desktopY: 7,
      mobileY: 0,
      desktopBob: 7,
      mobileBob: 0,
      desktopRotationStart: -1,
      desktopRotationEnd: 1.2,
      mobileRotationStart: 0,
      mobileRotationEnd: 0,
      desktopDuration: 58,
      mobileDuration: 58,
    },
  },
  vocabulary: {
    label: 'vocabulary · faint lower-side background',
    display: { base: 'none', md: 'block' },
    right: { md: '2vw', lg: '4vw', xl: '6vw' },
    top: { md: '70vh', lg: '72vh', xl: '74vh' },
    width: { md: '100px', lg: '120px', xl: '136px' },
    opacity: { md: 0.035, lg: 0.05 },
    reducedMotionOpacity: { md: 0.03, lg: 0.04 },
    debugOpacity: { md: 0.38, lg: 0.46 },
    motion: {
      desktopStartX: 16,
      desktopEndX: -6,
      mobileStartX: 0,
      mobileEndX: 0,
      desktopY: 6,
      mobileY: 0,
      desktopBob: 6,
      mobileBob: 0,
      desktopRotationStart: -1,
      desktopRotationEnd: 1.2,
      mobileRotationStart: 0,
      mobileRotationEnd: 0,
      desktopDuration: 58,
      mobileDuration: 58,
    },
  },
};

function getFramePath(index: number) {
  return `${FRAME_BASE_PATH}/frame-${String(index).padStart(2, '0')}.png`;
}

function readDebugPoo() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debugPoo') === '1';
}

export function AmbientPooWhale({ frameCount = DEFAULT_FRAME_COUNT, frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS, preset = 'dashboard', className, ...props }: AmbientPooWhaleProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const whaleRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [activeFrame, setActiveFrame] = useState(0);
  const [debugPoo, setDebugPoo] = useState(readDebugPoo);
  const activePreset = AMBIENT_WHALE_ROUTE_PRESETS[preset] ?? AMBIENT_WHALE_ROUTE_PRESETS.dashboard;

  const frames = useMemo(() => Array.from({ length: Math.max(1, frameCount) }, (_, index) => getFramePath(index)), [frameCount]);

  useEffect(() => {
    const syncDebugState = () => setDebugPoo(readDebugPoo());
    window.addEventListener('popstate', syncDebugState);
    window.addEventListener('hashchange', syncDebugState);
    return () => {
      window.removeEventListener('popstate', syncDebugState);
      window.removeEventListener('hashchange', syncDebugState);
    };
  }, []);

  useEffect(() => {
    setDebugPoo(readDebugPoo());
  }, [preset]);

  useEffect(() => {
    if (reducedMotion || frames.length <= 1) {
      setActiveFrame(0);
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % frames.length);
    }, Math.max(120, Math.min(180, frameIntervalMs)));

    return () => window.clearInterval(interval);
  }, [frameIntervalMs, frames.length, reducedMotion]);

  useGSAP(
    () => {
      const whale = whaleRef.current;
      if (!whale) return undefined;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          desktop: '(min-width: 768px)',
        },
        (context) => {
          const reduceMotion = Boolean(context.conditions?.reduceMotion);
          const desktop = Boolean(context.conditions?.desktop);
          const motion = activePreset.motion;
          const debugOpacity = desktop ? 0.52 : 0.28;

          if (reduceMotion) {
            gsap.set(whale, {
              xPercent: desktop ? motion.desktopEndX * 0.35 : motion.mobileEndX * 0.35,
              y: 0,
              rotation: desktop ? motion.desktopRotationStart * 0.5 : motion.mobileRotationStart * 0.5,
              scale: 1,
              ...(debugPoo ? { autoAlpha: debugOpacity } : { clearProps: 'opacity,visibility' }),
            });
            return undefined;
          }

          gsap.set(whale, {
            xPercent: desktop ? motion.desktopStartX : motion.mobileStartX,
            y: desktop ? motion.desktopY : motion.mobileY,
            rotation: desktop ? motion.desktopRotationStart : motion.mobileRotationStart,
            ...(debugPoo ? { autoAlpha: debugOpacity } : { clearProps: 'opacity,visibility' }),
          });

          const swimTween = gsap.to(whale, {
            xPercent: desktop ? motion.desktopEndX : motion.mobileEndX,
            y: desktop ? -motion.desktopY : -motion.mobileY,
            rotation: desktop ? motion.desktopRotationEnd : motion.mobileRotationEnd,
            ...(debugPoo ? { autoAlpha: debugOpacity } : {}),
            duration: desktop ? motion.desktopDuration : motion.mobileDuration,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            force3D: true,
          });

          const bobTween = gsap.to(whale, {
            y: desktop ? `+=${motion.desktopBob}` : `+=${motion.mobileBob}`,
            rotation: desktop ? '-=1.4' : '-=0.7',
            duration: desktop ? 8.5 : 7,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            force3D: true,
          });

          return () => {
            swimTween.kill();
            bobTween.kill();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [activePreset, debugPoo, reducedMotion], revertOnUpdate: true },
  );

  return (
    <Box
      ref={rootRef}
      aria-hidden="true"
      data-testid="ambient-poo-whale"
      data-ambient-whale-preset={preset}
      data-debug-poo={debugPoo ? 'true' : 'false'}
      className={['ambient-poo-whale', className].filter(Boolean).join(' ')}
      position="absolute"
      inset="0"
      zIndex={1}
      pointerEvents="none"
      overflow="hidden"
      {...props}
    >
      <Box
        ref={whaleRef}
        className="ambient-poo-whale__swimmer"
        position="absolute"
        display={activePreset.display}
        right={activePreset.right}
        top={activePreset.top}
        bottom={activePreset.bottom}
        w={activePreset.width}
        maxW={{ base: '64px', md: '140px' }}
        opacity={debugPoo ? activePreset.debugOpacity : activePreset.opacity}
        sx={{
          contain: 'layout paint',
          transformOrigin: 'center',
          willChange: reducedMotion ? 'auto' : 'transform, opacity',
          mixBlendMode: 'multiply',
          '@media (max-width: 360px)': {
            display: 'none',
          },
          '@media (prefers-reduced-motion: reduce)': {
            opacity: debugPoo ? activePreset.debugOpacity : activePreset.reducedMotionOpacity,
          },
        }}
      >
        <Image
          src={reducedMotion ? frames[0] : frames[activeFrame]}
          alt=""
          draggable={false}
          loading="eager"
          decoding="async"
          w="100%"
          h="auto"
          display="block"
          objectFit="contain"
          userSelect="none"
          filter="drop-shadow(0 18px 26px rgba(31, 111, 214, 0.08))"
        />
        {debugPoo ? (
          <Text
            position="absolute"
            top="-28px"
            right="0"
            px="2"
            py="1"
            borderRadius="full"
            bg="rgba(16, 42, 67, 0.78)"
            color="white"
            fontSize="10px"
            fontWeight="900"
            whiteSpace="nowrap"
            letterSpacing="0.02em"
          >
            Poo preset: {activePreset.label}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}
