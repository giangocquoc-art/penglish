import { Box, Text } from '@chakra-ui/react';
import type { PracticeSessionFeedback } from '../../lib/p-english/practiceSessionFeedback';

const COLORS = {
  primary: '#2563EB',
  text: '#0F172A',
  muted: '#64748B',
  border: '#BFDBFE',
  bg: '#EFF6FF',
};

export function PracticeSessionFeedbackCard({ feedback }: { feedback: PracticeSessionFeedback }) {
  return (
    <Box mt="5" border="1px solid" borderColor={COLORS.border} bg={COLORS.bg} borderRadius="2xl" p="5">
      <Text fontWeight="950" color={COLORS.primary}>{feedback.titleVi}</Text>
      <Text mt="2" color={COLORS.text} fontWeight="800">{feedback.coachLineVi}</Text>
      <Text mt="2" color={COLORS.muted}>{feedback.confidenceSignalVi}</Text>
      <Text mt="1" color={COLORS.muted}>{feedback.reviewTipVi}</Text>
      <Text mt="3" color={COLORS.primary} fontWeight="900">{feedback.nextActionVi}</Text>
    </Box>
  );
}
