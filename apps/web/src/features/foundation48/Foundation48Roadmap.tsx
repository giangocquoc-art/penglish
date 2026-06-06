import { Box, Button, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { CheckCircle2, Circle, LockKeyhole, PlayCircle, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFoundation48DayPath } from './foundation48Data';
import { getFoundation48Readiness } from './foundation48DeepLessons';
import type { Foundation48Day, Foundation48ProgressState } from './foundation48Types';

const COLORS = { text: '#102A43', muted: '#52667A', blue: '#1F6FD6', border: '#BAE6FD', green: '#16A34A' };

type Summary = Foundation48ProgressState & { started: number; completed: number; totalDays: number; percent: number; mistakesDue?: number };

export function Foundation48Roadmap({ days, progress, currentDay }: { days: Foundation48Day[]; progress: Summary; currentDay: number }) {
  return (
    <VStack align="stretch" gap="4" data-testid="foundation48-roadmap">
      <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }}>
        Lộ trình mỗi ngày một bài
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: '2.5', md: '3' }}>
        {days.map((day, index) => {
          const previousCompleted = day.dayNumber === 1 || Boolean(progress.days[day.dayNumber - 1]?.completed);
          const state = progress.days[day.dayNumber];
          const completed = Boolean(state?.completed);
          const started = Boolean(state?.started);
          const active = day.dayNumber === currentDay;
          const softLocked = !completed && !started && !previousCompleted && day.dayNumber > currentDay;

          return (
            <Box key={day.dayNumber} minW="0">
              {index === 0 || days[index - 1].stageId !== day.stageId ? (
                <HStack mb="2" mt={index === 0 ? '0' : '2'} gap="2" data-testid={`foundation48-stage-label-${day.stageId}`}>
                  <Text px="3" py="1" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="950" fontSize="xs">
                    Chặng {day.stageId}
                  </Text>
                  <Text color={COLORS.muted} fontWeight="850" fontSize="sm" noOfLines={1}>{day.stageTitle}</Text>
                </HStack>
              ) : null}
              <DayPathCard day={day} completed={completed} started={started} active={active} softLocked={softLocked} score={state?.score} mistakes={(state?.mistakes || []).filter((item) => !item.resolved).length} />
            </Box>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
}

function DayPathCard({ day, completed, started, active, softLocked, score, mistakes }: { day: Foundation48Day; completed: boolean; started: boolean; active: boolean; softLocked: boolean; score?: number; mistakes: number }) {
  const statusIcon = completed ? CheckCircle2 : active || started ? PlayCircle : softLocked ? LockKeyhole : Circle;
  const status = completed ? 'Đã xong' : active || started ? 'Học tiếp' : softLocked ? 'Học sau' : 'Sẵn sàng';
  const readiness = getFoundation48Readiness(day.dayNumber);
  const readinessText = readiness === 'complete' ? 'Đầy đủ' : 'Đang mở rộng';
  const readinessBg = readiness === 'complete' ? '#ECFDF5' : '#FFF7ED';
  const readinessColor = readiness === 'complete' ? COLORS.green : '#B45309';

  return (
    <Box
      as={Link}
      to={getFoundation48DayPath(day.dayNumber)}
      data-testid={`foundation48-day-card-${day.dayNumber}`}
      display="block"
      border="1px solid"
      borderColor={completed ? '#BBF7D0' : active ? '#38BDF8' : COLORS.border}
      borderRadius="2xl"
      p={{ base: '3', md: '3.5' }}
      bg={completed ? 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' : active ? 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)' : 'rgba(255,255,255,0.82)'}
      boxShadow={active ? '0 18px 38px rgba(31,111,214,0.14)' : 'none'}
      minH="132px"
      _hover={{ transform: 'translateY(-2px)', boxShadow: '0 16px 30px rgba(31,111,214,0.12)', borderColor: active ? '#0284C7' : '#7DD3FC' }}
      _focusVisible={{ outline: '3px solid rgba(31,111,214,0.35)', outlineOffset: '2px' }}
      transition="transform .16s ease, box-shadow .16s ease, border-color .16s ease"
    >
      <Flex h="100%" direction="column" justify="space-between" gap="2.5" minW="0">
        <HStack justify="space-between" align="start" gap="3">
          <Box minW="0">
            <Text color={active ? COLORS.blue : COLORS.muted} fontWeight="950" fontSize="xs">Ngày {day.dayNumber}</Text>
            <Text color={COLORS.text} fontWeight="950" noOfLines={2} lineHeight="1.25">{day.title}</Text>
          </Box>
          <Icon as={statusIcon} color={completed ? COLORS.green : active ? COLORS.blue : COLORS.muted} flexShrink={0} boxSize="5" aria-hidden="true" />
        </HStack>
        <HStack gap="1.5" wrap="wrap">
          <Text px="2.5" py="1" borderRadius="full" bg={readinessBg} color={readinessColor} fontSize="10px" fontWeight="950">{readinessText}</Text>
          <Text px="2.5" py="1" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontSize="10px" fontWeight="950">Luyện từng bước</Text>
          {day.audio.length > 0 ? <Text px="2.5" py="1" borderRadius="full" bg="#ECFDF5" color={COLORS.green} fontSize="10px" fontWeight="950">Có nghe</Text> : <Text px="2.5" py="1" borderRadius="full" bg="#F8FAFC" color={COLORS.muted} fontSize="10px" fontWeight="950">Giọng Poo</Text>}
          {mistakes > 0 ? <Text px="2.5" py="1" borderRadius="full" bg="#FFF7ED" color="#B45309" fontSize="10px" fontWeight="950">{mistakes} lỗi</Text> : null}
        </HStack>
        <HStack justify="space-between" gap="2">
          <Text color={completed ? COLORS.green : active ? COLORS.blue : COLORS.muted} fontSize="xs" fontWeight="950">{status}</Text>
          <HStack gap="1.5" color={COLORS.muted}>
            {typeof score === 'number' ? <Text fontSize="xs" fontWeight="950">{score}%</Text> : null}
            <Icon as={Volume2} boxSize="3.5" />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
}
