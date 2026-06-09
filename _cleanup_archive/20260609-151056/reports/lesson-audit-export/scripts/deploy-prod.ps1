[CmdletBinding()]
param(
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Resolve-Tool {
  param([string]$Name)

  $candidates = @($Name)
  $isWindowsHost = [System.Environment]::OSVersion.Platform -eq 'Win32NT'
  if ($isWindowsHost -or $env:OS -eq 'Windows_NT') {
    $candidates = @("$Name.cmd", "$Name.exe", $Name)
  }

  foreach ($candidate in $candidates) {
    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
  }

  return $null
}

function Require-Tool {
  param(
    [string]$Name,
    [string]$InstallHint
  )

  $path = Resolve-Tool $Name
  if ($path) {
    Write-Host "OK: $Name found" -ForegroundColor Green
    return $path
  }

  Write-Host "MISSING: $Name" -ForegroundColor Yellow
  if ($InstallHint) { Write-Host "Install with: $InstallHint" -ForegroundColor Yellow }

  if (-not $DryRun) {
    throw "Required command '$Name' was not found."
  }

  return $null
}

function Require-Env {
  param([string]$Name)

  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host "MISSING ENV: $Name" -ForegroundColor Yellow
    if (-not $DryRun) { throw "Required environment variable '$Name' is missing." }
    return $false
  }

  Write-Host "OK: $Name is set" -ForegroundColor Green
  return $true
}

function Invoke-Checked {
  param(
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$Description,
    [switch]$AllowFailure
  )

  $commandLine = "$FilePath $($Arguments -join ' ')"
  if ($DryRun) {
    Write-Host "DRY RUN: $Description" -ForegroundColor DarkCyan
    Write-Host "         $commandLine" -ForegroundColor DarkGray
    return
  }

  Write-Host $Description -ForegroundColor Cyan
  & $FilePath @Arguments
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) {
    if ($AllowFailure) {
      Write-Host "Non-fatal command failed ($exitCode): $Description" -ForegroundColor Yellow
      return
    }
    throw "Command failed ($exitCode): $commandLine"
  }
}

function Add-VercelEnvSafe {
  param(
    [string]$VercelCmd,
    [string]$Name
  )

  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host "Skipping Vercel env '$Name' because it is not set locally." -ForegroundColor Yellow
    return
  }

  if ($DryRun) {
    Write-Host "DRY RUN: would add/update Vercel production env '$Name' (value hidden)." -ForegroundColor DarkCyan
    return
  }

  Write-Host "Adding Vercel production env '$Name' if needed (value hidden)." -ForegroundColor Cyan
  $value | & $VercelCmd env add $Name production
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) {
    Write-Host "Could not add '$Name' automatically. It may already exist, or Vercel may require manual confirmation." -ForegroundColor Yellow
    Write-Host "Manual fallback: vercel env add $Name production" -ForegroundColor Yellow
  }
}

Write-Section "Checking required tools"
$nodeCmd = Require-Tool -Name 'node'
$npmCmd = Require-Tool -Name 'npm'
$npxCmd = Require-Tool -Name 'npx'
$vercelCmd = Require-Tool -Name 'vercel' -InstallHint 'npm i -g vercel'
$supabaseCmd = Require-Tool -Name 'supabase' -InstallHint 'npm i -g supabase'

Write-Section "Checking required environment variables"
[void](Require-Env -Name 'VITE_SUPABASE_URL')
[void](Require-Env -Name 'VITE_SUPABASE_ANON_KEY')
[void](Require-Env -Name 'SUPABASE_PROJECT_REF')

if ($DryRun) {
  Write-Host ""
  Write-Host "Dry-run mode is active: commands will be printed but not executed, and deployments will not run." -ForegroundColor Yellow
}

Write-Section "Installing dependencies"
Invoke-Checked -FilePath $npmCmd -Arguments @('ci') -Description 'Running npm ci'

Write-Section "Running TypeScript/build"
Invoke-Checked -FilePath $npmCmd -Arguments @('run', 'build') -Description 'Running npm run build'

$migrationPath = Join-Path (Get-Location) 'supabase/migrations'
if (Test-Path $migrationPath) {
  Write-Section "Pushing Supabase migrations"
  Invoke-Checked -FilePath $supabaseCmd -Arguments @('link', '--project-ref', $env:SUPABASE_PROJECT_REF) -Description 'Linking Supabase project'
  Invoke-Checked -FilePath $supabaseCmd -Arguments @('db', 'push') -Description 'Pushing Supabase migrations'
} else {
  Write-Section "Supabase migrations"
  Write-Host "No supabase/migrations folder found. Skipping supabase db push." -ForegroundColor Yellow
}

Write-Section "Setting Vercel production environment variables"
if ($vercelCmd) {
  Add-VercelEnvSafe -VercelCmd $vercelCmd -Name 'VITE_SUPABASE_URL'
  Add-VercelEnvSafe -VercelCmd $vercelCmd -Name 'VITE_SUPABASE_ANON_KEY'
} else {
  Write-Host "Vercel CLI missing. Manual fallback after installing: vercel env add VITE_SUPABASE_URL production" -ForegroundColor Yellow
  Write-Host "Vercel CLI missing. Manual fallback after installing: vercel env add VITE_SUPABASE_ANON_KEY production" -ForegroundColor Yellow
}

Write-Section "Deploying frontend to Vercel production"
Invoke-Checked -FilePath $vercelCmd -Arguments @('--prod') -Description 'Running vercel --prod'

Write-Host ""
Write-Host "Production deployment finished." -ForegroundColor Green
Write-Host "Remember to test /home, /learning-path, /shadowing, /practice." -ForegroundColor Green
Write-Host "If Vercel printed a production URL above, use that as the final production URL." -ForegroundColor Green
