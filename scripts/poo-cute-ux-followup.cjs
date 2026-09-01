const fs = require('fs');

function replaceAll(file, edits) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  for (const [search, replace] of edits) {
    text = text.split(search).join(replace);
  }
  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log(file);
  }
}

replaceAll('apps/web/src/features/foundation48/foundation48LessonSummaries.ts', [
  ['Hoàn thành phần luyện tập trong tài liệu nguồn theo từng câu ngắn.', 'Làm phần luyện cùng Poo theo từng câu ngắn.'],
  ['Tự viết 3 câu mới và kiểm tra lại chủ ngữ, động từ, dấu câu.', 'Tự viết 3 câu mới rồi để Poo nhắc lại chủ ngữ, động từ và dấu câu.'],
  ['3 PDF nguồn', '3 bài gốc Poo đã gom lại'],
  ['4 PDF nguồn', '4 bài gốc Poo đã gom lại'],
  ['3 Markdown đã chuyển', '3 bản học ngắn đã sẵn sàng'],
  ['4 Markdown đã chuyển', '4 bản học ngắn đã sẵn sàng'],
  ['Học ngữ âm với giáo viên nước ngoài', 'Nghe âm và bắt chước thật chậm'],
  ['Tìm hiểu về trọng âm trong tiếng Anh', 'Nhấn nhẹ vào từ quan trọng'],
  ['Động từ khuyết thiếu', 'Nói “có thể / nên / phải” bằng câu ngắn'],
  ['Đại từ phản thân', 'Nói về chính mình bằng câu rõ'],
  ['Sự hòa hợp về thì', 'Giữ thời gian trong câu cho khớp'],
  ['Liên từ tương hỗ', 'Nối hai ý đi cùng nhau'],
  ['Kỹ năng Note-taking', 'Nghe và ghi từ khóa ngắn'],
  ['Kỹ năng Paraphrasing', 'Nói lại cùng ý bằng câu dễ hơn'],
  ['quan sát nguồn video', 'nghe đoạn mẫu'],
]);

replaceAll('apps/web/src/features/foundation48/foundation48SourceIndex.ts', [
  ['Học ngữ âm với giáo viên nước ngoài', 'Nghe âm và bắt chước thật chậm'],
  ['Tìm hiểu về trọng âm trong tiếng Anh', 'Nhấn nhẹ vào từ quan trọng'],
  ['Động từ khuyết thiếu', 'Nói “có thể / nên / phải” bằng câu ngắn'],
  ['Đại từ phản thân', 'Nói về chính mình bằng câu rõ'],
  ['Liên từ tương hỗ', 'Nối hai ý đi cùng nhau'],
  ['Kỹ năng Note-taking', 'Nghe và ghi từ khóa ngắn'],
  ['Kỹ năng Paraphrasing', 'Nói lại cùng ý bằng câu dễ hơn'],
]);

replaceAll('apps/web/src/data/vocabulary/generatedCefrVocabulary.ts', [
  ['để người học luyện theo chunk.', 'để người học luyện theo cụm ngắn.'],
  ['flashcardPrompt', 'flashcardPrompt'],
]);

replaceAll('apps/web/src/data/learning/generatedUnifiedLearningPath.ts', [
  ['Nghe ý chính trước, sau đó mới nhìn transcript để Poo bơi đúng nhịp.', 'Nghe ý chính trước, sau đó mới nhìn lời thoại để Poo bơi đúng nhịp.'],
  ['Hai bài nghe A1 gốc của P-English có transcript, câu hỏi, giải thích và nhiệm vụ ôn tập.', 'Hai bài nghe A1 của P-English có lời thoại, câu hỏi, giải thích và nhiệm vụ ôn tập.'],
]);

replaceAll('apps/web/src/data/grammar/generatedGrammarLessons.ts', [
  ['Pattern gốc che DET có baseForm a/an/the và tạo bài cloze chọn đúng mạo từ.', 'Poo che một chỗ nhỏ để bạn chọn a, an hoặc the cho đúng tình huống.'],
  ['Pattern gốc che QUANT có baseForm little/few/much/many và chọn cặp đáp án theo lexeme.', 'Poo che một chỗ nhỏ để bạn chọn many, much, few hoặc little theo danh từ đi kèm.'],
  ['Pattern gốc che QUANT có baseForm each/every và tạo lựa chọn each/every.', 'Poo che một chỗ nhỏ để bạn chọn each hoặc every theo ý muốn nói.'],
  ['Pattern gốc che QUANT có baseForm some/any và tạo lựa chọn some/any.', 'Poo che một chỗ nhỏ để bạn chọn some hoặc any theo câu đang nói.'],
  ['Pattern gốc che VPAST/VPAP thuộc danh sách baseForm bất quy tắc và yêu cầu gõ dạng đúng.', 'Poo che một chỗ nhỏ để bạn nhớ dạng quá khứ của vài động từ quen thuộc.'],
  ['Pattern gốc bắt chủ ngữ PRON/PROP/NOUN rồi che đuôi -s của VPRES để luyện thêm/bỏ -s.', 'Poo che một chỗ nhỏ để bạn nhớ khi nào động từ cần thêm -s.'],
  ['Pattern gốc bắt động từ thường gặp rồi che PREP như out/up/down/back/on/off/for/over/away/after.', 'Poo che một chỗ nhỏ để bạn luyện cụm động từ quen thuộc theo tình huống.'],
  ['Pattern gốc che VAUX và tạo bài chọn modal phù hợp theo ngữ cảnh.', 'Poo che một chỗ nhỏ để bạn chọn can, should hoặc must theo ý câu.'],
  ['Pattern gốc che PREP có baseForm in/on/at và tạo lựa chọn in/on/at.', 'Poo che một chỗ nhỏ để bạn chọn in, on hoặc at theo nơi chốn và thời gian.'],
]);
