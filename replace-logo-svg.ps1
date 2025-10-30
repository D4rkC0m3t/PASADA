# Replace all Next Concept logo SVG files with PASADA logo

Write-Host "Replacing logo SVG files with PASADA branding..." -ForegroundColor Cyan

$baseDir = "d:/Projects/Pasada/CRM/Refrence"
$newLogoPath = "$baseDir/pasada-logo.svg"

# Find all Vector.svg files (the logo files)
$logoFiles = Get-ChildItem -Path $baseDir -Filter "*Vector.svg" -Recurse

Write-Host "Found $($logoFiles.Count) logo SVG files" -ForegroundColor Yellow

$filesReplaced = 0

foreach ($file in $logoFiles) {
    try {
        # Copy the new logo to replace the old one
        Copy-Item -Path $newLogoPath -Destination $file.FullName -Force
        $filesReplaced++
        Write-Host "Replaced: $($file.FullName)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error replacing: $($file.FullName)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Logo SVG Replacement Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files replaced: $filesReplaced" -ForegroundColor Green
Write-Host "New logo displays: 'P A S A D A'" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
