
$baseUrl = "https://themecraze.net/html/agricu/"
$targetDir = Get-Location

$cssFiles = @(
    "assets/css/bootstrap.css",
    "assets/css/style.css",
    "assets/css/responsive.css",
    "assets/css/meanmenu.min.css",
    "assets/css/animate.min.css",
    "assets/css/flaticon.css",
    "assets/css/custom-animate.css",
    "assets/css/font-awesome-all.css"
)

$imageFiles = @(
    "assets/images/resource/post-thumb-1.jpg",
    "assets/images/resource/post-thumb-2.jpg",
    "assets/images/resource/post-thumb-3.jpg",
    "assets/images/resource/about-1.jpg",
    "assets/images/background/page-title.jpg",
    "assets/images/gallery/1.jpg",
    "assets/images/gallery/2.jpg",
    "assets/images/gallery/3.jpg",
    "assets/images/gallery/4.jpg",
    "assets/images/resource/products/prod-thumb-1.png",
    "assets/images/resource/products/prod-thumb-2.png",
    "assets/images/resource/products/prod-thumb-3.png",
    "assets/images/resource/products/1.png",
    "assets/images/resource/products/2.png",
    "assets/images/resource/products/3.png",
    "assets/images/resource/products/4.png",
    "assets/images/resource/products/5.png",
    "assets/images/resource/products/6.png",
    "assets/images/icons/right-arrow.svg",
    "assets/images/icons/shopping-basket.svg",
    "assets/images/clients/1.png",
    "assets/images/clients/2.png",
    "assets/images/clients/3.png",
    "assets/images/clients/4.png",
    "assets/images/resource/news-1.jpg",
    "assets/images/resource/news-2.jpg",
    "assets/images/resource/news-3.jpg",
    "assets/images/logo.png",
    "assets/images/footer-logo.png",
    "assets/images/favicon.png",
    "assets/images/background/footer-pattern-1.png",
    "assets/images/mobile-logo.png"
)

function Download-File {
    param ($relPath)
    $url = $baseUrl + $relPath
    $localPath = Join-Path $targetDir $relPath.Replace("/", "\")
    $dir = Split-Path -Parent $localPath
    
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    
    Write-Host "Downloading $relPath..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $localPath
        Write-Host "Success."
    } catch {
        Write-Host "Failed: $_"
    }
}

foreach ($css in $cssFiles) {
    Download-File $css
}

foreach ($img in $imageFiles) {
    Download-File $img
}

$htmlFiles = @("projects.html", "shop.html", "blog.html")
foreach ($htmlFile in $htmlFiles) {
    $filePath = Join-Path $targetDir $htmlFile
    if (Test-Path $filePath) {
        Write-Host "Updating $htmlFile..."
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        $content = $content.Replace('href="css/', 'href="assets/css/')
        $content = $content.Replace('src="images/', 'src="assets/images/')
        $content = $content.Replace('href="images/', 'href="assets/images/')
        
        $content | Set-Content $filePath -Encoding UTF8
    }
}

$stylePath = Join-Path $targetDir "assets\css\style.css"
if (Test-Path $stylePath) {
    Write-Host "Updating Branding in style.css..."
    $override = "
    :root {
        --main-color: #569D03 !important;
        --theme-color: #569D03 !important;
        --primary-color: #569D03 !important;
    }
    .theme-btn, .btn-style-one, .btn-style-two, .btn-style-three { background-color: #569D03 !important; }
    a { color: #569D03; }
    .main-menu .navigation > li.current > a, .main-menu .navigation > li:hover > a { color: #569D03 !important; }
    "
    Add-Content $stylePath $override -Encoding UTF8
}

Write-Host "Asset Reconstruction Complete."
