# Task 002 — Schema Validation Report

## Files created or changed

- Created `apps/web/src/data/lessons/lessonSchema.ts`
- Created `apps/web/src/data/lessons/validateLessons.ts`
- Created `apps/web/src/data/lessons/fixtures/schemaSmokeFixture.ts`
- Created `scripts/lesson-import/validate-lessons.ts`
- Updated `package.json` with `validate:lessons`

No files under `external-sources/` were edited. No UI routes or lesson UI files were modified. No generated lesson packs were created.

## Existing lesson model observations

- Current UI lesson data lives under `apps/web/src/lib/p-english/lesson-content-data.ts` and uses the existing `EnglishLesson` model.
- Existing learning path cards live in `apps/web/src/lib/p-english/learning-path-data.ts` and map units to current local lesson IDs.
- Existing lesson validation in `apps/web/src/lib/p-english/lesson-content-validation.ts` is warning-based and tied to the current UI model.
- The new schema foundation is intentionally separate from the current UI model so future imports can be normalized and validated before integration.

## New schema summary

`lessonSchema.ts` defines strict Zod schemas for future P-English lesson imports:

- Lesson metadata: `id`, `moduleId`, `sourceMeta`, `cefrLevel`, `titleVi`, `titleEn`, `goalVi`, `explanationVi`
- Learning content: `vocabulary`, `grammarPoint`, `examples`, `exercises`
- UX/completion fields: `keyboardHint`, `completionReward`, `nextLessonId`, `needsReview`, `importNotes`
- CEFR levels: `A1`, `A2`, `B1`, `B2`
- Source status values: `importCandidate`, `metadataCandidate`, `referenceOnly`, `original`
- Exercise types prepared for future imports:
  - `multiple-choice`
  - `fill-blank`
  - `typing`
  - `matching`
  - `sentence-reorder`
  - `flashcard-review`
  - `shadowing-prompt`

TypeScript types are exported with `z.infer` so import scripts and future UI integration can share one runtime/type contract.

## Validation approach

- `validateLessons.ts` exposes:
  - `validateLesson(input)` for one lesson.
  - `validateLessons(input)` for arrays of lessons.
  - `formatLessonValidationIssues(issues)` for CLI-friendly output.
- `schemaSmokeFixture.ts` contains one tiny original A1 fixture that is not connected to UI and is not imported from external sources.
- `scripts/lesson-import/validate-lessons.ts` validates the smoke fixture and exits non-zero on failure.
- Command added:

```bash
npm run validate:lessons
```

## Verification results

- Lesson validation command:

```bash
npm.cmd run validate:lessons
```

Result: passed.

```text
P-English lesson validation passed for 1 fixture lesson(s).
```

- Web TypeScript check command:

```bash
npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
```

Result: failed with 5 existing errors outside the Task 002 schema/validation files:

- `apps/web/src/lib/animations/gsap-utils.ts`: `TweenTarget` is not exported by `gsap`.
- `apps/web/src/lib/p-english/learning-path-data.ts`: `"Viết"` is not assignable to `LearningSkillType`.
- `apps/web/src/pages/EnglishSpeedPage.tsx`: `useState(60)` inferred a literal `60`, causing timer state updates with `45 | 60 | 75` to fail.

No TypeScript errors were reported in the new Task 002 files under `apps/web/src/data/lessons/` or `scripts/lesson-import/`.

- Project build command:

```bash
npm.cmd run build
```

Result: passed. The API TypeScript build and web Vite production build completed successfully. Vite reported the existing large chunk warning for the generated web bundle.

## Future casualenglish and cefr-j import usage

- `casualenglish` should be treated as an MIT `importCandidate`; copied/extracted material should first go into `extracted-lessons/`, then be normalized into this schema before UI integration.
- `cefr-j` should primarily provide CEFR metadata/reference mapping. Future scripts should record it through `sourceMeta` and `cefrLevel`, avoiding unsupported copying of protected lesson prose.
- Any source with unclear or restrictive licensing should be marked `referenceOnly` in `sourceMeta.status` and should not be copied into final lesson content.
- Future generated final lessons should validate with this schema before any route or UI wiring work begins.

## Risks

- The new schema is intentionally stricter and separate from the current `EnglishLesson` UI model, so a later adapter may be required.
- Exercise shapes may need small additions when real imported source data is normalized.
- The validation script currently validates only the smoke fixture because Task 002 explicitly forbids importing or generating lesson packs.

## Next recommended task

Create the extraction and normalization script for the first approved source batch, starting with `casualenglish` as the import candidate and using `cefr-j` only for metadata support where license-safe.
