import { Box, Center, Text, VStack } from '@chakra-ui/react';
import { SpeakingCoachCard } from '../components/p-english/SpeakingCoachCard';

export function SpeakingCoachPage() {
  return (
    <Box
      minH="calc(100vh - 120px)"
      px={{ base: '3', md: '6' }}
      py={{ base: '4', md: '8' }}
      bg="linear-gradient(180deg, rgba(224,247,255,0.34), rgba(240,249,255,0.84))"
      position="relative"
      overflow="hidden"
    >
      <VStack gap="3" mb="5" textAlign="center">
        <Text fontSize="xs" fontWeight="950" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.16em">Speaking Coach</Text>
        <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" color="#102A43" lineHeight="1.06">Luyện nói cùng Poo</Text>
        <Text color="#52667A" fontWeight="750" maxW="560px">Ghi âm một câu ngắn, Poo sẽ nghe và góp ý bằng tiếng Việt thật dễ thương.</Text>
      </VStack>
      <Center>
        <SpeakingCoachCard />
      </Center>
    </Box>
  );
}