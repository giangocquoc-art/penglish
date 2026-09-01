const { chromium } = require('playwright');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('[data-testid="foundation48-primary-cta"]', { timeout: 10000 });
  await page.screenshot({ path: 'reports/screenshots/foundation48-poo-progress-desktop.png', fullPage: true });

  const desktop = await page.evaluate(() => {
    const cta = document.querySelector('[data-testid="foundation48-primary-cta"]');
    const allDaysList = document.querySelector('[data-testid="foundation48-compact-day-list"]');
    const cards = Array.from(document.querySelectorAll('[data-testid^="foundation48-day-card-"]'));
    const weekDots = document.querySelectorAll('[data-testid^="foundation48-week-day-"]');
    const pooTrack = document.querySelector('[data-testid="foundation48-poo-progress-track"]');
    const pooMascot = document.querySelector('[data-testid="foundation48-poo-progress-mascot"]');
    return {
      ctaText: cta?.textContent?.trim() || '',
      allDaysInitiallyExpanded: Boolean(allDaysList && allDaysList.getBoundingClientRect().height > 0),
      compactCardsInitiallyVisible: cards.filter((card) => card.getBoundingClientRect().height > 0).length,
      weekDots: weekDots.length,
      hasPooProgressTrack: Boolean(pooTrack),
      hasPooProgressMascot: Boolean(pooMascot),
      progressRole: pooTrack?.getAttribute('role') || '',
      progressValue: pooTrack?.getAttribute('aria-valuenow') || '',
      hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
      bodyText: document.body.innerText.slice(0, 1000),
    };
  });

  await page.click('[data-testid="foundation48-all-days-toggle"]');
  await page.waitForSelector('[data-testid="foundation48-day-card-1"]', { timeout: 5000 });
  await page.screenshot({ path: 'reports/screenshots/foundation48-poo-progress-expanded-all-days.png', fullPage: true });
  const expandedCount = await page.locator('[data-testid^="foundation48-day-card-"]').count();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  mobile.on('pageerror', (error) => consoleErrors.push(error.message));
  await mobile.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc`, { waitUntil: 'networkidle', timeout: 30000 });
  await mobile.waitForSelector('[data-testid="foundation48-primary-cta"]', { timeout: 10000 });
  await mobile.screenshot({ path: 'reports/screenshots/foundation48-poo-progress-mobile.png', fullPage: true });
  const mobileState = await mobile.evaluate(() => ({
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
    ctaText: document.querySelector('[data-testid="foundation48-primary-cta"]')?.textContent?.trim() || '',
    hasPooProgressTrack: Boolean(document.querySelector('[data-testid="foundation48-poo-progress-track"]')),
    hasPooProgressMascot: Boolean(document.querySelector('[data-testid="foundation48-poo-progress-mascot"]')),
  }));

  await browser.close();

  const errors = [];
  if (!/Bắt đầu học|Học tiếp hôm nay/.test(desktop.ctaText)) errors.push('Primary CTA text is not beginner clear.');
  if (desktop.allDaysInitiallyExpanded) errors.push('All days list is expanded by default.');
  if (desktop.compactCardsInitiallyVisible > 0) errors.push('Day cards are visible before expanding all days.');
  if (desktop.weekDots !== 7) errors.push(`Expected 7 weekly path dots, found ${desktop.weekDots}.`);
  if (!desktop.hasPooProgressTrack) errors.push('Poo ocean progress track is missing on desktop.');
  if (!desktop.hasPooProgressMascot) errors.push('Poo progress mascot is missing on desktop.');
  if (desktop.progressRole !== 'progressbar') errors.push('Poo progress track is missing progressbar role.');
  if (desktop.hasHorizontalOverflow) errors.push('Desktop horizontal overflow detected.');
  if (!mobileState.hasPooProgressTrack) errors.push('Poo ocean progress track is missing on mobile.');
  if (!mobileState.hasPooProgressMascot) errors.push('Poo progress mascot is missing on mobile.');
  if (mobileState.hasHorizontalOverflow) errors.push('Mobile horizontal overflow detected.');
  if (expandedCount < 48) errors.push(`Expected compact expanded list to include 48 days, found ${expandedCount}.`);
  if (consoleErrors.length) errors.push(`Console errors detected: ${consoleErrors.join(' | ')}`);

  const report = {
    ok: errors.length === 0,
    generatedAt: new Date().toISOString(),
    baseUrl,
    desktop,
    mobile: mobileState,
    expandedCount,
    consoleErrors,
    errors,
    screenshots: [
      'reports/screenshots/foundation48-poo-progress-desktop.png',
      'reports/screenshots/foundation48-poo-progress-mobile.png',
      'reports/screenshots/foundation48-poo-progress-expanded-all-days.png',
    ],
  };

  require('fs').writeFileSync('reports/foundation48-entry-simplification-qa-results.json', JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: report.ok, errors: errors.length, consoleErrors: consoleErrors.length, screenshots: report.screenshots }, null, 2));
  if (!report.ok) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
