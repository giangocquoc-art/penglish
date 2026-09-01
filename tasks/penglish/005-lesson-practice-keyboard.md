# Task 005 — Lesson Flow, Practice Exercises, and Keyboard UX

## Goal

Improve the current lesson and practice flow so learners can complete lessons smoothly with keyboard-friendly interactions.

## Read first

- .clinerules/penglish-lesson-import-superpowers.md
- memory-bank/activeContext.md
- memory-bank/systemPatterns.md
- memory-bank/techContext.md
- reports/feature-development/004-learning-path-progress-report.md if it exists

## Safety rules

- Do not edit external-sources.
- Do not import generated lesson packs in this task.
- Do not redesign the whole app.
- Do not run npm audit fix --force.
- Keep context small.

## Required MCP/tool usage

- Use Serena for semantic navigation of lesson, practice, exercise, and keyboard files.
- Use filesystem-penglish for edits.
- Use chrome-devtools/playwright for interaction QA and screenshots.
- Use context7 only if React keyboard/event docs are needed.

## Inspect

Find:
- /lessons/:lessonId route/page
- /practice route/page
- guided lesson flow component
- exercise components
- answer checking logic
- current keyboard handling
- focus management
- lesson completion logic

## Implement

1. Keyboard UX:
   - Enter submits typing/fill-blank answers.
   - After correct answer, Enter moves to next question.
   - A/B/C/D and 1/2/3/4 select multiple-choice answers.
   - Focus returns to the main input after moving to a new question.
   - Add subtle keyboard hints without cluttering UI.

2. Exercise clarity:
   - make prompts clearer in Vietnamese
   - show concise feedback
   - avoid duplicate buttons or confusing states

3. Completion flow:
   - show lesson completed state
   - show next suggested action
   - link back to progress/dashboard

4. Mobile:
   - ensure keyboard hints do not clutter small screens

## QA

Use Chrome DevTools or Playwright:
- open one lesson
- answer typing question with Enter
- answer multiple-choice with A/B/C/D and 1/2/3/4
- complete one practice flow if possible
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
reports/feature-development/005-lesson-practice-keyboard-report.md

Include:
- files changed
- keyboard behaviors implemented
- exercise UX changes
- screenshots
- QA result
- typecheck/build result
- remaining risks

## Stop condition

Stop after lesson/practice/keyboard improvements only.
Do not start flashcards, English Speed, or whale visuals.
