/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const filePath = path.join(ROOT, 'apps', 'web', 'src', 'data', 'vocabulary', 'generatedCefrVocabulary.ts');

const POS_VI = {
  noun: 'danh từ',
  verb: 'động từ',
  adjective: 'tính từ',
  adverb: 'trạng từ',
  preposition: 'giới từ',
  determiner: 'từ hạn định',
  pronoun: 'đại từ',
  conjunction: 'liên từ',
  exclamation: 'thán từ',
  number: 'số từ',
  modal: 'động từ khuyết thiếu',
  auxiliary: 'trợ động từ',
};

const SIMPLE_MEANINGS = {
  noun: 'a name for a person, place, thing, or idea',
  verb: 'an action or state word used to build a sentence',
  adjective: 'a describing word that adds detail to a noun',
  adverb: 'a word that adds time, place, manner, or degree',
  preposition: 'a small word that links a noun to time, place, or direction',
  determiner: 'a word placed before a noun to show which one or how many',
  pronoun: 'a short word used instead of repeating a noun or name',
  conjunction: 'a linking word that joins words, phrases, or ideas',
  exclamation: 'a short expression used for feeling or quick reaction',
  number: 'a word used for counting, order, or quantity',
  modal: 'a helper verb used for ability, possibility, advice, or permission',
  auxiliary: 'a helper verb used with another verb to form tense or questions',
};

const DIRECT_MEANINGS = {
  a: 'một; dùng trước danh từ số ít bắt đầu bằng âm phụ âm',
  an: 'một; dùng trước danh từ số ít bắt đầu bằng âm nguyên âm',
  the: 'cái/người đã được xác định hoặc người nghe đã biết',
  about: 'về; khoảng; liên quan đến một chủ đề',
  above: 'ở phía trên; cao hơn',
  across: 'băng qua; ở phía bên kia',
  act: 'hành động; cư xử; diễn',
  action: 'hành động',
  activity: 'hoạt động',
  actor: 'diễn viên nam; diễn viên',
  actress: 'diễn viên nữ',
  add: 'thêm vào; cộng thêm',
  address: 'địa chỉ; ghi địa chỉ',
  adult: 'người lớn',
  advice: 'lời khuyên',
  afraid: 'sợ; e ngại',
  after: 'sau; sau khi',
  afternoon: 'buổi chiều',
  again: 'lại; một lần nữa',
  age: 'tuổi; độ tuổi',
  ago: 'trước đây',
  agree: 'đồng ý',
  air: 'không khí',
  airport: 'sân bay',
  all: 'tất cả',
  also: 'cũng; cũng vậy',
  always: 'luôn luôn',
  amazing: 'tuyệt vời; đáng kinh ngạc',
  and: 'và',
  angry: 'tức giận',
  animal: 'động vật',
  another: 'một cái/người khác',
  answer: 'câu trả lời; trả lời',
  any: 'bất kỳ; một ít trong câu hỏi/phủ định',
  anyone: 'bất kỳ ai',
  anything: 'bất kỳ điều gì',
  apartment: 'căn hộ',
  apple: 'quả táo',
  April: 'tháng Tư',
  area: 'khu vực',
  arm: 'cánh tay',
  around: 'xung quanh; khoảng',
  arrive: 'đến nơi',
  art: 'nghệ thuật; môn mỹ thuật',
  article: 'bài viết; mạo từ',
  artist: 'nghệ sĩ',
  as: 'như; với vai trò là',
  ask: 'hỏi; nhờ',
  at: 'ở; vào lúc',
  August: 'tháng Tám',
  aunt: 'cô, dì, bác gái',
  autumn: 'mùa thu',
  away: 'đi xa; cách xa',
  baby: 'em bé',
  back: 'lưng; phía sau; quay lại',
  bad: 'xấu; tệ',
  bag: 'cái túi; cặp',
  ball: 'quả bóng',
  banana: 'quả chuối',
  band: 'ban nhạc; dải',
  bank: 'ngân hàng; bờ sông',
  bath: 'bồn tắm; việc tắm',
  bathroom: 'phòng tắm',
  be: 'là; thì; ở',
  beach: 'bãi biển',
  beautiful: 'đẹp',
  because: 'bởi vì',
  become: 'trở thành',
  bed: 'giường',
  bedroom: 'phòng ngủ',
  bee: 'con ong',
  before: 'trước; trước khi',
  begin: 'bắt đầu',
  beginning: 'phần đầu; sự bắt đầu',
  behind: 'ở phía sau',
  believe: 'tin',
  below: 'bên dưới',
  best: 'tốt nhất',
  better: 'tốt hơn',
  between: 'ở giữa',
  bicycle: 'xe đạp',
  big: 'to; lớn',
  bike: 'xe đạp',
  bill: 'hóa đơn',
  bird: 'con chim',
  birth: 'sự sinh ra',
  birthday: 'sinh nhật',
  bit: 'một chút; mẩu nhỏ',
  black: 'màu đen',
  blog: 'blog; nhật ký trực tuyến',
  blonde: 'tóc vàng',
  blue: 'màu xanh dương',
  boat: 'thuyền',
  body: 'cơ thể',
  book: 'quyển sách; đặt trước',
  boot: 'ủng; bốt',
  bored: 'chán',
  boring: 'nhàm chán',
  born: 'được sinh ra',
  both: 'cả hai',
  bottle: 'cái chai',
  box: 'cái hộp',
  boy: 'cậu bé',
  boyfriend: 'bạn trai',
  bread: 'bánh mì',
  break: 'làm vỡ; nghỉ giải lao',
  breakfast: 'bữa sáng',
  bring: 'mang đến',
  brother: 'anh/em trai',
  brown: 'màu nâu',
  build: 'xây dựng',
  building: 'tòa nhà',
  bus: 'xe buýt',
  business: 'công việc kinh doanh; doanh nghiệp',
  busy: 'bận',
  but: 'nhưng',
  butter: 'bơ',
  buy: 'mua',
  by: 'bởi; bằng; cạnh',
};

function literal(value) {
  return JSON.stringify(value);
}

function titleCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function extract(block, field) {
  const match = block.match(new RegExp(`${field}:\\s*([\"'])((?:\\\\.|(?!\\1).)*)\\1`));
  return match ? match[2] : '';
}

function normalizedWord(word) {
  return word.toLowerCase().replace(/[’']/g, '').trim();
}

function articleFor(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function exampleFor(word, pos) {
  const safe = word.replace(/\.$/, '');
  const display = safe.includes('-') ? safe.replace(/-/g, ' ') : safe;
  if (display === 'a') return 'I have a book in my bag.';
  if (display === 'an') return 'She eats an apple after lunch.';
  if (display === 'the') return 'The book is on the desk.';
  if (display === 'a.m.') return 'The class starts at 8 a.m.';
  if (pos === 'noun') return `I use the word ${display} when I talk about daily life.`;
  if (pos === 'verb') return `I ${display} in a simple sentence with my teacher.`;
  if (pos === 'adjective') return `This is ${articleFor(display)} ${display} example for today.`;
  if (pos === 'adverb') return `We can use ${display} to add more detail to the sentence.`;
  if (pos === 'preposition') return `The notebook is ${display} the desk in this example.`;
  if (pos === 'determiner') return `${titleCase(display)} student has a notebook.`;
  if (pos === 'pronoun') return `${titleCase(display)} helps us avoid repeating a name.`;
  if (pos === 'conjunction') return `I read ${display} I write one short sentence.`;
  if (pos === 'exclamation') return `${titleCase(display)}! That is a quick reaction in English.`;
  if (pos === 'number') return `I see ${display} new words on the card.`;
  if (pos === 'modal') return `You ${display} use this word before a main verb.`;
  if (pos === 'auxiliary') return `We use ${display} to make questions or verb phrases.`;
  return `I can use ${display} in a short English sentence.`;
}

function exampleViFor(word, pos) {
  const display = word.replace(/\.$/, '');
  if (display === 'a') return 'Tôi có một quyển sách trong cặp.';
  if (display === 'an') return 'Cô ấy ăn một quả táo sau bữa trưa.';
  if (display === 'the') return 'Quyển sách đó ở trên bàn.';
  if (display === 'a.m.') return 'Lớp học bắt đầu lúc 8 giờ sáng.';
  const posLabel = POS_VI[pos] ?? pos;
  if (pos === 'noun') return `Câu mẫu dùng “${display}” như một ${posLabel} trong đời sống hằng ngày.`;
  if (pos === 'verb') return `Câu mẫu luyện “${display}” như một ${posLabel} trong câu đơn giản.`;
  if (pos === 'adjective') return `Câu mẫu dùng “${display}” để miêu tả một người hoặc vật.`;
  if (pos === 'adverb') return `Câu mẫu dùng “${display}” để thêm chi tiết cho hành động hoặc thời gian.`;
  if (pos === 'preposition') return `Câu mẫu dùng “${display}” để nối vị trí, thời gian hoặc hướng.`;
  return `Câu mẫu giúp nhận ra cách dùng “${display}” trong ngữ cảnh ngắn.`;
}

function situationFor(word, pos, level) {
  const display = word.replace(/\.$/, '');
  const levelUse = level === 'A1' ? 'giao tiếp rất cơ bản' : level === 'A2' ? 'tình huống quen thuộc' : level === 'B1' ? 'kể chuyện và giải thích ngắn' : 'diễn đạt ý rõ hơn';
  if (pos === 'noun') return `Dùng khi gọi tên người, vật, nơi chốn hoặc ý trong ${levelUse}.`;
  if (pos === 'verb') return `Dùng để nói hành động/trạng thái trong ${levelUse}.`;
  if (pos === 'adjective') return `Dùng để miêu tả người, đồ vật hoặc cảm giác trong ${levelUse}.`;
  if (pos === 'adverb') return `Dùng để thêm thông tin về thời gian, mức độ hoặc cách làm trong ${levelUse}.`;
  if (pos === 'preposition') return `Dùng để nối ý về vị trí, thời gian hoặc hướng trong ${levelUse}.`;
  return `Gặp “${display}” trong ${levelUse}; học bằng một cụm ngắn trước khi mở rộng.`;
}

function meaningFor(word, pos, level) {
  const key = normalizedWord(word);
  const direct = DIRECT_MEANINGS[key];
  if (direct) return direct;
  const label = POS_VI[pos] ?? pos;
  return `${word}: ${label} dùng trong ngữ cảnh ${level} để tạo câu ngắn, rõ nghĩa.`;
}

function replaceField(block, field, value) {
  return block.replace(new RegExp(`(${field}:\\s*)([\"'])((?:\\\\.|(?!\\2).)*)\\2`), `$1${literal(value)}`);
}

let text = fs.readFileSync(filePath, 'utf8');
let changed = 0;
text = text.replace(/  \{\n    id: [\s\S]*?\n  \}/g, (block) => {
  if (!block.includes('cefrLevel:')) return block;
  const word = extract(block, 'term') || extract(block, 'word');
  const level = extract(block, 'cefrLevel') || 'A1';
  const pos = extract(block, 'partOfSpeech') || 'word';
  let next = block;
  next = replaceField(next, 'simpleEnglishMeaning', SIMPLE_MEANINGS[pos] ?? 'a useful English word for communication');
  next = replaceField(next, 'vietnameseHint', situationFor(word, pos, level));
  next = replaceField(next, 'meaningVi', meaningFor(word, pos, level));
  next = replaceField(next, 'example', exampleFor(word, pos));
  next = replaceField(next, 'exampleMeaningVi', exampleViFor(word, pos));
  next = replaceField(next, 'flashcardPrompt', `Nhìn tình huống và nói lại từ/cụm: ${word}.`);
  next = replaceField(next, 'pronunciationHintVi', `Nghe mẫu, đọc “${word}” chậm trong câu, rồi nói lại tự nhiên hơn.`);
  if (next !== block) changed += 1;
  return next;
});

fs.writeFileSync(filePath, text, 'utf8');
console.log(`Repaired ${changed} generated vocabulary items in ${path.relative(ROOT, filePath).replace(/\\/g, '/')}.`);
