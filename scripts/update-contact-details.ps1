# PowerShell script to update contact details across all HTML files
# Updates: Phone number, Address, and Website credit

$htmlFiles = Get-ChildItem -Path "d:/Projects/Pasada/CRM/Pasada/public/pasada.design" -Filter "*.html" -Recurse

Write-Host "Found $($htmlFiles.Count) HTML files to update" -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    Write-Host ""
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $changes = 0
    
    # Update phone number: 99456 68442 -> 7090004948
    if ($content -match '99456 68442') {
        $content = $content -replace '99456 68442', '7090004948'
        $content = $content -replace 'tel:99456 68442', 'tel:7090004948'
        Write-Host "  [OK] Updated phone number" -ForegroundColor Green
        $changes++
    }
    
    # Update website credit: Website By daniel @ Aspectify -> Crafted By Arjun@Neo @ Pasada
    if ($content -match 'Website By') {
        $oldPattern = 'Website By</span> <a href="https://danielvaszka.com/" target="_blank"><span class="text-span-28">daniel</span></a> <span class="text-span-29">@</span> <a href="https://aspectify.design/" target="_blank"><span class="text-span-28">Aspectify'
        $newPattern = 'Crafted By</span> <span class="text-span-28">Arjun@Neo</span> <span class="text-span-29">@</span> <span class="text-span-28">Pasada'
        
        if ($content -match [regex]::Escape($oldPattern)) {
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
            Write-Host "  [OK] Updated website credit" -ForegroundColor Green
            $changes++
        }
    }
    
    # Save file if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  [OK] Saved $changes change(s)" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] No changes needed" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Update complete!" -ForegroundColor Green
Write-Host "Updated contact details across all HTML files" -ForegroundColor Cyan
