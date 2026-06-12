import type { PooLessonLevel } from '../lessons/pooLessonTypes';

export type PooA0A1DialogueLine = {
  speaker: string;
  en: string;
  vi: string;
};

export type PooA0A1DialogueVocabulary = {
  term: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
};

export type PooA0A1DialoguePattern = {
  pattern: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
};

export type PooA0A1DialogueQuizItem = {
  questionVi: string;
  choices: string[];
  correctAnswer: string;
  explanationVi: string;
};

export type PooA0A1DialogueAttachment = {
  recommendedLessonIds: string[];
  foundation48DayNumbers: number[];
  notesVi: string;
};

export type PooA0A1Dialogue = {
  id: string;
  title: string;
  level: Extract<PooLessonLevel, 'A0' | 'A1'>;
  situationVi: string;
  characters: string[];
  lines: PooA0A1DialogueLine[];
  vocabulary: PooA0A1DialogueVocabulary[];
  usefulPatterns: PooA0A1DialoguePattern[];
  shadowingSentences: string[];
  quiz: PooA0A1DialogueQuizItem[];
  commonMistakesVi: string[];
  tags: string[];
  attachment: PooA0A1DialogueAttachment;
};

const attach = (days: number[], notesVi: string): PooA0A1DialogueAttachment => ({
  foundation48DayNumbers: days,
  recommendedLessonIds: days.map((day) => `foundation48-day-${String(day).padStart(2, '0')}-primary`),
  notesVi,
});

export const pooA0A1Dialogues: PooA0A1Dialogue[] = [
  {
    id: 'a0-dialogue-001-morning-greeting',
    title: 'Good Morning',
    level: 'A0',
    situationVi: 'Hai người gặp nhau vào buổi sáng.',
    characters: ['Anna', 'Ben'],
    lines: [
      { speaker: 'Anna', en: 'Good morning, Ben.', vi: 'Chào buổi sáng, Ben.' },
      { speaker: 'Ben', en: 'Good morning, Anna.', vi: 'Chào buổi sáng, Anna.' },
      { speaker: 'Anna', en: 'How are you?', vi: 'Bạn khỏe không?' },
      { speaker: 'Ben', en: 'I am good, thank you.', vi: 'Mình khỏe, cảm ơn bạn.' },
    ],
    vocabulary: [
      { term: 'good morning', meaningVi: 'chào buổi sáng', exampleEn: 'Good morning, Mom.', exampleVi: 'Chào buổi sáng, mẹ.' },
      { term: 'how', meaningVi: 'như thế nào', exampleEn: 'How are you?', exampleVi: 'Bạn khỏe không?' },
      { term: 'thank you', meaningVi: 'cảm ơn', exampleEn: 'Thank you, Anna.', exampleVi: 'Cảm ơn, Anna.' },
    ],
    usefulPatterns: [
      { pattern: 'Good morning, + name.', meaningVi: 'Chào buổi sáng ai đó.', exampleEn: 'Good morning, Ben.', exampleVi: 'Chào buổi sáng, Ben.' },
      { pattern: 'I am + feeling.', meaningVi: 'Nói mình đang cảm thấy thế nào.', exampleEn: 'I am good.', exampleVi: 'Mình khỏe.' },
    ],
    shadowingSentences: ['Good morning, Ben.', 'How are you?', 'I am good, thank you.'],
    quiz: [{ questionVi: '“Good morning” nghĩa là gì?', choices: ['Chào buổi sáng', 'Tạm biệt', 'Chúc ngủ ngon'], correctAnswer: 'Chào buổi sáng', explanationVi: '“Good morning” dùng để chào vào buổi sáng.' }],
    commonMistakesVi: ['Không nói “I good”; hãy nói “I am good.”', '“Thank you” viết tách hai từ.'],
    tags: ['greeting', 'morning', 'feeling'],
    attachment: attach([1], 'Phù hợp Day 1 về chào hỏi cơ bản.'),
  },
  {
    id: 'a0-dialogue-002-asking-name',
    title: 'What Is Your Name?',
    level: 'A0',
    situationVi: 'Hai bạn mới gặp hỏi tên nhau.',
    characters: ['Minh', 'Lucy'],
    lines: [
      { speaker: 'Minh', en: 'Hi. What is your name?', vi: 'Chào. Bạn tên là gì?' },
      { speaker: 'Lucy', en: 'My name is Lucy.', vi: 'Mình tên là Lucy.' },
      { speaker: 'Lucy', en: 'What is your name?', vi: 'Bạn tên là gì?' },
      { speaker: 'Minh', en: 'My name is Minh.', vi: 'Mình tên là Minh.' },
    ],
    vocabulary: [
      { term: 'name', meaningVi: 'tên', exampleEn: 'My name is Lucy.', exampleVi: 'Tên mình là Lucy.' },
      { term: 'your', meaningVi: 'của bạn', exampleEn: 'What is your name?', exampleVi: 'Tên của bạn là gì?' },
      { term: 'my', meaningVi: 'của tôi', exampleEn: 'My name is Minh.', exampleVi: 'Tên mình là Minh.' },
    ],
    usefulPatterns: [
      { pattern: 'What is your name?', meaningVi: 'Hỏi tên người khác.', exampleEn: 'What is your name?', exampleVi: 'Bạn tên là gì?' },
      { pattern: 'My name is + name.', meaningVi: 'Giới thiệu tên.', exampleEn: 'My name is Lucy.', exampleVi: 'Mình tên là Lucy.' },
    ],
    shadowingSentences: ['What is your name?', 'My name is Lucy.', 'My name is Minh.'],
    quiz: [{ questionVi: 'Câu nào dùng để hỏi tên?', choices: ['What is your name?', 'How old are you?', 'Where are you from?'], correctAnswer: 'What is your name?', explanationVi: '“What is your name?” là câu hỏi tên cơ bản.' }],
    commonMistakesVi: ['Không nói “What your name?”; cần có “is”.', 'Tên riêng viết hoa: Lucy, Minh.'],
    tags: ['name', 'introduction'],
    attachment: attach([2], 'Phù hợp Day 2 về hỏi tên và giới thiệu tên.'),
  },
  {
    id: 'a0-dialogue-003-asking-age',
    title: 'How Old Are You?',
    level: 'A0',
    situationVi: 'Hai bạn hỏi tuổi nhau trong lớp.',
    characters: ['Tom', 'Mai'],
    lines: [
      { speaker: 'Tom', en: 'How old are you?', vi: 'Bạn bao nhiêu tuổi?' },
      { speaker: 'Mai', en: 'I am ten years old.', vi: 'Mình 10 tuổi.' },
      { speaker: 'Mai', en: 'How old are you?', vi: 'Bạn bao nhiêu tuổi?' },
      { speaker: 'Tom', en: 'I am eleven.', vi: 'Mình 11 tuổi.' },
    ],
    vocabulary: [
      { term: 'old', meaningVi: 'tuổi / cũ', exampleEn: 'How old are you?', exampleVi: 'Bạn bao nhiêu tuổi?' },
      { term: 'ten', meaningVi: 'số 10', exampleEn: 'I am ten.', exampleVi: 'Mình 10 tuổi.' },
      { term: 'eleven', meaningVi: 'số 11', exampleEn: 'I am eleven.', exampleVi: 'Mình 11 tuổi.' },
    ],
    usefulPatterns: [
      { pattern: 'How old are you?', meaningVi: 'Hỏi tuổi.', exampleEn: 'How old are you?', exampleVi: 'Bạn bao nhiêu tuổi?' },
      { pattern: 'I am + number + years old.', meaningVi: 'Nói tuổi đầy đủ.', exampleEn: 'I am ten years old.', exampleVi: 'Mình 10 tuổi.' },
    ],
    shadowingSentences: ['How old are you?', 'I am ten years old.', 'I am eleven.'],
    quiz: [{ questionVi: '“I am ten years old” nghĩa là gì?', choices: ['Mình 10 tuổi', 'Mình tên Ten', 'Mình khỏe'], correctAnswer: 'Mình 10 tuổi', explanationVi: '“years old” dùng để nói tuổi.' }],
    commonMistakesVi: ['Không nói “I have ten years”; nói “I am ten years old.”', 'Có thể nói ngắn “I am ten.” trong hội thoại thân mật.'],
    tags: ['age', 'numbers'],
    attachment: attach([4], 'Phù hợp Day 4 về số và tuổi.'),
  },
  {
    id: 'a0-dialogue-004-where-from',
    title: 'Where Are You From?',
    level: 'A0',
    situationVi: 'Hỏi quê quán khi mới làm quen.',
    characters: ['Lan', 'David'],
    lines: [
      { speaker: 'David', en: 'Where are you from?', vi: 'Bạn đến từ đâu?' },
      { speaker: 'Lan', en: 'I am from Vietnam.', vi: 'Mình đến từ Việt Nam.' },
      { speaker: 'Lan', en: 'Where are you from?', vi: 'Bạn đến từ đâu?' },
      { speaker: 'David', en: 'I am from Canada.', vi: 'Mình đến từ Canada.' },
    ],
    vocabulary: [
      { term: 'from', meaningVi: 'đến từ', exampleEn: 'I am from Vietnam.', exampleVi: 'Mình đến từ Việt Nam.' },
      { term: 'Vietnam', meaningVi: 'Việt Nam', exampleEn: 'Vietnam is my country.', exampleVi: 'Việt Nam là đất nước của mình.' },
      { term: 'Canada', meaningVi: 'Canada', exampleEn: 'I am from Canada.', exampleVi: 'Mình đến từ Canada.' },
    ],
    usefulPatterns: [
      { pattern: 'Where are you from?', meaningVi: 'Hỏi ai đó đến từ đâu.', exampleEn: 'Where are you from?', exampleVi: 'Bạn đến từ đâu?' },
      { pattern: 'I am from + place.', meaningVi: 'Nói mình đến từ đâu.', exampleEn: 'I am from Vietnam.', exampleVi: 'Mình đến từ Việt Nam.' },
    ],
    shadowingSentences: ['Where are you from?', 'I am from Vietnam.', 'I am from Canada.'],
    quiz: [{ questionVi: 'Điền đúng: I am ___ Vietnam.', choices: ['from', 'name', 'old'], correctAnswer: 'from', explanationVi: 'Dùng “from” để nói đến từ đâu.' }],
    commonMistakesVi: ['Không nói “I from Vietnam”; cần “am”.', 'Tên quốc gia viết hoa: Vietnam, Canada.'],
    tags: ['country', 'hometown'],
    attachment: attach([5], 'Phù hợp Day 5 về quê quán.'),
  },
  {
    id: 'a0-dialogue-005-job-introduction',
    title: 'I Am a Student',
    level: 'A0',
    situationVi: 'Giới thiệu nghề nghiệp hoặc vai trò đơn giản.',
    characters: ['Alex', 'Hoa'],
    lines: [
      { speaker: 'Alex', en: 'What do you do?', vi: 'Bạn làm nghề gì?' },
      { speaker: 'Hoa', en: 'I am a student.', vi: 'Mình là học sinh/sinh viên.' },
      { speaker: 'Hoa', en: 'What do you do?', vi: 'Bạn làm nghề gì?' },
      { speaker: 'Alex', en: 'I am a teacher.', vi: 'Mình là giáo viên.' },
    ],
    vocabulary: [
      { term: 'student', meaningVi: 'học sinh / sinh viên', exampleEn: 'I am a student.', exampleVi: 'Mình là học sinh/sinh viên.' },
      { term: 'teacher', meaningVi: 'giáo viên', exampleEn: 'She is a teacher.', exampleVi: 'Cô ấy là giáo viên.' },
      { term: 'do', meaningVi: 'làm', exampleEn: 'What do you do?', exampleVi: 'Bạn làm nghề gì?' },
    ],
    usefulPatterns: [
      { pattern: 'What do you do?', meaningVi: 'Hỏi nghề nghiệp.', exampleEn: 'What do you do?', exampleVi: 'Bạn làm nghề gì?' },
      { pattern: 'I am a/an + job.', meaningVi: 'Giới thiệu nghề nghiệp.', exampleEn: 'I am a teacher.', exampleVi: 'Mình là giáo viên.' },
    ],
    shadowingSentences: ['What do you do?', 'I am a student.', 'I am a teacher.'],
    quiz: [{ questionVi: 'Câu nào đúng?', choices: ['I am a student.', 'I am student.', 'I a student.'], correctAnswer: 'I am a student.', explanationVi: 'Với nghề nghiệp số ít thường cần “a/an”.' }],
    commonMistakesVi: ['Không bỏ “a” trước nghề nghiệp: “I am a teacher.”', 'Không nói “What you do?”; cần “What do you do?”'],
    tags: ['job', 'student', 'teacher'],
    attachment: attach([6], 'Phù hợp Day 6 về nghề nghiệp.'),
  },
  {
    id: 'a0-dialogue-006-family-members',
    title: 'This Is My Mother',
    level: 'A0',
    situationVi: 'Giới thiệu thành viên gia đình qua ảnh.',
    characters: ['Nina', 'Sam'],
    lines: [
      { speaker: 'Nina', en: 'This is my family.', vi: 'Đây là gia đình mình.' },
      { speaker: 'Sam', en: 'Who is this?', vi: 'Đây là ai?' },
      { speaker: 'Nina', en: 'This is my mother.', vi: 'Đây là mẹ mình.' },
      { speaker: 'Sam', en: 'She is nice.', vi: 'Cô ấy thật dễ mến.' },
    ],
    vocabulary: [
      { term: 'family', meaningVi: 'gia đình', exampleEn: 'This is my family.', exampleVi: 'Đây là gia đình mình.' },
      { term: 'mother', meaningVi: 'mẹ', exampleEn: 'This is my mother.', exampleVi: 'Đây là mẹ mình.' },
      { term: 'nice', meaningVi: 'dễ mến / tốt', exampleEn: 'She is nice.', exampleVi: 'Cô ấy dễ mến.' },
    ],
    usefulPatterns: [
      { pattern: 'This is my + family member.', meaningVi: 'Giới thiệu người thân.', exampleEn: 'This is my mother.', exampleVi: 'Đây là mẹ mình.' },
      { pattern: 'Who is this?', meaningVi: 'Hỏi đây là ai.', exampleEn: 'Who is this?', exampleVi: 'Đây là ai?' },
    ],
    shadowingSentences: ['This is my family.', 'Who is this?', 'This is my mother.'],
    quiz: [{ questionVi: '“Who is this?” dùng để hỏi gì?', choices: ['Đây là ai?', 'Bạn ở đâu?', 'Bạn bao nhiêu tuổi?'], correctAnswer: 'Đây là ai?', explanationVi: '“Who” dùng để hỏi người.' }],
    commonMistakesVi: ['Không nói “This my mother”; cần “is”.', '“Mother” trang trọng hơn “mom”.'],
    tags: ['family', 'mother'],
    attachment: attach([9], 'Phù hợp Day 9 về gia đình.'),
  },
  {
    id: 'a0-dialogue-007-my-brother',
    title: 'My Brother Is Funny',
    level: 'A0',
    situationVi: 'Nói đơn giản về anh/em trai.',
    characters: ['Kim', 'Leo'],
    lines: [
      { speaker: 'Leo', en: 'Do you have a brother?', vi: 'Bạn có anh/em trai không?' },
      { speaker: 'Kim', en: 'Yes, I do.', vi: 'Có.' },
      { speaker: 'Leo', en: 'What is he like?', vi: 'Anh ấy như thế nào?' },
      { speaker: 'Kim', en: 'He is funny.', vi: 'Anh ấy vui tính.' },
    ],
    vocabulary: [
      { term: 'brother', meaningVi: 'anh/em trai', exampleEn: 'I have a brother.', exampleVi: 'Mình có một anh/em trai.' },
      { term: 'funny', meaningVi: 'vui tính', exampleEn: 'He is funny.', exampleVi: 'Anh ấy vui tính.' },
      { term: 'have', meaningVi: 'có', exampleEn: 'I have a brother.', exampleVi: 'Mình có một anh/em trai.' },
    ],
    usefulPatterns: [
      { pattern: 'Do you have a + noun?', meaningVi: 'Hỏi bạn có gì/ai không.', exampleEn: 'Do you have a brother?', exampleVi: 'Bạn có anh/em trai không?' },
      { pattern: 'He is + adjective.', meaningVi: 'Miêu tả một nam giới.', exampleEn: 'He is funny.', exampleVi: 'Anh ấy vui tính.' },
    ],
    shadowingSentences: ['Do you have a brother?', 'Yes, I do.', 'He is funny.'],
    quiz: [{ questionVi: 'Câu trả lời ngắn cho “Do you have a brother?” là gì?', choices: ['Yes, I do.', 'Yes, I am.', 'Yes, I have.'], correctAnswer: 'Yes, I do.', explanationVi: 'Câu hỏi dùng “Do”, trả lời ngắn dùng “do”.' }],
    commonMistakesVi: ['Không trả lời “Yes, I am” cho câu hỏi “Do you have...?”', 'Dùng “he” cho nam, “she” cho nữ.'],
    tags: ['family', 'brother', 'description'],
    attachment: attach([10], 'Phù hợp Day 10 về gia đình và miêu tả ngắn.'),
  },
  {
    id: 'a0-dialogue-008-friends',
    title: 'This Is My Friend',
    level: 'A0',
    situationVi: 'Giới thiệu bạn của mình với người khác.',
    characters: ['Mai', 'Jack', 'Emma'],
    lines: [
      { speaker: 'Mai', en: 'Jack, this is my friend, Emma.', vi: 'Jack, đây là bạn của mình, Emma.' },
      { speaker: 'Jack', en: 'Hi, Emma. Nice to meet you.', vi: 'Chào Emma. Rất vui được gặp bạn.' },
      { speaker: 'Emma', en: 'Nice to meet you too.', vi: 'Mình cũng rất vui được gặp bạn.' },
      { speaker: 'Mai', en: 'Emma is very kind.', vi: 'Emma rất tốt bụng.' },
    ],
    vocabulary: [
      { term: 'friend', meaningVi: 'bạn bè', exampleEn: 'This is my friend.', exampleVi: 'Đây là bạn của mình.' },
      { term: 'meet', meaningVi: 'gặp', exampleEn: 'Nice to meet you.', exampleVi: 'Rất vui được gặp bạn.' },
      { term: 'kind', meaningVi: 'tốt bụng', exampleEn: 'Emma is kind.', exampleVi: 'Emma tốt bụng.' },
    ],
    usefulPatterns: [
      { pattern: 'This is my friend, + name.', meaningVi: 'Giới thiệu bạn mình.', exampleEn: 'This is my friend, Emma.', exampleVi: 'Đây là bạn của mình, Emma.' },
      { pattern: 'Nice to meet you too.', meaningVi: 'Đáp lại lời chào làm quen.', exampleEn: 'Nice to meet you too.', exampleVi: 'Mình cũng rất vui được gặp bạn.' },
    ],
    shadowingSentences: ['This is my friend, Emma.', 'Nice to meet you.', 'Nice to meet you too.'],
    quiz: [{ questionVi: 'Khi đáp lại “Nice to meet you”, nên nói gì?', choices: ['Nice to meet you too.', 'Good night.', 'I am ten.'], correctAnswer: 'Nice to meet you too.', explanationVi: 'Thêm “too” để nói “mình cũng vậy”.' }],
    commonMistakesVi: ['Không nói “Nice meet you”; cần “to”.', '“Too” ở cuối câu nghĩa là “cũng”.'],
    tags: ['friends', 'introduction'],
    attachment: attach([11], 'Phù hợp Day 11 về bạn bè.'),
  },
  {
    id: 'a0-dialogue-009-hobbies-music',
    title: 'I Like Music',
    level: 'A0',
    situationVi: 'Hai bạn nói về sở thích nghe nhạc.',
    characters: ['Sofia', 'Nam'],
    lines: [
      { speaker: 'Sofia', en: 'What do you like?', vi: 'Bạn thích gì?' },
      { speaker: 'Nam', en: 'I like music.', vi: 'Mình thích âm nhạc.' },
      { speaker: 'Nam', en: 'Do you like music?', vi: 'Bạn có thích âm nhạc không?' },
      { speaker: 'Sofia', en: 'Yes, I do. I like pop music.', vi: 'Có. Mình thích nhạc pop.' },
    ],
    vocabulary: [
      { term: 'like', meaningVi: 'thích', exampleEn: 'I like music.', exampleVi: 'Mình thích âm nhạc.' },
      { term: 'music', meaningVi: 'âm nhạc', exampleEn: 'Do you like music?', exampleVi: 'Bạn có thích âm nhạc không?' },
      { term: 'pop music', meaningVi: 'nhạc pop', exampleEn: 'I like pop music.', exampleVi: 'Mình thích nhạc pop.' },
    ],
    usefulPatterns: [
      { pattern: 'What do you like?', meaningVi: 'Hỏi sở thích chung.', exampleEn: 'What do you like?', exampleVi: 'Bạn thích gì?' },
      { pattern: 'I like + noun.', meaningVi: 'Nói sở thích.', exampleEn: 'I like music.', exampleVi: 'Mình thích âm nhạc.' },
    ],
    shadowingSentences: ['What do you like?', 'I like music.', 'Do you like music?'],
    quiz: [{ questionVi: '“I like music” nghĩa là gì?', choices: ['Mình thích âm nhạc', 'Mình chơi nhạc', 'Mình không thích nhạc'], correctAnswer: 'Mình thích âm nhạc', explanationVi: '“Like” nghĩa là thích.' }],
    commonMistakesVi: ['Không nói “I like listen music” ở mức cơ bản; nói “I like music.”', 'Câu hỏi Yes/No dùng “Do you like...?”'],
    tags: ['hobbies', 'music'],
    attachment: attach([13], 'Phù hợp Day 13 về sở thích.'),
  },
  {
    id: 'a0-dialogue-010-hobbies-football',
    title: 'Do You Like Football?',
    level: 'A0',
    situationVi: 'Rủ nói chuyện về sở thích thể thao.',
    characters: ['Peter', 'An'],
    lines: [
      { speaker: 'Peter', en: 'Do you like football?', vi: 'Bạn có thích bóng đá không?' },
      { speaker: 'An', en: 'Yes, I do.', vi: 'Có.' },
      { speaker: 'Peter', en: 'Who do you play with?', vi: 'Bạn chơi với ai?' },
      { speaker: 'An', en: 'I play with my friends.', vi: 'Mình chơi với bạn bè.' },
    ],
    vocabulary: [
      { term: 'football', meaningVi: 'bóng đá', exampleEn: 'I like football.', exampleVi: 'Mình thích bóng đá.' },
      { term: 'play', meaningVi: 'chơi', exampleEn: 'I play with my friends.', exampleVi: 'Mình chơi với bạn bè.' },
      { term: 'with', meaningVi: 'với', exampleEn: 'I play with Tom.', exampleVi: 'Mình chơi với Tom.' },
    ],
    usefulPatterns: [
      { pattern: 'Do you like + noun?', meaningVi: 'Hỏi ai đó có thích gì không.', exampleEn: 'Do you like football?', exampleVi: 'Bạn có thích bóng đá không?' },
      { pattern: 'I play with + person.', meaningVi: 'Nói mình chơi với ai.', exampleEn: 'I play with my friends.', exampleVi: 'Mình chơi với bạn bè.' },
    ],
    shadowingSentences: ['Do you like football?', 'Yes, I do.', 'I play with my friends.'],
    quiz: [{ questionVi: '“with” trong “I play with my friends” nghĩa là gì?', choices: ['với', 'ở', 'từ'], correctAnswer: 'với', explanationVi: '“With” nghĩa là “với”.' }],
    commonMistakesVi: ['Không trả lời “Yes, I like” cho “Do you like...?”; tự nhiên hơn: “Yes, I do.”', '“Friends” số nhiều khi nói bạn bè nói chung.'],
    tags: ['hobbies', 'football', 'friends'],
    attachment: attach([14], 'Phù hợp Day 14 về sở thích và hoạt động.'),
  },
  {
    id: 'a1-dialogue-011-breakfast-food',
    title: 'What Do You Want for Breakfast?',
    level: 'A1',
    situationVi: 'Hỏi muốn ăn gì cho bữa sáng.',
    characters: ['Mom', 'Ben'],
    lines: [
      { speaker: 'Mom', en: 'What do you want for breakfast?', vi: 'Con muốn ăn gì cho bữa sáng?' },
      { speaker: 'Ben', en: 'I want bread and eggs.', vi: 'Con muốn bánh mì và trứng.' },
      { speaker: 'Mom', en: 'Do you want milk?', vi: 'Con có muốn sữa không?' },
      { speaker: 'Ben', en: 'Yes, please.', vi: 'Có ạ.' },
    ],
    vocabulary: [
      { term: 'breakfast', meaningVi: 'bữa sáng', exampleEn: 'I want bread for breakfast.', exampleVi: 'Mình muốn bánh mì cho bữa sáng.' },
      { term: 'bread', meaningVi: 'bánh mì', exampleEn: 'I want bread.', exampleVi: 'Mình muốn bánh mì.' },
      { term: 'eggs', meaningVi: 'trứng', exampleEn: 'I want eggs.', exampleVi: 'Mình muốn trứng.' },
    ],
    usefulPatterns: [
      { pattern: 'What do you want for + meal?', meaningVi: 'Hỏi muốn ăn gì cho bữa nào.', exampleEn: 'What do you want for breakfast?', exampleVi: 'Bạn muốn ăn gì cho bữa sáng?' },
      { pattern: 'I want + food.', meaningVi: 'Nói món mình muốn.', exampleEn: 'I want bread and eggs.', exampleVi: 'Mình muốn bánh mì và trứng.' },
    ],
    shadowingSentences: ['What do you want for breakfast?', 'I want bread and eggs.', 'Yes, please.'],
    quiz: [{ questionVi: 'Câu nào lịch sự khi đồng ý nhận đồ ăn/uống?', choices: ['Yes, please.', 'No want.', 'Give me.'], correctAnswer: 'Yes, please.', explanationVi: '“Yes, please” là cách đồng ý lịch sự.' }],
    commonMistakesVi: ['Không nói cụt “Give me milộ trình huống lịch sự.', '“Breakfast” không viết thành “break fast” khi là danh từ bữa sáng.'],
    tags: ['food', 'breakfast'],
    attachment: attach([25], 'Phù hợp Day 25 về đồ ăn.'),
  },
  {
    id: 'a1-dialogue-012-ordering-water',
    title: 'Can I Have Water?',
    level: 'A1',
    situationVi: 'Gọi nước ở quán cà phê.',
    characters: ['Customer', 'Server'],
    lines: [
      { speaker: 'Server', en: 'Hello. What would you like?', vi: 'Xin chào. Bạn muốn dùng gì?' },
      { speaker: 'Customer', en: 'Can I have water, please?', vi: 'Cho tôi nước lọc được không?' },
      { speaker: 'Server', en: 'Sure. Cold or warm?', vi: 'Được. Lạnh hay ấm?' },
      { speaker: 'Customer', en: 'Cold, please.', vi: 'Lạnh, làm ơn.' },
    ],
    vocabulary: [
      { term: 'water', meaningVi: 'nước', exampleEn: 'Can I have water?', exampleVi: 'Cho tôi nước được không?' },
      { term: 'cold', meaningVi: 'lạnh', exampleEn: 'Cold, please.', exampleVi: 'Lạnh, làm ơn.' },
      { term: 'warm', meaningVi: 'ấm', exampleEn: 'Warm water, please.', exampleVi: 'Nước ấm, làm ơn.' },
    ],
    usefulPatterns: [
      { pattern: 'Can I have + item, please?', meaningVi: 'Xin/gọi món lịch sự.', exampleEn: 'Can I have water, please?', exampleVi: 'Cho tôi nước được không?' },
      { pattern: 'Cold or warm?', meaningVi: 'Hỏi lựa chọn lạnh hay ấm.', exampleEn: 'Cold or warm?', exampleVi: 'Lạnh hay ấm?' },
    ],
    shadowingSentences: ['What would you like?', 'Can I have water, please?', 'Cold, please.'],
    quiz: [{ questionVi: 'Cách gọi nước lịch sự là gì?', choices: ['Can I have water, please?', 'Water now.', 'I water.'], correctAnswer: 'Can I have water, please?', explanationVi: '“Can I have..., please?” là mẫu lịch sự khi gọi món.' }],
    commonMistakesVi: ['Không nói “I want water” quá thẳng trong quán; “Can I have water, please?” tự nhiên hơn.', '“Please” thường đặt cuối câu để tăng lịch sự.'],
    tags: ['drink', 'cafe', 'ordering'],
    attachment: attach([26], 'Phù hợp Day 26 về gọi nước.'),
  },
  {
    id: 'a1-dialogue-013-ordering-coffee',
    title: 'A Small Coffee, Please',
    level: 'A1',
    situationVi: 'Gọi cà phê size nhỏ.',
    characters: ['Barista', 'Mia'],
    lines: [
      { speaker: 'Barista', en: 'Hi. What can I get for you?', vi: 'Chào. Tôi có thể lấy gì cho bạn?' },
      { speaker: 'Mia', en: 'A small coffee, please.', vi: 'Một cà phê nhỏ, làm ơn.' },
      { speaker: 'Barista', en: 'Hot or iced?', vi: 'Nóng hay đá?' },
      { speaker: 'Mia', en: 'Iced, please.', vi: 'Đá, làm ơn.' },
    ],
    vocabulary: [
      { term: 'coffee', meaningữ phápleEn: 'A coffee, please.', exampleVi: 'Một cà phê, làm ơn.' },
      { term: 'small', meaningVi: 'nhỏ', exampleEn: 'A small coffee, please.', exampleVi: 'Một cà phê nhỏ, làm ơn.' },
      { term: 'iced', meaningVi: 'có đá', exampleEn: 'Iced, please.', exampleVi: 'Có đá, làm ơn.' },
    ],
    usefulPatterns: [
      { pattern: 'A + size + drink, please.', meaningVi: 'Gọi đồ uống theo kích cỡ.', exampleEn: 'A small coffee, please.', exampleVi: 'Một cà phê nhỏ, làm ơn.' },
      { pattern: 'What can I get for you?', meaningVi: 'Nhân viên hỏi khách muốn dùng gì.', exampleEn: 'What can I get for you?', exampleVi: 'Tôi có thể lấy gì cho bạn?' },
    ],
    shadowingSentences: ['What can I get for you?', 'A small coffee, please.', 'Iced, please.'],
    quiz: [{ questionVi: '“Iced coffee” là gì?', choices: ['cà phê đá', 'cà phê nóng', 'sữa nóng'], correctAnswer: 'cà phê đá', explanationVi: '“Iced” nghĩa là có đá/lạnh.' }],
    commonMistakesVi: ['Không nhầm “ice coffee” với cách tự nhiên hơn “iced coffee”.', 'Khi gọi món ngắn, thêm “please” để lịch sự.'],
    tags: ['drink', 'coffee', 'cafe'],
    attachment: attach([26], 'Mở rộng Day 26 về gọi đồ uống.'),
  },
  {
    id: 'a1-dialogue-014-buying-a-pen',
    title: 'How Much Is This Pen?',
    level: 'A1',
    situationVi: 'Mua bút ở cửa hàng.',
    characters: ['Customer', 'Shopkeeper'],
    lines: [
      { speaker: 'Customer', en: 'Excuse me. How much is this pen?', vi: 'Xin lỗi. Cây bút này bao nhiêu tiền?' },
      { speaker: 'Shopkeeper', en: 'It is two dollars.', vi: 'Nó giá 2 đô.' },
      { speaker: 'Customer', en: 'I will take it.', vi: 'Tôi sẽ lấy nó.' },
      { speaker: 'Shopkeeper', en: 'Thank you.', vi: 'Cảm ơn bạn.' },
    ],
    vocabulary: [
      { term: 'pen', meaningVi: 'bút', exampleEn: 'This pen is blue.', exampleVi: 'Cây bút này màu xanh.' },
      { term: 'how much', meaningVi: 'bao nhiêu tiền', exampleEn: 'How much is this pen?', exampleVi: 'Cây bút này bao nhiêu tiền?' },
      { term: 'take', meaningVi: 'lấy / mua', exampleEn: 'I will take it.', exampleVi: 'Tôi sẽ lấy nó.' },
    ],
    usefulPatterns: [
      { pattern: 'How much is this + noun?', meaningVi: 'Hỏi giá một món đồ.', exampleEn: 'How much is this pen?', exampleVi: 'Cây bút này bao nhiêu tiền?' },
      { pattern: 'I will take it.', meaningVi: 'Nói mình sẽ mua món đó.', exampleEn: 'I will take it.', exampleVi: 'Tôi sẽ lấy nó.' },
    ],
    shadowingSentences: ['How much is this pen?', 'It is two dollars.', 'I will take it.'],
    quiz: [{ questionVi: 'Câu nào dùng để hỏi giá?', choices: ['How much is this pen?', 'Where is this pen?', 'Who is this pen?'], correctAnswer: 'How much is this pen?', explanationVi: '“How much” dùng để hỏi giá.' }],
    commonMistakesVi: ['Không dùng “How many” để hỏi giá; dùng “How much”.', '“I will take it” tự nhiên khi quyết định mua tại cửa hàng.'],
    tags: ['shopping', 'price', 'school'],
    attachment: attach([27], 'Phù hợp Day 27 về mua đồ và hỏi giá.'),
  },
  {
    id: 'a1-dialogue-015-buying-a-shirt',
    title: 'Do You Have This in Blue?',
    level: 'A1',
    situationVi: 'Hỏi mua áo màu xanh.',
    characters: ['Lily', 'Assistant'],
    lines: [
      { speaker: 'Lily', en: 'Do you have this in blue?', vi: 'Bạn có cái này màu xanh không?' },
      { speaker: 'Assistant', en: 'Yes, we do.', vi: 'Có.' },
      { speaker: 'Lily', en: 'Can I try it on?', vi: 'Tôi thử được không?' },
      { speaker: 'Assistant', en: 'Of course.', vi: 'Tất nhiên rồi.' },
    ],
    vocabulary: [
      { term: 'blue', meaningVi: 'màu xanh', exampleEn: 'I like blue.', exampleVi: 'Mình thích màu xanh.' },
      { term: 'try on', meaningVi: 'thử đồ', exampleEn: 'Can I try it on?', exampleVi: 'Tôi thử nó được không?' },
      { term: 'of course', meaningVi: 'tất nhiên', exampleEn: 'Of course.', exampleVi: 'Tất nhiên rồi.' },
    ],
    usefulPatterns: [
      { pattern: 'Do you have this in + color?', meaningVi: 'Hỏi có món này màu khác không.', exampleEn: 'Do you have this in blue?', exampleVi: 'Bạn có cái này màu xanh không?' },
      { pattern: 'Can I try it on?', meaningVi: 'Xin thử quần áo.', exampleEn: 'Can I try it on?', exampleVi: 'Tôi thử được không?' },
    ],
    shadowingSentences: ['Do you have this in blue?', 'Can I try it on?', 'Of course.'],
    quiz: [{ questionVi: '“Try it on” thường dùng khi nào?', choices: ['Thử quần áo', 'Gọi nước', 'Hỏi đường'], correctAnswer: 'Thử quần áo', explanationVi: '“Try on” là thử mặc đồ.' }],
    commonMistakesVi: ['Không nói “try on it”; đúng là “try it on”.', '“This” dùng cho vật ở gần mình.'],
    tags: ['shopping', 'clothes', 'color'],
    attachment: attach([27], 'Mở rộng Day 27 về mua sắm.'),
  },
  {
    id: 'a1-dialogue-016-asking-directions-station',
    title: 'Where Is the Bus Stop?',
    level: 'A1',
    situationVi: 'Hỏi đường đến trạm xe buýt.',
    characters: ['Tourist', 'Local'],
    lines: [
      { speaker: 'Tourist', en: 'Excuse me. Where is the bus stop?', vi: 'Xin lỗi. Trạm xe buýt ở đâu?' },
      { speaker: 'Local', en: 'It is over there.', vi: 'Nó ở đằng kia.' },
      { speaker: 'Tourist', en: 'Is it far?', vi: 'Nó có xa không?' },
      { speaker: 'Local', en: 'No, it is near.', vi: 'Không, nó gần.' },
    ],
    vocabulary: [
      { term: 'bus stop', meaningVi: 'trạm xe buýt', exampleEn: 'Where is the bus stop?', exampleVi: 'Trạm xe buýt ở đâu?' },
      { term: 'far', meaningVi: 'xa', exampleEn: 'Is it far?', exampleVi: 'Nó có xa không?' },
      { term: 'near', meaningVi: 'gần', exampleEn: 'It is near.', exampleVi: 'Nó gần.' },
    ],
    usefulPatterns: [
      { pattern: 'Where is the + place?', meaningVi: 'Hỏi địa điểm ở đâu.', exampleEn: 'Where is the bus stop?', exampleVi: 'Trạm xe buýt ở đâu?' },
      { pattern: 'It is over there.', meaningVi: 'Nó ở đằng kia.', exampleEn: 'It is over there.', exampleVi: 'Nó ở đằng kia.' },
    ],
    shadowingSentences: ['Where is the bus stop?', 'It is over there.', 'No, it is near.'],
    quiz: [{ questionVi: '“near” trái nghĩa với từ nào?', choices: ['far', 'good', 'cold'], correctAnswer: 'far', explanationVi: '“Near” là gần, “far” là xa.' }],
    commonMistakesVi: ['Không quên “the” trong “the bus stop” khi nói về địa điểm cụ thể.', 'Bắt đầu bằng “Excuse me” khi hỏi người lạ để lịch sự.'],
    tags: ['directions', 'bus', 'travel'],
    attachment: attach([28], 'Phù hợp Day 28 về hỏi đường.'),
  },
  {
    id: 'a1-dialogue-017-turn-left',
    title: 'Turn Left',
    level: 'A1',
    situationVi: 'Nghe chỉ đường đơn giản.',
    characters: ['Nam', 'Officer'],
    lines: [
      { speaker: 'Nam', en: 'How do I get to the bank?', vi: 'Tôi đến ngân hàng như thế nào?' },
      { speaker: 'Officer', en: 'Go straight and turn left.', vi: 'Đi thẳng và rẽ trái.' },
      { speaker: 'Nam', en: 'Is it on the left?', vi: 'Nó ở bên trái phải không?' },
      { speaker: 'Officer', en: 'Yes, itừ vựng vậy.' },
    ],
    vocabulary: [
      { term: 'go straight', meaningVi: 'đi thẳng', exampleEn: 'Go straight.', exampleVi: 'Đi thẳng.' },
      { term: 'turn left', meaningVi: 'rẽ trái', exampleEn: 'Turn left.', exampleVi: 'Rẽ trái.' },
      { term: 'bank', meaningVi: 'ngân hàng', exampleEn: 'The bank is near.', exampleVi: 'Ngân hàng ở gần.' },
    ],
    usefulPatterns: [
      { pattern: 'How do I get to + place?', meaningVi: 'Hỏi cách đi đến một nơi.', exampleEn: 'How do I get to the bank?', exampleVi: 'Tôi đến ngân hàng như thế nào?' },
      { pattern: 'Go straight and turn left/right.', meaningVi: 'Chỉ đường cơ bản.', exampleEn: 'Go straight and turn left.', exampleVi: 'Đi thẳng và rẽ trái.' },
    ],
    shadowingSentences: ['How do I get to the bank?', 'Go straight and turn left.', 'Yes, it is.'],
    quiz: [{ questionVi: '“Turn left” nghĩa là gì?', choices: ['Rẽ trái', 'Rẽ phải', 'Đi thẳng'], correctAnswer: 'Rẽ trái', explanationVi: '“Left” là bên trái.' }],
    commonMistakesVi: ['Không nói “go to straight”; đúng là “go straight”.', '“Left” là trái, “right” là phải.'],
    tags: ['directions', 'left', 'bank'],
    attachment: attach([28], 'Mở rộng Day 28 về chỉ đường.'),
  },
  {
    id: 'a0-dialogue-018-in-class',
    title: 'Open Your Book',
    level: 'A0',
    situationVi: 'Giáo viên hướng dẫn trong lớp học.',
    characters: ['Teacher', 'Student'],
    lines: [
      { speaker: 'Teacher', en: 'Please open your book.', vi: 'Hãy mở sách của em.' },
      { speaker: 'Student', en: 'Which page?', vi: 'Trang nào ạ?' },
      { speaker: 'Teacher', en: 'Page ten, please.', vi: 'Trang 10 nhé.' },
      { speaker: 'Student', en: 'Okay, teacher.', vi: 'Vâng, thưa cô/thầy.' },
    ],
    vocabulary: [
      { term: 'open', meaningVi: 'mở', exampleEn: 'Open your book.', exampleVi: 'Mở sách của em.' },
      { term: 'book', meaningVi: 'sách', exampleEn: 'This is my book.', exampleVi: 'Đây là sách của em.' },
      { term: 'page', meaningVi: 'trang', exampleEn: 'Page ten.', exampleVi: 'Trang 10.' },
    ],
    usefulPatterns: [
      { pattern: 'Please + verb + your + noun.', meaningVi: 'Yêu cầu lịch sự.', exampleEn: 'Please open your book.', exampleVi: 'Hãy mở sách của em.' },
      { pattern: 'Which + noun?', meaningVi: 'Hỏi cái nào.', exampleEn: 'Which page?', exampleVi: 'Trang nào?' },
    ],
    shadowingSentences: ['Please open your book.', 'Which page?', 'Page ten, please.'],
    quiz: [{ questionVi: '“Which page?” nghĩa là gì?', choices: ['Trang nào?', 'Sách nào?', 'Ai vậy?'], correctAnswer: 'Trang nào?', explanationVi: '“Which” dùng để hỏi lựa chọn cụ thể.' }],
    commonMistakesVi: ['Không nói “Open book” trong tình huống cụ thể; tự nhiên hơn: “Open your book.”', '“Page ten” không cần “the” khi đọc số trang.'],
    tags: ['classroom', 'book', 'teacher'],
    attachment: attach([17], 'Phù hợp Day 17 về lớp học.'),
  },
  {
    id: 'a0-dialogue-019-borrow-pencil',
    title: 'Can I Borrow a Pencil?',
    level: 'A0',
    situationVi: 'Mượn bút chì trong lớp.',
    characters: ['Student A', 'Student B'],
    lines: [
      { speaker: 'Student A', en: 'Can I borrow a pencil?', vi: 'Mình mượn một cây bút chì được không?' },
      { speaker: 'Student B', en: 'Sure. Here you are.', vi: 'Được. Của bạn đây.' },
      { speaker: 'Student A', en: 'Thank you.', vi: 'Cảm ơn bạn.' },
      { speaker: 'Student B', en: 'You are welcome.', vi: 'Không có gì.' },
    ],
    vocabulary: [
      { term: 'borrow', meaningVi: 'mượn', exampleEn: 'Can I borrow a pencil?', exampleVi: 'Mình mượn bút chì được không?' },
      { term: 'pencil', meaningVi: 'bút chì', exampleEn: 'This is a pencil.', exampleVi: 'Đây là bút chì.' },
      { term: 'welcome', meaningVi: 'không có gì / chào mừng', exampleEn: 'You are welcome.', exampleVi: 'Không có gì.' },
    ],
    usefulPatterns: [
      { pattern: 'Can I borrow + item?', meaningVi: 'Xin mượn đồ.', exampleEn: 'Can I borrow a pencil?', exampleVi: 'Mình mượn bút chì được không?' },
      { pattern: 'Here you are.', meaningVi: 'Của bạn đây.', exampleEn: 'Here you are.', exampleVi: 'Của bạn đây.' },
    ],
    shadowingSentences: ['Can I borrow a pencil?', 'Here you are.', 'You are welcome.'],
    quiz: [{ questionVi: '“Here you are” dùng khi nào?', choices: ['Khi đưa đồ cho ai', 'Khi hỏi tuổi', 'Khi tạm biệt'], correctAnswer: 'Khi đưa đồ cho ai', explanationVi: 'Câu này nghĩa là “Của bạn đây”.' }],
    commonMistakesVi: ['Không nói “borrow me a pencil” khi muốn mượn; nói “Can I borrow a pencil?”', '“You are welcome” là đáp lại “Thank you”.'],
    tags: ['classroom', 'borrow', 'pencil'],
    attachment: attach([18], 'Phù hợp Day 18 về đồ dùng học tập và mượn đồ.'),
  },
  {
    id: 'a1-dialogue-020-ask-for-help',
    title: 'Can You Help Me?',
    level: 'A1',
    situationVi: 'Nhờ bạn giúp bài tập.',
    characters: ['Huy', 'Emma'],
    lines: [
      { speaker: 'Huy', en: 'Can you help me, Emma?', vi: 'Emma, bạn giúp mình được không?' },
      { speaker: 'Emma', en: 'Sure. What is the problem?', vi: 'Được. Vấn đề là gì?' },
      { speaker: 'Huy', en: 'I do not understand this question.', vi: 'Mình không hiểu câu hỏi này.' },
      { speaker: 'Emma', en: 'Let me see.', vi: 'Để mình xem.' },
    ],
    vocabulary: [
      { term: 'help', meaningVi: 'giúp đỡ', exampleEn: 'Can you help me?', exampleVi: 'Bạn giúp mình được không?' },
      { term: 'understand', meaningVi: 'hiểu', exampleEn: 'I do not understand.', exampleVi: 'Mình không hiểu.' },
      { term: 'question', meaningVi: 'câu hỏi', exampleEn: 'This question is hard.', exampleVi: 'Câu hỏi này khó.' },
    ],
    usefulPatterns: [
      { pattern: 'Can you help me?', meaningVi: 'Nhờ giúp đỡ.', exampleEn: 'Can you help me?', exampleVi: 'Bạn giúp mình được không?' },
      { pattern: 'I do not understand + noun.', meaningVi: 'Nói mình không hiểu điều gì.', exampleEn: 'I do not understand this question.', exampleVi: 'Mình không hiểu câu hỏi này.' },
    ],
    shadowingSentences: ['Can you help me?', 'What is the problem?', 'I do not understand this question.'],
    quiz: [{ questionVi: 'Câu nào dùng để nhờ giúp đỡ?', choices: ['Can you help me?', 'How old are you?', 'I like music.'], correctAnswer: 'Can you help me?', explanationVi: '“Can you help me?” là mẫu nhờ giúp đỡ rất thông dụng.' }],
    commonMistakesVi: ['Không nói “You helộ trình huống lịch sự; nói “Can you help me?”', '“Understand” không từ vựngữ “I”.'],
    tags: ['help', 'classroom', 'homework'],
    attachment: attach([20], 'Phù hợp Day 20 về nhờ giúp đỡ.'),
  },
  {
    id: 'a0-dialogue-021-thank-you-sorry',
    title: 'Thank You and Sorry',
    level: 'A0',
    situationVi: 'Cảm ơn và xin lộ trình huống đơn giản.',
    characters: ['Anna', 'Tom'],
    lines: [
      { speaker: 'Anna', en: 'Here is your bag.', vi: 'Túi của bạn đây.' },
      { speaker: 'Tom', en: 'Thank you.', vi: 'Cảm ơn bạn.' },
      { speaker: 'Anna', en: 'Oh, sorry. This is my bag.', vi: 'Ồ, xin lỗi. Đây là túi của mình.' },
      { speaker: 'Tom', en: 'No problem.', vi: 'Không sao.' },
    ],
    vocabulary: [
      { term: 'bag', meaningVi: 'túi/cặp', exampleEn: 'This is my bag.', exampleVi: 'Đây là túi của mình.' },
      { term: 'sorry', meaningVi: 'xin lỗi', exampleEn: 'Sorry, I am late.', exampleVi: 'Xin lỗi, mình đến muộn.' },
      { term: 'no problem', meaningVi: 'không sao', exampleEn: 'No problem.', exampleVi: 'Không sao.' },
    ],
    usefulPatterns: [
      { pattern: 'Here is your + noun.', meaningVi: 'Đưa lại đồ cho ai.', exampleEn: 'Here is your bag.', exampleVi: 'Túi của bạn đây.' },
      { pattern: 'No problem.', meaningVi: 'Không sao.', exampleEn: 'No problem.', exampleVi: 'Không sao.' },
    ],
    shadowingSentences: ['Here is your bag.', 'Thank you.', 'No problem.'],
    quiz: [{ questionVi: 'Đáp lại lời xin lỗi đơn giản có thể nói gì?', choices: ['No problem.', 'Good morning.', 'I am ten.'], correctAnswer: 'No problem.', explanationVi: '“No problem” nghĩa là “Không sao”.' }],
    commonMistakesVi: ['Không dùng “Sorry” để cảm ơn; “Sorry” là xin lỗi, “Thank you” là cảm ơn.', '“No problem” thân mật và tự nhiên.'],
    tags: ['thanks', 'sorry', 'polite'],
    attachment: attach([21], 'Phù hợp Day 21 về cảm ơn và xin lỗi.'),
  },
  {
    id: 'a1-dialogue-022-at-the-restaurant',
    title: 'I Would Like Noodles',
    level: 'A1',
    situationVi: 'Gọi món đơn giản ở nhà hàng.',
    characters: ['Waiter', 'Customer'],
    lines: [
      { speaker: 'Waiter', en: 'Are you ready to order?', vi: 'Bạn sẵn sàng gọi món chưa?' },
      { speaker: 'Customer', en: 'Yes. I would like noodles.', vi: 'Rồi. Tôi muốn mì.' },
      { speaker: 'Waiter', en: 'Anything to drink?', vi: 'Bạn muốn uống gì không?' },
      { speaker: 'Customer', en: 'Tea, please.', vi: 'Trà, làm ơn.' },
    ],
    vocabulary: [
      { term: 'order', meaningVi: 'gọi món / đặt hàng', exampleEn: 'I am ready to order.', exampleVi: 'Tôi sẵn sàng gọi món.' },
      { term: 'noodles', meaningVi: 'mì', exampleEn: 'I would like noodles.', exampleVi: 'Tôi muốn mì.' },
      { term: 'tea', meaningVi: 'trà', exampleEn: 'Tea, please.', exampleVi: 'Trà, làm ơn.' },
    ],
    usefulPatterns: [
      { pattern: 'I would like + food.', meaningVi: 'Gọi món lịch sự.', exampleEn: 'I would like noodles.', exampleVi: 'Tôi muốn mì.' },
      { pattern: 'Are you ready to order?', meaningVi: 'Hỏi khách đã sẵn sàng gọi món chưa.', exampleEn: 'Are you ready to order?', exampleVi: 'Bạn sẵn sàng gọi món chưa?' },
    ],
    shadowingSentences: ['Are you ready to order?', 'I would like noodles.', 'Tea, please.'],
    quiz: [{ questionVi: 'Mẫu nào lịch sự khi gọi món?', choices: ['I would like noodles.', 'I noodles.', 'Give noodles.'], correctAnswer: 'I would like noodles.', explanationVi: '“I would like...” là mẫu lịch sự khi gọi món.' }],
    commonMistakesVi: ['Không nói “I want noodlộ trìnhà hàng nếu muốn lịch sự hơn; dùng “I would like noodles.”', '“Noodles” thường dùng số nhiều.'],
    tags: ['food', 'restaurant', 'ordering'],
    attachment: attach([25], 'Mở rộng Day 25 về gọi đồ ăn.'),
  },
  {
    id: 'a1-dialogue-023-paying',
    title: 'Can I Pay by Card?',
    level: 'A1',
    situationVi: 'Thanh toán ở quán hoặc cửa hàng.',
    characters: ['Customer', 'Cashier'],
    lines: [
      { speaker: 'Customer', en: 'Can I pay by card?', vi: 'Tôi trả bằng thẻ được không?' },
      { speaker: 'Cashier', en: 'Yes, you can.', vi: 'Được.' },
      { speaker: 'Customer', en: 'How much is itừ vựng bao nhiêu tiền?' },
      { speaker: 'Cashier', en: 'It is five dollars.', vi: 'Năm đô.' },
    ],
    vocabulary: [
      { term: 'pay', meaningVi: 'trả tiền', exampleEn: 'Can I pay by card?', exampleVi: 'Tôi trả bằng thẻ được không?' },
      { term: 'card', meaningVi: 'thẻ', exampleEn: 'I pay by card.', exampleVi: 'Tôi trả bằng thẻ.' },
      { term: 'cashier', meaningVi: 'thu ngân', exampleEn: 'The cashier is friendly.', exampleVi: 'Thu ngân thân thiện.' },
    ],
    usefulPatterns: [
      { pattern: 'Can I pay by + method?', meaningVi: 'Hỏi cách thanh toán.', exampleEn: 'Can I pay by card?', exampleVi: 'Tôi trả bằng thẻ được không?' },
      { pattern: 'How much is it?', meaningVi: 'Hỏi tổng tiền.', exampleEn: 'How much is it?', exampleVi: 'Tổng bao nhiêu tiền?' },
    ],
    shadowingSentences: ['Can I pay by card?', 'How much is it?', 'It is five dollars.'],
    quiz: [{ questionVi: '“Pay by card” nghĩa là gì?', choices: ['Trả bằng thẻ', 'Trả bằng tiền mặt', 'Mua thẻ'], correctAnswer: 'Trả bằng thẻ', explanationVi: '“By card” nghĩa là bằng thẻ.' }],
    commonMistakesVi: ['Không nói “pay with card” sai hoàn toàn, nhưng “pay by card” rất tự nhiên.', '“How much is it?” hỏi tổng tiền, không hỏi số lượng.'],
    tags: ['shopping', 'payment', 'price'],
    attachment: attach([27], 'Mở rộng Day 27 về mua sắm và thanh toán.'),
  },
  {
    id: 'a1-dialogue-024-lost-in-school',
    title: 'Where Is Room 3?',
    level: 'A1',
    situationVi: 'Hỏi phòng học trong trường.',
    characters: ['New Student', 'Teacher'],
    lines: [
      { speaker: 'New Student', en: 'Excuse me. Where is room three?', vi: 'Xin lỗi. Phòng số 3 ở đâu ạ?' },
      { speaker: 'Teacher', en: 'It is next to the library.', vi: 'Nó ở cạnh thư viện.' },
      { speaker: 'New Student', en: 'Thank you, teacher.', vi: 'Em cảm ơn thầy/cô.' },
      { speaker: 'Teacher', en: 'You are welcome.', vi: 'Không có gì.' },
    ],
    vocabulary: [
      { term: 'room', meaningVi: 'phòng', exampleEn: 'Room three is near.', exampleVi: 'Phòng 3 ở gần.' },
      { term: 'library', meaningVi: 'thư viện', exampleEn: 'The library is big.', exampleVi: 'Thư viện lớn.' },
      { term: 'next to', meaningVi: 'bên cạnh', exampleEn: 'It is next to the library.', exampleVi: 'Nó ở cạnh thư viện.' },
    ],
    usefulPatterns: [
      { pattern: 'Where is room + number?', meaningVi: 'Hỏi phòng số mấy ở đâu.', exampleEn: 'Where is room three?', exampleVi: 'Phòng số 3 ở đâu?' },
      { pattern: 'It is next to + place.', meaningVi: 'Nói vị trí bên cạnh nơi nào.', exampleEn: 'It is next to the library.', exampleVi: 'Nó ở cạnh thư viện.' },
    ],
    shadowingSentences: ['Where is room three?', 'It is next to the library.', 'Thank you, teacher.'],
    quiz: [{ questionVi: '“Next to” nghĩa là gì?', choices: ['bên cạnh', 'bên trong', 'ở xa'], correctAnswer: 'bên cạnh', explanationVi: '“Next to” dùng để nói vị trí bên cạnh.' }],
    commonMistakesVi: ['Không nói “Where room three?”; cần “is”.', 'Khi hỏi người lạ/giáo viên, mở đầu bằng “Excuse me”.'],
    tags: ['school', 'directions', 'classroom'],
    attachment: attach([17], 'Mở rộng Day 17 về lớp học và hỏi vị trí.'),
  },
  {
    id: 'a0-dialogue-025-phone-number',
    title: 'What Is Your Phone Number?',
    level: 'A0',
    situationVi: 'Hỏi số điện thoại đơn giản.',
    characters: ['Leo', 'Nhi'],
    lines: [
      { speaker: 'Leo', en: 'What is your phone number?', vi: 'Số điện thoại của bạn là gì?' },
      { speaker: 'Nhi', en: 'It is 0901 234 567.', vi: 'Là 0901 234 567.' },
      { speaker: 'Leo', en: 'Can you say it again?', vi: 'Bạn nói lại được không?' },
      { speaker: 'Nhi', en: 'Sure.', vi: 'Được.' },
    ],
    vocabulary: [
      { term: 'phone number', meaningVi: 'số điện thoại', exampleEn: 'What is your phone number?', exampleVi: 'Số điện thoại của bạn là gì?' },
      { term: 'again', meaningVi: 'lại / lần nữa', exampleEn: 'Say it again, please.', exampleVi: 'Làm ơn nói lại lần nữa.' },
      { term: 'sure', meaningVi: 'được / chắc chắn', exampleEn: 'Sure.', exampleVi: 'Được.' },
    ],
    usefulPatterns: [
      { pattern: 'What is your phone number?', meaningVi: 'Hỏi số điện thoại.', exampleEn: 'What is your phone number?', exampleVi: 'Số điện thoại của bạn là gì?' },
      { pattern: 'Can you say it again?', meaningVi: 'Nhờ nói lại.', exampleEn: 'Can you say it again?', exampleVi: 'Bạn nói lại được không?' },
    ],
    shadowingSentences: ['What is your phone number?', 'Can you say it again?', 'Sure.'],
    quiz: [{ questionVi: 'Câu nào dùng để nhờ nói lại?', choices: ['Can you say it again?', 'Where are you from?', 'I like tea.'], correctAnswer: 'Can you say it again?', explanationVi: '“Again” nghĩa là lại/lần nữa.' }],
    commonMistakesVi: ['Không nói “repeat again” nếu muốn gọn; “say it again” tự nhiên hơn.', 'Số điện thoại đọc từng cụm số, chậm và rõ.'],
    tags: ['phone', 'numbers', 'repeat'],
    attachment: attach([4], 'Mở rộng Day 4 về số trong đời sống.'),
  },
  {
    id: 'a1-dialogue-026-weekend-plan',
    title: 'What Are You Doing This Weekend?',
    level: 'A1',
    situationVi: 'Hỏi kế hoạch cuối tuần đơn giản.',
    characters: ['Grace', 'Huy'],
    lines: [
      { speaker: 'Grace', en: 'What are you doing this weekend?', vi: 'Cuối tuần này bạn làm gì?' },
      { speaker: 'Huy', en: 'I am visiting my grandparents.', vi: 'Mình sẽ thăm ông bà.' },
      { speaker: 'Grace', en: 'That sounds nice.', vi: 'Nghe hay đó.' },
      { speaker: 'Huy', en: 'Yes, I am happy.', vi: 'Ừ, mình vui.' },
    ],
    vocabulary: [
      { term: 'weekend', meaningVi: 'cuối tuần', exampleEn: 'This weekend is busy.', exampleVi: 'Cuối tuần này bận.' },
      { term: 'visit', meaningVi: 'thăm', exampleEn: 'I visit my grandparents.', exampleVi: 'Mình thăm ông bà.' },
      { term: 'grandparents', meaningVi: 'ông bà', exampleEn: 'My grandparents are kind.', exampleVi: 'Ông bà mình tốt bụng.' },
    ],
    usefulPatterns: [
      { pattern: 'What are you doing this weekend?', meaningVi: 'Hỏi kế hoạch cuối tuần.', exampleEn: 'What are you doing this weekend?', exampleVi: 'Cuối tuần này bạn làm gì?' },
      { pattern: 'I am + verb-ing.', meaningVi: 'Nói kế hoạch gần.', exampleEn: 'I am visiting my grandparents.', exampleVi: 'Mình sẽ thăm ông bà.' },
    ],
    shadowingSentences: ['What are you doing this weekend?', 'I am visiting my grandparents.', 'That sounds nice.'],
    quiz: [{ questionVi: '“That sounds nice” nghĩa gần nhất là gì?', choices: ['Nghe hay đó', 'Nó quá xa', 'Tôi không biết'], correctAnswer: 'Nghe hay đó', explanationVi: 'Câu này dùng để phản hồi tích cực.' }],
    commonMistakesVi: ['Không nói “I visiting”; cần “I am visiting”.', '“Weekend” là cuối tuần, không phải ngày trong tuần.'],
    tags: ['weekend', 'family', 'plan'],
    attachment: attach([33, 40], 'Phù hợp giai đoạn sau về kế hoạch và cuối tuần.'),
  },
  {
    id: 'a1-dialogue-027-feeling-sick',
    title: 'I Feel Sick',
    level: 'A1',
    situationVi: 'Nói mình không khỏe và xin nghỉ.',
    characters: ['Student', 'Teacher'],
    lines: [
      { speaker: 'Student', en: 'Teacher, I feel sick.', vi: 'Thưa thầy/cô, em thấy không khỏe.' },
      { speaker: 'Teacher', en: 'Oh no. Do you need water?', vi: 'Ôi không. Em cần nước không?' },
      { speaker: 'Student', en: 'Yes, please.', vi: 'Có ạ.' },
      { speaker: 'Teacher', en: 'Sit down, please.', vi: 'Em ngồi xuống nhé.' },
    ],
    vocabulary: [
      { term: 'sick', meaningVi: 'ốm / bệnh', exampleEn: 'I feel sick.', exampleVi: 'Mình thấy không khỏe.' },
      { term: 'need', meaningVi: 'cần', exampleEn: 'I need water.', exampleVi: 'Mình cần nước.' },
      { term: 'sit down', meaningVi: 'ngồi xuống', exampleEn: 'Sit down, please.', exampleVi: 'Ngồi xuống nhé.' },
    ],
    usefulPatterns: [
      { pattern: 'I feel + adjective.', meaningVi: 'Nói cảm giác/sức khỏe.', exampleEn: 'I feel sick.', exampleVi: 'Mình thấy không khỏe.' },
      { pattern: 'Do you need + noun?', meaningVi: 'Hỏi ai đó có cần gì không.', exampleEn: 'Do you need water?', exampleVi: 'Bạn cần nước không?' },
    ],
    shadowingSentences: ['I feel sick.', 'Do you need water?', 'Sit down, please.'],
    quiz: [{ questionVi: '“I feel sick” nghĩa là gì?', choices: ['Mình thấy không khỏe', 'Mình thấy vui', 'Mình thích ăn'], correctAnswer: 'Mình thấy không khỏe', explanationVi: '“Sick” nghĩa là ốm/không khỏe.' }],
    commonMistakesVi: ['Không nói “I am feel sick”; đúng là “I feel sick.”', '“Need” đi trực tiếp với danh từ: “need water”.'],
    tags: ['health', 'classroom', 'help'],
    attachment: attach([20], 'Mở rộng Day 20 về nhờ giúp đỡ trong lớp.'),
  },
  {
    id: 'a0-dialogue-028-at-home',
    title: 'Where Is Dad?',
    level: 'A0',
    situationVi: 'Hỏi người thân đang ở đâu trong nhà.',
    characters: ['Child', 'Mom'],
    lines: [
      { speaker: 'Child', en: 'Mom, where is Dad?', vi: 'Mẹ ơi, bố ở đâu?' },
      { speaker: 'Mom', en: 'He is in the kitchen.', vi: 'Bố ở trong bếp.' },
      { speaker: 'Child', en: 'Is he cooking?', vi: 'Bố đang nấu ăn ạ?' },
      { speaker: 'Mom', en: 'Yes, he is.', vi: 'Đúng rồi.' },
    ],
    vocabulary: [
      { term: 'dad', meaningVi: 'bố', exampleEn: 'Dad is home.', exampleVi: 'Bố ở nhà.' },
      { term: 'kitchen', meaningVi: 'nhà bếp', exampleEn: 'He is in the kitchen.', exampleVi: 'Ông ấy ở trong bếp.' },
      { term: 'cooking', meaningVi: 'đang nấu ăn', exampleEn: 'He is cooking.', exampleVi: 'Ông ấy đang nấu ăn.' },
    ],
    usefulPatterns: [
      { pattern: 'Where is + person?', meaningVi: 'Hỏi ai đó ở đâu.', exampleEn: 'Where is Dad?', exampleVi: 'Bố ở đâu?' },
      { pattern: 'He/She is in the + room.', meaningVi: 'Nói ai đó ở trong phòng nào.', exampleEn: 'He is in the kitchen.', exampleVi: 'Bố ở trong bếp.' },
    ],
    shadowingSentences: ['Where is Dad?', 'He is in the kitchen.', 'Yes, he is.'],
    quiz: [{ questionVi: '“Kitchen” nghĩa là gì?', choices: ['nhà bếp', 'phòng ngủ', 'trường học'], correctAnswer: 'nhà bếp', explanationVi: '“Kitchen” là nhà bếp.' }],
    commonMistakesVi: ['Không nói “He in the kitchen”; cần “is”.', 'Với hành động đang diễn ra: “He is cooking.”'],
    tags: ['family', 'home', 'location'],
    attachment: attach([9, 10], 'Phù hợp Day 9-10 về gia đình và vị trí đơn giản.'),
  },
  {
    id: 'a1-dialogue-029-small-talk-weather',
    title: 'Nice Weather Today',
    level: 'A1',
    situationVi: 'Small talk về thời tiết khi gặp người quen.',
    characters: ['Ella', 'Phong'],
    lines: [
      { speaker: 'Ella', en: 'Hi, Phong. Nice weather today.', vi: 'Chào Phong. Hôm nay thời tiết đẹp nhỉ.' },
      { speaker: 'Phong', en: 'Yes, it is sunny.', vi: 'Ừ, trời nắng.' },
      { speaker: 'Ella', en: 'Do you want to walk?', vi: 'Bạn muốn đi bộ không?' },
      { speaker: 'Phong', en: 'Sure. Let us go.', vi: 'Được. Đi thôi.' },
    ],
    vocabulary: [
      { term: 'weather', meaningVi: 'thời tiết', exampleEn: 'Nice weather today.', exampleVi: 'Hôm nay thời tiết đẹp.' },
      { term: 'sunny', meaningVi: 'nắng', exampleEn: 'It is sunny.', exampleVi: 'Trời nắng.' },
      { term: 'walk', meaningVi: 'đi bộ', exampleEn: 'Do you want to walk?', exampleVi: 'Bạn muốn đi bộ không?' },
    ],
    usefulPatterns: [
      { pattern: 'Nice weather today.', meaningVi: 'Mở đầu small talk về thời tiết.', exampleEn: 'Nice weather today.', exampleVi: 'Hôm nay thời tiết đẹp nhỉ.' },
      { pattern: 'Do you want to + verb?', meaningVi: 'Rủ ai làm gì.', exampleEn: 'Do you want to walk?', exampleVi: 'Bạn muốn đi bộ không?' },
    ],
    shadowingSentences: ['Nice weather today.', 'It is sunny.', 'Let us go.'],
    quiz: [{ questionVi: '“Sunny” nghĩa là gì?', choices: ['nắng', 'mưa', 'lạnh'], correctAnswer: 'nắng', explanationVi: '“Sunny” dùng khi trời có nắng.' }],
    commonMistakesVi: ['Không nói “Today weather nice”; nói “Nice weather today.”', '“Let us go” khi nói nhanh thường là “Let’s go.”'],
    tags: ['small-talk', 'weather', 'walk'],
    attachment: attach([41], 'Phù hợp Chặng 6 về giao tiếp thật và small talk.'),
  },
  {
    id: 'a1-dialogue-030-making-an-appointment',
    title: 'Can We Meet at Three?',
    level: 'A1',
    situationVi: 'Hẹn gặp đơn giản.',
    characters: ['Sara', 'Minh'],
    lines: [
      { speaker: 'Sara', en: 'Can we meet today?', vi: 'Hôm nay chúng ta gặp nhau được không?' },
      { speaker: 'Minh', en: 'Yes. What time?', vi: 'Được. Mấy giờ?' },
      { speaker: 'Sara', en: 'Can we meet at từ vựng ta gặp lúc 3 giờ được không?' },
      { speaker: 'Minh', en: 'Yes, see you then.', vi: 'Được, gặp bạn lúc đó.' },
    ],
    vocabulary: [
      { term: 'meet', meaningVi: 'gặp', exampleEn: 'Can we meet today?', exampleVi: 'Hôm nay chúng ta gặp được không?' },
      { term: 'what time', meaningVi: 'mấy giờ', exampleEn: 'What time?', exampleVi: 'Mấy giờ?' },
      { term: 'then', meaningVi: 'lúc đó', exampleEn: 'See you then.', exampleVi: 'Gặp bạn lúc đó.' },
    ],
    usefulPatterns: [
      { pattern: 'Can we meet + time?', meaningVi: 'Hỏi/hẹn thời gian gặp.', exampleEn: 'Can we meet at three?', exampleVi: 'Chúng ta gặp lúc 3 giờ được không?' },
      { pattern: 'See you then.', meaningVi: 'Hẹn gặp lúc đó.', exampleEn: 'See you then.', exampleVi: 'Gặp bạn lúc đó.' },
    ],
    shadowingSentences: ['Can we meet today?', 'Can we meet at three?', 'See you then.'],
    quiz: [{ questionVi: '“See you then” nghĩa là gì?', choices: ['Gặp bạn lúc đó', 'Tôi không gặp bạn', 'Bạn ở đâu?'], correctAnswer: 'Gặp bạn lúc đó', explanationVi: '“Then” nghĩa là lúc đó.' }],
    commonMistakesVi: ['Không nói “meet at three o clock?” thiếu chủ ngữ khi muốn lịch sự; nói “Can we meet at three?”', 'Dùng “at” trước giờ: “at three”.'],
    tags: ['appointment', 'time', 'meeting'],
    attachment: attach([44], 'Phù hợp Chặng 6 về đặt lịch/hẹn gặp.'),
  },
];

export const pooA0A1DialogueCount = pooA0A1Dialogues.length;

export function getPooA0A1DialogueById(dialogueId: string | undefined | null) {
  return pooA0A1Dialogues.find((dialogue) => dialogue.id === dialogueId);
}

export function getPooA0A1DialoguesForFoundation48Day(dayNumber: number) {
  return pooA0A1Dialogues.filter((dialogue) => dialogue.attachment.foundation48DayNumbers.includes(dayNumber));
}

export function getPooA0A1DialoguesForLesson(lessonId: string | undefined | null) {
  if (!lessonId) return [];
  return pooA0A1Dialogues.filter((dialogue) => dialogue.attachment.recommendedLessonIds.includes(lessonId));
}

export default pooA0A1Dialogues;
