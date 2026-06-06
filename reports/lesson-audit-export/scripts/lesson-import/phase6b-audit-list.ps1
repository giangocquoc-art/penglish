$repos = 'olp-en-cefrj','awesome-english','resources-for-english','english-dictionary-open-source','english-learning-app','english-pronunciation-app','english-now','wordpecker-app'
foreach ($repo in $repos) {
  Write-Host "--- $repo ---"
  $p = Join-Path 'external-sources\candidates' $repo
  Get-ChildItem -Path $p -Force -File | Where-Object { $_.Name -match '^(LICENSE|LICENCE|COPYING|NOTICE|README|package|pyproject|Cargo|composer|pnpm|yarn|npm)' } | Select-Object -ExpandProperty Name
  Get-ChildItem -Path $p -Force -Directory | Select-Object -First 12 -ExpandProperty Name
}
