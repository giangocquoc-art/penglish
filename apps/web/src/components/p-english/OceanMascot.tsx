import { useEffect, useState, type CSSProperties } from 'react';
import { Box, Image, type BoxProps } from '@chakra-ui/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getOceanMascotFallbackPose, getOceanMascotPose, oceanMascots, type OceanMascotName, type OceanMascotPoseName } from '../../lib/p-english/oceanAssets';

export type OceanMascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero';
export type OceanMascotMotion = 'none' | 'float' | 'pulse' | 'celebrate' | 'swim';

export type OceanMascotProps<TMascot extends OceanMascotName = OceanMascotName> = Omit<BoxProps, 'size'> & {
  mascot: TMascot;
  size?: OceanMascotSize;
  decorative?: boolean;
  alt?: string;
  motion?: OceanMascotMotion;
  pose?: OceanMascotPoseName<TMascot>;
  imageLoading?: 'eager' | 'lazy';
};

const sizeMap: Record<OceanMascotSize, BoxProps['w']> = {
  xs: { base: '42px', md: '48px' },
  sm: { base: '58px', md: '72px' },
  md: { base: '84px', md: '108px' },
  lg: { base: '118px', md: '152px' },
  hero: { base: '150px', md: '220px', xl: '260px' },
};

const motionClass: Record<OceanMascotMotion, string> = {
  none: '',
  float: 'ocean-mascot-float',
  pulse: 'ocean-mascot-pulse',
  celebrate: 'ocean-mascot-celebrate',
  swim: 'ocean-mascot-swim',
};

export function OceanMascot<TMascot extends OceanMascotName>({ mascot, size = 'md', decorative = false, alt, motion = 'float', pose, imageLoading = 'lazy', className, ...props }: OceanMascotProps<TMascot>) {
  const [hidden, setHidden] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const reducedMotion = useReducedMotion();
  const asset = oceanMascots[mascot];
  const resolvedAlt = decorative ? '' : alt ?? asset.alt;
  const resolvedMotion = reducedMotion ? 'none' : motion;
  const resolvedPose = pose ?? asset.defaultPose;
  const src = getOceanMascotPose(mascot, resolvedPose as OceanMascotPoseName<TMascot>);
  const fallbackSrc = getOceanMascotFallbackPose(mascot, resolvedPose as OceanMascotPoseName<TMascot>);
  const hasBubbleEffect = mascot === 'botBien' && resolvedMotion !== 'none';

  useEffect(() => {
    setHidden(false);
    setUsingFallback(false);
  }, [src]);

  if (!asset || hidden) return null;

  return (
    <Box
      className={['ocean-mascot', motionClass[resolvedMotion], className].filter(Boolean).join(' ')}
      w={sizeMap[size]}
      position="relative"
      flexShrink={0}
      pointerEvents={decorative ? 'none' : props.pointerEvents}
      aria-hidden={decorative ? true : undefined}
      style={{ '--ocean-mascot-delay': `${(mascot.length % 5) * 0.18}s` } as CSSProperties}
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none !important',
          transform: 'none !important',
        },
      }}
      {...props}
    >
      <Image
        src={usingFallback && fallbackSrc ? fallbackSrc : src}
        alt={resolvedAlt}
        draggable={false}
        loading={imageLoading}
        decoding="async"
        onError={() => {
          if (!usingFallback && fallbackSrc) setUsingFallback(true);
          else setHidden(true);
        }}
        w="100%"
        h="auto"
        display="block"
        objectFit="contain"
        userSelect="none"
        filter="drop-shadow(0 16px 24px rgba(31, 111, 214, 0.12))"
      />
      {hasBubbleEffect ? (
        <Box className="ocean-mascot-bubbles" aria-hidden="true">
          <span className="ocean-mascot-bubble ocean-mascot-bubble-one" />
          <span className="ocean-mascot-bubble ocean-mascot-bubble-two" />
          <span className="ocean-mascot-bubble ocean-mascot-bubble-three" />
        </Box>
      ) : null}
    </Box>
  );
}
