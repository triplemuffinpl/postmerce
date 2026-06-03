param(
  [string]$HostName = "100.109.177.115",
  [string]$User = "ops",
  [string]$KeyPath = "",
  [string]$AppDir = "/srv/apps/postmerce",
  [string]$DataDir = "/srv/data/postmerce"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$commit = (git -C $repoRoot rev-parse HEAD).Trim()
$archive = Join-Path ([System.IO.Path]::GetTempPath()) "postmerce-$commit.tar.gz"
$remoteArchive = "/tmp/postmerce-$commit.tar.gz"
$sshArgs = @("-o", "StrictHostKeyChecking=no")
if ($KeyPath) {
  $sshArgs = @("-i", $KeyPath) + $sshArgs
}

$dirty = git -C $repoRoot status --porcelain
if ($dirty) {
  throw "Working tree has uncommitted changes. Commit before deploy because this script deploys HEAD."
}

git -C $repoRoot archive --format=tar.gz --output=$archive HEAD

scp @sshArgs $archive "${User}@${HostName}:$remoteArchive"

$remoteScript = @'
set -euo pipefail
APP_DIR="__APP_DIR__"
DATA_DIR="__DATA_DIR__"
ARCHIVE="__REMOTE_ARCHIVE__"

mkdir -p "$APP_DIR" "$DATA_DIR/storage" "$DATA_DIR/postgres"

if [ -d "$APP_DIR" ]; then
  find "$APP_DIR" -mindepth 1 ! -name '.env.server' -exec rm -rf {} +
fi

tar -xzf "$ARCHIVE" -C "$APP_DIR"
rm -f "$ARCHIVE"
cd "$APP_DIR"

if [ ! -f .env.server ]; then
  cat > .env.server <<EOF
APP_ENV=staging
APP_URL=https://staging.postmerce.pl
APP_TIMEZONE=Europe/Warsaw
APP_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

POSTGRES_DB=postmerce
POSTGRES_USER=postmerce
POSTGRES_PASSWORD=$(openssl rand -hex 24)

POSTMERCE_BIND_PORT=4501
POSTMERCE_STORAGE_DIR=/srv/data/postmerce/storage
POSTMERCE_POSTGRES_DATA_DIR=/srv/data/postmerce/postgres

MAX_UPLOAD_MB=500
MAX_DURATION_SECONDS=43200
MAX_VIDEO_WIDTH=3840
MAX_VIDEO_HEIGHT=3840
CLEANUP_AFTER_DAYS=30

DRY_RUN=true

ENABLE_YOUTUBE=true
ENABLE_LINKEDIN=true
ENABLE_INSTAGRAM=false
ENABLE_FACEBOOK=false
ENABLE_TIKTOK=false

YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=https://staging.postmerce.pl/oauth/youtube/callback
YOUTUBE_UPLOAD_CATEGORY_ID=22
EOF
  chmod 600 .env.server
fi

docker compose --env-file .env.server -f docker-compose.staging.yml build app worker
docker compose --env-file .env.server -f docker-compose.staging.yml up -d postgres
docker compose --env-file .env.server -f docker-compose.staging.yml run --rm -T app node apps/app/dist/db/migrate.js < /dev/null
docker compose --env-file .env.server -f docker-compose.staging.yml up -d --force-recreate app worker
docker compose --env-file .env.server -f docker-compose.staging.yml ps
'@

$remoteScript = $remoteScript.
  Replace("__APP_DIR__", $AppDir).
  Replace("__DATA_DIR__", $DataDir).
  Replace("__REMOTE_ARCHIVE__", $remoteArchive)
$remoteScript = $remoteScript.Replace("`r`n", "`n")

$remoteScriptPath = Join-Path ([System.IO.Path]::GetTempPath()) "postmerce-deploy-$commit.sh"
$remoteScriptRemotePath = "/tmp/postmerce-deploy-$commit.sh"
[System.IO.File]::WriteAllText(
  $remoteScriptPath,
  $remoteScript,
  [System.Text.UTF8Encoding]::new($false)
)

scp @sshArgs $remoteScriptPath "${User}@${HostName}:$remoteScriptRemotePath"

$remoteDeployCommand = "bash $remoteScriptRemotePath; status=`$?; rm -f $remoteScriptRemotePath; exit `$status"
ssh @sshArgs "${User}@${HostName}" $remoteDeployCommand

Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $remoteScriptPath -Force -ErrorAction SilentlyContinue
