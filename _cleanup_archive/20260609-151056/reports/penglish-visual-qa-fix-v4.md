# P-English Visual QA Fix v4

## Scope

Validated the v4 screenshot-driven visual fixes for:

- `/home`
- `/english-speed`
- `/learning-path`
- `/lessons/unit-1-greetings-introduction`
- `/shadowing`
- `/words`

Viewport coverage:

- Desktop: `1366x768`
- Mobile: `390x844`

No new lessons were added. No Vercel deployment was performed.

## Changes completed

- English Speed mobile layout now reserves additional bottom safe area and scroll padding so the fixed mobile bottom nav does not cover the prompt or recording controls.
- English Speed desktop stat cards were tightened and stat icons hidden to prevent `PROMPT`, `MIC`, `BEST`, and `Sẵn sàng` clipping/splitting.
- Home mobile review/local-learning section now has stronger bottom-nav-safe spacing so review tiles and the lower summary area remain reachable.
- Ambient whale route presets were reduced and made subtler, and the English Speed ambient whale preset is disabled so it does not compete with the page mascot/metric cards.
- Deterministic QA state seeding now separates empty, active-low-energy, and two-completed-unit states; the learning-path progress scenario seeds legacy local progress so `2/12` is visible.
- v4 QA output paths were updated to `reports/screenshots/penglish-visual-qa-fix-v4/` and `reports/penglish-visual-qa-fix-v4-qa.json`.

## Required confirmations

- English Speed mobile bottom nav no longer covers controls: confirmed by automated full bounding-box mobile nav checks.
- English Speed desktop `PROMPT` / `MIC` / `BEST` cards no longer clip text: confirmed by v4 critical text checks and desktop metric screenshot capture.
- Home mobile review tiles are not hidden by bottom nav: confirmed by mobile review-section and bottom-safe screenshots plus bounding-box checks.
- Ambient whale is subtle and not competing with mascots: confirmed by route checks for single ambient whale, aria-hidden/pointer-events-safe behavior, max width/opacity limits, and obstruction checks.
- Deterministic states are clearly separated: confirmed by `home-empty-local-state`, `home-active-low-energy-local-state`, and `learning-path-progress-two-units` scenarios.

## Validation

Passed:

```text
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Passed:

```text
npm.cmd run build -w @pshare/web
```

Passed:

```text
cmd.exe /c "set PENGLISH_PRODUCT_UX_LOGIC_QA_BASE_URL=http://127.0.0.1:5183&& node scripts\penglish-product-ux-logic-qa.cjs"
```

Final automated QA result:

```json
{
  "ok": true,
  "baseUrl": "http://127.0.0.1:5183",
  "consoleErrors": [],
  "failedRequests": [],
  "errors": []
}
```

## Artifacts

- JSON QA report: `reports/penglish-visual-qa-fix-v4-qa.json`
- Screenshot directory: `reports/screenshots/penglish-visual-qa-fix-v4/`
- Markdown report: `reports/penglish-visual-qa-fix-v4.md`

Captured v4 screenshot set includes:

- `home-mobile-top.png`
- `home-mobile-review-section.png`
- `home-mobile-bottom-safe.png`
- `home-desktop-top.png`
- `english-speed-mobile-top.png`
- `english-speed-mobile-practice-controls.png`
- `english-speed-mobile-bottom-safe.png`
- `english-speed-desktop-top.png`
- `english-speed-desktop-metric-cards.png`
- `learning-path-mobile-top.png`
- `lesson-mobile-flashcard-controls.png`
- `shadowing-mobile-practice-controls.png`
- `words-mobile-top.png`
- deterministic state screenshots for home empty, home active-low-energy, and learning-path two completed units

## Notes

The QA command used the active Vite dev server at `http://127.0.0.1:5183` because the requested `5182` port was occupied and Vite automatically selected `5183`. The report was still generated to the required v4 artifact paths.
