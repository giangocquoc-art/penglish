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
  await page.evaluate(() => {
    const key = 'penglish-foundation48-progress-v1';
    const state = JSON.parse(localStorage.getItem(key) || '{"days":{}}');
    state.days = { ...(state.days || {}), 1: { started: false, completed: false, completedSteps: [], challengeResults: {}, mistakes: [] } };
    localStorage.setItem(key, JSON.stringify(state));
  });
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
    const nextButton = page.getByRole('button', { name: /Tiếp tục|Hoàn thành ngày học/i });
    if (await nextButton.isDisabled().catch(() => true)) {
      const currentStep = await page.locator('[data-testid^="foundation48-step-"]').getAttribute('data-testid').catch(() => 'step-unknown');
      const visibleControls = await page.locator('[data-testid]').evaluateAll((elements) => elements.filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).map((element) => element.dataset.testid).filter((id) => id?.startsWith('foundation48-')));
      throw new Error(`Cannot continue while seeking ${testId}; current=${currentStep}; controls=${visibleControls.join(',')}`);
    }
    await nextButton.click({ timeout: 10000 });
    await page.waitForTimeout(250);
  }
  throw new Error(`Could not reach ${testId}`);
}

async function answerCurrentChallengeIfNeeded(page) {
  const listeningDone = page.getByTestId('foundation48-listen-done');
  if (await listeningDone.isVisible().catch(() => false)) {
    await listeningDone.click();
    return;
  }

  const freeResponse = page.getByTestId('foundation48-free-response');
  if (await freeResponse.isVisible().catch(() => false)) {
    await freeResponse.fill('I am practicing English today.');
    await page.getByRole('button', { name: 'Lưu câu trả lời' }).click();
    return;
  }

  const meaningReveal = page.getByTestId('foundation48-meaning-reveal');
  if (await meaningReveal.isVisible().catch(() => false)) {
    await meaningReveal.click();
    return;
  }

  const vocabularyCard = page.getByTestId('foundation48-vocab-flashcards');
  if (await vocabularyCard.isVisible().catch(() => false)) {
    const rememberButtons = vocabularyCard.locator('[data-testid^="foundation48-vocab-remember-"]');
    for (let index = 0; index < await rememberButtons.count(); index += 1) await rememberButtons.nth(index).click();
    return;
  }

  const speakingDrill = page.getByTestId('foundation48-speaking-drill');
  if (await speakingDrill.isVisible().catch(() => false)) {
    const doneButtons = speakingDrill.locator('[data-testid^="foundation48-speaking-done-"]');
    if (await doneButtons.count()) await doneButtons.first().click();
    return;
  }

  if (await page.getByTestId('foundation48-choice-options').isVisible().catch(() => false)) {
    const options = page.locator('[data-testid^="foundation48-answer-option-"]');
    const feedback = page.getByTestId('foundation48-challenge-feedback');
    for (let index = 0; index < await options.count(); index += 1) {
      await options.nth(index).click();
      await feedback.waitFor({ timeout: 8000 });
      const correct = await feedback.evaluate((element) => getComputedStyle(element).borderColor === 'rgb(134, 239, 172)');
      if (correct) return;
      await page.screenshot({ path: path.join(outDir, 'foundation48-day1-bot-bien-wrong-answer.png'), fullPage: true });
      const currentViewport = page.viewportSize();
      await page.setViewportSize({ width: 390, height: 844 });
      await options.nth(index).click();
      await feedback.waitFor({ timeout: 8000 });
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(outDir, 'foundation48-day1-bot-bien-wrong-answer-mobile.png'), fullPage: true });
      await page.setViewportSize(currentViewport);
      await page.evaluate(() => {
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
        const dayKey = `${parts.find((part) => part.type === 'year').value}-${parts.find((part) => part.type === 'month').value}-${parts.find((part) => part.type === 'day').value}`;
        localStorage.setItem('p-english:daily-hearts', JSON.stringify({ maxHearts: 5, heartsLeft: 5, wrongCountToday: 0, vietnamDayKey: dayKey, lastUpdatedAt: new Date().toISOString() }));
        window.dispatchEvent(new Event('p-english:hearts-updated'));
      });
    }
    throw new Error('Could not find a correct answer among the visible Foundation48 options.');
  }

  if (await page.getByTestId('foundation48-fill-answer').isVisible().catch(() => false)) {
    const prompt = await page.getByTestId('foundation48-day-page').innerText();
    const answer = prompt.includes('They ___') ? 'are' : prompt.includes('She ___') ? 'is' : 'am';
    await page.getByTestId('foundation48-fill-answer').fill(answer);
    await page.getByRole('button', { name: 'Poo xem giúp' }).click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    return;
  }

  if (await page.getByTestId('foundation48-sentence-builder').isVisible().catch(() => false)) {
    const prompt = await page.getByTestId('foundation48-day-page').innerText();
    const words = prompt.includes('Cô ấy') ? ['She', 'is', 'not', 'tall'] : prompt.includes('Anh ấy') ? ['He', 'is', 'not', 'tall'] : prompt.includes('chúng tôi') ? ['We', 'are', 'not', 'sad'] : ['I', 'am', 'a', 'student'];
    for (const word of words) {
      const token = page.locator('[data-testid="foundation48-token"]', { hasText: new RegExp(`^${word}[.,!?]?$`, 'i') }).first();
      if (await token.count()) await token.click();
    }
    const sentenceCheck = page.getByTestId('foundation48-sentence-check');
    if (!(await sentenceCheck.isEnabled())) {
      const tokenLabels = await page.locator('[data-testid="foundation48-token"]').evaluateAll((elements) => elements.map((element) => element.innerText.trim()));
      throw new Error(`No sentence tokens matched the QA answer. Prompt: ${prompt.slice(-420)}; tokens: ${tokenLabels.join(' | ')}`);
    }
    await sentenceCheck.click();
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
    await stepUntilVisible(page, 'foundation48-complete-reward', 90);
    await page.getByText('Hoàn thành Ngày 1', { exact: true }).waitFor({ timeout: 8000 });
    await page.getByTestId('foundation48-learned-summary').waitFor({ timeout: 8000 });
    await assertVietnamese(page);
    await checkOverflow(page, 'complete desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.complete), fullPage: true });

    await page.setViewportSize({ width: 390, height: 900 });
    await gotoDay(page);
    await page.getByTestId('foundation48-mobile-step-actions').waitFor({ timeout: 8000 });
    await page.getByRole('button', { name: /Tiếp tục/ }).waitFor({ timeout: 8000 });
    await checkOverflow(page, 'mobile day 1');
    await page.screenshot({ path: path.join(outDir, screenshots.mobile), fullPage: true });

    await context.close();

    const publicContext = await browser.newContext();
    const publicPage = await publicContext.newPage();
    await publicPage.goto(`${baseUrl}${dayPath}`, { waitUntil: 'domcontentloaded' });
    await publicPage.getByTestId('foundation48-day-page').waitFor({ timeout: 15000 });
    const publicText = await publicPage.locator('body').innerText();
    if (!/Khách|Tiến độ lưu trên thiết bị này/i.test(publicText)) throw new Error('Guest Foundation48 route did not show local progress state.');
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
