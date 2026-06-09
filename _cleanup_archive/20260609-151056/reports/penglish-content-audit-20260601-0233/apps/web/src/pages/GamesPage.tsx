import { useState } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Tag, TagLabel } from '@chakra-ui/react';
import { Play, Headphones, Shuffle, Zap, Target, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

type Game = {
  id: string;
  name: string;
  desc: string;
  icon: any;
  tint: string;
  bg: string;
  difficulty: 'Dễ' | 'Vừa' | 'Khó';
};

const GAMES: Game[] = [
  { id: 'memory', name: 'Memory Match', desc: 'Lật thẻ tìm cặp từ - nghĩa', icon: Target, tint: 'pink.500', bg: 'pink.50', difficulty: 'Dễ' },
  { id: 'scramble', name: 'Word Scramble', desc: 'Xếp lại chữ cái thành từ đúng', icon: Shuffle, tint: 'purple.500', bg: 'purple.50', difficulty: 'Vừa' },
  { id: 'listening', name: 'Listening Challenge', desc: 'Nghe và viết lại từ vựng', icon: Headphones, tint: 'blue.500', bg: 'blue.50', difficulty: 'Khó' },
  { id: 'speed', name: 'Speed Quiz', desc: 'Trả lời nhanh trong thời gian', icon: Zap, tint: 'orange.500', bg: 'orange.50', difficulty: 'Vừa' },
  { id: 'reflex', name: 'Reflex Game', desc: 'Phản xạ với từ xuất hiện ngẫu nhiên', icon: Clock, tint: 'red.500', bg: 'red.50', difficulty: 'Khó' },
  { id: 'champion', name: 'Champion Mode', desc: 'Tổng hợp tất cả game thành 1 thử thách', icon: Trophy, tint: 'red.500', bg: 'red.50', difficulty: 'Khó' },
];

export function GamesPage() {
  const [picked, setPicked] = useState<Game | null>(null);

  if (picked) {
    return (
      <Box px="6" pb="10" maxW="900px" mx="auto">
        <Box as="h2" position="absolute" left="-9999px">Game phản xạ</Box>
        <HStack mb="4" justify="space-between">
          <VStack align="start" gap="0">
            <Text fontSize="sm" color="gray.500">Game phản xạ</Text>
            <Text fontWeight="800" fontSize="xl">{picked.name}</Text>
          </VStack>
          <Button variant="outline" onClick={() => setPicked(null)}>← Quay lại</Button>
        </HStack>
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg="white"
          borderRadius="2xl"
          boxShadow="card"
          p="10"
          minH="400px"
          gap="4"
        >
          <Flex w="80px" h="80px" borderRadius="2xl" bg={picked.bg} align="center" justify="center">
            <Icon as={picked.icon} boxSize="10" color={picked.tint} />
          </Flex>
          <Text fontSize="2xl" fontWeight="800">{picked.name}</Text>
          <Text color="gray.500" textAlign="center" maxW="500px">{picked.desc}</Text>
          <Button colorScheme="green" size="lg" boxShadow="duo-button" leftIcon={<Icon as={Play} />}>Bắt đầu</Button>
          <Text fontSize="xs" color="gray.400">Mini-game này sẽ load từ vựng bạn đã học gần nhất.</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box px="6" pb="10" maxW="1400px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">Game phản xạ</Box>
      <VStack align="start" gap="1" mb="6">
        <Text fontSize="2xl" fontWeight="800">Game phản xạ</Text>
        <Text color="gray.500" fontSize="sm">Học từ vựng qua game tương tác.</Text>
      </VStack>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        {GAMES.map((g, i) => (
          <MotionBox
            key={g.id}
            p="6"
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            cursor="pointer"
            onClick={() => setPicked(g)}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
            whileHover={{ y: -6, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <HStack mb="4" justify="space-between">
              <Flex w="56px" h="56px" borderRadius="xl" bg={g.bg} align="center" justify="center">
                <Icon as={g.icon} boxSize="6" color={g.tint} />
              </Flex>
              <Tag
                size="sm"
                colorScheme={g.difficulty === 'Dễ' ? 'green' : g.difficulty === 'Vừa' ? 'orange' : 'red'}
                borderRadius="full"
              >
                <TagLabel>{g.difficulty}</TagLabel>
              </Tag>
            </HStack>
            <Text fontWeight="700" fontSize="lg" mb="2">{g.name}</Text>
            <Text color="gray.500" fontSize="sm" mb="4">{g.desc}</Text>
            <Button
              size="sm"
              colorScheme="green"
              boxShadow="duo-button"
              leftIcon={<Icon as={Play} />}
              w="100%"
            >
              Chơi ngay
            </Button>
          </MotionBox>
        ))}
      </SimpleGrid>
    </Box>
  );
}
