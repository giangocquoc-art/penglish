import { useEffect, useState } from 'react';
import { Box, Flex, HStack, Text, Button, Icon, IconButton } from '@chakra-ui/react';
import { Star, Waves } from 'lucide-react';
import type { SidebarUser } from './Sidebar';
import { StreakWhaleBadge } from './streak/AdaptiveWhaleStreak';
import { MobileDrawerToggle } from './MobileDrawer';
import { BottomNav } from './BottomNav';
import { DAILY_REWARDS_UPDATED_EVENT, getDailyRewardState } from '../lib/p-english/daily-rewards';
import { LOCAL_PROGRESS_UPDATED_EVENT } from '../lib/p-english/local-progress';
import { OceanBackdrop, OCEAN_TOKENS } from './p-english/OceanBackdrop';

export function Topbar({ user }: { user: SidebarUser | null }) {
  const [rewardState, setRewardState] = useState(() => getDailyRewardState());

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
      as="header"
      h={{ base: '68px', lg: '68px', xl: '72px' }}
      align="center"
      justify="space-between"
      px={{ base: '4', md: '5', xl: '6' }}
      gap="3"
      bg="rgba(246, 252, 255, 0.54)"
      borderBottom="1px solid"
      borderColor="rgba(148, 202, 232, 0.30)"
      backdropFilter="blur(18px)"
      position="sticky"
      top="0"
      zIndex="20"
    >
      <MobileDrawerToggle user={user} />

      <Box display={{ base: 'none', md: 'block' }} color={OCEAN_TOKENS.muted} fontWeight="700" fontSize="sm">
        P-English · vùng học yên tĩnh
      </Box>

      <HStack gap={{ base: '2', md: '3' }} ml="auto">
        <StreakWhaleBadge streak={rewardState.streakDays} />
        <HStack
          data-testid="topbar-bubbles-badge"
          gap="1.5"
          px={{ base: '2.5', md: '3' }}
          h="38px"
          borderRadius="full"
          bg="rgba(255, 247, 214, 0.86)"
          color={OCEAN_TOKENS.text}
          border="1px solid"
          borderColor="rgba(249, 185, 62, 0.34)"
          boxShadow="0 12px 26px rgba(249, 185, 62, 0.10)"
          aria-label={`Bọt biển ${rewardState.bubbles}/${rewardState.maxBubbles}`}
        >
          <Icon as={Waves} boxSize="4" color={OCEAN_TOKENS.oceanBlue} />
          <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="900" noOfLines={1}>Bọt biển {rewardState.bubbles}/{rewardState.maxBubbles}</Text>
        </HStack>

        <Button
          bg="rgba(255, 255, 255, 0.70)"
          color={OCEAN_TOKENS.deepBlue}
          leftIcon={<Icon as={Star} />}
          borderRadius="full"
          px="4"
          h="38px"
          fontWeight="800"
          border="1px solid"
          borderColor={OCEAN_TOKENS.borderStrong}
          boxShadow="0 12px 28px rgba(31, 111, 214, 0.08)"
          _hover={{ bg: 'rgba(232, 244, 255, 0.92)', boxShadow: '0 14px 32px rgba(31, 111, 214, 0.12)' }}
          display={{ base: 'none', md: 'inline-flex' }}
        >
          Học miễn phí
        </Button>

        <IconButton
          aria-label="P-English học miễn phí"
          icon={<Icon as={Star} />}
          bg="rgba(255, 255, 255, 0.72)"
          color={OCEAN_TOKENS.deepBlue}
          borderRadius="full"
          border="1px solid"
          borderColor={OCEAN_TOKENS.borderStrong}
          boxShadow="0 12px 26px rgba(31, 111, 214, 0.08)"
          _hover={{ bg: OCEAN_TOKENS.softBlue }}
          display={{ base: 'inline-flex', md: 'none' }}
        />
      </HStack>
    </Flex>
  );
}

export function Shell({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <OceanBackdrop>
      <Flex minH="100vh" position="relative" zIndex="1">
        <Box display={{ base: 'none', lg: 'flex' }} flexShrink={0} position="relative" zIndex="2">
          {sidebar}
        </Box>
        <Box flex="1" minW="0" pb={{ base: 'var(--penglish-mobile-safe-bottom)', lg: '0' }} position="relative" zIndex="1">
          {children}
        </Box>
        <BottomNav />
      </Flex>
    </OceanBackdrop>
  );
}
