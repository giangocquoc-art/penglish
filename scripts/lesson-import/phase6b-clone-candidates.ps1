$candidateRoot = "external-sources\candidates"
New-Item -ItemType Directory -Force -Path $candidateRoot | Out-Null

$repos = @(
  @{ name = "olp-en-cefrj"; url = "https://github.com/openlanguageprofiles/olp-en-cefrj.git" },
  @{ name = "awesome-english"; url = "https://github.com/yvoronoy/awesome-english.git" },
  @{ name = "resources-for-english"; url = "https://github.com/dnizfor/resources-for-english.git" },
  @{ name = "english-dictionary-open-source"; url = "https://github.com/CloudBytes-Academy/English-Dictionary-Open-Source.git" },
  @{ name = "english-learning-app"; url = "https://github.com/cdf144/english-learning-app.git" },
  @{ name = "english-pronunciation-app"; url = "https://github.com/furkanbingol/EnglishPronunciation-App.git" },
  @{ name = "english-now"; url = "https://github.com/chippeddog/english.now.git" },
  @{ name = "wordpecker-app"; url = "https://github.com/baturyilmaz/wordpecker-app.git" }
)

foreach ($r in $repos) {
  $target = Join-Path $candidateRoot $r.name
  if (Test-Path $target) {
    Write-Host "Updating $($r.name)..." -ForegroundColor Cyan
    git -C $target pull --ff-only
  } else {
    Write-Host "Cloning $($r.name)..." -ForegroundColor Cyan
    git clone --depth 1 $r.url $target
  }
}
