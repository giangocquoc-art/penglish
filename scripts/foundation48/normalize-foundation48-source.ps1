$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH"
$RawRoot = Join-Path $ProjectRoot "_source\foundation48\raw-archive"
$OutRoot = Join-Path $ProjectRoot "_source\foundation48\raw-normalized"
$ReportRoot = Join-Path $ProjectRoot "_source\foundation48\reports"
$Report = Join-Path $ReportRoot "foundation48-normalize-report.csv"

New-Item -ItemType Directory -Force $OutRoot | Out-Null
New-Item -ItemType Directory -Force $ReportRoot | Out-Null

$days = @(
  @{Day=1; Title="Thể khẳng định và phủ định của động từ to be"; Slug="the-khang-dinh-va-phu-dinh-cua-dong-tu-to-be"},
  @{Day=2; Title="Thể nghi vấn của động từ to be"; Slug="the-nghi-van-cua-dong-tu-to-be"},
  @{Day=3; Title="Câu hỏi Who và That với động từ to be"; Slug="cau-hoi-who-va-that-voi-dong-tu-to-be"},
  @{Day=4; Title="Câu hỏi Where và When với động từ to be"; Slug="cau-hoi-where-va-when-voi-dong-tu-to-be"},
  @{Day=5; Title="Động từ thường ở hiện tại"; Slug="dong-tu-thuong-o-hien-tai"},
  @{Day=6; Title="Thể phủ định của động từ thường ở hiện tại"; Slug="the-phu-dinh-cua-dong-tu-thuong-o-hien-tai"},
  @{Day=7; Title="Thể nghi vấn của động từ thường ở hiện tại"; Slug="the-nghi-van-cua-dong-tu-thuong-o-hien-tai"},
  @{Day=8; Title="Thì hiện tại đơn"; Slug="thi-hien-tai-don"},
  @{Day=9; Title="Từ loại"; Slug="tu-loai"},
  @{Day=10; Title="Thì hiện tại tiếp diễn"; Slug="thi-hien-tai-tiep-dien"},
  @{Day=11; Title="Phân biệt thì hiện tại đơn và hiện tại tiếp diễn"; Slug="phan-biet-thi-hien-tai-don-va-hien-tai-tiep-dien"},
  @{Day=12; Title="Thì quá khứ đơn thể khẳng định"; Slug="thi-qua-khu-don-the-khang-dinh"},
  @{Day=13; Title="Thì quá khứ đơn thể phủ định và nghi vấn"; Slug="thi-qua-khu-don-the-phu-dinh-va-nghi-van"},
  @{Day=14; Title="Thì quá khứ tiếp diễn"; Slug="thi-qua-khu-tiep-dien"},
  @{Day=15; Title="Thì hiện tại hoàn thành"; Slug="thi-hien-tai-hoan-thanh"},
  @{Day=16; Title="Thì tương lai đơn"; Slug="thi-tuong-lai-don"},
  @{Day=17; Title="Thì tương lai hoàn thành"; Slug="thi-tuong-lai-hoan-thanh"},
  @{Day=18; Title="Học ngữ âm với giáo viên nước ngoài"; Slug="hoc-ngu-am-voi-giao-vien-nuoc-ngoai"},
  @{Day=19; Title="Tìm hiểu về trọng âm trong tiếng Anh"; Slug="tim-hieu-ve-trong-am-trong-tieng-anh"},
  @{Day=20; Title="Các câu hỏi với từ để hỏi khác trong tiếng Anh"; Slug="cac-cau-hoi-voi-tu-de-hoi-khac-trong-tieng-anh"},
  @{Day=21; Title="Luyện nghe số và tên"; Slug="luyen-nghe-so-va-ten"},
  @{Day=22; Title="Động từ khuyết thiếu"; Slug="dong-tu-khuyet-thieu"},
  @{Day=23; Title="Liên từ and, so, but, because"; Slug="lien-tu-and-so-but-because"},
  @{Day=24; Title="Liên từ chỉ thời gian"; Slug="lien-tu-chi-thoi-gian"},
  @{Day=25; Title="Liên từ chỉ sự đối lập"; Slug="lien-tu-chi-su-doi-lap"},
  @{Day=26; Title="Câu điều kiện loại 1"; Slug="cau-dieu-kien-loai-1"},
  @{Day=27; Title="Câu điều kiện loại 2"; Slug="cau-dieu-kien-loai-2"},
  @{Day=28; Title="Câu điều kiện loại 3"; Slug="cau-dieu-kien-loai-3"},
  @{Day=29; Title="Luyện nghe điền từ"; Slug="luyen-nghe-dien-tu"},
  @{Day=30; Title="Luyện nghe chép chính tả"; Slug="luyen-nghe-chep-chinh-ta"},
  @{Day=31; Title="Luyện nghe về giờ"; Slug="luyen-nghe-ve-gio"},
  @{Day=32; Title="Luyện nghe ngày tháng"; Slug="luyen-nghe-ngay-thang"},
  @{Day=33; Title="Luyện nghe địa điểm"; Slug="luyen-nghe-dia-diem"},
  @{Day=34; Title="Luyện nghe về tiền bạc"; Slug="luyen-nghe-ve-tien-bac"},
  @{Day=35; Title="Đại từ phản thân"; Slug="dai-tu-phan-than"},
  @{Day=36; Title="Sự hòa hợp về thì"; Slug="su-hoa-hop-ve-thi"},
  @{Day=37; Title="Tiếng Anh giao tiếp 1"; Slug="tieng-anh-giao-tiep-1"},
  @{Day=38; Title="Liên từ tương hỗ"; Slug="lien-tu-tuong-ho"},
  @{Day=39; Title="Luyện nghe về các quốc gia, châu lục"; Slug="luyen-nghe-ve-cac-quoc-gia-chau-luc"},
  @{Day=40; Title="Luyện nghe về sở thích"; Slug="luyen-nghe-ve-so-thich"},
  @{Day=41; Title="Luyện nghe về giao thông"; Slug="luyen-nghe-ve-giao-thong"},
  @{Day=42; Title="Luyện nghe về thể thao"; Slug="luyen-nghe-ve-the-thao"},
  @{Day=43; Title="Luyện nghe về nghề nghiệp"; Slug="luyen-nghe-ve-nghe-nghiep"},
  @{Day=44; Title="Luyện nghe về công nghệ"; Slug="luyen-nghe-ve-cong-nghe"},
  @{Day=45; Title="Tiếng Anh giao tiếp 2"; Slug="tieng-anh-giao-tiep-2"},
  @{Day=46; Title="Kĩ năng note-taking"; Slug="ki-nang-note-taking"},
  @{Day=47; Title="Kỹ năng paraphrasing"; Slug="ky-nang-paraphrasing"},
  @{Day=48; Title="Tự tin giới thiệu bản thân và thuyết trình bằng tiếng Anh"; Slug="tu-tin-gioi-thieu-ban-than-va-thuyet-trinh-bang-tieng-anh"}
)

$results = foreach ($d in $days) {
    $dayNum = $d.Day
    $src = Get-ChildItem $RawRoot -Directory -Recurse | Where-Object {
        $_.Name -match "^NGÀY\s+$dayNum$"
    } | Select-Object -First 1

    $dest = Join-Path $OutRoot ("day-{0:D2}-{1}" -f $dayNum, $d.Slug)

    if ($src) {
        New-Item -ItemType Directory -Force $dest | Out-Null
        robocopy $src.FullName $dest /E /R:3 /W:2 /NFL /NDL /NJH /NJS /NP | Out-Null
    }

    $files = @(Get-ChildItem $dest -Recurse -File -ErrorAction SilentlyContinue)
    $pdf = @($files | Where-Object { $_.Extension -ieq ".pdf" }).Count
    $mp3 = @($files | Where-Object { $_.Extension -ieq ".mp3" }).Count
    $mp4 = @($files | Where-Object { $_.Extension -ieq ".mp4" }).Count

    [PSCustomObject]@{
        Day = $dayNum
        Title = $d.Title
        SourceFound = [bool]$src
        SourcePath = if ($src) { $src.FullName } else { "" }
        DestPath = $dest
        TotalFiles = $files.Count
        PDF = $pdf
        MP3 = $mp3
        MP4 = $mp4
    }
}

$results | Export-Csv $Report -NoTypeInformation -Encoding UTF8

Write-Host "Normalize done."
Write-Host "Report: $Report"

$results | Format-Table Day,SourceFound,TotalFiles,PDF,MP3,MP4 -AutoSize
