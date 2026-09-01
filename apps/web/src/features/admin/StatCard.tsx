import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import type { LucideIcon } from 'lucide-react';

const toneStyles = {
  blue: { bg: 'linear-gradient(135deg, #EFF6FF, #FFFFFF)', border: '#BAE6FD', iconBg: '#E0F2FE', color: '#0369A1' },
  green: { bg: 'linear-gradient(135deg, #ECFDF5, #FFFFFF)', border: '#BBF7D0', iconBg: '#DCFCE7', color: '#047857' },
  amber: { bg: 'linear-gradient(135deg, #FFFBEB, #FFFFFF)', border: '#FDE68A', iconBg: '#FEF3C7', color: '#B45309' },
  red: { bg: 'linear-gradient(135deg, #FEF2F2, #FFFFFF)', border: '#FECACA', iconBg: '#FEE2E2', color: '#B91C1C' },
} as const;

export function StatCard({ label, value, helper, icon: CardIcon, tone = 'blue' }: { label: string; value: string; helper: string; icon: LucideIcon; tone?: keyof typeof toneStyles }) {
  const style = toneStyles[tone];

  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={style.border} borderRadius="3xl" bg={style.bg} p={{ base: '4', md: '5' }} minW="0" position="relative" overflow="hidden">
      <Box position="absolute" right="-26px" top="-30px" w="96px" h="96px" borderRadius="full" bg="rgba(14,165,233,0.08)" />
      <HStack position="relative" justify="space-between" align="start" gap="3">
        <VStack align="start" gap="1" minW="0">
          <Text color="#52667A" fontSize="sm" fontWeight="800">{label}</Text>
          <Text color="#0F3557" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="900" letterSpacing="-0.04em">{value}</Text>
          <Text color={style.color} fontSize="sm" fontWeight="800">{helper}</Text>
        </VStack>
        <Box bg={style.iconBg} color={style.color} border="1px solid" borderColor={style.border} borderRadius="2xl" p="3" flexShrink={0}>
          <Icon as={CardIcon} boxSize="5" />
        </Box>
      </HStack>
    </Box>
  );
}
