# Test AI Website Builder - POST /api/websites/generate
# Run from repo root. Requires Next.js app (npm run dev) to be running on $BaseUrl.

param(
    [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$generateUrl = "$BaseUrl/api/websites/generate"

Write-Host "`n=== AI Website Builder Test ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"
Write-Host "Endpoint: POST $generateUrl`n" -ForegroundColor Gray

# Test 1: No auth - expect 401
Write-Host "[1] No auth (expect 401 Unauthorized)..." -ForegroundColor Yellow
try {
    $body = @{ templateId = "1a"; formData = @{ business_name = "Test Co"; tagline = "Test" } } | ConvertTo-Json -Depth 5
    $r = Invoke-WebRequest -Uri $generateUrl -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -ErrorAction SilentlyContinue
    if ($r.StatusCode -eq 401) { Write-Host "  OK - 401 as expected (auth required)" -ForegroundColor Green }
    else { Write-Host "  UNEXPECTED: $($r.StatusCode) (expected 401)" -ForegroundColor Red }
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401) { Write-Host "  OK - 401 as expected (auth required)" -ForegroundColor Green }
    else { Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red; if ($status) { Write-Host "  Status: $status" } }
}

# Test 2: Missing body - expect 400
Write-Host "`n[2] Missing templateId/formData (expect 400)..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri $generateUrl -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "  UNEXPECTED: got $($r.StatusCode)" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401) { Write-Host "  OK - 401 (no auth, validated before body)" -ForegroundColor Green }
    elseif ($status -eq 400) { Write-Host "  OK - 400 (validation)" -ForegroundColor Green }
    else { Write-Host "  Status: $status - $($_.Exception.Message)" -ForegroundColor Yellow }
}

# Test 3: Health check - GET homepage
Write-Host "`n[3] App reachable (GET $BaseUrl)..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri $BaseUrl -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "  OK - App responding ($($r.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  FAIL - App not reachable: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n  Tip: Start the app with:  npm run dev" -ForegroundColor Gray
}

Write-Host "`n=== Done ===`n" -ForegroundColor Cyan
