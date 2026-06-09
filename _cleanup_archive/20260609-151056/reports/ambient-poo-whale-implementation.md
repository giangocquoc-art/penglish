# Ambient Poo Whale Implementation

## Summary

Implemented the official ambient Poo whale as a subtle background animation that swims inside the P-English ocean scene behind the learning interface. The implementation uses the extracted frame PNG files first, even though the current assets may still show checkerboard artifacts.

## Files changed

- `apps/web/src/components/ocean/AmbientPooWhale.tsx`
  - New reusable ambient whale component.
  - Loads frame PNGs from `/ocean/ambient-whale/frames/frame-00.png` through `/ocean/ambient-whale/frames/frame-15.png`.
  - Swaps frames every 150ms by default.
  - Uses GSAP transform animation for slow swimming/bobbing.
  - Uses `pointerEvents="none"` and absolute positioning so it never blocks UI interactions.
  - Respects `prefers-reduced-motion` through the app `useReducedMotion` hook and GSAP `matchMedia`.

- `apps/web/src/components/p-english/OceanPageShell.tsx`
  - Integrates `AmbientPooWhale` above the ocean background overlay and below page content/cards.
  - Keeps content at z-index 2, ambient whale at z-index 1.
  - Disables the large static `PooOceanCompanion` by default to prevent duplicate large mascots in the same visual area.
  - Keeps the legacy `showPooSwimLayer` prop as a compatibility alias for enabling/disabling the ambient whale.
  - Slightly adjusts glass-card opacity/borders so the background whale can be visible without hurting readability.

- `scripts/clean-ambient-whale-frames.mjs`
  - Adds a safe follow-up cleanup workflow.
  - Reads original files from `apps/web/public/ocean/ambient-whale/frames`.
  - Writes cleaned output to `apps/web/public/ocean/ambient-whale/frames-clean`.
  - Does not overwrite original frames.
  - Attempts to remove only checkerboard-like pixels connected to image edges.
  - Requires `sharp`; if missing, prints `npm install -D sharp`.

## Frame loading

The component currently uses a constant 16-frame list:

```ts
/ocean/ambient-whale/frames/frame-00.png
/ocean/ambient-whale/frames/frame-01.png
...
/ocean/ambient-whale/frames/frame-15.png
```

A manifest was mentioned in the request, but `apps/web/public/ocean/ambient-whale/manifest.json` was not present in the workspace. The implementation intentionally avoids over-engineering and uses the known extracted frame sequence.

## Responsive behavior

- Desktop: larger whale, opacity approximately 0.30–0.34 while temporary checkerboard assets are in use.
- Mobile: smaller whale, placed near the upper background area, opacity approximately 0.18–0.22 to avoid blocking text/buttons or bottom navigation.
- Reduced motion: frame swapping stops and only `frame-00.png` is displayed; GSAP movement is disabled.

## How to replace frames later

1. Clean or export final transparent frame PNGs using the same names: `frame-00.png` through `frame-15.png`.
2. Replace files under `apps/web/public/ocean/ambient-whale/frames`.
3. Keep dimensions consistent across frames to avoid animation jitter.
4. Re-run build and visual QA.

## Cleanup script

Run the optional cleanup workflow after installing `sharp`:

```powershell
npm install -D sharp
node scripts/clean-ambient-whale-frames.mjs
```

Review output in:

```text
apps/web/public/ocean/ambient-whale/frames-clean
```

Do not replace the active app frames until the cleaned output has been visually reviewed.

## Known limitation

The current frame PNGs may still include checkerboard background artifacts. The UI implementation keeps whale opacity low and uses subtle blending so the animation can be validated now. Final polish should use cleaned transparent whale frames.

## Validation

- `npx.cmd tsc -p apps/web/tsconfig.json --noEmit`: passed.
- `npm.cmd run build`: passed.

## Screenshots and QA

Captured with `scripts/ambient-poo-whale-qa.cjs` against the local Vite preview at `http://localhost:4174`.

QA report:

```text
reports/screenshots/ambient-poo-whale-qa.json
```

Screenshots captured:

```text
reports/screenshots/ambient-poo-whale-home-desktop.png
reports/screenshots/ambient-poo-whale-learning-path-desktop.png
reports/screenshots/ambient-poo-whale-lesson-unit-1-desktop.png
reports/screenshots/ambient-poo-whale-english-speed-desktop.png
reports/screenshots/ambient-poo-whale-shadowing-desktop.png
reports/screenshots/ambient-poo-whale-vocab-desktop.png
reports/screenshots/ambient-poo-whale-home-mobile-390.png
reports/screenshots/ambient-poo-whale-learning-path-mobile-390.png
reports/screenshots/ambient-poo-whale-lesson-unit-1-mobile-390.png
reports/screenshots/ambient-poo-whale-english-speed-mobile-390.png
reports/screenshots/ambient-poo-whale-shadowing-mobile-390.png
reports/screenshots/ambient-poo-whale-vocab-mobile-390.png
reports/screenshots/ambient-poo-whale-vocab-loaded-desktop.png
reports/screenshots/ambient-poo-whale-vocabularies-desktop.png
```

Observed QA notes:

- Ambient whale element is present on home, roadmap, lesson, English Speed, Shadowing, and vocabulary after the vocabulary route finishes loading.
- Frame loading was confirmed on the main routes; a few later-route checks reported `frameLoaded: false` because the script sampled during frame swapping or after route transitions, not because the component was missing.
- One transient `net::ERR_ABORTED` was observed for a frame request during navigation/frame swapping.
- Console only reported the existing browser warning: `Unrecognized feature: 'web-share'`.
- Current frames may still show checkerboard artifacts until cleaned/re-exported.
