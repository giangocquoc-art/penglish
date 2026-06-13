import { Box, Center, Text, VStack } from '@chakra-ui/react';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function AuthLoadingScreen() {
  const reducedMotion = useReducedMotion();

  return (
    <Box
      data-testid="auth-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Đang đăng nhập"
      position="fixed"
      inset="0"
      zIndex="overlay"
      minH="100vh"
      overflow="hidden"
      bg="linear-gradient(180deg, #F8FCFF 0%, #E8F4FF 42%, #DDF5FF 100%)"
      color="#102A43"
      pointerEvents="auto"
    >
      <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 18% 18%, rgba(255,255,255,0.94), transparent 28%), radial-gradient(circle at 82% 12%, rgba(91,188,235,0.22), transparent 26%), radial-gradient(circle at 50% 86%, rgba(31,111,214,0.14), transparent 34%)" />
      <Box aria-hidden="true" position="absolute" left="8%" top="10%" w="180px" h="180px" borderRadius="full" bg="rgba(255,255,255,0.38)" filter="blur(4px)" />
      <Box aria-hidden="true" position="absolute" right="10%" top="18%" w="88px" h="88px" borderRadius="full" border="1px solid rgba(91,188,235,0.20)" bg="rgba(255,255,255,0.28)" />
      <Box aria-hidden="true" position="absolute" left="0" right="0" bottom="0" h="34%" bg="linear-gradient(180deg, rgba(174,231,255,0.62) 0%, rgba(91,188,235,0.72) 58%, rgba(31,111,214,0.78) 100%)" boxShadow="0 -24px 70px rgba(91,188,235,0.24)">
        <Box position="absolute" left="-12%" right="-12%" top="-18px" h="72px" bg="radial-gradient(ellipse at 18% 48%, rgba(255,255,255,0.82) 0 10%, transparent 11% 100%), radial-gradient(ellipse at 45% 42%, rgba(255,255,255,0.58) 0 9%, transparent 10% 100%), radial-gradient(ellipse at 72% 54%, rgba(255,255,255,0.72) 0 10%, transparent 11% 100%)" opacity="0.88" filter="blur(0.5px)" />
      </Box>

      <Center position="relative" minH="100vh" px="5">
        <VStack
          gap={{ base: '5', md: '6' }}
          w="min(520px, 100%)"
          p={{ base: '6', md: '8' }}
          border="1px solid rgba(186,230,253,0.70)"
          borderRadius={{ base: '28px', md: '34px' }}
          bg="rgba(255,255,255,0.72)"
          boxShadow="0 26px 80px rgba(31,111,214,0.15)"
          backdropFilter="blur(22px) saturate(1.08)"
          textAlign="center"
        >
          <Box w={{ base: '104px', md: '132px' }}>
            <OceanMascot mascot="poo" pose="happy" size="lg" decorative motion={reducedMotion ? 'none' : 'float'} />
          </Box>

          <VStack gap="2">
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color="#102A43" lineHeight="1.18">
              Poo đang đưa bạn vào vùng học...
            </Text>
            <Text color="#52667A" fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" lineHeight="1.65">
              Chờ một chút nhé, Poo đang chuẩn bị bài học hôm nay cho bạn.
            </Text>
          </VStack>

          <VStack gap="3" w="100%">
            <Text fontSize="sm" fontWeight="850" color="#52667A">
              Đang đăng nhập
            </Text>
            <Box w="100%" h="10px" borderRadius="full" bg="rgba(221,245,255,0.92)" border="1px solid rgba(91,188,235,0.22)" overflow="hidden">
              <Box
                data-testid="auth-loading-progress-bar"
                h="100%"
                w="44%"
                borderRadius="inherit"
                bg="linear-gradient(90deg, #5BBCEB 0%, #2F9EEB 52%, #1F6FD6 100%)"
                sx={reducedMotion ? undefined : { animation: 'auth-loading-wave 1.2s ease-in-out infinite alternate' }}
              />
            </Box>
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
}
