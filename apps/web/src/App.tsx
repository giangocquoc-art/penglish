import { lazy, Suspense, type ReactNode } from 'react';
import { Link as RouterLink, Navigate, Route, Routes, matchPath, useLocation } from 'react-router-dom';
import { Sidebar as ChakraSidebar } from './components/Sidebar';
import { Topbar as ChakraTopbar, Shell as ChakraShell } from './components/Topbar';
import { Box, Button, Center, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { OceanMascot } from './components/p-english/OceanMascot';
import { RouteMetadataUpdater } from './components/seo/RouteMetadataUpdater';
import { REVIEW_SEO_PATHS } from './data/reviewSeoPages';
import { SEO_PAGE_PATHS } from './data/seoPagesData';
import { LESSON_SEO_PATHS } from './data/lessonSeoPages';
import { seoV4Routes } from './data/seoV4Top1Pages';
import { GlobalEasterEggs } from './components/easter-eggs/GlobalEasterEggs';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { avatarFromUser, displayNameFromUser } from './lib/p-english/userSession';
import { usePooDevtoolWarning } from './hooks/usePooDevtoolWarning';

const NewVocabPage = lazy(() => import('./pages/VocabPage').then((module) => ({ default: module.VocabPage })));
const NewLoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const NewLoginCallbackPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginCallbackPage })));
const NewHomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const NewTodaySessionPage = lazy(() => import('./pages/TodaySessionPage').then((module) => ({ default: module.TodaySessionPage })));
const NewCategoriesPage = lazy(() => import('./pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })));
const NewFoldersPage = lazy(() => import('./pages/FoldersPage').then((module) => ({ default: module.FoldersPage })));
const NewShopPage = lazy(() => import('./pages/ShopPage').then((module) => ({ default: module.ShopPage })));
const NewLeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then((module) => ({ default: module.LeaderboardPage })));
const NewGamesPage = lazy(() => import('./pages/GamesPage').then((module) => ({ default: module.GamesPage })));
const NewChatPage = lazy(() => import('./pages/ChatPage').then((module) => ({ default: module.ChatPage })));
const NewAiPage = lazy(() => import('./pages/AiPage').then((module) => ({ default: module.AiPage })));
const NewPricingPage = lazy(() => import('./pages/PricingPage').then((module) => ({ default: module.PricingPage })));
const NewSharedStreakPage = lazy(() => import('./pages/SharedStreakPage').then((module) => ({ default: module.SharedStreakPage })));
const NewProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const NewStudyPage = lazy(() => import('./pages/StudyPage').then((module) => ({ default: module.StudyPage })));
const NewPracticePage = lazy(() => import('./pages/PracticePage').then((module) => ({ default: module.PracticePage })));
const NewSpeakingCoachPage = lazy(() => import('./pages/SpeakingCoachPage').then((module) => ({ default: module.SpeakingCoachPage })));
const NewLessonPage = lazy(() => import('./pages/LessonPage').then((module) => ({ default: module.LessonPage })));
const NewLearningPathPage = lazy(() => import('./pages/LearningPathPage').then((module) => ({ default: module.LearningPathPage })));
const NewShadowingHubPage = lazy(() => import('./pages/ShadowingHubPage').then((module) => ({ default: module.ShadowingHubPage })));
const NewShadowingPracticePage = lazy(() => import('./pages/ShadowingPage').then((module) => ({ default: module.ShadowingPracticePage })));
const NewEnglishSpeedPage = lazy(() => import('./pages/EnglishSpeedPage').then((module) => ({ default: module.EnglishSpeedPage })));
const NewVideoLabPage = lazy(() => import('./pages/VideoLabPage').then((module) => ({ default: module.VideoLabPage })));
const NewInteractiveLessonPage = lazy(() => import('./pages/InteractiveLessonPage').then((module) => ({ default: module.InteractiveLessonPage })));
const NewResourceHubPage = lazy(() => import('./pages/ResourceHubPage').then((module) => ({ default: module.ResourceHubPage })));
const Foundation48Page = lazy(() => import('./features/foundation48/Foundation48Page').then((module) => ({ default: module.Foundation48Page })));
const Foundation48DayPage = lazy(() => import('./features/foundation48/Foundation48DayPage').then((module) => ({ default: module.Foundation48DayPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));
const SeoLandingPage = lazy(() => import('./pages/SeoLandingPage').then((module) => ({ default: module.SeoLandingPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((module) => ({ default: module.BlogPage })));
const LessonSeoPage = lazy(() => import('./pages/LessonSeoPage').then((module) => ({ default: module.LessonSeoPage })));
const SeoV4Page = lazy(() => import('./pages/SeoV4Page').then((module) => ({ default: module.SeoV4Page })));

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coin: number;
  streak: number;
  vip: boolean;
  bio: string;
};

function useUserFromAuth(): User | null {
  const auth = useAuth();
  if (!auth.user) return null;
  return {
    id: auth.user.id,
    name: displayNameFromUser(auth.user),
    email: auth.user.email ?? '',
    avatar: avatarFromUser(auth.user),
    coin: 0,
    streak: 0,
    vip: false,
    bio: 'Poo sẽ lưu tiến độ học của bạn an toàn.',
  };
}

function RouteLoadingFallback() {
  return (
    <Center
      minH="calc(100vh - 160px)"
      px="4"
      data-testid="route-loading-fallback"
      role="status"
      aria-live="polite"
      aria-label="Poo đang chuẩn bị bài học"
    >
      <VStack
        gap="4"
        w="min(360px, 100%)"
        p={{ base: '5', md: '6' }}
        borderRadius="3xl"
        bg="linear-gradient(145deg, rgba(255,255,255,0.88), rgba(221,245,255,0.72))"
        border="1px solid rgba(186,230,253,0.78)"
        boxShadow="0 12px 30px rgba(31,111,214,0.07)"
        textAlign="center"
      >
        <Box position="relative" display="grid" placeItems="center" minH={{ base: '86px', md: '100px' }}>
          <Box aria-hidden="true" position="absolute" w={{ base: '84px', md: '100px' }} h={{ base: '84px', md: '100px' }} borderRadius="full" bg="rgba(186,230,253,0.42)" />
          <OceanMascot mascot="poo" pose="rest" size="md" decorative motion="swim" position="relative" />
        </Box>
        <VStack gap="1.5">
          <Text color="#102A43" fontWeight="950" fontSize={{ base: 'lg', md: 'xl' }}>
            Poo đang chuẩn bị bài học...
          </Text>
          <Text color="#52667A" fontWeight="800" fontSize="sm">
            Chờ Poo bơi một chút nha.
          </Text>
        </VStack>
        <HStack gap="1.5" aria-hidden="true">
          {[0.48, 0.72, 1].map((opacity) => (
            <Box key={opacity} w="7px" h="7px" borderRadius="full" bg="#2F9EEB" opacity={opacity} />
          ))}
        </HStack>
      </VStack>
    </Center>
  );
}

function NotFoundPage() {
  return (
    <Center minH="calc(100vh - 180px)" px={{ base: '3', md: '6' }} pb={{ base: '8', md: '12' }} data-testid="penglish-404-page">
      <Box
        w="min(720px, 100%)"
        className="penglish-glass-card"
        bg="linear-gradient(145deg, rgba(255,255,255,0.86), rgba(221,245,255,0.72))"
        border="1px solid rgba(186,230,253,0.86)"
        borderRadius={{ base: '30px', md: '38px' }}
        p={{ base: '6', md: '9' }}
        textAlign="center"
        boxShadow="0 28px 80px rgba(31,111,214,0.14)"
        overflow="hidden"
        position="relative"
      >
        <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 16% 18%, rgba(255,255,255,0.86), transparent 28%), radial-gradient(circle at 86% 14%, rgba(91,188,235,0.22), transparent 24%), radial-gradient(circle at 50% 100%, rgba(31,111,214,0.14), transparent 34%)" />
        <VStack position="relative" gap={{ base: '4', md: '5' }}>
          <Box position="relative" display="grid" placeItems="center" minH={{ base: '118px', md: '148px' }}>
            <Box aria-hidden="true" position="absolute" w={{ base: '112px', md: '144px' }} h={{ base: '112px', md: '144px' }} borderRadius="full" bg="rgba(186,230,253,0.44)" border="1px solid rgba(91,188,235,0.18)" />
            <OceanMascot mascot="poo" pose="coach" size="lg" decorative motion="float" position="relative" />
          </Box>
          <VStack gap="2">
            <Text color="#1F6FD6" fontSize="xs" fontWeight="950" letterSpacing="0.14em" textTransform="uppercase">
              404 · Lạc dòng
            </Text>
            <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color="#102A43" lineHeight="1.08">
              Bài học này bơi lạc rồi
            </Text>
            <Text color="#52667A" fontSize={{ base: 'md', md: 'lg' }} fontWeight="700" lineHeight="1.75" maxW="560px">
              Đường dẫn này không còn ở đây hoặc đã đổi chỗ. Poo sẽ đưa bạn về đúng vùng học nhé.
            </Text>
          </VStack>
          <Stack direction={{ base: 'column', sm: 'row' }} gap="3" justify="center" w={{ base: '100%', sm: 'auto' }}>
            <Button as={RouterLink} to="/home" w={{ base: '100%', sm: 'auto' }} borderRadius="full" bg="#1F6FD6" color="white" _hover={{ bg: '#185BB2' }}>
              Về trang chủ
            </Button>
            <Button as={RouterLink} to="/learning-path" w={{ base: '100%', sm: 'auto' }} borderRadius="full" bg="white" color="#1F6FD6" border="1px solid #BAE6FD" _hover={{ bg: '#F8FCFF' }}>
              Mở lộ trình học
            </Button>
          </Stack>
        </VStack>
      </Box>
    </Center>
  );
}

function AuthGoogleSafePage() {
  const auth = useAuth();
  return (
    <VStack align="start" gap="4" p={{ base: '5', md: '7' }} m={{ base: '4', md: '8' }} borderRadius="3xl" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 18px 46px rgba(31, 111, 214, 0.10)" data-testid="auth-google-safe-page">
      <Box alignSelf="center" data-testid="auth-google-safe-mascot">
        <OceanMascot mascot="poo" pose={auth.authUnavailable ? 'coach' : 'happy'} size="md" decorative motion="float" />
      </Box>
      <Text fontSize="sm" fontWeight="700" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.12em">Vào lớp học cùng Poo</Text>
      <Text as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="700" color="#0F172A" lineHeight="1.12">Đăng nhập Google</Text>
      <Text color="#475569" fontWeight="650" lineHeight="1.7">
        {auth.authUnavailable ? 'Poo chưa mở được cổng đăng nhập. Bạn thử lại sau một chút nhé.' : 'Đăng nhập bằng Google để Poo lưu tiến độ và đưa bạn vào lớp học.'}
      </Text>
      <Button onClick={() => void auth.signInWithGoogle()} bg="#1F6FD6" color="white" borderRadius="full" px="6" _hover={{ bg: '#185BB2' }}>
        Đăng nhập bằng Google
      </Button>
    </VStack>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function ProtectedShell({ children, user }: { children: ReactNode; user: User | null }) {
  return <RequireAuth><NewShell user={user}>{children}</NewShell></RequireAuth>;
}

function ParamRoute({ path, children }: { path: string; children: ReactNode }) {
  return (
    <Routes>
      <Route path={path} element={children} />
    </Routes>
  );
}

function NewShell({ children, user }: { children: ReactNode; user: User | null }) {
  return (
    <ChakraShell sidebar={<ChakraSidebar user={user} />}>
      <ChakraTopbar user={user} />
      <Box
        as="main"
        data-testid="penglish-shell-content"
        minW="0"
        pt={{ base: '3', md: '3.5', lg: '4' }}
        position="relative"
        zIndex="1"
      >
        {children}
      </Box>
    </ChakraShell>
  );
}

function AppRoutes() {
  const location = useLocation();
  const auth = useAuth();
  const user = useUserFromAuth();
  const pathname = location.pathname.length > 1 ? location.pathname.replace(/\/+$/, '') : location.pathname;
  const isLoginCasingVariant = /^\/login$/i.test(pathname) && pathname !== '/login';

  let routeElement: ReactNode;
  const isSeoLandingRoute = [
    '/',
    '/hoc-tieng-anh',
    '/lo-trinh-hoc-tieng-anh',
    '/shadowing-tieng-anh',
    '/tu-vung-tieng-anh',
    '/luyen-nghe-tieng-anh',
    '/ngu-phap-tieng-anh',
    '/48-ngay-lay-goc',
    '/gioi-thieu',
    ...REVIEW_SEO_PATHS,
    ...SEO_PAGE_PATHS,
  ].includes(pathname);
  const isLessonSeoRoute = LESSON_SEO_PATHS.includes(pathname);
  const isSeoV4Route = seoV4Routes.includes(pathname);

  if (isSeoV4Route) routeElement = <NewShell user={user}><SeoV4Page /></NewShell>;
  else if (isSeoLandingRoute) routeElement = <NewShell user={user}><SeoLandingPage /></NewShell>;
  else if (isLessonSeoRoute) routeElement = <NewShell user={user}><LessonSeoPage /></NewShell>;
  else if (pathname === '/blog' || pathname.startsWith('/blog/')) routeElement = <NewShell user={user}><BlogPage /></NewShell>;
  else if (isLoginCasingVariant || pathname === '/login/') routeElement = <Navigate to="/login" replace />;
  else if (pathname === '/login') routeElement = auth.user ? <Navigate to="/home" replace /> : <NewLoginPage />;
  else if (pathname === '/login/callback' || pathname === '/auth/callback') routeElement = <NewLoginCallbackPage />;
  else if (pathname === '/auth/google') routeElement = <NewShell user={user}><AuthGoogleSafePage /></NewShell>;
  else if (pathname === '/landing') routeElement = <Navigate to="/home" replace />;
  else if (pathname === '/home') routeElement = <ProtectedShell user={user}><NewHomePage /></ProtectedShell>;
  else if (pathname === '/today') routeElement = <ProtectedShell user={user}><NewTodaySessionPage /></ProtectedShell>;
  else if (matchPath('/paths/:id', pathname)) routeElement = <ParamRoute path="/paths/:id"><ProtectedShell user={user}><NewStudyPage /></ProtectedShell></ParamRoute>;
  else if (pathname === '/learning-path') routeElement = <ProtectedShell user={user}><NewLearningPathPage /></ProtectedShell>;
  else if (matchPath('/learning-path/lesson/:unitId/:nodeId', pathname)) routeElement = <ParamRoute path="/learning-path/lesson/:unitId/:nodeId"><ProtectedShell user={user}><NewInteractiveLessonPage /></ProtectedShell></ParamRoute>;
  else if (matchPath('/learn/:lessonId', pathname)) routeElement = <ParamRoute path="/learn/:lessonId"><ProtectedShell user={user}><NewInteractiveLessonPage /></ProtectedShell></ParamRoute>;
  else if (pathname === '/luyen-tieng-anh/48-ngay-lay-goc') routeElement = <ProtectedShell user={user}><Foundation48Page /></ProtectedShell>;
  else if (matchPath('/luyen-tieng-anh/48-ngay-lay-goc/ngay/:dayNumber', pathname)) routeElement = <ParamRoute path="/luyen-tieng-anh/48-ngay-lay-goc/ngay/:dayNumber"><ProtectedShell user={user}><Foundation48DayPage /></ProtectedShell></ParamRoute>;
  else if (pathname === '/shadowing') routeElement = <ProtectedShell user={user}><NewShadowingHubPage /></ProtectedShell>;
  else if (matchPath('/shadowing/practice/:lessonId', pathname)) routeElement = <ParamRoute path="/shadowing/practice/:lessonId"><ProtectedShell user={user}><NewShadowingPracticePage /></ProtectedShell></ParamRoute>;
  else if (pathname === '/video-lab') routeElement = <ProtectedShell user={user}><NewVideoLabPage /></ProtectedShell>;
  else if (matchPath('/lessons/:lessonId', pathname)) routeElement = <ParamRoute path="/lessons/:lessonId"><ProtectedShell user={user}><NewLessonPage /></ProtectedShell></ParamRoute>;
  else if (pathname === '/categories' || pathname === '/category-list') routeElement = <ProtectedShell user={user}><NewCategoriesPage /></ProtectedShell>;
  else if (pathname === '/speaking-coach') routeElement = <ProtectedShell user={user}><NewSpeakingCoachPage /></ProtectedShell>;
  else if (pathname === '/vocabularies') routeElement = <ProtectedShell user={user}><NewVocabPage /></ProtectedShell>;
  else if (pathname === '/words') routeElement = <ProtectedShell user={user}><NewVocabPage /></ProtectedShell>;
  else if (pathname === '/games') routeElement = <ProtectedShell user={user}><NewGamesPage /></ProtectedShell>;
  else if (pathname === '/practice') routeElement = <ProtectedShell user={user}><NewPracticePage /></ProtectedShell>;
  else if (pathname === '/english-speed') routeElement = <ProtectedShell user={user}><NewEnglishSpeedPage /></ProtectedShell>;
  else if (pathname === '/resources') routeElement = <ProtectedShell user={user}><NewResourceHubPage /></ProtectedShell>;
  else if (pathname === '/folders') routeElement = <ProtectedShell user={user}><NewFoldersPage /></ProtectedShell>;
  else if (pathname === '/chat') routeElement = <ProtectedShell user={user}><NewChatPage /></ProtectedShell>;
  else if (pathname === '/ai') routeElement = <ProtectedShell user={user}><NewAiPage /></ProtectedShell>;
  else if (pathname === '/leaderboard') routeElement = <ProtectedShell user={user}><NewLeaderboardPage /></ProtectedShell>;
  else if (pathname === '/shop') routeElement = <ProtectedShell user={user}><NewShopPage /></ProtectedShell>;
  else if (pathname === '/store') routeElement = <Navigate to="/shop" replace />;
  else if (pathname === '/pricing' || pathname === '/subscriptions') routeElement = <ProtectedShell user={user}><NewPricingPage /></ProtectedShell>;
  else if (pathname === '/shared-streak') routeElement = <ProtectedShell user={user}><NewSharedStreakPage /></ProtectedShell>;
  else if (pathname === '/profile') routeElement = <ProtectedShell user={user}><NewProfilePage /></ProtectedShell>;
  else if (pathname === '/admin' || pathname.startsWith('/admin/')) routeElement = <AdminPage />;
  else routeElement = <NewShell user={user}><NotFoundPage /></NewShell>;

  return (
    <>
      <RouteMetadataUpdater />
      <Suspense fallback={<RouteLoadingFallback />}>
        {routeElement}
      </Suspense>
    </>
  );
}

export default function App() {
  const pooDevtoolWarning = usePooDevtoolWarning();

  return (
    <AuthProvider>
      <AppRoutes />
      <GlobalEasterEggs />
      {pooDevtoolWarning}
    </AuthProvider>
  );
}
