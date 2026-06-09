import { forwardRef } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';
import { AmbientPooWhale, type AmbientPooWhalePresetName } from '../ocean/AmbientPooWhale';
import { oceanBackgrounds, type OceanBackgroundVariant } from '../../lib/p-english/oceanAssets';
import { PooOceanCompanion, type PooOceanCompanionVariant } from './PooOceanCompanion';

export type OceanPageShellProps = BoxProps & {
  variant: OceanBackgroundVariant;
  overlayStrength?: 'soft' | 'medium' | 'strong';
  showPooCompanion?: boolean;
  showPooSwimLayer?: boolean;
  showAmbientPooWhale?: boolean;
  ambientWhalePreset?: AmbientPooWhalePresetName;
  pooCompanionVariant?: PooOceanCompanionVariant;
  glassIntensity?: 'solid' | 'soft' | 'clear';
};

const overlayByStrength = {
  soft: 'linear-gradient(180deg, rgba(255,255,255,0.38), rgba(236,248,255,0.5))',
  medium: 'linear-gradient(180deg, rgba(255,255,255,0.52), rgba(232,246,255,0.64))',
  strong: 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(232,246,255,0.78))',
} as const;

const ambientPresetByVariant: Record<OceanBackgroundVariant, AmbientPooWhalePresetName> = {
  login: 'dashboard',
  dashboard: 'dashboard',
  roadmap: 'roadmap',
  speed: 'speed',
  shadowing: 'shadowing',
  vocab: 'vocabulary',
};

export const OceanPageShell = forwardRef<HTMLDivElement, OceanPageShellProps>(function OceanPageShell({ variant, overlayStrength = 'medium', showPooCompanion = false, showPooSwimLayer = true, showAmbientPooWhale = showPooSwimLayer, ambientWhalePreset, pooCompanionVariant = 'calm', glassIntensity = 'soft', children, className, ...props }, ref) {
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
        '& .penglish-glass-card': {
          background: 'var(--p-card-bg)',
          backdropFilter: 'var(--p-card-blur) saturate(1.08)',
          borderColor: 'var(--p-card-border)',
          boxShadow: '0 14px 34px rgba(31,111,214,0.07)',
        },
        '&.penglish-ocean-page-shell--glass-solid .penglish-glass-card': {
          background: 'rgba(255,255,255,0.86)',
        },
        '&.penglish-ocean-page-shell--glass-clear .penglish-glass-card': {
          background: 'rgba(255,255,255,0.74)',
        },
        '@media (max-width: 767px)': {
          '& .penglish-glass-card': {
            background: 'var(--p-card-bg-mobile)',
          },
          '&.penglish-ocean-page-shell--glass-solid .penglish-glass-card': {
            background: 'rgba(255,255,255,0.88)',
          },
          '&.penglish-ocean-page-shell--glass-clear .penglish-glass-card': {
            background: 'var(--p-card-bg-mobile)',
          },
        },
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
        bg="radial-gradient(circle at 18% 12%, rgba(255,255,255,0.42), transparent 26%), radial-gradient(circle at 88% 8%, rgba(91,188,235,0.13), transparent 28%), linear-gradient(90deg, rgba(255,255,255,0.08), rgba(221,245,255,0.10))"
      />
      {showAmbientPooWhale ? <AmbientPooWhale preset={ambientWhalePreset ?? ambientPresetByVariant[variant]} /> : null}
      {showPooCompanion ? <PooOceanCompanion variant={pooCompanionVariant} /> : null}
      <Box position="relative" zIndex={2} minH="inherit" minW="0">
        {children}
      </Box>
    </Box>
  );
});
