
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Tag, TagLabel, List, ListItem, ListIcon, Badge } from '@chakra-ui/react';
import { Check, Star, Zap, Trophy } from 'lucide-react';

type Tier = {
  id: string;
  name: string;
  price: number;
  original?: number;
  period: string;
  popular?: boolean;
  benefits: string[];
  tint: string;
  bg: string;
};

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Miễn phí',
    price: 0,
    period: 'mãi mãi',
    benefits: ['Học từ vựng mỗi ngày', 'Thẻ từ cơ bản', 'Truy cập 5 lộ trình'],
    tint: 'gray.600',
    bg: 'gray.50',
  },
  {
    id: 'support-monthly',
    name: 'Ủng hộ PooEnglish',
    price: 49000,
    period: '/tháng',
    popular: true,
    benefits: ['Học tập vẫn miễn phí', 'Ủng hộ vận hành nội dung', 'Không khoá bài học cốt lõi', 'Góp phần phát triển bạn học Poo'],
    tint: 'green.600',
    bg: 'green.50',
  },
  {
    id: 'support-yearly',
    name: 'Ủng hộ hằng năm',
    price: 399000,
    original: 588000,
    period: '/năm',
    benefits: ['Học tập vẫn miễn phí', 'Tiết kiệm 32%', 'Quà cảm ơn không ảnh hưởng học tập', 'Chủ đề trang trí khi sẵn sàng'],
    tint: 'orange.500',
    bg: 'orange.50',
  },
];

export function PricingPage() {
  return (
    <Box px="6" pb="10" maxW="1200px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">Gói ủng hộ</Box>
      <VStack gap="2" mb="8" textAlign="center">
        <Tag colorScheme="green" borderRadius="full" px="3"><TagLabel>Miễn phí trước</TagLabel></Tag>
        <Text fontSize="3xl" fontWeight="800">Học tập là miễn phí</Text>
        <Text color="gray.500">PooEnglish không bắt bất kỳ ai trả phí cho việc học. Các gói ủng hộ chỉ là tuỳ chọn.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
        {TIERS.map((t) => {
          const isActive = t.id === 'free';
          return (
            <Box
              key={t.id}
              p="6"
              bg="white"
              borderRadius="2xl"
              boxShadow={t.popular ? 'pop' : 'card'}
              border={t.popular ? '2px solid' : '1px solid'}
              borderColor={t.popular ? 'green.400' : 'gray.100'}
              position="relative"
              _hover={{ transform: 'translateY(-4px)' }}
              transition="all .2s"
            >
              {t.popular && (
                <Badge
                  position="absolute"
                  top="-12px"
                  left="50%"
                  transform="translateX(-50%)"
                  colorScheme="green"
                  borderRadius="full"
                  px="3"
                  py="1"
                  boxShadow="glow"
                >
                  <Icon as={Star} mr="1" /> Phổ biến
                </Badge>
              )}
              <Flex w="48px" h="48px" borderRadius="xl" bg={t.bg} align="center" justify="center" mb="4">
                <Icon as={t.id === 'free' ? Zap : t.id === 'support-monthly' ? Star : Trophy} boxSize="6" color={t.tint} />
              </Flex>
              <Text fontSize="lg" fontWeight="700" mb="1">{t.name}</Text>
              <HStack gap="2" mb="1" align="baseline">
                <Text fontSize="3xl" fontWeight="800">
                  {t.price === 0 ? 'Miễn phí' : t.price.toLocaleString('vi-VN') + '₫'}
                </Text>
                {t.original && (
                  <Text fontSize="sm" color="gray.400" textDecoration="line-through">
                    {t.original.toLocaleString('vi-VN')}₫
                  </Text>
                )}
              </HStack>
              <Text color="gray.500" fontSize="sm" mb="5">{t.period}</Text>
              <List gap="2" mb="6" spacing="2">
                {t.benefits.map((b) => (
                  <ListItem key={b} fontSize="sm">
                    <ListIcon as={Check} color="green.500" />
                    {b}
                  </ListItem>
                ))}
              </List>
              <Button
                w="100%"
                colorScheme={t.popular ? 'green' : 'gray'}
                variant={t.popular ? 'solid' : 'outline'}
                boxShadow={t.popular ? 'duo-button' : undefined}
                isDisabled
              >
                {isActive ? 'Đang dùng' : 'Cổng ủng hộ sắp mở'}
              </Button>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
