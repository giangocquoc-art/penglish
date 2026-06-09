import { Box, Center, VStack, HStack, Text, Button, Icon, SimpleGrid } from '@chakra-ui/react';
import { ArrowRight, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import Wave from 'react-wavify';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../features/auth/AuthProvider';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { useReducedMotion } from '../hooks/useReducedMotion';

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

const cardHeadingWeight = '700';
const softEmphasisWeight = '600';

export function LoginPage() {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const auth = useAuth();
  const visibleInfoMessage = authMessage || 'Bạn có thể học thử ngay. Đăng nhập Google chỉ dùng để đồng bộ tiến độ.';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const continueAsGuest = () => {
    ensureLocalGuestProfile();
    navigate('/luyen-tieng-anh/48-ngay-lay-goc', { replace: true });
  };

  const connectGoogle = async () => {
    setGoogleLoading(true);
    setAuthMessage(null);
    const result = await auth.signInWithGoogle();
    if (!result.ok) setAuthMessage(result.message ?? 'Google chưa sẵn sàng. Bạn vẫn có thể học thử ngay.');
    setGoogleLoading(false);
  };

  return (
    <LoginOceanBackground>
      <Center minH="100vh" px={{ base: '4', md: '8' }} py={{ base: '7', md: '10' }} position="relative" zIndex={1} overflow="hidden">
        <SimpleGrid
          data-testid="login-ocean-layout"
          columns={{ base: 1, lg: 2 }}
          gap={{ base: '5', lg: '10' }}
          alignItems="center"
          w="100%"
          maxW="1080px"
          minH={{ base: 'auto', lg: 'min(760px, calc(100vh - 80px))' }}
        >
          <VStack align={{ base: 'center', lg: 'start' }} textAlign={{ base: 'center', lg: 'left' }} gap={{ base: '4', md: '5' }} color="white" order={{ base: 2, lg: 1 }}>
            <Box display={{ base: 'none', lg: 'block' }}>
              <BrandLogo variant="compact" size="lg" />
            </Box>
            <Box position="relative" w={{ base: '158px', md: '198px', lg: '222px' }} h={{ base: '128px', md: '158px', lg: '178px' }} pointerEvents="none">
              <Box position="absolute" inset="auto 5% 0" h="42%" borderRadius="50%" bg="rgba(7, 89, 133, 0.20)" filter="blur(22px)" />
              <Box position="absolute" inset={{ base: '10px 13px 18px', md: '8px 16px 20px', lg: '6px 18px 22px' }} borderRadius="999px" bg="radial-gradient(circle at 42% 32%, rgba(255,255,255,0.62), rgba(186,230,253,0.28) 52%, rgba(14,165,233,0.12) 100%)" border="1px solid rgba(224, 242, 254, 0.42)" boxShadow="inset 0 1px 0 rgba(255,255,255,0.56), 0 18px 42px rgba(8,47,73,0.12)" />
              <Box data-testid="login-poo-mascot" position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" sx={{ img: { imageRendering: 'auto', transform: 'translateZ(0)', backfaceVisibility: 'hidden' } }}>
                <OceanMascot mascot="poo" pose="idle" size="hero" decorative motion="float" w={{ base: '132px', md: '166px', lg: '188px', xl: '198px' }} />
              </Box>
            </Box>
            <VStack align={{ base: 'center', lg: 'start' }} gap="2" maxW="520px">
              <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" letterSpacing="0.16em" textTransform="uppercase" color="rgba(224, 242, 254, 0.92)">
                P-English ocean start
              </Text>
              <Text as="h1" fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }} fontWeight="800" lineHeight="1.05" letterSpacing="-0.03em" textShadow="0 18px 46px rgba(8, 47, 73, 0.28)">
                Bắt đầu học cùng Poo
              </Text>
              <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="600" color="rgba(240, 249, 255, 0.88)" lineHeight="1.65">
                Mỗi ngày một bài nhỏ. Không cần đăng nhập để bắt đầu.
              </Text>
            </VStack>
          </VStack>

          <VStack
            data-testid="login-ocean-card"
            className="login-ocean-card"
            bg="linear-gradient(145deg, rgba(255,255,255,0.86), rgba(240,249,255,0.72))"
            border="1px solid rgba(255,255,255,0.76)"
            backdropFilter="blur(28px) saturate(1.25)"
            borderRadius={{ base: '30px', md: '36px' }}
            boxShadow="0 32px 90px rgba(8, 47, 73, 0.24), inset 0 1px 0 rgba(255,255,255,0.72)"
            p={{ base: '5', sm: '6', md: '8' }}
            maxW="470px"
            w="100%"
            gap={{ base: '4', md: '5' }}
            mx="auto"
            position="relative"
            overflow="hidden"
            order={{ base: 1, lg: 2 }}
          >
            <Box position="absolute" inset="0" bg="radial-gradient(circle at 18% 0%, rgba(125,211,252,0.32), transparent 30%), radial-gradient(circle at 100% 20%, rgba(186,230,253,0.42), transparent 34%)" pointerEvents="none" />
            <Box position="relative" zIndex={1} w="100%">
              <VStack gap="4" align="stretch">
                <VStack gap="3" textAlign="center">
                  <Box display={{ base: 'block', lg: 'none' }}>
                    <BrandLogo variant="compact" size="lg" />
                  </Box>
                  <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={cardHeadingWeight} color="#082F49" letterSpacing="-0.02em">
                    Vào vùng học yên tĩnh
                  </Text>
                  <Text color="#475569" fontSize="sm" fontWeight={softEmphasisWeight} lineHeight="1.7" maxW="340px">
                    Poo sẽ lưu tiến độ trên thiết bị này trước. Khi Google sẵn sàng, bạn có thể đồng bộ sau.
                  </Text>
                </VStack>

                <VStack gap="3" align="stretch">
                  <Button
                    data-testid="login-continue-local"
                    onClick={continueAsGuest}
                    w="100%"
                    h={{ base: '54px', md: '58px' }}
                    bg="linear-gradient(135deg, #0EA5E9, #1F6FD6)"
                    color="white"
                    border="1px solid rgba(255,255,255,0.46)"
                    rightIcon={<Icon as={ArrowRight} boxSize="5" />}
                    fontWeight="700"
                    fontSize={{ base: 'md', md: 'lg' }}
                    borderRadius="2xl"
                    boxShadow="0 18px 42px rgba(14, 165, 233, 0.30)"
                    _hover={{ transform: 'translateY(-1px)', boxShadow: '0 22px 50px rgba(14, 165, 233, 0.36)' }}
                    _active={{ transform: 'translateY(0)' }}
                  >
                    Học thử ngay
                  </Button>

                  <Button
                    data-testid="login-google-supabase"
                    isLoading={googleLoading || auth.loading}
                    onClick={connectGoogle}
                    w="100%"
                    h="50px"
                    bg="rgba(255,255,255,0.72)"
                    color="#0F172A"
                    border="1px solid rgba(14, 165, 233, 0.28)"
                    leftIcon={<Icon as={Globe} color="#1F6FD6" />}
                    fontWeight="700"
                    borderRadius="2xl"
                    boxShadow="0 12px 30px rgba(15, 23, 42, 0.06)"
                    _hover={{ bg: 'rgba(240,249,255,0.96)', borderColor: 'rgba(14,165,233,0.48)' }}
                  >
                    Đồng bộ bằng Google
                  </Button>
                </VStack>

                <HStack data-testid="login-single-info-message" gap="2.5" align="start" bg="rgba(232,244,255,0.72)" border="1px solid rgba(186,230,253,0.86)" borderRadius="2xl" p="3.5">
                  <Icon as={ShieldCheck} color="#1F6FD6" boxSize="5" flexShrink={0} mt="0.5" />
                  <Text fontSize="sm" color="#24506B" fontWeight="600" lineHeight="1.55">
                    {visibleInfoMessage}
                  </Text>
                </HStack>

                <HStack gap="2" flexWrap="wrap" justify="center" pt="1">
                  <HStack fontSize="xs" px="3" py="1.5" bg="rgba(255,255,255,0.64)" color="#075985" border="1px solid rgba(186,230,253,0.72)" borderRadius="full" fontWeight="700">
                    <Icon as={Sparkles} boxSize="3" />
                    <Text>Nhẹ nhàng</Text>
                  </HStack>
                  <Text fontSize="xs" px="3" py="1.5" bg="rgba(240,253,244,0.74)" color="#166534" border="1px solid #BBF7D0" borderRadius="full" fontWeight="700">Không cần tài khoản</Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </Center>
    </LoginOceanBackground>
  );
}

function LoginOceanBackground({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <Box
      data-testid="login-ocean-background"
      minH="100vh"
      position="relative"
      overflow="hidden"
      bg="linear-gradient(180deg, #E0F7FF 0%, #7DD3FC 18%, #0EA5E9 48%, #075985 100%)"
      sx={{
        '@keyframes loginBubbleRise': {
          '0%': { transform: 'translateY(32px) scale(0.86)', opacity: 0 },
          '18%': { opacity: 0.6 },
          '100%': { transform: 'translateY(-128px) scale(1.08)', opacity: 0 },
        },
        '@keyframes loginLightDrift': {
          '0%, 100%': { transform: 'translate3d(-2%, -1%, 0) rotate(-8deg)', opacity: 0.46 },
          '50%': { transform: 'translate3d(3%, 1%, 0) rotate(-6deg)', opacity: 0.72 },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.login-ocean-bubble, .login-ocean-ray': { animation: 'none !important' },
        },
      }}
    >
      <Box position="absolute" inset="0" bg="radial-gradient(circle at 50% -12%, rgba(255,255,255,0.88), transparent 34%), radial-gradient(circle at 14% 18%, rgba(186,230,253,0.50), transparent 28%), radial-gradient(circle at 88% 72%, rgba(12,74,110,0.28), transparent 34%)" />
      <LoginLightRays reducedMotion={reducedMotion} />
      <OceanBubbleLayer reducedMotion={reducedMotion} />
      <LoginWaveLayer reducedMotion={reducedMotion} />
      {children}
    </Box>
  );
}

function LoginLightRays({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Box aria-hidden="true" position="absolute" inset="0" pointerEvents="none" overflow="hidden">
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          className="login-ocean-ray"
          position="absolute"
          top="-16%"
          left={`${16 + index * 25}%`}
          w={{ base: '120px', md: '190px' }}
          h="84%"
          bg="linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.03), transparent)"
          transform={`rotate(${-14 + index * 7}deg)`}
          filter="blur(8px)"
          opacity={0.42 - index * 0.06}
          animation={reducedMotion ? 'none' : `loginLightDrift ${8 + index * 1.6}s ease-in-out infinite`}
        />
      ))}
    </Box>
  );
}

function OceanBubbleLayer({ reducedMotion }: { reducedMotion: boolean }) {
  const bubbles = [
    { left: '8%', top: '74%', size: '10px', delay: '0s', duration: '8s' },
    { left: '18%', top: '46%', size: '6px', delay: '1.8s', duration: '9s' },
    { left: '31%', top: '82%', size: '14px', delay: '0.8s', duration: '10s' },
    { left: '68%', top: '78%', size: '9px', delay: '1.2s', duration: '8.5s' },
    { left: '82%', top: '38%', size: '12px', delay: '2.4s', duration: '11s' },
    { left: '91%', top: '64%', size: '7px', delay: '0.4s', duration: '7.5s' },
    { left: '54%', top: '30%', size: '5px', delay: '3.2s', duration: '9.5s' },
  ];

  return (
    <Box aria-hidden="true" position="absolute" inset="0" pointerEvents="none">
      {bubbles.map((bubble, index) => (
        <Box
          key={`${bubble.left}-${index}`}
          className="login-ocean-bubble"
          position="absolute"
          left={bubble.left}
          top={bubble.top}
          w={bubble.size}
          h={bubble.size}
          borderRadius="full"
          border="1px solid rgba(255,255,255,0.72)"
          bg="rgba(255,255,255,0.18)"
          boxShadow="inset 2px 2px 6px rgba(255,255,255,0.40), 0 6px 18px rgba(7,89,133,0.14)"
          opacity="0.72"
          animation={reducedMotion ? 'none' : `loginBubbleRise ${bubble.duration} ease-in-out ${bubble.delay} infinite`}
        />
      ))}
    </Box>
  );
}

function LoginWaveLayer({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Box aria-hidden="true" position="absolute" left="0" right="0" bottom="0" h={{ base: '210px', md: '260px' }} pointerEvents="none" opacity="0.92">
      <Box position="absolute" left="0" right="0" bottom="56px" opacity="0.58">
        <Wave fill="rgba(186, 230, 253, 0.42)" paused={reducedMotion} options={{ height: 42, amplitude: reducedMotion ? 0 : 18, speed: 0.12, points: 4 }} />
      </Box>
      <Box position="absolute" left="0" right="0" bottom="18px" opacity="0.70">
        <Wave fill="rgba(14, 165, 233, 0.42)" paused={reducedMotion} options={{ height: 54, amplitude: reducedMotion ? 0 : 14, speed: 0.10, points: 5 }} />
      </Box>
      <Box position="absolute" left="0" right="0" bottom="-32px" opacity="0.94">
        <Wave fill="rgba(7, 89, 133, 0.72)" paused={reducedMotion} options={{ height: 66, amplitude: reducedMotion ? 0 : 10, speed: 0.08, points: 4 }} />
      </Box>
    </Box>
  );
}

export function LoginCallbackPage() {
  const [params] = useSearchParams();
  return <AuthCallbackContent params={params} />;
}

function AuthCallbackContent({ params }: { params: URLSearchParams }) {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    let active = true;
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
      window.setTimeout(() => {
        if (active) navigate(session?.user ? intended : '/home', { replace: true });
      }, 450);
    };
    void run();
    return () => {
      active = false;
    };
  }, [auth, navigate, params]);

  return (
    <LoginOceanBackground>
      <Center minH="100vh" px="4" position="relative" zIndex={1}>
        <VStack bg="rgba(255,255,255,0.90)" border="1px solid #BAE6FD" borderRadius="3xl" boxShadow="0 24px 64px rgba(31,111,214,0.16)" p="8" maxW="520px" textAlign="center" gap="4">
          <OceanMascot mascot="poo" pose="happy" size="lg" decorative motion="float" />
          <Text fontSize="sm" fontWeight="700" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.12em">P-English Google Auth</Text>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="700" color="#102A43">Poo đang xác nhận phiên đăng nhập...</Text>
          <Text color="#52667A" fontWeight="700" lineHeight="1.7">Nếu kết nối Google thành công, bạn sẽ được đưa về vùng học và tiến độ Foundation48 sẽ được tách theo tài khoản.</Text>
        </VStack>
      </Center>
    </LoginOceanBackground>
  );
}
