# P-English next lesson-content development plan

## 1. Current baseline after this development pass

This pass stabilizes P-English content delivery by turning temporary lesson checks into release workflow, adding browser-QA hooks for sentence-order identity, and bridging generated grammar lessons into listening/speaking practice.

Implemented web/content foundations:

- Runtime validation is now a permanent release gate through `npm run validate:penglish-runtime-lessons`.
- P-English release validation can be run through `npm run release:penglish`.
- Sentence-order UI exposes stable QA token metadata so duplicate visible words can still be tested by token ID, not by word string.
- Practice browser QA is now available through `npm run qa:penglish-practice`.
- Generated grammar lessons now include a bridge layer:
  - mini dialogue,
  - pronunciation note,
  - listening item,
  - speaking reflex prompts,
  - completion criteria for listening/speaking practice.

## 2. Lesson-content development goal

The next content phase should move P-English from “valid runtime lessons” to “complete skill-loop lessons”. Each lesson should teach a chunk, let the learner hear it, let them say it, test it, then feed weak items into review.

Main target: every prioritized unit should have all 10 content-depth layers:

1. Objective
2. Chunk/vocabulary
3. Pattern
4. Context
5. Audio/listening
6. Output/speaking
7. Assessment
8. Review/SRS
9. Mistake correction
10. Multimodal support

## 3. Priority sequence for next lesson content

### Phase C1 — Strengthen A2 grammar bridge first

Target unit: `path-a2-grammar-patterns`.

Reason: it was the weakest unit because grammar-generated lessons previously had assessments but no listening/speaking bridge.

Tasks:

- Review all A2 grammar lessons generated from grammar sources.
- Replace generic bridge prompts with hand-polished prompts for the highest-traffic patterns:
  - past simple regular verbs,
  - comparatives,
  - be going to plans,
  - present perfect basics,
  - first conditional.
- Add 2–3 realistic mini-dialogues per important A2 pattern.
- Add listening distractors that are pedagogically meaningful, not random alternatives.
- Add speaking prompt variants with acceptable paraphrases.

Completion target:

- A2 grammar lessons: 100% have listening, speaking, mini dialogue, pronunciation note.
- At least 5 A2 grammar lessons have hand-polished dialogue/reflex content.

### Phase C2 — Upgrade A1/A2 survival speaking packs

Target units:

- greetings/introduction,
- classroom help,
- daily routine,
- directions/travel,
- scheduling/time.

Tasks:

- Add “listen → repeat → answer” loops for each survival topic.
- Add short role-play dialogues with A/B speaker labels.
- Add common mistakes for Vietnamese learners.
- Add final mini challenges that require a spoken or typed output.

Completion target:

- 20 beginner-friendly lessons with strong speaking/reflex flow.
- Every A1/A2 unit has at least one final mini challenge that asks the learner to produce English.

### Phase C3 — Reading-to-speaking bridge

Target: generated reading lessons.

Tasks:

- For each reading lesson, extract 2 useful chunks from the passage.
- Add listening preview for one key sentence.
- Add speaking prompts that retell the passage in 1–2 sentences.
- Add “main idea in English” final challenge for B1/B2 reading lessons.

Completion target:

- All reading lessons have at least one speaking/reflex item.
- B1/B2 readings have productive output prompts, not only comprehension checks.

### Phase C4 — Shadowing and English-speed integration

Target: units that already reference shadowing/speech sources.

Tasks:

- Link lesson mini-dialogues to shadowing scripts when topic overlap exists.
- Add English-speed prompts after speaking reflex completion.
- Add “slow → normal → faster” practice progression for selected chunks.

Completion target:

- Each mature unit recommends a next speaking/shadowing route.
- English-speed prompts appear as an extension after core lesson completion.

### Phase C5 — Content QA and authoring workflow

Tasks:

- Create a content authoring checklist for every new lesson.
- Add thresholds to runtime validation for content depth coverage.
- Track weak units by missing skills and route readiness.
- Generate a weekly report of lessons needing audio/output/review improvements.

Completion target:

- New lessons cannot be released if they lack required content layers for their lesson type.
- Reports clearly identify the next 10 content improvements by impact.

## 4. Recommended lesson template for future content

Each new P-English lesson should include:

- 3–6 vocabulary/chunk items or grammar pattern examples.
- 1 sentence pattern with Vietnamese explanation.
- 1 mini dialogue with A/B roles.
- 1 pronunciation note focused on rhythm/chunking.
- 1 listening item with 2–3 answer options.
- 2 speaking reflex prompts.
- 3–6 assessment items across MCQ, fill-blank, and sentence-order.
- 1 common mistake.
- 1 real-life situation.
- 1 final mini challenge.
- review rules and completion criteria aligned with the available modes.

## 5. Next implementation recommendation

After this pass, the best next development step is C1: hand-polish the A2 grammar lessons that matter most for speaking confidence. The generated bridge gives every grammar lesson baseline listening/speaking support; the next content pass should improve quality and naturalness for the highest-priority A2 patterns before expanding to lower-impact units.
