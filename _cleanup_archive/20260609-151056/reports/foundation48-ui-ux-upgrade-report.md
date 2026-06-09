# Foundation48 UI/UX Upgrade Report

## UI files changed

- `apps/web/src/features/foundation48/Foundation48Page.tsx`
- `apps/web/src/features/foundation48/Foundation48Roadmap.tsx`
- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
- `apps/web/src/features/foundation48/Foundation48LessonRenderer.tsx`
- `apps/web/src/features/foundation48/Foundation48AudioPlayer.tsx`
- `apps/web/src/features/foundation48/Foundation48SourceNotice.tsx`
- Added `apps/web/src/features/foundation48/Foundation48MascotGuide.tsx`
- Added `apps/web/src/features/foundation48/Foundation48ProgressSummary.tsx`
- Added `apps/web/src/features/foundation48/Foundation48StageCard.tsx`
- Added `apps/web/src/features/foundation48/Foundation48DayCard.tsx`
- Added `apps/web/src/features/foundation48/Foundation48SourceBadge.tsx`

## Mascot assets found

- Poo: `apps/web/public/ocean/mascots/poo/`
- Mực Mo: `apps/web/public/ocean/mascots/muc-mo/`
- Rùa Rì: `apps/web/public/ocean/mascots/rua-ri/`
- Cua Quiz: `apps/web/public/ocean/mascots/cua-quiz/`
- Sứa Nghe: `apps/web/public/ocean/mascots/sua-nghe/`
- Cá Ngựa Tốc: `apps/web/public/ocean/mascots/ca-ngua-toc/`
- Sao Nhi: `apps/web/public/ocean/mascots/sao-nhi/`

## Mascot assets missing

- Pip does not have a dedicated asset folder. In this round, Pip is represented as a small Poo guide treatment inside `Foundation48MascotGuide`, with a Pip label badge.

## Mascot usage

- Poo: roadmap hero, main guide, early day guidance.
- Pip + Poo: Stage 1 reminder for slow, steady beginner learning.
- Mực Mo: grammar/formula stages and lesson explanation cards.
- Rùa Rì: review/checkpoint and completion reminder panel.
- Cua Quiz: practice and mini-test sections.
- Sứa Nghe: audio/listening days and MP3 player section.
- Cá Ngựa Tốc: available in the local universe, not directly needed by the current 48-day UI after preserving curriculum structure.
- Sao Nhi: completion state, final mission, Day 48 journey endpoint.

## Routes checked

- `/luyen-tieng-anh/48-ngay-lay-goc`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/1`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/21`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/29`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/48`

## Audio UI result

- Day 1 correctly has no empty audio section.
- Day 21 shows Sứa Nghe and 6 audio players; MP3 HEAD checks returned 200.
- Day 29 shows Sứa Nghe and 6 audio players; MP3 HEAD checks returned 200.
- Day 48 shows 2 audio players.
- Audio elements have aria labels and graceful per-file load warning text.

## Progress UI result

- Roadmap shows completed days, current stage, next recommended day, audio-day count, and source status.
- Day page has a Rùa Rì/Sao Nhi completion panel.
- Completion persisted after refresh through localStorage.
- No login required.

## Mobile QA result

- Tested at 390x844.
- Roadmap renders 48 clickable day cards.
- Mascot guide appears.
- No horizontal overflow detected.

## TypeScript and build

- `npx tsc -p apps/web/tsconfig.json --noEmit`: passed
- `npm run build -w @pshare/web`: passed
- Build warning remains: Vite chunk-size warning for existing large chunks and Foundation48 source metadata. The build completed successfully.

## Browser QA result

- Sidebar item visible.
- Roadmap readable, 8 stages and 48 day cards render.
- Day cards are clickable.
- Mascot guides appear on roadmap and day pages.
- Audio appears only on MP3 days checked.
- Non-audio day 1 does not show an audio player.
- Console errors: none.
- Broken local image/audio requests: none found.

## Screenshot paths

- `reports/screenshots/foundation48-ui-roadmap-desktop.png`
- `reports/screenshots/foundation48-ui-roadmap-mobile.png`
- `reports/screenshots/foundation48-ui-day1-poo-guide.png`
- `reports/screenshots/foundation48-ui-day21-audio-mascot.png`
- `reports/screenshots/foundation48-ui-day29-listening.png`
- `reports/screenshots/foundation48-ui-day48-final-mission.png`
- `reports/screenshots/foundation48-ui-sidebar.png`

## Remaining issues

- Pip has no dedicated local image asset.
- Days 9-48 remain source-rendered rather than fully editorialized interactive lessons.
- Foundation48 metadata is still bundled as a large chunk because it contains source-derived Markdown excerpts.
- The app loads an existing PayOS CDN script from the shell; this was not introduced or changed in this task.

## Recommended next UI/content round

- Create or add a real Pip asset if the mascot universe should include Pip visually.
- Move long Foundation48 source excerpts into smaller per-day lazy-loaded modules.
- Polish days 9-17 into full guided lessons with Mực Mo and Rùa Rì.
- Add lightweight mini-test scoring cards using Cua Quiz for days 1-8.
- Add a compact roadmap filter for `Tất cả`, `Đang học`, `Có file nghe`, and `Đã xong`.
