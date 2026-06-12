import type { GeneratedGrammarExercise, GeneratedGrammarLessonSource, GeneratedGrammarLevel } from './grammarTypes';

function normalizeWords(text: string) {
  return text.replace(/[.!?]/g, '').split(/\s+/).filter(Boolean);
}

function buildGrammarReviewExercises(lesson: GeneratedGrammarLessonSource): GeneratedGrammarExercise[] {
  const firstExample = lesson.examples[0] ?? { text: 'I can practise English every day.', meaningVi: 'Tôi có thể luyện tiếng Anh mỗi ngày.' };
  const secondExample = lesson.examples[1] ?? firstExample;
  const thirdExample = lesson.examples[2] ?? secondExample;
  const blankWords = normalizeWords(secondExample.text);
  const blankAnswer = blankWords[0] ?? 'I';
  const blankPattern = new RegExp(`^${blankAnswer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  const blankPrompt = secondExample.text.replace(blankPattern, '___');
  const orderWords = normalizeWords(thirdExample.text);
  const orderAnswer = orderWords.join(' ');

  return [
    {
      id: `${lesson.id}-review-mc-example`,
      type: 'multiple-choice',
      promptVi: `Chọn câu đúng theo mẫu: ${firstExample.meaningVi}`,
      options: [firstExample.text, firstExample.text.replace(/\b(is|are|am|have|has|can|should|will)\b/i, '___'), 'This sentence is not natural.', 'I not sure this grammar.'],
      answer: firstExample.text,
      hintVi: 'Nhìn lại ví dụ chính và chọn câu hoàn chỉnh, tự nhiên nhất.',
      explanationVi: `Câu đúng giữ nguyên mẫu ngữ pháp của bài: ${lesson.titleVi}.`,
    },
    {
      id: `${lesson.id}-review-fill-context`,
      type: 'fill-blank',
      promptVi: `Điền từ/cụm còn thiếu để hoàn thành ví dụ: ${secondExample.meaningVi}`,
      promptEn: blankPrompt,
      answer: blankAnswer,
      hintVi: 'Đọc cả câu trước khi điền; vị trí trống nằm ở đầu mẫu câu.',
      explanationVi: `Từ/cụm “${blankAnswer}” mở đầu câu mẫu và giúp cấu trúc đúng ngữ cảnh.`,
    },
    {
      id: `${lesson.id}-review-order-example`,
      type: 'sentence-order',
      promptVi: `Sắp xếp lại câu mẫu: ${thirdExample.meaningVi}`,
      words: orderWords,
      answer: orderAnswer,
      hintVi: 'Giữ đúng thứ tự chủ ngữ, động từ và phần bổ sung ý nghĩa.',
      explanationVi: 'Thứ tự này tạo thành câu hoàn chỉnh, đúngữ pháp của bài.',
    },
  ];
}

function expandGrammarLesson(lesson: GeneratedGrammarLessonSource): GeneratedGrammarLessonSource {
  if (lesson.exercises.length >= 6) return lesson;
  return {
    ...lesson,
    exercises: [...lesson.exercises, ...buildGrammarReviewExercises(lesson)].slice(0, 8),
  };
}

type GrammarExpansionSeed = {
  id: string;
  unitId: string;
  level: GeneratedGrammarLevel;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  patternTitle: string;
  patternDescription: string;
  patternSummary: string;
  explanationVi: string;
  examples: Array<{ text: string; meaningVi: string }>;
  sourcePatternId: string;
};

function buildExpandedGrammarLesson(seed: GrammarExpansionSeed): GeneratedGrammarLessonSource {
  const [first, second, third, fourth, fifth] = seed.examples;
  const secondWords = normalizeWords(second.text);
  const secondAnswer = secondWords[0] ?? 'I';
  const secondBlank = second.text.replace(new RegExp(`^${secondAnswer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), '___');
  const thirdWords = normalizeWords(third.text);
  const fourthWords = normalizeWords(fourth.text);
  const fourthAnswer = fourthWords[0] ?? 'This';
  const fourthBlank = fourth.text.replace(new RegExp(`^${fourthAnswer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), '___');

  return {
    id: seed.id,
    unitId: seed.unitId,
    titleVi: seed.titleVi,
    titleEn: seed.titleEn,
    subtitleVi: seed.subtitleVi,
    level: seed.level,
    estimatedTime: seed.level === 'B2' ? '16–18 phút' : seed.level === 'B1' ? '14–16 phút' : '12–15 phút',
    sourcePatternTitle: seed.patternTitle,
    sourcePatternDescription: seed.patternDescription,
    sourcePatternSummary: seed.patternSummary,
    vietnameseExplanation: seed.explanationVi,
    examples: seed.examples,
    exercises: [
      { id: `${seed.id}-mc-main`, type: 'multiple-choice', promptVi: `Chọn câu đúng: ${first.meaningVi}`, options: [first.text, first.text.replace(/\b(is|are|am|have|has|do|does|did|will|would|can|should|to)\b/i, '___'), 'This grammar does not match the meaning.', 'The word order is not natural.'], answer: first.text, hintVi: 'So sánh ý tiếng Việt với câu hoàn chỉnh, tự nhiên nhất.', explanationVi: `Đúng rồi, câu này đi theo mẫu chính của bài: ${seed.titleVi}.` },
      { id: `${seed.id}-fill-first-word`, type: 'fill-blank', promptVi: `Điền phần còn thiếu: ${second.meaningVi}`, promptEn: secondBlank, answer: secondAnswer, hintVi: 'Ô trống nằm ở đầu câu; đọc cả câu trước khi điền.', explanationVi: `Đúng rồi, “${secondAnswer}” mở đầu câu từ vựng mẫu mình đang luyện.` },
      { id: `${seed.id}-order-focus`, type: 'sentence-order', promptVi: `Sắp xếp câu: ${third.meaningVi}`, words: thirdWords, answer: thirdWords.join(' '), hintVi: 'Sắp theo thứ tự chủ ngữ → động từ → phần bổ sung.', explanationVi: 'Đúng rồi, thứ tự này tạo thành câu đầy đủ theo mẫu Poo đang dẫn bạn luyện.' },
      { id: `${seed.id}-mc-context`, type: 'multiple-choice', promptVi: `Chọn câu phù hợp với ngữ cảnh: ${fifth.meaningVi}`, options: [fifth.text, fifth.text.replace(/\b(not|never|already|because|although|if|when)\b/i, '___'), 'The idea is unclear in this sentence.', 'Use only one word without a full sentence.'], answer: fifth.text, hintVi: 'Chọn câu diễn đạtừ vựng cấu trúc.', explanationVi: 'Đúng rồi, đáp án này nói từ vựnghe tự nhiên hơn.' },
      { id: `${seed.id}-fill-review`, type: 'fill-blank', promptVi: `Hoàn thành câu ôn tập: ${fourth.meaningVi}`, promptEn: fourthBlank, answer: fourthAnswer, hintVi: 'Tập trung vào từ/cụm mở đầu câu.', explanationVi: `Đúng rồi, “${fourthAnswer}” giúp câu đầy đủ và đúng mẫu hơn.` },
      { id: `${seed.id}-order-review`, type: 'sentence-order', promptVi: `Sắp xếp câu ôn tập: ${fourth.meaningVi}`, words: fourthWords, answer: fourthWords.join(' '), hintVi: 'Giữ đúng trật tự cụm ý, không dịch từng từ.', explanationVi: 'Đúng rồi, câu hoàn chỉnh giúp mình luyện theo cụm ngắn dễ nhớ hơn.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: seed.sourcePatternId },
  };
}

const grammarExpansionSeeds: GrammarExpansionSeed[] = [
  { id: 'grammar-a1-there-is-there-are', unitId: 'grammar-foundations-a1', level: 'A1', titleVi: 'There is / There are', titleEn: 'There is and there are', subtitleVi: 'Nói có một vật hoặc nhiều vật ở đâu đó bằng câu ngắn, rõ.', patternTitle: 'Existence: there is vs there are', patternDescription: 'Choose there is or there are for singular and plural nouns.', patternSummary: 'Mẫu luyện there is + singular/uncountable và there are + plural trong ngữ cảnh lớp học, nhà và thành phố.', explanationVi: 'Dùng there is khi nói có một người/vật hoặc danh từ không đếm được; dùng there are khi nói có nhiều người/vật.', sourcePatternId: 'there-is-there-are', examples: [
    { text: 'There is a whale on the page.', meaningVi: 'Có một chú cá voi trên trang.' },
    { text: 'There are three books on the desk.', meaningVi: 'Có ba quyển sách trên bàn.' },
    { text: 'There is some water in the bottle.', meaningVi: 'Có một ít nước trong chai.' },
    { text: 'There are many students in the room.', meaningVi: 'Có nhiều học sinh trong phòng.' },
    { text: 'There is a small cafe near my school.', meaningVi: 'Có một quán cà phê nhỏ gần trường tôi.' },
  ] },
  { id: 'grammar-a1-can-for-ability', unitId: 'grammar-foundations-a1', level: 'A1', titleVi: 'Can để nói khả năng', titleEn: 'Can for ability', subtitleVi: 'Nói mình có thể làm gì và đặt câu hỏi “Can you...?” thật gọn.', patternTitle: 'Modal can: ability', patternDescription: 'Use can plus base verb for ability and simple requests.', patternSummary: 'Mẫu luyện can/cannot + động từ nguyên mẫu trong câu khả năng hằng ngày.', explanationVi: 'Sau can dùng động từ nguyên mẫu, không thêm s/es hay to. Phủ định là cannot/can’t.', sourcePatternId: 'can-ability', examples: [
    { text: 'I can read short English stories.', meaningVi: 'Tôi có thể đọc truyện tiếng Anh ngắn.' },
    { text: 'She can swim very well.', meaningVi: 'Cô ấy có thể bơi rất giỏi.' },
    { text: 'Can you spell this word?', meaningVi: 'Bạn có thể đánh vần từ này không?' },
    { text: 'We cannot hear the audio clearly.', meaningVi: 'Chúng tôi không thể nghe âm thanh rõ.' },
    { text: 'My brother can draw a blue whale.', meaningVi: 'Em trai tôi có thể vẽ một chú cá voi xanh.' },
  ] },
  { id: 'grammar-a2-past-simple-regular', unitId: 'grammar-verbs-a2', level: 'A2', titleVi: 'Quá khứ đơn với động từ có quy tắc', titleEn: 'Past simple with regular verbs', subtitleVi: 'Kể việc đã xảy ra bằng động từ thêm -ed và mốc thời gian rõ.', patternTitle: 'Past simple: regular verbs', patternDescription: 'Use regular -ed verbs with finished time.', patternSummary: 'Mẫu luyện V-ed với yesterday, last night, ago và các hoạt động quen thuộc.', explanationVi: 'Dùng quá khứ đơn cho hành động đã kết thúc. Động từ có quy tắc thường thêm -ed/-d, câu phủ định dùng did not + động từ nguyên mẫu.', sourcePatternId: 'past-simple-regular', examples: [
    { text: 'I watched a short video yesterday.', meaningVi: 'Hôm qua tôi đã xem mộtừ vựngắn.' },
    { text: 'She cleaned her room last night.', meaningVi: 'Tối qua cô ấy đã dọn phòng.' },
    { text: 'We practiced pronunciation after class.', meaningVi: 'Chúng tôi đã luyện phát âm sau giờ học.' },
    { text: 'They visited the museum two days ago.', meaningVi: 'Họ đã thăm bảo tàng hai ngày trước.' },
    { text: 'He did not finish the lesson yesterday.', meaningVi: 'Hôm qua anh ấy chưa hoàn thành bài học.' },
  ] },
  { id: 'grammar-a2-comparatives-everyday', unitId: 'grammar-adjectives-a2', level: 'A2', titleVi: 'So sánh hơn trong đời sống', titleEn: 'Everyday comparatives', subtitleVi: 'So sánh người, vật và lựa chọn bằng -er hoặc more.', patternTitle: 'Comparatives: -er and more', patternDescription: 'Make simple comparisons with short and long adjectives.', patternSummary: 'Mẫu luyện adjective-er than và more + adjective than trong lựa chọn hằng ngày.', explanationVi: 'Tính từ ngắn thường thêm -er; tính từ dài dùng more. Sau đó dùng than để nêu đối tượng so sánh.', sourcePatternId: 'comparatives-everyday', examples: [
    { text: 'This exercise is easier than the last one.', meaningVi: 'Bài tập này dễ hơn bài trước.' },
    { text: 'The blue bag is heavier than my old bag.', meaningVi: 'Chiếc túi xanh nặng hơn túi cũ của tôi.' },
    { text: 'This route is more convenient than the bus route.', meaningVi: 'Tuyến đường này tiện hơn tuyến xe buýt.' },
    { text: 'Reading slowly is better than guessing quickly.', meaningVi: 'Đọc chậm tốt hơn đoán nhanh.' },
    { text: 'The new lesson is more useful for speaking.', meaningVi: 'Bài mới hữu ích hơn cho nói.' },
  ] },
  { id: 'grammar-a2-going-to-plans', unitId: 'grammar-verbs-a2', level: 'A2', titleVi: 'Be going to cho kế hoạch', titleEn: 'Be going to for plans', subtitleVi: 'Nói kế hoạch gần hoặc ý định đã có trước bằng am/is/are going to.', patternTitle: 'Future plans: be going to', patternDescription: 'Use be going to plus base verb for planned future actions.', patternSummary: 'Mẫu luyện am/is/are going từ vựng kế hoạch học, đi lại và cuối tuần.', explanationVi: 'Dùng be going to khi đã có ý định hoặc kế hoạch. Chọn am/is/are theo chủ ngữ, sau đó dùng động từ nguyên mẫu.', sourcePatternId: 'going-to-plans', examples: [
    { text: 'I am going to review vocabulary tonight.', meaningVi: 'Tối nay tôi sẽ ôn từ vựng.' },
    { text: 'She is going to visit her aunt on Sunday.', meaningVi: 'Chủ nhật cô ấy sẽ thăm dì.' },
    { text: 'We are going to watch an English movie.', meaningVi: 'Chúng tôi sẽ xem một bộ phim tiếng Anh.' },
    { text: 'They are going to meet at the station.', meaningVi: 'Họ sẽ gặp nhau ở nhà ga.' },
    { text: 'He is not going to buy a new phone.', meaningVi: 'Anh ấy sẽ không mua điện thoại mới.' },
  ] },
  { id: 'grammar-b1-relative-clauses-people-things', unitId: 'grammar-clauses-b1', level: 'B1', titleVi: 'Mệnh đề quan hệ who / which / that', titleEn: 'Relative clauses for people and things', subtitleVi: 'Nối thêm từ vựngười hoặc vật mà không tách thành hai câu rời.', patternTitle: 'Relative clauses: who, which, that', patternDescription: 'Use who for people and which/that for things or ideas.', patternSummary: 'Mẫu luyện mệnh đề quan hệ xác định trong mô tả người, đồ vật và bài học.', explanationVi: 'Dùng who cho người; which cho vật/ý; that có thể thay who/which trong nhiều câu xác định.', sourcePatternId: 'relative-clauses-basic', examples: [
    { text: 'The teacher who helped me was very patient.', meaningVi: 'Giáo viên đã giúp tôi rất kiên nhẫn.' },
    { text: 'This is the whale that helps me practise.', meaningVi: 'Đây là chú cá voi giúp tôi luyện tập.' },
    { text: 'I like lessons which include clear examples.', meaningVi: 'Tôi thích các bài có ví dụ rõ ràng.' },
    { text: 'The friend who studies with me lives nearby.', meaningVi: 'Người bạn học cùng tôi sống gần đây.' },
    { text: 'The sentence that confused me is now easier.', meaningVi: 'Câu từng làm tôi rối giờ đã dễ hơn.' },
  ] },
  { id: 'grammar-b1-gerunds-after-verbs', unitId: 'grammar-verbs-b1', level: 'B1', titleVi: 'V-ing sau một số động từ', titleEn: 'Gerunds after common verbs', subtitleVi: 'Dùng V-ing sau enjoy, avoid, practise, finish để nói hoạt động tự nhiên hơn.', patternTitle: 'Gerunds after verbs', patternDescription: 'Use -ing forms after selected common verbs.', patternSummary: 'Mẫu luyện enjoy/avoid/practise/finish + V-ing trong học tập và sinh hoạt.', explanationVi: 'Một số động từ từ vựng phía sau. Không dùng to + verb sau enjoy, avoid, practise hoặc finish trong mẫu này.', sourcePatternId: 'gerunds-after-verbs', examples: [
    { text: 'I enjoy listening to short conversations.', meaningVi: 'Tôi thích nghe các đoạn hội thoại ngắn.' },
    { text: 'She avoids checking her phone while studying.', meaningVi: 'Cô ấy tránh kiểm tra điện thoại khi học.' },
    { text: 'We practise speaking English every morning.', meaningVi: 'Chúng tôi luyện nói tiếng Anh mỗi sáng.' },
    { text: 'He finished writing his paragraph before dinner.', meaningVi: 'Anh ấy viết xong đoạn văn trước bữa tối.' },
    { text: 'They keep reviewing difficult words together.', meaningVi: 'Họ tiếp tục ôn các từ khó cùng nhau.' },
  ] },
  { id: 'grammar-b1-used-to-habits', unitId: 'grammar-verbs-b1', level: 'B1', titleVi: 'Used to cho thói quen cũ', titleEn: 'Used to for past habits', subtitleVi: 'Nói điều từng thường xảy ra trước đây nhưng bây giờ đã khác.', patternTitle: 'Past habits: used to', patternDescription: 'Use used to plus base verb for past habits and states.', patternSummary: 'Mẫu luyện used to + verb để so sánh thói quen cũ và hiện tại.', explanationVi: 'Dùng used to + động từ nguyên mẫu cho thói quen/trạng thái trong quá khứ không còn đúng ở hiện tại.', sourcePatternId: 'used-to-past-habits', examples: [
    { text: 'I used to translate every word.', meaningVi: 'Tôi từng dịch từng từ một.' },
    { text: 'She used to be shy in English class.', meaningVi: 'Cô ấy từng nhút nhát trong lớp tiếng Anh.' },
    { text: 'We did not use to record our voices.', meaningVi: 'Trước đây chúng tôi không ghi âm giọng mình.' },
    { text: 'Did you use to study at night?', meaningVi: 'Bạn từng học vào ban đêm phải không?' },
    { text: 'He used to forget new vocabulary quickly.', meaningVi: 'Anh ấy từng quên từ mới rất nhanh.' },
  ] },
  { id: 'grammar-b1-passive-simple-processes', unitId: 'grammar-clauses-b1', level: 'B1', titleVi: 'Bị động hiện tại cho quy trình', titleEn: 'Present passive for simple processes', subtitleVi: 'Mô tả việc được làm như thế nào khi người thực hiện không quan trọng.', patternTitle: 'Present passive: processes', patternDescription: 'Use am/is/are plus past participle for simple processes.', patternSummary: 'Mẫu luyện bị động hiện tại trong hướng dẫn, quy trình học và mô tả sản phẩm.', explanationVi: 'Dùng am/is/are + V3 khi tập trung vào hành động/kết quả hơn người làm hành động.', sourcePatternId: 'present-passive-process', examples: [
    { text: 'New words are reviewed after each lesson.', meaningVi: 'Từ mới được ôn sau mỗi bài.' },
    { text: 'My answer is checked gently by Poo.', meaningVi: 'Poo xem câu trả lời của tôi thật nhẹ nhàng.' },
    { text: 'Short examples are added to the notebook.', meaningVi: 'Ví dụ ngắn được thêm vào vở.' },
    { text: 'The audio is played twice for practice.', meaningVi: 'Âm thanh được phát hai lần để luyện tập.' },
    { text: 'Poo keeps my small steps safe.', meaningVi: 'Poo giữ lại từng bước nhỏ cho tôi.' },
  ] },
  { id: 'grammar-b2-second-conditional-careful-advice', unitId: 'grammar-clauses-b2', level: 'B2', titleVi: 'Điều kiện loại 2 cho lời khuyên mềm', titleEn: 'Second conditional for careful advice', subtitleVi: 'Đưa giả định và lời khuyên lịch sự bằng if + quá khứ, would/could.', patternTitle: 'Second conditional advice', patternDescription: 'Use if plus past simple with would or could for hypothetical advice.', patternSummary: 'Mẫu luyện tình huống giả định để đưa lời khuyên mềm mại hơn.', explanationVi: 'Dùng if + quá khứ đơn, would/could + động từ nguyên mẫu để nói điều giả định hoặc lời khuyên gián tiếp.', sourcePatternId: 'second-conditional-advice', examples: [
    { text: 'If I had more time, I would practise speaking daily.', meaningVi: 'Nếu có nhiều thời gian hơn, tôi sẽ luyện nói hằng ngày.' },
    { text: 'If the lesson were shorter, more learners could finish it.', meaningVi: 'Nếu bài ngắn hơn, nhiều người học có thể hoàn thành hơn.' },
    { text: 'I would ask for feedback if I felt unsure.', meaningVi: 'Tôi sẽ xin góp ý nếu thấy chưa chắc.' },
    { text: 'If she knew the pattern, she could answer faster.', meaningVi: 'Nếu cô ấy biết mẫu câu, cô ấy có thể trả lời nhanh hơn.' },
    { text: 'If we recorded our practice, we would notice mistakes sooner.', meaningVi: 'Nếu ghi âm phần luyện tập, chúng tôi sẽ nhận ra lỗi sớm hơn.' },
  ] },
  { id: 'grammar-b2-linking-ideas-contrast', unitId: 'grammar-clauses-b2', level: 'B2', titleVi: 'Nối ý tương phản although / however', titleEn: 'Linking contrast with although and however', subtitleVi: 'Nói hai ý trái chiều một cách mạch lạc khi viết hoặc thuyết trình.', patternTitle: 'Contrast linkers', patternDescription: 'Use although inside a sentence and however between sentences.', patternSummary: 'Mẫu luyện nối ý tương phản bằng although, however, despite ở mức B2.', explanationVi: 'Although nối mệnh đề trong cùng câu; however thường đứng đầu câu mới và theo sau bằng dấu phẩy.', sourcePatternId: 'contrast-linkers-b2', examples: [
    { text: 'Although the task was difficult, we finished it on time.', meaningVi: 'Mặc dù nhiệm vụ khó, chúng tôi hoàn thành đúng hạn.' },
    { text: 'Poo is gentle. However, the feedback is still useful.', meaningVi: 'Poo nhẹ nhàng. Tuy nhiên, phần góp ý vẫn rất hữu ích.' },
    { text: 'Despite the noise, she stayed focused on the lesson.', meaningVi: 'Dù ồn, cô ấy vẫn tập trung vào bài học.' },
    { text: 'Although I made mistakes, I kept speaking.', meaningVi: 'Mặc dù mắc lỗi, tôi vẫn tiếp tục nói.' },
    { text: 'The sentence is long. However, the meaning is clear.', meaningVi: 'Câu dài. Tuy nhiên, nghĩa vẫn rõ.' },
  ] },
  { id: 'grammar-b2-reported-speech-feedback', unitId: 'grammar-clauses-b2', level: 'B2', titleVi: 'Tường thuật góp ý và lời nhắc', titleEn: 'Reported speech for feedback', subtitleVi: 'Kể lại lời góp ý, lời nhắc hoặc ý kiến mà không cần trích nguyên văn.', patternTitle: 'Reported speech: feedback', patternDescription: 'Report advice, reminders, and opinions with said, told, and suggested.', patternSummary: 'Mẫu luyện said that, told someone to, suggested -ing trong ngữ cảnh học tập.', explanationVi: 'Khi tường thuật, có thể dùng said that + mệnh đề, told someone to + verb, hoặc suggestừ vựng.', sourcePatternId: 'reported-speech-feedback', examples: [
    { text: 'My teacher said that my pronunciation was clearer.', meaningVi: 'Giáo viên nói phát âm của tôi rõ hơn.' },
    { text: 'She told me to slow down before long words.', meaningVi: 'Cô ấy bảo tôi chậm lại trước các từ dài.' },
    { text: 'He suggested recording one sentence again.', meaningVi: 'Anh ấy đề nghị ghi âm lại một câu.' },
    { text: 'They said that the explanation was easy to follow.', meaningVi: 'Họ nói phần giải thích dễ theo dõi.' },
    { text: 'The coach told us to focus on word stress.', meaningVi: 'Huấn luyện viên bảo chúng tôi từ vựng âm từ.' },
  ] },
];

const fluentcardsSource = {
  repoName: 'fluentcards-grammar',
  repoUrl: 'https://github.com/katspaugh/fluentcards-grammar',
  localSourcePath: 'external-sources/fluentcards-grammar/src/grammar/patterns.js',
  license: 'MIT',
  attribution: 'Copyright (c) 2021 katspaugh. English pattern definitions and cloze-generation approach adapted into P-English grammar modules.',
  integrationMode: 'adapted-pattern-logic' as const,
};

export const generatedGrammarLessonSources: GeneratedGrammarLessonSource[] = ([
  {
    id: 'grammar-a1-articles-a-an-the',
    unitId: 'grammar-foundations-a1',
    titleVi: 'Mạo từ a / an / the',
    titleEn: 'Articles: a, an, the',
    subtitleVi: 'Chọn mạo từ đúng trước danh từ và hiểu khi nào nói chung, khi nào nói vật/người đã biết.',
    level: 'A1',
    estimatedTime: '12–15 phút',
    sourcePatternTitle: 'Articles: definite vs indefinite',
    sourcePatternDescription: 'Choose the right article.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn chọn a, an hoặc the cho đúng tình huống.',
    vietnameseExplanation: 'Dùng a trước âm phụ âm, an trước âm nguyên âm, và the khi người nghe đã biết rõ đối tượng đang nói tới.',
    examples: [
      { text: 'I have a book.', meaningVi: 'Tôi có một quyển sách.' },
      { text: 'She has an umbrella.', meaningVi: 'Cô ấy có một cái ô.' },
      { text: 'The book is on the desk.', meaningVi: 'Quyển sách đó ở trên bàn.' },
    ],
    exercises: [
      { id: 'articles-mc-book', type: 'multiple-choice', promptVi: 'Chọn câu đúng: “Tôi có một quyển sách.”', options: ['I have a book.', 'I have an book.', 'I have the book.', 'I have book.'], answer: 'I have a book.', hintVi: 'book bắt đầu bằng âm /b/.', explanationVi: 'Dùng a trước danh từ số ít bắt đầu bằng âm phụ âm.' },
      { id: 'articles-fill-apple', type: 'fill-blank', promptVi: 'Điền mạo từ đúng.', promptEn: 'She eats ___ apple.', answer: 'an', hintVi: 'apple bắt đầu bằng âm nguyên âm.', explanationVi: 'Dùng an trước âm nguyên âm như apple.' },
      { id: 'articles-order-desk', type: 'sentence-order', promptVi: 'Sắp xếp: Quyển sách đó ở trên bàn.', words: ['The', 'book', 'is', 'on', 'the', 'desk'], answer: 'The book is on the desk', hintVi: 'Đối tượng đã rõ nên dùng the.', explanationVi: 'The book và the desk nói về vật đã xác định trong ngữ cảnh.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'a-vs-the' },
  },
  {
    id: 'grammar-a2-quantifiers-many-much',
    unitId: 'grammar-quantifiers-a2',
    titleVi: 'many / much / few / little',
    titleEn: 'Quantifiers: many, much, few, little',
    subtitleVi: 'phátừ vựng đếm được trong câu đời sống hằng ngày.',
    level: 'A2',
    estimatedTime: '12–15 phút',
    sourcePatternTitle: 'Quantifiers: many vs much, few vs little',
    sourcePatternDescription: 'Choose the right answer.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn chọn many, much, few hoặc little theo danh từ đi kèm.',
    vietnameseExplanation: 'Dùng many/few với danh từ đếm được số nhiều; dùng much/little với danh từ không đếm được.',
    examples: [
      { text: 'There are many students in the class.', meaningVi: 'Có nhiều học sinh trong lớp.' },
      { text: 'I do not have much time.', meaningVi: 'Tôi không có nhiều thời gian.' },
      { text: 'She has a few questions.', meaningVi: 'Cô ấy có một vài câu hỏi.' },
    ],
    exercises: [
      { id: 'many-much-mc-time', type: 'multiple-choice', promptVi: 'Chọn câu đúng với “time”.', options: ['I do not have much time.', 'I do not have many time.', 'I do not have few time.', 'I do not have a students.'], answer: 'I do not have much time.', hintVi: 'time thường không đếm được.', explanationVi: 'Dùng much với danh từ không đếm được như time.' },
      { id: 'many-much-fill-students', type: 'fill-blank', promptVi: 'Điền lượng từ đúng.', promptEn: 'There are ___ students in the room.', answer: 'many', hintVi: 'students là danh từ đếm được số nhiều.', explanationVi: 'Dùng many với danh từ đếm được số nhiều.' },
      { id: 'many-much-order-water', type: 'sentence-order', promptVi: 'Sắp xếp: Tôi uống một ít nước.', words: ['I', 'drink', 'a', 'little', 'water'], answer: 'I drink a little water', hintVi: 'water không đếm được.', explanationVi: 'a little water là cụm tự nhiên cho lượng nhỏ của danh từ không đếm được.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'many-vs-much' },
  },
  {
    id: 'grammar-a2-each-every',
    unitId: 'grammar-quantifiers-a2',
    titleVi: 'each / every',
    titleEn: 'Quantifiers: each and every',
    subtitleVi: 'Nói “mỗi” theo hai cách: nhấn từng cá thể hoặc nói toàn bộ nhóm.',
    level: 'A2',
    estimatedTime: '10–12 phút',
    sourcePatternTitle: 'Quantifiers: each vs every',
    sourcePatternDescription: 'Choose the right answer.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn chọn each hoặc every theo ý muốn nói.',
    vietnameseExplanation: 'each nhấn từng người/vật riêng lẻ; every nhấn toàn bộ nhóm theo nghĩa tất cả.',
    examples: [
      { text: 'Each student has a book.', meaningVi: 'Mỗi học sinh đều có một quyển sách.' },
      { text: 'Every day, I study English.', meaningVi: 'Mỗi ngày tôi học tiếng Anh.' },
      { text: 'Each answer is important.', meaningVi: 'Mỗi câu trả lời đều quan trọng.' },
    ],
    exercises: [
      { id: 'each-every-mc-day', type: 'multiple-choice', promptVi: 'Chọn cụm tự nhiên nhất để nói “mỗi ngày”.', options: ['Every day', 'Each days', 'Every students', 'Each time every'], answer: 'Every day', hintVi: 'Cụm chỉ thói quen hằng ngày thường dùng every day.', explanationVi: 'Every day là cụm cố định rất thường gặp.' },
      { id: 'each-every-fill-student', type: 'fill-blank', promptVi: 'Điền each hoặc every.', promptEn: '___ student has a card.', answer: 'Each', hintVi: 'Nhấn từng học sinh riêng lẻ.', explanationVi: 'Each student nhấn từng cá thể trong nhóm.' },
      { id: 'each-every-order', type: 'sentence-order', promptVi: 'Sắp xếp: Mỗi câu trả lời đều quan trọng.', words: ['Each', 'answer', 'is', 'important'], answer: 'Each answer is important', hintVi: 'Nhấn từng câu trả lời.', explanationVi: 'Each + danh từ số ít + động từ số ít.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'each-vs-every' },
  },
  {
    id: 'grammar-a2-some-any',
    unitId: 'grammar-quantifiers-a2',
    titleVi: 'some / any',
    titleEn: 'Quantifiers: some and any',
    subtitleVi: 'Dùng some trong câu khẳng định/lời mời và any trong câu phủ định/câu hỏi cơ bản.',
    level: 'A2',
    estimatedTime: '10–12 phút',
    sourcePatternTitle: 'Quantifiers: some vs any',
    sourcePatternDescription: 'Choose the right answer.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn chọn some hoặc any theo câu đang nói.',
    vietnameseExplanation: 'some thường dùng trong câu khẳng định hoặc lời mời; any thường dùng trong câu phủ định và câu hỏi thông tin chung.',
    examples: [
      { text: 'I have some water.', meaningVi: 'Tôi có một ít nước.' },
      { text: 'Do you have any questions?', meaningVi: 'Bạn có câu hỏi nào không?' },
      { text: 'We do not have any milk.', meaningVi: 'Chúng tôi không có chút sữa nào.' },
    ],
    exercises: [
      { id: 'some-any-mc-question', type: 'multiple-choice', promptVi: 'Chọn câu hỏi tự nhiên nhất.', options: ['Do you have any questions?', 'Do you have some questions?', 'You have any water.', 'Any I have water.'], answer: 'Do you have any questions?', hintVi: 'Câu hỏi thường dùng any.', explanationVi: 'Trong câu hỏi chung, any là lựa chọn an toàn.' },
      { id: 'some-any-fill-water', type: 'fill-blank', promptVi: 'Điền some hoặc any.', promptEn: 'I have ___ water.', answer: 'some', hintVi: 'Đây là câu khẳng định.', explanationVi: 'Câu khẳng định thường dùng some.' },
      { id: 'some-any-order-milk', type: 'sentence-order', promptVi: 'Sắp xếp: Chúng tôi không có sữa nào.', words: ['We', 'do', 'not', 'have', 'any', 'milk'], answer: 'We do not have any milk', hintVi: 'Câu phủ định dùng any.', explanationVi: 'not have any + danh từ là cấu trúc phủ định cơ bản.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'some-vs-any' },
  },
  {
    id: 'grammar-b1-irregular-verbs',
    unitId: 'grammar-verbs-b1',
    titleVi: 'Động từ bất quy tắc thường gặp',
    titleEn: 'Common irregular verbs',
    subtitleVi: 'Nhận diện dạng quá khứ/quá khứ phân từ của các động từ rất hay gặp.',
    level: 'B1',
    estimatedTime: '15–18 phút',
    sourcePatternTitle: 'Verbs: irregular verbs',
    sourcePatternDescription: 'Type the correct forms of the missing verbs.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn nhớ dạng quá khứ của vài động từ quen thuộc.',
    vietnameseExplanation: 'Một số động từ không thêm -ed ở quá khứ. Hãy học theo cụm ngắn: go–went–gone, see–saw–seen, write–wrote–written.',
    examples: [
      { text: 'I went to school yesterday.', meaningVi: 'Hôm qua tôi đã đi học.' },
      { text: 'She has written three emails.', meaningVi: 'Cô ấy đã viết ba email.' },
      { text: 'We saw a good film.', meaningVi: 'Chúng tôi đã xem một bộ phim hay.' },
    ],
    exercises: [
      { id: 'irregular-mc-go', type: 'multiple-choice', promptVi: 'Chọn dạng quá khứ của go.', options: ['went', 'goed', 'gone', 'goes'], answer: 'went', hintVi: 'go là động từ bất quy tắc.', explanationVi: 'Quá khứ đơn của go là went.' },
      { id: 'irregular-fill-write', type: 'fill-blank', promptVi: 'Điền dạng quá khứ phân từ của write.', promptEn: 'She has ___ three emails.', answer: 'written', hintVi: 'write–wrote–written.', explanationVi: 'Sau has trong thì hiện tại hoàn thành dùng written.' },
      { id: 'irregular-order-saw', type: 'sentence-order', promptVi: 'Sắp xếp: Chúng tôi đã xem một bộ phim hay.', words: ['We', 'saw', 'a', 'good', 'film'], answer: 'We saw a good film', hintVi: 'Quá khứ của see là saw.', explanationVi: 'Saw là dạng quá khứ đơn của see.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'irregular-verbs' },
  },
  {
    id: 'grammar-a2-third-person-singular',
    unitId: 'grammar-verbs-a2',
    titleVi: 'He / She / It + động từ thêm -s',
    titleEn: 'Third person singular verbs',
    subtitleVi: 'Tập phản xạ thêm -s ở hiện tại đơn với he, she, it hoặc danh từ số ít.',
    level: 'A2',
    estimatedTime: '12–15 phút',
    sourcePatternTitle: 'Verbs: third person singular',
    sourcePatternDescription: 'Insert the verbal ending "-s" where necessary.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn nhớ khi nào động từ cần thêm -s.',
    vietnameseExplanation: 'Ở hiện tại đơn, chủ ngữ he/she/it hoặc danh từ số ít thường làm động từ thêm -s/-es.',
    examples: [
      { text: 'She likes English.', meaningVi: 'Cô ấy thích tiếng Anh.' },
      { text: 'He plays football after school.', meaningVi: 'Anh ấy chơi bóng đá sau giờ học.' },
      { text: 'My brother studies at home.', meaningVi: 'Em/anh trai tôi học ở nhà.' },
    ],
    exercises: [
      { id: 'third-person-mc-likes', type: 'multiple-choice', promptVi: 'Chọn câu đúng.', options: ['She likes English.', 'She like English.', 'I likes English.', 'They likes English.'], answer: 'She likes English.', hintVi: 'She đi với động từ thêm -s.', explanationVi: 'She là ngôi thứ ba số ít nên like thành likes.' },
      { id: 'third-person-fill-plays', type: 'fill-blank', promptVi: 'Điền dạng đúng của play.', promptEn: 'He ___ football after school.', answer: 'plays', hintVi: 'He + verb-s.', explanationVi: 'He là chủ ngữ số ít nên dùng plays.' },
      { id: 'third-person-order-studies', type: 'sentence-order', promptVi: 'Sắp xếp: Em trai tôi học ở nhà.', words: ['My', 'brother', 'studies', 'at', 'home'], answer: 'My brother studies at home', hintVi: 'brother là danh từ số ít.', explanationVi: 'Danh từ số ít my brother dùng studies.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'third-person-singular' },
  },
  {
    id: 'grammar-b1-phrasal-verbs',
    unitId: 'grammar-verbs-b1',
    titleVi: 'Cụm động từ thông dụng',
    titleEn: 'Common phrasal verbs',
    subtitleVi: 'Hoàn thành các cụm như look up, turn off, put on trong ngữ cảnh ngắn.',
    level: 'B1',
    estimatedTime: '15–18 phút',
    sourcePatternTitle: 'Verbs: phrasal verbs',
    sourcePatternDescription: 'Complete the phrasal verbs with the correct preposisions.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn luyện cụm động từ quen thuộc theo tình huống.',
    vietnameseExplanation: 'Phrasal verb là động từ đi với tiểu từ/giới từ tạo nghĩa mới. Học theo cụm và tình huống, không dịch từng từ rời.',
    examples: [
      { text: 'Please turn off the light.', meaningVi: 'Làm ơn tắt đèn.' },
      { text: 'I look up new words in a dictionary.', meaningVi: 'Tôi tra từ mới trong từ điển.' },
      { text: 'She puts on her coat.', meaningVi: 'Cô ấy mặc áo khoác vào.' },
    ],
    exercises: [
      { id: 'phrasal-mc-turn-off', type: 'multiple-choice', promptVi: 'Chọn câu đúng để nói “tắt đèn”.', options: ['Please turn off the light.', 'Please turn on the dark.', 'Please turn up the light off.', 'Please look off the light.'], answer: 'Please turn off the light.', hintVi: 'turn off = tắt.', explanationVi: 'turn off dùng với thiết bị/đèn để nói tắt đi.' },
      { id: 'phrasal-fill-look-up', type: 'fill-blank', promptVi: 'Điền tiểu từ đúng.', promptEn: 'I look ___ new words in a dictionary.', answer: 'up', hintVi: 'look up = tra cứu.', explanationVi: 'look up dùng khi tra thông tin hoặc từ mới.' },
      { id: 'phrasal-order-put-on', type: 'sentence-order', promptVi: 'Sắp xếp: Cô ấy mặc áo khoác vào.', words: ['She', 'puts', 'on', 'her', 'coat'], answer: 'She puts on her coat', hintVi: 'put on = mặc vào.', explanationVi: 'put on là cụm động từ chỉ mặc/đeo vào.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'phrasal-verbs' },
  },
  {
    id: 'grammar-b1-modal-verbs',
    unitId: 'grammar-verbs-b1',
    titleVi: 'Nói “có thể / nên / phải” bằng câu ngắn',
    titleEn: 'Modal verbs: can, should, must',
    subtitleVi: 'Chọn modal phù hợp để nói khả năng, lời khuyên và sự cần thiết.',
    level: 'B1',
    estimatedTime: '12–15 phút',
    sourcePatternTitle: 'Verbs: modal verbs',
    sourcePatternDescription: 'Choose the most suitable modal verb.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn chọn can, should hoặc must theo ý câu.',
    vietnameseExplanation: 'can nói khả năng; should nói lời khuyên; must nói sự bắt buộc/cần thiết mạnh.',
    examples: [
      { text: 'I can speak English slowly.', meaningVi: 'Tôi có thể nói tiếng Anh chậm.' },
      { text: 'You should review new words.', meaningVi: 'Bạn nên ôn từ mới.' },
      { text: 'We must be quiet in the library.', meaningVi: 'Chúng ta phải giữ im lặng trong thư viện.' },
    ],
    exercises: [
      { id: 'modal-mc-advice', type: 'multiple-choice', promptVi: 'Chọn modal để đưa lời khuyên.', options: ['You should review new words.', 'You can review new words yesterday.', 'You must maybe review.', 'You are review words.'], answer: 'You should review new words.', hintVi: 'Lời khuyên thường dùng should.', explanationVi: 'should dùng để khuyên ai nên làm gì.' },
      { id: 'modal-fill-can', type: 'fill-blank', promptVi: 'Điền modal nói khả năng.', promptEn: 'I ___ speak English slowly.', answer: 'can', hintVi: 'can = có thể.', explanationVi: 'can diễn tả khả năng làm việc gì.' },
      { id: 'modal-order-must', type: 'sentence-order', promptVi: 'Sắp xếp: Chúng ta phải im lặng trong thư viện.', words: ['We', 'must', 'be', 'quiet', 'in', 'the', 'library'], answer: 'We must be quiet in the library', hintVi: 'must nói sự bắt buộc.', explanationVi: 'must + động từ nguyên mẫu diễn tả yêu cầu mạnh.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'modal-verbs' },
  },
  {
    id: 'grammar-a2-prepositions-in-on-at',
    unitId: 'grammar-prepositions-a2',
    titleVi: 'Giới từ in / on / at',
    titleEn: 'Prepositions: in, on, at',
    subtitleVi: 'Chọn in, on, at cho nơi chốn và thời gian quen thuộc.',
    level: 'A2',
    estimatedTime: '12–15 phút',
    sourcePatternTitle: 'Prepositions: in, on, at',
    sourcePatternDescription: 'Choose the right preposition.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn chọn in, on hoặc at theo nơi chốn và thời gian.',
    vietnameseExplanation: 'Dùng in cho không gian/tháng/năm, on cho ngày/bề mặt, at cho điểm thời gian/địa điểm cụ thể.',
    examples: [
      { text: 'I live in Vietnam.', meaningVi: 'Tôi sống ở Việt Nam.' },
      { text: 'The book is on the desk.', meaningVi: 'Quyển sách ở trên bàn.' },
      { text: 'The lesson starts at eight.', meaningVi: 'Bài học bắt đầu lúc tám giờ.' },
    ],
    exercises: [
      { id: 'prep-mc-vietnam', type: 'multiple-choice', promptVi: 'Chọn câu đúng.', options: ['I live in Vietnam.', 'I live on Vietnam.', 'I live at Vietnam.', 'I live Vietnam in.'], answer: 'I live in Vietnam.', hintVi: 'Quốc gia thường dùng in.', explanationVi: 'Dùng in với quốc gia/thành phố/khu vực.' },
      { id: 'prep-fill-desk', type: 'fill-blank', promptVi: 'Điền in/on/at.', promptEn: 'The book is ___ the desk.', answer: 'on', hintVi: 'Trên bề mặt bàn.', explanationVi: 'Dùng on khi vật nằm trên bề mặt.' },
      { id: 'prep-order-eight', type: 'sentence-order', promptVi: 'Sắp xếp: Bài học bắt đầu lúc tám giờ.', words: ['The', 'lesson', 'starts', 'at', 'eight'], answer: 'The lesson starts at eight', hintVi: 'Giờ cụ thể dùng at.', explanationVi: 'Dùng at với thời điểm cụ thể.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'prepositions-in-on-at' },
  },
  {
    id: 'grammar-a1-be-present-simple',
    unitId: 'grammar-foundations-a1',
    titleVi: 'Tập nói “là / ở / thì” bằng câu ngắn',
    titleEn: 'Present simple: am, is, are',
    subtitleVi: 'Tập nói tên, cảm xúc và vị trí bằng be trong câu ngắn A1.',
    level: 'A1',
    estimatedTime: '10–12 phút',
    sourcePatternTitle: 'Verbs: be in present simple',
    sourcePatternDescription: 'Choose the correct be verb for the subject.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn chọn am/is/are theo người, nơi chốn hoặc cảm xúc.',
    vietnameseExplanation: 'Dùng am với I, is với he/she/it hoặc danh từ số ít, are với you/we/they hoặc danh từ số nhiều.',
    examples: [
      { text: 'I am ready.', meaningVi: 'Tôi đã sẵn sàng.' },
      { text: 'She is happy.', meaningVi: 'Cô ấy vui.' },
      { text: 'They are in class.', meaningVi: 'Họ đang ở trong lớp.' },
    ],
    exercises: [
      { id: 'be-present-mc-she', type: 'multiple-choice', promptVi: 'Chọn câu đúng với “cô ấy vui”.', options: ['She is happy.', 'She are happy.', 'She am happy.', 'She be happy.'], answer: 'She is happy.', hintVi: 'She đi với is.', explanationVi: 'She là ngôi thứ ba số ít nên dùng is.' },
      { id: 'be-present-fill-ready', type: 'fill-blank', promptVi: 'Điền am/is/are.', promptEn: 'I ___ ready.', answer: 'am', hintVi: 'I đi với am.', explanationVi: 'Trong hiện tại đơn, I luôn dùng am.' },
      { id: 'be-present-order-class', type: 'sentence-order', promptVi: 'Sắp xếp: Họ đang ở trong lớp.', words: ['They', 'are', 'in', 'class'], answer: 'They are in class', hintVi: 'They đi với are.', explanationVi: 'They + are dùng để nói vị trí hoặc trạng thái của nhiều người.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'be-present-simple' },
  },
  {
    id: 'grammar-b1-present-perfect-experience',
    unitId: 'grammar-verbs-b1',
    titleVi: 'Kể chuyện mình đã từng làm',
    titleEn: 'Present perfect for experiences',
    subtitleVi: 'Dùng have/has + past participle để nói trải nghiệm trong đời mà không cần nêu thời điểm cụ thể.',
    level: 'B1',
    estimatedTime: '14–16 phút',
    sourcePatternTitle: 'Verbs: present perfect experience',
    sourcePatternDescription: 'Choose have/has and the correct past participle.',
    sourcePatternSummary: 'Poo che một chỗ nhỏ để bạn tập nói về điều mình đã từng làm.',
    vietnameseExplanation: 'Dùng have/has + V3 để nói điều đã từng xảy ra trước hiện tại. Không dùng thời gian quá khứ cụ thể như yesterday trong mẫu này.',
    examples: [
      { text: 'I have visited Da Nang.', meaningVi: 'Tôi đã từng đến Đà Nẵng.' },
      { text: 'She has tried Korean food.', meaningVi: 'Cô ấy đã từng thử đồ ăn Hàn Quốc.' },
      { text: 'We have never missed a lesson.', meaningVi: 'Chúng tôi chưa từng bỏ lỡ buổi học nào.' },
    ],
    exercises: [
      { id: 'present-perfect-mc-tried', type: 'multiple-choice', promptVi: 'Chọn câu đúng với she.', options: ['She has tried Korean food.', 'She have tried Korean food.', 'She has try Korean food.', 'She tried yesterday Korean food.'], answer: 'She has tried Korean food.', hintVi: 'She đi với has và sau đó là V3.', explanationVi: 'Đúng rồi, với she mình dùng has tried để kể điều cô ấy đã từng thử.' },
      { id: 'present-perfect-fill-visited', type: 'fill-blank', promptVi: 'Điền trợ động từ đúng.', promptEn: 'I ___ visited Da Nang.', answer: 'have', hintVi: 'I đi với have.', explanationVi: 'I/you/we/they dùng have trong hiện tại hoàn thành.' },
      { id: 'present-perfect-order-never', type: 'sentence-order', promptVi: 'Sắp xếp: Chúng tôi chưa từng bỏ lỡ buổi học nào.', words: ['We', 'have', 'never', 'missed', 'a', 'lesson'], answer: 'We have never missed a lesson', hintVi: 'never đứng giữa have và V3.', explanationVi: 'Cấu trúc tự nhiên là have never + past participle.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'present-perfect-experience' },
  },
  {
    id: 'grammar-b2-conditionals-realistic-advice',
    unitId: 'grammar-clauses-b2',
    titleVi: 'Câu điều kiện cho lời khuyên tinh tế',
    titleEn: 'Nuanced conditionals for realistic advice',
    subtitleVi: 'Kết hợp if + past, would/could và cụm giảm nhẹ để đưa lời khuyên giả định, lịch sự ở mức B2.',
    level: 'B2',
    estimatedTime: '16–18 phút',
    sourcePatternTitle: 'Clauses: nuanced conditional advice',
    sourcePatternDescription: 'Complete hypothetical if-clauses, hedged result clauses, and polite advice.',
    sourcePatternSummary: 'Poo nâng câu điều kiện lên một chút để bạn nói lời khuyên mềm và tự nhiên hơn.',
    vietnameseExplanation: 'Ở B2, người học không chỉ nói kết quả có thể xảy ra mà còn biết giảm độ trực tiếp: If I were you..., I would..., It might be better to..., You could consider....',
    examples: [
      { text: 'If I were you, I would focus on one pronunciation problem at a time.', meaningVi: 'Nếu tôi là bạn, tôi sẽ từ vựng lỗi phát âmột.' },
      { text: 'If the feedback felt too general, you could ask for one specific example.', meaningVi: 'Nếu góp ý quá chung chung, bạn có thể xin một ví dụ cụ thể.' },
      { text: 'It might be better to repeat the sentence slowly before increasing your speed.', meaningVi: 'Có lẽ tốt hơn là lặp lại câu chậm trước khi tăng tốc.' },
    ],
    exercises: [
      { id: 'conditional-advice-mc-hedged', type: 'multiple-choice', promptVi: 'Chọn câu lời khuyên B2 lịch sự và tự nhiên nhất.', options: ['If I were you, I would focus on one pronunciation problem at a time.', 'If I am you, I will focus one problem.', 'If you focus, you will maybe pronunciation.', 'You must fix all sounds now.'], answer: 'If I were you, I would focus on one pronunciation problem at a time.', hintVi: 'Lời khuyên giả định lịch sự dùng If I were you + would.', explanationVi: 'If I were you, I would... là mẫu điều kiện giả định phù hợp để đưa lời khuyên mềm ở B2.' },
      { id: 'conditional-advice-fill-specific', type: 'fill-blank', promptVi: 'Điền modal phù hợp để giảm độ trực tiếp.', promptEn: 'If the feedback felt too general, you ___ ask for one specific example.', answer: 'could', hintVi: 'could mềm hơn can trong lời khuyên giả định.', explanationVi: 'could giúp lời khuyên bớt áp đặt và phù hợp với tình huống giả định.' },
      { id: 'conditional-advice-order-better', type: 'sentence-order', promptVi: 'Sắp xếp lời khuyên giảm nhẹ.', words: ['It', 'might', 'be', 'better', 'to', 'repeat', 'the', 'sentence', 'slowly'], answer: 'It might be better to repeat the sentence slowly', hintVi: 'It might be better to + verb = có lẽ tốt hơn là...', explanationVi: 'Cụm It might be better to... giúp lời khuyên tự nhiên, lịch sự và đúng sắc thái B2.' },
    ],
    source: { ...fluentcardsSource, sourcePatternId: 'nuanced-conditional-advice' },
  },
  ...grammarExpansionSeeds.map(buildExpandedGrammarLesson),
] satisfies GeneratedGrammarLessonSource[]).map(expandGrammarLesson);

export const generatedGrammarCounts = {
  lessons: generatedGrammarLessonSources.length,
  sourceRepo: 'fluentcards-grammar',
  integrationMode: 'adapted-pattern-logic',
} as const;
