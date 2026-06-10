import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Box, Flex, HStack, Icon, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { BookOpen, MessageCircle, Mic2, Play, Sparkles, Zap } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { createFloatLoop, safeGsapSet } from '../../lib/animations/gsap-utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export type LessonGuideStepIndex = 0 | 1 | 2 | 3 | 4;

const GUIDE_COLORS = {
  card: '#FFFFFF',
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  green: '#22C55E',
  amber: '#F59E0B',
};

const STEP_GUIDES: Record<LessonGuideStepIndex, {
  icon: any;
  badge: string;
  title: string;
  nextAction: string;
  guideText: string;
  scene: 'vocabulary' | 'pattern' | 'dialogue' | 'practice' | 'speed';
}> = {
  0: {
    icon: BookOpen,
    badge: 'Bước 1 • Từ mới',
    title: 'Cá voi nhỏ chỉ bạn nhìn từ như một đồ vật thật.',
    nextAction: 'Bắt đầu bằng vài từ/cụm quan trọng nhất, chưa cần học hết một lần.',
    guideText: 'Nhìn hình trước, đoán nghĩa, rồi mới đọc từ.',
    scene: 'vocabulary',
  },
  1: {
    icon: MessageCircle,
    badge: 'Bước 2 • Mẫu câu',
    title: 'Cá voi nhỏ đưa mẫu câu vào bong bóng nói.',
    nextAction: 'Đọc mẫu câu thật chậm, thay một từ nhỏ, rồi nói lại bằng giọng của bạn.',
    guideText: 'Đọc mẫu câu chậm trước, sau đó thử nói nhanh hơn.',
    scene: 'pattern',
  },
  2: {
    icon: Mic2,
    badge: 'Bước 3 • Hội thoại',
    title: 'Hai bạn nhỏ thay phiên nói để bạn nghe nhịp hội thoại.',
    nextAction: 'Đọc vai A trước, sau đó đọc vai B. Nếu bí, chỉ cần lặp lại câu ngắn nhất.',
    guideText: 'Nghe nhịp trước, đọc theo vai A/B, rồi lặp lại câu bạn thấy tự nhiên nhất.',
    scene: 'dialogue',
  },
  3: {
    icon: Play,
    badge: 'Bước 4 • Luyện tập',
    title: 'Cá voi nhỏ rủ bạn chuyển sang luyện tập khi đã đủ tự tin.',
    nextAction: 'Nếu bạn hiểu phần lớn nội dung, hãy bấm luyện ngay để biến kiến thức thành phản xạ.',
    guideText: 'Bấm luyện tập khi bạn đã hiểu khoảng 70%.',
    scene: 'practice',
  },
  4: {
    icon: Zap,
    badge: 'Bước 5 • Luyện tốc độ',
    title: 'Cá voi nhỏ tăng năng lượng nhưng vẫn nhắc bạn giữ bình tĩnh.',
    nextAction: 'Chơi nhanh vừa đủ, ưu tiên đúng và rõ trước khi tăng tốc.',
    guideText: 'Giữ nhịp nhanh vừa phải: đúng và rõ trước, tốc độ sau.',
    scene: 'speed',
  },
};

function WhaleBody({ energetic = false }: { energetic?: boolean }) {
  return (
    <Box
      className="lesson-guide-character"
      position="relative"
      w="96px"
      h="62px"
      aria-hidden="true"
      willChange="transform, opacity"
    >
      <Box position="absolute" left="8px" top="14px" w="64px" h="38px" borderRadius="58% 46% 50% 58% / 54% 56% 46% 50%" bg={`linear-gradient(145deg, #AEE7FF 0%, ${GUIDE_COLORS.oceanBlue} 56%, ${GUIDE_COLORS.deepBlue} 120%)`} boxShadow="0 14px 28px rgba(31,111,214,0.16)">
        <Box position="absolute" left="12px" bottom="5px" w="38px" h="13px" borderRadius="full" bg="rgba(255,255,255,0.58)" />
        <Box position="absolute" right="14px" top="11px" w="7px" h="7px" borderRadius="full" bg="white">
          <Box position="absolute" left="2px" top="2px" w="3px" h="3px" borderRadius="full" bg={GUIDE_COLORS.text} />
        </Box>
      </Box>
      <HStack className="lesson-guide-tail" position="absolute" right="2px" top="24px" gap="0" willChange="transform, opacity">
        <Box w="18px" h="14px" bg={GUIDE_COLORS.oceanBlue} borderRadius="72% 28% 70% 30%" transform="rotate(32deg)" />
        <Box ml="-8px" w="18px" h="14px" bg={GUIDE_COLORS.deepBlue} borderRadius="28% 72% 30% 70%" transform="rotate(-32deg)" opacity="0.82" />
      </HStack>
      <Box className="lesson-guide-fin" position="absolute" left="28px" top="42px" w="18px" h="10px" bg="rgba(255,255,255,0.62)" borderRadius="60% 40% 70% 30%" transform="rotate(-16deg)" willChange="transform, opacity" />
      {energetic ? <Text className="lesson-guide-spark" position="absolute" right="-4px" top="-2px" fontSize="lg" willChange="transform, opacity">⚡</Text> : null}
    </Box>
  );
}

function LessonGuideVisual({ scene }: { scene: (typeof STEP_GUIDES)[LessonGuideStepIndex]['scene'] }) {
  if (scene === 'dialogue') {
    return (
      <Flex align="center" justify="center" gap="3" minH="112px">
        <VStack className="lesson-guide-dialogue-person" gap="1" willChange="transform, opacity">
          <Flex w="54px" h="54px" borderRadius="full" bg={GUIDE_COLORS.softBlue} align="center" justify="center" fontSize="2xl">🙂</Flex>
          <Box px="3" py="1.5" borderRadius="full" bg="white" border="1px solid" borderColor={GUIDE_COLORS.border} fontWeight="900" color={GUIDE_COLORS.deepBlue}>A</Box>
        </VStack>
        <Box className="lesson-guide-bubble" px="3" py="2" borderRadius="2xl" bg="white" border="1px solid" borderColor={GUIDE_COLORS.border} color={GUIDE_COLORS.muted} fontSize="sm" fontWeight="800" willChange="transform, opacity">Hi!</Box>
        <VStack className="lesson-guide-dialogue-person" gap="1" willChange="transform, opacity">
          <Flex w="54px" h="54px" borderRadius="full" bg="#F0FDF4" align="center" justify="center" fontSize="2xl">😊</Flex>
          <Box px="3" py="1.5" borderRadius="full" bg="white" border="1px solid" borderColor={GUIDE_COLORS.border} fontWeight="900" color="#15803D">B</Box>
        </VStack>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" minH="112px" position="relative">
      <WhaleBody energetic={scene === 'speed'} />
      {scene === 'vocabulary' ? <Box className="lesson-guide-copy-card" ml="-1" px="3" py="2" borderRadius="xl" bg="white" border="1px solid" borderColor={GUIDE_COLORS.border} boxShadow="0 10px 20px rgba(31,111,214,0.08)" willChange="transform, opacity"><Text fontWeight="950" color={GUIDE_COLORS.text}>từ mới</Text><Text fontSize="xs" color={GUIDE_COLORS.muted}>đoán nghĩa</Text></Box> : null}
      {scene === 'pattern' ? <Box className="lesson-guide-bubble" ml="-1" maxW="150px" px="3" py="2" borderRadius="2xl" bg="white" border="1px solid" borderColor={GUIDE_COLORS.border} boxShadow="0 10px 20px rgba(31,111,214,0.08)" willChange="transform, opacity"><Text fontSize="sm" fontWeight="900" color={GUIDE_COLORS.deepBlue}>Mình nói được!</Text></Box> : null}
      {scene === 'practice' ? <Box className="lesson-guide-bubble" ml="-1" px="3" py="2" borderRadius="full" bg="#ECFDF5" border="1px solid #BBF7D0" willChange="transform, opacity"><Text fontSize="sm" fontWeight="950" color="#15803D">Luyện ngay?</Text></Box> : null}
      {scene === 'speed' ? <HStack className="lesson-guide-copy-card" ml="-1" gap="1" willChange="transform, opacity"><Box w="8px" h="8px" borderRadius="full" bg={GUIDE_COLORS.oceanBlue} /><Box w="8px" h="8px" borderRadius="full" bg={GUIDE_COLORS.green} /><Box w="8px" h="8px" borderRadius="full" bg={GUIDE_COLORS.amber} /></HStack> : null}
    </Flex>
  );
}

export function LessonGuideScene({ step, lessonTitle }: { step: LessonGuideStepIndex; lessonTitle: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const guide = STEP_GUIDES[step];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const character = root.querySelector('.lesson-guide-character');
      const tail = root.querySelector('.lesson-guide-tail');
      const fin = root.querySelector('.lesson-guide-fin');
      const spark = root.querySelector('.lesson-guide-spark');
      const bubbles = root.querySelectorAll('.lesson-guide-bubble');
      const copyCards = root.querySelectorAll('.lesson-guide-copy-card');
      const dialoguePeople = root.querySelectorAll('.lesson-guide-dialogue-person');

      if (reducedMotion) {
        safeGsapSet(character, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        safeGsapSet(tail, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        safeGsapSet(fin, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        safeGsapSet(spark, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        safeGsapSet(bubbles, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        safeGsapSet(copyCards, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        safeGsapSet(dialoguePeople, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        return;
      }

      if (character) {
        gsap.fromTo(
          character,
          { autoAlpha: 0, y: 10, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.34, ease: 'power2.out', force3D: true },
        );
        createFloatLoop(character, {
          x: guide.scene === 'speed' ? 5 : 3,
          y: guide.scene === 'speed' ? -5 : -6,
          rotation: guide.scene === 'speed' ? 1.2 : 0.6,
          duration: guide.scene === 'speed' ? 2.5 : 4.6,
          delay: 0.18,
        });
      }

      if (tail) {
        gsap.to(tail, { rotate: guide.scene === 'speed' ? 7 : 4, x: 1, duration: guide.scene === 'speed' ? 1.45 : 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true });
      }

      if (fin) {
        gsap.to(fin, { rotate: guide.scene === 'practice' ? -28 : -22, y: 1, duration: 2.1, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true });
      }

      if (spark) {
        gsap.fromTo(spark, { autoAlpha: 0, scale: 0.78, y: 4 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.28, ease: 'back.out(1.7)', force3D: true });
        gsap.to(spark, { scale: 1.08, rotate: 5, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true });
      }

      if (bubbles.length > 0) {
        gsap.fromTo(bubbles, { autoAlpha: 0, y: 8, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, delay: 0.1, stagger: 0.06, ease: 'power2.out', force3D: true });
        gsap.to(bubbles, { y: -3, duration: 3.2, delay: 0.36, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.08, force3D: true });
      }

      if (copyCards.length > 0) {
        gsap.fromTo(copyCards, { autoAlpha: 0, x: -8, scale: 0.97 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.3, delay: 0.12, stagger: 0.06, ease: 'power2.out', force3D: true });
      }

      if (dialoguePeople.length > 0) {
        gsap.fromTo(dialoguePeople, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out', force3D: true });
        gsap.to(dialoguePeople, { y: -3, duration: 2.8, delay: 0.32, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.16, force3D: true });
      }
    },
    { dependencies: [step, reducedMotion], scope: rootRef, revertOnUpdate: true },
  );

  return (
    <Box
      ref={rootRef}
      mb="6"
      bg="linear-gradient(135deg, #FFFFFF 0%, #F8FCFF 52%, #E8F4FF 100%)"
      border="1px solid"
      borderColor={GUIDE_COLORS.border}
      borderRadius="3xl"
      p={{ base: '4', md: '5' }}
      boxShadow="0 16px 38px rgba(31, 111, 214, 0.09)"
      overflow="hidden"
      position="relative"
    >
      <Box position="absolute" right="-58px" top="-58px" w="170px" h="170px" borderRadius="full" bg="rgba(91,188,235,0.15)" />
      <Flex position="relative" direction={{ base: 'column', md: 'row' }} align="center" gap={{ base: '4', md: '5' }}>
        <Box w={{ base: '100%', md: '210px' }} flexShrink={0} bg="rgba(255,255,255,0.70)" border="1px solid rgba(186,230,253,0.80)" borderRadius="3xl">
          <LessonGuideVisual scene={guide.scene} />
        </Box>
        <VStack align="start" gap="2" flex="1" w="100%">
          <HStack wrap="wrap" gap="2" align="center">
            <Tag borderRadius="full" bg={GUIDE_COLORS.softAqua} color={GUIDE_COLORS.deepBlue}>
              <TagLabel>🐋 Phiên học có hướng dẫn</TagLabel>
            </Tag>
            <Tag borderRadius="full" bg="white" color={GUIDE_COLORS.muted} border="1px solid" borderColor={GUIDE_COLORS.border}>
              <TagLabel>{guide.badge}</TagLabel>
            </Tag>
          </HStack>
          <HStack align="start" gap="3">
            <Flex w="42px" h="42px" borderRadius="2xl" bg={GUIDE_COLORS.softBlue} color={GUIDE_COLORS.deepBlue} align="center" justify="center" flexShrink={0}>
              <Icon as={guide.icon} boxSize="5" />
            </Flex>
            <Box>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="950" color={GUIDE_COLORS.deepBlue}>Cá voi nhỏ hướng dẫn bạn học</Text>
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="950" color={GUIDE_COLORS.text}>{guide.title}</Text>
              <Text mt="1" color={GUIDE_COLORS.muted} fontWeight="700">Bài: {lessonTitle}</Text>
            </Box>
          </HStack>
          <Box bg="white" border="1px solid" borderColor={GUIDE_COLORS.border} borderRadius="2xl" p="3" w="100%">
            <HStack align="start" gap="2">
              <Icon as={Sparkles} color={GUIDE_COLORS.oceanBlue} />
              <Box>
                <Text fontWeight="950" color={GUIDE_COLORS.text}>{guide.guideText}</Text>
                <Text mt="1" color={GUIDE_COLORS.muted} fontSize="sm" fontWeight="700">Tiếp theo: {guide.nextAction}</Text>
              </Box>
            </HStack>
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
}
