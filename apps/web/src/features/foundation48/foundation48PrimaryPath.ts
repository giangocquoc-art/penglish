import type { PooLesson } from '../../data/lessons/pooLessonTypes';

export type Foundation48PrimaryStage = {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  subtitle: string;
  days: number[];
  theme: string;
};

type DaySeed = {
  day: number;
  stageId: Foundation48PrimaryStage['id'];
  title: string;
  goal: string;
  theme: string;
  area: PooLesson['oceanArea'];
  vocabulary: Array<[term: string, meaningVi: string, exampleEn: string, exampleVi: string]>;
  pattern: string;
  patternMeaning: string;
  patternExplanation: string;
  examples: Array<[en: stừ vựng]>;
  dialogueSituation: string;
  dialogueLines: Array<[speaker: string, en: stừ vựng]>;
  mistake: {
    vi: string;
    wrong?: string;
    correct: string;
    explanation: string;
  };
  speakingTask: string;
};

export const foundation48PrimaryStages: Foundation48PrimaryStage[] = [
  {
    id: 1,
    title: 'Chặng 1: Sinh tồn cơ bản',
    subtitle: 'Ngày 1–8: chào hỏi, giới thiệu, số, tuổi, quê quán, nghề nghiệp.',
    days: [1, 2, 3, 4, 5, 6, 7, 8],
    theme: 'Poo Whale giúp học viên sống sót trong những câu giao tiếp đầu tiên.',
  },
  {
    id: 2,
    title: 'Chặng 2: Bản thân và gia đình',
    subtitle: 'Ngày 9–16: gia đình, bạn bè, thói quen, sở thích.',
    days: [9, 10, 11, 12, 13, 14, 15, 16],
    theme: 'Poo Whale cùng học viên nói về người thân và cuộc sống hằng ngày.',
  },
  {
    id: 3,
    title: 'Chặng 3: Trường học và công việc',
    subtitle: 'Ngày 17–24: lớp học, đồ dùng học tập, hỏi bài, nhờ giúp đỡ.',
    days: [17, 18, 19, 20, 21, 22, 23, 24],
    theme: 'Poo Whale đưa học viên vào lớp học và nơi làm việc thân thiện.',
  },
  {
    id: 4,
    title: 'Chặng 4: Ăn uống, mua sắm, di chuyển',
    subtitle: 'Ngày 25–32: gọi món, mua đồ, hỏi đường, hỏi giá.',
    days: [25, 26, 27, 28, 29, 30, 31, 32],
    theme: 'Poo Whale luyện các tình huống đời sống cần nói ngay.',
  },
  {
    id: 5,
    title: 'Chặng 5: Quá khứ và kế hoạch',
    subtitle: 'Ngày 33–40: kể chuyện hôm qua, cuối tuần, dự định tương lai.',
    days: [33, 34, 35, 36, 37, 38, 39, 40],
    theme: 'Poo Whale giúp học viên kể chuyện đơn giản và nói kế hoạch gần.',
  },
  {
    id: 6,
    title: 'Chặng 6: Giao tiếp thật',
    subtitle: 'Ngày 41–48: small talk, gọi điện, đặt lịch, giới thiệu ngắn.',
    days: [41, 42, 43, 44, 45, 46, 47, 48],
    theme: 'Poo Whale luyện phản xạ giao tiếp thật, ngắn, rõ và tự tin.',
  },
];

const daySeeds: DaySeed[] = [
  {
    day: 1,
    stageId: 1,
    title: 'Chào hỏi thật dễ',
    goal: 'Biết chào, đáp lại lời chào và nói cảm ơn bằng câu rất ngắn.',
    theme: 'Poo Whale gặp bạn mới ở đầm nước xanh.',
    area: 'lagoon',
    vocabulary: [
      ['hello', 'xin chào', 'Hello, Poo.', 'Xin chào, Poo.'],
      ['hi', 'chào', 'Hi, Nam.', 'Chào Nam.'],
      ['thank you', 'cảm ơn', 'Thank you, Poo.', 'Cảm ơn, Poo.'],
      ['goodbye', 'tạm biệt', 'Goodbye, Poo.', 'Tạm biệt, Poo.'],
    ],
    pattern: 'Hello. / Hi. / Thank you.',
    patternMeaning: 'Xin chào. / Chào. / Cảm ơn.',
    patternExplanation: 'Dùng từng cụm ngắn trước, chưa cần ghép câu dài.',
    examples: [['Hello, Poo.', 'Xin chào, Poo.'], ['Thank you.', 'Cảm ơn.']],
    dialogueSituation: 'Bạn gặp Poo lần đầu và chào thật chậm.',
    dialogueLines: [['Poo', 'Hello.', 'Xin chào.'], ['Learner', 'Hi, Poo.', 'Chào Poo.'], ['Poo', 'Thank you.', 'Cảm ơn bạn.'], ['Learner', 'Goodbye.', 'Tạm biệt.']],
    mistake: { vi: 'Quên bật âm /h/ trong hello.', wrong: 'ello', correct: 'hello', explanation: 'Hãy thở nhẹ ra ở đầu từ hello.' },
    speakingTask: 'Nói 3 câu: Hello. Hi, Poo. Thank you.',
  },
  {
    day: 2,
    stageId: 1,
    title: 'Giới thiệu tên',
    goal: 'Nói tên của mình và hỏi tên người khác.',
    theme: 'Poo Whale hỏi tên bạn trên bãi cát.',
    area: 'lagoon',
    vocabulary: [['name', 'tên', 'My name is Linh.', 'Tên mình là Linh.'], ['my', 'của tôi', 'My name is Nam.', 'Tên tôi là Nam.'], ['your', 'của bạn', 'What is your name?', 'Tên bạn là gì?'], ['nice', 'vui/tốt', 'Nice to meet you.', 'Rất vui được gặp bạn.']],
    pattern: 'My name is + name. / What is your name?',
    patternMeaning: 'Tên mình là... / Tên bạn là gì?',
    patternExplanation: 'Dùng “My name is” để giới thiệu tên; dùng “What is your name?” để hỏi tên.',
    examples: [['My name is Nam.', 'Tên mình là Nam.'], ['What is your name?', 'Tên bạn là gì?']],
    dialogueSituation: 'Poo và học viên hỏi tên nhau.',
    dialogueLines: [['Poo', 'What is your name?', 'Tên bạn là gì?'], ['Learner', 'My name is Nam.', 'Tên mình là Nam.'], ['Poo', 'Nice to meet you.', 'Rất vui được gặp bạn.'], ['Learner', 'Nice to meet you too.', 'Mình cũng rất vui được gặp bạn.']],
    mistake: { vi: 'Thiếu “is” khi nói tên.', wrong: 'My name Nam.', correct: 'My name is Nam.', explanation: 'Mẫu đúng luôn có “is”: My name is + tên.' },
    speakingTask: 'Tự nói tên mình 3 lần bằng “My name is ...”.',
  },
  {
    day: 3,
    stageId: 1,
    title: 'Hỏi thăm khỏe không',
    goal: 'Hỏi “Bạn khỏe không?” và trả lời “Tôi ổn/khỏe”.',
    theme: 'Poo Whale kiểm tra năng lượng buổi sáng.',
    area: 'lagoon',
    vocabulary: [['good', 'khỏe/tốt', 'I am good.', 'Mình khỏe.'], ['fine', 'ổn', 'I am fine.', 'Mình ổn.'], ['today', 'hôm nay', 'How are you today?', 'Hôm nay bạn khỏe không?'], ['tired', 'mệt', 'I am tired.', 'Mình mệt.']],
    pattern: 'How are you? / I am good.',
    patternMeaning: 'Bạn khỏe không? / Mình khỏe.',
    patternExplanation: 'Câu hỏi dùng để mở đầu trò chuyện. Trả lời ngắn là đủ.',
    examples: [['How are you?', 'Bạn khỏe không?'], ['I am fine, thank you.', 'Mình ổn, cảm ơn.']],
    dialogueSituation: 'Poo hỏi thăm bạn hôm nay.',
    dialogueLines: [['Poo', 'How are you today?', 'Hôm nay bạn khỏe không?'], ['Learner', 'I am good.', 'Mình khỏe.'], ['Poo', 'Great!', 'Tuyệt!'], ['Learner', 'Thank you.', 'Cảm ơn.']],
    mistake: { vi: 'Trả lời thiếu chủ ngữ.', wrong: 'Am good.', correct: 'I am good.', explanatiếng Anh cần nói rõ “I am”.' },
    speakingTask: 'Nói 2 câu: How are you? I am good.',
  },
  {
    day: 4,
    stageId: 1,
    title: 'Số 1 đến 10',
    goal: 'Nhận biết và nói số 1–10 trong tình huống đơn giản.',
    theme: 'Poo Whale đếm vỏ sò trong đầm nước.',
    area: 'coral-reef',
    vocabulary: [['one', 'một', 'One shell.', 'Một vỏ sò.'], ['two', 'hai', 'Two shells.', 'Hai vỏ sò.'], ['five', 'năm', 'Five fish.', 'Năm con cá.'], ['ten', 'mười', 'Ten stars.', 'Mười ngôi sao.']],
    pattern: 'Number + noun.',
    patternMeaning: 'Số + danh từ.',
    patternExplanation: 'Dùng số trước danh từ để nói số lượng.',
    examples: [['Two fish.', 'Hai con cá.'], ['Ten shells.', 'Mười vỏ sò.']],
    dialogueSituation: 'Poo hỏi bạn nhìn thấy bao nhiêu con cá.',
    dialogueLines: [['Poo', 'How many fish?', 'Có bao nhiêu con cá?'], ['Learner', 'Two fish.', 'Hai con cá.'], ['Poo', 'How many shells?', 'Có bao nhiêu vỏ sò?'], ['Learner', 'Ten shells.', 'Mười vỏ sò.']],
    mistake: { vi: 'phát âm “three” thành “tree”.', wrong: 'tree', correct: 'three', explanation: 'Đặt lưỡi nhẹ giữa răng để nói âm /θ/ trong three.' },
    speakingTask: 'Đếm chậm từ one đến ten, rồi nói “Two fish.”',
  },
  {
    day: 5,
    stageId: 1,
    title: 'Nói tuổi',
    goal: 'Nói tuổi của mình và hỏi tuổi người khác một cách lịch sự.',
    theme: 'Poo Whale tổ chức tiệc sinh nhật nhỏ.',
    area: 'coral-reef',
    vocabulary: [['age', 'tuổi', 'Age is a number.', 'Tuổi là một con số.'], ['old', 'tuổi', 'I am ten years old.', 'Mình 10 tuổi.'], ['years old', '... tuổi', 'She is eight years old.', 'Cô ấy 8 tuổi.'], ['birthday', 'sinh nhật', 'Happy birthday!', 'Chúc mừng sinh nhật!']],
    pattern: 'I am + number + years old.',
    patternMeaning: 'Tôi ... tuổi.',
    patternExplanation: 'Dùng “years old” sau số tuổi. Với giao tiếp nhanh có thể nói “I am ten.”',
    examples: [['I am ten years old.', 'Mình 10 tuổi.'], ['How old are you?', 'Bạn bao nhiêu tuổi?']],
    dialogueSituation: 'Poo hỏi tuổi trong bữa tiệc sinh nhật.',
    dialogueLines: [['Poo', 'How old are you?', 'Bạn bao nhiêu tuổi?'], ['Learner', 'I am ten years old.', 'Mình 10 tuổi.'], ['Poo', 'Happy birthday!', 'Chúc mừng sinh nhật!'], ['Learner', 'Thank you.', 'Cảm ơn.']],
    mistừ vựng “have” để nói tuổi theo tiếng Việt.', wrong: 'I have ten years old.', correct: 'I am ten years old.', explanatiếng Anh dùng “I am” khi nói tuổi.' },
    speakingTask: 'Nói tuổi thật hoặc tuổi tưởng tượng của bạn bằng một câu.',
  },
  {
    day: 6,
    stageId: 1,
    title: 'Nói quê quán',
    goal: 'Nói mình đến từ vựngười khác đến từ đâu.',
    theme: 'Poo Whale mở bản đồ biển Việt Nam.',
    area: 'open-sea',
    vocabulary: [['from', 'đến từ', 'I am from Ha Noi.', 'Mình đến từ Hà Nội.'], ['city', 'thành phố', 'Da Nang is a city.', 'Đà Nẵng là một thành phố.'], ['country', 'đất nước', 'Viet Nam is my country.', 'Việt Nam là đất nước của tôi.'], ['where', 'ở đâu/từ đâu', 'Where are you from?', 'Bạn đến từ đâu?']],
    pattern: 'I am from + place. / Where are you from?',
    patternMeaning: 'Mình đến từ... / Bạn đến từ đâu?',
    patternExplanation: 'Dùng “from” để nói nguồn gốc hoặc quê quán.',
    examples: [['I am from Viet Nam.', 'Mình đến từ Việt Nam.'], ['Where are you from?', 'Bạn đến từ đâu?']],
    dialogueSituation: 'Poo và bạn nói về quê quán.',
    dialogueLines: [['Poo', 'Where are you from?', 'Bạn đến từ đâu?'], ['Learner', 'I am from Ha Noi.', 'Mình đến từ Hà Nội.'], ['Poo', 'I am from the ocean.', 'Mình đến từ đại dương.'], ['Learner', 'Nice!', 'Hay quá!']],
    mistake: { vi: 'Thiếu “from” khi nói quê.', wrong: 'I am Ha Noi.', correct: 'I am from Ha Noi.', explanation: '“I am Ha Noi” nghe như bạn là thành phố; cần “from”.' },
    speakingTask: 'Nói “I am from ...” với quê quán của bạn.',
  },
  {
    day: 7,
    stageId: 1,
    title: 'Nói nghề nghiệp',
    goal: 'Nói nghề nghiệp hoặc vai trò cơ bản của mình/người khác.',
    theme: 'Poo Whale ghé thăm làng nghề ven biển.',
    area: 'open-sea',
    vocabulary: [['student', 'học sinh', 'I am a student.', 'Mình là học sinh.'], ['teacher', 'giáo viên', 'She is a teacher.', 'Cô ấy là giáo viên.'], ['doctor', 'bác sĩ', 'He is a doctor.', 'Anh ấy là bác sĩ.'], ['job', 'công việc', 'What is your job?', 'Công việc của bạn là gì?']],
    pattern: 'I am a/an + job.',
    patternMeaning: 'Tôi là một ...',
    patternExplanation: 'Dùng “a” trước nghề bắt đầu bằng phụ âm; “an” trước âm nguyên âm.',
    examples: [['I am a student.', 'Mình là học sinh.'], ['She is a teacher.', 'Cô ấy là giáo viên.']],
    dialogueSituation: 'Poo hỏi bạn là học sinh hay giáo viên.',
    dialogueLines: [['Poo', 'What is your job?', 'Công việc của bạn là gì?'], ['Learner', 'I am a student.', 'Mình là học sinh.'], ['Poo', 'My friend is a teacher.', 'Bạn của mình là giáo viên.'], ['Learner', 'That is nice.', 'Điều đó hay quá.']],
    mistake: { vi: 'Quên mạo từ a/an trước nghề.', wrong: 'I am student.', correct: 'I am a student.', explanation: 'Khi nói một nghề số ít, thường cần “a/an”.' },
    speakingTask: 'Nói một câu về bạn: I am a student/teacher/doctor.',
  },
  {
    day: 8,
    stageId: 1,
    title: 'Tự giới thiệu 4 câu',
    goal: 'Ghép chào hỏi, tên, tuổi, quê quán và vai trò thành đoạn giới thiệu ngắn.',
    theme: 'Poo Whale trao huy hiệu sinh tồn cơ bản.',
    area: 'whale-cave',
    vocabulary: [['meet', 'gặp', 'Nice to meet you.', 'Rất vui được gặp bạn.'], ['friend', 'bạn', 'You are my friend.', 'Bạn là bạn của mình.'], ['live', 'sống', 'I live in Hue.', 'Mình sống ở Huế.'], ['student', 'học sinh', 'I am a student.', 'Mình là học sinh.']],
    pattern: 'Hello. My name is... I am... I am from...',
    patternMeaning: 'Xin chào. Tên mình là... Mình... tuổi. Mình đến từ...',
    patternExplanation: 'Ghép các câu ngắn đã học. Không cần câu dài.',
    examples: [['Hello. My name is Nam.', 'Xin chào. Tên mình là Nam.'], ['I am from Da Nang.', 'Mình đến từ Đà Nẵng.']],
    dialogueSituation: 'Bạn tự giới thiệu trước Poo.',
    dialogueLines: [['Poo', 'Please introduce yourself.', 'Hãy giới thiệu bản thân nhé.'], ['Learner', 'Hello. My name is Nam.', 'Xin chào. Tên mình là Nam.'], ['Learner', 'I am ten years old.', 'Mình 10 tuổi.'], ['Learner', 'I am from Hue.', 'Mình đến từ Huế.']],
    mistake: { vi: 'Cố nói một câu quá dài rồi bị rối.', correct: 'Hello. My name is Nam. I am ten.', explanation: 'Người mất gốc nên nói nhiều câu ngắn, rõ, chậm.' },
    speakingTask: 'Tự giới thiệu 4 câu, mỗi câu dưới 8 từ.',
  },
  {
    day: 9,
    stageId: 2,
    title: 'Gia đình của tôi',
    goal: 'Gọi tên các thành viên gia đình và nói “Đây là...”.',
    theme: 'Poo Whale xem album gia đình cùng bạn.',
    area: 'kelp-forest',
    vocabulary: [['family', 'gia đình', 'This is my family.', 'Đây là gia đình của tôi.'], ['mother', 'mẹ', 'This is my mother.', 'Đây là mẹ tôi.'], ['father', 'bố', 'This is my father.', 'Đây là bố tôi.'], ['sister', 'chị/em gái', 'She is my sister.', 'Cô ấy là chị/em gái tôi.']],
    pattern: 'This is my + family member.',
    patternMeaning: 'Đây là ... của tôi.',
    patternExplanation: 'Dùng “This is my...” khi chỉ vào ảnh hoặc giới thiệu người thân.',
    examples: [['This is my mother.', 'Đây là mẹ tôi.'], ['This is my family.', 'Đây là gia đình tôi.']],
    dialogueSituation: 'Bạn cho Poo xem ảnh gia đình.',
    dialogueLines: [['Poo', 'Who is this?', 'Đây là ai?'], ['Learner', 'This is my mother.', 'Đây là mẹ tôi.'], ['Poo', 'Who is he?', 'Ông ấy là ai?'], ['Learner', 'He is my father.', 'Ông ấy là bố tôi.']],
    mistake: { vi: 'Nhầm “he” và “she”.', wrong: 'He is my mother.', correct: 'She is my mother.', explanation: 'Mother dùng “she”; father dùng “he”.' },
    speakingTask: 'Giới thiệu 2 người thân bằng “This is my ...”.',
  },
  {
    day: 10,
    stageId: 2,
    title: 'Bạn bè quanh tôi',
    goal: 'Nói về một người bạn bằng câu đơn giản.',
    theme: 'Poo Whale gặp nhóm bạn nhỏ ở rạn san hô.',
    area: 'kelp-forest',
    vocabulary: [['friend', 'bạn', 'This is my friend.', 'Đây là bạn tôi.'], ['kind', 'tốt bụng', 'She is kind.', 'Cô ấy tốt bụng.'], ['funny', 'vui tính', 'He is funny.', 'Anh ấy vui tính.'], ['classmate', 'bạn cùng lớp', 'Lan is my classmate.', 'Lan là bạn cùng lớp của tôi.']],
    pattern: 'He/She is my friend. He/She is + adjective.',
    patternMeaning: 'Anh/Cô ấy là bạn tôi. Anh/Cô ấy ...',
    patternExplanation: 'Dùng he cho nam, she cho nữ; tính từ đứng sau is.',
    examples: [['She is my friend.', 'Cô ấy là bạn tôi.'], ['He is funny.', 'Anh ấy vui tính.']],
    dialogueSituation: 'Poo hỏi về bạn thân của bạn.',
    dialogueLines: [['Poo', 'Who is your friend?', 'Ai là bạn của bạn?'], ['Learner', 'Lan is my friend.', 'Lan là bạn của mình.'], ['Poo', 'Is she kind?', 'Bạn ấy tốt bụng không?'], ['Learner', 'Yes, she is kind.', 'Có, bạn ấy tốt bụng.']],
    mistake: { vi: 'Đặt tính từ trước “is” theo tiếng Việt.', wrong: 'She kind is.', correct: 'She is kind.', explanation: 'Câu đúng: Chủ ngữ + is + tính từ.' },
    speakingTask: 'Nói 3 câu về một người bạn.',
  },
  {
    day: 11,
    stageId: 2,
    title: 'Thói quen buổi sáng',
    goal: 'Nói 3 việc mình làm mỗi sáng bằng hiện tại đơn.',
    theme: 'Poo Whale thức dậy cùng mặt trời.',
    area: 'coral-reef',
    vocabulary: [['wake up', 'thức dậy', 'I wake up at six.', 'Tôi thức dậy lúc sáu giờ.'], ['brush', 'đánh/chải', 'I brush my teeth.', 'Tôi đánh răng.'], ['eat', 'ăn', 'I eat breakfast.', 'Tôi ăn sáng.'], ['morning', 'buổi sáng', 'I study in the morning.', 'Tôi học vào buổi sáng.']],
    pattern: 'I + verb + every morning.',
    patternMeaning: 'Tôi ... mỗi sáng.',
    patternExplanation: 'Dùng động từ nguyên mẫu sau “I” để nói thói quen.',
    examples: [['I wake up early.', 'Tôi thức dậy sớm.'], ['I eat breakfast every morning.', 'Tôi ăn sáng mỗi sáng.']],
    dialogueSituation: 'Poo hỏi bạn làm gì vào buổi sáng.',
    dialogueLines: [['Poo', 'What do you do in the morning?', 'Bạn làm gì vào buổi sáng?'], ['Learner', 'I wake up early.', 'Tôi thức dậy sớm.'], ['Learner', 'I brush my teeth.', 'Tôi đánh răng.'], ['Poo', 'Good routine!', 'Thói quen tốt đó!']],
    mistake: { vi: 'Thêm s sau động từ vựngữ I.', wrong: 'I wakes up.', correct: 'I wake up.', explanation: 'Với “I”, động từ không thêm s.' },
    speakingTask: 'Nói 3 việc bạn làm mỗi sáng.',
  },
  {
    day: 12,
    stageId: 2,
    title: 'Sở thích đơn giản',
    goal: 'Nói mình thích hoặc không thích một hoạt động.',
    theme: 'Poo Whale hỏi bạn thích làm gì sau giờ học.',
    area: 'open-sea',
    vocabulary: [['like', 'thích', 'I like music.', 'Tôi thích âm nhạc.'], ['music', 'âm nhạc', 'I like music.', 'Tôi thích âm nhạc.'], ['football', 'bóng đá', 'I like football.', 'Tôi thích bóng đá.'], ['reading', 'đọc sách', 'I like reading.', 'Tôi thích đọc sách.']],
    pattern: 'I like + noun/V-ing. / I do not like + noun/V-ing.',
    patternMeaning: 'Tôi thích... / Tôi không thích...',
    patternExplanation: 'Sau like có thể dùng danh từ hoặc động từ thêm -ing.',
    examples: [['I like music.', 'Tôi thích âm nhạc.'], ['I do not like football.', 'Tôi không thích bóng đá.']],
    dialogueSituation: 'Poo hỏi sở thích của bạn.',
    dialogueLines: [['Poo', 'What do you like?', 'Bạn thích gì?'], ['Learner', 'I like music.', 'Tôi thích âm nhạc.'], ['Poo', 'Do you like football?', 'Bạn thích bóng đá không?'], ['Learner', 'No, I do not.', 'Không, mình không thích.']],
    mistake: { vi: 'Nói “I like read” từ vựng.', wrong: 'I like read.', correct: 'I like reading.', explanation: 'Sau like, nếu dùng động từ thì nên dùng dạng -ing trong mẫu này.' },
    speakingTask: 'Nói 2 thứ bạn thích và 1 thứ bạn không thích.',
  },
  {
    day: 13,
    stageId: 2,
    title: 'Một ngày của tôi',
    goal: 'Kể lộ trình rất ngắn trong ngày.',
    theme: 'Poo Whale đi theo lịch sinh hoạt của bạn.',
    area: 'open-sea',
    vocabulary: [['study', 'học', 'I study Englishọc tiếng Anh.'], ['go to school', 'đi học', 'I go to school.', 'Tôi đi học.'], ['play', 'chơi', 'I play with friends.', 'Tôi chơi với bạn bè.'], ['sleep', 'ngủ', 'I sleep at ten.', 'Tôi ngủ lúc 10 giờ.']],
    pattern: 'First, I... Then, I...',
    patternMeaning: 'Đầu tiên, tôi... Sau đó, tôi...',
    patternExplanation: 'Dùng first và then để nối hai việc đơn giản.',
    examples: [['First, I study.', 'Đầu tiên, tôi học.'], ['Then, I play.', 'Sau đó, tôi chơi.']],
    dialogueSituation: 'Bạn kể một ngày của mình cho Poo.',
    dialogueLines: [['Poo', 'Tell me about your day.', 'Kể cho mình về ngày của bạn đi.'], ['Learner', 'First, I go to school.', 'Đầu tiên, tôi đi học.'], ['Learner', 'Then, I study English.', 'Sau đó, tôi học tiếng Anh.'], ['Poo', 'Great job!', 'Làm tốt lắm!']],
    mistake: { vi: 'Quên chủ ngữ ở đầu câu.', wrong: 'Go to school.', correct: 'I go to school.', explanatiếng Anh cơ bản cần chủ ngữ “I”.' },
    speakingTask: 'Nói 3 câu về ngày của bạn, bắt đầu bằng “I”.',
  },
  {
    day: 14,
    stageId: 2,
    title: 'Hỏi thói quen của bạn',
    goal: 'Hỏi người khác có làm việc gì không bằng Do you...?',
    theme: 'Poo Whale phỏng vấn thói quen của bạn.',
    area: 'whale-cave',
    vocabulary: [['do', 'trợ động từ để hỏi', 'Do you study English?', 'Bạn có học tiếng Anh không?'], ['every day', 'mỗi ngày', 'I study every day.', 'Tôi học mỗi ngày.'], ['often', 'thường', 'I often read.', 'Tôi thường đọc sách.'], ['sometimes', 'thỉnh thoảng', 'I sometimes play football.', 'Tôi thỉnh thoảng chơi bóng đá.']],
    pattern: 'Do you + verb? / Yes, I do. / No, I do not.',
    patternMeaning: 'Bạn có ... không? / Có. / Không.',
    patternExplanation: 'Dùng Do you để hỏi thói quen với “you”.',
    examples: [['Do you study English?', 'Bạn có học tiếng Anh không?'], ['Yes, I do.', 'Có.']],
    dialogueSituation: 'Poo học tiếng Anh mỗi ngày không.',
    dialogueLines: [['Poo', 'Do you study English every day?', 'Bạn có học tiếng Anh mỗi ngày không?'], ['Learner', 'Yes, I do.', 'Có.'], ['Poo', 'Do you play football?', 'Bạn có chơi bóng đá không?'], ['Learner', 'Sometimes.', 'Thỉnh thoảng.']],
    mistake: { vi: 'Trả lời “Yes, I am” cho câu hỏi Do you.', wrong: 'Yes, I am.', correct: 'Yes, I do.', explanation: 'Câu hỏi bắt đầu bằng Do thì trả lời ngắn bằng do.' },
    speakingTask: 'Hỏi Poo 2 câu bắt đầu bằng “Do you...?”.',
  },
  {
    day: 15,
    stageId: 2,
    titừ vựngười thân',
    goal: 'Nói người thân làm gì hoặc thích gì bằng câu ngắn.',
    theme: 'Poo Whale nghe bạn kể về gia đình.',
    area: 'kelp-forest',
    vocabulary: [['brother', 'anh/em trai', 'My brother likes football.', 'Anh/em trai tôi thích bóng đá.'], ['sister', 'chị/em gái', 'My sister likes music.', 'Chị/em gái tôi thích âm nhạc.'], ['likes', 'thích', 'She likes music.', 'Cô ấy thích âm nhạc.'], ['works', 'làm việc', 'My father works.', 'Bố tôi làm việc.']],
    pattern: 'He/She likes + noun/V-ing.',
    patternMeaning: 'Anh/Cô ấy thích...',
    patternExplanation: 'Với he/she, động từ like thêm s thành likes.',
    examples: [['She likes music.', 'Cô ấy thích âm nhạc.'], ['My brother likes football.', 'Anh/em trai tôi thích bóng đá.']],
    dialogueSituation: 'Poo hỏi em gái hoặc anh trai của bạn thích gì.',
    dialogueLines: [['Poo', 'Do you have a sister?', 'Bạn có chị/em gái không?'], ['Learner', 'Yes, I do.', 'Có.'], ['Poo', 'What does she like?', 'Bạn ấy thích gì?'], ['Learner', 'She likes music.', 'Bạn ấy thích âm nhạc.']],
    mistake: { vi: 'Quên thêm s với he/she.', wrong: 'She like music.', correct: 'She likes music.', explanation: 'Hiện tại đơn với he/she thường thêm s.' },
    speakingTask: 'Nói 3 câu về một người thân: He/She likes...',
  },
  {
    day: 16,
    stageId: 2,
    title: 'Mini talk: Tôi và gia đình',
    goal: 'Nói đoạn 5 câu về bản thân, gia đình, thói quen và sở thích.',
    theme: 'Poo Whale trao huy hiệu bản thân và gia đình.',
    area: 'whale-cave',
    vocabulary: [['about', 'về', 'I talk about my family.', 'Tôi nói về gia đình tôi.'], ['together', 'cùng nhau', 'We eat together.', 'Chúng tôi ăn cùng nhau.'], ['home', 'nhà', 'I am at home.', 'Tôi ở nhà.'], ['happy', 'vui', 'My family is happy.', 'Gia đình tôi vui vẻ.']],
    pattern: 'I... My family... We...',
    patternMeaning: 'Tôi... Gia đình tôi... Chúng tôi...',
    patternExplanation: 'Dùng I để nói về mình, my family để nói về gia đình, we để nói các việc cùng nhau.',
    examples: [['I like music.', 'Tôi thích âm nhạc.'], ['My family is happy.', 'Gia đình tôi vui vẻ.'], ['We eat together.', 'Chúng tôi ăn cùng nhau.']],
    dialogueSituation: 'Bạn nói một mini talk cho Poo nghe.',
    dialogueLines: [['Poo', 'Tell me about your family.', 'Kể mình nghe về gia đình bạn nhé.'], ['Learner', 'My family is happy.', 'Gia đình mình vui vẻ.'], ['Learner', 'We eat together.', 'Chúng mình ăn cùng nhau.'], ['Poo', 'Beautiful talk!', 'Bài nói rất hay!']],
    mistừ vựng “my family are” khi nói gia đình như một nhóm chung.', wrong: 'My family are happy.', correct: 'My family is happy.', explanation: 'Trong mẫu đơn giản này, coi family là một nhóm nên dùng “is”.' },
    speakingTask: 'Nói mini talk 5 câu: tên, quê, một người thân, sở thích, thói quen.',
  },
];

function toIdText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeLesson(seed: DaySeed): PooLesson {
  const stage = foundation48PrimaryStages.find((item) => item.id === seed.stageId) ?? foundation48PrimaryStages[0];
  const firstDialogueText = seed.dialogueLines.map(([, en]) => en).join(' ');
  const correctQuizAnswer = seed.vocabulary[0]?.[1] ?? '';

  return {
    id: `foundation48-day-${String(seed.day).padStart(2, '0')}-primary`,
    title: `Day ${seed.day}: ${seed.title}`,
    titleVi: `Ngày ${seed.day}: ${seed.title}`,
    titleEn: `Day ${seed.day}: ${seed.title}`,
    level: seed.day <= 8 ? 'A0' : 'A1',
    skillFocus: ['vocabulary', 'patterns', 'dialogue', 'listening', 'shadowing', 'speaking', 'review'],
    lessonMode: 'core-lesson',
    learningGoalVi: seed.goal,
    oceanTheme: seed.theme,
    oceanArea: seed.area,
    estimatedMinutes: 15,
    vocabulary: seed.vocabulary.map(([term, meaningVi, exampleEn, exampleVi], index) => ({
      id: `d${seed.day}-vocab-${index + 1}-${toIdText(term)}`,
      term,
      meaningVi,
      exampleEn,
      exampleVi,
      tags: [`day-${seed.day}`, `stage-${seed.stageId}`, seed.day <= 8 ? 'a0' : 'a1'],
    })),
    patterns: [
      {
        id: `d${seed.day}-pattern-main`,
        pattern: seed.pattern,
        meaningVi: seed.patternMeaning,
        explanationVi: seed.patternExplanation,
        examples: seed.examples.map(([en, vi]) => ({ en, vi })),
      },
    ],
    dialogue: [
      {
        id: `d${seed.day}-dialogue-main`,
        titleVi: `Hội thoại ngày ${seed.day}`,
        situationVi: seed.dialogueSituation,
        lines: seed.dialogueLines.map(([speaker, en, vi], index) => ({
          id: `d${seed.day}-line-${index + 1}`,
          speaker,
          en,
          vi,
          focusWords: seed.vocabulary.slice(0, 2).map(([term]) => term),
        })),
      },
    ],
    listeningTasks: [
      {
        id: `d${seed.day}-listening-slow`,
        titleVi: `Nghe chậm ngày ${seed.day}`,
        promptVi: 'Nghe chậm đoạn hội thoại và chọn ý đúng.',
        transcriptEn: firstDialogueText,
        transcriptVi: seed.dialogueLines.map(([, , vi]) => vi).join(' '),
        questions: [
          {
            id: `d${seed.day}-listening-q1`,
            questionVi: `Từ “${seed.vocabulary[0]?.[0] ?? 'hello'}” nghĩa là gì?`,
            choices: [correctQuizAnswer, 'không biết', 'tạm biệt'].filter((item, index, arr) => arr.indexOf(item) === index),
            correctAnswer: correctQuizAnswer,
            explanationVi: `Trong bài, “${seed.vocabulary[0]?.[0]}” nghĩa là “${correctQuizAnswer}”.`,
          },
        ],
      },
    ],
    shadowing: [
      {
        id: `d${seed.day}-shadowing-slow`,
        titleVi: `Shadowing chậm ngày ${seed.day}`,
        speed: 'slow',
        lines: seed.dialogueLines.slice(0, 3).map(([, en, vi], index) => ({
          id: `d${seed.day}-shadow-${index + 1}`,
          en,
          vi,
          pronunciationTipVi: index === 0 ? 'Đọc chậm, rõ từng cụm nhỏ.' : 'Nghe một lần, dừng lại, rồi nhại lại cùng nhịp.',
          startSeconds: index * 4,
          endSeconds: index * 4 + 4,
        })),
      },
    ],
    quiz: [
      {
        id: `d${seed.day}-quiz-vocab`,
        type: 'multiple-choice',
        promptVi: `“${seed.vocabulary[0]?.[0]}” nghĩa là gì?`,
        choices: [correctQuizAnswer, 'xin lỗi', 'ngày mai'].filter((item, index, arr) => arr.indexOf(item) === index),
        correctAnswer: correctQuizAnswer,
        explanationVi: `“${seed.vocabulary[0]?.[0]}” = “${correctQuizAnswer}”.`,
      },
      {
        id: `d${seed.day}-quiz-speaking`,
        type: 'short-answer',
        promptVi: seed.speakingTask,
        correctAnswer: seed.examples[0]?.[0] ?? seed.pattern,
        explanationVi: 'Chỉ cần nói câu ngắn, đúng ý, rõ nhịp. Không cần nói nhanh.',
      },
    ],
    commonMistakesVi: [
      {
        id: `d${seed.day}-mistake-1`,
        mistakeVi: seed.mistake.vi,
        wrongEn: seed.mistake.wrong,
        correctEn: seed.mistake.correct,
        explanationVi: seed.mistake.explanation,
      },
    ],
    review: {
      srsDays: [1, 3, 7],
      quickReviewPrompts: [
        `Ôn sau 1 ngày: nói lại mẫu “${seed.pattern}”.`,
        `Ôn sau 3 ngày: nói lại 2 từ chính: ${seed.vocabulary.slice(0, 2).map(([term]) => term).join(', ')}.`,
        `Ôn sau 7 ngày: ${seed.speakingTask}`,
      ],
      masteryCriteriaVi: [
        'Nhớ ít nhất 3 từ/cụm chính.',
        'Nói được mẫu câu chính với tốc độ chậm.',
        'Làm đúng ít nhất 1 quiz và hoàn thành shadowing ngắn.',
      ],
    },
    contentMaturity: 'ready',
    migration: {
      legacyLessonId: `foundation48-day-${seed.day}`,
      legacySourceFile: 'apps/web/src/features/foundation48/foundation48Data.ts',
      migrationStatus: 'mapped-from-legacy',
      notesVi: [
        `${stage.title} được chuẩn hoá thành tuyến học chính của PooEnglish.`,
        'Dữ liệu này là additive: chưa thay thế renderer Foundatừ vựngữ pháprogress hiện tại.',
      ],
    },
  };
}

export const foundation48PrimaryDayLessons: PooLesson[] = daySeeds.map(makeLesson);

export const foundation48PrimaryFirst16Lessons = foundation48PrimaryDayLessons.filter((lesson) => {
  const match = lesson.id.match(/foundation48-day-(\d+)-primary/);
  const day = match ? Number(match[1]) : 0;
  return day >= 1 && day <= 16;
});

export function getFoundation48PrimaryLesson(dayNumber: number) {
  return foundation48PrimaryDayLessons.find((lesson) => lesson.id === `foundation48-day-${String(dayNumber).padStart(2, '0')}-primary`);
}
