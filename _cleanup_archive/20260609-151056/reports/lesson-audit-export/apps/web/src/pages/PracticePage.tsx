import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Badge, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react';
import { BookOpen, HelpCircle, Headphones, PenTool, Target, Zap, Volume2, VolumeX, Settings, ChevronDown, ArrowLeft } from 'lucide-react';
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
import { getLearningHeartsState, getLockRemainingText, isLearningLocked, LEARNING_HEARTS_UPDATED_EVENT, type LearningHeartsState } from '../lib/p-english/learning-hearts';
import { getLessonById } from '../lib/p-english/lesson-content-data';
import { getAvailableLessonProgressModes, type LessonProgressMode } from '../lib/p-english/lesson-progress';
import { getCurrentStreak, incrementStudyDay, LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';

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

const GAMES: GameDef[] = [
  { id: 'flashcard', name: 'Flashcard', desc: 'Lật thẻ nhanh để ghi nhớ nghĩa và cách dùng.', icon: BookOpen, time: '3–5 phút', reward: 5 },
  { id: 'quiz', name: 'Trắc nghiệm', desc: 'Chọn đáp án đúng để kiểm tra độ nhớ từ.', icon: HelpCircle, time: '4–6 phút', reward: 5 },
  { id: 'listen', name: 'Nghe', desc: 'Nghe phát âm và nhận diện từ trong ngữ cảnh.', icon: Headphones, time: '5–7 phút', reward: 10 },
  { id: 'type', name: 'Gõ từ', desc: 'Luyện chính tả bằng cách nhập lại đáp án.', icon: PenTool, time: '5–8 phút', reward: 10 },
  { id: 'match', name: 'Ghép cặp', desc: 'Ghép từ với nghĩa để củng cố phản xạ.', icon: Target, time: '3–5 phút', reward: 5 },
  { id: 'speed', name: 'Tốc độ', desc: 'Trả lời nhanh để tăng tốc độ nhận diện từ.', icon: Zap, time: '2–4 phút', reward: 10 },
];

type Category = { id: string; name: string };
type Stats = { total?: number; ready?: number };

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

function normalizeLessonPracticeMode(mode: string | null): LessonProgressMode | null {
  if (!mode) return null;
  if (mode === 'typing') return 'type';
  if (mode === 'flashcard' || mode === 'quiz' || mode === 'listen' || mode === 'reflex' || mode === 'type' || mode === 'match' || mode === 'speed') {
    return mode;
  }
  return null;
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
        <Text mt="6" fontSize="3xl" fontWeight="950" color="#1F6FD6">Đang hồi bọt biển</Text>
        <Text mt="3" color="#334155" fontWeight="700">
          Hết bọt biển rồi, nghỉ một chút để hồi lại nhé. Các tính năng học sẽ mở lại sau {getLockRemainingText(state)}.
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
          fontWeight="800"
          textTransform="none"
        >
          +{game.reward} xu
        </Badge>
      </HStack>

      <VStack align="start" gap="1" flex="1">
        <Text fontWeight="900" fontSize={{ base: 'lg', md: 'xl' }} color={PRACTICE_COLORS.text}>{game.name}</Text>
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
          fontWeight="800"
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
          fontWeight="900"
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
  const suggestedMode = availableModes[0];
  const isUnavailableLessonMode = Boolean(lessonId && lesson && normalizedMode && !availableModes.includes(normalizedMode));
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [heartsState, setHeartsState] = useState<LearningHeartsState>(() => getLearningHeartsState());
  const [currentStreak, setCurrentStreak] = useState(() => getCurrentStreak());
  const { whaleMood, triggerWhaleMood } = useWhaleMoodController('idle');
 
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
    const token = localStorage.getItem('accessToken');
    if (lessonId || !token || !backendSyncEnabled) return;

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
    const refreshStreak = () => setCurrentStreak(getCurrentStreak());
    refreshStreak();
    window.addEventListener('focus', refreshStreak);
    window.addEventListener('storage', refreshStreak);
    window.addEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshStreak);
    return () => {
      window.removeEventListener('focus', refreshStreak);
      window.removeEventListener('storage', refreshStreak);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshStreak);
    };
  }, []);

  useEffect(() => {
    if (!lessonId || !normalizedMode || !lesson || !availableModes.includes(normalizedMode)) return;
    setCurrentStreak(incrementStudyDay());
  }, [availableModes, lesson, lessonId, normalizedMode]);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem('game_sound_muted', next ? '1' : '0');
      return next;
    });
  };

  const renderWithStudyWhale = (content: ReactNode, placement: WhaleCompanionPlacement = 'hidden-mobile') => (
    <Box position="relative" isolation="isolate">
      <WhaleStudyCompanion mood={whaleMood} placement={placement} streak={currentStreak} />
      {content}
    </Box>
  );

  const categoryOpts = useMemo(
    () => [{ value: 'all', label: 'Tất cả' }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories],
  );

  const readyCount = stats.ready ?? stats.total ?? 0;

  if (lessonId && normalizedMode && !isUnavailableLessonMode && isLearningLocked(heartsState)) {
    return <LearningLockedScreen lessonId={lessonId} state={heartsState} />;
  }

  if (isUnavailableLessonMode && lesson) {
    return (
      <OceanPageShell variant="vocab" overlayStrength="medium" minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8" pb={{ base: '28', lg: '8' }}>
        <Box data-testid="practice-fallback-card" maxW="760px" mx="auto" bg="rgba(255,255,255,0.9)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '6', md: '8' }} boxShadow="0 18px 45px rgba(31, 111, 214, 0.10)">
          <Badge borderRadius="full" bg="#EFF6FF" color="#2563EB" mb="3" textTransform="none">Practice fallback</Badge>
          <Text fontSize="2xl" fontWeight="900" color="#0F172A">Chế độ này chưa có dữ liệu cho bài học này.</Text>
          <Text mt="2" color="#64748B" lineHeight="1.7">
            {suggestedMode ? 'Poo đã chọn một mode phù hợp hơn dựa trên nội dung hiện có. Không mất tiến độ — bạn chỉ cần chuyển sang surface đang có dữ liệu.' : 'Bài này hiện chỉ có phần đọc/xem nội dung, chưa có mode luyện tập riêng.'}
          </Text>
          <Text mt="3" color="#2563EB" fontSize="sm" fontWeight="800">Gợi ý phím: Enter để bắt đầu mode được đề xuất, hoặc quay lại bài học để xem kế hoạch.</Text>
          <HStack mt="6" wrap="wrap">
            {suggestedMode ? (
              <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=${suggestedMode}`} borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
                Luyện mode phù hợp
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
            <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện flashcard</Text>
            <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
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
            <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện tập</Text>
            <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
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
            <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện nghe</Text>
            <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
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
            <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện phản xạ</Text>
            <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
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
            <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện gõ câu</Text>
            <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
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
            <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để ghép cặp</Text>
            <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
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
            <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện tốc độ</Text>
            <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
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
          <Badge borderRadius="full" bg="#EFF6FF" color="#2563EB" mb="3" textTransform="none">Practice fallback</Badge>
          <Text fontSize="2xl" fontWeight="900" color="#0F172A">Chế độ này chưa nằm trong bộ luyện tập hiện tại.</Text>
          <Text mt="2" color="#64748B" lineHeight="1.7">Bạn có thể quay lại bài học hoặc chọn một mode luyện tập đang có dữ liệu. Route vẫn an toàn và không làm mất trạng thái học.</Text>
          <Text mt="3" color="#2563EB" fontSize="sm" fontWeight="800">Gợi ý phím: dùng Tab để chọn hành động, Enter để xác nhận.</Text>
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
        <VStack
          bgGradient="linear(135deg, #DDF5FF 0%, #F8FCFF 58%, #FFFFFF 100%)"
          border="1px solid"
          borderColor="#BAE6FD"
          borderRadius="2xl"
          boxShadow="0 18px 42px rgba(47, 158, 235, 0.12)"
          p={{ base: '8', md: '10' }}
          minH="320px"
          gap="4"
          justify="center"
          position="relative"
          overflow="hidden"
          sx={{
            '@keyframes practiceLoadingBubbleDrift': {
              '0%, 100%': { transform: 'translate3d(0, 0, 0)', opacity: 0.5 },
              '50%': { transform: 'translate3d(0, -16px, 0)', opacity: 0.95 },
            },
            '.practice-loading-bubble': {
              animation: 'practiceLoadingBubbleDrift 6.4s ease-in-out infinite',
            },
            '@media (prefers-reduced-motion: reduce)': {
              '.practice-loading-bubble': { animation: 'none !important' },
            },
          }}
        >
          <Box position="absolute" inset="0" pointerEvents="none" aria-hidden="true">
            <Box position="absolute" right={{ base: '34px', md: '220px' }} top={{ base: '34px', md: '48px' }} w="12px" h="12px" borderRadius="full" bg="rgba(91, 188, 235, 0.30)" boxShadow="0 0 0 1px rgba(47,158,235,0.16)" className="practice-loading-bubble" />
            <Box position="absolute" right={{ base: '18px', md: '176px' }} bottom={{ base: '44px', md: '62px' }} w="9px" h="9px" borderRadius="full" bg="rgba(221, 245, 255, 0.78)" boxShadow="0 0 0 1px rgba(47,158,235,0.14)" className="practice-loading-bubble" sx={{ animationDelay: '-1.4s' }} />
            <Box position="absolute" left={{ base: '24px', md: '92px' }} bottom={{ base: '28px', md: '46px' }} w="7px" h="7px" borderRadius="full" bg="rgba(91, 188, 235, 0.22)" boxShadow="0 0 0 1px rgba(47,158,235,0.12)" className="practice-loading-bubble" sx={{ animationDelay: '-2.2s' }} />
          </Box>
          <Box
            position="absolute"
            right={{ base: '-112px', md: '-34px' }}
            top={{ base: '-2px', md: '0px' }}
            transform={{ base: 'scale(0.82)', md: 'scale(1.06)' }}
            opacity={{ base: 0.48, md: 0.58 }}
            pointerEvents="none"
            aria-hidden="true"
          >
            {picked === 'quiz' || picked === 'match' ? (
              <OceanMascot mascot="cuaQuiz" pose="quiz" size="hero" decorative motion="float" />
            ) : (
              <OceanMascot mascot="poo" pose="idle" size="hero" decorative motion="float" />
            )}
          </Box>
          <VStack position="relative" zIndex={1} gap="4" textAlign="center" pr={{ base: 0, md: '170px' }} maxW={{ base: '100%', md: '620px' }}>
            {game && (
              <Flex w="64px" h="64px" borderRadius="2xl" bg="rgba(255, 255, 255, 0.76)" border="1px solid" borderColor="rgba(47, 158, 235, 0.20)" align="center" justify="center" color={PRACTICE_COLORS.deepBlue} boxShadow="0 12px 24px rgba(47, 158, 235, 0.10)">
                <Icon as={game.icon} boxSize="8" />
              </Flex>
            )}
            <Text fontSize="2xl" fontWeight="800" color={PRACTICE_COLORS.deepBlue}>Đang khởi động {game?.name ?? ''}...</Text>
            <Text color="#52667A" fontSize="sm">
              {readyCount} từ sẵn sàng • {filters.count} câu • {LEVEL_OPTS.find((l) => l.value === filters.level)?.label}
            </Text>
            <HStack gap="1.5" color="#2F9EEB" fontSize="xs" fontWeight="800" opacity="0.9" wrap="wrap" justify="center">
              <Box w="7px" h="7px" borderRadius="full" bg="#5BBCEB" />
              <Text>Đang gom bong bóng câu hỏi</Text>
              <Box w="7px" h="7px" borderRadius="full" bg="#AEE7FF" />
            </HStack>
            <Text color="#2F9EEB" fontSize="xs" fontWeight="800" opacity="0.82">
              {picked === 'quiz' || picked === 'match' ? 'Cua Quiz đang gom đáp án theo nhịp học của bạn' : 'Poo đang bơi theo nhịp học của bạn'}
            </Text>
          </VStack>
        </VStack>
      </OceanPageShell>
    );
  }

  return (
    <OceanPageShell variant="vocab" overlayStrength="medium" minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="6" pb={{ base: '28', lg: '10' }} overflowX="hidden">
      <Box maxW="1180px" mx="auto">
      <Flex justify="space-between" align={{ base: 'start', lg: 'center' }} mb="5" wrap="wrap" gap="4" bg="rgba(255,255,255,0.86)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '5', md: '6' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" backdropFilter="blur(16px)">
        <HStack align="center" gap="4">
          <Box display={{ base: 'none', sm: 'block' }} pointerEvents="none">
            <OceanMascot mascot="cuaQuiz" pose="quiz" size="md" decorative motion="float" />
          </Box>
          <Box>
            <Badge borderRadius="full" bg="#EFF6FF" color="#2563EB" mb="2" textTransform="none">Practice surface</Badge>
            <Box as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="900" color={PRACTICE_COLORS.text}>Luyện tập</Box>
            <Text color={PRACTICE_COLORS.secondaryText} fontWeight="700">Cua Quiz hỗ trợ trắc nghiệm và ghép cặp; task area gọn và có phím tắt khi vào bài.</Text>
          </Box>
        </HStack>
        <HStack gap="3" wrap="wrap">
          <FilterDropdown
            label="Bộ từ"
            value={filters.categoryId}
            options={categoryOpts}
            onChange={(v) => setFilters((f) => ({ ...f, categoryId: v }))}
          />
          <FilterDropdown
            label="Bộ lọc"
            value={filters.level}
            options={LEVEL_OPTS as any}
            onChange={(v) => setFilters((f) => ({ ...f, level: v as FilterState['level'] }))}
          />
          <FilterDropdown
            label="Thứ tự"
            value={filters.order}
            options={ORDER_OPTS as any}
            onChange={(v) => setFilters((f) => ({ ...f, order: v as FilterState['order'] }))}
          />
          <FilterDropdown
            label="Số lượng"
            value={String(filters.count)}
            options={COUNT_OPTS.map((c) => ({ value: String(c), label: `${c} từ` }))}
            onChange={(v) => setFilters((f) => ({ ...f, count: Number(v) as FilterState['count'] }))}
          />
        </HStack>
      </Flex>

      <HStack mb="4" gap="3" wrap="wrap" bg="rgba(255,255,255,0.72)" border="1px solid" borderColor="#D7E8F5" borderRadius="2xl" p="3">
        <AudioPill muted={muted} volume={volume} onToggle={toggleMute} />
        <IconButton
          aria-label="Cài đặt game"
          icon={<Icon as={Settings} />}
          variant="ghost"
          borderRadius="full"
          size="md"
        />
        <Badge bg="#E4FBEA" color="#276749" border="1px solid" borderColor={PRACTICE_COLORS.successGreen} borderRadius="full" px="3" py="1.5" fontSize="sm" textTransform="none">
          {readyCount} từ sẵn sàng
        </Badge>
      </HStack>

      {readyCount === 0 ? (
        <Box
          mb="5"
          bg={`linear-gradient(135deg, ${PRACTICE_COLORS.softAqua}, #F7FBFF)`}
          border="1px solid"
          borderColor={PRACTICE_COLORS.border}
          borderRadius="2xl"
          px={{ base: '4', md: '5' }}
          py="4"
        >
          <Text color={PRACTICE_COLORS.text} fontWeight="800">Bạn chưa có từ sẵn sàng.</Text>
          <Text color={PRACTICE_COLORS.secondaryText} fontSize="sm" mt="1">
            Hãy học bài mới hoặc thêm từ để bắt đầu luyện tập.
          </Text>
        </Box>
      ) : null}

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: '3', md: '4' }}>
        {GAMES.map((g, i) => (
          <GameTile key={g.id} game={g} idx={i} readyCount={readyCount} selectedCount={filters.count} onPick={setPicked} />
        ))}
      </SimpleGrid>
      </Box>
    </OceanPageShell>
  );
}
