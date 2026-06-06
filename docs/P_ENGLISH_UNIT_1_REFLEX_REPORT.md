# P-English Unit 1 Reflex Practice Report

## Mục tiêu

Triển khai real Reflex practice cho Unit 1 tại route `/practice?lessonId=unit-1-greetings-introduction&mode=reflex`, dùng dữ liệu local từ `lesson.speakingReflexPrompts`. Người học nhìn prompt tiếng Việt và gõ nhanh câu tiếng Anh tương ứng.

## Files created

1. `apps/web/src/components/practice/LessonReflexPractice.tsx`
   - Component luyện phản xạ chính cho Unit 1.
   - Dùng Chakra UI và P-English color system.
   - Không dùng microphone, không speech recognition, không gọi API.
   - Có start screen, prompt card, hint toggle, answer checking, speechSynthesis mẫu, summary, restart wrong prompts, restart all, keyboard shortcuts, và localStorage progress merge.

2. `docs/P_ENGLISH_UNIT_1_REFLEX_REPORT.md`
   - Báo cáo triển khai reflex mode, route, normalization, speech behavior, keyboard, localStorage, limitations, và build result.

## Files changed

1. `apps/web/src/pages/PracticePage.tsx`
   - Import `LessonReflexPractice`.
   - Thêm branch cho `mode === 'reflex'`.
   - Giữ nguyên `mode === 'flashcard'`, `mode === 'quiz'`, và `mode === 'listen'`.
   - Cập nhật placeholder để chỉ còn áp dụng cho `type`, `match`, `speed` và các mode chưa triển khai khác.

## Exact PracticePage branch added

```tsx
if (lessonId && mode === 'reflex') {
  if (!lesson) {
    return (
      <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện phản xạ</Text>
          <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
          <HStack mt="6" wrap="wrap">
            <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
              Về trang chủ
            </Button>
            <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
              Quay lại bài học
            </Button>
          </HStack>
        </Box>
      </Box>
    );
  }
  return <LessonReflexPractice lesson={lesson} />;
}
```

## Route tested / verified by source wiring

| Route | Expected result | Status |
| --- | --- | --- |
| `/practice?lessonId=unit-1-greetings-introduction&mode=reflex` | Renders `LessonReflexPractice` with local Unit 1 prompts | Wired |
| `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard` | Keeps rendering `LessonFlashcardPractice` | Preserved |
| `/practice?lessonId=unit-1-greetings-introduction&mode=quiz` | Keeps rendering `LessonQuizPractice` | Preserved |
| `/practice?lessonId=unit-1-greetings-introduction&mode=listen` | Keeps rendering `LessonListeningPractice` | Preserved |
| `/practice` | Generic PracticePage remains active | Preserved |

## Reflex UX implemented

### Start screen

Shows:

- `Phản xạ nhanh`
- `lesson.titleVi`
- `lesson.titleEn`
- total prompts
- explanation: `Bạn sẽ thấy câu tiếng Việt và gõ nhanh câu tiếng Anh tương ứng. Ưu tiên bật ra cả cụm, không dịch từng chữ.`
- button: `Bắt đầu phản xạ`

### Header during practice

Shows:

- `Phản xạ nhanh`
- progress current / total
- correct count
- wrong count
- progress bar
- tip: `Đọc to câu đúng 2 lần trước khi sang câu tiếp.`

### Prompt card

For each `lesson.speakingReflexPrompts` item, shows:

- `promptVi` large
- difficulty badge
- hint collapsed by default
- input placeholder: `Gõ câu tiếng Anh...`
- `Kiểm tra` button
- `Gợi ý` button

After clicking `Gợi ý`, the UI shows `prompt.hint`.

## Answer checking normalization rules

The answer is checked against:

- `prompt.expectedEnglish`
- `prompt.acceptableAnswers`

Normalization implemented:

- lowercase
- trim
- collapse multiple spaces
- convert curly apostrophes to straight apostrophes
- convert curly double quotes to straight double quotes
- ignore final punctuation: `.`, `!`, `?`
- exact normalized match only, so unrelated answers are not over-accepted

Examples supported:

- `I'm Nam` and `I’m Nam` normalize the same.
- `what's your name` and `What’s your name?` match when expected/acceptable includes that phrase.
- `I am Nam` only matches if that exact answer exists in `acceptableAnswers` after normalization.

## Feedback behavior

If correct:

- green state
- message: `Phản xạ tốt!`
- shows `expectedEnglish`
- shows `Nghe câu mẫu`

If wrong:

- red state
- message: `Gần đúng rồi, xem lại cụm mẫu.`
- shows your answer
- shows `expectedEnglish`
- shows `acceptableAnswers`
- coaching note: `Hãy đọc to câu đúng 2 lần rồi bấm Câu tiếp theo.`

Buttons after check:

- `Câu tiếp theo`
- `Làm lại câu này`
- `Nghe câu mẫu`

## speechSynthesis behavior

Implemented for `Nghe câu mẫu`:

- speaks `prompt.expectedEnglish`
- uses browser `window.speechSynthesis` only
- guards `typeof window !== 'undefined'`
- checks `speechSynthesis` support
- cancels previous speech before speaking
- uses `SpeechSynthesisUtterance`
- sets `lang = 'en-US'`
- sets `rate = 0.86`
- does not crash if unsupported

## Keyboard shortcuts

Implemented:

| Shortcut | Behavior |
| --- | --- |
| `Enter` | check answer if not checked; next prompt if checked |
| `Escape` | clear current input before checking |

Guard behavior:

- Does not interfere with `textarea`, `select`, or `contenteditable`.
- The main text input handles `Enter` directly for a smooth typing/checking loop.

## Session behavior

Implemented:

- tracks correct prompt ids
- tracks wrong prompt ids
- tracks user answers per prompt
- summary appears at end
- `Ôn lại câu sai` restarts with wrong prompts only
- `Làm lại toàn bộ` restarts all prompts

## Summary screen

Shows:

- total prompts
- correct count
- wrong count
- percentage
- result message based on score
- wrong prompts with:
  - `promptVi`
  - your answer
  - `expectedEnglish`
  - `acceptableAnswers`

Summary actions:

- `Ôn lại câu sai`
- `Làm lại toàn bộ`
- `Luyện nghe lại` -> `/practice?lessonId={lesson.id}&mode=listen`
- `Quay về bài học` -> `/lessons/{lesson.id}`

## LocalStorage progress

Key:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Reflex shape added by merging into existing progress object:

```json
{
  "reflex": {
    "attempts": 1,
    "correctPromptIds": ["reflex-hello-im-nam"],
    "wrongPromptIds": [],
    "lastScore": 1,
    "lastPercentage": 100,
    "lastCompletedAt": "2026-05-21T00:00:00.000Z"
  }
}
```

Rules implemented:

- Saves when summary is reached.
- Merges with existing object using spread, so flashcard, quiz, and listening fields are not overwritten.
- If localStorage is unavailable, the mode still works in memory.
- Does not call backend.
- Does not require login.

## Modes still placeholder

The following modes are intentionally not implemented in this task:

- `type`
- `match`
- `speed`

## Limitations

- Audio quality and voice availability depend on browser/OS voices exposed to `speechSynthesis`.
- Reflex checking intentionally requires exact normalized matches from `expectedEnglish` or `acceptableAnswers`; semantic equivalents not listed are not accepted.
- No microphone or speech recognition is used by design.
- Build verification may still be blocked by the known Vite `html-inline-proxy` failure under the current folder path with a space.

## Build result

Command run from `Luyen Tu`:

```bash
npm run build
```

Result: failed at the web Vite build step with the known pre-existing path-related Vite HTML inline proxy error. The API TypeScript build completed before the web build started.

Relevant output:

```text
> pshare@1.0.0 build
> npm run build -w @pshare/api && npm run build -w @pshare/web

> build
> tsc -p tsconfig.json

> build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 1 modules transformed.
x Build failed in 174ms
error during build:
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Known error status:

- The known Vite `html-inline-proxy` error still appears.
- It is documented as pre-existing/path-related under the current folder path containing a space: `Luyen Tu`.
- No Vite config, `index.html`, or build pipeline changes were made.
- No backend, auth, database, env, API keys, or runtime state changes were made.
