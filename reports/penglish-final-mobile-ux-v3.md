# P-English Final Mobile UX v3 QA Report

## Status

Passed. The v3 mobile UX, ambient whale, and deterministic state validation pass is complete without adding lessons and without deploying to Vercel.

## Scope validated

- `/home`
- `/learning-path`
- `/lessons/unit-1-greetings-introduction`
- `/english-speed`
- `/shadowing`
- `/words`

## Fix summary

- English Speed `BEST` no longer renders invalid `Sau`; it now uses `—` for no score or a numeric best score.
- Mobile bottom spacing and scroll margins were tightened so primary CTA centers remain clear of the fixed bottom navigation.
- Ambient whale behavior was reduced for lower-risk routes and disabled on lesson/shadowing surfaces where QA detected overlap with controls.
- Lesson mobile padding was reduced to remove excessive blank ocean space after content while preserving safe bottom scrolling.
- Lesson guided flashcard CTA hierarchy was simplified: `Luyện ngay` is primary, `Tiếp tục` is secondary, and vocabulary expansion is lower-priority.
- Shadowing mobile content was compacted while preserving the learner workflow: choose a lesson, use reference/listen, hear the sentence, record, stop, and receive AI feedback.
- QA state seeding was made deterministic for empty, one-shadowing-item, and two-completed-unit scenarios.

## Validation commands

```text
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run build -w @pshare/web
cmd.exe /c "set PENGLISH_PRODUCT_UX_LOGIC_QA_BASE_URL=http://127.0.0.1:5182&& node scripts\penglish-product-ux-logic-qa.cjs"
```

## Validation result

- TypeScript: passed.
- Production build: passed.
- Browser QA: passed.
- QA JSON: `reports/penglish-final-mobile-ux-v3-qa.json`.
- Screenshot directory: `reports/screenshots/penglish-final-mobile-ux-v3/`.

## Browser QA assertions covered

- No visible `BEST Sau` on English Speed.
- Primary CTA centers are not covered by the mobile bottom navigation.
- Ambient whale is non-interactive, aria-hidden, single-layer, and does not overlap checked headings/buttons/text.
- Mobile lesson does not have blank ocean gap greater than 600px after the last content block.
- `/words` does not remain stuck on the route loading fallback.
- Desktop lesson active guided mode is not blank or collapsed.
- Shadowing does not present a black/broken YouTube iframe as the primary UI.
- Deterministic screenshots were generated for empty home, active home, and progress learning path states.

## Deterministic screenshots

- `reports/screenshots/penglish-final-mobile-ux-v3/empty-home-mobile.png`
- `reports/screenshots/penglish-final-mobile-ux-v3/active-home-mobile.png`
- `reports/screenshots/penglish-final-mobile-ux-v3/progress-learning-path-mobile.png`

## Deployment

No Vercel deployment was performed.
