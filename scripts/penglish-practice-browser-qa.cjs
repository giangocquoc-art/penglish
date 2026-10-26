const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'penglish-practice-browser-qa-results.json');

const checks = [
  {
    name: 'sentence-order-token-identity-duplicate-words',
    kind: 'sentence-order',
    route: '/practice?lessonId=grammar-a2-going-to-plans&mode=quiz',
    viewport: { width: 1440, height: 960 },
    screenshot: 'penglish-practice-qa-sentence-order.png',
  },
  {
    name: 'mobile-practice-mode-shell',
    kind: 'sentence-order',
    route: '/practice?lessonId=grammar-a2-going-to-plans&mode=quiz',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    screenshot: 'penglish-practice-qa-mobile-quiz.png',
  },
  {
    name: 'authored-speed-prompts-appear-in-speed-game',
    kind: 'speed-prompt',
    route: '/practice?lessonId=a1-listening-meeting-classmate&mode=speed',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    screenshot: 'penglish-practice-qa-speed-authored-prompt.png',
  },
];

async function openFirstSentenceOrder(page) {
  await page.getByText(/Thử sức nhẹ|Quiz/i).first().waitFor({ timeout: 20_000 });

  for (let step = 0; step < 12; step += 1) {
    const tokens = page.getByTestId('practice-quiz-token');
    if (await tokens.count()) return;

    if (await page.getByTestId('practice-quiz-option-1').count()) {
      await page.getByTestId('practice-quiz-option-1').click();
      await page.getByTestId('practice-quiz-check').click();
      await page.getByTestId('practice-quiz-next').click();
      continue;
    }

    if (await page.getByTestId('practice-quiz-fill-input').count()) {
      await page.getByTestId('practice-quiz-fill-input').fill('I');
      await page.getByTestId('practice-quiz-check').click();
      await page.getByTestId('practice-quiz-retry').click();
      await page.getByTestId('practice-quiz-fill-input').fill('This');
      await page.getByTestId('practice-quiz-check').click();
      const next = page.getByTestId('practice-quiz-next');
      if (await next.count()) await next.click();
      continue;
    }

    const nextButton = page.getByRole('button', { name: /Câu tiếp theo|Câu sau|Next/i }).first();
    if (await nextButton.count()) {
      await nextButton.click();
      continue;
    }

    throw new Error('Could not navigate to a sentence-order question.');
  }

  throw new Error('Sentence-order question was not reached within 12 transitions.');
}

async function checkSentenceOrderIdentity(page) {
  await openFirstSentenceOrder(page);
  const bankTokens = page.getByTestId('practice-quiz-token');
  const tokenCount = await bankTokens.count();
  if (tokenCount < 2) throw new Error('Sentence-order token bank has fewer than 2 tokens.');

  const tokenMetadata = [];
  for (let index = 0; index < tokenCount; index += 1) {
    const token = bankTokens.nth(index);
    tokenMetadata.push({
      id: await token.getAttribute('data-qa-token-id'),
      word: await token.getAttribute('data-qa-token-word'),
      originalIndex: await token.getAttribute('data-qa-token-original-index'),
    });
  }

  const ids = tokenMetadata.map((token) => token.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) throw new Error('Visible sentence-order tokens do not have unique token IDs.');

  const repeatedWord = tokenMetadata.find((token, index) => token.word && tokenMetadata.some((other, otherIndex) => otherIndex !== index && other.word === token.word));
  const firstToken = bankTokens.first();
  const firstId = await firstToken.getAttribute('data-qa-token-id');
  await firstToken.click();

  const selected = page.getByTestId('practice-quiz-selected-token-1');
  await selected.waitFor({ timeout: 10_000 });
  const selectedId = await selected.getAttribute('data-qa-token-id');
  if (selectedId !== firstId) throw new Error('Selected token did not preserve the bank token ID.');

  await selected.click();
  if ((await page.getByTestId('practice-quiz-selected-token-1').count()) !== 0) {
    throw new Error('Selected token did not return to the token bank after click removal.');
  }

  return {
    tokenCount,
    tokenIdsAreUnique: true,
    preservesSelectedTokenId: true,
    duplicateVisibleWordCovered: Boolean(repeatedWord),
    sampleTokens: tokenMetadata.slice(0, 8),
  };
}

async function runCheck(browser, check) {
  const page = await browser.newPage({ viewport: check.viewport, isMobile: Boolean(check.isMobile), deviceScaleFactor: check.isMobile ? 2 : 1 });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  try {
    const response = await page.goto(`${baseUrl}${check.route}`, { waitUntil: 'networkidle', timeout: 45_000 });
    const status = response ? response.status() : 0;
    if (status >= 400) throw new Error(`${check.name} returned HTTP ${status}`);

    let identity;
    if (check.kind === 'speed-prompt') {
      const bank = await page.evaluate(async () => {
        const { getLessonById } = await import('/src/lib/p-english/lesson-content-data.ts');
        const lesson = getLessonById('a1-listening-meeting-classmate');
        if (!lesson) throw new Error('Missing authored speed QA lesson.');
        const quizCount = lesson.quizQuestions.filter((question) => question.type === 'multiple-choice' && question.options?.length && question.question && !Array.isArray(question.answer)).length;
        return {
          authoredSpeedPromptCount: lesson.englishSpeedPrompts?.length ?? 0,
          expectedQuestionCount: Math.min(30, Math.min(9, lesson.vocabulary.length) + Math.min(9, Math.max(0, lesson.vocabulary.length - 9)) + quizCount + lesson.speakingReflexPrompts.length + (lesson.englishSpeedPrompts?.length ?? 0)),
        };
      });
      const metricText = await page.getByText('Kho câu hỏi', { exact: true }).locator('..').innerText();
      const actualQuestionCount = Number(metricText.split('\n').at(-1));
      if (bank.authoredSpeedPromptCount < 1 || actualQuestionCount !== bank.expectedQuestionCount) {
        throw new Error(`Authored speed prompts are missing from the Speed question pool: ${JSON.stringify({ ...bank, actualQuestionCount })}`);
      }
      const ctaBox = await page.getByRole('button', { name: 'Bắt đầu', exact: true }).boundingBox();
      const navBox = await page.getByTestId('mobile-bottom-nav').boundingBox();
      if (!ctaBox || !navBox || ctaBox.y + ctaBox.height > navBox.y - 8) {
        throw new Error(`The Speed start button is hidden by mobile navigation: ${JSON.stringify({ ctaBox, navBox })}`);
      }
      identity = { ...bank, actualQuestionCount, authoredSpeedPromptsIncluded: true };
    } else {
      identity = await checkSentenceOrderIdentity(page);
    }
    await page.screenshot({ path: path.join(screenshotDir, check.screenshot), fullPage: check.kind !== 'speed-prompt' });
    if (consoleErrors.length) throw new Error(`${check.name} console errors: ${consoleErrors.join(' | ')}`);

    return { name: check.name, route: check.route, status, screenshot: `reports/screenshots/${check.screenshot}`, identity };
  } finally {
    await page.close();
  }
}

async function main() {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const check of checks) {
      results.push(await runCheck(browser, check));
    }
  } finally {
    await browser.close();
  }

  const report = { baseUrl, checkedAt: new Date().toISOString(), results };
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
