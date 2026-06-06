const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'penglish-practice-browser-qa-results.json');

const checks = [
  {
    name: 'sentence-order-token-identity-duplicate-words',
    route: '/practice?lessonId=grammar-a2-going-to-plans&mode=quiz',
    viewport: { width: 1440, height: 960 },
    screenshot: 'penglish-practice-qa-sentence-order.png',
  },
  {
    name: 'mobile-practice-mode-shell',
    route: '/practice?lessonId=grammar-a2-going-to-plans&mode=quiz',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    screenshot: 'penglish-practice-qa-mobile-quiz.png',
  },
];

async function openFirstSentenceOrder(page) {
  await page.getByText('Quiz', { exact: false }).first().waitFor({ timeout: 20_000 });

  for (let step = 0; step < 12; step += 1) {
    const tokens = page.getByTestId('practice-quiz-token');
    if (await tokens.count()) return;

    const currentType = await page.locator('body').innerText({ timeout: 10_000 });
    if (/multiple-choice/i.test(currentType)) {
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

    const identity = await checkSentenceOrderIdentity(page);
    await page.screenshot({ path: path.join(screenshotDir, check.screenshot), fullPage: true });
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
