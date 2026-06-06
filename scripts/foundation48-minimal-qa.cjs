const { chromium } = require('playwright');
const path = require('path');

const baseUrl = 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const routes = [
  { url: '/luyen-tieng-anh/48-ngay-lay-goc', file: 'foundation48-minimal-main-desktop.png', width: 1366, height: 768, testId: 'foundation48-roadmap-page' },
  { url: '/luyen-tieng-anh/48-ngay-lay-goc', file: 'foundation48-minimal-main-mobile.png', width: 390, height: 900, testId: 'foundation48-roadmap-page' },
  { url: '/luyen-tieng-anh/48-ngay-lay-goc/ngay/1', file: 'foundation48-day1-step-lesson.png', width: 1366, height: 900, testId: 'foundation48-day-page' },
  { url: '/luyen-tieng-anh/48-ngay-lay-goc/ngay/21', file: 'foundation48-day21-listening-step.png', width: 1366, height: 900, testId: 'foundation48-day-page', clickToText: 'Nghe và làm quen' },
  { url: '/luyen-tieng-anh/48-ngay-lay-goc/ngay/29', file: 'foundation48-day29-listening-step.png', width: 1366, height: 900, testId: 'foundation48-day-page', clickToText: 'Nghe và làm quen' },
  { url: '/luyen-tieng-anh/48-ngay-lay-goc/ngay/48', file: 'foundation48-day48-final.png', width: 1366, height: 900, testId: 'foundation48-day-page' },
];

async function clickUntilText(page, text, max = 8) {
  for (let i = 0; i < max; i += 1) {
    if (await page.getByText(text, { exact: false }).first().isVisible().catch(() => false)) return true;
    await page.getByRole('button', { name: /Tiếp tục/i }).click();
    await page.waitForTimeout(250);
  }
  return page.getByText(text, { exact: false }).first().isVisible().catch(() => false);
}

async function clickUntilTestId(page, testId, max = 8) {
  for (let i = 0; i < max; i += 1) {
    if (await page.getByTestId(testId).isVisible().catch(() => false)) return true;
    await page.getByRole('button', { name: /Tiếp tục/i }).click();
    await page.waitForTimeout(250);
  }
  return page.getByTestId(testId).isVisible().catch(() => false);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  for (const route of routes) {
    await page.setViewportSize({ width: route.width, height: route.height });
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'networkidle' });
    await page.getByTestId(route.testId).waitFor({ timeout: 15000 });

    if (route.clickToText) {
      const found = await clickUntilText(page, route.clickToText);
      if (!found) errors.push(`could not reach text "${route.clickToText}" on ${route.url}`);
    }

    const overflow = await page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    if (overflow.hasHorizontalOverflow) errors.push(`horizontal overflow on ${route.url}: ${JSON.stringify(overflow)}`);

    await page.screenshot({ path: path.join(outDir, route.file), fullPage: true });
  }

  await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/1`, { waitUntil: 'networkidle' });
  const day1Audio = await page.locator('[data-testid="foundation48-audio-section"]').count();
  if (day1Audio !== 0) errors.push('Day 1 should not render an audio section.');

  await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/21`, { waitUntil: 'networkidle' });
  await clickUntilText(page, 'Nghe và làm quen');
  const day21Audio = await page.locator('[data-testid^="foundation48-audio-item-"]').count();
  if (day21Audio < 1) errors.push('Day 21 listening step should render playable audio items.');

  await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/29`, { waitUntil: 'networkidle' });
  await clickUntilText(page, 'Nghe và làm quen');
  const day29Audio = await page.locator('[data-testid^="foundation48-audio-item-"]').count();
  if (day29Audio < 1) errors.push('Day 29 listening step should render playable audio items.');

  await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/19`, { waitUntil: 'networkidle' });
  await clickUntilTestId(page, 'foundation48-step-video');
  const videoNotice = await page.getByText('Video nguồn đã được phát hiện nhưng chưa được public hóa.', { exact: false }).first().isVisible().catch(() => false);
  if (!videoNotice) errors.push('Day 19 should show safe video notice.');

  await browser.close();

  const filteredFailedRequests = failedRequests.filter((item) => !item.includes('favicon') && !item.includes('net::ERR_ABORTED'));
  if (filteredFailedRequests.length) errors.push(`failed requests:\n${filteredFailedRequests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log('Foundation48 minimal QA passed. Screenshots saved.');
})();
