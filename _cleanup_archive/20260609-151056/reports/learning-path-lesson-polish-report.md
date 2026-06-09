# P-English learning route polish report

## Scope

Polished the already-redesigned P-English routes without redesigning Foundation48 or changing route structure:

- `/learning-path`
- `/lessons/unit-1-greetings-introduction`

## Changed files

- `apps/web/src/pages/LearningPathPage.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `scripts/_qa-learning-redesign-after.cjs`
- `reports/learning-path-lesson-polish-qa-results.json`

## UX changes

### `/learning-path`

- Removed the repeated `Việc cần làm bây giờ` card that duplicated the hero CTA.
- Kept the hero/current-unit card as the only dominant next action with `Tiếp tục học`.
- Kept `Đường học rất gọn` as the main secondary learning-path section.
- Kept future lessons collapsed and visually secondary.
- Made `Poo nhắc nhỏ` lighter and less dashboard-like.
- Hid zero-value support metrics until the learner has actual activity.
- Kept optional `Ôn tập` and `Shadowing` actions visually quiet with ghost buttons.

### `/lessons/unit-1-greetings-introduction`

- Removed the always-visible `DynamicGuidedLessonFlow` block from below Step 1.
- Step 1 now shows only the listening task content and its own `Xem thêm` details.
- The large flashcard/practice preview is not rendered on the initial listening step.
- Updated step labels to Vietnamese-first:
  - `Bước 1: Nghe`
  - `Bước 2: Hiểu`
  - `Bước 3: Luyện`
  - `Bước 4: Nói`
  - `Bước 5: Kiểm tra nhanh`
  - `Bước 6: Hoàn tất`
- Kept English labels as small helper text only, e.g. `Listen`, `Understand`, `Practice`.
- Kept sticky bottom navigation on mobile.

## Preserved behavior

- Existing routes were preserved.
- Existing lesson data retrieval was preserved through `getLessonById`.
- Existing saved progress APIs were preserved:
  - `readLessonProgress`
  - `markLessonStarted`
  - `markLessonStepCompleted`
  - `markLessonCompleted`
  - `calculateLessonProgressSummary`
- Existing practice-mode logic was preserved:
  - `getAvailableLessonProgressModes`
  - `getPracticeRecommendation`
  - `getPracticeModeLabel`
  - final recommended practice links
  - shadowing link
  - quiz link
- Existing speech synthesis behavior was preserved through `speakEnglish`.
- Existing lock/hearts behavior was preserved.
- Foundation48 was not changed.

## Build result

Command:

```text
npm run build -w @pshare/web
```

Result: passed.

Notes:

- Vite still reports pre-existing dynamic/static import chunking warnings for Supabase/Foundation48 modules.
- No build-breaking TypeScript or Vite errors occurred.

## Browser QA result

QA script:

```text
node scripts/_qa-learning-redesign-after.cjs
```

Result: passed.

Tested routes/viewports:

- `/learning-path` desktop: 1440x950
- `/learning-path` mobile: 390x844
- `/lessons/unit-1-greetings-introduction` desktop: 1440x950
- `/lessons/unit-1-greetings-introduction` mobile: 390x844

Confirmed:

- No console errors.
- No page errors.
- No horizontal overflow.
- Required selectors present.
- Lesson initially shows exactly one visible `[data-testid="lesson-step-card"]`.
- Lesson initially shows `Bước 1/6`.
- Poo guidance is visible.
- Flashcard/practice block is hidden on initial Step 1:
  - `flashcardPreviewCount: 0`
  - `guidedModeContentCount: 0`

QA JSON report:

- `reports/learning-path-lesson-polish-qa-results.json`

## Polish screenshots

- `reports/screenshots/learning-path-polish-desktop.png`
- `reports/screenshots/learning-path-polish-mobile.png`
- `reports/screenshots/lesson-unit1-polish-desktop.png`
- `reports/screenshots/lesson-unit1-polish-mobile.png`
