# /home Daily Dashboard Polish

## Summary

Updated the authenticated P-English `/home` dashboard into a calmer daily learning home focused on one primary action, four short task cards, Poo guidance, and simple progress.

## Changes

- Reworked the hero to use the requested message:
  - `Hôm nay học gì cùng Poo?`
  - `Chỉ cần một bài nhỏ. Poo sẽ dẫn bạn từng bước.`
  - Primary CTA: `Bắt đầu bài hôm nay`
- Connected the primary CTA to the current Foundation48 learning target:
  - continues the saved/open Foundation48 day when progress exists;
  - otherwise starts Foundation48 day 1.
- Reduced dashboard clutter by removing the old broad stats/modules and duplicate dashboard CTAs.
- Added four concise daily task cards:
  - `Học bài hôm nay`
  - `Ôn lỗi sai`
  - `Shadowing 5 phút`
  - `Từ vựng cần nhớ`
- Added the guidance card:
  - `Poo nhắc bạn`
  - `Làm bài hôm nay trước. Ôn tập và shadowing là phần phụ.`
- Kept progress simple:
  - today status;
  - bubble/streak label;
  - current Foundation48 day/path;
  - compact right-side desktop summary.
- Preserved auth protection, Google login, Foundation48 lesson logic, progress storage, sync logic, and route protection.

## Files Updated

- `apps/web/src/pages/HomePage.tsx`
  - Simplified the authenticated home UI into a daily dashboard.
  - Added Foundation48 target resolution from local progress.
  - Added compact progress pills, daily task cards, and Poo reminder card.
  - Removed the duplicate sidebar `Học tiếp` CTA to keep one clear main action.
- `scripts/home-daily-dashboard-qa.cjs`
  - Added desktop/mobile Playwright QA for `/home`.
  - Validates hero copy, task cards, Poo reminder, primary CTA uniqueness, mobile first-screen visibility, navigation, no mojibake, no horizontal overflow, no console errors, and no network 404/500.

## QA Results

- Build: passed
  - Command: `npm run build -w @pshare/web`
  - Result: success
  - Notes: existing Rollup/Vite warnings remain for `react-wavify` pure annotations and dynamic/static imports for Supabase/Foundation48 modules; no build failure.
- Browser QA: passed
  - Command: `node scripts/home-daily-dashboard-qa.cjs`
  - Result: success

## Browser QA Coverage

- `/home` desktop at `1366x900`
- `/home` mobile at `390x844`
- `Bắt đầu bài hôm nay` navigation to saved Foundation48 day
- Daily task navigation:
  - `home-task-today-lesson` to saved Foundation48 day
  - `home-task-mistakes` to `/words`
  - `home-task-shadowing` to `/shadowing`
  - `home-task-words` to `/words`
- No console errors
- No network 404/500
- No mojibake markers
- No horizontal overflow
- Mobile first screen includes hero, primary CTA, and at least two task cards

## Screenshots

- `reports/screenshots/home-daily-dashboard-desktop.png`
- `reports/screenshots/home-daily-dashboard-mobile.png`
