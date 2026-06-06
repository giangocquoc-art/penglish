# P-English Current Web Audit Report

## 1. Workspace Confirmation

- Current working directory đã kiểm tra: `c:\Users\PC\OneDrive\P-English\Luyen-Tu`
- Workspace yêu cầu: `C:\Users\PC\OneDrive\P-English\Luyen-Tu`
- Kết luận: MATCH, đúng workspace.
- Relative project path: `.`
- Phạm vi thay đổi: chỉ tạo/overwrite đúng file report `docs/P_ENGLISH_CURRENT_WEB_AUDIT_REPORT.md`; không chỉnh source code, package, lockfile, config, CSS hoặc env.

## 2. Package Manager And Scripts

- Package manager: npm.
- Bằng chứng: có `package-lock.json`, root `package.json` dùng npm workspaces `apps/*`.

Root package:

- Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\package.json`
- Relative project path: `package.json`
- Scripts hiện có:
  - `dev:api`: `npm run dev -w @pshare/api`
  - `dev:web`: `npm run dev -w @pshare/web`
  - `build`: `npm run build -w @pshare/api && npm run build -w @pshare/web`
  - `start:api`: `npm run start -w @pshare/api`
  - `start:web`: `npm run preview -w @pshare/web`

Web package:

- Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\package.json`
- Relative project path: `apps/web/package.json`
- Scripts hiện có:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`

Correct commands:

- Correct dev command from root: `npm run dev:web`
- Correct dev command with host binding: `npm run dev:web -- --host 0.0.0.0`
- Correct web-only dev command alternatives:
  - `npm run dev -w @pshare/web`
  - `npm --prefix apps/web run dev`
- Correct production build command from root: `npm run build`
- Correct web-only build alternatives:
  - `npm run build -w @pshare/web`
  - `npm --prefix apps/web run build`
- Correct production preview command from root: `npm run start:web`
- Correct web-only preview alternatives:
  - `npm run preview -w @pshare/web`
  - `npm --prefix apps/web run preview`
- Correct typecheck command: `npx tsc -p apps/web/tsconfig.json --noEmit`
- Lint command: không thấy script lint.
- Test command: không thấy script test.

Why `npm run dev` from root failed:

- Root `package.json` không có script tên `dev`.
- Root chỉ có `dev:api` và `dev:web`.
- Vì vậy chạy `npm run dev` ở root sẽ báo lỗi thiếu script và gợi ý dùng `npm run` để xem danh sách scripts.

Commands used to list scripts:

- `npm run`: PASS, liệt kê root scripts `dev:api`, `dev:web`, `build`, `start:api`, `start:web`.
- `npm --prefix apps/web run`: PASS, liệt kê web scripts `dev`, `build`, `preview`.
- `npm run --workspace apps/web`: PASS, cũng liệt kê scripts của workspace `@pshare/web`.

## 3. Important Project Structure

Important files/folders:

1. Root package
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\package.json`
   - Relative project path: `package.json`
   - Purpose: npm workspace config và root scripts.

2. Root lockfile
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\package-lock.json`
   - Relative project path: `package-lock.json`
   - Purpose: khóa dependency versions cho npm.

3. Base TypeScript config
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\tsconfig.base.json`
   - Relative project path: `tsconfig.base.json`
   - Purpose: TypeScript base config dùng chung.

4. Web package
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\package.json`
   - Relative project path: `apps/web/package.json`
   - Purpose: dependencies và scripts của web app.

5. Web HTML entry
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\index.html`
   - Relative project path: `apps/web/index.html`
   - Purpose: HTML entry, root node, loading markup, noscript content, service worker registration, external scripts.

6. Web Vite config
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\vite.config.ts`
   - Relative project path: `apps/web/vite.config.ts`
   - Purpose: Vite React config; dev server port `5173`.

7. Web TypeScript config
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\tsconfig.json`
   - Relative project path: `apps/web/tsconfig.json`
   - Purpose: TypeScript config cho web app.

8. React entry
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\main.tsx`
   - Relative project path: `apps/web/src/main.tsx`
   - Purpose: mount React app, Chakra provider, BrowserRouter, CSS imports.

9. Root app/router
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\App.tsx`
   - Relative project path: `apps/web/src/App.tsx`
   - Purpose: root component, auth hook, route definitions, app shell binding.

10. Web API client
    - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\api.ts`
    - Relative project path: `apps/web/src/api.ts`
    - Purpose: Axios instance, base URL, auth token request interceptor, refresh-token response interceptor, HTTP helper functions.

11. Main CSS
    - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\index.css`
    - Relative project path: `apps/web/src/index.css`
    - Purpose: base/loading/noscript/landing-related CSS moved from HTML.

12. Global styles
    - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\styles.css`
    - Relative project path: `apps/web/src/styles.css`
    - Purpose: broader global app CSS.

13. Pages folder
    - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\pages`
    - Relative project path: `apps/web/src/pages`
    - Purpose: route-level screens/pages.

14. Components folder
    - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\components`
    - Relative project path: `apps/web/src/components`
    - Purpose: shared layout components, UI primitives, lesson/practice components.

15. Lib folder
    - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\lib`
    - Relative project path: `apps/web/src/lib`
    - Purpose: local learning data/helpers, including P-English lesson data, progress, hearts.

16. P-English lib folder
    - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\lib\p-english`
    - Relative project path: `apps/web/src/lib/p-english`
    - Purpose: P-English learning path data, lesson content, validation, local progress, global hearts.

17. Public folder
    - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\public`
    - Relative project path: `apps/web/public`
    - Purpose: static assets, manifest, logo, service worker, shop media.

18. Routes folder
    - Absolute Windows path: not present
    - Relative project path: `apps/web/src/routes`
    - Purpose: không tồn tại hiện tại; routing đang nằm trong `apps/web/src/App.tsx`.

19. Features folder
    - Absolute Windows path: not present
    - Relative project path: `apps/web/src/features`
    - Purpose: không tồn tại hiện tại.

Important page files currently present:

- `apps/web/src/pages/AiPage.tsx`
- `apps/web/src/pages/CategoriesPage.tsx`
- `apps/web/src/pages/ChatPage.tsx`
- `apps/web/src/pages/FoldersPage.tsx`
- `apps/web/src/pages/GamesPage.tsx`
- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/pages/LandingPage.tsx`
- `apps/web/src/pages/LeaderboardPage.tsx`
- `apps/web/src/pages/LearningPathPage.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `apps/web/src/pages/LoginPage.tsx`
- `apps/web/src/pages/PracticePage.tsx`
- `apps/web/src/pages/PricingPage.tsx`
- `apps/web/src/pages/ProfilePage.tsx`
- `apps/web/src/pages/SharedStreakPage.tsx`
- `apps/web/src/pages/ShopPage.tsx`
- `apps/web/src/pages/StudyPage.tsx`
- `apps/web/src/pages/VocabPage.tsx`

Important component folders/files currently present:

- `apps/web/src/components/Sidebar.tsx`
- `apps/web/src/components/Topbar.tsx`
- `apps/web/src/components/BottomNav.tsx`
- `apps/web/src/components/MobileDrawer.tsx`
- `apps/web/src/components/DifficultyBar.tsx`
- `apps/web/src/components/EmptyState.tsx`
- `apps/web/src/components/learning/LearningHeartsBadge.tsx`
- `apps/web/src/components/lesson/RevealAnswer.tsx`
- `apps/web/src/components/practice/LessonFlashcardPractice.tsx`
- `apps/web/src/components/practice/LessonListeningPractice.tsx`
- `apps/web/src/components/practice/LessonMatchPractice.tsx`
- `apps/web/src/components/practice/LessonQuizPractice.tsx`
- `apps/web/src/components/practice/LessonReflexPractice.tsx`
- `apps/web/src/components/practice/LessonSpeedPractice.tsx`
- `apps/web/src/components/practice/LessonTypingPractice.tsx`

## 4. Tech Stack

- Framework: React 18.
- Build tool: Vite 5.
- Language: TypeScript.
- UI library: Chakra UI.
- CSS approach:
  - Chakra UI props/theme.
  - Plain CSS imports through `apps/web/src/index.css` and `apps/web/src/styles.css`.
  - Chakra theme in `apps/web/src/theme.ts`.
- Routing approach:
  - `BrowserRouter` in `apps/web/src/main.tsx`.
  - `Routes`/`Route` definitions in `apps/web/src/App.tsx`.
  - No separate `apps/web/src/routes` folder currently.
- State management:
  - Mainly React hooks/local state.
  - LocalStorage for auth tokens, current user, lesson progress, learning hearts.
  - No Redux/Zustand/MobX detected.
- API/data layer:
  - Axios in `apps/web/src/api.ts`.
  - Helper functions: `get`, `post`, `patch`, `put`, `del`.
  - Request interceptor reads `accessToken` from localStorage.
  - Response interceptor refreshes with `refreshToken` on `401`.
- Auth integrations:
  - Profile endpoint `/auth/profile`.
  - Refresh endpoint `/auth/refresh`.
  - Google auth link uses env variable name `VITE_API_URL` with source fallback to local API.
- Payment integrations:
  - PayOS checkout external script in `apps/web/index.html`.
  - Pricing/subscription route/page in `apps/web/src/pages/PricingPage.tsx`.
- Service worker/PWA:
  - `apps/web/public/sw.js`
  - `apps/web/public/manifest.json`
  - Service worker registration script in `apps/web/index.html`.
- Env variable names observed:
  - `VITE_API_URL`
- No secrets, tokens, API keys, private keys, passwords, or full `.env` values are printed in this report.

## 5. Render Flow

1. HTML entry file:
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\index.html`
   - Relative project path: `apps/web/index.html`
   - Contains root DOM node `#root` and module script `/src/main.tsx`.

2. TS/JS entry file:
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\main.tsx`
   - Relative project path: `apps/web/src/main.tsx`
   - Mounts React into `#root`.
   - Wraps app with `React.StrictMode`, `ColorModeScript`, `ChakraProvider`, `BrowserRouter`.
   - Imports `App`, `theme`, `index.css`, `styles.css`.

3. Root component:
   - Absolute Windows path: `C:\Users\PC\OneDrive\P-English\Luyen-Tu\apps\web\src\App.tsx`
   - Relative project path: `apps/web/src/App.tsx`
   - `App` returns `AppRoutes`.

4. Router starting point:
   - `BrowserRouter`: `apps/web/src/main.tsx`
   - Route definitions: `apps/web/src/App.tsx`

5. Main layouts:
   - `NewShell` in `apps/web/src/App.tsx`
   - `Shell`/`Topbar` in `apps/web/src/components/Topbar.tsx`
   - `Sidebar` in `apps/web/src/components/Sidebar.tsx`
   - Mobile navigation-related components in `apps/web/src/components/BottomNav.tsx` and `apps/web/src/components/MobileDrawer.tsx`

6. Main pages/screens:
   - Landing, Login/Callback, Home, Learning Path, Study, Lesson, Categories, Vocabulary, Games, Practice, Folders, Chat, AI, Leaderboard, Shop, Pricing, Shared Streak, Profile.

## 6. Current UI Areas

1. Landing page
   - URL route: `/`
   - Main files: `apps/web/src/pages/LandingPage.tsx`, `apps/web/index.html`, `apps/web/src/index.css`
   - Important components: landing page sections, global shell not required for public landing.
   - Estimated completeness: medium/high
   - Notes: likely usable; should capture desktop/mobile screenshots to verify layout and CTA hierarchy.

2. Login
   - URL routes: `/login`, `/login/callback`
   - Main files: `apps/web/src/pages/LoginPage.tsx`, `apps/web/src/api.ts`, `apps/web/src/App.tsx`
   - Important components: login page, callback handler, auth hook, Google auth link.
   - Estimated completeness: medium
   - Notes: frontend flow exists; needs real backend/OAuth validation.

3. Home/Dashboard
   - URL route: `/home`
   - Main files: `apps/web/src/pages/HomePage.tsx`, `apps/web/src/components/Sidebar.tsx`, `apps/web/src/components/Topbar.tsx`
   - Important components: app shell, course/path cards, navigation.
   - Estimated completeness: medium/high
   - Notes: main dashboard appears structured; weak point to verify is mobile responsiveness and empty/loading states.

4. Learning path
   - URL route: `/learning-path`
   - Main files: `apps/web/src/pages/LearningPathPage.tsx`, `apps/web/src/lib/p-english/learning-path-data.ts`
   - Important components: learning path UI, unit/lesson cards, shell navigation.
   - Estimated completeness: medium/high for current content
   - Notes: likely strong for Unit 1; future Unit 2+ content needs gradual extension.

5. Lesson screen
   - URL route: `/lessons/:lessonId`
   - Main files: `apps/web/src/pages/LessonPage.tsx`, `apps/web/src/lib/p-english/lesson-content-data.ts`, `apps/web/src/components/lesson/RevealAnswer.tsx`
   - Important components: lesson sections, vocabulary grid, sentence patterns, dialogues, pronunciation, preview cards, lesson progress dashboard, smart review.
   - Estimated completeness: high for existing Unit 1 lesson content, medium overall
   - Notes: lesson reading is robust; practice CTA/hearts lock behavior should be regression-tested when adding new lessons.

6. Practice screen
   - URL route: `/practice`
   - Main files: `apps/web/src/pages/PracticePage.tsx`, `apps/web/src/components/practice/*`, `apps/web/src/lib/p-english/learning-hearts.ts`, `apps/web/src/lib/p-english/lesson-progress.ts`
   - Important components: flashcard, quiz, listening, reflex, typing, match, speed practice modes.
   - Estimated completeness: high for implemented Unit 1 engines, medium overall
   - Notes: many mode implementations exist; weak point is end-to-end QA across wrong-answer hearts, progress updates, and mobile layout.

7. Pricing/payment
   - URL routes: `/pricing`, `/subscriptions`
   - Main files: `apps/web/src/pages/PricingPage.tsx`, `apps/web/index.html`
   - Important components/integrations: subscription UI, PayOS checkout script.
   - Estimated completeness: medium/unclear
   - Notes: needs sandbox/backend validation; avoid exposing payment secrets.

8. Shop
   - URL routes: `/shop`, `/store`
   - Main files: `apps/web/src/pages/ShopPage.tsx`, `apps/web/public/assets/shop`
   - Important components: item list, purchase/equip/unequip/daily reward/custom upload actions.
   - Estimated completeness: medium
   - Notes: UI and assets exist; weak point is API/data validation for inventory and purchase states.

9. Profile
   - URL route: `/profile`
   - Main files: `apps/web/src/pages/ProfilePage.tsx`, `apps/web/src/App.tsx`, `apps/web/src/api.ts`
   - Important components: profile display, logout/auth cleanup.
   - Estimated completeness: medium
   - Notes: basic profile/logout exists; deeper settings/preferences are unclear.

10. Vocabulary/Categories/Folders
    - URL routes: `/vocabularies`, `/words`, `/categories`, `/category-list`, `/folders`
    - Main files: `apps/web/src/pages/VocabPage.tsx`, `apps/web/src/pages/CategoriesPage.tsx`, `apps/web/src/pages/FoldersPage.tsx`
    - Important components: API-backed list/create/update flows.
    - Estimated completeness: medium
    - Notes: likely needs stronger empty/error/loading-state QA.

11. Games
    - URL route: `/games`
    - Main file: `apps/web/src/pages/GamesPage.tsx`
    - Important components: older game/practice interactions in page.
    - Estimated completeness: medium
    - Notes: may overlap with newer lesson practice engines; should avoid broad refactor and only polish if selected.

12. Chat/AI
    - URL routes: `/chat`, `/ai`
    - Main files: `apps/web/src/pages/ChatPage.tsx`, `apps/web/src/pages/AiPage.tsx`
    - Important components: message/AI generation UI and API calls.
    - Estimated completeness: medium/unclear
    - Notes: depends on backend behavior; test failure states.

13. Leaderboard/Shared streak
    - URL routes: `/leaderboard`, `/shared-streak`
    - Main files: `apps/web/src/pages/LeaderboardPage.tsx`, `apps/web/src/pages/SharedStreakPage.tsx`
    - Important components: leaderboard UI, streak/invite flow.
    - Estimated completeness: medium
    - Notes: likely needs API-backed data validation and not-logged-in behavior checks.

## 7. Typecheck And Build Results

1. Command: `npx tsc -p apps/web/tsconfig.json --noEmit`
   - Exit code: 0
   - PASS/FAIL: PASS
   - Important log excerpt if failed: not applicable; no TypeScript errors printed.

2. Command: `npm run build`
   - Exit code: 0
   - PASS/FAIL: PASS
   - Important success excerpt:
     - Root build ran API build then web build.
     - API build: `tsc -p tsconfig.json`
     - Web build: `vite build`
     - Vite transformed `2680 modules`.
     - Output included `dist/index.html`, CSS bundle, JS bundle.
   - Warning:
     - Some chunks are larger than `500 kB` after minification.
     - Suggested future improvement: route-level `dynamic import()`/code splitting, but not required for successful build.

Additional environment commands previously checked:

- `node -v`: exit code 0, PASS, output `v24.15.0`
- `npm -v`: exit code 0, PASS, output `11.12.1`

## 8. How To Run Locally

Exact dev server command from root:

```bat
npm run dev:web
```

Exact dev server command from root with host binding:

```bat
npm run dev:web -- --host 0.0.0.0
```

Equivalent web workspace commands:

```bat
npm run dev -w @pshare/web
```

```bat
npm --prefix apps/web run dev
```

Exact local URL:

```text
http://localhost:5173/
```

Port note:

- `apps/web/vite.config.ts` sets Vite dev server port to `5173`.
- The currently running terminal also reports Vite local URL as `http://localhost:5173/`.

Production build command:

```bat
npm run build
```

Production preview command from root:

```bat
npm run start:web
```

Equivalent preview commands:

```bat
npm run preview -w @pshare/web
```

```bat
npm --prefix apps/web run preview
```

Preview URL:

- Vite preview normally prints the exact URL in terminal when started.
- Default Vite preview is often `http://localhost:4173/` unless configured otherwise.

## 9. Screenshot Plan

Playwright availability:

- Playwright is listed in root `package.json` devDependencies.
- Browser automation/screenshot command can be used in a task that allows creating screenshot files.

Current dev URL to open:

```text
http://localhost:5173/
```

First screens to capture:

1. Landing page
   - URL: `http://localhost:5173/`

2. Login page
   - URL: `http://localhost:5173/login`

3. Home/Dashboard
   - URL: `http://localhost:5173/home`

4. Learning path
   - URL: `http://localhost:5173/learning-path`

5. Lesson screen
   - URL: `http://localhost:5173/lessons/<lessonId>`
   - Note: replace `<lessonId>` with a valid lesson id from P-English lesson data.

6. Practice screen
   - URL: `http://localhost:5173/practice`

7. Pricing/payment
   - URL: `http://localhost:5173/pricing`

8. Shop
   - URL: `http://localhost:5173/shop`

9. Profile
   - URL: `http://localhost:5173/profile`

Example Playwright screenshot command if creating files is allowed:

```bat
npx playwright screenshot http://localhost:5173/ reports/screenshots/current-landing.png
```

Suggested screenshot set if allowed later:

```bat
npx playwright screenshot http://localhost:5173/login reports/screenshots/current-login.png
npx playwright screenshot http://localhost:5173/home reports/screenshots/current-home.png
npx playwright screenshot http://localhost:5173/learning-path reports/screenshots/current-learning-path.png
npx playwright screenshot http://localhost:5173/practice reports/screenshots/current-practice.png
npx playwright screenshot http://localhost:5173/pricing reports/screenshots/current-pricing.png
npx playwright screenshot http://localhost:5173/shop reports/screenshots/current-shop.png
npx playwright screenshot http://localhost:5173/profile reports/screenshots/current-profile.png
```

## 10. Recommended Next Small Tasks

1. Improve responsive shell navigation only
   - UI area: Home/Dashboard shell.
   - Scope: capture and fix desktop/mobile issues in `apps/web/src/components/Sidebar.tsx`, `apps/web/src/components/Topbar.tsx`, `apps/web/src/components/BottomNav.tsx` for `/home` only.
   - Do not refactor routing or redesign the full app.

2. QA and polish Practice screen hearts/progress feedback only
   - UI area: Practice screen.
   - Scope: test `/practice` and one lesson practice mode, then adjust only visible feedback/empty/locked states if needed.
   - Related files: `apps/web/src/pages/PracticePage.tsx`, `apps/web/src/components/practice/*`, `apps/web/src/lib/p-english/learning-hearts.ts`.

3. Add one small Unit 2 lesson slice only
   - UI area: Learning path/Lesson screen.
   - Scope: add one lesson or one vocabulary group from `docs/P_ENGLISH_UNIT_2_CONTENT_PLAN.md` into P-English lesson data, then verify `/learning-path` and one `/lessons/:lessonId` page.
   - Avoid broad data model changes or whole learning system refactors.
