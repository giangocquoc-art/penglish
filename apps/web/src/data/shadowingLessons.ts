export type ShadowingLessonLevel = 'A1' | 'A2' | 'B1';

export type ShadowingLessonSentence = {
  id: string;
  text: string;
  vi: string;
  hint?: string;
  focusWords?: string[];
};

export type ShadowingLesson = {
  id: string;
  title: string;
  level: ShadowingLessonLevel;
  topic: string;
  durationMinutes: number;
  sentenceCount: number;
  description: string;
  pronunciationFocus?: string[];
  sentences: ShadowingLessonSentence[];
};

function lesson(config: Omit<ShadowingLesson, 'sentenceCount'>): ShadowingLesson {
  return {
    ...config,
    sentenceCount: config.sentences.length,
  };
}

export const shadowingLessons: ShadowingLesson[] = [
  lesson({
    id: 'a1-greeting-a-friend',
    title: 'Greeting a friend',
    level: 'A1',
    topic: 'Chào hỏi',
    durationMinutes: 3,
    description: 'Chào bạn, hỏi thăm ngắn và trả lời tự nhiên bằng câu A1.',
    pronunciationFocus: ['/h/', 'intonation questions', 'ending sounds'],
    sentences: [
      { id: 's1', text: 'Hi, Mia. How are you today?', vi: 'Chào Mia. Hôm nay bạn thế nào?', hint: 'Giữ âm /h/ rõ trong Hi và How.', focusWords: ['Hi', 'How', 'today'] },
      { id: 's2', text: 'I am good, thanks. And you?', vi: 'Mình khỏe, cảm ơn. Còn bạn?', hint: 'Nhấn good và thanks, lên giọng nhẹ ở And you.', focusWords: ['good', 'thanks'] },
      { id: 's3', text: 'I am fine. It is nice to see you.', vi: 'Mình ổn. Rất vui được gặp bạn.', hint: 'Nối It is thành một cụm ngắn.', focusWords: ['fine', 'nice'] },
      { id: 's4', text: 'Nice to see you too.', vi: 'Mình cũng vui được gặp bạn.', hint: 'Kéo nhẹ âm too ở cuối câu.', focusWords: ['Nice', 'too'] },
      { id: 's5', text: 'Let us go to class together.', vi: 'Chúng ta cùng đến lớp nhé.', hint: 'Đọc class together rõ nhưng chậm.', focusWords: ['class', 'together'] },
    ],
  }),
  lesson({
    id: 'a1-classroom-conversation',
    title: 'Classroom conversation',
    level: 'A1',
    topic: 'Lớp học',
    durationMinutes: 4,
    description: 'Xin nhắc lại, hỏi đồ dùng học tập và phản hồi trong lớp.',
    pronunciationFocus: ['/r/', 'Can you', 'ending sounds'],
    sentences: [
      { id: 's1', text: 'Excuse me, teacher.', vi: 'Xin lỗi thầy/cô.', hint: 'Excuse me đọc liền nhẹ.', focusWords: ['Excuse', 'teacher'] },
      { id: 's2', text: 'Can you repeat that, please?', vi: 'Thầy/cô có thể nhắc lại không ạ?', hint: 'Repeat nhấn âm thứ hai.', focusWords: ['repeat', 'please'] },
      { id: 's3', text: 'Of course. Open your book to page ten.', vi: 'Tất nhiên. Mở sách trang mười.', hint: 'Open your nối nhẹ thành một cụm.', focusWords: ['Open', 'book'] },
      { id: 's4', text: 'Do we need a pencil?', vi: 'Chúng ta có cần bút chì không?', hint: 'Need a nối nhẹ, pencil nhấn âm đầu.', focusWords: ['need', 'pencil'] },
      { id: 's5', text: 'Yes, please write your name.', vi: 'Có, hãy viết tên của em.', hint: 'Write your đọc mượt như một cụm.', focusWords: ['write', 'name'] },
      { id: 's6', text: 'Thank you. I understand now.', vi: 'Cảm ơn. Bây giờ em hiểu rồi.', hint: 'Thank có âm /th/, now xuống giọng.', focusWords: ['Thank', 'understand'] },
    ],
  }),
  lesson({
    id: 'a1-introducing-yourself',
    title: 'Introducing yourself',
    level: 'A1',
    topic: 'Chào hỏi',
    durationMinutes: 4,
    description: 'Tự giới thiệu tên, quê quán, sở thích bằng nhịp chậm dễ nói.',
    pronunciationFocus: ['word stress', '/v/', 'linking'],
    sentences: [
      { id: 's1', text: 'Hello, my name is Anna.', vi: 'Xin chào, tên tôi là Anna.', hint: 'Hello mở miệng rõ, name kéo âm /ei/.', focusWords: ['Hello', 'name'] },
      { id: 's2', text: 'I am from Viet Nam.', vi: 'Tôi đến từ Việt Nam.', hint: 'From Viet Nam nối nhẹ, giữ âm /v/.', focusWords: ['from', 'Viet Nam'] },
      { id: 's3', text: 'I am a student.', vi: 'Tôi là học sinh/sinh viên.', hint: 'Student nhấn âm đầu.', focusWords: ['student'] },
      { id: 's4', text: 'I like music and English.', vi: 'Tôi thích âm nhạc và tiếng Anh.', hint: 'Music nhấn âm đầu, English kết thúc nhẹ.', focusWords: ['music', 'English'] },
      { id: 's5', text: 'I study English every day.', vi: 'Tôi học tiếng Anh mỗi ngày.', hint: 'Every day chia hai nhịp rõ.', focusWords: ['study', 'every day'] },
      { id: 's6', text: 'Nice to meet you.', vi: 'Rất vui được gặp bạn.', hint: 'Meet you có thể nối nhẹ /miːtʃuː/.', focusWords: ['Nice', 'meet'] },
    ],
  }),
  lesson({
    id: 'a1-family-talk',
    title: 'Family talk',
    level: 'A1',
    topic: 'Gia đình',
    durationMinutes: 4,
    description: 'Nói về gia đình bằng câu ngắn, thân thiện và dễ shadowing.',
    pronunciationFocus: ['family', '/th/', 'third person s'],
    sentences: [
      { id: 's1', text: 'This is my family.', vi: 'Đây là gia đình tôi.', hint: 'This có âm /th/ hữu thanh.', focusWords: ['This', 'family'] },
      { id: 's2', text: 'My mother is kind.', vi: 'Mẹ tôi rất tốt bụng.', hint: 'Mother có âm /th/ nhẹ.', focusWords: ['mother', 'kind'] },
      { id: 's3', text: 'My father works at a school.', vi: 'Bố tôi làm việc ở một trường học.', hint: 'Works kết thúc rõ /ks/.', focusWords: ['father', 'works'] },
      { id: 's4', text: 'I have one younger brother.', vi: 'Tôi có một em trai.', hint: 'Younger brother nối nhịp chậm.', focusWords: ['younger', 'brother'] },
      { id: 's5', text: 'We eat dinner together.', vi: 'Chúng tôi ăn tối cùng nhau.', hint: 'Dinner together nhấn đều hai từ.', focusWords: ['dinner', 'together'] },
      { id: 's6', text: 'I love my family very much.', vi: 'Tôi rất yêu gia đình mình.', hint: 'Very much xuống giọng mềm.', focusWords: ['love', 'family'] },
    ],
  }),
  lesson({
    id: 'a2-ordering-a-drink',
    title: 'Ordering a drink',
    level: 'A2',
    topic: 'Mua sắm',
    durationMinutes: 4,
    description: 'Gọi đồ uống, chọn kích cỡ và nói lịch sự ở quán nước.',
    pronunciationFocus: ['/w/', 'please', 'linking'],
    sentences: [
      { id: 's1', text: 'Good morning. Can I have a tea, please?', vi: 'Chào buổi sáng. Cho tôi một trà được không?', hint: 'Can I nối nhẹ thành /kənaɪ/.', focusWords: ['Can I', 'please'] },
      { id: 's2', text: 'Would you like it hot or iced?', vi: 'Bạn muốn uống nóng hay đá?', hint: 'Would mở bằng môi tròn /w/.', focusWords: ['Would', 'hot', 'iced'] },
      { id: 's3', text: 'I would like iced tea.', vi: 'Tôi muốn trà đá.', hint: 'I would like đọc liền nhẹ.', focusWords: ['would like', 'iced'] },
      { id: 's4', text: 'Do you want sugar?', vi: 'Bạn có muốn đường không?', hint: 'Sugar thường đọc /SHU-gər/.', focusWords: ['want', 'sugar'] },
      { id: 's5', text: 'Just a little sugar, please.', vi: 'Chỉ một chút đường thôi.', hint: 'Little có âm /t/ nhẹ.', focusWords: ['little', 'please'] },
      { id: 's6', text: 'Thank you. That is all.', vi: 'Cảm ơn. Vậy là đủ rồi.', hint: 'That có âm /th/ hữu thanh.', focusWords: ['Thank', 'That'] },
    ],
  }),
  lesson({
    id: 'a2-asking-for-directions',
    title: 'Asking for directions',
    level: 'A2',
    topic: 'Du lịch',
    durationMinutes: 5,
    description: 'Hỏi đường và xác nhận hướng đi bằng câu rõ, bình tĩnh.',
    pronunciationFocus: ['/r/', 'turn left', 'connected speech'],
    sentences: [
      { id: 's1', text: 'Excuse me, where is the bus stop?', vi: 'Xin lỗi, trạm xe buýt ở đâu ạ?', hint: 'Where is nối nhẹ.', focusWords: ['where', 'bus stop'] },
      { id: 's2', text: 'Go straight for two blocks.', vi: 'Đi thẳng hai dãy nhà.', hint: 'Straight có cụm /str/ rõ.', focusWords: ['straight', 'blocks'] },
      { id: 's3', text: 'Then turn right at the bank.', vi: 'Sau đó rẽ phải ở ngân hàng.', hint: 'Turn right giữ âm /r/.', focusWords: ['turn right', 'bank'] },
      { id: 's4', text: 'Is it near the supermarket?', vi: 'Nó có gần siêu thị không?', hint: 'Near the nối nhẹ.', focusWords: ['near', 'supermarket'] },
      { id: 's5', text: 'Yes, it is across from the supermarket.', vi: 'Đúng, nó ở đối diện siêu thị.', hint: 'Across from nhấn across.', focusWords: ['across', 'supermarket'] },
      { id: 's6', text: 'Thank you for your help.', vi: 'Cảm ơn bạn đã giúp đỡ.', hint: 'For your nối nhẹ /fər jər/.', focusWords: ['Thank', 'help'] },
    ],
  }),
  lesson({
    id: 'a2-weekend-plans',
    title: 'Weekend plans',
    level: 'A2',
    topic: 'Gia đình',
    durationMinutes: 5,
    description: 'Nói về kế hoạch cuối tuần với bạn bè và gia đình.',
    pronunciationFocus: ['future with going to', 'linking', 'intonation'],
    sentences: [
      { id: 's1', text: 'What are you going to do this weekend?', vi: 'Cuối tuần này bạn định làm gì?', hint: 'Going to có thể nói /gənə/ trong nhịp tự nhiên.', focusWords: ['going to', 'weekend'] },
      { id: 's2', text: 'I am going to visit my grandparents.', vi: 'Tôi sẽ thăm ông bà.', hint: 'Grandparents nhấn âm đầu.', focusWords: ['visit', 'grandparents'] },
      { id: 's3', text: 'That sounds really nice.', vi: 'Nghe thật tuyệt.', hint: 'Sounds kết thúc /dz/ nhẹ.', focusWords: ['sounds', 'nice'] },
      { id: 's4', text: 'We will have lunch together.', vi: 'Chúng tôi sẽ ăn trưa cùng nhau.', hint: 'Will have nối nhẹ.', focusWords: ['lunch', 'together'] },
      { id: 's5', text: 'Maybe we can watch a movie after lunch.', vi: 'Có lẽ chúng tôi sẽ xem phim sau bữa trưa.', hint: 'Watch a nối nhẹ.', focusWords: ['watch', 'movie'] },
      { id: 's6', text: 'Have a great weekend.', vi: 'Chúc bạn cuối tuần vui vẻ.', hint: 'Great weekend xuống giọng thân thiện.', focusWords: ['great', 'weekend'] },
    ],
  }),
  lesson({
    id: 'a2-shopping-for-clothes',
    title: 'Shopping for clothes',
    level: 'A2',
    topic: 'Mua sắm',
    durationMinutes: 5,
    description: 'Hỏi giá, thử đồ và chọn kích cỡ khi mua quần áo.',
    pronunciationFocus: ['/sh/', 'size', 'try it on'],
    sentences: [
      { id: 's1', text: 'How much is this blue shirt?', vi: 'Áo sơ mi xanh này giá bao nhiêu?', hint: 'Much có âm /ch/, shirt có /sh/.', focusWords: ['much', 'shirt'] },
      { id: 's2', text: 'It is twenty dollars.', vi: 'Nó giá hai mươi đô la.', hint: 'Twenty thường đọc gọn /tweni/.', focusWords: ['twenty', 'dollars'] },
      { id: 's3', text: 'Do you have it in a small size?', vi: 'Bạn có cỡ nhỏ không?', hint: 'Have it nối nhẹ.', focusWords: ['small', 'size'] },
      { id: 's4', text: 'Yes, here you are.', vi: 'Có, của bạn đây.', hint: 'Here you are đọc thành cụm lịch sự.', focusWords: ['here', 'you'] },
      { id: 's5', text: 'Can I try it on?', vi: 'Tôi có thể thử nó không?', hint: 'Try it on nối từng từ mượt.', focusWords: ['try', 'on'] },
      { id: 's6', text: 'I will take it, thank you.', vi: 'Tôi sẽ lấy cái này, cảm ơn.', hint: 'Take it nối nhẹ.', focusWords: ['take it', 'thank'] },
    ],
  }),
  lesson({
    id: 'b1-giving-opinions',
    title: 'Giving opinions',
    level: 'B1',
    topic: 'Công việc',
    durationMinutes: 6,
    description: 'Đưa ý kiến nhẹ nhàng, đồng ý và giải thích lý do ngắn.',
    pronunciationFocus: ['sentence stress', 'because', 'natural rhythm'],
    sentences: [
      { id: 's1', text: 'I think this idea is useful.', vi: 'Tôi nghĩ ý tưởng này hữu ích.', hint: 'Nhấn think, idea, useful.', focusWords: ['think', 'useful'] },
      { id: 's2', text: 'It can help people save time.', vi: 'Nó có thể giúp mọi người tiết kiệm thời gian.', hint: 'Help people nối nhẹ.', focusWords: ['help', 'save time'] },
      { id: 's3', text: 'I agree with you about that.', vi: 'Tôi đồng ý với bạn về điều đó.', hint: 'Agree nhấn âm hai.', focusWords: ['agree', 'that'] },
      { id: 's4', text: 'However, we should test it first.', vi: 'Tuy nhiên, chúng ta nên thử trước.', hint: 'However chia nhịp rõ.', focusWords: ['However', 'test'] },
      { id: 's5', text: 'That is a fair point.', vi: 'Đó là một ý kiến hợp lý.', hint: 'Fair point xuống giọng chắc.', focusWords: ['fair', 'point'] },
      { id: 's6', text: 'Let us discuss the next step.', vi: 'Hãy thảo luận bước tiếp theo.', hint: 'Discuss nhấn âm hai.', focusWords: ['discuss', 'next step'] },
    ],
  }),
  lesson({
    id: 'b1-talking-about-goals',
    title: 'Talking about goals',
    level: 'B1',
    topic: 'Công việc',
    durationMinutes: 6,
    description: 'Nói về mục tiêu học tập và thói quen cải thiện mỗi ngày.',
    pronunciationFocus: ['goals', 'connected speech', 'ending sounds'],
    sentences: [
      { id: 's1', text: 'My main goal is to speak more clearly.', vi: 'Mục tiêu chính của tôi là nói rõ hơn.', hint: 'Goal giữ âm /oʊ/ tròn.', focusWords: ['goal', 'clearly'] },
      { id: 's2', text: 'I practice English for ten minutes every morning.', vi: 'Tôi luyện tiếng Anh mười phút mỗi sáng.', hint: 'Practice English nối nhẹ.', focusWords: ['practice', 'morning'] },
      { id: 's3', text: 'Small habits can make a big difference.', vi: 'Thói quen nhỏ có thể tạo khác biệt lớn.', hint: 'Big difference nhấn hai từ chính.', focusWords: ['habits', 'difference'] },
      { id: 's4', text: 'Sometimes I feel nervous when I speak.', vi: 'Đôi khi tôi thấy hồi hộp khi nói.', hint: 'Nervous nhấn âm đầu.', focusWords: ['nervous', 'speak'] },
      { id: 's5', text: 'But I try again and learn from mistakes.', vi: 'Nhưng tôi thử lại và học từ lỗi sai.', hint: 'Try again nối nhẹ.', focusWords: ['try again', 'mistakes'] },
      { id: 's6', text: 'I want to sound natural and confident.', vi: 'Tôi muốn nghe tự nhiên và tự tin.', hint: 'Natural and nối nhẹ.', focusWords: ['natural', 'confident'] },
    ],
  }),
  lesson({
    id: 'b1-solving-a-problem',
    title: 'Solving a problem',
    level: 'B1',
    topic: 'Công việc',
    durationMinutes: 6,
    description: 'Trình bày vấn đề, đề xuất giải pháp và xác nhận bước tiếp theo.',
    pronunciationFocus: ['problem/solution', 'stress', 'linking'],
    sentences: [
      { id: 's1', text: 'We have a small problem with the plan.', vi: 'Chúng ta có một vấn đề nhỏ với kế hoạch.', hint: 'Problem nhấn âm đầu.', focusWords: ['problem', 'plan'] },
      { id: 's2', text: 'The meeting starts too early for some people.', vi: 'Cuộc họp bắt đầu quá sớm với một số người.', hint: 'Starts too nối nhẹ nhưng giữ /ts/.', focusWords: ['meeting', 'early'] },
      { id: 's3', text: 'Maybe we can move it to ten thirty.', vi: 'Có lẽ chúng ta có thể chuyển sang 10:30.', hint: 'Move it nối nhẹ.', focusWords: ['move', 'ten thirty'] },
      { id: 's4', text: 'That would work better for the team.', vi: 'Như vậy sẽ phù hợp hơn cho nhóm.', hint: 'Would work nối /wʊd wɜrk/.', focusWords: ['work', 'team'] },
      { id: 's5', text: 'I will send a new message now.', vi: 'Tôi sẽ gửi tin nhắn mới ngay.', hint: 'Send a nối nhẹ.', focusWords: ['send', 'message'] },
      { id: 's6', text: 'Thanks for helping me fix this.', vi: 'Cảm ơn đã giúp tôi xử lý việc này.', hint: 'Fix this giữ âm cuối /ks/ và /th/.', focusWords: ['helping', 'fix'] },
    ],
  }),
  lesson({
    id: 'b1-short-story-about-a-trip',
    title: 'Short story about a trip',
    level: 'B1',
    topic: 'Du lịch',
    durationMinutes: 7,
    description: 'Kể một chuyến đi ngắn với nhịp kể chuyện tự nhiên hơn.',
    pronunciationFocus: ['past tense', 'story rhythm', 'ending sounds'],
    sentences: [
      { id: 's1', text: 'Last month, I took a short trip to Da Nang.', vi: 'Tháng trước, tôi có chuyến đi ngắn đến Đà Nẵng.', hint: 'Last month nối nhẹ, took kết thúc /k/.', focusWords: ['Last month', 'trip'] },
      { id: 's2', text: 'The weather was warm and sunny.', vi: 'Thời tiết ấm và có nắng.', hint: 'Weather có âm /th/ hữu thanh.', focusWords: ['weather', 'sunny'] },
      { id: 's3', text: 'I walked along the beach in the morning.', vi: 'Tôi đi bộ dọc bãi biển vào buổi sáng.', hint: 'Walked có âm /t/ cuối.', focusWords: ['walked', 'beach'] },
      { id: 's4', text: 'Then I tried some local food.', vi: 'Sau đó tôi thử vài món địa phương.', hint: 'Tried giữ âm /d/ cuối nhẹ.', focusWords: ['tried', 'local food'] },
      { id: 's5', text: 'Everything tasted fresh and delicious.', vi: 'Mọi thứ có vị tươi ngon.', hint: 'Delicious nhấn âm hai.', focusWords: ['fresh', 'delicious'] },
      { id: 's6', text: 'It was a simple trip, but I felt happy.', vi: 'Đó là chuyến đi đơn giản nhưng tôi thấy vui.', hint: 'Simple trip chia nhịp rõ.', focusWords: ['simple', 'happy'] },
      { id: 's7', text: 'I hope to go back there one day.', vi: 'Tôi hy vọng một ngày nào đó sẽ quay lại.', hint: 'Go back there nối nhẹ.', focusWords: ['hope', 'go back'] },
    ],
  }),
];

export const shadowingLevels: Array<{ level: ShadowingLessonLevel; label: string; description: string }> = [
  { level: 'A1', label: 'A1 Mới bắt đầu', description: 'Câu ngắn, nhịp chậm, dễ bắt chước.' },
  { level: 'A2', label: 'A2 Giao tiếp hằng ngày', description: 'Tình huống quen thuộc, câu dài hơn một chút.' },
  { level: 'B1', label: 'B1 Nói tự nhiên hơn', description: 'Nêu ý kiến, kể chuyện, xử lý tình huống.' },
];

export const shadowingTopics = ['Chào hỏi', 'Lớp học', 'Gia đình', 'Mua sắm', 'Du lịch', 'Công việc'];
export const shadowingPronunciationFocus = ['/h/', '/th/', 'r/l', 'ending sounds', 'nối âm'];

export function getShadowingLessonById(lessonId: string | undefined | null) {
  if (!lessonId) return null;
  return shadowingLessons.find((lessonItem) => lessonItem.id === lessonId) ?? null;
}

export function getFirstShadowingLesson() {
  return shadowingLessons[0] ?? null;
}
