const { chromium } = require('playwright');
const path = require('path');

const baseUrl = process.env.ZOO_QA_BASE_URL || 'http://localhost:5180';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');

const screenshots = [
  {
    url: '/',
    file: 'zoo-z4-3-2-landing-testimonials-desktop.png',
    width: 1366,
    height: 768,
    waitForText: 'Người dùng nói gì',
    scrollToText: 'Người dùng nói gì',
  },
  {
    url: '/',
    file: 'zoo-z4-3-2-landing-testimonials-mobile.png',
    width: 390,
    height: 844,
    waitForText: 'Người dùng nói gì',
    scrollToText: 'Người dùng nói gì',
  },
  {
    url: '/home',
    file: 'zoo-z4-3-2-home-regression-desktop.png',
    width: 1366,
    height: 768,
    waitForText: 'Hôm nay học gì?',
  },
  {
    url: '/shadowing',
    file: 'zoo-z4-3-2-shadowing-regression-desktop.png',
    width: 1366,
    height: 768,
    waitForText: 'AI góp ý cách nói',
  },
];

async function waitForApp(page, text) {
  await page.waitForLoadState('domcontentloaded');
  await page.getByText(text, { exact: false }).first().waitFor({ timeout: 20000 });
}

async function checkOverflow(page, label, errors) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
    hasHorizontalOverflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > document.documentElement.clientWidth + 1,
  }));
  if (overflow.hasHorizontalOverflow) {
    errors.push(`horizontal overflow on ${label}: ${JSON.stringify(overflow)}`);
  }
}

async function checkLandingTestimonials(page, label, errors) {
  await waitForApp(page, 'Người dùng nói gì');
  await page.getByText('Người dùng nói gì', { exact: false }).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);

  const state = await page.evaluate(() => {
    const avatars = Array.from(document.querySelectorAll('[data-testid="testimonial-fish-avatar"]'));
    const cards = avatars.map((avatar) => {
      const authorRow = avatar.closest('.chakra-stack');
      const card = authorRow?.parentElement;
      const avatarRect = avatar.getBoundingClientRect();
      const cardRect = card?.getBoundingClientRect();
      const style = window.getComputedStyle(avatar);
      return {
        avatarLabel: avatar.getAttribute('aria-label'),
        avatarWidth: avatarRect.width,
        avatarHeight: avatarRect.height,
        cardWidth: cardRect?.width ?? 0,
        cardHeight: cardRect?.height ?? 0,
        visible: avatarRect.width >= 40 && avatarRect.height >= 40 && style.visibility !== 'hidden' && style.display !== 'none',
        text: card?.textContent?.trim() ?? '',
      };
    });

    const testimonialSection = document.body.innerText.includes('Hơn 100.000 người Việt đã tin dùng');
    const remoteHumanAvatars = Array.from(document.images).filter((img) => /pravatar|randomuser|unsplash/i.test(img.currentSrc || img.src));
    const brokenImages = Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => ({ src: img.currentSrc || img.src, alt: img.alt }));

    return {
      testimonialSection,
      fishAvatarCount: avatars.length,
      readableCards: cards.filter((card) => card.visible && card.cardWidth > 250 && card.cardHeight > 120 && card.text.length > 40).length,
      cards,
      remoteHumanAvatarCount: remoteHumanAvatars.length,
      remoteHumanAvatarSrcs: remoteHumanAvatars.map((img) => img.currentSrc || img.src),
      brokenImages,
    };
  });

  if (!state.testimonialSection) errors.push(`${label}: testimonial section heading missing.`);
  if (state.fishAvatarCount !== 3) errors.push(`${label}: expected 3 fish avatars, found ${state.fishAvatarCount}: ${JSON.stringify(state)}`);
  if (state.readableCards !== 3) errors.push(`${label}: expected 3 readable testimonial cards: ${JSON.stringify(state)}`);
  if (state.remoteHumanAvatarCount > 0) errors.push(`${label}: still has remote human avatar image(s): ${JSON.stringify(state.remoteHumanAvatarSrcs)}`);
  if (state.brokenImages.length) errors.push(`${label}: broken image(s): ${JSON.stringify(state.brokenImages)}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.localStorage.setItem('currentUser', JSON.stringify({
      id: 'local-guest-learner',
      name: 'Bạn học nhỏ',
      email: 'guest@p-english.local',
      avatar: '',
      coin: 0,
      streak: 0,
      vip: false,
      bio: 'Không cần đăng nhập, tiến độ lưu trên thiết bị này',
    }));
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
  });

  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console error on ${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error on ${page.url()}: ${error.message}`));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'unknown failure'}`);
  });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'Bắt đầu miễn phí');
  await checkLandingTestimonials(page, 'landing desktop 1366x768', errors);
  await checkOverflow(page, '/ landing desktop 1366x768', errors);

  const ctaState = await page.evaluate(() => ({
    hasStartFree: document.body.innerText.includes('Bắt đầu miễn phí'),
    hasLogin: document.body.innerText.includes('Đăng nhập'),
    hasDemo: document.body.innerText.includes('Xem demo'),
  }));
  if (!ctaState.hasStartFree || !ctaState.hasLogin || !ctaState.hasDemo) errors.push(`landing CTA/top nav regression: ${JSON.stringify(ctaState)}`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await checkLandingTestimonials(page, 'landing mobile 390x844', errors);
  await checkOverflow(page, '/ landing mobile 390x844', errors);

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'Hôm nay học gì?');
  await checkOverflow(page, '/home desktop 1366x768', errors);

  await page.goto(`${baseUrl}/shadowing`, { waitUntil: 'networkidle' });
  await waitForApp(page, 'AI góp ý cách nói');
  await checkOverflow(page, '/shadowing desktop 1366x768', errors);

  for (const shot of screenshots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(`${baseUrl}${shot.url}`, { waitUntil: 'networkidle' });
    await waitForApp(page, shot.waitForText);
    if (shot.scrollToText) {
      await page.getByText(shot.scrollToText, { exact: false }).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
    }
    await checkOverflow(page, `screenshot ${shot.url} ${shot.width}x${shot.height}`, errors);
    await page.screenshot({ path: path.join(outDir, shot.file), fullPage: true });
  }

  await browser.close();

  const filteredFailedRequests = failedRequests.filter((item) => !item.includes('favicon'));
  if (filteredFailedRequests.length) errors.push(`failed requests:\n${filteredFailedRequests.join('\n')}`);

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Z4.3.2 landing avatar and data-audit regression QA passed. Screenshots saved to ${outDir}`);
})();
