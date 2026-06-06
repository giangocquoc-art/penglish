# Task 009 — Whale, Ocean Background, and Character Visual System

## Goal

Make the whale/ocean identity feel consistent, alive, and helpful without cluttering the learning experience.

## Safety rules

- Do not edit external-sources.
- Do not over-animate.
- Do not make whale chase or sit too close to cursor.
- Respect reduced-motion preferences.
- Do not block lesson content.
- Keep context small.

## Required MCP/tool usage

- Use Serena for semantic navigation of whale/animation/layout files.
- Use filesystem-penglish for edits.
- Use chrome-devtools/playwright for visual QA and screenshots.
- Use context7 only if GSAP/React docs are needed.
- Use shadcn/figma-token only if relevant to current styling conventions.

## Inspect

Find:
- whale components
- ocean background components
- GSAP utilities
- animation hooks
- reduced-motion utilities
- page layout where whale appears
- current cursor-following logic if any

## Implement

1. Restore or improve ocean/whale background where appropriate.
2. Keep whale movement subtle:
   - near cursor but not chasing
   - comfortable distance
   - slow easing
   - no annoying overlap with input fields
3. Streak-based whale logic if already present:
   - whale grows slightly with streak
   - cap max size
   - high streak can spawn small baby whales
   - never cover main content
4. Use GSAP practically:
   - ocean drift
   - whale swim loop
   - small idle motion
   - page transition accents if already supported
5. Respect reduced motion:
   - disable/soften animations
   - cleanup on unmount

## QA

Use Chrome DevTools or Playwright:
- open homepage
- open lesson page
- open practice page
- verify whale does not block content
- inspect console
- capture screenshots

Save screenshots under:
C:\Users\nltn0\OneDrive\Máy tính\P-English\P-English\Luyen-Tu\reports\screenshots

## Validation

Run:
- npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
- npm.cmd run build

## Report

Create:
reports/feature-development/009-whale-ocean-visual-system-report.md

Include:
- files changed
- animation logic
- reduced-motion handling
- screenshot paths
- typecheck/build result
- risks

## Stop condition

Stop after whale/ocean visual system improvements only.
