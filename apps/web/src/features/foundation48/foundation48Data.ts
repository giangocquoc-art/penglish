import { foundation48DeepLessons } from './foundation48DeepLessons';
import type { Foundation48Day, Foundation48PolishedLesson, Foundation48SourceDay } from './foundation48Types';
import { foundation48LessonSummaries } from './foundation48LessonSummaries';
import { foundation48SourceIndex } from './foundation48SourceIndex';

export const FOUNDATION48_BASE_PATH = '/luyen-tieng-anh/48-ngay-lay-goc';

export const foundation48Stages = [
  { id: 1, title: 'Tập nói “là / ở / thì” bằng câu ngắn', days: [1, 2, 3, 4] },
  { id: 2, title: 'Kể việc mình làm mỗi ngày', days: [5, 6, 7, 8] },
  { id: 3, title: 'Nhận mặt từ và thời gian', days: [9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { id: 4, title: 'Nói rõ hơn và hỏi tự nhiên hơn', days: [18, 19, 20, 21] },
  { id: 5, title: 'Ghép ý và nói “nếu… thì…”', days: [22, 23, 24, 25, 26, 27, 28] },
  { id: 6, title: 'Luyện nghe nền tảng', days: [29, 30, 31, 32, 33, 34] },
  { id: 7, title: 'Ôn câu quen và nói tự nhiên hơn', days: [35, 36, 37, 38] },
  { id: 8, title: 'Nghe chuyện đời sống và khép lại 48 ngày', days: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48] },
] as const;

const foundation48DisplayTitles: Record<number, string> = {
  1: 'Ngày 1: Tôi là ai? — I am / You are / I’m not',
  2: 'Ngày 2: Bạn có phải...? — Are you? / Is she? / Yes, I am',
  3: 'Ngày 3: Ai và cái gì? — Who is...? / What is...?',
  4: 'Ngày 4: Ở đâu, khi nào? — Where is...? / When is...?',
  5: 'Ngày 5: Tôi làm mỗi ngày — I study / She reads',
  6: 'Ngày 6: Tôi không làm — don’t / doesn’t',
};

const stage3InteractiveMeta: Record<number, { learnerTitle: string; readiness: 'complete' }> = {
  13: { learnerTitle: 'Hỏi chuyện đã xảy ra — Did you...? và câu trả lời ngắn', readiness: 'complete' },
  14: { learnerTitle: 'Tôi đã không làm — phủ định quá khứ với didn’t', readiness: 'complete' },
  15: { learnerTitle: 'Đã từng ở đâu? — was/were trong câu hỏi và phủ định', readiness: 'complete' },
  16: { learnerTitle: 'Tương lai gần — be going to', readiness: 'complete' },
  17: { learnerTitle: 'Tôi có thể làm — can / can’t cho khả năng', readiness: 'complete' },
};

const stage4InteractiveMeta: Record<number, { learnerTitle: string; readiness: 'complete' }> = {
  18: { learnerTitle: 'Nghe âm và bắt chước thật chậm', readiness: 'complete' },
  19: { learnerTitle: 'Nhấn nhẹ vào từ quan trọng', readiness: 'complete' },
  20: { learnerTitle: 'Các câu hỏi với từ để hỏi khác trong tiếng Anh', readiness: 'complete' },
  21: { learnerTitle: 'Luyện nghe số và tên', readiness: 'complete' },
};

const stage5InteractiveMeta: Record<number, { learnerTitle: string; readiness: 'complete' }> = {
  22: { learnerTitle: 'Nói “có thể / nên / phải” bằng câu ngắn', readiness: 'complete' },
  23: { learnerTitle: 'Liên từ And, But, Or, So và Because', readiness: 'complete' },
  24: { learnerTitle: 'Liên từ chỉ thời gian', readiness: 'complete' },
  25: { learnerTitle: 'Liên từ chỉ sự đối lập', readiness: 'complete' },
  26: { learnerTitle: 'Câu điều kiện loại 1', readiness: 'complete' },
  27: { learnerTitle: 'Câu điều kiện loại 2', readiness: 'complete' },
  28: { learnerTitle: 'Câu điều kiện loại 3', readiness: 'complete' },
};

const stage6InteractiveMeta: Record<number, { learnerTitle: string; readiness: 'complete' }> = {
  29: { learnerTitle: 'Luyện nghe điền từ', readiness: 'complete' },
  30: { learnerTitle: 'Luyện nghe chép chính tả', readiness: 'complete' },
  31: { learnerTitle: 'Luyện nghe về giờ', readiness: 'complete' },
  32: { learnerTitle: 'Luyện nghe ngày tháng', readiness: 'complete' },
  33: { learnerTitle: 'Luyện nghe địa điểm', readiness: 'complete' },
  34: { learnerTitle: 'Luyện nghe về tiền bạc', readiness: 'complete' },
};

const stage7InteractiveMeta: Record<number, { learnerTitle: string; readiness: 'complete' }> = {
  35: { learnerTitle: 'Nói về chính mình bằng câu rõ', readiness: 'complete' },
  36: { learnerTitle: 'Giữ thời gian trong câu cho khớp', readiness: 'complete' },
  37: { learnerTitle: 'Tiếng Anh giao tiếp 1', readiness: 'complete' },
  38: { learnerTitle: 'Nối hai ý đi cùng nhau', readiness: 'complete' },
};

const stage8InteractiveMeta: Record<number, { learnerTitle: string; readiness: 'complete' }> = {
  39: { learnerTitle: 'Luyện nghe về các quốc gia và châu lục', readiness: 'complete' },
  40: { learnerTitle: 'Luyện nghe về sở thích', readiness: 'complete' },
  41: { learnerTitle: 'Luyện nghe về giao thông', readiness: 'complete' },
  42: { learnerTitle: 'Luyện nghe về thể thao', readiness: 'complete' },
  43: { learnerTitle: 'Luyện nghe về nghề nghiệp', readiness: 'complete' },
  44: { learnerTitle: 'Luyện nghe về công nghệ', readiness: 'complete' },
  45: { learnerTitle: 'Tiếng Anh giao tiếp 2', readiness: 'complete' },
  46: { learnerTitle: 'Nghe và ghi từ khóa ngắn', readiness: 'complete' },
  47: { learnerTitle: 'Nói lại cùng ý bằng câu dễ hơn', readiness: 'complete' },
  48: { learnerTitle: 'Tự tin giới thiệu bản thân và thuyết trình bằng tiếng Anh', readiness: 'complete' },
};

const polishedLessons: Record<number, Foundation48PolishedLesson> = {
  1: {
    goal: 'Nhận diện chủ ngữ cơ bản và dùng am/is/are để tạo câu khẳng định, phủ định thật chắc.',
    explanation: 'Động từ to be là “khung xương” đầu tiên để nói ai/cái gì là gì hoặc đang ở trạng thái nào. Học viên chỉ cần ghép đúng chủ ngữ với am/is/are, sau đó thêm not khi muốn phủ định.',
    formulas: ['I + am + noun/adjective', 'You/We/They + are + noun/adjective', 'He/She/It + is + noun/adjective', 'Subject + am/is/are + not + noun/adjective'],
    examples: ['I am a student.', 'She is happy.', 'They are teachers.', 'He is not tall.', 'We are not sad.'],
    practiceQuestions: ['Điền am/is/are: I ___ a teacher.', 'Chuyển sang phủ định: She is my sister.', 'Viết 3 câu giới thiệu người thân bằng to be.', 'Chọn đúng: They (is/are) students.'],
    dailyTest: ['I ___ not a baby.', 'My father ___ tall.', 'You ___ my friend.', 'It ___ not small.', 'Viết một câu khẳng định và một câu phủ định về bản thân.'],
    finalTask: 'Tự giới thiệu 5 câu dùng to be, trong đó có ít nhất 2 câu phủ định.',
  },
  2: {
    goal: 'Biến câu to be thành câu hỏi Yes/No và trả lời ngắn gọn.',
    explanation: 'Với câu hỏi nghi vấn của to be, đưa am/is/are lên trước chủ ngữ. Câu trả lời ngắn dùng Yes/No + chủ ngữ + am/is/are hoặc dạng phủ định.',
    formulas: ['Am + I + ...?', 'Is + he/she/it + ...?', 'Are + you/we/they + ...?', 'Yes, subject + am/is/are.', 'No, subject + am/is/are + not.'],
    examples: ['Are you a student? Yes, I am.', 'Is she your teacher? No, she is not.', 'Are they happy? Yes, they are.', 'Is it a cat? No, it is not.'],
    practiceQuestions: ['Đổi sang câu hỏi: You are a student.', 'Trả lời ngắn: Is he your brother? Yes, ___.', 'Viết 4 câu hỏi với is/are.', 'Sửa lỗi: Are she happy?'],
    dailyTest: ['___ you a teacher?', '___ it your book?', 'No, he ___ not.', 'Yes, they ___.', 'Tạo một mini dialogue 4 dòng dùng câu hỏi to be.'],
    finalTask: 'Hỏi và trả lời 6 câu Yes/No về bạn bè, đồ vật hoặc gia đình.',
  },
  3: {
    goal: 'Dùng Who và What với to be để hỏi người và sự vật.',
    explanation: 'Who dùng để hỏi người; What dùng để hỏi tên, nghề, đồ vật hoặc bản chất sự việc. Sau Who/What vẫn giữ trật tự to be + chủ ngữ khi cần.',
    formulas: ['Who + is/are + subject?', 'What + is/are + subject?', 'What + is + your/his/her + name?', 'What + are + these/those?'],
    examples: ['Who is she? She is my sister.', 'What is this? It is a book.', 'What is your name?', 'Who are they? They are students.'],
    practiceQuestions: ['Chọn Who/What: ___ is your father?', 'Viết câu hỏi cho đáp án: She is my teacher.', 'Viết câu hỏi cho đáp án: It is an apple.', 'Sửa lỗi: What are he?'],
    dailyTest: ['___ is this?', '___ are they?', 'What ___ your name?', 'Who ___ your teacher?', 'Viết 4 câu hỏi Who/What quanh lớp học.'],
    finalTask: 'Tạo đoạn hỏi đáp 6 dòng giới thiệu người và đồ vật bằng Who/What.',
  },
  4: {
    goal: 'Dùng Where và When với to be để hỏi địa điểm và thời gian.',
    explanation: 'Where hỏi “ở đâu”, When hỏi “khi nào”. Với to be, cấu trúc phổ biến là Where/When + is/are + chủ ngữ. Đây là nền tảng cho hỏi thông tin ngắn.',
    formulas: ['Where + is/are + subject?', 'When + is/are + subject?', 'Subject + is/are + place/time'],
    examples: ['Where is your book? It is on the table.', 'Where are they? They are at school.', 'When is your birthday?', 'When are your classes?'],
    practiceQuestions: ['Chọn Where/When: ___ is your mother?', 'Đặt câu hỏi cho: My book is in the bag.', 'Đặt câu hỏi cho: My birthday is in May.', 'Viết 3 câu trả lời về địa điểm.'],
    dailyTest: ['Where ___ your pen?', 'When ___ your English class?', 'They ___ at home.', 'My test ___ on Monday.', 'Viết mini dialogue hỏi đường/giờ học.'],
    finalTask: 'Viết 8 câu hỏi-trả lời, 4 câu với Where và 4 câu với When.',
  },
  5: {
    goal: 'Dùng động từ thường ở hiện tại để nói thói quen và sự thật đơn giản.',
    explanation: 'Động từ thường diễn tả hành động như study, work, go, play. Với chủ ngữ he/she/it ở hiện tại đơn, động từ thường thêm s/es trong câu khẳng định.',
    formulas: ['I/You/We/They + verb', 'He/She/It + verb-s/es', 'Adverbs: always, usually, often, sometimes, never'],
    examples: ['I study English.', 'She reads books.', 'They play football.', 'The sun rises in the East.'],
    practiceQuestions: ['Thêm s/es: He ___ (go) to school.', 'Viết 4 câu về thói quen hằng ngày.', 'Chọn đúng: She (like/likes) apples.', 'Sắp xếp: always / I / breakfast / eat.'],
    dailyTest: ['My brother ___ football.', 'We ___ English every day.', 'She usually ___ early.', 'They ___ in Ha Noi.', 'Viết 5 câu thói quen của bạn.'],
    finalTask: 'Viết đoạn 6 câu mô tả một ngày bình thường bằng động từ thường.',
  },
  6: {
    goal: 'Tạo câu phủ định với động từ thường bằng do not/don’t và does not/doesn’t.',
    explanation: 'Khi phủ định động từ thường ở hiện tại, dùng trợ động từ do/does + not, và động từ chính trở về dạng nguyên mẫu. He/she/it dùng does not, không thêm s cho động từ chính.',
    formulas: ['I/You/We/They + do not/don’t + verb', 'He/She/It + does not/doesn’t + verb', 'Do not add -s after doesn’t'],
    examples: ['I do not like coffee.', 'She does not play tennis.', 'They don’t live here.', 'He doesn’t go to school on Sunday.'],
    practiceQuestions: ['Chuyển phủ định: She likes apples.', 'Sửa lỗi: He doesn’t likes tea.', 'Viết 4 câu phủ định về thói quen.', 'Điền don’t/doesn’t.'],
    dailyTest: ['I ___ watch TV every day.', 'He ___ play football.', 'They ___ work on Sunday.', 'She doesn’t ___ coffee.', 'Viết 5 điều bạn không làm hằng ngày.'],
    finalTask: 'Viết một đoạn “Things I don’t do every day” gồm 6 câu.',
  },
  7: {
    goal: 'Đặt câu hỏi với động từ thường bằng Do/Does.',
    explanation: 'Câu hỏi hiện tại đơn với động từ thường cần trợ động từ Do hoặc Does đứng đầu câu. Khi dùng Does cho he/she/it, động từ chính không thêm s/es.',
    formulas: ['Do + I/you/we/they + verb?', 'Does + he/she/it + verb?', 'Yes, subject + do/does.', 'No, subject + don’t/doesn’t.'],
    examples: ['Do you study English?', 'Does she like music?', 'Do they live here?', 'Does he play football? No, he doesn’t.'],
    practiceQuestions: ['Đổi sang câu hỏi: She likes tea.', 'Trả lời ngắn: Do you read books?', 'Sửa lỗi: Does he plays tennis?', 'Viết 5 câu hỏi về thói quen.'],
    dailyTest: ['___ you speak English?', '___ she go to school?', 'No, I ___.', 'Yes, he ___.', 'Tạo đoạn hỏi đáp 6 dòng với Do/Does.'],
    finalTask: 'Phỏng vấn tưởng tượng một người bạn bằng 8 câu hỏi Do/Does.',
  },
  8: {
    goal: 'Tổng hợp hiện tại đơn: khẳng định, phủ định, nghi vấn và dấu hiệu tần suất.',
    explanation: 'Hiện tại đơn dùng cho thói quen, lịch trình, sự thật hiển nhiên và trạng thái lặp lại. Cần kiểm soát chủ ngữ he/she/it, trợ động từ do/does và trạng từ tần suất.',
    formulas: ['Subject + verb/verb-s', 'Subject + don’t/doesn’t + verb', 'Do/Does + subject + verb?', 'always/usually/often/sometimes/never + verb phrase'],
    examples: ['I always get up early.', 'She usually has breakfast at seven.', 'He doesn’t like cartoons.', 'Do you often go to the park?'],
    practiceQuestions: ['Viết 5 câu có trạng từ tần suất.', 'Chuyển sang phủ định: He watches cartoons.', 'Đặt câu hỏi: They play tennis.', 'Sửa lỗi: She don’t like milk.'],
    dailyTest: ['The sun ___ in the East.', 'People ___ water every day.', 'My sister ___ tidy her room.', 'Does he ___ novels?', 'Viết đoạn 8 câu về routine của bạn.'],
    finalTask: 'Hoàn thành một “daily routine card” gồm 10 câu hiện tại đơn, có ít nhất 2 câu hỏi và 2 câu phủ định.',
  },
};

function getStageForDay(dayNumber: number) {
  const stage = foundation48Stages.find((item) => item.days.includes(dayNumber as never)) || foundation48Stages[0];
  return { stageId: stage.id, stageTitle: stage.title };
}

const fallbackSummary = (dayNumber: number, title: string) => ({
  dayNumber,
  summary: `Ngày ${dayNumber} tập trung vào ${title.toLowerCase()} với một bài học ngắn và nhiệm vụ thực hành vừa sức.`,
  keyPoints: [`Nắm ý chính của bài: ${title}.`, 'Đọc mẫu chậm, chú ý cấu trúc và từ khóa.', 'Tự tạo câu ngắn trước khi chuyển sang bài tiếp theo.'],
  examples: ['Viết 2 câu mẫu theo chủ điểm hôm nay.', 'Đọc thành tiếng từng câu và tự sửa lỗi cơ bản.'],
  practice: ['Làm phần luyện cùng Poo theo từng câu ngắn.', 'Tự viết 3 câu mới rồi để Poo nhắc lại chủ ngữ, động từ và dấu câu.'],
  finalTask: `Tóm tắt bài “${title}” bằng 3 gạch đầu dòng và tự tạo ít nhất 3 câu ví dụ.`,
  sourceLabels: [],
  needsReview: false,
});

export const foundation48Days: Foundation48Day[] = foundation48SourceIndex.map((sourceDay) => {
  const day = sourceDay as unknown as Foundation48SourceDay;
  const title = foundation48DeepLessons[day.dayNumber]?.learnerTitle ?? stage3InteractiveMeta[day.dayNumber]?.learnerTitle ?? stage4InteractiveMeta[day.dayNumber]?.learnerTitle ?? stage5InteractiveMeta[day.dayNumber]?.learnerTitle ?? stage6InteractiveMeta[day.dayNumber]?.learnerTitle ?? stage7InteractiveMeta[day.dayNumber]?.learnerTitle ?? stage8InteractiveMeta[day.dayNumber]?.learnerTitle ?? foundation48DisplayTitles[day.dayNumber] ?? day.title;

  return {
    ...day,
    title,
    ...getStageForDay(day.dayNumber),
    polished: polishedLessons[day.dayNumber],
    summary: foundation48LessonSummaries.find((summary) => summary.dayNumber === day.dayNumber) ?? fallbackSummary(day.dayNumber, title),
  };
});

export const foundation48Stats = {
  totalDays: foundation48Days.length,
  pdfCount: foundation48Days.reduce((sum, day) => sum + day.pdfCount, 0),
  mp3Count: foundation48Days.reduce((sum, day) => sum + day.audio.length, 0),
  audioDays: foundation48Days.filter((day) => day.audio.length > 0).map((day) => day.dayNumber),
  videoDays: foundation48Days.filter((day) => day.hasVideo).map((day) => day.dayNumber),
  polishedDays: foundation48Days.filter((day) => day.polished || foundation48DeepLessons[day.dayNumber]?.readiness === 'complete' || stage3InteractiveMeta[day.dayNumber]?.readiness === 'complete' || stage4InteractiveMeta[day.dayNumber]?.readiness === 'complete' || stage5InteractiveMeta[day.dayNumber]?.readiness === 'complete' || stage6InteractiveMeta[day.dayNumber]?.readiness === 'complete' || stage7InteractiveMeta[day.dayNumber]?.readiness === 'complete' || stage8InteractiveMeta[day.dayNumber]?.readiness === 'complete').map((day) => day.dayNumber),
  sourceRenderedDays: foundation48Days.filter((day) => !day.polished && foundation48DeepLessons[day.dayNumber]?.readiness !== 'complete' && stage3InteractiveMeta[day.dayNumber]?.readiness !== 'complete' && stage4InteractiveMeta[day.dayNumber]?.readiness !== 'complete' && stage5InteractiveMeta[day.dayNumber]?.readiness !== 'complete' && stage6InteractiveMeta[day.dayNumber]?.readiness !== 'complete' && stage7InteractiveMeta[day.dayNumber]?.readiness !== 'complete' && stage8InteractiveMeta[day.dayNumber]?.readiness !== 'complete').map((day) => day.dayNumber),
};

export function getFoundation48Day(dayNumber: number) {
  return foundation48Days.find((day) => day.dayNumber === dayNumber);
}

export function getFoundation48DayPath(dayNumber: number) {
  return `${FOUNDATION48_BASE_PATH}/ngay/${dayNumber}`;
}

export function getFoundation48InteractiveReadiness(dayNumber: number) {
  return foundation48DeepLessons[dayNumber]?.readiness ?? stage3InteractiveMeta[dayNumber]?.readiness ?? stage4InteractiveMeta[dayNumber]?.readiness ?? stage5InteractiveMeta[dayNumber]?.readiness ?? stage6InteractiveMeta[dayNumber]?.readiness ?? stage7InteractiveMeta[dayNumber]?.readiness ?? stage8InteractiveMeta[dayNumber]?.readiness ?? 'future';
}
