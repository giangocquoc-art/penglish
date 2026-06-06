# PENGLISH-REWARD-01 — Local Daily Rewards

## Summary

Implemented local-only daily learning streak and `Bọt biển` reward logic for P-English. The reward state is stored only in browser `localStorage`, is updated by real learning actions, and is surfaced in the Header/Topbar, Sidebar, and Home dashboard without adding APIs, login, paid/pro mode, or server progress uploads.

## Files changed

- `apps/web/src/lib/p-english/daily-rewards.ts` — new local daily reward helper.
- `apps/web/src/lib/p-english/lesson-progress.ts` — records lesson completion as a learning activity.
- `apps/web/src/lib/p-english/vocabulary-review.ts` — records known/review/difficult vocabulary actions.
- `apps/web/src/hooks/useShadowingProgress.ts` — records practiced shadowing sentences.
- `apps/web/src/pages/EnglishSpeedPage.tsx` — records completed English Speed recordings.
- `apps/web/src/components/Topbar.tsx` — displays `Chuỗi học` and `Bọt biển` from local reward state.
- `apps/web/src/components/Sidebar.tsx` — displays local reward streak and `Bọt biển` in desktop sidebar.
- `apps/web/src/pages/HomePage.tsx` — displays reward streak, bubbles, and today activity message.
- `scripts/penglish-reward-qa.cjs` — Playwright QA script for local reward behavior and screenshots.

## localStorage schema

Storage key:

```text
penglish.daily.rewards.v1
```

State shape:

```ts
type DailyRewardState = {
  streakDays: number;
  lastActiveDate?: string;
  bubbles: number;
  maxBubbles: number;
  completedToday: string[];
  updatedAt: string;
};
```

Activity keys use this format:

```text
<activityType>:<activityId>
```

Supported activity types:

```ts
type LearningActivityType = 'lesson' | 'vocabulary' | 'shadowing' | 'english-speed';
```

## Daily streak behavior

The new helper exposes:

```ts
recordLearningActivity(activityType, activityId)
```

Behavior:

- First valid learning action of a day sets `lastActiveDate` to today.
- If the previous active date was yesterday, `streakDays` increments by 1.
- If there was no previous active date or the previous date was older than yesterday, `streakDays` becomes 1.
- Repeated learning actions on the same day do not increment the streak again.
- Same-day actions are still tracked in `completedToday` if they are distinct activities.
- Old `completedToday` entries are cleared when reading state on a later date.

## Bọt biển behavior

- `maxBubbles` is 5.
- New/default local reward state starts at `bubbles = 5`.
- Current implementation does not add penalties.
- Learning activity recording keeps reward bubbles full at `5/5`.
- Existing legacy learning-hearts behavior remains separate and unchanged.

## Learning integrations added

- Lesson completion: `markLessonCompleted()` calls `recordLearningActivity('lesson', lessonId)`.
- Vocabulary review: `saveWordReviewStatus()` calls `recordLearningActivity('vocabulary', wordId)` for non-`new` statuses.
- Shadowing: `markPracticed()` calls `recordLearningActivity('shadowing', lessonId:lineId)`.
- English Speed: recording completion calls `recordLearningActivity('english-speed', promptId)` after local recording progress is saved.

## UI updates

- Header/Topbar shows local reward streak and `Bọt biển 5/5`.
- Sidebar shows local reward streak and `Bọt biển 5/5`.
- Home dashboard uses local reward streak for `Chuỗi học`.
- Home dashboard shows `Bọt biển` summary.
- Home dashboard shows this message after at least one activity today:

```text
Hôm nay bạn đã có hoạt động học.
```

## Browser QA result

Command:

```text
node scripts/penglish-reward-qa.cjs
```

Result:

```text
PASS
```

Verified:

- Cleared reward localStorage.
- Performed one vocabulary review action.
- Confirmed `streakDays` becomes 1.
- Confirmed same-day repeated vocabulary action does not increment streak again.
- Performed one shadowing practiced action.
- Confirmed `completedToday` contains both `vocabulary:` and `shadowing:` entries.
- Confirmed Home UI shows the today activity message.
- Confirmed UI shows `Chuỗi học` and `Bọt biển 5/5`.
- Reloaded and confirmed localStorage persistence.
- Tested mobile viewport `390x844` and desktop sidebar viewport `1366x900`.
- Confirmed no console errors.
- Confirmed no unexpected progress/audio server writes.

Observed QA state after actions:

```json
{
  "streakDays": 1,
  "lastActiveDate": "2026-05-31",
  "bubbles": 5,
  "maxBubbles": 5,
  "completedToday": [
    "vocabulary:cefr-a1-core:a1-a-determiner-001",
    "shadowing:curated-a1-greeting-friend:curated-a1-greeting-friend-s1"
  ]
}
```

## Screenshots saved

- `reports/screenshots/penglish-dashboard/rewards-home-mobile.png`
- `reports/screenshots/penglish-dashboard/rewards-sidebar-desktop.png`
- `reports/screenshots/penglish-dashboard/rewards-after-activity.png`

## Build validation

TypeScript:

```text
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Result:

```text
PASS
```

Production build:

```text
npm.cmd run build -w @pshare/web
```

Result:

```text
PASS
```

Build completed successfully with the existing Vite chunk-size warning for large bundles.

## Notes

- All new reward progress is local/device-only.
- No API endpoints were added.
- No login requirement was added.
- No paid/pro mode was added.
- Existing legacy streak and learning-hearts helpers were left intact for compatibility, while the requested Header/Sidebar/Home reward surfaces now use the new local daily reward helper.
