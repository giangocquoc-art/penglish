import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Volume2 } from 'lucide-react';
import { OceanMascot } from '../p-english/OceanMascot';
import { loseHeart } from '../../lib/p-english/learning-hearts';
import type { EnglishLesson, VocabularyItem } from '../../lib/p-english/lesson-content-data';
import { recordPracticeSessionMemory } from '../../lib/p-english/localSkillMemory';
import { getQuestionRandomSeed, shuffleArrayStableCopy } from '../../lib/p-english/practice-randomization';
import { getPracticeSessionFeedback } from '../../lib/p-english/practiceSessionFeedback';
import { PracticeSessionFeedbackCard } from './PracticeSessionFeedbackCard';
import type { WhaleMood } from '../streak/AdaptiveWhaleStreak';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#E2E8F0',
};

const PAIRS_PER_ROUND = 6;

type MatchPair = {
  id: string;
  left: string;
  right: string;
  example: string;
  exampleMeaningVi: string;
  tags: string[];
};

type MatchProgress = {
  attempts: number;
  completedPairIds: string[];
  weakPairIds: string[];
  lastMistakes: number;
  lastCompletedAt: string;
};

type LessonProgress = Record<string, unknown> & {
  match?: MatchProgress;
};

function vocabularyToPair(item: VocabularyItem): MatchPair {
  return {
    id: item.id,
    left: item.term,
    right: item.meaningVi,
    example: item.example,
    exampleMeaningVi: item.exampleMeaningVi,
    tags: item.tags,
  };
}

function splitIntoRounds(pairs: MatchPair[]) {
  const rounds: MatchPair[][] = [];
  for (let index = 0; index < pairs.length; index += PAIRS_PER_ROUND) {
    rounds.push(pairs.slice(index, index + PAIRS_PER_ROUND));
  }
  return rounds;
}

function speakEnglish(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.86;
  window.speechSynthesis.speak(utterance);
}

function safeReadProgress(lessonId: string): LessonProgress {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(`PooEnglish:lesson-progress:${lessonId}`);
    return raw ? (JSON.parse(raw) as LessonProgress) : {};
  } catch {
    return {};
  }
}

function safeWriteProgress(lessonId: string, updater: (current: LessonProgress) => LessonProgress) {
  if (typeof window === 'undefined') return;

  try {
    const current = safeReadProgress(lessonId);
    window.localStorage.setItem(`PooEnglish:lesson-progress:${lessonId}`, JSON.stringify(updater(current)));
  } catch {
    // Match practice still works in memory if localStorage is unavailable.
  }
}

function getSummaryMessage(mistakes: number) {
  if (mistakes <= 2) return 'Rất tốt! Bạn nhận diện cụm khá chắc.';
  if (mistakes <= 6) return 'Ổn rồi, hãy ôn lại các cặp còn nhầm.';
  return 'Nên quay lại thẻ từ trước khi ghép lại.';
}

export function LessonMatchPractice({ lesson, onWhaleMoodChange }: { lesson: EnglishLesson; onWhaleMoodChange?: (mood: WhaleMood) => void }) {
  const allPairs = useMemo(() => lesson.vocabulary.map(vocabularyToPair), [lesson.vocabulary]);
  const [activePairs, setActivePairs] = useState<MatchPair[]>(allPairs);
  const [rounds, setRounds] = useState<MatchPair[][]>(() => splitIntoRounds(shuffleArrayStableCopy(allPairs, getQuestionRandomSeed(`match-${lesson.id}`, 0))));
  const [rightOrders, setRightOrders] = useState<MatchPair[][]>(() => splitIntoRounds(shuffleArrayStableCopy(allPairs, getQuestionRandomSeed(`match-${lesson.id}`, 0))).map((round, index) => shuffleArrayStableCopy(round, `${getQuestionRandomSeed(`match-${lesson.id}`, 0)}::right::${index}`)));
  const [matchSessionAttempt, setMatchSessionAttempt] = useState(0);
  const [started, setStarted] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [completedPairIds, setCompletedPairIds] = useState<string[]>([]);
  const [weakPairIds, setWeakPairIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [roundMistakes, setRoundMistakes] = useState(0);
  const [warning, setWarning] = useState('');
  const [wrongLeftId, setWrongLeftId] = useState<string | null>(null);
  const [wrongRightId, setWrongRightId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [savedSummary, setSavedSummary] = useState(false);

  const currentRound = rounds[roundIndex] ?? [];
  const currentRightOrder = rightOrders[roundIndex] ?? [];
  const matchedCount = currentRound.filter((pair) => matchedIds.includes(pair.id)).length;
  const currentRoundDone = currentRound.length > 0 && matchedCount === currentRound.length;
  const progressValue = activePairs.length > 0 ? (completedPairIds.length / activePairs.length) * 100 : 0;
  const weakPairs = activePairs.filter((pair) => weakPairIds.includes(pair.id));
  const percentage = activePairs.length > 0 ? Math.round((completedPairIds.length / activePairs.length) * 100) : 0;

  const configureSession = (pairs: MatchPair[]) => {
    const nextAttempt = matchSessionAttempt + 1;
    const seed = getQuestionRandomSeed(`match-${lesson.id}`, nextAttempt);
    const shuffledLeftPairs = shuffleArrayStableCopy(pairs, `${seed}::left`);
    const nextRounds = splitIntoRounds(shuffledLeftPairs);
    setMatchSessionAttempt(nextAttempt);
    setActivePairs(shuffledLeftPairs);
    setRounds(nextRounds);
    setRightOrders(nextRounds.map((round, index) => shuffleArrayStableCopy(round, `${seed}::right::${index}`)));
    setRoundIndex(0);
    setSelectedLeftId(null);
    setMatchedIds([]);
    setCompletedPairIds([]);
    setWeakPairIds([]);
    setMistakes(0);
    setRoundMistakes(0);
    setWarning('');
    setWrongLeftId(null);
    setWrongRightId(null);
    setShowSummary(false);
    setSavedSummary(false);
    setStarted(true);
  };

  const startPractice = () => configureSession(allPairs);
  const restartAll = () => configureSession(allPairs);
  const restartWeak = () => {
    if (weakPairs.length === 0) return;
    configureSession(weakPairs);
  };

  const pickLeft = (pairId: string) => {
    if (matchedIds.includes(pairId)) return;
    setSelectedLeftId(pairId);
    setWarning('');
    setWrongLeftId(null);
    setWrongRightId(null);
  };

  const pickRight = (pairId: string) => {
    if (matchedIds.includes(pairId)) return;

    if (!selectedLeftId) {
      onWhaleMoodChange?.('encourage');
      setWarning('Hãy chọn một cụm tiếng Anh bên trái trước.');
      return;
    }

    if (selectedLeftId === pairId) {
      onWhaleMoodChange?.('correct');
      setMatchedIds((current) => [...current, pairId]);
      setCompletedPairIds((current) => (current.includes(pairId) ? current : [...current, pairId]));
      setSelectedLeftId(null);
      setWarning('');
      setWrongLeftId(null);
      setWrongRightId(null);
      return;
    }

    setMistakes((count) => count + 1);
    setRoundMistakes((count) => count + 1);
    setWeakPairIds((current) => (current.includes(selectedLeftId) ? current : [...current, selectedLeftId]));
    const hearts = loseHeart('match-wrong');
    onWhaleMoodChange?.('mistake');
    setWarning(`Chưa khớp, thử lại nhé. Bạn mất 1 bọt biển. Còn ${hearts.heartsLeft}/${hearts.maxHearts} bọt biển. Cua nhỏ vẫn kẹp nhẹ đáp án cùng bạn — thử lại nhịp tiếp theo nhé.`);
    setWrongLeftId(selectedLeftId);
    setWrongRightId(pairId);

    window.setTimeout(() => {
      setWrongLeftId(null);
      setWrongRightId(null);
    }, 700);
  };

  const goNextRound = () => {
    if (roundIndex >= rounds.length - 1) {
      onWhaleMoodChange?.('celebrate');
      setShowSummary(true);
      setSavedSummary(false);
      return;
    }

    setRoundIndex((index) => index + 1);
    setMatchedIds([]);
    setSelectedLeftId(null);
    setRoundMistakes(0);
    setWarning('');
    setWrongLeftId(null);
    setWrongRightId(null);
  };

  useEffect(() => {
    if (!showSummary || savedSummary) return;

    safeWriteProgress(lesson.id, (current) => ({
      ...current,
      match: {
        attempts: ((current.match as MatchProgress | undefined)?.attempts ?? 0) + 1,
        completedPairIds,
        weakPairIds,
        lastMistakes: mistakes,
        lastCompletedAt: new Date().toISOString(),
      },
    }));

    recordPracticeSessionMemory({
      lessonId: lesson.id,
      lessonTitleVi: lesson.titleVi,
      mode: 'match',
      total: completedPairIds.length,
      correct: Math.max(0, completedPairIds.length - weakPairIds.length),
      wrong: weakPairIds.length,
      percentage,
      weakItemIds: weakPairIds,
    });

    setSavedSummary(true);
  }, [completedPairIds, lesson.id, lesson.titleVi, mistakes, percentage, savedSummary, showSummary, weakPairIds]);

  if (allPairs.length === 0) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color={COLORS.text}>Poo mở phần ghép nghĩa ở nhịp khác</Text>
          <Text mt="2" color={COLORS.muted}>Bài này ưu tiên nhịp luyện khác trước khi vào trò ghép nghĩa.</Text>
          <Button as={Link} to="/vocabularies" mt="6" borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
            Mở sổ từ vựng
          </Button>
        </Box>
      </Box>
    );
  }

  if (!started) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
        <Box maxW="860px" mx="auto" bg="rgba(255,255,255,0.92)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '6', md: '8' }} boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)">
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
            <Box>
              <Badge colorScheme="cyan" borderRadius="full" px="3" py="1">Từ vựng • Ghép cặp</Badge>
              <Text mt="4" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="900" color={COLORS.text}>Ghép nghĩa từ vựng</Text>
            </Box>
            <Box display={{ base: 'none', sm: 'block' }} pointerEvents="none">
              <OceanMascot mascot="cuaQuiz" pose="quiz" size="lg" decorative motion="pulse" />
            </Box>
          </Flex>
          <Text mt="2" fontSize="xl" fontWeight="800" color={COLORS.text}>{lesson.titleVi}</Text>
          <Text color={COLORS.muted}>{lesson.titleEn}</Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="3" mt="6">
            <SummaryMetric label="Tổng cặp" value={allPairs.length} />
            <SummaryMetric label="Số vòng" value={splitIntoRounds(allPairs).length} />
            <SummaryMetric label="Mỗi vòng" value={`${PAIRS_PER_ROUND} cặp`} />
          </SimpleGrid>

          <Box mt="6" border="1px solid" borderColor="#FDE68A" bg="#FFFBEB" borderRadius="2xl" p="4">
            <Text color="#92400E" fontWeight="700">
              Chọn một từ/cụm tiếng Anh bên trái, rồi chọn nghĩa tiếng Việt tương ứng bên phải. Đây là trò luyện từ vựng nhẹ, Poo chỉ muốn bạn nối đúng nghĩa từng cụm.
            </Text>
          </Box>

          <Flex mt="7" gap="3" wrap="wrap">
            <Button onClick={startPractice} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
              Bắt đầu ghép cặp
            </Button>
            <Button as={Link} to="/vocabularies" borderRadius="full" variant="outline">
              Về sổ từ vựng
            </Button>
          </Flex>
        </Box>
      </Box>
    );
  }

  if (showSummary) {
    return (
      <MatchSummary
        lesson={lesson}
        total={activePairs.length}
        completed={completedPairIds.length}
        mistakes={mistakes}
        weakPairs={weakPairs}
        percentage={percentage}
        onRestartAll={restartAll}
        onRestartWeak={restartWeak}
      />
    );
  }

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} pb="12">
      <Box maxW="1120px" mx="auto">
        <VStack align="stretch" gap="5">
          <Box bg="rgba(255,255,255,0.92)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '5', md: '7' }} boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)">
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4">
              <Box>
                <HStack wrap="wrap" gap="2" mb="2">
                  <Badge colorScheme="cyan" borderRadius="full" px="3" py="1">Ghép nghĩa từ vựng</Badge>
                  <Badge bg="#EFF6FF" color="#1D4ED8" borderRadius="full" px="3" py="1">Vòng {roundIndex + 1}/{rounds.length}</Badge>
                </HStack>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="900" color={COLORS.text}>Ghép nghĩa từ vựng</Text>
                <Text color={COLORS.muted}>Ưu tiên nhận diện từ/cụm và nghĩa tiếng Việt trước, không dịch từng chữ.</Text>
              </Box>
              <HStack align="center" gap="3">
                <Box display={{ base: 'none', sm: 'block' }} pointerEvents="none">
                  <OceanMascot mascot="cuaQuiz" pose="choice" size="md" decorative motion="float" />
                </Box>
                <VStack align={{ base: 'start', md: 'end' }} gap="1">
                  <Text fontWeight="800" color={COLORS.green}>Vòng này: {matchedCount}/{currentRound.length}</Text>
                  <Text fontWeight="800" color={COLORS.primary}>Đã xong: {completedPairIds.length}/{activePairs.length}</Text>
                  <Text fontWeight="800" color="#9A3412">Lỗi: {mistakes}</Text>
                </VStack>
              </HStack>
            </Flex>
            <Progress mt="5" value={progressValue} colorScheme="blue" borderRadius="full" bg="#E2E8F0" />
          </Box>

          {warning ? (
            <Box border="1px solid" borderColor="#FDE68A" bg="#FFFBEB" borderRadius="2xl" p="4" role="status" aria-live="polite">
              <HStack align="start" gap="3">
                <OceanMascot mascot="cuaQuiz" pose="coach" size="sm" decorative motion="pulse" />
                <Text color="#92400E" fontWeight="900">{warning}</Text>
              </HStack>
            </Box>
          ) : null}

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
            <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '6' }}>
              <Text fontSize="xl" fontWeight="900" color={COLORS.text} mb="4">Từ/cụm tiếng Anh</Text>
              <VStack align="stretch" gap="3">
                {currentRound.map((pair) => (
                  <MatchLeftCard
                    key={pair.id}
                    pair={pair}
                    selected={selectedLeftId === pair.id}
                    matched={matchedIds.includes(pair.id)}
                    wrong={wrongLeftId === pair.id}
                    onPick={() => pickLeft(pair.id)}
                  />
                ))}
              </VStack>
            </Box>

            <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '6' }}>
              <Text fontSize="xl" fontWeight="900" color={COLORS.text} mb="4">Nghĩa tiếng Việt</Text>
              <VStack align="stretch" gap="3">
                {currentRightOrder.map((pair) => (
                  <MatchRightCard
                    key={pair.id}
                    pair={pair}
                    matched={matchedIds.includes(pair.id)}
                    wrong={wrongRightId === pair.id}
                    onPick={() => pickRight(pair.id)}
                  />
                ))}
              </VStack>
            </Box>
          </SimpleGrid>

          {matchedIds.length > 0 ? (
            <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '6' }}>
              <Text fontSize="lg" fontWeight="900" color={COLORS.text}>Ví dụ đã mở khóa</Text>
              <VStack align="stretch" gap="3" mt="3">
                {currentRound.filter((pair) => matchedIds.includes(pair.id)).map((pair) => (
                  <Box key={pair.id} border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4">
                    <Text color="#166534" fontWeight="900">{pair.left} = {pair.right}</Text>
                    <Text mt="2" color={COLORS.text}>{pair.example}</Text>
                    <Text color={COLORS.muted}>{pair.exampleMeaningVi}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          ) : null}

          {currentRoundDone ? (
            <Box bg="rgba(240,253,244,0.94)" border="1px solid" borderColor="#BBF7D0" borderRadius="3xl" p={{ base: '5', md: '7' }}>
              <HStack align="center" gap="3" mb="2">
                <OceanMascot mascot="cuaQuiz" pose="happy" size="sm" decorative motion="celebrate" />
                <Text fontSize="2xl" fontWeight="900" color="#166534">Hoàn thành vòng {roundIndex + 1}</Text>
              </HStack>
              <Text mt="2" color={COLORS.muted}>Số lỗi trong vòng này: {roundMistakes}</Text>
              <Button mt="5" onClick={goNextRound} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
                {roundIndex >= rounds.length - 1 ? 'Xem tổng kết' : 'Vòng tiếp theo'}
              </Button>
            </Box>
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}

function MatchLeftCard({ pair, selected, matched, wrong, onPick }: { pair: MatchPair; selected: boolean; matched: boolean; wrong: boolean; onPick: () => void }) {
  const borderColor = matched ? COLORS.green : wrong ? '#FDBA74' : selected ? COLORS.primary : COLORS.border;
  const bg = matched ? '#F0FDF4' : wrong ? '#FFF7ED' : selected ? '#EFF6FF' : '#FFFFFF';
  const color = matched ? '#166534' : COLORS.text;

  return (
    <Box border="2px solid" borderColor={borderColor} bg={bg} borderRadius="2xl" p="4" cursor={matched ? 'default' : 'pointer'} onClick={onPick} opacity={matched ? 0.78 : 1}>
      <Flex align="center" justify="space-between" gap="3">
        <Box minW="0">
          <Text color={color} fontWeight="900" fontSize="lg" wordBreak="break-word">{pair.left}</Text>
          <HStack mt="2" wrap="wrap">
            {pair.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} borderRadius="full" bg="#F8FAFC" color={COLORS.muted}>{tag}</Badge>
            ))}
          </HStack>
        </Box>
        <IconButton
          aria-label={`Nghe cụm ${pair.left}`}
          icon={<Volume2 size={18} />}
          size="sm"
          borderRadius="full"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            speakEnglish(pair.left);
          }}
        />
      </Flex>
    </Box>
  );
}

function MatchRightCard({ pair, matched, wrong, onPick }: { pair: MatchPair; matched: boolean; wrong: boolean; onPick: () => void }) {
  const borderColor = matched ? COLORS.green : wrong ? '#FDBA74' : COLORS.border;
  const bg = matched ? '#F0FDF4' : wrong ? '#FFF7ED' : '#FFFFFF';
  const color = matched ? '#166534' : COLORS.text;

  return (
    <Box border="2px solid" borderColor={borderColor} bg={bg} borderRadius="2xl" p="4" cursor={matched ? 'default' : 'pointer'} onClick={onPick} opacity={matched ? 0.78 : 1}>
      <Text color={color} fontWeight="900" fontSize="lg" wordBreak="break-word">{pair.right}</Text>
    </Box>
  );
}

function MatchSummary({
  lesson,
  total,
  completed,
  mistakes,
  weakPairs,
  percentage,
  onRestartAll,
  onRestartWeak,
}: {
  lesson: EnglishLesson;
  total: number;
  completed: number;
  mistakes: number;
  weakPairs: MatchPair[];
  percentage: number;
  onRestartAll: () => void;
  onRestartWeak: () => void;
}) {
  const feedback = getPracticeSessionFeedback({
    lesson,
    mode: 'match',
    total,
    correct: completed,
    wrong: weakPairs.length,
    percentage,
    weakItemIds: weakPairs.map((pair) => pair.id),
    nextMode: weakPairs.length > 0 ? 'match' : 'quiz',
  });

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
      <Box maxW="980px" mx="auto">
        <Box bg="rgba(255,255,255,0.92)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '6', md: '8' }} boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)">
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
            <Box>
              <Badge colorScheme="cyan" borderRadius="full" px="3" py="1">Hoàn thành ghép nghĩa từ vựng</Badge>
              <Text mt="4" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="900" color={COLORS.text}>{percentage}%</Text>
            </Box>
            <Box display={{ base: 'none', sm: 'block' }} pointerEvents="none">
              <OceanMascot mascot="cuaQuiz" pose="celebrate" size="lg" decorative motion="celebrate" />
            </Box>
          </Flex>
          <Text mt="2" fontSize="lg" fontWeight="800" color={COLORS.text}>{getSummaryMessage(mistakes)}</Text>

          <SimpleGrid columns={{ base: 1, md: 4 }} gap="4" mt="6">
            <SummaryMetric label="Tổng cặp" value={total} />
            <SummaryMetric label="Đã ghép" value={completed} tone="green" />
            <SummaryMetric label="Lỗi" value={mistakes} tone="red" />
            <SummaryMetric label="Cặp yếu" value={weakPairs.length} />
          </SimpleGrid>

          <PracticeSessionFeedbackCard feedback={feedback} />

          <Box mt="7">
            <Text fontSize="xl" fontWeight="900" color={COLORS.text}>Từ/cụm cần ôn lại</Text>
            {weakPairs.length === 0 ? (
              <Box mt="3" border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4">
                <Text color="#166534" fontWeight="800">Không có cặp yếu. Bạn đã nhận diện rất chắc.</Text>
              </Box>
            ) : (
              <VStack align="stretch" gap="3" mt="3">
                {weakPairs.map((pair) => (
                  <Box key={pair.id} border="1px solid" borderColor="#FDE68A" bg="#FFFBEB" borderRadius="2xl" p="4">
                    <Text color="#92400E" fontWeight="900">{pair.left} = {pair.right}</Text>
                    <Text mt="2" color={COLORS.text}>{pair.example}</Text>
                    <Text color={COLORS.muted}>{pair.exampleMeaningVi}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          <Flex mt="7" gap="3" wrap="wrap">
            <Button onClick={onRestartWeak} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }} isDisabled={weakPairs.length === 0}>
              Ôn lại từ/cụm sai
            </Button>
            <Button onClick={onRestartAll} borderRadius="full" variant="outline">
              Làm lại toàn bộ
            </Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=speed`} borderRadius="full" variant="outline">
              Luyện tốc độ từ vựng
            </Button>
            <Button as={Link} to="/vocabularies" borderRadius="full" variant="outline">
              Về hub từ vựng
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function SummaryMetric({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'red' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'red' ? '#9A3412' : COLORS.text;

  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="4">
      <Text color={COLORS.muted} fontSize="sm" fontWeight="800">{label}</Text>
      <Text mt="1" color={color} fontSize="2xl" fontWeight="900">{value}</Text>
    </Box>
  );
}
