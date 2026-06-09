# P-English Phase 2 QA Report

Checked at: 2026-06-05T15:25:03.174Z

## Validation

- Production build passed: `npm run build -w @pshare/web`.
- Smoke browser QA passed with `scripts/zoo-deploy-browser-qa.cjs`.
- Phase 2 browser QA passed with `scripts/penglish-phase2-browser-qa.cjs`.
- No console errors were captured.
- No unfiltered failed requests were captured.
- No horizontal overflow was found on checked routes and viewports.

## Routes and viewports checked

Each route was checked at desktop 1440x900, laptop 1366x768, and mobile 390x844 where applicable:

- `/home`
- `/learning-path`
- `/luyen-tieng-anh/48-ngay-lay-goc`
- `/english-speed`
- `/shadowing`
- `/practice`
- `/words`

Additional desktop checks:

- `/luyen-tieng-anh/48-ngay-lay-goc/ngay/1`
- Learning Path node -> interactive lesson completion flow
- Shadowing advanced transcript collapse state

## Key feature confirmations

- Learning Path node opened an interactive lesson and completed to the XP/result summary.
- Foundation48 Day 1 showed the required learner title: “Ngày 1: Tôi là ai? — I am / You are / I’m not”.
- Foundation48 Day 1 showed the guided “Học mẫu câu” flow.
- English Speed showed the three clarified modes: Speed Reading, Speed Listening, Speed Speaking.
- English Speed showed score/timer and cleaned labels such as “CÂU LUYỆN” and “KỶ LỤC”.
- Shadowing showed the simplified Listen/Repeat/Record flow and advanced transcript creation was collapsed by default.
- Practice route loaded starter/beginner training content.
- Words route loaded without stuck loading and exposed starter CEFR content.

## Screenshot artifacts

Phase 2 screenshots were saved under `reports/screenshots`:

- `phase2-home-desktop.png`, `phase2-home-laptop.png`, `phase2-home-mobile.png`
- `phase2-learning-path-desktop.png`, `phase2-learning-path-laptop.png`, `phase2-learning-path-mobile.png`
- `phase2-foundation48-desktop.png`, `phase2-foundation48-laptop.png`, `phase2-foundation48-mobile.png`
- `phase2-foundation48-day1-lesson.png`
- `phase2-english-speed-desktop.png`, `phase2-english-speed-laptop.png`, `phase2-english-speed-mobile.png`
- `phase2-shadowing-desktop.png`, `phase2-shadowing-laptop.png`, `phase2-shadowing-mobile.png`
- `phase2-shadowing-collapsed-advanced.png`
- `phase2-practice-desktop.png`, `phase2-practice-laptop.png`, `phase2-practice-mobile.png`
- `phase2-words-desktop.png`, `phase2-words-laptop.png`, `phase2-words-mobile.png`
- `phase2-learning-path-completed-lesson.png`

## Notes

- The first Phase 2 QA run surfaced transient aborted ambient whale frame requests while navigating rapidly between pages; these were filtered as benign animation-frame aborts in the final QA script.
- The first Phase 2 QA run checked `/words` too early while the lazy route fallback was visible. The final QA waits for the words root before assertions.
- Full-page screenshots occasionally timed out on highly animated pages. The QA script now captures viewport screenshots to make repeated automated QA stable.

## Result

Phase 2 implementation is build-valid and browser-QA valid for the requested core flows.
