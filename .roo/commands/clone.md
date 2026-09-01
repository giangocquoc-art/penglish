---
description: Research and rebuild website UX patterns for P-English using the AI Website Cloner workflow
argument-hint: <url1> [url2 ...]
---

# P-English AI Website Cloner

Use the URL or URLs typed after this slash command as the target.

You are working in this existing app:

C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH

Read these first:
- docs/ai-website-cloner/clone-website-skill.md
- _tools/ai-website-cloner-template/AGENTS.md if it exists
- current app structure under apps/web
- existing P-English reports under reports/

IMPORTANT P-ENGLISH RULES:
- Do not directly copy copyrighted lesson text, brand assets, logos, or proprietary content into P-English.
- Use the target website for UX/content-structure research only unless the user explicitly says they own the site.
- Extract learning patterns: lesson taxonomy, exercise flow, progression, feedback logic, microcopy style, mobile layout, review/spaced repetition logic, listening/shadowing flow.
- Rebuild as original P-English content and UI matching our ocean/Poo design system.
- Preserve current P-English style: ocean background, subtle ambient whale, glass cards, mobile-first layout, no messy duplicate mascots.
- Never break existing routes: /, /learning-path, /english-speed, /shadowing, /words, /lessons/unit-1-greetings-introduction.
- Prefer research report first, then implementation plan, then code changes only after the plan is clear.

WORKFLOW:
1. Verify the URL is accessible through available browser tools/MCP.
2. Take desktop and mobile screenshots if browser automation is available.
3. Map page sections, interactions, content structure, and responsive behavior.
4. Save findings to reports/website-cloner-research/.
5. Propose exactly how to adapt the useful patterns into P-English.
6. If implementation is requested, modify only the relevant P-English files, keep build passing, and capture QA screenshots.

VALIDATION REQUIRED:
- npm run build
- Browser QA on desktop and mobile
- Screenshots saved under reports/screenshots when implementation happens

Start now with the target URL(s) provided after the slash command.
