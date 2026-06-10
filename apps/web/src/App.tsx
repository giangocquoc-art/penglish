import { lazy, Suspense, type ReactNode } from 'react';
import { Link as RouterLink, Navigate, matchPath, useLocation } from 'react-router-dom';
import { Sidebar as ChakraSidebar } from './components/Sidebar';
import { Topbar as ChakraTopbar, Shell as ChakraShell } from './components/Topbar';
import { Box, Button, Center, HStack, Text, VStack } from '@chakra-ui/react';
import { RouteMetadataUpdater } from './components/seo/RouteMetadataUpdater';
import { GlobalEasterEggs } from './components/easter-eggs/GlobalEasterEggs';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { avatarFromUser, displayNameFromUser } from './lib/p-english/userSession';
import { AuthLoadingScreen } from './features/auth/AuthLoadingScreen';

const NewVocabPage = lazy(() => import('./pages/VocabPage').then((module) => ({ default: module.VocabPage })));
const NewLoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const NewLoginCallbackPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginCallbackPage })));
const NewHomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
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
const NewLessonPage = lazy(() => import('./pages/LessonPage').then((module) => ({ default: module.LessonPage })));
const NewLearningPathPage = lazy(() => import('./pages/LearningPathPage').then((module) => ({ default: module.LearningPathPage })));
const NewShadowingPage = lazy(() => import('./pages/ShadowingPage').then((module) => ({ default: module.ShadowingPage })));
const NewEnglishSpeedPage = lazy(() => import('./pages/EnglishSpeedPage').then((module) => ({ default: module.EnglishSpeedPage })));
const NewInteractiveLessonPage = lazy(() => import('./pages/InteractiveLessonPage').then((module) => ({ default: module.InteractiveLessonPage })));
const NewResourceHubPage = lazy(() => import('./pages/ResourceHubPage').then((module) => ({ default: module.ResourceHubPage })));
const Foundation48Page = lazy(() => import('./features/foundation48/Foundation48Page').then((module) => ({ default: module.Foundation48Page })));
const Foundation48DayPage = lazy(() => import('./features/foundation48/Foundation48DayPage').then((module) => ({ default: module.Foundation48DayPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));

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
    bio: 'Đã đăng nhập Google, tiến độ tách theo tài khoản.',
  };
}

function RouteLoadingFallback() {
  return <AuthLoadingScreen />;
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
          <Text fontSize={{ base: '5xl', md: '6xl' }} lineHeight="1" aria-hidden="true">🐳</Text>
          <VStack gap="2">
            <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color="#102A43" lineHeight="1.08">
              404 — Bài học này bơi lạc rồi 🐳
            </Text>
            <Text color="#52667A" fontSize={{ base: 'md', md: 'lg' }} fontWeight="700" lineHeight="1.75" maxW="560px">
              Có thể Poo vừa bơi nhầm dòng hải lưu, hoặc trang này đang được refactor để học mượt hơn.
            </Text>
          </VStack>
          <HStack gap="3" wrap="wrap" justify="center" w="100%">
            <Button as={RouterLink} to="/home" borderRadius="full" bg="white" color="#1F6FD6" border="1px solid #BAE6FD" _hover={{ bg: '#F8FCFF' }}>
              Về trang chủ
            </Button>
            <Button as={RouterLink} to="/learning-path" borderRadius="full" bg="#1F6FD6" color="white" _hover={{ bg: '#185BB2' }}>
              Quay lại lộ trình học
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Center>
  );
}

function AuthGoogleSafePage() {
  const auth = useAuth();
  return (
    <VStack align="start" gap="4" p={{ base: '5', md: '7' }} m={{ base: '4', md: '8' }} borderRadius="3xl" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 18px 46px rgba(31, 111, 214, 0.10)">
      <Text fontSize="sm" fontWeight="700" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.12em">PooEnglish Supabase Auth</Text>
      <Text as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="700" color="#0F172A" lineHeight="1.12">Đăng nhập Google</Text>
      <Text color="#475569" fontWeight="650" lineHeight="1.7">
        {auth.authUnavailable ? 'Google Login chưa được cấu hình. Vui lòng kiểm tra Supabase Auth settings.' : 'Đăng nhập bằng Google để lưu tiến độ và vào lớp học PooEnglish.'}
      </Text>
      <Button onClick={() => void auth.signInWithGoogle()} bg="#1F6FD6" color="white" borderRadius="full" px="6" _hover={{ bg: '#185BB2' }}>
        Đăng nhập bằng Google
      </Button>
    </VStack>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading) {
    return <AuthLoadingScreen />;
  }

  if (!auth.isAuthenticated) {
    const requestedPath = `${location.pathname}${location.search}${location.hash}`;
    const redirectTo = requestedPath && requestedPath !== '/' ? `?redirectTo=${encodeURIComponent(requestedPath)}` : '';
    return <Navigate to={`/login${redirectTo}`} replace />;
  }

  return <>{children}</>;
}

function ProtectedShell({ children, user }: { children: ReactNode; user: User | null }) {
  return <RequireAuth><NewShell user={user}>{children}</NewShell></RequireAuth>;
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
  const isLoginCasingVariant = /^\/login\/?$/i.test(location.pathname) && location.pathname !== '/login';
  const pathname = location.pathname;

  let routeElement: ReactNode;
  if (pathname === '/') routeElement = <Navigate to="/login" replace />;
  else if (isLoginCasingVariant || pathname === '/login/') routeElement = <Navigate to="/login" replace />;
  else if (pathname === '/login') routeElement = auth.loading ? <AuthLoadingScreen /> : !auth.user ? <NewLoginPage /> : <Navigate to="/home" replace />;
  else if (pathname === '/login/callback' || pathname === '/auth/callback') routeElement = <NewLoginCallbackPage />;
  else if (pathname === '/auth/google') routeElement = <RequireAuth><NewShell user={user}><AuthGoogleSafePage /></NewShell></RequireAuth>;
  else if (pathname === '/landing') routeElement = <Navigate to="/login" replace />;
  else if (pathname === '/home') routeElement = <ProtectedShell user={user}><NewHomePage /></ProtectedShell>;
  else if (matchPath('/paths/:id', pathname)) routeElement = <ProtectedShell user={user}><NewStudyPage /></ProtectedShell>;
  else if (pathname === '/learning-path') routeElement = <ProtectedShell user={user}><NewLearningPathPage /></ProtectedShell>;
  else if (matchPath('/learning-path/lesson/:unitId/:nodeId', pathname)) routeElement = <ProtectedShell user={user}><NewInteractiveLessonPage /></ProtectedShell>;
  else if (matchPath('/learn/:lessonId', pathname)) routeElement = <ProtectedShell user={user}><NewInteractiveLessonPage /></ProtectedShell>;
  else if (pathname === '/luyen-tieng-anh/48-ngay-lay-goc') routeElement = <ProtectedShell user={user}><Foundation48Page /></ProtectedShell>;
  else if (matchPath('/luyen-tieng-anh/48-ngay-lay-goc/ngay/:dayNumber', pathname)) routeElement = <ProtectedShell user={user}><Foundation48DayPage /></ProtectedShell>;
  else if (pathname === '/shadowing') routeElement = <ProtectedShell user={user}><NewShadowingPage /></ProtectedShell>;
  else if (matchPath('/lessons/:lessonId', pathname)) routeElement = <ProtectedShell user={user}><NewLessonPage /></ProtectedShell>;
  else if (pathname === '/categories' || pathname === '/category-list') routeElement = <ProtectedShell user={user}><NewCategoriesPage /></ProtectedShell>;
  else if (pathname === '/vocabularies' || pathname === '/words') routeElement = <ProtectedShell user={user}><NewVocabPage /></ProtectedShell>;
  else if (pathname === '/games') routeElement = <ProtectedShell user={user}><NewGamesPage /></ProtectedShell>;
  else if (pathname === '/practice') routeElement = <ProtectedShell user={user}><NewPracticePage /></ProtectedShell>;
  else if (pathname === '/english-speed') routeElement = <ProtectedShell user={user}><NewEnglishSpeedPage /></ProtectedShell>;
  else if (pathname === '/resources') routeElement = <ProtectedShell user={user}><NewResourceHubPage /></ProtectedShell>;
  else if (pathname === '/folders') routeElement = <ProtectedShell user={user}><NewFoldersPage /></ProtectedShell>;
  else if (pathname === '/chat') routeElement = <ProtectedShell user={user}><NewChatPage /></ProtectedShell>;
  else if (pathname === '/ai') routeElement = <ProtectedShell user={user}><NewAiPage /></ProtectedShell>;
  else if (pathname === '/leaderboard') routeElement = <ProtectedShell user={user}><NewLeaderboardPage /></ProtectedShell>;
  else if (pathname === '/shop') routeElement = <ProtectedShell user={user}><NewShopPage /></ProtectedShell>;
  else if (pathname === '/store') routeElement = <RequireAuth><Navigate to="/shop" replace /></RequireAuth>;
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
  return (
    <AuthProvider>
      <AppRoutes />
      <GlobalEasterEggs />
    </AuthProvider>
  );
}

