# PowerShell Script to Run Migration Using psql
# Run with: .\database\run-migration-psql.ps1

Write-Host "🚀 PASADA CRM - Database Migration (psql)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
Write-Host "📋 Loading environment variables..." -ForegroundColor Yellow
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($name -and $value -and -not $name.StartsWith('#')) {
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
}

$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$DATABASE_URL = $env:DATABASE_URL

if (-not $SUPABASE_URL) {
    Write-Host "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local" -ForegroundColor Red
    exit 1
}

# Extract project ref
$projectRef = $SUPABASE_URL -replace 'https://', '' -replace '.supabase.co', ''
Write-Host "✅ Project: $projectRef" -ForegroundColor Green
Write-Host ""

# Check if psql is installed
Write-Host "🔍 Checking for psql..." -ForegroundColor Yellow
$psqlInstalled = $null -ne (Get-Command psql -ErrorAction SilentlyContinue)

if (-not $psqlInstalled) {
    Write-Host "❌ psql not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Install PostgreSQL:" -ForegroundColor Cyan
    Write-Host "1. Download: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "2. Or use Chocolatey: choco install postgresql" -ForegroundColor Gray
    Write-Host "3. Or use Scoop: scoop install postgresql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔄 Alternative: Use Supabase Dashboard" -ForegroundColor Yellow
    Write-Host "Run: .\database\run-migration.ps1" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ psql found" -ForegroundColor Green
Write-Host ""

# Check migration file
$migrationFile = "database\migrations\FINAL_MIGRATION.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Migration file: $migrationFile" -ForegroundColor Green
Write-Host ""

# Prompt for database password
Write-Host "🔐 Database Connection" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

if ($DATABASE_URL -and $DATABASE_URL -ne "postgresql://postgres:[YOUR-PASSWORD]@db.$projectRef.supabase.co:5432/postgres") {
    Write-Host "✅ Using DATABASE_URL from .env.local" -ForegroundColor Green
    $connectionString = $DATABASE_URL
} else {
    Write-Host "Enter your Supabase database password:" -ForegroundColor Yellow
    Write-Host "(Find it in: Supabase Dashboard → Settings → Database → Connection String)" -ForegroundColor Gray
    $password = Read-Host "Password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $connectionString = "postgresql://postgres:$plainPassword@db.$projectRef.supabase.co:5432/postgres"
}

Write-Host ""
Write-Host "🔄 Executing migration..." -ForegroundColor Yellow
Write-Host ""

# Run psql
try {
    $env:PGPASSWORD = $plainPassword
    psql $connectionString -f $migrationFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Sign up through your app" -ForegroundColor White
        Write-Host "2. Set yourself as admin:" -ForegroundColor White
        Write-Host "   UPDATE public.user_profiles SET role = 'admin' WHERE email = 'your@email.com';" -ForegroundColor Gray
        Write-Host "3. Test the contact form" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Try running in Supabase Dashboard instead:" -ForegroundColor Yellow
        Write-Host "https://supabase.com/dashboard/project/$projectRef/editor" -ForegroundColor Gray
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error executing migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try running in Supabase Dashboard instead:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/$projectRef/editor" -ForegroundColor Gray
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
