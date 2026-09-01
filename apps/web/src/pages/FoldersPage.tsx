import { useEffect, useState, useCallback } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Tabs, TabList, Tab, TabPanels, TabPanel, Avatar, Tag, TagLabel, chakra } from '@chakra-ui/react';
import { Folder, ArrowUp, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { get } from '../api';
import { PooSystemState } from '../components/p-english/PooSystemState';

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
  const [pageStatus, setPageStatus] = useState<'loading' | 'error' | 'ready'>('loading');

  const loadFolders = useCallback(() => {
    setPageStatus('loading');
    Promise.allSettled([
      get<{ data: Folder[] }>('/folders/shared/newest').then((r: any) => r?.data ?? r ?? []),
      get<{ data: Folder[] }>('/folders/shared/trending').then((r: any) => r?.data ?? r ?? []),
      get<{ data: Folder[] }>('/folders').then((r: any) => r?.data ?? r ?? []),
    ]).then((results) => {
      setNewest(results[0].status === 'fulfilled' ? results[0].value : []);
      setTrending(results[1].status === 'fulfilled' ? results[1].value : []);
      setMine(results[2].status === 'fulfilled' ? results[2].value : []);
      setPageStatus(results.every((r) => r.status === 'fulfilled') ? 'ready' : 'error');
    });
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  return (
    <Box px={{ base: '4', md: '6' }} pb="10" maxW="1400px" mx="auto">
      <HStack justify="space-between" mb="6" flexWrap="wrap" gap="3">
        <VStack align="start" gap="1">
          <Text as="h1" fontSize="2xl" fontWeight="800">Thư mục</Text>
          <Text color="gray.500" fontSize="sm">Gom nhiều bộ từ vào một nơi, hoặc khám phá thư mục cộng đồng.</Text>
        </VStack>
        <Button as={Link} to="/vocabularies" colorScheme="blue" borderRadius="xl" leftIcon={<Icon as={BookOpen} />}>Khám phá từ vựng</Button>
      </HStack>

      {pageStatus === 'loading' ? (
        <PooSystemState variant="loading" title="Poo đang mở các thư mục..." description="Poo đang gom bộ từ của bạn và cộng đồng vào đúng ngăn." />
      ) : pageStatus === 'error' ? (
        <PooSystemState variant="error" title="Poo chưa mở được các thư mục" description="Một phần dữ liệu chưa về kịp. Bạn tải lại để Poo gom đủ các thư mục nhé." actionLabel="Tải lại thư mục" onAction={loadFolders} />
      ) : (
        <Tabs colorScheme="blue" variant="soft-rounded">
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
      )}
    </Box>
  );
}

function FolderGrid({ items }: { items: Folder[] }) {
  if (items.length === 0) {
    return (
      <PooSystemState
        variant="empty"
        title="Chưa có thư mục"
        description="Poo chưa thấy thư mục nào ở ngăn này. Bạn có thể bắt đầu từ kho từ vựng."
        actionLabel="Khám phá từ vựng"
        actionTo="/vocabularies"
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
          <Box
            cursor="default"
            p="5"
            bg="white"
            borderRadius="2xl"
            boxShadow="card"
            minH="180px"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
            transition="all .15s"
          >
            <HStack mb="3" gap="3">
              <Flex w="48px" h="48px" borderRadius="xl" bg={ICON_BG_ROTATE[i % ICON_BG_ROTATE.length]} align="center" justify="center" fontSize="2xl">
                <Icon as={Folder} boxSize="6" color="orange.600" aria-hidden="true" />
              </Flex>
              <HStack gap="2" ml="auto">
                {(f.upvoteCount ?? 0) > 0 && (
                  <Tag size="sm" colorScheme="orange" borderRadius="full">
                    <Icon as={ArrowUp} mr="1" />
                    <TagLabel>{f.upvoteCount}</TagLabel>
                  </Tag>
                )}
                <Tag size="sm" colorScheme="gray" borderRadius="full"><TagLabel>Sắp mở</TagLabel></Tag>
              </HStack>
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
        </MotionBox>
      ))}
    </SimpleGrid>
  );
}
