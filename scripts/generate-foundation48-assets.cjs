const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcIndexPath = path.join(root, '_source/foundation48/foundation48-source-index.json');
const index = JSON.parse(fs.readFileSync(srcIndexPath, 'utf8'));
const outDir = path.join(root, 'apps/web/src/features/foundation48');
fs.mkdirSync(outDir, { recursive: true });
const publicAudioRoot = path.join(root, 'apps/web/public/assets/foundation48/audio');
fs.mkdirSync(publicAudioRoot, { recursive: true });

const explicitTitles = {
  1: 'Thể khẳng định và phủ định của động từ to be',
  2: 'Thể nghi vấn của động từ to be',
  3: 'Câu hỏi Who và What với động từ to be',
  4: 'Câu hỏi Where và When với động từ to be',
  5: 'Động từ thường ở hiện tại',
  6: 'Thể phủ định của động từ thường ở hiện tại',
  7: 'Thể nghi vấn của động từ thường ở hiện tại',
  8: 'Thì hiện tại đơn',
  9: 'Từ loại',
  10: 'Thì hiện tại tiếp diễn',
  11: 'Phân biệt thì hiện tại đơn và hiện tại tiếp diễn',
  12: 'Thì quá khứ đơn thể khẳng định',
  13: 'Thì quá khứ đơn thể phủ định và nghi vấn',
  14: 'Thì quá khứ tiếp diễn',
  15: 'Thì hiện tại hoàn thành',
  16: 'Thì tương lai đơn',
  17: 'Thì tương lai hoàn thành',
  18: 'Học ngữ âm với giáo viên nước ngoài',
  19: 'Tìm hiểu về trọng âm trong tiếng Anh',
  20: 'Các câu hỏi với từ để hỏi khác trong tiếng Anh',
  21: 'Luyện nghe số và tên',
  22: 'Động từ khuyết thiếu',
  23: 'Liên từ And, But, Or, So và Because',
  24: 'Liên từ chỉ thời gian',
  25: 'Liên từ chỉ sự đối lập',
  26: 'Câu điều kiện loại 1',
  27: 'Câu điều kiện loại 2',
  28: 'Câu điều kiện loại 3',
  29: 'Luyện nghe điền từ',
  30: 'Luyện nghe chép chính tả',
  31: 'Luyện nghe về giờ',
  32: 'Luyện nghe ngày tháng',
  33: 'Luyện nghe địa điểm',
  34: 'Luyện nghe về tiền bạc',
  35: 'Đại từ phản thân',
  36: 'Sự hoà hợp về thì',
  37: 'Tiếng Anh giao tiếp 1',
  38: 'Liên từ tương hỗ',
  39: 'Luyện nghe về các quốc gia và châu lục',
  40: 'Luyện nghe về sở thích',
  41: 'Luyện nghe về giao thông',
  42: 'Luyện nghe về thể thao',
  43: 'Luyện nghe về nghề nghiệp',
  44: 'Luyện nghe về công nghệ',
  45: 'Tiếng Anh giao tiếp 2',
  46: 'Kỹ năng Note-taking',
  47: 'Kỹ năng Paraphrasing',
  48: 'Tự tin giới thiệu bản thân và thuyết trình bằng tiếng Anh',
};

function readMd(rel) {
  if (!rel) return '';
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf8')
    .replace(/\*\*==> picture[^\n]+\n?/g, '')
    .replace(/\*\*L[^\n]*Ngoaingu24h\.vn\*\*/g, '')
    .replace(/\*\*VA[^\n]*kh[^\n]*c!\*\*/g, '')
    .replace(/\*\*Bi[^\n]+Mai Ph[^\n]+/g, '')
    .replace(/\*\*CA' V[^\n]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeLine(line) {
  return line
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<br/gi, ' ')
    .replace(/[#*_`>|]/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsefulLine(line) {
  if (!line || line.length < 12 || line.length > 170) return false;
  const lower = line.toLowerCase();
  if (/^[-–—]?\s*[abc]\.?\s*$/.test(lower)) return false;
  if (/^(unit|day|ngày)\s*\d+/i.test(line)) return false;
  if (/^(a|b|c)\.\s*(vocabulary|pronunciation|grammar|practice|exercise)/i.test(line)) return false;
  if (/(danh từ|động từ|tính từ|trạng từ)\s*phiên âm/i.test(line)) return false;
  if (/^\d+\.\s*(một số|các|từ để hỏi)?\s*$/i.test(line)) return false;
  return ![
    '48 ngày lấy gốc',
    'toàn diện tiếng anh',
    'cô vũ thị mai phương',
    'biên soạn',
    'giảng dạy',
    'tài liệu độc quyền',
    'tuyệt đối không chia sẻ',
    'picture',
    'ngoạingu24h',
    'ngoaingu24h',
    'answer key',
    'đáp án',
    'vocabulary',
    'pronunciation',
    'phiên âm',
    '---',
  ].some((token) => lower.includes(token));
}

function uniqueTake(lines, count) {
  const seen = new Set();
  const out = [];
  for (const raw of lines) {
    const line = normalizeLine(raw);
    const key = line.toLowerCase();
    if (!isUsefulLine(line) || seen.has(key)) continue;
    seen.add(key);
    out.push(line);
    if (out.length >= count) break;
  }
  return out;
}

function getLearningFocus(day, title) {
  if (day.dayNumber <= 8) return `nắm chắc ${title.toLowerCase()} qua câu mẫu rất ngắn`;
  if (day.dayNumber >= 21 && (day.mp3Count || 0) > 0) return `nghe chủ động theo chủ điểm “${title}” và ghi lại thông tin chính`;
  if ((day.mp3Count || 0) > 0) return `luyện nghe theo chủ điểm “${title}” trước khi nói lại bằng câu đơn giản`;
  if ((day.mp4Count || 0) > 0 || (day.videoFiles || []).length > 0) return `quan sát nguồn video về “${title}” và rút ra quy tắc phát âm cần nhớ`;
  if (/điều kiện/i.test(title)) return `hiểu cấu trúc ${title.toLowerCase()} và tự tạo tình huống ngắn`;
  if (/liên từ/i.test(title)) return `nối hai ý ngắn bằng ${title.toLowerCase()} một cách rõ nghĩa`;
  if (/thì|quá khứ|tương lai|hoàn thành|tiếp diễn/i.test(title)) return `nhận diện cách dùng ${title.toLowerCase()} trong câu đời thường`;
  return `học đúng trọng tâm “${title}” bằng ví dụ ngắn và bài tự luyện vừa sức`;
}

function getCoreRules(day, title) {
  const lowerTitle = title.toLowerCase();
  const rules = [`Mục tiêu chính: ${title}.`, 'Đọc phần giải thích ngắn trước, sau đó luyện bằng câu tự tạo.', 'Ưu tiên câu rõ chủ ngữ, đúng động từ và đúng dấu câu.'];
  if (day.dayNumber <= 8) rules.push('Hoàn thành ít nhất 3 câu mẫu trước khi sang bước mini test.');
  if ((day.mp3Count || 0) > 0) rules.push('Nghe một lượt để bắt ý, nghe lại từng đoạn để ghi từ khóa.');
  if ((day.mp4Count || 0) > 0 || (day.videoFiles || []).length > 0) rules.push('Video nguồn chỉ dùng làm gợi ý; không tạo trình phát nếu file chưa public an toàn.');
  if (lowerTitle.includes('câu hỏi')) rules.push('Luôn kiểm tra vị trí từ hỏi và trợ động từ/to be trong câu.');
  if (lowerTitle.includes('phủ định')) rules.push('Khi phủ định, kiểm tra trợ động từ và đưa động từ chính về dạng đúng.');
  if (lowerTitle.includes('nghe')) rules.push('Sau khi nghe, nói lại nội dung bằng 1–2 câu đơn giản.');
  return rules.slice(0, 5);
}

function curatedExamples(day, title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('to be')) return ['I am ready.', 'She is not tired.', 'Are they your friends?'];
  if (lowerTitle.includes('động từ thường') || lowerTitle.includes('hiện tại đơn')) return ['I study English every day.', 'She does not drink coffee.', 'Do you read books at night?'];
  if (lowerTitle.includes('hiện tại tiếp diễn')) return ['I am learning English now.', 'She is not watching TV.', 'Are they playing football?'];
  if (lowerTitle.includes('quá khứ đơn')) return ['I visited my friend yesterday.', 'She did not go to school last Monday.', 'Did they finish the homework?'];
  if (lowerTitle.includes('quá khứ tiếp diễn')) return ['I was studying at eight o’clock.', 'They were playing when it rained.', 'She was not sleeping then.'];
  if (lowerTitle.includes('hiện tại hoàn thành')) return ['I have finished my homework.', 'She has not seen this film.', 'Have you ever visited Da Nang?'];
  if (lowerTitle.includes('tương lai hoàn thành')) return ['I will have finished the report by Friday.', 'She will have learned 20 words by tonight.', 'They will not have arrived by noon.'];
  if (lowerTitle.includes('tương lai đơn')) return ['I will call you tomorrow.', 'She will not be late.', 'Will they join the class?'];
  if (lowerTitle.includes('câu hỏi') || lowerTitle.includes('từ để hỏi')) return ['Who is your teacher?', 'Where do you live?', 'When does the class start?'];
  if (lowerTitle.includes('liên từ')) return ['I am tired, but I will study.', 'She likes tea because it is warm.', 'You can read or listen first.'];
  if (lowerTitle.includes('điều kiện loại 1')) return ['If it rains, I will stay home.', 'If you practise, you will improve.', 'If she calls, I will answer.'];
  if (lowerTitle.includes('điều kiện loại 2')) return ['If I had more time, I would read more.', 'If she knew the answer, she would tell us.', 'If you practised daily, you would speak better.'];
  if (lowerTitle.includes('điều kiện loại 3')) return ['If I had studied harder, I would have passed.', 'If she had left earlier, she would have arrived on time.', 'If we had listened carefully, we would have understood.'];
  if (lowerTitle.includes('đại từ phản thân')) return ['I made this cake myself.', 'She taught herself English.', 'They fixed the bike themselves.'];
  if (lowerTitle.includes('hoà hợp') || lowerTitle.includes('hòa hợp')) return ['He said he was tired.', 'She says she likes English.', 'I knew that they were busy.'];
  if (lowerTitle.includes('note-taking')) return ['Listen for names, numbers, and places.', 'Write keywords, not full sentences.', 'Use arrows to connect cause and result.'];
  if (lowerTitle.includes('paraphrasing')) return ['good → useful / helpful', 'The task is difficult → The task is not easy', 'I study every day → I practise daily'];
  if (lowerTitle.includes('giao tiếp')) return ['Hello, nice to meet you.', 'Could you say that again?', 'I would like to ask one question.'];
  if ((day.mp3Count || 0) > 0 || lowerTitle.includes('nghe')) return ['Listen once for the main idea.', 'Listen again and write three keywords.', 'Say one short sentence about what you heard.'];
  if (lowerTitle.includes('trọng âm') || lowerTitle.includes('ngữ âm') || lowerTitle.includes('phát âm')) return ['Listen to the word stress first.', 'Tap the stressed syllable.', 'Repeat the word slowly, then in a sentence.'];
  return [`Ví dụ 1 theo chủ điểm: ${title}.`, 'Đọc câu mẫu chậm và rõ từng âm cuối.', 'Đổi một từ trong câu mẫu để tạo câu mới.'];
}

function curatedPractice(day, title) {
  const lowerTitle = title.toLowerCase();
  if ((day.mp3Count || 0) > 0 || lowerTitle.includes('nghe')) {
    return ['Nghe một lượt để bắt ý chính, chưa cần dừng lại.', 'Nghe lại từng đoạn và ghi 3 từ khóa quan trọng.', `Nói lại nội dung “${title}” bằng 2 câu ngắn.`];
  }
  if (lowerTitle.includes('câu hỏi') || lowerTitle.includes('nghi vấn')) {
    return ['Viết 4 câu hỏi đúng trọng tâm bài.', 'Tự trả lời mỗi câu bằng câu ngắn Yes/No hoặc thông tin cụ thể.', 'Sửa lại vị trí từ hỏi, to be hoặc trợ động từ nếu câu bị sai.'];
  }
  if (lowerTitle.includes('phủ định')) {
    return ['Chuyển 3 câu khẳng định sang phủ định.', 'Gạch chân trợ động từ hoặc to be trong từng câu.', 'Đọc lại để chắc động từ chính không bị chia sai sau don’t/doesn’t.'];
  }
  if (lowerTitle.includes('liên từ')) {
    return ['Nối 3 cặp câu ngắn bằng liên từ của bài.', 'Kiểm tra xem hai vế câu có quan hệ đúng nghĩa không.', 'Tự nói lại mỗi câu nối bằng giọng chậm và rõ.'];
  }
  if (lowerTitle.includes('điều kiện')) {
    return ['Viết 3 tình huống if theo đúng loại câu điều kiện.', 'Gạch chân mệnh đề điều kiện và mệnh đề kết quả.', 'Đổi một chi tiết trong tình huống rồi viết câu mới.'];
  }
  if (lowerTitle.includes('note-taking')) return ['Nghe/đọc một đoạn ngắn và chỉ ghi từ khóa.', 'Dùng ký hiệu mũi tên cho nguyên nhân-kết quả.', 'Tóm tắt lại bằng 3 gạch đầu dòng.'];
  if (lowerTitle.includes('paraphrasing')) return ['Chọn 3 câu ngắn và viết lại bằng từ khác.', 'Giữ nguyên nghĩa chính, không thêm thông tin mới.', 'So sánh câu gốc và câu viết lại để kiểm tra độ rõ.'];
  return ['Hoàn thành phần luyện tập trong tài liệu nguồn theo từng câu ngắn.', 'Tự viết 3 câu mới và kiểm tra lại chủ ngữ, động từ, dấu câu.', `Tóm tắt quy tắc của “${title}” bằng lời của bạn.`];
}

function buildSummary(day, lessonMd, testMd) {
  const title = explicitTitles[day.dayNumber] || day.dayFolder;
  const contentLines = `${lessonMd}\n${testMd}`.split('\n');
  uniqueTake(contentLines, 12);
  const keyPoints = getCoreRules(day, title);
  const examples = curatedExamples(day, title);
  const practice = curatedPractice(day, title);
  const markdownFiles = day.pdfs || [];
  const sourceLabels = [];
  if ((day.pdfCount || 0) > 0) sourceLabels.push(`${day.pdfCount || 0} PDF nguồn`);
  const mdCount = markdownFiles.filter((p) => p.markdown).length;
  if (mdCount > 0) sourceLabels.push(`${mdCount} Markdown đã chuyển`);
  if ((day.mp3Count || 0) > 0) sourceLabels.push(`${day.mp3Count || 0} file nghe`);
  if ((day.mp4Count || 0) > 0 || (day.videoFiles || []).length > 0) sourceLabels.push('Có video nguồn');

  return {
    dayNumber: day.dayNumber,
    summary: `Ngày ${day.dayNumber} tập trung vào ${getLearningFocus(day, title)}.`,
    keyPoints,
    examples,
    practice,
    finalTask: `Kết thúc ngày ${day.dayNumber}: tóm tắt bài “${title}” bằng 3 gạch đầu dòng và tự tạo ít nhất 3 câu ví dụ.`,
    sourceLabels,
    needsReview: markdownFiles.some((p) => !!p.needsReview),
  };
}

const audioManifest = [];
const lessonSummaries = [];
const sourceItems = index.map((day) => {
  const dayNo = String(day.dayNumber).padStart(2, '0');
  const targetDir = path.join(publicAudioRoot, `day-${dayNo}`);
  const publicAudio = [];
  if (day.audioFiles && day.audioFiles.length) fs.mkdirSync(targetDir, { recursive: true });

  (day.audioFiles || []).forEach((rel, i) => {
    const src = path.join(root, rel);
    const ext = path.extname(rel).toLowerCase() || '.mp3';
    const base = path.basename(rel, ext).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || `audio-${i + 1}`;
    const fileName = `${String(i + 1).padStart(2, '0')}-${base}${ext}`;
    const dest = path.join(targetDir, fileName);
    if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    const item = {
      id: `day-${dayNo}-audio-${i + 1}`,
      title: `File nghe ${i + 1}`,
      fileName: path.basename(rel),
      url: `/assets/foundation48/audio/day-${dayNo}/${fileName}`,
      sourcePath: rel,
    };
    publicAudio.push(item);
    audioManifest.push({ dayNumber: day.dayNumber, ...item });
  });

  const lessonMdPath = (day.pdfs || []).find((p) => p.kind === 'lesson' && p.markdown)?.markdown || (day.pdfs || []).find((p) => p.markdown)?.markdown || '';
  const testMdPath = (day.pdfs || []).find((p) => p.kind === 'test' && p.markdown)?.markdown || '';
  const lessonMd = readMd(lessonMdPath);
  const testMd = readMd(testMdPath);
  lessonSummaries.push(buildSummary(day, lessonMd, testMd));

  return {
    dayNumber: day.dayNumber,
    dayFolder: day.dayFolder,
    title: explicitTitles[day.dayNumber] || day.dayFolder,
    pdfCount: day.pdfCount || 0,
    mp3Count: day.mp3Count || 0,
    mp4Count: day.mp4Count || 0,
    hasPdf: (day.pdfCount || 0) > 0,
    hasAudio: publicAudio.length > 0,
    hasVideo: (day.videoFiles || []).length > 0,
    markdownFiles: (day.pdfs || []).map((p) => ({ kind: p.kind, markdown: p.markdown, wordCount: p.wordCount || 0, needsReview: !!p.needsReview })),
    audio: publicAudio,
    videoCount: (day.videoFiles || []).length,
    lessonMarkdown: '',
    testMarkdown: '',
  };
});

const sourceTs = `import type { Foundation48SourceDay } from './foundation48Types';\n\nexport const foundation48SourceIndex = ${JSON.stringify(sourceItems, null, 2)} as const satisfies readonly Foundation48SourceDay[];\n\nexport const foundation48AudioManifest = ${JSON.stringify(audioManifest, null, 2)} as const;\n`;
const summariesTs = `import type { Foundation48LessonSummary } from './foundation48Types';\n\nexport const foundation48LessonSummaries = ${JSON.stringify(lessonSummaries, null, 2)} as const satisfies readonly Foundation48LessonSummary[];\n`;

fs.writeFileSync(path.join(outDir, 'foundation48SourceIndex.ts'), sourceTs, 'utf8');
fs.writeFileSync(path.join(outDir, 'foundation48LessonSummaries.ts'), summariesTs, 'utf8');
fs.writeFileSync(path.join(root, 'apps/web/public/assets/foundation48/audio-manifest.json'), JSON.stringify(audioManifest, null, 2), 'utf8');
console.log(JSON.stringify({
  days: sourceItems.length,
  pdfs: sourceItems.reduce((n, d) => n + d.pdfCount, 0),
  mp3: audioManifest.length,
  audioDays: [...new Set(audioManifest.map((a) => a.dayNumber))],
  videoDays: sourceItems.filter((d) => d.hasVideo).map((d) => d.dayNumber),
  compactSummaries: lessonSummaries.length,
}, null, 2));
