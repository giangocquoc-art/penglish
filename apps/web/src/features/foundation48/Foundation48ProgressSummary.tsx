import { Box, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { CheckCircle2, Compass, PlayCircle, RotateCcw, Waves } from 'lucide-react';
import { getDailyRewardState, getUnifiedBubbleStreak } from '../../lib/p-english/daily-rewards';
import type { Foundation48ProgressState } from './foundation48Types';

type Summary = Foundation48ProgressState & { started: number; completed: number; totalDays: number; percent: number; mistakesDue?: number };

export function Foundation48ProgressSummary({
  progress,
  currentStageTitle,
  nextDay,
}: {
  progress: Summary;
  currentStageTitle: string;
  nextDay: number;
  audioDays: number;
  sourceReady: boolean;
}) {
  const bubbleStreak = getUnifiedBubbleStreak(getDailyRewardState());

  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.78)" mb="4">
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="3" direction={{ base: 'column', md: 'row' }} mb="3">
        <Box>
          <Text color="#1F6FD6" fontWeight="950" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">Tiến độ 48 ngày</Text>
          <Text color="#102A43" fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }}>Đã hoàn thành {progress.completed}/48 ngày</Text>
        </Box>
        <Box minW={{ base: '100%', md: '220px' }}>
          <HStack justify="space-between" mb="1">
            <Text fontSize="xs" fontWeight="900" color="#52667A">Hành trình</Text>
            <Text fontSize="xs" fontWeight="950" color="#1F6FD6">{progress.percent}%</Text>
          </HStack>
          <Box h="10px" bg="#E8F4FF" borderRadius="full" overflow="hidden" border="1px solid #BAE6FD">
            <Box h="100%" w={`${progress.percent}%`} bg="linear-gradient(90deg, #1F6FD6, #5BBCEB, #66D9C8)" borderRadius="full" transition="width .25s ease" />
          </Box>
        </Box>
      </Flex>
      <SimpleGrid columns={{ base: 2, lg: 5 }} gap="2.5">
        <Metric icon={CheckCircle2} label="Hoàn thành" value={`${progress.completed}/48`} />
        <Metric icon={Compass} label="Chặng hiện tại" value={currentStageTitle} />
        <Metric icon={PlayCircle} label="Tiếp tục" value={`Ngày ${nextDay}`} />
        <Metric icon={Waves} label="Chuỗi bọt biển" value={bubbleStreak.label} />
        <Metric icon={RotateCcw} label="Cần ôn" value={`${progress.mistakesDue || 0} lỗi`} />
      </SimpleGrid>
    </Box>
  );
}

function Metric({ icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <HStack p="3" borderRadius="2xl" bg="rgba(248,252,255,0.84)" border="1px solid rgba(186,230,253,0.82)" gap="2.5" minW="0">
      <Flex w="34px" h="34px" borderRadius="xl" bg="#E8F4FF" color="#1F6FD6" align="center" justify="center" flexShrink={0}>
        <Icon as={icon} boxSize="4.5" />
      </Flex>
      <VStack align="start" gap="0" minW="0">
        <Text fontSize="11px" fontWeight="900" color="#52667A" noOfLines={1}>{label}</Text>
        <Text fontSize={{ base: 'sm', md: 'sm' }} fontWeight="950" color="#102A43" noOfLines={2} lineHeight="1.2">{value}</Text>
      </VStack>
    </HStack>
  );
}
