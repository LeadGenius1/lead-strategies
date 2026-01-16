/**
 * Health Check Script
 * Continuous health monitoring for the platform
 * Can be run as a cron job or scheduled task
 * 
 * Usage:
 *   node scripts/health-check.js
 * 
 * For cron (every 5 minutes):
 *   */5 * * * * cd /path/to/project && node scripts/health-check.js
 */

const https = require('https')
const http = require('http')

const ENDPOINTS = [
  { name: 'Frontend', url: process.env.FRONTEND_URL || 'https://leadsite.ai' },
  { name: 'Backend API', url: process.env.BACKEND_URL || 'https://api.leadsite.ai' },
  { name: 'Health Endpoint', url: process.env.HEALTH_CHECK_URL || 'https://api.leadsite.ai/api/v1/health' }
]

async function checkHealth(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    const startTime = Date.now()
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      const duration = Date.now() - startTime
      resolve({
        healthy: res.statusCode >= 200 && res.statusCode < 400,
        status: res.statusCode,
        duration,
        timestamp: new Date().toISOString()
      })
    })
    
    req.on('error', (error) => {
      resolve({
        healthy: false,
        status: 0,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      })
    })
    
    req.on('timeout', () => {
      req.destroy()
      resolve({
        healthy: false,
        status: 0,
        error: 'Timeout',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      })
    })
  })
}

async function runHealthCheck() {
  console.log(`🔍 Health Check - ${new Date().toISOString()}`)
  console.log('')
  
  const results = []
  let allHealthy = true
  
  for (const endpoint of ENDPOINTS) {
    const result = await checkHealth(endpoint.url)
    result.name = endpoint.name
    result.url = endpoint.url
    results.push(result)
    
    if (!result.healthy) {
      allHealthy = false
    }
  }
  
  // Display results
  results.forEach(result => {
    const status = result.healthy ? '✅' : '❌'
    const statusText = result.healthy ? 'HEALTHY' : 'UNHEALTHY'
    console.log(`${status} ${result.name}: ${statusText}`)
    console.log(`   URL: ${result.url}`)
    console.log(`   Status: ${result.status || 'N/A'}`)
    console.log(`   Response Time: ${result.duration}ms`)
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
    console.log('')
  })
  
  // Summary
  if (allHealthy) {
    console.log('✅ All systems operational')
  } else {
    console.log('⚠️  Some systems are unhealthy - action required')
  }
  
  return { allHealthy, results }
}

// Run health check
if (require.main === module) {
  runHealthCheck()
    .then(({ allHealthy }) => {
      process.exit(allHealthy ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Health check failed:', error)
      process.exit(1)
    })
}

module.exports = { runHealthCheck, checkHealth }
