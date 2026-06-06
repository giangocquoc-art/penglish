import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, IconButton, Icon, Progress, Tag, TagLabel, Badge, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { BookOpen, Play, CheckCircle, Circle, Volume2 } from 'lucide-react';
import { get } from '../api';
import { DifficultyBar } from '../components/DifficultyBar';

const MotionBox = motion.create(Box);

type Path = {
  id: string;
  name: string;
  description?: string;
  difficulty?: number;
  wordSetCount?: number;
  group?: { name?: string };
};

type Word = {
  id: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  learned?: boolean;
  srsLevel?: number;
};

export function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const [path, setPath] = useState<Path | null>(null);
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    if (!id) return;
    get<Path>(`/paths/${id}`).then((r: any) => setPath(r?.data ?? r)).catch(() => {});
    get<Word[]>(`/word-sets/${id}/vocabularies`).then((r: any) => {
      setWords(Array.isArray(r) ? r : r?.data ?? []);
    }).catch(() => {});
  }, [id]);

  const stats = useMemo(() => {
    const total = words.length;
    const learned = words.filter((w) => w.learned).length;
    return { total, learned, progress: total > 0 ? Math.round((learned / total) * 100) : 0 };
  }, [words]);

  return (
    <Box px="6" pb="10" maxW="1200px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">{path?.name ?? 'Lộ trình'}</Box>

      <Breadcrumb mb="4" fontSize="sm" color="gray.500">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/home">Trang chủ</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{path?.name ?? '...'}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box bgGradient="linear(135deg, green.50, blue.50)" borderRadius="2xl" boxShadow="card" p="6" mb="6">
        <HStack justify="space-between" mb="3" flexWrap="wrap" gap="3">
          <VStack align="start" gap="1">
            {path?.group?.name && (
              <Tag size="sm" colorScheme="green" borderRadius="full"><TagLabel>{path.group.name}</TagLabel></Tag>
            )}
            <Text fontSize="2xl" fontWeight="800">{path?.name ?? '...'}</Text>
            {path?.description && <Text color="gray.600" fontSize="sm">{path.description}</Text>}
            {typeof path?.difficulty === 'number' && (
              <Box pt="1"><DifficultyBar level={path.difficulty} /></Box>
            )}
          </VStack>
          <Button as={Link} to="/practice" colorScheme="green" leftIcon={<Icon as={Play} />} size="lg" boxShadow="duo-button">
            Luyện tập
          </Button>
        </HStack>
        <HStack gap="6" mt="4">
          <VStack align="start" gap="0">
            <Text fontSize="xs" color="gray.600">Bộ từ</Text>
            <Text fontWeight="800" fontSize="xl">{path?.wordSetCount ?? 0}</Text>
          </VStack>
          <VStack align="start" gap="0">
            <Text fontSize="xs" color="gray.600">Đã thuộc</Text>
            <Text fontWeight="800" fontSize="xl" color="green.600">{stats.learned}/{stats.total}</Text>
          </VStack>
          <Box flex="1" minW="200px">
            <Text fontSize="xs" color="gray.600" mb="1">Tiến độ {stats.progress}%</Text>
            <Progress value={stats.progress} colorScheme="green" borderRadius="full" />
          </Box>
        </HStack>
      </Box>

      {words.length === 0 ? (
        <Flex direction="column" align="center" py="20" color="gray.400" gap="2">
          <Icon as={BookOpen} boxSize="10" />
          <Text>Chưa có từ vựng.</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3">
          {words.map((w, i) => (
            <MotionBox
              key={w.id}
              p="4"
              bg="white"
              borderRadius="xl"
              boxShadow="card"
              _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
              initial={i < 30 ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={i < 30 ? { delay: i * 0.02, duration: 0.25 } : { duration: 0.2 }}
            >
              <HStack justify="space-between" mb="2">
                <Text fontWeight="700" fontSize="lg">{w.term}</Text>
                <Icon as={w.learned ? CheckCircle : Circle} color={w.learned ? 'green.500' : 'gray.300'} boxSize="5" />
              </HStack>
              {w.pronunciation && (
                <HStack gap="1.5" color="gray.500" fontSize="sm" mb="1">
                  <IconButton
                    aria-label="Phát âm"
                    icon={<Icon as={Volume2} />}
                    size="xs"
                    variant="ghost"
                    colorScheme="green"
                    onClick={() => {
                      try {
                        const u = new SpeechSynthesisUtterance(w.term);
                        u.lang = 'en-US';
                        window.speechSynthesis?.speak(u);
                      } catch {}
                    }}
                  />
                  <Text fontStyle="italic">{w.pronunciation}</Text>
                </HStack>
              )}
              {w.partOfSpeech && (
                <Badge mb="2" colorScheme="purple" borderRadius="md">{w.partOfSpeech}</Badge>
              )}
              <Text color="green.600" fontWeight="600" mb="1">{w.meaning}</Text>
              {w.example && <Text fontSize="xs" color="gray.500" fontStyle="italic">{w.example}</Text>}
            </MotionBox>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
