# Task 012 — Final Feature Regression QA and Consolidated Report

## Goal

Run a final QA pass across all current P-English features after the previous feature tasks.

## Safety rules

- Do not implement new features unless required to fix a small regression.
- Do not edit external-sources.
- Do not deploy.
- Do not run npm audit fix --force.
- Keep context small.

## Required MCP/tool usage

- Use Serena only if code inspection is needed.
- Use filesystem-penglish for report creation.
- Use chrome-devtools and/or playwright for route QA and screenshots.
- Use Vercel MCP read-only only if deployment constraints are relevant.
- Use Supabase MCP read-only only if progress/auth behavior needs checking.

## QA routes/features

Check as available:
- homepage/dashboard
- learning path
- lesson detail
- practice flow
- flashcards/vocabulary
- English Speed
- Shadowing if present
- whale/ocean visuals
- auth/progress fallback
- mobile viewport

## Validation

Run:
- npm.cmd run validate:lessons
- npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
- npm.cmd run build

## Screenshots

Capture final screenshots under:
C:\Users\nltn0\OneDrive\Máy tính\P-English\P-English\Luyen-Tu\reports\screenshots

## Report

Create:
reports/feature-development/012-final-feature-regression-report.md

Include:
- all routes/features checked
- screenshots
- console/network errors
- validation results
- known remaining issues
- recommended next development batch
- deploy readiness assessment

## Stop condition

Stop after final QA/report.
Do not deploy.
