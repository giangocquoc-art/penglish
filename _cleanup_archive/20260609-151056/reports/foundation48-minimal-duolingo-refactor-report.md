# Foundation48 Minimal Duolingo-style Refactor Report

## Summary

Refactored the existing P-English Foundation48 “48 ngày lấy gốc” experience into a minimalist daily lesson flow without rebuilding the feature, removing routes, changing the 48-day curriculum order, touching Supabase, deploying, or using remote Drive tooling.

## What changed

### 1. Main Foundation48 page

- Simplified the route `/luyen-tieng-anh/48-ngay-lay-goc` into:
  - Simple title: `48 ngày lấy gốc`
  - Subtitle: `Mỗi ngày một bài ngắn, đi lại từ nền tảng đến tự tin nói tiếng Anh.`
  - Continue card with recommended/current day, completed days, progress bar, and `Học tiếp` CTA.
  - Poo guide message: `Không cần học nhanh, chỉ cần học chắc từng ngày.`
  - Compact daily path with Day 1–48 cards.
  - Subtle stage labels for all 8 original stages.
- Replaced the previous heavy dashboard/roadmap layout with a focused daily path while preserving all existing route behavior.

### 2. Daily lesson page

- Refactored `/luyen-tieng-anh/48-ngay-lay-goc/ngay/:dayNumber` into a step-based daily lesson experience.
- Each day now builds compact steps from existing local content:
  - `intro`
  - `explain`
  - `example`
  - `practice`
  - `listening` when audio exists
  - `video` when video source is detected
  - `source-material`
  - `mini-test`
  - `complete`
- Page top now shows:
  - Back to 48 days
  - Day number
  - Day title
  - Stage name
  - Step progress indicator and progress bar
- Main content now shows one focused card at a time with:
  - `Tiếp tục`
  - `Quay lại`
  - `Hoàn thành ngày học`
- Bottom previous/next day navigation remains available.

### 3. Source and bundle optimization

- Updated the Foundation48 asset generator so runtime source metadata no longer embeds full raw Markdown excerpts.
- `foundation48SourceIndex.ts` now keeps `lessonMarkdown` and `testMarkdown` empty instead of bundling large Markdown strings.
- Added compact generated summary metadata in `foundation48LessonSummaries.ts`.
- Build output confirms Foundation48 chunks are now small:
  - `Foundation48Page`: 7.76 kB minified / 3.02 kB gzip
  - `Foundation48DayPage`: 13.11 kB minified / 4.73 kB gzip
  - shared Foundation48 source badge/data chunk: 100.99 kB minified / 20.17 kB gzip

### 4. Audio behavior

- Audio days render a dedicated listening step titled `Nghe và làm quen`.
- The listening step subtitle is `Nghe file của ngày này, sau đó bấm tiếp tục.`
- Multiple MP3 files are shown with existing labels such as `File nghe 1`, `File nghe 2`, etc.
- No autoplay was added.
- Day 1 has no audio section.
- Day 21 and Day 29 both show playable audio items from public asset URLs.

### 5. Video behavior

- Day 19 detects a local MP4 source.
- No broken video player is rendered.
- The UI shows the safe message: `Video nguồn đã được phát hiện nhưng chưa được public hóa.`

### 6. Progress behavior

- Progress remains localStorage-only.
- Opening a day marks it started.
- Completing a step records the step id.
- Completing a day records all step ids and marks the day completed.
- Completed progress persists across refresh on the same device.
- Completion panel suggests the next day when available.

## Files changed

- `scripts/generate-foundation48-assets.cjs`
  - Generates compact summaries and stops embedding raw Markdown into runtime source metadata.
- `apps/web/src/features/foundation48/foundation48Types.ts`
  - Added summary and lesson-step types.
  - Added completed step tracking to progress type.
- `apps/web/src/features/foundation48/foundation48Data.ts`
  - Wires compact lesson summaries into day data.
- `apps/web/src/features/foundation48/foundation48LessonSummaries.ts`
  - New generated compact per-day summary metadata.
- `apps/web/src/features/foundation48/foundation48SourceIndex.ts`
  - Regenerated without raw Markdown payloads.
- `apps/web/src/features/foundation48/Foundation48Page.tsx`
  - Simplified into minimal header, continue card, and daily path.
- `apps/web/src/features/foundation48/Foundation48Roadmap.tsx`
  - Rebuilt as compact daily path with subtle stage labels.
- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
  - Rebuilt as focused stepper daily lesson experience.
- `apps/web/src/features/foundation48/Foundation48AudioPlayer.tsx`
  - Supports compact listening-step copy.
- `apps/web/src/features/foundation48/foundation48Progress.ts`
  - Tracks started days, completed days, completed steps, and optional mini-test score.
- `scripts/foundation48-minimal-qa.cjs`
  - Added Playwright QA script for the requested Foundation48 routes and screenshots.

## Validation

### TypeScript

Command:

```bash
npx tsc -p apps/web/tsconfig.json --noEmit
```

Result: Passed.

### Production build

Command:

```bash
npm run build -w @pshare/web
```

Result: Passed.

Build warning: existing large app/vendor chunks remain (`vendor-ui`, `index`) but Foundation48-specific chunks are no longer large from raw Markdown content.

### Browser QA

Dev server used:

```bash
npm run dev -w @pshare/web -- --host 127.0.0.1 --port 5180
```

QA command:

```bash
node scripts/foundation48-minimal-qa.cjs
```

Result: Passed.

Verified:

- Main route opens.
- Day 1 opens and has no audio section.
- Day 21 opens and reaches `Nghe và làm quen` listening step with audio items.
- Day 29 opens and reaches `Nghe và làm quen` listening step with audio items.
- Day 19 shows safe video notice instead of a broken video player.
- Day 48 opens.
- Desktop and mobile main layouts do not horizontally overflow.

## Screenshots saved

- `reports/screenshots/foundation48-minimal-main-desktop.png`
- `reports/screenshots/foundation48-minimal-main-mobile.png`
- `reports/screenshots/foundation48-day1-step-lesson.png`
- `reports/screenshots/foundation48-day21-listening-step.png`
- `reports/screenshots/foundation48-day29-listening-step.png`
- `reports/screenshots/foundation48-day48-final.png`

## Notes

- Supabase was not touched.
- No deployment was performed.
- No `gdown`, `rclone`, or Google Drive tooling was used.
- The original 48-day curriculum order and 8-stage grouping were preserved.
