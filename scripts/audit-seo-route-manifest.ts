import { LESSON_SEO_PATHS as lessonPaths } from '../apps/web/src/data/lessonSeoPages';
import { REVIEW_SEO_PATHS as reviewPaths } from '../apps/web/src/data/reviewSeoPages';
import { SEO_PAGE_PATHS as seoPaths } from '../apps/web/src/data/seoPagesData';
import { seoV4Routes as v4Paths } from '../apps/web/src/data/seoV4Top1Pages';
import {
  LESSON_SEO_PATHS,
  REVIEW_SEO_PATHS,
  SEO_PAGE_PATHS,
  seoV4Routes,
} from '../apps/web/src/data/seoRouteManifest';

const groups = [
  ['lesson', lessonPaths, LESSON_SEO_PATHS],
  ['review', reviewPaths, REVIEW_SEO_PATHS],
  ['seo', seoPaths, SEO_PAGE_PATHS],
  ['seo-v4', v4Paths, seoV4Routes],
] as const;

for (const [name, source, manifest] of groups) {
  const sourcePaths = [...source].sort();
  const manifestPaths = [...manifest].sort();
  if (JSON.stringify(sourcePaths) !== JSON.stringify(manifestPaths)) {
    throw new Error(`${name} route manifest drifted from page data. Update apps/web/src/data/seoRouteManifest.ts.`);
  }
}

console.log(`SEO route manifest passed (${groups.reduce((total, [, , paths]) => total + paths.length, 0)} routes).`);
