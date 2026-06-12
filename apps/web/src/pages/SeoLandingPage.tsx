import { Box, Button, Container, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { BookOpen, ChevronRight, Compass, HelpCircle, Sparkles, Waves } from 'lucide-react';
import { Icon } from '@chakra-ui/react';
import { OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';
import { getReviewSeoPageByPath, REVIEW_SEO_PATHS, type ReviewSeoPage } from '../data/reviewSeoPages';
import { BLOG_POSTS, getBlogPostPath } from '../data/blogPosts';
import { getSeoPageByPath, SEO_PAGE_PATHS, type SeoPage } from '../data/seoPagesData';
import { getSeoV3Top1PageByPath, SEO_V3_TOP1_PATHS, type SeoV3Top1Page } from '../data/seoV3Top1Pages';
import { seoV3SupplementBanks } from '../data/seoV3SupplementBanks';

type SeoLandingContent = {
  path: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  links: Array<{ label: string; to: string }>;
  ctaLabel: string;
  ctaTo: string;
  ctaTitle?: string;
  ctaBody?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTo?: string;
};

export const SEO_LANDING_PATHS = [
  '/hoc-tieng-anh',
  '/lo-trinh-hoc-tieng-anh',
  '/shadowing-tieng-anh',
  '/tu-vung-tieng-anh',
  '/luyen-nghe-tieng-anh',
  '/ngu-phap-tieng-anh',
  '/48-ngay-lay-goc',
  '/gioi-thieu',
  ...REVIEW_SEO_PATHS,
  ...SEO_V3_TOP1_PATHS,
  ...SEO_PAGE_PATHS,
] as const;

const commonFaqs = {
  login: {
    question: 'Có cần đăng nhập để học trên PooEnglish không?',
    answer: 'Không bắt buộc. Bạn có thể vào học ở chế độ khách trước. Khi muốn lưu tiến độ lâu dài, Poo sẽ mời bạn đăng nhập nhẹ nhàng bằng Google.',
  },
  beginner: {
    question: 'Người mất gốc có học được không?',
    answer: 'Có. PooEnglish chia bài rất nhỏ, ưu tiên câu quen từ vựng gần đời sống và nhịp ôn lại đều để người mới không bị ngợp.',
  },
  daily: {
    question: 'Mỗi ngày nên học bao lâu?',
    answer: 'Bạn chỉ cần bắt đầu với 10–20 phút. Poo thích những bước bơi nhỏ nhưng đều: một ít từ mới, một ít nghe nói và một lần ôn lại là đủ đẹp cho một ngày.',
  },
};

const LANDINGS: Record<string, SeoLandingContent> = {
  '/': {
    path: '/',
    eyebrow: 'Bắt đầu cùng cá voi Poo',
    title: 'học tiếng Anh cùng PooEnglish',
    intro: 'PooEnglishọc tiếng Anh dành cho người Việt muốn bắt đầu lại một cách thân thiện. Thay vì ép bạn học thật nhiều trong một lần, Poo chia hành trình thành những bước nhỏ: học một cụm từ, nghe một câu, nói lại một nhịp, làm vài câu kiểm tra và quay lại ôn đúng phần còn yếu.',
    sections: [
      {
        heading: 'Vì sao PooEngữ pháp để bắt đầu?',
        body: 'Nhiều người sợ từ vựng học quá nhiều quy tắc nhưng lại không dùng được trong tình huống thật. PooEnglish đi theo hướng ngược lại: bắt đầu bằng câu gần gũi, giải thích vừa đủ, rồi cho bạn luyện lại trong các hoạt động ngắn. Cá voi Poo không vội vàng kéo bạn ra biển lớn; Poo đứng cạnh bờ, đưa từng chiếc phao nhỏ để bạn làm quen với âm, từ và mẫu câu.',
      },
      {
        heading: 'Một ngày học trên PooEnglish diễn ra thế nào?',
        body: 'Bạn có thể mở lộ trình, chọn bài hôm nay và đi từ vựng học nhỏ: nhìn từ mới, nghe câu mẫu, đọc nghĩa, nói lại, làm quiz, rồi lưu phần cần ôn. Mỗi hoạt động được thiết kế để không chiếm quá nhiều năng lượng. Nếu bạn bận, chỉ học một bài ngắn vẫn có giá trị.',
      },
      {
        heading: 'Poo giúp bạn học cả nghe, nói, từ vựngữ pháp',
        body: 'PooEnglish không tách kỹ năng thành những hòn đảo rời rạc. Một từ mới sẽ xuất hiện trong câu; một mẫu ngữ pháp sẽ được đặt trong tình huống; một đoạn nghe có thể trở thành bài nói đuổi; một lỗi sai sẽ quay về sổ ôn tập.',
      },
      {
        heading: 'Học miễn phí trước, đăng nhập sau cũng được',
        body: 'PooEnglish ưu tiên việc vào học nhanh. Trang học công khai có thể mở mà không bị kẹt ở đăng nhập. Nếu hệ thống xác nhận tài khoản chậm, bạn vẫn có thể học ở chế độ khách. Khi bạn thấy PooEnglish hợp với mình, đăng nhập sẽ giúp lưu tiến độ tốt hơn.',
      },
    ],
    faqs: [
      commonFaqs.login,
      commonFaqs.beginner,
      commonFaqs.daily,
      { question: 'PooEnglish khác gì một app flashcard thông thường?', answer: 'PooEnglish kết hợp lộ trình, ngữ cảnh, nghe nói, quiz và ôn lỗi sai. từ vựng đứng một mình mà được đặt trong câu và hoạt động học cụ thể.' },
      { question: 'Tôi nên bắt đầu ở trang nào?', answer: 'Nếu bạn mới hoàn toàn, hãy vào lộ trình hoặc khóa 48 ngày lấy gốc. Nếu muốn luyện phát âm, hãy thử shadowing tiếng Anh cùng Poo.' },
    ],
    links: [
      { labelộ trìnhọc tiếng Anh', to: '/lo-trinh-hoc-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      { label: 'Shadowing tiếng Anh', to: '/shadowing-tieng-anh' },
    ],
    ctaLabel: 'Vào học cùng Poo',
    ctaTo: '/learning-path',
  },
  '/hoc-tieng-anh': {
    path: '/hoc-tieng-anh',
    eyebrow: 'Bắt đầu cùng cá voi Poo',
    title: 'học tiếng Anh cùng PooEnglish: nhẹ nhàng, đều đặn và có lộ trình',
    intro: 'PooEnglishọc tiếng Anh dành cho người Việt muốn bắt đầu lại một cách thân thiện. Thay vì ép bạn học thật nhiều trong một lần, Poo chia hành trình thành những bước nhỏ: học một cụm từ, nghe một câu, nói lại một nhịp, làm vài câu kiểm tra và quay lại ôn đúng phần còn yếu.',
    sections: [
      {
        heading: 'Vì sao PooEngữ pháp để bắt đầu?',
        body: 'Nhiều người sợ từ vựng học quá nhiều quy tắc nhưng lại không dùng được trong tình huống thật. PooEnglish đi theo hướng ngược lại: bắt đầu bằng câu gần gũi, giải thích vừa đủ, rồi cho bạn luyện lại trong các hoạt động ngắn. Cá voi Poo không vội vàng kéo bạn ra biển lớn; Poo đứng cạnh bờ, đưa từng chiếc phao nhỏ để bạn làm quen với âm, từ và mẫu câu. Khi đã thấy một câu tiếng Anh không còn đáng sợ, bạn sẽ dễ học tiếp bài thứ hai, thứ ba và hình thành thói quen ổn định hơn.',
      },
      {
        heading: 'Một ngày học trên PooEnglish diễn ra thế nào?',
        body: 'Bạn có thể mở lộ trình, chọn bài hôm nay và đi từ vựng học nhỏ: nhìn từ mới, nghe câu mẫu, đọc nghĩa, nói lại, làm quiz, rồi lưu phần cần ôn. Mỗi hoạt động được thiết kế để không chiếm quá nhiều năng lượng. Nếu bạn bận, chỉ học một bài ngắn vẫn có giá trị. Nếu bạn có thêm thời gian, bạn có thể bơi sang shadowing, luyện nghe hoặc sổ từ vựng. Điều quan trọng là não được gặp lại tiếng Anh thường xuyên, theo cách dễ chịu, để kiến thức tự nhiên bám lâu hơn.',
      },
      {
        heading: 'Poo giúp bạn học cả nghe, nói, từ vựngữ pháp',
        body: 'PooEnglish không tách kỹ năng thành những hòn đảo rời rạc. Một từ mới sẽ xuất hiện trong câu; một mẫu ngữ pháp sẽ được đặt trong tình huống; một đoạn nghe có thể trở thành bài nói đuổi; một lỗi sai sẽ quay về sổ ôn tập. Nhờ vậy, bạn không chỉ biết nghĩa của từ mà còn hiểu cách dùng. Poo luôn cố giữ giọng văn mềm mại, dễ từ vựng, để mỗi lần vào học giống như được một bạn cá voi kiên nhẫn nhắc: mình bơi chậm cũng được, miễn là hôm nay vẫn bơi.',
      },
      {
        heading: 'Học miễn phí trước, đăng nhập sau cũng được',
        body: 'PooEnglish ưu tiên việc vào học nhanh. Trang học công khai có thể mở mà không bị kẹt ở đăng nhập. Nếu hệ thống xác nhận tài khoản chậm, bạn vẫn có thể học ở chế độ khách. Cách này giúp người mới chạm vào bài học ngay, không phải đi qua quá nhiều màn hình. Khi bạn thấy PooEnglish hợp với mình, đăng nhập sẽ giúp lưu tiến độ từ vựng bộ hành trình học trong tương lai.',
      },
    ],
    faqs: [
      commonFaqs.login,
      commonFaqs.beginner,
      commonFaqs.daily,
      { question: 'PooEnglish khác gì một app flashcard thông thường?', answer: 'PooEnglish kết hợp lộ trình, ngữ cảnh, nghe nói, quiz và ôn lỗi sai. từ vựng đứng một mình mà được đặt trong câu và hoạt động học cụ thể.' },
      { question: 'Tôi nên bắt đầu ở trang nào?', answer: 'Nếu bạn mới hoàn toàn, hãy vào lộ trình hoặc khóa 48 ngày lấy gốc. Nếu muốn luyện phát âm, hãy thử shadowing tiếng Anh cùng Poo.' },
    ],
    links: [
      { labelộ trìnhọc tiếng Anh', to: '/lo-trinh-hoc-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      { label: 'Shadowing tiếng Anh', to: '/shadowing-tieng-anh' },
    ],
    ctaLabel: 'Vào học cùng Poo',
    ctaTo: '/learning-path',
  },
  '/lo-trinh-hoc-tieng-anh': {
    path: '/lo-trinh-hoc-tieng-anh',
    eyebrow: 'Bản đồ bơi của Poo',
    titlộ trìnhọc tiếng Anh rõ ràng cho người muốn đi từng bước chắc chắn',
    intro: 'lộ trìnhọc tiếng Anh trên PooEnglish được thiết kế như một bản đồ đại dương nhỏ. Bạn không phải tự hỏi hôm nay học gì, ôn gì hay chuyển sang kỹ năng nào. Poo sắp xếp các chặng học theo thứ tự dễ theo dõi để bạn xây nền trước, luyện phản xạ sau và luôn có điểm quay lại khi cần ôn.',
    sections: [
      { heading: 'Học theo từng nút thay vì học lan man', body: 'Một khó khăn lớn khọc tiếng Anh là có quá nhiều tài liệu. Bạn mở một video, lưu một danh sách từ vựngữ pháp rồi không biết nối chúng lại thế nào. PooEnglish biến hành trình ấy thành các nút học nhỏ. Mỗi nút có mục tiêu rõ: nắm một nhóm từ, nghe vài câu, hiểu một mẫu câu, trả lời quiz hoặc luyện nói. Khi hoàn thành, bạn thấy mình vừa đi thêm một bước thật, không chỉ xem thêm nội dung.' },
      { heading: 'lộ trình cân bằng nhiều kỹ năng', body: 'Poo không muốn bạn chỉ học từ vựng mà quên nghe, cũng không muốn bạn chỉ nghe thật nhiều nhưng không hiểu cấu trúc câu. Vì vậy lộ trình kết hợp từ mới, câu mẫu, nghe, nói, ngữ pháp nhẹ và ôn tập. Các kỹ năng được đặt cạnh nhau như những con sóng nhỏ. Sóng này đẩy sóng kia: biết từ giúp nghe dễ hơn, nghe quen giúp nói tự nhiên hơn, hiểu mẫu câu giúp viết và đọc đỡ rối hơn.' },
      { heading: 'Có chỗ cho người mới và người học lại', body: 'Nếu bạn mất gốc, hãy bắt đầu từ các chặng nền tảng hoặc khóa 48 ngày. Nếu bạn đã biết một ít, bạn vẫn có thể dùng lộ từ vựng: ôn lại câu căn bản, luyện phản xạ, xem từ nào hay quên. PooEnglish không phán xét trình độ hiện tại. Poo chỉ cần biết hôm nay bạn đang ở đâu để đưa chiếc phao vừa đủ, không quá dễ khiến chán, cũng không quá khó khiến bạn bỏ cuộc.' },
      { heading: 'Tiến độ được giữ nhẹ nhàng', body: 'Mỗi lần hoàn thành bài, Poo ghi nhận bước tiến của bạn. Với người chưa đăng nhập, tiến độ có thể được giữ trên thiết bị để bạn học thử thoải mái. Khi đăng nhập, hành trình có thể được lưu tốt hơn. Tinh thần của PooEnglish là học đều, không tạo áp lực thành tích quá nặng. Một ngày chỉ cần hoàn thành một nút nhỏ cũng là một lần bạn nói với não rằng từ vựng hiện diện trong cuộc sống của mình.' },
    ],
    faqs: [
      { question: 'lộ trình này dành cho ai?', answer: 'lộ trình phù hợp với người mất gốc, người học lại từ đầu hoặc người đã học lẻ tẻ nhưng chưa biết nên nối các kỹ năng theo thứ tự nào.' },
      { question: 'Mỗi ngày đi một nút học có đủ không?', answer: 'Đủ để tạo thói quen. Poo ưu tiên một bước rõ ràng mỗi ngày hơn là mở quá nhiều tài liệu rồi bỏ dở giữa chừng.' },
      { question: 'lộ trình có bắt buộc đi đúng thứ tự không?', answer: 'Poo khuyến khích đi theo thứ tự nếu bạn mới bắt đầu, nhưng bạn vẫn có thể ghé các trang shadowing, từ vựng hoặc luyện nghe khi muốn đổi nhịp.' },
      { question: 'lộ trình có phù hợp học trên điện thoại không?', answer: 'Có. Các bài được chia nhỏ để bạn có thể học trên điện thoại trong giờ nghỉ, trước khi ngủ hoặc bất cứ lúc nào có vài phút rảnh.' },
      { question: 'Khi bị kẹt ở một kỹ năng thì làm gì?', answer: 'Hãy quay lại nút học liên quan: nghe yếu thì luyện nghe chậm, quên từ thì mở sổ từ, ngại nói thì chọn vài câu shadowing ngắn.' },
    ],
    links: [
      { label: 'học tiếng Anh', to: '/hoc-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      { label: 'từ vựng Anh', to: '/tu-vung-tieng-anh' },
    ],
    ctaLabel: 'Mở bản đồ học',
    ctaTo: '/learning-path',
    ctaTitle: 'Để Poo chỉ đường học hôm nay',
    ctaBody: 'Nếu bạn đang lạc giữa quá nhiều tài liệu, hãy mở bản đồ học. Poo sẽ gom các chặng từ vựnghe, nói và ôn tập thành từng bước nhỏ để bạn biết mình nên bơi tiếp ở đâu.',
    secondaryCtaLabel: 'Xem khóa 48 ngày',
    secondaryCtaTo: '/48-ngay-lay-goc',
  },
  '/shadowing-tieng-anh': {
    path: '/shadowing-tieng-anh',
    eyebrow: 'Nói đuổi cùng Poo',
    title: 'Shadowing tiếng Anh: luyện nghe nói theo từng câu nhỏ, bớt ngại miệng',
    intro: 'Shadowing tiếng Anh là cách nghe một câu mẫu rồi nói theo gần như ngay sau đó. Trên PooEnglish, hoạt động này được làm mềm lại: câu ngắn hơn, nhịp rõ hơn, có chỗ lặp lại và có lời nhắc thân thiện để bạn không cảm thấy mình đang bị kiểm tra quá căng.',
    sections: [
      { heading: 'Shadowing giúp từ vựng đi cùng nhau', body: 'Khọc tiếng Anh, nhiều bạn hiểu nghĩa khi đọc nhưng lại chậm khi nghe hoặc ngại phát âm thành tiếng. Shadowing tạo một chiếc cầu giữa từ vựng. Bạn nghe câu, bắt nhịp, lặp lại, rồi nhận ra âm tiếng Anh không còn là thứ nằm riêng trong sách. Poo chia đoạn luyện thành từng câu để bạn có thể thử nhiều lần. Mỗi lần lặp không cần hoàn hảo; chỉ cần rõ hơn lần trước một chút là Poo đã vẫy đuôi khen rồi.' },
      { heading: 'Không cần nói hay ngay từ đầu', body: 'PooEnglish không đặt mục tiêu biến bạn thành người bản xứ sau vài buổi. Mục tiêu đầu tiên là dám mở miệng. Bạn có thể nói chậm, nói sai một âm, quên nhấn trọng âm hoặc phải nghe lại nhiều lần. Điều đó bình thường. Bài shadowing trên Poo được thiết kế để bạn thử lại mà không thấy xấu hổ. Khi câu được lặp trong ngữ cảnh dễ hiểu, não sẽ dần nhớ nhịp và miệng sẽ bớt cứng.' },
      { heading: 'Kếtừ vựng và luyện nghe', body: 'Shadowing hiệu quả hơn khi bạn hiểu câu mình đang nói. Vì vậy PooEnglish nối hoạt động này với từ vựng, luyện nghe và lộ trình học. Một câu nói đuổi có thể chứa từ mới đã học, mẫu câu vừa gặp hoặc tình huống đời thường. Bạn không chỉ bắt chước âm thanh mà còn hiểu mình đang diễn đạt điều gì. Đây là điểm quan trọng để shadowing không biến thành đọc vẹt, mà trở thành luyện phản xạ thật sự.' },
      { heading: 'Luyện đều trong thời gian ngắn', body: 'Bạn không cần dành cả giờ để shadowing. Chỉ vài câu mỗi ngày cũng giúp tai quen với nhịp tiếng Anh. Poo khuyến khích bạn chọn một đoạn ngắn, nghe kỹ, nói theo, nghỉ một chút rồi quay lại câu khó. Cách luyện này phù hợp với người bận rộn, người mới học lại hoặc người từng học lâu nhưng vẫn ngại nói. Mỗi câu hoàn thành giống như một bong bóng nhỏ nổi lên: bé thôi, nhưng báo hiệu bạn đang tiến bộ.' },
    ],
    faqs: [
      { question: 'Shadowingữ pháp cho người mới không?', answer: 'Có, nếu câu đủ ngắn và tốc độ vừa phải. PooEnglish ưu tiên đoạn dễ theo để người mới tập nhịp trước khi thử câu dài hơn.' },
      { question: 'Tôi phát âm chưa tốt thì có nên shadowing không?', answer: 'Nên. Shadowing chính là cách giúp bạn làm quen âm và nhịp. Bạn không cần đúng ngay; hãy nghe lại và nói lại từng chút.' },
      { question: 'Mỗi buổi shadowing nên luyện bao nhiêu câu?', answer: 'Người mới chỉ cần 3–5 câu ngắn. Quan trọng là nghe kỹ, hiểu nghĩa, nói lại vài lần và lưu câu khó để quay lại.' },
      { question: 'Shadowing khác luyện nghe thông thường thế nào?', answer: 'Luyện nghe tập trung vào hiểu. Shadowing thêm bước nói theo, nên giúp tai, miệngữ pháphối hợp tốt hơn.' },
      { question: 'Nên học thêm gì cùng shadowing?', answer: 'Bạn nên kếtừ vựng, luyện nghe và ngữ pháp mẫu câu để hiểu câu mình đang nói và dùng lộ trình huống khác.' },
    ],
    links: [
      { label: 'Luyện nghe tiếng Anh', to: '/luyen-nghe-tieng-anh' },
      { label: 'từ vựng Anh', to: '/tu-vung-tieng-anh' },
      { label: 'Mở phòng shadowing', to: '/shadowing' },
    ],
    ctaLabel: 'Thử nói đuổi với Poo',
    ctaTo: '/shadowing',
    ctaTitle: 'Nói thử một câu ngắn cùng Poo',
    ctaBody: 'Chọn một câu thật ngắn, nghe mẫu rồi nói theo. Poo không cần bạn phát âm hoàn hảo ngay; chỉ cần hôm nay miệng bớt ngại hơn hôm qua một chút.',
    secondaryCtaLabel: 'Nghe chậm trước đã',
    secondaryCtaTo: '/luyen-nghe-tieng-anh',
  },
  '/tu-vung-tieng-anh': {
    path: '/tu-vung-tieng-anh',
    eyebrow: 'Nhặt vỏ sò từ vựng',
    titừ vựng Anh: học từ trong câu, ôn lại đúng lúc cùng Poo',
    intừ vựng Anh trên PooEnglish không chỉ là một danh sách để nhìn rồi quên. Poo đặt từ vào câu, vào chủ đề và vào bài luyện để bạn hiểu cách dùng. Mỗi từ giống một vỏ sò nhỏ: nhặt một cái thì vui, gom đều mỗi ngày thì thành cả chiếc túi kiến thức.',
    sections: [
      { heading: 'Học từ bằng ngữ cảnh dễ nhớ hơn', body: 'Một từ tiếng Anh thường có nhiều sắc thái. Nếu chỉ học nghĩa tiếng Việt, bạn có thể biết từ đó nhưng không biết đặt vào câu nào. PooEnglish đưa từ vào ví dụ gần đời sống để bạn thấy từ đang làm việc ra sao. Khi gặp từ trong bài nghe, bài nói hoặc quiz, não được nhắc lại bằng nhiều đường khác nhau. Cách học này chậm hơn việc lướt thật nhiều thẻ từ, nhưng thường bền hơn vì bạn hiểu được bối cảnh sử dụng.' },
      { heading: 'Ôn từ không phải để tự làm khó mình', body: 'Ôn tập trên PooEnglish có tinh thần rất mềm: từ nào chưa quen thì quay lại, câu nào hay nhầm thì đánh dấu, phần nào ổn rồi thì bơi tiếp. Poo không xem lỗi sai là thất bại. Lỗi sai giống những bong bóng báo hiệu chỗ cần thêm oxy. Khi bạn nhìn lại một từ đã quên và nhớ ra sau vài lần, đó là tiến bộ thật. Việc ôn đúng phần cần ôn giúp tiết kiệm thời gian hơn học lại mọi thứ từ đầu.' },
      { heading: 'từ vựng nối với nghe nói và lộ trình', body: 'PooEnglish cố gắng để từ vựng nằm riêng trong sổ. Một từ có thể xuất hiện trong lộ trình, trong câu shadowing, trong đoạn luyện nghe hoặc trong bài kiểm tra nhỏ. Nhờ vậy bạn gặp lại từ ở nhiều góc độ: nhìn chữ, nghe âm, nói câu, hiểu nghĩa. Khi các lần gặp được rải ra hợp lý, từ mới dần chuyển từ “mình từng thấy” sang “mình dùng được”.' },
      { heading: 'Phù hợp cho người thích học từng chút', body: 'Không phải ai cũng có thể học 50 từ mỗi ngày. PooEnglish khuyến khích nhịp nhỏ hơn: vài từ quan trọng, vài câu ví dụ, một lượt ôn lại. Cách này phù hợp với người bận, người dễ nản khi danh sách quá dài hoặc người muốn học chắc nền. Poo thích một cuốn sổ từ vựng được mở đều hơn là một kế hoạch thật hoành tráng nhưng chỉ tồn tại hai ngày.' },
    ],
    faqs: [
      { question: 'PooEnglish có sổ từ vựng?', answer: 'Có. Bạn có thể học và ôn các từ, câu hoặc phần cần nhớ từ vựng và ôn tập của PooEnglish.' },
      { question: 'Nên học bao nhiêu từ mỗi ngày?', answer: 'Nếu mới bắt đầu, 5–10 từ kèm câu ví dụ là đủ tốt. Điều quan trọng là ôn lại và dùng được, không phải ghi thật nhiều.' },
      { question: 'Học từ theo chủ đề có tốt không?', answer: 'Có. Chủ đề giúp não nhóm thông tin lại, nhưng Poo vẫn khuyên đặt từ vào câu để hiểu cách dùng tự nhiên hơn.' },
      { question: 'Làm sao biết từ nào cần ôn lại?', answer: 'Sổ từ nên ưu tiên từ mới, từ hay quên, câu từng nói sai và từ đến hạn ôn hôm nay thay vì chỉ hiển thị một danh sách dài.' },
      { questừ vựng có liên quan đến shadowing không?', answer: 'Có. Khi hiểu từ trong câu shadowing, bạn sẽ nghe và nói tự tin hơn, thay vì chỉ bắt chước âm thanh.' },
    ],
    links: [
      { label: 'Mở sổ từ vựng', to: '/words' },
      { label: 'học tiếng Anh', to: '/hoc-tieng-anh' },
      { label: 'ngữ pháp tiếng Anh', to: '/ngu-phap-tieng-anh' },
    ],
    ctaLabel: 'Mở sổ từ cùng Poo',
    ctaTo: '/words',
    ctaTitle: 'Nhặt vài vỏ sò từ vựng hôm nay',
    ctaBody: 'Mở sổ từ vựng, chọn vài từ gần đời sống và đặt chúng vào câu. Poo sẽ giúp bạn gặp lại từ đúng lúc để không còn học xong rồi trôi mất.',
    secondaryCtaLabel: 'Học mẫu câu liên quan',
    secondaryCtaTo: '/ngu-phap-tieng-anh',
  },
  '/luyen-nghe-tieng-anh': {
    path: '/luyen-nghe-tieng-anh',
    eyebrow: 'Nghe sóng tiếng Anh',
    title: 'Luyện nghe tiếng Anh: nghe chậm, hiểu chắc, rồi bơi xa hơn',
    intro: 'Luyện nghe tiếng Anh trên PooEnglish bắt đầu từ những đoạn nhỏ, câu rõ và chủ đề gần gũi. Poo không thả bạn ngay vào vùng nước sâu. Trước tiên, Poo giúp bạn nhận ra từ quen, hiểu ý chính, nghe lại câu khó và nối việc nghe với nói để tai quen dần.',
    sections: [
      { heading: 'Nghe không chỉ là bật âm thanh lên', body: 'Nhiều người luyện nghe bằng cách mở video dài rồi hy vọng tai sẽ tự quen. Cách đó có thể hữu ích, nhưng với người mới, nó dễ gây mệt vì quá nhiều âm lạ cùng lúc. PooEnglish chọn cách chia nhỏ. Bạn nghe câu hoặc đoạn ngắn, có mục tiêu rõ: bắt từ khóa, hiểu tình huống, nhận ra mẫu câu hoặc chuẩn bị nói lại. Khi nhiệm vụ nghe cụ thể hơn, bạn biết mình đang luyện điều gì và bớt cảm giác trôi giữa đại dương âm thanh.' },
      { heading: 'từ vựng quen giúp nghe dễ hơn', body: 'Tai thường không nhận ra âm của một từ nếu não chưa biết từ vựnglish nối luyện nghe với từ vựng và lộ trình. Trước khi nghe, bạn có thể gặp vài từ chính. Sau khi nghe, bạn thấy lại chúng trong câu. Sự lặp lại này làm đoạn nghe bớt bí ẩn. Dần dần, khi một từ chuyển từ xa lạ thành quen mặt, tai cũng bắt đầu nhận ra nó nhanh hơn.' },
      { heading: 'Luyện nghe và shadowing là đôi bạn thân', body: 'Sau khi nghe hiểu một câu, nói lại câu đó giúp bạn nhớ nhịp và âm tốt hơn. PooEnglish khuyến khích shadowing như bước tiếp theo của luyện nghe. Bạn nghe mẫu, dừng lại, nói theo, rồi nghe lại. Không cần nói hoàn hảo; chỉ cần miệng bắt đầu đi cùng tai. Cách kết hợp này đặc biệt hữu ích cho người hiểu bài đọc nhưng phản xạ nghe nói còn chậm.' },
      { heading: 'Xây sự tự tin bằng đoạn ngắn', body: 'Một đoạn nghe ngắn hoàn thành trọn vẹn có giá trị hơn một bài dài khiến bạn bỏ giữa chừng. Poo muốn mỗi buổi luyện nghe để lại cảm giác “mình làm được”. Khi bạn tích lũy nhiều lần làm được như vậy, sự tự tin tăng lên. Sau đó, bạn có thể thử đoạn dài hơn, tốc độ nhanh hơn hoặc chủ đề mới hơn. Poo sẽ vẫn ở cạnh, nhắc bạn bơi từng nhịp.' },
    ],
    faqs: [
      { question: 'Luyện nghe tiếng Anh nên bắt đầu từ đâu?', answer: 'Hãy bắt đầu bằng câu ngắn, chủ đề quen và có từ vựng nền. Sau đó nghe lại, nhắc theo và ghi chú câu khó.' },
      { question: 'Không nghe kịp thì có sao không?', answer: 'Không sao. Nghe không kịp là dấu hiệu cần giảm tốc, chia nhỏ câu hoặc học trước từ khóa. PooEnglish được thiết kế cho nhịp đó.' },
      { question: 'Một buổi luyện nghe ngắn nên làm gì?', answer: 'Bạn có thể nghe ý chính, bắt 2–3 từ khóa, xem transcript khi cần, rồi chọn một câu để nói lại cùng Poo.' },
      { question: 'Có nên vừa nghe vừa nhìn chữ không?', answer: 'Có thể. Người mới có thể nhìn chữ để hiểu trước, sau đó nghe lại không nhìn để tai tập nhận diện âm.' },
      { question: 'Luyện nghe có giúp nói tốt hơn không?', answer: 'Có, đặc biệt khi bạn kết hợp nghe với shadowing. Tai quen nhịp sẽ giúp miệng nói tự nhiên hơn.' },
    ],
    links: [
      { label: 'Shadowing tiếng Anh', to: '/shadowing-tieng-anh' },
      { labelộ trình học', to: '/lo-trinh-hoc-tieng-anh' },
      { label: 'English Speed', to: '/english-speed' },
    ],
    ctaLabel: 'Vào luyện nghe nói',
    ctaTo: '/shadowing',
    ctaTitle: 'Nghe một đoạn ngắn để tai quen sóng',
    ctaBody: 'Đừng bắt tai bơi xa ngay. Hãy nghe một câu rõ, bắt từ khóa rồi nói lại nhẹ nhàng. Poo sẽ ở cạnh để biến tiếng Anh thành âm thanh quen thuộc hơn.',
    secondaryCtaLabel: 'Thử shadowing sau khi nghe',
    secondaryCtaTo: '/shadowing-tieng-anh',
  },
  '/ngu-phap-tieng-anh': {
    path: '/ngu-phap-tieng-anh',
    eyebrow: 'Mẫu câu dễ thở',
    title: 'ngữ pháp tiếng Anh: hiểu bằng mẫu câu đời thường, không học khô cứng',
    intro: 'ngữ pháp tiếng Anh trên PooEnglish được nhìn như chiếc khung giúp câu đứng vững, không phải một bức tường toàn thuật ngữ. Poo giải thích bằng ví dụ gần gũi, đặt trong bài học nhỏ và cho bạn dùng lại ngay để mẫu câu trở nên thân quen.',
    sections: [
      { headingữ pháp là bản đồ của câu', body: 'Khi gặp một câu tiếng Anh, bạn có thể biết từng từ vựng hiểu vì chưa thấy cấu trúc bên trongữ pháp bạn nhận ra ai làm gì, việc xảy ra khi nào, ý nào là chính và phần nào bổ sung. PooEnglish không bắt bạn học thuộc định nghĩa dài. Thay vào đó, Poo dùng câu mẫu, màu sắc và hoạt động nhỏ để bạn thấy mẫu câu vận hành. Khi hiểu bản đồ, bạn bơi trong câu đỡ lạc hơn.' },
      { heading: 'Học quy tắc vừa đủ, luyện dùng nhiều hơn', body: 'Một quy tắc ngữ pháp chỉ thật sự có ích khi bạn dùng được nó. Vì vậy PooEnglish ưu tiên giải thích ngắn, ví dụ rõ và bài luyện ngay sau đó. Bạn có thể gặp một mẫu như “I want to…” từ vựnghe nó trong câu, nói lại trong shadowing và trả lời quiz nhỏ. Sự lộ trìnhiều hoạt động giúp mẫu câu đi vào trí nhớ tự nhiên hơn việc đọc một trang lý thuyết dài.' },
      { heading: 'Giảm nỗi sợ sai ngữ pháp', body: 'Rất nhiều người ngại nói vì sợ sai thì, sai giới từ hoặc sai trật tự từ. Poo muốn đổi cảm giác đó. Sai là tín hiệu để chỉnh, không phải lý do để im lặng. Khi bạn chọn nhầm trong quiz, Poo nên giải thích nhẹ: vì sao đáp án đúngữ pháp hơn, câu đó dùng trong hoàn cảnh nào và lần sau nhìn dấu hiệu nào. Cách phản hồi mềm giúp người học dám thử lại.' },
      { headingữ pháp nối với giao tiếp thật', body: 'PooEnglish chọn các mẫu câu có khả năng dùng trong đời sống: giới thiệu bản từ vựng ngày, hỏi đường, kể kế hoạch, nói cảm xúc, mô tả đồ vật. Khi mẫu câu gắn với tình huốngữ pháp bớt xa lạ. Bạn không chỉ học “cấu trúc” mà học một cách diễn đạt. Dần dần, bạn có thể tự từ vựng câu và tạo câu của riêng mình.' },
    ],
    faqs: [
      { question: 'Có cần học ngữ pháp trước khi luyện nói không?', answer: 'Không cần học hết trước. Bạn có thể học một mẫu câu nhỏ rồi luyện nói ngay. Dùng được mẫu nào chắc mẫu đó.' },
      { question: 'PooEnglish giải thích ngữ pháp theo cách nào?', answer: 'Poo ưu tiên ví dụ, tình huống và bài luyện ngắn. Mục tiêu là hiểu để dùng, không phải ghi nhớ thuật ngữ thật dài.' },
      { question: 'Người mất gốc nên học ngữ pháp nào trước?', answer: 'Nên bắt đầu bằng mẫu câu giới thiệu bản thân, to be, have, like, want to, câu hỏi đơn giản và cách nói thói quen hằng ngày.' },
      { question: 'Sai ngữ pháp nhiều có nên tiếp tục nói không?', answer: 'Có. Nói giúp bạn phát hiện chỗ cần sửa. Poo khuyến khích sửa nhẹ từng lỗi từ vựng hoàn toàn mới bắt đầu.' },
      { question: 'ngữ pháp có liên quan đến từ vựng?', answer: 'Có. từ vựng cần mẫu câu để dùng đúng, còn ngữ pháp cần từ vựng để tạo câu có nghĩa.' },
    ],
    links: [
      { label: 'từ vựng Anh', to: '/tu-vung-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      { labelộ trình học', to: '/lo-trinh-hoc-tieng-anh' },
    ],
    ctaLabel: 'Học mẫu câu cùng Poo',
    ctaTo: '/learning-path',
    ctaTitle: 'Gỡ rối một mẫu câu nhỏ trước',
    ctaBody: 'Bạn không cần học hết ngữ pháp trong một lần. Hãy chọn một mẫu câu đời thường, xem ví dụ và luyện dùng ngay để cấu trúc trở thành chiếc phao dễ nhớ.',
    secondaryCtaLabel: 'Ôn từ để đặt câu',
    secondaryCtaTo: '/tu-vung-tieng-anh',
  },
  '/48-ngay-lay-goc': {
    path: '/48-ngay-lay-goc',
    eyebrow: 'Chuyến bơi 48 ngày',
    title: '48 ngày lấy gốc tiếng Anh cùng PooEnglish cho người muốn bắt đầu lại',
    intro: 'Khóa 48 ngày lấy gốc trên PooEnglish dành cho người từng học tiếng Anh nhưng bị rỗng nền, hoặc người mới muốn có một kế hoạch rõ ràng. Mỗi ngày là một chặng nhỏ để bạn xây lại từ vựng, mẫu câu, nghe, nói và thói quen học đều.',
    sections: [
      { heading: '48 ngày không phải cuộc đua', body: 'Tên gọi 48 ngày giúp bạn có một khung thời gian cụ thể, nhưng Poo không xem đây là cuộc đua tốc độ. Nếu một ngày bạn bận, bạn có thể quay lại. Nếu một bài khó, bạn có thể lặp thêm. Điều quan trọng là có đường đi rõ: hôm nay học gì, ngày mai nối tiếp ra sao, phần nào cần ôn. Với người mất gốc, cảm giác có bản đồ thường quan trọng hơn lượng kiến thức thật lớn.' },
      { heading: 'Mỗi ngày học một gói nhỏ', body: 'Một ngày trong khóa nên gồm các phần vừa đủ: vài từ chính, một số câu mẫu, một điểm ngữ pháp nhỏ, hoạt động nghe nói và bài kiểm tra nhẹ. Cách chia này giúp não không bị quá tải. Bạn không cần ghi nhớ mọi thứ ngay lập tức. Poo sẽ để kiến thức quay lại qua ôn tập và bài sau. Giống như bơi đường dài, nhịp thở đều quan trọng hơn cú quẫy thật mạnh ban đầu.' },
      { heading: 'Xây lại nền bằng câu dùng được', body: 'Người mất gốc thường cần cảm giác “mình nói được một câu hoàn chỉnh” càng sớm càng từ vựnglish ưu tiên mẫu câu đời thường: giới thiệu, hỏi đáp, nói thói quen, diễn tả mong muốn, kể việc đơn giản. Khi bạn dùng được câu thật, động lực sẽ tăng. từ vựngữ pháp hay từ vựng còn là ghi nhớ rời rạc mà trở thành cách làm câu của mình rõ hơn.' },
      { heading: 'Kết nối với lộ trình lớn của PooEnglish', body: 'Khóa 48 ngày không đứng riêng. Sau mỗi chặng, bạn có thể đi tiếp vào lộ trình học, shadowing, luyện nghe, từ vựng hoặc ôn tập. Những gì bạn học trong khóa là nền để bơi xa hơn. Poo muốn bạn kết thúc 48 ngày với cảm giác tiếng Anh đã có chỗ đứng trong lịch sinh hoạt, và bạn biết mình nên học tiếp theo hướng nào.' },
    ],
    faqs: [
      { question: 'Khóa 48 ngữ pháp với người mất gốc không?', answer: 'Có. Khóa bắt đầu từ câu rất căn bản, từ gần đời sống và bài luyện ngắn để người học lại không bị ngợp.' },
      { question: 'Nếu không hoàn thành đúng 48 ngày thì sao?', answer: 'Không sao. Bạn có thể học chậm hơn. PooEnglish coi việc quay lại tiếp tục là một phần bình thường của hành trình.' },
      { question: 'Khóa này tập trung kỹ năng nào?', answer: 'Khóa tập trung nền tổng hợp: từ vựng, mẫu câu, nghe, nói, ngữ pháp căn bản và thói quen ôn tập.' },
      { question: 'Mỗi ngày trong khóa có những phần gì?', answer: 'Mỗi ngày nên có mục tiêu nhỏ, từ vựng chính, mẫu câu, hội thoại, nghe chậm, shadowing, quiz, lỗi hay sai và phần ôn lại.' },
      { question: 'Sau 48 ngày nên học gì tiếp?', answer: 'Bạn có thể tiếp tục lộ trình học, luyện shadowing, mở sổ từ vựng hoặc luyện nghe nói theo nhu cầu yếu nhất của mình.' },
    ],
    links: [
      { label: 'Mở khóa học trong app', to: '/luyen-tieng-anh/48-ngay-lay-goc' },
      { labelộ trìnhọc tiếng Anh', to: '/lo-trinh-hoc-tieng-anh' },
      { label: 'ngữ pháp tiếng Anh', to: '/ngu-phap-tieng-anh' },
    ],
    ctaLabel: 'Bắt đầu ngày 1',
    ctaTo: '/luyen-tieng-anh/48-ngay-lay-goc',
    ctaTitle: 'Bắt đầu lại từ ngày 1, thật chậm cũng được',
    ctaBody: 'Ngày đầu tiên chỉ cần một vài câu chào hỏi, vài từ quen và một lượt nghe nói ngắn. Poo sẽ dẫn bạn từng ngày để nền tiếng Anh có chỗ bám lại.',
    secondaryCtaLabel: 'Xem bản đồ lộ trình',
    secondaryCtaTo: '/lo-trinh-hoc-tieng-anh',
  },
  '/gioi-thieu': {
    path: '/gioi-thieu',
    eyebrow: 'Xin chào từ đại dương Poo',
    title: 'Giới thiệu PooEnglishọc tiếng Anh thân thiện cùng cá voi Poo',
    intro: 'PooEnglish được tạo ra với một ý tưởng đơn giản: học tiếng Anh sẽ dễ bền hơn khi người học cảm thấy được đồng hành. Mascot cá voi Poo xuất hiện như một người bạn nhỏ, giúp bài học bớt khô, lời nhắc bớt căng và hành trình dài trở nên có cảm xúc hơn.',
    sections: [
      { heading: 'PooEnglish tin vào bước học nhỏ', body: 'Không phải ai cũng có thời gian, năng lượng hoặc sự tự tiếng Anh nhiều giờ mỗi ngày. PooEnglộ trìnhỏ mà đều: một bài ngắn, một câu nói lại, một nhóm từ, một lỗi được sửa. Khi các bước nhỏ lặp lại, chúng tạo thành nền tảng. Cá voi Poo không hô khẩu hiệu thật to; Poo chỉ nhẹ nhàng nhắc bạn mở bài hôm nay và bơi thêm vài nhịp.' },
      { heading: 'Thương hiệu xoay quanh sự thân thiện', body: 'PooEnglish muốn Google và người học nhận diện đây là một website học tiếng Anh có tinh thần dễ thương, an từ vựng. Tên PooEnglish gắn với Poo, chú cá voi nhỏ dẫn đường qua các vùng học: lộ trình, 48 ngày lấy gốc, shadowing, từ vựng, luyện nghe và ngữ pháp. Mỗi trang công khai đều cố gắng giải thích bằng tiếng Việt tự nhiên để người mới hiểu mình sắp học gì trước khi vào bài tương tác.' },
      { heading: 'Học được cả khi chưa đăng nhập', body: 'Một phần quan trọng của trải nghiệm là không chặn người học ở cổng vào. PooEngữ pháp xem và bắt đầu học ở chế độ khách. Đăng nhập giúp lộ trình tốt hơn, nhưng không phải bức tường bắt buộc trước khi bạn được nhìn thấy nội dung. Điều này cũng giúp các trang công khai thân từ vựng cụ tìm kiếm: Google có thể thấy cấu trúc, nội dung và liên kết quan trọng thay vì một màn hình chờ kéo dài.' },
      { heading: 'PooEnglish đang phát triển như một đại dương học tập', body: 'Hành trình của PooEnglish không dừng ở một trang duy nhất. Website đang kết nối nhiều mảnh học: khóa nền tảng, bản đồ kỹ năng, shadowing, luyện nghe nói, sổ từ vựng và ôn tập cá nhân. Mục tiêu là giúp người học Việt Nam có một nơi quay lại mỗi ngày, vừa đủ vui để không bỏ cuộc, vừa đủ rõ để thấy mình đang tiến bộ. Poo sẽ tiếp tục gom thêm vỏ sò bài học mới cho đại dương này.' },
    ],
    faqs: [
      { question: 'PooEnglish là gì?', answer: 'PooEnglish là website học tiếngười Việt, tập trung vào lộ trìnhỏ, bài học thân thiện và mascot cá voi Poo đồng hành.' },
      { question: 'Vì sao tên là PooEnglish?', answer: 'Tên gọi gắn với Poo, chú cá voi nhỏ đại diện cho tinh thần học nhẹ nhàng, dễ thương và kiên nhẫn.' },
      commonFaqs.login,
      commonFaqs.beginner,
      { question: 'PooEnglish có những phần học nào?', answer: 'Các phần chính gồm lộ trình học, khóa 48 ngày lấy gốc, shadowing, từ vựng, luyện nghe nói, ngữ pháp và ôn tập.' },
    ],
    links: [
      { label: 'học tiếng Anh cùng Poo', to: '/hoc-tieng-anh' },
      { labelộ trình học', to: '/lo-trinh-hoc-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
    ],
    ctaLabel: 'Khám phá PooEnglish',
    ctaTo: '/hoc-tieng-anh',
  },
};

function ReviewSeoContent({ page }: { page: ReviewSeoPage }) {
  return (
    <Box bg="linear-gradient(180deg, rgba(232,244,255,0.72), rgba(248,252,255,0.94) 44%, rgba(255,255,255,0.98))" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '4', md: '7' }}>
      <Container maxW="1040px" px="0">
        <VStack align="stretch" gap={{ base: '5', md: '7' }}>
          <Box as="article" className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.9)" bg="rgba(255,255,255,0.84)" borderRadius={{ base: '30px', md: '42px' }} p={{ base: '5', md: '9' }} boxShadow="0 26px 80px rgba(31,111,214,0.13)" position="relative" overflow="hidden">
            <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 12% 18%, rgba(91,188,235,0.22), transparent 24%), radial-gradient(circle at 90% 12%, rgba(255,255,255,0.9), transparent 18%), radial-gradient(circle at 70% 100%, rgba(31,111,214,0.12), transparent 30%)" />
            <VStack position="relative" align="stretch" gap={{ base: '5', md: '6' }}>
              <VStack align={{ base: 'center', md: 'start' }} textAlign={{ base: 'center', md: 'left' }} gap="4">
                <HStack color={OCEAN_TOKENS.deepBlue} fontWeight="900" letterSpacing="0.08em" textTransform="uppercase" fontSize="xs" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                  <Icon as={Waves} />
                  <Text>{page.eyebrow}</Text>
                  <Text aria-hidden="true">•</Text>
                  <Text>{page.keyword}</Text>
                </HStack>
                <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.05" color={OCEAN_TOKENS.text} maxW="920px">
                  {page.h1}
                </Text>
                <Text fontSize={{ base: 'md', md: 'xl' }} lineHeight="1.85" color={OCEAN_TOKENS.muted} fontWeight="700" maxW="900px">
                  {page.description}
                </Text>
                <HStack gap="3" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                  <Button as={RouterLink} to="/learning-path" borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" size="lg" rightIcon={<Icon as={ChevronRight} />} _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>
                    Mở lộ trình học
                  </Button>
                  <Button as={RouterLink} to="/shadowing" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                    Luyện shadowing
                  </Button>
                  <Button as={RouterLink} to="/words" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                    Ôn từ vựng
                  </Button>
                </HStack>
              </VStack>

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '5' }}>
                <HStack mb="3" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Sparkles} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950">Trả lời nhanh: {page.keyword} là gì?</Text>
                </HStack>
                <Text color={OCEAN_TOKENS.text} fontWeight="750" lineHeight="1.9">{page.quickAnswer}</Text>
              </Box>

              <VStack align="stretch" gap={{ base: '4', md: '5' }}>
                {page.sections.map((section) => (
                  <Box key={section.heading} bg="rgba(255,255,255,0.90)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                    <HStack mb="3" color={OCEAN_TOKENS.deepBlue} align="start">
                      <Icon as={BookOpen} />
                      <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" lineHeight="1.25">{section.heading}</Text>
                    </HStack>
                    <VStack align="stretch" gap="3">
                      {section.paragraphs.map((paragraph) => (
                        <Text key={paragraph} as="p" color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.9">{paragraph}</Text>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>

              <Box bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Compass} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Bơi tiếp trong cụm Ôn tiếng Anh</Text>
                </HStack>
                <HStack wrap="wrap" gap="3">
                  {page.clusterLinks.map((link) => (
                    <Button key={`${link.to}-${link.label}`} as={RouterLink} to={link.to} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                      {link.label}
                    </Button>
                  ))}
                </HStack>
              </Box>

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={HelpCircle} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Câu hỏi thường gặp</Text>
                </HStack>
                <VStack align="stretch" gap="3">
                  {page.faqs.map((faq) => (
                    <Box key={faq.question} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p="4">
                      <Text as="h3" fontWeight="900" color={OCEAN_TOKENS.text} mb="2">{faq.question}</Text>
                      <Text color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.75">{faq.answer}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>

          <Box textAlign="center" bg="linear-gradient(135deg, rgba(31,111,214,0.95), rgba(91,188,235,0.9))" color="white" borderRadius="3xl" p={{ base: '5', md: '7' }} boxShadow="0 24px 70px rgba(31,111,214,0.22)">
            <Icon as={BookOpen} boxSize="8" mb="3" />
            <Text as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" mb="3">Sẵn sàng ôn mộtừ vựng nhỏ hôm nay?</Text>
            <Text maxW="720px" mx="auto" lineHeight="1.8" fontWeight="700" opacity="0.94" mb="5">
              Poo không cần bạn học thật nhiều trong một lần. Hãy mở lộ trình, nói theo một câu hoặc nhặtừ vựng. Mộtừ vựng ôn nhỏ hôm nay sẽ giúp đại dương tiếng Anh bớt rộng hơn ngày mai.
            </Text>
            <HStack justify="center" gap="3" wrap="wrap">
              <Button as={RouterLink} to="/learning-path" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" _hover={{ bg: '#E8F4FF' }}>Mở lộ trình học</Button>
              <Button as={RouterLink} to="/shadowing" borderRadius="full" bg="rgba(255,255,255,0.18)" color="white" size="lg" border="1px solid" borderColor="rgba(255,255,255,0.58)" _hover={{ bg: 'rgba(255,255,255,0.26)' }}>Luyện shadowing</Button>
              <Button as={RouterLink} to="/words" borderRadius="full" bg="rgba(255,255,255,0.18)" color="white" size="lg" border="1px solid" borderColor="rgba(255,255,255,0.58)" _hover={{ bg: 'rgba(255,255,255,0.26)' }}>Ôn từ vựng</Button>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

function SeoMiniToolCard({ page }: { page: SeoPage }) {
  const { tool } = page;

  return (
    <Box bg="linear-gradient(135deg, rgba(236,253,245,0.92), rgba(232,244,255,0.94))" border="1px solid" borderColor="rgba(125,211,252,0.92)" borderRadius="3xl" p={{ base: '4', md: '6' }} boxShadow="0 18px 48px rgba(31,111,214,0.10)">
      <HStack mb="3" color={OCEAN_TOKENS.deepBlue} align="start">
        <Icon as={Sparkles} />
        <Box minW="0">
          <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950">{tool.title}</Text>
          <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.75">{tool.intro}</Text>
        </Box>
      </HStack>

      {tool.sampleSentence && (
        <Box mt="4" bg="white" border="1px solid" borderColor="rgba(186,230,253,0.86)" borderRadius="2xl" p="4">
          <Text fontSize="xs" fontWeight="950" color={OCEAN_TOKENS.deepBlue} textTransform="uppercase" letterSpacing="0.08em">Câu mẫu của Poo</Text>
          <Text mt="2" color={OCEAN_TOKENS.text} fontSize={{ base: 'lg', md: 'xl' }} fontWeight="900" lineHeight="1.65">“{tool.sampleSentence}”</Text>
        </Box>
      )}

      {tool.transcript && (
        <Box mt="4" bg="rgba(248,252,255,0.96)" border="1px dashed" borderColor={OCEAN_TOKENS.borderStrong} borderRadius="2xl" p="4">
          <Text fontSize="xs" fontWeight="950" color={OCEAN_TOKENS.deepBlue} textTransform="uppercase" letterSpacing="0.08em">Transcript mini</Text>
          <Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="750" lineHeight="1.75">{tool.transcript}</Text>
        </Box>
      )}

      {tool.comparison && (
        <SimpleGrid mt="4" columns={{ base: 1, md: 3 }} gap="3">
          {tool.comparison.map((item) => (
            <Box key={item.label} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4">
              <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">{item.label}</Text>
              <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.65">{item.value}</Text>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {tool.checklist && (
        <SimpleGrid mt="4" columns={{ base: 1, md: 2 }} gap="3">
          {tool.checklist.map((item, index) => (
            <Box key={item} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="3.5">
              <Text color={OCEAN_TOKENS.text} fontWeight="850">{index + 1}. {item}</Text>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {tool.words && (
        <SimpleGrid mt="4" columns={{ base: 1, md: 2 }} gap="3">
          {tool.words.map((item) => (
            <Box key={item.word} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4">
              <HStack justify="space-between" align="start" gap="3">
                <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950" fontSize="lg">{item.word}</Text>
                <Text color={OCEAN_TOKENS.muted} fontWeight="850">{item.meaning}</Text>
              </HStack>
              <Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.65">{item.example}</Text>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {tool.quiz && (
        <VStack mt="4" align="stretch" gap="3">
          {tool.quiz.map((item, index) => (
            <Box key={`${item.prompt}-${index}`} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4">
              <Text color={OCEAN_TOKENS.text} fontWeight="900">Câu đố {index + 1}: {item.prompt}</Text>
              <Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.65">Poo gợi ý: {item.answer}</Text>
            </Box>
          ))}
        </VStack>
      )}

      <HStack mt="5" wrap="wrap" gap="3">
        <Button as={RouterLink} to={tool.primaryCta.to} borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" rightIcon={<Icon as={ChevronRight} />} _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>
          {tool.primaryCta.label}
        </Button>
        {tool.secondaryCta && (
          <Button as={RouterLink} to={tool.secondaryCta.to} borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
            {tool.secondaryCta.label}
          </Button>
        )}
      </HStack>
    </Box>
  );
}

function SeoPageContent({ page }: { page: SeoPage }) {
  const childPosts = BLOG_POSTS.filter((post) => page.childPostSlugs.includes(post.slug));

  return (
    <Box bg="linear-gradient(180deg, rgba(232,244,255,0.72), rgba(248,252,255,0.94) 44%, rgba(255,255,255,0.98))" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '4', md: '7' }}>
      <Container maxW="1040px" px="0">
        <VStack align="stretch" gap={{ base: '5', md: '7' }}>
          <Box as="article" className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.9)" bg="rgba(255,255,255,0.84)" borderRadius={{ base: '30px', md: '42px' }} p={{ base: '5', md: '9' }} boxShadow="0 26px 80px rgba(31,111,214,0.13)" position="relative" overflow="hidden">
            <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 12% 18%, rgba(91,188,235,0.22), transparent 24%), radial-gradient(circle at 90% 12%, rgba(255,255,255,0.9), transparent 18%), radial-gradient(circle at 70% 100%, rgba(31,111,214,0.12), transparent 30%)" />
            <VStack position="relative" align="stretch" gap={{ base: '5', md: '6' }}>
              <VStack align={{ base: 'center', md: 'start' }} textAlign={{ base: 'center', md: 'left' }} gap="4">
                <HStack color={OCEAN_TOKENS.deepBlue} fontWeight="900" letterSpacing="0.08em" textTransform="uppercase" fontSize="xs" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                  <Icon as={Waves} />
                  <Text>{page.eyebrow}</Text>
                  <Text aria-hidden="true">•</Text>
                  <Text>{page.keyword}</Text>
                </HStack>
                <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.05" color={OCEAN_TOKENS.text} maxW="920px">{page.h1}</Text>
                <Text fontSize={{ base: 'md', md: 'xl' }} lineHeight="1.85" color={OCEAN_TOKENS.muted} fontWeight="700" maxW="900px">{page.description}</Text>
                <HStack gap="3" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                  {page.links.slice(0, 4).map((link, index) => (
                    <Button key={link.to} as={RouterLink} to={link.to} borderRadius="full" bg={index === 0 ? OCEAN_TOKENS.deepBlue : 'white'} color={index === 0 ? 'white' : OCEAN_TOKENS.deepBlue} size="lg" border={index === 0 ? undefined : '1px solid'} borderColor={OCEAN_TOKENS.borderStrong} rightIcon={index === 0 ? <Icon as={ChevronRight} /> : undefined} _hover={{ bg: index === 0 ? OCEAN_TOKENS.oceanBlue : OCEAN_TOKENS.softBlue }}>
                      {link.label}
                    </Button>
                  ))}
                </HStack>
              </VStack>

              <SeoMiniToolCard page={page} />

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '5' }}>
                <HStack mb="3" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Sparkles} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950">{page.quickAnswerHeading}</Text>
                </HStack>
                <Text color={OCEAN_TOKENS.text} fontWeight="750" lineHeight="1.9" mb="3">{page.quickAnswer}</Text>
                <VStack align="stretch" gap="2">
                  {page.quickBullets.map((bullet) => <Text key={bullet} color={OCEAN_TOKENS.muted} fontWeight="750" lineHeight="1.7">• {bullet}</Text>)}
                </VStack>
              </Box>

              <VStack align="stretch" gap={{ base: '4', md: '5' }}>
                {page.sections.map((section) => (
                  <Box key={section.heading} bg="rgba(255,255,255,0.90)" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                    <HStack mb="3" color={OCEAN_TOKENS.deepBlue} align="start">
                      <Icon as={BookOpen} />
                      <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" lineHeight="1.25">{section.heading}</Text>
                    </HStack>
                    <VStack align="stretch" gap="3">
                      {section.paragraphs.map((paragraph) => <Text key={paragraph.slice(0, 80)} as="p" color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.9">{paragraph}</Text>)}
                    </VStack>
                  </Box>
                ))}
              </VStack>

              {childPosts.length > 0 && (
                <Box bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                  <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                    <Icon as={Compass} />
                    <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Bài viết trong cụm chủ đề này</Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                    {childPosts.map((post) => (
                      <Button key={post.slug} as={RouterLink} to={getBlogPostPath(post)} justifyContent="start" whiteSpace="normal" h="auto" py="3" variant="outline" borderRadius="2xl" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                        {post.title}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              <Box bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={Compass} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Bài liên quan</Text>
                </HStack>
                <HStack wrap="wrap" gap="3">
                  {page.links.map((link) => (
                    <Button key={`${link.to}-${link.label}`} as={RouterLink} to={link.to} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>{link.label}</Button>
                  ))}
                  <Button as={RouterLink} to="/blog" variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>Blog học tiếng Anh</Button>
                </HStack>
              </Box>

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
                  <Icon as={HelpCircle} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Câu hỏi thường gặp</Text>
                </HStack>
                <VStack align="stretch" gap="3">
                  {page.faqs.map((faq) => (
                    <Box key={faq.question} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p="4">
                      <Text as="h3" fontWeight="900" color={OCEAN_TOKENS.text} mb="2">{faq.question}</Text>
                      <Text color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.75">{faq.answer}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}


function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function markdownHeadings(markdown: string) {
  return markdown
    .split('\n')
    .filter((line) => /^##\s+/.test(line) && !/^###\s+/.test(line))
    .map((line) => {
      const label = line.replace(/^##\s+/, '').trim();
      return { label, id: slugifyHeading(label) };
    });
}

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Box as="strong" key={`${part}-${index}`} color={OCEAN_TOKENS.text} fontWeight="950">{part.slice(2, -2)}</Box>;
    }
    return part;
  });
}

function renderMarkdownTable(lines: string[], key: string) {
  const rows = lines
    .filter((line) => !/^\|\s*-/.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  const [head = [], ...body] = rows;

  return (
    <Box key={key} overflowX="auto" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" bg="white">
      <Box as="table" w="100%" minW="620px" borderCollapse="collapse">
        <Box as="thead" bg="rgba(232,244,255,0.96)">
          <Box as="tr">
            {head.map((cell) => (
              <Box as="th" key={cell} textAlign="left" p="3" color={OCEAN_TOKENS.deepBlue} fontSize="sm" fontWeight="950" borderBottom="1px solid rgba(186,230,253,0.78)">{renderInlineMarkdown(cell)}</Box>
            ))}
          </Box>
        </Box>
        <Box as="tbody">
          {body.map((row, rowIndex) => (
            <Box as="tr" key={`${key}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <Box as="td" key={`${key}-${rowIndex}-${cellIndex}`} p="3" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.7" borderBottom="1px solid rgba(226,242,253,0.86)">{renderInlineMarkdown(cell)}</Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function SafeMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');
  const nodes = [];
  let index = 0;

  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line || /^#\s+/.test(line)) {
      index += 1;
      continue;
    }

    if (line.startsWith('|')) {
      const tableLines = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      nodes.push(renderMarkdownTable(tableLines, `table-${index}`));
      continue;
    }

    if (/^###\s+/.test(line) || /^##\s+/.test(line)) {
      const level = line.startsWith('###') ? 'h3' : 'h2';
      const label = line.replace(/^###?\s+/, '').replace(/^#\s+/, '').trim();
      nodes.push(
        <Text key={`${level}-${index}`} id={level === 'h2' ? slugifyHeading(label) : undefined} as={level} scrollMarginTop="96px" fontSize={level === 'h2' ? { base: 'xl', md: '2xl' } : { base: 'lg', md: 'xl' }} fontWeight="950" color={OCEAN_TOKENS.text} lineHeight="1.28" mt={level === 'h2' ? '2' : '1'}>
          {renderInlineMarkdown(label)}
        </Text>
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
        index += 1;
      }
      nodes.push(
        <VStack key={`list-${index}`} as="ul" align="stretch" gap="2" pl="0" m="0">
          {items.map((item, itemIndex) => (
            <HStack key={`${item}-${itemIndex}`} as="li" align="start" gap="3" listStyleType="none" bg="rgba(248,252,255,0.84)" border="1px solid" borderColor="rgba(186,230,253,0.58)" borderRadius="2xl" p="3">
              <Text color={OCEAN_TOKENS.oceanBlue} fontWeight="950">•</Text>
              <Text color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.75">{renderInlineMarkdown(item)}</Text>
            </HStack>
          ))}
        </VStack>
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,3}\s+/.test(lines[index].trim()) && !lines[index].trim().startsWith('|') && !/^[-*]\s+/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    nodes.push(
      <Text key={`p-${index}`} as="p" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.9">
        {renderInlineMarkdown(paragraph.join(' '))}
      </Text>
    );
  }

  return <VStack align="stretch" gap="4">{nodes}</VStack>;
}

function SeoV3MiniToolCard({ page }: { page: SeoV3Top1Page }) {
  const banks = seoV3SupplementBanks as Record<string, any>;
  const vocabulary = (banks.vocabulary500 ?? []).slice(0, 6);
  const roadmap = (banks.roadmap48Days ?? []).slice(0, 4);
  const challenge = (banks.challenge30Days ?? []).slice(0, 4);
  const prompts = (banks.speakingPrompts ?? []).slice(0, 3);
  const mistakes = (banks.pronunciationMistakes ?? []).slice(0, 3);
  const shadowing = (banks.shadowingSentences ?? []).slice(0, 4);
  const listening = (banks.listeningScripts ?? []).slice(0, 2);
  const grammarExercises = (banks.grammarExercises ?? []).slice(0, 4);
  const grammarTopics = Object.entries(banks.grammarTopics ?? {}).slice(0, 3) as Array<[string, any]>;

  return (
    <Box bg="linear-gradient(135deg, rgba(236,253,245,0.92), rgba(232,244,255,0.96))" border="1px solid" borderColor="rgba(125,211,252,0.92)" borderRadius="3xl" p={{ base: '4', md: '6' }} boxShadow="0 18px 48px rgba(31,111,214,0.10)">
      <HStack mb="4" color={OCEAN_TOKENS.deepBlue} align="start">
        <Icon as={Sparkles} />
        <Box minW="0">
          <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950">Mini tool học thử theo cụm {page.cluster}</Text>
          <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.75">{page.miniToolDescription}</Text>
        </Box>
      </HStack>

      {page.cluster === 'foundation' && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {[...roadmap, ...challenge].slice(0, 6).map((item: any) => (
            <Box key={`${item.day}-${item.theme ?? item.mission}`} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4">
              <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">Ngày {item.day}: {item.theme ?? item.mission}</Text>
              <Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.65">{item.task ?? item.doneWhen}</Text>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {page.cluster === 'free' && (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
          {[['từ vựng', '/words'], ['Shadowing', '/shadowing'], ['Speaking AI', '/speaking-coach']].map(([label, to]) => (
            <Box key={label} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4">
              <Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">Học thử {label}</Text>
              <Text mt="1" color={OCEAN_TOKENS.muted} fontWeight="700">Miễn phí để bắt đầu, đăng nhập khi muốn lộ trình.</Text>
              <Button mt="3" as={RouterLink} to={to} size="sm" borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white">Mở thử</Button>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {page.cluster === 'speaking' && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {prompts.map((item: any) => <Box key={item.id} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4"><Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">{item.promptVi}</Text><Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700">Starter: {item.starter}</Text></Box>)}
          {mistakes.map((item: any) => <Box key={item.id} bg="rgba(248,252,255,0.96)" border="1px dashed" borderColor={OCEAN_TOKENS.borderStrong} borderRadius="2xl" p="4"><Text color={OCEAN_TOKENS.text} fontWeight="900">Lỗi hay gặp: {item.mistake ?? item.title ?? item.sound}</Text><Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700">Poo gợi ý: {item.fix ?? item.tip ?? item.example}</Text></Box>)}
        </SimpleGrid>
      )}

      {page.cluster === 'shadowing' && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {shadowing.map((item: any) => <Box key={item.id} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4"><Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">“{item.text}”</Text><Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700">{item.translationVi} · {item.focus}</Text></Box>)}
        </SimpleGrid>
      )}

      {page.cluster === 'listening' && (
        <VStack align="stretch" gap="3">
          {listening.map((item: any) => <Box key={item.id} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4"><Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">{item.title}</Text><Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700" lineHeight="1.7">{item.script}</Text><Text mt="2" color={OCEAN_TOKENS.text} fontWeight="850">Dictation: {item.dictation}</Text></Box>)}
        </VStack>
      )}

      {page.cluster === 'vocab' && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {vocabulary.map((item: any) => <Box key={item.id} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4"><HStack justify="space-between"><Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">{item.word}</Text><Text color={OCEAN_TOKENS.muted} fontWeight="850">{item.cefr}</Text></HStack><Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700">{item.meaningVi} · {item.example}</Text></Box>)}
        </SimpleGrid>
      )}

      {page.cluster === 'grammar' && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {grammarTopics.map(([key, item]) => <Box key={key} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="2xl" p="4"><Text color={OCEAN_TOKENS.deepBlue} fontWeight="950">{key}: {item.formula}</Text><Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700">{item.examples?.[0]}</Text></Box>)}
          {grammarExercises.map((item: any) => <Box key={item.id} bg="rgba(248,252,255,0.96)" border="1px dashed" borderColor={OCEAN_TOKENS.borderStrong} borderRadius="2xl" p="4"><Text color={OCEAN_TOKENS.text} fontWeight="900">{item.question}</Text><Text mt="2" color={OCEAN_TOKENS.muted} fontWeight="700">Đáp án: {item.answer}</Text></Box>)}
        </SimpleGrid>
      )}

      <HStack mt="5" wrap="wrap" gap="3">
        <Button as={RouterLink} to={page.cluster === 'speaking' ? '/speaking-coach' : page.cluster === 'shadowing' ? '/shadowing' : page.cluster === 'vocab' ? '/words' : '/learning-path'} borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" rightIcon={<Icon as={ChevronRight} />} _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>Học thử cùng Poo</Button>
        <Button as={RouterLink} to="/hoc-tieng-anh-mien-phi" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>Xem tài nguyên miễn phí</Button>
      </HStack>
    </Box>
  );
}

function SeoV3Top1Content({ page }: { page: SeoV3Top1Page }) {
  const headings = markdownHeadings(page.bodyMarkdown);

  return (
    <Box bg="linear-gradient(180deg, rgba(232,244,255,0.72), rgba(248,252,255,0.94) 44%, rgba(255,255,255,0.98))" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '4', md: '7' }}>
      <Container maxW="1040px" px="0">
        <VStack align="stretch" gap={{ base: '5', md: '7' }}>
          <Box as="article" className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.9)" bg="rgba(255,255,255,0.86)" borderRadius={{ base: '30px', md: '42px' }} p={{ base: '5', md: '9' }} boxShadow="0 26px 80px rgba(31,111,214,0.13)" position="relative" overflow="hidden">
            <VStack align="stretch" gap={{ base: '5', md: '6' }}>
              <VStack align={{ base: 'center', md: 'start' }} textAlign={{ base: 'center', md: 'left' }} gap="4">
                <HStack color={OCEAN_TOKENS.deepBlue} fontWeight="900" letterSpacing="0.08em" textTransform="uppercase" fontSize="xs" wrap="wrap" justify={{ base: 'center', md: 'start' }}><Icon as={Waves} /><Text>SEO V3 Top-1 · {page.cluster}</Text></HStack>
                <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.05" color={OCEAN_TOKENS.text}>{page.h1}</Text>
                <Text fontSize={{ base: 'md', md: 'xl' }} lineHeight="1.85" color={OCEAN_TOKENS.muted} fontWeight="700">{page.description}</Text>
              </VStack>

              <SeoV3MiniToolCard page={page} />

              {headings.length > 0 && (
                <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '5' }}>
                  <HStack mb="3" color={OCEAN_TOKENS.deepBlue}><Icon as={Compass} /><Text as="h2" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="950">Mục lục bọt biển</Text></HStack>
                  <HStack wrap="wrap" gap="2.5">{headings.map((heading) => <Button key={heading.id} as="a" href={`#${heading.id}`} size="sm" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} border="1px solid" borderColor={OCEAN_TOKENS.borderStrong}>{heading.label}</Button>)}</HStack>
                </Box>
              )}

              <Box bg="rgba(255,255,255,0.92)" border="1px solid" borderColor="rgba(186,230,253,0.78)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <SafeMarkdown markdown={page.bodyMarkdown} />
              </Box>

              <Box bg="rgba(255,255,255,0.88)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}><Icon as={Compass} /><Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Bơi tiếp đến trang liên quan</Text></HStack>
                <HStack wrap="wrap" gap="3">{page.internalLinks.map((link) => <Button key={link.href} as={RouterLink} to={link.href} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>{link.label}</Button>)}</HStack>
              </Box>

              <Box bg="rgba(248,252,255,0.94)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
                <HStack mb="4" color={OCEAN_TOKENS.deepBlue}><Icon as={HelpCircle} /><Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Câu hỏi thường gặp</Text></HStack>
                <VStack align="stretch" gap="3">{page.faqs.map((faq) => <Box key={faq.question} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p="4"><Text as="h3" fontWeight="900" color={OCEAN_TOKENS.text} mb="2">{faq.question}</Text><Text color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.75">{faq.answer}</Text></Box>)}</VStack>
              </Box>
            </VStack>
          </Box>

          <Box textAlign="center" bg="linear-gradient(135deg, rgba(31,111,214,0.95), rgba(91,188,235,0.9))" color="white" borderRadius="3xl" p={{ base: '5', md: '7' }} boxShadow="0 24px 70px rgba(31,111,214,0.22)">
            <Icon as={BookOpen} boxSize="8" mb="3" />
            <Text as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" mb="3">Bắtừ vựng học nhỏ cùng Poo</Text>
            <Text maxW="720px" mx="auto" lineHeight="1.8" fontWeight="700" opacity="0.94" mb="5">Trang này mở công khai để bạn học thử ngay. Khi muốn lưu dấu chân hôm nay, hãy vào lộ trình học cùng cá voi Poo.</Text>
            <HStack justify="center" gap="3" wrap="wrap"><Button as={RouterLink} to="/learning-path" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lộ trình học</Button><Button as={RouterLink} to="/speaking-coach" borderRadius="full" bg="rgba(255,255,255,0.18)" color="white" size="lg" border="1px solid" borderColor="rgba(255,255,255,0.58)">Luyện nói với AI</Button></HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export function SeoLandingPage() {
  const location = useLocation();
  const v3Page = getSeoV3Top1PageByPath(location.pathname);
  const reviewPage = getReviewSeoPageByPath(location.pathname);
  const seoPage = getSeoPageByPath(location.pathname);
  const content = LANDINGS[location.pathname] ?? LANDINGS['/'];

  if (v3Page) return <SeoV3Top1Content page={v3Page} />;
  if (reviewPage) return <ReviewSeoContent page={reviewPage} />;
  if (seoPage) return <SeoPageContent page={seoPage} />;

  return (
    <Box bg="linear-gradient(180deg, rgba(232,244,255,0.72), rgba(248,252,255,0.94) 44%, rgba(255,255,255,0.98))" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} py={{ base: '4', md: '7' }}>
      <Container maxW="1120px" px="0">
        <VStack align="stretch" gap={{ base: '5', md: '7' }}>
          <Box className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.9)" bg="rgba(255,255,255,0.82)" borderRadius={{ base: '30px', md: '42px' }} p={{ base: '5', md: '9' }} boxShadow="0 26px 80px rgba(31,111,214,0.13)" position="relative" overflow="hidden">
            <Box aria-hidden="true" position="absolute" inset="0" bg="radial-gradient(circle at 12% 18%, rgba(91,188,235,0.22), transparent 24%), radial-gradient(circle at 90% 12%, rgba(255,255,255,0.9), transparent 18%), radial-gradient(circle at 70% 100%, rgba(31,111,214,0.12), transparent 30%)" />
            <VStack position="relative" align={{ base: 'center', md: 'start' }} textAlign={{ base: 'center', md: 'left' }} gap="4">
              <HStack color={OCEAN_TOKENS.deepBlue} fontWeight="900" letterSpacing="0.08em" textTransform="uppercase" fontSize="xs">
                <Icon as={Waves} />
                <Text>{content.eyebrow}</Text>
              </HStack>
              <Text as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.05" color={OCEAN_TOKENS.text} maxW="880px">
                {content.title}
              </Text>
              <Text fontSize={{ base: 'md', md: 'xl' }} lineHeight="1.85" color={OCEAN_TOKENS.muted} fontWeight="700" maxW="860px">
                {content.intro}
              </Text>
              <HStack gap="3" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                <Button as={RouterLink} to={content.ctaTo} borderRadius="full" bg={OCEAN_TOKENS.deepBlue} color="white" size="lg" rightIcon={<Icon as={ChevronRight} />} _hover={{ bg: OCEAN_TOKENS.oceanBlue }}>
                  {content.ctaLabel}
                </Button>
                <Button as={RouterLink} to={content.secondaryCtaTo ?? '/gioi-thieu'} borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                  {content.secondaryCtaLabel ?? 'Tìm hiểu PooEnglish'}
                </Button>
              </HStack>
            </VStack>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
            {content.sections.map((section) => (
              <Box key={section.heading} bg="rgba(255,255,255,0.82)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }} boxShadow="0 14px 34px rgba(31,111,214,0.07)">
                <HStack mb="3" color={OCEAN_TOKENS.deepBlue} align="start">
                  <Icon as={Sparkles} />
                  <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" lineHeight="1.25">{section.heading}</Text>
                </HStack>
                <Text as="p" color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.9">{section.body}</Text>
              </Box>
            ))}
          </SimpleGrid>

          <Box bg="rgba(255,255,255,0.86)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
            <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
              <Icon as={Compass} />
              <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Bơi tiếp đến các vùng học liên quan</Text>
            </HStack>
            <HStack wrap="wrap" gap="3">
              {content.links.map((link) => (
                <Button key={link.to} as={RouterLink} to={link.to} variant="outline" borderRadius="full" borderColor={OCEAN_TOKENS.borderStrong} color={OCEAN_TOKENS.deepBlue} bg="white" _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                  {link.label}
                </Button>
              ))}
            </HStack>
          </Box>

          <Box bg="rgba(248,252,255,0.90)" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" p={{ base: '4', md: '6' }}>
            <HStack mb="4" color={OCEAN_TOKENS.deepBlue}>
              <Icon as={HelpCircle} />
              <Text as="h2" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Câu hỏi thường gặp</Text>
            </HStack>
            <VStack align="stretch" gap="3">
              {content.faqs.map((faq) => (
                <Box key={faq.question} bg="white" border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" p="4">
                  <Text as="h3" fontWeight="900" color={OCEAN_TOKENS.text} mb="2">{faq.question}</Text>
                  <Text color={OCEAN_TOKENS.muted} fontWeight="650" lineHeight="1.75">{faq.answer}</Text>
                </Box>
              ))}
            </VStack>
          </Box>

          <Box textAlign="center" bg="linear-gradient(135deg, rgba(31,111,214,0.95), rgba(91,188,235,0.9))" color="white" borderRadius="3xl" p={{ base: '5', md: '7' }} boxShadow="0 24px 70px rgba(31,111,214,0.22)">
            <Icon as={BookOpen} boxSize="8" mb="3" />
            <Text as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" mb="3">{content.ctaTitle ?? 'Sẵn sàng bơi một bước nhỏ hôm nay?'}</Text>
            <Text maxW="720px" mx="auto" lineHeight="1.8" fontWeight="700" opacity="0.94" mb="5">
              {content.ctaBody ?? 'Poo không cần bạn học hoàn hảo. Poo chỉ cần bạn mở bài, thử một câu, nhặt một từ và quay lại vào ngày mai. Những bước nhỏ sẽ làm đại dương tiếng Anh bớt rộng hơn.'}
            </Text>
            <Button as={RouterLink} to={content.ctaTo} borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" _hover={{ bg: '#E8F4FF' }}>
              {content.ctaLabel}
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
