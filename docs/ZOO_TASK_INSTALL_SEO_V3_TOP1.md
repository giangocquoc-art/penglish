# TASK: Install PooEnglish SEO V3 Top-1 Content Pack

Mục tiêu:
Triển khai bản V3 của 40 SEO landing pages theo hướng nội dung dài hơn, dữ liệu sâu hơn, user-first hơn để cạnh tranh top SEO.

File chính:
- apps/web/src/data/seoV3Top1Pages.ts
- apps/web/src/data/seoV3SupplementBanks.ts

Yêu cầu route:
1. Render đủ 40 route từ seoV3Top1Pages.
2. Tất cả route SEO public, không redirect /login.
3. Không dùng fallback chung, không duplicate content.
4. Mỗi route dùng title, description, canonical, h1 riêng.

Yêu cầu render:
1. Render bodyMarkdown an toàn. Không dùng dangerouslySetInnerHTML trực tiếp nếu chưa sanitize.
2. Hỗ trợ paragraph, h2/h3, bảng markdown, list, strong.
3. Có mục lục anchor cho bài dài.
4. Render FAQ cuối bài.
5. Render internal links.
6. Render CTA học tiếp.
7. UI ocean PooEnglish, readable trên mobile.

Yêu cầu mini tool theo cluster:
- foundation: roadmap48Days/challenge30Days, checklist ngày học.
- free: bảng so sánh + nút học thử từ vựng/shadowing/speaking.
- speaking: dùng speakingPrompts + pronunciationMistakes, CTA /speaking-coach.
- shadowing: dùng shadowingSentences, transcript, nút nói đuổi.
- listening: dùng listeningScripts, script, dictation, quiz.
- vocab: dùng vocabulary500, filter topic/CEFR, flashcard, quiz.
- grammar: dùng grammarTopics/grammarExercises, bài tập có đáp án, sentence builder.

Yêu cầu schema:
1. BreadcrumbList JSON-LD.
2. FAQPage JSON-LD.
3. Course/SoftwareApplication/Article theo page.schemaType.
4. Organization/WebSite schema cho PooEnglish nếu chưa có.

Yêu cầu sitemap:
1. Thêm 40 route vào sitemap.xml.
2. robots.txt trỏ sitemap.
3. Canonical absolute: https://www.pooenglish.com/{slug}

Yêu cầu test:
- npm run build phải xanh.
- Test routes:
  /hoc-tieng-anh-cho-nguoi-mat-goc
  /ai-cham-phat-am-tieng-anh
  /shadowing-tieng-anh
  /500-tu-vung-tieng-anh-co-ban
  /ngu-phap/thi-hien-tai-don
  /luyen-nghe-tieng-anh-cho-nguoi-moi

Lưu ý:
- Vocabulary bank có một số mục cần biên tập thêm trước khi dùng làm dữ liệu chính thức 100%.
- Nếu chưa có audio thật, dùng TTS/browser speech tạm, nhưng UI phải có chỗ audio rõ ràng.
