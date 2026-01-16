/**
 * Database Reset Script
 * Clears all user data and mock data from the database
 * 
 * Usage:
 *   node scripts/reset-database.js
 * 
 * WARNING: This will delete ALL data from the database!
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🔄 Starting database reset...')
  
  try {
    // Disable foreign key checks temporarily (if using PostgreSQL, use transactions)
    console.log('📋 Deleting data in order (respecting foreign keys)...')
    
    // Delete in reverse order of dependencies
    // 1. Delete call recordings and call-related data
    console.log('   Deleting call recordings...')
    await prisma.callRecording.deleteMany({})
    
    console.log('   Deleting calls...')
    await prisma.call.deleteMany({})
    
    // 2. Delete conversation messages and conversations
    console.log('   Deleting conversation messages...')
    await prisma.conversationMessage.deleteMany({})
    
    console.log('   Deleting conversations...')
    await prisma.conversation.deleteMany({})
    
    // 3. Delete campaign analytics and campaign leads
    console.log('   Deleting campaign leads...')
    await prisma.campaignLead.deleteMany({})
    
    console.log('   Deleting campaign analytics...')
    await prisma.campaignAnalytics.deleteMany({})
    
    console.log('   Deleting campaigns...')
    await prisma.campaign.deleteMany({})
    
    // 4. Delete deal activities, notes, and deals
    console.log('   Deleting deal activities...')
    await prisma.dealActivity.deleteMany({})
    
    console.log('   Deleting deal notes...')
    await prisma.dealNote.deleteMany({})
    
    console.log('   Deleting deal contacts...')
    await prisma.dealContact.deleteMany({})
    
    console.log('   Deleting deals...')
    await prisma.deal.deleteMany({})
    
    // 5. Delete lead/prospect related data
    console.log('   Deleting lead emails...')
    await prisma.leadEmail.deleteMany({})
    
    console.log('   Deleting lead notes...')
    await prisma.leadNote.deleteMany({})
    
    console.log('   Deleting leads/prospects...')
    await prisma.lead.deleteMany({})
    
    // 6. Delete website prospects and websites
    console.log('   Deleting website prospects...')
    await prisma.websiteProspect.deleteMany({})
    
    console.log('   Deleting websites...')
    await prisma.website.deleteMany({})
    
    // 7. Delete integrations
    console.log('   Deleting integrations...')
    await prisma.integration.deleteMany({})
    
    // 8. Delete daily campaign status
    console.log('   Deleting daily campaign status...')
    await prisma.dailyCampaignStatus.deleteMany({})
    
    // 9. Delete scheduled emails
    console.log('   Deleting scheduled emails...')
    await prisma.scheduledEmail.deleteMany({})
    
    // 10. Delete users (last, as everything depends on users)
    console.log('   Deleting users...')
    await prisma.user.deleteMany({})
    
    console.log('✅ Database reset complete!')
    console.log('📊 All user data and mock data has been cleared.')
    
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
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
