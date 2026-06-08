import { buildDeepLesson } from './foundation48DeepLessons';
import type { DaySeed, Foundation48DeepLesson } from './foundation48DeepLessons';

const stage7Seeds: Record<number, DaySeed> = {
  35: {
    title: 'Đại từ phản thân',
    goal: 'Hôm nay bạn học cách nói tự mình làm việc gì bằng myself, yourself, himself…',
    grammarTitle: 'Myself, yourself, himself, herself...',
    grammar: 'Đại từ phản thân dùng khi người làm hành động cũng liên quan trực tiếp đến chính mình. Với người mới, hãy nhớ các cụm giao tiếp ngắn như I did it myself hoặc She teaches herself English.',
    vocabulary: [['myself','tự tôi','I made it myself.'],['yourself','tự bạn','Can you do it yourself?'],['himself','tự anh ấy','He cooks for himself.'],['herself','tự cô ấy','She teaches herself English.'],['ourselves','tự chúng tôi','We enjoyed ourselves.'],['themselves','tự họ','They helped themselves.']],
    patterns: [['I + verb + myself','tự tôi làm',['I made it myself.','I can do it myself.']],['She/He + verb + herself/himself','tự người đó làm',['She teaches herself English.','He cooks for himself.']],['We/They + verb + ourselves/themselves','cả nhóm tự làm',['We enjoyed ourselves.','They helped themselves.']]],
    sentences: [['I made it myself.','Tôi tự làm nó.'],['She teaches herself English.','Cô ấy tự học tiếng Anh.'],['We enjoyed ourselves.','Chúng tôi đã vui vẻ.'],['Can you do it yourself?','Bạn tự làm được không?'],['He cooks for himself.','Anh ấy tự nấu cho mình.']],
    fills: [['Điền từ: I made it ___.','I made it myself.','myself'],['Điền từ: She teaches ___ English.','She teaches herself English.','herself'],['Điền từ: We enjoyed ___.','We enjoyed ourselves.','ourselves']],
    orders: [['Sắp xếp câu: I / made / it / myself','I made it myself.'],['Sắp xếp câu: We / enjoyed / ourselves','We enjoyed ourselves.']],
    choices: [['Câu nào nghĩa là “Tôi tự làm nó”?','I made it myself.',['I made it myself.','I made it yourself.','She made myself.','I myself it made.']],['Chọn đại từ cho she.','herself',['herself','himself','myself','ourselves']],['Câu nào đúng?','She teaches herself English.',['She teaches herself English.','She teaches myself English.','She herself teaches English me.','She teach herself.']]],
    finalPrompt: 'Nói 4 câu ngắn với myself, yourself, herself và ourselves.',
  },
  36: {
    title: 'Sự hòa hợp về thì',
    goal: 'Hôm nay bạn luyện chọn thì phù hợp khi kể lại lời nói hoặc suy nghĩ.',
    grammarTitle: 'Hiện tại khi nói hiện tại, quá khứ khi kể lại',
    grammar: 'Bài này chỉ luyện cảm giác thì đơn giản: He says he is tired khi đang nói hiện tại; He said he was tired khi kể lại trong quá khứ. Không cần học quy tắc nâng cao.',
    vocabulary: [['says','nói','He says he is tired.'],['said','đã nói','He said he was tired.'],['think','nghĩ','I think she likes English.'],['thought','đã nghĩ','I thought she liked English.'],['tired','mệt','He is tired.'],['likes','thích','She likes English.']],
    patterns: [['He says + present','nói ở hiện tại',['He says he is tired.','She says she likes tea.']],['He said + past','kể lại quá khứ',['He said he was tired.','She said she liked tea.']],['I think/thought...','nói suy nghĩ hiện tại/quá khứ',['I think she likes English.','I thought she liked English.']]],
    sentences: [['He says he is tired.','Anh ấy nói anh ấy mệt.'],['He said he was tired.','Anh ấy đã nói anh ấy mệt.'],['I think she likes English.','Tôi nghĩ cô ấy thích tiếng Anh.'],['I thought she liked English.','Tôi đã nghĩ cô ấy thích tiếng Anh.'],['She said she was busy.','Cô ấy đã nói cô ấy bận.']],
    fills: [['Điền từ: He said he ___ tired.','He said he was tired.','was'],['Điền từ: He says he ___ tired.','He says he is tired.','is'],['Điền từ: I thought she ___ English.','I thought she liked English.','liked']],
    orders: [['Sắp xếp câu: He / says / he / is / tired','He says he is tired.'],['Sắp xếp câu: He / said / he / was / tired','He said he was tired.']],
    choices: [['Câu hiện tại nào đúng?','He says he is tired.',['He says he is tired.','He says he was tired yesterday.','He said he is tired.','He tired says.']],['Câu kể lại quá khứ nào đúng?','He said he was tired.',['He said he was tired.','He says he is tired.','He said he is tired now.','He was said tired.']],['I thought... thường đi với gì trong câu đơn giản này?','liked',['liked','likes','like','liking']]],
    finalPrompt: 'Đọc cặp câu hiện tại/quá khứ: says/is, said/was, think/likes, thought/liked.',
  },
  37: {
    title: 'Tiếng Anh giao tiếp 1',
    goal: 'Hôm nay bạn học các câu giao tiếp ngắn để xin giúp đỡ, hỏi lại và nói khi chưa hiểu.',
    grammarTitle: 'Câu giao tiếp cứu nguy ngắn',
    grammar: 'Trong giao tiếp thật, người mới cần vài câu ngắn để không bị đứng hình: xin giúp đỡ, nhờ lặp lại, nói chưa hiểu, hỏi đường đơn giản.',
    vocabulary: [['help','giúp','Can you help me?'],['repeat','lặp lại','Could you repeat that?'],['understand','hiểu','I do not understand.'],['where','ở đâu','Where is the bus station?'],['please','làm ơn','Please help me.'],['station','bến xe','Where is the bus station?']],
    patterns: [['Can you + verb?','nhờ giúp đỡ',['Can you help me?','Can you show me?']],['Could you repeat...?','nhờ nhắc lại',['Could you repeat that?','Could you say it again?']],['I do not understand','nói chưa hiểu',['I do not understand.','Sorry, I do not understand.']],['Where is + place?','hỏi địa điểm',['Where is the bus station?','Where is the supermarket?']]],
    sentences: [['Can you help me?','Bạn giúp tôi được không?'],['Could you repeat that?','Bạn có thể lặp lại không?'],['I do not understand.','Tôi không hiểu.'],['Where is the bus station?','Bến xe ở đâu?'],['Please say it again.','Làm ơn nói lại lần nữa.']],
    fills: [['Điền từ: Can you ___ me?','Can you help me?','help'],['Điền từ: Could you ___ that?','Could you repeat that?','repeat'],['Điền từ: I do not ___.','I do not understand.','understand']],
    orders: [['Sắp xếp câu: Can / you / help / me','Can you help me?'],['Sắp xếp câu: Where / is / the / bus / station','Where is the bus station?']],
    choices: [['Câu nào xin giúp đỡ?','Can you help me?',['Can you help me?','I do not understand.','Where is the bus station?','Thank you.']],['Câu nào nhờ lặp lại?','Could you repeat that?',['Could you repeat that?','Can you help me?','I am busy.','It costs five dollars.']],['Câu nào nói “Tôi không hiểu”?','I do not understand.',['I do not understand.','I do not station.','I repeat that.','I help me.']]],
    finalPrompt: 'Đóng vai một đoạn hội thoại 4 câu: xin giúp đỡ, hỏi lại, nói chưa hiểu, hỏi bến xe.',
  },
  38: {
    title: 'Liên từ tương hỗ',
    goal: 'Hôm nay bạn học cách nối hai lựa chọn hoặc hai ý song song bằng both...and, either...or.',
    grammarTitle: 'Both...and, either...or, neither...nor, not only...but also',
    grammar: 'Liên từ tương hỗ đi theo cặp. Với người mới, dùng câu ngắn và rõ: both...and để lấy cả hai, either...or để chọn một trong hai, neither...nor để không cái nào, not only...but also để khen thêm ý.',
    vocabulary: [['both','cả hai','Both Lan and Nam study English.'],['either','hoặc một trong hai','You can choose either tea or coffee.'],['neither','không cái nào trong hai','Neither he nor she is ready.'],['not only','không chỉ','She is not only kind but also smart.'],['ready','sẵn sàng','She is ready.'],['smart','thông minh','She is smart.']],
    patterns: [['Both A and B','cả A và B',['Both Lan and Nam study English.','Both tea and coffee are good.']],['Either A or B','chọn A hoặc B',['You can choose either tea or coffee.','Either you or I can go.']],['Neither A nor B','không A cũng không B',['Neither he nor she is ready.','Neither tea nor coffee is here.']],['Not only A but also B','không chỉ A mà còn B',['She is not only kind but also smart.','He is not only fast but also careful.']]],
    sentences: [['Both Lan and Nam study English.','Cả Lan và Nam đều học tiếng Anh.'],['You can choose either tea or coffee.','Bạn có thể chọn trà hoặc cà phê.'],['Neither he nor she is ready.','Cả anh ấy và cô ấy đều chưa sẵn sàng.'],['She is not only kind but also smart.','Cô ấy không chỉ tốt bụng mà còn thông minh.'],['Both tea and coffee are good.','Cả trà và cà phê đều ngon.']],
    fills: [['Điền từ: Both Lan ___ Nam study English.','Both Lan and Nam study English.','and'],['Điền từ: You can choose either tea ___ coffee.','You can choose either tea or coffee.','or'],['Điền từ: Neither he ___ she is ready.','Neither he nor she is ready.','nor']],
    orders: [['Sắp xếp câu: Both / Lan / and / Nam / study / English','Both Lan and Nam study English.'],['Sắp xếp câu: You / can / choose / either / tea / or / coffee','You can choose either tea or coffee.']],
    choices: [['Cặp nào nghĩa là “cả hai”?','both...and',['both...and','either...or','neither...nor','because...so']],['Câu nào đúng?','You can choose either tea or coffee.',['You can choose either tea or coffee.','You either can choose tea and coffee.','Either tea coffee choose.','You can neither tea or coffee.']],['Cặp nào nghĩa là “không cái nào trong hai”?','neither...nor',['neither...nor','both...and','not only...but also','so...because']]],
    finalPrompt: 'Tạo 4 câu ngắn, mỗi câu dùng một cặp liên từ tương hỗ.',
  },
};

export const foundation48Stage7LazyDeepLessons: Record<number, Foundation48DeepLesson> = Object.fromEntries(
  Object.entries(stage7Seeds).map(([day, seed]) => [Number(day), buildDeepLesson(Number(day), seed)]),
) as Record<number, Foundation48DeepLesson>;

export function getFoundation48Stage7LazyDeepLesson(dayNumber: number) {
  return foundation48Stage7LazyDeepLessons[dayNumber];
}