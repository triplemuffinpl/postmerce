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
# Run local build
& npm run build -w @postmerce/marketing
if ($LASTEXITCODE -ne 0) {
  throw "Failed to build @postmerce/marketing"
}

Write-Host "Packaging build output..."
$distDir = Join-Path $repoRoot "apps\marketing\dist"
$archive = Join-Path ([System.IO.Path]::GetTempPath()) "marketing.tar.gz"
$remoteArchive = "/tmp/marketing.tar.gz"

if (Test-Path $archive) {
  Remove-Item -Path $archive -Force
}

# Run tar command. -C changes directory to $distDir and . packages the contents
Start-Process tar -ArgumentList "-czf", $archive, "-C", $distDir, "." -NoNewWindow -Wait

Write-Host "Uploading package to server..."
scp @sshArgs $archive "${User}@${HostName}:$remoteArchive"

Write-Host "Extracting release and updating symlink on VPS..."
$remoteScript = @'
set -euo pipefail

RELEASE_NAME=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="/srv/apps/postmerce-marketing/releases/$RELEASE_NAME"
ARCHIVE="/tmp/marketing.tar.gz"

echo "Creating release directory: $RELEASE_DIR"
sudo mkdir -p "$RELEASE_DIR"

echo "Extracting archive..."
sudo tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"

echo "Setting permissions..."
sudo chown -R ops:ops "$RELEASE_DIR"

echo "Updating current symlink..."
sudo ln -sfn "$RELEASE_DIR" /srv/apps/postmerce-marketing/current

echo "Cleaning up..."
rm -f "$ARCHIVE"

echo "Marketing site successfully deployed to $RELEASE_DIR"
'@

$remoteScriptPath = Join-Path ([System.IO.Path]::GetTempPath()) "marketing-deploy.sh"
$remoteScriptRemotePath = "/tmp/marketing-deploy.sh"
[System.IO.File]::WriteAllText(
  $remoteScriptPath,
  $remoteScript,
  [System.Text.UTF8Encoding]::new($false)
)

scp @sshArgs $remoteScriptPath "${User}@${HostName}:$remoteScriptRemotePath"

$remoteDeployCommand = "bash $remoteScriptRemotePath; status=`$?; rm -f $remoteScriptRemotePath; exit `$status"
ssh @sshArgs "${User}@${HostName}" $remoteDeployCommand

# Cleanup local temp files
Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $remoteScriptPath -Force -ErrorAction SilentlyContinue

Write-Host "Deployment completed successfully!"
