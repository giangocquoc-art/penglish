# P-English Reading/Shadowing Learning Path Follow-up Audit

Date: 2026-06-05

## Scope

This pass continued the full-authority P-English content review after the previous grammar/pronunciation audit. The focus was remaining reading, shadowing, and unified learning-path coverage:

- [`generatedReadingLessons.ts`](../apps/web/src/data/reading/generatedReadingLessons.ts)
- [`generatedShadowingCatalog.ts`](../apps/web/src/data/shadowing/generatedShadowingCatalog.ts)
- [`generatedUnifiedLearningPath.ts`](../apps/web/src/data/learning/generatedUnifiedLearningPath.ts)
- [`generatedSpeechPrompts.ts`](../apps/web/src/data/speech/generatedSpeechPrompts.ts)

## Audit Findings

### Reading lessons

The B1/B2 reading lessons are generally aligned with their declared CEFR targets:

- B1 passages use practical everyday contexts: study planning, café work, online learning, teamwork, simple opinions, pronunciation diaries, study groups, and plan changes.
- B2 passages use opinion/analysis contexts: digital habits, environment, career choice, feedback, AI study balance, feedback rubrics, and language exchange.

No direct reading lesson rewrite was required in this pass. The main issue was under-linking: existing useful reading lessons were already authored but not exposed strongly enough in later path units.

### Shadowing catalog

The shadowing catalog already contains richer app-authored B1/B2 scripts than the learning path exposed. Runtime scripts remain safe and app-authored; external repos are retained only as workflow/source metadata and do not provide copied media/transcripts.

Main mismatch found:

- The B1 shadowing path still described itself as a foundation catalog and said more contexts were needed.
- However, existing B1 scripts already cover feedback, ocean learning reflection, comparing options, health routine, and other life/study contexts.
- `sourceModuleReference.ids` omitted `shadow-b1-teamwork-discussion` even though `sourceIds` listed it.

### Unified learning path

The main corrections were made in [`generatedUnifiedLearningPath.ts`](../apps/web/src/data/learning/generatedUnifiedLearningPath.ts):

1. `path-b1-shadow-review`
   - Renamed from a narrow học/việc unit into a broader feedback/life shadowing unit.
   - Added reading bridge lessons:
     - `reading-b1-study-plan`
     - `reading-b1-pronunciation-diary`
     - `reading-b1-study-group-plan`
   - Expanded source IDs with existing B1 shadowing content:
     - `shadow-b1-study-habit`
     - `shadow-b1-part-time-interview`
     - `shadow-b1-teamwork-discussion`
     - `shadow-b1-asking-for-feedback`
     - `shadow-b1-ocean-learning-reflection`
     - `shadow-b1-comparing-two-options`
     - `shadow-b1-health-routine`
   - Updated estimated time, confidence goal, recommended modes, maturity label, maturity note, and source reference IDs.
   - Changed maturity from `foundation` to `expanded`.

2. `path-b2-pronunciation-confidence`
   - Added feedback/problem-solving support so the B2 pronunciation path better matches the corrected nuanced-advice grammar goal.
   - Added `reading-b2-feedback-rubric` as a route-compatible reading bridge.
   - Added existing B2 shadowing scripts:
     - `shadow-b2-balanced-technology-view`
     - `shadow-b2-learning-from-feedback`
     - `shadow-b2-problem-solving-meeting`
   - Updated estimated time, confidence goal, recommended modes, maturity label, maturity note, and source reference note.

## Implementation Summary

Changed file:

- [`generatedUnifiedLearningPath.ts`](../apps/web/src/data/learning/generatedUnifiedLearningPath.ts)

No risky external content was copied. The expansion reused existing app-authored generated reading/shadowing/speech assets and only improved path exposure, sequencing, and metadata.

## Validation

An initial validation command failed because PowerShell argument parsing passed semicolons into the `tsc` command. The command was corrected with an explicit PowerShell script block.

Final validation passed:

- `npx tsc -p apps/web/tsconfig.json --noEmit`
- `npm run build -w '@pshare/web'`
- `node scripts/penglish-learning-path-progress-qa.cjs`

Browser QA result:

- `ok: true`
- tested `mobile 390x844`
- tested `desktop 1366x768`
- no console errors
- no failed requests
- no unexpected progress writes
- screenshots produced:
  - `learning-path-progress-mobile.png`
  - `learning-path-progress-desktop.png`
  - `learning-path-after-progress-reload.png`

Build result:

- Production build completed successfully.
- Existing Vite chunk-size warning remains non-blocking and unrelated to this data/path update.

## Outcome

The reading/shadowing follow-up pass is complete. The unified path now exposes more of the already-authored B1/B2 content, fixes stale B1 maturity metadata, aligns source references with actual listed sources, and strengthens B2 pronunciation practice with feedback/problem-solving support.
