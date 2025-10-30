# PowerShell script to rebrand all Next Concept references to PASADA

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting PASADA Rebranding Process" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Define the base directory
$baseDir = "d:/Projects/Pasada/CRM/Refrence"

# Find all HTML files
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse

Write-Host "`nFound $($htmlFiles.Count) HTML files to process" -ForegroundColor Yellow

$totalChanges = 0
$filesModified = 0

foreach ($file in $htmlFiles) {
    Write-Host "`nProcessing: $($file.Name)" -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileChanges = 0
    
    # Brand Name Replacements (order matters - most specific first)
    $replacements = @(
        @{Old = 'Next Concept Design'; New = 'PASADA Interior Design'}
        @{Old = 'nextconcept.design'; New = 'pasada.design'}
        @{Old = 'Next Concept'; New = 'PASADA'}
        @{Old = 'NextConcept'; New = 'PASADA'}
        @{Old = 'Next concept'; New = 'PASADA'}
        @{Old = 'next concept'; New = 'PASADA'}
        @{Old = 'NEXT CONCEPT'; New = 'PASADA'}
    )
    
    foreach ($pair in $replacements) {
        $oldCount = ([regex]::Matches($content, [regex]::Escape($pair.Old))).Count
        if ($oldCount -gt 0) {
            $content = $content -replace [regex]::Escape($pair.Old), $pair.New
            $fileChanges += $oldCount
            Write-Host "  - Replaced '$($pair.Old)' with '$($pair.New)' ($oldCount occurrences)" -ForegroundColor Gray
        }
    }
    
    # Update meta descriptions and content
    $content = $content -replace 'Interior Design Agency', 'Interior Design'
    
    # Update domain references (but keep file paths intact)
    $content = $content -replace 'data-wf-domain="nextconcept.design"', 'data-wf-domain="pasada.design"'
    
    # Save the file if changes were made
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalChanges += $fileChanges
        $filesModified++
        Write-Host "  ✓ Modified with $fileChanges changes" -ForegroundColor Green
    } else {
        Write-Host "  - No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Rebranding Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files modified: $filesModified" -ForegroundColor Green
Write-Host "Total replacements: $totalChanges" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Clear your browser cache" -ForegroundColor White
Write-Host "2. Refresh the pages to see PASADA branding" -ForegroundColor White
Write-Host "3. Check navigation menu" -ForegroundColor White

