# Foundation48 Stage 3.5 Stabilization Report

Generated: 2026-06-08

## Summary

Stage 3.5 stabilization for Foundation48 Days 9–17 is complete. This pass focused on reducing mobile layout friction before expanding to Days 18–21: lesson pages now keep their CTA and previous/next day navigation above the mobile bottom nav, the first lesson screen is more compact on small screens, and the roadmap now avoids rendering all 48 day cards as one long mobile wall by grouping days into collapsible chapters.

The technical risk from Stage 3 was also addressed: deep lesson loading is now centralized through a shared resolver that supports static Days 1–12 and lazy-loaded Days 13–17. The lesson page and progress/vocabulary sync both use this resolver path, so lazy lesson vocabulary can be synced consistently while preserving the existing localStorage and event contracts.

## Changed files

- `apps/web/src/features/foundation48/foundation48DeepLessonResolver.ts`
- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
- `apps/web/src/features/foundation48/foundation48Progress.ts`
- `apps/web/src/features/foundation48/foundation48Data.ts`
- `apps/web/src/features/foundation48/Foundation48Roadmap.tsx`
- `scripts/foundation48-stage3-5-regression-qa.cjs`
- `reports/foundation48-stage3-5-regression-qa-results.json`
- `reports/foundation48-stage3-5-stabilization-report.md`

Related Stage 3 carryover file still used by this stabilization pass:

- `apps/web/src/features/foundation48/foundation48DeepLessons.stage3.lazy.ts`

## What was fixed

### 1. Mobile bottom navigation overlap

Foundation48 lesson pages now include additional safe bottom spacing on mobile:

- Main page shell bottom padding uses mobile safe-area spacing plus extra room for CTA/day navigation.
- The visible `Quay lại`, `Tiếp tục`, `Ngày trước`, and `Ngày sau` controls remain above the bottom nav at tested mobile viewports.
- Playwright regression checks confirmed no mobile bottom nav overlap at both `390x844` and `375x812`.

### 2. Compact mobile lesson first screen

The Foundation48 lesson intro/header was tightened for mobile:

- Smaller mobile card padding.
- Smaller mobile title scale and tighter line-height.
- Reduced intro step minimum height.
- The first screen now shows the intro, CTA row, and day navigation sooner, reducing the empty space observed after Stage 3.

### 3. Foundation48 roadmap mobile grouping

The roadmap now has a mobile-specific grouped chapter view:

- Days are grouped by stage/chapter.
- The current chapter opens by default.
- Previous/next chapters can be collapsed or expanded.
- A compact `Học tiếp hôm nay` card remains near the top for fast continuation.
- Desktop keeps the existing fuller grid layout.

### 4. Lazy lesson readiness on roadmap

`foundation48Data.ts` now exposes lazy-aware readiness metadata for Days 13–17 without forcing the lazy lesson chunk into the main bundle. Roadmap day cards can show Days 13–17 as `Đầy đủ` while preserving the lazy-loading boundary.

## Lazy resolver design

A shared resolver was added in `foundation48DeepLessonResolver.ts`.

Resolution order:

1. Return static deep lesson data from `foundation48DeepLessons` for Days 1–12.
2. Return cached lazy lesson data if already loaded.
3. Dynamically import the Stage 3 lazy module for Days 13–17.
4. Cache all loaded lazy lessons in memory for later reads.
5. Return `undefined` for days outside the implemented static/lazy ranges.

Exported resolver APIs:

- `getFoundation48CachedDeepLesson(dayNumber)` — synchronous static/cache lookup.
- `getFoundation48DeepLesson(dayNumber)` — async static/cache/lazy lookup.
- `preloadFoundation48DeepLesson(dayNumber)` — preloads a day through the resolver.
- `getFoundation48DeepLessonVocabulary(dayNumber)` — async vocabulary helper.

`Foundation48DayPage.tsx` now uses the resolver to load the current day and preloads the next day when available. This keeps Day 13–17 content lazy-loaded but still available through a consistent access path.

## Progress and vocabulary sync compatibility

The existing persistence contract was preserved:

- localStorage key remains `penglish-foundation48-progress-v1`.
- update event remains `penglish-foundation48-progress-updated`.

`foundation48Progress.ts` no longer depends only on the static deep lesson map for vocabulary sync. It now:

1. Immediately syncs words from the cached/static lesson if available.
2. Asynchronously resolves lazy lessons through `getFoundation48DeepLesson(dayNumber)`.
3. Upserts lazy lesson vocabulary after the lazy module resolves.
4. Silently ignores resolver failures to avoid breaking progress writes.

This means Days 13–17 can contribute vocabulary to the learning loop after lazy content loads, while older progress records and existing UI refresh behavior continue to work.

## Build result

Command run:

```txt
npm run build --workspace apps/web
```

Result: passed.

Observed build details from the completed run:

- Vite production build completed successfully.
- Build time: `16.60s`.
- Lazy Stage 3 chunk emitted:
  - `dist/assets/foundation48DeepLessons.stage3.lazy-CUgFG3Hd.js`
  - `10.67 kB`, gzip `3.61 kB`

## Playwright QA result

Command run:

```txt
node scripts/foundation48-stage3-5-regression-qa.cjs
```

Result: passed.

Regression JSON:

- `reports/foundation48-stage3-5-regression-qa-results.json`

Key result:

```json
{
  "ok": true,
  "errors": [],
  "consoleErrors": [],
  "failedRequests": []
}
```

Routes checked:

- `/luyen-tieng-anh/48-ngay-lay-goc`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/9`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/10`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/13`
- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/17`

Viewport coverage included:

- Mobile `390x844`
- Mobile `375x812`
- Desktop `1440x950`

Verified by the regression script:

- Titles visible.
- Progress/status indicators visible.
- CTA/navigation visible.
- Mobile bottom nav visible on mobile.
- Mobile bottom nav does not overlap main content.
- No horizontal overflow.
- Lazy Day 13 real title/content visible.
- Lazy Day 17 real title/content visible.
- No console errors.
- No critical failed requests.

## Chrome DevTools QA result

Chrome DevTools MCP was used for manual inspection on the local dev server.

### Roadmap inspection

URL:

- `http://127.0.0.1:5180/luyen-tieng-anh/48-ngay-lay-goc`

Observed viewport from DevTools evaluation:

- `500x736`

Result:

- Title visible: yes.
- Mobile continue card visible: yes.
- Stage toggles found: `8`.
- Bottom nav visible: yes.
- Bottom nav overlap: no.
- Horizontal overflow: no.

Console result:

- No console errors observed.
- Only service worker registration log appeared.

Network note:

- The first page of DevTools network entries showed successful `200` responses.
- A very large number of ambient ocean/whale frame image requests were present, but no critical failure was identified in Playwright QA.

### Day 17 lazy lesson inspection

URL:

- `http://127.0.0.1:5180/luyen-tieng-anh/48-ngay-lay-goc/ngay/17`

Observed viewport from DevTools evaluation:

- `500x736`

Result:

- Lazy Day 17 title visible: yes.
- Title visible: yes.
- Progress visible: yes.
- CTA visible: yes.
- Bottom nav visible: yes.
- Bottom nav overlap: no.
- Horizontal overflow: no.
- Lazy module loaded: yes.
- Route responded with HTTP `200 OK` via CLI check.

Note: the final Day 17 console/network re-check in Chrome DevTools MCP was blocked because the DevTools MCP server disconnected. This is recorded as a QA limitation. The Playwright regression script independently passed with `consoleErrors: []` and `failedRequests: []`, and the earlier DevTools layout/lazy-module checks completed successfully.

## Screenshot list

Generated screenshots:

- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-roadmap-mobile.png`
- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-roadmap-mobile-375.png`
- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-roadmap-desktop.png`
- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-day9-mobile.png`
- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-day9-mobile-375.png`
- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-day10-desktop.png`
- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-day13-mobile.png`
- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-day17-mobile.png`
- `C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\foundation48-stage3-5-day17-desktop.png`

## Remaining risks

1. Chrome DevTools viewport limitation
   - DevTools MCP evaluation reported `500x736` rather than the exact requested `390x844` size.
   - Exact `390x844` and `375x812` coverage was still completed by the Playwright regression script.

2. Ambient image request volume
   - DevTools network listing showed a very large number of ambient ocean/whale frame requests.
   - No critical failed requests were reported by Playwright, but this request volume is worth revisiting in a later performance pass.

3. Repository state contains unrelated changes
   - Earlier `git status` showed unrelated deleted report files outside the Foundation48 Stage 3.5 scope.
   - These were intentionally not touched during this stabilization pass.

4. Stage 4 content not yet implemented
   - Days 18–21 remain future expansion work.
   - Stage 3.5 only stabilized the existing Days 9–17 implementation and the lazy resolver path.

## Recommendation for Stage 4 Days 18–21

Proceed to Stage 4 after reviewing/cleaning unrelated repository status. For Days 18–21, reuse the Stage 3.5 resolver pattern rather than reintroducing page-local lazy imports.

Recommended Stage 4 approach:

1. Add Days 18–21 as a new lazy lesson module or extend the resolver with a new lazy range.
2. Keep lightweight metadata in `foundation48Data.ts` so the roadmap can show readiness without pulling deep content into the main bundle.
3. Route all lesson-page, progress, and vocabulary reads through the shared resolver.
4. Extend the Stage 3.5 regression script to include Days 18 and 21 mobile/desktop checks.
5. Re-run build, Playwright regression, and Chrome DevTools mobile layout inspection after the content expansion.
