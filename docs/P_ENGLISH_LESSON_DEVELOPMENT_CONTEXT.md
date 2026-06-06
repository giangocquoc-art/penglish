# P-English — Context phát triển bài học chuyên sâu

Ngày audit: 2026-05-21
Phạm vi: chỉ audit/export hiện trạng, không đổi UI, không đổi logic app, không render Unit 1.

## 1. Kiến trúc hiện tại

P-English đang là monorepo trong `Luyen Tu`, gồm:

- Frontend React/Vite/TypeScript ở `apps/web`.
- Backend Express/TypeScript ở `apps/api`.
- Root script `npm run build` build API trước, sau đó build web.
- Frontend đang dùng Chakra UI, React Router, Axios, Framer Motion, lucide-react.
- Backend dùng Express, Zod, JWT, JSON runtime state, đồng bộ thêm vào SQLite qua `better-sqlite3`.

Luồng dữ liệu học hiện tại có 2 nguồn riêng:

1. Nguồn API/runtime từ `apps/api/data/state.json`:
   - `/paths/groups`
   - `/paths/summary`
   - `/paths/:id`
   - `/word-sets/:id/vocabularies`
   - `/vocabularies`
   - `/vocabularies/stats`
   - `/activity/calendar`
   - `/activity/leaderboard`

2. Nguồn lesson cục bộ mới cho P-English:
   - `apps/web/src/lib/p-english/lesson-content-data.ts`
   - `apps/web/src/lib/p-english/learning-path-data.ts`

Hiện tại Unit 1 đã tồn tại ở dạng data-only. Không có route render `/lessons/:lessonId` trong `App.tsx` tại thời điểm audit.

## 2. Route/layout hiện tại

Các route chính trong `apps/web/src/App.tsx`:

| Route | Component | Vai trò hiện tại | Mức phù hợp cho deep lesson |
|---|---|---|---|
| `/` | LandingPage | Trang landing | Không phải entry point bài học |
| `/home` | HomePage | Dashboard, nhóm lộ trình, path cards | Entry point tốt cho Unit/Lesson CTA sau này |
| `/paths/:id` | StudyPage | Chi tiết path API + word cards | Có thể tái dùng layout cho unit/path, nhưng hiện chỉ đọc API path id |
| `/practice` | PracticePage | Chọn mode luyện tập | Tốt để gắn quiz/flashcard/listening/reflex khi có adapter |
| `/games` | GamesPage | Mini-game placeholder | Tốt cho phản xạ/game hóa, chưa nối content thật |
| `/vocabularies`, `/words` | VocabPage | Từ vựng cá nhân API | Có thể import vocab từ lesson về sau |
| `/categories`, `/category-list` | CategoriesPage | Bộ từ API | Có route gap: card link `/categories/:id` nhưng App chưa khai báo route này |
| `/lessons/:lessonId` | Chưa có | Không render Unit 1 | Cần tạo ở task sau, không nằm trong audit này |

Shell mới gồm:

- `Sidebar.tsx`: desktop sidebar, brand P-English, nav chính.
- `Topbar.tsx`: streak, CTA Pro, mobile drawer toggle.
- `BottomNav.tsx`: mobile nav cố định.

## 3. Lesson content model hiện tại

File `apps/web/src/lib/p-english/lesson-content-data.ts` định nghĩa model bài học TypeScript thuần, không phụ thuộc backend.

### 3.1 Union types

- `LessonLevel`: các cấp CEFR hiển thị: Beginner/A1 đến Advanced/C1.
- `SkillTag`: nhãn kỹ năng: Từ vựng, Phản xạ, Nghe, Nói, Ôn tập, Ngữ pháp, Đọc, Viết.
- `LessonDifficulty`: `easy | medium | hard`.
- `QuizQuestionType`: `multiple-choice | fill-blank | sentence-order | match-meaning`.

### 3.2 Object types

- `VocabularyItem`: từ/cụm chính của bài, có `term`, `pronunciation`, `meaningVi`, `partOfSpeechOrType`, `example`, `exampleMeaningVi`, `difficulty`, `tags`.
- `SentencePattern`: mẫu câu, giải thích tiếng Việt, ví dụ hội thoại/ngữ cảnh.
- `MiniDialogue`: hội thoại ngắn, dòng nói, bản dịch Việt, focus phrases, chỉ dẫn shadowing.
- `GrammarNote`: ghi chú ngữ pháp đơn giản, giải thích tiếng Việt, ví dụ.
- `PronunciationNote`: ghi chú phát âm và ví dụ.
- `ListeningPracticeItem`: câu nghe, câu hỏi, options, answer, cấu hình speech synthesis.
- `SpeakingReflexPrompt`: prompt tiếng Việt để người học nói tiếng Anh, expected answer, acceptable answers, hint, difficulty.
- `FlashcardItem`: thẻ học gồm front/back/example/tags.
- `QuizQuestion`: câu hỏi đa dạng, dùng discriminated-by-type lỏng; hỗ trợ options, answer, explanation, pairs, words, vietnamese.
- `SentenceOrderingTask`: bài sắp xếp câu.
- `FillBlankTask`: bài điền chỗ trống.
- `ReviewRules`: quy tắc review sau học, khi sai/đúng, ưu tiên.
- `CompletionCriteria`: tiêu chí hoàn thành: flashcards, quiz, reflex prompts, repeats.
- `EnglishLesson`: aggregate root của toàn bộ bài học.

### 3.3 Helper functions

- `getLessonById(id)`: tìm bài theo lesson id.
- `getLessonsByUnitId(unitId)`: lấy danh sách bài thuộc unit.

## 4. Audit chất lượng Unit 1

Unit 1 hiện tại:

- `id`: `unit-1-greetings-introduction`
- `unitId`: `unit-1-greetings`
- Chủ đề: Chào hỏi và giới thiệu bản thân.
- Level: Beginner / A1.
- Thời lượng: 15–20 phút.
- Skill tags: Từ vựng, Phản xạ, Nghe, Nói, Ôn tập.

### Nội dung đã có

- 18 vocabulary/chunk items.
- 5 sentence patterns.
- 3 mini dialogues.
- 4 grammar notes.
- 5 pronunciation notes.
- 3 listening practice items.
- 8 speaking reflex prompts.
- 18 flashcards sinh từ vocabulary.
- 10 quiz questions.
- 3 sentence ordering tasks.
- 3 fill blank tasks.
- Review rules và completion criteria.

### Điểm mạnh

- Phù hợp người mới A1, ưu tiên chunk giao tiếp thay vì từ đơn lẻ.
- Có đủ vòng học cơ bản: nhận diện nghĩa, flashcard, nghe, nói, quiz, sắp xếp câu, điền chỗ trống.
- Có acceptable answers cho phản xạ nói, thuận lợi khi triển khai kiểm tra text/speech cơ bản.
- Có `speechSynthesis` config cho listening, phù hợp triển khai Web Speech API mà không cần backend.
- Có completion criteria rõ ràng, thuận lợi để tính progress.

### Thiếu cho deep lesson thật sự

- Chưa có `LessonPage.tsx` và route `/lessons/:lessonId`.
- Chưa có component layer riêng như `VocabularySection`, `DialogueSection`, `QuizSection`, `ReflexPracticeSection`.
- Chưa có engine chấm điểm, lưu progress, retry sai trong session.
- Chưa có adapter chuyển `EnglishLesson` sang API vocabulary/SRS format.
- Chưa có audio file thật; mới có text + speech synthesis metadata.
- Chưa có recording/speech recognition cho speaking.
- Chưa có model nhiều lesson trong một unit, prereq/unlock, next lesson.
- Chưa có persisted lesson progress trong backend hoặc localStorage.

## 5. Learning path data hiện tại

`apps/web/src/lib/p-english/learning-path-data.ts` chứa mock/local learning path cho P-English.

Kiểu `LearningPathUnit` đã có field optional để nối tới lesson:

- `lessonId?: string`
- `lessonCount?: number`
- `primarySkills?: LearningSkillType[]`
- `ctaLabel?: string`

Unit 1 trong local learning path đang trỏ tới `unit-1-greetings-introduction`. Đây là wire data-only, chưa được Home/Study/Route render thành trang lesson.

## 6. Fit UI hiện tại cho deep lessons

### `/home`

- Hiển thị hero/dashboard, quick actions, nhóm lộ trình từ API `/paths/groups` và `/paths/summary`.
- Các card hiện link tới `/paths/:id` theo API path id.
- Có thể thêm section local P-English path sau này, nhưng task này không thay đổi UI.

### `/paths/:id`

- `StudyPage.tsx` fetch `/paths/:id` và `/word-sets/:id/vocabularies`.
- Render word cards, progress, nút luyện tập.
- Hiện không hiểu local `unit-1-greetings` hoặc `lessonId`; nếu route `/paths/unit-1-greetings` được gọi sẽ không có API data trừ khi backend có id tương ứng.

### `/lessons/:lessonId`

- Chưa tồn tại trong router hiện tại.
- Đây là insertion point chính cho Unit 1 khi triển khai render.
- Nên dùng `getLessonById(lessonId)` từ local data trước, fallback 404 lesson-friendly.

### `/practice`

- Có 6 mode: Flashcard, Trắc nghiệm, Nghe, Gõ từ, Ghép cặp, Tốc độ.
- Hiện chỉ hiển thị màn hình “Đang khởi động...” khi chọn mode.
- Có filter category/level/order/count và stats từ API vocabulary.
- Có thể nhận query params về sau: `/practice?lessonId=...&mode=quiz`.

### `/games`

- Có 6 game cards: Memory Match, Word Scramble, Listening Challenge, Speed Quiz, Reflex Game, Champion Mode.
- Chưa nối dữ liệu từ Unit 1.
- Phù hợp triển khai game hóa sau khi có adapter lesson content -> game tasks.

### `/words` / `/vocabularies`

- VocabPage đọc `/vocabularies`, hiển thị table/search/filter.
- Dùng tốt cho từ vựng cá nhân, chưa có import lesson vocabulary.

## 7. API/backend data shape hiện tại

### `AppState`

Các phần liên quan bài học:

- `users`: user profile, coin, streak, vip.
- `groups`: nhóm lộ trình.
- `paths`: danh sách path summary.
- `pathWords`: map path id -> vocabulary items.
- `categories`: bộ từ cá nhân/public.
- `vocabularies`: từ vựng cá nhân.
- `activity`: streak/calendar/leaderboard.

### API endpoints quan trọng

- `GET /paths/groups` -> trả mảng groups trực tiếp.
- `GET /paths/summary` -> trả mảng paths trực tiếp.
- `GET /paths/:id` -> trả path trực tiếp.
- `GET /word-sets/:id/vocabularies` -> trả mảng words trực tiếp.
- `GET /paths/:id/progress` -> `{ total, learned, progress }`.
- `POST /paths/:id/progress` -> update learned cho word.
- `GET /paths/:id/srs/candidates` -> `{ data: { candidates } }`.
- `POST /paths/:id/srs/update` -> update learned/srsLevel.
- `GET /vocabularies` -> `{ data: vocabularies }`.
- `GET /vocabularies/stats` -> `{ data: { total, learned, progress } }`.
- `GET /activity/calendar` -> `{ data: activity }`.
- `POST /activity/log` -> tăng activity calendar/streak.

### Sample nhỏ từ `state.json`

Sample path:

```json
{
  "id": "4c21b5e7-61f4-4fa1-9dba-ad11b6fb4fb9",
  "name": "Vocabulary In Use Elementary",
  "difficulty": 1,
  "wordSetCount": 50,
  "group": { "name": "Sách IELTS" }
}
```

Sample path word:

```json
{
  "id": "4c21b5e7-61f4-4fa1-9dba-ad11b6fb4fb9-w1",
  "term": "Word 1",
  "meaning": "nghĩa 1",
  "pronunciation": "/word-1/",
  "partOfSpeech": "N",
  "example": "Sample 1",
  "learned": true,
  "srsLevel": 1
}
```

Sample category:

```json
{
  "id": "240684",
  "name": "Bộ từ vựng của tôi",
  "description": "Bộ từ vựng đầu tiên của bạn",
  "ispublic": false,
  "wordCount": 0,
  "user": { "name": "Quyen Tran" }
}
```

Sample user:

```json
{
  "id": "pshare-demo-001",
  "name": "Pshare",
  "coin": 120,
  "streak": 2,
  "vip": true
}
```

## 8. Missing pieces để phát triển deep lessons

1. Lesson route/page:
   - Tạo `apps/web/src/pages/LessonPage.tsx`.
   - Thêm route `/lessons/:lessonId` trong `App.tsx`.

2. Lesson UI component set:
   - Hero/overview.
   - Vocabulary/chunk cards.
   - Sentence pattern cards.
   - Dialogue + shadowing block.
   - Pronunciation notes + speak buttons.
   - Listening quiz.
   - Speaking/reflex prompts.
   - Quiz engine.
   - Review/summary state.

3. Progress state:
   - Local first: localStorage by `lessonId`.
   - Later backend: `/lessons/:lessonId/progress` hoặc reuse `/activity/log` + SRS endpoints.

4. Adapter layer:
   - Convert `VocabularyItem` -> `WordItem`/flashcard/game format.
   - Convert `QuizQuestion` -> UI quiz state.
   - Convert `SpeakingReflexPrompt` -> reflex game state.

5. Navigation:
   - Home/local learning path cards should link to `lessonId` only after route exists.
   - Study path could show local unit lessons if `id` is a local `unitId`.

6. QA/content governance:
   - Validate IDs unique.
   - Validate quiz answers present in options.
   - Validate flashcard count matches vocabulary count.
   - Validate completion criteria not exceeding available items.

## 9. Recommended implementation order

1. Tạo `LessonPage.tsx` đọc `lessonId` bằng `useParams`, gọi `getLessonById`.
2. Thêm route `/lessons/:lessonId` trong `App.tsx`.
3. Render read-only lesson preview theo section: overview, vocabulary, patterns, dialogues, quiz preview.
4. Tách component section nếu file phình lớn.
5. Thêm Home CTA/local path card link tới Unit 1.
6. Thêm local progress trong `localStorage`.
7. Nối `/practice?lessonId=...` cho Flashcard/Quiz/Listening.
8. Nối `/games?lessonId=...` cho Reflex/Memory/Speed.
9. Sau khi frontend ổn định, cân nhắc backend schema cho lesson progress.

## 10. Files nên gửi lại ChatGPT để phát triển lesson tiếp

Gửi các file sau để ChatGPT có đủ ngữ cảnh:

1. `apps/web/src/lib/p-english/lesson-content-data.ts`
2. `apps/web/src/lib/p-english/learning-path-data.ts`
3. `apps/web/src/App.tsx`
4. `apps/web/src/pages/HomePage.tsx`
5. `apps/web/src/pages/StudyPage.tsx`
6. `apps/web/src/pages/PracticePage.tsx`
7. `apps/web/src/pages/GamesPage.tsx`
8. `apps/web/src/pages/VocabPage.tsx`
9. `apps/web/src/components/Sidebar.tsx`
10. `apps/web/src/components/Topbar.tsx`
11. `apps/web/src/components/BottomNav.tsx`
12. `apps/web/src/api.ts`
13. `apps/api/src/main.ts` — chỉ sections `AppState`, path/vocab/activity endpoints.
14. `apps/api/data/state.json` — chỉ sample nhỏ, không gửi toàn bộ nếu không cần.
15. `docs/P_ENGLISH_LESSON_DEVELOPMENT_CONTEXT.md`
16. `docs/P_ENGLISH_LESSON_DEVELOPMENT_CONTEXT.json`
17. `docs/P_ENGLISH_SOURCE_SNAPSHOT_FOR_CHATGPT.md`

## 11. Build status

Kết quả `npm run build`:

- API build (`tsc -p tsconfig.json`): pass.
- Web build (`vite build`): fail.
- Lỗi lặp lại đúng lỗi đã biết từ trước:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found
```

Theo scope audit/export, không sửa Vite config, `index.html`, build pipeline hoặc runtime app logic.
