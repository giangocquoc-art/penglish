# P-English current lesson-system audit

Date: 2026-06-01
Scope: focused audit before A1 listening adaptation. No production deploy, no Supabase edits.

## 1. Lesson data files

Primary lesson/data files inspected or identified:

- `apps/web/src/lib/p-english/lesson-content-data.ts`
  - Main handcrafted lesson schema and current Unit 1/2/3 data.
  - Existing `EnglishLesson` already supports CEFR-like level, title, subtitle, estimated time, objectives, vocabulary, listening practice, quiz, sentence ordering, fill blank, review rules, and completion criteria.
  - Current `ListeningPracticeItem` supports `text`, `question`, `options`, `answer`, and optional speech synthesis, but does not yet include Vietnamese answer explanations.
- `apps/web/src/data/learning/generatedUnifiedLearningPath.ts`
  - Main generated learning-path units.
  - Current A1 path starts with greetings, then family/school.
  - `UnifiedSkillFocus` does not include `Nghe`, so listening-focused path integration needs a small type/data update.
- `apps/web/src/lib/p-english/unifiedLessonEngine.ts`
  - Bridges learning path units to runtime lesson routes and available practice modes.
- `apps/web/src/lib/p-english/learning-path-data.ts`
  - Legacy compatibility layer for learning path cards and CTA labels.

## 2. Routes/components

Required routes are preserved by `apps/web/src/App.tsx`:

- `/` → landing page.
- `/learning-path` → `LearningPathPage`.
- `/lessons/:lessonId` → `LessonPage`.
- `/english-speed` → `EnglishSpeedPage`.
- `/shadowing` → `ShadowingPage`.
- `/words` and `/vocabularies` → `VocabPage`.
- `/practice` → `PracticePage`.

Important practice components:

- `apps/web/src/components/practice/LessonListeningPractice.tsx`
  - Already has TTS, slow replay, options, answer checking, transcript toggle, keyboard shortcuts, next question, and summary.
  - Main issue: listening completion is saved to a component-specific localStorage key instead of the centralized lesson progress store.
- `apps/web/src/components/p-english/DynamicGuidedLessonFlow.tsx`
  - Uses available practice modes passed from progress utilities.
  - Empty fallback strings exist, but should not appear if modes are filtered correctly.
- `apps/web/src/pages/LessonPage.tsx`
  - Shows lesson hero, progress dashboard, guided flow, vocabulary, patterns, listening preview, quiz, and review.
  - Uses `getAvailableLessonProgressModes`, so empty modes can be hidden.

## 3. Validation/build scripts

- Workspace build target: `npm run build -w @pshare/web`.
- Root build fallback: `npm run build`.
- Existing data audit script: `scripts/audit-penglish-learning-data.cjs`.
- No Supabase or deploy commands should be run for this task.

## 4. Current progress/localStorage logic

- `apps/web/src/lib/p-english/lesson-progress.ts`
  - Central store key: `penglish.lesson.progress.v1`.
  - Exposes `readLessonProgress`, `mergeLessonProgress`, `markLessonStepCompleted`, `markLessonCompleted`, and `calculateLessonProgressSummary`.
  - `getAvailableLessonProgressModes` hides modes with no usable content.
- `apps/web/src/lib/p-english/daily-rewards.ts`
  - Tracks daily activity, streak, and bubbles through `recordLearningActivity`.
- `apps/web/src/lib/p-english/local-progress.ts`
  - Legacy local progress and once-per-day streak helper.
- `LessonListeningPractice` currently saves listening progress to `p-english:lesson-progress:${lessonId}`, which does not feed `LessonPage` progress summary or daily rewards reliably.
- `PracticePage` increments the legacy study day on valid practice route entry. This is less precise than recording after a real learning action.

## 5. Missing mode data / empty states

Current Unit 1 is mostly complete and includes:

- Flashcards and vocabulary.
- Quiz questions.
- Listening items.
- Speaking/reflex prompts.
- Sentence ordering and fill blank tasks.

Potential gaps:

- Unit 1 listening items need Vietnamese explanations.
- Listening completion must update centralized progress.
- New A1 listening lessons must include enough fallback content for shown modes, or only expose modes that have real data.
- Learning path should show complete data status without fake labels or crowded mobile cards.

## 6. Broken “Chưa có dữ liệu” states

Likely sources:

- Practice components have empty states for unavailable mode data.
- The current mode filter should prevent these states, but only if learning path and practice route use `getAvailableLessonProgressModes` consistently.
- New lessons should provide robust content for `flashcard`, `quiz`, `listen`, `reflex`, `type`, `match`, and `speed` if those modes are recommended.

## 7. Mobile layout issues to watch

- Lesson pages have many cards; mobile must keep sections compact.
- Bottom nav requires safe bottom padding so buttons are not covered.
- Transcript/details panels should be collapsible.
- Learning-path cards should avoid excessive badges on small screens.
- Listening answer buttons should stay large and easy to tap.

## 8. Repeated mascot / ambient whale issues

- `AmbientPooWhale` already disables ambient whale for lesson, speed, and shadowing presets to avoid competing with controls.
- Dashboard/roadmap/vocabulary presets are subtle and mobile-reduced.
- Further changes should be conservative: no large extra mascots in lesson/practice cards, pointer-events none for ambient visuals, and avoid overlap with bottom nav.

## 9. Shadowing status

- `ShadowingPage` already uses the wording `Shadowing cùng Poo`.
- It has a clean fallback when YouTube embed is blocked or unavailable.
- Transcript-only practice is available, so no large change is needed.

## 10. Short implementation plan

1. Extend `ListeningPracticeItem` with optional Vietnamese explanation metadata.
2. Add explanations to Unit 1 listening items.
3. Add two original A1 listening-style lessons with full beginner data.
4. Add a listening-focused A1 learning-path unit and extend `UnifiedSkillFocus` with `Nghe`.
5. Update skill coverage/CTA mapping for `Nghe`.
6. Update listening practice to save through centralized `mergeLessonProgress` and record a real daily learning activity on completion.
7. Show per-question Vietnamese explanation after answer checking.
8. Reduce premature streak behavior in `PracticePage` so streak reflects real activity rather than page entry.
9. Run build/data audit and browser QA.
