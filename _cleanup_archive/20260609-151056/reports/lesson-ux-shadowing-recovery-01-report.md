# PHASE LESSON-UX-AND-SHADOWING-RECOVERY-01 Report

Generated: 2026-05-30

## Status

This recovery phase is complete. No deployment was performed.

## Files changed

| File | Purpose |
| --- | --- |
| [`apps/web/src/pages/ShadowingPage.tsx`](../apps/web/src/pages/ShadowingPage.tsx) | Made local transcript/segment practice primary, moved YouTube to optional reference, added `youtube-nocookie` embed URLs, added timeout/error fallback copy, added `Mở trên YouTube`, and kept recording/API feedback independent from video availability. |
| [`apps/web/src/pages/LessonPage.tsx`](../apps/web/src/pages/LessonPage.tsx) | Refactored dense lesson content into 7 learner steps/tabs with a progress indicator while keeping all lesson data accessible. |
| [`apps/web/src/components/p-english/PooSwimLayer.tsx`](../apps/web/src/components/p-english/PooSwimLayer.tsx) | Added reusable subtle Poo swimming background layer with streak-based baby Poo sprites and reduced-motion support. |
| [`apps/web/src/components/p-english/OceanPageShell.tsx`](../apps/web/src/components/p-english/OceanPageShell.tsx) | Integrated the reusable Poo swimming background behind ocean page content. |
| [`apps/web/src/components/Topbar.tsx`](../apps/web/src/components/Topbar.tsx) | Replaced prominent gift/pro wording with free-first `Học miễn phí` account copy. |
| [`scripts/ux-recovery-browser-qa.cjs`](../scripts/ux-recovery-browser-qa.cjs) | Added browser QA and screenshot capture for the requested desktop/mobile recovery views. |
| [`reports/lesson-expansion-verification-report.md`](lesson-expansion-verification-report.md) | Added honest content expansion verification with current counts and unmet target status. |
| [`reports/screenshots/`](screenshots/) | Added the requested UX recovery screenshots. |

## Shadowing fallback status

Completed.

- Main learner flow is transcript-first: local Shadowing segments, current sentence, transcript list, listen/replay, recording, and feedback remain usable without video playback.
- YouTube is now treated as an optional reference.
- YouTube embeds use `youtube-nocookie` URLs.
- The fallback message is present:

> Video này không cho phát trực tiếp trong web. Bạn vẫn có thể luyện bằng transcript bên dưới.

- The fallback action `Mở trên YouTube` is present.
- Screenshot QA verified the fallback panel through `data-testid="shadowing-video-fallback"`.

Remaining note: the fallback uses a conservative fixed timeout because iframe load/error events do not reliably indicate whether a YouTube video can be embedded. This favors uninterrupted transcript practice over waiting on video availability.

## Shadowing copy status

Completed.

- Main title remains `Shadowing cùng Poo`.
- Subtitle remains `Nghe mẫu, nói theo nhịp, ghi âm rồi để Poo góp ý phát âm, nhịp nói và độ tự nhiên.`
- Sidebar already uses `Shadowing` and `Luyện nói theo nhịp`.
- Awkward `Phòng nói đuổi` / `nói đuổi cùng Poo` wording was not retained in the learner Shadowing flow.

## Lesson UX status

Completed.

The lesson page now uses a 7-step learner flow:

1. `Tổng quan`
2. `Từ vựng`
3. `Mẫu câu`
4. `Luyện tập`
5. `Nghe / Nói`
6. `Quiz`
7. `Review`

The page includes a visible step count and progress bar. Sections are no longer all expanded at once. The browser QA verified all 7 tab buttons on desktop and mobile lesson screenshots.

## Poo swim background status

Completed.

- [`PooSwimLayer`](../apps/web/src/components/p-english/PooSwimLayer.tsx) is reusable and layered behind page cards/content.
- It uses the existing Poo mascot assets from [`apps/web/public/ocean/mascots/poo/`](../apps/web/public/ocean/mascots/poo/).
- Motion is subtle and respects reduced-motion preferences.
- Baby Poo sprites are displayed based on streak/chain level, capped at 3.
- Integration through [`OceanPageShell`](../apps/web/src/components/p-english/OceanPageShell.tsx) covers Home, Learning Path, Lesson, English Speed, Shadowing, and Vocabulary pages because those pages render through the ocean shell.
- Browser QA verified `.poo-swim-layer` exists and is visible on the requested target screenshots.

## Expansion verification result

Expansion targets are not met. This is expected for this recovery phase.

> Expansion is pending; current phase only fixes UX/foundation.

Current counts from [`reports/penglish-learning-data-audit.json`](penglish-learning-data-audit.json) and the local question-like count:

| Area | Current count | Target | Status |
| --- | ---: | ---: | --- |
| Runtime lessons | 44 | 80+ new micro-lessons | Not met |
| Vocabulary items | 260 | 400+ vocabulary items | Not met |
| English Speed prompts | 42 | 120+ prompts | Not met |
| Shadowing catalog items | 14 | 60+ segments/items | Not met |
| Runtime quiz questions only | 100 | 400+ quiz/practice questions | Not met |
| Runtime question-like practice items | 219 | 400+ quiz/practice questions | Not met |
| Runtime + generated grammar + generated reading question-like items | 371 | 400+ quiz/practice questions | Not met |

Full verification is documented in [`reports/lesson-expansion-verification-report.md`](lesson-expansion-verification-report.md).

## Validation/build results

| Command | Result | Notes |
| --- | --- | --- |
| `npm.cmd run audit:learning-data` | Passed | 0 errors, 53 warnings, 0 quality issues. |
| `npx.cmd tsc -p apps/web/tsconfig.json --noEmit` | Passed | No TypeScript errors. |
| `npm.cmd run validate:lessons` | Passed | Lesson validation completed successfully. |
| `npm.cmd run build` | Passed | Build completed; Vite reported a non-blocking chunk-size warning. |

Latest audit summary from [`reports/penglish-learning-data-audit.json`](penglish-learning-data-audit.json):

| Category | Count |
| --- | ---: |
| Errors | 0 |
| Warnings | 53 |
| Quality issues | 0 |
| `content-depth` warnings | 41 |
| `vocabulary-duplicates` warnings | 10 |
| `free-first-policy` warnings | 2 |

## Screenshot QA

Browser QA passed for all 8 requested screenshots using the correct Vite app server at `http://127.0.0.1:5180/`.

| Screenshot | Viewport |
| --- | --- |
| [`reports/screenshots/ux-recovery-home.png`](screenshots/ux-recovery-home.png) | Desktop 1366x768 |
| [`reports/screenshots/ux-recovery-roadmap.png`](screenshots/ux-recovery-roadmap.png) | Desktop 1366x768 |
| [`reports/screenshots/ux-recovery-sample-lesson-tabs.png`](screenshots/ux-recovery-sample-lesson-tabs.png) | Desktop 1366x768 |
| [`reports/screenshots/ux-recovery-shadowing-video-fallback.png`](screenshots/ux-recovery-shadowing-video-fallback.png) | Desktop 1366x768 |
| [`reports/screenshots/ux-recovery-english-speed.png`](screenshots/ux-recovery-english-speed.png) | Desktop 1366x768 |
| [`reports/screenshots/ux-recovery-mobile-home.png`](screenshots/ux-recovery-mobile-home.png) | Mobile 390x844 |
| [`reports/screenshots/ux-recovery-mobile-lesson.png`](screenshots/ux-recovery-mobile-lesson.png) | Mobile 390x844 |
| [`reports/screenshots/ux-recovery-mobile-shadowing.png`](screenshots/ux-recovery-mobile-shadowing.png) | Mobile 390x844 |

QA checks included:

- No captured page errors.
- No unexpected failed requests, excluding expected/favicon or optional third-party media behavior.
- No horizontal overflow.
- Poo swim layer exists and is visible.
- Lesson tabs exist on desktop and mobile.
- Shadowing video fallback exists and the `Mở trên YouTube` action is visible.

## Remaining issues

- Expansion counts remain below the requested large-content targets. This should be handled in a separate content-production phase.
- Audit warnings remain: 41 content-depth warnings, 10 vocabulary duplicate warnings, and 2 free-first-policy warnings.
- A conditional `VIP` badge still exists on [`ProfilePage.tsx`](../apps/web/src/pages/ProfilePage.tsx). It is not a paid gate in this phase, but it is still terminology to revisit if the next cleanup requires removing all VIP/pro labels everywhere.
- Shadowing video fallback is intentionally conservative and may appear after timeout even when an iframe initially loads, because the transcript-first flow is the reliable primary experience.
- One temporary debug screenshot may exist in [`reports/screenshots/`](screenshots/) from server troubleshooting; it is not part of the requested deliverables.

## Safe to run big expansion next?

Yes. The recovery foundation is safe for the next big expansion phase because:

- Build, TypeScript, lesson validation, and audit all pass without errors.
- Lesson UX can now hold larger content through step tabs instead of one dense page.
- Shadowing no longer depends on YouTube embed availability.
- Poo/ocean visual identity is preserved through reusable shell/background components.
- Expansion targets are honestly marked pending and not claimed as complete.

Recommended next phase: run a dedicated content expansion pass for new micro-lessons, vocabulary, English Speed prompts, Shadowing segments, and quiz/practice items, then rerun the same audit/build/screenshot workflow.

## Deployment

No deployment was performed, per instruction.
