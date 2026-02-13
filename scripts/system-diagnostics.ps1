# AI Lead Strategies - System Diagnostics
# Tests all critical endpoints. Usage: .\scripts\system-diagnostics.ps1
# Production: $env:BACKEND="https://api.aileadstrategies.com"; $env:FRONTEND="https://aileadstrategies.com"; .\scripts\system-diagnostics.ps1

$backend = if ($env:BACKEND) { $env:BACKEND } else { "http://localhost:3001" }
$frontend = if ($env:FRONTEND) { $env:FRONTEND } else { "http://localhost:3000" }
$results = @()

function Test-Endpoint {
    param($Name, $Url, $Method = "GET", $ExpectStatus = 200)
    try {
        if ($Method -eq "GET") {
            $r = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 10
        } else {
            $r = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing -TimeoutSec 10
        }
        $pass = $r.StatusCode -eq $ExpectStatus
        return @{ Name = $Name; Status = if ($pass) { "PASS" } else { "FAIL" }; Code = $r.StatusCode; Expected = $ExpectStatus; Details = $r.Content.Substring(0, [Math]::Min(80, $r.Content.Length)) + "..." }
    } catch {
        $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.Value__ } else { "ERR" }
        $pass = $code -eq $ExpectStatus
        return @{ Name = $Name; Status = if ($pass) { "PASS" } else { "FAIL" }; Code = $code; Expected = $ExpectStatus; Details = $_.Exception.Message }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Lead Strategies - System Diagnostics" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend:  $backend" -ForegroundColor Gray
Write-Host "Frontend: $frontend" -ForegroundColor Gray
Write-Host ""

# 1. Backend Health
Write-Host "1. Backend /health..." -ForegroundColor Yellow
$r = Test-Endpoint "Backend Health" "$backend/health" "GET" 200
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 2. Backend /api/v1/health
Write-Host "2. Backend /api/v1/health..." -ForegroundColor Yellow
$r = Test-Endpoint "Backend API Health" "$backend/api/v1/health" "GET" 200
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 3. Comprehensive /api/health
Write-Host "3. Comprehensive /api/health..." -ForegroundColor Yellow
$r = Test-Endpoint "Comprehensive Health" "$backend/api/health" "GET" 200
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 4. Status Integrations
Write-Host "4. Status /api/v1/status/integrations..." -ForegroundColor Yellow
$r = Test-Endpoint "Integration Status" "$backend/api/v1/status/integrations" "GET" 200
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 5. Auth /me (expect 401)
Write-Host "5. Auth /api/auth/me (no token, expect 401)..." -ForegroundColor Yellow
$r = Test-Endpoint "Auth /me unauthenticated" "$backend/api/auth/me" "GET" 401
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 5b. Auth signup route exists (POST with invalid body = 400, NOT 404)
Write-Host "5b. Auth POST /api/v1/auth/signup (route exists, expect 400)..." -ForegroundColor Yellow
$code = "ERR"
try {
    $resp = Invoke-WebRequest -Uri "$backend/api/v1/auth/signup" -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing -TimeoutSec 10
    $code = $resp.StatusCode
} catch {
    $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.Value__ } else { "ERR" }
}
# 400 = validation failed (route exists). 404 = route missing. Both are numeric.
$signupPass = ($code -eq 400) -or ($code -eq 422)
$results += @{ Name = "Auth signup route exists"; Status = if ($signupPass) { "PASS" } else { "FAIL" }; Code = $code; Expected = "400 or 422" }
Write-Host "   $(if ($signupPass) { "PASS" } else { "FAIL" }) ($code) - route must return 400/422, not 404" -ForegroundColor $(if ($signupPass) { "Green" } else { "Red" })

# 5c. Auth login route exists (POST with invalid body = 400)
Write-Host "5c. Auth POST /api/v1/auth/login (route exists, expect 400)..." -ForegroundColor Yellow
$code = "ERR"
try {
    $resp = Invoke-WebRequest -Uri "$backend/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing -TimeoutSec 10
    $code = $resp.StatusCode
} catch {
    $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.Value__ } else { "ERR" }
}
$loginPass = ($code -eq 400) -or ($code -eq 401) -or ($code -eq 422)
$results += @{ Name = "Auth login route exists"; Status = if ($loginPass) { "PASS" } else { "FAIL" }; Code = $code; Expected = "400 or 401" }
Write-Host "   $(if ($loginPass) { "PASS" } else { "FAIL" }) ($code)" -ForegroundColor $(if ($loginPass) { "Green" } else { "Red" })

# 6. Frontend Health
Write-Host "6. Frontend /api/health..." -ForegroundColor Yellow
$r = Test-Endpoint "Frontend Health" "$frontend/api/health" "GET" 200
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 7. Protected /api/v1/leads (expect 401)
Write-Host "7. Protected /api/v1/leads (expect 401)..." -ForegroundColor Yellow
$r = Test-Endpoint "Leads API (auth required)" "$backend/api/v1/leads" "GET" 401
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 8. Channels (expect 401)
Write-Host "8. Protected /api/v1/channels (expect 401)..." -ForegroundColor Yellow
$r = Test-Endpoint "Channels API (auth required)" "$backend/api/v1/channels" "GET" 401
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 9. Payouts (expect 401)
Write-Host "9. Protected /api/v1/payouts/balance (expect 401)..." -ForegroundColor Yellow
$r = Test-Endpoint "Payouts API (auth required)" "$backend/api/v1/payouts/balance" "GET" 401
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 10. Dashboard (expect 401)
Write-Host "10. Protected /api/v1/dashboard (expect 401)..." -ForegroundColor Yellow
$r = Test-Endpoint "Dashboard API (auth required)" "$backend/api/v1/dashboard" "GET" 401
$results += $r
Write-Host "   $($r.Status) ($($r.Code))" -ForegroundColor $(if ($r.Status -eq "PASS") { "Green" } else { "Red" })

# 11. AI endpoint (expect 401)
Write-Host "11. Protected /api/v1/ai/score-lead (expect 401)..." -ForegroundColor Yellow
$code = "ERR"
try {
    $resp = Invoke-WebRequest -Uri "$backend/api/v1/ai/score-lead" -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing -TimeoutSec 5
    $code = $resp.StatusCode
} catch {
    $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.Value__ } else { "ERR" }
}
$pass = $code -eq 401
$results += @{ Name = "AI score-lead (auth required)"; Status = if ($pass) { "PASS" } else { "FAIL" }; Code = $code; Expected = 401 }
Write-Host "   $(if ($pass) { "PASS" } else { "FAIL" }) ($code)" -ForegroundColor $(if ($pass) { "Green" } else { "Red" })

# Summary
$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$total = $results.Count
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULTS: $passed / $total passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor Cyan

# Export for report
$outPath = Join-Path (Split-Path $PSScriptRoot -Parent) "scripts"
if (-not (Test-Path $outPath)) { $outPath = $PSScriptRoot }
$results | ConvertTo-Json | Out-File (Join-Path $PSScriptRoot "diagnostics-results.json") -Encoding utf8
Write-Host "`nResults saved to scripts\diagnostics-results.json" -ForegroundColor Gray
exit $(if ($passed -eq $total) { 0 } else { 1 })
