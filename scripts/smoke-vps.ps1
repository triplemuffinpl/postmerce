param(
  [string]$Url = "https://postmerce-91-99-63-80.sslip.io",
  [string]$UserName = "",
  [string]$Password = ""
)

$ErrorActionPreference = "Stop"

$headers = @{}
if ($UserName -and $Password) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes("${UserName}:${Password}")
  $headers["Authorization"] = "Basic " + [System.Convert]::ToBase64String($bytes)
}

$health = Invoke-WebRequest -Uri "$Url/health" -Headers $headers -UseBasicParsing
$homeResponse = Invoke-WebRequest -Uri "$Url/" -Headers $headers -UseBasicParsing
$media = Invoke-WebRequest -Uri "$Url/media" -Headers $headers -UseBasicParsing
$posts = Invoke-WebRequest -Uri "$Url/posts" -Headers $headers -UseBasicParsing
$jobs = Invoke-WebRequest -Uri "$Url/jobs" -Headers $headers -UseBasicParsing

[pscustomobject]@{
  Health = $health.StatusCode
  Home = $homeResponse.StatusCode
  Media = $media.StatusCode
  Posts = $posts.StatusCode
  Jobs = $jobs.StatusCode
  HasPostmerce = $homeResponse.Content.Contains("Postmerce")
}
