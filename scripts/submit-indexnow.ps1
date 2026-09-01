param(
  [string]$SitemapPath = "apps/web/public/sitemap.xml",
  [string]$HostUrl = "https://www.pooenglish.com",
  [string]$Key = $env:INDEXNOW_KEY,
  [string]$Endpoint = "https://api.indexnow.org/indexnow"
)

$ErrorActionPreference = "Stop"

try {
  if ([string]::IsNullOrWhiteSpace($Key)) {
    Write-Host "IndexNow skipped: INDEXNOW_KEY is not set."
    exit 0
  }

  if (!(Test-Path $SitemapPath)) {
    Write-Host "IndexNow skipped: sitemap not found at $SitemapPath."
    exit 0
  }

  [xml]$sitemap = Get-Content -Path $SitemapPath -Raw -Encoding UTF8
  $urls = @($sitemap.urlset.url | ForEach-Object { $_.loc } | Where-Object { $_ -like "$HostUrl*" })

  if ($urls.Count -eq 0) {
    Write-Host "IndexNow skipped: no URLs found in sitemap."
    exit 0
  }

  $body = @{
    host = ([Uri]$HostUrl).Host
    key = $Key
    keyLocation = "$HostUrl/$Key.txt"
    urlList = $urls
  } | ConvertTo-Json -Depth 5

  Write-Host "Submitting $($urls.Count) URLs to IndexNow..."
  $response = Invoke-RestMethod -Method Post -Uri $Endpoint -ContentType "application/json; charset=utf-8" -Body $body
  Write-Host "IndexNow submission completed."
  if ($response) {
    $response | ConvertTo-Json -Depth 5 | Write-Host
  }
  exit 0
} catch {
  Write-Host "IndexNow submission failed but build will continue: $($_.Exception.Message)"
  exit 0
}
