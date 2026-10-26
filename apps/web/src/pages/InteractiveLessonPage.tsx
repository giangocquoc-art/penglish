import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Flex, HStack, Icon, Input, Progress, SimpleGrid, Tag, Text, Textarea, VStack } from '@chakra-ui/react';
import { ArrowLeft, CheckCircle2, Headphones, Mic2, RotateCcw, Sparkles, Volume2, XCircle, Zap } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { PooSystemState } from '../components/p-english/PooSystemState';
import { InteractiveShadowingChallenge } from '../components/practice/InteractiveShadowingChallenge';
import {
  completeInteractiveLesson,
  getInteractiveLessonCriteriaProgress,
  getInteractiveLessonByLessonId,
  getInteractiveLessonByUnit,
  isInteractiveAnswerCorrect,
  recordInteractiveStep,
  startInteractiveLesson,
  INTERACTIVE_LESSON_FLOW_VERSION,
  type InteractiveLesson,
  type InteractiveLessonResult,
  type InteractiveLessonStep,
} from '../lib/p-english/interactiveLessonEngine';
import { getLessonProgress, markItemReviewed } from '../lib/p-english/lesson-progress';
import { getQuestionRandomSeed, shuffleArrayStableCopy, shuffleChoiceOptions, shuffleTokensForQuestion, validateSentenceOrderAnswer } from '../lib/p-english/practice-randomization';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  blue: '#1F6FD6',
  sky: '#2F9EEB',
  green: '#16A34A',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#BAE6FD',
};

function speakEnglish(text?: string, slow = false, language: 'en-US' | 'en-GB' = 'en-US', preferredRate?: number) {
  if (typeof window === 'undefined' || !text?.trim()) return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = slow ? 0.72 : preferredRate ?? 0.9;
  synth.cancel();
  synth.speak(utterance);
}

function getBonusModeKey(lesson: InteractiveLesson | null) {
  return lesson ? `PooEnglish:interactive-bonus:${lesson.sourceLesson.id}` : '';
}

function readBonusMode(lesson: InteractiveLesson | null) {
  if (!lesson || typeof window === 'undefined') return false;
  try { return window.localStorage.getItem(getBonusModeKey(lesson)) === '1'; } catch { return false; }
}

function getRunSteps(lesson: InteractiveLesson, weakItems: InteractiveLessonStep[], includeBonus = false) {
  const summary = lesson.steps[lesson.steps.length - 1];
  if (summary?.type !== 'summary') return lesson.steps;
  const practiceSteps = lesson.steps.slice(0, -1);
  const coreSteps = practiceSteps.filter((step) => !step.optionalBonus);
  const bonusSteps = practiceSteps.filter((step) => step.optionalBonus);
  const retryLimit = Math.max(0, Math.min(10, Math.floor(lesson.sourceLesson.reviewPolicy.inLessonRetryLimit)));
  const retryInstruction = lesson.sourceLesson.reviewPolicy.retryPromptMode === 'reading-evidence'
    ? 'Quay lại đoạn đọc, tìm câu có bằng chứng rồi trả lời từ nội dung đó.'
    : lesson.sourceLesson.reviewPolicy.retryPromptMode === 'grammar-pattern'
      ? 'Nhớ lại khung ngữ pháp, tự dựng lại câu rồi kiểm tra đáp án.'
      : 'Nhớ lại tình huống giao tiếp, chọn hoặc tạo câu phù hợp với ngữ cảnh.';
  const reviewSteps = weakItems
    .filter((step) => ['multiple_choice', 'fill_blank', 'speed_recall', 'sentence_order', 'match_pairs', 'listen_choose', 'flashcard'].includes(step.type))
    .slice(retryLimit ? -retryLimit : weakItems.length)
    .map((step): InteractiveLessonStep => ({
      ...step,
      id: `review-${step.id}`,
      title: step.type === 'match_pairs' ? 'Ghép lại các cặp từng vấp' : 'Ôn lại câu từng vấp',
      instruction: `${retryInstruction} Lượt ôn này không làm thay đổi điểm lần đầu của bạn.`,
      reviewOfStepId: step.id,
      completionGroup: undefined,
      completionItemId: undefined,
    }));
  return [...coreSteps, ...(includeBonus ? bonusSteps : []), ...reviewSteps, summary];
}

function getResumeStepIndex(lesson: InteractiveLesson | null, includeBonus = readBonusMode(lesson)): number {
  if (!lesson) return 0;
  const record = getLessonProgress()[lesson.sourceLesson.id];
  if (!record || record.flowVersion !== INTERACTIVE_LESSON_FLOW_VERSION || (record.status === 'completed' && !includeBonus) || !record.completedSteps.length) return 0;
  const saved = getSavedRunState(lesson);
  const steps = getRunSteps(lesson, saved.weakItems, includeBonus);
  const lastIndex = steps.length - 1;
  const index = steps.findIndex((step, i) => i > 0 && i < lastIndex && !record.completedSteps.includes(step.id));
  return index >= 1 ? index : lastIndex;
}

function getSavedRunState(lesson: InteractiveLesson | null) {
  if (!lesson) return { correctCount: 0, totalAnswered: 0, selfCompletedCount: 0, weakItems: [] as InteractiveLessonStep[], recordedSteps: new Set<string>() };
  const record = getLessonProgress()[lesson.sourceLesson.id];
  const current = record?.flowVersion === INTERACTIVE_LESSON_FLOW_VERSION;
  const outcomes = current ? record.stepOutcomes ?? {} : {};
  const stepsById = new Map(lesson.steps.map((step) => [step.id, step]));
  const isScoredType = (type: InteractiveLessonStep['type'] | undefined) =>
    type === 'multiple_choice' || type === 'fill_blank' || type === 'speed_recall' || type === 'sentence_order' || type === 'match_pairs' || type === 'listen_choose';
  const scored = Object.entries(outcomes).filter(([id]) => isScoredType(stepsById.get(id)?.type));
  const weakSteps = Object.entries(outcomes)
    .filter(([id, correct]) => !correct && (isScoredType(stepsById.get(id)?.type) || stepsById.get(id)?.type === 'flashcard'))
    .map(([id]) => stepsById.get(id))
    .filter((step): step is InteractiveLessonStep => Boolean(step));
  return {
    correctCount: scored.filter(([, correct]) => correct).length,
    totalAnswered: scored.length,
    selfCompletedCount: current ? (record.completedSteps ?? []).filter((id) => {
      const type = stepsById.get(id)?.type;
      return type === 'flashcard' || type === 'speak_repeat' || type === 'shadowing' || type === 'lesson_tip' || type === 'free_response';
    }).length : 0,
    weakItems: weakSteps,
    recordedSteps: new Set(current ? record.completedSteps ?? [] : []),
  };
}

function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isScoredInteractiveStep(type: InteractiveLessonStep['type']) {
  return type === 'multiple_choice' || type === 'fill_blank' || type === 'speed_recall' || type === 'sentence_order' || type === 'match_pairs' || type === 'listen_choose';
}

function FeedbackBox({ correct, explanation, selfCheck = false, missionMet }: { correct: boolean; explanation?: string; selfCheck?: boolean; missionMet?: boolean }) {
  const neutral = selfCheck || missionMet !== undefined;
  const feedbackCorrect = missionMet ?? correct;
  const background = neutral ? (missionMet ? '#F0FDF4' : '#EFF6FF') : correct ? '#F0FDF4' : '#FFF7ED';
  const border = neutral ? (missionMet ? '#BBF7D0' : '#BFDBFE') : correct ? '#BBF7D0' : '#FED7AA';
  return (
    <Box
      data-testid="interactive-lesson-feedback"
      mt="4"
      p={{ base: '3', md: '4' }}
      borderRadius="2xl"
      bg={background}
      border="1px solid"
      borderColor={border}
      role="status"
      aria-live="polite"
    >
      <HStack align="start" gap="3">
        {!correct && !neutral ? (
          <Box className="learning-sponge-buddy learning-sponge-hit" position="relative" w="44px" h="44px" flexShrink={0} aria-hidden="true">
            <OceanMascot mascot="botBien" pose="encourage" size="xs" decorative motion="none" className="learning-sponge-character" w="100%" />
          </Box>
        ) : null}
        <Icon as={neutral ? Sparkles : correct ? CheckCircle2 : XCircle} color={neutral && missionMet === undefined ? COLORS.blue : feedbackCorrect ? COLORS.green : COLORS.amber} boxSize="5" mt="0.5" />
        <Box>
          <Text fontWeight="950" color={neutral ? (missionMet ? '#166534' : COLORS.blue) : correct ? '#166534' : '#9A3412'}>
            {missionMet !== undefined ? missionMet ? 'Hoàn thành nhiệm vụ!' : 'Chưa đạt điều kiện nhiệm vụ' : selfCheck ? 'Đã lưu phần tự luyện' : correct ? 'Poo nói: Chuẩn rồi!' : 'Bọt Biển nói: Chưa sao, mình sửa ngay nhé.'}
          </Text>
          <Text mt="1" color={COLORS.muted} fontWeight="700" lineHeight="1.6">
            {explanation || (selfCheck ? 'Phần này không chấm đúng sai. Hãy so sánh câu của bạn với ví dụ để tự điều chỉnh.' : correct ? 'Bạn đã qua màn này. Bấm tiếp tục để học bước kế.' : 'Đáp án này sẽ được đưa vào phần ôn tập để bạn gặp lại sau.')}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}

function LessonStepMascot({ stepType, feedbackCorrect }: {
  stepType: InteractiveLessonStep['type'];
  feedbackCorrect: boolean | null;
}) {
  const motion = feedbackCorrect ? 'celebrate' : 'float';
  if (stepType === 'match_pairs' || stepType === 'multiple_choice') {
    return <OceanMascot mascot="cuaQuiz" pose={feedbackCorrect ? 'happy' : stepType === 'match_pairs' ? 'match' : 'quiz'} size="md" decorative motion={motion} />;
  }
  if (stepType === 'speed_recall') {
    return <OceanMascot mascot="caNguaToc" pose={feedbackCorrect ? 'happy' : 'speed'} size="md" decorative motion={feedbackCorrect ? 'celebrate' : 'swim'} />;
  }
  if (stepType === 'listen_choose' || stepType === 'speak_repeat' || stepType === 'shadowing') {
    return <OceanMascot mascot="suaNghe" pose={feedbackCorrect ? 'happy' : stepType === 'shadowing' ? 'record' : 'listen'} size="md" decorative motion={motion} />;
  }
  if (stepType === 'flashcard' || stepType === 'fill_blank' || stepType === 'sentence_order' || stepType === 'lesson_tip') {
    return <OceanMascot mascot="mucMo" pose={feedbackCorrect ? 'happy' : stepType === 'lesson_tip' ? 'explain' : 'hint'} size="md" decorative motion={motion} />;
  }
  if (stepType === 'free_response') {
    return <OceanMascot mascot="saoNhi" pose={feedbackCorrect ? 'happy' : 'sparkle'} size="md" decorative motion={motion} />;
  }
  return <OceanMascot mascot="poo" pose={feedbackCorrect ? 'celebrate' : feedbackCorrect === false ? 'think' : 'coach'} size="md" decorative motion={motion} />;
}

function getMissionProgress(step: InteractiveLessonStep, lessonSteps: InteractiveLessonStep[], completedStepIds: Set<string>, outcomes: Record<string, boolean | undefined>) {
  const requirement = step.missionRequirement;
  if (!requirement) return { configured: false, targets: [] as InteractiveLessonStep[], correct: 0, completed: 0, total: 0, minimum: 0, met: false };
  const targets = requirement.sourceItemIds.map((sourceId) => lessonSteps.find((candidate) => candidate.id === sourceId || candidate.sourceItemId === sourceId)).filter((target): target is InteractiveLessonStep => Boolean(target));
  const correct = targets.filter((target) => outcomes[target.id] === true).length;
  const completed = targets.filter((target) => completedStepIds.has(target.id)).length;
  const minimum = requirement.minimum;
  return {
    configured: true,
    targets,
    correct,
    completed,
    total: targets.length,
    minimum,
    met: requirement.kind === 'correct' ? correct >= minimum : completed >= minimum,
  };
}

type SentenceWordToken = { id: string; text: string };

function MatchPairsChallenge({ step, onAnswer, onPairResult }: {
  step: InteractiveLessonStep;
  onAnswer: (answer: string) => void;
  onPairResult: (pairId: string, correct: boolean) => void;
}) {
  const pairs = step.matchPairs ?? [];
  const [seed] = useState(() => getQuestionRandomSeed(step.id, Math.random()));
  const [leftOrder] = useState(() => shuffleArrayStableCopy(pairs, `${seed}::left`));
  const [rightOrder] = useState(() => {
    const shuffled = shuffleArrayStableCopy(pairs, `${seed}::right`);
    if (pairs.length > 1 && shuffled.every((pair, index) => pair.id === leftOrder[index]?.id)) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled;
  });
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('Chọn một cụm tiếng Anh, rồi nối với nghĩa tương ứng.');

  const selectLeft = (pairId: string) => {
    if (matchedIds.includes(pairId)) return;
    setSelectedLeftId(pairId);
    setMessage('Giờ hãy chọn nghĩa tiếng Việt ở cột bên phải.');
    setWrongPair(null);
  };

  const selectRight = (pairId: string) => {
    if (matchedIds.includes(pairId)) return;
    if (!selectedLeftId) {
      setMessage('Chọn một cụm tiếng Anh trước nhé.');
      return;
    }
    if (selectedLeftId !== pairId) {
      setMistakes((count) => count + 1);
      onPairResult(selectedLeftId, false);
      setWrongPair({ left: selectedLeftId, right: pairId });
      setMessage('Chưa khớp. Thử một nghĩa khác cho cụm tiếng Anh đang chọn.');
      window.setTimeout(() => setWrongPair(null), 500);
      return;
    }

    const nextMatched = [...matchedIds, pairId];
    setMatchedIds(nextMatched);
    setSelectedLeftId(null);
    setWrongPair(null);
    onPairResult(pairId, true);
    if (nextMatched.length === pairs.length) {
      setMessage('Tuyệt! Bạn đã ghép xong tất cả các cặp.');
      onAnswer('completed');
      return;
    }
    setMessage(`Đúng rồi! Đã ghép ${nextMatched.length}/${pairs.length} cặp.`);
  };

  return (
    <VStack align="stretch" gap="4" data-testid="interactive-match-game">
      <HStack align="center" gap="3" p="3" borderRadius="2xl" bg="linear-gradient(115deg, #EFF6FF, #F0FDFA)" border="1px solid #BAE6FD">
        <Box w="44px" h="44px" display="grid" placeItems="center" borderRadius="full" bg="#DBEAFE" color={COLORS.blue} flexShrink={0}>
          <Icon as={Sparkles} boxSize="5" />
        </Box>
        <Box flex="1">
          <Text fontWeight="950" color={COLORS.text}>Vòng ghép đôi</Text>
          <Text fontSize="sm" color={COLORS.muted} fontWeight="700">Ghép đúng để mở đường qua màn tiếp theo.</Text>
        </Box>
        <Tag borderRadius="full" bg="#DCFCE7" color="#166534" fontWeight="900" data-testid="interactive-match-progress">{matchedIds.length}/{pairs.length}</Tag>
      </HStack>
      <SimpleGrid columns={{ base: 2, md: 2 }} gap="3">
        <VStack align="stretch" gap="2">
          <Text fontSize="sm" fontWeight="950" color={COLORS.blue}>Cụm tiếng Anh</Text>
          {leftOrder.map((pair) => {
            const matched = matchedIds.includes(pair.id);
            const selected = selectedLeftId === pair.id;
            const wrong = wrongPair?.left === pair.id;
            return (
              <Button
                key={pair.id}
                data-testid="interactive-match-left"
                data-pair-id={pair.id}
                aria-label={`Ghép ${pair.left}`}
                aria-pressed={selected}
                isDisabled={matched}
                minH={{ base: '64px', md: '60px' }}
                h="auto"
                whiteSpace="normal"
                textAlign="left"
                justifyContent="flex-start"
                px={{ base: '2.5', md: '4' }}
                py="3"
                borderRadius="xl"
                border="2px solid"
                borderColor={wrong ? '#FCA5A5' : selected ? COLORS.blue : matched ? '#86EFAC' : '#BAE6FD'}
                bg={matched ? '#F0FDF4' : selected ? '#EFF6FF' : 'white'}
                color={COLORS.text}
                fontSize={{ base: 'sm', md: 'md' }}
                onClick={() => selectLeft(pair.id)}
              >
                {pair.left}{matched ? ' ✓' : ''}
              </Button>
            );
          })}
        </VStack>
        <VStack align="stretch" gap="2">
          <Text fontSize="sm" fontWeight="950" color="#0F766E">Nghĩa tiếng Việt</Text>
          {rightOrder.map((pair) => {
            const matched = matchedIds.includes(pair.id);
            const wrong = wrongPair?.right === pair.id;
            return (
              <Button
                key={pair.id}
                data-testid="interactive-match-right"
                data-pair-id={pair.id}
                aria-label={`Chọn nghĩa ${pair.right}`}
                isDisabled={matched}
                minH={{ base: '64px', md: '60px' }}
                h="auto"
                whiteSpace="normal"
                textAlign="left"
                justifyContent="flex-start"
                px={{ base: '2.5', md: '4' }}
                py="3"
                borderRadius="xl"
                border="2px solid"
                borderColor={wrong ? '#FCA5A5' : matched ? '#86EFAC' : '#99F6E4'}
                bg={matched ? '#F0FDF4' : 'white'}
                color={COLORS.text}
                fontSize={{ base: 'sm', md: 'md' }}
                onClick={() => selectRight(pair.id)}
              >
                {pair.right}{matched ? ' ✓' : ''}
              </Button>
            );
          })}
        </VStack>
      </SimpleGrid>
      <Progress value={pairs.length ? matchedIds.length / pairs.length * 100 : 0} aria-label="Tiến độ ghép cặp" borderRadius="full" colorScheme="teal" bg="#E2E8F0" />
      <Text minH="24px" fontSize="sm" fontWeight="800" color={wrongPair ? '#9A3412' : '#0F766E'} role="status" aria-live="polite">{message}</Text>
      {mistakes > 0 ? <Text fontSize="xs" color={COLORS.muted}>Lượt thử sai: {mistakes} · Ghép lại đúng vẫn giúp bạn nhớ cặp từ này.</Text> : null}
    </VStack>
  );
}

function StepRenderer({ step, pickedWordIds, inputValue, fillBlankInputRef, cardRevealed, targetOutputsRevealed, answerLocked, onInputChange, onAnswer, onToggleWord, onRemoveWord, onRevealCard, onMatchPairResult, lessonTitle, lessonLevel, lessonSteps, completedStepIds, stepOutcomes }: {
  step: InteractiveLessonStep;
  pickedWordIds: string[];
  inputValue: string;
  fillBlankInputRef: RefObject<HTMLInputElement>;
  cardRevealed: boolean;
  targetOutputsRevealed: boolean;
  answerLocked: boolean;
  onInputChange: (value: string) => void;
  onAnswer: (answer: string) => void;
  onToggleWord: (tokenId: string) => void;
  onRemoveWord: (tokenId: string) => void;
  onRevealCard: () => void;
  onMatchPairResult: (pairId: string, correct: boolean) => void;
  lessonTitle: string;
  lessonLevel: string;
  lessonSteps: InteractiveLessonStep[];
  completedStepIds: Set<string>;
  stepOutcomes: Record<string, boolean | undefined>;
}) {
  const [sentenceShuffleSeed] = useState(() => Math.random());
  const [untimedSpeed, setUntimedSpeed] = useState(false);
  const [showSpeedHint, setShowSpeedHint] = useState(false);
  const [speedSecondsLeft, setSpeedSecondsLeft] = useState(step.timeLimitSeconds ?? 20);
  const choiceOptions = useMemo(() => shuffleChoiceOptions(step.options || [], step.answer || '', `${step.id}:${Math.random()}`), [step.id, step.options, step.answer]);

  useEffect(() => {
    if (step.type !== 'speed_recall' || untimedSpeed || speedSecondsLeft <= 0) return undefined;
    const timer = window.setTimeout(() => setSpeedSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [step.id, step.type, speedSecondsLeft, untimedSpeed]);

  if (step.type === 'intro') {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.08">{step.prompt}</Text>
        <Text color={COLORS.muted} fontWeight="750" lineHeight="1.75">{step.explanation}</Text>
        <Button data-testid="interactive-lesson-start-button" size="lg" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer('start')} _hover={{ bg: '#185BB2' }}>
          Bắt đầu học ngay
        </Button>
      </VStack>
    );
  }

  if (step.type === 'flashcard') {
    return (
      <VStack align="stretch" gap="4">
        <Box p={{ base: '5', md: '7' }} borderRadius="3xl" bg="linear-gradient(135deg, #EFF6FF, #FFFFFF)" border="1px solid #BFDBFE" textAlign="center">
          <Text fontSize="sm" fontWeight="900" color={COLORS.blue} textTransform="uppercase" letterSpacing="0.12em">Thẻ từ</Text>
          <Text mt="3" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" color={COLORS.text}>{step.prompt}</Text>
          {step.hint ? <Text mt="2" color={COLORS.muted} fontWeight="800">{step.hint}</Text> : null}
          {cardRevealed ? (
            <>
              <Text mt="4" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color={COLORS.green}>{step.vietnamese || step.answer}</Text>
              {step.english ? <Text mt="2" color={COLORS.muted} fontWeight="750">{step.english}</Text> : null}
            </>
          ) : <Text mt="4" color={COLORS.muted} fontWeight="750">Hãy tự nhớ nghĩa trước khi lật thẻ.</Text>}
        </Box>
        <HStack gap="3" wrap="wrap" justify="center">
          <Button borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={() => speakEnglish(step.prompt || step.english)}>
            Nghe Poo đọc
          </Button>
          {!cardRevealed ? (
            <Button data-testid="interactive-lesson-reveal-card-button" borderRadius="full" bg={COLORS.blue} color="white" onClick={onRevealCard} _hover={{ bg: '#185BB2' }}>
              Lật thẻ xem nghĩa
            </Button>
          ) : (
            <>
              <Button data-testid="interactive-lesson-remember-button" borderRadius="full" bg={COLORS.green} color="white" onClick={() => onAnswer('remembered')} isDisabled={answerLocked} _hover={{ bg: '#15803D' }}>
                Mình nhớ được
              </Button>
              <Button data-testid="interactive-lesson-review-card-button" borderRadius="full" variant="outline" onClick={() => onAnswer('review-again')} isDisabled={answerLocked}>
                Cần ôn lại
              </Button>
            </>
          )}
        </HStack>
      </VStack>
    );
  }

  if (step.type === 'match_pairs') {
    return <MatchPairsChallenge step={step} onAnswer={onAnswer} onPairResult={onMatchPairResult} />;
  }

  if (step.type === 'shadowing') {
    return <InteractiveShadowingChallenge step={step} lessonTitle={lessonTitle} level={lessonLevel} onComplete={() => onAnswer('shadowing-self-checked')} onPlayModel={(text) => speakEnglish(text, true)} />;
  }

  if (step.type === 'speed_recall') {
    const timeLimit = step.timeLimitSeconds ?? 20;
    const timedOut = speedSecondsLeft <= 0 && !untimedSpeed;
    return (
      <VStack align="stretch" gap="4" data-testid="interactive-speed-recall">
          <HStack justify="space-between" align="center" p="3" borderRadius="2xl" bg={timedOut ? '#FFF7ED' : '#EFF6FF'} border="1px solid" borderColor={timedOut ? '#FDBA74' : '#BFDBFE'}>
          <HStack><Icon as={Zap} color={COLORS.amber} /><Text fontWeight="900">Phản xạ nhanh</Text></HStack>
          <Tag data-testid="interactive-speed-timer" borderRadius="full" bg={timedOut ? '#FFEDD5' : '#DBEAFE'} color={timedOut ? '#9A3412' : COLORS.blue} fontWeight="950">
            {untimedSpeed ? 'Không giới hạn' : timedOut ? 'Hết giờ · vẫn tiếp tục' : `${speedSecondsLeft}s`}
          </Tag>
        </HStack>
        <Progress value={untimedSpeed ? 0 : ((timeLimit - speedSecondsLeft) / timeLimit) * 100} colorScheme={timedOut ? 'orange' : 'blue'} borderRadius="full" aria-label="Thời gian phản xạ" />
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.2">{step.prompt}</Text>
        {step.hint ? (
          <Box>
            <Button size="sm" variant="ghost" color={COLORS.blue} onClick={() => setShowSpeedHint((visible) => !visible)}>
              {showSpeedHint ? 'Ẩn gợi ý' : 'Mở gợi ý'}
            </Button>
            {showSpeedHint ? <Text mt="1" fontSize="sm" color={COLORS.muted}>Gợi ý: {step.hint}</Text> : null}
          </Box>
        ) : null}
        <Input ref={fillBlankInputRef} data-testid="interactive-lesson-fill-input" aria-label="Đáp án tiếng Anh" value={inputValue} onChange={(event) => onInputChange(event.target.value)} isReadOnly={answerLocked} size="lg" borderRadius="2xl" bg="white" borderColor={COLORS.border} placeholder="Gõ câu tiếng Anh..." />
        <Text fontSize="sm" color={COLORS.muted} fontWeight="700">Chỉ độ chính xác ảnh hưởng điểm.</Text>
        <HStack wrap="wrap" gap="3">
          <Button data-testid="interactive-speed-untimed" variant="outline" borderRadius="full" onClick={() => {
            setUntimedSpeed((value) => {
              if (value) setSpeedSecondsLeft(timeLimit);
              return !value;
            });
          }}>
            {untimedSpeed ? 'Bật lại đồng hồ' : 'Chơi không giới hạn thời gian'}
          </Button>
          <Button data-testid="interactive-lesson-check-button" size="lg" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(inputValue)} isDisabled={answerLocked || !inputValue.trim()} _hover={{ bg: '#185BB2' }}>
            Kiểm tra câu
          </Button>
        </HStack>
      </VStack>
    );
  }

  if (step.type === 'multiple_choice' || step.type === 'listen_choose') {
    return (
      <VStack align="stretch" gap="4">
        {step.type === 'listen_choose' ? (
          <Button alignSelf="start" size="lg" borderRadius="full" leftIcon={<Icon as={Headphones} />} bg="#E0F2FE" color="#0369A1" onClick={() => speakEnglish(step.english || step.answer, false, step.speechLang, step.speechRate)}>
            Nghe câu
          </Button>
        ) : null}
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.18">{step.prompt}</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {choiceOptions.map((option) => (
            <Button key={option} data-testid="interactive-lesson-answer-option" minH="58px" h="auto" whiteSpace="normal" borderRadius="2xl" bg="white" border="1px solid #BAE6FD" color={COLORS.text} justifyContent="flex-start" p="4" onClick={() => onAnswer(option)} isDisabled={answerLocked} _hover={{ bg: '#EFF6FF' }}>
              {option}
            </Button>
          ))}
        </SimpleGrid>
      </VStack>
    );
  }

  if (step.type === 'fill_blank') {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{step.prompt}</Text>
        {step.hint ? <Text color={COLORS.muted} fontWeight="750">Gợi ý: {step.hint}</Text> : null}
        <Input ref={fillBlankInputRef} data-testid="interactive-lesson-fill-input" aria-label="Đáp án tiếng Anh" value={inputValue} onChange={(event) => onInputChange(event.target.value)} isReadOnly={answerLocked} size="lg" borderRadius="2xl" bg="white" borderColor={COLORS.border} placeholder="Gõ đáp án..." />
        <Text mt="-2" fontSize={{ base: 'xs', md: 'sm' }} color={COLORS.muted} fontWeight="750">Mẹo: Nhấn Enter để kiểm tra, đúng rồi thì Enter lần nữa để đi tiếp.</Text>
        <Button data-testid="interactive-lesson-check-button" size="lg" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(inputValue)} isDisabled={answerLocked || !inputValue.trim()} _hover={{ bg: '#185BB2' }}>
          Kiểm tra
        </Button>
      </VStack>
    );
  }

  if (step.type === 'sentence_order') {
    const shuffledWords = shuffleTokensForQuestion(step.words || [], `${step.id}:${sentenceShuffleSeed}`);
    if (validateSentenceOrderAnswer(shuffledWords, step.answer || '') && shuffledWords.length > 1) {
      [shuffledWords[0], shuffledWords[1]] = [shuffledWords[1], shuffledWords[0]];
    }
    const wordTokens = shuffledWords.map((text, index) => ({ id: `${step.id}-token-${index}`, text }));
    const tokensById = new Map(wordTokens.map((token) => [token.id, token]));
    const pickedTokens = pickedWordIds.map((tokenId) => tokensById.get(tokenId)).filter((token): token is SentenceWordToken => Boolean(token));
    const pickedIdSet = new Set(pickedWordIds);
    const remainingTokens = wordTokens.filter((token) => !pickedIdSet.has(token.id));
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{step.prompt || step.vietnamese}</Text>
        <Flex minH="58px" p="3" borderRadius="2xl" bg="#F8FCFF" border="1px dashed #7DD3FC" gap="2" wrap="wrap">
          {pickedTokens.length ? pickedTokens.map((token) => (
            <Tag
              as="button"
              type="button"
              key={token.id}
              data-testid="interactive-lesson-picked-word-token"
              data-token-id={token.id}
              size="lg"
              borderRadius="full"
              bg="#DBEAFE"
              color={COLORS.blue}
              cursor={answerLocked ? 'not-allowed' : 'pointer'}
              disabled={answerLocked}
              aria-disabled={answerLocked}
              onClick={() => onRemoveWord(token.id)}
              aria-label={`Bỏ từ ${token.text}`}
            >
              {token.text}
            </Tag>
          )) : <Text color={COLORS.muted} fontWeight="750">Chạm từ bên dưới để xếp câu...</Text>}
        </Flex>
        <Flex gap="2" wrap="wrap">
          {remainingTokens.map((token) => (
            <Button key={token.id} data-testid="interactive-lesson-word-token" data-token-id={token.id} borderRadius="full" onClick={() => onToggleWord(token.id)} isDisabled={answerLocked}>{token.text}</Button>
          ))}
        </Flex>
        <HStack gap="3" wrap="wrap">
          <Button borderRadius="full" variant="outline" onClick={() => onInputChange('')} isDisabled={answerLocked}>Làm lại</Button>
          <Button data-testid="interactive-lesson-check-button" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(pickedTokens.map((token) => token.text).join(' '))} isDisabled={answerLocked} _hover={{ bg: '#185BB2' }}>
            Kiểm tra
          </Button>
        </HStack>
      </VStack>
    );
  }

  if (step.type === 'speak_repeat') {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text}>{step.prompt}</Text>
        <Box p="4" borderRadius="2xl" bg="#F8FCFF" border="1px solid #BAE6FD">
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.blue}>{step.answer}</Text>
          {step.hint ? <Text mt="2" color={COLORS.muted} fontWeight="750">{step.hint}</Text> : null}
        </Box>
        <Text color={COLORS.muted} fontSize="sm" fontWeight="700">Đây là phần tự luyện nói; Poo chưa chấm phát âm tự động nên bước này không cộng vào số câu đúng.</Text>
        <HStack gap="3" wrap="wrap">
          <Button borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={() => speakEnglish(step.answer, true)}>Nghe chậm</Button>
          <Button data-testid="interactive-lesson-speak-done-button" borderRadius="full" leftIcon={<Icon as={Mic2} />} bg={COLORS.blue} color="white" onClick={() => onAnswer(step.answer || 'spoken')} _hover={{ bg: '#185BB2' }}>
            Mình đã nói xong
          </Button>
        </HStack>
      </VStack>
    );
  }

  if (step.type === 'lesson_tip') {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.18">{step.prompt || step.title}</Text>
        <Box p={{ base: '4', md: '5' }} borderRadius="2xl" bg="#F8FCFF" border="1px solid #BAE6FD">
          {(step.body || '').split('\n').filter(Boolean).map((line, index) => (
            <Text key={`${step.id}-line-${index}`} color={COLORS.text} fontWeight={index === 0 ? '850' : '700'} lineHeight="1.7" mt={index ? '2' : 0}>{line}</Text>
          ))}
        </Box>
        <Button data-testid="interactive-lesson-tip-continue-button" size="lg" alignSelf="start" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer('read')} _hover={{ bg: '#185BB2' }}>
          Đã hiểu, tiếp tục
        </Button>
      </VStack>
    );
  }

  if (step.type === 'mission_tracker') {
    const progress = getMissionProgress(step, lessonSteps, completedStepIds, stepOutcomes);
    const modeLabel = step.missionRequirement?.kind === 'correct' ? 'câu đúng' : 'hoạt động hoàn tất';
    const currentCount = step.missionRequirement?.kind === 'correct' ? progress.correct : progress.completed;
    return (
      <VStack align="stretch" gap="4" data-testid="interactive-lesson-mission-tracker" data-mission-met={progress.met ? 'true' : 'false'} data-mission-mode={step.missionRequirement?.kind ?? 'unconfigured'} data-mission-current={currentCount} data-mission-minimum={progress.minimum} data-mission-total={progress.total}>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.35">{step.prompt}</Text>
        {progress.configured ? (
          <>
            <HStack justify="space-between" p="4" borderRadius="2xl" bg={progress.met ? '#F0FDF4' : '#EFF6FF'} border="1px solid" borderColor={progress.met ? '#BBF7D0' : '#BFDBFE'}>
              <Text color={COLORS.text} fontWeight="900">Tiến độ nhiệm vụ</Text>
              <Tag borderRadius="full" colorScheme={progress.met ? 'green' : 'blue'} fontWeight="950">{currentCount}/{progress.minimum} {modeLabel}</Tag>
            </HStack>
            <VStack align="stretch" gap="2" data-testid="interactive-lesson-mission-targets">
              {progress.targets.map((target) => {
                const done = step.missionRequirement?.kind === 'correct' ? stepOutcomes[target.id] === true : completedStepIds.has(target.id);
                const attemptedWrong = step.missionRequirement?.kind === 'correct' && stepOutcomes[target.id] === false;
                return <HStack key={target.id} p="3" borderRadius="xl" bg="white" border="1px solid" borderColor={done ? '#BBF7D0' : attemptedWrong ? '#FED7AA' : COLORS.border}>
                  <Icon as={done ? CheckCircle2 : attemptedWrong ? XCircle : Sparkles} color={done ? COLORS.green : attemptedWrong ? COLORS.amber : COLORS.blue} />
                  <Text color={COLORS.text} fontWeight="750" fontSize="sm">{target.title}</Text>
                </HStack>;
              })}
            </VStack>
            <Text color={progress.met ? '#166534' : COLORS.muted} fontWeight="800" role="status" aria-live="polite">
              {progress.met ? 'Điều kiện nhiệm vụ đã đạt từ các hoạt động của bài.' : `Cần ${Math.max(0, progress.minimum - currentCount)} ${modeLabel} nữa để đạt điều kiện.`}
            </Text>
          </>
        ) : <Text color={COLORS.amber} fontWeight="800">Nhiệm vụ này chưa có điều kiện hoàn thành được gắn với hoạt động nguồn.</Text>}
        <Button data-testid="interactive-lesson-mission-continue-button" size="lg" alignSelf="start" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer('mission-result')} _hover={{ bg: '#185BB2' }}>
          Ghi nhận kết quả & tiếp tục
        </Button>
      </VStack>
    );
  }

  if (step.type === 'free_response') {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.18">{step.prompt}</Text>
        {step.phraseBank?.length ? (
          <Box p="4" borderRadius="2xl" bg="#F0F9FF" border="1px solid #BAE6FD">
            <Text fontSize="sm" fontWeight="900" color={COLORS.blue} mb="3">Thẻ cụm từ · chạm để ráp lời đáp</Text>
            <Flex gap="2" wrap="wrap">
              {step.phraseBank.map((phrase, index) => {
                const alreadyAdded = inputValue.includes(phrase);
                return (
                  <Button key={phrase} data-testid={`interactive-lesson-phrase-card-${index}`} size="sm" borderRadius="full" colorScheme={alreadyAdded ? 'green' : 'blue'} variant={alreadyAdded ? 'solid' : 'outline'} isDisabled={alreadyAdded} onClick={() => onInputChange(inputValue.trim() ? `${inputValue.trim()}\n${phrase}` : phrase)}>
                    {alreadyAdded ? '✓ ' : '+ '}{phrase}
                  </Button>
                );
              })}
            </Flex>
          </Box>
        ) : null}
        <Textarea data-testid="interactive-lesson-final-response" aria-label="Câu trả lời tiếng Anh" value={inputValue} onChange={(event) => onInputChange(event.target.value)} minH="140px" borderRadius="2xl" bg="white" borderColor={COLORS.border} placeholder={step.phraseBank?.length ? 'Các cụm đã chọn sẽ ghép ở đây. Bạn có thể tự sửa hoặc viết thêm.' : 'Viết hoặc phác thảo câu trả lời tiếng Anh của bạn...'} />
        {step.targetOutputs?.length && targetOutputsRevealed ? (
          <Box borderRadius="2xl" p="4" bg="#F8FCFF" border="1px solid #BAE6FD">
            <Text fontSize="sm" fontWeight="900" color={COLORS.blue}>Gợi ý để tự đối chiếu</Text>
            {step.targetOutputs.map((target) => <Text key={target} mt="1.5" color={COLORS.muted} fontWeight="700">• {target}</Text>)}
          </Box>
        ) : null}
        <Text color={COLORS.muted} fontSize="sm" fontWeight="700">Thử thách mở chưa được chấm tự động; tự kiểm tra câu trả lời theo mục tiêu bên trên.</Text>
        <Button data-testid="interactive-lesson-final-submit-button" size="lg" alignSelf="start" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => onAnswer(inputValue.trim())} isDisabled={!inputValue.trim()} _hover={{ bg: '#185BB2' }}>
          Đối chiếu với gợi ý
        </Button>
      </VStack>
    );
  }

  return null;
}

export function InteractiveLessonPage() {
  const { unitId, nodeId, lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = useMemo(() => {
    if (unitId) return getInteractiveLessonByUnit(unitId, nodeId);
    if (lessonId) return getInteractiveLessonByLessonId(lessonId);
    return null;
  }, [unitId, nodeId, lessonId]);
  const [bonusMode, setBonusMode] = useState(() => readBonusMode(lesson));
  const resumeStepIndex = useMemo(() => getResumeStepIndex(lesson, bonusMode), [lesson, bonusMode]);
  const [stepIndex, setStepIndex] = useState(() => resumeStepIndex);
  const [inputValue, setInputValue] = useState('');
  const [cardRevealed, setCardRevealed] = useState(false);
  const [targetOutputsRevealed, setTargetOutputsRevealed] = useState(false);
  const [pickedWordIds, setPickedWordIds] = useState<string[]>([]);
  const [rendererAttempt, setRendererAttempt] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation?: string; selfCheck?: boolean; missionMet?: boolean } | null>(null);
  const [savedRunState] = useState(() => getSavedRunState(lesson));
  const [reviewSessionId, setReviewSessionId] = useState(() => lesson ? getLessonProgress()[lesson.sourceLesson.id]?.reviewSessionId ?? '' : '');
  const [correctCount, setCorrectCount] = useState(savedRunState.correctCount);
  const [totalAnswered, setTotalAnswered] = useState(savedRunState.totalAnswered);
  const [selfCompletedCount, setSelfCompletedCount] = useState(savedRunState.selfCompletedCount);
  const [weakItems, setWeakItems] = useState<InteractiveLessonStep[]>(savedRunState.weakItems);
  const [recordedSteps, setRecordedSteps] = useState<Set<string>>(savedRunState.recordedSteps);
  const [result, setResult] = useState<InteractiveLessonResult | null>(null);
  const runSteps = useMemo(() => lesson ? getRunSteps(lesson, weakItems, bonusMode) : [], [lesson, weakItems, bonusMode]);

  const fillBlankInputRef = useRef<HTMLInputElement>(null);
  const lessonCardRef = useRef<HTMLDivElement>(null);
  const feedbackActionsRef = useRef<HTMLDivElement>(null);
  const hasShownFirstStep = useRef(false);

  useEffect(() => {
    if (lesson) setReviewSessionId(startInteractiveLesson(lesson));
  }, [lesson]);

  useEffect(() => {
    if (!lesson) return;
    const saved = getSavedRunState(lesson);
    const savedBonusMode = readBonusMode(lesson);
    setBonusMode(savedBonusMode);
    setStepIndex(getResumeStepIndex(lesson, savedBonusMode));
    setCorrectCount(saved.correctCount);
    setTotalAnswered(saved.totalAnswered);
    setSelfCompletedCount(saved.selfCompletedCount);
    setWeakItems(saved.weakItems);
    setRecordedSteps(saved.recordedSteps);
    setResult(null);
  }, [lesson?.id]);

  const step = runSteps[stepIndex];
  const answerLocked = Boolean(feedback?.correct && !feedback.selfCheck && (
    feedback.missionMet === true ||
    (feedback.missionMet === undefined && (isScoredInteractiveStep(step.type) || step.type === 'flashcard'))
  ));
  const persistedStepOutcomes = lesson ? getLessonProgress()[lesson.sourceLesson.id]?.stepOutcomes ?? {} : {};
  const firstCompletionXp = lesson && getLessonProgress()[lesson.sourceLesson.id]?.status === 'completed' ? 0 : lesson?.xp ?? 0;
  const progress = lesson ? Math.round(((stepIndex + 1) / runSteps.length) * 100) : 0;

  useEffect(() => {
    setFeedback(null);
    setInputValue('');
    setPickedWordIds([]);
    setCardRevealed(false);
    setTargetOutputsRevealed(false);
    if (hasShownFirstStep.current) {
      window.requestAnimationFrame(() => lessonCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } else {
      hasShownFirstStep.current = true;
    }
  }, [stepIndex]);

  useEffect(() => {
    if ((step?.type !== 'fill_blank' && step?.type !== 'speed_recall') || feedback) return;
    const focusTimer = window.setTimeout(() => fillBlankInputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [feedback, step?.id, step?.type]);

  useEffect(() => {
    if (!feedback) return;
    const frame = window.requestAnimationFrame(() => {
      feedbackActionsRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [feedback]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName.toLowerCase();
        if (tagName === 'textarea' || tagName === 'select' || target.isContentEditable) return;
      }
      if (!step || step.type === 'summary') return;
      if (feedback) {
        event.preventDefault();
        handleContinue();
        return;
      }
      if (step.type !== 'fill_blank' && step.type !== 'speed_recall' && step.type !== 'free_response' || !inputValue.trim()) return;
      event.preventDefault();
      handleAnswer(inputValue);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [feedback, inputValue, step]);

  if (!lesson || !step) {
    return (
      <OceanPageShell data-testid="interactive-lesson-unavailable-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px="4" py="8">
        <Box maxW="760px" mx="auto" className="penglish-glass-card" bg="rgba(255,255,255,0.86)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" data-testid="interactive-lesson-unavailable-state">
          <PooSystemState
            variant="error"
            title="Poo chưa mở được bài này"
            description="Bài này đang được chuẩn bị nội dung hoặc đường dẫn đã thay đổi. Hãy quay lại lộ trình để chọn bài đang mở."
            actionLabel="Quay lại lộ trình"
            actionTo="/learning-path"
          />
        </Box>
      </OceanPageShell>
    );
  }

  const handleAnswer = (answer: string) => {
    if (step.type === 'summary' || answerLocked) return;
    if (step.type === 'free_response') setTargetOutputsRevealed(true);
    const missionProgress = step.type === 'mission_tracker' ? getMissionProgress(step, lesson.steps, recordedSteps, persistedStepOutcomes) : undefined;
    const correct = isInteractiveAnswerCorrect(step, answer);
    const firstAttempt = !recordedSteps.has(step.id);
    if (firstAttempt) {
      // Chỉ lưu kết quả một lần để làm lại không bị lặp trong ôn tập / XP.
      setRecordedSteps((seen) => new Set(seen).add(step.id));
      // Thẻ từ, bài nói, phần hướng dẫn và thử thách mở không được giả làm bài chấm điểm.
      if (!step.reviewOfStepId) {
        if (step.type === 'flashcard' || step.type === 'speak_repeat' || step.type === 'shadowing' || step.type === 'lesson_tip' || step.type === 'free_response' || step.type === 'mission_tracker') {
          setSelfCompletedCount((value) => value + 1);
          if (step.type === 'flashcard' && !correct) setWeakItems((items) => [...items, step]);
        } else if (step.type !== 'intro') {
          setTotalAnswered((value) => value + 1);
          if (correct) setCorrectCount((value) => value + 1);
          if (!correct) setWeakItems((items) => [...items, step]);
        }
      }
    }
    // Repeated attempts must update review state so a correct retry can clear a saved mistake.
    recordInteractiveStep(lesson, step, correct, answer, firstAttempt, reviewSessionId);
    let wrongAnswerGuidance = '';
    if (!correct) {
      const wrongAction = lesson.sourceLesson.reviewPolicy.wrongAnswerAction;
      if (wrongAction === 'show-reading-evidence') {
        wrongAnswerGuidance = 'Quay lại đoạn đọc và tìm câu làm bằng chứng cho đáp án.';
      } else if (wrongAction === 'show-explanation-and-retry') {
        wrongAnswerGuidance = 'Đọc giải thích rồi thử lại câu này trước khi sang nhiệm vụ khác.';
      } else if (wrongAction === 'replay-slow-with-transcript' && step.type === 'listen_choose') {
        wrongAnswerGuidance = `Nghe lại chậm. Lời thoại: ${step.english || step.answer || ''}`;
        speakEnglish(step.english || step.answer, true, step.speechLang, 0.68);
      } else if (wrongAction === 'repeat-context-phrases') {
        wrongAnswerGuidance = lesson.sourceLesson.reviewRules.priorityRule;
      } else if (wrongAction === 'same-session-recall') {
        wrongAnswerGuidance = 'Cụm vừa vấp sẽ quay lại trong phần ôn cuối bài.';
      }
    }
    const selfCheck = step.type === 'free_response';
    const correctAnswer = (step.answer || 'hãy nghe/đọc lại mẫu').replace(/[.!?]+$/, '');
    const answerFeedback = missionProgress
      ? missionProgress.configured
        ? missionProgress.met
          ? `Đã đạt điều kiện: ${missionProgress.correct}/${missionProgress.total} câu đúng hoặc ${missionProgress.completed}/${missionProgress.total} hoạt động hoàn tất.`
          : `Chưa đạt điều kiện: ${missionProgress.correct}/${missionProgress.total} câu đúng hoặc ${missionProgress.completed}/${missionProgress.total} hoạt động hoàn tất. Bạn vẫn có thể xem lại phần luyện trong vòng thưởng.`
        : 'Nhiệm vụ chưa có điều kiện hoàn thành được nối với hoạt động nguồn.'
      : selfCheck
      ? 'Phần này không chấm đúng sai. Hãy so sánh câu của bạn với các ví dụ nguồn và tự sửa nếu cần.'
      : correct ? step.explanation ?? '' : `Đáp án đúng: ${correctAnswer}. ${step.explanation || ''} ${wrongAnswerGuidance}`;
    setFeedback({ correct, explanation: answerFeedback.trim(), selfCheck, missionMet: missionProgress?.met ?? (step.type === 'mission_tracker' ? false : undefined) });
  };

  const handleMatchPairResult = (pairId: string, correct: boolean) => {
    if (!lesson || !step || answerLocked) return;
    markItemReviewed(
      lesson.sourceLesson.id,
      pairId,
      'match',
      correct ? 'correct' : 'wrong',
      lesson.sourceLesson.reviewPolicy.wrongAnswerDelayMinutes,
      reviewSessionId,
      !step.reviewOfStepId,
    );
  };

  const handleContinue = () => {
    if (stepIndex >= runSteps.length - 2) {
      const completed = completeInteractiveLesson(lesson, correctCount, totalAnswered, weakItems);
      if (bonusMode) {
        try { window.localStorage.removeItem(getBonusModeKey(lesson)); } catch { /* Optional bonus can still finish without storage. */ }
      }
      setResult(completed);
      setStepIndex(runSteps.length - 1);
      return;
    }
    setStepIndex((value) => value + 1);
  };

  const handleRetry = () => {
    setFeedback(null);
    setInputValue('');
    setPickedWordIds([]);
    setRendererAttempt((attempt) => attempt + 1);
  };

  const handleToggleWord = (tokenId: string) => {
    if (answerLocked) return;
    setFeedback(null);
    setPickedWordIds((tokenIds) => tokenIds.includes(tokenId) ? tokenIds : [...tokenIds, tokenId]);
  };

  const handleRemoveWord = (tokenId: string) => {
    if (answerLocked) return;
    setFeedback(null);
    setPickedWordIds((tokenIds) => tokenIds.filter((id) => id !== tokenId));
  };

  const handleInputChange = (value: string) => {
    if (answerLocked) return;
    setFeedback(null);
    setInputValue(value);
    if (step.type === 'sentence_order' && value === '') setPickedWordIds([]);
  };

  if (step.type === 'summary') {
    const bonusStepCount = lesson.steps.filter((candidate) => candidate.optionalBonus).length;
    const safeResult: InteractiveLessonResult = result ?? {
      lessonId: lesson.sourceLesson.id,
      unitId: lesson.unitId,
      xp: 0,
      correctCount,
      totalAnswered,
      weakItems,
    };
    const savedProgress = getLessonProgress()[lesson.sourceLesson.id];
    const criteriaProgress = getInteractiveLessonCriteriaProgress(
      lesson,
      savedProgress?.completedSteps ?? [],
      savedProgress?.stepOutcomes ?? {},
    );
    const criteriaMetCount = criteriaProgress.filter((item) => item.met).length;
    return (
      <OceanPageShell data-testid="interactive-lesson-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '3', md: '6' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 96px)', lg: '8' }}>
        <Box maxW="860px" mx="auto">
          <Box className="penglish-glass-card" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '5', md: '8' }} textAlign="center">
            <Flex justify="center" mb="4"><OceanMascot mascot="poo" pose="reward" size="lg" decorative motion="celebrate" /></Flex>
            <Tag borderRadius="full" bg="#FEF3C7" color="#B45309" px="4" py="2" fontWeight="950"><Icon as={Zap} boxSize="4" /> +{safeResult.xp} XP</Tag>
            <Text mt="4" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.05">{bonusMode ? 'Hoàn thành vòng thưởng!' : 'Hoàn thành nhiệm vụ chính!'}</Text>
            <Text mt="3" color={COLORS.muted} fontWeight="750" lineHeight="1.7">{bonusMode ? 'Bạn đã chinh phục thêm phần luyện tập của bài.' : 'Poo đã lưu tiến độ. Các câu sai đã được đưa vào Khu luyện tập/Sổ tay từ vựng.'}</Text>
            {!bonusMode && bonusStepCount > 0 ? (
              <Box mt="5" p="4" borderRadius="2xl" bg="linear-gradient(120deg, #EFF6FF, #F0FDFA)" border="1px solid #BAE6FD" textAlign="left" data-testid="interactive-lesson-bonus-card">
                <Text fontWeight="950" color={COLORS.text}>Mở vòng luyện thêm</Text>
                <Text mt="1" fontSize="sm" color={COLORS.muted} fontWeight="700">Còn {bonusStepCount} thử thách tùy chọn từ ngân hàng bài này. Hoàn thành để chạm thêm các mốc từ vựng, nghe và phản xạ.</Text>
                <Button data-testid="interactive-lesson-start-bonus" mt="3" minH="44px" borderRadius="full" bg={COLORS.blue} color="white" onClick={() => {
                  try { window.localStorage.setItem(getBonusModeKey(lesson), '1'); } catch { /* The bonus remains available for this session. */ }
                  const coreStepCount = lesson.steps.slice(0, -1).filter((candidate) => !candidate.optionalBonus).length;
                  setBonusMode(true);
                  setResult(null);
                  setStepIndex(coreStepCount);
                }} _hover={{ bg: '#185BB2' }}>Chơi vòng thưởng</Button>
              </Box>
            ) : null}
            <SimpleGrid columns={{ base: 1, md: selfCompletedCount > 0 ? 4 : 3 }} gap="3" mt="6">
              <Box p="4" borderRadius="2xl" bg="#EFF6FF" border="1px solid #BFDBFE"><Text fontWeight="950" color={COLORS.blue}>{safeResult.totalAnswered ? `${safeResult.correctCount}/${safeResult.totalAnswered}` : '—'}</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">{safeResult.totalAnswered ? 'Đáp án đúng' : 'Không có câu chấm điểm'}</Text></Box>
              {selfCompletedCount > 0 ? <Box p="4" borderRadius="2xl" bg="#E0F2FE" border="1px solid #BAE6FD"><Text fontWeight="950" color="#0369A1">{selfCompletedCount}</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">Số bước tự đánh dấu</Text></Box> : null}
              <Box p="4" borderRadius="2xl" bg="#F0FDF4" border="1px solid #BBF7D0"><Text fontWeight="950" color={COLORS.green}>{safeResult.weakItems.length}</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">Câu sai lần đầu</Text></Box>
              <Box p="4" borderRadius="2xl" bg="#FFFBEB" border="1px solid #FDE68A"><Text fontWeight="950" color="#B45309">{lesson.duration}</Text><Text fontSize="sm" color={COLORS.muted} fontWeight="800">Thời lượng dự kiến</Text></Box>
            </SimpleGrid>
            <Box mt="6" textAlign="left" p={{ base: '4', md: '5' }} borderRadius="2xl" bg="#F8FCFF" border="1px solid #BAE6FD" data-testid="interactive-lesson-criteria">
              <Flex justify="space-between" align="center" gap="3" wrap="wrap" mb="1">
                <Text fontWeight="950" color={COLORS.text}>Mục tiêu màn chơi</Text>
                <Tag borderRadius="full" bg={criteriaMetCount === criteriaProgress.length ? '#DCFCE7' : '#FEF3C7'} color={criteriaMetCount === criteriaProgress.length ? '#166534' : '#92400E'} fontWeight="900">
                  {criteriaMetCount}/{criteriaProgress.length} mốc đạt
                </Tag>
              </Flex>
              <Text mb="4" fontSize="sm" color={COLORS.muted} fontWeight="700">
                {criteriaMetCount === criteriaProgress.length ? 'Tuyệt! Bạn đã chạm mọi mốc của bài.' : bonusMode ? 'Vòng thưởng đã xong; các mốc còn thiếu cần thêm lượt đúng ở Khu luyện tập.' : 'Nhiệm vụ chính đã hoàn thành; vòng thưởng giúp bạn chạm thêm các mốc của bài.'}
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                {criteriaProgress.map((item) => (
                  <Box key={item.key} p="3" borderRadius="xl" bg="white" border="1px solid" borderColor={item.met ? '#BBF7D0' : '#E2E8F0'}>
                    <Flex justify="space-between" gap="2" mb="2" align="center">
                      <Text fontSize="sm" fontWeight="850" color={COLORS.text}>{item.label}</Text>
                      <Text fontSize="sm" fontWeight="950" color={item.met ? '#15803D' : '#64748B'}>{item.current}/{item.minimum}{item.met ? ' ✓' : ''}</Text>
                    </Flex>
                    <Progress value={item.minimum ? Math.min(100, item.current / item.minimum * 100) : 100} size="xs" borderRadius="full" colorScheme={item.met ? 'green' : 'blue'} bg="#E2E8F0" aria-label={`${item.label}: ${item.current} trên ${item.minimum}`} />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
            <HStack justify="center" mt="7" gap="3" wrap="wrap">
              <Button as={Link} to="/practice" borderRadius="full" bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }}>Ôn trong Khu luyện tập</Button>
              <Button as={Link} to="/words" borderRadius="full" variant="outline">Xem Sổ tay từ vựng</Button>
              <Button borderRadius="full" variant="ghost" onClick={() => navigate('/learning-path')}>Về lộ trình</Button>
            </HStack>
          </Box>
        </Box>
      </OceanPageShell>
    );
  }

  return (
    <OceanPageShell data-testid="interactive-lesson-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '2', md: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 104px)', lg: '8' }} overflowX="hidden">
      <Box maxW="920px" mx="auto">
        <HStack mb="3" justify="space-between" gap="3">
          <Button as={Link} to="/learning-path" size="sm" borderRadius="full" variant="ghost" leftIcon={<Icon as={ArrowLeft} />}>Lộ trình</Button>
          <Tag borderRadius="full" bg="#EFF6FF" color={COLORS.blue} px="3" py="1.5" fontWeight="950">{lesson.level}</Tag>
        </HStack>
        <Box ref={lessonCardRef} scrollMarginTop="16px" className="penglish-glass-card" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '4', md: '6' }} boxShadow="0 18px 46px rgba(31,111,214,0.10)">
          <HStack justify="space-between" align="start" gap="4" mb="4">
            <Box minW="0">
              <Text fontSize="sm" fontWeight="950" color={COLORS.blue} textTransform="uppercase" letterSpacing="0.12em">Bài học tương tác</Text>
              <Text fontSize={{ base: 'xl', md: '3xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.12">{lesson.title}</Text>
              <Text mt="1" color={COLORS.muted} fontWeight="700">{lesson.duration} · +{firstCompletionXp} XP trong lần học này</Text>
            </Box>
            <LessonStepMascot stepType={step.type} feedbackCorrect={feedback?.selfCheck ? null : step.type === 'mission_tracker' ? (feedback?.missionMet ? true : null) : feedback?.correct ?? null} />
          </HStack>
          <Progress value={progress} size="sm" borderRadius="full" colorScheme="blue" bg="#E0F2FE" mb="5" />
          {resumeStepIndex > 0 ? (
            <Box mb="4" p="3" borderRadius="2xl" bg="#F0FDF4" border="1px solid #BBF7D0">
              <HStack gap="2" align="start">
                <Icon as={RotateCcw} color={COLORS.green} boxSize="5" mt="0.5" />
                <Text color="#166534" fontWeight="800">Poo đã lưu bài trước: mình học tiếp từ màn {stepIndex + 1} nhé!</Text>
              </HStack>
            </Box>
          ) : null}
          <Box data-testid="interactive-lesson-card" data-optional-bonus={step.optionalBonus ? 'true' : 'false'} p={{ base: '3', md: '5' }} borderRadius="3xl" bg="linear-gradient(135deg, rgba(248,252,255,0.86), rgba(255,255,255,0.92))" border="1px solid #BAE6FD">
            <HStack mb="3" gap="2" wrap="wrap">
              <Tag borderRadius="full" bg="#E0F2FE" color="#0369A1" fontWeight="950"><Icon as={Sparkles} boxSize="4" /> Màn {stepIndex + 1}/{runSteps.length}</Tag>
              {step.reviewOfStepId ? <Tag borderRadius="full" bg="#FEF3C7" color="#92400E" fontWeight="900">Lượt ôn · không đổi điểm lần đầu</Tag> : null}
            </HStack>
            <Text mb="2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>{step.title}</Text>
            <Text mb="5" color={COLORS.muted} fontWeight="750" lineHeight="1.65">{step.instruction}</Text>
            {step.learningTips?.length ? (
              <Box as="details" data-testid="interactive-lesson-learning-tips" mb="4" p="3" borderRadius="xl" bg="#F8FCFF" border="1px solid #BAE6FD">
                <Box as="summary" cursor="pointer" minH="40px" display="flex" alignItems="center" color={COLORS.blue} fontWeight="850" sx={{ textWrap: 'pretty' }}>
                  Poo có {step.learningTips.length} mẹo cho nhiệm vụ này
                </Box>
                <VStack align="stretch" gap="3" mt="3">
                  {step.learningTips.map((tip) => (
                    <Box key={tip.id} pl="3" borderLeft="3px solid #7DD3FC">
                      {tip.title !== 'Poo nhắc nhỏ' ? <Text color={COLORS.text} fontWeight="850">{tip.title}</Text> : null}
                      <Text mt="1" color={COLORS.muted} lineHeight="1.65">{tip.body}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            ) : null}
            <StepRenderer key={`${step.id}:${rendererAttempt}`} step={step} pickedWordIds={pickedWordIds} inputValue={inputValue} fillBlankInputRef={fillBlankInputRef} cardRevealed={cardRevealed} targetOutputsRevealed={targetOutputsRevealed} answerLocked={answerLocked} onInputChange={handleInputChange} onAnswer={handleAnswer} onToggleWord={handleToggleWord} onRemoveWord={handleRemoveWord} onRevealCard={() => setCardRevealed(true)} onMatchPairResult={handleMatchPairResult} lessonTitle={lesson.title} lessonLevel={lesson.level} lessonSteps={lesson.steps} completedStepIds={recordedSteps} stepOutcomes={persistedStepOutcomes} />
            {feedback ? <FeedbackBox correct={feedback.correct} explanation={feedback.explanation} selfCheck={feedback.selfCheck} missionMet={feedback.missionMet} /> : null}
            {feedback ? (
              <HStack ref={feedbackActionsRef} data-testid="interactive-lesson-feedback-actions" mt="4" gap="3" wrap="wrap">
                <Button data-testid="interactive-lesson-continue-button" w={{ base: '100%', md: 'auto' }} size="lg" borderRadius="full" bg={COLORS.green} color="white" onClick={handleContinue} _hover={{ bg: '#15803D' }}>
                  Tiếp tục
                </Button>
                {!feedback.correct && !feedback.selfCheck ? (
                  <Button data-testid="interactive-lesson-retry-button" w={{ base: '100%', md: 'auto' }} size="lg" borderRadius="full" variant="outline" leftIcon={<Icon as={RotateCcw} />} onClick={handleRetry}>
                    Thử lại
                  </Button>
                ) : null}
              </HStack>
            ) : null}
          </Box>
        </Box>
      </Box>
    </OceanPageShell>
  );
}
