# /home Daily Dashboard Polish

## Summary

Updated and then refined the authenticated P-English `/home` dashboard into a calmer daily learning home focused on one primary action, four short task cards, Poo guidance, compact mobile progress, and safer mobile bottom spacing.

## First Implementation

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

## Mobile Polish Pass

- Increased mobile safe bottom padding on the `/home` page content so lower task/summary cards are not hidden by the bottom nav.
- Converted the mobile 3-pill progress area into a compact single status row:
  - `Ngày 2 · Bọt biển 5/5 · Chưa bắt đầu`
- Kept the desktop 3-pill status layout.
- Made task cards more compact on mobile:
  - smaller mobile card padding;
  - smaller icon circles;
  - smaller action labels;
  - slightly lower mobile card minimum height.
- Updated warmer task copy:
  - `Ôn lỗi sai`: `Ôn nhẹ vài câu để chắc hơn.`
  - `Từ vựng cần nhớ`: `Ôn vài từ để giữ trí nhớ.`
- Confirmed consistent tiny action labels:
  - `Học bài hôm nay`: `Bắt đầu`
  - `Ôn lỗi sai`: `Ôn nhẹ`
  - `Shadowing 5 phút`: `Luyện nói`
  - `Từ vựng cần nhớ`: `Ôn từ`
- Kept the mobile summary card after the Poo reminder and made it compact/non-competing by hiding its inner metric grid on small mobile.

## Files Updated

- `apps/web/src/pages/HomePage.tsx`
  - Simplified the authenticated home UI into a daily dashboard.
  - Added Foundation48 target resolution from local progress.
  - Added compact progress pills, daily task cards, and Poo reminder card.
  - Removed the duplicate sidebar `Học tiếp` CTA to keep one clear main action.
  - Added mobile compact status row and larger mobile safe bottom padding.
  - Polished task card spacing/copy/action labels.
- `scripts/home-daily-dashboard-qa.cjs`
  - Added desktop/mobile Playwright QA for `/home`.
  - Validates hero copy, task cards, action labels, warmer subtitles, Poo reminder, primary CTA uniqueness, compact mobile status row, bottom-nav safe area, navigation, no mojibake, no horizontal overflow, no console errors, and no network 404/500.
- `reports/home-daily-dashboard-polish.md`
  - Updated implementation and QA report.

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
- Mobile compact status row exists and remains compact
- Desktop 3-pill progress is hidden on mobile
- Bottom-nav safe area check confirms important lower card content is not covered
- No console errors
- No network 404/500
- No mojibake markers
- No horizontal overflow
- Mobile first screen includes hero, primary CTA, and at least two task cards

## Screenshots

- `reports/screenshots/home-daily-dashboard-desktop.png`
- `reports/screenshots/home-daily-dashboard-mobile.png`
