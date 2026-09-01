const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const dayPath = '/luyen-tieng-anh/48-ngay-lay-goc/ngay/1';
const screenshots = {
  listening: 'foundation48-day1-listening-desktop.png',
  meaning: 'foundation48-day1-meaning-desktop.png',
  vocab: 'foundation48-day1-vocab-desktop.png',
  speaking: 'foundation48-day1-speaking-desktop.png',
  quiz: 'foundation48-day1-quiz-desktop.png',
  complete: 'foundation48-day1-complete-desktop.png',
  mobile: 'foundation48-day1-mobile.png',
};

async function setupContext(browser) {
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
  return context;
}

async function gotoDay(page) {
  await page.goto(`${baseUrl}${dayPath}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 }).catch(async (error) => {
    const body = await page.locator('body').innerText().catch(() => 'NO_BODY');
    throw new Error(`${error.message}\nCurrent URL: ${page.url()}\nBody preview: ${body.slice(0, 900)}`);
  });
}

async function gotoRoadmap(page) {
  await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('foundation48-roadmap-page').waitFor({ timeout: 15000 });
}

async function stepUntilVisible(page, testId, limit = 28) {
  for (let index = 0; index < limit; index += 1) {
    if (await page.getByTestId(testId).isVisible().catch(() => false)) return index;
    await answerCurrentChallengeIfNeeded(page);
    await page.getByRole('button', { name: /Tiếp tục|Hoàn thành ngày học/i }).click({ timeout: 10000 });
    await page.waitForTimeout(250);
  }
  throw new Error(`Could not reach ${testId}`);
}

async function answerCurrentChallengeIfNeeded(page) {
  if (await page.getByTestId('foundation48-choice-options').isVisible().catch(() => false)) {
    await page.getByTestId('foundation48-answer-option-1').click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    return;
  }

  if (await page.getByTestId('foundation48-fill-answer').isVisible().catch(() => false)) {
    const prompt = await page.getByTestId('foundation48-day-page').innerText();
    const answer = prompt.includes('They ___') ? 'are' : prompt.includes('She ___') ? 'is' : 'am';
    await page.getByTestId('foundation48-fill-answer').fill(answer);
    await page.getByRole('button', { name: /^Kiểm tra$/i }).click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    return;
  }

  if (await page.getByTestId('foundation48-sentence-builder').isVisible().catch(() => false)) {
    const prompt = await page.getByTestId('foundation48-day-page').innerText();
    const words = prompt.includes('Cô ấy') ? ['She', 'is', 'not', 'tall'] : ['I', 'am', 'a', 'student'];
    for (const word of words) {
      const token = page.locator('[data-testid^="foundation48-token-"]', { hasText: new RegExp(`^${word}$`, 'i') }).first();
      if (await token.count()) await token.click();
    }
    await page.getByTestId('foundation48-sentence-check').click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    return;
  }

  if (await page.getByTestId('foundation48-speaking-self-practiced').isVisible().catch(() => false)) {
    await page.getByTestId('foundation48-speaking-self-practiced').click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
  }
}

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) throw new Error(`${label} horizontal overflow: ${JSON.stringify(overflow)}`);
}

async function assertVietnamese(page) {
  const body = await page.locator('body').innerText();
  const mojibakeMarkers = ['�', 'Ä‘', 'á»', 'áº'];
  const marker = mojibakeMarkers.find((item) => body.includes(item));
  if (marker) throw new Error(`Possible mojibake marker "${marker}" detected: ${body.slice(0, 300)}`);
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

    await page.setViewportSize({ width: 1366, height: 900 });
    await gotoRoadmap(page);
    await page.getByTestId('foundation48-primary-cta').waitFor({ timeout: 10000 });
    await checkOverflow(page, 'roadmap desktop');

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-meaning-card');
    await page.getByTestId('foundation48-meaning-reveal').click();
    await page.getByTestId('foundation48-meaning-revealed').waitFor({ timeout: 8000 });
    await assertVietnamese(page);
    await checkOverflow(page, 'meaning desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.meaning), fullPage: true });

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-vocab-flashcards');
    await page.getByTestId('foundation48-vocab-remember-1').click();
    await page.getByTestId('foundation48-vocab-progress').waitFor({ timeout: 8000 });
    await assertVietnamese(page);
    await checkOverflow(page, 'vocab desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.vocab), fullPage: true });

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-listen-first');
    await page.getByTestId('foundation48-listen-main').click();
    await page.getByTestId('foundation48-listen-readalong').click();
    await assertVietnamese(page);
    await checkOverflow(page, 'listening desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.listening), fullPage: true });

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-speaking-drill');
    await page.getByTestId('foundation48-speaking-done-1').click();
    await page.getByTestId('foundation48-speaking-progress').waitFor({ timeout: 8000 });
    await assertVietnamese(page);
    await checkOverflow(page, 'speaking desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.speaking), fullPage: true });

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-choice-options');
    await page.getByTestId('foundation48-answer-option-1').click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    await assertVietnamese(page);
    await checkOverflow(page, 'quiz desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.quiz), fullPage: true });

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-sentence-builder');
    const tokenCount = await page.locator('[data-testid^="foundation48-token-"]').count();
    for (let index = 0; index < Math.min(tokenCount, 4); index += 1) await page.locator('[data-testid^="foundation48-token-"]').nth(index).click();
    await page.getByTestId('foundation48-sentence-check').click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    await checkOverflow(page, 'sentence builder desktop');

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-complete-reward', 28);
    await page.getByText('Hoàn thành Ngày 1', { exact: true }).waitFor({ timeout: 8000 });
    await page.getByText('Bạn đã luyện nghe, hiểu, từ vựng và nói nhại.', { exact: true }).waitFor({ timeout: 8000 });
    await assertVietnamese(page);
    await checkOverflow(page, 'complete desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.complete), fullPage: true });

    await page.setViewportSize({ width: 390, height: 900 });
    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-listen-first');
    await checkOverflow(page, 'mobile day 1');
    await page.screenshot({ path: path.join(outDir, screenshots.mobile), fullPage: true });

    await context.close();

    const publicContext = await browser.newContext();
    const publicPage = await publicContext.newPage();
    await publicPage.goto(`${baseUrl}${dayPath}`, { waitUntil: 'domcontentloaded' });
    await publicPage.waitForURL(/\/login/, { timeout: 15000 });
    if (!publicPage.url().includes('/login')) throw new Error(`Unauthenticated route did not redirect to login: ${publicPage.url()}`);
    await publicContext.close();
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

  console.log(`Foundation48 all-step QA passed. Screenshots saved to ${outDir}`);
})();
