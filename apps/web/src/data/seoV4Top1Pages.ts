export type SeoV4Intent = 'free' | 'foundation' | 'roadmap' | 'speaking' | 'pronunciation' | 'ai' | 'vocab' | 'shadowing' | 'listening' | 'grammar';

export type SeoV4Faq = {
  question: string;
  answer: string;
};

export type SeoV4InternalLink = {
  label: string;
  to: string;
};

export type SeoV4PageData = {
  id: number;
  keyword: string;
  path: string;
  intent: SeoV4Intent;
  title: string;
  description: string;
  h1: string;
  quickAnswer: string;
  body: string[];
  tasks: string[];
  mistakes: string[];
  sevenDayPlan: string[];
  faqs: SeoV4Faq[];
  internalLinks: SeoV4InternalLink[];
  ctaLabel: string;
  ctaTo: string;
};

const INTENT_TARGETS: Record<SeoV4Intent, { ctaTo: string; ctaLabel: string; theme: string; links: SeoV4InternalLink[] }> = {
  free: {
    ctaTo: '/learning-path',
    ctaLabel: 'Bắt đầu lộ trình miễn phí',
    theme: 'học miễn phí có lộ trình rõ, bài nhỏ và ôn đều',
    links: [
      { label: 'Lộ trình học', to: '/learning-path' },
      { label: 'Từ vựng theo trình độ', to: '/words' },
      { label: 'Luyện nghe và ngữ pháp', to: '/practice' },
      { label: 'Shadowing cho người mới', to: '/shadowing' },
    ],
  },
  foundation: {
    ctaTo: '/learning-path',
    ctaLabel: 'Lấy lại gốc cùng Poo',
    theme: 'xây lại nền tảng từ âm, từ, câu ngắn và thói quen học',
    links: [
      { label: 'Test đầu vào mini', to: '/learning-path' },
      { label: '48 ngày lấy gốc', to: '/luyen-tieng-anh/48-ngay-lay-goc' },
      { label: 'Từ vựng A1', to: '/words' },
      { label: 'Luyện câu ngắn', to: '/practice' },
    ],
  },
  roadmap: {
    ctaTo: '/learning-path',
    ctaLabel: 'Xem lộ trình học',
    theme: 'đi theo lịch học từng ngày để không bị rối',
    links: [
      { label: 'Lộ trình học', to: '/learning-path' },
      { label: '48 ngày lấy gốc', to: '/luyen-tieng-anh/48-ngay-lay-goc' },
      { label: 'Ôn từ mỗi ngày', to: '/words' },
      { label: 'Luyện nghe mỗi ngày', to: '/practice' },
    ],
  },
  speaking: {
    ctaTo: '/speaking-coach',
    ctaLabel: 'Luyện nói thử với Poo',
    theme: 'nói câu thật, nghe mẫu rồi nhận góp ý nhẹ nhàng',
    links: [
      { label: 'Speaking Coach', to: '/speaking-coach' },
      { label: 'Shadowing', to: '/shadowing' },
      { label: 'Từ vựng giao tiếp', to: '/words' },
      { label: 'Luyện nghe câu ngắn', to: '/practice' },
    ],
  },
  pronunciation: {
    ctaTo: '/speaking-coach',
    ctaLabel: 'Kiểm tra phát âm thử',
    theme: 'nghe mẫu, nói chậm và sửa âm cuối từng chút',
    links: [
      { label: 'Speaking Coach', to: '/speaking-coach' },
      { label: 'Shadowing phát âm', to: '/shadowing' },
      { label: 'Luyện nghe âm', to: '/practice' },
      { label: 'Từ vựng thường dùng', to: '/words' },
    ],
  },
  ai: {
    ctaTo: '/speaking-coach',
    ctaLabel: 'Nhận góp ý nói thử',
    theme: 'dùng góp ý thông minh để biết nên sửa gì trước',
    links: [
      { label: 'AI Speaking Coach', to: '/speaking-coach' },
      { label: 'Shadowing', to: '/shadowing' },
      { label: 'Luyện nghe', to: '/practice' },
      { label: 'Lộ trình học', to: '/learning-path' },
    ],
  },
  vocab: {
    ctaTo: '/words',
    ctaLabel: 'Học từ vựng bằng flashcard',
    theme: 'học từ theo trình độ, ví dụ ngắn và ôn lại đúng lúc',
    links: [
      { label: 'Flashcard từ vựng', to: '/words' },
      { label: 'Lộ trình học', to: '/learning-path' },
      { label: 'Luyện nghe với từ mới', to: '/practice' },
      { label: 'Nói câu với từ mới', to: '/speaking-coach' },
    ],
  },
  shadowing: {
    ctaTo: '/shadowing',
    ctaLabel: 'Luyện shadowing thử',
    theme: 'nghe, nhại, lặp và tự nói bằng câu vừa sức',
    links: [
      { label: 'Shadowing cho người mới', to: '/shadowing' },
      { label: 'Speaking Coach', to: '/speaking-coach' },
      { label: 'Luyện nghe chậm', to: '/practice' },
      { label: 'Lộ trình học', to: '/learning-path' },
    ],
  },
  listening: {
    ctaTo: '/practice',
    ctaLabel: 'Luyện nghe câu ngắn',
    theme: 'nghe chậm, chép chính tả và tăng tốc theo câu ngắn',
    links: [
      { label: 'Luyện nghe', to: '/practice' },
      { label: 'Shadowing sau khi nghe', to: '/shadowing' },
      { label: 'Từ cần ôn', to: '/words' },
      { label: 'Lộ trình học', to: '/learning-path' },
    ],
  },
  grammar: {
    ctaTo: '/practice',
    ctaLabel: 'Luyện ngữ pháp bằng câu',
    theme: 'học ngữ pháp qua mẫu câu, không học mẹo rời rạc',
    links: [
      { label: 'Ngữ pháp thực hành', to: '/practice' },
      { label: 'Lộ trình học', to: '/learning-path' },
      { label: 'Từ vựng đặt câu', to: '/words' },
      { label: 'Nói câu vừa học', to: '/speaking-coach' },
    ],
  },
};

const SEEDS: Array<{ id: number; keyword: string; path: string; intent: SeoV4Intent }> = [
  { id: 1, keyword: 'học tiếng Anh miễn phí', path: '/hoc-tieng-anh-mien-phi', intent: 'free' },
  { id: 2, keyword: 'học tiếng Anh cho người mất gốc', path: '/hoc-tieng-anh-cho-nguoi-mat-goc', intent: 'foundation' },
  { id: 3, keyword: 'lộ trình học tiếng Anh cho người mất gốc', path: '/lo-trinh-hoc-tieng-anh-cho-nguoi-mat-goc', intent: 'foundation' },
  { id: 4, keyword: 'học tiếng Anh từ đầu', path: '/hoc-tieng-anh-tu-dau', intent: 'foundation' },
  { id: 5, keyword: 'học tiếng Anh cơ bản', path: '/hoc-tieng-anh-co-ban', intent: 'foundation' },
  { id: 6, keyword: 'học tiếng Anh online miễn phí', path: '/hoc-tieng-anh-online-mien-phi', intent: 'free' },
  { id: 7, keyword: 'app học tiếng Anh miễn phí', path: '/app-hoc-tieng-anh-mien-phi', intent: 'free' },
  { id: 8, keyword: 'web học tiếng Anh miễn phí', path: '/web-hoc-tieng-anh-mien-phi', intent: 'free' },
  { id: 9, keyword: 'học tiếng Anh giao tiếp', path: '/hoc-tieng-anh-giao-tiep', intent: 'speaking' },
  { id: 10, keyword: 'tiếng Anh giao tiếp cơ bản', path: '/tieng-anh-giao-tiep-co-ban', intent: 'speaking' },
  { id: 11, keyword: 'luyện nói tiếng Anh', path: '/luyen-noi-tieng-anh', intent: 'speaking' },
  { id: 12, keyword: 'luyện nói tiếng Anh với AI', path: '/luyen-noi-tieng-anh-voi-ai', intent: 'ai' },
  { id: 13, keyword: 'AI chấm phát âm tiếng Anh', path: '/ai-cham-phat-am-tieng-anh', intent: 'ai' },
  { id: 14, keyword: 'luyện phát âm tiếng Anh', path: '/luyen-phat-am-tieng-anh', intent: 'pronunciation' },
  { id: 15, keyword: 'app luyện phát âm tiếng Anh miễn phí', path: '/app-luyen-phat-am-tieng-anh-mien-phi', intent: 'pronunciation' },
  { id: 16, keyword: 'kiểm tra phát âm tiếng Anh online', path: '/kiem-tra-phat-am-tieng-anh-online', intent: 'pronunciation' },
  { id: 17, keyword: 'chấm điểm phát âm tiếng Anh', path: '/cham-diem-phat-am-tieng-anh', intent: 'pronunciation' },
  { id: 18, keyword: 'shadowing tiếng Anh', path: '/shadowing-tieng-anh', intent: 'shadowing' },
  { id: 19, keyword: 'shadowing là gì', path: '/blog/shadowing-la-gi', intent: 'shadowing' },
  { id: 20, keyword: 'cách luyện shadowing tiếng Anh', path: '/blog/cach-luyen-shadowing-tieng-anh', intent: 'shadowing' },
  { id: 21, keyword: 'luyện shadowing cho người mới bắt đầu', path: '/shadowing-cho-nguoi-moi-bat-dau', intent: 'shadowing' },
  { id: 22, keyword: 'luyện nghe tiếng Anh', path: '/luyen-nghe-tieng-anh', intent: 'listening' },
  { id: 23, keyword: 'luyện nghe tiếng Anh cho người mới bắt đầu', path: '/luyen-nghe-tieng-anh-cho-nguoi-moi', intent: 'listening' },
  { id: 24, keyword: 'luyện nghe tiếng Anh chậm', path: '/luyen-nghe-tieng-anh-cham', intent: 'listening' },
  { id: 25, keyword: 'nghe chép chính tả tiếng Anh', path: '/nghe-chep-chinh-ta-tieng-anh', intent: 'listening' },
  { id: 26, keyword: 'từ vựng tiếng Anh cơ bản', path: '/tu-vung-tieng-anh-co-ban', intent: 'vocab' },
  { id: 27, keyword: 'từ vựng tiếng Anh cho người mất gốc', path: '/tu-vung-tieng-anh-cho-nguoi-mat-goc', intent: 'vocab' },
  { id: 28, keyword: '500 từ vựng tiếng Anh cơ bản', path: '/500-tu-vung-tieng-anh-co-ban', intent: 'vocab' },
  { id: 29, keyword: 'từ vựng tiếng Anh A1', path: '/tu-vung-tieng-anh-a1', intent: 'vocab' },
  { id: 30, keyword: 'từ vựng tiếng Anh A2', path: '/tu-vung-tieng-anh-a2', intent: 'vocab' },
  { id: 31, keyword: 'từ vựng tiếng Anh B1', path: '/tu-vung-tieng-anh-b1', intent: 'vocab' },
  { id: 32, keyword: 'học từ vựng tiếng Anh theo chủ đề', path: '/tu-vung-tieng-anh-theo-chu-de', intent: 'vocab' },
  { id: 33, keyword: 'ngữ pháp tiếng Anh cơ bản', path: '/ngu-phap-tieng-anh-co-ban', intent: 'grammar' },
  { id: 34, keyword: 'ngữ pháp tiếng Anh cho người mất gốc', path: '/ngu-phap-tieng-anh-cho-nguoi-mat-goc', intent: 'grammar' },
  { id: 35, keyword: 'thì hiện tại đơn', path: '/ngu-phap/thi-hien-tai-don', intent: 'grammar' },
  { id: 36, keyword: 'động từ to be', path: '/ngu-phap/dong-tu-to-be', intent: 'grammar' },
  { id: 37, keyword: 'cách đặt câu tiếng Anh', path: '/cach-dat-cau-tieng-anh', intent: 'grammar' },
  { id: 38, keyword: 'học tiếng Anh mỗi ngày', path: '/hoc-tieng-anh-moi-ngay', intent: 'roadmap' },
  { id: 39, keyword: 'lộ trình học tiếng Anh 30 ngày', path: '/lo-trinh-hoc-tieng-anh-30-ngay', intent: 'roadmap' },
  { id: 40, keyword: 'lộ trình học tiếng Anh 48 ngày', path: '/lo-trinh-hoc-tieng-anh-48-ngay', intent: 'roadmap' },
];

function titleCase(keyword: string) {
  return keyword.charAt(0).toLocaleUpperCase('vi-VN') + keyword.slice(1);
}

function makeFaqs(keyword: string, target: typeof INTENT_TARGETS[SeoV4Intent]): SeoV4Faq[] {
  return [
    { question: `${titleCase(keyword)} nên bắt đầu từ đâu?`, answer: `Bạn nên bắt đầu bằng một bài kiểm tra nhỏ, chọn mục tiêu học gần nhất, rồi học theo câu ngắn thay vì gom quá nhiều tài liệu cùng lúc.` },
    { question: `Người mới có học được ${keyword} không?`, answer: `Có. PooEnglish chia nội dung thành nhiệm vụ nhỏ, có ví dụ tiếng Việt dễ hiểu và liên kết sang flow học thật phù hợp.` },
    { question: `Mỗi ngày nên học bao lâu?`, answer: `Khoảng 15 đến 25 phút là đủ cho giai đoạn đầu: 5 phút ôn, 10 phút học mới và 5 phút nói hoặc nghe lại.` },
    { question: `Nên học miễn phí hay cần tài liệu phức tạp?`, answer: `Bạn có thể bắt đầu miễn phí nếu lộ trình rõ. Điều quan trọng là học đều, có ôn lại và dùng được câu vừa học.` },
    { question: `PooEnglish giúp gì cho chủ đề này?`, answer: `PooEnglish nối trang này với ${target.ctaTo}, giúp bạn chuyển từ đọc hướng dẫn sang luyện bằng bài học, flashcard, nghe, nói hoặc shadowing.` },
  ];
}

function makePage(seed: { id: number; keyword: string; path: string; intent: SeoV4Intent }): SeoV4PageData {
  const target = INTENT_TARGETS[seed.intent];
  const heading = titleCase(seed.keyword);
  return {
    id: seed.id,
    keyword: seed.keyword,
    path: seed.path,
    intent: seed.intent,
    title: `${heading} cùng PooEnglish`,
    description: `${heading}: hướng dẫn dễ hiểu, có câu trả lời nhanh, bài tập nhỏ, lỗi thường gặp và đường học tiếp phù hợp trên PooEnglish.`,
    h1: `${heading} cho người học bận rộn`,
    quickAnswer: `${heading} hiệu quả nhất khi bạn biến mục tiêu tìm kiếm thành một buổi học thật: hiểu ý chính, làm một nhiệm vụ nhỏ, ôn lại và chuyển sang ${target.theme}.`,
    body: [
      `${heading} không nên chỉ dừng ở việc đọc một bài hướng dẫn. Người học thường cần một đường đi rõ: biết mình đang ở đâu, hôm nay học gì, và học xong phải làm được một hành động nhỏ. PooEnglish thiết kế trang này để bạn đọc nhanh, hiểu đúng ý, rồi chuyển sang flow luyện tập phù hợp.`,
      `Cách học an toàn là bắt đầu bằng câu ngắn, từ vựng gần đời sống và một nhiệm vụ có thể hoàn thành trong vài phút. Khi bạn thấy tiến bộ nhỏ mỗi ngày, việc học tiếng Anh bớt áp lực hơn và dễ duy trì hơn.`,
      `Nếu bạn đang mất gốc hoặc học lại từ đầu, đừng cố học tất cả kỹ năng cùng lúc. Hãy chọn một trọng tâm: nghe chậm, nói một câu, ôn 5 từ, hoặc ghép một mẫu câu. Sau đó quay lại lộ trình để Poo gợi ý bước tiếp theo.`,
      `Trang này cũng liên kết tới các khu vực học thật của PooEnglish để bot tìm kiếm và người học đều thấy nội dung có ích ngay trong HTML: lộ trình, speaking coach, từ vựng, shadowing, luyện nghe và ngữ pháp.`,
    ],
    tasks: [
      `Viết ra một câu mục tiêu cho ${seed.keyword}.`,
      'Chọn 5 từ hoặc 3 mẫu câu liên quan và đọc thành tiếng.',
      'Làm một lượt nghe hoặc nói thử trong flow được gợi ý.',
      'Ghi lại lỗi dễ mắc nhất rồi ôn lại vào ngày mai.',
    ],
    mistakes: [
      'Học quá nhiều nguồn cùng lúc nên không biết bài tiếp theo là gì.',
      'Chỉ đọc mẹo mà không nói, nghe hoặc viết lại câu thật.',
      'Bỏ qua ôn tập nên sau vài ngày lại quên kiến thức vừa học.',
    ],
    sevenDayPlan: [
      'Ngày 1: đọc câu trả lời nhanh và chọn điểm bắt đầu.',
      'Ngày 2: học 5 từ hoặc 2 mẫu câu cốt lõi.',
      'Ngày 3: nghe chậm và nhắc lại một câu ngắn.',
      'Ngày 4: làm bài tập nhỏ trong flow được gợi ý.',
      'Ngày 5: sửa một lỗi phát âm, từ vựng hoặc ngữ pháp.',
      'Ngày 6: ôn lại bằng flashcard hoặc chép chính tả.',
      'Ngày 7: tự nói một đoạn 20 giây và chọn bài tiếp theo.',
    ],
    faqs: makeFaqs(seed.keyword, target),
    internalLinks: target.links,
    ctaLabel: target.ctaLabel,
    ctaTo: target.ctaTo,
  };
}

export const seoV4Top1Pages: SeoV4PageData[] = SEEDS.map(makePage);
export const seoV4Routes = seoV4Top1Pages.map((page) => page.path);

export function getSeoV4PageByPath(pathname: string) {
  return seoV4Top1Pages.find((page) => page.path === pathname) ?? null;
}
