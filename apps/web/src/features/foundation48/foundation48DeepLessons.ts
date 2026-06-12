import type { Foundation48ChallengeType } from './foundation48Types';

export type Foundation48DeepVocabularyItem = {
  term: string;
  meaningVi: string;
  example: string;
};

export type Foundation48DeepPattern = {
  pattern: string;
  meaningVi: string;
  examples: string[];
};

export type Foundation48DeepListeningItem = {
  id: string;
  text: string;
  meaningVi: string;
  question: string;
  options: string[];
  answer: string;
};

export type Foundation48DeepSpeakingItem = {
  id: string;
  text: string;
  meaningVi: string;
  focus: string;
};

export type Foundation48DeepQuizItem = {
  id: string;
  type: Foundation48ChallengeType;
  prompt: string;
  target: string;
  answer: string;
  options?: string[];
  tokens?: string[];
  hint?: string;
  explanation?: string;
};

export type Foundation48DeepLesson = {
  readiness: 'complete' | 'future';
  learnerTitle: string;
  goalVi: string;
  vocabulary: Foundation48DeepVocabularyItem[];
  patterns: Foundation48DeepPattern[];
  grammarPoint: {
    title: string;
    explanationVi: string;
    examples: string[];
  };
  listening: Foundation48DeepListeningItem[];
  speaking: Foundation48DeepSpeakingItem[];
  quiz: Foundation48DeepQuizItem[];
  summary: string[];
  review: {
    remember: string[];
    next: string;
  };
};

type DaySeed = {
  title: string;
  goal: string;
  grammarTitle: string;
  grammar: string;
  vocabulary: Array<[string, string, string]>;
  patterns: Array<[string, string, string[]]>;
  sentences: Array<[string, string]>;
  fills: Array<[string, string, string]>;
  orders: Array<[string, string]>;
  choices: Array<[string, string, string[]]>;
  finalPrompt: string;
};

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, 4);
}

function shuffleTokens(sentence: string) {
  const words = sentence.replace(/[.!?]/g, '').split(/\s+/).filter(Boolean);
  if (words.length <= 2) return words;
  return [...words.slice(1), words[0]];
}

function buildDeepLesson(dayNumber: number, seed: DaySeed): Foundation48DeepLesson {
  const sentenceBank = seed.sentences.slice(0, 5);
  return {
    readiness: 'complete',
    learnerTitle: seed.title,
    goalVi: seed.goal,
    vocabulary: seed.vocabulary.map(([term, meaningVi, example]) => ({ term, meaningVi, example })),
    patterns: seed.patterns.map(([pattern, meaningVi, examples]) => ({ pattern, meaningVi, examples })),
    grammarPoint: {
      title: seed.grammarTitle,
      explanationVi: seed.grammar,
      examples: seed.sentences.slice(0, 3).map(([text]) => text),
    },
    listening: sentenceBank.map(([text, meaningVi], index) => ({
      id: `day-${dayNumber}-listen-${index + 1}`,
      text,
      meaningVi,
      question: 'Bạn vừa nghe câu nào?',
      options: uniqueOptions([text, sentenceBank[(index + 1) % sentenceBank.length]?.[0] ?? text, sentenceBank[(index + 2) % sentenceBank.length]?.[0] ?? text, text.replace(/\b(am|is|are|do|does|did)\b/i, '___')]),
      answer: text,
    })),
    speaking: sentenceBank.map(([text, meaningVi], index) => ({
      id: `day-${dayNumber}-speak-${index + 1}`,
      text,
      meaningVi,
      focus: index % 2 === 0 ? 'Nói chậm, rõ chủ ngữ và động từ.' : 'Giữ nhịp đều, không nuốt âm cuối.',
    })),
    quiz: [
      ...seed.choices.slice(0, 3).map(([prompt, answer, options], index) => ({
        id: `day-${dayNumber}-choice-${index + 1}`,
        type: 'multiple-choice' as const,
        prompt,
        target: answer,
        answer,
        options: uniqueOptions([answer, ...options]),
        hint: 'Nhìn chủ ngữ và động từ chính trước.',
        explanation: seed.grammar,
      })),
      ...seed.fills.slice(0, 3).map(([prompt, answer, hint], index) => ({
        id: `day-${dayNumber}-fill-${index + 1}`,
        type: 'fill-blank' as const,
        prompt,
        target: prompt,
        answer,
        hint,
        explanation: `Đáp án đúng là “${answer}” vì ${hint.toLowerCase()}`,
      })),
      ...seed.orders.slice(0, 2).map(([meaningVi, answer], index) => ({
        id: `day-${dayNumber}-order-${index + 1}`,
        type: 'sentence-order' as const,
        prompt: meaningVi,
        target: answer,
        answer,
        tokens: shuffleTokens(answer),
        hint: 'Bắt đầu bằng chủ ngữ, sau đó đến động từ/trợ động từ.',
        explanation: `Câu đầy đủ: ${answer}`,
      })),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Nghe mẫu rồi nói lại một câu thật rõ.',
        explanation: 'Câu nói lại được lưu vào vòng ôn nếu bạn thấy còn yếu.',
      },
    ].slice(0, 9),
    summary: [
      seed.goal,
      `Điểm ngữ pháp: ${seed.grammarTitle}.`,
      `Từ/cụm chính: ${seed.vocabulary.slice(0, 5).map(([term]) => term).join(', ')}.`,
      'Hoàn thành nghe, nói, điền từ, xếp câu và mini test để Poo lưu tiến độ.',
    ],
    review: {
      remember: seed.patterns.slice(0, 3).map(([pattern]) => pattern),
      next: 'Ngày tiếp theo sẽ dùng lại câu hôm nay trong tình huống mới để tăng phản xạ.',
    },
  };
}

export { buildDeepLesson };
export type { DaySeed };

const seeds: Record<number, DaySeed> = {
  1: {
    title: 'Tôi là ai? — nói câu khẳng định/phủ định với to be',
    goal: 'Biết nói “tôi là…”, “bạn là…”, “cô ấy là…” và thêm not để phủ định.',
    grammarTitle: 'am / is / are đi với từng chủ ngữ',
    grammar: 'I đi với am; you/we/they đi với are; he/she/it đi với is. Khi phủ định, thêm not sau am/is/are.',
    vocabulary: [['I', 'tôi', 'I am a student.'], ['you', 'bạn', 'You are my friend.'], ['he', 'anh ấy', 'He is tall.'], ['she', 'cô ấy', 'She is kind.'], ['it', 'nó', 'It is small.'], ['we', 'chúng tôi', 'We are happy.'], ['they', 'họ', 'They are teachers.'], ['student', 'học sinh', 'I am a student.'], ['teacher', 'giáo viên', 'She is a teacher.'], ['happy', 'vui', 'They are happy.']],
    patterns: [['I am + noun/adjective', 'Tôi là/đang...', ['I am a student.', 'I am happy.']], ['You/We/They are + ...', 'Bạn/chúng ta/họ là...', ['You are my friend.', 'They are teachers.']], ['He/She/It is + ...', 'Anh ấy/cô ấy/nó là...', ['She is kind.', 'It is small.']], ['Subject + am/is/are + not', 'Câu phủ định với to be', ['I am not tired.', 'He is not tall.']]],
    sentences: [['I am a student.', 'Tôi là học sinh.'], ['She is happy.', 'Cô ấy vui.'], ['They are teachers.', 'Họ là giáo viên.'], ['He is not tall.', 'Anh ấy không cao.'], ['We are not sad.', 'Chúng tôi không buồn.']],
    fills: [['I ___ a student.', 'am', 'I luôn đi với am.'], ['She ___ happy.', 'is', 'She đi với is.'], ['They ___ teachers.', 'are', 'They đi với are.']],
    orders: [['Tôi là học sinh.', 'I am a student.'], ['Cô ấy không cao.', 'She is not tall.']],
    choices: [['Chọn câu đúng cho “Tôi là học sinh.”', 'I am a student.', ['I is a student.', 'I are a student.', 'I am student not.']], ['Chọn câu phủ định đúng.', 'He is not tall.', ['He not is tall.', 'He are not tall.', 'He am not tall.']], ['từ vựng từ nào?', 'are', ['am', 'is', 'not']]],
    finalPrompt: 'Nói lại một câu giới thiệu bản thân bằng to be.',
  },
  2: {
    title: 'Bạn có phải...? — hỏi Yes/No với to be',
    goal: 'Biết đưa am/is/are lên đầu câu để hỏi và trả lời Yes/No ngắn.',
    grammarTitle: 'Đảo am/is/are lên trước chủ ngữ để hỏi',
    grammar: 'Câu hỏi to be dùng Am/Is/Are ở đầu câu. Trả lời ngắn: Yes, I am. / No, she is not.',
    vocabulary: [['are you', 'bạn có phải không', 'Are you a student?'], ['is she', 'cô ấy có phải không', 'Is she your teacher?'], ['is he', 'anh ấy có phải không', 'Is he your brother?'], ['yes', 'vâng/có', 'Yes, I am.'], ['no', 'không', 'No, she is not.'], ['friend', 'bạn', 'Are you my friend?'], ['book', 'quyển sách', 'Is it your book?'], ['brother', 'anh/em trai', 'Is he your brother?'], ['sister', 'chị/em gái', 'Is she your sister?']],
    patterns: [['Are you + ...?', 'Bạn có phải/đang...? ', ['Are you a student?', 'Are you happy?']], ['Is he/she/it + ...?', 'Anh ấy/cô ấy/nó có phải...? ', ['Is she your teacher?', 'Is it your book?']], ['Yes/No + subject + be', 'Trả lời ngắn', ['Yes, I am.', 'No, he is not.']]],
    sentences: [['Are you a student?', 'Bạn có phải học sinh không?'], ['Yes, I am.', 'Vâng, đúng vậy.'], ['Is she your teacher?', 'Cô ấy có phải giáo viên của bạn không?'], ['No, she is not.', 'Không, cô ấy không phải.'], ['Is it your book?', 'Nó có phải sách của bạn không?']],
    fills: [['___ you a student?', 'Are', 'Câu hỏi với you dùng Are ở đầu.'], ['___ she your teacher?', 'Is', 'She đi với Is.'], ['No, he ___ not.', 'is', 'He đi với is.']],
    orders: [['Bạn có phải học sinh không?', 'Are you a student?'], ['Không, cô ấy không phải.', 'No, she is not.']],
    choices: [['Câu hỏi đúng là gì?', 'Are you a student?', ['You are a student?', 'Is you a student?', 'Am you a student?']], ['Trả lời ngắn cho “Is he tall?”', 'Yes, he is.', ['Yes, he are.', 'Yes, he am.', 'Yes, is he.']], ['Is it your book? nghĩa là gì?', 'Nó có phải sách của bạn không?', ['Bạn là quyển sách à?', 'Sách ở đâu?', 'Bạn đọc sách không?']]],
    finalPrompt: 'Nói lại một câu hỏi Yes/No với to be.',
  },
  3: {
    title: 'Ai và cái gì? — hỏi Who / What với to be',
    goal: 'Dùng Who để hỏi người, What để hỏi tên/đồ vật/sự việc, rồi trả lời bằng câu to be thật ngắn và rõ.',
    grammarTitle: 'Who/What + is/are + subject?',
    grammar: 'Who hỏi người; What hỏi tên, nghề, đồ vật hoặc bản chất sự việc. Với một người/vật dùng Who/What is; với nhiều người/vật dùng Who/What are. Khi trả lời, dùngữ pháp: He/She/It/They + is/are.',
    vocabulary: [['who', 'ai', 'Who is she?'], ['what', 'cái gì/là gì', 'What is this?'], ['name', 'tên', 'What is your name?'], ['this', 'cái này', 'What is this?'], ['that', 'cái kia', 'What is that?'], ['these', 'những cái này', 'What are these?'], ['those', 'những cái kia', 'What are those?'], ['father', 'bố', 'Who is he?'], ['mother', 'mẹ', 'Who is she?'], ['sister', 'chị/em gái', 'She is my sister.'], ['teacher', 'giáo viên', 'Who is your teacher?'], ['apple', 'quả táo', 'It is an apple.']],
    patterns: [['Who is + one person?', 'Hỏi một người là ai', ['Who is she?', 'Who is your teacher?', 'Who is that boy?']], ['Who are + many people?', 'Hỏi nhiều người là ai', ['Who are they?', 'Who are these students?']], ['What is + one thing/name?', 'Hỏi một đồ vật, tên hoặc bản chất', ['What is this?', 'What is your name?', 'What is that?']], ['What are + plural things?', 'Hỏi nhiều đồ vật', ['What are these?', 'What are those?']]],
    sentences: [['Who is she?', 'Cô ấy là ai?'], ['She is my sister.', 'Cô ấy là chị/em gái tôi.'], ['What is this?', 'Đây là cái gì?'], ['It is a book.', 'Nó là một quyển sách.'], ['Who are they?', 'Họ là ai?'], ['They are my teachers.', 'Họ là giáo viên của tôi.'], ['What are these?', 'Những cái này là gì?'], ['They are apples.', 'Chúng là những quả táo.']],
    fills: [['___ is she?', 'Who', 'Hỏi người dùng Who.'], ['___ is this?', 'What', 'Hỏi đồ vật dùng What.'], ['What ___ your name?', 'is', 'Name là số ít nên dùng is.'], ['Who ___ they?', 'are', 'They là số nhiều nên dùng are.'], ['What ___ these?', 'are', 'These là số nhiều nên dùng are.']],
    orders: [['Cô ấy là ai?', 'Who is she?'], ['Đây là cái gì?', 'What is this?'], ['Họ là ai?', 'Who are they?'], ['Những cái này là gì?', 'What are these?']],
    choices: [['Hỏi “Cô ấy là ai?”', 'Who is she?', ['What is she?', 'Who are she?', 'What are she?']], ['Hỏi “Đây là cái gì?”', 'What is this?', ['Who is this?', 'What are this?', 'This is what?']], ['Who dùng để hỏi gì?', 'người', ['đồ vật', 'thời gian', 'địa điểm']], ['These đi với câu hỏi nào?', 'What are these?', ['What is these?', 'Who is these?', 'What am these?']], ['Trả lời đúng cho “Who are they?”', 'They are my friends.', ['She is my friend.', 'It is a friend.', 'They is my friends.']]],
    finalPrompt: 'Nói một mini hội thoại 4 câu: hỏi Who/What rồi tự trả lời.',
  },
  4: {
    title: 'Ở đâu, khi nào? — hỏi Where / When với to be',
    goal: 'Hỏi và trả lời địa điểm/thời gian bằng Where, When, at/on/in thật chắc.',
    grammarTitle: 'Where/When + is/are + subject?',
    grammar: 'Where hỏi “ở đâu”, When hỏi “khi nào”. Với to be, dùng Where/When + is/are + chủ ngữ. Trả lời địa điểm thường dùng at/in/on; trả lời ngày dùng on, tháng dùng in, giờ dùng at.',
    vocabulary: [['where', 'ở đâu', 'Where is your book?'], ['when', 'khi nào', 'When is your class?'], ['school', 'trường học', 'They are at school.'], ['home', 'nhà', 'We are at home.'], ['table', 'cái bàn', 'It is on the table.'], ['bag', 'cặp/túi', 'My pen is in the bag.'], ['Monday', 'thứ Hai', 'My test is on Monday.'], ['birthday', 'sinh nhật', 'When is your birthday?'], ['class', 'lớp học', 'My English class is at seven.'], ['today', 'hôm nay', 'The class is today.'], ['in', 'ở trong', 'The pen is in the bag.'], ['on', 'ở trên/vào ngày', 'It is on the table.']],
    patterns: [['Where is/are + subject?', 'Hỏi địa điểm', ['Where is your book?', 'Where are they?', 'Where is my pen?']], ['When is/are + subject?', 'Hỏi thời gian', ['When is your birthday?', 'When are your classes?', 'When is the test?']], ['Subject + is/are + place/time', 'Trả lời địa điểm/thời gian', ['It is on the table.', 'They are at school.', 'My class is on Monday.']], ['at/in/on + place/time', 'Giới từ cơ bản', ['at school', 'in the bag', 'on Monday']]],
    sentences: [['Where is your book?', 'Sách của bạn ở đâu?'], ['It is on the table.', 'Nó ở trên bàn.'], ['Where are they?', 'Họ đang ở đâu?'], ['They are at school.', 'Họ đang ở trường.'], ['When is your English class?', 'Khi nào là lớp tiếng Anh của bạn?'], ['It is on Monday.', 'Nó vào thứ Hai.'], ['Where is my pen?', 'Bút của tôi ở đâu?'], ['It is in the bag.', 'Nó ở trong cặp.']],
    fills: [['Where ___ your pen?', 'is', 'Pen là số ít nên dùng is.'], ['When ___ your classes?', 'are', 'Classes là số nhiều nên dùng are.'], ['They ___ at home.', 'are', 'They đi với are.'], ['It is ___ the table.', 'on', 'Trên bàn dùng on the table.'], ['My class is ___ Monday.', 'on', 'Ngày trong tuần dùng on.']],
    orders: [['Sách của bạn ở đâu?', 'Where is your book?'], ['Họ đang ở trường.', 'They are at school.'], ['Lớp tiếng Anh của bạn khi nào?', 'When is your English class?'], ['Bút ở trong cặp.', 'The pen is in the bag.']],
    choices: [['Hỏi địa điểm dùng từ nào?', 'Where', ['When', 'Who', 'What']], ['Hỏi thời gian dùng từ nào?', 'When', ['Where', 'Who', 'What']], ['Câu đúng là gì?', 'Where is your pen?', ['Where are your pen?', 'Where your pen is?', 'When is your pen?']], ['“ở trường” nói là gì?', 'at school', ['on school', 'in Monday', 'at Monday']], ['“vào thứ Hai” nói là gì?', 'on Monday', ['in Monday', 'at Monday', 'on home']]],
    finalPrompt: 'Nói 2 câu hỏi Where và 2 câu hỏi When về đồ vật/lớp học của bạn.',
  },
  5: {
    title: 'Tôi làm mỗi ngày — động từ thường hiện tại',
    goal: 'Nói thói quen đơn giản bằng động từ thường, phân biệt I/you/we/they với he/she/it thêm s/es.',
    grammarTitle: 'Hiện tại đơn khẳng định với động từ thường',
    grammar: 'I/you/we/they dùng động từ nguyên mẫu. He/she/it thường thêm s hoặc es ở động từ. Dùng every day/usually/often để nói thói quen lặp lại.',
    vocabulary: [['study', 'học', 'I study English.'], ['read', 'đọc', 'She reads books.'], ['play', 'chơi', 'They play football.'], ['work', 'làm việc', 'My father works.'], ['go', 'đi', 'He goes to school.'], ['like', 'thích', 'I like apples.'], ['eat', 'ăn', 'I eat breakfast.'], ['drink', 'uống', 'She drinks milk.'], ['live', 'sống', 'They live in Ha Noi.'], ['every day', 'mỗi ngày', 'We study every day.'], ['usually', 'thường xuyên', 'She usually reads.'], ['often', 'thường hay', 'I often listen.']],
    patterns: [['I/You/We/They + verb', 'Nói hành động với chủ ngữ thường', ['I study English.', 'They play football.', 'We live here.']], ['He/She/It + verb-s/es', 'Thêm s/es với he/she/it', ['She reads books.', 'He goes to school.', 'My father works.']], ['Subject + usually/often/every day + verb', 'Nói thói quen', ['I usually eat breakfast.', 'She often reads books.', 'We study every day.']], ['go/do/watch + es with he/she/it', 'Một số động từ thêm es', ['He goes to school.', 'She watches TV.']]],
    sentences: [['I study Englishọc tiếng Anh.'], ['She reads books.', 'Cô ấy đọc sách.'], ['They play football.', 'Họ chơi bóng đá.'], ['He goes to school.', 'Anh ấy đi học.'], ['We study every day.', 'Chúng tôi học mỗi ngày.'], ['My father works at home.', 'Bố tôi làm việc ở nhà.'], ['She drinks milk every morning.', 'Cô ấy uống sữa mỗi sáng.'], ['I often listen to music.', 'Tôi thường nghe nhạc.']],
    fills: [['He ___ to school.', 'goes', 'He nên động từ go thêm es.'], ['I ___ English.', 'study', 'I dùng động từ nguyên mẫu.'], ['She ___ books.', 'reads', 'She nên read thêm s.'], ['They ___ football.', 'play', 'They dùng động từ nguyên mẫu.'], ['My mother ___ at home.', 'works', 'My mother tương đương she nên thêm s.']],
    orders: [['Tôi học tiếng Anh.', 'I study English.'], ['Cô ấy đọc sách.', 'She reads books.'], ['Anh ấy đi học mỗi ngày.', 'He goes to school every day.'], ['Họ sống ở Hà Nội.', 'They live in Ha Noi.']],
    choices: [['Chọn câu đúng.', 'She reads books.', ['She read books.', 'She reading books.', 'She are read books.']], ['I đi với dạng nào?', 'study', ['studies', 'studys', 'studying']], ['He + go thành gì?', 'goes', ['go', 'gos', 'going']], ['They + play thành gì?', 'play', ['plays', 'playes', 'playing']], ['Dấu hiệu thói quen là:', 'every day', ['now', 'yesterday', 'last night']]],
    finalPrompt: 'Nói 5 câu về routine của bạn, ít nhất 1 câu dùng he/she.',
  },
  6: {
    title: 'Tôi không làm — phủ định với don’t / doesn’t',
    goal: 'Nói điều mình không làm bằng don’t/doesn’t và nhớ sau doesn’t động từ không thêm s.',
    grammarTitle: 'do not / does not + động từ nguyên mẫu',
    grammar: 'I/you/we/they dùng do not hoặc don’t. He/she/it dùng does not hoặc doesn’t. Sau don’t/doesn’t, động từ chính luôn ở dạng nguyên mẫu, nên nói He doesn’t like, không nói He doesn’t likes.',
    vocabulary: [['do not', 'không', 'I do not like coffee.'], ['don’t', 'không (rút gọn)', 'They don’t live here.'], ['does not', 'không với he/she/it', 'She does not play tennis.'], ['doesn’t', 'không (rút gọn)', 'He doesn’t go to school.'], ['coffee', 'cà phê', 'I don’t like coffee.'], ['tea', 'trà', 'He doesn’t like tea.'], ['tennis', 'quần vợt', 'She doesn’t play tennis.'], ['Sunday', 'Chủ nhật', 'He doesn’t work on Sunday.'], ['watch', 'xem', 'I don’t watch TV every day.'], ['live', 'sống', 'They don’t live here.'], ['homework', 'bài tập về nhà', 'She doesn’t do homework at night.'], ['late', 'muộn', 'We don’t sleep late.']],
    patterns: [['I/You/We/They + don’t + verb', 'Phủ định với chủ ngữ thường', ['I don’t like coffee.', 'They don’t live here.', 'We don’t sleep late.']], ['He/She/It + doesn’t + verb', 'Phủ định với he/she/it', ['She doesn’t play tennis.', 'He doesn’t go on Sunday.', 'It doesn’t work.']], ['Doesn’từ vựnguyên mẫu', 'Không thêm s sau doesn’t', ['He doesn’t like tea.', 'She doesn’t read comics.', 'My brother doesn’t watch TV.']], ['do not/does not = don’t/doesn’t', 'Dạng đầy đủ và rút gọn', ['I do not like coffee.', 'She does not play tennis.']]],
    sentences: [['I do not like coffee.', 'Tôi không thích cà phê.'], ['She does not play tennis.', 'Cô ấy không chơi quần vợt.'], ['They don’t live here.', 'Họ không sống ở đây.'], ['He doesn’t go to school on Sunday.', 'Anh ấy không đi học vào Chủ nhật.'], ['We don’t watch TV every day.', 'Chúng tôi không xem TV mỗi ngày.'], ['My brother doesn’t like tea.', 'Anh trai/em trai tôi không thích trà.'], ['I don’t sleep late.', 'Tôi không ngủ muộn.'], ['She doesn’t do homework at night.', 'Cô ấy không làm bài tập vào buổi tối.']],
    fills: [['I ___ like coffee.', 'don’t', 'I dùng don’t để phủ định.'], ['He ___ play football.', 'doesn’t', 'He dùng doesn’t.'], ['She doesn’t ___ tea.', 'like', 'Sau doesn’t dùng động từ nguyên mẫu.'], ['They ___ live here.', 'don’t', 'They dùng don’t.'], ['My sister doesn’t ___ TV.', 'watch', 'Sau doesn’t không thêm s/es.']],
    orders: [['Tôi không thích cà phê.', 'I don’t like coffee.'], ['Cô ấy không chơi quần vợt.', 'She doesn’t play tennis.'], ['Họ không sống ở đây.', 'They don’t live here.'], ['Anh ấy không đi học vào Chủ nhật.', 'He doesn’t go to school on Sunday.']],
    choices: [['Câu đúng là gì?', 'He doesn’t like tea.', ['He doesn’t likes tea.', 'He don’t like tea.', 'He not like tea.']], ['They dùng phủ định nào?', 'don’t', ['doesn’t', 'isn’t', 'aren’t']], ['Sau doesn’t dùng gì?', 'động từ nguyên mẫu', ['động từ thêm s', 'to be', 'danh từ số nhiều']], ['Câu đúng với “She/play tennis”', 'She doesn’t play tennis.', ['She doesn’t plays tennis.', 'She don’t play tennis.', 'She not plays tennis.']], ['Dạng đầy đủ của doesn’t là:', 'does not', ['do not', 'is not', 'are not']]],
    finalPrompt: 'Nói 4 câu về điều bạn không làm và 2 câu về điều một người thân không làm.',
  },
  7: {
    title: 'Bạn có làm không? — câu hỏi Do / Does',
    goal: 'Đặt câu hỏi thói quen bằng Do/Does, trả lời Yes/No ngắn và không thêm s sau Does.',
    grammarTitle: 'Do/Does + subject + verb?',
    grammar: 'Câu hỏi hiện từ vựng từ thường dùng Do hoặc Does ở đầu. I/you/we/they dùng Do; he/she/it dùng Does. Khi đã có Does, động từ chính từ vựnguyên mẫu: Does she like music?',
    vocabulary: [['do you', 'bạn có...không', 'Do you study English?'], ['does she', 'cô ấy có...không', 'Does she like music?'], ['does he', 'anh ấy có...không', 'Does he play football?'], ['speak', 'nói', 'Do you speak English?'], ['music', 'âm nhạc', 'Does she like music?'], ['live', 'sống', 'Do they live here?'], ['read books', 'đọc sách', 'Do you read books?'], ['answer', 'trả lời', 'Yes, I do.'], ['question', 'câu hỏi', 'Ask a question.'], ['weekend', 'cuối tuần', 'Do you study on weekends?'], ['friend', 'bạn', 'Does your friend speak English?'], ['short answer', 'trả lời ngắn', 'No, he doesn’t.']],
    patterns: [['Do + I/you/we/they + verb?', 'Hỏi với do', ['Do you study English?', 'Do they live here?', 'Do we have class today?']], ['Does + he/she/it + verb?', 'Hỏi với does', ['Does she like music?', 'Does he play football?', 'Does your friend speak English?']], ['Yes/No + subject + do/does', 'Trả lời ngắn', ['Yes, I do.', 'No, he doesn’t.', 'Yes, she does.']], ['Does + verb nguyên mẫu', 'Không thêm s sau Does', ['Does she read books?', 'Does he go to school?']]],
    sentences: [['Do you study English?', 'Bạn có học tiếng Anh không?'], ['Does she like music?', 'Cô ấy có thích nhạc không?'], ['Do they live here?', 'Họ có sống ở đây không?'], ['Yes, I do.', 'Vâng, có.'], ['No, he doesn’t.', 'Không, anh ấy không.'], ['Does he play football on weekends?', 'Anh ấy có chơi bóng đá vào cuối tuần không?'], ['Do you read books every day?', 'Bạn có đọc sách mỗi ngày không?'], ['Yes, she does.', 'Vâng, cô ấy có.']],
    fills: [['___ you speak English?', 'Do', 'You dùng Do.'], ['___ she go to school?', 'Does', 'She dùng Does.'], ['No, I ___.', 'don’t', 'Trả lời phủ định với I dùng don’t.'], ['Yes, she ___.', 'does', 'Trả lời khẳng định với she dùng does.'], ['Does he ___ football?', 'play', 'Sau Does dùng động từ nguyên mẫu.']],
    orders: [['Bạn có học tiếng Anh không?', 'Do you study English?'], ['Cô ấy có thích nhạc không?', 'Does she like music?'], ['Anh ấy có chơi bóng đá vào cuối tuần không?', 'Does he play football on weekends?'], ['Bạn có đọc sách mỗi ngày không?', 'Do you read books every day?']],
    choices: [['Câu hỏi đúng là gì?', 'Does she like music?', ['Does she likes music?', 'Do she like music?', 'She does like music?']], ['Do you read books? trả lời ngắn đúng:', 'Yes, I do.', ['Yes, I does.', 'Yes, do I.', 'Yes, I am.']], ['Does đi với chủ ngữ nào?', 'he/she/it', ['I/you/we', 'they', 'you only']], ['Sau Does dùng dạng nào?', 'play', ['plays', 'playing', 'played']], ['Câu hỏi cho “They live here.”', 'Do they live here?', ['Does they live here?', 'Are they live here?', 'Do they lives here?']]],
    finalPromptừ vựng tượng một người bạn bằng 6 câu Do/Does và tự trả lời ngắn.',
  },
  8: {
    title: 'Routine mỗi ngày — tổng hợp hiện tại đơn',
    goal: 'Nói routine bằng khẳng định, phủ định, nghi vấn và trạng từ tần suất.',
    grammarTitle: 'Hiện tại đơn cho thói quen và sự thật',
    grammar: 'Hiện tại đơn dùng cho thói quen, lộ trình và sự thật. Trạng từ như always/usually/often đứng trước động từ thường.',
    vocabulary: [['always', 'luôn luôn', 'I always get up early.'], ['usually', 'thường', 'She usually has breakfast.'], ['often', 'thường hay', 'We often play games.'], ['sometimes', 'thỉnh thoảng', 'I sometimes read at night.'], ['never', 'không bao giờ', 'He never drinks coffee.'], ['get up', 'thức dậy', 'I get up early.'], ['breakfast', 'bữa sáng', 'She has breakfast at seven.'], ['routine', 'thói quen', 'My routine is simple.']],
    patterns: [['Subject + frequency + verb', 'Nói tần suất', ['I always get up early.', 'She usually reads books.']], ['Subject + don’t/doesn’t + verb', 'Phủ định trong routine', ['He doesn’t like cartoons.', 'I don’t drink coffee.']], ['Do/Does + subject + often + verb?', 'Hỏi thói quen', ['Do you often go to the park?', 'Does she usually study?']]],
    sentences: [['I always get up early.', 'Tôi luôn thức dậy sớm.'], ['She usually has breakfast at seven.', 'Cô ấy thường ăn sáng lúc bảy giờ.'], ['He doesn’t like cartoons.', 'Anh ấy không thích hoạt hình.'], ['Do you often go to the park?', 'Bạn có thường đi công viên không?'], ['People drink water every day.', 'Mọi người uống nước mỗi ngày.']],
    fills: [['The sun ___ in the East.', 'rises', 'Sự từ vựngữ số ít thêm s.'], ['She usually ___ breakfast.', 'has', 'She dùng has.'], ['Does he ___ novels?', 'read', 'Sau Does dùng động từ nguyên mẫu.']],
    orders: [['Tôi luôn thức dậy sớm.', 'I always get up early.'], ['Bạn có thường đi công viên không?', 'Do you often go to the park?']],
    choices: [['Trạng từ tần suất trong câu nào đúng?', 'I always get up early.', ['I get up always early.', 'Always I get up early.', 'I get always up early.']], ['Sau Does dùng gì?', 'read', ['reads', 'reading', 'to read']], ['Câu phủ định đúng:', 'He doesn’t like cartoons.', ['He don’t like cartoons.', 'He doesn’t likes cartoons.', 'He not likes cartoons.']]],
    finalPrompt: 'Nói lại một câu về routine mỗi ngày của bạn.',
  },
  9: {
    title: 'Từ loại dễ hiểu — noun, verb, adjective trong câu ngắn',
    goal: 'Nhận diện danh từ, động từ, tính từ để tự sửa câu cơ bản.',
    grammarTitle: 'Noun / verb / adjective giữ vai trò khác nhau',
    grammar: 'Noun gọi tên người/vật. Verb chỉ hành động/trạng thái. Adjective mô tả noun hoặc trạng thái sau to be.',
    vocabulary: [['noun', 'danh từ', 'Student is a noun.'], ['verb', 'động từ', 'Study is a verb.'], ['adjective', 'tính từ', 'Happy is an adjective.'], ['person', 'người', 'A teacher is a person.'], ['thing', 'đồ vật', 'A book is a thing.'], ['action', 'hành động', 'Run is an action.'], ['big', 'to/lớn', 'The bag is big.'], ['small', 'nhỏ', 'The cat is small.']],
    patterns: [['Noun = person/thing', 'Danh từ là người/vật', ['teacher', 'book']], ['Verb = action/state', 'Động từ là hành động/trạng thái', ['study', 'read']], ['Subject + be + adjective', 'Tính từ mô tả trạng thái', ['She is happy.', 'The room is small.']]],
    sentences: [['A teacher is a person.', 'Giáo viên là một người.'], ['A book is a thing.', 'Quyển sách là một đồ vật.'], ['Study is a verb.', 'Study là một động từ.'], ['Happy is an adjective.', 'Happy là một tính từ.'], ['The bag is big.', 'Cái túi thì to.']],
    fills: [['A book is a ___.', 'thing', 'Book là đồ vật.'], ['Study is a ___.', 'verb', 'Study chỉ hành động học.'], ['Happy is an ___.', 'adjective', 'Happy mô tả trạng thái.']],
    orders: [['Cái túi thì to.', 'The bag is big.'], ['Study là một động từ.', 'Study is a verb.']],
    choices: [['“teacher” là từ loại gì?', 'noun', ['verb', 'adjective', 'question']], ['“read” là từ loại gì?', 'verb', ['noun', 'adjective', 'place']], ['“small” là từ loại gì?', 'adjective', ['noun', 'verb', 'time']]],
    finalPrompt: 'Nói lại một câu có danh từ và tính từ.',
  },
  10: {
    title: 'Đang làm gì? — hiện tại tiếp diễn',
    goal: 'Nói hành động đang diễn ra ngay lúc này bằng am/is/are + V-ing.',
    grammarTitle: 'am/is/are + verb-ing',
    grammar: 'Hiện tại tiếp diễn dùng cho việc đang xảy ra bây giờ. Cấu trúc: subject + am/is/are + verb-ing.',
    vocabulary: [['now', 'bây giờ', 'I am studying now.'], ['studying', 'đang học', 'I am studying.'], ['reading', 'đang đọc', 'She is reading.'], ['playing', 'đang chơi', 'They are playing.'], ['cooking', 'đang nấu ăn', 'Mom is cooking.'], ['sleeping', 'đang ngủ', 'The baby is sleeping.'], ['right now', 'ngay bây giờ', 'He is working right now.'], ['watching', 'đang xem', 'We are watching TV.']],
    patterns: [['I am + V-ing', 'Tôi đang làm gì', ['I am studying now.', 'I am reading.']], ['He/She/Itừ vựng', 'Một người/vật đang làm gì', ['She is cooking.', 'The baby is sleeping.']], ['We/They/You are + V-ing', 'Nhiều người/bạn đang làm gì', ['They are playing.', 'We are watching TV.']]],
    sentences: [['I am studying now.', 'Tôi đang học bây giờ.'], ['She is reading a book.', 'Cô ấy đang đọc sách.'], ['They are playing football.', 'Họ đang chơi bóng đá.'], ['Mom is cooking dinner.', 'Mẹ đang nấu bữa tối.'], ['We are watching TV.', 'Chúng tôi đang xem TV.']],
    fills: [['I ___ studying now.', 'am', 'I đi với am.'], ['She ___ reading a book.', 'is', 'She đi với is.'], ['They ___ playing football.', 'are', 'They đi với are.']],
    orders: [['Tôi đang học bây giờ.', 'I am studying now.'], ['Họ đang chơi bóng đá.', 'They are playing football.']],
    choices: [['Câu hiện tại tiếp diễn đúng:', 'She is reading a book.', ['She reading a book.', 'She reads now a book.', 'She are reading a book.']], ['They đi với gì?', 'are playing', ['is playing', 'am playing', 'playing is']], ['Dấu hiệu “now” thường dùng với:', 'hiện tại tiếp diễn', ['quá khứ đơn', 'danh từ', 'mạo từ']]],
    finalPrompt: 'Nói lại một câu về việc bạn đang làm ngay bây giờ.',
  },
  11: {
    title: 'Mỗi ngày hay ngay bây giờ? — phát âmple/present continuous',
    goal: 'Chọn đúng hiện tại đơn cho thói quen và hiện tại tiếp diễn cho việc đang xảy ra.',
    grammarTitle: 'every day vs now',
    grammar: 'Every day/usually dùng hiện tại đơn. Now/right now dùng hiện tại tiếp diễn. Hãy nhìn dấu hiệu thời gian trước khi chọn động từ.',
    vocabulary: [['every day', 'mỗi ngày', 'I study every day.'], ['now', 'bây giờ', 'I am studying now.'], ['usually', 'thường', 'She usually reads.'], ['right now', 'ngay bây giờ', 'She is reading right now.'], ['habit', 'thói quen', 'A habit happens often.'], ['happening', 'đang xảy ra', 'It is happening now.'], ['compare', 'so sánh', 'Compare the two sentences.'], ['choose', 'chọn', 'Choose the correct tense.']],
    patterns: [['Simple present = habit', 'Hiện tại đơn cho thói quen', ['I study every day.', 'She usually reads.']], ['Present continuous = now', 'Hiện tại tiếp diễn cho bây giờ', ['I am studying now.', 'She is reading right now.']], ['Signal word helps you choose', 'Từ khóa giúp chọn thì', ['every day → study', 'now → am studying']]],
    sentences: [['I study English every day.', 'Tôi học tiếng Anh mỗi ngày.'], ['I am studying English now.', 'Tôi đang học tiếng Anh bây giờ.'], ['She usually reads books.', 'Cô ấy thường đọc sách.'], ['She is reading a book right now.', 'Cô ấy đang đọc sách ngay bây giờ.'], ['They play football on Sundays.', 'Họ chơi bóng đá vào Chủ nhật.']],
    fills: [['I ___ English every day.', 'study', 'Every day dùng hiện tại đơn.'], ['I ___ studying English now.', 'am', 'Now dùng am/is/are + V-ing.'], ['She usually ___ books.', 'reads', 'Usually dùng hiện tại đơn.']],
    orders: [['Tôi học tiếng Anh mỗi ngày.', 'I study English every day.'], ['Tôi đang học tiếng Anh bây giờ.', 'I am studying English now.']],
    choices: [['Có “now” nên chọn:', 'I am studying now.', ['I study now.', 'I studies now.', 'I studied now.']], ['Có “every day” nên chọn:', 'I study every day.', ['I am studying every day now.', 'I studies every day.', 'I studying every day.']], ['Usually thuộc nhóm:', 'thói quen', ['ngay bây giờ', 'quá khứ', 'địa điểm']]],
    finalPrompt: 'Nói hai câu: một câu every day và một câu now.',
  },
  12: {
    title: 'Chuyện đã xảy ra — quá khứ đơn khẳng định',
    goal: 'Kể việc đã xảy ra bằng was/were hoặc động từ quá khứ đơn cơ bản.',
    grammarTitle: 'Past simple affirmative',
    grammar: 'Quá khứ đơn dùng cho việc đã xảy ra và kết thúc. To be đổi thành was/were; nhiều động từ thường thêm -ed.',
    vocabulary: [['yesterday', 'hôm qua', 'I studied yesterday.'], ['last night', 'tối qua', 'We watched TV last night.'], ['was', 'đã là/ở (số ít)', 'She was happy.'], ['were', 'đã là/ở (số nhiều/you)', 'They were at home.'], ['studied', 'đã học', 'I studied English.'], ['played', 'đã chơi', 'He played football.'], ['watched', 'đã xem', 'We watched TV.'], ['visited', 'đã thăm', 'I visited my grandma.']],
    patterns: [['I/He/She/It + was', 'To be quá khứ số ít', ['I was tired.', 'She was happy.']], ['You/We/They + were', 'To be quá khứ với you/we/they', ['They were at home.', 'We were late.']], ['Subject + regular verb-ed', 'Động từ thường quá khứ', ['I studied yesterday.', 'He played football.']]],
    sentences: [['I studied English yesterday.', 'Tôi đã học tiếng Anh hôm qua.'], ['She was happy last night.', 'Cô ấy đã vui tối qua.'], ['They were at home.', 'Họ đã ở nhà.'], ['He played football yesterday.', 'Anh ấy đã chơi bóng đá hôm qua.'], ['We watched TV last night.', 'Chúng tôi đã xem TV tối qua.']],
    fills: [['I ___ English yesterday.', 'studied', 'Yesterday dùng quá khứ đơn.'], ['She ___ happy last night.', 'was', 'She dùng was trong quá khứ.'], ['They ___ at home.', 'were', 'They dùng were trong quá khứ.']],
    orders: [['Tôi đã học tiếng Anh hôm qua.', 'I studied English yesterday.'], ['Họ đã ở nhà.', 'They were at home.']],
    choices: [['Câu quá khứ đúng:', 'I studied English yesterday.', ['I study English yesterday.', 'I am studying yesterday.', 'I studies yesterday.']], ['She dùng to be quá khứ nào?', 'was', ['were', 'are', 'am']], ['They dùng to be quá khứ nào?', 'were', ['was', 'is', 'am']]],
    finalPrompt: 'Nói lại một câu về việc bạn đã làm hôm qua.',
  },
};

export const foundation48DeepLessons: Record<number, Foundation48DeepLesson> = Object.fromEntries(
  Object.entries(seeds).map(([day, seed]) => [Number(day), buildDeepLesson(Number(day), seed)]),
) as Record<number, Foundation48DeepLesson>;

export function getFoundation48Readiness(dayNumber: number) {
  return foundation48DeepLessons[dayNumber]?.readiness ?? 'future';
}
