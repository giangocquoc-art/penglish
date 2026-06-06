# P-English Product UX Logic Fix Report

## Summary

Completed a strict product-quality fix pass for the P-English ocean UI and local learning logic. The work stayed scoped to the requested UX/logic issues: ambient Poo whale subtlety, glass readability, mobile bottom-nav safety, Home daily progress logic, lesson mode labels, Shadowing fallback semantics, mobile density, copy cleanup, and product QA automation.

## Implemented fixes

### Ambient Poo whale background

- Tuned route presets in `apps/web/src/components/ocean/AmbientPooWhale.tsx` so the ambient whale remains subtle, route-aware, and lower/side-positioned.
- Reduced desktop visual size and opacity for dashboard, roadmap, lesson, speed, shadowing, and vocabulary contexts.
- Removed normal-mode GSAP opacity overrides so CSS/preset opacity controls the whale consistently.
- Preserved `pointer-events: none` behavior and reduced-motion handling.

### Glass card readability and mobile safe area

- Added requested shared glass tokens in `apps/web/src/styles.css`:
  - `--p-card-bg`
  - `--p-card-bg-mobile`
  - `--p-card-border`
  - `--p-card-blur`
- Rewired ocean shell glass styling in `apps/web/src/components/p-english/OceanPageShell.tsx` to use those tokens.
- Strengthened mobile page bottom padding using bottom-nav height plus extra safe spacing and `env(safe-area-inset-bottom)`.

### Home dashboard daily progress logic

- Replaced legacy mission-progress logic in `apps/web/src/pages/HomePage.tsx`.
- Today progress now uses local daily reward completion count:
  - `Math.min(100, Math.round((rewardState.completedToday.length / DAILY_GOAL_COUNT) * 100))`
- Kept CEFR/unit progress separate from daily progress.
- Replaced confusing empty copy with action-oriented empty-state text.

### Lesson mode status labels

- Updated `apps/web/src/lib/p-english/lesson-progress.ts` so real lesson content displays:
  - `Sẵn sàng`
  - `Đang học`
  - `Hoàn thành`
  - `Chưa có nội dung` only when content is truly missing
- Added content-aware ready text for Flashcard, Quiz, Luyện nghe, Phản xạ, Gõ câu, Ghép cặp, and Tốc độ / phát âm.
- Updated `apps/web/src/pages/LessonPage.tsx` to render the new status labels and colors correctly.

### Shadowing video fallback and copy

- Updated `apps/web/src/pages/ShadowingPage.tsx` to avoid the old black/broken-player experience as primary UI.
- Added the requested fallback message:
  - `Video này không phát trực tiếp trong web. Bạn vẫn có thể luyện bằng transcript bên dưới.`
- Updated chips/copy to use:
  - `Video tham khảo`
  - `Có link tham chiếu`
  - `Luyện bằng transcript`
- Clarified that AI feedback grades the current transcript sentence, not YouTube audio.
- Kept transcript-first practice flow intact.

### Marketing/copy cleanup

- Removed fake scale claims from `apps/web/src/pages/LandingPage.tsx`, including the prior `100k+` / `100.000+` style copy.
- Replaced with level/path/product-specific wording.

### Product QA automation

- Created `scripts/penglish-product-ux-logic-qa.cjs`.
- The script defaults to `http://127.0.0.1:5181`.
- It tests desktop `1366x768` and mobile `390x844`.
- It visits:
  - `/home`
  - `/learning-path`
  - `/lessons/unit-1-greetings-introduction`
  - `/english-speed`
  - `/shadowing`
  - `/words`
- It checks:
  - no console errors
  - no unexpected failed requests
  - no horizontal overflow
  - no effective bottom-nav blocking of interactives on mobile
  - Home today progress localStorage cases: empty, vocabulary review, shadowing practice, completed lesson, combination
  - Unit 1 has no incorrect `Chưa có dữ liệu` / `Chưa học` labels for real content
  - Shadowing has acceptable fallback/link/transcript state and no black broken iframe primary UI
  - ambient whale is subtle and does not cover core text
- Screenshots are saved to `reports/screenshots/penglish-product-ux-logic-fix/`.
- JSON QA output is saved to `reports/penglish-product-ux-logic-qa.json`.

## Validation results

All requested validation commands passed.

```text
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Result: passed with exit code `0`.

```text
npm.cmd run build -w @pshare/web
```

Result: passed with exit code `0`.

Note: Vite emitted the existing large chunk warning for `vendor-ui`, but the build completed successfully.

```text
node scripts/penglish-product-ux-logic-qa.cjs
```

Result: passed with exit code `0`.

Final QA output summary:

```json
{
  "ok": true,
  "baseUrl": "http://127.0.0.1:5181",
  "viewports": ["desktop 1366x768", "mobile 390x844"],
  "consoleErrors": [],
  "failedRequests": [],
  "errors": []
}
```

## Files changed

- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/lib/p-english/lesson-progress.ts`
- `apps/web/src/pages/LessonPage.tsx`
- `apps/web/src/pages/ShadowingPage.tsx`
- `apps/web/src/components/ocean/AmbientPooWhale.tsx`
- `apps/web/src/styles.css`
- `apps/web/src/components/p-english/OceanPageShell.tsx`
- `apps/web/src/pages/LandingPage.tsx`
- `scripts/penglish-product-ux-logic-qa.cjs`
- `reports/penglish-product-ux-logic-fix.md`

## Screenshots and artifacts

- Product QA screenshots: `reports/screenshots/penglish-product-ux-logic-fix/`
- Product QA JSON: `reports/penglish-product-ux-logic-qa.json`
- This report: `reports/penglish-product-ux-logic-fix.md`

## Outcome

The requested product-quality pass is complete. TypeScript, production build, and the product UX/logic Playwright QA all pass after targeted fixes only.
