import { Box, Button, Container, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { BookOpen, ChevronRight, Compass, HelpCircle, Sparkles, Waves } from 'lucide-react';
import { Icon } from '@chakra-ui/react';
import { OCEAN_TOKENS } from '../components/p-english/OceanBackdrop';
import { getReviewSeoPageByPath, REVIEW_SEO_PATHS, type ReviewSeoPage } from '../data/reviewSeoPages';
import { BLOG_POSTS, getBlogPostPath } from '../data/blogPosts';
import { getSeoPageByPath, SEO_PAGE_PATHS, type SeoPage } from '../data/seoPagesData';

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
  ...SEO_PAGE_PATHS,
] as const;

const commonFaqs = {
  login: {
    question: 'Có cần đăng nhập để học trên PooEnglish không?',
    answer: 'Không bắt buộc. Bạn có thể vào học ở chế độ khách trước. Khi muốn lưu tiến độ lâu dài, Poo sẽ mời bạn đăng nhập nhẹ nhàng bằng Google.',
  },
  beginner: {
    question: 'Người mất gốc có học được không?',
    answer: 'Có. PooEnglish chia bài rất nhỏ, ưu tiên câu quen thuộc, từ vựng gần đời sống và nhịp ôn lại đều để người mới không bị ngợp.',
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
    title: 'Học tiếng Anh cùng PooEnglish',
    intro: 'PooEnglish là nơi học tiếng Anh dành cho người Việt muốn bắt đầu lại một cách thân thiện. Thay vì ép bạn học thật nhiều trong một lần, Poo chia hành trình thành những bước nhỏ: học một cụm từ, nghe một câu, nói lại một nhịp, làm vài câu kiểm tra và quay lại ôn đúng phần còn yếu.',
    sections: [
      {
        heading: 'Vì sao PooEnglish phù hợp để bắt đầu?',
        body: 'Nhiều người sợ tiếng Anh vì từng học quá nhiều quy tắc nhưng lại không dùng được trong tình huống thật. PooEnglish đi theo hướng ngược lại: bắt đầu bằng câu gần gũi, giải thích vừa đủ, rồi cho bạn luyện lại trong các hoạt động ngắn. Cá voi Poo không vội vàng kéo bạn ra biển lớn; Poo đứng cạnh bờ, đưa từng chiếc phao nhỏ để bạn làm quen với âm, từ và mẫu câu.',
      },
      {
        heading: 'Một ngày học trên PooEnglish diễn ra thế nào?',
        body: 'Bạn có thể mở lộ trình, chọn bài hôm nay và đi theo vòng học nhỏ: nhìn từ mới, nghe câu mẫu, đọc nghĩa, nói lại, làm quiz, rồi lưu phần cần ôn. Mỗi hoạt động được thiết kế để không chiếm quá nhiều năng lượng. Nếu bạn bận, chỉ học một bài ngắn vẫn có giá trị.',
      },
      {
        heading: 'Poo giúp bạn học cả nghe, nói, từ vựng và ngữ pháp',
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
      { question: 'PooEnglish khác gì một app flashcard thông thường?', answer: 'PooEnglish kết hợp lộ trình, ngữ cảnh, nghe nói, quiz và ôn lỗi sai. Từ vựng không đứng một mình mà được đặt trong câu và hoạt động học cụ thể.' },
      { question: 'Tôi nên bắt đầu ở trang nào?', answer: 'Nếu bạn mới hoàn toàn, hãy vào lộ trình hoặc khóa 48 ngày lấy gốc. Nếu muốn luyện phát âm, hãy thử shadowing tiếng Anh cùng Poo.' },
    ],
    links: [
      { label: 'Lộ trình học tiếng Anh', to: '/lo-trinh-hoc-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      { label: 'Shadowing tiếng Anh', to: '/shadowing-tieng-anh' },
    ],
    ctaLabel: 'Vào học cùng Poo',
    ctaTo: '/learning-path',
  },
  '/hoc-tieng-anh': {
    path: '/hoc-tieng-anh',
    eyebrow: 'Bắt đầu cùng cá voi Poo',
    title: 'Học tiếng Anh cùng PooEnglish: nhẹ nhàng, đều đặn và có lộ trình',
    intro: 'PooEnglish là nơi học tiếng Anh dành cho người Việt muốn bắt đầu lại một cách thân thiện. Thay vì ép bạn học thật nhiều trong một lần, Poo chia hành trình thành những bước nhỏ: học một cụm từ, nghe một câu, nói lại một nhịp, làm vài câu kiểm tra và quay lại ôn đúng phần còn yếu.',
    sections: [
      {
        heading: 'Vì sao PooEnglish phù hợp để bắt đầu?',
        body: 'Nhiều người sợ tiếng Anh vì từng học quá nhiều quy tắc nhưng lại không dùng được trong tình huống thật. PooEnglish đi theo hướng ngược lại: bắt đầu bằng câu gần gũi, giải thích vừa đủ, rồi cho bạn luyện lại trong các hoạt động ngắn. Cá voi Poo không vội vàng kéo bạn ra biển lớn; Poo đứng cạnh bờ, đưa từng chiếc phao nhỏ để bạn làm quen với âm, từ và mẫu câu. Khi đã thấy một câu tiếng Anh không còn đáng sợ, bạn sẽ dễ học tiếp bài thứ hai, thứ ba và hình thành thói quen ổn định hơn.',
      },
      {
        heading: 'Một ngày học trên PooEnglish diễn ra thế nào?',
        body: 'Bạn có thể mở lộ trình, chọn bài hôm nay và đi theo vòng học nhỏ: nhìn từ mới, nghe câu mẫu, đọc nghĩa, nói lại, làm quiz, rồi lưu phần cần ôn. Mỗi hoạt động được thiết kế để không chiếm quá nhiều năng lượng. Nếu bạn bận, chỉ học một bài ngắn vẫn có giá trị. Nếu bạn có thêm thời gian, bạn có thể bơi sang shadowing, luyện nghe hoặc sổ từ vựng. Điều quan trọng là não được gặp lại tiếng Anh thường xuyên, theo cách dễ chịu, để kiến thức tự nhiên bám lâu hơn.',
      },
      {
        heading: 'Poo giúp bạn học cả nghe, nói, từ vựng và ngữ pháp',
        body: 'PooEnglish không tách kỹ năng thành những hòn đảo rời rạc. Một từ mới sẽ xuất hiện trong câu; một mẫu ngữ pháp sẽ được đặt trong tình huống; một đoạn nghe có thể trở thành bài nói đuổi; một lỗi sai sẽ quay về sổ ôn tập. Nhờ vậy, bạn không chỉ biết nghĩa của từ mà còn hiểu cách dùng. Poo luôn cố giữ giọng văn mềm mại, dễ thương và rõ ràng, để mỗi lần vào học giống như được một bạn cá voi kiên nhẫn nhắc: mình bơi chậm cũng được, miễn là hôm nay vẫn bơi.',
      },
      {
        heading: 'Học miễn phí trước, đăng nhập sau cũng được',
        body: 'PooEnglish ưu tiên việc vào học nhanh. Trang học công khai có thể mở mà không bị kẹt ở đăng nhập. Nếu hệ thống xác nhận tài khoản chậm, bạn vẫn có thể học ở chế độ khách. Cách này giúp người mới chạm vào bài học ngay, không phải đi qua quá nhiều màn hình. Khi bạn thấy PooEnglish hợp với mình, đăng nhập sẽ giúp lưu tiến độ tốt hơn và đồng bộ hành trình học trong tương lai.',
      },
    ],
    faqs: [
      commonFaqs.login,
      commonFaqs.beginner,
      commonFaqs.daily,
      { question: 'PooEnglish khác gì một app flashcard thông thường?', answer: 'PooEnglish kết hợp lộ trình, ngữ cảnh, nghe nói, quiz và ôn lỗi sai. Từ vựng không đứng một mình mà được đặt trong câu và hoạt động học cụ thể.' },
      { question: 'Tôi nên bắt đầu ở trang nào?', answer: 'Nếu bạn mới hoàn toàn, hãy vào lộ trình hoặc khóa 48 ngày lấy gốc. Nếu muốn luyện phát âm, hãy thử shadowing tiếng Anh cùng Poo.' },
    ],
    links: [
      { label: 'Lộ trình học tiếng Anh', to: '/lo-trinh-hoc-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      { label: 'Shadowing tiếng Anh', to: '/shadowing-tieng-anh' },
    ],
    ctaLabel: 'Vào học cùng Poo',
    ctaTo: '/learning-path',
  },
  '/lo-trinh-hoc-tieng-anh': {
    path: '/lo-trinh-hoc-tieng-anh',
    eyebrow: 'Bản đồ bơi của Poo',
    title: 'Lộ trình học tiếng Anh rõ ràng cho người muốn đi từng bước chắc chắn',
    intro: 'Lộ trình học tiếng Anh trên PooEnglish được thiết kế như một bản đồ đại dương nhỏ. Bạn không phải tự hỏi hôm nay học gì, ôn gì hay chuyển sang kỹ năng nào. Poo sắp xếp các chặng học theo thứ tự dễ theo dõi để bạn xây nền trước, luyện phản xạ sau và luôn có điểm quay lại khi cần ôn.',
    sections: [
      { heading: 'Học theo từng nút thay vì học lan man', body: 'Một khó khăn lớn khi tự học tiếng Anh là có quá nhiều tài liệu. Bạn mở một video, lưu một danh sách từ, đọc vài mẹo ngữ pháp rồi không biết nối chúng lại thế nào. PooEnglish biến hành trình ấy thành các nút học nhỏ. Mỗi nút có mục tiêu rõ: nắm một nhóm từ, nghe vài câu, hiểu một mẫu câu, trả lời quiz hoặc luyện nói. Khi hoàn thành, bạn thấy mình vừa đi thêm một bước thật, không chỉ xem thêm nội dung.' },
      { heading: 'Lộ trình cân bằng nhiều kỹ năng', body: 'Poo không muốn bạn chỉ học từ vựng mà quên nghe, cũng không muốn bạn chỉ nghe thật nhiều nhưng không hiểu cấu trúc câu. Vì vậy lộ trình kết hợp từ mới, câu mẫu, nghe, nói, ngữ pháp nhẹ và ôn tập. Các kỹ năng được đặt cạnh nhau như những con sóng nhỏ. Sóng này đẩy sóng kia: biết từ giúp nghe dễ hơn, nghe quen giúp nói tự nhiên hơn, hiểu mẫu câu giúp viết và đọc đỡ rối hơn.' },
      { heading: 'Có chỗ cho người mới và người học lại', body: 'Nếu bạn mất gốc, hãy bắt đầu từ các chặng nền tảng hoặc khóa 48 ngày. Nếu bạn đã biết một ít, bạn vẫn có thể dùng lộ trình để vá lỗ hổng: ôn lại câu căn bản, luyện phản xạ, xem từ nào hay quên. PooEnglish không phán xét trình độ hiện tại. Poo chỉ cần biết hôm nay bạn đang ở đâu để đưa chiếc phao vừa đủ, không quá dễ khiến chán, cũng không quá khó khiến bạn bỏ cuộc.' },
      { heading: 'Tiến độ được giữ nhẹ nhàng', body: 'Mỗi lần hoàn thành bài, Poo ghi nhận bước tiến của bạn. Với người chưa đăng nhập, tiến độ có thể được giữ trên thiết bị để bạn học thử thoải mái. Khi đăng nhập, hành trình có thể được lưu tốt hơn. Tinh thần của PooEnglish là học đều, không tạo áp lực thành tích quá nặng. Một ngày chỉ cần hoàn thành một nút nhỏ cũng là một lần bạn nói với não rằng tiếng Anh vẫn đang hiện diện trong cuộc sống của mình.' },
    ],
    faqs: [
      commonFaqs.beginner,
      commonFaqs.daily,
      { question: 'Lộ trình có bắt buộc đi đúng thứ tự không?', answer: 'Poo khuyến khích đi theo thứ tự nếu bạn mới bắt đầu, nhưng bạn vẫn có thể ghé các trang shadowing, từ vựng hoặc luyện nghe khi muốn đổi nhịp.' },
      { question: 'Lộ trình có phù hợp học trên điện thoại không?', answer: 'Có. Các bài được chia nhỏ để bạn có thể học trên điện thoại trong giờ nghỉ, trước khi ngủ hoặc bất cứ lúc nào có vài phút rảnh.' },
      { question: 'Tôi có thể học không đăng nhập không?', answer: 'Có. PooEnglish không ép đăng nhập để xem lộ trình. Đăng nhập chỉ là lựa chọn khi bạn muốn giữ hành trình lâu dài hơn.' },
    ],
    links: [
      { label: 'Học tiếng Anh', to: '/hoc-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      { label: 'Từ vựng tiếng Anh', to: '/tu-vung-tieng-anh' },
    ],
    ctaLabel: 'Mở bản đồ học',
    ctaTo: '/learning-path',
  },
  '/shadowing-tieng-anh': {
    path: '/shadowing-tieng-anh',
    eyebrow: 'Nói đuổi cùng Poo',
    title: 'Shadowing tiếng Anh: luyện nghe nói theo từng câu nhỏ, bớt ngại miệng',
    intro: 'Shadowing tiếng Anh là cách nghe một câu mẫu rồi nói theo gần như ngay sau đó. Trên PooEnglish, hoạt động này được làm mềm lại: câu ngắn hơn, nhịp rõ hơn, có chỗ lặp lại và có lời nhắc thân thiện để bạn không cảm thấy mình đang bị kiểm tra quá căng.',
    sections: [
      { heading: 'Shadowing giúp tai và miệng đi cùng nhau', body: 'Khi học tiếng Anh, nhiều bạn hiểu nghĩa khi đọc nhưng lại chậm khi nghe hoặc ngại phát âm thành tiếng. Shadowing tạo một chiếc cầu giữa tai và miệng. Bạn nghe câu, bắt nhịp, lặp lại, rồi nhận ra âm tiếng Anh không còn là thứ nằm riêng trong sách. Poo chia đoạn luyện thành từng câu để bạn có thể thử nhiều lần. Mỗi lần lặp không cần hoàn hảo; chỉ cần rõ hơn lần trước một chút là Poo đã vẫy đuôi khen rồi.' },
      { heading: 'Không cần nói hay ngay từ đầu', body: 'PooEnglish không đặt mục tiêu biến bạn thành người bản xứ sau vài buổi. Mục tiêu đầu tiên là dám mở miệng. Bạn có thể nói chậm, nói sai một âm, quên nhấn trọng âm hoặc phải nghe lại nhiều lần. Điều đó bình thường. Bài shadowing trên Poo được thiết kế để bạn thử lại mà không thấy xấu hổ. Khi câu được lặp trong ngữ cảnh dễ hiểu, não sẽ dần nhớ nhịp và miệng sẽ bớt cứng.' },
      { heading: 'Kết hợp với từ vựng và luyện nghe', body: 'Shadowing hiệu quả hơn khi bạn hiểu câu mình đang nói. Vì vậy PooEnglish nối hoạt động này với từ vựng, luyện nghe và lộ trình học. Một câu nói đuổi có thể chứa từ mới đã học, mẫu câu vừa gặp hoặc tình huống đời thường. Bạn không chỉ bắt chước âm thanh mà còn hiểu mình đang diễn đạt điều gì. Đây là điểm quan trọng để shadowing không biến thành đọc vẹt, mà trở thành luyện phản xạ thật sự.' },
      { heading: 'Luyện đều trong thời gian ngắn', body: 'Bạn không cần dành cả giờ để shadowing. Chỉ vài câu mỗi ngày cũng giúp tai quen với nhịp tiếng Anh. Poo khuyến khích bạn chọn một đoạn ngắn, nghe kỹ, nói theo, nghỉ một chút rồi quay lại câu khó. Cách luyện này phù hợp với người bận rộn, người mới học lại hoặc người từng học lâu nhưng vẫn ngại nói. Mỗi câu hoàn thành giống như một bong bóng nhỏ nổi lên: bé thôi, nhưng báo hiệu bạn đang tiến bộ.' },
    ],
    faqs: [
      { question: 'Shadowing có phù hợp cho người mới không?', answer: 'Có, nếu câu đủ ngắn và tốc độ vừa phải. PooEnglish ưu tiên đoạn dễ theo để người mới tập nhịp trước khi thử câu dài hơn.' },
      { question: 'Tôi phát âm chưa tốt thì có nên shadowing không?', answer: 'Nên. Shadowing chính là cách giúp bạn làm quen âm và nhịp. Bạn không cần đúng ngay; hãy nghe lại và nói lại từng chút.' },
      commonFaqs.daily,
      { question: 'Shadowing khác luyện nghe thông thường thế nào?', answer: 'Luyện nghe tập trung vào hiểu. Shadowing thêm bước nói theo, nên giúp tai, miệng và phản xạ phối hợp tốt hơn.' },
      { question: 'Nên học thêm gì cùng shadowing?', answer: 'Bạn nên kết hợp từ vựng, luyện nghe và ngữ pháp mẫu câu để hiểu câu mình đang nói và dùng lại được trong tình huống khác.' },
    ],
    links: [
      { label: 'Luyện nghe tiếng Anh', to: '/luyen-nghe-tieng-anh' },
      { label: 'Từ vựng tiếng Anh', to: '/tu-vung-tieng-anh' },
      { label: 'Mở phòng shadowing', to: '/shadowing' },
    ],
    ctaLabel: 'Thử nói đuổi với Poo',
    ctaTo: '/shadowing',
  },
  '/tu-vung-tieng-anh': {
    path: '/tu-vung-tieng-anh',
    eyebrow: 'Nhặt vỏ sò từ vựng',
    title: 'Từ vựng tiếng Anh: học từ trong câu, ôn lại đúng lúc cùng Poo',
    intro: 'Từ vựng tiếng Anh trên PooEnglish không chỉ là một danh sách để nhìn rồi quên. Poo đặt từ vào câu, vào chủ đề và vào bài luyện để bạn hiểu cách dùng. Mỗi từ giống một vỏ sò nhỏ: nhặt một cái thì vui, gom đều mỗi ngày thì thành cả chiếc túi kiến thức.',
    sections: [
      { heading: 'Học từ bằng ngữ cảnh dễ nhớ hơn', body: 'Một từ tiếng Anh thường có nhiều sắc thái. Nếu chỉ học nghĩa tiếng Việt, bạn có thể biết từ đó nhưng không biết đặt vào câu nào. PooEnglish đưa từ vào ví dụ gần đời sống để bạn thấy từ đang làm việc ra sao. Khi gặp từ trong bài nghe, bài nói hoặc quiz, não được nhắc lại bằng nhiều đường khác nhau. Cách học này chậm hơn việc lướt thật nhiều thẻ từ, nhưng thường bền hơn vì bạn hiểu được bối cảnh sử dụng.' },
      { heading: 'Ôn từ không phải để tự làm khó mình', body: 'Ôn tập trên PooEnglish có tinh thần rất mềm: từ nào chưa quen thì quay lại, câu nào hay nhầm thì đánh dấu, phần nào ổn rồi thì bơi tiếp. Poo không xem lỗi sai là thất bại. Lỗi sai giống những bong bóng báo hiệu chỗ cần thêm oxy. Khi bạn nhìn lại một từ đã quên và nhớ ra sau vài lần, đó là tiến bộ thật. Việc ôn đúng phần cần ôn giúp tiết kiệm thời gian hơn học lại mọi thứ từ đầu.' },
      { heading: 'Từ vựng nối với nghe nói và lộ trình', body: 'PooEnglish cố gắng để từ vựng không nằm riêng trong sổ. Một từ có thể xuất hiện trong lộ trình, trong câu shadowing, trong đoạn luyện nghe hoặc trong bài kiểm tra nhỏ. Nhờ vậy bạn gặp lại từ ở nhiều góc độ: nhìn chữ, nghe âm, nói câu, hiểu nghĩa. Khi các lần gặp được rải ra hợp lý, từ mới dần chuyển từ “mình từng thấy” sang “mình dùng được”.' },
      { heading: 'Phù hợp cho người thích học từng chút', body: 'Không phải ai cũng có thể học 50 từ mỗi ngày. PooEnglish khuyến khích nhịp nhỏ hơn: vài từ quan trọng, vài câu ví dụ, một lượt ôn lại. Cách này phù hợp với người bận, người dễ nản khi danh sách quá dài hoặc người muốn học chắc nền. Poo thích một cuốn sổ từ vựng được mở đều hơn là một kế hoạch thật hoành tráng nhưng chỉ tồn tại hai ngày.' },
    ],
    faqs: [
      { question: 'PooEnglish có sổ từ vựng không?', answer: 'Có. Bạn có thể học và ôn các từ, câu hoặc phần cần nhớ trong khu vực từ vựng và ôn tập của PooEnglish.' },
      { question: 'Nên học bao nhiêu từ mỗi ngày?', answer: 'Nếu mới bắt đầu, 5–10 từ kèm câu ví dụ là đủ tốt. Điều quan trọng là ôn lại và dùng được, không phải ghi thật nhiều.' },
      { question: 'Học từ theo chủ đề có tốt không?', answer: 'Có. Chủ đề giúp não nhóm thông tin lại, nhưng Poo vẫn khuyên đặt từ vào câu để hiểu cách dùng tự nhiên hơn.' },
      commonFaqs.login,
      { question: 'Từ vựng có liên quan đến shadowing không?', answer: 'Có. Khi hiểu từ trong câu shadowing, bạn sẽ nghe và nói tự tin hơn, thay vì chỉ bắt chước âm thanh.' },
    ],
    links: [
      { label: 'Mở sổ từ vựng', to: '/words' },
      { label: 'Học tiếng Anh', to: '/hoc-tieng-anh' },
      { label: 'Ngữ pháp tiếng Anh', to: '/ngu-phap-tieng-anh' },
    ],
    ctaLabel: 'Mở sổ từ cùng Poo',
    ctaTo: '/words',
  },
  '/luyen-nghe-tieng-anh': {
    path: '/luyen-nghe-tieng-anh',
    eyebrow: 'Nghe sóng tiếng Anh',
    title: 'Luyện nghe tiếng Anh: nghe chậm, hiểu chắc, rồi bơi xa hơn',
    intro: 'Luyện nghe tiếng Anh trên PooEnglish bắt đầu từ những đoạn nhỏ, câu rõ và chủ đề gần gũi. Poo không thả bạn ngay vào vùng nước sâu. Trước tiên, Poo giúp bạn nhận ra từ quen, hiểu ý chính, nghe lại câu khó và nối việc nghe với nói để tai quen dần.',
    sections: [
      { heading: 'Nghe không chỉ là bật âm thanh lên', body: 'Nhiều người luyện nghe bằng cách mở video dài rồi hy vọng tai sẽ tự quen. Cách đó có thể hữu ích, nhưng với người mới, nó dễ gây mệt vì quá nhiều âm lạ cùng lúc. PooEnglish chọn cách chia nhỏ. Bạn nghe câu hoặc đoạn ngắn, có mục tiêu rõ: bắt từ khóa, hiểu tình huống, nhận ra mẫu câu hoặc chuẩn bị nói lại. Khi nhiệm vụ nghe cụ thể hơn, bạn biết mình đang luyện điều gì và bớt cảm giác trôi giữa đại dương âm thanh.' },
      { heading: 'Từ vựng quen giúp nghe dễ hơn', body: 'Tai thường không nhận ra âm của một từ nếu não chưa biết từ đó. Vì vậy PooEnglish nối luyện nghe với từ vựng và lộ trình. Trước khi nghe, bạn có thể gặp vài từ chính. Sau khi nghe, bạn thấy lại chúng trong câu. Sự lặp lại này làm đoạn nghe bớt bí ẩn. Dần dần, khi một từ chuyển từ xa lạ thành quen mặt, tai cũng bắt đầu nhận ra nó nhanh hơn.' },
      { heading: 'Luyện nghe và shadowing là đôi bạn thân', body: 'Sau khi nghe hiểu một câu, nói lại câu đó giúp bạn nhớ nhịp và âm tốt hơn. PooEnglish khuyến khích shadowing như bước tiếp theo của luyện nghe. Bạn nghe mẫu, dừng lại, nói theo, rồi nghe lại. Không cần nói hoàn hảo; chỉ cần miệng bắt đầu đi cùng tai. Cách kết hợp này đặc biệt hữu ích cho người hiểu bài đọc nhưng phản xạ nghe nói còn chậm.' },
      { heading: 'Xây sự tự tin bằng đoạn ngắn', body: 'Một đoạn nghe ngắn hoàn thành trọn vẹn có giá trị hơn một bài dài khiến bạn bỏ giữa chừng. Poo muốn mỗi buổi luyện nghe để lại cảm giác “mình làm được”. Khi bạn tích lũy nhiều lần làm được như vậy, sự tự tin tăng lên. Sau đó, bạn có thể thử đoạn dài hơn, tốc độ nhanh hơn hoặc chủ đề mới hơn. Poo sẽ vẫn ở cạnh, nhắc bạn bơi từng nhịp.' },
    ],
    faqs: [
      { question: 'Luyện nghe tiếng Anh nên bắt đầu từ đâu?', answer: 'Hãy bắt đầu bằng câu ngắn, chủ đề quen và có từ vựng nền. Sau đó nghe lại, nhắc theo và ghi chú câu khó.' },
      { question: 'Không nghe kịp thì có sao không?', answer: 'Không sao. Nghe không kịp là dấu hiệu cần giảm tốc, chia nhỏ câu hoặc học trước từ khóa. PooEnglish được thiết kế cho nhịp đó.' },
      commonFaqs.daily,
      { question: 'Có nên vừa nghe vừa nhìn chữ không?', answer: 'Có thể. Người mới có thể nhìn chữ để hiểu trước, sau đó nghe lại không nhìn để tai tập nhận diện âm.' },
      { question: 'Luyện nghe có giúp nói tốt hơn không?', answer: 'Có, đặc biệt khi bạn kết hợp nghe với shadowing. Tai quen nhịp sẽ giúp miệng nói tự nhiên hơn.' },
    ],
    links: [
      { label: 'Shadowing tiếng Anh', to: '/shadowing-tieng-anh' },
      { label: 'Lộ trình học', to: '/lo-trinh-hoc-tieng-anh' },
      { label: 'English Speed', to: '/english-speed' },
    ],
    ctaLabel: 'Vào luyện nghe nói',
    ctaTo: '/shadowing',
  },
  '/ngu-phap-tieng-anh': {
    path: '/ngu-phap-tieng-anh',
    eyebrow: 'Mẫu câu dễ thở',
    title: 'Ngữ pháp tiếng Anh: hiểu bằng mẫu câu đời thường, không học khô cứng',
    intro: 'Ngữ pháp tiếng Anh trên PooEnglish được nhìn như chiếc khung giúp câu đứng vững, không phải một bức tường toàn thuật ngữ. Poo giải thích bằng ví dụ gần gũi, đặt trong bài học nhỏ và cho bạn dùng lại ngay để mẫu câu trở nên thân quen.',
    sections: [
      { heading: 'Ngữ pháp là bản đồ của câu', body: 'Khi gặp một câu tiếng Anh, bạn có thể biết từng từ nhưng vẫn không hiểu vì chưa thấy cấu trúc bên trong. Ngữ pháp giúp bạn nhận ra ai làm gì, việc xảy ra khi nào, ý nào là chính và phần nào bổ sung. PooEnglish không bắt bạn học thuộc định nghĩa dài. Thay vào đó, Poo dùng câu mẫu, màu sắc và hoạt động nhỏ để bạn thấy mẫu câu vận hành. Khi hiểu bản đồ, bạn bơi trong câu đỡ lạc hơn.' },
      { heading: 'Học quy tắc vừa đủ, luyện dùng nhiều hơn', body: 'Một quy tắc ngữ pháp chỉ thật sự có ích khi bạn dùng được nó. Vì vậy PooEnglish ưu tiên giải thích ngắn, ví dụ rõ và bài luyện ngay sau đó. Bạn có thể gặp một mẫu như “I want to…” trong từ vựng, nghe nó trong câu, nói lại trong shadowing và trả lời quiz nhỏ. Sự lặp lại trong nhiều hoạt động giúp mẫu câu đi vào trí nhớ tự nhiên hơn việc đọc một trang lý thuyết dài.' },
      { heading: 'Giảm nỗi sợ sai ngữ pháp', body: 'Rất nhiều người ngại nói vì sợ sai thì, sai giới từ hoặc sai trật tự từ. Poo muốn đổi cảm giác đó. Sai là tín hiệu để chỉnh, không phải lý do để im lặng. Khi bạn chọn nhầm trong quiz, Poo nên giải thích nhẹ: vì sao đáp án đúng phù hợp hơn, câu đó dùng trong hoàn cảnh nào và lần sau nhìn dấu hiệu nào. Cách phản hồi mềm giúp người học dám thử lại.' },
      { heading: 'Ngữ pháp nối với giao tiếp thật', body: 'PooEnglish chọn các mẫu câu có khả năng dùng trong đời sống: giới thiệu bản thân, nói việc hằng ngày, hỏi đường, kể kế hoạch, nói cảm xúc, mô tả đồ vật. Khi mẫu câu gắn với tình huống, ngữ pháp bớt xa lạ. Bạn không chỉ học “cấu trúc” mà học một cách diễn đạt. Dần dần, bạn có thể tự thay từ vào khung câu và tạo câu của riêng mình.' },
    ],
    faqs: [
      { question: 'Có cần học ngữ pháp trước khi luyện nói không?', answer: 'Không cần học hết trước. Bạn có thể học một mẫu câu nhỏ rồi luyện nói ngay. Dùng được mẫu nào chắc mẫu đó.' },
      { question: 'PooEnglish giải thích ngữ pháp theo cách nào?', answer: 'Poo ưu tiên ví dụ, tình huống và bài luyện ngắn. Mục tiêu là hiểu để dùng, không phải ghi nhớ thuật ngữ thật dài.' },
      commonFaqs.beginner,
      { question: 'Sai ngữ pháp nhiều có nên tiếp tục nói không?', answer: 'Có. Nói giúp bạn phát hiện chỗ cần sửa. Poo khuyến khích sửa nhẹ từng lỗi thay vì chờ đúng hoàn toàn mới bắt đầu.' },
      { question: 'Ngữ pháp có liên quan đến từ vựng không?', answer: 'Có. Từ vựng cần mẫu câu để dùng đúng, còn ngữ pháp cần từ vựng để tạo câu có nghĩa.' },
    ],
    links: [
      { label: 'Từ vựng tiếng Anh', to: '/tu-vung-tieng-anh' },
      { label: '48 ngày lấy gốc', to: '/48-ngay-lay-goc' },
      { label: 'Lộ trình học', to: '/lo-trinh-hoc-tieng-anh' },
    ],
    ctaLabel: 'Học mẫu câu cùng Poo',
    ctaTo: '/learning-path',
  },
  '/48-ngay-lay-goc': {
    path: '/48-ngay-lay-goc',
    eyebrow: 'Chuyến bơi 48 ngày',
    title: '48 ngày lấy gốc tiếng Anh cùng PooEnglish cho người muốn bắt đầu lại',
    intro: 'Khóa 48 ngày lấy gốc trên PooEnglish dành cho người từng học tiếng Anh nhưng bị rỗng nền, hoặc người mới muốn có một kế hoạch rõ ràng. Mỗi ngày là một chặng nhỏ để bạn xây lại từ vựng, mẫu câu, nghe, nói và thói quen học đều.',
    sections: [
      { heading: '48 ngày không phải cuộc đua', body: 'Tên gọi 48 ngày giúp bạn có một khung thời gian cụ thể, nhưng Poo không xem đây là cuộc đua tốc độ. Nếu một ngày bạn bận, bạn có thể quay lại. Nếu một bài khó, bạn có thể lặp thêm. Điều quan trọng là có đường đi rõ: hôm nay học gì, ngày mai nối tiếp ra sao, phần nào cần ôn. Với người mất gốc, cảm giác có bản đồ thường quan trọng hơn lượng kiến thức thật lớn.' },
      { heading: 'Mỗi ngày học một gói nhỏ', body: 'Một ngày trong khóa nên gồm các phần vừa đủ: vài từ chính, một số câu mẫu, một điểm ngữ pháp nhỏ, hoạt động nghe nói và bài kiểm tra nhẹ. Cách chia này giúp não không bị quá tải. Bạn không cần ghi nhớ mọi thứ ngay lập tức. Poo sẽ để kiến thức quay lại qua ôn tập và bài sau. Giống như bơi đường dài, nhịp thở đều quan trọng hơn cú quẫy thật mạnh ban đầu.' },
      { heading: 'Xây lại nền bằng câu dùng được', body: 'Người mất gốc thường cần cảm giác “mình nói được một câu hoàn chỉnh” càng sớm càng tốt. Vì vậy PooEnglish ưu tiên mẫu câu đời thường: giới thiệu, hỏi đáp, nói thói quen, diễn tả mong muốn, kể việc đơn giản. Khi bạn dùng được câu thật, động lực sẽ tăng. Từ đó, việc học ngữ pháp hay từ vựng không còn là ghi nhớ rời rạc mà trở thành cách làm câu của mình rõ hơn.' },
      { heading: 'Kết nối với lộ trình lớn của PooEnglish', body: 'Khóa 48 ngày không đứng riêng. Sau mỗi chặng, bạn có thể đi tiếp vào lộ trình học, shadowing, luyện nghe, từ vựng hoặc ôn tập. Những gì bạn học trong khóa là nền để bơi xa hơn. Poo muốn bạn kết thúc 48 ngày với cảm giác tiếng Anh đã có chỗ đứng trong lịch sinh hoạt, và bạn biết mình nên học tiếp theo hướng nào.' },
    ],
    faqs: [
      commonFaqs.beginner,
      { question: 'Nếu không hoàn thành đúng 48 ngày thì sao?', answer: 'Không sao. Bạn có thể học chậm hơn. PooEnglish coi việc quay lại tiếp tục là một phần bình thường của hành trình.' },
      { question: 'Khóa này tập trung kỹ năng nào?', answer: 'Khóa tập trung nền tổng hợp: từ vựng, mẫu câu, nghe, nói, ngữ pháp căn bản và thói quen ôn tập.' },
      commonFaqs.login,
      { question: 'Sau 48 ngày nên học gì tiếp?', answer: 'Bạn có thể tiếp tục lộ trình học, luyện shadowing, mở sổ từ vựng hoặc luyện nghe nói theo nhu cầu yếu nhất của mình.' },
    ],
    links: [
      { label: 'Mở khóa học trong app', to: '/luyen-tieng-anh/48-ngay-lay-goc' },
      { label: 'Lộ trình học tiếng Anh', to: '/lo-trinh-hoc-tieng-anh' },
      { label: 'Ngữ pháp tiếng Anh', to: '/ngu-phap-tieng-anh' },
    ],
    ctaLabel: 'Bắt đầu ngày 1',
    ctaTo: '/luyen-tieng-anh/48-ngay-lay-goc',
  },
  '/gioi-thieu': {
    path: '/gioi-thieu',
    eyebrow: 'Xin chào từ đại dương Poo',
    title: 'Giới thiệu PooEnglish: website học tiếng Anh thân thiện cùng cá voi Poo',
    intro: 'PooEnglish được tạo ra với một ý tưởng đơn giản: học tiếng Anh sẽ dễ bền hơn khi người học cảm thấy được đồng hành. Mascot cá voi Poo xuất hiện như một người bạn nhỏ, giúp bài học bớt khô, lời nhắc bớt căng và hành trình dài trở nên có cảm xúc hơn.',
    sections: [
      { heading: 'PooEnglish tin vào bước học nhỏ', body: 'Không phải ai cũng có thời gian, năng lượng hoặc sự tự tin để học tiếng Anh nhiều giờ mỗi ngày. PooEnglish chọn triết lý nhỏ mà đều: một bài ngắn, một câu nói lại, một nhóm từ, một lỗi được sửa. Khi các bước nhỏ lặp lại, chúng tạo thành nền tảng. Cá voi Poo không hô khẩu hiệu thật to; Poo chỉ nhẹ nhàng nhắc bạn mở bài hôm nay và bơi thêm vài nhịp.' },
      { heading: 'Thương hiệu xoay quanh sự thân thiện', body: 'PooEnglish muốn Google và người học nhận diện đây là một website học tiếng Anh có tinh thần dễ thương, an toàn và rõ ràng. Tên PooEnglish gắn với Poo, chú cá voi nhỏ dẫn đường qua các vùng học: lộ trình, 48 ngày lấy gốc, shadowing, từ vựng, luyện nghe và ngữ pháp. Mỗi trang công khai đều cố gắng giải thích bằng tiếng Việt tự nhiên để người mới hiểu mình sắp học gì trước khi vào bài tương tác.' },
      { heading: 'Học được cả khi chưa đăng nhập', body: 'Một phần quan trọng của trải nghiệm là không chặn người học ở cổng vào. PooEnglish cho phép xem và bắt đầu học ở chế độ khách. Đăng nhập giúp lưu hành trình tốt hơn, nhưng không phải bức tường bắt buộc trước khi bạn được nhìn thấy nội dung. Điều này cũng giúp các trang công khai thân thiện hơn với công cụ tìm kiếm: Google có thể thấy cấu trúc, nội dung và liên kết quan trọng thay vì một màn hình chờ kéo dài.' },
      { heading: 'PooEnglish đang phát triển như một đại dương học tập', body: 'Hành trình của PooEnglish không dừng ở một trang duy nhất. Website đang kết nối nhiều mảnh học: khóa nền tảng, bản đồ kỹ năng, shadowing, luyện nghe nói, sổ từ vựng và ôn tập cá nhân. Mục tiêu là giúp người học Việt Nam có một nơi quay lại mỗi ngày, vừa đủ vui để không bỏ cuộc, vừa đủ rõ để thấy mình đang tiến bộ. Poo sẽ tiếp tục gom thêm vỏ sò bài học mới cho đại dương này.' },
    ],
    faqs: [
      { question: 'PooEnglish là gì?', answer: 'PooEnglish là website học tiếng Anh cho người Việt, tập trung vào lộ trình nhỏ, bài học thân thiện và mascot cá voi Poo đồng hành.' },
      { question: 'Vì sao tên là PooEnglish?', answer: 'Tên gọi gắn với Poo, chú cá voi nhỏ đại diện cho tinh thần học nhẹ nhàng, dễ thương và kiên nhẫn.' },
      commonFaqs.login,
      commonFaqs.beginner,
      { question: 'PooEnglish có những phần học nào?', answer: 'Các phần chính gồm lộ trình học, khóa 48 ngày lấy gốc, shadowing, từ vựng, luyện nghe nói, ngữ pháp và ôn tập.' },
    ],
    links: [
      { label: 'Học tiếng Anh cùng Poo', to: '/hoc-tieng-anh' },
      { label: 'Lộ trình học', to: '/lo-trinh-hoc-tieng-anh' },
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
            <Text as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" mb="3">Sẵn sàng ôn một vòng nhỏ hôm nay?</Text>
            <Text maxW="720px" mx="auto" lineHeight="1.8" fontWeight="700" opacity="0.94" mb="5">
              Poo không cần bạn học thật nhiều trong một lần. Hãy mở lộ trình, nói theo một câu hoặc nhặt lại vài từ vựng. Một vòng ôn nhỏ hôm nay sẽ giúp đại dương tiếng Anh bớt rộng hơn ngày mai.
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

export function SeoLandingPage() {
  const location = useLocation();
  const reviewPage = getReviewSeoPageByPath(location.pathname);
  const seoPage = getSeoPageByPath(location.pathname);
  const content = LANDINGS[location.pathname] ?? LANDINGS['/'];

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
                <Button as={RouterLink} to="/gioi-thieu" borderRadius="full" bg="white" color={OCEAN_TOKENS.deepBlue} size="lg" border="1px solid" borderColor={OCEAN_TOKENS.borderStrong} _hover={{ bg: OCEAN_TOKENS.softBlue }}>
                  Tìm hiểu PooEnglish
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
            <Text as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" mb="3">Sẵn sàng bơi một bước nhỏ hôm nay?</Text>
            <Text maxW="720px" mx="auto" lineHeight="1.8" fontWeight="700" opacity="0.94" mb="5">
              Poo không cần bạn học hoàn hảo. Poo chỉ cần bạn mở bài, thử một câu, nhặt một từ và quay lại vào ngày mai. Những bước nhỏ sẽ làm đại dương tiếng Anh bớt rộng hơn.
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
