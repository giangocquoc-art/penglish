import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { OceanMascot } from './OceanMascot';
import { oceanBackgrounds, type OceanBackgroundVariant } from '../../lib/p-english/oceanAssets';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const OCEAN_TOKENS = {
  bg: '#F6FCFF',
  surface: 'rgba(255, 255, 255, 0.72)',
  surfaceStrong: 'rgba(255, 255, 255, 0.82)',
  border: 'rgba(148, 202, 232, 0.42)',
  borderStrong: 'rgba(91, 188, 235, 0.38)',
  text: '#102A43',
  muted: '#52667A',
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  whaleBlue: '#5BBCEB',
  foam: '#FFFFFF',
  warm: '#FFF3C4',
  shadow: '0 20px 60px rgba(31, 111, 214, 0.09)',
  shadowSoft: '0 12px 34px rgba(16, 42, 67, 0.055)',
};

export function glassPanelProps(props: BoxProps = {}): BoxProps {
  return {
    bg: OCEAN_TOKENS.surface,
    border: '1px solid',
    borderColor: OCEAN_TOKENS.border,
    borderRadius: '28px',
    boxShadow: OCEAN_TOKENS.shadowSoft,
    backdropFilter: 'blur(14px) saturate(1.1)',
    ...props,
  };
}

export function GlassPanel({ children, ...props }: BoxProps) {
  return (
    <Box {...glassPanelProps(props)}>
      {children}
    </Box>
  );
}

const routeBackgrounds: Array<{ test: (pathname: string) => boolean; variant: OceanBackgroundVariant }> = [
  { test: (pathname) => pathname.startsWith('/shadowing'), variant: 'shadowing' },
  { test: (pathname) => pathname.startsWith('/english-speed'), variant: 'speed' },
  { test: (pathname) => pathname.startsWith('/words') || pathname.startsWith('/vocabularies'), variant: 'vocab' },
  { test: (pathname) => pathname.startsWith('/learning-path'), variant: 'roadmap' },
  { test: (pathname) => pathname.startsWith('/home'), variant: 'dashboard' },
];

function getBackgroundVariant(pathname: string): OceanBackgroundVariant {
  return routeBackgrounds.find((entry) => entry.test(pathname))?.variant ?? 'dashboard';
}

export function OceanBackdrop({ children }: { children: ReactNode }) {
  const location = useLocation();
  const variant = getBackgroundVariant(location.pathname);

  return (
    <Box className="penglish-ocean-shell" position="relative" minH="100vh" bg={OCEAN_TOKENS.bg} overflowX="clip">
      <Box
        className="penglish-ocean-background"
        aria-hidden="true"
        position="fixed"
        inset="0"
        pointerEvents="none"
        zIndex="0"
        bgImage={`linear-gradient(180deg, rgba(255,255,255,0.66), rgba(232,248,255,0.76)), url(${oceanBackgrounds[variant]})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      />
      <Box
        aria-hidden="true"
        position="fixed"
        inset="0"
        pointerEvents="none"
        zIndex="0"
        opacity="0.82"
        bg="radial-gradient(circle at 82% 8%, rgba(91, 188, 235, 0.22), transparent 26%), radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.78), transparent 24%), radial-gradient(circle at 58% 92%, rgba(31, 111, 214, 0.11), transparent 30%)"
      />
      <Box
        aria-hidden="true"
        position="fixed"
        inset="0"
        pointerEvents="none"
        zIndex="0"
        opacity="0.28"
        sx={{
          backgroundImage:
            'linear-gradient(120deg, transparent 0 44%, rgba(255,255,255,.52) 45%, transparent 47% 100%), linear-gradient(150deg, transparent 0 52%, rgba(91,188,235,.22) 53%, transparent 55% 100%)',
          backgroundSize: '320px 180px, 420px 220px',
          backgroundPosition: '0 0, 90px 120px',
        }}
      />
      <Box position="relative" zIndex="1" minH="100vh">
        {children}
      </Box>
    </Box>
  );
}

export function WhaleCompanion({ streak = 1 }: { streak?: number }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || typeof window === 'undefined') return undefined;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduceMotion.matches) return undefined;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.075;
      current.y += (target.y - current.y) * 0.075;
      root.style.setProperty('--z1-whale-x', `${current.x.toFixed(2)}px`);
      root.style.setProperty('--z1-whale-y', `${current.y.toFixed(2)}px`);
      if (Math.abs(target.x - current.x) > 0.08 || Math.abs(target.y - current.y) > 0.08) {
        frame = window.requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const ensure = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 18;
      const y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 10;
      target.x = Math.max(-9, Math.min(9, x));
      target.y = Math.max(-5, Math.min(5, y));
      ensure();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
      root.style.setProperty('--z1-whale-x', '0px');
      root.style.setProperty('--z1-whale-y', '0px');
    };
  }, [reducedMotion]);

  return (
    <Box
      className="poo-background-swim"
      ref={rootRef}
      aria-hidden="true"
      position="fixed"
      right={{ base: '-54px', md: '-18px', xl: '24px' }}
      bottom={{ base: '96px', md: '42px' }}
      w={{ base: '150px', md: '210px' }}
      pointerEvents="none"
      zIndex="0"
      opacity={{ base: 0.16, md: 0.24 }}
      style={{
        '--z1-whale-x': '0px',
        '--z1-whale-y': '0px',
        transform: 'translate3d(var(--z1-whale-x), var(--z1-whale-y), 0)',
      } as CSSProperties}
      sx={{
        transition: 'transform 420ms ease-out',
        '@media (prefers-reduced-motion: reduce)': {
          transform: 'none !important',
          transition: 'none !important',
        },
      }}
    >
      <OceanMascot mascot="poo" pose="idle" size="hero" decorative motion="swim" />
    </Box>
  );
}
