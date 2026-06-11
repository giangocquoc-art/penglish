export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogSection = {
  heading: string;
  body: string[];
};

export type BlogPost = {
  title: string;
  description: string;
  slug: string;
  date: string;
  excerpt: string;
  readingTime: string;
  keywords: string[];
  sections: BlogSection[];
  faqs: BlogFaq[];
};

const commonFaqs = {
  freeLearning: {
    question: 'Có thể học miễn phí trên PooEnglish không?',
    answer: 'Có. Bạn có thể vào lộ trình học, shadowing, từ vựng và khóa 48 ngày để bắt đầu ở chế độ khách. Khi muốn lưu hành trình lâu dài hơn, đăng nhập chỉ là lựa chọn thêm.',
  },
  beginner: {
    question: 'Người mất gốc có theo được không?',
    answer: 'Theo được. PooEnglish chia bài thành bước nhỏ, ưu tiên câu gần đời sống, có nhịp ôn lại và không ép người học phải hiểu mọi thứ ngay từ đầu.',
  },
  daily: {
    question: 'Mỗi ngày nên học bao lâu?',
    answer: 'Bạn có thể bắt đầu với 10 đến 20 phút. Điều quan trọng không phải học thật nhiều trong một ngày, mà là quay lại đều để não gặp tiếng Anh thường xuyên.',
  },
};

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Shadowing tiếng Anh là gì? Cách luyện nghe nói nhẹ nhàng cùng Poo',
    description: 'Shadowing tiếng Anh là gì, phù hợp với ai và nên luyện ra sao để cải thiện nghe nói mà không bị áp lực? Cùng cá voi Poo tìm hiểu cách bắt đầu dễ thương.',
    slug: 'shadowing-tieng-anh-la-gi',
    date: '2026-06-11',
    excerpt: 'Shadowing là cách nghe một câu tiếng Anh rồi nói theo gần như ngay sau đó. Nếu luyện đúng nhịp, phương pháp này giúp tai và miệng phối hợp tự nhiên hơn.',
    readingTime: '8 phút đọc',
    keywords: ['shadowing tiếng Anh', 'luyện nghe nói', 'phát âm tiếng Anh'],
    sections: [
      {
        heading: 'Shadowing là nghe và nói cùng một nhịp',
        body: [
          'Shadowing tiếng Anh có thể hiểu đơn giản là bạn nghe một câu mẫu, sau đó nói theo gần như ngay lập tức. Khác với việc chỉ nghe rồi ghi chép, shadowing bắt tai, miệng và trí nhớ cùng tham gia. Bạn không đứng ngoài câu tiếng Anh nữa, mà bước vào nhịp của câu, cảm nhận âm nối, trọng âm và cách người nói thả hơi. Với người mới, Poo khuyên bắt đầu bằng câu ngắn, tốc độ chậm và nội dung quen thuộc. Mục tiêu đầu tiên không phải nói giống hoàn toàn, mà là dám phát âm thành tiếng và nhận ra câu mình vừa nghe.',
          'Hãy tưởng tượng Poo đang bơi trước bạn một đoạn nhỏ. Poo nói một câu, bạn bơi theo và nhắc lại. Nếu hụt hơi, mình dừng lại, nghe lại, rồi thử thêm lần nữa. Shadowing tốt không phải một cuộc thi phát âm, mà là một bài tập phối hợp. Sau vài ngày, bạn sẽ thấy những cụm âm từng rất lạ bắt đầu có hình dạng rõ hơn. Tai nghe nhanh hơn một chút, miệng bớt cứng hơn một chút, và cảm giác sợ nói cũng mềm đi.'
        ],
      },
      {
        heading: 'Vì sao shadowing giúp người học nói tự nhiên hơn?',
        body: [
          'Khi chỉ học từ vựng riêng lẻ, bạn có thể biết nghĩa nhưng vẫn không biết nói thành câu. Khi chỉ học ngữ pháp, bạn hiểu quy tắc nhưng phản xạ còn chậm. Shadowing đặt bạn vào câu hoàn chỉnh. Bạn nghe cách từ đứng cạnh nhau, cách âm cuối nối sang âm đầu, cách câu lên xuống giọng. Những chi tiết nhỏ này khó học bằng lý thuyết khô, nhưng lại thấm dần khi bạn lặp lại trong ngữ cảnh. Đó là lý do PooEnglish luôn khuyến khích học từ trong câu và luyện nói đuổi từng đoạn nhỏ.',
          'Shadowing cũng giúp bạn bớt dịch từng chữ trong đầu. Khi một câu được nghe và nói lại nhiều lần, não bắt đầu nhớ cả cụm như một khối. Ví dụ thay vì nghĩ từng từ trong “I want to try again”, bạn nhớ cảm giác của cả câu: mình muốn thử lại. Cụm câu này sau đó có thể được dùng trong tình huống mới. Đây là một bước rất quan trọng để đi từ biết tiếng Anh sang dùng được tiếng Anh.'
        ],
      },
      {
        heading: 'Cách bắt đầu shadowing cho người mới',
        body: [
          'Nếu bạn mới tập, đừng chọn video dài hoặc đoạn nói quá nhanh. Hãy chọn 3 đến 5 câu ngắn. Bước một, nghe toàn câu để hiểu ý chính. Bước hai, nhìn chữ nếu cần và đánh dấu từ khó. Bước ba, nghe từng câu rồi nói theo. Bước bốn, lặp lại câu khó thêm vài lần. Bước năm, nghỉ một chút rồi thử nói lại không nhìn chữ. Cách làm này chậm, nhưng an toàn cho người dễ nản. Poo thích những nhịp bơi chắc hơn là cố lao vào sóng lớn rồi bỏ cuộc.',
          'Trên PooEnglish, bạn có thể ghé /shadowing để luyện nói đuổi, mở /learning-path để đi theo lộ trình, dùng /words để ôn từ trong câu và thử /48-ngay-lay-goc nếu muốn xây nền trước. Bốn vùng học này nối với nhau như những dòng hải lưu nhỏ: học từ giúp nghe dễ hơn, nghe dễ hơn giúp shadowing đỡ căng, shadowing giúp nói tự nhiên hơn, còn lộ trình giúp bạn biết hôm nay nên làm gì.'
        ],
      },
      {
        heading: 'Những lỗi thường gặp khi luyện shadowing',
        body: [
          'Lỗi đầu tiên là cố nói nhanh ngay. Nhiều bạn nghĩ shadowing phải đuổi kịp tốc độ bản gốc, nhưng người mới cần giảm tốc để nghe rõ âm. Lỗi thứ hai là lặp lại quá nhiều câu một lúc. Khi đoạn quá dài, não mệt và bạn dễ nói cho xong. Lỗi thứ ba là chỉ bắt chước âm mà không hiểu nghĩa. Nếu không hiểu câu, bạn sẽ khó dùng lại câu đó trong đời sống. Poo khuyên mỗi buổi chỉ chọn ít câu, hiểu nghĩa, luyện rõ rồi mới chuyển tiếp.',
          'Một lỗi khác là tự chê quá nhanh. Bạn nghe bản ghi của mình và thấy giọng chưa hay, thế là bỏ. Nhưng phát âm là kỹ năng cơ bắp, cần nhiều lần thử. Ngày đầu bạn chỉ cần rõ hơn lần chưa luyện. Ngày thứ ba bạn nghe được một âm nối. Ngày thứ bảy bạn nói câu bớt ngập ngừng. Những thay đổi nhỏ ấy đáng được ghi nhận. Poo sẽ không đòi bạn thành cá heo biểu diễn; Poo chỉ muốn bạn tiếp tục bơi.'
        ],
      },
      {
        heading: 'Một lịch luyện shadowing 10 phút mỗi ngày',
        body: [
          'Bạn có thể chia 10 phút thành bốn phần. Hai phút đầu nghe và hiểu đoạn ngắn. Ba phút tiếp theo luyện từng câu, mỗi câu lặp 2 đến 3 lần. Ba phút sau nói lại cả đoạn theo nhịp chậm hơn. Hai phút cuối ghi chú một câu thích nhất và một âm còn khó. Hôm sau, bạn ôn lại câu cũ trước khi học câu mới. Cách này tạo cảm giác nhẹ, không cần chuẩn bị nhiều, phù hợp với người học trên điện thoại hoặc học sau giờ làm.',
          'Nếu có thêm thời gian, hãy nối shadowing với từ vựng. Sau khi luyện một câu, chọn một từ hoặc cụm từ quan trọng đưa vào /words để ôn. Cuối tuần, quay lại /learning-path để kiểm tra mình đang ở chặng nào. Khi thấy nền còn yếu, /48-ngay-lay-goc là nơi Poo giúp bạn gom lại từ căn bản, mẫu câu và thói quen học. Shadowing không đứng một mình; nó là một phần trong hành trình nghe, hiểu, nói và nhớ.'
        ],
      },
    ],
    faqs: [
      { question: 'Shadowing có phù hợp cho người mới bắt đầu không?', answer: 'Có, nếu bạn chọn câu ngắn, tốc độ vừa phải và hiểu nghĩa trước khi nói theo. Người mới không nên bắt đầu bằng đoạn quá dài.' },
      { question: 'Có cần phát âm giống người bản xứ không?', answer: 'Không. Mục tiêu trước tiên là nói rõ, đúng nhịp cơ bản và tự tin hơn. Giọng tự nhiên sẽ cải thiện dần qua nhiều lần nghe nói.' },
      commonFaqs.daily,
      { question: 'Nên luyện shadowing ở đâu trên PooEnglish?', answer: 'Bạn có thể vào /shadowing để luyện nói đuổi, sau đó dùng /words để ôn từ và /learning-path để theo dõi lộ trình học.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: 'Người mất gốc tiếng Anh nên bắt đầu từ đâu để không bị ngợp?',
    description: 'Người mất gốc tiếng Anh nên bắt đầu bằng bước nào, học gì trước và tránh lỗi gì? Poo gợi ý một lộ trình nhẹ nhàng để xây lại nền từ đầu.',
    slug: 'nguoi-mat-goc-tieng-anh-nen-bat-dau-tu-dau',
    date: '2026-06-11',
    excerpt: 'Mất gốc không có nghĩa là phải học lại trong hoảng hốt. Bạn chỉ cần một bản đồ nhỏ, câu dễ dùng và nhịp học đều để bắt đầu lại.',
    readingTime: '9 phút đọc',
    keywords: ['mất gốc tiếng Anh', 'học tiếng Anh cho người mới', 'lộ trình học tiếng Anh'],
    sections: [
      {
        heading: 'Đừng bắt đầu bằng quá nhiều tài liệu',
        body: [
          'Người mất gốc thường có một cảm giác rất quen: mở mạng lên thì thấy quá nhiều video, sách, danh sách từ và mẹo học. Càng tìm càng rối, rồi cuối cùng không biết bắt đầu từ đâu. Poo muốn bạn tạm đặt bớt tài liệu xuống. Việc đầu tiên không phải gom thật nhiều nguồn học, mà là chọn một đường đi nhỏ đủ rõ. Một ngày chỉ cần biết mình học bài nào, ôn phần nào và luyện một câu gì. Khi bản đồ rõ, tâm trí sẽ nhẹ hơn.',
          'Bạn cũng không cần chứng minh rằng mình học nghiêm túc bằng cách học thật nhiều giờ ngay từ ngày đầu. Người mất gốc cần xây lại niềm tin trước. Nếu buổi học đầu tiên quá nặng, não sẽ ghi nhớ tiếng Anh như một việc đáng sợ. Hãy bắt đầu bằng một bài ngắn, vài từ quen, một mẫu câu dùng được. Khi bạn hoàn thành được bước nhỏ ấy, cảm giác “mình vẫn học được” sẽ quay lại. Đó là nền cảm xúc rất quan trọng.'
        ],
      },
      {
        heading: 'Ưu tiên câu dùng được trước lý thuyết dài',
        body: [
          'Nếu bạn đã quên nhiều ngữ pháp, đừng vội học lại toàn bộ thì, mệnh đề, câu điều kiện và bảng động từ trong một tuần. Hãy bắt đầu bằng câu đời thường: giới thiệu bản thân, nói thói quen, hỏi thông tin, diễn tả cảm xúc, nói mong muốn. Ví dụ “I am learning English”, “I want to try again”, “Can you help me?”. Những câu như vậy vừa dễ hiểu, vừa dùng được ngay. Khi câu đứng vững, ngữ pháp phía sau sẽ có chỗ để bám.',
          'PooEnglish thiết kế /48-ngay-lay-goc theo tinh thần này: xây nền bằng bài nhỏ, câu rõ và hoạt động lặp lại. Bạn không chỉ đọc giải thích, mà còn gặp từ, nghe câu, nói lại và kiểm tra nhẹ. Nếu hôm nay chỉ nhớ một câu, vẫn tốt hơn đọc mười quy tắc rồi không dùng được câu nào. Poo gọi đó là nhặt vỏ sò: mỗi ngày nhặt vài chiếc, lâu dần bạn có cả túi kiến thức.'
        ],
      },
      {
        heading: 'Một thứ tự học dễ thở cho người mất gốc',
        body: [
          'Thứ tự Poo gợi ý là: phát âm căn bản, từ vựng gần đời sống, mẫu câu đơn giản, luyện nghe câu ngắn, rồi shadowing nhẹ. Phát âm căn bản giúp bạn nhận ra âm. Từ vựng gần đời sống giúp câu có nghĩa. Mẫu câu đơn giản giúp bạn ghép ý. Luyện nghe câu ngắn giúp tai bớt lạ. Shadowing giúp miệng bắt đầu tham gia. Bạn không cần hoàn hảo từng phần mới được sang phần tiếp theo; chỉ cần mỗi phần đủ quen để nâng đỡ phần sau.',
          'Bạn có thể vào /learning-path để đi theo bản đồ chung. Nếu thấy quá khó, quay về /48-ngay-lay-goc. Nếu muốn luyện nói, ghé /shadowing. Nếu hay quên từ, dùng /words. Đừng xem việc quay lại là lùi bước. Trong học ngôn ngữ, quay lại đúng chỗ yếu là cách tiến bộ nhanh hơn. Poo cũng hay bơi vòng lại để kiểm tra dòng nước trước khi bơi xa.'
        ],
      },
      {
        heading: 'Cách học từ vựng khi đã mất nền',
        body: [
          'Người mất gốc không nên học từ vựng bằng danh sách quá dài. Hãy chọn nhóm từ có thể dùng ngay: bản thân, gia đình, công việc, thời gian, cảm xúc, đồ vật, hành động hằng ngày. Mỗi từ nên đi kèm một câu thật đơn giản. Ví dụ học “tired” thì đặt câu “I am tired today”. Học “practice” thì đặt câu “I practice every day”. Khi từ nằm trong câu, bạn nhớ cách dùng tốt hơn và dễ nhận ra từ đó khi nghe.',
          'Sau khi học, hãy ôn lại bằng nhịp ngắn. Bạn có thể lưu từ vào /words, đọc lại câu ví dụ, tự nói một câu mới hoặc tìm từ đó trong bài nghe. Việc gặp lại từ qua nhiều đường giúp não xây kết nối. Đừng tự trách nếu quên. Quên là chuyện bình thường; ôn lại mới là phần làm kiến thức chắc hơn. Poo xem mỗi lần quên như một bong bóng báo rằng từ đó cần thêm chút oxy.'
        ],
      },
      {
        heading: 'Giữ nhịp học bằng mục tiêu nhỏ',
        body: [
          'Một kế hoạch tốt cho người mất gốc nên đủ nhỏ để bạn làm được vào ngày mệt. Ví dụ: học 5 từ, nghe 3 câu, nói lại 2 câu, làm 5 câu kiểm tra nhẹ. Nếu hôm đó có nhiều thời gian, bạn học thêm. Nếu bận, chỉ cần hoàn thành gói tối thiểu. Sự đều đặn quan trọng hơn một ngày học bùng nổ. Tiếng Anh giống bơi đường dài: nhịp thở ổn định giúp bạn đi xa hơn cú quẫy thật mạnh.',
          'Hãy đánh dấu chiến thắng nhỏ. Hôm nay bạn nhớ một câu? Tốt. Bạn nghe ra một từ trong đoạn? Tốt. Bạn dám nói dù còn ngập ngừng? Rất tốt. Khi niềm tin quay lại, bạn sẽ học nhanh hơn. PooEnglish cố giữ giao diện và lời nhắc thân thiện cũng vì lý do đó: người học cần được kéo về bài học bằng cảm giác an toàn, không phải bị đẩy đi bằng áp lực.'
        ],
      },
    ],
    faqs: [
      commonFaqs.beginner,
      { question: 'Người mất gốc nên học ngữ pháp trước hay từ vựng trước?', answer: 'Nên học song song ở mức nhỏ: vài từ gần đời sống đặt trong một mẫu câu đơn giản. Đừng học ngữ pháp dài mà không dùng vào câu.' },
      { question: 'Khóa 48 ngày có phù hợp để bắt đầu không?', answer: 'Có. /48-ngay-lay-goc được thiết kế để người học xây lại nền bằng bài nhỏ, câu dùng được và nhịp ôn đều.' },
      { question: 'Có nên luyện nói khi phát âm còn yếu?', answer: 'Có. Bạn có thể luyện câu ngắn trên /shadowing. Nói sớm giúp miệng quen âm, miễn là bạn đi chậm và nghe lại nhẹ nhàng.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: 'Cách học từ vựng tiếng Anh dễ nhớ mà không cần nhồi nhét',
    description: 'Học từ vựng tiếng Anh dễ nhớ hơn khi đặt từ vào câu, ôn đúng lúc và dùng lại trong nghe nói. Poo gợi ý cách học nhẹ nhàng cho người Việt.',
    slug: 'cach-hoc-tu-vung-tieng-anh-de-nho',
    date: '2026-06-11',
    excerpt: 'Từ vựng không nên là danh sách khô khan. Khi từ có ngữ cảnh, âm thanh và cơ hội dùng lại, bạn sẽ nhớ lâu hơn.',
    readingTime: '8 phút đọc',
    keywords: ['học từ vựng tiếng Anh', 'cách nhớ từ vựng', 'từ vựng tiếng Anh'],
    sections: [
      {
        heading: 'Học ít từ hơn nhưng gặp lại nhiều hơn',
        body: [
          'Rất nhiều người bắt đầu học từ vựng bằng mục tiêu thật lớn: 30 từ mỗi ngày, 1000 từ trong một tháng, càng nhiều càng tốt. Cách này tạo cảm giác chăm chỉ, nhưng nếu từ không được gặp lại, chúng trôi đi rất nhanh. Poo khuyên bạn học ít hơn nhưng tạo nhiều lần chạm hơn. Một từ nên được nhìn, nghe, đọc trong câu, nói lại và ôn sau một khoảng thời gian. Mỗi lần gặp lại giống một lớp vỏ sò phủ thêm lên trí nhớ.',
          'Ví dụ hôm nay bạn học từ “friendly”. Đừng chỉ ghi “thân thiện”. Hãy đặt câu “Poo is friendly”, nghe câu đó, nói lại, rồi thử đổi thành “My teacher is friendly”. Ngày mai, bạn gặp lại từ trong một câu khác. Sau vài lần, từ không còn là mục trong danh sách mà trở thành một cách diễn đạt quen. Đây là lý do /words trên PooEnglish nên được dùng cùng /learning-path và /shadowing thay vì tách riêng hoàn toàn.'
        ],
      },
      {
        heading: 'Đặt từ vào câu thay vì học nghĩa đơn lẻ',
        body: [
          'Một từ tiếng Anh thường không sống một mình. Nó đi cùng giới từ, động từ, danh từ hoặc sắc thái cụ thể. Nếu chỉ học nghĩa tiếng Việt, bạn có thể biết từ nhưng dùng hơi lạ. Học “make” là “làm” chưa đủ, vì “make a decision”, “make a mistake”, “make friends” mỗi cụm lại có cảm giác riêng. Khi học theo câu, bạn thấy từ đang làm việc ra sao. Câu chính là chiếc vỏ giúp từ không bị trôi giữa biển thông tin.',
          'Người mới không cần đặt câu phức tạp. Câu càng gần đời sống càng tốt: “I make breakfast”, “I feel happy”, “I need water”. Sau đó bạn thay một phần câu để tạo biến thể. Cách này giúp từ vựng nối với ngữ pháp nhẹ nhàng. Bạn không cần học thuật ngữ nhiều, nhưng vẫn hiểu vị trí của từ trong câu. Dần dần, khi gặp đoạn nghe hoặc bài đọc, bạn nhận ra cụm quen nhanh hơn.'
        ],
      },
      {
        heading: 'Kết hợp âm thanh để nhớ từ bền hơn',
        body: [
          'Từ vựng không chỉ là mặt chữ. Nếu bạn biết chữ nhưng không nhận ra âm, kỹ năng nghe sẽ bị kẹt. Vì vậy mỗi từ nên có một lần được nghe và nói. Bạn có thể nghe câu mẫu, nhắc lại chậm, rồi thử nói trong câu của mình. Shadowing là cách rất tốt để đưa từ vào âm thanh thật. Khi luyện /shadowing, bạn không chỉ tập phát âm mà còn gặp lại từ trong nhịp câu. Tai và miệng cùng tham gia khiến trí nhớ có thêm đường bám.',
          'Nếu một từ khó phát âm, hãy tách nhỏ. Nghe chậm, đánh dấu âm đầu, âm cuối, trọng âm. Đừng ép mình nói nhanh. Một từ được nói rõ ở tốc độ chậm có giá trị hơn một từ bị nuốt mất ở tốc độ nhanh. Poo thích bạn luyện như thổi bong bóng: nhẹ, đều, vui một chút. Khi âm đã quen, tốc độ sẽ tự nhiên tăng lên.'
        ],
      },
      {
        heading: 'Ôn từ theo khoảng cách và theo cảm giác yếu',
        body: [
          'Ôn tập không phải là học lại mọi thứ từ đầu. Bạn nên ưu tiên từ hay quên, từ xuất hiện trong bài học gần đây và từ cần cho mục tiêu hiện tại. Nếu đang luyện giới thiệu bản thân, ôn các từ về tên, tuổi, công việc, sở thích. Nếu đang học đi mua đồ, ôn số lượng, giá tiền, câu hỏi lịch sự. Việc ôn theo ngữ cảnh giúp từ có lý do để quay lại. Não thích thông tin có chỗ dùng hơn thông tin rời rạc.',
          'Bạn có thể dùng /words như một chiếc túi vỏ sò. Từ nào chưa chắc thì giữ lại để xem thêm. Từ nào đã quen thì đưa vào câu mới. Sau vài ngày, mở lại túi và tự hỏi: mình có thể dùng từ này trong một câu không? Nếu có, hãy thử nói. Nếu chưa, nghe lại ví dụ. Cách ôn này nhẹ nhưng hiệu quả vì nó tập trung vào khả năng dùng từ, không chỉ nhận mặt từ.'
        ],
      },
      {
        heading: 'Đừng biến từ vựng thành áp lực',
        body: [
          'Có những ngày bạn quên một từ rất quen. Điều đó không có nghĩa là bạn kém. Trí nhớ hoạt động theo nhịp lên xuống, nhất là khi bạn bận hoặc mệt. Thay vì tự trách, hãy xem đó là tín hiệu để ôn lại. PooEnglish cố giữ tinh thần học từ vựng dễ thương vì cảm xúc ảnh hưởng nhiều đến khả năng quay lại. Khi bạn thấy việc ôn từ không đáng sợ, bạn sẽ mở bài thường xuyên hơn.',
          'Một mục tiêu nhỏ có thể là: mỗi ngày học 5 từ, mỗi từ một câu, cuối buổi nói lại 3 câu. Nếu có thời gian, vào /learning-path để học tiếp bài theo lộ trình, hoặc ghé /48-ngay-lay-goc để củng cố nền. Khi từ vựng được nối với lộ trình, nghe và nói, bạn không còn cảm giác mình đang nhồi một danh sách dài. Bạn đang xây từng viên đá nhỏ cho cây cầu giao tiếp.'
        ],
      },
    ],
    faqs: [
      { question: 'Mỗi ngày nên học bao nhiêu từ vựng?', answer: 'Người mới có thể bắt đầu với 5 đến 10 từ kèm câu ví dụ. Học ít nhưng ôn lại đều thường hiệu quả hơn học quá nhiều.' },
      { question: 'Có nên học từ vựng theo chủ đề không?', answer: 'Có. Chủ đề giúp não nhóm thông tin, nhưng bạn vẫn nên đặt từ vào câu để hiểu cách dùng.' },
      { question: 'Làm sao để nhớ phát âm của từ?', answer: 'Hãy nghe câu mẫu, nói lại chậm và luyện từ trong hoạt động shadowing. Âm thanh giúp từ bám tốt hơn mặt chữ đơn lẻ.' },
      { question: 'PooEnglish có khu vực ôn từ không?', answer: 'Có. Bạn có thể vào /words để học và ôn từ, sau đó quay lại /learning-path hoặc /shadowing để dùng từ trong bài.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: 'Lộ trình học tiếng Anh mỗi ngày: bơi chậm nhưng đều cùng Poo',
    description: 'Một lộ trình học tiếng Anh mỗi ngày nên có từ vựng, nghe, nói, ôn tập và mục tiêu nhỏ. Poo gợi ý cách học đều mà không quá áp lực.',
    slug: 'lo-trinh-hoc-tieng-anh-moi-ngay',
    date: '2026-06-11',
    excerpt: 'Bạn không cần học thật nhiều mỗi ngày. Một lộ trình nhỏ, rõ và lặp lại đều sẽ giúp tiếng Anh trở thành thói quen dễ giữ hơn.',
    readingTime: '8 phút đọc',
    keywords: ['lộ trình học tiếng Anh', 'học tiếng Anh mỗi ngày', 'tự học tiếng Anh'],
    sections: [
      {
        heading: 'Lộ trình tốt bắt đầu từ việc biết hôm nay học gì',
        body: [
          'Một trong những lý do khiến người học bỏ cuộc là mỗi ngày đều phải tự quyết định học gì. Hôm nay xem video nào, học từ nào, luyện nghe ở đâu, ôn bài cũ ra sao. Việc lựa chọn quá nhiều làm não mệt trước khi học. Một lộ trình tốt nên trả lời giúp bạn câu hỏi đầu tiên: hôm nay mình làm bước nào? Khi bước tiếp theo rõ ràng, bạn chỉ cần mở bài và bắt đầu. PooEnglish tạo /learning-path theo tinh thần đó: chia hành trình thành các chặng nhỏ, dễ quay lại.',
          'Lộ trình không cần cứng như một chiếc hộp. Nó nên giống bản đồ bơi: có hướng chính, có điểm dừng, có nơi quay lại khi sóng mạnh. Nếu bạn yếu nghe, có thể ghé /shadowing nhiều hơn. Nếu quên từ, mở /words. Nếu nền chưa chắc, quay về /48-ngay-lay-goc. Điều quan trọng là bạn không học lan man đến mức mất cảm giác tiến bộ.'
        ],
      },
      {
        heading: 'Một buổi học 20 phút nên có gì?',
        body: [
          'Poo gợi ý một buổi học 20 phút gồm năm phần. Ba phút đầu ôn lại bài cũ: nhìn vài từ hoặc câu đã học. Năm phút tiếp theo học nội dung mới: một nhóm từ hoặc một mẫu câu. Năm phút luyện nghe: nghe câu ngắn, nhận ra từ khóa. Năm phút luyện nói: nói lại câu hoặc shadowing một đoạn nhỏ. Hai phút cuối ghi nhận phần cần ôn. Công thức này không phải luật bắt buộc, nhưng giúp buổi học cân bằng hơn.',
          'Nếu chỉ có 10 phút, hãy rút gọn: ôn 2 câu, học 3 từ, nói lại 2 câu. Nếu có 30 phút, thêm bài kiểm tra nhẹ hoặc đọc đoạn ngắn. Điểm chính là mỗi buổi nên có một chút gặp lại, một chút mới, một chút dùng. Học tiếng Anh bền không nằm ở cảm giác hôm nay học thật hoành tráng, mà ở việc ngày mai bạn vẫn còn năng lượng để quay lại.'
        ],
      },
      {
        heading: 'Xếp thứ tự kỹ năng để không bị rời rạc',
        body: [
          'Từ vựng, ngữ pháp, nghe và nói không nên là bốn hòn đảo riêng. Một từ mới nên đi vào câu. Một câu nên được nghe. Một câu nghe được nên được nói lại. Một lỗi sai nên trở thành phần ôn. Khi các kỹ năng nối với nhau, bạn học ít hơn nhưng hiểu sâu hơn. Ví dụ học mẫu “I want to…”, bạn có thể thêm từ vựng “practice”, nghe câu “I want to practice English”, rồi shadowing câu đó. Như vậy một mảnh kiến thức được dùng qua nhiều cửa.',
          'Đây cũng là cách PooEnglish thiết kế các vùng học liên quan. /learning-path cho bản đồ, /words giữ từ và câu cần nhớ, /shadowing giúp luyện nghe nói, /48-ngay-lay-goc củng cố nền. Bạn có thể xem chúng như bốn chiếc phao. Khi một phao hơi xa, hãy bám vào phao gần hơn rồi bơi tiếp.'
        ],
      },
      {
        heading: 'Đặt mục tiêu nhỏ để dễ duy trì',
        body: [
          'Mục tiêu “giỏi tiếng Anh” quá rộng, nên não khó biết hôm nay cần làm gì. Hãy đổi thành mục tiêu nhỏ: hoàn thành một bài trong lộ trình, nói lại ba câu, ôn năm từ, nghe hiểu một đoạn ngắn. Mục tiêu nhỏ tạo kết thúc rõ ràng. Khi hoàn thành, bạn nhận được cảm giác tích cực, giống Poo vẫy đuôi khen một nhịp bơi đẹp. Cảm giác ấy giúp bạn quay lại tốt hơn vào hôm sau.',
          'Bạn cũng nên có mục tiêu tối thiểu cho ngày bận. Ví dụ “dù bận vẫn mở PooEnglish 5 phút và ôn 3 câu”. Mục tiêu tối thiểu giữ thói quen không bị đứt. Khi ngày mai rảnh hơn, bạn học tiếp. Tính linh hoạt này quan trọng hơn một kế hoạch hoàn hảo nhưng chỉ sống được vài ngày.'
        ],
      },
      {
        heading: 'Theo dõi tiến bộ bằng dấu hiệu thật',
        body: [
          'Tiến bộ không chỉ là điểm số. Bạn có thể theo dõi bằng những dấu hiệu mềm hơn: nghe ra từ từng không nghe được, nói một câu ít ngập ngừng hơn, nhớ lại từ sau một ngày, hiểu một mẫu câu trong bài mới. Những dấu hiệu này nhỏ nhưng rất thật. Nếu chỉ nhìn mục tiêu xa, bạn dễ thấy mình chưa đủ. Nếu nhìn từng dấu hiệu gần, bạn sẽ thấy mình đang bơi.',
          'Hãy quay lại lộ trình mỗi tuần và tự hỏi: phần nào dễ hơn, phần nào còn đục nước? Nếu từ vựng yếu, dành thêm thời gian cho /words. Nếu nói yếu, luyện /shadowing. Nếu nền rỗng, đi một chặng /48-ngay-lay-goc. Lộ trình tốt không ép bạn đi thẳng bằng mọi giá; nó giúp bạn điều chỉnh để tiếp tục.'
        ],
      },
    ],
    faqs: [
      commonFaqs.daily,
      { question: 'Nên học đủ bốn kỹ năng mỗi ngày không?', answer: 'Không bắt buộc, nhưng nên có sự kết nối giữa từ, câu, nghe và nói trong tuần. Mỗi buổi học có thể ngắn nhưng nên có phần dùng lại.' },
      { question: 'Lộ trình trên PooEnglish bắt đầu ở đâu?', answer: 'Bạn có thể vào /learning-path để xem bản đồ học, hoặc /48-ngay-lay-goc nếu muốn xây nền thật chậm và chắc.' },
      { question: 'Nếu bỏ lỡ vài ngày thì sao?', answer: 'Không sao. Hãy quay lại bằng một bài ôn ngắn thay vì tự trách. Poo chỉ cần bạn tiếp tục bơi.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: 'Luyện nghe tiếng Anh cho người mới: nghe chậm để hiểu chắc hơn',
    description: 'Người mới luyện nghe tiếng Anh nên bắt đầu bằng câu ngắn, từ quen và nhịp lặp lại. Poo hướng dẫn cách nghe nhẹ nhàng, không bị trôi.',
    slug: 'luyen-nghe-tieng-anh-cho-nguoi-moi',
    date: '2026-06-11',
    excerpt: 'Luyện nghe không phải cứ bật video dài là tốt. Người mới cần đoạn ngắn, mục tiêu rõ và cơ hội nghe lại để tai quen dần.',
    readingTime: '8 phút đọc',
    keywords: ['luyện nghe tiếng Anh', 'nghe tiếng Anh cho người mới', 'học nghe tiếng Anh'],
    sections: [
      {
        heading: 'Vì sao người mới nghe mãi vẫn không hiểu?',
        body: [
          'Khi mới học, tai bạn chưa quen âm tiếng Anh, não chưa nhận ra từ trong tốc độ tự nhiên, và nhiều cụm âm bị nối lại. Vì vậy dù bạn đã học mặt chữ, lúc nghe vẫn có cảm giác mọi thứ trôi qua như sóng nhanh. Điều này bình thường. Không phải bạn không có năng khiếu, mà là tai cần thời gian để tạo bản đồ âm thanh. Poo khuyên đừng bắt đầu bằng đoạn quá dài. Hãy chọn câu ngắn, nội dung quen, có chữ hỗ trợ nếu cần.',
          'Một lý do khác là bạn chưa có đủ từ vựng nền. Tai khó nhận ra âm của một từ mà não chưa biết hoặc biết chưa chắc. Vì vậy luyện nghe nên đi cùng /words và /learning-path. Học vài từ chính trước, nghe câu chứa từ đó, rồi nói lại. Khi từ có mặt chữ, nghĩa, âm và câu ví dụ, tai sẽ dễ bắt hơn. Nghe hiểu là kết quả của nhiều mảnh nhỏ phối hợp, không phải phép màu sau một đêm.'
        ],
      },
      {
        heading: 'Nghe chủ động khác nghe thụ động thế nào?',
        body: [
          'Nghe thụ động là bật âm thanh trong nền và hy vọng tai tự quen. Cách này có thể tạo môi trường, nhưng với người mới, nghe chủ động thường cần hơn. Nghe chủ động nghĩa là bạn có nhiệm vụ rõ: tìm từ khóa, hiểu ý chính, nhận ra một mẫu câu, hoặc chuẩn bị nói lại. Khi có nhiệm vụ, não tập trung hơn. Bạn không cần hiểu mọi từ. Chỉ cần hoàn thành nhiệm vụ nhỏ là buổi nghe đã có giá trị.',
          'Ví dụ với một đoạn ba câu, lần nghe đầu chỉ hỏi: người nói đang nói về việc gì? Lần hai tìm hai từ quen. Lần ba nhìn chữ và kiểm tra. Lần bốn nói lại một câu. Quy trình này biến đoạn nghe thành bài tập có bậc thang. Poo không thả bạn vào biển sâu rồi bảo “cố lên”; Poo đặt những chiếc phao nhỏ để bạn bơi qua từng đoạn.'
        ],
      },
      {
        heading: 'Quy trình luyện nghe 5 bước cho người mới',
        body: [
          'Bước một, chọn đoạn ngắn từ 20 đến 40 giây. Bước hai, đọc nhanh vài từ khóa để não có điểm bám. Bước ba, nghe không nhìn chữ và đoán ý chính. Bước bốn, nghe lại với chữ để nối âm với mặt chữ. Bước năm, chọn một câu để shadowing. Bạn có thể lặp quy trình này mỗi ngày với đoạn khác nhau. Đừng vội tăng độ khó khi bạn còn thấy mơ hồ. Nghe chắc đoạn ngắn sẽ tạo nền tốt hơn nghe lướt nhiều đoạn dài.',
          'Sau khi nghe, hãy ghi lại câu hữu ích vào /words hoặc quay về /learning-path để tiếp tục bài theo lộ trình. Nếu đoạn nghe có câu rất hay, mang sang /shadowing để nói lại. Nếu bạn mất gốc và chưa đủ từ nền, /48-ngay-lay-goc sẽ giúp chuẩn bị những mẫu câu đầu tiên. Luyện nghe hiệu quả nhất khi nó không cô đơn, mà nối với từ vựng và nói.'
        ],
      },
      {
        heading: 'Có nên nhìn transcript khi luyện nghe?',
        body: [
          'Người mới có thể nhìn chữ, nhưng nên dùng đúng lúc. Nếu nhìn chữ ngay từ đầu, bạn có thể biến bài nghe thành bài đọc. Nếu không bao giờ nhìn chữ, bạn có thể mắc kẹt ở âm không nhận ra. Poo gợi ý nghe không nhìn trước để tai thử bắt ý, sau đó nhìn chữ để kiểm tra, rồi nghe lại không nhìn. Cách này giúp bạn vừa rèn tai, vừa nối âm với từ. Chữ là phao hỗ trợ, không phải chiếc thuyền để mình ngồi mãi.',
          'Khi nhìn chữ, hãy chú ý chỗ âm bị nối hoặc bị giảm. Ví dụ “want to” có thể nghe như một cụm liền. Những chi tiết này giải thích vì sao câu nhìn rất dễ nhưng nghe lại khó. Bạn không cần học thuật ngữ nhiều, chỉ cần nhận ra rằng tiếng Anh khi nói có nhịp riêng. Shadowing vài câu sau khi nhìn chữ sẽ giúp miệng và tai cùng hiểu nhịp đó.'
        ],
      },
      {
        heading: 'Lịch luyện nghe nhẹ cho một tuần',
        body: [
          'Thứ hai đến thứ sáu, mỗi ngày chọn một đoạn ngắn. Ngày đầu nghe ý chính. Ngày hai tập tìm từ khóa. Ngày ba nghe và chép một câu. Ngày bốn shadowing câu đó. Ngày năm ôn lại các câu trong tuần. Cuối tuần, mở /learning-path hoặc /48-ngay-lay-goc để học thêm bài nền, rồi lưu từ hay quên vào /words. Lịch này không nặng, nhưng tạo nhiều lần gặp lại cùng một kiểu câu.',
          'Nếu bạn có ngày bận, chỉ cần nghe một câu và nói lại một lần. Đừng để một ngày ít thời gian biến thành lý do bỏ cả tuần. Tai cần sự đều đặn hơn sự kịch tính. Mỗi lần nghe lại là một làn sóng nhỏ mài mềm tảng đá lạ lẫm. Poo sẽ ở đó, nhắc bạn rằng nghe chưa ra hôm nay không có nghĩa ngày mai cũng vậy.'
        ],
      },
    ],
    faqs: [
      { question: 'Người mới nên nghe tài liệu dài bao nhiêu?', answer: 'Nên bắt đầu với đoạn 20 đến 40 giây hoặc vài câu ngắn. Khi đã quen, bạn tăng dần độ dài và tốc độ.' },
      { question: 'Có nên nghe đi nghe lại một đoạn không?', answer: 'Có. Nghe lại giúp tai nhận ra chi tiết bị bỏ lỡ. Mỗi lần nghe nên có mục tiêu nhỏ khác nhau.' },
      { question: 'Luyện nghe có cần học từ vựng trước không?', answer: 'Nên học vài từ khóa trước. Từ vựng nền giúp tai có điểm bám và giảm cảm giác đoạn nghe bị trôi.' },
      { question: 'Shadowing có giúp luyện nghe không?', answer: 'Có. Khi bạn nói lại câu đã nghe, tai chú ý hơn đến nhịp, âm nối và trọng âm.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: 'Vì sao học tiếng Anh mãi không nói được? Cách gỡ từng nút nhỏ',
    description: 'Bạn học tiếng Anh lâu nhưng vẫn ngại nói? Poo phân tích nguyên nhân và gợi ý cách luyện phản xạ bằng câu ngắn, shadowing và thói quen dùng lại.',
    slug: 'vi-sao-hoc-tieng-anh-mai-khong-noi-duoc',
    date: '2026-06-11',
    excerpt: 'Không nói được không phải vì bạn lười. Có thể bạn đang học quá nhiều đầu vào nhưng thiếu cơ hội nói câu nhỏ, sửa nhẹ và lặp lại.',
    readingTime: '9 phút đọc',
    keywords: ['học tiếng Anh không nói được', 'luyện nói tiếng Anh', 'phản xạ tiếng Anh'],
    sections: [
      {
        heading: 'Biết nhiều chưa chắc đã nói được',
        body: [
          'Nhiều người học tiếng Anh nhiều năm, làm bài ngữ pháp ổn, đọc hiểu được một phần, nhưng khi cần nói thì miệng cứng lại. Điều này xảy ra vì kiến thức nhận biết và kỹ năng sử dụng là hai việc khác nhau. Bạn có thể nhận ra một từ khi nhìn thấy, nhưng chưa chắc gọi được từ đó khi cần nói. Bạn có thể hiểu một mẫu câu, nhưng chưa từng luyện bật nó ra trong thời gian ngắn. Nói là kỹ năng cần luyện bằng miệng, tai và tình huống.',
          'Poo hay ví điều này như biết bản đồ bơi nhưng chưa xuống nước. Bạn có thể đọc về cách quẫy tay, nhưng cơ thể vẫn cần tập. Vì vậy nếu học mãi chưa nói được, đừng vội kết luận mình kém. Hãy hỏi: mình đã có đủ lần nói câu nhỏ chưa? Mình có luyện lại câu đã học không? Mình có môi trường an toàn để sai và sửa không?'
        ],
      },
      {
        heading: 'Nỗi sợ sai làm phản xạ bị khóa',
        body: [
          'Một nguyên nhân lớn là sợ sai. Bạn muốn câu phải đúng thì, đúng phát âm, đúng từ, đúng ngữ điệu rồi mới nói. Nhưng khi kiểm tra quá nhiều thứ trong đầu, câu không kịp đi ra. Người mới cần một vùng luyện tập nơi sai được xem là tín hiệu, không phải thất bại. PooEnglish cố giữ phản hồi mềm vì nếu người học thấy an toàn, họ sẽ thử nhiều hơn. Thử nhiều hơn thì mới có dữ liệu để chỉnh.',
          'Hãy bắt đầu bằng câu ngắn. Thay vì cố kể một câu chuyện dài, hãy nói “I am tired”, “I want to learn”, “Can I try again?”. Khi câu ngắn đã quen, thêm một mảnh nhỏ: “I am tired today”, “I want to learn English with Poo”. Việc mở rộng từng chút giúp não thấy nói tiếng Anh là việc có thể kiểm soát. Bạn không cần nhảy ngay xuống vùng nước sâu.'
        ],
      },
      {
        heading: 'Thiếu đầu ra lặp lại',
        body: [
          'Rất nhiều kế hoạch học tập có quá nhiều xem, đọc, ghi chép, nhưng rất ít nói. Bạn xem một video, hiểu bài, rồi chuyển sang video khác. Não nhận nhiều đầu vào nhưng không được yêu cầu tạo câu. Để nói tốt hơn, mỗi bài học nên có bước đầu ra nhỏ: đọc thành tiếng, trả lời câu hỏi, shadowing, tự đặt câu, hoặc nói lại ý chính bằng câu đơn giản. Đầu ra là nơi kiến thức chuyển từ “mình biết” sang “mình dùng được”.',
          'Bạn có thể dùng /shadowing để nói theo câu mẫu, /words để lấy từ đặt câu, /learning-path để đi theo bài có thứ tự và /48-ngay-lay-goc để quay lại mẫu căn bản. Mỗi ngày chỉ cần vài câu đầu ra cũng tạo khác biệt. Miệng cần được tập như một cơ bắp. Nếu cả tuần không nói câu nào, đến lúc cần nói tự nhiên bạn sẽ thấy cứng.'
        ],
      },
      {
        heading: 'Dịch trong đầu quá lâu',
        body: [
          'Khi nói, nhiều bạn nghĩ tiếng Việt trước, rồi dịch từng chữ sang tiếng Anh. Cách này làm phản xạ chậm và dễ tạo câu lạ. Một cách gỡ là học theo cụm câu sẵn dùng. Ví dụ thay vì dịch “tôi muốn…”, hãy có sẵn khung “I want to…”. Thay vì dịch “tôi cần…”, có khung “I need…”. Khi khung câu quen, bạn chỉ thay từ chính. Đây là lý do học câu ngắn và shadowing rất hữu ích.',
          'Bạn cũng có thể tập trả lời câu hỏi bằng mẫu cố định. “How are you?” → “I am fine”, “I am a little tired”, “I am happy today”. Ban đầu câu có thể đơn giản, nhưng phản xạ sẽ nhanh hơn. Sau đó bạn thêm chi tiết. Poo không chê câu đơn giản; câu đơn giản là chiếc phao đầu tiên để bạn không chìm trong lúc nói.'
        ],
      },
      {
        heading: 'Cách luyện nói trong 15 phút mỗi ngày',
        body: [
          'Ba phút đầu, ôn 3 câu cũ. Năm phút tiếp theo, shadowing 3 câu mới trong /shadowing. Bốn phút sau, thay từ để tạo câu của bạn. Ví dụ câu mẫu “I want to practice” có thể đổi thành “I want to read”, “I want to sleep”, “I want to learn English”. Ba phút cuối, nói lại không nhìn chữ và ghi một câu còn khó vào /words. Với lịch này, bạn vừa nghe, vừa nói, vừa dùng lại từ.',
          'Nếu bạn mất gốc, hãy đi chậm hơn với /48-ngay-lay-goc. Nếu bạn cần bản đồ dài hạn, mở /learning-path. Điều quan trọng là ngày nào cũng có một khoảnh khắc miệng được tham gia. Nói tiếng Anh không tự xuất hiện chỉ vì mình đọc nhiều. Nó lớn lên từ những câu nhỏ được nói đi nói lại trong cảm giác đủ an toàn.'
        ],
      },
    ],
    faqs: [
      { question: 'Học lâu mà không nói được có phải mất gốc không?', answer: 'Không hẳn. Có thể bạn có đầu vào nhưng thiếu luyện đầu ra. Hãy bắt đầu nói câu ngắn và lặp lại đều.' },
      { question: 'Nên luyện nói một mình hay với người khác?', answer: 'Cả hai đều tốt. Người mới có thể luyện một mình bằng shadowing trước để bớt ngại, sau đó tìm cơ hội nói với người khác.' },
      { question: 'Có cần học nhiều ngữ pháp mới nói được không?', answer: 'Không cần học hết. Bạn có thể dùng vài mẫu câu căn bản thật chắc rồi mở rộng dần.' },
      { question: 'PooEnglish giúp luyện nói ở đâu?', answer: 'Bạn có thể bắt đầu tại /shadowing, kết hợp /words để lấy từ và /learning-path để học theo thứ tự.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: 'Cách luyện phát âm bằng shadowing: nghe rõ, nói chậm, sửa nhẹ',
    description: 'Luyện phát âm bằng shadowing hiệu quả hơn khi chọn câu ngắn, nghe kỹ trọng âm và nói lại nhiều vòng. Poo hướng dẫn cách luyện không căng thẳng.',
    slug: 'cach-luyen-phat-am-bang-shadowing',
    date: '2026-06-11',
    excerpt: 'Shadowing không chỉ giúp phản xạ nói, mà còn giúp bạn nhận ra âm, trọng âm và nhịp câu nếu luyện đủ chậm và có mục tiêu rõ.',
    readingTime: '8 phút đọc',
    keywords: ['luyện phát âm tiếng Anh', 'shadowing phát âm', 'cách phát âm tiếng Anh'],
    sections: [
      {
        heading: 'Phát âm không chỉ là từng âm riêng lẻ',
        body: [
          'Khi nghĩ đến phát âm, nhiều người chỉ tập từng âm như /θ/ hay /r/. Điều đó hữu ích, nhưng trong giao tiếp, âm còn nằm trong nhịp câu. Một từ có thể nghe khác khi đứng cạnh từ khác. Trọng âm làm câu có điểm nhấn. Ngữ điệu làm câu nghe thân thiện hoặc chắc chắn hơn. Shadowing giúp bạn luyện phát âm trong câu thật, nơi các âm gặp nhau và tạo thành dòng chảy. Poo thích cách này vì nó tự nhiên hơn việc chỉ đọc bảng âm khô khan.',
          'Bạn không cần bỏ qua luyện âm riêng. Nếu một âm quá khó, hãy tách ra tập chậm. Nhưng sau đó nên đưa âm ấy về câu. Ví dụ luyện âm cuối trong “like”, rồi nói “I like it”. Khi âm nằm trong câu, bạn học cách giữ nó khi nói thật. Đây là điểm nhiều người bỏ sót: phát âm đúng trong một từ chưa chắc đã giữ được khi câu dài hơn.'
        ],
      },
      {
        heading: 'Chọn câu shadowing phù hợp để sửa phát âm',
        body: [
          'Câu luyện phát âm nên ngắn, rõ và có một mục tiêu âm thanh. Nếu muốn tập âm cuối, chọn câu có âm cuối dễ nghe. Nếu muốn tập trọng âm, chọn câu có từ quan trọng rõ. Nếu muốn tập nối âm, chọn câu có cụm như “want to”, “look at”, “a lot of”. Đừng chọn đoạn quá dài khiến bạn phải lo quá nhiều thứ cùng lúc. Một buổi chỉ cần một mục tiêu nhỏ. Poo gọi đó là soi một chiếc vỏ sò thay vì cố nhìn cả bãi biển.',
          'Trên /shadowing, bạn có thể luyện từng câu và quay lại câu khó. Sau khi luyện, lưu từ hoặc cụm hay nhầm vào /words. Nếu phát hiện nền từ vựng còn yếu, quay về /learning-path hoặc /48-ngay-lay-goc để học lại câu căn bản. Phát âm tốt hơn khi bạn hiểu mình đang nói gì. Bắt chước âm mà không hiểu nghĩa dễ làm bài luyện trở nên máy móc.'
        ],
      },
      {
        heading: 'Quy trình nghe kỹ trước khi nói',
        body: [
          'Trước khi nói theo, hãy nghe câu mẫu ít nhất hai lần. Lần đầu nghe ý nghĩa. Lần hai nghe âm thanh: từ nào được nhấn, chỗ nào nối, âm cuối có bật không. Sau đó nói lại chậm hơn bản gốc. Nếu nói chậm mà rõ, bạn đang xây nền tốt. Khi đã quen, tăng tốc một chút. Đừng bắt đầu bằng tốc độ nhanh vì miệng sẽ dễ nuốt âm và bạn không biết mình sai ở đâu.',
          'Bạn có thể tự ghi âm ngắn để nghe lại, nhưng hãy nghe với thái độ tử tế. Đừng hỏi “giọng mình tệ quá không”, hãy hỏi “mình đã nói rõ hơn điểm nào?”. Có thể hôm nay bạn giữ được âm cuối của một từ, hoặc nhấn đúng một từ quan trọng. Những tiến bộ nhỏ đó đáng ghi nhận. Poo luôn ưu tiên sửa nhẹ vì phát âm cần thời gian và sự kiên nhẫn.'
        ],
      },
      {
        heading: 'Ba điều cần chú ý: âm cuối, trọng âm, ngữ điệu',
        body: [
          'Âm cuối quan trọng vì nó giúp người nghe phân biệt từ và ý. Người Việt thường bỏ âm cuối khi nói nhanh, nên shadowing chậm có thể giúp bạn giữ âm tốt hơn. Trọng âm giúp câu có xương sống. Không phải từ nào cũng nhấn như nhau; từ mang ý chính thường nổi hơn. Ngữ điệu làm câu có cảm xúc. Một câu hỏi, một lời mời, một lời khích lệ sẽ có đường lên xuống khác nhau. Bạn không cần học tất cả thuật ngữ ngay, chỉ cần nghe và bắt chước có chủ đích.',
          'Mỗi tuần chọn một trọng tâm. Tuần này giữ âm cuối. Tuần sau nghe trọng âm. Tuần sau nữa tập ngữ điệu câu hỏi. Cách chia nhỏ giúp bạn không bị quá tải. Nếu cố sửa mọi thứ cùng lúc, bạn dễ căng và nói mất tự nhiên. Poo thích bạn sửa như lau kính: mỗi lần lau một vùng, dần dần cửa sổ phát âm sẽ trong hơn.'
        ],
      },
      {
        heading: 'Luyện phát âm nhưng vẫn phải hiểu và dùng được',
        body: [
          'Mục tiêu cuối cùng của phát âm là giao tiếp rõ hơn, không phải trình diễn hoàn hảo. Vì vậy sau khi shadowing một câu, hãy tự dùng câu đó trong tình huống của mình. Nếu câu mẫu là “I need a little time”, bạn có thể nói “I need a little help” hoặc “I need a little water”. Khi thay từ, bạn vừa luyện phát âm, vừa luyện phản xạ. Câu không còn là âm thanh mượn tạm mà trở thành công cụ của bạn.',
          'Hãy kết hợp /shadowing với /words để lưu cụm câu, /learning-path để học tiếp theo lộ trình và /48-ngay-lay-goc nếu cần nền câu căn bản. Phát âm tiến bộ tốt nhất khi được đặt trong hành trình rộng hơn: biết từ, hiểu câu, nghe được, nói lại và dùng được. Poo sẽ không bắt bạn nói như ai khác; Poo chỉ muốn người nghe hiểu bạn rõ hơn từng ngày.'
        ],
      },
    ],
    faqs: [
      { question: 'Shadowing có sửa phát âm được không?', answer: 'Có. Shadowing giúp bạn nghe và nói theo nhịp câu thật, từ đó nhận ra âm cuối, trọng âm và ngữ điệu tốt hơn.' },
      { question: 'Có cần ghi âm khi luyện phát âm không?', answer: 'Nên ghi âm ngắn nếu bạn thoải mái. Nghe lại giúp phát hiện điểm cần sửa, nhưng hãy nghe với thái độ nhẹ nhàng.' },
      { question: 'Nên nói nhanh hay chậm khi shadowing?', answer: 'Người mới nên nói chậm hơn bản gốc để rõ âm. Khi đã quen, tăng tốc dần.' },
      { question: 'Phát âm chưa tốt có nên học /48-ngay-lay-goc không?', answer: 'Có. Nền từ vựng và mẫu câu trong /48-ngay-lay-goc giúp bạn hiểu câu trước khi luyện phát âm sâu hơn.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: 'Học tiếng Anh qua câu ngắn hằng ngày: nhỏ thôi nhưng rất bền',
    description: 'Học tiếng Anh qua câu ngắn giúp người mới dễ nhớ, dễ nói và dễ dùng lại. Poo gợi ý cách biến câu hằng ngày thành thói quen học nhẹ nhàng.',
    slug: 'hoc-tieng-anh-qua-cau-ngan-hang-ngay',
    date: '2026-06-11',
    excerpt: 'Một câu ngắn mỗi ngày có thể trở thành hạt giống cho từ vựng, ngữ pháp, nghe và nói nếu bạn biết cách dùng lại.',
    readingTime: '8 phút đọc',
    keywords: ['học tiếng Anh qua câu', 'câu tiếng Anh hằng ngày', 'học tiếng Anh dễ nhớ'],
    sections: [
      {
        heading: 'Vì sao câu ngắn phù hợp với người mới?',
        body: [
          'Câu ngắn giúp người học bớt sợ. Khi nhìn một đoạn dài, bạn dễ thấy mình không đủ từ vựng hoặc ngữ pháp. Nhưng một câu như “I am ready” hay “I need help” thì dễ bước vào hơn. Câu ngắn vẫn có đủ thành phần để bạn học: từ vựng, trật tự câu, phát âm và tình huống dùng. Nó giống một hồ nước nhỏ nơi Poo dẫn bạn tập bơi trước khi ra biển lớn.',
          'Câu ngắn cũng dễ lặp lại. Bạn có thể đọc, nghe, nói, thay từ và dùng trong ngày. Một câu “I want to learn” có thể biến thành “I want to sleep”, “I want to practice”, “I want to try again”. Chỉ một khung câu đã mở ra nhiều câu mới. Đây là cách học rất thân thiện với người bận hoặc người từng học nhiều nhưng thiếu phản xạ.'
        ],
      },
      {
        heading: 'Một câu có thể dạy nhiều thứ',
        body: [
          'Lấy câu “I am learning English today”. Bạn có từ “learning”, có cấu trúc “I am…”, có mốc thời gian “today”, có phát âm âm cuối, có ngữ điệu câu kể. Nếu nghe câu đó, bạn luyện tai. Nếu nói theo, bạn luyện miệng. Nếu thay “English” bằng “new words”, bạn luyện biến đổi. Một câu nhỏ vì thế có thể trở thành trung tâm của cả buổi học.',
          'PooEnglish cố nối câu ngắn với các vùng học. Bạn có thể gặp câu trong /learning-path, lưu từ vào /words, nói lại trong /shadowing, hoặc dùng câu tương tự khi học /48-ngay-lay-goc. Khi một câu xuất hiện ở nhiều hoạt động, não hiểu rằng câu này quan trọng và đáng giữ lại. Sự lặp lại có ý nghĩa giúp bạn nhớ bền hơn.'
        ],
      },
      {
        heading: 'Cách học một câu trong 5 bước',
        body: [
          'Bước một, đọc câu và hiểu nghĩa chung. Bước hai, gạch từ hoặc cụm quan trọng. Bước ba, nghe câu mẫu nếu có. Bước bốn, nói lại chậm và rõ. Bước năm, thay một phần câu để tạo câu của bạn. Ví dụ “I need water” có thể thành “I need time”, “I need help”, “I need a break”. Việc thay từ giúp bạn không học vẹt. Bạn đang dùng khung câu để nói điều của mình.',
          'Sau đó, hãy quay lại câu vào ngày hôm sau. Nếu còn nhớ, thử nói không nhìn. Nếu quên, đọc lại và mỉm cười, vì quên là lời nhắc ôn, không phải điểm trừ. Bạn có thể giữ câu cần ôn trong /words. Khi đã quen vài câu, mở /shadowing để nghe chúng trong nhịp nói tự nhiên hơn. Câu ngắn là hạt giống; lặp lại là nước tưới.'
        ],
      },
      {
        heading: 'Chọn câu theo đời sống của bạn',
        body: [
          'Câu càng gần đời sống, bạn càng dễ dùng. Nếu bạn đi làm, học các câu về lịch trình, cuộc họp, email, nghỉ ngơi. Nếu bạn đi học, học câu hỏi bài, làm bài, hỏi bạn bè. Nếu bạn muốn du lịch, học câu hỏi đường, gọi món, mua vé. Đừng học câu chỉ vì nó trông hay nếu bạn không có tình huống dùng. Poo thích câu nhỏ nhưng có chỗ đứng trong ngày của bạn.',
          'Bạn có thể tự tạo “câu của ngày”. Buổi sáng chọn một câu. Trong ngày, cố tìm một khoảnh khắc để nói thầm hoặc viết lại câu ấy. Buổi tối, thay một từ để tạo câu mới. Chỉ mất vài phút nhưng giúp tiếng Anh chen vào đời sống thật. Khi tiếng Anh không còn chỉ nằm trong giờ học, nó trở nên thân hơn.'
        ],
      },
      {
        heading: 'Từ câu ngắn đến phản xạ dài hơn',
        body: [
          'Sau một thời gian, các câu ngắn sẽ bắt đầu nối lại. “I am tired” có thể nối với “I need a break”. “I want to learn English” có thể nối với “I practice every day”. Bạn không cần nhảy từ câu đơn sang bài nói dài ngay. Hãy nối hai câu, rồi ba câu. Khi các khung câu quen, bạn sẽ kể được ý dài hơn mà không phải dịch từng chữ.',
          'Nếu muốn có bản đồ để luyện đều, hãy dùng /learning-path. Nếu cần nền từ và mẫu câu căn bản, ghé /48-ngay-lay-goc. Nếu muốn câu nghe tự nhiên hơn, mở /shadowing. Nếu muốn giữ các câu hay, dùng /words. PooEnglish không xem câu ngắn là quá đơn giản; đó là viên gạch đầu tiên của khả năng giao tiếp.'
        ],
      },
    ],
    faqs: [
      { question: 'Học câu ngắn có đủ để giỏi tiếng Anh không?', answer: 'Câu ngắn là nền tốt, nhưng bạn cần mở rộng dần sang đoạn dài, nghe nói và ngữ cảnh phong phú hơn.' },
      { question: 'Mỗi ngày nên học mấy câu?', answer: 'Người mới có thể bắt đầu với 1 đến 3 câu thật chắc. Quan trọng là nói lại và thay từ để dùng được.' },
      { question: 'Có nên học thuộc lòng câu mẫu không?', answer: 'Có thể học thuộc vài câu hữu ích, nhưng nên hiểu nghĩa và biết thay từ để tránh học vẹt.' },
      { question: 'PooEnglish có nơi lưu câu cần nhớ không?', answer: 'Bạn có thể dùng /words để giữ từ và câu cần ôn, rồi quay lại luyện trong /learning-path hoặc /shadowing.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: '48 ngày lấy gốc tiếng Anh: cách xây lại nền mà không tự ép mình',
    description: 'Khóa 48 ngày lấy gốc tiếng Anh nên được học như hành trình nhỏ đều, không phải cuộc đua. Poo gợi ý cách tận dụng 48 ngày hiệu quả.',
    slug: '48-ngay-lay-goc-tieng-anh',
    date: '2026-06-11',
    excerpt: '48 ngày là một khung thời gian để tạo nhịp học, xây lại câu căn bản và hình thành thói quen. Bạn có thể đi chậm, miễn là quay lại.',
    readingTime: '8 phút đọc',
    keywords: ['48 ngày lấy gốc tiếng Anh', 'lấy gốc tiếng Anh', 'học tiếng Anh mất gốc'],
    sections: [
      {
        heading: '48 ngày là bản đồ, không phải áp lực',
        body: [
          'Khi nghe “48 ngày lấy gốc”, nhiều bạn lo rằng mình phải hoàn thành đúng từng ngày, nếu lỡ nhịp thì thất bại. Poo muốn bạn nhìn khác đi. 48 ngày là một bản đồ có các chặng nhỏ để bạn biết hôm nay học gì và ngày mai nối tiếp ra sao. Nếu bận, bạn có thể dừng lại. Nếu bài khó, bạn có thể lặp thêm. Điều quan trọng là quay lại bản đồ thay vì bỏ luôn cả hành trình.',
          'Người mất gốc thường cần cảm giác có đường đi rõ. Không phải vì họ không chăm, mà vì quá nhiều tài liệu khiến họ rối. /48-ngay-lay-goc giúp gom lại những mảnh căn bản: từ vựng gần đời sống, mẫu câu đơn giản, nghe nói nhẹ, ôn tập và kiểm tra nhỏ. Mỗi ngày giống một chiếc phao, đủ gần để bạn với tới.'
        ],
      },
      {
        heading: 'Mỗi ngày nên học một gói nhỏ',
        body: [
          'Một ngày học nền không cần quá dài. Bạn có thể bắt đầu bằng vài từ chính, một mẫu câu, một đoạn nghe ngắn, một hoạt động nói lại và vài câu kiểm tra. Cách chia này giúp não không bị quá tải. Nếu bài học quá nhiều, người mất gốc dễ cảm thấy mình quay lại trường lớp cũ với áp lực cũ. PooEnglish muốn trải nghiệm mềm hơn: học vừa đủ, hiểu được, làm được, rồi nghỉ.',
          'Sau mỗi ngày, hãy ghi lại một câu bạn muốn nhớ. Câu đó có thể được đưa vào /words để ôn. Nếu câu có âm hay, bạn mang sang /shadowing để luyện nói. Nếu muốn xem mình đang ở đâu trong hành trình lớn, mở /learning-path. Khóa 48 ngày không tách khỏi hệ sinh thái học; nó là nền để bạn bơi sang các vùng khác.'
        ],
      },
      {
        heading: 'Tập trung vào câu dùng được',
        body: [
          'Lấy gốc không có nghĩa là học lại toàn bộ lý thuyết từ đầu theo cách nặng nề. Nền quan trọng nhất là khả năng hiểu và tạo câu đơn giản. Bạn cần biết cách nói mình là ai, mình muốn gì, mình đang làm gì, mình cần giúp gì, mình cảm thấy thế nào. Những câu này nhỏ nhưng dùng được trong rất nhiều tình huống. Khi câu căn bản chắc, ngữ pháp và từ vựng nâng cao sẽ có chỗ để bám.',
          'Poo khuyên mỗi bài nên kết thúc bằng một việc bạn có thể làm được: nói một câu, hiểu một đoạn, nhớ một nhóm từ, phân biệt một mẫu câu. Kết quả nhỏ nhưng rõ giúp bạn tin vào tiến bộ. Nếu chỉ đọc lý thuyết dài, bạn có thể thấy mình học nhiều mà vẫn không dùng được. Hãy để câu thật dẫn đường.'
        ],
      },
      {
        heading: 'Ôn lại là phần chính của lấy gốc',
        body: [
          'Nhiều người nghĩ học là luôn đi tiếp bài mới. Nhưng với người mất gốc, ôn lại mới là phần làm nền chắc. Một từ gặp một lần rất dễ quên. Một mẫu câu hiểu hôm nay có thể mờ vào tuần sau. Vì vậy khóa 48 ngày nên có nhịp quay lại: ôn từ cũ, nói lại câu cũ, kiểm tra lỗi cũ. Poo không xem ôn là lùi bước. Ôn là cách lát đá chắc hơn trên con đường bạn đang đi.',
          'Bạn có thể dùng /words để giữ phần hay quên, hoặc quay lại ngày học trước trong /48-ngay-lay-goc. Nếu thấy nghe nói yếu, thêm vài phút /shadowing. Nếu thấy không biết học tiếp gì, /learning-path sẽ cho bản đồ rộng hơn. Sự kết hợp này giúp nền không chỉ nằm trong một khóa, mà đi vào thói quen học hằng ngày.'
        ],
      },
      {
        heading: 'Kết thúc 48 ngày rồi học gì tiếp?',
        body: [
          'Sau 48 ngày, bạn không cần trở thành người nói tiếng Anh trôi chảy ngay. Mục tiêu hợp lý hơn là: bạn biết cách học, có một số câu nền, nghe bớt sợ, dám nói câu ngắn và biết mình yếu phần nào. Từ đó, bạn có thể đi tiếp vào /learning-path để mở rộng kỹ năng, luyện /shadowing để tăng phản xạ nói, dùng /words để tích lũy từ, hoặc học thêm theo chủ đề mình cần.',
          'Hãy xem 48 ngày như giai đoạn làm quen lại với đại dương. Bạn đã đặt chân xuống nước, biết vài nhịp bơi và có Poo bên cạnh. Chặng tiếp theo không còn mơ hồ như trước. Bạn chỉ cần chọn hướng bơi mới và giữ nhịp nhỏ đều. Đó mới là thành quả lớn nhất của việc lấy gốc.'
        ],
      },
    ],
    faqs: [
      { question: 'Có bắt buộc học đủ 48 ngày liên tục không?', answer: 'Không. Bạn có thể học chậm hơn, nghỉ khi bận và quay lại. Điều quan trọng là không bỏ hẳn hành trình.' },
      commonFaqs.beginner,
      { question: 'Mỗi ngày trong khóa nên học bao lâu?', answer: 'Bạn có thể bắt đầu với 15 đến 25 phút. Nếu bận, học gói tối thiểu vài từ và một câu vẫn có giá trị.' },
      { question: 'Sau 48 ngày có nên luyện shadowing không?', answer: 'Nên. Shadowing giúp biến nền câu và từ vựng thành phản xạ nghe nói tự nhiên hơn.' },
      commonFaqs.freeLearning,
    ],
  },
  {
    title: 'PooEnglish là gì? Website học tiếng Anh cùng cá voi Poo cho người Việt',
    description: 'PooEnglish là website học tiếng Anh thân thiện với lộ trình, shadowing, từ vựng và khóa 48 ngày lấy gốc. Cùng tìm hiểu tinh thần cá voi Poo.',
    slug: 'pooenglish-la-gi',
    date: '2026-06-11',
    excerpt: 'PooEnglish là nơi học tiếng Anh với tinh thần nhỏ mà đều, có mascot cá voi Poo đồng hành để bài học bớt căng và dễ quay lại mỗi ngày.',
    readingTime: '8 phút đọc',
    keywords: ['PooEnglish', 'Poo English', 'học tiếng Anh cùng Poo'],
    sections: [
      {
        heading: 'PooEnglish sinh ra để việc học bớt đáng sợ',
        body: [
          'PooEnglish là website học tiếng Anh dành cho người Việt muốn bắt đầu hoặc bắt đầu lại bằng nhịp nhẹ nhàng. Thay vì mở đầu bằng những yêu cầu lớn, PooEnglish chia hành trình thành các bước nhỏ: học vài từ, hiểu một câu, nghe một đoạn ngắn, nói lại, làm vài câu kiểm tra và ôn phần còn yếu. Mascot cá voi Poo xuất hiện như một người bạn dẫn đường, giúp lời nhắc mềm hơn và bài học có cảm xúc hơn.',
          'Tên PooEnglish gắn với hình ảnh cá voi Poo trong một đại dương học tập. Đại dương có nhiều vùng: /learning-path là bản đồ, /shadowing là phòng luyện nói đuổi, /words là túi vỏ sò từ vựng, /48-ngay-lay-goc là hành trình xây nền. Bạn có thể ghé từng vùng theo nhu cầu, nhưng tinh thần chung vẫn là học nhỏ, đều và không tự làm mình sợ.'
        ],
      },
      {
        heading: 'PooEnglish phù hợp với ai?',
        body: [
          'PooEnglish phù hợp với người mất gốc, người mới học lại, người từng học nhiều nhưng ngại nói, hoặc người muốn duy trì thói quen tiếng Anh mỗi ngày. Nếu bạn đã quá quen với cảm giác mở tài liệu rồi bỏ dở, PooEnglish cố giảm ma sát bằng bài ngắn và điều hướng rõ. Nếu bạn sợ đăng nhập phức tạp, nhiều trang học có thể mở ở chế độ khách. Nếu bạn cần lưu tiến độ lâu dài, đăng nhập là lựa chọn thêm chứ không phải bức tường đầu tiên.',
          'PooEnglish không hứa biến bạn thành người nói hoàn hảo trong vài ngày. Thay vào đó, Poo hứa một điều thực tế hơn: giúp bạn quay lại dễ hơn, hiểu mình nên học gì tiếp theo và có những bài luyện đủ nhỏ để làm được. Với ngôn ngữ, khả năng quay lại đều thường quan trọng hơn cảm hứng bùng lên một lần.'
        ],
      },
      {
        heading: 'Những vùng học chính trên PooEnglish',
        body: [
          '/learning-path giúp bạn đi theo lộ trình học có thứ tự. Đây là nơi phù hợp khi bạn không biết hôm nay học gì. /48-ngay-lay-goc dành cho người muốn xây nền từ đầu bằng các chặng nhỏ. /shadowing giúp luyện nghe nói theo từng câu, đặc biệt hữu ích cho phát âm và phản xạ. /words là nơi giữ từ, cụm và câu cần ôn. Các vùng này không tách rời; chúng nối với nhau để một mảnh kiến thức được gặp lại qua nhiều hoạt động.',
          'Ví dụ bạn học một mẫu câu trong lộ trình. Sau đó bạn lưu từ quan trọng vào /words. Tiếp theo bạn nghe và nói lại câu trong /shadowing. Nếu thấy nền chưa chắc, quay về /48-ngay-lay-goc để ôn mẫu tương tự. Cách học này giúp kiến thức không bị rơi rụng sau một lần xem. Poo gọi đó là để vỏ sò được sóng đưa lại nhiều lần cho đến khi bạn nhận ra nó ngay.'
        ],
      },
      {
        heading: 'Tinh thần thương hiệu cá voi Poo',
        body: [
          'Poo là mascot đại diện cho sự kiên nhẫn, dễ thương và không phán xét. Trong học tiếng Anh, cảm xúc rất quan trọng. Nếu mỗi lần sai bạn đều thấy xấu hổ, bạn sẽ né bài học. Nếu mỗi lần quay lại bạn được chào bằng lời nhắc mềm, bạn dễ thử tiếp. PooEnglish chọn giọng văn thân thiện vì muốn người học cảm thấy mình có bạn đồng hành. Dễ thương ở đây không phải trang trí, mà là một phần của trải nghiệm học bền.',
          'Tất nhiên, sự dễ thương cần đi cùng nội dung rõ. PooEnglish vẫn tập trung vào từ vựng, câu, nghe, nói, ngữ pháp và ôn tập. Nhưng cách trình bày cố gắng tránh làm người học bị ngợp. Một lời khen nhỏ trước khi sửa lỗi, một CTA học miễn phí, một bài viết giải thích bằng tiếng Việt tự nhiên — tất cả đều góp phần tạo cảm giác an toàn.'
        ],
      },
      {
        heading: 'Bắt đầu với PooEnglish như thế nào?',
        body: [
          'Nếu bạn mới hoàn toàn hoặc mất gốc, hãy bắt đầu với /48-ngay-lay-goc. Nếu bạn muốn có bản đồ chung, vào /learning-path. Nếu bạn đã có chút nền nhưng ngại nói, thử /shadowing với câu ngắn. Nếu bạn hay quên từ, mở /words để ôn lại. Bạn không cần chọn đúng hoàn hảo ngay. Hãy chọn vùng gần nhu cầu nhất và học một bước nhỏ hôm nay.',
          'PooEnglish tin rằng một buổi học nhỏ hoàn thành thật sự tốt hơn một kế hoạch lớn nằm yên. Bạn có thể vào học miễn phí, thử bài, nghe một câu, nói lại một nhịp. Nếu thấy hợp, hãy quay lại ngày mai. Cá voi Poo sẽ vẫn ở đó, mang thêm vài bong bóng khích lệ và một chiếc phao nhỏ cho chặng tiếp theo.'
        ],
      },
    ],
    faqs: [
      { question: 'PooEnglish là gì?', answer: 'PooEnglish là website học tiếng Anh cho người Việt, tập trung vào lộ trình nhỏ, shadowing, từ vựng, luyện nghe nói và khóa 48 ngày lấy gốc.' },
      { question: 'PooEnglish có phải chỉ dành cho người mới không?', answer: 'Không. Người mới và người mất gốc sẽ phù hợp nhất, nhưng người đã có nền vẫn có thể dùng để ôn, luyện nói và duy trì thói quen.' },
      { question: 'Có cần đăng nhập mới học được không?', answer: 'Không bắt buộc. Bạn có thể bắt đầu ở chế độ khách; đăng nhập chỉ giúp lưu hành trình tốt hơn.' },
      { question: 'Nên bắt đầu ở trang nào?', answer: 'Nếu mất gốc, bắt đầu tại /48-ngay-lay-goc. Nếu muốn bản đồ tổng thể, vào /learning-path. Nếu muốn luyện nói, vào /shadowing.' },
      commonFaqs.freeLearning,
    ],
  },
];

export const BLOG_POST_SLUGS = BLOG_POSTS.map((post) => post.slug);

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostPath(post: Pick<BlogPost, 'slug'>) {
  return `/blog/${post.slug}`;
}
