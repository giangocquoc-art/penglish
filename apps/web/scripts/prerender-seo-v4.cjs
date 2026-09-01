const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.pooenglish.com';
const DIST_DIR = path.resolve(__dirname, '../dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');

const pages = [
  ['học tiếng Anh miễn phí', '/hoc-tieng-anh-mien-phi', 'free', '/learning-path'],
  ['học tiếng Anh cho người mất gốc', '/hoc-tieng-anh-cho-nguoi-mat-goc', 'foundation', '/learning-path'],
  ['lộ trình học tiếng Anh cho người mất gốc', '/lo-trinh-hoc-tieng-anh-cho-nguoi-mat-goc', 'foundation', '/learning-path'],
  ['học tiếng Anh từ đầu', '/hoc-tieng-anh-tu-dau', 'foundation', '/learning-path'],
  ['học tiếng Anh cơ bản', '/hoc-tieng-anh-co-ban', 'foundation', '/learning-path'],
  ['học tiếng Anh online miễn phí', '/hoc-tieng-anh-online-mien-phi', 'free', '/learning-path'],
  ['app học tiếng Anh miễn phí', '/app-hoc-tieng-anh-mien-phi', 'free', '/learning-path'],
  ['web học tiếng Anh miễn phí', '/web-hoc-tieng-anh-mien-phi', 'free', '/learning-path'],
  ['học tiếng Anh giao tiếp', '/hoc-tieng-anh-giao-tiep', 'speaking', '/speaking-coach'],
  ['tiếng Anh giao tiếp cơ bản', '/tieng-anh-giao-tiep-co-ban', 'speaking', '/speaking-coach'],
  ['luyện nói tiếng Anh', '/luyen-noi-tieng-anh', 'speaking', '/speaking-coach'],
  ['luyện nói tiếng Anh với AI', '/luyen-noi-tieng-anh-voi-ai', 'ai', '/speaking-coach'],
  ['AI chấm phát âm tiếng Anh', '/ai-cham-phat-am-tieng-anh', 'ai', '/speaking-coach'],
  ['luyện phát âm tiếng Anh', '/luyen-phat-am-tieng-anh', 'pronunciation', '/speaking-coach'],
  ['app luyện phát âm tiếng Anh miễn phí', '/app-luyen-phat-am-tieng-anh-mien-phi', 'pronunciation', '/speaking-coach'],
  ['kiểm tra phát âm tiếng Anh online', '/kiem-tra-phat-am-tieng-anh-online', 'pronunciation', '/speaking-coach'],
  ['chấm điểm phát âm tiếng Anh', '/cham-diem-phat-am-tieng-anh', 'pronunciation', '/speaking-coach'],
  ['shadowing tiếng Anh', '/shadowing-tieng-anh', 'shadowing', '/shadowing'],
  ['shadowing là gì', '/blog/shadowing-la-gi', 'shadowing', '/shadowing'],
  ['cách luyện shadowing tiếng Anh', '/blog/cach-luyen-shadowing-tieng-anh', 'shadowing', '/shadowing'],
  ['luyện shadowing cho người mới bắt đầu', '/shadowing-cho-nguoi-moi-bat-dau', 'shadowing', '/shadowing'],
  ['luyện nghe tiếng Anh', '/luyen-nghe-tieng-anh', 'listening', '/practice'],
  ['luyện nghe tiếng Anh cho người mới bắt đầu', '/luyen-nghe-tieng-anh-cho-nguoi-moi', 'listening', '/practice'],
  ['luyện nghe tiếng Anh chậm', '/luyen-nghe-tieng-anh-cham', 'listening', '/practice'],
  ['nghe chép chính tả tiếng Anh', '/nghe-chep-chinh-ta-tieng-anh', 'listening', '/practice'],
  ['từ vựng tiếng Anh cơ bản', '/tu-vung-tieng-anh-co-ban', 'vocab', '/words'],
  ['từ vựng tiếng Anh cho người mất gốc', '/tu-vung-tieng-anh-cho-nguoi-mat-goc', 'vocab', '/words'],
  ['500 từ vựng tiếng Anh cơ bản', '/500-tu-vung-tieng-anh-co-ban', 'vocab', '/words'],
  ['từ vựng tiếng Anh A1', '/tu-vung-tieng-anh-a1', 'vocab', '/words'],
  ['từ vựng tiếng Anh A2', '/tu-vung-tieng-anh-a2', 'vocab', '/words'],
  ['từ vựng tiếng Anh B1', '/tu-vung-tieng-anh-b1', 'vocab', '/words'],
  ['học từ vựng tiếng Anh theo chủ đề', '/tu-vung-tieng-anh-theo-chu-de', 'vocab', '/words'],
  ['ngữ pháp tiếng Anh cơ bản', '/ngu-phap-tieng-anh-co-ban', 'grammar', '/practice'],
  ['ngữ pháp tiếng Anh cho người mất gốc', '/ngu-phap-tieng-anh-cho-nguoi-mat-goc', 'grammar', '/practice'],
  ['thì hiện tại đơn', '/ngu-phap/thi-hien-tai-don', 'grammar', '/practice'],
  ['động từ to be', '/ngu-phap/dong-tu-to-be', 'grammar', '/practice'],
  ['cách đặt câu tiếng Anh', '/cach-dat-cau-tieng-anh', 'grammar', '/practice'],
  ['học tiếng Anh mỗi ngày', '/hoc-tieng-anh-moi-ngay', 'roadmap', '/learning-path'],
  ['lộ trình học tiếng Anh 30 ngày', '/lo-trinh-hoc-tieng-anh-30-ngay', 'roadmap', '/learning-path'],
  ['lộ trình học tiếng Anh 48 ngày', '/lo-trinh-hoc-tieng-anh-48-ngay', 'roadmap', '/learning-path'],
];

function esc(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&', '<': '<', '>': '>', '"': '"' }[char]));
}

function firstUpper(value) {
  return value.charAt(0).toLocaleUpperCase('vi-VN') + value.slice(1);
}

function targetLabel(to) {
  return ({ '/learning-path': 'lộ trình học', '/speaking-coach': 'speaking coach', '/words': 'từ vựng', '/shadowing': 'shadowing', '/practice': 'luyện nghe và ngữ pháp' })[to] || 'bài học';
}

function pageHtml(baseHtml, keyword, route, intent, ctaTo) {
  const heading = `${firstUpper(keyword)} cho người học bận rộn`;
  const title = `${firstUpper(keyword)} cùng PooEnglish`;
  const description = `${firstUpper(keyword)}: hướng dẫn dễ hiểu, có câu trả lời nhanh, bài tập nhỏ, lỗi thường gặp và đường học tiếp phù hợp trên PooEnglish.`;
  const canonical = `${SITE_URL}${route}`;
  const quick = `${firstUpper(keyword)} hiệu quả nhất khi bạn biến mục tiêu tìm kiếm thành một buổi học thật: hiểu ý chính, làm một nhiệm vụ nhỏ, ôn lại và chuyển sang ${targetLabel(ctaTo)}.`;
  const faqs = [
    [`${firstUpper(keyword)} nên bắt đầu từ đâu?`, 'Bắt đầu bằng bài kiểm tra nhỏ, chọn mục tiêu gần nhất, rồi học theo câu ngắn thay vì gom nhiều tài liệu cùng lúc.'],
    [`Người mới có học được ${keyword} không?`, 'Có. PooEnglish chia nội dung thành nhiệm vụ nhỏ, ví dụ dễ hiểu và flow luyện tập phù hợp.'],
    ['Mỗi ngày nên học bao lâu?', 'Khoảng 15 đến 25 phút là đủ: ôn nhanh, học mới và nói hoặc nghe lại.'],
    ['Có cần đăng nhập trước không?', 'Bạn có thể đọc hướng dẫn và đi tới flow học thử trước khi cần tài khoản.'],
    ['Nên học tiếp ở đâu?', `Hãy chuyển sang ${targetLabel(ctaTo)} để luyện bằng bài học thật.`],
  ];
  const links = [
    ['/learning-path', 'Lộ trình học'],
    ['/speaking-coach', 'Speaking Coach'],
    ['/words', 'Từ vựng'],
    ['/shadowing', 'Shadowing'],
    ['/practice', 'Luyện nghe và ngữ pháp'],
  ];
  const article = `
<main id="seo-prerender" data-route="${esc(route)}" style="max-width:960px;margin:32px auto;padding:24px;font-family:Inter,system-ui,sans-serif;line-height:1.7;color:#102A43">
  <p style="font-weight:800;color:#1F6FD6">PooEnglish guide</p>
  <h1>${esc(heading)}</h1>
  <section aria-label="Câu trả lời nhanh"><h2>Câu trả lời nhanh</h2><p>${esc(quick)}</p></section>
  <section><h2>Cách học để dùng được</h2><p>${esc(firstUpper(keyword))} không nên chỉ dừng ở việc đọc hướng dẫn. Người học cần một đường đi rõ: biết mình đang ở đâu, hôm nay học gì, và học xong phải làm được một hành động nhỏ.</p><p>Cách học an toàn là bắt đầu bằng câu ngắn, từ vựng gần đời sống và một nhiệm vụ có thể hoàn thành trong vài phút. Khi thấy tiến bộ nhỏ mỗi ngày, việc học tiếng Anh bớt áp lực hơn.</p></section>
  <section><h2>Nhiệm vụ học thử</h2><ul><li>Viết ra một câu mục tiêu cho ${esc(keyword)}.</li><li>Chọn 5 từ hoặc 3 mẫu câu liên quan và đọc thành tiếng.</li><li>Làm một lượt nghe hoặc nói thử trong flow được gợi ý.</li></ul></section>
  <section><h2>Câu hỏi thường gặp</h2>${faqs.map(([q, a]) => `<article><h3>${esc(q)}</h3><p>${esc(a)}</p></article>`).join('')}</section>
  <nav aria-label="Internal links"><h2>Đi tiếp trong PooEnglish</h2><ul>${links.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul></nav>
  <p><a href="${esc(ctaTo)}">Đi tới ${esc(targetLabel(ctaTo))}</a></p>
</main>`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
  };
  return baseHtml
    .replace(/<title>.*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${esc(description)}" />`)
    .replace('</head>', `<link rel="canonical" href="${esc(canonical)}" /><meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(description)}" /><meta property="og:url" content="${esc(canonical)}" /><script type="application/ld+json">${JSON.stringify(schema)}</script></head>`)
    .replace('<div id="root">', `${article}<div id="root">`);
}

if (!fs.existsSync(INDEX_FILE)) {
  console.error(`Missing build index: ${INDEX_FILE}`);
  process.exit(1);
}

const baseHtml = fs.readFileSync(INDEX_FILE, 'utf8');
for (const [keyword, route, intent, ctaTo] of pages) {
  const outputDir = path.join(DIST_DIR, route.replace(/^\//, ''));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), pageHtml(baseHtml, keyword, route, intent, ctaTo), 'utf8');
}

console.log(`Prerendered ${pages.length} SEO routes.`);
