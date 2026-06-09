# P-English Mobile Bottom Spacing Polish

## Scope

Validated and polished mobile bottom spacing for the learning routes that share the ocean mobile layout shell:

- [`LearningPathPage.tsx`](../apps/web/src/pages/LearningPathPage.tsx)
- [`LessonPage.tsx`](../apps/web/src/pages/LessonPage.tsx)
- [`Foundation48Page.tsx`](../apps/web/src/features/foundation48/Foundation48Page.tsx)

## Changed files

- [`LearningPathPage.tsx`](../apps/web/src/pages/LearningPathPage.tsx)
  - Increased the mobile [`OceanPageShell`](../apps/web/src/components/p-english/OceanPageShell.tsx) bottom padding to `calc(var(--penglish-mobile-safe-bottom) + 168px)`.
  - Kept the existing beginner-first learning path layout unchanged.

- [`LessonPage.tsx`](../apps/web/src/pages/LessonPage.tsx)
  - Increased the mobile [`OceanPageShell`](../apps/web/src/components/p-english/OceanPageShell.tsx) bottom padding to `calc(var(--penglish-mobile-safe-bottom) + 168px)`.
  - Added matching scroll padding and extra inner bottom space so the sticky lesson action row and fixed mobile nav do not cover lesson content.
  - Preserved the one-step-at-a-time lesson behavior and kept Flashcard/guided practice hidden on Step 1.

- [`Foundation48Page.tsx`](../apps/web/src/features/foundation48/Foundation48Page.tsx)
  - Applied the same mobile safe-area spacing because Foundation48 uses the same [`OceanPageShell`](../apps/web/src/components/p-english/OceanPageShell.tsx) layout shell.
  - Preserved Foundation48 route behavior and progress logic.

- [`mobile-spacing-qa.cjs`](../scripts/mobile-spacing-qa.cjs)
  - Added route-level desktop/mobile browser QA for spacing, console errors, page errors, horizontal overflow, and lesson Step 1 guardrails.
  - Captures mobile screenshots for the three target routes.

- [`run-mobile-spacing-validation.ps1`](../scripts/run-mobile-spacing-validation.ps1)
  - Groups the safe validation commands into one PowerShell script: build, QA, and [`git status`](../package.json).

## UX result

- Mobile content now has a larger safe bottom buffer above the fixed bottom navigation.
- The lower learning cards/buttons are no longer visually covered by the bottom nav at the bottom scroll position.
- iOS/Android safe-area handling remains based on the existing `env(safe-area-inset-bottom)` variable chain in [`styles.css`](../apps/web/src/styles.css).
- No page redesign was introduced.

## Preserved behavior

- Routes are unchanged:
  - `/learning-path`
  - `/lessons/unit-1-greetings-introduction`
  - `/luyen-tieng-anh/48-ngay-lay-goc`
- Learning data, progress APIs, practice logic, speech synthesis, lock/hearts behavior, and Foundation48 progress behavior were not changed.
- Lesson Step 1 remains one-task-only.
- Flashcard/guided practice content is still hidden on initial Step 1 render.

## Build result

Command run via [`run-mobile-spacing-validation.ps1`](../scripts/run-mobile-spacing-validation.ps1):

```text
npm run build -w @pshare/web
```

Result: passed.

Build warnings were existing Vite chunking warnings about mixed static/dynamic imports and did not fail the build.

## Browser QA result

QA script: [`mobile-spacing-qa.cjs`](../scripts/mobile-spacing-qa.cjs)

Result file: [`learning-routes-mobile-spacing-qa-results.json`](learning-routes-mobile-spacing-qa-results.json)

Overall result: passed.

Validated:

- Desktop and mobile route roots are present.
- No console errors.
- No page errors.
- No horizontal overflow.
- Mobile bottom nav is present.
- Mobile bottom nav does not overlap route content.
- Lesson Step 1 has exactly one visible step card.
- Lesson Step 1 has no visible Flashcard/guided practice content.

## Mobile screenshots

- [`learning-path-mobile-spacing.png`](screenshots/learning-path-mobile-spacing.png)
- [`lesson-unit1-mobile-spacing.png`](screenshots/lesson-unit1-mobile-spacing.png)
- [`foundation48-mobile-spacing.png`](screenshots/foundation48-mobile-spacing.png)

## Notes

The first QA attempt reported overlap because the test selector accidentally included links inside the fixed mobile bottom nav itself. The QA script was corrected to exclude descendants of `[data-testid="mobile-bottom-nav"]`, then validation passed with the intended page-content-only overlap check.
