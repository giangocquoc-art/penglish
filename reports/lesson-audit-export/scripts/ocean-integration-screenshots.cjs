const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.OCEAN_QA_BASE_URL || 'http://127.0.0.1:4173';
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'reports', 'screenshots');

const shots = [
  { route: '/login', file: 'ocean-integration-login-desktop.png', width: 1366, height: 768, waitFor: 'Bắt đầu học ngay' },
  { route: '/home', file: 'ocean-integration-home-desktop.png', width: 1366, height: 768, selector: '.penglish-ocean-shell' },
  { route: '/shadowing', file: 'ocean-integration-shadowing-desktop.png', width: 1366, height: 768, waitFor: 'Ghi âm câu bạn vừa nói' },
  { route: '/english-speed', file: 'ocean-integration-speed-desktop.png', width: 1366, height: 768, waitFor: 'Ca Ngựa Tốc pronunciation mode' },
  { route: '/words', file: 'ocean-integration-words-desktop.png', width: 1366, height: 768, selector: '.penglish-ocean-shell' },
  { route: '/learning-path', file: 'ocean-integration-roadmap-desktop.png', width: 1366, height: 768, selector: '.penglish-ocean-shell' },
  { route: '/home', file: 'ocean-integration-mobile-home.png', width: 390, height: 844, selector: '.penglish-ocean-shell' },
  { route: '/shadowing', file: 'ocean-integration-mobile-shadowing.png', width: 390, height: 844, waitFor: 'Ghi âm câu bạn vừa nói' },
];

function checkSourceAssetGuards() {
  const errors = [];
  const files = [
    'apps/web/src/lib/p-english/oceanAssets.ts',
    'apps/web/src/components/p-english/OceanPageShell.tsx',
    'apps/web/src/components/p-english/OceanMascot.tsx',
  ];
  for (const relative of files) {
    const fullPath = path.join(rootDir, relative);
    if (!fs.existsSync(fullPath)) errors.push(`${relative} is missing`);
  }
  const registry = fs.readFileSync(path.join(rootDir, 'apps/web/src/lib/p-english/oceanAssets.ts'), 'utf8');
  for (const expected of [
    'bg-login-ocean.png',
    'bg-dashboard-ocean.png',
    'bg-shadowing-ocean.png',
    'bg-speed-ocean.png',
    'bg-vocab-ocean.png',
    'bg-roadmap-ocean.png',
    'cua-quiz',
    'sua-nghe',
    'ca-ngua-toc',
    'sao-nhi',
    'muc-mo',
    'rua-ri',
  ]) {
    if (!registry.includes(expected)) errors.push(`oceanAssets registry missing ${expected}`);
  }
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

async function brokenImages(page) {
  await page.waitForTimeout(500);
  return page.evaluate(() => Array.from(document.images)
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map((img) => img.currentSrc || img.src || img.alt || 'unknown image'));
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
    const response = await page.goto(`${baseUrl}${shot.route}`, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response || response.status() >= 500) errors.push(`${shot.route} returned ${response ? response.status() : 'no response'}`);
    if (shot.waitFor) await page.getByText(shot.waitFor, { exact: false }).first().waitFor({ state: 'attached', timeout: 20000 });
    if (shot.selector) await page.waitForSelector(shot.selector, { state: 'attached', timeout: 20000 });

    const overflow = await hasHorizontalOverflow(page);
    if (overflow.hasOverflow) errors.push(`${shot.route} ${shot.width}x${shot.height} has horizontal overflow: ${JSON.stringify(overflow)}`);

    const broken = await brokenImages(page);
    if (broken.length) errors.push(`${shot.route} ${shot.width}x${shot.height} has broken images: ${broken.join(', ')}`);

    const oceanState = await page.evaluate(() => ({
      oceanShell: Boolean(document.querySelector('.penglish-ocean-shell')),
      oceanMascots: document.querySelectorAll('[class*="ocean-mascot"], img[src*="/ocean/mascots/"]').length,
      bodyText: document.body.innerText.slice(0, 500),
    }));
    if (shot.route !== '/login' && !oceanState.oceanShell) errors.push(`${shot.route} missing OceanPageShell marker`);

    await page.screenshot({ path: path.join(outDir, shot.file), fullPage: true });
  }

  if (consoleErrors.length) {
    const filtered = consoleErrors.filter((entry) => !entry.includes('favicon') && !entry.includes('404'));
    if (filtered.length) errors.push(`console errors: ${filtered.join(' | ')}`);
  }

  await browser.close();

  if (errors.length) {
    console.error('[ocean-integration-screenshots] FAILED');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log('[ocean-integration-screenshots] PASS');
  console.log(`Saved ${shots.length} screenshots to ${path.relative(rootDir, outDir)}`);
})();
