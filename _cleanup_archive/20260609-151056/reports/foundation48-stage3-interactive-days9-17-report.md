# Foundation48 Stage 3 interactive lessons — Days 9–17

## Summary

Upgraded the Foundation48 Stage 3 scope, Days 9–17, from source/fallback-style rendering into learner-facing interactive lesson flows. Days 9–12 reuse the existing complete deep lesson data. Days 13–17 now load from a dedicated lazy deep lesson module so the main Foundation48 bundle stays smaller.

The normal learner UI keeps the useful PDF/MP3 source references available through the feature context, but avoids exposing raw file clutter in the day flow.

## Changed files

- `apps/web/src/features/foundation48/foundation48DeepLessons.ts`
- `apps/web/src/features/foundation48/foundation48DeepLessons.stage3.lazy.ts`
- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
- `apps/web/src/features/foundation48/foundation48Data.ts`

## Implemented scope

- Day 9: Từ loại dễ hiểu — noun, verb, adjective trong câu ngắn
- Day 10: Đang làm gì? — hiện tại tiếp diễn
- Day 11: Mỗi ngày hay ngay bây giờ? — phân biệt simple/present continuous
- Day 12: Chuyện đã xảy ra — quá khứ đơn khẳng định
- Day 13: Hỏi chuyện đã xảy ra — Did you...? và câu trả lời ngắn
- Day 14: Tôi đã không làm — phủ định quá khứ với didn’t
- Day 15: Đã từng ở đâu? — was/were trong câu hỏi và phủ định
- Day 16: Tương lai gần — be going to
- Day 17: Tôi có thể làm — can / can’t cho khả năng

## Lesson schema summary

Each complete deep lesson produces the requested learner sequence:

- Warm-up / lesson goal intro
- Grammar explanation
- Pattern cards
- Vocabulary cards
- Listening overview and listen-and-choose challenges
- Speaking overview and speaking/shadowing repeat challenges
- Fill-blank quiz
- Multiple-choice quiz
- Sentence-order quiz
- Completion summary

## Lazy loading and progress compatibility

- Days 13–17 are stored in `foundation48DeepLessons.stage3.lazy.ts`.
- `Foundation48DayPage.tsx` dynamically imports the lazy module only for Days 13–17 when no static deep lesson exists.
- `foundation48Data.ts` contains lightweight metadata for Days 13–17 so roadmap titles and stats can show the Stage 3 days as polished without importing the full lazy lesson payload.
- Existing localStorage progress compatibility is preserved by leaving the progress storage key and event contract unchanged.
- Existing challenge result and completed-step persistence remains compatible with the current Foundation48 progress model.

## Build result

- Command: `npm run build --workspace apps/web`
- Result: passed.
- Lazy split verified by generated chunk:
  - `foundation48DeepLessons.stage3.lazy-Bm1W7Etm.js`

## Playwright MCP QA

Desktop and mobile were tested for the requested routes:

- `/luyen-tieng-anh/48-ngay-lay-goc`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/9`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/10`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/17`

Results:

- All requested routes loaded with the title: `48 ngày lấy gốc tiếng Anh — P-English`.
- Interactive lesson markers were present on the tested lesson pages.
- Day 17 lazy-loaded title was verified: `Tôi có thể làm — can / can’t cho khả năng`.
- Playwright console messages: none.
- Playwright observed one non-blocking aborted ambient whale frame request for `frame-13.png`. This appeared transient and did not block route rendering or interaction markers.

## Chrome DevTools MCP QA

- Route checked: `/luyen-tieng-anh/48-ngay-lay-goc/ngay/17`
- Console: no messages found.
- Network: all listed requests returned `200`.
- Lazy module request returned `200`:
  - `/src/features/foundation48/foundation48DeepLessons.stage3.lazy.ts`
- Ambient whale `frame-13.png` returned `200` in Chrome DevTools, so the earlier Playwright abort appears non-blocking/transient.

## Screenshots

- `reports/screenshots/foundation48-stage3-roadmap-desktop.png`
- `reports/screenshots/foundation48-stage3-day9-desktop.png`
- `reports/screenshots/foundation48-stage3-day10-desktop.png`
- `reports/screenshots/foundation48-stage3-day17-desktop.png`
- `reports/screenshots/foundation48-stage3-roadmap-mobile.png`
- `reports/screenshots/foundation48-stage3-day9-mobile.png`
- `reports/screenshots/foundation48-stage3-day10-mobile.png`
- `reports/screenshots/foundation48-stage3-day17-mobile.png`

## Known risks

- `foundation48Progress.ts` still imports only the static `foundation48DeepLessons` map for learning-loop vocabulary sync. Progress and challenge saving remain compatible for Days 13–17, but vocabulary sync for lazy-loaded days may need a shared lazy resolver in a later pass.
- The current Stage 3 lazy module solves Days 13–17 only by design. Days 18+ remain outside this batch and should not be treated as fully polished yet.

## Next recommended batch

- Polish Days 18–21 next as Stage 4.
- Consider extracting a shared lazy deep lesson resolver so both day rendering and progress/vocabulary sync can read lazy lesson modules consistently.
- Add a small regression QA script for Foundation48 lazy lesson routes after the Stage 4 expansion.
