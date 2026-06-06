# P-English Unit 1 Typing Practice Report

## Mục tiêu

Triển khai chế độ Type / Dictation thật cho Unit 1 tại route:

- `/practice?lessonId=unit-1-greetings-introduction&mode=type`

Phạm vi chỉ bao gồm `type` mode. Không triển khai `match` hoặc `speed` trong task này.

## Files created

- `apps/web/src/components/practice/LessonTypingPractice.tsx`

## Files changed

- `apps/web/src/pages/PracticePage.tsx`

## PracticePage branch added

Đã thêm import:

```tsx
import { LessonTypingPractice } from '../components/practice/LessonTypingPractice';
```

Đã thêm branch cho `mode=type`:

```tsx
if (lessonId && mode === 'type') {
  if (!lesson) {
    return (...fallback UI...);
  }
  return <LessonTypingPractice lesson={lesson} />;
}
```

Đã cập nhật placeholder condition để `type` không còn rơi vào placeholder:

```tsx
if (lessonId && mode && mode !== 'flashcard' && mode !== 'quiz' && mode !== 'listen' && mode !== 'reflex' && mode !== 'type') {
```

Các mode chưa triển khai như `match` và `speed` vẫn đi vào placeholder.

## Route tested / target route

- `/practice?lessonId=unit-1-greetings-introduction&mode=type`

Route này hiện render `LessonTypingPractice` với dữ liệu local của Unit 1.

## Task types implemented

`LessonTypingPractice` tạo task pool từ 3 nguồn local trong `lesson-content-data.ts`:

1. Listen and type từ `lesson.listeningPractice`
   - id: `listen-type-${item.id}`
   - type: `listen-type`
   - promptVi: `item.question || "Nghe và gõ lại câu tiếng Anh"`
   - answer/sourceText: `item.text`

2. Fill blank từ `lesson.fillBlankTasks`
   - id: `fill-${task.id}`
   - type: `fill-blank`
   - prompt: `task.prompt`
   - answer: `task.answer`
   - hint: `task.hint`

3. Meaning to English từ vocabulary chunks được chọn
   - `hello`
   - `good-morning`
   - `my-name-is`
   - `im`
   - `whats-your-name`
   - `nice-to-meet-you`
   - `where-are-you-from`
   - `im-from`
   - `thank-you`
   - `goodbye`

Tổng task được giới hạn tối đa 16 task để giữ phiên học gọn.

## UI behavior

Đã triển khai:

- Start screen với title `Gõ câu`, tên bài học tiếng Việt/Anh, tổng số task và hướng dẫn học.
- Practice header có progress, số đúng, số sai và tip học.
- `listen-type` card:
  - Nhãn `Nghe và gõ lại`
  - Button `Nghe câu`
  - Button `Nghe chậm`
  - Không hiện đáp án trước khi kiểm tra.
- `fill-blank` card:
  - Hiện prompt có blank.
  - Hint collapsed mặc định.
  - Button `Gợi ý` để mở/đóng hint.
- `meaning-to-english` card:
  - Hiện nghĩa tiếng Việt.
  - Chỉ hiện `Nghe đáp án` sau khi kiểm tra/reveal.
- Feedback sau khi kiểm tra:
  - Correct: `Chính xác!`, màu xanh, hiện đáp án đúng và note đọc to.
  - Wrong: `Chưa đúng, kiểm tra lại thứ tự từ hoặc dấu nháy.`, màu đỏ, hiện answer của learner và đáp án đúng.
- Summary gồm tổng task, correct, wrong, percentage, message theo ngưỡng và danh sách câu sai.
- Restart wrong-only hoặc toàn bộ.
- Điều hướng summary:
  - `Ôn lại câu sai`
  - `Làm lại toàn bộ`
  - `Luyện nghe lại`
  - `Luyện phản xạ`
  - `Quay về bài học`

## Answer normalization rules

Hàm normalize áp dụng:

- đổi curly apostrophes `‘’` thành `'`
- đổi curly quotes `“”` thành `"`
- lowercase
- trim đầu/cuối
- collapse multiple spaces thành một space
- bỏ punctuation cuối câu `.`, `!`, `?`
- trim lại sau khi bỏ punctuation

Nhờ vậy các biến thể như `I’m` / `I'm`, `What’s` / `What's`, khác biệt hoa/thường, khoảng trắng thừa và punctuation cuối câu được chấp nhận. Logic vẫn so sánh exact normalized string nên không over-accept câu không liên quan.

## speechSynthesis behavior

Đã dùng browser `speechSynthesis` nội bộ, không dùng audio file hoặc API ngoài.

Safe helper:

- kiểm tra `typeof window !== "undefined"`
- kiểm tra `window.speechSynthesis`
- gọi `window.speechSynthesis.cancel()` trước khi speak mới
- dùng `SpeechSynthesisUtterance`
- `lang = "en-US"`
- normal rate `0.86`
- slow rate `0.72`

Với `listen-type`, speech đọc `sourceText`. Với meaning/fill sau reveal, speech đọc `answer`.

## Keyboard shortcuts

- `Enter`:
  - nếu chưa checked: kiểm tra câu hiện tại
  - nếu đã checked: sang câu tiếp theo / kết thúc summary
- `Escape`:
  - xóa input hiện tại trước khi kiểm tra
- Không can thiệp bất thường vào `textarea`, `select`, `contenteditable`; input typing vẫn cho nhập bình thường.

## localStorage progress

Key:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Shape thêm mới:

```json
{
  "typing": {
    "attempts": 1,
    "correctTaskIds": [],
    "wrongTaskIds": [],
    "lastScore": 0,
    "lastPercentage": 0,
    "lastCompletedAt": "..."
  }
}
```

Progress được merge vào object hiện có bằng spread, không overwrite các field mode khác như:

- `flashcard`
- `quiz`
- `listening`
- `reflex`

Nếu `localStorage` unavailable, mode vẫn chạy bằng state trong memory.

## Modes still placeholder

Các mode vẫn là placeholder trong task này:

- `match`
- `speed`

Không có thay đổi ngoài phạm vi với hai mode này.

## Preserved modes

Các mode đã có vẫn được giữ nguyên branch render trong `PracticePage`:

- `flashcard`
- `quiz`
- `listen`
- `reflex`

Generic `/practice` không có `lessonId` vẫn giữ luồng luyện tập chung hiện tại.

## Limitations

- Không có speech recognition hoặc microphone.
- Không có audio file thật; chỉ dùng browser `speechSynthesis`.
- Task order hiện theo thứ tự local data, chưa randomize.
- Answer checking là exact normalized match; không chấm điểm gần đúng theo edit distance.
- `match` và `speed` chưa được triển khai theo đúng scope task.

## Build result

Đã chạy:

```bash
npm run build
```

Kết quả:

- API build (`tsc -p tsconfig.json`) chạy xong.
- Web build (`vite build`) fail tại bước Vite trước khi bundle app đầy đủ.

Lỗi:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Exit code: `1`.

## Extra TypeScript check

Đã chạy thêm:

```bash
npx tsc -p apps/web/tsconfig.json --noEmit
```

Kết quả: fail với các lỗi TypeScript hiện có ở file khác, không trỏ vào `LessonTypingPractice.tsx` hoặc `PracticePage.tsx`:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

Các lỗi này nằm ngoài scope task typing nên không được sửa trong task này.

## Known Vite html-inline-proxy status

Lỗi `[vite:html-inline-proxy] No matching HTML proxy module found` vẫn xuất hiện. Đây là lỗi build đã biết/trước đó, liên quan path có space `Luyen Tu` trong Vite HTML inline proxy. Theo constraint của task, không chỉnh Vite config, `index.html` hoặc build pipeline.
