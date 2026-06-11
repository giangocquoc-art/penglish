import { shadowingLessons } from '../../data/shadowingLessons';
import { generatedShadowingVideos } from './shadowingAdapter';
export type { AdaptedShadowingVideo } from './shadowingAdapter';

export type ShadowingSentence = {
  id: string;
  start: number;
  end: number;
  text: string;
  vi: string;
  focusNotes?: string[];
};

export type ShadowingTranscriptLine = ShadowingSentence;

export type ShadowingVideo = {
  id: string;
  title: string;
  level: string;
  topic: string;
  duration: string;
  videoUrl: string;
  description: string;
  transcript: ShadowingSentence[];
  transcriptLines: ShadowingTranscriptLine[];
  youtubeId: string;
  embedAllowed: boolean;
  focusNotes: string[];
  referenceVideoTitle?: string;
  referenceVideoUrl?: string;
};

function createTranscriptLines(
  lessonId: string,
  lines: Array<{ text: string; vi: string; focusNotes: string[] }>,
): ShadowingTranscriptLine[] {
  return lines.map((line, index) => ({
    id: `${lessonId}-s${index + 1}`,
    start: index * 4,
    end: index * 4 + 4,
    text: line.text,
    vi: line.vi,
    focusNotes: line.focusNotes,
  }));
}

function createCuratedShadowingLesson(config: {
  id: string;
  title: string;
  level: string;
  topic: string;
  duration: string;
  description: string;
  focusNotes: string[];
  youtubeId?: string;
  embedAllowed?: boolean;
  referenceVideoTitle?: string;
  lines: Array<{ text: string; vi: string; focusNotes: string[] }>;
}): ShadowingVideo {
  const transcriptLines = createTranscriptLines(config.id, config.lines);
  const youtubeId = config.youtubeId ?? '';
  const embedAllowed = Boolean(config.embedAllowed && youtubeId);

  return {
    id: config.id,
    title: config.title,
    level: config.level,
    topic: config.topic,
    duration: config.duration,
    videoUrl: youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : '',
    description: config.description,
    transcript: transcriptLines,
    transcriptLines,
    youtubeId,
    embedAllowed,
    focusNotes: config.focusNotes,
    referenceVideoTitle: config.referenceVideoTitle,
    referenceVideoUrl: youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : undefined,
  };
}

export const curatedShadowingVideos: ShadowingVideo[] = [
  createCuratedShadowingLesson({
    id: 'curated-a1-greeting-friend',
    title: 'A1 · Greeting a friend',
    level: 'A1',
    topic: 'Greeting a friend',
    duration: '5 câu · 3 phút',
    description: 'Chào bạn, hỏi thăm ngắn và trả lời tự nhiên bằng nhịp A1.',
    focusNotes: ['Âm /h/ trong hello, hi', 'Nối nhẹ: How are you?', 'Lên giọng ở câu hỏi ngắn'],
    lines: [
      { text: 'Hi, Mia. How are you today?', vi: 'Chào Mia. Hôm nay bạn thế nào?', focusNotes: ['Giữ âm /h/ rõ ở hi và how.', 'Đọc How are you như một cụm.'] },
      { text: 'I am good, thanks. And you?', vi: 'Mình khỏe, cảm ơn. Còn bạn?', focusNotes: ['Nhấn nhẹ good và thanks.', 'And you lên giọng cuối câu.'] },
      { text: 'I am fine. It is nice to see you.', vi: 'Mình ổn. Rất vui được gặp bạn.', focusNotes: ['Nối is nice nhẹ.', 'Âm cuối /t/ trong nice to không cần bật quá mạnh.'] },
      { text: 'Nice to see you too.', vi: 'Mình cũng vui được gặp bạn.', focusNotes: ['Đọc too dài và tròn môi.', 'Giữ nhịp chậm, rõ từng cụm.'] },
      { text: 'Let us go to class together.', vi: 'Chúng ta cùng đến lớp nhé.', focusNotes: ['Let us có thể nói như lets.', 'Nhấn class together.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-a1-ordering-coffee',
    title: 'A1 · Ordering coffee',
    level: 'A1',
    topic: 'Ordering coffee',
    duration: '6 câu · 4 phút',
    description: 'Gọi đồ uống đơn giản, nói lịch sự và xác nhận đơn hàng.',
    focusNotes: ['Âm /w/ trong would', 'Ngữ điệu lịch sự với please', 'Âm cuối trong milk, small'],
    lines: [
      { text: 'Good morning. Can I have a coffee, please?', vi: 'Chào buổi sáng. Cho tôi một cà phê được không?', focusNotes: ['Can I nối nhẹ thành /kənaɪ/.', 'Please xuống giọng mềm.'] },
      { text: 'Sure. Would you like milk?', vi: 'Được ạ. Bạn có muốn thêm sữa không?', focusNotes: ['Would bắt đầu bằng môi tròn /w/.', 'Like milk nhấn rõ milk.'] },
      { text: 'Yes, please. A little milk is fine.', vi: 'Có, làm ơn. Một chút sữa là được.', focusNotes: ['Little có âm /t/ nhẹ.', 'Fine kéo nhẹ âm /ai/.'] },
      { text: 'Small or large?', vi: 'Cỡ nhỏ hay lớn?', focusNotes: ['Đối lập small và large.', 'Lên giọng ở câu hỏi lựa chọn.'] },
      { text: 'Small, please.', vi: 'Cỡ nhỏ, làm ơn.', focusNotes: ['Âm cuối /l/ trong small.', 'Please nói ngắn, lịch sự.'] },
      { text: 'Thank you. Have a nice day.', vi: 'Cảm ơn. Chúc bạn một ngày tốt lành.', focusNotes: ['Thank có âm /θ/.', 'Have a nối nhẹ.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-a1-classroom-conversation',
    title: 'A1 · Classroom conversation',
    level: 'A1',
    topic: 'Classroom conversation',
    duration: '6 câu · 4 phút',
    description: 'Xin nhắc lại, hỏi đồ vật và trao đổi nhanh trong lớp học.',
    focusNotes: ['Âm /r/ trong repeat', 'Nhấn từ classroom objects', 'Câu hỏi Can you...'],
    lines: [
      { text: 'Excuse me, teacher.', vi: 'Xin lỗi cô/thầy.', focusNotes: ['Excuse me nối thành một cụm.', 'Teacher âm cuối /r/ nhẹ.'] },
      { text: 'Can you repeat that, please?', vi: 'Cô/thầy có thể nhắc lại điều đó không?', focusNotes: ['Repeat nhấn âm thứ hai.', 'That có âm /ð/.'] },
      { text: 'Of course. Open your book to page ten.', vi: 'Tất nhiên. Mở sách trang mười.', focusNotes: ['Open your nối nhẹ.', 'Page ten nhấn rõ số trang.'] },
      { text: 'Do we need a pencil?', vi: 'Chúng ta có cần bút chì không?', focusNotes: ['Need a nối nhẹ.', 'Pencil nhấn âm đầu.'] },
      { text: 'Yes, please write your name.', vi: 'Có, hãy viết tên của bạn.', focusNotes: ['Write your nối /raɪtʃər/.', 'Name kéo âm /eɪ/.'] },
      { text: 'Thank you. I understand now.', vi: 'Cảm ơn. Bây giờ em hiểu rồi.', focusNotes: ['Understand nhấn âm cuối.', 'Now xuống giọng kết thúc.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-a1-daily-routine',
    title: 'A1 · Daily routine',
    level: 'A1',
    topic: 'Daily routine',
    duration: '6 câu · 4 phút',
    description: 'Kể thói quen hằng ngày bằng câu ngắn, rõ và đều nhịp.',
    focusNotes: ['Âm cuối hiện tại đơn', 'Nhịp morning routine', 'Phân biệt get/go'],
    lines: [
      { text: 'I get up at six o clock.', vi: 'Tôi thức dậy lúc sáu giờ.', focusNotes: ['Get up nối nhẹ.', 'Six có âm cuối /ks/.'] },
      { text: 'I brush my teeth and wash my face.', vi: 'Tôi đánh răng và rửa mặt.', focusNotes: ['Brush có âm /ʃ/.', 'Teeth có âm /θ/.'] },
      { text: 'I eat breakfast with my family.', vi: 'Tôi ăn sáng với gia đình.', focusNotes: ['Breakfast thường đọc /brekfəst/.', 'Family có thể đọc 3 âm tiết.'] },
      { text: 'Then I go to school.', vi: 'Sau đó tôi đi học.', focusNotes: ['Then có âm /ð/.', 'Go to nối nhẹ.'] },
      { text: 'I study English in the evening.', vi: 'Tôi học tiếng Anh vào buổi tối.', focusNotes: ['Study nhấn âm đầu.', 'Evening nhấn âm đầu.'] },
      { text: 'I go to bed at ten.', vi: 'Tôi đi ngủ lúc mười giờ.', focusNotes: ['Go to bed nói thành cụm.', 'Ten kết thúc rõ /n/.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-a2-asking-directions',
    title: 'A2 · Asking for directions',
    level: 'A2',
    topic: 'Asking for directions',
    duration: '6 câu · 4 phút',
    description: 'Hỏi đường, nghe chỉ dẫn và xác nhận lại điểm đến.',
    focusNotes: ['Âm /r/ trong right', 'Nhấn chỉ hướng turn left', 'Câu hỏi Where is...'],
    lines: [
      { text: 'Excuse me, where is the train station?', vi: 'Xin lỗi, nhà ga ở đâu ạ?', focusNotes: ['Where is nối nhẹ.', 'Station nhấn âm đầu.'] },
      { text: 'Go straight for two blocks.', vi: 'Đi thẳng hai dãy nhà.', focusNotes: ['Go straight nói liền.', 'Blocks có âm cuối /ks/.'] },
      { text: 'Then turn left at the bank.', vi: 'Sau đó rẽ trái ở ngân hàng.', focusNotes: ['Turn left nhấn rõ hướng.', 'At the nối nhẹ.'] },
      { text: 'Is it next to the supermarket?', vi: 'Nó có ở cạnh siêu thị không?', focusNotes: ['Next to nối thành cụm.', 'Supermarket nhấn âm đầu.'] },
      { text: 'Yes, it is across from the supermarket.', vi: 'Đúng, nó ở đối diện siêu thị.', focusNotes: ['Across from nhấn across.', 'Không nuốt âm /s/ cuối yes.'] },
      { text: 'Thank you for your help.', vi: 'Cảm ơn bạn đã giúp đỡ.', focusNotes: ['Thank có /θ/.', 'For your nối /fər jər/.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-a2-shopping-conversation',
    title: 'A2 · Shopping conversation',
    level: 'A2',
    topic: 'Shopping conversation',
    duration: '6 câu · 4 phút',
    description: 'Hỏi giá, thử đồ và quyết định mua hàng bằng câu A2.',
    focusNotes: ['Âm /ʃ/ trong shirt', 'Ngữ điệu câu hỏi giá', 'Nhấn size/color'],
    lines: [
      { text: 'How much is this blue shirt?', vi: 'Chiếc áo sơ mi màu xanh này giá bao nhiêu?', focusNotes: ['Much có âm /tʃ/.', 'Blue shirt nối nhẹ.'] },
      { text: 'It is twenty dollars.', vi: 'Nó giá hai mươi đô la.', focusNotes: ['Twenty thường đọc /tweni/.', 'Dollars âm cuối nhẹ.'] },
      { text: 'Do you have it in a small size?', vi: 'Bạn có cỡ nhỏ không?', focusNotes: ['Have it nối /hævɪt/.', 'Small size nhấn hai từ chính.'] },
      { text: 'Yes, here you are.', vi: 'Có, của bạn đây.', focusNotes: ['Here you are nói thành cụm lịch sự.', 'Xuống giọng ở cuối.'] },
      { text: 'Can I try it on?', vi: 'Tôi có thể thử nó không?', focusNotes: ['Try it on nối từng từ.', 'Lên giọng câu hỏi yes/no.'] },
      { text: 'I will take it, thank you.', vi: 'Tôi sẽ lấy cái này, cảm ơn.', focusNotes: ['Will take it nối nhẹ.', 'Thank có /θ/.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-a2-hotel-check-in',
    title: 'A2 · Hotel check-in',
    level: 'A2',
    topic: 'Hotel check-in',
    duration: '6 câu · 4 phút',
    description: 'Nhận phòng khách sạn, xác nhận đặt phòng và hỏi thông tin cơ bản.',
    focusNotes: ['Âm /v/ trong reservation', 'Nhấn last name', 'Cụm check in'],
    lines: [
      { text: 'Hello, I have a reservation.', vi: 'Xin chào, tôi có đặt phòng.', focusNotes: ['Reservation nhấn âm /veɪ/.', 'Have a nối nhẹ.'] },
      { text: 'What is your last name?', vi: 'Họ của bạn là gì?', focusNotes: ['What is nối /wʌts/.', 'Last name nhấn rõ.'] },
      { text: 'My last name is Nguyen.', vi: 'Họ của tôi là Nguyễn.', focusNotes: ['Name is nối nhẹ.', 'Nguyen đọc rõ theo tên riêng của bạn.'] },
      { text: 'You are in room two oh five.', vi: 'Bạn ở phòng 205.', focusNotes: ['Room kéo âm /uː/.', 'Two oh five đọc từng số.'] },
      { text: 'Is breakfast included?', vi: 'Bữa sáng có bao gồm không?', focusNotes: ['Breakfast /brekfəst/.', 'Included nhấn âm thứ hai.'] },
      { text: 'Yes, breakfast starts at seven.', vi: 'Có, bữa sáng bắt đầu lúc bảy giờ.', focusNotes: ['Starts at nối nhẹ.', 'Seven nhấn âm đầu.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-a2-doctor-appointment',
    title: 'A2 · Doctor appointment',
    level: 'A2',
    topic: 'Doctor appointment',
    duration: '6 câu · 4 phút',
    description: 'Đặt lịch khám, nói triệu chứng đơn giản và xác nhận thời gian.',
    focusNotes: ['Âm /θ/ trong throat', 'Nhấn appointment', 'Câu I have...'],
    lines: [
      { text: 'I would like to see a doctor.', vi: 'Tôi muốn gặp bác sĩ.', focusNotes: ['Would like to nói thành cụm.', 'Doctor nhấn âm đầu.'] },
      { text: 'What seems to be the problem?', vi: 'Bạn có vấn đề gì?', focusNotes: ['Seems to nối nhẹ.', 'Problem nhấn âm đầu.'] },
      { text: 'I have a sore throat and a fever.', vi: 'Tôi bị đau họng và sốt.', focusNotes: ['Sore throat có /θ/.', 'Fever nhấn âm đầu.'] },
      { text: 'Can you come at three o clock?', vi: 'Bạn có thể đến lúc ba giờ không?', focusNotes: ['Come at nối nhẹ.', 'Three có /θr/.'] },
      { text: 'Yes, three o clock is fine.', vi: 'Được, ba giờ là ổn.', focusNotes: ['Three o clock đọc rõ cụm giờ.', 'Fine xuống giọng.'] },
      { text: 'Please bring your ID card.', vi: 'Vui lòng mang theo thẻ căn cước.', focusNotes: ['Please bring nối nhẹ.', 'ID card đọc từng chữ I-D.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-b1-job-interview-small-talk',
    title: 'B1 · Job interview small talk',
    level: 'B1',
    topic: 'Job interview small talk',
    duration: '6 câu · 5 phút',
    description: 'Mở đầu phỏng vấn tự nhiên, lịch sự và có nhịp nói chuyên nghiệp.',
    focusNotes: ['Ngữ điệu tự tin', 'Nhấn experience/interested', 'Nối cụm lịch sự'],
    lines: [
      { text: 'Good morning. Thank you for meeting with me today.', vi: 'Chào buổi sáng. Cảm ơn anh/chị đã gặp tôi hôm nay.', focusNotes: ['Thank you for nối mượt.', 'Meeting with me chia thành cụm.'] },
      { text: 'I am excited to learn more about the role.', vi: 'Tôi rất hào hứng tìm hiểu thêm về vị trí này.', focusNotes: ['Excited nhấn âm hai.', 'Role kết thúc tròn âm /oʊl/.'] },
      { text: 'Your experience looks very relevant.', vi: 'Kinh nghiệm của bạn trông rất phù hợp.', focusNotes: ['Experience nhấn âm hai.', 'Relevant nhấn âm đầu.'] },
      { text: 'I worked with customers for two years.', vi: 'Tôi đã làm việc với khách hàng trong hai năm.', focusNotes: ['Worked có âm /t/ cuối.', 'Customers nhấn âm đầu.'] },
      { text: 'That helped me become patient and organized.', vi: 'Điều đó giúp tôi trở nên kiên nhẫn và có tổ chức.', focusNotes: ['Helped me nối nhẹ.', 'Organized nhấn âm đầu.'] },
      { text: 'I would be happy to answer your questions.', vi: 'Tôi rất sẵn lòng trả lời câu hỏi của anh/chị.', focusNotes: ['Would be happy nói thành cụm.', 'Questions có âm /tʃ/.'] },
    ],
  }),
  createCuratedShadowingLesson({
    id: 'curated-b1-airport-help',
    title: 'B1 · Travel problem / airport help',
    level: 'B1',
    topic: 'Airport help',
    duration: '7 câu · 5 phút',
    description: 'Xử lý vấn đề ở sân bay: trễ chuyến, đổi cổng và nhờ hỗ trợ.',
    focusNotes: ['Nhấn delayed/gate/connection', 'Nói rõ thông tin chuyến bay', 'Giữ giọng bình tĩnh'],
    lines: [
      { text: 'Excuse me, my flight has been delayed.', vi: 'Xin lỗi, chuyến bay của tôi đã bị hoãn.', focusNotes: ['Flight có /fl/.', 'Delayed nhấn âm hai.'] },
      { text: 'I am worried about my connection.', vi: 'Tôi lo về chuyến nối tiếp của mình.', focusNotes: ['Worried nhấn âm đầu.', 'Connection nhấn âm hai.'] },
      { text: 'Can you check the next available flight?', vi: 'Bạn có thể kiểm tra chuyến bay còn chỗ tiếp theo không?', focusNotes: ['Check the nối nhẹ.', 'Available nhấn âm hai.'] },
      { text: 'There is another flight at six thirty.', vi: 'Có một chuyến khác lúc sáu giờ ba mươi.', focusNotes: ['There is nối /ðerz/.', 'Six thirty đọc rõ hai phần.'] },
      { text: 'Will my bag move to the new flight?', vi: 'Hành lý của tôi sẽ được chuyển sang chuyến mới chứ?', focusNotes: ['Will my nối nhẹ.', 'New flight nhấn rõ.'] },
      { text: 'Yes, your bag will be transferred automatically.', vi: 'Có, hành lý của bạn sẽ được chuyển tự động.', focusNotes: ['Transferred nhấn âm hai.', 'Automatically chia nhịp chậm.'] },
      { text: 'Thank you for helping me stay calm.', vi: 'Cảm ơn bạn đã giúp tôi bình tĩnh.', focusNotes: ['Helping me nối nhẹ.', 'Stay calm xuống giọng.'] },
    ],
  }),
];

const dedicatedShadowingVideos: ShadowingVideo[] = shadowingLessons.map((item) => {
  const transcript = item.sentences.map((sentence, index) => ({
    id: `${item.id}-${sentence.id}`,
    start: index * 4,
    end: index * 4 + 4,
    text: sentence.text,
    vi: sentence.vi,
    focusNotes: [sentence.hint, ...(sentence.focusWords?.length ? [`Từ khóa: ${sentence.focusWords.join(', ')}`] : [])].filter((note): note is string => Boolean(note)),
  }));

  return {
    id: item.id,
    title: `${item.level} · ${item.title}`,
    level: item.level,
    topic: item.topic,
    duration: `${item.sentenceCount} câu · ${item.durationMinutes} phút`,
    videoUrl: '',
    description: item.description,
    transcript,
    transcriptLines: transcript,
    youtubeId: '',
    embedAllowed: false,
    focusNotes: item.pronunciationFocus ?? [],
  };
});

const adaptedGeneratedVideos: ShadowingVideo[] = generatedShadowingVideos.map((item) => ({
  ...item,
  transcriptLines: item.transcriptLines ?? item.transcript,
  youtubeId: item.youtubeId ?? '',
  embedAllowed: Boolean(item.embedAllowed && item.youtubeId),
  focusNotes: item.focusNotes ?? item.learnerTipsVi ?? [],
}));

const dedicatedLessonIds = new Set(dedicatedShadowingVideos.map((item) => item.id));
const legacyCuratedVideos = curatedShadowingVideos.filter((item) => !dedicatedLessonIds.has(item.id));

export const shadowingVideos: ShadowingVideo[] = [...dedicatedShadowingVideos, ...legacyCuratedVideos, ...adaptedGeneratedVideos];
