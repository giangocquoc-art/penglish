const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const userId = '00000000-0000-4000-8000-000000000057';
const screenshots = {
  desktop: 'practice-poo-review-desktop.png',
  mobile: 'practice-poo-review-mobile.png',
  flowDesktop: 'practice-poo-review-flow-desktop.png',
  completeMobile: 'practice-poo-review-complete-mobile.png',
};

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

async function setupContext(browser, options = {}) {
  const context = await browser.newContext();
  const errors = [];
  const failedResponses = [];

  await context.route('**/*supabase.co/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: userId, email: 'qa-practice@example.com', role: 'authenticated' }) });
      return;
    }
    if (url.includes('/auth/v1/token')) {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      const token = `${encodeJwtPart({ alg: 'none', typ: 'JWT' })}.${encodeJwtPart({ sub: userId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-practice@example.com' })}.`;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: token,
          refresh_token: 'qa-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: expiresAt,
          user: { id: userId, email: 'qa-practice@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });

  await context.addInitScript(({ userId, seedMistakes }) => {
    window.__P_ENGLISH_QA__ = true;
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: userId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-practice@example.com' })}.`;
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
        email: 'qa-practice@example.com',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Practice QA' },
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
    if (seedMistakes) {
      const now = new Date().toISOString();
      window.localStorage.setItem('penglish.learning.loop.v1', JSON.stringify({
        schemaVersion: 1,
        xp: 20,
        streak: 2,
        completed: {},
        mistakes: {
          'qa-like': {
            id: 'qa-like',
            source: 'practice',
            sourceId: 'qa-practice',
            type: 'multiple-choice',
            prompt: 'I very like English.',
            correctAnswer: 'I really like English.',
            userAnswer: 'I very like English.',
            explanation: 'very không đứng trước like.',
            attempts: 1,
            lastWrongAt: now,
            nextReviewAt: now,
            resolved: false,
            tags: ['A1'],
          },
          'qa-are': {
            id: 'qa-are',
            source: 'foundation48',
            sourceId: 'day-2',
            type: 'multiple-choice',
            prompt: 'She are happy.',
            correctAnswer: 'She is happy.',
            userAnswer: 'She are happy.',
            explanation: 'She đi với is trong hiện tại đơn.',
            attempts: 1,
            lastWrongAt: now,
            nextReviewAt: now,
            resolved: false,
            tags: ['A1'],
          },
        },
        words: {
          'qa-word-english': {
            id: 'qa-word-english',
            term: 'English',
            meaningVi: 'tiếng Anh',
            example: 'I really like English.',
            source: 'practice',
            sourceId: 'qa-practice',
            mastery: 0,
            favorite: false,
            weakCount: 1,
            learnedAt: now,
          },
        },
        activities: [],
        updatedAt: now,
      }));
    } else {
      window.localStorage.removeItem('penglish.learning.loop.v1');
    }
  }, { userId, seedMistakes: Boolean(options.seedMistakes) });

  return { context, errors, failedResponses };
}

async function attachWatchers(page, errors, failedResponses) {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    const status = response.status();
    if (status === 404 || status >= 500) failedResponses.push(`${status} ${response.url()}`);
  });
}

async function gotoPractice(page, width, height, label, errors = []) {
  await page.setViewportSize({ width, height });
  await page.goto(`${baseUrl}/practice`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('practice-mobile-root').waitFor({ timeout: 20000 }).catch(async (error) => {
    const body = await page.locator('body').innerText().catch(() => 'NO_BODY');
    const html = await page.content().catch(() => 'NO_HTML');
    throw new Error(`${label}: ${error.message}\nCurrent URL: ${page.url()}\nConsole errors: ${errors.join('\n')}\nBody preview: ${body.slice(0, 900)}\nHTML preview: ${html.slice(0, 1200)}`);
  });
}

async function assertNoMojibake(page, label) {
  const body = await page.locator('body').innerText();
  if (/[�]|Ã|Â|Æ|Ð|ð/.test(body)) throw new Error(`${label}: mojibake detected`);
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  if (overflow) {
    const sizes = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    throw new Error(`${label}: horizontal overflow ${JSON.stringify(sizes)}`);
  }
}

async function assertBottomSafe(page, testId, label) {
  await page.getByTestId(testId).scrollIntoViewIfNeeded();
  const ok = await page.getByTestId(testId).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.bottom <= window.innerHeight - 8;
  });
  if (!ok) throw new Error(`${label}: bottom nav may cover ${testId}`);
}

async function completeFlow(page) {
  await page.getByTestId('practice-poo-start').click();
  await page.getByTestId('practice-poo-flow').waitFor({ timeout: 8000 });
  for (let index = 0; index < 3; index += 1) {
    await page.getByTestId('practice-poo-correct-answer').first().click();
    await page.getByTestId('practice-poo-next-repeat').click();
    await page.getByTestId('practice-poo-repeat-step').waitFor({ timeout: 8000 });
    await page.getByTestId('practice-poo-understood').click();
  }
  await page.getByTestId('practice-poo-complete').waitFor({ timeout: 8000 });
}

async function assertHomeMistakeNavigation(browser) {
  const { context, errors, failedResponses } = await setupContext(browser, { seedMistakes: true });
  const page = await context.newPage();
  await attachWatchers(page, errors, failedResponses);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('home-task-mistakes').waitFor({ timeout: 20000 });
  await page.getByTestId('home-task-mistakes').click();
  await page.waitForURL(/\/practice(?:$|[?#])/, { timeout: 10000 });
  await page.getByTestId('practice-poo-hero').waitFor({ timeout: 10000 });
  if (errors.length) throw new Error(`home navigation console errors:\n${errors.join('\n')}`);
  if (failedResponses.length) throw new Error(`home navigation failed responses:\n${failedResponses.join('\n')}`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const real = await setupContext(browser, { seedMistakes: true });
    const desktop = await real.context.newPage();
    await attachWatchers(desktop, real.errors, real.failedResponses);
    await gotoPractice(desktop, 1366, 900, 'desktop', real.errors);
    await desktop.getByText('Ôn lỗi sai cùng Poo').waitFor({ timeout: 8000 });
    await desktop.getByText('Poo gom vài chỗ bạn hay quên để ôn nhẹ hôm nay.').waitFor({ timeout: 8000 });
    await desktop.getByText('Câu hay nhầm').waitFor({ timeout: 8000 });
    await desktop.getByText('Từ cần nhớ').waitFor({ timeout: 8000 });
    await desktop.getByText('Nghe lại câu cũ').waitFor({ timeout: 8000 });
    await desktop.screenshot({ path: path.join(outDir, screenshots.desktop), fullPage: true });
    await desktop.getByTestId('practice-poo-start').click();
    await desktop.getByTestId('practice-poo-flow').waitFor({ timeout: 8000 });
    await desktop.screenshot({ path: path.join(outDir, screenshots.flowDesktop), fullPage: true });
    await assertNoMojibake(desktop, 'desktop flow');
    await assertNoHorizontalOverflow(desktop, 'desktop flow');
    if (real.errors.length) throw new Error(`desktop console errors:\n${real.errors.join('\n')}`);
    if (real.failedResponses.length) throw new Error(`desktop failed responses:\n${real.failedResponses.join('\n')}`);
    await real.context.close();

    const empty = await setupContext(browser, { seedMistakes: false });
    const mobile = await empty.context.newPage();
    await attachWatchers(mobile, empty.errors, empty.failedResponses);
    await gotoPractice(mobile, 390, 844, 'mobile empty', empty.errors);
    await mobile.getByText('Hôm nay chưa có lỗi lớn. Bạn có thể ôn nhẹ vài câu nền tảng.').waitFor({ timeout: 8000 });
    await mobile.getByText('Ôn nhẹ 3 câu').waitFor({ timeout: 8000 });
    await mobile.getByText('I am a student.').waitFor({ timeout: 8000 });
    await mobile.screenshot({ path: path.join(outDir, screenshots.mobile), fullPage: true });
    await assertNoMojibake(mobile, 'mobile empty');
    await assertNoHorizontalOverflow(mobile, 'mobile empty');
    await assertBottomSafe(mobile, 'practice-poo-summary', 'mobile empty');
    await completeFlow(mobile);
    await mobile.getByText('Poo đã dọn xong lỗi hôm nay!').waitFor({ timeout: 8000 });
    await mobile.screenshot({ path: path.join(outDir, screenshots.completeMobile), fullPage: true });
    await mobile.getByTestId('practice-poo-back-home').click();
    await mobile.waitForURL(/\/home(?:$|[?#])/, { timeout: 10000 });
    if (empty.errors.length) throw new Error(`mobile console errors:\n${empty.errors.join('\n')}`);
    if (empty.failedResponses.length) throw new Error(`mobile failed responses:\n${empty.failedResponses.join('\n')}`);
    await empty.context.close();

    await assertHomeMistakeNavigation(browser);

    console.log(JSON.stringify({
      ok: true,
      screenshots: Object.values(screenshots).map((name) => path.join('reports', 'screenshots', name)),
      checks: [
        '/practice desktop 1366x900',
        '/practice mobile 390x844',
        '/home Ôn lỗi sai navigation to /practice',
        'empty fallback',
        'flow start -> answer -> mark understood -> complete',
        'completion CTA back to /home',
        'no console errors, no 404/500, no mojibake, no horizontal overflow, bottom nav safety',
      ],
    }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
