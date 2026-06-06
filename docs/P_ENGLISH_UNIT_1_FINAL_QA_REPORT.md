# P-English Unit 1 Final QA Report

## Phạm vi

Báo cáo này kiểm tra trạng thái cuối của các tính năng học Unit 1 sau các vòng phát triển gần đây, theo hướng audit/export only. Không có thay đổi feature, backend, auth, env, Vite config, index.html hoặc build pipeline trong bước QA này.

## Routes checked

| Route | Trạng thái QA |
|---|---|
| `/lessons/unit-1-greetings-introduction` | Có route `/lessons/:lessonId` và có trang bài học local. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard` | Có branch render real `LessonFlashcardPractice`. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=quiz` | Component `LessonQuizPractice` tồn tại, nhưng `PracticePage` chưa import/render nên route hiện vẫn rơi vào placeholder. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=listen` | Preview/link có xuất hiện ở LessonPage, nhưng PracticePage chưa có real mode; hiện placeholder. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=reflex` | Preview/link có xuất hiện ở LessonPage, nhưng PracticePage chưa có real mode; hiện placeholder. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=type` | Chưa có component/branch real mode; hiện placeholder. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=match` | Chưa có component/branch real mode; hiện placeholder. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=speed` | Chưa có component/branch real mode; hiện placeholder. |

## Files inspected

- `apps/web/src/App.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `apps/web/src/pages/PracticePage.tsx`
- `apps/web/src/components/practice/LessonFlashcardPractice.tsx`
- `apps/web/src/components/practice/LessonQuizPractice.tsx`
- `apps/web/src/components/lesson/RevealAnswer.tsx`
- `apps/web/src/lib/p-english/lesson-content-data.ts`
- `apps/web/src/lib/p-english/learning-path-data.ts`

`apps/web/src/lib/p-english/lesson-progress.ts` was requested if present, but it does not exist in the inspected tree.

## Route wiring findings

- `/lessons/:lessonId` exists in `AppRoutes` and renders the current `LessonPage` shell.
- `/practice` exists in `AppRoutes` and renders current `PracticePage`.
- `PracticePage` reads `lessonId` and `mode` from query params.
- Missing lesson fallback exists for `mode=flashcard` only.
- Real local lesson mode wiring currently exists only for `mode=flashcard` in `PracticePage`.
- `mode=quiz` is not wired yet in `PracticePage`, despite `LessonQuizPractice.tsx` existing in the codebase.
- Unimplemented lesson modes use a generic placeholder and do not break the no-`lessonId` generic PracticePage cards.

## Features implemented

### Lesson page

Implemented as a read-only Unit 1 page with:

- Hero, metadata, skill tags and CTAs.
- Vocabulary grid with `speechSynthesis` guard.
- Sentence patterns.
- Mini dialogues.
- Grammar notes.
- Pronunciation notes.
- Listening preview.
- Reflex preview.
- Quiz preview.
- Completion criteria.
- CTA links to practice query params.

### Flashcard practice

Implemented as a real local mode using `lesson.flashcards`:

- Deck navigation.
- Flip card interaction.
- Speech synthesis with safe guards.
- Space shortcut guarded against typing targets.
- Remembered / needs-review tracking.
- Summary screen.
- LocalStorage progress merge.

### Quiz practice

`LessonQuizPractice.tsx` exists and is feature-rich:

- Combines `quizQuestions`, `sentenceOrderingTasks`, and `fillBlankTasks`.
- Supports multiple-choice, fill-blank, sentence-order and match-meaning.
- Has answer normalization for case, whitespace, apostrophes and trailing punctuation in sentence-order.
- Has keyboard shortcuts: Enter, number keys 1–4, Backspace for sentence-order.
- Has summary screen and localStorage quiz progress.

However, it is not yet imported/rendered from `PracticePage`, so the public route still shows the placeholder.

## Features still preview-only or placeholder-only

- Listening: `LessonPage` preview only; no real `mode=listen` branch found.
- Reflex: `LessonPage` preview only; no real `mode=reflex` branch found.
- Typing: no real `mode=type` branch/component found.
- Match: no real `mode=match` branch/component found.
- Speed: no real `mode=speed` branch/component found.
- SRS/helper progress dashboard: no `lesson-progress.ts` helper found.

## LocalStorage schema found

Shared key pattern:

```json
"p-english:lesson-progress:unit-1-greetings-introduction"
```

Observed fields implemented in components:

```json
{
  "lessonId": "unit-1-greetings-introduction",
  "flashcard": {
    "reviewedCardIds": [],
    "rememberedCardIds": [],
    "needsReviewCardIds": [],
    "lastReviewedAt": "ISO string",
    "completedSessions": 0
  },
  "quiz": {
    "attempts": 0,
    "bestScore": 0,
    "lastScore": 0,
    "lastPercentage": 0,
    "wrongQuestionIds": [],
    "lastCompletedAt": "ISO string"
  }
}
```

Merge behavior:

- Flashcard uses object spread and preserves unknown fields.
- Quiz uses object spread and preserves unknown fields.
- Both should avoid overwriting each other when their components are actually invoked.

Expected but not implemented/found:

- `listening`
- `reflex`
- `typing`
- `match`
- `speed`
- `srs`

## UI/UX QA

Positive findings:

- Chakra UI components use responsive props such as base/md columns and wrap-heavy `HStack`/`Flex` layouts.
- LessonPage has mobile-friendly grids and wrapped CTAs.
- Flashcard buttons and summary use wrapped layouts.
- Quiz component uses wrapped options/chips and avoids obvious horizontal overflow.
- `speechSynthesis` usage is guarded by `typeof window`, synth availability and empty text checks.
- Keyboard shortcuts guard input/textarea/select/contenteditable targets in flashcard and quiz.
- Summary screens exist for flashcard and quiz component.
- "Quay về bài học" links are present in flashcard and quiz component.

Risks:

- LessonPage still describes the page as read-only and says practice engines will be connected later in some copy, while flashcard is already connected and quiz component exists.
- LessonPage CTA links include listen/reflex even though those modes are currently placeholders.
- Quiz route does not work yet because `PracticePage` still routes all non-flashcard modes to placeholder.
- `PracticePage` localStorage initializers for generic sound settings directly call `localStorage`; fine in browser Vite client, but not SSR-safe if the app is ever server-rendered.
- No automated responsive/browser QA was run; this is source-level QA plus build attempt.

## Content QA

Positive findings:

- Unit 1 vocabulary count is 18 and completion criteria requires 18 flashcards.
- Vocabulary is A1-appropriate: greetings, name, origin, student/teacher/friend, thanks/goodbye.
- Examples are generally natural and short.
- Mini dialogues are simple and answerable for A1.
- Grammar notes are simple and not too academic.
- Listening questions are answerable from the audio text.
- Reflex acceptable answers include reasonable variants such as `I am` vs `I’m` where intended.
- Quiz multiple-choice answers are present in options.
- Sentence ordering answers match the provided words.
- Fill blank answers are clear.
- Flashcards are generated from vocabulary and align with vocabulary count.

Content risks:

- Some quiz questions lack `explanationVi`: `quiz-4-nice-order`, `quiz-5-good-morning`, `quiz-6-match-goodbye`, `quiz-7-my-name-is`, `quiz-9-where-order`, `quiz-10-thank-you-meaning`.
- Quiz component intentionally keeps combined duplicate-like items from `quizQuestions`, `sentenceOrderingTasks`, and `fillBlankTasks`; this reinforces patterns but can feel repetitive.
- No validation helper exists yet for duplicate ids, empty fields, quiz answer mismatches or completion criteria.

## Build result

Command run from `Luyen Tu`:

```bash
npm run build
```

Result:

- API TypeScript build completed.
- Web Vite build failed with the known path/html inline proxy issue.

Error:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

This matches the previously documented known Vite `html-inline-proxy` issue associated with the project path containing a space (`Luyen Tu`). Per task constraints, Vite config, `index.html`, and build pipeline were not modified.

## Top 5 remaining issues

1. `mode=quiz` component exists but is not wired in `PracticePage`; route currently shows placeholder.
2. `listen`, `reflex`, `type`, `match`, and `speed` are still placeholder-only in `PracticePage`.
3. No shared `lesson-progress.ts` helper exists; progress read/write logic is duplicated in practice components.
4. No content validation helper exists for duplicate IDs, empty fields and answer-option consistency.
5. Production build remains blocked by known Vite `html-inline-proxy` path-space issue.

## Recommended next work

1. Wire `LessonQuizPractice` into `PracticePage` for `mode=quiz`.
2. Implement real local `listen`, `reflex`, `type`, `match`, and `speed` components incrementally.
3. Add shared local progress helper to avoid duplicated safe localStorage code.
4. Add content validation helper and report warnings in development/docs.
5. After Unit 1 route coverage is complete, move to Unit 2 content only when Unit 1 practice modes are stable.

## Readiness before Unit 2

Unit 1 is ready enough as a lesson-content and flashcard MVP, but not ready as a complete multi-mode learning unit. The recommended threshold before expanding Unit 2 is at least:

- Wire quiz route.
- Keep flashcard and quiz progress stable.
- Decide whether listen/reflex/type/match/speed are required before content expansion or can remain planned work.
