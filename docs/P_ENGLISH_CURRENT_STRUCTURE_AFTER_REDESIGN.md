# Báo cáo cấu trúc hiện tại của P-English sau redesign

Ngày audit: 2026-05-21

Phạm vi: chỉ audit/export. Không redesign UI, không đổi logic app, không thêm bài học, không xoá file, không đổi auth/backend/database/API/env.

## 1. Tổng quan kiến trúc

P-English hiện là một monorepo/workspace Node.js nằm trong thư mục `Luyen Tu`.

- Root workspace: `Luyen Tu/package.json`
- Web app: `Luyen Tu/apps/web/package.json`
- API app: `Luyen Tu/apps/api/package.json`
- Frontend: Vite 5 + React 18 + TypeScript + React Router + Chakra UI
- Backend: Express + TypeScript, dữ liệu runtime trong JSON state và có đồng bộ SQLite nội bộ
- Entry frontend: `Luyen Tu/apps/web/src/main.tsx`
- Router chính: `Luyen Tu/apps/web/src/App.tsx`
- Shell/layout chính hiện dùng Chakra: `Luyen Tu/apps/web/src/components/Topbar.tsx`, `Luyen Tu/apps/web/src/components/Sidebar.tsx`, `Luyen Tu/apps/web/src/components/BottomNav.tsx`
- Theme Chakra: `Luyen Tu/apps/web/src/theme.ts`
- CSS legacy/global: `Luyen Tu/apps/web/src/styles.css`
- API client frontend: `Luyen Tu/apps/web/src/api.ts`

## 2. Cấu trúc thư mục quan trọng

| Khu vực | Đường dẫn | Vai trò |
|---|---|---|
| Root scripts | `Luyen Tu/package.json` | Chạy workspace scripts như dev/build |
| Web app | `Luyen Tu/apps/web` | React/Vite UI |
| Web pages | `Luyen Tu/apps/web/src/pages` | Các màn hình chính |
| Web components | `Luyen Tu/apps/web/src/components` | Sidebar, topbar, bottom nav, empty state |
| Web local content | `Luyen Tu/apps/web/src/lib/p-english` | Dữ liệu local/mock liên quan P-English |
| API app | `Luyen Tu/apps/api` | Express backend |
| API main | `Luyen Tu/apps/api/src/main.ts` | Endpoints, seed/state logic |
| Runtime data | `Luyen Tu/apps/api/data/state.json` | Dữ liệu groups, paths, pathWords, vocabularies, users, activity, shop |
| Docs | `Luyen Tu/docs` | Tài liệu audit/plan |

## 3. Router và pages hiện có

Router chính được khai báo trong `Luyen Tu/apps/web/src/App.tsx`. Các route đang audit được render qua `NewShell` trừ landing/login/callback/fallback.

| Route/path | File/page chính | Title/chức năng nhìn thấy | Sections/actions chính | Trạng thái usability | Cần content? |
|---|---|---|---|---|---|
| `/` | `Luyen Tu/apps/web/src/pages/LandingPage.tsx` qua `NewLandingPage` | Landing page | CTA đăng nhập/đi vào app | Có thể dùng | Có, nếu muốn tối ưu landing/copy |
| `/login` | `Luyen Tu/apps/web/src/pages/LoginPage.tsx` qua `NewLoginPage` | Đăng nhập | Login/redirect nếu có user | Có thể dùng | Không phải entry point bài học |
| `/login/callback` | `Luyen Tu/apps/web/src/App.tsx` qua `NewLoginCallbackPage` | Callback auth | Xử lý callback | Logic auth, không đụng | Không |
| `/home` | `Luyen Tu/apps/web/src/pages/HomePage.tsx` | Trang chủ/dashboard học tập | Hero, stats, streak, quick actions, lộ trình học | Có thể dùng nhưng còn một số text/brand legacy cần audit riêng | Có, cần dữ liệu lộ trình/unit tốt hơn |
| `/paths/:id` | `Luyen Tu/apps/web/src/pages/StudyPage.tsx` | Chi tiết lộ trình/word set | Breadcrumb, hero path, stats, progress, vocab cards, CTA luyện tập | Có thể dùng | Có, đây là entry point nội dung bài học/từ vựng |
| `/categories` | `Luyen Tu/apps/web/src/pages/CategoriesPage.tsx` | Bộ từ vựng/categories | Search, tabs Của tôi/Khám phá, category cards | Có thể dùng; card link tới `/categories/:id` nhưng route chi tiết chưa thấy khai báo | Có |
| `/category-list` | `Luyen Tu/apps/web/src/pages/CategoriesPage.tsx` | Alias bộ từ vựng | Giống `/categories` | Có thể dùng | Có |
| `/vocabularies` | `Luyen Tu/apps/web/src/pages/VocabPage.tsx` | Từ vựng | Search, filter all/learned/new, table, nút Thêm từ | Có thể dùng; action thêm từ chưa thấy flow rõ | Có |
| `/words` | `Luyen Tu/apps/web/src/pages/VocabPage.tsx` | Alias Từ vựng | Giống `/vocabularies` | Có thể dùng | Có |
| `/games` | `Luyen Tu/apps/web/src/pages/GamesPage.tsx` | Phản xạ/game | Danh sách mini-game, màn hình detail placeholder | Chủ yếu placeholder cho game thật | Có, cần game logic/content |
| `/practice` | `Luyen Tu/apps/web/src/pages/PracticePage.tsx` | Luyện tập | Game mode cards, stats, category selector, start placeholder | Một phần placeholder | Có, cần bài practice/flashcard/quiz thật |
| `/folders` | `Luyen Tu/apps/web/src/pages/FoldersPage.tsx` | Folders | Quản lý thư mục | Có thể dùng | Không ưu tiên bài học |
| `/chat` | `Luyen Tu/apps/web/src/pages/ChatPage.tsx` | Cộng đồng/chat | Chọn kênh/community | Có thể dùng | Không phải lesson content |
| `/ai` | `Luyen Tu/apps/web/src/pages/AiPage.tsx` | AI | Trang AI | Chưa audit sâu | Có thể cần prompt/content riêng sau |
| `/leaderboard` | `Luyen Tu/apps/web/src/pages/LeaderboardPage.tsx` | Xếp hạng | Leaderboard/activity | Có thể dùng | Cần dữ liệu XP nếu muốn cạnh tranh thật |
| `/shop` | `Luyen Tu/apps/web/src/pages/ShopPage.tsx` | Cửa hàng | Shop items | Có thể dùng | Không ưu tiên bài học |
| `/store` | `Luyen Tu/apps/web/src/pages/ShopPage.tsx` | Alias cửa hàng | Giống `/shop` | Có thể dùng | Không ưu tiên bài học |
| `/pricing` | `Luyen Tu/apps/web/src/pages/PricingPage.tsx` | Pricing/Pro | Upgrade Pro | Có thể dùng | Không |
| `/subscriptions` | `Luyen Tu/apps/web/src/pages/PricingPage.tsx` | Alias pricing | Giống `/pricing` | Có thể dùng | Không |
| `/shared-streak` | `Luyen Tu/apps/web/src/pages/SharedStreakPage.tsx` | Shared streak | Chia sẻ streak | Có thể dùng | Không |
| `/profile` | `Luyen Tu/apps/web/src/pages/ProfilePage.tsx` | Hồ sơ | User profile/stats | Có thể dùng | Cần dữ liệu progress/streak nếu mở rộng |
| `*` | `Luyen Tu/apps/web/src/App.tsx` legacy `Shell` | Không tìm thấy | Text route chưa có | Fallback | Không |

## 4. Layout/navigation hiện tại

### 4.1 Desktop sidebar

File: `Luyen Tu/apps/web/src/components/Sidebar.tsx`

Nav desktop hiện có các item:

| Label | Path | Vai trò |
|---|---|---|
| Trang chủ | `/home` | Dashboard chính |
| Từ vựng | `/words` | Bảng từ vựng |
| Luyện tập | `/practice` | Practice modes/flashcard/quiz |
| Phản xạ | `/games` | Mini-game/reflex |
| Lộ trình | `/home` | Hiện trỏ về Home, chưa có route riêng `/learning-path` |
| Xếp hạng | `/leaderboard` | Leaderboard |
| Cộng đồng | `/chat` | Community/chat |
| Hồ sơ | `/profile` | Profile |

Ghi chú: Desktop sidebar đang hiển thị brand `P-English` và subtitle `Học tiếng Anh mỗi ngày`. Item `Lộ trình` hiện là CTA quay về `/home`, vì lộ trình đang nằm trong section Home chứ chưa có route riêng.

### 4.2 Mobile bottom nav

File: `Luyen Tu/apps/web/src/components/BottomNav.tsx`

Nav mobile hiện có:

| Label | Path | Vai trò |
|---|---|---|
| Trang chủ | `/home` | Dashboard |
| Bộ từ | `/category-list` | Categories |
| Luyện tập | `/practice` | Practice |
| Cửa hàng | `/store` | Shop |
| Profile | `/profile` | Profile |

Ghi chú: Mobile bottom nav chưa đồng bộ hoàn toàn với hướng học tập ưu tiên vì còn `Cửa hàng` và label `Profile` tiếng Anh.

### 4.3 Topbar/header

File: `Luyen Tu/apps/web/src/components/Topbar.tsx`

Topbar hiện có:

- Mobile drawer toggle
- Streak chip hiển thị số ngày streak
- Button `NÂNG CẤP PRO` nếu user chưa Pro
- User/avatar area
- BottomNav được nhúng trong shell cho mobile

### 4.4 Quick access cards/CTA học tập

File: `Luyen Tu/apps/web/src/pages/HomePage.tsx`

Quick actions hiện có:

| Label | Path | Mô tả |
|---|---|---|
| Thêm từ | `/words?action=new` | Tạo từ vựng cá nhân |
| Luyện tập | `/practice` | Flashcard & Games |
| Xếp hạng | `/leaderboard` | Xem thành tích |
| Cộng đồng | `/chat` | Chọn Fb hoặc Zalo |

CTA học tập chính còn nằm ở Home section `LỘ TRÌNH HỌC`, với các path card dẫn tới `/paths/:id`.

## 5. Learning sections hiện có

| Section | File | Data source | Trạng thái |
|---|---|---|---|
| Home learning card/dashboard | `Luyen Tu/apps/web/src/pages/HomePage.tsx` | `/paths/groups`, `/paths/summary`, user stats | Có nhưng còn phụ thuộc API data |
| Lộ trình học | `Luyen Tu/apps/web/src/pages/HomePage.tsx` + `Luyen Tu/apps/web/src/pages/StudyPage.tsx` | API paths/pathWords; local mock mới ở `Luyen Tu/apps/web/src/lib/p-english/learning-path-data.ts` | Có nền tảng tốt; cần chuẩn hoá lesson/unit thật |
| Từ vựng | `Luyen Tu/apps/web/src/pages/VocabPage.tsx` | `/vocabularies` | Có bảng/search/filter |
| Flashcard | `Luyen Tu/apps/web/src/pages/PracticePage.tsx` | local `GAMES` mode + vocab/category API | Mode tồn tại nhưng flow học thật chưa hoàn chỉnh |
| Luyện tập | `Luyen Tu/apps/web/src/pages/PracticePage.tsx` | `/categories`, `/vocabularies/stats` | Có UI chọn mode/category, start placeholder |
| Phản xạ | `Luyen Tu/apps/web/src/pages/GamesPage.tsx` | local `GAMES` | Mini-game placeholder |
| Nghe | `Luyen Tu/apps/web/src/pages/PracticePage.tsx`, `Luyen Tu/apps/web/src/pages/GamesPage.tsx`, local learning path data | local mode/listening labels | Có nhãn/mode nhưng chưa có lesson listening thật |
| Xếp hạng | `Luyen Tu/apps/web/src/pages/LeaderboardPage.tsx` | API activity/leaderboard | Có thể dùng cho XP/streak |
| Hồ sơ | `Luyen Tu/apps/web/src/pages/ProfilePage.tsx` | user/activity | Có thể dùng |
| Unit/lesson cards | `Luyen Tu/apps/web/src/lib/p-english/learning-path-data.ts` | local mock | Có schema unit mock, chưa chắc đang được consume |

## 6. Content/data files và schema quan trọng

### 6.1 Runtime state/API content

File: `Luyen Tu/apps/api/data/state.json`

Các nhánh dữ liệu lớn:

- `users`: user profile, coins, xp, streak, avatar, Pro/subscription fields
- `groups`: nhóm lộ trình như THPT, IELTS, TOEIC, level, chuyên ngành
- `paths`: danh sách lộ trình/word set, gồm id/name/description/difficulty/wordSetCount/group
- `pathWords`: map từ path id sang danh sách từ vựng
- `categories`: category/bộ từ
- `vocabularies`: vocabulary cá nhân/toàn app
- `activity`: calendar/leaderboard/progress style data
- `shop`: vật phẩm shop

Trạng thái safe-to-edit: không nên sửa trực tiếp cho lesson development nếu chưa có quy trình seed/migration rõ, vì đây là runtime state và backend có logic đồng bộ.

### 6.2 Backend API/seed logic

File: `Luyen Tu/apps/api/src/main.ts`

Vai trò:

- Định nghĩa kiểu state và seed data
- Cung cấp endpoints: `/paths/groups`, `/paths/summary`, `/paths/:id`, `/paths/:id/progress`, `/paths/:id/srs/*`, `/word-sets/:id/vocabularies`, `/categories`, `/categories/:id/vocabularies`, `/vocabularies`, `/vocabularies/stats`, `/activity/calendar`, `/activity/leaderboard`, `/shop/*`, `/shared-streak`

Trạng thái safe-to-edit: không chỉnh trong task audit này. Về sau nếu phát triển lesson thật, nên tạo seed/content module riêng thay vì sửa runtime state thủ công.

### 6.3 Frontend local learning path mock

File: `Luyen Tu/apps/web/src/lib/p-english/learning-path-data.ts`

Schema:

- `LearningSkillType`: `Từ vựng`, `Ngữ pháp`, `Nghe`, `Phản xạ`, `Ôn tập`
- `LearningUnitStatus`: `Chưa học`, `Đang học`, `Hoàn thành`
- `LearningPathUnit`: `id`, `title`, `description`, `skillType`, `estimatedTime`, `progress`, `status`, `xp`, `reviewDue`
- `learningPathUnits`: Unit 1–8 mock như Chào hỏi cơ bản, Gia đình và bạn bè, Trường học, Thói quen hằng ngày, Đồ ăn và mua sắm, Nghe câu ngắn, Phản xạ giao tiếp, Ôn tập tổng hợp

Trạng thái safe-to-edit: tương đối an toàn cho mock/local lesson planning, nhưng cần kiểm tra consumption trước khi dùng làm source chính.

### 6.4 Frontend local UI arrays

- `Luyen Tu/apps/web/src/pages/HomePage.tsx`: quick actions, home sections
- `Luyen Tu/apps/web/src/pages/PracticePage.tsx`: practice modes gồm Flashcard, Trắc nghiệm, Nghe, Gõ từ, Ghép cặp, Tốc độ
- `Luyen Tu/apps/web/src/pages/GamesPage.tsx`: mini-games gồm Memory Match, Word Scramble, Listening Challenge, Speed Quiz, Reflex Game, Champion Mode
- `Luyen Tu/apps/web/src/components/Sidebar.tsx`: desktop navigation
- `Luyen Tu/apps/web/src/components/BottomNav.tsx`: mobile navigation

Trạng thái safe-to-edit: chỉ nên sửa khi có task UI/UX rõ. Với lesson development, nên ưu tiên tạo data/content riêng thay vì nhúng quá nhiều lesson vào page components.

## 7. Recommended lesson development entry points

Các file nên gửi cho ChatGPT/lập kế hoạch lesson development:

1. `Luyen Tu/apps/web/src/lib/p-english/learning-path-data.ts`
   - Entry point tốt nhất cho mock/local units.
   - Có sẵn schema unit đơn giản.

2. `Luyen Tu/apps/web/src/pages/HomePage.tsx`
   - Nơi hiển thị lộ trình trên dashboard.
   - Cần biết Home đang lấy API paths hay local units.

3. `Luyen Tu/apps/web/src/pages/StudyPage.tsx`
   - Nơi hiển thị chi tiết path và word cards.
   - Entry point cho lesson/unit detail nếu dùng `/paths/:id`.

4. `Luyen Tu/apps/web/src/pages/PracticePage.tsx`
   - Entry point cho Flashcard, Quiz, Listening, Typing, Matching, Speed practice.

5. `Luyen Tu/apps/web/src/pages/GamesPage.tsx`
   - Entry point cho Phản xạ/game mode.

6. `Luyen Tu/apps/web/src/pages/VocabPage.tsx`
   - Entry point cho vocabulary list/schema và quản lý từ.

7. `Luyen Tu/apps/api/src/main.ts`
   - Cần gửi để hiểu API schema/endpoints trước khi thêm lesson backend.
   - Không nên chỉnh ngay nếu chỉ phát triển nội dung mock.

8. `Luyen Tu/apps/api/data/state.json`
   - Cần gửi một phần mẫu/schema, không nhất thiết gửi toàn file nếu quá lớn.
   - Nên trích `groups`, một vài `paths`, một key `pathWords`, một vài `vocabularies`.

9. `Luyen Tu/docs/P_ENGLISH_CONTENT_ENTRY_POINTS.json`
   - File JSON export có cấu trúc routes/nav/learning sections/content gaps.

## 8. Content gaps hiện tại

1. Chưa có lesson schema hoàn chỉnh gồm objectives, steps, examples, quiz, listening assets, speaking prompts, review rules.
2. `Lộ trình` trên sidebar trỏ về `/home`, chưa có route riêng cho learning path overview.
3. Practice page có mode Flashcard/Quiz/Nghe/Gõ từ/Ghép cặp/Tốc độ nhưng flow sau khi bắt đầu còn placeholder.
4. Games page có danh sách mini-game nhưng màn hình detail còn placeholder, chưa có game engine/content thật.
5. Category cards dẫn tới `/categories/:id`, nhưng router hiện chưa khai báo route chi tiết category.
6. Listening/Nghe mới là label/mode, chưa thấy audio asset/transcript/question schema rõ.
7. Speaking/phản xạ giao tiếp chưa có schema prompt/answer/feedback rõ.
8. Grammar/ngữ pháp mới xuất hiện trong local mock skill type, chưa có page/lesson flow riêng.
9. XP/streak/progress có dữ liệu user/activity/path progress nhưng chưa liên kết đầy đủ với từng lesson/unit local.
10. Một số brand/copy legacy còn có thể tồn tại trong meta/manifest/home/state, cần xử lý trong task brand cleanup riêng, không xử lý trong audit-only task này.

## 9. Build status

Đã chạy build từ `Luyen Tu` bằng lệnh `npm run build`.

Kết quả: **FAIL**.

Chi tiết:

- API build (`tsc -p tsconfig.json`) đã chạy xong.
- Web build (`vite build`) thất bại trong giai đoạn Vite HTML inline proxy.
- Lỗi chính:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Nhận định audit-only: lỗi này thuộc build pipeline/Vite HTML processing, không phải do hai file tài liệu trong `docs/`. Theo phạm vi hiện tại, không chỉnh UI/app/backend để fix lỗi build.
