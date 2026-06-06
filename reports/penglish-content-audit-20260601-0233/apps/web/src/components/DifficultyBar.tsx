import { HStack, Box } from '@chakra-ui/react';

const SEGMENT_COLORS = ['green.400', 'green.500', 'yellow.400', 'orange.400', 'red.500'];

export function DifficultyBar({ level, max = 5 }: { level: number; max?: number }) {
  const safeLevel = Math.max(0, Math.min(level, max));
  return (
    <HStack
      gap="2px"
      w="100%"
      role="meter"
      aria-label={`Độ khó ${safeLevel} trên ${max}`}
      aria-valuenow={safeLevel}
      aria-valuemin={1}
      aria-valuemax={max}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < safeLevel;
        const color = filled
          ? SEGMENT_COLORS[Math.min(safeLevel - 1, max - 1)]
          : 'gray.200';
        return (
          <Box
            key={i}
            flex="1"
            h="6px"
            borderRadius="full"
            bg={color}
            transition="background 0.2s"
          />
        );
      })}
    </HStack>
  );
}
