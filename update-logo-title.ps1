# Update logo and title to "P A S A D A" with spaced letters

Write-Host "Updating Logo and Title to 'P A S A D A'..." -ForegroundColor Cyan

$baseDir = "d:/Projects/Pasada/CRM/Refrence"
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse

Write-Host "Found $($htmlFiles.Count) HTML files" -ForegroundColor Yellow

$filesModified = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Update title tags
    $content = $content -replace '<title>PASADA Interior Design', '<title>P A S A D A Interior Design'
    $content = $content -replace '<title>PASADA', '<title>P A S A D A'
    
    # Update meta tags
    $content = $content -replace 'content="PASADA Interior Design', 'content="P A S A D A Interior Design'
    $content = $content -replace 'property="og:title" content="PASADA', 'property="og:title" content="P A S A D A'
    $content = $content -replace 'property="twitter:title" content="PASADA', 'property="twitter:title" content="P A S A D A'
    
    # Update headings (h1, h2, etc.) that might contain PASADA
    $content = $content -replace '>PASADA Interior Design<', '>P A S A D A Interior Design<'
    $content = $content -replace '>PASADA<', '>P A S A D A<'
    
    # Update logo alt text
    $content = $content -replace 'alt="PASADA', 'alt="P A S A D A'
    
    # Update any standalone PASADA text in navigation or headers
    # Be careful not to replace it in URLs or file paths
    $content = $content -replace 'class="navbar1_logo">PASADA', 'class="navbar1_logo">P A S A D A'
    
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesModified++
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Logo/Title Update Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files modified: $filesModified" -ForegroundColor Green
Write-Host "New branding: 'P A S A D A'" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
