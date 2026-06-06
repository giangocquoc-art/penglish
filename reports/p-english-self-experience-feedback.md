# P-English Self-Experience Feedback Report

Review date: 2026-05-27  
Local app: `http://127.0.0.1:5174`  
Review type: strict product review, UI/UX review, English learning design review, and QA pass  
Scope: report only. No product code was edited.

## 1. Executive Summary

### Overall product feeling

P-English already has a clear learning-product direction: Vietnamese-first guidance, ocean/whale identity, a visible roadmap, lesson-linked practice modes, daily dashboard cards, and several retention surfaces. The app feels friendly and more structured than a generic flashcard tool.

However, it is not yet ready for public demo testing as a dependable learning app. Several flows appear demo-like or fragile: backend-dependent vocabulary/profile requests fail, some practice interactions unexpectedly routed away during DevTools testing, English Speed’s start button routed away instead of starting the round, and progress/mission states remain mostly zero. For a beginner learner, the app gives a warm first impression but does not yet consistently complete the promise of guided learning, feedback, and return motivation.

### Top 5 strengths

1. **Vietnamese-first onboarding is clear**: home, lessons, and practice pages explain the learning task in Vietnamese, which helps true beginners.
2. **Roadmap structure is visible**: Units 1-3 are available and Units 4-8 are shown as coming soon, so the learner sees a future path.
3. **Lesson Unit 1 has real educational content**: vocabulary, examples, sentence patterns, dialogue references, quiz count, and guided steps are present.
4. **Practice modes are ambitious**: flashcard, quiz, typing, match, reflex, speed, English Speed, shadowing, and words create a broad learning loop.
5. **Whale/ocean identity is memorable**: the whale coach gives the product a distinct brand and a calm tone.

### Top 10 critical issues

1. **Practice interactions may navigate away unexpectedly**: observed answer/control clicks routed to `/profile` or `/learning-path`, blocking practice if reproducible manually.
2. **English Speed start button did not start during tested interaction**: clicking `Bắt đầu English Speed` navigated to `/learning-path`.
3. **Backend connection failures are repeated**: `http://localhost:8080/auth/profile`, `/categories`, `/vocabularies`, and `/vocabularies/stats` fail with `ERR_CONNECTION_REFUSED`.
4. **Words/SRS features are not reliable without backend**: vocabulary and weak-word features cannot be trusted while API calls fail.
5. **Quiz progress displays confusing state**: `0/0 đúng` appears at the start, which looks broken or unfinished.
6. **Debug/internal labels are visible in quiz**: labels such as `quizQuestions` and `multiple-choice` leak implementation language into learner UI.
7. **Daily missions are mostly shallow navigation**: cards route to practice modes but do not clearly complete, validate, or reward mission progress.
8. **Learning path unlock logic is too permissive**: Units 1-3 are all ready immediately, which weakens sequencing for a beginner.
9. **Whale character is underused pedagogically**: it mostly decorates or gives text tips; it rarely teaches with visual scenes or step-by-step micro-coaching.
10. **Mobile needs stricter QA**: required mobile screenshots exist, but sticky bottom navigation and dense cards risk accidental taps and crowding.

## 2. Learner Journey Review

### First impression

The home page immediately communicates that this is a Vietnamese-first English learning app. The dashboard title `Hôm nay học gì?` and the suggested path make the learner feel guided. The tone is gentle and beginner-friendly.

A beginner can find:

- `Học tiếp ngay`
- `English Speed`
- `Shadowing`
- `Mở bài`
- daily mission cards
- bottom navigation for `Trang chủ`, `Lộ trình`, `Speed`, `Luyện tập`, `Từ vựng`, `Hồ sơ`

This is a good first impression, but the page also feels like it promises more than the app can currently verify. Progress, weak words, streak, and missions all show zero-like states, and backend failures reduce trust.

### What is clear

- The app wants learners to start with Unit 1.
- The learner can see a roadmap from Unit 1 to Unit 8.
- Unit 1 teaches greetings and self-introduction.
- Flashcard asks the learner to type Vietnamese meaning before revealing the back.
- Quiz asks Vietnamese meaning questions with multiple choices.
- Shadowing asks the learner to listen, repeat, and record.
- English Speed is positioned as a timed reaction game.

### What is confusing

- Units 1, 2, and 3 are all marked `SẴN SÀNG HỌC`, so a beginner may not know whether they must finish Unit 1 first.
- Learning Path says local progress is read from the device, but all progress appears 0%, making the system feel static.
- Quiz displays `0/0 đúng`, which makes the scoring model unclear.
- Quiz exposes `quizQuestions` and `multiple-choice`, which look like developer/debug labels.
- Daily mission cards look actionable but do not clearly show what completion means after navigation.
- `Làm nhiệm vụ ngày` routes to `/home#daily-missions`, which is technically clickable but not a meaningful mission action by itself.
- English Speed and practice controls appeared to route away during testing instead of performing the action.

### Where a beginner may quit

1. **First failed interaction in practice**: if checking a flashcard or choosing a quiz answer routes away, the learner will lose trust immediately.
2. **No visible reward after mission navigation**: beginners need confirmation such as `Đã hoàn thành 1/5`.
3. **Too many modes too early**: Flashcard, Quiz, Typing, Match, Reflex, Speed, Shadowing, Words, and English Speed are exciting, but beginners may need a single recommended next step.
4. **Backend failure effects**: if weak words, stats, or profile remain empty because the backend is offline, the learner may think their learning is not saved.

## 3. UI/UX Review

### Layout

The desktop layout is visually pleasant and spacious. Cards are rounded, friendly, and consistent with the ocean/whale concept. The main dashboard and lesson cards create a calm learning space.

The app would benefit from stronger hierarchy between:

- primary learning action
- secondary practice action
- optional game action
- account/profile/premium actions

Currently, many cards compete for attention: daily dashboard, mission cards, priority practice cards, bottom nav, profile/pro button, and lesson suggestions.

### Visual hierarchy

Good:

- Page headings are clear.
- Unit cards are readable.
- Important CTAs are visible.
- Stats blocks are easy to scan.

Needs improvement:

- The most important next action should be more dominant and singular.
- Debug-looking labels should be removed from learner-facing UI.
- Progress and mission status should use meaningful visual states, not only zero counts.
- In practice modes, feedback after an action must be visually prominent and explanatory.

### Mobile

Required mobile screenshots exist for home and shadowing. Based on the captured mobile assets and the dense desktop snapshots, the main risks are:

- sticky bottom nav consuming vertical space
- accidental taps on bottom nav when pressing low-position buttons
- tall cards requiring lots of scrolling
- shadowing video + transcript + recording controls becoming cramped
- practice controls too close to navigation

The observed DevTools interaction where several clicks routed to bottom-nav destinations suggests the app needs manual mobile hit-target QA. Even if the issue is partly DevTools coordinate/snapshot-related, it points to a high-risk area: sticky navigation and interactive cards must not overlap or steal taps.

### Navigation

Bottom navigation is useful and consistent. `Speed`, `Luyện tập`, and `Từ vựng` are easy to access.

Issues:

- Some key home cards route to different speed experiences (`/english-speed` versus `/practice?...mode=speed`), which may confuse learners.
- `Làm nhiệm vụ ngày` only anchors to the current page’s mission section.
- Broken/fragile practice interactions make navigation feel unsafe.

### Card design

Cards are friendly and readable, but they sometimes contain too much text for beginner scanning. The lesson cards include useful details but need a clearer progression state: `Start here`, `Continue`, `Locked until Unit 1 complete`, etc.

### Whale/ocean identity

The whale identity is a strong differentiator. It makes the app memorable and less intimidating.

Current limitation: the whale mostly appears as text guidance. It should become a real learning coach:

- explain one word with a tiny scene
- show mouth/shadowing rhythm
- warn when the learner translates word-by-word
- celebrate meaningful milestones
- explain why an answer is wrong

### Animation usefulness

The animation style feels calm, but it currently appears more decorative than instructional. Animations should support learning events: revealing meaning, highlighting word chunks, showing sentence order, or pacing shadowing.

## 4. Lesson Depth Review

### Vocabulary quality

Unit 1 vocabulary is appropriate for A1 beginners. Examples such as `Hello, I’m Nam`, `Good morning, teacher`, and `My name is An` are practical.

Strengths:

- English phrase + Vietnamese meaning are visible.
- Examples are short.
- The vocabulary belongs to the lesson theme.
- The lesson starts with useful chunks, not isolated grammar theory.

Needs improvement:

- Add pronunciation hints or syllable stress.
- Add mini visual scenes for each key word.
- Group vocabulary into micro-sets: greetings, names, origin, polite phrases.
- Include common mistakes for Vietnamese learners.

### Sentence patterns

The lesson promises sentence patterns and guided steps. This is valuable because beginners need reusable frames, not only word memorization.

Suggested teaching logic:

1. Hear the pattern.
2. See Vietnamese meaning.
3. Replace one slot.
4. Speak it.
5. Use it in mini-dialogue.
6. Review it in quiz/speed mode.

### Dialogues

The lesson indicates `3 hội thoại mẫu`. This is a strong learning component. Dialogues should be surfaced more actively inside the guided flow, not only listed as a content count.

A beginner should be able to press one button and enter:

- listen to dialogue
- read line by line
- repeat after each line
- roleplay as speaker A or B
- finish with a simple challenge

### Examples

Examples are useful but could become more interactive. For each vocabulary card, the app should ask one tiny action:

- choose meaning
- fill missing word
- speak after the sample
- tap the matching picture

### Vietnamese explanations

Vietnamese instructions are mostly clear and friendly. The product correctly avoids overwhelming beginners with English-only explanations.

Need more Vietnamese explanation in feedback states:

- why an answer is correct
- why an answer is wrong
- what to remember next time
- how to use the phrase naturally

### Missing teaching logic

The core missing layer is a stronger pedagogical sequence. The app has content and modes, but not always a guided progression from input to practice to retention.

Recommended structure per lesson:

1. Warm-up: recognize meaning.
2. Learn: 5-7 key phrases.
3. Understand: sentence pattern.
4. Use: mini-dialogue.
5. Practice: flashcard/quiz/typing.
6. Speak: shadowing/reflex.
7. Retain: weak words/SRS tomorrow.

## 5. Practice/Game Review

### Flashcard

**What works**

- Clear header: `Flashcard`.
- Shows `18 thẻ`, progress `1 / 18`.
- Asks learner to type Vietnamese meaning before flipping.
- Placeholder gives a useful example: `Ví dụ: xin chào`.
- `Kiểm tra nghĩa` is disabled until input exists.
- Provides learning tips about reading aloud and marking unknown cards.

**What is broken or risky**

- During testing, after entering `xin chào`, clicking `Kiểm tra nghĩa` unexpectedly routed to `/profile`.
- If real for users, this blocks the core flashcard loop.
- No confirmed explanation state was reached after answer checking.
- Needs tolerance rules for Vietnamese synonyms/diacritics and typo handling.

**Learning value score: 6/10**

High potential, but interaction reliability and feedback explanation must be fixed.

**Improvement ideas**

- Show accepted meanings before marking wrong.
- Accept common Vietnamese variants.
- Give immediate explanation after answer.
- Add `Tôi chưa nhớ` and `Tôi đã nhớ` as clear SRS actions.
- Keep controls away from sticky navigation on mobile.

### Quiz

**What works**

- The first question is relevant: `“What’s your name?” nghĩa là gì?`
- Correct answer exists: `Bạn tên gì?`.
- Distractors are plausible enough for beginners.
- Vietnamese instruction encourages reading explanations.

**What is broken or risky**

- Progress shows `0/0 đúng`, which is confusing.
- Developer labels `quizQuestions` and `multiple-choice` are visible.
- Clicking the correct option during testing unexpectedly routed to `/learning-path`.
- Could not confirm the explanation state because the route changed.

**Learning value score: 5/10**

Good question content, but polish and interaction reliability are not demo-ready.

**Improvement ideas**

- Remove internal labels.
- Fix progress denominator.
- Require stable option selection before `Kiểm tra`.
- Explain each answer in Vietnamese.
- Add sentence-order items with clear drag/tap instructions.

### Typing practice mode

**What works**

- Route `/practice?lessonId=unit-1-greetings-introduction&mode=typing` exists according to console logs.

**What is broken or risky**

- The mode was reached by automation/logging but not deeply verified in the final pass.
- Needs testing for accepted spelling, hints, Vietnamese prompt clarity, and completion state.

**Learning value score: 6/10 if functional; 3/10 if it lacks feedback**

Typing can strongly support retention, but only if feedback is precise and forgiving.

**Improvement ideas**

- Show target meaning or audio first.
- Let learner type English phrase.
- Highlight exact mistake.
- Allow retry without punishment.
- Add review list for mistyped words.

### Match mode

**What works**

- Route `/practice?lessonId=unit-1-greetings-introduction&mode=match` exists according to console logs.

**What is broken or risky**

- Needs manual interaction QA for tap pairing, success state, and mobile layout.
- Backend category/stat failures appear on practice routes.

**Learning value score: 6/10 if stable**

Matching is useful for recognition, especially for beginners.

**Improvement ideas**

- Limit to 4-6 pairs per round.
- Use visual grouping.
- Animate correct pairs calmly.
- Send wrong pairs to weak-word review.

### Reflex mode

**What works**

- Route `/practice?lessonId=unit-1-greetings-introduction&mode=reflex` exists according to console logs.
- Reflex practice matches the product goal of speaking/reaction training.

**What is broken or risky**

- Needs verification for prompt clarity, recording/mic fallback, and useful scoring.
- Backend failures occur around practice routes.

**Learning value score: 7/10 if implemented with speech-like prompts; 4/10 if only a UI shell**

Reflex can be a strong differentiator if the learner actually speaks or chooses fast responses.

**Improvement ideas**

- Use short A1 prompts.
- Offer `Nghe`, `Nói theo`, `Tự trả lời`.
- Avoid strict speech recognition early; use self-check and model answer.
- Add whale coach feedback.

### Practice speed mode

**What works**

- Route `/practice?lessonId=unit-1-greetings-introduction&mode=speed` exists.
- It is linked from home and daily mission cards.

**What is broken or risky**

- Repeated backend stat/category failures appear in practice routes.
- Need clear distinction between this and `/english-speed`.

**Learning value score: 6/10**

Useful for recall speed, but the product should avoid having two confusing speed entry points.

**Improvement ideas**

- Merge or clearly differentiate `Speed` and `English Speed`.
- Add post-game review of mistakes.
- Keep correct answer always in choices.
- Confirm every question has exactly one correct answer.

### English Speed

**What works**

- Strong game framing: `First-class mode`, `Luyện phản xạ`, `Combo streak`.
- Shows question count: `31`.
- Shows score, combo, and record.
- Allows lesson selection for Unit 1, Unit 2, and Unit 3.
- Difficulty options are clear: `Dễ — 75s`, `Vừa — 60s`, `Nhanh — 45s`.
- Tips explain how to play.

**What is broken or risky**

- During testing, clicking `Bắt đầu English Speed` unexpectedly routed to `/learning-path` instead of starting a game.
- Could not verify score/combo/result review because the game did not start in the tested interaction.
- Need automated validation that every random question includes exactly one correct answer.

**Learning value score: 5/10 now; 8/10 after reliable start/result/retry loop**

The concept is strong, but the tested flow did not complete.

**Improvement ideas**

- Fix start button behavior.
- Add result page with mistakes, correct answers, and `Retry weak items`.
- Add deterministic test fixtures for choices.
- Show why the correct answer is correct after the timer/game.

## 6. Shadowing Review

### Data quality

Shadowing has real starter content:

- `Unit 1 - Greetings and Self-introduction`
- `Daily Small Talk - Morning routine`
- transcript lines such as:
  - `Hello, my name is Minh.` / `Xin chào, tên tôi là Minh.`
  - `Nice to meet you.` / `Rất vui được gặp bạn.`
  - `I am learning English every day.` / `Tôi học tiếng Anh mỗi ngày.`
  - `Can you speak a little more slowly?` / `Bạn có thể nói chậm hơn một chút không?`

This is useful and appropriate for A1/A1+.

### Flow quality

The flow is understandable:

- choose a video
- play video
- choose speed: `0.75x`, `1x`, `1.25x`
- repeat current sentence
- record
- follow transcript

This is one of the stronger learning flows in the app.

### Recording/playback

The UI includes `Ghi âm` and explains that the learner can listen back after speaking. During testing, clicking `Ghi âm` unexpectedly routed to `/profile`, so recording behavior was not confirmed.

If this is reproducible, shadowing’s core value is blocked.

### Custom content

The app supports custom shadowing items:

- paste video link
- enter title
- enter video URL or local file note
- paste transcript line by line
- create practice item

This is a strong advanced feature. It should be kept, but beginner users need the default lesson-linked flow first.

### Mobile

A mobile screenshot exists. Shadowing is inherently mobile-friendly as a concept, but the UI has many controls: video, speed buttons, repeat, record, transcript, custom form, and bottom navigation. This needs careful small-screen spacing and sticky-control design.

### Missing features

- Confirmed recording permission/fallback state.
- Playback of the learner’s recording.
- Sentence-by-sentence completion tracking after successful repeat/record.
- Clear lesson-linking from Unit 1 into Shadowing.
- Pronunciation/rhythm hints.
- A simple `Practice only this sentence` flow.

## 7. Retention Review

### Daily missions

Daily missions are present and visible:

- `0/5 Học 5 từ mới`
- `0/5 Nghe 5 câu`
- `0/3 Nói đuổi 3 câu Shadowing`
- `0/1 Hoàn thành 1 game tốc độ`

This is a strong retention concept.

Current issue: the cards mostly route to activities. They do not yet prove a satisfying mission-completion loop. Learners need to see progress update immediately after doing the task.

### Streaks

Home shows `CHUỖI HỌC 0 ngày`. Profile shows `Chưa có chuỗi`. The concept exists, but no working streak loop was verified.

### Weak words

Home shows weak words count as `0`. Words and practice routes attempt backend calls to vocabulary/stat APIs, but these fail when backend is not running. Weak-word retention cannot be trusted in current local frontend-only mode.

### SRS

SRS/review language appears in the product, especially around weak items and flashcards, but the actual spaced repetition behavior was not verified. The app should clearly show:

- due today
- weak words
- mastered words
- next review date
- why a word is being reviewed

### Progress

Learning Path shows local progress per unit, but all tested units show 0%. If local progress works only after completed interactions, then practice interaction bugs prevent visible progress.

### Reasons to come back tomorrow

Potential reasons exist:

- streak
- daily missions
- weak words
- English Speed record
- shadowing practice count
- progress along roadmap

But they need stronger confirmation and reward states. Right now, the return loop feels designed but not fully proven.

## 8. Technical QA

### Console errors

Observed in `reports/screenshots/ux-review/console-2026-05-27T03-26-56-540Z.log`:

- `motion() is deprecated. Use motion.create() instead.`
- React Router future flag warnings:
  - `v7_startTransition`
  - `v7_relativeSplatPath`
- repeated service worker registration logs:
  - `SW registered: http://127.0.0.1:5174/`
- preload warning:
  - whale logo was preloaded but not used shortly after load.

### Network errors

Repeated failed requests:

- `GET http://localhost:8080/auth/profile` -> `net::ERR_CONNECTION_REFUSED`
- `GET http://localhost:8080/categories` -> `net::ERR_CONNECTION_REFUSED`
- `GET http://localhost:8080/vocabularies/stats` -> `net::ERR_CONNECTION_REFUSED`
- `GET http://localhost:8080/vocabularies` -> `net::ERR_CONNECTION_REFUSED`

These errors appeared across home, learning path, practice, words, shadowing, typing speed, daily missions, and lesson routes.

### Broken routes

Routes observed as existing through navigation/logs:

- `/home`
- `/learning-path`
- `/lessons/unit-1-greetings-introduction`
- `/lessons/unit-2-family-and-friends`
- `/lessons/unit-3-school-and-classroom`
- `/practice`
- `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard`
- `/practice?lessonId=unit-1-greetings-introduction&mode=quiz`
- `/practice?lessonId=unit-1-greetings-introduction&mode=typing`
- `/practice?lessonId=unit-1-greetings-introduction&mode=match`
- `/practice?lessonId=unit-1-greetings-introduction&mode=reflex`
- `/practice?lessonId=unit-1-greetings-introduction&mode=speed`
- `/english-speed`
- `/typing-speed`
- `/daily-missions`
- `/shadowing`
- `/words`

No blank route was confirmed, but several routes have backend-dependent errors.

### Blank screens

No blank screen was observed in the captured route pass.

### Performance concerns

No formal performance trace was run. Symptoms to watch:

- repeated service worker registration logs
- repeated failed backend calls
- unused preload warning for whale logo
- potentially heavy card pages on mobile

### Build/deploy concerns if observed

No build was run in this pass. The main deploy/demo concern is frontend reliance on `localhost:8080` backend endpoints without a graceful demo fallback. Public demos should not show repeated API failures.

## 9. Screenshots

Required screenshots are available under `reports/screenshots/ux-review`:

- `reports/screenshots/ux-review/ux-home-desktop.png`
- `reports/screenshots/ux-review/ux-home-mobile.png`
- `reports/screenshots/ux-review/ux-learning-path.png`
- `reports/screenshots/ux-review/ux-lesson-unit1.png`
- `reports/screenshots/ux-review/ux-flashcard.png`
- `reports/screenshots/ux-review/ux-quiz-sentence-order.png`
- `reports/screenshots/ux-review/ux-english-speed.png`
- `reports/screenshots/ux-review/ux-shadowing-desktop.png`
- `reports/screenshots/ux-review/ux-shadowing-mobile.png`
- `reports/screenshots/ux-review/ux-words.png`

Supporting console log:

- `reports/screenshots/ux-review/console-2026-05-27T03-26-56-540Z.log`

## 10. Prioritized Improvement Backlog

| Priority | Area | Problem | Suggested Fix | Estimated Effort | Files likely involved |
|---|---|---|---|---|---|
| P0 | Practice interactions | Flashcard, quiz, English Speed, and shadowing control clicks were observed routing away unexpectedly | Reproduce with manual browser and automated tests; inspect sticky bottom nav overlap, event bubbling, stale target/hitbox issues, and button/link nesting | M | `apps/web/src` practice pages, layout/nav components |
| P0 | Backend/demo reliability | Frontend repeatedly calls `localhost:8080` and logs `ERR_CONNECTION_REFUSED` | Add graceful local fallback/demo data, suppress noisy retry loops, or document/start backend for QA | M | API client, auth/profile service, vocabulary service |
| P1 | Quiz UX | `0/0 đúng` and internal labels `quizQuestions`, `multiple-choice` are visible | Fix score denominator and remove debug labels | S | Quiz/practice components |
| P1 | English Speed | Start action did not reach gameplay during test | Fix start button and add test for start -> question -> answer -> result loop | M | English Speed page/components |
| P1 | Flashcard feedback | Could not confirm answer explanation; answer check routed away | Ensure answer check stays in card, accepts fair Vietnamese variants, and explains result | M | Flashcard mode components |
| P1 | Shadowing recording | `Ghi âm` action routed to profile during test | Fix recording button, permission handling, playback, and fallback state | M | Shadowing page/components |
| P1 | Retention loop | Daily missions route to activities but do not clearly complete or reward progress | Add mission state updates, toast feedback, and dashboard progress sync | M | Home, missions store, progress store |
| P1 | Learning sequence | Units 1-3 all unlocked without clear recommended order | Add `recommended next`, prerequisite messaging, and completion gates or soft locks | S-M | Learning path data/components |
| P2 | Words/SRS | Words page depends on failing backend; weak words cannot be trusted | Add local SRS fallback and empty/error states that explain what happened | M | Words page, vocabulary API/store |
| P2 | Lesson pedagogy | Lesson has content but needs stronger guided teaching sequence | Add micro-steps: hear, understand, replace, speak, quiz, review | M-L | Lesson page, lesson data |
| P2 | Whale coach | Whale is mostly decorative/textual | Add contextual coaching moments and visual scenes per word/pattern | M | Lesson/practice UI, assets |
| P2 | Mobile layout | Dense controls and sticky bottom nav risk accidental taps | Audit mobile hit targets, bottom spacing, safe areas, and scroll positions | M | Layout, nav, practice pages, shadowing page |
| P3 | Console warnings | Framer Motion and React Router future warnings | Update motion API and opt into/test router future flags | S-M | UI animation setup, router setup |
| P3 | Asset preload | Whale logo preload warning | Adjust preload `as` value or remove unused preload | S | HTML/head/assets |
| P3 | Copy polish | Some cards have long repeated lesson titles | Shorten card labels and avoid duplicated title/subtitle strings | S | Learning path and English Speed setup data |

## 11. Recommended Next 10 Implementation Prompts

1. **Fix practice click/navigation bug**  
   Audit P-English practice pages and sticky bottom navigation. Reproduce the issue where flashcard answer check, quiz option click, English Speed start, and shadowing record actions route to `/profile` or `/learning-path`. Fix event bubbling, hitbox overlap, button/link nesting, z-index, and mobile safe-area spacing. Add regression tests.

2. **Create stable frontend demo fallback data**  
   Add graceful fallback behavior when `localhost:8080` is unavailable. Home, Words, profile stats, categories, vocabulary stats, and weak words should show local demo data or a clear offline state instead of repeated connection errors.

3. **Polish Quiz mode for beginner trust**  
   Remove debug labels from Quiz UI, fix initial score display from `0/0 đúng`, ensure each question has a valid correct answer, and add Vietnamese explanations after checking answers.

4. **Complete English Speed gameplay loop**  
   Make `/english-speed` reliably start a timed round, show one question at a time, validate one correct answer per question, update score/combo, show result review, and support retrying weak items.

5. **Upgrade Flashcard answer checking**  
   Improve Flashcard so Vietnamese meanings are accepted fairly with synonyms/diacritics tolerance, wrong answers show hints, correct answers reveal examples, and `Đã nhớ/Chưa nhớ` updates weak-word review state.

6. **Make daily missions real**  
   Connect mission cards to measurable actions. After learning 5 words, listening to 5 sentences, doing 3 shadowing lines, or finishing a speed game, update mission progress and dashboard state immediately.

7. **Strengthen Unit 1 guided lesson flow**  
   Turn Unit 1 into a step-by-step beginner session: vocabulary micro-set, pattern explanation, mini dialogue, practice checkpoint, final challenge, and next-day review prompt.

8. **Improve Shadowing recording and sentence practice**  
   Fix recording/playback, add permission fallback, mark each transcript sentence as practiced, allow repeating only one sentence, and show rhythm/pronunciation hints for Vietnamese learners.

9. **Build a real Words/SRS page**  
   Implement search, filters, weak words, due review, mastered words, and `Ôn từ này` flow using local fallback first, then backend sync when available.

10. **Run a mobile-first UX pass**  
   Audit home, learning path, practice cards, English Speed, Shadowing, and Words at small widths. Fix card wrapping, bottom nav overlap, touch target size, tall controls, and horizontal overflow.

## Final verdict

P-English has a promising learning-product foundation and a distinctive identity, but it should not be used for public demo testing yet. It is suitable for internal review only until the core practice interactions, English Speed start flow, shadowing recording, backend fallback, and mission/progress loops are reliable.
