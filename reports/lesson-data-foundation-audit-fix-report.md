# Lesson Data Foundation Audit/Fix Report

Date: 2026-05-30
Workspace: `PSVip_RELEASE_KH`
Phase: `PHASE LESSON-DATA-FOUNDATION-AUDIT-FIX`
Deployment: Not deployed

## Executive summary

The P-English lesson data foundation phase is complete. The project now has a real runtime/generated learning-data audit, repaired CEFR vocabulary quality, API-first English Speed pronunciation feedback, Shadowing reference video metadata and UI integration, a verified `/api/shadowing-feedback` server route, light grammar/reading expansion, visible roadmap content maturity labels, successful validation/build results, and the requested QA screenshots.

No lessons were deleted. No large 100+ lesson expansion was performed. No deployment was performed.

## Scope completed

### 1. Runtime/generated learning-data audit

Added a full data audit flow that is separate from the existing schema smoke validation.

- Audit command: `npm.cmd run audit:learning-data`
- Script: `scripts/audit-penglish-learning-data.cjs`
- JSON report: `reports/penglish-learning-data-audit.json`
- Markdown report: `reports/penglish-learning-data-audit.md`
- Package script: `audit:learning-data` in `package.json`

Latest audit snapshot:

```txt
Generated at: 2026-05-30T00:27:06.461Z
Runtime lessons: 44
Generated grammar lesson sources: 12
Generated reading lesson sources: 29
Vocabulary items: 260
Vocabulary groups: 4
Speech prompts: 42
Shadowing items: 14
Roadmap units: 12
Errors: 0
Warnings: 53
Quality issues: 0
Recommendations: 0
```

Remaining warnings are foundation-safe content-depth / duplicate-policy warnings intended for the later content expansion phase:

```txt
content-depth: 41
vocabulary-duplicates: 10
free-first-policy: 2
```

### 2. CEFR vocabulary quality repair

Created and ran a targeted vocabulary quality repair flow for generated CEFR vocabulary.

- Repair script: `scripts/repair-penglish-vocabulary-quality.cjs`
- Repaired data: `apps/web/src/data/vocabulary/generatedCefrVocabulary.ts`
- Vocabulary inventory after repair: `260` items across `4` groups
- Audit quality findings after repair: `0`

The repair avoided deleting generated vocabulary and focused on placeholder/example quality issues.

### 3. Validation flow clarification

The validation model is now explicit:

- `npm.cmd run validate:lessons` remains schema-smoke validation for fixture lesson data.
- `npm.cmd run audit:learning-data` audits the real runtime/generated P-English learning data.

This prevents a false sense of coverage from the schema smoke test alone.

### 4. English Speed audio/API-first cleanup

Updated English Speed to prioritize learner audio recording and server feedback rather than manual text fallback in the normal learner flow.

Key file:

- `apps/web/src/pages/EnglishSpeedPage.tsx`

Implemented behavior:

- Uses browser `MediaRecorder`.
- Sends recorded audio through `/api/shadowing-feedback`.
- Normalizes feedback into English Speed pronunciation, rhythm, matched/missing/extra/changed-word panels.
- Keeps replay/listen support through speech synthesis.
- Displays API/microphone status without reintroducing primary manual text fallback.

### 5. Shadowing video catalog foundation

Added curated reference video metadata to generated Shadowing catalog items and exposed it through the adapter/UI.

Key files:

- `apps/web/src/data/shadowing/shadowingTypes.ts`
- `apps/web/src/data/shadowing/generatedShadowingCatalog.ts`
- `apps/web/src/lib/p-english/shadowing-data.ts`
- `apps/web/src/lib/p-english/shadowingAdapter.ts`
- `apps/web/src/pages/ShadowingPage.tsx`

Implemented behavior:

- Generated Shadowing items can include `referenceVideoTitle` and `referenceVideoUrl`.
- Shadowing adapter exposes reference metadata to UI-facing `ShadowingVideo` data.
- Shadowing page renders YouTube reference video embeds when available.
- Shadowing practice remains audio/API-first with transcript, sentence picker, recording panel, and feedback panel.

### 6. `/api/shadowing-feedback` route verification/repair

Verified and repaired the Vercel-style serverless audio feedback route.

Key file:

- `api/shadowing-feedback.ts`

Fixes included:

- Removed unused `transcriptSet` variable from normalized word scoring.
- Strengthened Gemini prompt for Shadowing and English Speed audio/API-first feedback.
- Made JSON/base64 requests derive `audioBytes` from `audioBase64` when explicit byte count is absent.
- Preserved normalized comparison rules for numeric words and ordinals.
- Preserved friendly Vietnamese coaching response shape.

API route TypeScript check passed:

```cmd
npx.cmd tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --types node api/shadowing-feedback.ts
```

### 7. Light grammar and reading expansion

Added a small number of foundation micro-lessons only. This was intentionally not a large content expansion.

Grammar additions in `apps/web/src/data/grammar/generatedGrammarLessons.ts`:

- `grammar-a1-be-present-simple`
- `grammar-b1-present-perfect-experience`
- `grammar-b2-conditionals-realistic-advice`

Reading additions in `apps/web/src/data/reading/generatedReadingLessons.ts`:

- `reading-a2-weekend-market`
- `reading-b1-study-group-plan`
- `reading-b2-ai-study-balance`

### 8. Roadmap content maturity labels

Added maturity metadata to generated roadmap units and rendered it on the roadmap page.

Key files:

- `apps/web/src/data/learning/generatedUnifiedLearningPath.ts`
- `apps/web/src/lib/p-english/learning-path-data.ts`
- `apps/web/src/pages/LearningPathPage.tsx`

Supported maturity values:

- `foundation`
- `expanded`
- `mature`

The roadmap UI now shows Vietnamese maturity labels and notes, helping distinguish mature handcrafted foundation units from expanded grammar/reading runtime units and foundation-only areas.

### 9. Screenshot QA

Created and ran a Playwright capture script for this phase.

Script:

- `scripts/capture-lesson-audit-screenshots.cjs`

Command executed:

```cmd
node scripts\capture-lesson-audit-screenshots.cjs
```

Result:

```txt
Captured lesson-audit-home.png from /home
Captured lesson-audit-roadmap.png from /learning-path
Captured lesson-audit-vocab.png from /words
Captured lesson-audit-english-speed.png from /english-speed
Captured lesson-audit-shadowing.png from /shadowing
Captured lesson-audit-sample-lesson.png from /lessons/unit-1-greetings-introduction
```

Screenshots created:

- `reports/screenshots/lesson-audit-home.png`
- `reports/screenshots/lesson-audit-roadmap.png`
- `reports/screenshots/lesson-audit-vocab.png`
- `reports/screenshots/lesson-audit-english-speed.png`
- `reports/screenshots/lesson-audit-shadowing.png`
- `reports/screenshots/lesson-audit-sample-lesson.png`

## Validation results

The requested validation sequence was completed.

### Learning-data audit

```cmd
npm.cmd run audit:learning-data
```

Result:

```txt
Errors: 0
Warnings: 53
Quality issues: 0
```

### Web TypeScript

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Result: passed.

### Lesson schema smoke validation

```cmd
npm.cmd run validate:lessons
```

Result: passed.

### Full build

```cmd
npm.cmd run build
```

Result: passed.

Build note:

```txt
Some chunks are larger than 500 kB after minification.
```

This is a Vite chunk-size warning only and was not treated as a foundation-data failure.

## Known remaining warnings / follow-up for later phase

The latest audit intentionally still reports warnings that belong to content expansion or policy refinement, not blocking foundation readiness:

1. Some generated grammar lessons still have only 3 exercises.
2. Some generated reading lessons still have a compact number of comprehension questions or vocabulary items.
3. Some duplicate vocabulary terms remain across CEFR/core generated data.
4. A small number of free-first-policy warnings remain for later product/content gating review.

These are appropriate backlog items for the later content expansion phase.

## Final status

Completed:

- Full runtime/generated learning-data audit.
- Vocabulary quality repair.
- Validation flow clarification.
- English Speed audio/API-first cleanup.
- Shadowing reference video foundation and UI integration.
- `/api/shadowing-feedback` route verification/repair.
- Light grammar and reading expansion.
- Roadmap maturity labels.
- Audit, TypeScript, schema validation, and build.
- Requested QA screenshots.

Not performed:

- No deployment.
- No deletion of existing lessons.
- No 100+ lesson expansion.
- No switch to the large content expansion phase.

The lesson-data foundation audit/fix phase is ready to stop here without deployment.
