# P-English Learning Path Page Report

Ngày thực hiện: 2026-05-21

## 1. Mục tiêu

Tạo trang tổng quan lộ trình học riêng tại route `/learning-path`, dùng dữ liệu local từ [`learning-path-data.ts`](../apps/web/src/lib/p-english/learning-path-data.ts), liên kết Unit khả dụng đến route bài học, và hiển thị tiến độ local bằng helper trong [`lesson-progress.ts`](../apps/web/src/lib/p-english/lesson-progress.ts).

## 2. Files changed

| File | Change |
|---|---|
| [`LearningPathPage.tsx`](../apps/web/src/pages/LearningPathPage.tsx) | Tạo trang learning path overview mới. |
| [`App.tsx`](../apps/web/src/App.tsx) | Import page mới và thêm route `/learning-path`. |
| [`Sidebar.tsx`](../apps/web/src/components/Sidebar.tsx) | Đổi menu `Lộ trình` từ `/home` sang `/learning-path`. |

## 3. Route added

```text
/learning-path
```

Route được thêm trong [`App.tsx`](../apps/web/src/App.tsx) và render trong shell hiện có, không thay đổi auth/backend/env.

## 4. UI behavior

Trang [`LearningPathPage.tsx`](../apps/web/src/pages/LearningPathPage.tsx) hiển thị:

- Hero section cho P-English Roadmap.
- Metrics: Unit khả dụng, Unit hoàn thành, tổng XP.
- Danh sách Unit cards lấy từ [`learningPathUnits`](../apps/web/src/lib/p-english/learning-path-data.ts).
- Unit có `lessonId` và tìm được bằng [`getLessonById`](../apps/web/src/lib/p-english/lesson-content-data.ts) sẽ mở được.
- Unit chưa có lesson data sẽ hiển thị trạng thái locked placeholder.
- Unit khả dụng link đến `/lessons/{lessonId}`.

## 5. Progress integration

Với mỗi Unit có lesson data:

- Đọc progress bằng [`readLessonProgress`](../apps/web/src/lib/p-english/lesson-progress.ts).
- Tính summary bằng [`calculateLessonProgressSummary`](../apps/web/src/lib/p-english/lesson-progress.ts).
- Hiển thị local progress percentage.
- Hiển thị next recommended mode nếu đã có progress summary.
- Hiển thị due review count nếu có SRS/progress data.

Nếu chưa có local progress, page vẫn hiển thị Unit khả dụng với progress `0%` và CTA vào bài học.

## 6. Unit coverage

| Unit | Source status | UI status |
|---|---|---|
| Unit 1 | Có `lessonId` và lesson data trong [`lesson-content-data.ts`](../apps/web/src/lib/p-english/lesson-content-data.ts) | Available, links to lesson page |
| Unit 2 | Có trong [`learning-path-data.ts`](../apps/web/src/lib/p-english/learning-path-data.ts), nhưng hiện chưa có `lessonId`/lesson data trong inspected source snapshot | Locked until data is added |
| Future units | Có placeholders trong learning path data | Locked placeholders |

## 7. Scope compliance

- Không thay đổi backend.
- Không thay đổi auth.
- Không thay đổi env.
- Không thay đổi Vite config, `index.html`, hoặc build pipeline.
- Không thay đổi scoring/practice logic.
- Chỉ thêm frontend page, route, sidebar link, và report.

## 8. Verification commands

Requested verification:

```text
npx tsc -p apps/web/tsconfig.json --noEmit
npm run build
```

### TypeScript result

Command:

```text
npx tsc -p apps/web/tsconfig.json --noEmit
```

Result: failed with known unrelated TypeScript errors already present outside the learning path page work.

Observed errors:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

Classification: known pre-existing/unrelated errors in [`CategoriesPage.tsx`](../apps/web/src/pages/CategoriesPage.tsx), [`FoldersPage.tsx`](../apps/web/src/pages/FoldersPage.tsx), and [`StudyPage.tsx`](../apps/web/src/pages/StudyPage.tsx). No new TypeScript error from [`LearningPathPage.tsx`](../apps/web/src/pages/LearningPathPage.tsx) appeared in the command output.

### Build result

Command:

```text
npm run build
```

Result: failed with known Vite `html-inline-proxy` issue.

Observed error:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Classification: known path-space/build-pipeline issue caused by the project folder `Luyen Tu`. Not fixed because the task scope forbids Vite config, `index.html`, and build pipeline changes.

## 9. Final status

Learning path page implementation status: completed with known project-level verification blockers.

Route status:

- `/learning-path` added in [`App.tsx`](../apps/web/src/App.tsx).
- Sidebar `Lộ trình` now points to `/learning-path` in [`Sidebar.tsx`](../apps/web/src/components/Sidebar.tsx).
- Available units link to `/lessons/{lessonId}` from [`LearningPathPage.tsx`](../apps/web/src/pages/LearningPathPage.tsx).
