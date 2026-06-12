import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getBlogPostBySlug, getBlogPostPath, type BlogPost } from '../../data/blogPosts';
import { getReviewSeoPageByPath, type ReviewSeoPage } from '../../data/reviewSeoPages';
import { getSeoPageByPath, type SeoPage } from '../../data/seoPagesData';
import { getLessonSeoPageByPath, type LessonSeoPage } from '../../data/lessonSeoPages';

export const SEO_BASE_URL = 'https://www.pooenglish.com';
const SEO_IMAGE_URL = `${SEO_BASE_URL}/og-image.png`;

export type RouteMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  structuredData?: Array<Record<string, unknown>>;
};

const INDEX_FOLLOW = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX_FOLLOW = 'noindex, follow';

function absoluteUrl(path: string) {
  return new URL(path, SEO_BASE_URL).toString();
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PooEnglish',
    alternateName: ['Poo English', 'PooEnglish học tiếng Anh', 'PooEnglish cá voi Poo'],
    url: SEO_BASE_URL,
    inLanguage: 'vi-VN',
    description: 'PooEnglish là website học tiếng Anh thân thiện cho người Việt: lộ trình 48 ngày lấy gốc, shadowing, từ vựng, luyện nghe, ngữ pháp và ôn tập mỗi ngày cùng cá voi Poo.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SEO_BASE_URL}/hoc-tieng-anh?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PooEnglish',
    alternateName: ['Poo English', 'PooEnglish học tiếng Anh', 'PooEnglish cá voi Poo'],
    url: SEO_BASE_URL,
    logo: SEO_IMAGE_URL,
    description: 'PooEnglish là website học tiếng Anh cùng cá voi Poo, giúp người Việt xây nền tiếng Anh bằng bài học nhỏ, shadowing, từ vựng, luyện nghe và ngữ pháp mỗi ngày.',
    sameAs: [SEO_BASE_URL],
  };
}

function breadcrumbSchema(path: string, label: string, parent?: { path: string; label: string }) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'PooEnglish',
      item: SEO_BASE_URL,
    },
  ];

  if (parent) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: parent.label,
      item: absoluteUrl(parent.path),
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: label,
    item: absoluteUrl(path),
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function courseSchema(path: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: 'vi-VN',
    provider: {
      '@type': 'Organization',
      name: 'PooEnglish',
      url: SEO_BASE_URL,
    },
    educationalLevel: 'Beginner to Intermediate',
    teaches: ['English vocabulary', 'English listening', 'English speaking', 'English grammar'],
    audience: {
      '@type': 'Audience',
      audienceType: 'Người học tiếng Anh tại Việt Nam',
    },
  };
}

function articleSchema(post: BlogPost) {
  const path = getBlogPostPath(post);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    image: SEO_IMAGE_URL,
    datePublished: post.date,
    dateModified: post.lastmod,
    about: post.topicLabel,
    inLanguage: 'vi-VN',
    keywords: post.keywords.join(', '),
    author: {
      '@type': 'Organization',
      name: 'PooEnglish',
      url: SEO_BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PooEnglish',
      logo: {
        '@type': 'ImageObject',
        url: SEO_IMAGE_URL,
      },
    },
  };
}

function webPageSchema(page: ReviewSeoPage | SeoPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.h1,
    headline: page.h1,
    description: page.description,
    url: absoluteUrl(page.path),
    inLanguage: 'vi-VN',
    isPartOf: {
      '@type': 'WebSite',
      name: 'PooEnglish',
      url: SEO_BASE_URL,
    },
    about: page.keyword,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: SEO_IMAGE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PooEnglish',
      logo: {
        '@type': 'ImageObject',
        url: SEO_IMAGE_URL,
      },
    },
  };
}

function faqPageSchema(page: ReviewSeoPage | SeoPage | BlogPost | LessonSeoPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

function getReviewSeoMetadata(pathname: string): RouteMetadata | null {
  const page = getReviewSeoPageByPath(pathname);
  if (!page) return null;

  const breadcrumbParent = page.path === '/on-tieng-anh' ? undefined : { path: '/on-tieng-anh', label: 'Ôn tiếng Anh' };

  return {
    title: page.title,
    description: page.description,
    canonicalPath: page.path,
    structuredData: [
      webPageSchema(page),
      breadcrumbSchema(page.path, page.h1, breadcrumbParent),
      faqPageSchema(page),
    ],
  };
}

function getSeoPageMetadata(pathname: string): RouteMetadata | null {
  const page = getSeoPageByPath(pathname);
  if (!page) return null;

  return {
    title: page.title,
    description: page.description,
    canonicalPath: page.path,
    structuredData: [
      webPageSchema(page),
      breadcrumbSchema(page.path, page.h1),
      faqPageSchema(page),
    ],
  };
}

function lessonSeoSchema(page: LessonSeoPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: page.h1,
    headline: page.h1,
    description: page.description,
    url: absoluteUrl(page.path),
    inLanguage: 'vi-VN',
    educationalLevel: page.lesson.level,
    timeRequired: page.lesson.estimatedTime,
    teaches: page.lesson.learningObjectives,
    provider: {
      '@type': 'Organization',
      name: 'PooEnglish',
      url: SEO_BASE_URL,
    },
  };
}

function getLessonSeoMetadata(pathname: string): RouteMetadata | null {
  const page = getLessonSeoPageByPath(pathname);
  if (!page) return null;

  return {
    title: page.title,
    description: page.description,
    canonicalPath: page.path,
    structuredData: [
      lessonSeoSchema(page),
      breadcrumbSchema(page.path, page.h1, { path: '/learning-path', label: 'Lộ trình học' }),
      faqPageSchema(page),
    ],
  };
}

function getBlogMetadata(pathname: string): RouteMetadata | null {
  if (pathname === '/blog') {
    return {
      title: 'Blog học tiếng Anh cùng PooEnglish',
      description: 'Blog học tiếng Anh cùng PooEnglish gồm các cụm chủ đề ôn tiếng Anh, mất gốc, shadowing, từ vựng, luyện nghe, ngữ pháp và lộ trình học.',
      canonicalPath: '/blog',
      structuredData: [breadcrumbSchema('/blog', 'Blog học tiếng Anh cùng PooEnglish')],
    };
  }

  const match = pathname.match(/^\/blog\/([^/]+)\/?$/);
  const post = match ? getBlogPostBySlug(match[1]) : undefined;
  if (!post) return null;

  const path = getBlogPostPath(post);
  return {
    title: `${post.title} — Blog PooEnglish`,
    description: post.description,
    canonicalPath: path,
    structuredData: [
      articleSchema(post),
      breadcrumbSchema(path, post.title, { path: '/blog', label: 'Blog học tiếng Anh cùng PooEnglish' }),
      faqPageSchema(post),
    ],
  };
}

const DEFAULT_METADATA: RouteMetadata = {
  title: 'PooEnglish — Học tiếng Anh mỗi ngày cùng cá voi Poo',
  description: 'PooEnglish là website học tiếng Anh thân thiện cho người Việt: lộ trình 48 ngày lấy gốc, shadowing, từ vựng, luyện nghe, ngữ pháp và ôn tập mỗi ngày cùng cá voi Poo.',
  canonicalPath: '/',
  structuredData: [websiteSchema(), organizationSchema()],
};

const ROUTE_METADATA: Array<{ test: (pathname: string) => boolean; metadata: RouteMetadata }> = [
  {
    test: (pathname) => pathname === '/' || pathname === '/home' || pathname === '/landing',
    metadata: DEFAULT_METADATA,
  },
  {
    test: (pathname) => pathname === '/hoc-tieng-anh',
    metadata: {
      title: 'Học tiếng Anh cùng PooEnglish — Bắt đầu nhẹ nhàng mỗi ngày',
      description: 'Học tiếng Anh cùng cá voi Poo qua bài học nhỏ, lộ trình rõ ràng, từ vựng dễ nhớ, luyện nghe nói và ôn tập thân thiện cho người Việt.',
      canonicalPath: '/hoc-tieng-anh',
      structuredData: [breadcrumbSchema('/hoc-tieng-anh', 'Học tiếng Anh')],
    },
  },
  {
    test: (pathname) => pathname === '/lo-trinh-hoc-tieng-anh' || pathname === '/learning-path',
    metadata: {
      title: 'Lộ trình học tiếng Anh cho người mất gốc — PooEnglish',
      description: 'Bản đồ học tiếng Anh từng bước cùng cá voi Poo: biết hôm nay học gì, ôn gì, luyện nghe nói ra sao và đi tiếp thế nào mà không bị lạc tài liệu.',
      canonicalPath: pathnameToCanonical('/lo-trinh-hoc-tieng-anh'),
      structuredData: [breadcrumbSchema('/lo-trinh-hoc-tieng-anh', 'Lộ trình học tiếng Anh')],
    },
  },
  {
    test: (pathname) => pathname === '/shadowing-tieng-anh',
    metadata: {
      title: 'Shadowing tiếng Anh cho người mới — Nói đuổi cùng Poo',
      description: 'Luyện shadowing tiếng Anh bằng câu ngắn: nghe mẫu, bắt nhịp, nói theo và lặp lại nhẹ nhàng để người Việt bớt ngại phát âm.',
      canonicalPath: '/shadowing-tieng-anh',
      structuredData: [breadcrumbSchema('/shadowing-tieng-anh', 'Shadowing tiếng Anh'), courseSchema('/shadowing-tieng-anh', 'Shadowing tiếng Anh cùng Poo', 'Khóa luyện nói đuổi tiếng Anh theo từng câu ngắn, phù hợp người học muốn cải thiện phát âm và phản xạ.')],
    },
  },
  {
    test: (pathname) => pathname === '/tu-vung-tieng-anh',
    metadata: {
      title: 'Từ vựng tiếng Anh dễ nhớ — Học trong câu cùng Poo',
      description: 'Học từ vựng tiếng Anh bằng ngữ cảnh, ví dụ đời thường và sổ ôn cá nhân để biết từ nào mới, từ nào hay quên, từ nào đã thuộc.',
      canonicalPath: '/tu-vung-tieng-anh',
      structuredData: [breadcrumbSchema('/tu-vung-tieng-anh', 'Từ vựng tiếng Anh')],
    },
  },
  {
    test: (pathname) => pathname === '/luyen-nghe-tieng-anh',
    metadata: {
      title: 'Luyện nghe tiếng Anh cho người mới — Nghe chậm cùng Poo',
      description: 'Bắt đầu luyện nghe tiếng Anh bằng câu ngắn, từ quen, transcript đúng lúc và shadowing nhẹ để tai quen âm mà không bị ngợp.',
      canonicalPath: '/luyen-nghe-tieng-anh',
      structuredData: [breadcrumbSchema('/luyen-nghe-tieng-anh', 'Luyện nghe tiếng Anh'), courseSchema('/luyen-nghe-tieng-anh', 'Luyện nghe tiếng Anh cùng Poo', 'Chương trình luyện nghe tiếng Anh bằng bài ngắn, từ vựng quen thuộc và hoạt động nghe nói lặp lại.')],
    },
  },
  {
    test: (pathname) => pathname === '/ngu-phap-tieng-anh',
    metadata: {
      title: 'Ngữ pháp tiếng Anh cơ bản — Hiểu mẫu câu cùng Poo',
      description: 'Học ngữ pháp tiếng Anh qua mẫu câu đời thường, ví dụ tiếng Việt dễ hiểu và bài luyện nhỏ để người mất gốc dám dùng ngay.',
      canonicalPath: '/ngu-phap-tieng-anh',
      structuredData: [breadcrumbSchema('/ngu-phap-tieng-anh', 'Ngữ pháp tiếng Anh')],
    },
  },
  {
    test: (pathname) => pathname === '/48-ngay-lay-goc' || pathname.startsWith('/luyen-tieng-anh/48-ngay-lay-goc'),
    metadata: {
      title: '48 ngày lấy gốc tiếng Anh cho người mất gốc — PooEnglish',
      description: 'Khóa 48 ngày lấy gốc cùng cá voi Poo: mỗi ngày học một gói nhỏ gồm từ vựng, mẫu câu, nghe chậm, shadowing, quiz và ôn lại.',
      canonicalPath: '/48-ngay-lay-goc',
      structuredData: [breadcrumbSchema('/48-ngay-lay-goc', '48 ngày lấy gốc'), courseSchema('/48-ngay-lay-goc', '48 ngày lấy gốc tiếng Anh cùng Poo', 'Khóa học nền tảng 48 ngày cho người mất gốc hoặc muốn bắt đầu lại tiếng Anh bằng bài học nhỏ mỗi ngày.')],
    },
  },
  {
    test: (pathname) => pathname === '/gioi-thieu',
    metadata: {
      title: 'Giới thiệu PooEnglish — Website học tiếng Anh cùng cá voi Poo',
      description: 'Tìm hiểu PooEnglish, website học tiếng Anh thân thiện với mascot cá voi Poo, giúp người học đi từng bước nhỏ và duy trì thói quen mỗi ngày.',
      canonicalPath: '/gioi-thieu',
      structuredData: [breadcrumbSchema('/gioi-thieu', 'Giới thiệu PooEnglish'), organizationSchema()],
    },
  },
  {
    test: (pathname) => pathname === '/practice',
    metadata: {
      title: 'Luyện tập tiếng Anh — PooEnglish',
      description: 'Luyện nghe, nói, đọc, từ vựng và phản xạ qua các bài tập nhỏ mỗi ngày trên PooEnglish.',
      canonicalPath: '/practice',
    },
  },
  {
    test: (pathname) => pathname === '/words' || pathname === '/vocabularies',
    metadata: {
      title: 'Sổ từ vựng tiếng Anh — PooEnglish',
      description: 'Lưu từ vựng, câu cần ôn, câu khó, mẫu câu và nội dung nên luyện lại cùng PooEnglish.',
      canonicalPath: '/words',
    },
  },
  {
    test: (pathname) => pathname === '/shadowing',
    metadata: {
      title: 'Nói đuổi cùng Poo — PooEnglish',
      description: 'Nghe mẫu, nói lại và nhận góp ý để luyện phát âm, nhịp nói và phản xạ tiếng Anh.',
      canonicalPath: '/shadowing',
    },
  },
  {
    test: (pathname) => pathname === '/english-speed',
    metadata: {
      title: 'Đọc nhanh cùng Poo — PooEnglish',
      description: 'Đọc, nghe và nói cùng Poo theo nhịp rõ ràng, đều đặn và ít áp lực.',
      canonicalPath: '/english-speed',
    },
  },
  {
    test: (pathname) => pathname === '/profile',
    metadata: {
      title: 'Hồ sơ học tập — PooEnglish',
      description: 'Xem hồ sơ học tập, chuỗi bọt biển và tiến độ Poo đang giữ cho bạn trên PooEnglish.',
      canonicalPath: '/profile',
    },
  },
  {
    test: (pathname) => pathname === '/auth/callback' || pathname === '/login/callback',
    metadata: {
      title: 'Đang đưa bạn vào PooEnglish',
      description: 'Trang xác nhận đăng nhập của PooEnglish.',
      canonicalPath: '/auth/callback',
      robots: NOINDEX_FOLLOW,
    },
  },
  {
    test: (pathname) => pathname === '/admin' || pathname.startsWith('/admin/'),
    metadata: {
      title: 'PooEnglish Admin',
      description: 'Khu vực quản trị nội bộ của PooEnglish.',
      canonicalPath: '/admin',
      robots: NOINDEX_FOLLOW,
    },
  },
];

function pathnameToCanonical(pathname: string) {
  return pathname;
}

function upsertMeta(selector: string, create: () => HTMLMetaElement | HTMLLinkElement, content: string, attribute = 'content') {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, content);
}

function getMetadata(pathname: string) {
  return getSeoPageMetadata(pathname) ?? getLessonSeoMetadata(pathname) ?? getReviewSeoMetadata(pathname) ?? getBlogMetadata(pathname) ?? ROUTE_METADATA.find((entry) => entry.test(pathname))?.metadata ?? DEFAULT_METADATA;
}

function syncJsonLd(metadata: RouteMetadata) {
  document.querySelectorAll('script[data-penglish-json-ld="true"]').forEach((element) => element.remove());
  metadata.structuredData?.forEach((schema, index) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.penglishJsonLd = 'true';
    script.dataset.schemaIndex = String(index);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

export function RouteMetadataUpdater() {
  const location = useLocation();

  useEffect(() => {
    const metadata = getMetadata(location.pathname);
    const canonicalUrl = absoluteUrl(metadata.canonicalPath);
    document.title = metadata.title;
    upsertMeta('meta[name="description"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'description';
      return meta;
    }, metadata.description);
    upsertMeta('meta[name="robots"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      return meta;
    }, metadata.robots ?? INDEX_FOLLOW);
    upsertMeta('meta[property="og:type"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      return meta;
    }, 'website');
    upsertMeta('meta[property="og:site_name"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:site_name');
      return meta;
    }, 'PooEnglish');
    upsertMeta('meta[property="og:locale"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:locale');
      return meta;
    }, 'vi_VN');
    upsertMeta('meta[property="og:title"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      return meta;
    }, metadata.title);
    upsertMeta('meta[property="og:description"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      return meta;
    }, metadata.description);
    upsertMeta('meta[property="og:url"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    }, canonicalUrl);
    upsertMeta('meta[property="og:image"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      return meta;
    }, SEO_IMAGE_URL);
    upsertMeta('meta[property="og:image:alt"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image:alt');
      return meta;
    }, 'PooEnglish - học tiếng Anh cùng cá voi Poo');
    upsertMeta('meta[name="twitter:card"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:card';
      return meta;
    }, 'summary_large_image');
    upsertMeta('meta[name="twitter:url"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:url';
      return meta;
    }, canonicalUrl);
    upsertMeta('meta[name="twitter:title"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:title';
      return meta;
    }, metadata.title);
    upsertMeta('meta[name="twitter:description"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:description';
      return meta;
    }, metadata.description);
    upsertMeta('meta[name="twitter:image"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:image';
      return meta;
    }, SEO_IMAGE_URL);
    upsertMeta('meta[name="twitter:image:alt"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:image:alt';
      return meta;
    }, 'PooEnglish - học tiếng Anh cùng cá voi Poo');
    upsertMeta('link[rel="canonical"]', () => {
      const link = document.createElement('link');
      link.rel = 'canonical';
      return link;
    }, canonicalUrl, 'href');
    syncJsonLd(metadata);
  }, [location.pathname]);

  return null;
}
