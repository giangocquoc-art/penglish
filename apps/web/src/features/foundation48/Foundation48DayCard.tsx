import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { CheckCircle2, Circle, PlayCircle, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFoundation48DayPath } from './foundation48Data';
import { getFoundation48Readiness } from './foundation48DeepLessons';
import type { Foundation48Day, Foundation48ProgressDay } from './foundation48Types';

export function Foundation48DayCard({ day, state }: { day: Foundation48Day; state?: Foundation48ProgressDay }) {
  const completed = Boolean(state?.completed);
  const started = Boolean(state?.started);
  const status = completed ? 'Đã hoàn thành' : started ? 'Đang học' : 'Chưa mở';
  const statusIcon = completed ? CheckCircle2 : started ? PlayCircle : Circle;
  const mistakes = (state?.mistakes || []).filter((item) => !item.resolved).length;
  const readiness = getFoundation48Readiness(day.dayNumber);
  const readinessText = readiness === 'complete' ? 'Đầy đủ' : 'Đang mở rộng';
  const readinessBg = readiness === 'complete' ? '#ECFDF5' : '#FFF7ED';
  const readinessColor = readiness === 'complete' ? '#16A34A' : '#B45309';

  return (
    <Box
      as={Link}
      to={getFoundation48DayPath(day.dayNumber)}
      data-testid={`foundation48-day-card-${day.dayNumber}`}
      display="block"
      border="1px solid"
      borderColor={completed ? '#BBF7D0' : 'rgba(186,230,253,0.88)'}
      borderRadius="2xl"
      p="3"
      bg={completed ? 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' : 'rgba(248,252,255,0.86)'}
      minH="132px"
      _hover={{ transform: 'translateY(-2px)', boxShadow: '0 16px 30px rgba(31,111,214,0.12)', borderColor: completed ? '#86EFAC' : '#7DD3FC' }}
      _focusVisible={{ outline: '3px solid rgba(31,111,214,0.35)', outlineOffset: '2px' }}
      transition="transform .16s ease, box-shadow .16s ease, border-color .16s ease"
    >
      <Flex h="100%" direction="column" justify="space-between" gap="2">
        <Box>
          <HStack justify="space-between" align="start" gap="2">
            <Box minW="0">
              <Text color="#1F6FD6" fontWeight="950" fontSize="xs">Ngày {day.dayNumber}</Text>
              <Text color="#102A43" fontWeight="950" noOfLines={2} lineHeight="1.25">{day.title}</Text>
            </Box>
            <Icon as={statusIcon} color={completed ? '#16A34A' : '#1F6FD6'} flexShrink={0} boxSize="5" aria-hidden="true" />
          </HStack>
          <HStack mt="2.5" gap="1.5" wrap="wrap">
            <Text px="2.5" py="1" borderRadius="full" bg={readinessBg} color={readinessColor} fontSize="10px" fontWeight="950">{readinessText}</Text>
            <Text px="2.5" py="1" borderRadius="full" bg="#EFF6FF" color="#1F6FD6" fontSize="10px" fontWeight="950">Luyện từng bước</Text>
            {day.audio.length > 0 ? <Text px="2.5" py="1" borderRadius="full" bg="#ECFDF5" color="#16A34A" fontSize="10px" fontWeight="950">Nghe</Text> : <Text px="2.5" py="1" borderRadius="full" bg="#F8FAFC" color="#52667A" fontSize="10px" fontWeight="950">Giọng Poo</Text>}
            {mistakes > 0 ? <Text px="2.5" py="1" borderRadius="full" bg="#FFF7ED" color="#B45309" fontSize="10px" fontWeight="950">{mistakes} lỗi</Text> : null}
          </HStack>
        </Box>
        <HStack justify="space-between" gap="2">
          <Text color={completed ? '#15803D' : started ? '#1F6FD6' : '#52667A'} fontSize="xs" fontWeight="950">{status}</Text>
          <HStack gap="1.5" color="#52667A">
            {typeof state?.score === 'number' ? <Text fontSize="xs" fontWeight="950">{state.score}%</Text> : null}
            <Icon as={Volume2} boxSize="3.5" />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
}
