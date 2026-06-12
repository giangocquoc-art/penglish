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

export type SeoToolType = 'free' | 'roadmap' | 'speaking' | 'shadowing' | 'vocabulary' | 'grammar' | 'listening';

export type SeoSchemaType = 'Course' | 'SoftwareApplication' | 'Article';

export type SeoMiniTool = {
  type: SeoToolType;
  title: string;
  intro: string;
  primaryCta: SeoLink;
  secondaryCta?: SeoLink;
  sampleSentence?: string;
  transcript?: string;
  checklist?: string[];
  quiz?: Array<{ prompt: string; answer: string }>;
  words?: Array<{ word: string; meaning: string; example: string }>;
  comparison?: Array<{ label: string; value: string }>;
};

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
  tool: SeoMiniTool;
  schemaType: SeoSchemaType;
  lastmod: string;
  priority: string;
};

type Cluster = 'free' | 'roadmap' | 'speaking' | 'shadowing' | 'listening' | 'vocabulary' | 'grammar';

type SeoPageSeed = {
  path: string;
  keyword: string;
  cluster: Cluster;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intent: string;
  promise: string;
  avoid: string;
  dailyAction: string;
  sample?: string;
  priority?: string;
};

const CORE_LINKS: SeoLink[] = [
  { labelộ trình học', to: '/learning-path' },
  { label: 'học tiếng Anh miễn phí', to: '/hoc-tieng-anh-mien-phi' },
  { label: 'Người mất gốc bắt đầu ở đây', to: '/hoc-tieng-anh-cho-nguoi-mat-goc' },
  { label: 'Luyện nói cùng Poo', to: '/luyen-noi-tieng-anh' },
  { label: 'Luyện nghe tiếng Anh', to: '/luyen-nghe-tieng-anh' },
  { label: 'Ôn từ vựng', to: '/words' },
];

const CLUSTER_LINKS: Record<Cluster, SeoLink[]> = {
  free: [
    { label: 'học tiếng Anh online miễn phí', to: '/hoc-tieng-anh-online-mien-phi' },
    { label: 'App học tiếng Anh miễn phí', to: '/app-hoc-tieng-anh-mien-phi' },
    { label: 'Web học tiếng Anh miễn phí', to: '/web-hoc-tieng-anh-mien-phi' },
    { labelộ trình 30 ngày', to: '/lo-trinh-hoc-tieng-anh-30-ngay' },
    { label: 'Học mỗi ngày', to: '/hoc-tieng-anh-moi-ngay' },
  ],
  roadmap: [
    { labelộ trình mất gốc', to: '/lo-trinh-hoc-tieng-anh-cho-nguoi-mat-goc' },
    { label: 'học tiếng Anh từ đầu', to: '/hoc-tieng-anh-tu-dau' },
    { label: 'học tiếng Anh cơ bản', to: '/hoc-tieng-anh-co-ban' },
    { labelộ trình 48 ngày', to: '/lo-trinh-hoc-tieng-anh-48-ngay' },
    { label: 'Khóa 48 ngày trong app', to: '/48-ngay-lay-goc' },
  ],
  speaking: [
    { label: 'Luyện nói tiếng Anh', to: '/luyen-noi-tieng-anh' },
    { label: 'AI chấm phát âm', to: '/ai-cham-phat-am-tieng-anh' },
    { label: 'Kiểm tra phát âm online', to: '/kiem-tra-phat-am-tieng-anh-online' },
    { label: 'Chấm điểm phát âm', to: '/cham-diem-phat-am-tieng-anh' },
    { label: 'Mở speaking coach', to: '/speaking-coach' },
  ],
  shadowing: [
    { label: 'Shadowing là gì', to: '/blog/shadowing-la-gi' },
    { label: 'Cách luyện shadowing', to: '/blog/cach-luyen-shadowing-tieng-anh' },
    { label: 'Shadowing cho người mới', to: '/shadowing-cho-nguoi-moi-bat-dau' },
    { label: 'Luyện nghe tiếng Anh', to: '/luyen-nghe-tieng-anh' },
    { label: 'Mở phòng shadowing', to: '/shadowing' },
  ],
  listening: [
    { label: 'Luyện nghe cho người mới', to: '/luyen-nghe-tieng-anh-cho-nguoi-moi' },
    { label: 'Luyện nghe tiếng Anh chậm', to: '/luyen-nghe-tieng-anh-cham' },
    { label: 'Nghe chép chính tả', to: '/nghe-chep-chinh-ta-tieng-anh' },
    { label: 'Shadowing tiếng Anh', to: '/shadowing-tieng-anh' },
    { label: 'Video Lab', to: '/video-lab' },
  ],
  vocabulary: [
    { label: 'từ vựng mất gốc', to: '/tu-vung-tieng-anh-cho-nguoi-mat-goc' },
    { label: '500 từ cơ bản', to: '/500-tu-vung-tieng-anh-co-ban' },
    { label: 'từ vựng A1', to: '/tu-vung-tieng-anh-a1' },
    { label: 'từ vựng A2', to: '/tu-vung-tieng-anh-a2' },
    { label: 'Học theo chủ đề', to: '/tu-vung-tieng-anh-theo-chu-de' },
  ],
  grammar: [
    { label: 'ngữ pháp cơ bản', to: '/ngu-phap-tieng-anh-co-ban' },
    { label: 'ngữ pháp mất gốc', to: '/ngu-phap-tieng-anh-cho-nguoi-mat-goc' },
    { label: 'Thì hiện tại đơn', to: '/ngu-phap/thi-hien-tai-don' },
    { label: 'Động từ to be', to: '/ngu-phap/dong-tu-to-be' },
    { label: 'Cách đặt câu', to: '/cach-dat-cau-tieng-anh' },
  ],
};

function uniqueLinks(cluster: Cluster, currentPath: string): SeoLink[] {
  const seen = new Set<string>();
  return [...CLUSTER_LINKS[cluster], ...CORE_LINKS, { label: 'Blog học tiếng Anh', to: '/blog' }]
    .filter((link) => link.to !== currentPath)
    .filter((link) => {
      if (seen.has(link.to)) return false;
      seen.add(link.to);
      return true;
    })
    .slice(0, 7);
}

function topicForCluster(cluster: Cluster): BlogTopic | undefined {
  if (cluster === 'free') return 'mien-phi';
  if (cluster === 'roadmap') return 'mat-goc';
  if (cluster === 'speaking' || cluster === 'shadowing') return 'shadowing';
  if (cluster === 'listening') return 'luyen-nghe';
  if (cluster === 'vocabulary') return 'tu-vung';
  if (cluster === 'grammar') return 'ngu-phap';
  return undefined;
}

function schemaForCluster(cluster: Cluster): SeoSchemaType {
  if (cluster === 'free') return 'SoftwareApplication';
  if (cluster === 'shadowing') return 'Article';
  return 'Course';
}

function topicPosts(topic?: BlogTopic) {
  return topic ? BLOG_POSTS.filter((post) => post.topic === topic).map((post) => post.slug) : [];
}

function toolForSeed(seed: SeoPageSeed): SeoMiniTool {
  if (seed.cluster === 'free') {
    return {
      type: 'free',
      title: `Bảng thử nhanh: ${seed.keyword}`,
      intro: 'Poo cho bạn nhìn nhanh cách học miễn phí: có bài thật, có đường bơi rõ và có nútừ vựngay, không cần qua màn chờ rối rắm.',
      primaryCta: { label: 'Học thử miễn phí', to: '/learning-path' },
      secondaryCta: { label: 'Xem app học miễn phí', to: '/app-hoc-tieng-anh-mien-phi' },
      comparison: [
        { label: 'Vào học', value: 'Mở bài công khai trước, đăng nhập sau khi muốn lộ trình.' },
        { label: 'Kỹ năng', value: 'Có lộ từ vựnghe, nói và ôn lại lỗi nhỏ.' },
        { label: 'Nhịp học', value: '10–30 phát âmỗi ngữ pháp người Việt mới bắt đầu.' },
      ],
    };
  }

  if (seed.cluster === 'roadmap') {
    return {
      type: 'roadmap',
      title: `Checklist 5 phút cho ${seed.keyword}`,
      intro: 'Đánh dấu nhẹ như nhặt vỏ sò. Nếu hoàn thành 3/5 mục, hôm nay bạn đã bơi thêm một nhịp rồi đó.',
      primaryCta: { label: 'Mở bản đồ học', to: '/learning-path' },
      secondaryCta: { label: 'Thử 48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      checklist: ['Biết mục tiêu hôm nay', 'Ôn 3 từ cũ', 'Học 1 mẫu câu', 'Nghe 2 câu ngắn', 'Nói lại 1 câu với Poo'],
      quiz: [
        { prompt: 'Bạn có thể giới thiệu tên bằng tiếng Anh chưa?', answer: 'Nếu chưa, bắt đầu bằng “I am…” hoặc “My name is…”.' },
        { prompt: 'Bạn nghe được câu chào cơ bản chưa?', answer: 'Nếu chưa, chọn bài chào hỏi hoặc ngày 1 của lộ trình.' },
      ],
    };
  }

  if (seed.cluster === 'speaking') {
    return {
      type: 'speaking',
      title: `Nói thử cùng Poo: ${seed.keyword}`,
      intro: 'Bạn có thể đọc câu mẫu thật chậm, tưởng tượng đang bấm ghi âm, rồi mở Speaking Coach để Poo nghe và góp ý mềm.',
      primaryCta: { label: 'Mở Speaking Coach', to: '/speaking-coach' },
      secondaryCta: { label: 'Luyện shadowing trước', to: '/shadowing' },
      sampleSentence: seed.sample ?? 'I want to practice English every day with Poo.',
      quiz: [
        { prompt: 'Âm cuối nào dễ mất trong câu mẫu?', answer: 'Hãy để ý âm /t/, /d/, /s/ ở cuối từ.' },
        { prompt: 'Nói nhanh có tốt hơn không?', answer: 'Không. Người mới nên nói chậm, rõ và đều trước.' },
      ],
    };
  }

  if (seed.cluster === 'shadowing') {
    return {
      type: 'shadowing',
      title: `Demo nói đuổi: ${seed.keyword}`,
      intro: 'Nghe trong đầu một lượt, nhìn lời thoại, rồi nói đuổi sau Poo nửa nhịp. Không cần hoàn hảo, chỉ cần miệng chịu bơi.',
      primaryCta: { label: 'Mở phòng shadowing', to: '/shadowing' },
      secondaryCta: { label: 'Đọc cách luyện shadowing', to: '/blog/cach-luyen-shadowing-tieng-anh' },
      sampleSentence: seed.sample ?? 'I can speak a little English, and I am getting better.',
      transcript: 'Poo: Listen first. You: I can speak a little English. Poo: Nice wave! Now repeat one more time, slower.',
    };
  }

  if (seed.cluster === 'listening') {
    return {
      type: 'listening',
      title: `Nghe chậm thử: ${seed.keyword}`,
      intro: 'Poo cho bạn một mẩu nghe mini: đọc câu, che bớt chữ trong đầu, rồi trả lời câu hỏi nhỏ để kiểm tra tai vừa bắt được gì.',
      primaryCta: { label: 'Mở Video Lab', to: '/video-lab' },
      secondaryCta: { label: 'Luyện shadowing', to: '/shadowing' },
      sampleSentence: seed.sample ?? 'Poo is helping me listen to short English sentences.',
      transcript: 'Transcript mini: Poo is helping me listen to short English sentences. Từ khóa: helping, listen, short sentences.',
      quiz: [
        { prompt: 'Câu nói về ai?', answer: 'Câu nói về Poo và việc giúp bạn luyện nghe.' },
        { prompt: 'Từ khóa nào chỉ độ dài?', answer: 'Short.' },
      ],
    };
  }

  if (seed.cluster === 'vocabulary') {
    return {
      type: 'vocabulary',
      title: `Flashcard mini: ${seed.keyword}`,
      intro: 'Nhìn từ, đọc ví dụ, tự che nghĩa rồi trả lời câu đố nhỏ. từ vựng nên sống trong câu, không nằm một mình trên giấy.',
      primaryCta: { label: 'Mở sổ từ vựng', to: '/words' },
      secondaryCta: { label: 'Học từ theo chủ đề', to: '/tu-vung-tieng-anh-theo-chu-de' },
      words: [
        { word: 'daily', meaning: 'hằng ngày', example: 'I study English daily.' },
        { word: 'listen', meaning: 'nghe', example: 'I listen to one short sentence.' },
        { word: 'repeat', meaning: 'lặp lại', example: 'Please repeat after Poo.' },
        { word: 'simple', meaning: 'đơn giản', example: 'This is a simple sentence.' },
        { word: 'practice', meaning: 'luyện tập', example: 'Practice makes English friendlier.' },
      ],
      quiz: [
        { prompt: '“daily” nghĩa là gì?', answer: 'Hằng ngày.' },
        { prompt: 'Từ nào dùng khi nói “lặp lại”?', answer: 'Repeat.' },
      ],
    };
  }

  return {
    type: 'grammar',
    title: `Câu đố ngữ pháp mini: ${seed.keyword}`,
    intro: 'Chọn đáp án bằng cảm giác câu trước, rồi xem Poo gỡ rối. ngữ pháp sẽ dễ thở hơn khi nằm trong câu đời thường.',
    primaryCta: { labelộ trình ngữ pháp', to: '/learning-path' },
    secondaryCta: { label: 'Ôn cách đặt câu', to: '/cach-dat-cau-tieng-anh' },
    quiz: [
      { prompt: 'I ___ happy today. (am/is/are)', answer: 'am — đi với I.' },
      { prompt: 'She ___ English every day. (study/studies)', answer: 'studies — hiện tại đơn với she thêm s/es.' },
      { prompt: '___ you like coffee? (Do/Does)', answer: 'Do — dùng với you.' },
      { prompt: 'This is ___ apple. (a/an)', answer: 'an — apple bắt đầu bằng âm nguyên âm.' },
      { prompt: 'They ___ my friends. (am/are)', answer: 'are — đi với they.' },
    ],
  };
}

function sectionsForSeed(seed: SeoPageSeed, links: SeoLink[]): SeoSection[] {
  return [
    {
      heading: `${seed.keyword} nên bắt đầu bằng một bước thật nhỏ`,
      paragraphs: [
        `${seed.keyword} không cần bắt đầu bằng một kế hoạch quá nặng. Với người Việt mới học hoặc từng mất gốc, điều quan trọng nhất là có một việc làm được ngay: hiểu một câu, nghe một đoạn ngắn, nói lại một mẫu hoặc ôn vài từ quen. ${seed.intent}`,
        `PooEnglish thiết kế trang này để bạn vừa đọc định hướng, vừa chạm vào phần học thử ở phía trên. Poo không muốn bạn chỉ đọc lý thuyết rồi đóng tab; Poo muốn bạn có một hành động nhỏ để tiếng Anh bắt đầu hiện diện trong ngày hôm nay.`,
      ],
    },
    {
      heading: `Cách PooEnglish giúp ${seed.keyword} dễ bền hơn`,
      paragraphs: [
        `${seed.promise} Các bài học và liên kết nội bộ được nối với lộ trình, shadowing, sổ từ vựng, luyện nghe và ngữ pháp để kiến thức không bị rơi thành từng mảnh rời rạc. Khi một câu được nhìn, nghe, nói và ôn lộ trìnhớ sẽ có nhiều chỗ bám hơn.`,
        `Nếu bạn đang phân vân nên đi tiếp ở đâu, hãy dùng các đường bơi liên quan như ${links.slice(0, 3).map((link) => link.to).join(', ')}. Chúng giúp bạn chuyển từ ý định tìm kiếm sang bài học thật trong app chính.`,
      ],
    },
    {
      heading: `Lịch học nhẹ cho ${seed.keyword}`,
      paragraphs: [
        `Một buổi học vừa sức có thể gồm 5 phút ôn lại, 10 phát âmảnh mới, 7 phút nghe hoặc nói theo, 5 phát âm câu đố nhỏ và 3 phút ghi phần cần quay lại. Nếu chỉ có 10 phút, hãy giữ vòng tối thiểu: ôn 3 từ, nghe 2 câu, nói lại 1 câu.`,
        `${seed.dailyAction} Poo gọi đây là nhịp bơi nhỏ: không ồn ào, không áp lực, nhưng đủ đều để sau vài tuần bạn nhìn lại và thấy tiếng Anh bớt xa lạ hơn.`,
      ],
    },
    {
      heading: `Điều nên tránh khi học ${seed.keyword}`,
      paragraphs: [
        `${seed.avoid} Một lỗi phổ biến khác là đổi tài liệu liên tục trước khi kịp ôn lại. Người mới không thiếu tài liệu; người mới thường thiếu một đường đi đủ rõ và một cảm giác an toàn để thử sai.`,
        `Vì vậy PooEnglish giữ giọng học mềm, câu ngắn và CTA rõ. Khi làm sai, bạn chỉ cần xem đó là bọt biển báo vị trí cần thêm oxy. Sửa một lỗi nhỏ hôm nay cũng là một bước tiến thật.`,
      ],
    },
  ];
}

function faqsForSeed(seed: SeoPageSeed): SeoFaq[] {
  return [
    { question: `${seed.keyword} có phù hợp với người mất gốc không?`, answer: `Có. ${seed.keyword} phù hợp nếu bạn bắt đầu bằng câu ngắn, ví dụ gần đời sống và có phần ôn lại. PooEnglish chia bài nhỏ để người học không bị ngợp.` },
    { question: `Nên học ${seed.keyword} bao lâu mỗi ngày?`, answer: 'Bạn có thể bắt đầu với 10–30 phát âmỗi ngày. Quan trọng là đều, có ôn lại và có một hành động dùng tiếng Anh thật như nghe, nói, đặt câu hoặc làm quiz.' },
    { question: `PooEnglish có mini tool cho ${seed.keyword} không?`, answer: 'Có. Mỗi trang SEO có một phần học thử ở đầu trang: checklist, flashcard, câu đố, transcript, câu mẫu speaking hoặc bảng so sánh tùy theo cụm chủ đề.' },
    { question: `Có cần đăng nhập để xem trang ${seed.keyword} không?`, answer: 'Không. Trang này là public và có thể đọc trước. Khi vào app chính, đăng nhập chỉ giúp lộ trình học ổn định hơn.' },
    { question: `Sau khi đọc trang ${seed.keyword} nên làm gì tiếp?`, answer: 'Bạn nên bấm CTA vào lộ trình, speaking coach, shadowing, video lab hoặc sổ từ vựng để biến phần đọc từ vựng luyện thật.' },
    { question: `PooEnglish khác gì bài blog tĩnh về ${seed.keyword}?`, answer: 'Trang không chỉ có nội dung SEO. Poo thêm mini tool, FAQ, liên kết nội bộ và schema để người học vừa hiểu định hướng vừa có thể thử học ngay.' },
  ];
}

function quickBulletsForSeed(seed: SeoPageSeed): string[] {
  const byCluster: Record<Cluster, string[]> = {
    free: ['Học thử trước khi đăng nhập.', 'Có lộ từ vựnghe nói và ôn tập.', 'CTA đưa thẳng vào bài học thật.'],
    roadmap: ['Biết hôm nay học gì.', 'Có checklist và test nhẹ.', 'Phù hợp người mới hoặc mất gốc.'],
    speaking: ['Có câu mẫu để nói thử.', 'Tập phát âm và rõ.', 'Dẫn về Speaking Coach hoặc shadowing.'],
    shadowing: ['Nghe mẫu rồi nói đuổi.', 'Có transcript mini.', 'Luyện từng câu, không ép nói nhanh.'],
    listening: ['Nghe đoạn ngắn trước.', 'Có transcript và câu hỏi kiểm tra.', 'Nối nghe với shadowing.'],
    vocabulary: ['Có flashcard và quiz nhỏ.', 'Từ nằm trong câu ví dụ.', 'Dẫn về sổ từ vựng để ôn lại.'],
    grammar: ['Học qua mẫu câu.', 'Có micro quiz 5 câu.', 'Giải thích nhẹ cho người mất gốc.'],
  };
  return byCluster[seed.cluster];
}

function page(seed: SeoPageSeed): SeoPage {
  const topic = topicForCluster(seed.cluster);
  const links = uniqueLinks(seed.cluster, seed.path);
  return {
    path: seed.path,
    kind: seed.priority === '0.94' ? 'pillar' : 'intent',
    topic,
    keyword: seed.keyword,
    title: seed.title,
    description: seed.description,
    h1: seed.h1,
    eyebrow: seed.eyebrow,
    quickAnswerHeading: `Trả lời nhanh: ${seed.keyword} nên học thế nào?`,
    quickAnswer: `${seed.keyword} nên được học bằng bước nhỏ, có ví dụ thật và có phần luyện ngay sau khi đọc. ${seed.promise}`,
    quickBullets: quickBulletsForSeed(seed),
    sections: sectionsForSeed(seed, links),
    faqs: faqsForSeed(seed),
    links,
    childPostSlugs: topicPosts(topic),
    tool: toolForSeed(seed),
    schemaType: schemaForCluster(seed.cluster),
    lastmod: '2026-06-12',
    priority: seed.priority ?? '0.9',
  };
}

const seeds: SeoPageSeed[] = [
  { path: '/hoc-tieng-anh-mien-phi', keyword: 'học tiếng Anh miễn phí', cluster: 'free', title: 'học tiếng Anh miễn phí cùng PooEnglộ trìnhỏ, dễ bắt đầu', descriptiếng Anh miễn phí trên PooEnglish với lộ trình, shadowing, từ vựng, luyện nghe và mini tool học thử cho người Việt mới bắt đầu.', học tiếng Anh miễn phí cùng cá voi Poo', eyebrow: 'Học thử miễn phí', intent: 'Bạn cần một nơi vào học nhanh, không bị chặn bởi quá nhiều bước và vẫn thấy rõ hôm nay nên học gì.', promise: 'Poo cho bạn học thử bằng lộ trình public, bài nhỏ và các khu luyện tập có CTA rõ.', avoid: 'Đừng gom quá nhiều link miễn phí rồi không học trang nào đến nơi.', dailyAction: 'Hôm nay hãy mở một bài nhỏ, nghe một câu và lưu lại ba từ cần ôn.', priority: '0.94' },
  { path: '/hoc-tieng-anh-cho-nguoi-mat-goc', keyword: 'học tiếng Anh cho người mất gốc', cluster: 'roadmap', title: 'học tiếng Anh cho người mất gốc - Bắt đầu lại nhẹ cùng PooEnglish', description: 'lộ trìnhọc tiếng Anh cho người mất gốc với checklist, test nhẹ, bài nhỏ, nghe nói chậm và ngữ pháp dễ hiểu cùng PooEnglishọc tiếng Anh cho người mất gốc cùng PooEnglish', eyebrow: 'Mất gốc bắt đầu lại', intent: 'Bạn cần xây lại niềm tin trước khi học kiến thức lớn.', promise: 'Poo bắt đầu từ câu chào, từ quen, mẫu câu nền và nhịp ôn lại để nền không rỗng thêm.', avoid: 'Đừng bắt đầu bằng sách ngữ pháp dày hoặc video quá nhanh.', dailyAction: 'Hôm nay hãy tự nói một câu giới thiệu bản từ vựnghe lại hai câu chào hỏi.', priority: '0.94' },
  { path: '/lo-trinh-hoc-tieng-anh-cho-nguoi-mat-goc', keyword: 'lộ trìnhọc tiếng Anh cho người mất gốc', cluster: 'roadmap', titlộ trìnhọc tiếng Anh cho người mất gốc - Bản đồ êm cùng Poo', description: 'Bản đồ học tiếng Anh cho người mất gốc: học từ đầu, luyện nghe nói, ôn từ vựngữ pháp căn bản và checklist mỗi ngày.', h1: 'lộ trìnhọc tiếng Anh cho người mất gốc rõ từng bước', eyebrow: 'Bản đồ lấy gốc', intent: 'Bạn cần biết thứ tự học thay vì tự bơi giữa quá nhiều tài liệu.', promise: 'Poo chia hành trình thành nền âm, từ vựng, mẫu câu, nghe chậm, shadowing và ôn lại.', avoid: 'Đừng đổi lộ trình mỗi tuần chỉ vì thấy một video mới hấp dẫn.', dailyAction: 'Hôm nay hãy chọn đúng chặng hiện tại rồi hoàn thành một nút học nhỏ.' },
  { path: '/hoc-tieng-anh-tu-dau', keyword: 'học tiếng Anh từ đầu', cluster: 'roadmap', title: 'học tiếng Anh từ đầu cho người Việt - Poo dẫn từng bước nhỏ', descriptiếng Anh từ đầu bằng câu đơn giản, từ vựng gần đời sống, nghe chậm, nói lại và checklist mini cùng cá voi Poo.', học tiếng Anh từ đầu không bị ngợp cùng Poo', eyebrow: 'Bắt đầu từ số 0', intent: 'Bạn cần một điểm xuất phátừ vựng bị so sánh với người học lâu năm.', promise: 'Poo ưu tiên các câu dùng được ngay như chào hỏi, giới thiệu, nói nhu cầu và thói quen.', avoid: 'Đừng ép mình học mọi thì và mọi loại từ ngay tuần đầu.', dailyAction: 'Hôm nay hãy học 5 từ quen, 1 câu chào và 1 câu nói tên.' },
  { path: '/hoc-tieng-anh-co-ban', keyword: 'học tiếng Anh cơ bản', cluster: 'roadmap', title: 'học tiếng Anh cơ bản - Nền từ vựnghe nói, ngữ phápoo', descriptiếng Anh cơ bản với mini checklist, câu mẫu đời thường, lộ trình public và CTA vào bài học thật trên PooEnglishọc tiếng Anh cơ bản vững từng nhịp nhỏ', eyebrow: 'Nền tảng cơ bản', intent: 'Bạn cần gom lại các mảnh căn bản thành một đường học dễ theo.', promise: 'Poo nối từ vựng cơ bản với câu mẫu, nghe chậm và câu đố nhỏ để bạn nhớ bằng ngữ cảnh.', avoid: 'Đừng chỉ đọc lý thuyết cơ bản mà không đặt câu hoặc nghe âm thanh.', dailyAction: 'Hôm nay hãy dùng một mẫu câu cơ bản để tự nói về bản thân.' },
  { path: '/hoc-tieng-anh-online-mien-phi', keyword: 'học tiếng Anh online miễn phí', cluster: 'free', title: 'học tiếng Anh online miễn phí - Học thử ngay trên PooEnglish', descriptiếng Anh online miễn phí với web app PooEnglish: bài public, mini toolộ trình, shadowing và từ vựngười mới.', học tiếng Anh online miễn phí cùng PooEnglish', eyebrow: 'Online miễn phí', intent: 'Bạn muốn học trên trình duyệt, mở được ngay và không phải tải quá nhiều thứ.', promise: 'Poo đưa bạn vào các vùng học online có nội dung thật: lộ trình, shadowing, sổ từ vựnghe nói.', avoid: 'Đừng chỉ lưu khóa online miễn phí rồi để đó.', dailyAction: 'Hôm nay hãy mở web, hoàn thành một bài ngắn và nói lại một câu.' },
  { path: '/app-hoc-tieng-anh-mien-phi', keyword: 'app học tiếng Anh miễn phí', cluster: 'free', title: 'App học tiếng Anh miễn phí cùng cá voi Poo - PooEnglish', description: 'PooEnglish là app/web học tiếng Anh miễn phí để thử lộ trình, luyện nói, ôn từ vựnghe chậm với mascot cá voi Poo.', học tiếng Anh miễn phí dễ thương cùng Poo', eyebrow: 'App học thử', intent: 'Bạn muốn một app có cảm giác thân thiện, không chỉ là danh sách bài học khô.', promise: 'PooEnglish chạy như web app, giúp bạn vào học nhanh trên máy tính hoặc điện thoại.', avoid: 'Đừng chọn app chỉ vì nhiều bài nếu bạn không biết hôm nay học bài nào.', dailyAction: 'Hôm nay hãy ghim PooEnglish và mở mộtừ vựng học 10 phút.' },
  { path: '/web-hoc-tieng-anh-mien-phi', keyword: 'web học tiếng Anh miễn phí', cluster: 'free', title: 'Web học tiếng Anh miễn phí cho người mới - PooEnglish', description: 'Web học tiếng Anh miễn phí PooEnglish có landing SEO, mini toolộ trình học, shadowing, từ vựngữ pháp cho người Việt.', học tiếng Anh miễn phí cho người Việt mới bắt đầu', eyebrow: 'Web học public', intent: 'Bạn cần một website mở được ngay, có nội dung công khai và có đường vào học thật.', promise: 'PooEnglish không chỉ là bài viết; mỗi trang dẫn về app chính và có công cụ học thử theo cụm kỹ năng.', avoid: 'Đừng để web học biến thành một thư mục bookmark không bao giờ mở lại.', dailyAction: 'Hôm nay hãy mở một trang kỹ năng và bấm CTA vào hoạt động thực hành.' },
  { path: '/hoc-tieng-anh-giao-tiep', keyword: 'học tiếng Anh giao tiếp', cluster: 'speaking', title: 'học tiếng Anh giao tiếp - Nói câu nhỏ trước cùng PooEnglish', descriptiếng Anh giao tiếp bằng câu mẫu, speaking demo, shadowing và phản hồi mềm cho người Việt mới bắt đầu.', học tiếng Anh giao tiếp bằng câu nhỏ cùng Poo', eyebrow: 'Giao tiếp nhẹ nhàng', intent: 'Bạn muốn nói được câu đời thường thay vì chỉ biết công thức trên giấy.', promise: 'Poo bắt đầu từ mẫu câu chào hỏi, giới thiệu, hỏi nhu cầu và câu phản hồi ngắn.', avoid: 'Đừng chờ phát âm hoàn hảo mới dám nói.', dailyAction: 'Hôm nay hãy nói chậm một câu giới thiệu và một câu hỏi đơn giản.', sample: 'Hi, I am learning English with Poo.' },
  { path: '/tieng-anh-giao-tiep-co-ban', keyword: 'tiếng Anh giao tiếp cơ bản', cluster: 'speaking', tiếng Anh giao tiếp cơ bản - Câu mẫu dễ dùng cùng Poo', descriptiếng Anh giao tiếp cơ bản cho người mất gốc: câu chào hỏi, giới thiệu, hỏi đáp ngắn và CTA luyện nói cùng Poo.', h1: 'tiếng Anh giao tiếp cơ bản cho người mới', eyebrow: 'Câu nói căn bản', intent: 'Bạn cần những câu đủ dùng trước khi học hội thoại dài.', promise: 'Poo gom mẫu câu nền để bạn biết nói gì trong tình huống quen thuộc.', avoid: 'Đừng học thuộc đoạn hội thoại quá dài khi chưa nắm câu ngắn.', dailyAction: 'Hôm nay hãy luyện 3 câu: chào, nói tên, hỏi lại người đối diện.', sample: 'Nice to meet you. What is your name?' },
  { path: '/luyen-noi-tieng-anh', keyword: 'luyện nói tiếng Anh', cluster: 'speaking', title: 'Luyện nói tiếng Anh cùng Poo - Bớt ngại miệng từng câu', description: 'Luyện nói tiếng Anh bằng câu mẫu, shadowing, speaking coach và mini demo phát âm cho người Việt mới học.', h1: 'Luyện nói tiếng Anh nhẹ nhàng cùng cá voi Poo', eyebrow: 'Nói thành tiếng', intent: 'Bạn cần một nơi để mở miệng an toàn, không bị chê khi câu chưa khớp.', promise: 'Poo cho bạn nói câu ngắn, nghe lại, sửa nhẹ âm cuối và nhịp câu.', avoid: 'Đừng chỉ luyện nói trong đầu; tiếng Anh cần đi qua miệng để thành phản xạ.', dailyAction: 'Hôm nay hãy nói thành tiếng 5 câu ngắn, chậm hơn bình thường.', sample: 'I can say one small sentence today.' },
  { path: '/luyen-noi-tieng-anh-voi-ai', keyword: 'luyện nói tiếng Anh với ai', cluster: 'speaking', title: 'Luyện nói tiếng Anh với ai? Thử nói cùng Poo trước cho đỡ ngại', description: 'Gợi ý luyện nói tiếng Anh với ai: tự luyện cùng Poo, speaking coach, shadowing và các câu mẫu an toàn cho người mới.', h1: 'Luyện nói tiếng Anh với ai khi bạn còn ngại?', eyebrow: 'Bạn nói cùng ai?', intent: 'Bạn muốn có người nghe nhưng chưa sẵn sàng nói với người lạ.', promise: 'Poo đóng vai bạn học mềm: cho câu mẫu, mở hoạt động nói và nhắc bạn nói lại nhẹ.', avoid: 'Đừng đợi có partner hoàn hảo mới bắt đầu luyện nói.', dailyAction: 'Hôm nay hãy nói với Poo một câu trước, rồi mới nghĩ đến partner thật.', sample: 'Can I practice English with you?' },
  { path: '/ai-cham-phat-am-tieng-anh', keyword: 'ai chấm phát âm tiếng Anh', cluster: 'speaking', title: 'AI chấm phát âm tiếng Anh - Poo góp ý mềm, không làm bạn sợ', description: 'AI chấm phát âm tiếng Anh trên PooEnglish giúp người học nói câu mẫu, nghe phản hồi mềm và luyện lại âm chưa khớp.', h1: 'AI chấm phát âm tiếng Anh cùng PooEnglish', eyebrow: 'AI phát âm', intent: 'Bạn cần phản hồi về phát âm nhưng không muốn cảm giác bị kiểm tra căng thẳng.', promise: 'Poo ưu tiên góp ý dễ hiểu: âm nào cần rõ hơn, nhịp nào nên chậm lại, câu nào nên nói lại.', avoid: 'Đừng xem điểm phát âm là lời phán xét năng lực.', dailyAction: 'Hôm nay hãy chọn một câu mẫu và luyện lại cho rõ âm cuối.', sample: 'I need a little more practice.' },
  { path: '/luyen-phat-am-tieng-anh', keyword: 'luyện phát âm tiếng Anh', cluster: 'speaking', title: 'Luyện phát âm tiếng Anh bằng câu ngắn - PooEnglish', description: 'Luyện phát âm tiếng Anh bằng câu mẫu, shadowing, AI feedback và mẹo nói chậm rõ cho người Việt mất gốc.', h1: 'Luyện phát âm tiếng Anh nhẹ nhàng cùng Poo', eyebrow: 'phát âm rõ hơn', intent: 'Bạn muốn nói rõ hơn nhưng chưa biết bắt đầu từ âm nào.', promise: 'Poo đưa phát âm vào câu thật để bạn luyện âm cuối, trọng âm và nhịp nói trong ngữ cảnh.', avoid: 'Đừng luyện từng âm rời rạc quá lâu mà quên nói thành câu.', dailyAction: 'Hôm nay hãy chọn một câu 5–7 từ và nói lại 3 lần.', sample: 'I study English in the morning.' },
  { path: '/app-luyen-phat-am-tieng-anh-mien-phi', keyword: 'app luyện phát âm tiếng Anh miễn phí', cluster: 'speaking', title: 'App luyện phát âm tiếng Anh miễn phí - Nói thử cùng Poo', description: 'Tìm app luyện phát âm tiếng Anh miễn phí? PooEnglish có shadowing, speaking coach, câu mẫu và mini demo cho người mới.', h1: 'App luyện phát âm tiếng Anh miễn phí cùng Poo', eyebrow: 'App phát âm', intent: 'Bạn muốn thử luyện phát âm trước khi đầu từ vựngữ pháp.', promise: 'PooEnglish cho bạn đi từ nghe mẫu, nói chậm, nhận gợi ý và luyện lại từ vựng nhỏ.', avoid: 'Đừng tải nhiều app phát âm cùng lúc rồi không luyện đủ một câu.', dailyAction: 'Hôm nay hãy mở một công cụ và hoàn thành một câu phát âm duy nhất.', sample: 'Please listen and repeat after me.' },
  { path: '/kiem-tra-phat-am-tieng-anh-online', keyword: 'kiểm tra phát âm tiếng Anh online', cluster: 'speaking', title: 'Kiểm tra phát âm tiếng Anh online - Câu mẫu và góp ý cùng Poo', description: 'Kiểm tra phát âm tiếng Anh online bằng câu mẫu, speaking CTA và mẹo sửa âm cuối, trọng âm, nhịp nói trên PooEnglish.', h1: 'Kiểm tra phát âm tiếng Anh online nhẹ nhàng', eyebrow: 'Test phát âm online', intent: 'Bạn muốn biết mình nói có rõ không mà không cần đặt lịch với giáo viên ngay.', promise: 'Poo giúp bạn kiểm tra bằng câu ngắn và phản hồi theo hướng luyện tiếp, không dán nhãn đúng sai nặng nề.', avoid: 'Đừng kiểm tra quá nhiều câu một lúc khiến miệng mệt và dễ nản.', dailyAction: 'Hôm nay hãy kiểm tra một câu, ghi một âm cần sửa và luyện lại.', sample: 'The little whale is swimming slowly.' },
  { path: '/cham-diem-phat-am-tieng-anh', keyword: 'chấm điểm phát âm tiếng Anh', cluster: 'speaking', title: 'Chấm điểm phát âm tiếng Anh - Hiểu độ khớp, sửa từng âm nhỏ', description: 'Chấm điểm phát âm tiếng Anh cùng PooEnglish: xem độ khớp như tín hiệu luyện tập, khôngữ pháp lực thành tích.', h1: 'Chấm điểm phát âm tiếng Anh theo cách dịu hơn', eyebrow: 'Độ khớp phát âm', intent: 'Bạn muốn có con số tham khảo nhưng không muốn bị điểm số làm sợ nói.', promise: 'Poo xem độ khớp như bản đồ: phần nào rõ thì giữ, phần nào mờ thì luyện lại nhẹ.', avoid: 'Đừng lặp một câu quá nhiều lần chỉ để đạt điểm tuyệt đối.', dailyAction: 'Hôm nay hãy cải thiện một chi tiết: âm cuối, trọng âm hoặc nhịp ngắt.', sample: 'I can improve one sound today.' },
  { path: '/shadowing-tieng-anh', keyword: 'shadowing tiếng Anh', cluster: 'shadowing', title: 'Shadowing tiếng Anh - Nói đuổi từng câu nhỏ cùng PooEnglish', description: 'Shadowing tiếng Anh là cách nghe và nói đuổi để luyện phát âm, phản xạ nghe nói. PooEnglish có demo, transcript và CTA luyện ngay.', h1: 'Shadowing tiếng Anh cùng PooEnglish', eyebrow: 'Nói đuổi cùng Poo', intent: 'Bạn muốn từ vựngữ pháp tự nhiên hơn thay vì chỉ đọc chữ.', promise: 'Poo chia shadowing thành câu ngắn: nghe, hiểu, nói theo, nghe lại và lặp câu khó.', avoid: 'Đừng cố đuổi tốc độ bản gốc ngay từ lần đầu.', dailyAction: 'Hôm nay hãy shadowing 3 câu ngắn và lưu lại câu khó nhất.', priority: '0.94', sample: 'I can speak a little English every day.' },
  { path: '/shadowing-cho-nguoi-moi-bat-dau', keyword: 'luyện shadowing cho người mới bắt đầu', cluster: 'shadowing', title: 'Luyện shadowing cho người mới bắt đầu - Câu ngắn, chậm, dễ theo', description: 'Luyện shadowing cho người mới bắt đầu với transcript mini, câu mẫu chậm và cách nói đuổi không bị ngợp cùng cá voi Poo.', h1: 'Luyện shadowing cho người mới bắt đầu cùng Poo', eyebrow: 'Shadowing nhập môn', intent: 'Bạn cần phiên bản shadowing thật chậm và rõ trước khi luyện video dài.', promise: 'Poo chọn câu ngắn, chủ đề quen và hướng dẫn nghe hiểu trước khi nói theo.', avoid: 'Đừng chọn đoạn phim nhanh hoặc quá nhiều từ lạ khi mới bắt đầu.', dailyAction: 'Hôm nay hãy nghe một câu 3 lần rồi nói theo chậm 2 lần.', sample: 'I am ready to learn one small sentence.' },
  { path: '/luyen-nghe-tieng-anh', keyword: 'luyện nghe tiếng Anh', cluster: 'listening', title: 'Luyện nghe tiếng Anh - Nghe chậm, hiểu chắc cùng PooEnglish', description: 'Luyện nghe tiếng Anh bằng đoạn ngắn, transcript, dictation mini và shadowing nhẹ cho người Việt mới bắt đầu.', h1: 'Luyện nghe tiếng Anh bằng đoạn nhỏ cùng Poo', eyebrow: 'Nghe sóng tiếng Anh', intent: 'Bạn muốn nghe hiểu hơn nhưng đang dễ bị trôi khi âm thanh quá nhanh.', promise: 'Poo chia phần nghe thành ý chính, từ khóa, transcript và một câu nói lại.', avoid: 'Đừng bật video dài trong nền rồi tự trách mình không hiểu.', dailyAction: 'Hôm nay hãy nghe 20 giây, bắt 3 từ khóa và nói lại 1 câu.', priority: '0.94' },
  { path: '/luyen-nghe-tieng-anh-cho-nguoi-moi', keyword: 'luyện nghe tiếng Anh cho người mới bắt đầu', cluster: 'listening', title: 'Luyện nghe tiếng Anh cho người mới bắt đầu - Poo cho nghe chậm', description: 'Người mới luyện nghe tiếng Anh bằng câu ngắn, từ quen, transcript và quiz nhỏ để tai quen dần mà không bị ngợp.', h1: 'Luyện nghe tiếng Anh cho người mới bắt đầu', eyebrow: 'Tai làm quen', intent: 'Bạn cần đoạn nghe vừa sức và có mục tiêu rõ.', promise: 'Poo ưu tiên câu ngắn, tốc độ nhẹ và câu hỏi nhỏ để bạn biếtừ vựnghe được gì.', avoid: 'Đừng bắt đầu bằng podcast dài khi từ nền còn ít.', dailyAction: 'Hôm nay hãy nghe một câu chào hỏi và chép lại 3 từ bạn nghe được.' },
  { path: '/luyen-nghe-tieng-anh-cham', keyword: 'luyện nghe tiếng Anh chậm', cluster: 'listening', title: 'Luyện nghe tiếng Anh chậm - Nghe rõ từng nhịp cùng Poo', description: 'Luyện nghe tiếng Anh chậm với câu mẫu, transcript, quiz nghe hiểu và gợi ý shadowing cho người mất gốc.', h1: 'Luyện nghe tiếng Anh chậm để hiểu chắc hơn', eyebrow: 'Nghe chậm rõ', intent: 'Bạn cần giảm tốc để tai nhận diện từ và nhịp câu.', promise: 'Poo cho bạn nghe câu ngắn, đọc transcript đúng lúc và lặp lại ở tốc độ dễ thở.', avoid: 'Đừng xem nghe chậm là yếu; đó là cách xây nền tai rất bình thường.', dailyAction: 'Hôm nay hãy nghe một câu chậm, dừng lại ở từng cụm và nhắc theo.' },
  { path: '/nghe-chep-chinh-ta-tieng-anh', keyword: 'nghe chép chính tả tiếng Anh', cluster: 'listening', title: 'Nghe chép chính tả tiếng Anh - Dictation mini cùng PooEnglish', description: 'Nghe chép chính tả tiếng Anh bằng câu ngắn, transcript ẩn hiện và quiz mini để luyện tai bắt từ khóa.', h1: 'Nghe chép chính tả tiếng Anh từng câu nhỏ', eyebrow: 'Dictation mini', intent: 'Bạn muốn kiểm tra tai có bắt được từng từ trong câu không.', promise: 'Poo biến dictation thành trò nhỏ: nghe, đoán chữ, mở transcript và sửa nhẹ.', avoid: 'Đừng chọn đoạn quá dài khiến việc chép chính tả thành áp lực.', dailyAction: 'Hôm nay hãy chép một câu 6–8 từ và so lại transcript.' },
  { path: '/tu-vung-tieng-anh-co-ban', keyword: 'từ vựng Anh cơ bản', cluster: 'vocabulary', titừ vựng Anh cơ bản - Flashcard và câu ví dụ cùng Poo', description: 'Học từ vựng Anh cơ bản bằng flashcard, quiz 5 từ, câu ví dụ và sổ ôn trên PooEnglish.', h1: 'từ vựng Anh cơ bản cho người mới', eyebrow: 'Vỏ sò từ vựng', intent: 'Bạn cần nhóm từ dùng được trong câu đời thường trước.', promise: 'Poo đặt từ cơ bản vào ví dụ ngắn để bạn biết cách dùng, không chỉ biết nghĩa.', avoid: 'Đừng học danh sách 100 từ mà không có câu ví dụ.', dailyAction: 'Hôm nay hãy học 5 từ và đặt mỗi từ vào một câu thật ngắn.', priority: '0.94' },
  { path: '/tu-vung-tieng-anh-cho-nguoi-mat-goc', keyword: 'từ vựng Anh cho người mất gốc', cluster: 'vocabulary', titừ vựng Anh cho người mất gốc - Học ít, dùng được ngay', descriptừ vựng Anh cho người mất gốc với flashcard mini, câu ví dụ, quiz nhẹ và CTA ôn trong sổ từ PooEnglish.', h1: 'từ vựng Anh cho người mất gốc dễ nhớ', eyebrow: 'Từ nền tảng', intent: 'Bạn cần học lại từ quen nhất để có nguyên liệu đặt câu.', promise: 'Poo chọn từ gần đời sống: bản thân, gia đình, thời gian, cảm xúc và hành động thường ngày.', avoid: 'Đừng bắt đầu bằng từ hiếm hoặc danh sách học thuật quá xa đời sống.', dailyAction: 'Hôm nay hãy chọn 5 từ về bản thân và tự nói 2 câu.' },
  { path: '/500-tu-vung-tieng-anh-co-ban', keyword: '500 từ vựng Anh cơ bản', cluster: 'vocabulary', title: '500 từ vựng Anh cơ bản - Học theo cụm nhỏ cùng Poo', description: 'Cách học 500 từ vựng Anh cơ bản theo chủ đề, flashcard mini, quiz và lộ trình ôn để không bị nhồi nhét.', h1: '500 từ vựng Anh cơ bản học theo cụm nhỏ', eyebrow: '500 vỏ sò nhỏ', intent: 'Bạn muốn có danh sách nền nhưng cần cách chia nhỏ để nhớ lâu.', promise: 'Poo gợi ý chia 500 từ thành cụm 5–10 từ, có câu ví dụ và lịch ôn.', avoid: 'Đừng cố nuốt 500 từ vựngày.', dailyAction: 'Hôm nay hãy học 10 từ đầu tiên và ôn lại sau 24 giờ.' },
  { path: '/tu-vung-tieng-anh-a1', keyword: 'từ vựng Anh A1', cluster: 'vocabulary', titừ vựng Anh A1 - Nhóm từ đầu tiên cho người mới', descriptừ vựng Anh A1 theo chủ đề đơn giản, flashcard, quiz nhỏ và câu ví dụ thân thiện cùng PooEnglish.', h1: 'từ vựng Anh A1 cho bước học đầu tiên', eyebrow: 'Cấp độ A1', intent: 'Bạn cần nhóm từ cơ bản nhất để hiểu và nói câu rất ngắn.', promise: 'Poo ưu tiên từ A1 về bản thân, đồ vật, thời gian, số đếm và hoạt động hằng ngày.', avoid: 'Đừng nhảy lên từ khó khi từ A1 còn chưa dùng được trong câu.', dailyAction: 'Hôm nay hãy học 5 từ vựng chúng trong câu “I have…”.' },
  { path: '/tu-vung-tieng-anh-a2', keyword: 'từ vựng Anh A2', cluster: 'vocabulary', titừ vựng Anh A2 - Mở rộng câu đời thường cùng Poo', description: 'Học từ vựng Anh A2 bằng flashcard, quiz mini, câu ví dụ và chủ đề sinh hoạt để nối tiếp nền A1.', h1: 'từ vựng Anh A2 để nói rõ hơn mỗi ngày', eyebrow: 'Cấp độ A2', intent: 'Bạn đã có chút nền và muốn nói được nhiều tình huống hơn.', promise: 'Poo mở rộng sang thói quen, kế hoạch, cảm xúc, di chuyển và nhu cầu đời thường.', avoid: 'Đừng chỉ học nghĩa mà quên cụm từ đi kèm.', dailyAction: 'Hôm nay hãy chọn 5 từ A2 và đặt 2 câu về thói quen.' },
  { path: '/tu-vung-tieng-anh-b1', keyword: 'từ vựng Anh B1', cluster: 'vocabulary', titừ vựng Anh B1 - Nâng câu dài hơn nhưng vẫn dễ thở', descriptừ vựng Anh B1 cho người muốn nói ý rõ hơn, học theo chủ đề, ví dụ và quiz mini cùng PooEnglish.', h1: 'từ vựng Anh B1 học theo ngữ cảnh', eyebrow: 'Cấp độ B1', intent: 'Bạn muốn chuyển từ câu rất ngắn sang diễn đạt ý rõ hơn.', promise: 'Poo giúp từ B1 đi kèm ví dụ, tình huống và hoạt động nói hoặc viết ngắn.', avoid: 'Đừng học từ B1 như một danh sách rời khỏi chủ đề.', dailyAction: 'Hôm nay hãy học 5 từ B1 và viết một đoạn 3 câu.' },
  { path: '/tu-vung-tieng-anh-theo-chu-de', keyword: 'học từ vựng Anh theo chủ đề', cluster: 'vocabulary', title: 'Học từ vựng Anh theo chủ đề - Nhớ bằng câu cùng Poo', description: 'Học từ vựng Anh theo chủ đề với flashcard, quiz 5 từ, ví dụ đời thường và sổ ôn từ vựng trên PooEnglish.', h1: 'Học từ vựng Anh theo chủ đề dễ nhớ hơn', eyebrow: 'Chủ đề từ vựng', intent: 'Bạn muốn nhóm từ lại để não dễ sắp xếp và dùng trong tình huống thật.', promise: 'Poo chia từ theo chủ đề quen như bản thân, gia đình, đồ ăn, trường học, công việc và cảm xúc.', avoid: 'Đừng chỉ chép từ theo chủ đề mà không nói hoặc viết câu.', dailyAction: 'Hôm nay hãy chọn mộtừ vựng 5 từ trong một đoạn mini.' },
  { path: '/ngu-phap-tieng-anh-co-ban', keyword: 'ngữ pháp tiếng Anh cơ bản', cluster: 'grammar', title: 'ngữ pháp tiếng Anh cơ bản - Micro quiz dễ hiểu cùng Poo', description: 'ngữ pháp tiếng Anh cơ bản cho người mới: học qua mẫu câu, micro quiz 5 câu, ví dụ đời thường và CTA vào lộ trình.', h1: 'ngữ pháp tiếng Anh cơ bản dễ hiểu cùng Poo', eyebrow: 'Mẫu câu nền', intent: 'Bạn cần hiểu khung câu mà không bị thuật ngữ làm rối.', promise: 'Poo giải thích ngữ pháp bằng mẫu câu gần đời sống và câu đố nhỏ ngay trên trang.', avoid: 'Đừng học quy tắc dài mà không thử đặt câu.', dailyAction: 'Hôm nay hãy làm 5 câu micro quiz rồi tự viết một câu tương tự.', priority: '0.94' },
  { path: '/ngu-phap-tieng-anh-cho-nguoi-mat-goc', keyword: 'ngữ pháp tiếng Anh cho người mất gốc', cluster: 'grammar', title: 'ngữ pháp tiếng Anh cho người mất gốc - Học mẫu câu trước', description: 'ngữ pháp tiếng Anh cho người mất gốc bằng mẫu câu, quiz nhẹ, ví dụ tiếng Việt dễ hiểu và lộ trình cùng PooEnglish.', h1: 'ngữ pháp tiếng Anh cho người mất gốc học thật mềm', eyebrow: 'Gỡ rối ngữ pháp', intent: 'Bạn cần bắt đầu lại từ cấu trúc dễ dùng nhất.', promise: 'Poo ưu tiên to be, hiện tại đơn, câu hỏi cơ bản, trật tự từ và cách đặt câu đời thường.', avoid: 'Đừng học tất cả thì cùng lúc khi câu đơn còn chưa chắc.', dailyAction: 'Hôm nay hãy học một mẫu “I am…” và đổi 3 từ để tạo 3 câu mới.' },
  { path: '/ngu-phap/thi-hien-tai-don', keyword: 'thì hiện tại đơn', cluster: 'grammar', title: 'Thì hiện tại đơn - Cách dùng dễ hiểu và quiz mini cùng Poo', description: 'Học thì hiện tại đơn với ví dụ thói quen, dấu hiệu nhận biết, micro quiz 5 câu và cách sửa lỗi nhẹ nhàng.', h1: 'Thì hiện tại đơn dễ hiểu cho người mới', eyebrow: 'Grammar mini', intent: 'Bạn muốn hiểu cách nói thói quen, sự thật và lộ trình bằng câu đơn giản.', promise: 'Poo giải thích hiện tại đơn qua câu hằng ngày như học, ăn, đi làm, thích và cần.', avoid: 'Đừng chỉ nhớ công thức S + V(s/es) mà không đặt câu về chính mình.', dailyAction: 'Hôm nay hãy viết 3 câu thói quen với I, she và they.' },
  { path: '/ngu-phap/dong-tu-to-be', keyword: 'động từ to be', cluster: 'grammar', title: 'Động từ to be - Am, is, are dễ hiểu cùng PooEnglish', description: 'Học động từ to be bằng ví dụ I am, you are, she is, micro quiz 5 câu và cách đặt câu cho người mất gốc.', h1: 'Động từ to be: am, is, are thật dễ thở', eyebrow: 'Grammar gốc', intent: 'Bạn cần nắm chiếc khung đầu tiên để giới thiệu, mô tả và nói trạng thái.', promise: 'Poo giúp bạn dùng to be trong câu giới thiệu bản thân, nghề nghiệp, cảm xúc và mô tả đồ vật.', avoid: 'Đừng học to be như bảng chia khô; hãy nói thành câu của mình.', dailyAction: 'Hôm nay hãy nói 5 câu bắt đầu bằng I am, You are, It is.' },
  { path: '/cach-dat-cau-tieng-anh', keyword: 'cách đặt câu tiếng Anh', cluster: 'grammar', title: 'Cách đặt câu tiếng Anh - Từ mẫu nhỏ đến câu của bạn', description: 'Cách đặt câu tiếng Anh cho người mới: trật tự từ, mẫu câu căn bản, micro quiz và ví dụ cùng PooEnglish.', h1: 'Cách đặt câu tiếng Anh cho người mới bắt đầu', eyebrow: 'Tạo câu đầu tiên', intent: 'Bạn biết vài từ nhưng chưa biết xếp chúng thành câu đúng.', promise: 'Poo dạy bạn nhìn câu theo khung ai làm gì, ở đâu, khi nào và cảm thấy thế nào.', avoid: 'Đừng dịch từng chữ từ vựng tiếng Anh mà không nhìn trật tự câu.', dailyAction: 'Hôm nay hãy lấy 3 từ quen và đặt thành câu “I like…”.' },
  { path: '/hoc-tieng-anh-moi-ngay', keyword: 'học tiếng Anh mỗi ngày', cluster: 'roadmap', title: 'học tiếng Anh mỗi ngày - Lịch 10 phút cùng cá voi Poo', descriptiếng Anh mỗi ngày bằng checklist nhỏ, lộ từ vựnghe nói và nhịp ôn đều để duy trì thói quen.', học tiếng Anh mỗi ngày bằng nhịp bơi nhỏ', eyebrow: 'Thói quen mỗi ngày', intent: 'Bạn cần một lịch học đủ nhẹ để quay lại hằng ngày.', promise: 'Poo biến mỗi ngày từ vựng nhỏ: ôn, học, nghe, nói và ghi điều cần quay lại.', avoid: 'Đừng đặt mục tiêu quá lớn rồi bỏ sau vài ngày.', dailyAction: 'Hôm nay chỉ cần 10 phút: 3 từ, 2 câu nghe, 1 câu nói.' },
  { path: '/lo-trinh-hoc-tieng-anh-30-ngay', keyword: 'lộ trìnhọc tiếng Anh 30 ngày', cluster: 'roadmap', titlộ trìnhọc tiếng Anh 30 ngày - Khởi động nhẹ cùng Poo', description: 'lộ trìnhọc tiếng Anh 30 ngày cho người mới: checklist mỗi ngày, testừ vựnghe nói và ngữ pháp cơ bản.', h1: 'lộ trìnhọc tiếng Anh 30 ngày cùng PooEnglish', eyebrow: '30 ngày khởi động', intent: 'Bạn muốn một khung thời gian đủ ngắn để bắt đầu nghiêm túc.', promise: 'Poo chia 30 ngày thành các cụm nền: phátừ vựng, mẫu câu, nghe chậm và nói lại.', avoid: 'Đừng biến 30 ngày thành cuộc đua học càng nhiều càng tốt.', dailyAction: 'Hôm nay hãy hoàn thành ngày 1: chào hỏi, tên và một câu nghe ngắn.' },
  { path: '/lo-trinh-hoc-tieng-anh-48-ngay', keyword: 'lộ trìnhọc tiếng Anh 48 ngày', cluster: 'roadmap', titlộ trìnhọc tiếng Anh 48 ngày - Lấy gốc từng ngày cùng Poo', description: 'lộ trìnhọc tiếng Anh 48 ngày cho người mất gốc với checklist, bài nhỏ, từ vựnghe nói, quiz và CTA vào khóa học.', h1: 'lộ trìnhọc tiếng Anh 48 ngày để lấy lại nền', eyebrow: '48 ngày lấy gốc', intent: 'Bạn cần một hành trình dài hơn 30 ngày để nền tiếng Anh có thời gian bám lại.', promise: 'Poo chia 48 ngày thành các chặng vừa sức, mỗi ngày có nội dung và hoạt động ôn rõ.', avoid: 'Đừng bỏ cuộc nếu một ngày trễ; hãy quay lại đúng chặng đang học.', dailyAction: 'Hôm nay hãy mở ngày gần nhất và hoàn từ vựng học nhỏ.' },
];

export const SEO_PAGES: SeoPage[] = seeds.map(page);

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
