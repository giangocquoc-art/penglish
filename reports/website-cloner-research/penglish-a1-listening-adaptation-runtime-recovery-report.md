# P-English A1 Listening Runtime Recovery Report

Generated: 2026-06-01 15:41 ICT

## Scope

This recovery covered the reported lesson runtime crash, the two target lesson routes, lesson QA route text checks, GSAP empty-target warnings, browser QA observability, and final validation evidence for the React/Vite web app.

Target routes:

- [`/lessons/unit-1-greetings-introduction`](reports/website-cloner-research/penglish-a1-listening-adaptation-qa.json:31)
- [`/lessons/a1-listening-meeting-classmate`](reports/website-cloner-research/penglish-a1-listening-adaptation-qa.json:44)

## Runtime crash recovery

The reported crash was `Cannot read properties of undefined (reading 'opacity')`. The failing stack pointed near [`LessonPage.tsx`](../../apps/web/src/pages/LessonPage.tsx), but inspection showed the unsafe opacity reads were most likely from child/preset components rendered by the lesson shell. The recovery added explicit fallback records before any opacity-bearing animation preset is consumed.

Changes made:

- [`PooOceanCompanion.tsx`](../../apps/web/src/components/p-english/PooOceanCompanion.tsx:28) now defines a safe default companion preset and resolves unknown variants with `variantSettings[variant] ?? DEFAULT_POO_COMPANION_SETTINGS` at [`PooOceanCompanion.tsx`](../../apps/web/src/components/p-english/PooOceanCompanion.tsx:47).
- [`AmbientPooWhale.tsx`](../../apps/web/src/components/ocean/AmbientPooWhale.tsx:53) now defines a default ambient whale preset and resolves unknown route presets through [`AMBIENT_WHALE_ROUTE_PRESETS`](../../apps/web/src/components/ocean/AmbientPooWhale.tsx:229) fallback logic.
- [`LessonPage.tsx`](../../apps/web/src/pages/LessonPage.tsx:17) now imports safe practice label/icon helpers and uses them for lesson practice CTA rendering at [`LessonPage.tsx`](../../apps/web/src/pages/LessonPage.tsx:289) and final mode buttons at [`LessonPage.tsx`](../../apps/web/src/pages/LessonPage.tsx:571).
- [`DynamicGuidedLessonFlow.tsx`](../../apps/web/src/components/p-english/DynamicGuidedLessonFlow.tsx:22) now includes default practice label/icon fallbacks and aliases for visible modes including listening, typing, review, and overview.

## Practice mode fallback coverage

Practice mode lookups were hardened instead of relying on direct record indexing. The helper [`getPracticeModeLabel()`](../../apps/web/src/components/p-english/DynamicGuidedLessonFlow.tsx:53) returns a default label for unknown/null modes, and the matching icon helper returns a safe default icon. This covers the requested mode family:

- flashcard
- quiz
- listen / listening
- reflex
- type / typing
- match
- speed
- review
- overview

## Lesson QA text checks

The route text QA was updated in [`penglish-a1-listening-adaptation-qa.cjs`](../../scripts/penglish-a1-listening-adaptation-qa.cjs) to keep meaningful coverage while avoiding brittle all-string exact checks. The checks still require route-specific evidence: lesson title, guided/listening content, and lesson content sections.

Supporting helpers:

- [`normalizeExpectedChecks()`](../../scripts/penglish-a1-listening-adaptation-qa.cjs:74) normalizes string and grouped expectation entries.
- [`findMissingExpectedChecks()`](../../scripts/penglish-a1-listening-adaptation-qa.cjs:78) reports the exact missing expectation label when a route fails.

Final QA evidence shows `failedRouteTextChecks: 0` at [`penglish-a1-listening-adaptation-qa.json`](penglish-a1-listening-adaptation-qa.json:240).

## Lesson data completeness

Both target lesson slugs were inspected in [`lesson-content-data.ts`](../../apps/web/src/lib/p-english/lesson-content-data.ts). No data repair was required.

Confirmed coverage includes:

- lesson identity/title/level/time metadata
- learning objectives
- vocabulary
- sentence patterns
- mini dialogues
- grammar notes
- pronunciation notes
- listening practice
- speaking/reflex prompts
- flashcards
- quiz content
- ordering/fill-blank or lesson-specific practice data
- review rules
- completion criteria

The A1 classmate lesson also contains QA-visible listening strings such as `Hi, I am new here.` and `Is this seat free?`, which are verified by the route checks.

## GSAP warning recovery

The GSAP warning `GSAP target [object NodeList] not found` was addressed centrally in [`gsap-utils.ts`](../../apps/web/src/lib/animations/gsap-utils.ts).

The new target normalization helper [`normalizeAnimationTarget()`](../../apps/web/src/lib/animations/gsap-utils.ts:11) rejects:

- null/undefined targets
- empty arrays
- empty `NodeList`-style targets with `length === 0`
- empty collection-style targets with `size === 0`

The safe target is now used before animation calls in [`safeGsapSet()`](../../apps/web/src/lib/animations/gsap-utils.ts:43), float/bubble/card/transcript helpers, and [`killTweensOf()`](../../apps/web/src/lib/animations/gsap-utils.ts:252). Final browser QA recorded `consoleWarningCount: 0` at [`penglish-a1-listening-adaptation-qa.json`](penglish-a1-listening-adaptation-qa.json:243).

## Browser QA hardening

The QA script now fails on visible browser/runtime problems instead of hiding them:

- Console/page error collection is summarized through critical messages at [`penglish-a1-listening-adaptation-qa.cjs`](../../scripts/penglish-a1-listening-adaptation-qa.cjs:301).
- Failed requests are included in the exit criteria at [`penglish-a1-listening-adaptation-qa.cjs`](../../scripts/penglish-a1-listening-adaptation-qa.cjs:307).
- The learning hearts lock is cleared before navigation via [`addInitScript()`](../../scripts/penglish-a1-listening-adaptation-qa.cjs:155) and direct localStorage cleanup at [`penglish-a1-listening-adaptation-qa.cjs`](../../scripts/penglish-a1-listening-adaptation-qa.cjs:157).
- Listening practice navigation now uses an explicit `listeningPracticeUrl` at [`penglish-a1-listening-adaptation-qa.cjs`](../../scripts/penglish-a1-listening-adaptation-qa.cjs:218), avoiding the earlier reload path that could land on `chrome-error://chromewebdata/`.

## Validation results

### TypeScript

Command:

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Result: exit code `0`.

### Production build

Command:

```cmd
npm.cmd run build -w @pshare/web
```

Result: exit code `0`.

Build evidence:

```text
✓ 2783 modules transformed.
✓ built in 9.92s
```

A non-fatal Vite chunk-size warning remains and was not part of this runtime recovery scope.

### Browser QA

Command:

```cmd
cmd.exe /c "set PENGLISH_QA_BASE_URL=http://127.0.0.1:5190&& node scripts\penglish-a1-listening-adaptation-qa.cjs"
```

Result: exit code `0`.

Final summary from [`penglish-a1-listening-adaptation-qa.json`](penglish-a1-listening-adaptation-qa.json:238):

```json
{
  "routeChecks": 14,
  "failedRouteTextChecks": 0,
  "emptyDataVisibleCount": 0,
  "consoleErrorCount": 0,
  "consoleWarningCount": 0,
  "failedRequestCount": 0,
  "explanationVisible": true,
  "enterAdvanced": true,
  "summaryVisible": true,
  "localProgressSaved": true,
  "dailyRewardSaved": true
}
```

## Screenshot evidence

Updated screenshots were generated under [`reports/screenshots`](../screenshots), including:

- [`penglish-a1-desktop-unit-1.jpg`](../screenshots/penglish-a1-desktop-unit-1.jpg)
- [`penglish-a1-mobile-unit-1.jpg`](../screenshots/penglish-a1-mobile-unit-1.jpg)
- [`penglish-a1-desktop-new-lesson.jpg`](../screenshots/penglish-a1-desktop-new-lesson.jpg)
- [`penglish-a1-mobile-new-lesson.jpg`](../screenshots/penglish-a1-mobile-new-lesson.jpg)
- [`penglish-a1-desktop-listening-practice.jpg`](../screenshots/penglish-a1-desktop-listening-practice.jpg)
- [`penglish-a1-desktop-listening-practice-checked.jpg`](../screenshots/penglish-a1-desktop-listening-practice-checked.jpg)
- [`penglish-a1-desktop-listening-practice-summary.jpg`](../screenshots/penglish-a1-desktop-listening-practice-summary.jpg)
- [`penglish-a1-mobile-listening-practice.jpg`](../screenshots/penglish-a1-mobile-listening-practice.jpg)

## Final status

Recovery is complete. The target lesson routes are stable, route text checks pass honestly, lesson data is complete, GSAP empty target warnings are gone, QA now fails on critical browser errors, screenshots were refreshed, TypeScript passed, the production build passed, and browser QA passed with the requested persistence and summary checks.
