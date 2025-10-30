# PowerShell script to fix all navigation links in reference pages

Write-Host "Starting navigation fix for all reference pages..." -ForegroundColor Cyan

# Define the base directory
$baseDir = "d:/Projects/Pasada/CRM/Refrence"

# Define all HTML files that need to be fixed
$htmlFiles = @(
    "$baseDir/Home page/nextconcept.design/en/homepage.html",
    "$baseDir/about/nextconcept.design/en/about.html",
    "$baseDir/contact-us/nextconcept.design/en/contant-us.html",
    "$baseDir/projects/nextconcept.design/en/projects.html",
    "$baseDir/worksclassic-white-kitchen/nextconcept.design/works/classic-white-kitchen.html",
    "$baseDir/workselegant-cashmere-kitchen/nextconcept.design/works/elegant-cashmere-kitchen.html",
    "$baseDir/worksminimalist-kitchen-2/nextconcept.design/works/minimalist-kitchen-2.html",
    "$baseDir/worksminimalist-kitchen-3/nextconcept.design/works/minimalist-kitchen-3.html",
    "$baseDir/worksminimalist-kitchen1/nextconcept.design/works/minimalist-kitchen.html",
    "$baseDir/worksmodern-kitchen/nextconcept.design/works/modern-kitchen.html"
)

# Function to get relative path based on file location
function Get-RelativePath {
    param (
        [string]$fromFile,
        [string]$targetPage
    )
    
    # Determine depth from the file location
    if ($fromFile -match "works/") {
        # Work pages are deeper (works/*/nextconcept.design/works/)
        $prefix = "../../../"
    } else {
        # Main pages (*/nextconcept.design/en/)
        $prefix = "../../../"
    }
    
    # Map target pages to their actual file paths
    switch ($targetPage) {
        "/en/homepage" { return "${prefix}Home page/nextconcept.design/en/homepage.html" }
        "href=`"/en/homepage`"" { return "href=`"${prefix}Home page/nextconcept.design/en/homepage.html`"" }
        "/en/about" { return "${prefix}about/nextconcept.design/en/about.html" }
        "href=`"/en/about`"" { return "href=`"${prefix}about/nextconcept.design/en/about.html`"" }
        "/en/projects" { return "${prefix}projects/nextconcept.design/en/projects.html" }
        "href=`"/en/projects`"" { return "href=`"${prefix}projects/nextconcept.design/en/projects.html`"" }
        "/en/contant-us" { return "${prefix}contact-us/nextconcept.design/en/contant-us.html" }
        "href=`"/en/contant-us`"" { return "href=`"${prefix}contact-us/nextconcept.design/en/contant-us.html`"" }
        "/works/classic-white-kitchen" { return "${prefix}worksclassic-white-kitchen/nextconcept.design/works/classic-white-kitchen.html" }
        "/works/modern-kitchen" { return "${prefix}worksmodern-kitchen/nextconcept.design/works/modern-kitchen.html" }
        "/works/elegant-cashmere-kitchen" { return "${prefix}workselegant-cashmere-kitchen/nextconcept.design/works/elegant-cashmere-kitchen.html" }
        "/works/minimalist-kitchen" { return "${prefix}worksminimalist-kitchen1/nextconcept.design/works/minimalist-kitchen.html" }
        "/works/minimalist-kitchen-2" { return "${prefix}worksminimalist-kitchen-2/nextconcept.design/works/minimalist-kitchen-2.html" }
        "/works/minimalist-kitchen-3" { return "${prefix}worksminimalist-kitchen-3/nextconcept.design/works/minimalist-kitchen-3.html" }
        default { return $targetPage }
    }
}

$totalChanges = 0

# Process each HTML file
foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "`nProcessing: $file" -ForegroundColor Yellow
        
        # Read the file content
        $content = Get-Content $file -Raw -Encoding UTF8
        $originalContent = $content
        
        # Fix navigation links - Main pages
        $content = $content -replace 'href="/en/homepage"', 'href="../../../Home page/nextconcept.design/en/homepage.html"'
        $content = $content -replace 'href="/en/about"', 'href="../../../about/nextconcept.design/en/about.html"'
        $content = $content -replace 'href="/en/projects"', 'href="../../../projects/nextconcept.design/en/projects.html"'
        $content = $content -replace 'href="/en/contant-us"', 'href="../../../contact-us/nextconcept.design/en/contant-us.html"'
        
        # Fix work links
        $content = $content -replace 'href="/works/classic-white-kitchen"', 'href="../../../worksclassic-white-kitchen/nextconcept.design/works/classic-white-kitchen.html"'
        $content = $content -replace 'href="/works/modern-kitchen"', 'href="../../../worksmodern-kitchen/nextconcept.design/works/modern-kitchen.html"'
        $content = $content -replace 'href="/works/elegant-cashmere-kitchen"', 'href="../../../workselegant-cashmere-kitchen/nextconcept.design/works/elegant-cashmere-kitchen.html"'
        $content = $content -replace 'href="/works/minimalist-kitchen"', 'href="../../../worksminimalist-kitchen1/nextconcept.design/works/minimalist-kitchen.html"'
        $content = $content -replace 'href="/works/minimalist-kitchen-2"', 'href="../../../worksminimalist-kitchen-2/nextconcept.design/works/minimalist-kitchen-2.html"'
        $content = $content -replace 'href="/works/minimalist-kitchen-3"', 'href="../../../worksminimalist-kitchen-3/nextconcept.design/works/minimalist-kitchen-3.html"'
        
        # Fix language switcher links
        $content = $content -replace 'href="/"', 'href="../../../Home page/nextconcept.design/en/homepage.html"'
        
        # Save the file if changes were made
        if ($content -ne $originalContent) {
            Set-Content $file -Value $content -Encoding UTF8 -NoNewline
            $changes = ([regex]::Matches($originalContent, 'href="/')).Count
            $totalChanges += $changes
            Write-Host "  ✓ Fixed $changes navigation links" -ForegroundColor Green
        } else {
            Write-Host "  - No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Navigation fix complete!" -ForegroundColor Green
Write-Host "Total navigation links fixed: $totalChanges" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nYou can now access the pages at:" -ForegroundColor Yellow
Write-Host "  Home: http://localhost:3000/Home%20page/nextconcept.design/en/homepage.html" -ForegroundColor White
Write-Host "  About: http://localhost:3000/about/nextconcept.design/en/about.html" -ForegroundColor White
Write-Host "  Contact: http://localhost:3000/contact-us/nextconcept.design/en/contant-us.html" -ForegroundColor White
Write-Host "  Projects: http://localhost:3000/projects/nextconcept.design/en/projects.html" -ForegroundColor White
Write-Host "`nOr use the navigation menu: http://localhost:3000/navigate.html" -ForegroundColor Cyan

