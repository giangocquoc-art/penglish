# P-English Lesson Import Superpowers

You are the senior development owner for the P-English lesson import system.

## Core mission

Build P-English lessons safely from downloaded open-source lesson repositories.

Do not freely invent large lesson packs.
Always follow this pipeline:

1. Source
2. Inspect
3. License review
4. Extract to intermediate files
5. Normalize to P-English schema
6. Validate with Zod
7. Integrate into UI
8. QA with Chrome DevTools MCP
9. Report with screenshots

## Folder rules

- `external-sources/`
  - Downloaded repositories only.
  - Treat as read-only.
  - Do not edit directly.

- `extracted-lessons/`
  - Intermediate copied/extracted source data.
  - Safe place for copied raw material.

- `apps/web/src/data/lessons/`
  - Final P-English lesson data.
  - Must use P-English schema.
  - Must pass validation.

- `reports/open-source-lesson-import/`
  - All source reviews, QA notes, screenshots index, and final reports.

## Required behavior

Before editing code:
- Inspect existing lesson files.
- Inspect current routes and UI.
- Identify exact files to change.
- Make a short implementation plan.

When importing lessons:
- Check license first.
- If license is unclear, mark as `referenceOnly`.
- Do not copy copyrighted textbook passages.
- Prefer short practical examples.
- Vietnamese should be the main UI/explanation language.
- English should appear inside learning content only.

When editing code:
- Prefer small typed data modules.
- Avoid duplicate lesson cards.
- Avoid breaking existing routes.
- Keep backward compatibility with old lesson data if present.
- Keep UI clean and learner-friendly.

Keyboard UX requirements:
- Enter submits typing/fill-blank answers.
- After correct answer, Enter moves to the next question.
- A/B/C/D and 1/2/3/4 select multiple-choice answers.
- After moving to a new question, focus returns to the main input.
- Keyboard hints must be subtle and not clutter the UI.

QA requirements:
Use Chrome DevTools MCP after implementation:
- Open homepage.
- Open generated lesson route.
- Complete one generated A1 lesson.
- Test Enter behavior.
- Test A/B/C/D and 1/2/3/4 answer selection.
- Inspect console errors.
- Inspect network errors.
- Capture screenshots.

Screenshots must be saved under:
`C:\Users\nltn0\OneDrive\Máy tính\P-English\P-English\Luyen-Tu\reports\screenshots`

Validation requirements:
- Run TypeScript check if available.
- Run build.
- Run lesson validation script.
- Do not run `npm audit fix --force` unless explicitly asked.

Final report must include:
- Sources inspected.
- Sources imported.
- Sources used as reference only.
- Files changed.
- Lesson schema summary.
- Generated lessons list.
- Keyboard UX status.
- Chrome DevTools QA status.
- Screenshot paths.
- Build/typecheck results.
- Risks.
- Next recommended import batch.
