# Foundation48 Day 1 guided learning UI report

## Changed files

- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
- `scripts/foundation48-day1-all-steps-qa.cjs`

## Components improved

- `LessonStepperCard`: routes each step type to guided activity components instead of static cards.
- `ListenFirstActivity`: adds a listen-first card with target sentence, large listen CTA, replay, and checklist.
- `MeaningRevealCard`: adds English-first meaning reveal with Vietnamese meaning and short hint.
- `PatternPracticeCards`: turns examples into short guided pattern cards with listen buttons.
- `VocabularyFlashcards`: adds 3-6 flashcard-style vocabulary cards with listen and remembered toggles.
- `SpeakingDrillCards`: keeps the existing interactive speaking drill with per-sentence progress.
- `ChallengeCard`: improves choice quiz, listen-and-choose, fill blank, sentence builder, and speaking-repeat fallback states.
- `CompletePrompt`: adds rewarding Poo celebration, day summary, next-day and review buttons.

## Interactions added

- Listening state: listened/read-along toggles and soft completion styling.
- Meaning reveal state: English first, then Vietnamese meaning and hint.
- Vocabulary remembered state: progress chip and completed cards.
- Speaking drill state: sentence completion count and completed cards.
- Sentence building state: tap-to-build chips, reset, check, and immediate feedback.
- Quiz state: large answer buttons, progress chip, and immediate feedback.
- Completion state: summary cards and navigation CTAs while preserving the existing main completion save flow.

## Build result

- `npm run build -w @pshare/web`: passed.
- Notes: existing Vite/Rollup warnings remain for `react-wavify` pure annotations and dynamic/static Supabase imports; no build failure.

## QA result

- QA script: `node scripts/foundation48-day1-all-steps-qa.cjs`: passed.
- Covered:
  - `/luyen-tieng-anh/48-ngay-lay-goc/ngay/1` desktop.
  - `/luyen-tieng-anh/48-ngay-lay-goc/ngay/1` mobile.
  - `/luyen-tieng-anh/48-ngay-lay-goc` roadmap.
  - Navigation through all steps with `Tiếp tục`.
  - Challenge unlocking by answering current challenge steps.
  - Vocab remembered toggle.
  - Speaking done toggle.
  - Quiz immediate feedback.
  - Sentence builder interaction.
  - Final completion reward step.
  - Authenticated lesson access with mocked Supabase session.
  - Unauthenticated protected route redirect to `/login`.
  - No console errors.
  - No network 404/500.
  - No horizontal overflow.
  - No detected mojibake markers in checked pages.
  - Bottom spacing safe in captured mobile flow.

## Screenshots saved

- `reports/screenshots/foundation48-day1-listening-desktop.png`
- `reports/screenshots/foundation48-day1-meaning-desktop.png`
- `reports/screenshots/foundation48-day1-vocab-desktop.png`
- `reports/screenshots/foundation48-day1-speaking-desktop.png`
- `reports/screenshots/foundation48-day1-quiz-desktop.png`
- `reports/screenshots/foundation48-day1-complete-desktop.png`
- `reports/screenshots/foundation48-day1-mobile.png`
