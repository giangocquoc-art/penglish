export type ReviewSeoFaq = {
  question: string;
  answer: string;
};

export type ReviewSeoLink = {
  label: string;
  to: string;
};

export type ReviewSeoSection = {
  heading: string;
  paragraphs: string[];
};

export type ReviewSeoPage = {
  path: string;
  keyword: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  quickAnswer: string;
  sections: ReviewSeoSection[];
  faqs: ReviewSeoFaq[];
  clusterLinks: ReviewSeoLink[];
};

const coreCtas: ReviewSeoLink[] = [
  { labelộ trình học', to: '/learning-path' },
  { label: 'Luyện shadowing', to: '/shadowing' },
  { label: 'Ôn từ vựng', to: '/words' },
];

const universalFaqs: ReviewSeoFaq[] = [
  {
    question: 'Có cần đăng nhập để học và ôn tiếng Anh trên PooEnglish không?',
    answer: 'Không bắt buộc. Bạn có thể đọc trang hướng dẫn, mở lộ trình và học thử ở chế độ khách. Khi muốn lưu tiến độ lâu dài, Poo sẽ mời bạn đăng nhập nhẹ nhàng bằng Google.',
  },
  {
    question: 'Mỗi ngày nên ôn tiếng Anh bao lâu?',
    answer: 'Người mới nên bắt đầu với 15–25 phút. Quan trọng nhất lộ trìnhịp đều: mộtừ vựng, một ít nghe nói, một bài ôn ngắn và một ghi chú lỗi sai cần quay lại.',
  },
  {
    question: 'Người mất gốc có thể theo các trang ôn tập này không?',
    answer: 'Có. Nội dung được viết cho người Việt mới học hoặc muốn bắt đầu lại. PooEnglish ưu tiên câu gần đời sống, giải thích bằng tiếng Việt dễ hiểu và chia kỹ năng thành bước nhỏ.',
  },
];

const cluster = {
  on: { label: 'Ôn tiếng Anh', to: '/on-tieng-anh' },
  matGoc: { label: 'Ôn tiếng Anh cho người mất gốc', to: '/on-tieng-anh-cho-nguoi-mat-goc' },
  cachOn: { label: 'Cách ôn hiệu quả', to: '/cach-on-tieng-anh-hieu-qua' },
  tuVung: { label: 'Ôn từ vựng', to: '/on-tu-vung-tieng-anh' },
  nguPhap: { label: 'Ôn ngữ pháp', to: '/on-ngu-phap-tieng-anh' },
  nghe: { label: 'Ôn luyện nghe', to: '/on-luyen-nghe-tieng-anh' },
  noi: { label: 'Ôn nói', to: '/on-noi-tieng-anh' },
  shadowing: { label: 'Ôn shadowing', to: '/on-shadowing-tieng-anh' },
  daily: { label: 'Học mỗi ngày', to: '/hoc-tieng-anh-moi-ngay' },
  online: { label: 'Luyện online', to: '/luyen-tieng-anh-online' },
};

function learningLoop(keyword: string, focus: string): ReviewSeoSection[] {
  return [
    {
      heading: `Hiểu đúng về ${keyword}`,
      paragraphs: [
        `${keyword} không nên được hiểu là ngồi học lại thật nhiều lý thuyết trong mộtừ vựngười mới, ôn hiệu quả là gặp lại kiến thức cũ trong bối cảnh vừa đủ dễ hiểu, rồi dùng nó thêm một lần nữa. Nếu hôm qua bạn học một câu giới thiệu bản thân, hôm nay bạn có thể nghe lại câu đó, đổi một từ trong câu, nói lại theo nhịp chậm và làm một câu kiểm tra nhỏ. Cách ôn như vậy khiến não nhận ra tiếng Anh là thứ đang được dùng, không phải một danh sách nằm yên trong vở.`,
        `PooEnglish nhìn việc ôn như mộtừ vựng bơi nhỏ: nhặt lại từ quen, nhìn câu mẫu, nghe âm, nói theo, kiểm tra và đánh dấu phần còn yếu. Vòng này không quá nặng nên người học bận rộn vẫn có thể quay lại mỗi ngày. Cá voi Poo không cổ vũ kiểu học thật gấp rồi kiệt sức; Poo thích nhịp đều, mềm và có dấu hiệu tiến bộ rõ ràng. Khi bạn ôn ít nhưng đúng chỗ, cảm giác sợ tiếng Anh sẽ giảm dần.`,
        `Điểm quan trọng của ${keyword} là biết mình đang ôn để làm gì. Có ngày mục tiêu là nhớ từ, có ngày là nghe ra âm nối, có ngày là nói một câu bớt ngập ngừng. Nếu gom tất cả mục từ vựng lúc, người mới dễ nản. Vì vậy Poo khuyên bạn chọn một trọng tâm chính cho mỗi buổi, ví dụ hôm nay tập trung vào ${focus}, ngày mai quay sang nghe hoặc nói. Sự rõ ràng giúp buổi ôn ngắn nhưng có kết quả.`,
      ],
    },
    {
      heading: 'Một buổi ôn nên có cấu trúc nhỏ và lặp lại được',
      paragraphs: [
        `Một buổi ôn tiếng Anh thân thiện có thể bắt đầu bằng phần khởi động một phút: xem lại ba từ hoặc hai câu quen. Sau đó bạn đi vào hoạt động chính, chẳng hạn nghe một đoạn ngắn, đọc một mẫu câu, làm quiz hoặc nói theo. Cuối buổi, bạn ghi lại một lỗi sai hoặc một câu muốn dùng lại. Cấu trúc này nghe đơn giản nhưng rất mạnh, vì nó giúp bạn biết khi nào bắt đầu, khi nào kết thúc và hôm sau nên quay lại phần nào.`,
        `Người mới thường thất bại không phải vì thiếu tài liệu, mà vì mỗi lần mở tài liệu lại phải quyết định quá nhiều. Học video nào, học từ nào, ôn bài cũ hay học bài mới, có cần ghi chép hay không. PooEnglish cố gắng giảm số quyết định đó bằng lộ trình, sổ từ vựng, shadowing và các vùng học rõ ràng. Khi đường đi đã gọn, bạn dành năng lượng cho việc luyện thật thay vì loay hoay chọn tài liệu.`,
        `Cấu trúc nhỏ cũng giúp bạn tránh cảm giác tội lỗi. Nếu hôm nay chỉ có 15 phút, bạn vẫn hoàn thành được mộtừ vựng ôn. Nếu hôm nay có nhiều thời gian hơn, bạn có thể bơi thêm sang shadowing hoặc từ vựng. Điều quan trọng là buổi ôn nào cũng có một điểm đóng lại, để não cảm thấy đã hoàn thành. Cảm giác hoàn thành nhỏ chính là nhiên liệu cho thói quen dài hạn.`,
      ],
    },
    {
      heading: 'Kếtừ vựngữ pháp, nghe và nói thay vì học rời rạc',
      paragraphs: [
        `Một lỗi phổ biến khi ôn tiếng Anh là chia mọi thứ thành những hòn đảo tách biệt: hôm nay chỉ học từ, mai chỉ học ngữ pháp, ngày kia chỉ nghe. Cách này không sai, nhưng nếu kéo dài quá lâu, người học biết nhiều mảnh nhỏ mà vẫn khó dùng trong câu thật. PooEnglish khuyến khích nối các mảnh lại. Một từ mới nên đi kèm ví dụ, một mẫu ngữ pháp nên được nghe trong câu, một đoạn nghe nên được nói lại ít nhất một lần.`,
        `Khi kỹ năng được nối với nhau, mỗi lần ôn tạo ra nhiều đường nhớ. Bạn nhìn chữ để nhận dạng mặt từ, nghe âm để tai quen, nói lại để miệng bớt cứng, rồi làm quiz để kiểm tra. Những đường nhớ này hỗ trợ lẫn nhau. Nếu quên nghĩa, bạn có thể nhớ ngữ cảnh. Nếu nghe chưa rõ, bạn có thể nhìn lại câu. Nếu nói còn chậm, bạn có thể nghe mẫu và thử lại.`,
        `Với trọng tâm ${focus}, bạn vẫn nên giữ một chút liên kết sang kỹ năng khác. Ví dụ ôn từ vựng thì đọc câu ví dụ thành tiếngữ pháp thì nghe một câu có mẫu đó; ôn nghe thì ghi lại từ khóa; ôn nói thì xem lại một cấu trúc đơn giản. Poo gọi đây là cách bơi theo cụm sóng: không quá rộng, nhưng đủ để kỹ năng này đẩy kỹ năng kia tiến lên.`,
      ],
    },
    {
      heading: 'Cách PooEnglish giúp bạn ôn đều mà không bị áp lực',
      paragraphs: [
        `PooEnglish được xây cho người học Việt Nam, đặc biệt là người từng thấy tiếng Anh khó gần. Vì vậy nội dung công khai luôn cố gắng giải thích bằng tiếng Việt tự nhiên, dùng ví dụ đời sống và giữ giọng thân thiện. Cá voi Poo có thể dễ thương, nhưng không biến việc học thành trò đùa trẻ con. Poo chỉ làm cho bài học bớt khô, lời nhắc bớt căng và hành trình dài trở nên dễ quay lại hơn.`,
        `Trong ứng dụng, bạn có thể đi theo lộ trình, mở phòng shadowing để nói theo câu ngắn, dùng sổ từ vựng để ôn lại phần cần nhớ và quay lại các trang hướng dẫn khi muốn hiểu phươngữ pháp. Các liên kết này không phải để bạn mở hết cùng lúc. Hãy chọn một điểm bắt đầu. Nếu mất gốc, vào lộ trình. Nếu ngại nói, thử shadowing. Nếu hay quên từ, mở sổ từ. Mỗi lựa chọn đều có thể trở thành một bước nhỏ trong cùng hành trình.`,
        `Một điểm Poo muốn nhắc là ôn tập khôngữ pháphạt cho việc bạn quên. Quên là cơ chế bình thường của trí nhớ. Việc ôn chỉ là cách gửi lại tín hiệu cho não rằng kiến thức này vẫn quan trọng. Khi bạn gặp lại mộtừ vựngày và nhớ nhanh hơn lần trước, đó là tiến bộ thật. Đừng chỉ đo bằng số bài đã học; hãy đo bằng cảm giác hiểu nhanh hơn, nghe rõ hơn và dám nói thêm một câu.`,
      ],
    },
    {
      heading: 'lộ trình 7 ngày để bắt đầu nhẹ nhàng',
      paragraphs: [
        `Trong ngày đầu tiên, hãy chọn một mục tiêu nhỏ và ghi lại lý do học của bạn. Ngày thứ hai, ôn 5–8 từ gần đời sống và đặt mỗi từ vào một câu. Ngày thứ ba, nghe một đoạn ngắn, nhìn transcript nếu cần và đánh dấu từ nghe chưa ra. Ngày thứ tư, chọn ba câu để nói theo thật chậm. Ngày thứ năm, ôn một mẫu ngữ pháp căn bản bằng ví dụ. Ngày thứ sáu, làm quiz hoặc tự kiểm tra. Ngày thứ bảy, xem lại lỗi sai và chọn phần muốn giữ cho tuần sau.`,
        `lộ trình 7 ngày này không nhằm biến bạn thành người giỏi ngay. Nó giúp bạn có bằng chứng rằng mình có thể quay lại tiếng Anh đều đặn. Sau một tuần, bạn sẽ biết mình yếu ở đâu hơn: quên từ, nghe chưa ra âm, sợ nói hay rối mẫu câu. Biết đúng điểm yếu là lợi thế lớn, vì buổi ôn tiếp theo sẽ có hướng rõ hơn. PooEnglish có các vùng học tương ứng để bạn không phải tự bơi một mình.`,
        `Nếu bỏ lỡ một ngày, đừng xóa cả kế hoạch. Hãy quay lại bằng phiên bản nhỏ hơn: chỉ ôn ba từ, nghe một câu hoặc nói một câu. Thói quen học không cần hoàn hảo; thói quen cần đường quay lại. Poo luôn ưu tiên câu hỏi: hôm nay mình có thể làm bước nhỏ nào để tiếng Anh vẫn còn trong nhịp sống? Khi câu trả lời đủ nhẹ, bạn sẽ dễ tiếp tục hơn.`,
      ],
    },
  ];
}

export const REVIEW_SEO_PAGES: ReviewSeoPage[] = [
  {
    path: '/on-tieng-anh',
    keyword: 'ôn tiếng Anh',
    tiếng Anh cho người mới bắt đầu - PooEnglish',
    description: 'Hướng dẫn ôn tiếng Anh hiệu quả cùng PooEnglish: từ vựngữ pháp, luyện nghe, shadowing và lộ trình học rõ ràng cho người mới bắt đầu.',
    h1: 'Ôn tiếng Anh cho người mới bắt đầu cùng PooEnglish',
    eyebrow: 'Cụm từ khóa ôn tiếng Anh',
    quickAnswer: 'Ôn tiếng Anh hiệu quả là ôn từ vựng nhỏ mỗi ngày: xem lại từ vựng, hiểu mẫu câu, nghe câu ngắn, nói theo và ghi lại lỗi sai. Người mới không cần học quá nhiều; hãy bắt đầu 15–25 phát âmục tiêu rõ ràng và quay lại đều.',
    sections: learningLoop('ôn tiếng Anh', 'xây lại nền tổng hợp'),
    faqs: [
      ...universalFaqs,
      { questiếng Anh nên bắt đầu từ kỹ năng nào?', answer: 'Nếu bạn chưa chắc nền, hãy bắt đầu từ vựng và câu mẫu ngắn, sau đó thêm nghe và nói theo. Đừng tách kỹ năng quá lâu, vì tiếng Anh cần được dùng trong câu thật.' },
      { question: 'Có nên học bài mới khi bài cũ chưa chắc không?', answer: 'Có thể học mới rất ít, nhưng nên dành phần lớn thời gian để ôn phần cũ còn yếu. Tỷ lệ dễ áp dụng là 70% ôn lại, 30% học thêm.' },
      { question: 'PooEnglish có giúp ôn đều mỗi ngày không?', answer: 'Có. Bạn có thể dùng lộ trình, shadowing và sổ từ vựng để từ vựngắn, dễ quay lại mà không bị quá tải.' },
    ],
    clusterLinks: [cluster.matGoc, cluster.cachOn, cluster.tuVung, cluster.nghe, cluster.daily, ...coreCtas],
  },
  {
    path: '/on-tieng-anh-cho-nguoi-mat-goc',
    keyword: 'ôn tiếng Anh cho người mất gốc',
    tiếng Anh cho người mất gốc - Bắt đầu lại cùng PooEnglish',
    description: 'Cách ôn tiếng Anh cho người mất gốc bằng bài học nhỏ, từ vựng gần đời sống, mẫu câu căn bản, luyện nghe nói chậm và lộ trình đều đặn cùng PooEnglish.',
    h1: 'Ôn tiếng Anh cho người mất gốc: bắt đầu lại từng bước nhỏ',
    eyebrow: 'Bắt đầu lại không áp lực',
    quickAnswer: 'Người mất gốc nên ôn từ những câu rất gần đời sống, không cố học nhiều thì ngữ pháp cùng lúc. Hãy học ít, nghe chậm, nói theo câu ngắn và dùng lộ trình để biết hôm nay cần ôn gì.',
    sections: learningLoop('ôn tiếng Anh cho người mất gốc', 'lấy lại nền từ vựng và câu căn bản'),
    faqs: [
      ...universalFaqs,
      { question: 'Mất gốc có nên học ngữ pháp lại từ đầu không?', answer: 'Nên học, nhưng học qua mẫu câu trước. Bạn không cần đọc quá nhiều thuật ngữ; hãy hiểu mộtừ vựng nó trong câu đời thường.' },
      { question: 'Bao lâu thì người mất gốc thấy tiến bộ?', answer: 'Nếu học đều 15–25 phát âmỗi ngày, bạn có thể cảm thấy quen câu và bớt sợ sau vài tuần. Tiến bộ ban đầu thường là hiểu nhanh hơn và dám nói câu ngắn.' },
      { question: 'Nên tránh điều gì khi bắt đầu lại?', answer: 'Tránh ôm quá nhiều tài liệu, học danh sách từ quá dài hoặc so sánh mình với người học lâu năm. Hãy giữ đường học nhỏ và rõ.' },
    ],
    clusterLinks: [cluster.on, cluster.cachOn, cluster.nguPhap, cluster.nghe, cluster.online, ...coreCtas],
  },
  {
    path: '/cach-on-tieng-anh-hieu-qua',
    keyword: 'cách ôn tiếng Anh hiệu quả',
    title: 'Cách ôn tiếng Anh hiệu quả mỗi ngày - PooEnglish',
    description: 'Gợi ý cách ôn tiếng Anh hiệu quả mỗi ngày cho người mới: chia nhỏ mục tiêu, ôn đúng lỗi sai, kếtừ vựnghe, nói, shadowingữ pháp.',
    h1: 'Cách ôn tiếng Anh hiệu quả mỗi ngày mà không bị quá tải',
    eyebrow: 'Phươngữ pháp học đều',
    quickAnswer: 'Cách ôn tiếng Anh hiệu quả là chia buổi học thành ba phần: ôn lại kiến thức cũ, luyện một kỹ năng chính và ghi chú lỗi cần quay lại. Học ít nhưng đều thường bền hơn học dồn thật nhiều.',
    sections: learningLoop('cách ôn tiếng Anh hiệu quả', 'thiết kế thói quen ôn tập'),
    faqs: [
      ...universalFaqs,
      { questiếng Anh buổi sáng hay buổi tối tốt hơn?', answer: 'Thời điểm tốt nhất là thời điểm bạn duy trì được. Buổi sáng hợp để khởi động nhẹ, buổi tối hợp để xem lại lỗi sai và nghe câu ngắn.' },
      { question: 'Có nên ghi chép khi ôn không?', answer: 'Có, nhưng ghi ít thôi. Hãy ghi câu dùng được, lỗi hay sai và từ cần gặp lại; đừng biến ghi chép thành việc chép lại toàn bộ bài học.' },
      { question: 'Làm sao biết mình ôn hiệu quả?', answer: 'Bạn hiểu nhanh hơn, nhớ lại dễ hơn, nghe ra nhiều từ quen hơn và dám nói lại câu đã học. Đó là dấu hiệu thực tế hơn số giờ học.' },
    ],
    clusterLinks: [cluster.on, cluster.matGoc, cluster.daily, cluster.shadowing, cluster.tuVung, ...coreCtas],
  },
  {
    path: '/on-tu-vung-tieng-anh',
    keyword: 'ôn từ vựng Anh',
    title: 'Ôn từ vựng Anh dễ nhớ cùng PooEnglish',
    description: 'Hướng dẫn ôn từ vựng Anh theo ngữ cảnh, câu ví dụ, nhịp lặp lại và sổ từ vựngười mới nhớ lâu hơn mà không học vẹt.',
    h1: 'Ôn từ vựng Anh dễ nhớ bằng câu và ngữ cảnh',
    eyebrow: 'Nhặt vỏ sò từ vựng',
    quickAnswer: 'Ôn từ vựng hiệu quả không phải học thật nhiều từ rời rạc. Hãy học từ trong câu, nghe cách phát âm, tự đặtừ vựngắn và quay lại từ vựngày.',
    sections: learningLoop('ôn từ vựng Anh', 'ghi nhớ từ trong ngữ cảnh'),
    faqs: [
      ...universalFaqs,
      { question: 'Nên ôn bao nhiêu từ mỗi ngày?', answer: 'Người mới nên bắt đầu với 5–10 từ có câu ví dụ. Ít từ nhưng dùng được sẽ tốt hơn nhiều từ nhưng chỉ nhớ nghĩa tiếng Việt.' },
      { question: 'Học từ vựng theo chủ đề có hiệu quả không?', answer: 'Có. Chủ đề giúp não nhóm thông tin, nhưng bạn vẫn nên đặt từ vào câu để biết cách dùng thật.' },
      { question: 'Quên từ nhiều có bình thường không?', answer: 'Rất bình thường. Quên là lý do cần ôn cách quãng, không phải dấu hiệu bạn không có năng khiếu.' },
    ],
    clusterLinks: [cluster.on, cluster.nguPhap, cluster.nghe, cluster.daily, cluster.online, ...coreCtas],
  },
  {
    path: '/on-ngu-phap-tieng-anh',
    keyword: 'ôn ngữ pháp tiếng Anh',
    title: 'Ôn ngữ pháp tiếng Anh cơ bản - PooEnglish',
    description: 'Ôn ngữ pháp tiếng Anh cơ bản bằng mẫu câu gần đời sống, ví dụ dễ hiểu và bài luyện nhỏ để người mới hiểu cấu trúc mà không bị khô cứng.',
    h1: 'Ôn ngữ pháp tiếng Anh cơ bản bằng mẫu câu dễ hiểu',
    eyebrow: 'Mẫu câu dễ thở',
    quickAnswer: 'Ôn ngữ pháp nên bắt đầu từ mẫu câu dùng được, không phải học thuộc định nghĩa dài. Hãy chọn một cấu trúc, xem ví dụ, tự thay từ và nói lại thành câu của mình.',
    sections: learningLoop('ôn ngữ pháp tiếng Anh', 'hiểu mẫu câu căn bản'),
    faqs: [
      ...universalFaqs,
      { question: 'Có cần học hết ngữ pháp trước khi nói không?', answer: 'Không. Bạn nên học một mẫu nhỏ rồi dùng ngay. Nói giúp bạn thấy chỗ cần sửa và nhớ cấu trúc tự nhiên hơn.' },
      { question: 'ngữ pháp nào nên ôn trước?', answer: 'Hãy bắt đầu với câu giới thiệu, hiện tại đơn, câu hỏi đơn giản, danh từ số ít/số nhiều và các mẫu diễn đạt nhu cầu thường ngày.' },
      { question: 'Sợ sai ngữ pháp thì làm sao?', answer: 'Hãy nói câu ngắn trước. Sai một lỗi nhỏ không sao; quan trọng là bạn có dữ liệu để sửa và thử lại.' },
    ],
    clusterLinks: [cluster.matGoc, cluster.cachOn, cluster.tuVung, cluster.noi, cluster.daily, ...coreCtas],
  },
  {
    path: '/on-luyen-nghe-tieng-anh',
    keyword: 'ôn luyện nghe tiếng Anh',
    title: 'Ôn luyện nghe tiếng Anh cho người mới bắt đầu - PooEnglish',
    description: 'Cách ôn luyện nghe tiếng Anh cho người mới: nghe câu ngắn, bắt từ khóa, xem transcript đúng lúc, shadowing và lặp lại để tai quen dần.',
    h1: 'Ôn luyện nghe tiếng Anh cho người mới bắt đầu',
    eyebrow: 'Nghe sóng nhỏ',
    quickAnswer: 'Người mới nên ôn luyện nghe bằng đoạn ngắn, tốc độ vừa phải và mục tiêu rõ: bắt từ khóa, hiểu ý chính, nghe lại câu khó rồi nói theo. Không cần nghe dài ngay từ đầu.',
    sections: learningLoop('ôn luyện nghe tiếng Anh', 'nghe câu ngắn và nhận diện âm quen'),
    faqs: [
      ...universalFaqs,
      { question: 'Không nghe kịp thì có nên bật phụ đề không?', answer: 'Có thể bật transcript để hiểu trước, sau đó nghe lại không nhìn chữ. Phụ đề là phao hỗ trợ, không phải thất bại.' },
      { question: 'Nên nghe giọng bản xứ hay giọng chậm?', answer: 'Người mới nên bắtừ vựng rõ và tốc độ vừa phải. Khi tai quen hơn, bạn tăng dần tốc độ và độ dài.' },
      { question: 'Luyện nghe có cần nói theo không?', answer: 'Rất nên. Nói theo giúp từ vựngữ pháp, từ đó bạn nhớ nhịp câu tốt hơn.' },
    ],
    clusterLinks: [cluster.shadowing, cluster.noi, cluster.tuVung, cluster.on, cluster.online, ...coreCtas],
  },
  {
    path: '/on-noi-tieng-anh',
    keyword: 'ôn nói tiếng Anh',
    title: 'Ôn nói tiếng Anh tự nhiên hơn cùng PooEnglish',
    description: 'Hướng dẫn ôn nói tiếng Anh bằng câu ngắn, shadowing, phản xạ chậm, từ vựng quen và nhịp luyện đều để người mới bớt ngại miệng.',
    h1: 'Ôn nói tiếng Anh tự nhiên hơn từ những câu rất nhỏ',
    eyebrow: 'Dám mở miệng cùng Poo',
    quickAnswer: 'Ôn nói tiếng Anh nên bắt đầu bằng câu ngắn và tình huống quen. Hãy nghe mẫu, nói theo chậm, thay một vài từ rồi lặp lại. Mục tiêu đầu tiên là dám nói rõ hơn, chưa cần hoàn hảo.',
    sections: learningLoop('ôn nói tiếng Anh', 'tập phản xạ bằng câu ngắn'),
    faqs: [
      ...universalFaqs,
      { question: 'phát âm chưa tốt có nên luyện nói không?', answer: 'Nên. Bạn cần nói để phát âm khó. Hãy luyện chậm, nghe lại mẫu và sửa từng chút.' },
      { question: 'Không có người luyện cùng thì làm sao?', answer: 'Bạn có thể dùng shadowing, tự trả lời câu hỏi đơn giản và ghi âm lại. PooEnglish ưu tiên các hoạt động tự luyện được.' },
      { question: 'Nói sai có làm hình thành thói quen xấu không?', answer: 'Nếu bạn có nghe mẫu và sửa dần, nói sai không đáng sợ. Im lặng quá lâu mới là rào cản lớn.' },
    ],
    clusterLinks: [cluster.shadowing, cluster.nghe, cluster.nguPhap, cluster.daily, cluster.online, ...coreCtas],
  },
  {
    path: '/on-shadowing-tieng-anh',
    keyword: 'ôn shadowing tiếng Anh',
    title: 'Ôn shadowing tiếng Anh mỗi ngày - PooEnglish',
    description: 'Cách ôn shadowing tiếng Anh mỗi ngày bằng đoạn ngắn, nghe mẫu, nói đuổi, sửa nhịp và kếtừ vựng để luyện phản xạ tự nhiên hơn.',
    h1: 'Ôn shadowing tiếng Anh mỗi ngày để nghe và nói tự nhiên hơn',
    eyebrow: 'Nói đuổi theo sóng',
    quickAnswer: 'Ôn shadowing là nghe một câu mẫu rồi nói theo gần như ngay sau đó. Người mới nên chọn câu ngắn, nghe kỹ, nói chậm trước và lặp lại nhiều lần thay vì cố bắt chước đoạn dài.',
    sections: learningLoop('ôn shadowing tiếng Anh', 'nghe mẫu và nói đuổi theo nhịp'),
    faqs: [
      ...universalFaqs,
      { question: 'Shadowing khác luyện nghe thế nào?', answer: 'Luyện nghe tập trung vào hiểu âm thanh. Shadowing thêm bước nói theo, nên giúp phản xạ miệng và tai đi cùng nhau.' },
      { question: 'Một ngày nên shadowing bao nhiêu câu?', answer: 'Người mới chỉ cần 3–5 câu làm thật kỹ. Nghe, nói, nghe lại và sửa một điểm nhỏ là đủ tốt.' },
      { question: 'Có cần hiểu nghĩa trước khi shadowing không?', answer: 'Nên hiểu ý chính. Khi biết câu đang nói gì, bạn shadowing có mục đích hơn và tránh đọc vẹt.' },
    ],
    clusterLinks: [cluster.nghe, cluster.noi, cluster.cachOn, cluster.daily, cluster.on, ...coreCtas],
  },
  {
    path: '/hoc-tieng-anh-moi-ngay',
    keyword: 'học tiếng Anh mỗi ngày',
    title: 'học tiếng Anh mỗi ngày cùng cá voi Poo - PooEnglish',
    description: 'Gợi ý học tiếng Anh mỗi ngày bằng thói quen nhỏ, lộ trình rõ, ôn từ vựng, luyện nghe, shadowing và kiểm tra nhẹ cùng cá voi Poo.',
    học tiếng Anh mỗi ngày cùng cá voi Poo bằng bước nhỏ dễ giữ',
    eyebrow: 'Thói quen học đều',
    quickAnswer: 'học tiếng Anh mỗi ngày không cần quá dài. Bạn chỉ cần mộtừ vựng học nhỏ gồm ôn từ, nghe một câu, nói lại, làm quiz ngắn và ghi một lỗi sai. Nhịp đều quan trọng hơn cường độ cao.',
    sections: learningLoop('học tiếng Anh mỗi ngày', 'duy trì thói quen học đều'),
    faqs: [
      ...universalFaqs,
      { question: 'Bận quá có thể học mỗi ngày không?', answer: 'Có, nếu phiên học đủ nhỏ. Ba từ mới, một câu nghe và một lần nói theo vẫn tốt hơn bỏ hẳn.' },
      { question: 'Có nên học cùng một giờ mỗi ngày?', answer: 'Nếu làm được thì rất tốt, vì não dễ tạo thói quen. Nhưng nếu lịch thay đổi, hãy giữ một phiên tối thiểu linh hoạt.' },
      { question: 'Làm sao để không bỏ cuộc sau vài ngày?', answer: 'Đừng đặt mục tiêu quá lớn. Hãy giữ bước học nhỏ, có điểm kết thúc rõ và cho phép mình quay lại sau ngày bận.' },
    ],
    clusterLinks: [cluster.on, cluster.cachOn, cluster.tuVung, cluster.shadowing, cluster.online, ...coreCtas],
  },
  {
    path: '/luyen-tieng-anh-online',
    keyword: 'luyện tiếng Anh online',
    title: 'Luyện tiếng Anh online miễn phí cùng PooEnglish',
    description: 'Luyện tiếng Anh online cùng PooEnglish với lộ trình học, shadowing, sổ từ vựng, luyện nghe nói và ôn tập thân thiện cho người Việt mới bắt đầu.',
    h1: 'Luyện tiếng Anh online miễn phí cùng PooEnglish',
    eyebrow: 'Học online nhẹ nhàng',
    quickAnswer: 'Luyện tiếng Anh online hiệu quả khi bạn có lộ trình rõ và hoạt động ngắn: học từ, nghe câu, nói theo, ôn lỗi sai và quay lại đều. PooEnglish giúp bạn bắt đầu mà không cần chuẩn bị quá nhiều tài liệu.',
    sections: learningLoop('luyện tiếng Anh online', 'học linh hoạt với lộ từ vựng cụ ôn tập'),
    faqs: [
      ...universalFaqs,
      { question: 'Luyện tiếng Anh online có phù hợp người mới không?', answer: 'Có, nếu nội dung được chia nhỏ và có hướng dẫn rõ. PooEnglish thiết kế trang học cho người Việt mới bắt đầu hoặc học lại.' },
      { question: 'Học online có cần giáo viên không?', answer: 'Giáo viên rất hữu ích, nhưng bạn vẫn có thể tự xây nền bằng lộ trình, shadowing, từ vựng và ôn tập đều. Khi có nền, học với giáo viên cũng hiệu quả hơn.' },
      { question: 'Nên dùng PooEnglish trên điện thoại hay máy tính?', answer: 'Cả hai đều được. Điện thoại hợp phiên học ngắn hằng ngày; máy tính hợp khi bạn muốn đọc kỹ, ghi chú hoặc luyện lâu hơn.' },
    ],
    clusterLinks: [cluster.on, cluster.matGoc, cluster.daily, cluster.nghe, cluster.noi, ...coreCtas],
  },
];

export const REVIEW_SEO_PATHS = REVIEW_SEO_PAGES.map((page) => page.path);

export function getReviewSeoPageByPath(pathname: string) {
  return REVIEW_SEO_PAGES.find((page) => page.path === pathname);
}
