import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { createCardEntrance, safeGsapSet } from '../../lib/animations/gsap-utils';
import {
  getWordVisualScene,
  normalizeWordVisualKey,
  type WordVisualCategory,
  type WordVisualScene,
} from '../../lib/p-english/word-visual-map';
import { WordSceneBubble } from './WordSceneBubble';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export type WordSceneSize = 'compact' | 'normal' | 'large';
export type WordSceneMood = 'friendly' | 'thinking' | 'cheering' | 'listening' | 'speaking';

export type AnimatedWordSceneProps = {
  wordOrPhrase: string;
  meaningVi: string;
  example: string;
  visualCategory: WordVisualCategory;
  animatedSceneHint: string;
  pronunciationHintVi: string;
  size: WordSceneSize;
  mood: WordSceneMood;
  showSpeechBubble?: boolean;
};

const SCENE_COLORS = {
  card: '#FFFFFF',
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  whaleLight: '#AEE7FF',
};

const SIZE_STYLES: Record<WordSceneSize, { minH: string; visualW: string; emoji: string; pad: string; compact: boolean }> = {
  compact: { minH: '138px', visualW: '132px', emoji: '3xl', pad: '3', compact: true },
  normal: { minH: '176px', visualW: '168px', emoji: '4xl', pad: '4', compact: false },
  large: { minH: '218px', visualW: '210px', emoji: '5xl', pad: '5', compact: false },
};

const VISUAL_SCENE_BASE = {
  className: 'word-scene-visual',
  position: 'relative' as const,
  w: '118px',
  h: '104px',
  'aria-hidden': true,
  willChange: 'transform, opacity',
};

function SceneLabel({ children, accentColor }: { children: string; accentColor: string }) {
  return (
    <Box px="2.5" py="1" bg="white" border="1px solid" borderColor={accentColor} borderRadius="full" color={accentColor} fontSize="xs" fontWeight="950" boxShadow="0 8px 18px rgba(15,23,42,0.08)">
      {children}
    </Box>
  );
}

function SceneGround({ color = '#DBEAFE' }: { color?: string }) {
  return <Box className="word-scene-motion" position="absolute" left="8px" right="8px" bottom="10px" h="16px" borderRadius="full" bg={color} opacity="0.72" />;
}

const MOOD_COPY: Record<WordSceneMood, string> = {
  friendly: 'Nhìn hình rồi đọc thật tự nhiên.',
  thinking: 'Dừng một nhịp để đoán nghĩa trước khi đọc.',
  cheering: 'Bạn nhớ được rồi, đọc lại thêm một lần.',
  listening: 'Nghe âm chính, sau đó lặp lại chậm.',
  speaking: 'Nói thành tiếng để biến từ thành phản xạ.',
};

function WhaleCharacter({ waving = false }: { waving?: boolean }) {
  return (
    <Box className="word-scene-character" position="relative" w="104px" h="70px" aria-hidden="true" willChange="transform, opacity">
      <Box
        position="absolute"
        left="8px"
        top="16px"
        w="70px"
        h="42px"
        borderRadius="58% 46% 50% 58% / 54% 56% 46% 50%"
        bg={`linear-gradient(145deg, ${SCENE_COLORS.whaleLight} 0%, ${SCENE_COLORS.oceanBlue} 58%, ${SCENE_COLORS.deepBlue} 120%)`}
        boxShadow="0 14px 28px rgba(31,111,214,0.16)"
      >
        <Box position="absolute" left="13px" bottom="6px" w="42px" h="14px" borderRadius="full" bg="rgba(255,255,255,0.58)" />
        <Box position="absolute" right="15px" top="12px" w="7px" h="7px" borderRadius="full" bg="white">
          <Box position="absolute" left="2px" top="2px" w="3px" h="3px" borderRadius="full" bg={SCENE_COLORS.text} />
        </Box>
      </Box>
      <HStack position="absolute" right="4px" top="28px" gap="0">
        <Box w="18px" h="14px" bg={SCENE_COLORS.oceanBlue} borderRadius="72% 28% 70% 30%" transform="rotate(32deg)" />
        <Box ml="-8px" w="18px" h="14px" bg={SCENE_COLORS.deepBlue} borderRadius="28% 72% 30% 70%" transform="rotate(-32deg)" opacity="0.82" />
      </HStack>
      <Box position="absolute" left="31px" top="47px" w="18px" h="10px" bg="rgba(255,255,255,0.62)" borderRadius="60% 40% 70% 30%" transform="rotate(-16deg)" />
      {waving ? (
        <Text position="absolute" right="-4px" top="0" fontSize="2xl" transform="rotate(10deg)">
          👋
        </Text>
      ) : null}
    </Box>
  );
}

function Person({ label, color = '#DBEAFE' }: { label?: string; color?: string }) {
  return (
    <VStack gap="1" aria-hidden="true">
      <Flex w="46px" h="46px" borderRadius="full" bg={color} align="center" justify="center" fontSize="2xl">
        🙂
      </Flex>
      {label ? (
        <Box px="2" py="0.5" borderRadius="full" bg="white" border="1px solid" borderColor={SCENE_COLORS.border} color={SCENE_COLORS.deepBlue} fontWeight="950" fontSize="xs">
          {label}
        </Box>
      ) : null}
    </VStack>
  );
}

function NameTagVisual({ scene }: { scene: WordVisualScene }) {
  return (
    <Box className="word-scene-visual" position="relative" willChange="transform, opacity" aria-hidden="true">
      <Box px="5" py="4" bg="white" border="2px solid" borderColor={scene.accentColor} borderRadius="2xl" boxShadow="0 16px 26px rgba(31,111,214,0.10)">
        <Text fontSize="xs" fontWeight="950" color={scene.accentColor} letterSpacing="0.12em">
          HELLO
        </Text>
        <Text mt="1" fontSize="lg" fontWeight="950" color={SCENE_COLORS.text}>
          my name is...
        </Text>
      </Box>
      <Box position="absolute" right="-8px" top="-8px" w="18px" h="18px" borderRadius="full" bg={scene.softColor} border="1px solid" borderColor={scene.accentColor} />
    </Box>
  );
}

function CategoryVisual({ scene, wordOrPhrase }: { scene: WordVisualScene; wordOrPhrase: string }) {
  const key = normalizeWordVisualKey(wordOrPhrase);

  if (key === 'hello' || key === 'goodbye') {
    return <WhaleCharacter waving />;
  }

  if (key === 'good morning') {
    return (
      <Box className="word-scene-visual" position="relative" w="118px" h="104px" aria-hidden="true" willChange="transform, opacity">
        <Box position="absolute" left="27px" top="5px" w="64px" h="64px" borderRadius="full" bg="linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)" boxShadow="0 14px 30px rgba(245,158,11,0.22)" />
        <Box position="absolute" left="6px" bottom="12px" w="106px" h="34px" borderRadius="full" bg="#DBEAFE" />
        <Box position="absolute" left="22px" bottom="22px" w="74px" h="20px" borderRadius="full" bg="white" opacity="0.86" />
        <Text position="absolute" right="5px" top="8px" fontSize="xl">☀️</Text>
      </Box>
    );
  }

  if (key === 'my name is') {
    return <NameTagVisual scene={scene} />;
  }

  if (key === 'nice to meet you') {
    return (
      <HStack className="word-scene-visual" gap="3" align="center" aria-hidden="true" willChange="transform, opacity">
        <Person label="A" color="#E0F2FE" />
        <Text fontSize="2xl">🤝</Text>
        <Person label="B" color="#DCFCE7" />
      </HStack>
    );
  }

  if (key === 'thank you') {
    return (
      <VStack className="word-scene-visual" gap="2" aria-hidden="true" willChange="transform, opacity">
        <Text fontSize="5xl">💐</Text>
        <Box px="3" py="1.5" bg="white" border="1px solid" borderColor={SCENE_COLORS.border} borderRadius="full" color={scene.accentColor} fontWeight="950">
          thank you
        </Box>
      </VStack>
    );
  }

  if (scene.category === 'family') {
    return (
      <Box className="word-scene-visual" position="relative" w="118px" h="104px" aria-hidden="true" willChange="transform, opacity">
        <Box position="absolute" left="21px" top="35px" w="76px" h="50px" bg="white" border="2px solid" borderColor={scene.accentColor} borderRadius="xl" />
        <Box position="absolute" left="17px" top="19px" w="84px" h="48px" bg={scene.softColor} transform="rotate(45deg)" border="2px solid" borderColor={scene.accentColor} borderRadius="lg" />
        <HStack position="absolute" left="34px" bottom="18px" gap="2"><Person /><Person color="#FFEDD5" /></HStack>
      </Box>
    );
  }

  if (scene.category === 'school' || scene.category === 'classroom') {
    return (
      <VStack className="word-scene-visual" gap="2" aria-hidden="true" willChange="transform, opacity">
        <Box w="86px" h="54px" bg="#1F2937" border="4px solid" borderColor="#92400E" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
          <Text color="white" fontSize="sm" fontWeight="950">ABC</Text>
        </Box>
        <HStack><Text fontSize="2xl">✏️</Text><Text fontSize="2xl">🎒</Text></HStack>
      </VStack>
    );
  }

  if (scene.category === 'direction') {
    return (
      <HStack className="word-scene-visual" gap="2" aria-hidden="true" willChange="transform, opacity">
        <Box w="38px" h="12px" bg={scene.accentColor} borderRadius="full" />
        <Box w="0" h="0" borderTop="18px solid transparent" borderBottom="18px solid transparent" borderLeft={`30px solid ${scene.accentColor}`} />
      </HStack>
    );
  }

  return (
    <Flex
      className="word-scene-visual"
      position="relative"
      w="118px"
      h="104px"
      borderRadius="3xl"
      bg={scene.softColor}
      border="1px solid"
      borderColor={scene.accentColor}
      align="center"
      justify="center"
      overflow="hidden"
      boxShadow="0 16px 28px rgba(31,111,214,0.10)"
      aria-hidden="true"
      willChange="transform, opacity"
    >
      {scene.category === 'daily-routine' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#CCFBF1" />
          <Box className="word-scene-motion" position="absolute" left="18px" top="20px" w="30px" h="44px" bg="white" border="2px solid" borderColor={scene.accentColor} borderRadius="xl" />
          <Box className="word-scene-motion" position="absolute" left="54px" top="14px" w="44px" h="44px" borderRadius="full" bg="#FEF3C7" border="2px solid" borderColor="#F59E0B" />
          <Box position="absolute" left="65px" top="25px" w="3px" h="12px" bg="#92400E" borderRadius="full" />
          <Box position="absolute" left="70px" top="31px" w="13px" h="3px" bg="#92400E" borderRadius="full" />
          <Box position="absolute" left="20px" bottom="14px"><SceneLabel accentColor={scene.accentColor}>daily</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'food' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#FEE2E2" />
          <Box className="word-scene-motion" position="absolute" left="31px" top="28px" w="56px" h="40px" borderRadius="0 0 3xl 3xl" bg="white" border="2px solid" borderColor={scene.accentColor} />
          <Box position="absolute" left="39px" top="18px" fontSize="3xl">{scene.emoji}</Box>
          <Box position="absolute" right="20px" bottom="18px"><SceneLabel accentColor={scene.accentColor}>eat</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'drink' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#CFFAFE" />
          <Box className="word-scene-motion" position="absolute" left="42px" top="24px" w="36px" h="54px" bg="rgba(255,255,255,0.86)" border="2px solid" borderColor={scene.accentColor} borderRadius="lg" transform="skew(-5deg)" />
          <Box position="absolute" left="46px" top="43px" w="28px" h="27px" bg="#67E8F9" borderRadius="0 0 md md" opacity="0.78" />
          <Box className="word-scene-motion" position="absolute" right="27px" top="14px" w="10px" h="14px" borderRadius="full" bg={scene.accentColor} opacity="0.72" />
          <Box position="absolute" left="18px" bottom="15px"><SceneLabel accentColor={scene.accentColor}>drink</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'place' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#DCFCE7" />
          <Box className="word-scene-motion" position="absolute" left="42px" top="13px" w="36px" h="50px" bg={scene.accentColor} borderRadius="22px 22px 22px 4px" transform="rotate(45deg)" boxShadow="0 12px 22px rgba(22,163,74,0.18)" />
          <Box position="absolute" left="53px" top="24px" w="14px" h="14px" borderRadius="full" bg="white" />
          <Box position="absolute" left="24px" bottom="15px"><SceneLabel accentColor={scene.accentColor}>place</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'time' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#FEF3C7" />
          <Box className="word-scene-motion" position="absolute" left="22px" top="16px" w="42px" h="42px" borderRadius="full" bg="linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)" />
          <Box position="absolute" right="22px" top="23px" w="42px" h="42px" borderRadius="full" bg="white" border="2px solid" borderColor={scene.accentColor} />
          <Box position="absolute" right="42px" top="31px" w="3px" h="14px" bg="#92400E" borderRadius="full" />
          <Box position="absolute" right="30px" top="44px" w="15px" h="3px" bg="#92400E" borderRadius="full" />
          <Box position="absolute" left="32px" bottom="14px"><SceneLabel accentColor={scene.accentColor}>time</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'hobby' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#FCE7F3" />
          <Box className="word-scene-motion" position="absolute" left="25px" top="22px" w="54px" h="42px" bg="white" border="2px solid" borderColor={scene.accentColor} borderRadius="xl" />
          <Box position="absolute" left="39px" top="31px" w="10px" h="10px" borderRadius="full" bg="#F9A8D4" />
          <Box position="absolute" left="54px" top="39px" w="12px" h="12px" borderRadius="full" bg="#93C5FD" />
          <Box className="word-scene-motion" position="absolute" right="20px" top="28px" w="32px" h="8px" bg="#92400E" borderRadius="full" transform="rotate(-32deg)" />
          <Box position="absolute" left="22px" bottom="15px"><SceneLabel accentColor={scene.accentColor}>like</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'object' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#E0E7FF" />
          <Box className="word-scene-motion" position="absolute" left="28px" top="27px" w="32px" h="32px" bg="white" border="2px solid" borderColor={scene.accentColor} borderRadius="lg" />
          <Box className="word-scene-motion" position="absolute" right="28px" top="34px" w="30px" h="30px" bg={scene.softColor} border="2px solid" borderColor={scene.accentColor} borderRadius="full" />
          <Box position="absolute" left="29px" bottom="15px"><SceneLabel accentColor={scene.accentColor}>thing</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'action' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#D1FAE5" />
          <Box className="word-scene-motion" position="absolute" left="24px" top="34px" w="68px" h="8px" borderRadius="full" bg={scene.accentColor} opacity="0.22" />
          <Box className="word-scene-motion" position="absolute" left="44px" top="18px" w="22px" h="22px" borderRadius="full" bg="#BBF7D0" border="2px solid" borderColor={scene.accentColor} />
          <Box className="word-scene-motion" position="absolute" left="50px" top="42px" w="30px" h="26px" borderLeft="5px solid" borderBottom="5px solid" borderColor={scene.accentColor} transform="rotate(-18deg)" />
          <Box position="absolute" left="22px" bottom="15px"><SceneLabel accentColor={scene.accentColor}>do</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'emotion' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color="#FEF9C3" />
          <Box className="word-scene-motion" position="absolute" left="37px" top="17px" w="46px" h="46px" borderRadius="full" bg="white" border="2px solid" borderColor={scene.accentColor} />
          <Box position="absolute" left="49px" top="32px" w="5px" h="5px" borderRadius="full" bg="#713F12" />
          <Box position="absolute" right="47px" top="32px" w="5px" h="5px" borderRadius="full" bg="#713F12" />
          <Box position="absolute" left="51px" top="45px" w="18px" h="8px" borderBottom="3px solid" borderColor="#713F12" borderRadius="full" />
          <Box className="word-scene-motion" position="absolute" right="19px" top="18px" color={scene.accentColor} fontSize="2xl">💛</Box>
          <Box position="absolute" left="18px" bottom="15px"><SceneLabel accentColor={scene.accentColor}>feel</SceneLabel></Box>
        </Box>
      ) : null}

      {scene.category === 'default' || scene.category === 'politeness' ? (
        <Box {...VISUAL_SCENE_BASE}>
          <SceneGround color={scene.softColor} />
          <Box className="word-scene-motion" position="absolute" left="20px" top="24px" w="34px" h="34px" borderRadius="full" bg="white" border="2px solid" borderColor={scene.accentColor} />
          <Box className="word-scene-motion" position="absolute" right="22px" top="28px" w="38px" h="30px" bg={scene.softColor} border="2px solid" borderColor={scene.accentColor} borderRadius="2xl" />
          <Box position="absolute" right="40px" top="58px" w="0" h="0" borderLeft="8px solid transparent" borderRight="0 solid transparent" borderTop={`10px solid ${scene.accentColor}`} opacity="0.72" />
          <Box position="absolute" left="24px" bottom="15px"><SceneLabel accentColor={scene.accentColor}>{scene.category === 'politeness' ? 'kind' : 'word'}</SceneLabel></Box>
        </Box>
      ) : null}
    </Flex>
  );
}

export function AnimatedWordScene({
  wordOrPhrase,
  meaningVi,
  example,
  visualCategory,
  animatedSceneHint,
  pronunciationHintVi,
  size,
  mood,
  showSpeechBubble = true,
}: AnimatedWordSceneProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const scene = getWordVisualScene(wordOrPhrase, visualCategory, { animatedSceneHint, pronunciationHintVi });
  const sizeStyle = SIZE_STYLES[size];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const card = root.querySelector('.word-scene-card');
      const visual = root.querySelector('.word-scene-visual, .word-scene-character');
      const details = root.querySelectorAll('.word-scene-detail, .word-scene-bubble');
      const motionParts = root.querySelectorAll('.word-scene-motion');

      if (reducedMotion) {
        safeGsapSet(card, { autoAlpha: 1, y: 0, scale: 1 });
        safeGsapSet(visual, { autoAlpha: 1, y: 0, scale: 1, rotate: 0 });
        safeGsapSet(details, { autoAlpha: 1, y: 0, scale: 1, rotate: 0 });
        safeGsapSet(motionParts, { autoAlpha: 1, y: 0, x: 0, scale: 1, rotate: 0 });
        return;
      }

      createCardEntrance(card, { y: 10, duration: 0.32 });
      createCardEntrance(visual, { y: 8, duration: 0.36, delay: 0.06 });
      createCardEntrance(details, { y: 8, duration: 0.3, delay: 0.12, stagger: 0.05 });

      if (motionParts.length > 0) {
        gsap.fromTo(
          motionParts,
          { y: 2, scale: 0.98 },
          {
            y: -1,
            scale: 1,
            duration: 1.8,
            ease: 'sine.inOut',
            stagger: 0.08,
            repeat: 1,
            yoyo: true,
            delay: 0.34,
          },
        );
      }
    },
    { dependencies: [wordOrPhrase, visualCategory, size, mood, reducedMotion], scope: rootRef, revertOnUpdate: true },
  );

  return (
    <Box
      ref={rootRef}
      className="word-scene-card"
      bg="linear-gradient(135deg, #FFFFFF 0%, #F8FCFF 52%, #E8F4FF 100%)"
      border="1px solid"
      borderColor={SCENE_COLORS.border}
      borderRadius="3xl"
      p={sizeStyle.pad}
      boxShadow="0 16px 38px rgba(31, 111, 214, 0.09)"
      overflow="hidden"
      position="relative"
      minH={sizeStyle.minH}
    >
      <Box position="absolute" right="-64px" top="-64px" w="174px" h="174px" borderRadius="full" bg={scene.softColor} opacity="0.58" />
      <Box position="absolute" left="-42px" bottom="-58px" w="132px" h="132px" borderRadius="full" bg="rgba(186,230,253,0.34)" />

      <Flex position="relative" direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" gap={size === 'compact' ? '3' : '5'}>
        <Flex
          w={{ base: '100%', md: sizeStyle.visualW }}
          minH={size === 'compact' ? '104px' : '132px'}
          align="center"
          justify="center"
          borderRadius="3xl"
          bg="rgba(255,255,255,0.70)"
          border="1px solid rgba(186,230,253,0.80)"
          flexShrink={0}
        >
          <CategoryVisual scene={scene} wordOrPhrase={wordOrPhrase} />
        </Flex>

        <VStack align="start" gap={size === 'compact' ? '2' : '3'} flex="1" w="100%">
          <HStack className="word-scene-detail" wrap="wrap" gap="2" willChange="transform, opacity">
            <Text as="span" px="2.5" py="1" borderRadius="full" bg={scene.softColor} color={scene.accentColor} fontSize="xs" fontWeight="950">
              {scene.emoji} {scene.title}
            </Text>
            <Text as="span" px="2.5" py="1" borderRadius="full" bg="white" border="1px solid" borderColor={SCENE_COLORS.border} color={SCENE_COLORS.muted} fontSize="xs" fontWeight="850">
              {scene.category}
            </Text>
          </HStack>

          {showSpeechBubble ? (
            <WordSceneBubble
              wordOrPhrase={wordOrPhrase}
              meaningVi={meaningVi}
              example={example}
              pronunciationHintVi={scene.pronunciationHintVi}
              animatedSceneHint={scene.hint}
              compact={sizeStyle.compact}
            />
          ) : (
            <Box className="word-scene-detail" willChange="transform, opacity">
              <Text fontSize={size === 'large' ? '2xl' : 'xl'} fontWeight="950" color={SCENE_COLORS.text} lineHeight="1.1">
                {wordOrPhrase}
              </Text>
              <Text mt="1" color={SCENE_COLORS.muted} fontWeight="800">
                {meaningVi}
              </Text>
              {example ? <Text mt="2" color={SCENE_COLORS.deepBlue} fontWeight="850">“{example}”</Text> : null}
            </Box>
          )}

          <Box className="word-scene-detail" bg="white" border="1px solid" borderColor={SCENE_COLORS.border} borderRadius="2xl" px="3" py="2" w="100%" willChange="transform, opacity">
            <Text color={SCENE_COLORS.text} fontSize={size === 'compact' ? 'xs' : 'sm'} fontWeight="900">
              {MOOD_COPY[mood]}
            </Text>
            {size !== 'compact' ? (
              <Text mt="1" color={SCENE_COLORS.muted} fontSize="xs" fontWeight="700">
                {scene.hint}
              </Text>
            ) : null}
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
}
