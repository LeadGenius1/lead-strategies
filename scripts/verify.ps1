# AI Lead Strategies - Verification Script (PowerShell)
# Usage: .\scripts\verify.ps1
# With auth: $env:TOKEN = "your_jwt"; .\scripts\verify.ps1

$backend = "http://localhost:3001"
$healthOk = $false

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AI Lead Strategies - Verification Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n1. Health check..." -ForegroundColor Yellow
try {
    Invoke-RestMethod "$backend/health" -TimeoutSec 5 | ConvertTo-Json
    $healthOk = $true
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Write-Host "   Start backend with: cd backend; npm start" -ForegroundColor Yellow
}

if ($healthOk) {
    Write-Host "`n2. Auth /me (no token - expect 401)..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod "$backend/api/auth/me" | ConvertTo-Json
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Green
    }

    Write-Host "`n3. Auth /me (with token)..." -ForegroundColor Yellow
    if ($env:TOKEN) {
        $headers = @{ "Authorization" = "Bearer $env:TOKEN" }
        try {
            Invoke-RestMethod "$backend/api/auth/me" -Headers $headers | ConvertTo-Json
        } catch {
            Write-Host "❌ Auth failed: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Set TOKEN env var first: `$env:TOKEN = 'your_jwt'" -ForegroundColor Yellow
    }

    Write-Host "`n4. Rate limit test (150 requests)..." -ForegroundColor Yellow
    $codes = @()
    1..150 | ForEach-Object {
        try {
            $response = Invoke-WebRequest "$backend/api/auth/me" -Method Get -UseBasicParsing -TimeoutSec 3
            $codes += $response.StatusCode
        } catch {
            $codes += $_.Exception.Response.StatusCode.Value__
        }
    }
    $grouped = $codes | Group-Object | Sort-Object Name
    Write-Host "Results:" -ForegroundColor Green
    $grouped | ForEach-Object { Write-Host "  $($_.Name): $($_.Count) requests" }
} else {
    Write-Host "`nSkipping steps 2-4 (backend not reachable)" -ForegroundColor Yellow
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Verification complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
