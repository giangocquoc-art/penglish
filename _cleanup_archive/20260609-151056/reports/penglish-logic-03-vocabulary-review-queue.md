# PENGLISH-LOGIC-03 — Vocabulary Review Queue

## Summary

Implemented a local vocabulary review queue for `/words` with compact status chips, review filters, a visible `Ôn hôm nay` card, and local spaced repetition scheduling. No backend, login, API upload, English Speed logic, or Shadowing logic was changed.

## Files changed

- `apps/web/src/lib/p-english/vocabulary-review.ts`
  - Reworked vocabulary progress to the requested local-only schema.
  - Added `penglish.vocabulary.progress.v1` as the active localStorage key.
  - Added status scheduling for `known`, `review`, and `difficult`.
  - Added due-today helper logic and updated stats.
  - Kept compatibility helpers used by existing flashcard practice imports.
- `apps/web/src/pages/VocabPage.tsx`
  - Updated filters to `Tất cả`, `Cần ôn`, `Hay sai`, `Đã nhớ`.
  - Added word status chips: `Đã nhớ`, `Cần ôn`, `Hay sai`, `Xóa trạng thái`.
  - Added compact `Ôn hôm nay` review card with next due word actions.
  - Updated status labels, counts, and table/mobile card metadata.
- `scripts/penglish-logic-vocabulary-review-qa.cjs`
  - Added Playwright QA coverage for status marking, filtering, persistence after reload, mobile viewport, screenshots, no horizontal overflow, and no console errors.

## localStorage schema

Key:

```text
penglish.vocabulary.progress.v1
```

Stored by vocabulary item id:

```ts
type VocabularyReviewStatus = 'new' | 'known' | 'review' | 'difficult';

type VocabularyReviewRecord = {
  wordId: string;
  status: VocabularyReviewStatus;
  reviewCount: number;
  wrongCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
};

type VocabularyReviewStore = Record<string, VocabularyReviewRecord>;
```

Notes:

- `new` is represented by no stored record after `Xóa trạng thái`.
- Legacy `p-english:vocabulary-review` records are read and normalized when the new key is empty.
- New writes only use `penglish.vocabulary.progress.v1`.

## Review queue logic

Scheduling is intentionally simple and transparent:

- `known` / `Đã nhớ`: `nextReviewAt = now + 3 days`
- `review` / `Cần ôn`: `nextReviewAt = now + 1 day`
- `difficult` / `Hay sai`: `nextReviewAt = now + 6 hours`

`Ôn hôm nay` includes a word when:

- `status` is `review`, or
- `status` is `difficult`, or
- `nextReviewAt <= now`

Counters:

- `reviewCount` increments when marking `known`, `review`, or `difficult`.
- `wrongCount` increments when marking `difficult`.
- `lastReviewedAt` updates when marking a non-`new` status.

## Filters tested

- `Tất cả`
- `Cần ôn`
- `Hay sai`
- `Đã nhớ`

The QA script marked a word through `Cần ôn`, `Hay sai`, `Đã nhớ`, cleared status, then persisted a `Cần ôn` state and verified it after reload.

## Persistence result

Passed. Playwright verified `localStorage['penglish.vocabulary.progress.v1']` retained the reviewed word after reload with:

- `status: 'review'`
- `lastReviewedAt`
- `nextReviewAt`

Persisted QA word id:

```text
cefr-a1-core:a1-a-determiner-001
```

## Mobile result

Passed at `390x844`.

- Compact status chips fit without horizontal page overflow.
- `Ôn hôm nay` card is visible on mobile.
- No horizontal overflow detected.
- No console errors detected.

## Screenshots saved

Saved under `reports/screenshots/penglish-logic/`:

- `words-review-mobile.png`
- `words-status-chips-mobile.png`
- `words-filter-review.png`
- `words-progress-persist-after-reload.png`

## Validation

Build:

```text
npm.cmd run build -w @pshare/web
```

Result: passed.

QA:

```text
node scripts/penglish-logic-vocabulary-review-qa.cjs
```

Result: passed.

QA output:

```json
{
  "ok": true,
  "screenshots": [
    "words-filter-review.png",
    "words-progress-persist-after-reload.png",
    "words-review-mobile.png",
    "words-status-chips-mobile.png"
  ],
  "persistedWordId": "cefr-a1-core:a1-a-determiner-001"
}
```
