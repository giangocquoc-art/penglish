# Ocean poses integration report

## Scope

Replaced user-facing ocean mascot sheet rendering with individual auto-split pose PNG assets from [`apps/web/public/ocean/mascots/poses-map.json`](../apps/web/public/ocean/mascots/poses-map.json), following [`apps/web/public/ocean/asset-map.md`](../apps/web/public/ocean/asset-map.md) and [`DESIGN.md`](../DESIGN.md).

No deployment was performed.

## Implementation summary

- Updated the ocean asset registry in [`apps/web/src/lib/p-english/oceanAssets.ts`](../apps/web/src/lib/p-english/oceanAssets.ts) to map each mascot to semantic pose names backed by `/ocean/mascots/{mascot}/poses/*.png` files.
- Kept original full sheet files as source/reference metadata only via `sourceSheets` in [`apps/web/src/lib/p-english/oceanAssets.ts`](../apps/web/src/lib/p-english/oceanAssets.ts).
- Updated [`apps/web/src/components/p-english/OceanMascot.tsx`](../apps/web/src/components/p-english/OceanMascot.tsx) to render pose PNGs through `getOceanMascotPose()` instead of full sheet images.
- Added a typed `pose` prop to [`apps/web/src/components/p-english/OceanMascot.tsx`](../apps/web/src/components/p-english/OceanMascot.tsx) so pages can request semantic mascot states.
- Updated user-facing mascot placements across login, landing, home, shadowing, English Speed, roadmap, vocabulary, lesson, and practice surfaces to use pose PNGs.
- Added [`scripts/ocean-poses-screenshots.cjs`](../scripts/ocean-poses-screenshots.cjs) to capture the requested screenshots and guard against broken images, horizontal overflow, rendered mascot sheets, and missing pose images.

## Mascot pose mapping

| Mascot | Main UI usage | Pose mapping |
| --- | --- | --- |
| Poo | login, home, landing, default coach | `idle`, `coach`, `happy`, `reward`, `rest` |
| Sứa Nghe | shadowing/listening/recording | `listen`, `wave`, `record`, `coach`, `happy` |
| Cá Ngựa Tốc | English Speed | `dash`, `speed`, `coach`, `focus`, `happy` |
| Rùa Rì | roadmap | `map`, `point`, `guide`, `idle` |
| Cua Quiz | quiz/match practice | `quiz`, `choice`, `coach`, `happy`, `celebrate` |
| Mực Mơ | grammar/hints/teacher | `teacher`, `hint`, `explain`, `idle`, `happy` |
| Sao Nhí | reward/mastery/vocabulary sparkle | `sparkle`, `reward`, `badge`, `happy`, `mastery` |

## Acceptance checks

- Login renders one Poo pose image, not a multi-pose sheet.
- Home renders one Poo pose image, not a multi-pose sheet.
- Shadowing renders Sứa Nghe/Poo pose images, not multi-pose sheets.
- English Speed renders Cá Ngựa Tốc pose images, not a multi-pose sheet.
- Roadmap renders Rùa Rì pose images, not a multi-pose sheet.
- Screenshot QA found no broken image icons.
- Screenshot QA found no rendered `/ocean/mascots/...sheet...png` images in the requested UI surfaces.
- Screenshot QA found mascot pose PNGs rendered on protected app pages.
- No automatic deployment was run.

## Validation

Commands run successfully:

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run validate:lessons
npm.cmd run build
node scripts\ocean-poses-screenshots.cjs
```

Screenshot QA result:

```txt
[ocean-poses-screenshots] PASS
Saved 7 screenshots to reports\screenshots
```

Build note: Vite reported the existing large chunk warning for `vendor-ui`; this was a warning only and did not fail the build.

## Screenshots captured

- [`reports/screenshots/ocean-poses-login-desktop.png`](screenshots/ocean-poses-login-desktop.png)
- [`reports/screenshots/ocean-poses-home-desktop.png`](screenshots/ocean-poses-home-desktop.png)
- [`reports/screenshots/ocean-poses-shadowing-desktop.png`](screenshots/ocean-poses-shadowing-desktop.png)
- [`reports/screenshots/ocean-poses-speed-desktop.png`](screenshots/ocean-poses-speed-desktop.png)
- [`reports/screenshots/ocean-poses-roadmap-desktop.png`](screenshots/ocean-poses-roadmap-desktop.png)
- [`reports/screenshots/ocean-poses-mobile-home.png`](screenshots/ocean-poses-mobile-home.png)
- [`reports/screenshots/ocean-poses-mobile-shadowing.png`](screenshots/ocean-poses-mobile-shadowing.png)

## Issue encountered and fix

During TypeScript validation, the first generic implementation of `getOceanMascotPose()` in [`apps/web/src/lib/p-english/oceanAssets.ts`](../apps/web/src/lib/p-english/oceanAssets.ts) failed because TypeScript could not safely index a union of mascot-specific `poses` objects using `pose ?? asset.defaultPose`.

The fix was to cast the selected `poses` map to `Record<string, string>` before indexing:

```ts
const poses = asset.poses as Record<string, string>;
return poses[String(pose ?? asset.defaultPose)];
```

After this change, `npx.cmd tsc -p apps/web/tsconfig.json --noEmit` passed.

## Notes

- Full sheet files remain in the project as source/reference assets only.
- [`scripts/ocean-poses-screenshots.cjs`](../scripts/ocean-poses-screenshots.cjs) seeds a local guest profile for authenticated routes, while leaving `/login` logged out so the login screenshot captures the intended login card.
- The older `/words` polish item was outside the latest requested ocean-poses screenshot set and was not expanded in this report.
