# Task 010 — Auth, Local Progress, and Supabase Progress Sync Review

## Goal

Make the login/progress behavior understandable and reliable without blocking learners.

## Safety rules

- Do not change Supabase schema unless explicitly asked.
- Do not expose secrets.
- Do not deploy.
- Do not edit external-sources.
- Do not run destructive database actions.
- Keep context small.

## Required MCP/tool usage

- Use Serena for semantic navigation of auth/progress state files.
- Use filesystem-penglish for edits.
- Use Supabase MCP read-only only if relevant and available.
- Use chrome-devtools/playwright for QA and screenshots.
- Use context7 only if Supabase/React docs are needed.

## Inspect

Find:
- auth provider/client files
- login page/state
- guest/local fallback
- progress save/load logic
- lesson completion persistence
- Supabase environment handling
- any current fallback copy

## Implement

1. Ensure learners can use the app without being blocked by Supabase when local mode is allowed.
2. Improve Vietnamese login/fallback copy.
3. Make progress state behavior clear:
   - guest/local progress
   - signed-in progress
   - sync status if any
4. Avoid duplicate login CTAs.
5. Do not change DB schema in this task.

## QA

Use Chrome DevTools or Playwright:
- open app with current env
- inspect login/progress behavior
- check console/network
- capture screenshots

Save screenshots under:
C:\Users\nltn0\OneDrive\Máy tính\P-English\P-English\Luyen-Tu\reports\screenshots

## Validation

Run:
- npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
- npm.cmd run build

## Report

Create:
reports/feature-development/010-auth-progress-sync-report.md

Include:
- current auth/progress behavior
- files changed
- Supabase read-only findings if used
- screenshots
- validation result
- risks

## Stop condition

Stop after auth/progress sync review/polish only.
