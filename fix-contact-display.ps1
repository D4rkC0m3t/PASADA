# Fix contact display text across all reference pages

Write-Host "Fixing Contact Display Text..." -ForegroundColor Cyan

$baseDir = "d:/Projects/Pasada/CRM/Refrence"
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse

$filesModified = 0
$newEmail = "pasada.groups@gmail.com"
$newPhone = "99456 68442"

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Fix email display text variations
    $content = $content -replace 'pasada\.designn@gmail\.com', $newEmail
    $content = $content -replace 'pasada\.design@gmail\.com', $newEmail
    $content = $content -replace '>contact@[^<]+<', ">$newEmail<"
    $content = $content -replace '>info@[^<]+<', ">$newEmail<"
    $content = $content -replace '>hello@[^<]+<', ">$newEmail<"
    $content = $content -replace '>office@[^<]+<', ">$newEmail<"
    
    # Fix phone display text
    $content = $content -replace '>\+40\s*7\d{2}\s*\d{3}\s*\d{3}<', ">$newPhone<"
    $content = $content -replace '>07\d{2}\s*\d{3}\s*\d{3}<', ">$newPhone<"
    
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesModified++
        Write-Host "Fixed display text in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nFixed display text in $filesModified files" -ForegroundColor Green
