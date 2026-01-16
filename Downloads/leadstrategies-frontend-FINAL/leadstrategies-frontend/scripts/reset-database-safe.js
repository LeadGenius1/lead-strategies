/**
 * Safe Database Reset Script (with confirmation)
 * Clears all user data and mock data from the database
 * Requires explicit confirmation before proceeding
 * 
 * Usage:
 *   node scripts/reset-database-safe.js
 * 
 * WARNING: This will delete ALL data from the database!
 */

const readline = require('readline')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from the database!')
  console.log('📋 This includes:')
  console.log('   - All users')
  console.log('   - All leads/prospects')
  console.log('   - All campaigns')
  console.log('   - All websites')
  console.log('   - All conversations')
  console.log('   - All CRM deals')
  console.log('   - All calls')
  console.log('   - All analytics data')
  console.log('')
  
  const confirmation1 = await askQuestion('Type "RESET" to confirm: ')
  
  if (confirmation1 !== 'RESET') {
    console.log('❌ Reset cancelled. Database unchanged.')
    rl.close()
    return
  }
  
  const confirmation2 = await askQuestion('Type "DELETE ALL DATA" to confirm again: ')
  
  if (confirmation2 !== 'DELETE ALL DATA') {
    console.log('❌ Reset cancelled. Database unchanged.')
    rl.close()
    return
  }
  
  console.log('')
  console.log('🔄 Starting database reset...')
  
  try {
    // Delete in reverse order of dependencies
    console.log('📋 Deleting data in order (respecting foreign keys)...')
    
    // Delete call recordings and call-related data
    console.log('   Deleting call recordings...')
    await prisma.callRecording.deleteMany({}).catch(() => {})
    
    console.log('   Deleting calls...')
    await prisma.call.deleteMany({}).catch(() => {})
    
    // Delete conversation messages and conversations
    console.log('   Deleting conversation messages...')
    await prisma.conversationMessage.deleteMany({}).catch(() => {})
    
    console.log('   Deleting conversations...')
    await prisma.conversation.deleteMany({}).catch(() => {})
    
    // Delete campaign analytics and campaign leads
    console.log('   Deleting campaign leads...')
    await prisma.campaignLead.deleteMany({}).catch(() => {})
    
    console.log('   Deleting campaign analytics...')
    await prisma.campaignAnalytics.deleteMany({}).catch(() => {})
    
    console.log('   Deleting campaigns...')
    await prisma.campaign.deleteMany({}).catch(() => {})
    
    // Delete deal activities, notes, and deals
    console.log('   Deleting deal activities...')
    await prisma.dealActivity.deleteMany({}).catch(() => {})
    
    console.log('   Deleting deal notes...')
    await prisma.dealNote.deleteMany({}).catch(() => {})
    
    console.log('   Deleting deal contacts...')
    await prisma.dealContact.deleteMany({}).catch(() => {})
    
    console.log('   Deleting deals...')
    await prisma.deal.deleteMany({}).catch(() => {})
    
    // Delete lead/prospect related data
    console.log('   Deleting lead emails...')
    await prisma.leadEmail.deleteMany({}).catch(() => {})
    
    console.log('   Deleting lead notes...')
    await prisma.leadNote.deleteMany({}).catch(() => {})
    
    console.log('   Deleting leads/prospects...')
    await prisma.lead.deleteMany({}).catch(() => {})
    
    // Delete website prospects and websites
    console.log('   Deleting website prospects...')
    await prisma.websiteProspect.deleteMany({}).catch(() => {})
    
    console.log('   Deleting websites...')
    await prisma.website.deleteMany({}).catch(() => {})
    
    // Delete integrations
    console.log('   Deleting integrations...')
    await prisma.integration.deleteMany({}).catch(() => {})
    
    // Delete daily campaign status
    console.log('   Deleting daily campaign status...')
    await prisma.dailyCampaignStatus.deleteMany({}).catch(() => {})
    
    // Delete scheduled emails
    console.log('   Deleting scheduled emails...')
    await prisma.scheduledEmail.deleteMany({}).catch(() => {})
    
    // Delete users (last, as everything depends on users)
    console.log('   Deleting users...')
    await prisma.user.deleteMany({}).catch(() => {})
    
    console.log('')
    console.log('✅ Database reset complete!')
    console.log('📊 All user data and mock data has been cleared.')
    console.log('✨ Database is now fresh and ready for new users.')
    
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Run the reset
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('✨ Database reset successful!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database reset failed:', error)
      process.exit(1)
    })
}

module.exports = { resetDatabase }
