# P-English AI Website Cloner Workflow

You are working in the P-English / P-Share Hub project.

Local website cloner template:
_tools/ai-website-cloner-template

Reference docs:
docs/ai-website-cloner/AGENTS.md
docs/ai-website-cloner/clone-website-skill.md

Important:
- Cline does not need a visible /clone command.
- When the user writes "CLONE-WEBSITE RESEARCH ONLY: <url>", treat it as the clone/research workflow.
- Do not blindly copy any website.
- Do not copy logos, protected brand assets, paid content, private content, or account-only pages.
- Only study public UX patterns, lesson structure, exercise logic, content organization, interaction flow, and learning progression.
- Rebuild useful ideas into the existing P-English ocean UI style.
- Save research notes under docs/research/imported-sites/
- Save screenshots under reports/screenshots/
- Do not modify production app code during research-only tasks.
- Ask before implementing large UI/data changes.

For learning websites, prioritize:
1. lesson structure
2. CEFR / IELTS / TOEIC progression
3. vocabulary, grammar, listening, speaking, shadowing, review logic
4. answer data quality
5. mobile learning UX
6. feedback and progress system
7. reusable lesson data schema

After implementation tasks, run:
npm run build

Also produce a concise report with changed files, QA screenshots, remaining risks, and next recommended tasks.
