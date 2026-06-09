const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

async function reachSpeakingStep(page) {
  await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/1`, { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/luyen-tieng-anh/48-ngay-lay-goc') && !page.url().includes('/ngay/1')) {
    const dayHref = '/luyen-tieng-anh/48-ngay-lay-goc/ngay/1';
    const dayLink = page.locator(`a[href="${dayHref}"]`).first();
    if (await dayLink.count()) {
      await dayLink.click({ timeout: 10000 });
    } else if (await page.getByTestId('foundation48-primary-cta').count()) {
      await page.getByTestId('foundation48-primary-cta').click({ timeout: 10000 });
    } else {
      await page.getByRole('link', { name: /Bắt đầu học|Học tiếp|Học tiếp hôm nay/i }).first().click({ timeout: 10000 });
    }
    await page.waitForURL(/\/luyen-tieng-anh\/48-ngay-lay-goc\/ngay\/1/, { timeout: 10000 }).catch(() => undefined);
  }
  await page.getByTestId('foundation48-day-page').waitFor({ timeout: 15000 }).catch(async (error) => {
    const body = await page.locator('body').innerText().catch(() => 'NO_BODY');
    throw new Error(`${error.message}\nCurrent URL: ${page.url()}\nBody preview: ${body.slice(0, 800)}`);
  });

  for (let i = 0; i < 10; i += 1) {
    if (await page.getByTestId('foundation48-speaking-drill').isVisible().catch(() => false)) return;
    await page.getByRole('button', { name: /Tiếp tục/i }).click();
    await page.waitForTimeout(300);
  }

  throw new Error('Could not reach speaking drill step.');
}

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) throw new Error(`${label} horizontal overflow: ${JSON.stringify(overflow)}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const consoleErrors = [];

  const context = await browser.newContext();
  await context.route('**/*supabase.co/**', async (route) => {
    const url = route.request().url();
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
          user: { id: '00000000-0000-4000-8000-000000000048', email: 'qa-foundation48@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '00000000-0000-4000-8000-000000000048', email: 'qa-foundation48@example.com', role: 'authenticated' }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });
  await context.addInitScript(() => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: '00000000-0000-4000-8000-000000000048', aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-foundation48@example.com' })}.`;
    window.localStorage.setItem('p-english:supabase-auth', JSON.stringify({
      access_token: token,
      refresh_token: 'qa-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiresAt,
      user: {
        id: '00000000-0000-4000-8000-000000000048',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'qa-foundation48@example.com',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Foundation48 QA' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => consoleErrors.push(`${page.url()}: ${error.message}`));

  try {
    await page.setViewportSize({ width: 1366, height: 900 });
    await reachSpeakingStep(page);
    await page.getByText('Nói nhại 5 câu', { exact: true }).waitFor({ timeout: 8000 });
    await page.getByText('Nói thành tiếng để tạo phản xạ, không chỉ đọc thầm.', { exact: true }).waitFor({ timeout: 8000 });
    await page.getByText('0/5 câu đã luyện', { exact: true }).waitFor({ timeout: 8000 });
    await page.getByText('Câu 1/5', { exact: true }).waitFor({ timeout: 8000 });
    await page.getByText('Nghe mẫu', { exact: true }).first().waitFor({ timeout: 8000 });
    await page.getByText('Tôi đã nói xong', { exact: true }).first().waitFor({ timeout: 8000 });
    await checkOverflow(page, 'desktop before');
    await page.screenshot({ path: path.join(outDir, 'foundation48-speaking-step-desktop-before.png'), fullPage: true });

    await page.getByTestId('foundation48-speaking-done-1').click();
    await page.getByTestId('foundation48-speaking-done-2').click();
    await page.getByText('2/5 câu đã luyện', { exact: true }).waitFor({ timeout: 8000 });
    await page.getByText('Đã nói xong', { exact: true }).first().waitFor({ timeout: 8000 });
    await checkOverflow(page, 'desktop after');
    await page.screenshot({ path: path.join(outDir, 'foundation48-speaking-step-desktop-after-2-done.png'), fullPage: true });

    await page.getByRole('button', { name: /Tiếp tục/i }).click();
    await page.waitForTimeout(350);
    if (await page.getByTestId('foundation48-speaking-drill').isVisible().catch(() => false)) {
      throw new Error('Tiếp tục did not advance from speaking overview step.');
    }

    await page.setViewportSize({ width: 390, height: 900 });
    await reachSpeakingStep(page);
    await page.getByText('0/5 câu đã luyện', { exact: true }).waitFor({ timeout: 8000 });
    await checkOverflow(page, 'mobile');
    await page.screenshot({ path: path.join(outDir, 'foundation48-speaking-step-mobile.png'), fullPage: true });
  } catch (error) {
    errors.push(error.message || String(error));
  } finally {
    await context.close();
    await browser.close();
  }

  if (consoleErrors.length) errors.push(`console errors:\n${consoleErrors.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log('Foundation48 speaking drill QA passed. Screenshots saved to reports/screenshots.');
})();
