import { useState, type ReactNode } from 'react';
import { Box, Button, Collapse, Text, VStack } from '@chakra-ui/react';

export function RevealAnswer({
  label = 'Hiện đáp án',
  answerLabel = 'Đáp án',
  children,
}: {
  label?: string;
  answerLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <VStack align="stretch" gap="3">
      <Button
        alignSelf="start"
        size="sm"
        borderRadius="full"
        bg={open ? '#E0F2FE' : '#EFF6FF'}
        color="#2563EB"
        border="1px solid"
        borderColor="#BFDBFE"
        _hover={{ bg: '#DBEAFE' }}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Ẩn đáp án' : label}
      </Button>
      <Collapse in={open} animateOpacity>
        <Box border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="xl" p="4">
          <Text fontSize="xs" fontWeight="800" color="#15803D" textTransform="uppercase" letterSpacing="wider" mb="1">
            {answerLabel}
          </Text>
          <Box color="#0F172A">{children}</Box>
        </Box>
      </Collapse>
    </VStack>
  );
}
