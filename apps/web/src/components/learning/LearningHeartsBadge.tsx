import { useEffect, useRef, useState } from 'react';
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { SpongeIcon } from './SpongeIcon';
import { OceanMascot } from '../p-english/OceanMascot';
import {
  getLearningHeartsState,
  getLockRemainingText,
  isLearningLocked,
  LEARNING_HEARTS_UPDATED_EVENT,
  OUT_OF_BUBBLES_MESSAGE,
  type LearningHeartsState,
} from '../../lib/p-english/learning-hearts';

export function LearningHeartsBadge({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<LearningHeartsState>(() => getLearningHeartsState());
  const [spongeEffect, setSpongeEffect] = useState<'lost' | 'restored' | null>(null);
  const previousHearts = useRef(state.heartsLeft);

  useEffect(() => {
    let effectTimer: number | undefined;
    const refresh = () => {
      const next = getLearningHeartsState();
      if (next.heartsLeft !== previousHearts.current) {
        setSpongeEffect(next.heartsLeft > previousHearts.current ? 'restored' : 'lost');
        previousHearts.current = next.heartsLeft;
        if (effectTimer !== undefined) window.clearTimeout(effectTimer);
        effectTimer = window.setTimeout(() => setSpongeEffect(null), 900);
      }
      setState(next);
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener(LEARNING_HEARTS_UPDATED_EVENT, refresh);
    const timerId = window.setInterval(refresh, 60_000);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener(LEARNING_HEARTS_UPDATED_EVENT, refresh);
      window.clearInterval(timerId);
      if (effectTimer !== undefined) window.clearTimeout(effectTimer);
    };
  }, []);

  const locked = isLearningLocked(state);
  const spongeUnits = Array.from({ length: state.maxHearts }, (_, index) => index < state.heartsLeft);

  if (compact) {
    return (
      <Flex
        role="group"
        aria-label={`Bọt biển: ${state.heartsLeft} trên ${state.maxHearts}`}
        align="center"
        gap="1.5"
        px="2"
        h="34px"
        flexShrink={0}
        border="1px solid"
        borderColor={locked ? 'rgba(100, 117, 138, 0.28)' : 'rgba(249, 185, 62, 0.34)'}
        borderRadius="full"
        bg={locked ? 'rgba(241,245,249,0.9)' : 'rgba(255,247,214,0.9)'}
        data-testid="learning-hearts-badge-compact"
      >
        <Box key={`${state.heartsLeft}-${spongeEffect ?? 'idle'}`} className={`learning-sponge-buddy${locked ? ' is-resting' : ''}${spongeEffect ? ` is-${spongeEffect}${spongeEffect === 'lost' ? ' learning-sponge-hit' : ''}` : ''}`} position="relative" w="26px" h="26px" flexShrink={0} aria-hidden="true">
          <OceanMascot mascot="botBien" pose={spongeEffect ? 'encourage' : locked ? 'rest' : 'buddy'} size="xs" decorative motion="none" className="learning-sponge-character" w="100%" />
        </Box>
        <HStack gap="0.5" flexShrink={0} aria-label={`${state.heartsLeft}/${state.maxHearts} bọt biển`}>
          {spongeUnits.map((filled, index) => (
            <SpongeIcon key={index} size={14} active={filled} compact decorative={false} />
          ))}
        </HStack>
        <Text fontSize="xs" fontWeight="800" color="#102A43" whiteSpace="nowrap" data-testid="learning-hearts-count">
          {state.heartsLeft}/{state.maxHearts}
        </Text>
      </Flex>
    );
  }

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
          <Text fontSize={compact ? '10px' : 'xs'} fontWeight="700" color={locked ? '#64758A' : '#1F6FD6'} textTransform="uppercase" letterSpacing="0.04em">
            Bọt biển
          </Text>
          <Text fontSize={compact ? 'xs' : 'sm'} fontWeight="700" color="#102A43" data-testid="learning-hearts-count">
            {state.heartsLeft}/{state.maxHearts}
          </Text>
        </VStack>

        <HStack gap={compact ? '0.5' : '1'} flexShrink={0} aria-label={`${state.heartsLeft}/${state.maxHearts} bọt biển`}>
          <Box key={`${state.heartsLeft}-${spongeEffect ?? 'idle'}`} className={`learning-sponge-buddy${locked ? ' is-resting' : ''}${spongeEffect ? ` is-${spongeEffect}${spongeEffect === 'lost' ? ' learning-sponge-hit' : ''}` : ''}`} position="relative" w={compact ? '36px' : '50px'} h={compact ? '36px' : '50px'} flexShrink={0} aria-hidden="true">
            <OceanMascot mascot="botBien" pose={spongeEffect ? 'encourage' : locked ? 'rest' : 'buddy'} size="xs" decorative motion="none" className="learning-sponge-character" w="100%" />
          </Box>
          {spongeUnits.map((filled, index) => (
            <SpongeIcon key={index} active={filled} compact={compact} decorative={false} />
          ))}
        </HStack>
      </Flex>

      {locked ? (
        <Text mt="2" fontSize="11px" fontWeight="700" color="#52667A" lineHeight="1.25" position="relative">
          {OUT_OF_BUBBLES_MESSAGE} ({getLockRemainingText(state)})
        </Text>
      ) : null}
    </Box>
  );
}


