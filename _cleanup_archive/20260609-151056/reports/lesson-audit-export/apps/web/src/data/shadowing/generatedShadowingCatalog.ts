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
  makeItem({ id: 'shadow-a1-greeting-friend', titleVi: 'Chào một người bạn', titleEn: 'Greeting a friend', level: 'A1', topic: 'greeting a friend', descriptionVi: 'Luyện chào hỏi ngắn, thân thiện và rõ nhịp.', estimatedTime: '4 phút', lines: [
    { text: 'Hi, Mai. How are you today?', vi: 'Chào Mai. Hôm nay bạn thế nào?' },
    { text: 'I am good, thank you.', vi: 'Tôi khỏe, cảm ơn bạn.' },
    { text: 'It is nice to see you.', vi: 'Rất vui được gặp bạn.' },
    { text: 'Let us study together.', vi: 'Chúng ta cùng học nhé.' },
  ] }),
  makeItem({ id: 'shadow-a1-order-water-coffee', titleVi: 'Gọi nước hoặc cà phê', titleEn: 'Ordering water or coffee', level: 'A1', topic: 'ordering water/coffee', descriptionVi: 'Tập câu gọi đồ uống đơn giản trong quán.', estimatedTime: '4 phút', lines: [
    { text: 'Can I have a glass of water, please?', vi: 'Cho tôi một ly nước được không?' },
    { text: 'I would like a small coffee.', vi: 'Tôi muốn một ly cà phê nhỏ.' },
    { text: 'No sugar, please.', vi: 'Làm ơn không đường.' },
    { text: 'Thank you very much.', vi: 'Cảm ơn rất nhiều.' },
  ] }),
  makeItem({ id: 'shadow-a1-school-talk', titleVi: 'Nói về trường học', titleEn: 'Talking about school', level: 'A1', topic: 'talking about school', descriptionVi: 'Luyện câu ngắn về lớp học và môn học.', estimatedTime: '4 phút', lines: [
    { text: 'I go to school in the morning.', vi: 'Tôi đi học vào buổi sáng.' },
    { text: 'My classroom is small but bright.', vi: 'Lớp học của tôi nhỏ nhưng sáng.' },
    { text: 'I like English and music.', vi: 'Tôi thích tiếng Anh và âm nhạc.' },
    { text: 'My teacher is very kind.', vi: 'Giáo viên của tôi rất tốt.' },
  ] }),
  makeItem({ id: 'shadow-a1-daily-routine', titleVi: 'Thói quen hằng ngày', titleEn: 'Daily routine', level: 'A1', topic: 'daily routine', descriptionVi: 'Tập nói về những việc đơn giản mỗi ngày.', estimatedTime: '4 phút', lines: [
    { text: 'I wake up at six o clock.', vi: 'Tôi thức dậy lúc sáu giờ.' },
    { text: 'I brush my teeth and eat breakfast.', vi: 'Tôi đánh răng và ăn sáng.' },
    { text: 'I learn five new words.', vi: 'Tôi học năm từ mới.' },
    { text: 'I sleep early at night.', vi: 'Tôi ngủ sớm vào buổi tối.' },
  ] }),
  makeItem({ id: 'shadow-a2-asking-directions', titleVi: 'Hỏi đường', titleEn: 'Asking for directions', level: 'A2', topic: 'asking for directions', descriptionVi: 'Luyện hỏi và nghe chỉ đường bằng câu rõ ràng.', estimatedTime: '5 phút', lines: [
    { text: 'Excuse me, where is the bus station?', vi: 'Xin lỗi, trạm xe buýt ở đâu?' },
    { text: 'Go straight and turn left at the bank.', vi: 'Đi thẳng và rẽ trái ở ngân hàng.' },
    { text: 'Is it far from here?', vi: 'Nó có xa đây không?' },
    { text: 'No, it takes about five minutes.', vi: 'Không, mất khoảng năm phút.' },
  ] }),
  makeItem({ id: 'shadow-a2-shopping-conversation', titleVi: 'Mua sắm đơn giản', titleEn: 'Shopping conversation', level: 'A2', topic: 'shopping conversation', descriptionVi: 'Tập nhịp câu khi hỏi giá và chọn món.', estimatedTime: '5 phút', lines: [
    { text: 'How much is this blue shirt?', vi: 'Chiếc áo xanh này giá bao nhiêu?' },
    { text: 'It is fifteen dollars today.', vi: 'Hôm nay nó giá mười lăm đô.' },
    { text: 'Can I try a larger size?', vi: 'Tôi thử cỡ lớn hơn được không?' },
    { text: 'Sure, the fitting room is over there.', vi: 'Được, phòng thử đồ ở đằng kia.' },
  ] }),
  makeItem({ id: 'shadow-a2-simple-travel-plan', titleVi: 'Kế hoạch du lịch ngắn', titleEn: 'Simple travel plan', level: 'A2', topic: 'simple travel plan', descriptionVi: 'Luyện nói về thời gian, địa điểm và hoạt động.', estimatedTime: '5 phút', lines: [
    { text: 'This weekend, I will visit Da Nang.', vi: 'Cuối tuần này, tôi sẽ đến Đà Nẵng.' },
    { text: 'I want to see the beach in the morning.', vi: 'Tôi muốn ngắm biển vào buổi sáng.' },
    { text: 'Then I will try local food with my family.', vi: 'Sau đó tôi sẽ thử món địa phương với gia đình.' },
    { text: 'I hope the weather is sunny.', vi: 'Tôi hy vọng thời tiết có nắng.' },
  ] }),
  makeItem({ id: 'shadow-a2-describing-hobbies', titleVi: 'Mô tả sở thích', titleEn: 'Describing hobbies', level: 'A2', topic: 'describing hobbies', descriptionVi: 'Tập nói thêm lý do cho sở thích cá nhân.', estimatedTime: '5 phút', lines: [
    { text: 'In my free time, I like drawing small pictures.', vi: 'Khi rảnh, tôi thích vẽ những bức tranh nhỏ.' },
    { text: 'It helps me feel calm after school.', vi: 'Việc đó giúp tôi thấy bình tĩnh sau giờ học.' },
    { text: 'I also listen to English songs.', vi: 'Tôi cũng nghe các bài hát tiếng Anh.' },
    { text: 'The words are simple, so I can sing along.', vi: 'Từ ngữ đơn giản nên tôi có thể hát theo.' },
  ] }),
  makeItem({ id: 'shadow-b1-study-habit', titleVi: 'Giải thích thói quen học', titleEn: 'Study habit explanation', level: 'B1', topic: 'study habit explanation', descriptionVi: 'Luyện giải thích cách học và lợi ích bằng câu dài vừa phải.', estimatedTime: '6 phút', lines: [
    { text: 'I study English for twenty minutes every morning before breakfast.', vi: 'Tôi học tiếng Anh hai mươi phút mỗi sáng trước bữa ăn.' },
    { text: 'First, I review old words so I do not forget them.', vi: 'Đầu tiên, tôi ôn từ cũ để không quên.' },
    { text: 'After that, I listen to one short conversation and repeat the useful phrases.', vi: 'Sau đó, tôi nghe một đoạn hội thoại ngắn và lặp lại các cụm hữu ích.' },
    { text: 'This simple habit makes me more confident when I speak.', vi: 'Thói quen đơn giản này giúp tôi tự tin hơn khi nói.' },
  ] }),
  makeItem({ id: 'shadow-b1-part-time-interview', titleVi: 'Phỏng vấn việc làm thêm', titleEn: 'Part-time job interview', level: 'B1', topic: 'part-time job interview', descriptionVi: 'Tập trả lời phỏng vấn ngắn với giọng bình tĩnh.', estimatedTime: '6 phút', lines: [
    { text: 'I am interested in this part-time job because I enjoy helping customers.', vi: 'Tôi quan tâm công việc bán thời gian này vì tôi thích hỗ trợ khách hàng.' },
    { text: 'I can work in the evenings and on Saturday mornings.', vi: 'Tôi có thể làm buổi tối và sáng thứ Bảy.' },
    { text: 'At school, I learned how to organize tasks and work with a team.', vi: 'Ở trường, tôi học cách sắp xếp công việc và làm việc nhóm.' },
    { text: 'I am ready to learn and follow the store rules carefully.', vi: 'Tôi sẵn sàng học hỏi và tuân thủ nội quy cửa hàng cẩn thận.' },
  ] }),
  makeItem({ id: 'shadow-b1-teamwork-discussion', titleVi: 'Thảo luận làm việc nhóm', titleEn: 'Teamwork discussion', level: 'B1', topic: 'teamwork discussion', descriptionVi: 'Luyện đưa ý kiến mềm mại trong nhóm.', estimatedTime: '6 phút', lines: [
    { text: 'I think our team should divide the project into three small parts.', vi: 'Tôi nghĩ nhóm nên chia dự án thành ba phần nhỏ.' },
    { text: 'Each person can choose one part and report progress every two days.', vi: 'Mỗi người chọn một phần và báo tiến độ hai ngày một lần.' },
    { text: 'If someone has a problem, we can help early instead of waiting.', vi: 'Nếu ai gặp vấn đề, chúng ta có thể giúp sớm thay vì chờ đợi.' },
    { text: 'This plan will make our presentation clearer and less stressful.', vi: 'Kế hoạch này sẽ làm bài trình bày rõ hơn và ít căng thẳng hơn.' },
  ] }),
  makeItem({ id: 'shadow-b2-learning-strategy', titleVi: 'Giải thích chiến lược học', titleEn: 'Explaining a learning strategy', level: 'B2', topic: 'explaining a learning strategy', descriptionVi: 'Luyện trình bày chiến lược học với ý chính rõ ràng.', estimatedTime: '7 phút', lines: [
    { text: 'My main strategy is to connect new vocabulary with situations I actually meet.', vi: 'Chiến lược chính của tôi là nối từ mới với tình huống tôi thật sự gặp.' },
    { text: 'Instead of memorizing a long list, I create a short sentence that sounds natural to me.', vi: 'Thay vì học thuộc danh sách dài, tôi tạo một câu ngắn nghe tự nhiên với mình.' },
    { text: 'Then I record myself and check whether the rhythm is clear enough.', vi: 'Sau đó tôi ghi âm và kiểm tra nhịp nói đã đủ rõ chưa.' },
    { text: 'This makes practice more personal and easier to repeat consistently.', vi: 'Cách này làm việc luyện tập cá nhân hơn và dễ lặp lại đều đặn hơn.' },
  ] }),
  makeItem({ id: 'shadow-b2-digital-habits-opinion', titleVi: 'Ý kiến về thói quen số', titleEn: 'Opinion about digital habits', level: 'B2', topic: 'giving an opinion about digital habits', descriptionVi: 'Tập nêu quan điểm cân bằng về công nghệ.', estimatedTime: '7 phút', lines: [
    { text: 'Digital tools can support learning, but they can also distract us very quickly.', vi: 'Công cụ số có thể hỗ trợ học tập, nhưng cũng làm ta xao nhãng rất nhanh.' },
    { text: 'For that reason, I set a clear purpose before opening any app.', vi: 'Vì lý do đó, tôi đặt mục đích rõ ràng trước khi mở bất kỳ ứng dụng nào.' },
    { text: 'If I only need ten minutes of listening practice, I stop when the timer ends.', vi: 'Nếu tôi chỉ cần mười phút luyện nghe, tôi dừng khi hết giờ.' },
    { text: 'Small limits help me use technology without losing control of my attention.', vi: 'Những giới hạn nhỏ giúp tôi dùng công nghệ mà không mất kiểm soát sự chú ý.' },
  ] }),
  makeItem({ id: 'shadow-b2-career-goals', titleVi: 'Trao đổi mục tiêu nghề nghiệp', titleEn: 'Discussing career goals', level: 'B2', topic: 'discussing career goals', descriptionVi: 'Luyện nói về mục tiêu nghề nghiệp với lý do và kế hoạch.', estimatedTime: '7 phút', lines: [
    { text: 'In the next few years, I want to build a career that combines communication and technology.', vi: 'Trong vài năm tới, tôi muốn xây dựng sự nghiệp kết hợp giao tiếp và công nghệ.' },
    { text: 'I am improving my English because it helps me read better resources and work with more people.', vi: 'Tôi đang cải thiện tiếng Anh vì nó giúp tôi đọc tài liệu tốt hơn và làm việc với nhiều người hơn.' },
    { text: 'My short-term goal is to present ideas clearly in meetings.', vi: 'Mục tiêu ngắn hạn của tôi là trình bày ý tưởng rõ ràng trong cuộc họp.' },
    { text: 'Later, I hope to lead small projects with confidence and responsibility.', vi: 'Sau này, tôi hy vọng dẫn dắt các dự án nhỏ với sự tự tin và trách nhiệm.' },
  ] }),
];

export function getGeneratedShadowingCatalog() {
  return generatedShadowingCatalog;
}

export function getGeneratedShadowingItemById(id: string) {
  return generatedShadowingCatalog.find((item) => item.id === id) ?? null;
}
