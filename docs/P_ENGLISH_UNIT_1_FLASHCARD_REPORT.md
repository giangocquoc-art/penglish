# P-English Unit 1 Flashcard Report

## Mục tiêu

Nối URL `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard` vào một flow luyện flashcard thật cho Unit 1, dùng dữ liệu local `lesson.flashcards`, không gọi backend và không thay đổi behavior practice chung khi không có `lessonId`.

## Route/query đã hỗ trợ

Route hiện có:

- `/practice`

Query params đã xử lý:

- `lessonId`
- `mode`

URL test chính:

- `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard`

Behavior:

- Nếu `mode=flashcard`, `lessonId` tồn tại và `getLessonById(lessonId)` trả về lesson: render flow flashcard Unit 1.
- Nếu có `lessonId` nhưng không tìm thấy lesson: hiển thị thông báo “Không tìm thấy bài học để luyện flashcard” với nút về trang chủ và quay lại bài học.
- Nếu có `lessonId` nhưng `mode` khác `flashcard`: hiển thị placeholder “Chế độ này sẽ được nối với bài học ở bước sau.”
- Nếu không có `lessonId`: giữ nguyên PracticePage hiện tại gồm filter, stats, category selector và mode cards.

## Files created

- `apps/web/src/components/practice/LessonFlashcardPractice.tsx`

## Files changed

- `apps/web/src/pages/PracticePage.tsx`
  - Thêm `useSearchParams`.
  - Đọc `lessonId` và `mode`.
  - Dùng `getLessonById(lessonId)`.
  - Render `LessonFlashcardPractice` khi URL là lesson flashcard.
  - Không rewrite flow practice generic.

## Flashcard behavior

Component `LessonFlashcardPractice` hỗ trợ:

- Header:
  - `Flashcard`
  - `lesson.titleVi`
  - `lesson.titleEn`
  - tổng số thẻ
  - progress hiện tại `{currentIndex + 1} / {total}`
  - progress bar
  - tip học: “Đừng dịch từng chữ. Hãy nhớ cả cụm và đọc to câu ví dụ.”
- Main card:
  - Front: `flashcard.front`
  - Back: `flashcard.back`, `example`, `exampleMeaningVi`, `tags`
  - Click card để lật
  - Nút “Lật thẻ”
  - Keyboard Space để lật, bỏ qua khi đang gõ trong input/textarea/select/contenteditable
- Audio:
  - Nút “Nghe mẫu”
  - Mặt trước đọc `flashcard.front`
  - Mặt sau đọc `flashcard.example` nếu có, fallback về `flashcard.front`
  - Dùng `window.speechSynthesis`, không API, không external library
- Answer buttons:
  - Chỉ hiện sau khi lật thẻ
  - “Chưa nhớ”: thêm card vào needs-review trong session
  - “Đã nhớ”: thêm card vào remembered và bỏ khỏi needs-review
  - Không loop vô hạn; hết deck sẽ sang summary
- Navigation:
  - “Thẻ trước”
  - “Thẻ tiếp theo”
  - “Làm lại”
  - “Quay về bài học”
- Summary:
  - tổng thẻ
  - remembered count
  - needs-review count
  - percentage remembered
  - completed sessions
  - list thẻ cần ôn lại
  - nút “Ôn lại thẻ chưa nhớ”
  - nút “Làm lại toàn bộ”
  - nút “Quay về bài học”

## LocalStorage progress

Key sử dụng:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Shape lưu trữ:

```json
{
  "lessonId": "unit-1-greetings-introduction",
  "flashcard": {
    "reviewedCardIds": [],
    "rememberedCardIds": [],
    "needsReviewCardIds": [],
    "lastReviewedAt": "",
    "completedSessions": 0
  }
}
```

Rules đã áp dụng:

- Không cần login.
- Không gọi backend.
- Safe JSON parse.
- Nếu localStorage không khả dụng, flashcard vẫn chạy bằng memory state.
- Khi ghi progress, merge với object hiện có để tránh overwrite field ngoài `flashcard` nếu sau này có thêm.

## Chưa triển khai trong task này

- Quiz lesson mode.
- Listening lesson mode.
- Reflex lesson mode.
- Đồng bộ progress backend.
- Auth/user-specific progress.
- SRS thật hoặc scheduling dài hạn.

## Build

Đã chạy `npm run build` từ thư mục `Luyen Tu`.

Kết quả:

- API build: pass (`tsc -p tsconfig.json`).
- Web build: fail tại bước `vite build`.
- Lỗi web build:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Đánh giá: đây là lỗi Vite `html-inline-proxy` đã biết/trước đó và có path `Luyen Tu` chứa khoảng trắng. Đã document là pre-existing/path-related. Không chỉnh Vite config, `index.html`, hoặc build pipeline.

## Known build risk

Nếu xuất hiện lỗi:

```text
[vite:html-inline-proxy] No matching HTML proxy module found
```

thì ghi nhận là lỗi đã biết/trước đó, path-related do thư mục `Luyen Tu` có khoảng trắng. Không chỉnh Vite config, `index.html`, hoặc build pipeline trong task này.
