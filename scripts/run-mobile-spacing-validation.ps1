$ErrorActionPreference = 'Stop'

Write-Host "[1/3] Building @pshare/web..."
npm run build -w @pshare/web

Write-Host "[2/3] Running mobile spacing browser QA..."
node scripts/mobile-spacing-qa.cjs

Write-Host "[3/3] Checking git status..."
git status --short
