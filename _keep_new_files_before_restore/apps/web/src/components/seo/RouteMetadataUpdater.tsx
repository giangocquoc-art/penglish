import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.pooenglish.com';

const DEFAULT_TITLE = 'PooEnglish - Học tiếng Anh miễn phí cùng Poo';
const DEFAULT_DESCRIPTION =
  'PooEnglish giúp người Việt học tiếng Anh miễn phí với lộ trình rõ ràng, từ vựng, shadowing, luyện nghe, ngữ pháp và AI luyện nói cùng Poo.';

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/learning-path': {
    title: 'Lộ trình học tiếng Anh miễn phí cùng PooEnglish',
    description: 'Bắt đầu học tiếng Anh từ gốc với lộ trình dễ theo, checklist mỗi ngày và bài học nhỏ cùng Poo.',
  },
  '/speaking-coach': {
    title: 'AI luyện nói tiếng Anh cùng PooEnglish',
    description: 'Luyện nói tiếng Anh, phát âm và phản xạ giao tiếp với Poo Speaking Coach.',
  },
  '/words': {
    title: 'Học từ vựng tiếng Anh miễn phí cùng PooEnglish',
    description: 'Ôn từ vựng tiếng Anh bằng flashcard, chủ đề, trình độ A1 A2 B1 và từ cần ôn hôm nay.',
  },
  '/shadowing': {
    title: 'Shadowing tiếng Anh cho người mới bắt đầu',
    description: 'Luyện nghe, nhại, lặp và tự nói bằng phương pháp shadowing tiếng Anh cùng Poo.',
  },
  '/practice': {
    title: 'Luyện nghe và ngữ pháp tiếng Anh cùng PooEnglish',
    description: 'Luyện nghe chậm, nghe chép chính tả, ngữ pháp cơ bản, hiện tại đơn, to be và cách đặt câu.',
  },
};

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

function titleFromSlug(pathname: string): string {
  const slug = normalizePath(pathname).replace(/^\//, '').split('/').pop() ?? '';
  if (!slug) return DEFAULT_TITLE;

  const label = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return `${label} - PooEnglish`;
}

function upsertMetaName(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertMetaProperty(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function RouteMetadataUpdater() {
  const location = useLocation();

  useEffect(() => {
    const path = normalizePath(location.pathname);
    const canonical = `${SITE_URL}${path === '/' ? '' : path}`;
    const meta = ROUTE_META[path] ?? {
      title: titleFromSlug(path),
      description: DEFAULT_DESCRIPTION,
    };

    document.title = meta.title;

    upsertMetaName('description', meta.description);
    upsertMetaName('robots', 'index, follow');
    upsertMetaName('twitter:card', 'summary_large_image');
    upsertMetaName('twitter:title', meta.title);
    upsertMetaName('twitter:description', meta.description);

    upsertMetaProperty('og:title', meta.title);
    upsertMetaProperty('og:description', meta.description);
    upsertMetaProperty('og:type', 'website');
    upsertMetaProperty('og:url', canonical);
    upsertMetaProperty('og:site_name', 'PooEnglish');

    upsertCanonical(canonical);

    upsertJsonLd('pooenglish-route-schema', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: meta.title,
      description: meta.description,
      url: canonical,
      isPartOf: {
        '@type': 'WebSite',
        name: 'PooEnglish',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'PooEnglish',
        url: SITE_URL,
      },
    });
  }, [location.pathname]);

  return null;
}

export default RouteMetadataUpdater;
