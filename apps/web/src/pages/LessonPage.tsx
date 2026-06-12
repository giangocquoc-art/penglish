import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Box, Button, Flex, HStack, Icon, IconButton, Progress, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, BookOpen, CheckCircle2, Headphones, MessageCircle, Mic2, Play, Volume2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { RevealAnswer } from '../components/lesson/RevealAnswer';
import { LearningHeartsBadge } from '../components/learning/LearningHeartsBadge';
import { getLearningHeartsState, getLockRemainingText, isLearningLocked, LEARNING_HEARTS_UPDATED_EVENT, OUT_OF_BUBBLES_MESSAGE, type LearningHeartsState } from '../lib/p-english/learning-hearts';
import { getLessonById, type QuizQuestion } from '../lib/p-english/lesson-content-data';
import { calculateLessonProgressSummary, getAvailableLessonProgressModes, markLessonCompleted, markLessonStarted, markLessonStepCompleted, readLessonProgress, type LessonProgress } from '../lib/p-english/lesson-progress';
import { getPracticeRecommendation } from '../lib/p-english/practiceRecommendationEngine';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { getPracticeModeLabel } from '../components/p-english/DynamicGuidedLessonFlow';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { createCardEntrance, safeGsapSet } from '../lib/animations/gsap-utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
  green: '#22C55E',
  amber: '#F59E0B',
  border: '#E2E8F0',
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

function SpeakButton({ text, label = 'Nghe' }: { text: string; label?: string }) {
  return (
    <IconButton
      aria-label={label}
      icon={<Icon as={Volume2} />}
      size="sm"
      borderRadius="full"
      color={COLORS.primary}
      bg="#EFF6FF"
      _hover={{ bg: '#DBEAFE' }}
      onClick={() => speakEnglish(text)}
    />
  );
}

function answerToText(answer: QuizQuestion['answer']) {
  return Array.isArray(answer) ? answer.join(', ') : answer;
}

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [heartsState, setHeartsState] = useState<LearningHeartsState>(() => getLearningHeartsState());
  const [activeLessonSection, setActiveLessonSection] = useState(0);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const refreshProgress = () => {
      setProgress(lessonId ? readLessonProgress(lessonId) : null);
    };

    refreshProgress();
    window.addEventListener('focus', refreshProgress);
    return () => window.removeEventListener('focus', refreshProgress);
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

  const progressSummary = useMemo(() => (lesson ? calculateLessonProgressSummary(progress, lesson) : null), [lesson, progress]);
  const availableModes = useMemo(() => (lesson ? getAvailableLessonProgressModes(lesson) : []), [lesson]);
  const practiceRecommendation = useMemo(() => (lesson ? getPracticeRecommendation(lesson, progress) : null), [lesson, progress]);
  const finalPracticeModes = (practiceRecommendation?.orderedModes.length ? practiceRecommendation.orderedModes : availableModes).slice(0, 4);

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;

      const topProgress = page.querySelector('.lesson-top-progress');
      const finalChallenge = page.querySelector('.lesson-final-challenge');

      if (reducedMotion) {
        safeGsapSet([topProgress, finalChallenge].filter(Boolean), { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        return;
      }

      if (topProgress) {
        gsap.fromTo(topProgress, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power2.out', force3D: true });
      }

      if (finalChallenge) {
        createCardEntrance([finalChallenge], { y: 12, duration: 0.36, delay: 0.08 });
      }
    },
    { scope: pageRef, dependencies: [lesson?.id, activeLessonSection, reducedMotion], revertOnUpdate: true },
  );

  useEffect(() => {
    if (!lesson) return;
    markLessonStarted(lesson.id, lesson.unitId);
  }, [lesson]);

  useEffect(() => {
    if (lesson && progressSummary && progressSummary.overallPercentage >= 100) {
      markLessonCompleted(lesson.id, lesson.unitId);
    }
  }, [lesson, progressSummary]);

  if (!lesson) {
    return (
      <Box bg="linear-gradient(180deg, #DDF5FF 0%, #F8FCFF 48%, #FFFFFF 100%)" minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="920px" mx="auto" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="8" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)">
          <Button as={Link} to="/home" leftIcon={<Icon as={ArrowLeft} />} variant="ghost" mb="5">
            Về trang chủ
          </Button>
          <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>Không tìm thấy bài học</Text>
          <Text mt="2" color={COLORS.muted}>Poo chưa tìm thấy nội dung bài học này.</Text>
        </Box>
      </Box>
    );
  }

  const firstListening = lesson.listeningPractice[0];
  const firstQuiz = lesson.quizQuestions[0];
  const learningLocked = isLearningLocked(heartsState);
  const lessonSections = [
    { id: 'listừ vựnghe', icon: Headphones, guide: 'Nghe trước nhé.', task: 'Bấm nghe một câu mẫu. Chỉ cần nghe, chưa cần nhớ hết.' },
    { id: 'understand', vi: 'Hiểu', icon: BookOpen, guide: 'Nhìn nghĩa thật chậm.', task: 'Đọc 3 cụm đầu từ vựnghĩa tiếng Việt.' },
    { id: 'practice', vi: 'Luyện', icon: MessageCircle, guide: 'Thử ghép câu ngắn.', task: 'Đọc mẫu câu chính, rồi thay bằng tên của bạn.' },
    { id: 'speak', vi: 'Nói', icon: Mic2, guide: 'Thử nói lại nào.', task: 'Nói theo hội thoại mẫu một lần thật chậm.' },
    { id: 'quick-check', vi: 'Thử sức', icon: Play, guide: 'Chọn một câu trả lời thôi.', task: 'Làm nhanh một câu để Poo xem bạn đã hiểu đến đâu.' },
    { id: 'finish', vi: 'Hoàn tất', icon: CheckCircle2, guide: 'Giỏi lắm, lưu bài nhé.', task: 'Lưu tiến độ, rồi chọn luyện thêm nếu muốn.' },
  ];
  const lessonSectionProgress = ((activeLessonSection + 1) / lessonSections.length) * 100;
  const activeLessonSectionMeta = lessonSections[activeLessonSection];
  const canGoPreviousLessonSection = activeLessonSection > 0;
  const canGoNextLessonSection = activeLessonSection < lessonSections.length - 1;
  const completeCurrentLessonSection = () => markLessonStepCompleted(lesson.id, activeLessonSectionMeta.id);
  const goPreviousLessonSection = () => setActiveLessonSection((current) => Math.max(0, current - 1));
  const goNextLessonSection = () => {
    completeCurrentLessonSection();
    setActiveLessonSection((current) => Math.min(lessonSections.length - 1, current + 1));
  };
  const completeLesson = () => {
    completeCurrentLessonSection();
    markLessonCompleted(lesson.id, lesson.unitId);
  };

  return (
    <OceanPageShell data-testid="lesson-mobile-root" ref={pageRef} variant="dashboard" ambientWhalePreset="lesson" overlayStrength="medium" glassIntensity="clear" minH="calc(100vh - 72px)" px={{ base: '3', md: '6' }} pt={{ base: '2', md: '0' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 168px)', lg: '12' }} overflowX="hidden" sx={{ scrollPaddingBottom: 'calc(var(--penglish-mobile-safe-bottom) + 168px)' }}>
      <Box maxW="920px" mx="auto" minW="0" pb={{ base: '176px', md: '0' }}>
        <HStack py={{ base: '2', md: '5' }} gap="2" color={COLORS.muted} fontSize="sm" wrap="wrap" display={{ base: 'none', sm: 'flex' }}>
          <Link to="/home">Trang chủ</Link>
          <Text>/</Text>
          <Text>{lesson.unitTitle}</Text>
        </HStack>

        <Box data-testid="lesson-top-progress" className="lesson-top-progress penglish-glass-card" bg="rgba(255,255,255,0.76)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '4' }} mb="3" boxShadow="0 10px 24px rgba(31,111,214,0.06)">
          <HStack justify="space-between" align="start" gap="3" mb="2.5">
            <Box minW="0">
              <Text color={COLORS.primary} fontWeight="800" fontSize="xs" letterSpacing="0.08em" textTransform="uppercase">Bước {activeLessonSection + 1}/{lessonSections.length}</Text>
              <Text as="h1" color={COLORS.text} fontWeight="800" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.15" noOfLines={1}>{lesson.titleVi}</Text>
              <Text color={COLORS.muted} fontWeight="700" fontSize="sm" noOfLines={1}>{activeLessonSectionMeta.guide}</Text>
            </Box>
            <Text color={COLORS.primary} fontWeight="800" flexShrink={0}>{Math.round(lessonSectionProgress)}%</Text>
          </HStack>
          <Progress value={lessonSectionProgress} colorScheme="blue" bg="#E2E8F0" borderRadius="full" h="7px" />
          {learningLocked ? <Box mt="3"><LearningLockedLessonNotice state={heartsState} /></Box> : null}
        </Box>

        <VStack data-testid="lesson-active-step" align="stretch" gap={{ base: '3', md: '4' }} scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 168px)">

          {activeLessonSection === 0 ? (
            <StepShell icon={Headphones} title="Bước 1: Nghe" helperLabel="Nghe" task="Nghe câu mẫu trước. Chưa cần dịch ngay.">
              {firstListening ? (
                <VStack align="stretch" gap="3">
                  <Text color={COLORS.text} fontWeight="700" fontSize={{ base: 'lg', md: 'xl' }}>{firstListening.text}</Text>
                  <Button onClick={() => speakEnglish(firstListening.text)} bg={COLORS.primary} color="white" borderRadius="full" leftIcon={<Icon as={Volume2} />} alignSelf="start" _hover={{ bg: '#1D4ED8' }}>Nghe câu này</Button>
                  <Box as="details" bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="3">
                    <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.primary}>Poo giải thích thêm</Box>
                    <Text mt="2" color={COLORS.muted}>{firstListening.question}</Text>
                    <RevealAnswer><Text fontWeight="700">{firstListening.answer}</Text></RevealAnswer>
                  </Box>
                </VStack>
              ) : <Text color={COLORS.muted}>Bài này chưa có câu nghe mẫu.</Text>}
            </StepShell>
          ) : null}

          {activeLessonSection === 1 ? (
            <StepShell icon={BookOpen} title="Bước 2: Hiểu" helperLabel="Hiểu" task="Nhìn 3 cụm quan trọng nhấtừ vựnghĩa tiếng Việt.">
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
                {lesson.vocabulary.slice(0, 3).map((item) => (
                  <Box key={item.id} bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4">
                    <HStack justify="space-between" align="start" gap="2">
                      <Box minW="0">
                        <Text color={COLORS.text} fontWeight="700" fontSize="lg">{item.term}</Text>
                        <Text color={COLORS.primary} fontWeight="700">{item.meaningVi}</Text>
                      </Box>
                      <SpeakButton text={item.term} />
                    </HStack>
                    <Box as="details" mt="3">
                      <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.muted} fontSize="sm">Poo giải thích thêm</Box>
                      <Text mt="2" color={COLORS.text}>{item.example}</Text>
                      <Text color={COLORS.muted} fontSize="sm">{item.exampleMeaningVi}</Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </StepShell>
          ) : null}

          {activeLessonSection === 2 ? (
            <StepShell icon={MessageCircle} title="Bước 3: Luyện" helperLabel="Luyện" task="Đọc một mẫu câu, rồi thử thay bằng tên của bạn.">
              {lesson.sentencePatterns[0] ? (
                <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4">
                  <Text color={COLORS.text} fontWeight="700" fontSize="xl">{lesson.sentencePatterns[0].pattern}</Text>
                  <Button mt="3" onClick={() => speakEnglish(lesson.sentencePatterns[0].examples[0]?.text ?? lesson.sentencePatterns[0].pattern)} borderRadius="full" bg={COLORS.primary} color="white" leftIcon={<Icon as={Volume2} />}>Nghe mẫu</Button>
                  <Box as="details" mt="4" bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="3">
                    <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.primary}>Poo giải thích thêm</Box>
                    <Text mt="2" color={COLORS.muted} fontWeight="600">{lesson.sentencePatterns[0].vietnameseExplanation}</Text>
                    <VStack align="stretch" gap="2" mt="2">
                      {lesson.sentencePatterns[0].examples.map((example) => <Text key={example.text} color={COLORS.text}>{example.text} · <Text as="span" color={COLORS.muted}>{example.meaningVi}</Text></Text>)}
                    </VStack>
                  </Box>
                </Box>
              ) : null}
            </StepShell>
          ) : null}

          {activeLessonSection === 3 ? (
            <StepShell icon={Mic2} title="Bước 4: Nói" helperLabel="Nói" task="Nói lại hội thoại mẫu một lần thật chậm.">
              {lesson.miniDialogues[0] ? (
                <Box bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4">
                  <HStack justify="space-between" align="start" gap="3">
                    <Text color={COLORS.text} fontWeight="700" fontSize="lg">{lesson.miniDialogues[0].title}</Text>
                    <SpeakButton text={lesson.miniDialogues[0].lines.map((line) => line.text).join(' ')} label="Nghe hội thoại" />
                  </HStack>
                  <VStack align="stretch" gap="2" mt="3">
                    {lesson.miniDialogues[0].lines.slice(0, 2).map((line, index) => (
                      <Box key={`${lesson.miniDialogues[0].id}-${index}`} bg={line.speaker === 'A' ? '#EFF6FF' : '#F0FDF4'} borderRadius="xl" p="3">
                        <Text color={line.speaker === 'A' ? COLORS.primary : '#15803D'} fontWeight="700">{line.speaker}: {line.text}</Text>
                        <Text color={COLORS.muted} fontSize="sm">{lesson.miniDialogues[0].vietnameseTranslation[index]}</Text>
                      </Box>
                    ))}
                  </VStack>
                  <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=shadowing`} mt="4" borderRadius="full" variant="outline" color={COLORS.green} borderColor="#BBF7D0">Mở luyện nói</Button>
                </Box>
              ) : null}
            </StepShell>
          ) : null}

          {activeLessonSection === 4 ? (
            <StepShell icon={Play} title="Bước 5: Thử sức nhẹ" helperLabel="Thử sức nhẹ" task="Tự trả lời một câu ngắn, rồi mở đáp án.">
              {firstQuiz ? (
                <PreviewCard title={firstQuiz.question ?? firstQuiz.prompt ?? firstQuiz.vietnamese ?? 'Câu thử sức nhẹ'} prompt={firstQuiz.options ? firstQuiz.options.join(' • ') : firstQuiz.words?.join(' / ') ?? 'Tự trả lời trước khi mở đáp án.'}>
                  <Text fontWeight="700">{answerToText(firstQuiz.answer)}</Text>
                  {firstQuiz.explanationVi ? <Text fontSize="sm" color={COLORS.muted}>{firstQuiz.explanationVi}</Text> : null}
                </PreviewCard>
              ) : null}
              <Button as={Link} to={`/practice?lessonId=${lesson.id}&mode=quiz`} mt="3" borderRadius="full" bg={COLORS.primary} color="white" alignSelf="start" _hover={{ bg: '#1D4ED8' }}>Làm phần thử sức đầy đủ</Button>
            </StepShell>
          ) : null}

          {activeLessonSection === 5 ? (
            <StepShell icon={CheckCircle2} title="Bước 6: Hoàn tất" helperLabel="Hoàn tất" task="Lưu tiến độ bài học và chọn luyện thêm nếu muốn.">
              <Box bg={COLORS.text} color="white" borderRadius="3xl" p={{ base: '5', md: '6' }} position="relative" overflow="hidden" className="lesson-final-challenge" willChange="transform, opacity">
                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700">Hoàn thành bài học</Text>
                <Text color="#CBD5E1" mt="1">Poo đang giữ tiến độ cho bạn.</Text>
                <Button data-testid="lesson-complete-button" mt="4" borderRadius="full" bg={COLORS.green} color="white" _hover={{ bg: '#16A34A' }} onClick={completeLesson}>Lưu hoàn thành</Button>
                <Box as="details" mt="4" bg="whiteAlpha.200" border="1px solid" borderColor="whiteAlpha.300" borderRadius="2xl" p="3">
                  <Box as="summary" cursor="pointer" fontWeight="700">Poo giải thích thêm</Box>
                  <HStack mt="3" gap="2" wrap="wrap">
                    {finalPracticeModes.slice(0, 2).map((mode) => (
                      <Button key={mode} as={Link} to={`/practice?lessonId=${lesson.id}&mode=${mode}`} borderRadius="full" bg="white" color={COLORS.text}>{getPracticeModeLabel(mode)}</Button>
                    ))}
                  </HStack>
                  {progressSummary ? <LessonProgressDashboard summary={progressSummary} hasProgress={Boolean(progress)} /> : null}
                </Box>
              </Box>
            </StepShell>
          ) : null}

          <HStack gap="2" justify="space-between" className="penglish-glass-card" bg="rgba(255,255,255,0.80)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3" position={{ base: 'sticky', md: 'static' }} bottom={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 12px)', md: 'auto' }} zIndex="4">
            <Button borderRadius="full" variant="outline" onClick={goPreviousLessonSection} isDisabled={!canGoPreviousLessonSection}>Quay lại</Button>
            <Text display={{ base: 'none', sm: 'block' }} fontWeight="700" color={COLORS.muted}>{activeLessonSectionMeta.vi}</Text>
            {canGoNextLessonSection ? (
              <Button borderRadius="full" variant="outline" color={COLORS.primary} borderColor="#BAE6FD" onClick={goNextLessonSection}>Tiếp tục</Button>
            ) : (
              <Button borderRadius="full" bg={COLORS.green} color="white" onClick={completeLesson} _hover={{ bg: '#16A34A' }}>Lưu bài</Button>
            )}
          </HStack>
        </VStack>
      </Box>
    </OceanPageShell>
  );
}

function StepShell({ icon, title, helperLabel, task, children }: { icon: any; title: string; helperLabel: string; task: string; children: ReactNode }) {
  return (
    <Box className="penglish-glass-card" bg={{ base: 'rgba(255,255,255,0.86)', md: 'rgba(255,255,255,0.78)' }} border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '4', md: '6' }} boxShadow="0 10px 24px rgba(31,111,214,0.055)" data-testid="lesson-step-card">
      <HStack align="start" gap="3" mb="4">
        <Flex w="44px" h="44px" borderRadius="2xl" bg="#EFF6FF" align="center" justify="center" flexShrink={0}>
          <Icon as={icon} color={COLORS.primary} boxSize="5" />
        </Flex>
        <Box minW="0">
          <Text color={COLORS.primary} fontWeight="700" fontSize="xs" letterSpacing="0.08em" textTransform="uppercase">{helperLabel}</Text>
          <Text as="h2" color={COLORS.text} fontWeight="700" fontSize={{ base: 'xl', md: '2xl' }}>{title}</Text>
          <Text mt="1" color={COLORS.muted} fontWeight="700" lineHeight="1.45" noOfLines={1}>{task}</Text>
        </Box>
      </HStack>
      {children}
    </Box>
  );
}

function LearningLockedLessonNotice({ state }: { state: LearningHeartsState }) {
  return (
    <Box bg="#E8F4FF" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="4" w="100%" maxW="560px">
      <HStack align="start" gap="3">
        <Box flex="1">
          <Text color="#1F6FD6" fontWeight="700">{OUT_OF_BUBBLES_MESSAGE}</Text>
          <Text mt="1" color="#52667A" fontSize="sm">Bọt biển sẽ phục hồi sau {getLockRemainingText(state)}. Bạn vẫn có thể đọc nội dung bài học.</Text>
        </Box>
        <Box w="190px" display={{ base: 'none', sm: 'block' }}>
          <LearningHeartsBadge compact />
        </Box>
      </HStack>
    </Box>
  );
}

function LessonProgressDashboard({
  summary,
  hasProgress,
}: {
  summary: ReturnType<typeof calculateLessonProgressSummary>;
  hasProgress: boolean;
}) {
  const completed = summary.overallPercentage >= 100;

  return (
    <Box bg="white" color={COLORS.text} border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="4" mt="3">
      {completed ? (
        <Box border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4" mb="4">
          <Text color="#15803D" fontWeight="700">Hoàn thành tốt bài này rồi.</Text>
          <Text mt="1" color={COLORS.muted} fontWeight="700">Tiến độ hiện tại là {summary.overallPercentage}%.</Text>
        </Box>
      ) : null}
      <HStack justify="space-between" mb="2" align="center">
        <Text fontWeight="700" color={COLORS.text}>Tổng tiến độ</Text>
        <Text fontWeight="700" color={COLORS.primary}>{summary.overallPercentage}%</Text>
      </HStack>
      <Progress value={summary.overallPercentage} colorScheme="blue" bg="#E2E8F0" borderRadius="full" h="10px" />
      <Text mt="2" color={COLORS.muted} fontWeight="700">{summary.completedModes.length}/{summary.modeSummaries.length} phần đã hoàn thành</Text>
      {!hasProgress ? <Text mt="2" color={COLORS.amber} fontWeight="700">Bạn chưa bắt đầu bài này. Nên bắt đầu bằng {summary.nextRecommendedLabel}.</Text> : null}
    </Box>
  );
}

function PreviewCard({
  title,
  prompt,
  onSpeak,
  children,
}: {
  title: string;
  prompt: string;
  onSpeak?: () => void;
  children: ReactNode;
}) {
  return (
    <Box border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="5" bg="#FFFFFF">
      <HStack justify="space-between" align="start" gap="4" mb="4">
        <Box>
          <Text fontSize="lg" fontWeight="700" color={COLORS.text}>{title}</Text>
          <Text mt="2" color={COLORS.muted}>{prompt}</Text>
        </Box>
        {onSpeak ? <IconButton aria-label="Nghe mẫu" icon={<Icon as={Volume2} />} borderRadius="full" color={COLORS.primary} bg="#EFF6FF" onClick={onSpeak} /> : null}
      </HStack>
      <RevealAnswer>{children}</RevealAnswer>
    </Box>
  );
}

