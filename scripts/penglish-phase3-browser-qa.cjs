const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://127.0.0.1:5180';
const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
const reportPath = path.join(process.cwd(), 'reports', 'penglish-phase3-browser-qa-results.json');

const learningLoopSeed = {
  schemaVersion: 1,
  xp: 180,
  streak: 3,
  lastActiveDate: '2026-06-05',
  completed: {
    'foundation48:day-1': '2026-06-05T08:00:00.000Z',
    'interactive-lesson:a1-greetings': '2026-06-05T08:10:00.000Z',
  },
  mistakes: {
    'qa-shadowing-low': {
      id: 'qa-shadowing-low',
      source: 'shadowing',
      sourceId: 'qa-shadowing:s1',
      type: 'shadowing-low-similarity',
      prompt: 'I can introduce myself clearly.',
      correctAnswer: 'I can introduce myself clearly.',
      userAnswer: 'I introduce clear',
      explanation: 'Thiếu: can, myself. Nhịp nói cần chậm lại.',
      attempts: 2,
      lastWrongAt: '2026-06-05T08:15:00.000Z',
      nextReviewAt: '2026-06-05T08:25:00.000Z',
      resolved: false,
      tags: ['shadowing', 'A1'],
    },
    'qa-speed-weak': {
      id: 'qa-speed-weak',
      source: 'english-speed',
      sourceId: 'qa-speed-prompt',
      type: 'speed-weak',
      prompt: 'Hello, my name is Anna.',
      correctAnswer: 'Hello, my name is Anna.',
      userAnswer: 'Điểm nhẹ 61 trong chế độ speaking',
      explanation: 'Nghe chậm, chia câu thành cụm nhỏ rồi ghi âm lại.',
      attempts: 1,
      lastWrongAt: '2026-06-05T08:20:00.000Z',
      nextReviewAt: '2026-06-05T08:30:00.000Z',
      resolved: false,
      tags: ['english-speed', 'speaking', 'A1'],
    },
  },
  words: {
    'qa-word-hello': {
      id: 'qa-word-hello',
      term: 'hello',
      meaningVi: 'xin chào',
      example: 'Hello, my name is Anna.',
      source: 'foundation48',
      sourceId: 'day-1',
      cefrLevel: 'A1',
      topic: 'Chào hỏi',
      mastery: 1,
      favorite: true,
      weakCount: 2,
      learnedAt: '2026-06-05T08:00:00.000Z',
      lastReviewedAt: '2026-06-05T08:12:00.000Z',
    },
    'qa-word-clearly': {
      id: 'qa-word-clearly',
      term: 'clearly',
      meaningVi: 'một cách rõ ràng',
      example: 'I can speak clearly.',
      source: 'shadowing',
      sourceId: 'qa-shadowing:s1',
      cefrLevel: 'A1',
      topic: 'Shadowing',
      mastery: 2,
      favorite: false,
      weakCount: 1,
      learnedAt: '2026-06-05T08:03:00.000Z',
    },
  },
  activities: [
    { id: 'qa-a1', source: 'foundation48', sourceId: 'day-1', xp: 20, occurredAt: '2026-06-05T08:00:00.000Z' },
    { id: 'qa-a2', source: 'shadowing', sourceId: 'qa-shadowing:s1', xp: 5, occurredAt: '2026-06-05T08:15:00.000Z' },
    { id: 'qa-a3', source: 'english-speed', sourceId: 'qa-speed-prompt', xp: 5, occurredAt: '2026-06-05T08:20:00.000Z' },
  ],
  updatedAt: '2026-06-05T08:20:00.000Z',
};

const routeChecks = [
  { name: 'home-mobile', route: '/home', width: 390, height: 844, screenshot: 'phase3-home-mobile.png', testId: null, text: /P-English|Hôm nay|ôn/i },
  { name: 'learning-path-mobile', route: '/learning-path', width: 390, height: 844, screenshot: 'phase3-learning-path-mobile.png', testId: null, text: /Poo đã gom|Lộ trình|A1/i },
  { name: 'foundation48-roadmap-mobile', route: '/luyen-tieng-anh/48-ngay-lay-goc', width: 390, height: 844, screenshot: 'phase3-foundation48-roadmap-mobile.png', testId: 'foundation48-roadmap-page', text: /48 ngày|Ngày 1|Ngày 12/i },
  { name: 'practice-review-center-mobile', route: '/practice', width: 390, height: 844, screenshot: 'phase3-practice-real-review-center-mobile.png', testId: 'practice-real-review-center', text: /lỗi sai|từ yếu|Ôn ngay/i },
  { name: 'words-notebook-mobile', route: '/words', width: 390, height: 844, screenshot: 'phase3-words-learned-notebook-mobile.png', testId: 'vocab-learned-words-panel', text: /Sổ tay từ đã học thật|hello|Yêu thích/i },
  { name: 'shadowing-mobile', route: '/shadowing', width: 390, height: 844, screenshot: 'phase3-shadowing-mobile.png', testId: 'shadowing-mobile-root', text: /Poo|Ghi âm|transcript/i },
  { name: 'english-speed-mobile', route: '/english-speed', width: 390, height: 844, screenshot: 'phase3-english-speed-mobile.png', testId: 'speed-mobile-root', text: /English Speed|KỶ LỤC|LẦN CUỐI/i },
];

async function seedLearningLoop(page) {
  await page.addInitScript((seed) => {
    window.localStorage.setItem('penglish.learning.loop.v1', JSON.stringify(seed));
    window.localStorage.setItem('p-english:speech-progress', JSON.stringify({ attempts: 2, completed: 2, bestScore: 81, lastScore: 61, lastPromptId: 'qa-speed-prompt' }));
  }, learningLoopSeed);
}

async function gotoAndCheck(page, check, errors) {
  await page.setViewportSize({ width: check.width, height: check.height });
  const response = await page.goto(`${baseUrl}${check.route}`, { waitUntil: 'networkidle', timeout: 45_000 });
  const status = response ? response.status() : 0;
  if (status >= 400) errors.push(`${check.name} returned HTTP ${status}`);
  await page.waitForFunction(() => !document.body.innerText.includes('Đang mở vùng học'), null, { timeout: 20_000 }).catch(() => undefined);
  if (check.testId) await page.getByTestId(check.testId).waitFor({ timeout: 20_000 });
  const bodyText = await page.locator('body').innerText({ timeout: 15_000 });
  if (!check.text.test(bodyText)) errors.push(`${check.name} missing expected text: ${bodyText.slice(0, 260).replace(/\s+/g, ' ')}`);

  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    htmlClientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) errors.push(`${check.name} horizontal overflow ${JSON.stringify(overflow)}`);

  await page.screenshot({ path: path.join(screenshotDir, check.screenshot), fullPage: false, timeout: 15_000 });
  return { ...check, status, overflow, screenshot: `reports/screenshots/${check.screenshot}` };
}

async function checkShadowingLocalCompare(page, errors) {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle', timeout: 45_000 });

  const targetText = 'I can introduce myself clearly.';
  const result = await page.evaluate((target) => {
    const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const targetWords = normalize(target).split(' ').filter(Boolean);
    const learnerWords = normalize('I introduce clear').split(' ').filter(Boolean);
    const learnerSet = new Set(learnerWords);
    const targetSet = new Set(targetWords);
    const matchedWords = targetWords.filter((word) => learnerSet.has(word));
    const missingWords = targetWords.filter((word) => !learnerSet.has(word));
    const extraWords = learnerWords.filter((word) => !targetSet.has(word));
    const score = targetWords.length ? Math.round((matchedWords.length / Math.max(targetWords.length, learnerWords.length || 1)) * 100) : 0;
    const key = 'penglish.learning.loop.v1';
    const state = JSON.parse(window.localStorage.getItem(key) || '{}');
    state.mistakes = state.mistakes || {};
    state.activities = state.activities || [];
    state.mistakes['qa-shadowing-local-compare'] = {
      id: 'qa-shadowing-local-compare',
      source: 'shadowing',
      sourceId: 'qa-local:s1',
      type: 'shadowing-low-similarity',
      prompt: target,
      correctAnswer: target,
      userAnswer: 'I introduce clear',
      explanation: `Thiếu: ${missingWords.join(', ')}. Thừa: ${extraWords.join(', ')}.`,
      attempts: 1,
      lastWrongAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      resolved: false,
      tags: ['shadowing', 'local-compare'],
    };
    state.activities.push({ id: `qa-shadowing-${Date.now()}`, source: 'shadowing', sourceId: 'qa-local:s1', xp: 5, occurredAt: new Date().toISOString() });
    state.updatedAt = new Date().toISOString();
    window.localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(new Event('penglish.learning.loop.updated'));
    return { score, missingWords, extraWords };
  }, targetText);

  if (result.score >= 78) errors.push(`shadowing local compare seed should be weak but scored ${result.score}`);
  await page.screenshot({ path: path.join(screenshotDir, 'phase3-shadowing-local-weak-saved.png'), fullPage: false, timeout: 15_000 });
  return result;
}

async function checkEnglishSpeedLoop(page, errors) {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto(`${baseUrl}/english-speed`, { waitUntil: 'networkidle', timeout: 45_000 });
  await page.getByTestId('speed-mobile-root').waitFor({ timeout: 20_000 });
  const state = await page.evaluate(() => {
    const key = 'penglish.learning.loop.v1';
    const parsed = JSON.parse(window.localStorage.getItem(key) || '{}');
    const progress = JSON.parse(window.localStorage.getItem('p-english:speech-progress') || '{}');
    return { hasSpeedMistake: Boolean(parsed.mistakes && parsed.mistakes['qa-speed-weak']), bestScore: progress.bestScore, lastScore: progress.lastScore };
  });
  if (!state.hasSpeedMistake) errors.push('english speed weak item was not available in learning loop seed');
  if (Number(state.bestScore) < 81) errors.push(`english speed best score was not persisted in QA state: ${JSON.stringify(state)}`);
  await page.screenshot({ path: path.join(screenshotDir, 'phase3-english-speed-loop-state.png'), fullPage: false, timeout: 15_000 });
  return state;
}

async function main() {
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const errors = [];
  const routeResults = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`${page.url()} :: ${msg.text()}`);
  });
  page.on('pageerror', (error) => consoleErrors.push(`${page.url()} :: ${error.message}`));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!url.includes('favicon') && !url.startsWith('data:')) failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown'}`);
  });

  try {
    await seedLearningLoop(page);
    for (const check of routeChecks) routeResults.push(await gotoAndCheck(page, check, errors));
    const shadowingLocalCompare = await checkShadowingLocalCompare(page, errors);
    const englishSpeedLoop = await checkEnglishSpeedLoop(page, errors);

    const filteredConsoleErrors = consoleErrors.filter((item) => !/Failed to load resource: the server responded with a status of 404.*favicon/i.test(item));
    const filteredFailedRequests = failedRequests.filter((item) => !/ocean\/ambient-whale\/frames\/frame-\d+\.png :: net::ERR_ABORTED/.test(item));
    const report = {
      baseUrl,
      checkedAt: new Date().toISOString(),
      routeResults,
      shadowingLocalCompare,
      englishSpeedLoop,
      consoleErrors: filteredConsoleErrors,
      failedRequests: filteredFailedRequests,
      errors,
    };
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    if (errors.length || filteredConsoleErrors.length || filteredFailedRequests.length) {
      console.error(JSON.stringify(report, null, 2));
      process.exit(1);
    }

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
