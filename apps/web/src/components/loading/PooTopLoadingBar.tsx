import { Box } from '@chakra-ui/react';
import { OceanMascot } from '../p-english/OceanMascot';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type PooTopLoadingBarProps = {
  visible: boolean;
  exiting?: boolean;
  progress: number;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function PooTopLoadingBar({ visible, exiting = false, progress }: PooTopLoadingBarProps) {
  const reducedMotion = useReducedMotion();
  const safeProgress = clampProgress(progress);
  const mascotLeft = `calc(${safeProgress}% - 18px)`;

  if (!visible) return null;

  return (
    <Box
      data-testid="poo-top-loading-bar"
      role="progressbar"
      aria-label="Poo đang chuẩn bị đại dương"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeProgress}
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="toast"
      h={{ base: '9px', md: '10px' }}
      pointerEvents="none"
      opacity={exiting ? 0 : 1}
      transform={exiting ? 'translate3d(0, -6px, 0)' : 'translate3d(0, 0, 0)'}
      transition={reducedMotion ? 'opacity 120ms ease-out' : 'opacity 240ms ease-out, transform 260ms ease-out'}
      sx={{ contain: 'layout paint style' }}
    >
      <Box
        position="absolute"
        inset="0"
        bg="linear-gradient(90deg, rgba(221,245,255,0.96), rgba(232,244,255,0.92), rgba(240,249,255,0.96))"
        boxShadow="0 1px 0 rgba(186,230,253,0.72), 0 8px 22px rgba(31,111,214,0.08)"
      />
      <Box
        data-testid="poo-top-loading-progress"
        position="absolute"
        top="0"
        left="0"
        bottom="0"
        w={`${safeProgress}%`}
        minW={safeProgress > 0 ? '18px' : '0'}
        borderRightRadius="full"
        bg="linear-gradient(90deg, #5BBCEB 0%, #2F9EEB 48%, #7DD3FC 100%)"
        boxShadow="0 0 18px rgba(47,158,235,0.36)"
        overflow="hidden"
        transition={reducedMotion ? 'none' : 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)'}
      >
        <Box
          aria-hidden="true"
          position="absolute"
          inset="0"
          opacity="0.55"
          bg="radial-gradient(ellipse at 12% 80%, rgba(255,255,255,0.88) 0 13%, transparent 14% 100%), radial-gradient(ellipse at 42% 30%, rgba(255,255,255,0.58) 0 10%, transparent 11% 100%), radial-gradient(ellipse at 72% 76%, rgba(255,255,255,0.72) 0 12%, transparent 13% 100%)"
          bgSize="86px 16px"
          sx={reducedMotion ? undefined : { animation: 'pooTopLoadingWave 1.55s linear infinite' }}
        />
        <Box
          aria-hidden="true"
          position="absolute"
          inset="0"
          bg="linear-gradient(115deg, transparent 0 42%, rgba(255,255,255,0.68) 44%, transparent 50% 100%)"
          bgSize="160px 28px"
          opacity="0.38"
          sx={reducedMotion ? undefined : { animation: 'pooTopLoadingShimmer 2.2s linear infinite' }}
        />
      </Box>
      <Box
        data-testid="poo-top-loading-mascot"
        aria-hidden="true"
        position="absolute"
        left={mascotLeft}
        top={{ base: '-7px', md: '-8px' }}
        w={{ base: '30px', md: '34px' }}
        h={{ base: '30px', md: '34px' }}
        display="grid"
        placeItems="center"
        filter="drop-shadow(0 5px 10px rgba(31,111,214,0.18))"
        transition={reducedMotion ? 'none' : 'left 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms ease-out'}
        transform={exiting ? 'translate3d(6px, -2px, 0) scale(0.96)' : 'translate3d(0, 0, 0)'}
        sx={reducedMotion ? undefined : { animation: 'pooTopLoadingMascotSwim 1.8s ease-in-out infinite' }}
      >
        <OceanMascot mascot="poo" pose="idle" size="sm" decorative motion="none" />
      </Box>
      <Box
        sx={{
          '@keyframes pooTopLoadingWave': {
            '0%': { transform: 'translate3d(0, 0, 0)' },
            '100%': { transform: 'translate3d(86px, 0, 0)' },
          },
          '@keyframes pooTopLoadingShimmer': {
            '0%': { transform: 'translate3d(-160px, 0, 0)' },
            '100%': { transform: 'translate3d(160px, 0, 0)' },
          },
          '@keyframes pooTopLoadingMascotSwim': {
            '0%, 100%': { marginTop: '0px' },
            '50%': { marginTop: '-3px' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*': { animation: 'none !important' },
          },
        }}
      />
    </Box>
  );
}
