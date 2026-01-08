# Complete GitHub Setup and Push Script
# This script will guide you through creating the repo and pushing

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername = "LeadGenius1",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "ai-lead-strategies-website"
)

Write-Host "🚀 GitHub Setup and Push Script" -ForegroundColor Cyan
Write-Host ""

# Check current remote
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote) {
    Write-Host "Current remote: $currentRemote" -ForegroundColor Yellow
} else {
    Write-Host "No remote configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. Open your browser and go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: $RepoName" -ForegroundColor White
Write-Host "3. Description: AI Lead Strategies Platform" -ForegroundColor White
Write-Host "4. Choose Public or Private" -ForegroundColor White
Write-Host "5. DO NOT check 'Initialize with README'" -ForegroundColor Yellow
Write-Host "6. Click 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter after you've created the repository..." -ForegroundColor Cyan
Read-Host

# Update remote
Write-Host ""
Write-Host "Configuring git remote..." -ForegroundColor Cyan
if ($currentRemote) {
    git remote remove origin
}
git remote add origin "https://github.com/$GitHubUsername/$RepoName.git"
git remote -v

# Push
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "You may be prompted for GitHub credentials." -ForegroundColor Yellow
Write-Host "Use a Personal Access Token (not password): https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Visit your repository on GitHub" -ForegroundColor White
    Write-Host "2. (Optional) Connect Railway to GitHub for auto-deploy" -ForegroundColor White
    Write-Host "3. Configure domain DNS (see DOMAIN_SETUP_AILEADSTRATEGIES.md)" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Common issues:" -ForegroundColor Red
    Write-Host "1. Repository doesn't exist - make sure you created it on GitHub" -ForegroundColor Yellow
    Write-Host "2. Authentication failed - use Personal Access Token" -ForegroundColor Yellow
    Write-Host "3. Wrong username - update GitHubUsername parameter" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To retry with different username:" -ForegroundColor Cyan
    Write-Host ".\setup-github-and-push.ps1 -GitHubUsername YOUR_USERNAME" -ForegroundColor White
}
