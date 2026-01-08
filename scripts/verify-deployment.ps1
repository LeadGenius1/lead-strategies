# Deployment Verification Script
# Verifies that all components are working correctly

Write-Host "🔍 Verifying Deployment..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://superb-possibility-production.up.railway.app"
$errors = 0
$passed = 0

# Test 1: Health Check
Write-Host "Testing Health Check..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 10
    $data = $response.Content | ConvertFrom-Json
    if ($data.status -eq "ok") {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "   Frontend: $($data.frontend)" -ForegroundColor Gray
        Write-Host "   Backend: $($data.backend)" -ForegroundColor Gray
        Write-Host "   Backend URL: $($data.backendUrl)" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $errors++
}

# Test 2: Check Environment Variables
Write-Host "`nChecking Environment Variables..." -NoNewline
try {
    $vars = railway variables 2>&1
    $hasRailwayApi = $vars -match "RAILWAY_API_URL"
    $hasNextPublicUrl = $vars -match "NEXT_PUBLIC_URL"
    
    if ($hasRailwayApi -and $hasNextPublicUrl) {
        Write-Host " ✅" -ForegroundColor Green
        $passed++
    } else {
        Write-Host " ⚠️" -ForegroundColor Yellow
        Write-Host "   RAILWAY_API_URL: $(if ($hasRailwayApi) { 'Set' } else { 'Missing' })" -ForegroundColor Gray
        Write-Host "   NEXT_PUBLIC_URL: $(if ($hasNextPublicUrl) { 'Set' } else { 'Missing' })" -ForegroundColor Gray
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $errors++
}

# Test 3: Check Railway Status
Write-Host "`nChecking Railway Status..." -NoNewline
try {
    $status = railway status 2>&1
    if ($status -match "production") {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "   $status" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host " ⚠️" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $errors++
}

# Test 4: Check Domain DNS
Write-Host "`nChecking Domain DNS (aileadstrategies.com)..." -NoNewline
try {
    $dns = nslookup aileadstrategies.com 2>&1 | Select-String -Pattern "Address" | Select-Object -First 1
    if ($dns) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "   $dns" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host " ⚠️" -ForegroundColor Yellow
        Write-Host "   DNS may not be fully propagated" -ForegroundColor Gray
    }
} catch {
    Write-Host " ⚠️" -ForegroundColor Yellow
    Write-Host "   Could not verify DNS" -ForegroundColor Gray
}

# Test 5: Check GitHub Remote
Write-Host "`nChecking GitHub Remote..." -NoNewline
try {
    $remote = git remote -v 2>&1 | Select-String -Pattern "github.com"
    if ($remote) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "   $remote" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host " ⚠️" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $errors++
}

# Summary
Write-Host "`n" + ("="*50) -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host ("="*50) -ForegroundColor Cyan
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errors -eq 0) {
    Write-Host "🎉 All checks passed! Deployment is ready." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some checks failed. Please review the errors above." -ForegroundColor Yellow
}

Write-Host "`nFrontend URL: $baseUrl" -ForegroundColor Cyan
Write-Host "Custom Domain: https://aileadstrategies.com" -ForegroundColor Cyan
Write-Host "GitHub: https://github.com/LeadGenius1/lead-strategies" -ForegroundColor Cyan
