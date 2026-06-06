# Task 005 — Lesson Practice Keyboard UX Report

## Scope

Task executed from `tasks/penglish/005-lesson-practice-keyboard.md`.

Stop condition respected: this report covers only lesson/practice/keyboard improvements. No flashcards, English Speed, or whale visual work was started.

## Sources and files inspected

- `tasks/penglish/005-lesson-practice-keyboard.md`
- `.clinerules/penglish-lesson-import-superpowers.md`
- `apps/web/src/pages/PracticePage.tsx`
- `apps/web/src/components/practice/LessonTypingPractice.tsx`
- `apps/web/src/components/practice/LessonQuizPractice.tsx`
- `apps/web/src/lib/p-english/lesson-content-data.ts`
- `apps/web/src/App.tsx`
- `apps/web/src/api.ts`
- `package.json`

## Files changed

- `apps/web/src/components/practice/LessonTypingPractice.tsx`
- `apps/web/src/components/practice/LessonQuizPractice.tsx`
- `reports/feature-development/005-lesson-practice-keyboard-report.md`

## Implemented keyboard UX

### Typing practice

- Enter checks the current typed answer.
- Empty Enter does not mark an answer wrong; it keeps focus on the typing input.
- After a correct answer, Enter commits the result and moves to the next question.
- After a wrong answer, Enter resets the current question for retry and returns focus to the input.
- Moving to a new question automatically focuses the main input.
- Added a subtle mobile-friendly hint explaining Enter behavior.

### Quiz practice

- Enter checks the current answer.
- After a correct checked answer, Enter moves to the next question.
- After a wrong checked answer, Enter resets the same question for retry.
- A/B/C/D and 1/2/3/4 select multiple-choice options when the learner is not typing in an input.
- Fill-blank questions focus their input automatically when reached.
- Fill-blank retry returns focus to the input.
- Sentence-order Backspace behavior remains available for removing the last selected word.
- Added subtle keyboard hints for multiple-choice and fill-blank questions.

## Exercise clarity and state cleanup

- Multiple-choice options now show shortcut labels such as `A/1.` to match the keyboard hint.
- Checked quiz state no longer shows an extra footer action button that duplicated the visible feedback actions.
- Feedback flow remains concise: correct answers show confirmation and a next action; wrong answers show retry flow.

## Completion flow

- Typing summary includes a link back to `/learning-path` via `Xem lộ trình`.
- Quiz summary includes a link back to `/learning-path` via `Xem lộ trình`.
- Existing completion state and recommended next actions remain intact.

## Validation results

### TypeScript

Command run:

```cmd
npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
```

Result: passed with no TypeScript errors.

### Build

Command run:

```cmd
npm.cmd run build
```

Result: passed.

Notes:

- API workspace TypeScript build passed.
- Web Vite production build passed.
- Vite reported the existing large chunk warning for the generated JS bundle; this is not a Task 005 regression.

## Browser QA

Dev server:

```cmd
npm.cmd run dev:web
```

Vite used `http://localhost:5174/` because port 5173 was already in use.

### Typing route tested

Route:

```text
http://localhost:5174/practice?lessonId=unit-1-greetings-introduction&mode=type
```

Checks passed:

- Typing empty Enter keeps focus.
- Typing correct answer then Enter shows correct feedback.
- Enter after correct feedback advances to the next item and refocuses input.
- Typing wrong answer then Enter shows wrong feedback.
- Enter after wrong feedback resets the same item and refocuses input.

### Quiz route tested

Route:

```text
http://localhost:5174/practice?lessonId=unit-1-greetings-introduction&mode=quiz
```

Checks passed:

- A shortcut selects first multiple-choice option.
- Enter checks the selected multiple-choice answer.
- Enter after a correct multiple-choice answer advances to a fill-blank item.
- Fill-blank input auto-focuses.
- Enter submits fill-blank answer.
- Enter after correct fill-blank advances without crash.
- Wrong multiple-choice shortcut + Enter shows wrong feedback.
- Enter after wrong multiple-choice resets the same question for retry.

## Console and network QA

Console/network inspection showed expected local backend failures because no API server was running on `localhost:8080` during browser QA:

- `GET http://localhost:8080/auth/profile` failed with `net::ERR_CONNECTION_REFUSED` or `net::ERR_ABORTED` during navigation.
- `GET http://localhost:8080/categories` failed with `net::ERR_CONNECTION_REFUSED`.
- `GET http://localhost:8080/vocabularies/stats` failed with `net::ERR_CONNECTION_REFUSED`.

Warnings observed:

- React Router v7 future flag warnings.
- `motion()` deprecation warning from the current dependency bundle.
- Whale logo preload warning.

No Task 005-specific runtime crash was observed in the tested typing or quiz flows.

## Screenshots

Playwright captured screenshots during QA, but the Playwright MCP server only allowed writes inside its own allowed roots, so direct saving into the repository screenshot folder was blocked for absolute repo paths.

Screenshots captured/referenced by the Playwright MCP session:

- `005-typing-correct.png`
- `005-typing-wrong-reset.png`
- `005-quiz-shortcut-feedback.png`
- `005-quiz-fillblank-feedback.png`
- `005-quiz-wrong-reset.png`
- `005-quiz-wrong-reset-final.png`

Attempting to save directly to:

```text
C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\005-quiz-wrong-reset-final.png
```

was denied by Playwright MCP because that path is outside its allowed roots.

## Risks and notes

- Browser QA required a localStorage QA user/token because the local backend was not running. This is a QA environment limitation, not a keyboard UX regression.
- Repeated network errors are expected until `dev:api` or another compatible backend is available on `http://localhost:8080`.
- The Vite large chunk warning remains pre-existing/general build output and was not addressed in Task 005 scope.

## Stop condition confirmation

Task 005 is complete through lesson/practice/keyboard improvements only.

Not started:

- Flashcards
- English Speed
- Whale visuals
