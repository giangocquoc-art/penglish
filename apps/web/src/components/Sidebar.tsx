import { useEffect, useState } from 'react';
import { Box, Flex, HStack, Icon, Text, VStack, Avatar, IconButton, useColorMode, Button } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Dumbbell, Moon, Sun, Coins, ChevronRight, Waves, LogOut, RefreshCw } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { LearningHeartsBadge } from './learning/LearningHeartsBadge';
import { StreakWhaleBadge } from './streak/AdaptiveWhaleStreak';
import { OCEAN_TOKENS } from './p-english/OceanBackdrop';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState } from '../lib/p-english/daily-rewards';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { usePEnglishSession } from '../lib/p-english/userSession';
import { useAuth } from '../features/auth/AuthProvider';
import { syncLocalFoundation48ProgressToCloud } from '../features/foundation48/foundation48CloudProgress';

type NavItem = { label: string; to: string; icon: any; tint: string; description: string };

const NAV: NavItem[] = [
  { label: 'Học', to: '/luyen-tieng-anh/48-ngay-lay-goc', icon: Waves, tint: OCEAN_TOKENS.whaleBlue, description: 'Bài hôm nay' },
  { label: 'Ôn tập', to: '/practice', icon: Dumbbell, tint: OCEAN_TOKENS.deepBlue, description: 'Lỗi sai' },
  { label: 'Từ vựng', to: '/words', icon: BookOpen, tint: OCEAN_TOKENS.whaleBlue, description: 'Kho từ' },
  { label: 'Trang chủ', to: '/home', icon: Home, tint: OCEAN_TOKENS.oceanBlue, description: 'Tổng quan' },
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
  const session = usePEnglishSession();
  const auth = useAuth();
  const isActive = (to: string) => {
    const [pathname, query = ''] = to.split('?');
    if (query) return location.pathname === pathname && location.search === `?${query}`;
    return location.pathname === pathname || location.pathname.startsWith(pathname + '/');
  };

  useEffect(() => {
    const refreshRewards = () => setRewardState(getDailyRewardState());
    refreshRewards();
    window.addEventListener('focus', refreshRewards);
    window.addEventListener('storage', refreshRewards);
    window.addEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshRewards);
    window.addEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshRewards);
    return () => {
      window.removeEventListener('focus', refreshRewards);
      window.removeEventListener('storage', refreshRewards);
      window.removeEventListener(LOCAL_PROGRESS_UPDATED_EVENT, refreshRewards);
      window.removeEventListener(DAILY_REWARDS_UPDATED_EVENT, refreshRewards);
    };
  }, []);

  return (
    <Flex
      as="aside"
      direction="column"
      w="228px"
      h="100vh"
      position="sticky"
      top="0"
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
          p="2"
          borderRadius="2xl"
          bg="rgba(255, 255, 255, 0.58)"
          border="1px solid"
          borderColor={OCEAN_TOKENS.border}
        >
          <StreakWhaleBadge streak={rewardState.streakDays} compact />
          <HStack data-testid="sidebar-bubbles-badge" gap="1.5" px="2" py="1" borderRadius="full" bg={OCEAN_TOKENS.softAqua} color={OCEAN_TOKENS.text} aria-label={`Bọt biển ${rewardState.bubbles}/${rewardState.maxBubbles}`}>
            <Icon as={Waves} boxSize="4" color={OCEAN_TOKENS.oceanBlue} />
            <Text fontWeight="850" fontSize="sm">{rewardState.bubbles}/{rewardState.maxBubbles}</Text>
          </HStack>
          <HStack gap="1.5" px="2" py="1" borderRadius="full" bg={OCEAN_TOKENS.warm} color={OCEAN_TOKENS.text}>
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
                  <Icon as={item.icon} boxSize="5" color={active ? OCEAN_TOKENS.deepBlue : item.tint} />
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
                {session.isSignedIn ? session.email : 'Tiến độ lưu trên thiết bị này'}
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
                Đồng bộ tiến độ
              </Button>
              <Button size="xs" borderRadius="full" variant="outline" leftIcon={<Icon as={LogOut} />} onClick={() => void auth.signOut()}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button size="xs" borderRadius="full" variant="ghost" color={OCEAN_TOKENS.deepBlue} fontWeight="800" onClick={() => void auth.signInWithGoogle()} _hover={{ bg: 'rgba(232, 244, 255, 0.70)' }}>
              Đồng bộ bằng Google
            </Button>
          )}
        </VStack>

        <Box mt="3">
          <LearningHeartsBadge compact />
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
            aria-label="Toggle theme"
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
