import { lazy, Suspense, useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { get } from './api';
import { VocabPage as NewVocabPage } from './pages/VocabPage';
import { Sidebar as ChakraSidebar } from './components/Sidebar';
import { Topbar as ChakraTopbar, Shell as ChakraShell } from './components/Topbar';
import { LandingPage as NewLandingPage } from './pages/LandingPage';
import { LoginPage as NewLoginPage, LoginCallbackPage as NewLoginCallbackPage } from './pages/LoginPage';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { supabase } from './lib/supabaseClient';
import { SUPABASE_AUTH_EVENT, upsertSignedInProfile } from './lib/p-english/userSession';

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
const NewResourceHubPage = lazy(() => import('./pages/ResourceHubPage').then((module) => ({ default: module.ResourceHubPage })));

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

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function shouldSyncOptionalBackend() {
  if (typeof window === 'undefined') return Boolean(import.meta.env.VITE_API_URL);
  return Boolean(import.meta.env.VITE_API_URL) || window.localStorage.getItem('pshare-enable-backend-sync') === '1';
}

function useAuth() {
  const [user, setUser] = useState<User | null>(() => readCachedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (!active) return;
        if (data.user) {
          const signedInUser: User = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Bạn học P-English',
            email: data.user.email ?? '',
            avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
            coin: 0,
            streak: 0,
            vip: false,
            bio: 'Đã đăng nhập Supabase, tiến độ tách theo tài khoản.',
          };
          setUser(signedInUser);
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('accessToken');
      if (!token || !shouldSyncOptionalBackend()) {
        setUser(readCachedUser());
        setLoading(false);
        return;
      }

      get<{ data: User }>('/auth/profile')
        .then((payload) => {
          setUser(payload.data);
          try {
            localStorage.setItem('currentUser', JSON.stringify(payload.data));
          } catch {
            // Ignore localStorage write failures in private/locked contexts.
          }
        })
        .catch(() => {
          setUser(readCachedUser());
        })
        .finally(() => setLoading(false));
    };

    hydrate();
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Bạn học P-English',
          email: session.user.email ?? '',
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
          coin: 0,
          streak: 0,
          vip: false,
          bio: 'Đã đăng nhập Supabase, tiến độ tách theo tài khoản.',
        });
      } else {
        setUser(readCachedUser());
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18 }} aria-hidden="true">
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#1F6FD6', opacity: 0.95 }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#38BDF8', opacity: 0.8 }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#22C55E', opacity: 0.75 }} />
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
  const navigate = useNavigate();
  const [status, setStatus] = useState('Đang kiểm tra phiên Supabase...');

  useEffect(() => {
    let active = true;
    const finishAuth = async () => {
      if (!supabase) {
        setStatus('Google chưa bật. Bạn vẫn có thể học ở chế độ local.');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        setStatus('Chưa kết nối được Google. Tiến độ local vẫn an toàn trên thiết bị này.');
        return;
      }
      if (data.session?.user) {
        await upsertSignedInProfile();
        window.dispatchEvent(new Event(SUPABASE_AUTH_EVENT));
        setStatus('Đã đăng nhập Supabase. Đang mở trang học...');
        setTimeout(() => navigate('/home', { replace: true }), 350);
        return;
      }
      setStatus('Chưa có phiên Google. Bạn có thể quay lại học ở chế độ local.');
    };
    finishAuth();
    return () => { active = false; };
  }, [navigate]);

  return (
    <Box px={{ base: '4', md: '6' }} py={{ base: '8', md: '10' }} maxW="760px" mx="auto">
      <VStack
        align="start"
        gap="4"
        p={{ base: '5', md: '7' }}
        borderRadius="3xl"
        bg="rgba(255,255,255,0.88)"
        border="1px solid"
        borderColor="#BAE6FD"
        boxShadow="0 18px 46px rgba(31, 111, 214, 0.10)"
      >
        <Text fontSize="sm" fontWeight="900" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.12em">
          P-English Supabase Auth
        </Text>
        <Text as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color="#0F172A" lineHeight="1.12">
          Đăng nhập Google
        </Text>
        <Text color="#475569" fontWeight="650" lineHeight="1.7">
          {status}
        </Text>
        <Button as={RouterLink} to="/home" bg="#1F6FD6" color="white" borderRadius="full" px="6" _hover={{ bg: '#185BB2' }}>
          Tiếp tục học ngay
        </Button>
      </VStack>
    </Box>
  );
}

function NewShell({ children, user }: { children: React.ReactNode; user: User | null }) {
  return (
    <ChakraShell sidebar={<ChakraSidebar user={user as any} />}>
      <ChakraTopbar user={user as any} />
      {children}
    </ChakraShell>
  );
}

function AppRoutes() {
  const location = useLocation();
  const auth = useAuth();
  const { loading } = auth;
  const isPublicRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/login/callback' || location.pathname === '/auth/google' || location.pathname === '/auth/callback';

  if (!isPublicRoute && loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<NewLandingPage />} />
        <Route path="/landing" element={<NewLandingPage />} />
        <Route path="/login" element={loading || !auth.user ? <NewLoginPage /> : <Navigate to="/home" replace />} />
        <Route path="/login/callback" element={<NewLoginCallbackPage />} />
        <Route path="/auth/google" element={<NewShell user={auth.user}><AuthGoogleSafePage /></NewShell>} />
        <Route path="/auth/callback" element={<NewShell user={auth.user}><AuthGoogleSafePage /></NewShell>} />
        <Route path="/home" element={<NewShell user={auth.user}><NewHomePage /></NewShell>} />
        <Route path="/paths/:id" element={<NewShell user={auth.user}><NewStudyPage /></NewShell>} />
        <Route path="/learning-path" element={<NewShell user={auth.user}><NewLearningPathPage /></NewShell>} />
        <Route path="/shadowing" element={<NewShell user={auth.user}><NewShadowingPage /></NewShell>} />
        <Route path="/lessons/:lessonId" element={<NewShell user={auth.user}><NewLessonPage /></NewShell>} />
        <Route path="/categories" element={<NewShell user={auth.user}><NewCategoriesPage /></NewShell>} />
        <Route path="/category-list" element={<NewShell user={auth.user}><NewCategoriesPage /></NewShell>} />
        <Route path="/vocabularies" element={<NewShell user={auth.user}><NewVocabPage /></NewShell>} />
        <Route path="/words" element={<NewShell user={auth.user}><NewVocabPage /></NewShell>} />
        <Route path="/games" element={<NewShell user={auth.user}><NewGamesPage /></NewShell>} />
        <Route path="/practice" element={<NewShell user={auth.user}><NewPracticePage /></NewShell>} />
        <Route path="/english-speed" element={<NewShell user={auth.user}><NewEnglishSpeedPage /></NewShell>} />
        <Route path="/resources" element={<NewShell user={auth.user}><NewResourceHubPage /></NewShell>} />
        <Route path="/folders" element={<NewShell user={auth.user}><NewFoldersPage /></NewShell>} />
        <Route path="/chat" element={<NewShell user={auth.user}><NewChatPage /></NewShell>} />
        <Route path="/ai" element={<NewShell user={auth.user}><NewAiPage /></NewShell>} />
        <Route path="/leaderboard" element={<NewShell user={auth.user}><NewLeaderboardPage /></NewShell>} />
        <Route path="/shop" element={<NewShell user={auth.user}><NewShopPage /></NewShell>} />
        <Route path="/store" element={<Navigate to="/shop" replace />} />
        <Route path="/pricing" element={<NewShell user={auth.user}><NewPricingPage /></NewShell>} />
        <Route path="/subscriptions" element={<NewShell user={auth.user}><NewPricingPage /></NewShell>} />
        <Route path="/shared-streak" element={<NewShell user={auth.user}><NewSharedStreakPage /></NewShell>} />
        <Route path="/profile" element={<NewShell user={auth.user}><NewProfilePage /></NewShell>} />
        <Route path="*" element={<NewShell user={auth.user}><NotFoundPage /></NewShell>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return <AppRoutes />;
}
