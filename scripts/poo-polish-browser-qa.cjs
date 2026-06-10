const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.POO_POLISH_BASE_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve(__dirname, '..', 'reports', 'screenshots');
const reportPath = path.resolve(__dirname, '..', 'reports', 'poo-polish-browser-qa-report.json');
const progressKey = 'penglish-foundation48-progress-v1';
const authUserId = '00000000-0000-4000-8000-000000000088';
const authEmail = 'qa-poo-polish@example.com';

const qaProgress = {
  lastDayOpened: 3,
  lastStudiedDate: new Date().toISOString().slice(0, 10),
  streak: 7,
  days: {
    1: { started: true, completed: true, completedAt: new Date(Date.now() - 2 * 86400000).toISOString(), completedSteps: ['intro', 'explain', 'patterns', 'vocabulary', 'complete'] },
    2: { started: true, completed: true, completedAt: new Date(Date.now() - 86400000).toISOString(), completedSteps: ['intro', 'explain', 'patterns', 'vocabulary', 'complete'] },
    3: { started: true, completed: false, completedSteps: ['intro', 'explain'] },
  },
};

const routes = [
  { path: '/', name: 'home', waitFor: /PooEnglish|Bắt đầu bài hôm nay|Học bài hôm nay/i, requiredText: ['Bắt đầu bài hôm nay'] },
  { path: '/learning-path', name: 'learning-path', waitFor: /Mất gốc|Chặng|Ngày|Poo/i, requiredText: ['Poo'] },
  { path: '/luyen-tieng-anh/48-ngay-lay-goc', name: 'foundation48', waitFor: /48 ngày lấy gốc|Từ mới|Mẫu câu/i, requiredText: ['48 ngày lấy gốc', '12 phút'] },
  { path: '/practice', name: 'practice', waitFor: /Ôn|Practice|Luyện tập|Poo/i, requiredText: ['Poo'] },
  { path: '/words', name: 'words', waitFor: /Sổ học của tôi|Từ vựng đã lưu/i, requiredText: ['Sổ học của tôi', 'Từ vựng đã lưu'] },
  { path: '/shadowing', name: 'shadowing', waitFor: /Shadowing cùng Poo|Nghe trước một lần/i, requiredText: ['Nghe trước một lần', 'Nói lại theo nhịp'] },
  { path: '/english-speed', name: 'english-speed', waitFor: /English Speed|Chế độ phát âm nhanh|Poo/i, requiredText: ['Poo'] },
];

const viewports = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '1366x768', width: 1366, height: 768 },
  { label: '390x844', width: 390, height: 844 },
];

const allowedConsolePatterns = [
  /Download the React DevTools/i,
  /GSAP target/i,
  /Multiple instances of Three/i,
  /Failed to load resource: net::ERR_CONNECTION_CLOSED/i,
];

function isAllowedFailedRequest(url) {
  return /youtube|ytimg|googlevideo|fonts\.googleapis|fonts\.gstatic|favicon|manifest|chrome-extension|\/ocean\/ambient-whale\/frames\//i.test(url);
}

function safeFileName(value) {
  return value.replace(/^\/$/, 'home').replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '-').replace(/-+/g, '-').toLowerCase();
}

async function setupContext(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });

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
          user: { id: authUserId, email: authEmail, role: 'authenticated' },
        }),
      });
      return;
    }
    if (url.includes('/auth/v1/user')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: authUserId, email: authEmail, role: 'authenticated' }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: url.includes('/rest/v1/') ? '[]' : '{}' });
  });

  await context.addInitScript(({ progressKey, authUserId, authEmail, qaProgress }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: authUserId, aud: 'authenticated', exp: expiresAt, role: 'authenticated', email: authEmail })}.`;
    const user = {
      id: authUserId,
      aud: 'authenticated',
      role: 'authenticated',
      email: authEmail,
      app_metadata: { provider: 'google', providers: ['google'] },
      user_metadata: { full_name: 'Poo Polish QA Learner', avatar_url: '' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    window.localStorage.setItem('p-english:supabase-auth', JSON.stringify({
      access_token: token,
      refresh_token: 'qa-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiresAt,
      user,
    }));
    window.localStorage.setItem('currentUser', JSON.stringify({
      id: 'local-guest-learner',
      name: 'Poo Polish QA Learner',
      email: authEmail,
      avatar: '',
      vip: false,
    }));
    window.localStorage.setItem(progressKey, JSON.stringify(qaProgress));
  }, { progressKey, authUserId, authEmail, qaProgress });

  return context;
}

async function waitForRouteReady(page, route) {
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  try {
    await page.waitForFunction(
      (patternSource) => {
        const text = document.body?.innerText || '';
        return new RegExp(patternSource, 'i').test(text);
      },
      route.waitFor.source,
      { timeout: 25000 },
    );
  } catch (error) {
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 1200) || '');
    throw new Error(`Timed out waiting for ${route.path} pattern ${route.waitFor}. Body preview: ${bodyText}`);
  }
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const failedRequests = [];
  const consoleErrors = [];
  const screenshots = [];
  const checks = [];

  for (const viewport of viewports) {
    const context = await setupContext(browser, viewport);
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (allowedConsolePatterns.some((pattern) => pattern.test(text))) return;
      consoleErrors.push(`console error on ${page.url()}: ${text}`);
    });

    page.on('pageerror', (error) => consoleErrors.push(`page error on ${page.url()}: ${error.message}`));

    page.on('requestfailed', (request) => {
      const url = request.url();
      if (isAllowedFailedRequest(url)) return;
      failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText || 'unknown failure'}`);
    });

    for (const route of routes) {
      console.log(`Checking ${route.path} at ${viewport.label}`);
      await waitForRouteReady(page, route);

      const routeChecks = await page.evaluate((requiredText) => {
        const bodyText = document.body.innerText || '';
        const doc = document.documentElement;
        const body = document.body;
        const visibleButtons = Array.from(document.querySelectorAll('button, a')).filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        });
        const firstPrimaryAction = visibleButtons.find((element) => /Bắt đầu|Tiếp tục|Ôn|Học|Ghi âm|Nghe|Practice|Start/i.test(element.textContent || ''));
        const horizontalOverflow = Math.max(body.scrollWidth, doc.scrollWidth) > doc.clientWidth + 2;
        const getElementLabel = (element) => [
          element.getAttribute('data-testid') || '',
          element.getAttribute('aria-label') || '',
          element.getAttribute('role') || '',
          element.className || '',
          element.id || '',
        ].join(' ');
        const isKnownFixedChrome = (element) => {
          if (!element) return false;
          const label = getElementLabel(element);
          return Boolean(element.closest?.('[data-testid="mobile-bottom-nav"], [data-testid="mobile-topbar"], [aria-hidden="true"]'))
            || /mobile-bottom-nav|bottom|nav|tab|sidebar|toast|chakra-portal|ocean|whale|mascot|bubble|wave|backdrop|decor/i.test(label);
        };
        const fixedElementAtPoint = (x, y) => {
          const stack = document.elementsFromPoint(x, y);
          return stack.find((element) => window.getComputedStyle(element).position === 'fixed') || null;
        };
        const coveredPrimaryActions = visibleButtons.filter((element) => {
          if (element.closest?.('[data-testid="mobile-bottom-nav"]')) return false;
          const rect = element.getBoundingClientRect();
          if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return false;
          const probeX = Math.min(Math.max(rect.left + rect.width / 2, 1), window.innerWidth - 1);
          const probeY = Math.min(Math.max(rect.top + rect.height / 2, 1), window.innerHeight - 1);
          const topElement = document.elementFromPoint(probeX, probeY);
          if (!topElement || element === topElement || element.contains(topElement)) return false;
          const fixedCover = fixedElementAtPoint(probeX, probeY);
          return Boolean(fixedCover && !element.contains(fixedCover) && !isKnownFixedChrome(fixedCover));
        });
        const coveredActionCount = coveredPrimaryActions.length;
        const coveredActionLabels = coveredPrimaryActions.map((element) => (element.textContent || element.getAttribute('aria-label') || '').trim()).filter(Boolean).slice(0, 5);

        return {
          title: document.title,
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          bodyScrollWidth: body.scrollWidth,
          htmlScrollWidth: doc.scrollWidth,
          htmlClientWidth: doc.clientWidth,
          horizontalOverflow,
          requiredText: requiredText.map((text) => ({ text, present: bodyText.includes(text) })),
          firstPrimaryActionText: firstPrimaryAction?.textContent?.trim() || '',
          coveredActionCount,
          coveredActionLabels,
          visibleActionCount: visibleButtons.length,
          hasLoadingText: /Đang tải|loading/i.test(bodyText),
          hasErrorText: /TypeError|ReferenceError|Unhandled|Cannot read|Cannot access/i.test(bodyText),
        };
      }, route.requiredText || []);

      if (routeChecks.horizontalOverflow) {
        errors.push(`Horizontal overflow on ${route.path} at ${viewport.label}: ${JSON.stringify(routeChecks)}`);
      }
      const missingText = routeChecks.requiredText.filter((item) => !item.present).map((item) => item.text);
      if (missingText.length) {
        errors.push(`Missing required text on ${route.path} at ${viewport.label}: ${missingText.join(', ')}`);
      }
      if (!routeChecks.firstPrimaryActionText) {
        errors.push(`No visible learner action found on ${route.path} at ${viewport.label}`);
      }
      if (viewport.width < 600 && routeChecks.coveredActionCount > 0) {
        errors.push(`Possible fixed-bottom overlap on ${route.path} at ${viewport.label}: ${JSON.stringify(routeChecks)}`);
      }
      if (routeChecks.hasErrorText) {
        errors.push(`Runtime error-looking text detected on ${route.path} at ${viewport.label}`);
      }
      if (!/PooEnglish/i.test(routeChecks.title)) {
        errors.push(`SEO title does not include PooEnglish on ${route.path} at ${viewport.label}: ${routeChecks.title}`);
      }
      if (!routeChecks.description || routeChecks.description.length < 40) {
        errors.push(`SEO description too short on ${route.path} at ${viewport.label}`);
      }
      if (!routeChecks.canonical) {
        errors.push(`Missing canonical URL on ${route.path} at ${viewport.label}`);
      }

      const screenshotPath = path.join(outDir, `poo-polish-${safeFileName(route.name)}-${viewport.label}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, timeout: 60000, animations: 'disabled' });
      screenshots.push(path.relative(path.resolve(__dirname, '..'), screenshotPath).replace(/\\/g, '/'));
      checks.push({ route: route.path, viewport: viewport.label, ...routeChecks });
    }

    await context.close();
  }

  await browser.close();

  if (consoleErrors.length) errors.push(`Console/page errors:\n${consoleErrors.join('\n')}`);
  if (failedRequests.length) errors.push(`Failed requests:\n${failedRequests.join('\n')}`);

  const report = {
    ok: errors.length === 0,
    baseUrl,
    generatedAt: new Date().toISOString(),
    routes: routes.map((route) => route.path),
    viewports,
    screenshots,
    checks,
    consoleErrors,
    failedRequests,
    errors,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`QA report saved to ${reportPath}`);
    process.exit(1);
  }

  console.log(`PooEnglish product polish browser QA passed. ${screenshots.length} screenshots saved to ${outDir}`);
  console.log(`QA report saved to ${reportPath}`);
})();
