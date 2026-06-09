const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.OCEAN_QA_BASE_URL || 'http://127.0.0.1:4173';
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'reports', 'screenshots');

const guestUser = {
  id: 'local-guest-learner',
  name: 'Bạn học nhỏ',
  email: 'guest@p-english.local',
  avatar: '',
  coin: 0,
  streak: 0,
  vip: false,
  bio: 'Screenshot QA local guest profile',
};

const cleanMode = process.env.OCEAN_QA_CLEAN === '1';
const screenshotPrefix = cleanMode ? 'ocean-clean' : 'ocean-poses';

const shots = [
  { route: '/login', file: `${screenshotPrefix}-login-desktop.png`, width: 1366, height: 768, waitFor: 'Bắt đầu học P-English', auth: 'logged-out' },
  { route: '/home', file: `${screenshotPrefix}-home-desktop.png`, width: 1366, height: 768, selector: '.penglish-ocean-shell', auth: 'guest' },
  { route: '/shadowing', file: `${screenshotPrefix}-shadowing-desktop.png`, width: 1366, height: 768, waitFor: 'Ghi âm câu bạn vừa nói', auth: 'guest', noTopbarOverlap: true },
  { route: '/english-speed', file: `${screenshotPrefix}-speed-desktop.png`, width: 1366, height: 768, waitFor: 'Chế độ phát âm nhanh', auth: 'guest' },
  { route: '/learning-path', file: `${screenshotPrefix}-roadmap-desktop.png`, width: 1366, height: 768, selector: '.penglish-ocean-shell', auth: 'guest' },
  { route: '/home', file: `${screenshotPrefix}-mobile-home.png`, width: 390, height: 844, selector: '.penglish-ocean-shell', auth: 'guest' },
  { route: '/shadowing', file: `${screenshotPrefix}-mobile-shadowing.png`, width: 390, height: 844, waitFor: 'Ghi âm câu bạn vừa nói', auth: 'guest' },
];

const sourceFiles = [
  'apps/web/src/lib/p-english/oceanAssets.ts',
  'apps/web/src/components/p-english/OceanMascot.tsx',
  'apps/web/src/pages/LoginPage.tsx',
  'apps/web/src/pages/HomePage.tsx',
  'apps/web/src/pages/ShadowingPage.tsx',
  'apps/web/src/pages/EnglishSpeedPage.tsx',
  'apps/web/src/pages/LearningPathPage.tsx',
];

function checkSourceAssetGuards() {
  const errors = [];
  for (const relative of sourceFiles) {
    const fullPath = path.join(rootDir, relative);
    if (!fs.existsSync(fullPath)) errors.push(`${relative} is missing`);
  }

  const registry = fs.readFileSync(path.join(rootDir, 'apps/web/src/lib/p-english/oceanAssets.ts'), 'utf8');
  for (const expected of [
    'poo-pose-01',
    'muc-mo-pose-01',
    'rua-ri-pose-01',
    'cua-quiz-pose-01',
    'sua-nghe-pose-01',
    'ca-ngua-toc-pose-01',
    'sao-nhi-pose-01',
    'poses-clean',
    'cleanPosePath',
    'sourcePosePath',
    'sourceSheetPath',
    'sourceSheets',
  ]) {
    if (!registry.includes(expected)) errors.push(`oceanAssets registry missing ${expected}`);
  }

  const mascot = fs.readFileSync(path.join(rootDir, 'apps/web/src/components/p-english/OceanMascot.tsx'), 'utf8');
  if (mascot.includes('asset.sheet')) errors.push('OceanMascot still references asset.sheet');
  if (!mascot.includes('getOceanMascotPose')) errors.push('OceanMascot does not use getOceanMascotPose');

  return errors;
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasOverflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > document.documentElement.clientWidth + 1,
  }));
}

async function imageAudit(page) {
  await page.waitForTimeout(800);
  return page.evaluate(() => {
    const images = Array.from(document.images).map((img) => ({
      src: img.currentSrc || img.src || '',
      alt: img.alt || '',
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));
    return {
      broken: images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src || img.alt || 'unknown image'),
      mascotSheets: images.filter((img) => /\/ocean\/mascots\/.*sheet.*\.png/.test(img.src)).map((img) => img.src),
      mascotSourcePoses: images.filter((img) => /\/ocean\/mascots\/.*\/poses\/.*\.png/.test(img.src)).map((img) => img.src),
      mascotCleanPoses: images.filter((img) => /\/ocean\/mascots\/.*\/poses-clean\/.*\.png/.test(img.src)).map((img) => img.src),
    };
  });
}

async function shadowingTopbarAudit(page) {
  return page.evaluate(() => {
    const topbar = document.querySelector('header');
    const hero = document.querySelector('[data-testid="shadowing-hero"]');
    if (!topbar || !hero) return { checked: false, overlaps: false };
    const topbarBox = topbar.getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    return {
      checked: true,
      topbarBottom: topbarBox.bottom,
      heroTop: heroBox.top,
      gap: heroBox.top - topbarBox.bottom,
      overlaps: topbarBox.bottom > heroBox.top + 1,
    };
  });
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const errors = checkSourceAssetGuards();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));

  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(({ auth, guest }) => {
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('pshare-enable-backend-sync');
      if (auth === 'guest') {
        window.localStorage.setItem('currentUser', JSON.stringify(guest));
      } else {
        window.localStorage.removeItem('currentUser');
      }
    }, { auth: shot.auth, guest: guestUser });
    const response = await page.goto(`${baseUrl}${shot.route}`, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response || response.status() >= 500) errors.push(`${shot.route} returned ${response ? response.status() : 'no response'}`);
    if (shot.waitFor) await page.getByText(shot.waitFor, { exact: false }).first().waitFor({ state: 'attached', timeout: 20000 });
    if (shot.selector) await page.waitForSelector(shot.selector, { state: 'attached', timeout: 20000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const overflow = await hasHorizontalOverflow(page);
    if (overflow.hasOverflow) errors.push(`${shot.route} ${shot.width}x${shot.height} has horizontal overflow: ${JSON.stringify(overflow)}`);

    const images = await imageAudit(page);
    if (images.broken.length) errors.push(`${shot.route} ${shot.width}x${shot.height} has broken images: ${images.broken.join(', ')}`);
    if (images.mascotSheets.length) errors.push(`${shot.route} ${shot.width}x${shot.height} still renders mascot sheets: ${images.mascotSheets.join(', ')}`);
    if (images.mascotSourcePoses.length) errors.push(`${shot.route} ${shot.width}x${shot.height} still renders source pose images instead of clean poses: ${images.mascotSourcePoses.join(', ')}`);
    if (shot.route !== '/login' && images.mascotCleanPoses.length === 0) errors.push(`${shot.route} ${shot.width}x${shot.height} did not render any cleaned mascot pose image`);
    if (shot.noTopbarOverlap) {
      const topbarAudit = await shadowingTopbarAudit(page);
      if (!topbarAudit.checked) errors.push(`${shot.route} ${shot.width}x${shot.height} could not audit topbar/hero overlap`);
      if (topbarAudit.overlaps) errors.push(`${shot.route} ${shot.width}x${shot.height} topbar overlaps hero: ${JSON.stringify(topbarAudit)}`);
    }

    await page.screenshot({ path: path.join(outDir, shot.file), fullPage: true });
  }

  const filteredConsoleErrors = consoleErrors.filter((entry) => !entry.includes('favicon') && !entry.includes('404'));
  if (filteredConsoleErrors.length) errors.push(`console errors: ${filteredConsoleErrors.join(' | ')}`);

  await browser.close();

  if (errors.length) {
    console.error('[ocean-poses-screenshots] FAILED');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`[${cleanMode ? 'ocean-clean-screenshots' : 'ocean-poses-screenshots'}] PASS`);
  console.log(`Saved ${shots.length} screenshots to ${path.relative(rootDir, outDir)}`);
})();
