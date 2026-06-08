import { buildDeepLesson } from './foundation48DeepLessons';
import type { DaySeed, Foundation48DeepLesson } from './foundation48DeepLessons';

const stage3Seeds: Record<number, DaySeed> = {
  13: {
    title: 'Hỏi chuyện đã xảy ra — Did you...? và câu trả lời ngắn',
    goal: 'Biết hỏi việc đã xảy ra bằng Did và trả lời Yes/No ngắn mà không thêm -ed sau Did.',
    grammarTitle: 'Did + subject + verb nguyên mẫu?',
    grammar: 'Trong câu hỏi quá khứ đơn với động từ thường, dùng Did ở đầu câu. Sau Did, động từ chính trở về dạng nguyên mẫu: Did you study? Không nói Did you studied?',
    vocabulary: [['did', 'đã...không', 'Did you study yesterday?'], ['yesterday', 'hôm qua', 'Did you work yesterday?'], ['last night', 'tối qua', 'Did she call last night?'], ['study', 'học', 'Did you study English?'], ['watch', 'xem', 'Did they watch TV?'], ['visit', 'thăm', 'Did he visit his grandma?'], ['call', 'gọi điện', 'Did she call you?'], ['answer', 'trả lời', 'Yes, I did.']],
    patterns: [['Did + I/you/we/they + verb?', 'Hỏi quá khứ với chủ ngữ thường', ['Did you study yesterday?', 'Did they watch TV?']], ['Did + he/she/it + verb?', 'Hỏi quá khứ với he/she/it', ['Did she call last night?', 'Did he visit his grandma?']], ['Yes/No + subject + did/didn’t', 'Trả lời ngắn', ['Yes, I did.', 'No, she didn’t.']]],
    sentences: [['Did you study English yesterday?', 'Hôm qua bạn có học tiếng Anh không?'], ['Yes, I did.', 'Có, tôi đã học.'], ['Did she call you last night?', 'Tối qua cô ấy có gọi bạn không?'], ['No, she didn’t.', 'Không, cô ấy không gọi.'], ['Did they watch TV?', 'Họ có xem TV không?']],
    fills: [['___ you study English yesterday?', 'Did', 'Câu hỏi quá khứ đơn dùng Did ở đầu.'], ['Did she ___ you last night?', 'call', 'Sau Did dùng động từ nguyên mẫu.'], ['No, they ___.', 'didn’t', 'Trả lời phủ định ngắn dùng didn’t.']],
    orders: [['Hôm qua bạn có học tiếng Anh không?', 'Did you study English yesterday?'], ['Không, cô ấy không gọi.', 'No, she didn’t.']],
    choices: [['Câu hỏi quá khứ đúng:', 'Did you study yesterday?', ['Did you studied yesterday?', 'Do you studied yesterday?', 'You did study yesterday?']], ['Sau Did dùng dạng nào?', 'verb nguyên mẫu', ['verb-ed', 'verb-ing', 'to be only']], ['Trả lời ngắn đúng cho “Did she call?”', 'Yes, she did.', ['Yes, she does.', 'Yes, she called.', 'Yes, did she.']]],
    finalPrompt: 'Nói lại một câu hỏi về việc bạn đã làm hôm qua bằng Did.',
  },
  14: {
    title: 'Tôi đã không làm — phủ định quá khứ với didn’t',
    goal: 'Nói điều đã không xảy ra bằng didn’t + động từ nguyên mẫu trong câu ngắn.',
    grammarTitle: 'did not / didn’t + verb nguyên mẫu',
    grammar: 'Phủ định quá khứ đơn với động từ thường dùng did not hoặc didn’t. Sau didn’t, động từ chính luôn ở dạng nguyên mẫu: I didn’t go, không nói I didn’t went.',
    vocabulary: [['didn’t', 'đã không', 'I didn’t watch TV.'], ['go', 'đi', 'He didn’t go to school.'], ['finish', 'hoàn thành', 'She didn’t finish homework.'], ['play', 'chơi', 'They didn’t play football.'], ['because', 'bởi vì', 'I didn’t go because I was tired.'], ['tired', 'mệt', 'I was tired.'], ['homework', 'bài tập về nhà', 'She didn’t finish homework.'], ['early', 'sớm', 'We didn’t sleep early.']],
    patterns: [['Subject + didn’t + verb', 'Phủ định việc đã không làm', ['I didn’t watch TV.', 'They didn’t play football.']], ['Didn’t + verb nguyên mẫu', 'Không dùng quá khứ sau didn’t', ['He didn’t go.', 'She didn’t finish.']], ['Subject + didn’t + verb + because...', 'Nói lý do đơn giản', ['I didn’t go because I was tired.']]],
    sentences: [['I didn’t watch TV last night.', 'Tối qua tôi đã không xem TV.'], ['He didn’t go to school yesterday.', 'Hôm qua anh ấy đã không đi học.'], ['She didn’t finish her homework.', 'Cô ấy đã không hoàn thành bài tập.'], ['They didn’t play football.', 'Họ đã không chơi bóng đá.'], ['We didn’t sleep early.', 'Chúng tôi đã không ngủ sớm.']],
    fills: [['I ___ watch TV last night.', 'didn’t', 'Phủ định quá khứ dùng didn’t.'], ['He didn’t ___ to school.', 'go', 'Sau didn’t dùng go, không dùng went.'], ['She didn’t ___ homework.', 'finish', 'Sau didn’t dùng động từ nguyên mẫu.']],
    orders: [['Tối qua tôi đã không xem TV.', 'I didn’t watch TV last night.'], ['Hôm qua anh ấy đã không đi học.', 'He didn’t go to school yesterday.']],
    choices: [['Câu đúng là gì?', 'He didn’t go to school.', ['He didn’t went to school.', 'He doesn’t went to school.', 'He not went to school.']], ['Sau didn’t dùng gì?', 'go', ['went', 'going', 'goes']], ['“I didn’t watch TV” nghĩa là:', 'Tôi đã không xem TV.', ['Tôi đang xem TV.', 'Tôi xem TV mỗi ngày.', 'Tôi sẽ xem TV.']]],
    finalPrompt: 'Nói lại một câu về điều bạn đã không làm hôm qua.',
  },
  15: {
    title: 'Đã từng ở đâu? — was/were trong câu hỏi và phủ định',
    goal: 'Dùng was/were để hỏi và phủ định trạng thái hoặc địa điểm trong quá khứ.',
    grammarTitle: 'Was/Were + subject...? và subject + wasn’t/weren’t',
    grammar: 'To be ở quá khứ dùng was với I/he/she/it và were với you/we/they. Khi hỏi, đưa Was/Were lên đầu. Khi phủ định, thêm not: wasn’t/weren’t.',
    vocabulary: [['was', 'đã là/ở', 'She was at home.'], ['were', 'đã là/ở với số nhiều/you', 'They were late.'], ['wasn’t', 'đã không', 'He wasn’t tired.'], ['weren’t', 'đã không với số nhiều/you', 'We weren’t at school.'], ['at home', 'ở nhà', 'Were you at home?'], ['late', 'muộn', 'They were late.'], ['busy', 'bận', 'She was busy.'], ['sick', 'ốm', 'He wasn’t sick.']],
    patterns: [['Was + I/he/she/it + ...?', 'Hỏi quá khứ với was', ['Was she at home?', 'Was he tired?']], ['Were + you/we/they + ...?', 'Hỏi quá khứ với were', ['Were you busy?', 'Were they late?']], ['Subject + wasn’t/weren’t + ...', 'Phủ định với to be quá khứ', ['He wasn’t sick.', 'We weren’t at school.']]],
    sentences: [['Was she at home yesterday?', 'Hôm qua cô ấy có ở nhà không?'], ['Were you busy last night?', 'Tối qua bạn có bận không?'], ['He wasn’t tired.', 'Anh ấy đã không mệt.'], ['They were late.', 'Họ đã đến muộn.'], ['We weren’t at school.', 'Chúng tôi đã không ở trường.']],
    fills: [['___ she at home yesterday?', 'Was', 'She dùng Was trong câu hỏi quá khứ.'], ['___ you busy last night?', 'Were', 'You dùng Were.'], ['We ___ at school.', 'weren’t', 'We dùng weren’t để phủ định.']],
    orders: [['Tối qua bạn có bận không?', 'Were you busy last night?'], ['Anh ấy đã không mệt.', 'He wasn’t tired.']],
    choices: [['Câu hỏi đúng:', 'Was she at home?', ['Were she at home?', 'Did she was at home?', 'She was at home?']], ['You dùng to be quá khứ nào?', 'were', ['was', 'is', 'am']], ['Phủ định đúng với We:', 'We weren’t at school.', ['We wasn’t at school.', 'We didn’t were at school.', 'We not were at school.']]],
    finalPrompt: 'Nói lại một câu hỏi với Was hoặc Were.',
  },
  16: {
    title: 'Tương lai gần — be going to',
    goal: 'Nói kế hoạch sắp làm bằng am/is/are going to + động từ nguyên mẫu.',
    grammarTitle: 'subject + am/is/are going to + verb',
    grammar: 'Be going to dùng để nói kế hoạch hoặc dự định gần. Chọn am/is/are theo chủ ngữ, sau going to dùng động từ nguyên mẫu.',
    vocabulary: [['going to', 'sẽ/dự định', 'I am going to study.'], ['plan', 'kế hoạch', 'This is my plan.'], ['tomorrow', 'ngày mai', 'She is going to call tomorrow.'], ['tonight', 'tối nay', 'We are going to watch TV tonight.'], ['visit', 'thăm', 'I am going to visit my grandma.'], ['buy', 'mua', 'He is going to buy a book.'], ['practice', 'luyện tập', 'They are going to practice English.'], ['weekend', 'cuối tuần', 'We are going to travel this weekend.']],
    patterns: [['I am going to + verb', 'Tôi dự định sẽ làm gì', ['I am going to study.', 'I am going to visit my grandma.']], ['He/She/It is going to + verb', 'Một người/vật sẽ làm gì', ['She is going to call tomorrow.', 'He is going to buy a book.']], ['We/They/You are going to + verb', 'Nhiều người/bạn sẽ làm gì', ['We are going to watch TV.', 'They are going to practice English.']]],
    sentences: [['I am going to study English tomorrow.', 'Ngày mai tôi sẽ học tiếng Anh.'], ['She is going to call her friend tonight.', 'Tối nay cô ấy sẽ gọi bạn.'], ['We are going to watch TV.', 'Chúng tôi sẽ xem TV.'], ['He is going to buy a book.', 'Anh ấy sẽ mua một quyển sách.'], ['They are going to practice English.', 'Họ sẽ luyện tiếng Anh.']],
    fills: [['I ___ going to study tomorrow.', 'am', 'I đi với am.'], ['She ___ going to call tonight.', 'is', 'She đi với is.'], ['They ___ going to practice English.', 'are', 'They đi với are.']],
    orders: [['Ngày mai tôi sẽ học tiếng Anh.', 'I am going to study English tomorrow.'], ['Họ sẽ luyện tiếng Anh.', 'They are going to practice English.']],
    choices: [['Câu đúng với “She” là:', 'She is going to call.', ['She are going to call.', 'She going to call.', 'She is going to calls.']], ['Sau going to dùng:', 'verb nguyên mẫu', ['verb-ing', 'verb-s', 'verb-ed']], ['“tomorrow” thường nói về:', 'tương lai', ['quá khứ', 'hiện tại tiếp diễn', 'danh từ số nhiều']]],
    finalPrompt: 'Nói lại một câu về kế hoạch ngày mai của bạn bằng going to.',
  },
  17: {
    title: 'Tôi có thể làm — can / can’t cho khả năng',
    goal: 'Nói khả năng, xin phép đơn giản và phủ định bằng can/can’t + động từ nguyên mẫu.',
    grammarTitle: 'can / can’t + verb nguyên mẫu',
    grammar: 'Can dùng để nói có thể làm gì. Can không đổi theo chủ ngữ; sau can/can’t dùng động từ nguyên mẫu: I can swim, she can swim, they can’t swim.',
    vocabulary: [['can', 'có thể', 'I can speak English.'], ['can’t', 'không thể', 'He can’t swim.'], ['speak', 'nói', 'She can speak English.'], ['swim', 'bơi', 'I can swim.'], ['drive', 'lái xe', 'My father can drive.'], ['cook', 'nấu ăn', 'Mom can cook well.'], ['help', 'giúp', 'Can you help me?'], ['try', 'thử', 'I can try again.']],
    patterns: [['Subject + can + verb', 'Nói ai đó có thể làm gì', ['I can speak English.', 'She can cook well.']], ['Subject + can’t + verb', 'Nói ai đó không thể làm gì', ['He can’t swim.', 'They can’t drive.']], ['Can + subject + verb?', 'Hỏi khả năng/xin phép', ['Can you help me?', 'Can she speak English?']]],
    sentences: [['I can speak English.', 'Tôi có thể nói tiếng Anh.'], ['She can cook well.', 'Cô ấy có thể nấu ăn giỏi.'], ['He can’t swim.', 'Anh ấy không thể bơi.'], ['Can you help me?', 'Bạn có thể giúp tôi không?'], ['They can try again.', 'Họ có thể thử lại.']],
    fills: [['I ___ speak English.', 'can', 'Can dùng cho khả năng.'], ['He ___ swim.', 'can’t', 'Phủ định khả năng dùng can’t.'], ['Can you ___ me?', 'help', 'Sau Can dùng động từ nguyên mẫu.']],
    orders: [['Tôi có thể nói tiếng Anh.', 'I can speak English.'], ['Bạn có thể giúp tôi không?', 'Can you help me?']],
    choices: [['Câu đúng là:', 'She can cook well.', ['She cans cook well.', 'She can cooks well.', 'She can cooking well.']], ['Sau can dùng:', 'verb nguyên mẫu', ['verb-s', 'to verb', 'verb-ed']], ['Câu hỏi đúng:', 'Can you help me?', ['Do you can help me?', 'Can help you me?', 'You can help me?']]],
    finalPrompt: 'Nói lại một câu về điều bạn có thể làm bằng can.',
  },
};

export const foundation48Stage3LazyDeepLessons: Record<number, Foundation48DeepLesson> = Object.fromEntries(
  Object.entries(stage3Seeds).map(([day, seed]) => [Number(day), buildDeepLesson(Number(day), seed)]),
) as Record<number, Foundation48DeepLesson>;

export function getFoundation48Stage3LazyDeepLesson(dayNumber: number) {
  return foundation48Stage3LazyDeepLessons[dayNumber];
}
