import type { GeneratedShadowingItem, ShadowingCefrLevel, ShadowingRepeatStep, ShadowingSourceMetadata } from './shadowingTypes';

const WORKFLOW_SOURCE: ShadowingSourceMetadata = {
  repoName: 'nhs000/shadowing + Skywalker-Harrison/shadowing_generator',
  repoUrl: 'https://github.com/nhs000/shadowing ; https://github.com/Skywalker-Harrison/shadowing_generator',
  localSourcePath: 'external-sources/shadowing ; external-sources/shadowing-generator',
  license: 'nhs000/shadowing: no local LICENSE/private package; shadowing_generator: README indicates MIT but local LICENSE file missing',
  attribution: 'Workflow ideas only: video/transcript separation, lag/replay practice, sentence segmentation, repeated sentence passes.',
  integrationMode: 'App-authored scripts and TypeScript data shape; no copied source code, media, subtitle files, or transcript passages.',
  licenseRiskNote: 'Source metadata is retained for reports/internal review only. Learner-facing UI must not show repo names.',
};

const repeatPlan: ShadowingRepeatStep[] = [
  { mode: 'listen', labelVi: 'Nghe mẫu', instructionVi: 'Nghe một lượt để nắm ý và nhịp câu.' },
  { mode: 'chunk', labelVi: 'Chia câu', instructionVi: 'Nhìn từng đoạn ngắn, chú ý chỗ ngắt hơi.' },
  { mode: 'repeat', labelVi: 'Lặp theo đoạn', instructionVi: 'Nói lại từng đoạn chậm hơn, rõ âm cuối.' },
  { mode: 'record', labelVi: 'Ghi âm', instructionVi: 'Ghi giọng của bạn khi nói đuổi theo câu đang chọn.' },
  { mode: 'compare', labelVi: 'So sánh lại', instructionVi: 'Nghe lại, chọn một câu yếu và luyện lại chậm hơn.' },
];

const tipsByLevel: Record<ShadowingCefrLevel, string[]> = {
  A1: ['Nói chậm, rõ từng từ.', 'Đừng cố nhanh ngay lượt đầu.', 'Ưu tiên âm cuối và nhịp câu ngắn.'],
  A2: ['Ngắt câu theo cụm ý.', 'Lặp lại câu hỏi trước khi trả lời.', 'Dùng tốc độ 0.75x nếu câu còn dài.'],
  B1: ['Giữ nhịp tự nhiên giữa các cụm.', 'Ghi âm một lượt đầy đủ rồi nghe lại.', 'Đánh dấu câu bị vấp để luyện riêng.'],
  B2: ['Chú ý trọng âm câu và ý chính.', 'Tập nối âm vừa phải, không nuốt âm cuối.', 'So sánh bản ghi với transcript theo từng cụm.'],
};

function makeItem(input: Omit<GeneratedShadowingItem, 'transcript' | 'chunks' | 'repeatPlan' | 'learnerTipsVi' | 'whaleCoachLines' | 'source'> & { lines: Array<{ text: string; vi: string }> }): GeneratedShadowingItem {
  const { lines, ...base } = input;

  return {
    ...base,
    transcript: lines.map((line) => line.text).join(' '),
    chunks: lines.map((line, index) => ({
      id: `${base.id}-c${index + 1}`,
      text: line.text,
      vi: line.vi,
      start: index * 4,
      end: index * 4 + 4,
      mode: index === 0 ? 'listen' : 'repeat',
    })),
    repeatPlan,
    learnerTipsVi: tipsByLevel[base.level],
    whaleCoachLines: ['Cá voi nhắc bạn: chậm mà đều sẽ tốt hơn nhanh mà vấp.', 'Chọn một câu ngắn, nghe lại, rồi nói theo như một làn sóng nhỏ.'],
    source: WORKFLOW_SOURCE,
  };
}

export const generatedShadowingCatalog: GeneratedShadowingItem[] = [
  makeItem({ id: 'shadow-a1-greeting-friend', titleVi: 'Chào một người bạn', titleEn: 'Greeting a friend', level: 'A1', topic: 'greeting a friend', descriptionVi: 'Luyện chào hỏi ngắn, thân thiện và rõ nhịp.', estimatedTime: '4 phút', referenceVideoTitle: 'Greeting People in English - Beginner Conversation', referenceVideoUrl: 'https://www.youtube.com/watch?v=0H7C1dK0l3Q', lines: [
    { text: 'Hi, Mai. How are you today?', vi: 'Chào Mai. Hôm nay bạn thế nào?' },
    { text: 'I am good, thank you.', vi: 'Tôi khỏe, cảm ơn bạn.' },
    { text: 'It is nice to see you.', vi: 'Rất vui được gặp bạn.' },
    { text: 'Let us study together.', vi: 'Chúng ta cùng học nhé.' },
  ] }),
  makeItem({ id: 'shadow-a1-order-water-coffee', titleVi: 'Gọi nước hoặc cà phê', titleEn: 'Ordering water or coffee', level: 'A1', topic: 'ordering water/coffee', descriptionVi: 'Tập câu gọi đồ uống đơn giản trong quán.', estimatedTime: '4 phút', referenceVideoTitle: 'Ordering Drinks in English - Cafe Conversation', referenceVideoUrl: 'https://www.youtube.com/watch?v=bgfdqVmVjfk', lines: [
    { text: 'Can I have a glass of water, please?', vi: 'Cho tôi một ly nước được không?' },
    { text: 'I would like a small coffee.', vi: 'Tôi muốn một ly cà phê nhỏ.' },
    { text: 'No sugar, please.', vi: 'Làm ơn không đường.' },
    { text: 'Thank you very much.', vi: 'Cảm ơn rất nhiều.' },
  ] }),
  makeItem({ id: 'shadow-a1-school-talk', titleVi: 'Nói về trường học', titleEn: 'Talking about school', level: 'A1', topic: 'talking about school', descriptionVi: 'Luyện câu ngắn về lớp học và môn học.', estimatedTime: '4 phút', referenceVideoTitle: 'School Conversation for Beginners', referenceVideoUrl: 'https://www.youtube.com/watch?v=AS5nhKzaOqo', lines: [
    { text: 'I go to school in the morning.', vi: 'Tôi đi học vào buổi sáng.' },
    { text: 'My classroom is small but bright.', vi: 'Lớp học của tôi nhỏ nhưng sáng.' },
    { text: 'I like English and music.', vi: 'Tôi thích tiếng Anh và âm nhạc.' },
    { text: 'My teacher is very kind.', vi: 'Giáo viên của tôi rất tốt.' },
  ] }),
  makeItem({ id: 'shadow-a1-daily-routine', titleVi: 'Thói quen hằng ngày', titleEn: 'Daily routine', level: 'A1', topic: 'daily routine', descriptionVi: 'Tập nói về những việc đơn giản mỗi ngày.', estimatedTime: '4 phút', referenceVideoTitle: 'Daily Routine in English', referenceVideoUrl: 'https://www.youtube.com/watch?v=qD1pnquN_DM', lines: [
    { text: 'I wake up at six o clock.', vi: 'Tôi thức dậy lúc sáu giờ.' },
    { text: 'I brush my teeth and eat breakfast.', vi: 'Tôi đánh răng và ăn sáng.' },
    { text: 'I learn five new words.', vi: 'Tôi học năm từ mới.' },
    { text: 'I sleep early at night.', vi: 'Tôi ngủ sớm vào buổi tối.' },
  ] }),
  makeItem({ id: 'shadow-a2-asking-directions', titleVi: 'Hỏi đường', titleEn: 'Asking for directions', level: 'A2', topic: 'asking for directions', descriptionVi: 'Luyện hỏi và nghe chỉ đường bằng câu rõ ràng.', estimatedTime: '5 phút', referenceVideoTitle: 'Asking for Directions in English', referenceVideoUrl: 'https://www.youtube.com/watch?v=DPYJQSA-x50', lines: [
    { text: 'Excuse me, where is the bus station?', vi: 'Xin lỗi, trạm xe buýt ở đâu?' },
    { text: 'Go straight and turn left at the bank.', vi: 'Đi thẳng và rẽ trái ở ngân hàng.' },
    { text: 'Is it far from here?', vi: 'Nó có xa đây không?' },
    { text: 'No, it takes about five minutes.', vi: 'Không, mất khoảng năm phút.' },
  ] }),
  makeItem({ id: 'shadow-a2-shopping-conversation', titleVi: 'Mua sắm đơn giản', titleEn: 'Shopping conversation', level: 'A2', topic: 'shopping conversation', descriptionVi: 'Tập nhịp câu khi hỏi giá và chọn món.', estimatedTime: '5 phút', referenceVideoTitle: 'Shopping Conversation in English', referenceVideoUrl: 'https://www.youtube.com/watch?v=Qp3VhdWJ40Y', lines: [
    { text: 'How much is this blue shirt?', vi: 'Chiếc áo xanh này giá bao nhiêu?' },
    { text: 'It is fifteen dollars today.', vi: 'Hôm nay nó giá mười lăm đô.' },
    { text: 'Can I try a larger size?', vi: 'Tôi thử cỡ lớn hơn được không?' },
    { text: 'Sure, the fitting room is over there.', vi: 'Được, phòng thử đồ ở đằng kia.' },
  ] }),
  makeItem({ id: 'shadow-a2-simple-travel-plan', titleVi: 'Kế hoạch du lịch ngắn', titleEn: 'Simple travel plan', level: 'A2', topic: 'simple travel plan', descriptionVi: 'Luyện nói về thời gian, địa điểm và hoạt động.', estimatedTime: '5 phút', referenceVideoTitle: 'Travel English Conversation Practice', referenceVideoUrl: 'https://www.youtube.com/watch?v=R0r51JQXcO8', lines: [
    { text: 'This weekend, I will visit Da Nang.', vi: 'Cuối tuần này, tôi sẽ đến Đà Nẵng.' },
    { text: 'I want to see the beach in the morning.', vi: 'Tôi muốn ngắm biển vào buổi sáng.' },
    { text: 'Then I will try local food with my family.', vi: 'Sau đó tôi sẽ thử món địa phương với gia đình.' },
    { text: 'I hope the weather is sunny.', vi: 'Tôi hy vọng thời tiết có nắng.' },
  ] }),
  makeItem({ id: 'shadow-a2-describing-hobbies', titleVi: 'Mô tả sở thích', titleEn: 'Describing hobbies', level: 'A2', topic: 'describing hobbies', descriptionVi: 'Tập nói thêm lý do cho sở thích cá nhân.', estimatedTime: '5 phút', referenceVideoTitle: 'Talking About Hobbies in English', referenceVideoUrl: 'https://www.youtube.com/watch?v=tgVtVoxzwDI', lines: [
    { text: 'In my free time, I like drawing small pictures.', vi: 'Khi rảnh, tôi thích vẽ những bức tranh nhỏ.' },
    { text: 'It helps me feel calm after school.', vi: 'Việc đó giúp tôi thấy bình tĩnh sau giờ học.' },
    { text: 'I also listen to English songs.', vi: 'Tôi cũng nghe các bài hát tiếng Anh.' },
    { text: 'The words are simple, so I can sing along.', vi: 'Từ ngữ đơn giản nên tôi có thể hát theo.' },
  ] }),
  makeItem({ id: 'shadow-b1-study-habit', titleVi: 'Giải thích thói quen học', titleEn: 'Study habit explanation', level: 'B1', topic: 'study habit explanation', descriptionVi: 'Luyện giải thích cách học và lợi ích bằng câu dài vừa phải.', estimatedTime: '6 phút', referenceVideoTitle: 'How to Talk About Study Habits in English', referenceVideoUrl: 'https://www.youtube.com/watch?v=3i1lNJPY-4Q', lines: [
    { text: 'I study English for twenty minutes every morning before breakfast.', vi: 'Tôi học tiếng Anh hai mươi phút mỗi sáng trước bữa ăn.' },
    { text: 'First, I review old words so I do not forget them.', vi: 'Đầu tiên, tôi ôn từ cũ để không quên.' },
    { text: 'After that, I listen to one short conversation and repeat the useful phrases.', vi: 'Sau đó, tôi nghe một đoạn hội thoại ngắn và lặp lại các cụm hữu ích.' },
    { text: 'This simple habit makes me more confident when I speak.', vi: 'Thói quen đơn giản này giúp tôi tự tin hơn khi nói.' },
  ] }),
  makeItem({ id: 'shadow-b1-part-time-interview', titleVi: 'Phỏng vấn việc làm thêm', titleEn: 'Part-time job interview', level: 'B1', topic: 'part-time job interview', descriptionVi: 'Tập trả lời phỏng vấn ngắn với giọng bình tĩnh.', estimatedTime: '6 phút', referenceVideoTitle: 'Job Interview English Practice', referenceVideoUrl: 'https://www.youtube.com/watch?v=HG68Ymazo18', lines: [
    { text: 'I am interested in this part-time job because I enjoy helping customers.', vi: 'Tôi quan tâm công việc bán thời gian này vì tôi thích hỗ trợ khách hàng.' },
    { text: 'I can work in the evenings and on Saturday mornings.', vi: 'Tôi có thể làm buổi tối và sáng thứ Bảy.' },
    { text: 'At school, I learned how to organize tasks and work with a team.', vi: 'Ở trường, tôi học cách sắp xếp công việc và làm việc nhóm.' },
    { text: 'I am ready to learn and follow the store rules carefully.', vi: 'Tôi sẵn sàng học hỏi và tuân thủ nội quy cửa hàng cẩn thận.' },
  ] }),
  makeItem({ id: 'shadow-b1-teamwork-discussion', titleVi: 'Thảo luận làm việc nhóm', titleEn: 'Teamwork discussion', level: 'B1', topic: 'teamwork discussion', descriptionVi: 'Luyện đưa ý kiến mềm mại trong nhóm.', estimatedTime: '6 phút', referenceVideoTitle: 'Teamwork Discussion English Phrases', referenceVideoUrl: 'https://www.youtube.com/watch?v=J9wMBy_9nWc', lines: [
    { text: 'I think our team should divide the project into three small parts.', vi: 'Tôi nghĩ nhóm nên chia dự án thành ba phần nhỏ.' },
    { text: 'Each person can choose one part and report progress every two days.', vi: 'Mỗi người chọn một phần và báo tiến độ hai ngày một lần.' },
    { text: 'If someone has a problem, we can help early instead of waiting.', vi: 'Nếu ai gặp vấn đề, chúng ta có thể giúp sớm thay vì chờ đợi.' },
    { text: 'This plan will make our presentation clearer and less stressful.', vi: 'Kế hoạch này sẽ làm bài trình bày rõ hơn và ít căng thẳng hơn.' },
  ] }),
  makeItem({ id: 'shadow-b2-learning-strategy', titleVi: 'Giải thích chiến lược học', titleEn: 'Explaining a learning strategy', level: 'B2', topic: 'explaining a learning strategy', descriptionVi: 'Luyện trình bày chiến lược học với ý chính rõ ràng.', estimatedTime: '7 phút', referenceVideoTitle: 'Learning Strategies in English', referenceVideoUrl: 'https://www.youtube.com/watch?v=9nL1i4QBrxM', lines: [
    { text: 'My main strategy is to connect new vocabulary with situations I actually meet.', vi: 'Chiến lược chính của tôi là nối từ mới với tình huống tôi thật sự gặp.' },
    { text: 'Instead of memorizing a long list, I create a short sentence that sounds natural to me.', vi: 'Thay vì học thuộc danh sách dài, tôi tạo một câu ngắn nghe tự nhiên với mình.' },
    { text: 'Then I record myself and check whether the rhythm is clear enough.', vi: 'Sau đó tôi ghi âm và kiểm tra nhịp nói đã đủ rõ chưa.' },
    { text: 'This makes practice more personal and easier to repeat consistently.', vi: 'Cách này làm việc luyện tập cá nhân hơn và dễ lặp lại đều đặn hơn.' },
  ] }),
  makeItem({ id: 'shadow-b2-digital-habits-opinion', titleVi: 'Ý kiến về thói quen số', titleEn: 'Opinion about digital habits', level: 'B2', topic: 'giving an opinion about digital habits', descriptionVi: 'Tập nêu quan điểm cân bằng về công nghệ.', estimatedTime: '7 phút', referenceVideoTitle: 'Talking About Digital Habits in English', referenceVideoUrl: 'https://www.youtube.com/watch?v=kzWg2Qd1X1I', lines: [
    { text: 'Digital tools can support learning, but they can also distract us very quickly.', vi: 'Công cụ số có thể hỗ trợ học tập, nhưng cũng làm ta xao nhãng rất nhanh.' },
    { text: 'For that reason, I set a clear purpose before opening any app.', vi: 'Vì lý do đó, tôi đặt mục đích rõ ràng trước khi mở bất kỳ ứng dụng nào.' },
    { text: 'If I only need ten minutes of listening practice, I stop when the timer ends.', vi: 'Nếu tôi chỉ cần mười phút luyện nghe, tôi dừng khi hết giờ.' },
    { text: 'Small limits help me use technology without losing control of my attention.', vi: 'Những giới hạn nhỏ giúp tôi dùng công nghệ mà không mất kiểm soát sự chú ý.' },
  ] }),
  makeItem({ id: 'shadow-b2-career-goals', titleVi: 'Trao đổi mục tiêu nghề nghiệp', titleEn: 'Discussing career goals', level: 'B2', topic: 'discussing career goals', descriptionVi: 'Luyện nói về mục tiêu nghề nghiệp với lý do và kế hoạch.', estimatedTime: '7 phút', referenceVideoTitle: 'Career Goals English Conversation', referenceVideoUrl: 'https://www.youtube.com/watch?v=YjT4gSxTEGk', lines: [
    { text: 'In the next few years, I want to build a career that combines communication and technology.', vi: 'Trong vài năm tới, tôi muốn xây dựng sự nghiệp kết hợp giao tiếp và công nghệ.' },
    { text: 'I am improving my English because it helps me read better resources and work with more people.', vi: 'Tôi đang cải thiện tiếng Anh vì nó giúp tôi đọc tài liệu tốt hơn và làm việc với nhiều người hơn.' },
    { text: 'My short-term goal is to present ideas clearly in meetings.', vi: 'Mục tiêu ngắn hạn của tôi là trình bày ý tưởng rõ ràng trong cuộc họp.' },
    { text: 'Later, I hope to lead small projects with confidence and responsibility.', vi: 'Sau này, tôi hy vọng dẫn dắt các dự án nhỏ với sự tự tin và trách nhiệm.' },
  ] }),
  makeItem({ id: 'shadow-a1-morning-check-in', titleVi: 'Hỏi thăm buổi sáng', titleEn: 'Morning check-in', level: 'A1', topic: 'morning check-in', descriptionVi: 'Luyện hỏi thăm và trả lời ngắn trong buổi sáng.', estimatedTime: '4 phút', lines: [
    { text: 'Good morning, Linh.', vi: 'Chào buổi sáng, Linh.' },
    { text: 'Did you sleep well last night?', vi: 'Tối qua bạn ngủ ngon không?' },
    { text: 'Yes, I feel fresh today.', vi: 'Có, hôm nay tôi thấy tỉnh táo.' },
    { text: 'Let us start with a small task.', vi: 'Chúng ta bắt đầu bằng một việc nhỏ nhé.' },
  ] }),
  makeItem({ id: 'shadow-a1-family-photo', titleVi: 'Ảnh gia đình', titleEn: 'Family photo', level: 'A1', topic: 'family photo', descriptionVi: 'Luyện giới thiệu người thân bằng câu rất ngắn.', estimatedTime: '4 phút', lines: [
    { text: 'This is my family photo.', vi: 'Đây là ảnh gia đình tôi.' },
    { text: 'My mother is next to my father.', vi: 'Mẹ tôi đứng cạnh bố tôi.' },
    { text: 'My brother is very funny.', vi: 'Anh trai tôi rất vui tính.' },
    { text: 'We smile together in the picture.', vi: 'Chúng tôi cùng cười trong bức ảnh.' },
  ] }),
  makeItem({ id: 'shadow-a1-classroom-items', titleVi: 'Đồ vật trong lớp', titleEn: 'Classroom items', level: 'A1', topic: 'classroom items', descriptionVi: 'Tập gọi tên đồ vật và vị trí trong lớp học.', estimatedTime: '4 phút', lines: [
    { text: 'There is a book on my desk.', vi: 'Có một quyển sách trên bàn của tôi.' },
    { text: 'The pencil is under the notebook.', vi: 'Cây bút chì ở dưới quyển vở.' },
    { text: 'I can see a red board.', vi: 'Tôi có thể thấy một cái bảng màu đỏ.' },
    { text: 'Please open your book slowly.', vi: 'Làm ơn mở sách chậm thôi.' },
  ] }),
  makeItem({ id: 'shadow-a1-small-weather-talk', titleVi: 'Nói chuyện thời tiết ngắn', titleEn: 'Small weather talk', level: 'A1', topic: 'small weather talk', descriptionVi: 'Luyện câu thời tiết quen thuộc, rõ âm cuối.', estimatedTime: '4 phút', lines: [
    { text: 'It is sunny today.', vi: 'Hôm nay trời nắng.' },
    { text: 'The sky is blue and clear.', vi: 'Bầu trời xanh và quang đãng.' },
    { text: 'I want to walk outside.', vi: 'Tôi muốn đi bộ bên ngoài.' },
    { text: 'Please bring your small hat.', vi: 'Làm ơn mang chiếc mũ nhỏ của bạn.' },
  ] }),
  makeItem({ id: 'shadow-a1-lunch-box', titleVi: 'Hộp cơm trưa', titleEn: 'Lunch box', level: 'A1', topic: 'lunch box', descriptionVi: 'Luyện nói về món ăn đơn giản trong hộp cơm.', estimatedTime: '4 phút', lines: [
    { text: 'This is my lunch box.', vi: 'Đây là hộp cơm trưa của tôi.' },
    { text: 'I have rice, eggs, and fruit.', vi: 'Tôi có cơm, trứng và trái cây.' },
    { text: 'The apple is sweet.', vi: 'Quả táo ngọt.' },
    { text: 'I drink water after lunch.', vi: 'Tôi uống nước sau bữa trưa.' },
  ] }),
  makeItem({ id: 'shadow-a1-whale-practice', titleVi: 'Luyện với cá voi', titleEn: 'Whale practice', level: 'A1', topic: 'whale practice', descriptionVi: 'Tập câu Poo Ocean vui, ngắn và dễ lặp lại.', estimatedTime: '4 phút', lines: [
    { text: 'The little whale is on the screen.', vi: 'Chú cá voi nhỏ ở trên màn hình.' },
    { text: 'It says, speak slowly with me.', vi: 'Nó nói, hãy nói chậm cùng tôi.' },
    { text: 'I repeat one easy sentence.', vi: 'Tôi lặp lại một câu dễ.' },
    { text: 'The whale gives me a happy smile.', vi: 'Cá voi tặng tôi một nụ cười vui.' },
  ] }),
  makeItem({ id: 'shadow-a1-bedroom-cleanup', titleVi: 'Dọn phòng ngủ', titleEn: 'Bedroom cleanup', level: 'A1', topic: 'bedroom cleanup', descriptionVi: 'Luyện câu mệnh lệnh nhẹ và vị trí đồ vật.', estimatedTime: '4 phút', lines: [
    { text: 'My room is small today.', vi: 'Hôm nay phòng tôi hơi nhỏ.' },
    { text: 'I put the toy in the box.', vi: 'Tôi đặt món đồ chơi vào hộp.' },
    { text: 'The blue bag is near the bed.', vi: 'Chiếc cặp xanh ở gần giường.' },
    { text: 'Now my room looks clean.', vi: 'Bây giờ phòng tôi trông sạch sẽ.' },
  ] }),
  makeItem({ id: 'shadow-a2-phone-message', titleVi: 'Nhắn tin điện thoại', titleEn: 'Phone message', level: 'A2', topic: 'phone message', descriptionVi: 'Tập nhịp câu khi hẹn giờ và xác nhận thông tin.', estimatedTime: '5 phút', lines: [
    { text: 'Hi, I got your message this morning.', vi: 'Chào, sáng nay tôi đã nhận tin nhắn của bạn.' },
    { text: 'I can meet you after class at four thirty.', vi: 'Tôi có thể gặp bạn sau giờ học lúc bốn giờ ba mươi.' },
    { text: 'Please wait near the main gate.', vi: 'Làm ơn đợi gần cổng chính.' },
    { text: 'I will send another message if I am late.', vi: 'Tôi sẽ nhắn thêm nếu tôi đến muộn.' },
  ] }),
  makeItem({ id: 'shadow-a2-making-an-appointment', titleVi: 'Đặt lịch hẹn', titleEn: 'Making an appointment', level: 'A2', topic: 'making an appointment', descriptionVi: 'Luyện đặt lịch bằng câu lịch sự và rõ thời gian.', estimatedTime: '5 phút', lines: [
    { text: 'I would like to make an appointment for Friday.', vi: 'Tôi muốn đặt lịch hẹn vào thứ Sáu.' },
    { text: 'Is ten o clock in the morning possible?', vi: 'Mười giờ sáng có được không?' },
    { text: 'Yes, that time works well for me.', vi: 'Vâng, thời gian đó phù hợp với tôi.' },
    { text: 'Thank you, I will arrive ten minutes early.', vi: 'Cảm ơn, tôi sẽ đến sớm mười phút.' },
  ] }),
  makeItem({ id: 'shadow-a2-weekend-plan', titleVi: 'Kế hoạch cuối tuần', titleEn: 'Weekend plan', level: 'A2', topic: 'weekend plan', descriptionVi: 'Luyện nối hoạt động cuối tuần bằng câu đơn giản.', estimatedTime: '5 phút', lines: [
    { text: 'On Saturday morning, I will clean my room.', vi: 'Sáng thứ Bảy, tôi sẽ dọn phòng.' },
    { text: 'After lunch, I want to meet my cousin.', vi: 'Sau bữa trưa, tôi muốn gặp anh họ của tôi.' },
    { text: 'We may watch a short movie together.', vi: 'Chúng tôi có thể xem một bộ phim ngắn cùng nhau.' },
    { text: 'On Sunday, I need to finish my homework.', vi: 'Chủ nhật, tôi cần hoàn thành bài tập về nhà.' },
  ] }),
  makeItem({ id: 'shadow-a2-at-the-pharmacy', titleVi: 'Ở nhà thuốc', titleEn: 'At the pharmacy', level: 'A2', topic: 'at the pharmacy', descriptionVi: 'Tập mô tả triệu chứng nhẹ và hỏi hướng dẫn.', estimatedTime: '5 phút', lines: [
    { text: 'Excuse me, I have a small headache.', vi: 'Xin lỗi, tôi hơi đau đầu.' },
    { text: 'Do you need medicine for today?', vi: 'Bạn cần thuốc cho hôm nay phải không?' },
    { text: 'Yes, and I need clear instructions.', vi: 'Vâng, và tôi cần hướng dẫn rõ ràng.' },
    { text: 'Please take it after food and drink water.', vi: 'Hãy uống sau khi ăn và uống nước.' },
  ] }),
  makeItem({ id: 'shadow-a2-bus-delay', titleVi: 'Xe buýt trễ', titleEn: 'Bus delay', level: 'A2', topic: 'bus delay', descriptionVi: 'Luyện báo tin trễ giờ bằng câu bình tĩnh.', estimatedTime: '5 phút', lines: [
    { text: 'The bus is late this afternoon.', vi: 'Chiều nay xe buýt đến trễ.' },
    { text: 'I am waiting near the second stop.', vi: 'Tôi đang đợi gần trạm thứ hai.' },
    { text: 'I may arrive ten minutes later than planned.', vi: 'Tôi có thể đến muộn hơn kế hoạch mười phút.' },
    { text: 'Please start without me if necessary.', vi: 'Nếu cần, hãy bắt đầu mà không cần tôi.' },
  ] }),
  makeItem({ id: 'shadow-a2-cooking-with-family', titleVi: 'Nấu ăn cùng gia đình', titleEn: 'Cooking with family', level: 'A2', topic: 'cooking with family', descriptionVi: 'Tập nói về bước nấu ăn và hỗ trợ người thân.', estimatedTime: '5 phút', lines: [
    { text: 'Tonight, I am helping my mother cook dinner.', vi: 'Tối nay, tôi đang giúp mẹ nấu bữa tối.' },
    { text: 'First, I wash the vegetables carefully.', vi: 'Đầu tiên, tôi rửa rau cẩn thận.' },
    { text: 'Then I cut them into small pieces.', vi: 'Sau đó tôi cắt chúng thành miếng nhỏ.' },
    { text: 'We talk and laugh while the soup is cooking.', vi: 'Chúng tôi nói chuyện và cười khi món súp đang nấu.' },
  ] }),
  makeItem({ id: 'shadow-a2-library-card', titleVi: 'Thẻ thư viện', titleEn: 'Library card', level: 'A2', topic: 'library card', descriptionVi: 'Luyện hỏi thủ tục đơn giản ở thư viện.', estimatedTime: '5 phút', lines: [
    { text: 'I would like to get a library card.', vi: 'Tôi muốn làm thẻ thư viện.' },
    { text: 'Please fill in this form with your name.', vi: 'Vui lòng điền tên của bạn vào mẫu này.' },
    { text: 'Can I borrow two books today?', vi: 'Hôm nay tôi có thể mượn hai cuốn sách không?' },
    { text: 'Yes, please return them next week.', vi: 'Được, vui lòng trả chúng vào tuần tới.' },
  ] }),
  makeItem({ id: 'shadow-a1-asking-for-help', titleVi: 'Xin giúp đỡ', titleEn: 'Asking for help', level: 'A1', topic: 'asking for help', descriptionVi: 'Luyện câu xin giúp đỡ ngắn, lịch sự và rõ âm cuối.', estimatedTime: '4 phút', lines: [
    { text: 'Excuse me, I need help.', vi: 'Xin lỗi, tôi cần giúp đỡ.' },
    { text: 'Can you help me, please?', vi: 'Bạn có thể giúp tôi được không?' },
    { text: 'I cannot find page ten.', vi: 'Tôi không tìm thấy trang mười.' },
    { text: 'Thank you for helping me.', vi: 'Cảm ơn vì đã giúp tôi.' },
  ] }),
  makeItem({ id: 'shadow-a2-changing-an-appointment', titleVi: 'Đổi lịch hẹn', titleEn: 'Changing an appointment', level: 'A2', topic: 'changing an appointment', descriptionVi: 'Luyện xin đổi giờ hẹn bằng câu lịch sự và rõ thời gian.', estimatedTime: '5 phút', lines: [
    { text: 'Hello, I have an appointment at four o clock.', vi: 'Xin chào, tôi có lịch hẹn lúc bốn giờ.' },
    { text: 'My bus is late, so I need to change the time.', vi: 'Xe buýt của tôi bị trễ, nên tôi cần đổi giờ.' },
    { text: 'Is four thirty possible today?', vi: 'Hôm nay bốn giờ ba mươi có được không?' },
    { text: 'Thank you for understanding.', vi: 'Cảm ơn vì đã thông cảm.' },
  ] }),
  makeItem({ id: 'shadow-b1-explaining-a-mistake', titleVi: 'Giải thích một lỗi nhỏ', titleEn: 'Explaining a small mistake', level: 'B1', topic: 'explaining a small mistake', descriptionVi: 'Luyện nhận lỗi, giải thích nguyên nhân và đề xuất cách sửa.', estimatedTime: '6 phút', lines: [
    { text: 'I noticed a mistake in the file I sent yesterday.', vi: 'Tôi nhận ra một lỗi trong tệp tôi gửi hôm qua.' },
    { text: 'The final number was wrong because I copied an old version.', vi: 'Con số cuối bị sai vì tôi đã sao chép một phiên bản cũ.' },
    { text: 'I have corrected it and added a short note for the team.', vi: 'Tôi đã sửa và thêm một ghi chú ngắn cho nhóm.' },
    { text: 'Next time, I will check the source before sending anything.', vi: 'Lần tới, tôi sẽ kiểm tra nguồn trước khi gửi bất kỳ thứ gì.' },
  ] }),
  makeItem({ id: 'shadow-b1-asking-for-feedback', titleVi: 'Xin góp ý', titleEn: 'Asking for feedback', level: 'B1', topic: 'asking for feedback', descriptionVi: 'Tập xin phản hồi cụ thể và lịch sự.', estimatedTime: '6 phút', lines: [
    { text: 'Could you give me feedback on my short presentation?', vi: 'Bạn có thể góp ý cho bài thuyết trình ngắn của tôi không?' },
    { text: 'I want to know if my main idea is clear enough.', vi: 'Tôi muốn biết ý chính của tôi đã đủ rõ chưa.' },
    { text: 'Please also tell me where my pronunciation sounds weak.', vi: 'Xin cũng cho tôi biết chỗ phát âm của tôi nghe còn yếu.' },
    { text: 'I will use your comments to practice again tonight.', vi: 'Tôi sẽ dùng nhận xét của bạn để luyện lại tối nay.' },
  ] }),
  makeItem({ id: 'shadow-b1-community-cleanup', titleVi: 'Dọn rác cộng đồng', titleEn: 'Community cleanup', level: 'B1', topic: 'community cleanup', descriptionVi: 'Luyện mô tả hoạt động cộng đồng và kết quả tích cực.', estimatedTime: '6 phút', lines: [
    { text: 'Last Sunday, our class joined a cleanup near the river.', vi: 'Chủ nhật trước, lớp chúng tôi tham gia dọn rác gần con sông.' },
    { text: 'We collected plastic bottles and sorted them into different bags.', vi: 'Chúng tôi nhặt chai nhựa và phân loại chúng vào các túi khác nhau.' },
    { text: 'At first, the work felt tiring, but everyone kept encouraging each other.', vi: 'Lúc đầu công việc khá mệt, nhưng mọi người tiếp tục động viên nhau.' },
    { text: 'By the end, the path looked cleaner and safer for children.', vi: 'Cuối cùng, con đường trông sạch hơn và an toàn hơn cho trẻ em.' },
  ] }),
  makeItem({ id: 'shadow-b1-ocean-learning-reflection', titleVi: 'Suy ngẫm học cùng đại dương', titleEn: 'Ocean learning reflection', level: 'B1', topic: 'ocean learning reflection', descriptionVi: 'Tập kể lại trải nghiệm học Poo Ocean bằng nhịp tự nhiên.', estimatedTime: '6 phút', lines: [
    { text: 'When I practice with the whale coach, I feel less afraid of speaking.', vi: 'Khi luyện với huấn luyện viên cá voi, tôi bớt sợ nói hơn.' },
    { text: 'The small waves remind me to repeat one sentence at a time.', vi: 'Những con sóng nhỏ nhắc tôi lặp lại từng câu một.' },
    { text: 'If I make a mistake, I slow down and try the same chunk again.', vi: 'Nếu mắc lỗi, tôi nói chậm lại và thử lại cùng một cụm.' },
    { text: 'This routine helps me build confidence without feeling rushed.', vi: 'Thói quen này giúp tôi xây dựng tự tin mà không thấy bị vội.' },
  ] }),
  makeItem({ id: 'shadow-b1-giving-directions-campus', titleVi: 'Chỉ đường trong khu học', titleEn: 'Giving directions on campus', level: 'B1', topic: 'giving directions on campus', descriptionVi: 'Luyện chỉ đường có mốc, thứ tự và lời nhắc lịch sự.', estimatedTime: '6 phút', lines: [
    { text: 'To reach the language room, walk past the garden and turn right.', vi: 'Để đến phòng ngôn ngữ, đi qua khu vườn rồi rẽ phải.' },
    { text: 'You will see a blue sign above the second door.', vi: 'Bạn sẽ thấy một biển màu xanh phía trên cánh cửa thứ hai.' },
    { text: 'If the hallway is crowded, wait near the window for a moment.', vi: 'Nếu hành lang đông, hãy đợi gần cửa sổ một lát.' },
    { text: 'The class usually starts five minutes after the bell.', vi: 'Lớp thường bắt đầu năm phút sau tiếng chuông.' },
  ] }),
  makeItem({ id: 'shadow-b1-comparing-two-options', titleVi: 'So sánh hai lựa chọn', titleEn: 'Comparing two options', level: 'B1', topic: 'comparing two options', descriptionVi: 'Tập so sánh ưu điểm và chọn phương án phù hợp.', estimatedTime: '6 phút', lines: [
    { text: 'We can either meet online tonight or study together tomorrow morning.', vi: 'Chúng ta có thể gặp trực tuyến tối nay hoặc học cùng nhau sáng mai.' },
    { text: 'Meeting online is faster, but it may be harder to focus.', vi: 'Gặp trực tuyến nhanh hơn, nhưng có thể khó tập trung hơn.' },
    { text: 'Studying tomorrow gives us more time to prepare examples.', vi: 'Học ngày mai cho chúng ta thêm thời gian chuẩn bị ví dụ.' },
    { text: 'I suggest choosing the plan that helps everyone speak more calmly.', vi: 'Tôi đề xuất chọn kế hoạch giúp mọi người nói bình tĩnh hơn.' },
  ] }),
  makeItem({ id: 'shadow-b1-health-routine', titleVi: 'Thói quen sức khỏe', titleEn: 'Health routine', level: 'B1', topic: 'health routine', descriptionVi: 'Luyện nói về thói quen tốt và lý do duy trì.', estimatedTime: '6 phút', lines: [
    { text: 'I try to keep a simple health routine during busy weeks.', vi: 'Tôi cố giữ một thói quen sức khỏe đơn giản trong những tuần bận rộn.' },
    { text: 'In the morning, I drink water and stretch for five minutes.', vi: 'Buổi sáng, tôi uống nước và giãn cơ trong năm phút.' },
    { text: 'After studying for a long time, I stand up and rest my eyes.', vi: 'Sau khi học lâu, tôi đứng dậy và cho mắt nghỉ.' },
    { text: 'These small habits help me stay focused and sleep better.', vi: 'Những thói quen nhỏ này giúp tôi tập trung và ngủ tốt hơn.' },
  ] }),
  makeItem({ id: 'shadow-b2-balanced-technology-view', titleVi: 'Quan điểm cân bằng về công nghệ', titleEn: 'Balanced technology view', level: 'B2', topic: 'balanced technology view', descriptionVi: 'Luyện nêu quan điểm có hai mặt và kết luận rõ ràng.', estimatedTime: '7 phút', lines: [
    { text: 'Technology is most useful when it solves a real problem instead of creating a new habit.', vi: 'Công nghệ hữu ích nhất khi giải quyết vấn đề thật thay vì tạo thói quen mới.' },
    { text: 'For learners, an app can provide structure, reminders, and quick feedback.', vi: 'Với người học, ứng dụng có thể cung cấp cấu trúc, nhắc nhở và phản hồi nhanh.' },
    { text: 'However, progress still depends on focused practice and honest self-review.', vi: 'Tuy nhiên, tiến bộ vẫn phụ thuộc vào luyện tập tập trung và tự đánh giá trung thực.' },
    { text: 'That balance is what turns a tool into a meaningful learning routine.', vi: 'Sự cân bằng đó biến một công cụ thành thói quen học tập có ý nghĩa.' },
  ] }),
  makeItem({ id: 'shadow-b2-presenting-a-project-update', titleVi: 'Cập nhật tiến độ dự án', titleEn: 'Presenting a project update', level: 'B2', topic: 'presenting a project update', descriptionVi: 'Tập báo cáo tiến độ, rủi ro và bước tiếp theo.', estimatedTime: '7 phút', lines: [
    { text: 'Today, I will give a brief update on our learning dashboard project.', vi: 'Hôm nay, tôi sẽ cập nhật ngắn về dự án bảng điều khiển học tập.' },
    { text: 'The main layout is stable, and the latest tests show better mobile readability.', vi: 'Bố cục chính đã ổn định, và các kiểm thử mới nhất cho thấy khả năng đọc trên di động tốt hơn.' },
    { text: 'Our remaining risk is making sure every practice mode has enough reliable data.', vi: 'Rủi ro còn lại là bảo đảm mọi chế độ luyện tập có đủ dữ liệu đáng tin cậy.' },
    { text: 'The next step is to review weak areas before we invite more learners to try it.', vi: 'Bước tiếp theo là xem lại các phần yếu trước khi mời thêm người học dùng thử.' },
  ] }),
  makeItem({ id: 'shadow-b2-learning-from-feedback', titleVi: 'Học từ phản hồi', titleEn: 'Learning from feedback', level: 'B2', topic: 'learning from feedback', descriptionVi: 'Luyện nói về phản hồi với thái độ bình tĩnh và chủ động.', estimatedTime: '7 phút', lines: [
    { text: 'Good feedback is not always comfortable, but it gives us a clearer direction.', vi: 'Phản hồi tốt không phải lúc nào cũng dễ chịu, nhưng nó cho ta hướng đi rõ hơn.' },
    { text: 'When I receive comments on my speaking, I first look for repeated patterns.', vi: 'Khi nhận góp ý về phần nói, đầu tiên tôi tìm các mẫu lỗi lặp lại.' },
    { text: 'If several people notice the same issue, I turn it into a focused practice goal.', vi: 'Nếu nhiều người nhận ra cùng một vấn đề, tôi biến nó thành mục tiêu luyện tập tập trung.' },
    { text: 'This approach helps me improve without taking every correction personally.', vi: 'Cách tiếp cận này giúp tôi cải thiện mà không xem mọi sửa lỗi là chuyện cá nhân.' },
  ] }),
  makeItem({ id: 'shadow-b2-explaining-a-design-choice', titleVi: 'Giải thích lựa chọn thiết kế', titleEn: 'Explaining a design choice', level: 'B2', topic: 'explaining a design choice', descriptionVi: 'Tập giải thích lựa chọn thiết kế bằng lý do và tác động.', estimatedTime: '7 phút', lines: [
    { text: 'We chose a calm ocean theme because it makes practice feel less stressful.', vi: 'Chúng tôi chọn chủ đề đại dương dịu vì nó làm việc luyện tập bớt căng thẳng.' },
    { text: 'The whale coach gives friendly guidance without interrupting the main task.', vi: 'Huấn luyện viên cá voi đưa hướng dẫn thân thiện mà không làm gián đoạn nhiệm vụ chính.' },
    { text: 'Soft colors also help learners focus on the sentence they are repeating.', vi: 'Màu sắc nhẹ cũng giúp người học tập trung vào câu họ đang lặp lại.' },
    { text: 'In this case, design supports attention as much as it supports emotion.', vi: 'Trong trường hợp này, thiết kế hỗ trợ sự chú ý cũng nhiều như hỗ trợ cảm xúc.' },
  ] }),
  makeItem({ id: 'shadow-b2-discussing-learning-equity', titleVi: 'Bàn về cơ hội học tập', titleEn: 'Discussing learning equity', level: 'B2', topic: 'discussing learning equity', descriptionVi: 'Luyện trình bày ý kiến xã hội với ngôn ngữ rõ và cân bằng.', estimatedTime: '7 phút', lines: [
    { text: 'Learning opportunities should be practical, welcoming, and easy to start.', vi: 'Cơ hội học tập nên thực tế, thân thiện và dễ bắt đầu.' },
    { text: 'Many learners give up not because they lack ability, but because the path feels confusing.', vi: 'Nhiều người học bỏ cuộc không phải vì thiếu năng lực, mà vì lộ trình quá khó hiểu.' },
    { text: 'Clear guidance, gentle review, and accessible practice can reduce that barrier.', vi: 'Hướng dẫn rõ, ôn tập nhẹ và luyện tập dễ tiếp cận có thể giảm rào cản đó.' },
    { text: 'A good system should help people return to learning after a difficult day.', vi: 'Một hệ thống tốt nên giúp mọi người quay lại học sau một ngày khó khăn.' },
  ] }),
  makeItem({ id: 'shadow-b2-problem-solving-meeting', titleVi: 'Họp giải quyết vấn đề', titleEn: 'Problem-solving meeting', level: 'B2', topic: 'problem-solving meeting', descriptionVi: 'Luyện đề xuất giải pháp và phân công bước tiếp theo.', estimatedTime: '7 phút', lines: [
    { text: 'Before we choose a solution, let us identify the part that slows users down.', vi: 'Trước khi chọn giải pháp, hãy xác định phần làm người dùng chậm lại.' },
    { text: 'The data suggests that instructions are clear, but the first action is not obvious enough.', vi: 'Dữ liệu cho thấy hướng dẫn rõ, nhưng hành động đầu tiên chưa đủ dễ nhận ra.' },
    { text: 'We could improve the button label and add one short example below it.', vi: 'Chúng ta có thể cải thiện nhãn nút và thêm một ví dụ ngắn bên dưới.' },
    { text: 'After the change, we should test whether new learners complete the step faster.', vi: 'Sau thay đổi, chúng ta nên kiểm tra người học mới có hoàn thành bước đó nhanh hơn không.' },
  ] }),
  makeItem({ id: 'shadow-b2-environmental-message', titleVi: 'Thông điệp môi trường', titleEn: 'Environmental message', level: 'B2', topic: 'environmental message', descriptionVi: 'Tập nói về hành động nhỏ và tác động dài hạn.', estimatedTime: '7 phút', lines: [
    { text: 'Protecting the ocean begins with choices that look small in daily life.', vi: 'Bảo vệ đại dương bắt đầu từ những lựa chọn trông nhỏ trong đời sống hằng ngày.' },
    { text: 'When we use fewer disposable items, we reduce waste before it reaches the water.', vi: 'Khi dùng ít đồ dùng một lần hơn, chúng ta giảm rác trước khi nó ra đến nước.' },
    { text: 'Education also matters because people care more when they understand the impact.', vi: 'Giáo dục cũng quan trọng vì mọi người quan tâm hơn khi hiểu tác động.' },
    { text: 'A cleaner sea is not only a dream; it is a habit repeated by many people.', vi: 'Một biển sạch hơn không chỉ là giấc mơ; đó là thói quen được nhiều người lặp lại.' },
  ] }),
  makeItem({ id: 'shadow-b2-personal-growth-reflection', titleVi: 'Suy ngẫm phát triển bản thân', titleEn: 'Personal growth reflection', level: 'B2', topic: 'personal growth reflection', descriptionVi: 'Luyện kể tiến bộ cá nhân với nhịp chậm và tự nhiên.', estimatedTime: '7 phút', lines: [
    { text: 'Looking back, I can see that my confidence grew through many small attempts.', vi: 'Nhìn lại, tôi thấy sự tự tin của mình lớn lên qua nhiều lần thử nhỏ.' },
    { text: 'Some attempts were awkward, but each one taught me what to adjust next.', vi: 'Một vài lần khá vụng về, nhưng mỗi lần dạy tôi điều cần điều chỉnh tiếp theo.' },
    { text: 'I no longer expect every sentence to be perfect before I speak.', vi: 'Tôi không còn mong mọi câu phải hoàn hảo trước khi nói.' },
    { text: 'Instead, I focus on being clear, kind to myself, and ready to repeat.', vi: 'Thay vào đó, tôi tập trung vào việc rõ ràng, tử tế với bản thân và sẵn sàng lặp lại.' },
  ] }),
  makeItem({ id: 'shadow-b1-resolving-a-misunderstanding', titleVi: 'Giải quyết hiểu nhầm', titleEn: 'Resolving a misunderstanding', level: 'B1', topic: 'resolving a misunderstanding', descriptionVi: 'Luyện nói bình tĩnh khi có hiểu nhầm trong nhóm.', estimatedTime: '6 phút', lines: [
    { text: 'I think there was a small misunderstanding in our group chat.', vi: 'Tôi nghĩ đã có một hiểu nhầm nhỏ trong nhóm chat của chúng ta.' },
    { text: 'The message went to the wrong place, so I did not see it in time.', vi: 'Tin nhắn được gửi nhầm chỗ, nên tôi không thấy kịp lúc.' },
    { text: 'Let us use one shared channel for the next update.', vi: 'Hãy dùng một kênh chung cho cập nhật tiếp theo.' },
    { text: 'That way, everyone can follow the plan without feeling blamed.', vi: 'Như vậy, mọi người có thể theo dõi kế hoạch mà không cảm thấy bị đổ lỗi.' },
  ] }),
  makeItem({ id: 'shadow-b2-evaluating-a-learning-tool', titleVi: 'Đánh giá công cụ học', titleEn: 'Evaluating a learning tool', level: 'B2', topic: 'evaluating a learning tool', descriptionVi: 'Luyện nêu tiêu chí đánh giá công cụ học có lập luận rõ.', estimatedTime: '7 phút', lines: [
    { text: 'A learning tool should be evaluated by the habits it helps learners build.', vi: 'Một công cụ học nên được đánh giá qua thói quen nó giúp người học xây dựng.' },
    { text: 'Attractive features matter, but they do not guarantee steady practice.', vi: 'Tính năng hấp dẫn có quan trọng, nhưng không đảm bảo luyện tập đều đặn.' },
    { text: 'The most useful system gives feedback, invites repetition, and respects attention.', vi: 'Hệ thống hữu ích nhất đưa phản hồi, khuyến khích lặp lại và tôn trọng sự chú ý.' },
    { text: 'That is why practical learning design should be measured beyond entertainment.', vi: 'Vì vậy thiết kế học thực tế nên được đo lường vượt ngoài mức giải trí.' },
  ] }),
];

export function getGeneratedShadowingCatalog() {
  return generatedShadowingCatalog;
}

export function getGeneratedShadowingItemById(id: string) {
  return generatedShadowingCatalog.find((item) => item.id === id) ?? null;
}
