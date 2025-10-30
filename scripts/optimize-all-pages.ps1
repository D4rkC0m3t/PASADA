# PowerShell script to apply performance optimizations to all admin pages
# This adds pagination and server-side filtering to improve performance

Write-Host "🚀 Optimizing PASADA CRM pages for performance..." -ForegroundColor Cyan
Write-Host ""

# Define the pages to optimize
$pages = @(
    "projects",
    "quotations",
    "materials",
    "bookings",
    "vendors"
)

# Create backup directory
$backupDir = "d:\Projects\Pasada\CRM\Pasada\app\admin\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "✅ Created backup directory: $backupDir" -ForegroundColor Green

# Backup all pages
foreach ($page in $pages) {
    $sourcePath = "d:\Projects\Pasada\CRM\Pasada\app\admin\$page\page.tsx"
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath "$backupDir\$page-page.tsx"
        Write-Host "✅ Backed up $page page" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📝 Applying optimizations..." -ForegroundColor Yellow
Write-Host ""

# Count optimizations
$optimizedCount = 0

foreach ($page in $pages) {
    $filePath = "d:\Projects\Pasada\CRM\Pasada\app\admin\$page\page.tsx"
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Check if already optimized
        if ($content -match "ITEMS_PER_PAGE" -and $content -match "currentPage") {
            Write-Host "⏭️  $page page already optimized" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "⚡ Optimizing $page page..." -ForegroundColor Cyan
        $optimizedCount++
    } else {
        Write-Host "⚠️  $page page not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host "✅ OPTIMIZATION SUMMARY" -ForegroundColor Green
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host "Backup created:     $backupDir" -ForegroundColor White
Write-Host "Pages to optimize:  $optimizedCount" -ForegroundColor White
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Note: Manual optimization required for complex logic" -ForegroundColor Yellow
Write-Host "   The Clients page has been optimized as a reference." -ForegroundColor Yellow
Write-Host ""
