# Task 002 — P-English Lesson Schema and Validation Foundation

Read first:
- reports/open-source-lesson-import/source-review.md
- .clinerules/penglish-lesson-import-superpowers.md
- memory-bank/activeContext.md
- memory-bank/systemPatterns.md
- memory-bank/techContext.md

## Goal

Create the strict P-English lesson schema and validation foundation.

This task must not import lessons yet.

## Safety rules

- Do not edit files under external-sources.
- Do not import lesson content.
- Do not create generated lesson packs.
- Do not modify lesson UI/routes.
- Do not deploy.
- Do not run npm audit fix --force.
- Do not expose secrets.
- Keep context small.

## Required tool usage

- Use Serena for semantic TypeScript/React navigation.
- Use filesystem-penglish for reading/writing local files.
- Use context7 only if Zod/TypeScript docs are needed.
- Do not use repomix unless absolutely necessary.

## Tasks

1. Inspect existing P-English lesson model:
   - apps/web/src/lib/p-english/lesson-content-data.ts
   - apps/web/src/lib/p-english/learning-path-data.ts
   - related exercise/practice files

2. Create schema folder if needed:
   - apps/web/src/data/lessons/

3. Create:
   - apps/web/src/data/lessons/lessonSchema.ts

The schema should support:
- id
- moduleId
- sourceMeta
- cefrLevel: A1, A2, B1, B2
- titleVi
- titleEn
- goalVi
- explanationVi
- vocabulary
- grammarPoint
- examples
- exercises
- keyboardHint
- completionReward
- nextLessonId
- needsReview
- importNotes

Exercise types should support future:
- multiple-choice
- fill-blank
- typing
- matching
- sentence-reorder
- flashcard-review
- shadowing-prompt

4. Use Zod for runtime validation.

5. Export TypeScript types inferred from the Zod schemas.

6. Create validation helper:
   - apps/web/src/data/lessons/validateLessons.ts

7. Add a tiny local schema fixture only if needed:
   - apps/web/src/data/lessons/fixtures/schemaSmokeFixture.ts

Do not connect this fixture to UI.

8. Add or document a validation command.
Prefer a lightweight tsx script if appropriate:
   - scripts/lesson-import/validate-lessons.ts

9. Create report:
   - reports/open-source-lesson-import/schema-validation-report.md

The report must include:
- files created/changed
- existing lesson model observations
- new schema summary
- validation approach
- how future casualenglish + cefr-j import should use this schema
- risks
- next recommended task

## Stop condition

Stop after schema and validation foundation.
Do not import lessons.
Do not modify UI.
Do not generate lesson packs.
