import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Volume2, Zap } from 'lucide-react';
import { loseHeart } from '../../lib/p-english/learning-hearts';
import type { EnglishLesson, QuizQuestion, SpeakingReflexPrompt, VocabularyItem } from '../../lib/p-english/lesson-content-data';
import { recordPracticeSessionMemory } from '../../lib/p-english/localSkillMemory';
import { normalizeToken } from '../../lib/p-english/practice-randomization';
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

const GAME_SECONDS = 60;
const MAX_QUESTIONS = 30;
const AUTO_NEXT_MS = 780;

type SpeedSourceLabel = 'Từ vựng' | 'Quiz' | 'Phản xạ';

type SpeedQuestion = {
  id: string;
  type: 'vocab-meaning' | 'vocab-reverse' | 'quiz-multiple-choice' | 'reflex-quick-choice';
  prompt: string;
  options: string[];
  answer: string;
  explanationVi?: string;
  sourceLabel: SpeedSourceLabel;
};

type WrongSpeedAnswer = {
  questionId: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  sourceLabel: SpeedSourceLabel;
};

type SpeedProgress = {
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastCorrect: number;
  lastWrong: number;
  maxStreak: number;
  lastPlayedAt: string;
};

type LessonProgress = Record<string, unknown> & {
  speed?: SpeedProgress;
};

type FeedbackState = {
  selected: string;
  isCorrect: boolean;
  bonus: number;
  heartLossText?: string;
};

function shuffleArray<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function makeOptions(answer: string, distractors: string[], limit = 4) {
  const trimmedAnswer = answer.trim();
  const answerKey = normalizeToken(trimmedAnswer);
  const seen = new Set<string>();
  const options: string[] = [];

  if (trimmedAnswer) {
    seen.add(answerKey);
    options.push(trimmedAnswer);
  }

  distractors.forEach((item) => {
    const trimmed = item.trim();
    const key = normalizeToken(trimmed);
    if (!trimmed || !key || key === answerKey || seen.has(key)) return;
    seen.add(key);
    options.push(trimmed);
  });

  return options.slice(0, limit);
}

function isEnglishText(value: string) {
  return /[a-zA-Z]/.test(value) && !/[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(value);
}

function speakEnglish(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || element.isContentEditable;
}

function safeReadProgress(lessonId: string): LessonProgress {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(`p-english:lesson-progress:${lessonId}`);
    return raw ? (JSON.parse(raw) as LessonProgress) : {};
  } catch {
    return {};
  }
}

function safeWriteProgress(lessonId: string, updater: (current: LessonProgress) => LessonProgress) {
  if (typeof window === 'undefined') return;

  try {
    const current = safeReadProgress(lessonId);
    window.localStorage.setItem(`p-english:lesson-progress:${lessonId}`, JSON.stringify(updater(current)));
  } catch {
    // Speed practice still works in memory if localStorage is unavailable.
  }
}

function vocabularyMeaningQuestion(item: VocabularyItem, vocabulary: VocabularyItem[]): SpeedQuestion {
  return {
    id: `speed-vocab-meaning-${item.id}`,
    type: 'vocab-meaning',
    prompt: item.term,
    options: makeOptions(item.meaningVi, vocabulary.map((entry) => entry.meaningVi)),
    answer: item.meaningVi,
    explanationVi: item.exampleMeaningVi,
    sourceLabel: 'Từ vựng',
  };
}

function vocabularyReverseQuestion(item: VocabularyItem, vocabulary: VocabularyItem[]): SpeedQuestion {
  return {
    id: `speed-vocab-reverse-${item.id}`,
    type: 'vocab-reverse',
    prompt: item.meaningVi,
    options: makeOptions(item.term, vocabulary.map((entry) => entry.term)),
    answer: item.term,
    explanationVi: item.example,
    sourceLabel: 'Từ vựng',
  };
}

function quizQuestionToSpeed(question: QuizQuestion): SpeedQuestion | null {
  if (question.type !== 'multiple-choice' || !question.options || !question.question || Array.isArray(question.answer)) return null;

  return {
    id: `speed-quiz-${question.id}`,
    type: 'quiz-multiple-choice',
    prompt: question.question,
    options: makeOptions(question.answer, question.options),
    answer: question.answer,
    explanationVi: question.explanationVi,
    sourceLabel: 'Quiz',
  };
}

function reflexQuestionToSpeed(prompt: SpeakingReflexPrompt, prompts: SpeakingReflexPrompt[]): SpeedQuestion {
  return {
    id: `speed-reflex-${prompt.id}`,
    type: 'reflex-quick-choice',
    prompt: prompt.promptVi,
    options: makeOptions(prompt.expectedEnglish, prompts.map((item) => item.expectedEnglish)),
    answer: prompt.expectedEnglish,
    explanationVi: prompt.hint,
    sourceLabel: 'Phản xạ',
  };
}

function buildSpeedQuestions(lesson: EnglishLesson): SpeedQuestion[] {
  const vocabularyMeaning = lesson.vocabulary.slice(0, 9).map((item) => vocabularyMeaningQuestion(item, lesson.vocabulary));
  const vocabularyReverse = lesson.vocabulary.slice(9, 18).map((item) => vocabularyReverseQuestion(item, lesson.vocabulary));
  const quiz = lesson.quizQuestions.map(quizQuestionToSpeed).filter((item): item is SpeedQuestion => Boolean(item));
  const reflex = lesson.speakingReflexPrompts.map((prompt) => reflexQuestionToSpeed(prompt, lesson.speakingReflexPrompts));

  return [...vocabularyMeaning, ...vocabularyReverse, ...quiz, ...reflex].slice(0, MAX_QUESTIONS);
}

function getResultMessage(accuracy: number) {
  if (accuracy >= 80) return 'Rất tốt! Phản xạ Unit 1 của bạn đang ổn.';
  if (accuracy >= 50) return 'Ổn rồi, nên luyện lại các câu sai một lượt.';
  return 'Nên quay lại flashcard hoặc ghép cặp trước khi chơi lại.';
}

export function LessonSpeedPractice({ lesson, onWhaleMoodChange }: { lesson: EnglishLesson; onWhaleMoodChange?: (mood: WhaleMood) => void }) {
  const baseQuestions = useMemo(() => buildSpeedQuestions(lesson), [lesson]);
  const autoNextRef = useRef<number | null>(null);
  const [questions, setQuestions] = useState<SpeedQuestion[]>([]);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<WrongSpeedAnswer[]>([]);
  const [bestScore, setBestScore] = useState(() => safeReadProgress(lesson.id).speed?.bestScore ?? 0);
  const [savedSummary, setSavedSummary] = useState(false);

  const currentQuestion = questions[questionIndex];
  const answeredCount = correctCount + wrongCount;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const progressValue = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const finalBestScore = Math.max(bestScore, score);

  const clearAutoNext = () => {
    if (autoNextRef.current) {
      window.clearTimeout(autoNextRef.current);
      autoNextRef.current = null;
    }
  };

  const finishGame = () => {
    clearAutoNext();
    onWhaleMoodChange?.('celebrate');
    setEnded(true);
    setStarted(false);
    setFeedback(null);
  };

  const startGame = () => {
    clearAutoNext();
    const shuffledQuestions = shuffleArray(baseQuestions).map((question) => ({
      ...question,
      options: shuffleArray(question.options),
    }));
    setQuestions(shuffledQuestions);
    setStarted(true);
    setEnded(false);
    setTimeLeft(GAME_SECONDS);
    setQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setMaxStreak(0);
    setFeedback(null);
    setWrongAnswers([]);
    setSavedSummary(false);
  };

  const goNext = () => {
    clearAutoNext();
    setFeedback(null);

    if (questionIndex >= questions.length - 1) {
      finishGame();
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  const chooseOption = (option: string) => {
    if (!started || ended || !currentQuestion || feedback) return;

    const isCorrect = option === currentQuestion.answer;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const bonus = isCorrect && nextStreak % 3 === 0 ? 5 : 0;
    let heartLossText: string | undefined;

    if (isCorrect) {
      setCorrectCount((count) => count + 1);
      setStreak(nextStreak);
      setMaxStreak((current) => Math.max(current, nextStreak));
      setScore((current) => current + 10 + bonus);
      onWhaleMoodChange?.('correct');
    } else {
      const hearts = loseHeart('speed-wrong');
      onWhaleMoodChange?.('mistake');
      heartLossText = `Bạn mất 1 bọt biển. Còn ${hearts.heartsLeft}/${hearts.maxHearts} bọt biển.`;
      setWrongCount((count) => count + 1);
      setStreak(0);
      setWrongAnswers((current) => [
        ...current,
        {
          questionId: currentQuestion.id,
          prompt: currentQuestion.prompt,
          userAnswer: option,
          correctAnswer: currentQuestion.answer,
          sourceLabel: currentQuestion.sourceLabel,
        },
      ]);
    }

    setFeedback({ selected: option, isCorrect, bonus, heartLossText });
    autoNextRef.current = window.setTimeout(() => goNext(), AUTO_NEXT_MS);
  };

  useEffect(() => {
    if (!started || ended) return undefined;

    const intervalId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          finishGame();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [started, ended]);

  useEffect(() => () => clearAutoNext(), []);

  useEffect(() => {
    if (!ended || savedSummary) return;

    safeWriteProgress(lesson.id, (current) => {
      const previous = current.speed;
      const nextBestScore = Math.max(previous?.bestScore ?? 0, score);
      setBestScore(nextBestScore);

      return {
        ...current,
        speed: {
          attempts: (previous?.attempts ?? 0) + 1,
          bestScore: nextBestScore,
          lastScore: score,
          lastCorrect: correctCount,
          lastWrong: wrongCount,
          maxStreak,
          lastPlayedAt: new Date().toISOString(),
        },
      };
    });

    recordPracticeSessionMemory({
      lessonId: lesson.id,
      lessonTitleVi: lesson.titleVi,
      mode: 'speed',
      total: answeredCount,
      correct: correctCount,
      wrong: wrongCount,
      percentage: accuracy,
      weakItemIds: wrongAnswers.map((item) => item.questionId),
    });

    setSavedSummary(true);
  }, [accuracy, answeredCount, correctCount, ended, lesson.id, lesson.titleVi, maxStreak, savedSummary, score, wrongAnswers, wrongCount]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (!started || ended) return;

      if (feedback && event.key === 'Enter') {
        event.preventDefault();
        goNext();
        return;
      }

      if (!feedback && ['1', '2', '3', '4'].includes(event.key)) {
        const optionIndex = Number(event.key) - 1;
        const option = currentQuestion?.options[optionIndex];
        if (option) {
          event.preventDefault();
          chooseOption(option);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentQuestion, ended, feedback, started]);

  if (baseQuestions.length === 0) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color={COLORS.text}>Chưa có dữ liệu luyện tốc độ</Text>
          <Text mt="2" color={COLORS.muted}>Bài học này chưa có đủ từ vựng, quiz hoặc phản xạ để tạo game tốc độ.</Text>
          <Button as={Link} to={`/lessons/${lesson.id}`} mt="6" borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
            Quay về bài học
          </Button>
        </Box>
      </Box>
    );
  }

  if (!started && !ended) {
    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
        <Box maxW="900px" mx="auto" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
          <HStack wrap="wrap" gap="2" mb="4">
            <Badge bg="#FEF3C7" color="#92400E" borderRadius="full" px="3" py="1">Tốc độ</Badge>
            <Badge bg="#EFF6FF" color={COLORS.primary} borderRadius="full" px="3" py="1">60 giây</Badge>
          </HStack>
          <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.05">Tốc độ</Text>
          <Text mt="3" fontSize="xl" fontWeight="800" color={COLORS.text}>{lesson.titleVi}</Text>
          <Text color={COLORS.muted}>{lesson.titleEn}</Text>
          <Text mt="5" color={COLORS.muted} fontSize="lg">
            Trả lời nhanh các cụm câu Unit 1 trong 60 giây. Ưu tiên phản xạ đúng, không cần suy nghĩ quá lâu.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4" mt="7">
            <Metric label="Kho câu hỏi" value={baseQuestions.length} />
            <Metric label="Thời gian" value={`${GAME_SECONDS}s`} tone="amber" />
            <Metric label="Điểm tốt nhất" value={bestScore} tone="green" />
          </SimpleGrid>
          <Flex mt="8" gap="3" wrap="wrap">
            <Button leftIcon={<Zap size={18} />} onClick={startGame} borderRadius="full" bg={COLORS.primary} color="white" size="lg" _hover={{ bg: COLORS.primaryHover }}>
              Bắt đầu
            </Button>
            <Button as={Link} to={`/lessons/${lesson.id}`} borderRadius="full" variant="outline" size="lg">
              Quay về bài học
            </Button>
          </Flex>
        </Box>
      </Box>
    );
  }

  if (ended) {
    const sessionFeedback = getPracticeSessionFeedback({
      lesson,
      mode: 'speed',
      total: answeredCount,
      correct: correctCount,
      wrong: wrongCount,
      percentage: accuracy,
      weakItemIds: wrongAnswers.map((item) => item.questionId),
      nextMode: wrongAnswers.length > 0 ? 'flashcard' : 'reflex',
    });

    return (
      <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
        <Box maxW="980px" mx="auto">
          <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '6', md: '8' }}>
            <Badge bg="#F0FDF4" color="#166534" borderRadius="full" px="3" py="1">Hoàn thành speed</Badge>
            <Text mt="4" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="950" color={COLORS.text}>Tổng kết Tốc độ</Text>
            <Text mt="2" color={COLORS.muted}>{getResultMessage(accuracy)}</Text>
            <SimpleGrid columns={{ base: 1, md: 4 }} gap="4" mt="6">
              <Metric label="Điểm" value={score} tone="green" />
              <Metric label="Best score" value={finalBestScore} tone="amber" />
              <Metric label="Đúng / Sai" value={`${correctCount} / ${wrongCount}`} />
              <Metric label="Độ chính xác" value={`${accuracy}%`} />
              <Metric label="Chuỗi nhanh nhất" value={maxStreak} tone="amber" />
              <Metric label="Đã trả lời" value={`${answeredCount}/${questions.length}`} />
            </SimpleGrid>

            <PracticeSessionFeedbackCard feedback={sessionFeedback} />

            <Box mt="7">
              <Text fontWeight="900" color={COLORS.text}>Các câu cần luyện lại</Text>
              {wrongAnswers.length === 0 ? (
                <Box mt="3" border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4">
                  <Text color="#166534" fontWeight="800">Không có câu sai trong lượt này.</Text>
                </Box>
              ) : (
                <VStack align="stretch" gap="3" mt="3">
                  {wrongAnswers.map((item) => (
                    <Box key={`${item.questionId}-${item.userAnswer}`} border="1px solid" borderColor="#FED7AA" bg="#FFF7ED" borderRadius="2xl" p="4">
                      <HStack wrap="wrap" gap="2" mb="2">
                        <Badge colorScheme="orange" borderRadius="full">{item.sourceLabel}</Badge>
                      </HStack>
                      <Text fontWeight="800" color={COLORS.text}>{item.prompt}</Text>
                      <Text mt="1" color="#9A3412">Bạn chọn: {item.userAnswer}</Text>
                      <Text color="#166534">Đáp án đúng: {item.correctAnswer}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            <Flex mt="7" gap="3" wrap="wrap">
              <Button onClick={startGame} borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
                Chơi lại
              </Button>
              <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=flashcard`} borderRadius="full" variant="outline">
                Ôn flashcard
              </Button>
              <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=reflex`} borderRadius="full" variant="outline">
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

  return (
    <Box bg={COLORS.bg} minH="calc(100vh - 72px)" px={{ base: '4', md: '6' }} py="8">
      <Box maxW="980px" mx="auto">
        <VStack align="stretch" gap="5">
          <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '7' }}>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4">
              <Box>
                <HStack wrap="wrap" gap="2" mb="2">
                  <Badge bg="#FEF3C7" color="#92400E" borderRadius="full" px="3" py="1">Tốc độ</Badge>
                  <Badge bg="#EFF6FF" color={COLORS.primary} borderRadius="full" px="3" py="1">{currentQuestion?.sourceLabel}</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="950" color={COLORS.text}>{lesson.titleVi}</Text>
                <Text color={COLORS.muted}>Phím 1–4 để chọn, Enter để qua câu khi đang xem feedback.</Text>
              </Box>
              <HStack wrap="wrap" gap="3">
                <ScorePill label="⏱ Thời gian" value={`${timeLeft}s`} tone="amber" />
                <ScorePill label="Điểm" value={score} tone="green" />
                <ScorePill label="Đúng" value={correctCount} tone="green" />
                <ScorePill label="Sai" value={wrongCount} tone="red" />
                <ScorePill label="Chuỗi nhanh" value={streak} tone="amber" />
              </HStack>
            </Flex>
            <Progress mt="5" value={progressValue} colorScheme="blue" borderRadius="full" bg="#E2E8F0" />
            <Text mt="2" color={COLORS.muted} fontSize="sm">{answeredCount} / {questions.length} câu</Text>
          </Box>

          {currentQuestion ? (
            <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '8' }}>
              <HStack wrap="wrap" gap="2" mb="4">
                <Badge borderRadius="full" bg="#F8FAFC" color={COLORS.text}>Câu {questionIndex + 1}</Badge>
                <Badge borderRadius="full" bg="#EFF6FF" color={COLORS.primary}>{currentQuestion.sourceLabel}</Badge>
              </HStack>
              <Text color={COLORS.muted} fontWeight="800">Chọn đáp án đúng nhanh nhất</Text>
              <Text mt="3" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.15">
                {currentQuestion.prompt}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" mt="7">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = feedback?.selected === option;
                  const isAnswer = feedback && option === currentQuestion.answer;
                  const borderColor = isAnswer ? '#86EFAC' : isSelected && !feedback?.isCorrect ? '#FDBA74' : COLORS.border;
                  const bg = isAnswer ? '#F0FDF4' : isSelected && !feedback?.isCorrect ? '#FFF7ED' : '#FFFFFF';
                  const color = isAnswer ? '#166534' : isSelected && !feedback?.isCorrect ? '#9A3412' : COLORS.text;

                  return (
                    <Button
                      key={`${currentQuestion.id}-${option}`}
                      onClick={() => chooseOption(option)}
                      justifyContent="start"
                      textAlign="left"
                      whiteSpace="normal"
                      minH="64px"
                      h="auto"
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor={borderColor}
                      bg={bg}
                      color={color}
                      _hover={{ borderColor: COLORS.primary, bg: feedback ? bg : '#EFF6FF' }}
                      isDisabled={Boolean(feedback)}
                    >
                      <HStack align="start" gap="3">
                        <Badge borderRadius="full" bg="#F8FAFC" color={COLORS.text}>{index + 1}</Badge>
                        <Text>{option}</Text>
                      </HStack>
                    </Button>
                  );
                })}
              </SimpleGrid>

              {feedback ? (
                <Box mt="6" border="1px solid" borderColor={feedback.isCorrect ? '#BBF7D0' : '#FED7AA'} bg={feedback.isCorrect ? '#F0FDF4' : '#FFF7ED'} borderRadius="2xl" p="5">
                  <Text fontSize="xl" fontWeight="950" color={feedback.isCorrect ? '#166534' : '#9A3412'}>
                    {feedback.isCorrect ? 'Đúng!' : `Chưa đúng, đáp án là: ${currentQuestion.answer}`}
                  </Text>
                  {feedback.bonus > 0 ? (
                    <Text mt="1" color="#0E7490" fontWeight="900">+5 thưởng chuỗi nhanh</Text>
                  ) : null}
                  {!feedback.isCorrect && feedback.heartLossText ? (
                    <Text mt="2" color="#9A3412" fontWeight="800">{feedback.heartLossText} Cá voi vẫn bơi cùng bạn — thử lại nhịp tiếp theo nhé.</Text>
                  ) : null}
                  {currentQuestion.explanationVi ? (
                    <Text mt="2" color={COLORS.muted}>{currentQuestion.explanationVi}</Text>
                  ) : null}
                  <HStack mt="4" wrap="wrap">
                    {isEnglishText(currentQuestion.answer) ? (
                      <Button leftIcon={<Volume2 size={16} />} onClick={() => speakEnglish(currentQuestion.answer)} size="sm" borderRadius="full" variant="outline">
                        Nghe câu
                      </Button>
                    ) : null}
                    <Button onClick={goNext} size="sm" borderRadius="full" bg={COLORS.primary} color="white" _hover={{ bg: COLORS.primaryHover }}>
                      Câu tiếp theo
                    </Button>
                  </HStack>
                </Box>
              ) : null}
            </Box>
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'amber' | 'red' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'amber' ? COLORS.amber : tone === 'red' ? '#9A3412' : COLORS.text;

  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#F8FAFC" borderRadius="2xl" p="4">
      <Text color={COLORS.muted} fontSize="sm" fontWeight="800">{label}</Text>
      <Text mt="1" fontSize="2xl" fontWeight="950" color={color}>{value}</Text>
    </Box>
  );
}

function ScorePill({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'amber' | 'red' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'amber' ? COLORS.amber : tone === 'red' ? '#9A3412' : COLORS.primary;

  return (
    <Box border="1px solid" borderColor={COLORS.border} bg="#FFFFFF" borderRadius="2xl" px="3" py="2" minW="88px">
      <Text color={COLORS.muted} fontSize="xs" fontWeight="800">{label}</Text>
      <Text color={color} fontWeight="950">{value}</Text>
    </Box>
  );
}
