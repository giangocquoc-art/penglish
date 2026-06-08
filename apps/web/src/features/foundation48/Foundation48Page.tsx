import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { CheckCircle2, Flame, Play, RotateCcw, Sparkles, Target } from 'lucide-react';
import { OceanPageShell } from '../../components/p-english/OceanPageShell';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import { foundation48Days, getFoundation48DayPath } from './foundation48Data';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48ProgressSummary } from './foundation48Progress';
import { Foundation48Roadmap } from './Foundation48Roadmap';

const COLORS = { text: '#102A43', muted: '#52667A', blue: '#1F6FD6', border: '#BAE6FD', green: '#16A34A', coral: '#F9735B' };

export function Foundation48Page() {
  const [version, setVersion] = useState(0);
  const progress = useMemo(() => getFoundation48ProgressSummary(foundation48Days.length), [version]);
  const recommendedDay = foundation48Days.find((day) => !progress.days[day.dayNumber]?.completed)?.dayNumber || foundation48Days.length;
  const nextDay = progress.lastDayOpened && !progress.days[progress.lastDayOpened]?.completed ? progress.lastDayOpened : recommendedDay;
  const nextDayData = foundation48Days.find((day) => day.dayNumber === nextDay) ?? foundation48Days[0];

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
    <OceanPageShell data-testid="foundation48-roadmap-page" variant="roadmap" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pt={{ base: '2', md: '0' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 132px)', lg: '8' }}>
      <Box maxW="1120px" mx="auto" minW="0">
        <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '4', md: '6' }} bg="rgba(255,255,255,0.82)" mb="4" overflow="hidden" position="relative">
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 90% 16%, rgba(91,188,235,0.16), transparent 30%)" pointerEvents="none" />
          <Flex position="relative" justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
            <Box minW="0" maxW="760px">
              <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.04">
                48 ngày lấy gốc
              </Text>
              <Text mt="2" color={COLORS.muted} fontSize={{ base: 'md', md: 'lg' }} fontWeight="750" lineHeight="1.55">
                Mỗi ngày một lesson flow ngắn: nghe mẫu, làm bài tương tác, nói lại và lưu lỗi sai để ôn.
              </Text>
            </Box>
            <Box display={{ base: 'none', md: 'block' }} pr="2">
              <OceanMascot mascot="poo" pose="coach" size="hero" decorative motion="float" />
            </Box>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="4" mb="5">
          <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '4', md: '5' }} bg="linear-gradient(135deg, rgba(239,246,255,0.90), rgba(255,255,255,0.84))" data-testid="foundation48-continue-card" gridColumn={{ base: 'auto', lg: 'span 2' }}>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
              <HStack gap="3" align="center" minW="0">
                <Box display={{ base: 'none', sm: 'block' }}>
                  <OceanMascot mascot="poo" pose="coach" size="sm" decorative motion="float" />
                </Box>
                <Box minW="0">
                  <HStack gap="2" wrap="wrap" mb="1">
                    <Text px="3" py="1" borderRadius="full" bg="#DBEAFE" color={COLORS.blue} fontWeight="950" fontSize="xs">Hôm nay học Ngày {nextDay}</Text>
                    <Text px="3" py="1" borderRadius="full" bg="#ECFDF5" color={COLORS.green} fontWeight="950" fontSize="xs">{progress.completed}/48 đã hoàn thành</Text>
                  </HStack>
                  <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.2" noOfLines={2}>{nextDayData.title}</Text>
                  <Text mt="1.5" color={COLORS.blue} fontWeight="850" lineHeight="1.5">Bấm học tiếp, Poo sẽ dẫn từng bước như một app luyện nền tảng.</Text>
                  <Box mt="3" h="10px" bg="#E8F4FF" borderRadius="full" overflow="hidden" border="1px solid rgba(186,230,253,0.86)">
                    <Box h="100%" w={`${progress.percent}%`} bg="linear-gradient(90deg, #1F6FD6, #5BBCEB, #66D9C8)" borderRadius="full" transition="width .25s ease" />
                  </Box>
                </Box>
              </HStack>
              <Button as={Link} to={getFoundation48DayPath(nextDay)} leftIcon={<Icon as={Play} />} bg={COLORS.blue} color="white" _hover={{ bg: '#185BB2' }} borderRadius="full" size="lg" w={{ base: '100%', md: 'auto' }}>
                Học tiếp
              </Button>
            </Flex>
          </Box>

          <Box className="penglish-glass-card" border="1px solid" borderColor={progress.mistakesDue ? '#FED7AA' : COLORS.border} borderRadius="3xl" p="4" bg={progress.mistakesDue ? '#FFF7ED' : 'rgba(255,255,255,0.84)'} data-testid="foundation48-review-card">
            <HStack gap="3" align="start">
              <Box w="42px" h="42px" borderRadius="2xl" bg={progress.mistakesDue ? '#FFEDD5' : '#EFF6FF'} color={progress.mistakesDue ? COLORS.coral : COLORS.blue} display="grid" placeItems="center" flexShrink={0}>
                <Icon as={RotateCcw} boxSize="5" />
              </Box>
              <Box minW="0">
                <Text color={COLORS.text} fontWeight="950">Ôn lỗi sai</Text>
                <Text mt="1" color={COLORS.muted} fontWeight="750" lineHeight="1.5">{progress.mistakesDue ? `${progress.mistakesDue} lỗi đang chờ ôn trên thiết bị này.` : 'Chưa có lỗi sai nào. Cứ học tiếp để hệ thống tự lưu.'}</Text>
              </Box>
            </HStack>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="3" mb="5">
          <Metric icon={Target} label="Tiến độ" value={`${progress.percent}%`} tone="blue" />
          <Metric icon={Flame} label="Streak local" value={`${progress.streak || 0} ngày`} tone="coral" />
          <Metric icon={RotateCcw} label="Cần ôn" value={`${progress.mistakesDue || 0} lỗi`} tone="green" />
        </SimpleGrid>

        {progress.completed === foundation48Days.length ? (
          <Box className="penglish-glass-card" border="1px solid" borderColor="#BBF7D0" borderRadius="3xl" p="4" bg="rgba(240,253,244,0.86)" mb="4">
            <HStack gap="3">
              <Icon as={CheckCircle2} color={COLORS.green} boxSize="6" />
              <Box>
                <Text color={COLORS.green} fontWeight="950">Bạn đã hoàn thành 48/48 ngày.</Text>
                <Text color={COLORS.text} fontWeight="800">Sao Nhi đã lưu hành trình này trên thiết bị của bạn.</Text>
              </Box>
            </HStack>
          </Box>
        ) : null}

        <Foundation48Roadmap days={foundation48Days} progress={progress} currentDay={nextDay} />

        <VStack mt="5" align="center" gap="1" color={COLORS.muted}>
          <Icon as={Sparkles} color={COLORS.blue} />
          <Text fontSize="sm" fontWeight="800" textAlign="center">MVP hiện lưu tiến độ bằng localStorage; các thuật toán ôn thông minh hơn sẽ được thêm sau khi luồng học ổn định.</Text>
        </VStack>
      </Box>
    </OceanPageShell>
  );
}

function Metric({ icon, label, value, tone }: { icon: any; label: string; value: string; tone: 'blue' | 'green' | 'coral' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'coral' ? COLORS.coral : COLORS.blue;
  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="4" bg="rgba(255,255,255,0.82)">
      <HStack gap="3">
        <Icon as={icon} color={color} boxSize="5" />
        <Box>
          <Text color={COLORS.muted} fontWeight="850" fontSize="xs">{label}</Text>
          <Text color={COLORS.text} fontWeight="950" fontSize="lg">{value}</Text>
        </Box>
      </HStack>
    </Box>
  );
}
