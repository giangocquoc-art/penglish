import { useEffect, useState } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Tabs, TabList, Tab, TabPanels, TabPanel, Avatar, Tag, TagLabel, chakra } from '@chakra-ui/react';
import { Folder, Plus, ArrowUp, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { get } from '../api';
import { EmptyState } from '../components/EmptyState';

const MotionBox = chakra(motion.div);
const ICON_BG_ROTATE = ['orange.50', 'blue.50', 'purple.50', 'green.50'];

type Folder = {
  id: number;
  name: string;
  icon?: string;
  isShared?: boolean;
  upvoteCount?: number;
  createdAt?: string;
  categoryCount?: number;
  wordCount?: number;
  user?: { id: number; name: string; avatar?: string };
};

export function FoldersPage() {
  const [newest, setNewest] = useState<Folder[]>([]);
  const [trending, setTrending] = useState<Folder[]>([]);
  const [mine, setMine] = useState<Folder[]>([]);

  useEffect(() => {
    get<{ data: Folder[] }>('/folders/shared/newest').then((r: any) => setNewest(r?.data ?? r ?? [])).catch(() => {});
    get<{ data: Folder[] }>('/folders/shared/trending').then((r: any) => setTrending(r?.data ?? r ?? [])).catch(() => {});
    get<{ data: Folder[] }>('/folders').then((r: any) => setMine(r?.data ?? r ?? [])).catch(() => {});
  }, []);

  return (
    <Box px="6" pb="10" maxW="1400px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">Thư mục</Box>
      <HStack justify="space-between" mb="6" flexWrap="wrap" gap="3">
        <VStack align="start" gap="1">
          <Text fontSize="2xl" fontWeight="800">Thư mục</Text>
          <Text color="gray.500" fontSize="sm">Tạo thư mục gom nhiều bộ từ, hoặc khám phá thư mục cộng đồng.</Text>
        </VStack>
        <Button colorScheme="green" borderRadius="xl" leftIcon={<Icon as={Plus} />}>Tạo thư mục</Button>
      </HStack>

      <Tabs colorScheme="green" variant="soft-rounded">
        <TabList mb="4">
          <Tab>Của tôi ({mine.length})</Tab>
          <Tab>Mới nhất ({newest.length})</Tab>
          <Tab>Trending ({trending.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px="0"><FolderGrid items={mine} /></TabPanel>
          <TabPanel px="0"><FolderGrid items={newest} /></TabPanel>
          <TabPanel px="0"><FolderGrid items={trending} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function FolderGrid({ items }: { items: Folder[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Folder}
        title="Chưa có thư mục"
        description="Tạo thư mục để gom nhiều bộ từ vào một nơi."
        actionLabel="Tạo thư mục"
        onAction={() => { /* todo */ }}
        tint="orange"
      />
    );
  }
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="4">
      {items.map((f, i) => (
        <MotionBox
          key={f.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition="all 0.2s ease"
        >
          <Link to={`/folders/${f.id}`}>
            <Box
              p="5"
              bg="white"
              borderRadius="2xl"
              boxShadow="card"
              minH="180px"
              _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
              transition="all .15s"
            >
              <HStack mb="3" gap="3" justify="space-between">
                <Flex w="48px" h="48px" borderRadius="xl" bg={ICON_BG_ROTATE[i % ICON_BG_ROTATE.length]} align="center" justify="center" fontSize="2xl">
                  {f.icon?.startsWith('fa') ? '📁' : (f.icon || '📁')}
                </Flex>
                {(f.upvoteCount ?? 0) > 0 && (
                  <Tag size="sm" colorScheme="orange" borderRadius="full">
                    <Icon as={ArrowUp} mr="1" />
                    <TagLabel>{f.upvoteCount}</TagLabel>
                  </Tag>
                )}
              </HStack>
              <Text fontWeight="700" mb="1" noOfLines={2}>{f.name}</Text>
              <HStack fontSize="sm" color="gray.500" gap="3" mb="3">
                <HStack gap="1"><Icon as={BookOpen} /><Text>{f.categoryCount ?? 0} bộ</Text></HStack>
                <HStack gap="1"><Text>•</Text><Text>{f.wordCount ?? 0} từ</Text></HStack>
              </HStack>
              {f.user?.name && (
                <HStack gap="2" pt="3" borderTop="1px solid" borderColor="gray.100">
                  <Avatar size="xs" name={f.user.name} src={f.user.avatar} borderWidth="2px" borderColor="green.500" />
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>{f.user.name}</Text>
                </HStack>
              )}
            </Box>
          </Link>
        </MotionBox>
      ))}
    </SimpleGrid>
  );
}
