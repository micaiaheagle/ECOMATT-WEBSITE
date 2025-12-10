$baseUrl = "https://bracketweb.com/Agricu-html/"
$baseDir = "C:\Users\lenovo2\.gemini\antigravity\scratch\Agricu_clone"

$assets = @(
    "assets/vendors/bootstrap/css/bootstrap.min.css",
    "assets/vendors/bootstrap-select/bootstrap-select.min.css",
    "assets/vendors/animate/animate.min.css",
    "assets/vendors/fontawesome/css/all.min.css",
    "assets/vendors/jquery-ui/jquery-ui.css",
    "assets/vendors/jarallax/jarallax.css",
    "assets/vendors/jquery-magnific-popup/jquery.magnific-popup.css",
    "assets/vendors/nouislider/nouislider.min.css",
    "assets/vendors/nouislider/nouislider.pips.css",
    "assets/vendors/tiny-slider/tiny-slider.css",
    "assets/vendors/Agricu-icons/style.css",
    "assets/vendors/owl-carousel/css/owl.carousel.min.css",
    "assets/vendors/owl-carousel/css/owl.theme.default.min.css",
    "assets/css/Agricu.css",
    "assets/vendors/jquery/jquery-3.7.0.min.js",
    "assets/vendors/bootstrap/js/bootstrap.bundle.min.js",
    "assets/vendors/bootstrap-select/bootstrap-select.min.js",
    "assets/vendors/jarallax/jarallax.min.js",
    "assets/vendors/jquery-ui/jquery-ui.js",
    "assets/vendors/jquery-ajaxchimp/jquery.ajaxchimp.min.js",
    "assets/vendors/jquery-appear/jquery.appear.min.js",
    "assets/vendors/jquery-circle-progress/jquery.circle-progress.min.js",
    "assets/vendors/jquery-magnific-popup/jquery.magnific-popup.min.js",
    "assets/vendors/jquery-validate/jquery.validate.min.js",
    "assets/vendors/nouislider/nouislider.min.js",
    "assets/vendors/tiny-slider/tiny-slider.js",
    "assets/vendors/wnumb/wNumb.min.js",
    "assets/vendors/owl-carousel/js/owl.carousel.min.js",
    "assets/vendors/wow/wow.js",
    "assets/vendors/imagesloaded/imagesloaded.min.js",
    "assets/vendors/isotope/isotope.js",
    "assets/vendors/countdown/countdown.min.js",
    "assets/vendors/jquery-circleType/jquery.circleType.js",
    "assets/vendors/jquery-lettering/jquery.lettering.min.js",
    "assets/js/Agricu.js",
    "assets/images/favicons/apple-touch-icon.png",
    "assets/images/favicons/favicon-32x32.png",
    "assets/images/favicons/favicon-16x16.png",
    "assets/images/loader.png",
    "assets/images/logo-light.png",
    "assets/images/hero-images/hero-img1-1.jpg",
    "assets/images/hero-images/hero-img1-2.jpg",
    "assets/images/hero-images/hero-img1-3.jpg",
    "assets/images/shapes/hero-tree-icon1-1.png",
    "assets/images/shapes/eco-organic-shape1-1.png",
    "assets/images/shapes/eco-organic-log1-1.png"
)

foreach ($asset in $assets) {
    $url = $baseUrl + $asset
    $output = Join-Path $baseDir $asset
    $dir = Split-Path $output
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    Write-Host "Downloading $asset..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
    } catch {
        Write-Host "Failed to download $asset : $_"
    }
}
