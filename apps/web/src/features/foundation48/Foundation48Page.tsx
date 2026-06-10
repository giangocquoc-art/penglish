import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { CheckCircle2, Play, Sparkles } from 'lucide-react';
import { OceanPageShell } from '../../components/p-english/OceanPageShell';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import { foundation48Days, getFoundation48DayPath } from './foundation48Data';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48ProgressSummary } from './foundation48Progress';
import { Foundation48Roadmap } from './Foundation48Roadmap';

const COLORS = { text: '#102A43', muted: '#52667A', blue: '#1F6FD6', border: '#BAE6FD', green: '#16A34A' };

export function Foundation48Page() {
  const [version, setVersion] = useState(0);
  const progress = useMemo(() => getFoundation48ProgressSummary(foundation48Days.length), [version]);
  const recommendedDay = foundation48Days.find((day) => !progress.days[day.dayNumber]?.completed)?.dayNumber || foundation48Days.length;
  const nextDay = progress.lastDayOpened && !progress.days[progress.lastDayOpened]?.completed ? progress.lastDayOpened : recommendedDay;
  const nextDayData = foundation48Days.find((day) => day.dayNumber === nextDay) ?? foundation48Days[0];
  const nextState = progress.days[nextDay];
  const todayTitle = getFriendlyDayTitle(nextDayData.title);
  const exampleSentence = nextDayData.summary.examples[0] || nextDayData.polished?.examples[0] || 'I am ready to learn.';
  const primaryCta = nextState?.started ? 'Học tiếp' : 'Bắt đầu ngày đang học';

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener(FOUNDATION48_PROGRESS_UPDATED_EVENT, refresh);
    };
  }, []);

  return (
    <OceanPageShell data-testid="foundation48-roadmap-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pt={{ base: '2', md: '0' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 168px)', lg: '8' }}>
      <Box maxW="940px" mx="auto" minW="0" pb={{ base: '40px', md: '0' }}>
        <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '3.5', md: '4' }} bg="rgba(255,255,255,0.80)" mb="3" overflow="hidden" position="relative">
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 92% 12%, rgba(91,188,235,0.14), transparent 24%)" pointerEvents="none" />
          <Flex position="relative" justify="space-between" align="center" gap="3">
            <Box minW="0" maxW="640px">
              <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.08">
                48 ngày lấy gốc
              </Text>
              <Text mt="1" color={COLORS.muted} fontSize={{ base: 'sm', md: 'md' }} fontWeight="800" lineHeight="1.45">
                Khóa nền tảng cho người mới: mỗi ngày khoảng 12 phút, đi theo vòng Từ mới → Mẫu câu → Lời thoại → Câu luyện → Bài kiểm tra nhỏ.
              </Text>
            </Box>
            <Box display={{ base: 'none', md: 'block' }} pr="1" w="92px" flexShrink={0}>
              <OceanMascot mascot="poo" pose="coach" size="md" decorative motion="float" />
            </Box>
          </Flex>
        </Box>

        <Box className="penglish-glass-card" border="1px solid" borderColor="#7DD3FC" borderRadius="3xl" p={{ base: '4', md: '5' }} bg="linear-gradient(135deg, rgba(239,246,255,0.96), rgba(255,255,255,0.90))" boxShadow="0 24px 64px rgba(31,111,214,0.14)" data-testid="foundation48-continue-card" mb={{ base: '5', md: '4' }} overflow="hidden" position="relative">
          <Box position="absolute" right="-48px" top="-54px" w="160px" h="160px" borderRadius="full" bg="rgba(91,188,235,0.16)" filter="blur(2px)" pointerEvents="none" />
          <Flex position="relative" align={{ base: 'stretch', md: 'center' }} justify="space-between" gap={{ base: '4', md: '6' }} direction={{ base: 'column', md: 'row' }}>
            <HStack gap="4" align="center" minW="0">
              <Box display={{ base: 'none', md: 'block' }} flexShrink={0}>
                <OceanMascot mascot="poo" pose="happy" size="md" decorative motion="float" />
              </Box>
              <VStack align="start" gap="2" minW="0">
                <Text color={COLORS.blue} fontWeight="700" fontSize="sm" letterSpacing="0.08em" textTransform="uppercase">
                  Hôm nay học
                </Text>
                <HStack gap="2" wrap="wrap">
                  <Text px="3" py="1" borderRadius="full" bg="#DBEAFE" color={COLORS.blue} fontWeight="950" fontSize="sm">Ngày {nextDay}</Text>
                  <Text px="3" py="1" borderRadius="full" bg="#FFF7ED" color="#B45309" fontWeight="950" fontSize="sm">12 phút</Text>
                  <Text px="3" py="1" borderRadius="full" bg="rgba(221,245,255,0.82)" color={COLORS.blue} fontWeight="950" fontSize="sm">5 bước</Text>
                  {nextState?.completed ? <Text px="3" py="1" borderRadius="full" bg="#ECFDF5" color={COLORS.green} fontWeight="950" fontSize="sm">Đã hoàn thành</Text> : null}
                </HStack>
                <Text color={COLORS.text} fontWeight="700" fontSize={{ base: '2xl', md: '3xl' }} lineHeight="1.08" noOfLines={2}>
                  {todayTitle}
                </Text>
                <Text display={{ base: 'none', md: 'block' }} color={COLORS.muted} fontWeight="800" fontSize="md" lineHeight="1.5" noOfLines={2}>
                  Poo đề xuất học bài này hôm nay. Ví dụ: {exampleSentence}
                </Text>
              </VStack>
            </HStack>
            <Button as={Link} to={getFoundation48DayPath(nextDay)} leftIcon={<Icon as={Play} />} bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2', transform: 'translateY(-1px)' }} _focusVisible={{ outline: '3px solid rgba(31,111,214,0.35)', outlineOffset: '2px' }} borderRadius="full" size="lg" minH="56px" px="8" fontSize="lg" boxShadow="0 16px 34px rgba(31,111,214,0.22)" w={{ base: '100%', md: 'auto' }} data-testid="foundation48-primary-cta">
              {primaryCta}
            </Button>
          </Flex>
        </Box>

        {progress.completed === foundation48Days.length ? (
          <Box className="penglish-glass-card" border="1px solid" borderColor="#BBF7D0" borderRadius="3xl" p="4" bg="rgba(240,253,244,0.86)" mb="4">
            <HStack gap="3">
              <Icon as={CheckCircle2} color={COLORS.green} boxSize="6" />
              <Box>
                <Text color={COLORS.green} fontWeight="700">Bạn đã hoàn thành 48/48 ngày.</Text>
                <Text color={COLORS.text} fontWeight="700">Poo đã lưu hành trình này trên thiết bị của bạn.</Text>
              </Box>
            </HStack>
          </Box>
        ) : null}

        <SimpleGrid columns={{ base: 1, md: 5 }} gap="2.5" mb="4" data-testid="foundation48-five-step-overview">
          {['Từ mới', 'Mẫu câu', 'Lời thoại', 'Câu luyện', 'Bài kiểm tra nhỏ'].map((step, index) => (
            <Box key={step} border="1px solid" borderColor={index === 0 ? '#7DD3FC' : COLORS.border} borderRadius="2xl" bg="rgba(255,255,255,0.74)" p="3" minW="0">
              <Text color={COLORS.blue} fontWeight="950" fontSize="xs">Bước {index + 1}</Text>
              <Text color={COLORS.text} fontWeight="950" fontSize="sm">{step}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Foundation48Roadmap days={foundation48Days} progress={progress} currentDay={nextDay} />

        <VStack mt="5" align="center" gap="1" color={COLORS.muted}>
          <Icon as={Sparkles} color={COLORS.blue} />
          <Text fontSize="sm" fontWeight="700" textAlign="center">Học mỗi ngày một chút, Poo sẽ lưu tiến độ cho bạn.</Text>
        </VStack>
      </Box>
    </OceanPageShell>
  );
}

function getFriendlyDayTitle(title: string) {
  const withoutDay = title.replace(/^Ngày \d+:\s*/, '').trim();
  return withoutDay.split('—')[0]?.trim() || withoutDay;
}

