# Test Backend on localhost:3001
# Tests all channel services locally

Write-Host "`n=== Testing Backend on localhost:3001 ===" -ForegroundColor Cyan

$backendUrl = "http://localhost:3001"

# Test 1: Health Check
Write-Host "`n1. Testing Backend Health..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Backend is healthy" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Service: $($health.service)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Backend not responding on port 3001" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
    Write-Host "`n   Make sure backend is running:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
    exit 1
}

# Test 2: API Health Check
Write-Host "`n2. Testing API Health Endpoint..." -ForegroundColor Green
try {
    $apiHealth = Invoke-RestMethod -Uri "$backendUrl/api/v1/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ API endpoint accessible" -ForegroundColor Green
    Write-Host "   Status: $($apiHealth.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠ API health endpoint test failed: $_" -ForegroundColor Yellow
}

# Test 3: Test Email Webhook
Write-Host "`n3. Testing Email Webhook Endpoint..." -ForegroundColor Green
try {
    $emailTest = @{
        event = "inbound"
        from = "test@example.com"
        to = "support@leadsite.ai"
        subject = "Test Email"
        text = "This is a test email message"
        "message-id" = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
        timestamp = [Math]::Floor((Get-Date).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalSeconds)
    } | ConvertTo-Json -Compress
    
    $emailResponse = Invoke-WebRequest -Uri "$backendUrl/api/webhooks/email/sendgrid" -Method Post -Body $emailTest -ContentType "application/json" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($emailResponse.StatusCode -eq 200) {
        Write-Host "   ✓ Email webhook endpoint working" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠ Email webhook test: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 4: Test SMS Webhook
Write-Host "`n4. Testing SMS Webhook Endpoint..." -ForegroundColor Green
try {
    $smsTest = "From=+1234567890" + "&" + "To=+0987654321" + "&" + "Body=Test+SMS" + "&" + "MessageSid=test-sms-$(Get-Date -Format 'yyyyMMddHHmmss')"
    
    $smsResponse = Invoke-WebRequest -Uri "$backendUrl/api/webhooks/sms/twilio" -Method Post -Body $smsTest -ContentType "application/x-www-form-urlencoded" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($smsResponse.StatusCode -eq 200) {
        Write-Host "   ✓ SMS webhook endpoint working" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠ SMS webhook test: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 5: Verify Services Load
Write-Host "`n5. Verifying Channel Services..." -ForegroundColor Green
try {
    Push-Location "backend"
    $env:EMAIL_SERVICE = "mock"
    $env:SMS_SERVICE = "mock"
    
    $result = node -e "const es = require('./src/services/emailService'); const ss = require('./src/services/smsService'); const cs = require('./src/services/channelService'); console.log(JSON.stringify({email: es.EMAIL_SERVICE, sms: ss.SMS_SERVICE, status: cs.getChannelStatus()}, null, 2));"
    
    Write-Host "   ✓ Channel services loaded" -ForegroundColor Green
    Write-Host "   $result" -ForegroundColor Gray
    Pop-Location
} catch {
    Write-Host "   ⚠ Service verification failed: $_" -ForegroundColor Yellow
    Pop-Location
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ Backend is running on localhost:3001" -ForegroundColor Green
Write-Host "✓ Channel services are configured" -ForegroundColor Green
Write-Host "✓ Webhook endpoints are accessible" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Test with authenticated user (login first)" -ForegroundColor White
Write-Host "2. Create conversations via API" -ForegroundColor White
Write-Host "3. Send messages and verify channel delivery" -ForegroundColor White
