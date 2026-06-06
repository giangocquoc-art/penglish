# Pshare

Ung dung hoc tu vung tieng Anh thong minh - flashcard + Spaced Repetition + game tuong tac.

## Stack

- React 18 + Vite 5 + Chakra UI v2 + Framer Motion
- Express + Node 20 + better-sqlite3
- TypeScript

## Cai dat va chay local development

```bash
npm ci
npm run dev:api    # API port 8080
npm run dev:web    # Web port 5173
```

Mo http://localhost:5173/home khi phat trien local. Web va API chay rieng trong local development.

## Production: mot full-stack app

Build frontend truoc, sau do chay API. Express se phuc vu ca API routes va Vite frontend da build tu `apps/web/dist` tren cung mot port.

```bash
npm ci
npm run build
npm run start:api    # API port 8080
```

Mo http://localhost:8080/home. Neu khong cau hinh `VITE_API_URL` trong production, web se goi API cung domain, vi du `/auth/google`, `/health`, `/paths/summary`.

## Vercel + Supabase deployment workflow

This project is currently **Vite + Express + SQLite**. It is not fully Supabase-ready yet. The deployment workflow below is safe and predictable: it deploys the Vite frontend to Vercel and only pushes Supabase migrations when `supabase/migrations` exists.

Create local environment variables in PowerShell before a real deployment:

```powershell
$env:VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
$env:VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
$env:SUPABASE_PROJECT_REF="your-project-ref"
```

Do **not** put `SUPABASE_SERVICE_ROLE_KEY` in frontend code. The frontend may use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Install required CLIs if missing:

```powershell
npm i -g vercel
npm i -g supabase
```

Dry-run without deploying:

```powershell
.\scripts\deploy-prod.ps1 -DryRun
```

Production deploy:

```powershell
.\scripts\deploy-prod.ps1
```

The script checks tools/env vars, runs `npm ci`, runs `npm run build`, pushes Supabase migrations if available, sets Vercel production env vars best-effort, deploys with `vercel --prod`, and reminds you to test `/home`, `/learning-path`, `/shadowing`, and `/practice`.

## Tinh nang

- Flashcard SRS
- 6 game tuong tac
- Bang xep hang cong dong
- AI sinh tu vung
- Cua hang theme & avatar
- Streak hang ngay

## License

Private - Pshare (C) 2026
