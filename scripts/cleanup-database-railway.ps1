# Database Cleanup Script for Railway (PowerShell)
# Uses Railway's database connection directly

Write-Host "⚠️  WARNING: This will delete ALL users and related data!" -ForegroundColor Yellow
Write-Host "This script will clean the production database." -ForegroundColor Yellow
$confirmation = Read-Host "Type 'YES' to continue, or press Enter to cancel"

if ($confirmation -ne "YES") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

# Check if Railway CLI is available
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Railway CLI not found. Install it first." -ForegroundColor Red
    exit 1
}

Write-Host "`nConnecting to Railway database..." -ForegroundColor Cyan

# Read SQL script
$scriptPath = Join-Path $PSScriptRoot "cleanup-database.sql"
if (-not (Test-Path $scriptPath)) {
    Write-Host "Error: cleanup-database.sql not found at $scriptPath" -ForegroundColor Red
    exit 1
}

$sqlScript = Get-Content -Path $scriptPath -Raw

# Execute via Railway run (Railway will provide DATABASE_URL automatically)
Write-Host "Executing cleanup script..." -ForegroundColor Cyan

# Use Railway's run command with node to execute SQL via pg library
$nodeScript = @"
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = \`$($sqlScript -replace '`', '``')\`;

async function cleanup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    await client.query(sql);
    console.log('Cleanup completed successfully');
    
    // Verify
    const result = await client.query(\`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM prospects) as prospects_count,
        (SELECT COUNT(*) FROM email_campaigns) as campaigns_count,
        (SELECT COUNT(*) FROM subscriptions) as subscriptions_count
    \`);
    
    console.log('Verification:', result.rows[0]);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanup();
"@

# Save temporary script
$tempScript = Join-Path $env:TEMP "cleanup-db-$(Get-Random).js"
$nodeScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
    # Run via Railway (Railway provides DATABASE_URL)
    railway run node $tempScript
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Database cleanup completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Database cleanup failed!" -ForegroundColor Red
        exit 1
    }
} finally {
    # Cleanup temp file
    if (Test-Path $tempScript) {
        Remove-Item $tempScript -Force
    }
}
