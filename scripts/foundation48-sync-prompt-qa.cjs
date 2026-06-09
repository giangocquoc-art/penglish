const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const dayPath = '/luyen-tieng-anh/48-ngay-lay-goc/ngay/1';
const userId = '00000000-0000-4000-8000-000000000048';
const screenshots = {
  vocab: 'foundation48-sync-vocab-desktop.png',
  quiz: 'foundation48-sync-quiz-desktop.png',
  complete: 'foundation48-completion-cta-desktop.png',
  mobileComplete: 'foundation48-completion-cta-mobile.png',
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
          user: { id: userId, email: 'qa-foundation48@example.com', role: 'authenticated' },
        }),
      });
      return;
    }
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: userId, email: 'qa-foundation48@example.com', role: 'authenticated' }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });
  await context.addInitScript(({ userId }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: userId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: 'qa-foundation48@example.com' })}.`;
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
  }, { userId });
  return context;
}

async function gotoDay(page) {
  await page.goto(`${baseUrl}${dayPath}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 }).catch(async (error) => {
    const body = await page.locator('body').innerText().catch(() => 'NO_BODY');
    throw new Error(`${error.message}\nCurrent URL: ${page.url()}\nBody preview: ${body.slice(0, 900)}`);
  });
}

async function stepUntilVisible(page, testId, limit = 32) {
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

async function assertNoSyncPrompt(page, label) {
  const count = await page.locator('[data-testid="foundation48-sync-prompt-inline"]').count();
  if (count) throw new Error(`${label}: sync prompt should not appear before completion`);
  const body = await page.locator('body').innerText();
  if (body.includes('Đồng bộ tiến độ trên thiết bị này lên tài khoản Google?')) throw new Error(`${label}: intrusive old sync copy is visible`);
}

async function assertNoOverlap(page, targetTestId, promptTestId, label) {
  const boxes = await page.evaluate(({ targetTestId, promptTestId }) => {
    const target = document.querySelector(`[data-testid="${targetTestId}"]`);
    const prompt = document.querySelector(`[data-testid="${promptTestId}"]`);
    if (!target || !prompt) return null;
    const a = target.getBoundingClientRect();
    const b = prompt.getBoundingClientRect();
    return {
      target: { left: a.left, right: a.right, top: a.top, bottom: a.bottom },
      prompt: { left: b.left, right: b.right, top: b.top, bottom: b.bottom },
      overlaps: !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top),
    };
  }, { targetTestId, promptTestId });

  if (boxes?.overlaps) throw new Error(`${label}: sync prompt overlaps ${targetTestId}: ${JSON.stringify(boxes)}`);
}

async function assertCompletionCtaHierarchy(page, label) {
  const nextDayButtons = await page.getByRole('link', { name: /^Sang Ngày 2$/ }).count();
  if (nextDayButtons !== 1) throw new Error(`${label}: expected exactly one primary Sang Ngày 2 link, got ${nextDayButtons}`);

  const duplicateNextDayButtons = await page.getByRole('link', { name: /^Sang ngày 2$|^Ngày 2$/ }).count();
  if (duplicateNextDayButtons) throw new Error(`${label}: duplicate next-day CTA is visible`);

  const reviewButtons = await page.getByRole('link', { name: /^Ôn lại bài này$/ }).count();
  if (reviewButtons !== 1) throw new Error(`${label}: expected exactly one secondary Ôn lại bài này link, got ${reviewButtons}`);

  const completedButtons = await page.getByRole('button', { name: /^Đã hoàn thành$/ }).count();
  if (completedButtons) throw new Error(`${label}: Đã hoàn thành should be a status badge, not a button`);

  await page.getByTestId('foundation48-completed-status-badge').waitFor({ timeout: 8000 });
  await page.getByTestId('foundation48-learned-summary').waitFor({ timeout: 8000 });
  await page.getByText('Bạn đã học', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByText('5 câu luyện nói', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByText('10 từ đã ôn', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByText('9 câu quiz', { exact: true }).waitFor({ timeout: 8000 });
  const reviewTestId = (page.viewportSize()?.width || 0) < 768 ? 'foundation48-grammar-review-mobile' : 'foundation48-grammar-review-desktop';
  await page.getByTestId(reviewTestId).waitFor({ timeout: 8000 });
  await page.getByTestId('foundation48-complete-actions').waitFor({ timeout: 8000 });
  await page.getByTestId('foundation48-sync-prompt-inline').waitFor({ timeout: 8000 });

  const rewardText = await page.getByTestId('foundation48-complete-reward').innerText();
  if (rewardText.includes('Cần nhớ:')) throw new Error(`${label}: long reminder summary should be moved out of the main completion copy`);

  const hierarchy = await page.evaluate(() => {
    const actions = document.querySelector('[data-testid="foundation48-complete-actions"]');
    const sync = document.querySelector('[data-testid="foundation48-sync-prompt-inline"]');
    if (!actions || !sync) return null;
    const a = actions.getBoundingClientRect();
    const b = sync.getBoundingClientRect();
    return { actionsTop: a.top, actionsBottom: a.bottom, syncTop: b.top, syncBottom: b.bottom };
  });
  if (!hierarchy || hierarchy.syncTop < hierarchy.actionsBottom) throw new Error(`${label}: sync prompt should be below completion CTAs: ${JSON.stringify(hierarchy)}`);
}

async function assertCompletionReadability(page, label) {
  const metrics = await page.evaluate(() => {
    const reward = document.querySelector('[data-testid="foundation48-complete-reward"]');
    const actions = document.querySelector('[data-testid="foundation48-complete-actions"]');
    const mobileReview = document.querySelector('[data-testid="foundation48-grammar-review-mobile"]');
    const sync = document.querySelector('[data-testid="foundation48-sync-prompt-inline"]');
    const actionBox = actions?.getBoundingClientRect();
    const syncBox = sync?.getBoundingClientRect();
    return {
      rewardTextLength: reward?.textContent?.length || 0,
      actionTop: actionBox?.top ?? null,
      actionBottom: actionBox?.bottom ?? null,
      syncTop: syncBox?.top ?? null,
      viewportHeight: window.innerHeight,
      mobileReviewOpen: mobileReview instanceof HTMLDetailsElement ? mobileReview.open : null,
    };
  });

  if (metrics.rewardTextLength > 1400) throw new Error(`${label}: completion reward copy is too long: ${JSON.stringify(metrics)}`);
  if (label.includes('mobile') && metrics.mobileReviewOpen !== false) throw new Error(`${label}: mobile knowledge review should be collapsed by default: ${JSON.stringify(metrics)}`);
  if (metrics.actionBottom === null || metrics.actionBottom > metrics.viewportHeight) throw new Error(`${label}: completion CTA should be visible without extra scrolling: ${JSON.stringify(metrics)}`);
  if (metrics.syncTop !== null && metrics.actionBottom !== null && metrics.syncTop < metrics.actionBottom) throw new Error(`${label}: sync prompt should not compete above completion CTA: ${JSON.stringify(metrics)}`);
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

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-vocab-flashcards');
    await page.getByTestId('foundation48-vocab-remember-1').click();
    await assertNoSyncPrompt(page, 'vocab desktop');
    await assertVietnamese(page);
    await checkOverflow(page, 'vocab desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.vocab), fullPage: true });

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-speaking-drill');
    await page.getByTestId('foundation48-speaking-done-1').click();
    await assertNoSyncPrompt(page, 'speaking desktop');
    await assertVietnamese(page);
    await checkOverflow(page, 'speaking desktop');

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-choice-options');
    await page.getByTestId('foundation48-answer-option-1').click();
    await page.getByTestId('foundation48-challenge-feedback').waitFor({ timeout: 8000 });
    await assertNoSyncPrompt(page, 'quiz desktop');
    await assertVietnamese(page);
    await checkOverflow(page, 'quiz desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.quiz), fullPage: true });

    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-complete-reward', 32);
    await page.getByRole('button', { name: /Hoàn thành ngày học/i }).click();
    await page.getByTestId('foundation48-completion-panel').waitFor({ timeout: 8000 });
    await page.getByTestId('foundation48-sync-prompt-inline').waitFor({ timeout: 8000 });
    await page.getByText('Đồng bộ tiến độ lên tài khoản Google?', { exact: true }).waitFor({ timeout: 8000 });
    await assertCompletionCtaHierarchy(page, 'completion desktop');
    await assertCompletionReadability(page, 'completion desktop');
    await assertNoOverlap(page, 'foundation48-completion-panel', 'foundation48-sync-prompt-inline', 'completion panel desktop');
    await assertVietnamese(page);
    await checkOverflow(page, 'complete desktop');
    await page.screenshot({ path: path.join(outDir, screenshots.complete), fullPage: true });

    await page.getByRole('button', { name: 'Để sau' }).click();
    if (await page.getByTestId('foundation48-sync-prompt-inline').isVisible().catch(() => false)) throw new Error('sync prompt should hide after Để sau');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('foundation48-day-page').waitFor({ timeout: 20000 });
    if (await page.getByTestId('foundation48-sync-prompt-inline').isVisible().catch(() => false)) throw new Error('sync prompt should stay hidden in the same lesson session after Để sau');

    await page.setViewportSize({ width: 390, height: 900 });
    await page.evaluate(({ userId }) => window.sessionStorage.removeItem(`penglish-foundation48-sync-prompt-session:${userId}:1`), { userId });
    await gotoDay(page);
    await stepUntilVisible(page, 'foundation48-complete-reward', 32);
    await page.getByTestId('foundation48-completion-panel').waitFor({ timeout: 12000 });
    await page.getByTestId('foundation48-sync-prompt-inline').waitFor({ timeout: 8000 });
    await assertCompletionCtaHierarchy(page, 'completion mobile');
    await assertCompletionReadability(page, 'completion mobile');
    await assertNoOverlap(page, 'foundation48-completion-panel', 'foundation48-sync-prompt-inline', 'completion panel mobile');
    await assertVietnamese(page);
    await checkOverflow(page, 'complete mobile');
    await page.screenshot({ path: path.join(outDir, screenshots.mobileComplete), fullPage: true });

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

  console.log(`Foundation48 sync prompt QA passed. Screenshots saved to ${outDir}`);
})();
