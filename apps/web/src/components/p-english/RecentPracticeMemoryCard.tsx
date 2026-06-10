import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, HStack, Icon, SimpleGrid, Tag, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Clock3, Sparkles, Waves } from 'lucide-react';
import { getRecentPracticeSessions, readLocalSkillMemory, type LocalSkillMemory, type PracticeSkillArea } from '../../lib/p-english/localSkillMemory';
import type { LessonProgressMode } from '../../lib/p-english/lesson-progress';

const COLORS = {
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  yellow: '#FFF3C4',
  green: '#22C55E',
  amber: '#F59E0B',
};

const MODE_LABELS: Record<LessonProgressMode, string> = {
  flashcard: 'Thẻ từ',
  quiz: 'Kiểm tra nhanh',
  listen: 'Luyện nghe',
  reflex: 'Phản xạ',
  type: 'Gõ câu',
  match: 'Ghép cặp',
  speed: 'Tốc độ',
};

const SKILL_LABELS: Record<PracticeSkillArea, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  reading: 'Đọc',
  listening: 'Nghe',
  speaking: 'Nói',
  typing: 'Gõ câu',
  review: 'Ôn lại',
  speed: 'Tốc độ',
};

function formatPracticeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'gần đây';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function getTopSkill(memory: LocalSkillMemory) {
  return Object.entries(memory.bySkill)
    .filter(([, item]) => item && item.attempts > 0)
    .sort(([, a], [, b]) => (b?.lastPracticedAt ?? '').localeCompare(a?.lastPracticedAt ?? ''))[0] as [PracticeSkillArea, NonNullable<LocalSkillMemory['bySkill'][PracticeSkillArea]>] | undefined;
}

function getSuggestion(weakCount: number, average?: number) {
  if (weakCount > 0) return 'Poo gợi ý: ôn lại vài mục yếu trước khi mở bài mới.';
  if (average !== undefined && average >= 80) return 'Nhịp học đang chắc. Bạn có thể chuyển sang phần luyện khó hơn hoặc học bước tiếp theo.';
  if (average !== undefined && average >= 55) return 'Bạn đang tiến đều. Làm thêm một lượt ngắn sẽ giúp trí nhớ bền hơn.';
  return 'Bắt đầu bằng một lượt ngắn, ưu tiên đúng và rõ trước khi tăng tốc.';
}

export function RecentPracticeMemoryCard({ fallbackPath = '/learning-path' }: { fallbackPath?: string }) {
  const [memory, setMemory] = useState(() => readLocalSkillMemory());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const refresh = () => setMemory(readLocalSkillMemory());
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const recentSessions = useMemo(() => getRecentPracticeSessions(3), [memory.updatedAt, memory.sessions.length]);
  const latestSession = recentSessions[0];
  const topSkill = useMemo(() => getTopSkill(memory), [memory]);
  const totalAttempts = Object.values(memory.byMode).reduce((sum, item) => sum + (item?.attempts ?? 0), 0);
  const continuePath = latestSession ? `/practice?lessonId=${latestSession.lessonId}&mode=${latestSession.mode}` : fallbackPath;
  const weakCount = latestSession?.weakItemIds.length ?? topSkill?.[1].weakItemCount ?? 0;
  const recentAverage = latestSession ? memory.byMode[latestSession.mode]?.averagePercentage : topSkill?.[1].averagePercentage;

  return (
    <Flex
      className="home-dashboard-card"
      direction="column"
      minH="100%"
      p={{ base: '5', md: '6' }}
      borderRadius="3xl"
      bg="rgba(255,255,255,0.84)"
      border="1px solid"
      borderColor={COLORS.border}
      boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" right="-44px" top="-48px" w="150px" h="150px" borderRadius="full" bg="rgba(91,188,235,0.18)" pointerEvents="none" />
      <HStack position="relative" justify="space-between" align="start" gap="4">
        <Box minW="0">
          <HStack gap="2" mb="2" wrap="wrap">
            <Tag borderRadius="full" bg={COLORS.yellow} color={COLORS.text} fontWeight="900">🐋 Trí nhớ luyện tập</Tag>
            {totalAttempts > 0 ? <Tag borderRadius="full" bg={COLORS.softAqua} color={COLORS.deepBlue} fontWeight="900">{totalAttempts} lượt</Tag> : null}
          </HStack>
          <Text as="h2" color={COLORS.text} fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" lineHeight="1.18">
            Nhịp học gần đây
          </Text>
        </Box>
        <Icon as={Waves} color={COLORS.oceanBlue} boxSize="6" />
      </HStack>

      {recentSessions.length === 0 ? (
        <Box position="relative" mt="5" p="4" borderRadius="2xl" bg="rgba(255,255,255,0.72)" border="1px solid" borderColor="rgba(186,230,253,0.84)">
          <Text color={COLORS.text} fontWeight="850" lineHeight="1.65">
            Bạn chưa có lượt luyện gần đây. Bắt đầu một bài ngắn để Poo ghi nhớ nhịp học của bạn.
          </Text>
        </Box>
      ) : (
        <VStack position="relative" align="stretch" gap="3" mt="5">
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
            <Metric label="Phần luyện gần nhất" value={MODE_LABELS[latestSession.mode]} />
            <Metric label="Điểm lượt cuối" value={`${latestSession.percentage}%`} tone={latestSession.percentage >= 70 ? 'green' : 'amber'} />
            <Metric label="Mục cần ôn" value={weakCount} tone={weakCount > 0 ? 'amber' : 'green'} />
          </SimpleGrid>

          <Box p="4" borderRadius="2xl" bg="rgba(255,255,255,0.72)" border="1px solid" borderColor="rgba(186,230,253,0.84)">
            <HStack gap="2" mb="2" color={COLORS.deepBlue}>
              <Icon as={Clock3} boxSize="4" />
              <Text fontSize="sm" fontWeight="900">{formatPracticeTime(latestSession.completedAt)} · {latestSession.lessonTitleVi}</Text>
            </HStack>
            <Text color={COLORS.muted} fontSize="sm" fontWeight="750" lineHeight="1.65">
              {getSuggestion(weakCount, recentAverage)}
            </Text>
            {topSkill ? (
              <Text mt="2" color={COLORS.deepBlue} fontSize="sm" fontWeight="900">
                Kỹ năng gần nhất: {SKILL_LABELS[topSkill[0]]} · trung bình {topSkill[1].averagePercentage}%
              </Text>
            ) : null}
          </Box>
        </VStack>
      )}

      <Button
        as={Link}
        to={continuePath}
        mt="auto"
        alignSelf="start"
        borderRadius="full"
        bg={COLORS.oceanBlue}
        color="white"
        leftIcon={<Icon as={Sparkles} />}
        _hover={{ bg: COLORS.deepBlue }}
        _focusVisible={{ outline: '3px solid', outlineColor: COLORS.oceanBlue, outlineOffset: '3px' }}
      >
        {recentSessions.length === 0 ? 'Bắt đầu một bài ngắn' : 'Tiếp tục nhịp này'}
      </Button>
    </Flex>
  );
}

function Metric({ label, value, tone = 'blue' }: { label: string; value: string | number; tone?: 'blue' | 'green' | 'amber' }) {
  const color = tone === 'green' ? COLORS.green : tone === 'amber' ? COLORS.amber : COLORS.deepBlue;
  const bg = tone === 'green' ? '#F0FDF4' : tone === 'amber' ? '#FFFBEB' : COLORS.softBlue;
  return (
    <Box bg={bg} border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="2xl" p="3">
      <Text color={color} fontWeight="950" fontSize="lg" noOfLines={1}>{value}</Text>
      <Text mt="1" color={COLORS.muted} fontSize="xs" fontWeight="800">{label}</Text>
    </Box>
  );
}
