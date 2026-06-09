# P-English learning-path + lesson simplification report

## Scope

Simplified two P-English routes so the first visible decision is clear for complete beginners:

- `/learning-path`
- `/lessons/unit-1-greetings-introduction`

## Changed files

- `apps/web/src/pages/LearningPathPage.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `scripts/_capture-learning-before.cjs`
- `scripts/_qa-learning-redesign-after.cjs`
- `reports/learning-lesson-before-screenshots.json`
- `reports/learning-path-lesson-after-qa-results.json`

## UX changes

### `/learning-path`

- Replaced the dense roadmap/dashboard feeling with a calm current-unit journey.
- Added one dominant current lesson card with:
  - current level chip,
  - current unit title,
  - short beginner-friendly description,
  - one primary CTA: `Tiếp tục học`.
- Reduced future-unit noise behind a collapsible future path section.
- Added simple A1/A2/B1/B2 stage dots:
  - A1: Bắt đầu
  - A2: Cơ bản
  - B1: Giao tiếp
  - B2: Tự tin
- Kept the ocean/Poo styling with soft blue, glass cards, rounded surfaces, and calm motion.

### `/lessons/unit-1-greetings-introduction`

- Reworked the page into a six-step lesson player:
  1. Listen
  2. Understand
  3. Practice
  4. Speak
  5. Quick check
  6. Finish
- Added progress text: `Bước 1/6`.
- Added short Poo guidance lines, including:
  - `Nghe trước nhé.`
  - `Thử nói lại nào.`
  - `Giỏi lắm, lưu bài nhé.`
- Each step now displays one main task card at a time.
- Long supporting material is moved into native expandable `details` / `summary` areas labelled `Xem thêm`.
- Added sticky bottom navigation on mobile for `Quay lại`, `Tiếp tục`, and final `Lưu bài`.

## Preserved behavior

- Existing routes were preserved.
- Existing lesson data retrieval was preserved.
- Existing saved lesson progress APIs were preserved:
  - `readLessonProgress`
  - `markLessonStarted`
  - `markLessonStepCompleted`
  - `markLessonCompleted`
  - `calculateLessonProgressSummary`
- Existing practice mode logic was preserved:
  - `getAvailableLessonProgressModes`
  - `getPracticeRecommendation`
  - shadowing practice links
  - quiz practice links
  - recommended final practice links
- Existing speech synthesis behavior was preserved through `speakEnglish`.
- Existing learning-hearts lock behavior was preserved.
- Learning-path progress sources were preserved:
  - `getUnifiedDashboardSnapshot`
  - `getCefrProgressSummary`
  - `getUnifiedLearningPath`
  - existing local progress event listeners.

## Build result

Command:

```text
npm run build -w @pshare/web
```

Result: passed.

Notes:

- Vite reported existing chunking warnings for dynamic/static imports involving `supabaseClient.ts` and `foundation48CloudProgress.ts`.
- No build-breaking TypeScript or Vite errors occurred.

## Browser QA result

QA script:

```text
node scripts/_qa-learning-redesign-after.cjs
```

Result: passed.

Routes and viewports tested:

- `/learning-path` desktop: 1440x950
- `/learning-path` mobile: 390x844
- `/lessons/unit-1-greetings-introduction` desktop: 1440x950
- `/lessons/unit-1-greetings-introduction` mobile: 390x844

Checks performed:

- Required page selectors exist.
- No browser page errors.
- No console errors.
- No horizontal overflow.
- Lesson page has exactly one visible step card.
- Lesson page shows `Bước 1/6`.
- Lesson page shows Poo guidance.

QA JSON report:

- `reports/learning-path-lesson-after-qa-results.json`

## Screenshots

Before screenshots:

- `reports/screenshots/learning-path-before-desktop.png`
- `reports/screenshots/learning-path-before-mobile.png`
- `reports/screenshots/lesson-unit1-before-desktop.png`
- `reports/screenshots/lesson-unit1-before-mobile.png`

After screenshots:

- `reports/screenshots/learning-path-after-desktop.png`
- `reports/screenshots/learning-path-after-mobile.png`
- `reports/screenshots/lesson-unit1-after-desktop.png`
- `reports/screenshots/lesson-unit1-after-mobile.png`

## QA notes

- The after-QA script found no horizontal overflow on either target route at desktop or mobile widths.
- The lesson page check specifically verified that only one `[data-testid="lesson-step-card"]` is visible at initial load, matching the one-main-task requirement.
- The production preview server was used at `http://127.0.0.1:5180`.
