# Update email and disable social media links across all pages

$files = @(
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

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "Updating: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Update email display text
        $content = $content -replace 'pasada\.designn@gmail\.com', 'pasada.groups@gmail.com'
        
        # Hide social links section (add style="display: none;")
        $content = $content -replace '(<div[^>]*data-w-id="[^"]*"[^>]*class="[^"]*text-size-medium text-style-allcaps margin-top margin-large[^"]*"[^>]*)>social links</div>', '$1 style="display: none;">social links</div>'
        
        # Hide social links button group
        $content = $content -replace '(<div[^>]*class="button-group-footer margin-top margin-small button-group-horizontal"[^>]*)(>[\s\S]*?<a[^>]*instagram[^>]*>)', '$1 style="display: none;"$2'
        
        # Save the file
        Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
        
        Write-Host "  ✓ Updated email and hidden social links" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ All files updated successfully!" -ForegroundColor Green
Write-Host "`nChanges made:" -ForegroundColor Cyan
Write-Host "  1. Email updated to: pasada.groups@gmail.com" -ForegroundColor White
Write-Host "  2. Social media links hidden (Instagram, Facebook)" -ForegroundColor White
