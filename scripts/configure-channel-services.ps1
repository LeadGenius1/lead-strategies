# Configure Channel Services Environment Variables
# Sets up EMAIL_SERVICE and SMS_SERVICE for Railway backend

Write-Host "`n=== Configuring Channel Services ===" -ForegroundColor Cyan

# Set email service to mock mode (default - safe for testing)
Write-Host "`n1. Setting EMAIL_SERVICE..." -ForegroundColor Green
railway variables set EMAIL_SERVICE=mock --service backend
if ($?) {
    Write-Host "   ✓ EMAIL_SERVICE set to 'mock'" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to set EMAIL_SERVICE" -ForegroundColor Red
}

# Set SMS service to mock mode (default - safe for testing)
Write-Host "`n2. Setting SMS_SERVICE..." -ForegroundColor Green
railway variables set SMS_SERVICE=mock --service backend
if ($?) {
    Write-Host "   ✓ SMS_SERVICE set to 'mock'" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to set SMS_SERVICE" -ForegroundColor Red
}

# Set default email configuration
Write-Host "`n3. Setting Email Configuration..." -ForegroundColor Green
railway variables set FROM_EMAIL=noreply@leadsite.ai --service backend
railway variables set FROM_NAME="LeadSite.AI" --service backend
railway variables set EMAIL_DOMAIN=leadsite.ai --service backend
Write-Host "   ✓ Email configuration set" -ForegroundColor Green

Write-Host "`n=== Configuration Complete ===" -ForegroundColor Cyan
Write-Host "`nCurrent Configuration:" -ForegroundColor Yellow
Write-Host "  EMAIL_SERVICE: mock (safe for testing)" -ForegroundColor White
Write-Host "  SMS_SERVICE: mock (safe for testing)" -ForegroundColor White
Write-Host "  FROM_EMAIL: noreply@leadsite.ai" -ForegroundColor White
Write-Host "  FROM_NAME: LeadSite.AI" -ForegroundColor White
Write-Host "`nTo enable production services:" -ForegroundColor Yellow
Write-Host "  1. Set EMAIL_SERVICE=sendgrid or EMAIL_SERVICE=ses" -ForegroundColor White
Write-Host "  2. Add SENDGRID_API_KEY or AWS_SES credentials" -ForegroundColor White
Write-Host "  3. Set SMS_SERVICE=twilio" -ForegroundColor White
Write-Host "  4. Add TWILIO credentials" -ForegroundColor White
Write-Host "`nNext: Run test script to verify configuration" -ForegroundColor Cyan
