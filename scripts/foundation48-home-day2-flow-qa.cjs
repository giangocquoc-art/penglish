const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
const reportPath = path.resolve(__dirname, '..', 'reports', 'foundation48-home-day2-flow-qa.json');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

const progressKey = 'penglish-foundation48-progress-v1';
const authUserId = '00000000-0000-4000-8000-000000000048';
const day2Path = '/luyen-tieng-anh/48-ngay-lay-goc/ngay/2';
const screenshots = {
  homeBefore: 'foundation48-home-day2-before.png',
  lessonVocab: 'foundation48-day2-vocab-flow.png',
  lessonExplain: 'foundation48-day2-explain-flow.png',
  lessonQuiz: 'foundation48-day2-quiz-flow.png',
  homeAfter: 'foundation48-home-day2-after-complete.png',
  homeAfterRefresh: 'foundation48-home-day2-after-refresh.png',
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function setupContext(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
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
          user: { id: authUserId, email: 'qa-foundation48-flow@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: authUserId, email: 'qa-foundation48-flow@example.com', role: 'authenticated' }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });

  await context.addInitScript(({ progressKey, authUserId }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: authUserId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-foundation48-flow@example.com' })}.`;
    window.localStorage.setItem('p-english:supabase-auth', JSON.stringify({
      access_token: token,
      refresh_token: 'qa-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiresAt,
      user: {
        id: authUserId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'qa-foundation48-flow@example.com',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Foundation48 Flow QA' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
    if (!window.localStorage.getItem(progressKey)) {
      window.localStorage.setItem(progressKey, JSON.stringify({
        lastDayOpened: 2,
        lastStudiedDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        streak: 1,
        days: {
          1: { started: true, completed: true, completedAt: new Date(Date.now() - 86400000).toISOString(), completedSteps: ['intro', 'complete'] },
          2: { started: true, completed: false, completedSteps: ['intro'] },
        },
      }));
    }
  }, { progressKey, authUserId });

  return context;
}

async function waitForHome(page) {
  await page.getByTestId('home-page').waitFor({ timeout: 20000 });
  await page.getByTestId('home-primary-today-cta').waitFor({ timeout: 10000 });
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) throw new Error(`${label} horizontal overflow: ${JSON.stringify(overflow)}`);
}

async function assertHomeState(page, label, expected) {
  const text = await page.locator('body').innerText();
  for (const marker of expected) {
    if (!text.includes(marker)) throw new Error(`${label} missing expected text: ${marker}\nBody preview: ${text.slice(0, 900)}`);
  }
}

async function answerCurrentChallengeIfNeeded(page) {
  if (await page.getByTestId('foundation48-choice-options').isVisible().catch(() => false)) {
    await page.getByTestId('foundation48-answer-option-1').click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    return;
  }

  if (await page.getByTestId('foundation48-fill-answer').isVisible().catch(() => false)) {
    const body = await page.locator('body').innerText();
    const answer = body.includes('___ you') ? 'Are' : body.includes('___ she') ? 'Is' : body.includes('he ___ not') ? 'is' : 'Are';
    await page.getByTestId('foundation48-fill-answer').fill(answer);
    await page.getByRole('button', { name: /^Kiểm tra$/i }).click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    return;
  }

  if (await page.getByTestId('foundation48-sentence-builder').isVisible().catch(() => false)) {
    const sequences = [
      ['Are', 'you', 'a', 'student'],
      ['No,', 'she', 'is', 'not'],
      ['No', 'she', 'is', 'not'],
    ];
    for (const words of sequences) {
      let canUseSequence = true;
      for (const word of words) {
        const tokenCount = await page.locator('[data-testid^="foundation48-token-"]', { hasText: new RegExp(`^${word}$`, 'i') }).count();
        if (!tokenCount) canUseSequence = false;
      }
      if (!canUseSequence) continue;
      for (const word of words) {
        await page.locator('[data-testid^="foundation48-token-"]', { hasText: new RegExp(`^${word}$`, 'i') }).first().click({ timeout: 5000 });
      }
      await page.getByTestId('foundation48-sentence-check').click();
      await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
      return;
    }
    throw new Error('Could not find a supported Day 2 sentence-order token sequence.');
  }

  if (await page.getByTestId('foundation48-speaking-self-practiced').isVisible().catch(() => false)) {
    await page.getByTestId('foundation48-speaking-self-practiced').click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
  }
}

async function advanceTo(page, testId, limit = 34) {
  for (let index = 0; index < limit; index += 1) {
    if (await page.getByTestId(testId).isVisible().catch(() => false)) return index;
    await answerCurrentChallengeIfNeeded(page);
    await page.getByRole('button', { name: /Tiếp tục|Hoàn thành/i }).click({ timeout: 10000 });
    await page.waitForTimeout(180);
  }
  throw new Error(`Could not reach ${testId}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const consoleErrors = [];
  const networkErrors = [];
  const report = { baseUrl, day2Path, screenshots, checks: [], finalProgress: null };

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

    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
    await waitForHome(page);
    await assertHomeState(page, 'home before', ['Ngày 2', 'Đang học']);
    await assertNoOverflow(page, 'home before');
    await page.screenshot({ path: path.join(outDir, screenshots.homeBefore), fullPage: true });
    const beforeProgress = await page.evaluate((progressKey) => JSON.parse(window.localStorage.getItem(progressKey) || '{}'), progressKey);
    const beforeCompletedDays = Object.values(beforeProgress.days || {}).filter((day) => day && day.completed).length;
    if (beforeCompletedDays !== 1) throw new Error(`Expected 1 completed Foundation48 day before flow, got ${beforeCompletedDays}: ${JSON.stringify(beforeProgress)}`);
    report.checks.push('Home showed the current Day 2 target with started Day 2 state; local progress had 1/48 completed days.');

    await page.getByTestId('home-primary-today-cta').click();
    await page.waitForURL(new RegExp(`${day2Path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), { timeout: 12000 });
    await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 });
    report.checks.push('Bắt đầu bài hôm nay routed to Foundation48 Day 2.');

    await advanceTo(page, 'foundation48-meaning-card');
    await page.getByTestId('foundation48-meaning-reveal').click();
    await page.screenshot({ path: path.join(outDir, screenshots.lessonExplain), fullPage: true });
    report.checks.push('Lesson includes explanation step.');

    await advanceTo(page, 'foundation48-vocab-flashcards');
    await page.getByTestId('foundation48-vocab-remember-1').click();
    await page.screenshot({ path: path.join(outDir, screenshots.lessonVocab), fullPage: true });
    report.checks.push('Lesson includes vocabulary/input step.');

    await advanceTo(page, 'foundation48-choice-options');
    await page.screenshot({ path: path.join(outDir, screenshots.lessonQuiz), fullPage: true });
    report.checks.push('Lesson includes quick quiz step.');

    await advanceTo(page, 'foundation48-complete-reward', 42);
    await page.getByTestId('foundation48-complete-reward').waitFor({ timeout: 10000 });
    await page.getByTestId('foundation48-complete-day').click();
    await page.waitForURL(/\/home$/, { timeout: 12000 });
    await waitForHome(page);
    await assertHomeState(page, 'home after completion', ['Ngày 3', 'Hoàn thành']);
    const afterProgress = await page.evaluate((progressKey) => JSON.parse(window.localStorage.getItem(progressKey) || '{}'), progressKey);
    const afterCompletedDays = Object.values(afterProgress.days || {}).filter((day) => day && day.completed).length;
    if (afterCompletedDays !== 2) throw new Error(`Expected 2 completed Foundation48 days after flow, got ${afterCompletedDays}: ${JSON.stringify(afterProgress)}`);
    await assertNoOverflow(page, 'home after completion');
    await page.screenshot({ path: path.join(outDir, screenshots.homeAfter), fullPage: true });
    report.checks.push('Completion CTA persisted Day 2 progress, increased completed days from 1 to 2, and returned to /home.');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForHome(page);
    await assertHomeState(page, 'home after refresh', ['Ngày 3', 'Hoàn thành']);
    await page.screenshot({ path: path.join(outDir, screenshots.homeAfterRefresh), fullPage: true });
    report.checks.push('Refresh preserved completed Day 2 progress.');

    report.finalProgress = await page.evaluate((progressKey) => JSON.parse(window.localStorage.getItem(progressKey) || '{}'), progressKey);
    const refreshedCompletedDays = Object.values(report.finalProgress.days || {}).filter((day) => day && day.completed).length;
    if (refreshedCompletedDays !== 2) throw new Error(`Expected 2 completed Foundation48 days after refresh, got ${refreshedCompletedDays}: ${JSON.stringify(report.finalProgress)}`);
    if (!report.finalProgress?.days?.['2']?.completed) throw new Error(`Day 2 did not persist as completed: ${JSON.stringify(report.finalProgress)}`);
    if (report.finalProgress.lastStudiedDate !== todayKey()) throw new Error(`lastStudiedDate did not update to today: ${JSON.stringify(report.finalProgress)}`);
    await context.close();
  } catch (error) {
    errors.push(error.message || String(error));
  } finally {
    await browser.close();
  }

  if (consoleErrors.length) errors.push(`console errors:\n${consoleErrors.join('\n')}`);
  if (networkErrors.length) errors.push(`network 404/500:\n${networkErrors.join('\n')}`);

  report.errors = errors;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Foundation48 home Day 2 flow QA passed. Report: ${reportPath}`);
})();
