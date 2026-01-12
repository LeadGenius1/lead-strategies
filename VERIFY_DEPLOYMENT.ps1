# ============================================
# DEPLOYMENT VERIFICATION SCRIPT
# Verifies backend connection after deployment
# ============================================

Write-Host @"
============================================
   DEPLOYMENT VERIFICATION
============================================

This script will verify:
- Backend is accessible
- Frontend can reach backend
- Environment variables are correct
- All domains are working

"@ -ForegroundColor Cyan

$backendUrl = "https://backend-wheat-beta-15.vercel.app"
$domains = @(
    "aileadstrategies.com",
    "leadsite.ai",
    "leadsite.io",
    "videosite.ai",
    "clientcontact.io"
)

$allPassed = $true

# Test 1: Backend Health
Write-Host "`n[TEST 1] Backend Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  [OK] Backend is accessible" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Backend returned status $($response.StatusCode)" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  [ERROR] Backend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 2: Frontend → Backend API Connection
Write-Host "`n[TEST 2] Frontend → Backend API Connection..." -ForegroundColor Yellow
foreach ($domain in $domains) {
    Write-Host "  Testing $domain..." -NoNewline -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://$domain/api/health" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            if ($content -like "*status*" -or $content -like "*ok*") {
                Write-Host " [OK]" -ForegroundColor Green
            } else {
                Write-Host " [WARN] Response unclear" -ForegroundColor Yellow
            }
        } else {
            Write-Host " [FAIL] Status $($response.StatusCode)" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host " [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

# Test 3: Check for Wrong Backend URL
Write-Host "`n[TEST 3] Checking for Wrong Backend URLs..." -ForegroundColor Yellow
Write-Host "  Checking if frontend is trying to connect to api.leadsite.ai..." -ForegroundColor White

$wrongUrls = @("api.leadsite.ai", "tackleai.ai", "backend-production-2987.up.railway.app")
$foundWrongUrl = $false

foreach ($domain in $domains) {
    try {
        $response = Invoke-WebRequest -Uri "https://$domain/api/health" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $content = $response.Content
        
        foreach ($wrongUrl in $wrongUrls) {
            if ($content -like "*$wrongUrl*") {
                Write-Host "  [WARN] $domain may be using wrong backend URL: $wrongUrl" -ForegroundColor Yellow
                $foundWrongUrl = $true
            }
        }
    } catch {
        # Ignore errors for this check
    }
}

if (-not $foundWrongUrl) {
    Write-Host "  [OK] No wrong backend URLs detected" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Some domains may still be using old backend URLs" -ForegroundColor Yellow
    Write-Host "  Action: Update NEXT_PUBLIC_API_URL in Vercel environment variables" -ForegroundColor Yellow
}

# Summary
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   VERIFICATION RESULTS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($allPassed -and -not $foundWrongUrl) {
    Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "Your deployment is working correctly!" -ForegroundColor Green
} elseif ($allPassed) {
    Write-Host "⚠️  MOSTLY WORKING" -ForegroundColor Yellow
    Write-Host "Backend connection works, but check environment variables in Vercel" -ForegroundColor Yellow
} else {
    Write-Host "❌ ISSUES DETECTED" -ForegroundColor Red
    Write-Host "Some tests failed. Check the errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Action Required:" -ForegroundColor Yellow
    Write-Host "1. Update NEXT_PUBLIC_API_URL in Vercel" -ForegroundColor White
    Write-Host "2. Update RAILWAY_API_URL in Vercel" -ForegroundColor White
    Write-Host "3. Redeploy frontend without cache" -ForegroundColor White
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host ""

# Open Vercel dashboard
Write-Host "Opening Vercel Dashboard for environment variable setup..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "https://vercel.com/dashboard"

Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
