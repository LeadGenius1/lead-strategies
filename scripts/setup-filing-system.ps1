<#
.SYNOPSIS
    Master Database Filing System Setup - Creates 11 canonical project files.
.DESCRIPTION
    Verifies environment, creates directory structure, writes all 11 files,
    updates package.json, and runs verification.
.NOTES
    Project: AI Lead Strategies Platform
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = "lead-strategies-repo"

function Write-Phase { param($Title) Write-Host "`n$Title" -ForegroundColor Cyan }
function Write-Success { param($Msg) Write-Host "  ✅ $Msg" -ForegroundColor Green }
function Write-Created { param($Msg) Write-Host "  Created: $Msg" -ForegroundColor Gray }
function Write-Err { param($Msg) Write-Host "  ❌ $Msg" -ForegroundColor Red }

# ═══════════════════════════════════════════════════════════════════════
Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "🚀 MASTER DATABASE FILING SYSTEM SETUP" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

# PHASE 1: Verify Directory
Write-Phase "PHASE 1: Verifying Current Directory..."
$currentDir = Split-Path -Leaf (Get-Location)
if ($currentDir -ne $ProjectRoot) {
    Write-Err "Wrong directory. Run from: C:\Users\ailea\OneDrive\Documents\lead-strategies-repo"
    exit 1
}
Write-Success "Correct directory verified"

# PHASE 2: Create Directory Structure
Write-Phase "PHASE 2: Creating Directory Structure..."
$dirs = @(".cursor", ".cursor\rules", "scripts", "docs")
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
        Write-Created $d
    }
}
Write-Success "Directory structure ready"

# PHASE 3: Create 11 Files
Write-Phase "PHASE 3: Creating Master Database Files..."

# 1. PROJECT-MANIFEST.json
$manifestPath = "C:\Users\ailea\Downloads\PROJECT-MANIFEST.json"
if (Test-Path $manifestPath) {
    Copy-Item $manifestPath -Destination "PROJECT-MANIFEST.json" -Force
} else {
    Set-Content -Path "PROJECT-MANIFEST.json" -Value '{"projectName":"AI Lead Strategies Platform","version":"1.0.0","note":"Copy from Downloads/PROJECT-MANIFEST.json"}' -Encoding UTF8
}
Write-Success "PROJECT-MANIFEST.json"

# 2. .ai-tools-config.json
@'
{
  "project": "ai-lead-strategies",
  "sourceOfTruth": {
    "path": "C:\\Users\\ailea\\OneDrive\\Documents\\lead-strategies-repo",
    "manifest": "PROJECT-MANIFEST.json"
  },
  "invalidPaths": [
    "C:\\Users\\ailea\\Documents\\lead-strategies",
    "C:\\Users\\ailea\\lead-strategies-build"
  ]
}
'@ | Set-Content -Path ".ai-tools-config.json" -Encoding UTF8
Write-Success ".ai-tools-config.json"

# 3. .cursor/rules/source-of-truth.mdc
$dir = ".cursor\rules"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
---
description: Source of truth - use only lead-strategies-repo
alwaysApply: true
---

# SOURCE OF TRUTH
- **Path:** C:\Users\ailea\OneDrive\Documents\lead-strategies-repo
- **Repo:** LeadGenius1/lead-strategies
- **Branch:** main
- **DO NOT use:** C:\Users\ailea\Documents\lead-strategies, lead-strategies-build
'@ | Set-Content -Path ".cursor\rules\source-of-truth.mdc" -Encoding UTF8
Write-Success ".cursor/rules/source-of-truth.mdc"

# 4. .cursor/rules/tool-capabilities-reference.mdc
@'
---
description: Tool capabilities - Claude for planning, Cursor for implementation
alwaysApply: false
---

# TOOL CAPABILITIES REFERENCE
- **Claude:** docs/CLAUDE-CAPABILITIES.md
- **Cursor:** docs/CURSOR-CAPABILITIES.md (if present)
- **Quick Ref:** docs/QUICK-REFERENCE.md
'@ | Set-Content -Path ".cursor\rules\tool-capabilities-reference.mdc" -Encoding UTF8
Write-Success ".cursor/rules/tool-capabilities-reference.mdc"

# 5. .cursor/workspace.json
$cursorDir = ".cursor"
if (-not (Test-Path $cursorDir)) { New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null }
@'
{
  "folders": [
    {
      "path": ".",
      "name": "AI Lead Strategies (SOURCE OF TRUTH)"
    }
  ]
}
'@ | Set-Content -Path ".cursor\workspace.json" -Encoding UTF8
Write-Success ".cursor/workspace.json"

# 6. scripts/verify-source-of-truth.js
$scriptsDir = "scripts"
if (-not (Test-Path $scriptsDir)) { New-Item -ItemType Directory -Path $scriptsDir -Force | Out-Null }
$verifySot = @'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const expectedDir = path.basename(process.cwd());
if (expectedDir !== 'lead-strategies-repo') {
  console.error('Wrong directory. Run from lead-strategies-repo');
  process.exit(1);
}
const manifest = path.join(process.cwd(), 'PROJECT-MANIFEST.json');
const sot = path.join(process.cwd(), '.source-of-truth.json');
if (!fs.existsSync(manifest) && !fs.existsSync(sot)) {
  console.error('PROJECT-MANIFEST.json or .source-of-truth.json not found');
  process.exit(1);
}
console.log('SOURCE OF TRUTH VERIFIED!');
console.log('SAFE TO PROCEED WITH CHANGES!');
'@
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$PWD\scripts\verify-source-of-truth.js", $verifySot, $utf8NoBom)
Write-Success "scripts/verify-source-of-truth.js"

# 7. scripts/verify-deployment.js
$verifyDeploy = @'
#!/usr/bin/env node
const https = require('https');
const backend = 'https://api.aileadstrategies.com/health';
https.get(backend, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const j = JSON.parse(data);
      if (j.status === 'ok') {
        console.log('Backend HEALTHY:', backend);
      } else {
        console.log('Backend responded:', JSON.stringify(j));
      }
    } catch (e) {
      console.log('Could not parse response');
    }
  });
}).on('error', (e) => console.error('Backend unreachable:', e.message));
'@
[System.IO.File]::WriteAllText("$PWD\scripts\verify-deployment.js", $verifyDeploy, $utf8NoBom)
Write-Success "scripts/verify-deployment.js"

# 8. scripts/cleanup-duplicates.js
$cleanupDup = @'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const invalidPaths = [
  'C:\\Users\\ailea\\Documents\\lead-strategies',
  'C:\\Users\\ailea\\lead-strategies-build'
];
console.log('Checking for duplicate codebases...');
invalidPaths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log('  Found:', p, '(consider archiving/deleting)');
  } else {
    console.log('  Not found:', p);
  }
});
console.log('Run with --execute to archive (not implemented - manual step)');
'@
[System.IO.File]::WriteAllText("$PWD\scripts\cleanup-duplicates.js", $cleanupDup, $utf8NoBom)
Write-Success "scripts/cleanup-duplicates.js"

# 9. docs/FILING-SYSTEM.md
$docsDir = "docs"
if (-not (Test-Path $docsDir)) { New-Item -ItemType Directory -Path $docsDir -Force | Out-Null }
@'
# Master Database Filing System

## Overview
Canonical project structure for AI Lead Strategies Platform. 11 files total.

## File Inventory (11)

| # | Path | Purpose |
|---|------|---------|
| 1 | PROJECT-MANIFEST.json | Full project manifest |
| 2 | .ai-tools-config.json | AI tools configuration |
| 3 | .cursor/rules/source-of-truth.mdc | Source-of-truth rule |
| 4 | .cursor/rules/tool-capabilities-reference.mdc | Tool reference |
| 5 | .cursor/workspace.json | Workspace config |
| 6 | scripts/verify-source-of-truth.js | SOT verification |
| 7 | scripts/verify-deployment.js | Deployment check |
| 8 | scripts/cleanup-duplicates.js | Duplicate check |
| 9 | docs/FILING-SYSTEM.md | This file |
| 10 | docs/QUICK-REFERENCE.md | Quick reference |
| 11 | docs/CLAUDE-CAPABILITIES.md | Claude reference |

## Usage
- Run: .\setup-filing-system.ps1
- Verify: npm run verify
- Cleanup check: npm run cleanup:check
'@ | Set-Content -Path "docs\FILING-SYSTEM.md" -Encoding UTF8
Write-Success "docs/FILING-SYSTEM.md"

# 10. docs/QUICK-REFERENCE.md
@'
# Quick Reference

## Source of Truth
- Path: C:\Users\ailea\OneDrive\Documents\lead-strategies-repo
- Repo: LeadGenius1/lead-strategies
- Branch: main

## Production
- Backend: https://api.aileadstrategies.com
- Frontend: https://aileadstrategies.com

## Deploy
git add . && git commit -m "msg" && git push origin main
'@ | Set-Content -Path "docs\QUICK-REFERENCE.md" -Encoding UTF8
Write-Success "docs/QUICK-REFERENCE.md"

# 11. docs/CLAUDE-CAPABILITIES.md - preserve if exists, else create stub
if (-not (Test-Path "docs\CLAUDE-CAPABILITIES.md")) {
    @'
# Claude AI Capabilities
Use @docs/CLAUDE-CAPABILITIES.md when prompting. Copy full content from Downloads/CLAUDE-CAPABILITIES.md if needed.
'@ | Set-Content -Path "docs\CLAUDE-CAPABILITIES.md" -Encoding UTF8
}
Write-Success "docs/CLAUDE-CAPABILITIES.md"

# PHASE 4: Update package.json
Write-Phase "PHASE 4: Updating package.json scripts..."
$pkgPath = "package.json"
if (Test-Path $pkgPath) {
    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
    $pkg.scripts | Add-Member -MemberType NoteProperty -Name "verify" -Value "node scripts/verify-source-of-truth.js && node scripts/verify-deployment.js" -Force
    $pkg.scripts | Add-Member -MemberType NoteProperty -Name "cleanup:check" -Value "node scripts/cleanup-duplicates.js" -Force
    $json = $pkg | ConvertTo-Json -Depth 50
    $json | Set-Content -Path $pkgPath -Encoding UTF8
    Write-Success "package.json updated"
} else {
    Write-Err "package.json not found"
}

# PHASE 5: Run Verification
Write-Phase "PHASE 5: Running Verification..."
Write-Host "`nVerifying Source of Truth..." -ForegroundColor Cyan
try {
    node scripts/verify-source-of-truth.js
} catch {
    Write-Err "Verification script failed"
}

# Completion
$bar = [char]10 + '================================================================='
Write-Host $bar -ForegroundColor Magenta
Write-Host 'SETUP COMPLETE!' -ForegroundColor Magenta
Write-Host $bar -ForegroundColor Magenta
Write-Host ""
Write-Host 'NEXT STEPS:' -ForegroundColor Yellow
Write-Host '1. Restart Cursor to activate new rules'
Write-Host '2. Run: npm run verify'
Write-Host '3. Run: npm run cleanup:check'
Write-Host '4. Commit and push per deployment workflow'
Write-Host '5. Deploy: git push origin main'
Write-Host ""
