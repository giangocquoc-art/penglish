# PENGLISH-DASHBOARD-QA — Final QA

## Summary

Final QA completed for the P-English dashboard, local progress, lesson progress, rewards, and key learning routes. No product redesign or new features were added. One small QA-script correction was made so the vocabulary due-count assertion keeps the reviewed word in `review` status instead of changing it to `known` before checking the Home dashboard.

## TypeScript result

Command:

```text
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Result:

```text
PASS
```

## Build result

Command:

```text
npm.cmd run build -w @pshare/web
```

Result:

```text
PASS
```

The build completed successfully. Vite emitted the existing large-chunk warning for `vendor-ui`, but there were no build failures.

## Routes tested

Tested with Playwright through `scripts/penglish-dashboard-final-qa.cjs`:

- `/home`
- `/learning-path`
- `/lessons/unit-1-greetings-introduction`
- `/english-speed`
- `/shadowing`
- `/words`

## Viewports tested

- Desktop: `1366x768`
- Mobile: `390x844`

## Dashboard result

Result: `PASS`

Verified:

- Home dashboard shows local progress summary.
- Empty/default local state does not show fake vocabulary, shadowing, or lesson progress.
- Recommended action starts with the learning continuation CTA on an empty state.
- After marking vocabulary as review and shadowing as practiced/difficult, Home updates the recommended action to vocabulary review.
- Vocabulary due count updates from `0` to `1` after a review action.
- Shadowing practiced count updates from `0` to `1`.
- Shadowing difficult count updates from `0` to `1`.
- Dashboard keeps local-only copy: `Mọi dữ liệu đang được lưu trên thiết bị này.`

## Learning path result

Result: `PASS`

Verified:

- Learning path renders on mobile.
- Local progress hints are visible.
- Unit/progress text is based on local data and route state, not fake completion.
- Mobile layout had no horizontal overflow.

## Lesson progress result

Result: `PASS`

Verified:

- Opening `/lessons/unit-1-greetings-introduction` creates a started local lesson record.
- Completing the lesson creates a completed local lesson record.
- Completed record includes `completedAt`.
- Completed record persists after reload.
- Lesson completion also updates rewards with `lesson:unit-1-greetings-introduction` in `completedToday`.

Observed completed lesson record:

```json
{
  "lessonId": "unit-1-greetings-introduction",
  "unitId": "unit-1-greetings",
  "status": "completed",
  "completedSteps": ["overview", "review"],
  "completedAt": "2026-05-31T06:37:09.060Z"
}
```

## Rewards result

Result: `PASS`

Verified:

- First learning action today sets `streakDays` to `1`.
- Repeating a same-day vocabulary action does not increment streak beyond `1`.
- `Bọt biển` displays as `5/5`.
- Rewards persisted after reload.
- `completedToday` includes vocabulary, shadowing, and lesson activity keys after the test flow.

Observed final rewards state:

```json
{
  "streakDays": 1,
  "lastActiveDate": "2026-05-31",
  "bubbles": 5,
  "maxBubbles": 5,
  "completedToday": [
    "vocabulary:cefr-a1-core:a1-a-determiner-001",
    "shadowing:curated-a1-greeting-friend:curated-a1-greeting-friend-s1",
    "lesson:unit-1-greetings-introduction"
  ]
}
```

## Regression result

Result: `PASS`

Verified:

- English Speed route renders and still exposes the recording UI.
- Shadowing progress still works through practiced and difficult actions.
- Vocabulary review still works and updates local review storage.
- No audio/progress upload requests were observed during this local QA flow.
- Ambient Poo/ocean visuals did not block interactions in tested flows.

## Mobile result

Result: `PASS`

Verified on `390x844`:

- Home dashboard readable and functional.
- Learning path readable and functional.
- Lesson completion flow works.
- Shadowing and vocabulary actions work.
- No horizontal overflow detected on tested mobile routes.

## Console/network result

Result: `PASS`

Observed:

- Console errors: `0`
- Failed requests: `0`
- Unexpected audio/progress upload writes: `0`
- Horizontal overflow errors: `0`

## Screenshots saved

- `reports/screenshots/penglish-dashboard/final-qa/dashboard-final-home-mobile.png`
- `reports/screenshots/penglish-dashboard/final-qa/dashboard-final-home-desktop.png`
- `reports/screenshots/penglish-dashboard/final-qa/dashboard-final-learning-path-mobile.png`
- `reports/screenshots/penglish-dashboard/final-qa/dashboard-final-lesson-complete.png`
- `reports/screenshots/penglish-dashboard/final-qa/dashboard-final-rewards-sidebar.png`
- `reports/screenshots/penglish-dashboard/final-qa/dashboard-final-console-check.png`

## QA script

Created:

- `scripts/penglish-dashboard-final-qa.cjs`

Run command used:

```text
cmd.exe /c "set PENGLISH_DASHBOARD_FINAL_QA_BASE_URL=http://127.0.0.1:5181&& node scripts\penglish-dashboard-final-qa.cjs"
```

Result:

```text
PASS
```

## Remaining issues

None found in this QA round.

## Ready to stop

Yes. This round is ready to stop.
