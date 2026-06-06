# P-English TypeScript Cleanup Report

Ngày thực hiện: 2026-05-21

## 1. Mục tiêu

Fix đúng 3 lỗi TypeScript known/unrelated đang chặn lệnh:

```text
npx tsc -p apps/web/tsconfig.json --noEmit
```

Không thay đổi Unit 1 learning behavior, lesson content, PracticePage behavior, backend/auth/database/env/API keys/runtime state, Vite config, `index.html`, hoặc build pipeline.

## 2. Files changed

| File | Change |
|---|---|
| [`CategoriesPage.tsx`](../apps/web/src/pages/CategoriesPage.tsx) | Thay `transition={{ delay: i * 0.04 }}` trên `MotionBox` bằng transition string hợp lệ với Chakra type. |
| [`FoldersPage.tsx`](../apps/web/src/pages/FoldersPage.tsx) | Thay `transition={{ delay: i * 0.04 }}` trên `MotionBox` bằng transition string hợp lệ với Chakra type. |
| [`StudyPage.tsx`](../apps/web/src/pages/StudyPage.tsx) | Gộp duplicate `transition` props thành một prop duy nhất. |

## 3. Exact TypeScript errors fixed

### 3.1 [`CategoriesPage.tsx`](../apps/web/src/pages/CategoriesPage.tsx)

Before:

```tsx
transition={{ delay: i * 0.04 }}
```

Error:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
```

After:

```tsx
transition="all 0.2s ease"
```

Explanation: `MotionBox` is created from Chakra `Box`, so the `transition` prop resolves to Chakra style typing in this usage. The object containing `delay` was invalid for Chakra's `transition` style prop. Replacing it with a valid CSS transition string keeps hover/motion visually similar without changing layout or learning behavior.

### 3.2 [`FoldersPage.tsx`](../apps/web/src/pages/FoldersPage.tsx)

Before:

```tsx
transition={{ delay: i * 0.04 }}
```

Error:

```text
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
```

After:

```tsx
transition="all 0.2s ease"
```

Explanation: same low-risk Chakra-compatible transition fix as [`CategoriesPage.tsx`](../apps/web/src/pages/CategoriesPage.tsx). The cards still render with initial/animate props and keep the same visual card/hover structure.

### 3.3 [`StudyPage.tsx`](../apps/web/src/pages/StudyPage.tsx)

Before:

```tsx
transition={{ duration: 0.2 }}
initial={i < 30 ? { opacity: 0, y: 8 } : false}
animate={{ opacity: 1, y: 0 }}
{...(i < 30 ? { transition: { delay: i * 0.02, duration: 0.25 } } : {})}
```

Error:

```text
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

After:

```tsx
initial={i < 30 ? { opacity: 0, y: 8 } : false}
animate={{ opacity: 1, y: 0 }}
transition={i < 30 ? { delay: i * 0.02, duration: 0.25 } : { duration: 0.2 }}
```

Explanation: removed duplicate prop/spread pattern and kept one explicit transition prop. For the first 30 items it preserves the intended staggered delay; for the rest it preserves the fallback duration.

## 4. TypeScript result

Command:

```text
npx tsc -p apps/web/tsconfig.json --noEmit
```

Result: passed.

Exit code: `0`.

No remaining TypeScript errors were reported by this command after the cleanup.

## 5. Build result

Command:

```text
npm run build
```

Result: failed with known Vite `html-inline-proxy` issue.

Observed error:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

## 6. Known Vite path-space status

Status: pre-existing/path-related.

The build failure still appears under project path:

```text
C:/Users/PC/OneDrive/P-English/Luyen Tu
```

The folder name contains a space: `Luyen Tu`.

No Vite config, `index.html`, or build pipeline file was edited in this task, per scope.

## 7. Remaining issues

- Production build remains blocked by the known Vite `html-inline-proxy` path-space issue.
- TypeScript check now passes.
- No Unit 1 learning behavior, lesson content, PracticePage behavior, backend/auth/env, or build pipeline changes were made.
