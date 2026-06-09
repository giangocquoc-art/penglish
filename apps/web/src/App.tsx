import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, matchPath, useLocation } from 'react-router-dom';
import { Sidebar as ChakraSidebar } from './components/Sidebar';
import { Topbar as ChakraTopbar, Shell as ChakraShell } from './components/Topbar';
import { Button, Text, VStack } from '@chakra-ui/react';
import { RouteMetadataUpdater } from './components/seo/RouteMetadataUpdater';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { avatarFromUser, displayNameFromUser } from './lib/p-english/userSession';
import { PooOceanRiseLoader } from './features/shell/PooOceanRiseLoader';

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
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setVisible(true), 260);
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(88, current + (current < 56 ? 8 : 3)));
    }, 180);
    return () => {
      window.clearTimeout(showTimer);
      window.clearInterval(progressTimer);
    };
  }, []);

  if (!visible) return null;
  return <PooOceanRiseLoader progress={progress} delayed label="Đang mở trang P-English" />;
}

function useInitialOceanRiseLoaderReady(authLoading: boolean) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [qaHoldComplete, setQaHoldComplete] = useState(false);

  const qaEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('oceanLoaderQa') === '1';
  }, []);

  useEffect(() => {
    if (!qaEnabled) {
      setQaHoldComplete(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setQaHoldComplete(true), 2400);
    return () => window.clearTimeout(timer);
  }, [qaEnabled]);

  useEffect(() => {
    if (!visible || exiting) return undefined;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (!authLoading && qaHoldComplete) return current;
        const ceiling = qaEnabled ? 82 : 80;
        const increment = current < 34 ? 5 : current < 62 ? 3 : 1;
        return Math.min(ceiling, current + increment);
      });
    }, qaEnabled ? 110 : 160);
    return () => window.clearInterval(timer);
  }, [authLoading, exiting, qaEnabled, qaHoldComplete, visible]);

  useEffect(() => {
    if (authLoading || !qaHoldComplete || !visible) return undefined;
    const completeTimer = window.setTimeout(() => setProgress(100), qaEnabled ? 120 : 80);
    const exitTimer = window.setTimeout(() => setExiting(true), qaEnabled ? 980 : 760);
    const hideTimer = window.setTimeout(() => setVisible(false), qaEnabled ? 1400 : 1120);
    return () => {
      window.clearTimeout(completeTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [authLoading, qaEnabled, qaHoldComplete, visible]);

  return { progress, visible, exiting };
}

function NotFoundPage() {
  return (
    <div className="section page-card">
      <h2>Không tìm thấy</h2>
      <p className="muted">Route chưa có.</p>
    </div>
  );
}

function AuthGoogleSafePage() {
  const auth = useAuth();
  return (
    <VStack align="start" gap="4" p={{ base: '5', md: '7' }} m={{ base: '4', md: '8' }} borderRadius="3xl" bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 18px 46px rgba(31, 111, 214, 0.10)">
      <Text fontSize="sm" fontWeight="700" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.12em">P-English Supabase Auth</Text>
      <Text as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="700" color="#0F172A" lineHeight="1.12">Đăng nhập Google</Text>
      <Text color="#475569" fontWeight="650" lineHeight="1.7">
        {auth.authUnavailable ? 'Google Login chưa được cấu hình. Vui lòng kiểm tra Supabase Auth settings.' : 'Đăng nhập bằng Google để lưu tiến độ và vào lớp học P-English.'}
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
  const initialLoader = useInitialOceanRiseLoaderReady(auth.loading);

  if (auth.loading) {
    return initialLoader.visible ? <PooOceanRiseLoader progress={initialLoader.progress} exiting={initialLoader.exiting} /> : null;
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
      {children}
    </ChakraShell>
  );
}

function AppRoutes() {
  const location = useLocation();
  const auth = useAuth();
  const user = useUserFromAuth();
  const showInitialLoader = auth.loading || Boolean(auth.user);
  const initialLoader = useInitialOceanRiseLoaderReady(showInitialLoader);
  const isLoginCasingVariant = /^\/login\/?$/i.test(location.pathname) && location.pathname !== '/login';
  const pathname = location.pathname;

  let routeElement: ReactNode;
  if (pathname === '/') routeElement = <Navigate to="/login" replace />;
  else if (isLoginCasingVariant || pathname === '/login/') routeElement = <Navigate to="/login" replace />;
  else if (pathname === '/login') routeElement = auth.loading || !auth.user ? <NewLoginPage /> : <Navigate to="/home" replace />;
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
  else routeElement = <ProtectedShell user={user}><NotFoundPage /></ProtectedShell>;

  return (
    <>
      <RouteMetadataUpdater />
      <Suspense fallback={<RouteLoadingFallback />}>
        {routeElement}
      </Suspense>
      {showInitialLoader && initialLoader.visible ? (
        <PooOceanRiseLoader progress={initialLoader.progress} exiting={initialLoader.exiting} />
      ) : null}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

