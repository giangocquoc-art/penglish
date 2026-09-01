import { Box, HStack, Icon, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import { BookOpen, CheckCircle2, Headphones, HelpCircle, Mic2, Repeat, Sparkles } from 'lucide-react';
import type { UnifiedSkillCoverage } from '../../lib/p-english/unifiedLessonEngine';

const COLORS = {
  text: '#0F172A',
  muted: '#64748B',
  blue: '#2563EB',
  border: '#D7E8F5',
};

const SKILL_META = {
  'Từ vựng': { icon: BookOpen, tone: '#EFF6FF' },
  'Ngữ pháp': { icon: HelpCircle, tone: '#F5F3FF' },
  Đọc: { icon: CheckCircle2, tone: '#F0FDF4' },
  Shadowing: { icon: Headphones, tone: '#E0F2FE' },
  'Phát âm': { icon: Mic2, tone: '#FFFBEB' },
  'Ôn tập': { icon: Repeat, tone: '#F8FAFC' },
} as const;

const SKILL_LABELS: Record<string, string> = {
  Shadowing: 'Nói đuổi',
};

export function SkillCoverageGrid({ coverage }: { coverage: UnifiedSkillCoverage }) {
  return (
    <SimpleGrid data-testid="skill-coverage-grid" columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: '3', md: '4' }} minChildWidth={{ base: '100%', md: '240px' }}>
      {Object.entries(coverage).map(([skill, count]) => {
        const meta = SKILL_META[skill as keyof typeof SKILL_META] ?? { icon: Sparkles, tone: '#F8FAFC' };
        const empty = count <= 0;
        return (
          <Box
            key={skill}
            data-testid="skill-coverage-card"
            data-skill-coverage-card="true"
            bg="rgba(255,255,255,0.94)"
            border="1px solid"
            borderColor={COLORS.border}
            borderRadius="2xl"
            p={{ base: '4', md: '5' }}
            boxShadow="0 12px 30px rgba(31, 111, 214, 0.06)"
            opacity={1}
            minW="0"
          >
            <HStack justify="space-between" align="start" gap="3" minW="0">
              <HStack align="start" gap="3" minW="0" flex="1">
                <HStack w="46px" h="46px" borderRadius="xl" bg={meta.tone} align="center" justify="center" flexShrink={0}>
                  <Icon as={meta.icon} color={COLORS.blue} boxSize="5" />
                </HStack>
                <Box minW="0">
                  <Text fontWeight="950" color={COLORS.text} noOfLines={1} lineHeight="1.2">{SKILL_LABELS[skill] ?? skill}</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="750" noOfLines={2} lineHeight="1.35">
                    {empty ? 'Sắp mở thêm' : `Đang phủ ${count} bài`}
                  </Text>
                </Box>
              </HStack>
              <Tag borderRadius="full" bg={empty ? '#F8FAFC' : '#E8F4FF'} color={empty ? COLORS.muted : COLORS.blue} fontWeight="900" flexShrink={0}>
                {count}
              </Tag>
            </HStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
