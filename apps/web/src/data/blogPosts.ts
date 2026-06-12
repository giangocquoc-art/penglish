export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogSection = {
  heading: string;
  body: string[];
};

export type BlogLink = {
  label: string;
  to: string;
};

export type BlogTopic =
  | 'on-tieng-anh'
  | 'mat-goc'
  | 'shadowing'
  | 'tu-vung'
  | 'luyen-nghe'
  | 'ngu-phap'
  | 'lo-trinh'
  | 'mien-phi';

export type BlogPost = {
  title: string;
  description: string;
  slug: string;
  date: string;
  lastmod: string;
  excerpt: string;
  readingTime: string;
  keywords: string[];
  topic: BlogTopic;
  topicLabel: string;
  pillarPath: string;
  quickAnswerHeading: string;
  quickAnswer: string;
  quickBullets: string[];
  sections: BlogSection[];
  faqs: BlogFaq[];
  relatedLinks: BlogLink[];
  ctaLinks: BlogLink[];
};

export const BLOG_TOPIC_LABELS: Record<BlogTopic, string> = {
  'on-tieng-anh': 'Ôn tiếng Anh',
  'mat-goc': 'Người mất gốc',
  shadowing: 'Shadowing tiếng Anh',
  'tu-vung': 'từ vựng Anh',
  'luyen-nghe': 'Luyện nghe tiếng Anh',
  'ngu-phap': 'ngữ pháp tiếng Anh',
  'lo-trinh': 'lộ trìnhọc tiếng Anh',
  'mien-phi': 'Học miễn phí',
};

export const BLOG_TOPIC_PILLARS: Record<BlogTopic, string> = {
  'on-tieng-anh': '/on-tieng-anh',
  'mat-goc': '/hoc-tieng-anh-cho-nguoi-mat-goc',
  shadowing: '/shadowing-tieng-anh',
  'tu-vung': '/tu-vung-tieng-anh',
  'luyen-nghe': '/luyen-nghe-tieng-anh',
  'ngu-phap': '/ngu-phap-tieng-anh',
  'lo-trinh': '/lo-trinh-hoc-tieng-anh',
  'mien-phi': '/hoc-tieng-anh-mien-phi',
};

const featureCtas: BlogLink[] = [
  { labelộ trình học', to: '/learning-path' },
  { label: 'Luyện shadowing', to: '/shadowing' },
  { label: 'Ôn từ vựng', to: '/words' },
];

const baseFaqs: BlogFaq[] = [
  { question: 'Có thể học miễn phí trên PooEnglish không?', answer: 'Có. Bạn có thể mở lộ trình, shadowing và sổ từ vựng để bắt đầu ở chế độ khách. Đăng nhập chỉ giúp lộ trình ổn định hơn.' },
  { question: 'Người mất gốc có theo được không?', answer: 'Theo được nếu bắt đầu bằng câu ngắn, từ quen và nhịp ôn đều. PooEnglish chia bài nhỏ để người học không bị ngợp.' },
  { question: 'Mỗi ngày nên học bao lâu?', answer: 'Bạn có thể bắt đầu với 15 đến 30 phút. Điều quan trọng là có mộtừ vựng học nhỏ gồm ôn lại, học mới và dùng lại.' },
];

function makeSections(topicLabel: string, focus: string, pillarPath: string): BlogSection[] {
  return [
    {
      heading: `${focus} nên bắt đầu từ đâu?`,
      body: [
        `${focus} hiệu quả không bắt đầu bằng việc gom thật nhiều tài liệu, mà bắt đầu bằng một bước đủ nhỏ để làm được ngay hôm nay. Với người Việt mới học hoặc học lại, PooEnglish khuyên bạn chọn một mục tiêu rõ: hiểu một nhóm từ, nghe vài câu, nói lại mộtừ vựngày mai cần ôn gì. Khi mục tiêu nhỏ, não bớt phòng vệ và việc học dễ duy trì hơn.`,
        `Bạn có thể xem ${topicLabel} như mộtừ vựng biển riêng trong hành trình học. Vùng này vẫn cần nối với lộ từ vựnghe và shadowing. Vì vậy bài viết luôn gợi ý quay về ${pillarPath}, mở /learning-path để có bản đồ, dùng /words để giữ từ cần ôn và ghé /shadowing khi muốn luyện âm thanh thật.`,
      ],
    },
    {
      heading: 'Cách học không bị ngợp',
      body: [
        `Điểm mấu chốt là học từ vựng lặp nhỏ. Trước hết, bạn ôn lại một điều đã biết. Sau đó học một mảnh mới vừa sức. Tiếp theo, dùng mảnh đó trong một câu hoặc một đoạn nghe ngắn. Cuối cùng, ghi lại phần còn yếu để hôm sau gặp lại. Cách này chậm hơn cảm giác “học thật nhiều”, nhưng bền và ít tạo áp lực hơn.`,
        `Poo không khuyến khích nhồi keyword, nhồi từ hay nhồi bài. Một người mới học cần cảm giác hoàn thành. Nếu hôm nay bạn chỉ hiểu rõ ba câu nhưng có thể nói lại, kếtừ vựng giá hơn đọc mười trang mà không dùng được câu nào.`,
      ],
    },
    {
      heading: 'Liên kết kỹ năng để nhớ lâu hơn',
      body: [
        `từ vựngữ pháp, luyện nghe và luyện nói không nên tách thành bốn hòn đảo. Một từ nên nằm trong câu. Một câu nên được nghe. Một câu nghe được nên được nói lại. Một lỗi sai nên quay lại thành phần ôn. Khi các kỹ năng nối nhau, cùng một kiến thức được gặp qua nhiều cửa và trí nhớ bám chắc hơn.`,
        `Ví dụ bạn học một câu giới thiệu bản thân. Bạn có thể lưu từ chính vào /words, nghe lại câu trong hoạt động shadowing, rồi quay về /learning-path để gặp mẫu câu tương tự. Chính những lần gặp lại có ý nghĩa này làm ${focus.toLowerCase()} trở nên tự nhiên hơn.`,
      ],
    },
    {
      heading: 'Lịch học 30 phát âmỗi ngày',
      body: [
        `Một lịch nhẹ có thể gồm 5 phút ôn từ cũ, 10 phát âmới, 7 phút luyện nghe hoặc shadowing, 5 phát âm bài kiểm tra nhỏ và 3 phút ghi lại điều cần ôn. Nếu bận, bạn rút còn 10 phút: ôn 3 từ, nghe 2 câu, nói lại 1 câu. Sự linh hoạt giúp thói quen sống được lâu hơn.`,
        `Cuối tuần, hãy nhìn lại xem phần nào đang rõ hơn và phần nào còn đục nước. Nếu nghe yếu, tăng thời gian nghe câu ngắn. Nếu hay quên từ, ưu tiên /words. Nếu không biết đi tiếp đâu, mở /learning-path. Nếu nền còn rỗng, quay về /48-ngay-lay-goc.`,
      ],
    },
    {
      heading: 'Sai lộ trình',
      body: [
        `Sai lầm thường gặp là đổi tài liệu liên tục, học quá dài trong một ngày rồi bỏ nhiều ngày, hoặc chỉ đọc lý thuyết mà không nói thành câu. Một sai lầm khác là tự chê quá sớm. phát âm chưa rõ, nghe chưa ra hoặc quên từ đều là tín hiệu để ôn lại, không phải bằng chứng rằng bạn không có năng khiếu.`,
        `PooEnglish giữ giọng học thân thiện vì cảm xúc ảnh hưởng trực tiếp đến khả năng quay lại. Khi bài học đủ rõ và đủ mềm, bạn dễ tiếp tục hơn. Mỗi ngày chỉ cần bơi thêm một nhịp nhỏ, kiến thức sẽ dần tạo thành dòng chảy quen thuộc.`,
      ],
    },
  ];
}

function makeFaqs(focus: string, pillarPath: string): BlogFaq[] {
  return [
    { question: `${focus} có phù hợp cho người mới bắt đầu không?`, answer: `Có, nếu bạn chia nhỏ mục từ vựng câu gần đời sống. Người mới nên bắt đầu chậm, có lộ trình và ôn lại thường xuyên.` },
    { question: `Nên học ${focus.toLowerCase()} ở đâu trên PooEnglish?`, answer: `Bạn có thể bắt đầu từ ${pillarPath}, sau đó mở /learning-path để học theo thứ tự, /shadowing để luyện nghe nói và /words để giữ từ cần ôn.` },
    { question: `Bao lâu thì thấy tiến bộ khi học ${focus.toLowerCase()}?`, answer: 'Nếu học đều 15–30 phát âmỗi ngày, bạn thường thấy tai quen hơn, nhớ câu từ vựngại nói sau vài tuần. Tiến bộ nhỏ nhưng đều là tín hiệu tốt.' },
    { question: 'Có cần đăng nhập để học không?', answer: 'Không bắt buộc. Bạn có thể thử nhiều khu vực học ở chế độ khách; đăng nhập giúp lưu từ vựng bộ hành trình tốt hơn.' },
    ...baseFaqs,
  ];
}

function post(input: Omit<BlogPost, 'date' | 'lastmod' | 'readingTime' | 'sections' | 'faqs' | 'relatedLinks' | 'ctaLinks' | 'topicLabel' | 'pillarPath'>): BlogPost {
  const topicLabel = BLOG_TOPIC_LABELS[input.topic];
  const pillarPath = BLOG_TOPIC_PILLARS[input.topic];
  return {
    ...input,
    date: '2026-06-11',
    lastmod: '2026-06-11',
    readingTime: '10 phút đọc',
    topicLabel,
    pillarPath,
    sections: makeSections(topicLabel, input.keywords[0] ?? input.title, pillarPath),
    faqs: makeFaqs(input.keywords[0] ?? input.title, pillarPath).slice(0, 6),
    relatedLinks: [
      { label: `Pillar: ${topicLabel}`, to: pillarPath },
      { labelộ trìnhọc tiếng Anh', to: '/learning-path' },
      { label: 'Shadowing trong app', to: '/shadowing' },
      { label: 'Sổ từ vựng', to: '/words' },
    ],
    ctaLinks: featureCtas,
  };
}

export const BLOG_POSTS: BlogPost[] = [
  post({ tiếng Anh là gì? Cách ôn đúng để dùng được mỗi ngày', description: 'Giải thích ôn tiếng Anh là gì, nên ôn từ vựngữ pháp, nghe nói ra sao và cách PooEnglish giúp người mới học lại nhẹ nhàng.', slug: 'on-tieng-anh-la-gi', excerpt: 'Ôn tiếng Anh là gặp lại kiến thức cũ trong ngữ cảnh mới để nhớ lâu và dùng được, không chỉ đọc lại danh sách từ hay công thức.', keywords: ['ôn tiếng Anh', 'cách ôn tiếng Anhọc tiếng Anh mỗi ngày'], topic: 'on-tieng-anh', quickAnswerHeading: 'Ôn tiếng Anh là gì?', quickAnswer: 'Ôn tiếng Anh lộ trình gặp lại từ vựng, mẫu câu, ngữ pháp, nghe và nói theo nhịp có chủ đích để kiến thức chuyển từ “đã học” sang “dùng được”. Người mới nên ôn bằng câu ngắn, bài nhỏ và lịch đều thay vì học dồn.', quickBullets: ['Ôn theo câu, không chỉ theo từ rời.', 'Kết hợp nghe, nói và viết lại.', 'Ưu tiên phần hay quên trước.'] }),
  post({ title: 'Cách ôn tiếng Anh cho người mới bắt đầu không bị ngợp', description: 'Hướng dẫn cách ôn tiếng Anh cho người mới bắt đầu bằng vòng học nhỏ, lịch 30 phút và các lộ trình khi tự học tại nhà.', slug: 'cach-on-tieng-anh-cho-nguoi-moi-bat-dau', excerpt: 'Người mới nên ôn từ vựng nhỏ: xem lại, học một mảnh mới, dùng lại trong câu và ghi phần cần ôn cho ngày mai.', keywords: ['cách ôn tiếng Anh cho người mới bắt đầu', 'ôn tiếng Anh cơ bản', 'học tiếng Anh cho người mới'], topic: 'on-tieng-anh', quickAnswerHeading: 'Người mới nên ôn tiếng Anh như thế nào?', quickAnswer: 'Người mới nên ôn tiếng Anh bằng bài ngắn, câu quen và mục tiêu rất rõ. Mỗi buổi chỉ cần ôn vài từ, nghe vài câu, nói lại một mẫu và kiểm tra nhẹ. Cách này giúp tạo nền đều mà không bị áp lực.', quickBullets: ['Bắt đầu với 10–30 phát âmỗi ngày.', 'Dùng từ trong câu thật.', 'Ôn lại trước khi học thêm.'] }),
  post({ tiếng Anh cho người mất gốc tại nhà: bắt đầu lại từ câu nhỏ', description: 'lộ trình ôn tiếng Anh cho người mất gốc tại nhà với phát âm cơ bản, từ vựng gần đời sống, mẫu câu ngắn và shadowing nhẹ.', slug: 'on-tieng-anh-cho-nguoi-mat-goc-tai-nha', excerpt: 'Mất gốc không cần bắt đầu bằng sách dày; hãy bắt đầu bằng câu dùng được, từ gần đời sống và nhịp ôn đều.', keywords: ['ôn tiếng Anh cho người mất gốc tại nhọc tiếng Anh', 'bắt đầu lại tiếng Anh'], topic: 'mat-goc', quickAnswerHeading: 'Người mất gốc có thể ôn tiếng Anh tại nhà không?', quickAnswer: 'Có. Người mất gốc có thể ôn tại nhà nếu có lộ trìnhỏ, nội dung dễ hiểu và hoạt động dùng lại. Hãy bắt đầu bằng câu giới thiệu, thói quen, nhu cầu hằng ngày, rồi nối dần sang nghe và shadowing.', quickBullets: ['Học câu căn bản trước lý thuyết dài.', 'Ôn từ theo chủ đề gần đời sống.', 'Dùng /48-ngay-lay-goc khi nền còn yếu.'] }),
  post({ title: 'Lịch ôn tiếng Anh 30 phát âmỗi ngày cho người bận', description: 'Gợi ý lịch ôn tiếng Anh 30 phát âmỗi ngày gồm từ vựnghe, shadowingữ pháp và ôn lỗi để duy trì thói quen bền.', slug: 'lich-on-tieng-anh-30-phut-moi-ngay', excerpt: 'Một lịch 30 phút tốt cần có ôn lại, học mới, luyện nghe nói và ghi chú phần yếu thay vì chỉ xem bài mới.', keywords: ['lịch ôn tiếng Anh 30 phát âmỗi ngày', 'học tiếng Anh mỗi ngày', 'ôn tiếng Anh hằng ngày'], topic: 'lo-trinh', quickAnswerHeading: '30 phát âmỗi ngày nên ôn tiếng Anh ra sao?', quickAnswer: 'Bạn có thể chia 30 phút thành 5 phút ôn cũ, 10 phát âmới, 7 phút nghe hoặc shadowing, 5 phút luyện bài nhỏ và 3 phút ghi phần cần ôn. Lịch này đủ nhẹ để duy trì nhưng vẫn chạm nhiều kỹ năng.', quickBullets: ['Có phần ôn cũ trước bài mới.', 'Luôn nói lại ít nhất một câu.', 'Cuối buổi ghi lỗi cần ôn.'] }),
  post({ title: '5 sai lầm khi ôn tiếng Anh khiến bạn học nhiều nhưng vẫn quên', description: 'Những sai lầm khi ôn tiếng Anh: học dồn, đổi tài liệu liên tục, không dùng từ trong câu, bỏ nghe nói và tự chê quá sớm.', slug: 'sai-lam-khi-on-tieng-anh', excerpt: 'Ôn tiếng Anh sai cách thường tạo cảm giác chăm chỉ nhưng không giữ được kiến thức. Poo giúp bạn sửa từng lỗi nhỏ.', keywords: ['sai lầm khi ôn tiếng Anh', 'ôn tiếng Anh hiệu quả', 'học tiếng Anh hay quên'], topic: 'on-tieng-anh', quickAnswerHeading: 'Sai lầm lớn nhất khi ôn tiếng Anh là gì?', quickAnswer: 'Sai lầm lớn nhất là chỉ đọc lại kiến thức mà không dùng lại trong câu, nghe hoặc nói. Khi từ vựngữ pháp không được đưa vào ngữ cảnh, chúng rất nhanh trôi khỏi trí nhớ.', quickBullets: ['Không học dồn một lần rồi nghỉ lâu.', 'Không chỉ học danh sách từ.', 'Không bỏ qua nghe và nói.'] }),
  post({ title: 'Shadowing là gì? Cách nói đuổi tiếng Anh thật dễ hiểu', description: 'Shadowing là gì, vì sao giúp luyện nghe nói và cách bắt đầu bằng câu ngắn, transcript, nhịp chậm cùng cá voi Poo.', slug: 'shadowing-la-gi', excerpt: 'Shadowing là nghe một câu tiếng Anh rồi nói đuổi theo gần như ngay sau đó để tai, miệng và nhịp nói phối hợp tự nhiên hơn.', keywords: ['shadowing là gì', 'shadowing tiếng Anh', 'nói đuổi tiếng Anh'], topic: 'shadowing', quickAnswerHeading: 'Shadowing là gì?', quickAnswer: 'Shadowingữ pháp nghe câu mẫu rồi nói theo gần như ngay lập từ vựngười mới, hãy chọn câu ngắn, hiểu nghĩa trước, nhìn transcript khi cần và nói chậm hơn bản gốc để miệng quen nhịp.', quickBullets: ['Nghe câu mẫu trước.', 'Hiểu nghĩa rồi nói đuổi.', 'Lặp lại câu khó thật nhẹ.'] }),
  post({ title: 'Cách luyện shadowing tiếng Anh cho người mới: 5 bước cùng Poo', description: 'Cách luyện shadowing tiếng Anh từ đầu: chọn câu ngắn, nghe hiểu, nói chậm, xem transcript và lặp lại không áp lực.', slug: 'cach-luyen-shadowing-tieng-anh', excerpt: 'Cách luyện shadowing tốt cho người mới là nghe câu ngắn, hiểu nghĩa, nói chậm hơn bản gốc và lặp lại vài vòng.', keywords: ['cách luyện shadowing tiếng Anh', 'luyện shadowing', 'nói đuổi tiếng Anh'], topic: 'shadowing', quickAnswerHeading: 'Cách luyện shadowing tiếng Anh thế nào?', quickAnswer: 'Hãy bắt đầu bằng 3–5 câu ngắn: nghe một lượt, đọc nghĩa, nghe lại, nói theo chậm, rồi lặp câu khó. Mục tiêu đầu tiên là rõ nhịp và dám mở miệng, chưa cần giống người bản xứ.', quickBullets: ['Chọn đoạn 20–40 giây.', 'Nói chậm để rõ âm.', 'Dùng /shadowing để luyện từng câu.'] }),
  post({ title: 'Shadowing tiếng Anh là gì? Cách luyện nghe nói nhẹ nhàng cùng Poo', description: 'Shadowing tiếng Anh là gì, phù hợp với ai và nên luyện ra sao để cải thiện nghe nói mà không bị áp lực? Cùng cá voi Poo bắt đầu.', slug: 'shadowing-tieng-anh-la-gi', excerpt: 'Shadowing là nghe một câu tiếng Anh rồi nói theo gần như ngay sau đó để từ vựngữ pháp tự nhiên hơn.', keywords: ['shadowing tiếng Anh', 'luyện nghe nói', 'phát âm tiếng Anh'], topic: 'shadowing', quickAnswerHeading: 'Shadowing tiếng Anh là gì?', quickAnswer: 'Shadowing tiếngữ pháp nghe câu mẫu rồi nói theo gần như ngay lập tức. Khi luyện đúng, bạn học được nhịp câu, âm nối, trọng âm và phản xạ nói tự nhiên hơn mà không cần bắt đầu bằng đoạn dài.', quickBullets: ['Chọn câu ngắn và rõ.', 'Hiểu nghĩa trước khi nói theo.', 'Ghi âm nhẹ nếu muốn tự kiểm tra.'] }),
  post({ title: 'Cách shadowing tiếng Anh cho người mới bắt đầu', description: 'Hướng dẫn shadowing tiếng Anh cho người mới: chọn tài liệu, nghe hiểu, nói chậm, lặp câu khó và kếtừ vựng.', slug: 'cach-shadowing-tieng-anh-cho-nguoi-moi', excerpt: 'Người mới không cần đuổi tốc độ bản gốc ngay. Shadowing nên bắt đầu bằng câu ngắn, tốc độ chậm và mục tiêu rõ.', keywords: ['cách shadowing tiếng Anh cho người mới', 'luyện shadowing', 'nói đuổi tiếng Anh'], topic: 'shadowing', quickAnswerHeading: 'Người mới nên shadowing thế nào?', quickAnswer: 'Người mới nên nghe câu ngắn, hiểu nghĩa, nói theo chậm hơn bản gốc và lặp lại câu khó vài vòng. Mục tiêu đầu tiên là nói rõ và bắt được nhịp, không phải giống hoàn toàn người bản xứ.', quickBullets: ['Chỉ chọn 3–5 câu mỗi buổi.', 'Nói chậm để rõ âm.', 'Dùng /shadowing để luyện từng câu.'] }),
  post({ title: 'Shadowing có giúp nói tiếng Anh tốt hơn không?', description: 'Phân tích shadowing có giúp nói tiếng Anh tốt hơn khôngữ pháp này hỗ trợ phát âm, phản xạ và sự tự tin.', slug: 'shadowing-co-giup-noi-tieng-anh-tot-hon-khong', excerpt: 'Shadowing giúp nói tốt hơn khi bạn luyện có hiểu nghĩa, có lặp lại và biết dùng câu vào tình huống thật.', keywords: ['shadowing giúp nói tiếng Anh', 'nói tiếng Anh tốt hơn', 'luyện phản xạ tiếng Anh'], topic: 'shadowing', quickAnswerHeading: 'Shadowing có giúp nói tiếng Anh tốt hơn không?', quickAnswer: 'Có, shadowing giúp nói tốt hơn vì bạn luyện nghe và miệng cùng lúc. Bạn không chỉ biết mặt chữ mà còn cảm nhận nhịp câu, âm nối và cách bật cụm từ khi cần nói.', quickBullets: ['Tăng nhận biết âm thanh.', 'Giúp phản xạ câu quen nhanh hơn.', 'Giảm sợ nói thành tiếng.'] }),
  post({ title: 'Lỗi sai khi luyện shadowing và cách sửa nhẹ nhàng', description: 'Các lỗi sai khi luyện shadowing như nói quá nhanh, chọn đoạn quá dài, không hiểu nghĩa và tự chê giọng quá sớm.', slug: 'loi-sai-khi-luyen-shadowing', excerpt: 'Shadowing sai cách dễ làm bạn mệt. Hãy sửa bằng đoạn ngắn, tốc độ chậm và mục tiêu âm thanh cụ thể.', keywords: ['lỗi sai khi luyện shadowing', 'shadowing tiếng Anh', 'luyện phát âm'], topic: 'shadowing', quickAnswerHeading: 'Lỗi sai phổ biến khi shadowing là gì?', quickAnswer: 'Lỗi phổ biến là cố nói nhanh như bản gốc ngay từ đầu. Người mới nên nói chậm, rõ âm và hiểu câu trước. Nếu chỉ đuổi tốc độ, bạn dễ nuốt âm và nhanh nản.', quickBullets: ['Không chọn video quá dài.', 'Không nói khi chưa hiểu nghĩa.', 'Không tự chê giọng quá sớm.'] }),
  post({ title: 'Bài tập shadowing tiếng Anh mỗi ngày trong 10 phút', description: 'Bài tập shadowing tiếng Anh mỗi ngày: nghe ý chính, luyện từng câu, nói lại không nhìn chữ và lưu cụm cần ôn.', slug: 'bai-tap-shadowing-tieng-anh-moi-ngay', excerpt: 'Chỉ 10 phút shadowing mỗi ngày cũng đủ tạo nhịp nếu bạn chọn câu đúng và ôn lại đều.', keywords: ['bài tập shadowing tiếng Anh mỗi ngày', 'luyện shadowing 10 phút', 'nói đuổi tiếng Anh'], topic: 'shadowing', quickAnswerHeading: '10 phút shadowing mỗi ngày nên làm gì?', quickAnswer: 'Trong 10 phút, hãy nghe đoạn ngắn 2 phút, luyện từng câu 4 phút, nói lại cả đoạn 2 phát âmột cụm cần ôn 2 phút. Nhịp nhỏ này giúp từ vựng cùng tiến bộ.', quickBullets: ['Nghe trước khi nói.', 'Lặp câu khó nhiều vòng.', 'Lưu cụm mới vào /words.'] }),
  post({ title: 'Cách học từ vựng Anh dễ nhớ mà không cần nhồi nhét', description: 'Học từ vựng Anh dễ nhớ hơn khi đặt từ vào câu, ôn đúng lúc và dùng lại trong nghe nói. Poo gợi ý cách học nhẹ nhàng.', slug: 'cach-hoc-tu-vung-tieng-anh-de-nho', excerptừ vựng nên là danh sách khô khan. Khi từ có ngữ cảnh, âm thanh và cơ hội dùng lại, bạn sẽ nhớ lâu hơn.', keywords: ['cách học từ vựng Anh dễ nhớ', 'học từ vựng Anh', 'nhớ từ vựng'], topic: 'tu-vung', quickAnswerHeading: 'Học từ vựng Anh thế nào để dễ nhớ?', quickAnswer: 'Hãy học ít từ hơn nhưng gặp lại nhiều hơn. Mỗi từ nên có câu ví dụ, âm thanh, tình huống dùng và lịch ôn. Khi từ nằm trong câu, bạn nhớ nghĩa lẫn cách dùng tốt hơn.', quickBullets: ['Học 5–10 từ mỗi ngày.', 'Luôn đặt từ vào câu.', 'Ôn theo khoảng cách.'] }),
  post({ title: 'Học từ vựng Anh theo chủ đề sao cho không học vẹt', description: 'Cách học từ vựng Anh theo chủ đề: nhóm từ gần đời sống, đặt câu, luyện nghe và ôn lại bằng tình huống thật.', slug: 'hoc-tu-vung-tieng-anh-theo-chu-de', excerpt: 'Học theo chủ đề giúp não nhóm thông tin, nhưng cần đặtừ vựng lộ trình học vẹt.', keywords: ['học từ vựng Anh theo chủ đề', 'từ vựng theo chủ đề', 'ôn từ vựng'], topic: 'tu-vung', quickAnswerHeading: 'Có nên học từ vựng Anh theo chủ đề không?', quickAnswer: 'Có. Học theo chủ đề giúp não sắp xếp từ tốt hơn, đặc biệtừ vựngười mới. Tuy vậy, bạn nên đặt mỗi từ vào câu từ vựnghe cách phát âm để từ không chỉ nằm trên danh sách.', quickBullets: ['Chọn chủ đề gần đời sống.', 'Mỗi từ có một câu ví dụ.', 'Ôn bằng tình huống cụ thể.'] }),
  post({ title: 'Cách ôn từ vựng Anh không bị quên sau vài ngày', description: 'Hướng dẫn ôn từ vựng Anh không bị quên bằng lặp cách quãng, câu ví dụ, shadowing và sổ từ cá nhân.', slug: 'cach-on-tu-vung-tieng-anh-khong-bi-quen', excerpt: 'Quên từ là bình thường. Điều quan trọng là có nhịp gặp lại từ đúng lúc và dùng từ trong câu.', keywords: ['cách ôn từ vựng Anh không bị quên', 'ôn từ vựng Anh', 'spaced repetition'], topic: 'tu-vung', quickAnswerHeading: 'Làm sao ôn từ vựng Anh không bị quên?', quickAnswer: 'Muốn không quên từ, hãy gặp lại từ sau một khoảng từ vựng từ trong câu mới. Nhìn lại, nghe lại, nói lại và tự đặt câu giúp trí nhớ có nhiều đường bám hơn.', quickBullets: ['Ôn từ hay quên trước.', 'Dùng /words làm sổ ôn.', 'Nói lại câu chứa từ.'] }),
  post({ titừ vựng Anh cho người mới bắt đầu: học gì trước?', description: 'Danh mục từ vựng Anh cho người mới bắt đầu nên ưu tiên: bản thân, gia đình, thời gian, cảm xúc và hành động hằng ngày.', slug: 'tu-vung-tieng-anh-cho-nguoi-moi-bat-dau', excerpt: 'Người mới nên học từ gần đời sống trước, vì đó là nhóm từ dễ đặtừ vựng lại nhất.', keywords: ['từ vựng Anh cho người mới bắt đầu', 'từ vựng cơ bản', 'học từ vựng'], topic: 'tu-vung', quickAnswerHeading: 'Người mới nên học nhóm từ vựng nào trước?', quickAnswer: 'Người mới nên học từ về bản thân, gia đình, số đếm, thời gian, đồ vật, cảm xúc và hành động thường ngày. Đây là nhóm từ giúp bạn tạo câu đơn giản ngay.', quickBullets: ['Ưu tiên từ dùng hằng ngày.', 'Học từ kèm câu mẫu.', 'Không học danh sách quá dài.'] }),
  post({ title: 'Luyện nghe tiếng Anh cho người mới: nghe chậm để hiểu chắc hơn', description: 'Người mới luyện nghe tiếng Anh nên bắt đầu bằng câu ngắn, từ quen và nhịp lặp lại. Poo hướng dẫn cách nghe nhẹ nhàng.', slug: 'luyen-nghe-tieng-anh-cho-nguoi-moi', excerpt: 'Luyện nghe không phải cứ bật video dài là tốt. Người mới cần đoạn ngắn, mục tiêu rõ và cơ hội nghe lại.', keywords: ['luyện nghe tiếng Anh cho người mới', 'nghe tiếng Anh cơ bản', 'học nghe tiếng Anh'], topic: 'luyen-nghe', quickAnswerHeading: 'Người mới nên luyện nghe tiếng Anh như thế nào?', quickAnswer: 'Người mới nên nghe đoạn ngắn 20–40 giây, có từ khóa quen và có transcript để kiểm tra sau. Hãy nghe nhiều vòng với mục tiêu khác nhau thay vì cố hiểu mọi từ ngay lần đầu.', quickBullets: ['Nghe ý chính trước.', 'Tìm từ khóa ở lượt hai.', 'Shadowing một câu sau khi nghe.'] }),
  post({ title: 'Nghe tiếng Anh không hiểu phải làm sao?', description: 'Nếu nghe tiếng Anh không hiểu, hãy giảm độ dài, học từ khóa, dùng transcript đúng lúc và luyện shadowing câu ngắn.', slug: 'nghe-tieng-anh-khong-hieu-phai-lam-sao', excerpt: 'Không hiểu khi nghe là chuyện bình thường nếu tai chưa quen âm, từ nền chưa chắc hoặc đoạn nghe quá nhanh.', keywords: ['nghe tiếng Anh không hiểu phải làm sao', 'luyện nghe tiếng Anh', 'nghe không ra từ'], topic: 'luyen-nghe', quickAnswerHeading: 'Nghe tiếng Anh không hiểu thì nên làm gì?', quickAnswer: 'Hãy giảm độ khó: chọn đoạn ngắn hơn, đọc trước vài từ khóa, nghe ý chính, rồi dùng transcript để kiểm tra. Sau đó chọn một câu dễ để shadowing. Cách này giúp tai xây lại bản đồ âm thanh.', quickBullets: ['Không bắt đầu bằng video dài.', 'Dùng transcript sau khi nghe thử.', 'Ôn từ khóa trong /words.'] }),
  post({ title: 'Cách luyện nghe tiếng Anh mỗi ngày để tai quen dần', description: 'Cách luyện nghe tiếng Anh mỗi ngày bằng lịch 15 phút, đoạn ngắn, nhiệm vụ rõ và liên kết với shadowing, từ vựng.', slug: 'cach-luyen-nghe-tieng-anh-moi-ngay', excerpt: 'Luyện nghe mỗi ngày nên có nhiệm vụ nhỏ: nghe ý chính, bắt từ khóa, kiểm tra transcript và nói lại một câu.', keywords: ['cách luyện nghe tiếng Anh mỗi ngày', 'luyện nghe mỗi ngày', 'nghe tiếng Anh'], topic: 'luyen-nghe', quickAnswerHeading: 'Mỗi ngày luyện nghe tiếng Anh bao lâu là đủ?', quickAnswer: 'Với người mới, 10–15 phút nghe chủ động mỗi ngày đã có giá trị. Quan trọng là đoạn nghe ngắn, nhiệm vụ rõ và có bước nói lại để tai không học một mình.', quickBullets: ['Nghe chủ động thay vì chỉ bật nền.', 'Mỗi lượt nghe có một nhiệm vụ.', 'Nối nghe với shadowing.'] }),
  post({ title: 'ngữ pháp tiếng Anh cơ bản cho người mất gốc: học mẫu câu trước', description: 'ngữ pháp tiếng Anh cơ bản cho người mất gốc nên bắt đầu từ mẫu câu đời thường, ví dụ rõ và bài tập nhỏ từ vựng thức dài.', slug: 'ngu-phap-tieng-anh-co-ban-cho-nguoi-mat-goc', excerpt: 'ngữ pháp dễ hơn khi bạn học qua câu dùng được: giới thiệu, thói quen, mong muốn, nhu cầu và câu hỏi đơn giản.', keywords: ['ngữ pháp tiếng Anh cơ bản cho người mất gốc', 'ngữ pháp tiếng Anh cơ bản', 'mẫu câu tiếng Anh'], topic: 'ngu-phap', quickAnswerHeading: 'Người mất gốc nên học ngữ pháp tiếng Anh từ đâu?', quickAnswer: 'Người mất gốc nên học ngữ pháp qua mẫu câu ngắn như “I am…”, “I have…”, “I want to…”, “Can you…?”. Khi câu dùng được, quy tắc phía sau sẽ dễ hiểu hơn nhiều.', quickBullets: ['Học mẫu câu trước thuật ngữ.', 'Mỗi quy tắc có ví dụ đời sống.', 'Luyện bằng câu ngắn hằng ngày.'] }),
  post({ titlộ trìnhọc tiếng Anh cho người mới bắt đầu từ con số nhỏ', description: 'lộ trìnhọc tiếng Anh cho người mới bắt đầu gồm phátừ vựng, mẫu câu, nghe ngắn, shadowing và ôn tập đều.', slug: 'lo-trinh-hoc-tieng-anh-cho-nguoi-moi-bat-dau', excerpt: 'Một lộ trình tốt không cần quá nặng. Nó chỉ cần cho bạn biết hôm nay học gì, ôn gì và dùng lại thế nào.', keywords: ['lộ trìnhọc tiếng Anh cho người mới bắt đầu', 'lộ trìnhọc tiếng Anh', 'học tiếng Anh từ đầu'], topic: 'lo-trinh', quickAnswerHeading: 'lộ trìnhọc tiếng Anh cho người mới nên gồm gì?', quickAnswer: 'lộ trình nên gồm phát âm căn bản, từ vựng gần đời sống, mẫu câu đơn giản, luyện nghe câu ngắn, shadowing nhẹ và ôn tập. Thứ tự này giúp người mới xây nền mà không bị rời rạc.', quickBullets: ['Có bản đồ học rõ ràng.', 'Nối từ vựnghe nói.', 'Ôn lại là một phần của lộ trình.'] }),
  post({ title: 'học tiếng Anh miễn phí ở đâu để không bị lạc giữa quá nhiều lựa chọn?', description: 'Gợi ý học tiếng Anh miễn phí ở đâu, cách chọn nguồn học an toàn và cách bắtừ vựnglish bằng lộ trình, shadowing, từ vựng.', slug: 'hoc-tieng-anh-mien-phi-o-dau', excerpt: 'Nguồn học miễn phí tốt cần có đường đi rõ, nội dung vừa sức và không đẩy người mới vào mê cung tài liệu.', keywords: ['học tiếng Anh miễn phí ở đâu', 'học tiếng Anh miễn phọc tiếng Anh'], topic: 'mien-phi', quickAnswerHeading: 'Nên học tiếng Anh miễn phí ở đâu?', quickAnswer: 'Bạn nên chọn nơi có lộ trình rõ, bài học nhỏ, hoạt động nghe nói và phần ôn từ vựng. PooEnglish cho phát âmiễn phí với lộ trình, shadowing và sổ từ vựngười mới thử trước.', quickBullets: ['Ưu tiên nguồn có cấu trúc.', 'Tránh đổi tài liệu liên tục.', 'Bắt đầu bằng một bài nhỏ hôm nay.'] }),
];

export const BLOG_POST_SLUGS = BLOG_POSTS.map((post) => post.slug);

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostPath(post: Pick<BlogPost, 'slug'>) {
  return `/blog/${post.slug}`;
}

export function getBlogPostsByTopic(topic: BlogTopic) {
  return BLOG_POSTS.filter((post) => post.topic === topic);
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3) {
  return BLOG_POSTS.filter((item) => item.topic === post.topic && item.slug !== post.slug).slice(0, limit);
}
