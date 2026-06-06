# P-English Final Ocean UX Polish Report

## Summary

Completed the final ocean UX polish pass for P-English. The pass focused on making the ambient Poo whale feel like a subtle living ocean background, making Shadowing transcript-first with safe video handling, reducing mobile density at 390px, and aligning landing-to-app routing without breaking existing routes.

## Changes completed

### Ambient Poo whale

- Kept `AmbientPooWhale` enabled and route-aware.
- Tuned route presets so Poo sits lower/right and reads as a far-background ocean element instead of duplicated mascot art.
- Reduced desktop opacity and kept mobile hidden on dense routes, except English Speed where a very subtle mobile background remains.
- Preserved non-interactive behavior with `pointer-events: none`, behind-content placement, reduced-motion handling, and `?debugPoo=1` diagnostics.

### Shadowing video availability

- Expanded the Shadowing model with curated lesson metadata: `id`, `title`, `level`, `duration`, `topic`, `youtubeId`, `embedAllowed`, and `transcriptLines`.
- Added 10 built-in curated transcript-first lessons across A1, A2, and B1.
- Prevented unsafe/default YouTube iframe rendering by only allowing iframe output when `embedAllowed=true` and a valid `youtubeId` is present.
- Kept local transcript lines as the primary practice source.
- Kept fallback/reference behavior available for non-embeddable or transcript-only lessons.

### Mobile UX simplification

- Reduced mobile density at 390px across Home, Learning Path, Lesson, English Speed, Shadowing, and Vocabulary.
- Hid or collapsed repeated helper text and secondary panels on mobile.
- Added progressive disclosure with `details` sections where support content was useful but too dense for first screen.
- Added safe-bottom padding patterns so the mobile bottom nav does not cover core page content.
- Adjusted English Speed mobile secondary retry/next controls so they do not crowd or collide with bottom navigation before results exist.

### Landing/app consistency

- Kept `/` as the public landing route and added `/landing` as an explicit alias.
- Updated landing CTAs to point users into `/home` for the free learning experience.
- Reduced landing mobile hero density and hid large decorative elements on the smallest viewport.

## QA and validation

### TypeScript/build

- `npx.cmd tsc -p apps/web/tsconfig.json --noEmit` passed.
- `npm.cmd run build` passed.
- `npm.cmd run build -w @pshare/web` passed after the final English Speed mobile adjustment.
- Build warning remains the existing Vite chunk-size warning for the UI vendor chunk.

### Browser QA

Final Playwright QA passed against Vite preview at `http://127.0.0.1:5180`:

```text
P-English final ocean UX polish QA passed. Saved 16 screenshots to reports/screenshots
```

QA covered desktop and mobile `390x844` for:

- `/`
- `/home`
- `/learning-path`
- `/lessons/unit-1-greetings-introduction`
- `/english-speed`
- `/shadowing`
- `/words`
- `/english-speed?debugPoo=1`

### Final screenshots

Saved under `reports/screenshots`:

- `penglish-final-landing-desktop.png`
- `penglish-final-landing-mobile-390.png`
- `penglish-final-home-desktop.png`
- `penglish-final-home-mobile-390.png`
- `penglish-final-roadmap-desktop.png`
- `penglish-final-roadmap-mobile-390.png`
- `penglish-final-lesson-desktop.png`
- `penglish-final-lesson-mobile-390.png`
- `penglish-final-english-speed-desktop.png`
- `penglish-final-english-speed-mobile-390.png`
- `penglish-final-shadowing-desktop.png`
- `penglish-final-shadowing-mobile-390.png`
- `penglish-final-words-desktop.png`
- `penglish-final-words-mobile-390.png`
- `penglish-final-english-speed-debug-poo-desktop.png`
- `penglish-final-english-speed-debug-poo-mobile-390.png`
- `penglish-final-ocean-ux-polish-qa.json`

## Notes

- The QA script was stabilized for current copy on the Learning Path page by waiting for `Lộ trình CEFR` instead of older text.
- The QA script now checks for unsafe Shadowing YouTube iframe rendering rather than requiring a fallback card when the default curated lesson is intentionally transcript-only.
- Ambient frame request aborts during rapid route changes are ignored in QA because they are expected when route screenshots switch while image frames are loading.
- Existing active dev/preview terminals were left running; no process shutdown was performed.
