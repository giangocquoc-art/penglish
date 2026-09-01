$ErrorActionPreference = "Continue"

$ProjectRoot = "C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH"
$CsvPath = Join-Path $ProjectRoot "_source\foundation48\foundation48-folders.csv"
$OutRoot = Join-Path $ProjectRoot "_source\foundation48\raw-direct"
$ReportRoot = Join-Path $ProjectRoot "_source\foundation48\reports"
$SummaryPath = Join-Path $ReportRoot "direct-download-summary.csv"

New-Item -ItemType Directory -Force $OutRoot | Out-Null
New-Item -ItemType Directory -Force $ReportRoot | Out-Null

function ConvertTo-Slug {
    param([string]$Text)

    $normalized = $Text.Normalize([Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder

    foreach ($ch in $normalized.ToCharArray()) {
        $cat = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
        if ($cat -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$sb.Append($ch)
        }
    }

    $s = $sb.ToString().Normalize([Text.NormalizationForm]::FormC).ToLower()
    $s = $s.Replace("đ", "d")
    $s = $s -replace "[^a-z0-9\s-]", ""
    $s = $s -replace "\s+", "-"
    $s = $s.Trim("-")

    if ($s.Length -gt 80) {
        $s = $s.Substring(0, 80).Trim("-")
    }

    if ([string]::IsNullOrWhiteSpace($s)) {
        return "lesson"
    }

    return $s
}

function Get-FolderId {
    param([string]$Url)

    $m = [regex]::Match($Url, "/folders/([^/?]+)")
    if ($m.Success) {
        return $m.Groups[1].Value
    }

    throw "Cannot extract folder id from $Url"
}

function Count-Files {
    param([string]$Folder)

    $files = @(Get-ChildItem $Folder -Recurse -File -ErrorAction SilentlyContinue)

    $pdf = @($files | Where-Object { $_.Extension -ieq ".pdf" }).Count
    $mp3 = @($files | Where-Object { $_.Extension -ieq ".mp3" }).Count
    $audio = @($files | Where-Object { $_.Extension -match "^\.(mp3|wav|m4a|aac|ogg|flac)$" }).Count
    $video = @($files | Where-Object { $_.Extension -match "^\.(mp4|mov|mkv|webm)$" }).Count
    $doc = @($files | Where-Object { $_.Extension -match "^\.(doc|docx)$" }).Count
    $ppt = @($files | Where-Object { $_.Extension -match "^\.(ppt|pptx)$" }).Count
    $sheet = @($files | Where-Object { $_.Extension -match "^\.(xls|xlsx)$" }).Count
    $other = $files.Count - $pdf - $audio - $video - $doc - $ppt - $sheet

    [PSCustomObject]@{
        Total = $files.Count
        PDF = $pdf
        MP3 = $mp3
        Audio = $audio
        Video = $video
        Doc = $doc
        PPT = $ppt
        Sheet = $sheet
        Other = $other
    }
}

$rows = Import-Csv $CsvPath

$summary = foreach ($row in $rows) {
    $day = [int]$row.day
    $title = $row.title
    $url = $row.url
    $id = Get-FolderId $url
    $slug = ConvertTo-Slug $title

    $outDir = Join-Path $OutRoot ("day-{0:D2}-{1}" -f $day, $slug)
    $logFile = Join-Path $ReportRoot ("direct-day-{0:D2}.log" -f $day)
    $remoteListFile = Join-Path $ReportRoot ("direct-day-{0:D2}-remote-files.txt" -f $day)

    New-Item -ItemType Directory -Force $outDir | Out-Null

    Write-Host ""
    Write-Host "===== DAY $day / 48 =====" -ForegroundColor Cyan
    Write-Host $title
    Write-Host "Folder ID: $id"
    Write-Host "Output: $outDir"

    & rclone lsf "gdrive:" `
        --drive-root-folder-id $id `
        --drive-shared-with-me `
        --drive-acknowledge-abuse `
        --recursive `
        --files-only `
        --format "pst" `
        --log-level INFO `
        *> $remoteListFile

    $remoteCount = 0
    if (Test-Path $remoteListFile) {
        $remoteCount = @(Get-Content $remoteListFile -ErrorAction SilentlyContinue | Where-Object { $_.Trim() -ne "" }).Count
    }

    Write-Host "Remote visible files: $remoteCount"

    & rclone copy "gdrive:" "$outDir" `
        --drive-root-folder-id $id `
        --drive-shared-with-me `
        --drive-acknowledge-abuse `
        --drive-export-formats "pdf,docx,xlsx,pptx,txt" `
        --create-empty-src-dirs `
        --transfers 6 `
        --checkers 16 `
        --retries 10 `
        --low-level-retries 50 `
        --stats 10s `
        --progress `
        --log-file "$logFile" `
        --log-level INFO

    $counts = Count-Files $outDir

    Write-Host "Local total: $($counts.Total) | PDF: $($counts.PDF) | MP3: $($counts.MP3) | Audio: $($counts.Audio)" -ForegroundColor Green

    [PSCustomObject]@{
        Day = $day
        Title = $title
        FolderId = $id
        Url = $url
        RemoteVisibleFiles = $remoteCount
        LocalTotalFiles = $counts.Total
        PDF = $counts.PDF
        MP3 = $counts.MP3
        Audio = $counts.Audio
        Video = $counts.Video
        Doc = $counts.Doc
        PPT = $counts.PPT
        Sheet = $counts.Sheet
        Other = $counts.Other
        OutDir = $outDir
        LogFile = $logFile
    }
}

$summary | Export-Csv $SummaryPath -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "DONE" -ForegroundColor Green
Write-Host "Summary: $SummaryPath"
Write-Host "Raw: $OutRoot"
