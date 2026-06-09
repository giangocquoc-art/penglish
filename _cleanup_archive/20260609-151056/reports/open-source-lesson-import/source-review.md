# P-English Open Source Lesson Import — Source Review

Date: 2026-05-27  
Task: `tasks/penglish/001-source-review.md`  
Status: **Source review only — no lessons imported**

## 1. Scope

This report executes task 001 only:

- Inspect the current P-English project structure.
- Inspect downloaded repositories under `external-sources/`.
- Review visible license/terms information.
- Identify candidate sources for future extraction.
- Stop after creating this report.

No lesson files were imported, extracted, normalized, validated, or connected to the UI in this task.

## 2. P-English project observations

- Existing lesson UI/data is currently centered in `apps/web/src/lib/p-english/`.
- `apps/web/src/data/lessons/` currently has no files.
- Existing lesson routes include:
  - `/learning-path`
  - `/lessons/:lessonId`
  - `/practice?lessonId=...&mode=...`
  - `/english-speed`
- Existing local lesson content uses the `EnglishLesson` structure in `apps/web/src/lib/p-english/lesson-content-data.ts`.
- Current learning path data in `apps/web/src/lib/p-english/learning-path-data.ts` includes Unit 1–3 connected to local lessons, while later units are placeholders.
- Future generated lessons should follow the project rule that final lesson data belongs under `apps/web/src/data/lessons/` or the agreed generated lesson location, but task 001 does not create those files.

## 3. Sources inspected

### 3.1 `external-sources/casualenglish/`

**Observed files:** HTML/CSS/JavaScript frontend, `README.md`, `LICENSE`, irregular verb and tense pages.

**Purpose/content:**

- Simple educational app for practicing English irregular verbs.
- Includes irregular verb data in `iregularverbsenglish.html`.
- Includes short tense-rule cards in `tense-rules.html`.

**License:** MIT License.

**Import suitability:** High for future extraction.

**Why useful for P-English:**

- Irregular verb forms are practical and compact.
- Tense-rule examples are short and learner-friendly.
- MIT terms are compatible with reuse if attribution/license notice is preserved.

**Risks/notes:**

- Source UI is English-first; future P-English content must add Vietnamese explanations.
- Some data should still be normalized and checked for level appropriateness before use.
- Preserve MIT copyright and license notice in future import reports/metadata.

**Recommended future status:** `importCandidate`.

### 3.2 `external-sources/cefr-j/`

**Observed files:**

- `cefrj-vocabulary-profile-1.5.csv`
- `cefrj-grammar-profile-20180315.csv`
- `octanove-vocabulary-profile-c1c2-1.0.csv`
- `README.md`

**Purpose/content:**

- CEFR-J vocabulary and grammar profile datasets.
- Useful for CEFR level tagging and choosing A1/A2/B1 vocabulary or grammar targets.

**License/terms:**

- README states CEFR-J vocabulary and grammar datasets can be used for research and commercial purposes with no charge, provided the dataset is cited properly.
- Copyright belongs to Tono Laboratory at TUFS.
- Octanove C1/C2 vocabulary profile is under CC BY-SA 4.0.

**Import suitability:** Medium/high for metadata and planning; use with citation.

**Why useful for P-English:**

- Can help rank/select vocabulary and grammar by CEFR level.
- Especially useful for A1/A2/B1 source filtering.

**Risks/notes:**

- Citation requirement must be captured in generated source metadata.
- C1/C2 Octanove data is not needed for the near-term A1/A2/B1 pipeline and has CC BY-SA obligations.
- Should be treated primarily as level/reference metadata, not as full lesson prose.

**Recommended future status:** `metadataCandidate` for CEFR-J A1/A2/B1 filtering; `referenceOnly` for Octanove C1/C2 unless explicitly needed.

### 3.3 `external-sources/english-exercises/`

**Observed files:** HTML/CSS/JavaScript app, AGPL license, exercise decks in `decks/`.

**Purpose/content:**

- Grammar and vocabulary exercises in JavaScript deck files.
- Topics include articles, make/do, prepositions, irregular verbs, synonyms, comparatives/superlatives, phrasal verbs, and negative prefixes.

**License:** GNU AGPLv3.

**Additional provenance note:** README says the project is inspired by Raymond Murphy grammar books.

**Import suitability:** Low for direct copying; useful as reference only.

**Why potentially useful:**

- Deck structure shows simple question/answer and multiple-choice exercise formats.
- Topic list can guide future original P-English lesson planning.

**Risks/notes:**

- AGPL has strong copyleft/network-use obligations and should not be mixed directly into production lesson data without a deliberate license decision.
- The stated inspiration from copyrighted textbooks increases content-provenance risk.
- Sample deck content includes typos/duplicates, so quality review would be required even if license were accepted.

**Recommended future status:** `referenceOnly` for topic/exercise-shape review. Do not directly import deck content in the next batch.

### 3.4 `external-sources/librelingo/`

**Observed files:** LibreLingo platform repo with AGPL software license and a test course under `courses/test-1/`.

**Purpose/content:**

- Language-learning platform and YAML course format.
- `courses/test-1/course.yaml` is a test-language course for English speakers.
- Test course declares CC BY-SA 4.0.

**License:**

- Platform/software: GNU AGPLv3.
- Test course: CC BY-SA 4.0 according to `course.yaml`.

**Import suitability:** Low for lesson content; medium as schema/reference.

**Why potentially useful:**

- YAML course organization may inspire intermediate extraction format.
- Exercise categories such as options, listening, chips, and short input can inform future P-English import design.

**Risks/notes:**

- Available course is test-language material, not English-for-Vietnamese content.
- CC BY-SA 4.0 has attribution/share-alike obligations.
- AGPL platform code should not be copied into P-English.

**Recommended future status:** `referenceOnly` for course-structure ideas.

## 4. License decision table

| Source | Visible license/terms | Suggested future status | Reason |
| --- | --- | --- | --- |
| `casualenglish` | MIT | `importCandidate` | Permissive license; compact irregular verb and tense material. |
| `cefr-j` | CEFR-J terms with citation requirement; Octanove C1/C2 CC BY-SA 4.0 | `metadataCandidate` / partial `referenceOnly` | Strong fit for CEFR tagging; citation and share-alike details must be preserved. |
| `english-exercises` | AGPLv3; inspired by copyrighted grammar books | `referenceOnly` | Copyleft and provenance risk; use only for topic inspiration unless legal decision changes. |
| `librelingo` | AGPLv3 platform; test course CC BY-SA 4.0 | `referenceOnly` | Useful structure reference; content is test-language and not directly aligned. |

## 5. Recommended next import batch

For the next task after source review, the safest first batch is:

1. Use `casualenglish` irregular verb data as the primary import candidate.
2. Use `cefr-j` only to add/check CEFR tags where matching vocabulary/grammar entries exist.
3. Keep `english-exercises` and `librelingo` as reference-only sources.

## 6. Required safeguards for future tasks

- Do not edit files under `external-sources/`.
- Preserve source attribution and license metadata.
- Avoid copying textbook-derived passages.
- Keep Vietnamese as the main explanation/UI language.
- Validate generated lesson data before any UI integration.
- Mark unclear or risky sources as `referenceOnly`.

## 7. Stop condition confirmation

- No lesson content was imported.
- No files were created under `extracted-lessons/`.
- No production lesson data was created or modified.
- No UI routes or components were modified.
- This report is the only task 001 output.
