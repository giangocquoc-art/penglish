# P-English Unit 1 Progress Dashboard Report

## Mục tiêu

Tạo shared local progress helper và hiển thị dashboard tiến độ gọn trong Unit 1 lesson page:

- `/lessons/unit-1-greetings-introduction`

Scope giữ đúng yêu cầu:

- LocalStorage only.
- Không backend/API calls.
- Không auth/database/env/runtime state changes.
- Không chỉnh Vite config, `index.html`, hoặc build pipeline.
- Không refactor sâu practice modes.

## Files created

- `apps/web/src/lib/p-english/lesson-progress.ts`
- `docs/P_ENGLISH_UNIT_1_PROGRESS_DASHBOARD_REPORT.md`

## Files changed

- `apps/web/src/pages/LessonPage.tsx`

## Helper functions added

File: `apps/web/src/lib/p-english/lesson-progress.ts`

Added exported helpers:

```ts
getLessonProgressKey(lessonId: string): string
readLessonProgress(lessonId: string): LessonProgress | null
writeLessonProgress(lessonId: string, next: LessonProgress): boolean
mergeLessonProgress(lessonId: string, patch: Partial<LessonProgress>): LessonProgress | null
calculateLessonProgressSummary(progress, lesson): LessonProgressSummary
```

Behavior:

- `getLessonProgressKey` returns `p-english:lesson-progress:${lessonId}`.
- `readLessonProgress` safely guards `window`, localStorage access and JSON parsing.
- `writeLessonProgress` safely stringifies and writes; returns `false` on failure.
- `mergeLessonProgress` reads existing progress, preserves existing fields, sets `lessonId`, shallow-merges mode fields, writes back and returns merged progress.
- `calculateLessonProgressSummary` summarizes Unit 1 progress into completed/missing modes, overall percentage, next recommendation and mode tile data.

## localStorage schema supported

Key:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Supported progress fields:

- `lessonId`
- `flashcard`
- `quiz`
- `listening`
- `reflex`
- `typing`
- `match`
- `speed`

Completion rules implemented:

- `flashcard`: completed if `completedSessions > 0`
- `quiz`: completed if `attempts > 0`
- `listening`: completed if `attempts > 0`
- `reflex`: completed if `attempts > 0`
- `typing`: completed if `attempts > 0`
- `match`: completed if `attempts > 0`
- `speed`: completed if `attempts > 0`

Mode order:

1. `flashcard`
2. `quiz`
3. `listen`
4. `reflex`
5. `type`
6. `match`
7. `speed`

Labels:

- Flashcard
- Quiz
- Luyện nghe
- Phản xạ
- Gõ câu
- Ghép cặp
- Tốc độ

Next recommended mode:

- First missing mode in the order above.
- If all modes completed, next recommendation becomes `flashcard` with label `Ôn lại flashcard`.

## LessonPage dashboard behavior

File: `apps/web/src/pages/LessonPage.tsx`

Added local progress read:

- Reads progress on mount / lesson route load.
- Reads progress again on `window` focus, so returning from a practice session refreshes the lesson dashboard.
- Uses `calculateLessonProgressSummary` to derive UI state.

Dashboard placement:

- Added after `Tổng quan bài học` and before `Mục tiêu sau bài học`.

Dashboard title:

- `Tiến độ bài học`

Dashboard displays:

- Overall percentage.
- Chakra progress bar.
- Completed modes count / total modes.
- Next recommended action text: `Nên học tiếp: {nextRecommendedLabel}`.
- Main CTA: `Học tiếp` linking to `nextRecommendedUrl`.
- Mini mode tiles for:
  - Flashcard
  - Quiz
  - Luyện nghe
  - Phản xạ
  - Gõ câu
  - Ghép cặp
  - Tốc độ

Each mode tile shows:

- Mode label.
- Status:
  - `Chưa học`
  - `Đang học`
  - `Đã hoàn thành`
- Score/progress text from helper.
- CTA `Luyện ngay` linking to the exact mode route.

No progress state:

- If localStorage has no progress object for the lesson, dashboard shows:
  - `Bạn chưa bắt đầu bài này. Nên bắt đầu bằng Flashcard.`

## Practice components migration status

Practice components were left unchanged intentionally.

Reason:

- Existing mode components already write progress successfully using their own local safe read/write helpers.
- The request says not to deeply refactor practice modes and only migrate if straightforward/low-risk.
- To avoid breaking established writes for `flashcard`, `quiz`, `listening`, `reflex`, `typing`, `match`, and `speed`, this task uses the new helper primarily from `LessonPage` for safe summary reads.
- The helper includes `mergeLessonProgress` for future low-risk migration of practice components.

## Modes summarized

The dashboard summarizes all current Unit 1 local modes:

- `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard`
- `/practice?lessonId=unit-1-greetings-introduction&mode=quiz`
- `/practice?lessonId=unit-1-greetings-introduction&mode=listen`
- `/practice?lessonId=unit-1-greetings-introduction&mode=reflex`
- `/practice?lessonId=unit-1-greetings-introduction&mode=type`
- `/practice?lessonId=unit-1-greetings-introduction&mode=match`
- `/practice?lessonId=unit-1-greetings-introduction&mode=speed`

## Styling

Implemented with Chakra UI and P-English colors:

- Background: `#F8FAFC`
- Card: `white`
- Text: `#0F172A`
- Muted: `#64748B`
- Primary blue: `#2563EB`
- Green: `#22C55E`
- Amber: used for recommendation / in-progress states
- Red available in color system but not overused
- Border: `#E2E8F0`

Mobile behavior:

- Dashboard uses responsive `Flex` and `SimpleGrid`.
- Mode tiles stack/wrap cleanly.
- CTA remains visible in the top dashboard card.
- No intentional horizontal overflow.

## Build result

Command run from `Luyen Tu`:

```bash
npm run build
```

Result: failed at web Vite build with the known pre-existing/path-related Vite HTML proxy issue.

Observed output:

```text
> pshare@1.0.0 build
> npm run build -w @pshare/api && npm run build -w @pshare/web

> build
> tsc -p tsconfig.json

> build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 1 modules transformed.
x Build failed in 258ms
error during build:
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Notes:

- API TypeScript build completed before the web build step.
- Web build failed at the known Vite `html-inline-proxy` issue.
- No Vite config, `index.html`, or build pipeline files were changed.

## TypeScript check result

Command run from `Luyen Tu`:

```bash
npx tsc -p apps/web/tsconfig.json --noEmit
```

Result: failed due existing unrelated TypeScript issues in pages outside the progress dashboard scope:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

These are the same unrelated checks seen in prior Unit 1 reports and were not changed for this task.

## Known Vite html-inline-proxy status

The known Vite `[vite:html-inline-proxy] No matching HTML proxy module found` error still appears during `npm run build`. This is documented as pre-existing/path-related with the project folder `Luyen Tu` containing a space. Per instruction, no fix was attempted in Vite config / `index.html` / build pipeline.

## Remaining risks

- Dashboard is local-only and per-browser/device.
- localStorage changes in another tab update when the lesson page gains focus, not through a cross-tab subscription.
- Some older progress objects might not include `lessonId`; helper normalizes this while reading.
- Practice components have not yet been migrated to the helper, so duplicate local safe read/write helpers remain by design.
