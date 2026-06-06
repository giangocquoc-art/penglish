import {
  Avatar,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Route,
  BookOpen,
  Joystick,
  Timer,
  Menu,
  Moon,
  Sun,
  UserCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import type { SidebarUser } from './Sidebar';

type NavItem = { label: string; to: string; icon: any; tint: string };

const NAV_OCEAN = {
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  whaleBlue: '#5BBCEB',
  text: '#102A43',
  muted: '#52667A',
  border: '#D7E8F5',
  warmYellow: '#FFF3C4',
  flame: '#F59E0B',
};

const NAV: NavItem[] = [
  { label: 'Trang chủ', to: '/home', icon: Home, tint: NAV_OCEAN.oceanBlue },
  { label: 'Lộ trình', to: '/learning-path', icon: Route, tint: NAV_OCEAN.deepBlue },
  { label: 'English Speed', to: '/english-speed', icon: Timer, tint: NAV_OCEAN.oceanBlue },
  { label: 'Luyện tập', to: '/practice', icon: Joystick, tint: NAV_OCEAN.deepBlue },
  { label: 'Từ vựng', to: '/words', icon: BookOpen, tint: NAV_OCEAN.whaleBlue },
  { label: 'Hồ sơ', to: '/profile', icon: UserCircle, tint: NAV_OCEAN.muted },
];

export function MobileDrawerToggle({ user }: { user: SidebarUser | null }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const isActive = (to: string) => {
    const [pathname, query = ''] = to.split('?');
    if (query) return location.pathname === pathname && location.search === `?${query}`;
    return location.pathname === pathname || location.pathname.startsWith(pathname + '/');
  };

  // close drawer on route change
  useEffect(() => {
    if (isOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <IconButton
        aria-label="Mở menu"
        icon={<Icon as={Menu} boxSize="6" />}
        variant="ghost"
        color={NAV_OCEAN.deepBlue}
        _hover={{ bg: NAV_OCEAN.softBlue }}
        _active={{ bg: NAV_OCEAN.softAqua }}
        onClick={onOpen}
        display={{ base: 'flex', lg: 'none' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        size="xs"
      >
        <DrawerOverlay backdropFilter="blur(6px)" bg="blackAlpha.500" />
        <DrawerContent maxW="280px" bg="linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 62%, #F2FAFF 100%)">
          <DrawerCloseButton />
          <DrawerBody px="4" py="6">
            <Flex direction="column" gap="4" h="100%">
              <Box px="2" pb="2">
                <BrandLogo variant="compact" size="md" />
              </Box>

              <VStack as="nav" align="stretch" gap="1" flex="1">
                {NAV.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link key={item.to} to={item.to} onClick={onClose}>
                      <HStack
                        px="3"
                        py="2.5"
                        borderRadius="xl"
                        bg={active ? NAV_OCEAN.softBlue : 'transparent'}
                        color={active ? NAV_OCEAN.deepBlue : NAV_OCEAN.text}
                        border="1px solid"
                        borderColor={active ? '#BAE6FD' : 'transparent'}
                        borderLeft="3px solid"
                        borderLeftColor={active ? NAV_OCEAN.oceanBlue : 'transparent'}
                        boxShadow={active ? '0 12px 28px rgba(31, 111, 214, 0.10)' : 'none'}
                        _hover={{ bg: active ? NAV_OCEAN.softBlue : 'rgba(232, 244, 255, 0.68)', borderColor: active ? '#BAE6FD' : NAV_OCEAN.border }}
                        transition="all .15s"
                        gap="3"
                      >
                        <Flex
                          w="36px"
                          h="36px"
                          borderRadius="lg"
                          bg={active ? NAV_OCEAN.softAqua : '#F8FCFF'}
                          border="1px solid"
                          borderColor={active ? '#BAE6FD' : NAV_OCEAN.border}
                          align="center"
                          justify="center"
                        >
                          <Icon as={item.icon} boxSize="5" color={active ? NAV_OCEAN.deepBlue : item.tint} />
                        </Flex>
                        <Text fontWeight={active ? '700' : '500'}>{item.label}</Text>
                      </HStack>
                    </Link>
                  );
                })}
              </VStack>

              <Box mt="auto" pt="3" borderTop="1px solid" borderColor={NAV_OCEAN.border}>
                <Link to="/profile" onClick={onClose}>
                  <HStack p="2" borderRadius="xl" border="1px solid" borderColor="transparent" _hover={{ bg: 'rgba(232, 244, 255, 0.68)', borderColor: NAV_OCEAN.border }} gap="3">
                    <Avatar
                      name={user?.name}
                      src={user?.avatar}
                      size="md"
                      borderWidth="2px"
                      borderColor={NAV_OCEAN.whaleBlue}
                    />
                    <Box flex="1" minW="0">
                      <Text fontWeight="700" fontSize="sm" noOfLines={1}>
                        {user?.name ?? 'Khách'}
                      </Text>
                      <Text fontSize="xs" color={NAV_OCEAN.muted} noOfLines={1}>
                        {user?.bio ?? 'Nhấn để xem hồ sơ'}
                      </Text>
                    </Box>
                  </HStack>
                </Link>

                <HStack mt="3" justify="space-between">
                  <HStack
                    px="3"
                    py="2"
                    borderRadius="full"
                    bg={NAV_OCEAN.warmYellow}
                    border="1px solid"
                    borderColor="rgba(245, 158, 11, 0.24)"
                    gap="1.5"
                  >
                    <Text>🪙</Text>
                    <Text fontWeight="700" fontSize="sm" color={NAV_OCEAN.text}>
                      {user?.coin ?? 0}
                    </Text>
                  </HStack>
                  <IconButton
                    aria-label="Toggle theme"
                    size="sm"
                    variant="ghost"
                    color={NAV_OCEAN.deepBlue}
                    _hover={{ bg: NAV_OCEAN.softBlue }}
                    onClick={toggleColorMode}
                  >
                    <Icon as={colorMode === 'dark' ? Sun : Moon} />
                  </IconButton>
                </HStack>
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
