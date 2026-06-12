import { useEffect, useState } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Avatar, Badge } from '@chakra-ui/react';
import { Trophy, BookOpen, Target, Sparkles, ArrowRight, LogOut, RefreshCw, Waves } from 'lucide-react';
import { BlueWhaleMascot } from '../components/landing/BlueWhaleMascot';
import { AdaptiveWhaleScene } from '../components/streak/AdaptiveWhaleStreak';
import { useAuth } from '../features/auth/AuthProvider';
import { syncLocalFoundation48ProgressToCloud } from '../features/foundation48/foundation48CloudProgress';
import { getDailyRewardState, getWaterStreak } from '../lib/p-english/daily-rewards';
import { usePEnglishSession } from '../lib/p-english/userSession';

type Profile = {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  coin?: number;
  streak?: number;
};

type Stat = { label: string; value: string | number; tint: string; bg: string; icon: any; whale?: boolean };

const PROFILE_COLORS = {
  card: '#FFFFFF',
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  whaleBlue: '#5BBCEB',
  text: '#102A43',
  secondaryText: '#52667A',
  border: '#D7E8F5',
  rewardYellow: '#FFF3C4',
  successGreen: '#4CCB6B',
};

const LEARNING_SUMMARY = [
  { title: 'Mục tiêu hôm nay', text: 'Ôn 5 từ mới', icon: Target },
  { title: 'Phong cách học', text: 'Nhẹ nhàng mỗi ngày', icon: Sparkles },
  { title: 'Gợi ý tiếp theo', text: 'Hoàn thành Foundation48', icon: ArrowRight },
];

export function ProfilePage() {
  const session = usePEnglishSession();
  const auth = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (session.isSignedIn) {
      setProfile({
        id: session.userId ?? undefined,
        name: session.displayName,
        email: session.email ?? undefined,
        avatar: session.avatarUrl,
        bio: 'Poo sẽ giữ tiến độ học của bạn thật an toàn.',
      });
      return;
    }

    setProfile({
      id: 'local-guest-learner',
      name: 'Khách',
      email: undefined,
      avatar: '',
      bio: 'Poo đang giữ tiến độ cho bạn',
      coin: 0,
      streak: 0,
    });
  }, [session.avatarUrl, session.displayName, session.email, session.isSignedIn, session.userId]);

  const waterStreak = getWaterStreak(getDailyRewardState());
  const stats: Stat[] = [
    { label: 'Chuỗi nước', value: waterStreak.label, tint: waterStreak.current <= 0 ? '#64758A' : PROFILE_COLORS.deepBlue, bg: waterStreak.current <= 0 ? '#F1F5F9' : PROFILE_COLORS.softBlue, icon: Waves, whale: true },
    { label: 'Xu', value: profile?.coin ?? 0, tint: '#B7791F', bg: PROFILE_COLORS.rewardYellow, icon: Trophy },
    { label: 'Từ đã thuộc', value: 0, tint: PROFILE_COLORS.successGreen, bg: '#EAFBF0', icon: BookOpen },
    { label: 'Bộ học', value: 0, tint: PROFILE_COLORS.deepBlue, bg: PROFILE_COLORS.softBlue, icon: BookOpen },
  ];

  const displayName = session.isSignedIn ? session.displayName : 'Khách';
  const displayBio = session.isSignedIn ? 'Poo sẽ giữ tiến độ học của bạn thật an toàn.' : 'Poo đang giữ tiến độ cho bạn';

  const syncProgress = async () => {
    if (!session.userId) return;
    setSyncing(true);
    await syncLocalFoundation48ProgressToCloud(session.userId).catch(() => undefined);
    setSyncing(false);
  };

  return (
    <Box px={{ base: '4', md: '6' }} pb="10" maxW="1100px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">Hồ sơ</Box>

      <Box position="relative" h={{ base: '142px', md: '168px' }} borderRadius="3xl" bgGradient="linear(135deg, #DDF5FF 0%, #5BBCEB 52%, #1F6FD6 100%)" border="1px solid" borderColor={PROFILE_COLORS.border} boxShadow="0 18px 42px rgba(31, 111, 214, 0.14)" mb={{ base: '-54px', md: '-64px' }} overflow="hidden">
        <Box position="absolute" inset="0" bg="radial-gradient(circle at 18% 28%, rgba(255,255,255,0.46), transparent 24%), radial-gradient(circle at 82% 24%, rgba(221,245,255,0.42), transparent 28%)" />
        <Box position="absolute" left="-8%" right="-8%" bottom="-46px" h="112px" bg="rgba(255,255,255,0.22)" borderRadius="50% 50% 0 0" />
        <Box position="absolute" right={{ base: '8px', md: '24px' }} top={{ base: '8px', md: '12px' }} w={{ base: '104px', md: '164px' }} h={{ base: '94px', md: '132px' }} opacity="1" transform={{ base: 'scale(0.86)', md: 'scale(1)' }} transformOrigin="top right" pointerEvents="none">
          <BlueWhaleMascot size="sm" showMessage={false} showBubbles decorative />
        </Box>
      </Box>

      <Box bg={PROFILE_COLORS.card} borderRadius="3xl" boxShadow="0 18px 44px rgba(16, 42, 67, 0.08)" border="1px solid" borderColor={PROFILE_COLORS.border} p={{ base: 5, md: 8 }} mb="6" position="relative">
        <Flex direction={{ base: 'column', md: 'row' }} gap="6" align={{ base: 'center', md: 'start' }}>
          <Box position="relative">
            <Avatar size="2xl" name={displayName} src={session.avatarUrl} borderWidth="4px" borderColor="white" boxShadow="0 12px 28px rgba(47, 158, 235, 0.22)" bg={PROFILE_COLORS.softBlue} color={PROFILE_COLORS.deepBlue} />
            <Flex position="absolute" right="-1" bottom="1" w="34px" h="34px" borderRadius="full" bg={PROFILE_COLORS.softAqua} border="3px solid white" align="center" justify="center" color={PROFILE_COLORS.deepBlue}>
              <Icon as={BookOpen} boxSize="4" />
            </Flex>
          </Box>
          <Box flex="1" textAlign={{ base: 'center', md: 'left' }} minW="0">
            <HStack gap="2" mb="1" justify={{ base: 'center', md: 'start' }} wrap="wrap">
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="900" color={PROFILE_COLORS.text}>{displayName}</Text>
              <Badge bg={session.isSignedIn ? '#EAFBF0' : PROFILE_COLORS.softBlue} color={session.isSignedIn ? '#16803A' : PROFILE_COLORS.deepBlue} borderRadius="full" px="2.5" py="0.5" textTransform="none">
                {session.isSignedIn ? 'Google' : 'Bạn học cùng Poo'}
              </Badge>
            </HStack>
            <Text color={PROFILE_COLORS.secondaryText} fontWeight="600" mb="3">Poo đang đồng hànhọc tiếng Anh mỗi ngày.</Text>
            <HStack data-testid="profile-data-mode" justify={{ base: 'center', md: 'start' }} gap="2" wrap="wrap" mb="4">
              <Badge borderRadius="full" px="3" py="1" bg={session.isSignedIn ? '#EAFBF0' : '#E8F4FF'} color={session.isSignedIn ? '#16803A' : PROFILE_COLORS.deepBlue}>{session.dataModeLabel}</Badge>
              <Text fontSize="sm" color={PROFILE_COLORS.secondaryText} fontWeight="700">
                {session.isSignedIn ? session.email ?? 'Tài khoản Google' : 'Poo đang giữ tiến độ cho bạn.'}
              </Text>
            </HStack>
            <Text mb="4" minH="40px" color={PROFILE_COLORS.text} lineHeight="1.7">{displayBio}</Text>
            <HStack gap="2" justify={{ base: 'center', md: 'start' }} wrap="wrap">
              {session.isSignedIn ? (
                <>
                  <Button size="sm" bg={PROFILE_COLORS.oceanBlue} color="white" borderRadius="full" leftIcon={<Icon as={RefreshCw} />} isLoading={syncing} onClick={syncProgress} _hover={{ bg: PROFILE_COLORS.deepBlue }}>
                    Lưu tiến độ lên tài khoản
                  </Button>
                  <Button size="sm" variant="outline" borderRadius="full" leftIcon={<Icon as={LogOut} />} onClick={() => void auth.signOut()}>
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <Button size="sm" bg={PROFILE_COLORS.oceanBlue} color="white" borderRadius="full" onClick={() => void auth.signInWithGoogle()} _hover={{ bg: PROFILE_COLORS.deepBlue }}>
                  Vào học bằng Google để lưu tiến độ
                </Button>
              )}
            </HStack>
          </Box>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" mb="6">
        {stats.map((s) => (
          <Box key={s.label} bg={PROFILE_COLORS.card} border="1px solid" borderColor={PROFILE_COLORS.border} borderRadius="2xl" boxShadow="0 12px 30px rgba(16, 42, 67, 0.055)" p={{ base: '4', md: '5' }}>
            <HStack mb="3" gap="2" align="center">
              <Flex w="36px" h="36px" borderRadius="xl" bg={s.bg} color={s.tint} align="center" justify="center" flexShrink={0} overflow="hidden">
                {s.whale ? <Box w="42px" h="30px" overflow="hidden"><AdaptiveWhaleScene streak={waterStreak.current} variant="badge" inactive={waterStreak.current <= 0} /></Box> : <Icon as={s.icon} boxSize="5" />}
              </Flex>
              <Text color={PROFILE_COLORS.secondaryText} fontSize="sm" fontWeight="700">{s.label}</Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={s.tint}>{s.value}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box bg={PROFILE_COLORS.card} border="1px solid" borderColor={PROFILE_COLORS.border} borderRadius="3xl" p={{ base: '5', md: '6' }} boxShadow="0 16px 38px rgba(16, 42, 67, 0.06)">
        <HStack justify="space-between" align="start" mb="4" gap="3">
          <Box>
            <Text fontSize="xl" fontWeight="900" color={PROFILE_COLORS.text}>Hồ sơ học tập</Text>
            <Text color={PROFILE_COLORS.secondaryText} fontSize="sm">Gợi ý nhẹ nhàng để duy trì nhịp học mỗi ngày.</Text>
          </Box>
          <Flex w="44px" h="44px" borderRadius="2xl" bg={PROFILE_COLORS.softAqua} color={PROFILE_COLORS.deepBlue} align="center" justify="center" flexShrink={0}><Icon as={Sparkles} boxSize="5" /></Flex>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
          {LEARNING_SUMMARY.map((item) => (
            <HStack key={item.title} align="start" gap="3" border="1px solid" borderColor={PROFILE_COLORS.border} bg={`linear-gradient(135deg, ${PROFILE_COLORS.softBlue}, #FFFFFF)`} borderRadius="2xl" p="4">
              <Flex w="36px" h="36px" borderRadius="xl" bg="white" color={PROFILE_COLORS.oceanBlue} align="center" justify="center" flexShrink={0} boxShadow="0 8px 18px rgba(47, 158, 235, 0.10)"><Icon as={item.icon} boxSize="4" /></Flex>
              <Box><Text fontWeight="800" color={PROFILE_COLORS.text}>{item.title}</Text><Text fontSize="sm" color={PROFILE_COLORS.secondaryText}>{item.text}</Text></Box>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
