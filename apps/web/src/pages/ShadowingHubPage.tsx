import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Flex, HStack, Icon, SimpleGrid, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { ArrowRight, BookOpen, Clock, Mic, Sparkles, Video, Waves } from 'lucide-react';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { GlassPanel } from '../components/p-english/OceanBackdrop';
import { readShadowingProgressStore, type ShadowingProgressEntry } from '../hooks/useShadowingProgress';
import { shadowingLevels, shadowingLessons, shadowingPronunciationFocus, shadowingTopics, type ShadowingLesson } from '../data/shadowingLessons';

const COLORS = {
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  green: '#22C55E',
};

const PIXEL_ASSETS = {
  microNormal: '/assets/shadowing-pixel/micro-normal.png',
  pooNeutral: '/assets/shadowing-pixel/poo-neutral.png',
  pooConfused: '/assets/shadowing-pixel/poo-confused.png',
  bubbleCorner: '/assets/shadowing-pixel/bubble-corner.png',
  waveDivider: '/assets/shadowing-pixel/wave-divider.png',
  badgeHard: '/assets/shadowing-pixel/badge-hard.png',
};

const LinkedGlassPanel = GlassPanel as any;

type LessonWithProgress = ShadowingLesson & {
  progress?: ShadowingProgressEntry;
  practicedCount: number;
  difficultCount: number;
};

function lessonPath(lessonId: string) {
  return `/shadowing/practice/${lessonId}`;
}

function cleanTitle(title: string) {
  return title.replace(/^(A1|A2|B1)\s*·\s*/i, '');
}

function LessonCard({ lesson, compact = false }: { lesson: LessonWithProgress; compact?: boolean }) {
  const progressPercent = lesson.sentenceCount > 0 ? Math.round((lesson.practicedCount / lesson.sentenceCount) * 100) : 0;

  return (
    <LinkedGlassPanel
      as={Link}
      to={lessonPath(lesson.id)}
      className="penglish-glass-card"
      p={{ base: '3', md: compact ? '3.5' : '4' }}
      bg="rgba(255,255,255,0.76)"
      border="1px solid"
      borderColor="rgba(186,230,253,0.86)"
      borderRadius="3xl"
      boxShadow="0 14px 34px rgba(31,111,214,0.07)"
      position="relative"
      overflow="hidden"
      minW="0"
      _hover={{ transform: 'translateY(-2px)', borderColor: COLORS.oceanBlue, bg: 'rgba(255,255,255,0.88)' }}
      transition="transform .18s ease, background .18s ease, border-color .18s ease"
      data-testid={`shadowing-hub-lesson-${lesson.id}`}
    >
      <Box as="img" src={PIXEL_ASSETS.bubbleCorner} alt="" className="pooPixelDecor" position="absolute" right="-10px" top="-10px" w="70px" opacity="0.18" />
      <VStack align="stretch" gap="2.5" position="relative">
        <HStack justify="space-between" align="start" gap="3">
          <Box minW="0">
            <HStack gap="1.5" wrap="wrap" mb="1.5">
              <Tag size="sm" borderRadius="full" bg={COLORS.softBlue} color={COLORS.deepBlue}><TagLabel>{lesson.level}</TagLabel></Tag>
              <Tag size="sm" borderRadius="full" bg="#F0FDF4" color="#15803D"><TagLabel>{lesson.topic}</TagLabel></Tag>
            </HStack>
            <Text fontSize={{ base: 'md', md: compact ? 'lg' : 'xl' }} fontWeight="900" color={COLORS.text} lineHeight="1.18" noOfLines={2}>{cleanTitle(lesson.title)}</Text>
          </Box>
          <Box as="img" src={PIXEL_ASSETS.microNormal} alt="Micro Shadowing" className="pooPixelIcon" w="34px" h="34px" flexShrink={0} />
        </HStack>
        <Text color={COLORS.muted} fontSize="sm" fontWeight="700" lineHeight="1.55" noOfLines={compact ? 2 : 3}>{lesson.description}</Text>
        <HStack gap="2" wrap="wrap" color={COLORS.muted} fontSize="xs" fontWeight="850">
          <HStack gap="1"><Icon as={Clock} boxSize="3.5" /><Text>{lesson.durationMinutes} phút</Text></HStack>
          <HStack gap="1"><Icon as={BookOpen} boxSize="3.5" /><Text>{lesson.sentenceCount} câu</Text></HStack>
          <Text color={COLORS.deepBlue}>{progressPercent}% đã luyện</Text>
        </HStack>
      </VStack>
    </LinkedGlassPanel>
  );
}

function FilterPill({ label, helper, to }: { label: string; helper?: string; to: string }) {
  return (
    <Button as={Link} to={to} justifyContent="space-between" rightIcon={<Icon as={ArrowRight} />} borderRadius="2xl" bg="rgba(255,255,255,0.76)" color={COLORS.text} border="1px solid" borderColor="rgba(186,230,253,0.82)" h="auto" py="3" px="3.5" _hover={{ bg: COLORS.softBlue, borderColor: COLORS.oceanBlue }}>
      <Box textAlign="left" minW="0">
        <Text fontWeight="900" fontSize="sm" noOfLines={1}>{label}</Text>
        {helper ? <Text color={COLORS.muted} fontSize="xs" fontWeight="700" noOfLines={1}>{helper}</Text> : null}
      </Box>
    </Button>
  );
}

export function ShadowingHubPage() {
  const progressStore = useMemo(() => readShadowingProgressStore(), []);
  const lessonsWithProgress = useMemo<LessonWithProgress[]>(() => shadowingLessons.map((lesson) => {
    const progress = progressStore[lesson.id];
    return {
      ...lesson,
      progress,
      practicedCount: progress?.practicedLineIds.length ?? 0,
      difficultCount: progress?.difficultLineIds.length ?? 0,
    };
  }), [progressStore]);

  const recentLesson = useMemo(() => {
    return lessonsWithProgress
      .filter((lesson) => lesson.progress?.updatedAt)
      .sort((a, b) => String(b.progress?.updatedAt).localeCompare(String(a.progress?.updatedAt)))[0] ?? lessonsWithProgress[0];
  }, [lessonsWithProgress]);

  const suggestedLessons = lessonsWithProgress.filter((lesson) => lesson.level === 'A1').slice(0, 3);
  const difficultSentences = useMemo(() => lessonsWithProgress.flatMap((lesson) => {
    const difficultIds = new Set(lesson.progress?.difficultLineIds ?? []);
    return lesson.sentences
      .filter((sentence) => difficultIds.has(`${lesson.id}-${sentence.id}`))
      .slice(0, 3)
      .map((sentence) => ({ lesson, sentence }));
  }).slice(0, 4), [lessonsWithProgress]);

  return (
    <OceanPageShell variant="shadowing" overlayStrength="medium" data-testid="shadowing-hub-page" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 92px)', lg: '10' }} pt={{ base: '3', md: 'calc(68px + 1.25rem)', lg: 'calc(72px + 1.5rem)' }} overflowX="hidden">
      <Box maxW="1180px" mx="auto" minW="0" pb={{ base: '128px', lg: '0' }}>
        <Flex className="penglish-glass-card" data-testid="shadowing-hub-hero" mb={{ base: '3', md: '5' }} p={{ base: '3.5', md: '6' }} borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor={COLORS.border} boxShadow="0 18px 44px rgba(31,111,214,0.08)" direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} justify="space-between" gap="4" position="relative" overflow="hidden" backdropFilter="blur(14px) saturate(1.1)">
          <Box className="shadowing-ocean-bubble" position="absolute" right="-58px" top="-64px" w="220px" h="220px" borderRadius="full" bg="rgba(221,245,255,0.78)" pointerEvents="none" />
          <Box minW="0" position="relative" flex="1">
            <HStack gap="2" wrap="wrap" mb="3">
              <Tag borderRadius="full" bg={COLORS.softBlue} color={COLORS.deepBlue}><TagLabel>Module riêng</TagLabel></Tag>
              <Tag borderRadius="full" bg="#F0FDF4" color="#15803D"><TagLabel>Nghe · Nói · Góp ý</TagLabel></Tag>
            </HStack>
            <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.06">Shadowing cùng Poo</Text>
            <Text mt="2" color={COLORS.muted} maxW="720px" fontSize={{ base: 'sm', md: 'md' }} fontWeight="750" lineHeight="1.7">Nghe mẫu, nói theo nhịp, để Poo góp ý nhẹ nhàng từng câu.</Text>
          </Box>
          <Flex position="relative" align="center" justify="center" gap="3" flexShrink={0}>
            <Box as="img" src={PIXEL_ASSETS.pooNeutral} alt="Poo rủ luyện Shadowing" className="pooPixelMascot" w={{ base: '76px', md: '104px' }} h={{ base: '76px', md: '104px' }} />
            <Box as="img" src={PIXEL_ASSETS.microNormal} alt="Micro Shadowing" className="pooPixelIcon" w={{ base: '44px', md: '58px' }} h={{ base: '44px', md: '58px' }} />
          </Flex>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: '3', md: '4' }} mb={{ base: '3', md: '5' }}>
          <GlassPanel data-testid="shadowing-hub-continue" p={{ base: '3.5', md: '5' }} bg="rgba(255,255,255,0.76)" borderColor={COLORS.border} borderRadius="3xl" position="relative" overflow="hidden">
            <Box as="img" src={PIXEL_ASSETS.waveDivider} alt="" className="pooPixelDecor" position="absolute" bottom="12px" right="18px" w="160px" opacity="0.22" />
            <VStack align="stretch" gap="3" position="relative">
              <HStack justify="space-between" gap="3" align="start">
                <Box minW="0">
                  <Text fontSize="sm" fontWeight="950" color={COLORS.deepBlue} textTransform="uppercase" letterSpacing="0.08em">Luyện tiếp hôm nay</Text>
                  <Text mt="1" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.12" noOfLines={2}>{cleanTitle(recentLesson.title)}</Text>
                </Box>
                <Icon as={Waves} color={COLORS.oceanBlue} boxSize="7" />
              </HStack>
              <Text color={COLORS.muted} fontSize="sm" fontWeight="750" lineHeight="1.6">Đã luyện {recentLesson.practicedCount}/{recentLesson.sentenceCount} câu · Câu khó {recentLesson.difficultCount}.</Text>
              <HStack gap="2" wrap="wrap">
                <Button as={Link} to={lessonPath(recentLesson.id)} borderRadius="full" bg={COLORS.deepBlue} color="white" rightIcon={<Icon as={ArrowRight} />} _hover={{ bg: COLORS.oceanBlue }}>Luyện tiếp</Button>
                <Button as={Link} to="/video-lab" borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Video} />} _hover={{ bg: COLORS.softBlue }}>Tạo bài Shadowing từ video</Button>
              </HStack>
            </VStack>
          </GlassPanel>

          <GlassPanel data-testid="shadowing-hub-suggestions" p={{ base: '3.5', md: '5' }} bg="rgba(255,255,255,0.76)" borderColor={COLORS.border} borderRadius="3xl">
            <HStack justify="space-between" mb="3" gap="3">
              <Box minW="0">
                <Text fontSize="sm" fontWeight="950" color={COLORS.deepBlue} textTransform="uppercase" letterSpacing="0.08em">Bài gợi ý cho bạn</Text>
                <Text color={COLORS.muted} fontSize="sm" fontWeight="750">3 bài A1 đầu tiên để bắt nhịp nhẹ.</Text>
              </Box>
              <Icon as={Sparkles} color={COLORS.oceanBlue} boxSize="6" />
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 3, lg: 1 }} gap="2.5">
              {suggestedLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} compact />)}
            </SimpleGrid>
          </GlassPanel>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, xl: 3 }} gap={{ base: '3', md: '4' }} mb={{ base: '3', md: '5' }}>
          <GlassPanel p="4" bg="rgba(255,255,255,0.70)" borderColor={COLORS.border} borderRadius="3xl" data-testid="shadowing-hub-levels">
            <Text fontWeight="950" color={COLORS.text} mb="3">Theo cấp độ</Text>
            <VStack align="stretch" gap="2">
              {shadowingLevels.map((item) => <FilterPill key={item.level} label={item.label} helper={item.description} to={lessonPath(shadowingLessons.find((lesson) => lesson.level === item.level)?.id ?? shadowingLessons[0].id)} />)}
            </VStack>
          </GlassPanel>
          <GlassPanel p="4" bg="rgba(255,255,255,0.70)" borderColor={COLORS.border} borderRadius="3xl" data-testid="shadowing-hub-topics">
            <Text fontWeight="950" color={COLORS.text} mb="3">Theo chủ đề</Text>
            <SimpleGrid columns={2} gap="2">
              {shadowingTopics.map((topic) => <FilterPill key={topic} label={topic} to={lessonPath(shadowingLessons.find((lesson) => lesson.topic === topic)?.id ?? shadowingLessons[0].id)} />)}
            </SimpleGrid>
          </GlassPanel>
          <GlassPanel p="4" bg="rgba(255,255,255,0.70)" borderColor={COLORS.border} borderRadius="3xl" data-testid="shadowing-hub-pronunciation">
            <Text fontWeight="950" color={COLORS.text} mb="3">Phát âm cần luyện</Text>
            <SimpleGrid columns={2} gap="2">
              {shadowingPronunciationFocus.map((focus) => <FilterPill key={focus} label={focus} to={lessonPath(shadowingLessons.find((lesson) => lesson.pronunciationFocus?.some((item) => item.toLowerCase().includes(focus.replace('/', '').toLowerCase())))?.id ?? shadowingLessons[0].id)} />)}
            </SimpleGrid>
          </GlassPanel>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: '3', md: '4' }} alignItems="start">
          <VStack align="stretch" gap="3" gridColumn={{ base: 'auto', lg: 'span 2' }}>
            <HStack justify="space-between" gap="3" wrap="wrap">
              <Box>
                <Text as="h2" fontSize={{ base: 'lg', md: '2xl' }} fontWeight="950" color={COLORS.text}>Tất cả bài Shadowing</Text>
                <Text color={COLORS.muted} fontSize="sm" fontWeight="750">Chọn bài, nghe mẫu, rồi luyện từng câu.</Text>
              </Box>
              <Tag borderRadius="full" bg={COLORS.softBlue} color={COLORS.deepBlue}><TagLabel>{shadowingLessons.length} bài</TagLabel></Tag>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
              {lessonsWithProgress.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
            </SimpleGrid>
          </VStack>

          <GlassPanel data-testid="shadowing-hub-difficult" p={{ base: '3.5', md: '4' }} bg="rgba(255,255,255,0.76)" borderColor={COLORS.border} borderRadius="3xl" position={{ lg: 'sticky' }} top={{ lg: '96px' }}>
            <HStack justify="space-between" mb="3" gap="3">
              <Box minW="0">
                <Text fontWeight="950" color={COLORS.text}>Câu khó đã lưu</Text>
                <Text color={COLORS.muted} fontSize="sm" fontWeight="750">Poo gom lại để bạn quay lại luyện.</Text>
              </Box>
              <Box as="img" src={difficultSentences.length ? PIXEL_ASSETS.badgeHard : PIXEL_ASSETS.pooConfused} alt="Câu khó" className="pooPixelBadge" w="42px" h="42px" />
            </HStack>
            {difficultSentences.length ? (
              <VStack align="stretch" gap="2.5">
                {difficultSentences.map(({ lesson, sentence }) => (
                  <LinkedGlassPanel key={`${lesson.id}-${sentence.id}`} as={Link} to={lessonPath(lesson.id)} p="3" bg="#FFFBEB" border="1px solid" borderColor="#FDE68A" borderRadius="2xl" _hover={{ bg: '#FEF3C7' }}>
                    <Text fontWeight="850" color={COLORS.text} lineHeight="1.4">{sentence.text}</Text>
                    <Text mt="1" color={COLORS.muted} fontSize="xs" fontWeight="750" noOfLines={1}>{cleanTitle(lesson.title)}</Text>
                  </LinkedGlassPanel>
                ))}
              </VStack>
            ) : (
              <Flex direction="column" align="center" textAlign="center" p="4" border="1px dashed" borderColor={COLORS.border} borderRadius="2xl" bg="rgba(232,244,255,0.54)">
                <Box as="img" src={PIXEL_ASSETS.pooConfused} alt="Poo chưa thấy câu khó" className="pooPixelMascot" w="74px" h="74px" />
                <Text mt="2" fontWeight="900" color={COLORS.text}>Chưa có câu khó nào.</Text>
                <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="750" lineHeight="1.55">Khi luyện bài, bấm “Câu còn vấp” để Poo giữ lại tại đây.</Text>
              </Flex>
            )}
          </GlassPanel>
        </SimpleGrid>
      </Box>
    </OceanPageShell>
  );
}
