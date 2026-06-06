# P-English Unit 1 Lesson Content Report

Ngày thực hiện: 2026-05-21

## 1. Mục tiêu

Tạo nền tảng nội dung local an toàn cho bài học P-English và thêm **một** bài học hoàn chỉnh đầu tiên:

- Lesson id: `unit-1-greetings-introduction`
- Unit id: `unit-1-greetings`
- Unit title: `Unit 1 — Chào hỏi và giới thiệu bản thân`
- Vietnamese title: `Chào hỏi và giới thiệu bản thân`
- English title: `Greetings and Self-introduction`
- Level: `Beginner / A1`
- Estimated time: `15–20 phút`

Phạm vi giữ đúng yêu cầu: không chỉnh auth, login, backend infrastructure, database, env, API keys; không sửa runtime backend state; không redesign toàn UI; không rewrite sâu `StudyPage` hoặc `PracticePage`.

## 2. Files created

| File | Nội dung |
|---|---|
| `Luyen Tu/apps/web/src/lib/p-english/lesson-content-data.ts` | Model TypeScript cho lesson content, dữ liệu bài Unit 1, helper functions `getLessonById` và `getLessonsByUnitId` |
| `Luyen Tu/docs/P_ENGLISH_UNIT_1_LESSON_CONTENT_REPORT.md` | Báo cáo nội dung bài học Unit 1 và kết quả build |

## 3. Files changed

| File | Thay đổi |
|---|---|
| `Luyen Tu/apps/web/src/lib/p-english/learning-path-data.ts` | Thêm optional fields vào `LearningPathUnit`: `lessonId`, `lessonCount`, `primarySkills`, `ctaLabel`; cập nhật Unit 1 để tham chiếu lesson id; thêm `learningPathLessonMap` |

## 4. Content model đã tạo

File `Luyen Tu/apps/web/src/lib/p-english/lesson-content-data.ts` định nghĩa các type chính:

- `LessonLevel`
- `SkillTag`
- `LessonDifficulty`
- `QuizQuestionType`
- `VocabularyItem`
- `SentencePattern`
- `MiniDialogue`
- `GrammarNote`
- `PronunciationNote`
- `ListeningPracticeItem`
- `SpeakingReflexPrompt`
- `FlashcardItem`
- `QuizQuestion`
- `SentenceOrderingTask`
- `FillBlankTask`
- `ReviewRules`
- `CompletionCriteria`
- `EnglishLesson`

Helper functions:

- `getLessonById(id)`
- `getLessonsByUnitId(unitId)`

## 5. Nội dung đã thêm cho Unit 1

Bài `unit-1-greetings-introduction` bao gồm:

- 6 learning objectives bằng tiếng Việt
- 18 vocabulary/chunk items
- 5 sentence patterns
- 3 mini dialogues
- 4 grammar notes
- 5 pronunciation notes
- 3 listening practice items thiết kế để có thể dùng với Web Speech API/speechSynthesis sau này
- 8 speaking/reflex prompts
- 18 flashcards tự sinh từ vocabulary/chunks
- 10 quiz questions mixed types
- 3 sentence ordering tasks
- 3 fill-in-the-blank tasks
- Review rules đơn giản
- Completion criteria rõ ràng

## 6. Wiring vào local learning path

Unit hiện có `unit-1-greetings` trong `Luyen Tu/apps/web/src/lib/p-english/learning-path-data.ts` đã được cập nhật an toàn bằng optional fields:

- `lessonId: 'unit-1-greetings-introduction'`
- `lessonCount: 1`
- `primarySkills: ['Từ vựng', 'Phản xạ', 'Nghe', 'Ôn tập']`
- `ctaLabel: 'Học bài 1'`

Đồng thời thêm mapping:

```ts
export const learningPathLessonMap: Record<string, string[]> = {
  'unit-1-greetings': ['unit-1-greetings-introduction'],
};
```

Cách này không phá vỡ exported type cũ vì các field mới đều optional.

## 7. Trạng thái visible trong UI

Hiện tại Unit 1 content là **data-only**.

Bài học mới chưa được render trực tiếp trong `/paths/:id` hoặc `/practice` vì task yêu cầu không rewrite sâu `StudyPage` hoặc `PracticePage`. File content đã sẵn sàng để UI sau này import bằng:

- `getLessonById('unit-1-greetings-introduction')`
- `getLessonsByUnitId('unit-1-greetings')`

## 8. Việc cần làm tiếp theo để render trong `/paths/:id`

Gợi ý bước tiếp theo an toàn:

1. Trong `Luyen Tu/apps/web/src/pages/StudyPage.tsx`, import `getLessonsByUnitId` hoặc `getLessonById`.
2. Xác định mapping giữa API path id và local unit id, hoặc tạo route local riêng cho unit id.
3. Render section nhỏ `Bài học liên quan` dưới hero/path stats.
4. Hiển thị lesson title, level, estimated time, skill tags, objectives và CTA `Bắt đầu bài học`.
5. Chưa cần build full learning engine trong bước này.

## 9. Việc cần làm tiếp theo để dùng trong `/practice`

Gợi ý bước tiếp theo:

1. Trong `Luyen Tu/apps/web/src/pages/PracticePage.tsx`, thêm local lesson selector hoặc nhận query param `lessonId`.
2. Dùng lesson data để feed cho Flashcard, Quiz, Listening, Reflex prompts.
3. Tạo UI practice từng mode riêng thay vì hardcode placeholder.
4. Tích hợp completion criteria sau khi có state/progress local hoặc backend.

## 10. Build result

Đã chạy build từ `Luyen Tu` bằng lệnh `npm run build`.

Kết quả: **FAIL**.

Chi tiết:

- API build (`tsc -p tsconfig.json`) chạy qua.
- Web build (`vite build`) thất bại với lỗi Vite HTML inline proxy.
- Lỗi chính:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Nhận định: đây là lỗi đã được audit trước đó và xuất hiện lại y hệt. Task này không chỉnh `index.html`, Vite config hoặc build pipeline, nên ghi nhận là lỗi build có sẵn/pre-existing. Không tự ý sửa Vite config vì phạm vi task là tạo nền tảng nội dung lesson và không thay đổi hạ tầng build.
