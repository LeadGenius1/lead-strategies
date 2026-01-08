# Push to GitHub Script
# Run this script after creating a GitHub repository

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "ai-lead-strategies-website"
)

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null

if ($remoteExists) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -eq 'y') {
        git remote remove origin
    } else {
        Write-Host "Using existing remote" -ForegroundColor Green
        git push -u origin main
        exit 0
    }
}

# Add GitHub remote
$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "Adding remote: $repoUrl" -ForegroundColor Cyan
git remote add origin $repoUrl

# Verify remote
Write-Host "Verifying remote..." -ForegroundColor Cyan
git remote -v

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. Repository exists at https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Yellow
    Write-Host "2. You have push access" -ForegroundColor Yellow
    Write-Host "3. You're authenticated (git config --global user.name/email)" -ForegroundColor Yellow
    exit 1
}
