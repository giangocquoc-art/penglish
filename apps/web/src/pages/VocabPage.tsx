import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Select,
  SimpleGrid,
  Table,
  VStack,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { AlertCircle, BookOpen, CheckCircle, Clock3, Heart, Layers, MessageCircle, Mic2, RotateCcw, Search, Star, Target, Volume2, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  clearWordReviewStatus,
  getAllVocabularyItems,
  isVocabularyDueToday,
  saveWordReviewStatus,
  VOCABULARY_REVIEW_UPDATED_EVENT,
  type VocabularyReviewItem,
  type VocabularyReviewStatus,
} from '../lib/p-english/vocabulary-review';
import { AnimatedWordScene } from '../components/learning-characters/AnimatedWordScene';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { isWordVisualCategory, type WordVisualCategory } from '../lib/p-english/word-visual-map';
import { getLearningLoopSnapshot, LEARNING_LOOP_UPDATED_EVENT, toggleLearningLoopWordFavorite, type LearningLoopWordRecord } from '../lib/p-english/learning-loop';
import { getFoundation48DayPath, FOUNDATION48_BASE_PATH } from '../features/foundation48/foundation48Data';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
  cyan: '#0891B2',
};

type StatusFilter = 'all' | 'review' | 'difficult' | 'known' | 'learned' | 'weak' | 'favorite';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'learned', label: 'Đã học' },
  { value: 'weak', label: 'Từ yếu' },
  { value: 'favorite', label: 'Yêu thích' },
  { value: 'review', label: 'Cần ôn' },
  { value: 'difficult', label: 'Hay sai' },
  { value: 'known', label: 'Đã nhớ' },
];

const STATUS_LABELS: Record<VocabularyReviewStatus, string> = {
  new: 'Từ mới',
  known: 'Đã nhớ',
  review: 'Cần ôn',
  difficult: 'Hay sai',
};

const STATUS_COLORS: Record<VocabularyReviewStatus, string> = {
  new: 'gray',
  known: 'green',
  review: 'orange',
  difficult: 'red',
};

function speakEnglish(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function getLearningLoopSourceLabel(word: LearningLoopWordRecord) {
  if (word.source === 'foundation48') return `48 ngày lấy gốc · ${word.sourceId.replace('day-', 'Ngày ')}`;
  if (word.source === 'interactive-lesson') return 'Bài học tương tác';
  if (word.source === 'shadowing') return 'Nói đuổi';
  if (word.source === 'english-speed') return 'Tốc độ tiếng Anh';
  if (word.source === 'practice') return 'Luyện tập';
  return 'Sổ từ vựng';
}

function getLearningLoopWordReviewPath(word: LearningLoopWordRecord) {
  if (word.source === 'foundation48') {
    const day = Number(word.sourceId.replace('day-', ''));
    return Number.isFinite(day) && day > 0 ? getFoundation48DayPath(day) : FOUNDATION48_BASE_PATH;
  }
  if (word.source === 'interactive-lesson') return `/practice?lessonId=${word.sourceId}&mode=flashcard`;
  if (word.source === 'shadowing') return '/shadowing';
  if (word.source === 'english-speed') return '/english-speed';
  return '/practice';
}

type CommonA1SearchBridge = {
  triggerTerms: string[];
  title: string;
  description: string;
  route: string;
  routeLabel: string;
};

const COMMON_A1_SEARCH_BRIDGES: CommonA1SearchBridge[] = [
  {
    triggerTerms: ['hello', 'hi', 'xin chao', 'chao hoi', 'chao'],
    title: '“hello” là lời chào A1 rất cơ bản.',
    description: 'Bộ từ CEFR hiện có thể chưa chứa đúng mục “hello”. Bạn vẫn có thể luyện lời chào trong bài A1 My morning bằng thẻ từ.',
    route: '/practice?lessonId=reading-a1-my-morning&mode=flashcard',
    routeLabel: 'Mở thẻ từ lời chào A1',
  },
  {
    triggerTerms: ['good morning', 'morning', 'buoi sang', 'chao buoi sang'],
    title: '“morning / good morning” thuộc nhóm chào hỏi và thời gian A1.',
    description: 'Nếu bộ lọc hiện tại đang che kết quả, hãy về tất cả nhóm CEFR hoặc luyện ngay bài A1 My morning.',
    route: '/practice?lessonId=reading-a1-my-morning&mode=match',
    routeLabel: 'Ghép cặp từ vựng A1',
  },
];

function findCommonA1SearchBridge(query: string) {
  const cleanQuery = normalize(query);
  if (!cleanQuery) return undefined;
  return COMMON_A1_SEARCH_BRIDGES.find((bridge) => bridge.triggerTerms.some((term) => cleanQuery.includes(normalize(term)) || normalize(term).includes(cleanQuery)));
}

function formatDateTime(value?: string) {
  if (!value) return 'Chưa có lịch ôn';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có lịch ôn';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function matchesSearch(item: VocabularyReviewItem, query: string) {
  const q = normalize(query);
  if (!q) return true;

  const primaryHaystack = normalize([
    item.term,
    item.meaningVi,
    item.pronunciation ?? '',
    item.example,
    item.exampleMeaningVi,
    item.lessonTitle,
    item.unitTitle,
    item.simpleEnglishMeaning,
    item.vietnameseHint,
    item.flashcardPrompt,
    item.visualCategory ?? '',
    item.animatedSceneHint ?? '',
    item.usefulInSituation ?? '',
    item.confusionNoteVi ?? '',
    item.tags.join(' '),
  ].join(' '));

  if (primaryHaystack.includes(q)) return true;

  const groupIntentQuery = q.length >= 6 && q.includes(' ');
  if (!groupIntentQuery) return false;

  return normalize([
    item.learningGroup.focusVi,
    item.learningGroup.strategyVi,
    item.learningGroup.memoryHookVi,
    item.learningGroup.reviewCueVi,
  ].join(' ')).includes(q);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

function inferVocabularyVisualCategory(item: VocabularyReviewItem): WordVisualCategory {
  const candidates = [item.partOfSpeechOrType, item.term, item.meaningVi, item.example, ...item.tags]
    .filter(Boolean)
    .map((value) => normalize(String(value)));

  if (candidates.some((value) => value.includes('family') || value.includes('mother') || value.includes('father') || value.includes('brother') || value.includes('sister'))) return 'family';
  if (candidates.some((value) => value.includes('morning') || value.includes('afternoon') || value.includes('evening') || value.includes('time') || value.includes('gio') || value.includes('buoi'))) return 'time';
  if (candidates.some((value) => value.includes('hello') || value.includes('hi') || value.includes('goodbye') || value.includes('greeting') || value.includes('chao'))) return 'greeting';
  if (candidates.some((value) => value.includes('thank') || value.includes('meet') || value.includes('polite') || value.includes('cam on') || value.includes('lich su'))) return 'politeness';
  if (candidates.some((value) => value.includes('school') || value.includes('student') || value.includes('teacher') || value.includes('truong'))) return 'school';
  if (candidates.some((value) => value.includes('classroom') || value.includes('pencil') || value.includes('book') || value.includes('lop'))) return 'classroom';
  if (candidates.some((value) => value.includes('food') || value.includes('eat') || value.includes('an '))) return 'food';
  if (candidates.some((value) => value.includes('drink') || value.includes('water') || value.includes('uong'))) return 'drink';
  if (candidates.some((value) => value.includes('place') || value.includes('country') || value.includes('from') || value.includes('noi') || value.includes('quoc gia'))) return 'place';
  if (candidates.some((value) => value.includes('hobby') || value.includes('like') || value.includes('sport') || value.includes('thich'))) return 'hobby';
  if (candidates.some((value) => value.includes('action') || value.includes('question') || value.includes('verb'))) return 'action';

  const directCategory = candidates.find((value) => isWordVisualCategory(value));
  return directCategory && isWordVisualCategory(directCategory) ? directCategory : 'default';
}

function vocabularySceneHint(item: VocabularyReviewItem) {
  return item.exampleMeaningVi || 'Nhìn cảnh nhỏ, đoán nghĩa tiếng Việt, rồi đọc lại ví dụ.';
}

function vocabularyPronunciationHint(item: VocabularyReviewItem) {
  return item.pronunciation ? `Phát âm: ${item.pronunciation}` : 'Nghe mẫu, đọc chậm, rồi nói lại rõ ràng.';
}

function StatCard({ label, value, tone = 'blue' }: { label: string; value: string | number; tone?: 'blue' | 'green' | 'orange' | 'red' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'orange' ? COLORS.amber : tone === 'red' ? COLORS.red : COLORS.primary;
  const bg = tone === 'green' ? '#DCFCE7' : tone === 'orange' ? '#FEF3C7' : tone === 'red' ? '#FEE2E2' : '#DBEAFE';
  return (
    <Box bg={bg} border="1px solid" borderColor="whiteAlpha.700" borderRadius="2xl" p="4">
      <Text fontSize="3xl" fontWeight="700" color={color} lineHeight="1">{value}</Text>
      <Text mt="1" fontSize="sm" fontWeight="700" color={COLORS.muted}>{label}</Text>
    </Box>
  );
}

function vocabularyReviewHubUrl(item: VocabularyReviewItem) {
  const params = new URLSearchParams({ group: item.lessonId, q: item.term });
  return `/vocabularies?${params.toString()}`;
}

function WordActions({ item, onChanged }: { item: VocabularyReviewItem; onChanged: () => void }) {
  const reviewUrl = vocabularyReviewHubUrl(item);
  const markStatus = (status: VocabularyReviewStatus) => {
    saveWordReviewStatus(item.wordId, status);
    onChanged();
  };
  return (
    <HStack data-testid={`vocab-status-chips-${item.wordId}`} wrap="wrap" gap="2">
      <IconButton data-testid={`vocab-speak-${item.wordId}`} aria-label={`Nghe ${item.term}`} icon={<Icon as={Volume2} />} size="sm" borderRadius="full" variant="outline" onClick={() => speakEnglish(item.term)} />
      <Button data-testid={`vocab-review-link-${item.wordId}`} as={Link} to={reviewUrl} size="sm" borderRadius="full" leftIcon={<Icon as={BookOpen} />} variant="outline">
        Ôn lại
      </Button>
      <Button data-testid={`vocab-mark-known-${item.wordId}`} size="sm" borderRadius="full" leftIcon={<Icon as={CheckCircle} />} bg="#DCFCE7" color="#166534" onClick={() => markStatus('known')}>
        Đã nhớ
      </Button>
      <Button data-testid={`vocab-mark-review-${item.wordId}`} size="sm" borderRadius="full" leftIcon={<Icon as={RotateCcw} />} bg="#FFF7ED" color="#9A3412" onClick={() => markStatus('review')}>
        Cần ôn
      </Button>
      <Button data-testid={`vocab-mark-difficult-${item.wordId}`} size="sm" borderRadius="full" bg="#FEE2E2" color="#991B1B" onClick={() => markStatus('difficult')}>
        Hay sai
      </Button>
      <Button data-testid={`vocab-clear-status-${item.wordId}`} size="sm" borderRadius="full" variant="ghost" color={COLORS.muted} onClick={() => { clearWordReviewStatus(item.wordId); onChanged(); }}>
        Xóa khỏi sổ
      </Button>
    </HStack>
  );
}

function WordCard({ item, onChanged }: { item: VocabularyReviewItem; onChanged: () => void }) {
  return (
    <Box data-testid="vocab-mobile-card" className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '4', md: '5' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" minW="0" overflow="hidden">
      <Flex justify="space-between" gap="3" align="start">
        <Box minW="0">
          <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{item.term}</Text>
          <Text mt="1" color={COLORS.primary} fontWeight="700">{item.meaningVi}</Text>
          <Text mt="1" color={COLORS.muted} fontStyle="italic">{item.pronunciation || 'Chưa có phát âm'}</Text>
        </Box>
        <Badge colorScheme={STATUS_COLORS[item.status]} borderRadius="full" px="3" py="1" flexShrink={0}>{STATUS_LABELS[item.status]}</Badge>
      </Flex>

      <Box mt="4" display={{ base: 'none', sm: 'block' }}>
        <AnimatedWordScene
          wordOrPhrase={item.term}
          meaningVi={item.meaningVi}
          example={item.example}
          visualCategory={inferVocabularyVisualCategory(item)}
          animatedSceneHint={vocabularySceneHint(item)}
          pronunciationHintVi={vocabularyPronunciationHint(item)}
          size="compact"
          mood={item.status === 'known' ? 'cheering' : item.status === 'difficult' || item.status === 'review' ? 'thinking' : 'friendly'}
          showSpeechBubble={false}
        />
      </Box>

      <Box mt="4" bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4">
        <Text fontSize="xs" fontWeight="700" color={COLORS.primary} textTransform="uppercase" letterSpacing="0.08em">Ví dụ tiếng Anh</Text>
        <Text mt="1" fontWeight="700" color={COLORS.text}>{item.example}</Text>
        <Text mt="1" color={COLORS.muted}>{item.exampleMeaningVi}</Text>
      </Box>
      <HStack mt="4" wrap="wrap" gap="2">
        <Tag borderRadius="full" bg="#E0F2FE" color={COLORS.cyan}><TagLabel>{item.unitTitle}</TagLabel></Tag>
        <Tag borderRadius="full" bg="#EEF2FF" color={COLORS.primary}><TagLabel>{item.partOfSpeechOrType}</TagLabel></Tag>
        {item.nextReviewAt ? <Tag borderRadius="full" bg="#FEF3C7" color={COLORS.amber}><TagLabel>Ôn: {formatDateTime(item.nextReviewAt)}</TagLabel></Tag> : null}
      </HStack>
      <Box as="details" mt="4" bg="#F0F9FF" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="4" data-testid={`vocab-learning-hint-${item.wordId}`}>
        <Box as="summary" cursor="pointer" fontSize="xs" fontWeight="700" color={COLORS.primary} textTransform="uppercase" letterSpacing="0.08em">Mẹo học nhóm {item.learningGroup.cefrLevel}</Box>
        <Text mt="2" color={COLORS.text} fontSize="sm" fontWeight="700">{item.learningGroup.memoryHookVi}</Text>
        <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="700">{item.learningGroup.reviewCueVi}</Text>
      </Box>
      <Text mt="4" color={COLORS.muted} fontSize="sm" fontWeight="700">
        Nhìn cảnh, đọc nghĩa tiếng Việt, sau đó nghe lại từ trước khi chọn trạng thái ôn.
      </Text>
      <Box mt="4">
        <WordActions item={item} onChanged={onChanged} />
      </Box>
    </Box>
  );
}

function LearnedWordCard({ word, onChanged }: { word: LearningLoopWordRecord; onChanged: () => void }) {
  return (
    <Box bg="rgba(255,255,255,0.88)" border="1px solid" borderColor={word.weakCount > 0 || word.mastery <= 1 ? '#FED7AA' : '#BAE6FD'} borderRadius="2xl" p="3" minW="0">
      <HStack justify="space-between" align="start" gap="3">
        <Box minW="0">
          <Text color={COLORS.text} fontWeight="700" noOfLines={1}>{word.term}</Text>
          <Text mt="1" color={COLORS.primary} fontSize="sm" fontWeight="700" noOfLines={2}>{word.meaningVi}</Text>
        </Box>
        <IconButton
          aria-label={word.favorite ? `Bỏ yêu thích ${word.term}` : `Yêu thích ${word.term}`}
          icon={<Icon as={word.favorite ? Star : Heart} />}
          size="sm"
          borderRadius="full"
          color={word.favorite ? '#D97706' : COLORS.muted}
          bg={word.favorite ? '#FEF3C7' : 'white'}
          variant="outline"
          onClick={() => { toggleLearningLoopWordFavorite(word.id); onChanged(); }}
        />
      </HStack>
      {word.example ? <Text mt="2" color={COLORS.muted} fontSize="sm" fontWeight="700" noOfLines={2}>{word.example}</Text> : null}
      <HStack mt="3" gap="2" wrap="wrap">
        <Badge borderRadius="full" bg="#EFF6FF" color={COLORS.primary}>{word.cefrLevel ?? 'A1'}</Badge>
        <Badge borderRadius="full" bg={word.weakCount > 0 || word.mastery <= 1 ? '#FFF7ED' : '#DCFCE7'} color={word.weakCount > 0 || word.mastery <= 1 ? '#C2410C' : '#166534'} textTransform="none">
          Thuộc {word.mastery}/5
        </Badge>
        {word.topic ? <Badge borderRadius="full" bg="#F0F9FF" color={COLORS.cyan} textTransform="none">{word.topic}</Badge> : null}
      </HStack>
      <HStack mt="3" justify="space-between" gap="2" align="end">
        <Box minW="0">
          <Text color={COLORS.muted} fontSize="xs" fontWeight="700">Nguồn: {getLearningLoopSourceLabel(word)}</Text>
          <Text mt="1" color={COLORS.muted} fontSize="xs" fontWeight="700">Lần ôn gần nhất: {formatDateTime(word.lastReviewedAt ?? word.learnedAt)}</Text>
        </Box>
        <HStack gap="1.5" flexShrink={0}>
          <IconButton aria-label={`Nghe ${word.term}`} icon={<Icon as={Volume2} />} size="xs" borderRadius="full" variant="outline" onClick={() => speakEnglish(word.term)} />
          <Button as={Link} to={getLearningLoopWordReviewPath(word)} size="xs" borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }}>
            Ôn lại
          </Button>
          <Button size="xs" borderRadius="full" variant="ghost" color={COLORS.muted} onClick={() => { toggleLearningLoopWordFavorite(word.id); onChanged(); }}>
            Xóa khỏi sổ
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}

export function VocabPage() {
  const readVocabulary = () => {
    try {
      return { items: getAllVocabularyItems(), error: '' };
    } catch (error) {
      return { items: [] as VocabularyReviewItem[], error: error instanceof Error ? error.message : 'Không đọc được sổ từ vựng trên thiết bị này.' };
    }
  };
  const [vocabularyState, setVocabularyState] = useState(readVocabulary);
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [lessonFilter, setLessonFilter] = useState(() => new URLSearchParams(window.location.search).get('group') ?? 'all');
  const items = vocabularyState.items;
  const [learningLoopSnapshot, setLearningLoopSnapshot] = useState(() => getLearningLoopSnapshot());

  const refresh = () => {
    setVocabularyState(readVocabulary());
    setLearningLoopSnapshot(getLearningLoopSnapshot());
  };

  useEffect(() => {
    refresh();
    if (typeof window === 'undefined') return undefined;
    window.addEventListener(VOCABULARY_REVIEW_UPDATED_EVENT, refresh);
    window.addEventListener(LEARNING_LOOP_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(VOCABULARY_REVIEW_UPDATED_EVENT, refresh);
      window.removeEventListener(LEARNING_LOOP_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const learnedWords = learningLoopSnapshot.learnedWords;
  const weakWords = learningLoopSnapshot.weakWords;
  const favoriteWords = learningLoopSnapshot.favoriteWords;
  const stats = useMemo(() => {
    const total = Math.max(items.length, learnedWords.length);
    const known = items.filter((item) => item.status === 'known').length;
    const review = items.filter((item) => item.status === 'review').length;
    const difficult = Math.max(items.filter((item) => item.status === 'difficult' || item.wrongCount > 0).length, weakWords.length);
    const today = items.filter((item) => isVocabularyDueToday(item)).length + weakWords.length;
    return { total, known, review, difficult, today, progressPercent: total > 0 ? Math.round((known / total) * 100) : 0 };
  }, [items, learnedWords.length, weakWords.length]);

  const lessonOptions = useMemo(() => {
    const seen = new Map<string, string>();
    items.forEach((item) => {
      if (!seen.has(item.lessonId)) seen.set(item.lessonId, `${item.unitTitle} · ${item.lessonTitle}`);
    });
    return Array.from(seen, ([id, label]) => ({ id, label }));
  }, [items]);

  const learningGroupOptions = useMemo(() => {
    const seen = new Map<string, { cefrLevel: string; lessonId: string; focusVi: string; dailyRoutineVi: string }>();
    items.forEach((item) => {
      const level = item.learningGroup.cefrLevel;
      if (!seen.has(level)) {
        seen.set(level, {
          cefrLevel: level,
          lessonId: item.lessonId,
          focusVi: item.learningGroup.focusVi,
          dailyRoutineVi: item.learningGroup.dailyRoutineVi,
        });
      }
    });
    return Array.from(seen.values());
  }, [items]);

  const todayReviewItems = useMemo(() => items.filter((item) => isVocabularyDueToday(item)), [items]);
  const nextReviewItem = todayReviewItems[0];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (lessonFilter !== 'all' && item.lessonId !== lessonFilter) return false;
      if (statusFilter === 'learned' && !learnedWords.some((word) => normalize(word.term) === normalize(item.term))) return false;
      if (statusFilter === 'weak' && !weakWords.some((word) => normalize(word.term) === normalize(item.term))) return false;
      if (statusFilter === 'favorite' && !favoriteWords.some((word) => normalize(word.term) === normalize(item.term))) return false;
      if (statusFilter === 'review' && !isVocabularyDueToday(item)) return false;
      if (statusFilter === 'difficult' && !(item.status === 'difficult' || item.wrongCount > 0)) return false;
      if (statusFilter === 'known' && item.status !== 'known') return false;
      return matchesSearch(item, query);
    });
  }, [favoriteWords, items, learnedWords, lessonFilter, query, statusFilter, weakWords]);

  const filterCount = (filter: StatusFilter) => {
    if (filter === 'all') return items.length;
    if (filter === 'learned') return learnedWords.length;
    if (filter === 'weak') return weakWords.length;
    if (filter === 'favorite') return favoriteWords.length;
    if (filter === 'review') return items.filter((item) => isVocabularyDueToday(item)).length;
    if (filter === 'difficult') return Math.max(items.filter((item) => item.status === 'difficult' || item.wrongCount > 0).length, weakWords.length);
    return items.filter((item) => item.status === filter).length;
  };

  const commonA1SearchBridge = filtered.length === 0 ? findCommonA1SearchBridge(query) : undefined;
  const hasActiveFilters = Boolean(query.trim()) || statusFilter !== 'all' || lessonFilter !== 'all';
  const starterPackOptions = learningGroupOptions.slice(0, 3);

  if (vocabularyState.error) {
    return (
      <OceanPageShell data-testid="vocab-mobile-root" variant="vocab" overlayStrength="strong" minH="calc(100vh - 72px)" px={{ base: '3', md: '6' }} py={{ base: '2', md: '5' }} pb={{ base: 'var(--penglish-mobile-safe-bottom)', lg: '12' }} overflowX="hidden">
        <Box maxW="760px" mx="auto" className="penglish-glass-card" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '5', md: '8' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" role="alert">
          <Tag borderRadius="full" bg="#FEF3C7" color="#9A3412" mb="4"><TagLabel>Cần tải lại sổ từ</TagLabel></Tag>
          <Text as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="700" color={COLORS.text}>Poo chưa mở được sổ từ vựng</Text>
          <Text mt="3" color={COLORS.muted} fontWeight="700">Hãy thử tải lại sổ từ trên thiết bị này. Nếu lỗi còn lại, Poo sẽ ghi nhận nguyên nhân.</Text>
          <Text mt="3" color="#9A3412" fontSize="sm" fontWeight="700">{vocabularyState.error}</Text>
          <Button mt="6" borderRadius="full" bg={COLORS.primary} color="white" onClick={refresh}>Thử lại</Button>
        </Box>
      </OceanPageShell>
    );
  }

  return (
    <OceanPageShell data-testid="vocab-mobile-root" variant="vocab" overlayStrength="strong" minH="calc(100vh - 72px)" px={{ base: '3', md: '6' }} py={{ base: '2', md: '5' }} pb={{ base: 'var(--penglish-mobile-safe-bottom)', lg: '12' }} overflowX="hidden">
      <Box maxW="1480px" mx="auto" minW="0">
        <Box as="h1" position="absolute" left="-9999px">Sổ học của tôi</Box>

        <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '7' }} mb={{ base: '3', md: '6' }} boxShadow="0 14px 34px rgba(37, 99, 235, 0.07)" position="relative" overflow="hidden">
          <Flex justify="space-between" align={{ base: 'start', lg: 'center' }} direction={{ base: 'column', lg: 'row' }} gap={{ base: '3', md: '5' }}>
            <Box>
              <HStack wrap="wrap" mb={{ base: '2', md: '3' }} display={{ base: 'none', sm: 'flex' }}>
                <Tag borderRadius="full" bg="#FEF3C7" color={COLORS.text}><TagLabel>⭐ Sổ học của tôi</TagLabel></Tag>
                <Tag borderRadius="full" bg="#DCFCE7" color="#166534"><TagLabel>Poo lưu từ và lỗi sai</TagLabel></Tag>
              </HStack>
              <Text as="h2" fontSize={{ base: 'xl', md: '5xl' }} lineHeight="1.05" fontWeight="800" color={COLORS.text}>Sổ học của tôi</Text>
              <Text mt={{ base: '2', md: '3' }} maxW="760px" color={COLORS.muted} fontWeight="700" lineHeight="1.55" fontSize={{ base: 'sm', md: 'md' }} noOfLines={{ base: 2, md: undefined }}>
                Một nơi để Poo lưu từ vựng đã học, lỗi sai cần ôn, câu nói đuổi khó, mẫu câu hay dùng và bài cần học lại sau mỗi buổi học.
              </Text>
              <HStack mt={{ base: '3', md: '5' }} wrap="wrap" gap={{ base: '2', md: '3' }} display={{ base: 'none', sm: 'flex' }}>
                <Button borderRadius="full" bg={COLORS.primary} color="white" leftIcon={<Icon as={BookOpen} />} onClick={() => { setLessonFilter('all'); setStatusFilter('all'); setQuery(''); }} _hover={{ bg: '#1D4ED8' }}>
                  Xem sổ học
                </Button>
                <Button borderRadius="full" bg="#FFF7ED" color="#9A3412" leftIcon={<Icon as={RotateCcw} />} onClick={() => { setStatusFilter('review'); setLessonFilter('all'); setQuery(''); }}>
                  Ôn hôm nay
                </Button>
                <Button as={Link} to="/practice?lessonId=unit-1-greetings-introduction&mode=flashcard" borderRadius="full" variant="outline" leftIcon={<Icon as={BookOpen} />}>
                  Ôn lại
                </Button>
                <Button as={Link} to="/practice?lessonId=unit-1-greetings-introduction&mode=match" borderRadius="full" variant="outline" leftIcon={<Icon as={Target} />}>
                  Ghép cặp
                </Button>
              </HStack>
            </Box>
            <VStack minW={{ base: '100%', lg: '360px' }} align={{ base: 'stretch', lg: 'center' }} gap="3" display={{ base: 'none', sm: 'flex' }}>
              <HStack justify={{ base: 'center', lg: 'flex-end' }} gap="4" pointerEvents="none" display={{ base: 'none', sm: 'flex' }}>
                <OceanMascot mascot="saoNhi" pose="sparkle" size="md" decorative motion="celebrate" />
                <OceanMascot mascot="mucMo" pose="teacher" size="md" decorative motion="float" />
              </HStack>
              <Box w="100%">
                <Text fontWeight="700" color={COLORS.text} mb="2">Tiến độ thuộc từ</Text>
                <Progress value={stats.progressPercent} colorScheme="green" bg="white" borderRadius="full" h="12px" />
                <Text mt="2" color={COLORS.muted} fontWeight="700">
                  {stats.progressPercent}% · {stats.known}/{stats.total} từ đã nhớ
                </Text>
              </Box>
            </VStack>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 5 }} gap="2.5" mb={{ base: '3', md: '5' }} data-testid="vocab-notebook-tabs">
          {[
            { label: 'Từ vựng đã lưu', value: learnedWords.length || stats.total, icon: BookOpen, tone: '#EFF6FF' },
            { label: 'Lỗi sai cần ôn', value: stats.difficult, icon: AlertCircle, tone: '#FFF7ED' },
            { label: 'Câu nói đuổi khó', value: 'Nói đuổi', icon: Mic2, tone: '#F0F9FF' },
            { label: 'Mẫu câu hay dùng', value: 'A1/A2', icon: MessageCircle, tone: '#F0FDF4' },
            { label: 'Bài cần học lại', value: stats.today, icon: RotateCcw, tone: '#FEF3C7' },
          ].map((tab) => (
            <Box key={tab.label} bg={tab.tone} border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3" minW="0">
              <HStack gap="2" align="center">
                <Icon as={tab.icon} color={COLORS.primary} />
                <Text color={COLORS.text} fontWeight="800" fontSize="sm" noOfLines={1}>{tab.label}</Text>
              </HStack>
              <Text mt="2" color={COLORS.muted} fontWeight="700" fontSize="xs">Trạng thái: {tab.value}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '5' }} mb={{ base: '3', md: '5' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" data-testid="vocab-learning-guidance" position={{ base: 'static', lg: 'relative' }}>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="3" mb="4" display={{ base: 'none', md: 'grid' }}>
            {learningGroupOptions.map((group) => (
              <Box key={group.cefrLevel} bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="3">
                <HStack mb="1" justify="space-between">
                  <Badge colorScheme="blue" borderRadius="full">{group.cefrLevel}</Badge>
                  <Text fontSize="xs" fontWeight="700" color={COLORS.cyan}>Nhịp ôn</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="700" color={COLORS.text}>{group.focusVi}</Text>
                <Text mt="1" fontSize="xs" fontWeight="700" color={COLORS.muted}>{group.dailyRoutineVi}</Text>
                <Button mt="3" size="xs" borderRadius="full" colorScheme="blue" variant="outline" onClick={() => { setLessonFilter(group.lessonId); setStatusFilter('all'); setQuery(''); }}>
                  Học nhóm này
                </Button>
              </Box>
            ))}
          </SimpleGrid>
          <Flex gap="3" direction={{ base: 'column', lg: 'row' }} align={{ base: 'stretch', lg: 'center' }} justify="space-between">
            <InputGroup maxW={{ base: '100%', lg: '380px' }}>
              <InputLeftElement><Icon as={Search} color="gray.400" /></InputLeftElement>
              <Input data-testid="vocab-mobile-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm từ, lỗi sai, câu khó..." aria-label="Tìm trong sổ học" borderRadius="xl" />
            </InputGroup>
            <HStack wrap={{ base: 'nowrap', md: 'wrap' }} gap="2" overflowX={{ base: 'auto', md: 'visible' }} pb={{ base: '1', md: '0' }}>
              {STATUS_FILTERS.map((filter) => {
                const active = statusFilter === filter.value;
                return (
                  <Button
                    key={filter.value}
                    data-testid={`vocab-status-filter-${filter.value}`}
                    size="sm"
                    flexShrink={0}
                    borderRadius="full"
                    colorScheme={active ? 'blue' : 'gray'}
                    variant={active ? 'solid' : 'outline'}
                    aria-pressed={active}
                    onClick={() => setStatusFilter(filter.value)}
                    _focusVisible={{ outline: '3px solid', outlineColor: COLORS.primary, outlineOffset: '2px' }}
                  >
                    {filter.label} ({filterCount(filter.value)})
                  </Button>
                );
              })}
            </HStack>
            <Select data-testid="vocab-lesson-filter" value={lessonFilter} onChange={(event) => setLessonFilter(event.target.value)} aria-label="Lọc từ vựng theo nhóm CEFR" maxW={{ base: '100%', lg: '320px' }} borderRadius="xl">
              <option value="all">Tất cả nhóm CEFR</option>
              {lessonOptions.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.label}</option>)}
            </Select>
          </Flex>
        </Box>

        <Box data-testid="vocab-review-today-card" className="penglish-glass-card" bg="rgba(255,255,255,0.82)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '5' }} mb={{ base: '3', md: '5' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)">
          <Flex gap="3" align={{ base: 'start', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }}>
            <Box minW="0">
              <Tag borderRadius="full" bg="#FFF7ED" color="#9A3412"><TagLabel>Lỗi sai cần ôn</TagLabel></Tag>
              <Text mt="2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" color={COLORS.text}>{stats.today} mục cần ôn hôm nay</Text>
              <Text mt="1" color={COLORS.muted} fontWeight="700" noOfLines={{ base: 2, md: undefined }}>
                {nextReviewItem ? `${nextReviewItem.term} · ${nextReviewItem.meaningVi}` : 'Hôm nay chưa có từ cần ôn. Bạn có thể học thêm từ mới hoặc xem lại nhóm A1.'}
              </Text>
            </Box>
            {nextReviewItem ? (
              <HStack wrap="wrap" gap="2" flexShrink={0} data-testid="vocab-next-review-card">
                <Button size="sm" borderRadius="full" bg="#DCFCE7" color="#166534" onClick={() => { saveWordReviewStatus(nextReviewItem.wordId, 'known'); refresh(); }}>Đã nhớ</Button>
                <Button size="sm" borderRadius="full" bg="#FFF7ED" color="#9A3412" onClick={() => { saveWordReviewStatus(nextReviewItem.wordId, 'review'); refresh(); }}>Cần ôn</Button>
                <Button size="sm" borderRadius="full" bg="#FEE2E2" color="#991B1B" onClick={() => { saveWordReviewStatus(nextReviewItem.wordId, 'difficult'); refresh(); }}>Hay sai</Button>
                <IconButton aria-label={`Nghe ${nextReviewItem.term}`} icon={<Icon as={Volume2} />} size="sm" borderRadius="full" variant="outline" onClick={() => speakEnglish(nextReviewItem.term)} />
              </HStack>
            ) : null}
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 2, lg: 5 }} gap={{ base: '2', md: '4' }} mb={{ base: '3', md: '6' }} display={{ base: 'none', sm: 'grid' }}>
          <StatCard label="Tổng từ" value={stats.total} />
          <StatCard label="Đã học" value={learnedWords.length > 0 ? learnedWords.length : 'Chưa bắt đầu'} tone="green" />
          <StatCard label="Ôn hôm nay" value={stats.today > 0 ? stats.today : 'Sẵn sàng'} tone="orange" />
          <StatCard label="Từ yếu" value={stats.difficult > 0 ? stats.difficult : 'Poo sẽ lưu'} tone="red" />
          <StatCard label="Yêu thích" value={favoriteWords.length > 0 ? favoriteWords.length : 'Chọn ⭐'} />
        </SimpleGrid>

        {learnedWords.length > 0 ? (
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '5' }} mb={{ base: '3', md: '5' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" data-testid="vocab-learned-words-panel">
            <HStack justify="space-between" align="start" gap="3" wrap="wrap" mb="3">
              <HStack align="start" gap="3">
                <Flex w="42px" h="42px" borderRadius="2xl" bg="#EFF6FF" color={COLORS.primary} align="center" justify="center" border="1px solid #BAE6FD" flexShrink={0}>
                  <Icon as={Layers} boxSize="5" />
                </Flex>
                <Box>
                  <Text fontWeight="700" color={COLORS.text}>Từ vựng đã lưu từ bài học thật</Text>
                  <Text mt="1" color={COLORS.muted} fontWeight="700" fontSize="sm">Poo gom từ từ 48 ngày lấy gốc, Nói đuổi và bài học tương tác, kèm nguồn bài, lần ôn gần nhất, trạng thái và hành động Ôn lại/Xóa khỏi sổ.</Text>
                </Box>
              </HStack>
              <HStack gap="2" wrap="wrap">
                <Button size="sm" borderRadius="full" bg="#FFF7ED" color="#9A3412" leftIcon={<Icon as={RotateCcw} />} onClick={() => { setStatusFilter('weak'); setLessonFilter('all'); setQuery(''); }}>
                  Từ yếu ({weakWords.length})
                </Button>
                <Button size="sm" borderRadius="full" variant="outline" leftIcon={<Icon as={Star} />} onClick={() => { setStatusFilter('favorite'); setLessonFilter('all'); setQuery(''); }}>
                  Yêu thích ({favoriteWords.length})
                </Button>
              </HStack>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="3">
              {(statusFilter === 'weak' ? weakWords : statusFilter === 'favorite' ? favoriteWords : learnedWords).slice(0, 9).map((word) => (
                <LearnedWordCard key={word.id} word={word} onChanged={refresh} />
              ))}
            </SimpleGrid>
          </Box>
        ) : null}

        {starterPackOptions.length > 0 ? (
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '5' }} mb={{ base: '3', md: '5' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)">
            <HStack justify="space-between" align="start" gap="3" wrap="wrap" mb="3">
              <Box>
                <Text fontWeight="700" color={COLORS.text}>Bộ từ mẫu cho người mới</Text>
                <Text mt="1" color={COLORS.muted} fontWeight="700" fontSize="sm">Chọn A1/A2/B1 để xem từ theo chủ đề. Bắt đầu từ A1 nếu bạn chưa học bài nào.</Text>
              </Box>
              <Button as={Link} to="/practice?lessonId=unit-1-greetings-introduction&mode=flashcard" size="sm" borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }}>
                Ôn ngay
              </Button>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
              {starterPackOptions.map((group) => (
                <Box key={`starter-${group.cefrLevel}`} bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="3">
                  <Badge colorScheme="blue" borderRadius="full">{group.cefrLevel}</Badge>
                  <Text mt="2" fontWeight="700" color={COLORS.text}>{group.focusVi}</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="700">{group.dailyRoutineVi}</Text>
                  <Button mt="3" size="xs" borderRadius="full" variant="outline" colorScheme="blue" onClick={() => { setLessonFilter(group.lessonId); setStatusFilter('all'); setQuery(''); }}>
                    Xem nhóm này
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        ) : null}

        {items.length === 0 ? (
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="8" textAlign="center" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)">
            <Icon as={Waves} boxSize="10" color={COLORS.primary} />
            <Text mt="4" fontSize="2xl" fontWeight="700" color={COLORS.text}>Chưa có gì trong sổ học</Text>
            <Text mt="2" color={COLORS.muted}>Chưa có gì trong sổ học. Học một bài đầu tiên để Poo lưu lại từ và lỗi sai cho bạn nhé.</Text>
            <Button as={Link} to="/learning-path/lesson/unit-1-greetings/unit-1-greetings-vocabulary-0" mt="5" borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }}>Học bài A1 đầu tiên</Button>
          </Box>
        ) : filtered.length === 0 ? (
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="8" textAlign="center" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)">
            <Icon as={Search} boxSize="10" color={COLORS.primary} />
            <Text mt="4" fontSize="2xl" fontWeight="700" color={COLORS.text}>{commonA1SearchBridge ? 'Có gợi ý A1 cho từ bạn tìm' : 'Không có từ khớp bộ lọc'}</Text>
            <Text mt="2" color={COLORS.muted} fontWeight="700">
              {commonA1SearchBridge ? commonA1SearchBridge.title : 'Thử đổi từ khóa, trạng thái hoặc nhóm CEFR khác.'}
            </Text>
            {commonA1SearchBridge ? (
              <Box mt="4" bg="#F0F9FF" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="4" maxW="620px" mx="auto">
                <Text color={COLORS.text} fontWeight="700">{commonA1SearchBridge.description}</Text>
                <HStack mt="4" justify="center" wrap="wrap">
                  <Button as={Link} to={commonA1SearchBridge.route} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }}>
                    {commonA1SearchBridge.routeLabel}
                  </Button>
                  {hasActiveFilters ? <Button borderRadius="full" variant="outline" onClick={() => { setStatusFilter('all'); setLessonFilter('all'); }}>Tìm trong tất cả nhóm</Button> : null}
                </HStack>
              </Box>
            ) : null}
            <Button mt="5" borderRadius="full" onClick={() => { setQuery(''); setStatusFilter('all'); setLessonFilter('all'); }}>Xóa bộ lọc</Button>
          </Box>
        ) : (
          <>
            <SimpleGrid display={{ base: 'grid', lg: 'none' }} columns={1} gap="3" minW="0">
              {filtered.map((item) => <WordCard key={item.wordId} item={item} onChanged={refresh} />)}
            </SimpleGrid>

            <Box className="penglish-glass-card" display={{ base: 'none', lg: 'block' }} bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" borderRadius="3xl" border="1px solid" borderColor="#BAE6FD" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" overflowX="auto" overflowY="hidden">
              <Table size="md">
                <Thead bg="#EFF6FF">
                  <Tr>
                    <Th color={COLORS.primary}>Từ/cụm</Th>
                    <Th color={COLORS.primary}>Nghĩa & ví dụ</Th>
                    <Th color={COLORS.primary}>Nguồn bài</Th>
                    <Th color={COLORS.primary}>Lần ôn & trạng thái</Th>
                    <Th color={COLORS.primary}>Hành động</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((item) => (
                    <Tr key={item.wordId} _hover={{ bg: '#F8FAFC' }}>
                      <Td verticalAlign="top" maxW="260px">
                        <Text fontWeight="700" color={COLORS.text}>{item.term}</Text>
                        <Text mt="1" color={COLORS.muted} fontStyle="italic">{item.pronunciation || 'Chưa có phát âm'}</Text>
                        <Badge mt="2" colorScheme="purple" borderRadius="full">{item.partOfSpeechOrType}</Badge>
                      </Td>
                      <Td verticalAlign="top" maxW="420px">
                        <Text fontWeight="700" color={COLORS.primary}>{item.meaningVi}</Text>
                        <Text mt="2" fontWeight="700" color={COLORS.text}>{item.example}</Text>
                        <Text mt="1" color={COLORS.muted}>{item.exampleMeaningVi}</Text>
                      </Td>
                      <Td verticalAlign="top" maxW="240px">
                        <Text fontWeight="700" color={COLORS.text}>{item.lessonTitle}</Text>
                        <Text mt="1" color={COLORS.muted}>{item.unitTitle}</Text>
                        <Text mt="3" color={COLORS.cyan} fontSize="sm" fontWeight="700">{item.learningGroup.strategyVi}</Text>
                        <Text mt="1" color={COLORS.muted} fontSize="sm">{item.learningGroup.memoryHookVi}</Text>
                      </Td>
                      <Td verticalAlign="top">
                        <Badge colorScheme={STATUS_COLORS[item.status]} borderRadius="full" px="3" py="1">{STATUS_LABELS[item.status]}</Badge>
                        <HStack mt="2" color={COLORS.muted} fontSize="sm" gap="1">
                          <Icon as={Clock3} />
                          <Text>{formatDateTime(item.nextReviewAt)}</Text>
                        </HStack>
                        <Text mt="1" color={COLORS.muted} fontSize="sm">Ôn {item.reviewCount} · Sai {item.wrongCount}</Text>
                      </Td>
                      <Td verticalAlign="top" minW="360px">
                        <WordActions item={item} onChanged={refresh} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        )}

        <Box className="penglish-glass-card" mt="6" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="5" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" display={{ base: 'none', md: 'block' }}>
          <HStack align="start" gap="3">
            <OceanMascot mascot="mucMo" pose="hint" size="xs" decorative motion="pulse" />
            <Box>
              <Text fontWeight="700" color={COLORS.text}>Cách Poo lưu sổ học</Text>
              <Text mt="1" color={COLORS.muted} fontWeight="700">
                Sau mỗi bài, Poo lưu từ vựng đã lưu, lỗi sai cần ôn, câu shadowing khó, mẫu câu hay dùng và bài cần học lại. Người mới có thể dùng bộ A1/A2/B1 mẫu trước khi có lịch sử học riêng.
              </Text>
            </Box>
          </HStack>
        </Box>
      </Box>
    </OceanPageShell>
  );
}

