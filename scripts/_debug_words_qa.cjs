const { chromium } = require('playwright');

(async () => {
  const baseUrl = process.env.PENGLISH_FINAL_QA_BASE_URL || 'http://localhost:5174';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', (msg) => console.log('console', msg.type(), msg.text()));
  page.on('pageerror', (error) => console.log('pageerror', error.message));
  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('url', page.url());
  console.log('title', await page.title());
  console.log('root count', await page.locator('[data-testid="vocab-mobile-root"]').count());
  console.log(await page.locator('body').innerText({ timeout: 5000 }).catch((error) => error.message));
  await page.screenshot({ path: 'reports/screenshots/debug-words.png', fullPage: true });
  await browser.close();
})();
