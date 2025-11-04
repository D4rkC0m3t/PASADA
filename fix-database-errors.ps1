# ============================================
# Fix Database Errors - Helper Script
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PASADA CRM - Database Error Fix" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "This script will help you fix the following errors:" -ForegroundColor Yellow
Write-Host "  1. 404 errors on /rest/v1/visitors" -ForegroundColor White
Write-Host "  2. 400 errors on /rest/v1/projects" -ForegroundColor White
Write-Host "  3. 'Error updating project' in edit page`n" -ForegroundColor White

Write-Host "Root Causes Found:" -ForegroundColor Yellow
Write-Host "  ❌ visitors table doesn't exist" -ForegroundColor Red
Write-Host "  ❌ projects table missing columns (timeline_days, area_sqft, etc.)" -ForegroundColor Red
Write-Host "  ❌ RLS policies not properly configured`n" -ForegroundColor Red

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 1: Open Supabase Dashboard" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Select your PASADA project" -ForegroundColor White
Write-Host "3. Click on 'SQL Editor' in the left sidebar`n" -ForegroundColor White

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 2: Copy the SQL File" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

$sqlFile = "database\FIX_ALL_ERRORS.sql"
$fullPath = Join-Path $PSScriptRoot $sqlFile

if (Test-Path $fullPath) {
    Write-Host "✅ SQL file found at:" -ForegroundColor Green
    Write-Host "   $fullPath`n" -ForegroundColor Gray
    
    # Copy to clipboard
    try {
        Get-Content $fullPath | Set-Clipboard
        Write-Host "✅ SQL content copied to clipboard!" -ForegroundColor Green
        Write-Host "   You can now paste it directly in Supabase SQL Editor`n" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Could not copy to clipboard automatically" -ForegroundColor Yellow
        Write-Host "   Please manually open: $fullPath`n" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ SQL file not found!" -ForegroundColor Red
    Write-Host "   Expected location: $fullPath`n" -ForegroundColor Gray
    exit 1
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 3: Run the SQL in Supabase" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "1. Paste the SQL into the Supabase SQL Editor" -ForegroundColor White
Write-Host "2. Click 'Run' button (or press Ctrl+Enter)" -ForegroundColor White
Write-Host "3. Wait for 'Success' message" -ForegroundColor White
Write-Host "4. Check the results at the bottom`n" -ForegroundColor White

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 4: Verify the Fix" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Run these verification queries in Supabase:" -ForegroundColor White
Write-Host ""
Write-Host "-- Check visitors table" -ForegroundColor Gray
Write-Host "SELECT COUNT(*) FROM visitors;" -ForegroundColor Cyan
Write-Host ""
Write-Host "-- Check projects columns" -ForegroundColor Gray
Write-Host "SELECT column_name FROM information_schema.columns" -ForegroundColor Cyan
Write-Host "WHERE table_name = 'projects';" -ForegroundColor Cyan
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 5: Clear Browser Cache" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "1. Open your app in browser" -ForegroundColor White
Write-Host "2. Press F12 to open DevTools" -ForegroundColor White
Write-Host "3. Right-click the refresh button" -ForegroundColor White
Write-Host "4. Select 'Empty Cache and Hard Reload'`n" -ForegroundColor White

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 6: Test the Fixes" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Test these features:" -ForegroundColor White
Write-Host "  ✓ Admin Dashboard → Visitor Analytics widget" -ForegroundColor Yellow
Write-Host "  ✓ Projects → Edit Project → Save Changes" -ForegroundColor Yellow
Write-Host "  ✓ Check DevTools Console for errors`n" -ForegroundColor Yellow

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Expected Results After Fix" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "✅ No 404 errors on /rest/v1/visitors" -ForegroundColor Green
Write-Host "✅ No 400 errors on /rest/v1/projects" -ForegroundColor Green
Write-Host "✅ Project edit page saves successfully" -ForegroundColor Green
Write-Host "✅ Visitor analytics displays data" -ForegroundColor Green
Write-Host "✅ Console is clean (no errors)`n" -ForegroundColor Green

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Need Help?" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "📖 Read the detailed documentation:" -ForegroundColor White
Write-Host "   DATABASE-ERRORS-FIXED.md`n" -ForegroundColor Gray

Write-Host "🔍 If errors persist, check:" -ForegroundColor White
Write-Host "   1. Supabase connection is working" -ForegroundColor Gray
Write-Host "   2. You're logged in as authenticated user" -ForegroundColor Gray
Write-Host "   3. RLS policies are enabled" -ForegroundColor Gray
Write-Host "   4. Browser cache is cleared`n" -ForegroundColor Gray

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Ready to proceed?" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

$response = Read-Host "Press Enter to open Supabase Dashboard in browser, or type 'skip' to exit"

if ($response -ne "skip") {
    Write-Host "`nOpening Supabase Dashboard..." -ForegroundColor Green
    Start-Process "https://supabase.com/dashboard"
    
    Write-Host "`n✅ Dashboard opened in browser" -ForegroundColor Green
    Write-Host "   Follow the steps above to complete the fix`n" -ForegroundColor Gray
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Script Complete!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Next: Paste the SQL in Supabase and run it!" -ForegroundColor Yellow
