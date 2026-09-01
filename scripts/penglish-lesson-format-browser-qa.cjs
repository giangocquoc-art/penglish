const { chromium } = require('playwright');

const BASE_URL = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:8080';
const VIEWPORTS = [
  { name: 'desktop', width: 1365, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const READING_CASES = [
  {
    id: 'reading-a1-my-morning',
    expectedQuestion: 'Mai thức dậy lúc mấy giờ?',
    hiddenQuestion: 'What time does Mai get up?',
  },
  {
    id: 'reading-b1-study-plan',
    expectedQuestion: 'When did Lina use to study?',
    hiddenQuestion: 'Trước đây Lina học khi nào?',
  },
];

async function createPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return { context, page, consoleErrors, pageErrors };
}

async function openLesson(page, lessonId) {
  await page.goto(`${BASE_URL}/lessons/${lessonId}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.locator('[data-testid="route-loading-fallback"]').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
  await page.getByTestId('lesson-step-card').waitFor({ state: 'visible', timeout: 8000 });
}

async function advanceToStepFive(page) {
  for (let step = 2; step <= 5; step += 1) {
    await page.getByRole('button', { name: 'Tiếp tục' }).click();
    await page.getByText(`Bước ${step}/6`, { exact: true }).waitFor({ state: 'visible' });
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of VIEWPORTS) {
    for (const lessonCase of READING_CASES) {
      const { context, page, consoleErrors, pageErrors } = await createPage(browser, viewport);
      const failures = [];
      try {
        await openLesson(page, lessonCase.id);
        const firstHeading = await page.getByRole('heading', { level: 2 }).first().innerText();
        if (firstHeading !== 'Bước 1: Đọc lượt 1') failures.push(`unexpected first step: ${firstHeading}`);
        if (!(await page.getByText('Đoạn đọc chính', { exact: true }).isVisible())) failures.push('main passage label is missing');
        await advanceToStepFive(page);
        if (!(await page.getByText(lessonCase.expectedQuestion, { exact: true }).isVisible())) {
          failures.push(`expected CEFR question is not visible: ${lessonCase.expectedQuestion}`);
        }
        if (await page.getByText(lessonCase.hiddenQuestion, { exact: true }).isVisible().catch(() => false)) {
          failures.push(`secondary-language question is competing with the primary prompt: ${lessonCase.hiddenQuestion}`);
        }
      } catch (error) {
        failures.push(error.message);
      }
      results.push({ viewport: viewport.name, lessonId: lessonCase.id, consoleErrors, pageErrors, failures });
      await context.close();
    }

    for (const formatCase of [
      { id: 'grammar-a1-articles-a-an-the', expectedHeading: 'Bước 1: Nhìn mẫu', expectedLabel: 'Mẫu trọng tâm' },
      { id: 'unit-1-greetings-introduction', expectedHeading: 'Bước 1: Nghe', expectedLabel: null },
    ]) {
      const { context, page, consoleErrors, pageErrors } = await createPage(browser, viewport);
      const failures = [];
      try {
        await openLesson(page, formatCase.id);
        const firstHeading = await page.getByRole('heading', { level: 2 }).first().innerText();
        if (firstHeading !== formatCase.expectedHeading) failures.push(`unexpected first step: ${firstHeading}`);
        if (formatCase.expectedLabel && !(await page.getByText(formatCase.expectedLabel, { exact: true }).isVisible())) {
          failures.push(`missing first-step content: ${formatCase.expectedLabel}`);
        }
      } catch (error) {
        failures.push(error.message);
      }
      results.push({ viewport: viewport.name, lessonId: formatCase.id, consoleErrors, pageErrors, failures });
      await context.close();
    }
  }

  await browser.close();
  const failures = results.filter((result) => result.failures.length || result.consoleErrors.length || result.pageErrors.length);
  console.log(JSON.stringify({ baseUrl: BASE_URL, checkCount: results.length, failureCount: failures.length, failures }, null, 2));
  if (failures.length > 0) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
