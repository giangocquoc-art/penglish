# P-English web development implementation summary

## 1. Scope completed

This development pass continued the 5-phase P-English web plan by implementing the highest-impact production and content-stability items first.

Completed items:

1. Permanent runtime lesson validation script.
2. Release workflow script for P-English audit, validation, and production build.
3. Sentence-order browser-QA instrumentation and script.
4. Deep listening/speaking bridge for generated grammar lessons, including the weakest A2 grammar unit.
5. Next lesson-content development plan.
6. Audit, runtime validation, and production build verification.

## 2. Implemented changes

### 2.1 Production stabilization

Added official runtime validation:

- Script: `scripts/validate-penglish-runtime-lessons.ts`
- Reports generated:
  - `reports/penglish-runtime-lesson-validation.json`
  - `reports/penglish-runtime-lesson-validation.md`

Root scripts added:

- `validate:penglish-runtime-lessons`
- `qa:penglish-practice`
- `release:penglish`

The validator checks:

- all runtime lessons,
- validation error/warning/info summary,
- sentence-order token identity,
- generated grammar bridge coverage,
- release readiness.

### 2.2 Sentence-order/practice QA

Updated `apps/web/src/components/practice/LessonQuizPractice.tsx` so sentence-order selected and bank tokens expose stable browser-QA metadata:

- `data-qa-token-id`
- `data-qa-token-word`
- `data-qa-token-original-index`

Added browser QA script:

- `scripts/penglish-practice-browser-qa.cjs`

The script validates that sentence-order practice preserves token identity through the UI, including duplicate visible words where word-string identity would be unsafe.

### 2.3 Deep lesson-data bridge for A2 grammar weakness

Updated generated grammar lesson adaptation in `apps/web/src/lib/p-english/grammarLessonAdapter.ts`.

Generated grammar lessons now include:

- mini dialogue,
- pronunciation note,
- listening practice,
- speaking reflex prompts,
- listening/speaking completion criteria,
- listening/speaking skill tags.

Validation confirms coverage:

- Generated grammar lessons with listening: 24/24
- Generated grammar lessons with speaking: 24/24
- A2 grammar lessons with listening: 8/8
- A2 grammar lessons with speaking: 8/8

### 2.4 Next content development plan

Created:

- `reports/penglish-next-lesson-content-development-plan.md`

Main recommended next content phase:

- Hand-polish A2 grammar patterns first, especially:
  - past simple regular verbs,
  - comparatives,
  - be going to plans,
  - present perfect basics,
  - first conditional.

## 3. Verification results

Command run successfully:

```powershell
npm run audit:learning-data; npm run validate:penglish-runtime-lessons; npm run build -w @pshare/web
```

Results:

- Learning-data audit: 0 errors, 0 warnings, 0 quality issues.
- Runtime lesson validation:
  - lessons: 81,
  - errors: 0,
  - warnings: 0,
  - info: 11,
  - sentence-order identity checks: 121,
  - sentence-order identity failures: 0,
  - releaseReady: true.
- Production web build: passed.

## 4. Notes

The first validation command attempt failed because PowerShell command chaining was passed in a way that npm interpreted `audit:learning-data;` as a workspace script name. The corrected command used an explicit PowerShell wrapper and completed successfully.

## 5. Recommended next engineering steps

1. Run `npm run qa:penglish-practice` while a local preview/dev server is running.
2. Start Phase 3 multi-source roadmap schema only after validating the newly bridged grammar lessons in browser QA.
3. Split generated data by route/level after the content bridge is stable, because current production build passes and bundle warnings are already controlled.
4. Begin C1 from the content plan: hand-polish the most important A2 grammar patterns.
