import { Box, HStack, Text, VStack } from '@chakra-ui/react';

const BUBBLE_COLORS = {
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
};

export type WordSceneBubbleProps = {
  wordOrPhrase: string;
  meaningVi: string;
  example: string;
  pronunciationHintVi?: string;
  animatedSceneHint?: string;
  compact?: boolean;
};

export function WordSceneBubble({
  wordOrPhrase,
  meaningVi,
  example,
  pronunciationHintVi,
  animatedSceneHint,
  compact = false,
}: WordSceneBubbleProps) {
  return (
    <Box
      className="word-scene-bubble"
      position="relative"
      bg="white"
      border="1px solid"
      borderColor={BUBBLE_COLORS.border}
      borderRadius="2xl"
      px={compact ? '3' : '4'}
      py={compact ? '2.5' : '3'}
      boxShadow="0 14px 28px rgba(31,111,214,0.10)"
      maxW={compact ? '240px' : '320px'}
      willChange="transform, opacity"
    >
      <Box
        position="absolute"
        left={{ base: '22px', md: '-9px' }}
        top={{ base: '-8px', md: '28px' }}
        w="18px"
        h="18px"
        bg="white"
        borderLeft={{ base: '1px solid', md: '1px solid' }}
        borderTop={{ base: '1px solid', md: '1px solid' }}
        borderColor={BUBBLE_COLORS.border}
        transform={{ base: 'rotate(45deg)', md: 'rotate(-45deg)' }}
        aria-hidden="true"
      />

      <VStack align="start" gap={compact ? '1.5' : '2'} position="relative">
        <HStack gap="2" wrap="wrap">
          <Text
            as="span"
            px="2.5"
            py="1"
            borderRadius="full"
            bg={BUBBLE_COLORS.softBlue}
            color={BUBBLE_COLORS.deepBlue}
            fontSize={compact ? 'xs' : 'sm'}
            fontWeight="950"
          >
            word
          </Text>
          <Text fontSize={compact ? 'md' : 'lg'} fontWeight="950" color={BUBBLE_COLORS.text} lineHeight="1.15">
            {wordOrPhrase}
          </Text>
        </HStack>

        <Text color={BUBBLE_COLORS.muted} fontSize={compact ? 'sm' : 'md'} fontWeight="800">
          Nghĩa: {meaningVi}
        </Text>

        {example ? (
          <Box bg="#F8FCFF" border="1px solid" borderColor="#DBEAFE" borderRadius="xl" p={compact ? '2' : '2.5'} w="100%">
            <Text color={BUBBLE_COLORS.text} fontSize={compact ? 'sm' : 'md'} fontWeight="850">
              “{example}”
            </Text>
          </Box>
        ) : null}

        {pronunciationHintVi ? (
          <Text color={BUBBLE_COLORS.deepBlue} fontSize="xs" fontWeight="800">
            🎧 {pronunciationHintVi}
          </Text>
        ) : null}

        {animatedSceneHint && !compact ? (
          <Text color={BUBBLE_COLORS.muted} fontSize="xs" fontWeight="700">
            Gợi ý hình: {animatedSceneHint}
          </Text>
        ) : null}
      </VStack>
    </Box>
  );
}
