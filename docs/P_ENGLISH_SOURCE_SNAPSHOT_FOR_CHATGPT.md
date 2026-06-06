# P-English — Source snapshot gửi ChatGPT

File này chỉ chứa excerpt ngắn, đủ để tiếp tục thiết kế/render bài học Unit 1 mà không cần gửi toàn bộ codebase.

## 1. Lesson model — `apps/web/src/lib/p-english/lesson-content-data.ts`

```ts
export type LessonLevel = 'Beginner / A1' | 'Elementary / A2' | 'Intermediate / B1' | 'Upper-intermediate / B2' | 'Advanced / C1';
export type SkillTag = 'Từ vựng' | 'Phản xạ' | 'Nghe' | 'Nói' | 'Ôn tập' | 'Ngữ pháp' | 'Đọc' | 'Viết';
export type LessonDifficulty = 'easy' | 'medium' | 'hard';
export type QuizQuestionType = 'multiple-choice' | 'fill-blank' | 'sentence-order' | 'match-meaning';

export type VocabularyItem = {
  id: string;
  term: string;
  pronunciation?: string;
  meaningVi: string;
  partOfSpeechOrType: string;
  example: string;
  exampleMeaningVi: string;
  difficulty: Extract<LessonDifficulty, 'easy' | 'medium'>;
  tags: string[];
};

export type EnglishLesson = {
  id: string;
  unitId: string;
  unitTitle: string;
  titleVi: string;
  titleEn: string;
  subtitle: string;
  level: LessonLevel;
  estimatedTime: string;
  skillTags: SkillTag[];
  learningObjectives: string[];
  vocabulary: VocabularyItem[];
  sentencePatterns: SentencePattern[];
  miniDialogues: MiniDialogue[];
  grammarNotes: GrammarNote[];
  pronunciationNotes: PronunciationNote[];
  listeningPractice: ListeningPracticeItem[];
  speakingReflexPrompts: SpeakingReflexPrompt[];
  flashcards: FlashcardItem[];
  quizQuestions: QuizQuestion[];
  sentenceOrderingTasks: SentenceOrderingTask[];
  fillBlankTasks: FillBlankTask[];
  reviewRules: ReviewRules;
  completionCriteria: CompletionCriteria;
};
```

Unit 1 summary:

```ts
{
  id: 'unit-1-greetings-introduction',
  unitId: 'unit-1-greetings',
  unitTitle: 'Unit 1 — Chào hỏi và giới thiệu bản thân',
  titleVi: 'Chào hỏi và giới thiệu bản thân',
  titleEn: 'Greetings and Self-introduction',
  level: 'Beginner / A1',
  estimatedTime: '15–20 phút',
  skillTags: ['Từ vựng', 'Phản xạ', 'Nghe', 'Nói', 'Ôn tập'],
  vocabulary: 18 items,
  sentencePatterns: 5,
  miniDialogues: 3,
  grammarNotes: 4,
  pronunciationNotes: 5,
  listeningPractice: 3,
  speakingReflexPrompts: 8,
  flashcards: 18,
  quizQuestions: 10,
  sentenceOrderingTasks: 3,
  fillBlankTasks: 3
}
```

Helpers:

```ts
export function getLessonById(id: string): EnglishLesson | undefined {
  return pEnglishLessons.find((lesson) => lesson.id === id);
}

export function getLessonsByUnitId(unitId: string): EnglishLesson[] {
  return pEnglishLessons.filter((lesson) => lesson.unitId === unitId);
}
```

## 2. Learning path local data — `apps/web/src/lib/p-english/learning-path-data.ts`

```ts
export type LearningPathUnit = {
  id: string;
  title: string;
  description: string;
  skillType: LearningSkillType;
  estimatedTime: string;
  progress: number;
  status: LearningUnitStatus;
  xp: number;
  reviewDue: number;
  lessonId?: string;
  lessonCount?: number;
  primarySkills?: LearningSkillType[];
  ctaLabel?: string;
};
```

Unit 1 connection:

```ts
{
  id: 'unit-1-greetings',
  title: 'Unit 1: Chào hỏi và giới thiệu bản thân',
  description: 'Làm quen với câu chào, nói tên, hỏi tên và giới thiệu bản thân ở mức A1.',
  skillType: 'Từ vựng',
  estimatedTime: '15–20 phút',
  progress: 100,
  status: 'Hoàn thành',
  xp: 60,
  reviewDue: 3,
  lessonId: 'unit-1-greetings-introduction',
  lessonCount: 1,
  primarySkills: ['Từ vựng', 'Phản xạ', 'Nghe', 'Ôn tập'],
  ctaLabel: 'Học bài 1',
}

export const learningPathLessonMap: Record<string, string[]> = {
  'unit-1-greetings': ['unit-1-greetings-introduction'],
};
```

## 3. Router — `apps/web/src/App.tsx`

Current active routes excerpt:

```tsx
function AppRoutes() {
  const auth = useAuth();
  const { loading } = auth;
  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;
  return (
    <Routes>
      <Route path="/" element={<NewLandingPage />} />
      <Route path="/login" element={auth.user ? <Navigate to="/home" replace /> : <NewLoginPage />} />
      <Route path="/login/callback" element={<NewLoginCallbackPage />} />
      <Route path="/home" element={<NewShell user={auth.user}><NewHomePage /></NewShell>} />
      <Route path="/paths/:id" element={<NewShell user={auth.user}><NewStudyPage /></NewShell>} />
      <Route path="/categories" element={<NewShell user={auth.user}><NewCategoriesPage /></NewShell>} />
      <Route path="/category-list" element={<NewShell user={auth.user}><NewCategoriesPage /></NewShell>} />
      <Route path="/vocabularies" element={<NewShell user={auth.user}><NewVocabPage /></NewShell>} />
      <Route path="/words" element={<NewShell user={auth.user}><NewVocabPage /></NewShell>} />
      <Route path="/games" element={<NewShell user={auth.user}><NewGamesPage /></NewShell>} />
      <Route path="/practice" element={<NewShell user={auth.user}><NewPracticePage /></NewShell>} />
      <Route path="/folders" element={<NewShell user={auth.user}><NewFoldersPage /></NewShell>} />
      <Route path="/chat" element={<NewShell user={auth.user}><NewChatPage /></NewShell>} />
      <Route path="/ai" element={<NewShell user={auth.user}><NewAiPage /></NewShell>} />
      <Route path="/leaderboard" element={<NewShell user={auth.user}><NewLeaderboardPage /></NewShell>} />
      <Route path="/shop" element={<NewShell user={auth.user}><NewShopPage /></NewShell>} />
      <Route path="/store" element={<NewShell user={auth.user}><NewShopPage /></NewShell>} />
      <Route path="/pricing" element={<NewShell user={auth.user}><NewPricingPage /></NewShell>} />
      <Route path="/subscriptions" element={<NewShell user={auth.user}><NewPricingPage /></NewShell>} />
      <Route path="/shared-streak" element={<NewShell user={auth.user}><NewSharedStreakPage /></NewShell>} />
      <Route path="/profile" element={<NewShell user={auth.user}><NewProfilePage /></NewShell>} />
      <Route path="*" element={<Shell user={auth.user}><SimpleTextPage title="Không tìm thấy" note="Route chưa có." /></Shell>} />
    </Routes>
  );
}
```

Important: No active `/lessons/:lessonId` route in current source.

## 4. API client — `apps/web/src/api.ts`

```ts
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export async function get<T>(path: string) {
  return api.get<T>(path).then((r) => r.data as T);
}

export async function post<T>(path: string, body?: unknown) {
  return api.post<T>(path, body).then((r) => r.data as T);
}

export async function patch<T>(path: string, body?: unknown) {
  return api.patch<T>(path, body).then((r) => r.data as T);
}

export async function put<T>(path: string, body?: unknown) {
  return api.put<T>(path, body).then((r) => r.data as T);
}

export async function del<T>(path: string, body?: unknown) {
  return api.delete<T>(path, { data: body }).then((r) => r.data as T);
}
```

## 5. HomePage entry point — `apps/web/src/pages/HomePage.tsx`

```tsx
useEffect(() => {
  get<Group[]>('/paths/groups').then(setGroups).catch(() => {});
  get<PathItem[]>('/paths/summary').then(setPaths).catch(() => {});
}, []);
```

Path cards currently link to API path detail:

```tsx
{groupPaths.map((p) => (
  <Link key={p.id} to={`/paths/${p.id}`}>
    <Box>{/* path card */}</Box>
  </Link>
))}
```

## 6. StudyPage — `apps/web/src/pages/StudyPage.tsx`

```tsx
const { id } = useParams<{ id: string }>();

useEffect(() => {
  if (!id) return;
  get<Path>(`/paths/${id}`).then((r: any) => setPath(r?.data ?? r)).catch(() => {});
  get<Word[]>(`/word-sets/${id}/vocabularies`).then((r: any) => {
    setWords(Array.isArray(r) ? r : r?.data ?? []);
  }).catch(() => {});
}, [id]);
```

Current word shape:

```ts
type Word = {
  id: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  learned?: boolean;
  srsLevel?: number;
};
```

## 7. PracticePage — `apps/web/src/pages/PracticePage.tsx`

Mode list:

```tsx
const GAMES: GameDef[] = [
  { id: 'flashcard', name: 'Flashcard', desc: 'Lật thẻ ghi nhớ từ vựng', icon: BookOpen, iconBg: 'green.50', iconColor: 'green.500', reward: 5 },
  { id: 'quiz', name: 'Trắc nghiệm', desc: 'Chọn đáp án đúng', icon: HelpCircle, iconBg: 'blue.50', iconColor: 'blue.500', reward: 5 },
  { id: 'listen', name: 'Nghe', desc: 'Luyện nghe phát âm', icon: Headphones, iconBg: 'purple.50', iconColor: 'purple.500', reward: 10 },
  { id: 'type', name: 'Gõ từ', desc: 'Luyện chính tả', icon: PenTool, iconBg: 'orange.50', iconColor: 'orange.500', reward: 10 },
  { id: 'match', name: 'Ghép cặp', desc: 'Ghép từ với nghĩa', icon: Target, iconBg: 'pink.50', iconColor: 'pink.500', reward: 5 },
  { id: 'speed', name: 'Tốc độ', desc: 'Trả lời nhanh nhất có thể', icon: Zap, iconBg: 'red.50', iconColor: 'red.500', reward: 10 },
];
```

Fetches:

```tsx
get<any>('/categories').then(...);
get<any>('/vocabularies/stats').then(...);
```

Selected mode currently shows placeholder:

```tsx
<Text fontSize="2xl" fontWeight="800">Đang khởi động {game?.name ?? ''}...</Text>
```

## 8. GamesPage — `apps/web/src/pages/GamesPage.tsx`

Game list:

```tsx
const GAMES: Game[] = [
  { id: 'memory', name: 'Memory Match', desc: 'Lật thẻ tìm cặp từ - nghĩa', icon: Target, tint: 'pink.500', bg: 'pink.50', difficulty: 'Dễ' },
  { id: 'scramble', name: 'Word Scramble', desc: 'Xếp lại chữ cái thành từ đúng', icon: Shuffle, tint: 'purple.500', bg: 'purple.50', difficulty: 'Vừa' },
  { id: 'listening', name: 'Listening Challenge', desc: 'Nghe và viết lại từ vựng', icon: Headphones, tint: 'blue.500', bg: 'blue.50', difficulty: 'Khó' },
  { id: 'speed', name: 'Speed Quiz', desc: 'Trả lời nhanh trong thời gian', icon: Zap, tint: 'orange.500', bg: 'orange.50', difficulty: 'Vừa' },
  { id: 'reflex', name: 'Reflex Game', desc: 'Phản xạ với từ xuất hiện ngẫu nhiên', icon: Clock, tint: 'red.500', bg: 'red.50', difficulty: 'Khó' },
  { id: 'champion', name: 'Champion Mode', desc: 'Tổng hợp tất cả game thành 1 thử thách', icon: Trophy, tint: 'red.500', bg: 'red.50', difficulty: 'Khó' },
];
```

Selected game note:

```tsx
<Text fontSize="xs" color="gray.400">Mini-game này sẽ load từ vựng bạn đã học gần nhất.</Text>
```

## 9. VocabPage — `apps/web/src/pages/VocabPage.tsx`

```tsx
type Vocab = {
  id: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  isLearned?: boolean;
  categoryId?: string | null;
};

useEffect(() => {
  get<{ data: Vocab[] } | Vocab[]>('/vocabularies').then((r: any) => {
    setItems(Array.isArray(r) ? r : r?.data ?? []);
  }).catch(() => {});
}, []);
```

## 10. Navigation components

### `apps/web/src/components/Sidebar.tsx`

```tsx
const NAV: NavItem[] = [
  { label: 'Trang chủ', to: '/home', icon: Home, tint: '#2563EB' },
  { label: 'Từ vựng', to: '/words', icon: BookOpen, tint: '#22C55E' },
  { label: 'Luyện tập', to: '/practice', icon: Dumbbell, tint: '#2563EB' },
  { label: 'Phản xạ', to: '/games', icon: Gamepad2, tint: '#22C55E' },
  { label: 'Lộ trình', to: '/home', icon: Route, tint: '#2563EB' },
  { label: 'Xếp hạng', to: '/leaderboard', icon: Trophy, tint: '#F59E0B' },
  { label: 'Cộng đồng', to: '/chat', icon: Users, tint: '#2563EB' },
  { label: 'Hồ sơ', to: '/profile', icon: UserCircle, tint: '#64748B' },
];
```

### `apps/web/src/components/BottomNav.tsx`

```tsx
const NAV: NavItem[] = [
  { label: 'Trang chủ', to: '/home', icon: Home },
  { label: 'Bộ từ', to: '/category-list', icon: LayoutGrid },
  { label: 'Luyện tập', to: '/practice', icon: Joystick },
  { label: 'Cửa hàng', to: '/store', icon: ShoppingBag },
  { label: 'Profile', to: '/profile', icon: User },
];
```

### `apps/web/src/components/Topbar.tsx`

```tsx
export function Shell({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <Flex minH="100vh" bg="#f9fafb">
      <Box display={{ base: 'none', lg: 'flex' }}>
        {sidebar}
      </Box>
      <Box flex="1" minW="0" pb={{ base: '80px', lg: '0' }}>
        {children}
      </Box>
      <BottomNav />
    </Flex>
  );
}
```

## 13. Build status

Command:

```cmd
npm run build
```

Result:

- API build passed.
- Web build failed with known/pre-existing Vite HTML inline proxy error.

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found
```

No Vite config, `index.html`, build pipeline, app UI, app logic, backend, auth, DB, env, API key, or runtime state was changed for this audit/export task.

## 11. Backend API shape — `apps/api/src/main.ts`

`AppState` excerpt:

```ts
type AppState = {
  users: User[];
  refreshTokens: Record<string, string>;
  groups: Group[];
  paths: PathSummary[];
  pathWords: Record<string, WordItem[]>;
  categories: Category[];
  folders: { newest: Folder[]; trending: Folder[]; mine: Folder[] };
  vocabularies: Array<{ id: string; term: string; meaning: string; pronunciation?: string; partOfSpeech?: string; example?: string; isLearned: boolean; categoryId: string | null }>;
  activity: {
    currentStreak: number;
    calendar: Array<{ date: string; count: number }>;
    leaderboard: Array<{ user: { id: number; name: string; avatar: string }; activityCount: number }>;
  };
};
```

Endpoints excerpt:

```ts
app.get('/paths/groups', (_req, res) => res.json(state.groups));
app.get('/paths/summary', (_req, res) => res.json(state.paths));
app.get('/paths/:id', (req, res) => { ... });
app.get('/paths/:id/progress', (req, res) => { ... });
app.post('/paths/:id/progress', (req, res) => { ... });
app.get('/paths/:id/srs/candidates', (req, res) => { ... });
app.post('/paths/:id/srs/update', (req, res) => { ... });
app.get('/word-sets/:id/vocabularies', (req, res) => res.json(state.pathWords[req.params.id] ?? []));
app.post('/word-sets/:id/study', (req, res) => res.json({ data: { ok: true, studiedAt: new Date().toISOString(), payload: req.body ?? {} } }));
app.get('/categories', (_req, res) => res.json({ data: state.categories }));
app.get('/vocabularies', (_req, res) => res.json({ data: state.vocabularies }));
app.get('/vocabularies/stats', (_req, res) => { ... });
app.get('/activity/calendar', (_req, res) => res.json({ data: state.activity }));
app.post('/activity/log', (req, res) => { ... });
```

## 12. Small samples — `apps/api/data/state.json`

Path sample:

```json
{
  "id": "4c21b5e7-61f4-4fa1-9dba-ad11b6fb4fb9",
  "name": "Vocabulary In Use Elementary",
  "difficulty": 1,
  "wordSetCount": 50,
  "group": { "name": "Sách IELTS" }
}
```

Word sample:

```json
{
  "id": "4c21b5e7-61f4-4fa1-9dba-ad11b6fb4fb9-w1",
  "term": "Word 1",
  "meaning": "nghĩa 1",
  "pronunciation": "/word-1/",
  "partOfSpeech": "N",
  "example": "Sample 1",
  "learned": true,
  "srsLevel": 1
}
```

Category sample:

```json
{
  "id": "240684",
  "name": "Bộ từ vựng của tôi",
  "description": "Bộ từ vựng đầu tiên của bạn",
  "ispublic": false,
  "wordCount": 0,
  "user": { "name": "Quyen Tran" }
}
```

User sample:

```json
{
  "id": "pshare-demo-001",
  "name": "Pshare",
  "coin": 120,
  "streak": 2,
  "vip": true
}
```
