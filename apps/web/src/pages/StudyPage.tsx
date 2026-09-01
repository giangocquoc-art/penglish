import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, SimpleGrid, HStack, VStack, Text, Button, IconButton, Icon, Progress, Tag, TagLabel, Badge, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Circle, Volume2 } from 'lucide-react';
import { get } from '../api';
import { DifficultyBar } from '../components/DifficultyBar';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { PooSystemState } from '../components/p-english/PooSystemState';

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
  const [pageStatus, setPageStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPath(null);
    setWords([]);
    setPageStatus('loading');

    if (!id) {
      setPageStatus('not-found');
      return () => { cancelled = true; };
    }

    Promise.all([
      get<Path>(`/paths/${id}`),
      get<Word[]>(`/word-sets/${id}/vocabularies`),
    ]).then(([pathResponse, wordsResponse]: any[]) => {
      if (cancelled) return;
      const resolvedPath = pathResponse?.data ?? pathResponse;
      const resolvedWords = Array.isArray(wordsResponse) ? wordsResponse : wordsResponse?.data ?? [];
      if (!resolvedPath?.id) {
        setPageStatus('not-found');
        return;
      }
      setPath(resolvedPath);
      setWords(Array.isArray(resolvedWords) ? resolvedWords : []);
      setPageStatus('ready');
    }).catch((error: any) => {
      if (cancelled) return;
      setPageStatus(error?.response?.status === 404 ? 'not-found' : 'error');
    });

    return () => { cancelled = true; };
  }, [id, retryKey]);

  const stats = useMemo(() => {
    const total = words.length;
    const learned = words.filter((w) => w.learned).length;
    return { total, learned, progress: total > 0 ? Math.round((learned / total) * 100) : 0 };
  }, [words]);

  return (
    <OceanPageShell data-testid="study-path-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '6' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 88px)', lg: '10' }} overflowX="hidden">
      <Box maxW="1200px" mx="auto">
        <Box as="h2" position="absolute" left="-9999px">{path?.name ?? 'Lộ trình'}</Box>

        <Breadcrumb mb="4" fontSize="sm" color="gray.500">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/home">Trang chủ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{path?.name ?? 'Lộ trình'}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {pageStatus === 'loading' ? (
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" data-testid="study-path-loading">
            <PooSystemState variant="loading" title="Poo đang mở lộ trình..." description="Poo đang gom thông tin lộ trình và các từ cần học cho bạn." />
          </Box>
        ) : pageStatus === 'not-found' ? (
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" data-testid="study-path-not-found">
            <PooSystemState variant="error" title="Poo không tìm thấy lộ trình này" description="Đường dẫn có thể đã thay đổi. Poo sẽ đưa bạn về lộ trình học đang dùng trên web." actionLabel="Về lộ trình học" actionTo="/learning-path" />
          </Box>
        ) : pageStatus === 'error' ? (
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" data-testid="study-path-error">
            <PooSystemState variant="error" title="Poo chưa mở được lộ trình" description="Kết nối vừa bị ngắt. Bạn thử lại để Poo lấy đủ thông tin và bộ từ nhé." actionLabel="Tải lại lộ trình" onAction={() => setRetryKey((key) => key + 1)} />
          </Box>
        ) : path ? (
          <Box data-testid="study-path-content">
            <Box bgGradient="linear(135deg, green.50, blue.50)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" boxShadow="0 16px 38px rgba(31,111,214,0.08)" p={{ base: '4', md: '6' }} mb="6">
              <HStack justify="space-between" mb="3" flexWrap="wrap" gap="3">
                <VStack align="start" gap="1">
                  {path.group?.name ? <Tag size="sm" colorScheme="green" borderRadius="full"><TagLabel>{path.group.name}</TagLabel></Tag> : null}
                  <Text as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color="#0F172A">{path.name}</Text>
                  {path.description ? <Text color="gray.600" fontSize="sm">{path.description}</Text> : null}
                  {typeof path.difficulty === 'number' ? <Box pt="1"><DifficultyBar level={path.difficulty} /></Box> : null}
                </VStack>
                <Button as={Link} to="/practice" colorScheme="green" leftIcon={<Icon as={Play} />} size="lg" borderRadius="full" boxShadow="duo-button">
                  Luyện tập
                </Button>
              </HStack>
              <HStack gap={{ base: '3', md: '6' }} mt="4" align="end" flexWrap="wrap">
                <VStack align="start" gap="0">
                  <Text fontSize="xs" color="gray.600">Bộ từ</Text>
                  <Text fontWeight="800" fontSize="xl">{path.wordSetCount ?? 0}</Text>
                </VStack>
                <VStack align="start" gap="0">
                  <Text fontSize="xs" color="gray.600">Đã thuộc</Text>
                  <Text fontWeight="800" fontSize="xl" color="green.600">{stats.learned}/{stats.total}</Text>
                </VStack>
                <Box flex="1" minW={{ base: '100%', sm: '200px' }}>
                  <Text fontSize="xs" color="gray.600" mb="1">Tiến độ {stats.progress}%</Text>
                  <Progress value={stats.progress} colorScheme="green" borderRadius="full" />
                </Box>
              </HStack>
            </Box>

            {words.length === 0 ? (
              <Box className="penglish-glass-card" bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" data-testid="study-path-empty">
                <PooSystemState variant="empty" title="Lộ trình này chưa có từ vựng" description="Poo chưa thấy bộ từ nào trong lộ trình này. Bạn có thể mở lộ trình học chính để tiếp tục." actionLabel="Mở lộ trình học" actionTo="/learning-path" />
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3">
                {words.map((word, index) => (
                  <MotionBox key={word.id} p="4" bg="rgba(255,255,255,0.90)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" boxShadow="0 10px 24px rgba(31,111,214,0.06)" _hover={{ transform: 'translateY(-3px)', boxShadow: '0 16px 32px rgba(31,111,214,0.10)' }} initial={index < 30 ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={index < 30 ? { delay: index * 0.02, duration: 0.25 } : { duration: 0.2 }} data-testid="study-path-word-card">
                    <HStack justify="space-between" mb="2">
                      <Text fontWeight="800" fontSize="lg">{word.term}</Text>
                      <Icon as={word.learned ? CheckCircle : Circle} color={word.learned ? 'green.500' : 'gray.300'} boxSize="5" />
                    </HStack>
                    {word.pronunciation ? (
                      <HStack gap="1.5" color="gray.500" fontSize="sm" mb="1">
                        <IconButton aria-label={`Phát âm ${word.term}`} icon={<Icon as={Volume2} />} size="xs" variant="ghost" colorScheme="green" onClick={() => {
                          try {
                            const utterance = new SpeechSynthesisUtterance(word.term);
                            utterance.lang = 'en-US';
                            window.speechSynthesis?.speak(utterance);
                          } catch {}
                        }} />
                        <Text fontStyle="italic">{word.pronunciation}</Text>
                      </HStack>
                    ) : null}
                    {word.partOfSpeech ? <Badge mb="2" colorScheme="purple" borderRadius="md">{word.partOfSpeech}</Badge> : null}
                    <Text color="green.600" fontWeight="700" mb="1">{word.meaning}</Text>
                    {word.example ? <Text fontSize="xs" color="gray.500" fontStyle="italic">{word.example}</Text> : null}
                  </MotionBox>
                ))}
              </SimpleGrid>
            )}
          </Box>
        ) : null}
      </Box>
    </OceanPageShell>
  );
}
