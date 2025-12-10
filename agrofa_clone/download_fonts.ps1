$baseUrl = "https://bracketweb.com/Agricu-html/"
$baseDir = "C:\Users\lenovo2\.gemini\antigravity\scratch\Agricu_clone"

$assets = @(
    "assets/vendors/Agricu-icons/fonts/icomoon.eot",
    "assets/vendors/Agricu-icons/fonts/icomoon.ttf",
    "assets/vendors/Agricu-icons/fonts/icomoon.woff",
    "assets/vendors/Agricu-icons/fonts/icomoon.svg",
    
    "assets/vendors/fontawesome/webfonts/fa-brands-400.eot",
    "assets/vendors/fontawesome/webfonts/fa-brands-400.woff2",
    "assets/vendors/fontawesome/webfonts/fa-brands-400.woff",
    "assets/vendors/fontawesome/webfonts/fa-brands-400.ttf",
    "assets/vendors/fontawesome/webfonts/fa-brands-400.svg",
    
    "assets/vendors/fontawesome/webfonts/fa-regular-400.eot",
    "assets/vendors/fontawesome/webfonts/fa-regular-400.woff2",
    "assets/vendors/fontawesome/webfonts/fa-regular-400.woff",
    "assets/vendors/fontawesome/webfonts/fa-regular-400.ttf",
    "assets/vendors/fontawesome/webfonts/fa-regular-400.svg",
    
    "assets/vendors/fontawesome/webfonts/fa-solid-900.eot",
    "assets/vendors/fontawesome/webfonts/fa-solid-900.woff2",
    "assets/vendors/fontawesome/webfonts/fa-solid-900.woff",
    "assets/vendors/fontawesome/webfonts/fa-solid-900.ttf",
    "assets/vendors/fontawesome/webfonts/fa-solid-900.svg"
)

foreach ($asset in $assets) {
    # Strip query strings if present in the url construction (not here, but good practice)
    $url = $baseUrl + $asset
    $output = Join-Path $baseDir $asset
    $dir = Split-Path $output
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    Write-Host "Downloading $asset..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
    }
    catch {
        Write-Host "Failed to download $asset : $_"
    }
}
