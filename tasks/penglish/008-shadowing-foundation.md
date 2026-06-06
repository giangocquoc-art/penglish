# Task 008 — Shadowing Practice Foundation

## Goal

Improve or create the foundation for the Shadowing feature as part of P-English, while staying compatible with current app structure.

## Safety rules

- Do not use paid APIs.
- Do not require OpenAI/Replicate keys.
- Do not edit external-sources.
- Do not copy copyrighted video content.
- Do not deploy.
- Keep context small.

## Required MCP/tool usage

- Use Serena to locate any existing shadowing/video/pronunciation code.
- Use filesystem-penglish for edits.
- Use chrome-devtools/playwright for QA and screenshots.
- Use context7 if browser media APIs or React docs are needed.
- Use Vercel MCP read-only only if deployment constraints for media/static files are relevant.

## Inspect

Find:
- any existing shadowing route/page/component
- video/audio practice components
- lesson data fields that mention speaking/shadowing
- upload handling if any
- public assets/media folders

## Implement

If Shadowing already exists:
- polish the current flow
- improve Vietnamese instructions
- improve transcript display
- add simple loop/replay controls if feasible
- add clear privacy note for user-uploaded video if upload exists

If Shadowing does not exist:
- create a lightweight route/component placeholder only if compatible with routing
- include:
  - built-in practice video placeholder/card
  - user-provided video URL/upload placeholder
  - transcript area
  - repeat-after-me steps
  - no paid API dependency

Do not overbuild scoring in this task.

## QA

Use Chrome DevTools or Playwright:
- open shadowing route if available
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
reports/feature-development/008-shadowing-foundation-report.md

Include:
- existing state
- files changed
- UX changes
- media/privacy considerations
- screenshots
- validation result
- next steps

## Stop condition

Stop after Shadowing foundation/polish only.
