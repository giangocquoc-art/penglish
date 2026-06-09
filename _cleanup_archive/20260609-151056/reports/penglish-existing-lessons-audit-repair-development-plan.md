# Rà soát bài học P-English hiện có và phương án sửa chữa/phát triển web

Generated: 2026-06-05
Scope: rà soát dữ liệu bài học runtime đang dùng trên web, kiểm tra integrity của roadmap/content, đánh giá chiều sâu dữ liệu bài học, và đề xuất hướng sửa chữa + phát triển.

## 1. Kết luận nhanh

Web hiện có nền dữ liệu khá lớn và đã build production thành công, nhưng vẫn còn một nhóm lỗi tồn đọng làm giảm độ tin cậy của lộ trình học:

- Build web: pass.
- Runtime learning-data audit: 7 lỗi integrity trong learning path.
- Runtime lesson validation: 100 lỗi + 11 warning nếu áp cùng rule validation hiện tại lên toàn bộ 81 bài runtime.
- Chiều sâu data theo lesson: không có lesson nào dưới ngưỡng depthScore 68, nhưng nhiều lesson/generated lesson còn yếu ở các lớp audio, context, multimodal, chunk/pattern theo tiêu chuẩn 10 lớp mới.
- Unit-level depth: trung bình 69; 1 unit còn mỏng, 2 unit nền cần bridge thêm.

Ưu tiên sửa trước: learning-path sourceModuleReference sai module/ID, sau đó chuẩn hóa validation cho adapter-generated lessons, sau đó thêm listening/speaking/shadowing bridge cho các cụm bài grammar/reading.

## 2. Audit đã chạy

### 2.1 Runtime learning data audit

Command đã chạy:

```bash
node scripts/audit-penglish-learning-data.cjs
```

Kết quả report sinh ra:

- `reports/penglish-learning-data-audit.json`
- `reports/penglish-learning-data-audit.md`

Counts:

| Nhóm dữ liệu | Số lượng |
|---|---:|
| Runtime lessons | 81 |
| Generated grammar lessons | 24 |
| Generated reading lessons | 52 |
| Vocabulary items | 452 |
| Vocabulary groups | 4 |
| Speech prompts | 111 |
| Shadowing items | 47 |
| Roadmap units | 13 |

Summary:

| Loại | Số lượng |
|---|---:|
| Errors | 7 |
| Warnings | 0 |
| Content quality issues | 0 |

### 2.2 Build validation

Command đã chạy:

```bash
npm run build --workspace apps/web
```

Kết quả:

- Exit code: 0.
- Build passed.
- 2792 modules transformed.
- Vite chỉ còn cảnh báo chunk-size > 500 kB, không phải lỗi compile.

### 2.3 Runtime lesson depth/validation check

Đã chạy thêm kiểm tra runtime lesson content bằng validator hiện có và engine chiều sâu dữ liệu bài học.

Summary:

| Chỉ số | Giá trị |
|---|---:|
| Lesson count | 81 |
| Lesson validation errors | 100 |
| Lesson validation warnings | 11 |
| Lesson validation info | 0 |
| Average unit depth score | 69 |
| Deep unit count | 8/13 |
| Thin unit count | 1/13 |

## 3. Lỗi tồn đọng nhóm A — Roadmap source integrity

### 3.1 Bản chất lỗi

Learning path đang khai báo một số `sourceModuleReference.module` không khớp với loại ID bên trong `sourceModuleReference.ids`.

Ví dụ:

- Unit khai báo module là `generated-speech` nhưng lại chứa ID `shadow-*`, vốn tồn tại trong `generated-shadowing`.
- Unit khai báo module là `generated-shadowing` nhưng lại chứa ID `speech-*`, vốn tồn tại trong `generated-speech`.

Vì script audit kiểm tra ID theo module đã khai báo, các ID này bị xem là missing.

### 3.2 7 lỗi cụ thể

| Unit | Module khai báo | ID bị lỗi | Nguyên nhân |
|---|---|---|---|
| `path-a1-shadow-pronounce` | `generated-speech` | `shadow-a1-asking-for-help` | ID này tồn tại trong shadowing catalog, không phải speech prompts |
| `path-a2-reading-shadowing` | `generated-shadowing` | `speech-a2-i-need-to-change-the-time` | ID này tồn tại trong speech prompts, không phải shadowing catalog |
| `path-b2-pronunciation-confidence` | `generated-speech` | `b2-if-i-were-responsible-for-the-plan-i-would-define-exp-064` | ID không có trong generatedSpeechPrompts theo audit hiện tại |
| `path-b2-pronunciation-confidence` | `generated-speech` | `b2-it-might-be-better-to-acknowledge-the-limitatio-exp-065` | ID không có trong generatedSpeechPrompts theo audit hiện tại |
| `path-b2-pronunciation-confidence` | `generated-speech` | `shadow-b2-learning-from-feedback` | ID này tồn tại trong shadowing catalog, không phải speech prompts |
| `path-b2-pronunciation-confidence` | `generated-speech` | `shadow-b2-problem-solving-meeting` | ID này tồn tại trong shadowing catalog, không phải speech prompts |
| `path-b2-pronunciation-confidence` | `generated-speech` | `shadow-b2-evaluating-a-learning-tool` | ID này tồn tại trong shadowing catalog, không phải speech prompts |

### 3.3 Phương án sửa nhóm A

Có 3 hướng:

#### Phương án A1 — Sửa nhanh, ít đụng schema

Giữ `sourceModuleReference` chỉ trỏ tới một module chính và loại bỏ ID khác module khỏi `sourceModuleReference.ids`, nhưng vẫn giữ trong `sourceIds` tổng hợp.

Ưu điểm:

- Sửa nhanh.
- Không thay type.
- Audit sẽ pass ngay.

Nhược điểm:

- `sourceModuleReference` chưa mô tả đủ bản chất một unit đa nguồn.

#### Phương án A2 — Tách unit đa nguồn thành 2 unit nhỏ

Ví dụ:

- A1 pronunciation speech unit.
- A1 shadowing unit.
- B2 speech confidence unit.
- B2 shadowed opinion unit.

Ưu điểm:

- Lộ trình rõ hơn.
- Mỗi unit có một nguồn chính sạch.

Nhược điểm:

- Tăng số unit, cần cân chỉnh UI/learning path.

#### Phương án A3 — Nâng schema roadmap thành multi-source references

Thay `sourceModuleReference` đơn bằng `sourceModuleReferences: UnifiedSourceModuleReference[]` hoặc thêm field phụ `supportingSourceModuleReferences`.

Ưu điểm:

- Đúng bản chất dữ liệu hiện tại: một unit học có thể kết hợp reading + speech + shadowing.
- Mở đường cho dashboard data-depth chính xác hơn.

Nhược điểm:

- Cần sửa engine/UI/audit script.

Khuyến nghị: dùng A1 cho bản sửa nóng; sau đó triển khai A3 trong phase phát triển roadmap-depth.

## 4. Lỗi tồn đọng nhóm B — Validation rule chưa phù hợp với generated/adapted lessons

### 4.1 Bản chất lỗi

Validator hiện tại đang áp rule `flashcards.length === vocabulary.length` cho mọi lesson.

Điều này phù hợp với handcrafted vocabulary-first lessons, nhưng không phù hợp với grammar lessons:

- Grammar adapter cố ý có `vocabulary: []`.
- Grammar adapter vẫn tạo 3 flashcards từ examples.
- Validator vì vậy báo `Flashcard count (3) must match vocabulary count (0).`

Ngoài ra, validator đang so `completionCriteria.totalQuizQuestions` chỉ với `quizQuestions.length`, trong khi adapter-generated grammar/reading lessons tính tổng practice question gồm:

- `quizQuestions.length`
- `fillBlankTasks.length`
- `sentenceOrderingTasks.length`

Vì vậy đa số generated lessons bị báo lỗi `totalQuizQuestions does not match quizQuestions length` dù thực tế completionCriteria đang tính theo tổng practice tasks.

### 4.2 Ảnh hưởng

- Nếu dùng validator hiện tại làm CI gate, CI sẽ fail giả cho generated lessons.
- Report lỗi bị nhiễu, khó phân biệt lỗi dữ liệu thật với khác biệt lesson type.
- Có nguy cơ dev sửa sai bằng cách giảm dữ liệu thay vì sửa rule.

### 4.3 Phương án sửa nhóm B

#### Phương án B1 — Sửa validator theo lesson type/content profile

Thêm phân loại:

- `vocabulary-first`: flashcard count nên match vocabulary count.
- `grammar-generated`: flashcards có thể sinh từ examples, vocabulary có thể empty.
- `reading-generated`: totalQuizQuestions nên tính tổng quiz + fillBlank + sentenceOrdering.
- `listening-authored`: cần listening items + explanations.

Rule mới:

- Nếu `lesson.vocabulary.length > 0`, flashcards nên match vocabulary.
- Nếu `lesson.vocabulary.length === 0` và `lesson.skillTags` có `Ngữ pháp`, cho phép flashcards từ examples.
- `completionCriteria.totalQuizQuestions` nên so với tổng practice assessment count, không chỉ `quizQuestions.length`.

#### Phương án B2 — Chuẩn hóa adapters để sinh metadata rõ hơn

Thêm field type-level hoặc runtime marker, ví dụ:

- `contentProfile: 'handcrafted' | 'generated-grammar' | 'generated-reading' | 'listening-authored'`

Ưu điểm:

- Validator chính xác hơn.
- UI có thể hiển thị nhãn data profile.
- Dashboard “chiều sâu data bài học” bớt phải suy luận từ IDs.

#### Phương án B3 — Tách validator thành 2 lớp

- `validateLessonSchemaIntegrity`: lỗi thật, dùng cho CI.
- `validateLessonPedagogyDepth`: warning/recommendation để phát triển data.

Khuyến nghị: triển khai B1 ngay, sau đó B2/B3 để phát triển hệ thống audit lâu dài.

## 5. Cảnh báo nhóm C — Duplicate normalized tokens trong sentence ordering

### 5.1 Bản chất

Có 11 warning dạng:

`Sentence-order ... contains duplicate normalized tokens; UI must track token ids.`

Đây không hẳn là lỗi nội dung. Với câu tiếng Anh tự nhiên, từ lặp là bình thường. Vấn đề chỉ nguy hiểm nếu UI so sánh token bằng text thay vì token ID.

### 5.2 Tình trạng hiện tại

Randomization utility đã có `SentenceOrderToken.id` theo questionId + index + normalized token, tức là có cơ chế phân biệt token trùng.

### 5.3 Phương án sửa nhóm C

- Kiểm tra các component practice sentence-order có dùng token ID khi chọn/sắp xếp hay không.
- Nếu đã dùng ID đầy đủ, hạ warning này xuống `info` trong validator.
- Nếu có nơi còn dùng word string làm key/identity, sửa sang dùng token ID.

## 6. Vấn đề nhóm D — Chiều sâu data bài học còn lệch kỹ năng

### 6.1 Theo lesson-level 10 layers

Không có lesson nào bị depthScore dưới 68, nhưng layerStats cho thấy các lớp yếu phổ biến:

| Layer | Weak/Total | Average score | Nhận xét |
|---|---:|---:|---|
| Mistake | 81/81 | 44 | Cần thêm/làm rõ common mistakes ở mọi lesson hoặc điều chỉnh scoring cho generated lessons |
| Audio | 76/81 | 5 | Grammar/reading lessons gần như không có listening/pronunciation/audio input |
| Context | 80/81 | 23 | Ít mini-dialogue/real-life situations ở nhiều lesson |
| Multimodal | 76/81 | 25 | Ít shadowing/speed/game mission ở phần lớn lesson |
| Chunk | 76/81 | 33 | Generated grammar/reading không phải lesson chunk-first nên scoring cần profile-aware |
| Assessment | 76/81 | 31 | Một số bài có assessment nhưng scoring đang chưa nhận đủ tổng task |
| Pattern | 76/81 | 46 | Reading/grammar có pattern nhưng cần mở rộng examples/substitution |
| Output | 76/81 | 48 | Cần thêm speaking/writing output thật hơn |
| Review | 52/81 | 67 | Review gần đạt nhưng cần tiêu chí SRS rõ hơn |
| Objective | 0/81 | 90 | Mục tiêu học đã tốt |

### 6.2 Theo missing skill stats

| Missing skill | Lesson count |
|---|---:|
| listening | 76 |
| speaking | 76 |

Điều này cho thấy phần lớn generated reading/grammar lessons đang mạnh về đọc/viết/quiz nhưng thiếu nghe/nói. Đây là direction phát triển web tiếp theo rất rõ.

### 6.3 Unit-level depth

Weakest units:

1. `path-a2-grammar-patterns`
   - depthScore: 44.
   - Missing: vocabulary, listening, shadowing, speaking.
   - Hành động: gắn speech prompt hoặc speaking reflex để người học nói ngay sau bài.
2. `path-a1-greetings-core`
   - depthScore: 55.
   - Missing: reading, shadowing.
   - Hành động: nối playlist shadowing cùng chủ đề để luyện nhịp câu.
3. `path-a1-family-school`
   - depthScore: 59.
   - Missing: reading, shadowing.
   - Hành động: thêm bridge reading/shadowing gia đình/lớp học.

## 7. Vấn đề nhóm E — Web build pass nhưng bundle còn nặng

Vite cảnh báo:

- `vendor-ui`: khoảng 532 kB.
- `index`: khoảng 644 kB.

Đây không phải lỗi compile nhưng ảnh hưởng performance, nhất là mobile.

Phương án:

- Lazy-load các page lớn hơn nữa.
- Tách data nặng theo route nếu hiện đang import vào bundle chính.
- Kiểm tra `unifiedLessonEngine` bundle vì đã lên khoảng 257 kB; cân nhắc tách adapters/data theo lazy route.
- Dùng `manualChunks` cho Chakra/vendor/data nếu cần.

## 8. Kế hoạch sửa chữa đề xuất

### Sprint 1 — Sửa lỗi integrity và validation noise

Mục tiêu: audit sạch lỗi thật, build vẫn pass.

Tasks:

1. Sửa `generatedUnifiedLearningPath` để `sourceModuleReference.ids` chỉ chứa ID đúng module, hoặc tách multi-source references.
2. Sửa `lesson-content-validation.ts` để completionCriteria so với tổng assessment tasks.
3. Sửa flashcard-vocabulary rule theo lesson profile.
4. Hạ duplicate-token warning xuống info nếu UI đã dùng token ID.
5. Chạy lại audit + build.

Expected result:

- Runtime learning-data audit: 0 errors.
- Lesson validation: giảm mạnh lỗi giả.
- Không làm mất dữ liệu bài học hiện có.

### Sprint 2 — Bổ sung depth cho grammar/reading lessons

Mục tiêu: biến generated lessons từ “đọc/quiz/type” thành lesson có vòng học input → output → review.

Tasks:

1. Với grammar lessons:
   - thêm pronunciation notes từ examples.
   - thêm speakingReflexPrompts sinh từ pattern.
   - thêm 1 mini dialogue ngắn dùng pattern.
2. Với reading lessons:
   - thêm listeningPractice từ passage excerpt.
   - thêm speaking reflex kiểu “tóm tắt ý chính bằng 1 câu”.
   - thêm commonMistakes/realLifeSituations profile-aware hơn.
3. Cập nhật 10-layer scoring để profile-aware, tránh phạt grammar/reading vì không phải vocabulary-first.

Expected result:

- Missing listening/speaking giảm mạnh.
- Audio/output/multimodal layer tăng.
- Practice page có nhiều mode thật hơn.

### Sprint 3 — Roadmap data-depth architecture

Mục tiêu: lộ trình phản ánh đúng bài học đa nguồn.

Tasks:

1. Nâng schema roadmap từ single source reference sang multi-source references.
2. Cập nhật audit script để validate nhiều source modules trong một unit.
3. Cập nhật Home/LearningPath UI để hiển thị “nguồn chính” + “nguồn bổ trợ”.
4. Tạo CTA thông minh theo nguồn yếu nhất của unit.

Expected result:

- Các unit đọc + shadowing + speech không còn phải ép vào một module.
- Dashboard data-depth trở nên chính xác và có thể hành động.

### Sprint 4 — Performance + UX QA

Mục tiêu: web học mượt hơn trên mobile.

Tasks:

1. Tách data/adapters nặng theo route.
2. Xem lại import path nào kéo nhiều generated data vào trang không cần thiết.
3. Browser QA các route chính:
   - `/`
   - `/learning-path`
   - `/lessons/:lessonId`
   - `/practice/:lessonId/:mode`
   - `/shadowing`
   - `/english-speed`
4. Chụp screenshot regression cho mobile/desktop.

Expected result:

- Chunk warning giảm hoặc có plan rõ.
- Mobile lesson/practice bớt tải nặng.

## 9. Ưu tiên sửa theo mức độ

### P0 — Sửa ngay

- Roadmap sourceModuleReference sai module/ID.
- Validation rule gây lỗi giả với generated lessons.

### P1 — Sửa trong phase tiếp theo

- Thiếu listening/speaking ở 76/81 lesson.
- Unit `path-a2-grammar-patterns` depthScore 44.
- Unit A1 greetings/family thiếu reading + shadowing bridge.

### P2 — Phát triển dài hơn

- Multi-source roadmap schema.
- Profile-aware lesson-depth scoring.
- Bundle/code-splitting optimization.
- Browser QA tự động hóa theo từng lesson cluster.

## 10. Đề xuất thứ tự triển khai ngay trong code

1. Sửa nhanh learning path source IDs để audit không còn 7 error.
2. Sửa validator để không báo false positive với grammar/reading adapter lessons.
3. Chạy lại:
   - `node scripts/audit-penglish-learning-data.cjs`
   - runtime lesson validation/depth check
   - `npm run build --workspace apps/web`
4. Sau khi validation sạch hơn, bắt đầu bổ sung listening/speaking bridge cho `path-a2-grammar-patterns`.

## 11. Tài liệu liên quan

- Runtime audit report: `reports/penglish-learning-data-audit.md`
- Runtime audit JSON: `reports/penglish-learning-data-audit.json`
- Runtime lesson depth check JSON: `reports/penglish-runtime-lesson-depth-check.json`
- Existing validator: `apps/web/src/lib/p-english/lesson-content-validation.ts`
- Learning path source: `apps/web/src/data/learning/generatedUnifiedLearningPath.ts`
- Grammar adapter: `apps/web/src/lib/p-english/grammarLessonAdapter.ts`
- Reading adapter: `apps/web/src/lib/p-english/readingAdapter.ts`
- 10-layer lesson depth engine: `apps/web/src/lib/p-english/unifiedLessonEngine.ts`
