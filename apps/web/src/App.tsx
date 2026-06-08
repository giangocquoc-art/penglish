import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Sidebar as ChakraSidebar } from './components/Sidebar';
import { Topbar as ChakraTopbar, Shell as ChakraShell } from './components/Topbar';
import { Button, Text, VStack } from '@chakra-ui/react';
import { RouteMetadataUpdater } from './components/seo/RouteMetadataUpdater';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { avatarFromUser, displayNameFromUser } from './lib/p-english/userSession';

const NewVocabPage = lazy(() => import('./pages/VocabPage').then((module) => ({ default: module.VocabPage })));
const NewLandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
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
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '42vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        color: '#0F172A',
        background: 'linear-gradient(180deg, #DDF5FF 0%, #F8FCFF 100%)',
      }}
    >
      <div
        style={{
          width: 'min(420px, 100%)',
          border: '1px solid #BAE6FD',
          borderRadius: 28,
          padding: 28,
          background: 'rgba(255,255,255,0.9)',
          boxShadow: '0 18px 45px rgba(31, 111, 214, 0.12)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 34, lineHeight: 1, marginBottom: 12 }}>🐋</div>
        <div style={{ color: '#1F6FD6', fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          P-English
        </div>
        <div style={{ marginTop: 8, fontSize: 22, fontWeight: 950 }}>
          Đang mở vùng học...
        </div>
        <div style={{ marginTop: 8, color: '#64748B', fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>
          Poo đang chuẩn bị flashcard, ghép cặp và dữ liệu từ vựng cho bạn.
        </div>
      </div>
    </div>
  );
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
      <Text fontSize="sm" fontWeight="900" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.12em">P-English Supabase Auth</Text>
      <Text as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color="#0F172A" lineHeight="1.12">Đăng nhập Google</Text>
      <Text color="#475569" fontWeight="650" lineHeight="1.7">
        {auth.authUnavailable ? 'Đăng nhập Google chưa bật. Bạn vẫn có thể học thử trên thiết bị này.' : 'Bạn có thể đăng nhập bằng Google để đồng bộ tiến độ theo tài khoản.'}
      </Text>
      <Button onClick={() => void auth.signInWithGoogle()} bg="#1F6FD6" color="white" borderRadius="full" px="6" _hover={{ bg: '#185BB2' }}>
        Đăng nhập bằng Google
      </Button>
    </VStack>
  );
}

function NewShell({ children, user }: { children: React.ReactNode; user: User | null }) {
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
  const isPublicRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/login/callback' || location.pathname === '/auth/google' || location.pathname === '/auth/callback';

  if (!isPublicRoute && auth.loading) {
    return (
      <>
        <RouteMetadataUpdater />
        <div style={{ padding: 32 }}>Đang tải...</div>
      </>
    );
  }

  return (
    <>
      <RouteMetadataUpdater />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
        <Route path="/" element={<NewLandingPage />} />
        <Route path="/landing" element={<NewLandingPage />} />
        <Route path="/login" element={auth.loading || !auth.user ? <NewLoginPage /> : <Navigate to="/home" replace />} />
        <Route path="/login/callback" element={<NewLoginCallbackPage />} />
        <Route path="/auth/google" element={<NewShell user={user}><AuthGoogleSafePage /></NewShell>} />
        <Route path="/auth/callback" element={<NewLoginCallbackPage />} />
        <Route path="/home" element={<NewShell user={user}><NewHomePage /></NewShell>} />
        <Route path="/paths/:id" element={<NewShell user={user}><NewStudyPage /></NewShell>} />
        <Route path="/learning-path" element={<NewShell user={user}><NewLearningPathPage /></NewShell>} />
        <Route path="/learning-path/lesson/:unitId/:nodeId" element={<NewShell user={user}><NewInteractiveLessonPage /></NewShell>} />
        <Route path="/learn/:lessonId" element={<NewShell user={user}><NewInteractiveLessonPage /></NewShell>} />
        <Route path="/luyen-tieng-anh/48-ngay-lay-goc" element={<NewShell user={user}><Foundation48Page /></NewShell>} />
        <Route path="/luyen-tieng-anh/48-ngay-lay-goc/ngay/:dayNumber" element={<NewShell user={user}><Foundation48DayPage /></NewShell>} />
        <Route path="/shadowing" element={<NewShell user={user}><NewShadowingPage /></NewShell>} />
        <Route path="/lessons/:lessonId" element={<NewShell user={user}><NewLessonPage /></NewShell>} />
        <Route path="/categories" element={<NewShell user={user}><NewCategoriesPage /></NewShell>} />
        <Route path="/category-list" element={<NewShell user={user}><NewCategoriesPage /></NewShell>} />
        <Route path="/vocabularies" element={<NewShell user={user}><NewVocabPage /></NewShell>} />
        <Route path="/words" element={<NewShell user={user}><NewVocabPage /></NewShell>} />
        <Route path="/games" element={<NewShell user={user}><NewGamesPage /></NewShell>} />
        <Route path="/practice" element={<NewShell user={user}><NewPracticePage /></NewShell>} />
        <Route path="/english-speed" element={<NewShell user={user}><NewEnglishSpeedPage /></NewShell>} />
        <Route path="/resources" element={<NewShell user={user}><NewResourceHubPage /></NewShell>} />
        <Route path="/folders" element={<NewShell user={user}><NewFoldersPage /></NewShell>} />
        <Route path="/chat" element={<NewShell user={user}><NewChatPage /></NewShell>} />
        <Route path="/ai" element={<NewShell user={user}><NewAiPage /></NewShell>} />
        <Route path="/leaderboard" element={<NewShell user={user}><NewLeaderboardPage /></NewShell>} />
        <Route path="/shop" element={<NewShell user={user}><NewShopPage /></NewShell>} />
        <Route path="/store" element={<Navigate to="/shop" replace />} />
        <Route path="/pricing" element={<NewShell user={user}><NewPricingPage /></NewShell>} />
        <Route path="/subscriptions" element={<NewShell user={user}><NewPricingPage /></NewShell>} />
        <Route path="/shared-streak" element={<NewShell user={user}><NewSharedStreakPage /></NewShell>} />
        <Route path="/profile" element={<NewShell user={user}><NewProfilePage /></NewShell>} />
        <Route path="*" element={<NewShell user={user}><NotFoundPage /></NewShell>} />
        </Routes>
      </Suspense>
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
