import { BLOG_POSTS, BLOG_TOPIC_LABELS, BLOG_TOPIC_PILLARS, type BlogTopic } from './blogPosts';

export type SeoLink = {
  label: string;
  to: string;
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoSection = {
  heading: string;
  paragraphs: string[];
};

export type SeoPageKind = 'pillar' | 'intent';

export type SeoPage = {
  path: string;
  kind: SeoPageKind;
  topic?: BlogTopic;
  keyword: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  quickAnswerHeading: string;
  quickAnswer: string;
  quickBullets: string[];
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
  childPostSlugs: string[];
  lastmod: string;
  priority: string;
};

const appCtas: SeoLink[] = [
  { label: 'Mở lộ trình học', to: '/learning-path' },
  { label: 'Luyện shadowing', to: '/shadowing' },
  { label: 'Ôn từ vựng', to: '/words' },
];

function topicPosts(topic: BlogTopic) {
  return BLOG_POSTS.filter((post) => post.topic === topic).map((post) => post.slug);
}

function makeSections(keyword: string, feature: string, links: SeoLink[]): SeoSection[] {
  return [
    {
      heading: `${keyword} nên được học theo vòng nhỏ`,
      paragraphs: [
        `${keyword} hiệu quả nhất khi người học có một vòng học rõ: ôn lại kiến thức cũ, học một mảnh mới, dùng lại trong câu, sau đó ghi phần còn yếu để quay lại. PooEnglish không khuyến khích học dồn hoặc nhồi quá nhiều tài liệu, vì người mới rất dễ ngợp khi chưa có bản đồ.`,
        `Trong ${feature}, Poo ưu tiên bài học ngắn, ví dụ gần đời sống và CTA rõ để người học có thể bắt đầu ngay. Khi một phần kiến thức được gặp lại qua lộ trình, shadowing và sổ từ vựng, nó có cơ hội chuyển từ nhận biết sang dùng được.`,
      ],
    },
    {
      heading: 'Cách PooEnglish nối từ vựng, nghe, nói và ngữ pháp',
      paragraphs: [
        'Một từ mới không nên chỉ nằm trong danh sách. Từ nên đi vào câu, câu nên được nghe, câu nghe được nên được nói lại, và lỗi sai nên trở thành phần ôn. Đây là cách PooEnglish xây nội dung để người học Việt Nam vừa hiểu tiếng Việt giải thích, vừa có cơ hội chạm vào tiếng Anh thật.',
        `Bạn có thể mở ${links[0]?.to ?? '/learning-path'} để xem hướng học chính, ghé /shadowing để luyện nhịp câu và dùng /words để giữ lại từ hoặc cụm cần ôn. Các liên kết này là đường bơi nội bộ giúp Google, Bing và AI Search hiểu rõ cấu trúc chủ đề của PooEnglish.`,
      ],
    },
    {
      heading: 'Lộ trình gợi ý trong 30 phút mỗi ngày',
      paragraphs: [
        'Với 30 phút, người học có thể dành 5 phút ôn bài cũ, 10 phút học nội dung mới, 7 phút luyện nghe hoặc shadowing, 5 phút làm bài nhỏ và 3 phút ghi phần cần quay lại. Nếu chỉ có 10 phút, hãy giữ một vòng tối thiểu: ôn ba từ, nghe hai câu, nói lại một câu.',
        'Nhịp này giúp việc học sống được trong ngày bận. PooEnglish xem sự quay lại đều đặn quan trọng hơn cảm hứng học thật nhiều trong một buổi rồi bỏ quên nhiều ngày. Mỗi trang SEO vì vậy đều dẫn về bài học thật thay vì chỉ dừng ở lý thuyết.',
      ],
    },
    {
      heading: 'Những điểm cần tránh khi tự học',
      paragraphs: [
        'Người học thường đổi tài liệu quá nhanh, chỉ đọc lý thuyết, học từ rời rạc hoặc tự chê phát âm quá sớm. Các lỗi này làm tiếng Anh trở thành áp lực. PooEnglish gợi ý học bằng câu nhỏ, kiểm tra nhẹ và phản hồi mềm để người học vẫn muốn quay lại.',
        `Nếu bạn đang học ${keyword}, hãy ưu tiên một bài thật, một câu nói được và một phần cần ôn. Khi hoàn thành bước nhỏ, bạn đã tạo thêm một mốc tiến bộ có thể đo được.`,
      ],
    },
  ];
}

function makeFaqs(keyword: string): SeoFaq[] {
  return [
    { question: `${keyword} có phù hợp với người mất gốc không?`, answer: 'Có, nếu bắt đầu bằng bài nhỏ, câu gần đời sống và lộ trình rõ. Người mất gốc nên ưu tiên hiểu và dùng được câu căn bản trước khi học lý thuyết dài.' },
    { question: `Nên học ${keyword} bao lâu mỗi ngày?`, answer: 'Bạn có thể bắt đầu với 15–30 phút mỗi ngày. Quan trọng là có phần ôn lại và dùng lại, không chỉ xem bài mới.' },
    { question: `PooEnglish hỗ trợ ${keyword} bằng cách nào?`, answer: 'PooEnglish kết hợp lộ trình học, shadowing, sổ từ vựng, bài nghe ngắn và nội dung giải thích tiếng Việt để người học có nhiều điểm bám.' },
    { question: 'Có thể học miễn phí không?', answer: 'Có. Bạn có thể bắt đầu bằng các trang học và tính năng chính ở chế độ khách; đăng nhập giúp lưu tiến độ tốt hơn.' },
    { question: 'Có cần học đủ mọi kỹ năng cùng lúc không?', answer: 'Không cần học nặng mọi kỹ năng trong một buổi, nhưng trong tuần nên nối từ vựng, nghe, nói và ngữ pháp để kiến thức không bị rời rạc.' },
  ];
}

function page(input: Omit<SeoPage, 'sections' | 'faqs' | 'lastmod' | 'priority'> & { priority?: string }): SeoPage {
  return {
    ...input,
    sections: makeSections(input.keyword, input.h1, input.links),
    faqs: makeFaqs(input.keyword),
    lastmod: '2026-06-11',
    priority: input.priority ?? (input.kind === 'pillar' ? '0.94' : '0.9'),
  };
}

export const SEO_PAGES: SeoPage[] = [
  page({ path: '/hoc-tieng-anh-cho-nguoi-mat-goc', kind: 'pillar', topic: 'mat-goc', keyword: 'học tiếng Anh cho người mất gốc', title: 'Học tiếng Anh cho người mất gốc - Bắt đầu lại cùng PooEnglish', description: 'Lộ trình học tiếng Anh cho người mất gốc với bài nhỏ, từ vựng gần đời sống, nghe nói nhẹ và ngữ pháp dễ hiểu cùng PooEnglish.', h1: 'Học tiếng Anh cho người mất gốc cùng PooEnglish', eyebrow: 'Cụm chủ đề mất gốc', quickAnswerHeading: 'Người mất gốc nên bắt đầu học tiếng Anh từ đâu?', quickAnswer: 'Người mất gốc nên bắt đầu bằng câu ngắn, từ vựng gần đời sống và lộ trình có bước ôn lại rõ ràng. Đừng học dồn ngữ pháp dài; hãy học một mẫu câu, nghe nó, nói lại và dùng trong tình huống thật.', quickBullets: ['Bắt đầu bằng câu dùng được.', 'Ôn từ theo chủ đề gần đời sống.', 'Dùng /48-ngay-lay-goc khi nền còn rỗng.'], links: [...appCtas, { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' }], childPostSlugs: topicPosts('mat-goc') }),
  page({ path: '/hoc-tieng-anh-mien-phi', kind: 'intent', topic: 'mien-phi', keyword: 'học tiếng Anh miễn phí', title: 'Học tiếng Anh miễn phí cùng PooEnglish', description: 'Học tiếng Anh miễn phí với lộ trình, shadowing, từ vựng và bài học nhỏ thân thiện cho người mới bắt đầu.', h1: 'Học tiếng Anh miễn phí cùng cá voi Poo', eyebrow: 'Search intent', quickAnswerHeading: 'Có thể học tiếng Anh miễn phí ở đâu?', quickAnswer: 'Bạn có thể bắt đầu học tiếng Anh miễn phí trên PooEnglish bằng lộ trình học, shadowing và sổ từ vựng. Cách tốt nhất là chọn một bài nhỏ, học một câu dùng được và quay lại ôn đều mỗi ngày.', quickBullets: ['Không cần đăng nhập để thử ngay.', 'Có lộ trình và bài học thật.', 'Phù hợp người mới và mất gốc.'], links: appCtas, childPostSlugs: topicPosts('mien-phi') }),
  page({ path: '/web-hoc-tieng-anh', kind: 'intent', keyword: 'web học tiếng Anh', title: 'Web học tiếng Anh cho người mới - PooEnglish', description: 'PooEnglish là web học tiếng Anh thân thiện với lộ trình rõ, shadowing, từ vựng và nội dung tiếng Việt dễ hiểu.', h1: 'Web học tiếng Anh cho người mới bắt đầu', eyebrow: 'Search intent', quickAnswerHeading: 'Một web học tiếng Anh tốt nên có gì?', quickAnswer: 'Một web học tiếng Anh tốt nên có lộ trình rõ, bài học nhỏ, luyện nghe nói, ôn từ vựng và cách đo tiến bộ. Người mới cần nơi học dễ quay lại hơn là quá nhiều tài liệu rời rạc.', quickBullets: ['Có route học public, crawlable.', 'Có bài học và CTA thật.', 'Có nội dung giải thích tự nhiên.'], links: appCtas, childPostSlugs: [] }),
  page({ path: '/app-hoc-tieng-anh-online', kind: 'intent', keyword: 'app học tiếng Anh online', title: 'App học tiếng Anh online cùng cá voi Poo - PooEnglish', description: 'Học tiếng Anh online cùng PooEnglish qua lộ trình, shadowing, từ vựng, luyện nghe và bài học nhỏ mỗi ngày.', h1: 'App học tiếng Anh online cùng PooEnglish', eyebrow: 'Search intent', quickAnswerHeading: 'App học tiếng Anh online nên giúp gì cho người mới?', quickAnswer: 'App học tiếng Anh online nên giúp người mới biết hôm nay học gì, ôn gì và luyện lại thế nào. PooEnglish tập trung vào bài nhỏ, shadowing, từ vựng và lộ trình để giảm cảm giác lạc hướng.', quickBullets: ['Học trên web, dễ bắt đầu.', 'Có lộ trình và tính năng luyện tập.', 'Có nội dung cho người mất gốc.'], links: appCtas, childPostSlugs: [] }),
  page({ path: '/luyen-phat-am-tieng-anh', kind: 'intent', topic: 'shadowing', keyword: 'luyện phát âm tiếng Anh', title: 'Luyện phát âm tiếng Anh bằng shadowing - PooEnglish', description: 'Luyện phát âm tiếng Anh bằng câu ngắn, nghe kỹ, nói chậm và shadowing cùng PooEnglish.', h1: 'Luyện phát âm tiếng Anh nhẹ nhàng cùng Poo', eyebrow: 'Search intent', quickAnswerHeading: 'Luyện phát âm tiếng Anh nên bắt đầu thế nào?', quickAnswer: 'Hãy bắt đầu bằng câu ngắn, nghe mẫu nhiều lần, nói chậm hơn bản gốc và chú ý âm cuối, trọng âm, ngữ điệu. Shadowing giúp bạn luyện phát âm trong câu thật thay vì chỉ đọc âm riêng lẻ.', quickBullets: ['Nghe kỹ trước khi nói.', 'Nói chậm để rõ âm.', 'Ghi lại câu khó vào /words.'], links: appCtas, childPostSlugs: topicPosts('shadowing') }),
  page({ path: '/hoc-tu-vung-tieng-anh-theo-chu-de', kind: 'intent', topic: 'tu-vung', keyword: 'học từ vựng tiếng Anh theo chủ đề', title: 'Học từ vựng tiếng Anh theo chủ đề - PooEnglish', description: 'Học từ vựng tiếng Anh theo chủ đề với câu ví dụ, nhịp ôn và sổ từ vựng cá nhân cùng PooEnglish.', h1: 'Học từ vựng tiếng Anh theo chủ đề', eyebrow: 'Search intent', quickAnswerHeading: 'Học từ vựng theo chủ đề có hiệu quả không?', quickAnswer: 'Có, nếu mỗi từ được đặt vào câu và được ôn lại trong ngữ cảnh. Chủ đề giúp não nhóm thông tin, còn câu ví dụ giúp bạn biết cách dùng từ khi nghe, nói hoặc viết.', quickBullets: ['Chọn chủ đề gần đời sống.', 'Mỗi từ có câu ví dụ.', 'Ôn bằng /words.'], links: appCtas, childPostSlugs: topicPosts('tu-vung') }),
  page({ path: '/luyen-nghe-tieng-anh-moi-ngay', kind: 'intent', topic: 'luyen-nghe', keyword: 'luyện nghe tiếng Anh mỗi ngày', title: 'Luyện nghe tiếng Anh mỗi ngày - PooEnglish', description: 'Cách luyện nghe tiếng Anh mỗi ngày với đoạn ngắn, từ khóa, transcript và shadowing nhẹ cùng PooEnglish.', h1: 'Luyện nghe tiếng Anh mỗi ngày cùng Poo', eyebrow: 'Search intent', quickAnswerHeading: 'Mỗi ngày nên luyện nghe tiếng Anh thế nào?', quickAnswer: 'Mỗi ngày hãy nghe một đoạn ngắn, tìm ý chính, bắt vài từ khóa, kiểm tra transcript và shadowing một câu. Người mới nên nghe chủ động 10–15 phút thay vì bật video dài trong nền.', quickBullets: ['Đoạn nghe ngắn và vừa sức.', 'Mỗi lượt nghe có nhiệm vụ.', 'Nói lại một câu sau khi nghe.'], links: appCtas, childPostSlugs: topicPosts('luyen-nghe') }),
  page({ path: '/ngu-phap-tieng-anh-co-ban', kind: 'intent', topic: 'ngu-phap', keyword: 'ngữ pháp tiếng Anh cơ bản', title: 'Ngữ pháp tiếng Anh cơ bản cho người mới - PooEnglish', description: 'Học ngữ pháp tiếng Anh cơ bản bằng mẫu câu đời thường, ví dụ rõ và bài luyện nhỏ trên PooEnglish.', h1: 'Ngữ pháp tiếng Anh cơ bản dễ hiểu cùng Poo', eyebrow: 'Search intent', quickAnswerHeading: 'Ngữ pháp tiếng Anh cơ bản nên học gì trước?', quickAnswer: 'Người mới nên học các mẫu câu nền như to be, have, want to, can, câu hỏi đơn giản và thì hiện tại trong ngữ cảnh đời sống. Học qua câu giúp quy tắc bớt khô và dễ dùng hơn.', quickBullets: ['Học mẫu câu trước thuật ngữ.', 'Ví dụ gần đời sống.', 'Luyện bằng bài nhỏ.'], links: appCtas, childPostSlugs: topicPosts('ngu-phap') }),
];

export const SEO_PAGE_PATHS = SEO_PAGES.map((page) => page.path);

export function getSeoPageByPath(pathname: string) {
  return SEO_PAGES.find((page) => page.path === pathname);
}

export function getPillarChildren(topic: BlogTopic) {
  const pillarPath = BLOG_TOPIC_PILLARS[topic];
  return {
    topic,
    label: BLOG_TOPIC_LABELS[topic],
    path: pillarPath,
    posts: BLOG_POSTS.filter((post) => post.topic === topic),
  };
}
