# Foundation48 Stage 4 — Days 18–21 Implementation Report

## Summary

Foundation48 Stage 4 has been implemented for Days 18–21 with interactive listening and pronunciation-focused lesson content. The new content covers pronunciation with teacher-style listen/repeat prompts, syllable and stress awareness, WH-question listening practice, and number/name listening practice.

The Stage 4 content is isolated in a dedicated lazy-loaded module and is resolved only through the shared Foundation48 deep lesson resolver. No page-local lazy imports were introduced, and Days 13–17 remain covered by the existing Stage 3 lazy path.

## Changed files

### Stage 4 implementation

- `apps/web/src/features/foundation48/foundation48DeepLessons.stage4.lazy.ts`
  - New lazy Stage 4 deep lesson module for Days 18–21.
- `apps/web/src/features/foundation48/foundation48DeepLessonResolver.ts`
  - Extended shared resolver to support Stage 4 lazy loading for Days 18–21.
  - Preserved Stage 3 lazy loading for Days 13–17.
- `apps/web/src/features/foundation48/foundation48Data.ts`
  - Added lightweight Stage 4 readiness/title metadata without importing the full Stage 4 lesson module.
- `scripts/foundation48-stage4-days18-21-qa.cjs`
  - New Playwright regression QA script for Stage 4 routes, screenshots, lazy loading, layout, console, and network checks.
- `reports/foundation48-stage4-days18-21-qa-results.json`
  - Generated automated QA result.
- `reports/foundation48-stage4-days18-21-report.md`
  - This final report.

### Pre-existing modified files observed in git status

The working tree also contains earlier Foundation48 Stage 3/3.5 modifications, including:

- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
- `apps/web/src/features/foundation48/Foundation48Roadmap.tsx`
- `apps/web/src/features/foundation48/foundation48DeepLessons.ts`
- `apps/web/src/features/foundation48/foundation48Progress.ts`
- `apps/web/src/features/foundation48/foundation48DeepLessons.stage3.lazy.ts`

These were treated as existing foundation work for Stage 4 and were not intentionally reworked beyond the Stage 4 integration path.

## Days 18–21 content summary

### Day 18 — Học ngữ âm với giáo viên nước ngoài

Focus:

- Listen carefully / repeat-after-me practice.
- Slow and clear pronunciation.
- Final sound awareness.

Included learning material:

- Warm-up and learning goal.
- Pronunciation explanation.
- Pattern cards for teacher-style listening instructions.
- Vocabulary cards such as `listen carefully`, `repeat`, `sound`, `slowly`, `clearly`, `final sound`, `teacher`, and `voice`.
- Listen-and-choose practice.
- Speaking/shadowing repeat prompts.
- Fill-blank and multiple-choice checks.
- Completion summary and review notes.

### Day 19 — Tìm hiểu về trọng âm trong tiếng Anh

Focus:

- Syllable awareness.
- Word stress recognition.
- Rhythm when repeating short sentences.

Included learning material:

- Warm-up and goal around hearing strong syllables.
- Stress/syllable explanation.
- Pattern cards for first/second syllable stress.
- Vocabulary cards for stress and rhythm awareness.
- Listen-and-choose stress practice.
- Speaking repeat tasks focused on rhythm.
- Fill-blank, multiple-choice, and ordering-style checks where useful.
- Completion summary and review notes.

### Day 20 — Các câu hỏi với từ để hỏi khác trong tiếng Anh

Focus:

- WH-question listening practice.
- `why`, `how`, `how many`, and `which` recognition.
- Short answers beginning with `because`.

Included learning material:

- Warm-up and goal for identifying WH-question meaning from listening.
- WH-question explanation.
- Pattern cards for common question forms.
- Vocabulary and sentence practice around short everyday questions.
- Listen-and-choose WH-question challenges.
- Speaking repeat prompts.
- Fill-blank, multiple-choice, and sentence-order quiz items.
- Completion summary and review notes.

### Day 21 — Luyện nghe số và tên

Focus:

- Listening for names.
- Listening for numbers.
- Basic spelling and number contrast.

Included learning material:

- Warm-up and goal for hearing names/numbers accurately.
- Listening explanation for numbers and names.
- Pattern cards for asking names, spelling, and numbers.
- Vocabulary cards for common name/number listening contexts.
- Listen-and-choose number/name challenges.
- Speaking/shadowing repeat prompts.
- Fill-blank, multiple-choice, and ordering-style checks where useful.
- Completion summary and review notes.

## Lazy module and resolver notes

Stage 4 lessons are stored in:

- `apps/web/src/features/foundation48/foundation48DeepLessons.stage4.lazy.ts`

The shared resolver now supports two lazy ranges:

- Stage 3: Days 13–17.
- Stage 4: Days 18–21.

All deep lesson reads continue to go through:

- `apps/web/src/features/foundation48/foundation48DeepLessonResolver.ts`

No Stage 4 full-content import was added to the roadmap or day page. `foundation48Data.ts` only contains lightweight readiness/title metadata for Days 18–21 so the roadmap can show polished status without pulling Stage 4 content into the main bundle.

## Progress and vocabulary sync notes

Progress/vocabulary sync remains resolver-based through `foundation48Progress.ts`.

Preserved persistence contract:

- localStorage key: `penglish-foundation48-progress-v1`
- update event: `penglish-foundation48-progress-updated`

The progress layer can read cached lessons immediately when available and asynchronously resolve lazy lessons through the shared resolver for vocabulary sync. This keeps Days 18–21 compatible with the existing Foundation48 progress model.

## Build result

Command run:

```txt
npm run build --workspace apps/web
```

Result:

- Build passed.
- Vite production build completed successfully.
- Build finished with `✓ built in 14.86s`.

Relevant lazy chunks emitted:

- `dist/assets/foundation48DeepLessons.stage4.lazy-CT3psZO8.js` — `8.07 kB`, gzip `3.12 kB`
- `dist/assets/foundation48DeepLessons.stage3.lazy-CyfsMraI.js` — `10.67 kB`, gzip `3.61 kB`

## Automated Playwright QA result

Command run:

```txt
node scripts/foundation48-stage4-days18-21-qa.cjs
```

Result file:

- `reports/foundation48-stage4-days18-21-qa-results.json`

Summary:

- `ok: true`
- Checks: `11`
- Errors: `0`
- Console errors: `0`
- Failed requests: `0`
- Stage 4 lazy module request observed:
  - `http://127.0.0.1:5180/src/features/foundation48/foundation48DeepLessons.stage4.lazy.ts`

Routes covered:

- `/luyen-tieng-anh/48-ngay-lay-goc`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/18`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/19`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/20`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/21`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/13`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/17`

Viewport coverage:

- Desktop `1440x950`
- Mobile `390x844`
- Mobile `375x812`

Checks included:

- Correct route content and real Stage 4 titles render.
- Progress/status indicator visible.
- Main CTA visible.
- Mobile bottom navigation visible and not overlapping critical content.
- No horizontal overflow detected.
- No console errors.
- No critical failed requests.
- Stage 4 lazy module request loaded.
- Stage 3 regression routes for Days 13 and 17 still render.

## Browser MCP QA result

### Chrome DevTools MCP

Chrome DevTools MCP QA could not be completed because the `cW49ZA` MCP server connection was unavailable. The tool returned:

```txt
No connection found for server: cW49ZA. Please make sure to use MCP servers available under 'Connected MCP Servers'.
```

This is recorded as an MCP availability limitation rather than an application failure.

### Playwright MCP alternate QA

Playwright MCP was used as the available browser-MCP fallback.

Observed results:

- Roadmap mobile route loaded successfully.
- Day 18 mobile route loaded successfully.
- Day 21 mobile route loaded successfully.
- Day 21 showed the correct Stage 4 title: `Luyện nghe số và tên`.
- Day 21 showed the correct group label: `Chặng 4: Phát âm, trọng âm và câu hỏi`.
- Day 21 showed the correct learning goal: `Nghe số, tên người và đánh vần ngắn trong tình huống cơ bản.`
- CTA `Tiếp tục` visible.
- Top progress/status visible through `Bọt biển 5/5`.
- Mobile bottom navigation visible and not overlapping the main content.
- Console warnings/errors inspected: `0` warnings, `0` errors.
- Network inspection confirmed HTTP 200 for:
  - Day 21 route.
  - `foundation48DeepLessonResolver.ts`.
  - `foundation48DeepLessons.stage4.lazy.ts`.

## Screenshots

Generated under `reports/screenshots`:

- `reports/screenshots/foundation48-stage4-roadmap-desktop.png`
- `reports/screenshots/foundation48-stage4-roadmap-mobile.png`
- `reports/screenshots/foundation48-stage4-roadmap-mobile-375.png`
- `reports/screenshots/foundation48-stage4-day18-mobile.png`
- `reports/screenshots/foundation48-stage4-day19-mobile.png`
- `reports/screenshots/foundation48-stage4-day20-mobile.png`
- `reports/screenshots/foundation48-stage4-day21-mobile.png`
- `reports/screenshots/foundation48-stage4-day18-desktop.png`
- `reports/screenshots/foundation48-stage4-day21-desktop.png`
- `reports/screenshots/foundation48-stage4-regression-day13-mobile.png`
- `reports/screenshots/foundation48-stage4-regression-day17-mobile.png`

## Known risks and notes

- Chrome DevTools MCP was unavailable, so final browser inspection was completed through automated Playwright QA plus Playwright MCP alternate inspection.
- Git status includes unrelated deleted report files under `reports/`. These were not part of the Stage 4 implementation and were left untouched.
- Several Foundation48 files were already modified by earlier Stage 3/3.5 work. Stage 4 builds on that resolver/lazy-loading architecture rather than replacing it.
- Stage 4 content is intentionally concise and beginner-safe. Future phases can add richer audio assets or native-speaker recordings if a formal audio pipeline is introduced.

## Stage 5 recommendation

Recommended next Stage 5 scope:

- Implement Days 22–28 in a new lazy module, continuing the same resolver-only architecture.
- Keep roadmap metadata lightweight in `foundation48Data.ts`.
- Add regression coverage for Days 18–21 while adding the new Stage 5 range.
- Prioritize practical speaking/listening tasks that reuse the existing interactive engine before introducing new UI primitives.
