# Database Cleanup Script for Railway (PowerShell)
# This script connects to Railway PostgreSQL and cleans all user data

Write-Host "⚠️  WARNING: This will delete ALL users and related data!" -ForegroundColor Yellow
$confirmation = Read-Host "Press Enter to continue, or Ctrl+C to cancel"

# Check if Railway CLI is available
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Railway CLI not found. Install it first." -ForegroundColor Red
    exit 1
}

Write-Host "Getting database connection string from Railway..." -ForegroundColor Cyan
$dbUrl = railway variables get DATABASE_URL

if (-not $dbUrl) {
    Write-Host "Error: Could not get DATABASE_URL from Railway" -ForegroundColor Red
    Write-Host "Make sure you're logged in: railway login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Connecting to database and running cleanup..." -ForegroundColor Cyan

# Execute SQL cleanup
$sqlScript = Get-Content -Path "$PSScriptRoot\cleanup-database.sql" -Raw
railway run psql "$dbUrl" -c $sqlScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database cleanup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Database cleanup failed!" -ForegroundColor Red
    exit 1
}
