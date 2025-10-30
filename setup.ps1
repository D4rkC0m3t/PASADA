# ================================================
# PASADA CRM - Quick Setup Script
# ================================================
# This script helps you set up the PASADA CRM development environment
# Run with: .\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PASADA CRM - Development Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18.17.0 or higher from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Check npm version
Write-Host "Checking npm version..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file exists" -ForegroundColor Green
    
    # Check if API keys are configured
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "your-anon-key-here") {
        Write-Host "⚠️  WARNING: API keys not configured!" -ForegroundColor Yellow
        Write-Host "   Please update .env.local with your Supabase API keys" -ForegroundColor Yellow
        Write-Host "   Follow steps in QUICK-START.md" -ForegroundColor Yellow
    } else {
        Write-Host "✅ API keys appear to be configured" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    Write-Host "   The file should have been created automatically" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
    $install = Read-Host "Do you want to reinstall dependencies? (y/N)"
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    }
} else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Node.js and npm are installed" -ForegroundColor Green
Write-Host "✅ Environment file exists" -ForegroundColor Green
Write-Host "✅ Dependencies are ready" -ForegroundColor Green
Write-Host ""

# Next steps
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure Supabase API Keys:" -ForegroundColor Yellow
Write-Host "   - Open .env.local" -ForegroundColor White
Write-Host "   - Add your anon key and service role key" -ForegroundColor White
Write-Host "   - Follow QUICK-START.md for instructions" -ForegroundColor White
Write-Host ""
Write-Host "2. Set Up Database:" -ForegroundColor Yellow
Write-Host "   - Go to Supabase Dashboard → SQL Editor" -ForegroundColor White
Write-Host "   - Run database/schema.sql" -ForegroundColor White
Write-Host "   - Run database/rls-policies.sql" -ForegroundColor White
Write-Host "   - Run database/storage-setup.sql" -ForegroundColor White
Write-Host ""
Write-Host "3. Start Development Server:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "4. Open Browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""

# Ask if they want to start the dev server
$startServer = Read-Host "Do you want to start the development server now? (y/N)"
if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "Setup complete! Run 'npm run dev' when ready." -ForegroundColor Green
    Write-Host ""
}
