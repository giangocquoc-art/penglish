import { useRef } from 'react';
import { Box, Circle, Flex, Text, VisuallyHidden } from '@chakra-ui/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { createBubbleLoop, createFloatLoop, safeGsapSet } from '../../lib/animations/gsap-utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

const whaleColors = {
  deepBlue: '#1F6FD6',
  whaleBlue: '#5BBCEB',
  whaleLight: '#AEE7FF',
  softAqua: '#DDF5FF',
  blush: '#FFD7E2',
  eye: '#102A43',
  white: '#FFFFFF',
};

type BlueWhaleMascotProps = {
  showMessage?: boolean;
  size?: 'sm' | 'md';
  showBubbles?: boolean;
  decorative?: boolean;
};

export function BlueWhaleMascot({ showMessage = true, size = 'md', showBubbles = true, decorative = false }: BlueWhaleMascotProps) {
  const isSmall = size === 'sm';
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const whaleFloat = root.querySelector('.whale-float');
      const whaleBody = root.querySelector('.whale-body');
      const bubbles = root.querySelectorAll('.whale-bubble');
      const tail = root.querySelector('.whale-tail');
      const fin = root.querySelector('.whale-fin');
      const eye = root.querySelector('.whale-eye');
      const message = root.querySelector('.whale-message');

      if (reducedMotion) {
        safeGsapSet([whaleFloat, whaleBody, bubbles, tail, fin, eye, message], {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          scaleY: 1,
        });
        return;
      }

      createFloatLoop(whaleFloat, {
        x: isSmall ? 3 : 5,
        y: isSmall ? -5 : -8,
        rotation: 1,
        duration: isSmall ? 6.2 : 6.8,
      });

      gsap.to(whaleBody, {
        scale: 1.014,
        duration: 5.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      createBubbleLoop(bubbles, {
        y: isSmall ? -9 : -13,
        x: isSmall ? 2 : 4,
        scale: 1.08,
        duration: isSmall ? 5.6 : 6.2,
        stagger: 0.34,
      });

      gsap.to(tail, {
        rotate: 7,
        duration: 3.7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      gsap.to(fin, {
        rotate: -24,
        y: 3,
        duration: 4.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      gsap.to(eye, {
        scaleY: 0.16,
        transformOrigin: 'center',
        duration: 0.08,
        repeat: -1,
        repeatDelay: 5.8,
        yoyo: true,
        ease: 'power1.inOut',
      });

      if (message) {
        gsap.fromTo(
          message,
          { autoAlpha: 0, y: 4, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out', force3D: true },
        );
      }
    },
    { scope: rootRef, dependencies: [isSmall, reducedMotion, showBubbles, showMessage], revertOnUpdate: true },
  );

  return (
    <Box
      ref={rootRef}
      position="relative"
      w={isSmall ? { base: '118px', sm: '132px', md: '160px' } : { base: '172px', sm: '196px', md: '224px' }}
      h={isSmall ? { base: showMessage ? '132px' : '92px', md: showMessage ? '146px' : '104px' } : { base: showMessage ? '172px' : '126px', md: showMessage ? '190px' : '142px' }}
      flexShrink={0}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Linh vật cá voi xanh nhắc bạn: Một chút mỗi ngày, nhớ lâu hơn.'}
      aria-hidden={decorative ? true : undefined}
      pointerEvents={decorative ? 'none' : undefined}
      sx={{
        '@keyframes whaleIdleFloat': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(-1deg)' },
          '50%': { transform: 'translate3d(0, -10px, 0) rotate(1.4deg)' },
        },
        '@keyframes whaleBreathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.014)' },
        },
        '@keyframes whaleBlink': {
          '0%, 88%, 92%, 100%': { transform: 'scaleY(1)' },
          '90%': { transform: 'scaleY(0.12)' },
        },
        '@keyframes whaleBubbleRise': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)', opacity: 0.62 },
          '50%': { transform: 'translate3d(0, -13px, 0)', opacity: 0.94 },
        },
        '@keyframes whaleTailWave': {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(7deg)' },
        },
        '@keyframes whaleFinDrift': {
          '0%, 100%': { transform: 'rotate(-16deg)' },
          '50%': { transform: 'rotate(-25deg) translate3d(0, 3px, 0)' },
        },
        '@keyframes whaleBubbleAppear': {
          '0%': { transform: 'translate3d(0, 4px, 0)', opacity: 0 },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.whale-float, .whale-body, .whale-eye, .whale-bubble, .whale-tail, .whale-fin, .whale-message': {
            animation: 'none !important',
          },
        },
      }}
    >
      {showBubbles ? (
        <>
              <Circle className="whale-bubble" position="absolute" top={isSmall ? '0' : '4px'} right={isSmall ? { base: '10px', md: '16px' } : { base: '18px', md: '28px' }} size={isSmall ? { base: '11px', md: '14px' } : '17px'} bg="rgba(93, 190, 235, 0.26)" border="1px solid rgba(31, 111, 214, 0.22)" willChange="transform, opacity" />
              <Circle className="whale-bubble" position="absolute" top={isSmall ? '20px' : '28px'} right={isSmall ? { base: '-1px', md: '3px' } : { base: '2px', md: '8px' }} size={isSmall ? '8px' : '10px'} bg="rgba(221, 245, 255, 0.92)" border="1px solid rgba(31, 111, 214, 0.18)" willChange="transform, opacity" />
              <Circle className="whale-bubble" display={isSmall ? { base: 'none', md: 'block' } : 'block'} position="absolute" top={isSmall ? '16px' : '22px'} left={isSmall ? { base: '14px', md: '18px' } : { base: '20px', md: '28px' }} size={isSmall ? '9px' : '12px'} bg="rgba(255, 255, 255, 0.78)" border="1px solid rgba(59, 167, 240, 0.22)" willChange="transform, opacity" />
        </>
      ) : null}

      <Box
        className="whale-float"
        position="absolute"
        left={isSmall ? { base: '8px', md: '12px' } : { base: '12px', md: '20px' }}
        top={isSmall ? { base: '22px', md: '24px' } : { base: '28px', md: '34px' }}
        w={isSmall ? { base: '96px', sm: '108px', md: '128px' } : { base: '140px', sm: '158px', md: '178px' }}
        h={isSmall ? { base: '64px', sm: '72px', md: '82px' } : { base: '94px', sm: '104px', md: '114px' }}
        transformOrigin="50% 58%"
        willChange="transform"
      >
        <Box className="whale-body" position="absolute" inset="0" transformOrigin="50% 62%" willChange="transform">
          <Box
            position="absolute"
            left="0"
            top={isSmall ? { base: '8px', md: '7px' } : { base: '12px', md: '10px' }}
            w={isSmall ? { base: '82px', sm: '92px', md: '108px' } : { base: '118px', sm: '134px', md: '150px' }}
            h={isSmall ? { base: '50px', sm: '56px', md: '64px' } : { base: '70px', sm: '78px', md: '86px' }}
            borderRadius="58% 46% 50% 58% / 54% 56% 46% 50%"
            bgGradient={`linear(145deg, ${whaleColors.whaleLight} 0%, ${whaleColors.whaleBlue} 45%, ${whaleColors.deepBlue} 115%)`}
            boxShadow="0 18px 36px rgba(31, 111, 214, 0.18)"
            overflow="hidden"
          >
            <Box position="absolute" left="14%" bottom="6%" w="62%" h="34%" borderRadius="60% 52% 44% 58%" bg="rgba(255, 255, 255, 0.58)" />
            <Box position="absolute" left="18%" top="18%" w="32%" h="18%" borderRadius="full" bg="rgba(255, 255, 255, 0.22)" transform="rotate(-14deg)" />
            <Circle position="absolute" right={isSmall ? { base: '22px', md: '27px' } : { base: '31px', md: '37px' }} top={isSmall ? { base: '16px', md: '18px' } : { base: '22px', md: '25px' }} size={isSmall ? { base: '6px', md: '7px' } : { base: '8px', md: '9px' }} bg={whaleColors.white}>
              <Circle className="whale-eye" size={isSmall ? { base: '3px', md: '4px' } : { base: '4px', md: '5px' }} bg={whaleColors.eye} transformOrigin="center" />
            </Circle>
            <Circle position="absolute" right={isSmall ? { base: '13px', md: '16px' } : { base: '18px', md: '22px' }} top={isSmall ? { base: '28px', md: '32px' } : { base: '39px', md: '44px' }} size={isSmall ? { base: '7px', md: '9px' } : { base: '10px', md: '12px' }} bg={whaleColors.blush} opacity="0.7" />
          </Box>

          <Box
            className="whale-fin"
            position="absolute"
            left={isSmall ? { base: '30px', md: '38px' } : { base: '42px', md: '52px' }}
            bottom={isSmall ? { base: '5px', md: '4px' } : { base: '8px', md: '6px' }}
            w={isSmall ? { base: '24px', md: '30px' } : { base: '34px', md: '42px' }}
            h={isSmall ? { base: '15px', md: '18px' } : { base: '21px', md: '25px' }}
            bg={whaleColors.deepBlue}
            opacity="0.34"
            borderRadius="70% 20% 72% 24%"
            transform="rotate(-16deg)"
            transformOrigin="20% 20%"
            willChange="transform"
          />

          <Flex className="whale-tail" position="absolute" right={isSmall ? { base: '-5px', md: '-4px' } : { base: '-7px', md: '-5px' }} top={isSmall ? { base: '20px', md: '22px' } : { base: '28px', md: '30px' }} align="center" transformOrigin="2px 50%" willChange="transform">
            <Box w={isSmall ? { base: '22px', md: '27px' } : { base: '31px', md: '37px' }} h={isSmall ? { base: '17px', md: '21px' } : { base: '24px', md: '29px' }} bg={whaleColors.whaleBlue} borderRadius="72% 28% 70% 30%" transform="rotate(32deg)" boxShadow="0 10px 22px rgba(31, 111, 214, 0.14)" />
            <Box ml={isSmall ? '-10px' : '-14px'} w={isSmall ? { base: '22px', md: '27px' } : { base: '31px', md: '37px' }} h={isSmall ? { base: '17px', md: '21px' } : { base: '24px', md: '29px' }} bg={whaleColors.deepBlue} borderRadius="28% 72% 30% 70%" transform="rotate(-32deg)" opacity="0.82" />
          </Flex>
        </Box>
      </Box>

      {showMessage ? (
        <Box
          className="whale-message"
          position="absolute"
          left={{ base: '4px', md: '8px' }}
          right={{ base: '4px', md: '0' }}
          bottom="0"
          bg="rgba(255, 255, 255, 0.88)"
          border="1px solid rgba(59, 167, 240, 0.22)"
          borderRadius="20px"
          px={{ base: '3', md: '4' }}
          py="2"
          boxShadow="0 14px 30px rgba(31, 111, 214, 0.12)"
          backdropFilter="blur(12px)"
          willChange="transform, opacity"
        >
          <Box position="absolute" top="-7px" left="38px" w="14px" h="14px" bg="rgba(255, 255, 255, 0.88)" borderLeft="1px solid rgba(59, 167, 240, 0.20)" borderTop="1px solid rgba(59, 167, 240, 0.20)" transform="rotate(45deg)" />
          <Text position="relative" fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" color={whaleColors.deepBlue} lineHeight="1.45">
            Một chút mỗi ngày, nhớ lâu hơn.
          </Text>
          {decorative ? null : <VisuallyHidden>Một chút mỗi ngày, nhớ lâu hơn.</VisuallyHidden>}
        </Box>
      ) : null}
    </Box>
  );
}
