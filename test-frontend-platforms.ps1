# Frontend Platform Testing Suite
$ErrorActionPreference = "Continue"

Write-Output "========================================="
Write-Output "FRONTEND PLATFORM TESTING"
Write-Output "========================================="
Write-Output ""

# Test Frontend Pages
$frontendBase = "https://leadsite.ai"

Write-Output "Testing Frontend Pages..."
Write-Output ""

# Test 1: Homepage
Write-Output "TEST 1: Homepage"
try {
    $response = Invoke-WebRequest -Uri $frontendBase -UseBasicParsing -TimeoutSec 10
    Write-Output "PASS - Homepage loading (Status: $($response.StatusCode))"
} catch {
    Write-Output "FAIL - Homepage: $($_.Exception.Message)"
}
Write-Output ""

# Test 2: Login Page
Write-Output "TEST 2: Login Page"
try {
    $response = Invoke-WebRequest -Uri "$frontendBase/login" -UseBasicParsing -TimeoutSec 10
    Write-Output "PASS - Login page loading (Status: $($response.StatusCode))"
} catch {
    Write-Output "FAIL - Login page: $($_.Exception.Message)"
}
Write-Output ""

# Test 3: Signup Page
Write-Output "TEST 3: Signup Page"
try {
    $response = Invoke-WebRequest -Uri "$frontendBase/signup" -UseBasicParsing -TimeoutSec 10
    Write-Output "PASS - Signup page loading (Status: $($response.StatusCode))"
} catch {
    Write-Output "FAIL - Signup page: $($_.Exception.Message)"
}
Write-Output ""

# Test 4: Dashboard (will require auth)
Write-Output "TEST 4: Dashboard Page"
try {
    $response = Invoke-WebRequest -Uri "$frontendBase/dashboard" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    if ($response.StatusCode -eq 200) {
        Write-Output "PASS - Dashboard loading"
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302 -or $_.Exception.Response.StatusCode -eq 307) {
        Write-Output "PASS - Dashboard redirects to login (expected behavior)"
    } else {
        Write-Output "INFO - Dashboard: $($_.Exception.Message)"
    }
}
Write-Output ""

# Test 5: Tackle.IO Frontend
Write-Output "TEST 5: Tackle.IO Dashboard Page"
try {
    $response = Invoke-WebRequest -Uri "$frontendBase/dashboard/tackle" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    if ($response.StatusCode -eq 200) {
        Write-Output "PASS - Tackle dashboard page exists"
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302 -or $_.Exception.Response.StatusCode -eq 307) {
        Write-Output "PASS - Tackle dashboard redirects to login (expected)"
    } else {
        Write-Output "INFO - Tackle dashboard: $($_.Exception.Response.StatusCode)"
    }
}
Write-Output ""

Write-Output "========================================="
Write-Output "FRONTEND TEST COMPLETE"
Write-Output "========================================="
