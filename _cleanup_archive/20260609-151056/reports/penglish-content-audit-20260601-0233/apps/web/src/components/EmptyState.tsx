import { Box, Flex, Text, Button, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const MotionBox = motion.create(Box);

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tint?: 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'gray' | 'yellow';
};

export function EmptyState({ icon, title, description, actionLabel, onAction, tint = 'green' }: Props) {
  return (
    <Flex direction="column" align="center" justify="center" py="16" gap="4" textAlign="center">
      <MotionBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <Flex
          w="120px"
          h="120px"
          borderRadius="full"
          bg={`${tint}.50`}
          align="center"
          justify="center"
          border="2px dashed"
          borderColor={`${tint}.200`}
        >
          <Icon as={icon} boxSize="14" color={`${tint}.400`} />
        </Flex>
      </MotionBox>
      <Box maxW="400px">
        <Text fontWeight="700" fontSize="lg" mb="1">{title}</Text>
        {description && <Text color="gray.500" fontSize="sm">{description}</Text>}
      </Box>
      {actionLabel && onAction && (
        <Button colorScheme={tint === 'gray' ? 'gray' : tint} boxShadow="duo-button" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Flex>
  );
}
