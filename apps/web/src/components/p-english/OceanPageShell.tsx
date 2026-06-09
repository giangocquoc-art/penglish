import { forwardRef } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';
import { AmbientPooWhale, type AmbientPooWhalePresetName } from '../ocean/AmbientPooWhale';
import { type OceanBackgroundVariant } from '../../lib/p-english/oceanAssets';
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
  soft: 'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at 88% 8%, rgba(91,188,235,0.08), transparent 32%)',
  medium: 'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.24), transparent 30%), radial-gradient(circle at 88% 8%, rgba(91,188,235,0.10), transparent 32%)',
  strong: 'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.30), transparent 30%), radial-gradient(circle at 88% 8%, rgba(91,188,235,0.12), transparent 32%)',
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
      bg="transparent"
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
        bg={overlayByStrength[overlayStrength]}
      />
      {showAmbientPooWhale ? <AmbientPooWhale preset={ambientWhalePreset ?? ambientPresetByVariant[variant]} /> : null}
      {showPooCompanion ? <PooOceanCompanion variant={pooCompanionVariant} /> : null}
      <Box position="relative" zIndex={2} minH="inherit" minW="0">
        {children}
      </Box>
    </Box>
  );
});
