import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Dumbbell,
  Route,
  User,
} from 'lucide-react';

type NavItem = { label: string; to: string; icon: any };

const NAV_OCEAN = {
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  muted: '#52667A',
  border: '#D7E8F5',
};

const NAV: NavItem[] = [
  { label: 'Học', to: '/learning-path', icon: Route },
  { label: 'Ôn tập', to: '/practice', icon: Dumbbell },
  { label: 'Từ vựng', to: '/words', icon: BookOpen },
  { label: 'Hồ sơ', to: '/profile', icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const isActive = (to: string) => {
    const [pathname, query = ''] = to.split('?');
    if (query) return location.pathname === pathname && location.search === `?${query}`;
    return location.pathname === pathname || location.pathname.startsWith(pathname + '/');
  };

  return (
    <Box
      as="nav"
      data-testid="mobile-bottom-nav"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      h="calc(var(--penglish-mobile-nav-height) + env(safe-area-inset-bottom))"
      bg="rgba(255, 255, 255, 0.96)"
      borderTop="1px solid"
      borderColor={NAV_OCEAN.border}
      display={{ base: 'flex', lg: 'none' }}
      zIndex="1000"
      pb="env(safe-area-inset-bottom)"
      boxShadow="0 -12px 30px rgba(31, 111, 214, 0.08)"
      backdropFilter="blur(14px)"
    >
      <Flex w="100%" h="var(--penglish-mobile-nav-height)" align="stretch" justify="space-around">
        {NAV.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{ flex: 1, display: 'flex' }}
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                flex="1"
                gap="0.5"
                color={active ? NAV_OCEAN.deepBlue : NAV_OCEAN.muted}
                bg={active ? NAV_OCEAN.softBlue : 'transparent'}
                borderTop="3px solid"
                borderTopColor={active ? NAV_OCEAN.oceanBlue : 'transparent'}
                transition="all .15s"
              >
                <Icon as={item.icon} boxSize="5" color={active ? NAV_OCEAN.deepBlue : NAV_OCEAN.muted} />
                <Text
                  fontSize="xs"
                  fontWeight={active ? '700' : '500'}
                >
                  {item.label}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
}
