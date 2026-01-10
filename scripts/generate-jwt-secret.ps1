# Generate Secure JWT Secret
# Creates a cryptographically secure random string for JWT_SECRET

Write-Host "Generating secure JWT secret..." -ForegroundColor Cyan

# Generate 64-character random string
$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
$secret = ""
for ($i = 0; $i -lt 64; $i++) {
    $secret += $chars[(Get-Random -Maximum $chars.Length)]
}

Write-Host ""
Write-Host "JWT_SECRET=" -NoNewline -ForegroundColor Yellow
Write-Host $secret -ForegroundColor Green
Write-Host ""
Write-Host "Copy this value and set it in Railway backend environment variables" -ForegroundColor Cyan
Write-Host "Railway -> ai-lead-strategies -> backend -> Variables -> JWT_SECRET" -ForegroundColor Gray
Write-Host ""

# Also save to file (optional, for reference)
$secret | Out-File -FilePath "jwt-secret.txt" -NoNewline
Write-Host "Secret also saved to jwt-secret.txt (delete after use for security)" -ForegroundColor Yellow
