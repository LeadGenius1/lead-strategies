# Production Readiness Test Suite
$ErrorActionPreference = "Continue"
$baseUrl = "https://backend-production-2987.up.railway.app"

Write-Output "========================================="
Write-Output "PRODUCTION READINESS TEST SUITE"
Write-Output "========================================="
Write-Output ""

# Test 1: Health Check
Write-Output "TEST 1: Health Check"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Output "PASS - Status: $($response.status), Service: $($response.service)"
    if ($response.platforms) {
        Write-Output "Platforms: $($response.platforms -join ', ')"
    }
    if ($response.selfHealing) {
        Write-Output "Self-Healing: Enabled=$($response.selfHealing.enabled), Agents=$($response.selfHealing.agents)"
    }
} catch {
    Write-Output "FAIL - $($_.Exception.Message)"
}
Write-Output ""

# Test 2: Create Test User
Write-Output "TEST 2: User Signup (Tier 5)"
try {
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $userData = @{
        email = "tier5test$timestamp@example.com"
        password = "SecureTest123!"
        name = "Tier 5 Test User"
        tier = 5
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/signup" -Method Post -Body ($userData | ConvertTo-Json) -ContentType "application/json"
    Write-Output "PASS - User created: $($response.user.email), ID: $($response.user.id)"
    $script:token = $response.token
    $script:userId = $response.user.id
    Write-Output "Token received (length: $($response.token.Length))"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Output "INFO - User might already exist, trying login..."
    } else {
        Write-Output "FAIL - $($_.Exception.Message)"
    }
}
Write-Output ""

# Test 3: Login
Write-Output "TEST 3: User Login"
try {
    $loginData = @{
        email = "test@leadsite.ai"
        password = "Test123456!"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    Write-Output "PASS - Login successful: $($response.user.email)"
    $script:token = $response.token
} catch {
    Write-Output "INFO - Test user may not exist yet: $($_.Exception.Response.StatusCode)"
}
Write-Output ""

# Test 4: Get Current User
if ($script:token) {
    Write-Output "TEST 4: Get Current User (Authenticated)"
    try {
        $headers = @{Authorization = "Bearer $script:token"}
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" -Method Get -Headers $headers
        Write-Output "PASS - Current user: $($response.user.email), Tier: $($response.user.tier)"
    } catch {
        Write-Output "FAIL - $($_.Exception.Message)"
    }
    Write-Output ""

    # Test 5: Campaigns
    Write-Output "TEST 5: LeadSite.AI - Get Campaigns"
    try {
        $headers = @{Authorization = "Bearer $script:token"}
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/campaigns" -Method Get -Headers $headers
        Write-Output "PASS - Campaigns endpoint working, Count: $(if($response.campaigns){$response.campaigns.Count}else{0})"
    } catch {
        Write-Output "FAIL - $($_.Exception.Response.StatusCode): $($_.Exception.Message)"
    }
    Write-Output ""

    # Test 6: Tackle Dashboard
    Write-Output "TEST 6: Tackle.IO - Dashboard"
    try {
        $headers = @{Authorization = "Bearer $script:token"}
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/tackle/dashboard" -Method Get -Headers $headers
        Write-Output "PASS - Tackle dashboard working"
        Write-Output "Response: $($response | ConvertTo-Json -Depth 2)"
    } catch {
        Write-Output "FAIL - $($_.Exception.Response.StatusCode): $($_.Exception.Message)"
    }
    Write-Output ""
}

Write-Output "========================================="
Write-Output "TEST SUITE COMPLETE"
Write-Output "========================================="
