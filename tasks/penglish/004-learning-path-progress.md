# Task 004 — Learning Path, Progress Dashboard, and Level Confidence

## Goal

Improve the current learning path and progress/dashboard experience so learners can clearly understand:
- what they should learn next
- what they have completed
- their current estimated level
- their confidence/progress after finishing lessons

## Read first

- .clinerules/penglish-lesson-import-superpowers.md
- memory-bank/activeContext.md
- memory-bank/systemPatterns.md
- memory-bank/techContext.md
- reports/open-source-lesson-import/source-review.md
- reports/open-source-lesson-import/schema-validation-report.md

## Safety rules

- Do not edit external-sources.
- Do not import new lessons in this task.
- Do not modify Supabase schema.
- Do not deploy.
- Do not run npm audit fix --force.
- Keep context small.
- Use Node.js/TypeScript/PowerShell only.

## Required MCP/tool usage

- Use Serena for semantic navigation of learning path, progress, dashboard, and route files.
- Use filesystem-penglish for file edits.
- Use chrome-devtools or playwright for browser QA and screenshots.
- Use context7 only if React/TypeScript docs are needed.
- Use Supabase MCP only as read-only if current progress persistence depends on Supabase.
- Use Vercel MCP only as read-only if build/deploy constraints are relevant.

## Inspect

Find:
- learning path route/page
- home/progress dashboard files
- local progress state
- any Supabase progress sync code
- lesson completion flow
- current level/XP/streak display
- duplicate widgets or confusing CTAs

## Implement

Improve the existing UI/logic without creating duplicate features:

1. Add or improve a clear CEFR progress scale:
   - A1
   - A2
   - B1
   - B2

2. Show:
   - current estimated level
   - completed lessons count
   - next recommended lesson
   - XP/streak/progress summary if available

3. After lesson completion, ensure users can return to progress/dashboard and feel progress:
   - short Vietnamese encouragement
   - current progress
   - next step

4. Keep Vietnamese as the main UI language.

5. Keep UI clean:
   - no duplicated progress cards
   - no clutter
   - no huge whale/character blocking content

## QA

Use Chrome DevTools or Playwright:
- open homepage/progress area
- open learning path
- check console errors
- check network errors
- capture screenshots

Save screenshots under:
C:\Users\nltn0\OneDrive\Máy tính\P-English\P-English\Luyen-Tu\reports\screenshots

## Validation

Run:
- npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
- npm.cmd run build

If TypeScript errors are pre-existing, document them and separate them from this task.

## Report

Create:
reports/feature-development/004-learning-path-progress-report.md

Include:
- files changed
- UX changes
- progress/level logic summary
- screenshots
- console/network QA
- typecheck/build result
- remaining risks
- next recommended task

## Stop condition

Stop after improving learning path/progress only.
Do not start other features.
