import { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, Collapse, Flex, HStack, Icon, Progress, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, CheckCircle2, Headphones, Play, RotateCcw, Volume2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recordLearningActivity } from '../../lib/p-english/daily-rewards';
import { loseHeart } from '../../lib/p-english/learning-hearts';
import type { EnglishLesson, ListeningPracticeItem, MiniDialogue } from '../../lib/p-english/lesson-content-data';
import { mergeLessonProgress, readLessonProgress } from '../../lib/p-english/lesson-progress';
import { recordPracticeSessionMemory } from '../../lib/p-english/localSkillMemory';
import { getPracticeSessionFeedback } from '../../lib/p-english/practiceSessionFeedback';
import { PracticeSessionFeedbackCard } from './PracticeSessionFeedbackCard';
import type { WhaleMood } from '../streak/AdaptiveWhaleStreak';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#E2E8F0',
};

type AnswerState = {
  selected: string | null;
  checked: boolean;
  isCorrect: boolean;
  transcriptVisible: boolean;
  listenCount: number;
  heartLossText?: string;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

function canUseSpeech() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function speakEnglish(text: string, rate: number) {
  if (!canUseSpeech()) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

function makeInitialAnswers(items: ListeningPracticeItem[]) {
  return items.reduce<Record<string, AnswerState>>((acc, item) => {
    acc[item.id] = {
      selected: null,
      checked: false,
      isCorrect: false,
      transcriptVisible: false,
      listenCount: 0,
    };
    return acc;
  }, {});
}

function summaryMessage(percentage: number) {
  if (percentage >= 80) return 'Bạn nghe khá ổn, hãy chuyển sang phản xạ.';
  if (percentage >= 50) return 'Ổn rồi, hãy nghe lại các câu sai ở tốc độ chậm.';
  return 'Nên nghe lại transcript và shadowing từng câu.';
}

export function LessonListeningPractice({ lesson, onWhaleMoodChange }: { lesson: EnglishLesson; onWhaleMoodChange?: (mood: WhaleMood) => void }) {
  const allItems = lesson.listeningPractice;
  const [items, setItems] = useState<ListeningPracticeItem[]>(allItems);
  const [answers, setAnswers] = useState(() => makeInitialAnswers(allItems));
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [savedSummary, setSavedSummary] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [listenedDialogueIds, setListenedDialogueIds] = useState<string[]>([]);
  const currentItem = items[currentIndex];
  const currentAnswer = currentItem ? answers[currentItem.id] : undefined;

  const correctIds = useMemo(
    () => items.filter((item) => answers[item.id]?.checked && answers[item.id]?.isCorrect).map((item) => item.id),
    [answers, items],
  );
  const wrongItems = useMemo(
    () => items.filter((item) => answers[item.id]?.checked && !answers[item.id]?.isCorrect),
    [answers, items],
  );
  const checkedCount = useMemo(
    () => items.filter((item) => answers[item.id]?.checked).length,
    [answers, items],
  );
  const progressValue = items.length === 0 ? 0 : ((showSummary ? items.length : currentIndex) / items.length) * 100;

  useEffect(() => {
    setSpeechSupported(canUseSpeech());
    return () => {
      if (canUseSpeech()) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!showSummary || savedSummary || items.length === 0) return;

    const total = items.length;
    const score = correctIds.length;
    const percentage = Math.round((score / total) * 100);
    const completedItemIds = items.map((item) => item.id);
    const wrongItemIds = items.filter((item) => !answers[item.id]?.isCorrect).map((item) => item.id);

    const currentProgress = readLessonProgress(lesson.id);

    mergeLessonProgress(lesson.id, {
      listening: {
        attempts: (currentProgress?.listening?.attempts ?? 0) + 1,
        completedItemIds,
        correctItemIds: correctIds,
        wrongItemIds,
        lastScore: score,
        lastPercentage: percentage,
        lastCompletedAt: new Date().toISOString(),
      },
    });

    recordLearningActivity('lesson', lesson.id);

    recordPracticeSessionMemory({
      lessonId: lesson.id,
      lessonTitleVi: lesson.titleVi,
      mode: 'listen',
      total,
      correct: score,
      wrong: wrongItemIds.length,
      percentage,
      weakItemIds: wrongItemIds,
    });

    setSavedSummary(true);
  }, [answers, correctIds, items, lesson.id, lesson.titleVi, savedSummary, showSummary]);

  const updateAnswer = (itemId: string, patch: Partial<AnswerState>) => {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        ...patch,
      },
    }));
  };

  const playItem = (rate: number) => {
    if (!currentItem) return;
    const ok = speakEnglish(currentItem.text, rate);
    setSpeechSupported(ok);
    updateAnswer(currentItem.id, { listenCount: (currentAnswer?.listenCount ?? 0) + 1 });
  };

  const checkCurrent = () => {
    if (!currentItem || !currentAnswer?.selected) return;
    const isCorrect = currentAnswer.selected === currentItem.answer;
    const hearts = isCorrect ? undefined : loseHeart('listening-wrong');
    onWhaleMoodChange?.(isCorrect ? 'correct' : 'mistake');
    updateAnswer(currentItem.id, {
      checked: true,
      isCorrect,
      transcriptVisible: true,
      heartLossText: hearts ? `Bạn mất 1 bọt biển. Còn ${hearts.heartsLeft}/${hearts.maxHearts} bọt biển.` : undefined,
    });
  };

  const goNext = () => {
    if (currentIndex >= items.length - 1) {
      onWhaleMoodChange?.('celebrate');
      setShowSummary(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
  };

  const resetCurrent = () => {
    if (!currentItem) return;
    onWhaleMoodChange?.('encourage');
    updateAnswer(currentItem.id, {
      selected: null,
      checked: false,
      isCorrect: false,
      transcriptVisible: false,
      listenCount: 0,
    });
  };

  const restartWith = (nextItems: ListeningPracticeItem[]) => {
    const safeItems = nextItems.length > 0 ? nextItems : allItems;
    setItems(safeItems);
    setAnswers(makeInitialAnswers(safeItems));
    setCurrentIndex(0);
    setStarted(true);
    setShowSummary(false);
    setSavedSummary(false);
  };

  const playDialogue = (dialogue: MiniDialogue) => {
    const joined = dialogue.lines.map((line) => line.text).join('. ... ');
    const ok = speakEnglish(joined, 0.86);
    setSpeechSupported(ok);
    setListenedDialogueIds((prev) => (prev.includes(dialogue.id) ? prev : [...prev, dialogue.id]));
  };

  const playLine = (text: string) => {
    const ok = speakEnglish(text, 0.86);
    setSpeechSupported(ok);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!started || showSummary || !currentItem || isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const optionIndex = /^[1-4]$/.test(key) ? Number(key) - 1 : ['a', 'b', 'c', 'd'].indexOf(key);
      const option = optionIndex >= 0 ? currentItem.options[optionIndex] : undefined;
      if (option && !currentAnswer?.checked) {
        event.preventDefault();
        updateAnswer(currentItem.id, { selected: option });
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (currentAnswer?.checked) {
          goNext();
        } else {
          checkCurrent();
        }
        return;
      }

      if (key === 'r') {
        event.preventDefault();
        resetCurrent();
        return;
      }

      if (key === 'n') {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        playItem(0.85);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentAnswer, currentItem, showSummary, started]);

  if (allItems.length === 0) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color={COLORS.text}>Bài học này chưa có dữ liệu luyện nghe.</Text>
          <Text mt="2" color={COLORS.muted}>Hãy quay lại bài học hoặc chọn chế độ khác.</Text>
          <HStack mt="6" wrap="wrap">
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }}>
              Quay về bài học
            </Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=flashcard`} borderRadius="full" variant="outline">
              Luyện flashcard
            </Button>
          </HStack>
        </Box>
      </Box>
    );
  }

  if (!started) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
        <Box maxW="980px" mx="auto">
          <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
            <HStack wrap="wrap" gap="2" mb="4">
              <Badge borderRadius="full" colorScheme="blue" px="3" py="1">Listening</Badge>
              <Badge borderRadius="full" bg="#DCFCE7" color="#166534" px="3" py="1">{lesson.level}</Badge>
            </HStack>
            <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="950" color={COLORS.text}>Luyện nghe</Text>
            <Text mt="2" fontSize="xl" fontWeight="800" color={COLORS.text}>{lesson.titleVi}</Text>
            <Text mt="1" color={COLORS.muted}>{lesson.titleEn}</Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4" mt="7">
              <Metric label="Listening items" value={allItems.length} />
              <Metric label="Hội thoại" value={lesson.miniDialogues.length} />
              <Metric label="Audio" value="speechSynthesis" />
            </SimpleGrid>

            <Box mt="7" border="1px solid" borderColor="#BFDBFE" bg="#EFF6FF" borderRadius="2xl" p="5">
              <Text color={COLORS.text} fontWeight="800">Bạn sẽ nghe câu tiếng Anh, chọn đáp án, rồi xem transcript sau khi trả lời.</Text>
              <Text mt="2" color={COLORS.muted}>Nghe ý chính trước, sau đó nghe lại từng cụm. Đừng nhìn transcript quá sớm.</Text>
            {!speechSupported ? (
              <Text mt="3" color={COLORS.amber} fontSize="sm" fontWeight="700">Trình duyệt này chưa hỗ trợ nghe mẫu.</Text>
            ) : null}
            <Text mt="3" color={COLORS.muted} fontSize={{ base: 'xs', md: 'sm' }}>Phím tắt: Space nghe lại, A-D/1-4 chọn, Enter kiểm tra/tiếp, R làm lại, N câu tiếp.</Text>
            </Box>

            <Flex mt="8" gap="3" wrap="wrap">
              <Button leftIcon={<Icon as={Play} />} borderRadius="full" bg={COLORS.primary} color="white" size="lg" _hover={{ bg: '#1D4ED8' }} onClick={() => setStarted(true)}>
                Bắt đầu luyện nghe
              </Button>
              <Button as={Link} to={`/lessons/${lesson.id}`} leftIcon={<Icon as={ArrowLeft} />} borderRadius="full" variant="outline" size="lg">
                Quay về bài học
              </Button>
            </Flex>
          </Box>
        </Box>
      </Box>
    );
  }

  if (showSummary) {
    return (
      <ListeningSummary
        lesson={lesson}
        items={items}
        answers={answers}
        listenedDialogueCount={listenedDialogueIds.length}
        onRestartWrong={() => restartWith(wrongItems)}
        onRestartAll={() => restartWith(allItems)}
      />
    );
  }

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} pb="12">
      <Box maxW="980px" mx="auto">
        <VStack align="stretch" gap="5">
          <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '7' }}>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4">
              <Box>
                <HStack wrap="wrap" gap="2" mb="2">
                  <Badge borderRadius="full" colorScheme="blue" px="3" py="1">Luyện nghe</Badge>
                  <Badge borderRadius="full" bg="#DCFCE7" color="#166534" px="3" py="1">{currentIndex + 1}/{items.length}</Badge>
                </HStack>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{lesson.titleVi}</Text>
                <Text color={COLORS.muted}>{lesson.titleEn}</Text>
              </Box>
              <VStack align={{ base: 'start', md: 'end' }} gap="1">
                <Text fontSize="sm" color={COLORS.muted}>Đúng</Text>
                <Text fontSize="2xl" fontWeight="950" color={COLORS.green}>{correctIds.length}/{checkedCount}</Text>
              </VStack>
            </Flex>
            <Progress mt="5" value={progressValue} colorScheme="blue" borderRadius="full" bg="#E2E8F0" />
            <Text mt="4" color={COLORS.muted}>Nghe ý chính trước, sau đó nghe lại từng cụm. Đừng nhìn transcript quá sớm.</Text>
            {!speechSupported ? (
              <Text mt="3" color={COLORS.amber} fontSize="sm" fontWeight="700">Trình duyệt này chưa hỗ trợ nghe mẫu.</Text>
            ) : null}
          </Box>

          {currentItem && currentAnswer ? (
            <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '8' }}>
              <HStack wrap="wrap" gap="2" mb="4">
                <Badge borderRadius="full" px="3" py="1" bg="#EFF6FF" color={COLORS.primary}>Câu {currentIndex + 1}</Badge>
                <Badge borderRadius="full" px="3" py="1" bg="#FEF3C7" color="#92400E">Đã nghe {currentAnswer.listenCount} lần</Badge>
              </HStack>

              <HStack wrap="wrap" gap="3">
                <Button leftIcon={<Icon as={Headphones} />} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} onClick={() => playItem(0.9)}>
                  Nghe lần 1
                </Button>
                <Button leftIcon={<Icon as={Volume2} />} borderRadius="full" variant="outline" onClick={() => playItem(0.72)}>
                  Nghe chậm
                </Button>
                <Button leftIcon={<Icon as={RotateCcw} />} borderRadius="full" variant="outline" onClick={() => playItem(0.85)}>
                  Nghe lại
                </Button>
              </HStack>

              <Text mt="6" fontSize="xl" fontWeight="900" color={COLORS.text}>{currentItem.question}</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" mt="5">
                {currentItem.options.map((option, index) => {
                  const selected = currentAnswer.selected === option;
                  const isCorrectOption = currentAnswer.checked && option === currentItem.answer;
                  const isWrongSelected = currentAnswer.checked && selected && option !== currentItem.answer;
                  return (
                    <Button
                      key={option}
                      justifyContent="flex-start"
                      minH="56px"
                      whiteSpace="normal"
                      textAlign="left"
                      borderRadius="2xl"
                      variant="outline"
                      borderColor={isCorrectOption ? COLORS.green : isWrongSelected ? '#FDBA74' : selected ? COLORS.primary : COLORS.border}
                      bg={isCorrectOption ? '#F0FDF4' : isWrongSelected ? '#FFF7ED' : selected ? '#EFF6FF' : 'white'}
                      color={COLORS.text}
                      isDisabled={currentAnswer.checked}
                      aria-pressed={selected}
                      onClick={() => updateAnswer(currentItem.id, { selected: option })}
                    >
                      {String.fromCharCode(65 + index)}/{index + 1}. {option}
                    </Button>
                  );
                })}
              </SimpleGrid>

              <Flex mt="6" gap="3" wrap="wrap">
                {!currentAnswer.checked ? (
                  <Button borderRadius="full" bg={COLORS.green} color="white" _hover={{ bg: '#16A34A' }} isDisabled={!currentAnswer.selected} onClick={checkCurrent}>
                    Kiểm tra
                  </Button>
                ) : (
                  <>
                    <Button borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} onClick={goNext}>
                      Câu tiếp theo
                    </Button>
                    <Button borderRadius="full" variant="outline" onClick={() => playItem(0.85)}>
                      Nghe lại
                    </Button>
                    <Button borderRadius="full" variant="outline" onClick={resetCurrent}>
                      Làm lại câu này
                    </Button>
                  </>
                )}
                {(currentAnswer.listenCount > 0 || currentAnswer.checked) ? (
                  <Button borderRadius="full" variant="ghost" aria-expanded={currentAnswer.transcriptVisible} onClick={() => updateAnswer(currentItem.id, { transcriptVisible: !currentAnswer.transcriptVisible })}>
                    {currentAnswer.transcriptVisible ? 'Ẩn transcript' : 'Hiện transcript'}
                  </Button>
                ) : null}
              </Flex>

              {currentAnswer.checked ? (
                <Box mt="6" border="1px solid" borderColor={currentAnswer.isCorrect ? '#BBF7D0' : '#FED7AA'} bg={currentAnswer.isCorrect ? '#F0FDF4' : '#FFF7ED'} borderRadius="2xl" p="5" role="status" aria-live="polite">
                  <HStack align="start" gap="3">
                    <Icon as={currentAnswer.isCorrect ? CheckCircle2 : XCircle} color={currentAnswer.isCorrect ? COLORS.green : '#EA580C'} />
                    <Box>
                      <Text fontWeight="900" color={COLORS.text}>{currentAnswer.isCorrect ? 'Nghe tốt!' : 'Chưa đúng, nghe lại chậm hơn nhé.'}</Text>
                      <Text mt="2" color={COLORS.muted}>Đáp án đúng: <Text as="span" fontWeight="900" color={COLORS.text}>{currentItem.answer}</Text></Text>
                      {!currentAnswer.isCorrect ? <Text mt="2" color="#9A3412" fontWeight="800">{currentAnswer.heartLossText ?? 'Bạn mất 1 bọt biển.'} Cá voi vẫn bơi cùng bạn — thử lại nhịp tiếp theo nhé.</Text> : null}
                      {currentItem.explanationVi ? (
                        <Text mt="2" color={COLORS.text} fontSize="sm" fontWeight="800">{currentItem.explanationVi}</Text>
                      ) : null}
                      <Text mt="2" color={COLORS.muted} fontSize="sm">Đọc transcript một lần, sau đó bấm Nghe lại và nhắc theo.</Text>
                    </Box>
                  </HStack>
                </Box>
              ) : null}

              <Collapse in={currentAnswer.transcriptVisible} animateOpacity>
                <Box mt="5" border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="5">
                  <Text fontSize="sm" fontWeight="800" color={COLORS.muted} textTransform="uppercase" letterSpacing="wide">Transcript</Text>
                  <Text mt="2" fontSize="lg" fontWeight="800" color={COLORS.text}>{currentItem.text}</Text>
                </Box>
              </Collapse>
            </Box>
          ) : null}

          {currentIndex === items.length - 1 && currentAnswer?.checked ? (
            <DialogueSection dialogues={lesson.miniDialogues} onPlayDialogue={playDialogue} onPlayLine={playLine} listenedDialogueIds={listenedDialogueIds} />
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}

function DialogueSection({
  dialogues,
  listenedDialogueIds,
  onPlayDialogue,
  onPlayLine,
}: {
  dialogues: MiniDialogue[];
  listenedDialogueIds: string[];
  onPlayDialogue: (dialogue: MiniDialogue) => void;
  onPlayLine: (text: string) => void;
}) {
  const [openTranslations, setOpenTranslations] = useState<Record<string, boolean>>({});

  if (dialogues.length === 0) return null;

  return (
    <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '8' }}>
      <Text fontSize="2xl" fontWeight="950" color={COLORS.text}>Hội thoại luyện nghe</Text>
      <Text mt="2" color={COLORS.muted}>Nghe toàn bộ hội thoại, rồi shadowing từng câu theo vai A/B.</Text>
      <VStack align="stretch" gap="4" mt="5">
        {dialogues.map((dialogue) => (
          <Box key={dialogue.id} border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="5" bg="#FFFFFF">
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="3">
              <Box>
                <HStack wrap="wrap" gap="2">
                  <Text fontSize="lg" fontWeight="900" color={COLORS.text}>{dialogue.title}</Text>
                  {listenedDialogueIds.includes(dialogue.id) ? <Badge colorScheme="green" borderRadius="full">Đã nghe</Badge> : null}
                </HStack>
                <Text mt="1" color={COLORS.muted} fontSize="sm">{dialogue.suggestedShadowingInstruction}</Text>
              </Box>
              <Button leftIcon={<Icon as={Headphones} />} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} onClick={() => onPlayDialogue(dialogue)}>
                Nghe toàn bộ hội thoại
              </Button>
            </Flex>

            <VStack align="stretch" gap="2" mt="4">
              {dialogue.lines.map((line, index) => (
                <Flex key={`${dialogue.id}-${index}`} justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="2" bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="xl" p="3">
                  <Text color={COLORS.text} fontWeight="700"><Text as="span" color={COLORS.primary}>{line.speaker}:</Text> {line.text}</Text>
                  <Button size="sm" borderRadius="full" variant="outline" onClick={() => onPlayLine(line.text)}>Nghe</Button>
                </Flex>
              ))}
            </VStack>

            <HStack mt="4" wrap="wrap">
              {dialogue.focusPhrases.map((phrase) => (
                <Badge key={phrase} borderRadius="full" bg="#DCFCE7" color="#166534" px="3" py="1">{phrase}</Badge>
              ))}
            </HStack>

            <Button mt="4" size="sm" borderRadius="full" variant="ghost" aria-expanded={Boolean(openTranslations[dialogue.id])} onClick={() => setOpenTranslations((prev) => ({ ...prev, [dialogue.id]: !prev[dialogue.id] }))}>
              {openTranslations[dialogue.id] ? 'Ẩn bản dịch' : 'Hiện bản dịch tiếng Việt'}
            </Button>
            <Collapse in={Boolean(openTranslations[dialogue.id])} animateOpacity>
              <Box mt="3" bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="xl" p="4">
                <VStack align="stretch" gap="1">
                  {dialogue.vietnameseTranslation.map((line) => (
                    <Text key={line} color={COLORS.muted}>{line}</Text>
                  ))}
                </VStack>
              </Box>
            </Collapse>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

function ListeningSummary({
  lesson,
  items,
  answers,
  listenedDialogueCount,
  onRestartWrong,
  onRestartAll,
}: {
  lesson: EnglishLesson;
  items: ListeningPracticeItem[];
  answers: Record<string, AnswerState>;
  listenedDialogueCount: number;
  onRestartWrong: () => void;
  onRestartAll: () => void;
}) {
  const correctItems = items.filter((item) => answers[item.id]?.isCorrect);
  const wrongItems = items.filter((item) => !answers[item.id]?.isCorrect);
  const percentage = items.length === 0 ? 0 : Math.round((correctItems.length / items.length) * 100);
  const feedback = getPracticeSessionFeedback({
    lesson,
    mode: 'listen',
    total: items.length,
    correct: correctItems.length,
    wrong: wrongItems.length,
    percentage,
    weakItemIds: wrongItems.map((item) => item.id),
    nextMode: wrongItems.length > 0 ? 'listen' : 'reflex',
  });

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
      <Box maxW="980px" mx="auto">
        <Box bg={COLORS.card} border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
          <Badge borderRadius="full" colorScheme="green" px="3" py="1">Hoàn thành luyện nghe</Badge>
          <Text mt="4" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="950" color={COLORS.text}>Tổng kết Listening</Text>
          <Text mt="2" color={COLORS.muted}>{summaryMessage(percentage)}</Text>

          <SimpleGrid columns={{ base: 1, md: 5 }} gap="4" mt="6">
            <Metric label="Tổng câu" value={items.length} />
            <Metric label="Đúng" value={correctItems.length} tone="green" />
            <Metric label="Sai" value={wrongItems.length} tone="red" />
            <Metric label="Tỷ lệ" value={`${percentage}%`} />
            <Metric label="Hội thoại đã nghe" value={listenedDialogueCount} />
          </SimpleGrid>

          <PracticeSessionFeedbackCard feedback={feedback} />

          <Box mt="7">
            <Text fontSize="lg" fontWeight="900" color={COLORS.text}>Câu cần nghe lại</Text>
            {wrongItems.length === 0 ? (
              <Box mt="3" border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4">
                <Text color={COLORS.text} fontWeight="800">Không có câu sai. Bạn có thể chuyển sang luyện phản xạ.</Text>
              </Box>
            ) : (
              <VStack align="stretch" gap="3" mt="3">
                {wrongItems.map((item) => (
                  <Box key={item.id} border="1px solid" borderColor="#FED7AA" bg="#FFF7ED" borderRadius="2xl" p="4">
                    <Text fontWeight="900" color={COLORS.text}>{item.question}</Text>
                    <Text mt="2" color={COLORS.muted}>Đáp án đúng: <Text as="span" fontWeight="900" color={COLORS.text}>{item.answer}</Text></Text>
                    {item.explanationVi ? <Text mt="1" color={COLORS.text} fontWeight="800">{item.explanationVi}</Text> : null}
                    <Text mt="1" color={COLORS.muted}>Transcript: <Text as="span" fontWeight="800" color={COLORS.text}>{item.text}</Text></Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          <Flex mt="7" gap="3" wrap="wrap">
            <Button leftIcon={<Icon as={Headphones} />} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: '#1D4ED8' }} isDisabled={wrongItems.length === 0} onClick={onRestartWrong}>
              Nghe lại câu sai
            </Button>
            <Button leftIcon={<Icon as={RotateCcw} />} borderRadius="full" variant="outline" onClick={onRestartAll}>
              Làm lại toàn bộ
            </Button>
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=reflex`} borderRadius="full" bg={COLORS.green} color="white" _hover={{ bg: '#16A34A' }}>
              Luyện phản xạ
            </Button>
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" variant="outline">
              Quay về bài học
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'red' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'red' ? '#9A3412' : COLORS.text;
  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="4">
      <Text fontSize="2xl" fontWeight="950" color={color}>{value}</Text>
      <Text mt="1" fontSize="sm" color={COLORS.muted}>{label}</Text>
    </Box>
  );
}
