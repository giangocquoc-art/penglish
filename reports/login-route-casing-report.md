# P-English Login Routing and Ocean Login Flow Report

## Scope

Implemented the updated login entry flow so opening the root route sends learners to the canonical login page, while preserving guest-first learning and the prior mobile layout fixes.

## Changed files

- [`apps/web/src/App.tsx`](../apps/web/src/App.tsx)
- [`apps/web/src/pages/LoginPage.tsx`](../apps/web/src/pages/LoginPage.tsx)
- [`apps/web/package.json`](../apps/web/package.json)
- [`package-lock.json`](../package-lock.json)
- [`scripts/login-route-casing-qa.cjs`](../scripts/login-route-casing-qa.cjs)
- [`reports/login-route-casing-qa-results.json`](./login-route-casing-qa-results.json)
- [`reports/learning-routes-mobile-spacing-qa-results.json`](./learning-routes-mobile-spacing-qa-results.json)

## Routing result

[`AppRoutes`](../apps/web/src/App.tsx:164) now uses replace navigation for the root route:

- `/` redirects to `/login`
- `/login` remains canonical
- `/LOGIN` redirects to `/login`
- `/Login` redirects to `/login`
- `/login/` redirects to `/login`

Learning, lesson, Foundation48, progress, auth, localStorage, and service worker behavior were not changed.

## Login page result

[`LoginPage`](../apps/web/src/pages/LoginPage.tsx:50) now keeps a guest-first login flow:

- login scrolls to the top on mount
- primary CTA is guest learning: “Học thử ngay”
- guest CTA navigates to `/luyen-tieng-anh/48-ngay-lay-goc`
- secondary CTA remains Google sync/login
- only one friendly info message is visible: “Bạn có thể học thử ngay. Đăng nhập Google chỉ dùng để đồng bộ tiến độ.”
- duplicate alert/info boxes were removed from the visible login flow

The ocean visual pass in [`LoginPage`](../apps/web/src/pages/LoginPage.tsx:203) keeps the page lightweight with [`react-wavify`](../apps/web/package.json:22), CSS-only bubbles, CSS-only light rays, reduced-motion handling, and the existing Poo ocean mascot.

## QA coverage added

[`scripts/login-route-casing-qa.cjs`](../scripts/login-route-casing-qa.cjs) now validates:

- root `/` redirect to `/login`
- `/login`, `/LOGIN`, `/Login`, and `/login/` canonicalization
- guest CTA navigation to Foundation48
- Google sync/login button click does not produce console/page/network failures
- exact single friendly info message
- no duplicate visible alert boxes
- login top scroll position
- desktop and mobile login layout above the fold
- no horizontal overflow
- `/learning-path` still loads and keeps mobile topbar static/non-overlapping

The existing mobile spacing regression QA was also rerun through [`scripts/mobile-spacing-qa.cjs`](../scripts/mobile-spacing-qa.cjs), covering learning path, lesson, and Foundation48 mobile topbar/bottom-nav spacing.

## Validation result

Build passed with the requested PowerShell-safe command:

```text
npm run build -w @pshare/web
```

Browser QA passed:

```text
node scripts/login-route-casing-qa.cjs
node scripts/mobile-spacing-qa.cjs
```

QA reports:

- [`reports/login-route-casing-qa-results.json`](./login-route-casing-qa-results.json)
- [`reports/learning-routes-mobile-spacing-qa-results.json`](./learning-routes-mobile-spacing-qa-results.json)

Screenshots captured:

- [`reports/screenshots/login-canonical-desktop.png`](./screenshots/login-canonical-desktop.png)
- [`reports/screenshots/login-canonical-mobile.png`](./screenshots/login-canonical-mobile.png)
- [`reports/screenshots/login-uppercase-redirect.png`](./screenshots/login-uppercase-redirect.png)
- [`reports/screenshots/learning-path-mobile-topbar-spacing.png`](./screenshots/learning-path-mobile-topbar-spacing.png)
- [`reports/screenshots/lesson-unit1-mobile-topbar-spacing.png`](./screenshots/lesson-unit1-mobile-topbar-spacing.png)
- [`reports/screenshots/foundation48-mobile-topbar-spacing.png`](./screenshots/foundation48-mobile-topbar-spacing.png)

## Notes

[`react-wavify`](../apps/web/package.json:22) was already present in the web workspace dependency list, so no new install command was needed during this pass. The production build emitted non-fatal bundler warnings from the dependency comments and existing dynamic/static import chunking behavior, but exited successfully.
