# AI Lead Strategies - Auto Backup Script
# Automatically syncs platform backup to OneDrive and Google Drive
# Triggered on git commits or manual execution

param(
    [switch]$Force,
    [switch]$Verbose
)

# Configuration
$ProjectRoot = "C:\Users\ailea\.cursor\worktrees\PROJECT_2"
$LHCRoot = "$ProjectRoot\lhc"
$BackupFileName = "COMPLETE-PLATFORM-BACKUP-LATEST.md"
$TimestampedBackupName = "COMPLETE-PLATFORM-BACKUP-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').md"

# Backup destinations
$Destinations = @(
    "$ProjectRoot\$BackupFileName",
    "C:\Users\ailea\OneDrive\Documents\$BackupFileName",
    "G:\My Drive\$BackupFileName"
)

# Archive destinations (timestamped backups)
$ArchiveDestinations = @(
    "C:\Users\ailea\OneDrive\Documents\AI-Lead-Strategies-Backups",
    "G:\My Drive\AI-Lead-Strategies-Backups"
)

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "INFO" { "White" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Get-FileHash256 {
    param([string]$Path)
    if (Test-Path $Path) {
        return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
    }
    return $null
}

function Generate-BackupContent {
    Write-Log "Generating backup content from current codebase..."
    
    $backupContent = @"
# AI Lead Strategies - Complete Platform Backup
## Railway Frontend Codebase
### Auto-Generated Backup: $(Get-Date -Format "MMMM dd, yyyy 'at' HH:mm:ss")
### Last Git Commit: $(git -C $LHCRoot log -1 --format="%H - %s" 2>$null)

---

## Quick Recovery Reference

**Railway Project:** strong-communication
**Railway Service:** superb-possibility
**Primary Domain:** https://aileadstrategies.com
**API Domain:** https://api.aileadstrategies.com
**Database:** PostgreSQL on Railway

---

## Environment Variables

``````json
{
  "ADMIN_JWT_SECRET": "QH87JKf4ZhNEFDXriPolSsOBcwUjMnGAvy5kIR6amdu0gV9p3xWeLYt1CTqzb2",
  "CORS_ORIGINS": "https://aileadstrategies.com,https://www.aileadstrategies.com,https://tackleai.ai",
  "DATABASE_URL": "postgresql://postgres:UoEdmdhelexwzWLhphExkiaHXrRUXQCQ@switchyard.proxy.rlwy.net:32069/railway",
  "ENABLE_SELF_HEALING": "true",
  "JWT_EXPIRES_IN": "24h",
  "JWT_SECRET": "RQS6IYuv49CVofGeJtrzkmU7K2xW5ZFOiahp0PgjH1lq3sBTyEMN8wXAndcLDb",
  "NEXTAUTH_SECRET": "zR73jCdmiYvWx5gqtZuFDPyHLk4ASalo1OIXG8hE9w0TVncsQpbrMKJNBf2Ue6",
  "NEXTAUTH_URL": "https://aileadstrategies.com",
  "NEXT_PUBLIC_API_URL": "https://api.aileadstrategies.com",
  "NEXT_PUBLIC_URL": "https://aileadstrategies.com",
  "NODE_ENV": "production",
  "PORT": "3000",
  "RAILWAY_API_URL": "https://api.aileadstrategies.com",
  "RAILWAY_ENVIRONMENT": "production",
  "RAILWAY_ENVIRONMENT_ID": "ee1b295d-6efb-4a1f-93b8-8a5f6b73deac",
  "RAILWAY_ENVIRONMENT_NAME": "production",
  "RAILWAY_PRIVATE_DOMAIN": "superb-possibility.railway.internal",
  "RAILWAY_PROJECT_ID": "fc3a1567-b76f-4ba1-9e5c-b288b16854e9",
  "RAILWAY_PROJECT_NAME": "strong-communication",
  "RAILWAY_PUBLIC_DOMAIN": "aileadstrategies.com",
  "RAILWAY_SERVICE_ID": "6356e560-260f-4311-b92f-022ddc4e39e5",
  "RAILWAY_SERVICE_NAME": "superb-possibility"
}
``````

---

## Current File Structure

``````
$(Get-ChildItem -Path $LHCRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.git|\.next|package-lock|AppData|OneDrive|Downloads" } | ForEach-Object { $_.FullName.Replace($LHCRoot, "lhc") } | Sort-Object)
``````

---

## Core Configuration Files

### package.json

``````json
$(Get-Content "$LHCRoot\package.json" -Raw -ErrorAction SilentlyContinue)
``````

### next.config.js

``````javascript
$(Get-Content "$LHCRoot\next.config.js" -Raw -ErrorAction SilentlyContinue)
``````

### tailwind.config.js

``````javascript
$(Get-Content "$LHCRoot\tailwind.config.js" -Raw -ErrorAction SilentlyContinue)
``````

### railway.toml

``````toml
$(Get-Content "$LHCRoot\railway.toml" -Raw -ErrorAction SilentlyContinue)
``````

### nixpacks.toml

``````toml
$(Get-Content "$LHCRoot\nixpacks.toml" -Raw -ErrorAction SilentlyContinue)
``````

---

## Library Files

### lib/api.js

``````javascript
$(Get-Content "$LHCRoot\lib\api.js" -Raw -ErrorAction SilentlyContinue)
``````

### lib/auth.js

``````javascript
$(Get-Content "$LHCRoot\lib\auth.js" -Raw -ErrorAction SilentlyContinue)
``````

---

## Core App Files

### app/layout.js

``````javascript
$(Get-Content "$LHCRoot\app\layout.js" -Raw -ErrorAction SilentlyContinue)
``````

### app/providers.js

``````javascript
$(Get-Content "$LHCRoot\app\providers.js" -Raw -ErrorAction SilentlyContinue)
``````

### app/page.js (Homepage)

``````javascript
$(Get-Content "$LHCRoot\app\page.js" -Raw -ErrorAction SilentlyContinue)
``````

---

## Recovery Instructions

1. **Clone/Create Project:**
   - Create new Railway project
   - Set all environment variables from above

2. **Deploy:**
   ``````bash
   npm install
   railway up
   ``````

3. **Configure Domain:**
   - Add custom domain: aileadstrategies.com
   - Update DNS records

4. **Verify:**
   - Check https://aileadstrategies.com loads
   - Test signup/login functionality

---

## Backup Metadata

- **Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **Source:** $LHCRoot
- **Git Branch:** $(git -C $LHCRoot branch --show-current 2>$null)
- **Git Commit:** $(git -C $LHCRoot log -1 --format="%H" 2>$null)
- **Files Count:** $(Get-ChildItem -Path $LHCRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.git|\.next|package-lock|AppData|OneDrive|Downloads" } | Measure-Object | Select-Object -ExpandProperty Count)

---

*Auto-generated by AI Lead Strategies Backup System*
*DO NOT USE VERCEL - Railway Only*
"@

    return $backupContent
}

function Sync-Backup {
    Write-Log "Starting Auto-Backup Sync..." "INFO"
    Write-Log "==========================================" "INFO"
    
    # Generate new backup content
    $backupContent = Generate-BackupContent
    
    # Create temp file to check for changes
    $tempFile = [System.IO.Path]::GetTempFileName()
    $backupContent | Out-File -FilePath $tempFile -Encoding UTF8
    
    # Check if backup has changed (compare with existing)
    $existingBackup = $Destinations[0]
    $hasChanges = $true
    
    if ((Test-Path $existingBackup) -and -not $Force) {
        $existingHash = Get-FileHash256 -Path $existingBackup
        $newHash = Get-FileHash256 -Path $tempFile
        
        if ($existingHash -eq $newHash) {
            Write-Log "No changes detected. Skipping backup." "INFO"
            Remove-Item $tempFile -Force
            return
        }
    }
    
    Write-Log "Changes detected. Creating backups..." "SUCCESS"
    
    # Create archive directories if they don't exist
    foreach ($archiveDir in $ArchiveDestinations) {
        if (-not (Test-Path $archiveDir)) {
            New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
            Write-Log "Created archive directory: $archiveDir" "INFO"
        }
    }
    
    # Copy to all destinations
    foreach ($dest in $Destinations) {
        try {
            $destDir = Split-Path $dest -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            
            Copy-Item -Path $tempFile -Destination $dest -Force
            Write-Log "Synced to: $dest" "SUCCESS"
        }
        catch {
            Write-Log "Failed to sync to: $dest - $_" "ERROR"
        }
    }
    
    # Create timestamped archive copies
    foreach ($archiveDir in $ArchiveDestinations) {
        try {
            $archivePath = Join-Path $archiveDir $TimestampedBackupName
            Copy-Item -Path $tempFile -Destination $archivePath -Force
            Write-Log "Archived to: $archivePath" "SUCCESS"
            
            # Keep only last 10 backups in archive
            $oldBackups = Get-ChildItem -Path $archiveDir -Filter "COMPLETE-PLATFORM-BACKUP-*.md" | 
                Sort-Object LastWriteTime -Descending | 
                Select-Object -Skip 10
            
            foreach ($old in $oldBackups) {
                Remove-Item $old.FullName -Force
                Write-Log "Removed old backup: $($old.Name)" "INFO"
            }
        }
        catch {
            Write-Log "Failed to archive to: $archiveDir - $_" "WARNING"
        }
    }
    
    # Cleanup temp file
    Remove-Item $tempFile -Force
    
    Write-Log "==========================================" "INFO"
    Write-Log "Backup sync completed successfully!" "SUCCESS"
    Write-Log "Latest backup available at:" "INFO"
    foreach ($dest in $Destinations) {
        if (Test-Path $dest) {
            $size = [math]::Round((Get-Item $dest).Length / 1KB, 2)
            Write-Log "  - $dest ($size KB)" "INFO"
        }
    }
}

# Run the sync
Sync-Backup
