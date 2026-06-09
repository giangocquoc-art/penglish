# P-English Current Data Lesson/Web Development Roadmap

## 1. Mục tiêu

Dựa trên dữ liệu bài học hiện có, kế hoạch này định hướng phát triển P-English theo hai trục song song:

1. Phát triển nội dung bài học theo CEFR A1-B2, ưu tiên lộ trình rõ, bài ngắn, luyện được ngay.
2. Phát triển web thành hệ thống học adaptive local-first: Home gợi ý việc học hôm nay, Learning Path chỉ đường dài hạn, Lesson/Shadowing/English Speed/Vocabulary hỗ trợ từng kỹ năng.

Nguyên tắc nội dung tiếp tục giữ như Sprint 1:

- Learner-facing text phải là nội dung P-English tự viết hoặc chuyển thể hợp lệ.
- External repo chỉ dùng để tham khảo cấu trúc, metadata, workflow hoặc pattern logic; không copy transcript/bài đọc.
- Mỗi bài nên có mục tiêu giao tiếp rõ, tình huống đời sống, từ vựng trọng tâm, bài kiểm tra hiểu, luyện câu và một bước nói/nhắc lại.

## 2. Hiện trạng dữ liệu bài học

### 2.1 Learning Path

Learning Path hiện có 13 unit A1-B2:

| Level | Unit hiện có | Trọng tâm |
| --- | ---: | --- |
| A1 | 5 | Chào hỏi, nghe hằng ngày, gia đình/lớp học, đọc/ngữ pháp, phát âm/shadowing |
| A2 | 3 | Từ vựng thực tế, ngữ pháp hằng ngày, đọc tin nhắn + shadowing |
| B1 | 3 | Đọc đời sống, ngữ pháp để nêu ý, shadowing phản hồi/đời sống |
| B2 | 2 | Đọc quan điểm, phát âm/nói quan điểm |

Nhận định:

- A1 sau Sprint 1 đã đủ tốt để onboarding người mới.
- A2 có nền thực dụng tốt nhưng còn thiếu các cụm lesson nghe/nói theo role-play.
- B1 đã có nhiều reading + shadowing, nhưng cần writing/speaking task có rubric.
- B2 còn mỏng về số unit; nên bổ sung discussion, writing, presentation, debate-lite.

### 2.2 Reading

Search hiện trả về 52 lesson/source level markers trong generated reading data. Phân bố đọc khá mạnh ở A1-A2-B1-B2:

- A1: nhiều starter scenes, daily sentences, hỏi giúp đỡ, thời tiết.
- A2: practical messages, everyday notices, appointment/clinic/library/bus/shopping.
- B1: real-life paragraphs, study plan, teamwork, misunderstanding, pronunciation diary.
- B2: confident reading, digital habits, local environment, AI balance, feedback rubric, learning tool evaluation.

Điểm mạnh:

- Reading đang là kho nội dung mạnh nhất.
- Chủ đề gần đời sống, phù hợp app học nhanh.
- Có thể adapt sang lesson route và quiz/fill/order.

Điểm cần cải thiện:

- Một số reading có trong sourceIds nhưng chưa nằm trong lessonIds của path; cần đồng bộ để người dùng thấy hết bài.
- Chưa có writing follow-up bắt buộc sau reading, đặc biệt B1-B2.
- Chưa có cụm ôn tập theo chủ đề sau mỗi 4-6 bài đọc.

### 2.3 Grammar

Grammar có 24 level markers trong generated grammar data. Hiện đã có:

- A1: articles, be present, there is/are, can.
- A2: quantifiers, some/any, each/every, third-person-s, prepositions, regular past, comparatives, going to.
- B1: irregular verbs, phrasal verbs, modals, present perfect, relative clauses, gerunds, used to, passive.
- B2: conditionals, contrast linkers, reported speech/feedback.

Điểm mạnh:

- Có pattern logic rõ, dễ mở rộng.
- Mỗi lesson có explanation, examples, exercises.
- Adapter đã chuyển được grammar sang lesson runtime.

Điểm cần cải thiện:

- A1/A2 cần thêm grammar in conversation thay vì chỉ exercise.
- B2 cần tăng số lượng pattern và task áp dụng trong đoạn nói/viết.
- Grammar nên được nối với reading/shadowing cùng chủ đề để tránh học rời rạc.

### 2.4 Shadowing

Shadowing search hiện có 47 item level markers. Kho shadowing đã khá phong phú:

- A1: greeting, school, daily routine, weather, asking for help.
- A2: directions, shopping, appointment, weekend plan, pharmacy, bus delay.
- B1: study habit, interview, teamwork, asking feedback, comparing options, misunderstanding.
- B2: learning strategy, digital habits opinion, career goals, project update, design choice, feedback, problem-solving, environment.

Điểm mạnh:

- Chủ đề đời sống tốt và bám learning path.
- Có transcript/chunks/repeatPlan/tips/coach lines qua helper.
- Rất phù hợp với định hướng pronunciation + confidence.

Điểm cần cải thiện:

- Cần mapping rõ từ mỗi unit path sang danh sách shadowing cụ thể.
- Cần trạng thái mastered/difficult/retry theo từng câu để Home gợi ý chính xác hơn.
- Cần rubric phát âm/ngữ điệu đơn giản cho user tự đánh giá nếu API không khả dụng.

### 2.5 Speech / English Speed

Speech có seed prompt A1-B2 và expansion prompt; file có counter theo level.

Điểm mạnh:

- Prompt ngắn, phù hợp browser speech/pronunciation.
- Có target words, focus sounds, mistakes, retry tips.
- Phù hợp dùng làm bài nhỏ hằng ngày.

Điểm cần cải thiện:

- Cần gắn prompt với từng learning unit cụ thể hơn.
- Cần kết quả feedback có next action: repeat slower, try shadowing, review word.
- Cần thêm B1/B2 prompt dạng opinion, compare, clarify, summarize.

### 2.6 Foundation48

Foundation48 đã tồn tại như một feature riêng với roadmap, day page, stepper, progress, audio section, source notice. Đây là tài sản có thể dùng làm “48-day guided course”.

Điểm mạnh:

- Có cấu trúc 48 ngày, phù hợp habit-building.
- Có progress riêng và UI roadmap riêng.
- Có thể trở thành khóa nhập môn song song hoặc được merge vào Learning Path.

Điểm cần cải thiện:

- Cần quyết định vai trò sản phẩm: khóa 48 ngày độc lập, hay pathway nhập môn A0-A1.
- Cần nối dữ liệu Foundation48 với dashboard chung để Home biết user đang học gì.
- Cần chuẩn hóa lesson quality/rubric để thống nhất với P-English path.

## 3. Hiện trạng web/product

### 3.1 Home

Home đã có nền tảng adaptive dashboard:

- Daily goal count.
- Local learning summary.
- Recommended action: vocabulary, shadowing, speed, next lesson.
- Skill coverage grid.
- Unified progress ring.
- Recent practice memory.

Ưu tiên web cho Home:

1. Biến Home thành “Hôm nay học gì?” với 3 bước rõ: Learn, Review, Speak.
2. Hiển thị lý do gợi ý: từ đến hạn, câu shadowing khó, unit tiếp theo, kỹ năng yếu.
3. Nối Foundation48/current course vào Home để không tách rời trải nghiệm.
4. Thêm empty state cho user mới: Start A1, Try 1 speech prompt, Review 5 words.

### 3.2 Learning Path

Learning Path đã có:

- Group theo CEFR.
- Unit card, maturity label, recommended modes.
- Progress hints và CEFR journey/milestones.
- Unlock chain qua unlockedByUnitId.

Ưu tiên web cho Learning Path:

1. Thêm skill coverage heatmap theo từng CEFR: Vocabulary, Grammar, Reading, Listening, Shadowing, Speaking, Writing.
2. Hiển thị “missing coverage” để team biết unit nào cần thêm bài.
3. Thêm filter: A1/A2/B1/B2, skill, maturity.
4. Thêm trạng thái “Next best unit” và CTA nhất quán về route thực hành.

### 3.3 Lesson Page / Practice

Lesson route đã nhận handcrafted/generated reading/generated grammar qua adapters. Đây là trục chính để scale content.

Ưu tiên web cho Lesson Page:

1. Chuẩn hóa lesson template theo 5 bước: Warm-up, Learn, Check, Practice, Speak/Review.
2. Cho reading/grammar có follow-up writing prompt.
3. Thêm “lesson objective” và “completion criteria” rõ hơn ở đầu bài.
4. Sau khi complete, đề xuất bước tiếp theo: shadowing cùng chủ đề, speech prompt, vocabulary review.

### 3.4 Shadowing

Shadowing đã có catalog và progress riêng. Đây là lợi thế cạnh tranh cho luyện nói.

Ưu tiên web cho Shadowing:

1. Tạo playlist theo CEFR/unit thay vì chỉ danh sách chung.
2. Tách trạng thái từng câu: new, practiced, difficult, mastered.
3. Thêm self-check rubric: clarity, rhythm, final sounds, confidence.
4. Tự động gửi câu khó về Home recommendation.

### 3.5 English Speed / Speech

English Speed có thể trở thành daily speaking micro-practice.

Ưu tiên web:

1. Gắn prompt với unit/lesson.
2. Hiển thị slow hint + target words + retry tip trước/sau khi nói.
3. Lưu lỗi thường gặp và gợi ý luyện lại.
4. Thêm streak/minigoal: 3 câu rõ mỗi ngày.

### 3.6 Vocabulary

Vocabulary hiện đã có CEFR generated vocabulary và local review. Đây là hệ review dài hạn.

Ưu tiên web:

1. Nối từ vựng với bài đọc/ngữ pháp/shadowing cùng chủ đề.
2. Thêm “word appears in lesson” để người học thấy ngữ cảnh.
3. Tăng weak-word review theo skill: recognition, spelling, listening, speaking.
4. Dashboard hóa due words và weak words rõ hơn.

## 4. Gap chính cần xử lý

| Gap | Mức độ | Tác động | Hướng xử lý |
| --- | --- | --- | --- |
| B2 ít unit hơn A1/B1 | Cao | Lộ trình cuối chưa đủ sâu | Thêm B2 discussion/writing/presentation units |
| Writing chưa rõ trong product | Cao | Thiếu kỹ năng đầu ra B1-B2 | Thêm writing prompt + rubric vào lesson completion |
| Reading mạnh nhưng chưa có bridge sang speaking ở mọi bài | Cao | User đọc xong chưa nói được | Mỗi reading có follow-up shadow/speech |
| Foundation48 tách khỏi unified dashboard | Trung bình | Trải nghiệm bị rời rạc | Gắn Foundation48 progress vào Home/Learning Path |
| Progress nhiều storage/event khác nhau | Trung bình | Dễ lệch trạng thái | Chuẩn hóa unified progress snapshot |
| Một số sourceIds không có trong lessonIds | Trung bình | Nội dung có nhưng chưa hiển thị trong path | Audit và đồng bộ ID theo unit |
| Listening dedicated còn ít ngoài handcrafted A1 | Trung bình | Kỹ năng nghe chưa scale đều | Tạo A2/B1/B2 listening-dialogue lessons app-authored |

## 5. Roadmap phát triển nội dung

### Sprint C1: Đồng bộ và hoàn thiện A1/A2 foundation

Thời lượng đề xuất: 3-5 ngày.

Mục tiêu:

- Biến A1/A2 thành lộ trình beginner hoàn chỉnh, ít rời rạc.
- Không cần thêm quá nhiều content mới; ưu tiên nối đúng và cải thiện flow.

Việc cần làm:

1. Audit sourceIds vs lessonIds trong 13 path units.
2. Đưa các reading đang có nhưng chưa visible vào path hoặc review collections.
3. Tạo 4 A2 listening-dialogue lessons:
   - At the pharmacy.
   - Bus delay.
   - Library card.
   - Weekend plan.
4. Tạo 4 A1/A2 mini review units:
   - A1 survival phrases.
   - A1 classroom confidence.
   - A2 appointments and services.
   - A2 travel and directions.
5. Mỗi unit có: reading/listening, 5-8 vocab, 1 grammar note, 1 shadowing, 1 speech prompt.

Definition of Done:

- Learning Path hiển thị rõ next unit.
- Home đề xuất đúng bài tiếp theo.
- Mỗi A1/A2 unit có ít nhất 3 practice modes.
- QA logic path/progress pass.

### Sprint C2: B1 output skills - speaking + writing

Thời lượng đề xuất: 5-7 ngày.

Mục tiêu:

- B1 không chỉ đọc hiểu mà bắt đầu diễn đạt ý kiến, giải thích, phản hồi.

Việc cần làm:

1. Thêm 6 B1 writing prompts theo chủ đề đã có:
   - study plan,
   - part-time job,
   - online class,
   - team project,
   - asking for feedback,
   - resolving misunderstanding.
2. Thêm B1 lesson template “Read -> Notice language -> Write 3 sentences -> Shadow -> Speak”.
3. Thêm rubric B1 đơn giản:
   - clear main idea,
   - one reason/example,
   - grammar target used,
   - pronunciation confidence.
4. Tạo B1 review unit sau 3 unit hiện có.
5. Nối difficult shadowing sentence vào Home.

Definition of Done:

- B1 path có output task ở mỗi unit.
- Có ít nhất 1 writing/speaking follow-up cho mỗi B1 reading group.
- User có thể thấy “Bạn đã nói/viết gì hôm nay” ở dashboard hoặc lesson summary.

### Sprint C3: B2 depth - opinion, discussion, presentation

Thời lượng đề xuất: 7-10 ngày.

Mục tiêu:

- B2 đủ hấp dẫn cho người học trung cấp: có quan điểm, lập luận, phản hồi, giải pháp.

Việc cần làm:

1. Thêm 3 B2 path units:
   - B2 · Nêu quan điểm cân bằng.
   - B2 · Trình bày giải pháp.
   - B2 · Phản hồi và cải thiện.
2. Thêm 8 B2 reading/opinion lessons:
   - AI learning boundaries.
   - Sustainable study habits.
   - Community problem-solving.
   - Career communication.
   - Feedback culture.
   - Learning tool evaluation extension.
   - Digital distraction solution.
   - Presentation reflection.
3. Thêm 8 B2 speech prompts:
   - although/however,
   - if I were responsible,
   - I would argue that,
   - a more sustainable solution,
   - the main limitation is,
   - based on feedback,
   - before choosing a solution,
   - to conclude.
4. Thêm B2 mini presentation task 60-90 giây với outline.

Definition of Done:

- B2 tăng từ 2 unit lên 5 unit.
- Có speaking/writing output task cho từng B2 unit.
- Shadowing catalog có playlist B2 theo topic.

### Sprint C4: Foundation48 integration

Thời lượng đề xuất: 5-7 ngày.

Mục tiêu:

- Biến Foundation48 thành khóa guided course thay vì feature rời.

Hai hướng lựa chọn:

1. Foundation48 là “48-day Starter Course” độc lập.
2. Foundation48 được map vào A0/A1 Learning Path.

Khuyến nghị: dùng hướng 1 trước, sau đó map milestone sang A1.

Việc cần làm:

1. Home hiển thị current Foundation48 day nếu user đã bắt đầu.
2. Learning Path thêm card “48-day starter course”.
3. Foundation48 progress góp vào daily goal.
4. Chuẩn hóa day template: Learn, Listen, Repeat, Mini test, Complete.
5. Tạo report audit chất lượng Foundation48 từng day.

Definition of Done:

- User không bị lạc giữa Foundation48 và P-English path.
- Dashboard biết user đang học day nào.
- Completion Foundation48 có thể unlock/khuyến nghị A1 units.

## 6. Roadmap phát triển web/product

### Sprint W1: Adaptive Home v2

Thời lượng: 3-5 ngày.

Tính năng:

- Today Plan gồm 3 cards:
  1. Learn next unit.
  2. Review due/weak words.
  3. Speak one sentence/shadow one difficult line.
- Explain why: “vì bạn còn 6 từ đến hạn”, “vì unit A2 kế tiếp đang mở”, “vì câu này bạn đánh dấu khó”.
- Empty state cho user mới.
- Foundation48 current day card.

### Sprint W2: Learning Path coverage and filters

Thời lượng: 3-5 ngày.

Tính năng:

- Filter by CEFR/skill/maturity.
- Skill coverage badges per unit.
- Missing coverage warning nội bộ: no writing, no listening, no shadowing.
- Unit detail drawer hoặc details mở rộng: source IDs, practice routes, completion criteria.

### Sprint W3: Lesson template standardization

Thời lượng: 5-7 ngày.

Tính năng:

- 5-step lesson experience:
  1. Goal.
  2. Learn.
  3. Check understanding.
  4. Practice sentence.
  5. Speak/write follow-up.
- Completion summary.
- Next best action.
- Practice-mode availability indicator.

### Sprint W4: Shadowing/Speech progress loop

Thời lượng: 5-7 ngày.

Tính năng:

- Sentence-level progress.
- Difficult/mastered status.
- Self-check rubric.
- Speech retry feedback memory.
- Home recommendations from difficult lines/prompts.

### Sprint W5: Unified data/progress layer

Thời lượng: 5-10 ngày.

Tính năng:

- Unified learner activity event model.
- Single dashboard snapshot for lessons, vocabulary, shadowing, speech, Foundation48.
- Export/debug report script for content coverage.
- Supabase parity plan if cloud sync is enabled.

## 7. Ưu tiên thực thi đề xuất

Nếu chỉ chọn một hướng ngắn hạn, nên làm theo thứ tự:

1. W1 Adaptive Home v2 - giúp user biết học gì ngay.
2. C1 A1/A2 synchronization - làm beginner flow chắc.
3. W2 Learning Path coverage - giúp team và user thấy lộ trình rõ.
4. C2 B1 output - tăng giá trị học thật.
5. W3 Lesson template - scale content không lo rối UI.
6. C3 B2 depth - hoàn thiện upper-intermediate path.
7. C4 Foundation48 integration - biến tài sản 48 ngày thành course rõ.
8. W4/W5 progress loop - hoàn thiện adaptive engine.

## 8. Bộ tiêu chuẩn cho bài mới

Mỗi bài mới nên có schema nội dung tối thiểu:

- id rõ theo pattern: skill-level-topic.
- level CEFR.
- topic và real-life situation.
- objective/confidence goal.
- 5-8 vocabulary items.
- 1 pattern/ngữ pháp hoặc speaking function.
- input text/dialogue 80-180 từ tùy level.
- 3 comprehension questions.
- 1 fill-blank.
- 1 sentence-order hoặc rewrite.
- 1 shadowing/speech follow-up.
- 1 completion criterion.
- 2-3 whale coach lines.

Quality rules:

- A1: câu ngắn, từ quen, 1 ý/câu.
- A2: thêm lý do/thời gian/địa điểm, tin nhắn thực tế.
- B1: có ý chính + lý do + ví dụ đơn giản.
- B2: có quan điểm cân bằng, limitation, solution, hedging.

## 9. Bộ QA cần duy trì

Mỗi sprint content/web nên chạy:

1. TypeScript check.
2. Web build.
3. Lesson progress QA.
4. Product UX logic QA.
5. Content coverage script:
   - count units by CEFR,
   - count lessonIds/sourceIds,
   - detect missing runtime route,
   - detect sourceId not visible in any unit,
   - detect unit with missing practice modes.
6. Browser smoke QA for:
   - /home,
   - /learning-path,
   - /lessons/:lessonId,
   - /shadowing,
   - /english-speed,
   - /words,
   - /foundation48 if integrated.

## 10. Kết luận

Dữ liệu hiện có đã đủ để P-English chuyển từ “web có nhiều module học” sang “hệ thống học có lộ trình adaptive”. Nội dung mạnh nhất hiện là Reading và Shadowing; nền A1/A2 đã ổn sau Sprint 1; B1 có tiềm năng tốt nhưng cần output writing/speaking; B2 cần thêm depth và unit mới.

Kế hoạch tối ưu là không chỉ thêm bài rời rạc, mà phát triển theo cụm:

- A1/A2: chắc foundation, dễ bắt đầu.
- B1: biến input thành output.
- B2: luyện quan điểm, phản hồi, giải pháp.
- Web: Home adaptive + Learning Path coverage + Lesson template chuẩn + progress loop.

Nếu triển khai theo roadmap này, P-English sẽ có lộ trình học ngoại ngữ rõ hơn, đo tiến bộ tốt hơn, và nội dung mới sẽ được đưa vào đúng chỗ thay vì nằm rải rác trong data files.