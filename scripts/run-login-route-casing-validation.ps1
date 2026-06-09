$ErrorActionPreference = 'Stop'

Write-Host "[1/3] Building @pshare/web..."
npm run build -w @pshare/web

Write-Host "[2/3] Running login route casing browser QA..."
node scripts/login-route-casing-qa.cjs

Write-Host "[3/3] Checking git status..."
git status --short
