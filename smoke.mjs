import { chromium } from 'playwright';

const base = 'http://localhost:4173';

// Get tokens
const tokenRes = await fetch('http://localhost:8080/auth/google', { redirect: 'manual' });
if (tokenRes.status !== 302) throw new Error(`auth/google returned ${tokenRes.status}`);
const loc = tokenRes.headers.get('location');
if (!loc) throw new Error('no location');
const tokenUrl = new URL(loc);
const accessToken = tokenUrl.searchParams.get('accessToken');
const refreshToken = tokenUrl.searchParams.get('refreshToken');
if (!accessToken || !refreshToken) throw new Error('missing tokens');

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext();
await context.addInitScript(({ accessToken, refreshToken }) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}, { accessToken, refreshToken });

const page = await context.newPage();
page.on('pageerror', err => console.error('pageerror', err.message));
page.on('console', msg => {
  if (msg.type() === 'error') console.error('console', msg.text());
});

const routes = ['/home', '/category-list', '/words', '/practice', '/store', '/leaderboard', '/folders', '/chat', '/ai'];
const results = [];

for (const route of routes) {
  try {
    await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('h2', { timeout: 5000 }).catch(() => {});
    const heading = await page.locator('h2').first().textContent().catch(() => null);
    results.push({ route, heading, url: page.url() });
  } catch (err) {
    results.push({ route, error: err.message });
  }
}

try {
  await page.goto(base + '/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.screenshot({ path: '/tmp/luyentu-home.png', fullPage: true });
} catch (e) {
  console.error('screenshot error', e.message);
}

await browser.close();

console.log(JSON.stringify({ results }));
