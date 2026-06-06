const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');

const desktopChecks = [
  { name: 'home', route: '/home', screenshot: 'deploy-check-home.png', text: /P-English|Hôm nay|lộ trình|whale/i },
  { name: 'learning-path', route: '/learning-path', screenshot: 'deploy-check-learning-path.png', text: /Lộ trình|Unit|A1|CEFR/i },
  { name: 'lesson', route: '/lessons/unit-1-greetings-introduction', screenshot: 'deploy-check-lesson.png', text: /Chào hỏi|Greeting|Unit 1|flashcard/i },
  { name: 'shadowing', route: '/shadowing', screenshot: 'deploy-check-shadowing.png', text: /Shadowing|nghe|nói|lặp/i },
  { name: 'english-speed', route: '/english-speed', screenshot: 'deploy-check-english-speed.png', text: /English Speed|tốc độ|phản xạ/i },
  { name: 'vocabulary', route: '/vocabularies', screenshot: 'deploy-check-vocabulary.png', text: /Từ vựng|Vocabulary|CEFR|flashcard/i },
  { name: 'resources', route: '/resources', screenshot: 'deploy-check-resources.png', text: /Tài nguyên|Resource|nguồn|học/i },
];

async function checkPage(page, check) {
  const response = await page.goto(`${baseUrl}${check.route}`, { waitUntil: 'networkidle', timeout: 45_000 });
  const status = response ? response.status() : 0;
  if (status >= 400) throw new Error(`${check.name} returned HTTP ${status}`);

  await page.screenshot({ path: path.join(screenshotDir, check.screenshot), fullPage: true });
  const bodyText = await page.locator('body').innerText({ timeout: 10_000 });
  if (!check.text.test(bodyText)) {
    throw new Error(`${check.name} did not include expected visible text`);
  }

  return { name: check.name, route: check.route, status, screenshot: `reports/screenshots/${check.screenshot}` };
}

async function main() {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    for (const check of desktopChecks) {
      results.push(await checkPage(page, check));
    }

    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
    results.push(await checkPage(mobilePage, {
      name: 'mobile-home',
      route: '/home',
      screenshot: 'deploy-check-mobile-home.png',
      text: /P-English|Hôm nay|lộ trình|whale/i,
    }));
  } finally {
    await browser.close();
  }

  const report = {
    baseUrl,
    checkedAt: new Date().toISOString(),
    results,
  };
  writeFileSync(path.join(process.cwd(), 'reports', 'deploy-browser-qa-results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
