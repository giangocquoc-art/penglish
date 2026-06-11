import { Box, Button, Container, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { BookOpen, CalendarDays, ChevronRight, Compass, HelpCircle, Sparkles, Waves } from 'lucide-react';
import { Icon } from '@chakra-ui/react';
import { BLOG_POSTS, BLOG_TOPIC_LABELS, BLOG_TOPIC_PILLARS, getBlogPostBySlug, getBlogPostPath, getBlogPostsByTopic, getRelatedBlogPosts, type BlogPost, type BlogTopic } from '../data/blogPosts';
import { OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';

const TOPIC_ORDER: BlogTopic[] = ['on-tieng-anh', 'mat-goc', 'shadowing', 'tu-vung', 'luyen-nghe', 'ngu-phap', 'lo-trinh', 'mien-phi'];

function getSlugFromPath(pathname: string) {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/);
  return match?.[1] ?? '';
}

export function BlogPage() {
  const location = useLocation();
  const slug = getSlugFromPath(location.pathname);
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (slug && !post) {
    return <BlogNotFound />;
  }

  return post ? <BlogArticle post={post} /> : <BlogList />;
}

function BlogList() {
  return (
    <Box bg="linear-gradient(180deg, rgba(232,244,255,0.74), rgba(248,252,255,0.95) 44%, rgba(255,255,255,0.99))" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '4', md: '7' }}>
      <Container maxW="1120px" px="0">
        <VStack align="stretch" gap={{ base: '5', md: '7' }}>
          <Box className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.9)" bg="rgba(255,255,255,0.84)" borderRadius={{ base: '30px', md: '42px' }} p={{ base: '5', md: '9' }} boxShadow="0 26px 80px rgba(31,111,214,0.13)" position="relative" overflow="hidden">
            <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 12% 18%, rgba(91,188,235,0.22), transparent 24%), radial-gradient(circle at 90% 12%, rgba(255,255,255,0.9), transparent 18%), radial-gradient(circle at 70% 100%, rgba(31,111,214,0.12), transparent 30%)" />
            <VStack position="relative" align={{ base: 'center', md: 'start' }} textAlign={{ base: 'center', md: 'left' }} gap="4">
              <HStack color={OCEAN_TOKENS.deepBlue} fontWeight="900" letterSpacing="0.08em" textTransform="uppercase" fontSize="xs">
                <Icon as={Waves} />
                <Text>Nhật ký học cùng cá voi Poo</Text>
              </HStack>
              <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.05" color={OCEAN_TOKENS.text} maxW="880px">
                Blog học tiếng Anh cùng PooEnglish
              </Text>
              <Text fontSize={{ base: 'md', md: 'xl' }} lineHeight="1.85" color={OCEAN_TOKENS.muted} fontWeight="700" maxW="860px">
                Poo gom bài viết theo từng cụm chủ đề để Google, Bing, AI Search và người học đều hiểu rõ đường bơi: ôn tiếng Anh, mất gốc, shadowing, từ vựng, luyện nghe, ngữ pháp, lộ trình và học miễn phí.
              </Text>
              <HStack gap="3" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                <Button as={RouterLink} to="/learning-path" borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" size="lg" rightIcon={<Icon as={ChevronRight} />} _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>
                  Vào học miễn phí
                </Button>
                <Button as={RouterLink} to="/hoc-tieng-anh-cho-nguoi-mat-goc" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                  Xem cụm mất gốc
                </Button>
              </HStack>
            </VStack>
          </Box>

          <Box bg="rgba(255,255,255,0.86)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
            <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
              <Icon as={Compass} />
              <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Cụm chủ đề chính</Text>
            </HStack>
            <HStack wrap="wrap" gap="3">
              {TOPIC_ORDER.map((topic) => (
                <Button key={topic} as={RouterLink} to={BLOG_TOPIC_PILLARS[topic]} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                  {BLOG_TOPIC_LABELS[topic]}
                </Button>
              ))}
            </HStack>
          </Box>

          {TOPIC_ORDER.map((topic) => {
            const posts = getBlogPostsByTopic(topic);
            if (posts.length === 0) return null;
            return (
              <Box key={topic} bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="3xl" p={{ base: '4', md: '6' }} boxShadow="0 14px 34px rgba(31,111,214,0.07)">
                <HStack justify="space-between" align="start" gap="3" wrap="wrap" mb="4">
                  <Box minW="0">
                    <Text as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color={OCEAN_TOKENS.text} lineHeight="1.2">{BLOG_TOPIC_LABELS[topic]}</Text>
                    <Text color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.75">{posts.length} bài viết hỗ trợ, liên kết về trang pillar của cụm.</Text>
                  </Box>
                  <Button as={RouterLink} to={BLOG_TOPIC_PILLARS[topic]} borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                    Mở pillar page
                  </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  {posts.map((post) => <BlogCard key={post.slug} post={post} />)}
                </SimpleGrid>
              </Box>
            );
          })}

          <LearningCta />
        </VStack>
      </Container>
    </Box>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Box as="article" bg="rgba(255,255,255,0.84)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }} boxShadow="0 14px 34px rgba(31,111,214,0.07)">
      <VStack align="stretch" gap="3" h="100%">
        <HStack color={OCEAN_TOKENS.deepBlue} fontWeight="850" fontSize="sm" gap="2" wrap="wrap">
          <Icon as={CalendarDays} />
          <Text>{formatDate(post.date)}</Text>
          <Text color={OCEAN_TOKENS.muted}>• {post.readingTime}</Text>
        </HStack>
        <Text as="h3" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" lineHeight="1.22" color={OCEAN_TOKENS.text}>
          <RouterLink to={getBlogPostPath(post)}>{post.title}</RouterLink>
        </Text>
        <Text color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.8" flex="1">{post.excerpt}</Text>
        <HStack gap="2" wrap="wrap">
          {post.keywords.slice(0, 3).map((keyword) => (
            <Text key={keyword} as="span" px="2.5" py="1" borderRadius="full" bg="rgba(232,244,255,0.86)" color={OCEAN_TOKENS.deepBlue} fontSize="xs" fontWeight="850">{keyword}</Text>
          ))}
        </HStack>
        <Button as={RouterLink} to={getBlogPostPath(post)} alignSelf="start" variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" rightIcon={<Icon as={ChevronRight} />} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
          Đọc bài cùng Poo
        </Button>
      </VStack>
    </Box>
  );
}

function BlogArticle({ post }: { post: BlogPost }) {
  const relatedPosts = getRelatedBlogPosts(post, 3);
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
                  <Text>{post.topicLabel}</Text>
                  <Text aria-hidden="true">•</Text>
                  <Text>{formatDate(post.date)}</Text>
                  <Text aria-hidden="true">•</Text>
                  <Text>{post.readingTime}</Text>
                </HStack>
                <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.05" color={OCEAN_TOKENS.text} maxW="900px">{post.title}</Text>
                <Text fontSize={{ base: 'md', md: 'xl' }} lineHeight="1.85" color={OCEAN_TOKENS.muted} fontWeight="700" maxW="860px">{post.description}</Text>
                <HStack gap="3" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                  {post.ctaLinks.slice(0, 3).map((link, index) => (
                    <Button key={link.to} as={RouterLink} to={link.to} borderRadius="full" bg={index === 0 ? OCEAN_TOKENS.deepBlue : 'white'} color={index === 0 ? 'white' : OCEAN_TOKENS.deepBlue} size="lg" border={index === 0 ? undefined : '1px solid'} borderColor={OCEAN_TOKENS.borderStrong} rightIcon={index === 0 ? <Icon as={ChevronRight} /> : undefined} _hover={{ bg: index === 0 ? OCEAN_TOKENS.oceanBlue : OCEAN_TOKENS.softBlue }}>
                      {link.label}
                    </Button>
                  ))}
                </HStack>
              </VStack>

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '5' }}>
                <HStack mb="3" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Sparkles} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950">{post.quickAnswerHeading}</Text>
                </HStack>
                <Text color={OCEAN_TOKENS.text} fontWeight="750" lineHeight="1.9" mb="3">{post.quickAnswer}</Text>
                <VStack align="stretch" gap="2">
                  {post.quickBullets.map((bullet) => <Text key={bullet} color={OCEAN_TOKENS.muted} fontWeight="750" lineHeight="1.7">• {bullet}</Text>)}
                </VStack>
              </Box>

              <Box bg="rgba(248,252,255,0.92)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '5' }}>
                <HStack mb="3" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Compass} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Mục lục nhỏ</Text>
                </HStack>
                <VStack align="stretch" gap="2">
                  {post.sections.map((section, index) => (
                    <Button key={section.heading} as="a" href={`#section-${index + 1}`} justifyContent="start" whiteSpace="normal" h="auto" py="2.5" borderRadius="2xl" bg="white" color={OCEAN_TOKENS.deepBlue} border="1px solid" borderColor="rgba(186,230,253,0.72)" _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                      {index + 1}. {section.heading}
                    </Button>
                  ))}
                </VStack>
              </Box>

              <VStack align="stretch" gap={{ base: '4', md: '5' }}>
                {post.sections.map((section, index) => (
                  <Box key={section.heading} id={`section-${index + 1}`} scrollMarginTop="96px" bg="rgba(255,255,255,0.9)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                    <HStack mb="3" color={OCEAN_TOKENS.deepBlue} align="start">
                      <Icon as={BookOpen} />
                      <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" lineHeight="1.25">{section.heading}</Text>
                    </HStack>
                    <VStack align="stretch" gap="3">
                      {section.body.map((paragraph) => <Text key={paragraph.slice(0, 80)} as="p" color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.95">{paragraph}</Text>)}
                    </VStack>
                  </Box>
                ))}
              </VStack>

              <Box bg="rgba(255,255,255,0.9)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Compass} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Bài liên quan</Text>
                </HStack>
                <Text color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.85" mb="4">Bài này thuộc cụm {post.topicLabel}. Bạn có thể quay về pillar page, đọc bài hỗ trợ hoặc mở tính năng học thật bên dưới.</Text>
                <HStack wrap="wrap" gap="3">
                  <Button as={RouterLink} to={post.pillarPath} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>Pillar: {post.topicLabel}</Button>
                  {[...post.relatedLinks, ...post.ctaLinks].map((link) => (
                    <Button key={`${link.to}-${link.label}`} as={RouterLink} to={link.to} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>{link.label}</Button>
                  ))}
                  {relatedPosts.map((related) => (
                    <Button key={related.slug} as={RouterLink} to={getBlogPostPath(related)} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>{related.title}</Button>
                  ))}
                </HStack>
              </Box>

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={HelpCircle} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Câu hỏi thường gặp</Text>
                </HStack>
                <VStack align="stretch" gap="3">
                  {post.faqs.map((faq) => (
                    <Box key={faq.question} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p="4">
                      <Text as="h3" fontWeight="900" color={OCEAN_TOKENS.text} mb="2">{faq.question}</Text>
                      <Text color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.75">{faq.answer}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>

          <LearningCta />
        </VStack>
      </Container>
    </Box>
  );
}

function LearningCta() {
  return (
    <Box textAlign="center" bg="linear-gradient(135deg, rgba(31,111,214,0.95), rgba(91,188,235,0.9))" color="white" borderRadius="3xl" p={{ base: '5', md: '7' }} boxShadow="0 24px 70px rgba(31,111,214,0.22)">
      <Icon as={BookOpen} boxSize="8" mb="3" />
      <Text as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" mb="3">Sẵn sàng học miễn phí cùng cá voi Poo?</Text>
      <Text maxW="720px" mx="auto" lineHeight="1.8" fontWeight="700" opacity="0.94" mb="5">Chỉ cần mở một bài, nói thử một câu hoặc ôn lại vài từ. Poo không cần bạn hoàn hảo; Poo chỉ cần bạn bơi thêm một nhịp nhỏ hôm nay.</Text>
      <HStack justify="center" gap="3" wrap="wrap">
        <Button as={RouterLink} to="/learning-path" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" _hover={{ bg: '#E8F4FF' }}>Vào lộ trình học</Button>
        <Button as={RouterLink} to="/shadowing" borderRadius="full" bg="rgba(255,255,255,0.16)" color="white" size="lg" border="1px solid rgba(255,255,255,0.62)" _hover={{ bg: 'rgba(255,255,255,0.24)' }}>Thử shadowing</Button>
      </HStack>
    </Box>
  );
}

function BlogNotFound() {
  return (
    <Box bg="linear-gradient(180deg, rgba(232,244,255,0.74), rgba(248,252,255,0.95))" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '4', md: '7' }}>
      <Container maxW="760px" px="0">
        <Box textAlign="center" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="rgba(186,230,253,0.86)" borderRadius="3xl" p={{ base: '6', md: '9' }} boxShadow="0 24px 70px rgba(31,111,214,0.12)">
          <Text fontSize="5xl" aria-hidden="true" mb="3">🐳</Text>
          <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={OCEAN_TOKENS.text} mb="3">Bài viết này bơi lạc rồi</Text>
          <Text color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.8" mb="5">Poo chưa tìm thấy bài viết bạn muốn đọc. Mình quay lại blog để chọn một chiếc phao khác nhé.</Text>
          <Button as={RouterLink} to="/blog" borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>Về blog PooEnglish</Button>
        </Box>
      </Container>
    </Box>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}
