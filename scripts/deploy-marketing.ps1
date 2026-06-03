param(
  [string]$HostName = "100.109.177.115",
  [string]$User = "ops",
  [string]$KeyPath = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$sshArgs = @("-o", "StrictHostKeyChecking=no")
if ($KeyPath) {
  $sshArgs = @("-i", $KeyPath) + $sshArgs
}

Write-Host "Building marketing website..."
Push-Location $repoRoot
try {
  & npm run build -w @postmerce/marketing
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to build @postmerce/marketing"
  }
} finally {
  Pop-Location
}

Write-Host "Packaging build output..."
$distDir = Join-Path $repoRoot "apps\marketing\dist"
$archiveName = "postmerce-marketing-$([Guid]::NewGuid().ToString('N')).tar.gz"
$archive = Join-Path ([System.IO.Path]::GetTempPath()) $archiveName
$remoteArchive = "/tmp/$archiveName"
$remoteScriptName = "postmerce-marketing-deploy-$([Guid]::NewGuid().ToString('N')).sh"
$remoteScriptPath = Join-Path ([System.IO.Path]::GetTempPath()) $remoteScriptName
$remoteScriptRemotePath = "/tmp/$remoteScriptName"

try {
  if (Test-Path $archive) {
    Remove-Item -LiteralPath $archive -Force
  }

  $tarProcess = Start-Process tar -ArgumentList "-czf", $archive, "-C", $distDir, "." -NoNewWindow -Wait -PassThru
  if ($tarProcess.ExitCode -ne 0 -or -not (Test-Path $archive)) {
    throw "Failed to package marketing build output"
  }

  Write-Host "Uploading package to server..."
  scp @sshArgs $archive "${User}@${HostName}:$remoteArchive"
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to upload marketing package"
  }

  Write-Host "Extracting release and updating symlink on VPS..."
  $remoteScript = @'
set -euo pipefail

RELEASE_NAME=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="/srv/apps/postmerce-marketing/releases/$RELEASE_NAME"
ARCHIVE="__REMOTE_ARCHIVE__"
trap 'rm -f "$ARCHIVE"' EXIT

echo "Creating release directory: $RELEASE_DIR"
sudo mkdir -p "$RELEASE_DIR"

echo "Extracting archive..."
sudo tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"

echo "Setting permissions..."
sudo chown -R ops:ops "$RELEASE_DIR"

echo "Updating current symlink..."
sudo ln -sfnT "$RELEASE_DIR" /srv/apps/postmerce-marketing/current

echo "Marketing site successfully deployed to $RELEASE_DIR"
'@
  $remoteScript = $remoteScript.Replace("__REMOTE_ARCHIVE__", $remoteArchive)

  [System.IO.File]::WriteAllText(
    $remoteScriptPath,
    $remoteScript,
    [System.Text.UTF8Encoding]::new($false)
  )

  scp @sshArgs $remoteScriptPath "${User}@${HostName}:$remoteScriptRemotePath"
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to upload marketing deploy script"
  }

  $remoteDeployCommand = "bash $remoteScriptRemotePath; status=`$?; rm -f $remoteScriptRemotePath; exit `$status"
  ssh @sshArgs "${User}@${HostName}" $remoteDeployCommand
  if ($LASTEXITCODE -ne 0) {
    throw "Marketing deploy failed on the VPS"
  }
} finally {
  Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $remoteScriptPath -Force -ErrorAction SilentlyContinue
}

Write-Host "Deployment completed successfully!"
