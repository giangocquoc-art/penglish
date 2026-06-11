import { useEffect, useRef } from 'react';
import { Box, Button, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Sparkles, Waves } from 'lucide-react';
import { BlueWhaleMascot } from '../landing/BlueWhaleMascot';
import { createFloatLoop, killTimeline } from '../../lib/animations/gsap-utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  blue: '#2563EB',
  green: '#22C55E',
  border: '#BAE6FD',
};

export function WhaleCoachCard({
  line,
  confidenceGoal,
  streak,
  nextActionLabel,
  nextActionPath,
  weakSkill,
}: {
  line: string;
  confidenceGoal: string;
  streak: number;
  nextActionLabel: string;
  nextActionPath: string;
  weakSkill?: string;
}) {
  const whaleRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !whaleRef.current) return undefined;
    const float = createFloatLoop(whaleRef.current, { y: -7, duration: 3.4 });
    return () => killTimeline(float);
  }, [reducedMotion]);

  return (
    <Flex
      className="home-dashboard-card"
      bg="linear-gradient(135deg, #DDF5FF 0%, #F8FCFF 55%, #FFFFFF 100%)"
      border="1px solid"
      borderColor={COLORS.border}
      borderRadius="3xl"
      p={{ base: '5', md: '6' }}
      boxShadow="0 18px 44px rgba(31, 111, 214, 0.10)"
      overflow="hidden"
      position="relative"
      align="center"
      justify="space-between"
      gap="5"
      direction={{ base: 'column', md: 'row' }}
    >
      <Box position="absolute" inset="0" bg="radial-gradient(circle at 86% 20%, rgba(91,188,235,0.20), transparent 28%), radial-gradient(circle at 8% 92%, rgba(34,197,94,0.08), transparent 24%)" pointerEvents="none" />
      <Box position="relative" flex="1" minW="0">
        <HStack mb="3" gap="2">
          <Icon as={Sparkles} color={COLORS.blue} />
          <Text fontWeight="950" color={COLORS.text}>Poo gợi ý</Text>
        </HStack>
        <Text color={COLORS.text} fontSize={{ base: 'lg', md: 'xl' }} fontWeight="900" lineHeight="1.45">{line}</Text>
        <Text mt="3" color={COLORS.muted} fontWeight="750" lineHeight="1.7">
          {streak > 0 ? `Chuỗi bọt biển đang rất ổn. ` : 'Bắt đầu nhẹ hôm nay là đủ. '}
          Mục tiêu tự tin: {confidenceGoal}
          {weakSkill ? ` Kỹ năng nên chạm tiếp: ${weakSkill}.` : ''}
        </Text>
        <Button as={Link} to={nextActionPath} mt="5" borderRadius="full" bg={COLORS.blue} color="white" leftIcon={<Icon as={Waves} />} _hover={{ bg: '#1D4ED8' }}>
          {nextActionLabel}
        </Button>
      </Box>
      <Box ref={whaleRef} position="relative" w={{ base: '168px', md: '210px' }} h={{ base: '120px', md: '150px' }} flexShrink={0} pointerEvents="none" aria-hidden="true">
        <Box position="absolute" inset="12px" borderRadius="full" bg="rgba(255,255,255,0.58)" />
        <Box position="absolute" right={{ base: '-18px', md: '-10px' }} top={{ base: '-22px', md: '-18px' }} transform="scale(0.82)" transformOrigin="top right">
          <BlueWhaleMascot size="md" showMessage={false} showBubbles decorative />
        </Box>
      </Box>
    </Flex>
  );
}
