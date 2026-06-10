import { type ReactNode, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Box, Button, Flex, HStack, Icon, SimpleGrid, Tag, TagLabel, Text } from '@chakra-ui/react';
import { ArrowLeft, ArrowRight, BookOpen, Headphones, HelpCircle, Play, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EnglishLesson } from '../../lib/p-english/lesson-content-data';
import type { LessonProgressMode } from '../../lib/p-english/lesson-progress';
import { getUnifiedPracticeContentDepth } from '../../lib/p-english/unifiedLessonEngine';
import { createCardEntrance, safeGsapSet } from '../../lib/animations/gsap-utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
  green: '#22C55E',
  border: '#E2E8F0',
};

type VisiblePracticeMode = LessonProgressMode | 'listening' | 'typing' | 'review' | 'overview';

export const DEFAULT_PRACTICE_MODE_LABEL = 'Luyện tập';
export const DEFAULT_PRACTICE_MODE_ICON = Target;

export const PRACTICE_MODE_LABELS: Record<VisiblePracticeMode, string> = {
  flashcard: 'Thẻ từ',
  quiz: 'Kiểm tra nhanh',
  listen: 'Luyện nghe',
  listening: 'Luyện nghe',
  reflex: 'Phản xạ',
  type: 'Gõ câu',
  typing: 'Gõ câu',
  match: 'Ghép cặp',
  speed: 'Tốc độ / phát âm',
  review: 'Ôn lại',
  overview: 'Tổng quan',
};

export const PRACTICE_MODE_ICONS: Record<VisiblePracticeMode, any> = {
  flashcard: BookOpen,
  quiz: HelpCircle,
  listen: Headphones,
  listening: Headphones,
  reflex: Zap,
  type: Target,
  typing: Target,
  match: Target,
  speed: Zap,
  review: HelpCircle,
  overview: BookOpen,
};

export function getPracticeModeLabel(mode: string | null | undefined) {
  return (mode ? PRACTICE_MODE_LABELS[mode as VisiblePracticeMode] : undefined) ?? DEFAULT_PRACTICE_MODE_LABEL;
}

export function getPracticeModeIcon(mode: string | null | undefined) {
  return (mode ? PRACTICE_MODE_ICONS[mode as VisiblePracticeMode] : undefined) ?? DEFAULT_PRACTICE_MODE_ICON;
}

export function DynamicGuidedLessonFlow({
  lesson,
  activeStep,
  onStepChange,
  learningLocked,
  availableModes,
  speakEnglish,
}: {
  lesson: EnglishLesson;
  activeStep: number;
  onStepChange: (step: number) => void;
  learningLocked: boolean;
  availableModes: LessonProgressMode[];
  speakEnglish: (text: string) => void;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const practiceContentDepth = getUnifiedPracticeContentDepth(lesson.id);
  const steps = availableModes.map((mode) => {
    const modeDepth = practiceContentDepth?.modeDepths.find((item) => item.mode === mode);
    return { mode, label: getPracticeModeLabel(mode), icon: getPracticeModeIcon(mode), modeDepth };
  });
  const safeStep = Math.min(activeStep, Math.max(steps.length - 1, 0));
  const step = steps[safeStep];
  const activeModeDepth = step?.modeDepth;
  const canGoBack = safeStep > 0;
  const canGoNext = safeStep < steps.length - 1;

  useGSAP(
    () => {
      const content = contentRef.current;
      if (!content) return;
      const cards = content.querySelectorAll('.lesson-flow-card, .lesson-speech-bubble');
      safeGsapSet(content, { autoAlpha: 1, y: 0, clearProps: 'display' });
      safeGsapSet(cards, { autoAlpha: 1, y: 0, scale: 1, clearProps: 'display' });
      if (reducedMotion) return;
      gsap.fromTo(content, { autoAlpha: 1, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out', force3D: true });
      if (cards.length > 0) createCardEntrance(cards, { y: 14, duration: 0.38, delay: 0.05, stagger: 0.055 });
    },
    { dependencies: [safeStep, reducedMotion], scope: contentRef },
  );

  if (!step) {
    return (
      <Box mb="6" bg="white" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '5', md: '6' }} boxShadow="0 18px 44px rgba(31, 111, 214, 0.08)">
        <Text fontSize="2xl" fontWeight="950" color={COLORS.text}>Bài này đang ở phần đọc nội dung.</Text>
        <Text mt="2" color={COLORS.muted} fontWeight="700">Chưa có phần luyện riêng cho bài này. Bạn có thể đọc nội dung bên dưới hoặc quay lại lộ trình để chọn bài khác.</Text>
        <HStack mt="5" wrap="wrap">
          <Button as={Link} to="/learning-path" borderRadius="full" bg={COLORS.primary} color="white">Xem lộ trình</Button>
          <Button as={Link} to="/home" borderRadius="full" variant="outline">Về Hôm nay học gì?</Button>
        </HStack>
      </Box>
    );
  }

  const practiceUrl = `/practice?lessonId=${lesson.id}&mode=${step.mode}`;

  return (
    <Box mb={{ base: '3', md: '6' }} bg={{ base: 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(232,244,255,0.78) 52%, rgba(221,245,255,0.70) 100%)', md: 'linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(232,244,255,0.92) 52%, rgba(221,245,255,0.86) 100%)' }} border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: '3', md: '6' }} boxShadow="0 18px 44px rgba(31, 111, 214, 0.10)" overflow="hidden" position="relative" backdropFilter="blur(14px) saturate(1.08)" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)">
      <Box position="absolute" right="-58px" top="-70px" w="210px" h="210px" borderRadius="full" bg="rgba(91,188,235,0.18)" />
      <Box position="relative">
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={{ base: '3', md: '4' }} mb={{ base: '3', md: '5' }}>
          <Box>
            <HStack gap="2" wrap="wrap" mb="2">
              <Tag borderRadius="full" bg="#DDF5FF" color={COLORS.primary} fontWeight="900">
                <TagLabel>Bước {safeStep + 1}/{steps.length}</TagLabel>
              </Tag>
              {activeModeDepth ? (
                <Tag borderRadius="full" bg={activeModeDepth.isReady ? '#ECFDF5' : '#FFF7ED'} color={activeModeDepth.isReady ? '#047857' : '#C2410C'} fontWeight="900">
                  <TagLabel>{activeModeDepth.readinessScore}/100 · {activeModeDepth.itemCount} câu/thẻ</TagLabel>
                </Tag>
              ) : null}
            </HStack>
            <Text fontSize={{ base: 'xl', md: '3xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.1">
              {step.label}
            </Text>
            <Text mt="2" color={COLORS.muted} fontWeight="700" fontSize={{ base: 'sm', md: 'md' }}>{activeModeDepth?.guidanceVi ?? 'Tập trung một hoạt động trước, các phần luyện khác nằm gọn bên dưới.'}</Text>
          </Box>
          <HStack gap="2" wrap="wrap" maxH={{ base: '42px', md: 'none' }} overflowX={{ base: 'auto', md: 'visible' }} overflowY="hidden" w={{ base: '100%', md: 'auto' }} pb={{ base: '1', md: '0' }}>
            {steps.map((item, index) => {
              const selected = index === safeStep;
              return (
                <Button key={item.mode} size={{ base: 'xs', md: 'sm' }} flexShrink={0} borderRadius="full" leftIcon={<Icon as={item.icon} />} bg={selected ? COLORS.primary : 'rgba(255,255,255,0.72)'} color={selected ? 'white' : COLORS.primary} border="1px solid" borderColor={selected ? COLORS.primary : '#BAE6FD'} _hover={{ bg: selected ? '#1D4ED8' : '#EFF6FF' }} onClick={() => onStepChange(index)}>
                  {item.label}
                </Button>
              );
            })}
          </HStack>
        </Flex>
        {practiceContentDepth ? (
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="2" mb="3" display={{ base: 'none', md: 'grid' }}>
            <MiniMetric value={practiceContentDepth.readyModeCount} label="phần sẵn sàng" />
            <MiniMetric value={practiceContentDepth.totalPracticeItems} label="câu/thẻ luyện" />
            <MiniMetric value={activeModeDepth?.readinessLabelVi ?? 'Đang đọc'} label="độ sẵn sàng" />
            <MiniMetric value={practiceContentDepth.recommendedModeDepth?.labelVi ?? 'Bài học'} label="phần nên luyện" />
          </SimpleGrid>
        ) : null}
        <Box ref={contentRef} data-testid="lesson-guided-mode-content" data-lesson-mode={step.mode} bg={{ base: 'rgba(255,255,255,0.78)', md: 'rgba(255,255,255,0.86)' }} border="1px solid" borderColor="rgba(186,230,253,0.88)" borderRadius="3xl" p={{ base: '3', md: '5' }} minH={{ base: 'auto', md: '220px' }} opacity={1} visibility="visible" willChange="transform" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)">
          <ModeLearningBlock lesson={lesson} mode={step.mode} speakEnglish={speakEnglish} />
        </Box>
        <Flex mt={{ base: '3', md: '5' }} justify="space-between" align={{ base: 'stretch', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={{ base: '2', md: '3' }} scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)">
          <Button display={{ base: 'none', sm: 'inline-flex' }} onClick={() => onStepChange(Math.max(0, safeStep - 1))} isDisabled={!canGoBack} variant="outline" borderRadius="full" leftIcon={<Icon as={ArrowLeft} />} borderColor="#BAE6FD" color={COLORS.primary}>Quay lại</Button>
          <HStack gap={{ base: '2', md: '3' }} justify={{ base: 'stretch', sm: 'end' }} flexWrap="wrap" w={{ base: '100%', sm: 'auto' }}>
            <Button as={Link} to={practiceUrl} isDisabled={learningLocked} borderRadius="full" bg={COLORS.green} color="white" leftIcon={<Icon as={Play} />} _hover={{ bg: '#16A34A' }} flex={{ base: '1 1 100%', sm: '0 0 auto' }}>Luyện ngay</Button>
            <Button onClick={() => onStepChange(Math.min(steps.length - 1, safeStep + 1))} isDisabled={!canGoNext} borderRadius="full" size={{ base: 'sm', md: 'md' }} variant="outline" borderColor={COLORS.border} bg="white" color={COLORS.primary} rightIcon={<Icon as={ArrowRight} />} _hover={{ bg: canGoNext ? '#EFF6FF' : 'white' }} flex={{ base: '1', sm: '0 0 auto' }}>Tiếp tục</Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}

function ModeLearningBlock({ lesson, mode, speakEnglish }: { lesson: EnglishLesson; mode: LessonProgressMode; speakEnglish: (text: string) => void }) {
  if (mode === 'flashcard') {
    return <FlashcardPreview lesson={lesson} speakEnglish={speakEnglish} />;
  }
  if (mode === 'quiz') {
    const items = lesson.quizQuestions.slice(0, 3).map((q) => ({ title: q.question ?? q.prompt ?? q.vietnamese ?? 'Kiểm tra nhanh', text: q.options?.join(' • ') ?? q.words?.join(' / ') ?? 'Tự trả lời nhanh.', hint: q.explanationVi ?? 'Mở phần Kiểm tra nhanh để kiểm tra.' }));
    return <PreviewList items={items} empty="Chưa có câu kiểm tra nhanh để xem trước." />;
  }
  if (mode === 'listen') {
    return <PreviewList items={lesson.listeningPractice.slice(0, 3).map((item) => ({ title: item.question, text: item.text, hint: item.answer }))} empty="Chưa có bài nghe." speakEnglish={speakEnglish} />;
  }
  if (mode === 'reflex') {
    return <PreviewList items={lesson.speakingReflexPrompts.slice(0, 3).map((item) => ({ title: item.promptVi, text: item.hint, hint: item.expectedEnglish }))} empty="Chưa có câu luyện phản xạ." />;
  }
  if (mode === 'type') {
    const blanks = lesson.fillBlankTasks.slice(0, 2).map((item) => ({ title: item.prompt, text: item.hint || 'Nhìn gợi ý rồi gõ phần còn thiếu trong phần luyện tập.', hint: 'Gõ phần còn thiếu trong phần luyện tập.' }));
    const orders = lesson.sentenceOrderingTasks.slice(0, 2).map((item) => ({ title: item.vietnamese, text: item.words.join(' / '), hint: 'Sắp xếp thành câu đúng.' }));
    return <PreviewList items={[...blanks, ...orders]} empty="Chưa có câu gõ để luyện." />;
  }
  if (mode === 'match') {
    const pairs = (lesson.matchPairs ?? []).slice(0, 4).map((item) => ({ title: item.left, text: item.right, hint: 'Ghép hai vế tương ứng.' }));
    const vocabPairs = lesson.vocabulary.slice(0, 4).map((item) => ({ title: item.term, text: item.meaningVi, hint: 'Ghép từ với nghĩa.' }));
    return <PreviewList items={pairs.length > 0 ? pairs : vocabPairs} empty="Chưa có cặp từ để luyện ghép." />;
  }
  return (
    <Flex direction={{ base: 'column', md: 'row' }} gap="4" align="stretch">
      <Box className="lesson-flow-card" flex="1" bg="#EFF6FF" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="5">
        <Text fontSize="2xl" fontWeight="950" color={COLORS.text}>Tốc độ / phát âm</Text>
        <Text mt="2" color={COLORS.muted}>Nhận diện từ/cụm nhanh, luyện miệng đọc chắc hơn trước khi chuyển bài.</Text>
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3" mt="4">
          <MiniMetric value={lesson.vocabulary.length} label="từ" />
          <MiniMetric value={lesson.quizQuestions.length} label="câu kiểm tra" />
          <MiniMetric value="60s" label="mỗi lượt" />
        </SimpleGrid>
      </Box>
      <Box className="lesson-flow-card" w={{ base: '100%', md: '180px' }} bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="5" textAlign="center">
        <Text fontSize="5xl">🐋</Text>
        <Text mt="2" fontWeight="900" color={COLORS.text}>Nhanh mà chắc</Text>
      </Box>
    </Flex>
  );
}

function FlashcardPreview({ lesson, speakEnglish }: { lesson: EnglishLesson; speakEnglish: (text: string) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cards = lesson.vocabulary;
  const active = cards[activeIndex];
  const goPrevious = () => setActiveIndex((current) => (current === 0 ? cards.length - 1 : current - 1));
  const goNext = () => setActiveIndex((current) => (current + 1) % cards.length);

  if (!active) return <Text color={COLORS.muted} fontWeight="800">Chưa có thẻ từ để xem trước.</Text>;

  return (
    <Box data-testid="lesson-flashcard-preview" minH={{ base: 'auto', md: '180px' }} opacity={1} visibility="visible">
      <Box data-testid="lesson-flashcard-visible-text" srOnly>{cards.slice(0, 6).map((item) => `${item.term} ${item.meaningVi}`).join(' · ')}</Box>
      <Box display={{ base: 'block', md: 'none' }} data-testid="lesson-flashcard-preview-mobile">
        <Box className="lesson-flow-card" bg="rgba(255,255,255,0.9)" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" p="3" minH="184px" willChange="transform, opacity">
          <HStack justify="space-between" align="start" gap="3">
            <Box minW="0">
              <Text fontSize="xs" fontWeight="900" color={COLORS.primary}>Thẻ {activeIndex + 1}/{cards.length}</Text>
              <Text mt="2" fontSize="2xl" fontWeight="950" color={COLORS.text}>{active.term}</Text>
              {active.pronunciation ? <Text mt="1" color={COLORS.muted} fontSize="sm">{active.pronunciation}</Text> : null}
            </Box>
            <Button size="sm" borderRadius="full" onClick={() => speakEnglish(active.term)}>Nghe</Button>
          </HStack>
          <Text mt="4" fontWeight="900" color={COLORS.primary}>{active.meaningVi}</Text>
          <Text mt="3" color={COLORS.text}>{active.example}</Text>
          <Text mt="1" color={COLORS.muted} fontSize="sm">{active.exampleMeaningVi}</Text>
        </Box>
        <HStack mt="2" justify="space-between" gap="2" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)">
          <Button size="sm" borderRadius="full" variant="outline" onClick={goPrevious} leftIcon={<Icon as={ArrowLeft} />}>Trước</Button>
          <Button size="sm" borderRadius="full" bg={COLORS.primary} color="white" onClick={goNext} rightIcon={<Icon as={ArrowRight} />} _hover={{ bg: '#1D4ED8' }}>Thẻ tiếp</Button>
        </HStack>
        <Box as="details" mt="2" bg="rgba(248,252,255,0.54)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p="2" fontSize="sm">
          <Box as="summary" cursor="pointer" fontWeight="850" color={COLORS.primary}>Xem tất cả từ vựng</Box>
          <SimpleGrid columns={1} gap="2" mt="3" maxH="320px" overflowY="auto" pr="1">
            {cards.map((item) => <FlowCard key={item.id} title={item.term} text={item.meaningVi} hint={item.exampleMeaningVi || item.example} onClick={() => speakEnglish(item.term)} />)}
          </SimpleGrid>
        </Box>
      </Box>
      <SimpleGrid data-testid="lesson-flashcard-preview-desktop" display={{ base: 'none', md: 'grid' }} columns={{ md: 2, xl: 3 }} gap="4" minH="170px" opacity={1} visibility="visible">
        {cards.slice(0, 6).map((item) => <FlowCard key={item.id} title={item.term} text={item.meaningVi} hint={item.exampleMeaningVi || item.example} onClick={() => speakEnglish(item.term)} />)}
      </SimpleGrid>
    </Box>
  );
}

function PreviewList({ items, empty, speakEnglish }: { items: Array<{ title: string; text: string; hint: string }>; empty: string; speakEnglish?: (text: string) => void }) {
  if (items.length === 0) return <Text color={COLORS.muted} fontWeight="800">{empty}</Text>;
  return <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="4">{items.map((item, index) => <FlowCard key={`${item.title}-${index}`} {...item} onClick={speakEnglish ? () => speakEnglish(item.text) : undefined} />)}</SimpleGrid>;
}

function FlowCard({ title, text, hint, onClick }: { title: string; text: string; hint: string; onClick?: () => void }) {
  return (
    <Box className="lesson-flow-card" data-testid="lesson-flow-card" bg="rgba(255,255,255,0.92)" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4" minH="150px" opacity={1} visibility="visible" willChange="transform">
      <HStack justify="space-between" align="start" gap="3">
        <Box minW="0">
          <Text fontWeight="950" color={COLORS.text}>{title}</Text>
          <Text mt="2" color={COLORS.text}>{text}</Text>
          <Text mt="2" color={COLORS.muted} fontSize="sm">{hint}</Text>
        </Box>
        {onClick ? <Button size="xs" borderRadius="full" onClick={onClick}>Nghe</Button> : null}
      </HStack>
    </Box>
  );
}

function MiniMetric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <Box bg="rgba(255,255,255,0.9)" border="1px solid" borderColor={COLORS.border} borderRadius="xl" p="3">
      <Text fontWeight="950" color={COLORS.primary}>{value}</Text>
      <Text color={COLORS.muted} fontSize="sm">{label}</Text>
    </Box>
  );
}
