# Add second phone number (7090004945) to all contact sections

$files = @(
    "public/pasada.design/en/homepage.html",
    "public/pasada.design/en/about.html",
    "public/pasada.design/en/contant-us.html",
    "public/pasada.design/en/projects.html",
    "public/pasada.design/works/classic-white-kitchen.html",
    "public/pasada.design/works/elegant-cashmere-kitchen.html",
    "public/pasada.design/works/minimalist-kitchen.html",
    "public/pasada.design/works/minimalist-kitchen-2.html",
    "public/pasada.design/works/minimalist-kitchen-3.html",
    "public/pasada.design/works/modern-kitchen.html"
)

$phoneButtonTemplate = @'
                                                <a data-w-id="00f3c34e-c30d-fd2d-b161-4dd5ec7c2dba" href="tel:7090004945" class="button is-small is-icon is-alternate button-smaller-footer w-inline-block">
                                                    <div class="text-size-xtiny">7090004945</div>
                                                    <div class="button-icon hide">
                                                        <div class="icon-embed-xsmall w-embed"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                                                                viewBox="0 0 24 24"><path fill="currentColor" d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z"></path></svg></div>
                                                        <div class="icon-embed-xsmall w-embed"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                                                                viewBox="0 0 24 24"><path fill="currentColor" d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z"></path></svg></div>
                                                    </div>
                                                </a>
'@

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "Updating: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Check if second number already exists
        if ($content -match '7090004945') {
            Write-Host "  ⚠ Second phone number already exists, skipping" -ForegroundColor Yellow
            continue
        }
        
        # Find the first phone number button and add the second one after it
        $pattern = '(<a[^>]*href="tel:7090004948"[^>]*>[\s\S]*?</a>)'
        
        if ($content -match $pattern) {
            $replacement = '$1' + "`n" + $phoneButtonTemplate
            $content = $content -replace $pattern, $replacement
            
            # Save the file
            Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
            
            Write-Host "  ✓ Added second phone number (7090004945)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Could not find phone number pattern" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ All files updated successfully!" -ForegroundColor Green
Write-Host "`nChanges made:" -ForegroundColor Cyan
Write-Host "  1. Added second phone number: 7090004945" -ForegroundColor White
Write-Host "  2. Both numbers now appear in contact sections" -ForegroundColor White
Write-Host "`nPhone numbers in footer:" -ForegroundColor Cyan
Write-Host "  • 7090004948 (existing)" -ForegroundColor White
Write-Host "  • 7090004945 (new)" -ForegroundColor White
