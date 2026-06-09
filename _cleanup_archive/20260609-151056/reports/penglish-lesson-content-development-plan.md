# Kế hoạch phát triển nội dung bài học P-English theo kết quả audit web

## 1. Cơ sở lập kế hoạch

Kế hoạch này dựa trên các điểm rủi ro và điểm chưa ổn được ghi nhận trong [penglish-web-audit-unstable-points-report.md](penglish-web-audit-unstable-points-report.md), kết hợp với cấu trúc lộ trình hiện tại trong [generatedUnifiedLearningPath.ts](../apps/web/src/data/learning/generatedUnifiedLearningPath.ts) và kết quả mở rộng bài học gần nhất trong [penglish-additional-lesson-expansion-report.md](penglish-additional-lesson-expansion-report.md).

Kết luận audit quan trọng:

- Core learning UX đang ổn định: Home, Learning Path, Lesson, English Speed, Shadowing, Words đều qua QA.
- Lộ trình hiện có 13 unit, trải từ A1 đến B2.
- Điểm yếu chính không còn là lỗi runtime, mà là cách phát triển nội dung cần bám sát hệ local-first, không phụ thuộc backend, và cần mở rộng bài học theo từng tuyến kỹ năng rõ ràng.
- Các trang backend tùy chọn như Chat, AI, Shop, Leaderboard, Folders chưa nên là trọng tâm nội dung học vì có thể thiếu dữ liệu khi backend chưa bật.
- Nội dung mới nên ưu tiên các route đã ổn định: Lesson, Learning Path, Shadowing, English Speed, Words.

## 2. Mục tiêu nội dung trong 4 giai đoạn

### Giai đoạn 1: Củng cố A1/A2 thành nền local-first chắc chắn

Mục tiêu:

- Biến A1/A2 thành tuyến học tự học hoàn chỉnh mà không cần backend.
- Tăng số bài đọc ngắn, bài nghe/tình huống, shadowing và prompt phát âm.
- Giúp người mới không bị rơi vào cảm giác thiếu dữ liệu.

Ưu tiên bài học:

| Nhóm | Số lượng đề xuất | Nội dung |
| --- | ---: | --- |
| A1 reading mini | 6 bài | nhà, lớp học, mua đồ nhỏ, giờ giấc, cuối tuần, thời tiết |
| A1 shadowing | 4 script | chào hỏi, hỏi tên, gọi đồ uống, nhờ giúp đỡ |
| A1 speech prompt | 8 prompt | câu 3-6 từ, âm rõ, phản xạ nhanh |
| A2 reading | 6 bài | hỏi đường, đặt lịch, sức khỏe, thư viện, chợ cuối tuần, tin nhắn bạn bè |
| A2 grammar bridge | 4 bài | past simple cơ bản, comparatives, going to, because/so |
| A2 shadowing | 5 script | mua sắm, hỏi đường, hẹn gặp, nói sở thích, đổi kế hoạch |

Kết quả mong muốn:

- A1/A2 có đủ vòng học: đọc hiểu → từ vựng → quiz/type → shadowing/speed.
- Người học mới có thể hoàn thành 7-14 ngày đầu mà không cần backend.

### Giai đoạn 2: Mở rộng B1 theo tình huống đời sống và công việc nhẹ

Mục tiêu:

- B1 phải trở thành mức “dùng được trong đời sống thật”.
- Mỗi bài B1 nên có một tình huống rõ, một pattern giao tiếp, một cầu nối shadowing.

Ưu tiên bài học:

| Nhóm | Số lượng đề xuất | Nội dung |
| --- | ---: | --- |
| B1 reading | 8 bài | email đổi lịch, xin feedback, teamwork, hiểu nhầm, part-time job, học online, kế hoạch nhóm, vấn đề sức khỏe nhẹ |
| B1 grammar-in-context | 5 bài | present perfect, advice modals, first conditional, relative clauses cơ bản, contrast linkers |
| B1 shadowing | 8 script | xin góp ý, giải thích lý do, đề xuất giải pháp, phỏng vấn part-time, so sánh lựa chọn, xử lý hiểu nhầm |
| B1 speech prompt | 10 prompt | tóm tắt ý, nói lý do, đưa lời khuyên, hỏi làm rõ deadline |

Kết quả mong muốn:

- B1 có ít nhất 20-25 nội dung app-authored có thể route qua Lesson, Shadowing, English Speed.
- Mỗi topic B1 có cặp reading + shadowing để người học đọc hiểu trước rồi nói lại.

### Giai đoạn 3: Phát triển B2 theo tư duy lập luận và giao tiếp có sắc thái

Mục tiêu:

- B2 không chỉ là đọc khó hơn, mà phải luyện lập luận, đánh giá, phản hồi, và diễn đạt cân bằng.
- Nội dung nên phù hợp học thuật nhẹ, công việc, công nghệ, cộng đồng, học ngoại ngữ.

Ưu tiên bài học:

| Nhóm | Số lượng đề xuất | Nội dung |
| --- | ---: | --- |
| B2 reading | 8 bài | AI study balance, feedback rubric, learning tool evaluation, sustainable habits, digital focus, career decision, community survey, study break design |
| B2 argument grammar | 5 bài | conditionals for advice, although/despite, should be judged by, not only/but also, hedging language |
| B2 shadowing | 8 script | nêu quan điểm, phản biện nhẹ, problem-solving meeting, learning strategy, feedback discussion, technology balance |
| B2 speech prompt | 12 prompt | nói ý kiến 20-40 giây, so sánh lựa chọn, giải thích trade-off, đề xuất giải pháp |

Kết quả mong muốn:

- B2 có tuyến “đọc lập luận → nhận diện quan điểm → nói quan điểm”.
- Nội dung B2 hỗ trợ người học tự tin hơn với speaking/writing có cấu trúc.

### Giai đoạn 4: Tạo vòng ôn tập, checkpoint và nội dung “không backend vẫn đầy”

Mục tiêu:

- Giảm cảm giác app trống ở những nơi optional backend chưa bật.
- Tạo nội dung ôn tập local-first để thay thế/đỡ phụ thuộc các trang backend.

Ưu tiên nội dung:

| Nhóm | Số lượng đề xuất | Nội dung |
| --- | ---: | --- |
| Review checkpoint | 8 checkpoint | A1-1, A1-2, A2-1, A2-2, B1-1, B1-2, B2-1, B2-2 |
| Mixed practice packs | 8 pack | từ vựng + câu mẫu + đọc ngắn + shadowing mini |
| Error repair lessons | 12 bài nhỏ | lỗi phát âm, lỗi word order, lỗi article, lỗi tense, lỗi chọn từ |
| Offline/local empty-state lessons | 6 bộ | gợi ý học khi chưa có dữ liệu cá nhân, bài mẫu cho user mới |

Kết quả mong muốn:

- Home và Learning Path luôn có gợi ý học hữu ích kể cả khi chưa có backend/user data.
- Người học có checkpoint rõ sau từng cụm unit.

## 3. Ma trận ưu tiên theo lỗi/rủi ro audit

| Vấn đề audit | Tác động nội dung | Kế hoạch nội dung tương ứng | Ưu tiên |
| --- | --- | --- | --- |
| Optional backend pages còn best-effort | Không nên đặt nội dung học cốt lõi ở Chat/AI/Shop/Folders | Tập trung Lesson, Shadowing, English Speed, Words | P0 |
| Production API base có thể rỗng | Nội dung phải chạy được local-first | Tất cả lesson mới phải app-authored, không cần fetch runtime | P0 |
| QA stale khi số unit tăng | Mỗi lần thêm unit phải cập nhật QA/checkpoint | Thêm quy tắc “content expansion QA checklist” | P0 |
| Một lần QA `/words` timeout rồi pass lại | Words cần dữ liệu từ vựng nhẹ, ổn định, không quá nặng | Chia vocabulary pack theo level/topic, tránh payload quá lớn một lần | P1 |
| Còn `as any` low-risk | Type shape nên rõ khi thêm dữ liệu | Nội dung mới phải theo seed/type hiện có, không dùng shape tùy tiện | P1 |
| Package chưa có QA scripts | Mở rộng nội dung dễ quên validate | Mỗi pass nội dung phải kèm lệnh validate cố định trong report | P1 |

## 4. Quy tắc phát triển bài học mới

### 4.1. Quy tắc dữ liệu

- Learner-facing content phải là app-authored.
- Không copy transcript/video/corpus có bản quyền.
- Nếu tham khảo repo/dataset ngoài, chỉ dùng để xác định chủ đề, CEFR, hoặc workflow; nội dung cuối phải viết lại.
- Mỗi bài mới phải có ID ổn định, level, topic, Vietnamese support, task kiểm tra hiểu, vocabulary focus, và route tương thích.

### 4.2. Quy tắc sư phạm

Mỗi bài nên có đủ 5 lớp:

1. Context: tình huống gần đời sống.
2. Pattern: mẫu câu/ngữ pháp/tư duy chính.
3. Input: reading/listening/shadowing text ngắn.
4. Practice: quiz, blank, ordering, type, match, speed hoặc shadowing.
5. Transfer: câu người học có thể dùng thật.

### 4.3. Quy tắc runtime

- Mọi bài mới phải hoạt động trong route Lesson hoặc Shadowing/English Speed hiện có.
- Không tạo route mới nếu chưa cần.
- Không phụ thuộc backend để hiển thị nội dung cốt lõi.
- Mỗi lần tăng số unit trong learning path phải cập nhật QA expectation tương ứng.

## 5. Lộ trình triển khai đề xuất

### Sprint 1: A1/A2 local-first expansion

Thời lượng: 1-2 ngày.

Deliverables:

- 6 A1/A2 reading lessons.
- 4 A1/A2 shadowing scripts.
- 6 A1/A2 speech prompts.
- Cập nhật learning path nếu cần.
- Report + QA.

### Sprint 2: B1 đời sống + công việc nhẹ

Thời lượng: 2-3 ngày.

Deliverables:

- 6 B1 reading lessons.
- 6 B1 shadowing scripts.
- 4 B1 grammar-in-context lessons.
- 8 B1 speech prompts.
- Cập nhật B1 learning path maturity từ expanded lên gần mature nếu đủ coverage.

### Sprint 3: B2 argument and opinion path

Thời lượng: 2-3 ngày.

Deliverables:

- 6 B2 reading lessons.
- 6 B2 shadowing scripts.
- 4 B2 grammar/argument lessons.
- 10 B2 speech prompts.
- Thêm checkpoint B2 opinion practice.

### Sprint 4: Review/checkpoint system

Thời lượng: 2 ngày.

Deliverables:

- 8 checkpoint units hoặc review packs.
- Local-first empty-state learning recommendations.
- QA scripts cập nhật để không stale khi số unit thay đổi.

## 6. Thứ tự thực hiện ngay tiếp theo

Nên bắt đầu bằng Sprint 1 vì đây là nơi ảnh hưởng trực tiếp tới user mới và giảm phụ thuộc backend nhiều nhất.

Danh sách bài nên viết đầu tiên:

1. `reading-a1-asking-for-help`
2. `reading-a1-weather-plan`
3. `reading-a2-changing-an-appointment`
4. `reading-a2-at-the-clinic`
5. `shadow-a1-asking-for-help`
6. `shadow-a2-changing-an-appointment`
7. `speech-a1-can-you-help-me`
8. `speech-a2-i-need-to-change-the-time`

## 7. Checklist QA cho mỗi đợt thêm nội dung

- Chạy TypeScript: `npx tsc -p apps/web/tsconfig.json --noEmit`.
- Chạy build: `npm run build -w '@pshare/web'`.
- Chạy learning path QA: `node scripts/penglish-learning-path-progress-qa.cjs`.
- Chạy product UX QA nếu learning path count đổi: `node scripts/penglish-product-ux-logic-qa.cjs`.
- Chụp/kiểm tra route: `/learning-path`, `/lessons/{newLessonId}`, `/shadowing`, `/english-speed`, `/words`.
- Cập nhật report trong `reports/`.

## 8. Kết luận

Web hiện đủ ổn định để chuyển trọng tâm từ sửa lỗi runtime sang phát triển nội dung có hệ thống. Hướng đi đúng là mở rộng app-authored local-first content theo A1/A2 trước, sau đó tăng B1/B2 theo cặp reading + shadowing + speech. Mỗi đợt thêm nội dung phải cập nhật learning path, kiểm tra unit count, và chạy QA để tránh lặp lại lỗi stale expectation khi lộ trình tăng số unit.
