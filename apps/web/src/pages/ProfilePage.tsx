import { useEffect, useState } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Avatar, Badge, Textarea } from '@chakra-ui/react';
import { Pencil, Trophy, BookOpen, Save, Target, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import { get, put } from '../api';
import { BlueWhaleMascot } from '../components/landing/BlueWhaleMascot';
import { AdaptiveWhaleScene } from '../components/streak/AdaptiveWhaleStreak';
import { signOutSupabase, usePEnglishSession, upsertSignedInProfile } from '../lib/p-english/userSession';

type Profile = {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  coin?: number;
  streak?: number;
  isVip?: boolean;
  vipExpiresAt?: string | null;
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
  warmOrange: '#F59E0B',
};

const LEARNING_SUMMARY = [
  { title: 'Mục tiêu hôm nay', text: 'Ôn 5 từ mới', icon: Target },
  { title: 'Phong cách học', text: 'Nhẹ nhàng mỗi ngày', icon: Sparkles },
  { title: 'Gợi ý tiếp theo', text: 'Hoàn thành bài học Unit 1', icon: ArrowRight },
];

export function ProfilePage() {
  const session = usePEnglishSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session.isSignedIn) {
      upsertSignedInProfile().catch(() => {});
      const p: Profile = {
        id: session.userId ?? undefined,
        name: session.displayName,
        email: session.email ?? undefined,
        avatar: session.avatarUrl,
        bio: 'Đã đăng nhập Supabase, tiến độ tách theo tài khoản.',
      };
      setProfile(p);
      setBio(p.bio ?? '');
      return;
    }

    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('currentUser') : null;
    if (raw) {
      try {
        const localProfile = JSON.parse(raw) as Profile;
        setProfile(localProfile);
        setBio(localProfile.bio ?? '');
        return;
      } catch {}
    }

    get<{ data: Profile }>('/auth/profile').then((r: any) => {
      const p = r?.data ?? r;
      setProfile(p);
      setBio(p?.bio ?? '');
    }).catch(() => {});
  }, [session.avatarUrl, session.displayName, session.email, session.isSignedIn, session.userId]);

  const save = async () => {
    setSaving(true);
    try {
      if (session.isSignedIn) {
        setProfile((current) => ({ ...(current ?? {}), bio }));
        setEditing(false);
        return;
      }
      const r: any = await put('/auth/profile', { bio });
      const p = r?.data ?? r;
      setProfile(p);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const profileStreak = profile?.streak ?? 0;
  const stats: Stat[] = [
    { label: profileStreak <= 0 ? 'Chưa có chuỗi' : 'Chuỗi ngày học', value: profileStreak, tint: profileStreak <= 0 ? '#64758A' : PROFILE_COLORS.deepBlue, bg: profileStreak <= 0 ? '#F1F5F9' : PROFILE_COLORS.softBlue, icon: Sparkles, whale: true },
    { label: 'Xu', value: profile?.coin ?? 0, tint: '#B7791F', bg: PROFILE_COLORS.rewardYellow, icon: Trophy },
    { label: 'Từ đã thuộc', value: 0, tint: PROFILE_COLORS.successGreen, bg: '#EAFBF0', icon: BookOpen },
    { label: 'Bộ học', value: 0, tint: PROFILE_COLORS.deepBlue, bg: PROFILE_COLORS.softBlue, icon: BookOpen },
  ];

  const displayName = profile?.name ?? 'Bạn học P-English';
  const displayBio = profile?.bio || 'Chưa có giới thiệu.';

  return (
    <Box px={{ base: '4', md: '6' }} pb="10" maxW="1100px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">Hồ sơ</Box>

      <Box
        position="relative"
        h={{ base: '142px', md: '168px' }}
        borderRadius="3xl"
        bgGradient="linear(135deg, #DDF5FF 0%, #5BBCEB 52%, #1F6FD6 100%)"
        border="1px solid"
        borderColor={PROFILE_COLORS.border}
        boxShadow="0 18px 42px rgba(31, 111, 214, 0.14)"
        mb={{ base: '-54px', md: '-64px' }}
        overflow="hidden"
      >
        <Box position="absolute" inset="0" bg="radial-gradient(circle at 18% 28%, rgba(255,255,255,0.46), transparent 24%), radial-gradient(circle at 82% 24%, rgba(221,245,255,0.42), transparent 28%)" />
        <Box position="absolute" left="-8%" right="-8%" bottom="-46px" h="112px" bg="rgba(255,255,255,0.22)" borderRadius="50% 50% 0 0" />
        <Box
          position="absolute"
          right={{ base: '8px', md: '24px' }}
          top={{ base: '8px', md: '12px' }}
          w={{ base: '104px', md: '164px' }}
          h={{ base: '94px', md: '132px' }}
          opacity="1"
          transform={{ base: 'scale(0.86)', md: 'scale(1)' }}
          transformOrigin="top right"
          pointerEvents="none"
        >
          <Box position="absolute" inset={{ base: '8px 2px 2px 14px', md: '8px 4px 6px 12px' }} bg="radial-gradient(circle, rgba(255,255,255,0.66) 0%, rgba(221,245,255,0.38) 48%, rgba(91,188,235,0.06) 72%)" borderRadius="full" filter="blur(1px)" />
          <Box position="absolute" right={{ base: '84px', md: '132px' }} top={{ base: '4px', md: '12px' }} display={{ base: 'none', md: 'block' }} bg="rgba(255,255,255,0.86)" border="1px solid rgba(221,245,255,0.78)" borderRadius="2xl" px="3" py="2" boxShadow="0 12px 28px rgba(31, 111, 214, 0.14)" color={PROFILE_COLORS.deepBlue} fontSize="xs" fontWeight="800" whiteSpace="nowrap">
            Cùng ôn 5 từ hôm nay nhé!
          </Box>
          <BlueWhaleMascot size="sm" showMessage={false} showBubbles decorative />
        </Box>
      </Box>

      <Box
        bg={PROFILE_COLORS.card}
        borderRadius="3xl"
        boxShadow="0 18px 44px rgba(16, 42, 67, 0.08)"
        border="1px solid"
        borderColor={PROFILE_COLORS.border}
        p={{ base: 5, md: 8 }}
        mb="6"
        position="relative"
      >
        <Flex direction={{ base: 'column', md: 'row' }} gap="6" align={{ base: 'center', md: 'start' }}>
          <Box position="relative">
            <Avatar
              size="2xl"
              name={profile?.name}
              src={profile?.avatar}
              borderWidth="4px"
              borderColor="white"
              boxShadow="0 12px 28px rgba(47, 158, 235, 0.22)"
              bg={PROFILE_COLORS.softBlue}
              color={PROFILE_COLORS.deepBlue}
            />
            <Flex position="absolute" right="-1" bottom="1" w="34px" h="34px" borderRadius="full" bg={PROFILE_COLORS.softAqua} border="3px solid white" align="center" justify="center" color={PROFILE_COLORS.deepBlue}>
              <Icon as={BookOpen} boxSize="4" />
            </Flex>
          </Box>
          <Box flex="1" textAlign={{ base: 'center', md: 'left' }} minW="0">
            <HStack gap="2" mb="1" justify={{ base: 'center', md: 'start' }} wrap="wrap">
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="900" color={PROFILE_COLORS.text}>{displayName}</Text>
              {profile?.isVip && (
                <Badge
                  bg={PROFILE_COLORS.rewardYellow}
                  color="#8A5A12"
                  borderRadius="full"
                  px="2.5"
                  py="0.5"
                  border="1px solid"
                  borderColor="#F8D78A"
                >Tài khoản</Badge>
              )}
            </HStack>
            <Text color={PROFILE_COLORS.secondaryText} fontWeight="600" mb="3">
              Poo đang đồng hành cùng bạn học tiếng Anh mỗi ngày.
            </Text>
            <HStack data-testid="profile-data-mode" justify={{ base: 'center', md: 'start' }} gap="2" wrap="wrap" mb="4">
              <Badge borderRadius="full" px="3" py="1" bg={session.isSignedIn ? '#EAFBF0' : '#E8F4FF'} color={session.isSignedIn ? '#16803A' : PROFILE_COLORS.deepBlue}>
                {session.dataModeLabel}
              </Badge>
              <Text fontSize="sm" color={PROFILE_COLORS.secondaryText} fontWeight="700">
                {session.isSignedIn ? `Tài khoản: ${session.email ?? 'Supabase user'}` : 'Guest/local: dữ liệu lưu trên trình duyệt này.'}
              </Text>
              {session.isSignedIn ? (
                <Button size="xs" variant="outline" borderRadius="full" leftIcon={<Icon as={LogOut} />} onClick={() => signOutSupabase()}>
                  Đăng xuất
                </Button>
              ) : null}
            </HStack>
            {!editing ? (
              <>
                <Text mb="4" minH="40px" color={PROFILE_COLORS.text} lineHeight="1.7">{displayBio}</Text>
                <Button
                  size="sm"
                  bg={PROFILE_COLORS.oceanBlue}
                  color="white"
                  borderRadius="full"
                  leftIcon={<Icon as={Pencil} />}
                  onClick={() => setEditing(true)}
                  _hover={{ bg: PROFILE_COLORS.deepBlue }}
                >
                  Sửa hồ sơ
                </Button>
              </>
            ) : (
              <VStack align="stretch" gap="3">
                <Textarea
                  placeholder="Giới thiệu bản thân..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  borderColor={PROFILE_COLORS.border}
                  borderRadius="2xl"
                  focusBorderColor={PROFILE_COLORS.oceanBlue}
                  bg="#F8FCFF"
                />
                <HStack gap="2" justify={{ base: 'center', md: 'start' }}>
                  <Button size="sm" bg={PROFILE_COLORS.oceanBlue} color="white" borderRadius="full" leftIcon={<Icon as={Save} />} onClick={save} isLoading={saving} _hover={{ bg: PROFILE_COLORS.deepBlue }}>
                    Lưu
                  </Button>
                  <Button size="sm" variant="ghost" borderRadius="full" color={PROFILE_COLORS.secondaryText} onClick={() => { setEditing(false); setBio(profile?.bio ?? ''); }}>
                    Huỷ
                  </Button>
                </HStack>
              </VStack>
            )}
          </Box>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" mb="6">
        {stats.map((s) => (
          <Box key={s.label} bg={PROFILE_COLORS.card} border="1px solid" borderColor={PROFILE_COLORS.border} borderRadius="2xl" boxShadow="0 12px 30px rgba(16, 42, 67, 0.055)" p={{ base: '4', md: '5' }}>
            <HStack mb="3" gap="2" align="center">
              <Flex w="36px" h="36px" borderRadius="xl" bg={s.bg} color={s.tint} align="center" justify="center" flexShrink={0} overflow="hidden">
                {s.whale ? (
                  <Box w="42px" h="30px" overflow="hidden">
                    <AdaptiveWhaleScene streak={Number(s.value) || 0} variant="badge" inactive={s.whale && Number(s.value) <= 0} />
                  </Box>
                ) : (
                  <Icon as={s.icon} boxSize="5" />
                )}
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
          <Flex w="44px" h="44px" borderRadius="2xl" bg={PROFILE_COLORS.softAqua} color={PROFILE_COLORS.deepBlue} align="center" justify="center" flexShrink={0}>
            <Icon as={Sparkles} boxSize="5" />
          </Flex>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
          {LEARNING_SUMMARY.map((item) => (
            <HStack key={item.title} align="start" gap="3" border="1px solid" borderColor={PROFILE_COLORS.border} bg={`linear-gradient(135deg, ${PROFILE_COLORS.softBlue}, #FFFFFF)`} borderRadius="2xl" p="4">
              <Flex w="36px" h="36px" borderRadius="xl" bg="white" color={PROFILE_COLORS.oceanBlue} align="center" justify="center" flexShrink={0} boxShadow="0 8px 18px rgba(47, 158, 235, 0.10)">
                <Icon as={item.icon} boxSize="4" />
              </Flex>
              <Box>
                <Text fontWeight="800" color={PROFILE_COLORS.text}>{item.title}</Text>
                <Text fontSize="sm" color={PROFILE_COLORS.secondaryText}>{item.text}</Text>
              </Box>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
