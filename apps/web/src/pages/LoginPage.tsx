import { Box, Center, VStack, HStack, Text, Button, Icon, Alert, AlertIcon } from '@chakra-ui/react';
import { ArrowRight, Globe } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../features/auth/AuthProvider';
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
    name: 'Khách',
    email: 'guest@p-english.local',
    avatar: '',
    coin: 0,
    streak: 0,
    vip: false,
    bio: 'Tiến độ lưu trên thiết bị này',
  };

  try {
    const raw = window.localStorage.getItem('currentUser');
    if (raw) {
      const existing = JSON.parse(raw) as Partial<LocalGuestUser>;
      const merged = { ...fallbackGuest, ...existing, name: existing.name || fallbackGuest.name };
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
  const auth = useAuth();

  const continueAsGuest = () => {
    ensureLocalGuestProfile();
    navigate('/home', { replace: true });
  };

  const connectGoogle = async () => {
    setGoogleLoading(true);
    setAuthMessage(null);
    const result = await auth.signInWithGoogle();
    if (!result.ok) setAuthMessage(result.message ?? 'Chưa mở được đăng nhập Google.');
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
            Đăng nhập Google để đồng bộ tiến độ, hoặc học thử trên thiết bị này.
          </Text>
        </VStack>

        <Button
          data-testid="login-google-supabase"
          isLoading={googleLoading || auth.loading}
          onClick={connectGoogle}
          w="100%"
          h="52px"
          bg="#1F6FD6"
          color="white"
          border="2px solid"
          borderColor="#1F6FD6"
          leftIcon={<Icon as={Globe} />}
          fontWeight="800"
          boxShadow="0 16px 34px rgba(31, 111, 214, 0.20)"
          borderRadius="xl"
          _hover={{ bg: '#185BB2', borderColor: '#185BB2' }}
        >
          Đăng nhập bằng Google
        </Button>

        <Button
          data-testid="login-continue-local"
          onClick={continueAsGuest}
          w="100%"
          h="46px"
          bg="rgba(255,255,255,0.92)"
          border="1px solid"
          borderColor="#BAE6FD"
          leftIcon={<Icon as={ArrowRight} color="#1F6FD6" />}
          fontWeight="800"
          borderRadius="xl"
        >
          Học thử trên thiết bị này
        </Button>

        {auth.authUnavailable ? (
          <Alert status="info" borderRadius="2xl" bg="#E8F4FF" color="#1F6FD6" fontSize="sm" fontWeight="700">
            <AlertIcon />
            Đăng nhập Google chưa bật. Chế độ học thử vẫn lưu tiến độ trên thiết bị này.
          </Alert>
        ) : null}

        {authMessage ? (
          <Alert status="info" borderRadius="2xl" bg="#E8F4FF" color="#1F6FD6" fontSize="sm" fontWeight="700">
            <AlertIcon />
            {authMessage}
          </Alert>
        ) : null}

        <HStack gap="2" flexWrap="wrap" justify="center">
          <Text fontSize="xs" px="3" py="1.5" bg="#E8F4FF" color="#1F6FD6" borderRadius="full" fontWeight="700">Chuỗi học đại dương</Text>
          <Text fontSize="xs" px="3" py="1.5" bg="#F8FCFF" color="#102A43" border="1px solid" borderColor="#BAE6FD" borderRadius="full" fontWeight="700">Lộ trình IELTS/TOEIC</Text>
          <Text fontSize="xs" px="3" py="1.5" bg="#F0FDF4" color="#166534" border="1px solid" borderColor="#BBF7D0" borderRadius="full" fontWeight="700">6 game tương tác</Text>
        </HStack>

        <Text fontSize="xs" color="gray.500" textAlign="center">
          Frontend chỉ dùng VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY. Không dùng service role key.
        </Text>
      </VStack>
      </Center>
    </OceanPageShell>
  );
}

export function LoginCallbackPage() {
  const [params] = useSearchParams();
  return <AuthCallbackContent params={params} />;
}

function AuthCallbackContent({ params }: { params: URLSearchParams }) {
  const navigate = useNavigate();
  const auth = useAuth();

  useState(() => {
    const run = async () => {
      const session = await auth.refreshSession();
      const fallback = params.get('next') || '/luyen-tieng-anh/48-ngay-lay-goc';
      let intended = fallback;
      try {
        intended = window.sessionStorage.getItem('penglish-auth-redirect') || fallback;
        window.sessionStorage.removeItem('penglish-auth-redirect');
      } catch {
        intended = fallback;
      }
      window.setTimeout(() => navigate(session?.user ? intended : '/home', { replace: true }), 450);
    };
    void run();
    return null;
  });

  return (
    <OceanPageShell variant="login" overlayStrength="medium" minH="100vh">
      <Center minH="100vh" px="4">
        <VStack bg="rgba(255,255,255,0.90)" border="1px solid #BAE6FD" borderRadius="3xl" boxShadow="0 24px 64px rgba(31,111,214,0.16)" p="8" maxW="520px" textAlign="center" gap="4">
          <OceanMascot mascot="poo" pose="happy" size="lg" decorative motion="float" />
          <Text fontSize="sm" fontWeight="950" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.12em">P-English Google Auth</Text>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color="#102A43">Poo đang xác nhận phiên đăng nhập...</Text>
          <Text color="#52667A" fontWeight="700" lineHeight="1.7">Nếu kết nối Google thành công, bạn sẽ được đưa về vùng học và tiến độ Foundation48 sẽ được tách theo tài khoản.</Text>
        </VStack>
      </Center>
    </OceanPageShell>
  );
}
