# P-English Web Audit Report

## Scope

Audited the current web app after the latest learning-path/content expansion, focusing on runtime stability, route UX, mobile layout safety, local-first progress behavior, and risky integration code.

## Validation results

- TypeScript: passed via `npx tsc -p apps/web/tsconfig.json --noEmit`.
- Product UX/browser QA: passed. See `reports/penglish-visual-qa-fix-v4-qa.json`.
  - Routes checked: `/home`, `/learning-path`, `/lessons/unit-1-greetings-introduction`, `/english-speed`, `/shadowing`, `/words`.
  - Viewports checked: desktop `1366x768`, mobile `390x844`.
  - Result: `ok: true`, `consoleErrors: []`, `failedRequests: []`, `errors: []`.
- Targeted logic QA: passed via `node scripts/penglish-logic-final-qa.cjs`.
  - English Speed: record flow, denied microphone handling, replay, and no upload request verified.
  - Shadowing: sentence navigation, practiced/difficult persistence, transcript-first safety, and iframe safety verified.
  - Vocabulary: word list, filters, review queue, persistence, and no server progress write verified.
  - A first standalone rerun timed out once on `/words`, then passed cleanly on retry; the broader product UX QA also loaded `/words` successfully, so this was treated as a transient dev-server/Playwright timing issue rather than an app defect.

## Fixes applied

### 1. Removed unnecessary shell user casts

- File: `apps/web/src/App.tsx`
- Issue: `NewShell` passed `user as any` to both sidebar and topbar even though the component type was compatible with the local `User` shape.
- Change: passed `user` directly to `ChakraSidebar` and `ChakraTopbar`.
- Severity: low, but important for type-safety hygiene.
- Result: TypeScript still passes.

### 2. Hardened token-refresh retry queue

- File: `apps/web/src/api.ts`
- Issue: refresh queue code assumed `original.headers` existed before setting `Authorization`. It also rejected on a null token without returning, which could continue into retry logic.
- Change:
  - Ensure `original.headers = original.headers ?? {}` before mutation.
  - Return immediately after rejecting queued refresh attempts with no token.
  - Flush queued retry callbacks with `null` when refresh fails, preventing unresolved queued requests.
- Severity: medium for optional backend mode; low impact in default local-first mode.
- Result: TypeScript still passes.

### 3. Updated product UX QA expectations after the app now has 13 units

- File: `scripts/penglish-product-ux-logic-qa.cjs`
- Issue: deterministic QA still expected `0/12` and `2/12`, but the current expanded learning path displays `0/13` and `2/13`.
- Change: updated deterministic mobile QA expectations to match the current learning path unit count.
- Severity: medium for QA reliability; app UI was correct, test expectation was stale.
- Result: product UX/browser QA now passes with no errors.

## Findings still worth tracking

### Medium: Optional backend pages remain best-effort/local-first

Several pages still call optional backend endpoints and swallow failures intentionally, including folders, categories, AI usage, pricing/subscriptions, shop, leaderboard, chat, and study path detail pages. This is acceptable for the current local-first product direction, but these surfaces should eventually show clearer empty/offline states when backend sync is disabled.

### Medium: API base can be empty in production when no backend is configured

`API_BASE` falls back to an empty string in production. Because most core learning routes avoid backend calls or catch errors, browser QA did not show failed requests on audited routes. For backend-heavy routes, this should be reviewed before production launch if the app will ship without `VITE_API_URL`.

### Low: Remaining `as any` usage exists in non-critical UI areas

The broad scan still found a few casts in page-level UI code, such as linked Chakra panel typing, chat avatar compatibility, and select option typing. These are not currently breaking runtime behavior, but they are candidates for a future type-hardening pass.

### Low: Package scripts do not expose common QA commands

`apps/web/package.json` only has `dev`, `build`, and `preview`. Typecheck and QA are currently run manually from the repo root. Adding dedicated scripts would make repeat audits safer and easier.

## Final assessment

No current blocker was found in the audited core learning UX. The main unstable point found during this pass was stale QA logic after the learning path grew from 12 to 13 units; it is now fixed. The two safe code fixes improve type-safety and backend refresh resilience without changing learner-facing behavior.
