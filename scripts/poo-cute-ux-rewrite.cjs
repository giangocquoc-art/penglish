const fs = require('fs');
const path = require('path');

const root = process.cwd();
const changed = [];

function file(rel) {
  return path.join(root, rel);
}

function apply(rel, edits) {
  const abs = file(rel);
  let text = fs.readFileSync(abs, 'utf8');
  const before = text;
  for (const [search, replace] of edits) {
    if (search instanceof RegExp) {
      text = text.replace(search, replace);
    } else {
      text = text.split(search).join(replace);
    }
  }
  if (text !== before) {
    fs.writeFileSync(abs, text, 'utf8');
    changed.push(rel);
  }
}

apply('apps/web/src/pages/EnglishSpeedPage.tsx', [
  ["{ id: 'reading', title: 'Đọc nhanh', vi: 'Đọc nhanh', icon: Waves, goal: 'Đọc câu rõ và đều trong 30 giây.' },", "{ id: 'reading', title: 'Đọc cùng Poo', vi: 'Đọc cùng Poo', icon: Waves, goal: 'Đọc câu rõ và đều, không cần vội.' },"],
  ["{ id: 'listening', title: 'Nghe nhanh', vi: 'Nghe nhanh', icon: Headphones, goal: 'Nghe mẫu chậm rồi nhận nhịp câu.' },", "{ id: 'listening', title: 'Nghe nhịp câu', vi: 'Nghe nhịp câu', icon: Headphones, goal: 'Nghe mẫu chậm rồi bắt nhịp cùng Poo.' },"],
  ["{ id: 'speaking', title: 'Nói nhanh', vi: 'Nói nhanh', icon: Mic2, goal: 'Nói thử, nghe lại và phá kỷ lục cá nhân.' },", "{ id: 'speaking', title: 'Nói rõ và đều', vi: 'Nói rõ và đều', icon: Mic2, goal: 'Nói thử, nghe lại và giữ câu thật rõ.' },"],
  ["const RECORDED_FEEDBACK_MESSAGE = 'Poo đã nghe lượt đọc của bạn. Poo giữ nhịp luyện, thời gian và kỷ lục nhỏ cho bạn.';", "const RECORDED_FEEDBACK_MESSAGE = 'Poo đã nghe lượt đọc của bạn. Poo giữ nhịp luyện, thời gian và dấu mốc nhỏ cho bạn.';"],
  ["prompt: prompt?.promptText ?? 'Luyện tốc độ tiếng Anh',", "prompt: prompt?.promptText ?? 'Đọc nhanh cùng Poo',"],
  ["userAnswer: `Điểm động viên ${score} trong phần luyện ${mode}`,", "userAnswer: `Poo chấm vui ${score}; mình luyện rõ và đều hơn từng chút`,"],
  ['Luyện tốc độ tiếng Anh', 'Đọc nhanh cùng Poo'],
  ['Chọn đọc nhanh, nghe nhanh hoặc nói nhanh để luyện đều nhịp và phá kỷ lục nhẹ nhàng.', 'Chọn đọc, nghe hoặc nói cùng Poo. Mình ưu tiên rõ và đều trước nhé.'],
  ['KỶ LỤC', 'DẤU MỐC'],
  ["aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm câu đọc'}", "aria-label={isRecording ? 'Dừng lượt nói' : 'Nói thử câu đọc'}"],
  ['Nghe mẫu → nghe chậm nếu cần → ghi âm → đọc trọn câu → dừng ghi âm → nghe lại âm thanh trên thiết bị.', 'Nghe mẫu → nghe chậm nếu cần → nói thử một lượt → đọc trọn câu → dừng lại → nghe lại lượt nói cùng Poo.'],
]);

apply('apps/web/src/pages/ShadowingPage.tsx', [
  ['Poo sẽ nghe bản ghi và góp ý phát âm, nhịp, từ thiếu hoặc từ lệch.', 'Poo sẽ nghe lượt nói và góp ý nhẹ về phát âm, nhịp, chỗ Poo nghe chưa rõ.'],
  ['Trình duyệt chưa hỗ trợ giọng đọc mẫu. Hãy đọc câu mẫu, ghi âm, rồi để Poo góp ý cách đọc.', 'Trình duyệt chưa hỗ trợ giọng đọc mẫu. Hãy đọc câu mẫu, nói thử một lượt, rồi để Poo góp ý nhẹ.'],
  ['Không có video mẫu thu sẵn. Poo dùng giọng đọc mẫu nếu có; sau đó bạn ghi âm để Poo góp ý.', 'Không có video mẫu thu sẵn. Poo dùng giọng đọc mẫu nếu có; sau đó bạn nói thử để Poo góp ý.'],
  ['Video không phát được. Bạn vẫn có thể luyện bằng lời thoại, giọng đọc mẫu và ghi âm.', 'Video không phát được. Bạn vẫn có thể luyện bằng lời thoại, giọng đọc mẫu và lượt nói của mình.'],
  ['Video không tải được. Chuyển sang luyện bằng lời thoại và ghi âm để không gián đoạn bài học.', 'Video không tải được. Chuyển sang luyện bằng lời thoại và nói thử cùng Poo để không gián đoạn bài học.'],
  ['Poo đã lưu câu này vào Practice để ôn lại.', 'Poo đã giữ câu này ở phần ôn cùng Poo để bạn quay lại nhẹ nhàng.'],
  ['<FeedbackWordBox title="Từ khớp" empty="Chưa có từ khớp chắc chắn." tone="green" words={apiFeedback.matchedWords} />', '<FeedbackWordBox title="Từ bạn nói tốt" empty="Poo chưa nghe rõ từ nào chắc chắn, mình thử chậm hơn nhé." tone="green" words={apiFeedback.matchedWords} />'],
  ['<FeedbackWordBox title="Từ còn thiếu" empty="Không thấy từ thiếu rõ ràng." tone="amber" words={apiFeedback.missingWords} />', '<FeedbackWordBox title="Từ Poo chưa nghe rõ" empty="Poo chưa thấy chỗ nào bị hụt rõ ràng." tone="amber" words={apiFeedback.missingWords} />'],
  ['<FeedbackWordBox title="Từ bị thừa/lệch" empty="Không thấy từ thừa hoặc lệch rõ ràng." tone="red" words={[...apiFeedback.extraWords, ...apiFeedback.changedWords]} />', '<FeedbackWordBox title="Từ Poo nghe hơi khác" empty="Poo chưa nghe thấy chỗ nào lệch rõ ràng." tone="red" words={[...apiFeedback.extraWords, ...apiFeedback.changedWords]} />'],
  ['So sánh câu nhập', 'Nhờ Poo nghe thử'],
  ['Không cần nói hoàn hảo. Bấm ghi âm, nói lại theo nhịp, rồi để Poo chỉ ra chỗ cần luyện thêm.', 'Không cần nói hoàn hảo. Nói thử theo nhịp, rồi để Poo chỉ nhẹ chỗ mình luyện thêm.'],
  ["apiFeedback ? 'Đã có góp ý' : 'Sẵn sàng ghi âm'", "apiFeedback ? 'Đã có góp ý' : 'Sẵn sàng nói thử'"],
  ["aria-label={isRecording ? 'Dừng ghi âm và gửi Poo góp ý' : 'Nói theo Poo'}", "aria-label={isRecording ? 'Dừng lượt nói và gửi Poo góp ý' : 'Nói theo Poo'}"],
  ["{isRecording ? 'Dừng ghi âm' : 'Nói theo Poo'}", "{isRecording ? 'Dừng lượt nói' : 'Nói theo Poo'}"],
  ['Tiến độ luyện tập', 'Nhịp luyện hôm nay'],
  ['Câu khó', 'Câu còn vấp'],
  ['Poo lưu tiến độ theo từng bài.', 'Poo giữ lại nhịp luyện theo từng bài.'],
  ['Gợi ý: nghe trước một lần, nói lại theo nhịp, rồi xem Poo góp ý từ thiếu, phát âm và nhịp nói.', 'Gợi ý: nghe trước một lần, nói lại theo nhịp, rồi xem Poo góp ý chỗ chưa rõ, phát âm và nhịp nói.'],
  ['Nâng cao: tự tạo lời thoại', 'Tự tạo lời thoại với Poo'],
]);

apply('apps/web/src/pages/PracticePage.tsx', [
  ["if (mistake.source === 'english-speed') return 'Luyện tốc độ tiếng Anh';", "if (mistake.source === 'english-speed') return 'Đọc nhanh cùng Poo';"],
  ['Sai: {item.wrongAnswer}', 'Câu còn vấp: {item.wrongAnswer}'],
]);

apply('apps/web/src/pages/VocabPage.tsx', [
  ["if (word.source === 'english-speed') return 'Tốc độ tiếng Anh';", "if (word.source === 'english-speed') return 'Đọc nhanh cùng Poo';"],
]);

apply('apps/web/src/components/seo/RouteMetadataUpdater.tsx', [
  ["title: 'Luyện tốc độ tiếng Anh — PooEnglish',", "title: 'Đọc nhanh cùng Poo — PooEnglish',"],
  ["description: 'Luyện phản xạ tiếng Anh nhanh qua các thử thách nghe, hiểu, chọn nghĩa và nói lại.',", "description: 'Đọc, nghe và nói cùng Poo theo nhịp rõ ràng, đều đặn và ít áp lực.',"],
]);

apply('apps/web/src/data/reading/generatedReadingLessons.ts', [
  [/titleVi: '([A-B][12]) Reading: /g, "titleVi: 'Đọc cùng Poo: "],
  ["`Câu này được lấy từ ý trọng tâm của bài và phù hợp trực tiếp với đoạn đọc.`", "`Đúng rồi, câu này bám sát ý chính của đoạn. Poo chỉ cần bạn nhận ra từ khóa là ổn.`"],
  ["'Enter để kiểm tra câu điền từ; A/B/C/D hoặc 1/2/3/4 để chọn đáp án nhanh.'", "'Làm từng câu thôi. Poo sẽ nhắc nhẹ nếu bạn còn phân vân.'"],
  [/explanationVi: 'Câu đầu nói ([^']+)\.'/g, "explanationVi: 'Đúng rồi, đoạn đầu có nhắc đến $1. Poo chỉ cần bạn nối đúng ý này.'"],
  [/explanationVi: 'Câu cuối nói ([^']+)\.'/g, "explanationVi: 'Đúng rồi, đoạn cuối có nhắc đến $1. Mình đọc chậm là thấy ngay.'"],
  [/explanationVi: '([^']+) nghĩa là ([^']+)\.'/g, "explanationVi: 'Đúng rồi, $1 có nghĩa là $2. Poo khen bạn đã bắt được từ khóa.'"],
  [/explanationVi: 'Đoạn đọc nêu ([^']+)\.'/g, "explanationVi: 'Đúng rồi, đoạn đọc có nói $1. Mình chọn theo ý trong bài là ổn.'"],
]);

apply('apps/web/src/lib/p-english/lesson-content-data.ts', [
  ['promptVi: \'Nói: Đây là lớp học của tôi.\'', 'promptVi: \'Poo thử thách nhẹ: nói “Đây là lớp học của tôi.”\''],
  ["explanationVi: 'classroom là phòng/lớp học.'", "explanationVi: 'Đúng rồi, classroom là nơi mình học cùng thầy cô và bạn bè.'"],
  ["explanationVi: '“Thank you” là cụm lịch sự để nói cảm ơn.'", "explanationVi: 'Đúng rồi, “Thank you” là cách nói cảm ơn lịch sự và rất dễ dùng.'"],
  ["explanationVi: 'Từ khóa là “new here”, nghĩa là người nói mới ở lớp/nơi này.'", "explanationVi: 'Đúng rồi, “new here” cho Poo biết người nói mới đến nơi này.'"],
  ["explanationVi: 'seat = chỗ ngồi, free = còn trống trong ngữ cảnh này.'", "explanationVi: 'Đúng rồi, trong câu này seat là chỗ ngồi, free là còn trống.'"],
  ["explanationVi: 'board là bảng trong lớp học.'", "explanationVi: 'Đúng rồi, board là chiếc bảng mình thường thấy trong lớp học.'"],
  [/promptVi: 'Nói: ([^']+)'/g, "promptVi: 'Poo thử thách nhẹ: nói “$1”'"],
  [/promptVi: 'Hỏi: ([^']+)'/g, "promptVi: 'Poo thử thách nhẹ: hỏi “$1”'"],
]);

apply('apps/web/src/data/speech/generatedSpeechPrompts.ts', [
  ['Nếu điểm thấp, luyện riêng ba target words.', 'Nếu Poo nghe chưa rõ, mình luyện riêng ba từ chính nhé.'],
  ['Dễ nuốt âm cuối ở:', 'Poo hay nghe hụt âm cuối ở:'],
  ['Nói từng từ quá rời; hãy nối các cụm ngắn.', 'Mình nối cụm ngắn cho câu mềm hơn nhé.'],
  ['Dễ bỏ âm nối hoặc nhấn sai ở:', 'Poo có thể nghe chưa rõ âm nối ở:'],
  ['Đừng đọc quá nhanh khi gặp cụm hai hoặc ba từ.', 'Gặp cụm hai hoặc ba từ, mình chậm lại một chút nhé.'],
  ['Câu dài dễ mất trọng âm ở:', 'Câu dài có thể làm Poo nghe chưa rõ nhịp ở:'],
  ['Chú ý nhịp câu: nhóm ý trước, nói rõ sau.', 'Mình gom ý nhỏ trước, rồi nói rõ từng cụm nhé.'],
  ['Từ dài dễ bị đều giọng ở:', 'Từ dài có thể cần nhấn nhẹ hơn ở:'],
  ['Giữ nhịp tự nhiên, nhấn vào từ mang ý chính.', 'Giữ nhịp tự nhiên và nhấn nhẹ vào từ mang ý chính nhé.'],
  ['Cá voi nghe được ý chính rồi, giờ mình làm âm cuối sáng hơn nhé.', 'Poo nghe được ý chính rồi, giờ mình làm âm cuối sáng hơn nhé.'],
]);

apply('apps/web/src/data/shadowing/generatedShadowingCatalog.ts', [
  ["{ mode: 'chunk', labelVi: 'Chia câu', instructionVi: 'Nhìn từng đoạn ngắn, chú ý chỗ ngắt hơi.' },", "{ mode: 'chunk', labelVi: 'Tách câu nhỏ', instructionVi: 'Nhìn từng đoạn ngắn, chú ý chỗ nghỉ hơi.' },"],
  ["{ mode: 'repeat', labelVi: 'Lặp theo đoạn', instructionVi: 'Nói lại từng đoạn chậm hơn, rõ âm cuối.' },", "{ mode: 'repeat', labelVi: 'Nói theo từng đoạn', instructionVi: 'Nói lại từng đoạn chậm hơn, để âm cuối rõ hơn.' },"],
  ["{ mode: 'record', labelVi: 'Ghi âm', instructionVi: 'Ghi giọng của bạn khi nói đuổi theo câu đang chọn.' },", "{ mode: 'record', labelVi: 'Nói thử một lượt', instructionVi: 'Nói thử câu đang chọn để Poo nghe cùng bạn.' },"],
  ["{ mode: 'compare', labelVi: 'So sánh lại', instructionVi: 'Nghe lại, chọn một câu yếu và luyện lại chậm hơn.' },", "{ mode: 'compare', labelVi: 'Poo nghe lại cùng bạn', instructionVi: 'Nghe lại, chọn một câu còn vấp nhẹ và luyện chậm hơn.' },"],
  ["B1: ['Giữ nhịp tự nhiên giữa các cụm.', 'Ghi âm một lượt đầy đủ rồi nghe lại.', 'Đánh dấu câu bị vấp để luyện riêng.'],", "B1: ['Giữ nhịp tự nhiên giữa các cụm.', 'Nói thử một lượt đầy đủ rồi nghe lại cùng Poo.', 'Đánh dấu câu còn vấp để luyện riêng.'],"],
  ["B2: ['Chú ý trọng âm câu và ý chính.', 'Tập nối âm vừa phải, không nuốt âm cuối.', 'So sánh bản ghi với transcript theo từng cụm.'],", "B2: ['Chú ý nhịp nhấn của câu và ý chính.', 'Tập nối âm vừa phải, giữ âm cuối rõ.', 'Nghe lại lượt nói cùng lời thoại theo từng cụm.'],"],
  ['Cá voi nhắc bạn: chậm mà đều sẽ tốt hơn nhanh mà vấp.', 'Poo nhắc bạn: chậm mà đều sẽ tốt hơn nhanh mà vấp.'],
  ['Lần tới, tôi sẽ kiểm tra nguồn trước khi gửi bất kỳ thứ gì.', 'Lần tới, tôi sẽ xem lại thông tin trước khi gửi.'],
  ['Nếu mắc lỗi, tôi nói chậm lại và thử lại cùng một cụm.', 'Nếu tôi vấp một chút, tôi nói chậm lại và thử lại cùng một cụm.'],
  ['Rủi ro còn lại là bảo đảm mọi chế độ luyện tập có đủ dữ liệu đáng tin cậy.', 'Điều còn cần chú ý là mỗi phần luyện phải có nội dung đủ chắc.'],
]);

apply('apps/web/src/data/grammar/generatedGrammarLessons.ts', [
  ["explanationVi: `Câu đúng dùng mẫu của bài: ${seed.titleVi}.`", "explanationVi: `Đúng rồi, câu này đi theo mẫu chính của bài: ${seed.titleVi}.`"],
  ["explanationVi: `“${secondAnswer}” mở đầu câu và giữ đúng cấu trúc mục tiêu.`", "explanationVi: `Đúng rồi, “${secondAnswer}” mở đầu câu tự nhiên và giữ đúng mẫu mình đang luyện.`"],
  ["explanationVi: 'Thứ tự này tạo câu hoàn chỉnh theo mẫu trọng tâm.'", "explanationVi: 'Đúng rồi, thứ tự này tạo thành câu đầy đủ theo mẫu Poo đang dẫn bạn luyện.'"],
  ["explanationVi: 'Đáp án đúng diễn đạt trọn ý và giữ mẫu câu tự nhiên.'", "explanationVi: 'Đúng rồi, đáp án này nói trọn ý và nghe tự nhiên hơn.'"],
  ["explanationVi: `“${fourthAnswer}” là phần cần có để câu đầy đủ và đúng mẫu.`", "explanationVi: `Đúng rồi, “${fourthAnswer}” giúp câu đầy đủ và đúng mẫu hơn.`"],
  ["explanationVi: 'Câu hoàn chỉnh giúp người học luyện phản xạ theo chunk.'", "explanationVi: 'Đúng rồi, câu hoàn chỉnh giúp mình luyện theo cụm ngắn dễ nhớ hơn.'"],
  ["{ text: 'Progress is saved on this device.', meaningVi: 'Tiến độ được lưu trên thiết bị này.' }", "{ text: 'Progress is saved for you.', meaningVi: 'Poo giữ lại tiến độ cho bạn.' }"],
  ["titleVi: 'Động từ khuyết thiếu can / should / must'", "titleVi: 'Nói “có thể / nên / phải” bằng câu ngắn'"],
  ["titleVi: 'Động từ be: am / is / are'", "titleVi: 'Nói “là / ở / thì” bằng câu ngắn'"],
  ["titleVi: 'Present perfect: trải nghiệm đã từng'", "titleVi: 'Kể chuyện mình đã từng làm'"],
  ['Pattern che BE để luyện am/is/are theo chủ ngữ và ngữ cảnh vị trí/cảm xúc.', 'Poo che một chỗ nhỏ để bạn chọn am/is/are theo người, nơi chốn hoặc cảm xúc.'],
  ['Pattern che AUX/VPAST để luyện have/has + past participle trong câu trải nghiệm.', 'Poo che một chỗ nhỏ để bạn tập nói về điều mình đã từng làm.'],
  ['Pattern được nâng cấp từ điều kiện thực tế lên điều kiện giả định + hedging để đúng mục tiêu B2.', 'Poo nâng câu điều kiện lên một chút để bạn nói lời khuyên mềm và tự nhiên hơn.'],
  ['Present perfect dùng has + tried cho chủ ngữ she.', 'Đúng rồi, với she mình dùng has tried để kể điều cô ấy đã từng thử.'],
]);

apply('apps/web/src/features/foundation48/foundation48Data.ts', [
  ["{ id: 1, title: 'Câu nền tảng với “to be”', days: [1, 2, 3, 4] },", "{ id: 1, title: 'Nói “là / ở / thì” bằng câu ngắn', days: [1, 2, 3, 4] },"],
  ["{ id: 2, title: 'Động từ thường và hiện tại đơn', days: [5, 6, 7, 8] },", "{ id: 2, title: 'Nói việc mình làm mỗi ngày', days: [5, 6, 7, 8] },"],
  ["{ id: 3, title: 'Từ loại và các thì căn bản', days: [9, 10, 11, 12, 13, 14, 15, 16, 17] },", "{ id: 3, title: 'Xếp từ và kể chuyện đơn giản', days: [9, 10, 11, 12, 13, 14, 15, 16, 17] },"],
  ["{ id: 4, title: 'Phát âm, trọng âm và câu hỏi', days: [18, 19, 20, 21] },", "{ id: 4, title: 'Nói rõ hơn và hỏi câu ngắn', days: [18, 19, 20, 21] },"],
  ["{ id: 5, title: 'Liên từ và câu điều kiện', days: [22, 23, 24, 25, 26, 27, 28] },", "{ id: 5, title: 'Nối ý và nói lời khuyên ngắn', days: [22, 23, 24, 25, 26, 27, 28] },"],
  ["{ id: 7, title: 'Củng cố ngữ pháp và giao tiếp', days: [35, 36, 37, 38] },", "{ id: 7, title: 'Ôn câu quen và nói tự nhiên hơn', days: [35, 36, 37, 38] },"],
  ["{ id: 8, title: 'Nghe chủ đề đời sống và đầu ra cuối khóa', days: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48] },", "{ id: 8, title: 'Nghe chuyện đời sống và khép lại 48 ngày', days: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48] },"],
  ["18: { learnerTitle: 'Học ngữ âm với giáo viên nước ngoài', readiness: 'complete' },", "18: { learnerTitle: 'Nghe âm và bắt chước thật chậm', readiness: 'complete' },"],
  ["19: { learnerTitle: 'Tìm hiểu về trọng âm trong tiếng Anh', readiness: 'complete' },", "19: { learnerTitle: 'Nhấn nhẹ vào từ quan trọng', readiness: 'complete' },"],
  ["22: { learnerTitle: 'Động từ khuyết thiếu', readiness: 'complete' },", "22: { learnerTitle: 'Nói “có thể / nên / phải” bằng câu ngắn', readiness: 'complete' },"],
  ["35: { learnerTitle: 'Đại từ phản thân', readiness: 'complete' },", "35: { learnerTitle: 'Nói về chính mình bằng câu rõ', readiness: 'complete' },"],
  ["36: { learnerTitle: 'Sự hòa hợp về thì', readiness: 'complete' },", "36: { learnerTitle: 'Giữ thời gian trong câu cho khớp', readiness: 'complete' },"],
  ["38: { learnerTitle: 'Liên từ tương hỗ', readiness: 'complete' },", "38: { learnerTitle: 'Nối hai ý đi cùng nhau', readiness: 'complete' },"],
  ["46: { learnerTitle: 'Kỹ năng Note-taking', readiness: 'complete' },", "46: { learnerTitle: 'Nghe và ghi từ khóa ngắn', readiness: 'complete' },"],
  ["47: { learnerTitle: 'Kỹ năng Paraphrasing', readiness: 'complete' },", "47: { learnerTitle: 'Nói lại cùng ý bằng câu dễ hơn', readiness: 'complete' },"],
  ['Hoàn thành phần luyện tập trong tài liệu nguồn.', 'Làm phần luyện cùng Poo theo từng câu ngắn.'],
  ['Tự viết 3 câu mới và kiểm tra lại chủ ngữ, động từ, dấu câu.', 'Tự viết 3 câu mới rồi để Poo nhắc lại chủ ngữ, động từ và dấu câu.'],
]);

apply('apps/web/src/features/foundation48/foundation48DeepLessons.stage4.lazy.ts', [
  ['Học ngữ âm với giáo viên nước ngoài', 'Nghe âm và bắt chước thật chậm'],
  ['Tìm hiểu về trọng âm trong tiếng Anh', 'Nhấn nhẹ vào từ quan trọng'],
  ['Syllable and stress: âm tiết và trọng âm', 'Âm tiết và nhịp nhấn trong từ'],
]);

apply('apps/web/src/features/foundation48/foundation48DeepLessons.stage5.lazy.ts', [
  ['Động từ khuyết thiếu', 'Nói “có thể / nên / phải” bằng câu ngắn'],
  ['Hôm nay bạn học cách nói nên, phải, có thể, được phép bằng các động từ khuyết thiếu quen thuộc.', 'Hôm nay Poo dẫn bạn nói “nên”, “phải”, “có thể” bằng vài câu ngắn quen thuộc.'],
  ['Động từ khuyết thiếu đứng trước động từ chính dạng nguyên mẫu.', 'Những từ nhỏ này đứng trước việc mình muốn nói.'],
]);

apply('apps/web/src/features/foundation48/foundation48DeepLessons.stage7.lazy.ts', [
  ['Đại từ phản thân', 'Nói về chính mình bằng câu rõ'],
  ['Sự hòa hợp về thì', 'Giữ thời gian trong câu cho khớp'],
  ['Liên từ tương hỗ', 'Nối hai ý đi cùng nhau'],
]);

apply('apps/web/src/features/foundation48/foundation48DeepLessons.stage8.lazy.ts', [
  ['Kỹ năng Note-taking', 'Nghe và ghi từ khóa ngắn'],
  ['Kỹ năng Paraphrasing', 'Nói lại cùng ý bằng câu dễ hơn'],
]);

apply('apps/web/src/components/p-english/DynamicGuidedLessonFlow.tsx', [
  ['Tự trả lời nhanh.', 'Tự trả lời chậm rãi cũng được.'],
]);

console.log(`Changed ${changed.length} files:`);
for (const rel of changed) console.log(`- ${rel}`);
