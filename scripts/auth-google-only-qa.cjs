const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const path = require('path');

const root = process.cwd();
const reportPath = path.join(root, 'reports', 'auth-google-only-qa-results.json');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function includesAny(source, patterns) {
  return patterns.some((pattern) => pattern.test(source));
}

const files = {
  supabaseClient: read('apps/web/src/lib/supabaseClient.ts'),
  authProvider: read('apps/web/src/features/auth/AuthProvider.tsx'),
  userSession: read('apps/web/src/lib/p-english/userSession.ts'),
  loginPage: read('apps/web/src/pages/LoginPage.tsx'),
  profilePage: read('apps/web/src/pages/ProfilePage.tsx'),
  app: read('apps/web/src/App.tsx'),
  sidebar: read('apps/web/src/components/Sidebar.tsx'),
  foundationProgress: read('apps/web/src/features/foundation48/foundation48Progress.ts'),
  foundationCloud: read('apps/web/src/features/foundation48/foundation48CloudProgress.ts'),
};

const checks = [
  {
    name: 'supabase-env-url-key-only',
    ok: /VITE_SUPABASE_URL/.test(files.supabaseClient) && /VITE_SUPABASE_ANON_KEY/.test(files.supabaseClient) && !/SERVICE_ROLE|SUPABASE_SERVICE|VITE_SUPABASE_SERVICE/i.test(files.supabaseClient),
  },
  {
    name: 'supabase-client-null-when-unconfigured',
    ok: /SupabaseClient \| null/.test(files.supabaseClient) && /isSupabaseConfigured/.test(files.supabaseClient) && /:\s*null/.test(files.supabaseClient),
  },
  {
    name: 'google-oauth-only',
    ok: /provider:\s*['"]google['"]/.test(files.authProvider) && /provider:\s*['"]google['"]/.test(files.userSession) && !includesAny(files.loginPage + files.authProvider + files.userSession, [/signInWithPassword/i, /signUp\s*\(/i, /password/i, /mật khẩu/i]),
  },
  {
    name: 'guest-local-mode-visible',
    ok: /Học thử trên thiết bị này/.test(files.loginPage) && /local-guest-learner/.test(files.loginPage) && /Tiến độ lưu trên thiết bị này/.test(files.profilePage + files.sidebar + files.userSession),
  },
  {
    name: 'auth-callback-route',
    ok: /path="\/auth\/callback"/.test(files.app) && /LoginCallbackPage/.test(files.loginPage) && /refreshSession/.test(files.loginPage),
  },
  {
    name: 'google-user-profile-sidebar',
    ok: /displayNameFromUser/.test(files.userSession + files.app) && /avatarFromUser/.test(files.userSession + files.app) && /session\.email/.test(files.profilePage + files.sidebar) && /session\.avatarUrl/.test(files.profilePage + files.sidebar),
  },
  {
    name: 'foundation48-contracts-preserved',
    ok: /penglish-foundation48-progress-v1/.test(files.foundationProgress) && /penglish-foundation48-progress-updated/.test(files.foundationProgress) && /foundation48DeepLessonResolver/.test(files.foundationProgress) && /import\('\.\/foundation48CloudProgress'\)/.test(files.foundationProgress),
  },
  {
    name: 'foundation48-cloud-merge-upsert',
    ok: /mergeCloudAndLocalFoundation48Progress/.test(files.foundationCloud) && /mergeFoundation48DayProgress/.test(files.foundationCloud) && /upsert\(/.test(files.foundationCloud) && /onConflict:\s*['"]user_id,day_number['"]/.test(files.foundationCloud),
  },
];

const failed = checks.filter((check) => !check.ok);
const report = {
  ok: failed.length === 0,
  generatedAt: new Date().toISOString(),
  checks,
  failed: failed.map((check) => check.name),
};

mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
