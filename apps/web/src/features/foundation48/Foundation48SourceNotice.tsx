import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import type { Foundation48Day } from './foundation48Types';

const COLORS = {
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
};

export function Foundation48SourceNotice({ day }: { day: Foundation48Day }) {
  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.76)">
      <VStack align="stretch" gap="2.5">
        <Text fontWeight="950" color={COLORS.text}>Nội dung học hôm nay</Text>
        <Text fontSize="sm" color={COLORS.muted} fontWeight="700" lineHeight="1.6">
          Poo đã rút gọn bài học thành các bước nhỏ để bạn nghe, làm bài và nói lại ngay trên web.
        </Text>
        <HStack gap="2" wrap="wrap">
          <Text px="2.5" py="1" borderRadius="full" bg="#EFF6FF" color="#1F6FD6" fontSize="10px" fontWeight="950">Ngày {day.dayNumber}</Text>
          <Text px="2.5" py="1" borderRadius="full" bg="#ECFDF5" color="#16A34A" fontSize="10px" fontWeight="950">Lesson flow</Text>
          <Text px="2.5" py="1" borderRadius="full" bg="#F8FAFC" color="#52667A" fontSize="10px" fontWeight="950">Tự lưu tiến độ</Text>
        </HStack>
      </VStack>
    </Box>
  );
}
