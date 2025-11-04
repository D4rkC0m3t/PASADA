# Fix seed_materials.sql to match actual schema
# Remove HSN codes and change true to 'active'

$filePath = "d:/Projects/Pasada/CRM/Pasada/database/seed_materials.sql"
$content = Get-Content $filePath -Raw

# Pattern: Remove HSN code (8 digits in quotes) between tax_percent and supplier_name
# Example: 18, '94036010', 'Urban Ladder' -> 18, 'Urban Ladder'
$content = $content -replace ", '[0-9]{8}',", ","

# Change true to 'active' at end of lines
$content = $content -replace ", true\)", ", 'active')"

# Save the file
Set-Content -Path $filePath -Value $content -NoNewline

Write-Host "✅ Fixed seed_materials.sql" -ForegroundColor Green
Write-Host "   - Removed all HSN codes" -ForegroundColor Cyan
Write-Host "   - Changed true to 'active'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to execute in Supabase!" -ForegroundColor Yellow
