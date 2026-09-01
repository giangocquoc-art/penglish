import { useEffect, useState, useCallback } from 'react';
import { Box, HStack, VStack, Flex, Text, Button, Icon, Textarea, Tag, TagLabel, Badge, SimpleGrid, Spinner, useToast } from '@chakra-ui/react';
import { Sparkles, Send, Image as ImageIcon, AlertTriangle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { get, post } from '../api';
import { PooSystemState } from '../components/p-english/PooSystemState';
import { upsertLearningLoopWords } from '../lib/p-english/learning-loop';

const MotionBox = motion.create(Box);

type Term = { term: string; meaning: string; example?: string };
type Generation = { id: string; text: string; image: string | null; createdAt: string; termCount: number };

export function AiPage() {
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const [terms, setTerms] = useState<Term[]>([]);
  const [usage, setUsage] = useState(0);
  const [usageFailed, setUsageFailed] = useState(false);
  const [history, setHistory] = useState<Generation[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(() => {
    get<{ data: { usage: number } }>('/ai/usage').then((r: any) => {
      setUsage(r?.data?.usage ?? r?.usage ?? 0);
      setUsageFailed(false);
    }).catch(() => {
      setUsageFailed(true);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const generate = async () => {
    if (!draft.trim() || generating) return;
    setGenerating(true);
    setSaved(false);
    try {
      const r: any = await post('/ai/generate-vocabulary', { text: draft });
      const data = r?.data ?? r;
      setTerms(data?.terms ?? []);
      setUsage(data?.usage ?? usage + 1);
      setUsageFailed(false);
      if (data?.terms?.length) {
        setHistory((h) => [{
          id: String(Date.now()),
          text: draft,
          image: null,
          createdAt: new Date().toISOString(),
          termCount: data.terms.length,
        }, ...h]);
      }
    } catch {
      toast({
        title: 'Poo chưa sinh được từ vựng.',
        description: 'Bạn thử lại sau một chút nhé.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveTerms = () => {
    if (terms.length === 0) return;
    // Generated terms go into the local learning loop store so bộ từ giữ được offline.
    upsertLearningLoopWords(terms.map((t) => ({
      term: t.term,
      meaningVi: t.meaning,
      example: t.example,
      source: 'words',
      sourceId: 'ai-generated',
      topic: draft.trim() || undefined,
    })));
    setSaved(true);
    toast({
      title: `Poo đã lưu ${terms.length} từ vào sổ của bạn.`,
      description: 'Bạn mở Sổ học của tôi để ôn lại nhé.',
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <Box px={{ base: '4', md: '6' }} pb="10" maxW="1200px" mx="auto">
      <HStack justify="space-between" mb="6" flexWrap="wrap" gap="3">
        <VStack align="start" gap="1">
          <Text as="h1" fontSize="2xl" fontWeight="800">AI Sinh từ vựng</Text>
          <Text color="gray.500" fontSize="sm">Tạo bộ từ vựng theo chủ đề bạn nhập.</Text>
        </VStack>
        {usageFailed ? (
          <Tag colorScheme="red" borderRadius="full" px="3" py="2">
            <Icon as={AlertTriangle} mr="1.5" />
            <TagLabel>Chưa đọc được lượt dùng</TagLabel>
          </Tag>
        ) : (
          <Tag colorScheme="purple" borderRadius="full" px="3" py="2">
            <Icon as={Sparkles} mr="1.5" />
            <TagLabel>Đã dùng: {usage}</TagLabel>
          </Tag>
        )}
      </HStack>

      <Box bg="white" borderRadius="2xl" boxShadow="card" p="5" mb="6">
        <Text as="label" htmlFor="ai-vocabulary-topic" display="block" fontWeight="800" color="gray.700" mb="2">Chủ đề bạn muốn học</Text>
        <Textarea
          id="ai-vocabulary-topic"
          aria-label="Chủ đề từ vựng muốn tạo"
          placeholder="VD: 20 từ về du lịch biển, level B1..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          minH="120px"
          mb="3"
        />
        <HStack justify="space-between">
          <Button variant="outline" leftIcon={<Icon as={ImageIcon} />} isDisabled>
            Sinh từ ảnh
          </Button>
          <Button
            colorScheme="blue"
            boxShadow="0 4px 0 #185BB2"
            leftIcon={generating ? <Spinner size="sm" /> : <Icon as={Send} />}
            onClick={generate}
            isLoading={generating}
            loadingText="Đang sinh"
          >
            Sinh từ vựng
          </Button>
        </HStack>
      </Box>

      {terms.length > 0 && (
        <Box mb="8">
          <Text fontWeight="700" mb="3">Kết quả ({terms.length} từ)</Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3">
            {terms.map((t, i) => (
              <MotionBox
                key={i}
                bg="white"
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor="gray.100"
                p="4"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                _hover={{ borderColor: 'green.200', boxShadow: 'lg' }}
              >
                <Text fontWeight="700" mb="1">{t.term}</Text>
                <Text color="green.600" fontSize="sm" mb="2">{t.meaning}</Text>
                {t.example && (
                  <Text fontSize="xs" color="gray.500" fontStyle="italic">{t.example}</Text>
                )}
              </MotionBox>
            ))}
          </SimpleGrid>
          <Button mt="3" colorScheme="green" variant="outline" size="sm" leftIcon={saved ? <Icon as={Check} /> : undefined} onClick={saveTerms}>
            {saved ? 'Đã lưu' : 'Lưu vào bộ từ'}
          </Button>
        </Box>
      )}

      <Box>
        <Text fontWeight="700" mb="3">Lịch sử</Text>
        {history.length === 0 ? (
          <PooSystemState
            compact
            variant="empty"
            title="Chưa có lượt sinh nào"
            description="Nhập một chủ đề ở phía trên, Poo sẽ giúp bạn tạo lượt từ đầu tiên."
          />
        ) : (
          <VStack align="stretch" gap="2">
            {history.map((h) => (
              <Box key={h.id} bg="white" borderRadius="xl" boxShadow="card" p="4">
                <HStack justify="space-between" mb="1">
                  <Text fontSize="sm" noOfLines={1}>{h.text}</Text>
                  <Badge colorScheme="purple">{h.termCount} từ</Badge>
                </HStack>
                <Text fontSize="xs" color="gray.400">
                  {new Date(h.createdAt).toLocaleString('vi-VN')}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
