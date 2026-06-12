import { useEffect, useState, useMemo } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Tabs, TabList, Tab, TabPanels, TabPanel, Input, InputGroup, InputLeftElement, Tag, TagLabel, chakra } from '@chakra-ui/react';
import { Search, Plus, BookOpen, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { get } from '../api';
import { EmptyState } from '../components/EmptyState';

const MotionBox = chakra(motion.div);
const ICON_BG_ROTATE = ['green.50', 'blue.50', 'purple.50', 'orange.50'];

type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  ispublic?: boolean;
  wordCount?: number;
  user?: { name: string };
  createdAt?: string;
};

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    get<{ data: Category[] } | Category[]>('/categories').then((r: any) => {
      setItems(Array.isArray(r) ? r : r?.data ?? []);
    }).catch(() => {});
  }, []);

  const mine = useMemo(() => items.filter((c) => !c.ispublic), [items]);
  const publicCats = useMemo(() => items.filter((c) => c.ispublic), [items]);
  const filterQ = (list: Category[]) => q ? list.filter((c) => c.name?.toLowerCase().includes(q.toLowerCase())) : list;

  return (
    <Box px="6" pb="10" maxW="1400px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">Bộ từ vựng</Box>
      <HStack justify="space-between" mb="6" flexWrap="wrap" gap="3">
        <VStack align="start" gap="1">
          <Text fontSize="2xl" fontWeight="800">Bộ từ vựng</Text>
          <Text color="gray.500" fontSize="sm">Quản lý bộ từ cá nhân và khám phá bộ từ public.</Text>
        </VStack>
        <HStack gap="2">
          <InputGroup w="280px">
            <InputLeftElement><Icon as={Search} color="gray.400" /></InputLeftElement>
            <Input placeholder="Tìm bộ từ..." value={q} onChange={(e) => setQ(e.target.value)} bg="white" />
          </InputGroup>
          <Button colorScheme="green" borderRadius="xl" leftIcon={<Icon as={Plus} />}>Tạo bộ từ</Button>
        </HStack>
      </HStack>

      <Tabs colorScheme="green" variant="soft-rounded">
        <TabList mb="4">
          <Tab>Của tôi ({mine.length})</Tab>
          <Tab>Khám phá ({publicCats.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px="0">
            <CategoryGrid items={filterQ(mine)} />
          </TabPanel>
          <TabPanel px="0">
            <CategoryGrid items={filterQ(publicCats)} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function CategoryGrid({ items }: { items: Category[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Chưa có bộ từ vựng nào"
        description="từ vựng đầu tiên để bắt đầu hành trình học."
        actionLabel="Tạo bộ từ"
        onAction={() => { /* todo */ }}
        tint="green"
      />
    );
  }
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="4">
      {items.map((c, i) => (
        <MotionBox
          key={c.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition="all 0.2s ease"
        >
          <Link to={`/categories/${c.id}`}>
            <Box
              p="5"
              bg="white"
              borderRadius="2xl"
              boxShadow="card"
              minH="160px"
              _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
              transition="all .15s"
            >
              <HStack mb="3" gap="3">
                <Flex w="48px" h="48px" borderRadius="xl" bg={ICON_BG_ROTATE[i % ICON_BG_ROTATE.length]} align="center" justify="center" fontSize="2xl">
                  {c.icon ? '📚' : '📚'}
                </Flex>
                {c.ispublic && (
                  <Tag size="sm" colorScheme="green" borderRadius="full"><TagLabel>Public</TagLabel></Tag>
                )}
              </HStack>
              <Text fontWeight="700" mb="1" noOfLines={2}>{c.name}</Text>
              <Text fontSize="sm" color="gray.500" mb="3" noOfLines={2}>{c.description || ' '}</Text>
              <HStack justify="space-between" fontSize="sm" color="gray.500">
                <HStack gap="1.5">
                  <Icon as={BookOpen} />
                  <Text>{c.wordCount ?? 0} từ</Text>
                </HStack>
                {c.user?.name && (
                  <HStack gap="1.5">
                    <Icon as={User} />
                    <Text noOfLines={1}>{c.user.name}</Text>
                  </HStack>
                )}
              </HStack>
            </Box>
          </Link>
        </MotionBox>
      ))}
    </SimpleGrid>
  );
}
