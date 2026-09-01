# System Patterns

Recommended architecture:

- Source repos remain in `external-sources/`.
- Raw copied lesson material goes to `extracted-lessons/`.
- Final generated lessons go to `apps/web/src/data/lessons/generated/`.
- Lesson schema should live near `apps/web/src/data/lessons/lessonSchema.ts`.
- Import scripts should live in `scripts/lesson-import/`.
- Reports should live in `reports/open-source-lesson-import/`.

All generated lessons should pass schema validation before UI integration.
