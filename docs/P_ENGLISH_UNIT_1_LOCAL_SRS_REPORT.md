# P-English Unit 1 Local SRS Report

## Mục tiêu

Đã thêm hệ thống SRS local đơn giản cho Unit 1 để các mục sai/yếu quay lại sớm hơn, còn mục đúng được đẩy lịch ôn xa hơn. Toàn bộ dữ liệu nằm trong `localStorage`, không dùng backend/API/auth/database/env/runtime state.

## Files changed

- `apps/web/src/lib/p-english/lesson-progress.ts`
- `apps/web/src/components/practice/LessonFlashcardPractice.tsx`
- `apps/web/src/components/practice/LessonQuizPractice.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `docs/P_ENGLISH_UNIT_1_LOCAL_SRS_REPORT.md`

## Helper types/functions added

Trong `lesson-progress.ts` đã thêm:

- `SrsItemType`
- `SrsReviewResult`
- `LessonSrsItem`
- `LessonSrsReviewItem`
- `getNextReviewTime(result, currentLevel)`
- `markItemReviewed(lessonId, itemId, type, result)`
- `getDueReviewItems(lessonId, lesson)`
- `getWeakReviewItems(lessonId, lesson)`

`LessonProgress` được mở rộng thêm:

```ts
srs?: {
  items: Record<string, LessonSrsItem>;
};
```

`calculateLessonProgressSummary` cũng có thêm các field không phá vỡ shape cũ:

- `dueReviewCount`
- `weakReviewCount`
- `nextReviewAt`

## SRS localStorage shape

Key vẫn là:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Shape mới được merge cùng progress cũ:

```json
{
  "lessonId": "unit-1-greetings-introduction",
  "flashcard": {},
  "quiz": {},
  "srs": {
    "items": {
      "card-or-question-id": {
        "itemId": "card-or-question-id",
        "type": "flashcard",
        "level": 1,
        "lastReviewedAt": "2026-05-21T09:00:00.000Z",
        "nextReviewAt": "2026-05-22T09:00:00.000Z",
        "wrongCount": 0,
        "correctCount": 1
      }
    }
  }
}
```

## Scheduling rules

- Wrong: 10 phút.
- Level 0: 10 phút.
- Level 1: 1 ngày.
- Level 2: 3 ngày.
- Level 3: 7 ngày.
- Level 4: 14 ngày.
- Level 5+: 30 ngày.
- Correct tăng level +1, tối đa 5.
- Wrong giảm level -1, tối thiểu 0.

## Flashcard integration

`LessonFlashcardPractice` hiện gọi SRS khi người học đánh giá thẻ:

- `Đã nhớ` → `markItemReviewed(lesson.id, currentCard.id, 'flashcard', 'correct')`
- `Chưa nhớ` → `markItemReviewed(lesson.id, currentCard.id, 'flashcard', 'wrong')`

Đã thêm hỗ trợ route:

```text
/practice?lessonId=unit-1-greetings-introduction&mode=flashcard&review=due
```

Khi `review=due`:

- chỉ luyện các flashcard đã đến hạn theo `getDueReviewItems`;
- nếu chưa có thẻ đến hạn, hiển thị empty state: `Hiện chưa có thẻ đến hạn ôn.`;
- có nút `Luyện toàn bộ flashcard` và `Quay về bài học`.

## Quiz integration

`LessonQuizPractice` hiện gọi SRS khi người học kiểm tra câu trả lời:

- đúng → `markItemReviewed(lesson.id, current.id, 'quiz', 'correct')`
- sai → `markItemReviewed(lesson.id, current.id, 'quiz', 'wrong')`

Quiz scoring và summary cũ được giữ nguyên. Có guard để không đánh dấu lặp nếu câu đã được kiểm tra.

## LessonPage review dashboard behavior

`LessonPage` đã thêm card `Ôn tập thông minh` ngay gần dashboard `Tiến độ bài học`.

Card hiển thị:

- số mục đến hạn ôn;
- số mục yếu/cần củng cố;
- thời điểm ôn kế tiếp;
- giải thích: `Các mục sai hoặc yếu sẽ được đưa trở lại để ôn sớm hơn.`

CTA:

- Nếu có due item: `Ôn phần cần nhớ` → `/practice?lessonId={lesson.id}&mode=flashcard&review=due`
- Nếu chưa có due item: `Ôn flashcard toàn bộ` → `/practice?lessonId={lesson.id}&mode=flashcard`

## What is not covered yet

- Chưa tích hợp SRS sâu vào listening/reflex/typing/match/speed.
- `review=due` hiện ưu tiên flashcard due items; quiz due items được lưu và hiển thị trong helper/dashboard nhưng chưa có quiz due-only session riêng.
- Typing item mapping được bỏ qua vì ID task hiện không map chắc chắn về lesson data trong helper.
- Không có đồng bộ đa thiết bị vì scope là localStorage only.

## Build result

Đã chạy `npm run build` từ thư mục `Luyen Tu`.

Kết quả: build thất bại tại bước Vite web với lỗi đã biết/pre-existing:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

API TypeScript build đã chạy xong trước khi Vite web fail.

## TypeScript check result

Đã chạy `npx tsc -p apps/web/tsconfig.json --noEmit`.

Kết quả: TypeScript check thất bại bởi các lỗi đã biết ở file ngoài scope SRS:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

Không có lỗi TypeScript mới được báo trong các file SRS vừa chỉnh.

## Known Vite html-inline-proxy status

Lỗi Vite `html-inline-proxy` vẫn xuất hiện khi chạy build. Đây là lỗi đã biết/pre-existing liên quan path có khoảng trắng `Luyen Tu`; không sửa Vite config/index/build pipeline theo yêu cầu.

## Remaining risks

- SRS localStorage có thể bị người dùng xoá/reset thủ công.
- `review=due` chỉ lấy due flashcards nên nếu chỉ có due quiz item thì CTA flashcard due có thể không có thẻ để luyện.
- Các timestamp phụ thuộc đồng hồ thiết bị local.
