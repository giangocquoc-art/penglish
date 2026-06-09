$Project = "C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH"
Set-Location $Project

# Doi thanh $true neu muon PowerShell tu Ctrl+V + Enter vao cua so dang focus.
# CANH BAO: Chi bat $true khi o chat Cline dang duoc focus.
$AutoPasteToFocusedWindow = $false

$queue = @(
  @{
    Name = "R02 No-clone source policy"
    WaitFor = "reports\r01-penglish-feature-audit.md"
    Prompt = "reports\cline-prompts\R02-no-clone-source-policy.txt"
  },
  @{
    Name = "R03 Vocabulary replacement"
    WaitFor = "reports\r02-no-clone-source-policy.md"
    Prompt = "reports\cline-prompts\R03-vocabulary-flashcards.txt"
  },
  @{
    Name = "R04 Grammar replacement"
    WaitFor = "reports\r03-vocabulary-flashcard-replacement.md"
    Prompt = "reports\cline-prompts\R04-grammar.txt"
  },
  @{
    Name = "R05 Reading replacement"
    WaitFor = "reports\r04-grammar-replacement.md"
    Prompt = "reports\cline-prompts\R05-reading.txt"
  },
  @{
    Name = "R06 Shadowing replacement"
    WaitFor = "reports\r05-reading-sentence-replacement.md"
    Prompt = "reports\cline-prompts\R06-shadowing.txt"
  },
  @{
    Name = "R07 English Speed replacement"
    WaitFor = "reports\r06-shadowing-replacement.md"
    Prompt = "reports\cline-prompts\R07-english-speed.txt"
  },
  @{
    Name = "R08 Unified guided lesson engine"
    WaitFor = "reports\r07-english-speed-pronunciation.md"
    Prompt = "reports\cline-prompts\R08-guided-engine.txt"
  },
  @{
    Name = "R09 Dashboard progress whale UI"
    WaitFor = "reports\r08-unified-guided-lesson-engine.md"
    Prompt = "reports\cline-prompts\R09-dashboard-ui.txt"
  },
  @{
    Name = "R10 Keyboard accessibility cleanup"
    WaitFor = "reports\r09-dashboard-progress-whale-ui.md"
    Prompt = "reports\cline-prompts\R10-keyboard-accessibility.txt"
  },
  @{
    Name = "R11 Browser QA screenshots"
    WaitFor = "reports\r10-keyboard-accessibility-cleanup.md"
    Prompt = "reports\cline-prompts\R11-browser-qa.txt"
  },
  @{
    Name = "R12 Final report"
    WaitFor = "reports\r11-browser-qa-screenshots.md"
    Prompt = "reports\cline-prompts\R12-final-report.txt"
  }
)

function Wait-FileStable {
  param([string]$Path)

  Write-Host ""
  Write-Host "Dang cho report: $Path" -ForegroundColor Cyan

  while (-not (Test-Path $Path)) {
    Start-Sleep -Seconds 10
  }

  Write-Host "Da thay report. Dang doi file on dinh..." -ForegroundColor Yellow

  $sameCount = 0
  $lastLength = -1

  while ($sameCount -lt 4) {
    $item = Get-Item $Path
    $length = $item.Length

    if ($length -eq $lastLength -and $length -gt 0) {
      $sameCount++
    } else {
      $sameCount = 0
      $lastLength = $length
    }

    Start-Sleep -Seconds 5
  }

  Write-Host "Report da on dinh: $Path" -ForegroundColor Green
}

function Send-PromptToFocusedWindow {
  param([string]$Text)

  Set-Clipboard -Value $Text
  Start-Sleep -Milliseconds 500

  $wshell = New-Object -ComObject WScript.Shell
  $wshell.SendKeys("^v")
  Start-Sleep -Milliseconds 500
  $wshell.SendKeys("{ENTER}")
}

foreach ($item in $queue) {
  Wait-FileStable -Path $item.WaitFor

  $promptText = Get-Content -Raw $item.Prompt
  Set-Clipboard -Value $promptText

  [console]::beep(900, 250)
  [console]::beep(1200, 250)

  Write-Host ""
  Write-Host "============================================" -ForegroundColor Green
  Write-Host "$($item.Name) da duoc copy vao clipboard." -ForegroundColor Green

  if ($AutoPasteToFocusedWindow) {
    Write-Host "Che do AUTO-PASTE dang bat. Dang gui vao cua so dang focus..." -ForegroundColor Yellow
    Send-PromptToFocusedWindow -Text $promptText
    Write-Host "Da gui prompt. Script se tiep tuc doi report ke tiep." -ForegroundColor Green
  } else {
    Write-Host "Hay bam vao o chat Cline -> Ctrl + V -> Enter." -ForegroundColor Yellow
    Write-Host "Sau khi gui xong, quay lai PowerShell va bam Enter de doi task tiep theo." -ForegroundColor Yellow
    Read-Host "Nhan Enter sau khi da gui prompt vao Cline"
  }

  Write-Host "============================================" -ForegroundColor Green
}

Write-Host "Da hoan tat queue R01-R12." -ForegroundColor Green
