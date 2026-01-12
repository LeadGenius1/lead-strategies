# ============================================
# OPEN VERCEL - CLEAR BUILD CACHE
# Opens Vercel dashboard to clear build cache
# ============================================

Write-Host @"
============================================
   VERCEL BUILD CACHE CLEAR
============================================

Opening Vercel dashboard to clear build cache...

"@ -ForegroundColor Red

# Open Vercel dashboard
Write-Host "Opening Vercel Dashboard..." -ForegroundColor Yellow
Start-Process "https://vercel.com/dashboard"

Start-Sleep -Seconds 3

Write-Host @"

============================================
   STEP-BY-STEP INSTRUCTIONS
============================================

1. In Vercel Dashboard:
   - Select your project
   - Go to 'Settings' tab
   - Click 'General' in left sidebar
   - Scroll to 'Build & Development Settings'
   - Click 'Clear Build Cache' button
   - Confirm the action

2. After clearing cache:
   - Go to 'Deployments' tab
   - Find latest deployment (commit d46fb3d)
   - Click 3-dot menu (⋯) → 'Redeploy'
   - UNCHECK 'Use existing Build Cache'
   - Click 'Redeploy'

3. Wait 2-5 minutes for build

============================================

Full guide: FORCE_VERCEL_REBUILD.md

"@ -ForegroundColor White

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
