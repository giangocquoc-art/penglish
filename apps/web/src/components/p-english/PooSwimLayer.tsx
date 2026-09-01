import { useMemo, useRef } from 'react';
import { Box, Image, type BoxProps } from '@chakra-ui/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { getDailyRewardState, getWaterStreak } from '../../lib/p-english/daily-rewards';
import { getOceanMascotPose } from '../../lib/p-english/oceanAssets';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP);

export type PooSwimLayerProps = Omit<BoxProps, 'children'> & {
  streak?: number;
  mode?: 'fixed' | 'absolute';
  showBabies?: boolean;
};

function getSafeStreak(streak?: number) {
  if (typeof streak === 'number' && Number.isFinite(streak)) return Math.max(0, streak);
  try {
    return getWaterStreak(getDailyRewardState()).current;
  } catch {
    return 0;
  }
}

export function PooSwimLayer({ streak, mode = 'absolute', showBabies = true, className, ...props }: PooSwimLayerProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const safeStreak = getSafeStreak(streak);
  const babyCount = showBabies ? Math.min(3, Math.max(0, Math.floor(safeStreak / 3))) : 0;
  const pooSrc = useMemo(() => getOceanMascotPose('poo', 'idle'), []);
  const babySrc = useMemo(() => getOceanMascotPose('poo', 'happy'), []);

  useGSAP(
    () => {
      const layer = layerRef.current;
      if (!layer) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          desktop: '(min-width: 768px)',
        },
        (context) => {
          const reduceMotion = Boolean(context.conditions?.reduceMotion);
          const desktop = Boolean(context.conditions?.desktop);
          const poo = layer.querySelector('.poo-swim-layer__main');
          const babies = layer.querySelectorAll('.poo-swim-layer__baby');

          if (reduceMotion) {
            gsap.set(poo, { x: 0, y: 0, rotation: 0, autoAlpha: desktop ? 0.32 : 0.22 });
            gsap.set(babies, { x: 0, y: 0, rotation: 0, autoAlpha: desktop ? 0.2 : 0.12 });
            return undefined;
          }

          if (poo) {
            gsap.fromTo(
              poo,
              { x: desktop ? 26 : 12, y: desktop ? 8 : 4, rotation: -2, autoAlpha: desktop ? 0.26 : 0.18 },
              { x: desktop ? -54 : -24, y: desktop ? -12 : -7, rotation: 3, autoAlpha: desktop ? 0.34 : 0.26, duration: desktop ? 28 : 24, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true },
            );
          }

          if (babies.length > 0) {
            gsap.fromTo(
              babies,
              { x: (index) => index * -8, y: (index) => index * 4, rotation: -3, autoAlpha: desktop ? 0.12 : 0.08 },
              { x: (index) => (desktop ? -28 : -14) + index * -6, y: (index) => -6 + index * 3, rotation: 4, autoAlpha: desktop ? 0.2 : 0.13, duration: desktop ? 18 : 14, stagger: { each: 0.9, from: 'start' }, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true },
            );
          }

          return undefined;
        },
      );

      return () => mm.revert();
    },
    { scope: layerRef, dependencies: [babyCount] },
  );

  return (
    <Box
      ref={layerRef}
      data-testid="poo-swim-layer"
      className={['poo-swim-layer', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      position={mode}
      inset="0"
      pointerEvents="none"
      zIndex={1}
      overflow="hidden"
      {...props}
    >
      <Box
        className="poo-swim-layer__main"
        position="absolute"
        right={{ base: '18px', sm: '24px', md: '4vw', xl: '8vw' }}
        top={{ base: '92px', md: '17vh' }}
        w={{ base: '76px', sm: '88px', md: '124px', xl: '148px' }}
        opacity={{ base: 0.22, md: 0.32 }}
        filter="drop-shadow(0 14px 24px rgba(31,111,214,0.11))"
        willChange="transform, opacity"
        sx={{ '@media (prefers-reduced-motion: reduce)': { transform: 'none !important' } }}
      >
        <Image src={pooSrc} alt="" draggable={false} loading="eager" decoding="sync" w="100%" h="auto" userSelect="none" />
      </Box>

      {Array.from({ length: babyCount }).map((_, index) => (
        <Box
          key={index}
          className="poo-swim-layer__baby"
          position="absolute"
          right={{ base: `${72 + index * 18}px`, md: `${118 + index * 26}px` }}
          top={{ base: `${172 + index * 28}px`, md: `${31 + index * 6}vh` }}
          w={{ base: '30px', md: '42px', xl: '48px' }}
          opacity={{ base: 0.1, md: 0.16 }}
          filter="drop-shadow(0 10px 16px rgba(31,111,214,0.08))"
          willChange="transform, opacity"
          display={index > 0 ? { base: 'none', md: 'block' } : 'block'}
          sx={{ '@media (prefers-reduced-motion: reduce)': { transform: 'none !important' } }}
        >
          <Image src={babySrc} alt="" draggable={false} loading="lazy" decoding="async" w="100%" h="auto" userSelect="none" />
        </Box>
      ))}
    </Box>
  );
}
