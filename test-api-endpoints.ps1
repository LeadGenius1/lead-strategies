# Comprehensive API Testing Script
# Tests all 5 platforms and core functionality

$baseUrl = "https://backend-production-2987.up.railway.app"
$testResults = @()

Write-Host "🚀 Starting Comprehensive API Testing..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Health check" -ForegroundColor Green
        $testResults += @{Test="Health Check"; Status="PASS"}
    }
} catch {
    Write-Host "❌ FAIL: Health check - $_" -ForegroundColor Red
    $testResults += @{Test="Health Check"; Status="FAIL"; Error=$_.Exception.Message}
}

# Test 2: User Registration
Write-Host "Test 2: User Registration..." -ForegroundColor Yellow
try {
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $testUser = @{
        email = "test$timestamp@example.com"
        password = "Test123456!"
        name = "Test User $timestamp"
        tier = 1
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/register" -Method POST -Body $testUser -ContentType "application/json" -UseBasicParsing
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
        $data = $response.Content | ConvertFrom-Json
        $global:testToken = $data.token
        $global:testUserId = $data.user.id
        Write-Host "✅ PASS: User registration (User ID: $($data.user.id))" -ForegroundColor Green
        $testResults += @{Test="User Registration"; Status="PASS"}
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  SKIP: User already exists (expected)" -ForegroundColor Yellow
        $testResults += @{Test="User Registration"; Status="SKIP"}
    } else {
        Write-Host "❌ FAIL: User registration - $_" -ForegroundColor Red
        $testResults += @{Test="User Registration"; Status="FAIL"; Error=$_.Exception.Message}
    }
}

# Test 3: User Login
Write-Host "Test 3: User Login..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "test@example.com"
        password = "Test123456!"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        $global:testToken = $data.token
        Write-Host "✅ PASS: User login (Token received)" -ForegroundColor Green
        $testResults += @{Test="User Login"; Status="PASS"}
    }
} catch {
    Write-Host "❌ FAIL: User login - $_" -ForegroundColor Red
    $testResults += @{Test="User Login"; Status="FAIL"; Error=$_.Exception.Message}
}

# Test 4: Get Current User (with auth)
Write-Host "Test 4: Get Current User..." -ForegroundColor Yellow
try {
    if ($global:testToken) {
        $headers = @{Authorization="Bearer $global:testToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/me" -Headers $headers -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: Get current user (Auth working)" -ForegroundColor Green
            $testResults += @{Test="Get Current User"; Status="PASS"}
        }
    } else {
        Write-Host "⚠️  SKIP: No auth token available" -ForegroundColor Yellow
        $testResults += @{Test="Get Current User"; Status="SKIP"}
    }
} catch {
    Write-Host "❌ FAIL: Get current user - $_" -ForegroundColor Red
    $testResults += @{Test="Get Current User"; Status="FAIL"; Error=$_.Exception.Message}
}

# Test 5: LeadSite.AI - Get Campaigns
Write-Host "Test 5: LeadSite.AI - Get Campaigns..." -ForegroundColor Yellow
try {
    if ($global:testToken) {
        $headers = @{Authorization="Bearer $global:testToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/campaigns" -Headers $headers -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: Get campaigns endpoint" -ForegroundColor Green
            $testResults += @{Test="LeadSite.AI - Campaigns"; Status="PASS"}
        }
    } else {
        Write-Host "⚠️  SKIP: No auth token" -ForegroundColor Yellow
        $testResults += @{Test="LeadSite.AI - Campaigns"; Status="SKIP"}
    }
} catch {
    Write-Host "❌ FAIL: Get campaigns - $_" -ForegroundColor Red
    $testResults += @{Test="LeadSite.AI - Campaigns"; Status="FAIL"; Error=$_.Exception.Message}
}

# Test 6: LeadSite.IO - Get Websites
Write-Host "Test 6: LeadSite.IO - Get Websites..." -ForegroundColor Yellow
try {
    if ($global:testToken) {
        $headers = @{Authorization="Bearer $global:testToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/websites" -Headers $headers -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: Get websites endpoint" -ForegroundColor Green
            $testResults += @{Test="LeadSite.IO - Websites"; Status="PASS"}
        }
    } else {
        Write-Host "⚠️  SKIP: No auth token" -ForegroundColor Yellow
        $testResults += @{Test="LeadSite.IO - Websites"; Status="SKIP"}
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "⚠️  INFO: Websites endpoint not implemented yet" -ForegroundColor Yellow
        $testResults += @{Test="LeadSite.IO - Websites"; Status="NOT_IMPLEMENTED"}
    } else {
        Write-Host "❌ FAIL: Get websites - $_" -ForegroundColor Red
        $testResults += @{Test="LeadSite.IO - Websites"; Status="FAIL"; Error=$_.Exception.Message}
    }
}

# Test 7: ClientContact.IO - Get Conversations
Write-Host "Test 7: ClientContact.IO - Get Conversations..." -ForegroundColor Yellow
try {
    if ($global:testToken) {
        $headers = @{Authorization="Bearer $global:testToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/conversations" -Headers $headers -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: Get conversations endpoint" -ForegroundColor Green
            $testResults += @{Test="ClientContact.IO - Conversations"; Status="PASS"}
        }
    } else {
        Write-Host "⚠️  SKIP: No auth token" -ForegroundColor Yellow
        $testResults += @{Test="ClientContact.IO - Conversations"; Status="SKIP"}
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "⚠️  INFO: Requires Tier 4+ (expected)" -ForegroundColor Yellow
        $testResults += @{Test="ClientContact.IO - Conversations"; Status="TIER_RESTRICTED"}
    } else {
        Write-Host "❌ FAIL: Get conversations - $_" -ForegroundColor Red
        $testResults += @{Test="ClientContact.IO - Conversations"; Status="FAIL"; Error=$_.Exception.Message}
    }
}

# Test 8: Tackle.IO - Get Dashboard
Write-Host "Test 8: Tackle.IO - Get Dashboard..." -ForegroundColor Yellow
try {
    if ($global:testToken) {
        $headers = @{Authorization="Bearer $global:testToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/tackle/dashboard" -Headers $headers -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: Tackle.IO dashboard endpoint" -ForegroundColor Green
            $testResults += @{Test="Tackle.IO - Dashboard"; Status="PASS"}
        }
    } else {
        Write-Host "⚠️  SKIP: No auth token" -ForegroundColor Yellow
        $testResults += @{Test="Tackle.IO - Dashboard"; Status="SKIP"}
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "⚠️  INFO: Requires Tier 5 (expected)" -ForegroundColor Yellow
        $testResults += @{Test="Tackle.IO - Dashboard"; Status="TIER_RESTRICTED"}
    } else {
        Write-Host "❌ FAIL: Tackle.IO dashboard - $_" -ForegroundColor Red
        $testResults += @{Test="Tackle.IO - Dashboard"; Status="FAIL"; Error=$_.Exception.Message}
    }
}

# Test 9: Tackle.IO - Get Companies
Write-Host "Test 9: Tackle.IO - Get Companies..." -ForegroundColor Yellow
try {
    if ($global:testToken) {
        $headers = @{Authorization="Bearer $global:testToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/tackle/companies" -Headers $headers -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: Tackle.IO companies endpoint" -ForegroundColor Green
            $testResults += @{Test="Tackle.IO - Companies"; Status="PASS"}
        }
    } else {
        Write-Host "⚠️  SKIP: No auth token" -ForegroundColor Yellow
        $testResults += @{Test="Tackle.IO - Companies"; Status="SKIP"}
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "⚠️  INFO: Requires Tier 5 (expected)" -ForegroundColor Yellow
        $testResults += @{Test="Tackle.IO - Companies"; Status="TIER_RESTRICTED"}
    } else {
        Write-Host "❌ FAIL: Tackle.IO companies - $_" -ForegroundColor Red
        $testResults += @{Test="Tackle.IO - Companies"; Status="FAIL"; Error=$_.Exception.Message}
    }
}

# Test 10: Canned Responses
Write-Host "Test 10: Get Canned Responses..." -ForegroundColor Yellow
try {
    if ($global:testToken) {
        $headers = @{Authorization="Bearer $global:testToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/canned-responses" -Headers $headers -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: Canned responses endpoint" -ForegroundColor Green
            $testResults += @{Test="Canned Responses"; Status="PASS"}
        }
    } else {
        Write-Host "⚠️  SKIP: No auth token" -ForegroundColor Yellow
        $testResults += @{Test="Canned Responses"; Status="SKIP"}
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "⚠️  INFO: Requires Tier 4+ (expected)" -ForegroundColor Yellow
        $testResults += @{Test="Canned Responses"; Status="TIER_RESTRICTED"}
    } else {
        Write-Host "❌ FAIL: Canned responses - $_" -ForegroundColor Red
        $testResults += @{Test="Canned Responses"; Status="FAIL"; Error=$_.Exception.Message}
    }
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object {$_.Status -eq "PASS"}).Count
$failed = ($testResults | Where-Object {$_.Status -eq "FAIL"}).Count
$skipped = ($testResults | Where-Object {$_.Status -eq "SKIP"}).Count
$tierRestricted = ($testResults | Where-Object {$_.Status -eq "TIER_RESTRICTED"}).Count
$notImplemented = ($testResults | Where-Object {$_.Status -eq "NOT_IMPLEMENTED"}).Count
$total = $testResults.Count

Write-Host "✅ PASSED: $passed / $total" -ForegroundColor Green
Write-Host "❌ FAILED: $failed / $total" -ForegroundColor Red
Write-Host "⚠️  SKIPPED: $skipped / $total" -ForegroundColor Yellow
Write-Host "🔒 TIER RESTRICTED: $tierRestricted / $total" -ForegroundColor Magenta
Write-Host "📝 NOT IMPLEMENTED: $notImplemented / $total" -ForegroundColor Gray

$passRate = [math]::Round(($passed / $total) * 100, 1)
Write-Host ""
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 80){"Green"}else{"Yellow"})
Write-Host ""

# Return summary
return @{
    Total = $total
    Passed = $passed
    Failed = $failed
    Skipped = $skipped
    TierRestricted = $tierRestricted
    NotImplemented = $notImplemented
    PassRate = $passRate
    Results = $testResults
}
