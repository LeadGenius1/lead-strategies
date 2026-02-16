# ============================================================
# REPO CLEANUP SCRIPT — AI Lead Strategies LLC
# Run from: C:\Users\ailea\OneDrive\Documents\lead-strategies-repo
# ============================================================
# This script:
# 1. Creates organized folder structure
# 2. Moves scattered docs into proper folders
# 3. Removes stray folders that don't belong
# 4. Updates .gitignore
# ============================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  REPO CLEANUP — AI Lead Strategies" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verify we're in the right directory
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Not in a git repo! cd to lead-strategies-repo first." -ForegroundColor Red
    exit 1
}

# -----------------------------------------------------------
# STEP 1: Create organized folder structure
# -----------------------------------------------------------
Write-Host "STEP 1: Creating folder structure..." -ForegroundColor Yellow

$folders = @(
    "docs/architecture",
    "docs/deployment",
    "docs/audits",
    "docs/guides",
    "docs/archive"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  Created: $folder" -ForegroundColor Green
    }
}

# -----------------------------------------------------------
# STEP 2: Move root-level docs into organized folders
# -----------------------------------------------------------
Write-Host "`nSTEP 2: Organizing documents..." -ForegroundColor Yellow

# Architecture & Status docs → docs/architecture
$archDocs = @(
    "AI-Lead-Strategies-Platform-Status.md",
    "CRITICAL_ARCHITECTURE_AND_INCIDENT_REPORT.md",
    "PLATFORM_AUDIT_REPORT.md",
    "PLATFORM_STATUS_CHART.md",
    "PRODUCTION_READINESS_STATUS.md",
    "PRODUCTION_SYSTEM_AUDIT_1M_USERS.md",
    "PROJECT-MANIFEST.json",
    ".source-of-truth.json",
    ".ai-tools-config.json"
)

# Deployment docs → docs/deployment  
$deployDocs = @(
    "DEPLOYMENT-STATUS.md",
    "DEPLOYMENT_COMPLETE.md",
    "DEPLOYMENT_STATUS.md",
    "DEPLOYMENT_VERIFICATION.md",
    "RAILWAY-502-FIX.md",
    "RAILWAY-DEPLOYMENT-FIXED.md",
    "RAILWAY-ROOT-DIRECTORY-FIX.md",
    "PRISMA_SCHEMA_PUSH.md"
)

# Audit & report docs → docs/audits
$auditDocs = @(
    "FINAL_REPORT.md",
    "PRICING_AUDIT.md",
    "PRICING_CHANGES_FEB2026.md",
    "PROFILE_TO_SETTINGS_CHANGES.md",
    "PROJECT_EXECUTION_LOG.md",
    "SYSTEM_DIAGNOSTICS_REPORT.md",
    "TWO_TIER_EMAIL_DELIVERY_AUDIT.md",
    "VALIDATION_REPORT.md",
    "STRIPE_POOL_SETUP.md",
    "3-PLATFORM-TEST-RESULTS.md"
)

# Setup guides → docs/guides
$guideDocs = @(
    "3-CLICK-ONBOARDING.md",
    "ONBOARDING-COMPLETE.md",
    "GOOGLE_EMAIL_OAUTH_SETUP.md",
    "MICROSOFT_EMAIL_OAUTH_SETUP.md",
    "README-FRONTEND.md"
)

function Move-Docs($docs, $dest) {
    foreach ($doc in $docs) {
        if (Test-Path $doc) {
            Move-Item $doc $dest -Force
            Write-Host "  Moved: $doc -> $dest" -ForegroundColor Green
        }
    }
}

Move-Docs $archDocs "docs/architecture"
Move-Docs $deployDocs "docs/deployment"
Move-Docs $auditDocs "docs/audits"
Move-Docs $guideDocs "docs/guides"

# -----------------------------------------------------------
# STEP 3: Remove folders that don't belong in the repo
# -----------------------------------------------------------
Write-Host "`nSTEP 3: Removing stray folders..." -ForegroundColor Yellow

# These are accidental copies of system folders — NOT project code
$strayFolders = @(
    "Downloads",
    "OneDrive"
)

foreach ($folder in $strayFolders) {
    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force
        Write-Host "  Removed: $folder/ (not project code)" -ForegroundColor Green
    }
}

# -----------------------------------------------------------
# STEP 4: Clean up redundant scripts
# -----------------------------------------------------------
Write-Host "`nSTEP 4: Cleaning up root scripts..." -ForegroundColor Yellow

# Move loose scripts to scripts/
$looseScripts = @(
    "backup-now.bat",
    "setup-filing-system.ps1",
    "start-standalone.js",
    "start.js"
)

foreach ($script in $looseScripts) {
    if (Test-Path $script) {
        Move-Item $script "scripts/" -Force
        Write-Host "  Moved: $script -> scripts/" -ForegroundColor Green
    }
}

# -----------------------------------------------------------
# STEP 5: Summary
# -----------------------------------------------------------
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your repo root should now be CLEAN:" -ForegroundColor White
Write-Host "  CLAUDE.md          <- Claude Code reads this" -ForegroundColor White
Write-Host "  README.md          <- (create one if needed)" -ForegroundColor White
Write-Host "  package.json       <- Frontend deps" -ForegroundColor White
Write-Host "  app/               <- Next.js pages" -ForegroundColor White
Write-Host "  backend/            <- Express API" -ForegroundColor White
Write-Host "  components/         <- React components" -ForegroundColor White
Write-Host "  lib/               <- Shared utilities" -ForegroundColor White
Write-Host "  prisma/            <- Frontend Prisma schema" -ForegroundColor White
Write-Host "  public/            <- Static assets" -ForegroundColor White
Write-Host "  docs/              <- All documentation (organized)" -ForegroundColor White
Write-Host "  scripts/           <- All scripts" -ForegroundColor White
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Review changes:  git status" -ForegroundColor White
Write-Host "  2. Stage all:       git add -A" -ForegroundColor White
Write-Host "  3. Commit:          git commit -m 'chore: organize repo structure and clean up root'" -ForegroundColor White
Write-Host "  4. Push:            git push origin main" -ForegroundColor White
Write-Host ""
