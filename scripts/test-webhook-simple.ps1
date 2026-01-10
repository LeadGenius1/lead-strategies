# Simple Webhook Test
$backendUrl = "http://localhost:3001"
$testBody = @{
    from = "test@example.com"
    to = "support@leadsite.ai"
    subject = "Test Email"
    text = "This is a test message"
    messageId = "test-12345"
    timestamp = [Math]::Floor((Get-Date).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalSeconds)
}

$jsonBody = $testBody | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/webhooks/email/sendgrid" -Method Post -Body $jsonBody -ContentType "application/json" -TimeoutSec 5
    Write-Host "Success: Webhook responded with OK" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}
