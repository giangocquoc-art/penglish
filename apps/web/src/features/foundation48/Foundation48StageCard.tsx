import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Foundation48DayCard } from './Foundation48DayCard';
import { Foundation48MascotGuide, getFoundation48StageGuide } from './Foundation48MascotGuide';
import type { Foundation48Day, Foundation48ProgressState } from './foundation48Types';

export function Foundation48StageCard({
  stage,
  days,
  progress,
}: {
  stage: { id: number; title: string; days: readonly number[] };
  days: Foundation48Day[];
  progress: Foundation48ProgressState;
}) {
  const completed = days.filter((day) => progress.days[day.dayNumber]?.completed).length;
  const guide = getFoundation48StageGuide(stage.id);

  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.92)" borderRadius="3xl" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.78)" data-testid={`foundation48-stage-${stage.id}`}>
      <VStack align="stretch" gap="3">
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap="3" direction={{ base: 'column', md: 'row' }}>
          <Box minW="0">
            <Text color="#1F6FD6" fontWeight="950" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">Vùng biển {stage.id}</Text>
            <Text as="h2" color="#102A43" fontSize={{ base: 'lg', md: '2xl' }} fontWeight="950" lineHeight="1.18">{stage.title}</Text>
            <HStack mt="2" gap="2" wrap="wrap">
              <Text px="2.5" py="1" borderRadius="full" bg="#EFF6FF" color="#1F6FD6" fontSize="xs" fontWeight="950">
                Ngày {stage.days[0]}-{stage.days[stage.days.length - 1]}
              </Text>
              <Text px="2.5" py="1" borderRadius="full" bg={completed ? '#ECFDF5' : '#F8FAFC'} color={completed ? '#15803D' : '#52667A'} fontSize="xs" fontWeight="950">
                {completed}/{days.length} hoàn thành
              </Text>
            </HStack>
          </Box>
          <Foundation48MascotGuide guide={guide} compact w={{ base: '100%', md: '360px' }} />
        </Flex>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="2.5">
          {days.map((day) => <Foundation48DayCard key={day.dayNumber} day={day} state={progress.days[day.dayNumber]} />)}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
