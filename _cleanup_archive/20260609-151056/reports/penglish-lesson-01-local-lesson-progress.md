# PENGLISH-LESSON-01 — Local lesson/unit completion progress

## Summary

Implemented local/device-only lesson completion progress for P-English lessons without adding API, login, server sync, or changing English Speed, Shadowing, and Vocabulary logic.

## Files changed

- [`apps/web/src/lib/p-english/lesson-progress.ts`](../apps/web/src/lib/p-english/lesson-progress.ts)
  - Added the new completion progress store and exported helpers.
  - Preserved the existing detailed per-mode lesson progress helpers.
  - Synced completed lessons into the legacy local completion store for compatibility with existing dashboard/unit calculations.
- [`apps/web/src/pages/LessonPage.tsx`](../apps/web/src/pages/LessonPage.tsx)
  - Marks a lesson as started when a valid lesson opens.
  - Marks lesson sections as completed when users navigate between lesson sections.
  - Adds an explicit final completion CTA: `Hoàn thành bài học`.
  - Marks the lesson completed only from real completion paths: final CTA or existing 100% real mode progress.
- [`apps/web/src/lib/p-english/cefr-progress.ts`](../apps/web/src/lib/p-english/cefr-progress.ts)
  - Merges the new lesson completion store with legacy completed lesson IDs when calculating completed units.
- [`apps/web/src/pages/HomePage.tsx`](../apps/web/src/pages/HomePage.tsx)
  - Listens for the new lesson progress update event so local completion changes can refresh dashboard state.
- [`apps/web/src/pages/LearningPathPage.tsx`](../apps/web/src/pages/LearningPathPage.tsx)
  - Listens for the new lesson progress update event so local completion changes can refresh CEFR/unit progress.
- [`scripts/penglish-lesson-progress-qa.cjs`](../scripts/penglish-lesson-progress-qa.cjs)
  - Added browser QA for mobile local lesson start/completion persistence, Home update, Learning Path update, screenshots, no overflow, and no unexpected server writes.

## Local storage schema

Storage key:

```text
penglish.lesson.progress.v1
```

Record schema:

```ts
type LessonProgressRecord = {
  lessonId: string;
  unitId?: string;
  status: "started" | "completed";
  completedSteps: string[];
  completedAt?: string;
  updatedAt: string;
};

type LessonProgressStore = Record<string, LessonProgressRecord>;
```

Exported helpers in [`apps/web/src/lib/p-english/lesson-progress.ts`](../apps/web/src/lib/p-english/lesson-progress.ts):

- `getLessonProgress()`
- `markLessonStarted(lessonId, unitId?)`
- `markLessonStepCompleted(lessonId, stepId)`
- `markLessonCompleted(lessonId, unitId?)`
- `getCompletedLessonCount()`
- `getCompletedUnitCount()`

New event:

```text
penglish.lesson.progress.updated
```

## Lesson start/completion behavior

- Opening a valid lesson calls `markLessonStarted(lesson.id, lesson.unitId)`.
- Opening a lesson does not create `completedAt` and does not mark the lesson completed.
- Section navigation records completed lesson section IDs in `completedSteps`.
- The final `Review` section includes the explicit CTA `Hoàn thành bài học`.
- Clicking the CTA marks the current section completed, then calls `markLessonCompleted(lesson.id, lesson.unitId)`.
- If existing real per-mode progress reaches 100%, the lesson is also marked completed through the same helper.
- Reopening a completed lesson preserves `status: "completed"` and does not downgrade it to `started`.

## Integration result

- Home uses the existing unified dashboard engine and legacy completed lesson compatibility sync.
- Learning Path reads the new completion store through CEFR progress summary logic.
- Both Home and Learning Path listen for the new local lesson progress event.
- Browser QA confirmed the completed record persisted after reload.

## Browser QA result

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$job = Start-Job -ScriptBlock { Set-Location 'c:/Users/nltn0/OneDrive/Máy tính/PSVip_RELEASE_KH'; npm.cmd run dev -w @pshare/web -- --host 127.0.0.1 --port 5180 --strictPort }; Start-Sleep -Seconds 8; try { node scripts/penglish-lesson-progress-qa.cjs } finally { Stop-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -ErrorAction SilentlyContinue }"
```

Result:

```json
{
  "ok": true,
  "baseUrl": "http://127.0.0.1:5180",
  "lessonId": "unit-1-greetings-introduction",
  "viewports": ["mobile 390x844"],
  "completedRecord": {
    "lessonId": "unit-1-greetings-introduction",
    "unitId": "unit-1-greetings",
    "status": "completed",
    "completedSteps": ["overview", "review"]
  },
  "learningPathSummary": "Unit hoàn thành 2/12",
  "consoleErrors": [],
  "failedRequests": [],
  "unexpectedProgressWrites": [],
  "errors": []
}
```

Screenshots saved under [`reports/screenshots/penglish-dashboard/`](screenshots/penglish-dashboard/):

- [`reports/screenshots/penglish-dashboard/lesson-started-mobile.png`](screenshots/penglish-dashboard/lesson-started-mobile.png)
- [`reports/screenshots/penglish-dashboard/lesson-completed-mobile.png`](screenshots/penglish-dashboard/lesson-completed-mobile.png)
- [`reports/screenshots/penglish-dashboard/lesson-progress-home-update.png`](screenshots/penglish-dashboard/lesson-progress-home-update.png)
- [`reports/screenshots/penglish-dashboard/lesson-progress-learning-path-update.png`](screenshots/penglish-dashboard/lesson-progress-learning-path-update.png)

QA confirmed:

- Started record is created after opening `/lessons/unit-1-greetings-introduction`.
- Opening the lesson does not complete it.
- Completion CTA saves a completed record with `completedAt`.
- `completedSteps` includes `review`.
- Home shows at least one completed unit count after completion.
- Learning Path shows completed unit progress after completion.
- Completed record persists after reload.
- Mobile viewport `390x844` has no horizontal overflow.
- No console errors, unexpected failed requests, or progress/audio server writes were detected.

## TypeScript and build validation

Passed:

```text
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Passed:

```text
npm.cmd run build -w @pshare/web
```

Build note:

- Vite emitted only the existing chunk-size warning; no TypeScript or production build failure occurred.
