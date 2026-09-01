Write-Host "=== P-English Safe QA Runner ==="

git status

npm run build -w @pshare/web

node scripts/foundation48-entry-simplification-qa.cjs

node scripts/_qa-learning-redesign-after.cjs

Write-Host "=== DONE ==="
