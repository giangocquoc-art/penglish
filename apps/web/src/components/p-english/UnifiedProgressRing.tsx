import { Box, Flex, HStack, Progress, Text, VStack } from '@chakra-ui/react';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  blue: '#2563EB',
  aqua: '#DDF5FF',
  border: '#BAE6FD',
  green: '#22C55E',
};

export function UnifiedProgressRing({
  percentage,
  completedUnits,
  totalUnits,
  currentLevel,
  currentLevelLabel,
  nextTitle,
}: {
  percentage: number;
  completedUnits: number;
  totalUnits: number;
  currentLevel: string;
  currentLevelLabel: string;
  nextTitle: string;
}) {
  const safePercentage = Math.max(0, Math.min(100, percentage));
  const angle = `${safePercentage * 3.6}deg`;

  return (
    <Flex
      className="home-dashboard-card"
      bg="rgba(255,255,255,0.86)"
      border="1px solid"
      borderColor={COLORS.border}
      borderRadius="3xl"
      p={{ base: '5', md: '6' }}
      gap={{ base: '4', md: '5' }}
      align={{ base: 'stretch', sm: 'center' }}
      direction={{ base: 'column', sm: 'row' }}
      boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)"
      minH="100%"
    >
      <Flex
        w={{ base: '132px', md: '148px' }}
        h={{ base: '132px', md: '148px' }}
        borderRadius="full"
        align="center"
        justify="center"
        bg={`conic-gradient(${COLORS.blue} ${angle}, #E2E8F0 0deg)`}
        flexShrink={0}
      >
        <Flex w={{ base: '100px', md: '112px' }} h={{ base: '100px', md: '112px' }} borderRadius="full" bg="white" align="center" justify="center" direction="column" boxShadow="inset 0 0 0 1px rgba(186,230,253,.8)">
          <Text fontSize={{ base: '3xl', md: '4xl' }} lineHeight="1" fontWeight="950" color={COLORS.text}>{safePercentage}%</Text>
          <Text fontSize="xs" fontWeight="900" color={COLORS.blue}>lộ trình</Text>
        </Flex>
      </Flex>
      <VStack align="stretch" gap="3" flex="1" w="100%">
        <HStack justify="space-between" align="start" gap="4" wrap="wrap">
          <Box minW="0">
            <Text fontSize="sm" color={COLORS.muted} fontWeight="800">Mức hiện tại</Text>
            <HStack mt="1" gap="2" wrap="wrap">
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.1">{currentLevel}</Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="900" color={COLORS.muted} lineHeight="1.2">{currentLevelLabel}</Text>
            </HStack>
          </Box>
          <Box textAlign="right" flexShrink={0}>
            <Text fontSize="sm" color={COLORS.muted} fontWeight="800">Bài</Text>
            <Text fontSize="xl" fontWeight="950" color={COLORS.green}>{completedUnits}/{totalUnits}</Text>
          </Box>
        </HStack>
        <Box>
          <HStack justify="space-between" mb="2">
            <Text fontSize="sm" color={COLORS.muted} fontWeight="800">Bước tiếp theo</Text>
            <Text fontSize="sm" color={COLORS.blue} fontWeight="950">{safePercentage}%</Text>
          </HStack>
          <Progress value={safePercentage} colorScheme="blue" bg="#E2E8F0" borderRadius="full" h="10px" />
          <Text mt="2" color={COLORS.text} fontWeight="850" noOfLines={2}>{nextTitle}</Text>
        </Box>
      </VStack>
    </Flex>
  );
}
