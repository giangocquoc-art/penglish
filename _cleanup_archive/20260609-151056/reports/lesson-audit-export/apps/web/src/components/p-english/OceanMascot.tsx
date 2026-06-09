import { useState, type CSSProperties } from 'react';
import { Box, Image, type BoxProps } from '@chakra-ui/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getOceanMascotPose, oceanMascots, type OceanMascotName, type OceanMascotPoseName } from '../../lib/p-english/oceanAssets';

export type OceanMascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero';
export type OceanMascotMotion = 'none' | 'float' | 'pulse' | 'celebrate' | 'swim';

export type OceanMascotProps<TMascot extends OceanMascotName = OceanMascotName> = Omit<BoxProps, 'size'> & {
  mascot: TMascot;
  size?: OceanMascotSize;
  decorative?: boolean;
  alt?: string;
  motion?: OceanMascotMotion;
  pose?: OceanMascotPoseName<TMascot>;
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

export function OceanMascot<TMascot extends OceanMascotName>({ mascot, size = 'md', decorative = false, alt, motion = 'float', pose, className, ...props }: OceanMascotProps<TMascot>) {
  const [hidden, setHidden] = useState(false);
  const reducedMotion = useReducedMotion();
  const asset = oceanMascots[mascot];

  if (!asset || hidden) return null;

  const resolvedAlt = decorative ? '' : alt ?? asset.alt;
  const resolvedMotion = reducedMotion ? 'none' : motion;
  const resolvedPose = pose ?? asset.defaultPose;
  const src = getOceanMascotPose(mascot, resolvedPose as OceanMascotPoseName<TMascot>);

  return (
    <Box
      className={['ocean-mascot', motionClass[resolvedMotion], className].filter(Boolean).join(' ')}
      w={sizeMap[size]}
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
        src={src}
        alt={resolvedAlt}
        draggable={false}
        loading="eager"
        decoding="sync"
        onError={() => setHidden(true)}
        w="100%"
        h="auto"
        display="block"
        objectFit="contain"
        userSelect="none"
        filter="drop-shadow(0 16px 24px rgba(31, 111, 214, 0.12))"
      />
    </Box>
  );
}
