# P-English Additional Lesson Expansion Report

Date: 2026-06-05

## Scope

The user requested continuing lesson expansion after the reading/shadowing path audit. This pass added new app-authored reading and shadowing lessons, then connected them to the unified learning path.

Changed files:

- [`generatedReadingLessons.ts`](../apps/web/src/data/reading/generatedReadingLessons.ts)
- [`generatedShadowingCatalog.ts`](../apps/web/src/data/shadowing/generatedShadowingCatalog.ts)
- [`generatedUnifiedLearningPath.ts`](../apps/web/src/data/learning/generatedUnifiedLearningPath.ts)

## New lessons added

### B1 reading

Added `reading-b1-resolving-a-misunderstanding`.

Goal:

- Help B1 learners read a practical group-project situation.
- Practice calm communication after a misunderstanding.
- Teach the pattern `Instead of + V-ing, subject agreed to + verb`.

Runtime content includes:

- B1-level passage.
- Vietnamese setup.
- focus sentence and Vietnamese meaning.
- two comprehension questions.
- one fill-blank task.
- one sentence-ordering task.
- vocabulary focus: `misunderstanding`, `blame`, `shared channel`.

### B2 reading

Added `reading-b2-evaluating-a-learning-tool`.

Goal:

- Help B2 learners evaluate learning tools by deeper criteria.
- Practice argument structure around habits, feedback loops, and practical value.
- Teach the pattern `Subject should be judged by X, not only by Y`.

Runtime content includes:

- B2-level analytical passage.
- Vietnamese setup.
- focus sentence and Vietnamese meaning.
- two comprehension questions.
- one fill-blank task.
- one sentence-ordering task.
- vocabulary focus: `judge`, `feedback loop`, `practical value`.

### B1 shadowing

Added `shadow-b1-resolving-a-misunderstanding`.

Goal:

- Give B1 learners a speakable script for resolving group-chat misunderstandings.
- Practice calm explanation, shared-channel proposal, and non-blaming language.

### B2 shadowing

Added `shadow-b2-evaluating-a-learning-tool`.

Goal:

- Give B2 learners a speakable opinion script about evaluating learning tools.
- Practice balanced evaluation language: habits, attractive features, feedback, repetition, attention, and learning design.

## Learning-path integration

Updated [`generatedUnifiedLearningPath.ts`](../apps/web/src/data/learning/generatedUnifiedLearningPath.ts):

1. B1 reading path
   - Added `reading-b1-resolving-a-misunderstanding` to `lessonIds`, `sourceIds`, and source module references.
   - Updated subtitle, estimated time, and maturity note.

2. B1 shadow path
   - Added `reading-b1-resolving-a-misunderstanding` as a reading bridge.
   - Added `shadow-b1-resolving-a-misunderstanding` as a shadowing source.
   - Updated subtitle, estimated time, confidence goal, maturity note, and source module references.

3. B2 reading path
   - Added `reading-b2-evaluating-a-learning-tool` to `lessonIds`, `sourceIds`, and source module references.
   - Updated subtitle, estimated time, and maturity note.

4. B2 pronunciation path
   - Added `reading-b2-evaluating-a-learning-tool` and `shadow-b2-evaluating-a-learning-tool` to support B2 opinion/pronunciation practice.
   - Updated maturity note and source references.

## Source and safety policy

All added learner-facing content is app-authored. No external repo transcript, copyrighted media, or restricted dataset content was copied.

The new content follows the existing TypeScript data-shape patterns in the generated lesson files and routes through the existing adapters/pages.

## Validation

Validation passed with:

- `npx tsc -p apps/web/tsconfig.json --noEmit`
- `npm run build -w '@pshare/web'`
- `node scripts/penglish-learning-path-progress-qa.cjs`

Browser QA result:

- `ok: true`
- mobile viewport: `390x844`
- desktop viewport: `1366x768`
- no console errors
- no failed requests
- no unexpected progress writes
- screenshots generated:
  - `learning-path-progress-mobile.png`
  - `learning-path-progress-desktop.png`
  - `learning-path-after-progress-reload.png`

Build note:

- Production build passed.
- Existing Vite chunk-size warning remains non-blocking and unrelated to this content expansion.

## Outcome

This pass added four new app-authored lessons/scripts and connected them into the B1/B2 learning path. The path now has stronger coverage for misunderstanding resolution, learning-tool evaluation, feedback-oriented speaking, and practical B1/B2 communication development.
