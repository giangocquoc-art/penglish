# P-English Mobile Topbar Overlap Fix Report

## Changed files

- [`apps/web/src/components/Topbar.tsx`](../apps/web/src/components/Topbar.tsx)
- [`scripts/mobile-spacing-qa.cjs`](../scripts/mobile-spacing-qa.cjs)
- [`reports/learning-routes-mobile-spacing-qa-results.json`](./learning-routes-mobile-spacing-qa-results.json)
- [`reports/screenshots/learning-path-mobile-topbar-spacing.png`](./screenshots/learning-path-mobile-topbar-spacing.png)
- [`reports/screenshots/lesson-unit1-mobile-topbar-spacing.png`](./screenshots/lesson-unit1-mobile-topbar-spacing.png)
- [`reports/screenshots/foundation48-mobile-topbar-spacing.png`](./screenshots/foundation48-mobile-topbar-spacing.png)

## Cause

The shared app header in [`apps/web/src/components/Topbar.tsx`](../apps/web/src/components/Topbar.tsx) was using sticky positioning on all breakpoints:

- `position="sticky"`
- `top="0"`

That header is rendered by the shared shell before the page content, so it appears on `/learning-path`, `/lessons/unit-1-greetings-introduction`, and `/luyen-tieng-anh/48-ngay-lay-goc`. On mobile, the sticky behavior caused the menu/hearts/bubbles/star bar to remain over the viewport while route content scrolled underneath it, which made it visually cover cards in the middle of the screen.

## Fix

The mobile header was changed to be static while preserving sticky behavior on large screens:

- Mobile/tablet: `position={{ base: 'static', lg: 'sticky' }}`
- Desktop shell: `top={{ base: 'auto', lg: '0' }}`

This keeps the header at the top of the document flow on mobile, so it reserves its own layout height naturally and scrolls away with the page content. The existing bottom navigation and safe-area bottom spacing were not changed.

A stable test hook was added:

- `data-testid="app-topbar"`

## QA updates

[`scripts/mobile-spacing-qa.cjs`](../scripts/mobile-spacing-qa.cjs) now checks mobile topbar overlap by comparing the header bounding box against visible route content candidates at both the top and middle scroll positions.

The QA still checks:

- route root exists
- no console errors
- no page errors
- no horizontal overflow
- bottom nav does not overlap visible bottom content
- lesson page has exactly one visible step card
- lesson Step 1 does not show Flashcard/guided practice content

## Build result

Command run via [`scripts/run-mobile-spacing-validation.ps1`](../scripts/run-mobile-spacing-validation.ps1):

```text
npm run build -w @pshare/web
```

Result: passed.

Vite emitted existing chunking warnings about mixed static/dynamic imports, but the build completed successfully.

## Browser QA result

Command run via [`scripts/run-mobile-spacing-validation.ps1`](../scripts/run-mobile-spacing-validation.ps1):

```text
node scripts/mobile-spacing-qa.cjs
```

Result: passed.

QA report: [`reports/learning-routes-mobile-spacing-qa-results.json`](./learning-routes-mobile-spacing-qa-results.json)

Confirmed:

- no console errors
- no page errors
- no horizontal overflow
- no top header overlap
- no bottom nav overlap
- Lesson Step 1 remains one-task-only
- Flashcard/guided practice content remains hidden on initial Step 1

## Screenshots

- [`reports/screenshots/learning-path-mobile-topbar-spacing.png`](./screenshots/learning-path-mobile-topbar-spacing.png)
- [`reports/screenshots/lesson-unit1-mobile-topbar-spacing.png`](./screenshots/lesson-unit1-mobile-topbar-spacing.png)
- [`reports/screenshots/foundation48-mobile-topbar-spacing.png`](./screenshots/foundation48-mobile-topbar-spacing.png)
