# P-English Sprint 1 A1/A2 Content Expansion Report

## Scope

Sprint 1 implemented the approved local-first A1/A2 lesson expansion for new learners. The work adds original P-English learner-facing content, avoids external transcript copying, and reuses the existing generated/adapted content architecture.

## Content added

### Reading lessons

Added 4 app-authored reading lessons in [`generatedReadingLessons.ts`](apps/web/src/data/reading/generatedReadingLessons.ts):

- `reading-a1-asking-for-help` — A1 classroom help request.
- `reading-a1-weather-plan` — A1 weather and simple plan.
- `reading-a2-changing-an-appointment` — A2 polite appointment change.
- `reading-a2-at-the-clinic` — A2 clinic visit and short form workflow.

Each lesson includes:

- English passage.
- Vietnamese setup and pattern explanation.
- Comprehension questions.
- Fill-blank task.
- Sentence-ordering task.
- Vocabulary focus items with Vietnamese meanings and examples.

### Shadowing scripts

Added 2 app-authored shadowing scripts in [`generatedShadowingCatalog.ts`](apps/web/src/data/shadowing/generatedShadowingCatalog.ts):

- `shadow-a1-asking-for-help` — short polite help request lines.
- `shadow-a2-changing-an-appointment` — appointment-change phone/message flow.

Each script uses existing transcript/chunk/repeat-plan generation through the catalog adapter.

### Speech prompts

Added 2 browser speech prompts in [`generatedSpeechPrompts.ts`](apps/web/src/data/speech/generatedSpeechPrompts.ts):

- `speech-a1-can-you-help-me` — phrase-level pronunciation practice.
- `speech-a2-i-need-to-change-the-time` — sentence-level appointment-change practice.

## Learning path integration

Updated the existing 13-unit path in [`generatedUnifiedLearningPath.ts`](apps/web/src/data/learning/generatedUnifiedLearningPath.ts) without increasing unit count.

Updated units:

- `path-a1-grammar-reading`
  - Added `reading-a1-asking-for-help` and `reading-a1-weather-plan`.
  - Increased time estimate to `105–125 phút`.
  - Updated maturity note and generated-reading source reference.

- `path-a1-shadow-pronounce`
  - Linked `reading-a1-asking-for-help` as lesson context.
  - Added `shadow-a1-asking-for-help` and `speech-a1-can-you-help-me` as source IDs.
  - Increased time estimate to `30–40 phút`.

- `path-a2-practical-vocabulary`
  - Added `reading-a2-at-the-clinic`.
  - Increased time estimate to `40–55 phút`.
  - Updated maturity note to mention clinic content.

- `path-a2-reading-shadowing`
  - Added `reading-a2-changing-an-appointment`.
  - Added `shadow-a2-changing-an-appointment` and `speech-a2-i-need-to-change-the-time` as source IDs.
  - Increased time estimate to `60–80 phút`.

## QA script fixes made during validation

Updated [`penglish-product-ux-logic-qa.cjs`](scripts/penglish-product-ux-logic-qa.cjs) to keep browser QA aligned with the current learning path and reduce false negatives:

- Updated deterministic 2-unit progress seed to complete unit 1 plus both lessons in the A1 listening unit:
  - `unit-1-greetings-introduction`
  - `a1-listening-meeting-classmate`
  - `a1-listening-ordering-drink`
- Strengthened the shadowing top-scroll reset before header overlap measurement.
- Product UX QA was run against the active dev server with `PENGLISH_PRODUCT_UX_LOGIC_QA_BASE_URL=http://127.0.0.1:5180` because the local server was on port `5180`.

## Validation

Final validation command completed successfully:

```powershell
powershell -NoProfile -Command "& { npx tsc -p apps/web/tsconfig.json --noEmit; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; npm run build -w '@pshare/web'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; node scripts/penglish-learning-path-progress-qa.cjs; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; $env:PENGLISH_PRODUCT_UX_LOGIC_QA_BASE_URL='http://127.0.0.1:5180'; node scripts/penglish-product-ux-logic-qa.cjs; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }"
```

Validation results:

- TypeScript check: passed.
- Web build: passed.
- Learning path progress QA: passed with `ok: true`.
- Product UX logic QA: passed with `ok: true`, `errors: []`.
- Product UX QA report: [`penglish-visual-qa-fix-v4-qa.json`](reports/penglish-visual-qa-fix-v4-qa.json).

## Result

Sprint 1 is complete. P-English now has additional local-first A1/A2 reading, shadowing, and speech content linked into the existing 13-unit learning path, with validation passing after QA script alignment.