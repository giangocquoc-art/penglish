import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Collapse, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { CheckCircle2, ChevronDown, ChevronRight, Circle, LockKeyhole, PlayCircle, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFoundation48DayPath, getFoundation48InteractiveReadiness } from './foundation48Data';
import type { Foundation48Day, Foundation48ProgressState } from './foundation48Types';

const COLORS = { text: '#102A43', muted: '#52667A', blue: '#1F6FD6', border: '#BAE6FD', green: '#16A34A' };

type Summary = Foundation48ProgressState & { started: number; completed: number; totalDays: number; percent: number; mistakesDue?: number };

type RoadmapChapter = {
  stageId: number;
  stageTitle: string;
  days: Foundation48Day[];
};

export function Foundation48Roadmap({ days, progress, currentDay }: { days: Foundation48Day[]; progress: Summary; currentDay: number }) {
  const chapters = useMemo(() => groupDaysByStage(days), [days]);
  const currentChapter = useMemo(() => chapters.find((chapter) => chapter.days.some((day) => day.dayNumber === currentDay)) ?? chapters[0], [chapters, currentDay]);
  const currentDayItem = useMemo(() => days.find((day) => day.dayNumber === currentDay) ?? days[0], [currentDay, days]);
  const [openStages, setOpenStages] = useState<Set<number>>(() => new Set(currentChapter ? [currentChapter.stageId] : []));

  useEffect(() => {
    if (!currentChapter) return;
    setOpenStages((previous) => new Set([...previous, currentChapter.stageId]));
  }, [currentChapter]);

  const toggleStage = (stageId: number) => {
    setOpenStages((previous) => {
      const next = new Set(previous);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  const currentState = currentDayItem ? getDayCardState(currentDayItem, days, progress, currentDay) : null;

  return (
    <VStack align="stretch" gap="4" data-testid="foundation48-roadmap">
      <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }}>
        Lộ trình mỗi ngày một bài
      </Text>

      {currentDayItem && currentState ? (
        <Box display={{ base: 'block', md: 'none' }} border="1px solid" borderColor="#7DD3FC" borderRadius="2xl" bg="linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 100%)" p="3" boxShadow="0 16px 34px rgba(31,111,214,0.12)" data-testid="foundation48-mobile-continue-card">
          <HStack justify="space-between" align="start" gap="3">
            <Box minW="0">
              <Text color={COLORS.blue} fontSize="xs" fontWeight="950">Học tiếp hôm nay</Text>
              <Text color={COLORS.text} fontWeight="950" lineHeight="1.2" noOfLines={2}>{currentDayItem.title}</Text>
              <Text color={COLORS.muted} fontSize="xs" fontWeight="850" mt="1">Ngày {currentDayItem.dayNumber} · Chặng {currentDayItem.stageId}</Text>
            </Box>
            <Button as={Link} to={getFoundation48DayPath(currentDayItem.dayNumber)} size="sm" borderRadius="full" bg={COLORS.blue} color="white" _hover={{ bg: '#075985' }} flexShrink={0}>
              Học tiếp
            </Button>
          </HStack>
        </Box>
      ) : null}

      <SimpleGrid display={{ base: 'none', md: 'grid' }} columns={{ md: 2, xl: 3 }} gap="3">
        {days.map((day, index) => {
          const state = getDayCardState(day, days, progress, currentDay);

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
              <DayPathCard day={day} completed={state.completed} started={state.started} active={state.active} softLocked={state.softLocked} score={state.score} mistakes={state.mistakes} />
            </Box>
          );
        })}
      </SimpleGrid>

      <VStack display={{ base: 'flex', md: 'none' }} align="stretch" gap="3">
        {chapters.map((chapter) => {
          const isOpen = openStages.has(chapter.stageId);
          const isCurrent = chapter.stageId === currentChapter?.stageId;
          const completedInChapter = chapter.days.filter((day) => progress.days[day.dayNumber]?.completed).length;

          return (
            <Box key={chapter.stageId} border="1px solid" borderColor={isCurrent ? '#7DD3FC' : COLORS.border} borderRadius="2xl" bg="rgba(255,255,255,0.84)" overflow="hidden" data-testid={`foundation48-mobile-stage-${chapter.stageId}`}>
              <Button
                type="button"
                onClick={() => toggleStage(chapter.stageId)}
                w="100%"
                h="auto"
                justifyContent="space-between"
                alignItems="center"
                gap="3"
                p="3"
                borderRadius="0"
                bg={isCurrent ? '#EFF6FF' : 'rgba(255,255,255,0.72)'}
                color={COLORS.text}
                _hover={{ bg: isCurrent ? '#DBEAFE' : '#F8FAFC' }}
                data-testid={`foundation48-mobile-stage-toggle-${chapter.stageId}`}
              >
                <HStack minW="0" gap="2" textAlign="left">
                  <Text px="2.5" py="1" borderRadius="full" bg={isCurrent ? '#DBEAFE' : '#F8FAFC'} color={isCurrent ? COLORS.blue : COLORS.muted} fontWeight="950" fontSize="xs" flexShrink={0}>
                    Chặng {chapter.stageId}
                  </Text>
                  <Box minW="0">
                    <Text fontWeight="950" fontSize="sm" noOfLines={1}>{chapter.stageTitle}</Text>
                    <Text color={COLORS.muted} fontWeight="850" fontSize="11px">{completedInChapter}/{chapter.days.length} ngày hoàn thành</Text>
                  </Box>
                </HStack>
                <Icon as={isOpen ? ChevronDown : ChevronRight} boxSize="4.5" color={COLORS.muted} flexShrink={0} />
              </Button>
              <Collapse in={isOpen} unmountOnExit={false}>
                <VStack align="stretch" gap="2.5" p="3" pt="2">
                  {chapter.days.map((day) => {
                    const state = getDayCardState(day, days, progress, currentDay);
                    return <DayPathCard key={day.dayNumber} day={day} completed={state.completed} started={state.started} active={state.active} softLocked={state.softLocked} score={state.score} mistakes={state.mistakes} />;
                  })}
                </VStack>
              </Collapse>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
}

function groupDaysByStage(days: Foundation48Day[]): RoadmapChapter[] {
  return days.reduce<RoadmapChapter[]>((chapters, day) => {
    const current = chapters[chapters.length - 1];
    if (!current || current.stageId !== day.stageId) {
      chapters.push({ stageId: day.stageId, stageTitle: day.stageTitle, days: [day] });
      return chapters;
    }
    current.days.push(day);
    return chapters;
  }, []);
}

function getDayCardState(day: Foundation48Day, days: Foundation48Day[], progress: Summary, currentDay: number) {
  const previousDay = days.find((item) => item.dayNumber === day.dayNumber - 1);
  const previousCompleted = day.dayNumber === 1 || Boolean(progress.days[day.dayNumber - 1]?.completed) || !previousDay;
  const state = progress.days[day.dayNumber];
  const completed = Boolean(state?.completed);
  const started = Boolean(state?.started);
  const active = day.dayNumber === currentDay;
  const softLocked = !completed && !started && !previousCompleted && day.dayNumber > currentDay;

  return {
    completed,
    started,
    active,
    softLocked,
    score: state?.score,
    mistakes: (state?.mistakes || []).filter((item) => !item.resolved).length,
  };
}

function DayPathCard({ day, completed, started, active, softLocked, score, mistakes }: { day: Foundation48Day; completed: boolean; started: boolean; active: boolean; softLocked: boolean; score?: number; mistakes: number }) {
  const statusIcon = completed ? CheckCircle2 : active || started ? PlayCircle : softLocked ? LockKeyhole : Circle;
  const status = completed ? 'Đã xong' : active || started ? 'Học tiếp' : softLocked ? 'Học sau' : 'Sẵn sàng';
  const readiness = getFoundation48InteractiveReadiness(day.dayNumber);
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
