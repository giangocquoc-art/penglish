# PooEnglish SEO/GEO Phase 4 checklist

## Crawlability

- [ ] Public SEO routes render visible text without login redirects.
- [ ] `/`, `/blog`, Phase 4 intent routes, and `/bai-hoc/...` lesson SEO pages are indexable.
- [ ] Every public SEO page has exactly one visible H1.
- [ ] Route metadata sets canonical URL, title, description, Open Graph, Twitter image, and robots index/follow.
- [ ] `robots.txt` allows Googlebot, Bingbot, Applebot, and major AI search crawlers.

## Content clusters

- [ ] Pillar pages link to supporting blog posts.
- [ ] Blog posts link back to the pillar page.
- [ ] Blog posts link to at least two real app features such as `/learning-path`, `/shadowing`, and `/words`.
- [ ] Each SEO page contains a question H2, 40-80 word quick answer, and bullets.
- [ ] Blog hub H1 is exactly `Blog học tiếng Anh cùng PooEnglish`.

## Structured data

- [ ] Home/base entity includes WebSite and Organization JSON-LD.
- [ ] Intent/pillar pages include WebPage, BreadcrumbList, and FAQPage JSON-LD when FAQs are visible.
- [ ] Blog posts include Article, BreadcrumbList, and FAQPage JSON-LD.
- [ ] Public lesson SEO pages include LearningResource, BreadcrumbList, and FAQPage JSON-LD.
- [ ] `llms.txt` and `brand.json` describe the same canonical entity and route clusters.

## Sitemap and indexing

- [ ] `sitemap.xml` contains only public indexable URLs.
- [ ] Sitemap includes `lastmod` and canonical `https://www.pooenglish.com` URLs.
- [ ] `scripts/submit-indexnow.ps1` can submit sitemap URLs when `INDEXNOW_KEY` is configured.
- [ ] IndexNow script exits with code 0 on missing key or API failure.

## Media SEO

- [ ] `/og-image.png` exists.
- [ ] `/logo.png` exists.
- [ ] OG and Twitter image tags use `https://www.pooenglish.com/og-image.png`.
- [ ] Favicon and Apple touch icon remain available.

## Measurement plan

- [ ] Connect Google Search Console.
- [ ] Connect Bing Webmaster Tools.
- [ ] Add Vercel Analytics or GA4 when deployment policy allows.
- [ ] Track `click_start_learning`.
- [ ] Track `click_shadowing`.
- [ ] Track `click_words`.
- [ ] Track `lesson_start`.
- [ ] Track `lesson_complete`.
- [ ] Track `blog_cta_click`.

## Validation

- [ ] Run `npm.cmd run build`.
- [ ] Check `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/brand.json` after build/deploy.
- [ ] Test representative routes: `/`, `/blog`, `/blog/on-tieng-anh-la-gi`, `/hoc-tieng-anh-mien-phi`, `/bai-hoc/unit-1-greetings-introduction`.
- [ ] Submit updated sitemap to Google Search Console and Bing Webmaster Tools.
