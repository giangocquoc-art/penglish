import { useEffect, useState } from 'react';
import { Box, Flex, HStack } from '@chakra-ui/react';
import type { SidebarUser } from './Sidebar';
import { BubbleStreakBadge } from './streak/BubbleStreakBadge';
import { MobileDrawerToggle } from './MobileDrawer';
import { BottomNav } from './BottomNav';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState } from '../lib/p-english/daily-rewards';
import { LEARNING_HEARTS_UPDATED_EVENT } from '../lib/p-english/learning-hearts';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { OceanBackdrop } from './p-english/OceanBackdrop';

export function Topbar({ user }: { user: SidebarUser | null }) {
  const [rewardState, setRewardState] = useState(() => getDailyRewardState());

  useEffect(() => {
    const refreshRewards = () => setRewardState(getDailyRewardState());
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

  return (
    <Flex
      as="header"
      data-testid="app-topbar"
      h={{ base: '68px', lg: '68px', xl: '72px' }}
      align="center"
      justify="space-between"
      px={{ base: '4', md: '5', xl: '6' }}
      gap="3"
      bg="rgba(246, 252, 255, 0.54)"
      borderBottom="1px solid"
      borderColor="rgba(148, 202, 232, 0.30)"
      backdropFilter="blur(18px)"
      position="relative"
      top="auto"
      zIndex="5"
    >
      <MobileDrawerToggle user={user} />

      <HStack gap={{ base: '2', md: '3' }} ml="auto">
        <BubbleStreakBadge state={rewardState} testId="topbar-bubbles-badge" />
      </HStack>
    </Flex>
  );
}

export function Shell({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <OceanBackdrop>
      <Flex data-testid="penglish-app-shell" minH="100vh" position="relative" zIndex="1" maxW="100vw" overflowX="clip">
        <Box data-testid="penglish-shell-sidebar" display={{ base: 'none', lg: 'flex' }} flexShrink={0} position="relative" zIndex="2">
          {sidebar}
        </Box>
        <Box data-testid="penglish-shell-main" flex="1" minW="0" pb={{ base: 'var(--penglish-mobile-safe-bottom)', lg: '0' }} position="relative" zIndex="1" bg="transparent">
          {children}
        </Box>
        <BottomNav />
      </Flex>
    </OceanBackdrop>
  );
}

