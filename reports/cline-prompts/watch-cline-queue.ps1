$Project = "C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH"
Set-Location $Project

$queue = @(
  @{
    Name = "Task 02"
    WaitFor = "reports\github-source-replacement-audit.md"
    Prompt = "reports\cline-prompts\02-import-github-lessons.txt"
  },
  @{
    Name = "Task 03"
    WaitFor = "reports\github-lesson-import-report.md"
    Prompt = "reports\cline-prompts\03-wire-ui-to-generated-lessons.txt"
  },
  @{
    Name = "Task 04"
    WaitFor = "reports\github-data-ui-wiring-report.md"
    Prompt = "reports\cline-prompts\04-shadowing-english-speed.txt"
  },
  @{
    Name = "Task 05"
    WaitFor = "reports\shadowing-english-speed-source-replacement-report.md"
    Prompt = "reports\cline-prompts\05-full-qa.txt"
  },
  @{
    Name = "Final Report"
    WaitFor = "reports\github-source-replacement-qa-report.md"
    Prompt = "reports\cline-prompts\06-final-report.txt"
  }
)

function Wait-FileStable {
  param([string]$Path)

  Write-Host "Dang cho file report xuat hien: $Path" -ForegroundColor Cyan

  while (-not (Test-Path $Path)) {
    Start-Sleep -Seconds 10
  }

  Write-Host "Da thay file. Dang cho file on dinh..." -ForegroundColor Yellow

  $sameCount = 0
  $lastLength = -1

  while ($sameCount -lt 3) {
    $item = Get-Item $Path
    $length = $item.Length

    if ($length -eq $lastLength) {
      $sameCount++
    } else {
      $sameCount = 0
      $lastLength = $length
    }

    Start-Sleep -Seconds 5
  }

  Write-Host "File da on dinh: $Path" -ForegroundColor Green
}

foreach ($item in $queue) {
  Wait-FileStable -Path $item.WaitFor

  $promptText = Get-Content -Raw $item.Prompt
  Set-Clipboard -Value $promptText

  [console]::beep(900, 300)
  [console]::beep(1200, 300)

  Write-Host ""
  Write-Host "=========================================" -ForegroundColor Green
  Write-Host "$($item.Name) da duoc copy vao clipboard." -ForegroundColor Green
  Write-Host "Bay gio bam vao o chat Cline, nhan Ctrl + V roi Enter." -ForegroundColor Yellow
  Write-Host "Sau khi da gui prompt vao Cline, quay lai cua so PowerShell nay va bam Enter de no tiep tuc doi report ke tiep." -ForegroundColor Yellow
  Write-Host "=========================================" -ForegroundColor Green
  Write-Host ""

  Read-Host "Nhan Enter sau khi ban da gui prompt vao Cline"
}

Write-Host "Da hoan tat toan bo prompt queue." -ForegroundColor Green
