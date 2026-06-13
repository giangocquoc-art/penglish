import { Link, useLocation } from 'react-router-dom';
import { Badge, Box, Button, Divider, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { ArrowRight, CheckCircle2, HelpCircle, Link as LinkIcon, ListChecks, Sparkles } from 'lucide-react';
import { getSeoV4PageByPath } from '../data/seoV4Top1Pages';
import { seoV4PracticeBanks } from '../data/seoV4SupplementBanks';

const COLORS = {
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  blue: '#1F6FD6',
  soft: '#EFF6FF',
  green: '#16A34A',
};

const card = {
  bg: 'rgba(255,255,255,0.86)',
  border: '1px solid',
  borderColor: COLORS.border,
  borderRadius: '3xl',
  boxShadow: '0 18px 44px rgba(31,111,214,0.08)',
};

export function SeoV4Page() {
  const location = useLocation();
  const page = getSeoV4PageByPath(location.pathname);

  if (!page) {
    return (
      <Box p={{ base: '5', md: '8' }}>
        <Text as="h1" color={COLORS.text} fontSize="2xl" fontWeight="950">Trang học này chưa sẵn sàng</Text>
        <Button as={Link} to="/learning-path" mt="4" borderRadius="full" colorScheme="blue">Về lộ trình học</Button>
      </Box>
    );
  }

  return (
    <Box px={{ base: '3', md: '6' }} pb={{ base: '16', md: '20' }} pt={{ base: '3', md: '6' }} bg="linear-gradient(180deg, rgba(232,244,255,0.62), rgba(255,255,255,0.18))" minH="calc(100vh - 72px)" data-testid="seo-v4-page">
      <Box maxW="1120px" mx="auto">
        <Box {...card} p={{ base: '5', md: '8' }} position="relative" overflow="hidden">
          <Box position="absolute" inset="0" bg="radial-gradient(circle at 90% 12%, rgba(91,188,235,0.22), transparent 30%), radial-gradient(circle at 8% 100%, rgba(255,243,196,0.42), transparent 28%)" pointerEvents="none" />
          <Box position="relative">
            <Badge borderRadius="full" bg="#E0F2FE" color={COLORS.blue} textTransform="none" px="3" py="1.5">PooEnglish guide</Badge>
            <Text as="h1" mt="4" color={COLORS.text} fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.05">{page.h1}</Text>
            <Text mt="4" color={COLORS.muted} fontWeight="850" lineHeight="1.8" fontSize={{ base: 'md', md: 'lg' }}>{page.description}</Text>
            <Box mt="5" bg="#F8FCFF" border="1px solid #D7E8F5" borderRadius="3xl" p={{ base: '4', md: '5' }}>
              <HStack align="start" gap="3">
                <Icon as={Sparkles} color={COLORS.blue} mt="1" />
                <Box>
                  <Text fontWeight="950" color={COLORS.text}>Câu trả lời nhanh</Text>
                  <Text mt="2" color={COLORS.muted} fontWeight="800" lineHeight="1.75">{page.quickAnswer}</Text>
                </Box>
              </HStack>
            </Box>
            <Button as={Link} to={page.ctaTo} mt="5" borderRadius="full" bg={COLORS.blue} color="white" rightIcon={<Icon as={ArrowRight} />} _hover={{ bg: '#185BB2' }}>{page.ctaLabel}</Button>
          </Box>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="4" mt="4" alignItems="start">
          <VStack align="stretch" gap="4" gridColumn={{ base: 'auto', lg: 'span 2' }}>
            <Box {...card} p={{ base: '5', md: '6' }}>
              <Text as="h2" fontSize="2xl" fontWeight="950" color={COLORS.text}>Học thế nào để dùng được?</Text>
              <VStack align="stretch" mt="4" gap="4">
                {page.body.map((paragraph) => (
                  <Text key={paragraph} color={COLORS.muted} fontWeight="750" lineHeight="1.85">{paragraph}</Text>
                ))}
              </VStack>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <Box {...card} p="5">
                <HStack gap="2" mb="3"><Icon as={ListChecks} color={COLORS.blue} /><Text as="h2" fontSize="xl" fontWeight="950" color={COLORS.text}>Nhiệm vụ học thử</Text></HStack>
                <VStack align="stretch" gap="2.5">
                  {page.tasks.map((task) => <HStack key={task} align="start" gap="2"><Icon as={CheckCircle2} color={COLORS.green} mt="0.5" /><Text color={COLORS.muted} fontWeight="800">{task}</Text></HStack>)}
                </VStack>
              </Box>
              <Box {...card} p="5">
                <Text as="h2" fontSize="xl" fontWeight="950" color={COLORS.text}>Lỗi dễ gặp</Text>
                <VStack align="stretch" mt="3" gap="2.5">
                  {page.mistakes.map((item) => <Text key={item} bg="#FFF7ED" border="1px solid #FED7AA" borderRadius="2xl" p="3" color={COLORS.muted} fontWeight="800">{item}</Text>)}
                </VStack>
              </Box>
            </SimpleGrid>

            <Box {...card} p={{ base: '5', md: '6' }}>
              <Text as="h2" fontSize="2xl" fontWeight="950" color={COLORS.text}>Kịch bản học 7 ngày</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" mt="4">
                {page.sevenDayPlan.map((item) => <Box key={item} bg={COLORS.soft} border="1px solid #D7E8F5" borderRadius="2xl" p="3"><Text color={COLORS.text} fontWeight="850">{item}</Text></Box>)}
              </SimpleGrid>
            </Box>

            <Box {...card} p={{ base: '5', md: '6' }}>
              <HStack gap="2" mb="3"><Icon as={HelpCircle} color={COLORS.blue} /><Text as="h2" fontSize="2xl" fontWeight="950" color={COLORS.text}>Câu hỏi thường gặp</Text></HStack>
              <VStack align="stretch" gap="3">
                {page.faqs.map((faq) => (
                  <Box key={faq.question} bg="#F8FCFF" border="1px solid #D7E8F5" borderRadius="2xl" p="4">
                    <Text as="h3" color={COLORS.text} fontWeight="950">{faq.question}</Text>
                    <Text mt="2" color={COLORS.muted} fontWeight="800" lineHeight="1.7">{faq.answer}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>

          <VStack align="stretch" gap="4" position={{ lg: 'sticky' }} top={{ lg: '88px' }}>
            <Box {...card} p="5">
              <Text fontWeight="950" color={COLORS.text} fontSize="xl">Đi tiếp trong app</Text>
              <VStack align="stretch" mt="4" gap="2.5">
                {page.internalLinks.map((link) => <Button key={link.to} as={Link} to={link.to} justifyContent="space-between" borderRadius="2xl" variant="outline" rightIcon={<Icon as={LinkIcon} />}>{link.label}</Button>)}
              </VStack>
            </Box>
            <Box {...card} p="5">
              <Text fontWeight="950" color={COLORS.text} fontSize="xl">Bài tập nhanh</Text>
              <Divider my="3" />
              {seoV4PracticeBanks.vocabularyStarter.slice(0, 3).map((word) => <HStack key={word.word} justify="space-between" py="2"><Text fontWeight="900" color={COLORS.text}>{word.word}</Text><Badge>{word.level}</Badge></HStack>)}
              <Text mt="3" color={COLORS.muted} fontWeight="800">Mẫu nói: {seoV4PracticeBanks.speakingSamples[0]}</Text>
            </Box>
          </VStack>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
