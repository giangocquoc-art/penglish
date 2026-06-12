export type PooShadowingSentenceLevel = 1 | 2;

export type PooShadowingFocus =
  | 'ending sound'
  | 'word stress'
  | 'linking'
  | 'intonation'
  | 'difficult sound for Vietnamese learners';

export type PooShadowingSentence = {
  id: string;
  sentence: string;
  meaningVi: string;
  level: PooShadowingSentenceLevel;
  focus: PooShadowingFocus;
  noteVi: string;
  tags: string[];
};

type ShadowingSeed = [
  sentence: string,
  meaningVi: string,
  focus: PooShadowingFocus,
  noteVi: string,
  tags: string[],
];

const level1Seeds: ShadowingSeed[] = [
  ['I am here.', 'Tôi ở đây.', 'ending sound', 'Bật nhẹ âm cuối /m/ trong “am” và /r/ mềm trong “here”.', ['be', 'daily']],
  ['You are kind.', 'Bạn thật tốt bụng.', 'ending sound', 'Giữ âm cuối /d/ trong “kind”, không đọc thành “kin”.', ['compliment', 'people']],
  ['This is mine.', 'Cái này là của tôi.', 'difficult sound for Vietnamese learners', 'Tập âm /ð/ trong “this”, đầu lưỡi chạm nhẹ răng.', ['basic', 'possession']],
  ['That is good.', 'Điều đó tốt.', 'difficult sound for Vietnamese learners', 'Tập âm /ð/ trong “that” và âm cuối /d/ trong “good”.', ['basic', 'feedback']],
  ['Please sit down.', 'Làm ơn ngồi xuống.', 'ending sound', 'Giữ âm cuối /t/ trong “sit” thật nhẹ rồi nối sang “down”.', ['classroom', 'polite']],
  ['Open your book.', 'Mở sách của bạn ra.', 'linking', 'Nối “open your” thành một cụm, không ngắt quá lâu.', ['classroom', 'instruction']],
  ['Close the door.', 'Đóng cửa lại.', 'difficult sound for Vietnamese learners', 'Âm /ð/ trong “the” cần mềm, không đọc thành /d/ quá mạnh.', ['classroom', 'home']],
  ['Take your time.', 'Cứ từ từ.', 'linking', 'Nối “take your” nhẹ; âm cuối /k/ trong “take” không bật quá mạnh.', ['daily', 'support']],
  ['See you soon.', 'Hẹn sớm gặp lại.', 'intonation', 'Xuống giọng nhẹ ở “soon” để câu nghe tự nhiên.', ['goodbye', 'daily']],
  ['Have a seat.', 'Mời ngồi.', 'linking', 'Nối “have a” thành /hæ-və/ thật mềm.', ['polite', 'classroom']],
  ['I like tea.', 'Tôi thích trà.', 'ending sound', 'Giữ âm cuối /k/ trong “like” trước khi nói “tea”.', ['food', 'drink']],
  ['I need help.', 'Tôi cần giúp đỡ.', 'ending sound', 'Bật âm cuối /d/ trong “need” và /p/ trong “help” thật nhẹ.', ['help', 'daily']],
  ['We are ready.', 'Chúng tôi sẵn sàng.', 'word stress', 'Nhấn âm đầu trong “ready”: REA-dy.', ['daily', 'state']],
  ['It is easy.', 'Nó dễ.', 'linking', 'Nối “It is” thành một nhịp ngắn /ɪ-tɪz/.', ['learning', 'basic']],
  ['It is hard.', 'Nó khó.', 'ending sound', 'Giữ âm cuối /t/ trong “it” và /d/ trong “hard”.', ['learning', 'basic']],
  ['I feel tired.', 'Tôi thấy mệt.', 'ending sound', 'Giữ âm cuối /l/ trong “feel” và /d/ trong “tired”.', ['feeling', 'health']],
  ['I feel fine.', 'Tôi thấy ổn.', 'intonation', 'Xuống giọng ở “fine” để câu khẳng định chắc hơn.', ['feeling', 'health']],
  ['She is nice.', 'Cô ấy dễ mến.', 'difficult sound for Vietnamese learners', 'Tập âm /ʃ/ trong “she”, môi hơi tròn.', ['people', 'description']],
  ['He is busy.', 'Anh ấy bận.', 'word stress', 'Nhấn âm đầu trong “busy”: BI-zy.', ['people', 'daily']],
  ['They are late.', 'Họ đến muộn.', 'difficult sound for Vietnamese learners', 'Tập âm /ð/ trong “they”, đừng đọc thành “day”.', ['people', 'time']],
  ['Come with me.', 'Đi cùng tôi.', 'linking', 'Nối “with me” nhẹ; chú ý âm /w/ trong “with”.', ['daily', 'movement']],
  ['Go straight ahead.', 'Đi thẳng phía trước.', 'word stress', 'Nhấn “straight” rõ; cụm “ahead” nhấn âm hai.', ['directions', 'travel']],
  ['Turn left here.', 'Rẽ trái ở đây.', 'ending sound', 'Giữ âm cuối /t/ trong “left” trước “here”.', ['directions', 'travel']],
  ['Turn right there.', 'Rẽ phải ở đó.', 'difficult sound for Vietnamese learners', 'Tập âm /r/ trong “right”, không đọc thành /l/.', ['directions', 'travel']],
  ['Stop right now.', 'Dừng ngay bây giờ.', 'ending sound', 'Bật nhẹ âm cuối /p/ trong “stop”.', ['instruction', 'daily']],
  ['Wait for me.', 'Đợi tôi với.', 'linking', 'Nối “wait for” nhẹ, không thêm nguyên âm sau /t/.', ['daily', 'movement']],
  ['Call me later.', 'Gọi tôi sau nhé.', 'word stress', 'Nhấn âm đầu trong “later”: LA-ter.', ['phone', 'daily']],
  ['Text me please.', 'Nhắn tin cho tôi nhé.', 'ending sound', 'Giữ cụm phụ âm cuối /kst/ trong “text” thật gọn.', ['phone', 'polite']],
  ['I am sorry.', 'Tôi xin lỗi.', 'word stress', 'Nhấn âm đầu trong “sorry”: SOR-ry.', ['polite', 'apology']],
  ['Thank you, Mom.', 'Cảm ơn mẹ.', 'difficult sound for Vietnamese learners', 'Tập âm /θ/ trong “thank”, không đọc thành “tank”.', ['thanks', 'family']],
  ['No problem.', 'Không sao.', 'word stress', 'Nhấn âm đầu trong “problem”: PRO-blem.', ['polite', 'reply']],
  ['Good morning.', 'Chào buổi sáng.', 'word stress', 'Nhấn “morning” ở âm đầu: MOR-ning.', ['greeting', 'daily']],
  ['Good night.', 'Chúc ngủ ngon.', 'ending sound', 'Giữ âm cuối /t/ trong “night” thật nhẹ.', ['greeting', 'night']],
  ['Nice to meet you.', 'Rất vui được gặp bạn.', 'linking', 'Nối “meet you” nhẹ thành âm gần /miːtʃuː/.', ['greeting', 'introduction']],
  ['What is this?', 'Đây là gì?', 'intonation', 'Lên giọng nhẹ ở cuối câu hỏi thông tin ngắn.', ['question', 'basic']],
  ['Who is that?', 'Đó là ai?', 'difficult sound for Vietnamese learners', 'Âm /ð/ trong “that” mềm, đầu lưỡi chạm nhẹ răng.', ['question', 'people']],
  ['Where are you?', 'Bạn đang ở đâu?', 'intonation', 'Giữ nhịp “Where are” liền nhau và xuống giọng cuối câu.', ['question', 'location']],
  ['How are you?', 'Bạn khỏe không?', 'intonation', 'Lên xuống tự nhiên: nhấn “How”, nhẹ ở “are you”.', ['greeting', 'question']],
  ['I am hungry.', 'Tôi đói.', 'word stress', 'Nhấn âm đầu trong “hungry”: HUN-gry.', ['food', 'feeling']],
  ['I am thirsty.', 'Tôi khát.', 'difficult sound for Vietnamese learners', 'Tập âm /θ/ trong “thirsty”, không đọc thành /t/.', ['drink', 'feeling']],
  ['Water is fine.', 'Nước là được rồi.', 'word stress', 'Nhấn âm đầu trong “water”: WA-ter.', ['drink', 'ordering']],
  ['Coffee, please.', 'Cà phê, làm ơn.', 'intonation', 'Xuống giọng mềm ở “please” để lịch sự.', ['drink', 'ordering']],
  ['I like rice.', 'Tôi thích cơm.', 'ending sound', 'Giữ âm cuối /k/ trong “like” trước “rice”.', ['food', 'like']],
  ['This tastes good.', 'Món này ngon.', 'ending sound', 'Giữ âm cuối /s/ trong “tastes” và /d/ trong “good”.', ['food', 'feedback']],
  ['I can try.', 'Tôi có thể thử.', 'ending sound', 'Giữ âm cuối /n/ trong “can”, không nuốt mất.', ['learning', 'confidence']],
  ['You can do it.', 'Bạn làm được mà.', 'linking', 'Nối “do it” thành một cụm /duː-wɪt/.', ['motivation', 'learning']],
  ['Let us practice.', 'Chúng ta luyện tập nhé.', 'word stress', 'Nhấn âm đầu trong “practice”: PRAC-tice.', ['learning', 'practice']],
  ['Speak more slowly.', 'Nói chậm hơn nhé.', 'word stress', 'Nhấn âm đầu trong “slowly”: SLOW-ly.', ['speaking', 'classroom']],
  ['Listen and repeat.', 'Nghe và lặp lại.', 'word stress', 'Nhấn âm đầu trong “listen” và âm hai trong “repeat”.', ['learning', 'shadowing']],
  ['Try one more.', 'Thử thêm một lần nữa.', 'linking', 'Nối “try one” nhẹ, giữ âm /w/ nhỏ giữa hai từ.', ['learning', 'practice']],
];

const level2Seeds: ShadowingSeed[] = [
  ['I am happy to see you today.', 'Tôi rất vui được gặp bạn hôm nay.', 'linking', 'Nối “happy từ vựng giọng ở “today”.', ['greeting', 'daily']],
  ['Can you help me with this?', 'Bạn giúp tôi việc này được không?', 'linking', 'Nối “help me” và “with this” thành hai cụm ngắn.', ['help', 'daily']],
  ['Please say that one more time.', 'Làm ơn nói lại điều đó một lần nữa.', 'difficult sound for Vietnamese learners', 'Tập âm /ð/ trong “that”, không đọc thành /d/.', ['classroom', 'repeat']],
  ['I do not understand this word.', 'Tôi không hiểu từ này.', 'word stress', 'Nhấn âm ba trong “understand”: un-der-STAND.', ['learning', 'vocabulary']],
  ['What does this sentence mean?', 'Câu này nghĩa là gì?', 'intonation', 'Xuống giọng ở “mean” vì đây là câu hỏi thông tin.', ['learning', 'question']],
  ['I want to learn English every day.', 'Tôi muốn học tiếng Anh mỗi ngày.', 'linking', 'Nối “want to” thành /wɑːn-tə/ thật gọn.', ['learning', 'habit']],
  ['My name is Anna Nguyen.', 'Tên tôi là Anna Nguyen.', 'word stress', 'Nhấn “name” và đọc tên riêng chậm, rõ.', ['introduction', 'name']],
  ['I am from a small town.', 'Tôi đến từ một thị trấn nhỏ.', 'ending sound', 'Giữ âm cuối /m/ trong “from” và /l/ trong “small”.', ['hometown', 'introduction']],
  ['My family lives in Da Nang.', 'Gia đình tôi sống ở Đà Nẵng.', 'ending sound', 'Giữ âm /z/ cuối trong “lives”.', ['family', 'hometown']],
  ['My brother is very funny.', 'Anh/em trai tôi rất vui tính.', 'word stress', 'Nhấn âm đầu trong “brother” và “funny”.', ['family', 'description']],
  ['She works at a coffee shop.', 'Cô ấy làm ở một quán cà phê.', 'ending sound', 'Giữ cụm cuối /ks/ trong “works”.', ['job', 'daily']],
  ['He studies English after school.', 'Anhọc tiếng Anh sau giờ học.', 'ending sound', 'Giữ âm cuối /z/ trong “studies”.', ['school', 'learning']],
  ['We play football on Sunday.', 'Chúng tôi chơi bóng đá vào Chủ nhật.', 'word stress', 'Nhấn âm đầu trong “football” và “Sunday”.', ['hobby', 'sports']],
  ['I like music and movies.', 'Tôi thích âm nhạc và phim.', 'ending sound', 'Giữ âm /s/ cuối trong “movies”.', ['hobby', 'music']],
  ['Do you want some water?', 'Bạn có muốn một ít nước không?', 'intonation', 'Lên giọng nhẹ cuối câu hỏi Yes/No.', ['drink', 'question']],
  ['Can I have a small coffee?', 'Cho tôi một cà phê nhỏ được không?', 'linking', 'Nối “Can I” thành một cụm /kə-naɪ/.', ['ordering', 'drink']],
  ['I would like iced tea, please.', 'Tôi muốn trà đá, làm ơn.', 'linking', 'Nối “would like” nhẹ và xuống giọng ở “please”.', ['ordering', 'drink']],
  ['How much is this shirt?', 'Cái áo này bao nhiêu tiền?', 'difficult sound for Vietnamese learners', 'Tập âm /ʃ/ trong “shirt”, môi hơi tròn.', ['shopping', 'price']],
  ['Do you have this in blue?', 'Bạn có cái này màu xanh không?', 'intonation', 'Lên giọng nhẹ ở cuối câu hỏi Yes/No.', ['shopping', 'color']],
  ['I will take this one.', 'Tôi sẽ lấy cái này.', 'linking', 'Nối “take this” nhẹ; chú ý âm /ð/ trong “this”.', ['shopping', 'buying']],
  ['Where is the bus stop?', 'Trạm xe buýt ở đâu?', 'ending sound', 'Giữ âm cuối /s/ trong “bus” trước “stop”.', ['directions', 'travel']],
  ['Go straight and turn left.', 'Đi thẳng và rẽ trái.', 'ending sound', 'Giữ âm cuối /t/ trong “straight” và “left”.', ['directions', 'travel']],
  ['The bank is next to the school.', 'Ngân hàng ở cạnh trường học.', 'difficult sound for Vietnamese learners', 'Tập hai âm /ð/ trong “the” nhẹ và nhanh.', ['directions', 'place']],
  ['Is it far from here?', 'Nó có xa đây không?', 'intonation', 'Lên giọng cuối câu hỏi Yes/No.', ['directions', 'question']],
  ['Please open your book now.', 'Làm ơn mở sách của bạn bây giờ.', 'linking', 'Nối “open your” thành một cụm mềm.', ['classroom', 'instruction']],
  ['Can I borrow your pencil?', 'Tôi mượn bút chì của bạn được không?', 'word stress', 'Nhấn âm đầu trong “borrow” và “pencil”.', ['classroom', 'borrow']],
  ['I forgot my notebook today.', 'Hôm nay tôi quên vở.', 'ending sound', 'Giữ âm cuối /t/ trong “forgot” và “notebook”.', ['classroom', 'school']],
  ['The homework is not hard.', 'Bài tập về nhà không khó.', 'ending sound', 'Giữ âm cuối /k/ trong “homework” và /d/ trong “hard”.', ['school', 'homework']],
  ['Thank you for your help.', 'Cảm ơn bạn đã giúp.', 'difficult sound for Vietnamese learners', 'Tập âm /θ/ trong “thank” và nối “for your”.', ['thanks', 'help']],
  ['I am sorry for being late.', 'Tôi xin lỗi vì đến muộn.', 'word stress', 'Nhấn âm đầu trong “sorry” và “being”.', ['apology', 'time']],
  ['That is not a problem.', 'Điều đó không sao.', 'difficult sound for Vietnamese learners', 'Tập âm /ð/ trong “that”, rồi xuống giọng ở “problem”.', ['reply', 'polite']],
  ['Have a nice day, Mom.', 'Chúc mẹ một ngày tốt lành.', 'linking', 'Nối “have a” thành một nhịp ngắn.', ['family', 'polite']],
  ['I feel tired after class.', 'Tôi thấy mệt sau giờ học.', 'ending sound', 'Giữ âm cuối /d/ trong “tired” trước “after”.', ['feeling', 'school']],
  ['I need a short break.', 'Tôi cần nghỉ một chút.', 'ending sound', 'Giữ âm cuối /t/ trong “short” trước “break”.', ['feeling', 'daily']],
  ['This food tastes really good.', 'Món này có vị rất ngon.', 'ending sound', 'Giữ âm /s/ trong “tastes” và âm /d/ cuối “good”.', ['food', 'feedback']],
  ['Can we eat lunch together?', 'Chúng ta ăn trưa cùng nhau được không?', 'linking', 'Nối “eat lunch” nhẹ, không thêm âm thừa sau /t/.', ['food', 'friends']],
  ['I usually drink tea at night.', 'Tôi thường uống trà vào buổi tối.', 'word stress', 'Nhấn “usually” ở âm đầu: U-su-al-ly.', ['drink', 'habit']],
  ['My favorite food is chicken rice.', 'Món ăn yêu thích của tôi là cơm gà.', 'word stress', 'Nhấn âm đầu trong “favorite” và “chicken”.', ['food', 'like']],
  ['What are you doing this weekend?', 'Cuối tuần này bạn làm gì?', 'intonation', 'Xuống giọng cuối câu hỏi thông tin.', ['weekend', 'plan']],
  ['I am visiting my grandparents.', 'Tôi sẽ thăm ông bà.', 'linking', 'Nối “visiting my” nhẹ, nhấn “grandparents”.', ['family', 'plan']],
  ['It is sunny this morning.', 'Sáng nay trời nắng.', 'word stress', 'Nhấn âm đầu trong “sunny” và “morning”.', ['weather', 'small-talk']],
  ['The weather is very nice.', 'Thời tiết rất đẹp.', 'difficult sound for Vietnamese learners', 'Tập âm /ð/ trong “the” và /v/ trong “very”.', ['weather', 'small-talk']],
  ['Do you want to walk outside?', 'Bạn có muốn đi bộ bên ngoài không?', 'intonation', 'Lên giọng nhẹ ở cuối câu hỏi Yes/No.', ['weather', 'activity']],
  ['Can we meet at three?', 'Chúng ta gặp lúc ba giờ được không?', 'linking', 'Nối “meet at” nhẹ, giữ âm /t/ gọn.', ['appointment', 'time']],
  ['See you at the cafe.', 'Gặp bạn ở quán cà phê nhé.', 'difficult sound for Vietnamese learners', 'Tập âm /ð/ trong “the” thật mềm.', ['appointment', 'place']],
  ['Please call me after work.', 'Làm ơn gọi tôi sau giờ làm.', 'word stress', 'Nhấn âm đầu trong “after” và “work”.', ['phone', 'work']],
  ['I can send you a message.', 'Tôi có thể gửi tin nhắn cho bạn.', 'linking', 'Nối “send you” nhẹ thành âm gần /sendʒuː/.', ['phone', 'message']],
  ['Could you speak more slowly?', 'Bạn nói chậm hơn được không?', 'word stress', 'Nhấn “speak” và “slowly”, xuống giọng lịch sự.', ['speaking', 'classroom']],
  ['I want to practice every morning.', 'Tôi muốn luyện tập mỗi sáng.', 'linking', 'Nối “want to” gọn và nhấn “practice”.', ['practice', 'habit']],
  ['Small steps make big progress.', 'Những bước nhỏ tạo nên tiến bộ lớn.', 'ending sound', 'Giữ âm /s/ cuối trong “steps” và âm /g/ trong “big”.', ['motivation', 'learning']],
];

function toIdText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeSentence(level: PooShadowingSentenceLevel, seed: ShadowingSeed, index: number): PooShadowingSentence {
  const [sentence, meaningVi, focus, noteVi, tags] = seed;

  return {
    id: `shadowing-l${level}-${String(index + 1).padStart(3, '0')}-${toIdText(sentence)}`,
    sentence,
    meaningVi,
    level,
    focus,
    noteVi,
    tags,
  };
}

export const pooShadowingLevel1Sentences: PooShadowingSentence[] = level1Seeds.map((seed, index) => makeSentence(1, seed, index));

export const pooShadowingLevel2Sentences: PooShadowingSentence[] = level2Seeds.map((seed, index) => makeSentence(2, seed, index));

export const pooShadowingCoreSentences: PooShadowingSentence[] = [
  ...pooShadowingLevel1Sentences,
  ...pooShadowingLevel2Sentences,
];

export const pooShadowingCoreSentenceCount = pooShadowingCoreSentences.length;

export function getPooShadowingCoreSentenceById(sentenceId: string | undefined | null) {
  if (!sentenceId) return undefined;
  return pooShadowingCoreSentences.find((item) => item.id === sentenceId);
}

export function getPooShadowingCoreSentencesByLevel(level: PooShadowingSentenceLevel) {
  return pooShadowingCoreSentences.filter((item) => item.level === level);
}

export function getPooShadowingCoreSentencesByFocus(focus: PooShadowingFocus) {
  return pooShadowingCoreSentences.filter((item) => item.focus === focus);
}

export function getPooDailyShadowingReviewSentences(dayNumber: number, count = 5) {
  const safeCount = Math.max(1, Math.min(count, pooShadowingCoreSentences.length));
  const startIndex = Math.abs(dayNumber - 1) % pooShadowingCoreSentences.length;

  return Array.from({ length: safeCount }, (_, offset) => {
    const index = (startIndex + offset) % pooShadowingCoreSentences.length;
    return pooShadowingCoreSentences[index];
  });
}

export function getPooShadowingCoreSentencesByTag(tag: string) {
  const normalizedTag = tag.trim().toLowerCase();
  return pooShadowingCoreSentences.filter((item) => item.tags.includes(normalizedTag));
}

export default pooShadowingCoreSentences;
