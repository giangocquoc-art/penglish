import { Badge } from '@chakra-ui/react';
import { statusTone, type AdminStatusTone } from './adminMockData';

const toneStyles: Record<AdminStatusTone, { bg: string; color: string; borderColor: string }> = {
  green: { bg: '#ECFDF5', color: '#047857', borderColor: '#BBF7D0' },
  blue: { bg: '#EFF6FF', color: '#0369A1', borderColor: '#BAE6FD' },
  amber: { bg: '#FFFBEB', color: '#B45309', borderColor: '#FDE68A' },
  red: { bg: '#FEF2F2', color: '#B91C1C', borderColor: '#FECACA' },
  gray: { bg: '#F8FAFC', color: '#475569', borderColor: '#E2E8F0' },
};

export function StatusBadge({ status, tone }: { status: string; tone?: AdminStatusTone }) {
  const style = toneStyles[tone ?? statusTone(status)];

  return (
    <Badge
      px="2.5"
      py="1"
      borderRadius="full"
      border="1px solid"
      borderColor={style.borderColor}
      bg={style.bg}
      color={style.color}
      textTransform="none"
      fontSize="xs"
      fontWeight="800"
      whiteSpace="nowrap"
    >
      {status}
    </Badge>
  );
}
