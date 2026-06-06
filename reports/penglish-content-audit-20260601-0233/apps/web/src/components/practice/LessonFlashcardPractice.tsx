import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, HStack, Icon, Input, Progress, SimpleGrid, Tag, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, CheckCircle2, RotateCcw, Volume2, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import type { EnglishLesson, FlashcardItem } from '../../lib/p-english/lesson-content-data';
import { loseHeart, type LearningHeartsState } from '../../lib/p-english/learning-hearts';
import { getDueReviewItems, markItemReviewed } from '../../lib/p-english/lesson-progress';
import { recordPracticeSessionMemory } from '../../lib/p-english/localSkillMemory';
import { getPracticeSessionFeedback } from '../../lib/p-english/practiceSessionFeedback';
import { PracticeSessionFeedbackCard } from './PracticeSessionFeedbackCard';
import { updateWordAfterCorrectAnswer, updateWordAfterWrongAnswer } from '../../lib/p-english/vocabulary-review';
import { isWordVisualCategory, type WordVisualCategory } from '../../lib/p-english/word-visual-map';
import { AnimatedWordScene } from '../learning-characters/AnimatedWordScene';
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

type LessonProgress = {
  lessonId: string;
  flashcard?: {
    reviewedCardIds?: string[];
    rememberedCardIds?: string[];
    needsReviewCardIds?: string[];
    lastReviewedAt?: string;
    completedSessions?: number;
  };
  [key: string]: unknown;
};

export function speakEnglish(text: string) {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  if (!synth || !text.trim()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  synth.cancel();
  synth.speak(utterance);
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

function normalizeVietnameseAnswer(input: string): string {
  return input
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .toLowerCase()
    .trim()
    .replace(/\.\.\.$/g, '')
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeVietnameseDiacritics(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function meaningCandidates(expected: string): string[] {
  const normalized = normalizeVietnameseAnswer(expected);
  const parts = normalized
    .split(/[\/,;]/g)
    .map((part) => normalizeVietnameseAnswer(part))
    .filter((part) => part.length >= 2);
  return unique([normalized, ...parts]);
}

function isVietnameseMeaningCorrect(input: string, expected: string): boolean {
  const answer = normalizeVietnameseAnswer(input);
  if (!answer) return false;
  const answerNoTone = removeVietnameseDiacritics(answer);
  return meaningCandidates(expected).some((candidate) => {
    if (!candidate) return false;
    return answer === candidate || answerNoTone === removeVietnameseDiacritics(candidate);
  });
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

function vocabularyWordIdFromFlashcard(cardId: string) {
  return cardId.startsWith('flashcard-') ? cardId.slice('flashcard-'.length) : cardId;
}

function inferFlashcardVisualCategory(card: FlashcardItem, lesson: EnglishLesson): WordVisualCategory {
  const vocabularyId = vocabularyWordIdFromFlashcard(card.id);
  const vocabularyItem = lesson.vocabulary.find((item) => item.id === vocabularyId || item.term.toLowerCase() === card.front.toLowerCase());
  const candidates = [vocabularyItem?.partOfSpeechOrType, ...(vocabularyItem?.tags ?? []), ...card.tags, card.front]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (candidates.some((value) => value.includes('family') || value.includes('mother') || value.includes('father') || value.includes('brother') || value.includes('sister') || value.includes('parent'))) return 'family';
  if (candidates.some((value) => value.includes('morning') || value.includes('afternoon') || value.includes('evening') || value.includes('time'))) return 'time';
  if (candidates.some((value) => value.includes('greeting') || value.includes('farewell') || value.includes('hello') || value.includes('hi') || value.includes('goodbye'))) return 'greeting';
  if (candidates.some((value) => value.includes('polite') || value.includes('social') || value.includes('thank') || value.includes('meet'))) return 'politeness';
  if (candidates.some((value) => value.includes('school') || value.includes('student') || value.includes('teacher'))) return 'school';
  if (candidates.some((value) => value.includes('classroom') || value.includes('item'))) return 'classroom';
  if (candidates.some((value) => value.includes('place') || value.includes('country'))) return 'place';
  if (candidates.some((value) => value.includes('question'))) return 'action';

  const directCategory = candidates.find((value) => isWordVisualCategory(value));
  return directCategory && isWordVisualCategory(directCategory) ? directCategory : 'default';
}

function flashcardSceneHint(card: FlashcardItem, lesson: EnglishLesson) {
  const vocabularyId = vocabularyWordIdFromFlashcard(card.id);
  const vocabularyItem = lesson.vocabulary.find((item) => item.id === vocabularyId || item.term.toLowerCase() === card.front.toLowerCase());
  return vocabularyItem?.exampleMeaningVi || card.exampleMeaningVi || 'Nhìn cảnh trước, đoán nghĩa, rồi đọc lại từ.';
}

function flashcardPronunciationHint(card: FlashcardItem, lesson: EnglishLesson) {
  const vocabularyId = vocabularyWordIdFromFlashcard(card.id);
  const vocabularyItem = lesson.vocabulary.find((item) => item.id === vocabularyId || item.term.toLowerCase() === card.front.toLowerCase());
  return vocabularyItem?.pronunciation ? `Phát âm: ${vocabularyItem.pronunciation}` : 'Nghe mẫu, đọc chậm, rồi nói lại rõ ràng.';
}

function progressKey(lessonId: string) {
  return `p-english:lesson-progress:${lessonId}`;
}

function safeReadProgress(lessonId: string): LessonProgress {
  if (typeof window === 'undefined') return { lessonId };
  try {
    const raw = window.localStorage.getItem(progressKey(lessonId));
    if (!raw) return { lessonId };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { lessonId };
    return { ...(parsed as LessonProgress), lessonId };
  } catch {
    return { lessonId };
  }
}

function safeWriteProgress(lessonId: string, updater: (current: LessonProgress) => LessonProgress) {
  if (typeof window === 'undefined') return;
  try {
    const current = safeReadProgress(lessonId);
    const next = updater(current);
    window.localStorage.setItem(progressKey(lessonId), JSON.stringify(next));
  } catch {
    // localStorage may be unavailable; practice still works in memory.
  }
}

export function LessonFlashcardPractice({ lesson, onWhaleMoodChange }: { lesson: EnglishLesson; onWhaleMoodChange?: (mood: WhaleMood) => void }) {
  const [searchParams] = useSearchParams();
  const allCards = lesson.flashcards;
  const isDueReview = searchParams.get('review') === 'due';
  const dueFlashcardItems = useMemo(
    () => getDueReviewItems(lesson.id, lesson).filter((item) => item.type === 'flashcard'),
    [lesson],
  );
  const dueFlashcards = useMemo(
    () => allCards.filter((card) => dueFlashcardItems.some((item) => item.itemId === card.id)),
    [allCards, dueFlashcardItems],
  );
  const activeCards = isDueReview ? dueFlashcards : allCards;
  const [deck, setDeck] = useState<FlashcardItem[]>(activeCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rememberedCardIds, setRememberedCardIds] = useState<string[]>([]);
  const [needsReviewCardIds, setNeedsReviewCardIds] = useState<string[]>([]);
  const [reviewedCardIds, setReviewedCardIds] = useState<string[]>([]);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [meaningInput, setMeaningInput] = useState('');
  const [meaningVerified, setMeaningVerified] = useState(false);
  const [meaningFeedback, setMeaningFeedback] = useState<{ tone: 'green' | 'red'; text: string; hearts?: LearningHeartsState } | null>(null);
 
  useEffect(() => {
    const stored = safeReadProgress(lesson.id).flashcard;
    setCompletedSessions(stored?.completedSessions ?? 0);
  }, [lesson.id]);

  useEffect(() => {
    restartWithDeck(activeCards);
  }, [activeCards]);

  const currentCard = deck[currentIndex];
  const total = deck.length;
  const progressValue = total > 0 ? ((showSummary ? total : currentIndex + 1) / total) * 100 : 0;
  const needsReviewCards = useMemo(
    () => allCards.filter((card) => needsReviewCardIds.includes(card.id)),
    [allCards, needsReviewCardIds],
  );
  const rememberedPercent = allCards.length > 0 ? Math.round((rememberedCardIds.length / allCards.length) * 100) : 0;

  const persistSession = (next: {
    reviewed: string[];
    remembered: string[];
    needsReview: string[];
    incrementSession?: boolean;
  }) => {
    safeWriteProgress(lesson.id, (current) => ({
      ...current,
      lessonId: lesson.id,
      flashcard: {
        ...(current.flashcard ?? {}),
        reviewedCardIds: unique([...(current.flashcard?.reviewedCardIds ?? []), ...next.reviewed]),
        rememberedCardIds: unique([...(current.flashcard?.rememberedCardIds ?? []), ...next.remembered]),
        needsReviewCardIds: unique(next.needsReview),
        lastReviewedAt: new Date().toISOString(),
        completedSessions: (current.flashcard?.completedSessions ?? 0) + (next.incrementSession ? 1 : 0),
      },
    }));

    if (next.incrementSession) setCompletedSessions((value) => value + 1);
  };

  const finishDeck = (nextReviewed: string[], nextRemembered: string[], nextNeedsReview: string[]) => {
    onWhaleMoodChange?.('celebrate');
    setShowSummary(true);
    persistSession({ reviewed: nextReviewed, remembered: nextRemembered, needsReview: nextNeedsReview, incrementSession: true });
    recordPracticeSessionMemory({
      lessonId: lesson.id,
      lessonTitleVi: lesson.titleVi,
      mode: 'flashcard',
      total: nextReviewed.length,
      correct: nextRemembered.length,
      wrong: nextNeedsReview.length,
      percentage: nextReviewed.length > 0 ? Math.round((nextRemembered.length / nextReviewed.length) * 100) : 0,
      weakItemIds: nextNeedsReview,
    });
  };

  const resetMeaningGate = () => {
    setMeaningInput('');
    setMeaningVerified(false);
    setMeaningFeedback(null);
  };

  const guardedFlip = () => {
    if (!meaningVerified) return;
    setIsFlipped((value) => !value);
  };

  const checkMeaning = () => {
    if (!currentCard || meaningVerified) return;
    if (isVietnameseMeaningCorrect(meaningInput, currentCard.back)) {
      onWhaleMoodChange?.('correct');
      setMeaningVerified(true);
      setMeaningFeedback({ tone: 'green', text: 'Đúng nghĩa rồi, bạn có thể lật thẻ.' });
      return;
    }
    onWhaleMoodChange?.('mistake');
    updateWordAfterWrongAnswer(vocabularyWordIdFromFlashcard(currentCard.id));
    const hearts = loseHeart('flashcard-meaning');
    setMeaningFeedback({ tone: 'red', text: 'Chưa đúng. Bạn mất 1 bọt biển. Cá voi vẫn bơi cùng bạn — thử lại nhịp tiếp theo nhé.', hearts });
    setIsFlipped(false);
  };

  const goNextAfterAnswer = (nextReviewed: string[], nextRemembered: string[], nextNeedsReview: string[]) => {
    if (currentIndex >= deck.length - 1) {
      finishDeck(nextReviewed, nextRemembered, nextNeedsReview);
      return;
    }
    setCurrentIndex((value) => value + 1);
    setIsFlipped(false);
    resetMeaningGate();
    persistSession({ reviewed: nextReviewed, remembered: nextRemembered, needsReview: nextNeedsReview });
  };

  const markRemembered = () => {
    if (!currentCard) return;
    onWhaleMoodChange?.('correct');
    markItemReviewed(lesson.id, currentCard.id, 'flashcard', 'correct');
    updateWordAfterCorrectAnswer(vocabularyWordIdFromFlashcard(currentCard.id));
    const nextReviewed = unique([...reviewedCardIds, currentCard.id]);
    const nextRemembered = unique([...rememberedCardIds, currentCard.id]);
    const nextNeedsReview = needsReviewCardIds.filter((id) => id !== currentCard.id);
    setReviewedCardIds(nextReviewed);
    setRememberedCardIds(nextRemembered);
    setNeedsReviewCardIds(nextNeedsReview);
    goNextAfterAnswer(nextReviewed, nextRemembered, nextNeedsReview);
  };

  const markNeedsReview = () => {
    if (!currentCard) return;
    onWhaleMoodChange?.('mistake');
    markItemReviewed(lesson.id, currentCard.id, 'flashcard', 'wrong');
    updateWordAfterWrongAnswer(vocabularyWordIdFromFlashcard(currentCard.id));
    const nextReviewed = unique([...reviewedCardIds, currentCard.id]);
    const nextNeedsReview = unique([...needsReviewCardIds, currentCard.id]);
    setReviewedCardIds(nextReviewed);
    setNeedsReviewCardIds(nextNeedsReview);
    goNextAfterAnswer(nextReviewed, rememberedCardIds, nextNeedsReview);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || showSummary || !currentCard) return;
      if (event.code === 'Space') {
        event.preventDefault();
        if (meaningVerified) setIsFlipped((value) => !value);
        return;
      }
      if (!isFlipped) return;
      const key = event.key.toLowerCase();
      if (key === '1' || key === 'r') {
        event.preventDefault();
        markNeedsReview();
      }
      if (key === '2' || key === 'enter') {
        event.preventDefault();
        markRemembered();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSummary, meaningVerified, isFlipped, currentCard, markNeedsReview, markRemembered]);

  const restartWithDeck = (nextDeck: FlashcardItem[]) => {
    setDeck(nextDeck);
    setCurrentIndex(0);
    setIsFlipped(false);
    setRememberedCardIds([]);
    setNeedsReviewCardIds([]);
    setReviewedCardIds([]);
    setShowSummary(false);
    resetMeaningGate();
  };

  const speakCurrent = () => {
    if (!currentCard) return;
    speakEnglish(isFlipped && currentCard.example ? currentCard.example : currentCard.front);
  };

  if (allCards.length === 0) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color={COLORS.text}>Bài học này chưa có flashcard từ vựng</Text>
          <Text mt="2" color={COLORS.muted}>Bạn có thể quay lại bài học hoặc mở hub từ vựng để chọn nhóm khác.</Text>
          <Button as={Link} to="/vocabularies" mt="5" borderRadius="full" bg={COLORS.primary} color="white">
            Mở hub từ vựng
          </Button>
        </Box>
      </Box>
    );
  }

  if (isDueReview && dueFlashcards.length === 0) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Tag borderRadius="full" bg="#DBEAFE" color={COLORS.primary}>Ôn tập thông minh</Tag>
          <Text mt="4" fontSize="2xl" fontWeight="900" color={COLORS.text}>Hiện chưa có thẻ đến hạn ôn.</Text>
          <Text mt="2" color={COLORS.muted}>Các thẻ đã nhớ sẽ quay lại đúng lịch. Bạn vẫn có thể luyện toàn bộ flashcard bất cứ lúc nào.</Text>
          <HStack mt="6" wrap="wrap">
            <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=flashcard`} borderRadius="full" bg={COLORS.primary} color="white">
              Luyện toàn bộ flashcard
            </Button>
            <Button as={Link} to="/vocabularies" borderRadius="full" variant="outline">
              Về hub từ vựng
            </Button>
          </HStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} pb="12">
      <Box maxW="980px" mx="auto">
        <VStack align="stretch" gap="5">
          <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '7' }}>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4">
              <Box>
                <HStack wrap="wrap" gap="2" mb="2">
                  <Tag borderRadius="full" bg="#DBEAFE" color={COLORS.primary}>{isDueReview ? 'Flashcard từ vựng đến hạn' : 'Flashcard từ vựng'}</Tag>
                  <Tag borderRadius="full" bg="#FEF3C7" color="#B45309">{allCards.length} thẻ</Tag>
                  <Tag borderRadius="full" bg="#DCFCE7" color="#15803D">{showSummary ? total : currentIndex + 1} / {total}</Tag>
                </HStack>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{lesson.titleVi}</Text>
                <Text color={COLORS.primary} fontWeight="700">{lesson.titleEn}</Text>
              </Box>
              <Button as={Link} to="/vocabularies" leftIcon={<Icon as={ArrowLeft} />} variant="outline" borderRadius="full">
                Về hub từ vựng
              </Button>
            </Flex>
            <Progress mt="5" value={progressValue} colorScheme="blue" borderRadius="full" bg="#E2E8F0" />
            <Text mt="3" color={COLORS.muted} fontSize="sm">
              {isDueReview ? 'Bạn đang ôn các thẻ từ vựng đã đến hạn theo SRS local.' : 'Đây là lượt học từ vựng: đoán nghĩa tiếng Việt, nghe mẫu, rồi đọc to ví dụ.'}
            </Text>
          </Box>

          {showSummary ? (
            <Summary
              total={deck.length}
              rememberedCount={rememberedCardIds.length}
              needsReviewCards={needsReviewCards}
              rememberedPercent={rememberedPercent}
              completedSessions={completedSessions}
              onReviewNeeds={() => restartWithDeck(needsReviewCards)}
              onRestartAll={() => restartWithDeck(allCards)}
              lesson={lesson}
            />
          ) : currentCard ? (
            <>
              <Box
                role="button"
                tabIndex={0}
                bg={COLORS.card}
                border="1px solid"
                borderColor={COLORS.border}
                borderRadius="3xl"
                minH={{ base: '340px', md: '420px' }}
                p={{ base: '6', md: '10' }}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                cursor="pointer"
                boxShadow="0 18px 45px rgba(15, 23, 42, 0.08)"
                onClick={guardedFlip}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') guardedFlip();
                }}
              >
                {!isFlipped ? (
                  <VStack gap="5" w="100%">
                    <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.primary}>Nhìn cảnh, thử nhớ nghĩa trước</Tag>
                    <Box w="100%" maxW="820px" onClick={(event) => event.stopPropagation()}>
                      <AnimatedWordScene
                        wordOrPhrase={currentCard.front}
                        meaningVi={meaningVerified ? currentCard.back : 'Nhập nghĩa tiếng Việt để mở khóa'}
                        example={currentCard.example}
                        visualCategory={inferFlashcardVisualCategory(currentCard, lesson)}
                        animatedSceneHint={flashcardSceneHint(currentCard, lesson)}
                        pronunciationHintVi={flashcardPronunciationHint(currentCard, lesson)}
                        size="large"
                        mood={meaningVerified ? 'cheering' : 'thinking'}
                        showSpeechBubble={meaningVerified}
                      />
                    </Box>
                    <Text color={COLORS.muted}>{meaningVerified ? 'Bạn đã nhập đúng nghĩa. Bấm thẻ, nhấn Space, hoặc dùng nút “Lật thẻ”.' : 'Nhập đúng nghĩa tiếng Việt bên dưới để mở khóa mặt sau.'}</Text>
                  </VStack>
                ) : (
                  <VStack gap="4" w="100%" maxW="760px">
                    <Tag borderRadius="full" bg="#DCFCE7" color="#15803D">Mặt sau · kiểm tra hiểu nghĩa</Tag>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" w="100%">
                      <Box bg="#F0FDF4" border="1px solid" borderColor="#BBF7D0" borderRadius="2xl" p="5">
                        <Text fontSize="xs" fontWeight="950" color="#15803D" textTransform="uppercase" letterSpacing="0.08em">Nghĩa tiếng Việt</Text>
                        <Text mt="2" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.green} lineHeight="1.15">{currentCard.back}</Text>
                      </Box>
                      <Box bg="#EFF6FF" border="1px solid" borderColor="#BFDBFE" borderRadius="2xl" p="5" textAlign="left">
                        <Text fontSize="xs" fontWeight="950" color={COLORS.primary} textTransform="uppercase" letterSpacing="0.08em">Ví dụ tiếng Anh</Text>
                        {currentCard.example ? <Text mt="2" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="900" color={COLORS.text}>“{currentCard.example}”</Text> : null}
                        {currentCard.exampleMeaningVi ? <Text mt="2" color={COLORS.muted} fontWeight="700">{currentCard.exampleMeaningVi}</Text> : null}
                      </Box>
                    </SimpleGrid>
                    <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4" w="100%">
                      <Text fontWeight="900" color={COLORS.text}>Quyết định lượt ôn</Text>
                      <Text mt="1" color={COLORS.muted} fontSize="sm">
                        Đọc to ví dụ một lần. Nhấn <strong>1</strong>/<strong>R</strong> nếu cần ôn lại, hoặc <strong>2</strong>/<strong>Enter</strong> nếu đã nhớ.
                      </Text>
                    </Box>
                    <HStack wrap="wrap" justify="center">
                      {currentCard.tags.map((tag) => <Tag key={tag} borderRadius="full" bg="#F1F5F9" color={COLORS.muted}>{tag}</Tag>)}
                    </HStack>
                  </VStack>
                )}
              </Box>

              {!isFlipped ? (
                <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="5">
                  <Text fontWeight="900" color={COLORS.text}>Nhập nghĩa tiếng Việt trước khi lật thẻ</Text>
                  <HStack mt="3" gap="3" align="start" flexDirection={{ base: 'column', md: 'row' }}>
                    <Input
                      value={meaningInput}
                      onChange={(event) => {
                        setMeaningInput(event.target.value);
                        setMeaningFeedback(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          checkMeaning();
                        }
                      }}
                      placeholder="Ví dụ: xin chào"
                      borderRadius="xl"
                      borderColor={meaningFeedback?.tone === 'red' ? '#FDBA74' : meaningFeedback?.tone === 'green' ? COLORS.green : COLORS.border}
                      isDisabled={meaningVerified}
                    />
                    <Button onClick={checkMeaning} isDisabled={!meaningInput.trim() || meaningVerified} borderRadius="full" bg={COLORS.green} color="white" flexShrink={0}>
                      Kiểm tra nghĩa
                    </Button>
                  </HStack>
                  {meaningFeedback ? (
                    <Text mt="3" color={meaningFeedback.tone === 'green' ? '#15803D' : '#9A3412'} fontWeight="800">
                      {meaningFeedback.text} {meaningFeedback.hearts ? `Còn ${meaningFeedback.hearts.heartsLeft}/${meaningFeedback.hearts.maxHearts} bọt biển.` : ''}
                    </Text>
                  ) : null}
                </Box>
              ) : null}

              <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
                <HelperNote text="Nếu bấm Chưa nhớ, thẻ sẽ nằm trong danh sách ôn lại." />
                <HelperNote text="Hãy đọc to ví dụ trước khi bấm Đã nhớ." />
                <HelperNote text="Ưu tiên nhớ cả cụm: Nice to meet you, What’s your name, I’m from..." />
              </SimpleGrid>

              <Flex justify="center" gap="3" wrap="wrap">
                <Button leftIcon={<Icon as={Volume2} />} onClick={speakCurrent} borderRadius="full" bg="#EFF6FF" color={COLORS.primary}>
                  Nghe mẫu
                </Button>
                <Button onClick={guardedFlip} isDisabled={!meaningVerified} borderRadius="full" bg={COLORS.primary} color="white">
                  Lật thẻ
                </Button>
                {isFlipped ? (
                  <>
                    <Button leftIcon={<Icon as={XCircle} />} onClick={markNeedsReview} borderRadius="full" bg="#FFF7ED" color="#9A3412" border="1px solid" borderColor="#FED7AA">
                      Cần ôn lại · 1/R
                    </Button>
                    <Button leftIcon={<Icon as={CheckCircle2} />} onClick={markRemembered} borderRadius="full" bg={COLORS.green} color="white">
                      Mình nhớ rồi · 2/Enter
                    </Button>
                  </>
                ) : null}
              </Flex>

              <Flex justify="space-between" align="center" gap="3" wrap="wrap">
                <HStack wrap="wrap">
                  <Button isDisabled={currentIndex === 0} onClick={() => { setCurrentIndex((value) => Math.max(0, value - 1)); setIsFlipped(false); resetMeaningGate(); }} variant="outline" borderRadius="full">
                    Thẻ trước
                  </Button>
                  <Button isDisabled={currentIndex >= deck.length - 1} onClick={() => { setCurrentIndex((value) => Math.min(deck.length - 1, value + 1)); setIsFlipped(false); resetMeaningGate(); }} variant="outline" borderRadius="full">
                    Thẻ tiếp theo
                  </Button>
                </HStack>
                <HStack wrap="wrap">
                  <Button leftIcon={<Icon as={RotateCcw} />} onClick={() => restartWithDeck(activeCards)} variant="outline" borderRadius="full">
                    Làm lại
                  </Button>
                  <Button as={Link} to={`/lessons/${lesson.id}`} variant="outline" borderRadius="full">
                    Quay về bài học
                  </Button>
                </HStack>
              </Flex>
            </>
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}

function HelperNote({ text }: { text: string }) {
  return (
    <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4">
      <Text color={COLORS.muted} fontSize="sm">{text}</Text>
    </Box>
  );
}

function Summary({
  total,
  rememberedCount,
  needsReviewCards,
  rememberedPercent,
  completedSessions,
  onReviewNeeds,
  onRestartAll,
  lesson,
}: {
  total: number;
  rememberedCount: number;
  needsReviewCards: FlashcardItem[];
  rememberedPercent: number;
  completedSessions: number;
  onReviewNeeds: () => void;
  onRestartAll: () => void;
  lesson: EnglishLesson;
}) {
  const feedback = getPracticeSessionFeedback({
    lesson,
    mode: 'flashcard',
    total,
    correct: rememberedCount,
    wrong: needsReviewCards.length,
    percentage: rememberedPercent,
    weakItemIds: needsReviewCards.map((card) => card.id),
    nextMode: needsReviewCards.length > 0 ? 'flashcard' : 'quiz',
  });

  return (
    <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
      <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>Tổng kết lượt học từ vựng</Text>
      <SimpleGrid columns={{ base: 1, md: 4 }} gap="4" mt="5">
        <SummaryMetric label="Tổng thẻ" value={total} />
        <SummaryMetric label="Đã nhớ" value={rememberedCount} />
        <SummaryMetric label="Cần ôn" value={needsReviewCards.length} tone="red" />
        <SummaryMetric label="Tỷ lệ nhớ" value={`${rememberedPercent}%`} tone="green" />
      </SimpleGrid>
      <PracticeSessionFeedbackCard feedback={feedback} />

      <Text mt="4" color={COLORS.muted}>Số lượt đã hoàn thành: {completedSessions}</Text>

      <Box mt="6">
        {needsReviewCards.length === 0 ? (
          <Box bg="#F0FDF4" border="1px solid" borderColor="#BBF7D0" borderRadius="2xl" p="5">
            <Text fontWeight="900" color="#15803D">Bạn đã nhớ toàn bộ thẻ từ vựng trong lượt này.</Text>
          </Box>
        ) : (
          <VStack align="stretch" gap="3">
            <Text fontWeight="900" color={COLORS.text}>Thẻ cần ôn lại</Text>
            {needsReviewCards.map((card) => (
              <Flex key={card.id} justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="2" border="1px solid" borderColor="#FED7AA" bg="#FFF7ED" borderRadius="xl" p="4">
                <Text fontWeight="800" color={COLORS.text}>{card.front}</Text>
                <Text color="#9A3412">{card.back}</Text>
              </Flex>
            ))}
          </VStack>
        )}
      </Box>

      <Flex mt="7" gap="3" wrap="wrap">
        {needsReviewCards.length > 0 ? (
          <Button onClick={onReviewNeeds} borderRadius="full" bg={COLORS.amber} color="white">
            Ôn lại thẻ chưa nhớ
          </Button>
        ) : null}
        <Button onClick={onRestartAll} borderRadius="full" bg={COLORS.primary} color="white">
          Làm lại toàn bộ
        </Button>
        <Button as={Link} to="/vocabularies" borderRadius="full" variant="outline">
          Về hub từ vựng
        </Button>
      </Flex>
    </Box>
  );
}

function SummaryMetric({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'red' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'red' ? '#9A3412' : COLORS.primary;
  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="4">
      <Text fontSize="3xl" fontWeight="950" color={color}>{value}</Text>
      <Text color={COLORS.muted} fontWeight="700">{label}</Text>
    </Box>
  );
}
