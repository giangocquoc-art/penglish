const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const userId = '00000000-0000-4000-8000-000000000049';
const screenshots = {
  desktop: 'home-daily-dashboard-desktop.png',
  mobile: 'home-daily-dashboard-mobile.png',
};

async function setupContext(browser) {
  const context = await browser.newContext();
  await context.route('**/*supabase.co/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: userId, email: 'qa-home@example.com', role: 'authenticated' }) });
      return;
    }
    if (url.includes('/auth/v1/token')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'qa-access-token',
          refresh_token: 'qa-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: { id: userId, email: 'qa-home@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });
  await context.addInitScript(({ userId }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: userId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-home@example.com' })}.`;
    window.localStorage.setItem('p-english:supabase-auth', JSON.stringify({
      access_token: token,
      refresh_token: 'qa-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiresAt,
      user: {
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'qa-home@example.com',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Home QA' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
    window.localStorage.setItem('penglish-foundation48-progress-v1', JSON.stringify({
      lastDayOpened: 2,
      streak: 3,
      lastStudiedDate: '2026-06-08',
      days: {
        1: { started: true, completed: true, completedAt: new Date().toISOString(), completedSteps: [] },
        2: { started: true, completed: false, completedSteps: ['intro'] },
      },
    }));
  }, { userId });
  return context;
}

async function gotoHome(page, width, height, label) {
  await page.setViewportSize({ width, height });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('home-page').waitFor({ timeout: 20000 }).catch(async (error) => {
    const body = await page.locator('body').innerText().catch(() => 'NO_BODY');
    throw new Error(`${label}: ${error.message}\nCurrent URL: ${page.url()}\nBody preview: ${body.slice(0, 900)}`);
  });
  await page.getByTestId('home-daily-title').waitFor({ timeout: 12000 });
}

async function assertHomeContent(page, label) {
  await page.getByText('Hôm nay học gì cùng Poo?', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByText('Chỉ cần một bài nhỏ. Poo sẽ dẫn bạn từng bước.', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByRole('link', { name: /Bắt đầu bài hôm nay/i }).waitFor({ timeout: 8000 });
  await page.getByText('Poo nhắc bạn', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByText('Làm bài hôm nay trước. Ôn tập và shadowing là phần phụ.', { exact: true }).waitFor({ timeout: 8000 });

  const expectedTasks = [
    ['home-task-today-lesson', 'Học bài hôm nay', 'Bắt đầu'],
    ['home-task-mistakes', 'Ôn lỗi sai', 'Ôn nhẹ'],
    ['home-task-shadowing', 'Shadowing 5 phút', 'Luyện nói'],
    ['home-task-words', 'Từ vựng cần nhớ', 'Ôn từ'],
  ];
  for (const [testId, text, action] of expectedTasks) {
    const card = page.getByTestId(testId);
    await card.waitFor({ timeout: 8000 });
    await card.getByText(text, { exact: true }).waitFor({ timeout: 8000 });
    await card.getByText(action, { exact: true }).waitFor({ timeout: 8000 });
  }
  await page.getByTestId('home-task-mistakes').getByText('Ôn nhẹ vài câu để chắc hơn.', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByTestId('home-task-shadowing').getByText('Nghe một câu, nói lại chậm.', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByTestId('home-task-words').getByText('Ôn vài từ để giữ trí nhớ.', { exact: true }).waitFor({ timeout: 8000 });

  const primaryCount = await page.getByRole('link', { name: /Bắt đầu bài hôm nay/i }).count();
  if (primaryCount !== 1) throw new Error(`${label}: expected one main today CTA, got ${primaryCount}`);

  const duplicateStart = await page.getByText('Học tiếp', { exact: true }).count();
  if (duplicateStart) throw new Error(`${label}: duplicate Học tiếp CTA should not be visible on /home`);
}

async function assertMobileStatusRow(page, label) {
  const statusRow = page.getByTestId('home-compact-mobile-status');
  await statusRow.waitFor({ timeout: 8000 });
  await statusRow.getByText('Ngày 2', { exact: true }).waitFor({ timeout: 8000 });
  await statusRow.getByText('Bọt biển 5/5', { exact: true }).waitFor({ timeout: 8000 });
  await statusRow.getByText('Chưa bắt đầu', { exact: true }).waitFor({ timeout: 8000 });
  const metrics = await page.evaluate(() => {
    const row = document.querySelector('[data-testid="home-compact-mobile-status"]')?.getBoundingClientRect();
    const desktopPills = document.querySelector('[data-testid="home-simple-progress"]')?.getBoundingClientRect();
    return {
      rowHeight: row?.height ?? null,
      desktopPillsVisible: Boolean(desktopPills && desktopPills.width > 0 && desktopPills.height > 0),
    };
  });
  if (metrics.rowHeight === null || metrics.rowHeight > 48) throw new Error(`${label}: mobile status row should stay compact: ${JSON.stringify(metrics)}`);
  if (metrics.desktopPillsVisible) throw new Error(`${label}: desktop 3-pill status should be hidden on mobile: ${JSON.stringify(metrics)}`);
}

async function assertMobileBottomSafe(page, label) {
  await page.getByTestId('home-today-summary').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const metrics = await page.evaluate(() => {
    const summary = document.querySelector('[data-testid="home-today-summary"]')?.getBoundingClientRect();
    const lastTask = document.querySelector('[data-testid="home-task-words"]')?.getBoundingClientRect();
    return {
      viewportHeight: window.innerHeight,
      reservedBottomNavSpace: 96,
      summaryBottom: summary?.bottom ?? null,
      lastTaskBottom: lastTask?.bottom ?? null,
      bodyScrollWidth: document.body.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
    };
  });
  if (metrics.summaryBottom === null || metrics.summaryBottom > metrics.viewportHeight - metrics.reservedBottomNavSpace) {
    throw new Error(`${label}: bottom nav could cover summary card/action: ${JSON.stringify(metrics)}`);
  }
}

async function assertMobileFirstScreen(page, label) {
  const metrics = await page.evaluate(() => {
    const hero = document.querySelector('[data-testid="home-daily-hero"]')?.getBoundingClientRect();
    const cta = document.querySelector('[data-testid="home-primary-today-cta"]')?.getBoundingClientRect();
    const cards = Array.from(document.querySelectorAll('[data-testid^="home-task-"]')).map((item) => {
      const box = item.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, height: box.height };
    });
    return {
      viewportHeight: window.innerHeight,
      heroBottom: hero?.bottom ?? null,
      ctaBottom: cta?.bottom ?? null,
      visibleCards: cards.filter((card) => card.top < window.innerHeight && card.bottom > 0).length,
    };
  });
  if (metrics.ctaBottom === null || metrics.ctaBottom > metrics.viewportHeight) throw new Error(`${label}: primary CTA should be visible on first screen: ${JSON.stringify(metrics)}`);
  if (metrics.visibleCards < 2) throw new Error(`${label}: expected at least 2 task cards on first screen: ${JSON.stringify(metrics)}`);
}

async function assertNavigation(context, fromPage, testId, expectedPath, label) {
  const page = await context.newPage();
  await page.setViewportSize(fromPage.viewportSize() || { width: 1366, height: 900 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('home-page').waitFor({ timeout: 20000 });
  await page.getByTestId(testId).click();
  await page.waitForURL((url) => url.pathname.startsWith(expectedPath), { timeout: 12000 }).catch(async (error) => {
    throw new Error(`${label}: expected ${testId} to navigate to ${expectedPath}, got ${page.url()}\n${error.message}`);
  });
  await page.close();
}

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) throw new Error(`${label} horizontal overflow: ${JSON.stringify(overflow)}`);
}

async function assertVietnamese(page, label) {
  const body = await page.locator('body').innerText();
  const mojibakeMarkers = ['�', 'Ä‘', 'á»', 'áº'];
  const marker = mojibakeMarkers.find((item) => body.includes(item));
  if (marker) throw new Error(`${label}: possible mojibake marker "${marker}" detected: ${body.slice(0, 300)}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const consoleErrors = [];
  const networkErrors = [];

  try {
    const context = await setupContext(browser);
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`${page.url()}: ${msg.text()}`);
    });
    page.on('pageerror', (error) => consoleErrors.push(`${page.url()}: ${error.message}`));
    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();
      if ((status === 404 || status >= 500) && !url.includes('supabase.co')) networkErrors.push(`${status} ${url}`);
    });

    await gotoHome(page, 1366, 900, 'desktop');
    await assertHomeContent(page, 'desktop');
    await assertVietnamese(page, 'desktop');
    await checkOverflow(page, 'desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.desktop), fullPage: true });

    await assertNavigation(context, page, 'home-primary-today-cta', '/luyen-tieng-anh/48-ngay-lay-goc/ngay/2', 'primary CTA');
    await assertNavigation(context, page, 'home-task-today-lesson', '/luyen-tieng-anh/48-ngay-lay-goc/ngay/2', 'today task');
    await assertNavigation(context, page, 'home-task-mistakes', '/words', 'mistakes task');
    await assertNavigation(context, page, 'home-task-shadowing', '/shadowing', 'shadowing task');
    await assertNavigation(context, page, 'home-task-words', '/words', 'words task');

    await gotoHome(page, 390, 844, 'mobile');
    await assertHomeContent(page, 'mobile');
    await assertMobileFirstScreen(page, 'mobile');
    await assertMobileStatusRow(page, 'mobile');
    await assertMobileBottomSafe(page, 'mobile');
    await assertVietnamese(page, 'mobile');
    await checkOverflow(page, 'mobile');
    await page.screenshot({ path: path.join(outDir, screenshots.mobile), fullPage: true });

    await context.close();
  } catch (error) {
    errors.push(error.message || String(error));
  } finally {
    await browser.close();
  }

  if (consoleErrors.length) errors.push(`console errors:\n${consoleErrors.join('\n')}`);
  if (networkErrors.length) errors.push(`network 404/500:\n${networkErrors.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Home daily dashboard QA passed. Screenshots saved to ${outDir}`);
})();
