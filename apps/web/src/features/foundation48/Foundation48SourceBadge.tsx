import { HStack, Icon, Text } from '@chakra-ui/react';
import { CheckCircle2, FileText, Headphones, PenTool, Video } from 'lucide-react';

export type Foundation48SourceBadgeTone = 'pdf' | 'audio' | 'video' | 'markdown' | 'review' | 'complete' | 'muted';

const toneMap: Record<Foundation48SourceBadgeTone, { bg: string; color: string; border: string; icon: any }> = {
  pdf: { bg: '#EFF6FF', color: '#1F6FD6', border: '#BAE6FD', icon: FileText },
  audio: { bg: '#ECFEFF', color: '#0E7490', border: '#A5F3FC', icon: Headphones },
  video: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', icon: Video },
  markdown: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', icon: CheckCircle2 },
  review: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', icon: PenTool },
  complete: { bg: '#ECFDF5', color: '#15803D', border: '#BBF7D0', icon: CheckCircle2 },
  muted: { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', icon: FileText },
};

export function Foundation48SourceBadge({ label, tone, active = true }: { label: string; tone: Foundation48SourceBadgeTone; active?: boolean }) {
  const resolved = active ? toneMap[tone] : toneMap.muted;
  return (
    <HStack px="2.5" py="1.5" borderRadius="full" bg={resolved.bg} color={resolved.color} border="1px solid" borderColor={resolved.border} gap="1.5" minH="28px">
      <Icon as={resolved.icon} boxSize="3.5" aria-hidden="true" />
      <Text fontSize="11px" fontWeight="950" lineHeight="1" whiteSpace="nowrap">{label}</Text>
    </HStack>
  );
}
