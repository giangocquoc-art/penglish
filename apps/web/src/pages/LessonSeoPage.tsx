import { Box, Button, Container, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { BookOpen, ChevronRight, Compass, HelpCircle, Sparkles, Waves } from 'lucide-react';
import { Icon } from '@chakra-ui/react';
import { OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';
import { getLessonSeoPageByPath, type LessonSeoPage as LessonSeoPageData } from '../data/lessonSeoPages';

export function LessonSeoPage() {
  const location = useLocation();
  const page = getLessonSeoPageByPath(location.pathname);

  if (!page) return <LessonSeoNotFound />;

  return <LessonSeoContent page={page} />;
}

function LessonSeoContent({ page }: { page: LessonSeoPageData }) {
  return (
    <Box bg="linear-gradient(180deg, rgba(232,244,255,0.74), rgba(248,252,255,0.96) 42%, rgba(255,255,255,0.99))" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '4', md: '7' }}>
      <Container maxW="1040px" px="0">
        <VStack align="stretch" gap={{ base: '5', md: '7' }}>
          <Box as="article" className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.9)" bg="rgba(255,255,255,0.86)" borderRadius={{ base: '30px', md: '42px' }} p={{ base: '5', md: '9' }} boxShadow="0 26px 80px rgba(31,111,214,0.13)" position="relative" overflow="hidden">
            <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 12% 18%, rgba(91,188,235,0.22), transparent 24%), radial-gradient(circle at 92% 10%, rgba(255,255,255,0.88), transparent 18%), radial-gradient(circle at 70% 100%, rgba(31,111,214,0.11), transparent 30%)" />
            <VStack position="relative" align="stretch" gap={{ base: '5', md: '6' }}>
              <VStack align={{ base: 'center', md: 'start' }} textAlign={{ base: 'center', md: 'left' }} gap="4">
                <HStack color={OCEAN_TOKENS.deepBlue} fontWeight="900" letterSpacing="0.08em" textTransform="uppercase" fontSize="xs" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                  <Icon as={Waves} />
                  <Text>Bài học tiếng Anh PooEnglish</Text>
                  <Text aria-hidden="true">•</Text>
                  <Text>{page.lesson.level}</Text>
                </HStack>
                <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.05" color={OCEAN_TOKENS.text} maxW="900px">
                  {page.h1}
                </Text>
                <Text fontSize={{ base: 'md', md: 'xl' }} lineHeight="1.85" color={OCEAN_TOKENS.muted} fontWeight="700" maxW="860px">
                  {page.description}
                </Text>
                <HStack gap="3" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                  <Button as={RouterLink} to={`/lessons/${page.lessonId}`} borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" size="lg" rightIcon={<Icon as={ChevronRight} />} _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>
                    Vào bài học tương tác
                  </Button>
                  <Button as={RouterLink} to="/learning-path" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                    Xem lộ trình
                  </Button>
                </HStack>
              </VStack>

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '5' }}>
                <HStack mb="3" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Sparkles} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950">{page.quickAnswerHeading}</Text>
                </HStack>
                <Text color={OCEAN_TOKENS.text} fontWeight="750" lineHeight="1.9" mb="3">{page.quickAnswer}</Text>
                <VStack align="stretch" gap="2">
                  {page.quickBullets.map((bullet) => (
                    <Text key={bullet} color={OCEAN_TOKENS.muted} fontWeight="750" lineHeight="1.7">• {bullet}</Text>
                  ))}
                </VStack>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <Box bg="rgba(255,255,255,0.9)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="3xl" p={{ base: '4', md: '5' }}>
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color={OCEAN_TOKENS.deepBlue} mb="3">Từ vựng nổi bật</Text>
                  <VStack align="stretch" gap="2">
                    {page.lesson.vocabulary.slice(0, 8).map((item) => (
                      <Text key={item.id} color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.7"><Text as="span" color={OCEAN_TOKENS.text} fontWeight="900">{item.term}</Text> — {item.meaningVi}</Text>
                    ))}
                  </VStack>
                </Box>
                <Box bg="rgba(255,255,255,0.9)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="3xl" p={{ base: '4', md: '5' }}>
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color={OCEAN_TOKENS.deepBlue} mb="3">Mẫu câu chính</Text>
                  <VStack align="stretch" gap="2">
                    {page.lesson.sentencePatterns.slice(0, 4).map((pattern) => (
                      <Text key={pattern.id} color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.7"><Text as="span" color={OCEAN_TOKENS.text} fontWeight="900">{pattern.pattern}</Text> — {pattern.vietnameseExplanation}</Text>
                    ))}
                  </VStack>
                </Box>
              </SimpleGrid>

              <VStack align="stretch" gap={{ base: '4', md: '5' }}>
                {page.sections.map((section) => (
                  <Box key={section.heading} bg="rgba(255,255,255,0.9)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                    <HStack mb="3" color={OCEAN_TOKENS.deepBlue} align="start">
                      <Icon as={BookOpen} />
                      <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" lineHeight="1.25">{section.heading}</Text>
                    </HStack>
                    <VStack align="stretch" gap="3">
                      {section.paragraphs.map((paragraph) => (
                        <Text key={paragraph.slice(0, 80)} as="p" color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.9">{paragraph}</Text>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>

              <Box bg="rgba(255,255,255,0.9)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Compass} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Bài liên quan</Text>
                </HStack>
                <HStack wrap="wrap" gap="3">
                  {page.relatedLinks.map((link) => (
                    <Button key={link.to} as={RouterLink} to={link.to} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                      {link.label}
                    </Button>
                  ))}
                </HStack>
              </Box>

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={HelpCircle} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Câu hỏi thường gặp</Text>
                </HStack>
                <VStack align="stretch" gap="3">
                  {page.faqs.map((faq) => (
                    <Box key={faq.question} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p="4">
                      <Text as="h3" fontWeight="900" color={OCEAN_TOKENS.text} mb="2">{faq.question}</Text>
                      <Text color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.75">{faq.answer}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

function LessonSeoNotFound() {
  return (
    <Box bg="linear-gradient(180deg, rgba(232,244,255,0.74), rgba(248,252,255,0.95))" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '4', md: '7' }}>
      <Container maxW="760px" px="0">
        <Box textAlign="center" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="rgba(186,230,253,0.86)" borderRadius="3xl" p={{ base: '6', md: '9' }} boxShadow="0 24px 70px rgba(31,111,214,0.12)">
          <Text fontSize="5xl" aria-hidden="true" mb="3">🐳</Text>
          <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={OCEAN_TOKENS.text} mb="3">Bài học này chưa sẵn sàng</Text>
          <Text color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.8" mb="5">Poo chỉ mở trang SEO cho bài học có dữ liệu thật. Hãy quay về lộ trình để chọn bài đang có.</Text>
          <Button as={RouterLink} to="/learning-path" borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>Về lộ trình học</Button>
        </Box>
      </Container>
    </Box>
  );
}
