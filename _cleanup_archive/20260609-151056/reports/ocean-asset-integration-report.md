# Ocean Asset Integration Report

## Summary

Completed PHASE OCEAN-ASSET-INTEGRATION for the React/Vite/Chakra P-English app. The implementation integrates the prepared ocean backgrounds and mascot sheets from `apps/web/public/ocean` only, adds reusable typed ocean UI primitives, applies the requested page-level background/mascot mapping, preserves existing learning/shadowing/speed/words/roadmap flows, validates the build, and captures the required desktop/mobile screenshots at 100% browser zoom.

No external images were fetched, no generated mascot assets were introduced, no unnecessary packages were installed, and no deployment was performed.

## Asset audit

Source guidance reviewed:

- `DESIGN.md`
- `apps/web/public/ocean/asset-map.md`

Prepared assets used through the central registry:

### Backgrounds

| App surface | Asset |
| --- | --- |
| Login / Landing | `/ocean/backgrounds/bg-login-ocean.png` |
| Home dashboard | `/ocean/backgrounds/bg-dashboard-ocean.png` |
| Shadowing | `/ocean/backgrounds/bg-shadowing-ocean.png` |
| English Speed | `/ocean/backgrounds/bg-speed-ocean.png` |
| Words / Vocabulary / Practice fallback | `/ocean/backgrounds/bg-vocab-ocean.png` |
| Roadmap / Learning Path | `/ocean/backgrounds/bg-roadmap-ocean.png` |
| Roadmap alternate registered | `/ocean/backgrounds/bg-roadmap-ocean-alt.png` |

### Mascots

| Mascot key | Role | Asset |
| --- | --- | --- |
| `poo` | Hero, dashboard companion, AI feedback/coaching | `/ocean/mascots/poo/poo-sheet-simple.png` |
| `mucMo` | Grammar, explanations, hints | `/ocean/mascots/muc-mo/poo-sheet-simple.png` |
| `ruaRi` | Roadmap / CEFR next-step guide | `/ocean/mascots/rua-ri/rua-ri-sheet.png` |
| `cuaQuiz` | Quiz and match practice feedback | `/ocean/mascots/cua-quiz/cua-quiz-sheet.png` |
| `suaNghe` | Listening and shadowing | `/ocean/mascots/sua-nghe/sua-nghe-sheet.png` |
| `caNguaToc` | English Speed | `/ocean/mascots/ca-ngua-toc/ca-ngua-toc-sheet.png` |
| `saoNhi` | Mastery / reward / progress celebration | `/ocean/mascots/sao-nhi/sao-nhi-sheet.png` |

## Files changed

Core ocean primitives:

- `apps/web/src/lib/p-english/oceanAssets.ts`
  - Added typed registry for all approved backgrounds and mascot sheets.
  - Exported `OceanBackgroundVariant`, `OceanMascotName`, `oceanAssets`, `getOceanBackgroundPath()`, and `getOceanMascotSheet()`.
- `apps/web/src/components/p-english/OceanPageShell.tsx`
  - Added reusable ocean background shell with soft/medium/strong overlay strengths, cover positioning, clipped horizontal overflow, and a subtle readability layer.
  - Implemented as `forwardRef` for pages that pass refs.
- `apps/web/src/components/p-english/OceanMascot.tsx`
  - Added typed mascot component with responsive sizes, reduced-motion-aware animation classes, decorative accessibility handling, graceful error hiding, and eager/sync decoding for reliable screenshot/QA capture.
- `apps/web/src/index.css`
  - Added subtle mascot animation keyframes/classes and reduced-motion override.

Page and flow integration:

- `apps/web/src/pages/LandingPage.tsx`
- `apps/web/src/pages/LoginPage.tsx`
- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/pages/ShadowingPage.tsx`
- `apps/web/src/pages/EnglishSpeedPage.tsx`
- `apps/web/src/pages/VocabPage.tsx`
- `apps/web/src/pages/LearningPathPage.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `apps/web/src/pages/PracticePage.tsx`
- `apps/web/src/components/practice/LessonQuizPractice.tsx`
- `apps/web/src/components/practice/LessonMatchPractice.tsx`
- `apps/web/src/components/p-english/OceanBackdrop.tsx`
- `apps/web/src/components/Sidebar.tsx`

QA support:

- `scripts/ocean-integration-screenshots.cjs`
  - Added local Playwright screenshot/overflow/broken-image check for the required ocean integration screenshots.

## Page mapping completed

| Page / surface | Background | Mascot mapping |
| --- | --- | --- |
| Login / Landing | `bg-login-ocean.png` | Poo hero; CTA uses `Bắt đầu học ngay`; no broken Pshare logo/text dependency added. |
| Home | `bg-dashboard-ocean.png` | Calm Poo companion. |
| Shadowing | `bg-shadowing-ocean.png` | Sứa Nghe for listening/audio and Poo for feedback/coaching. |
| English Speed | `bg-speed-ocean.png` | Cá Ngựa Tốc; repeated-fish issue avoided by using a single controlled mascot treatment and preserving one mode badge. |
| Words / Vocab | `bg-vocab-ocean.png` | Sao Nhí for progress/reward and Mực Mơ for hints. |
| Roadmap / Learning Path | `bg-roadmap-ocean.png` | Rùa Rì for CEFR guide / next steps. |
| Quiz Practice | Existing practice flow, ocean/glass cards | Cua Quiz in multiple-choice headers and feedback. |
| Match Practice | Existing practice flow, ocean/glass cards | Cua Quiz in match start, active header, warnings, round-complete, and summary surfaces. |
| Grammar / Explanation | Lesson surfaces | Mực Mơ for hint/explanation/grammar panels. |

## Responsive and readability fixes

- Added soft white and blue glass card layers over ocean backgrounds.
- Used `backdropFilter="blur(...)"`, translucent white panels, and high-contrast text colors on ocean-backed pages.
- Preserved 100% zoom assumptions; no zoom-out dependency was introduced.
- Added mobile bottom padding on ocean pages so bottom navigation does not cover key content/actions.
- Used responsive mascot sizing and hidden decorative mascots on constrained breakpoints where needed.
- Applied `overflowX="hidden"`/`overflowX="clip"` patterns to prevent horizontal overflow.
- Reduced oversized navigation/sidebar pressure by keeping the main sidebar compact.
- Fixed `VocabPage.tsx` JSX nesting introduced during integration and added the missing Chakra `VStack` import.

## Screenshots saved

All requested screenshots were captured by `scripts/ocean-integration-screenshots.cjs` against the local Vite preview server at 100% zoom / deviceScaleFactor 1:

- `reports/screenshots/ocean-integration-login-desktop.png`
- `reports/screenshots/ocean-integration-home-desktop.png`
- `reports/screenshots/ocean-integration-shadowing-desktop.png`
- `reports/screenshots/ocean-integration-speed-desktop.png`
- `reports/screenshots/ocean-integration-words-desktop.png`
- `reports/screenshots/ocean-integration-roadmap-desktop.png`
- `reports/screenshots/ocean-integration-mobile-home.png`
- `reports/screenshots/ocean-integration-mobile-shadowing.png`

The screenshot script also checked for horizontal overflow and broken images on the captured routes.

## Validation results

Commands run successfully:

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Result: passed.

```cmd
npm.cmd run validate:lessons
```

Result: passed.

```cmd
npm.cmd run build
```

Result: passed.

```cmd
node scripts\ocean-integration-screenshots.cjs
```

Result: passed. Saved 8 screenshots to `reports/screenshots`.

Build note: Vite emitted the existing chunk-size advisory for `vendor-ui` over 500 kB. This is a non-failing build warning and was not caused by adding a package; no package install was performed.

## Checkerboard transparency observation

The integrated mascot sheets are PNG assets with transparency. During QA they render over ocean/glass surfaces as intended. Any checkerboard-like look would be from image-editor transparency previews, not from the app UI background. The app itself uses ocean backgrounds and translucent glass layers behind the mascots.

## Remaining issues

- No blocking issues remain for the ocean asset integration scope.
- The build still reports Vite’s non-fatal chunk-size advisory for large bundles; this can be addressed separately with further route/chunk splitting if desired.

## Deployment safety

No deployment was run. Work stopped after local validation, screenshots, and this report as requested.
