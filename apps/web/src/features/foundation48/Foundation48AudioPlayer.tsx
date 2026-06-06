import { useState } from 'react';
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import type { Foundation48AudioItem } from './foundation48Types';
import { Foundation48SourceBadge } from './Foundation48SourceBadge';

const COLORS = {
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  blue: '#1F6FD6',
};

export function Foundation48AudioPlayer({ audio, compact = false }: { audio: Foundation48AudioItem[]; compact?: boolean }) {
  const [failedAudio, setFailedAudio] = useState<Record<string, boolean>>({});
  if (audio.length === 0) return null;

  return (
    <Box data-testid="foundation48-audio-section" className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '3', md: '5' }} bg="rgba(255,255,255,0.78)">
      <VStack align="stretch" gap="3">
        <Flex align={{ base: 'start', md: 'center' }} gap="3" direction={{ base: 'column', sm: 'row' }}>
          <OceanMascot mascot="suaNghe" pose="listen" size="sm" decorative motion="float" />
          <Box minW="0">
            <HStack gap="2" wrap="wrap">
              <Text as="h2" fontSize={{ base: 'lg', md: '2xl' }} fontWeight="950" color={COLORS.text}>{compact ? 'Nghe và làm quen' : 'File nghe của ngày này'}</Text>
              <Foundation48SourceBadge label={`${audio.length} MP3`} tone="audio" />
            </HStack>
            <Text color={COLORS.muted} fontSize="sm" fontWeight="700" lineHeight="1.6">{compact ? 'Nghe file của ngày này, sau đó bấm tiếp tục.' : 'Sứa Nghe nhắc bạn: nghe một lượt để bắt ý, rồi nghe lại từng đoạn ngắn.'}</Text>
          </Box>
        </Flex>
        <VStack align="stretch" gap="2.5">
          {audio.map((item, index) => (
            <Box key={item.id} data-testid={`foundation48-audio-item-${index + 1}`} border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p="3" bg="rgba(248,252,255,0.84)">
              <HStack justify="space-between" align="start" gap="3" mb="2" wrap="wrap">
                <Box minW="0">
                  <Text fontWeight="900" color={COLORS.text}>{item.title}</Text>
                  <Text fontSize="xs" color={COLORS.muted} fontWeight="700" noOfLines={1}>{item.fileName}</Text>
                </Box>
                <Text px="2.5" py="1" borderRadius="full" bg="#EFF6FF" color={COLORS.blue} fontSize="xs" fontWeight="900">MP3</Text>
              </HStack>
              <Box
                as="audio"
                aria-label={`${item.title} - ${item.fileName}`}
                controls
                preload="metadata"
                src={item.url}
                w="100%"
                onError={() => setFailedAudio((current) => ({ ...current, [item.id]: true }))}
              />
              {failedAudio[item.id] ? (
                <Text mt="2" color="#B45309" fontSize="sm" fontWeight="800">File nghe này chưa tải được. Bạn vẫn có thể học phần nội dung và thử tải lại trang sau.</Text>
              ) : null}
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
