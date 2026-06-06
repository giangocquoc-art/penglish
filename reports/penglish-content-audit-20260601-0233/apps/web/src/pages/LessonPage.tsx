import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Box, Button, Divider, Flex, HStack, Icon, IconButton, Progress, SimpleGrid, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Headphones, HelpCircle, MessageCircle, Mic2, Play, Target, Volume2, Zap } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { RevealAnswer } from '../components/lesson/RevealAnswer';
import { LearningHeartsBadge } from '../components/learning/LearningHeartsBadge';
import { AnimatedWordScene } from '../components/learning-characters/AnimatedWordScene';
import { getLearningHeartsState, getLockRemainingText, isLearningLocked, LEARNING_HEARTS_UPDATED_EVENT, type LearningHeartsState } from '../lib/p-english/learning-hearts';
import { getLessonById, type QuizQuestion, type VocabularyItem } from '../lib/p-english/lesson-content-data';
import { calculateLessonProgressSummary, getAvailableLessonProgressModes, getDueReviewItems, getWeakReviewItems, markLessonCompleted, markLessonStarted, markLessonStepCompleted, readLessonProgress, type LessonProgress } from '../lib/p-english/lesson-progress';
import { getPracticeRecommendation } from '../lib/p-english/practiceRecommendationEngine';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { LessonGuideScene, type LessonGuideStepIndex } from '../components/learning-characters/LessonGuideScene';
import { DynamicGuidedLessonFlow, PRACTICE_MODE_ICONS, PRACTICE_MODE_LABELS } from '../components/p-english/DynamicGuidedLessonFlow';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { createCardEntrance, safeGsapSet } from '../lib/animations/gsap-utils';
import { isWordVisualCategory, type WordVisualCategory } from '../lib/p-english/word-visual-map';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

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

function Section({
  id,
  title,
  subtitle,
  icon,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  children: ReactNode;
}) {
  return (
    <Box id={id} className="penglish-glass-card" bg={{ base: 'rgba(255,255,255,0.72)', md: 'rgba(255,255,255,0.78)' }} backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '4', md: '7' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)">
      <HStack align="start" gap="4" mb="5">
        <Flex w="44px" h="44px" borderRadius="2xl" bg="#EFF6FF" align="center" justify="center" flexShrink={0}>
          <Icon as={icon} color={COLORS.primary} boxSize="5" />
        </Flex>
        <Box>
          <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color={COLORS.text}>{title}</Text>
          {subtitle ? <Text mt="1" color={COLORS.muted}>{subtitle}</Text> : null}
        </Box>
      </HStack>
      {children}
    </Box>
  );
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

function inferVocabularyVisualCategory(item: VocabularyItem): WordVisualCategory {
  const candidates = [item.partOfSpeechOrType, ...item.tags, item.term].map((value) => value.toLowerCase());

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

function vocabularySceneHint(item: VocabularyItem) {
  return item.exampleMeaningVi || 'Nhìn cảnh nhỏ, đoán nghĩa, rồi đọc lại từ.';
}

function vocabularyPronunciationHint(item: VocabularyItem) {
  return item.pronunciation ? `Phát âm: ${item.pronunciation}` : 'Đọc chậm, rõ, rồi nói lại một lần.';
}

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [heartsState, setHeartsState] = useState<LearningHeartsState>(() => getLearningHeartsState());
  const [activeStep, setActiveStep] = useState(0);
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
  const dueReviewItems = useMemo(() => (lesson ? getDueReviewItems(lesson.id, lesson) : []), [lesson, progress]);
  const weakReviewItems = useMemo(() => (lesson ? getWeakReviewItems(lesson.id, lesson) : []), [lesson, progress]);
  const availableModes = useMemo(() => (lesson ? getAvailableLessonProgressModes(lesson) : []), [lesson]);
  const practiceRecommendation = useMemo(() => (lesson ? getPracticeRecommendation(lesson, progress) : null), [lesson, progress]);
  const firstPracticeMode = practiceRecommendation?.primaryMode ?? availableModes[0];
  const firstPracticeUrl = practiceRecommendation?.primaryUrl ?? (firstPracticeMode ? `/practice?lessonId=${lesson?.id}&mode=${firstPracticeMode}` : '/learning-path');
  const finalPracticeModes = (practiceRecommendation?.orderedModes.length ? practiceRecommendation.orderedModes : availableModes).slice(0, 4);
  const guideStep = Math.min(activeStep, 4) as LessonGuideStepIndex;

  useEffect(() => {
    setActiveStep((step) => Math.min(step, Math.max(availableModes.length - 1, 0)));
  }, [availableModes.length]);

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;

      const hero = page.querySelector('.lesson-hero-polish');
      const metrics = page.querySelectorAll('.lesson-metric-card');
      const coach = page.querySelector('.lesson-whale-coach');
      const finalChallenge = page.querySelector('.lesson-final-challenge');
      const sparks = page.querySelectorAll('.lesson-final-spark');

      if (reducedMotion) {
        safeGsapSet([hero, metrics, coach, finalChallenge, sparks], { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        return;
      }

      if (hero) {
        gsap.fromTo(hero, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power2.out', force3D: true });
      }

      if (metrics.length > 0) {
        createCardEntrance(metrics, { y: 12, duration: 0.36, delay: 0.08, stagger: 0.045 });
      }

      if (coach) {
        gsap.fromTo(coach, { autoAlpha: 0, x: 14, scale: 0.985 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.38, delay: 0.16, ease: 'power2.out', force3D: true });
      }

      if (finalChallenge) {
        gsap.fromTo(finalChallenge, { autoAlpha: 0, y: 12, scale: 0.992 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, delay: 0.12, ease: 'power2.out', force3D: true });
      }

      if (sparks.length > 0) {
        gsap.to(sparks, { y: -8, autoAlpha: 0.82, duration: 2.8, stagger: 0.18, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true });
      }
    },
    { scope: pageRef, dependencies: [lesson?.id, reducedMotion], revertOnUpdate: true },
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
          <Text fontSize="2xl" fontWeight="900" color={COLORS.text}>Không tìm thấy bài học</Text>
          <Text mt="2" color={COLORS.muted}>Lesson ID hiện tại chưa có nội dung trong kho P-English.</Text>
        </Box>
      </Box>
    );
  }

  const firstListening = lesson.listeningPractice[0];
  const firstReflex = lesson.speakingReflexPrompts[0];
  const firstQuiz = lesson.quizQuestions[0];
  const learningLocked = isLearningLocked(heartsState);
  const lessonSections = [
    { id: 'overview', label: 'Tổng quan', icon: Target },
    { id: 'vocabulary', label: 'Từ vựng', icon: BookOpen },
    { id: 'patterns', label: 'Mẫu câu', icon: MessageCircle },
    { id: 'practice', label: 'Luyện tập', icon: Zap },
    { id: 'listen-speak', label: 'Nghe / Nói', icon: Headphones },
    { id: 'quiz', label: 'Quiz', icon: Play },
    { id: 'review', label: 'Review', icon: CheckCircle2 },
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
  const openSupportPanels = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;

  return (
    <OceanPageShell data-testid="lesson-mobile-root" ref={pageRef} variant="dashboard" ambientWhalePreset="lesson" overlayStrength="medium" glassIntensity="clear" minH="calc(100vh - 72px)" px={{ base: '3', md: '6' }} pt={{ base: '2', md: '0' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 72px)', lg: '12' }} overflowX="hidden" sx={{ scrollPaddingBottom: 'calc(var(--penglish-mobile-safe-bottom) + 96px)' }}>
      <Box maxW="1180px" mx="auto" minW="0" pb={{ base: '112px', md: '0' }}>
        <HStack py={{ base: '2', md: '5' }} gap="2" color={COLORS.muted} fontSize="sm" wrap="wrap" display={{ base: 'none', sm: 'flex' }}>
          <Link to="/home">Trang chủ</Link>
          <Text>/</Text>
          <Text>{lesson.unitTitle}</Text>
        </HStack>

        <Box className="lesson-hero-polish penglish-glass-card" bg={{ base: 'rgba(255,255,255,0.86)', md: 'rgba(255,255,255,0.78)' }} border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '8' }} mb={{ base: '3', md: '5' }} overflow="hidden" position="relative" boxShadow="0 14px 34px rgba(37, 99, 235, 0.07)" backdropFilter="blur(14px) saturate(1.1)" willChange="transform, opacity">
          <Box position="absolute" right="-120px" top="-120px" w="300px" h="300px" borderRadius="full" bg="rgba(91,188,235,0.12)" />
          <VStack align="start" gap={{ base: '2', md: '5' }} position="relative">
            <Button as={Link} to="/home" leftIcon={<Icon as={ArrowLeft} />} variant="ghost" color={COLORS.primary} px="0" size={{ base: 'sm', md: 'md' }} _hover={{ bg: 'transparent' }} display={{ base: 'none', sm: 'inline-flex' }}>
              Quay lại trang chủ
            </Button>
            <HStack wrap="wrap" gap="2">
              <Tag borderRadius="full" bg="#DBEAFE" color={COLORS.primary}><TagLabel>{lesson.level}</TagLabel></Tag>
              <Tag borderRadius="full" bg="#DCFCE7" color="#15803D"><TagLabel>{lesson.estimatedTime}</TagLabel></Tag>
              {lesson.skillTags.map((tag) => (
                <Tag key={tag} display={{ base: 'none', md: 'inline-flex' }} borderRadius="full" bg="white" color={COLORS.text} border="1px solid" borderColor={COLORS.border}><TagLabel>{tag}</TagLabel></Tag>
              ))}
            </HStack>
            <Box maxW="780px">
              <Text as="h1" fontSize={{ base: 'xl', md: '5xl' }} lineHeight="1.05" fontWeight="950" color={COLORS.text}>{lesson.titleVi}</Text>
              <Text mt="1" fontSize={{ base: 'sm', md: '2xl' }} fontWeight="700" color={COLORS.primary}>{lesson.titleEn}</Text>
              <Text mt={{ base: '1.5', md: '4' }} fontSize={{ base: 'sm', md: 'lg' }} color={COLORS.muted} noOfLines={{ base: 2, md: undefined }}>{lesson.subtitle}</Text>
            </Box>
            {learningLocked ? (
              <LearningLockedLessonNotice state={heartsState} />
            ) : firstPracticeMode ? (
              <Button as={Link} to={firstPracticeUrl} display={{ base: 'none', md: 'inline-flex' }} bg={COLORS.primary} color="white" borderRadius="full" size="lg" leftIcon={<Icon as={PRACTICE_MODE_ICONS[firstPracticeMode]} />} _hover={{ bg: '#1D4ED8' }}>
                Luyện {PRACTICE_MODE_LABELS[firstPracticeMode]}
              </Button>
            ) : (
              <Button as={Link} to="/learning-path" display={{ base: 'none', md: 'inline-flex' }} bg={COLORS.primary} color="white" borderRadius="full" size="lg" _hover={{ bg: '#1D4ED8' }}>
                Xem lộ trình
              </Button>
            )}
          </VStack>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" mb="5" display={{ base: 'none', md: 'grid' }}>
          <Metric className="lesson-metric-card" value={lesson.vocabulary.length} label="từ/cụm nền tảng" />
          <Metric className="lesson-metric-card" value={lesson.miniDialogues.length} label="hội thoại mẫu" />
          <Metric className="lesson-metric-card" value={lesson.speakingReflexPrompts.length} label="prompt phản xạ" />
          <Metric className="lesson-metric-card" value={lesson.quizQuestions.length} label="câu quiz" />
        </SimpleGrid>

        <Box className="penglish-glass-card" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '4', md: '6' }} mb="5" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" display={{ base: 'none', md: 'block' }}>
          <HStack align="start" gap="4" mb="4">
            <Flex w="44px" h="44px" borderRadius="2xl" bg="#EFF6FF" align="center" justify="center" flexShrink={0}>
              <Icon as={Target} color={COLORS.primary} boxSize="5" />
            </Flex>
            <Box>
              <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>Kế hoạch luyện trong phòng học này</Text>
              <Text mt="1" color={COLORS.muted} lineHeight="1.65">Đi theo một luồng: đọc mục tiêu, thử hoạt động gợi ý, rồi quay lại ôn phần yếu nếu cần.</Text>
            </Box>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
            <InfoCard title="1. Nắm ý chính" text={lesson.learningObjectives[0] ?? lesson.subtitle} />
            <InfoCard title="2. Luyện mode gợi ý" text={practiceRecommendation?.strategyVi ?? 'Bắt đầu với mode có dữ liệu phù hợp nhất cho bài này.'} />
            <InfoCard title="3. Ôn điểm yếu" text={practiceRecommendation?.confidenceGoalVi ?? 'Tiến độ sẽ lưu local sau mỗi lần luyện.'} />
          </SimpleGrid>
        </Box>

        <DynamicGuidedLessonFlow
          lesson={lesson}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          learningLocked={learningLocked}
          availableModes={availableModes}
          speakEnglish={speakEnglish}
        />

        <Box as="details" open={openSupportPanels} className="lesson-whale-coach penglish-glass-card" bg={{ base: 'rgba(248,252,255,0.70)', md: 'rgba(248,252,255,0.76)' }} border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '5' }} mb={{ base: '3', md: '6' }} boxShadow="0 12px 30px rgba(31, 111, 214, 0.06)" overflow="hidden" position="relative" willChange="transform, opacity">
          <Box as="summary" display={{ base: 'block', md: 'none' }} cursor="pointer" fontWeight="950" color={COLORS.primary} position="relative" zIndex="1">Mực Mơ gợi ý</Box>
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 28%, rgba(91,188,235,0.10), transparent 24%)" />
          <Flex mt={{ base: '3', md: '0' }} position="relative" align="center" justify="space-between" gap={{ base: '3', md: '5' }} direction={{ base: 'row', md: 'row' }}>
            <HStack align="center" gap={{ base: '3', md: '4' }} flex="1" minW="0">
              <Flex w={{ base: '42px', md: '56px' }} minW={{ base: '42px', md: '56px' }} borderRadius="2xl" bg="rgba(255,255,255,0.82)" border="1px solid rgba(186,230,253,0.92)" color={COLORS.primary} align="center" justify="center" flexShrink={0} boxShadow="0 10px 24px rgba(37, 99, 235, 0.08)" pointerEvents="none">
                <OceanMascot mascot="mucMo" pose="teacher" size="sm" decorative motion="float" />
              </Flex>
              <Box minW="0">
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="900" color={COLORS.text}>Mực Mơ gợi ý</Text>
                <Text mt="1" color={COLORS.muted} fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.55" noOfLines={{ base: 2, md: undefined }}>
                  {practiceRecommendation?.coachLineVi ?? 'Đọc cụm từ trước, nghe lại 2 lần rồi mới luyện phản xạ.'}
                </Text>
                {practiceRecommendation ? (
                  <Text mt="1" color={COLORS.primary} fontSize="xs" fontWeight="800">
                    {practiceRecommendation.reasonVi} · {practiceRecommendation.keyboardHintVi}
                  </Text>
                ) : null}
              </Box>
            </HStack>
            <Box display={{ base: 'none', md: 'block' }} position="relative" w="96px" flexShrink={0} pointerEvents="none" aria-hidden="true">
              <OceanMascot mascot="poo" pose="coach" size="md" decorative motion="float" opacity="0.88" />
            </Box>
          </Flex>
        </Box>

        <Box as="details" open={openSupportPanels} data-testid="lesson-step-nav" className="penglish-glass-card" bg={{ base: 'rgba(255,255,255,0.72)', md: 'rgba(255,255,255,0.78)' }} backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '5' }} mb={{ base: '3', md: '5' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" position={{ base: 'static', md: 'static' }} zIndex="3">
          <Box as="summary" display={{ base: 'block', md: 'none' }} cursor="pointer" fontWeight="950" color={COLORS.primary}>Bước học trong bài · {activeLessonSectionMeta.label}</Box>
          <Flex mt={{ base: '3', md: '0' }} justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="3" mb="4">
            <Box>
              <Text fontWeight="950" color={COLORS.text}>Bước học trong bài</Text>
              <Text mt="1" color={COLORS.muted} fontSize="sm">Chọn từng bước để học gọn hơn; toàn bộ dữ liệu bài vẫn còn trong các tab.</Text>
            </Box>
            <Text fontSize="sm" fontWeight="900" color={COLORS.primary}>Bước {activeLessonSection + 1}/{lessonSections.length}: {activeLessonSectionMeta.label}</Text>
          </Flex>
          <Progress value={lessonSectionProgress} colorScheme="blue" bg="#E2E8F0" borderRadius="full" h="8px" mb="4" />
          <HStack gap="2" wrap={{ base: 'nowrap', md: 'wrap' }} overflowX={{ base: 'auto', md: 'visible' }} pb={{ base: '1', md: '0' }}>
            {lessonSections.map((section, index) => (
              <Button key={section.id} size="sm" leftIcon={<Icon as={section.icon} />} borderRadius="full" bg={activeLessonSection === index ? COLORS.primary : 'white'} color={activeLessonSection === index ? 'white' : COLORS.text} border="1px solid" borderColor={activeLessonSection === index ? COLORS.primary : COLORS.border} _hover={{ bg: activeLessonSection === index ? '#1D4ED8' : '#EFF6FF' }} aria-pressed={activeLessonSection === index} onClick={() => { completeCurrentLessonSection(); setActiveLessonSection(index); }} flexShrink={0}>
                {section.label}
              </Button>
            ))}
          </HStack>
          <HStack mt="4" gap="2" justify="space-between">
            <Button size="sm" borderRadius="full" variant="outline" onClick={goPreviousLessonSection} isDisabled={!canGoPreviousLessonSection}>Quay lại</Button>
            <Button size="sm" borderRadius="full" colorScheme="blue" onClick={goNextLessonSection} isDisabled={!canGoNextLessonSection}>Tiếp tục</Button>
          </HStack>
        </Box>

        <VStack data-testid="lesson-active-step" align="stretch" gap={{ base: '3', md: '5' }} scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)">
          {activeLessonSection === 0 ? <>
          {progressSummary ? <Box data-testid="lesson-mobile-progress-details" as="details" open={openSupportPanels} className="penglish-glass-card" bg={{ base: 'rgba(255,255,255,0.72)', md: 'rgba(255,255,255,0.78)' }} border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '0' }} boxShadow={{ base: '0 10px 24px rgba(31, 111, 214, 0.06)', md: 'none' }}><Box as="summary" display={{ base: 'block', md: 'none' }} cursor="pointer" fontWeight="950" color={COLORS.primary}>Tiến độ bài học</Box><Box display={{ base: 'block', md: 'block' }} mt={{ base: '3', md: '0' }}><LessonProgressDashboard summary={progressSummary} hasProgress={Boolean(progress)} /></Box></Box> : null}
          {progressSummary ? <Box as="details" open={openSupportPanels} className="penglish-glass-card" bg={{ base: 'rgba(255,255,255,0.72)', md: 'rgba(255,255,255,0.78)' }} border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '0' }} boxShadow={{ base: '0 10px 24px rgba(31, 111, 214, 0.06)', md: 'none' }}><Box as="summary" display={{ base: 'block', md: 'none' }} cursor="pointer" fontWeight="950" color={COLORS.primary}>Ôn tập thông minh</Box><Box mt={{ base: '3', md: '0' }}><SmartReviewCard lessonId={lesson.id} dueCount={dueReviewItems.length} weakCount={weakReviewItems.length} nextReviewAt={progressSummary.nextReviewAt} /></Box></Box> : null}

          <Box as="details" open={openSupportPanels} className="penglish-glass-card" bg={{ base: 'rgba(255,255,255,0.72)', md: 'rgba(255,255,255,0.78)' }} border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '0' }} boxShadow={{ base: '0 10px 24px rgba(31, 111, 214, 0.06)', md: 'none' }}><Box as="summary" display={{ base: 'block', md: 'none' }} cursor="pointer" fontWeight="950" color={COLORS.primary}>Mục tiêu sau bài học</Box><Box mt={{ base: '3', md: '0' }}><Section id="objectives" title="Mục tiêu sau bài học" icon={Target}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
              {lesson.learningObjectives.map((objective) => (
                <HStack key={objective} align="start" bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="xl" p={{ base: '3', md: '4' }}>
                  <Icon as={CheckCircle2} color={COLORS.green} boxSize="5" />
                  <Text color={COLORS.text}>{objective}</Text>
                </HStack>
              ))}
            </SimpleGrid>
          </Section></Box></Box>
          </> : null}

          {activeLessonSection === 1 ? <Section id="vocabulary" title="Vocabulary grid" subtitle="Các cụm nên học như chunk, không dịch từng chữ." icon={BookOpen}>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="4" maxH={{ base: '620px', md: 'none' }} overflowY={{ base: 'auto', md: 'visible' }} pr={{ base: '1', md: '0' }}>
              {lesson.vocabulary.map((item) => (
                <Box key={item.id} border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p={{ base: '3', md: '4' }} bg="#FFFFFF">
                  <Box mb="3">
                    <AnimatedWordScene
                      wordOrPhrase={item.term}
                      meaningVi={item.meaningVi}
                      example={item.example}
                      visualCategory={inferVocabularyVisualCategory(item)}
                      animatedSceneHint={vocabularySceneHint(item)}
                      pronunciationHintVi={vocabularyPronunciationHint(item)}
                      size="compact"
                      mood="friendly"
                      showSpeechBubble={false}
                    />
                  </Box>
                  <HStack justify="space-between" align="start" gap="3">
                    <Box>
                      <Text fontSize="lg" fontWeight="900" color={COLORS.text}>{item.term}</Text>
                      {item.pronunciation ? <Text fontSize="sm" color={COLORS.muted}>{item.pronunciation}</Text> : null}
                    </Box>
                    <SpeakButton text={item.term} />
                  </HStack>
                  <Text mt="2" fontWeight="700" color={COLORS.primary}>{item.meaningVi}</Text>
                  <Text mt="2" color={COLORS.text}>{item.example}</Text>
                  <Text fontSize="sm" color={COLORS.muted}>{item.exampleMeaningVi}</Text>
                  <HStack mt="3" wrap="wrap" gap="2">
                    <Tag size="sm" borderRadius="full" bg="#F1F5F9" color={COLORS.muted}>{item.partOfSpeechOrType}</Tag>
                    {item.tags.slice(0, 2).map((tag) => <Tag key={tag} size="sm" borderRadius="full" bg="#ECFDF5" color="#15803D">{tag}</Tag>)}
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </Section> : null}

          {activeLessonSection === 2 ? <Section id="patterns" title="Sentence patterns" subtitle="Mẫu câu trọng tâm để thay tên/nơi chốn nhanh." icon={MessageCircle}>
            <VStack align="stretch" gap="4">
              {lesson.sentencePatterns.map((pattern) => (
                <Box key={pattern.id} border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4" bg="#F8FAFC">
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Text fontWeight="900" color={COLORS.text}>{pattern.pattern}</Text>
                      <Text mt="1" color={COLORS.muted}>{pattern.vietnameseExplanation}</Text>
                    </Box>
                    <SpeakButton text={pattern.examples.map((example) => example.text).join(' ')} />
                  </HStack>
                  <Divider my="3" />
                  <VStack align="stretch" gap="2">
                    {pattern.examples.map((example) => (
                      <HStack key={`${pattern.id}-${example.text}`} justify="space-between" align="start">
                        <Text color={COLORS.text}>{example.speaker ? `${example.speaker}: ` : ''}{example.text}</Text>
                        <Text color={COLORS.muted} fontSize="sm">{example.meaningVi}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Section> : null}

          {activeLessonSection === 4 ? <Section id="dialogues" title="Mini dialogues" subtitle="Đọc theo vai A/B rồi shadowing từng câu." icon={Mic2}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap="4">
              {lesson.miniDialogues.map((dialogue) => (
                <Box key={dialogue.id} border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4">
                  <HStack justify="space-between" mb="3">
                    <Text fontWeight="900" color={COLORS.text}>{dialogue.title}</Text>
                    <SpeakButton text={dialogue.lines.map((line) => line.text).join(' ')} />
                  </HStack>
                  <VStack align="stretch" gap="2">
                    {dialogue.lines.map((line, index) => (
                      <Box key={`${dialogue.id}-${index}`} bg={line.speaker === 'A' ? '#EFF6FF' : '#F0FDF4'} borderRadius="xl" p="3">
                        <Text fontWeight="800" color={line.speaker === 'A' ? COLORS.primary : '#15803D'}>{line.speaker}: {line.text}</Text>
                        <Text fontSize="sm" color={COLORS.muted}>{dialogue.vietnameseTranslation[index]}</Text>
                      </Box>
                    ))}
                  </VStack>
                  <Text mt="3" fontSize="sm" color={COLORS.muted}>{dialogue.suggestedShadowingInstruction}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Section> : null}

          {activeLessonSection === 3 ? <Section id="grammar" title="Grammar notes" subtitle="Mực Mơ giữ ngữ pháp ở mức cần dùng để phản xạ." icon={HelpCircle}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              {lesson.grammarNotes.map((note) => (
                <InfoCard key={note.id} title={note.title} text={`${note.explanationVi} Ví dụ: ${note.examples.join(' / ')}`} mascot="mucMo" />
              ))}
            </SimpleGrid>
          </Section> : null}

          {activeLessonSection === 4 ? <Section id="pronunciation" title="Pronunciation" subtitle="Tập âm và nhịp đọc của các cụm thường dùng." icon={Volume2}>
            <VStack align="stretch" gap="3">
              {lesson.pronunciationNotes.map((note) => (
                <Box key={note.id} border="1px solid" borderColor={COLORS.border} borderRadius="xl" p="4" bg="#FFFFFF">
                  <Text color={COLORS.text}>{note.noteVi}</Text>
                  {note.examples ? (
                    <HStack mt="2" wrap="wrap">
                      {note.examples.map((example) => (
                        <Button key={example} size="xs" borderRadius="full" variant="outline" onClick={() => speakEnglish(example)}>{example}</Button>
                      ))}
                    </HStack>
                  ) : null}
                </Box>
              ))}
            </VStack>
          </Section> : null}

          {activeLessonSection === 4 && firstListening ? (
            <Section id="listening-preview" title="Listening preview" subtitle="Nghe một câu mẫu và tự trả lời trước khi mở đáp án." icon={Headphones}>
              <PreviewCard title={firstListening.question} prompt={firstListening.text} onSpeak={() => speakEnglish(firstListening.text)}>
                <Text fontWeight="800">{firstListening.answer}</Text>
                <Text fontSize="sm" color={COLORS.muted}>Gợi ý luyện: nghe {firstListening.speechSynthesis?.repeatRecommended ?? 3} lần ở tốc độ chậm.</Text>
              </PreviewCard>
            </Section>
          ) : null}

          {activeLessonSection === 3 && firstReflex ? (
            <Section id="reflex-preview" title="Reflex preview" subtitle="Nhìn tiếng Việt, nói tiếng Anh trong 2 giây rồi mở đáp án." icon={Zap}>
              <PreviewCard title={firstReflex.promptVi} prompt={firstReflex.hint}>
                <Text fontWeight="800">{firstReflex.expectedEnglish}</Text>
                <Text fontSize="sm" color={COLORS.muted}>Cũng chấp nhận: {firstReflex.acceptableAnswers.join(' / ')}</Text>
              </PreviewCard>
            </Section>
          ) : null}

          {activeLessonSection === 5 && firstQuiz ? (
            <Section id="quiz-preview" title="Quiz preview" subtitle="Xem trước một câu quiz từ bài học này." icon={Play}>
              <PreviewCard title={firstQuiz.question ?? firstQuiz.prompt ?? firstQuiz.vietnamese ?? 'Quiz preview'} prompt={firstQuiz.options ? firstQuiz.options.join(' • ') : firstQuiz.words?.join(' / ') ?? 'Tự trả lời trước khi mở đáp án.'}>
                <Text fontWeight="800">{answerToText(firstQuiz.answer)}</Text>
                {firstQuiz.explanationVi ? <Text fontSize="sm" color={COLORS.muted}>{firstQuiz.explanationVi}</Text> : null}
              </PreviewCard>
            </Section>
          ) : null}

          {activeLessonSection === 6 ? <Section id="completion" title="Completion criteria" subtitle="Tiêu chí hoàn thành được tính theo dữ liệu bài học và các mode đang có." icon={CheckCircle2}>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
              <Metric value={lesson.completionCriteria.flashcardsReviewed} label="flashcards cần xem" />
              <Metric value={`${lesson.completionCriteria.minimumQuizCorrect}/${lesson.completionCriteria.totalQuizQuestions}`} label="quiz đúng tối thiểu" />
              <Metric value={`${lesson.completionCriteria.minimumReflexPromptsCompleted}/${lesson.completionCriteria.totalReflexPrompts}`} label="prompt phản xạ" />
            </SimpleGrid>
          </Section> : null}

          {activeLessonSection === 6 ? <Box className="lesson-final-challenge" bg={COLORS.text} color="white" borderRadius="3xl" p={{ base: '6', md: '8' }} position="relative" overflow="hidden" willChange="transform, opacity">
            <Box className="lesson-final-spark" position="absolute" right={{ base: '18px', md: '42px' }} top={{ base: '18px', md: '24px' }} w="12px" h="12px" borderRadius="full" bg="rgba(255,255,255,0.68)" pointerEvents="none" />
            <Box className="lesson-final-spark" position="absolute" right={{ base: '72px', md: '130px' }} bottom={{ base: '22px', md: '30px' }} w="18px" h="18px" borderRadius="full" bg="rgba(91,188,235,0.36)" pointerEvents="none" />
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="5">
              <Box>
                <Text fontSize="2xl" fontWeight="900">Sẵn sàng luyện sâu hơn?</Text>
                <Text color="#CBD5E1" mt="1">Chọn mode phù hợp để luyện sâu hơn. Tiến độ sẽ được lưu local trên thiết bị này.</Text>
                <Button data-testid="lesson-complete-button" mt="4" borderRadius="full" bg={COLORS.green} color="white" _hover={{ bg: '#16A34A' }} onClick={completeLesson}>
                  Hoàn thành bài học
                </Button>
              </Box>
              {learningLocked ? (
                <Box bg="whiteAlpha.200" border="1px solid" borderColor="whiteAlpha.300" borderRadius="2xl" p="4">
                  <Text fontWeight="900">Đang hồi bọt biển — mở lại sau {getLockRemainingText(heartsState)}</Text>
                  <Text color="#CBD5E1" fontSize="sm">Bọt biển sẽ phục hồi sau {getLockRemainingText(heartsState)}.</Text>
                </Box>
              ) : finalPracticeModes.length > 0 ? (
                <HStack wrap="wrap">
                  {finalPracticeModes.map((mode, index) => (
                    <Button
                      key={mode}
                      as={Link}
                      to={`/practice?lessonId=${lesson.id}&mode=${mode}`}
                      borderRadius="full"
                      bg={index === 0 ? 'white' : index === 1 ? COLORS.primary : index === 2 ? COLORS.green : 'transparent'}
                      color={index === 0 ? COLORS.text : 'white'}
                      variant={index >= 3 ? 'outline' : 'solid'}
                      borderColor={index >= 3 ? 'whiteAlpha.500' : undefined}
                    >
                      {PRACTICE_MODE_LABELS[mode]}
                    </Button>
                  ))}
                </HStack>
              ) : (
                <HStack wrap="wrap">
                  <Button as={Link} to="/learning-path" borderRadius="full" bg="white" color={COLORS.text}>
                    Xem lộ trình
                  </Button>
                  <Button as={Link} to="/home" borderRadius="full" variant="outline" borderColor="whiteAlpha.500" color="white">
                    Về dashboard
                  </Button>
                </HStack>
              )}
            </Flex>
          </Box> : null}
        </VStack>

        <HStack display={{ base: 'none', md: 'flex' }} mt={{ base: '4', md: '5' }} mb={{ base: 'var(--penglish-mobile-safe-bottom)', lg: '0' }} gap="2" justify="space-between" className="penglish-glass-card" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3" boxShadow="0 12px 30px rgba(31, 111, 214, 0.06)" scrollMarginBottom="var(--penglish-mobile-safe-bottom)">
          <Button borderRadius="full" variant="outline" onClick={goPreviousLessonSection} isDisabled={!canGoPreviousLessonSection}>Quay lại</Button>
          <Text display={{ base: 'none', sm: 'block' }} fontWeight="900" color={COLORS.muted}>{activeLessonSectionMeta.label}</Text>
          <Button borderRadius="full" colorScheme="blue" onClick={goNextLessonSection} isDisabled={!canGoNextLessonSection}>Tiếp tục</Button>
        </HStack>
      </Box>
    </OceanPageShell>
  );
}

function LearningLockedLessonNotice({ state }: { state: LearningHeartsState }) {
  return (
    <Box bg="#E8F4FF" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="4" w="100%" maxW="560px">
      <HStack align="start" gap="3">
        <Box flex="1">
          <Text color="#1F6FD6" fontWeight="950">Đang hồi bọt biển — mở lại sau {getLockRemainingText(state)}</Text>
          <Text mt="1" color="#52667A" fontSize="sm">Hết bọt biển rồi, nghỉ một chút để hồi lại nhé. Bạn vẫn có thể đọc nội dung bài học.</Text>
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
    <Section id="lesson-progress" title="Tiến độ bài học" subtitle="Theo dõi các mode đang có dữ liệu cho bài học này trên thiết bị của bạn." icon={CheckCircle2}>
      {completed ? (
        <Box border="1px solid" borderColor="#BBF7D0" bg="#F0FDF4" borderRadius="2xl" p="4" mb="5">
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4">
            <Box>
              <Text color="#15803D" fontWeight="950">Hoàn thành tốt bài này rồi.</Text>
              <Text mt="1" color={COLORS.muted} fontWeight="700">
                Tiến độ hiện tại là {summary.overallPercentage}%. Bạn có thể quay lại lộ trình để xem cấp độ, XP và bài gợi ý tiếp theo.
              </Text>
            </Box>
            <HStack gap="3" wrap="wrap">
              <Button as={Link} to="/learning-path" borderRadius="full" bg={COLORS.green} color="white" _hover={{ bg: '#16A34A' }}>
                Xem lộ trình
              </Button>
              <Button as={Link} to="/home" borderRadius="full" variant="outline" borderColor="#BBF7D0" color="#15803D">
                Về dashboard
              </Button>
            </HStack>
          </Flex>
        </Box>
      ) : null}

      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="5" mb="5">
        <Box flex="1" w="100%">
          <HStack justify="space-between" mb="2" align="center">
            <Text fontWeight="900" color={COLORS.text}>Tổng tiến độ</Text>
            <Text fontWeight="950" color={COLORS.primary}>{summary.overallPercentage}%</Text>
          </HStack>
          <Progress value={summary.overallPercentage} colorScheme="blue" bg="#E2E8F0" borderRadius="full" h="10px" />
          <Text mt="2" color={COLORS.muted} fontWeight="700">
            {summary.completedModes.length}/{summary.modeSummaries.length} mode đã hoàn thành
          </Text>
          {!hasProgress ? (
            <Text mt="2" color={COLORS.amber} fontWeight="800">Bạn chưa bắt đầu bài này. Nên bắt đầu bằng {summary.nextRecommendedLabel}.</Text>
          ) : null}
        </Box>
        <Box border="1px solid" borderColor={completed ? '#BBF7D0' : '#FDE68A'} bg={completed ? '#F0FDF4' : '#FFFBEB'} borderRadius="2xl" p="4" minW={{ base: '100%', md: '280px' }}>
          <Text color={completed ? '#15803D' : '#92400E'} fontWeight="900">{completed ? 'Bước tiếp theo: xem lộ trình' : `Nên học tiếp: ${summary.nextRecommendedLabel}`}</Text>
          <Button as={Link} to={completed ? '/learning-path' : summary.nextRecommendedUrl} mt="3" borderRadius="full" bg={completed ? COLORS.green : COLORS.amber} color="white" _hover={{ bg: completed ? '#16A34A' : '#D97706' }}>
            {completed ? 'Xem tiến độ' : 'Học tiếp'}
          </Button>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3">
        {summary.modeSummaries.map((item) => {
          const isDone = item.status === 'Hoàn thành';
          const isStarted = item.status === 'Đang học';
          const isReady = item.status === 'Sẵn sàng';
          const statusColor = isDone ? COLORS.green : isStarted ? COLORS.amber : isReady ? COLORS.primary : COLORS.muted;
          const statusBg = isDone ? '#F0FDF4' : isStarted ? '#FFFBEB' : isReady ? '#EFF6FF' : '#F8FAFC';

          return (
            <Box key={item.mode} border="1px solid" borderColor={COLORS.border} bg="white" borderRadius="2xl" p={{ base: '3', md: '4' }} minW="0">
              <HStack justify="space-between" align="start" gap="2">
                <Box minW="0">
                  <Text fontWeight="950" color={COLORS.text}>{item.label}</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" lineHeight="1.45">{item.scoreText}</Text>
                </Box>
                <Tag borderRadius="full" bg={statusBg} color={statusColor} flexShrink={0} size={{ base: 'sm', md: 'md' }}>{item.status}</Tag>
              </HStack>
              <Button as={Link} to={item.url} mt="4" size="sm" borderRadius="full" variant={isDone ? 'outline' : 'solid'} bg={isDone ? 'white' : COLORS.primary} color={isDone ? COLORS.primary : 'white'} borderColor={isDone ? COLORS.primary : COLORS.primary} _hover={{ bg: isDone ? '#EFF6FF' : '#1D4ED8' }}>
                Luyện ngay
              </Button>
            </Box>
          );
        })}
      </SimpleGrid>
    </Section>
  );
}

function SmartReviewCard({
  lessonId,
  dueCount,
  weakCount,
  nextReviewAt,
}: {
  lessonId: string;
  dueCount: number;
  weakCount: number;
  nextReviewAt?: string;
}) {
  const hasDue = dueCount > 0;
  const nextDueText = nextReviewAt ? new Date(nextReviewAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Chưa có lịch ôn';

  return (
    <Section id="smart-review" title="Ôn tập thông minh" subtitle="Các mục sai hoặc yếu sẽ được đưa trở lại để ôn sớm hơn." icon={Clock3}>
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="5">
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3" flex="1" w="100%">
          <Box bg="#EFF6FF" border="1px solid" borderColor="#BFDBFE" borderRadius="2xl" p="4">
            <Text fontSize="3xl" fontWeight="950" color={COLORS.primary}>{dueCount}</Text>
            <Text color={COLORS.muted} fontWeight="700">mục đến hạn</Text>
          </Box>
          <Box bg="#FFFBEB" border="1px solid" borderColor="#FDE68A" borderRadius="2xl" p="4">
            <Text fontSize="3xl" fontWeight="950" color={COLORS.amber}>{weakCount}</Text>
            <Text color={COLORS.muted} fontWeight="700">mục yếu/cần củng cố</Text>
          </Box>
          <Box bg="#F0FDF4" border="1px solid" borderColor="#BBF7D0" borderRadius="2xl" p="4">
            <Text fontSize="sm" fontWeight="900" color="#15803D">Lần ôn kế tiếp</Text>
            <Text mt="1" color={COLORS.text} fontWeight="850">{nextDueText}</Text>
          </Box>
        </SimpleGrid>
        <Box border="1px solid" borderColor={hasDue ? '#BFDBFE' : COLORS.border} bg={hasDue ? '#EFF6FF' : '#F8FAFC'} borderRadius="2xl" p="4" minW={{ base: '100%', md: '260px' }}>
          <Text color={COLORS.text} fontWeight="900">
            {hasDue ? 'Đã có phần cần ôn ngay.' : 'Chưa có mục nào đến hạn ôn ngay.'}
          </Text>
          <Button as={Link} to={hasDue ? `/practice?lessonId=${lessonId}&mode=flashcard&review=due` : `/practice?lessonId=${lessonId}&mode=flashcard`} mt="3" borderRadius="full" bg={hasDue ? COLORS.primary : COLORS.green} color="white" _hover={{ bg: hasDue ? '#1D4ED8' : '#16A34A' }}>
            {hasDue ? 'Ôn phần cần nhớ' : 'Ôn flashcard toàn bộ'}
          </Button>
        </Box>
      </Flex>
    </Section>
  );
}

function Metric({ value, label, className }: { value: string | number; label: string; className?: string }) {
  return (
    <Box className={className ? `${className} penglish-glass-card` : 'penglish-glass-card'} bg="rgba(255,255,255,0.76)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p={{ base: '3', md: '5' }} boxShadow="0 10px 24px rgba(31,111,214,0.055)" willChange={className ? 'transform, opacity' : undefined}>
      <Text fontSize="3xl" fontWeight="950" color={COLORS.primary}>{value}</Text>
      <Text color={COLORS.muted} fontWeight="600">{label}</Text>
    </Box>
  );
}

function InfoCard({ title, text, mascot }: { title: string; text: string; mascot?: 'mucMo' }) {
  return (
    <Box bg="#F8FAFC" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4">
      <HStack align="start" gap="3">
        {mascot ? <OceanMascot mascot={mascot} size="xs" decorative motion="pulse" /> : null}
        <Box minW="0">
          <Text fontWeight="900" color={COLORS.text}>{title}</Text>
          <Text mt="2" color={COLORS.muted}>{text}</Text>
        </Box>
      </HStack>
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
          <Text fontSize="lg" fontWeight="900" color={COLORS.text}>{title}</Text>
          <Text mt="2" color={COLORS.muted}>{prompt}</Text>
        </Box>
        {onSpeak ? <IconButton aria-label="Nghe preview" icon={<Icon as={Volume2} />} borderRadius="full" color={COLORS.primary} bg="#EFF6FF" onClick={onSpeak} /> : null}
      </HStack>
      <RevealAnswer>{children}</RevealAnswer>
    </Box>
  );
}
