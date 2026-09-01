# Task 007 — English Speed Feature Polish

## Goal

Improve the English Speed feature so it is easier to find, easier to understand, and more useful for learners.

## Safety rules

- Do not edit external-sources.
- Do not modify unrelated lesson import pipeline.
- Do not redesign the entire app.
- Do not run npm audit fix --force.
- Keep context small.

## Required MCP/tool usage

- Use Serena for semantic navigation of EnglishSpeedPage and related components.
- Use filesystem-penglish for edits.
- Use chrome-devtools/playwright for QA and screenshots.
- Use context7 only if React timer/state docs are needed.

## Inspect

Find:
- EnglishSpeedPage.tsx
- related timer/state components
- homepage entry point to English Speed
- progress/reward link if any
- current TypeScript issue around timer state if still present

## Implement

1. Make English Speed easier to access from homepage/dashboard if not already clear.
2. Fix timer state TypeScript issue if still present.
3. Improve Vietnamese instructions.
4. Improve feedback after a round:
   - speed score
   - accuracy/confidence
   - what to practice next
5. Keep UI clean and not too game-like.
6. Keep keyboard interactions convenient where applicable.

## QA

Use Chrome DevTools or Playwright:
- open English Speed route
- start a session
- complete or simulate a short round
- inspect console/network
- capture screenshots

Save screenshots under:
C:\Users\nltn0\OneDrive\Máy tính\P-English\P-English\Luyen-Tu\reports\screenshots

## Validation

Run:
- npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
- npm.cmd run build

## Report

Create:
reports/feature-development/007-english-speed-report.md

Include:
- files changed
- TypeScript fixes
- UX changes
- screenshots
- QA result
- build/typecheck result
- next steps

## Stop condition

Stop after English Speed improvements only.
