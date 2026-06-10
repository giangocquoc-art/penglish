import { Box, Container, Flex, Heading, HStack, VStack, Text, Button, SimpleGrid, Icon, Badge, Progress, Circle } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, Trophy, Users, ArrowRight, CheckCircle2, Headphones, Sparkles, Star } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { AdaptiveWhaleScene } from '../components/streak/AdaptiveWhaleStreak';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';

const landingColors = {
  pageBg: '#EEF8FF',
  sectionBg: '#F7FBFF',
  text: '#102A43',
  secondaryText: '#52667A',
  mutedText: '#718096',
  card: '#FFFFFF',
  softCard: 'rgba(255, 255, 255, 0.86)',
  border: '#CFE7F5',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  whaleBlue: '#5BBCEB',
  softAqua: '#DDF5FF',
  aquaAccent: '#38C8D8',
  successGreen: '#4CCB6B',
  softGreen: '#E4FBEA',
  orange: '#F59E0B',
  softYellow: '#FFF3C4',
};

const landingFontStack = '"Be Vietnam Pro", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const FEATURES = [
  { icon: Zap, title: 'Ôn đúng lúc', desc: 'Các từ đã học sẽ quay lại đúng nhịp để bạn nhớ chắc hơn.', bg: landingColors.softAqua, color: landingColors.deepBlue },
  { icon: BookOpen, title: 'Lộ trình TOEIC & IELTS', desc: 'Từ vựng được chia theo mục tiêu và trình độ để dễ bắt đầu.', bg: '#EAF7FF', color: landingColors.oceanBlue },
  { icon: Trophy, title: '6 trò luyện tương tác', desc: 'Ghép cặp, xếp chữ, luyện nghe và nhiều trò luyện ngắn khác.', bg: '#E9FAFF', color: landingColors.aquaAccent },
  { icon: Users, title: 'Học đều mỗi ngày', desc: 'Theo dõi chuỗi ngày học và tiến độ của bạn theo cách nhẹ nhàng.', bg: landingColors.softYellow, color: landingColors.orange },
];

const TESTIMONIALS = [
  { name: 'Minh Anh', role: 'Sinh viên', quote: 'Mình thích cách bài học chia nhỏ. Mỗi ngày học một chút nên đỡ bị ngợp.', avatarTone: 'aqua', avatarLabel: 'Cá Mây' },
  { name: 'Quang Huy', role: 'Người đi làm', quote: 'Các thẻ từ quay lại đúng lúc, giúp mình nhớ lại mà không phải tự ghi chú nhiều.', avatarTone: 'blue', avatarLabel: 'Cá Sao' },
  { name: 'Hà Linh', role: 'Học sinh THPT', quote: 'Giao diện dễ thương, bài luyện ngắn nên mình dễ giữ thói quen học mỗi ngày.', avatarTone: 'coral', avatarLabel: 'Cá Cam' },
];

const fishAvatarPalettes = {
  aqua: { body: '#38C8D8', belly: '#DDF5FF', fin: '#1F6FD6', blush: '#F9A8D4', bg: '#E9FAFF' },
  blue: { body: '#5BBCEB', belly: '#F7FBFF', fin: '#2F9EEB', blush: '#FDBA74', bg: '#EAF7FF' },
  coral: { body: '#F59E0B', belly: '#FFF3C4', fin: '#38C8D8', blush: '#FB7185', bg: '#FFF7ED' },
};

type FishAvatarTone = keyof typeof fishAvatarPalettes;

function OceanFishAvatar({ tone, label }: { tone: string; label: string }) {
  const palette = fishAvatarPalettes[(tone as FishAvatarTone) in fishAvatarPalettes ? (tone as FishAvatarTone) : 'aqua'];

  return (
    <Flex
      data-testid="testimonial-fish-avatar"
      aria-label={`Avatar đại dương ${label}`}
      role="img"
      w="48px"
      h="48px"
      borderRadius="full"
      bg={palette.bg}
      border="1px solid"
      borderColor={landingColors.border}
      align="center"
      justify="center"
      position="relative"
      overflow="hidden"
      flexShrink={0}
      boxShadow="inset 0 0 0 3px rgba(255,255,255,0.62), 0 8px 18px rgba(31, 111, 214, 0.10)"
    >
      <Box position="absolute" left="7px" top="10px" fontSize="8px" color={landingColors.oceanBlue} opacity="0.55">●</Box>
      <Box position="absolute" right="8px" bottom="7px" fontSize="6px" color={landingColors.aquaAccent} opacity="0.58">●</Box>
      <Box
        position="absolute"
        left="9px"
        top="18px"
        w="11px"
        h="12px"
        bg={palette.fin}
        clipPath="polygon(0 50%, 100% 0, 100% 100%)"
        opacity="0.9"
      />
      <Box
        position="relative"
        w="29px"
        h="22px"
        bg={palette.body}
        borderRadius="55% 48% 50% 58%"
        boxShadow="inset -5px -5px 0 rgba(16, 42, 67, 0.08)"
        transform="translateX(4px)"
      >
        <Box position="absolute" right="4px" top="5px" w="5px" h="5px" borderRadius="full" bg="#102A43" />
        <Box position="absolute" right="5px" top="6px" w="1.5px" h="1.5px" borderRadius="full" bg="white" />
        <Box position="absolute" right="2px" top="12px" w="5px" h="3px" borderRadius="full" bg={palette.blush} opacity="0.72" />
        <Box position="absolute" left="9px" bottom="2px" w="12px" h="7px" borderRadius="50%" bg={palette.belly} opacity="0.88" />
        <Box position="absolute" left="11px" top="-6px" w="10px" h="10px" bg={palette.fin} clipPath="polygon(50% 0, 0 100%, 100% 100%)" opacity="0.86" />
        <Box position="absolute" left="11px" bottom="-6px" w="10px" h="10px" bg={palette.fin} clipPath="polygon(0 0, 100% 0, 50% 100%)" opacity="0.74" />
      </Box>
    </Flex>
  );
}

function ProductMockup() {
  return (
    <Box id="landing-preview" position="relative" w="100%" maxW={{ base: '420px', lg: '560px' }} mx="auto" scrollMarginTop="28px">
      <Box
        position="absolute"
        inset={{ base: '-18px 10px auto auto', md: '-28px -18px auto auto' }}
        w={{ base: '86px', md: '120px' }}
        h={{ base: '86px', md: '120px' }}
        borderRadius="full"
        bg="rgba(47, 158, 235, 0.13)"
        filter="blur(2px)"
      />
      <Box
        position="absolute"
        left={{ base: '-10px', md: '-22px' }}
        bottom={{ base: '18px', md: '42px' }}
        w={{ base: '82px', md: '116px' }}
        h={{ base: '82px', md: '116px' }}
        borderRadius="full"
        bg="rgba(56, 200, 216, 0.13)"
        filter="blur(1px)"
      />

      <Box
        position="relative"
        bg={landingColors.softCard}
        border="1px solid"
        borderColor={landingColors.border}
        borderRadius={{ base: '28px', md: '34px' }}
        p={{ base: '4', md: '6' }}
        boxShadow="0 24px 64px rgba(16, 32, 51, 0.13)"
        backdropFilter="blur(18px)"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset="0"
          bgGradient="radial(circle at 18% 15%, rgba(91, 188, 235, 0.18), transparent 32%), radial(circle at 82% 18%, rgba(56, 200, 216, 0.12), transparent 34%), linear(135deg, rgba(221, 245, 255, 0.78), rgba(247, 251, 255, 0.90))"
        />
        <VStack position="relative" align="stretch" gap={{ base: '4', md: '5' }}>
          <Flex justify="space-between" align="center" gap="3">
            <HStack gap="3" minW="0">
              <Circle size={{ base: '44px', md: '52px' }} bg={landingColors.softAqua} color={landingColors.deepBlue}>
                <Icon as={Sparkles} boxSize={{ base: '5', md: '6' }} />
              </Circle>
              <Box minW="0">
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="800" letterSpacing="-0.01em" color={landingColors.text} noOfLines={1}>Bài hôm nay</Text>
                <Text fontSize={{ base: 'xs', md: 'sm' }} color={landingColors.secondaryText} noOfLines={1}>Bài 1 • Chào hỏi A1</Text>
              </Box>
            </HStack>
            <Badge bg={landingColors.softAqua} color={landingColors.deepBlue} borderRadius="full" px="3" py="1" fontWeight="700" flexShrink={0}>+60 XP</Badge>
          </Flex>

          <Box bg={landingColors.card} border="1px solid" borderColor={landingColors.border} borderRadius="3xl" p={{ base: '4', md: '5' }} boxShadow="0 14px 32px rgba(16, 32, 51, 0.07)">
            <HStack justify="space-between" mb="4" align="start" gap="3">
              <Box>
                <Text fontSize="xs" fontWeight="700" color={landingColors.deepBlue} letterSpacing="0.08em" textTransform="uppercase">Thẻ từ thông minh</Text>
                <Heading as="h3" mt="2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" lineHeight="1.18" letterSpacing="-0.02em" color={landingColors.text}>Nice to meet you</Heading>
              </Box>
              <Circle size="42px" bg={landingColors.softAqua} color={landingColors.oceanBlue} flexShrink={0}>
                <Icon as={Headphones} boxSize="5" />
              </Circle>
            </HStack>
            <Text color={landingColors.secondaryText} fontSize={{ base: 'sm', md: 'md' }} fontWeight="400" lineHeight="1.68">
              Rất vui được gặp bạn • Lặp lại đúng thời điểm để nhớ lâu hơn.
            </Text>
            <HStack mt="4" gap="2" wrap="wrap">
              <Badge bg={landingColors.softAqua} color={landingColors.deepBlue} borderRadius="full" px="3" fontWeight="700">Từ vựng</Badge>
              <Badge bg={landingColors.softGreen} color="#2F7D46" borderRadius="full" px="3" fontWeight="700">Nghe</Badge>
              <Badge bg={landingColors.softYellow} color={landingColors.orange} borderRadius="full" px="3" fontWeight="700">Phản xạ</Badge>
            </HStack>
          </Box>

          <SimpleGrid columns={2} gap="3">
            <Box bg={landingColors.card} border="1px solid" borderColor={landingColors.border} borderRadius="2xl" p={{ base: '3', md: '4' }}>
              <HStack mb="2" color={landingColors.deepBlue}>
                <Box w="36px" h="24px" overflow="hidden">
                  <AdaptiveWhaleScene streak={5} variant="badge" />
                </Box>
                <Text fontWeight="800">5 ngày</Text>
              </HStack>
              <Text fontSize="xs" color={landingColors.mutedText}>Chuỗi học đại dương</Text>
            </Box>
            <Box bg={landingColors.card} border="1px solid" borderColor={landingColors.border} borderRadius="2xl" p={{ base: '3', md: '4' }}>
              <HStack mb="2" color={landingColors.successGreen}>
                <Icon as={CheckCircle2} boxSize="5" />
                <Text fontWeight="800">84%</Text>
              </HStack>
              <Text fontSize="xs" color={landingColors.mutedText}>Tiến độ hôm nay</Text>
            </Box>
          </SimpleGrid>

          <Box bg={landingColors.card} border="1px solid" borderColor={landingColors.border} borderRadius="2xl" p={{ base: '3', md: '4' }}>
            <Flex justify="space-between" mb="2" gap="3">
              <Text fontSize="sm" fontWeight="700" letterSpacing="-0.01em" color={landingColors.text}>Lộ trình bài học ngắn</Text>
              <HStack color={landingColors.orange} gap="1">
                <Icon as={Star} boxSize="4" fill="currentColor" />
                <Text fontSize="sm" fontWeight="700">3/4</Text>
              </HStack>
            </Flex>
            <Progress value={72} sx={{ '& > div': { background: `linear-gradient(90deg, ${landingColors.aquaAccent}, ${landingColors.oceanBlue})` } }} borderRadius="full" h="10px" bg={landingColors.softAqua} />
            <HStack justify="space-between" mt="3" color={landingColors.mutedText} fontSize="xs" fontWeight="700">
              <Text>Thẻ từ</Text>
              <Text>Kiểm tra</Text>
              <Text>Nghe</Text>
              <Text>Ôn lại</Text>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export function LandingPage() {
  return (
    <OceanPageShell variant="login" overlayStrength="soft" minH="100vh" overflowX="hidden" fontFamily={landingFontStack}>
      <Container maxW="6xl" px={{ base: '4', md: '6' }} pt={{ base: '4', md: '14' }} pb={{ base: '10', md: '16' }}>
        <HStack justify="space-between" align="center" mb={{ base: '6', md: '14' }} gap={{ base: '3', md: '5' }} w="100%">
          <Box flex="1" minW="0" sx={{ '& img': { maxW: '100%' } }}>
            <BrandLogo variant="compact" size="md" />
          </Box>
          <Button
            as={Link}
            to="/home"
            data-testid="landing-header-start"
            bg={landingColors.oceanBlue}
            color="white"
            size={{ base: 'sm', md: 'lg' }}
            fontWeight="800"
            boxShadow="0 4px 0 rgba(31, 111, 214, 0.72)"
            px={{ base: '4', md: '7' }}
            flexShrink={0}
            _hover={{ bg: landingColors.deepBlue, transform: 'translateY(-1px)' }}
            _active={{ transform: 'translateY(1px)', boxShadow: '0 2px 0 rgba(31, 111, 214, 0.72)' }}
          >
            Vào học miễn phí
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: '6', lg: '12' }} alignItems="center" mb={{ base: '10', md: '18' }}>
          <VStack align={{ base: 'stretch', md: 'start' }} gap={{ base: '4', md: '6' }} textAlign={{ base: 'left', md: 'left' }}>
            <Badge
              w="fit-content"
              maxW="100%"
              whiteSpace="normal"
              textAlign="left"
              bg={landingColors.softAqua}
              color={landingColors.deepBlue}
              borderRadius="full"
              px={{ base: '4', md: '5' }}
              py={{ base: '2', md: '2.5' }}
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="800"
              lineHeight="1.45"
              letterSpacing="-0.01em"
            >
              Học tập là miễn phí, PooEnglish không bắt bất kỳ ai trả phí cho việc học
            </Badge>
            <Heading
              as="h1"
              fontSize={{ base: '2rem', sm: '2.55rem', md: '3.48rem' }}
              fontWeight="800"
              lineHeight={{ base: '1.12', md: '1.1' }}
              letterSpacing={{ base: '-0.018em', md: '-0.028em' }}
              color={landingColors.text}
              maxW="640px"
            >
              Học từ vựng tiếng Anh nhẹ nhàng mỗi ngày
            </Heading>
            <Text fontSize={{ base: 'sm', md: 'lg' }} fontWeight="400" color={landingColors.secondaryText} lineHeight={{ base: '1.58', md: '1.72' }} maxW="620px" noOfLines={{ base: 3, md: undefined }}>
              Thẻ từ thông minh, ôn lại đúng lúc và lộ trình TOEIC, IELTS,
              THPT. Học theo bài ngắn, tiến độ rõ ràng mỗi ngày.
            </Text>
            <Flex gap="3" direction={{ base: 'column', sm: 'row' }} w={{ base: '100%', sm: 'auto' }}>
              <Button
                as={Link}
                to="/home"
                data-testid="landing-hero-start"
                size="lg"
                bgGradient={`linear(135deg, ${landingColors.aquaAccent}, ${landingColors.oceanBlue})`}
                color="white"
                rightIcon={<Icon as={ArrowRight} />}
                fontWeight="800"
                boxShadow="0 4px 0 rgba(31, 111, 214, 0.72)"
                px="8"
                w={{ base: '100%', sm: 'auto' }}
                _hover={{ bgGradient: `linear(135deg, ${landingColors.oceanBlue}, ${landingColors.deepBlue})`, transform: 'translateY(-1px)' }}
                _active={{ transform: 'translateY(1px)', boxShadow: '0 2px 0 rgba(31, 111, 214, 0.72)' }}
              >
                Vào học miễn phí
              </Button>
              <Button as="a" href="#landing-preview" size="lg" fontWeight="700" variant="outline" borderColor={landingColors.border} color={landingColors.text} bg="rgba(255,255,255,0.72)" w={{ base: '100%', sm: 'auto' }} _hover={{ bg: landingColors.card }}>
                Xem thử
              </Button>
            </Flex>
            <HStack gap={{ base: '5', md: '6' }} pt="2" wrap="wrap" display={{ base: 'none', sm: 'flex' }}>
              <VStack align="start" gap="0">
                <Text fontWeight="800" fontSize={{ base: '27px', md: '31px' }} lineHeight="1.08" letterSpacing="-0.02em" color={landingColors.text}>A1–B2</Text>
                <Text fontSize="sm" color={landingColors.mutedText}>cấp độ</Text>
              </VStack>
              <VStack align="start" gap="0">
                <Text fontWeight="800" fontSize={{ base: '27px', md: '31px' }} lineHeight="1.08" letterSpacing="-0.02em" color={landingColors.text}>70+</Text>
                <Text fontSize="sm" color={landingColors.mutedText}>lộ trình</Text>
              </VStack>
              <VStack align="start" gap="0">
                <Text fontWeight="800" fontSize={{ base: '27px', md: '31px' }} lineHeight="1.08" letterSpacing="-0.02em" color={landingColors.text}>6</Text>
                <Text fontSize="sm" color={landingColors.mutedText}>trò luyện</Text>
              </VStack>
            </HStack>
          </VStack>

          <Box position="relative">
            <Box position="absolute" right={{ base: '8px', md: '-18px' }} top={{ base: '-48px', md: '-66px' }} zIndex={2} pointerEvents="none" display={{ base: 'none', md: 'block' }}>
              <OceanMascot mascot="poo" pose="idle" size="hero" decorative motion="float" />
            </Box>
            <ProductMockup />
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
          {FEATURES.map((f) => (
            <VStack
              key={f.title}
              align="start"
              p="5"
              bg={landingColors.softCard}
              backdropFilter="blur(10px)"
              borderRadius="xl"
              border="1px solid"
              borderColor={landingColors.border}
              boxShadow="0 12px 30px rgba(16, 32, 51, 0.08)"
              gap="3"
            >
              <Flex
                w="48px"
                h="48px"
                borderRadius="lg"
                bg={f.bg}
                align="center"
                justify="center"
              >
                <Icon as={f.icon} boxSize="6" color={f.color} />
              </Flex>
              <Text fontWeight="700" letterSpacing="-0.01em" color={landingColors.text}>{f.title}</Text>
              <Text fontSize="sm" fontWeight="400" lineHeight="1.65" color={landingColors.secondaryText}>{f.desc}</Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>

      <Box bgGradient="linear(135deg, #F7FBFF, #FFFFFF)" py={{ base: '12', md: '16' }}>
        <Container maxW="6xl" px={{ base: '4', md: '6' }}>
          <VStack gap="3" mb="10" textAlign="center">
            <Text fontSize="sm" fontWeight="700" color={landingColors.deepBlue} letterSpacing="0.06em" textTransform="uppercase">Người dùng nói gì</Text>
            <Heading fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" lineHeight="1.18" letterSpacing="-0.02em" color={landingColors.text}>Trải nghiệm học tiếng Anh rõ ràng, nhẹ và có nhịp</Heading>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="5">
            {TESTIMONIALS.map((t) => (
              <VStack
                key={t.name}
                align="start"
                p="6"
                bg={landingColors.card}
                borderRadius="2xl"
                border="1px solid"
                borderColor={landingColors.border}
                boxShadow="0 12px 30px rgba(16, 32, 51, 0.08)"
                gap="4"
                _hover={{ transform: 'translateY(-4px)', boxShadow: '0 16px 36px rgba(16, 32, 51, 0.11)' }}
                transition="all .2s"
              >
                <Text fontSize="md" fontWeight="400" color={landingColors.secondaryText} lineHeight="1.68" fontStyle="italic">"{t.quote}"</Text>
                <HStack gap="3" pt="2">
                  <OceanFishAvatar tone={t.avatarTone} label={t.avatarLabel} />
                  <VStack align="start" gap="0">
                    <Text fontWeight="700" fontSize="sm" color={landingColors.text}>{t.name}</Text>
                    <Text fontSize="xs" color={landingColors.mutedText}>{t.role}</Text>
                  </VStack>
                </HStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box bgGradient="linear(135deg, #1F6FD6, #2F9EEB)" py="10">
        <Container maxW="6xl" px={{ base: '4', md: '6' }}>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="700" lineHeight="1.45" color="white" textAlign="center">
            A1–B2 • lộ trình theo kỹ năng • 6 trò luyện tương tác
          </Text>
        </Container>
      </Box>
    </OceanPageShell>
  );
}
