# P-English Unit 1 Listening Practice Report

## Mục tiêu

Triển khai real Listening practice cho Unit 1 tại route `/practice?lessonId=unit-1-greetings-introduction&mode=listen`, dùng dữ liệu local từ `lesson.listeningPractice` và `lesson.miniDialogues`, phát âm bằng browser `speechSynthesis`.

## Files created

1. `apps/web/src/components/practice/LessonListeningPractice.tsx`
   - Component luyện nghe chính cho Unit 1.
   - Dùng Chakra UI và P-English color system.
   - Không gọi API, không dùng external audio.
   - Có start screen, listening question flow, transcript toggle, dialogue listening section, summary screen, keyboard shortcuts, và localStorage progress merge.

2. `docs/P_ENGLISH_UNIT_1_LISTENING_REPORT.md`
   - Báo cáo triển khai listening mode, route, speech behavior, keyboard, localStorage, limitations, và build result.

## Files changed

1. `apps/web/src/pages/PracticePage.tsx`
   - Import `LessonListeningPractice`.
   - Thêm branch cho `mode === 'listen'`.
   - Giữ nguyên `mode === 'flashcard'` và `mode === 'quiz'`.
   - Cập nhật placeholder để chỉ còn áp dụng cho các mode chưa triển khai.

## Exact PracticePage branch added

```tsx
if (lessonId && mode === 'listen') {
  if (!lesson) {
    return (
      <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện nghe</Text>
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
  return <LessonListeningPractice lesson={lesson} />;
}
```

## Route tested / verified by source wiring

| Route | Expected result | Status |
| --- | --- | --- |
| `/practice?lessonId=unit-1-greetings-introduction&mode=listen` | Renders `LessonListeningPractice` with local Unit 1 data | Wired |
| `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard` | Keeps rendering `LessonFlashcardPractice` | Preserved |
| `/practice?lessonId=unit-1-greetings-introduction&mode=quiz` | Keeps rendering `LessonQuizPractice` | Preserved |
| `/practice` | Generic PracticePage remains active | Preserved |

## Listening UX implemented

### Header

Shows:

- `Luyện nghe`
- `lesson.titleVi`
- `lesson.titleEn`
- current progress count
- correct count
- progress bar
- learning tip: `Nghe ý chính trước, sau đó nghe lại từng cụm. Đừng nhìn transcript quá sớm.`

### Start screen

Shows:

- total listening items
- total dialogues
- explanation: `Bạn sẽ nghe câu tiếng Anh, chọn đáp án, rồi xem transcript sau khi trả lời.`
- button: `Bắt đầu luyện nghe`

### Listening card

For each `lesson.listeningPractice` item, shows:

- item number
- audio buttons: `Nghe lần 1`, `Nghe chậm`, `Nghe lại`
- question
- option buttons
- `Kiểm tra`

Transcript and correct answer are not revealed initially.

### Answer checking

After checking:

- Correct answer shows `Nghe tốt!`
- Wrong answer shows `Chưa đúng, nghe lại chậm hơn nhé.`
- Reveals correct answer and transcript
- Shows note: `Đọc transcript một lần, sau đó bấm Nghe lại và nhắc theo.`
- Shows buttons: `Câu tiếp theo`, `Nghe lại`, `Làm lại câu này`

### Transcript toggle

Implemented:

- `Hiện transcript`
- `Ẩn transcript`

Default behavior:

- hidden before checking
- visible after checking
- can be manually shown after at least one listen

## speechSynthesis behavior

Implemented with browser-only speech synthesis:

- Uses `window.speechSynthesis`
- Guards `typeof window !== 'undefined'`
- Guards `speechSynthesis` support
- Uses `SpeechSynthesisUtterance`
- Cancels previous speech before speaking
- Sets `lang = 'en-US'`
- Does not crash if unsupported
- Shows unsupported message: `Trình duyệt này chưa hỗ trợ nghe mẫu.`

Rates:

| Button | Text | Rate |
| --- | --- | --- |
| `Nghe lần 1` | `item.text` | `0.9` |
| `Nghe chậm` | `item.text` | `0.72` |
| `Nghe lại` | `item.text` | `0.85` |
| `Nghe toàn bộ hội thoại` | joined English dialogue lines | `0.86` |
| line-level `Nghe` | single dialogue line | `0.86` |

## Dialogue listening section

After the final listening item is checked, the UI shows `Hội thoại luyện nghe`.

For each `miniDialogue`, it includes:

- dialogue title
- `Nghe toàn bộ hội thoại`
- each English line with `Nghe`
- Vietnamese translation collapsed by default
- focus phrases
- `suggestedShadowingInstruction`

No external audio files are used.

## Summary screen

After all listening items are done, summary shows:

- total questions
- correct count
- wrong count
- percentage
- listened dialogue count
- recommendation based on score
- wrong items with question, correct answer, and transcript

Summary actions:

- `Nghe lại câu sai`
- `Làm lại toàn bộ`
- `Luyện phản xạ` -> `/practice?lessonId={lesson.id}&mode=reflex`
- `Quay về bài học` -> `/lessons/{lesson.id}`

## Keyboard shortcuts

Implemented:

| Shortcut | Behavior |
| --- | --- |
| `1`–`4` | choose option |
| `Enter` | check answer, or go next after checked |
| `Space` | replay current audio at rate `0.85` |

Typing target guard is included for `input`, `textarea`, `select`, and `contenteditable`.

## LocalStorage progress

Key:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Listening shape added by merging into existing progress object:

```json
{
  "listening": {
    "attempts": 1,
    "completedItemIds": ["listening-name-nam"],
    "correctItemIds": ["listening-name-nam"],
    "wrongItemIds": [],
    "lastScore": 1,
    "lastPercentage": 100,
    "lastCompletedAt": "2026-05-21T00:00:00.000Z"
  }
}
```

Rules implemented:

- Saves when summary is reached.
- Merges with existing object using spread, so flashcard and quiz fields are not overwritten.
- If localStorage is unavailable, the mode still works in memory.
- Does not call backend.
- Does not require login.

## Modes still placeholder

The following modes are intentionally not implemented in this task:

- `reflex`
- `type`
- `match`
- `speed`

## Limitations

- Audio quality and voice availability depend on the browser/OS voices exposed to `speechSynthesis`.
- Dialogue sequence is implemented safely by joining English lines with punctuation pauses instead of managing asynchronous utterance queues.
- Build verification is limited by the known Vite `html-inline-proxy` failure under the current folder path with a space.

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
x Build failed in 178ms
error during build:
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Known error status:

- The known Vite `html-inline-proxy` error still appears.
- It is documented as pre-existing/path-related under the current folder path containing a space: `Luyen Tu`.
- No Vite config, `index.html`, or build pipeline changes were made.
- No backend, auth, database, env, API keys, or runtime state changes were made.
