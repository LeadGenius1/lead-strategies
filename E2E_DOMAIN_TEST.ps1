# ============================================
# END-TO-END DOMAIN TESTING SCRIPT
# Tests login → dashboard flow on each domain
# ============================================

Write-Host @"
============================================
   END-TO-END DOMAIN TESTING
============================================

This script will test:
- Backend connectivity
- Login page accessibility
- Signup page accessibility
- Dashboard protection (should redirect to login)
- API endpoints

"@ -ForegroundColor Cyan

$backendUrl = "https://backend-wheat-beta-15.vercel.app"
$domains = @(
    "aileadstrategies.com",
    "leadsite.ai",
    "leadsite.io",
    "videosite.ai",
    "clientcontact.io"
)

$results = @()

# Test 1: Backend Health Check
Write-Host "`n[TEST 1] Backend Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "  [OK] Backend health check passed" -ForegroundColor Green
        $results += @{Test="Backend Health"; Status="PASS"; Domain="Backend"}
    } else {
        Write-Host "  [FAIL] Backend returned status $($healthResponse.StatusCode)" -ForegroundColor Red
        $results += @{Test="Backend Health"; Status="FAIL"; Domain="Backend"}
    }
} catch {
    Write-Host "  [ERROR] Backend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{Test="Backend Health"; Status="ERROR"; Domain="Backend"}
}

# Test 2: Backend API Status
Write-Host "`n[TEST 2] Backend API Status..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-WebRequest -Uri "$backendUrl/api/status" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($statusResponse.StatusCode -eq 200) {
        Write-Host "  [OK] Backend API status check passed" -ForegroundColor Green
        $results += @{Test="Backend API Status"; Status="PASS"; Domain="Backend"}
    } else {
        Write-Host "  [FAIL] Backend API returned status $($statusResponse.StatusCode)" -ForegroundColor Red
        $results += @{Test="Backend API Status"; Status="FAIL"; Domain="Backend"}
    }
} catch {
    Write-Host "  [ERROR] Backend API not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{Test="Backend API Status"; Status="ERROR"; Domain="Backend"}
}

# Test 3-7: Test each domain
foreach ($domain in $domains) {
    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host "Testing Domain: $domain" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    
    $baseUrl = "https://$domain"
    
    # Test Login Page
    Write-Host "`n[TEST] Login Page..." -ForegroundColor Yellow
    try {
        $loginResponse = Invoke-WebRequest -Uri "$baseUrl/login" -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5 -ErrorAction Stop
        if ($loginResponse.StatusCode -eq 200 -and ($loginResponse.Content -like "*login*" -or $loginResponse.Content -like "*email*" -or $loginResponse.Content -like "*password*")) {
            Write-Host "  [OK] Login page accessible" -ForegroundColor Green
            $results += @{Test="Login Page"; Status="PASS"; Domain=$domain}
        } else {
            Write-Host "  [WARN] Login page returned but content unclear" -ForegroundColor Yellow
            $results += @{Test="Login Page"; Status="WARN"; Domain=$domain}
        }
    } catch {
        Write-Host "  [FAIL] Login page not accessible: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{Test="Login Page"; Status="FAIL"; Domain=$domain}
    }
    
    # Test Signup Page
    Write-Host "`n[TEST] Signup Page..." -ForegroundColor Yellow
    try {
        $signupResponse = Invoke-WebRequest -Uri "$baseUrl/signup" -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5 -ErrorAction Stop
        if ($signupResponse.StatusCode -eq 200 -and ($signupResponse.Content -like "*signup*" -or $signupResponse.Content -like "*register*" -or $signupResponse.Content -like "*email*")) {
            Write-Host "  [OK] Signup page accessible" -ForegroundColor Green
            $results += @{Test="Signup Page"; Status="PASS"; Domain=$domain}
        } else {
            Write-Host "  [WARN] Signup page returned but content unclear" -ForegroundColor Yellow
            $results += @{Test="Signup Page"; Status="WARN"; Domain=$domain}
        }
    } catch {
        Write-Host "  [FAIL] Signup page not accessible: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{Test="Signup Page"; Status="FAIL"; Domain=$domain}
    }
    
    # Test Dashboard Protection (should redirect to login)
    Write-Host "`n[TEST] Dashboard Protection..." -ForegroundColor Yellow
    try {
        $dashboardResponse = Invoke-WebRequest -Uri "$baseUrl/dashboard" -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5 -ErrorAction Stop
        $finalUrl = $dashboardResponse.BaseResponse.ResponseUri.AbsoluteUri
        
        if ($finalUrl -like "*login*" -or $dashboardResponse.StatusCode -eq 307 -or $dashboardResponse.StatusCode -eq 302) {
            Write-Host "  [OK] Dashboard correctly protected (redirects to login)" -ForegroundColor Green
            $results += @{Test="Dashboard Protection"; Status="PASS"; Domain=$domain}
        } elseif ($dashboardResponse.StatusCode -eq 200 -and $dashboardResponse.Content -like "*dashboard*") {
            Write-Host "  [WARN] Dashboard accessible without auth (may be expected)" -ForegroundColor Yellow
            $results += @{Test="Dashboard Protection"; Status="WARN"; Domain=$domain}
        } else {
            Write-Host "  [FAIL] Unexpected dashboard response" -ForegroundColor Red
            $results += @{Test="Dashboard Protection"; Status="FAIL"; Domain=$domain}
        }
    } catch {
        # Check if it's a redirect error (expected)
        if ($_.Exception.Message -like "*redirect*" -or $_.Exception.Response.StatusCode -eq 307 -or $_.Exception.Response.StatusCode -eq 302) {
            Write-Host "  [OK] Dashboard correctly protected (redirects to login)" -ForegroundColor Green
            $results += @{Test="Dashboard Protection"; Status="PASS"; Domain=$domain}
        } else {
            Write-Host "  [FAIL] Dashboard test failed: $($_.Exception.Message)" -ForegroundColor Red
            $results += @{Test="Dashboard Protection"; Status="FAIL"; Domain=$domain}
        }
    }
    
    # Test Forgot Password Page
    Write-Host "`n[TEST] Forgot Password Page..." -ForegroundColor Yellow
    try {
        $forgotResponse = Invoke-WebRequest -Uri "$baseUrl/forgot-password" -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5 -ErrorAction Stop
        if ($forgotResponse.StatusCode -eq 200 -and ($forgotResponse.Content -like "*forgot*" -or $forgotResponse.Content -like "*password*" -or $forgotResponse.Content -like "*reset*")) {
            Write-Host "  [OK] Forgot password page accessible" -ForegroundColor Green
            $results += @{Test="Forgot Password Page"; Status="PASS"; Domain=$domain}
        } else {
            Write-Host "  [WARN] Forgot password page returned but content unclear" -ForegroundColor Yellow
            $results += @{Test="Forgot Password Page"; Status="WARN"; Domain=$domain}
        }
    } catch {
        Write-Host "  [FAIL] Forgot password page not accessible: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{Test="Forgot Password Page"; Status="FAIL"; Domain=$domain}
    }
    
    # Test API Health Endpoint (frontend → backend)
    Write-Host "`n[TEST] Frontend → Backend API Connection..." -ForegroundColor Yellow
    try {
        $apiHealthResponse = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        if ($apiHealthResponse.StatusCode -eq 200) {
            $content = $apiHealthResponse.Content
            if ($content -like "*status*" -or $content -like "*ok*" -or $content -like "*health*") {
                Write-Host "  [OK] Frontend can reach backend API" -ForegroundColor Green
                $results += @{Test="Frontend → Backend API"; Status="PASS"; Domain=$domain}
            } else {
                Write-Host "  [WARN] API responded but content unclear" -ForegroundColor Yellow
                $results += @{Test="Frontend → Backend API"; Status="WARN"; Domain=$domain}
            }
        } else {
            Write-Host "  [FAIL] API returned status $($apiHealthResponse.StatusCode)" -ForegroundColor Red
            $results += @{Test="Frontend → Backend API"; Status="FAIL"; Domain=$domain}
        }
    } catch {
        Write-Host "  [FAIL] Frontend cannot reach backend API: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{Test="Frontend → Backend API"; Status="FAIL"; Domain=$domain}
    }
    
    Start-Sleep -Milliseconds 500
}

# Summary Report
Write-Host "`n`n============================================" -ForegroundColor Cyan
Write-Host "   TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($results | Where-Object { $_.Status -eq "WARN" }).Count
$errorCount = ($results | Where-Object { $_.Status -eq "ERROR" }).Count

Write-Host "Total Tests: $($results.Count)" -ForegroundColor White
Write-Host "[PASS]  : $passCount" -ForegroundColor Green
Write-Host "[WARN]  : $warnCount" -ForegroundColor Yellow
Write-Host "[FAIL]  : $failCount" -ForegroundColor Red
Write-Host "[ERROR] : $errorCount" -ForegroundColor Red
Write-Host ""

# Detailed Results by Domain
$domainGroups = $results | Group-Object Domain
foreach ($group in $domainGroups) {
    Write-Host "`nDomain: $($group.Name)" -ForegroundColor Cyan
    foreach ($result in $group.Group) {
        $statusColor = switch ($result.Status) {
            "PASS" { "Green" }
            "WARN" { "Yellow" }
            "FAIL" { "Red" }
            "ERROR" { "Red" }
            default { "White" }
        }
        Write-Host "  [$($result.Status)] $($result.Test)" -ForegroundColor $statusColor
    }
}

# Overall Status
Write-Host "`n============================================" -ForegroundColor Cyan
if ($failCount -eq 0 -and $errorCount -eq 0) {
    Write-Host "OVERALL STATUS: ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "Your domains are ready for end-to-end testing!" -ForegroundColor Green
} elseif ($failCount -le 2 -and $errorCount -eq 0) {
    Write-Host "OVERALL STATUS: MOSTLY WORKING" -ForegroundColor Yellow
    Write-Host "Some tests had warnings. Check the details above." -ForegroundColor Yellow
} else {
    Write-Host "OVERALL STATUS: ISSUES DETECTED" -ForegroundColor Red
    Write-Host "Some critical tests failed. Review the errors above." -ForegroundColor Red
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host ""

# Open test pages in browser
Write-Host "Opening test pages in browser for manual verification..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

foreach ($domain in $domains) {
    Start-Process "https://$domain/login"
    Start-Sleep -Seconds 1
}

Write-Host "`nTest script complete!" -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
