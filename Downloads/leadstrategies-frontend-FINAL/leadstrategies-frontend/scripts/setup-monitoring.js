/**
 * Platform Monitoring Setup Script
 * Sets up and verifies monitoring system is active
 * 
 * Usage:
 *   node scripts/setup-monitoring.js
 */

const https = require('https')
const http = require('http')

const MONITORING_ENDPOINTS = {
  frontend: process.env.FRONTEND_URL || 'https://leadsite.ai',
  backend: process.env.BACKEND_URL || 'https://api.leadsite.ai',
  health: process.env.HEALTH_CHECK_URL || 'https://api.leadsite.ai/api/v1/health'
}

async function checkEndpoint(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, { timeout: 5000 }, (res) => {
      resolve({
        status: res.statusCode,
        healthy: res.statusCode >= 200 && res.statusCode < 400
      })
    })
    
    req.on('error', () => {
      resolve({ status: 0, healthy: false })
    })
    
    req.on('timeout', () => {
      req.destroy()
      resolve({ status: 0, healthy: false, timeout: true })
    })
  })
}

async function setupMonitoring() {
  console.log('🔍 Setting up platform monitoring...')
  console.log('')
  
  const results = {
    frontend: await checkEndpoint(MONITORING_ENDPOINTS.frontend),
    backend: await checkEndpoint(MONITORING_ENDPOINTS.backend),
    health: await checkEndpoint(MONITORING_ENDPOINTS.health)
  }
  
  console.log('📊 Monitoring Check Results:')
  console.log('')
  
  // Frontend Check
  console.log(`🌐 Frontend (${MONITORING_ENDPOINTS.frontend}):`)
  if (results.frontend.healthy) {
    console.log(`   ✅ Status: ${results.frontend.status} - HEALTHY`)
  } else {
    console.log(`   ❌ Status: ${results.frontend.status || 'UNREACHABLE'} - UNHEALTHY`)
  }
  console.log('')
  
  // Backend Check
  console.log(`🔧 Backend (${MONITORING_ENDPOINTS.backend}):`)
  if (results.backend.healthy) {
    console.log(`   ✅ Status: ${results.backend.status} - HEALTHY`)
  } else {
    console.log(`   ❌ Status: ${results.backend.status || 'UNREACHABLE'} - UNHEALTHY`)
  }
  console.log('')
  
  // Health Check
  console.log(`💚 Health Endpoint (${MONITORING_ENDPOINTS.health}):`)
  if (results.health.healthy) {
    console.log(`   ✅ Status: ${results.health.status} - HEALTHY`)
  } else {
    console.log(`   ❌ Status: ${results.health.status || 'UNREACHABLE'} - UNHEALTHY`)
  }
  console.log('')
  
  // Overall Status
  const allHealthy = results.frontend.healthy && results.backend.healthy && results.health.healthy
  
  if (allHealthy) {
    console.log('✅ Platform monitoring: ALL SYSTEMS OPERATIONAL')
    console.log('')
    console.log('📋 Monitoring Recommendations:')
    console.log('   1. Set up Railway monitoring alerts')
    console.log('   2. Configure uptime monitoring (e.g., UptimeRobot, Pingdom)')
    console.log('   3. Set up error tracking (e.g., Sentry)')
    console.log('   4. Configure log aggregation (e.g., Logtail, Datadog)')
    console.log('   5. Set up performance monitoring (e.g., New Relic)')
  } else {
    console.log('⚠️  Platform monitoring: SOME SYSTEMS UNHEALTHY')
    console.log('')
    console.log('🔧 Action Required:')
    if (!results.frontend.healthy) {
      console.log('   - Check frontend deployment on Railway')
    }
    if (!results.backend.healthy) {
      console.log('   - Check backend deployment on Railway')
    }
    if (!results.health.healthy) {
      console.log('   - Verify health endpoint is implemented')
    }
  }
  
  return allHealthy
}

// Run monitoring setup
if (require.main === module) {
  setupMonitoring()
    .then((healthy) => {
      process.exit(healthy ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Monitoring setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupMonitoring, checkEndpoint }
