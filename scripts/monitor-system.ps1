# Comprehensive System Monitoring Script
# Tests all critical functions and systems

param(
    [string]$BackendUrl = "https://api.leadsite.ai",
    [string]$FrontendUrl = "https://leadsite.ai",
    [switch]$Local,
    [switch]$Verbose
)

if ($Local) {
    $BackendUrl = "http://localhost:3001"
    $FrontendUrl = "http://localhost:3000"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SYSTEM MONITORING & HEALTH CHECKS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @()

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        $status = "✅ PASS"
        $message = "Success"
        
        if ($Verbose) {
            Write-Host "  Response: $($response | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor Gray
        }
        
        return @{
            Status = $status
            Message = $message
            Data = $response
        }
    }
    catch {
        $status = "❌ FAIL"
        $message = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $message = "HTTP $statusCode : $message"
        }
        
        return @{
            Status = $status
            Message = $message
            Data = $null
        }
    }
}

# 1. Backend Health Check
Write-Host "[1/8] Testing Backend Health..." -ForegroundColor Yellow
$healthResult = Test-Endpoint -Name "Backend Health" -Url "$BackendUrl/api/v1/health"
$results += [PSCustomObject]@{
    Test = "Backend Health"
    Status = $healthResult.Status
    Message = $healthResult.Message
    URL = "$BackendUrl/api/v1/health"
}
Write-Host "  $($healthResult.Status) - $($healthResult.Message)" -ForegroundColor $(if ($healthResult.Status -eq "✅ PASS") { "Green" } else { "Red" })

if ($healthResult.Data) {
    Write-Host "    Status: $($healthResult.Data.status)" -ForegroundColor Gray
    if ($healthResult.Data.services) {
        Write-Host "    Services:" -ForegroundColor Gray
        $healthResult.Data.services.PSObject.Properties | ForEach-Object {
            Write-Host "      - $($_.Name): $($_.Value.status)" -ForegroundColor Gray
        }
    }
}

# 2. Backend Services Check (via /api/v1/health which includes Redis)
Write-Host "`n[2/8] Testing Backend Services..." -ForegroundColor Yellow
$detailedHealthResult = Test-Endpoint -Name "Backend Detailed Health" -Url "$BackendUrl/api/v1/health"
$results += [PSCustomObject]@{
    Test = "Backend Services"
    Status = $detailedHealthResult.Status
    Message = $detailedHealthResult.Message
    URL = "$BackendUrl/api/v1/health"
}
Write-Host "  $($detailedHealthResult.Status) - $($detailedHealthResult.Message)" -ForegroundColor $(if ($detailedHealthResult.Status -eq "✅ PASS") { "Green" } else { "Red" })

if ($detailedHealthResult.Data -and $detailedHealthResult.Data.redis) {
    $redisStatus = $detailedHealthResult.Data.redis.status
    $color = if ($redisStatus -eq "healthy") { "Green" } elseif ($redisStatus -eq "unavailable") { "Yellow" } else { "Red" }
    Write-Host "    Redis: $redisStatus" -ForegroundColor $color
    if ($detailedHealthResult.Data.redis.latency) {
        Write-Host "      Latency: $($detailedHealthResult.Data.redis.latency)" -ForegroundColor Gray
    }
}

# 3. Database Connectivity (via health endpoint)
Write-Host "`n[3/8] Testing Database Connectivity..." -ForegroundColor Yellow
if ($healthResult.Data -and $healthResult.Data.services -and $healthResult.Data.services.database) {
    $dbStatus = $healthResult.Data.services.database.status
    $dbMessage = if ($dbStatus -eq "healthy") { "Connected" } else { "Not connected" }
    $results += [PSCustomObject]@{
        Test = "Database Connectivity"
        Status = if ($dbStatus -eq "healthy") { "✅ PASS" } else { "❌ FAIL" }
        Message = $dbMessage
        URL = "Via Health Endpoint"
    }
    Write-Host "  $(if ($dbStatus -eq "healthy") { "✅ PASS" } else { "❌ FAIL" }) - $dbMessage" -ForegroundColor $(if ($dbStatus -eq "healthy") { "Green" } else { "Red" })
}
else {
    $results += [PSCustomObject]@{
        Test = "Database Connectivity"
        Status = "⚠️  SKIP"
        Message = "Health endpoint did not return database status"
        URL = "N/A"
    }
    Write-Host "  ⚠️  SKIP - Health endpoint did not return database status" -ForegroundColor Yellow
}

# 4. Redis Connectivity (via health endpoint)
Write-Host "`n[4/8] Testing Redis Connectivity..." -ForegroundColor Yellow
if ($healthResult.Data -and $healthResult.Data.services -and $healthResult.Data.services.redis) {
    $redisStatus = $healthResult.Data.services.redis.status
    $redisMessage = if ($redisStatus -eq "healthy") { "Connected" } else { "Not connected (using fallback)" }
    $results += [PSCustomObject]@{
        Test = "Redis Connectivity"
        Status = if ($redisStatus -eq "healthy") { "✅ PASS" } else { "⚠️  WARN" }
        Message = $redisMessage
        URL = "Via Health Endpoint"
    }
    Write-Host "  $(if ($redisStatus -eq "healthy") { "✅ PASS" } else { "⚠️  WARN" }) - $redisMessage" -ForegroundColor $(if ($redisStatus -eq "healthy") { "Green" } else { "Yellow" })
}
else {
    $results += [PSCustomObject]@{
        Test = "Redis Connectivity"
        Status = "⚠️  SKIP"
        Message = "Health endpoint did not return Redis status"
        URL = "N/A"
    }
    Write-Host "  ⚠️  SKIP - Health endpoint did not return Redis status" -ForegroundColor Yellow
}

# 5. Frontend API Route (Signup endpoint exists)
Write-Host "`n[5/8] Testing Frontend API Routes..." -ForegroundColor Yellow
try {
    # Test if frontend is accessible (this would require actual frontend URL)
    $frontendResult = Test-Endpoint -Name "Frontend Root" -Url $FrontendUrl
    $results += [PSCustomObject]@{
        Test = "Frontend Accessibility"
        Status = $frontendResult.Status
        Message = $frontendResult.Message
        URL = $FrontendUrl
    }
    Write-Host "  $($frontendResult.Status) - $($frontendResult.Message)" -ForegroundColor $(if ($frontendResult.Status -eq "✅ PASS") { "Green" } else { "Red" })
}
catch {
    $results += [PSCustomObject]@{
        Test = "Frontend Accessibility"
        Status = "⚠️  SKIP"
        Message = "Frontend URL not accessible (may require browser)"
        URL = $FrontendUrl
    }
    Write-Host "  ⚠️  SKIP - Frontend requires browser access" -ForegroundColor Yellow
}

# 6. Authentication Endpoints (Test structure only - requires auth)
Write-Host "`n[6/8] Testing Authentication Endpoints..." -ForegroundColor Yellow
try {
    # Test signup endpoint structure (will fail without body, but confirms endpoint exists)
    $authResult = Test-Endpoint -Name "Signup Endpoint" -Url "$BackendUrl/api/auth/signup" -Method "POST" -Body '{}'
    $authStatus = if ($authResult.Message -like "*400*" -or $authResult.Message -like "*Missing*") { "✅ PASS" } else { "❌ FAIL" }
    $authMessage = if ($authResult.Message -like "*400*" -or $authResult.Message -like "*Missing*") { "Endpoint exists (returns validation error as expected)" } else { $authResult.Message }
    $results += [PSCustomObject]@{
        Test = "Authentication Endpoints"
        Status = $authStatus
        Message = $authMessage
        URL = "$BackendUrl/api/auth/signup"
    }
    Write-Host "  $authStatus - $authMessage" -ForegroundColor $(if ($authStatus -eq "✅ PASS") { "Green" } else { "Red" })
}
catch {
    $results += [PSCustomObject]@{
        Test = "Authentication Endpoints"
        Status = "❌ FAIL"
        Message = $_.Exception.Message
        URL = "$BackendUrl/api/auth/signup"
    }
    Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# 7. API Routes Structure
Write-Host "`n[7/8] Testing API Routes Structure..." -ForegroundColor Yellow
$apiRoutes = @(
    "/api/auth/login",
    "/api/auth/me",
    "/api/leads",
    "/api/campaigns",
    "/api/conversations"
)

$routesWorking = 0
foreach ($route in $apiRoutes) {
    try {
        $routeResult = Test-Endpoint -Name "Route $route" -Url "$BackendUrl$route" -Method "GET"
        if ($routeResult.Message -like "*401*" -or $routeResult.Message -like "*403*" -or $routeResult.Message -like "*404*") {
            $routesWorking++
        }
    }
    catch {
        # Ignore errors - just checking if routes exist
    }
}

$routesStatus = if ($routesWorking -gt 0) { "✅ PASS" } else { "⚠️  WARN" }
$routesMessage = "$routesWorking/$($apiRoutes.Count) routes accessible (auth required for most)"
$results += [PSCustomObject]@{
    Test = "API Routes Structure"
    Status = $routesStatus
    Message = $routesMessage
    URL = "Multiple routes tested"
}
Write-Host "  $routesStatus - $routesMessage" -ForegroundColor $(if ($routesStatus -eq "✅ PASS") { "Green" } else { "Yellow" })

# 8. Summary
Write-Host "`n[8/8] Generating Summary Report..." -ForegroundColor Yellow

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  MONITORING SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.Status -eq "✅ PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "❌ FAIL" }).Count
$warnings = ($results | Where-Object { $_.Status -like "⚠️*" }).Count

Write-Host "Total Tests: $($results.Count)" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "White" })
Write-Host "⚠️  Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "White" })

Write-Host "`nDetailed Results:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

# Save results to file
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$resultsFile = "monitoring-results-$timestamp.json"
$results | ConvertTo-Json -Depth 3 | Out-File $resultsFile -Encoding UTF8
Write-Host "`nResults saved to: $resultsFile" -ForegroundColor Gray

# Return exit code
if ($failed -gt 0) {
    exit 1
}
else {
    exit 0
}
