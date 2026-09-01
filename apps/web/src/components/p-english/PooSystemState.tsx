import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { OceanMascot, type OceanMascotSize } from './OceanMascot';

export type PooSystemStateVariant = 'loading' | 'error' | 'empty';

type PooSystemStateProps = {
  variant: PooSystemStateVariant;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  headingAs?: 'h1' | 'h2' | 'h3';
  compact?: boolean;
  mascotSize?: OceanMascotSize;
};

const STATE_VISUALS = {
  loading: {
    label: 'Đang chuẩn bị',
    pose: 'rest',
    motion: 'swim',
    glow: 'rgba(186,230,253,0.46)',
  },
  error: {
    label: 'Poo cần bạn giúp một chút',
    pose: 'coach',
    motion: 'float',
    glow: 'rgba(255,243,196,0.68)',
  },
  empty: {
    label: 'Bắt đầu một nhịp mới',
    pose: 'happy',
    motion: 'float',
    glow: 'rgba(221,245,255,0.58)',
  },
} as const;

export function PooSystemState({
  variant,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  headingAs = 'h2',
  compact = false,
  mascotSize,
}: PooSystemStateProps) {
  const visual = STATE_VISUALS[variant];
  const resolvedMascotSize = mascotSize ?? (compact ? 'sm' : 'md');

  return (
    <VStack
      role={variant === 'error' ? 'alert' : variant === 'loading' ? 'status' : undefined}
      aria-live={variant === 'empty' ? undefined : 'polite'}
      justify="center"
      py={compact ? '6' : { base: '10', md: '12' }}
      px={{ base: '4', md: '6' }}
      gap="3"
      textAlign="center"
      w="100%"
    >
      <Box position="relative" display="grid" placeItems="center" minH={compact ? '76px' : { base: '96px', md: '112px' }}>
        <Box
          aria-hidden="true"
          position="absolute"
          w={compact ? '76px' : { base: '96px', md: '108px' }}
          h={compact ? '76px' : { base: '96px', md: '108px' }}
          borderRadius="full"
          bg={visual.glow}
          border="1px solid rgba(91,188,235,0.16)"
        />
        <OceanMascot
          mascot="poo"
          pose={visual.pose}
          size={resolvedMascotSize}
          decorative
          motion={visual.motion}
          position="relative"
        />
      </Box>

      <VStack gap="1.5" maxW="520px">
        <Text color="#1F6FD6" fontSize="xs" fontWeight="950" letterSpacing="0.12em" textTransform="uppercase">
          {visual.label}
        </Text>
        <Text as={headingAs} color="#102A43" fontSize={compact ? 'lg' : { base: 'xl', md: '2xl' }} fontWeight="950" lineHeight="1.18">
          {title}
        </Text>
        {description ? (
          <Text color="#52667A" fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" lineHeight="1.7">
            {description}
          </Text>
        ) : null}
      </VStack>

      {actionLabel && actionTo ? (
        <Button
          as={RouterLink}
          to={actionTo}
          mt="2"
          borderRadius="full"
          bg="#1F6FD6"
          color="white"
          px="6"
          _hover={{ bg: '#185BB2' }}
          _focusVisible={{ outline: '3px solid', outlineColor: '#5BBCEB', outlineOffset: '3px' }}
        >
          {actionLabel}
        </Button>
      ) : actionLabel && onAction ? (
        <Button
          mt="2"
          borderRadius="full"
          bg="#1F6FD6"
          color="white"
          px="6"
          onClick={onAction}
          _hover={{ bg: '#185BB2' }}
          _focusVisible={{ outline: '3px solid', outlineColor: '#5BBCEB', outlineOffset: '3px' }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </VStack>
  );
}
