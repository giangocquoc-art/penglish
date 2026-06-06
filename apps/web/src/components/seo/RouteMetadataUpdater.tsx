import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type RouteMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
};

const DEFAULT_METADATA: RouteMetadata = {
  title: 'P-English — Học tiếng Anh mỗi ngày cùng Poo',
  description: 'P-English là app học tiếng Anh local-first với lộ trình học rõ ràng, 48 ngày lấy gốc, shadowing, English Speed và ôn từ vựng mỗi ngày.',
  canonicalPath: '/',
};

const ROUTE_METADATA: Array<{ test: (pathname: string) => boolean; metadata: RouteMetadata }> = [
  {
    test: (pathname) => pathname === '/' || pathname === '/landing',
    metadata: {
      title: 'P-English — Học tiếng Anh mỗi ngày cùng Poo',
      description: 'Bắt đầu học tiếng Anh cùng Poo bằng bài học ngắn, lộ trình 48 ngày lấy gốc, shadowing và ôn từ vựng thông minh.',
      canonicalPath: '/',
    },
  },
  {
    test: (pathname) => pathname === '/home',
    metadata: {
      title: 'Hôm nay học gì? — P-English',
      description: 'Màn hình hôm nay của P-English: bắt đầu bài học gợi ý, xem lộ trình 48 ngày, luyện shadowing và ôn từ cần nhớ.',
      canonicalPath: '/home',
    },
  },
  {
    test: (pathname) => pathname === '/learning-path',
    metadata: {
      title: 'Lộ trình học tiếng Anh — P-English',
      description: 'Learning path dạng từng nút bài học: từ vựng, nghe, nói, ngữ pháp, quiz và checkpoint theo hành trình A1–B2.',
      canonicalPath: '/learning-path',
    },
  },
  {
    test: (pathname) => pathname.startsWith('/luyen-tieng-anh/48-ngay-lay-goc'),
    metadata: {
      title: '48 ngày lấy gốc tiếng Anh — P-English',
      description: 'Khóa học nền tảng 48 ngày với bài học nhỏ, nghe bằng TTS, bài tập tương tác, speaking và ôn lỗi sai local-first.',
      canonicalPath: '/luyen-tieng-anh/48-ngay-lay-goc',
    },
  },
  {
    test: (pathname) => pathname === '/english-speed',
    metadata: {
      title: 'English Speed — Luyện phản xạ phát âm',
      description: 'Luyện phản xạ tiếng Anh bằng câu ngắn, nghe mẫu, nói lại và tăng tốc từng lượt cùng Poo.',
      canonicalPath: '/english-speed',
    },
  },
  {
    test: (pathname) => pathname === '/shadowing',
    metadata: {
      title: 'Shadowing tiếng Anh — Nghe, nói, sửa nhịp',
      description: 'Luyện shadowing theo vòng nghe mẫu, nói lại, xem phản hồi và lưu câu khó để ôn lại.',
      canonicalPath: '/shadowing',
    },
  },
  {
    test: (pathname) => pathname === '/practice',
    metadata: {
      title: 'Ôn tập tiếng Anh — P-English',
      description: 'Trung tâm ôn tập lỗi sai, từ đến hạn, câu shadowing khó và bài luyện ngắn theo tiến độ local.',
      canonicalPath: '/practice',
    },
  },
  {
    test: (pathname) => pathname === '/words' || pathname === '/vocabularies' || pathname.startsWith('/words?') || pathname.startsWith('/vocabularies?'),
    metadata: {
      title: 'Sổ tay từ vựng tiếng Anh — P-English',
      description: 'Sổ tay từ vựng cá nhân để lưu từ, ôn flashcard, xem từ khó và học theo CEFR A1–B2.',
      canonicalPath: '/words',
    },
  },
  {
    test: (pathname) => pathname === '/profile',
    metadata: {
      title: 'Hồ sơ học tập — P-English',
      description: 'Xem hồ sơ học tập, streak, dữ liệu local và trạng thái đồng bộ của bạn trên P-English.',
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
    }, metadata.canonicalPath);
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
    }, metadata.canonicalPath, 'href');
  }, [location.pathname]);

  return null;
}
