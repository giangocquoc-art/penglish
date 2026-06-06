# Task 011 — Mobile UI Cleanup and Accessibility Pass

## Goal

Make the current P-English web UI easier to use on mobile and more accessible, without changing core feature logic.

## Safety rules

- Do not edit external-sources.
- Do not import lessons.
- Do not redesign every feature from scratch.
- Do not deploy.
- Keep context small.

## Required MCP/tool usage

- Use Serena for semantic navigation of layout/topbar/navigation/shared components.
- Use filesystem-penglish for edits.
- Use chrome-devtools/playwright for mobile viewport QA and screenshots.
- Use shadcn MCP only if current UI uses shadcn.
- Use figma-token MCP only if existing design tokens are relevant.
- Use context7 only if accessibility/React docs are needed.

## Inspect

Find:
- app shell/layout
- topbar/navigation
- homepage cards
- learning path
- lesson/practice mobile layout
- buttons/inputs/focus states
- repeated CTAs/widgets

## Implement

1. Reduce clutter:
   - remove or merge duplicate actions
   - prioritize main learning CTA
   - keep English Speed visible but not overwhelming

2. Improve mobile layout:
   - better spacing
   - avoid horizontal overflow
   - readable text
   - bottom-safe actions if useful

3. Accessibility:
   - visible focus states
   - button labels
   - input labels
   - keyboard navigation
   - reduced-motion support where relevant

4. Keep Vietnamese-first UI.

## QA

Use Chrome DevTools or Playwright:
- desktop viewport
- mobile viewport
- homepage
- learning path
- lesson page
- practice page
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
reports/feature-development/011-mobile-accessibility-report.md

Include:
- files changed
- UI cleanup summary
- mobile screenshots
- accessibility improvements
- validation result
- risks

## Stop condition

Stop after mobile/accessibility pass only.
