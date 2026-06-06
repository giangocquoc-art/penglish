# Task 006 — Flashcards and Vocabulary Visual Scenes

## Goal

Upgrade flashcards and vocabulary cards so they feel meaningful and learning-focused, not decorative.

## Safety rules

- Do not edit external-sources.
- Do not import new external content.
- Do not modify unrelated routes.
- Do not over-animate.
- Respect reduced-motion preferences.
- Keep context small.

## Required MCP/tool usage

- Use Serena for semantic navigation of flashcard/vocabulary components.
- Use filesystem-penglish for edits.
- Use chrome-devtools/playwright for QA and screenshots.
- Use shadcn MCP only if current UI uses shadcn and component conventions are needed.
- Use figma-token MCP only if design tokens are already available and relevant.
- Use context7 only if animation/React docs are needed.

## Inspect

Find:
- flashcard components
- vocabulary card components
- lesson vocabulary sections
- current whale/character visuals around vocabulary
- animation utilities, especially GSAP-related files
- reduced-motion handling

## Implement

1. Replace meaningless decorative icons with small visual scenes:
   - word context
   - simple situation
   - action or object relationship
   - learner-friendly illustration area

2. Keep visuals subtle:
   - do not block content
   - do not create heavy layout shifts
   - do not make every card noisy

3. Use GSAP where practical:
   - subtle card reveal
   - hover/focus feedback
   - small scene motion
   - cleanup animations on unmount
   - respect reduced motion

4. Improve flashcard learning:
   - show Vietnamese meaning clearly
   - show short English example
   - allow easy next/review action
   - keep keyboard accessibility if possible

## QA

Use Chrome DevTools or Playwright:
- open flashcard/vocabulary area
- inspect console errors
- check mobile-ish viewport if possible
- capture screenshots

Save screenshots under:
C:\Users\nltn0\OneDrive\Máy tính\P-English\P-English\Luyen-Tu\reports\screenshots

## Validation

Run:
- npm.cmd exec -- tsc -p apps/web/tsconfig.json --noEmit
- npm.cmd run build

## Report

Create:
reports/feature-development/006-flashcards-vocabulary-scenes-report.md

Include:
- files changed
- visual scene approach
- animation approach
- accessibility/reduced-motion handling
- screenshots
- typecheck/build result
- risks

## Stop condition

Stop after flashcards/vocabulary improvements only.
