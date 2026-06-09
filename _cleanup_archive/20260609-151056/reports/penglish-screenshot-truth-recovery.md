# P-English Screenshot-Truth Recovery Report

Generated: 2026-06-01 16:52 ICT

## Result

Screenshot-truth recovery is complete and the new QA passes only after verifying rendered text, route state, browser diagnostics, and screenshot pixel content. The final run produced `16` route checks, `0` failed route checks, `0` blank screenshots, `0` console errors, `0` console warnings, and `0` failed requests in [`penglish-screenshot-truth-recovery-qa.json`](penglish-screenshot-truth-recovery-qa.json:685).

## Root cause of the blank screenshots

The blank files were caused by the previous QA allowing screenshots to be treated as evidence without validating image content or render diagnostics. Two stale diagnostic artifacts were especially misleading:

- [`penglish-a1-desktop-listening-practice-missing-start.jpg`](screenshots/penglish-a1-desktop-listening-practice-missing-start.jpg)
- [`tmp-practice-diagnostic.png`](screenshots/tmp-practice-diagnostic.png)

The old flow could continue to generate or keep screenshots from a failed diagnostic path where the practice route was not proven to have visible learner UI. The prior QA did not enforce a pixel-level blank/mostly-white check, did not require sufficient `body`/`#root` content before accepting screenshots, and did not fail specifically for `about:blank`, `chrome-error://chromewebdata/`, loading-only pages, or low-information screenshots.

During recovery, the live dev server was confirmed reachable at `http://127.0.0.1:5190/home`, and the fresh Playwright captures show React mounted into `#root` with visible UI. Example final evidence for [`/home`](penglish-screenshot-truth-recovery-qa.json:12): `bodyTextLength: 2295`, `rootHtmlLength: 54167`, `visibleElementCount: 547`, and `blank: false` at [`penglish-screenshot-truth-recovery-qa.json`](penglish-screenshot-truth-recovery-qa.json:15).

## Files changed

- [`penglish-screenshot-truth-recovery-qa.cjs`](../scripts/penglish-screenshot-truth-recovery-qa.cjs): new screenshot-truth QA script with route diagnostics, image pixel analysis, strict URL checks, console/page/network failure handling, React root checks, and required screenshot capture into [`penglish-screenshot-truth-recovery`](screenshots/penglish-screenshot-truth-recovery).
- [`penglish-screenshot-truth-recovery-qa.json`](penglish-screenshot-truth-recovery-qa.json): generated JSON evidence report from the passing browser QA run.
- [`penglish-screenshot-truth-recovery.md`](penglish-screenshot-truth-recovery.md): this final recovery report.

No Supabase changes were made. No deployment was performed. The ocean/Poo visual identity was preserved.

## Screenshot-truth enforcement now added

The new QA script enforces:

- blank/mostly-white screenshot failure via [`analyzePng()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:141), including luma variance, white/near-white ratios, non-white ratio, saturated color ratio, and dark pixel ratio.
- low body text failure through `bodyTextLength` checks in [`routeFailureReasons()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:274).
- missing or empty React root failure through `rootHtmlLength` and visible element checks in [`routeFailureReasons()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:274).
- forbidden URL failure for `about:blank`, `chrome-error://chromewebdata/`, wrong origin, or wrong route path through [`isForbiddenUrl()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:133).
- console and page error failure through Playwright listeners in [`penglish-screenshot-truth-recovery-qa.cjs`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:330).
- non-favicon critical failed request failure through [`isCriticalFailedRequest()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:184).
- loading-only failure by checking for loading text after route settle in [`routeFailureReasons()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:274).

If any route produces blank content, the script prints explicit failures such as `FAIL: blank screenshot detected for /lessons/unit-1-greetings-introduction` or `FAIL: React root rendered no visible lesson UI` from [`penglish-screenshot-truth-recovery-qa.cjs`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:448).

## Runtime/navigation fixes in QA

The app runtime did not require further code changes for these routes after the previous LessonPage recovery. The required fix for this task was the QA navigation/capture logic:

- The screenshot path now uses fresh PNG captures under [`reports/screenshots/penglish-screenshot-truth-recovery`](screenshots/penglish-screenshot-truth-recovery).
- Lesson routes have all `<details>` panels opened before capture via [`revealLessonSectionsForTruthCapture()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:104), so the screenshot and text checks include real lesson content instead of only the initial collapsed section.
- The listening practice route starts the real practice screen through [`primePracticeRouteForTruthCapture()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:112), so captured screenshots show the listening question UI, not only an entry/start card.
- Local storage lock/progress keys are cleared before navigation in [`addInitScript()`](../scripts/penglish-screenshot-truth-recovery-qa.cjs:304), preventing stale hearts/progress state from hiding target UI.

## Commands run and exit codes

### TypeScript

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Exit code: `0`.

### Production build

```cmd
npm.cmd run build -w @pshare/web
```

Exit code: `0`.

Build evidence:

```text
✓ 2783 modules transformed.
✓ built in 17.13s
```

The existing Vite chunk-size warning remains non-fatal and outside this screenshot-truth recovery scope.

### Browser screenshot-truth QA

The local Vite server was already running on [`http://127.0.0.1:5190`](http://127.0.0.1:5190) from Terminal 8.

```cmd
cmd.exe /c "set PENGLISH_QA_BASE_URL=http://127.0.0.1:5190&& node scripts\penglish-screenshot-truth-recovery-qa.cjs"
```

Exit code: `0`.

Final summary:

```json
{
  "passed": true,
  "routeChecks": 16,
  "failedRouteChecks": 0,
  "blankScreenshotCount": 0,
  "consoleErrorCount": 0,
  "consoleWarningCount": 0,
  "failedRequestCount": 0,
  "screenshotDir": "reports/screenshots/penglish-screenshot-truth-recovery"
}
```

## Screenshot paths

Desktop `1366x768`:

- [`desktop-home.png`](screenshots/penglish-screenshot-truth-recovery/desktop-home.png)
- [`desktop-learning-path.png`](screenshots/penglish-screenshot-truth-recovery/desktop-learning-path.png)
- [`desktop-lesson-unit-1-greetings-introduction.png`](screenshots/penglish-screenshot-truth-recovery/desktop-lesson-unit-1-greetings-introduction.png)
- [`desktop-lesson-a1-listening-meeting-classmate.png`](screenshots/penglish-screenshot-truth-recovery/desktop-lesson-a1-listening-meeting-classmate.png)
- [`desktop-practice-a1-listening-meeting-classmate.png`](screenshots/penglish-screenshot-truth-recovery/desktop-practice-a1-listening-meeting-classmate.png)
- [`desktop-english-speed.png`](screenshots/penglish-screenshot-truth-recovery/desktop-english-speed.png)
- [`desktop-shadowing.png`](screenshots/penglish-screenshot-truth-recovery/desktop-shadowing.png)
- [`desktop-words.png`](screenshots/penglish-screenshot-truth-recovery/desktop-words.png)

Mobile `390x844`:

- [`mobile-home.png`](screenshots/penglish-screenshot-truth-recovery/mobile-home.png)
- [`mobile-learning-path.png`](screenshots/penglish-screenshot-truth-recovery/mobile-learning-path.png)
- [`mobile-lesson-unit-1-greetings-introduction.png`](screenshots/penglish-screenshot-truth-recovery/mobile-lesson-unit-1-greetings-introduction.png)
- [`mobile-lesson-a1-listening-meeting-classmate.png`](screenshots/penglish-screenshot-truth-recovery/mobile-lesson-a1-listening-meeting-classmate.png)
- [`mobile-practice-a1-listening-meeting-classmate.png`](screenshots/penglish-screenshot-truth-recovery/mobile-practice-a1-listening-meeting-classmate.png)
- [`mobile-english-speed.png`](screenshots/penglish-screenshot-truth-recovery/mobile-english-speed.png)
- [`mobile-shadowing.png`](screenshots/penglish-screenshot-truth-recovery/mobile-shadowing.png)
- [`mobile-words.png`](screenshots/penglish-screenshot-truth-recovery/mobile-words.png)

## Console, page, and network summary

Final QA evidence in [`penglish-screenshot-truth-recovery-qa.json`](penglish-screenshot-truth-recovery-qa.json:681):

- `consoleMessages: []`
- `failedRequests: []`
- `consoleErrorCount: 0`
- `consoleWarningCount: 0`
- `failedRequestCount: 0`

All `16` route captures are marked `passed: true` in the JSON evidence.

## Proof screenshot content is not blank

Every final screenshot has `blank: false`. Examples:

- Desktop home: `nonWhiteRatio: 0.53502`, `saturatedRatio: 0.20229`, `blank: false` at [`penglish-screenshot-truth-recovery-qa.json`](penglish-screenshot-truth-recovery-qa.json:15).
- Desktop learning path: `nonWhiteRatio: 0.54093`, `saturatedRatio: 0.27075`, `blank: false` at [`penglish-screenshot-truth-recovery-qa.json`](penglish-screenshot-truth-recovery-qa.json:57).
- The final summary has `blankScreenshotCount: 0` at [`penglish-screenshot-truth-recovery-qa.json`](penglish-screenshot-truth-recovery-qa.json:689).

## Remaining limitations

- The QA detects low-information blank/mostly-white screenshots using pixel statistics; it does not perform semantic computer-vision recognition of every visual element.
- Some route-specific UI is responsive and collapsed on mobile, so the script validates both visible rendered UI and full route text after expanding lesson details where appropriate.
- The existing build chunk-size warning remains and was not addressed because it is unrelated to blank screenshot truth validation.
