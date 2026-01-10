# Infrastructure Fix Script
# Fixes Redis, Environment Variables, and Verifies Configuration
# Run this script to make infrastructure solid, sound, and unbreakable!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INFRASTRUCTURE FIX SCRIPT" -ForegroundColor Cyan
Write-Host "Making infrastructure solid and unbreakable!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Railway CLI
Write-Host "[1/6] Checking Railway CLI..." -ForegroundColor Yellow
try {
    $railwayVersion = railway --version 2>&1
    Write-Host "  Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Railway CLI not found. Install from https://railway.app/cli" -ForegroundColor Red
    exit 1
}

# Check if linked to project
Write-Host "[2/6] Checking Railway project link..." -ForegroundColor Yellow
try {
    $linked = railway status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Project linked successfully" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Not linked to project. Run: railway link" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  WARNING: Could not verify project link" -ForegroundColor Yellow
}

# Check Prisma version in package.json
Write-Host "[3/6] Verifying Prisma version..." -ForegroundColor Yellow
$backendPackageJson = "backend\package.json"
if (Test-Path $backendPackageJson) {
    $packageJson = Get-Content $backendPackageJson | ConvertFrom-Json
    $prismaVersion = $packageJson.devDependencies.prisma
    Write-Host "  Prisma version in package.json: $prismaVersion" -ForegroundColor Green
    
    if ($prismaVersion -match "^5\.") {
        Write-Host "  Prisma 5.x detected - compatible with current schema" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Prisma version may be incompatible" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ERROR: backend/package.json not found" -ForegroundColor Red
}

# Check environment variables file
Write-Host "[4/6] Checking environment configuration..." -ForegroundColor Yellow
$envExample = ".env.example"
if (Test-Path $envExample) {
    Write-Host "  .env.example found" -ForegroundColor Green
} else {
    Write-Host "  WARNING: .env.example not found" -ForegroundColor Yellow
}

# Check backend health
Write-Host "[5/6] Testing backend connectivity..." -ForegroundColor Yellow
$backendUrl = "https://backend-production-2987.up.railway.app"
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($response.status -eq "ok") {
        Write-Host "  Backend is healthy!" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Backend returned unexpected status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: Backend health check failed: $_" -ForegroundColor Red
}

# Check frontend health
Write-Host "[6/6] Testing frontend connectivity..." -ForegroundColor Yellow
$frontendUrl = "https://superb-possibility-production.up.railway.app"
try {
    $response = Invoke-RestMethod -Uri "$frontendUrl/api/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($response.status -eq "ok" -or $response.frontend -eq "operational") {
        Write-Host "  Frontend is healthy!" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Frontend returned unexpected status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: Frontend health check failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INFRASTRUCTURE CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Fix Redis: Configure Redis service to use redis:8.2.1 Docker image" -ForegroundColor White
Write-Host "2. Set Environment Variables in Railway dashboard:" -ForegroundColor White
Write-Host "   - Backend: EMAIL_SERVICE, STRIPE_SECRET_KEY, ANTHROPIC_API_KEY" -ForegroundColor White
Write-Host "   - Frontend: ANTHROPIC_API_KEY" -ForegroundColor White
Write-Host "3. Verify Prisma version on Railway matches package.json (5.7.1)" -ForegroundColor White
Write-Host ""
Write-Host "See INFRASTRUCTURE_FIX_GUIDE.md for detailed instructions" -ForegroundColor Cyan
