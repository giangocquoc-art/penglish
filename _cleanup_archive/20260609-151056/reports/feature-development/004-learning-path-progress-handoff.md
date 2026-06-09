# Task 004 handoff — Learning Path / Progress

## Primary request

Execute `tasks/penglish/004-learning-path-progress.md` exactly after reading `tasks/penglish/FEATURE-DEVELOPMENT-INDEX.md` and stop at the stop condition.

Stop condition:
- Stop after improving learning path/progress only.
- Do not start other features.

## Current progress

Completed:
- Read task/index requirements in previous context.
- Inspected primary UI/progress files.
- Created shared progress helper: `apps/web/src/lib/p-english/learning-progress-summary.ts`.
- Updated `LearningPathPage.tsx`.
- Updated `HomePage.tsx`.
- Updated `LessonPage.tsx`.
- Fixed TypeScript blockers in `learning-path-data.ts`, `gsap-utils.ts`, and `EnglishSpeedPage.tsx`.
- TypeScript check passed: `npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit`.
- Build passed: `npm.cmd run build`.
- Dev server responds at `http://localhost:5173/` (`curl.exe -I` returned HTTP 200 OK).

Still pending:
- Browser QA/screenshots. Browser currently only shows `Đang tải...` on `/home` and `/learning-path`.
- Final report: `reports/feature-development/004-learning-path-progress-report.md`.
- Stop after Task 004.

## Important QA blocker found

Browser launched:
- `http://localhost:5173/home`
- `http://localhost:5173/learning-path`

Both rendered only `Đang tải...` with no console logs.

The source was identified in `apps/web/src/App.tsx`:

```tsx
function AppRoutes() {
  const location = useLocation();
  const auth = useAuth();
  const { loading } = auth;
  const isPublicRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/login/callback';

  if (!isPublicRoute && loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  return (
    <Routes>
      <Route path="/" element={<NewLandingPage />} />
      <Route path="/login" element={loading || !auth.user ? <NewLoginPage /> : <Navigate to="/home" replace />} />
      <Route path="/login/callback" element={<NewLoginCallbackPage />} />
      <Route path="/home" element={<NewShell user={auth.user}><NewHomePage /></NewShell>} />
      <Route path="/learning-path" element={<NewShell user={auth.user}><NewLearningPathPage /></NewShell>} />
      ...
    </Routes>
  );
}
```

Likely reason: `useAuth()` calls `/auth/profile`; if API/auth does not resolve in the browser QA environment, protected routes stay in loading. Need inspect network/console with browser tooling or use a route/auth workaround if allowed. Do not start unrelated features.

## Files changed

### `apps/web/src/lib/p-english/learning-progress-summary.ts`
Created. Exports:
- `CefrBand`
- `LearningPathProgressUnit`
- `LearningPathProgressSnapshot`
- `CEFR_BANDS`
- `getLearningPathProgressSnapshot()`

Computes:
- units with summaries
- available/completed units
- completed/total lessons
- earned/total XP
- current streak
- path percentage
- estimated CEFR level
- next lesson path/title
- encouragement

### `apps/web/src/pages/LearningPathPage.tsx`
Updated to use `getLearningPathProgressSnapshot()` and `CEFR_BANDS`.
Shows:
- estimated CEFR tag
- current level metric
- completed lessons metric
- next lesson metric
- XP/streak metric
- CEFR A1/A2/B1/B2 cards
- path progress bar and encouragement
- CTAs to next lesson and dashboard

### `apps/web/src/pages/HomePage.tsx`
Updated to use shared learning path snapshot.
Important implementation:
- imports `getLearningPathProgressSnapshot`
- adds `progressVersion` state
- recomputes snapshot on `LOCAL_PROGRESS_UPDATED_EVENT`, storage, focus
- removes old `learningPathUnits`/`getCompletedLessons` next-unit logic
- existing dashboard cards now show CEFR/completed lessons and path progress
- existing “Lộ trình đang mở” card now shows encouragement/path percentage/XP/next lesson

### `apps/web/src/pages/LessonPage.tsx`
Updated `LessonProgressDashboard`:
- computes `completed = summary.overallPercentage >= 100`
- shows Vietnamese completion encouragement when complete
- shows current progress percentage
- buttons to `/learning-path` and `/home`
- next card switches to “Bước tiếp theo: xem lộ trình” when complete

### `apps/web/src/lib/p-english/learning-path-data.ts`
Fixed type:
```ts
export type LearningSkillType = 'Từ vựng' | 'Ngữ pháp' | 'Nghe' | 'Phản xạ' | 'Viết' | 'Ôn tập';
```

### `apps/web/src/lib/animations/gsap-utils.ts`
Fixed invalid GSAP type import:
```ts
import { gsap } from "gsap";

type AnimationTarget = gsap.TweenTarget;
```

### `apps/web/src/pages/EnglishSpeedPage.tsx`
Fixed literal state type:
```ts
const [timeLeft, setTimeLeft] = useState<number>(DIFFICULTIES.medium.seconds);
```

## Validation results

### TypeScript
Command:
```cmd
npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
```
Result: passed after fixes. Latest output showed no errors.

Initial errors fixed:
- `TweenTarget` not exported from GSAP.
- `'Viết'` not assignable to `LearningSkillType`.
- `EnglishSpeedPage` timeLeft inferred as literal `60`.

### Build
Command:
```cmd
npm.cmd run build
```
Result: passed.

Build output highlights:
- API `tsc -p tsconfig.json` passed.
- Web `vite build` passed.
- 2703 modules transformed.
- Built in 8.09s.
- Warning only: chunk larger than 500 kB.

### Dev server
Commands tried:
```cmd
npm.cmd run dev -w @pshare/web
cmd /c start "penglish-web" /min npm.cmd run dev -w @pshare/web
curl.exe -I http://localhost:5173/
```

Result:
- first dev command timed out because Vite remains running, but output confirmed ready at `http://localhost:5173/`.
- detached start command timed out, but `curl.exe -I http://localhost:5173/` returned HTTP 200 OK.

## Browser QA status

Attempted but blocked:
- `/home`: only `Đang tải...`, no console logs.
- `/learning-path`: only `Đang tải...`, no console logs.

Need inspect network errors in browser tooling if continuing. The protected-route loading state is probably waiting on `useAuth()`.

## Pending next step

Use browser/network tooling to inspect why `/auth/profile` loading does not resolve, or document this as QA blocker in final report if no safe workaround is available.

If continuing QA:
1. Launch `http://localhost:5173/learning-path`.
2. Inspect network requests for `/auth/profile`.
3. Inspect console.
4. If still blocked, capture screenshot showing `Đang tải...` and document blocker.

Then write final report:
`reports/feature-development/004-learning-path-progress-report.md`

Report must include:
- files changed
- UX changes
- progress/level logic summary
- screenshot paths / QA blocker screenshot if applicable
- console/network QA
- typecheck/build results
- remaining risks
- next recommended task

## Current task progress

- [x] Read task/index requirements from prior context
- [x] Inspect primary UI files from prior context
- [x] Inspect supporting progress/path helpers
- [x] Implement focused learning path/progress/dashboard updates
- [x] Run TypeScript check and build
- [ ] Run browser QA and capture screenshots
- [ ] Write Task 004 report
- [ ] Stop after learning path/progress only
