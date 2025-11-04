# PowerShell Script to Add AuthGuard to All Admin Pages
# This fixes the CRITICAL security vulnerability where admin pages were unprotected

Write-Host "🚨 CRITICAL SECURITY FIX - Adding AuthGuard to Admin Pages" -ForegroundColor Red
Write-Host "============================================================" -ForegroundColor Red
Write-Host ""

$adminPath = "d:\Projects\Pasada\CRM\Pasada\app\admin"
$filesFixed = 0
$filesSkipped = 0
$errors = 0

# Find all page.tsx files in admin directory
$adminPages = Get-ChildItem -Path $adminPath -Recurse -Filter "page.tsx" | Where-Object {
    $_.FullName -notlike "*backup*"
}

Write-Host "Found $($adminPages.Count) admin pages to secure" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $adminPages) {
    $relativePath = $file.FullName.Replace("$adminPath\", "")
    
    try {
        $content = Get-Content $file.FullName -Raw
        
        # Skip if already has AuthGuard
        if ($content -match "import AuthGuard") {
            Write-Host "✓ SKIP: $relativePath (already protected)" -ForegroundColor Green
            $filesSkipped++
            continue
        }
        
        # Check if it's a client component
        if ($content -notmatch "'use client'") {
            Write-Host "⚠ SKIP: $relativePath (not a client component)" -ForegroundColor Yellow
            $filesSkipped++
            continue
        }
        
        # Add AuthGuard import after other imports
        $importPattern = "(import.*?from.*?\n)+\n"
        $newImport = "`nimport AuthGuard from '@/components/AuthGuard'`n`n"
        
        if ($content -match $importPattern) {
            $content = $content -replace "(\n)(export default)", "$newImport`$1export default"
        }
        
        # Find the return statement and wrap content with AuthGuard
        # Pattern: export default function...() { return ( ... ) }
        
        if ($content -match "export default function.*?\{[\s\S]*?return \(") {
            # Add AuthGuard opening tag after "return ("
            $content = $content -replace "(return \([\s]*\n)", "`$1    <AuthGuard requiredRole=`"admin`">`n"
            
            # Find the last closing </...> before final ) }
            # This is tricky - we need to add </AuthGuard> before the last ) }
            $lines = $content -split "`n"
            $returnIndex = -1
            $parenCount = 0
            $foundReturn = $false
            
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "return \(") {
                    $foundReturn = $true
                    $parenCount = 1
                    continue
                }
                
                if ($foundReturn) {
                    $parenCount += ([regex]::Matches($lines[$i], "\(")).Count
                    $parenCount -= ([regex]::Matches($lines[$i], "\)")).Count
                    
                    if ($parenCount -eq 0) {
                        $returnIndex = $i
                        break
                    }
                }
            }
            
            if ($returnIndex -gt 0) {
                # Insert </AuthGuard> before the closing )
                $lines[$returnIndex] = "    </AuthGuard>`n" + $lines[$returnIndex]
                $content = $lines -join "`n"
            }
        }
        
        # Save the file
        Set-Content -Path $file.FullName -Value $content -NoNewline
        
        Write-Host "✓ FIXED: $relativePath" -ForegroundColor Green
        $filesFixed++
        
    } catch {
        Write-Host "✗ ERROR: $relativePath - $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Security Fix Summary:" -ForegroundColor Cyan
Write-Host "  Fixed: $filesFixed pages" -ForegroundColor Green
Write-Host "  Skipped: $filesSkipped pages (already protected or not client)" -ForegroundColor Yellow
Write-Host "  Errors: $errors pages" -ForegroundColor Red
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($filesFixed -gt 0) {
    Write-Host "✅ Security fix applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please test the following:" -ForegroundColor Yellow
    Write-Host "  1. Login as client and try to access /admin/dashboard" -ForegroundColor Yellow
    Write-Host "  2. Verify you get redirected to /login?error=unauthorized" -ForegroundColor Yellow
    Write-Host "  3. Login as admin and verify all admin pages work" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "ℹ️  No files needed fixing" -ForegroundColor Blue
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
