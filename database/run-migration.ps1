# PowerShell Script to Run Database Migration via Supabase CLI
# Run with: .\database\run-migration.ps1

Write-Host "🚀 PASADA CRM - Database Migration" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please ensure .env.local exists with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

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
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_KEY) {
    Write-Host "❌ Error: Missing Supabase credentials!" -ForegroundColor Red
    Write-Host "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment variables loaded" -ForegroundColor Green
Write-Host "📍 Supabase URL: $SUPABASE_URL" -ForegroundColor Gray
Write-Host ""

# Check if migration file exists
$migrationFile = "database\migrations\FINAL_MIGRATION.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Error: Migration file not found!" -ForegroundColor Red
    Write-Host "Expected: $migrationFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 Found migration file: $migrationFile" -ForegroundColor Green
Write-Host ""

# Extract project ref from URL
$projectRef = $SUPABASE_URL -replace 'https://', '' -replace '.supabase.co', ''
Write-Host "🔑 Project Reference: $projectRef" -ForegroundColor Cyan
Write-Host ""

# Read SQL file
Write-Host "📖 Reading SQL migration..." -ForegroundColor Yellow
$sqlContent = Get-Content $migrationFile -Raw

# Execute using psql (if available) or curl
Write-Host "🔄 Executing migration..." -ForegroundColor Yellow
Write-Host ""

# Try using curl to execute SQL via Supabase REST API
$headers = @{
    "apikey" = $SUPABASE_SERVICE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    query = $sqlContent
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "✅ Migration executed successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Direct API execution not available" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Alternative: Run migration manually" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Supabase Dashboard (Recommended)" -ForegroundColor White
    Write-Host "1. Go to: https://supabase.com/dashboard/project/$projectRef" -ForegroundColor Gray
    Write-Host "2. Click: SQL Editor" -ForegroundColor Gray
    Write-Host "3. Click: New Query" -ForegroundColor Gray
    Write-Host "4. Copy contents of: $migrationFile" -ForegroundColor Gray
    Write-Host "5. Paste and click: RUN" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Using psql (if installed)" -ForegroundColor White
    Write-Host "psql `"postgresql://postgres:[PASSWORD]@db.$projectRef.supabase.co:5432/postgres`" -f $migrationFile" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 3: Using Supabase CLI (if installed)" -ForegroundColor White
    Write-Host "supabase db push --db-url `"postgresql://postgres:[PASSWORD]@db.$projectRef.supabase.co:5432/postgres`"" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "1. Verify tables created in Supabase Dashboard" -ForegroundColor White
Write-Host "2. Sign up through your app" -ForegroundColor White
Write-Host "3. Run: UPDATE public.user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';" -ForegroundColor White
Write-Host "4. Test the contact form" -ForegroundColor White
Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
