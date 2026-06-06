# P-English Unit 1 Complete QA Report

Ngày QA: 2026-05-21

Phạm vi QA: source-level QA cho Unit 1 sau khi đã có lesson page, flashcard, quiz, listening, reflex, typing, match, speed, progress dashboard, local SRS, và content validation.

## 1. Kết luận tổng quan

Unit 1 `unit-1-greetings-introduction` đã đủ nền tảng để dùng làm template cho Unit 2 ở mức source-level, với điều kiện giữ nguyên các rủi ro đã biết trong backlog trước khi nhân rộng.

Trạng thái tổng thể: `READY_WITH_KNOWN_ISSUES`.

Lý do:

- Route bài học Unit 1 được render qua [`LessonPage.tsx`](apps/web/src/pages/LessonPage.tsx).
- Toàn bộ mode practice được route trong [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx).
- Các component practice Unit 1 đều tồn tại trong [`apps/web/src/components/practice`](apps/web/src/components/practice).
- Local progress và SRS đã có helper tập trung trong [`lesson-progress.ts`](apps/web/src/lib/p-english/lesson-progress.ts).
- Content validation helper đã có trong [`lesson-content-validation.ts`](apps/web/src/lib/p-english/lesson-content-validation.ts).
- Build vẫn fail bởi lỗi Vite `html-inline-proxy` đã biết, liên quan path có khoảng trắng `Luyen Tu`; không sửa theo scope.
- TypeScript check vẫn fail bởi 3 lỗi không thuộc Unit 1 trong [`CategoriesPage.tsx`](apps/web/src/pages/CategoriesPage.tsx), [`FoldersPage.tsx`](apps/web/src/pages/FoldersPage.tsx), và [`StudyPage.tsx`](apps/web/src/pages/StudyPage.tsx); không sửa theo scope QA hiện tại.

## 2. Source files đã inspect

| File | Vai trò | QA status |
|---|---|---|
| [`LessonPage.tsx`](apps/web/src/pages/LessonPage.tsx) | Trang bài học, dashboard tiến độ, smart review card, CTA luyện tập | Pass with UX notes |
| [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) | Dispatcher theo query `lessonId` và `mode` | Pass with API-call risk |
| [`LessonFlashcardPractice.tsx`](apps/web/src/components/practice/LessonFlashcardPractice.tsx) | Flashcard + SRS + `review=due` | Pass |
| [`LessonQuizPractice.tsx`](apps/web/src/components/practice/LessonQuizPractice.tsx) | Quiz tổng hợp + SRS marking | Pass with due-review limitation |
| [`LessonListeningPractice.tsx`](apps/web/src/components/practice/LessonListeningPractice.tsx) | Listening mode | Pass |
| [`LessonReflexPractice.tsx`](apps/web/src/components/practice/LessonReflexPractice.tsx) | Reflex mode | Pass |
| [`LessonTypingPractice.tsx`](apps/web/src/components/practice/LessonTypingPractice.tsx) | Typing mode | Pass |
| [`LessonMatchPractice.tsx`](apps/web/src/components/practice/LessonMatchPractice.tsx) | Match mode | Pass |
| [`LessonSpeedPractice.tsx`](apps/web/src/components/practice/LessonSpeedPractice.tsx) | Speed mode | Pass |
| [`lesson-content-data.ts`](apps/web/src/lib/p-english/lesson-content-data.ts) | Unit 1 local content source | Pass |
| [`lesson-progress.ts`](apps/web/src/lib/p-english/lesson-progress.ts) | localStorage progress + SRS helpers | Pass with coverage notes |
| [`lesson-content-validation.ts`](apps/web/src/lib/p-english/lesson-content-validation.ts) | Reusable lesson content validator | Pass |

## 3. Route status

| Route | Source route/handler | Status | Notes |
|---|---|---|---|
| `/lessons/unit-1-greetings-introduction` | [`LessonPage.tsx`](apps/web/src/pages/LessonPage.tsx) + [`getLessonById`](apps/web/src/lib/p-english/lesson-content-data.ts) | Pass | Lesson content, preview sections, progress dashboard, smart review card render from local Unit 1 data. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard` | [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) -> [`LessonFlashcardPractice.tsx`](apps/web/src/components/practice/LessonFlashcardPractice.tsx) | Pass | Uses Unit 1 flashcard deck and local progress. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=quiz` | [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) -> [`LessonQuizPractice.tsx`](apps/web/src/components/practice/LessonQuizPractice.tsx) | Pass | Uses multiple-choice, sentence ordering, and fill-blank tasks. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=listen` | [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) -> [`LessonListeningPractice.tsx`](apps/web/src/components/practice/LessonListeningPractice.tsx) | Pass | Uses Unit 1 listeningPractice data. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=reflex` | [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) -> [`LessonReflexPractice.tsx`](apps/web/src/components/practice/LessonReflexPractice.tsx) | Pass | Uses speakingReflexPrompts. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=type` | [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) -> [`LessonTypingPractice.tsx`](apps/web/src/components/practice/LessonTypingPractice.tsx) | Pass | Uses Unit 1 typing/fill style practice. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=match` | [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) -> [`LessonMatchPractice.tsx`](apps/web/src/components/practice/LessonMatchPractice.tsx) | Pass | Uses vocabulary matching. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=speed` | [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) -> [`LessonSpeedPractice.tsx`](apps/web/src/components/practice/LessonSpeedPractice.tsx) | Pass | Uses mixed speed question pool. |
| `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard&review=due` | [`LessonFlashcardPractice.tsx`](apps/web/src/components/practice/LessonFlashcardPractice.tsx) + [`getDueReviewItems`](apps/web/src/lib/p-english/lesson-progress.ts) | Pass | Due-only flashcard review supported. |

## 4. Mode status

| Mode | Data source | Progress write | SRS write | Status |
|---|---|---|---|---|
| Flashcard | `lesson.flashcards` | `flashcard` field in local progress | Yes, via flashcard item review | Pass |
| Quiz | `quizQuestions`, `sentenceOrderingTasks`, `fillBlankTasks` | `quiz` field in local progress | Yes, marks current quiz item | Pass with limitation: no due-only quiz route in current source snapshot |
| Listening | `listeningPractice` | `listening` field | Partial/none in current inspected SRS coverage | Pass |
| Reflex | `speakingReflexPrompts` | `reflex` field | Partial/none in current inspected SRS coverage | Pass |
| Typing | fill/typing practice source from Unit 1 | `typing` field | Not mapped into SRS review items | Pass with limitation |
| Match | `vocabulary` pairs | `match` field | Mappable by type but SRS usage not complete across mode | Pass |
| Speed | mixed pool from vocabulary, quiz, reflex | `speed` field | Not mapped into SRS review items | Pass with limitation |

## 5. LocalStorage schema

Storage key pattern:

```text
p-english:lesson-progress:${lessonId}
```

Unit 1 key:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Primary schema from [`lesson-progress.ts`](apps/web/src/lib/p-english/lesson-progress.ts):

```json
{
  "lessonId": "unit-1-greetings-introduction",
  "flashcard": {
    "reviewedCardIds": [],
    "rememberedCardIds": [],
    "needsReviewCardIds": [],
    "completed": false,
    "lastReviewedAt": "ISO_DATE"
  },
  "quiz": {
    "answeredQuestionIds": [],
    "correctQuestionIds": [],
    "wrongQuestionIds": [],
    "score": 0,
    "total": 0,
    "completed": false,
    "lastReviewedAt": "ISO_DATE"
  },
  "listening": {
    "completedItemIds": [],
    "correctItemIds": [],
    "wrongItemIds": [],
    "replayCount": 0,
    "completed": false,
    "lastReviewedAt": "ISO_DATE"
  },
  "reflex": {
    "completedPromptIds": [],
    "strongPromptIds": [],
    "weakPromptIds": [],
    "completed": false,
    "lastReviewedAt": "ISO_DATE"
  },
  "typing": {
    "completedTaskIds": [],
    "correctTaskIds": [],
    "wrongTaskIds": [],
    "completed": false,
    "lastReviewedAt": "ISO_DATE"
  },
  "match": {
    "completedPairIds": [],
    "weakPairIds": [],
    "mistakes": 0,
    "completed": false,
    "lastReviewedAt": "ISO_DATE"
  },
  "speed": {
    "answeredItemIds": [],
    "correctItemIds": [],
    "wrongItemIds": [],
    "bestScore": 0,
    "lastScore": 0,
    "completed": false,
    "lastReviewedAt": "ISO_DATE"
  },
  "srs": {
    "items": {
      "item-id": {
        "itemId": "item-id",
        "type": "flashcard",
        "level": 1,
        "lastReviewedAt": "ISO_DATE",
        "nextReviewAt": "ISO_DATE",
        "wrongCount": 0,
        "correctCount": 1
      }
    }
  }
}
```

QA notes:

- Helper [`mergeLessonProgress`](apps/web/src/lib/p-english/lesson-progress.ts) preserves existing fields while updating a mode-specific patch.
- Some practice components still have local safe read/write wrappers; this is not a functional blocker but should be consolidated before Unit 2 to reduce drift.
- localStorage is browser-only guarded by storage access helper, so SSR crash risk is low in current Vite SPA context.

## 6. SRS status

| Area | Status | Notes |
|---|---|---|
| SRS types | Pass | `SrsItemType`, `SrsReviewResult`, `LessonSrsItem`, `LessonSrsReviewItem` exist in [`lesson-progress.ts`](apps/web/src/lib/p-english/lesson-progress.ts). |
| Review intervals | Pass | Wrong answers return in 10 minutes; correct answers scale from 10 minutes to 1/3/7/14/30 days. |
| Marking reviewed items | Pass | [`markItemReviewed`](apps/web/src/lib/p-english/lesson-progress.ts) updates level, counts, and next review time. |
| Due review lookup | Pass | [`getDueReviewItems`](apps/web/src/lib/p-english/lesson-progress.ts) filters by `nextReviewAt <= now`. |
| Weak review lookup | Pass | [`getWeakReviewItems`](apps/web/src/lib/p-english/lesson-progress.ts) filters wrong-count or low-level items. |
| Flashcard due route | Pass | `review=due` supported in [`LessonFlashcardPractice.tsx`](apps/web/src/components/practice/LessonFlashcardPractice.tsx). |
| Quiz SRS marking | Pass | Quiz records SRS on checked answer. |
| Quiz due route | Gap | Current source snapshot tracks quiz SRS but does not provide quiz due-only practice route. |
| Typing/speed SRS mapping | Gap | SRS type union includes these types, but review-item mapping is not complete for all mode item sources. |

## 7. Content validation status

Content validation helper: [`lesson-content-validation.ts`](apps/web/src/lib/p-english/lesson-content-validation.ts).

Validated areas implemented:

- metadata
- duplicate IDs per collection
- vocabulary required fields and tags
- flashcard count and required strings
- quiz options, answer, and explanation
- sentence ordering answer composition
- fill blank prompt and answer
- listening answer/options/text sanity
- reflex acceptable answers
- completion criteria count consistency

QA status: Pass at helper/source level.

Risk: validation helper is not yet wired into an automated test or CI command, so future Unit 2 content regressions could be missed unless manually invoked or added to a test script.

## 8. UI/mobile risks

| Risk | Severity | Detail |
|---|---:|---|
| PracticePage background API calls on local Unit 1 routes | Medium | [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) still calls legacy `/categories` and `/vocabularies/stats` even when dispatching local Unit 1 modes. Could create noisy failures offline or when API is unavailable. |
| CTA discoverability incomplete | Medium | [`LessonPage.tsx`](apps/web/src/pages/LessonPage.tsx) exposes major CTAs, but not every mode is equally discoverable from the lesson page CTA area. |
| Long content cards on mobile | Low | Vocabulary, quiz, match, and speed cards use responsive layouts, but long English/Vietnamese strings may still create tall cards on small screens. |
| Audio API availability | Low | Text-to-speech depends on browser `speechSynthesis`; unsupported browsers degrade silently. |
| Local progress per-device only | Medium | localStorage progress does not sync across devices/accounts. Acceptable for local Unit 1 prototype, but should be clarified before production learning analytics. |
| SRS session mutation/restart edge cases | Low | Due decks are derived from localStorage; if SRS changes during a session, flashcard due deck can reset/recompute. |

## 9. Remaining TypeScript/build issues

### `npx tsc -p apps/web/tsconfig.json --noEmit`

Result: Failed with known unrelated TypeScript errors.

Observed output:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

QA classification: known unrelated TypeScript blockers outside Unit 1 source files.

### `npm run build`

Result: Failed with known Vite `html-inline-proxy` error.

Observed output:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

QA classification: known pre-existing path-space/build-pipeline issue. Not fixed because scope explicitly forbids Vite config, `index.html`, and build-pipeline changes.

## 10. Top 10 issues to fix before Unit 2

1. Fix unrelated TypeScript errors in [`CategoriesPage.tsx`](apps/web/src/pages/CategoriesPage.tsx), [`FoldersPage.tsx`](apps/web/src/pages/FoldersPage.tsx), and [`StudyPage.tsx`](apps/web/src/pages/StudyPage.tsx) so `tsc --noEmit` can be a reliable regression gate.
2. Resolve or formally work around the Vite `html-inline-proxy` failure caused by the `Luyen Tu` path-space issue without changing behavior unexpectedly.
3. Remove or gate legacy API fetches in [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx) for local Unit lesson practice routes.
4. Consolidate duplicated localStorage read/write wrappers in practice components into [`lesson-progress.ts`](apps/web/src/lib/p-english/lesson-progress.ts).
5. Add automated invocation/tests for [`validateLessonContent`](apps/web/src/lib/p-english/lesson-content-validation.ts) before adding Unit 2 content.
6. Add due-only quiz review route if SRS is expected to cover quiz items, not just flashcards.
7. Complete SRS mapping and review UI for typing, match, speed, listening, and reflex if those modes should influence smart review.
8. Improve LessonPage CTA coverage so users can discover all available modes, including typing, match, and speed.
9. Add a lightweight mobile QA checklist or screenshot pass for long text and two-column interactions like match mode.
10. Define production policy for local-only progress versus authenticated/cloud-synced learning progress.

## 11. Readiness as Unit 2 template

Decision: `YES_WITH_CONDITIONS`.

Unit 1 is ready to become the Unit 2 template for:

- lesson content shape in [`lesson-content-data.ts`](apps/web/src/lib/p-english/lesson-content-data.ts)
- route dispatching via [`PracticePage.tsx`](apps/web/src/pages/PracticePage.tsx)
- lesson rendering via [`LessonPage.tsx`](apps/web/src/pages/LessonPage.tsx)
- local progress schema via [`lesson-progress.ts`](apps/web/src/lib/p-english/lesson-progress.ts)
- content validation rules via [`lesson-content-validation.ts`](apps/web/src/lib/p-english/lesson-content-validation.ts)
- practice mode component pattern in [`apps/web/src/components/practice`](apps/web/src/components/practice)

Conditions before scaling to Unit 2:

- Keep Unit 2 content validated through the same helper before render.
- Fix TypeScript blockers or clearly isolate them from Unit 2 development.
- Decide whether SRS is flashcard-first or all-mode before adding more lessons.
- Avoid duplicating progress helper logic in new Unit 2 components.
- Add route/mode checklist to the Unit 2 implementation report.

## 12. Final QA verdict

Final source-level QA verdict: Unit 1 passes route/mode/content/progress/SRS source readiness, but project-level green build and green TypeScript cannot be claimed until known unrelated TypeScript errors and the Vite path-space build issue are resolved.
