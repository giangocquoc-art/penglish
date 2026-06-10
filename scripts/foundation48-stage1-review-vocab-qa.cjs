const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
const reportPath = path.resolve(__dirname, '..', 'reports', 'foundation48-stage1-review-vocab-qa.json');
const userId = '00000000-0000-4000-8000-000000000148';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function setupContext(browser) {
  const context = await browser.newContext();
  const errors = [];
  const failedResponses = [];

  await context.route('**/*supabase.co/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: userId, email: 'qa-foundation48@example.com', role: 'authenticated' }) });
      return;
    }
    if (url.includes('/auth/v1/token')) {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      const token = `${encodeJwtPart({ alg: 'none', typ: 'JWT' })}.${encodeJwtPart({ sub: userId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-foundation48@example.com' })}.`;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: token,
          refresh_token: 'qa-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: expiresAt,
          user: { id: userId, email: 'qa-foundation48@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });

  await context.addInitScript(({ userId }) => {
    window.__P_ENGLISH_QA__ = true;
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: userId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-foundation48@example.com' })}.`;
    const now = new Date().toISOString();

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
        email: 'qa-foundation48@example.com',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Foundation48 QA' },
        created_at: now,
        updated_at: now,
      },
    }));

    window.localStorage.setItem('penglish-foundation48-progress-v1', JSON.stringify({
      lastDayOpened: 5,
      streak: 4,
      lastStudiedDate: now.slice(0, 10),
      days: {
        1: { started: true, completed: true, completedAt: now, completedSteps: [] },
        2: { started: true, completed: true, completedAt: now, completedSteps: [] },
        3: { started: true, completed: false, completedSteps: ['intro'] },
      },
    }));

    window.localStorage.setItem('penglish.learning.loop.v1', JSON.stringify({
      schemaVersion: 1,
      xp: 60,
      streak: 4,
      completed: {},
      mistakes: {
        'qa-foundation48-day3-who': {
          id: 'qa-foundation48-day3-who',
          source: 'foundation48',
          sourceId: 'day-3',
          type: 'multiple-choice',
          prompt: '___ is she?',
          correctAnswer: 'Who is she?',
          userAnswer: 'What is she?',
          explanation: 'Who dùng để hỏi người.',
          attempts: 1,
          lastWrongAt: now,
          nextReviewAt: now,
          resolved: false,
          tags: ['day-3', 'who-what'],
        },
      },
      words: {
        'foundation48:day-3:word:who': {
          id: 'foundation48:day-3:word:who',
          term: 'who',
          meaningVi: 'ai',
          example: 'Who is she?',
          source: 'foundation48',
          sourceId: 'day-3',
          cefrLevel: 'A1',
          topic: 'Ai và cái gì? — hỏi Who / What với to be',
          mastery: 1,
          favorite: true,
          weakCount: 2,
          learnedAt: now,
          lastReviewedAt: now,
        },
        'foundation48:day-5:word:usually': {
          id: 'foundation48:day-5:word:usually',
          term: 'usually',
          meaningVi: 'thường thường',
          example: 'I usually study English at night.',
          source: 'foundation48',
          sourceId: 'day-5',
          cefrLevel: 'A1',
          topic: 'Thói quen hằng ngày',
          mastery: 2,
          favorite: false,
          weakCount: 0,
          learnedAt: now,
          lastReviewedAt: now,
        },
      },
      activities: [],
      updatedAt: now,
    }));
  }, { userId });

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

async function assertNoMojibake(page, label) {
  const body = await page.locator('body').innerText();
  const suspiciousLines = body.split('\n').filter((line) => /[�]|(?:Ã\S*[ÂÆ])|(?:Â\S*[ÃÆ])|Æ/.test(line));
  if (suspiciousLines.length) throw new Error(`${label}: mojibake detected: ${suspiciousLines.slice(0, 5).join(' | ')}`);
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  if (overflow) {
    const sizes = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    throw new Error(`${label}: horizontal overflow ${JSON.stringify(sizes)}`);
  }
}

async function collectFoundation48VisibleLessonText(page) {
  const seen = [];
  for (let step = 0; step < 6; step += 1) {
    await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 });
    seen.push(await page.locator('body').innerText());
    const nextButton = page.getByRole('button', { name: 'Tiếp tục' });
    if (!(await nextButton.isVisible().catch(() => false))) break;
    if (!(await nextButton.isEnabled().catch(() => false))) break;
    await nextButton.click();
  }
  return seen.join('\n--- foundation48 step ---\n');
}

async function checkFoundation48DeepDays(page, report) {
  const expectations = [
    { day: 3, texts: ['Ai và cái gì?', 'Who is she?', 'What is this?', 'What are these?'] },
    { day: 4, texts: ['Where', 'When', 'Where is your book?', 'They are at school.'] },
    { day: 5, texts: ['thói quen', 'I study English.', 'He goes to school.', 'We study every day.'] },
    { day: 6, texts: ['don’t', 'doesn’t', 'I do not like coffee.', 'She does not play tennis.'] },
    { day: 7, texts: ['Do', 'Does', 'Do you study English?', 'Yes, I do.'] },
  ];

  for (const item of expectations) {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(`${baseUrl}/luyen-tieng-anh/48-ngay-lay-goc/ngay/${item.day}`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 });
    const lessonText = await collectFoundation48VisibleLessonText(page);
    for (const text of item.texts) assert(lessonText.includes(text), `Day ${item.day} missing text across lesson steps: ${text}`);
    await assertNoMojibake(page, `day ${item.day}`);
    await assertNoHorizontalOverflow(page, `day ${item.day}`);
    report.checks.push(`Foundation48 Day ${item.day} has deep lesson text across lesson steps and renders without overflow.`);
  }
  await page.screenshot({ path: path.join(outDir, 'foundation48-stage1-day7-deep-lesson.png'), fullPage: true });
  report.screenshots.push('reports/screenshots/foundation48-stage1-day7-deep-lesson.png');
}

async function checkMobileLearningPathAccordion(page, report) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/learning-path`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('foundation48-learning-path-page').waitFor({ timeout: 20000 });
  await page.getByTestId('foundation48-roadmap-mobile-accordion').waitFor({ timeout: 20000 });
  await page.getByTestId('foundation48-stage-accordion-button-2').click();
  await page.getByTestId('foundation48-stage-accordion-panel-2').getByTestId('foundation48-day-card-5').waitFor({ timeout: 8000 });
  const desktopGridVisible = await page.getByTestId('foundation48-roadmap-grid').isVisible().catch(() => false);
  assert(!desktopGridVisible, 'Desktop roadmap grid should be hidden on mobile accordion viewport.');
  await assertNoMojibake(page, 'learning path mobile accordion');
  await assertNoHorizontalOverflow(page, 'learning path mobile accordion');
  await page.screenshot({ path: path.join(outDir, 'foundation48-learning-path-mobile-accordion.png'), fullPage: true });
  report.screenshots.push('reports/screenshots/foundation48-learning-path-mobile-accordion.png');
  report.checks.push('/learning-path mobile uses stage accordion and can open Stage 2 days.');
}

async function checkPracticeReview(page, report) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/practice`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('practice-mobile-root').waitFor({ timeout: 20000 });
  await page.getByText('What is she?').waitFor({ timeout: 8000 });
  await page.getByText('who = ai').waitFor({ timeout: 8000 });
  const sourceHref = await page.getByRole('link', { name: 'Mở nguồn' }).first().getAttribute('href');
  assert(sourceHref === '/luyen-tieng-anh/48-ngay-lay-goc/ngay/3', `Practice source link should target Day 3, got: ${sourceHref}`);
  await page.getByTestId('practice-poo-start').click();
  await page.getByTestId('practice-poo-flow').waitFor({ timeout: 8000 });
  await page.getByTestId('practice-poo-correct-answer').first().click();
  await page.getByTestId('practice-poo-next-repeat').click();
  await page.getByTestId('practice-poo-repeat-step').waitFor({ timeout: 8000 });
  await assertNoMojibake(page, 'practice real mistake review');
  await assertNoHorizontalOverflow(page, 'practice real mistake review');
  await page.screenshot({ path: path.join(outDir, 'practice-real-mistake-weak-word-review.png'), fullPage: true });
  report.screenshots.push('reports/screenshots/practice-real-mistake-weak-word-review.png');
  report.checks.push('/practice shows seeded real Foundation48 mistake + weak word and source link routes to Day 3.');
}

async function checkVocabularyBank(page, report) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/words`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('vocab-mobile-root').waitFor({ timeout: 20000 });
  await page.getByTestId('vocab-learned-words-panel').waitFor({ timeout: 20000 });
  await page.getByText('who').first().waitFor({ timeout: 8000 });
  await page.getByText('48 ngày lấy gốc · Ngày 3').waitFor({ timeout: 8000 });
  const day3ReviewHref = await page.getByRole('link', { name: 'Ôn ngay' }).filter({ hasText: 'Ôn ngay' }).first().getAttribute('href');
  assert(day3ReviewHref === '/luyen-tieng-anh/48-ngay-lay-goc/ngay/3', `Vocabulary review link should target Day 3, got: ${day3ReviewHref}`);
  await page.getByTestId('vocab-status-filter-weak').click();
  await page.getByText('who').first().waitFor({ timeout: 8000 });
  await page.getByTestId('vocab-status-filter-favorite').click();
  await page.getByText('who').first().waitFor({ timeout: 8000 });
  await assertNoMojibake(page, 'vocabulary learned/weak/favorite bank');
  await assertNoHorizontalOverflow(page, 'vocabulary learned/weak/favorite bank');
  await page.screenshot({ path: path.join(outDir, 'vocab-real-learned-weak-favorite-bank.png'), fullPage: true });
  report.screenshots.push('reports/screenshots/vocab-real-learned-weak-favorite-bank.png');
  report.checks.push('/words shows real learned, weak, favorite Foundation48 words and routes review to Day 3.');
}

(async () => {
  const report = { ok: false, baseUrl, screenshots: [], checks: [], errors: [] };
  const browser = await chromium.launch({ headless: true });
  try {
    const { context, errors, failedResponses } = await setupContext(browser);
    const page = await context.newPage();
    await attachWatchers(page, errors, failedResponses);

    await checkFoundation48DeepDays(page, report);
    await checkMobileLearningPathAccordion(page, report);
    await checkPracticeReview(page, report);
    await checkVocabularyBank(page, report);

    if (errors.length) report.errors.push(`Console errors:\n${errors.join('\n')}`);
    if (failedResponses.length) report.errors.push(`Failed responses:\n${failedResponses.join('\n')}`);
    report.ok = report.errors.length === 0;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
    await context.close();
  } catch (error) {
    report.errors.push(error.stack || error.message || String(error));
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
