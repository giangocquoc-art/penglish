# Shadowing copy rename report

## Summary
Renamed the awkward Vietnamese Shadowing copy from “nói đuổi” wording to modern, product-consistent Shadowing copy.

## Changes made
- Updated the Shadowing hero title in `apps/web/src/pages/ShadowingPage.tsx` from “Phòng nói đuổi cùng Poo” to “Shadowing cùng Poo”.
- Updated the Shadowing hero explanation to: “Nghe mẫu, nói theo nhịp, ghi âm rồi để Poo góp ý phát âm, nhịp nói và độ tự nhiên.”
- Updated the custom transcript fallback hint in `apps/web/src/pages/ShadowingPage.tsx` to use “luyện nói theo nhịp” instead of “nói đuổi”.
- Updated the sidebar Shadowing subtitle in `apps/web/src/components/Sidebar.tsx` from “Nói đuổi” to “Luyện nói theo nhịp”.

## Validation
- Search confirmed no remaining `Phòng nói đuổi`, `nói đuổi`, or `Nói đuổi` copy in `apps/web/src/**/*.tsx`.
- `npx.cmd tsc -p apps/web/tsconfig.json --noEmit` passed.
- `npm.cmd run build` passed.

## Additional note
During validation, TypeScript surfaced an existing strict-nullability issue in `apps/web/src/components/p-english/PooOceanCompanion.tsx` where `contextSafe` could be undefined. I fixed it with a local safe fallback wrapper so the requested build checks could pass. No deployment was performed.
