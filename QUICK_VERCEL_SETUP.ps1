# ============================================
# QUICK VERCEL SETUP ASSISTANT
# Opens Vercel dashboard and provides setup instructions
# ============================================

Write-Host @"
============================================
   VERCEL ENVIRONMENT VARIABLES SETUP
============================================

This script will help you complete the final step:
Setting environment variables in Vercel Dashboard

"@ -ForegroundColor Cyan

Write-Host "Opening Vercel Dashboard..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "https://vercel.com/dashboard"

Write-Host @"

============================================
   STEP-BY-STEP INSTRUCTIONS
============================================

1. In Vercel Dashboard:
   - Find your frontend project
   - Click 'Settings' tab
   - Click 'Environment Variables' in left sidebar

2. Add/Update these 3 variables:

   Variable 1: NEXT_PUBLIC_API_URL
   - Value: https://backend-wheat-beta-15.vercel.app
   - Environments: Production, Preview, Development
   
   Variable 2: RAILWAY_API_URL
   - Value: https://backend-wheat-beta-15.vercel.app
   - Environments: Production, Preview, Development
   
   Variable 3: NODE_ENV
   - Value: production
   - Environments: Production only

3. After saving variables:
   - Go to 'Deployments' tab
   - Click 3-dot menu on latest deployment
   - Click 'Redeploy'
   - UNCHECK 'Use existing Build Cache'
   - Click 'Redeploy'

4. Wait 2-5 minutes for deployment

"@ -ForegroundColor White

Write-Host "Press ENTER after you've completed the Vercel setup..." -ForegroundColor Green
Read-Host

# Run verification
Write-Host "`nRunning verification script..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$scriptPath = Join-Path $PSScriptRoot "VERIFY_DEPLOYMENT.ps1"
if (Test-Path $scriptPath) {
    & $scriptPath
} else {
    Write-Host "Verification script not found. Running quick test..." -ForegroundColor Yellow
    
    # Quick test
    Write-Host "`nTesting backend connection..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://backend-wheat-beta-15.vercel.app/health" -UseBasicParsing -TimeoutSec 10
        Write-Host "  [OK] Backend is accessible" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Backend not accessible" -ForegroundColor Red
    }
    
    Write-Host "`nTesting frontend → backend..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://leadsite.ai/api/health" -UseBasicParsing -TimeoutSec 15
        Write-Host "  [OK] Frontend can reach backend" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Frontend cannot reach backend - check environment variables" -ForegroundColor Red
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
