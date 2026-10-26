const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.PENGLISH_QA_BASE_URL || 'http://127.0.0.1:5173';
const lessonId = 'a1-listening-meeting-classmate';
const completedBeforeListening = [
  'intro',
  'scenario-a1-classmate-situation-class',
  'repair-a1-classmate-mistake-seat-sit',
  'scenario-a1-classmate-situation-role-swap',
  'shadowing-a1-classmate-shadow-a1-classmate-shadow-1',
  'repair-a1-classmate-mistake-name-question',
  'a1-classmate-speed-seat',
  'repair-a1-classmate-mistake-first-listen',
  'shadowing-a1-classmate-shadow-a1-classmate-shadow-2',
  'a1-classmate-reflex-new',
  'shadowing-a1-classmate-shadow-a1-classmate-shadow-3',
  'a1-classmate-speed-sit',
  'a1-classmate-reflex-seat-free',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(({ lessonId, completedSteps }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('penglish.lesson.progress.v1', JSON.stringify({
        [lessonId]: {
          lessonId,
          status: 'started',
          completedSteps,
          flowVersion: 2,
          stepOutcomes: {},
          reviewSessionId: 'wrong-listening-action-qa',
          updatedAt: new Date().toISOString(),
        },
      }));
      window.__penglishQaSpoken = [];
      const synthesis = window.speechSynthesis;
      if (synthesis?.speak) {
        const originalSpeak = synthesis.speak.bind(synthesis);
        synthesis.speak = (utterance) => {
          window.__penglishQaSpoken.push({ text: utterance.text, rate: utterance.rate });
          originalSpeak(utterance);
        };
      }
    }, { lessonId, completedSteps: completedBeforeListening });

    await page.goto(`${baseUrl}/learn/${lessonId}`, { waitUntil: 'domcontentloaded' });
    const card = page.getByTestId('interactive-lesson-card');
    await card.waitFor({ state: 'visible' });
    if (!(await card.innerText()).includes('What does the speaker say?')) throw new Error('The seeded checkpoint did not resume at the listening question.');

    const wrongOption = page.getByTestId('interactive-lesson-answer-option').filter({ hasNotText: 'I am new here.' }).first();
    await wrongOption.click();
    const feedback = await page.getByTestId('interactive-lesson-feedback').innerText();
    const spoken = await page.evaluate(() => window.__penglishQaSpoken ?? []);
    const feedbackActionsVisible = await page.waitForFunction(() => {
      const actions = document.querySelector('[data-testid="interactive-lesson-feedback-actions"]');
      const nav = document.querySelector('[data-testid="mobile-bottom-nav"]');
      if (!actions || !nav) return false;
      return actions.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top;
    }, { timeout: 5000 }).then(() => true).catch(() => false);
    const transcriptVisible = feedback.includes('Lời thoại: Hi, I am new here.');
    const slowReplayTriggered = spoken.some((item) => item.text === 'Hi, I am new here.' && item.rate <= 0.73);
    const cleanAnswerPunctuation = !feedback.includes('here..');
    if (!transcriptVisible || !slowReplayTriggered || !feedbackActionsVisible || !cleanAnswerPunctuation) {
      throw new Error(`Wrong-listening action was incomplete: ${JSON.stringify({ transcriptVisible, slowReplayTriggered, feedbackActionsVisible, cleanAnswerPunctuation, spoken })}`);
    }

    const screenshotPath = path.resolve(__dirname, '..', 'reports', 'screenshots', 'interactive-listening-wrong-answer-mobile.png');
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath });
    const report = { ok: true, lessonId, resumedAtListeningQuestion: true, transcriptVisible, slowReplayTriggered, feedbackActionsVisible, cleanAnswerPunctuation, spoken, screenshotPath };
    const reportPath = path.resolve(__dirname, '..', 'reports', 'penglish-review-action-qa.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
