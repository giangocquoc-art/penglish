import { buildDeepLesson } from './foundation48DeepLessons';
import type { DaySeed, Foundation48DeepLesson } from './foundation48DeepLessons';

const stage5Seeds: Record<number, DaySeed> = {
  22: {
    title: 'Động từ khuyết thiếu',
    goal: 'Hôm nay bạn học cách nói nên, phải, có thể, được phép bằng các động từ khuyết thiếu quen thuộc.',
    grammarTitle: 'Can, should, must, have to, may',
    grammar: 'Động từ khuyết thiếu đứng trước động từ chính dạng nguyên mẫu. Dùng can để nói khả năng hoặc lời đề nghị, should để khuyên nhẹ, must/have to để nói điều cần làm, may/can để xin phép lịch sự. Không thêm s sau he/she/it khi dùng modal.',
    vocabulary: [
      ['can', 'có thể', 'I can help you.'],
      ['should', 'nên', 'You should drink water.'],
      ['must', 'phải', 'You must wear a helmet.'],
      ['have to', 'phải/cần phải', 'I have to go now.'],
      ['may', 'có thể/được phép', 'May I sit here?'],
      ['help', 'giúp', 'Can you help me?'],
    ],
    patterns: [
      ['Subject + can + verb', 'ai đó có thể làm gì', ['I can help you.', 'She can speak English.']],
      ['Subject + should + verb', 'ai đó nên làm gì', ['You should drink water.', 'He should rest.']],
      ['Subject + must/have to + verb', 'ai đó phải làm gì', ['I must study today.', 'We have to leave now.']],
      ['Can/May + I + verb?', 'xin phép hoặc đề nghị lịch sự', ['Can I open the window?', 'May I come in?']],
    ],
    sentences: [
      ['I can help you.', 'Tôi có thể giúp bạn.'],
      ['You should drink water.', 'Bạn nên uống nước.'],
      ['We must be quiet.', 'Chúng ta phải giữ yên lặng.'],
      ['I have to go now.', 'Tôi phải đi bây giờ.'],
      ['May I sit here?', 'Tôi ngồi đây được không?'],
    ],
    fills: [
      ['Điền từ: I ___ help you.', 'I can help you.', 'can'],
      ['Điền từ: You ___ drink water.', 'You should drink water.', 'should'],
      ['Điền từ: We ___ be quiet.', 'We must be quiet.', 'must'],
    ],
    orders: [
      ['Sắp xếp câu: can / I / help / you', 'I can help you.'],
      ['Sắp xếp câu: should / You / water / drink', 'You should drink water.'],
    ],
    choices: [
      ['Câu nào nói “Tôi có thể giúp bạn”?', 'I can help you.', ['I can help you.', 'I must helped you.', 'I should water.', 'Can I you help?']],
      ['Câu nào là lời khuyên nhẹ?', 'You should drink water.', ['You should drink water.', 'You musted water.', 'You can to water.', 'You may water drink.']],
      ['Câu nào xin phép lịch sự?', 'May I sit here?', ['May I sit here?', 'I sit may here?', 'I must sit here?', 'Should I here sit?']],
    ],
    finalPrompt: 'Tự nói 4 câu: một câu với can, một câu với should, một câu với must/have to và một câu xin phép.',
  },
  23: {
    title: 'Liên từ And, But, Or, So và Because',
    goal: 'Hôm nay bạn học nối hai ý ngắn bằng and, but, or, so, because để nói tự nhiên hơn.',
    grammarTitle: 'Nối ý cơ bản bằng liên từ',
    grammar: 'And thêm thông tin cùng chiều. But nối hai ý trái nhau. Or đưa ra lựa chọn. So nói kết quả. Because nói lý do. Với người mới, hãy nối hai câu ngắn rõ nghĩa trước khi viết câu dài.',
    vocabulary: [
      ['and', 'và', 'I like tea and milk.'],
      ['but', 'nhưng', 'I like tea, but I do not like coffee.'],
      ['or', 'hoặc', 'Do you want tea or coffee?'],
      ['so', 'vì vậy', 'I am tired, so I go to bed.'],
      ['because', 'bởi vì', 'I study because I want to improve.'],
      ['want', 'muốn', 'I want tea.'],
    ],
    patterns: [
      ['A and B', 'thêm ý cùng chiều', ['I like tea and milk.', 'She reads and writes.']],
      ['A, but B', 'nói ý đối lập', ['I like tea, but I don’t like coffee.', 'It is small, but it is good.']],
      ['A or B', 'đưa ra lựa chọn', ['Tea or coffee?', 'You can call or text me.']],
      ['A, so B / A because B', 'kết quả hoặc lý do', ['I am tired, so I sleep.', 'I study because I need English.']],
    ],
    sentences: [
      ['I like tea, but I do not like coffee.', 'Tôi thích trà, nhưng tôi không thích cà phê.'],
      ['I study English and listen every day.', 'Tôi học tiếng Anh và nghe mỗi ngày.'],
      ['Do you want tea or coffee?', 'Bạn muốn trà hay cà phê?'],
      ['I am tired, so I go to bed.', 'Tôi mệt, vì vậy tôi đi ngủ.'],
      ['I study because I want to improve.', 'Tôi học vì tôi muốn tiến bộ.'],
    ],
    fills: [
      ['Điền từ: I like tea, ___ I do not like coffee.', 'I like tea, but I do not like coffee.', 'but'],
      ['Điền từ: I am tired, ___ I go to bed.', 'I am tired, so I go to bed.', 'so'],
      ['Điền từ: I study ___ I want to improve.', 'I study because I want to improve.', 'because'],
    ],
    orders: [
      ['Sắp xếp câu: tea / or / coffee / Do you want', 'Do you want tea or coffee?'],
      ['Sắp xếp câu: I / am / tired / so / I / sleep', 'I am tired, so I sleep.'],
    ],
    choices: [
      ['Chọn liên từ đối lập.', 'but', ['and', 'but', 'or', 'so']],
      ['Chọn liên từ chỉ lý do.', 'because', ['because', 'and', 'or', 'but']],
      ['Câu nào đúng?', 'I like tea, but I do not like coffee.', ['I like tea, but I do not like coffee.', 'I like tea but coffee not.', 'I but like tea.', 'Because I so tea.']],
    ],
    finalPrompt: 'Viết hoặc nói 5 câu, mỗi câu dùng một liên từ: and, but, or, so, because.',
  },
  24: {
    title: 'Liên từ chỉ thời gian',
    goal: 'Hôm nay bạn học nói thời điểm hành động xảy ra bằng before, after, when, while và until trong các câu rất ngắn.',
    grammarTitle: 'Before, after, when, while, until',
    grammar: 'Liên từ chỉ thời gian giúp nối hành động với mốc thời gian. Before là trước khi, after là sau khi, when là khi, while là trong lúc, until là cho đến khi. Người mới nên giữ mỗi vế câu đơn giản.',
    vocabulary: [
      ['before', 'trước khi', 'I study before I sleep.'],
      ['after', 'sau khi', 'I brush my teeth after I eat.'],
      ['when', 'khi', 'Call me when you arrive.'],
      ['while', 'trong khi', 'I listen while I walk.'],
      ['until', 'cho đến khi', 'I wait until you come.'],
      ['arrive', 'đến nơi', 'Tell me when you arrive.'],
    ],
    patterns: [
      ['A before B', 'A xảy ra trước B', ['I study before I sleep.', 'Wash your hands before you eat.']],
      ['A after B', 'A xảy ra sau B', ['I rest after I work.', 'I call you after class.']],
      ['A when B', 'A xảy ra khi B xảy ra', ['Call me when you arrive.', 'I smile when I see you.']],
      ['A while B / A until B', 'trong lúc hoặc cho đến khi', ['I listen while I walk.', 'I wait until you come.']],
    ],
    sentences: [
      ['I study before I sleep.', 'Tôi học trước khi ngủ.'],
      ['I eat after I wash my hands.', 'Tôi ăn sau khi rửa tay.'],
      ['Call me when you arrive.', 'Gọi tôi khi bạn đến nơi.'],
      ['I listen while I walk.', 'Tôi nghe trong khi đi bộ.'],
      ['I wait until you come.', 'Tôi đợi cho đến khi bạn đến.'],
    ],
    fills: [
      ['Điền từ: I study ___ I sleep.', 'I study before I sleep.', 'before'],
      ['Điền từ: Call me ___ you arrive.', 'Call me when you arrive.', 'when'],
      ['Điền từ: I wait ___ you come.', 'I wait until you come.', 'until'],
    ],
    orders: [
      ['Sắp xếp câu: I / study / before / I / sleep', 'I study before I sleep.'],
      ['Sắp xếp câu: Call / me / when / you / arrive', 'Call me when you arrive.'],
    ],
    choices: [
      ['Từ nào nghĩa là “trước khi”?', 'before', ['before', 'after', 'while', 'until']],
      ['Câu nào đúng?', 'I study before I sleep.', ['I study before I sleep.', 'I before study sleep.', 'Before I study sleep.', 'I sleep study before.']],
      ['Từ nào nghĩa là “cho đến khi”?', 'until', ['until', 'when', 'after', 'before']],
    ],
    finalPrompt: 'Tự nói lịch một buổi tối của bạn bằng before, after và when.',
  },
  25: {
    title: 'Liên từ chỉ sự đối lập',
    goal: 'Hôm nay bạn học cách nói hai ý trái nhau bằng but, although, however và even though mà vẫn giữ câu dễ hiểu.',
    grammarTitle: 'But, although, however, even though',
    grammar: 'But nối hai ý đối lập trong cùng câu. Although/even though đặt trước một vế câu để nói “mặc dù”. However thường đứng đầu câu mới để chuyển ý. Với người mới, ưu tiên but và although trong câu ngắn.',
    vocabulary: [
      ['but', 'nhưng', 'It is small, but it is useful.'],
      ['although', 'mặc dù', 'Although it is raining, I go to school.'],
      ['however', 'tuy nhiên', 'It is hard. However, I can try.'],
      ['even though', 'mặc dù', 'Even though I am tired, I study.'],
      ['rain', 'mưa', 'It is raining.'],
      ['try', 'cố gắng', 'I can try.'],
    ],
    patterns: [
      ['A, but B', 'hai ý trái nhau', ['I am tired, but I study.', 'It is cheap, but it is good.']],
      ['Although A, B', 'mặc dù A, B vẫn xảy ra', ['Although it is raining, I go to school.', 'Although I am busy, I call you.']],
      ['Even though A, B', 'nhấn mạnh “mặc dù”', ['Even though it is late, I practice.', 'Even though I am tired, I read.']],
      ['A. However, B.', 'chuyển ý trong câu mới', ['It is difficult. However, I can try.', 'I am busy. However, I can help.']],
    ],
    sentences: [
      ['Although it is raining, I go to school.', 'Mặc dù trời đang mưa, tôi đi học.'],
      ['I am tired, but I study English.', 'Tôi mệt, nhưng tôi học tiếng Anh.'],
      ['It is hard. However, I can try.', 'Nó khó. Tuy nhiên, tôi có thể thử.'],
      ['Even though I am busy, I call you.', 'Mặc dù tôi bận, tôi gọi bạn.'],
      ['The bag is small, but it is useful.', 'Cái túi nhỏ, nhưng nó hữu ích.'],
    ],
    fills: [
      ['Điền từ: I am tired, ___ I study English.', 'I am tired, but I study English.', 'but'],
      ['Điền từ: ___ it is raining, I go to school.', 'Although it is raining, I go to school.', 'Although'],
      ['Điền từ: It is hard. ___, I can try.', 'It is hard. However, I can try.', 'However'],
    ],
    orders: [
      ['Sắp xếp câu: I / am / tired / but / I / study', 'I am tired, but I study.'],
      ['Sắp xếp câu: Although / it / is / raining / I / go / to / school', 'Although it is raining, I go to school.'],
    ],
    choices: [
      ['Từ nào nghĩa là “mặc dù”?', 'although', ['although', 'because', 'so', 'and']],
      ['Câu nào đúng?', 'Although it is raining, I go to school.', ['Although it is raining, I go to school.', 'Although raining school go.', 'I although raining go.', 'It is although school.']],
      ['Từ nào thường mở đầu câu mới để chuyển ý?', 'However', ['However', 'And', 'Or', 'Because']],
    ],
    finalPrompt: 'Nói 3 câu về việc bạn vẫn học dù mệt, bận hoặc bài khó.',
  },
  26: {
    title: 'Câu điều kiện loại 1',
    goal: 'Hôm nay bạn học cách nói nếu điều này xảy ra, điều kia có thể xảy ra.',
    grammarTitle: 'If + hiện tại đơn, will + động từ',
    grammar: 'Câu điều kiện loại 1 dùng cho tình huống có thể xảy ra ở hiện tại hoặc tương lai. Mệnh đề if dùng hiện tại đơn, mệnh đề kết quả thường dùng will + động từ nguyên mẫu.',
    vocabulary: [
      ['if', 'nếu', 'If it rains, I will stay home.'],
      ['will', 'sẽ', 'I will call you.'],
      ['rain', 'mưa', 'If it rains, we will wait.'],
      ['stay home', 'ở nhà', 'I will stay home.'],
      ['call', 'gọi điện', 'I will call you.'],
      ['pass', 'vượt qua', 'If I study, I will pass.'],
    ],
    patterns: [
      ['If + present simple, will + verb', 'nếu A xảy ra, B sẽ xảy ra', ['If it rains, I will stay home.', 'If I study, I will pass.']],
      ['Will + verb + if + present simple', 'đảo vị trí hai vế', ['I will call you if I arrive early.', 'We will go if it is sunny.']],
      ['If + subject + verb, subject + can + verb', 'kết quả có thể xảy ra', ['If you need help, I can help.', 'If we finish, we can rest.']],
    ],
    sentences: [
      ['If it rains, I will stay home.', 'Nếu trời mưa, tôi sẽ ở nhà.'],
      ['If I study, I will pass the test.', 'Nếu tôi học, tôi sẽ vượt qua bài kiểm tra.'],
      ['I will call you if I arrive early.', 'Tôi sẽ gọi bạn nếu tôi đến sớm.'],
      ['If you need help, I can help you.', 'Nếu bạn cần giúp, tôi có thể giúp bạn.'],
      ['We will go out if it is sunny.', 'Chúng ta sẽ ra ngoài nếu trời nắng.'],
    ],
    fills: [
      ['Điền từ: If it rains, I ___ stay home.', 'If it rains, I will stay home.', 'will'],
      ['Điền từ: ___ I study, I will pass.', 'If I study, I will pass.', 'If'],
      ['Điền từ: I will call you if I ___ early.', 'I will call you if I arrive early.', 'arrive'],
    ],
    orders: [
      ['Sắp xếp câu: If / it / rains / I / will / stay / home', 'If it rains, I will stay home.'],
      ['Sắp xếp câu: I / will / call / you / if / I / arrive / early', 'I will call you if I arrive early.'],
    ],
    choices: [
      ['Cấu trúc điều kiện loại 1 đúng là gì?', 'If + present simple, will + verb', ['If + present simple, will + verb', 'If + past, would + verb', 'If + had, would have', 'If + will, will']],
      ['Câu nào đúng?', 'If it rains, I will stay home.', ['If it rains, I will stay home.', 'If it will rain, I stay home.', 'If rains, I stayed home.', 'If rain, I would home.']],
      ['Trong mệnh đề if loại 1, thường dùng thì nào?', 'present simple', ['present simple', 'past perfect', 'future perfect', 'past continuous']],
    ],
    finalPrompt: 'Tạo 4 câu điều kiện loại 1 về thời tiết, học tập, sức khỏe và kế hoạch.',
  },
  27: {
    title: 'Câu điều kiện loại 2',
    goal: 'Hôm nay bạn học nói một điều tưởng tượng ở hiện tại bằng If + quá khứ đơn, would + động từ.',
    grammarTitle: 'If + past simple, would + verb',
    grammar: 'Câu điều kiện loại 2 dùng cho tình huống tưởng tượng, khó xảy ra hoặc không thật ở hiện tại. Dùng if + quá khứ đơn và would + động từ nguyên mẫu. Với be, “were” thường dùng cho mọi chủ ngữ trong văn phong chuẩn.',
    vocabulary: [
      ['would', 'sẽ (trong tưởng tượng)', 'I would practice English.'],
      ['had more time', 'có nhiều thời gian hơn', 'If I had more time, I would practice English.'],
      ['were', 'là/ở trong giả định', 'If I were free, I would help.'],
      ['practice', 'luyện tập', 'I would practice every day.'],
      ['travel', 'du lịch', 'I would travel more.'],
      ['free', 'rảnh', 'If I were free, I would call you.'],
    ],
    patterns: [
      ['If + past simple, would + verb', 'nếu điều tưởng tượng xảy ra, tôi sẽ...', ['If I had more time, I would practice English.', 'If she knew, she would help.']],
      ['If I were..., I would...', 'giả định về bản thân', ['If I were free, I would call you.', 'If I were rich, I would travel.']],
      ['Would + verb + if + past simple', 'đảo vị trí hai vế', ['I would help if I had time.', 'He would smile if he knew.']],
    ],
    sentences: [
      ['If I had more time, I would practice English.', 'Nếu tôi có nhiều thời gian hơn, tôi sẽ luyện tiếng Anh.'],
      ['If I were free, I would call you.', 'Nếu tôi rảnh, tôi sẽ gọi bạn.'],
      ['I would travel more if I had money.', 'Tôi sẽ đi du lịch nhiều hơn nếu tôi có tiền.'],
      ['If she knew the answer, she would tell us.', 'Nếu cô ấy biết đáp án, cô ấy sẽ nói cho chúng ta.'],
      ['If we lived near school, we would walk.', 'Nếu chúng tôi sống gần trường, chúng tôi sẽ đi bộ.'],
    ],
    fills: [
      ['Điền từ: If I had more time, I ___ practice English.', 'If I had more time, I would practice English.', 'would'],
      ['Điền từ: If I ___ free, I would call you.', 'If I were free, I would call you.', 'were'],
      ['Điền từ: I would help if I ___ time.', 'I would help if I had time.', 'had'],
    ],
    orders: [
      ['Sắp xếp câu: If / I / had / more / time / I / would / practice / English', 'If I had more time, I would practice English.'],
      ['Sắp xếp câu: If / I / were / free / I / would / call / you', 'If I were free, I would call you.'],
    ],
    choices: [
      ['Cấu trúc điều kiện loại 2 đúng là gì?', 'If + past simple, would + verb', ['If + past simple, would + verb', 'If + present, will + verb', 'If + had + V3, would have', 'If + will, would']],
      ['Câu nào đúng?', 'If I had more time, I would practice English.', ['If I had more time, I would practice English.', 'If I have more time, I would practiced.', 'If I will have time, I practice.', 'If I had time, I will practiced.']],
      ['Loại 2 thường nói về điều gì?', 'tưởng tượng ở hiện tại', ['tưởng tượng ở hiện tại', 'sự thật luôn đúng', 'quá khứ đã hoàn thành', 'mệnh lệnh trực tiếp']],
    ],
    finalPrompt: 'Nói 4 câu tưởng tượng với If I had..., If I were..., I would...',
  },
  28: {
    title: 'Câu điều kiện loại 3',
    goal: 'Hôm nay bạn học nói điều đáng tiếc trong quá khứ bằng If + had + V3, would have + V3.',
    grammarTitle: 'If + had + past participle, would have + past participle',
    grammar: 'Câu điều kiện loại 3 dùng để nói một điều không xảy ra trong quá khứ và kết quả tưởng tượng của nó. Đây là mẫu nâng hơn, nhưng người mới chỉ cần nhớ vài câu giao tiếp quen thuộc như “If I had known, I would have called you.”',
    vocabulary: [
      ['had known', 'đã biết', 'If I had known, I would have called you.'],
      ['would have called', 'đã có thể/sẽ gọi', 'I would have called you.'],
      ['missed', 'đã lỡ', 'I missed the bus.'],
      ['left earlier', 'rời đi sớm hơn', 'If I had left earlier, I would have arrived on time.'],
      ['arrived on time', 'đến đúng giờ', 'I would have arrived on time.'],
      ['helped', 'đã giúp', 'I would have helped you.'],
    ],
    patterns: [
      ['If + had + V3, would have + V3', 'nếu đã..., thì đã...', ['If I had known, I would have called you.', 'If we had studied, we would have passed.']],
      ['Would have + V3 + if + had + V3', 'đảo vị trí hai vế', ['I would have helped if I had known.', 'She would have come if she had had time.']],
      ['If I had left earlier...', 'nói tiếc nuối về thời gian', ['If I had left earlier, I would have arrived on time.', 'If I had slept earlier, I would have felt better.']],
    ],
    sentences: [
      ['If I had known, I would have called you.', 'Nếu tôi đã biết, tôi đã gọi bạn.'],
      ['If I had left earlier, I would have arrived on time.', 'Nếu tôi rời đi sớm hơn, tôi đã đến đúng giờ.'],
      ['I would have helped you if I had known.', 'Tôi đã giúp bạn nếu tôi đã biết.'],
      ['If we had studied, we would have passed the test.', 'Nếu chúng tôi đã học, chúng tôi đã qua bài kiểm tra.'],
      ['If she had had time, she would have come.', 'Nếu cô ấy đã có thời gian, cô ấy đã đến.'],
    ],
    fills: [
      ['Điền từ: If I had known, I ___ have called you.', 'If I had known, I would have called you.', 'would'],
      ['Điền từ: If I ___ left earlier, I would have arrived on time.', 'If I had left earlier, I would have arrived on time.', 'had'],
      ['Điền từ: I would have helped you if I had ___.', 'I would have helped you if I had known.', 'known'],
    ],
    orders: [
      ['Sắp xếp câu: If / I / had / known / I / would / have / called / you', 'If I had known, I would have called you.'],
      ['Sắp xếp câu: I / would / have / helped / you / if / I / had / known', 'I would have helped you if I had known.'],
    ],
    choices: [
      ['Cấu trúc điều kiện loại 3 đúng là gì?', 'If + had + V3, would have + V3', ['If + had + V3, would have + V3', 'If + present, will + verb', 'If + past, would + verb', 'If + verb, can + verb']],
      ['Câu nào đúng?', 'If I had known, I would have called you.', ['If I had known, I would have called you.', 'If I knew, I will call you.', 'If I had know, I would called.', 'If I know, I would have call.']],
      ['Loại 3 thường nói về điều gì?', 'điều không xảy ra trong quá khứ', ['điều không xảy ra trong quá khứ', 'thói quen hằng ngày', 'mệnh lệnh', 'lựa chọn hiện tại']],
    ],
    finalPrompt: 'Nói 3 câu tiếc nuối đơn giản với If I had known/left/studied...',
  },
};

export const foundation48Stage5LazyDeepLessons: Record<number, Foundation48DeepLesson> = Object.fromEntries(
  Object.entries(stage5Seeds).map(([day, seed]) => [Number(day), buildDeepLesson(Number(day), seed)]),
) as Record<number, Foundation48DeepLesson>;

export function getFoundation48Stage5LazyDeepLesson(dayNumber: number) {
  return foundation48Stage5LazyDeepLessons[dayNumber];
}