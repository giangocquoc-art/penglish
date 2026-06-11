import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type RouteMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
};

const DEFAULT_METADATA: RouteMetadata = {
  title: 'PooEnglish — học tiếng Anh mỗi ngày cùng Poo',
  description: 'Ứng dụng học tiếng Anh nhẹ nhàng với lộ trình 48 ngày, nói đuổi, luyện phản xạ, từ vựng và sổ câu cần ôn cá nhân.',
  canonicalPath: '/',
};

const ROUTE_METADATA: Array<{ test: (pathname: string) => boolean; metadata: RouteMetadata }> = [
  {
    test: (pathname) => pathname === '/' || pathname === '/home' || pathname === '/landing',
    metadata: {
      title: 'PooEnglish — học tiếng Anh mỗi ngày cùng Poo',
      description: 'Ứng dụng học tiếng Anh nhẹ nhàng với lộ trình 48 ngày, nói đuổi, luyện phản xạ, từ vựng và sổ câu cần ôn cá nhân.',
      canonicalPath: '/',
    },
  },
  {
    test: (pathname) => pathname === '/learning-path',
    metadata: {
      title: 'Lộ trình học tiếng Anh — PooEnglish',
      description: 'Học tiếng Anh theo bản đồ kỹ năng từ mất gốc đến giao tiếp tự tin.',
      canonicalPath: '/learning-path',
    },
  },
  {
    test: (pathname) => pathname.startsWith('/luyen-tieng-anh/48-ngay-lay-goc'),
    metadata: {
      title: '48 ngày lấy gốc tiếng Anh — PooEnglish',
      description: 'Khóa học nền tảng giúp người mất gốc xây lại từ vựng, mẫu câu, nghe, nói và phản xạ mỗi ngày.',
      canonicalPath: '/luyen-tieng-anh/48-ngay-lay-goc',
    },
  },
  {
    test: (pathname) => pathname === '/practice',
    metadata: {
      title: 'Luyện tập tiếng Anh — PooEnglish',
      description: 'Luyện nghe, nói, đọc, từ vựng và phản xạ qua các bài tập nhỏ mỗi ngày.',
      canonicalPath: '/practice',
    },
  },
  {
    test: (pathname) => pathname === '/words' || pathname === '/vocabularies' || pathname.startsWith('/words?') || pathname.startsWith('/vocabularies?'),
    metadata: {
      title: 'Sổ học của tôi — PooEnglish',
      description: 'Lưu từ vựng, câu cần ôn, câu khó, mẫu câu và nội dung nên luyện lại.',
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
      description: 'Xem hồ sơ học tập, chuỗi ngày học và tiến độ Poo đang giữ cho bạn trên PooEnglish.',
      canonicalPath: '/profile',
    },
  },
];

function upsertMeta(selector: string, create: () => HTMLMetaElement | HTMLLinkElement, content: string, attribute = 'content') {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, content);
}

function getMetadata(pathname: string) {
  return ROUTE_METADATA.find((entry) => entry.test(pathname))?.metadata ?? DEFAULT_METADATA;
}

export function RouteMetadataUpdater() {
  const location = useLocation();

  useEffect(() => {
    const metadata = getMetadata(location.pathname);
    const canonicalUrl = new URL(metadata.canonicalPath, window.location.origin).toString();
    document.title = metadata.title;
    upsertMeta('meta[name="description"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'description';
      return meta;
    }, metadata.description);
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
    upsertMeta('link[rel="canonical"]', () => {
      const link = document.createElement('link');
      link.rel = 'canonical';
      return link;
    }, canonicalUrl, 'href');
  }, [location.pathname]);

  return null;
}
