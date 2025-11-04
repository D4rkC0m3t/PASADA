# Temporarily move problematic CRM routes to allow deployment

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "temp_backup_$timestamp"

Write-Host "Creating backup directory: $backupDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Move problematic directories
$dirsToMove = @(
    "app/api/quotations",
    "app/api/estimations", 
    "app/api/invoices",
    "app/client/projects"
)

foreach ($dir in $dirsToMove) {
    if (Test-Path $dir) {
        Write-Host "Moving: $dir" -ForegroundColor Yellow
        Move-Item -Path $dir -Destination "$backupDir/" -Force
        Write-Host "  ✓ Moved to backup" -ForegroundColor Green
    }
}

Write-Host "`n✅ Problematic routes moved to: $backupDir" -ForegroundColor Green
Write-Host "You can restore them later with: Move-Item $backupDir/* app/ -Force" -ForegroundColor Cyan
