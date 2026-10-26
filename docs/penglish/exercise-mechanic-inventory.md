# PooEnglish exercise mechanic inventory

Generated from the current lesson banks and Foundation48 day data. This inventory distinguishes exercises that are missing from the app from tasks that are present but deliberately unscored.

Regenerate the exact ID list and source mapping with `npm run audit:penglish-mechanic-inventory`. The machine-readable inventory is [`reports/penglish-exercise-mechanic-inventory.json`](../../reports/penglish-exercise-mechanic-inventory.json). Cross-check it against [`reports/penglish-source-reachability.json`](../../reports/penglish-source-reachability.json) and [`reports/penglish-lesson-experience-audit.json`](../../reports/penglish-lesson-experience-audit.json).

## Current coverage

| Scope | Count | Current mechanic | Finding / next mechanic |
|---|---:|---|---|
| English source lesson banks | 5,283 items across 81 lessons | Interactive runner; source-reachability audit reports all reachable | 0 unreachable items. Reachability does not prove source-mechanic fidelity. |
| Core quest vs optional bonus | 485 core steps; 2,976 optional bonus steps | Every bank item remains available; 5–6 challenges drive the required quest | Bonus steps are interactive, but the main path may not exercise every named source mechanic. |
| Real-life scenarios (`scenario-${id}`) | 158 | Phrase tiles + editable free response; no correctness score | Intentionally unscored because the authored phrase bank does not define unique valid branches. Add context-specific choices/consequences only with authored alternatives. |
| English final challenges (`final-${id}`) | 78 | Open composition / self-check | No authored rubric or branch result yet. Add “must include” criteria and show the example after the first attempt. |
| Foundation48 day missions (`day-${n}-mission-boss`) | 48 | Open response / self-check, unscored | Same open-answer limitation; add a short day-specific checklist and mission outcome without pretending free text has one answer. |
| Completion-only game missions | 52 | Activity participation tracker, including reading retells | Does not establish correctness or mastery. Exact mission and source item IDs are listed in the JSON inventory; change completion copy to “đã luyện” and use an optional keyword checklist. |
| Correct-threshold game missions | 78 | Criteria-backed source activity thresholds | Already have typed links and correctness thresholds; retain as the scored mission pattern. |
| English speaking reflex prompts | 290 | Speak, then self-mark | Unscored intentionally; no reliable speech assessment. Keep the UI clear that saying “done” is not a pronunciation score. |
| Foundation48 guided speaking prompts | 251 direct speaking prompts + 47 quiz-bank speaking repeats (298 total) | Repeat/read aloud, then self-mark | Unscored intentionally; shadowing can compare a recording when available, with self-check fallback. |
| Foundation48 open review prompts | 144 | Free recall / self-check | No unique answer key; pair with reveal/remember-again SRS actions rather than automatic scoring. |
| Foundation48 Day 20 | 20 source test items + 31 number/ordinal dictations | Word bank, typed question construction, multiple choice, listen-and-type with spoken sample | One seeded cardinal/ordinal dictation is guaranteed in the core quest; remaining examples stay in the interactive bonus bank. Add context variants for prices/dates/age/distance later. |
| Foundation48 Day 21 | 31 source test items mapped | Five number-recognition choices, six number dictations, five phone dictations, five letter choices, five letter dictations, five name dictations; source audio `mp3.1`–`mp3.6` is attached by group | The answer scan has no extractable text, so all 31 are explicit unscored listening practice and do not cost hearts. Keep them that way until an answer key is visually/audio verified. The lesson PDF references `mp3.7`–`mp3.12`, which are not present in the six local indexed files. QA passed all 56 Day 21 interactions. |

The precise rows for all 158 scenarios, 78 English finals, 52 participation missions, speaking/review prompts, day missions, and the Day 21 source activity breakdown are in the generated JSON. For the 52 reading retell missions, each tracker currently links its reading/listening item and reflex-retell item; the inventory lists every lesson and source ID.

## Prioritized mechanic plan

1. **Repair source fidelity:** Day 21's 31-item activity bank now uses the six indexed online-test audio tracks with an explicit unscored fallback. Its 56-challenge mobile flow passes. Day 20's 31-item cardinal/ordinal dictation ladder is now in place; add contextual variants for dates, prices, age and distance as later enrichment. Do not add keys where source evidence cannot support them.
2. **Make open responses feel like missions:** add small, authored success checklists, optional alternative replies and consequence feedback to real-life scenarios and final tasks. Keep arbitrary valid responses unscored until criteria are reliable.
3. **Clarify participation vs mastery:** relabel the 52 retell trackers as practice completion, and optionally give learners a keyword recall checklist; do not convert speech to a correctness score without validated recognition.
4. **Preserve deliberate unscored practice:** keep Foundation48 speaking, shadowing fallback and open review tasks unscored, but provide reveal/compare, retry and “remembered / need a hint” controls.
5. **Keep core paths representative:** when a lesson is explicitly about a source mechanic, include at least one such task in the core quest; leave deeper repetitions in the optional bonus round.

## Fidelity notes

- “Unscored” is not the same as “not interactive.” Phrase builders, speech rehearsal and open recall already have input, progress and self-check, but they do not validate correctness.
- The Day 21 answer PDF has no extractable text, so do not present an unverified key as source truth.
- Dialogue, vocabulary, listening, fill blank, sentence order, matching, timed recall and shadowing have interactive runtime paths. Their exact source-to-runtime rows remain in the source reachability report.
