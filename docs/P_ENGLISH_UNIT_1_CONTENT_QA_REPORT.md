# P-English Unit 1 Content QA Report

## Mục tiêu

Audit và cải thiện nhẹ nội dung Unit 1 (`unit-1-greetings-introduction`), đồng thời thêm helper validate nội dung có thể tái sử dụng cho các bài sau.

## Files changed

- `apps/web/src/lib/p-english/lesson-content-data.ts`
- `apps/web/src/lib/p-english/lesson-content-validation.ts`
- `docs/P_ENGLISH_UNIT_1_CONTENT_QA_REPORT.md`

## Files created

- `apps/web/src/lib/p-english/lesson-content-validation.ts`
- `docs/P_ENGLISH_UNIT_1_CONTENT_QA_REPORT.md`

## Audit summary

### Vocabulary

- Unit 1 có đúng 18 vocabulary/chunk items.
- Nội dung phù hợp A1: greetings, name, origin, student/teacher/friend, polite phrases.
- Vietnamese meanings rõ ràng.
- Examples tự nhiên, ngắn, phù hợp beginner.
- `partOfSpeechOrType` có giá trị học tập thực tế: `greeting`, `sentence chunk`, `question chunk`, `social chunk`, `noun`, `proper noun`.
- Tags có ý nghĩa cho UI/practice/SRS.
- Không phát hiện duplicate vocabulary ids.
- Một số item gần nhau như `nice to meet you` và `nice to meet you too` là cố ý để reinforce social chunks.

### Sentence patterns

- Các pattern thực tế, đúng mục tiêu Unit 1.
- Đã cải thiện giải thích tiếng Việt để nhấn mạnh học theo chunk, không dịch từng chữ.
- Đã thêm vài ví dụ ngắn, tự nhiên, vẫn trong A1.

### Mini dialogues

- Dialogues ngắn, tự nhiên, phù hợp A1.
- Vietnamese translations rõ ràng.
- Focus phrases khớp mục tiêu chào hỏi/giới thiệu/hỏi nơi đến.
- Shadowing instructions hữu ích và không quá kỹ thuật.

### Grammar notes

- Beginner-friendly, không quá học thuật.
- Bao phủ đúng trọng tâm:
  - `I am = I’m`
  - `My name is...`
  - `What’s your name?`
  - `I’m from...`
- Đã thêm ví dụ nhẹ cho `I am = I’m` và `My name is...`.

### Pronunciation notes

- Hữu ích cho người học Việt Nam.
- Đã cải thiện wording để thực hành nghe-lặp lại cụ thể hơn.
- Không thêm IPA phức tạp ngoài dữ liệu đã có.

### Listening practice

- Mỗi item có question answerable.
- Mỗi answer nằm trong options.
- Text tự nhiên, ngắn, phù hợp speech synthesis.
- Rate/repeatRecommended phù hợp beginner.

### Reflex prompts

- `expectedEnglish` tự nhiên.
- `acceptableAnswers` có variants hợp lý, không over-accept quá rộng.
- Đã thêm variant `Where do you come from?` cho prompt hỏi nơi đến; vẫn liên quan trực tiếp và không làm content quá advanced.

### Quiz

- Mỗi question có id.
- Multiple-choice answers nằm trong options.
- Sentence-order answers build được từ words.
- Fill-blank answers rõ ràng.
- Match-meaning data hợp lệ.
- Đã bổ sung `explanationVi` cho các quiz còn thiếu hoặc cần giải thích rõ hơn.

### Flashcards

- Flashcard count khớp vocabulary count: 18/18.
- Front/back/example map trực tiếp từ vocabulary nên alignment tốt.

### Completion criteria

- `flashcardsReviewed: 18` không vượt quá số flashcard.
- `minimumQuizCorrect: 8` trong tổng `totalQuizQuestions: 10`, hợp lý cho beginner.
- `minimumReflexPromptsCompleted: 5` trong tổng `totalReflexPrompts: 8`, hợp lý.

## Content issues found

- Một số `sentencePatterns.vietnameseExplanation` còn hơi ngắn, chưa nhấn mạnh học theo chunk.
- Một số quiz questions thiếu `explanationVi`.
- Pronunciation notes có thể cụ thể hơn cho người học Việt Nam.
- Reflex prompt hỏi nơi đến chỉ có 1 acceptable answer ban đầu.

## Content issues fixed

- Cải thiện Vietnamese explanations cho sentence patterns.
- Thêm 3 ví dụ A1 tự nhiên vào sentence pattern/grammar examples.
- Cải thiện pronunciation notes với hướng dẫn nghe-lặp lại cụ thể hơn.
- Thêm acceptable variant cho reflex prompt `reflex-where-from`.
- Thêm/cải thiện `explanationVi` cho quiz sentence-order, multiple-choice và match-meaning questions.

## Validation helper added

Đã tạo `apps/web/src/lib/p-english/lesson-content-validation.ts` với:

- `LessonContentValidationWarning`
- `validateLessonContent(lesson)`
- `summarizeLessonValidation(warnings)`

Helper không được import vào UI, để tránh ảnh hưởng runtime/UI hiện tại.

## Validation checks implemented

- Metadata required fields.
- Duplicate IDs riêng theo từng collection:
  - vocabulary
  - flashcards
  - quizQuestions
  - sentenceOrderingTasks
  - fillBlankTasks
  - listeningPractice
  - speakingReflexPrompts
- Required string checks cho field quan trọng.
- Flashcard count phải bằng vocabulary count.
- Multiple-choice answer phải nằm trong options.
- Multiple-choice options length warning nếu `< 2`.
- Multiple-choice warning nếu thiếu `explanationVi`.
- Sentence ordering answer phải build được từ words sau normalization.
- Fill blank answer không được rỗng.
- Fill blank prompt nên có `___` hoặc `...`.
- Listening answer phải nằm trong options.
- Listening text warning nếu quá dài cho A1.
- Reflex expectedEnglish nên nằm trong acceptableAnswers.
- Reflex acceptableAnswers không nên rỗng.
- Completion criteria không vượt quá số item hiện có.

## Conceptual validation result for Unit 1

Sau audit và cải thiện:

- Expected errors: 0.
- Expected warnings: 0.
- Expected info: 0.

Lý do:

- 18 vocabulary items và 18 flashcards khớp nhau.
- Không phát hiện duplicate IDs trong các collection chính.
- Quiz answers hợp lệ theo options/words/prompt.
- Listening answers nằm trong options.
- Reflex expectedEnglish đều nằm trong acceptableAnswers.
- Completion criteria khớp số lượng hiện có.

## Remaining warnings/errors

Không còn content warnings/errors dự kiến cho Unit 1 theo helper mới.

## Unit 1 readiness before Unit 2

Unit 1 đã content-ready để làm nền trước khi thêm Unit 2. Nội dung vẫn giữ mức A1, có đủ dữ liệu cho lesson page, flashcard, quiz, listening, reflex, typing, match, speed, progress dashboard và local SRS.

## Build result

Đã chạy `npm run build` từ thư mục `Luyen Tu`.

Kết quả: build thất bại tại bước Vite web với lỗi đã biết/pre-existing:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

API TypeScript build đã chạy xong trước khi Vite web fail.

## TypeScript check result

Đã chạy `npx tsc -p apps/web/tsconfig.json --noEmit`.

Kết quả: TypeScript check thất bại do các lỗi đã biết ngoài scope content QA:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

Không có lỗi TypeScript mới được báo trong `lesson-content-data.ts` hoặc `lesson-content-validation.ts`.

## Known Vite html-inline-proxy status

Lỗi `[vite:html-inline-proxy] No matching HTML proxy module found` vẫn xuất hiện. Đây là lỗi đã biết/pre-existing liên quan path có khoảng trắng `Luyen Tu`; không chỉnh Vite config/index/build pipeline theo yêu cầu.
