# PASADA CRM - Deployment Script
# This script deploys the application to Vercel

Write-Host "🚀 PASADA CRM - Deployment to Vercel" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$whoami = npx vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel" -ForegroundColor Red
    Write-Host "Please run: npx vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
Write-Host ""

# Deploy to production
Write-Host "🚀 Deploying to Vercel Production..." -ForegroundColor Cyan
Write-Host ""

npx vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Note your production URL from above" -ForegroundColor White
    Write-Host "2. Get Vercel credentials:" -ForegroundColor White
    Write-Host "   - VERCEL_TOKEN: https://vercel.com/account/tokens" -ForegroundColor Gray
    Write-Host "   - VERCEL_ORG_ID: https://vercel.com/account (Settings → General)" -ForegroundColor Gray
    Write-Host "   - VERCEL_PROJECT_ID: Project Settings → General" -ForegroundColor Gray
    Write-Host "3. Configure GitHub Secrets: https://github.com/D4rkC0m3t/PASADA/settings/secrets/actions" -ForegroundColor White
    Write-Host "4. Test health endpoint: curl https://your-url.vercel.app/api/health" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
