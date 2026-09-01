# PooEnglish Content Audit

## 1. Tóm tắt nhanh

Audit này rà soát dữ liệu bài học PooEnglish hiện tại trong project. Nguồn runtime chính là [`apps/web/src/lib/p-english/lesson-content-data.ts`](../apps/web/src/lib/p-english/lesson-content-data.ts), nơi export [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193), [`pEnglishLessons`](../apps/web/src/lib/p-english/lesson-content-data.ts) và [`allPEnglishLessons`](../apps/web/src/lib/p-english/lesson-content-data.ts).

Kết quả chính:

- Runtime hiện có 81 bài trong [`allPEnglishLessons`](../apps/web/src/lib/p-english/lesson-content-data.ts): 5 bài handcrafted, 24 bài grammar generated, 52 bài reading generated.
- Không có bài nào thiếu quiz hoặc mục tiêu học tập theo dữ liệu runtime hiện tại.
- 24 bài grammar generated thiếu vocabulary.
- 52 bài reading generated thiếu mini dialogue.
- Shadowing chưa đồng nhất: nhiều bài runtime không có [`shadowingScript`](../apps/web/src/lib/p-english/lesson-content-data.ts:217), trong khi shadowing đang nằm ở các catalog riêng.
- Có một số từ vựng trùng giữa các bài; phần lớn có thể là lặp lại có chủ đích, nhưng nên chuẩn hoá bằng shared vocabulary catalog hoặc tagging.
- Có dữ liệu test/schema fixture không nối UI, nên giữ nhưng đánh dấu rõ là fixture, không phải lesson content production.

## 2. Danh sách file dữ liệu đang dùng

### 2.1 Runtime lesson chính

| File | Vai trò | Khuyến nghị |
|---|---|---|
| [`apps/web/src/lib/p-english/lesson-content-data.ts`](../apps/web/src/lib/p-english/lesson-content-data.ts) | Định nghĩa schema runtime [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193), chứa 5 bài handcrafted và gom bài generated vào [`allPEnglishLessons`](../apps/web/src/lib/p-english/lesson-content-data.ts). | Giữ làm runtime contract chính, nhưng nên tách schema/type ra file riêng nếu dữ liệu tiếp tục tăng. |
| [`apps/web/src/lib/p-english/grammarLessonAdapter.ts`](../apps/web/src/lib/p-english/grammarLessonAdapter.ts) | Adapter chuyển grammar source sang [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193). | Giữ. |
| [`apps/web/src/lib/p-english/readingAdapter.ts`](../apps/web/src/lib/p-english/readingAdapter.ts) | Adapter chuyển reading source sang [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193). | Giữ. |

### 2.2 Generated content catalogs

| File | Vai trò | Khuyến nghị |
|---|---|---|
| [`apps/web/src/data/grammar/generatedGrammarLessons.ts`](../apps/web/src/data/grammar/generatedGrammarLessons.ts) | 24 grammar source lessons. | Giữ, nhưng cần bổ sung hoặc nối vocabulary. |
| [`apps/web/src/data/reading/generatedReadingLessons.ts`](../apps/web/src/data/reading/generatedReadingLessons.ts) | 52 reading source lessons. | Giữ, nhưng không nên kỳ vọng có dialogue nếu reading là mode riêng. |
| [`apps/web/src/data/vocabulary/generatedCefrVocabulary.ts`](../apps/web/src/data/vocabulary/generatedCefrVocabulary.ts) | 452 vocabulary items và 4 vocabulary groups. | Giữ làm shared vocabulary catalog. Nên nối grammar/reading lessons vào catalog này. |
| [`apps/web/src/data/shadowing/generatedShadowingCatalog.ts`](../apps/web/src/data/shadowing/generatedShadowingCatalog.ts) | 47 generated shadowing items. | Giữ, nhưng nên gom vai trò với dedicated shadowing data. |
| [`apps/web/src/data/speech/generatedSpeechPrompts.ts`](../apps/web/src/data/speech/generatedSpeechPrompts.ts) | 111 speech prompts. | Giữ làm speech/reflex catalog riêng. |
| [`apps/web/src/data/learning/generatedUnifiedLearningPath.ts`](../apps/web/src/data/learning/generatedUnifiedLearningPath.ts) | 13 roadmap units nối nhiều source module: lessons, vocabulary, grammar, reading, shadowing, speech. | Giữ làm learning-path index chính. |

### 2.3 Shadowing riêng

| File | Vai trò | Khuyến nghị |
|---|---|---|
| [`apps/web/src/data/shadowingLessons.ts`](../apps/web/src/data/shadowingLessons.ts) | Dedicated shadowing lessons dùng bởi hub shadowing. | Không bỏ; đang active. Nên gom schema/metadata với generated shadowing catalog. |
| [`apps/web/src/lib/p-english/shadowing-data.ts`](../apps/web/src/lib/p-english/shadowing-data.ts) | Gom curated shadowing videos, dedicated shadowing lessons và generated shadowing videos. | Giữ như adapter layer, nhưng nên tránh tạo thêm nguồn shadowing mới trong file này. |
| [`apps/web/src/lib/p-english/shadowingAdapter.ts`](../apps/web/src/lib/p-english/shadowingAdapter.ts) | Adapter cho [`generatedShadowingCatalog`](../apps/web/src/data/shadowing/generatedShadowingCatalog.ts). | Giữ. |

### 2.4 Foundation48

| File | Vai trò | Khuyến nghị |
|---|---|---|
| [`apps/web/src/features/foundation48/foundation48Data.ts`](../apps/web/src/features/foundation48/foundation48Data.ts) | Entry data cho lộ trình 48 ngày, gom source index, summaries và deep lessons. | Giữ như một data family riêng, không trộn vào [`allPEnglishLessons`](../apps/web/src/lib/p-english/lesson-content-data.ts) nếu UX vẫn là lộ trình riêng. |
| [`apps/web/src/features/foundation48/foundation48DeepLessons.ts`](../apps/web/src/features/foundation48/foundation48DeepLessons.ts) | Nội dung deep/interactive cho Foundation48. | Giữ. |
| [`apps/web/src/features/foundation48/foundation48LessonSummaries.ts`](../apps/web/src/features/foundation48/foundation48LessonSummaries.ts) | Summary theo ngày. | Giữ. |
| [`apps/web/src/features/foundation48/foundation48SourceIndex.ts`](../apps/web/src/features/foundation48/foundation48SourceIndex.ts) | Source index cho 48 ngày. | Giữ. |
| [`apps/web/src/features/foundation48/foundation48Types.ts`](../apps/web/src/features/foundation48/foundation48Types.ts) | Type contract cho Foundation48. | Giữ. |

### 2.5 Fixture / validation / audit

| File | Vai trò | Khuyến nghị |
|---|---|---|
| [`apps/web/src/data/lessons/fixtures/schemaSmokeFixture.ts`](../apps/web/src/data/lessons/fixtures/schemaSmokeFixture.ts) | Fixture kiểm thử schema, ghi rõ không nối UI. | Giữ nhưng đánh dấu test fixture; không tính là content production. |
| [`apps/web/src/data/lessons/lessonSchema.ts`](../apps/web/src/data/lessons/lessonSchema.ts) | Schema khác với runtime [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193). | Có thể giữ cho import/validation, nhưng nên document rõ là import schema hay runtime schema. |
| [`scripts/audit-penglish-learning-data.cjs`](../scripts/audit-penglish-learning-data.cjs) | Audit learning data hiện có. | Giữ và mở rộng thêm completeness check nếu cần. |
| [`reports/penglish-learning-data-audit.md`](../reports/penglish-learning-data-audit.md) | Output audit hiện tại: 0 errors, 1 warning, 0 content quality issues. | Giữ như generated report. |

## 3. Field hiện có của mỗi bài runtime

Runtime lesson dùng schema [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193). Các field hiện tại gồm:

| Field | Bắt buộc | Ghi chú |
|---|---:|---|
| [`id`](../apps/web/src/lib/p-english/lesson-content-data.ts:194) | Có | ID bài học. |
| [`unitId`](../apps/web/src/lib/p-english/lesson-content-data.ts:195) | Có | ID unit. |
| [`unitTitle`](../apps/web/src/lib/p-english/lesson-content-data.ts:196) | Có | Tên unit. |
| [`titleVi`](../apps/web/src/lib/p-english/lesson-content-data.ts:197) | Có | Tiêu đề tiếng Việt. |
| [`titleEn`](../apps/web/src/lib/p-english/lesson-content-data.ts:198) | Có | Tiêu đề tiếng Anh. |
| [`subtitle`](../apps/web/src/lib/p-english/lesson-content-data.ts:199) | Có | Mô tả ngắn. |
| [`level`](../apps/web/src/lib/p-english/lesson-content-data.ts:200) | Có | CEFR/display level. |
| [`estimatedTime`](../apps/web/src/lib/p-english/lesson-content-data.ts:201) | Có | Thời lượng ước tính. |
| [`skillTags`](../apps/web/src/lib/p-english/lesson-content-data.ts:202) | Có | Skill labels. |
| [`learningObjectives`](../apps/web/src/lib/p-english/lesson-content-data.ts:203) | Có | Mục tiêu học tập. |
| [`vocabulary`](../apps/web/src/lib/p-english/lesson-content-data.ts:204) | Có | Từ vựng trong bài. |
| [`sentencePatterns`](../apps/web/src/lib/p-english/lesson-content-data.ts:205) | Có | Mẫu câu. |
| [`miniDialogues`](../apps/web/src/lib/p-english/lesson-content-data.ts:206) | Có | Hội thoại ngắn. |
| [`grammarNotes`](../apps/web/src/lib/p-english/lesson-content-data.ts:207) | Có | Ghi chú ngữ pháp. |
| [`pronunciationNotes`](../apps/web/src/lib/p-english/lesson-content-data.ts:208) | Có | Ghi chú phát âm. |
| [`listeningPractice`](../apps/web/src/lib/p-english/lesson-content-data.ts:209) | Có | Bài nghe. |
| [`speakingReflexPrompts`](../apps/web/src/lib/p-english/lesson-content-data.ts:210) | Có | Prompt phản xạ nói. |
| [`flashcards`](../apps/web/src/lib/p-english/lesson-content-data.ts:211) | Có | Flashcard. |
| [`quizQuestions`](../apps/web/src/lib/p-english/lesson-content-data.ts:212) | Có | Quiz multiple-choice/matching. |
| [`sentenceOrderingTasks`](../apps/web/src/lib/p-english/lesson-content-data.ts:213) | Có | Sắp xếp câu. |
| [`fillBlankTasks`](../apps/web/src/lib/p-english/lesson-content-data.ts:214) | Có | Điền chỗ trống. |
| [`matchPairs`](../apps/web/src/lib/p-english/lesson-content-data.ts:215) | Không | Matching pairs bổ sung. |
| [`englishSpeedPrompts`](../apps/web/src/lib/p-english/lesson-content-data.ts:216) | Không | Prompt luyện tốc độ nói. |
| [`shadowingScript`](../apps/web/src/lib/p-english/lesson-content-data.ts:217) | Không | Script shadowing trong lesson runtime. |
| [`commonMistakes`](../apps/web/src/lib/p-english/lesson-content-data.ts:218) | Không | Lỗi thường gặp. |
| [`realLifeSituations`](../apps/web/src/lib/p-english/lesson-content-data.ts:219) | Không | Tình huống thực tế. |
| [`gameMissions`](../apps/web/src/lib/p-english/lesson-content-data.ts:220) | Không | Mission/game task. |
| [`whaleCoachLines`](../apps/web/src/lib/p-english/lesson-content-data.ts:221) | Không | Coach copy. |
| [`finalMiniChallenge`](../apps/web/src/lib/p-english/lesson-content-data.ts:222) | Không | Challenge cuối bài. |
| [`reviewRules`](../apps/web/src/lib/p-english/lesson-content-data.ts:223) | Có | Quy tắc review/SRS. |
| [`completionCriteria`](../apps/web/src/lib/p-english/lesson-content-data.ts:224) | Có | Điều kiện hoàn thành bài. |

## 4. Nội dung bị thiếu theo dimension

### 4.1 Thiếu vocabulary

Có 24 bài thiếu vocabulary, toàn bộ là grammar generated:

- `grammar-a1-articles-a-an-the`
- `grammar-a2-quantifiers-many-much`
- `grammar-a2-each-every`
- `grammar-a2-some-any`
- `grammar-b1-irregular-verbs`
- `grammar-a2-third-person-singular`
- `grammar-b1-phrasal-verbs`
- `grammar-b1-modal-verbs`
- `grammar-a2-prepositions-in-on-at`
- `grammar-a1-be-present-simple`
- `grammar-b1-present-perfect-experience`
- `grammar-b2-conditionals-realistic-advice`
- `grammar-a1-there-is-there-are`
- `grammar-a1-can-for-ability`
- `grammar-a2-past-simple-regular`
- `grammar-a2-comparatives-everyday`
- `grammar-a2-going-to-plans`
- `grammar-b1-relative-clauses-people-things`
- `grammar-b1-gerunds-after-verbs`
- `grammar-b1-used-to-habits`
- `grammar-b1-passive-simple-processes`
- `grammar-b2-second-conditional-careful-advice`
- `grammar-b2-linking-ideas-contrast`
- `grammar-b2-reported-speech-feedback`

Nhận định: Đây không nhất thiết là lỗi nếu grammar lesson được thiết kế tách khỏi vocabulary, nhưng UI/runtime đang có field [`vocabulary`](../apps/web/src/lib/p-english/lesson-content-data.ts:204) bắt buộc nên nên cung cấp vocabulary rỗng có chủ đích hoặc nối vào [`generatedCefrVocabulary`](../apps/web/src/data/vocabulary/generatedCefrVocabulary.ts).

### 4.2 Thiếu hội thoại

Có 52 bài thiếu dialogue, toàn bộ là reading generated. Pattern này hợp lý nếu reading lesson là mode đọc hiểu, nhưng cần document rõ rằng [`miniDialogues`](../apps/web/src/lib/p-english/lesson-content-data.ts:206) không bắt buộc về mặt pedagogical cho reading lessons dù type đang bắt buộc array.

### 4.3 Thiếu shadowing

Shadowing thiếu trên nhiều bài runtime:

- 3 bài handcrafted không có [`shadowingScript`](../apps/web/src/lib/p-english/lesson-content-data.ts:217): `unit-1-greetings-introduction`, `unit-2-family-and-friends`, `unit-3-school-and-classroom`.
- Nhiều bài grammar generated không có [`shadowingScript`](../apps/web/src/lib/p-english/lesson-content-data.ts:217).
- Toàn bộ 52 bài reading generated không có [`shadowingScript`](../apps/web/src/lib/p-english/lesson-content-data.ts:217).

Nhận định: Đây là vấn đề thiết kế dữ liệu lớn nhất. Shadowing đang tồn tại ở 3 nơi: optional field trong [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193), dedicated lessons trong [`shadowingLessons.ts`](../apps/web/src/data/shadowingLessons.ts), và generated catalog trong [`generatedShadowingCatalog.ts`](../apps/web/src/data/shadowing/generatedShadowingCatalog.ts).

### 4.4 Thiếu quiz

Không phát hiện bài nào thiếu quiz nếu tính tổng [`quizQuestions`](../apps/web/src/lib/p-english/lesson-content-data.ts:212), [`sentenceOrderingTasks`](../apps/web/src/lib/p-english/lesson-content-data.ts:213) và [`fillBlankTasks`](../apps/web/src/lib/p-english/lesson-content-data.ts:214).

### 4.5 Thiếu mục tiêu học tập

Không phát hiện bài nào thiếu [`learningObjectives`](../apps/web/src/lib/p-english/lesson-content-data.ts:203).

## 5. Dữ liệu trùng, legacy hoặc chưa rõ vai trò

### 5.1 Từ vựng trùng

Các vocabulary term xuất hiện ở nhiều lesson runtime:

- `student`
- `teacher`
- `friend`
- `thank you`
- `classmate`
- `page`
- `friendly`
- `classroom`
- `notebook`
- `pencil`
- `homework`
- `board`
- `uniform`
- `slowly`
- `sore throat`
- `clinic`
- `understanding`

Nhận định: Trùng từ vựng không tự động là lỗi vì lặp lại theo ngữ cảnh có giá trị học tập. Tuy nhiên, nên chuẩn hoá bằng shared vocabulary ID hoặc đánh dấu intentional repetition để tránh drift về pronunciation, meaning hoặc examples.

### 5.2 Shadowing bị phân tán

Hiện có nhiều layer shadowing:

- [`shadowingScript`](../apps/web/src/lib/p-english/lesson-content-data.ts:217) trong lesson runtime.
- [`shadowingLessons`](../apps/web/src/data/shadowingLessons.ts) cho shadowing hub.
- [`generatedShadowingCatalog`](../apps/web/src/data/shadowing/generatedShadowingCatalog.ts) cho generated shadowing.
- [`curatedShadowingVideos`](../apps/web/src/lib/p-english/shadowing-data.ts) trong adapter/data layer.

Khuyến nghị: Không xoá layer nào ngay vì đều đang active hoặc có vai trò rõ. Nhưng cần một source-of-truth shadowing catalog, sau đó adapter xuất ra UI shape.

### 5.3 Schema fixture không phải content production

[`schemaSmokeFixture.ts`](../apps/web/src/data/lessons/fixtures/schemaSmokeFixture.ts) là fixture test schema, có ghi chú không nối UI. File này không nên tính vào lesson content production và không cần gom vào [`allPEnglishLessons`](../apps/web/src/lib/p-english/lesson-content-data.ts).

### 5.4 Hai hệ schema song song

Có ít nhất hai data contract:

- Runtime lesson: [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193).
- Import/schema validation lesson: [`lessonSchema.ts`](../apps/web/src/data/lessons/lessonSchema.ts).

Khuyến nghị: Giữ cả hai nếu phục vụ hai giai đoạn khác nhau, nhưng document rõ: import schema là staging/validation, runtime schema là UI contract.

## 6. File nên giữ, gom, bỏ hoặc đánh dấu legacy

### 6.1 Nên giữ

- [`apps/web/src/lib/p-english/lesson-content-data.ts`](../apps/web/src/lib/p-english/lesson-content-data.ts)
- [`apps/web/src/lib/p-english/grammarLessonAdapter.ts`](../apps/web/src/lib/p-english/grammarLessonAdapter.ts)
- [`apps/web/src/lib/p-english/readingAdapter.ts`](../apps/web/src/lib/p-english/readingAdapter.ts)
- [`apps/web/src/data/grammar/generatedGrammarLessons.ts`](../apps/web/src/data/grammar/generatedGrammarLessons.ts)
- [`apps/web/src/data/reading/generatedReadingLessons.ts`](../apps/web/src/data/reading/generatedReadingLessons.ts)
- [`apps/web/src/data/vocabulary/generatedCefrVocabulary.ts`](../apps/web/src/data/vocabulary/generatedCefrVocabulary.ts)
- [`apps/web/src/data/learning/generatedUnifiedLearningPath.ts`](../apps/web/src/data/learning/generatedUnifiedLearningPath.ts)
- [`apps/web/src/data/speech/generatedSpeechPrompts.ts`](../apps/web/src/data/speech/generatedSpeechPrompts.ts)
- [`apps/web/src/features/foundation48/foundation48Data.ts`](../apps/web/src/features/foundation48/foundation48Data.ts) và các file Foundation48 liên quan.
- [`scripts/audit-penglish-learning-data.cjs`](../scripts/audit-penglish-learning-data.cjs)

### 6.2 Nên gom lại hoặc chuẩn hoá vai trò

- Gom/chuẩn hoá shadowing: [`apps/web/src/data/shadowingLessons.ts`](../apps/web/src/data/shadowingLessons.ts), [`apps/web/src/data/shadowing/generatedShadowingCatalog.ts`](../apps/web/src/data/shadowing/generatedShadowingCatalog.ts), [`apps/web/src/lib/p-english/shadowing-data.ts`](../apps/web/src/lib/p-english/shadowing-data.ts), [`apps/web/src/lib/p-english/shadowingAdapter.ts`](../apps/web/src/lib/p-english/shadowingAdapter.ts).
- Tách schema/types khỏi data lớn trong [`lesson-content-data.ts`](../apps/web/src/lib/p-english/lesson-content-data.ts) nếu số bài tiếp tục tăng.
- Nối grammar vocabulary vào [`generatedCefrVocabulary.ts`](../apps/web/src/data/vocabulary/generatedCefrVocabulary.ts) bằng shared references thay vì duplicate embedded vocabulary.
- Document relationship giữa [`lessonSchema.ts`](../apps/web/src/data/lessons/lessonSchema.ts) và [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193).

### 6.3 Nên bỏ hoặc đánh dấu legacy/test-only

Không phát hiện file active content nào nên xoá ngay. Các file nên đánh dấu rõ vai trò:

- [`apps/web/src/data/lessons/fixtures/schemaSmokeFixture.ts`](../apps/web/src/data/lessons/fixtures/schemaSmokeFixture.ts): test-only fixture.
- [`reports/penglish-learning-data-audit.md`](../reports/penglish-learning-data-audit.md): generated audit output, không phải source data.
- [`reports/pooenglish-content-audit-snapshot.mjs`](../reports/pooenglish-content-audit-snapshot.mjs) và [`reports/pooenglish-content-audit-snapshot.json`](../reports/pooenglish-content-audit-snapshot.json): helper artifacts dùng cho audit này; có thể xoá sau khi report này được commit nếu không muốn giữ evidence.

## 7. Vấn đề chính của dữ liệu hiện tại

1. Shadowing chưa có một source-of-truth rõ ràng.
2. Grammar lessons thiếu vocabulary trong runtime shape.
3. Reading lessons thiếu dialogue, có thể hợp lý nhưng cần rule rõ theo lesson mode.
4. Vocabulary duplicate chưa có metadata phân biệt intentional repetition và duplicate ngoài ý muốn.
5. Runtime schema và import/schema fixture đang song song nhưng chưa được document đủ rõ.
6. File [`lesson-content-data.ts`](../apps/web/src/lib/p-english/lesson-content-data.ts) vừa chứa type, data thủ công, adapter aggregate và helper getter nên sẽ khó maintain khi dữ liệu tăng.

## 8. Đề xuất bước tiếp theo

1. Thêm field phân loại lesson mode, ví dụ `lessonMode`, để phân biệt vocabulary/grammar/reading/shadowing/listening lesson. Khi đó không cần coi mọi field rỗng là lỗi.
2. Chọn một shadowing source-of-truth và chỉ để các file còn lại làm adapter/output.
3. Bổ sung vocabulary references cho 24 grammar lessons từ [`generatedCefrVocabulary.ts`](../apps/web/src/data/vocabulary/generatedCefrVocabulary.ts).
4. Tạo vocabulary registry hoặc shared ID map để kiểm soát các term trùng.
5. Mở rộng [`scripts/audit-penglish-learning-data.cjs`](../scripts/audit-penglish-learning-data.cjs) để tự xuất completeness matrix theo vocabulary/dialogue/shadowing/quiz/objectives.
6. Tách [`EnglishLesson`](../apps/web/src/lib/p-english/lesson-content-data.ts:193) và related subtypes sang file schema riêng nếu tiếp tục scale content.
