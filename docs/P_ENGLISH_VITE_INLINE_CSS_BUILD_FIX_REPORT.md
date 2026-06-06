# P-English Vite Inline CSS Build Fix Report

## Mục tiêu

Sửa lỗi production build Vite trên Windows tại workspace `C:\Users\PC\OneDrive\P-English\Luyen-Tu`:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen-Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen-Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

## Root cause

`apps/web/index.html` có inline CSS trong thẻ `<style>` ở `<head>` và một thẻ `<style>` bên trong `#root` để khai báo `@keyframes sp`. Vite production build xử lý inline CSS từ HTML qua `html-inline-proxy`; trong môi trường Windows/OneDrive hiện tại, bước proxy inline CSS này lỗi với module `index.html?html-proxy&inline-css&index=0.css`.

## Files changed

- `apps/web/index.html`
  - Xóa inline `<style>` khỏi `<head>`.
  - Xóa inline `<style>` chứa `@keyframes sp` khỏi `#root`.
  - Thay inline style của loading placeholder bằng class:
    - `app-loading-screen`
    - `app-loading-spinner`
    - `app-loading-text`
  - Thay inline style của noscript wrapper bằng class `noscript-content`.
  - Giữ lại meta tags, title, favicon/manifest, root div, script module `/src/main.tsx`, PayOS script, service worker script và Cloudflare beacon loader.

- `apps/web/src/index.css`
  - Tạo file CSS thường để chứa CSS đã move khỏi `index.html`:
    - `:root { color-scheme: light; }`
    - base `body`
    - `#root`
    - loading placeholder styles
    - `@keyframes sp`
    - `.landing-hero` styles
    - responsive rule cho `.landing-hero`
    - `.noscript-content`

- `apps/web/src/main.tsx`
  - Import CSS mới:
    - `import './index.css';`
  - Giữ import CSS hiện có:
    - `import './styles.css';`

## What CSS was moved

Đã chuyển toàn bộ CSS inline trong HTML sang `apps/web/src/index.css`, gồm:

- global light color-scheme
- body background/text/font mặc định
- root minimum height
- landing hero background/layout/text rules
- loading spinner layout và animation `sp`
- noscript fallback wrapper layout

## Vite config

Không chỉnh `apps/web/vite.config.ts` vì lỗi được xử lý an toàn bằng cách bỏ inline CSS khỏi `index.html` đúng theo phạm vi build fix.

## Validation

### TypeScript

Command:

```text
npx tsc -p apps/web/tsconfig.json --noEmit
```

Result: PASS, exit code 0.

### Production build

Command:

```text
npm run build
```

Result: PASS, exit code 0.

Vite output summary:

```text
✓ 2680 modules transformed.
✓ built in 13.41s
```

Build vẫn có warning chunk size lớn hơn 500 kB, nhưng đây là warning tối ưu bundle, không phải lỗi build.

## Confirmation

Lỗi `vite:html-inline-proxy` đã được sửa. Production build hiện chạy thành công sau khi inline CSS được đưa ra khỏi `apps/web/index.html` và import qua CSS module bình thường từ `apps/web/src/main.tsx`.
