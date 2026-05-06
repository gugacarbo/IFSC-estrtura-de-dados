# Download checkstyle JAR if not present
$version = "13.4.2"
$jarName = "checkstyle-$version-all.jar"
$jarPath = "$PSScriptRoot\checkstyle.jar"
$url = "https://github.com/checkstyle/checkstyle/releases/download/checkstyle-$version/$jarName"

if (-not (Test-Path $jarPath)) {
    Write-Host "Downloading checkstyle $version..."
    Invoke-WebRequest -Uri $url -OutFile $jarPath
    Write-Host "Downloaded: $jarPath"
} else {
    Write-Host "checkstyle JAR already exists."
}
