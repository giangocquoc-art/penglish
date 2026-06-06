# P-English A1 Listening Adaptation — QA Recovery Diagnosis

Date: 2026-06-01
Scope: Diagnose the previous Phase 5 QA failures without rerunning website cloning, deploying, editing Supabase, resetting git, or rewriting the app.

## Inputs inspected

- `reports/website-cloner-research/penglish-a1-listening-adaptation-qa.json`
- `scripts/penglish-a1-listening-adaptation-qa.cjs`
- `reports/website-cloner-research/penglish-current-lesson-audit.md`
- `reports/website-cloner-research/britishcouncil-a1-listening-light-research.md`
- `apps/web/src/App.tsx`
- `apps/web/src/pages/LearningPathPage.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `apps/web/src/pages/EnglishSpeedPage.tsx`
- `apps/web/src/pages/ShadowingPage.tsx`
- `apps/web/src/pages/VocabPage.tsx`
- `apps/web/src/components/practice/LessonListeningPractice.tsx`
- `apps/web/src/lib/p-english/daily-rewards.ts`
- `apps/web/src/lib/p-english/lesson-progress.ts`

The old requested final report `reports/website-cloner-research/penglish-a1-listening-adaptation-final-report.md` did not exist.

## Previous QA failure summary

The previous QA report showed:

```json
{
  "routeChecks": 14,
  "failedRouteTextChecks": 12,
  "emptyDataVisibleCount": 0,
  "consoleErrorCount": 0,
  "consoleWarningCount": 0,
  "failedRequestCount": 73,
  "explanationVisible": true,
  "enterAdvanced": true,
  "summaryVisible": true,
  "localProgressSaved": true,
  "dailyRewardSaved": false
}
```

## Diagnosis 1 — `failedRequests: 73`

The failed requests in the old report were almost entirely `net::ERR_ABORTED` entries for Vite dev modules and dependencies, for example:

- `/src/pages/LessonPage.tsx`
- `/src/pages/EnglishSpeedPage.tsx`
- `/src/pages/ShadowingPage.tsx`
- `/src/data/vocabulary/generatedCefrVocabulary.ts`
- `/node_modules/.vite/deps/gsap.js`
- `/node_modules/.vite/deps/@gsap_react.js`
- `/node_modules/.vite/deps/@supabase_supabase-js.js`

These are not HTTP 404/500 app failures. They are consistent with rapid Playwright navigation interrupting in-flight Vite module requests. The old script also did not filter benign external media/embed failures.

Confirmed route wiring in `App.tsx` includes the target routes:

- `/`
- `/learning-path`
- `/lessons/:lessonId`
- `/english-speed`
- `/shadowing`
- `/words`
- `/practice`

No console errors were reported, so the evidence does not point to a runtime crash.

## Diagnosis 2 — `failedRouteTextChecks: 12`

The old route checks used short waits and brittle/hidden text expectations. Examples:

- `/learning-path` expected `Nghe`, but that skill-focus chip can be hidden on base/mobile layouts and may not be immediately visible before lazy route content finishes loading.
- The old script used `settle()` with only `80ms`, so it could read shell/loading content before route modules and lazy components finished rendering.
- Every failed route still had `navigation.ok: true`, no visible `Chưa có dữ liệu`, and a valid app title.

This points to QA script timing/anchor selection rather than route 404 or blank runtime failure.

## Diagnosis 3 — `dailyRewardSaved: false`

The old QA script checked the wrong localStorage key and wrong state shape:

- Old key checked by QA: `p-english:daily-rewards`
- Actual key in app: `penglish.daily.rewards.v1`

The actual `DailyRewardState` shape is:

- `streakDays`
- `lastActiveDate`
- `bubbles`
- `maxBubbles`
- `completedToday`
- `updatedAt`

The old QA checked old/nonexistent fields:

- `history`
- `lastActivityDate`

`LessonListeningPractice` does perform a real learning action before checking rewards: it completes the listening summary and calls:

```ts
recordLearningActivity('lesson', lesson.id);
```

Therefore `dailyRewardSaved: false` was a QA-script verification bug, not confirmed app logic failure.

## Diagnosis 4 — central vs detailed lesson progress

The old report showed detailed listening progress under:

`p-english:lesson-progress:a1-listening-meeting-classmate`

and `centralLessonProgress: null` for:

`penglish.lesson.progress.v1`

This is expected with the current architecture:

- `penglish.lesson.progress.v1` stores lesson completion records used by `markLessonStarted`, `markLessonStepCompleted`, and `markLessonCompleted`.
- `p-english:lesson-progress:${lessonId}` stores detailed per-mode progress used by `readLessonProgress`, `writeLessonProgress`, and `mergeLessonProgress`.

Listening practice correctly uses `mergeLessonProgress`, so the detailed per-mode key is the right place for listening attempts.

## Fixes applied to QA script

Updated `scripts/penglish-a1-listening-adaptation-qa.cjs` to:

1. Detect active Vite dev server URL from common ports:
   - 5173
   - 5174
   - 5175
   - 5176
   - 5185
2. Use more stable route anchors and longer waits.
3. Ignore benign external media/embed request failures.
4. Ignore interrupted Vite module requests with `net::ERR_ABORTED`.
5. Use the correct daily reward key:
   - `penglish.daily.rewards.v1`
6. Verify daily reward state using actual fields:
   - `completedToday`
   - `lastActiveDate`
7. Keep route checks strict enough to verify meaningful content for required pages.

## App code changes needed?

No confirmed app source bug was identified during diagnosis. The app already:

- Saves listening detail progress after completing a real listening flow.
- Calls `recordLearningActivity('lesson', lesson.id)` after listening summary.
- Has the required routes wired in `App.tsx`.
- Avoids visible broken `Chưa có dữ liệu` in the old QA output.
- Has mobile-safe padding on English Speed and route shells inspected.

The only confirmed fix at this stage is QA script recovery.

## Next validation steps

1. Run build: `npm run build -w @pshare/web`
2. Run lesson validation/audit script if available.
3. Rerun: `node scripts/penglish-a1-listening-adaptation-qa.cjs`
4. Inspect updated QA output.
5. Write final recovery report.
