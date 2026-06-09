import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Flex,
  Text,
  Avatar,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { get } from '../api';
import { AdaptiveWhaleScene } from '../components/streak/AdaptiveWhaleStreak';

const MotionHStack = motion.create(HStack);
const MotionBox = motion.create(Box);

type Entry = {
  user: { id: number; name: string; avatar?: string };
  activityCount: number;
  streak?: number;
};

type Mode = 'games' | 'streak';

type CurrentUser = { id: number; name: string; avatar?: string } | null;

function readCurrentUser(): CurrentUser {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (!u || u.id == null) return null;
    return { id: u.id, name: u.name ?? 'Bạn', avatar: u.avatar };
  } catch {
    return null;
  }
}

function ToggleGroup({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <Flex justify="center" mb="6">
      <ButtonGroup
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="full"
        p="1"
        gap="1"
        boxShadow="sm"
      >
        <Button
          onClick={() => onChange('games')}
          borderRadius="full"
          fontWeight="700"
          fontSize="sm"
          px="5"
          h="9"
          bg={mode === 'games' ? 'green.500' : 'transparent'}
          color={mode === 'games' ? 'white' : 'gray.700'}
          _hover={{ bg: mode === 'games' ? 'green.600' : 'gray.100' }}
        >
          Lượt chơi game
        </Button>
        <Button
          onClick={() => onChange('streak')}
          borderRadius="full"
          fontWeight="700"
          fontSize="sm"
          px="5"
          h="9"
          bg={mode === 'streak' ? '#2F9EEB' : 'transparent'}
          color={mode === 'streak' ? 'white' : 'gray.700'}
          _hover={{ bg: mode === 'streak' ? '#1F6FD6' : 'gray.100' }}
        >
          Chuỗi học <Box as="span" ml="1">🫧</Box>
        </Button>
      </ButtonGroup>
    </Flex>
  );
}

function SelfRankCard({
  user,
  rank,
  metric,
  metricLabel,
}: {
  user: NonNullable<CurrentUser>;
  rank: number | null;
  metric: number;
  metricLabel: string;
}) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      borderRadius="2xl"
      p="6"
      mb="6"
      borderWidth="1px"
      borderColor="purple.200"
      bgGradient="linear(135deg, #DDF5FF, #F0FDFF)"
      boxShadow="card"
    >
      <Flex align="center" justify="space-between" gap="4" wrap="wrap">
        <HStack gap="4">
          <Avatar
            size="lg"
            name={user.name}
            src={user.avatar}
            borderWidth="3px"
            borderColor="purple.400"
          />
          <VStack align="start" gap="0">
            <Text fontWeight="700" fontSize="md" noOfLines={1}>{user.name}</Text>
            <Text fontSize="sm" color="gray.600">Hạng của bạn</Text>
            <Text fontSize="sm" color="gray.700" fontWeight="600">
              {metric} {metricLabel}
            </Text>
          </VStack>
        </HStack>
        <VStack align="end" gap="0">
          <Text
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="800"
            lineHeight="1"
            bgGradient="linear(to-r, #1F6FD6, #2F9EEB)"
            bgClip="text"
          >
            {rank ? `#${rank}` : '—'}
          </Text>
          <Text fontSize="xs" color="gray.500" mt="1">Hạng của bạn</Text>
        </VStack>
      </Flex>
    </MotionBox>
  );
}

function TopTable({ entries, mode }: { entries: Entry[]; mode: Mode }) {
  const metricLabel = mode === 'streak' ? 'ngày' : 'lượt';

  return (
    <Box bg="white" borderRadius="2xl" boxShadow="card" overflow="hidden">
      <HStack
        px="4"
        py="3"
        bg="gray.50"
        borderBottomWidth="1px"
        borderColor="gray.100"
        fontSize="xs"
        fontWeight="700"
        color="gray.500"
        letterSpacing="0.4px"
        textTransform="uppercase"
      >
        <Box w="60px">Hạng</Box>
        <Box flex="1">Người dùng</Box>
        <Box w="80px" textAlign="right">{mode === 'streak' ? 'Chuỗi' : 'Lượt'}</Box>
      </HStack>

      {entries.length === 0 && (
        <Flex direction="column" align="center" justify="center" py="10" color="gray.400" gap="2">
          <Text>Chưa có thêm xếp hạng</Text>
        </Flex>
      )}

      {entries.map((e, i) => {
        const overall = i + 1;
        const medal = overall === 1 ? '🥇' : overall === 2 ? '🥈' : overall === 3 ? '🥉' : null;
        const badgeBg = overall <= 10 ? 'green.500' : overall <= 20 ? '#2F9EEB' : 'gray.300';
        const badgeColor = overall <= 20 ? 'white' : 'gray.700';
        const score = mode === 'streak' ? (e.streak ?? e.activityCount) : e.activityCount;

        return (
          <MotionHStack
            key={e.user.id}
            px="4"
            py="3"
            borderBottomWidth={i === entries.length - 1 ? '0' : '1px'}
            borderColor="gray.100"
            _hover={{ bg: 'green.50' }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.03, duration: 0.2 }}
            gap="0"
          >
            <Box w="60px">
              {medal ? (
                <Text fontSize="2xl" lineHeight="1">{medal}</Text>
              ) : (
                <Flex
                  w="32px"
                  h="32px"
                  borderRadius="full"
                  bg={badgeBg}
                  color={badgeColor}
                  fontWeight="700"
                  align="center"
                  justify="center"
                  fontSize="sm"
                >
                  {overall}
                </Flex>
              )}
            </Box>
            <HStack flex="1" gap="3" minW="0">
              <Avatar size="sm" name={e.user.name} src={e.user.avatar} />
              <Text fontWeight="500" fontSize="sm" noOfLines={1}>{e.user.name}</Text>
            </HStack>
            <HStack w="80px" justify="flex-end" gap="1">
              <Text fontWeight="700" fontSize="md" color={mode === 'streak' && score <= 0 ? '#64758A' : 'gray.900'}>{score}</Text>
              {mode === 'streak' ? (
                <Box w="28px" h="20px" overflow="hidden" flexShrink={0}>
                  <AdaptiveWhaleScene streak={score} variant="badge" inactive={score <= 0} />
                </Box>
              ) : (
                <Box as="span" fontSize="sm" color="yellow.400">⚡</Box>
              )}
            </HStack>
          </MotionHStack>
        );
      })}
    </Box>
  );
}

export function LeaderboardPage() {
  const [mode, setMode] = useState<Mode>('games');
  const [entries, setEntries] = useState<Entry[]>([]);
  const me = useMemo(readCurrentUser, []);

  useEffect(() => {
    const path = mode === 'streak'
      ? '/activity/leaderboard?type=streak'
      : '/activity/leaderboard';
    get<any>(path)
      .then((r: any) => {
        const data = r?.data?.entries ?? r?.data ?? r ?? [];
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => setEntries([]));
  }, [mode]);

  const myRank = useMemo(() => {
    if (!me) return null;
    const idx = entries.findIndex((e) => String(e.user.id) === String(me.id));
    return idx >= 0 ? idx + 1 : null;
  }, [entries, me]);

  const myMetric = useMemo(() => {
    if (!me) return 0;
    const found = entries.find((e) => String(e.user.id) === String(me.id));
    if (!found) return 0;
    return mode === 'streak' ? (found.streak ?? found.activityCount) : found.activityCount;
  }, [entries, me, mode]);

  return (
    <Box px="6" pb="10" maxW="900px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">Xếp hạng</Box>

      <ToggleGroup mode={mode} onChange={setMode} />

      {me && (
        <SelfRankCard
          user={me}
          rank={myRank}
          metric={myMetric}
          metricLabel={mode === 'streak' ? 'ngày' : 'lượt'}
        />
      )}

      <TopTable entries={entries} mode={mode} />
    </Box>
  );
}
