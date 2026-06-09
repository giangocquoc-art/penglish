# P-English Grammar + Pronunciation Follow-up Audit Report

Date: 2026-06-05

## Scope

This follow-up pass continued the delegated lesson-development mandate: audit lesson alignment, fix mismatched content, and expand learning paths using safe app-authored web-ready content inspired only by existing local source workflows.

Focus areas:

- Generated grammar lesson CEFR alignment.
- B1/B2 grammar route coverage in the unified learning path.
- Listening/pronunciation path depth through browser-native English Speed prompts.
- Validation through TypeScript, production build, and targeted browser QA.

## Changes Implemented

### 1. B2 conditional advice lesson realigned

File: `apps/web/src/data/grammar/generatedGrammarLessons.ts`

The lesson `grammar-b2-conditionals-realistic-advice` was labeled B2, but its original rule target was simple first conditional advice using `if + present` with `will/can/should`. That pattern is useful, but too basic for a B2 grammar goal when presented without nuance.

The lesson was rewritten as a true B2 nuanced-advice lesson:

- Title updated to emphasize nuanced conditional advice.
- Explanation now teaches hypothetical and softened advice patterns.
- Examples now use:
  - `If I were you, I would...`
  - `If the feedback felt..., you could...`
  - `It might be better to...`
- Exercises now check B2-specific skills:
  - Choosing the most natural polite advice.
  - Filling a hedging modal (`could`).
  - Ordering a softened advice phrase (`It might be better to...`).
- Source pattern metadata now documents that the lesson was upgraded from realistic first conditional to B2 hedged/hypothetical advice.

Result: the lesson goal, CEFR label, examples, and rule practice now match.

### 2. B1/B2 speech prompt content expanded

File: `apps/web/src/data/speech/generatedSpeechPrompts.ts`

The speech expansion seed model was extended with a new `thinking` topic and app-authored B1/B2 prompts.

New B1 prompts improve practical speaking around:

- Summarizing a main point.
- Clarifying a deadline.
- Explaining reason/detail contrast.
- Sharing project tasks.

New B2 prompts align with more complex pronunciation and grammar goals:

- Hypothetical responsibility and priorities.
- Softened advice with `It might be better to...`.
- Sustainable solution language.
- Ambitious proposal evaluation.

Safety note: the runtime prompt text remains original P-English content. Existing external source references stay as metadata/workflow references only; no external audio, API implementation, server code, example files, or datasets were copied into runtime data.

### 3. Unified learning path updated

File: `apps/web/src/data/learning/generatedUnifiedLearningPath.ts`

The B1 grammar-speaking unit was expanded:

- Added `grammar-b1-present-perfect-experience` to `lessonIds`.
- Added B1 speech prompt references for summarizing and clarifying deadlines.
- Updated subtitle, maturity label, and maturity note to reflect present perfect and oral practice coverage.

The B2 pronunciation-confidence unit was expanded:

- Added `grammar-b2-conditionals-realistic-advice` as a connected lesson.
- Added B2 generated speech prompt IDs for hypothetical advice, hedging, sustainable solutions, and proposal evaluation.
- Updated subtitle, confidence goal, maturity label, maturity note, and source module reference.

Result: the path now better connects grammar learning to speaking confidence and pronunciation practice, especially for B1/B2 learners.

## Validation Results

All validation checks passed.

### TypeScript

Command:

```bash
npx tsc -p apps/web/tsconfig.json --noEmit
```

Result: passed with exit code `0`.

### Production build

Command:

```bash
npm run build -w @pshare/web
```

Result: passed with exit code `0`.

Note: Vite reported an existing non-blocking chunk-size warning for large built assets. This pass was data/path-focused and did not introduce a blocking build issue.

### Targeted browser QA

Command:

```bash
node scripts/penglish-learning-path-progress-qa.cjs
```

Result: passed with exit code `0`.

QA output confirmed:

- `ok: true`
- No console errors.
- No failed requests.
- No unexpected progress writes.
- No browser QA errors.

Captured QA screenshots:

- `learning-path-progress-mobile.png`
- `learning-path-progress-desktop.png`
- `learning-path-after-progress-reload.png`

## Outcome

This follow-up pass corrected a concrete B2 grammar mismatch, deepened pronunciation/speech practice for B1 and B2, and improved unified path continuity from grammar rules to spoken output. The updated app data is TypeScript-valid, production-buildable, and passes targeted learning-path browser QA.
