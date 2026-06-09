# Ocean poses checkerboard fix report

## Scope

Completed PHASE OCEAN-POSES-CHECKERBOARD-FIX in the workspace. The goal was to remove baked checkerboard artifacts from mascot pose PNGs, switch UI rendering to cleaned pose assets, and fix the Shadowing desktop hero/topbar overlap.

No deployment was performed.

## Cleanup script created

Created [`scripts/clean-ocean-pose-transparency.cjs`](../scripts/clean-ocean-pose-transparency.cjs).

The script:

- Scans [`apps/web/public/ocean/mascots`](../apps/web/public/ocean/mascots) for `*/poses/*.png` files.
- Uses [`pngjs`](../package.json) from existing dev dependencies.
- Detects low-saturation near-white / light-grey checkerboard-like pixels.
- Converts detected checkerboard pixels to transparent alpha.
- Softens some light fringe pixels near mascot edges.
- Writes cleaned files into each mascot's `poses-clean` folder.
- Does not overwrite original `poses` files.
- Writes the cleanup map to [`apps/web/public/ocean/mascots/poses-clean-map.json`](../apps/web/public/ocean/mascots/poses-clean-map.json).

## Cleaned pose output

The cleanup script cleaned 36 pose files total.

Cleaned folders:

- [`apps/web/public/ocean/mascots/ca-ngua-toc/poses-clean`](../apps/web/public/ocean/mascots/ca-ngua-toc/poses-clean) — 6 files
- [`apps/web/public/ocean/mascots/cua-quiz/poses-clean`](../apps/web/public/ocean/mascots/cua-quiz/poses-clean) — 5 files
- [`apps/web/public/ocean/mascots/muc-mo/poses-clean`](../apps/web/public/ocean/mascots/muc-mo/poses-clean) — 5 files
- [`apps/web/public/ocean/mascots/poo/poses-clean`](../apps/web/public/ocean/mascots/poo/poses-clean) — 6 files
- [`apps/web/public/ocean/mascots/rua-ri/poses-clean`](../apps/web/public/ocean/mascots/rua-ri/poses-clean) — 4 files
- [`apps/web/public/ocean/mascots/sao-nhi/poses-clean`](../apps/web/public/ocean/mascots/sao-nhi/poses-clean) — 5 files
- [`apps/web/public/ocean/mascots/sua-nghe/poses-clean`](../apps/web/public/ocean/mascots/sua-nghe/poses-clean) — 5 files

Cleanup totals from the final run:

```txt
Cleaned 36 pose files
Transparent pixels: 3383258
Softened edge pixels: 4588
Map written: apps\web\public\ocean\mascots\poses-clean-map.json
```

## Ocean asset registry changes

Updated [`apps/web/src/lib/p-english/oceanAssets.ts`](../apps/web/src/lib/p-english/oceanAssets.ts):

- Added `cleanPosePath` as the preferred path helper.
- Added `sourcePosePath` as fallback/source metadata helper.
- Added `sourceSheetPath` to make sheet paths explicitly reference-only.
- Added `cleanPoseFolder` metadata for each mascot.
- Updated every user-facing pose mapping to `/ocean/mascots/{mascot}/poses-clean/*.png`.
- Kept `sourceSheets` metadata for reference only.
- Preserved `getOceanMascotSheet()` only for backwards/reference compatibility; user-facing [`OceanMascot`](../apps/web/src/components/p-english/OceanMascot.tsx) does not call it.

Also updated [`apps/web/src/components/p-english/OceanMascot.tsx`](../apps/web/src/components/p-english/OceanMascot.tsx) with a subtle CSS drop-shadow so cleaned transparent edges blend into the glass/ocean UI without adding white square backgrounds.

## Before/after checkerboard status

Before:

- Poo, Sứa Nghe, Cá Ngựa Tốc, and Rùa Rì rendered individual pose PNGs, but those PNGs still had visible grey/white checkerboard baked into the image pixels.
- The UI no longer used full sheets, but checkerboard artifacts were still visible inside the pose image boxes.

After:

- UI now renders cleaned transparent pose files from `poses-clean` folders.
- Screenshot QA verifies rendered mascot images are `poses-clean` paths and not source `poses` paths.
- Screenshot QA verifies no rendered `/ocean/mascots/...sheet...png` images.
- The original files remain untouched in `poses` as source assets.

## Shadowing desktop overlap fix

Updated [`apps/web/src/pages/ShadowingPage.tsx`](../apps/web/src/pages/ShadowingPage.tsx):

- Increased top padding on the Shadowing page shell for desktop.
- Added `scrollMarginTop` for safer topbar-aware positioning.
- Updated screenshot QA to scroll to top before auditing and to verify the Shadowing hero does not overlap with the sticky topbar.

The final clean screenshot QA passed the Shadowing overlap audit.

## Screenshot QA updates

Updated [`scripts/ocean-poses-screenshots.cjs`](../scripts/ocean-poses-screenshots.cjs):

- Supports clean screenshot names with `OCEAN_QA_CLEAN=1`.
- Verifies no mascot sheet image is rendered.
- Verifies no source `poses/*.png` images are rendered.
- Verifies cleaned `poses-clean/*.png` images are rendered on app pages.
- Verifies no broken images.
- Verifies no horizontal overflow.
- Verifies the Shadowing desktop hero is not overlapped by the topbar.

## Screenshots saved

- [`reports/screenshots/ocean-clean-login-desktop.png`](screenshots/ocean-clean-login-desktop.png)
- [`reports/screenshots/ocean-clean-home-desktop.png`](screenshots/ocean-clean-home-desktop.png)
- [`reports/screenshots/ocean-clean-shadowing-desktop.png`](screenshots/ocean-clean-shadowing-desktop.png)
- [`reports/screenshots/ocean-clean-speed-desktop.png`](screenshots/ocean-clean-speed-desktop.png)
- [`reports/screenshots/ocean-clean-roadmap-desktop.png`](screenshots/ocean-clean-roadmap-desktop.png)
- [`reports/screenshots/ocean-clean-mobile-home.png`](screenshots/ocean-clean-mobile-home.png)
- [`reports/screenshots/ocean-clean-mobile-shadowing.png`](screenshots/ocean-clean-mobile-shadowing.png)

## Validation results

Commands run successfully:

```cmd
node scripts\clean-ocean-pose-transparency.cjs
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run validate:lessons
npm.cmd run build
set OCEAN_QA_CLEAN=1&& node scripts\ocean-poses-screenshots.cjs
```

Results:

- TypeScript: passed.
- Lesson validation: passed.
- Build: passed.
- Clean screenshot QA: passed.
- Vite still reports the existing large `vendor-ui` chunk warning; this is non-blocking.

Clean screenshot QA output:

```txt
[ocean-clean-screenshots] PASS
Saved 7 screenshots to reports\screenshots
```

## Deployment safety

Deployment was not performed. Based on the completed TypeScript check, lesson validation, production build, cleaned-asset generation, and screenshot QA, the changes are ready for human review and are deployment-safe after review.
