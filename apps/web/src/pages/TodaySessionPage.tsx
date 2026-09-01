import { useEffect, useState } from 'react';
import { Badge, Box, Button, Circle, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, BookOpen, Check, CheckCircle2, ChevronRight, Clock3, Mic2, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassPanel, OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT } from '../features/foundation48/foundation48Progress';
import {
  DAILY_LEARNING_SESSION_UPDATED_EVENT,
  getDailyLearningSessionSnapshot,
  startDailyLearningSession,
  syncDailyLearningSessionCompletion,
  type DailyLearningSessionSnapshot,
  type DailyLearningStep,
} from '../lib/p-english/daily-learning-session';
import { LEARNING_LOOP_UPDATED_EVENT } from '../lib/p-english/learning-loop';

const STEP_VISUALS = {
  lesson: { icon: BookOpen, color: '#1F6FD6', bg: '#E8F4FF' },
  review: { icon: RotateCcw, color: '#C2410C', bg: '#FFF7ED' },
  speaking: { icon: Mic2, color: '#0E7490', bg: '#CFFAFE' },
} as const;

function SessionMetric({ value, label }: { value: string; label: string }) {
  return (
    <Box bg="rgba(248,252,255,0.82)" border="1px solid" borderColor="rgba(186,230,253,0.74)" borderRadius="2xl" px="3" py="2.5" minW="0">
      <Text color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'md', md: 'lg' }} noOfLines={1}>{value}</Text>
      <Text mt="0.5" color={OCEAN_TOKENS.muted} fontWeight="800" fontSize="xs" noOfLines={1}>{label}</Text>
    </Box>
  );
}

function StepCard({ step, current }: { step: DailyLearningStep; current: boolean }) {
  const visual = STEP_VISUALS[step.id];
  const waiting = !current && !step.completed;
  const borderColor = step.completed ? '#86EFAC' : current ? '#7DD3FC' : 'rgba(186,230,253,0.66)';
  const cardBg = step.completed ? 'linear-gradient(145deg, rgba(240,253,244,0.92), rgba(255,255,255,0.82))' : current ? 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(232,244,255,0.86))' : 'rgba(255,255,255,0.62)';

  return (
    <Flex
      data-testid={`today-step-${step.id}`}
      data-step-state={step.completed ? 'complete' : current ? 'current' : 'waiting'}
      aria-current={current ? 'step' : undefined}
      position="relative"
      gap={{ base: '3', md: '4' }}
      p={{ base: '3.5', md: '5' }}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="3xl"
      bg={cardBg}
      boxShadow={current ? '0 18px 46px rgba(31,111,214,0.12)' : '0 10px 28px rgba(31,111,214,0.05)'}
      opacity={waiting ? 0.72 : 1}
      align="flex-start"
      minW="0"
    >
      <Circle
        size={{ base: '46px', md: '56px' }}
        bg={step.completed ? '#DCFCE7' : visual.bg}
        color={step.completed ? '#15803D' : visual.color}
        border="1px solid"
        borderColor={step.completed ? '#86EFAC' : borderColor}
        flexShrink={0}
        position="relative"
        zIndex="1"
      >
        <Icon as={step.completed ? Check : visual.icon} boxSize={{ base: '5', md: '6' }} />
      </Circle>

      <Box flex="1" minW="0">
        <HStack justify="space-between" align="start" gap="2" wrap="wrap">
          <Box minW="0">
            <Text color={step.completed ? '#15803D' : visual.color} fontSize="xs" fontWeight="950" letterSpacing="0.1em" textTransform="uppercase">
              Chặng {step.order} · {step.duration}
            </Text>
            <Text as="h2" mt="1" color={OCEAN_TOKENS.text} fontWeight="950" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.2">
              {step.title}
            </Text>
          </Box>
          <Badge borderRadius="full" bg={step.completed ? '#DCFCE7' : current ? '#E0F2FE' : '#F1F5F9'} color={step.completed ? '#15803D' : current ? OCEAN_TOKENS.deepBlue : '#64748B'} textTransform="none" px="2.5" py="1">
            {step.completed ? 'Đã xong' : current ? 'Đang chờ bạn' : 'Tiếp theo'}
          </Badge>
        </HStack>
        <Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="750" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.65">
          {step.description}
        </Text>
        <HStack mt="3" justify="space-between" gap="3" wrap="wrap">
          <Text color={step.completed ? '#15803D' : OCEAN_TOKENS.muted} fontSize="sm" fontWeight="850">{step.progressLabel}</Text>
          {current || step.completed ? (
            <Button
              as={Link}
              to={step.actionPath}
              data-testid={`today-step-${step.id}-action`}
              size="sm"
              minH={{ base: '44px', md: '32px' }}
              borderRadius="full"
              bg={current ? OCEAN_TOKENS.deepBlue : 'white'}
              color={current ? 'white' : OCEAN_TOKENS.deepBlue}
              border={current ? undefined : '1px solid'}
              borderColor={OCEAN_TOKENS.borderStrong}
              rightIcon={<Icon as={ChevronRight} />}
              _hover={{ bg: current ? OCEAN_TOKENS.oceanBlue : OCEAN_TOKENS.softBlue }}
            >
              {step.actionLabel}
            </Button>
          ) : null}
        </HStack>
      </Box>
    </Flex>
  );
}

function CompletionSummary({ snapshot }: { snapshot: DailyLearningSessionSnapshot }) {
  return (
    <GlassPanel data-testid="today-session-complete" p={{ base: '5', md: '8' }} bg="linear-gradient(145deg, rgba(240,253,244,0.90), rgba(232,244,255,0.82))" borderColor="#86EFAC" textAlign="center">
      <VStack gap="4">
        <Box position="relative" display="grid" placeItems="center" minH={{ base: '104px', md: '128px' }}>
          <Box aria-hidden="true" position="absolute" w={{ base: '98px', md: '120px' }} h={{ base: '98px', md: '120px' }} borderRadius="full" bg="rgba(220,252,231,0.78)" border="1px solid #86EFAC" />
          <OceanMascot mascot="poo" pose="happy" size="lg" decorative motion="float" position="relative" />
        </Box>
        <Box>
          <Text color="#15803D" fontSize="xs" fontWeight="950" letterSpacing="0.12em" textTransform="uppercase">Phiên học hoàn thành</Text>
          <Text as="h1" mt="1" color={OCEAN_TOKENS.text} fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" lineHeight="1.08">Bạn đã bơi đủ 3 chặng hôm nay</Text>
          <Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="750" lineHeight="1.7">Poo đã giữ lại bài mới, phần ôn và hai câu nói. Lịch tiếp theo bắt đầu vào {snapshot.tomorrowLabel}.</Text>
        </Box>
        <SimpleGrid columns={{ base: 3 }} gap="2" w="100%" maxW="560px">
          <SessionMetric value="3/3" label="chặng" />
          <SessionMetric value={`${Math.max(snapshot.xpToday, 0)}`} label="XP hôm nay" />
          <SessionMetric value={`${snapshot.speakingSentenceCount}`} label="câu đã nói" />
        </SimpleGrid>
        <HStack gap="2.5" wrap="wrap" justify="center" w="100%">
          <Button as={Link} to="/home" data-testid="today-complete-home" borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" leftIcon={<Icon as={CheckCircle2} />} _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>Về trang chủ</Button>
          <Button as={Link} to="/practice" borderRadius="full" variant="outline" leftIcon={<Icon as={Sparkles} />}>Ôn thêm nếu muốn</Button>
        </HStack>
      </VStack>
    </GlassPanel>
  );
}

export function TodaySessionPage() {
  const [snapshot, setSnapshot] = useState<DailyLearningSessionSnapshot>(() => getDailyLearningSessionSnapshot());

  useEffect(() => {
    startDailyLearningSession();
    const refresh = () => {
      const next = getDailyLearningSessionSnapshot();
      setSnapshot(next.completed ? syncDailyLearningSessionCompletion(next) : next);
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refresh);
    window.addEventListener(LEARNING_LOOP_UPDATED_EVENT, refresh);
    window.addEventListener(DAILY_LEARNING_SESSION_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refresh);
      window.removeEventListener(LEARNING_LOOP_UPDATED_EVENT, refresh);
      window.removeEventListener(DAILY_LEARNING_SESSION_UPDATED_EVENT, refresh);
    };
  }, []);

  const currentStep = snapshot.steps.find((step) => step.id === snapshot.currentStepId);

  return (
    <OceanPageShell data-testid="today-session-page" variant="dashboard" overlayStrength="medium" minH="calc(100vh - 72px)" px={{ base: '3', md: '5' }} py={{ base: '2.5', md: '6' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 132px)', lg: '10' }} overflowX="hidden">
      <Box maxW="980px" mx="auto" minW="0">
        <Button as={Link} to="/home" variant="ghost" color={OCEAN_TOKENS.deepBlue} leftIcon={<Icon as={ArrowLeft} />} borderRadius="full" mb="3">Về trang chủ</Button>

        {snapshot.completed ? <CompletionSummary snapshot={snapshot} /> : (
          <>
            <GlassPanel data-testid="today-session-hero" p={{ base: '4', md: '7' }} bg="linear-gradient(145deg, rgba(255,255,255,0.88), rgba(221,245,255,0.72))" borderColor="rgba(125,211,252,0.82)" position="relative" overflow="hidden">
              <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 88% 10%, rgba(47,158,235,0.20), transparent 28%), radial-gradient(circle at 10% 100%, rgba(255,243,196,0.38), transparent 26%)" />
              <Flex position="relative" direction={{ base: 'column', md: 'row' }} gap={{ base: '4', md: '7' }} justify="space-between" align={{ base: 'stretch', md: 'center' }}>
                <VStack align="stretch" gap="3" flex="1" minW="0">
                  <HStack gap="2" wrap="wrap">
                    <Badge borderRadius="full" bg="#E0F2FE" color={OCEAN_TOKENS.deepBlue} textTransform="none" px="3" py="1.5">10–12 phút</Badge>
                    <Badge borderRadius="full" bg="#FFF7ED" color="#C2410C" textTransform="none" px="3" py="1.5">{snapshot.completedStepCount}/3 chặng</Badge>
                  </HStack>
                  <Box>
                    <Text color={OCEAN_TOKENS.deepBlue} fontSize="xs" fontWeight="950" letterSpacing="0.12em" textTransform="uppercase">Phiên học hôm nay</Text>
                    <Text as="h1" mt="1" color={OCEAN_TOKENS.text} fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.02">Poo đã xếp sẵn đường bơi</Text>
                    <Text mt="2.5" color={OCEAN_TOKENS.muted} fontWeight="750" fontSize={{ base: 'sm', md: 'lg' }} lineHeight="1.7" maxW="650px">Chỉ làm đúng chặng đang sáng. Xong một chặng, Poo tự mở chặng tiếp theo và giữ tiến độ cho bạn.</Text>
                  </Box>
                  <Box>
                    <HStack justify="space-between" mb="2" gap="3">
                      <Text color={OCEAN_TOKENS.text} fontWeight="900" fontSize="sm">{currentStep ? `Tiếp theo: ${currentStep.title}` : 'Sẵn sàng'}</Text>
                      <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950" fontSize="sm">{snapshot.progressPercent}%</Text>
                    </HStack>
                    <Box h="10px" bg="rgba(255,255,255,0.82)" border="1px solid rgba(186,230,253,0.82)" borderRadius="full" overflow="hidden" role="progressbar" aria-valuenow={snapshot.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Đã hoàn thành ${snapshot.completedStepCount} trên 3 chặng`}>
                      <Box h="100%" w={`${Math.max(snapshot.progressPercent, 3)}%`} bg="linear-gradient(90deg, #2F9EEB, #1F6FD6)" borderRadius="full" transition="width .25s ease" />
                    </Box>
                  </Box>
                  {currentStep ? (
                    <Button as={Link} to={currentStep.actionPath} data-testid="today-primary-action" alignSelf={{ base: 'stretch', sm: 'flex-start' }} size="lg" borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" rightIcon={<Icon as={ChevronRight} />} _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>
                      {currentStep.actionLabel}
                    </Button>
                  ) : null}
                </VStack>
                <Box alignSelf={{ base: 'center', md: 'auto' }} flexShrink={0} pointerEvents="none">
                  <OceanMascot mascot="poo" pose="coach" size="md" decorative motion="float" />
                </Box>
              </Flex>
            </GlassPanel>

            <HStack mt="4" mb="2" gap="2" color={OCEAN_TOKENS.muted} fontWeight="850" fontSize="sm">
              <Icon as={Clock3} color={OCEAN_TOKENS.deepBlue} />
              <Text>Làm theo thứ tự để phần ôn lấy đúng lỗi vừa phát hiện.</Text>
            </HStack>

            <Box position="relative" mt="3" data-testid="today-session-steps">
              <Box aria-hidden="true" position="absolute" left={{ base: '26px', md: '32px' }} top="36px" bottom="36px" w="2px" bg="linear-gradient(#7DD3FC, #BAE6FD)" />
              <VStack align="stretch" gap="3">
                {snapshot.steps.map((step) => <StepCard key={step.id} step={step} current={step.id === snapshot.currentStepId} />)}
              </VStack>
            </Box>

            <GlassPanel mt="4" p={{ base: '4', md: '5' }} bg="rgba(255,255,255,0.68)" borderColor="rgba(186,230,253,0.72)">
              <HStack align="center" gap="3">
                <Circle size="44px" bg="#E8F4FF" color={OCEAN_TOKENS.deepBlue} flexShrink={0}><Icon as={Sparkles} /></Circle>
                <Box minW="0">
                  <Text color={OCEAN_TOKENS.text} fontWeight="950">Ngày mai Poo sẽ chọn lại theo lỗi hôm nay</Text>
                  <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="750" fontSize="sm">Lịch kế tiếp: {snapshot.tomorrowLabel}. Từ hoặc câu còn yếu sẽ được đưa lên trước.</Text>
                </Box>
              </HStack>
            </GlassPanel>
          </>
        )}
      </Box>
    </OceanPageShell>
  );
}
