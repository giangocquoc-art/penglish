import { useMemo, useState } from 'react';
import { Box, Button, Collapse, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { CheckCircle2, ChevronDown, Circle, LockKeyhole, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import { getFoundation48DayPath } from './foundation48Data';
import type { Foundation48Day, Foundation48ProgressState } from './foundation48Types';

const COLORS = { text: '#102A43', muted: '#52667A', blue: '#1F6FD6', border: '#BAE6FD', green: '#16A34A' };

type Summary = Foundation48ProgressState & { started: number; completed: number; totalDays: number; percent: number; mistakesDue?: number };

export function Foundation48Roadmap({ days, progress, currentDay }: { days: Foundation48Day[]; progress: Summary; currentDay: number }) {
  const [showAllDays, setShowAllDays] = useState(false);
  const currentWeekDays = useMemo(() => getCurrentWeekDays(days, currentDay), [currentDay, days]);

  return (
    <VStack align="stretch" gap={{ base: '3', md: '4' }} data-testid="foundation48-roadmap">
      <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.76)" data-testid="foundation48-week-path">
        <HStack justify="space-between" align="center" mb="3" gap="3" wrap="wrap">
          <Box>
            <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'md', md: 'lg' }}>
              Tiến độ tuần này
            </Text>
            <Text color={COLORS.muted} fontWeight="800" fontSize="xs">
              {progress.completed}/48 ngày · {progress.percent}%
            </Text>
          </Box>
          <Text px="3" py="1" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontWeight="950" fontSize="xs">
            Từng bước
          </Text>
        </HStack>

        <OceanPooProgressTrack completed={progress.completed} total={progress.totalDays} percent={progress.percent} />

        <Flex align="stretch" gap={{ base: '1.5', md: '2.5' }} overflowX="auto" pb="1" sx={{ scrollbarWidth: 'thin' }}>
          {currentWeekDays.map((day, index) => {
            const state = getDayCardState(day, days, progress, currentDay);
            return <WeekDot key={day.dayNumber} day={day} state={state} isLast={index === currentWeekDays.length - 1} />;
          })}
        </Flex>
        <Text display={{ base: 'block', md: 'none' }} mt="1.5" color={COLORS.muted} fontWeight="850" fontSize="xs" textAlign="center">
          Vuốt để xem ngày tiếp theo →
        </Text>
      </Box>

      <Box className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="3xl" bg="rgba(255,255,255,0.60)" overflow="hidden" data-testid="foundation48-all-days-section">
        <Button
          type="button"
          onClick={() => setShowAllDays((value) => !value)}
          w="100%"
          h="auto"
          justifyContent="space-between"
          alignItems="center"
          gap="3"
          p={{ base: '3.5', md: '4' }}
          borderRadius="0"
          bg="rgba(255,255,255,0.72)"
          color={COLORS.text}
          _hover={{ bg: '#EFF6FF' }}
          data-testid="foundation48-all-days-toggle"
          aria-expanded={showAllDays}
        >
          <Box textAlign="left">
            <Text fontWeight="950" fontSize={{ base: 'sm', md: 'md' }}>Xem tất cả ngày học</Text>
            <Text color={COLORS.muted} fontWeight="800" fontSize="xs">Mở khi muốn chọn ngày khác.</Text>
          </Box>
          <Icon as={ChevronDown} transform={showAllDays ? 'rotate(180deg)' : 'rotate(0deg)'} transition="transform .16s ease" color={COLORS.blue} />
        </Button>

        <Collapse in={showAllDays} unmountOnExit={false}>
          <VStack align="stretch" gap="2" p={{ base: '3', md: '4' }} pt="0" data-testid="foundation48-compact-day-list">
            {days.map((day) => {
              const state = getDayCardState(day, days, progress, currentDay);
              return <CompactDayRow key={day.dayNumber} day={day} state={state} />;
            })}
          </VStack>
        </Collapse>
      </Box>
    </VStack>
  );
}

function getCurrentWeekDays(days: Foundation48Day[], currentDay: number) {
  const start = Math.floor((Math.max(1, currentDay) - 1) / 7) * 7;
  return days.slice(start, start + 7);
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

function OceanPooProgressTrack({ completed, total, percent }: { completed: number; total: number; percent: number }) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const complete = safePercent >= 100;

  return (
    <Box
      position="relative"
      h={{ base: '56px', md: '62px' }}
      mb="3"
      data-testid="foundation48-poo-progress-track"
      aria-label={`Tiến độ ${completed}/${total} ngày, ${safePercent}%`}
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      overflow="hidden"
      borderRadius="full"
      border="1px solid rgba(125,211,252,0.72)"
      bg="linear-gradient(180deg, rgba(239,246,255,0.96), rgba(221,245,255,0.86))"
      boxShadow="inset 0 1px 0 rgba(255,255,255,0.86), 0 12px 28px rgba(31,111,214,0.08)"
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          '*': { animation: 'none !important', transition: 'none !important' },
        },
      }}
    >
      <Box position="absolute" inset="0" opacity="0.62" bg="radial-gradient(circle at 18% 42%, rgba(255,255,255,0.86) 0 3px, transparent 4px), radial-gradient(circle at 58% 62%, rgba(255,255,255,0.58) 0 2px, transparent 3px), radial-gradient(circle at 82% 34%, rgba(255,255,255,0.62) 0 2px, transparent 3px)" />
      <Box position="absolute" left="0" top="0" bottom="0" w={`${safePercent}%`} bg="linear-gradient(90deg, rgba(31,111,214,0.32), rgba(91,188,235,0.46), rgba(102,217,200,0.52))" borderRadius="full" transition="width .35s ease" />
      <Box position="absolute" left="0" right="0" bottom="7px" h="10px" opacity="0.42" bg="repeating-linear-gradient(90deg, rgba(255,255,255,0.0) 0 18px, rgba(255,255,255,0.62) 18px 28px, rgba(255,255,255,0.0) 28px 46px)" transform="skewX(-16deg)" />
      <Box
        position="absolute"
        left={`calc(${safePercent}% - ${safePercent * 0.48}px)`}
        top="50%"
        transform="translateY(-50%)"
        transition="left .35s ease"
        data-testid="foundation48-poo-progress-mascot"
      >
        <OceanMascot mascot="poo" pose={complete ? 'happy' : 'coach'} size="xs" decorative motion={complete ? 'celebrate' : 'swim'} />
      </Box>
      {complete ? (
        <HStack position="absolute" right="4" top="50%" transform="translateY(-50%)" gap="1" color={COLORS.green} bg="rgba(240,253,244,0.84)" border="1px solid #BBF7D0" borderRadius="full" px="2" py="1" data-testid="foundation48-poo-progress-complete">
          <Icon as={Sparkles} boxSize="3.5" />
          <Text fontSize="xs" fontWeight="950">Hoàn thành</Text>
        </HStack>
      ) : null}
    </Box>
  );
}

function WeekDot({ day, state, isLast }: { day: Foundation48Day; state: ReturnType<typeof getDayCardState>; isLast: boolean }) {
  const statusIcon = state.completed ? CheckCircle2 : state.active || state.started ? PlayCircle : state.softLocked ? LockKeyhole : Circle;
  const status = state.completed ? 'Đã hoàn thành' : state.active || state.started ? 'Học tiếp' : state.softLocked ? 'Chưa mở' : 'Học tiếp';

  return (
    <HStack align="center" gap="2" flex="1" minW={{ base: '72px', md: '96px' }}>
      <Box
        as={Link}
        to={getFoundation48DayPath(day.dayNumber)}
        data-testid={`foundation48-week-day-${day.dayNumber}`}
        aria-label={`Ngày ${day.dayNumber}: ${day.title}. ${status}`}
        flex="1"
        minW="0"
        border="1px solid"
        borderColor={state.completed ? '#BBF7D0' : state.active ? '#38BDF8' : COLORS.border}
        bg={state.completed ? '#F0FDF4' : state.active ? '#EFF6FF' : 'rgba(255,255,255,0.78)'}
        borderRadius="2xl"
        p={{ base: '2.5', md: '3' }}
        textAlign="center"
        boxShadow={state.active ? '0 14px 28px rgba(31,111,214,0.14)' : 'none'}
        _hover={{ borderColor: '#7DD3FC', transform: 'translateY(-1px)' }}
        _focusVisible={{ outline: '3px solid rgba(31,111,214,0.35)', outlineOffset: '2px' }}
        transition="transform .16s ease, border-color .16s ease"
      >
        <Box w={{ base: '34px', md: '40px' }} h={{ base: '34px', md: '40px' }} borderRadius="full" mx="auto" mb="2" display="grid" placeItems="center" bg={state.completed ? '#DCFCE7' : state.active ? '#DBEAFE' : '#F8FAFC'} color={state.completed ? COLORS.green : state.active ? COLORS.blue : COLORS.muted}>
          <Icon as={statusIcon} boxSize="5" />
        </Box>
        <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'xs', md: 'sm' }}>Ngày {day.dayNumber}</Text>
        <Text color={state.active ? COLORS.blue : COLORS.muted} fontWeight="850" fontSize="xs" noOfLines={1}>{status}</Text>
      </Box>
      {!isLast ? <Box display={{ base: 'none', md: 'block' }} w="16px" h="2px" borderRadius="full" bg={state.completed ? '#86EFAC' : '#BAE6FD'} flexShrink={0} /> : null}
    </HStack>
  );
}

function CompactDayRow({ day, state }: { day: Foundation48Day; state: ReturnType<typeof getDayCardState> }) {
  const statusIcon = state.completed ? CheckCircle2 : state.active || state.started ? PlayCircle : state.softLocked ? LockKeyhole : Circle;
  const statusColor = state.completed ? COLORS.green : state.active || state.started ? COLORS.blue : COLORS.muted;

  return (
    <Box
      as={Link}
      to={getFoundation48DayPath(day.dayNumber)}
      data-testid={`foundation48-day-card-${day.dayNumber}`}
      display="block"
      border="1px solid"
      borderColor={state.active ? '#38BDF8' : COLORS.border}
      borderRadius="2xl"
      bg={state.active ? 'linear-gradient(90deg, #EFF6FF 0%, #FFFFFF 100%)' : 'rgba(255,255,255,0.82)'}
      px={{ base: '3', md: '4' }}
      py="3"
      _hover={{ bg: '#F8FCFF', borderColor: '#7DD3FC' }}
      _focusVisible={{ outline: '3px solid rgba(31,111,214,0.35)', outlineOffset: '2px' }}
    >
      <Flex align="center" justify="space-between" gap="3">
        <HStack minW="0" gap="3">
          <Box w="36px" h="36px" borderRadius="full" bg={state.completed ? '#DCFCE7' : state.active ? '#DBEAFE' : '#F8FAFC'} color={statusColor} display="grid" placeItems="center" flexShrink={0}>
            <Icon as={statusIcon} boxSize="4.5" />
          </Box>
          <Box minW="0">
            <Text color={COLORS.blue} fontSize="xs" fontWeight="950">Ngày {day.dayNumber}</Text>
            <Text color={COLORS.text} fontWeight="950" noOfLines={1}>{getFriendlyDayTitle(day.title)}</Text>
          </Box>
        </HStack>
        {typeof state.score === 'number' ? <Text color={COLORS.green} fontWeight="950" fontSize="sm" flexShrink={0}>{state.score}%</Text> : null}
      </Flex>
    </Box>
  );
}

function getFriendlyDayTitle(title: string) {
  const withoutDay = title.replace(/^Ngày \d+:\s*/, '').trim();
  return withoutDay.split('—')[0]?.trim() || withoutDay;
}
