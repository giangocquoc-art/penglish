import { useMemo, useRef } from 'react';
import { Box, Center, HStack, Text, VStack } from '@chakra-ui/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(useGSAP);

const LOADING_COPY = [
  'Poo đang mở vùng biển học tập...',
  'Đang chuẩn bị bài học của bạn...',
  'Sắp vào lớp rồi...',
];

type PooOceanRiseLoaderProps = {
  progress: number;
  exiting?: boolean;
  delayed?: boolean;
  label?: string;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function PooOceanRiseLoader({ progress, exiting = false, delayed = false, label = 'Đang tải P-English' }: PooOceanRiseLoaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const waterRef = useRef<HTMLDivElement | null>(null);
  const shimmerRef = useRef<HTMLDivElement | null>(null);
  const mascotRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const safeProgress = clampProgress(progress);
  const copy = useMemo(() => {
    if (safeProgress >= 88) return LOADING_COPY[2];
    if (safeProgress >= 42) return LOADING_COPY[1];
    return LOADING_COPY[0];
  }, [safeProgress]);

  useGSAP(() => {
    const water = waterRef.current;
    const root = rootRef.current;
    if (!water || !root) return undefined;

    if (reducedMotion) {
      gsap.set(root, { opacity: exiting ? 0 : 1 });
      gsap.set(water, { height: `${safeProgress}%` });
      return undefined;
    }

    gsap.to(root, {
      opacity: exiting ? 0 : 1,
      duration: exiting ? 0.42 : 0.28,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    gsap.to(water, {
      height: `${safeProgress}%`,
      duration: safeProgress >= 100 ? 0.62 : 0.86,
      ease: safeProgress >= 100 ? 'power3.out' : 'sine.out',
      overwrite: 'auto',
    });

    return undefined;
  }, { dependencies: [exiting, reducedMotion, safeProgress], scope: rootRef, revertOnUpdate: true });

  useGSAP(() => {
    if (reducedMotion) return undefined;
    const shimmer = shimmerRef.current;
    const mascot = mascotRef.current;

    const timeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });
    if (shimmer) {
      timeline.to(shimmer, { xPercent: 16, duration: 4.8 }, 0).to(shimmer, { xPercent: -10, duration: 4.8 }, 4.8);
    }
    if (mascot) {
      timeline.to(mascot, { y: -8, rotate: -1.4, duration: 2.8 }, 0).to(mascot, { y: 4, rotate: 1.2, duration: 2.8 }, 2.8);
    }

    return () => timeline.kill();
  }, { dependencies: [reducedMotion], scope: rootRef });

  return (
    <Box
      ref={rootRef}
      data-testid="poo-ocean-rise-loader"
      data-progress={safeProgress}
      role="status"
      aria-live="polite"
      aria-label={`${label}: ${safeProgress}%`}
      position="fixed"
      inset="0"
      zIndex="overlay"
      minH="100vh"
      overflow="hidden"
      bg="linear-gradient(180deg, #F8FCFF 0%, #E8F4FF 42%, #DDF5FF 100%)"
      color="#102A43"
      opacity={1}
      pointerEvents="auto"
      sx={{
        contain: 'layout paint style',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'opacity 160ms ease-out',
        },
      }}
    >
      <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 18% 18%, rgba(255,255,255,0.92), transparent 28%), radial-gradient(circle at 82% 12%, rgba(91,188,235,0.20), transparent 26%), radial-gradient(circle at 52% 86%, rgba(31,111,214,0.13), transparent 34%)" />
      <Box aria-hidden="true" position="absolute" left="8%" top="10%" w="180px" h="180px" borderRadius="full" bg="rgba(255,255,255,0.38)" filter="blur(4px)" />
      <Box aria-hidden="true" position="absolute" right="10%" top="18%" w="88px" h="88px" borderRadius="full" border="1px solid rgba(91,188,235,0.20)" bg="rgba(255,255,255,0.28)" />

      <Box
        ref={waterRef}
        data-testid="poo-ocean-rise-water"
        aria-hidden="true"
        position="absolute"
        left="0"
        right="0"
        bottom="0"
        h={`${safeProgress}%`}
        minH={safeProgress > 0 ? '2px' : '0'}
        overflow="hidden"
        bg="linear-gradient(180deg, rgba(174,231,255,0.92) 0%, rgba(91,188,235,0.94) 48%, rgba(31,111,214,0.96) 100%)"
        boxShadow="0 -24px 70px rgba(91,188,235,0.28)"
      >
        <Box
          ref={shimmerRef}
          position="absolute"
          left="-12%"
          right="-12%"
          top="-18px"
          h="72px"
          bg="radial-gradient(ellipse at 18% 48%, rgba(255,255,255,0.82) 0 10%, transparent 11% 100%), radial-gradient(ellipse at 45% 42%, rgba(255,255,255,0.58) 0 9%, transparent 10% 100%), radial-gradient(ellipse at 72% 54%, rgba(255,255,255,0.72) 0 10%, transparent 11% 100%)"
          opacity="0.88"
          filter="blur(0.5px)"
          sx={{
            '@media (prefers-reduced-motion: reduce)': {
              transform: 'none !important',
            },
          }}
        />
        <Box position="absolute" inset="0" opacity="0.22" bg="linear-gradient(115deg, transparent 0 42%, rgba(255,255,255,0.72) 43%, transparent 48% 100%)" bgSize="280px 180px" />
      </Box>

      <Center position="relative" minH="100vh" px="5">
        <VStack
          gap={{ base: '5', md: '6' }}
          w="min(520px, 100%)"
          p={{ base: '6', md: '8' }}
          border="1px solid rgba(186,230,253,0.70)"
          borderRadius={{ base: '28px', md: '34px' }}
          bg="rgba(255,255,255,0.68)"
          boxShadow="0 26px 80px rgba(31,111,214,0.15)"
          backdropFilter="blur(22px) saturate(1.08)"
          textAlign="center"
        >
          <Box ref={mascotRef} w={{ base: '104px', md: '132px' }}>
            <OceanMascot mascot="poo" pose="idle" size="lg" decorative motion={reducedMotion ? 'none' : 'float'} />
          </Box>

          <VStack gap="2">
            <Text fontSize="xs" fontWeight="950" color="#1F6FD6" letterSpacing="0.16em" textTransform="uppercase">
              P-English Ocean
            </Text>
            <Text data-testid="poo-ocean-rise-copy" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color="#102A43" lineHeight="1.18">
              {copy}
            </Text>
            <Text color="#52667A" fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" lineHeight="1.65">
              Một vùng biển yên tĩnh đang nâng bạn vào bài học hôm nay.
            </Text>
          </VStack>

          <VStack gap="3" w="100%">
            <HStack justify="space-between" w="100%" px="1">
              <Text fontSize="sm" fontWeight="850" color="#52667A">
                {delayed ? 'Đang mở trang học' : 'Độ sẵn sàng'}
              </Text>
              <Text data-testid="poo-ocean-rise-percent" fontSize="sm" fontWeight="950" color="#1F6FD6">
                {safeProgress}%
              </Text>
            </HStack>
            <Box w="100%" h="10px" borderRadius="full" bg="rgba(221,245,255,0.92)" border="1px solid rgba(91,188,235,0.22)" overflow="hidden">
              <Box
                data-testid="poo-ocean-rise-progress-bar"
                h="100%"
                w={`${safeProgress}%`}
                borderRadius="inherit"
                bg="linear-gradient(90deg, #5BBCEB 0%, #2F9EEB 52%, #1F6FD6 100%)"
                transition={reducedMotion ? 'none' : 'width 520ms ease-out'}
              />
            </Box>
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
}
