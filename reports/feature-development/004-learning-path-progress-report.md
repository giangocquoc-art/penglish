# Task 004 — Learning Path, Progress Dashboard, and Level Confidence Report

## Scope

Executed `tasks/penglish/004-learning-path-progress.md` only. Stopped at the learning path/progress scope and did not start unrelated feature work.

## Files changed

- `apps/web/src/lib/p-english/learning-progress-summary.ts`
- `apps/web/src/pages/LearningPathPage.tsx`
- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `apps/web/src/lib/p-english/learning-path-data.ts`
- `apps/web/src/lib/animations/gsap-utils.ts`
- `apps/web/src/pages/EnglishSpeedPage.tsx`
- `reports/feature-development/004-learning-path-progress-handoff.md`
- `reports/feature-development/004-learning-path-progress-report.md`

## UX changes

### Learning path

- Added a clearer learning-path hero focused on the next step.
- Added current estimated CEFR level display.
- Added completed lesson count.
- Added next recommended lesson.
- Added XP/streak summary.
- Added CEFR A1/A2/B1/B2 scale cards.
- Added path progress bar and Vietnamese encouragement text.
- Kept Unit cards clean and reused existing layout rather than duplicating lesson cards.

### Home dashboard

- Reused existing dashboard metric cards instead of adding a duplicate progress section.
- Added CEFR level and completed lesson count to the existing metric row.
- Added overall learning-path percentage to the existing metric row.
- Updated the existing “Lộ trình đang mở” card with encouragement, path percentage, XP, and next recommended lesson.

### Lesson completion progress

- Added compact Vietnamese encouragement when a lesson reaches 100% progress.
- Added return buttons to `/learning-path` and `/home`.
- Changed the next-step card to point learners back to their progress/roadmap once the lesson is complete.

## Progress/level logic summary

A new helper module, `learning-progress-summary.ts`, computes a local learning path snapshot from existing data and local progress:

- available units
- completed units and lessons
- earned/total XP
- current streak
- average path progress percentage
- estimated CEFR band
- next recommended lesson path/title
- learner encouragement text

The CEFR bands currently use path percentage thresholds:

- A1: 0%
- A2: 35%
- B1: 65%
- B2: 90%

This is intentionally a lightweight local estimate, not a formal placement test.

## Validation results

### TypeScript

Command:

```cmd
npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
```

Result: passed after fixes.

Issues fixed during validation:

- Added `Viết` to `LearningSkillType`.
- Replaced invalid GSAP `TweenTarget` import with `gsap.TweenTarget`.
- Typed English Speed `timeLeft` as `number` instead of literal `60`.

### Build

Command:

```cmd
npm.cmd run build
```

Result: passed.

Notes:

- API TypeScript build passed.
- Web Vite build passed.
- Build warning remains: chunk larger than 500 kB after minification.

## Browser QA status

Dev server:

```cmd
curl.exe -I http://localhost:5173/
```

Result: HTTP 200 OK.

Browser checks attempted:

- `http://localhost:5173/home`
- `http://localhost:5173/learning-path`

Observed result:

- Both protected routes stayed on `Đang tải...`.
- Browser console showed no new logs.

Source of blocker identified in `apps/web/src/App.tsx`:

```tsx
if (!isPublicRoute && loading) return <div style={{ padding: 32 }}>Đang tải...</div>;
```

Likely cause:

- `useAuth()` remains in loading state in this local browser QA environment, probably waiting on auth/profile/API behavior.

Screenshots:

- No final feature screenshots were captured because the protected routes did not render beyond the loading state.
- The required external screenshot path could not be confirmed reliably in the current shell output.

## Console/network QA

- Console: no new browser console logs were reported during `/home` and `/learning-path` attempts.
- Network: full network inspection was not completed before context limit; auth loading is the likely blocker to inspect next.

## Risks and notes

- Browser QA is incomplete because protected app routes are blocked by auth loading in the local QA environment.
- CEFR level is an estimated local progress confidence indicator, not a formal CEFR assessment.
- Build passes with an existing Vite chunk-size warning.
- Minor TS fixes outside the direct Task 004 UI files were needed to satisfy required validation.

## Next recommended task

Before starting any new feature task, fix or bypass the local protected-route auth loading state for QA so `/home` and `/learning-path` can render in browser automation without manual auth setup.
