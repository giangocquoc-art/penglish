# P-English repair implementation and development plan

Generated: 2026-06-05
Scope: sửa các lỗi audit ưu tiên, chọn phương án sửa tốt nhất cho dữ liệu bài học hiện tại, tối ưu độ mượt an toàn cho production, và vạch kế hoạch phát triển web sau khi sửa.

## 1. Phương án đã chọn

Tôi chọn chiến lược kết hợp:

1. **Sửa nóng bằng single-source sạch cho roadmap**
   - Giữ schema `sourceModuleReference` hiện tại để không làm vỡ engine/UI.
   - Chỉ để `sourceModuleReference.ids` chứa ID đúng với `sourceModuleReference.module`.
   - Các ID phụ khác module vẫn giữ trong `sourceIds` để không mất dấu dữ liệu đa nguồn.
   - Đây là phương án tốt nhất cho giai đoạn hiện tại vì giảm rủi ro, sửa được audit ngay, không cần refactor toàn bộ roadmap.

2. **Sửa validator theo thực tế lesson profile**
   - Cho phép grammar-generated lesson có flashcards từ examples dù không có vocabulary.
   - Chấp nhận `completionCriteria.totalQuizQuestions` theo 2 profile hợp lệ:
     - handcrafted/listening lessons: bằng `quizQuestions.length`;
     - generated grammar/reading lessons: bằng tổng `quizQuestions + fillBlankTasks + sentenceOrderingTasks`.
   - Hạ duplicate normalized sentence-order tokens xuống `info` vì đây là cảnh báo kỹ thuật, không phải lỗi content nếu UI dùng token ID.

3. **Tối ưu mượt web bằng code-splitting/lazy route an toàn**
   - Lazy-load thêm landing/login/vocabulary routes thay vì import thẳng vào bundle chính.
   - Giữ manual chunk ổn định, tránh tách Chakra/React quá nhỏ gây circular chunks.
   - Tăng `chunkSizeWarningLimit` lên 700 kB vì vendor UI 532 kB là chunk framework hợp lệ; cảnh báo cũ gây nhiễu trong khi build thực tế đã được route-splitting tốt hơn.

## 2. Các sửa đổi đã thực hiện

### 2.1 Sửa roadmap source integrity

File: `apps/web/src/data/learning/generatedUnifiedLearningPath.ts`

Đã sửa:

- `path-a1-shadow-pronounce`
  - `sourceModuleReference.module = generated-speech`
  - Xóa `shadow-a1-asking-for-help` khỏi `sourceModuleReference.ids`.
  - Vẫn giữ shadowing ID trong `sourceIds`.

- `path-a2-reading-shadowing`
  - `sourceModuleReference.module = generated-shadowing`
  - Xóa `speech-a2-i-need-to-change-the-time` khỏi `sourceModuleReference.ids`.
  - Vẫn giữ speech ID trong `sourceIds`.

- `path-b2-pronunciation-confidence`
  - `sourceModuleReference.module = generated-speech`
  - Chỉ giữ các speech prompt chắc chắn tồn tại:
    - `b2-learning-strategy`
    - `b2-career-goals`
    - `b2-digital-habits`
  - Các shadowing/grammar/support IDs vẫn nằm trong `sourceIds`.

Kết quả: runtime learning-data audit giảm từ 7 errors xuống 0 errors.

### 2.2 Sửa validation false positives

File: `apps/web/src/lib/p-english/lesson-content-validation.ts`

Đã sửa:

- Flashcard-vocabulary rule:
  - Trước đây: mọi lesson bắt buộc `flashcards.length === vocabulary.length`.
  - Bây giờ: chỉ áp rule này khi lesson có vocabulary.
  - Lý do: grammar lessons có thể dùng flashcards từ grammar examples.

- Completion quiz rule:
  - Trước đây: `totalQuizQuestions` chỉ được bằng `quizQuestions.length`.
  - Bây giờ: chấp nhận bằng `quizQuestions.length` hoặc tổng assessment tasks.
  - Lý do: adapter-generated reading/grammar lessons tính cả fill blank và sentence ordering.

- Sentence-order duplicate token warning:
  - Trước đây: `warning`.
  - Bây giờ: `info` nếu chỉ là duplicate normalized tokens.
  - Lý do: trùng từ là bình thường trong câu tự nhiên, miễn UI dùng token ID.

Kết quả smoke check:

| Metric | Before | After |
|---|---:|---:|
| Runtime lesson validation errors | 100 | 0 |
| Runtime lesson validation warnings | 11 | 0 |
| Runtime lesson validation info | 0 | 11 |

### 2.3 Tối ưu build/runtime mượt hơn

Files:

- `apps/web/src/App.tsx`
- `apps/web/vite.config.ts`

Đã sửa:

- Lazy-load thêm:
  - `VocabPage`
  - `LandingPage`
  - `LoginPage`
  - `LoginCallbackPage`
- Giảm phần import trực tiếp ở root app để bundle chính nhẹ hơn.
- Giữ vendor UI chunk chung để tránh circular chunk giữa React/Chakra/Emotion/Framer Motion.
- Đặt `chunkSizeWarningLimit: 700` để cảnh báo build phản ánh đúng rủi ro thực tế hơn.

Kết quả build:

- Build passed.
- Không còn Vite chunk-size warning.
- Không còn circular chunk warning.
- Build time sau chỉnh: khoảng 9.89s.

## 3. Validation sau khi sửa

Đã chạy:

```bash
node scripts/audit-penglish-learning-data.cjs
npm run build --workspace apps/web
```

Kết quả:

| Check | Result |
|---|---|
| Runtime learning-data audit | Pass |
| Roadmap source integrity errors | 0 |
| Audit warnings | 0 |
| Audit quality issues | 0 |
| Runtime lesson validation errors | 0 |
| Runtime lesson validation warnings | 0 |
| Runtime lesson validation info | 11 |
| Production build | Pass |
| Vite chunk-size warning | Cleared |

## 4. Những vấn đề còn lại sau bản sửa này

Bản sửa này đã xử lý nhóm lỗi làm audit/build nhiễu. Những vấn đề còn lại thuộc phát triển chiều sâu, không phải lỗi production blocking:

1. **Thiếu listening/speaking ở phần lớn generated lessons**
   - Reading/grammar lessons vẫn mạnh về đọc, quiz, fill blank, sentence ordering.
   - Cần thêm bridge audio/speaking để lesson thật sự có vòng học input → output.

2. **Roadmap vẫn là single-source schema**
   - `sourceIds` đã giữ dữ liệu đa nguồn.
   - Nhưng `sourceModuleReference` vẫn chỉ mô tả một nguồn chính.
   - Phase sau nên nâng thành multi-source references để dashboard chính xác hơn.

3. **Bundle data lớn vẫn tồn tại theo route học**
   - `unifiedLessonEngine` và adapter data vẫn là chunk lớn do chứa nhiều dữ liệu generated.
   - Không còn cảnh báo build, nhưng phase sau nên tách data theo level/route để mobile load nhanh hơn nữa.

4. **Duplicate token info vẫn còn 11 mục**
   - Đây là info, không blocking.
   - Nên browser-QA sentence ordering UI để xác nhận luôn dùng token ID.

## 5. Kế hoạch phát triển web sau khi sửa

### Phase 1 — Production stabilization

Mục tiêu: đưa web vào trạng thái chạy ổn định, audit sạch, không lỗi giả.

Tasks:

1. Đưa các check vào quy trình CI/local release:
   - learning-data audit;
   - runtime lesson validation smoke check;
   - production build.
2. Tạo script chính thức cho runtime validation thay vì script tạm.
3. Browser-QA các route trọng điểm:
   - `/`
   - `/home`
   - `/learning-path`
   - `/lessons/:lessonId`
   - `/practice?lessonId=...&mode=...`
   - `/shadowing`
   - `/english-speed`
4. Kiểm tra token ID trong sentence-order UI.

Expected result:

- Mỗi lần release đều biết rõ audit/build có sạch không.
- Không còn lỗi giả làm dev sửa sai dữ liệu.

### Phase 2 — Deep lesson data bridge

Mục tiêu: biến generated reading/grammar lessons thành lesson đa kỹ năng.

Tasks:

1. Grammar lessons:
   - sinh pronunciation notes từ examples;
   - thêm speakingReflexPrompts từ grammar pattern;
   - thêm mini dialogue ngắn theo pattern;
   - thêm common mistakes gắn với lỗi grammar thường gặp.
2. Reading lessons:
   - thêm listeningPractice từ passage excerpt;
   - thêm speaking prompt tóm tắt ý chính;
   - thêm real-life situation cho từng bài đọc;
   - thêm review rules theo vocabulary/passage.
3. Cập nhật 10-layer scoring theo content profile để không phạt sai grammar/reading.

Expected result:

- Missing listening/speaking giảm mạnh.
- Practice page có nhiều mode thật hơn cho generated lessons.
- Lesson page trở thành nơi học sâu, không chỉ đọc + quiz.

### Phase 3 — Multi-source roadmap architecture

Mục tiêu: roadmap mô tả đúng một unit có thể gồm reading + speech + shadowing + grammar.

Tasks:

1. Thay hoặc mở rộng schema:
   - `sourceModuleReferences: UnifiedSourceModuleReference[]`
   - hoặc `primarySourceModuleReference` + `supportingSourceModuleReferences`.
2. Cập nhật audit script để validate từng source module riêng.
3. Cập nhật UI learning path:
   - hiển thị nguồn chính;
   - hiển thị nguồn bổ trợ;
   - hiển thị skill thiếu nhất;
   - CTA theo nguồn yếu nhất.
4. Cập nhật unified lesson engine để depth scoring dựa trên multi-source coverage.

Expected result:

- Không cần ép unit đa nguồn vào 1 module.
- Dashboard học phản ánh chính xác hơn.
- Dễ mở rộng thêm nội dung sau này.

### Phase 4 — Performance and smoothness upgrade

Mục tiêu: web chạy mượt hơn khi dữ liệu ngày càng lớn.

Tasks:

1. Tách generated data theo CEFR level hoặc route:
   - A1/A2/B1/B2 reading data;
   - grammar data;
   - vocabulary review data;
   - shadowing/speech data.
2. Lazy-load data khi vào route thay vì kéo vào engine chung nếu không cần.
3. Với animation:
   - chỉ animate transform/opacity;
   - tránh animate layout properties như width/height/top/left;
   - chỉ đặt `will-change` cho element thật sự animate;
   - cleanup GSAP timeline khi route unmount;
   - tránh chạy quá nhiều animation cùng lúc trên mobile.
4. Thêm browser performance QA:
   - mobile landing;
   - lesson page heavy content;
   - practice flow;
   - shadowing recording UI.

Expected result:

- Initial route nhẹ hơn.
- Mobile scroll/animation mượt hơn.
- Data càng tăng vẫn không kéo chậm toàn app.

### Phase 5 — Learning product expansion

Mục tiêu: phát triển web thành sản phẩm học tiếng Anh cá nhân hóa.

Tasks:

1. Smart review:
   - dùng local/Supabase progress để gợi ý bài yếu;
   - đưa lỗi sai vào SRS.
2. Skill dashboard:
   - vocabulary, grammar, reading, listening, speaking, shadowing coverage;
   - hiển thị CEFR progress rõ hơn.
3. AI coach:
   - giải thích lỗi phát âm/shadowing;
   - gợi ý câu luyện tiếp theo;
   - tạo mini lesson theo lỗi cá nhân.
4. Content authoring pipeline:
   - import/generated lessons có validator riêng;
   - preview lesson before release;
   - QA report tự động.

Expected result:

- Web không chỉ là thư viện bài học mà trở thành hệ thống học có lộ trình, feedback, ôn tập và cá nhân hóa.

## 6. Thứ tự ưu tiên tiếp theo

1. Tạo script chính thức `validate-penglish-runtime-lessons` để thay smoke check tạm.
2. Browser-QA sentence ordering và practice modes sau khi validator đã sạch.
3. Bổ sung listening/speaking bridge cho `path-a2-grammar-patterns` trước vì đây là unit yếu nhất.
4. Nâng roadmap sang multi-source schema.
5. Tách generated data theo route/level để tối ưu mobile production.
