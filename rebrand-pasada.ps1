# Rebrand Next Concept to PASADA

Write-Host "Starting PASADA Rebranding..." -ForegroundColor Cyan

$baseDir = "d:/Projects/Pasada/CRM/Refrence"
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse

Write-Host "Found $($htmlFiles.Count) HTML files" -ForegroundColor Yellow

$totalChanges = 0
$filesModified = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Replace brand names
    $content = $content -replace 'Next Concept Design', 'PASADA Interior Design'
    $content = $content -replace 'nextconcept\.design', 'pasada.design'
    $content = $content -replace 'Next Concept', 'PASADA'
    $content = $content -replace 'NextConcept', 'PASADA'
    $content = $content -replace 'Interior Design Agency', 'Interior Design'
    
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesModified++
        Write-Host "Modified: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nComplete! Modified $filesModified files" -ForegroundColor Green
