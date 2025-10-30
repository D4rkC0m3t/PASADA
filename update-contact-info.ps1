# Update contact information across all reference pages

Write-Host "Updating Contact Information..." -ForegroundColor Cyan

$baseDir = "d:/Projects/Pasada/CRM/Refrence"
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse

Write-Host "Found $($htmlFiles.Count) HTML files" -ForegroundColor Yellow

$totalChanges = 0
$filesModified = 0

# New contact information
$newEmail = "pasada.groups@gmail.com"
$newPhone = "99456 68442"
$newPhoneFormatted = "+40 99456 68442"  # Adding country code if needed

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    $fileChanges = 0
    
    # Find and replace email addresses
    # Common email patterns to replace
    $emailPatterns = @(
        'contact@nextconcept\.design',
        'info@nextconcept\.design',
        'hello@nextconcept\.design',
        'office@nextconcept\.design'
    )
    
    foreach ($pattern in $emailPatterns) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $newEmail
            $fileChanges++
        }
    }
    
    # Find and replace phone numbers
    # Common phone number patterns
    $phonePatterns = @(
        '\+40\s*7\d{2}\s*\d{3}\s*\d{3}',
        '\+40\s*\d{3}\s*\d{3}\s*\d{3}',
        '07\d{2}\s*\d{3}\s*\d{3}',
        '\d{3}\s*\d{3}\s*\d{3}'
    )
    
    foreach ($pattern in $phonePatterns) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $newPhone
            $fileChanges++
        }
    }
    
    # Also replace href="tel:" links
    $content = $content -replace 'href="tel:[^"]*"', "href=`"tel:$newPhone`""
    
    # Replace mailto: links
    $content = $content -replace 'href="mailto:[^"]*"', "href=`"mailto:$newEmail`""
    
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesModified++
        Write-Host "Modified: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Contact Information Update Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files modified: $filesModified" -ForegroundColor Green
Write-Host "`nNew Contact Details:" -ForegroundColor Yellow
Write-Host "  Email: $newEmail" -ForegroundColor White
Write-Host "  Phone: $newPhone" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
