import { useEffect, useState } from 'react';
import { Box, Flex, HStack, Icon, Text, VStack, Avatar, IconButton, useColorMode, Button } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Dumbbell, Moon, Sun, Coins, ChevronRight, Waves, LogOut, RefreshCw, Mic } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { OCEAN_TOKENS } from './p-english/OceanBackdrop';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState, getWaterStreak } from '../lib/p-english/daily-rewards';
import { getLearningHeartsState, LEARNING_HEARTS_UPDATED_EVENT, type LearningHeartsState } from '../lib/p-english/learning-hearts';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { usePEnglishSession } from '../lib/p-english/userSession';
import { useAuth } from '../features/auth/AuthProvider';
import { syncLocalFoundation48ProgressToCloud } from '../features/foundation48/foundation48CloudProgress';
import { FooterEasterEggButton } from './easter-eggs/FooterEasterEggButton';

type NavItem = { label: string; to: string; icon: any; tint: string; description: string; pixelIconSrc?: string };

const NAV: NavItem[] = [
  { label: 'Học', to: '/luyen-tieng-anh/48-ngay-lay-goc', icon: Waves, tint: OCEAN_TOKENS.whaleBlue, description: 'Bài hôm nay' },
  { label: 'Shadowing', to: '/shadowing', icon: Mic, tint: OCEAN_TOKENS.oceanBlue, description: 'Nghe & nói', pixelIconSrc: '/assets/shadowing-pixel/micro-normal.png' },
  { label: 'Ôn tập', to: '/practice', icon: Dumbbell, tint: OCEAN_TOKENS.deepBlue, description: 'Câu cần ôn' },
  { label: 'Từ vựng', to: '/words', icon: BookOpen, tint: OCEAN_TOKENS.whaleBlue, description: 'Kho từ' },
  { label: 'Trang chủ', to: '/home', icon: Home, tint: OCEAN_TOKENS.oceanBlue, description: 'Tổng quan' },
];

const SEO_LINKS = [
  { label: 'Học tiếng Anh', to: '/hoc-tieng-anh' },
  { label: 'Lộ trình', to: '/lo-trinh-hoc-tieng-anh' },
  { label: 'Shadowing', to: '/shadowing-tieng-anh' },
  { label: 'Từ vựng', to: '/tu-vung-tieng-anh' },
  { label: 'Luyện nghe', to: '/luyen-nghe-tieng-anh' },
  { label: 'Ngữ pháp', to: '/ngu-phap-tieng-anh' },
  { label: '48 ngày', to: '/48-ngay-lay-goc' },
  { label: 'Giới thiệu', to: '/gioi-thieu' },
  { label: 'Blog', to: '/blog' },
];

const REVIEW_SEO_LINKS = [
  { label: 'Ôn tiếng Anh', to: '/on-tieng-anh' },
  { label: 'Mất gốc', to: '/on-tieng-anh-cho-nguoi-mat-goc' },
  { label: 'Cách ôn hiệu quả', to: '/cach-on-tieng-anh-hieu-qua' },
  { label: 'Ôn từ vựng', to: '/on-tu-vung-tieng-anh' },
  { label: 'Ôn ngữ pháp', to: '/on-ngu-phap-tieng-anh' },
  { label: 'Ôn luyện nghe', to: '/on-luyen-nghe-tieng-anh' },
  { label: 'Ôn nói', to: '/on-noi-tieng-anh' },
  { label: 'Ôn shadowing', to: '/on-shadowing-tieng-anh' },
  { label: 'Học mỗi ngày', to: '/hoc-tieng-anh-moi-ngay' },
  { label: 'Luyện online', to: '/luyen-tieng-anh-online' },
];

export type SidebarUser = {
  id?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  coin?: number;
};

export function Sidebar({ user }: { user: SidebarUser | null }) {
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [rewardState, setRewardState] = useState(() => getDailyRewardState());
  const [heartsState, setHeartsState] = useState<LearningHeartsState>(() => getLearningHeartsState());
  const session = usePEnglishSession();
  const auth = useAuth();
  const isActive = (to: string) => {
    const [pathname, query = ''] = to.split('?');
    if (query) return location.pathname === pathname && location.search === `?${query}`;
    return location.pathname === pathname || location.pathname.startsWith(pathname + '/');
  };

  useEffect(() => {
    const refreshRewards = () => {
      setRewardState(getDailyRewardState());
      setHeartsState(getLearningHeartsState());
    };
    refreshRewards();
    window.addEventListener('focus', refreshRewards);
    window.addEventListener('storage', refreshRewards);
    window.addEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshRewards);
    window.addEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshRewards);
    window.addEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshRewards);
    return () => {
      window.removeEventListener('focus', refreshRewards);
      window.removeEventListener('storage', refreshRewards);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshRewards);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshRewards);
      window.removeEventListener(LEARNING_HEARTS_UPDATED_EVENT, refreshRewards);
    };
  }, []);

  const waterStreak = getWaterStreak(rewardState);
  const diverIconSrc = waterStreak.current > 0
    ? '/assets/shadowing-pixel/streak-diver-active.png'
    : '/assets/shadowing-pixel/streak-diver-inactive.png';
  const spongeIconSrc = heartsState.heartsLeft >= heartsState.maxHearts
    ? '/assets/shadowing-pixel/sponge-full-5.png'
    : heartsState.heartsLeft <= 2
      ? '/assets/shadowing-pixel/sponge-low.png'
      : '/assets/shadowing-pixel/sponge-single.png';

  return (
    <Flex
      as="aside"
      direction="column"
      w="228px"
      h="100dvh"
      maxH="100dvh"
      position="sticky"
      top="0"
      alignSelf="flex-start"
      overflowY="auto"
      overscrollBehavior="contain"
      px="3"
      py="3"
      gap="3"
      data-testid="penglish-sidebar"
      bg="linear-gradient(180deg, rgba(255,255,255,0.36), rgba(221,245,255,0.20))"
      borderRight="1px solid"
      borderColor="rgba(255, 255, 255, 0.26)"
      backdropFilter="blur(26px) saturate(1.14)"
      boxShadow="8px 0 28px rgba(31, 111, 214, 0.024)"
    >
      <VStack align="stretch" px="1" pb="1" gap="2">
        <BrandLogo variant="full" size="md" showSubtitle />
        <HStack
          justify="space-between"
          align="center"
          p="2"
          borderRadius="2xl"
          bg="rgba(255, 255, 255, 0.58)"
          border="1px solid"
          borderColor={OCEAN_TOKENS.border}
          gap="2"
        >
          <VStack align="stretch" gap="1" minW="0" flex="1" data-testid="sidebar-streak-bubbles-summary">
            <HStack gap="1.5" minW="0" color={OCEAN_TOKENS.deepBlue} overflow="hidden">
              <Box as="img" className="pooPixelIcon" src={diverIconSrc} alt="Chuỗi ngày học" loading="lazy" w="20px" h="20px" flexShrink={0} />
              <Text fontSize="xs" fontWeight="900" whiteSpace="nowrap" flexShrink={0}>Chuỗi:</Text>
              <Text fontSize="xs" fontWeight="900" whiteSpace="nowrap" minW="0">{waterStreak.current} ngày</Text>
            </HStack>
            <HStack gap="1.5" minW="0" color={OCEAN_TOKENS.text} overflow="hidden">
              <Box as="img" className="pooPixelIcon" src={spongeIconSrc} alt="Bọt biển còn lại" loading="lazy" w="20px" h="20px" flexShrink={0} />
              <Text fontSize="xs" fontWeight="900" whiteSpace="nowrap" flexShrink={0}>Bọt biển:</Text>
              <Text fontSize="xs" fontWeight="900" whiteSpace="nowrap" minW="0">{heartsState.heartsLeft}/{heartsState.maxHearts}</Text>
            </HStack>
          </VStack>
          <HStack gap="1.5" px="2" py="1" borderRadius="full" bg={OCEAN_TOKENS.warm} color={OCEAN_TOKENS.text} flexShrink={0}>
            <Icon as={Coins} boxSize="4" color="#F59E0B" />
            <Text fontWeight="850" fontSize="sm">{user?.coin ?? 0}</Text>
          </HStack>
        </HStack>
      </VStack>

      <VStack as="nav" align="stretch" gap="1.5" flex="1" aria-label="Điều hướng chính">
        {NAV.map((item) => {
          const active = isActive(item.to);
          return (
            <Link key={item.to} to={item.to}>
              <HStack
                px="2.5"
                py="1.75"
                borderRadius="2xl"
                bg={active ? 'rgba(232, 244, 255, 0.86)' : 'rgba(255, 255, 255, 0.24)'}
                color={active ? OCEAN_TOKENS.deepBlue : OCEAN_TOKENS.text}
                border="1px solid"
                borderColor={active ? OCEAN_TOKENS.borderStrong : 'transparent'}
                boxShadow={active ? '0 16px 34px rgba(31, 111, 214, 0.10)' : 'none'}
                _hover={{ bg: 'rgba(255, 255, 255, 0.68)', borderColor: OCEAN_TOKENS.border }}
                transition="background .18s ease, border-color .18s ease, box-shadow .18s ease"
                gap="2.5"
              >
                <Flex
                  w="36px"
                  h="36px"
                  borderRadius="xl"
                  bg={active ? 'white' : 'rgba(248, 252, 255, 0.72)'}
                  border="1px solid"
                  borderColor={active ? OCEAN_TOKENS.borderStrong : OCEAN_TOKENS.border}
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  {item.pixelIconSrc ? (
                    <Box as="img" className="pooPixelIcon" src={item.pixelIconSrc} alt="" loading="lazy" w="24px" h="24px" opacity={active ? 1 : 0.86} />
                  ) : (
                    <Icon as={item.icon} boxSize="5" color={active ? OCEAN_TOKENS.deepBlue : item.tint} />
                  )}
                </Flex>
                <Box minW="0">
                  <Text fontWeight={active ? '850' : '700'} fontSize="sm" lineHeight="1.15">{item.label}</Text>
                  <Text fontSize="xs" color={OCEAN_TOKENS.muted} fontWeight="650" noOfLines={1} lineHeight="1.25">{item.description}</Text>
                </Box>
              </HStack>
            </Link>
          );
        })}
      </VStack>

      <Box mt="auto" pt="3" borderTop="1px solid" borderColor="rgba(148, 202, 232, 0.24)">
        <Link to="/profile">
          <HStack
            p="2"
            borderRadius="2xl"
            bg="rgba(255, 255, 255, 0.48)"
            border="1px solid"
            borderColor="transparent"
            _hover={{ bg: 'rgba(255, 255, 255, 0.72)', borderColor: OCEAN_TOKENS.border }}
            gap="3"
          >
            <Avatar name={session.displayName} src={session.avatarUrl} size="sm" borderWidth="2px" borderColor={OCEAN_TOKENS.whaleBlue} />
            <Box flex="1" minW="0">
              <Text fontWeight="850" fontSize="sm" noOfLines={1} color={OCEAN_TOKENS.text}>
                {session.displayName}
              </Text>
              <Text fontSize="xs" color={OCEAN_TOKENS.muted} fontWeight="650" noOfLines={1}>
                {session.isSignedIn ? session.email : 'Poo đang giữ tiến độ cho bạn'}
              </Text>
              <Text data-testid="data-mode-indicator" mt="1" display="inline-flex" px="2" py="0.5" borderRadius="full" bg={session.isSignedIn ? '#EAFBF0' : '#E8F4FF'} color={session.isSignedIn ? '#16803A' : OCEAN_TOKENS.deepBlue} fontSize="10px" fontWeight="850" noOfLines={1}>
                {session.dataModeLabel}
              </Text>
            </Box>
            <Icon as={ChevronRight} color={OCEAN_TOKENS.muted} boxSize="4" />
          </HStack>
        </Link>

        <VStack mt="3" align="stretch" gap="2">
          {session.isSignedIn ? (
            <>
              <Button size="xs" borderRadius="full" leftIcon={<Icon as={RefreshCw} />} onClick={() => session.userId && syncLocalFoundation48ProgressToCloud(session.userId)}>
                Lưu lên tài khoản
              </Button>
              <Button size="xs" borderRadius="full" variant="outline" leftIcon={<Icon as={LogOut} />} onClick={() => void auth.signOut()}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button size="xs" borderRadius="full" variant="ghost" color={OCEAN_TOKENS.deepBlue} fontWeight="800" onClick={() => void auth.signInWithGoogle()} _hover={{ bg: 'rgba(232, 244, 255, 0.70)' }}>
              Vào học bằng Google
            </Button>
          )}
        </VStack>

        <Box mt="3" px="2" py="2.5" borderRadius="2xl" bg="rgba(255, 255, 255, 0.42)" border="1px solid" borderColor={OCEAN_TOKENS.border}>
          <Text fontSize="xs" fontWeight="900" color={OCEAN_TOKENS.deepBlue} mb="2">
            PooEnglish
          </Text>
          <HStack as="nav" aria-label="Liên kết học tiếng Anh PooEnglish" wrap="wrap" gap="1.5">
            {SEO_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                <Text as="span" display="inline-flex" px="2" py="1" borderRadius="full" bg="rgba(232,244,255,0.78)" color={OCEAN_TOKENS.deepBlue} fontSize="10px" fontWeight="850">
                  {link.label}
                </Text>
              </Link>
            ))}
          </HStack>
        </Box>

        <Box mt="2" px="2" py="2.5" borderRadius="2xl" bg="rgba(255, 255, 255, 0.42)" border="1px solid" borderColor={OCEAN_TOKENS.border}>
          <Text fontSize="xs" fontWeight="900" color={OCEAN_TOKENS.deepBlue} mb="2">
            Ôn tiếng Anh
          </Text>
          <HStack as="nav" aria-label="Liên kết cụm ôn tiếng Anh PooEnglish" wrap="wrap" gap="1.5">
            {REVIEW_SEO_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                <Text as="span" display="inline-flex" px="2" py="1" borderRadius="full" bg="rgba(232,244,255,0.78)" color={OCEAN_TOKENS.deepBlue} fontSize="10px" fontWeight="850">
                  {link.label}
                </Text>
              </Link>
            ))}
          </HStack>
        </Box>

        <Box mt="2" textAlign="center">
          <FooterEasterEggButton />
        </Box>

        <HStack
          mt="3"
          px="3"
          py="2"
          borderRadius="2xl"
          bg="rgba(255, 255, 255, 0.44)"
          border="1px solid"
          borderColor={OCEAN_TOKENS.border}
          cursor="pointer"
          _hover={{ bg: 'rgba(255, 255, 255, 0.70)' }}
          onClick={toggleColorMode}
          gap="2"
        >
          <Text fontSize="sm">{colorMode === 'dark' ? '☀️' : '🌙'}</Text>
          <Text fontSize="sm" fontWeight="750" color={OCEAN_TOKENS.text}>Giao diện</Text>
          <IconButton
            ml="auto"
            aria-label="Đổi màu giao diện"
            size="xs"
            variant="ghost"
            onClick={(event) => { event.stopPropagation(); toggleColorMode(); }}
          >
            <Icon as={colorMode === 'dark' ? Sun : Moon} />
          </IconButton>
        </HStack>
      </Box>
    </Flex>
  );
}
