# Ocean-rise loader report

## Summary

Implemented a premium first-load ocean-rise loading experience for P-English. The loader presents a calm full-viewport ocean scene, raises water from the bottom of the viewport, shows progress copy and percentage, reaches 100% only after the app/auth readiness gate is satisfied, then fades into the app shell/current route.

## Changed files

- [`apps/web/src/features/shell/PooOceanRiseLoader.tsx`](../apps/web/src/features/shell/PooOceanRiseLoader.tsx) — new full-screen ocean-rise loader with progress UI, Poo visual, ARIA status labeling, reduced-motion handling, and lightweight gradient-based visuals.
- [`apps/web/src/App.tsx`](../apps/web/src/App.tsx) — integrated first-load readiness progress, auth-loading gate, fade-out behavior, and delayed route-level lazy loading fallback.
- [`scripts/ocean-rise-loader-qa.cjs`](../scripts/ocean-rise-loader-qa.cjs) — added Playwright QA coverage for loader appearance, progress-to-100 behavior, post-loader app visibility, screenshots, console errors, horizontal overflow, desktop, and mobile.
- [`reports/ocean-rise-loader-qa-results.json`](./ocean-rise-loader-qa-results.json) — generated loader QA result artifact.
- [`reports/screenshots/ocean-rise-loader-0.png`](./screenshots/ocean-rise-loader-0.png) — loader initial-state screenshot.
- [`reports/screenshots/ocean-rise-loader-50.png`](./screenshots/ocean-rise-loader-50.png) — loader mid-progress screenshot.
- [`reports/screenshots/ocean-rise-loader-100.png`](./screenshots/ocean-rise-loader-100.png) — loader completion screenshot.
- [`reports/screenshots/ocean-rise-loader-mobile.png`](./screenshots/ocean-rise-loader-mobile.png) — mobile viewport screenshot at 390x844.
- [`reports/screenshots/ocean-rise-loader-after-home.png`](./screenshots/ocean-rise-loader-after-home.png) — post-transition app/home screenshot.

## Loader design

The loader uses an Apple-inspired glass card over a soft ocean gradient. It avoids adding image payload by reusing the existing P-English ocean mascot system through [`OceanMascot`](../apps/web/src/components/p-english/OceanMascot.tsx). The water layer rises from the bottom via height-based progress, while a subtle shimmer layer and mascot float animation provide movement without heavy canvas or frequent animation-frame logic.

Displayed copy changes by progress stage:

- “Poo đang mở vùng biển học tập...” for early loading.
- “Đang chuẩn bị bài học của bạn...” for middle loading.
- “Sắp vào lớp rồi...” near completion.

The component exposes stable QA hooks with `data-testid` and a `data-progress` attribute so browser QA can verify progress and lifecycle behavior without relying on visual timing alone.

## Auth/readiness integration

The first-load loader is integrated inside [`AppRoutes`](../apps/web/src/App.tsx). Progress starts at 0 and moves smoothly toward an 80% ceiling while readiness is unresolved. Final completion to 100% is gated by [`AuthProvider`](../apps/web/src/features/auth/AuthProvider.tsx) initial session loading through `auth.loading`.

If Supabase environment variables are missing, [`AuthProvider`](../apps/web/src/features/auth/AuthProvider.tsx) already resolves loading to false when no Supabase client exists, so the loader cannot block forever because of missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.

Route-level lazy loading uses a delayed fallback in [`RouteLoadingFallback`](../apps/web/src/App.tsx): it waits roughly 260ms before showing the ocean loader, so tiny navigations do not flash a full loading scene. The route fallback caps staged progress below completion because lazy route readiness is controlled by React Suspense resolution.

## Reduced motion behavior

Reduced-motion support is driven by [`useReducedMotion`](../apps/web/src/hooks/useReducedMotion.ts). When `prefers-reduced-motion: reduce` is active:

- Continuous shimmer/mascot GSAP timeline is not started.
- Water height and root opacity are set directly instead of animated continuously.
- The progress bar disables width transition.
- The loader still communicates progress and state through visible text and ARIA labeling.

Accessibility details:

- Loader root uses `role="status"`.
- Loader root uses `aria-live="polite"`.
- Loader root includes a percentage-aware `aria-label`.
- Decorative background/water layers are hidden from assistive technology.
- Text uses dark blue/gray on light glass/ocean surfaces for strong contrast.

## Build/QA result

- `npm run build -w @pshare/web` — passed.
- `node scripts/ocean-rise-loader-qa.cjs` — passed.
  - `ok: true`
  - `errors: 0`
  - `consoleErrors: 0`
- `node scripts/foundation48-release-qa.cjs` — passed.
  - `ok: true`
  - `errors: 0`
  - `consoleErrors: 0`
  - `failedRequests: 0`

Foundation48 lazy module behavior remained intact during QA, including observed lazy stage bundles for later Foundation48 stages.

## Screenshot list

- [`reports/screenshots/ocean-rise-loader-0.png`](./screenshots/ocean-rise-loader-0.png)
- [`reports/screenshots/ocean-rise-loader-50.png`](./screenshots/ocean-rise-loader-50.png)
- [`reports/screenshots/ocean-rise-loader-100.png`](./screenshots/ocean-rise-loader-100.png)
- [`reports/screenshots/ocean-rise-loader-mobile.png`](./screenshots/ocean-rise-loader-mobile.png)
- [`reports/screenshots/ocean-rise-loader-after-home.png`](./screenshots/ocean-rise-loader-after-home.png)

## Known risks

- The readiness model intentionally uses staged progress for app/data readiness beyond auth because not every route exposes a precise data-ready signal. Final 100% still waits for the real auth readiness gate and route rendering/Suspense readiness.
- QA mode uses `?oceanLoaderQa=1` to hold the loader long enough for deterministic screenshots; normal app behavior is shorter.
- Vite build continues to emit existing dynamic/static import chunking warnings around Supabase/Foundation48 modules. These warnings did not fail the build or QA.
- The preview server used for screenshot QA was running at `http://127.0.0.1:5180` during validation.
