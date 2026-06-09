$Project = "C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH"
Set-Location $Project

$AutoPasteToCline = $true

$OldPrompt1Report = "reports\github-source-replacement-audit.md"
$R01Report = "reports\r01-penglish-feature-audit.md"

$PromptDir = "reports\cline-prompts"

$promptMap = @{
  "R01" = "$PromptDir\R01-feature-audit.txt"
  "R02" = "$PromptDir\R02-real-github-integration.txt"
  "R03" = "$PromptDir\R03-vocabulary-flashcards.txt"
  "R04" = "$PromptDir\R04-grammar.txt"
  "R05" = "$PromptDir\R05-reading.txt"
  "R06" = "$PromptDir\R06-shadowing.txt"
  "R07" = "$PromptDir\R07-english-speed.txt"
  "R08" = "$PromptDir\R08-guided-engine.txt"
  "R09" = "$PromptDir\R09-dashboard-ui.txt"
  "R10" = "$PromptDir\R10-keyboard-accessibility.txt"
  "R11" = "$PromptDir\R11-browser-qa.txt"
  "R12" = "$PromptDir\R12-final-report.txt"
}

function Test-PromptFiles {
  $missing = @()

  foreach ($key in $promptMap.Keys) {
    if (-not (Test-Path $promptMap[$key])) {
      $missing += $promptMap[$key]
    }
  }

  if ($missing.Count -gt 0) {
    Write-Host "Thieu cac file prompt sau:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    exit
  }
}

function Wait-AnyFileStable {
  param([string[]]$Paths)

  Write-Host ""
  Write-Host "Dang doi mot trong cac report sau:" -ForegroundColor Cyan
  $Paths | ForEach-Object { Write-Host "- $_" -ForegroundColor Cyan }

  $found = $null

  while (-not $found) {
    foreach ($path in $Paths) {
      if (Test-Path $path) {
        $found = $path
        break
      }
    }
    Start-Sleep -Seconds 10
  }

  Write-Host "Da thay report: $found" -ForegroundColor Green
  Write-Host "Dang doi file on dinh..." -ForegroundColor Yellow

  $sameCount = 0
  $lastLength = -1

  while ($sameCount -lt 4) {
    $item = Get-Item $found
    $length = $item.Length

    if ($length -eq $lastLength -and $length -gt 0) {
      $sameCount++
    } else {
      $sameCount = 0
      $lastLength = $length
    }

    Start-Sleep -Seconds 5
  }

  Write-Host "Report da on dinh: $found" -ForegroundColor Green
  return $found
}

function Wait-FileStable {
  param([string]$Path)

  Write-Host ""
  Write-Host "Dang doi report: $Path" -ForegroundColor Cyan

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

function Send-PromptToCline {
  param(
    [string]$PromptPath,
    [string]$TaskName
  )

  $promptText = Get-Content -Raw $PromptPath
  Set-Clipboard -Value $promptText

  [console]::beep(900, 250)
  [console]::beep(1200, 250)

  Write-Host ""
  Write-Host "==========================================" -ForegroundColor Green
  Write-Host "Dang gui $TaskName vao Cline..." -ForegroundColor Green
  Write-Host "Prompt file: $PromptPath" -ForegroundColor DarkGray
  Write-Host "==========================================" -ForegroundColor Green

  if ($AutoPasteToCline) {
    $wshell = New-Object -ComObject WScript.Shell

    $activated = $false
    try {
      $activated = $wshell.AppActivate("Visual Studio Code")
    } catch {}

    if (-not $activated) {
      try {
        $activated = $wshell.AppActivate("Code")
      } catch {}
    }

    Start-Sleep -Seconds 1
    $wshell.SendKeys("^v")
    Start-Sleep -Milliseconds 700
    $wshell.SendKeys("{ENTER}")

    Write-Host "Da tu dong paste va Enter cho $TaskName." -ForegroundColor Green
  } else {
    Write-Host "Da copy $TaskName vao clipboard. Hay tu Ctrl+V vao Cline." -ForegroundColor Yellow
  }
}

Test-PromptFiles

Write-Host "Auto watcher da san sang." -ForegroundColor Green
Write-Host "Hay click vao o chat Cline mot lan, sau do de yen may." -ForegroundColor Yellow

$firstReport = Wait-AnyFileStable -Paths @($OldPrompt1Report, $R01Report)

if ($firstReport -eq $OldPrompt1Report -and -not (Test-Path $R01Report)) {
  Send-PromptToCline -PromptPath $promptMap["R01"] -TaskName "R01 Feature Audit"
  Wait-FileStable -Path $R01Report
}

$queue = @(
  @{
    Name = "R02 Real GitHub Repo Integration Plan"
    WaitFor = "reports\r01-penglish-feature-audit.md"
    Prompt = $promptMap["R02"]
  },
  @{
    Name = "R03 Vocabulary replacement"
    WaitFor = "reports\r02-github-repo-real-integration-plan.md"
    Prompt = $promptMap["R03"]
  },
  @{
    Name = "R04 Grammar replacement"
    WaitFor = "reports\r03-vocabulary-flashcard-replacement.md"
    Prompt = $promptMap["R04"]
  },
  @{
    Name = "R05 Reading replacement"
    WaitFor = "reports\r04-grammar-replacement.md"
    Prompt = $promptMap["R05"]
  },
  @{
    Name = "R06 Shadowing replacement"
    WaitFor = "reports\r05-reading-sentence-replacement.md"
    Prompt = $promptMap["R06"]
  },
  @{
    Name = "R07 English Speed replacement"
    WaitFor = "reports\r06-shadowing-replacement.md"
    Prompt = $promptMap["R07"]
  },
  @{
    Name = "R08 Unified guided lesson engine"
    WaitFor = "reports\r07-english-speed-pronunciation.md"
    Prompt = $promptMap["R08"]
  },
  @{
    Name = "R09 Dashboard progress whale UI"
    WaitFor = "reports\r08-unified-guided-lesson-engine.md"
    Prompt = $promptMap["R09"]
  },
  @{
    Name = "R10 Keyboard accessibility cleanup"
    WaitFor = "reports\r09-dashboard-progress-whale-ui.md"
    Prompt = $promptMap["R10"]
  },
  @{
    Name = "R11 Browser QA screenshots"
    WaitFor = "reports\r10-keyboard-accessibility-cleanup.md"
    Prompt = $promptMap["R11"]
  },
  @{
    Name = "R12 Final report"
    WaitFor = "reports\r11-browser-qa-screenshots.md"
    Prompt = $promptMap["R12"]
  }
)

foreach ($item in $queue) {
  Wait-FileStable -Path $item.WaitFor
  Send-PromptToCline -PromptPath $item.Prompt -TaskName $item.Name
}

Write-Host ""
Write-Host "Da gui het R01-R12 cho Cline." -ForegroundColor Green
Write-Host "Final report se nam tai: reports\r12-final-real-github-replacement-report.md" -ForegroundColor Green
