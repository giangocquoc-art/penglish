import type { GeneratedSpeechPrompt, SpeechCefrLevel, SpeechPromptType, SpeechSourceMetadata } from './speechTypes';

const speechPronunciationSource: SpeechSourceMetadata = {
  repoName: 'speech-pronunciation',
  repoUrl: 'https://github.com/huytd/speech',
  localSourcePath: 'external-sources/speech-pronunciation',
  license: 'BSD-3-Clause',
  attribution: 'Workflow ideas reviewed from Huytd Speech project; no Vosk model, server code, CMU data, examples, or audio assets copied.',
  integrationMode: 'concept-adapted-local-browser-practice',
  licenseRiskNote: 'BSD-3-Clause permits adaptation with attribution. Runtime data below is original P-English prompt content and does not depend on external-sources.',
};

const uxReferenceSource: SpeechSourceMetadata = {
  repoName: 'english-pronunciation-app',
  repoUrl: 'https://github.com/furkansandal/EnglishPronunciation-App',
  localSourcePath: 'external-sources/candidates/english-pronunciation-app',
  license: 'MIT',
  attribution: 'Reviewed only for high-level mobile pronunciation UX ideas; Azure/Firebase implementation was not copied or added.',
  integrationMode: 'referenceOnly',
  licenseRiskNote: 'MIT source was not copied. Kept as UX reference because the original app depends on Azure Cognitive Speech and Firebase.',
};

type PromptSeed = {
  id: string;
  level: SpeechCefrLevel;
  type: SpeechPromptType;
  titleVi: string;
  promptText: string;
  vietnameseMeaning: string;
  focusSounds: string[];
  targetWords: string[];
};

const seeds: PromptSeed[] = [
  { id: 'a1-hello', level: 'A1', type: 'phrase', titleVi: 'Chào hỏi rõ âm cuối', promptText: 'Hello, my name is Anna.', vietnameseMeaning: 'Xin chào, tên tôi là Anna.', focusSounds: ['/h/', 'final /m/', 'name is'], targetWords: ['hello', 'name', 'anna'] },
  { id: 'a1-good-morning', level: 'A1', type: 'phrase', titleVi: 'Chào buổi sáng', promptText: 'Good morning, teacher.', vietnameseMeaning: 'Chào buổi sáng, cô/thầy giáo.', focusSounds: ['good', '/tʃ/ teacher', 'word stress'], targetWords: ['good', 'morning', 'teacher'] },
  { id: 'a1-number-one', level: 'A1', type: 'sentence', titleVi: 'Số và tuổi', promptText: 'I am twelve years old.', vietnameseMeaning: 'Tôi mười hai tuổi.', focusSounds: ['/tw/ twelve', 'years old', 'final /d/'], targetWords: ['twelve', 'years', 'old'] },
  { id: 'a1-school-book', level: 'A1', type: 'sentence', titleVi: 'Đồ dùng học tập', promptText: 'This is my English book.', vietnameseMeaning: 'Đây là sách tiếng Anh của tôi.', focusSounds: ['/ð/ this', 'English', 'book'], targetWords: ['this', 'english', 'book'] },
  { id: 'a1-pen', level: 'A1', type: 'phrase', titleVi: 'Câu mượn bút', promptText: 'Can I use your pen?', vietnameseMeaning: 'Tôi có thể dùng bút của bạn không?', focusSounds: ['can I', 'use your', 'pen'], targetWords: ['can', 'use', 'pen'] },
  { id: 'a1-food-rice', level: 'A1', type: 'sentence', titleVi: 'Món ăn quen thuộc', promptText: 'I like rice and fish.', vietnameseMeaning: 'Tôi thích cơm và cá.', focusSounds: ['/r/ rice', 'and', 'fish'], targetWords: ['like', 'rice', 'fish'] },
  { id: 'a1-water', level: 'A1', type: 'sentence', titleVi: 'Gọi nước', promptText: 'I want a glass of water.', vietnameseMeaning: 'Tôi muốn một ly nước.', focusSounds: ['want a', 'glass of', 'water'], targetWords: ['want', 'glass', 'water'] },
  { id: 'a1-breakfast', level: 'A1', type: 'sentence', titleVi: 'Bữa sáng', promptText: 'I eat breakfast at seven.', vietnameseMeaning: 'Tôi ăn sáng lúc bảy giờ.', focusSounds: ['eat', 'breakfast', 'seven'], targetWords: ['eat', 'breakfast', 'seven'] },
  { id: 'a1-go-school', level: 'A1', type: 'sentence', titleVi: 'Đi học', promptText: 'I go to school by bus.', vietnameseMeaning: 'Tôi đi học bằng xe buýt.', focusSounds: ['go to', 'school', 'bus'], targetWords: ['go', 'school', 'bus'] },
  { id: 'a1-daily-homework', level: 'A1', type: 'sentence', titleVi: 'Làm bài tập', promptText: 'I do my homework after dinner.', vietnameseMeaning: 'Tôi làm bài tập sau bữa tối.', focusSounds: ['do my', 'homework', 'after'], targetWords: ['homework', 'after', 'dinner'] },
  { id: 'a1-thank-you', level: 'A1', type: 'phrase', titleVi: 'Cảm ơn tự nhiên', promptText: 'Thank you very much.', vietnameseMeaning: 'Cảm ơn bạn rất nhiều.', focusSounds: ['/θ/ thank', 'very', 'much'], targetWords: ['thank', 'very', 'much'] },
  { id: 'a1-see-you', level: 'A1', type: 'phrase', titleVi: 'Tạm biệt', promptText: 'See you tomorrow.', vietnameseMeaning: 'Hẹn gặp bạn ngày mai.', focusSounds: ['see you', 'tomorrow', 'word stress'], targetWords: ['see', 'you', 'tomorrow'] },
  { id: 'a2-turn-left', level: 'A2', type: 'sentence', titleVi: 'Chỉ đường rẽ trái', promptText: 'Turn left at the traffic lights.', vietnameseMeaning: 'Rẽ trái ở đèn giao thông.', focusSounds: ['turn', 'left at', 'traffic lights'], targetWords: ['turn', 'left', 'traffic'] },
  { id: 'a2-bus-stop', level: 'A2', type: 'sentence', titleVi: 'Hỏi trạm xe buýt', promptText: 'Where is the nearest bus stop?', vietnameseMeaning: 'Trạm xe buýt gần nhất ở đâu?', focusSounds: ['where is', 'nearest', 'bus stop'], targetWords: ['where', 'nearest', 'stop'] },
  { id: 'a2-shopping-price', level: 'A2', type: 'sentence', titleVi: 'Hỏi giá', promptText: 'How much is this blue shirt?', vietnameseMeaning: 'Chiếc áo xanh này giá bao nhiêu?', focusSounds: ['how much', 'this blue', 'shirt'], targetWords: ['much', 'blue', 'shirt'] },
  { id: 'a2-shopping-size', level: 'A2', type: 'sentence', titleVi: 'Hỏi kích cỡ', promptText: 'Do you have a smaller size?', vietnameseMeaning: 'Bạn có cỡ nhỏ hơn không?', focusSounds: ['do you', 'smaller', 'size'], targetWords: ['have', 'smaller', 'size'] },
  { id: 'a2-travel-ticket', level: 'A2', type: 'sentence', titleVi: 'Mua vé', promptText: 'I need one ticket to Da Nang.', vietnameseMeaning: 'Tôi cần một vé đi Đà Nẵng.', focusSounds: ['need one', 'ticket', 'Da Nang'], targetWords: ['need', 'ticket', 'nang'] },
  { id: 'a2-hotel', level: 'A2', type: 'sentence', titleVi: 'Nhận phòng', promptText: 'We booked a room for two nights.', vietnameseMeaning: 'Chúng tôi đã đặt phòng cho hai đêm.', focusSounds: ['booked a', 'room', 'two nights'], targetWords: ['booked', 'room', 'nights'] },
  { id: 'a2-hobby-music', level: 'A2', type: 'sentence', titleVi: 'Sở thích âm nhạc', promptText: 'I enjoy listening to pop music.', vietnameseMeaning: 'Tôi thích nghe nhạc pop.', focusSounds: ['enjoy', 'listening to', 'music'], targetWords: ['enjoy', 'listening', 'music'] },
  { id: 'a2-hobby-football', level: 'A2', type: 'sentence', titleVi: 'Sở thích thể thao', promptText: 'My brother plays football on Sundays.', vietnameseMeaning: 'Anh/em trai tôi chơi bóng đá vào Chủ nhật.', focusSounds: ['brother', 'plays football', 'Sundays'], targetWords: ['brother', 'football', 'sundays'] },
  { id: 'a2-plan-movie', level: 'A2', type: 'sentence', titleVi: 'Kế hoạch xem phim', promptText: 'We are going to watch a movie tonight.', vietnameseMeaning: 'Tối nay chúng tôi sẽ xem phim.', focusSounds: ['going to', 'watch a', 'tonight'], targetWords: ['going', 'watch', 'tonight'] },
  { id: 'a2-plan-meet', level: 'A2', type: 'sentence', titleVi: 'Hẹn gặp bạn', promptText: 'Let us meet in front of the cafe.', vietnameseMeaning: 'Chúng ta gặp nhau trước quán cà phê nhé.', focusSounds: ['let us', 'front of', 'cafe'], targetWords: ['meet', 'front', 'cafe'] },
  { id: 'a2-weather', level: 'A2', type: 'sentence', titleVi: 'Nói về thời tiết', promptText: 'It may rain this afternoon.', vietnameseMeaning: 'Chiều nay có thể trời mưa.', focusSounds: ['may rain', 'this afternoon', 'final /n/'], targetWords: ['may', 'rain', 'afternoon'] },
  { id: 'a2-simple-dialogue', level: 'A2', type: 'mini-dialogue', titleVi: 'Đối thoại ngắn', promptText: 'Excuse me, is this seat free?', vietnameseMeaning: 'Xin lỗi, chỗ này còn trống không?', focusSounds: ['excuse me', 'seat', 'free'], targetWords: ['excuse', 'seat', 'free'] },
  { id: 'b1-study-habit', level: 'B1', type: 'sentence', titleVi: 'Thói quen học tập', promptText: 'I review new words for ten minutes every night.', vietnameseMeaning: 'Tôi ôn từ mới mười phút mỗi tối.', focusSounds: ['review', 'new words', 'every night'], targetWords: ['review', 'words', 'night'] },
  { id: 'b1-teamwork', level: 'B1', type: 'sentence', titleVi: 'Làm việc nhóm', promptText: 'Our team shared the work and finished on time.', vietnameseMeaning: 'Nhóm chúng tôi chia việc và hoàn thành đúng hạn.', focusSounds: ['our team', 'shared the work', 'finished'], targetWords: ['team', 'shared', 'finished'] },
  { id: 'b1-part-time-job', level: 'B1', type: 'sentence', titleVi: 'Việc làm thêm', promptText: 'A part-time job can teach students responsibility.', vietnameseMeaning: 'Việc làm thêm có thể dạy học sinh tinh thần trách nhiệm.', focusSounds: ['part-time', 'students', 'responsibility'], targetWords: ['part', 'students', 'responsibility'] },
  { id: 'b1-online-class', level: 'B1', type: 'sentence', titleVi: 'Lớp học trực tuyến', promptText: 'Online classes are useful when students ask questions.', vietnameseMeaning: 'Lớp trực tuyến hữu ích khi học sinh đặt câu hỏi.', focusSounds: ['online classes', 'useful', 'questions'], targetWords: ['online', 'useful', 'questions'] },
  { id: 'b1-opinion-reading', level: 'B1', type: 'sentence', titleVi: 'Nêu ý kiến về đọc sách', promptText: 'In my opinion, reading stories improves vocabulary.', vietnameseMeaning: 'Theo tôi, đọc truyện cải thiện vốn từ vựng.', focusSounds: ['opinion', 'reading stories', 'vocabulary'], targetWords: ['opinion', 'stories', 'vocabulary'] },
  { id: 'b1-study-break', level: 'B1', type: 'sentence', titleVi: 'Nghỉ giải lao', promptText: 'Short breaks help me stay focused during long lessons.', vietnameseMeaning: 'Nghỉ ngắn giúp tôi tập trung trong bài học dài.', focusSounds: ['short breaks', 'focused', 'long lessons'], targetWords: ['breaks', 'focused', 'lessons'] },
  { id: 'b1-feedback', level: 'B1', type: 'sentence', titleVi: 'Nhận góp ý', promptText: 'Clear feedback helps learners fix small pronunciation mistakes.', vietnameseMeaning: 'Góp ý rõ ràng giúp người học sửa lỗi phát âm nhỏ.', focusSounds: ['clear feedback', 'learners', 'pronunciation'], targetWords: ['feedback', 'learners', 'pronunciation'] },
  { id: 'b1-presentation', level: 'B1', type: 'sentence', titleVi: 'Thuyết trình nhóm', promptText: 'I will explain the first slide in our presentation.', vietnameseMeaning: 'Tôi sẽ giải thích slide đầu tiên trong bài thuyết trình của nhóm.', focusSounds: ['explain', 'first slide', 'presentation'], targetWords: ['explain', 'slide', 'presentation'] },
  { id: 'b1-problem-solving', level: 'B1', type: 'sentence', titleVi: 'Giải quyết vấn đề', promptText: 'We solved the problem by testing two simple ideas.', vietnameseMeaning: 'Chúng tôi giải quyết vấn đề bằng cách thử hai ý tưởng đơn giản.', focusSounds: ['solved', 'problem', 'testing two'], targetWords: ['solved', 'problem', 'testing'] },
  { id: 'b1-opinion-phone', level: 'B1', type: 'sentence', titleVi: 'Ý kiến về điện thoại', promptText: 'I think phones are helpful, but we need limits.', vietnameseMeaning: 'Tôi nghĩ điện thoại hữu ích, nhưng chúng ta cần giới hạn.', focusSounds: ['think phones', 'helpful', 'limits'], targetWords: ['think', 'helpful', 'limits'] },
  { id: 'b2-learning-strategy', level: 'B2', type: 'sentence', titleVi: 'Chiến lược học', promptText: 'A realistic study plan is easier to maintain than a perfect one.', vietnameseMeaning: 'Một kế hoạch học thực tế dễ duy trì hơn một kế hoạch hoàn hảo.', focusSounds: ['realistic', 'maintain', 'perfect one'], targetWords: ['realistic', 'maintain', 'perfect'] },
  { id: 'b2-career-goals', level: 'B2', type: 'sentence', titleVi: 'Mục tiêu nghề nghiệp', promptText: 'My long-term goal is to communicate confidently at work.', vietnameseMeaning: 'Mục tiêu dài hạn của tôi là giao tiếp tự tin trong công việc.', focusSounds: ['long-term goal', 'communicate', 'confidently'], targetWords: ['goal', 'communicate', 'confidently'] },
  { id: 'b2-digital-habits', level: 'B2', type: 'sentence', titleVi: 'Thói quen số', promptText: 'Healthy digital habits can protect our attention and sleep.', vietnameseMeaning: 'Thói quen số lành mạnh có thể bảo vệ sự tập trung và giấc ngủ.', focusSounds: ['healthy digital', 'protect our', 'attention'], targetWords: ['digital', 'protect', 'attention'] },
  { id: 'b2-environment', level: 'B2', type: 'sentence', titleVi: 'Môi trường', promptText: 'Small daily choices can reduce waste in our community.', vietnameseMeaning: 'Những lựa chọn nhỏ hằng ngày có thể giảm rác thải trong cộng đồng.', focusSounds: ['daily choices', 'reduce waste', 'community'], targetWords: ['choices', 'reduce', 'community'] },
  { id: 'b2-presentation-opening', level: 'B2', type: 'sentence', titleVi: 'Mở đầu thuyết trình', promptText: 'Today, I would like to discuss three practical solutions.', vietnameseMeaning: 'Hôm nay, tôi muốn thảo luận ba giải pháp thực tế.', focusSounds: ['would like to', 'discuss', 'practical solutions'], targetWords: ['discuss', 'practical', 'solutions'] },
  { id: 'b2-balanced-view', level: 'B2', type: 'sentence', titleVi: 'Quan điểm cân bằng', promptText: 'Although technology saves time, it can also create distractions.', vietnameseMeaning: 'Mặc dù công nghệ tiết kiệm thời gian, nó cũng có thể gây xao nhãng.', focusSounds: ['although', 'technology', 'distractions'], targetWords: ['although', 'technology', 'distractions'] },
  { id: 'b2-career-learning', level: 'B2', type: 'sentence', titleVi: 'Học cho công việc', promptText: 'Consistent practice makes professional conversations less stressful.', vietnameseMeaning: 'Luyện tập đều đặn giúp các cuộc trò chuyện công việc bớt căng thẳng.', focusSounds: ['consistent practice', 'professional', 'stressful'], targetWords: ['consistent', 'professional', 'stressful'] },
  { id: 'b2-closing-presentation', level: 'B2', type: 'sentence', titleVi: 'Kết bài thuyết trình', promptText: 'To conclude, these changes are simple, affordable, and effective.', vietnameseMeaning: 'Tóm lại, những thay đổi này đơn giản, hợp túi tiền và hiệu quả.', focusSounds: ['to conclude', 'affordable', 'effective'], targetWords: ['conclude', 'affordable', 'effective'] },
];

function commonMistakes(level: SpeechCefrLevel, targetWords: string[]) {
  const joined = targetWords.join(', ');
  if (level === 'A1') return [`Dễ nuốt âm cuối ở: ${joined}.`, 'Nói từng từ quá rời; hãy nối các cụm ngắn.'];
  if (level === 'A2') return [`Dễ bỏ âm nối hoặc nhấn sai ở: ${joined}.`, 'Đừng đọc quá nhanh khi gặp cụm hai hoặc ba từ.'];
  if (level === 'B1') return [`Câu dài dễ mất trọng âm ở: ${joined}.`, 'Chú ý nhịp câu: nhóm ý trước, nói rõ sau.'];
  return [`Từ dài dễ bị đều giọng ở: ${joined}.`, 'Giữ nhịp tự nhiên, nhấn vào từ mang ý chính.'];
}

function retryTips(level: SpeechCefrLevel, focusSounds: string[]) {
  const first = focusSounds[0] ?? 'âm chính';
  if (level === 'A1') return [`Nói chậm hơn 20% và giữ rõ ${first}.`, 'Nghe mẫu một lần rồi đọc lại nguyên câu.'];
  if (level === 'A2') return [`Chia câu thành hai nhịp, tập kỹ ${first}.`, 'Đọc lại từ khóa trước rồi mới nói cả câu.'];
  if (level === 'B1') return [`Gạch nhịp trong đầu trước khi nói; ưu tiên ${first}.`, 'Nếu điểm thấp, luyện riêng ba target words.'];
  return [`Nói như đang trình bày: rõ ý, rõ trọng âm, không vội.`, `Kiểm tra ${first} rồi thử lại với tốc độ tự nhiên.`];
}

function whaleCoachLines(level: SpeechCefrLevel) {
  if (level === 'A1') return ['Cá voi nghe được ý chính rồi, giờ mình làm âm cuối sáng hơn nhé.', 'Chậm một chút thôi là câu sẽ rõ hơn nhiều.'];
  if (level === 'A2') return ['Bạn đang kiểm soát câu tốt hơn rồi, thử nối cụm mềm hơn nhé.', 'Đọc theo nhịp ngắn, không cần vội.'];
  if (level === 'B1') return ['Câu dài vẫn ổn nếu bạn giữ trọng âm chính.', 'Tập trung vào từ khóa, phần còn lại để nhịp dẫn đi.'];
  return ['Giọng đang có chất thuyết trình rồi, hãy làm rõ điểm nhấn.', 'Một lần nữa với nhịp bình tĩnh hơn sẽ rất đẹp.'];
}

export const generatedSpeechPrompts: GeneratedSpeechPrompt[] = seeds.map((seed, index) => ({
  ...seed,
  slowHintVi: `Đọc chậm theo cụm: ${seed.promptText.split(' ').slice(0, Math.ceil(seed.promptText.split(' ').length / 2)).join(' ')} / ${seed.promptText.split(' ').slice(Math.ceil(seed.promptText.split(' ').length / 2)).join(' ')}`,
  commonMistakesVi: commonMistakes(seed.level, seed.targetWords),
  retryTipsVi: retryTips(seed.level, seed.focusSounds),
  whaleCoachLines: whaleCoachLines(seed.level),
  source: index % 9 === 0 ? uxReferenceSource : speechPronunciationSource,
}));

export function getGeneratedSpeechPromptById(id: string) {
  return generatedSpeechPrompts.find((prompt) => prompt.id === id) ?? null;
}

export const speechPromptCountsByLevel = generatedSpeechPrompts.reduce<Record<SpeechCefrLevel, number>>((counts, prompt) => {
  counts[prompt.level] += 1;
  return counts;
}, { A1: 0, A2: 0, B1: 0, B2: 0 });
