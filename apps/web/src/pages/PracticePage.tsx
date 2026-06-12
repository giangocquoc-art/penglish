import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Badge, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react';
import { AlertTriangle, BookOpen, HelpCircle, Headphones, PenTool, Target, Zap, Volume2, VolumeX, Settings, ChevronDown, ArrowLeft, CheckCircle2, Home, RotateCcw, Sparkles, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { get } from '../api';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { WhaleStudyCompanion, type WhaleCompanionPlacement } from '../components/streak/WhaleStudyCompanion';
import { useWhaleMoodController } from '../components/streak/useWhaleMoodController';
import { LessonFlashcardPractice } from '../components/practice/LessonFlashcardPractice';
import { LessonListeningPractice } from '../components/practice/LessonListeningPractice';
import { LessonMatchPractice } from '../components/practice/LessonMatchPractice';
import { LessonQuizPractice } from '../components/practice/LessonQuizPractice';
import { LessonReflexPractice } from '../components/practice/LessonReflexPractice';
import { LessonSpeedPractice } from '../components/practice/LessonSpeedPractice';
import { LessonTypingPractice } from '../components/practice/LessonTypingPractice';
import { LearningHeartsBadge } from '../components/learning/LearningHeartsBadge';
import { getLearningHeartsState, getLockRemainingText, isLearningLocked, LEARNING_HEARTS_UPDATED_EVENT, OUT_OF_BUBBLES_MESSAGE, type LearningHeartsState } from '../lib/p-english/learning-hearts';
import { getLessonById } from '../lib/p-english/lesson-content-data';
import { getAvailableLessonProgressModes, type LessonProgressMode } from '../lib/p-english/lesson-progress';
import { getUnifiedPracticeContentDepth } from '../lib/p-english/unifiedLessonEngine';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, getWaterStreak } from '../lib/p-english/daily-rewards';
import { getLearningLoopSnapshot, LEARNING_LOOP_UPDATED_EVENT, resolveLearningLoopMistake, type LearningLoopMistakeRecord, type LearningLoopWordRecord } from '../lib/p-english/learning-loop';
import { getFoundation48DayPath, FOUNDATION48_BASE_PATH } from '../features/foundation48/foundation48Data';

const MotionBox = motion.create(Box);

type GameDef = {
  id: string;
  name: string;
  desc: string;
  icon: any;
  time: string;
  reward: number;
};

const PRACTICE_COLORS = {
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  text: '#102A43',
  secondaryText: '#52667A',
  border: '#D7E8F5',
  rewardBg: '#FFF3C4',
  rewardText: '#B7791F',
  successGreen: '#4CCB6B',
};

const STARTER_A1_LESSON_ID = 'unit-1-greetings-introduction';

const GAMES: GameDef[] = [
  { id: 'flashcard', name: 'Thẻ từ', desc: 'Lật thẻ nhanh để ghi nhớ nghĩa và cách dùng.', icon: BookOpen, time: '3–5 phút', reward: 5 },
  { id: 'quiz', name: 'Thử sức nhẹ', desc: 'Chọn đáp án để Poo xem bạn nhớ từ đến đâu.', icon: HelpCircle, time: '4–6 phút', reward: 5 },
  { id: 'listen', name: 'Luyện nghe', desc: 'Nghe phát âm và nhận diện từ trong ngữ cảnh.', icon: Headphones, time: '5–7 phút', reward: 10 },
  { id: 'type', name: 'Gõ câu', desc: 'Luyện chính tả bằng cách nhập lại đáp án.', icon: PenTool, time: '5–8 phút', reward: 10 },
  { id: 'match', name: 'Ghép cặp', desc: 'Ghép từ vựnghĩa để củng cố phản xạ.', icon: Target, time: '3–5 phút', reward: 5 },
  { id: 'speed', name: 'Luyện tốc độ', desc: 'Trả lời nhanh để tăng tốc độ nhận diện từ.', icon: Zap, time: '2–4 phút', reward: 10 },
];

type Category = { id: string; name: string };
type Stats = { total?: number; ready?: number };
type PooReviewStage = 'idle' | 'quiz' | 'repeat' | 'complete';
type PooReviewItem = {
  id: string;
  prompt: string;
  wrongAnswer: string;
  correctAnswer: string;
  explanation: string;
  sourceLabel: string;
  actionPath: string;
  kind: 'mistake' | 'weak-word' | 'starter';
  isFallback?: boolean;
};

type FilterState = {
  categoryId: string;
  level: 'all' | 'easy' | 'medium' | 'hard';
  order: 'newest' | 'random' | 'az';
  count: 10 | 20 | 50 | 100;
};

const LEVEL_OPTS: Array<{ value: FilterState['level']; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Vừa' },
  { value: 'hard', label: 'Khó' },
];

const ORDER_OPTS: Array<{ value: FilterState['order']; label: string }> = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'random', label: 'Ngẫu nhiên' },
  { value: 'az', label: 'A-Z' },
];

const COUNT_OPTS: Array<FilterState['count']> = [10, 20, 50, 100];
const LESSON_PRACTICE_MODES = ['flashcard', 'quiz', 'listen', 'reflex', 'type', 'typing', 'match', 'speed'];

const FALLBACK_POO_REVIEW_ITEMS: PooReviewItem[] = [
  {
    id: 'fallback-a1-student',
    prompt: 'I am student.',
    wrongAnswer: 'I am student.',
    correctAnswer: 'I am a student.',
    explanation: 'student là danh từ đếm được số ít, nên cần a trước student.',
    sourceLabel: 'Ôn nhẹ hôm nay',
    actionPath: '/practice',
    kind: 'starter',
    isFallback: true,
  },
  {
    id: 'fallback-a1-happy',
    prompt: 'She are happy.',
    wrongAnswer: 'She are happy.',
    correctAnswer: 'She is happy.',
    explanation: 'She đi với is trong hiện tại đơn.',
    sourceLabel: 'Ôn nhẹ hôm nay',
    actionPath: '/practice',
    kind: 'starter',
    isFallback: true,
  },
  {
    id: 'fallback-a1-like',
    prompt: 'I very like English.',
    wrongAnswer: 'I very like English.',
    correctAnswer: 'I really like English.',
    explanation: 'very không đứng trước like; dùng really để nhấn mạnh động từ like.',
    sourceLabel: 'Ôn nhẹ hôm nay',
    actionPath: '/practice',
    kind: 'starter',
    isFallback: true,
  },
];

function normalizeLessonPracticeMode(mode: string | null): LessonProgressMode | null {
  if (!mode) return null;
  if (mode === 'typing') return 'type';
  if (mode === 'flashcard' || mode === 'quiz' || mode === 'listen' || mode === 'reflex' || mode === 'type' || mode === 'match' || mode === 'speed') {
    return mode;
  }
  return null;
}

function getMistakeSourceLabel(mistake: LearningLoopMistakeRecord) {
  if (mistake.source === 'foundation48') return `48 ngày lấy gốc · ${mistake.sourceId.replace('day-', 'Ngày ')}`;
  if (mistake.source === 'interactive-lesson') return 'Bài học tương tác';
  if (mistake.source === 'shadowing') return 'Nói đuổi';
  if (mistake.source === 'english-speed') return 'Đọc nhanh cùng Poo';
  if (mistake.source === 'words') return 'Sổ từ vựng';
  return 'Luyện tập';
}

function getMistakeActionPath(mistake: LearningLoopMistakeRecord) {
  if (mistake.source === 'foundation48') {
    const day = Number(mistake.sourceId.replace('day-', ''));
    return Number.isFinite(day) && day > 0 ? getFoundation48DayPath(day) : FOUNDATION48_BASE_PATH;
  }
  if (mistake.source === 'interactive-lesson') return `/practice?lessonId=${mistake.sourceId}&mode=quiz`;
  if (mistake.source === 'shadowing') return '/shadowing';
  if (mistake.source === 'english-speed') return '/english-speed';
  if (mistake.source === 'words') return '/words';
  return '/practice';
}

function getWeakWordActionPath(word: LearningLoopWordRecord) {
  if (word.source === 'foundation48') {
    const day = Number(word.sourceId.replace('day-', ''));
    return Number.isFinite(day) && day > 0 ? getFoundation48DayPath(day) : FOUNDATION48_BASE_PATH;
  }
  if (word.source === 'interactive-lesson') return `/practice?lessonId=${word.sourceId}&mode=flashcard`;
  if (word.source === 'shadowing') return '/shadowing';
  if (word.source === 'english-speed') return '/english-speed';
  return '/words';
}

function buildReviewOptions(activeReviewItem: PooReviewItem) {
  const normalizedWrong = activeReviewItem.wrongAnswer.trim();
  const normalizedCorrect = activeReviewItem.correctAnswer.trim();
  const promptAsDistractor = activeReviewItem.prompt.trim() && activeReviewItem.prompt.trim() !== normalizedCorrect ? activeReviewItem.prompt.trim() : '';
  const generatedDistractor = normalizedCorrect.includes('?')
    ? normalizedCorrect.replace(/^Do\s+/i, 'Does ').replace(/^Does\s+/i, 'Do ')
    : normalizedCorrect.replace(/\b(is|are|am|do|does|don’t|doesn’t)\b/i, '___');
  return Array.from(new Set([normalizedWrong, normalizedCorrect, promptAsDistractor, generatedDistractor].filter(Boolean))).slice(0, 4);
}

function FilterDropdown({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <VStack align="start" gap="1">
      <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">{label}</Text>
      <Menu>
        <MenuButton
          as={Button}
          size="sm"
          variant="outline"
          bg="white"
          borderColor="gray.200"
          borderRadius="lg"
          fontWeight="500"
          rightIcon={<Icon as={ChevronDown} />}
          minW="140px"
          textAlign="left"
        >
          {options.find((o) => o.value === value)?.label ?? value}
        </MenuButton>
        <MenuList>
          {options.map((opt) => (
            <MenuItem key={opt.value} onClick={() => onChange(opt.value)}>{opt.label}</MenuItem>
          ))}
        </MenuList>
      </Menu>
    </VStack>
  );
}

function LearningLockedScreen({ lessonId, state }: { lessonId: string | null; state: LearningHeartsState }) {
  return (
    <OceanPageShell variant="vocab" overlayStrength="medium" minH="calc(100vh - 72px)" px="6" py="8" pb={{ base: '28', lg: '8' }}>
      <Box maxW="760px" mx="auto" bg="rgba(255,255,255,0.88)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="8" boxShadow="0 18px 45px rgba(31, 111, 214, 0.10)">
        <LearningHeartsBadge />
        <Text mt="6" fontSize="3xl" fontWeight="700" color="#1F6FD6">Hết bọt biển</Text>
        <Text mt="3" color="#334155" fontWeight="700">
          {OUT_OF_BUBBLES_MESSAGE}
        </Text>
        <Text mt="2" color="#64748B">Bọt biển sẽ phục hồi sau {getLockRemainingText(state)}.</Text>
        <HStack mt="6" wrap="wrap" position="relative">
          <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
            Về trang chủ
          </Button>
          {lessonId ? (
            <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
              Xem bài học
            </Button>
          ) : null}
        </HStack>
      </Box>
    </OceanPageShell>
  );
}

function AudioPill({ muted, volume, onToggle }: { muted: boolean; volume: number; onToggle: () => void }) {
  return (
    <Button
      px="3"
      py="2"
      border="1px solid"
      borderColor={muted ? 'red.200' : 'gray.200'}
      borderRadius="full"
      bg="white"
      onClick={onToggle}
      gap="2"
      variant="ghost"
      aria-label={muted ? 'Bật âm thanh luyện tập' : 'Tắt âm thanh luyện tập'}
      aria-pressed={muted}
      _hover={{ bg: 'gray.50' }}
      _focusVisible={{ outline: '3px solid', outlineColor: PRACTICE_COLORS.oceanBlue, outlineOffset: '2px' }}
    >
      <Icon as={muted ? VolumeX : Volume2} color={muted ? 'red.500' : 'gray.700'} />
      <Text fontSize="sm" fontWeight="600" color={muted ? 'red.600' : 'gray.700'}>
        {muted ? 'Đang tắt âm thanh' : `Âm thanh ${volume}%`}
      </Text>
    </Button>
  );
}
function GameTile({ game, idx, readyCount, selectedCount, onPick }: { game: GameDef; idx: number; readyCount: number; selectedCount: number; onPick: (id: string) => void }) {
  const isReady = readyCount > 0;
  const startGame = () => onPick(game.id);

  return (
    <MotionBox
      role="button"
      tabIndex={0}
      aria-label={`Bắt đầu ${game.name}`}
      bg="white"
      border="1px solid"
      borderColor={PRACTICE_COLORS.border}
      borderRadius="3xl"
      p={{ base: '4', md: '5' }}
      cursor="pointer"
      boxShadow="0 14px 34px rgba(16, 42, 67, 0.06)"
      onClick={startGame}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          startGame();
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -3, boxShadow: '0 18px 38px rgba(47, 158, 235, 0.13)' }}
      whileTap={{ scale: 0.99 }}
      _focusVisible={{ outline: '3px solid', outlineColor: PRACTICE_COLORS.oceanBlue, outlineOffset: '3px' }}
      display="flex"
      flexDirection="column"
      minH={{ base: '188px', md: '224px' }}
      gap={{ base: '3', md: '4' }}
    >
      <HStack justify="space-between" align="start" gap="3">
        <Flex
          w={{ base: '44px', md: '52px' }}
          h={{ base: '44px', md: '52px' }}
          borderRadius="2xl"
          bg={`linear-gradient(135deg, ${PRACTICE_COLORS.softAqua}, ${PRACTICE_COLORS.softBlue})`}
          color={PRACTICE_COLORS.deepBlue}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={game.icon} boxSize={{ base: '5', md: '6' }} aria-hidden="true" />
        </Flex>
        <Badge
          bg={PRACTICE_COLORS.rewardBg}
          color={PRACTICE_COLORS.rewardText}
          borderRadius="full"
          px="2.5"
          py="1"
          fontSize="xs"
          fontWeight="700"
          textTransform="none"
        >
          +{game.reward} xu
        </Badge>
      </HStack>

      <VStack align="start" gap="1" flex="1">
        <Text fontWeight="700" fontSize={{ base: 'lg', md: 'xl' }} color={PRACTICE_COLORS.text}>{game.name}</Text>
        <Text fontSize="sm" color={PRACTICE_COLORS.secondaryText} lineHeight="1.55">{game.desc}</Text>
      </VStack>

      <HStack gap="2" wrap="wrap">
        <Badge bg={PRACTICE_COLORS.softBlue} color={PRACTICE_COLORS.deepBlue} borderRadius="full" px="2.5" py="1" textTransform="none">
          {game.time}
        </Badge>
        <Badge bg={PRACTICE_COLORS.softAqua} color={PRACTICE_COLORS.deepBlue} borderRadius="full" px="2.5" py="1" textTransform="none">
          {Math.min(readyCount, selectedCount)} / {selectedCount} từ
        </Badge>
      </HStack>

      <Flex align="center" justify="space-between" gap="3" pt="1">
        <Badge
          bg={isReady ? '#E4FBEA' : PRACTICE_COLORS.softBlue}
          color={isReady ? '#276749' : PRACTICE_COLORS.secondaryText}
          border="1px solid"
          borderColor={isReady ? PRACTICE_COLORS.successGreen : PRACTICE_COLORS.border}
          borderRadius="full"
          px="3"
          py="1"
          textTransform="none"
          fontWeight="700"
        >
          {isReady ? 'Sẵn sàng' : 'Cần thêm từ'}
        </Badge>
        <Text
          as="span"
          px="4"
          py="2"
          borderRadius="full"
          bg={isReady ? PRACTICE_COLORS.oceanBlue : '#F7FBFF'}
          color={isReady ? 'white' : PRACTICE_COLORS.secondaryText}
          border="1px solid"
          borderColor={isReady ? PRACTICE_COLORS.oceanBlue : PRACTICE_COLORS.border}
          fontSize="sm"
          fontWeight="700"
          whiteSpace="nowrap"
        >
          Bắt đầu
        </Text>
      </Flex>
    </MotionBox>
  );
}

export function PracticePage() {
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const mode = searchParams.get('mode');
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const normalizedMode = normalizeLessonPracticeMode(mode);
  const availableModes = useMemo(() => (lesson ? getAvailableLessonProgressModes(lesson) : []), [lesson]);
  const practiceContentDepth = useMemo(() => (lesson ? getUnifiedPracticeContentDepth(lesson.id, normalizedMode ?? undefined) : null), [lesson, normalizedMode]);
  const suggestedMode = practiceContentDepth?.recommendedMode && availableModes.includes(practiceContentDepth.recommendedMode as LessonProgressMode) ? practiceContentDepth.recommendedMode as LessonProgressMode : availableModes[0];
  const selectedModeDepth = practiceContentDepth?.selectedModeDepth;
  const isUnavailableLessonMode = Boolean(lessonId && lesson && normalizedMode && !availableModes.includes(normalizedMode));
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [heartsState, setHeartsState] = useState<LearningHeartsState>(() => getLearningHeartsState());
  const [waterStreakCurrent, setWaterStreakCurrent] = useState(() => getWaterStreak(getDailyRewardState()).current);
  const { whaleMood, triggerWhaleMood } = useWhaleMoodController('idle');
  const [learningLoopSnapshot, setLearningLoopSnapshot] = useState(() => getLearningLoopSnapshot());
  const [pooReviewStage, setPooReviewStage] = useState<PooReviewStage>('idle');
  const [pooReviewIndex, setPooReviewIndex] = useState(0);
  const [selectedReviewAnswer, setSelectedReviewAnswer] = useState<string | null>(null);
  const [understoodCount, setUnderstoodCount] = useState(0);
 
  const [filters, setFilters] = useState<FilterState>({
    categoryId: 'all',
    level: 'all',
    order: 'newest',
    count: 20,
  });

  const [muted, setMuted] = useState<boolean>(() => localStorage.getItem('game_sound_muted') === '1');
  const [volume, setVolume] = useState<number>(() => {
    const v = Number(localStorage.getItem('game_sound_volume'));
    return Number.isFinite(v) && v > 0 ? v : 70;
  });

  useEffect(() => {
    const backendSyncEnabled = Boolean(import.meta.env.VITE_API_URL) || localStorage.getItem('pshare-enable-backend-sync') === '1';
    if (lessonId || !backendSyncEnabled) return;

    get<any>('/categories').then((r: any) => {
      const arr = Array.isArray(r) ? r : r?.data ?? [];
      setCategories(arr);
    }).catch(() => {});
    get<any>('/vocabularies/stats').then((r: any) => {
      const data = r?.data ?? r ?? {};
      setStats(data);
    }).catch(() => {});
  }, [lessonId]);

  useEffect(() => {
    const refreshHearts = () => setHeartsState(getLearningHeartsState());
    window.addEventListener('focus', refreshHearts);
    window.addEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshHearts);
    return () => {
      window.removeEventListener('focus', refreshHearts);
      window.removeEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshHearts);
    };
  }, []);

  useEffect(() => {
    const refreshBubbleStreak = () => setWaterStreakCurrent(getWaterStreak(getDailyRewardState()).current);
    refreshBubbleStreak();
    window.addEventListener('focus', refreshBubbleStreak);
    window.addEventListener('storage', refreshBubbleStreak);
    window.addEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshBubbleStreak);
    return () => {
      window.removeEventListener('focus', refreshBubbleStreak);
      window.removeEventListener('storage', refreshBubbleStreak);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshBubbleStreak);
    };
  }, []);

  useEffect(() => {
    const refreshLearningLoop = () => setLearningLoopSnapshot(getLearningLoopSnapshot());
    refreshLearningLoop();
    window.addEventListener('focus', refreshLearningLoop);
    window.addEventListener('storage', refreshLearningLoop);
    window.addEventListener(LEARNING_LOOP_UPDATED_EVENT, refreshLearningLoop);
    window.addEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshLearningLoop);
    return () => {
      window.removeEventListener('focus', refreshLearningLoop);
      window.removeEventListener('storage', refreshLearningLoop);
      window.removeEventListener(LEARNING_LOOP_UPDATED_EVENT, refreshLearningLoop);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshLearningLoop);
    };
  }, []);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem('game_sound_muted', next ? '1' : '0');
      return next;
    });
  };

  const renderWithStudyWhale = (content: ReactNode, placement: WhaleCompanionPlacement = 'hidden-mobile') => (
    <Box position="relative" isolation="isolate">
      <WhaleStudyCompanion mood={whaleMood} placement={placement} streak={waterStreakCurrent} />
      {content}
    </Box>
  );

  const categoryOpts = useMemo(
    () => [{ value: 'all', label: 'Tất cả' }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories],
  );

  const starterA1Lesson = useMemo(() => getLessonById(STARTER_A1_LESSON_ID), []);
  const starterA1Count = starterA1Lesson?.vocabulary.length ?? 50;
  const readyCount = stats.ready ?? stats.total ?? 0;
  const unresolvedMistakes = learningLoopSnapshot.mistakes;
  const weakWords = learningLoopSnapshot.weakWords;
  const reviewCenterCount = unresolvedMistakes.length + weakWords.length;
  const displayReadyCount = reviewCenterCount > 0 ? reviewCenterCount : readyCount > 0 ? readyCount : starterA1Count;
  const pooReviewItems = useMemo<PooReviewItem[]>(() => {
    const mistakeItems: PooReviewItem[] = unresolvedMistakes.slice(0, 6).map((mistake) => ({
      id: mistake.id,
      prompt: mistake.prompt,
      wrongAnswer: mistake.userAnswer || mistake.prompt,
      correctAnswer: mistake.correctAnswer || mistake.prompt,
      explanation: mistake.explanation || 'Poo nhắc bạn nhìn lại mẫu câu đúng rồi luyện lại thật chậm.',
      sourceLabel: getMistakeSourceLabel(mistake),
      actionPath: getMistakeActionPath(mistake),
      kind: 'mistake',
    }));

    const weakWordItems: PooReviewItem[] = weakWords.slice(0, Math.max(0, 6 - mistakeItems.length)).map((word) => ({
      id: `weak-word-${word.id}`,
      prompt: word.example || word.term,
      wrongAnswer: word.term,
      correctAnswer: `${word.term} = ${word.meaningVi}`,
      explanation: word.example ? `Gặp lại từ này trong câu: ${word.example}` : 'Từ này còn yếu, hãy đọc nghĩa rồi nói lại một câu ngắn.',
      sourceLabel: `${word.source === 'foundation48' ? '48 ngày lấy gốc' : 'Kho từ vựng'} · từ yếu`,
      actionPath: getWeakWordActionPath(word),
      kind: 'weak-word',
    }));

    const realItems = [...mistakeItems, ...weakWordItems];
    return realItems.length > 0 ? realItems : FALLBACK_POO_REVIEW_ITEMS;
  }, [unresolvedMistakes, weakWords]);
  const activeReviewItem = pooReviewItems[Math.min(pooReviewIndex, Math.max(0, pooReviewItems.length - 1))];
  const reviewAnswerOptions = useMemo(() => {
    if (!activeReviewItem) return [];
    return buildReviewOptions(activeReviewItem);
  }, [activeReviewItem]);
  const hasRealMistakes = unresolvedMistakes.length > 0;

  if (lessonId && normalizedMode && !isUnavailableLessonMode && isLearningLocked(heartsState)) {
    return <LearningLockedScreen lessonId={lessonId} state={heartsState} />;
  }

  if (isUnavailableLessonMode && lesson) {
    return (
      <OceanPageShell variant="vocab" overlayStrength="medium" minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8" pb={{ base: '28', lg: '8' }}>
        <Box data-testid="practice-fallback-card" maxW="760px" mx="auto" bg="rgba(255,255,255,0.9)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '6', md: '8' }} boxShadow="0 18px 45px rgba(31, 111, 214, 0.10)">
          <Badge borderRadius="full" bg="#EFF6FF" color="#2563EB" mb="3" textTransform="none">Gợi ý luyện tập</Badge>
          <Text fontSize="2xl" fontWeight="700" color="#0F172A">Phần này chưa có đủ nội dung luyện cho bài học này.</Text>
          <Text mt="2" color="#64748B" lineHeight="1.7">
            {suggestedMode ? 'Poo đã chọn phần luyện phù hợp hơn. Bạn không mất tiến độ — chỉ cần chuyển sang phần đang sẵn sàng.' : 'Bài này hiện chỉ có phần đọc/xem nội dung, chưa có phần luyện riêng.'}
          </Text>
          <Text mt="3" color="#2563EB" fontSize="sm" fontWeight="700">Gợi ý phím: Enter để bắt đầu phần luyện Poo đề xuất, hoặc quay lại bài học.</Text>
          {practiceContentDepth ? (
            <Box mt="5" border="1px solid" borderColor="#DBEAFE" borderRadius="2xl" bg="rgba(239,246,255,0.74)" p="4">
              <HStack justify="space-between" align="start" gap="3" wrap="wrap">
                <Box minW="0">
                  <Text color="#0F172A" fontWeight="700">Nội dung luyện hiện có</Text>
                  <Text mt="1" color="#64748B" fontSize="sm" fontWeight="700">{practiceContentDepth.readinessSummaryVi} · Gợi ý thứ tự luyện: {practiceContentDepth.recommendedFlowVi}</Text>
                </Box>
                {selectedModeDepth ? (
                  <Badge borderRadius="full" bg={selectedModeDepth.isReady ? '#ECFDF5' : '#FFF7ED'} color={selectedModeDepth.isReady ? '#047857' : '#C2410C'} textTransform="none" px="3" py="1.5">
                    {selectedModeDepth.labelVi}: {selectedModeDepth.readinessScore}/100
                  </Badge>
                ) : null}
              </HStack>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="2" mt="3">
                {practiceContentDepth.modeDepths.filter((item) => item.isReady).slice(0, 4).map((item) => (
                  <Box key={item.mode} bg="white" border="1px solid" borderColor="#BAE6FD" borderRadius="xl" p="3">
                    <Text color="#2563EB" fontWeight="700">{item.itemCount}</Text>
                    <Text color="#64748B" fontSize="xs" fontWeight="700">{item.labelVi}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          ) : null}
          <HStack mt="6" wrap="wrap">
            {suggestedMode ? (
              <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=${suggestedMode}`} borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Luyện phần phù hợp
              </Button>
            ) : null}
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" bg={suggestedMode ? 'white' : '#2563EB'} color={suggestedMode ? '#2563EB' : 'white'} variant={suggestedMode ? 'outline' : 'solid'}>
              Quay lại bài học
            </Button>
            <Button as={Link} to="/learning-path" borderRadius="full" variant="outline">
              Xem lộ trình
            </Button>
          </HStack>
        </Box>
      </OceanPageShell>
    );
  }

  if (lessonId && mode === 'flashcard') {
    if (!lesson) {
      return (
        <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
          <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
            <Text fontSize="2xl" fontWeight="700" color="#0F172A">Không tìm thấy bài học để ôn thẻ từ</Text>
            <Text mt="2" color="#64748B">Poo chưa tìm thấy bài học này trên thiết bị.</Text>
            <HStack mt="6" wrap="wrap">
              <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Về trang chủ
              </Button>
              <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
                Quay lại bài học
              </Button>
            </HStack>
          </Box>
        </Box>
      );
    }
    return renderWithStudyWhale(<LessonFlashcardPractice lesson={lesson} onWhaleMoodChange={triggerWhaleMood} />);
  }

  if (lessonId && mode === 'quiz') {
    if (!lesson) {
      return (
        <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
          <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
            <Text fontSize="2xl" fontWeight="700" color="#0F172A">Không tìm thấy bài học để luyện tập</Text>
            <Text mt="2" color="#64748B">Poo chưa tìm thấy bài học này trên thiết bị.</Text>
            <HStack mt="6" wrap="wrap">
              <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Về trang chủ
              </Button>
              <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
                Quay lại bài học
              </Button>
            </HStack>
          </Box>
        </Box>
      );
    }
    return renderWithStudyWhale(<LessonQuizPractice lesson={lesson} onWhaleMoodChange={triggerWhaleMood} />);
  }

  if (lessonId && mode === 'listen') {
    if (!lesson) {
      return (
        <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
          <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
            <Text fontSize="2xl" fontWeight="700" color="#0F172A">Không tìm thấy bài học để luyện nghe</Text>
            <Text mt="2" color="#64748B">Poo chưa tìm thấy bài học này trên thiết bị.</Text>
            <HStack mt="6" wrap="wrap">
              <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Về trang chủ
              </Button>
              <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
                Quay lại bài học
              </Button>
            </HStack>
          </Box>
        </Box>
      );
    }
    return renderWithStudyWhale(<LessonListeningPractice lesson={lesson} onWhaleMoodChange={triggerWhaleMood} />, 'floating-safe');
  }

  if (lessonId && mode === 'reflex') {
    if (!lesson) {
      return (
        <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
          <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
            <Text fontSize="2xl" fontWeight="700" color="#0F172A">Không tìm thấy bài học để luyện phản xạ</Text>
            <Text mt="2" color="#64748B">Poo chưa tìm thấy bài học này trên thiết bị.</Text>
            <HStack mt="6" wrap="wrap">
              <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Về trang chủ
              </Button>
              <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
                Quay lại bài học
              </Button>
            </HStack>
          </Box>
        </Box>
      );
    }
    return renderWithStudyWhale(<LessonReflexPractice lesson={lesson} onWhaleMoodChange={triggerWhaleMood} />, 'floating-safe');
  }

  if (lessonId && (mode === 'type' || mode === 'typing')) {
    if (!lesson) {
      return (
        <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
          <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
            <Text fontSize="2xl" fontWeight="700" color="#0F172A">Không tìm thấy bài học để luyện gõ câu</Text>
            <Text mt="2" color="#64748B">Poo chưa tìm thấy bài học này trên thiết bị.</Text>
            <HStack mt="6" wrap="wrap">
              <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Về trang chủ
              </Button>
              <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
                Quay lại bài học
              </Button>
            </HStack>
          </Box>
        </Box>
      );
    }
    return renderWithStudyWhale(<LessonTypingPractice lesson={lesson} onWhaleMoodChange={triggerWhaleMood} />);
  }

  if (lessonId && mode === 'match') {
    if (!lesson) {
      return (
        <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
          <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
            <Text fontSize="2xl" fontWeight="700" color="#0F172A">Không tìm thấy bài học để ghép cặp</Text>
            <Text mt="2" color="#64748B">Poo chưa tìm thấy bài học này trên thiết bị.</Text>
            <HStack mt="6" wrap="wrap">
              <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Về trang chủ
              </Button>
              <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
                Quay lại bài học
              </Button>
            </HStack>
          </Box>
        </Box>
      );
    }
    return renderWithStudyWhale(<LessonMatchPractice lesson={lesson} onWhaleMoodChange={triggerWhaleMood} />, 'hidden-mobile');
  }

  if (lessonId && mode === 'speed') {
    if (!lesson) {
      return (
        <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
          <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
            <Text fontSize="2xl" fontWeight="700" color="#0F172A">Không tìm thấy bài học để luyện tốc độ</Text>
            <Text mt="2" color="#64748B">Poo chưa tìm thấy bài học này trên thiết bị.</Text>
            <HStack mt="6" wrap="wrap">
              <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Về trang chủ
              </Button>
              <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
                Quay lại bài học
              </Button>
            </HStack>
          </Box>
        </Box>
      );
    }
    return renderWithStudyWhale(<LessonSpeedPractice lesson={lesson} onWhaleMoodChange={triggerWhaleMood} />, 'hidden-mobile');
  }

  if (lessonId && mode && !LESSON_PRACTICE_MODES.includes(mode)) {
    return (
      <OceanPageShell variant="vocab" overlayStrength="medium" minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8" pb={{ base: '28', lg: '8' }}>
        <Box data-testid="practice-fallback-card" maxW="760px" mx="auto" bg="rgba(255,255,255,0.9)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '6', md: '8' }} boxShadow="0 18px 45px rgba(31, 111, 214, 0.10)">
          <Badge borderRadius="full" bg="#EFF6FF" color="#2563EB" mb="3" textTransform="none">Gợi ý luyện tập</Badge>
          <Text fontSize="2xl" fontWeight="700" color="#0F172A">Phần này chưa có trong bộ luyện tập hiện tại.</Text>
          <Text mt="2" color="#64748B" lineHeight="1.7">Bạn có thể quay lại bài học hoặc chọn một phần luyện đang sẵn sàng. Poo vẫn giữ tiến độ của bạn.</Text>
          <Text mt="3" color="#2563EB" fontSize="sm" fontWeight="700">Gợi ý phím: dùng Tab để chọn hành động, Enter để xác nhận.</Text>
          <HStack mt="6" wrap="wrap">
            <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
              Quay lại bài học
            </Button>
            <Button as={Link} to="/practice" borderRadius="full" variant="outline">
              Về luyện tập chung
            </Button>
          </HStack>
        </Box>
      </OceanPageShell>
    );
  }

  if (picked) {
    const game = GAMES.find((g) => g.id === picked);
    return (
      <OceanPageShell variant="vocab" overlayStrength="medium" px="6" pb={{ base: '28', lg: '10' }} maxW="900px" mx="auto">
        <Box as="h2" position="absolute" left="-9999px">Luyện tập</Box>
        <Button leftIcon={<Icon as={ArrowLeft} />} variant="ghost" mb="6" onClick={() => setPicked(null)}>
          Quay lại
        </Button>
        <Box
          bg="rgba(255,255,255,0.72)"
          border="1px solid"
          borderColor="#BAE6FD"
          borderRadius="3xl"
          boxShadow="0 18px 42px rgba(47, 158, 235, 0.10)"
          p={{ base: '6', md: '8' }}
          position="relative"
          overflow="hidden"
          data-testid="practice-selected-mode-panel"
        >
          <Flex position="relative" direction={{ base: 'column', md: 'row' }} gap="5" align={{ base: 'stretch', md: 'center' }} justify="space-between">
            <VStack align="start" gap="3" flex="1" minW="0">
              {game && (
                <Flex w="60px" h="60px" borderRadius="2xl" bg="rgba(232,244,255,0.82)" border="1px solid" borderColor="rgba(47, 158, 235, 0.20)" align="center" justify="center" color={PRACTICE_COLORS.deepBlue}>
                  <Icon as={game.icon} boxSize="7" />
                </Flex>
              )}
              <Box minW="0">
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={PRACTICE_COLORS.deepBlue}>{game?.name ?? 'Luyện tập cùng Poo'}</Text>
                <Text color="#52667A" fontSize="sm" mt="2">
                  {displayReadyCount} từ sẵn sàng • {filters.count} câu • {LEVEL_OPTS.find((l) => l.value === filters.level)?.label}
                </Text>
              </Box>
              <Text color="#2F9EEB" fontSize="sm" fontWeight="700">
                Poo giữ màn hình gọn lại: thanh bơi trên cùng sẽ báo khi có phần cần chuẩn bị.
              </Text>
            </VStack>
            <Box flexShrink={0} alignSelf={{ base: 'center', md: 'auto' }} opacity="0.82" pointerEvents="none" aria-hidden="true">
              {picked === 'quiz' || picked === 'match' ? (
                <OceanMascot mascot="cuaQuiz" pose="quiz" size="lg" decorative motion="float" />
              ) : (
                <OceanMascot mascot="poo" pose="idle" size="lg" decorative motion="float" />
              )}
            </Box>
          </Flex>
        </Box>
      </OceanPageShell>
    );
  }

  const startPooReview = () => {
    setPooReviewStage('quiz');
    setPooReviewIndex(0);
    setSelectedReviewAnswer(null);
    setUnderstoodCount(0);
  };

  const markActiveUnderstood = () => {
    if (activeReviewItem && activeReviewItem.kind === 'mistake' && !activeReviewItem.isFallback) {
      resolveLearningLoopMistake(activeReviewItem.id);
      setLearningLoopSnapshot(getLearningLoopSnapshot());
    }
    const nextCount = understoodCount + 1;
    setUnderstoodCount(nextCount);
    if (pooReviewIndex >= pooReviewItems.length - 1) {
      setPooReviewStage('complete');
      return;
    }
    setPooReviewIndex((value) => value + 1);
    setSelectedReviewAnswer(null);
    setPooReviewStage('quiz');
  };

  return (
    <OceanPageShell data-testid="practice-mobile-root" variant="vocab" overlayStrength="medium" minH="calc(100vh - 72px)" px={{ base: '3', md: '6' }} py={{ base: '2.5', md: '6' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 176px)', lg: '10' }} overflowX="hidden">
      <Box maxW="1180px" mx="auto" minW="0">
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: '3', md: '5' }} alignItems="start">
          <VStack align="stretch" gap={{ base: '3', md: '5' }} gridColumn={{ base: 'auto', lg: 'span 2' }} minW="0">
            <Box className="penglish-glass-card" bg="rgba(255,255,255,0.72)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '4', md: '7' }} boxShadow="0 16px 38px rgba(31,111,214,0.08)" position="relative" overflow="hidden" data-testid="practice-poo-hero">
              <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 10%, rgba(91,188,235,0.20), transparent 30%), radial-gradient(circle at 8% 100%, rgba(255,243,196,0.42), transparent 28%)" pointerEvents="none" />
              <Flex position="relative" gap="4" justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }}>
                <Box minW="0" flex="1">
                  <Badge borderRadius="full" bg="#E0F2FE" color={PRACTICE_COLORS.deepBlue} textTransform="none" mb="2">Ôn nhẹ cùng Poo</Badge>
                  <Text as="h2" fontSize={{ base: '2xl', md: '4xl' }} lineHeight="1.06" fontWeight="950" color={PRACTICE_COLORS.text}>Ôn câu Poo nhắc</Text>
                  <Text mt="2" color={PRACTICE_COLORS.secondaryText} fontWeight="800" fontSize={{ base: 'sm', md: 'md' }} maxW="620px">
                    {hasRealMistakes ? 'Poo gom vài chỗ bạn hay quên để ôn nhẹ hôm nay.' : 'Hôm nay chưa có lỗi lớn. Bạn có thể ôn nhẹ vài câu nền tảng.'}
                  </Text>
                  <HStack mt="4" gap="2" wrap="wrap">
                    <Button data-testid="practice-poo-start" leftIcon={<Icon as={Sparkles} />} borderRadius="full" bg={PRACTICE_COLORS.deepBlue} color="white" _hover={{ bg: '#185BB2' }} onClick={startPooReview}>
                      {hasRealMistakes ? 'Bắt đầu ôn' : 'Ôn nhẹ 3 câu'}
                    </Button>
                    <Badge borderRadius="full" bg="#ECFDF5" color="#15803D" px="3" py="1.5" textTransform="none">{pooReviewItems.length} câu sẵn sàng</Badge>
                  </HStack>
                </Box>
                <Box alignSelf={{ base: 'center', md: 'auto' }} pointerEvents="none">
                  <OceanMascot mascot="poo" pose="idle" size="hero" decorative motion="float" />
                </Box>
              </Flex>
            </Box>

            {pooReviewStage === 'complete' ? (
              <Box className="penglish-glass-card" bg="linear-gradient(135deg, rgba(240,253,244,0.92), rgba(232,244,255,0.86))" border="1px solid" borderColor="#BBF7D0" borderRadius="3xl" p={{ base: '4', md: '6' }} data-testid="practice-poo-complete">
                <VStack align="stretch" gap="4">
                  <HStack align="center" gap="3">
                    <Flex w="52px" h="52px" borderRadius="2xl" bg="#ECFDF5" color="#15803D" align="center" justify="center" border="1px solid #BBF7D0"><Icon as={CheckCircle2} boxSize="7" /></Flex>
                    <Box minW="0">
                      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={PRACTICE_COLORS.text}>Poo đã ôn xong vài câu hôm nay!</Text>
                      <Text color={PRACTICE_COLORS.secondaryText} fontWeight="800">Nhẹ thôi nhưng chắc hơn rồi đó.</Text>
                    </Box>
                  </HStack>
                  <SimpleGrid columns={{ base: 3, md: 3 }} gap="2.5">
                    <Box bg="whiteAlpha.800" border="1px solid" borderColor="#BBF7D0" borderRadius="2xl" p="3"><Text fontWeight="950" color={PRACTICE_COLORS.text}>{Math.max(3, understoodCount)} câu</Text><Text fontSize="xs" fontWeight="800" color={PRACTICE_COLORS.secondaryText}>đã ôn</Text></Box>
                    <Box bg="whiteAlpha.800" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3"><Text fontWeight="950" color={PRACTICE_COLORS.text}>2 từ</Text><Text fontSize="xs" fontWeight="800" color={PRACTICE_COLORS.secondaryText}>đã nhớ</Text></Box>
                    <Box bg="whiteAlpha.800" border="1px solid" borderColor="#FED7AA" borderRadius="2xl" p="3"><Text fontWeight="950" color={PRACTICE_COLORS.text}>1 mẫu</Text><Text fontSize="xs" fontWeight="800" color={PRACTICE_COLORS.secondaryText}>chắc hơn</Text></Box>
                  </SimpleGrid>
                  <HStack gap="2.5" wrap="wrap">
                    <Button as={Link} to="/home" data-testid="practice-poo-back-home" leftIcon={<Icon as={Home} />} borderRadius="full" bg={PRACTICE_COLORS.deepBlue} color="white" _hover={{ bg: '#185BB2' }}>Quay về Trang chủ</Button>
                    <Button data-testid="practice-poo-review-more" leftIcon={<Icon as={RotateCcw} />} borderRadius="full" variant="outline" onClick={startPooReview}>Ôn thêm</Button>
                  </HStack>
                </VStack>
              </Box>
            ) : pooReviewStage === 'quiz' || pooReviewStage === 'repeat' ? (
              <Box className="penglish-glass-card" bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '4', md: '6' }} data-testid="practice-poo-flow">
                <VStack align="stretch" gap="4">
                  <HStack justify="space-between" gap="3" wrap="wrap">
                    <Badge borderRadius="full" bg="#EFF6FF" color={PRACTICE_COLORS.deepBlue} textTransform="none">Bước {pooReviewStage === 'quiz' ? '2' : '3'} / 4</Badge>
                    <Text color={PRACTICE_COLORS.secondaryText} fontSize="sm" fontWeight="850">Câu {pooReviewIndex + 1}/{pooReviewItems.length}</Text>
                  </HStack>
                  <Box bg="#F8FAFC" border="1px solid" borderColor="#D7E8F5" borderRadius="2xl" p={{ base: '3.5', md: '4' }} data-testid="practice-poo-active-mistake">
                    <Badge bg="#FFF7ED" color="#B45309" borderRadius="full" textTransform="none" mb="2">{activeReviewItem.sourceLabel}</Badge>
                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="950" color={PRACTICE_COLORS.text}>{activeReviewItem.prompt}</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="2.5" mt="3">
                      <Box bg="#FFF7ED" border="1px solid" borderColor="#FED7AA" borderRadius="2xl" p="3"><Text fontSize="xs" fontWeight="950" color="#B45309">Sai / yếu</Text><Text fontWeight="900" color={PRACTICE_COLORS.text}>{activeReviewItem.wrongAnswer}</Text></Box>
                      <Box bg="#ECFDF5" border="1px solid" borderColor="#BBF7D0" borderRadius="2xl" p="3"><Text fontSize="xs" fontWeight="950" color="#15803D">Đúng</Text><Text fontWeight="900" color={PRACTICE_COLORS.text}>{activeReviewItem.correctAnswer}</Text></Box>
                    </SimpleGrid>
                    <Text mt="3" color={PRACTICE_COLORS.secondaryText} fontWeight="800">Gợi ý: {activeReviewItem.explanation}</Text>
                  </Box>
                  {pooReviewStage === 'quiz' ? (
                    <VStack align="stretch" gap="2.5" data-testid="practice-poo-answer-options">
                      <Text color={PRACTICE_COLORS.text} fontWeight="950">Chọn câu đúng:</Text>
                      {reviewAnswerOptions.map((option) => {
                        const isSelected = selectedReviewAnswer === option;
                        const isCorrect = option === activeReviewItem.correctAnswer;
                        return (
                          <Button key={option} justifyContent="flex-start" whiteSpace="normal" h="auto" minH="48px" borderRadius="2xl" variant="outline" borderColor={isSelected ? (isCorrect ? '#86EFAC' : '#FED7AA') : '#BAE6FD'} bg={isSelected ? (isCorrect ? '#ECFDF5' : '#FFF7ED') : 'white'} onClick={() => setSelectedReviewAnswer(option)} data-testid={isCorrect ? 'practice-poo-correct-answer' : 'practice-poo-answer'}>
                            {option}
                          </Button>
                        );
                      })}
                      <Button alignSelf="flex-start" data-testid="practice-poo-next-repeat" borderRadius="full" bg={PRACTICE_COLORS.deepBlue} color="white" _hover={{ bg: '#185BB2' }} isDisabled={selectedReviewAnswer !== activeReviewItem.correctAnswer} onClick={() => setPooReviewStage('repeat')}>Tiếp tục</Button>
                    </VStack>
                  ) : (
                    <Box bg="#F0F9FF" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3.5" data-testid="practice-poo-repeat-step">
                      <Text color={PRACTICE_COLORS.text} fontWeight="950">Đọc chậm lại một lần:</Text>
                      <Text mt="1" color={PRACTICE_COLORS.deepBlue} fontWeight="950">{activeReviewItem.correctAnswer}</Text>
                      <HStack mt="3" gap="2" wrap="wrap">
                        <Button data-testid="practice-poo-understood" borderRadius="full" bg="#16A34A" color="white" _hover={{ bg: '#15803D' }} onClick={markActiveUnderstood}>Tôi hiểu rồi</Button>
                        <Button borderRadius="full" variant="outline" onClick={() => setPooReviewStage('quiz')}>Luyện lại</Button>
                      </HStack>
                    </Box>
                  )}
                </VStack>
              </Box>
            ) : (
              <VStack align="stretch" gap="3" data-testid="practice-poo-review-cards">
                <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
                  {[
                    { icon: AlertTriangle, title: 'Câu hay nhầm', subtitle: hasRealMistakes ? 'Poo giữ lại câu cần sửa.' : 'Ôn nhẹ câu A1 nền tảng.', count: `${pooReviewItems.length}`, cta: 'Sửa câu' },
                    { icon: BookOpen, title: 'Từ cần nhớ', subtitle: weakWords.length > 0 ? 'Có từ nên gặp lại hôm nay.' : 'Gắn từ vựngắn.', count: `${Math.max(2, weakWords.length)}`, cta: 'Ôn từ' },
                    { icon: Headphones, title: 'Nghe lại câu cũ', subtitle: 'Nghe trong đầu rồi đọc chậm.', count: '1', cta: 'Nghe lại' },
                  ].map((card) => (
                    <Box key={card.title} bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3.5', md: '4' }} minW="0" data-testid="practice-poo-daily-card">
                      <HStack justify="space-between" align="start" gap="3">
                        <Flex w="42px" h="42px" borderRadius="2xl" bg="#E0F2FE" color={PRACTICE_COLORS.deepBlue} align="center" justify="center" flexShrink={0}><Icon as={card.icon} boxSize="5" /></Flex>
                        <Badge borderRadius="full" bg="#FFF3C4" color="#B7791F" textTransform="none">{card.count}</Badge>
                      </HStack>
                      <Text mt="3" color={PRACTICE_COLORS.text} fontWeight="950">{card.title}</Text>
                      <Text mt="1" color={PRACTICE_COLORS.secondaryText} fontSize="sm" fontWeight="800" noOfLines={2}>{card.subtitle}</Text>
                      <Button mt="3" size="sm" borderRadius="full" variant="outline" onClick={startPooReview}>{card.cta}</Button>
                    </Box>
                  ))}
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                  {pooReviewItems.slice(0, 3).map((item) => (
                    <Box key={item.id} bg="rgba(255,255,255,0.86)" border="1px solid" borderColor={item.isFallback ? '#BAE6FD' : '#FED7AA'} borderRadius="2xl" p="3.5" data-testid="practice-poo-mistake-item">
                      <Badge bg={item.isFallback ? '#E0F2FE' : '#FFF7ED'} color={item.isFallback ? PRACTICE_COLORS.deepBlue : '#B45309'} borderRadius="full" textTransform="none" mb="2">{item.sourceLabel}</Badge>
                      <Text color={PRACTICE_COLORS.text} fontWeight="950">Câu còn vấp: {item.wrongAnswer}</Text>
                      <Text mt="1" color="#15803D" fontWeight="950">Đúng: {item.correctAnswer}</Text>
                      <Text mt="1" color={PRACTICE_COLORS.secondaryText} fontSize="sm" fontWeight="800">Gợi ý: {item.explanation}</Text>
                      <HStack mt="3" gap="2" wrap="wrap"><Button size="xs" borderRadius="full" onClick={startPooReview}>Tôi hiểu rồi</Button><Button as={Link} to={item.actionPath} size="xs" borderRadius="full" variant="outline">Mở nguồn</Button></HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            )}
          </VStack>

          <VStack align="stretch" gap="3" minW="0">
            <Box className="penglish-glass-card" bg="rgba(255,255,255,0.70)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3.5', md: '5' }} data-testid="practice-poo-summary">
              <HStack align="start" gap="3"><Flex w="42px" h="42px" borderRadius="2xl" bg="#E0F2FE" color={PRACTICE_COLORS.deepBlue} align="center" justify="center"><Icon as={Waves} boxSize="5" /></Flex><Box><Text fontWeight="950" color={PRACTICE_COLORS.text}>Poo nhắc bạn</Text><Text mt="1" color={PRACTICE_COLORS.secondaryText} fontSize="sm" fontWeight="800">Chỉ sửa vài câu mỗi ngày. Không cần sợ lỗi — lỗi là bản đồ để Poo dẫn đường.</Text></Box></HStack>
              <SimpleGrid columns={3} gap="2" mt="4">
                <Box bg="#F8FAFC" border="1px solid" borderColor="#D7E8F5" borderRadius="2xl" p="2.5"><Text fontWeight="950" color={PRACTICE_COLORS.text}>{unresolvedMistakes.length}</Text><Text fontSize="2xs" fontWeight="850" color={PRACTICE_COLORS.secondaryText}>lỗi thật</Text></Box>
                <Box bg="#F8FAFC" border="1px solid" borderColor="#D7E8F5" borderRadius="2xl" p="2.5"><Text fontWeight="950" color={PRACTICE_COLORS.text}>{weakWords.length}</Text><Text fontSize="2xs" fontWeight="850" color={PRACTICE_COLORS.secondaryText}>từ yếu</Text></Box>
                <Box bg="#F8FAFC" border="1px solid" borderColor="#D7E8F5" borderRadius="2xl" p="2.5"><Text fontWeight="950" color={PRACTICE_COLORS.text}>4</Text><Text fontSize="2xs" fontWeight="850" color={PRACTICE_COLORS.secondaryText}>bước</Text></Box>
              </SimpleGrid>
            </Box>

            <Box className="penglish-glass-card" bg="rgba(255,255,255,0.66)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3.5', md: '5' }} display={{ base: 'none', lg: 'block' }}>
              <Text fontWeight="950" color={PRACTICE_COLORS.text}>Trò luyện thêm</Text>
              <Text mt="1" color={PRACTICE_COLORS.secondaryText} fontSize="sm" fontWeight="800">Sau khi ôn lỗi, bạn vẫn có thể vào các phần luyện cũ.</Text>
              <SimpleGrid columns={2} gap="2" mt="3">
                {GAMES.slice(0, 4).map((g) => <Button key={g.id} size="sm" borderRadius="full" variant="outline" onClick={() => setPicked(g.id)}>{g.name}</Button>)}
              </SimpleGrid>
            </Box>
          </VStack>
        </SimpleGrid>
      </Box>
    </OceanPageShell>
  );
}

