import { forwardRef } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';
import { oceanBackgrounds, type OceanBackgroundVariant } from '../../lib/p-english/oceanAssets';
import { PooOceanCompanion, type PooOceanCompanionVariant } from './PooOceanCompanion';

export type OceanPageShellProps = BoxProps & {
  variant: OceanBackgroundVariant;
  overlayStrength?: 'soft' | 'medium' | 'strong';
  showPooCompanion?: boolean;
  pooCompanionVariant?: PooOceanCompanionVariant;
  glassIntensity?: 'solid' | 'soft' | 'clear';
};

const overlayByStrength = {
  soft: 'linear-gradient(180deg, rgba(255,255,255,0.48), rgba(236,248,255,0.58))',
  medium: 'linear-gradient(180deg, rgba(255,255,255,0.62), rgba(232,246,255,0.72))',
  strong: 'linear-gradient(180deg, rgba(255,255,255,0.76), rgba(232,246,255,0.84))',
} as const;

export const OceanPageShell = forwardRef<HTMLDivElement, OceanPageShellProps>(function OceanPageShell({ variant, overlayStrength = 'medium', showPooCompanion = true, pooCompanionVariant = 'calm', glassIntensity = 'soft', children, className, ...props }, ref) {
  return (
    <Box
      ref={ref}
      className={['penglish-ocean-page-shell', `penglish-ocean-page-shell--glass-${glassIntensity}`, className].filter(Boolean).join(' ')}
      minH="100%"
      position="relative"
      overflowX="clip"
      bgImage={`${overlayByStrength[overlayStrength]}, url(${oceanBackgrounds[variant]})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      sx={{
        isolation: 'isolate',
        '@supports not (overflow: clip)': {
          overflowX: 'hidden',
        },
      }}
      {...props}
    >
      <Box
        aria-hidden="true"
        position="absolute"
        inset="0"
        pointerEvents="none"
        zIndex={0}
        bg="radial-gradient(circle at 18% 12%, rgba(255,255,255,0.50), transparent 26%), radial-gradient(circle at 88% 8%, rgba(91,188,235,0.16), transparent 28%), linear-gradient(90deg, rgba(255,255,255,0.12), rgba(221,245,255,0.12))"
      />
      {showPooCompanion ? <PooOceanCompanion variant={pooCompanionVariant} /> : null}
      <Box position="relative" zIndex={2} minH="inherit" minW="0">
        {children}
      </Box>
    </Box>
  );
});
