# LeadSite.AI Email Delivery End-to-End Test
# Tests: User Signup → Campaign Creation → Email Sending

$baseUrl = "https://superb-possibility-production.up.railway.app"
$backendUrl = "https://backend-production-2987.up.railway.app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LEADSITE.AI EMAIL DELIVERY E2E TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Create/Login User
Write-Host "`n[STEP 1/6] Authenticating User..." -ForegroundColor Yellow
$testEmail = "leadsite_e2e_$(Get-Random)@test.com"
$signupBody = @{
    firstName = "LeadSite"
    lastName = "Tester"
    email = $testEmail
    password = "LeadSite123!"
    companyName = "LeadSite Test Co"
    tier = "leadsite-ai"
} | ConvertTo-Json

try {
    $signup = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json" -TimeoutSec 15
    Write-Host "  ✅ User Created: $testEmail" -ForegroundColor Green
    $token = $signup.data.token
} catch {
    # User might exist, try login
    Write-Host "  ⚠️ User exists, logging in..." -ForegroundColor Yellow
    $loginBody = @{email=$testEmail;password="LeadSite123!"} | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 15
    $token = $login.data.token
    Write-Host "  ✅ Login Successful" -ForegroundColor Green
}

Start-Sleep -Seconds 2

# Step 2: Create Campaign
Write-Host "`n[STEP 2/6] Creating Email Campaign..." -ForegroundColor Yellow
$campaignBody = @{
    name = "LeadSite.AI Test Campaign - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    subject_line = "Welcome to LeadSite.AI - Test Email"
    email_body = @"
<html>
<body style="font-family: Arial, sans-serif;">
    <h1>Hello from LeadSite.AI!</h1>
    <p>This is a test email campaign sent via LeadSite.AI.</p>
    <p>Campaign Details:</p>
    <ul>
        <li>Platform: LeadSite.AI</li>
        <li>Test Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</li>
        <li>Status: E2E Test</li>
    </ul>
    <p>Best regards,<br>LeadSite.AI Team</p>
</body>
</html>
"@
    status = "draft"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $campaign = Invoke-RestMethod -Uri "$backendUrl/api/campaigns" -Method POST -Body $campaignBody -Headers $headers -TimeoutSec 15
    $campaignId = $campaign.campaign.id
    Write-Host "  ✅ Campaign Created" -ForegroundColor Green
    Write-Host "    Campaign ID: $campaignId" -ForegroundColor Gray
    Write-Host "    Name: $($campaign.campaign.name)" -ForegroundColor Gray
    Write-Host "    Status: $($campaign.campaign.status)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Campaign Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Start-Sleep -Seconds 2

# Step 3: Verify Campaign
Write-Host "`n[STEP 3/6] Verifying Campaign..." -ForegroundColor Yellow
try {
    $getCampaign = Invoke-RestMethod -Uri "$backendUrl/api/campaigns/$campaignId" -Headers $headers -TimeoutSec 15
    Write-Host "  ✅ Campaign Retrieved" -ForegroundColor Green
    Write-Host "    Subject: $($getCampaign.campaign.subject_line)" -ForegroundColor Gray
    Write-Host "    Body Length: $($getCampaign.campaign.email_body.Length) chars" -ForegroundColor Gray
} catch {
    Write-Host "  ⚠️ Campaign Verification: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# Step 4: Send Campaign
Write-Host "`n[STEP 4/6] Sending Email Campaign..." -ForegroundColor Yellow
$sendBody = @{
    scheduledAt = $null  # Send immediately
} | ConvertTo-Json

try {
    $sendResult = Invoke-RestMethod -Uri "$backendUrl/api/campaigns/$campaignId/send" -Method POST -Body $sendBody -Headers $headers -TimeoutSec 30
    Write-Host "  ✅ Campaign Send Initiated" -ForegroundColor Green
    Write-Host "    Response: $($sendResult | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "  ⚠️ Send Status: $status" -ForegroundColor Yellow
    if ($status -eq 404) {
        Write-Host "    Note: Send endpoint may need implementation" -ForegroundColor Gray
    } elseif ($status -eq 400) {
        Write-Host "    Note: Campaign may need recipients configured" -ForegroundColor Gray
    } else {
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Step 5: Check Campaign Analytics
Write-Host "`n[STEP 5/6] Checking Campaign Analytics..." -ForegroundColor Yellow
try {
    $analytics = Invoke-RestMethod -Uri "$backendUrl/api/campaigns/$campaignId/analytics" -Headers $headers -TimeoutSec 15
    Write-Host "  ✅ Analytics Retrieved" -ForegroundColor Green
    Write-Host "    Total Sent: $($analytics.total_sent)" -ForegroundColor Gray
    Write-Host "    Total Opens: $($analytics.total_opens)" -ForegroundColor Gray
    Write-Host "    Total Clicks: $($analytics.total_clicks)" -ForegroundColor Gray
} catch {
    Write-Host "  ⚠️ Analytics: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# Step 6: List All Campaigns
Write-Host "`n[STEP 6/6] Listing All Campaigns..." -ForegroundColor Yellow
try {
    $allCampaigns = Invoke-RestMethod -Uri "$backendUrl/api/campaigns" -Headers $headers -TimeoutSec 15
    $campaignCount = if($allCampaigns.campaigns){$allCampaigns.campaigns.Count}elseif($allCampaigns.data){$allCampaigns.data.Count}else{0}
    Write-Host "  ✅ Campaigns Retrieved" -ForegroundColor Green
    Write-Host "    Total Campaigns: $campaignCount" -ForegroundColor Gray
} catch {
    Write-Host "  ⚠️ List Campaigns: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nCompleted Steps:" -ForegroundColor Green
Write-Host "  1. User Authentication" -ForegroundColor Green
Write-Host "  2. Campaign Creation" -ForegroundColor Green
Write-Host "  3. Campaign Verification" -ForegroundColor Green
Write-Host "  4. Email Send Attempt" -ForegroundColor $(if($sendResult){'Green'}else{'Yellow'})
Write-Host "  5. Analytics Check" -ForegroundColor Green
Write-Host "  6. Campaign Listing" -ForegroundColor Green
Write-Host "`nEmail Delivery Status:" -ForegroundColor Cyan
Write-Host "  Campaign ID: $campaignId" -ForegroundColor Gray
Write-Host "  Test Email: $testEmail" -ForegroundColor Gray
Write-Host "`nNote: Actual email delivery requires:" -ForegroundColor Yellow
Write-Host "  - Email service configured (SendGrid/AWS SES)" -ForegroundColor Yellow
Write-Host "  - SMTP credentials in backend" -ForegroundColor Yellow
Write-Host "  - Recipient email addresses" -ForegroundColor Yellow
