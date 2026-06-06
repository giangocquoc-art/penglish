# Lightweight research: British Council A1 Listening reference

Date: 2026-06-01
Target URL: https://learnenglish.britishcouncil.org/skills/listening/a1-listening
Scope: UX / lesson-flow reference only. No cloning, no copied lesson text, no copied media, no brand assets.

## Access note

Direct CLI inspection was attempted with `curl.exe`, but the page returned an Akamai `Access Denied` response. Per task instruction, this report continues with lightweight, non-copying research based on common public A1 listening-learning patterns and the requested observation categories. No British Council content, names, audio, transcript text, imagery, logo, or lesson copy is reproduced here.

## 1. Page / lesson-list structure

A typical A1 listening index page is organized as a skill landing page rather than a single long lesson. Useful structural patterns for P-English:

- A clear page title for the skill and CEFR level.
- Short learner-facing intro explaining that the section trains beginner listening.
- A vertical list/grid of lesson cards.
- Each card usually communicates topic, difficulty/level, and a short learning purpose.
- Lessons are likely topic-based and practical: people, school, cafes, travel, simple instructions, short conversations.
- The learner selects one card, completes a short guided lesson, then returns to the list for the next item.

## 2. Common A1 listening lesson flow

The useful flow pattern is compact and repeatable:

1. Preparation / vocabulary warm-up.
2. Short audio or model dialogue.
3. First-listen gist question.
4. Second-listen detail questions.
5. Answer checking with immediate feedback.
6. Transcript reveal after attempting.
7. Optional replay / slow replay.
8. Review prompt that asks the learner to reuse the language.

For P-English, this maps well to the existing ocean lesson flow: warm-up vocabulary, TTS listening block, comprehension, transcript toggle, Vietnamese explanation, then speaking/shadowing review.

## 3. Exercise types observed or inferred

### Preparation vocabulary
- Short list of key words before listening.
- Matching word-to-meaning or word-to-picture pattern.
- Beginner-friendly phrases, not isolated difficult words.

### Listening comprehension
- Short audio/dialogue with one simple scenario.
- Questions focus on names, places, numbers, preferences, actions, or sequence.

### True / false
- Beginner-friendly detail checks.
- Works well after a first or second listen.

### Multiple choice
- Most suitable for mobile.
- Options should be short and visually tappable.

### Matching
- Match speaker to information, phrase to meaning, or item to response.
- Useful for vocabulary preparation and post-listening review.

### Gap-fill
- Short blanks inside very simple sentences.
- Should use audio/transcript support and not require advanced spelling.

### Transcript usage
- Transcript should be hidden by default.
- Reveal only after the learner has tried listening.
- Transcript can support replay, shadowing, pronunciation, and review.

### Answer checking
- Immediate feedback is important.
- Correct/incorrect state should be clear.
- A short Vietnamese explanation should tell the learner why the answer is correct.

## 4. Mobile layout observations

A1 listening is usually consumed on mobile, so P-English should keep:

- One main task per screen section.
- Large tap targets for answer choices.
- Short card copy with no crowded metadata.
- Sticky/bottom-safe actions that are not covered by nav.
- Transcript in a collapsible section.
- Progress indicator like `2/5` rather than dense dashboards.
- Replay buttons near the active question.

## 5. What P-English should adapt

- Add original A1 listening lesson cards in the A1 learning path.
- Use a repeatable structure: vocabulary → listen → answer → explanation → transcript → review.
- Add `Nghe mẫu` and `Nghe chậm` using browser TTS where no licensed audio exists.
- Show Vietnamese explanations after answer checking.
- Hide empty practice modes instead of showing “Chưa có dữ liệu”.
- Count listening completion in real local progress.
- Keep the current ocean/Poo visual language, but reduce clutter on mobile.

## 6. What P-English must NOT copy

- Do not copy British Council logo, icons, images, audio, transcript text, lesson titles, long copy, or question wording.
- Do not reproduce their exact page layout or card styling.
- Do not crawl or mirror the full website.
- Do not scrape media or private/account-only content.
- Do not imply partnership or endorsement.

## 7. Concrete implementation plan

1. Audit existing lesson data and route wiring.
2. Extend the local P-English lesson data minimally with listening explanations and original A1 content.
3. Improve Unit 1 listening items with Vietnamese explanations.
4. Add two original A1 listening-style lessons:
   - `A1 - Meeting a new classmate`
   - `A1 - Ordering a drink`
5. Add these lessons into the A1 learning path as a listening-focused unit.
6. Update listening practice completion to use the centralized local lesson progress store.
7. Display explanation text and transcript support in the listening UI.
8. Run build and lesson data audit.
9. Perform browser QA on required routes and save screenshots.

## Research conclusion

The reference value is the learning progression, not the visual surface or content. P-English should adapt the A1 listening pedagogy into original, Vietnamese-guided, ocean-themed lessons with stable progress tracking and mobile-safe practice interactions.
