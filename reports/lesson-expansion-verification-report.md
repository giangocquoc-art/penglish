# Lesson Expansion Verification Report

Generated: 2026-05-30

## Scope

This report verifies the content expansion targets for `PHASE LESSON-UX-AND-SHADOWING-RECOVERY-01` using the latest generated learning data audit and an additional local count of question-like practice items.

This phase is a UX/foundation recovery phase. It did not perform a large content expansion.

> Expansion is pending; current phase only fixes UX/foundation.

## Source of truth

- Audit report: `reports/penglish-learning-data-audit.json`
- Audit command: `npm.cmd run audit:learning-data`
- Additional count command: a local `tsx` snapshot of runtime lessons plus generated grammar/reading exercise sources.

## Current counts

| Area | Current count | Target | Status |
| --- | ---: | ---: | --- |
| Runtime lessons | 44 | 80+ new micro-lessons | Not met |
| Vocabulary items | 260 | 400+ vocabulary items | Not met |
| English Speed prompts | 42 | 120+ prompts | Not met |
| Shadowing catalog items | 14 | 60+ segments/items | Not met |
| Runtime quiz questions only | 100 | 400+ quiz/practice questions | Not met |
| Runtime question-like practice items | 219 | 400+ quiz/practice questions | Not met |
| Runtime + generated grammar + generated reading question-like items | 371 | 400+ quiz/practice questions | Not met |

## Required target answers

### 80+ new micro-lessons were added

No. The current audit reports 44 runtime lessons. This phase did not add 80+ new micro-lessons.

### 400+ vocabulary items were added

No. The current audit reports 260 vocabulary items. This phase did not add 400+ vocabulary items.

### 120+ English Speed prompts were added

No. The current audit reports 42 speech prompts. This phase did not add 120+ English Speed prompts.

### 60+ Shadowing segments were added

No. The current audit reports 14 shadowing catalog items. This phase did not add 60+ Shadowing segments/items.

### 400+ quiz/practice questions were added

No. Runtime quiz questions only count is 100. A broader runtime question-like count across quiz, fill-blank, sentence ordering, listening, reflex, and English Speed prompt arrays is 219. Including generated grammar exercises and generated reading question-like tasks gives 371. None of these reach 400+.

## Validation status from this phase

| Check | Status | Notes |
| --- | --- | --- |
| `npm.cmd run audit:learning-data` | Passed with warnings | 0 errors, 53 warnings |
| `npx.cmd tsc -p apps/web/tsconfig.json --noEmit` | Passed | TypeScript completed with exit code 0 |
| `npm.cmd run validate:lessons` | Passed | Lesson validation completed |
| `npm.cmd run build` | Passed | Vite build completed; non-blocking chunk-size warning |

## Audit warnings summary

The audit completed with no errors but reported 53 warnings:

- `content-depth`: 41
- `vocabulary-duplicates`: 10
- `free-first-policy`: 2

These warnings should be addressed during or before the next large expansion pass.

## Conclusion

Expansion targets are not met. Expansion is pending; current phase only fixes UX/foundation. It is safe to treat the next big expansion as a separate content-production phase rather than claiming completion in this recovery phase.
