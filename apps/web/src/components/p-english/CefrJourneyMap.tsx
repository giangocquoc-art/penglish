import { Box, HStack, Progress, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import { cefrLearnerMilestones } from '../../data/learning/cefrLearnerMilestones';
import type { UnifiedCefrLevel } from '../../data/learning/generatedUnifiedLearningPath';

export function CefrJourneyMap({ currentLevel, pathPercentage }: { currentLevel: UnifiedCefrLevel; pathPercentage: number }) {
  return (
    <Box bg="white" border="1px solid" borderColor="#D7E8F5" borderRadius="3xl" p={{ base: '5', md: '6' }} boxShadow="0 16px 38px rgba(31,111,214,0.06)">
      <HStack justify="space-between" mb="4" align="start" gap="4">
        <Box>
          <Text fontWeight="950" color="#0F172A" fontSize="xl">Bản đồ CEFR</Text>
          <Text mt="1" color="#64748B" fontWeight="700">Đi từ câu rất ngắn đến học độc lập hơn, không gắn với cam kết chứng chỉ.</Text>
        </Box>
        <Tag borderRadius="full" bg="#E8F4FF" color="#2563EB" fontWeight="950">{pathPercentage}%</Tag>
      </HStack>
      <Progress value={pathPercentage} colorScheme="blue" bg="#E2E8F0" borderRadius="full" h="10px" mb="4" />
      <SimpleGrid columns={{ base: 1, md: 4 }} gap="3">
        {cefrLearnerMilestones.map((item) => {
          const active = item.level === currentLevel;
          const reached = pathPercentage >= item.threshold;
          return (
            <Box key={item.level} border="1px solid" borderColor={active ? '#93C5FD' : '#E2E8F0'} bg={active ? '#EFF6FF' : reached ? '#F8FAFC' : 'white'} borderRadius="2xl" p="4">
              <HStack justify="space-between" mb="2">
                <Text fontSize="2xl" fontWeight="950" color={active ? '#2563EB' : '#0F172A'}>{item.level}</Text>
                <Tag size="sm" borderRadius="full" bg={active ? '#DBEAFE' : reached ? '#DCFCE7' : '#F1F5F9'} color={active ? '#2563EB' : reached ? '#15803D' : '#64748B'}>
                  {active ? 'Hiện tại' : reached ? 'Đã chạm' : `${item.threshold}%`}
                </Tag>
              </HStack>
              <Text fontWeight="900" color="#0F172A">{item.label}</Text>
              <Text mt="1" color="#64748B" fontSize="sm" lineHeight="1.55">{item.shortNoteVi}</Text>
              <Text mt="2" color="#2563EB" fontSize="xs" fontWeight="800" lineHeight="1.5">{item.learnerCanDoVi}</Text>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
