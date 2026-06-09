import { useEffect, useState } from 'react';
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { SpongeIcon } from './SpongeIcon';
import {
  getLearningHeartsState,
  getLockRemainingText,
  isLearningLocked,
  LEARNING_HEARTS_UPDATED_EVENT,
  type LearningHeartsState,
} from '../../lib/p-english/learning-hearts';

export function LearningHeartsBadge({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<LearningHeartsState>(() => getLearningHeartsState());

  useEffect(() => {
    const refresh = () => setState(getLearningHeartsState());
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener(LEARNING_HEARTS_UPDATED_EVENT, refresh);
    const timerId = window.setInterval(refresh, 60_000);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener(LEARNING_HEARTS_UPDATED_EVENT, refresh);
      window.clearInterval(timerId);
    };
  }, []);

  const locked = isLearningLocked(state);
  const spongeUnits = Array.from({ length: state.maxHearts }, (_, index) => index < state.heartsLeft);

  return (
    <Box
      border="1px solid"
      borderColor={locked ? 'rgba(100, 117, 138, 0.28)' : 'rgba(249, 185, 62, 0.34)'}
      bg={locked ? 'linear-gradient(135deg, #F1F5F9 0%, #F8FCFF 100%)' : 'linear-gradient(135deg, #FFF7D6 0%, #E8F9FF 58%, #FFFFFF 100%)'}
      borderRadius="xl"
      p={compact ? '2.5' : '3'}
      boxShadow={locked ? '0 10px 24px rgba(100, 117, 138, 0.08)' : '0 12px 26px rgba(249, 185, 62, 0.12)'}
      w="100%"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" right="-18px" top="-18px" w="54px" h="54px" borderRadius="full" bg={locked ? 'rgba(148, 163, 184, 0.14)' : 'rgba(174, 231, 255, 0.46)'} pointerEvents="none" />
      <Flex align="center" justify="space-between" gap="2" position="relative">
        <VStack align="start" gap="0" minW="0">
          <Text fontSize={compact ? '10px' : 'xs'} fontFamily="monospace" fontWeight="950" color={locked ? '#64758A' : '#1F6FD6'} textTransform="uppercase" letterSpacing="0.04em">
            {locked ? 'Đang hồi bọt biển' : 'Bọt biển'}
          </Text>
          <Text fontSize={compact ? 'xs' : 'sm'} fontFamily="monospace" fontWeight="950" color="#102A43">
            {state.heartsLeft}/{state.maxHearts}
          </Text>
        </VStack>

        <HStack gap={compact ? '0.5' : '1'} flexShrink={0} aria-label={`${state.heartsLeft}/${state.maxHearts} bọt biển`}>
          {spongeUnits.map((filled, index) => (
            <SpongeIcon key={index} active={filled} compact={compact} decorative={false} />
          ))}
        </HStack>
      </Flex>

      {locked ? (
        <Text mt="2" fontSize="11px" fontWeight="800" color="#52667A" lineHeight="1.25" position="relative">
          Bọt biển sẽ phục hồi sau {getLockRemainingText(state)}
        </Text>
      ) : null}
    </Box>
  );
}

