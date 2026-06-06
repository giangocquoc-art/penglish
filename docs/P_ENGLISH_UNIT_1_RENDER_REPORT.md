# P-English Unit 1 Render Report

## Mục tiêu

Tạo trang bài học read-only chất lượng cao cho Unit 1 và làm cho bài học hiển thị tại route `/lessons/unit-1-greetings-introduction` trong shell Chakra UI hiện tại.

## Route đã thêm

- `/lessons/:lessonId`
- Route Unit 1: `/lessons/unit-1-greetings-introduction`
- Route được render trong cùng `NewShell` với `/home`, `/practice`, `/paths/:id`.

## Files đã tạo

- `apps/web/src/pages/LessonPage.tsx`
  - Render dữ liệu từ `getLessonById(lessonId)`.
  - Có fallback khi lesson không tồn tại.
  - Có helper an toàn `speakEnglish(text: string)` dùng Web Speech API với guard browser.
  - Có đầy đủ các phần:
    - Breadcrumb/top action.
    - Tổng quan bài học.
    - Mục tiêu sau bài học.
    - Vocabulary grid.
    - Sentence patterns.
    - Mini dialogues.
    - Grammar notes.
    - Pronunciation.
    - Listening preview với reveal answer.
    - Reflex preview với reveal answer.
    - Quiz preview với reveal answer.
    - Completion criteria.
    - Bottom CTA buttons sang `/practice?lessonId=...&mode=...`.
- `apps/web/src/components/lesson/RevealAnswer.tsx`
  - Component nhỏ dùng để ẩn/hiện đáp án cho các preview read-only.

## Files đã chỉnh sửa

- `apps/web/src/App.tsx`
  - Thêm import `LessonPage`.
  - Thêm route `/lessons/:lessonId` trong `NewShell`.
- `apps/web/src/pages/HomePage.tsx`
  - Thêm card entry point cho Unit 1 sau phần “Truy cập nhanh”.
  - CTA `Học bài 1` trỏ đến `/lessons/unit-1-greetings-introduction`.

## UI và dữ liệu

- Trang dùng dữ liệu Unit 1 từ `apps/web/src/lib/p-english/lesson-content-data.ts`.
- Bảng màu áp dụng theo P-English:
  - background `#F8FAFC`
  - card `white`
  - text `#0F172A`
  - muted `#64748B`
  - primary blue `#2563EB`
  - learning green `#22C55E`
  - border `#E2E8F0`
- Trang là read-only, không thay đổi engine PracticePage.
- CTA sang Practice chỉ truyền query params, không sửa logic Practice.

## Giới hạn phạm vi đã tuân thủ

- Không rewrite `PracticePage`.
- Không chỉnh backend.
- Không chỉnh auth/database/env/API keys/runtime state.
- Không chỉnh Vite config.
- Không chỉnh `index.html`.
- Không chỉnh build pipeline.

## Build

Đã chạy `npm run build` từ thư mục `Luyen Tu`.

Kết quả:

- API build: pass (`tsc -p tsconfig.json`).
- Web build: fail tại bước `vite build`.
- Lỗi web build:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Đánh giá: lỗi này trùng lỗi Vite `html-inline-proxy` đã biết trước đó và vẫn chứa path `Luyen Tu` có khoảng trắng. Trong phạm vi task này chỉ ghi nhận/document, không chỉnh Vite config, `index.html`, hoặc build pipeline.

## Ghi chú lỗi build đã biết

Nếu build xuất hiện lỗi Vite dạng `[vite:html-inline-proxy] No matching HTML proxy module found` với đường dẫn chứa `Luyen Tu`, lỗi này được xem là lỗi đã biết/trước đó và liên quan đến path có khoảng trắng. Không xử lý bằng cách thay đổi Vite config, `index.html`, hoặc build pipeline trong task này.
