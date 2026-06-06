# P-English Lesson Expansion 01 Report

Generated: 2026-05-30 13:34 ICT

## Scope

Completed **PHASE P-ENGLISH-LESSON-EXPANSION-01 — Deep Content Expansion + Data Quality Fix** without deployment.

The phase expanded app-authored P-English learning content while keeping lessons data-driven in `apps/web/src/data/**` and adapters. No paid/pro gates were added, no API keys were exposed, and no copyrighted transcript/video content was copied.

## Final audit counts

Source: `reports/penglish-learning-data-audit.json`

| Metric | Final count | Target | Status |
| --- | ---: | ---: | --- |
| Runtime lessons | 73 | 70+ | Pass |
| Generated grammar lesson sources | 24 | 24+ | Pass |
| Generated reading lesson sources | 46 | 45+ | Pass |
| Vocabulary items | 452 | 450+ | Pass |
| Speech prompts | 101 | 100+ | Pass |
| Shadowing items | 43 | 40+ | Pass |
| Roadmap units | 12 | Existing | Pass |
| Audit errors | 0 | 0 | Pass |
| Audit warnings | 0 | 0 preferred | Pass |
| Content quality issues | 0 | 0 | Pass |

## Content expansion completed

### Grammar

- Expanded generated grammar source count to 24.
- Added review/depth helpers so generated grammar lessons meet mixed exercise depth expectations.
- Preserved adapter compatibility for runtime lesson routes.

### Reading

- Expanded generated reading source count to 46.
- Added third comprehension-question coverage and additional reading lessons.
- Fixed free-first false-positive wording by replacing Vietnamese `đóng gói` wording with `bao bì` wording in generated reading vocabulary content.

### Vocabulary

- Expanded CEFR vocabulary from 260 to 452 items.
- Added app-authored expansion seeds across A1/A2/B1/B2 themes.
- Fixed duplicate audit warnings by replacing duplicate expansion terms with distinct terms.

### English Speed

- Expanded generated speech prompts from 42 to 101.
- Added app-authored prompt expansion seeds across daily-life, learning, community, ocean, work, health, and presentation contexts.
- Preserved existing browser/API-first English Speed flow.

### Shadowing

- Expanded generated shadowing catalog from 14 to 43 items.
- Added original app-authored scripts across A1/A2/B1/B2.
- Included Poo Ocean/whale-themed speaking practice while avoiding copied external transcripts.

### Roadmap + integrity checks

- Strengthened `scripts/audit-penglish-learning-data.cjs` roadmap validation:
  - checks missing `lessonIds`, sparse `sourceIds`, primary/recommended practice mode consistency, unlock chain validity, route validity, and source module reference integrity.
- Updated `apps/web/src/data/learning/generatedUnifiedLearningPath.ts` source references so roadmap IDs align with declared content modules.

## Validation run

Executed successfully:

```text
npm.cmd run audit:learning-data
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run validate:lessons
npm.cmd run build
```

Results:

- Learning data audit: passed with 0 errors, 0 warnings, 0 quality issues.
- TypeScript: passed.
- Lesson validation: passed for schema smoke fixture.
- Production build: passed.
- Build note: Vite reported the existing large `vendor-ui` chunk warning after minification; build completed successfully.

## Screenshot QA

Updated `scripts/capture-lesson-audit-screenshots.cjs` to capture both desktop and mobile screenshots and check horizontal overflow.

Captured successfully:

- `reports/screenshots/lesson-audit-home-desktop.png`
- `reports/screenshots/lesson-audit-roadmap-desktop.png`
- `reports/screenshots/lesson-audit-vocab-desktop.png`
- `reports/screenshots/lesson-audit-english-speed-desktop.png`
- `reports/screenshots/lesson-audit-shadowing-desktop.png`
- `reports/screenshots/lesson-audit-sample-lesson-desktop.png`
- `reports/screenshots/lesson-audit-home-mobile.png`
- `reports/screenshots/lesson-audit-roadmap-mobile.png`
- `reports/screenshots/lesson-audit-vocab-mobile.png`
- `reports/screenshots/lesson-audit-english-speed-mobile.png`
- `reports/screenshots/lesson-audit-shadowing-mobile.png`
- `reports/screenshots/lesson-audit-sample-lesson-mobile.png`

The screenshot script completed with exit code 0.

## Files changed

- `apps/web/src/data/grammar/generatedGrammarLessons.ts`
- `apps/web/src/data/reading/generatedReadingLessons.ts`
- `apps/web/src/data/vocabulary/generatedCefrVocabulary.ts`
- `apps/web/src/data/speech/generatedSpeechPrompts.ts`
- `apps/web/src/data/shadowing/generatedShadowingCatalog.ts`
- `apps/web/src/data/learning/generatedUnifiedLearningPath.ts`
- `scripts/audit-penglish-learning-data.cjs`
- `scripts/capture-lesson-audit-screenshots.cjs`
- `reports/penglish-learning-data-audit.json`
- `reports/penglish-learning-data-audit.md`
- `reports/screenshots/*.png`

## Deployment

No deployment was performed.
