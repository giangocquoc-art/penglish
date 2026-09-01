const fs = require('fs');
const path = require('path');

const root = process.cwd();
const files = [
  'apps/web/src/lib/p-english/lesson-content-data.ts',
  'apps/web/src/data/reading/generatedReadingLessons.ts',
  'apps/web/src/data/grammar/generatedGrammarLessons.ts',
  'apps/web/src/data/shadowing/generatedShadowingCatalog.ts',
  'apps/web/src/data/speech/generatedSpeechPrompts.ts',
  'apps/web/src/features/foundation48/foundation48Data.ts',
  'apps/web/src/features/foundation48/foundation48LessonSummaries.ts',
];

const replacements = [
  // Reading level-specific title tone. Preserve ids/schema/answers.
  [/titleVi: 'Đọc cùng Poo: ([^']+)'/g, (match, title, offset, source) => {
    const before = source.slice(Math.max(0, offset - 220), offset);
    if (/level: 'B2'/.test(before) || /level: 'C1'/.test(before)) return `titleVi: 'Đọc sâu hơn cùng Poo: ${title}'`;
    if (/level: 'B1'/.test(before)) return `titleVi: 'Đọc hiểu cùng Poo: ${title}'`;
    return match;
  }],
  [/A1 Reading: /g, 'Đọc cùng Poo: '],
  [/A2 Reading: /g, 'Đọc cùng Poo: '],
  [/B1 Reading: /g, 'Đọc hiểu cùng Poo: '],
  [/B2 Reading: /g, 'Đọc sâu hơn cùng Poo: '],
  [/C1 Reading: /g, 'Đọc sâu hơn cùng Poo: '],

  // Natural Vietnamese café translations.
  [/Tôi xem thực đơn được không\?/g, 'Mình xem thực đơn được không?'],
  [/Một cà phê nhỏ, làm ơn\./g, 'Cho mình một ly cà phê nhỏ nhé.'],
  [/Một trà lớn, làm ơn\./g, 'Cho mình một ly trà lớn nhé.'],
  [/Một cà phê, làm ơn\./g, 'Cho mình một ly cà phê nhé.'],
  [/Một nước cam, làm ơn\./g, 'Cho mình một ly nước cam nhé.'],
  [/Nước cam, làm ơn\./g, 'Cho mình nước cam nhé.'],
  [/Nước lạnh, làm ơn\./g, 'Cho mình nước lạnh nhé.'],
  [/Cái đó giá bao nhiêu\?/g, 'Món này bao nhiêu tiền vậy?'],
  [/cái đó giá bao nhiêu\?/g, 'món này bao nhiêu tiền vậy?'],

  // Speaking prompt tone. Keep expectedEnglish/answers intact.
  [/promptVi: 'Nói: ([^']+)'/g, "promptVi: 'Poo thử thách nhẹ: nói ‘$1’"],
  [/promptVi: 'Hỏi: ([^']+)'/g, "promptVi: 'Giúp Poo hỏi: ‘$1’"],
  [/promptVi: 'Gọi: ([^']+)'/g, "promptVi: 'Thử gọi món cùng Poo: ‘$1’"],
  [/promptVi: 'Poo thử thách nhẹ: hỏi “([^”]+)”'/g, "promptVi: 'Giúp Poo hỏi: ‘$1’"],
  [/promptVi: 'Poo thử thách nhẹ: nói “([^”]+)”'/g, "promptVi: 'Poo thử thách nhẹ: nói ‘$1’"],

  // Foundation48 stage names requested by user.
  [/Nói “là \/ ở \/ thì” bằng câu ngắn/g, 'Tập nói “là / ở / thì” bằng câu ngắn'],
  [/Nói việc mình làm mỗi ngày/g, 'Kể việc mình làm mỗi ngày'],
  [/Xếp từ và kể chuyện đơn giản/g, 'Nhận mặt từ và thời gian'],
  [/Nói rõ hơn và hỏi câu ngắn/g, 'Nói rõ hơn và hỏi tự nhiên hơn'],
  [/Nối ý và nói lời khuyên ngắn/g, 'Ghép ý và nói “nếu… thì…”'],
  [/Câu nền tảng với “to be”/g, 'Tập nói “là / ở / thì” bằng câu ngắn'],
  [/Câu nền tảng với to be/g, 'Tập nói “là / ở / thì” bằng câu ngắn'],
  [/Động từ thường và hiện tại đơn/g, 'Kể việc mình làm mỗi ngày'],
  [/Từ loại và các thì căn bản/g, 'Nhận mặt từ và thời gian'],
  [/Phát âm, trọng âm và câu hỏi/g, 'Nói rõ hơn và hỏi tự nhiên hơn'],
  [/Liên từ và câu điều kiện/g, 'Ghép ý và nói “nếu… thì…”'],

  // Replace system-smelling grammar examples with everyday/Poo examples.
  [/\{ text: 'Progress is saved on this device\.', meaningVi: 'Tiến độ được lưu trên thiết bị này\.' \}/g, "{ text: 'Poo keeps my small steps safe.', meaningVi: 'Poo giữ lại từng bước nhỏ cho tôi.' }"],
  [/\{ text: 'Progress is saved for you\.', meaningVi: 'Poo giữ lại tiến độ cho bạn\.' \}/g, "{ text: 'Poo keeps my small steps safe.', meaningVi: 'Poo giữ lại từng bước nhỏ cho tôi.' }"],
  [/\{ text: 'The answer is checked automatically\.', meaningVi: 'Đáp án được kiểm tra tự động\.' \}/g, "{ text: 'My answer is checked gently by Poo.', meaningVi: 'Poo xem câu trả lời của tôi thật nhẹ nhàng.' }"],
  [/This is the app that tracks my progress\./g, 'This is the whale that helps me practise.' ],
  [/Đây là ứng dụng theo dõi tiến độ của tôi\./g, 'Đây là chú cá voi giúp tôi luyện tập.' ],
  [/The app is simple\. However, it gives useful feedback\./g, 'Poo is gentle. However, the feedback is still useful.' ],
  [/Ứng dụng đơn giản\. Tuy nhiên, nó đưa góp ý hữu ích\./g, 'Poo nhẹ nhàng. Tuy nhiên, phần góp ý vẫn rất hữu ích.' ],

  // Praise-first quiz explanations in requested content.
  [/explanationVi: 'menu là thực đơn ở quán\/cửa hàng\.'/g, "explanationVi: 'Đúng rồi, menu là thực đơn ở quán hoặc cửa hàng.'"],
  [/explanationVi: 'Thứ tự tự nhiên là số lượng \+ kích cỡ \+ đồ uống \+ please\.'/g, "explanationVi: 'Đúng rồi, mình xếp số lượng, kích cỡ, đồ uống rồi thêm please cho lịch sự nhé.'"],
  [/explanationVi: 'How much\.\.\.\? thường dùng để hỏi giá\.'/g, "explanationVi: 'Đúng rồi, How much...? là cách hỏi giá rất quen thuộc.'"],
  [/explanationVi: 'Câu đầu nói “Mai gets up at six”\.'/g, "explanationVi: 'Đúng rồi, Poo thấy câu đầu nói “Mai gets up at six”.'"],
  [/explanationVi: 'Câu cuối nói notebook ở trong bag\.'/g, "explanationVi: 'Đúng rồi, câu cuối cho biết notebook ở trong bag.'"],
  [/explanationVi: 'Đoạn đọc ghi rõ “twenty students”\.'/g, "explanationVi: 'Đúng rồi, đoạn đọc ghi rõ “twenty students”.'"],
  [/explanationVi: 'Câu thứ ba nói teacher writes on the board\.'/g, "explanationVi: 'Đúng rồi, câu thứ ba nói teacher writes on the board.'"],

  // A1/A2 wording less academic.
  [/Ở A1, hãy nhận ra/g, 'Ở đoạn dễ này, mình chỉ cần nhận ra'],
  [/Tập nhận diện/g, 'Tập nhìn ra'],
  [/Dùng “There are” để nói/g, '“There are” giúp mình nói'],
  [/Dùng “There is” để nói/g, '“There is” giúp mình nói'],
  [/diễn tả muốn có đủ thời gian để làm việc gì/g, 'nói rằng mình muốn có đủ thời gian để làm một việc'],
];

let changedFiles = [];
for (const rel of files) {
  const abs = path.join(root, rel);
  let text = fs.readFileSync(abs, 'utf8');
  const before = text;
  for (const [search, replace] of replacements) {
    text = text.replace(search, replace);
  }
  if (text !== before) {
    fs.writeFileSync(abs, text);
    changedFiles.push(rel);
  }
}

console.log(`Updated ${changedFiles.length} files:`);
for (const file of changedFiles) console.log(`- ${file}`);
