import { Box, Center, VStack, HStack, Text, Button, Icon, Alert, AlertIcon } from '@chakra-ui/react';
import { ArrowRight, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { signInWithGoogle } from '../lib/p-english/userSession';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';

type LocalGuestUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coin: number;
  streak: number;
  vip: boolean;
  bio: string;
};

function ensureLocalGuestProfile(): LocalGuestUser {
  const fallbackGuest: LocalGuestUser = {
    id: 'local-guest-learner',
    name: 'Bạn học nhỏ',
    email: 'guest@p-english.local',
    avatar: '',
    coin: 0,
    streak: 0,
    vip: false,
    bio: 'Không cần đăng nhập, tiến độ lưu trên thiết bị này',
  };

  try {
    const raw = window.localStorage.getItem('currentUser');
    if (raw) {
      const existing = JSON.parse(raw) as Partial<LocalGuestUser>;
      const merged = { ...fallbackGuest, ...existing };
      window.localStorage.setItem('currentUser', JSON.stringify(merged));
      return merged;
    }
    window.localStorage.setItem('currentUser', JSON.stringify(fallbackGuest));
  } catch {
    // Local guest mode should still navigate even if storage is unavailable.
  }

  return fallbackGuest;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const continueAsGuest = () => {
    ensureLocalGuestProfile();
    navigate('/home', { replace: true });
  };

  const connectGoogle = async () => {
    setGoogleLoading(true);
    setAuthMessage(null);
    const result = await signInWithGoogle();
    if (!result.ok) setAuthMessage(result.message);
    setGoogleLoading(false);
  };

  return (
    <OceanPageShell variant="login" overlayStrength="medium" minH="100vh">
      <Center minH="100vh" px="4" position="relative" overflow="hidden">
      <VStack
        bg="rgba(255,255,255,0.84)"
        border="1px solid rgba(186,230,253,0.86)"
        backdropFilter="blur(22px)"
        borderRadius="3xl"
        boxShadow="0 26px 70px rgba(31, 111, 214, 0.16)"
        p={{ base: 6, md: 10 }}
        maxW="460px"
        w="100%"
        gap="6"
        position="relative"
        zIndex={1}
      >
        <OceanMascot mascot="poo" pose="idle" size="lg" decorative motion="float" />
        <BrandLogo variant="compact" size="lg" />
        <VStack gap="2">
          <Text fontSize="2xl" fontWeight="800" color="ink.900">Bắt đầu học P-English</Text>
          <Text color="gray.600" fontSize="sm" textAlign="center">
            Không cần đăng nhập, tiến độ sẽ lưu trên thiết bị này.
          </Text>
        </VStack>

        <Button
          data-testid="login-continue-local"
          onClick={continueAsGuest}
          w="100%"
          h="52px"
          bg="#1F6FD6"
          color="white"
          border="2px solid"
          borderColor="#1F6FD6"
          leftIcon={<Icon as={ArrowRight} />}
          _hover={{ bg: '#185BB2', borderColor: '#185BB2' }}
          fontWeight="800"
          boxShadow="0 16px 34px rgba(31, 111, 214, 0.20)"
          borderRadius="xl"
        >
          Bắt đầu học ngay
        </Button>

        <Button
          data-testid="login-google-supabase"
          isLoading={googleLoading}
          onClick={connectGoogle}
          w="100%"
          h="46px"
          bg="rgba(255,255,255,0.92)"
          border="1px solid"
          borderColor="#BAE6FD"
          leftIcon={<Icon as={Globe} color="#1F6FD6" />}
          fontWeight="700"
          borderRadius="xl"
          opacity="0.92"
        >
          Đăng nhập bằng Google
        </Button>

        {authMessage ? (
          <Alert status="info" borderRadius="2xl" bg="#E8F4FF" color="#1F6FD6" fontSize="sm" fontWeight="700">
            <AlertIcon />
            {authMessage}
          </Alert>
        ) : null}

        <HStack gap="2" flexWrap="wrap" justify="center">
          <Text fontSize="xs" px="3" py="1.5" bg="#E8F4FF" color="#1F6FD6" borderRadius="full" fontWeight="700">🫧 Chuỗi học đại dương</Text>
          <Text fontSize="xs" px="3" py="1.5" bg="#F8FCFF" color="#102A43" border="1px solid" borderColor="#BAE6FD" borderRadius="full" fontWeight="700">📚 Lộ trình IELTS/TOEIC</Text>
          <Text fontSize="xs" px="3" py="1.5" bg="#F0FDF4" color="#166534" border="1px solid" borderColor="#BBF7D0" borderRadius="full" fontWeight="700">🎮 6 game tương tác</Text>
        </HStack>

        <VStack gap="1">
          <Text fontSize="xs" color="gray.500" textAlign="center">
            {isSupabaseConfigured ? 'Bạn có thể học local hoặc đăng nhập để tách dữ liệu theo tài khoản.' : 'Đăng nhập Google chưa bật. Bạn vẫn có thể học ngay ở chế độ local.'}
          </Text>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Khi có đăng nhập thật, P-English sẽ ghi rõ trước khi kết nối tài khoản.
          </Text>
        </VStack>
      </VStack>
      </Center>
    </OceanPageShell>
  );
}

export function LoginCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const access = params.get('accessToken');
    const refresh = params.get('refreshToken');
    if (access) localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
    const t = setTimeout(() => navigate('/home', { replace: true }), 200);
    return () => clearTimeout(t);
  }, [params, navigate]);

  return (
    <Center minH="100vh">
      <Box>Đang đăng nhập...</Box>
    </Center>
  );
}
