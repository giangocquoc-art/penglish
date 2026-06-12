param(
  [string]$CsvPath = "docs\seo-90-days\gsc\gsc_queries.csv"
)

if (!(Test-Path $CsvPath)) {
  Write-Host "Không thấy file $CsvPath"
  Write-Host "Hãy export GSC Queries CSV rồi đặt đúng đường dẫn."
  exit 1
}

$data = Import-Csv $CsvPath

$report = foreach ($row in $data) {
  $query = $row.Query
  $clicks = [double]($row.Clicks -replace "%","")
  $impressions = [double]($row.Impressions -replace "%","")
  $ctrRaw = ($row.CTR -replace "%","")
  $ctr = if ($ctrRaw -eq "") { 0 } else { [double]$ctrRaw }
  $pos = [double]$row.Position

  $action = if ($pos -le 3) {
    "Giữ top, cập nhật nhẹ, thêm internal link"
  } elseif ($pos -le 10) {
    "Tối ưu title/meta để tăng CTR, thêm FAQ chứa query"
  } elseif ($pos -le 20) {
    "Thêm content block 300-600 chữ, thêm internal link từ pillar"
  } elseif ($pos -le 50) {
    "Kiểm tra intent, cân nhắc tách trang hoặc đổi H2/H3"
  } else {
    "Theo dõi thêm, chưa ưu tiên"
  }

  if ($impressions -ge 100 -and $ctr -lt 2 -and $pos -le 20) {
    $action = $action + " | CTR thấp: ưu tiên viết lại title/meta"
  }

  [PSCustomObject]@{
    Query = $query
    Clicks = $clicks
    Impressions = $impressions
    CTR = $ctr
    Position = $pos
    Action = $action
  }
}

$report | Sort-Object Position, @{Expression="Impressions";Descending=$true} | Export-Csv "docs\seo-90-days\gsc\gsc_action_report.csv" -NoTypeInformation -Encoding UTF8
$report | Sort-Object Position | Format-Table -AutoSize
